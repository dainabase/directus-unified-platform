/**
 * Module Dashboard Superadmin - Vue consolidée multi-entités
 * Affiche KPIs, graphiques et métriques temps réel
 */
window.DashboardSuperadmin = (function() {
    'use strict';

    // Configuration
    const config = {
        refreshInterval: 30000, // 30 secondes
        animationDuration: 1000,
        entities: [
            { id: 'hypervisual', name: 'Hypervisual', color: '#206bc4', icon: 'video' },
            { id: 'dainamics', name: 'Dainamics', color: '#5eba00', icon: 'code' },
            { id: 'enki', name: 'Enki Reality', color: '#f76707', icon: 'augmented-reality' },
            { id: 'takeout', name: 'Takeout', color: '#ae3ec9', icon: 'truck-delivery' },
            { id: 'lexaia', name: 'Lexaia', color: '#d63939', icon: 'brain' }
        ],
        currency: 'CHF',
        locale: 'fr-CH'
    };

    // État du dashboard
    let dashboardData = {
        consolidated: {},
        entities: {},
        charts: {},
        timeline: []
    };

    let refreshTimer = null;
    let charts = {};

    /**
     * Initialisation du dashboard
     */
    async function init() {
        console.log('Initialisation Dashboard Superadmin...');
        
        try {
            // Vérifier permissions
            const hasAccess = await window.PermissionsSuperadmin.hasPermission('superadmin.finance.view');
            if (!hasAccess) {
                throw new Error('Permissions insuffisantes');
            }

            // Charger données initiales
            await loadDashboardData();
            
            // Initialiser composants
            initializeKPICards();
            initializeCharts();
            initializeEntityTable();
            initializeTimeline();
            initializeAlerts();
            
            // Configurer refresh automatique
            startAutoRefresh();
            
            // Event listeners
            setupEventListeners();
            
            // Logger succès
            await window.AuthSuperadmin.logAuditEvent('DASHBOARD_LOADED', {
                entities: config.entities.length
            });
            
        } catch (error) {
            console.error('Erreur initialisation dashboard:', error);
            showError('Erreur chargement dashboard: ' + error.message);
        }
    }

    /**
     * Charger les données du dashboard
     */
    async function loadDashboardData() {
        try {
            // Simuler appel API - en prod, appeler vraie API
            const data = await window.PermissionsSuperadmin.secureSuperadminCall(
                'superadmin.finance.view',
                async () => {
                    // En dev, retourner données simulées
                    return generateMockData();
                },
                { action: 'load_dashboard_data' }
            );
            
            dashboardData = data;
            updateLastRefresh();
            
        } catch (error) {
            console.error('Erreur chargement données:', error);
            throw error;
        }
    }

    /**
     * Générer données mock pour dev
     */
    function generateMockData() {
        const now = new Date();
        
        return {
            consolidated: {
                revenue: {
                    current: 485000,
                    previous: 432000,
                    change: 12.3,
                    trend: 'up'
                },
                treasury: {
                    current: 892000,
                    previous: 825000,
                    change: 8.1,
                    trend: 'up'
                },
                projects: {
                    active: 47,
                    toInvoice: 312000,
                    overdue: 5
                },
                invoicing: {
                    pending: 23,
                    amount: 142000,
                    overdueAmount: 45000
                },
                expenses: {
                    month: 287000,
                    change: -5.2,
                    trend: 'down'
                }
            },
            entities: {
                hypervisual: {
                    revenue: 185000,
                    margin: 42,
                    projects: 12,
                    treasury: 320000,
                    performance: 'excellent'
                },
                dainamics: {
                    revenue: 142000,
                    margin: 38,
                    projects: 15,
                    treasury: 235000,
                    performance: 'good'
                },
                enki: {
                    revenue: 98000,
                    margin: 35,
                    projects: 8,
                    treasury: 187000,
                    performance: 'good'
                },
                takeout: {
                    revenue: 45000,
                    margin: 28,
                    projects: 9,
                    treasury: 98000,
                    performance: 'average'
                },
                lexaia: {
                    revenue: 15000,
                    margin: 45,
                    projects: 3,
                    treasury: 52000,
                    performance: 'startup'
                }
            },
            charts: {
                revenueEvolution: generateRevenueEvolution(),
                treasuryByEntity: generateTreasuryData(),
                projectsPipeline: generateProjectsData(),
                cashflow: generateCashflowData()
            },
            timeline: generateTimelineEvents(),
            alerts: generateAlerts()
        };
    }

    /**
     * Initialiser les cartes KPI
     */
    function initializeKPICards() {
        // CA Mensuel
        updateKPICard('revenue-card', {
            title: 'Chiffre d\'affaires mensuel',
            value: dashboardData.consolidated.revenue.current,
            change: dashboardData.consolidated.revenue.change,
            trend: dashboardData.consolidated.revenue.trend,
            icon: 'currency-franc',
            color: 'blue'
        });

        // Trésorerie
        updateKPICard('treasury-card', {
            title: 'Trésorerie globale',
            value: dashboardData.consolidated.treasury.current,
            change: dashboardData.consolidated.treasury.change,
            trend: dashboardData.consolidated.treasury.trend,
            icon: 'building-bank',
            color: 'green'
        });

        // Projets actifs
        updateKPICard('projects-card', {
            title: 'Projets actifs',
            value: dashboardData.consolidated.projects.active,
            subtitle: formatCurrency(dashboardData.consolidated.projects.toInvoice) + ' à facturer',
            icon: 'clipboard-list',
            color: 'azure'
        });

        // Facturation
        updateKPICard('invoicing-card', {
            title: 'Facturation en attente',
            value: dashboardData.consolidated.invoicing.pending,
            subtitle: formatCurrency(dashboardData.consolidated.invoicing.amount),
            warning: dashboardData.consolidated.invoicing.overdueAmount > 0,
            icon: 'file-invoice',
            color: 'orange'
        });
    }

    /**
     * Mettre à jour une carte KPI
     */
    function updateKPICard(cardId, data) {
        const card = document.getElementById(cardId);
        if (!card) return;

        const isPositive = data.trend === 'up';
        const changeClass = isPositive ? 'text-success' : 'text-danger';
        const changeIcon = isPositive ? 'trending-up' : 'trending-down';

        card.innerHTML = `
            <div class="card superadmin-card">
                <div class="card-body">
                    <div class="d-flex align-items-center">
                        <div class="subheader">${data.title}</div>
                        <div class="ms-auto lh-1">
                            ${data.change ? `
                                <div class="text-secondary ${changeClass} d-inline-flex align-items-center lh-1">
                                    ${data.change > 0 ? '+' : ''}${data.change}%
                                    <svg xmlns="http://www.w3.org/2000/svg" class="icon ms-1" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none">
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                        <path d="${isPositive ? 'M3 17l6 -6l4 4l8 -8' : 'M3 7l6 6l4 -4l8 8'}"/>
                                        <path d="${isPositive ? 'M14 7l7 0l0 7' : 'M14 17l7 0l0 -7'}"/>
                                    </svg>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    <div class="d-flex align-items-baseline">
                        <div class="h1 mb-0 me-2">
                            ${typeof data.value === 'number' && data.value > 1000 ? 
                                formatCurrency(data.value) : 
                                data.value
                            }
                        </div>
                        <div class="me-auto">
                            <span class="text-secondary">
                                ${data.subtitle || ''}
                            </span>
                        </div>
                        <span class="text-${data.color} d-inline-flex align-items-center lh-1">
                            ${getIcon(data.icon)}
                        </span>
                    </div>
                    ${data.warning ? `
                        <div class="text-danger small mt-1">
                            <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-sm" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                <path d="M12 9v4"/>
                                <path d="M12 17h.01"/>
                                <path d="M5.07 19H19a2 2 0 0 0 1.75 -2.75L13.75 4a2 2 0 0 0 -3.5 0L3.25 16.25a2 2 0 0 0 1.75 2.75"/>
                            </svg>
                            ${formatCurrency(dashboardData.consolidated.invoicing.overdueAmount)} en retard
                        </div>
                    ` : ''}
                </div>
                ${data.sparkline ? `
                    <div id="${cardId}-sparkline" class="card-chart-bg"></div>
                ` : ''}
            </div>
        `;

        // Animer le changement de valeur
        animateValue(card.querySelector('.h1'), data.value);
    }

    /**
     * Initialiser les graphiques
     */
    function initializeCharts() {
        // Graphique évolution CA
        createRevenueChart();
        
        // Graphique trésorerie par entité
        createTreasuryChart();
        
        // Graphique pipeline projets
        createProjectsChart();
        
        // Graphique cashflow
        createCashflowChart();
    }

    /**
     * Graphique évolution CA (12 mois)
     */
    function createRevenueChart() {
        const options = {
            series: [{
                name: 'Chiffre d\'affaires',
                data: dashboardData.charts.revenueEvolution.data
            }],
            chart: {
                type: 'area',
                height: 300,
                fontFamily: 'inherit',
                toolbar: {
                    show: false
                },
                animations: {
                    enabled: true,
                    easing: 'easeinout',
                    speed: 800
                }
            },
            dataLabels: {
                enabled: false
            },
            fill: {
                type: 'gradient',
                gradient: {
                    shadeIntensity: 1,
                    opacityFrom: 0.45,
                    opacityTo: 0.05,
                    stops: [0, 100]
                }
            },
            stroke: {
                width: 2,
                curve: 'smooth'
            },
            xaxis: {
                categories: dashboardData.charts.revenueEvolution.categories,
                labels: {
                    style: {
                        colors: '#667382'
                    }
                }
            },
            yaxis: {
                labels: {
                    style: {
                        colors: '#667382'
                    },
                    formatter: function(val) {
                        return formatCurrency(val, true);
                    }
                }
            },
            colors: ['#206bc4'],
            grid: {
                borderColor: '#e7e7e7',
                strokeDashArray: 4
            },
            tooltip: {
                theme: 'dark',
                y: {
                    formatter: function(val) {
                        return formatCurrency(val);
                    }
                }
            }
        };

        if (charts.revenue) {
            charts.revenue.destroy();
        }

        charts.revenue = new ApexCharts(
            document.querySelector("#revenue-chart"),
            options
        );
        charts.revenue.render();
    }

    /**
     * Graphique trésorerie par entité (donut)
     */
    function createTreasuryChart() {
        const data = dashboardData.charts.treasuryByEntity;
        
        const options = {
            series: data.series,
            chart: {
                type: 'donut',
                height: 300,
                fontFamily: 'inherit'
            },
            labels: data.labels,
            colors: config.entities.map(e => e.color),
            dataLabels: {
                enabled: true,
                formatter: function(val, opts) {
                    return opts.w.config.labels[opts.seriesIndex] + '\n' + 
                           formatCurrency(opts.w.config.series[opts.seriesIndex], true);
                }
            },
            stroke: {
                width: 2,
                colors: ['#fff']
            },
            legend: {
                position: 'bottom',
                horizontalAlign: 'center'
            },
            tooltip: {
                theme: 'dark',
                y: {
                    formatter: function(val) {
                        return formatCurrency(val);
                    }
                }
            },
            plotOptions: {
                pie: {
                    donut: {
                        size: '65%',
                        labels: {
                            show: true,
                            total: {
                                show: true,
                                label: 'Total',
                                formatter: function(w) {
                                    const total = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                                    return formatCurrency(total, true);
                                }
                            }
                        }
                    }
                }
            }
        };

        if (charts.treasury) {
            charts.treasury.destroy();
        }

        charts.treasury = new ApexCharts(
            document.querySelector("#treasury-chart"),
            options
        );
        charts.treasury.render();
    }

    /**
     * Graphique pipeline projets (bar horizontal)
     */
    function createProjectsChart() {
        const data = dashboardData.charts.projectsPipeline;
        
        const options = {
            series: [{
                name: 'Projets',
                data: data.series
            }],
            chart: {
                type: 'bar',
                height: 250,
                fontFamily: 'inherit',
                toolbar: {
                    show: false
                }
            },
            plotOptions: {
                bar: {
                    horizontal: true,
                    distributed: true,
                    barHeight: '60%',
                    dataLabels: {
                        position: 'bottom'
                    }
                }
            },
            dataLabels: {
                enabled: true,
                textAnchor: 'start',
                style: {
                    colors: ['#fff']
                },
                formatter: function(val, opt) {
                    return opt.w.globals.labels[opt.dataPointIndex] + ":  " + val;
                },
                offsetX: 0
            },
            xaxis: {
                categories: data.categories
            },
            yaxis: {
                labels: {
                    show: false
                }
            },
            colors: ['#206bc4', '#5eba00', '#f76707', '#f59f00', '#d63939'],
            grid: {
                borderColor: '#e7e7e7',
                strokeDashArray: 4
            },
            legend: {
                show: false
            },
            tooltip: {
                theme: 'dark'
            }
        };

        if (charts.projects) {
            charts.projects.destroy();
        }

        charts.projects = new ApexCharts(
            document.querySelector("#projects-chart"),
            options
        );
        charts.projects.render();
    }

    /**
     * Graphique cashflow (line + column)
     */
    function createCashflowChart() {
        const data = dashboardData.charts.cashflow;
        
        const options = {
            series: [
                {
                    name: 'Encaissements',
                    type: 'column',
                    data: data.income
                },
                {
                    name: 'Décaissements',
                    type: 'column',
                    data: data.expenses
                },
                {
                    name: 'Solde cumulé',
                    type: 'line',
                    data: data.balance
                }
            ],
            chart: {
                height: 300,
                type: 'line',
                fontFamily: 'inherit',
                toolbar: {
                    show: false
                }
            },
            stroke: {
                width: [0, 0, 3],
                curve: 'smooth'
            },
            dataLabels: {
                enabled: false
            },
            labels: data.categories,
            xaxis: {
                type: 'category'
            },
            yaxis: [
                {
                    title: {
                        text: 'Montants (CHF)'
                    },
                    labels: {
                        formatter: function(val) {
                            return formatCurrency(val, true);
                        }
                    }
                }
            ],
            colors: ['#5eba00', '#d63939', '#206bc4'],
            grid: {
                borderColor: '#e7e7e7',
                strokeDashArray: 4
            },
            legend: {
                position: 'top',
                horizontalAlign: 'right'
            },
            tooltip: {
                theme: 'dark',
                shared: true,
                intersect: false,
                y: {
                    formatter: function(val) {
                        return formatCurrency(val);
                    }
                }
            }
        };

        if (charts.cashflow) {
            charts.cashflow.destroy();
        }

        charts.cashflow = new ApexCharts(
            document.querySelector("#cashflow-chart"),
            options
        );
        charts.cashflow.render();
    }

    /**
     * Initialiser le tableau comparatif des entités
     */
    function initializeEntityTable() {
        const tbody = document.querySelector('#entities-table tbody');
        if (!tbody) return;

        tbody.innerHTML = '';

        config.entities.forEach(entity => {
            const data = dashboardData.entities[entity.id];
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>
                    <div class="d-flex align-items-center">
                        <span class="avatar avatar-sm me-2" style="background-color: ${entity.color}20">
                            ${getIcon(entity.icon, entity.color)}
                        </span>
                        <div>
                            <div class="font-weight-medium">${entity.name}</div>
                            <div class="text-secondary small">${data.projects} projets</div>
                        </div>
                    </div>
                </td>
                <td class="text-end amount">
                    <strong>${formatCurrency(data.revenue)}</strong>
                    ${getChangeIndicator(data.revenue, 150000)}
                </td>
                <td class="text-center">
                    <div class="d-flex align-items-center justify-content-center">
                        <span class="me-1">${data.margin}%</span>
                        ${getMarginBadge(data.margin)}
                    </div>
                </td>
                <td class="text-center">
                    <span class="badge bg-azure-lt">${data.projects}</span>
                </td>
                <td class="text-end amount">
                    ${formatCurrency(data.treasury)}
                    ${getTreasuryIndicator(data.treasury)}
                </td>
                <td class="text-center">
                    ${getPerformanceBadge(data.performance)}
                </td>
            `;
            
            tbody.appendChild(row);
        });

        // Ligne totaux
        const totalRow = document.createElement('tr');
        totalRow.className = 'bg-light font-weight-bold';
        
        const totals = calculateTotals();
        totalRow.innerHTML = `
            <td>
                <div class="d-flex align-items-center">
                    <span class="avatar avatar-sm me-2 bg-dark">
                        <svg xmlns="http://www.w3.org/2000/svg" class="icon text-white" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                            <path d="M3 21l18 0"/>
                            <path d="M5 21v-14l8 -4v18"/>
                            <path d="M19 21v-10l-6 -4"/>
                        </svg>
                    </span>
                    <div>
                        <div class="font-weight-medium">TOTAL GROUPE</div>
                        <div class="text-secondary small">${totals.projects} projets</div>
                    </div>
                </div>
            </td>
            <td class="text-end amount">
                <strong class="h3">${formatCurrency(totals.revenue)}</strong>
            </td>
            <td class="text-center">
                <strong>${totals.avgMargin}%</strong>
            </td>
            <td class="text-center">
                <strong>${totals.projects}</strong>
            </td>
            <td class="text-end amount">
                <strong class="h3">${formatCurrency(totals.treasury)}</strong>
            </td>
            <td class="text-center">
                ${getGroupPerformance(totals)}
            </td>
        `;
        
        tbody.appendChild(totalRow);
    }

    /**
     * Calculer les totaux
     */
    function calculateTotals() {
        let totals = {
            revenue: 0,
            projects: 0,
            treasury: 0,
            margins: []
        };

        config.entities.forEach(entity => {
            const data = dashboardData.entities[entity.id];
            totals.revenue += data.revenue;
            totals.projects += data.projects;
            totals.treasury += data.treasury;
            totals.margins.push(data.margin);
        });

        totals.avgMargin = Math.round(
            totals.margins.reduce((a, b) => a + b, 0) / totals.margins.length
        );

        return totals;
    }

    /**
     * Initialiser la timeline d'activité
     */
    function initializeTimeline() {
        const timeline = document.getElementById('activity-timeline');
        if (!timeline) return;

        timeline.innerHTML = '';

        dashboardData.timeline.forEach((event, index) => {
            const item = document.createElement('div');
            item.className = 'timeline-item';
            
            // Animer l'apparition
            setTimeout(() => {
                item.classList.add('timeline-item-animated');
            }, index * 100);

            item.innerHTML = `
                <div class="timeline-badge bg-${event.color}">
                    ${getIcon(event.icon, 'white')}
                </div>
                <div class="timeline-content">
                    <div class="d-flex align-items-center justify-content-between mb-1">
                        <strong>${event.title}</strong>
                        <small class="text-secondary">${formatTimeAgo(event.timestamp)}</small>
                    </div>
                    <div class="text-secondary">${event.description}</div>
                    ${event.amount ? `
                        <div class="mt-1">
                            <span class="badge bg-${event.color}-lt">
                                ${formatCurrency(event.amount)}
                            </span>
                        </div>
                    ` : ''}
                </div>
            `;
            
            timeline.appendChild(item);
        });
    }

    /**
     * Initialiser les alertes
     */
    function initializeAlerts() {
        const alertsContainer = document.getElementById('alerts-container');
        if (!alertsContainer || !dashboardData.alerts) return;

        alertsContainer.innerHTML = '';

        dashboardData.alerts.forEach(alert => {
            if (alert.priority === 'high') {
                const alertEl = document.createElement('div');
                alertEl.className = `alert alert-${alert.type} alert-dismissible`;
                alertEl.innerHTML = `
                    <div class="d-flex">
                        <div>
                            ${getAlertIcon(alert.type)}
                        </div>
                        <div>
                            <h4 class="alert-title">${alert.title}</h4>
                            <div class="text-secondary">${alert.message}</div>
                        </div>
                    </div>
                    <a class="btn-close" data-bs-dismiss="alert" aria-label="close"></a>
                `;
                alertsContainer.appendChild(alertEl);
            }
        });
    }

    /**
     * Configuration auto-refresh
     */
    function startAutoRefresh() {
        if (refreshTimer) {
            clearInterval(refreshTimer);
        }

        refreshTimer = setInterval(async () => {
            await refreshDashboard();
        }, config.refreshInterval);
    }

    /**
     * Rafraîchir le dashboard
     */
    async function refreshDashboard() {
        try {
            // Afficher indicateur de chargement
            showLoadingIndicator();
            
            // Recharger données
            await loadDashboardData();
            
            // Mettre à jour tous les composants
            initializeKPICards();
            updateCharts();
            initializeEntityTable();
            initializeTimeline();
            initializeAlerts();
            
            // Cacher indicateur
            hideLoadingIndicator();
            
            // Animation de refresh
            animateRefresh();
            
        } catch (error) {
            console.error('Erreur refresh dashboard:', error);
            hideLoadingIndicator();
        }
    }

    /**
     * Mettre à jour les graphiques avec animation
     */
    function updateCharts() {
        // Revenue chart
        if (charts.revenue) {
            charts.revenue.updateSeries([{
                data: dashboardData.charts.revenueEvolution.data
            }]);
        }

        // Treasury chart
        if (charts.treasury) {
            charts.treasury.updateSeries(dashboardData.charts.treasuryByEntity.series);
        }

        // Projects chart
        if (charts.projects) {
            charts.projects.updateSeries([{
                data: dashboardData.charts.projectsPipeline.series
            }]);
        }

        // Cashflow chart
        if (charts.cashflow) {
            charts.cashflow.updateSeries([
                { data: dashboardData.charts.cashflow.income },
                { data: dashboardData.charts.cashflow.expenses },
                { data: dashboardData.charts.cashflow.balance }
            ]);
        }
    }

    /**
     * Event listeners
     */
    function setupEventListeners() {
        // Bouton refresh manuel
        const refreshBtn = document.getElementById('refresh-dashboard');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                refreshBtn.disabled = true;
                refreshBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Actualisation...';
                
                await refreshDashboard();
                
                refreshBtn.disabled = false;
                refreshBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4" /><path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" /></svg> Actualiser';
            });
        }

        // Export PDF
        const exportBtn = document.getElementById('export-pdf');
        if (exportBtn) {
            exportBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                await exportDashboardPDF();
            });
        }

        // Filtres période
        const periodFilters = document.querySelectorAll('[data-period]');
        periodFilters.forEach(filter => {
            filter.addEventListener('click', async (e) => {
                e.preventDefault();
                const period = e.target.dataset.period;
                await filterByPeriod(period);
            });
        });
    }

    /**
     * Helpers UI
     */
    function showLoadingIndicator() {
        const indicator = document.getElementById('loading-indicator');
        if (indicator) {
            indicator.style.display = 'block';
        }
    }

    function hideLoadingIndicator() {
        const indicator = document.getElementById('loading-indicator');
        if (indicator) {
            indicator.style.display = 'none';
        }
    }

    function animateRefresh() {
        document.querySelectorAll('.superadmin-card').forEach(card => {
            card.style.animation = 'pulse 0.5s ease-in-out';
            setTimeout(() => {
                card.style.animation = '';
            }, 500);
        });
    }

    function updateLastRefresh() {
        const element = document.getElementById('last-refresh');
        if (element) {
            element.textContent = new Date().toLocaleTimeString('fr-CH');
        }
    }

    /**
     * Utilitaires
     */
    function formatCurrency(amount, compact = false) {
        const formatter = new Intl.NumberFormat(config.locale, {
            style: 'currency',
            currency: config.currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
            notation: compact ? 'compact' : 'standard'
        });
        return formatter.format(amount);
    }

    function formatTimeAgo(timestamp) {
        const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
        
        if (seconds < 60) return 'À l\'instant';
        if (seconds < 3600) return `Il y a ${Math.floor(seconds / 60)} min`;
        if (seconds < 86400) return `Il y a ${Math.floor(seconds / 3600)}h`;
        return `Il y a ${Math.floor(seconds / 86400)}j`;
    }

    function animateValue(element, value) {
        const start = parseInt(element.textContent.replace(/[^0-9]/g, '')) || 0;
        const duration = 1000;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const current = Math.floor(start + (value - start) * progress);
            
            if (typeof value === 'number' && value > 1000) {
                element.textContent = formatCurrency(current);
            } else {
                element.textContent = current;
            }

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        requestAnimationFrame(update);
    }

    function getIcon(name, color = 'currentColor') {
        // Map des icônes Tabler
        const icons = {
            'video': '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M15 10l4.553 -2.276a1 1 0 0 1 1.447 .894v6.764a1 1 0 0 1 -1.447 .894l-4.553 -2.276v-4z" /><path d="M3 6m0 2a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2z" />',
            'code': '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M7 8l-4 4l4 4" /><path d="M17 8l4 4l-4 4" /><path d="M14 4l-4 16" />',
            'augmented-reality': '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 8v-2a2 2 0 0 1 2 -2h2" /><path d="M4 16v2a2 2 0 0 0 2 2h2" /><path d="M16 4h2a2 2 0 0 1 2 2v2" /><path d="M16 20h2a2 2 0 0 0 2 -2v-2" /><path d="M12 12.5l4 -2.5" /><path d="M8 10l4 2.5v4.5" /><path d="M8 10v4.5l4 2.5" />',
            'truck-delivery': '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M7 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" /><path d="M17 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" /><path d="M5 17h-2v-4m-1 -8h11v12m-4 0h6m4 0h2v-6h-8m0 -5h5l3 5" /><path d="M3 9l4 0" />',
            'brain': '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M15.5 13a3.5 3.5 0 0 0 -3.5 3.5v1a3.5 3.5 0 0 0 7 0v-1.8" /><path d="M8.5 13a3.5 3.5 0 0 1 3.5 3.5v1a3.5 3.5 0 0 1 -7 0v-1.8" /><path d="M17.5 16a3.5 3.5 0 0 0 0 -7h-.5" /><path d="M19 9.3v-2.8a3.5 3.5 0 0 0 -7 0" /><path d="M6.5 16a3.5 3.5 0 0 1 0 -7h.5" /><path d="M5 9.3v-2.8a3.5 3.5 0 0 1 7 0v10" />',
            'currency-franc': '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M17 5h-6a2 2 0 0 0 -2 2v12" /><path d="M7 15h4" /><path d="M9 11h7" />',
            'building-bank': '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 21l18 0" /><path d="M3 10l18 0" /><path d="M5 6l7 -3l7 3" /><path d="M4 10l0 11" /><path d="M20 10l0 11" /><path d="M8 14l0 3" /><path d="M12 14l0 3" /><path d="M16 14l0 3" />',
            'clipboard-list': '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2" /><path d="M9 3m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z" /><path d="M9 12l.01 0" /><path d="M13 12l2 0" /><path d="M9 16l.01 0" /><path d="M13 16l2 0" />',
            'file-invoice': '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" /><path d="M9 15l2 0" /><path d="M13 15l2 0" /><path d="M15 12l-2 0" /><path d="M12 12l0 3" />',
            'credit-card': '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 5m0 3a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3z" /><path d="M3 10l18 0" /><path d="M7 15l.01 0" /><path d="M11 15l2 0" />',
            'alert-triangle': '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 9v4" /><path d="M12 17h.01" /><path d="M5.07 19h13.86a2 2 0 0 0 1.75 -2.75l-6.93 -12a2 2 0 0 0 -3.5 0l-6.93 12a2 2 0 0 0 1.75 2.75" />',
            'clipboard-check': '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2" /><path d="M9 3m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z" /><path d="M9 14l2 2l4 -4" />',
            'receipt': '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 21v-16a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v16l-3 -2l-2 2l-2 -2l-2 2l-2 -2l-3 2" /><path d="M14 8h-2.5a1.5 1.5 0 0 0 0 3h1a1.5 1.5 0 0 1 0 3h-2.5m2 -7v10" />'
        };

        const svg = `<svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="${color}" fill="none">${icons[name] || ''}</svg>`;
        return svg;
    }

    function getChangeIndicator(current, target) {
        const percentage = ((current / target) * 100).toFixed(0);
        const color = percentage >= 100 ? 'success' : percentage >= 80 ? 'warning' : 'danger';
        return `<div class="small text-${color}">${percentage}% objectif</div>`;
    }

    function getMarginBadge(margin) {
        if (margin >= 40) return '<span class="badge bg-success-lt">Excellent</span>';
        if (margin >= 30) return '<span class="badge bg-azure-lt">Bon</span>';
        if (margin >= 20) return '<span class="badge bg-warning-lt">Moyen</span>';
        return '<span class="badge bg-danger-lt">Faible</span>';
    }

    function getTreasuryIndicator(amount) {
        if (amount >= 300000) return '<div class="text-success small">Saine</div>';
        if (amount >= 150000) return '<div class="text-warning small">Correcte</div>';
        return '<div class="text-danger small">Tendue</div>';
    }

    function getPerformanceBadge(performance) {
        const badges = {
            'excellent': '<span class="badge bg-success">Excellent</span>',
            'good': '<span class="badge bg-azure">Bon</span>',
            'average': '<span class="badge bg-warning">Moyen</span>',
            'poor': '<span class="badge bg-danger">Faible</span>',
            'startup': '<span class="badge bg-purple">Démarrage</span>'
        };
        return badges[performance] || badges.average;
    }

    function getGroupPerformance(totals) {
        const score = (totals.revenue / 500000) * 100;
        if (score >= 100) return '<span class="badge bg-success">Objectifs dépassés</span>';
        if (score >= 80) return '<span class="badge bg-azure">Sur la bonne voie</span>';
        if (score >= 60) return '<span class="badge bg-warning">Vigilance requise</span>';
        return '<span class="badge bg-danger">Action urgente</span>';
    }

    function getAlertIcon(type) {
        const icons = {
            'danger': '<svg xmlns="http://www.w3.org/2000/svg" class="icon alert-icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 9v4" /><path d="M12 17h.01" /><path d="M5.07 19h13.86a2 2 0 0 0 1.75 -2.75l-6.93 -12a2 2 0 0 0 -3.5 0l-6.93 12a2 2 0 0 0 1.75 2.75" /></svg>',
            'warning': '<svg xmlns="http://www.w3.org/2000/svg" class="icon alert-icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 9v4" /><path d="M12 17h.01" /><path d="M5.07 19h13.86a2 2 0 0 0 1.75 -2.75l-6.93 -12a2 2 0 0 0 -3.5 0l-6.93 12a2 2 0 0 0 1.75 2.75" /></svg>',
            'info': '<svg xmlns="http://www.w3.org/2000/svg" class="icon alert-icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" /><path d="M12 9h.01" /><path d="M11 12h1v4h1" /></svg>'
        };
        return icons[type] || icons.info;
    }

    function showError(message) {
        const alert = document.createElement('div');
        alert.className = 'alert alert-danger alert-dismissible';
        alert.innerHTML = `
            <div class="d-flex">
                <div>
                    ${getAlertIcon('danger')}
                </div>
                <div>
                    <h4 class="alert-title">Erreur</h4>
                    <div class="text-secondary">${message}</div>
                </div>
            </div>
            <a class="btn-close" data-bs-dismiss="alert" aria-label="close"></a>
        `;
        
        const container = document.getElementById('alerts-container');
        if (container) {
            container.prepend(alert);
        }
    }

    /**
     * Export PDF du dashboard
     */
    async function exportDashboardPDF() {
        try {
            // Ici, intégrer jsPDF ou similaire
            console.log('Export PDF en cours...');
            
            // Logger l'action
            await window.AuthSuperadmin.logAuditEvent('DASHBOARD_EXPORT', {
                format: 'PDF',
                timestamp: new Date().toISOString()
            });
            
            alert('Export PDF disponible dans la prochaine version');
        } catch (error) {
            console.error('Erreur export PDF:', error);
            showError('Erreur lors de l\'export PDF');
        }
    }

    /**
     * Générateurs de données mock
     */
    function generateRevenueEvolution() {
        const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
        const data = [];
        let base = 350000;
        
        for (let i = 0; i < 12; i++) {
            base += (Math.random() - 0.3) * 50000;
            data.push(Math.max(base, 250000));
        }
        
        return {
            categories: months,
            data: data
        };
    }

    function generateTreasuryData() {
        return {
            labels: config.entities.map(e => e.name),
            series: [320000, 235000, 187000, 98000, 52000]
        };
    }

    function generateProjectsData() {
        return {
            categories: ['En cours', 'En validation', 'En attente', 'Planifiés', 'Terminés'],
            series: [18, 12, 8, 15, 22]
        };
    }

    function generateCashflowData() {
        const categories = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'];
        const income = [380000, 420000, 395000, 445000, 470000, 485000];
        const expenses = [320000, 340000, 360000, 350000, 380000, 375000];
        const balance = [];
        
        let cumul = 500000;
        for (let i = 0; i < income.length; i++) {
            cumul += income[i] - expenses[i];
            balance.push(cumul);
        }
        
        return { categories, income, expenses, balance };
    }

    function generateTimelineEvents() {
        return [
            {
                icon: 'file-invoice',
                title: 'Nouvelle facture',
                description: 'Facture HYP-2025-0042 créée pour Rolex SA',
                amount: 85000,
                color: 'blue',
                timestamp: new Date(Date.now() - 15 * 60000)
            },
            {
                icon: 'credit-card',
                title: 'Paiement reçu',
                description: 'Virement de Nestlé SA pour projet Dainamics',
                amount: 125000,
                color: 'green',
                timestamp: new Date(Date.now() - 45 * 60000)
            },
            {
                icon: 'alert-triangle',
                title: 'Facture en retard',
                description: 'Relance envoyée à StartupXYZ (15 jours)',
                amount: 12500,
                color: 'orange',
                timestamp: new Date(Date.now() - 2 * 3600000)
            },
            {
                icon: 'clipboard-check',
                title: 'Projet terminé',
                description: 'Campagne AR pour Omega - Enki Reality',
                color: 'purple',
                timestamp: new Date(Date.now() - 5 * 3600000)
            },
            {
                icon: 'receipt',
                title: 'Note de frais',
                description: 'Paul Martin - Déplacement client Zurich',
                amount: 450,
                color: 'gray',
                timestamp: new Date(Date.now() - 24 * 3600000)
            }
        ];
    }

    function generateAlerts() {
        return [
            {
                type: 'danger',
                priority: 'high',
                title: 'Trésorerie critique',
                message: 'Le compte Takeout est sous le seuil d\'alerte (< 100k CHF)'
            },
            {
                type: 'warning',
                priority: 'high',
                title: '5 factures en retard',
                message: 'Montant total : 142\'000 CHF - Action de recouvrement requise'
            }
        ];
    }

    // API publique
    return {
        init,
        refresh: refreshDashboard,
        exportPDF: exportDashboardPDF
    };

})();

// Initialiser au chargement
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('/superadmin/dashboard.html')) {
        window.DashboardSuperadmin.init();
    }
});