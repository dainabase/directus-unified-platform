// dashboard-revendeur-notion.js - Intégration Notion pour le dashboard revendeur
// Ce fichier gère la connexion avec les bases de données Notion pour l'espace revendeur

const DashboardRevendeurNotion = {
    // Configuration
    REFRESH_INTERVAL: 30000, // 30 secondes
    refreshTimer: null,
    
    // IDs des bases de données
    DB_IDS: {
        VENTES: '236adb95-3c6f-8018-b3ba-fa5c85c9e9e6',
        PIPELINE: '22eadb95-3c6f-8024-89c2-fde6ef18d2d0',
        COMMISSIONS: '236adb95-3c6f-80c0-9751-fcf5dfe35564',
        ZONES_GEO: '236adb95-3c6f-801b-b7d2-fce14f6c3d11',
        CONTACTS: '223adb95-3c6f-80e7-aa2b-cfd9888f2af3'
    },
    
    // État local
    currentPeriod: 'month', // month, quarter, year
    currentData: null,
    
    // Initialisation
    init() {
        console.log('🔌 Initialisation du dashboard revendeur avec Notion');
        this.loadDashboardData();
        this.attachEventListeners();
        this.startAutoRefresh();
    },
    
    // Attacher les écouteurs d'événements
    attachEventListeners() {
        // Sélecteur de période
        const periodSelector = document.getElementById('period-selector');
        if (periodSelector) {
            periodSelector.addEventListener('change', (e) => {
                this.currentPeriod = e.target.value;
                this.loadDashboardData();
            });
        }
        
        // Bouton de rafraîchissement
        const refreshBtn = document.getElementById('refresh-dashboard');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadDashboardData());
        }
        
        // Actions rapides
        document.querySelectorAll('[data-quick-action]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleQuickAction(e.target.dataset.quickAction);
            });
        });
    },
    
    // Démarrer le rafraîchissement automatique
    startAutoRefresh() {
        this.refreshTimer = setInterval(() => {
            this.loadDashboardData(true); // silent refresh
        }, this.REFRESH_INTERVAL);
    },
    
    // Arrêter le rafraîchissement automatique
    stopAutoRefresh() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
        }
    },
    
    // Charger toutes les données du dashboard
    async loadDashboardData(silent = false) {
        try {
            // Récupérer l'utilisateur connecté
            const currentUser = window.AuthNotionModule?.getCurrentUser();
            if (!currentUser || currentUser.role !== 'revendeur') {
                console.warn('Utilisateur non connecté ou mauvais rôle');
                window.location.href = '/portal-project/login.html';
                return;
            }
            
            // Vérifier les permissions d'accès au dashboard revendeur
            const canAccessDashboard = await window.PermissionsNotion.checkPermission(
                currentUser.id,
                'dashboard.revendeur',
                'view'
            );
            
            if (!canAccessDashboard) {
                window.showNotification('Accès non autorisé au dashboard revendeur', 'error');
                window.location.href = '/portal-project/login.html';
                return;
            }
            
            if (!silent) {
                this.showLoadingState();
            }
            
            // Charger toutes les données en parallèle
            const [salesData, pipelineData, commissionsData, geoData] = await Promise.all([
                this.loadSalesData(currentUser.id),
                this.loadPipelineData(currentUser.id),
                this.loadCommissionsData(currentUser.id),
                this.loadGeographicData(currentUser.id)
            ]);
            
            // Calculer les KPIs
            const kpis = this.calculateKPIs(salesData, pipelineData, commissionsData);
            
            // Stocker les données
            this.currentData = {
                sales: salesData,
                pipeline: pipelineData,
                commissions: commissionsData,
                geographic: geoData,
                kpis: kpis
            };
            
            // Mettre à jour l'interface
            this.updateDashboard(this.currentData);
            
            if (!silent) {
                this.hideLoadingState();
            }
            
            // Logger l'accès
            await window.PermissionsNotion.logAccess('view', 'dashboard.revendeur', true, {
                userId: currentUser.id,
                salesCount: salesData.list.length,
                pipelineValue: pipelineData.metrics?.pipelineValue || 0,
                commissionsTotal: commissionsData.total || 0
            });
            
        } catch (error) {
            console.error('Erreur lors du chargement du dashboard:', error);
            if (!silent) {
                this.showErrorState();
            }
            
            if (window.PermissionsNotion && window.AuthNotionModule?.getCurrentUser()) {
                await window.PermissionsNotion.logAccess('view', 'dashboard.revendeur', false, {
                    error: error.message
                });
            }
        }
    },
    
    // Charger les données de ventes
    async loadSalesData(revendeurId) {
        try {
            // Vérifier les permissions pour voir les ventes
            const canViewSales = await window.PermissionsNotion.checkPermission(
                revendeurId,
                'sales',
                'view.own'
            );
            
            if (!canViewSales) {
                console.warn('Pas de permission pour voir les ventes');
                return { list: [], stats: {} };
            }
            
            const sales = await window.PermissionsMiddleware.secureApiCall(
                'sales',
                'view',
                window.NotionConnector.revendeur.getRevendeurSales.bind(window.NotionConnector.revendeur),
                revendeurId
            );
            
            // Filtrer selon la période
            const filteredSales = this.filterByPeriod(sales, this.currentPeriod);
            
            // Calculer les statistiques
            const stats = {
                totalSales: filteredSales.length,
                totalRevenue: filteredSales.reduce((sum, s) => sum + (s.amount || 0), 0),
                totalCommissions: filteredSales.reduce((sum, s) => sum + (s.commission || 0), 0),
                avgDealSize: filteredSales.length > 0 
                    ? Math.round(filteredSales.reduce((sum, s) => sum + (s.amount || 0), 0) / filteredSales.length)
                    : 0,
                topProducts: this.getTopProducts(filteredSales),
                salesTrend: this.calculateTrend(sales, this.currentPeriod)
            };
            
            return {
                list: filteredSales,
                stats: stats
            };
            
        } catch (error) {
            console.error('Erreur chargement ventes:', error);
            return { list: [], stats: {} };
        }
    },
    
    // Charger les données du pipeline
    async loadPipelineData(revendeurId) {
        try {
            // Vérifier les permissions pour voir le pipeline
            const canViewPipeline = await window.PermissionsNotion.checkPermission(
                revendeurId,
                'pipeline',
                'view.own'
            );
            
            if (!canViewPipeline) {
                console.warn('Pas de permission pour voir le pipeline');
                return { leads: [], stages: [], metrics: {} };
            }
            
            const pipeline = await window.PermissionsMiddleware.secureApiCall(
                'pipeline',
                'view',
                window.NotionConnector.revendeur.getSalesPipeline.bind(window.NotionConnector.revendeur),
                revendeurId
            );
            
            // Calculer les métriques du pipeline
            const metrics = {
                totalLeads: pipeline.leads.length,
                qualifiedLeads: pipeline.leads.filter(l => l.stage !== 'Nouveau').length,
                conversionRate: this.calculateConversionRate(pipeline),
                avgDealCycle: this.calculateAvgDealCycle(pipeline.leads),
                pipelineValue: pipeline.leads.reduce((sum, l) => sum + (l.value || 0), 0),
                weightedValue: pipeline.leads.reduce((sum, l) => 
                    sum + ((l.value || 0) * (l.probability || 0) / 100), 0
                ),
                stageDistribution: pipeline.stages,
                hotLeads: pipeline.leads.filter(l => l.probability >= 70)
            };
            
            return {
                leads: pipeline.leads,
                stages: pipeline.stages,
                metrics: metrics
            };
            
        } catch (error) {
            console.error('Erreur chargement pipeline:', error);
            return { leads: [], stages: {}, metrics: {} };
        }
    },
    
    // Charger les données de commissions
    async loadCommissionsData(revendeurId) {
        try {
            // Vérifier les permissions pour voir les commissions
            const canViewCommissions = await window.PermissionsNotion.checkPermission(
                revendeurId,
                'commissions',
                'view.own'
            );
            
            if (!canViewCommissions) {
                console.warn('Pas de permission pour voir les commissions');
                return { total: 0, details: [], analysis: {} };
            }
            
            const commissions = await window.PermissionsMiddleware.secureApiCall(
                'commissions',
                'view',
                window.NotionConnector.revendeur.getRevendeurCommissions.bind(window.NotionConnector.revendeur),
                revendeurId
            );
            
            // Analyser les commissions par période
            const analysis = {
                currentPeriod: this.getCurrentPeriodCommissions(commissions, this.currentPeriod),
                previousPeriod: this.getPreviousPeriodCommissions(commissions, this.currentPeriod),
                growth: 0,
                projectedEarnings: this.calculateProjectedEarnings(commissions),
                topEarningMonths: this.getTopEarningMonths(commissions.details)
            };
            
            // Calculer la croissance
            if (analysis.previousPeriod > 0) {
                analysis.growth = Math.round(
                    ((analysis.currentPeriod - analysis.previousPeriod) / analysis.previousPeriod) * 100
                );
            }
            
            return {
                ...commissions,
                analysis: analysis
            };
            
        } catch (error) {
            console.error('Erreur chargement commissions:', error);
            return { total: 0, paid: 0, pending: 0, analysis: {} };
        }
    },
    
    // Charger les données géographiques
    async loadGeographicData(revendeurId) {
        try {
            // Vérifier les permissions pour voir les zones géographiques
            const canViewZones = await window.PermissionsNotion.checkPermission(
                revendeurId,
                'zones',
                'view.own'
            );
            
            if (!canViewZones) {
                console.warn('Pas de permission pour voir les zones géographiques');
                return { zones: [], analysis: {} };
            }
            
            const zones = await window.PermissionsMiddleware.secureApiCall(
                'zones',
                'view',
                window.NotionConnector.revendeur.getGeographicZones.bind(window.NotionConnector.revendeur),
                revendeurId
            );
            
            // Analyser les performances par zone
            const zoneAnalysis = zones.map(zone => ({
                ...zone,
                performance: {
                    conversionRate: zone.clients > 0 ? Math.round((zone.clients / zone.potential) * 10000) / 100 : 0,
                    penetrationRate: this.calculatePenetrationRate(zone),
                    growthPotential: zone.potential - zone.revenue,
                    avgClientValue: zone.clients > 0 ? Math.round(zone.revenue / zone.clients) : 0
                }
            }));
            
            // Trier par potentiel de croissance
            zoneAnalysis.sort((a, b) => b.performance.growthPotential - a.performance.growthPotential);
            
            return zoneAnalysis;
            
        } catch (error) {
            console.error('Erreur chargement zones géographiques:', error);
            return [];
        }
    },
    
    // Calculer les KPIs globaux
    calculateKPIs(salesData, pipelineData, commissionsData) {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        // Objectifs (à récupérer depuis Notion idéalement)
        const targets = {
            monthly: 100000,
            quarterly: 300000,
            yearly: 1200000
        };
        
        // Calculer la progression vers l'objectif
        let targetProgress = 0;
        let currentTarget = 0;
        
        switch (this.currentPeriod) {
            case 'month':
                currentTarget = targets.monthly;
                targetProgress = Math.round((salesData.stats.totalRevenue / currentTarget) * 100);
                break;
            case 'quarter':
                currentTarget = targets.quarterly;
                targetProgress = Math.round((salesData.stats.totalRevenue / currentTarget) * 100);
                break;
            case 'year':
                currentTarget = targets.yearly;
                targetProgress = Math.round((salesData.stats.totalRevenue / currentTarget) * 100);
                break;
        }
        
        return {
            revenue: salesData.stats.totalRevenue,
            commissions: commissionsData.analysis.currentPeriod,
            deals: salesData.stats.totalSales,
            conversionRate: pipelineData.metrics.conversionRate,
            pipelineValue: pipelineData.metrics.pipelineValue,
            avgDealSize: salesData.stats.avgDealSize,
            targetProgress: targetProgress,
            currentTarget: currentTarget,
            hotLeads: pipelineData.metrics.hotLeads.length,
            totalLeads: pipelineData.metrics.totalLeads
        };
    },
    
    // Mettre à jour l'interface du dashboard
    updateDashboard(data) {
        // Mettre à jour les KPIs principaux
        this.updateMainKPIs(data.kpis);
        
        // Mettre à jour les graphiques
        this.updateCharts(data);
        
        // Mettre à jour le pipeline
        this.updatePipelineView(data.pipeline);
        
        // Mettre à jour les ventes récentes
        this.updateRecentSales(data.sales.list);
        
        // Mettre à jour la vue géographique
        this.updateGeographicView(data.geographic);
        
        // Mettre à jour les statistiques de commissions
        this.updateCommissionsStats(data.commissions);
    },
    
    // Mettre à jour les KPIs principaux
    updateMainKPIs(kpis) {
        // CA total
        const revenueElement = document.getElementById('total-revenue');
        if (revenueElement) {
            revenueElement.textContent = window.NotionConnector.utils.formatCurrency(kpis.revenue);
        }
        
        // Commissions
        const commissionsElement = document.getElementById('total-commissions');
        if (commissionsElement) {
            commissionsElement.textContent = window.NotionConnector.utils.formatCurrency(kpis.commissions);
        }
        
        // Nombre de deals
        const dealsElement = document.getElementById('total-deals');
        if (dealsElement) {
            dealsElement.textContent = kpis.deals;
        }
        
        // Taux de conversion
        const conversionElement = document.getElementById('conversion-rate');
        if (conversionElement) {
            conversionElement.innerHTML = `${kpis.conversionRate}%`;
            const arrow = kpis.conversionRate > 20 ? 'ti-trending-up text-success' : 
                         kpis.conversionRate > 10 ? 'ti-minus text-warning' : 
                         'ti-trending-down text-danger';
            conversionElement.innerHTML += ` <i class="ti ${arrow} ms-1"></i>`;
        }
        
        // Progression objectif
        const progressElement = document.getElementById('target-progress');
        if (progressElement) {
            progressElement.style.width = Math.min(kpis.targetProgress, 100) + '%';
            progressElement.className = `progress-bar ${
                kpis.targetProgress >= 100 ? 'bg-success' :
                kpis.targetProgress >= 70 ? 'bg-primary' :
                kpis.targetProgress >= 50 ? 'bg-warning' : 'bg-danger'
            }`;
        }
        
        const progressTextElement = document.getElementById('target-progress-text');
        if (progressTextElement) {
            progressTextElement.textContent = `${kpis.targetProgress}% de l'objectif (${window.NotionConnector.utils.formatCurrency(kpis.currentTarget)})`;
        }
        
        // Hot leads
        const hotLeadsElement = document.getElementById('hot-leads-count');
        if (hotLeadsElement) {
            hotLeadsElement.innerHTML = `
                <span class="fs-2 fw-bold text-danger">${kpis.hotLeads}</span>
                <span class="text-muted">/ ${kpis.totalLeads} leads</span>
            `;
        }
    },
    
    // Mettre à jour les graphiques
    updateCharts(data) {
        // Graphique de performance des ventes
        if (window.salesChart) {
            const salesByMonth = this.groupSalesByMonth(data.sales.list);
            const months = Object.keys(salesByMonth).sort();
            const revenues = months.map(m => salesByMonth[m].revenue);
            const counts = months.map(m => salesByMonth[m].count);
            
            window.salesChart.updateOptions({
                xaxis: { categories: months }
            });
            
            window.salesChart.updateSeries([
                { name: 'Chiffre d\'affaires', data: revenues },
                { name: 'Nombre de ventes', data: counts }
            ]);
        }
        
        // Graphique du pipeline par étape
        if (window.pipelineChart && data.pipeline.stages) {
            const stages = Object.keys(data.pipeline.stages);
            const values = stages.map(s => data.pipeline.stages[s].value);
            
            window.pipelineChart.updateOptions({
                labels: stages
            });
            
            window.pipelineChart.updateSeries(values);
        }
        
        // Graphique géographique
        if (window.geoChart && data.geographic.length > 0) {
            const zones = data.geographic.slice(0, 5); // Top 5 zones
            const zoneNames = zones.map(z => z.name);
            const zoneRevenues = zones.map(z => z.revenue);
            const zonePotentials = zones.map(z => z.potential);
            
            window.geoChart.updateOptions({
                xaxis: { categories: zoneNames }
            });
            
            window.geoChart.updateSeries([
                { name: 'CA réalisé', data: zoneRevenues },
                { name: 'Potentiel', data: zonePotentials }
            ]);
        }
    },
    
    // Mettre à jour la vue du pipeline
    updatePipelineView(pipeline) {
        const container = document.getElementById('pipeline-summary');
        if (!container) return;
        
        const stages = ['Nouveau', 'Qualification', 'Proposition', 'Négociation', 'Gagné'];
        
        container.innerHTML = stages.map(stage => {
            const stageData = pipeline.stages[stage] || { count: 0, value: 0 };
            const stageLeads = pipeline.leads.filter(l => l.stage === stage);
            
            return `
                <div class="col">
                    <div class="card h-100">
                        <div class="card-body p-3">
                            <div class="d-flex align-items-center mb-2">
                                <span class="badge ${this.getStageBadgeClass(stage)} badge-sm me-2">
                                    ${stageData.count}
                                </span>
                                <h4 class="card-title mb-0 fs-5">${stage}</h4>
                            </div>
                            <div class="text-muted small">
                                ${window.NotionConnector.utils.formatCurrency(stageData.value)}
                            </div>
                            ${stageLeads.length > 0 ? `
                                <div class="mt-2">
                                    ${stageLeads.slice(0, 2).map(lead => `
                                        <div class="text-truncate small">
                                            <a href="pipeline.html#lead-${lead.id}" class="text-reset">
                                                ${lead.company}
                                            </a>
                                        </div>
                                    `).join('')}
                                    ${stageLeads.length > 2 ? `
                                        <div class="text-muted small">
                                            +${stageLeads.length - 2} autres
                                        </div>
                                    ` : ''}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },
    
    // Mettre à jour les ventes récentes
    updateRecentSales(sales) {
        const container = document.getElementById('recent-sales-list');
        if (!container) return;
        
        const recentSales = sales.slice(0, 5);
        
        if (recentSales.length === 0) {
            container.innerHTML = `
                <div class="text-center text-muted py-4">
                    <i class="ti ti-shopping-cart-off fs-1 mb-2"></i>
                    <p>Aucune vente récente</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = recentSales.map(sale => `
            <div class="list-group-item">
                <div class="row align-items-center">
                    <div class="col-auto">
                        <span class="status-dot ${sale.status === 'Finalisée' ? 'bg-success' : 'bg-warning'} d-block"></span>
                    </div>
                    <div class="col">
                        <div class="text-body d-block">${sale.client}</div>
                        <div class="d-block text-muted text-truncate mt-n1">
                            ${sale.product} - ${window.NotionConnector.utils.formatDate(sale.date)}
                        </div>
                    </div>
                    <div class="col-auto">
                        <div class="font-weight-medium">
                            ${window.NotionConnector.utils.formatCurrency(sale.amount)}
                        </div>
                        <div class="text-success small">
                            +${window.NotionConnector.utils.formatCurrency(sale.commission)}
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Ajouter le lien vers toutes les ventes
        container.innerHTML += `
            <div class="list-group-item">
                <div class="row align-items-center">
                    <div class="col text-center">
                        <a href="clients.html" class="text-primary">
                            Voir toutes les ventes <i class="ti ti-arrow-right ms-1"></i>
                        </a>
                    </div>
                </div>
            </div>
        `;
    },
    
    // Mettre à jour la vue géographique
    updateGeographicView(zones) {
        const container = document.getElementById('geographic-performance');
        if (!container) return;
        
        if (zones.length === 0) {
            container.innerHTML = `
                <div class="text-center text-muted py-4">
                    <i class="ti ti-map-off fs-1 mb-2"></i>
                    <p>Aucune zone géographique assignée</p>
                </div>
            `;
            return;
        }
        
        // Top 3 zones par potentiel
        const topZones = zones.slice(0, 3);
        
        container.innerHTML = topZones.map(zone => `
            <div class="col-md-4">
                <div class="card">
                    <div class="card-body">
                        <h4 class="card-title">${zone.name}</h4>
                        <div class="mb-3">
                            <div class="d-flex justify-content-between text-muted small mb-1">
                                <span>Pénétration</span>
                                <span>${zone.performance.conversionRate}%</span>
                            </div>
                            <div class="progress progress-sm">
                                <div class="progress-bar bg-primary" 
                                     style="width: ${zone.performance.conversionRate}%">
                                </div>
                            </div>
                        </div>
                        <div class="row g-2 text-center">
                            <div class="col-6">
                                <div class="text-muted small">Clients</div>
                                <div class="font-weight-medium">${zone.clients}</div>
                            </div>
                            <div class="col-6">
                                <div class="text-muted small">CA réalisé</div>
                                <div class="font-weight-medium">
                                    ${window.NotionConnector.utils.formatCurrency(zone.revenue)}
                                </div>
                            </div>
                        </div>
                        <div class="mt-3 pt-3 border-top">
                            <div class="text-muted small">Potentiel restant</div>
                            <div class="h4 mb-0 text-primary">
                                ${window.NotionConnector.utils.formatCurrency(zone.performance.growthPotential)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    },
    
    // Mettre à jour les statistiques de commissions
    updateCommissionsStats(commissions) {
        const container = document.getElementById('commissions-summary');
        if (!container) return;
        
        container.innerHTML = `
            <div class="row g-3">
                <div class="col-6 col-lg-3">
                    <div class="card">
                        <div class="card-body p-3">
                            <div class="text-muted mb-1">Total gagné</div>
                            <div class="h3 mb-0">
                                ${window.NotionConnector.utils.formatCurrency(commissions.total)}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-6 col-lg-3">
                    <div class="card">
                        <div class="card-body p-3">
                            <div class="text-muted mb-1">Déjà versé</div>
                            <div class="h3 mb-0 text-success">
                                ${window.NotionConnector.utils.formatCurrency(commissions.paid)}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-6 col-lg-3">
                    <div class="card">
                        <div class="card-body p-3">
                            <div class="text-muted mb-1">En attente</div>
                            <div class="h3 mb-0 text-warning">
                                ${window.NotionConnector.utils.formatCurrency(commissions.pending)}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-6 col-lg-3">
                    <div class="card">
                        <div class="card-body p-3">
                            <div class="text-muted mb-1">Croissance</div>
                            <div class="h3 mb-0 ${commissions.analysis.growth >= 0 ? 'text-success' : 'text-danger'}">
                                ${commissions.analysis.growth > 0 ? '+' : ''}${commissions.analysis.growth}%
                                <i class="ti ${commissions.analysis.growth >= 0 ? 'ti-trending-up' : 'ti-trending-down'} ms-1"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    // Fonctions utilitaires
    filterByPeriod(items, period) {
        const now = new Date();
        let startDate;
        
        switch (period) {
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'quarter':
                const quarter = Math.floor(now.getMonth() / 3);
                startDate = new Date(now.getFullYear(), quarter * 3, 1);
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            default:
                return items;
        }
        
        return items.filter(item => 
            item.date && new Date(item.date) >= startDate
        );
    },
    
    getTopProducts(sales) {
        const productCounts = {};
        sales.forEach(sale => {
            const product = sale.product || 'Autre';
            productCounts[product] = (productCounts[product] || 0) + 1;
        });
        
        return Object.entries(productCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([product, count]) => ({ product, count }));
    },
    
    calculateTrend(sales, period) {
        // Simplification : retourner un trend aléatoire pour la démo
        // TODO: Implémenter le vrai calcul de tendance
        return Math.random() > 0.5 ? 'up' : 'down';
    },
    
    calculateConversionRate(pipeline) {
        if (!pipeline.stages) return 0;
        
        const totalLeads = Object.values(pipeline.stages)
            .reduce((sum, stage) => sum + stage.count, 0);
        const wonLeads = pipeline.stages['Gagné']?.count || 0;
        
        return totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;
    },
    
    calculateAvgDealCycle(leads) {
        // TODO: Implémenter le calcul réel basé sur les dates
        return 21; // jours
    },
    
    getCurrentPeriodCommissions(commissions, period) {
        // Simplification pour la démo
        switch (period) {
            case 'month':
                return commissions.thisMonth || 0;
            case 'quarter':
                return (commissions.thisMonth || 0) * 3; // Approximation
            case 'year':
                return commissions.total || 0;
            default:
                return 0;
        }
    },
    
    getPreviousPeriodCommissions(commissions, period) {
        // Simplification pour la démo
        switch (period) {
            case 'month':
                return commissions.lastMonth || 0;
            case 'quarter':
                return (commissions.lastMonth || 0) * 3; // Approximation
            case 'year':
                return commissions.total * 0.8 || 0; // Approximation
            default:
                return 0;
        }
    },
    
    calculateProjectedEarnings(commissions) {
        // Projection basée sur la moyenne mensuelle
        const monthlyAvg = commissions.thisMonth || 0;
        return monthlyAvg * 12;
    },
    
    getTopEarningMonths(details) {
        if (!details || details.length === 0) return [];
        
        return [...details]
            .sort((a, b) => b.commission - a.commission)
            .slice(0, 3);
    },
    
    calculatePenetrationRate(zone) {
        // Calcul simplifié du taux de pénétration
        if (!zone.potential || zone.potential === 0) return 0;
        return Math.round((zone.revenue / zone.potential) * 100);
    },
    
    groupSalesByMonth(sales) {
        const grouped = {};
        
        sales.forEach(sale => {
            const date = new Date(sale.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            if (!grouped[monthKey]) {
                grouped[monthKey] = { revenue: 0, count: 0 };
            }
            
            grouped[monthKey].revenue += sale.amount || 0;
            grouped[monthKey].count += 1;
        });
        
        return grouped;
    },
    
    getStageBadgeClass(stage) {
        const classes = {
            'Nouveau': 'badge-secondary',
            'Qualification': 'badge-info',
            'Proposition': 'badge-primary',
            'Négociation': 'badge-warning',
            'Gagné': 'badge-success',
            'Perdu': 'badge-danger'
        };
        return classes[stage] || 'badge-secondary';
    },
    
    // Actions rapides
    handleQuickAction(action) {
        switch (action) {
            case 'new-lead':
                window.location.href = 'pipeline.html#new-lead';
                break;
            case 'new-sale':
                window.location.href = 'clients.html#new-sale';
                break;
            case 'view-reports':
                window.location.href = 'reports.html';
                break;
            default:
                console.log('Action rapide:', action);
        }
    },
    
    // États de chargement
    showLoadingState() {
        const containers = ['main-kpis', 'pipeline-summary', 'recent-sales-list'];
        containers.forEach(id => {
            const container = document.getElementById(id);
            if (container && !container.querySelector('.spinner-border')) {
                const spinner = document.createElement('div');
                spinner.className = 'text-center py-4';
                spinner.innerHTML = '<div class="spinner-border text-primary" role="status"></div>';
                spinner.id = 'loading-spinner-' + id;
                container.prepend(spinner);
            }
        });
    },
    
    hideLoadingState() {
        document.querySelectorAll('[id^="loading-spinner-"]').forEach(spinner => {
            spinner.remove();
        });
    },
    
    showErrorState() {
        if (window.showNotification) {
            window.showNotification('Erreur lors du chargement du dashboard', 'error');
        }
        this.hideLoadingState();
    },
    
    // Nettoyage lors de la destruction
    destroy() {
        this.stopAutoRefresh();
    }
};

// Auto-initialisation
document.addEventListener('DOMContentLoaded', () => {
    // Vérifier qu'on est sur le dashboard revendeur
    if (window.location.pathname.includes('revendeur/dashboard.html')) {
        // Attendre que NotionConnector soit prêt
        const checkNotionConnector = setInterval(() => {
            if (window.NotionConnector && window.AuthNotionModule) {
                clearInterval(checkNotionConnector);
                DashboardRevendeurNotion.init();
            }
        }, 100);
    }
});

// Nettoyage lors du changement de page
window.addEventListener('beforeunload', () => {
    if (window.DashboardRevendeurNotion) {
        window.DashboardRevendeurNotion.destroy();
    }
});

// Export global
window.DashboardRevendeurNotion = DashboardRevendeurNotion;