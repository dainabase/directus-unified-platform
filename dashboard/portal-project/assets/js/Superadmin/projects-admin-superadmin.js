/**
 * Projects Admin SuperAdmin - Gestionnaire des projets multi-entités
 * Utilise la vraie structure Notion récupérée via MCP
 */

window.ProjectsAdminSuperAdmin = (function() {
    'use strict';

    // Configuration de la base de données projets
    const DB_PROJECTS_ID = '226adb95-3c6f-806e-9e61-e263baf7af69';
    
    // État global
    let allProjects = [];
    let filteredProjects = [];
    let currentView = 'list';
    let dataTable = null;
    let ganttChart = null;
    let budgetChart = null;
    let budgetPieChart = null;

    // Mappage des propriétés Notion (structure réelle)
    const NOTION_PROPERTY_MAP = {
        'Nom du Projet': 'title',
        'Client': 'client',
        'Entité du Groupe': 'entity',
        'Équipe Projet': 'team',
        'Statut Projet': 'status',
        'Health Score': 'healthScore',
        'Priorité': 'priority',
        'Budget': 'budget',
        'Montant Facturé': 'invoicedAmount',
        'Marge Estimée %': 'estimatedMargin',
        'Date Début': 'startDate',
        'Date Fin Prévue': 'endDate',
        '% Avancement': 'progress',
        'Description/Notes': 'description',
        'Tâches (Rollup)': 'tasksCount',
        'Tâches Terminées (Rollup)': 'completedTasks',
        'Heures Totales (Rollup)': 'totalHours',
        'Heures Facturables (Rollup)': 'billableHours',
        'Devis & Factures': 'quotesInvoices'
    };

    // Entités du groupe avec couleurs
    const ENTITIES = {
        'Hypervisual': { color: '#3b82f6', bg: 'bg-primary' },
        'Dainamics': { color: '#06b6d4', bg: 'bg-info' },
        'Enki Reality': { color: '#10b981', bg: 'bg-success' },
        'Take Out': { color: '#f59e0b', bg: 'bg-warning' },
        'Lexaia': { color: '#ef4444', bg: 'bg-danger' }
    };

    // Statuts de projets avec couleurs
    const PROJECT_STATUSES = {
        'En planification': { color: '#6b7280', icon: '📋' },
        'En cours': { color: '#3b82f6', icon: '🚀' },
        'En révision': { color: '#f59e0b', icon: '🔍' },
        'Terminé': { color: '#10b981', icon: '✅' },
        'En pause': { color: '#f97316', icon: '⏸️' },
        'Annulé': { color: '#ef4444', icon: '❌' }
    };

    /**
     * Initialisation du module
     */
    function init() {
        console.log('🚀 Initialisation ProjectsAdminSuperAdmin...');
        
        initEventListeners();
        showLoadingOverlay();
        loadProjectsData();
    }

    /**
     * Configuration des event listeners
     */
    function initEventListeners() {
        // Onglets de vues
        document.querySelectorAll('.view-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                switchView(e.target.closest('.view-tab').dataset.view);
            });
        });

        // Filtres entités
        document.querySelectorAll('.entity-filter-badge').forEach(badge => {
            badge.addEventListener('click', (e) => {
                toggleEntityFilter(e.target);
            });
        });

        // Filtres dropdowns
        document.getElementById('filter-status').addEventListener('change', applyFilters);
        document.getElementById('filter-priority').addEventListener('change', applyFilters);
        document.getElementById('filter-health').addEventListener('change', applyFilters);
        document.getElementById('search-projects').addEventListener('input', debounce(applyFilters, 300));

        // Boutons actions
        document.getElementById('btn-refresh-data').addEventListener('click', refreshData);
        document.getElementById('export-excel').addEventListener('click', () => exportData('excel'));
        document.getElementById('export-csv').addEventListener('click', () => exportData('csv'));
        document.getElementById('export-pdf').addEventListener('click', () => exportData('pdf'));
    }

    /**
     * Chargement des données depuis Notion
     */
    async function loadProjectsData() {
        try {
            console.log('📊 Chargement des projets depuis Notion...');

            // Utiliser le wrapper MCP Notion
            const response = await window.MCPNotionWrapper.queryDatabase(DB_PROJECTS_ID, {
                filter: {
                    property: 'Statut Projet',
                    select: {
                        does_not_equal: 'Archivé'
                    }
                },
                sorts: [
                    {
                        property: 'Date Début',
                        direction: 'descending'
                    }
                ]
            });

            if (response.success) {
                allProjects = response.data.map(transformNotionProject);
                console.log(`✅ ${allProjects.length} projets chargés`);
            } else {
                console.warn('⚠️ Erreur MCP, utilisation données mock');
                allProjects = generateMockProjects();
            }

            // Initialiser les vues
            filteredProjects = [...allProjects];
            updateQuickStats();
            updateCurrentView();
            hideLoadingOverlay();

        } catch (error) {
            console.error('❌ Erreur chargement projets:', error);
            allProjects = generateMockProjects();
            filteredProjects = [...allProjects];
            updateQuickStats();
            updateCurrentView();
            hideLoadingOverlay();
        }
    }

    /**
     * Transformation d'un projet Notion en format interne
     */
    function transformNotionProject(notionPage) {
        const props = notionPage.properties;
        
        return {
            id: notionPage.id,
            title: getNotionPropertyValue(props['Nom du Projet'], 'title'),
            client: getNotionPropertyValue(props['Client'], 'relation'),
            entity: getNotionPropertyValue(props['Entité du Groupe'], 'select'),
            team: getNotionPropertyValue(props['Équipe Projet'], 'relation'),
            status: getNotionPropertyValue(props['Statut Projet'], 'select'),
            healthScore: getNotionPropertyValue(props['Health Score'], 'number') || 75,
            priority: getNotionPropertyValue(props['Priorité'], 'select'),
            budget: getNotionPropertyValue(props['Budget'], 'number') || 0,
            invoicedAmount: getNotionPropertyValue(props['Montant Facturé'], 'rollup') || 0,
            estimatedMargin: getNotionPropertyValue(props['Marge Estimée %'], 'formula') || 0,
            startDate: getNotionPropertyValue(props['Date Début'], 'date'),
            endDate: getNotionPropertyValue(props['Date Fin Prévue'], 'date'),
            progress: getNotionPropertyValue(props['% Avancement'], 'number') || 0,
            description: getNotionPropertyValue(props['Description/Notes'], 'rich_text'),
            tasksCount: getNotionPropertyValue(props['Tâches (Rollup)'], 'rollup') || 0,
            completedTasks: getNotionPropertyValue(props['Tâches Terminées (Rollup)'], 'rollup') || 0,
            totalHours: getNotionPropertyValue(props['Heures Totales (Rollup)'], 'rollup') || 0,
            billableHours: getNotionPropertyValue(props['Heures Facturables (Rollup)'], 'rollup') || 0,
            quotesInvoices: getNotionPropertyValue(props['Devis & Factures'], 'relation'),
            lastUpdated: notionPage.last_edited_time
        };
    }

    /**
     * Extraction de valeur depuis une propriété Notion
     */
    function getNotionPropertyValue(property, type) {
        if (!property) return null;

        switch (type) {
            case 'title':
                return property.title?.[0]?.plain_text || '';
            case 'rich_text':
                return property.rich_text?.[0]?.plain_text || '';
            case 'select':
                return property.select?.name || '';
            case 'multi_select':
                return property.multi_select?.map(s => s.name) || [];
            case 'relation':
                return property.relation?.length || 0;
            case 'number':
                return property.number || 0;
            case 'date':
                return property.date?.start || null;
            case 'rollup':
                return property.rollup?.number || property.rollup?.array?.length || 0;
            case 'formula':
                return property.formula?.number || 0;
            default:
                return property;
        }
    }

    /**
     * Génération de données mock pour démonstration
     */
    function generateMockProjects() {
        return [
            {
                id: 'proj-001',
                title: 'Site Web Corporate Rolex',
                client: 'Rolex SA',
                entity: 'Hypervisual',
                team: 5,
                status: 'En cours',
                healthScore: 85,
                priority: 'Élevée',
                budget: 150000,
                invoicedAmount: 90000,
                estimatedMargin: 25,
                startDate: '2024-01-15',
                endDate: '2024-04-30',
                progress: 65,
                description: 'Refonte complète du site web corporate avec focus sur l\'expérience utilisateur',
                tasksCount: 24,
                completedTasks: 16,
                totalHours: 420,
                billableHours: 380,
                quotesInvoices: 3
            },
            {
                id: 'proj-002',
                title: 'App Mobile Nestlé Nutrition',
                client: 'Nestlé SA',
                entity: 'Dainamics',
                team: 8,
                status: 'En cours',
                healthScore: 92,
                priority: 'Critique',
                budget: 280000,
                invoicedAmount: 180000,
                estimatedMargin: 30,
                startDate: '2023-11-01',
                endDate: '2024-06-15',
                progress: 78,
                description: 'Application mobile de suivi nutritionnel avec IA intégrée',
                tasksCount: 45,
                completedTasks: 35,
                totalHours: 890,
                billableHours: 820,
                quotesInvoices: 5
            },
            {
                id: 'proj-003',
                title: 'Plateforme VR Swiss Tourism',
                client: 'Suisse Tourisme',
                entity: 'Enki Reality',
                team: 6,
                status: 'En planification',
                healthScore: 68,
                priority: 'Normale',
                budget: 195000,
                invoicedAmount: 0,
                estimatedMargin: 22,
                startDate: '2024-03-01',
                endDate: '2024-09-30',
                progress: 15,
                description: 'Expérience VR immersive pour la promotion touristique',
                tasksCount: 32,
                completedTasks: 5,
                totalHours: 120,
                billableHours: 95,
                quotesInvoices: 1
            },
            {
                id: 'proj-004',
                title: 'E-commerce Luxury Watches',
                client: 'Bucherer AG',
                entity: 'Take Out',
                team: 4,
                status: 'En révision',
                healthScore: 73,
                priority: 'Élevée',
                budget: 120000,
                invoicedAmount: 85000,
                estimatedMargin: 28,
                startDate: '2024-02-01',
                endDate: '2024-05-31',
                progress: 85,
                description: 'Plateforme e-commerce haut de gamme pour montres de luxe',
                tasksCount: 28,
                completedTasks: 24,
                totalHours: 520,
                billableHours: 480,
                quotesInvoices: 4
            },
            {
                id: 'proj-005',
                title: 'Solution IA UBS Trading',
                client: 'UBS AG',
                entity: 'Lexaia',
                team: 10,
                status: 'En cours',
                healthScore: 58,
                priority: 'Critique',
                budget: 450000,
                invoicedAmount: 220000,
                estimatedMargin: 18,
                startDate: '2023-09-15',
                endDate: '2024-12-31',
                progress: 42,
                description: 'Système de trading algorithmique avec IA prédictive',
                tasksCount: 67,
                completedTasks: 28,
                totalHours: 1240,
                billableHours: 1150,
                quotesInvoices: 6
            },
            {
                id: 'proj-006',
                title: 'Dashboard Analytics ABB',
                client: 'ABB Ltd',
                entity: 'Hypervisual',
                team: 3,
                status: 'Terminé',
                healthScore: 95,
                priority: 'Normale',
                budget: 75000,
                invoicedAmount: 75000,
                estimatedMargin: 35,
                startDate: '2023-10-01',
                endDate: '2024-01-15',
                progress: 100,
                description: 'Dashboard analytique pour optimisation industrielle',
                tasksCount: 18,
                completedTasks: 18,
                totalHours: 285,
                billableHours: 285,
                quotesInvoices: 2
            }
        ];
    }

    /**
     * Mise à jour des statistiques rapides
     */
    function updateQuickStats() {
        const totalProjects = filteredProjects.length;
        const totalBudget = filteredProjects.reduce((sum, p) => sum + (p.budget || 0), 0);
        const avgProgress = Math.round(filteredProjects.reduce((sum, p) => sum + (p.progress || 0), 0) / totalProjects);
        const atRiskProjects = filteredProjects.filter(p => p.healthScore < 70).length;

        document.getElementById('total-projects').textContent = totalProjects;
        document.getElementById('total-budget').textContent = formatSwissAmount(totalBudget);
        document.getElementById('avg-progress').textContent = `${avgProgress}%`;
        document.getElementById('at-risk-projects').textContent = atRiskProjects;
    }

    /**
     * Application des filtres
     */
    function applyFilters() {
        const statusFilter = document.getElementById('filter-status').value;
        const priorityFilter = document.getElementById('filter-priority').value;
        const healthFilter = document.getElementById('filter-health').value;
        const searchTerm = document.getElementById('search-projects').value.toLowerCase();
        
        // Récupérer entités actives
        const activeEntities = Array.from(document.querySelectorAll('.entity-filter-badge.active'))
            .map(badge => badge.dataset.entity);
        
        filteredProjects = allProjects.filter(project => {
            // Filtre entité
            if (!activeEntities.includes('all') && !activeEntities.includes(project.entity.toLowerCase())) {
                return false;
            }
            
            // Filtre statut
            if (statusFilter && project.status !== statusFilter) {
                return false;
            }
            
            // Filtre priorité
            if (priorityFilter && project.priority !== priorityFilter) {
                return false;
            }
            
            // Filtre health score
            if (healthFilter) {
                const [min, max] = healthFilter.split('-').map(Number);
                if (project.healthScore < min || project.healthScore > max) {
                    return false;
                }
            }
            
            // Recherche textuelle
            if (searchTerm) {
                const searchableText = `${project.title} ${project.client} ${project.entity}`.toLowerCase();
                if (!searchableText.includes(searchTerm)) {
                    return false;
                }
            }
            
            return true;
        });

        updateQuickStats();
        updateCurrentView();
    }

    /**
     * Basculement entre entités
     */
    function toggleEntityFilter(badge) {
        const entity = badge.dataset.entity;
        
        if (entity === 'all') {
            // Désactiver tous sauf "Toutes"
            document.querySelectorAll('.entity-filter-badge').forEach(b => b.classList.remove('active'));
            badge.classList.add('active');
        } else {
            // Désactiver "Toutes"
            document.querySelector('.entity-filter-badge[data-entity="all"]').classList.remove('active');
            
            // Basculer l'entité
            badge.classList.toggle('active');
            
            // Si aucune entité active, réactiver "Toutes"
            const activeEntities = document.querySelectorAll('.entity-filter-badge.active:not([data-entity="all"])');
            if (activeEntities.length === 0) {
                document.querySelector('.entity-filter-badge[data-entity="all"]').classList.add('active');
            }
        }
        
        applyFilters();
    }

    /**
     * Changement de vue
     */
    function switchView(viewName) {
        // Mettre à jour onglets
        document.querySelectorAll('.view-tab').forEach(tab => tab.classList.remove('active'));
        document.querySelector(`[data-view="${viewName}"]`).classList.add('active');
        
        // Masquer toutes les vues
        document.querySelectorAll('.view-content').forEach(view => view.style.display = 'none');
        
        // Afficher la vue sélectionnée
        document.getElementById(`view-${viewName}`).style.display = 'block';
        
        currentView = viewName;
        updateCurrentView();
    }

    /**
     * Mise à jour de la vue actuelle
     */
    function updateCurrentView() {
        switch (currentView) {
            case 'list':
                updateListView();
                break;
            case 'kanban':
                updateKanbanView();
                break;
            case 'gantt':
                updateGanttView();
                break;
            case 'resources':
                updateResourcesView();
                break;
            case 'budget':
                updateBudgetView();
                break;
        }
    }

    /**
     * Vue Liste avec DataTable
     */
    function updateListView() {
        const tbody = document.getElementById('projects-list-body');
        
        tbody.innerHTML = filteredProjects.map(project => `
            <tr>
                <td>
                    <div class="d-flex align-items-center">
                        <div>
                            <div class="font-weight-medium">${project.title}</div>
                            <div class="text-muted small">${project.description?.substring(0, 50)}...</div>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="font-weight-medium">${project.client}</div>
                    <div class="text-muted small">${project.team} membres équipe</div>
                </td>
                <td>
                    <span class="badge ${ENTITIES[project.entity]?.bg || 'bg-secondary'}">${project.entity}</span>
                </td>
                <td>
                    <span class="badge" style="background-color: ${PROJECT_STATUSES[project.status]?.color}; color: white;">
                        ${PROJECT_STATUSES[project.status]?.icon} ${project.status}
                    </span>
                </td>
                <td>
                    <div class="d-flex align-items-center">
                        <div class="progress progress-bar-custom flex-fill me-2">
                            <div class="progress-bar" style="width: ${project.progress}%"></div>
                        </div>
                        <span class="text-muted small">${project.progress}%</span>
                    </div>
                </td>
                <td>
                    <span class="badge ${getHealthScoreClass(project.healthScore)}">${project.healthScore}</span>
                </td>
                <td>
                    <div class="font-weight-medium">${formatSwissAmount(project.budget)}</div>
                    <div class="text-muted small">Facturé: ${formatSwissAmount(project.invoicedAmount)}</div>
                </td>
                <td>
                    <div class="small">
                        <div>Début: ${formatDate(project.startDate)}</div>
                        <div>Fin: ${formatDate(project.endDate)}</div>
                    </div>
                </td>
                <td>
                    <div class="btn-list flex-nowrap">
                        <button class="btn btn-sm btn-outline-primary" onclick="ProjectsAdminSuperAdmin.viewProjectDetails('${project.id}')">
                            <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                <path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0"/>
                                <path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6"/>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        // Initialiser ou mettre à jour DataTable
        if (dataTable) {
            dataTable.destroy();
        }
        
        dataTable = new DataTable('#projects-table', {
            pageLength: 25,
            order: [[0, 'asc']],
            columnDefs: [
                { orderable: false, targets: -1 } // Pas de tri sur colonne actions
            ],
            language: {
                url: 'https://cdn.datatables.net/plug-ins/1.13.4/i18n/fr-FR.json'
            }
        });
    }

    /**
     * Vue Kanban avec drag & drop
     */
    function updateKanbanView() {
        const kanbanBoard = document.getElementById('kanban-board');
        const statuses = Object.keys(PROJECT_STATUSES);
        
        kanbanBoard.innerHTML = statuses.map(status => {
            const statusProjects = filteredProjects.filter(p => p.status === status);
            
            return `
                <div class="col-lg-2 col-md-4 col-sm-6 mb-3">
                    <div class="kanban-column">
                        <div class="d-flex align-items-center justify-content-between mb-3">
                            <h6 class="mb-0">${PROJECT_STATUSES[status].icon} ${status}</h6>
                            <span class="badge badge-outline">${statusProjects.length}</span>
                        </div>
                        <div class="kanban-cards" data-status="${status}">
                            ${statusProjects.map(project => `
                                <div class="kanban-card" data-project-id="${project.id}">
                                    <div class="d-flex justify-content-between align-items-start mb-2">
                                        <span class="badge ${ENTITIES[project.entity]?.bg || 'bg-secondary'} badge-sm">${project.entity}</span>
                                        <span class="badge ${getHealthScoreClass(project.healthScore)} badge-sm">${project.healthScore}</span>
                                    </div>
                                    <h6 class="card-title mb-2">${project.title}</h6>
                                    <p class="text-muted small mb-2">${project.client}</p>
                                    <div class="d-flex justify-content-between align-items-center mb-2">
                                        <span class="small text-muted">${project.progress}%</span>
                                        <span class="small text-muted">${formatSwissAmount(project.budget)}</span>
                                    </div>
                                    <div class="progress progress-bar-custom">
                                        <div class="progress-bar" style="width: ${project.progress}%"></div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Initialiser Sortable sur chaque colonne
        document.querySelectorAll('.kanban-cards').forEach(column => {
            new Sortable(column, {
                group: 'kanban',
                animation: 150,
                onEnd: function(evt) {
                    const projectId = evt.item.dataset.projectId;
                    const newStatus = evt.to.dataset.status;
                    updateProjectStatus(projectId, newStatus);
                }
            });
        });
    }

    /**
     * Vue Gantt avec dhtmlxGantt
     */
    function updateGanttView() {
        const ganttContainer = document.getElementById('gantt-container');
        
        if (!ganttContainer) return;

        // Configuration Gantt
        gantt.config.date_format = "%Y-%m-%d";
        gantt.config.scale_unit = "month";
        gantt.config.date_scale = "%F %Y";
        gantt.config.subscales = [
            {unit: "day", step: 1, date: "%j, %D"}
        ];

        // Préparer les données
        const ganttData = {
            data: filteredProjects.map((project, index) => ({
                id: project.id,
                text: project.title,
                start_date: project.startDate || new Date().toISOString().split('T')[0],
                end_date: project.endDate || new Date(Date.now() + 90*24*60*60*1000).toISOString().split('T')[0],
                progress: project.progress / 100,
                entity: project.entity,
                client: project.client,
                budget: project.budget
            })),
            links: []
        };

        // Initialiser Gantt
        gantt.init(ganttContainer);
        gantt.parse(ganttData);

        // Event listeners pour zoom
        document.getElementById('gantt-zoom-in')?.addEventListener('click', () => {
            gantt.ext.zoom.zoomIn();
        });
        
        document.getElementById('gantt-zoom-out')?.addEventListener('click', () => {
            gantt.ext.zoom.zoomOut();
        });
    }

    /**
     * Vue Ressources
     */
    function updateResourcesView() {
        const resourcesGrid = document.getElementById('resources-grid');
        
        // Grouper par entité
        const projectsByEntity = {};
        filteredProjects.forEach(project => {
            if (!projectsByEntity[project.entity]) {
                projectsByEntity[project.entity] = [];
            }
            projectsByEntity[project.entity].push(project);
        });

        resourcesGrid.innerHTML = Object.entries(projectsByEntity).map(([entity, projects]) => {
            const totalTeamMembers = projects.reduce((sum, p) => sum + (p.team || 0), 0);
            const totalHours = projects.reduce((sum, p) => sum + (p.totalHours || 0), 0);
            const utilizationRate = Math.round((totalHours / (totalTeamMembers * 160)) * 100); // 160h/mois standard

            return `
                <div class="resource-card">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h5 class="mb-0">${entity}</h5>
                        <span class="badge ${ENTITIES[entity]?.bg || 'bg-secondary'}">${projects.length} projets</span>
                    </div>
                    
                    <div class="row mb-3">
                        <div class="col-6">
                            <div class="text-center">
                                <div class="h3 text-primary">${totalTeamMembers}</div>
                                <div class="text-muted small">Équipiers</div>
                            </div>
                        </div>
                        <div class="col-6">
                            <div class="text-center">
                                <div class="h3 text-info">${totalHours}h</div>
                                <div class="text-muted small">Heures Total</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <div class="d-flex justify-content-between mb-1">
                            <span class="small">Taux d'utilisation</span>
                            <span class="small font-weight-medium">${utilizationRate}%</span>
                        </div>
                        <div class="progress progress-bar-custom">
                            <div class="progress-bar ${utilizationRate > 90 ? 'bg-danger' : utilizationRate > 75 ? 'bg-warning' : 'bg-success'}" 
                                 style="width: ${Math.min(utilizationRate, 100)}%"></div>
                        </div>
                    </div>
                    
                    <div class="list-group list-group-flush">
                        ${projects.slice(0, 3).map(project => `
                            <div class="list-group-item px-0 py-2">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <div class="font-weight-medium">${project.title}</div>
                                        <div class="text-muted small">${project.client}</div>
                                    </div>
                                    <div class="text-end">
                                        <div class="small">${project.team} membres</div>
                                        <div class="text-muted small">${project.totalHours}h</div>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                        ${projects.length > 3 ? `
                            <div class="list-group-item px-0 py-2 text-center">
                                <small class="text-muted">+${projects.length - 3} autres projets</small>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Vue Budget avec graphiques
     */
    function updateBudgetView() {
        updateBudgetChart();
        updateBudgetPieChart();
        updateBudgetMetrics();
    }

    /**
     * Graphique budget par entité
     */
    function updateBudgetChart() {
        const budgetByEntity = {};
        
        filteredProjects.forEach(project => {
            if (!budgetByEntity[project.entity]) {
                budgetByEntity[project.entity] = { budget: 0, invoiced: 0 };
            }
            budgetByEntity[project.entity].budget += project.budget || 0;
            budgetByEntity[project.entity].invoiced += project.invoicedAmount || 0;
        });

        const categories = Object.keys(budgetByEntity);
        const budgetData = categories.map(entity => budgetByEntity[entity].budget);
        const invoicedData = categories.map(entity => budgetByEntity[entity].invoiced);

        const options = {
            series: [
                {
                    name: 'Budget',
                    data: budgetData
                },
                {
                    name: 'Facturé',
                    data: invoicedData
                }
            ],
            chart: {
                type: 'bar',
                height: 400,
                toolbar: { show: false }
            },
            plotOptions: {
                bar: {
                    horizontal: false,
                    columnWidth: '55%',
                    endingShape: 'rounded'
                }
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
                categories: categories
            },
            yaxis: {
                title: {
                    text: 'Montant (CHF)'
                },
                labels: {
                    formatter: function(val) {
                        return formatSwissAmount(val);
                    }
                }
            },
            fill: {
                opacity: 1
            },
            tooltip: {
                y: {
                    formatter: function(val) {
                        return formatSwissAmount(val);
                    }
                }
            },
            colors: ['#3b82f6', '#10b981']
        };

        if (budgetChart) {
            budgetChart.destroy();
        }

        budgetChart = new ApexCharts(document.getElementById('budget-chart'), options);
        budgetChart.render();
    }

    /**
     * Graphique camembert répartition budget
     */
    function updateBudgetPieChart() {
        const budgetByEntity = {};
        
        filteredProjects.forEach(project => {
            if (!budgetByEntity[project.entity]) {
                budgetByEntity[project.entity] = 0;
            }
            budgetByEntity[project.entity] += project.budget || 0;
        });

        const options = {
            series: Object.values(budgetByEntity),
            chart: {
                type: 'donut',
                height: 350
            },
            labels: Object.keys(budgetByEntity),
            colors: Object.keys(budgetByEntity).map(entity => ENTITIES[entity]?.color || '#6b7280'),
            responsive: [{
                breakpoint: 480,
                options: {
                    chart: {
                        width: 200
                    },
                    legend: {
                        position: 'bottom'
                    }
                }
            }],
            tooltip: {
                y: {
                    formatter: function(val) {
                        return formatSwissAmount(val);
                    }
                }
            }
        };

        if (budgetPieChart) {
            budgetPieChart.destroy();
        }

        budgetPieChart = new ApexCharts(document.getElementById('budget-pie-chart'), options);
        budgetPieChart.render();
    }

    /**
     * Métriques financières
     */
    function updateBudgetMetrics() {
        const totalBudget = filteredProjects.reduce((sum, p) => sum + (p.budget || 0), 0);
        const totalInvoiced = filteredProjects.reduce((sum, p) => sum + (p.invoicedAmount || 0), 0);
        const avgMargin = Math.round(filteredProjects.reduce((sum, p) => sum + (p.estimatedMargin || 0), 0) / filteredProjects.length);
        const roi = Math.round(((totalInvoiced - totalBudget) / totalBudget) * 100);

        document.getElementById('budget-total').textContent = formatSwissAmount(totalBudget);
        document.getElementById('budget-invoiced').textContent = formatSwissAmount(totalInvoiced);
        document.getElementById('budget-margin').textContent = `${avgMargin}%`;
        document.getElementById('budget-roi').textContent = `${roi}%`;
    }

    /**
     * Mettre à jour le statut d'un projet (Kanban)
     */
    async function updateProjectStatus(projectId, newStatus) {
        try {
            // Mettre à jour dans le tableau local
            const project = allProjects.find(p => p.id === projectId);
            if (project) {
                project.status = newStatus;
            }

            // Mettre à jour dans Notion si MCP disponible
            if (window.MCPNotionWrapper) {
                await window.MCPNotionWrapper.updatePage(projectId, {
                    properties: {
                        'Statut Projet': {
                            select: {
                                name: newStatus
                            }
                        }
                    }
                });
            }

            console.log(`✅ Projet ${projectId} mis à jour: ${newStatus}`);
            
        } catch (error) {
            console.error('❌ Erreur mise à jour statut:', error);
        }
    }

    /**
     * Afficher les détails d'un projet
     */
    function viewProjectDetails(projectId) {
        const project = allProjects.find(p => p.id === projectId);
        if (!project) return;

        const modalContent = document.getElementById('project-details-content');
        modalContent.innerHTML = `
            <div class="row">
                <div class="col-md-8">
                    <h4>${project.title}</h4>
                    <p class="text-muted">${project.description}</p>
                    
                    <div class="row mb-3">
                        <div class="col-sm-6">
                            <strong>Client:</strong> ${project.client}<br>
                            <strong>Entité:</strong> <span class="badge ${ENTITIES[project.entity]?.bg}">${project.entity}</span><br>
                            <strong>Équipe:</strong> ${project.team} membres
                        </div>
                        <div class="col-sm-6">
                            <strong>Statut:</strong> <span class="badge" style="background-color: ${PROJECT_STATUSES[project.status]?.color}; color: white;">${project.status}</span><br>
                            <strong>Priorité:</strong> ${project.priority}<br>
                            <strong>Health Score:</strong> <span class="badge ${getHealthScoreClass(project.healthScore)}">${project.healthScore}</span>
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="col-sm-6">
                            <h6>Dates</h6>
                            <p>
                                <strong>Début:</strong> ${formatDate(project.startDate)}<br>
                                <strong>Fin prévue:</strong> ${formatDate(project.endDate)}
                            </p>
                        </div>
                        <div class="col-sm-6">
                            <h6>Progression</h6>
                            <div class="d-flex align-items-center mb-2">
                                <div class="progress flex-fill me-2">
                                    <div class="progress-bar" style="width: ${project.progress}%"></div>
                                </div>
                                <span>${project.progress}%</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-4">
                    <h6>Financier</h6>
                    <table class="table table-sm">
                        <tr>
                            <td>Budget:</td>
                            <td class="text-end"><strong>${formatSwissAmount(project.budget)}</strong></td>
                        </tr>
                        <tr>
                            <td>Facturé:</td>
                            <td class="text-end">${formatSwissAmount(project.invoicedAmount)}</td>
                        </tr>
                        <tr>
                            <td>Marge estimée:</td>
                            <td class="text-end">${project.estimatedMargin}%</td>
                        </tr>
                    </table>
                    
                    <h6 class="mt-3">Tâches</h6>
                    <p>
                        <strong>${project.completedTasks}/${project.tasksCount}</strong> tâches terminées<br>
                        <strong>${project.totalHours}h</strong> au total<br>
                        <strong>${project.billableHours}h</strong> facturables
                    </p>
                </div>
            </div>
        `;

        new bootstrap.Modal(document.getElementById('project-details-modal')).show();
    }

    /**
     * Actualiser les données
     */
    function refreshData() {
        showLoadingOverlay();
        loadProjectsData();
    }

    /**
     * Export des données
     */
    function exportData(format) {
        console.log(`📊 Export ${format} en cours...`);
        
        const exportData = filteredProjects.map(project => ({
            'Nom du Projet': project.title,
            'Client': project.client,
            'Entité': project.entity,
            'Statut': project.status,
            'Priorité': project.priority,
            'Avancement (%)': project.progress,
            'Health Score': project.healthScore,
            'Budget (CHF)': project.budget,
            'Facturé (CHF)': project.invoicedAmount,
            'Marge (%)': project.estimatedMargin,
            'Date Début': project.startDate,
            'Date Fin': project.endDate,
            'Équipe': project.team,
            'Tâches': `${project.completedTasks}/${project.tasksCount}`,
            'Heures': project.totalHours
        }));

        if (format === 'csv') {
            downloadCSV(exportData, 'projets-multi-entites.csv');
        } else if (format === 'excel') {
            console.log('Excel export nécessite une bibliothèque supplémentaire');
        } else if (format === 'pdf') {
            console.log('PDF export nécessite une bibliothèque supplémentaire');
        }
    }

    /**
     * Utilitaires
     */
    function formatSwissAmount(amount) {
        if (!amount && amount !== 0) return 'CHF 0';
        return `CHF ${amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'")}`;
    }

    function formatDate(dateString) {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('fr-CH');
    }

    function getHealthScoreClass(score) {
        if (score >= 90) return 'health-score-excellent';
        if (score >= 70) return 'health-score-good';
        if (score >= 50) return 'health-score-warning';
        return 'health-score-critical';
    }

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function downloadCSV(data, filename) {
        const csv = [
            Object.keys(data[0]).join(','),
            ...data.map(row => Object.values(row).map(val => `"${val}"`).join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    function showLoadingOverlay() {
        document.getElementById('loading-overlay').style.display = 'flex';
    }

    function hideLoadingOverlay() {
        document.getElementById('loading-overlay').style.display = 'none';
    }

    // API publique
    return {
        init,
        refreshData,
        viewProjectDetails,
        switchView,
        applyFilters
    };

})();