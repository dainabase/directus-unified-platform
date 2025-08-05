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

// Export des fonctions pour utilisation externe
window.SuperAdminDashboard = {
    loadData: loadDashboardData,
    refresh: loadDashboardData
};