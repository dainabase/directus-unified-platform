// commissions-notion.js - Intégration Notion pour la gestion des commissions revendeur
// Ce fichier gère la connexion avec les bases de données Notion pour les commissions

const CommissionsNotion = {
    // Configuration
    DB_IDS: {
        COMMISSIONS: '236adb95-3c6f-80c0-9751-fcf5dfe35564',
        VENTES: '236adb95-3c6f-8018-b3ba-fa5c85c9e9e6',
        CONTRATS: '236adb95-3c6f-8024-94b1-ef0928d5c8a9'
    },
    
    // État local
    allCommissions: [],
    currentPeriod: 'month',
    currentView: 'table', // table, chart, summary
    
    // Initialisation
    init() {
        console.log('🔌 Initialisation de la gestion des commissions avec Notion');
        this.loadCommissions();
        this.attachEventListeners();
    },
    
    // Attacher les écouteurs d'événements
    attachEventListeners() {
        // Sélecteur de période
        const periodSelector = document.getElementById('period-selector');
        if (periodSelector) {
            periodSelector.addEventListener('change', (e) => {
                this.currentPeriod = e.target.value;
                this.loadCommissions();
            });
        }
        
        // Changement de vue
        document.querySelectorAll('[data-view-type]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchView(e.target.dataset.viewType);
            });
        });
        
        // Bouton de rafraîchissement
        const refreshBtn = document.getElementById('refresh-commissions');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadCommissions());
        }
        
        // Export
        const exportBtn = document.getElementById('export-commissions');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportCommissions());
        }
    },
    
    // Charger les commissions depuis Notion
    async loadCommissions() {
        try {
            // Récupérer l'utilisateur connecté
            const currentUser = window.AuthNotionModule?.getCurrentUser();
            if (!currentUser || currentUser.role !== 'revendeur') {
                console.warn('Utilisateur non connecté ou mauvais rôle');
                window.location.href = '/portal-project/login.html';
                return;
            }
            
            // Vérifier les permissions pour voir les commissions
            const canViewCommissions = await window.PermissionsNotion.checkPermission(
                currentUser.id,
                'commissions',
                'view.own'
            );
            
            if (!canViewCommissions) {
                window.showNotification('Vous n\'avez pas accès aux commissions', 'error');
                window.location.href = `/${currentUser.role}/dashboard.html`;
                return;
            }
            
            // Afficher le loader
            this.showLoadingState();
            
            // Récupérer les commissions avec le middleware sécurisé
            const commissions = await window.PermissionsMiddleware.secureApiCall(
                'commissions',
                'view',
                this.getRevendeurCommissions.bind(this),
                currentUser.id,
                this.currentPeriod
            );
            
            // Enrichir les données
            const enrichedCommissions = this.enrichCommissionsData(commissions);
            
            // Stocker les commissions
            this.allCommissions = enrichedCommissions;
            
            // Mettre à jour l'interface
            this.updateCommissionsView(enrichedCommissions);
            this.updateCommissionsStats(enrichedCommissions);
            
            // Cacher le loader
            this.hideLoadingState();
            
            // Logger l'accès
            await window.PermissionsNotion.logAccess('view', 'commissions', true, {
                commissionCount: commissions.length,
                totalAmount: commissions.reduce((sum, c) => sum + (c.amount || 0), 0),
                period: this.currentPeriod
            });
            
        } catch (error) {
            console.error('Erreur lors du chargement des commissions:', error);
            this.showErrorState();
            
            if (window.PermissionsNotion) {
                await window.PermissionsNotion.logAccess('view', 'commissions', false, {
                    error: error.message
                });
            }
        }
    },
    
    // Récupérer les commissions du revendeur (stub)
    async getRevendeurCommissions(revendeurId, period) {
        // TODO: Implémenter la vraie requête Notion
        const baseCommissions = [
            {
                id: 'comm1',
                vente: 'Projet API - TechCorp SA',
                client: 'TechCorp SA',
                montantVente: 125000,
                tauxCommission: 8.5,
                montantCommission: 10625,
                statut: 'Payée',
                dateVente: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
                datePaiement: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                trimestre: 'Q1 2024'
            },
            {
                id: 'comm2',
                vente: 'App Mobile - StartupFood',
                client: 'StartupFood',
                montantVente: 45000,
                tauxCommission: 10,
                montantCommission: 4500,
                statut: 'En attente',
                dateVente: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
                datePaiement: null,
                trimestre: 'Q1 2024'
            },
            {
                id: 'comm3',
                vente: 'Design System - DesignStudio',
                client: 'DesignStudio',
                montantVente: 78000,
                tauxCommission: 9,
                montantCommission: 7020,
                statut: 'Validée',
                dateVente: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
                datePaiement: null,
                trimestre: 'Q1 2024'
            }
        ];
        
        // Filtrer selon la période
        const now = new Date();
        return baseCommissions.filter(comm => {
            const vente = new Date(comm.dateVente);
            switch (period) {
                case 'week':
                    return (now - vente) <= 7 * 24 * 60 * 60 * 1000;
                case 'month':
                    return vente.getMonth() === now.getMonth() && vente.getFullYear() === now.getFullYear();
                case 'quarter':
                    const quarter = Math.floor(now.getMonth() / 3);
                    const venteQuarter = Math.floor(vente.getMonth() / 3);
                    return venteQuarter === quarter && vente.getFullYear() === now.getFullYear();
                case 'year':
                    return vente.getFullYear() === now.getFullYear();
                default:
                    return true;
            }
        });
    },
    
    // Enrichir les données des commissions
    enrichCommissionsData(commissions) {
        return commissions.map(comm => ({
            ...comm,
            formattedDateVente: this.formatDate(comm.dateVente),
            formattedDatePaiement: comm.datePaiement ? this.formatDate(comm.datePaiement) : null,
            statusColor: this.getStatusColor(comm.statut),
            delaiPaiement: comm.datePaiement ? this.calculateDelaiPaiement(comm.dateVente, comm.datePaiement) : null,
            isOverdue: this.isOverdue(comm.dateVente, comm.statut)
        }));
    },
    
    // Mettre à jour la vue des commissions
    updateCommissionsView(commissions) {
        if (this.currentView === 'table') {
            this.updateTableView(commissions);
        } else if (this.currentView === 'chart') {
            this.updateChartView(commissions);
        } else {
            this.updateSummaryView(commissions);
        }
    },
    
    // Vue tableau
    updateTableView(commissions) {
        const container = document.getElementById('commissions-table');
        if (!container) return;
        
        if (commissions.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center text-muted py-4">
                        Aucune commission trouvée pour cette période
                    </td>
                </tr>
            `;
            return;
        }
        
        container.innerHTML = commissions.map(comm => `
            <tr class="${comm.isOverdue ? 'table-warning' : ''}">
                <td>
                    <div class="font-weight-medium">${comm.vente}</div>
                    <div class="text-muted small">${comm.client}</div>
                </td>
                <td class="text-end">
                    ${window.NotionConnector.utils.formatCurrency(comm.montantVente)}
                </td>
                <td class="text-center">
                    ${comm.tauxCommission}%
                </td>
                <td class="text-end font-weight-medium">
                    ${window.NotionConnector.utils.formatCurrency(comm.montantCommission)}
                </td>
                <td>
                    <span class="badge ${comm.statusColor}">
                        ${comm.statut}
                    </span>
                    ${comm.isOverdue ? '<div class="text-warning small">En retard</div>' : ''}
                </td>
                <td>
                    ${comm.formattedDateVente}
                </td>
                <td class="text-end">
                    <div class="btn-list">
                        <button class="btn btn-sm btn-icon btn-ghost-secondary" 
                                onclick="CommissionsNotion.viewDetails('${comm.id}')"
                                data-bs-toggle="tooltip" 
                                title="Voir détails">
                            <i class="ti ti-eye"></i>
                        </button>
                        ${comm.statut === 'En attente' ? `
                            <button class="btn btn-sm btn-icon btn-ghost-primary" 
                                    onclick="CommissionsNotion.requestPayment('${comm.id}')"
                                    data-bs-toggle="tooltip" 
                                    title="Demander paiement">
                                <i class="ti ti-send"></i>
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `).join('');
    },
    
    // Mettre à jour les statistiques
    updateCommissionsStats(commissions) {
        const stats = {
            total: commissions.reduce((sum, c) => sum + c.montantCommission, 0),
            paid: commissions.filter(c => c.statut === 'Payée').reduce((sum, c) => sum + c.montantCommission, 0),
            pending: commissions.filter(c => c.statut === 'En attente' || c.statut === 'Validée').reduce((sum, c) => sum + c.montantCommission, 0),
            count: commissions.length,
            avgRate: commissions.length > 0 ? commissions.reduce((sum, c) => sum + c.tauxCommission, 0) / commissions.length : 0,
            avgDelay: this.calculateAverageDelay(commissions)
        };
        
        // Mettre à jour les KPIs
        const updateStat = (id, value) => {
            const element = document.getElementById(id);
            if (element) {
                if (typeof value === 'number' && id.includes('commission')) {
                    element.textContent = window.NotionConnector.utils.formatCurrency(value);
                } else {
                    element.textContent = value;
                }
            }
        };
        
        updateStat('total-commissions', stats.total);
        updateStat('paid-commissions', stats.paid);
        updateStat('pending-commissions', stats.pending);
        updateStat('commission-count', stats.count);
        updateStat('avg-commission-rate', stats.avgRate.toFixed(1) + '%');
        updateStat('avg-payment-delay', stats.avgDelay + ' jours');
    },
    
    // Changer de vue
    switchView(viewType) {
        this.currentView = viewType;
        
        // Mettre à jour l'UI des boutons
        document.querySelectorAll('[data-view-type]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.viewType === viewType);
        });
        
        // Mettre à jour le contenu
        this.updateCommissionsView(this.allCommissions);
    },
    
    // Actions sur les commissions
    async viewDetails(commissionId) {
        // TODO: Implémenter la vue détaillée
        console.log('Détails commission:', commissionId);
    },
    
    async requestPayment(commissionId) {
        try {
            const currentUser = window.AuthNotionModule?.getCurrentUser();
            if (!currentUser) return;
            
            // Vérifier les permissions pour demander paiement
            const canRequest = await window.PermissionsNotion.checkPermission(
                currentUser.id,
                'commissions',
                'request_payment'
            );
            
            if (!canRequest) {
                window.showNotification('Vous n\'avez pas le droit de demander un paiement', 'error');
                return;
            }
            
            if (!confirm('Envoyer une demande de paiement pour cette commission ?')) {
                return;
            }
            
            // TODO: Implémenter la demande de paiement
            window.showNotification('Demande de paiement envoyée', 'success');
            
            // Logger l'action
            await window.PermissionsNotion.logAccess('request_payment', 'commissions', true, {
                commissionId: commissionId
            });
            
        } catch (error) {
            console.error('Erreur demande paiement:', error);
            window.showNotification('Erreur lors de la demande', 'error');
        }
    },
    
    async exportCommissions() {
        try {
            const currentUser = window.AuthNotionModule?.getCurrentUser();
            if (!currentUser) return;
            
            // Vérifier les permissions pour exporter
            const canExport = await window.PermissionsNotion.checkPermission(
                currentUser.id,
                'commissions',
                'export'
            );
            
            if (!canExport) {
                window.showNotification('Vous n\'avez pas le droit d\'exporter', 'error');
                return;
            }
            
            window.showNotification('Export en cours...', 'info');
            
            // TODO: Implémenter l'export réel
            
        } catch (error) {
            console.error('Erreur export:', error);
        }
    },
    
    // Fonctions utilitaires
    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('fr-FR');
    },
    
    getStatusColor(statut) {
        const colors = {
            'Payée': 'badge-success',
            'En attente': 'badge-warning',
            'Validée': 'badge-primary',
            'Refusée': 'badge-danger'
        };
        return colors[statut] || 'badge-secondary';
    },
    
    calculateDelaiPaiement(dateVente, datePaiement) {
        const vente = new Date(dateVente);
        const paiement = new Date(datePaiement);
        const diffTime = paiement - vente;
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    },
    
    isOverdue(dateVente, statut) {
        if (statut === 'Payée') return false;
        const vente = new Date(dateVente);
        const now = new Date();
        const diffDays = Math.floor((now - vente) / (1000 * 60 * 60 * 24));
        return diffDays > 30; // En retard après 30 jours
    },
    
    calculateAverageDelay(commissions) {
        const paidCommissions = commissions.filter(c => c.datePaiement);
        if (paidCommissions.length === 0) return 0;
        
        const totalDelay = paidCommissions.reduce((sum, c) => 
            sum + this.calculateDelaiPaiement(c.dateVente, c.datePaiement), 0
        );
        
        return Math.round(totalDelay / paidCommissions.length);
    },
    
    // États de chargement
    showLoadingState() {
        const container = document.getElementById('commissions-content');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Chargement...</span>
                    </div>
                    <div class="text-muted mt-2">Chargement des commissions...</div>
                </div>
            `;
        }
    },
    
    hideLoadingState() {
        // Le contenu est remplacé par les fonctions de mise à jour
    },
    
    showErrorState() {
        const container = document.getElementById('commissions-content');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-5">
                    <i class="ti ti-alert-circle fs-1 text-danger mb-3"></i>
                    <h3 class="text-danger">Erreur de chargement</h3>
                    <p class="text-muted">Impossible de charger les commissions</p>
                    <button class="btn btn-primary mt-2" onclick="CommissionsNotion.loadCommissions()">
                        Réessayer
                    </button>
                </div>
            `;
        }
        
        if (window.showNotification) {
            window.showNotification('Erreur lors du chargement des commissions', 'error');
        }
    }
};

// Auto-initialisation
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('commissions.html')) {
        const checkNotionConnector = setInterval(() => {
            if (window.NotionConnector && window.AuthNotionModule && window.PermissionsNotion) {
                clearInterval(checkNotionConnector);
                CommissionsNotion.init();
            }
        }, 100);
    }
});

// Export global
window.CommissionsNotion = CommissionsNotion;