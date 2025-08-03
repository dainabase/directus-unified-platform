/**
 * CRM SuperAdmin Module
 * Gestion centralisée du CRM multi-entités avec connexion Notion
 */

window.CRMSuperadmin = (function() {
    'use strict';

    // Configuration des bases de données Notion
    const databases = {
        companies: 'DB-CONTACTS-ENTREPRISES',
        contacts: 'DB-CONTACTS-PERSONNES', 
        pipeline: 'DB-SALES-PIPELINE',
        entities: 'DB-ENTITÉ DU GROUPE'
    };

    // Vues spécifiques SUPERADMIN
    const views = {
        companies: '🔴 SUPERADMIN - Entreprises Consolidées',
        contacts: '🔴 SUPERADMIN - Contacts Stratégiques',
        pipeline: '🔴 SUPERADMIN - Pipeline Global',
        entities: '🔴 SUPERADMIN - Performance Entités'
    };

    // Cache des données
    let cache = {
        companies: null,
        contacts: null,
        pipeline: null,
        entities: null,
        lastUpdate: null
    };

    // Configuration des entités
    const entityConfig = {
        'Hypervisual': { color: '#206bc4', icon: 'video' },
        'Dainamics': { color: '#2fb344', icon: 'robot' },
        'Enki Reality': { color: '#f59f00', icon: 'augmented-reality' },
        'Takeout': { color: '#d63031', icon: 'shopping-cart' },
        'Lexaia': { color: '#6f42c1', icon: 'brain' }
    };

    // Charts instances
    let charts = {
        pipelineEntities: null,
        pipelineStages: null
    };

    /**
     * Initialize module
     */
    async function init() {
        console.log('🚀 CRM SuperAdmin module initializing...');
        
        // Verify permissions
        const hasPermission = await PermissionsSuperadmin.checkPermission('superadmin.crm.view');
        if (!hasPermission) {
            console.error('❌ Missing permission: superadmin.crm.view');
            return false;
        }

        // Initialize event listeners
        initializeEventListeners();
        
        return true;
    }

    /**
     * Load dashboard data from Notion
     */
    async function loadDashboard() {
        try {
            showLoading(true);
            
            // Load all data in parallel
            const [companies, contacts, pipeline, entities] = await Promise.all([
                loadCompanies(),
                loadContacts(),
                loadPipeline(),
                loadEntities()
            ]);

            // Update cache
            cache = {
                companies,
                contacts,
                pipeline,
                entities,
                lastUpdate: new Date()
            };

            // Update UI
            updateKPIs();
            updateCharts();
            updateTopCompanies();
            updateAlerts();

            showLoading(false);
            showToast('Dashboard actualisé', 'success');

        } catch (error) {
            console.error('Error loading dashboard:', error);
            showToast('Erreur lors du chargement', 'error');
            showLoading(false);
        }
    }

    /**
     * Load companies from Notion
     */
    async function loadCompanies() {
        try {
            const response = await NotionConnector.queryDatabase(databases.companies, {
                filter: {
                    and: [
                        {
                            property: 'Status',
                            select: {
                                equals: 'Client'
                            }
                        }
                    ]
                },
                sorts: [{
                    property: 'Score Client',
                    direction: 'descending'
                }]
            });

            return response.results.map(page => ({
                id: page.id,
                name: page.properties['Nom Entreprise']?.title?.[0]?.text?.content || '',
                entity: page.properties['Entité du Groupe']?.select?.name || '',
                score: page.properties['Score Client']?.number || 0,
                revenue: page.properties['CA Estimé']?.number || 0,
                status: page.properties['Status']?.select?.name || '',
                notes: page.properties['Notes SUPERADMIN']?.rich_text?.[0]?.text?.content || ''
            }));

        } catch (error) {
            console.error('Error loading companies:', error);
            return [];
        }
    }

    /**
     * Load contacts from Notion
     */
    async function loadContacts() {
        try {
            const response = await NotionConnector.queryDatabase(databases.contacts, {
                filter: {
                    property: 'Tags',
                    multi_select: {
                        contains: 'VIP'
                    }
                },
                sorts: [{
                    property: 'Score Engagement',
                    direction: 'descending'
                }]
            });

            return response.results.map(page => ({
                id: page.id,
                firstName: page.properties['Prénom']?.rich_text?.[0]?.text?.content || '',
                lastName: page.properties['Nom']?.title?.[0]?.text?.content || '',
                company: page.properties['Entreprise']?.relation?.[0]?.id || null,
                tags: page.properties['Tags']?.multi_select || [],
                score: page.properties['Score Engagement']?.number || 0,
                influence: page.properties['Niveau Influence']?.select?.name || '',
                lastInteraction: page.properties['Date Dernière Interaction']?.date?.start || null
            }));

        } catch (error) {
            console.error('Error loading contacts:', error);
            return [];
        }
    }

    /**
     * Load pipeline from Notion
     */
    async function loadPipeline() {
        try {
            const response = await NotionConnector.queryDatabase(databases.pipeline, {
                filter: {
                    property: 'Étape',
                    select: {
                        does_not_equal: 'Perdu'
                    }
                },
                sorts: [{
                    property: 'Montant',
                    direction: 'descending'
                }]
            });

            return response.results.map(page => ({
                id: page.id,
                title: page.properties['Titre']?.title?.[0]?.text?.content || '',
                amount: page.properties['Montant']?.number || 0,
                probability: page.properties['Probabilité']?.number || 0,
                weightedAmount: page.properties['Montant pondéré']?.formula?.number || 0,
                entity: page.properties['Entité']?.select?.name || '',
                stage: page.properties['Étape']?.select?.name || '',
                closeDate: page.properties['Date clôture']?.date?.start || null,
                company: page.properties['Entreprise']?.relation?.[0]?.id || null
            }));

        } catch (error) {
            console.error('Error loading pipeline:', error);
            return [];
        }
    }

    /**
     * Load entities performance from Notion
     */
    async function loadEntities() {
        try {
            const response = await NotionConnector.queryDatabase(databases.entities, {
                sorts: [{
                    property: 'CA Mensuel',
                    direction: 'descending'
                }]
            });

            return response.results.map(page => ({
                id: page.id,
                name: page.properties['Nom']?.title?.[0]?.text?.content || '',
                monthlyRevenue: page.properties['CA Mensuel']?.number || 0,
                yearlyRevenue: page.properties['CA Annuel']?.number || 0,
                activeProjects: page.properties['Projets Actifs']?.number || 0,
                employees: page.properties['Effectif']?.number || 0
            }));

        } catch (error) {
            console.error('Error loading entities:', error);
            return [];
        }
    }

    /**
     * Update KPIs
     */
    function updateKPIs() {
        // CA Total Groupe
        const totalRevenue = cache.companies.reduce((sum, c) => sum + c.revenue, 0);
        document.getElementById('kpi-revenue').textContent = formatCurrency(totalRevenue);
        document.getElementById('kpi-revenue-growth').textContent = '+15.2%'; // Mock data

        // Entreprises Actives
        const activeCompanies = cache.companies.filter(c => c.status === 'Client').length;
        document.getElementById('kpi-companies').textContent = activeCompanies;
        document.getElementById('kpi-companies-new').textContent = '12'; // Mock data
        
        const avgScore = cache.companies.reduce((sum, c) => sum + c.score, 0) / cache.companies.length;
        document.getElementById('kpi-companies-score').textContent = Math.round(avgScore);

        // Pipeline Total
        const totalPipeline = cache.pipeline.reduce((sum, p) => sum + p.amount, 0);
        document.getElementById('kpi-pipeline').textContent = formatCurrency(totalPipeline);
        document.getElementById('kpi-pipeline-count').textContent = cache.pipeline.length;

        // Taux Conversion
        const wonDeals = 42; // Mock data - would come from closed deals
        const totalDeals = cache.pipeline.length + wonDeals;
        const conversionRate = (wonDeals / totalDeals * 100).toFixed(1);
        document.getElementById('kpi-conversion').textContent = conversionRate + '%';
        document.getElementById('kpi-conversion-trend').textContent = '+2.3%'; // Mock data
        document.getElementById('kpi-conversion-days').textContent = '45'; // Mock data
    }

    /**
     * Update charts
     */
    function updateCharts() {
        // Pipeline by entity chart
        const pipelineByEntity = {};
        cache.pipeline.forEach(deal => {
            if (!pipelineByEntity[deal.entity]) {
                pipelineByEntity[deal.entity] = {
                    total: 0,
                    weighted: 0,
                    count: 0
                };
            }
            pipelineByEntity[deal.entity].total += deal.amount;
            pipelineByEntity[deal.entity].weighted += deal.weightedAmount;
            pipelineByEntity[deal.entity].count += 1;
        });

        const chartData = {
            series: [{
                name: 'Pipeline',
                data: Object.values(pipelineByEntity).map(e => e.total)
            }, {
                name: 'Pondéré',
                data: Object.values(pipelineByEntity).map(e => e.weighted)
            }],
            categories: Object.keys(pipelineByEntity)
        };

        renderPipelineChart(chartData);

        // Pipeline by stage chart
        const pipelineByStage = {};
        cache.pipeline.forEach(deal => {
            if (!pipelineByStage[deal.stage]) {
                pipelineByStage[deal.stage] = 0;
            }
            pipelineByStage[deal.stage] += deal.amount;
        });

        renderStageChart(pipelineByStage);
    }

    /**
     * Render pipeline chart
     */
    function renderPipelineChart(data) {
        const options = {
            series: data.series,
            chart: {
                type: 'bar',
                height: 300,
                toolbar: {
                    show: false
                }
            },
            plotOptions: {
                bar: {
                    horizontal: false,
                    columnWidth: '55%',
                    endingShape: 'rounded'
                },
            },
            dataLabels: {
                enabled: false
            },
            stroke: {
                show: true,
                width: 2,
                colors: ['transparent']
            },
            xaxis: {
                categories: data.categories,
            },
            yaxis: {
                labels: {
                    formatter: function (val) {
                        return formatCurrency(val, true);
                    }
                }
            },
            fill: {
                opacity: 1
            },
            tooltip: {
                y: {
                    formatter: function (val) {
                        return formatCurrency(val);
                    }
                }
            },
            colors: ['#206bc4', '#2fb344']
        };

        if (charts.pipelineEntities) {
            charts.pipelineEntities.destroy();
        }
        charts.pipelineEntities = new ApexCharts(document.querySelector("#chart-pipeline-entities"), options);
        charts.pipelineEntities.render();
    }

    /**
     * Render stage chart
     */
    function renderStageChart(data) {
        const options = {
            series: Object.values(data),
            chart: {
                type: 'donut',
                height: 300
            },
            labels: Object.keys(data),
            colors: ['#206bc4', '#2fb344', '#f59f00', '#d63031', '#6f42c1'],
            dataLabels: {
                enabled: true,
                formatter: function (val, opts) {
                    return opts.w.globals.labels[opts.seriesIndex] + '\n' + val.toFixed(0) + '%';
                }
            },
            legend: {
                position: 'bottom'
            },
            tooltip: {
                y: {
                    formatter: function (val) {
                        return formatCurrency(val);
                    }
                }
            }
        };

        if (charts.pipelineStages) {
            charts.pipelineStages.destroy();
        }
        charts.pipelineStages = new ApexCharts(document.querySelector("#chart-pipeline-stages"), options);
        charts.pipelineStages.render();
    }

    /**
     * Update top companies table
     */
    function updateTopCompanies() {
        const topCompanies = cache.companies
            .filter(c => c.status === 'Client')
            .slice(0, 10);

        const tbody = document.getElementById('top-companies-table');
        tbody.innerHTML = '';

        topCompanies.forEach(company => {
            const pipeline = cache.pipeline
                .filter(p => p.company === company.id)
                .reduce((sum, p) => sum + p.amount, 0);

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div class="font-weight-medium">${company.name}</div>
                </td>
                <td>
                    <span class="badge entity-${company.entity.toLowerCase().replace(' ', '')}">${company.entity}</span>
                </td>
                <td>
                    <div class="score-badge score-${getScoreLevel(company.score)}">${company.score}</div>
                </td>
                <td class="text-end">${formatCurrency(company.revenue)}</td>
                <td class="text-end">${formatCurrency(pipeline)}</td>
                <td>
                    <a href="companies.html#${company.id}" class="btn btn-ghost-secondary btn-sm">
                        <i class="ti ti-eye"></i>
                    </a>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    /**
     * Update alerts
     */
    function updateAlerts() {
        const alerts = [];

        // Check for opportunities closing soon
        const soon = new Date();
        soon.setDate(soon.getDate() + 7);
        
        cache.pipeline.forEach(deal => {
            if (deal.closeDate && new Date(deal.closeDate) <= soon) {
                alerts.push({
                    type: 'opportunity',
                    severity: 'high',
                    title: `Opportunité à clôturer`,
                    message: `${deal.title} - ${formatCurrency(deal.amount)}`,
                    link: `pipeline.html#${deal.id}`
                });
            }
        });

        // Check for contacts without recent interaction
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const vipContacts = cache.contacts.filter(c => 
            c.tags.some(t => t.name === 'VIP') &&
            (!c.lastInteraction || new Date(c.lastInteraction) < thirtyDaysAgo)
        );

        vipContacts.slice(0, 3).forEach(contact => {
            alerts.push({
                type: 'contact',
                severity: 'medium',
                title: 'Contact VIP inactif',
                message: `${contact.firstName} ${contact.lastName} - Pas d'interaction depuis 30j`,
                link: `contacts.html#${contact.id}`
            });
        });

        // Update alerts UI
        document.getElementById('alerts-count').textContent = alerts.length;
        
        const alertsList = document.getElementById('alerts-list');
        alertsList.innerHTML = '';
        
        alerts.forEach(alert => {
            const item = document.createElement('a');
            item.href = alert.link;
            item.className = 'list-group-item list-group-item-action alert-item';
            item.innerHTML = `
                <div class="d-flex align-items-center">
                    <i class="ti ti-${alert.type === 'opportunity' ? 'chart-line' : 'user'} text-red me-2"></i>
                    <div class="flex-fill">
                        <div class="font-weight-medium">${alert.title}</div>
                        <div class="text-secondary small">${alert.message}</div>
                    </div>
                </div>
            `;
            alertsList.appendChild(item);
        });
    }

    /**
     * Helper functions
     */
    function formatCurrency(amount, short = false) {
        if (short && amount >= 1000000) {
            return 'CHF ' + (amount / 1000000).toFixed(1) + 'M';
        }
        return 'CHF ' + amount.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, "'");
    }

    function getScoreLevel(score) {
        if (score >= 80) return 'high';
        if (score >= 50) return 'medium';
        return 'low';
    }

    function showLoading(show) {
        // Implementation depends on UI framework
        if (show) {
            document.querySelectorAll('.card').forEach(card => {
                card.classList.add('card-loading');
            });
        } else {
            document.querySelectorAll('.card').forEach(card => {
                card.classList.remove('card-loading');
            });
        }
    }

    function showToast(message, type = 'info') {
        // Simple toast notification
        console.log(`[${type.toUpperCase()}] ${message}`);
    }

    function initializeEventListeners() {
        // Add any specific event listeners here
    }

    /**
     * Public methods
     */
    return {
        init,
        loadDashboard,
        refreshDashboard: loadDashboard,
        exportDashboard: async function() {
            // Export functionality
            const data = {
                exportDate: new Date().toISOString(),
                kpis: {
                    totalRevenue: cache.companies.reduce((sum, c) => sum + c.revenue, 0),
                    activeCompanies: cache.companies.filter(c => c.status === 'Client').length,
                    totalPipeline: cache.pipeline.reduce((sum, p) => sum + p.amount, 0),
                    opportunities: cache.pipeline.length
                },
                companies: cache.companies,
                pipeline: cache.pipeline
            };

            // Convert to CSV or download JSON
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `crm-dashboard-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
        },
        switchChartView: function(view) {
            // Switch between different chart views
            updateCharts(); // Re-render with new view
        }
    };
})();