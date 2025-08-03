// finances-notion.js - Intégration Notion pour la page des finances
// Ce fichier remplace les données mockées par de vraies données Notion

const FinancesNotion = {
    // Initialisation
    init() {
        console.log('🔌 Initialisation de la page finances avec Notion');
        this.loadFinances();
        this.attachEventListeners();
    },
    
    // Attacher les écouteurs d'événements
    attachEventListeners() {
        // Filtres
        document.querySelectorAll('[data-filter-finance]').forEach(filter => {
            filter.addEventListener('change', () => this.applyFilters());
        });
        
        // Bouton de rafraîchissement
        const refreshBtn = document.getElementById('refresh-finances');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadFinances());
        }
        
        // Période de vue
        const periodSelector = document.getElementById('period-selector');
        if (periodSelector) {
            periodSelector.addEventListener('change', (e) => this.changePeriod(e.target.value));
        }
    },
    
    // Charger les données financières depuis Notion
    async loadFinances() {
        try {
            // Récupérer l'utilisateur connecté
            const currentUser = window.AuthNotionModule?.getCurrentUser();
            if (!currentUser) {
                console.warn('Utilisateur non connecté');
                window.location.href = '/portal-project/login.html';
                return;
            }
            
            // Vérifier les permissions pour voir les finances
            const canViewFinances = await window.PermissionsNotion.checkPermission(
                currentUser.id,
                'finances',
                'view.own'
            );
            
            if (!canViewFinances) {
                window.showNotification('Accès non autorisé aux données financières', 'error');
                window.location.href = `/${currentUser.role}/dashboard.html`;
                return;
            }
            
            // Afficher le loader
            this.showLoadingState();
            
            // Charger les données financières avec le middleware sécurisé
            const financesData = await window.PermissionsMiddleware.secureApiCall(
                'finances',
                'view',
                window.NotionConnector.client.getClientFinances.bind(window.NotionConnector.client),
                currentUser.id
            );
            
            // Charger les projets pour enrichir les données
            const projects = await window.PermissionsMiddleware.secureApiCall(
                'projects',
                'view',
                window.NotionConnector.client.getClientProjects.bind(window.NotionConnector.client),
                currentUser.id
            );
            
            // Vérifier que le client ne voit que ses propres données
            if (currentUser.role === 'client') {
                // Filtrer pour s'assurer que seules les données du client sont visibles
                financesData.invoices = financesData.invoices.filter(inv => inv.clientId === currentUser.id);
                financesData.quotes = financesData.quotes.filter(quote => quote.clientId === currentUser.id);
            }
            
            // Enrichir les données financières avec les infos des projets
            const enrichedData = this.enrichFinanceData(financesData, projects);
            
            // Mettre à jour l'interface
            this.updateFinanceView(enrichedData);
            this.updateFinanceStats(enrichedData);
            this.updateCharts(enrichedData);
            
            // Stocker les données pour les filtres
            this.currentFinanceData = enrichedData;
            
            // Cacher le loader
            this.hideLoadingState();
            
            // Logger l'accès
            await window.PermissionsNotion.logAccess('view', 'finances', true, {
                invoiceCount: financesData.invoices.length,
                quoteCount: financesData.quotes.length,
                totalAmount: financesData.totals?.revenue || 0
            });
            
        } catch (error) {
            console.error('Erreur lors du chargement des finances:', error);
            this.showErrorState();
            
            if (window.PermissionsNotion) {
                await window.PermissionsNotion.logAccess('view', 'finances', false, {
                    error: error.message
                });
            }
        }
    },
    
    // Enrichir les données financières
    enrichFinanceData(financesData, projects) {
        // Créer une map des projets pour accès rapide
        const projectsMap = new Map();
        projects.forEach(p => projectsMap.set(p.id, p));
        
        // Enrichir les factures
        const enrichedInvoices = financesData.invoices.map(invoice => ({
            ...invoice,
            projectName: projectsMap.get(invoice.projectId)?.name || 'Projet inconnu',
            projectStatus: projectsMap.get(invoice.projectId)?.status || 'Inconnu',
            daysOverdue: this.calculateDaysOverdue(invoice.date, invoice.status)
        }));
        
        // Enrichir les devis
        const enrichedQuotes = financesData.quotes.map(quote => ({
            ...quote,
            projectName: projectsMap.get(quote.projectId)?.name || 'Projet inconnu',
            projectStatus: projectsMap.get(quote.projectId)?.status || 'Inconnu'
        }));
        
        // Calculer les données mensuelles pour les graphiques
        const monthlyData = this.calculateMonthlyData(enrichedInvoices);
        
        return {
            ...financesData,
            invoices: enrichedInvoices,
            quotes: enrichedQuotes,
            monthlyData: monthlyData,
            projects: projects
        };
    },
    
    // Calculer les jours de retard
    calculateDaysOverdue(dueDate, status) {
        if (status !== 'En attente') return 0;
        
        const due = new Date(dueDate);
        const today = new Date();
        const diffTime = today - due;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays > 0 ? diffDays : 0;
    },
    
    // Calculer les données mensuelles
    calculateMonthlyData(invoices) {
        const currentYear = new Date().getFullYear();
        const monthlyTotals = Array(12).fill(0);
        
        invoices.forEach(invoice => {
            const invoiceDate = new Date(invoice.date);
            if (invoiceDate.getFullYear() === currentYear) {
                const month = invoiceDate.getMonth();
                monthlyTotals[month] += invoice.amount || 0;
            }
        });
        
        return monthlyTotals;
    },
    
    // Mettre à jour la vue des finances
    updateFinanceView(data) {
        // Mettre à jour la liste des factures
        this.updateInvoicesList(data.invoices);
        
        // Mettre à jour la liste des devis
        this.updateQuotesList(data.quotes);
    },
    
    // Mettre à jour la liste des factures
    updateInvoicesList(invoices) {
        const container = document.getElementById('invoices-list');
        if (!container) return;
        
        if (invoices.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-muted py-4">
                        Aucune facture trouvée
                    </td>
                </tr>
            `;
            return;
        }
        
        container.innerHTML = invoices.map(invoice => `
            <tr>
                <td>
                    <div class="font-weight-medium">${invoice.number}</div>
                    <div class="text-muted small">${window.NotionConnector.utils.formatDate(invoice.date)}</div>
                </td>
                <td>
                    <div>${invoice.projectName}</div>
                    <div class="text-muted small">Facture ${invoice.number}</div>
                </td>
                <td class="text-end">
                    <div class="font-weight-medium">
                        ${window.NotionConnector.utils.formatCurrency(invoice.amount)}
                    </div>
                </td>
                <td>
                    <span class="badge ${this.getInvoiceStatusClass(invoice.status)}">
                        ${this.getInvoiceStatusLabel(invoice.status)}
                    </span>
                    ${invoice.daysOverdue > 0 ? `
                        <div class="text-danger small mt-1">
                            ${invoice.daysOverdue} jours de retard
                        </div>
                    ` : ''}
                </td>
                <td>
                    ${window.NotionConnector.utils.formatDate(invoice.date)}
                </td>
                <td class="text-end">
                    <div class="btn-list flex-nowrap">
                        <a href="invoice-detail.html?id=${invoice.id}" 
                           class="btn btn-sm btn-icon btn-ghost-secondary"
                           data-bs-toggle="tooltip" 
                           title="Voir la facture">
                            <i class="ti ti-eye"></i>
                        </a>
                        <button class="btn btn-sm btn-icon btn-ghost-secondary"
                                onclick="FinancesNotion.downloadInvoice('${invoice.id}')"
                                data-bs-toggle="tooltip" 
                                title="Télécharger PDF">
                            <i class="ti ti-download"></i>
                        </button>
                        ${invoice.status === 'En attente' ? `
                            <a href="payment.html?invoice=${invoice.id}" 
                               class="btn btn-sm btn-icon btn-ghost-success"
                               data-bs-toggle="tooltip" 
                               title="Payer">
                                <i class="ti ti-credit-card"></i>
                            </a>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `).join('');
        
        // Réinitialiser les tooltips
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    },
    
    // Mettre à jour la liste des devis
    updateQuotesList(quotes) {
        const container = document.getElementById('quotes-list');
        if (!container) return;
        
        if (quotes.length === 0) {
            container.innerHTML = `
                <div class="text-center text-muted py-4">
                    Aucun devis trouvé
                </div>
            `;
            return;
        }
        
        container.innerHTML = quotes.map(quote => `
            <div class="list-group-item">
                <div class="row align-items-center">
                    <div class="col-auto">
                        <span class="badge ${this.getQuoteStatusClass(quote.status)}">
                            ${quote.status}
                        </span>
                    </div>
                    <div class="col">
                        <div class="font-weight-medium">${quote.number}</div>
                        <div class="text-muted small">${quote.projectName}</div>
                    </div>
                    <div class="col-auto">
                        <div class="font-weight-medium">
                            ${window.NotionConnector.utils.formatCurrency(quote.amount)}
                        </div>
                        <div class="text-muted small">
                            ${window.NotionConnector.utils.formatDate(quote.date)}
                        </div>
                    </div>
                    <div class="col-auto">
                        <a href="#" class="btn btn-sm btn-ghost-secondary"
                           onclick="FinancesNotion.viewQuote('${quote.id}'); return false;">
                            <i class="ti ti-eye"></i>
                        </a>
                    </div>
                </div>
            </div>
        `).join('');
    },
    
    // Mettre à jour les statistiques
    updateFinanceStats(data) {
        const stats = data.totals || {};
        
        // Mettre à jour les KPIs
        const updateStat = (id, value) => {
            const element = document.getElementById(id);
            if (element) {
                if (typeof value === 'number') {
                    element.textContent = window.NotionConnector.utils.formatCurrency(value);
                } else {
                    element.textContent = value;
                }
            }
        };
        
        updateStat('total-invoiced', stats.totalInvoiced || 0);
        updateStat('total-paid', stats.totalPaid || 0);
        updateStat('total-pending', stats.totalPending || 0);
        updateStat('total-quoted', stats.totalQuoted || 0);
        
        // Calculer et afficher le taux de paiement
        const paymentRate = stats.totalInvoiced > 0 
            ? Math.round((stats.totalPaid / stats.totalInvoiced) * 100)
            : 0;
        updateStat('payment-rate', `${paymentRate}%`);
        
        // Mettre à jour la barre de progression
        const progressBar = document.querySelector('#payment-progress');
        if (progressBar) {
            progressBar.style.width = `${paymentRate}%`;
        }
    },
    
    // Mettre à jour les graphiques
    updateCharts(data) {
        // Graphique d'évolution mensuelle
        if (window.spendingChart) {
            const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
            const currentMonth = new Date().getMonth();
            
            window.spendingChart.updateOptions({
                xaxis: {
                    categories: months
                }
            });
            
            window.spendingChart.updateSeries([{
                name: 'Facturé',
                data: data.monthlyData
            }]);
        }
        
        // Graphique par catégorie
        if (window.categoryChart) {
            // Calculer la répartition par type de projet
            const categoryTotals = {};
            data.invoices.forEach(invoice => {
                const category = invoice.projectName || 'Autres';
                categoryTotals[category] = (categoryTotals[category] || 0) + invoice.amount;
            });
            
            const categories = Object.keys(categoryTotals);
            const values = Object.values(categoryTotals);
            
            window.categoryChart.updateOptions({
                labels: categories
            });
            
            window.categoryChart.updateSeries(values);
        }
    },
    
    // Obtenir la classe CSS pour le statut de facture
    getInvoiceStatusClass(status) {
        const statusClasses = {
            'Payée': 'badge-success',
            'En attente': 'badge-warning',
            'En retard': 'badge-danger',
            'Annulée': 'badge-secondary'
        };
        return statusClasses[status] || 'badge-secondary';
    },
    
    // Obtenir le label pour le statut
    getInvoiceStatusLabel(status) {
        return status || 'Non défini';
    },
    
    // Obtenir la classe CSS pour le statut de devis
    getQuoteStatusClass(status) {
        const statusClasses = {
            'Accepté': 'badge-success',
            'En attente': 'badge-warning',
            'Refusé': 'badge-danger',
            'Expiré': 'badge-secondary'
        };
        return statusClasses[status] || 'badge-secondary';
    },
    
    // Actions
    async downloadInvoice(invoiceId) {
        // TODO: Implémenter le téléchargement depuis Notion
        if (window.showNotification) {
            window.showNotification('Téléchargement de la facture...', 'info');
        }
    },
    
    async viewQuote(quoteId) {
        // TODO: Implémenter la vue détaillée
        if (window.showNotification) {
            window.showNotification('Ouverture du devis...', 'info');
        }
    },
    
    // Appliquer les filtres
    applyFilters() {
        if (!this.currentFinanceData) return;
        
        const statusFilter = document.getElementById('filter-invoice-status')?.value || 'all';
        const projectFilter = document.getElementById('filter-invoice-project')?.value || 'all';
        
        let filteredInvoices = [...this.currentFinanceData.invoices];
        
        // Filtrer par statut
        if (statusFilter !== 'all') {
            filteredInvoices = filteredInvoices.filter(invoice => 
                invoice.status === statusFilter
            );
        }
        
        // Filtrer par projet
        if (projectFilter !== 'all') {
            filteredInvoices = filteredInvoices.filter(invoice => 
                invoice.projectId === projectFilter
            );
        }
        
        // Mettre à jour la vue
        this.updateInvoicesList(filteredInvoices);
    },
    
    // Changer la période
    changePeriod(period) {
        console.log('Changement de période:', period);
        // TODO: Implémenter le filtrage par période
        this.loadFinances();
    },
    
    // États de chargement
    showLoadingState() {
        const containers = ['invoices-list', 'quotes-list'];
        containers.forEach(id => {
            const container = document.getElementById(id);
            if (container) {
                container.innerHTML = `
                    <tr>
                        <td colspan="6" class="text-center py-4">
                            <div class="spinner-border text-primary" role="status">
                                <span class="visually-hidden">Chargement...</span>
                            </div>
                        </td>
                    </tr>
                `;
            }
        });
    },
    
    hideLoadingState() {
        // Le contenu est remplacé par les fonctions update
    },
    
    showErrorState() {
        if (window.showNotification) {
            window.showNotification('Erreur lors du chargement des données financières', 'error');
        }
        this.hideLoadingState();
    }
};

// Auto-initialisation
document.addEventListener('DOMContentLoaded', () => {
    // Vérifier qu'on est sur la page des finances
    if (window.location.pathname.includes('finances.html')) {
        // Attendre que NotionConnector soit prêt
        const checkNotionConnector = setInterval(() => {
            if (window.NotionConnector && window.AuthNotionModule) {
                clearInterval(checkNotionConnector);
                FinancesNotion.init();
            }
        }, 100);
    }
});

// Export global
window.FinancesNotion = FinancesNotion;