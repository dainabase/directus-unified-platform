// Import des modules
import { API } from './api.js';
import { Charts } from './charts.js';
import { Utils } from './utils.js';

class DashboardApp {
    constructor() {
        this.api = new API();
        this.charts = new Charts();
        this.currentCompany = 'all';
        this.currentPeriod = 30;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadDashboardData();
        this.startRealTimeUpdates();
        
        // Activer les icônes Lucide
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }
    
    setupEventListeners() {
        // Toggle sidebar
        const menuToggle = document.getElementById('menuToggle');
        if (menuToggle) {
            menuToggle.addEventListener('click', () => {
                const sidebar = document.getElementById('sidebar');
                sidebar.classList.toggle('open');
                
                // Mobile overlay
                if (window.innerWidth <= 768) {
                    this.toggleMobileOverlay();
                }
            });
        }
        
        // Company selector
        const companySelect = document.getElementById('companySelect');
        if (companySelect) {
            companySelect.addEventListener('change', (e) => {
                this.currentCompany = e.target.value;
                this.loadDashboardData();
            });
        }
        
        // Period selector
        const periodSelect = document.getElementById('periodSelect');
        if (periodSelect) {
            periodSelect.addEventListener('change', (e) => {
                this.currentPeriod = parseInt(e.target.value);
                this.loadDashboardData();
            });
        }
        
        // Fermer sidebar sur click overlay mobile
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('sidebar-overlay')) {
                this.closeMobileSidebar();
            }
        });
    }
    
    toggleMobileOverlay() {
        let overlay = document.querySelector('.sidebar-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'sidebar-overlay';
            document.body.appendChild(overlay);
        }
        overlay.classList.toggle('active');
    }
    
    closeMobileSidebar() {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.remove('open');
        const overlay = document.querySelector('.sidebar-overlay');
        if (overlay) {
            overlay.classList.remove('active');
        }
    }
    
    async loadDashboardData() {
        try {
            // Afficher loading
            this.showLoading();
            
            // Simuler des données pour la démo
            const data = this.getMockData();
            
            // Mettre à jour l'UI
            this.updateKPIs(data.kpis);
            this.updateCompanyPerformance(data.companies);
            this.updateAlerts(data.alerts);
            
            // Mettre à jour les graphiques
            // this.charts.updateAll(data);
            
        } catch (error) {
            console.error('Erreur chargement dashboard:', error);
            this.showError('Impossible de charger les données');
        } finally {
            this.hideLoading();
        }
    }
    
    getMockData() {
        return {
            kpis: {
                revenue: 2450000,
                growth: 23.5,
                cash: 892000,
                objective: 87,
                revenueChange: 245000,
                growthPeriod: '2024',
                cashMonths: 3.2
            },
            companies: [
                { id: 'hypervisual', name: 'HyperVisual', icon: '📹', revenue: 458000, growth: 18, performance: 85 },
                { id: 'dynamics', name: 'Dynamics', icon: '💡', revenue: 623000, growth: 32, performance: 92 },
                { id: 'lexia', name: 'Lexia', icon: '🗣️', revenue: 384000, growth: 12, performance: 78 },
                { id: 'nkreality', name: 'NKReality', icon: '🏠', revenue: 789000, growth: 45, performance: 95 },
                { id: 'etekout', name: 'Etekout', icon: '🛒', revenue: 196000, growth: -3, performance: 68 }
            ],
            alerts: [
                { id: 1, type: 'warning', icon: 'trending-down', message: 'Etekout: Baisse CA -3% - Analyser urgence', action: 'Voir détails' },
                { id: 2, type: 'danger', icon: 'dollar-sign', message: '3 factures impayées > 60 jours (€127K total)', action: 'Relancer' },
                { id: 3, type: 'warning', icon: 'users', message: '5 congés en attente de validation', action: 'Valider' }
            ]
        };
    }
    
    updateKPIs(kpis) {
        // CA Total
        const revenueEl = document.querySelector('.kpi-primary .kpi-value');
        if (revenueEl) {
            revenueEl.textContent = Utils.formatCurrency(kpis.revenue);
        }
        
        // Mise à jour du changement de CA
        const revenueChangeEl = document.querySelector('.kpi-primary .kpi-change span');
        if (revenueChangeEl) {
            revenueChangeEl.textContent = `+${Utils.formatCurrency(kpis.revenueChange)} vs mois dernier`;
        }
        
        // Autres KPIs similaires...
    }
    
    updateCompanyPerformance(companies) {
        const container = document.querySelector('.performance-list');
        if (!container) return;
        
        container.innerHTML = companies.map(company => `
            <div class="performance-item">
                <div class="company-icon">${company.icon}</div>
                <div class="company-info">
                    <h4>${company.name}</h4>
                    <div class="performance-bar">
                        <div class="bar-fill" style="width: ${company.performance}%"></div>
                    </div>
                </div>
                <div class="company-metrics">
                    <span class="metric-value">${Utils.formatCurrency(company.revenue)}</span>
                    <span class="metric-change ${company.growth > 0 ? 'positive' : 'negative'}">
                        ${company.growth > 0 ? '▲' : '▼'}${company.growth > 0 ? '+' : ''}${Math.abs(company.growth)}%
                    </span>
                </div>
            </div>
        `).join('');
    }
    
    updateAlerts(alerts) {
        const container = document.querySelector('.alerts-list');
        if (!container) return;
        
        container.innerHTML = alerts.map(alert => `
            <div class="alert-item alert-${alert.type}">
                <i data-lucide="${alert.icon}"></i>
                <span>${alert.message}</span>
                <button class="btn-action" onclick="window.app.handleAlert('${alert.id}')">
                    ${alert.action}
                </button>
            </div>
        `).join('');
        
        // Réactiver les icônes Lucide
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }
    
    handleAlert(alertId) {
        console.log('Handling alert:', alertId);
        // Implémenter la logique pour gérer les alertes
    }
    
    startRealTimeUpdates() {
        // Mise à jour toutes les 30 secondes
        setInterval(() => {
            this.loadDashboardData();
        }, 30000);
    }
    
    showLoading() {
        // Ajouter indicateur de chargement
        const main = document.querySelector('.dashboard-main');
        if (main && !document.querySelector('.loading-overlay')) {
            const overlay = document.createElement('div');
            overlay.className = 'loading-overlay';
            overlay.innerHTML = '<div class="spinner"></div>';
            main.appendChild(overlay);
        }
    }
    
    hideLoading() {
        const overlay = document.querySelector('.loading-overlay');
        if (overlay) {
            overlay.remove();
        }
    }
    
    showError(message) {
        // Afficher message d'erreur
        console.error(message);
    }
}

// Initialiser l'application
document.addEventListener('DOMContentLoaded', () => {
    window.app = new DashboardApp();
});