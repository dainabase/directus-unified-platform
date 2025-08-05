// Module ERP pour SuperAdmin
class ERPModule {
    constructor() {
        this.apiBase = '/api/erpnext';
        this.currentCompany = 'all';
        this.charts = {};
    }

    async init() {
        console.log('🚀 Initialisation du module ERP');
        
        // Charger les données initiales
        await this.loadDashboardData();
        
        // Initialiser les graphiques
        this.initCharts();
        
        // Actualiser toutes les 30 secondes
        setInterval(() => this.loadDashboardData(), 30000);
    }

    async loadDashboardData(company = 'all') {
        this.currentCompany = company;
        
        try {
            // Charger les KPIs
            const response = await fetch(`${this.apiBase}/kpis?company=${company}`);
            const kpis = await response.json();
            
            // Mettre à jour les KPIs
            this.updateKPIs(kpis);
            
            // Charger les données des graphiques
            await this.loadChartData();
            
            // Charger les activités récentes
            await this.loadRecentActivities();
            
        } catch (error) {
            console.error('❌ Erreur chargement dashboard:', error);
            this.showNotification('Erreur lors du chargement des données', 'error');
        }
    }

    updateKPIs(data) {
        // CA du mois
        const revenue = data.revenue || 0;
        document.getElementById('kpiRevenue').textContent = 
            new Intl.NumberFormat('fr-CH', { 
                style: 'currency', 
                currency: 'CHF' 
            }).format(revenue);
        
        // Factures en attente
        document.getElementById('kpiPendingInvoices').textContent = data.pending_invoices || 0;
        document.getElementById('pendingAmount').textContent = 
            new Intl.NumberFormat('fr-CH', { 
                style: 'currency', 
                currency: 'CHF' 
            }).format(data.pending_amount || 0);
        
        // Stock
        document.getElementById('kpiStock').textContent = 
            new Intl.NumberFormat('fr-CH', { 
                style: 'currency', 
                currency: 'CHF' 
            }).format(data.total_stock || 0);
        document.getElementById('stockItems').textContent = data.stock_items || 0;
        
        // Employés
        document.getElementById('kpiEmployees').textContent = data.active_employees || 0;
    }

    initCharts() {
        // Configuration commune
        const chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: 'rgba(255, 255, 255, 0.8)',
                        font: {
                            family: "'Inter', sans-serif"
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.8)'
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.8)'
                    }
                }
            }
        };

        // Graphique des revenus
        const revenueCtx = document.getElementById('revenueChart').getContext('2d');
        this.charts.revenue = new Chart(revenueCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Chiffre d\'affaires',
                    data: [],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                ...chartOptions,
                plugins: {
                    ...chartOptions.plugins,
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ' + 
                                    new Intl.NumberFormat('fr-CH', { 
                                        style: 'currency', 
                                        currency: 'CHF' 
                                    }).format(context.parsed.y);
                            }
                        }
                    }
                }
            }
        });

        // Graphique par entreprise
        const companyCtx = document.getElementById('companyChart').getContext('2d');
        this.charts.company = new Chart(companyCtx, {
            type: 'doughnut',
            data: {
                labels: ['HyperVisual', 'Dynamics', 'Lexia', 'NKReality', 'Etekout'],
                datasets: [{
                    data: [],
                    backgroundColor: [
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(251, 146, 60, 0.8)',
                        'rgba(147, 51, 234, 0.8)',
                        'rgba(236, 72, 153, 0.8)'
                    ],
                    borderColor: 'transparent'
                }]
            },
            options: {
                ...chartOptions,
                scales: undefined,
                plugins: {
                    ...chartOptions.plugins,
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.label + ': ' + 
                                    new Intl.NumberFormat('fr-CH', { 
                                        style: 'currency', 
                                        currency: 'CHF' 
                                    }).format(context.parsed);
                            }
                        }
                    }
                }
            }
        });
    }

    async loadChartData() {
        try {
            // Données du graphique des revenus
            const revenueResponse = await fetch(`${this.apiBase}/chart/revenue?company=${this.currentCompany}`);
            const revenueData = await revenueResponse.json();
            
            this.charts.revenue.data.labels = revenueData.labels;
            this.charts.revenue.data.datasets[0].data = revenueData.values;
            this.charts.revenue.update();
            
            // Données du graphique par entreprise (seulement si "all")
            if (this.currentCompany === 'all') {
                const companyResponse = await fetch(`${this.apiBase}/chart/company-breakdown`);
                const companyData = await companyResponse.json();
                
                this.charts.company.data.datasets[0].data = companyData.values;
                this.charts.company.update();
            }
            
        } catch (error) {
            console.error('❌ Erreur chargement graphiques:', error);
        }
    }

    async loadRecentActivities() {
        try {
            const response = await fetch(`${this.apiBase}/activities?company=${this.currentCompany}&limit=10`);
            const activities = await response.json();
            
            const container = document.getElementById('recentActivities');
            
            if (activities.length === 0) {
                container.innerHTML = `
                    <div class="text-center text-muted py-4">
                        Aucune activité récente
                    </div>
                `;
                return;
            }
            
            container.innerHTML = activities.map(activity => `
                <div class="list-group-item glassmorphism-hover">
                    <div class="row align-items-center">
                        <div class="col-auto">
                            <span class="status-dot ${this.getActivityColor(activity.type)} d-block"></span>
                        </div>
                        <div class="col text-truncate">
                            <a href="#" class="text-body d-block">${activity.title}</a>
                            <div class="d-block text-muted text-truncate mt-n1">
                                ${activity.description} • ${activity.company}
                            </div>
                        </div>
                        <div class="col-auto">
                            <time class="text-muted" datetime="${activity.date}">
                                ${this.formatRelativeTime(activity.date)}
                            </time>
                        </div>
                    </div>
                </div>
            `).join('');
            
        } catch (error) {
            console.error('❌ Erreur chargement activités:', error);
        }
    }

    getActivityColor(type) {
        const colors = {
            'invoice': 'status-dot-animated bg-success',
            'payment': 'status-dot-animated bg-primary',
            'customer': 'bg-info',
            'stock': 'bg-warning',
            'employee': 'bg-secondary'
        };
        return colors[type] || 'bg-muted';
    }

    formatRelativeTime(date) {
        const now = new Date();
        const then = new Date(date);
        const diff = Math.floor((now - then) / 1000); // différence en secondes
        
        if (diff < 60) return 'à l\'instant';
        if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
        if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`;
        if (diff < 604800) return `il y a ${Math.floor(diff / 86400)} j`;
        
        return then.toLocaleDateString('fr-FR');
    }

    // Actions rapides
    async createInvoice() {
        // Rediriger vers ERPNext avec la page de création de facture
        window.open('http://localhost:8083/app/sales-invoice/new-sales-invoice-1', '_blank');
    }

    async createCustomer() {
        window.open('http://localhost:8083/app/customer/new-customer-1', '_blank');
    }

    async createItem() {
        window.open('http://localhost:8083/app/item/new-item-1', '_blank');
    }

    async syncData() {
        try {
            this.showNotification('Synchronisation en cours...', 'info');
            
            const response = await fetch(`${this.apiBase}/sync`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    company: this.currentCompany
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showNotification('Synchronisation terminée avec succès', 'success');
                await this.loadDashboardData();
            } else {
                throw new Error(result.message);
            }
            
        } catch (error) {
            console.error('❌ Erreur synchronisation:', error);
            this.showNotification('Erreur lors de la synchronisation', 'error');
        }
    }

    async runMigration() {
        if (!confirm('Voulez-vous vraiment lancer la migration depuis Directus ? Cette opération peut prendre plusieurs minutes.')) {
            return;
        }
        
        try {
            this.showNotification('Migration en cours... Veuillez patienter', 'info');
            
            const response = await fetch(`${this.apiBase}/migrate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showNotification(`Migration terminée ! ${result.summary}`, 'success');
                await this.loadDashboardData();
            } else {
                throw new Error(result.message);
            }
            
        } catch (error) {
            console.error('❌ Erreur migration:', error);
            this.showNotification('Erreur lors de la migration', 'error');
        }
    }

    showNotification(message, type = 'info') {
        // Utiliser le système de notification Tabler
        const alertClass = {
            'info': 'alert-info',
            'success': 'alert-success',
            'error': 'alert-danger',
            'warning': 'alert-warning'
        };
        
        const alert = document.createElement('div');
        alert.className = `alert ${alertClass[type]} alert-dismissible position-fixed top-0 end-0 m-3 fade show`;
        alert.style.zIndex = '9999';
        alert.innerHTML = `
            <div class="d-flex">
                <div>${message}</div>
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        
        document.body.appendChild(alert);
        
        // Auto-dismiss après 5 secondes
        setTimeout(() => {
            alert.classList.remove('show');
            setTimeout(() => alert.remove(), 150);
        }, 5000);
    }
}

// Exporter pour utilisation globale
window.ERPModule = new ERPModule();