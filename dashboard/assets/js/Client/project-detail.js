/**
 * Project Detail
 * Scripts spécifiques à la page de détail d'un projet
 */

// Données simulées du projet
const projectData = {
    1: {
        name: 'Refonte Site Web Corporate',
        status: 'En cours',
        priority: 'high',
        progress: 65,
        budget: {
            total: 80000,
            consumed: 45200
        },
        startDate: '2024-01-15',
        endDate: '2024-03-30',
        manager: 'Marie D.',
        technologies: ['React', 'Node.js', 'MongoDB'],
        description: 'Refonte complète du site web corporate avec un nouveau design moderne, responsive et optimisé pour le SEO.',
        burndownData: {
            ideal: [100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 0],
            actual: [100, 95, 85, 75, 65, 55, 45, 35]
        },
        timeRepartition: [
            { name: 'Design', value: 25 },
            { name: 'Développement Front-end', value: 35 },
            { name: 'Développement Back-end', value: 20 },
            { name: 'Tests & QA', value: 15 },
            { name: 'Documentation', value: 5 }
        ]
    }
};

// Charts instances
let charts = {};

// Fonction pour charger les détails du projet
function loadProjectDetails(projectId) {
    const project = projectData[projectId] || projectData[1]; // Fallback au projet 1
    
    // Mettre à jour les éléments de la page
    updatePageElements(project);
    
    // Initialiser les graphiques
    setTimeout(() => {
        initProjectCharts(project);
    }, 500);
}

// Mettre à jour les éléments de la page
function updatePageElements(project) {
    // Titre et breadcrumb
    document.getElementById('project-name').textContent = project.name;
    document.getElementById('project-name-breadcrumb').textContent = project.name;
    
    // Mettre à jour la barre de progression principale
    const progressBar = document.querySelector('.progress-bar');
    if (progressBar) {
        progressBar.style.width = project.progress + '%';
    }
    
    // Animer les compteurs
    animateValue('progress-value', 0, project.progress, 1000, '%');
    animateValue('budget-value', 0, project.budget.consumed, 1500, 'CHF ');
    
    // Calculer les jours restants
    const today = new Date();
    const endDate = new Date(project.endDate);
    const daysRemaining = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
    animateValue('days-remaining', 0, daysRemaining, 1000);
}

// Fonction d'animation des valeurs
function animateValue(elementId, start, end, duration, prefix = '', suffix = '') {
    const element = document.querySelector(`#${elementId}, .h1:contains("${prefix}")`);
    if (!element) return;
    
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
            current = end;
            clearInterval(timer);
        }
        
        let displayValue = Math.floor(current);
        if (prefix === 'CHF ') {
            displayValue = displayValue.toLocaleString('fr-CH');
        }
        
        element.textContent = prefix + displayValue + suffix;
    }, 16);
}

// Initialiser les graphiques du projet
function initProjectCharts(project) {
    // Burndown Chart
    const burndownOptions = {
        series: [{
            name: 'Idéal',
            data: project.burndownData.ideal
        }, {
            name: 'Réel',
            data: project.burndownData.actual
        }],
        chart: {
            type: 'line',
            height: 250,
            toolbar: {
                show: false
            }
        },
        colors: ['#e0e0e0', '#206bc4'],
        stroke: {
            curve: 'smooth',
            width: [2, 3],
            dashArray: [5, 0]
        },
        xaxis: {
            categories: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6', 'Sem 7', 'Sem 8', 'Sem 9', 'Sem 10', 'Sem 11'],
            labels: {
                style: {
                    fontSize: '11px'
                }
            }
        },
        yaxis: {
            title: {
                text: 'Points restants'
            },
            min: 0,
            max: 100
        },
        legend: {
            position: 'top',
            horizontalAlign: 'right'
        },
        tooltip: {
            y: {
                formatter: function(val) {
                    return val + ' points';
                }
            }
        }
    };
    
    const burndownEl = document.querySelector("#chart-burndown");
    if (burndownEl) {
        charts.burndown = new ApexCharts(burndownEl, burndownOptions);
        charts.burndown.render();
    }
    
    // Time Repartition Chart
    const timeRepartitionOptions = {
        series: [{
            data: project.timeRepartition.map(item => ({
                x: item.name,
                y: item.value
            }))
        }],
        chart: {
            type: 'treemap',
            height: 300,
            toolbar: {
                show: false
            }
        },
        colors: ['#206bc4', '#2fb344', '#f76707', '#f59f00', '#ae3ec9'],
        dataLabels: {
            enabled: true,
            style: {
                fontSize: '12px'
            },
            formatter: function(text, op) {
                return [text, op.value + '%'];
            }
        },
        plotOptions: {
            treemap: {
                distributed: true,
                enableShades: false
            }
        },
        tooltip: {
            y: {
                formatter: function(val) {
                    return val + '% du temps total';
                }
            }
        }
    };
    
    const timeRepartitionEl = document.querySelector("#chart-time-repartition");
    if (timeRepartitionEl) {
        charts.timeRepartition = new ApexCharts(timeRepartitionEl, timeRepartitionOptions);
        charts.timeRepartition.render();
    }
    
    // Budget Pie Chart
    const budgetPieOptions = {
        series: [
            project.budget.consumed,
            project.budget.total - project.budget.consumed
        ],
        chart: {
            type: 'donut',
            height: 300
        },
        labels: ['Consommé', 'Restant'],
        colors: ['#206bc4', '#e0e0e0'],
        plotOptions: {
            pie: {
                donut: {
                    size: '70%',
                    labels: {
                        show: true,
                        total: {
                            show: true,
                            label: 'Budget Total',
                            formatter: function() {
                                return 'CHF ' + project.budget.total.toLocaleString('fr-CH');
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
            position: 'bottom'
        },
        tooltip: {
            y: {
                formatter: function(val) {
                    return 'CHF ' + val.toLocaleString('fr-CH');
                }
            }
        }
    };
    
    const budgetPieEl = document.querySelector("#chart-budget-pie");
    if (budgetPieEl) {
        charts.budgetPie = new ApexCharts(budgetPieEl, budgetPieOptions);
        charts.budgetPie.render();
    }
    
    // Budget Evolution Chart
    const budgetEvolutionOptions = {
        series: [{
            name: 'Dépenses cumulées',
            data: [0, 8000, 15000, 22000, 28000, 35000, 42000, 45200]
        }, {
            name: 'Budget prévu',
            data: [0, 10000, 20000, 30000, 40000, 50000, 60000, 70000]
        }],
        chart: {
            type: 'area',
            height: 300,
            toolbar: {
                show: false
            }
        },
        colors: ['#206bc4', '#e0e0e0'],
        stroke: {
            curve: 'smooth',
            width: 2
        },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.4,
                opacityTo: 0.1,
                stops: [0, 90, 100]
            }
        },
        xaxis: {
            categories: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août'],
            labels: {
                style: {
                    fontSize: '11px'
                }
            }
        },
        yaxis: {
            title: {
                text: 'CHF'
            },
            labels: {
                formatter: function(val) {
                    return 'CHF ' + (val/1000).toFixed(0) + 'k';
                }
            }
        },
        tooltip: {
            y: {
                formatter: function(val) {
                    return 'CHF ' + val.toLocaleString('fr-CH');
                }
            }
        }
    };
    
    const budgetEvolutionEl = document.querySelector("#chart-budget-evolution");
    if (budgetEvolutionEl) {
        charts.budgetEvolution = new ApexCharts(budgetEvolutionEl, budgetEvolutionOptions);
        charts.budgetEvolution.render();
    }
}

// Gestion des onglets
document.addEventListener('DOMContentLoaded', function() {
    // Initialiser les tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Gérer les checkboxes des tâches
    document.querySelectorAll('.form-check-input').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const row = this.closest('.list-group-item, tr');
            if (this.checked) {
                row.style.opacity = '0.6';
                row.style.textDecoration = 'line-through';
            } else {
                row.style.opacity = '1';
                row.style.textDecoration = 'none';
            }
        });
    });
    
    // Animation des timeline items
    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-20px)';
        setTimeout(() => {
            item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            item.style.opacity = '1';
            item.style.transform = 'translateX(0)';
        }, index * 100);
    });
});