/**
 * Dashboard Client avec API
 * Utilise l'API Node.js au lieu des données mockées
 */

const DashboardClientAPI = {
    // Initialisation
    async init() {
        console.log('🔌 Initialisation du dashboard client avec API');
        
        // Vérifier l'authentification
        const token = localStorage.getItem('auth_token');
        if (!token) {
            window.location.href = '/portal-project/login.html';
            return;
        }
        
        await this.loadDashboardData();
        this.setupEventListeners();
        this.startAutoRefresh();
    },
    
    // Charger toutes les données du dashboard
    async loadDashboardData() {
        try {
            this.showLoadingState();
            
            // Charger les données en parallèle
            const [projects, finances, stats] = await Promise.all([
                this.loadProjects(),
                this.loadFinances(),
                this.loadStatistics()
            ]);
            
            // Mettre à jour l'interface
            this.updateProjectsSection(projects);
            this.updateFinanceSection(finances);
            this.updateStatsCards(stats);
            this.updateRecentActivity(projects.results);
            
            this.hideLoadingState();
            
        } catch (error) {
            console.error('Erreur lors du chargement du dashboard:', error);
            this.showErrorState(error.message);
        }
    },
    
    // Charger les projets
    async loadProjects() {
        try {
            const projects = await window.apiClient.getProjects({
                status: 'En cours',
                page_size: 10
            });
            
            return projects;
        } catch (error) {
            console.error('Erreur lors du chargement des projets:', error);
            return { results: [], has_more: false };
        }
    },
    
    // Charger les données financières
    async loadFinances() {
        try {
            const currentYear = new Date().getFullYear();
            const currentMonth = new Date().getMonth() + 1;
            
            const [factures, stats] = await Promise.all([
                window.apiClient.getFacturesClients({
                    start_date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`,
                    page_size: 5
                }),
                window.apiClient.getFinanceStatistics(currentYear, currentMonth)
            ]);
            
            return { factures, stats };
        } catch (error) {
            console.error('Erreur lors du chargement des finances:', error);
            return { factures: { results: [] }, stats: {} };
        }
    },
    
    // Charger les statistiques
    async loadStatistics() {
        try {
            const [projectStats, financeStats] = await Promise.all([
                window.apiClient.getProjectStatistics(),
                window.apiClient.getFinanceStatistics(new Date().getFullYear())
            ]);
            
            return {
                projects: projectStats,
                finance: financeStats
            };
        } catch (error) {
            console.error('Erreur lors du chargement des statistiques:', error);
            return { projects: {}, finance: {} };
        }
    },
    
    // Mettre à jour la section projets
    updateProjectsSection(data) {
        const container = document.getElementById('projects-container');
        if (!container) return;
        
        if (!data.results || data.results.length === 0) {
            container.innerHTML = `
                <div class="text-center py-4">
                    <p class="text-muted">Aucun projet en cours</p>
                </div>
            `;
            return;
        }
        
        const projectsHTML = data.results.map(project => {
            const props = window.apiClient.transformProperties(project.properties);
            const progress = props['Progression'] || 0;
            const status = props['Statut'] || 'En cours';
            const statusClass = this.getStatusClass(status);
            
            return `
                <div class="col-md-6 mb-3">
                    <div class="card h-100">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <h4 class="card-title mb-0">${props['Nom'] || 'Sans titre'}</h4>
                                <span class="badge bg-${statusClass}-lt">${status}</span>
                            </div>
                            <p class="text-muted small mb-3">${props['Description'] || 'Pas de description'}</p>
                            <div class="mb-2">
                                <div class="d-flex justify-content-between mb-1">
                                    <span class="text-muted small">Progression</span>
                                    <span class="text-muted small">${progress}%</span>
                                </div>
                                <div class="progress progress-sm">
                                    <div class="progress-bar" style="width: ${progress}%" role="progressbar"></div>
                                </div>
                            </div>
                            <div class="d-flex justify-content-between align-items-center mt-3">
                                <small class="text-muted">
                                    Échéance: ${props['Date fin'] ? new Date(props['Date fin']).toLocaleDateString('fr-CH') : 'Non définie'}
                                </small>
                                <a href="project-detail.html?id=${project.id}" class="btn btn-sm btn-primary">
                                    Voir détails
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        container.innerHTML = projectsHTML;
    },
    
    // Mettre à jour la section finance
    updateFinanceSection(data) {
        const container = document.getElementById('finance-container');
        if (!container) return;
        
        // Afficher les statistiques financières
        const stats = data.stats;
        const statsHTML = `
            <div class="row mb-4">
                <div class="col-md-3">
                    <div class="card">
                        <div class="card-body">
                            <div class="text-muted small">Chiffre d'affaires</div>
                            <div class="h3 mb-0">CHF ${this.formatAmount(stats.revenue || 0)}</div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card">
                        <div class="card-body">
                            <div class="text-muted small">Dépenses</div>
                            <div class="h3 mb-0">CHF ${this.formatAmount(stats.expenses || 0)}</div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card">
                        <div class="card-body">
                            <div class="text-muted small">TVA à payer</div>
                            <div class="h3 mb-0">CHF ${this.formatAmount(stats.vat_to_pay || 0)}</div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card">
                        <div class="card-body">
                            <div class="text-muted small">Factures en attente</div>
                            <div class="h3 mb-0">${stats.pending_invoices || 0}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Afficher les dernières factures
        const facturesHTML = data.factures.results.map(facture => {
            const props = window.apiClient.transformProperties(facture.properties);
            const statusClass = props['Statut'] === 'Payée' ? 'success' : 'warning';
            
            return `
                <tr>
                    <td>${props['Numéro'] || '-'}</td>
                    <td>${props['Date'] ? new Date(props['Date']).toLocaleDateString('fr-CH') : '-'}</td>
                    <td class="text-end">CHF ${this.formatAmount(props['Montant TTC'] || 0)}</td>
                    <td class="text-center">
                        <span class="badge bg-${statusClass}-lt">${props['Statut'] || 'En attente'}</span>
                    </td>
                    <td class="text-end">
                        <a href="invoice-detail.html?id=${facture.id}" class="btn btn-sm btn-outline-primary">
                            Voir
                        </a>
                    </td>
                </tr>
            `;
        }).join('');
        
        container.innerHTML = `
            ${statsHTML}
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Dernières factures</h3>
                </div>
                <div class="table-responsive">
                    <table class="table table-vcenter">
                        <thead>
                            <tr>
                                <th>Numéro</th>
                                <th>Date</th>
                                <th class="text-end">Montant</th>
                                <th class="text-center">Statut</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            ${facturesHTML || '<tr><td colspan="5" class="text-center">Aucune facture</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },
    
    // Mettre à jour les cartes de statistiques
    updateStatsCards(stats) {
        // Projets actifs
        const activeProjectsEl = document.querySelector('[data-stat="active-projects"]');
        if (activeProjectsEl) {
            activeProjectsEl.textContent = stats.projects.active || 0;
        }
        
        // Tâches en cours
        const tasksEl = document.querySelector('[data-stat="pending-tasks"]');
        if (tasksEl) {
            tasksEl.textContent = stats.projects.pending_tasks || 0;
        }
        
        // Chiffre d'affaires mensuel
        const revenueEl = document.querySelector('[data-stat="monthly-revenue"]');
        if (revenueEl) {
            revenueEl.textContent = `CHF ${this.formatAmount(stats.finance.revenue || 0)}`;
        }
    },
    
    // Mettre à jour l'activité récente
    updateRecentActivity(projects) {
        const container = document.getElementById('recent-activity');
        if (!container) return;
        
        // Créer une liste d'activités à partir des projets
        const activities = projects.slice(0, 5).map(project => {
            const props = window.apiClient.transformProperties(project.properties);
            return {
                type: 'project_update',
                title: `Mise à jour du projet "${props['Nom'] || 'Sans titre'}"`,
                time: project.last_edited_time,
                icon: 'briefcase'
            };
        });
        
        if (activities.length === 0) {
            container.innerHTML = '<p class="text-muted text-center py-3">Aucune activité récente</p>';
            return;
        }
        
        const activityHTML = activities.map(activity => `
            <div class="list-group-item">
                <div class="row align-items-center">
                    <div class="col-auto">
                        <span class="avatar avatar-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                <rect x="3" y="7" width="18" height="13" rx="2" />
                                <path d="M8 7v-2a2 2 0 0 1 2 -2h4a2 2 0 0 1 2 2v2" />
                                <line x1="12" y1="12" x2="12" y2="12.01" />
                            </svg>
                        </span>
                    </div>
                    <div class="col">
                        <div>${activity.title}</div>
                        <div class="text-muted small">${this.formatRelativeTime(activity.time)}</div>
                    </div>
                </div>
            </div>
        `).join('');
        
        container.innerHTML = activityHTML;
    },
    
    // Utilitaires
    formatAmount(amount) {
        return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'");
    },
    
    formatRelativeTime(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 0) return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
        if (hours > 0) return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
        if (minutes > 0) return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
        return 'À l\'instant';
    },
    
    getStatusClass(status) {
        const statusMap = {
            'En cours': 'blue',
            'Terminé': 'success',
            'En attente': 'warning',
            'Annulé': 'danger',
            'Payée': 'success',
            'Impayée': 'danger'
        };
        return statusMap[status] || 'secondary';
    },
    
    showLoadingState() {
        const containers = ['projects-container', 'finance-container', 'recent-activity'];
        containers.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.innerHTML = `
                    <div class="text-center py-4">
                        <div class="spinner-border" role="status">
                            <span class="visually-hidden">Chargement...</span>
                        </div>
                    </div>
                `;
            }
        });
    },
    
    hideLoadingState() {
        // Le contenu est déjà remplacé par les vraies données
    },
    
    showErrorState(message) {
        window.showNotification(message || 'Erreur lors du chargement des données', 'error');
    },
    
    setupEventListeners() {
        // Bouton de rafraîchissement
        const refreshBtn = document.getElementById('refresh-dashboard');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadDashboardData());
        }
    },
    
    startAutoRefresh() {
        // Rafraîchir toutes les 5 minutes
        setInterval(() => this.loadDashboardData(), 5 * 60 * 1000);
    }
};

// Initialiser au chargement
document.addEventListener('DOMContentLoaded', () => {
    DashboardClientAPI.init();
});