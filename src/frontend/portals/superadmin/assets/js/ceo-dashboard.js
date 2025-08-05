class CEODashboard {
    constructor() {
        this.charts = {};
        this.currentCompany = 'all';
        this.refreshInterval = 30000; // 30 secondes
        this.directusAPI = null;
        this.alertThresholds = {
            cashRunway: 6, // mois
            ebitdaMargin: 15, // %
            ltvCacRatio: 3.0,
            npsScore: 30,
            churnRate: 10 // % mensuel
        };
        
        this.init();
    }
    
    async init() {
        // Initialiser l'API Directus
        this.directusAPI = new DirectusAPI();
        
        this.initializeCompanySelector();
        await this.loadCEOMetricsFromAPI();
        this.initializeSparklines();
        this.setupRealTimeUpdates();
        this.bindEvents();
        
        console.log('🚀 CEO Dashboard initialized with Directus API');
    }
    
    // SÉLECTEUR D'ENTREPRISE
    initializeCompanySelector() {
        const companySelector = document.querySelector('.company-selector');
        const selectedCompany = document.querySelector('.selected-company');
        const companyDropdown = document.querySelector('.company-dropdown');
        const companyItems = document.querySelectorAll('.company-item');
        
        if (!companySelector) return;
        
        // Toggle dropdown
        selectedCompany?.addEventListener('click', () => {
            companyDropdown?.classList.toggle('show');
        });
        
        // Handle company selection
        companyItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                
                const companyIcon = item.querySelector('.company-icon')?.textContent || '🏢';
                const companyName = item.textContent.trim();
                
                // Update selected company display
                const selectedIcon = document.querySelector('.company-avatar i');
                const selectedName = document.querySelector('.company-name');
                
                if (selectedIcon && selectedName) {
                    selectedIcon.className = 'ti ti-building'; // Keep consistent icon
                    selectedName.textContent = companyName;
                }
                
                // Mark as active
                companyItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                
                // Update current company
                this.currentCompany = this.getCompanyCode(companyName);
                
                // Close dropdown
                companyDropdown?.classList.remove('show');
                
                // Refresh data
                this.filterByCompany(this.currentCompany);
                
                console.log(`🏢 Company selected: ${companyName} (${this.currentCompany})`);
            });
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!companySelector.contains(e.target)) {
                companyDropdown?.classList.remove('show');
            }
        });
    }
    
    getCompanyCode(companyName) {
        const mapping = {
            'Vue consolidée': 'all',
            'HyperVisual': 'hypervisual',
            'Dynamics': 'dynamics',
            'Lexia': 'lexia',
            'NKReality': 'nkreality',
            'Etekout': 'etekout'
        };
        return mapping[companyName] || 'all';
    }
    
    // CHARGEMENT DES MÉTRIQUES CEO DEPUIS DIRECTUS
    async loadCEOMetricsFromAPI() {
        try {
            const metrics = await this.directusAPI.getCEOMetrics(this.currentCompany);
            
            // Mettre à jour l'affichage avec les données réelles
            this.updateAllMetrics(metrics);
            
            // Vérifier les seuils critiques
            this.checkAlertThresholds(metrics);
            
            // Charger les données opérationnelles
            await this.loadOperationalDataFromAPI();
            
            console.log('📊 CEO Metrics loaded from Directus API');
        } catch (error) {
            console.error('Error loading CEO metrics:', error);
            // Fallback sur les données locales
            this.loadCEOMetrics();
        }
    }
    
    // CHARGEMENT DES MÉTRIQUES CEO (FALLBACK)
    loadCEOMetrics() {
        const metrics = this.getCEOMetricsData(this.currentCompany);
        
        // Mettre à jour les valeurs affichées
        this.updateMetricDisplay('cash-runway', metrics.cashRunway);
        this.updateMetricDisplay('arr-consolidated', metrics.arr);
        this.updateMetricDisplay('ebitda-margin', metrics.ebitdaMargin);
        this.updateMetricDisplay('ltv-cac', metrics.ltvCac);
        this.updateMetricDisplay('nps-global', metrics.nps);
        
        // Vérifier les seuils critiques
        this.checkAlertThresholds(metrics);
    }
    
    // CHARGEMENT DES DONNÉES OPÉRATIONNELLES
    async loadOperationalDataFromAPI() {
        try {
            const [financial, sales, marketing, operational, alerts] = await Promise.all([
                this.directusAPI.getFinancialData(this.currentCompany),
                this.directusAPI.getSalesData(this.currentCompany),
                this.directusAPI.getMarketingData(this.currentCompany),
                this.directusAPI.getOperationalData(this.currentCompany),
                this.directusAPI.getAlerts(this.currentCompany)
            ]);
            
            // Mettre à jour les blocs opérationnels
            this.updateFinancialBlock(financial);
            this.updateSalesBlock(sales);
            this.updateMarketingBlock(marketing);
            this.updateOperationalBlocks(operational);
            this.updateAlertsBlock(alerts);
            
            console.log('🔄 Operational data loaded from Directus API');
        } catch (error) {
            console.error('Error loading operational data:', error);
        }
    }
    
    getCEOMetricsData(company) {
        // Données simulées par entreprise
        const data = {
            all: {
                cashRunway: 4.2,
                burnRate: 245000,
                arr: 7200000,
                mrr: 623000,
                ebitdaMargin: 18.7,
                ltvCac: 2.8,
                nps: 52
            },
            hypervisual: {
                cashRunway: 6.8,
                burnRate: 45000,
                arr: 1800000,
                mrr: 152000,
                ebitdaMargin: 22.0,
                ltvCac: 3.4,
                nps: 58
            },
            dynamics: {
                cashRunway: 8.2,
                burnRate: 38000,
                arr: 1600000,
                mrr: 135000,
                ebitdaMargin: 26.3,
                ltvCac: 4.1,
                nps: 64
            },
            lexia: {
                cashRunway: 3.1,
                burnRate: 52000,
                arr: 1400000,
                mrr: 118000,
                ebitdaMargin: 14.2,
                ltvCac: 2.1,
                nps: 42
            },
            nkreality: {
                cashRunway: 12.5,
                burnRate: 28000,
                arr: 1800000,
                mrr: 156000,
                ebitdaMargin: 31.5,
                ltvCac: 5.2,
                nps: 67
            },
            etekout: {
                cashRunway: 2.1,
                burnRate: 89000,
                arr: 600000,
                mrr: 52000,
                ebitdaMargin: 8.1,
                ltvCac: 1.2,
                nps: 28
            }
        };
        
        return data[company] || data.all;
    }
    
    updateMetricDisplay(metricId, value) {
        // Cette méthode sera appelée pour mettre à jour l'affichage des métriques
        // Pour l'instant, on log juste les valeurs
        console.log(`📊 ${metricId}: ${value}`);
    }
    
    // SPARKLINES AVEC APEXCHARTS
    initializeSparklines() {
        this.createSparkline('cash-sparkline', {
            data: [892, 834, 756, 689, 612, 534, 467, 389, 312, 245],
            color: '#EF4444',
            type: 'area'
        });
        
        this.createSparkline('arr-sparkline', {
            data: [5.2, 5.5, 5.8, 6.1, 6.3, 6.6, 6.8, 7.0, 7.2],
            color: '#10B981',
            type: 'line'
        });
        
        // EBITDA Gauge
        this.createGauge('ebitda-gauge', {
            value: 18.7,
            max: 30,
            target: 25
        });
        
        // NPS Indicator
        this.createNPSIndicator('nps-indicator', 52);
    }
    
    createSparkline(elementId, config) {
        const element = document.querySelector(`#${elementId}`);
        if (!element) return;
        
        const options = {
            series: [{
                data: config.data
            }],
            chart: {
                type: config.type || 'line',
                height: 40,
                sparkline: {
                    enabled: true
                },
                animations: {
                    enabled: true,
                    easing: 'easeinout',
                    speed: 800
                }
            },
            stroke: {
                curve: 'smooth',
                width: 2
            },
            fill: {
                opacity: config.type === 'area' ? 0.3 : 1,
                gradient: {
                    enabled: config.type === 'area',
                    opacityFrom: 0.6,
                    opacityTo: 0.1
                }
            },
            colors: [config.color],
            tooltip: {
                enabled: true,
                theme: 'dark',
                style: {
                    fontSize: '12px'
                }
            }
        };
        
        this.charts[elementId] = new ApexCharts(element, options);
        this.charts[elementId].render();
    }
    
    createGauge(elementId, config) {
        const element = document.querySelector(`#${elementId}`);
        if (!element) return;
        
        const options = {
            series: [Math.round((config.value / config.max) * 100)],
            chart: {
                height: 80,
                type: 'radialBar'
            },
            plotOptions: {
                radialBar: {
                    hollow: {
                        size: '65%'
                    },
                    track: {
                        background: 'rgba(255, 255, 255, 0.1)',
                        strokeWidth: '100%'
                    },
                    dataLabels: {
                        name: {
                            show: false
                        },
                        value: {
                            fontSize: '14px',
                            fontWeight: 600,
                            color: '#fff',
                            formatter: function() {
                                return config.value + '%';
                            }
                        }
                    }
                }
            },
            colors: [config.value >= config.target ? '#10B981' : '#F59E0B'],
            stroke: {
                lineCap: 'round'
            }
        };
        
        this.charts[elementId] = new ApexCharts(element, options);
        this.charts[elementId].render();
    }
    
    createNPSIndicator(elementId, score) {
        const element = document.querySelector(`#${elementId}`);
        if (!element) return;
        
        // Calculer les segments basés sur le score NPS
        const promoters = Math.max(0, score + 15); // Simulation
        const passives = Math.max(0, 100 - promoters - Math.max(0, 15 - score));
        const detractors = Math.max(0, 15 - score);
        
        element.innerHTML = `
            <div style=\"display: flex; gap: 2px; height: 6px; border-radius: 3px; overflow: hidden;\">
                <div style=\"flex: ${promoters}; background: #10B981;\"></div>
                <div style=\"flex: ${passives}; background: #F59E0B;\"></div>
                <div style=\"flex: ${detractors}; background: #EF4444;\"></div>
            </div>
        `;
    }
    
    // FILTRAGE PAR ENTREPRISE
    async filterByCompany(companyCode) {
        this.currentCompany = companyCode;
        
        // Recharger toutes les données pour l'entreprise sélectionnée
        await this.loadCEOMetricsFromAPI();
        
        // Mise à jour des sparklines avec nouvelles données
        this.updateSparklines(companyCode);
    }
    
    updateAllMetrics(metrics) {
        // Mise à jour Cash Runway
        const cashValue = document.querySelector('.metric-card.critical .metric-value');
        if (cashValue) {
            cashValue.textContent = `${metrics.cashRunway} mois`;
            cashValue.className = `metric-value ${metrics.cashRunway < 3 ? 'danger' : metrics.cashRunway < 6 ? 'warning' : 'success'}`;
        }
        
        // Mise à jour ARR
        const arrValue = document.querySelector('.metric-card:nth-child(2) .metric-value');
        if (arrValue) {
            arrValue.textContent = `€${(metrics.arr / 1000000).toFixed(1)}M`;
        }
        
        // Mise à jour EBITDA
        const ebitdaValue = document.querySelector('.metric-card:nth-child(3) .metric-value');
        if (ebitdaValue) {
            ebitdaValue.textContent = `${metrics.ebitdaMargin}%`;
        }
        
        // Mise à jour LTV:CAC
        const ltvCacValue = document.querySelector('.metric-card:nth-child(4) .metric-value');
        if (ltvCacValue) {
            ltvCacValue.textContent = `${metrics.ltvCac}:1`;
            ltvCacValue.className = `metric-value ${metrics.ltvCac < 3 ? 'warning' : 'success'}`;
        }
        
        // Mise à jour NPS
        const npsValue = document.querySelector('.metric-card:nth-child(5) .metric-value');
        if (npsValue) {
            npsValue.textContent = metrics.nps.toString();
            npsValue.className = `metric-value ${metrics.nps < 30 ? 'danger' : metrics.nps < 50 ? 'warning' : 'success'}`;
        }
    }
    
    updateSparklines(companyCode) {
        // Données simulées par entreprise pour les sparklines
        const sparklineData = {
            all: {
                cash: [892, 834, 756, 689, 612, 534, 467, 389, 312, 245],
                arr: [5.2, 5.5, 5.8, 6.1, 6.3, 6.6, 6.8, 7.0, 7.2]
            },
            hypervisual: {
                cash: [340, 335, 328, 322, 315, 308, 302, 295, 288, 280],
                arr: [1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.8, 1.8]
            }
            // Ajouter plus de données...
        };
        
        const data = sparklineData[companyCode] || sparklineData.all;
        
        // Mettre à jour les graphiques
        if (this.charts['cash-sparkline']) {
            this.charts['cash-sparkline'].updateSeries([{ data: data.cash }]);
        }
        
        if (this.charts['arr-sparkline']) {
            this.charts['arr-sparkline'].updateSeries([{ data: data.arr }]);
        }
    }
    
    // MISE À JOUR DES BLOCS OPÉRATIONNELS
    updateFinancialBlock(data) {
        const financialBlock = document.querySelector('.operational-block:nth-child(1)');
        if (!financialBlock) return;
        
        const metrics = financialBlock.querySelectorAll('.metric-number');
        if (metrics.length >= 3) {
            metrics[0].textContent = this.formatCurrency(data.treasury);
            metrics[1].textContent = this.formatCurrency(data.receivables);
            metrics[2].textContent = this.formatCurrency(data.payables);
        }
    }
    
    updateSalesBlock(data) {
        const salesBlock = document.querySelector('.operational-block:nth-child(3)');
        if (!salesBlock) return;
        
        const metrics = salesBlock.querySelectorAll('.metric-number');
        if (metrics.length >= 3) {
            metrics[0].textContent = this.formatCurrency(data.pipelineValue);
            metrics[1].textContent = `${data.conversionRate}%`;
            metrics[2].textContent = `${Math.round(data.averageDealSize / 1000)}j`;
        }
    }
    
    updateMarketingBlock(data) {
        const marketingBlock = document.querySelector('.operational-block:nth-child(4)');
        if (!marketingBlock) return;
        
        const metrics = marketingBlock.querySelectorAll('.metric-number');
        if (metrics.length >= 3) {
            metrics[0].textContent = data.totalLeads.toString();
            metrics[1].textContent = `€${Math.round(data.costPerLead)}`;
            metrics[2].textContent = `${Math.round(data.roi)}%`;
        }
    }
    
    updateOperationalBlocks(data) {
        // Mise à jour du bloc Tâches
        const tasksBlock = document.querySelector('.operational-block:nth-child(2)');
        if (tasksBlock) {
            const metrics = tasksBlock.querySelectorAll('.metric-number');
            if (metrics.length >= 3) {
                metrics[0].textContent = data.tasks.inProgress.toString();
                metrics[1].textContent = data.tasks.overdue.toString();
                metrics[2].textContent = data.tasks.completed.toString();
            }
        }
        
        // Mise à jour du bloc Performance
        const performanceBlock = document.querySelector('.operational-block:nth-child(5)');
        if (performanceBlock) {
            const metrics = performanceBlock.querySelectorAll('.metric-number');
            if (metrics.length >= 3) {
                metrics[0].textContent = `${data.performance.teamProductivity}%`;
                metrics[1].textContent = `${data.support.avgResolutionTime.toFixed(1)}h`;
                metrics[2].textContent = `${data.support.satisfaction.toFixed(1)}/5`;
            }
        }
    }
    
    updateAlertsBlock(data) {
        const alertsBlock = document.querySelector('.operational-block:nth-child(6)');
        if (!alertsBlock) return;
        
        const metrics = alertsBlock.querySelectorAll('.metric-number');
        if (metrics.length >= 3) {
            metrics[0].textContent = data.critical.toString();
            metrics[1].textContent = data.warning.toString();
            metrics[2].textContent = data.system.toString();
        }
        
        // Mettre à jour le badge de notification dans la navbar
        const notificationDot = document.querySelector('.notification-dot');
        if (notificationDot && data.critical > 0) {
            notificationDot.style.display = 'block';
        }
    }
    
    // ALERTES ET SEUILS
    checkAlertThresholds(metrics) {
        const alerts = [];
        
        if (metrics.cashRunway < this.alertThresholds.cashRunway) {
            alerts.push({
                level: metrics.cashRunway < 3 ? 'critical' : 'warning',
                message: `Cash runway: ${metrics.cashRunway} mois`,
                action: 'Bridge financing needed'
            });
        }
        
        if (metrics.ebitdaMargin < this.alertThresholds.ebitdaMargin) {
            alerts.push({
                level: 'warning',
                message: `EBITDA margin sous objectif: ${metrics.ebitdaMargin}%`,
                action: 'Cost optimization review'
            });
        }
        
        if (metrics.ltvCac < this.alertThresholds.ltvCacRatio) {
            alerts.push({
                level: 'warning',
                message: `LTV:CAC ratio: ${metrics.ltvCac}:1`,
                action: 'Unit economics review'
            });
        }
        
        this.displayAlerts(alerts);
    }
    
    displayAlerts(alerts) {
        alerts.forEach(alert => {
            console.log(`🚨 ${alert.level.toUpperCase()}: ${alert.message}`);
            
            // Envoyer notification si critique
            if (alert.level === 'critical') {
                this.sendNotification(alert);
            }
        });
        
        // Mettre à jour le badge d'alertes dans la navbar
        const alertBadge = document.querySelector('.notification-dot');
        if (alertBadge && alerts.length > 0) {
            alertBadge.style.display = 'block';
        }
    }
    
    sendNotification(alert) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Alerte Critique Dashboard CEO', {
                body: alert.message,
                icon: '/favicon.ico',
                requireInteraction: true,
                tag: 'ceo-alert'
            });
        }
    }
    
    // MISE À JOUR TEMPS RÉEL
    setupRealTimeUpdates() {
        // Mise à jour des métriques toutes les 30 secondes
        setInterval(async () => {
            await this.loadCEOMetricsFromAPI();
        }, this.refreshInterval);
        
        console.log(`⏱️ Real-time updates every ${this.refreshInterval/1000}s`);
    }
    
    // ÉVÉNEMENTS
    bindEvents() {
        // Demander permission pour les notifications
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
        
        // Raccourcis clavier
        document.addEventListener('keydown', async (e) => {
            // Ctrl/Cmd + R pour rafraîchir
            if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
                e.preventDefault();
                await this.loadCEOMetricsFromAPI();
                console.log('📊 Manual refresh triggered');
            }
        });
    }
    
    // UTILITAIRES
    formatCurrency(amount) {
        if (amount >= 1000000) {
            return `€${(amount / 1000000).toFixed(1)}M`;
        } else if (amount >= 1000) {
            return `€${(amount / 1000).toFixed(0)}K`;
        }
        return `€${amount}`;
    }
    
    formatPercentage(value, decimals = 1) {
        return `${value.toFixed(decimals)}%`;
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    // Charger ApexCharts si pas déjà présent
    if (typeof ApexCharts === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/apexcharts@latest/dist/apexcharts.min.js';
        script.onload = () => {
            window.ceoDashboard = new CEODashboard();
        };
        document.head.appendChild(script);
    } else {
        window.ceoDashboard = new CEODashboard();
    }
});

// Export pour usage externe
window.CEODashboard = CEODashboard;