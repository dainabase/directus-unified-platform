// Configuration des graphiques
class DashboardCharts {
    constructor() {
        this.charts = {};
        this.initCharts();
    }
    
    initCharts() {
        // Mini graphique CA
        this.createSparkline('revenue-sparkline', {
            data: [245, 267, 289, 312, 298, 345, 378, 401, 389, 425, 445, 467],
            color: '#6366F1'
        });
        
        // Gauge de marge
        this.createGauge('margin-gauge', {
            value: 18.7,
            max: 30,
            target: 20
        });
        
        // Mini graphique trésorerie
        this.createSparkline('cash-sparkline', {
            data: [780, 810, 795, 830, 865, 892],
            color: '#10B981',
            type: 'area'
        });
        
        // Mini barres clients
        this.createSparkline('clients-sparkline', {
            data: [12, 18, 23, 31, 28, 35, 42, 47],
            color: '#F59E0B',
            type: 'bar'
        });
        
        // Graphique principal CA
        this.createRevenueChart();
        
        // Donut répartition
        this.createCompaniesDonut();
        
        // Cash flow prévisionnel
        this.createCashflowChart();
        
        // Pipeline commercial
        this.createPipelineChart();
        
        // Heatmap activité
        this.createActivityHeatmap();
    }
    
    createSparkline(elementId, config) {
        const options = {
            series: [{
                data: config.data
            }],
            chart: {
                type: config.type || 'line',
                height: 40,
                sparkline: {
                    enabled: true
                }
            },
            stroke: {
                curve: 'smooth',
                width: 2
            },
            fill: {
                opacity: config.type === 'area' ? 0.3 : 1
            },
            colors: [config.color]
        };
        
        this.charts[elementId] = new ApexCharts(
            document.querySelector(`#${elementId}`), 
            options
        );
        this.charts[elementId].render();
    }
    
    createGauge(elementId, config) {
        const options = {
            series: [config.value],
            chart: {
                height: 120,
                type: 'radialBar'
            },
            plotOptions: {
                radialBar: {
                    hollow: {
                        size: '65%'
                    },
                    track: {
                        background: '#F3F4F6'
                    },
                    dataLabels: {
                        name: {
                            show: false
                        },
                        value: {
                            fontSize: '16px',
                            fontWeight: 600,
                            formatter: val => val + '%'
                        }
                    }
                }
            },
            colors: [config.value >= config.target ? '#10B981' : '#F59E0B']
        };
        
        this.charts[elementId] = new ApexCharts(
            document.querySelector(`#${elementId}`), 
            options
        );
        this.charts[elementId].render();
    }
    
    createRevenueChart() {
        const options = {
            series: [
                {
                    name: 'HyperVisual',
                    data: [120, 135, 148, 162, 178, 195, 210, 232, 258, 289, 312, 345]
                },
                {
                    name: 'Dynamics',
                    data: [180, 195, 210, 228, 245, 267, 289, 312, 345, 378, 412, 445]
                },
                {
                    name: 'Lexia',
                    data: [90, 98, 105, 112, 123, 134, 145, 158, 172, 189, 205, 223]
                },
                {
                    name: 'NKReality',
                    data: [250, 278, 298, 325, 358, 389, 425, 467, 512, 567, 623, 689]
                },
                {
                    name: 'Etekout',
                    data: [45, 52, 58, 63, 69, 74, 78, 82, 85, 87, 88, 89]
                }
            ],
            chart: {
                type: 'area',
                height: 350,
                stacked: true,
                toolbar: {
                    show: true,
                    tools: {
                        download: true,
                        selection: true,
                        zoom: true,
                        zoomin: true,
                        zoomout: true,
                        pan: true
                    }
                }
            },
            dataLabels: {
                enabled: false
            },
            stroke: {
                curve: 'smooth',
                width: 2
            },
            fill: {
                type: 'gradient',
                gradient: {
                    opacityFrom: 0.6,
                    opacityTo: 0.1
                }
            },
            legend: {
                position: 'top',
                horizontalAlign: 'left'
            },
            xaxis: {
                categories: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 
                            'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc']
            },
            colors: ['#6366F1', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B']
        };
        
        this.charts.revenue = new ApexCharts(
            document.querySelector("#revenue-chart"), 
            options
        );
        this.charts.revenue.render();
    }
    
    createCompaniesDonut() {
        const options = {
            series: [445, 623, 223, 689, 89],
            chart: {
                type: 'donut',
                height: 350
            },
            labels: ['HyperVisual', 'Dynamics', 'Lexia', 'NKReality', 'Etekout'],
            colors: ['#6366F1', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B'],
            plotOptions: {
                pie: {
                    donut: {
                        size: '65%',
                        labels: {
                            show: true,
                            name: {
                                fontSize: '14px',
                                fontWeight: 600
                            },
                            value: {
                                fontSize: '16px',
                                fontWeight: 700,
                                formatter: val => '€' + val + 'K'
                            },
                            total: {
                                show: true,
                                label: 'Total',
                                formatter: () => '€2.07M'
                            }
                        }
                    }
                }
            },
            legend: {
                position: 'bottom'
            }
        };
        
        this.charts.donut = new ApexCharts(
            document.querySelector("#companies-donut"), 
            options
        );
        this.charts.donut.render();
    }
    
    createCashflowChart() {
        const options = {
            series: [{
                name: 'Entrées',
                data: [145, 167, 189, 212, 234, 256]
            }, {
                name: 'Sorties',
                data: [-123, -145, -156, -178, -189, -201]
            }],
            chart: {
                type: 'bar',
                height: 250,
                stacked: false,
                toolbar: {
                    show: false
                }
            },
            plotOptions: {
                bar: {
                    horizontal: false,
                    columnWidth: '55%'
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
                categories: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin']
            },
            fill: {
                opacity: 1
            },
            colors: ['#10B981', '#EF4444']
        };
        
        this.charts.cashflow = new ApexCharts(
            document.querySelector("#cashflow-chart"), 
            options
        );
        this.charts.cashflow.render();
    }
    
    createPipelineChart() {
        const options = {
            series: [{
                name: 'Pipeline',
                data: [
                    { x: 'Prospects', y: 234 },
                    { x: 'Qualifiés', y: 156 },
                    { x: 'Propositions', y: 89 },
                    { x: 'Négociations', y: 45 },
                    { x: 'Signés', y: 23 }
                ]
            }],
            chart: {
                type: 'bar',
                height: 250,
                toolbar: {
                    show: false
                }
            },
            plotOptions: {
                bar: {
                    horizontal: true,
                    distributed: true,
                    barHeight: '60%'
                }
            },
            dataLabels: {
                enabled: true,
                formatter: val => val + ' deals'
            },
            colors: ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981'],
            xaxis: {
                labels: {
                    show: false
                }
            }
        };
        
        this.charts.pipeline = new ApexCharts(
            document.querySelector("#pipeline-chart"), 
            options
        );
        this.charts.pipeline.render();
    }
    
    createActivityHeatmap() {
        // Générer des données pour les 30 derniers jours
        const data = [];
        const categories = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
        
        for (let week = 0; week < 5; week++) {
            for (let day = 0; day < 7; day++) {
                data.push({
                    x: categories[day],
                    y: Math.floor(Math.random() * 100)
                });
            }
        }
        
        const options = {
            series: [
                { name: 'Sem 1', data: data.slice(0, 7) },
                { name: 'Sem 2', data: data.slice(7, 14) },
                { name: 'Sem 3', data: data.slice(14, 21) },
                { name: 'Sem 4', data: data.slice(21, 28) }
            ],
            chart: {
                height: 250,
                type: 'heatmap',
                toolbar: {
                    show: false
                }
            },
            dataLabels: {
                enabled: false
            },
            colors: ["#6366F1"],
            xaxis: {
                type: 'category'
            }
        };
        
        this.charts.heatmap = new ApexCharts(
            document.querySelector("#activity-heatmap"), 
            options
        );
        this.charts.heatmap.render();
    }
    
    // Méthode pour rafraîchir les données
    updateData() {
        // Simulation de mise à jour des données
        // Dans la vraie app, on ferait un appel API ici
        
        // Mise à jour du graphique principal
        this.charts.revenue.updateSeries([
            {
                name: 'HyperVisual',
                data: [125, 140, 153, 167, 183, 200, 215, 237, 263, 294, 317, 350]
            },
            // ... autres séries
        ]);
    }
}

// Initialiser les graphiques au chargement
document.addEventListener('DOMContentLoaded', () => {
    window.dashboardCharts = new DashboardCharts();
    
    // Rafraîchir toutes les 30 secondes
    setInterval(() => {
        window.dashboardCharts.updateData();
    }, 30000);
});