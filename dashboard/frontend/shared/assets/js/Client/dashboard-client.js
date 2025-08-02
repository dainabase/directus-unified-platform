/**
 * Dashboard Client
 * Scripts spécifiques au dashboard de l'espace client
 */

// Données simulées pour les graphiques
const dashboardData = {
    // Données pour le graphique de progression des projets
    projectsData: {
        series: [{
            name: 'Progression',
            data: [65, 15, 45]
        }],
        labels: ['Refonte Site Web', 'App Mobile', 'Migration CRM']
    },
    
    // Données pour le graphique de répartition du budget
    budgetData: {
        series: [35000, 25000, 20000],
        labels: ['Développement', 'Design', 'Marketing']
    },
    
    // Données pour les sparklines
    sparklineData: {
        projects: [2, 3, 4, 3, 5, 4, 3],
        budget: [30, 40, 45, 50, 49, 60, 56]
    },
    
    // KPIs
    kpis: {
        projects: 3,
        tasks: 12,
        budget: 45230,
        messages: 5
    }
};

// Configuration des graphiques
const chartConfigs = {
    // Configuration du graphique de progression des projets
    projectsProgress: {
        chart: {
            type: 'bar',
            height: 350,
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
                return val + "%";
            },
            offsetX: 0,
            dropShadow: {
                enabled: false
            }
        },
        colors: ['#2fb344', '#f76707', '#d63939'],
        xaxis: {
            categories: dashboardData.projectsData.labels,
            max: 100,
            labels: {
                formatter: function(val) {
                    return val + "%";
                }
            }
        },
        yaxis: {
            labels: {
                style: {
                    fontSize: '12px'
                }
            }
        },
        tooltip: {
            theme: 'dark',
            x: {
                show: false
            },
            y: {
                title: {
                    formatter: function() {
                        return 'Progression:';
                    }
                },
                formatter: function(val) {
                    return val + "%";
                }
            }
        },
        legend: {
            show: false
        }
    },
    
    // Configuration du graphique de répartition du budget
    budgetDistribution: {
        chart: {
            type: 'donut',
            height: 300
        },
        series: dashboardData.budgetData.series,
        labels: dashboardData.budgetData.labels,
        colors: ['#206bc4', '#2fb344', '#f76707'],
        plotOptions: {
            pie: {
                donut: {
                    size: '70%',
                    labels: {
                        show: true,
                        total: {
                            show: true,
                            label: 'Total',
                            formatter: function(w) {
                                const total = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                                return 'CHF ' + total.toLocaleString('fr-CH');
                            }
                        }
                    }
                }
            }
        },
        dataLabels: {
            enabled: false
        },
        legend: {
            show: false
        },
        tooltip: {
            y: {
                formatter: function(val) {
                    return 'CHF ' + val.toLocaleString('fr-CH');
                }
            }
        }
    },
    
    // Configuration des sparklines
    sparklineProjects: {
        chart: {
            type: 'line',
            height: 50,
            sparkline: {
                enabled: true
            }
        },
        series: [{
            data: dashboardData.sparklineData.projects
        }],
        stroke: {
            width: 2,
            curve: 'smooth'
        },
        colors: ['#206bc4'],
        tooltip: {
            enabled: false
        }
    },
    
    sparklineBudget: {
        chart: {
            type: 'radialBar',
            height: 80,
            sparkline: {
                enabled: true
            }
        },
        series: [56],
        plotOptions: {
            radialBar: {
                hollow: {
                    margin: 0,
                    size: '50%'
                },
                dataLabels: {
                    show: false
                }
            }
        },
        colors: ['#f76707']
    }
};

// Graphiques initialisés
let charts = {};

// Fonction pour animer les compteurs
function animateCounter(elementId, targetValue, duration = 1000, prefix = '', suffix = '') {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const startValue = 0;
    const increment = targetValue / (duration / 16); // 60 FPS
    let currentValue = startValue;
    
    const timer = setInterval(() => {
        currentValue += increment;
        if (currentValue >= targetValue) {
            currentValue = targetValue;
            clearInterval(timer);
        }
        
        // Formater la valeur selon le type
        let displayValue = Math.floor(currentValue);
        if (prefix === 'CHF ') {
            displayValue = displayValue.toLocaleString('fr-CH');
        }
        
        element.textContent = prefix + displayValue + suffix;
    }, 16);
}

// Fonction pour initialiser les graphiques du dashboard
function initDashboardCharts() {
    // Graphique de progression des projets
    const projectsChartEl = document.querySelector("#chart-projects-progress");
    if (projectsChartEl) {
        charts.projectsProgress = new ApexCharts(projectsChartEl, {
            ...chartConfigs.projectsProgress,
            series: dashboardData.projectsData.series
        });
        charts.projectsProgress.render();
    }
    
    // Graphique de répartition du budget
    const budgetChartEl = document.querySelector("#chart-budget-distribution");
    if (budgetChartEl) {
        charts.budgetDistribution = new ApexCharts(budgetChartEl, chartConfigs.budgetDistribution);
        charts.budgetDistribution.render();
    }
    
    // Sparkline projets
    const sparklineProjectsEl = document.querySelector("#sparkline-projects");
    if (sparklineProjectsEl) {
        charts.sparklineProjects = new ApexCharts(sparklineProjectsEl, chartConfigs.sparklineProjects);
        charts.sparklineProjects.render();
    }
    
    // Sparkline budget (donut mini)
    const sparklineBudgetEl = document.querySelector("#sparkline-budget");
    if (sparklineBudgetEl) {
        charts.sparklineBudget = new ApexCharts(sparklineBudgetEl, chartConfigs.sparklineBudget);
        charts.sparklineBudget.render();
    }
}

// Fonction pour rafraîchir le dashboard
function refreshDashboard() {
    console.log('🔄 Rafraîchissement du dashboard...');
    
    // Simuler de nouvelles données
    const newData = {
        projects: Math.floor(Math.random() * 2) + dashboardData.kpis.projects,
        tasks: Math.floor(Math.random() * 5) + dashboardData.kpis.tasks,
        budget: dashboardData.kpis.budget + Math.floor(Math.random() * 5000),
        messages: Math.floor(Math.random() * 3) + dashboardData.kpis.messages
    };
    
    // Mettre à jour les compteurs
    animateCounter('projects-count', newData.projects, 500);
    animateCounter('tasks-count', newData.tasks, 500);
    animateCounter('budget-amount', newData.budget, 500, 'CHF ');
    animateCounter('messages-count', newData.messages, 500);
    
    // Afficher une notification
    if (window.PortalApp && window.PortalApp.showToast) {
        window.PortalApp.showToast('Dashboard mis à jour', 'info', 2000);
    }
}

// Fonction principale pour charger les données du dashboard
if (window.PortalApp) {
    window.PortalApp.loadDashboardData = function() {
        console.log('📊 Chargement des données du dashboard client...');
        
        // Animer les compteurs KPI
        setTimeout(() => {
            animateCounter('projects-count', dashboardData.kpis.projects, 1000);
            animateCounter('tasks-count', dashboardData.kpis.tasks, 1000);
            animateCounter('budget-amount', dashboardData.kpis.budget, 1500, 'CHF ');
            animateCounter('messages-count', dashboardData.kpis.messages, 1000);
        }, 500);
        
        // Initialiser les graphiques
        setTimeout(() => {
            initDashboardCharts();
        }, 1000);
        
        // Auto-refresh toutes les 30 secondes (simulation)
        setInterval(refreshDashboard, 30000);
    };
}

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', function() {
    // Ajouter des animations aux cards
    const cards = document.querySelectorAll('.stat-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });
    
    // Gérer les tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
});