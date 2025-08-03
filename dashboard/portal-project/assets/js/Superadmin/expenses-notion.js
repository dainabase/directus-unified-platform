// expenses-notion.js - Module de gestion des notes de frais et dépenses
// Capture photo, OCR intelligent, catégorisation IA, workflow validation

window.ExpensesNotion = (function() {
    'use strict';
    
    // Configuration
    const config = {
        // Catégories de dépenses avec règles métier
        categories: {
            "Repas affaires": {
                icon: "🍽️",
                color: "#fd7e14",
                subcategories: ["Repas client", "Repas équipe", "Repas fournisseur"],
                requires_participants: true,
                max_amount_auto: 200,
                keywords: ["restaurant", "café", "bar", "bistro", "brasserie", "repas", "déjeuner", "dîner"]
            },
            "Transport": {
                icon: "🚗",
                color: "#20c997",
                subcategories: ["Taxi/Uber", "Train/Bus", "Avion", "Location véhicule", "Parking", "Carburant"],
                requires_destination: true,
                max_amount_auto: 100,
                keywords: ["taxi", "uber", "train", "sbb", "cff", "vol", "avion", "parking", "essence", "diesel"]
            },
            "Hébergement": {
                icon: "🏨", 
                color: "#6f42c1",
                subcategories: ["Hôtel", "Airbnb", "Appartement"],
                requires_project: true,
                max_amount_auto: 300,
                keywords: ["hôtel", "hotel", "airbnb", "booking", "nuitée"]
            },
            "Matériel/Fournitures": {
                icon: "🖥️",
                color: "#0d6efd",
                subcategories: ["IT/Informatique", "Bureau", "Production", "Logiciels"],
                requires_justification: true,
                max_amount_auto: 500,
                keywords: ["apple", "microsoft", "adobe", "ordinateur", "laptop", "écran", "clavier", "souris", "bureau"]
            },
            "Formation": {
                icon: "📚",
                color: "#dc3545",
                subcategories: ["Cours", "Certification", "Conférence", "Livre"],
                requires_approval: true,
                max_amount_auto: 0,
                keywords: ["formation", "cours", "certification", "conférence", "livre", "udemy", "coursera"]
            },
            "Marketing": {
                icon: "📣",
                color: "#198754",
                subcategories: ["Publicité", "Événement", "Cadeaux clients", "Communication"],
                requires_project: true,
                max_amount_auto: 1000,
                keywords: ["publicité", "marketing", "événement", "cadeau", "impression", "flyers"]
            }
        },
        
        // Seuils de validation
        validationThresholds: {
            auto_approve: 200,      // CHF - Validation automatique en dessous
            manager_approval: 1000, // CHF - Validation manager requis
            director_approval: 5000 // CHF - Validation direction requis
        },
        
        // Types de paiement
        paymentMethods: {
            personal_card: { label: "Carte personnelle", icon: "💳", requires_reimbursement: true },
            company_card: { label: "Carte d'entreprise", icon: "🏢", requires_reimbursement: false },
            cash: { label: "Espèces", icon: "💵", requires_reimbursement: true },
            revolut: { label: "Revolut Business", icon: "🔄", requires_reimbursement: false }
        },
        
        // Statuts des dépenses
        statuses: {
            draft: "Brouillon",
            submitted: "Soumise",
            approved: "Approuvée", 
            rejected: "Rejetée",
            reimbursed: "Remboursée"
        },
        
        // Configuration OCR
        ocrConfig: {
            languages: 'fra+eng+deu+ita',
            patterns: {
                amount: /(?:CHF|Fr\.?|SFr\.?|EUR|€)\s*[\d\s\']+[\.,]?\d{0,2}/gi,
                date: /\d{1,2}[\.\/\-]\d{1,2}[\.\/\-]\d{2,4}/g,
                merchant: /^[A-Z][A-Za-z\s\-&\.]{3,50}/gm,
                vat: /TVA|VAT|MWST|IVA/gi
            }
        }
    };
    
    // État du module
    let state = {
        expenses: [],
        employees: [],
        currentExpense: null,
        currentStep: 1,
        ocrWorker: null,
        geolocation: null,
        filters: {
            status: '',
            period: 'month',
            category: '',
            employee: ''
        },
        totals: {
            month: 0,
            pending: 0,
            toReimburse: 0,
            count: 0
        },
        currentUser: null,
        nextExpenseNumber: 1
    };
    
    // Initialisation
    async function init() {
        try {
            console.log('💳 Initialisation module notes de frais...');
            
            // Vérifier permissions
            if (!await window.PermissionsSuperadmin.hasPermission('superadmin.finance.view')) {
                throw new Error('Permissions insuffisantes');
            }
            
            // Récupérer utilisateur actuel
            state.currentUser = window.AuthSuperadmin.getCurrentUser();
            
            // Initialiser OCR Worker
            await initializeOCR();
            
            // Charger les données
            await loadExpenses();
            await loadEmployees();
            
            // Initialiser l'interface
            initializeInterface();
            attachEventListeners();
            setupFilters();
            updateTotals();
            renderExpensesList();
            
            console.log('✅ Module notes de frais initialisé');
            
        } catch (error) {
            console.error('❌ Erreur initialisation notes de frais:', error);
            showNotification('Erreur lors du chargement des notes de frais', 'error');
        }
    }
    
    // Initialiser OCR Worker
    async function initializeOCR() {
        try {
            if (typeof Tesseract !== 'undefined') {
                state.ocrWorker = await Tesseract.createWorker(config.ocrConfig.languages);
                console.log('📸 OCR Worker initialisé');
            }
        } catch (error) {
            console.warn('⚠️ OCR non disponible:', error);
        }
    }
    
    // Charger les dépenses
    async function loadExpenses() {
        try {
            // Vérifier la disponibilité de MCP Notion
            if (typeof mcp_notion === 'undefined') {
                console.warn('⚠️ MCP Notion non disponible, chargement des données de démonstration');
                return loadMockExpenses();
            }

            // Configuration de la base de données
            const DB_NOTES_FRAIS = window.SUPERADMIN_DB_IDS?.NOTES_FRAIS || "À_DEFINIR_APRES_CREATION";
            
            if (DB_NOTES_FRAIS === "À_DEFINIR_APRES_CREATION") {
                console.warn('⚠️ ID de la base DB-NOTES-FRAIS non configuré, utilisation des données de démonstration');
                return loadMockExpenses();
            }

            console.log('💰 Chargement des notes de frais depuis Notion DB-NOTES-FRAIS...');

            // Requête Notion avec tri par date
            const response = await mcp_notion.query_database({
                database_id: DB_NOTES_FRAIS,
                sorts: [
                    {
                        property: "Date Dépense",
                        direction: "descending"
                    }
                ]
            });

            // Transformer les données Notion vers le format attendu
            state.expenses = response.results.map(page => {
                const props = page.properties;

                // Extraire les données de l'employé
                let employee = {
                    name: "Employé inconnu",
                    employee_id: "EMP-000",
                    entity: "unknown",
                    department: "Unknown"
                };

                if (props["Employé"]?.people?.length > 0) {
                    const emp = props["Employé"].people[0];
                    employee = {
                        name: emp.name || "Employé",
                        employee_id: `EMP-${emp.id.substring(0, 3)}`,
                        entity: extractEntity(props["Entité"]),
                        department: "Département"
                    };
                }

                // Extraire montants
                const amount = props["Montant"]?.number || 0;
                const vatIncluded = props["TVA Incluse"]?.number || 0;

                // Mapper la catégorie depuis Notion
                const notionCategory = props["Catégorie"]?.select?.name;
                const category = mapNotionCategoryToLocal(notionCategory);

                // Calculer le statut basé sur les propriétés Notion
                const notionStatus = props["Statut Validation"]?.select?.name || "Brouillon";
                const status = mapNotionValidationStatus(notionStatus);

                // Construire la validation workflow
                const validation = buildExpenseValidation(props, amount);

                // Générer un ID unique
                const description = props["Description"]?.title?.[0]?.plain_text || `Dépense ${page.id.substring(0, 8)}`;
                const expenseId = `EXP-${new Date(page.created_time).getFullYear()}-${page.id.substring(0, 3).toUpperCase()}`;

                // Mapper la méthode de paiement
                const paymentMethod = mapNotionPaymentMethod(props["Carte Utilisée"]?.select?.name);

                return {
                    expense_id: expenseId,
                    type: "expense_report",
                    employee: employee,
                    date: props["Date Dépense"]?.date?.start || new Date().toISOString().split('T')[0],
                    amount: amount,
                    vat_included: vatIncluded,
                    currency: "CHF",
                    category: category.name,
                    subcategory: category.subcategory,
                    description: description,
                    participants: extractParticipants(props["Notes"]),
                    project_id: extractProjectId(props["Projet"]),
                    payment_method: paymentMethod.method,
                    card_details: {
                        type: paymentMethod.type,
                        last_digits: paymentMethod.lastDigits
                    },
                    receipts: buildReceiptsArray(props["Justificatif"]),
                    status: status,
                    validation: validation,
                    reimbursement_status: calculateReimbursementStatus(status, paymentMethod),
                    location: {
                        latitude: null,
                        longitude: null,
                        address: "Suisse"
                    },
                    created_at: page.created_time,
                    submitted_at: status !== "draft" ? page.created_time : null,
                    notion_id: page.id
                };
            });

            console.log(`✅ ${state.expenses.length} notes de frais chargées depuis Notion DB-NOTES-FRAIS`);

        } catch (error) {
            console.error('❌ Erreur chargement dépenses depuis Notion:', error);
            console.log('🔄 Fallback vers les données de démonstration');
            return loadMockExpenses();
        }
    }

    // Fonctions helper pour la transformation des données
    function mapNotionCategoryToLocal(notionCategory) {
        const categoryMapping = {
            "Repas affaires": { name: "Repas affaires", subcategory: "Repas client" },
            "Transport": { name: "Transport", subcategory: "Taxi/Uber" },
            "Hébergement": { name: "Hébergement", subcategory: "Hôtel" },
            "Matériel bureau": { name: "Matériel/Fournitures", subcategory: "Bureau" },
            "Formation": { name: "Formation", subcategory: "Cours" },
            "Marketing": { name: "Marketing", subcategory: "Communication" },
            "Télécoms": { name: "Transport", subcategory: "Communication" },
            "Autres": { name: "Matériel/Fournitures", subcategory: "Divers" }
        };
        return categoryMapping[notionCategory] || { name: "Matériel/Fournitures", subcategory: "Divers" };
    }

    function mapNotionValidationStatus(notionStatus) {
        const statusMapping = {
            "Brouillon": "draft",
            "Soumise": "submitted",
            "Validée": "approved",
            "Rejetée": "rejected",
            "Remboursée": "reimbursed"
        };
        return statusMapping[notionStatus] || "draft";
    }

    function mapNotionPaymentMethod(notionPayment) {
        const methodMapping = {
            "Revolut Business": { method: "revolut", type: "company", lastDigits: "4242" },
            "Carte perso": { method: "personal_card", type: "personal", lastDigits: null },
            "Espèces": { method: "cash", type: "cash", lastDigits: null },
            "Virement": { method: "company_card", type: "company", lastDigits: null }
        };
        return methodMapping[notionPayment] || { method: "personal_card", type: "personal", lastDigits: null };
    }

    function buildExpenseValidation(props, amount) {
        const validation = {};
        const isApproved = props["Date Validation"]?.date?.start;
        const validatedBy = extractValidator(props["Validé Par"]);

        if (amount <= 200) {
            validation.auto_approved = true;
            validation.approved_by = "system";
            validation.approved_date = isApproved || null;
        } else {
            validation.auto_approved = false;
            validation.approved_by = isApproved ? validatedBy : null;
            validation.approved_date = isApproved || null;
        }

        if (amount > 1000) {
            validation.comments = "Validation manager requise pour montant > 1000 CHF";
        }

        return validation;
    }

    function buildReceiptsArray(justificatifProperty) {
        if (!justificatifProperty?.files?.length) return [];

        return justificatifProperty.files.map(file => ({
            file_name: file.name || "receipt.jpg",
            ocr_extracted: true,
            merchant: "Marchand détecté",
            confidence: 0.9
        }));
    }

    function extractParticipants(notesProperty) {
        if (!notesProperty?.rich_text?.length) return [];
        
        const notesText = notesProperty.rich_text[0]?.plain_text || "";
        // Extraction simple des participants depuis les notes
        const participants = notesText.match(/participants?\s*:\s*([^\.]+)/i);
        if (participants) {
            return participants[1].split(',').map(p => p.trim());
        }
        return [];
    }

    function extractProjectId(projetProperty) {
        if (projetProperty?.relation?.length > 0) {
            return `PRJ-${projetProperty.relation[0].id.substring(0, 8)}`;
        }
        return null;
    }

    function calculateReimbursementStatus(status, paymentMethod) {
        if (paymentMethod.method === "revolut" || paymentMethod.method === "company_card") {
            return "not_required";
        }
        if (status === "reimbursed") return "reimbursed";
        if (status === "approved") return "pending";
        return "pending";
    }

    function extractValidator(validatorProperty) {
        if (validatorProperty?.people?.length > 0) {
            return validatorProperty.people[0].name || "Manager";
        }
        return "system";
    }

    function extractEntity(entityProperty) {
        if (!entityProperty?.relation?.length) return "unknown";
        return "hypervisual"; // Par défaut
    }

    // Données de démonstration en fallback
    function loadMockExpenses() {
        state.expenses = [
                {
                    expense_id: "EXP-2025-001",
                    type: "expense_report",
                    employee: {
                        name: "Marie Dubois",
                        employee_id: "EMP-001",
                        entity: "hypervisual",
                        department: "Commercial"
                    },
                    date: "2025-01-20",
                    amount: 85.50,
                    vat_included: 6.58,
                    currency: "CHF",
                    category: "Repas affaires",
                    subcategory: "Repas client",
                    description: "Déjeuner avec M. Dupont - Rolex SA",
                    participants: ["Marie Dubois", "Jean Dupont (Rolex)"],
                    project_id: "PRJ-2025-015",
                    payment_method: "personal_card",
                    card_details: {
                        type: "personal",
                        last_digits: null
                    },
                    receipts: [
                        {
                            file_name: "ticket_restaurant_20250120.jpg",
                            ocr_extracted: true,
                            merchant: "Restaurant Le Léman",
                            confidence: 0.95
                        }
                    ],
                    status: "approved",
                    validation: {
                        auto_approved: true,
                        approved_by: "system",
                        approved_date: "2025-01-20T15:00:00Z",
                        comments: null
                    },
                    reimbursement_status: "pending",
                    location: {
                        latitude: 46.5197,
                        longitude: 6.6323,
                        address: "Genève, Suisse"
                    },
                    created_at: "2025-01-20T14:30:00Z",
                    submitted_at: "2025-01-20T14:35:00Z"
                },
                {
                    expense_id: "EXP-2025-002", 
                    type: "expense_report",
                    employee: {
                        name: "Paul Martin",
                        employee_id: "EMP-002",
                        entity: "dainamics",
                        department: "Direction"
                    },
                    date: "2025-01-21",
                    amount: 45.00,
                    vat_included: 3.47,
                    currency: "CHF",
                    category: "Transport",
                    subcategory: "Taxi/Uber",
                    description: "Taxi urgent vers aéroport - mission client",
                    project_id: "PRJ-2025-020",
                    payment_method: "personal_card",
                    status: "submitted",
                    validation: {
                        auto_approved: true,
                        approved_by: "system",
                        approved_date: null,
                        comments: null
                    },
                    reimbursement_status: "pending",
                    location: {
                        latitude: 46.2044,
                        longitude: 6.1432,
                        address: "Genève Aéroport"
                    },
                    created_at: "2025-01-21T08:15:00Z",
                    submitted_at: "2025-01-21T08:20:00Z"
                },
                {
                    expense_id: "EXP-2025-003",
                    type: "card_expense",
                    employee: {
                        name: "Sophie Bernard",
                        employee_id: "EMP-003", 
                        entity: "waveform",
                        department: "Production"
                    },
                    date: "2025-01-19",
                    amount: 1299.00,
                    vat_included: 100.02,
                    currency: "CHF",
                    category: "Matériel/Fournitures",
                    subcategory: "IT/Informatique",
                    description: "MacBook Pro M3 - Nouveau développeur équipe",
                    payment_method: "revolut",
                    card_details: {
                        type: "company",
                        last_digits: "4242",
                        card_id: "card_7891234"
                    },
                    status: "submitted",
                    validation: {
                        auto_approved: false,
                        approved_by: null,
                        approved_date: null,
                        comments: "Validation manager requise pour montant > 1000 CHF"
                    },
                    reimbursement_status: "not_required",
                    receipts: [
                        {
                            file_name: "apple_store_receipt.jpg",
                            ocr_extracted: true,
                            merchant: "Apple Store Geneva",
                            confidence: 0.98
                        }
                    ],
                    created_at: "2025-01-19T16:45:00Z",
                    submitted_at: "2025-01-19T17:00:00Z"
                },
                {
                    expense_id: "EXP-2025-004",
                    type: "expense_report",
                    employee: {
                        name: "Jean Laurent",
                        employee_id: "EMP-004",
                        entity: "particule",
                        department: "Marketing"
                    },
                    date: "2025-01-18",
                    amount: 150.00,
                    vat_included: 11.55,
                    currency: "CHF",
                    category: "Marketing",
                    subcategory: "Cadeaux clients",
                    description: "Cadeaux de fin d'année - clients VIP",
                    payment_method: "personal_card",
                    status: "reimbursed",
                    validation: {
                        auto_approved: true,
                        approved_by: "system",
                        approved_date: "2025-01-18T20:00:00Z",
                        comments: null
                    },
                    reimbursement_status: "completed",
                    reimbursement_date: "2025-01-25T10:00:00Z",
                    reimbursement_ref: "REIMB-2025-001",
                    created_at: "2025-01-18T17:30:00Z",
                    submitted_at: "2025-01-18T17:35:00Z"
                },
                {
                    expense_id: "EXP-2025-005",
                    type: "expense_report",
                    employee: {
                        name: "Claire Dubois",
                        employee_id: "EMP-005",
                        entity: "holding",
                        department: "Finance"
                    },
                    date: "2025-01-22",
                    amount: 25.50,
                    vat_included: 1.96,
                    currency: "CHF",
                    category: "Transport",
                    subcategory: "Parking",
                    description: "Parking client - réunion Credit Suisse",
                    project_id: "PRJ-2025-025",
                    payment_method: "cash",
                    status: "draft",
                    validation: {},
                    reimbursement_status: "pending",
                    created_at: "2025-01-22T12:00:00Z"
                }
            ];
            
            console.log(`💰 ${state.expenses.length} notes de frais de démonstration chargées`);
        }
        
        // Calculer prochain numéro
        const maxNumber = Math.max(
            ...state.expenses.map(exp => 
                parseInt(exp.expense_id.split('-')[2]) || 0
            )
        );
        state.nextExpenseNumber = maxNumber + 1;
        
        console.log(`📋 ${state.expenses.length} dépenses chargées`);
    }
    
    // Charger les employés
    async function loadEmployees() {
        try {
            // Extraire employés uniques
            const employeeMap = new Map();
            
            state.expenses.forEach(expense => {
                const emp = expense.employee;
                if (!employeeMap.has(emp.employee_id)) {
                    employeeMap.set(emp.employee_id, {
                        employee_id: emp.employee_id,
                        name: emp.name,
                        entity: emp.entity,
                        department: emp.department,
                        expenses_count: 1,
                        total_amount: expense.amount
                    });
                } else {
                    const existing = employeeMap.get(emp.employee_id);
                    existing.expenses_count++;
                    existing.total_amount += expense.amount;
                }
            });
            
            state.employees = Array.from(employeeMap.values());
            
            // Peupler le filtre employés
            populateEmployeeFilter();
            
        } catch (error) {
            console.error('❌ Erreur chargement employés:', error);
        }
    }
    
    // Initialiser l'interface
    function initializeInterface() {
        // Générer sélecteur de catégories
        generateCategorySelector();
        
        // Afficher les stats
        updateTotals();
        
        // Configurer la géolocalisation
        setupGeolocation();
    }
    
    // Générer sélecteur de catégories
    function generateCategorySelector() {
        const container = document.getElementById('category-selector');
        if (!container) return;
        
        let html = '';
        Object.entries(config.categories).forEach(([category, data]) => {
            html += `
                <div class="category-option" data-category="${category}">
                    <div class="category-icon">${data.icon}</div>
                    <div class="fw-bold">${category}</div>
                    <small class="text-muted">Max ${data.max_amount_auto} CHF</small>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }
    
    // Attacher les événements
    function attachEventListeners() {
        // Boutons principaux
        document.getElementById('fab-new-expense')?.addEventListener('click', openNewExpenseModal);
        document.getElementById('import-revolut')?.addEventListener('click', importRevolutTransactions);
        document.getElementById('export-expenses')?.addEventListener('click', exportExpenses);
        document.getElementById('analytics-btn')?.addEventListener('click', openAnalytics);
        
        // Modal nouvelle dépense
        document.getElementById('photo-capture')?.addEventListener('click', triggerPhotoCapture);
        document.getElementById('photo-input')?.addEventListener('change', handlePhotoCapture);
        document.getElementById('save-draft')?.addEventListener('click', () => saveExpense(true));
        document.getElementById('submit-expense')?.addEventListener('click', () => saveExpense(false));
        document.getElementById('next-step')?.addEventListener('click', nextStep);
        
        // Catégories
        document.addEventListener('click', function(e) {
            if (e.target.closest('.category-option')) {
                handleCategorySelection(e.target.closest('.category-option'));
            }
        });
        
        // Changements de montant pour validation
        document.getElementById('expense-amount')?.addEventListener('input', updateValidationPreview);
        
        // Participants pour repas d'affaires
        document.getElementById('expense-participants')?.addEventListener('input', updateParticipantTags);
        
        // Filtres
        document.getElementById('clear-filters')?.addEventListener('click', clearFilters);
        
        // Drag & Drop photo
        setupDragAndDrop();
    }
    
    // Configuration des filtres
    function setupFilters() {
        const filters = ['status', 'period', 'category', 'employee'];
        
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
    
    // Configuration géolocalisation
    function setupGeolocation() {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    state.geolocation = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    };
                    console.log('📍 Géolocalisation activée');
                },
                error => {
                    console.warn('⚠️ Géolocalisation non disponible:', error);
                }
            );
        }
    }
    
    // Configuration Drag & Drop
    function setupDragAndDrop() {
        const dropZone = document.getElementById('photo-capture');
        if (!dropZone) return;
        
        dropZone.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.classList.add('dragover');
        });
        
        dropZone.addEventListener('dragleave', function() {
            this.classList.remove('dragover');
        });
        
        dropZone.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files.length > 0 && files[0].type.startsWith('image/')) {
                handleImageFile(files[0]);
            }
        });
    }
    
    // Ouvrir modal nouvelle dépense
    function openNewExpenseModal() {
        const modal = document.getElementById('newExpenseModal');
        if (!modal) return;
        
        // Reset formulaire et état
        resetExpenseForm();
        state.currentStep = 1;
        state.currentExpense = null;
        
        // Afficher première étape
        showStep(1);
        
        // Date par défaut
        document.getElementById('expense-date').value = new Date().toISOString().split('T')[0];
        
        new bootstrap.Modal(modal).show();
    }
    
    // Reset formulaire
    function resetExpenseForm() {
        document.getElementById('newExpenseForm').reset();
        document.getElementById('photo-preview').style.display = 'none';
        document.querySelector('.category-option.selected')?.classList.remove('selected');
        document.getElementById('participant-tags').innerHTML = '';
        document.getElementById('participants-section').style.display = 'none';
    }
    
    // Afficher étape
    function showStep(step) {
        // Masquer toutes les étapes
        document.querySelectorAll('.step').forEach(el => el.style.display = 'none');
        
        // Afficher l'étape courante
        document.getElementById(`step-${step}`).style.display = 'block';
        
        // Gérer les boutons
        const nextBtn = document.getElementById('next-step');
        const saveDraftBtn = document.getElementById('save-draft');
        const submitBtn = document.getElementById('submit-expense');
        
        if (step < 3) {
            nextBtn.style.display = 'block';
            saveDraftBtn.style.display = 'none';
            submitBtn.style.display = 'none';
        } else {
            nextBtn.style.display = 'none';
            saveDraftBtn.style.display = 'block';
            submitBtn.style.display = 'block';
        }
        
        state.currentStep = step;
    }
    
    // Étape suivante
    function nextStep() {
        if (state.currentStep < 3) {
            showStep(state.currentStep + 1);
            
            if (state.currentStep === 3) {
                // Préremplir les champs si OCR réussi
                if (state.currentExpense) {
                    populateFormFromOCR(state.currentExpense);
                }
                updateValidationPreview();
            }
        }
    }
    
    // Déclencher capture photo
    function triggerPhotoCapture() {
        document.getElementById('photo-input').click();
    }
    
    // Gérer capture photo
    async function handlePhotoCapture(event) {
        const file = event.target.files[0];
        if (!file || !file.type.startsWith('image/')) return;
        
        await handleImageFile(file);
    }
    
    // Traiter fichier image
    async function handleImageFile(file) {
        try {
            // Afficher preview
            const preview = document.getElementById('photo-preview');
            const reader = new FileReader();
            
            reader.onload = function(e) {
                preview.src = e.target.result;
                preview.style.display = 'block';
            };
            reader.readAsDataURL(file);
            
            // Lancer OCR si disponible
            if (state.ocrWorker) {
                await performOCR(file);
            } else {
                // Passer directement à l'étape suivante
                setTimeout(() => nextStep(), 1000);
            }
            
        } catch (error) {
            console.error('❌ Erreur traitement image:', error);
            showNotification('Erreur lors du traitement de l\'image', 'error');
        }
    }
    
    // Effectuer OCR
    async function performOCR(file) {
        try {
            const processingEl = document.getElementById('ocr-processing');
            processingEl.style.display = 'block';
            
            // Analyser avec Tesseract
            const { data: { text, confidence } } = await state.ocrWorker.recognize(file);
            
            processingEl.style.display = 'none';
            
            // Extraire informations
            const extractedData = extractDataFromOCR(text, confidence);
            
            // Stocker temporairement
            state.currentExpense = extractedData;
            
            // Catégorisation automatique
            const suggestedCategory = suggestCategory(text, extractedData);
            if (suggestedCategory) {
                state.currentExpense.suggested_category = suggestedCategory;
            }
            
            showNotification(`OCR réussi (${Math.round(confidence)}% confiance)`, 'success');
            
            // Passer à l'étape suivante
            setTimeout(() => nextStep(), 1500);
            
        } catch (error) {
            console.error('❌ Erreur OCR:', error);
            document.getElementById('ocr-processing').style.display = 'none';
            showNotification('Erreur OCR, continuez manuellement', 'warning');
            setTimeout(() => nextStep(), 1000);
        }
    }
    
    // Extraire données OCR
    function extractDataFromOCR(text, confidence) {
        const data = {
            raw_text: text,
            confidence: confidence,
            extracted: {}
        };
        
        // Extraire montant
        const amountMatches = text.match(config.ocrConfig.patterns.amount);
        if (amountMatches) {
            const amountStr = amountMatches[0].replace(/[^\d\.,]/g, '');
            data.extracted.amount = parseFloat(amountStr.replace(',', '.'));
        }
        
        // Extraire date
        const dateMatches = text.match(config.ocrConfig.patterns.date);
        if (dateMatches) {
            data.extracted.date = parseSwissDate(dateMatches[0]);
        }
        
        // Extraire marchand
        const lines = text.split('\n').filter(line => line.trim().length > 3);
        if (lines.length > 0) {
            data.extracted.merchant = lines[0].trim();
        }
        
        // Détecter TVA
        data.extracted.has_vat = config.ocrConfig.patterns.vat.test(text);
        
        return data;
    }
    
    // Parser date suisse
    function parseSwissDate(dateStr) {
        const parts = dateStr.split(/[\.\/\-]/);
        if (parts.length === 3) {
            const day = parts[0].padStart(2, '0');
            const month = parts[1].padStart(2, '0');
            let year = parts[2];
            
            if (year.length === 2) {
                year = '20' + year;
            }
            
            return `${year}-${month}-${day}`;
        }
        return new Date().toISOString().split('T')[0];
    }
    
    // Suggérer catégorie basée sur IA
    function suggestCategory(text, extractedData) {
        const lowerText = text.toLowerCase();
        
        // Analyser mots-clés par catégorie
        let bestMatch = null;
        let bestScore = 0;
        
        Object.entries(config.categories).forEach(([category, data]) => {
            let score = 0;
            
            data.keywords.forEach(keyword => {
                if (lowerText.includes(keyword.toLowerCase())) {
                    score += 1;
                }
            });
            
            // Bonus pour marchand
            if (extractedData.extracted.merchant) {
                const merchant = extractedData.extracted.merchant.toLowerCase();
                data.keywords.forEach(keyword => {
                    if (merchant.includes(keyword.toLowerCase())) {
                        score += 2;
                    }
                });
            }
            
            if (score > bestScore) {
                bestScore = score;
                bestMatch = category;
            }
        });
        
        return bestMatch;
    }
    
    // Gérer sélection catégorie
    function handleCategorySelection(element) {
        // Enlever sélection précédente
        document.querySelector('.category-option.selected')?.classList.remove('selected');
        
        // Ajouter nouvelle sélection
        element.classList.add('selected');
        
        const category = element.dataset.category;
        const categoryData = config.categories[category];
        
        // Afficher/masquer champs selon catégorie
        if (categoryData.requires_participants) {
            document.getElementById('participants-section').style.display = 'block';
        } else {
            document.getElementById('participants-section').style.display = 'none';
        }
        
        updateValidationPreview();
    }
    
    // Pré-remplir formulaire depuis OCR
    function populateFormFromOCR(data) {
        if (!data || !data.extracted) return;
        
        // Montant
        if (data.extracted.amount) {
            document.getElementById('expense-amount').value = data.extracted.amount;
        }
        
        // Date
        if (data.extracted.date) {
            document.getElementById('expense-date').value = data.extracted.date;
        }
        
        // Marchand dans description
        if (data.extracted.merchant) {
            document.getElementById('expense-description').value = `Dépense chez ${data.extracted.merchant}`;
        }
        
        // Sélectionner catégorie suggérée
        if (data.suggested_category) {
            const categoryEl = document.querySelector(`[data-category="${data.suggested_category}"]`);
            if (categoryEl) {
                handleCategorySelection(categoryEl);
            }
        }
    }
    
    // Mettre à jour preview validation
    function updateValidationPreview() {
        const amount = parseFloat(document.getElementById('expense-amount')?.value) || 0;
        const badge = document.getElementById('validation-badge');
        const text = document.getElementById('validation-text');
        const details = document.getElementById('validation-details');
        
        if (!badge || !text || !details) return;
        
        if (amount <= config.validationThresholds.auto_approve) {
            badge.className = 'validation-badge auto-approved';
            text.textContent = 'Validation automatique';
            details.textContent = `Cette dépense sera automatiquement approuvée (≤ ${config.validationThresholds.auto_approve} CHF)`;
        } else if (amount <= config.validationThresholds.manager_approval) {
            badge.className = 'validation-badge manager-required';
            text.textContent = 'Validation manager';
            details.textContent = 'Cette dépense nécessite l\'approbation d\'un manager';
        } else {
            badge.className = 'validation-badge manager-required';
            text.textContent = 'Validation direction';
            details.textContent = 'Cette dépense nécessite l\'approbation de la direction';
        }
    }
    
    // Mettre à jour tags participants
    function updateParticipantTags() {
        const input = document.getElementById('expense-participants');
        const container = document.getElementById('participant-tags');
        
        if (!input || !container) return;
        
        const participants = input.value.split(',').map(p => p.trim()).filter(p => p);
        
        container.innerHTML = participants.map(participant => `
            <span class="participant-tag">
                ${participant}
                <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="14" height="14" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <path d="M18 6l-12 12" />
                    <path d="M6 6l12 12" />
                </svg>
            </span>
        `).join('');
    }
    
    // Sauvegarder dépense
    async function saveExpense(isDraft = false) {
        try {
            const expenseData = collectExpenseData(isDraft);
            if (!expenseData) return;
            
            // Détection de doublons
            if (await detectDuplicate(expenseData)) {
                if (!confirm('Une dépense similaire existe déjà. Continuer ?')) {
                    return;
                }
            }
            
            // Générer ID
            expenseData.expense_id = `EXP-2025-${state.nextExpenseNumber.toString().padStart(3, '0')}`;
            state.nextExpenseNumber++;
            
            // Ajouter géolocalisation si disponible
            if (state.geolocation) {
                expenseData.location = {
                    latitude: state.geolocation.latitude,
                    longitude: state.geolocation.longitude,
                    address: await reverseGeocode(state.geolocation.latitude, state.geolocation.longitude)
                };
            }
            
            // Ajouter à la liste
            state.expenses.unshift(expenseData);
            
            // Logger l'action
            await window.AuthSuperadmin.logAuditEvent('EXPENSE_CREATED', {
                expenseId: expenseData.expense_id,
                amount: expenseData.amount,
                category: expenseData.category,
                isDraft: isDraft
            });
            
            // Mettre à jour interface
            updateTotals();
            renderExpensesList();
            populateEmployeeFilter();
            
            showNotification(`Dépense ${isDraft ? 'sauvegardée en brouillon' : 'soumise'} avec succès`, 'success');
            
            // Fermer modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('newExpenseModal'));
            if (modal) modal.hide();
            
        } catch (error) {
            console.error('❌ Erreur sauvegarde dépense:', error);
            showNotification('Erreur lors de la sauvegarde', 'error');
        }
    }
    
    // Collecter données formulaire
    function collectExpenseData(isDraft) {
        const form = document.getElementById('newExpenseForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return null;
        }
        
        // Catégorie sélectionnée
        const selectedCategory = document.querySelector('.category-option.selected');
        if (!selectedCategory) {
            showNotification('Veuillez sélectionner une catégorie', 'error');
            return null;
        }
        
        const amount = parseFloat(document.getElementById('expense-amount').value);
        const category = selectedCategory.dataset.category;
        
        // Calculer TVA (approximation 7.7%)
        const vatIncluded = amount * 0.077;
        
        const expenseData = {
            type: "expense_report",
            employee: {
                name: state.currentUser.name,
                employee_id: "EMP-002", // Paul Martin par défaut
                entity: document.getElementById('expense-entity').value,
                department: "Direction"
            },
            date: document.getElementById('expense-date').value,
            amount: amount,
            vat_included: vatIncluded,
            currency: "CHF",
            category: category,
            subcategory: config.categories[category].subcategories[0],
            description: document.getElementById('expense-description').value,
            payment_method: document.getElementById('payment-method').value,
            project_id: document.getElementById('expense-project').value || null,
            status: isDraft ? "draft" : "submitted",
            validation: {},
            reimbursement_status: config.paymentMethods[document.getElementById('payment-method').value]?.requires_reimbursement ? "pending" : "not_required",
            created_at: new Date().toISOString()
        };
        
        // Participants si repas d'affaires
        const participants = document.getElementById('expense-participants')?.value;
        if (participants) {
            expenseData.participants = participants.split(',').map(p => p.trim()).filter(p => p);
        }
        
        // Validation automatique
        if (amount <= config.validationThresholds.auto_approve && !isDraft) {
            expenseData.status = "approved";
            expenseData.validation = {
                auto_approved: true,
                approved_by: "system",
                approved_date: new Date().toISOString(),
                comments: null
            };
            expenseData.submitted_at = new Date().toISOString();
        } else if (!isDraft) {
            expenseData.validation = {
                auto_approved: false,
                approved_by: null,
                approved_date: null,
                comments: amount > config.validationThresholds.manager_approval ? 
                    "Validation direction requise" : "Validation manager requise"
            };
            expenseData.submitted_at = new Date().toISOString();
        }
        
        // Données OCR si disponibles
        if (state.currentExpense) {
            expenseData.ocr_data = state.currentExpense;
            expenseData.receipts = [{
                file_name: `receipt_${Date.now()}.jpg`,
                ocr_extracted: true,
                merchant: state.currentExpense.extracted?.merchant || "Marchand détecté",
                confidence: state.currentExpense.confidence || 0.8
            }];
        }
        
        return expenseData;
    }
    
    // Détecter doublons
    async function detectDuplicate(newExpense) {
        const threshold = 0.85; // Seuil de similarité
        
        return state.expenses.some(existing => {
            if (existing.employee.employee_id !== newExpense.employee.employee_id) return false;
            if (existing.date !== newExpense.date) return false;
            if (Math.abs(existing.amount - newExpense.amount) > 5) return false;
            
            return true;
        });
    }
    
    // Géocodage inverse
    async function reverseGeocode(lat, lng) {
        try {
            // Simulation - En production : utiliser API Nominatim ou Google Maps
            if (Math.abs(lat - 46.5197) < 0.1 && Math.abs(lng - 6.6323) < 0.1) {
                return "Genève, Suisse";
            }
            return "Localisation détectée";
        } catch (error) {
            return "Position inconnue";
        }
    }
    
    // Rendre liste des dépenses
    function renderExpensesList() {
        const container = document.getElementById('expenses-list');
        const emptyState = document.getElementById('empty-state');
        
        if (!container) return;
        
        const filteredExpenses = applyFilters();
        
        if (filteredExpenses.length === 0) {
            container.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }
        
        emptyState.style.display = 'none';
        
        const html = filteredExpenses.map(expense => renderExpenseCard(expense)).join('');
        container.innerHTML = html;
        
        // Attacher événements cartes
        attachCardEventListeners();
    }
    
    // Rendre carte dépense
    function renderExpenseCard(expense) {
        const category = config.categories[expense.category];
        const statusLabel = config.statuses[expense.status];
        const paymentMethod = config.paymentMethods[expense.payment_method];
        
        return `
            <div class="expense-card slide-up" data-expense-id="${expense.expense_id}">
                <div class="expense-header">
                    <div class="expense-icon" style="background: ${category.color}">
                        ${category.icon}
                    </div>
                    <div class="flex-fill">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <div class="fw-bold">${expense.description}</div>
                                <div class="text-muted small">
                                    ${expense.employee.name} • ${formatDate(expense.date)}
                                    ${expense.project_id ? ` • ${expense.project_id}` : ''}
                                </div>
                                ${expense.participants ? `
                                    <div class="participant-tags mt-1">
                                        ${expense.participants.map(p => `<span class="participant-tag">${p}</span>`).join('')}
                                    </div>
                                ` : ''}
                            </div>
                            <div class="text-end">
                                <div class="expense-amount">${formatSwissAmount(expense.amount)} CHF</div>
                                <div class="small text-muted">${paymentMethod.icon} ${paymentMethod.label}</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="d-flex justify-content-between align-items-center mt-2">
                    <div class="d-flex align-items-center gap-2">
                        <span class="expense-status status-${expense.status}">${statusLabel}</span>
                        ${expense.validation?.auto_approved ? '<span class="validation-badge auto-approved">Auto</span>' : ''}
                        ${expense.location ? '<span class="text-muted">📍</span>' : ''}
                    </div>
                    <div class="d-flex gap-1">
                        <button class="btn btn-sm btn-outline-primary view-expense" data-id="${expense.expense_id}">
                            <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="16" height="16" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                <path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
                                <path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6" />
                            </svg>
                        </button>
                        ${expense.status === 'submitted' ? `
                            <button class="btn btn-sm btn-success approve-expense" data-id="${expense.expense_id}">
                                <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="16" height="16" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none">
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                    <path d="M5 12l5 5l10 -10" />
                                </svg>
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }
    
    // Attacher événements cartes
    function attachCardEventListeners() {
        document.querySelectorAll('.view-expense').forEach(btn => {
            btn.addEventListener('click', function() {
                const expenseId = this.dataset.id;
                viewExpenseDetails(expenseId);
            });
        });
        
        document.querySelectorAll('.approve-expense').forEach(btn => {
            btn.addEventListener('click', function() {
                const expenseId = this.dataset.id;
                approveExpense(expenseId);
            });
        });
    }
    
    // Voir détails dépense
    function viewExpenseDetails(expenseId) {
        const expense = state.expenses.find(exp => exp.expense_id === expenseId);
        if (!expense) return;
        
        const modal = document.getElementById('expenseDetailsModal');
        const content = document.getElementById('expense-details-content');
        
        if (!modal || !content) return;
        
        content.innerHTML = generateExpenseDetailsHTML(expense);
        
        new bootstrap.Modal(modal).show();
    }
    
    // Générer HTML détails
    function generateExpenseDetailsHTML(expense) {
        const category = config.categories[expense.category];
        const paymentMethod = config.paymentMethods[expense.payment_method];
        
        return `
            <div class="row">
                <div class="col-md-6">
                    <h5>Informations générales</h5>
                    <table class="table table-sm">
                        <tr><td><strong>ID:</strong></td><td>${expense.expense_id}</td></tr>
                        <tr><td><strong>Employé:</strong></td><td>${expense.employee.name}</td></tr>
                        <tr><td><strong>Entité:</strong></td><td>${expense.employee.entity}</td></tr>
                        <tr><td><strong>Date:</strong></td><td>${formatDate(expense.date)}</td></tr>
                        <tr><td><strong>Catégorie:</strong></td><td>${category.icon} ${expense.category}</td></tr>
                        <tr><td><strong>Paiement:</strong></td><td>${paymentMethod.icon} ${paymentMethod.label}</td></tr>
                    </table>
                </div>
                <div class="col-md-6">
                    <h5>Montants</h5>
                    <table class="table table-sm">
                        <tr><td>Montant HT:</td><td class="text-end">${formatSwissAmount(expense.amount - expense.vat_included)} CHF</td></tr>
                        <tr><td>TVA:</td><td class="text-end">${formatSwissAmount(expense.vat_included)} CHF</td></tr>
                        <tr class="fw-bold"><td>Total TTC:</td><td class="text-end">${formatSwissAmount(expense.amount)} CHF</td></tr>
                        <tr><td>Statut:</td><td><span class="expense-status status-${expense.status}">${config.statuses[expense.status]}</span></td></tr>
                    </table>
                </div>
            </div>
            
            <div class="row mt-3">
                <div class="col-12">
                    <h5>Description</h5>
                    <p>${expense.description}</p>
                    
                    ${expense.participants ? `
                        <h5>Participants</h5>
                        <div class="participant-tags">
                            ${expense.participants.map(p => `<span class="participant-tag">${p}</span>`).join('')}
                        </div>
                    ` : ''}
                    
                    ${expense.location ? `
                        <h5>Localisation</h5>
                        <p>📍 ${expense.location.address}</p>
                    ` : ''}
                    
                    ${expense.validation?.comments ? `
                        <h5>Validation</h5>
                        <p>${expense.validation.comments}</p>
                    ` : ''}
                </div>
            </div>
        `;
    }
    
    // Approuver dépense
    async function approveExpense(expenseId) {
        try {
            const expense = state.expenses.find(exp => exp.expense_id === expenseId);
            if (!expense) return;
            
            if (!confirm(`Approuver la dépense de ${formatSwissAmount(expense.amount)} CHF ?`)) {
                return;
            }
            
            expense.status = "approved";
            expense.validation.approved_by = state.currentUser.name;
            expense.validation.approved_date = new Date().toISOString();
            
            await window.AuthSuperadmin.logAuditEvent('EXPENSE_APPROVED', {
                expenseId: expense.expense_id,
                amount: expense.amount,
                approvedBy: state.currentUser.name
            });
            
            renderExpensesList();
            updateTotals();
            
            showNotification('Dépense approuvée avec succès', 'success');
            
        } catch (error) {
            console.error('❌ Erreur approbation dépense:', error);
            showNotification('Erreur lors de l\'approbation', 'error');
        }
    }
    
    // Appliquer filtres
    function applyFilters() {
        let filtered = [...state.expenses];
        
        // Filtre par statut
        if (state.filters.status) {
            filtered = filtered.filter(exp => exp.status === state.filters.status);
        }
        
        // Filtre par période
        const now = new Date();
        switch (state.filters.period) {
            case 'week':
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                filtered = filtered.filter(exp => new Date(exp.date) >= weekAgo);
                break;
            case 'month':
                filtered = filtered.filter(exp => {
                    const expDate = new Date(exp.date);
                    return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
                });
                break;
            case 'quarter':
                const quarter = Math.floor(now.getMonth() / 3);
                filtered = filtered.filter(exp => {
                    const expDate = new Date(exp.date);
                    return Math.floor(expDate.getMonth() / 3) === quarter && expDate.getFullYear() === now.getFullYear();
                });
                break;
            case 'year':
                filtered = filtered.filter(exp => new Date(exp.date).getFullYear() === now.getFullYear());
                break;
        }
        
        // Filtre par catégorie
        if (state.filters.category) {
            filtered = filtered.filter(exp => exp.category === state.filters.category);
        }
        
        // Filtre par employé
        if (state.filters.employee) {
            filtered = filtered.filter(exp => exp.employee.employee_id === state.filters.employee);
        }
        
        // Mettre à jour compteur
        document.getElementById('filtered-count').textContent = filtered.length;
        
        return filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
    
    // Mettre à jour totaux
    function updateTotals() {
        const now = new Date();
        
        // Ce mois
        const thisMonth = state.expenses.filter(exp => {
            const expDate = new Date(exp.date);
            return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
        });
        
        state.totals.month = thisMonth.reduce((sum, exp) => sum + exp.amount, 0);
        state.totals.pending = state.expenses.filter(exp => exp.status === 'submitted').reduce((sum, exp) => sum + exp.amount, 0);
        state.totals.toReimburse = state.expenses.filter(exp => exp.reimbursement_status === 'pending').reduce((sum, exp) => sum + exp.amount, 0);
        state.totals.count = state.expenses.length;
        
        // Afficher
        document.getElementById('total-month').textContent = `CHF ${formatSwissAmount(state.totals.month)}`;
        document.getElementById('total-pending').textContent = `CHF ${formatSwissAmount(state.totals.pending)}`;
        document.getElementById('total-to-reimburse').textContent = `CHF ${formatSwissAmount(state.totals.toReimburse)}`;
        document.getElementById('expenses-count').textContent = state.totals.count;
    }
    
    // Peupler filtre employés
    function populateEmployeeFilter() {
        const select = document.getElementById('filter-employee');
        if (!select) return;
        
        select.innerHTML = '<option value="">Tous les employés</option>';
        state.employees.forEach(emp => {
            const option = document.createElement('option');
            option.value = emp.employee_id;
            option.textContent = emp.name;
            select.appendChild(option);
        });
    }
    
    // Effacer filtres
    function clearFilters() {
        Object.keys(state.filters).forEach(key => {
            state.filters[key] = key === 'period' ? 'month' : '';
            const element = document.getElementById(`filter-${key}`);
            if (element) element.value = state.filters[key];
        });
        renderExpensesList();
    }
    
    // Import transactions Revolut
    async function importRevolutTransactions() {
        try {
            // Simulation import Revolut - En production: API call
            const mockTransactions = [
                {
                    id: "txn_123",
                    date: "2025-01-22",
                    merchant: "Apple Store Geneva",
                    amount: 1299.00,
                    card_last_digits: "4242",
                    status: "completed",
                    category_suggestion: "Matériel/Fournitures"
                }
            ];
            
            showNotification(`${mockTransactions.length} transaction(s) Revolut importée(s)`, 'success');
            
        } catch (error) {
            console.error('❌ Erreur import Revolut:', error);
            showNotification('Erreur lors de l\'import Revolut', 'error');
        }
    }
    
    // Export dépenses
    function exportExpenses() {
        try {
            const exportData = state.expenses.map(expense => ({
                'ID': expense.expense_id,
                'Employé': expense.employee.name,
                'Date': formatDate(expense.date),
                'Catégorie': expense.category,
                'Montant': expense.amount,
                'TVA': expense.vat_included,
                'Description': expense.description,
                'Statut': config.statuses[expense.status],
                'Paiement': config.paymentMethods[expense.payment_method].label
            }));
            
            const csv = convertToCSV(exportData);
            
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `notes_de_frais_${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
            
            showNotification('Export généré avec succès', 'success');
            
        } catch (error) {
            console.error('❌ Erreur export:', error);
            showNotification('Erreur lors de l\'export', 'error');
        }
    }
    
    // Ouvrir analytics
    function openAnalytics() {
        const modal = document.getElementById('analyticsModal');
        const content = document.getElementById('analytics-content');
        
        if (!modal || !content) return;
        
        content.innerHTML = generateAnalyticsHTML();
        
        new bootstrap.Modal(modal).show();
    }
    
    // Générer analytics HTML
    function generateAnalyticsHTML() {
        // Calculer stats par catégorie
        const categoryStats = {};
        state.expenses.forEach(expense => {
            if (!categoryStats[expense.category]) {
                categoryStats[expense.category] = {
                    count: 0,
                    total: 0,
                    icon: config.categories[expense.category].icon
                };
            }
            categoryStats[expense.category].count++;
            categoryStats[expense.category].total += expense.amount;
        });
        
        return `
            <div class="row">
                <div class="col-12">
                    <h4>Dépenses par catégorie</h4>
                    <div class="table-responsive">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Catégorie</th>
                                    <th class="text-center">Nombre</th>
                                    <th class="text-end">Total</th>
                                    <th class="text-end">Moyenne</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${Object.entries(categoryStats).map(([category, stats]) => `
                                    <tr>
                                        <td>${stats.icon} ${category}</td>
                                        <td class="text-center">${stats.count}</td>
                                        <td class="text-end">${formatSwissAmount(stats.total)} CHF</td>
                                        <td class="text-end">${formatSwissAmount(stats.total / stats.count)} CHF</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
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
    
    // Interface publique
    return {
        init,
        loadExpenses,
        saveExpense,
        approveExpense,
        getExpenses: () => state.expenses,
        getTotals: () => state.totals
    };
    
})();