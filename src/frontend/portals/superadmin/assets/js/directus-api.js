/**
 * Directus API Integration pour Dashboard CEO
 * Connexion aux données réelles via l'API Directus
 */

class DirectusAPI {
    constructor() {
        this.baseURL = 'http://localhost:8055'; // URL Directus local
        this.token = null;
        this.authenticated = false;
        
        this.init();
    }
    
    async init() {
        await this.authenticate();
        console.log('🔌 Directus API initialized');
    }
    
    // AUTHENTIFICATION
    async authenticate() {
        try {
            // Récupérer le token depuis le localStorage ou config
            this.token = localStorage.getItem('directus_token') || 
                        process.env.DIRECTUS_TOKEN || 
                        'your-static-token-here';
            
            if (this.token) {
                // Vérifier la validité du token
                const response = await this.makeRequest('/users/me');
                if (response) {
                    this.authenticated = true;
                    console.log('✅ Directus authentication successful');
                }
            } else {
                console.warn('⚠️ No Directus token found');
            }
        } catch (error) {
            console.error('❌ Directus authentication failed:', error);
            this.authenticated = false;
        }
    }
    
    // REQUÊTE GÉNÉRIQUE
    async makeRequest(endpoint, method = 'GET', data = null) {
        try {
            const url = `${this.baseURL}${endpoint}`;
            const options = {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                }
            };
            
            if (data && method !== 'GET') {
                options.body = JSON.stringify(data);
            }
            
            const response = await fetch(url, options);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(`Directus API Error (${endpoint}):`, error);
            return null;
        }
    }
    
    // MÉTRIQUES CEO
    async getCEOMetrics(companyId = null) {
        if (!this.authenticated) {
            return this.getMockCEOMetrics(companyId);
        }
        
        try {
            // Construire la query avec filtres
            let query = '/items/ceo_metrics?fields=*';
            
            if (companyId && companyId !== 'all') {
                query += `&filter[company][_eq]=${companyId}`;
            }
            
            // Date range - 30 derniers jours
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            query += `&filter[date_created][_gte]=${thirtyDaysAgo.toISOString()}`;
            
            const response = await this.makeRequest(query);
            
            if (response && response.data) {
                return this.processCEOMetrics(response.data);
            }
        } catch (error) {
            console.error('Error fetching CEO metrics:', error);
        }
        
        // Fallback sur données simulées
        return this.getMockCEOMetrics(companyId);
    }
    
    processCEOMetrics(rawData) {
        // Traitement des données brutes de Directus
        const latest = rawData[rawData.length - 1] || {};
        
        return {
            cashRunway: latest.cash_runway || 4.2,
            burnRate: latest.burn_rate || 245000,
            arr: latest.arr || 7200000,
            mrr: latest.mrr || 623000,
            ebitdaMargin: latest.ebitda_margin || 18.7,
            ltvCac: latest.ltv_cac_ratio || 2.8,
            nps: latest.nps_score || 52,
            timestamp: latest.date_created || new Date().toISOString()
        };
    }
    
    // DONNÉES FINANCIÈRES
    async getFinancialData(companyId = null) {
        if (!this.authenticated) {
            return this.getMockFinancialData(companyId);
        }
        
        try {
            let query = '/items/financial_data?fields=*';
            
            if (companyId && companyId !== 'all') {
                query += `&filter[company][_eq]=${companyId}`;
            }
            
            query += '&sort=-date&limit=100';
            
            const response = await this.makeRequest(query);
            
            if (response && response.data) {
                return this.processFinancialData(response.data);
            }
        } catch (error) {
            console.error('Error fetching financial data:', error);
        }
        
        return this.getMockFinancialData(companyId);
    }
    
    processFinancialData(rawData) {
        return {
            treasury: this.calculateTreasury(rawData),
            receivables: this.calculateReceivables(rawData),
            payables: this.calculatePayables(rawData),
            monthlyRevenue: this.calculateMonthlyRevenue(rawData)
        };
    }
    
    // DONNÉES COMMERCIALES
    async getSalesData(companyId = null) {
        if (!this.authenticated) {
            return this.getMockSalesData(companyId);
        }
        
        try {
            let query = '/items/sales_pipeline?fields=*,opportunity.amount,opportunity.stage,opportunity.company';
            
            if (companyId && companyId !== 'all') {
                query += `&filter[opportunity][company][_eq]=${companyId}`;
            }
            
            const response = await this.makeRequest(query);
            
            if (response && response.data) {
                return this.processSalesData(response.data);
            }
        } catch (error) {
            console.error('Error fetching sales data:', error);
        }
        
        return this.getMockSalesData(companyId);
    }
    
    processSalesData(rawData) {
        const totalPipeline = rawData.reduce((sum, item) => {
            return sum + (item.opportunity?.amount || 0);
        }, 0);
        
        const wonDeals = rawData.filter(item => 
            item.opportunity?.stage === 'won'
        ).length;
        
        const conversionRate = rawData.length > 0 ? 
            (wonDeals / rawData.length * 100) : 0;
        
        return {
            pipelineValue: totalPipeline,
            opportunities: rawData.length,
            conversionRate: conversionRate,
            averageDealSize: rawData.length > 0 ? totalPipeline / rawData.length : 0
        };
    }
    
    // DONNÉES MARKETING
    async getMarketingData(companyId = null) {
        if (!this.authenticated) {
            return this.getMockMarketingData(companyId);
        }
        
        try {
            let query = '/items/marketing_campaigns?fields=*,leads_generated,cost,roi';
            
            if (companyId && companyId !== 'all') {
                query += `&filter[company][_eq]=${companyId}`;
            }
            
            const response = await this.makeRequest(query);
            
            if (response && response.data) {
                return this.processMarketingData(response.data);
            }
        } catch (error) {
            console.error('Error fetching marketing data:', error);
        }
        
        return this.getMockMarketingData(companyId);
    }
    
    processMarketingData(rawData) {
        const totalLeads = rawData.reduce((sum, campaign) => 
            sum + (campaign.leads_generated || 0), 0);
        
        const totalCost = rawData.reduce((sum, campaign) => 
            sum + (campaign.cost || 0), 0);
        
        const avgCostPerLead = totalLeads > 0 ? totalCost / totalLeads : 0;
        
        const avgROI = rawData.length > 0 ? 
            rawData.reduce((sum, campaign) => sum + (campaign.roi || 0), 0) / rawData.length : 0;
        
        return {
            totalLeads,
            costPerLead: avgCostPerLead,
            roi: avgROI,
            activeCampaigns: rawData.filter(c => c.status === 'active').length
        };
    }
    
    // DONNÉES OPÉRATIONNELLES
    async getOperationalData(companyId = null) {
        if (!this.authenticated) {
            return this.getMockOperationalData(companyId);
        }
        
        try {
            const [tasks, tickets, performance] = await Promise.all([
                this.makeRequest('/items/tasks?fields=*&filter[status][_neq]=completed'),
                this.makeRequest('/items/support_tickets?fields=*'),
                this.makeRequest('/items/team_performance?fields=*')
            ]);
            
            return {
                tasks: this.processTasksData(tasks?.data || []),
                support: this.processSupportData(tickets?.data || []),
                performance: this.processPerformanceData(performance?.data || [])
            };
        } catch (error) {
            console.error('Error fetching operational data:', error);
        }
        
        return this.getMockOperationalData(companyId);
    }
    
    // ALERTES
    async getAlerts(companyId = null) {
        if (!this.authenticated) {
            return this.getMockAlerts(companyId);
        }
        
        try {
            let query = '/items/alerts?fields=*&filter[status][_eq]=active';
            
            if (companyId && companyId !== 'all') {
                query += `&filter[company][_eq]=${companyId}`;
            }
            
            query += '&sort=-priority,-date_created';
            
            const response = await this.makeRequest(query);
            
            if (response && response.data) {
                return this.processAlertsData(response.data);
            }
        } catch (error) {
            console.error('Error fetching alerts:', error);
        }
        
        return this.getMockAlerts(companyId);
    }
    
    processAlertsData(rawData) {
        return {
            critical: rawData.filter(alert => alert.priority === 'critical').length,
            warning: rawData.filter(alert => alert.priority === 'warning').length,
            system: rawData.filter(alert => alert.type === 'system').length,
            details: rawData.map(alert => ({
                id: alert.id,
                message: alert.message,
                priority: alert.priority,
                type: alert.type,
                company: alert.company,
                created: alert.date_created
            }))
        };
    }
    
    // MISE À JOUR DES DONNÉES
    async updateMetric(metricType, data, companyId = null) {
        if (!this.authenticated) {
            console.log('📝 Mock update:', metricType, data);
            return true;
        }
        
        try {
            const payload = {
                ...data,
                company: companyId,
                date_created: new Date().toISOString()
            };
            
            const response = await this.makeRequest(`/items/${metricType}`, 'POST', payload);
            
            if (response) {
                console.log(`✅ Updated ${metricType} for company ${companyId}`);
                return true;
            }
        } catch (error) {
            console.error(`❌ Failed to update ${metricType}:`, error);
        }
        
        return false;
    }
    
    // DONNÉES SIMULÉES (FALLBACK)
    getMockCEOMetrics(companyId) {
        const mockData = {
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
        
        return mockData[companyId] || mockData.all;
    }
    
    getMockFinancialData(companyId) {
        return {
            treasury: 892000,
            receivables: 458000,
            payables: 234000,
            monthlyRevenue: [
                { month: 'Jan', revenue: 580000 },
                { month: 'Fév', revenue: 620000 },
                { month: 'Mar', revenue: 650000 },
            ]
        };
    }
    
    getMockSalesData(companyId) {
        return {
            pipelineValue: 1200000,
            opportunities: 89,
            conversionRate: 32,
            averageDealSize: 42000
        };
    }
    
    getMockMarketingData(companyId) {
        return {
            totalLeads: 234,
            costPerLead: 47,
            roi: 340,
            activeCampaigns: 5
        };
    }
    
    getMockOperationalData(companyId) {
        return {
            tasks: {
                inProgress: 47,
                overdue: 8,
                completed: 156
            },
            support: {
                avgResolutionTime: 2.3,
                satisfaction: 4.6
            },
            performance: {
                teamProductivity: 87
            }
        };
    }
    
    getMockAlerts(companyId) {
        return {
            critical: 3,
            warning: 7,
            system: 1,
            details: [
                {
                    id: 1,
                    message: 'Cash runway < 3 mois pour Etekout',
                    priority: 'critical',
                    type: 'financial',
                    company: 'etekout'
                },
                {
                    id: 2,
                    message: 'Churn rate en hausse chez Lexia',
                    priority: 'warning',
                    type: 'commercial',
                    company: 'lexia'
                }
            ]
        };
    }
    
    // UTILITAIRES DE CALCUL
    calculateTreasury(data) {
        return data.reduce((sum, item) => {
            if (item.type === 'cash' || item.type === 'bank_account') {
                return sum + (item.balance || 0);
            }
            return sum;
        }, 0);
    }
    
    calculateReceivables(data) {
        return data.reduce((sum, item) => {
            if (item.type === 'receivable' && item.status === 'pending') {
                return sum + (item.amount || 0);
            }
            return sum;
        }, 0);
    }
    
    calculatePayables(data) {
        return data.reduce((sum, item) => {
            if (item.type === 'payable' && item.status === 'pending') {
                return sum + (item.amount || 0);
            }
            return sum;
        }, 0);
    }
    
    calculateMonthlyRevenue(data) {
        const monthlyData = {};
        
        data.forEach(item => {
            if (item.type === 'revenue') {
                const month = new Date(item.date).toLocaleDateString('fr-FR', { month: 'short' });
                monthlyData[month] = (monthlyData[month] || 0) + (item.amount || 0);
            }
        });
        
        return Object.entries(monthlyData).map(([month, revenue]) => ({
            month,
            revenue
        }));
    }
    
    processTasksData(data) {
        return {
            inProgress: data.filter(task => task.status === 'in_progress').length,
            overdue: data.filter(task => new Date(task.due_date) < new Date()).length,
            completed: data.filter(task => task.status === 'completed').length
        };
    }
    
    processSupportData(data) {
        const totalResolutionTime = data.reduce((sum, ticket) => {
            if (ticket.resolution_time) {
                return sum + ticket.resolution_time;
            }
            return sum;
        }, 0);
        
        const avgResolutionTime = data.length > 0 ? totalResolutionTime / data.length : 0;
        
        const avgSatisfaction = data.length > 0 ? 
            data.reduce((sum, ticket) => sum + (ticket.satisfaction_score || 0), 0) / data.length : 0;
        
        return {
            avgResolutionTime: avgResolutionTime / 60, // Convert to hours
            satisfaction: avgSatisfaction
        };
    }
    
    processPerformanceData(data) {
        const avgProductivity = data.length > 0 ? 
            data.reduce((sum, item) => sum + (item.productivity_score || 0), 0) / data.length : 0;
        
        return {
            teamProductivity: avgProductivity
        };
    }
}

// Export de la classe
window.DirectusAPI = DirectusAPI;