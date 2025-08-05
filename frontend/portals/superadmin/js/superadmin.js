// Configuration API
const API_URL = 'http://localhost:8055';
const API_TOKEN = 'e6Vt5LRHnYhq7-78yzoSxwdgjn2D6-JW';

// État global du dashboard
let dashboardData = {
    companies: [],
    projects: [],
    invoices: [],
    kpis: {}
};

// Initialisation du dashboard
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Initialisation du SuperAdmin Dashboard...');
    
    // Charger les données
    await loadDashboardData();
    
    // Initialiser les graphiques
    initializeCharts();
    
    // Configurer les event listeners
    setupEventListeners();
    
    // Actualisation automatique toutes les 5 minutes
    setInterval(loadDashboardData, 5 * 60 * 1000);
});

// Fonction pour charger les données du dashboard
async function loadDashboardData() {
    try {
        showLoadingIndicator(true);
        
        // Charger toutes les données en parallèle
        const [companiesRes, projectsRes, invoicesRes] = await Promise.all([
            fetch(`${API_URL}/items/companies`, {
                headers: { 'Authorization': `Bearer ${API_TOKEN}` }
            }),
            fetch(`${API_URL}/items/projects`, {
                headers: { 'Authorization': `Bearer ${API_TOKEN}` }
            }),
            fetch(`${API_URL}/items/client_invoices`, {
                headers: { 'Authorization': `Bearer ${API_TOKEN}` }
            })
        ]);
        
        // Parser les réponses
        dashboardData.companies = (await companiesRes.json()).data || [];
        dashboardData.projects = (await projectsRes.json()).data || [];
        dashboardData.invoices = (await invoicesRes.json()).data || [];
        
        // Calculer les KPIs
        calculateKPIs();
        
        // Mettre à jour l'interface
        updateDashboardUI();
        
        // Mettre à jour les graphiques
        updateCharts();
        
        // Mettre à jour l'heure de dernière actualisation
        updateLastRefreshTime();
        
        showLoadingIndicator(false);
        showSuccessAlert('Données mises à jour avec succès');
        
    } catch (error) {
        console.error('Erreur chargement dashboard:', error);
        showErrorAlert('Erreur lors du chargement des données');
        showLoadingIndicator(false);
    }
}

// Calculer les KPIs consolidés
function calculateKPIs() {
    // CA Total
    const totalRevenue = dashboardData.invoices
        .filter(inv => inv.status === 'paid')
        .reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0);
    
    // Marge (simulation - normalement viendrait de Directus)
    const margin = totalRevenue * 0.225; // 22.5%
    
    // Trésorerie (simulation)
    const treasury = 485000;
    
    // Projets actifs
    const activeProjects = dashboardData.projects
        .filter(p => p.status === 'active').length;
    
    dashboardData.kpis = {
        revenue: totalRevenue,
        revenueGrowth: 12,
        margin: 22.5,
        marginGrowth: 0,
        treasury: treasury,
        treasuryGrowth: 8,
        activeProjects: activeProjects,
        newProjects: 5
    };
}

// Mettre à jour l'interface utilisateur
function updateDashboardUI() {
    // Mettre à jour les KPIs (les valeurs sont déjà dans le HTML comme exemple)
    // Dans une vraie implémentation, on mettrait à jour dynamiquement
    
    // Mettre à jour la table des entités
    updateEntitiesTable();
    
    // Mettre à jour l'activité récente
    updateActivityTimeline();
}

// Initialiser les graphiques
function initializeCharts() {
    // Graphique multi-entreprises
    const revenueChartOptions = {
        series: [
            { name: 'HyperVisual', data: [30000, 40000, 35000, 50000, 49000, 60000, 70000, 91000] },
            { name: 'Dynamics', data: [20000, 25000, 28000, 32000, 35000, 40000, 45000, 50000] },
            { name: 'Lexia', data: [15000, 18000, 20000, 22000, 25000, 28000, 30000, 35000] },
            { name: 'NKReality', data: [10000, 12000, 15000, 18000, 20000, 22000, 25000, 28000] },
            { name: 'Etekout', data: [8000, 10000, 12000, 14000, 16000, 18000, 20000, 22000] }
        ],
        chart: {
            type: 'line',
            height: 300,
            toolbar: { show: false },
            background: 'transparent',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        },
        dataLabels: { enabled: false },
        stroke: {
            curve: 'smooth',
            width: 2
        },
        grid: {
            borderColor: 'rgba(255, 255, 255, 0.1)',
            strokeDashArray: 4,
            xaxis: { lines: { show: false } }
        },
        xaxis: {
            categories: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août'],
            labels: { style: { colors: '#9ca3af' } }
        },
        yaxis: {
            labels: {
                style: { colors: '#9ca3af' },
                formatter: function(val) {
                    return '€' + (val/1000).toFixed(0) + 'K';
                }
            }
        },
        legend: {
            position: 'top',
            horizontalAlign: 'right',
            labels: { colors: '#9ca3af' }
        },
        tooltip: {
            theme: 'dark',
            y: {
                formatter: function(val) {
                    return '€' + val.toLocaleString('fr-FR');
                }
            }
        },
        colors: ['#6366F1', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444']
    };
    
    const revenueChart = new ApexCharts(
        document.querySelector("#chart-revenue-multicompany"), 
        revenueChartOptions
    );
    revenueChart.render();
    
    // Graphique pipeline projets
    const projectsChartOptions = {
        series: [{
            name: 'Projets',
            data: [12, 19, 15, 22, 18, 25, 20, 28]
        }],
        chart: {
            type: 'area',
            height: 250,
            toolbar: { show: false },
            background: 'transparent'
        },
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth', width: 2 },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                inverseColors: false,
                opacityFrom: 0.45,
                opacityTo: 0.05,
                stops: [20, 100, 100, 100]
            }
        },
        grid: {
            borderColor: 'rgba(255, 255, 255, 0.1)',
            strokeDashArray: 4
        },
        xaxis: {
            categories: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août'],
            labels: { style: { colors: '#9ca3af' } }
        },
        yaxis: {
            labels: { style: { colors: '#9ca3af' } }
        },
        colors: ['#3B82F6']
    };
    
    const projectsChart = new ApexCharts(
        document.querySelector("#projects-chart"),
        projectsChartOptions
    );
    projectsChart.render();
    
    // Graphique cashflow
    const cashflowChartOptions = {
        series: [{
            name: 'Entrées',
            data: [44000, 55000, 57000, 56000, 61000, 58000, 63000, 60000]
        }, {
            name: 'Sorties',
            data: [35000, 41000, 36000, 26000, 45000, 48000, 52000, 53000]
        }],
        chart: {
            type: 'bar',
            height: 250,
            toolbar: { show: false },
            background: 'transparent'
        },
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '55%',
                borderRadius: 5
            }
        },
        dataLabels: { enabled: false },
        grid: {
            borderColor: 'rgba(255, 255, 255, 0.1)',
            strokeDashArray: 4
        },
        xaxis: {
            categories: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août'],
            labels: { style: { colors: '#9ca3af' } }
        },
        yaxis: {
            labels: {
                style: { colors: '#9ca3af' },
                formatter: function(val) {
                    return '€' + (val/1000).toFixed(0) + 'K';
                }
            }
        },
        legend: {
            position: 'top',
            labels: { colors: '#9ca3af' }
        },
        colors: ['#10B981', '#EF4444']
    };
    
    const cashflowChart = new ApexCharts(
        document.querySelector("#cashflow-chart"),
        cashflowChartOptions
    );
    cashflowChart.render();
}

// Mettre à jour les graphiques
function updateCharts() {
    // Dans une vraie implémentation, on mettrait à jour les données des graphiques
    console.log('Mise à jour des graphiques...');
}

// Mettre à jour la table des entités
function updateEntitiesTable() {
    const tbody = document.querySelector('#entities-table tbody');
    if (!tbody) return;
    
    // Données simulées pour les entités
    const entities = [
        { name: 'HyperVisual', revenue: 91000, margin: 24.5, projects: 12, treasury: 125000, performance: 95 },
        { name: 'Dynamics', revenue: 50000, margin: 22.0, projects: 8, treasury: 85000, performance: 82 },
        { name: 'Lexia', revenue: 35000, margin: 20.5, projects: 6, treasury: 45000, performance: 75 },
        { name: 'NKReality', revenue: 28000, margin: 21.8, projects: 5, treasury: 38000, performance: 70 },
        { name: 'Etekout', revenue: 22000, margin: 19.5, projects: 4, treasury: 30000, performance: 65 }
    ];
    
    tbody.innerHTML = entities.map(entity => `
        <tr>
            <td>
                <div class="d-flex align-items-center">
                    <span class="avatar avatar-sm me-2 bg-primary-lt">${entity.name.substring(0, 2).toUpperCase()}</span>
                    <div>
                        <div class="font-weight-medium">${entity.name}</div>
                        <div class="text-muted small">ID: ${Math.random().toString(36).substr(2, 9)}</div>
                    </div>
                </div>
            </td>
            <td class="text-end">
                <div class="font-weight-medium entity-revenue">€${entity.revenue.toLocaleString('fr-FR')}</div>
            </td>
            <td class="text-center">
                <span class="badge bg-${entity.margin > 22 ? 'green' : entity.margin > 20 ? 'yellow' : 'red'}-lt">
                    ${entity.margin}%
                </span>
            </td>
            <td class="text-center">
                <div>${entity.projects}</div>
            </td>
            <td class="text-end">
                <div class="font-weight-medium">€${entity.treasury.toLocaleString('fr-FR')}</div>
            </td>
            <td>
                <div class="progress progress-sm">
                    <div class="progress-bar bg-${entity.performance > 80 ? 'green' : entity.performance > 60 ? 'yellow' : 'red'}" 
                         style="width: ${entity.performance}%" 
                         role="progressbar">
                        <span class="visually-hidden">${entity.performance}%</span>
                    </div>
                </div>
            </td>
        </tr>
    `).join('');
}

// Mettre à jour la timeline d'activité
function updateActivityTimeline() {
    const timeline = document.querySelector('#activity-timeline');
    if (!timeline) return;
    
    // Activités simulées
    const activities = [
        { time: 'Il y a 2 min', icon: 'ti-file-invoice', color: 'green', title: 'Nouvelle facture', desc: 'Facture #2024-001 créée pour TechCorp' },
        { time: 'Il y a 15 min', icon: 'ti-user-plus', color: 'blue', title: 'Nouvel utilisateur', desc: 'Marie Dupont ajoutée à HyperVisual' },
        { time: 'Il y a 1h', icon: 'ti-alert-triangle', color: 'orange', title: 'Alerte budget', desc: 'Projet WebApp à 90% du budget' },
        { time: 'Il y a 2h', icon: 'ti-check', color: 'green', title: 'Projet terminé', desc: 'Migration Cloud complétée avec succès' }
    ];
    
    timeline.innerHTML = activities.map(activity => `
        <div class="timeline-event">
            <div class="timeline-event-icon bg-${activity.color}-lt">
                <i class="ti ${activity.icon}"></i>
            </div>
            <div class="card timeline-event-card">
                <div class="card-body">
                    <div class="text-muted float-end small">${activity.time}</div>
                    <h4>${activity.title}</h4>
                    <p class="text-muted mb-0">${activity.desc}</p>
                </div>
            </div>
        </div>
    `).join('');
}

// Configuration des event listeners
function setupEventListeners() {
    // Bouton refresh
    const refreshBtn = document.querySelector('#refresh-dashboard');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            await loadDashboardData();
        });
    }
    
    // Boutons de période
    document.querySelectorAll('[data-period]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            // Retirer la classe active de tous les boutons du groupe
            btn.parentElement.querySelectorAll('.btn').forEach(b => b.classList.remove('active'));
            // Ajouter la classe active au bouton cliqué
            btn.classList.add('active');
            // Recharger les données pour la période sélectionnée
            console.log('Période sélectionnée:', btn.dataset.period);
            updateCharts();
        });
    });
}

// Utilitaires
function showLoadingIndicator(show) {
    const indicator = document.querySelector('#loading-indicator');
    if (indicator) {
        indicator.style.display = show ? 'block' : 'none';
    }
}

function showSuccessAlert(message) {
    // Dans une vraie implémentation, créer une alerte dynamiquement
    console.log('Success:', message);
}

function showErrorAlert(message) {
    // Dans une vraie implémentation, créer une alerte dynamiquement
    console.error('Error:', message);
}

function updateLastRefreshTime() {
    const element = document.querySelector('#last-refresh');
    if (element) {
        element.textContent = new Date().toLocaleTimeString('fr-FR');
    }
}

// ============================================
// FONCTIONS GESTION DE PROJETS
// ============================================

// Variables globales pour le module projets
let currentView = 'kanban';
let currentProjects = [];
let draggedElement = null;

// Projets de démonstration
const demoProjects = [
    {
        id: 1,
        name: 'Site Web E-commerce',
        description: 'Développement d\'une plateforme e-commerce complète',
        status: 'todo',
        priority: 'high',
        progress: 25,
        startDate: '2024-01-15',
        endDate: '2024-03-15',
        budget: 45000,
        spent: 11250,
        team: ['Alice Martin', 'Bob Durant'],
        company: 'HyperVisual',
        client: 'TechCorp'
    },
    {
        id: 2,
        name: 'Application Mobile',
        description: 'App mobile iOS/Android pour gestion de tâches',
        status: 'progress',
        priority: 'high',
        progress: 60,
        startDate: '2024-02-01',
        endDate: '2024-04-30',
        budget: 38000,
        spent: 22800,
        team: ['Charlie Durand', 'Diana Petit'],
        company: 'Dynamics',
        client: 'StartupXYZ'
    },
    {
        id: 3,
        name: 'Migration Cloud',
        description: 'Migration infrastructure vers AWS',
        status: 'progress',
        priority: 'medium',
        progress: 40,
        startDate: '2024-01-20',
        endDate: '2024-02-28',
        budget: 25000,
        spent: 10000,
        team: ['Eve Laurent'],
        company: 'Lexia',
        client: 'Enterprise Ltd',
    },
    {
        id: 4,
        name: 'Audit Sécurité',
        description: 'Audit complet de sécurité IT',
        status: 'review',
        priority: 'high',
        progress: 90,
        startDate: '2024-02-10',
        endDate: '2024-02-25',
        budget: 15000,
        spent: 13500,
        team: ['Frank Simon', 'Grace Moreau'],
        company: 'NKReality',
        client: 'SecureBank'
    },
    {
        id: 5,
        name: 'Formation équipe',
        description: 'Formation DevOps et containers',
        status: 'done',
        priority: 'low',
        progress: 100,
        startDate: '2024-01-05',
        endDate: '2024-01-25',
        budget: 8000,
        spent: 7200,
        team: ['Hugo Roux'],
        company: 'Etekout',
        client: 'Internal'
    }
];

// Initialisation du module projets
function initProjectsModule() {
    currentProjects = [...demoProjects];
    setupProjectsEventListeners();
    renderProjectsView();
}

// Configuration des événements pour les projets
function setupProjectsEventListeners() {
    // Boutons de changement de vue
    document.querySelectorAll('[data-view]')?.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            switchProjectView(btn.dataset.view);
        });
    });

    // Bouton nouveau projet
    document.getElementById('new-project-btn')?.addEventListener('click', showNewProjectModal);

    // Filtres
    document.getElementById('status-filter')?.addEventListener('change', filterProjects);
    document.getElementById('priority-filter')?.addEventListener('change', filterProjects);
    document.getElementById('company-filter')?.addEventListener('change', filterProjects);
}

// Changer la vue des projets
function switchProjectView(view) {
    currentView = view;
    
    // Mettre à jour les boutons actifs
    document.querySelectorAll('[data-view]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === view);
    });
    
    renderProjectsView();
}

// Rendu de la vue des projets
function renderProjectsView() {
    const container = document.getElementById('projects-container');
    if (!container) return;

    switch(currentView) {
        case 'kanban':
            renderKanbanView(container);
            break;
        case 'list':
            renderListView(container);
            break;
        case 'gantt':
            renderGanttView(container);
            break;
    }
}

// Rendu vue Kanban
function renderKanbanView(container) {
    const stages = ['todo', 'progress', 'review', 'done'];
    const stageNames = {
        'todo': 'À faire',
        'progress': 'En cours',
        'review': 'En révision',
        'done': 'Terminé'
    };

    container.innerHTML = `
        <div class="row g-3">
            ${stages.map(stage => `
                <div class="col-md-3">
                    <div class="kanban-column">
                        <div class="kanban-header">
                            <h5>${stageNames[stage]}</h5>
                            <span class="badge bg-secondary">${currentProjects.filter(p => p.status === stage).length}</span>
                        </div>
                        <div class="kanban-body" data-stage="${stage}">
                            ${currentProjects.filter(p => p.status === stage).map(project => createProjectCard(project)).join('')}
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    setupKanbanDragDrop();
}

// Création d'une carte projet pour le Kanban
function createProjectCard(project) {
    const progressColor = project.progress >= 75 ? 'success' : project.progress >= 50 ? 'warning' : 'danger';
    const priorityColor = project.priority === 'high' ? 'danger' : project.priority === 'medium' ? 'warning' : 'info';
    
    return `
        <div class="kanban-card project-priority-${project.priority}" draggable="true" data-project-id="${project.id}">
            <div class="card-header">
                <div class="d-flex justify-content-between align-items-start">
                    <h6 class="card-title mb-1">${project.name}</h6>
                    <span class="badge bg-${priorityColor}-lt">${project.priority}</span>
                </div>
                <p class="text-muted small mb-2">${project.description}</p>
            </div>
            <div class="card-body">
                <div class="d-flex justify-content-between mb-2">
                    <small class="text-muted">Progression</small>
                    <small class="text-${progressColor}">${project.progress}%</small>
                </div>
                <div class="progress mb-3" style="height: 4px;">
                    <div class="progress-bar bg-${progressColor}" style="width: ${project.progress}%"></div>
                </div>
                
                <div class="d-flex justify-content-between mb-2">
                    <small class="text-muted">Budget</small>
                    <small>€${project.spent.toLocaleString('fr-FR')} / €${project.budget.toLocaleString('fr-FR')}</small>
                </div>
                
                <div class="d-flex justify-content-between align-items-center">
                    <small class="text-muted">${project.company}</small>
                    <div class="avatar-list avatar-list-stacked">
                        ${project.team.slice(0, 2).map(member => `
                            <span class="avatar avatar-xs bg-primary-lt" title="${member}">
                                ${member.split(' ').map(n => n[0]).join('')}
                            </span>
                        `).join('')}
                        ${project.team.length > 2 ? `<span class="avatar avatar-xs">+${project.team.length - 2}</span>` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Configuration du drag & drop pour Kanban
function setupKanbanDragDrop() {
    const cards = document.querySelectorAll('.kanban-card');
    const columns = document.querySelectorAll('.kanban-body');

    cards.forEach(card => {
        card.addEventListener('dragstart', (e) => {
            draggedElement = e.target;
            e.target.style.opacity = '0.5';
        });

        card.addEventListener('dragend', (e) => {
            e.target.style.opacity = '1';
            draggedElement = null;
        });
    });

    columns.forEach(column => {
        column.addEventListener('dragover', (e) => {
            e.preventDefault();
            column.classList.add('kanban-dragover');
        });

        column.addEventListener('dragleave', (e) => {
            column.classList.remove('kanban-dragover');
        });

        column.addEventListener('drop', (e) => {
            e.preventDefault();
            column.classList.remove('kanban-dragover');
            
            if (draggedElement) {
                const projectId = parseInt(draggedElement.dataset.projectId);
                const newStatus = column.dataset.stage;
                
                // Mettre à jour le projet
                const projectIndex = currentProjects.findIndex(p => p.id === projectId);
                if (projectIndex !== -1) {
                    currentProjects[projectIndex].status = newStatus;
                    column.appendChild(draggedElement);
                    
                    // Mettre à jour les compteurs
                    updateKanbanCounters();
                    
                    showSuccessAlert(`Projet déplacé vers "${column.dataset.stage}"`);
                }
            }
        });
    });
}

// Mettre à jour les compteurs Kanban
function updateKanbanCounters() {
    document.querySelectorAll('.kanban-header .badge').forEach(badge => {
        const stage = badge.closest('.kanban-column').querySelector('.kanban-body').dataset.stage;
        const count = currentProjects.filter(p => p.status === stage).length;
        badge.textContent = count;
    });
}

// ============================================
// FONCTIONS CRM ENRICHIES
// ============================================

// Variables globales pour le CRM
let currentContacts = [];
let currentOpportunities = [];

// Contacts de démonstration avec scores
const demoContacts = [
    {
        id: 1,
        name: 'Jean Dupont',
        company: 'TechCorp',
        email: 'jean.dupont@techcorp.com',
        phone: '+33 1 23 45 67 89',
        lastInteraction: '2024-01-15',
        interactions: 12,
        engagement: 85,
        score: 0
    },
    {
        id: 2,
        name: 'Marie Martin',
        company: 'StartupXYZ',
        email: 'marie@startupxyz.com',
        phone: '+33 1 98 76 54 32',
        lastInteraction: '2024-01-20',
        interactions: 8,
        engagement: 72,
        score: 0
    },
    {
        id: 3,
        name: 'Pierre Durant',
        company: 'Enterprise Ltd',
        email: 'p.durant@enterprise.com',
        phone: '',
        lastInteraction: '2024-01-10',
        interactions: 5,
        engagement: 45,
        score: 0
    }
];

// Opportunités de démonstration
const demoOpportunities = [
    {
        id: 1,
        title: 'Refonte site web TechCorp',
        contact: 'Jean Dupont',
        company: 'TechCorp',
        value: 45000,
        stage: 'qualification',
        probability: 60,
        closeDate: '2024-03-15'
    },
    {
        id: 2,
        title: 'App mobile StartupXYZ',
        contact: 'Marie Martin',
        company: 'StartupXYZ',
        value: 38000,
        stage: 'proposal',
        probability: 80,
        closeDate: '2024-02-28'
    },
    {
        id: 3,
        title: 'Migration cloud Enterprise',
        contact: 'Pierre Durant',
        company: 'Enterprise Ltd',
        value: 25000,
        stage: 'negotiation',
        probability: 90,
        closeDate: '2024-02-15'
    }
];

// Initialisation du module CRM enrichi
function initEnhancedCRM() {
    currentContacts = [...demoContacts];
    currentOpportunities = [...demoOpportunities];
    
    // Calculer les scores des contacts
    currentContacts.forEach(contact => {
        contact.score = calculateContactScore(contact);
    });
    
    renderContactsTable();
    renderSalesPipeline();
    setupCRMEventListeners();
}

// Calcul du score d'un contact
function calculateContactScore(contact) {
    let score = 0;
    
    // Score de base
    score += 20;
    
    // Informations de contact
    if (contact.email) score += 15;
    if (contact.phone) score += 10;
    
    // Interactions
    score += Math.min(contact.interactions * 2, 30);
    
    // Engagement
    score += Math.min(contact.engagement * 0.25, 25);
    
    // Activité récente
    const daysSinceLastInteraction = Math.floor((new Date() - new Date(contact.lastInteraction)) / (1000 * 60 * 60 * 24));
    if (daysSinceLastInteraction < 7) score += 10;
    else if (daysSinceLastInteraction < 30) score += 5;
    
    return Math.min(Math.max(score, 0), 100);
}

// Rendu de la table des contacts
function renderContactsTable() {
    const tbody = document.querySelector('#contacts-table tbody');
    if (!tbody) return;

    tbody.innerHTML = currentContacts.map(contact => {
        const scoreColor = contact.score >= 80 ? 'success' : contact.score >= 60 ? 'warning' : 'danger';
        
        return `
            <tr>
                <td>
                    <div class="d-flex align-items-center">
                        <span class="avatar avatar-sm me-2 bg-primary-lt">${contact.name.split(' ').map(n => n[0]).join('')}</span>
                        <div>
                            <div class="font-weight-medium">${contact.name}</div>
                            <div class="text-muted small">${contact.company}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <div>${contact.email}</div>
                    <div class="text-muted small">${contact.phone || 'Non renseigné'}</div>
                </td>
                <td class="text-center">
                    <span class="badge bg-${scoreColor}">${contact.score}/100</span>
                </td>
                <td class="text-center">
                    <div>${contact.interactions}</div>
                    <div class="text-muted small">${contact.engagement}% engagement</div>
                </td>
                <td class="text-center">
                    <div class="text-muted small">${new Date(contact.lastInteraction).toLocaleDateString('fr-FR')}</div>
                </td>
                <td>
                    <div class="btn-group" role="group">
                        <button type="button" class="btn btn-sm btn-outline-primary" onclick="editContact(${contact.id})">
                            <i class="ti ti-edit"></i>
                        </button>
                        <button type="button" class="btn btn-sm btn-outline-success" onclick="createOpportunity(${contact.id})">
                            <i class="ti ti-plus"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Rendu du pipeline de vente
function renderSalesPipeline() {
    const container = document.getElementById('sales-pipeline');
    if (!container) return;

    const stages = ['lead', 'qualification', 'proposal', 'negotiation', 'closed'];
    const stageNames = {
        'lead': 'Prospect',
        'qualification': 'Qualification',
        'proposal': 'Proposition',
        'negotiation': 'Négociation',
        'closed': 'Conclu'
    };

    container.innerHTML = `
        <div class="row g-3">
            ${stages.map(stage => `
                <div class="col">
                    <div class="pipeline-stage">
                        <div class="pipeline-stage-header">
                            <h6>${stageNames[stage]}</h6>
                            <span class="badge bg-secondary">${currentOpportunities.filter(o => o.stage === stage).length}</span>
                        </div>
                        <div class="pipeline-stage-body" data-stage="${stage}">
                            ${currentOpportunities.filter(o => o.stage === stage).map(opp => createOpportunityCard(opp)).join('')}
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    setupPipelineDragDrop();
}

// Création d'une carte opportunité
function createOpportunityCard(opportunity) {
    const probabilityColor = opportunity.probability >= 80 ? 'success' : opportunity.probability >= 60 ? 'warning' : 'danger';
    
    return `
        <div class="opportunity-card" draggable="true" data-opportunity-id="${opportunity.id}">
            <div class="card mb-2">
                <div class="card-body p-2">
                    <h6 class="card-title mb-1">${opportunity.title}</h6>
                    <p class="text-muted small mb-2">${opportunity.contact} - ${opportunity.company}</p>
                    <div class="d-flex justify-content-between mb-1">
                        <small>€${opportunity.value.toLocaleString('fr-FR')}</small>
                        <small class="text-${probabilityColor}">${opportunity.probability}%</small>
                    </div>
                    <div class="progress" style="height: 3px;">
                        <div class="progress-bar bg-${probabilityColor}" style="width: ${opportunity.probability}%"></div>
                    </div>
                    <small class="text-muted">${new Date(opportunity.closeDate).toLocaleDateString('fr-FR')}</small>
                </div>
            </div>
        </div>
    `;
}

// Configuration du drag & drop pour le pipeline
function setupPipelineDragDrop() {
    const cards = document.querySelectorAll('.opportunity-card');
    const stages = document.querySelectorAll('.pipeline-stage-body');

    cards.forEach(card => {
        card.addEventListener('dragstart', (e) => {
            draggedElement = e.target;
            e.target.style.opacity = '0.5';
        });

        card.addEventListener('dragend', (e) => {
            e.target.style.opacity = '1';
            draggedElement = null;
        });
    });

    stages.forEach(stage => {
        stage.addEventListener('dragover', (e) => {
            e.preventDefault();
            stage.classList.add('pipeline-dragover');
        });

        stage.addEventListener('dragleave', (e) => {
            stage.classList.remove('pipeline-dragover');
        });

        stage.addEventListener('drop', (e) => {
            e.preventDefault();
            stage.classList.remove('pipeline-dragover');
            
            if (draggedElement) {
                const oppId = parseInt(draggedElement.dataset.opportunityId);
                const newStage = stage.dataset.stage;
                
                // Mettre à jour l'opportunité
                const oppIndex = currentOpportunities.findIndex(o => o.id === oppId);
                if (oppIndex !== -1) {
                    currentOpportunities[oppIndex].stage = newStage;
                    stage.appendChild(draggedElement);
                    
                    // Mettre à jour les compteurs
                    updatePipelineCounters();
                    
                    showSuccessAlert(`Opportunité déplacée vers "${newStage}"`);
                }
            }
        });
    });
}

// Mettre à jour les compteurs du pipeline
function updatePipelineCounters() {
    document.querySelectorAll('.pipeline-stage-header .badge').forEach(badge => {
        const stage = badge.closest('.pipeline-stage').querySelector('.pipeline-stage-body').dataset.stage;
        const count = currentOpportunities.filter(o => o.stage === stage).length;
        badge.textContent = count;
    });
}

// Configuration des événements CRM
function setupCRMEventListeners() {
    // Boutons d'action CRM
    document.getElementById('new-contact-btn')?.addEventListener('click', showNewContactModal);
    document.getElementById('new-opportunity-btn')?.addEventListener('click', showNewOpportunityModal);
    
    // Filtres CRM
    document.getElementById('score-filter')?.addEventListener('change', filterContacts);
    document.getElementById('company-filter-crm')?.addEventListener('change', filterContacts);
}

// ============================================
// FONCTIONS DEVIS/FACTURES ENRICHIES
// ============================================

// Variables globales pour la facturation
let currentQuote = {
    id: null,
    number: '',
    client: {},
    lines: [],
    totals: { ht: 0, tva: 0, ttc: 0 }
};

let quoteTemplates = {
    web: {
        name: 'Développement Web',
        lines: [
            { description: 'Analyse et conception', quantity: 1, price: 2500 },
            { description: 'Développement frontend', quantity: 1, price: 5000 },
            { description: 'Développement backend', quantity: 1, price: 4000 },
            { description: 'Tests et déploiement', quantity: 1, price: 1500 }
        ]
    },
    mobile: {
        name: 'Application Mobile',
        lines: [
            { description: 'Design UX/UI', quantity: 1, price: 3000 },
            { description: 'Développement iOS', quantity: 1, price: 6000 },
            { description: 'Développement Android', quantity: 1, price: 6000 },
            { description: 'Tests et publication', quantity: 1, price: 2000 }
        ]
    },
    consulting: {
        name: 'Conseil et Audit',
        lines: [
            { description: 'Audit existant', quantity: 1, price: 1500 },
            { description: 'Analyse des besoins', quantity: 1, price: 2000 },
            { description: 'Recommandations', quantity: 1, price: 1000 },
            { description: 'Plan d\'action', quantity: 1, price: 1500 }
        ]
    },
    maintenance: {
        name: 'Maintenance et Support',
        lines: [
            { description: 'Maintenance préventive', quantity: 12, price: 200 },
            { description: 'Support technique', quantity: 20, price: 100 },
            { description: 'Mises à jour sécurité', quantity: 6, price: 150 }
        ]
    }
};

// Initialisation du module devis/factures
function initInvoicingModule() {
    setupInvoicingEventListeners();
    initializeSignaturePad();
}

// Configuration des événements de facturation
function setupInvoicingEventListeners() {
    // Boutons de template
    document.querySelectorAll('[data-template]')?.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            loadQuoteTemplate(btn.dataset.template);
        });
    });

    // Gestion des lignes de devis
    document.getElementById('add-line-btn')?.addEventListener('click', addQuoteLine);
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-line')) {
            removeQuoteLine(e.target);
        }
    });

    // Calculs automatiques
    document.addEventListener('input', (e) => {
        if (e.target.matches('.quote-quantity, .quote-price')) {
            calculateLine(e.target);
        }
    });

    // Actions sur les devis
    document.getElementById('preview-quote-btn')?.addEventListener('click', previewQuote);
    document.getElementById('save-quote-btn')?.addEventListener('click', saveQuote);
    document.getElementById('send-quote-btn')?.addEventListener('click', sendQuote);
}

// Charger un template de devis
function loadQuoteTemplate(templateName) {
    const template = quoteTemplates[templateName];
    if (!template) return;

    // Vider les lignes existantes
    const tbody = document.querySelector('#quote-lines tbody');
    if (tbody) {
        tbody.innerHTML = '';
        
        // Ajouter les lignes du template
        template.lines.forEach(line => {
            addQuoteLineFromData(line);
        });
        
        calculateTotals();
        showSuccessAlert(`Template "${template.name}" chargé`);
    }
}

// Ajouter une ligne de devis à partir de données
function addQuoteLineFromData(lineData) {
    const tbody = document.querySelector('#quote-lines tbody');
    if (!tbody) return;

    const row = tbody.insertRow();
    row.innerHTML = `
        <td>
            <input type="text" class="form-control form-control-sm" value="${lineData.description}" required>
        </td>
        <td>
            <input type="number" class="form-control form-control-sm quote-quantity" value="${lineData.quantity}" min="0" step="0.01" required>
        </td>
        <td>
            <input type="number" class="form-control form-control-sm quote-price" value="${lineData.price}" min="0" step="0.01" required>
        </td>
        <td class="text-center">20%</td>
        <td>
            <input type="number" class="form-control form-control-sm" value="${(lineData.quantity * lineData.price).toFixed(2)}" readonly>
        </td>
        <td class="text-center">
            <button type="button" class="btn btn-sm btn-outline-danger remove-line">
                <i class="ti ti-trash"></i>
            </button>
        </td>
    `;
}

// Ajouter une ligne de devis vide
function addQuoteLine() {
    addQuoteLineFromData({ description: '', quantity: 1, price: 0 });
}

// Supprimer une ligne de devis
function removeQuoteLine(button) {
    const row = button.closest('tr');
    row.remove();
    calculateTotals();
}

// Calculer une ligne de devis
function calculateLine(element) {
    const row = element.closest('tr');
    const quantity = parseFloat(row.cells[1].querySelector('input').value) || 0;
    const price = parseFloat(row.cells[2].querySelector('input').value) || 0;
    const totalHT = quantity * price;
    
    row.cells[4].querySelector('input').value = totalHT.toFixed(2);
    calculateTotals();
}

// Calculer les totaux du devis
function calculateTotals() {
    const rows = document.querySelectorAll('#quote-lines tbody tr');
    let totalHT = 0;
    
    rows.forEach(row => {
        const lineTotal = parseFloat(row.cells[4].querySelector('input').value) || 0;
        totalHT += lineTotal;
    });
    
    const tva = totalHT * 0.20; // 20% TVA
    const ttc = totalHT + tva;
    
    // Mettre à jour l'affichage
    document.getElementById('total-ht').textContent = totalHT.toFixed(2);
    document.getElementById('total-tva').textContent = tva.toFixed(2);
    document.getElementById('total-ttc').textContent = ttc.toFixed(2);
    
    currentQuote.totals = { ht: totalHT, tva: tva, ttc: ttc };
}

// Prévisualiser le devis
function previewQuote() {
    // Générer le numéro de devis
    const quoteNumber = 'DEV-' + new Date().getFullYear() + '-' + String(Date.now()).slice(-6);
    
    // Collecter les données du devis
    const quoteData = {
        number: quoteNumber,
        date: new Date().toLocaleDateString('fr-FR'),
        client: {
            name: document.getElementById('client-name').value,
            company: document.getElementById('client-company').value,
            email: document.getElementById('client-email').value,
            address: document.getElementById('client-address').value
        },
        lines: [],
        totals: currentQuote.totals
    };
    
    // Collecter les lignes
    document.querySelectorAll('#quote-lines tbody tr').forEach(row => {
        quoteData.lines.push({
            description: row.cells[0].querySelector('input').value,
            quantity: parseFloat(row.cells[1].querySelector('input').value) || 0,
            price: parseFloat(row.cells[2].querySelector('input').value) || 0,
            total: parseFloat(row.cells[4].querySelector('input').value) || 0
        });
    });
    
    // Afficher la modal de prévisualisation
    showQuotePreview(quoteData);
}

// Afficher la prévisualisation du devis
function showQuotePreview(quoteData) {
    const modal = new bootstrap.Modal(document.getElementById('quote-preview-modal'));
    
    // Remplir la prévisualisation
    document.getElementById('preview-quote-number').textContent = quoteData.number;
    document.getElementById('preview-quote-date').textContent = quoteData.date;
    document.getElementById('preview-client-info').innerHTML = `
        <strong>${quoteData.client.name}</strong><br>
        ${quoteData.client.company}<br>
        ${quoteData.client.email}<br>
        ${quoteData.client.address}
    `;
    
    // Lignes du devis
    const linesHtml = quoteData.lines.map(line => `
        <tr>
            <td>${line.description}</td>
            <td class="text-center">${line.quantity}</td>
            <td class="text-end">€${line.price.toFixed(2)}</td>
            <td class="text-end">€${line.total.toFixed(2)}</td>
        </tr>
    `).join('');
    
    document.getElementById('preview-quote-lines').innerHTML = linesHtml;
    
    // Totaux
    document.getElementById('preview-total-ht').textContent = quoteData.totals.ht.toFixed(2);
    document.getElementById('preview-total-tva').textContent = quoteData.totals.tva.toFixed(2);
    document.getElementById('preview-total-ttc').textContent = quoteData.totals.ttc.toFixed(2);
    
    modal.show();
}

// Initialiser le pad de signature
function initializeSignaturePad() {
    const canvas = document.getElementById('signature-canvas');
    if (!canvas) return;

    const signaturePad = new SignaturePad(canvas, {
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        penColor: 'rgb(0, 0, 0)'
    });

    // Boutons de signature
    document.getElementById('clear-signature')?.addEventListener('click', () => {
        signaturePad.clear();
    });

    document.getElementById('save-signature')?.addEventListener('click', () => {
        if (signaturePad.isEmpty()) {
            showErrorAlert('Veuillez signer avant de sauvegarder');
            return;
        }
        
        const signatureData = signaturePad.toDataURL();
        // Ici on sauvegarderait la signature
        showSuccessAlert('Signature sauvegardée');
        
        // Fermer la modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('signature-modal'));
        modal.hide();
    });

    // Redimensionner le canvas
    function resizeCanvas() {
        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        canvas.width = canvas.offsetWidth * ratio;
        canvas.height = canvas.offsetHeight * ratio;
        canvas.getContext('2d').scale(ratio, ratio);
        signaturePad.clear();
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
}

// Sauvegarder le devis
function saveQuote() {
    // Ici on sauvegarderait le devis dans Directus
    showSuccessAlert('Devis sauvegardé avec succès');
}

// Envoyer le devis
function sendQuote() {
    // Ici on enverrait le devis par email
    showSuccessAlert('Devis envoyé au client');
}

// Export des fonctions pour utilisation externe
window.SuperAdminDashboard = {
    loadData: loadDashboardData,
    refresh: loadDashboardData,
    
    // Fonctions projets
    initProjects: initProjectsModule,
    switchProjectView: switchProjectView,
    
    // Fonctions CRM
    initCRM: initEnhancedCRM,
    calculateContactScore: calculateContactScore,
    
    // Fonctions facturation
    initInvoicing: initInvoicingModule,
    loadQuoteTemplate: loadQuoteTemplate,
    calculateTotals: calculateTotals
};