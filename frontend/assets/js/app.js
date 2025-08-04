// Core application JavaScript
window.App = {
    // Configuration API Directus
    config: {
        apiUrl: '/api/directus',
        apiToken: 'e6Vt5LRHnYhq7-78yzoSxwdgjn2D6-JW'
    },
    
    // Initialisation
    init: function() {
        console.log('✅ App initialized');
        this.setupAjaxDefaults();
        this.initializeTooltips();
        this.initializeTheme();
        this.initializeAlerts();
    },
    
    // Configuration AJAX par défaut
    setupAjaxDefaults: function() {
        if (window.$ && $.ajaxSetup) {
            $.ajaxSetup({
                headers: {
                    'Authorization': `Bearer ${this.config.apiToken}`
                }
            });
        }
    },
    
    // Tooltips Tabler
    initializeTooltips: function() {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    },
    
    // Theme management
    initializeTheme: function() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.body.setAttribute('data-bs-theme', savedTheme);
    },
    
    // Initialize alerts container
    initializeAlerts: function() {
        if (!document.getElementById('alerts-container')) {
            const alertsDiv = document.createElement('div');
            alertsDiv.id = 'alerts-container';
            alertsDiv.className = 'position-fixed top-0 end-0 p-3';
            alertsDiv.style.zIndex = '9999';
            document.body.appendChild(alertsDiv);
        }
    },
    
    // API Helper
    api: {
        get: async function(endpoint) {
            try {
                const response = await fetch(`${App.config.apiUrl}${endpoint}`, {
                    headers: {
                        'Authorization': `Bearer ${App.config.apiToken}`
                    }
                });
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                return await response.json();
            } catch (error) {
                console.error('API GET Error:', error);
                throw error;
            }
        },
        
        post: async function(endpoint, data) {
            try {
                const response = await fetch(`${App.config.apiUrl}${endpoint}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${App.config.apiToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                return await response.json();
            } catch (error) {
                console.error('API POST Error:', error);
                throw error;
            }
        },
        
        put: async function(endpoint, data) {
            try {
                const response = await fetch(`${App.config.apiUrl}${endpoint}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${App.config.apiToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                return await response.json();
            } catch (error) {
                console.error('API PUT Error:', error);
                throw error;
            }
        },
        
        delete: async function(endpoint) {
            try {
                const response = await fetch(`${App.config.apiUrl}${endpoint}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${App.config.apiToken}`
                    }
                });
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                return await response.json();
            } catch (error) {
                console.error('API DELETE Error:', error);
                throw error;
            }
        }
    },
    
    // Utility functions
    utils: {
        formatCurrency: function(amount, currency = 'CHF') {
            return new Intl.NumberFormat('fr-CH', {
                style: 'currency',
                currency: currency
            }).format(amount);
        },
        
        formatDate: function(date) {
            return new Intl.DateTimeFormat('fr-CH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }).format(new Date(date));
        },
        
        formatNumber: function(number) {
            return new Intl.NumberFormat('fr-CH').format(number);
        },
        
        showAlert: function(message, type = 'success', duration = 5000) {
            const alertId = 'alert-' + Date.now();
            const alertHtml = `
                <div id="${alertId}" class="alert alert-${type} alert-dismissible fade show" role="alert">
                    <div class="d-flex">
                        <div>
                            ${this.getAlertIcon(type)}
                        </div>
                        <div class="ms-2">${message}</div>
                    </div>
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            `;
            const container = document.getElementById('alerts-container');
            if (container) {
                container.insertAdjacentHTML('beforeend', alertHtml);
                
                // Auto-dismiss
                if (duration > 0) {
                    setTimeout(() => {
                        const alert = document.getElementById(alertId);
                        if (alert) {
                            alert.classList.remove('show');
                            setTimeout(() => alert.remove(), 150);
                        }
                    }, duration);
                }
            }
        },
        
        getAlertIcon: function(type) {
            const icons = {
                success: '<svg xmlns="http://www.w3.org/2000/svg" class="icon alert-icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 12l5 5l10 -10" /></svg>',
                danger: '<svg xmlns="http://www.w3.org/2000/svg" class="icon alert-icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10.24 3.957l-8.422 14.06a1.989 1.989 0 0 0 1.7 2.983h16.845a1.989 1.989 0 0 0 1.7 -2.983l-8.423 -14.06a1.989 1.989 0 0 0 -3.4 0z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>',
                warning: '<svg xmlns="http://www.w3.org/2000/svg" class="icon alert-icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 9v4" /><path d="M12 17h.01" /><path d="M5.07 19h13.86a2 2 0 0 0 1.75 -2.75l-6.93 -12a2 2 0 0 0 -3.5 0l-6.93 12a2 2 0 0 0 1.75 2.75" /></svg>',
                info: '<svg xmlns="http://www.w3.org/2000/svg" class="icon alert-icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" /><path d="M12 9h.01" /><path d="M11 12h1v4h1" /></svg>'
            };
            return icons[type] || icons.info;
        },
        
        showLoading: function(show = true) {
            let loader = document.getElementById('global-loader');
            if (!loader && show) {
                loader = document.createElement('div');
                loader.id = 'global-loader';
                loader.className = 'position-fixed top-50 start-50 translate-middle';
                loader.style.zIndex = '10000';
                loader.innerHTML = `
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Chargement...</span>
                    </div>
                `;
                document.body.appendChild(loader);
            } else if (loader) {
                loader.style.display = show ? 'block' : 'none';
            }
        }
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', function() {
    window.App.init();
});