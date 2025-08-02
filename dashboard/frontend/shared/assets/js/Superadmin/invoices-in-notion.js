// invoices-in-notion.js - Module de gestion des factures fournisseurs
// Workflow complet avec validation multi-niveaux et intégration OCR

window.InvoicesInNotion = (function() {
    'use strict';
    
    // Configuration
    const config = {
        // Seuils validation
        validationThresholds: {
            level1: 5000,  // CHF - Au-dessus nécessite 2 validations
            level2: 20000  // CHF - Au-dessus nécessite validation direction
        },
        
        // Statuts possibles
        statuses: {
            draft: 'Brouillon',
            pending_validation: 'À valider',
            validated: 'Validée',
            paid: 'Payée',
            dispute: 'Litige',
            overdue: 'En retard'
        },
        
        // Entités
        entities: {
            hypervisual: { name: 'Hypervisual', color: '#206bc4' },
            dainamics: { name: 'Dainamics', color: '#5eba00' },
            waveform: { name: 'Waveform', color: '#f76707' },
            particule: { name: 'Particule', color: '#ae3ec9' },
            holding: { name: 'Swiss Digital Holding', color: '#d63939' }
        },
        
        // Catégories
        categories: {
            services: 'Services',
            consulting: 'Consulting',
            material: 'Matériel',
            software: 'Logiciels',
            marketing: 'Marketing',
            travel: 'Déplacement',
            office: 'Bureau',
            other: 'Autre'
        },
        
        // Alertes échéances
        dueAlerts: {
            overdue: { days: -1, class: 'danger', icon: 'alert-triangle' },
            today: { days: 0, class: 'warning', icon: 'clock' },
            soon: { days: 3, class: 'info', icon: 'calendar' },
            week: { days: 7, class: 'secondary', icon: 'calendar-event' }
        }
    };
    
    // État du module
    let state = {
        invoices: [],
        suppliers: [],
        dataTable: null,
        filters: {
            status: '',
            entity: '',
            supplier: '',
            due: ''
        },
        totals: {
            pending: 0,
            validated: 0,
            paid: 0,
            overdue: 0
        },
        currentUser: null
    };
    
    // Initialisation
    async function init() {
        try {
            console.log('🧾 Initialisation module factures fournisseurs...');
            
            // Vérifier permissions
            if (!await window.PermissionsSuperadmin.hasPermission('superadmin.finance.view')) {
                throw new Error('Permissions insuffisantes');
            }
            
            // Récupérer utilisateur actuel
            state.currentUser = window.AuthSuperadmin.getCurrentUser();
            
            // Charger les données
            await loadInvoices();
            await loadSuppliers();
            
            // Initialiser l'interface
            initializeDataTable();
            attachEventListeners();
            setupFilters();
            updateTotals();
            checkDueAlerts();
            
            // Actualisation automatique
            setInterval(checkDueAlerts, 5 * 60 * 1000); // Toutes les 5 minutes
            
            console.log('✅ Module factures fournisseurs initialisé');
            
        } catch (error) {
            console.error('❌ Erreur initialisation factures:', error);
            showNotification('Erreur lors du chargement des factures', 'error');
        }
    }
    
    // Charger les factures depuis Notion via MCP
    async function loadInvoices() {
        try {
            // Vérifier la disponibilité de MCP Notion
            if (typeof mcp_notion === 'undefined') {
                console.warn('⚠️ MCP Notion non disponible, chargement des données de démonstration');
                return loadMockInvoices();
            }

            // Configuration de la base de données
            const DB_FACTURES_IN = window.SUPERADMIN_DB_IDS?.FACTURES_IN || "À_DEFINIR_APRES_CREATION";
            
            if (DB_FACTURES_IN === "À_DEFINIR_APRES_CREATION") {
                console.warn('⚠️ ID de la base DB-FACTURES-FOURNISSEURS non configuré, utilisation des données de démonstration');
                return loadMockInvoices();
            }

            console.log('📋 Chargement des factures depuis Notion DB-FACTURES-FOURNISSEURS...');

            // Requête Notion avec tri par date
            const response = await mcp_notion.query_database({
                database_id: DB_FACTURES_IN,
                sorts: [
                    {
                        property: "Date Facture",
                        direction: "descending"
                    }
                ]
            });

            // Transformer les données Notion vers le format attendu
            state.invoices = response.results.map(page => {
                const props = page.properties;
                
                // Extraire les données du fournisseur (relation)
                let supplier = {
                    name: "Fournisseur inconnu",
                    vat_number: "",
                    iban: "",
                    address: ""
                };

                // Si relation fournisseur disponible
                if (props["Fournisseur"]?.relation?.length > 0) {
                    // Dans un vrai système, on ferait une requête pour récupérer les détails
                    supplier.name = "Fournisseur à résoudre";
                }

                // Calculer le statut basé sur les propriétés Notion
                let status = "draft";
                if (props["Statut"]?.select?.name) {
                    const notionStatus = props["Statut"].select.name;
                    status = mapNotionStatusToLocal(notionStatus);
                }

                // Extraire les montants
                const subtotalHT = props["Montant HT"]?.number || 0;
                const vatAmount = props["TVA"]?.number || 0;
                const totalTTC = props["Montant TTC"]?.number || subtotalHT + vatAmount;
                
                // Extraire le taux de TVA
                const vatRate = extractVATRate(props["Taux TVA"]?.select?.name || "8.1%");

                // Générer un ID unique basé sur le numéro de facture
                const invoiceNumber = props["Numéro Facture"]?.title?.[0]?.plain_text || `INV-${page.id.substring(0, 8)}`;
                const invoiceId = `INV-IN-${invoiceNumber}`;

                return {
                    invoice_id: invoiceId,
                    status: status,
                    supplier: supplier,
                    invoice_number: invoiceNumber,
                    invoice_date: props["Date Facture"]?.date?.start || new Date().toISOString().split('T')[0],
                    due_date: props["Date Échéance"]?.date?.start || new Date().toISOString().split('T')[0],
                    subtotal_ht: subtotalHT,
                    vat_rate: vatRate,
                    vat_amount: vatAmount,
                    total_ttc: totalTTC,
                    currency: "CHF",
                    entity: extractEntity(props["Entité Groupe"]),
                    category: mapAccountingCategory(props["Catégorie Comptable"]?.select?.name),
                    validation_workflow: buildValidationWorkflow(props),
                    payment_status: mapPaymentStatus(status),
                    payment_date: extractPaymentDate(props, status),
                    payment_reference: props["Référence Interne"]?.rich_text?.[0]?.plain_text || null,
                    created_at: page.created_time,
                    created_by: extractCreatedBy(page.created_by),
                    notion_id: page.id
                };
            });

            console.log(`✅ ${state.invoices.length} factures chargées depuis Notion DB-FACTURES-FOURNISSEURS`);

        } catch (error) {
            console.error('❌ Erreur chargement factures depuis Notion:', error);
            console.log('🔄 Fallback vers les données de démonstration');
            return loadMockInvoices();
        }
    }

    // Fonctions helper pour la transformation des données
    function mapNotionStatusToLocal(notionStatus) {
        const statusMapping = {
            "Brouillon": "draft",
            "À valider": "pending_validation", 
            "Validée": "validated",
            "Payée": "paid",
            "En litige": "dispute",
            "Annulée": "cancelled"
        };
        return statusMapping[notionStatus] || "draft";
    }

    function extractVATRate(vatRateText) {
        if (!vatRateText) return 8.1;
        const match = vatRateText.match(/(\d+\.?\d*)%/);
        return match ? parseFloat(match[1]) : 8.1;
    }

    function extractEntity(entityProperty) {
        if (!entityProperty?.relation?.length) return "unknown";
        // Dans un vrai système, on résoudrait la relation
        return "hypervisual"; // Par défaut
    }

    function mapAccountingCategory(notionCategory) {
        const categoryMapping = {
            "Marchandises": "goods",
            "Services": "services", 
            "Investissements": "investments",
            "Charges": "expenses",
            "Frais généraux": "general"
        };
        return categoryMapping[notionCategory] || "services";
    }

    function buildValidationWorkflow(props) {
        const workflow = {};
        
        // Vérifier si la validation est requise basée sur le montant
        const totalTTC = props["Montant TTC"]?.number || 0;
        
        if (totalTTC > 5000) {
            workflow.level_1 = {
                required: true,
                validator: extractValidator(props["Validation Manager"]),
                status: props["Date Validation"]?.date?.start ? "approved" : "pending",
                date: props["Date Validation"]?.date?.start || null
            };
        }

        if (totalTTC > 20000) {
            workflow.level_2 = {
                required: true,
                validator: "Paul Martin",
                status: "pending",
                date: null
            };
        }

        return workflow;
    }

    function mapPaymentStatus(status) {
        if (status === "paid") return "paid";
        if (status === "validated") return "scheduled";
        if (status === "overdue") return "overdue";
        return "unpaid";
    }

    function extractPaymentDate(props, status) {
        if (status === "paid" && props["Date Validation"]?.date?.start) {
            // Simuler une date de paiement 5 jours après validation
            const validationDate = new Date(props["Date Validation"].date.start);
            validationDate.setDate(validationDate.getDate() + 5);
            return validationDate.toISOString().split('T')[0];
        }
        return null;
    }

    function extractValidator(validatorProperty) {
        if (validatorProperty?.people?.length > 0) {
            return validatorProperty.people[0].name || "Manager";
        }
        return "Marie Dubois"; // Par défaut
    }

    function extractCreatedBy(createdBy) {
        if (createdBy?.type === "user" && createdBy.user?.name) {
            return createdBy.user.name.toLowerCase().replace(' ', '.');
        }
        return "system_ocr";
    }

    // Données de démonstration en fallback
    function loadMockInvoices() {
        state.invoices = [
            {
                invoice_id: "INV-IN-2025-001",
                status: "paid",
                supplier: {
                    name: "Swisscom SA",
                    vat_number: "CHE-101.654.423 TVA",
                    iban: "CH93 0076 2011 6238 5295 7",
                    address: "Rue de l'Industrie 10, 3960 Sierre"
                },
                invoice_number: "SC-2025-1234",
                invoice_date: "2025-01-15",
                due_date: "2025-02-15",
                subtotal_ht: 1000.00,
                vat_rate: 7.7,
                vat_amount: 77.00,
                total_ttc: 1077.00,
                currency: "CHF",
                entity: "hypervisual",
                category: "services",
                validation_workflow: {
                    level_1: { required: true, validator: "Marie Dubois", status: "approved", date: "2025-01-16" }
                },
                payment_status: "paid",
                payment_date: "2025-01-20",
                payment_reference: "PAY-001",
                created_at: "2025-01-15T10:30:00Z",
                created_by: "system_ocr"
            },
            {
                invoice_id: "INV-IN-2025-002",
                status: "pending_validation",
                supplier: {
                    name: "Adobe Systems",
                    vat_number: "CHE-234.567.890 TVA",
                    iban: "CH12 0076 2011 6238 5295 8",
                    address: "Chemin du Closel 5, 1020 Renens"
                },
                invoice_number: "AD-2025-5678",
                invoice_date: "2025-01-18",
                due_date: "2025-02-18",
                subtotal_ht: 6500.00,
                vat_rate: 7.7,
                vat_amount: 500.50,
                total_ttc: 7000.50,
                currency: "CHF",
                entity: "dainamics",
                category: "software",
                validation_workflow: {
                    level_1: { required: true, validator: "Marie Dubois", status: "approved", date: "2025-01-19" },
                    level_2: { required: true, validator: "Paul Martin", status: "pending", date: null }
                },
                payment_status: "unpaid",
                created_at: "2025-01-18T14:20:00Z",
                created_by: "paul.martin"
            }
        ];
        console.log(`📋 ${state.invoices.length} factures de démonstration chargées`);
    }
    
    // Charger les fournisseurs
    async function loadSuppliers() {
        try {
            // Extraire les fournisseurs uniques des factures
            state.suppliers = [];
            const supplierMap = new Map();
            
            state.invoices.forEach(invoice => {
                const supplier = invoice.supplier;
                if (!supplierMap.has(supplier.name)) {
                    supplierMap.set(supplier.name, {
                        name: supplier.name,
                        vat_number: supplier.vat_number,
                        iban: supplier.iban,
                        address: supplier.address,
                        invoices_count: 1,
                        total_amount: invoice.total_ttc
                    });
                } else {
                    const existing = supplierMap.get(supplier.name);
                    existing.invoices_count++;
                    existing.total_amount += invoice.total_ttc;
                }
            });
            
            state.suppliers = Array.from(supplierMap.values());
            
            // Peupler le filtre fournisseurs
            const supplierSelect = document.getElementById('filter-supplier');
            if (supplierSelect) {
                supplierSelect.innerHTML = '<option value="">Tous les fournisseurs</option>';
                state.suppliers.forEach(supplier => {
                    const option = document.createElement('option');
                    option.value = supplier.name;
                    option.textContent = supplier.name;
                    supplierSelect.appendChild(option);
                });
            }
            
        } catch (error) {
            console.error('❌ Erreur chargement fournisseurs:', error);
        }
    }
    
    // Initialiser DataTable
    function initializeDataTable() {
        if (state.dataTable) {
            state.dataTable.destroy();
        }
        
        state.dataTable = $('#invoices-table').DataTable({
            data: state.invoices,
            columns: [
                {
                    data: null,
                    orderable: false,
                    render: function(data, type, row) {
                        return `<input class="form-check-input invoice-checkbox" type="checkbox" value="${row.invoice_id}">`;
                    }
                },
                {
                    data: 'invoice_number',
                    render: function(data, type, row) {
                        return `<a href="#" class="text-decoration-none view-invoice" data-id="${row.invoice_id}">${data}</a>`;
                    }
                },
                {
                    data: 'supplier.name',
                    render: function(data, type, row) {
                        const vatNumber = row.supplier.vat_number || '';
                        return `
                            <div>
                                <div class="fw-bold">${data}</div>
                                <div class="text-muted small">${vatNumber}</div>
                            </div>
                        `;
                    }
                },
                {
                    data: 'entity',
                    render: function(data, type, row) {
                        const entity = config.entities[data];
                        return `<span class="badge" style="background-color: ${entity.color}; color: white;">${entity.name}</span>`;
                    }
                },
                {
                    data: 'total_ttc',
                    className: 'text-end',
                    render: function(data, type, row) {
                        return `<span class="amount">${formatSwissAmount(data)} ${row.currency}</span>`;
                    }
                },
                {
                    data: 'invoice_date',
                    render: function(data, type, row) {
                        return formatDate(data);
                    }
                },
                {
                    data: 'due_date',
                    render: function(data, type, row) {
                        const dueIndicator = getDueIndicator(data, row.status);
                        return `
                            <div class="d-flex align-items-center">
                                <span class="due-indicator ${dueIndicator.class}"></span>
                                ${formatDate(data)}
                            </div>
                        `;
                    }
                },
                {
                    data: 'status',
                    render: function(data, type, row) {
                        return `<span class="invoice-status status-${data.replace('_', '-')}">${config.statuses[data]}</span>`;
                    }
                },
                {
                    data: 'validation_workflow',
                    render: function(data, type, row) {
                        return renderValidationWorkflow(data);
                    }
                },
                {
                    data: null,
                    orderable: false,
                    className: 'text-center',
                    render: function(data, type, row) {
                        return renderQuickActions(row);
                    }
                }
            ],
            order: [[5, 'desc']], // Trier par date de facture desc
            pageLength: 25,
            responsive: true,
            language: {
                url: 'https://cdn.datatables.net/plug-ins/1.13.7/i18n/fr-FR.json'
            },
            drawCallback: function() {
                // Réattacher les événements après redraw
                attachTableEventListeners();
            }
        });
    }
    
    // Attacher les événements
    function attachEventListeners() {
        // Boutons principaux
        document.getElementById('new-invoice')?.addEventListener('click', openNewInvoiceModal);
        document.getElementById('import-from-ocr')?.addEventListener('click', openOCRImportModal);
        document.getElementById('export-invoices')?.addEventListener('click', exportInvoices);
        document.getElementById('batch-payments')?.addEventListener('click', openBatchPayments);
        
        // Select all checkbox
        document.getElementById('select-all')?.addEventListener('change', function() {
            const checkboxes = document.querySelectorAll('.invoice-checkbox');
            checkboxes.forEach(cb => cb.checked = this.checked);
        });
        
        // Actions groupées
        document.getElementById('bulk-validate')?.addEventListener('click', bulkValidate);
        document.getElementById('bulk-pay')?.addEventListener('click', bulkPay);
        document.getElementById('bulk-export')?.addEventListener('click', bulkExport);
        
        // Clear filters
        document.getElementById('clear-filters')?.addEventListener('click', clearFilters);
        
        // Modal nouvelle facture
        document.getElementById('save-draft')?.addEventListener('click', () => saveInvoice(true));
        document.getElementById('save-invoice')?.addEventListener('click', () => saveInvoice(false));
        
        // Calcul automatique montants
        const amountHTInput = document.getElementById('amount-ht');
        const amountVATInput = document.getElementById('amount-vat');
        const amountTotalInput = document.getElementById('amount-total');
        
        if (amountHTInput && amountVATInput && amountTotalInput) {
            amountHTInput.addEventListener('input', calculateTotalAmount);
            amountVATInput.addEventListener('input', calculateTotalFromInputs);
        }
        
        // Search supplier
        document.getElementById('search-supplier')?.addEventListener('click', searchSupplier);
        
        attachTableEventListeners();
    }
    
    // Attacher événements table
    function attachTableEventListeners() {
        // Voir détails facture
        document.querySelectorAll('.view-invoice').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const invoiceId = this.dataset.id;
                viewInvoiceDetails(invoiceId);
            });
        });
        
        // Actions rapides
        document.querySelectorAll('.quick-action').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const action = this.dataset.action;
                const invoiceId = this.dataset.invoiceId;
                handleQuickAction(action, invoiceId);
            });
        });
    }
    
    // Configuration des filtres
    function setupFilters() {
        const filters = ['status', 'entity', 'supplier', 'due'];
        
        filters.forEach(filterName => {
            const element = document.getElementById(`filter-${filterName}`);
            if (element) {
                element.addEventListener('change', function() {
                    state.filters[filterName] = this.value;
                    applyFilters();
                });
            }
        });
    }
    
    // Appliquer filtres
    function applyFilters() {
        let filteredData = [...state.invoices];
        
        // Filtre par statut
        if (state.filters.status) {
            if (state.filters.status === 'overdue') {
                filteredData = filteredData.filter(invoice => {
                    const today = new Date();
                    const dueDate = new Date(invoice.due_date);
                    return dueDate < today && invoice.status !== 'paid';
                });
            } else {
                filteredData = filteredData.filter(invoice => invoice.status === state.filters.status);
            }
        }
        
        // Filtre par entité
        if (state.filters.entity) {
            filteredData = filteredData.filter(invoice => invoice.entity === state.filters.entity);
        }
        
        // Filtre par fournisseur
        if (state.filters.supplier) {
            filteredData = filteredData.filter(invoice => invoice.supplier.name === state.filters.supplier);
        }
        
        // Filtre par échéance
        if (state.filters.due) {
            const today = new Date();
            filteredData = filteredData.filter(invoice => {
                const dueDate = new Date(invoice.due_date);
                const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
                
                switch (state.filters.due) {
                    case 'overdue':
                        return diffDays < 0 && invoice.status !== 'paid';
                    case 'today':
                        return diffDays === 0;
                    case 'week':
                        return diffDays >= 0 && diffDays <= 7;
                    case 'month':
                        return diffDays >= 0 && diffDays <= 30;
                    default:
                        return true;
                }
            });
        }
        
        // Mettre à jour la table
        state.dataTable.clear().rows.add(filteredData).draw();
        
        // Mettre à jour le compteur
        document.getElementById('invoices-count').textContent = filteredData.length;
    }
    
    // Calculer et afficher totaux
    function updateTotals() {
        state.totals = {
            pending: 0,
            validated: 0,
            paid: 0,
            overdue: 0
        };
        
        const today = new Date();
        
        state.invoices.forEach(invoice => {
            const dueDate = new Date(invoice.due_date);
            const isOverdue = dueDate < today && invoice.status !== 'paid';
            
            if (isOverdue) {
                state.totals.overdue += invoice.total_ttc;
            } else {
                switch (invoice.status) {
                    case 'pending_validation':
                    case 'draft':
                        state.totals.pending += invoice.total_ttc;
                        break;
                    case 'validated':
                        state.totals.validated += invoice.total_ttc;
                        break;
                    case 'paid':
                        const paymentDate = new Date(invoice.payment_date || invoice.invoice_date);
                        if (paymentDate.getMonth() === today.getMonth() && paymentDate.getFullYear() === today.getFullYear()) {
                            state.totals.paid += invoice.total_ttc;
                        }
                        break;
                }
            }
        });
        
        // Afficher les totaux
        document.getElementById('total-pending').textContent = `CHF ${formatSwissAmount(state.totals.pending)}`;
        document.getElementById('total-validated').textContent = `CHF ${formatSwissAmount(state.totals.validated)}`;
        document.getElementById('total-paid').textContent = `CHF ${formatSwissAmount(state.totals.paid)}`;
        document.getElementById('total-overdue').textContent = `CHF ${formatSwissAmount(state.totals.overdue)}`;
    }
    
    // Vérifier alertes échéances
    function checkDueAlerts() {
        const alertsContainer = document.getElementById('due-alerts');
        if (!alertsContainer) return;
        
        const today = new Date();
        const alerts = [];
        
        state.invoices.forEach(invoice => {
            if (invoice.status === 'paid') return;
            
            const dueDate = new Date(invoice.due_date);
            const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
            
            let alertType = null;
            if (diffDays < 0) alertType = 'overdue';
            else if (diffDays === 0) alertType = 'today';
            else if (diffDays <= 3) alertType = 'soon';
            
            if (alertType) {
                alerts.push({
                    type: alertType,
                    invoice: invoice,
                    days: diffDays
                });
            }
        });
        
        if (alerts.length === 0) {
            alertsContainer.innerHTML = '';
            return;
        }
        
        // Grouper par type
        const grouped = alerts.reduce((acc, alert) => {
            if (!acc[alert.type]) acc[alert.type] = [];
            acc[alert.type].push(alert);
            return acc;
        }, {});
        
        let alertHTML = '';
        
        Object.entries(grouped).forEach(([type, typeAlerts]) => {
            const alertConfig = config.dueAlerts[type];
            const count = typeAlerts.length;
            const totalAmount = typeAlerts.reduce((sum, alert) => sum + alert.invoice.total_ttc, 0);
            
            let message = '';
            switch (type) {
                case 'overdue':
                    message = `${count} facture(s) en retard`;
                    break;
                case 'today':
                    message = `${count} facture(s) à échéance aujourd'hui`;
                    break;
                case 'soon':
                    message = `${count} facture(s) à échéance dans les 3 jours`;
                    break;
            }
            
            alertHTML += `
                <div class="alert alert-${alertConfig.class} alert-dismissible mb-3">
                    <div class="d-flex">
                        <div>
                            <svg xmlns="http://www.w3.org/2000/svg" class="icon alert-icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                <path d="M12 9v2m0 4v.01" />
                                <path d="M5 19h14a2 2 0 0 0 1.84 -2.75l-7.1 -12.25a2 2 0 0 0 -3.5 0l-7.1 12.25a2 2 0 0 0 1.75 2.75" />
                            </svg>
                        </div>
                        <div class="ms-2">
                            <h4 class="alert-title">${message}</h4>
                            <div class="text-secondary">
                                Montant total: CHF ${formatSwissAmount(totalAmount)}
                                <a href="#" class="alert-link ms-2" onclick="filterByDueType('${type}')">Voir les factures</a>
                            </div>
                        </div>
                    </div>
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            `;
        });
        
        alertsContainer.innerHTML = alertHTML;
    }
    
    // Actions rapides
    function handleQuickAction(action, invoiceId) {
        const invoice = state.invoices.find(inv => inv.invoice_id === invoiceId);
        if (!invoice) return;
        
        switch (action) {
            case 'validate':
                validateInvoice(invoiceId);
                break;
            case 'pay':
                schedulePayment(invoiceId);
                break;
            case 'dispute':
                markAsDispute(invoiceId);
                break;
            case 'view':
                viewInvoiceDetails(invoiceId);
                break;
        }
    }
    
    // Validation facture
    async function validateInvoice(invoiceId) {
        try {
            const invoice = state.invoices.find(inv => inv.invoice_id === invoiceId);
            if (!invoice) return;
            
            // Vérifier permissions
            if (!await window.PermissionsSuperadmin.hasPermission('superadmin.finance.validate')) {
                showNotification('Permission refusée pour la validation', 'error');
                return;
            }
            
            // Déterminer le niveau de validation requis
            const needsLevel2 = invoice.total_ttc >= config.validationThresholds.level1;
            
            // Vérifier si l'utilisateur peut valider ce niveau
            const canValidate = checkValidationRights(invoice, state.currentUser);
            if (!canValidate.allowed) {
                showNotification(canValidate.reason, 'error');
                return;
            }
            
            // Confirmer la validation
            if (!confirm(`Confirmer la validation de la facture ${invoice.invoice_number} pour ${formatSwissAmount(invoice.total_ttc)} CHF ?`)) {
                return;
            }
            
            // Effectuer la validation
            const currentLevel = getCurrentValidationLevel(invoice);
            const timestamp = new Date().toISOString();
            
            if (currentLevel === 'level_1') {
                invoice.validation_workflow.level_1 = {
                    required: true,
                    validator: state.currentUser.name,
                    status: "approved",
                    date: timestamp
                };
                
                if (needsLevel2) {
                    invoice.validation_workflow.level_2 = {
                        required: true,
                        validator: null,
                        status: "pending",
                        date: null
                    };
                    invoice.status = "pending_validation";
                } else {
                    invoice.status = "validated";
                }
            } else if (currentLevel === 'level_2') {
                invoice.validation_workflow.level_2.validator = state.currentUser.name;
                invoice.validation_workflow.level_2.status = "approved";
                invoice.validation_workflow.level_2.date = timestamp;
                invoice.status = "validated";
            }
            
            // Logger l'action
            await window.AuthSuperadmin.logAuditEvent('INVOICE_VALIDATED', {
                invoiceId: invoice.invoice_id,
                invoiceNumber: invoice.invoice_number,
                amount: invoice.total_ttc,
                level: currentLevel,
                validator: state.currentUser.name
            });
            
            // Rafraîchir l'affichage
            state.dataTable.clear().rows.add(state.invoices).draw();
            updateTotals();
            
            showNotification(`Facture ${invoice.invoice_number} validée avec succès`, 'success');
            
        } catch (error) {
            console.error('❌ Erreur validation facture:', error);
            showNotification('Erreur lors de la validation', 'error');
        }
    }
    
    // Programmer paiement
    async function schedulePayment(invoiceId) {
        try {
            const invoice = state.invoices.find(inv => inv.invoice_id === invoiceId);
            if (!invoice) return;
            
            // Vérifier permissions
            if (!await window.PermissionsSuperadmin.hasPermission('superadmin.finance.pay')) {
                showNotification('Permission refusée pour les paiements', 'error');
                return;
            }
            
            // Vérifier que la facture est validée
            if (invoice.status !== 'validated') {
                showNotification('La facture doit être validée avant programmation du paiement', 'error');
                return;
            }
            
            // Modal simple pour la date de paiement
            const paymentDate = prompt('Date de paiement (YYYY-MM-DD):', invoice.due_date);
            if (!paymentDate) return;
            
            // Valider la date
            if (!isValidDate(paymentDate)) {
                showNotification('Format de date invalide', 'error');
                return;
            }
            
            // Programmer le paiement
            invoice.payment_status = "scheduled";
            invoice.payment_date = paymentDate;
            invoice.payment_reference = `PAY-${Date.now()}`;
            
            // Logger l'action
            await window.AuthSuperadmin.logAuditEvent('PAYMENT_SCHEDULED', {
                invoiceId: invoice.invoice_id,
                paymentDate: paymentDate,
                amount: invoice.total_ttc
            });
            
            // Rafraîchir l'affichage
            state.dataTable.clear().rows.add(state.invoices).draw();
            updateTotals();
            
            showNotification(`Paiement programmé pour le ${formatDate(paymentDate)}`, 'success');
            
        } catch (error) {
            console.error('❌ Erreur programmation paiement:', error);
            showNotification('Erreur lors de la programmation du paiement', 'error');
        }
    }
    
    // Marquer en litige
    async function markAsDispute(invoiceId) {
        try {
            const invoice = state.invoices.find(inv => inv.invoice_id === invoiceId);
            if (!invoice) return;
            
            const reason = prompt('Raison du litige:');
            if (!reason) return;
            
            invoice.status = "dispute";
            invoice.dispute_reason = reason;
            invoice.dispute_date = new Date().toISOString();
            
            // Logger l'action
            await window.AuthSuperadmin.logAuditEvent('INVOICE_DISPUTED', {
                invoiceId: invoice.invoice_id,
                reason: reason
            });
            
            // Rafraîchir l'affichage
            state.dataTable.clear().rows.add(state.invoices).draw();
            updateTotals();
            
            showNotification('Facture marquée en litige', 'warning');
            
        } catch (error) {
            console.error('❌ Erreur marquage litige:', error);
            showNotification('Erreur lors du marquage en litige', 'error');
        }
    }
    
    // Voir détails facture
    function viewInvoiceDetails(invoiceId) {
        const invoice = state.invoices.find(inv => inv.invoice_id === invoiceId);
        if (!invoice) return;
        
        const modal = document.getElementById('invoiceDetailsModal');
        const content = document.getElementById('invoice-details-content');
        
        if (!modal || !content) return;
        
        // Générer le contenu détaillé
        content.innerHTML = generateInvoiceDetailsHTML(invoice);
        
        // Afficher/masquer boutons selon statut
        const validateBtn = document.getElementById('validate-invoice');
        const payBtn = document.getElementById('pay-invoice');
        
        if (validateBtn) {
            const canValidate = checkValidationRights(invoice, state.currentUser);
            validateBtn.style.display = canValidate.allowed ? 'block' : 'none';
            validateBtn.onclick = () => {
                validateInvoice(invoiceId);
                bootstrap.Modal.getInstance(modal).hide();
            };
        }
        
        if (payBtn) {
            payBtn.style.display = invoice.status === 'validated' ? 'block' : 'none';
            payBtn.onclick = () => {
                schedulePayment(invoiceId);
                bootstrap.Modal.getInstance(modal).hide();
            };
        }
        
        // Afficher le modal
        new bootstrap.Modal(modal).show();
    }
    
    // Ouvrir modal nouvelle facture
    function openNewInvoiceModal() {
        const modal = document.getElementById('newInvoiceModal');
        if (!modal) return;
        
        // Reset du formulaire
        document.getElementById('newInvoiceForm').reset();
        
        // Date par défaut
        document.getElementById('invoice-date').value = new Date().toISOString().split('T')[0];
        
        // Date d'échéance par défaut (30 jours)
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30);
        document.getElementById('due-date').value = dueDate.toISOString().split('T')[0];
        
        new bootstrap.Modal(modal).show();
    }
    
    // Ouvrir modal import OCR
    function openOCRImportModal() {
        const modal = document.getElementById('ocrImportModal');
        const listContainer = document.getElementById('ocr-documents-list');
        
        if (!modal || !listContainer) return;
        
        // Charger les documents OCR traités
        loadOCRDocuments(listContainer);
        
        new bootstrap.Modal(modal).show();
    }
    
    // Charger documents OCR
    function loadOCRDocuments(container) {
        // Récupérer les documents depuis localStorage (OCR module)
        const ocrDocuments = JSON.parse(localStorage.getItem('ocr_documents') || '[]');
        
        if (ocrDocuments.length === 0) {
            container.innerHTML = `
                <div class="text-center py-4">
                    <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-lg text-muted mb-3" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                        <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                        <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />
                    </svg>
                    <h3>Aucun document OCR</h3>
                    <p class="text-muted">Utilisez le centre OCR pour traiter des documents d'abord.</p>
                </div>
            `;
            return;
        }
        
        // Filtrer les documents non encore importés
        const availableDocuments = ocrDocuments.filter(doc => 
            !state.invoices.some(inv => inv.original_file === doc.id)
        );
        
        let html = '';
        availableDocuments.forEach(doc => {
            html += `
                <div class="card mb-3">
                    <div class="card-body">
                        <div class="row align-items-center">
                            <div class="col">
                                <h4 class="mb-1">${doc.supplier || 'Fournisseur non détecté'}</h4>
                                <div class="text-muted small">
                                    N° ${doc.documentNumber || 'N/A'} • ${formatDate(doc.timestamp)}
                                </div>
                            </div>
                            <div class="col-auto">
                                <div class="text-end">
                                    <div class="h4 mb-0">${formatSwissAmount(doc.amounts?.total || 0)} CHF</div>
                                    <div class="text-muted small">Entité: ${getEntityLabel(doc.entity)}</div>
                                </div>
                            </div>
                            <div class="col-auto">
                                <button class="btn btn-primary btn-sm import-ocr-doc" data-doc='${JSON.stringify(doc)}'>
                                    <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none">
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                        <path d="M7 11l5 -5l5 5" />
                                        <path d="M12 17l0 -12" />
                                    </svg>
                                    Importer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
        
        // Attacher événements import
        container.querySelectorAll('.import-ocr-doc').forEach(btn => {
            btn.addEventListener('click', function() {
                const docData = JSON.parse(this.dataset.doc);
                importFromOCR(docData);
            });
        });
    }
    
    // Importer depuis OCR
    async function importFromOCR(ocrData) {
        try {
            // Créer une nouvelle facture à partir des données OCR
            const newInvoice = {
                invoice_id: `INV-IN-${Date.now()}`,
                status: "draft",
                supplier: {
                    name: ocrData.supplier || '',
                    vat_number: ocrData.vatNumber || '',
                    iban: ocrData.iban || '',
                    address: ocrData.address || ''
                },
                invoice_number: ocrData.documentNumber || '',
                invoice_date: ocrData.date || new Date().toISOString().split('T')[0],
                due_date: calculateDueDate(ocrData.date),
                subtotal_ht: parseFloat(ocrData.amounts?.ht || 0),
                vat_rate: 7.7,
                vat_amount: parseFloat(ocrData.amounts?.vat || 0),
                total_ttc: parseFloat(ocrData.amounts?.total || 0),
                currency: "CHF",
                entity: ocrData.entity || 'hypervisual',
                category: ocrData.category || 'other',
                validation_workflow: {},
                payment_status: "unpaid",
                original_file: ocrData.id,
                ocr_data: ocrData,
                created_at: new Date().toISOString(),
                created_by: "system_ocr"
            };
            
            // Ajouter à la liste
            state.invoices.unshift(newInvoice);
            
            // Mettre à jour l'affichage
            state.dataTable.clear().rows.add(state.invoices).draw();
            updateTotals();
            
            // Logger l'import
            await window.AuthSuperadmin.logAuditEvent('INVOICE_IMPORTED_OCR', {
                invoiceId: newInvoice.invoice_id,
                originalFile: ocrData.id
            });
            
            showNotification('Facture importée depuis OCR avec succès', 'success');
            
            // Fermer le modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('ocrImportModal'));
            if (modal) modal.hide();
            
        } catch (error) {
            console.error('❌ Erreur import OCR:', error);
            showNotification('Erreur lors de l\'import OCR', 'error');
        }
    }
    
    // Sauvegarder facture
    async function saveInvoice(isDraft = false) {
        try {
            const form = document.getElementById('newInvoiceForm');
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }
            
            // Collecter les données
            const formData = new FormData(form);
            const newInvoice = {
                invoice_id: `INV-IN-${Date.now()}`,
                status: isDraft ? "draft" : "pending_validation",
                supplier: {
                    name: document.getElementById('supplier-name').value,
                    vat_number: document.getElementById('supplier-vat').value,
                    iban: document.getElementById('supplier-iban').value,
                    address: document.getElementById('supplier-address').value
                },
                invoice_number: document.getElementById('invoice-number').value,
                invoice_date: document.getElementById('invoice-date').value,
                due_date: document.getElementById('due-date').value,
                subtotal_ht: parseFloat(document.getElementById('amount-ht').value),
                vat_rate: 7.7,
                vat_amount: parseFloat(document.getElementById('amount-vat').value),
                total_ttc: parseFloat(document.getElementById('amount-total').value),
                currency: "CHF",
                entity: document.getElementById('invoice-entity').value,
                category: document.getElementById('invoice-category').value,
                notes: document.getElementById('invoice-notes').value,
                validation_workflow: {},
                payment_status: "unpaid",
                created_at: new Date().toISOString(),
                created_by: state.currentUser.name
            };
            
            // Ajouter à la liste
            state.invoices.unshift(newInvoice);
            
            // Mettre à jour l'affichage
            state.dataTable.clear().rows.add(state.invoices).draw();
            updateTotals();
            
            // Logger la création
            await window.AuthSuperadmin.logAuditEvent('INVOICE_CREATED', {
                invoiceId: newInvoice.invoice_id,
                isDraft: isDraft,
                amount: newInvoice.total_ttc
            });
            
            showNotification(`Facture ${isDraft ? 'sauvegardée en brouillon' : 'créée'} avec succès`, 'success');
            
            // Fermer le modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('newInvoiceModal'));
            if (modal) modal.hide();
            
        } catch (error) {
            console.error('❌ Erreur sauvegarde facture:', error);
            showNotification('Erreur lors de la sauvegarde', 'error');
        }
    }
    
    // Export factures
    function exportInvoices() {
        try {
            // Préparer les données pour export
            const exportData = state.invoices.map(invoice => ({
                'N° Facture': invoice.invoice_number,
                'Fournisseur': invoice.supplier.name,
                'N° TVA': invoice.supplier.vat_number,
                'Entité': getEntityLabel(invoice.entity),
                'Date Facture': formatDate(invoice.invoice_date),
                'Date Échéance': formatDate(invoice.due_date),
                'Montant HT': invoice.subtotal_ht,
                'TVA': invoice.vat_amount,
                'Total TTC': invoice.total_ttc,
                'Statut': config.statuses[invoice.status],
                'Catégorie': config.categories[invoice.category]
            }));
            
            // Créer CSV
            const csv = convertToCSV(exportData);
            
            // Télécharger
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `factures_fournisseurs_${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
            
            showNotification('Export généré avec succès', 'success');
            
        } catch (error) {
            console.error('❌ Erreur export:', error);
            showNotification('Erreur lors de l\'export', 'error');
        }
    }
    
    // Actions groupées
    function bulkValidate() {
        const selectedIds = getSelectedInvoiceIds();
        if (selectedIds.length === 0) {
            showNotification('Aucune facture sélectionnée', 'warning');
            return;
        }
        
        if (confirm(`Valider ${selectedIds.length} facture(s) sélectionnée(s) ?`)) {
            selectedIds.forEach(id => validateInvoice(id));
        }
    }
    
    function bulkPay() {
        const selectedIds = getSelectedInvoiceIds();
        if (selectedIds.length === 0) {
            showNotification('Aucune facture sélectionnée', 'warning');
            return;
        }
        
        // TODO: Implémenter programmation de paiements en lot
        showNotification('Programmation de paiements en lot - À implémenter', 'info');
    }
    
    function bulkExport() {
        const selectedIds = getSelectedInvoiceIds();
        if (selectedIds.length === 0) {
            showNotification('Aucune facture sélectionnée', 'warning');
            return;
        }
        
        // TODO: Implémenter export sélectif
        showNotification('Export sélectif - À implémenter', 'info');
    }
    
    // Utilitaires
    function getSelectedInvoiceIds() {
        const checkboxes = document.querySelectorAll('.invoice-checkbox:checked');
        return Array.from(checkboxes).map(cb => cb.value);
    }
    
    function clearFilters() {
        Object.keys(state.filters).forEach(key => {
            state.filters[key] = '';
            const element = document.getElementById(`filter-${key}`);
            if (element) element.value = '';
        });
        applyFilters();
    }
    
    function getDueIndicator(dueDate, status) {
        if (status === 'paid') return { class: 'due-normal' };
        
        const today = new Date();
        const due = new Date(dueDate);
        const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) return { class: 'due-overdue' };
        if (diffDays === 0) return { class: 'due-today' };
        if (diffDays <= 3) return { class: 'due-soon' };
        return { class: 'due-normal' };
    }
    
    function renderValidationWorkflow(workflow) {
        if (!workflow || Object.keys(workflow).length === 0) {
            return '<span class="text-muted small">Aucune</span>';
        }
        
        let html = '<div class="validation-steps">';
        
        if (workflow.level_1) {
            const step1 = workflow.level_1;
            html += `<div class="validation-step ${step1.status}">
                <span class="badge badge-sm bg-${step1.status === 'approved' ? 'success' : 'warning'}">1</span>
                ${step1.validator || 'En attente'}
            </div>`;
        }
        
        if (workflow.level_2) {
            const step2 = workflow.level_2;
            html += `<div class="validation-step ${step2.status}">
                <span class="badge badge-sm bg-${step2.status === 'approved' ? 'success' : step2.status === 'pending' ? 'warning' : 'secondary'}">2</span>
                ${step2.validator || 'En attente'}
            </div>`;
        }
        
        html += '</div>';
        return html;
    }
    
    function renderQuickActions(invoice) {
        let actions = [];
        
        // Action voir
        actions.push(`
            <div class="quick-action view" data-action="view" data-invoice-id="${invoice.invoice_id}" title="Voir détails">
                <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="16" height="16" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
                    <path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6" />
                </svg>
            </div>
        `);
        
        // Action valider (si applicable)
        const canValidate = checkValidationRights(invoice, state.currentUser);
        if (canValidate.allowed) {
            actions.push(`
                <div class="quick-action validate" data-action="validate" data-invoice-id="${invoice.invoice_id}" title="Valider">
                    <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="16" height="16" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                        <path d="M5 12l5 5l10 -10" />
                    </svg>
                </div>
            `);
        }
        
        // Action payer (si validée)
        if (invoice.status === 'validated') {
            actions.push(`
                <div class="quick-action pay" data-action="pay" data-invoice-id="${invoice.invoice_id}" title="Programmer paiement">
                    <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="16" height="16" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                        <path d="M17 8v-3a1 1 0 0 0 -1 -1h-10a2 2 0 0 0 0 4h12a1 1 0 0 1 1 1v3m0 4v3a1 1 0 0 1 -1 1h-12a2 2 0 0 1 -2 -2v-12" />
                        <path d="M20 12v4h-4a2 2 0 0 1 0 -4h4" />
                    </svg>
                </div>
            `);
        }
        
        // Action litige
        if (invoice.status !== 'paid' && invoice.status !== 'dispute') {
            actions.push(`
                <div class="quick-action dispute" data-action="dispute" data-invoice-id="${invoice.invoice_id}" title="Marquer en litige">
                    <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="16" height="16" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                        <path d="M12 9v2m0 4v.01" />
                        <path d="M5 19h14a2 2 0 0 0 1.84 -2.75l-7.1 -12.25a2 2 0 0 0 -3.5 0l-7.1 12.25a2 2 0 0 0 1.75 2.75" />
                    </svg>
                </div>
            `);
        }
        
        return `<div class="quick-actions">${actions.join('')}</div>`;
    }
    
    function checkValidationRights(invoice, user) {
        if (!user) return { allowed: false, reason: 'Utilisateur non connecté' };
        
        const currentLevel = getCurrentValidationLevel(invoice);
        if (!currentLevel) return { allowed: false, reason: 'Aucune validation requise' };
        
        // Niveau 1: Manager ou plus
        if (currentLevel === 'level_1') {
            if (user.role === 'superadmin' || user.permissions?.includes('finance.validate')) {
                return { allowed: true };
            }
            return { allowed: false, reason: 'Permissions insuffisantes pour validation niveau 1' };
        }
        
        // Niveau 2: Direction uniquement
        if (currentLevel === 'level_2') {
            if (user.role === 'superadmin') {
                return { allowed: true };
            }
            return { allowed: false, reason: 'Validation direction requise' };
        }
        
        return { allowed: false, reason: 'Niveau de validation non reconnu' };
    }
    
    function getCurrentValidationLevel(invoice) {
        const workflow = invoice.validation_workflow;
        
        if (!workflow.level_1 || workflow.level_1.status !== 'approved') {
            return 'level_1';
        }
        
        if (workflow.level_2 && workflow.level_2.status === 'pending') {
            return 'level_2';
        }
        
        return null; // Toutes validations terminées
    }
    
    function generateInvoiceDetailsHTML(invoice) {
        return `
            <div class="row">
                <div class="col-md-6">
                    <h4>Informations fournisseur</h4>
                    <div class="mb-3">
                        <strong>${invoice.supplier.name}</strong><br>
                        ${invoice.supplier.address}<br>
                        TVA: ${invoice.supplier.vat_number}<br>
                        ${invoice.supplier.iban ? `IBAN: ${invoice.supplier.iban}` : ''}
                    </div>
                </div>
                <div class="col-md-6">
                    <h4>Détails facture</h4>
                    <div class="mb-3">
                        <strong>N°:</strong> ${invoice.invoice_number}<br>
                        <strong>Date:</strong> ${formatDate(invoice.invoice_date)}<br>
                        <strong>Échéance:</strong> ${formatDate(invoice.due_date)}<br>
                        <strong>Entité:</strong> ${getEntityLabel(invoice.entity)}<br>
                        <strong>Statut:</strong> <span class="invoice-status status-${invoice.status.replace('_', '-')}">${config.statuses[invoice.status]}</span>
                    </div>
                </div>
            </div>
            
            <div class="row">
                <div class="col-md-6">
                    <h4>Montants</h4>
                    <table class="table table-sm">
                        <tr><td>Montant HT:</td><td class="text-end">${formatSwissAmount(invoice.subtotal_ht)} CHF</td></tr>
                        <tr><td>TVA (${invoice.vat_rate}%):</td><td class="text-end">${formatSwissAmount(invoice.vat_amount)} CHF</td></tr>
                        <tr class="fw-bold"><td>Total TTC:</td><td class="text-end">${formatSwissAmount(invoice.total_ttc)} CHF</td></tr>
                    </table>
                </div>
                <div class="col-md-6">
                    <h4>Validation</h4>
                    ${renderValidationWorkflow(invoice.validation_workflow)}
                    
                    ${invoice.payment_status !== 'unpaid' ? `
                        <h4 class="mt-3">Paiement</h4>
                        <div>
                            <strong>Statut:</strong> ${invoice.payment_status}<br>
                            ${invoice.payment_date ? `<strong>Date:</strong> ${formatDate(invoice.payment_date)}<br>` : ''}
                            ${invoice.payment_reference ? `<strong>Référence:</strong> ${invoice.payment_reference}` : ''}
                        </div>
                    ` : ''}
                </div>
            </div>
            
            ${invoice.notes ? `
                <div class="row">
                    <div class="col-12">
                        <h4>Notes</h4>
                        <p>${invoice.notes}</p>
                    </div>
                </div>
            ` : ''}
        `;
    }
    
    function calculateTotalAmount() {
        const ht = parseFloat(document.getElementById('amount-ht').value) || 0;
        const vatRate = 7.7;
        const vat = ht * (vatRate / 100);
        const total = ht + vat;
        
        document.getElementById('amount-vat').value = vat.toFixed(2);
        document.getElementById('amount-total').value = total.toFixed(2);
    }
    
    function calculateTotalFromInputs() {
        const ht = parseFloat(document.getElementById('amount-ht').value) || 0;
        const vat = parseFloat(document.getElementById('amount-vat').value) || 0;
        const total = ht + vat;
        
        document.getElementById('amount-total').value = total.toFixed(2);
    }
    
    function calculateDueDate(invoiceDate) {
        const date = new Date(invoiceDate || new Date());
        date.setDate(date.getDate() + 30);
        return date.toISOString().split('T')[0];
    }
    
    function searchSupplier() {
        // TODO: Implémenter recherche fournisseur
        showNotification('Recherche fournisseur - À implémenter', 'info');
    }
    
    function openBatchPayments() {
        // TODO: Implémenter interface paiements groupés
        showNotification('Paiements groupés - À implémenter', 'info');
    }
    
    // Fonctions utilitaires
    function formatSwissAmount(amount) {
        return parseFloat(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, "'");
    }
    
    function formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-CH');
    }
    
    function getEntityLabel(entityKey) {
        return config.entities[entityKey]?.name || entityKey;
    }
    
    function isValidDate(dateString) {
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date);
    }
    
    function convertToCSV(data) {
        if (!data.length) return '';
        
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
        ].join('\n');
        
        return csvContent;
    }
    
    function showNotification(message, type = 'info') {
        if (window.showNotification) {
            window.showNotification(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }
    
    // Fonction globale pour filtrer par type d'échéance
    window.filterByDueType = function(type) {
        document.getElementById('filter-due').value = type;
        state.filters.due = type;
        applyFilters();
    };
    
    // Interface publique
    return {
        init,
        loadInvoices,
        validateInvoice,
        schedulePayment,
        getInvoices: () => state.invoices,
        getTotals: () => state.totals
    };
    
})();