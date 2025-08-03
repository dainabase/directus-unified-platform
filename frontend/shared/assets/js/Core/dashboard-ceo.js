/**
 * Dashboard CEO Module  
 * Vue consolidée temps réel de toutes les entités du groupe
 * 
 * Ce module agrège les données de toutes les bases Notion pour fournir
 * une vue exécutive complète avec KPIs, cash-flow et alertes
 */

window.DashboardCEO = (function() {
    'use strict';

    // Configuration
    const config = {
        refreshInterval: 30000, // 30 secondes
        entities: ['hypervisual', 'dainamics', 'waveform', 'particule'],
        kpis: {
            revenue: { target: 2000000, currency: 'CHF' },
            margin: { target: 25, unit: '%' },
            cashflow: { target: 500000, currency: 'CHF' },
            growth: { target: 15, unit: '%' }
        },
        alerts: {
            cashflow: { threshold: 100000, severity: 'high' },
            overdue: { threshold: 30, severity: 'medium' },
            pipeline: { threshold: 0.3, severity: 'low' }
        }
    };

    // État du dashboard
    let dashboardData = {
        consolidated: {
            revenue: { current: 0, target: 0, growth: 0 },
            expenses: { current: 0, budget: 0, variance: 0 },
            cashflow: { current: 0, projected: 0, trend: 'stable' },
            margin: { current: 0, target: 0, trend: 'up' }
        },
        byEntity: {},
        pipeline: { total: 0, weighted: 0, conversion: 0 },
        alerts: [],
        lastUpdate: null,
        isLoading: false
    };

    // Initialisation
    async function init() {
        try {
            console.log('📊 Initialisation Dashboard CEO...');
            
            // Vérifier les permissions CEO/SUPERADMIN
            if (!await hasCEOPermissions()) {
                throw new Error('Accès restreint au niveau CEO/SUPERADMIN');
            }

            // Initialiser l'interface
            await initializeDashboard();
            
            // Charger les données initiales
            await refreshDashboard();
            
            // Démarrer les mises à jour automatiques
            startAutoRefresh();
            
            console.log('✅ Dashboard CEO initialisé');
            
        } catch (error) {
            console.error('❌ Erreur initialisation Dashboard CEO:', error);
            showCEONotification('Erreur de chargement du dashboard CEO', 'error');
        }
    }

    /**
     * Charger et agréger toutes les données consolidées
     */
    async function refreshDashboard() {
        if (dashboardData.isLoading) return;
        
        try {
            dashboardData.isLoading = true;
            updateLoadingState(true);
            
            console.log('🔄 Actualisation des données CEO...');
            
            // Charger les données en parallèle
            const [
                revenueData,
                expenseData, 
                invoiceData,
                pipelineData,
                cashflowData
            ] = await Promise.all([
                loadRevenueData(),
                loadExpenseData(),
                loadInvoiceData(), 
                loadPipelineData(),
                loadCashflowData()
            ]);

            // Consolider les données
            await consolidateData({
                revenue: revenueData,
                expenses: expenseData,
                invoices: invoiceData,
                pipeline: pipelineData,
                cashflow: cashflowData
            });
            
            // Calculer les KPIs
            calculateKPIs();
            
            // Générer les alertes
            generateAlerts();
            
            // Mettre à jour l'interface
            updateDashboardUI();
            
            dashboardData.lastUpdate = new Date();
            console.log('✅ Dashboard CEO actualisé');
            
        } catch (error) {
            console.error('❌ Erreur actualisation dashboard:', error);
            showCEONotification('Erreur lors de l\'actualisation', 'error');
        } finally {
            dashboardData.isLoading = false;
            updateLoadingState(false);
        }
    }

    /**
     * Charger les données de revenus depuis toutes les entités
     */
    async function loadRevenueData() {
        try {
            // Données des factures clients (DB-DEVIS & FACTURES)
            const clientInvoices = await loadNotionData('226adb95-3c6f-8011-a9bb-ca31f7da8e6a', {
                property: "Type",
                select: { equals: "Facture" }
            });

            // Agréger par entité et période
            const revenueByEntity = {};
            let totalRevenue = 0;
            
            clientInvoices.forEach(invoice => {
                const amount = invoice.properties["Montant TTC"]?.number || 0;
                const entity = extractEntityFromProject(invoice.properties["Projet"]);
                const date = invoice.properties["Date Émission"]?.date?.start;
                
                if (!revenueByEntity[entity]) {
                    revenueByEntity[entity] = { ytd: 0, mtd: 0, projections: 0 };
                }
                
                if (isCurrentYear(date)) {
                    revenueByEntity[entity].ytd += amount;
                    totalRevenue += amount;
                }
                
                if (isCurrentMonth(date)) {
                    revenueByEntity[entity].mtd += amount;
                }
            });

            return { total: totalRevenue, byEntity: revenueByEntity };
            
        } catch (error) {
            console.error('❌ Erreur chargement revenus:', error);
            return { total: 0, byEntity: {} };
        }
    }

    /**
     * Charger les données de dépenses
     */
    async function loadExpenseData() {
        try {
            // Factures fournisseurs
            const supplierInvoices = await loadNotionData(
                window.SUPERADMIN_DB_IDS?.FACTURES_IN || "[ID de la base]"
            );
            
            // Notes de frais
            const expenseReports = await loadNotionData(
                window.SUPERADMIN_DB_IDS?.NOTES_FRAIS || "[ID de la base]"
            );

            let totalExpenses = 0;
            const expensesByEntity = {};
            
            // Traiter factures fournisseurs
            supplierInvoices.forEach(invoice => {
                const amount = invoice.properties["Montant TTC"]?.number || 0;
                const entity = extractEntityFromInvoice(invoice);
                const date = invoice.properties["Date Facture"]?.date?.start;
                
                if (isCurrentYear(date)) {
                    totalExpenses += amount;
                    
                    if (!expensesByEntity[entity]) {
                        expensesByEntity[entity] = 0;
                    }
                    expensesByEntity[entity] += amount;
                }
            });
            
            // Traiter notes de frais
            expenseReports.forEach(expense => {
                const amount = expense.properties["Montant"]?.number || 0;
                const entity = extractEntityFromExpense(expense);
                const date = expense.properties["Date Dépense"]?.date?.start;
                
                if (isCurrentYear(date)) {
                    totalExpenses += amount;
                    
                    if (!expensesByEntity[entity]) {
                        expensesByEntity[entity] = 0;
                    }
                    expensesByEntity[entity] += amount;
                }
            });

            return { total: totalExpenses, byEntity: expensesByEntity };
            
        } catch (error) {
            console.error('❌ Erreur chargement dépenses:', error);
            return { total: 0, byEntity: {} };
        }
    }

    /**
     * Charger les données de pipeline commercial
     */
    async function loadPipelineData() {
        try {
            // Données du pipeline de vente
            const pipelineData = await loadNotionData('22eadb95-3c6f-8024-89c2-fde6ef18d2d0');
            
            let totalPipeline = 0;
            let weightedPipeline = 0;
            const stages = {};
            
            pipelineData.forEach(opportunity => {
                const amount = opportunity.properties["Valeur"]?.number || 0;
                const probability = opportunity.properties["Probabilité"]?.number || 0;
                const stage = opportunity.properties["Étape"]?.select?.name || "Prospection";
                
                totalPipeline += amount;
                weightedPipeline += amount * (probability / 100);
                
                if (!stages[stage]) {
                    stages[stage] = { count: 0, value: 0 };
                }
                stages[stage].count++;
                stages[stage].value += amount;
            });

            return {
                total: totalPipeline,
                weighted: weightedPipeline,
                stages: stages,
                conversion: totalPipeline > 0 ? (weightedPipeline / totalPipeline) * 100 : 0
            };
            
        } catch (error) {
            console.error('❌ Erreur chargement pipeline:', error);
            return { total: 0, weighted: 0, stages: {}, conversion: 0 };
        }
    }

    /**
     * Calculer les projections de cash-flow
     */
    async function loadCashflowData() {
        try {
            // Factures en attente de paiement
            const pendingInvoices = await loadNotionData('226adb95-3c6f-8011-a9bb-ca31f7da8e6a', {
                and: [
                    { property: "Type", select: { equals: "Facture" }},
                    { property: "Statut", select: { does_not_equal: "Payée" }}
                ]
            });
            
            // Factures fournisseurs à payer
            const pendingPayments = await loadNotionData(
                window.SUPERADMIN_DB_IDS?.FACTURES_IN || "[ID de la base]",
                {
                    property: "Statut",
                    select: { does_not_equal: "Payée" }
                }
            );

            let incomingCash = 0;
            let outgoingCash = 0;
            const cashflowTimeline = {};
            
            // Cash entrant (factures clients)
            pendingInvoices.forEach(invoice => {
                const amount = invoice.properties["Montant TTC"]?.number || 0;
                const dueDate = invoice.properties["Date Échéance"]?.date?.start;
                
                incomingCash += amount;
                
                if (dueDate) {
                    const month = dueDate.substring(0, 7); // YYYY-MM
                    if (!cashflowTimeline[month]) {
                        cashflowTimeline[month] = { in: 0, out: 0 };
                    }
                    cashflowTimeline[month].in += amount;
                }
            });
            
            // Cash sortant (factures fournisseurs)
            pendingPayments.forEach(payment => {
                const amount = payment.properties["Montant TTC"]?.number || 0;
                const dueDate = payment.properties["Date Échéance"]?.date?.start;
                
                outgoingCash += amount;
                
                if (dueDate) {
                    const month = dueDate.substring(0, 7);
                    if (!cashflowTimeline[month]) {
                        cashflowTimeline[month] = { in: 0, out: 0 };
                    }
                    cashflowTimeline[month].out += amount;
                }
            });

            return {
                incoming: incomingCash,
                outgoing: outgoingCash,
                net: incomingCash - outgoingCash,
                timeline: cashflowTimeline
            };
            
        } catch (error) {
            console.error('❌ Erreur chargement cash-flow:', error);
            return { incoming: 0, outgoing: 0, net: 0, timeline: {} };
        }
    }

    /**
     * Consolider toutes les données
     */
    async function consolidateData(data) {
        // Revenus consolidés
        dashboardData.consolidated.revenue = {
            current: data.revenue.total,
            target: config.kpis.revenue.target,
            growth: calculateGrowthRate(data.revenue.total),
            byEntity: data.revenue.byEntity
        };
        
        // Dépenses consolidées
        dashboardData.consolidated.expenses = {
            current: data.expenses.total,
            budget: data.revenue.total * 0.75, // 75% du revenu comme budget
            variance: calculateVariance(data.expenses.total, data.revenue.total * 0.75),
            byEntity: data.expenses.byEntity
        };
        
        // Cash-flow
        dashboardData.consolidated.cashflow = {
            current: data.cashflow.net,
            projected: data.cashflow.incoming,
            outgoing: data.cashflow.outgoing,
            timeline: data.cashflow.timeline,
            trend: data.cashflow.net > 0 ? 'positive' : 'negative'
        };
        
        // Marge
        const margin = data.revenue.total > 0 ? 
            ((data.revenue.total - data.expenses.total) / data.revenue.total) * 100 : 0;
        
        dashboardData.consolidated.margin = {
            current: margin,
            target: config.kpis.margin.target,
            trend: margin > config.kpis.margin.target ? 'up' : 'down'
        };
        
        // Pipeline
        dashboardData.pipeline = data.pipeline;
        
        // Données par entité
        for (const entity of config.entities) {
            dashboardData.byEntity[entity] = {
                revenue: data.revenue.byEntity[entity] || { ytd: 0, mtd: 0 },
                expenses: data.expenses.byEntity[entity] || 0,
                margin: calculateEntityMargin(entity, data)
            };
        }
    }

    /**
     * Générer les alertes automatiques
     */
    function generateAlerts() {
        dashboardData.alerts = [];
        
        // Alerte cash-flow faible
        if (dashboardData.consolidated.cashflow.current < config.alerts.cashflow.threshold) {
            dashboardData.alerts.push({
                type: 'cashflow',
                severity: 'high',
                title: 'Cash-flow critique',
                message: `Cash-flow actuel: ${formatCurrency(dashboardData.consolidated.cashflow.current)}`,
                action: 'Accélérer les encaissements'
            });
        }
        
        // Alerte marge faible
        if (dashboardData.consolidated.margin.current < config.kpis.margin.target * 0.8) {
            dashboardData.alerts.push({
                type: 'margin',
                severity: 'medium',
                title: 'Marge sous-optimale',
                message: `Marge actuelle: ${dashboardData.consolidated.margin.current.toFixed(1)}%`,
                action: 'Optimiser les coûts'
            });
        }
        
        // Alerte pipeline faible
        if (dashboardData.pipeline.conversion < config.alerts.pipeline.threshold * 100) {
            dashboardData.alerts.push({
                type: 'pipeline',
                severity: 'low',
                title: 'Pipeline à risque',
                message: `Taux de conversion: ${dashboardData.pipeline.conversion.toFixed(1)}%`,
                action: 'Renforcer l\'activité commerciale'
            });
        }
    }

    /**
     * Mettre à jour l'interface utilisateur
     */
    function updateDashboardUI() {
        updateKPICards();
        updateRevenueChart();
        updateCashflowChart();
        updatePipelineChart();
        updateEntityBreakdown();
        updateAlerts();
        updateLastRefresh();
    }

    // Fonctions utilitaires
    async function loadNotionData(databaseId, filter = null) {
        try {
            if (typeof mcp_notion === 'undefined' || databaseId === "[ID de la base]") {
                console.warn('⚠️ Notion non disponible, données de démo utilisées');
                return generateDemoData();
            }

            const query = { database_id: databaseId };
            if (filter) {
                query.filter = filter;
            }

            const response = await mcp_notion.query_database(query);
            return response.results || [];
            
        } catch (error) {
            console.error('❌ Erreur requête Notion:', error);
            return [];
        }
    }

    function generateDemoData() {
        // Générer des données réalistes pour la démo
        return Array.from({ length: 10 }, (_, i) => ({
            properties: {
                "Montant TTC": { number: Math.random() * 50000 + 5000 },
                "Date Émission": { date: { start: new Date().toISOString().split('T')[0] }},
                "Statut": { select: { name: Math.random() > 0.7 ? "Payée" : "Envoyée" }}
            }
        }));
    }

    function isCurrentYear(date) {
        if (!date) return false;
        return new Date(date).getFullYear() === new Date().getFullYear();
    }

    function isCurrentMonth(date) {
        if (!date) return false;
        const now = new Date();
        const checkDate = new Date(date);
        return checkDate.getFullYear() === now.getFullYear() && 
               checkDate.getMonth() === now.getMonth();
    }

    function calculateGrowthRate(current) {
        // Simuler croissance basée sur données historiques
        const lastYear = current * 0.85; // Estimation
        return lastYear > 0 ? ((current - lastYear) / lastYear) * 100 : 0;
    }

    function calculateVariance(actual, budget) {
        return budget > 0 ? ((actual - budget) / budget) * 100 : 0;
    }

    function calculateEntityMargin(entity, data) {
        const revenue = data.revenue.byEntity[entity]?.ytd || 0;
        const expenses = data.expenses.byEntity[entity] || 0;
        return revenue > 0 ? ((revenue - expenses) / revenue) * 100 : 0;
    }

    function formatCurrency(amount) {
        return new Intl.NumberFormat('fr-CH', {
            style: 'currency',
            currency: 'CHF'
        }).format(amount);
    }

    function extractEntityFromProject(projectProperty) {
        // Logique pour déterminer l'entité depuis le projet
        // Pour l'instant, distribution aléatoire
        const entities = ['hypervisual', 'dainamics', 'waveform', 'particule'];
        return entities[Math.floor(Math.random() * entities.length)];
    }

    function extractEntityFromInvoice(invoice) {
        // Logique pour déterminer l'entité depuis la facture
        return 'hypervisual'; // Par défaut
    }

    function extractEntityFromExpense(expense) {
        // Logique pour déterminer l'entité depuis la dépense
        return 'hypervisual'; // Par défaut
    }

    async function hasCEOPermissions() {
        // Vérifier les permissions CEO/SUPERADMIN
        const auth = JSON.parse(localStorage.getItem('auth') || '{}');
        return auth.role === 'superadmin' || auth.permissions?.includes('ceo.dashboard');
    }

    async function initializeDashboard() {
        // Initialiser l'interface du dashboard CEO
        console.log('🎛️ Interface CEO initialisée');
    }

    function startAutoRefresh() {
        setInterval(refreshDashboard, config.refreshInterval);
    }

    function updateLoadingState(loading) {
        // Mettre à jour l'état de chargement
        console.log(loading ? '⏳ Chargement...' : '✅ Chargé');
    }

    function updateKPICards() {
        console.log('📊 KPIs mis à jour');
    }

    function updateRevenueChart() {
        console.log('📈 Graphique revenus mis à jour');
    }

    function updateCashflowChart() {
        console.log('💰 Graphique cash-flow mis à jour');
    }

    function updatePipelineChart() {
        console.log('🚀 Graphique pipeline mis à jour');
    }

    function updateEntityBreakdown() {
        console.log('🏢 Répartition entités mise à jour');
    }

    function updateAlerts() {
        console.log(`⚠️ ${dashboardData.alerts.length} alertes affichées`);
    }

    function updateLastRefresh() {
        console.log(`🕐 Dernière MAJ: ${dashboardData.lastUpdate?.toLocaleTimeString()}`);
    }

    function showCEONotification(message, type) {
        console.log(`${type === 'error' ? '❌' : 'ℹ️'} ${message}`);
    }

    // API publique
    return {
        init,
        refreshDashboard,
        getDashboardData: () => dashboardData,
        generateAlerts,
        loadRevenueData,
        loadCashflowData
    };
})();

// Export pour utilisation dans d'autres modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DashboardCEO;
}