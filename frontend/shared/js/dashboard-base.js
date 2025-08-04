// Base dashboard functionality shared across all portals
window.DashboardBase = {
    // Configuration
    config: {
        refreshInterval: 30000, // 30 seconds
        animationDuration: 300,
        currency: 'CHF'
    },
    
    // Current dashboard data
    data: {},
    
    // Charts instances
    charts: {},
    
    // Refresh timer
    refreshTimer: null,
    
    // Initialize dashboard
    init: async function(role) {
        console.log(`📊 Initializing ${role} dashboard`);
        
        try {
            // Show loading
            this.showLoading(true);
            
            // Load dashboard data
            await this.loadDashboard(role);
            
            // Initialize components
            this.initializeComponents();
            
            // Start auto-refresh
            this.startAutoRefresh(role);
            
            // Apply permissions
            if (window.PermissionsDirectus) {
                window.PermissionsDirectus.applyToUI();
            }
            
        } catch (error) {
            console.error('Dashboard initialization error:', error);
            this.showError('Erreur lors du chargement du dashboard');
        } finally {
            this.showLoading(false);
        }
    },
    
    // Load dashboard data based on role
    loadDashboard: async function(role) {
        try {
            let data = {};
            
            switch(role) {
                case 'superadmin':
                    data = await this.loadSuperAdminData();
                    break;
                case 'client':
                    data = await this.loadClientData();
                    break;
                case 'prestataire':
                    data = await this.loadPrestataireData();
                    break;
                case 'revendeur':
                    data = await this.loadRevendeurData();
                    break;
                default:
                    throw new Error(`Unknown role: ${role}`);
            }
            
            this.data = data;
            this.updateDashboard(data);
            
            return data;
            
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            throw error;
        }
    },
    
    // SuperAdmin dashboard data
    loadSuperAdminData: async function() {
        const [companies, projects, invoices, users] = await Promise.all([
            window.App.api.get('/items/companies'),
            window.App.api.get('/items/projects'),
            window.App.api.get('/items/client_invoices'),
            window.App.api.get('/items/directus_users')
        ]);
        
        // Calculate statistics
        const stats = {
            totalCompanies: companies.data?.length || 0,
            totalProjects: projects.data?.length || 0,
            activeProjects: projects.data?.filter(p => p.status === 'active').length || 0,
            totalRevenue: this.calculateTotalRevenue(invoices.data),
            pendingInvoices: invoices.data?.filter(i => i.status === 'sent').length || 0,
            totalUsers: users.data?.length || 0
        };
        
        return {
            companies: companies.data || [],
            projects: projects.data || [],
            invoices: invoices.data || [],
            users: users.data || [],
            stats: stats,
            charts: this.prepareChartData(companies.data, projects.data, invoices.data)
        };
    },
    
    // Client dashboard data
    loadClientData: async function() {
        const user = window.AuthDirectus.getUser();
        const clientId = user?.id || 1;
        
        const [projects, invoices, documents] = await Promise.all([
            window.App.api.get(`/items/projects?filter[client_id][_eq]=${clientId}`),
            window.App.api.get(`/items/client_invoices?filter[client_id][_eq]=${clientId}`),
            window.App.api.get(`/items/documents?filter[client_id][_eq]=${clientId}`)
        ]);
        
        return {
            projects: projects.data || [],
            invoices: invoices.data || [],
            documents: documents.data || [],
            stats: {
                activeProjects: projects.data?.filter(p => p.status === 'active').length || 0,
                totalSpent: this.calculateTotalRevenue(invoices.data?.filter(i => i.status === 'paid')),
                pendingPayments: this.calculateTotalRevenue(invoices.data?.filter(i => i.status === 'sent')),
                documentsCount: documents.data?.length || 0
            }
        };
    },
    
    // Prestataire dashboard data
    loadPrestataireData: async function() {
        const user = window.AuthDirectus.getUser();
        const prestataireId = user?.id || 1;
        
        const [missions, timesheets, payments] = await Promise.all([
            window.App.api.get(`/items/projects?filter[assigned_to][_contains]=${prestataireId}`),
            window.App.api.get(`/items/timesheets?filter[user_id][_eq]=${prestataireId}`),
            window.App.api.get(`/items/payments?filter[recipient_id][_eq]=${prestataireId}`)
        ]);
        
        const stats = {
            activeMissions: missions.data?.filter(m => m.status === 'active').length || 0,
            hoursWorked: this.calculateTotalHours(timesheets.data),
            pendingPayments: this.calculateTotalRevenue(payments.data?.filter(p => p.status === 'pending')),
            totalEarned: this.calculateTotalRevenue(payments.data?.filter(p => p.status === 'paid'))
        };
        
        return {
            missions: missions.data || [],
            timesheets: timesheets.data || [],
            payments: payments.data || [],
            stats: stats
        };
    },
    
    // Revendeur dashboard data
    loadRevendeurData: async function() {
        const user = window.AuthDirectus.getUser();
        const revendeurId = user?.id || 1;
        
        const [leads, deals, commissions] = await Promise.all([
            window.App.api.get(`/items/leads?filter[assigned_to][_eq]=${revendeurId}`),
            window.App.api.get(`/items/deals?filter[revendeur_id][_eq]=${revendeurId}`),
            window.App.api.get(`/items/commissions?filter[revendeur_id][_eq]=${revendeurId}`)
        ]);
        
        return {
            leads: leads.data || [],
            deals: deals.data || [],
            commissions: commissions.data || [],
            stats: {
                totalLeads: leads.data?.length || 0,
                activeDeals: deals.data?.filter(d => d.status === 'active').length || 0,
                totalCommissions: this.calculateTotalRevenue(commissions.data),
                conversionRate: this.calculateConversionRate(leads.data, deals.data)
            }
        };
    },
    
    // Update dashboard UI with data
    updateDashboard: function(data) {
        // Update KPI cards
        this.updateKPICards(data.stats);
        
        // Update charts
        if (data.charts) {
            this.updateCharts(data.charts);
        }
        
        // Update tables
        this.updateTables(data);
        
        // Update last refresh time
        this.updateLastRefresh();
    },
    
    // Update KPI cards
    updateKPICards: function(stats) {
        if (!stats) return;
        
        Object.keys(stats).forEach(key => {
            const element = document.querySelector(`[data-kpi="${key}"]`);
            if (element) {
                const value = stats[key];
                if (typeof value === 'number') {
                    if (key.includes('Revenue') || key.includes('Payment') || key.includes('Commission')) {
                        element.textContent = window.App.utils.formatCurrency(value);
                    } else {
                        element.textContent = window.App.utils.formatNumber(value);
                    }
                } else {
                    element.textContent = value;
                }
            }
        });
    },
    
    // Prepare chart data
    prepareChartData: function(companies, projects, invoices) {
        return {
            revenue: this.prepareRevenueChart(invoices),
            projects: this.prepareProjectsChart(projects),
            companies: this.prepareCompaniesChart(companies)
        };
    },
    
    // Prepare revenue chart data
    prepareRevenueChart: function(invoices) {
        if (!invoices || !invoices.length) return null;
        
        // Group by month
        const monthlyRevenue = {};
        invoices.forEach(invoice => {
            if (invoice.status === 'paid' && invoice.date) {
                const month = new Date(invoice.date).toLocaleDateString('fr-CH', { year: 'numeric', month: 'short' });
                monthlyRevenue[month] = (monthlyRevenue[month] || 0) + (parseFloat(invoice.amount) || 0);
            }
        });
        
        return {
            labels: Object.keys(monthlyRevenue),
            data: Object.values(monthlyRevenue)
        };
    },
    
    // Prepare projects chart data
    prepareProjectsChart: function(projects) {
        if (!projects || !projects.length) return null;
        
        const statusCount = {};
        projects.forEach(project => {
            const status = project.status || 'unknown';
            statusCount[status] = (statusCount[status] || 0) + 1;
        });
        
        return {
            labels: Object.keys(statusCount),
            data: Object.values(statusCount)
        };
    },
    
    // Prepare companies chart data
    prepareCompaniesChart: function(companies) {
        if (!companies || !companies.length) return null;
        
        const typeCount = {};
        companies.forEach(company => {
            const type = company.type || 'other';
            typeCount[type] = (typeCount[type] || 0) + 1;
        });
        
        return {
            labels: Object.keys(typeCount),
            data: Object.values(typeCount)
        };
    },
    
    // Update charts
    updateCharts: function(chartsData) {
        // Revenue chart
        if (chartsData.revenue && document.getElementById('revenue-chart')) {
            this.createLineChart('revenue-chart', chartsData.revenue);
        }
        
        // Projects chart
        if (chartsData.projects && document.getElementById('projects-chart')) {
            this.createPieChart('projects-chart', chartsData.projects);
        }
        
        // Companies chart
        if (chartsData.companies && document.getElementById('companies-chart')) {
            this.createBarChart('companies-chart', chartsData.companies);
        }
    },
    
    // Create line chart (using ApexCharts if available)
    createLineChart: function(elementId, data) {
        if (!window.ApexCharts) return;
        
        const options = {
            series: [{
                name: 'Revenue',
                data: data.data
            }],
            chart: {
                type: 'line',
                height: 300,
                toolbar: { show: false }
            },
            xaxis: {
                categories: data.labels
            },
            yaxis: {
                labels: {
                    formatter: (value) => window.App.utils.formatCurrency(value)
                }
            }
        };
        
        if (this.charts[elementId]) {
            this.charts[elementId].destroy();
        }
        
        this.charts[elementId] = new ApexCharts(document.getElementById(elementId), options);
        this.charts[elementId].render();
    },
    
    // Create pie chart
    createPieChart: function(elementId, data) {
        if (!window.ApexCharts) return;
        
        const options = {
            series: data.data,
            chart: {
                type: 'donut',
                height: 300
            },
            labels: data.labels,
            legend: {
                position: 'bottom'
            }
        };
        
        if (this.charts[elementId]) {
            this.charts[elementId].destroy();
        }
        
        this.charts[elementId] = new ApexCharts(document.getElementById(elementId), options);
        this.charts[elementId].render();
    },
    
    // Create bar chart
    createBarChart: function(elementId, data) {
        if (!window.ApexCharts) return;
        
        const options = {
            series: [{
                name: 'Count',
                data: data.data
            }],
            chart: {
                type: 'bar',
                height: 300,
                toolbar: { show: false }
            },
            xaxis: {
                categories: data.labels
            }
        };
        
        if (this.charts[elementId]) {
            this.charts[elementId].destroy();
        }
        
        this.charts[elementId] = new ApexCharts(document.getElementById(elementId), options);
        this.charts[elementId].render();
    },
    
    // Update tables
    updateTables: function(data) {
        // Update recent items table
        if (data.projects && document.getElementById('recent-projects')) {
            this.updateProjectsTable(data.projects.slice(0, 5));
        }
        
        if (data.invoices && document.getElementById('recent-invoices')) {
            this.updateInvoicesTable(data.invoices.slice(0, 5));
        }
    },
    
    // Calculate total revenue
    calculateTotalRevenue: function(items) {
        if (!items || !items.length) return 0;
        return items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    },
    
    // Calculate total hours
    calculateTotalHours: function(timesheets) {
        if (!timesheets || !timesheets.length) return 0;
        return timesheets.reduce((sum, ts) => sum + (parseFloat(ts.hours) || 0), 0);
    },
    
    // Calculate conversion rate
    calculateConversionRate: function(leads, deals) {
        if (!leads || !leads.length) return 0;
        if (!deals || !deals.length) return 0;
        return Math.round((deals.length / leads.length) * 100);
    },
    
    // Initialize components
    initializeComponents: function() {
        // Initialize tooltips
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
        
        // Initialize popovers
        const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
        popoverTriggerList.map(function (popoverTriggerEl) {
            return new bootstrap.Popover(popoverTriggerEl);
        });
    },
    
    // Start auto-refresh
    startAutoRefresh: function(role) {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
        }
        
        this.refreshTimer = setInterval(() => {
            console.log('🔄 Auto-refreshing dashboard');
            this.loadDashboard(role);
        }, this.config.refreshInterval);
    },
    
    // Stop auto-refresh
    stopAutoRefresh: function() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
        }
    },
    
    // Update last refresh time
    updateLastRefresh: function() {
        const element = document.getElementById('last-refresh');
        if (element) {
            const now = new Date();
            element.textContent = now.toLocaleTimeString('fr-CH');
        }
    },
    
    // Show/hide loading
    showLoading: function(show) {
        if (window.App && window.App.utils) {
            window.App.utils.showLoading(show);
        }
    },
    
    // Show error message
    showError: function(message) {
        if (window.App && window.App.utils) {
            window.App.utils.showAlert(message, 'danger');
        }
    },
    
    // Show success message
    showSuccess: function(message) {
        if (window.App && window.App.utils) {
            window.App.utils.showAlert(message, 'success');
        }
    }
};

// Export for use in other modules
window.DashboardBase = DashboardBase;