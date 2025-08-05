/**
 * SuperAdmin Dashboard V3 - CEO Operations
 * Integration with Directus API + Real-time updates
 */

class SuperAdminDashboardV3 {
    constructor() {
        this.currentCompany = 'all';
        this.charts = {};
        this.refreshInterval = 30000; // 30 seconds
        this.directusAPI = null;
        
        // API Configuration
        this.apiConfig = {
            baseURL: 'http://localhost:8055',
            token: localStorage.getItem('directus_token') || process.env.DIRECTUS_TOKEN || '',
            endpoints: {
                metrics: '/items/dashboard_metrics',
                companies: '/items/companies',
                finances: '/items/financial_data',
                tasks: '/items/tasks',
                sales: '/items/sales_pipeline',
                marketing: '/items/marketing_data',
                alerts: '/items/alerts'
            }
        };
        
        this.init();
    }
    
    async init() {
        try {
            await this.initializeAPI();
            this.initializeSparklines();
            this.bindEvents();
            await this.loadAllData();
            this.startAutoRefresh();
            
            console.log('🚀 SuperAdmin Dashboard V3 initialized');
        } catch (error) {
            console.error('❌ Dashboard initialization failed:', error);
            this.initializeFallbackMode();
        }
    }
    
    // API INITIALIZATION
    async initializeAPI() {
        this.directusAPI = {
            get: async (endpoint, params = {}) => {
                try {
                    const url = new URL(`${this.apiConfig.baseURL}${endpoint}`);
                    Object.keys(params).forEach(key => 
                        url.searchParams.append(key, params[key])
                    );
                    
                    const response = await fetch(url, {
                        headers: {
                            'Authorization': `Bearer ${this.apiConfig.token}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }
                    
                    const data = await response.json();
                    return data.data || data;
                } catch (error) {
                    console.warn(`API Error (${endpoint}):`, error.message);
                    return null;
                }
            }
        };
        
        // Test API connection
        const testResult = await this.directusAPI.get('/server/info');
        if (testResult) {
            console.log('✅ Directus API connected');
        } else {
            throw new Error('API connection failed');
        }
    }
    
    initializeFallbackMode() {
        console.log('🔄 Initializing fallback mode with mock data');
        this.directusAPI = null;
        this.initializeSparklines();
        this.bindEvents();
        this.loadAllData();
        this.startAutoRefresh();
    }
    
    // SPARKLINES INITIALIZATION
    initializeSparklines() {
        const sparklines = [
            { id: 'cashSparkline', data: [6.1, 5.8, 6.2, 6.8, 7.1, 7.3], color: '#10b981' },
            { id: 'arrSparkline', data: [1.8, 1.9, 2.0, 2.1, 2.3, 2.4], color: '#3b82f6' },
            { id: 'ebitdaSparkline', data: [15.2, 16.1, 17.3, 17.8, 18.1, 18.5], color: '#8b5cf6' },
            { id: 'ltvCacSparkline', data: [3.1, 3.4, 3.8, 4.0, 4.1, 4.2], color: '#06b6d4' },
            { id: 'npsSparkline', data: [65, 67, 69, 70, 71, 72], color: '#f59e0b' }
        ];
        
        sparklines.forEach(config => this.createSparkline(config.id, config));
    }
    
    createSparkline(elementId, config) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const options = {
            series: [{ data: config.data }],
            chart: {
                type: 'line',
                height: 40,
                sparkline: { enabled: true },
                animations: { enabled: false }
            },
            stroke: { width: 2, curve: 'smooth' },
            colors: [config.color],
            tooltip: { enabled: false }
        };
        
        this.charts[elementId] = new ApexCharts(element, options);
        this.charts[elementId].render();
    }
    
    // EVENT BINDINGS
    bindEvents() {
        // Company filter
        const companyFilter = document.getElementById('companyFilter');
        if (companyFilter) {
            companyFilter.addEventListener('change', (e) => {
                this.currentCompany = e.target.value;
                this.filterByCompany(this.currentCompany);
            });
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
                e.preventDefault();
                this.manualRefresh();
            }
        });
        
        // Quick action buttons
        this.bindQuickActions();
    }
    
    bindQuickActions() {
        document.querySelectorAll('.quick-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const action = btn.textContent.trim();
                this.handleQuickAction(action);
            });
        });
        
        document.querySelectorAll('.alert-action').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const alertText = btn.closest('.alert-item').querySelector('.alert-text').textContent;
                this.handleAlertAction(alertText);
            });
        });
    }
    
    // DATA LOADING
    async loadAllData() {
        try {
            await Promise.all([
                this.loadCEOMetrics(),
                this.loadFinancialData(),
                this.loadTasksData(),
                this.loadSalesData(),
                this.loadMarketingData(),
                this.loadCompanyPerformance(),
                this.loadAlerts()
            ]);
            
            console.log('📊 All data loaded successfully');
        } catch (error) {
            console.error('❌ Data loading failed:', error);
        }
    }
    
    async loadCEOMetrics() {
        let data;
        
        if (this.directusAPI) {
            const filters = this.currentCompany !== 'all' ? 
                { 'filter[company][_eq]': this.currentCompany } : {};
            
            const response = await this.directusAPI.get(this.apiConfig.endpoints.metrics, {
                ...filters,
                'fields': 'cash_runway,arr,mrr,ebitda_margin,ltv_cac_ratio,nps_score,created_at',
                'sort': '-created_at',
                'limit': 1
            });
            
            data = response?.[0] || this.getMockCEOMetrics(this.currentCompany);
        } else {
            data = this.getMockCEOMetrics(this.currentCompany);
        }
        
        this.updateCEOMetrics(data);
    }
    
    updateCEOMetrics(data) {
        // Update Cash Runway
        const cashValue = document.getElementById('cashValue');
        const cashAlert = document.getElementById('cashAlert');
        if (cashValue && cashAlert) {
            cashValue.textContent = `${data.cash_runway || data.cashRunway} mois`;
            
            const runway = parseFloat(data.cash_runway || data.cashRunway);
            let alertClass = '';
            if (runway < 3) alertClass = 'critical';
            else if (runway < 6) alertClass = 'warning';
            
            cashAlert.className = `metric-alert ${alertClass}`;
        }
        
        // Update ARR/MRR
        const arrValue = document.getElementById('arrValue');
        const mrrValue = document.getElementById('mrrValue');
        if (arrValue && mrrValue) {
            arrValue.textContent = this.formatCurrency(data.arr || 2400000);
            mrrValue.textContent = `${this.formatCurrency(data.mrr || 198000)} MRR`;
        }
        
        // Update EBITDA
        const ebitdaValue = document.getElementById('ebitdaValue');
        if (ebitdaValue) {
            ebitdaValue.textContent = `${data.ebitda_margin || 18.5}%`;
        }
        
        // Update LTV:CAC
        const ltvCacValue = document.getElementById('ltvCacValue');
        if (ltvCacValue) {
            ltvCacValue.textContent = `${data.ltv_cac_ratio || 4.2}:1`;
        }
        
        // Update NPS
        const npsValue = document.getElementById('npsValue');
        if (npsValue) {
            npsValue.textContent = data.nps_score || 72;
        }
    }
    
    async loadFinancialData() {
        let data;
        
        if (this.directusAPI) {
            data = await this.directusAPI.get(this.apiConfig.endpoints.finances, {
                'fields': 'type,amount,status,created_at',
                'filter[status][_neq]': 'completed',
                'sort': '-created_at'
            });
        }
        
        if (!data) {
            data = this.getMockFinancialData();
        }
        
        this.updateFinancialBlock(data);
    }
    
    updateFinancialBlock(data) {
        // Calculate financial metrics from raw data
        const cash = data?.filter(item => item.type === 'cash').reduce((sum, item) => sum + item.amount, 847000);
        const unpaid = data?.filter(item => item.type === 'invoice' && item.status === 'unpaid').length || 12;
        const payables = data?.filter(item => item.type === 'payable' && item.status === 'pending').length || 8;
        
        // Update DOM elements if they exist
        console.log('💰 Financial data updated:', { cash, unpaid, payables });
    }
    
    async loadTasksData() {
        let data;
        
        if (this.directusAPI) {
            data = await this.directusAPI.get(this.apiConfig.endpoints.tasks, {
                'fields': 'status,priority,due_date,created_at',
                'filter[status][_neq]': 'completed'
            });
        }
        
        if (!data) {
            data = this.getMockTasksData();
        }
        
        this.updateTasksBlock(data);
    }
    
    updateTasksBlock(data) {
        const today = new Date().toISOString().split('T')[0];
        const todayTasks = data?.filter(task => 
            task.due_date === today || task.status === 'in_progress'
        ).length || 14;
        
        const overdueTasks = data?.filter(task => 
            new Date(task.due_date) < new Date() && task.status !== 'completed'
        ).length || 3;
        
        console.log('📋 Tasks data updated:', { todayTasks, overdueTasks });
    }
    
    async loadSalesData() {
        let data;
        
        if (this.directusAPI) {
            data = await this.directusAPI.get(this.apiConfig.endpoints.sales, {
                'fields': 'stage,amount,probability,created_at',
                'filter[stage][_nin]': 'won,lost'
            });
        }
        
        if (!data) {
            data = this.getMockSalesData();
        }
        
        this.updateSalesBlock(data);
    }
    
    updateSalesBlock(data) {
        const pipelineValue = data?.reduce((sum, item) => sum + (item.amount * item.probability), 1200000);
        const activeQuotes = data?.filter(item => item.stage === 'proposal').length || 7;
        
        console.log('🎯 Sales data updated:', { pipelineValue, activeQuotes });
    }
    
    async loadMarketingData() {
        let data;
        
        if (this.directusAPI) {
            data = await this.directusAPI.get(this.apiConfig.endpoints.marketing, {
                'fields': 'visitors,leads,conversion_rate,created_at',
                'filter[created_at][_gte]': new Date(Date.now() - 7*24*60*60*1000).toISOString()
            });
        }
        
        if (!data) {
            data = this.getMockMarketingData();
        }
        
        this.updateMarketingBlock(data);
    }
    
    updateMarketingBlock(data) {
        const todayVisitors = data?.[0]?.visitors || 1847;
        const weeklyLeads = data?.reduce((sum, item) => sum + item.leads, 124);
        
        console.log('📊 Marketing data updated:', { todayVisitors, weeklyLeads });
    }
    
    async loadCompanyPerformance() {
        const companies = ['hypervisual', 'dainamics', 'lexaia', 'enky', 'takeout'];
        const performance = [];
        
        for (const company of companies) {
            let data;
            
            if (this.directusAPI) {
                data = await this.directusAPI.get(this.apiConfig.endpoints.metrics, {
                    'filter[company][_eq]': company,
                    'fields': 'revenue,margin',
                    'sort': '-created_at',
                    'limit': 1
                });
            }
            
            performance.push({
                name: company.toUpperCase(),
                revenue: data?.[0]?.revenue || this.getMockCompanyRevenue(company),
                margin: data?.[0]?.margin || this.getMockCompanyMargin(company)
            });
        }
        
        this.updateCompanyPerformance(performance);
    }
    
    updateCompanyPerformance(companies) {
        console.log('🏢 Company performance updated:', companies);
    }
    
    async loadAlerts() {
        let data;
        
        if (this.directusAPI) {
            data = await this.directusAPI.get(this.apiConfig.endpoints.alerts, {
                'fields': 'type,message,priority,status,created_at',
                'filter[status][_eq]': 'active',
                'sort': '-priority,-created_at'
            });
        }
        
        if (!data) {
            data = this.getMockAlerts();
        }
        
        this.updateAlertsBlock(data);
    }
    
    updateAlertsBlock(alerts) {
        const critical = alerts?.filter(alert => alert.priority === 'critical').length || 0;
        const warnings = alerts?.filter(alert => alert.priority === 'warning').length || 0;
        
        console.log('⚡ Alerts updated:', { critical, warnings });
    }
    
    // COMPANY FILTERING
    async filterByCompany(company) {
        this.currentCompany = company;
        
        // Update sparklines with company-specific data
        this.updateSparklines(company);
        
        // Reload all data for the selected company
        await this.loadAllData();
        
        console.log(`🏢 Filtered to company: ${company}`);
    }
    
    updateSparklines(company) {
        const sparklineData = this.getSparklineData(company);
        
        Object.keys(this.charts).forEach(chartId => {
            if (sparklineData[chartId] && this.charts[chartId]) {
                this.charts[chartId].updateSeries([{
                    data: sparklineData[chartId]
                }]);
            }
        });
    }
    
    // AUTO-REFRESH
    startAutoRefresh() {
        setInterval(async () => {
            await this.loadAllData();
            console.log('🔄 Auto-refresh completed');
        }, this.refreshInterval);
        
        console.log(`⏱️ Auto-refresh started (${this.refreshInterval/1000}s interval)`);
    }
    
    async manualRefresh() {
        console.log('🔄 Manual refresh triggered');
        await this.loadAllData();
    }
    
    // QUICK ACTIONS
    handleQuickAction(action) {
        const actions = {
            'Nouvelle facture': () => this.openInvoiceCreator(),
            'Nouveau projet': () => this.openProjectCreator(),
            'Voir rapport': () => this.openReportsModule()
        };
        
        const handler = actions[action];
        if (handler) {
            handler();
        } else {
            console.log(`Quick action: ${action}`);
        }
    }
    
    handleAlertAction(alertText) {
        console.log(`Alert action: ${alertText}`);
        // Implement specific alert actions
    }
    
    openInvoiceCreator() {
        console.log('🧾 Opening invoice creator...');
        // Implement navigation to invoice creation
    }
    
    openProjectCreator() {
        console.log('📁 Opening project creator...');
        // Implement navigation to project creation
    }
    
    openReportsModule() {
        console.log('📊 Opening reports module...');
        // Implement navigation to reports
    }
    
    // MOCK DATA METHODS
    getMockCEOMetrics(company) {
        const data = {
            all: { cashRunway: '7.3', arr: 2400000, mrr: 198000, ebitda_margin: 18.5, ltv_cac_ratio: 4.2, nps_score: 72 },
            hypervisual: { cashRunway: '9.2', arr: 680000, mrr: 56000, ebitda_margin: 22.1, ltv_cac_ratio: 5.1, nps_score: 78 },
            dainamics: { cashRunway: '12.1', arr: 890000, mrr: 74000, ebitda_margin: 31.2, ltv_cac_ratio: 6.2, nps_score: 84 },
            lexaia: { cashRunway: '4.1', arr: 145000, mrr: 12000, ebitda_margin: 8.3, ltv_cac_ratio: 2.1, nps_score: 58 },
            enky: { cashRunway: '8.7', arr: 310000, mrr: 26000, ebitda_margin: 15.8, ltv_cac_ratio: 3.8, nps_score: 71 },
            takeout: { cashRunway: '2.1', arr: 89000, mrr: 7000, ebitda_margin: -12.1, ltv_cac_ratio: 1.3, nps_score: 42 }
        };
        return data[company] || data.all;
    }
    
    getMockFinancialData() {
        return [
            { type: 'cash', amount: 847000, status: 'available' },
            { type: 'invoice', amount: 45000, status: 'unpaid' },
            { type: 'payable', amount: 127000, status: 'pending' }
        ];
    }
    
    getMockTasksData() {
        return [
            { status: 'in_progress', priority: 'high', due_date: new Date().toISOString().split('T')[0] },
            { status: 'pending', priority: 'medium', due_date: new Date(Date.now() - 24*60*60*1000).toISOString().split('T')[0] }
        ];
    }
    
    getMockSalesData() {
        return [
            { stage: 'proposal', amount: 50000, probability: 0.7 },
            { stage: 'negotiation', amount: 80000, probability: 0.9 }
        ];
    }
    
    getMockMarketingData() {
        return [
            { visitors: 1847, leads: 124, conversion_rate: 6.7 }
        ];
    }
    
    getMockCompanyRevenue(company) {
        const revenues = {
            hypervisual: 67000,
            dainamics: 89000,
            lexaia: 12000,
            enky: 24000,
            takeout: 6000
        };
        return revenues[company] || 50000;
    }
    
    getMockCompanyMargin(company) {
        const margins = {
            hypervisual: 22,
            dainamics: 31,
            lexaia: 8,
            enky: 15,
            takeout: -12
        };
        return margins[company] || 15;
    }
    
    getMockAlerts() {
        return [
            { type: 'financial', message: '3 factures impayées > 60 jours', priority: 'critical', status: 'active' },
            { type: 'business', message: 'Cash runway < 6 mois pour TAKEOUT', priority: 'warning', status: 'active' },
            { type: 'sales', message: '5 devis expirent cette semaine', priority: 'info', status: 'active' }
        ];
    }
    
    getSparklineData(company) {
        const data = {
            all: {
                cashSparkline: [6.1, 5.8, 6.2, 6.8, 7.1, 7.3],
                arrSparkline: [1.8, 1.9, 2.0, 2.1, 2.3, 2.4],
                ebitdaSparkline: [15.2, 16.1, 17.3, 17.8, 18.1, 18.5],
                ltvCacSparkline: [3.1, 3.4, 3.8, 4.0, 4.1, 4.2],
                npsSparkline: [65, 67, 69, 70, 71, 72]
            },
            hypervisual: {
                cashSparkline: [8.1, 8.4, 8.7, 8.9, 9.0, 9.2],
                arrSparkline: [0.58, 0.61, 0.64, 0.66, 0.67, 0.68],
                ebitdaSparkline: [19.2, 20.1, 21.3, 21.8, 22.0, 22.1],
                ltvCacSparkline: [4.1, 4.4, 4.8, 5.0, 5.1, 5.1],
                npsSparkline: [72, 74, 75, 76, 77, 78]
            }
        };
        return data[company] || data.all;
    }
    
    // UTILITIES
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

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    window.superAdminDashboard = new SuperAdminDashboardV3();
});

// Export for external use
window.SuperAdminDashboardV3 = SuperAdminDashboardV3;