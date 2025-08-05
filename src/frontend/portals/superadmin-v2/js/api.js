export class API {
    constructor() {
        this.baseURL = 'http://localhost:3000/api';
        this.token = localStorage.getItem('auth_token');
    }
    
    async getDashboardData(params) {
        try {
            const response = await fetch(`${this.baseURL}/dashboard`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify(params)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            // Retourner des données mock en cas d'erreur
            return this.getMockDashboardData(params);
        }
    }
    
    async getCompanyMetrics(companyId, period) {
        try {
            const response = await fetch(`${this.baseURL}/companies/${companyId}/metrics?period=${period}`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
            
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return null;
        }
    }
    
    async getAlerts() {
        try {
            const response = await fetch(`${this.baseURL}/alerts`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
            
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return [];
        }
    }
    
    async updateAlert(alertId, action) {
        try {
            const response = await fetch(`${this.baseURL}/alerts/${alertId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ action })
            });
            
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return null;
        }
    }
    
    // Méthode de fallback avec données mock
    getMockDashboardData(params) {
        const baseData = {
            kpis: {
                revenue: 2450000,
                growth: 23.5,
                cash: 892000,
                objective: 87,
                revenueChange: 245000
            },
            companies: [
                { id: 'hypervisual', name: 'HyperVisual', icon: '📹', revenue: 458000, growth: 18, performance: 85 },
                { id: 'dynamics', name: 'Dynamics', icon: '💡', revenue: 623000, growth: 32, performance: 92 },
                { id: 'lexia', name: 'Lexia', icon: '🗣️', revenue: 384000, growth: 12, performance: 78 },
                { id: 'nkreality', name: 'NKReality', icon: '🏠', revenue: 789000, growth: 45, performance: 95 },
                { id: 'etekout', name: 'Etekout', icon: '🛒', revenue: 196000, growth: -3, performance: 68 }
            ],
            alerts: [
                { id: 1, type: 'warning', icon: 'trending-down', message: 'Etekout: Baisse CA -3%', action: 'Voir détails' },
                { id: 2, type: 'danger', icon: 'dollar-sign', message: '3 factures impayées > 60 jours', action: 'Relancer' }
            ]
        };
        
        // Filtrer par entreprise si nécessaire
        if (params.company && params.company !== 'all') {
            const company = baseData.companies.find(c => c.id === params.company);
            if (company) {
                baseData.kpis.revenue = company.revenue;
                baseData.kpis.growth = company.growth;
                baseData.companies = [company];
            }
        }
        
        return baseData;
    }
}