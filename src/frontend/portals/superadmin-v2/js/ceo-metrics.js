class CEODashboard {
    constructor() {
        this.charts = {};
        this.alertThresholds = {
            cashRunway: 6, // mois
            ebitdaMargin: 15, // %
            ltvCacRatio: 3.0,
            npsScore: 30,
            churnRate: 10 // % mensuel
        };
        
        this.init();
    }
    
    init() {
        this.loadCriticalMetrics();
        this.initializeSparklines();
        this.createHeatMap();
        this.createWaterfallChart();
        this.createPipelineVelocity();
        this.createCashFlowForecast();
        this.createROIComparison();
        this.initializeAlerts();
        this.startRealTimeUpdates();
    }
    
    loadCriticalMetrics() {
        // Simuler chargement depuis API
        const metrics = {
            cashRunway: 4.2,
            burnRate: 245000,
            arr: 7200000,
            mrr: 623000,
            ebitdaMargin: 18.7,
            ltv: 4200,
            cac: 1500,
            nps: 52
        };
        
        // Vérifier les seuils critiques
        this.checkThresholds(metrics);
    }
    
    checkThresholds(metrics) {
        const alerts = [];
        
        if (metrics.cashRunway < this.alertThresholds.cashRunway) {
            alerts.push({
                level: metrics.cashRunway < 3 ? 'critical' : 'warning',
                message: `Cash runway: ${metrics.cashRunway} mois`,
                action: 'Bridge financing needed'
            });
        }
        
        if (metrics.ebitdaMargin < this.alertThresholds.ebitdaMargin) {
            alerts.push({
                level: 'warning',
                message: `EBITDA margin sous objectif: ${metrics.ebitdaMargin}%`,
                action: 'Cost optimization review'
            });
        }
        
        const ltvCac = metrics.ltv / metrics.cac;
        if (ltvCac < this.alertThresholds.ltvCacRatio) {
            alerts.push({
                level: 'warning',
                message: `LTV:CAC ratio: ${ltvCac.toFixed(1)}:1`,
                action: 'Unit economics review'
            });
        }
        
        this.displayAlerts(alerts);
    }
    
    initializeSparklines() {
        // Cash sparkline - tendance décroissante
        this.createSparkline('cash-sparkline', {
            data: [892, 834, 756, 689, 612, 534, 467, 389, 312, 245],
            color: '#EF4444',
            type: 'area'
        });
        
        // ARR sparkline - croissance
        this.createSparkline('arr-sparkline', {
            data: [5.2, 5.5, 5.8, 6.1, 6.3, 6.6, 6.8, 7.0, 7.2],
            color: '#10B981',
            type: 'line'
        });
    }
    
    createSparkline(elementId, config) {
        const options = {
            series: [{
                data: config.data
            }],
            chart: {
                type: config.type || 'line',
                height: 30,
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
    
    createWaterfallChart() {
        const options = {
            series: [{
                name: 'EBITDA',
                data: [
                    { x: 'Q4 2024', y: 2100000 },
                    { x: 'Volume Growth', y: 500000 },
                    { x: 'Price Increase', y: 300000 },
                    { x: 'New Products', y: 400000 },
                    { x: 'Cost Savings', y: 200000 },
                    { x: 'FX Impact', y: -100000 },
                    { x: 'One-time Costs', y: -200000 },
                    { x: 'Q1 2025 Total', y: 3200000, isSum: true }
                ]
            }],
            chart: {
                type: 'bar',
                height: 350,
                toolbar: {
                    show: false
                }
            },
            plotOptions: {
                bar: {
                    horizontal: false,
                    columnWidth: '65%'
                }
            },
            dataLabels: {
                enabled: true,
                formatter: function(val) {
                    return val ? '€' + (Math.abs(val) / 1000000).toFixed(1) + 'M' : '';
                }
            },
            colors: function({ value, seriesIndex, dataPointIndex, w }) {
                if (dataPointIndex === 0 || dataPointIndex === 7) return '#3B82F6';
                return value < 0 ? '#EF4444' : '#10B981';
            },
            xaxis: {
                type: 'category',
                labels: {
                    rotate: -45
                }
            },
            yaxis: {
                title: {
                    text: 'EBITDA (€)'
                },
                labels: {
                    formatter: function(val) {
                        return '€' + (val / 1000000).toFixed(1) + 'M';
                    }
                }
            }
        };
        
        this.charts.waterfall = new ApexCharts(
            document.querySelector("#ebitda-waterfall"),
            options
        );
        this.charts.waterfall.render();
    }
    
    createPipelineVelocity() {
        const options = {
            series: [{
                name: 'Pipeline',
                data: [
                    { x: 'Leads', y: 450 },
                    { x: 'MQL', y: 234 },
                    { x: 'SQL', y: 156 },
                    { x: 'Opportunity', y: 89 },
                    { x: 'Negotiation', y: 45 },
                    { x: 'Closed Won', y: 23 }
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
                    barHeight: '70%',
                    dataLabels: {
                        position: 'bottom'
                    }
                }
            },
            colors: ['#6366F1', '#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE', '#10B981'],
            dataLabels: {
                enabled: true,
                textAnchor: 'start',
                formatter: (val, opt) => {
                    const percentage = opt.dataPointIndex > 0 ? 
                        Math.round(val / opt.w.config.series[0].data[opt.dataPointIndex - 1].y * 100) : 100;
                    return `${val} (${percentage}%)`;
                },
                offsetX: 0
            },
            xaxis: {
                labels: {
                    show: false
                }
            },
            tooltip: {
                y: {
                    formatter: (val, opt) => {
                        const conversionRate = opt.dataPointIndex > 0 ? 
                            Math.round(val / opt.w.config.series[0].data[0].y * 100) : 100;
                        return `${val} deals (${conversionRate}% du total)`;
                    }
                }
            }
        };
        
        this.charts.pipeline = new ApexCharts(
            document.querySelector("#pipeline-velocity"),
            options
        );
        this.charts.pipeline.render();
    }
    
    createCashFlowForecast() {
        const options = {
            series: [
                {
                    name: 'Best Case',
                    data: [245, 198, 156, 189, 234, 267]
                },
                {
                    name: 'Likely',
                    data: [245, 178, 123, 145, 189, 212]
                },
                {
                    name: 'Worst Case',
                    data: [245, 156, 89, 45, -23, -89]
                }
            ],
            chart: {
                type: 'line',
                height: 300,
                toolbar: {
                    show: false
                }
            },
            stroke: {
                width: [2, 3, 2],
                curve: 'smooth',
                dashArray: [5, 0, 5]
            },
            colors: ['#10B981', '#3B82F6', '#EF4444'],
            xaxis: {
                categories: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin']
            },
            yaxis: {
                title: {
                    text: 'Cash (K€)'
                },
                min: -100,
                labels: {
                    formatter: (val) => '€' + val + 'K'
                }
            },
            grid: {
                borderColor: '#f1f1f1',
                yaxis: {
                    lines: {
                        show: true
                    }
                }
            },
            annotations: {
                yaxis: [{
                    y: 0,
                    borderColor: '#EF4444',
                    strokeDashArray: 0,
                    label: {
                        borderColor: '#EF4444',
                        style: {
                            color: '#fff',
                            background: '#EF4444'
                        },
                        text: 'Seuil critique'
                    }
                }]
            },
            legend: {
                position: 'top',
                horizontalAlign: 'right'
            }
        };
        
        this.charts.cashflow = new ApexCharts(
            document.querySelector("#cashflow-forecast"),
            options
        );
        this.charts.cashflow.render();
    }
    
    createROIComparison() {
        const options = {
            series: [{
                name: 'MOIC',
                data: [
                    { x: 'NKReality', y: 4.1 },
                    { x: 'Dynamics', y: 3.2 },
                    { x: 'HyperVisual', y: 2.8 },
                    { x: 'Lexia', y: 2.1 },
                    { x: 'Etekout', y: 0.9 }
                ]
            }],
            chart: {
                type: 'bar',
                height: 300,
                toolbar: {
                    show: false
                }
            },
            plotOptions: {
                bar: {
                    horizontal: true,
                    distributed: true,
                    barHeight: '70%'
                }
            },
            colors: function({ value }) {
                if (value >= 3) return '#10B981';
                if (value >= 2) return '#3B82F6';
                if (value >= 1) return '#F59E0B';
                return '#EF4444';
            },
            dataLabels: {
                enabled: true,
                formatter: (val) => `${val}x`,
                style: {
                    fontSize: '14px',
                    fontWeight: 'bold'
                }
            },
            xaxis: {
                title: {
                    text: 'Multiple on Invested Capital (MOIC)'
                },
                labels: {
                    formatter: (val) => val + 'x'
                }
            },
            yaxis: {
                labels: {
                    style: {
                        fontSize: '12px',
                        fontWeight: 600
                    }
                }
            },
            annotations: {
                xaxis: [{
                    x: 2.0,
                    borderColor: '#3B82F6',
                    strokeDashArray: 4,
                    label: {
                        text: 'Target: 2.0x',
                        style: {
                            color: '#fff',
                            background: '#3B82F6'
                        }
                    }
                }]
            },
            tooltip: {
                y: {
                    formatter: (val) => {
                        const profit = ((val - 1) * 100).toFixed(0);
                        return `ROI: ${val}x (${profit}% de profit)`;
                    }
                }
            }
        };
        
        this.charts.roi = new ApexCharts(
            document.querySelector("#roi-comparison"),
            options
        );
        this.charts.roi.render();
    }
    
    createHeatMap() {
        // EBITDA Gauge
        this.createGauge('ebitda-gauge', {
            value: 18.7,
            max: 30,
            target: 25
        });
        
        // NPS Indicator
        const npsEl = document.querySelector('#nps-indicator');
        if (npsEl) {
            npsEl.innerHTML = `
                <div style="display: flex; gap: 4px; margin-top: 4px;">
                    <div style="width: 30px; height: 6px; background: #10B981; border-radius: 3px;"></div>
                    <div style="width: 20px; height: 6px; background: #F59E0B; border-radius: 3px;"></div>
                    <div style="width: 10px; height: 6px; background: #EF4444; border-radius: 3px;"></div>
                </div>
            `;
        }
    }
    
    createGauge(elementId, config) {
        const options = {
            series: [config.value],
            chart: {
                height: 80,
                type: 'radialBar'
            },
            plotOptions: {
                radialBar: {
                    hollow: {
                        size: '55%'
                    },
                    track: {
                        background: '#F3F4F6'
                    },
                    dataLabels: {
                        name: {
                            show: false
                        },
                        value: {
                            fontSize: '14px',
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
    
    displayAlerts(alerts) {
        // Actualiser le panneau d'alertes
        const container = document.querySelector('.alerts-priority');
        
        alerts.forEach(alert => {
            console.log(`${alert.level.toUpperCase()}: ${alert.message}`);
            // Envoyer notification si critique
            if (alert.level === 'critical') {
                this.sendNotification(alert);
            }
        });
    }
    
    sendNotification(alert) {
        // Intégration avec système de notification
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Alerte Critique Dashboard CEO', {
                body: alert.message,
                icon: '/favicon.ico',
                requireInteraction: true
            });
        }
    }
    
    initializeAlerts() {
        // Gérer les clics sur les boutons d'action
        document.querySelectorAll('.btn-action').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.textContent;
                console.log('Action clicked:', action);
                
                // Simuler ouverture de modal ou navigation
                switch(action) {
                    case 'Bridge Financing':
                        this.openFinancingModal();
                        break;
                    case 'Cost Reduction Plan':
                        this.openCostReductionPlan();
                        break;
                    case 'Customer Success Review':
                        this.openCustomerReview();
                        break;
                    case 'Voir Due Diligence':
                        this.openDueDiligence();
                        break;
                }
            });
        });
    }
    
    openFinancingModal() {
        alert('Ouverture du module de Bridge Financing...');
    }
    
    openCostReductionPlan() {
        alert('Ouverture du plan de réduction des coûts...');
    }
    
    openCustomerReview() {
        alert('Ouverture de la revue Customer Success...');
    }
    
    openDueDiligence() {
        alert('Ouverture du dossier Due Diligence...');
    }
    
    startRealTimeUpdates() {
        // Mise à jour toutes les 30 secondes pour les métriques critiques
        setInterval(() => {
            this.loadCriticalMetrics();
        }, 30000);
        
        // Mise à jour toutes les 5 minutes pour les graphiques
        setInterval(() => {
            this.updateCharts();
        }, 300000);
    }
    
    updateCharts() {
        // Rafraîchir les données des graphiques
        console.log('Updating charts with fresh data...');
        
        // Simuler mise à jour du cash runway
        const newCashData = [245, 223, 201, 178, 156, 134, 112, 89, 67, 45];
        this.charts['cash-sparkline'].updateSeries([{
            data: newCashData
        }]);
    }
}

// Initialiser au chargement
document.addEventListener('DOMContentLoaded', () => {
    // Charger ApexCharts si pas déjà présent
    if (typeof ApexCharts === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/apexcharts@latest/dist/apexcharts.min.js';
        script.onload = () => {
            window.ceoDashboard = new CEODashboard();
        };
        document.head.appendChild(script);
    } else {
        window.ceoDashboard = new CEODashboard();
    }
    
    // Demander permission notifications
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
});