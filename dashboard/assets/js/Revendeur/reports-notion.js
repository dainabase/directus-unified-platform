// reports-notion.js - Intégration Notion pour les rapports revendeur
// Ce fichier gère la connexion avec les bases de données Notion pour les rapports et analytics

const ReportsNotion = {
    // Configuration
    DB_IDS: {
        SALES_DATA: '236adb95-3c6f-8018-b3ba-fa5c85c9e9e6',
        COMMISSIONS: '236adb95-3c6f-80c0-9751-fcf5dfe35564',
        PIPELINE: '22eadb95-3c6f-8024-89c2-fde6ef18d2d0',
        CLIENTS: '223adb95-3c6f-80e7-aa2b-cfd9888f2af3',
        ACTIVITIES: '258adb95-3c6f-8078-b642-ffe8d9c5a123'
    },
    
    // État local
    currentReport: 'performance', // performance, commissions, pipeline, activities
    currentPeriod: 'month',
    currentData: null,
    charts: {},
    
    // Initialisation
    init() {
        console.log('🔌 Initialisation des rapports avec Notion');
        this.loadReportsData();
        this.attachEventListeners();
    },
    
    // Attacher les écouteurs d'événements
    attachEventListeners() {
        // Sélection du type de rapport
        document.querySelectorAll('[data-report-type]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchReport(e.target.dataset.reportType);
            });
        });
        
        // Sélecteur de période
        const periodSelector = document.getElementById('report-period');
        if (periodSelector) {
            periodSelector.addEventListener('change', (e) => {
                this.currentPeriod = e.target.value;
                this.loadReportsData();
            });
        }
        
        // Export des rapports
        const exportBtn = document.getElementById('export-report');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportReport());
        }
        
        // Bouton de rafraîchissement
        const refreshBtn = document.getElementById('refresh-reports');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadReportsData());
        }
        
        // Actions de comparaison
        document.querySelectorAll('[data-compare-action]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleCompareAction(e.target.dataset.compareAction);
            });
        });
    },
    
    // Charger les données des rapports depuis Notion
    async loadReportsData() {
        try {
            // Récupérer l'utilisateur connecté
            const currentUser = window.AuthNotionModule?.getCurrentUser();
            if (!currentUser || currentUser.role !== 'revendeur') {
                console.warn('Utilisateur non connecté ou mauvais rôle');
                window.location.href = '/portal-project/login.html';
                return;
            }
            
            // Vérifier les permissions pour voir les rapports
            const canViewReports = await window.PermissionsNotion.checkPermission(
                currentUser.id,
                'reports',
                'view.own'
            );
            
            if (!canViewReports) {
                window.showNotification('Vous n\'avez pas accès aux rapports', 'error');
                window.location.href = `/${currentUser.role}/dashboard.html`;
                return;
            }
            
            // Afficher le loader
            this.showLoadingState();
            
            // Charger toutes les données nécessaires en parallèle
            const [salesData, commissionsData, pipelineData, clientsData, activitiesData] = await Promise.all([
                this.loadSalesReportData(currentUser.id),
                this.loadCommissionsReportData(currentUser.id),
                this.loadPipelineReportData(currentUser.id),
                this.loadClientsReportData(currentUser.id),
                this.loadActivitiesReportData(currentUser.id)
            ]);
            
            // Calculer les métriques consolidées
            const consolidatedMetrics = this.calculateConsolidatedMetrics(
                salesData, commissionsData, pipelineData, clientsData, activitiesData
            );
            
            // Stocker les données
            this.currentData = {
                sales: salesData,
                commissions: commissionsData,
                pipeline: pipelineData,
                clients: clientsData,
                activities: activitiesData,
                metrics: consolidatedMetrics
            };
            
            // Mettre à jour l'interface
            this.updateReportsView();
            
            // Cacher le loader
            this.hideLoadingState();
            
            // Logger l'accès
            await window.PermissionsNotion.logAccess('view', 'reports', true, {
                reportType: this.currentReport,
                period: this.currentPeriod,
                dataPoints: Object.keys(this.currentData).length
            });
            
        } catch (error) {
            console.error('Erreur lors du chargement des rapports:', error);
            this.showErrorState();
            
            if (window.PermissionsNotion) {
                await window.PermissionsNotion.logAccess('view', 'reports', false, {
                    error: error.message
                });
            }
        }
    },
    
    // Charger les données de ventes pour les rapports
    async loadSalesReportData(revendeurId) {
        try {
            const canViewSales = await window.PermissionsNotion.checkPermission(
                revendeurId,
                'sales',
                'view.own'
            );
            
            if (!canViewSales) {
                return { list: [], metrics: {} };
            }
            
            const sales = await window.PermissionsMiddleware.secureApiCall(
                'sales',
                'view',
                this.getSalesForReports.bind(this),
                revendeurId,
                this.currentPeriod
            );
            
            // Analyser les tendances
            const metrics = {
                totalRevenue: sales.reduce((sum, s) => sum + (s.amount || 0), 0),
                totalDeals: sales.length,
                avgDealSize: sales.length > 0 ? Math.round(sales.reduce((sum, s) => sum + (s.amount || 0), 0) / sales.length) : 0,
                monthlyTrend: this.calculateMonthlyTrend(sales),
                topProducts: this.getTopProducts(sales),
                topClients: this.getTopClients(sales),
                conversionFunnel: this.calculateConversionFunnel(sales),
                seasonality: this.analyzeSeasonality(sales)
            };
            
            return {
                list: sales,
                metrics: metrics
            };
            
        } catch (error) {
            console.error('Erreur chargement rapports ventes:', error);
            return { list: [], metrics: {} };
        }
    },
    
    // Charger les données de commissions pour les rapports
    async loadCommissionsReportData(revendeurId) {
        try {
            const canViewCommissions = await window.PermissionsNotion.checkPermission(
                revendeurId,
                'commissions',
                'view.own'
            );
            
            if (!canViewCommissions) {
                return { list: [], analysis: {} };
            }
            
            const commissions = await window.PermissionsMiddleware.secureApiCall(
                'commissions',
                'view',
                this.getCommissionsForReports.bind(this),
                revendeurId,
                this.currentPeriod
            );
            
            // Analyser les commissions
            const analysis = {
                totalEarned: commissions.reduce((sum, c) => sum + (c.amount || 0), 0),
                avgCommissionRate: this.calculateAvgCommissionRate(commissions),
                paymentDelays: this.analyzePaymentDelays(commissions),
                monthlyBreakdown: this.getMonthlyCommissionsBreakdown(commissions),
                projections: this.calculateCommissionProjections(commissions),
                comparison: this.compareWithPreviousPeriod(commissions)
            };
            
            return {
                list: commissions,
                analysis: analysis
            };
            
        } catch (error) {
            console.error('Erreur chargement rapports commissions:', error);
            return { list: [], analysis: {} };
        }
    },
    
    // Charger les données du pipeline pour les rapports
    async loadPipelineReportData(revendeurId) {
        try {
            const canViewPipeline = await window.PermissionsNotion.checkPermission(
                revendeurId,
                'pipeline',
                'view.own'
            );
            
            if (!canViewPipeline) {
                return { leads: [], analysis: {} };
            }
            
            const pipeline = await window.PermissionsMiddleware.secureApiCall(
                'pipeline',
                'view',
                this.getPipelineForReports.bind(this),
                revendeurId
            );
            
            // Analyser le pipeline
            const analysis = {
                conversionRates: this.analyzeConversionRates(pipeline.leads),
                stageVelocity: this.calculateStageVelocity(pipeline.leads),
                leadSources: this.analyzeLeadSources(pipeline.leads),
                dealSizes: this.analyzeDealSizes(pipeline.leads),
                winLossAnalysis: this.performWinLossAnalysis(pipeline.leads),
                forecastAccuracy: this.calculateForecastAccuracy(pipeline.leads)
            };
            
            return {
                leads: pipeline.leads,
                stages: pipeline.stages,
                analysis: analysis
            };
            
        } catch (error) {
            console.error('Erreur chargement rapports pipeline:', error);
            return { leads: [], analysis: {} };
        }
    },
    
    // Charger les données clients pour les rapports
    async loadClientsReportData(revendeurId) {
        try {
            const canViewClients = await window.PermissionsNotion.checkPermission(
                revendeurId,
                'clients',
                'view.own'
            );
            
            if (!canViewClients) {
                return { list: [], insights: {} };
            }
            
            const clients = await window.PermissionsMiddleware.secureApiCall(
                'clients',
                'view',
                this.getClientsForReports.bind(this),
                revendeurId
            );
            
            // Analyser les clients
            const insights = {
                segmentation: this.segmentClients(clients),
                churnAnalysis: this.analyzeChurn(clients),
                lifetimeValue: this.calculateLifetimeValue(clients),
                satisfactionTrends: this.analyzeSatisfactionTrends(clients),
                growthOpportunities: this.identifyGrowthOpportunities(clients)
            };
            
            return {
                list: clients,
                insights: insights
            };
            
        } catch (error) {
            console.error('Erreur chargement rapports clients:', error);
            return { list: [], insights: {} };
        }
    },
    
    // Charger les données d'activité pour les rapports
    async loadActivitiesReportData(revendeurId) {
        try {
            const activities = await window.PermissionsMiddleware.secureApiCall(
                'activities',
                'view',
                this.getActivitiesForReports.bind(this),
                revendeurId,
                this.currentPeriod
            );
            
            // Analyser l'activité
            const patterns = {
                productivity: this.analyzeProductivity(activities),
                timeAllocation: this.analyzeTimeAllocation(activities),
                efficiency: this.calculateEfficiencyMetrics(activities),
                trends: this.identifyActivityTrends(activities)
            };
            
            return {
                list: activities,
                patterns: patterns
            };
            
        } catch (error) {
            console.error('Erreur chargement rapports activités:', error);
            return { list: [], patterns: {} };
        }
    },
    
    // Stubs pour les requêtes de données (à implémenter avec vraies requêtes Notion)
    async getSalesForReports(revendeurId, period) {
        // TODO: Implémenter la vraie requête Notion
        return [
            {
                id: 'sale1',
                amount: 125000,
                commission: 10625,
                client: 'TechCorp SA',
                product: 'Solution Cloud',
                date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'Finalisée'
            },
            {
                id: 'sale2',
                amount: 78000,
                commission: 7020,
                client: 'StartupFood',
                product: 'App Mobile',
                date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'Finalisée'
            }
        ];
    },
    
    async getCommissionsForReports(revendeurId, period) {
        // TODO: Implémenter la vraie requête Notion
        return [
            {
                id: 'comm1',
                amount: 10625,
                rate: 8.5,
                saleId: 'sale1',
                status: 'Payée',
                paymentDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
            }
        ];
    },
    
    async getPipelineForReports(revendeurId) {
        // TODO: Implémenter la vraie requête Notion
        return {
            leads: [
                {
                    id: 'lead1',
                    company: 'Innovation Tech',
                    stage: 'Qualification',
                    value: 75000,
                    probability: 40,
                    source: 'Site web',
                    createdDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
                }
            ],
            stages: {
                'Nouveau': { count: 5, value: 125000 },
                'Qualification': { count: 8, value: 340000 },
                'Proposition': { count: 4, value: 280000 }
            }
        };
    },
    
    async getClientsForReports(revendeurId) {
        // TODO: Implémenter la vraie requête Notion
        return [
            {
                id: 'client1',
                name: 'TechCorp SA',
                since: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
                totalRevenue: 125000,
                satisfaction: 4.8,
                industry: 'Technology'
            }
        ];
    },
    
    async getActivitiesForReports(revendeurId, period) {
        // TODO: Implémenter la vraie requête Notion
        return [
            {
                id: 'act1',
                type: 'Call',
                duration: 45,
                date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                outcome: 'Qualified lead'
            }
        ];
    },
    
    // Calculer les métriques consolidées
    calculateConsolidatedMetrics(sales, commissions, pipeline, clients, activities) {
        return {
            performance: {
                revenue: sales.metrics.totalRevenue,
                growth: this.calculateGrowth(sales.metrics.monthlyTrend),
                efficiency: this.calculateEfficiency(activities.patterns),
                satisfaction: this.calculateAvgSatisfaction(clients.list)
            },
            trends: {
                salesTrend: sales.metrics.monthlyTrend,
                conversionTrend: pipeline.analysis.conversionRates,
                clientGrowth: this.calculateClientGrowth(clients.list)
            },
            forecasts: {
                nextMonth: this.forecastNextMonth(sales.metrics),
                nextQuarter: this.forecastNextQuarter(pipeline.analysis),
                yearEnd: this.forecastYearEnd(commissions.analysis)
            }
        };
    },
    
    // Mettre à jour la vue des rapports
    updateReportsView() {
        switch (this.currentReport) {
            case 'performance':
                this.renderPerformanceReport();
                break;
            case 'commissions':
                this.renderCommissionsReport();
                break;
            case 'pipeline':
                this.renderPipelineReport();
                break;
            case 'activities':
                this.renderActivitiesReport();
                break;
        }
        
        // Mettre à jour les graphiques
        this.updateReportCharts();
    },
    
    // Afficher le rapport de performance
    renderPerformanceReport() {
        const container = document.getElementById('report-content');
        if (!container) return;
        
        const data = this.currentData;
        
        container.innerHTML = `
            <div class="row g-4">
                <!-- KPIs principaux -->
                <div class="col-12">
                    <div class="row g-3">
                        <div class="col-sm-6 col-lg-3">
                            <div class="card">
                                <div class="card-body">
                                    <div class="d-flex align-items-center">
                                        <div class="subheader">Chiffre d'affaires</div>
                                        <div class="ms-auto">
                                            <span class="status-indicator ${data.metrics.performance.growth >= 0 ? 'status-green' : 'status-red'} pulse"></span>
                                        </div>
                                    </div>
                                    <div class="h1 mb-3">${window.NotionConnector.utils.formatCurrency(data.metrics.performance.revenue)}</div>
                                    <div class="d-flex mb-2">
                                        <div>Croissance</div>
                                        <div class="ms-auto">
                                            <span class="text-${data.metrics.performance.growth >= 0 ? 'green' : 'red'} d-inline-flex align-items-center lh-1">
                                                ${data.metrics.performance.growth > 0 ? '+' : ''}${data.metrics.performance.growth}%
                                                <i class="ti ${data.metrics.performance.growth >= 0 ? 'ti-trending-up' : 'ti-trending-down'} ms-1"></i>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="col-sm-6 col-lg-3">
                            <div class="card">
                                <div class="card-body">
                                    <div class="subheader">Commissions gagnées</div>
                                    <div class="h1 mb-3">${window.NotionConnector.utils.formatCurrency(data.commissions.analysis.totalEarned)}</div>
                                    <div class="d-flex mb-2">
                                        <div>Taux moyen</div>
                                        <div class="ms-auto">
                                            <span class="text-green">${data.commissions.analysis.avgCommissionRate}%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="col-sm-6 col-lg-3">
                            <div class="card">
                                <div class="card-body">
                                    <div class="subheader">Pipeline</div>
                                    <div class="h1 mb-3">${data.pipeline.leads.length}</div>
                                    <div class="d-flex mb-2">
                                        <div>Taux conversion</div>
                                        <div class="ms-auto">
                                            <span class="text-blue">${data.pipeline.analysis.conversionRates.overall}%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="col-sm-6 col-lg-3">
                            <div class="card">
                                <div class="card-body">
                                    <div class="subheader">Satisfaction clients</div>
                                    <div class="h1 mb-3">${data.metrics.performance.satisfaction}/5</div>
                                    <div class="d-flex mb-2">
                                        <div>Clients actifs</div>
                                        <div class="ms-auto">
                                            <span class="text-primary">${data.clients.list.length}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Graphiques -->
                <div class="col-md-8">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Évolution des ventes</h3>
                        </div>
                        <div class="card-body">
                            <div id="sales-evolution-chart" style="height: 300px;"></div>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Répartition pipeline</h3>
                        </div>
                        <div class="card-body">
                            <div id="pipeline-distribution-chart" style="height: 300px;"></div>
                        </div>
                    </div>
                </div>
                
                <!-- Insights -->
                <div class="col-12">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Insights & Recommandations</h3>
                        </div>
                        <div class="card-body">
                            ${this.generateInsights(data)}
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    // Générer des insights basés sur les données
    generateInsights(data) {
        const insights = [];
        
        // Analyse des ventes
        if (data.metrics.performance.growth > 20) {
            insights.push({
                type: 'success',
                icon: 'ti-trending-up',
                title: 'Excellente croissance',
                message: `Vos ventes ont augmenté de ${data.metrics.performance.growth}% cette période.`
            });
        } else if (data.metrics.performance.growth < -10) {
            insights.push({
                type: 'warning',
                icon: 'ti-alert-triangle',
                title: 'Baisse des ventes',
                message: 'Considérez réviser votre stratégie commercial ou intensifier les efforts marketing.'
            });
        }
        
        // Analyse du pipeline
        if (data.pipeline.analysis.conversionRates.overall < 15) {
            insights.push({
                type: 'info',
                icon: 'ti-target',
                title: 'Optimisation du pipeline',
                message: 'Votre taux de conversion pourrait être amélioré. Focus sur la qualification des leads.'
            });
        }
        
        // Analyse des commissions
        if (data.commissions.analysis.paymentDelays?.average > 30) {
            insights.push({
                type: 'warning',
                icon: 'ti-clock',
                title: 'Délais de paiement',
                message: 'Les paiements de commissions sont plus lents que la moyenne du marché.'
            });
        }
        
        return insights.map(insight => `
            <div class="alert alert-${insight.type} d-flex align-items-center" role="alert">
                <div class="me-3">
                    <i class="ti ${insight.icon} fs-2"></i>
                </div>
                <div>
                    <h4 class="alert-title">${insight.title}</h4>
                    <div class="text-muted">${insight.message}</div>
                </div>
            </div>
        `).join('');
    },
    
    // Changer de type de rapport
    switchReport(reportType) {
        this.currentReport = reportType;
        
        // Mettre à jour les boutons
        document.querySelectorAll('[data-report-type]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.reportType === reportType);
        });
        
        // Mettre à jour l'affichage
        this.updateReportsView();
    },
    
    // Exporter le rapport
    async exportReport() {
        try {
            const currentUser = window.AuthNotionModule?.getCurrentUser();
            if (!currentUser) return;
            
            // Vérifier les permissions pour exporter
            const canExport = await window.PermissionsNotion.checkPermission(
                currentUser.id,
                'reports',
                'export'
            );
            
            if (!canExport) {
                window.showNotification('Vous n\'avez pas le droit d\'exporter les rapports', 'error');
                return;
            }
            
            window.showNotification('Export en cours...', 'info');
            
            // TODO: Implémenter l'export réel (PDF, Excel, etc.)
            setTimeout(() => {
                window.showNotification('Rapport exporté avec succès', 'success');
            }, 2000);
            
        } catch (error) {
            console.error('Erreur export rapport:', error);
        }
    },
    
    // Fonctions utilitaires pour l'analyse
    calculateMonthlyTrend(sales) {
        // Simplification pour la démo
        return [15, 18, 22, 25, 28, 35]; // Pourcentages de croissance
    },
    
    getTopProducts(sales) {
        const products = {};
        sales.forEach(sale => {
            const product = sale.product || 'Autre';
            products[product] = (products[product] || 0) + (sale.amount || 0);
        });
        
        return Object.entries(products)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([product, revenue]) => ({ product, revenue }));
    },
    
    getTopClients(sales) {
        const clients = {};
        sales.forEach(sale => {
            const client = sale.client || 'Autre';
            clients[client] = (clients[client] || 0) + (sale.amount || 0);
        });
        
        return Object.entries(clients)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([client, revenue]) => ({ client, revenue }));
    },
    
    calculateConversionFunnel(sales) {
        // Simulation d'un funnel de conversion
        return {
            leads: 1000,
            qualified: 400,
            proposals: 150,
            negotiations: 75,
            closed: sales.length
        };
    },
    
    analyzeSeasonality(sales) {
        // Analyse simplifiée de la saisonnalité
        const months = {};
        sales.forEach(sale => {
            const month = new Date(sale.date).getMonth();
            months[month] = (months[month] || 0) + 1;
        });
        
        return months;
    },
    
    calculateAvgCommissionRate(commissions) {
        if (commissions.length === 0) return 0;
        const total = commissions.reduce((sum, c) => sum + (c.rate || 0), 0);
        return Math.round((total / commissions.length) * 10) / 10;
    },
    
    analyzePaymentDelays(commissions) {
        const delays = commissions
            .filter(c => c.paymentDate && c.saleDate)
            .map(c => {
                const sale = new Date(c.saleDate);
                const payment = new Date(c.paymentDate);
                return Math.floor((payment - sale) / (1000 * 60 * 60 * 24));
            });
        
        return {
            average: delays.length > 0 ? Math.round(delays.reduce((sum, d) => sum + d, 0) / delays.length) : 0,
            min: Math.min(...delays) || 0,
            max: Math.max(...delays) || 0
        };
    },
    
    calculateGrowth(trend) {
        if (!trend || trend.length < 2) return 0;
        const current = trend[trend.length - 1];
        const previous = trend[trend.length - 2];
        return previous > 0 ? Math.round(((current - previous) / previous) * 100) : 0;
    },
    
    calculateAvgSatisfaction(clients) {
        const satisfiedClients = clients.filter(c => c.satisfaction !== null);
        if (satisfiedClients.length === 0) return 0;
        
        const total = satisfiedClients.reduce((sum, c) => sum + c.satisfaction, 0);
        return Math.round((total / satisfiedClients.length) * 10) / 10;
    },
    
    // États de chargement
    showLoadingState() {
        const container = document.getElementById('report-content');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Chargement...</span>
                    </div>
                    <div class="text-muted mt-2">Génération des rapports...</div>
                </div>
            `;
        }
    },
    
    hideLoadingState() {
        // Le contenu est remplacé par renderPerformanceReport
    },
    
    showErrorState() {
        if (window.showNotification) {
            window.showNotification('Erreur lors du chargement des rapports', 'error');
        }
    }
};

// Auto-initialisation
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('reports.html')) {
        const checkNotionConnector = setInterval(() => {
            if (window.NotionConnector && window.AuthNotionModule && window.PermissionsNotion) {
                clearInterval(checkNotionConnector);
                ReportsNotion.init();
            }
        }, 100);
    }
});

// Export global
window.ReportsNotion = ReportsNotion;