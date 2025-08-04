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
    },
    
    // Advanced UI Components
    components: {
        // Animation des nombres avec effet de comptage
        countUp: function(element, duration = 2000) {
            const target = parseInt(element.dataset.target || element.textContent.replace(/[^0-9]/g, ''));
            const start = 0;
            const increment = target / (duration / 16);
            let current = start;
            
            element.textContent = window.App.utils.formatCurrency(0);
            
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                element.textContent = window.App.utils.formatCurrency(Math.floor(current));
            }, 16);
        },
        
        // Graphique sparkline simple avec ApexCharts
        createSparkline: function(element, data, color = '#206bc4') {
            if (typeof ApexCharts === 'undefined') return;
            
            const options = {
                series: [{
                    data: data
                }],
                chart: {
                    type: 'line',
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
                colors: [color],
                tooltip: {
                    enabled: false
                }
            };
            
            return new ApexCharts(element, options).render();
        },
        
        // Toast notifications améliorées avec animations
        showToast: function(message, type = 'success', duration = 3000) {
            const icons = {
                success: 'check-circle',
                error: 'alert-circle',
                warning: 'alert-triangle',
                info: 'info-circle'
            };
            
            const colors = {
                success: '#2fb344',
                error: '#d63939',
                warning: '#f59f00',
                info: '#4299e1'
            };
            
            const toast = document.createElement('div');
            toast.className = 'position-fixed';
            toast.style.cssText = `
                top: 20px;
                right: 20px;
                z-index: 9999;
                animation: slideInRight 0.3s ease-out;
            `;
            
            toast.innerHTML = `
                <div class="card shadow-lg" style="min-width: 300px; border-left: 4px solid ${colors[type]};">
                    <div class="card-body">
                        <div class="d-flex align-items-center">
                            <div class="me-3">
                                <i class="ti ti-${icons[type]} fs-1" style="color: ${colors[type]};"></i>
                            </div>
                            <div class="flex-fill">
                                <div class="fw-bold">${type.charAt(0).toUpperCase() + type.slice(1)}</div>
                                <div class="text-muted">${message}</div>
                            </div>
                            <div class="ms-3">
                                <button class="btn-close" onclick="this.closest('.position-fixed').remove()"></button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(toast);
            
            setTimeout(() => {
                toast.style.animation = 'fadeOut 0.3s ease-out forwards';
                setTimeout(() => toast.remove(), 300);
            }, duration);
        },
        
        // Skeleton loader pour le chargement
        showSkeleton: function(container, rows = 5) {
            const skeleton = `
                <div class="skeleton-wrapper">
                    ${Array(rows).fill().map(() => `
                        <div class="mb-3">
                            <div class="skeleton" style="height: 20px; width: ${60 + Math.random() * 40}%;"></div>
                            <div class="skeleton mt-2" style="height: 16px; width: ${40 + Math.random() * 30}%;"></div>
                        </div>
                    `).join('')}
                </div>
            `;
            
            if (typeof container === 'string') {
                container = document.querySelector(container);
            }
            
            if (container) {
                container.innerHTML = skeleton;
            }
        },
        
        // Recherche avec highlight
        highlightSearch: function(text, query) {
            if (!query) return text;
            
            const regex = new RegExp(`(${query})`, 'gi');
            return text.replace(regex, '<mark>$1</mark>');
        },
        
        // Tri de table avec animations
        initTableSort: function(table) {
            const headers = table.querySelectorAll('.sortable');
            let currentSort = { column: null, direction: 'asc' };
            
            headers.forEach(header => {
                // Ajouter l'icône de tri
                if (!header.querySelector('.sort-icon')) {
                    header.innerHTML += ' <i class="ti ti-chevron-up sort-icon"></i>';
                }
                
                header.addEventListener('click', function() {
                    const column = this.dataset.sort;
                    const tbody = table.querySelector('tbody');
                    const rows = Array.from(tbody.querySelectorAll('tr'));
                    
                    // Toggle direction
                    if (currentSort.column === column) {
                        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
                    } else {
                        currentSort.column = column;
                        currentSort.direction = 'asc';
                    }
                    
                    // Update UI
                    headers.forEach(h => h.classList.remove('asc', 'desc'));
                    this.classList.add(currentSort.direction);
                    
                    // Sort rows
                    rows.sort((a, b) => {
                        const aValue = a.querySelector(`[data-${column}]`)?.dataset[column] || '';
                        const bValue = b.querySelector(`[data-${column}]`)?.dataset[column] || '';
                        
                        if (column === 'amount' || column === 'number') {
                            return currentSort.direction === 'asc' 
                                ? parseFloat(aValue) - parseFloat(bValue)
                                : parseFloat(bValue) - parseFloat(aValue);
                        } else {
                            return currentSort.direction === 'asc'
                                ? aValue.localeCompare(bValue)
                                : bValue.localeCompare(aValue);
                        }
                    });
                    
                    // Re-append sorted rows with animation
                    rows.forEach((row, index) => {
                        setTimeout(() => {
                            row.style.animation = 'fadeIn 0.3s ease-out';
                            tbody.appendChild(row);
                        }, index * 50);
                    });
                });
            });
        },
        
        // Progress bar animé
        animateProgress: function(element, value) {
            const progressBar = element.querySelector('.progress-bar');
            if (progressBar) {
                progressBar.style.width = '0%';
                setTimeout(() => {
                    progressBar.style.width = value + '%';
                    progressBar.setAttribute('data-value', value + '%');
                }, 100);
            }
        },
        
        // Empty state avec animation
        showEmptyState: function(container, message = 'Aucune donnée trouvée', icon = 'database-off') {
            const emptyHtml = `
                <div class="empty-state fade-in">
                    <div class="empty-state-icon">
                        <i class="ti ti-${icon}"></i>
                    </div>
                    <h3 class="empty-state-title">${message}</h3>
                    <p class="empty-state-text text-muted">
                        Les données apparaîtront ici une fois disponibles
                    </p>
                </div>
            `;
            
            if (typeof container === 'string') {
                container = document.querySelector(container);
            }
            
            if (container) {
                container.innerHTML = emptyHtml;
            }
        }
    }
};

// Initialize components on DOM ready
document.addEventListener('DOMContentLoaded', function() {
    window.App.init();
    
    // Auto-initialize count-up animations
    document.querySelectorAll('.count-up').forEach(el => {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    window.App.components.countUp(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        });
        observer.observe(el);
    });
    
    // Auto-initialize sortable tables
    document.querySelectorAll('table').forEach(table => {
        if (table.querySelector('.sortable')) {
            window.App.components.initTableSort(table);
        }
    });
    
    // Smooth scroll for anchors
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId && targetId !== '#') {
                e.preventDefault();
                const target = document.querySelector(targetId);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    });
    
    // Hide page loader when ready
    window.addEventListener('load', function() {
        const loader = document.getElementById('page-loader');
        if (loader) {
            loader.style.display = 'none';
        }
    });
});

// Override showAlert to use new toast component
window.App.utils.showAlert = function(message, type = 'success') {
    window.App.components.showToast(message, type);
};