/**
 * Performance Analytics
 * Analyse détaillée des performances avec graphiques et recommandations IA
 */

class PerformanceAnalytics {
    constructor() {
        this.currentPeriod = 'month';
        this.charts = {};
        this.performanceData = {
            global: 95,
            criteria: {
                quality: 96,
                deadlines: 94,
                communication: 92,
                technical: 98,
                satisfaction: 95
            },
            trends: this.generateTrendsData(),
            comparison: {
                vsAverage: {
                    global: 10.5,
                    speed: 15.2,
                    satisfaction: 8.7,
                    complexity: 2.1
                },
                ranking: 2,
                totalProviders: 156
            }
        };
    }
    
    init() {
        console.log('📊 Initialisation Performance Analytics');
        this.initCharts();
        this.initEventListeners();
        this.animateMetrics();
        this.loadPeriodData(this.currentPeriod);
    }
    
    // Initialisation des graphiques
    initCharts() {
        this.initPerformanceGauge();
        this.initPerformanceRadar();
        this.initPerformanceTrends();
    }
    
    // Gauge de performance globale
    initPerformanceGauge() {
        const options = {
            chart: {
                type: 'radialBar',
                height: 320,
                fontFamily: 'inherit'
            },
            series: [this.performanceData.global],
            plotOptions: {
                radialBar: {
                    hollow: {
                        size: '70%',
                        margin: 15,
                        background: 'transparent'
                    },
                    track: {
                        background: '#e9ecef',
                        strokeWidth: '100%'
                    },
                    dataLabels: {
                        show: true,
                        name: {
                            offsetY: -10,
                            show: true,
                            color: '#888',
                            fontSize: '14px'
                        },
                        value: {
                            formatter: function(val) {
                                return val + '/100';
                            },
                            color: '#111',
                            fontSize: '36px',
                            fontWeight: '600',
                            show: true,
                            offsetY: 10
                        }
                    }
                }
            },
            fill: {
                type: 'gradient',
                gradient: {
                    shade: 'dark',
                    type: 'vertical',
                    shadeIntensity: 0.15,
                    gradientToColors: ['#2fb344'],
                    opacityFrom: 1,
                    opacityTo: 1,
                    stops: [0, 100]
                }
            },
            stroke: {
                lineCap: 'round'
            },
            labels: ['Score Global']
        };
        
        const chartElement = document.querySelector("#performanceGauge");
        if (chartElement) {
            this.charts.gauge = new ApexCharts(chartElement, options);
            this.charts.gauge.render();
        }
    }
    
    // Radar des critères
    initPerformanceRadar() {
        const options = {
            chart: {
                type: 'radar',
                height: 350,
                fontFamily: 'inherit',
                toolbar: {
                    show: false
                }
            },
            series: [{
                name: 'Votre performance',
                data: Object.values(this.performanceData.criteria)
            }, {
                name: 'Moyenne prestataires',
                data: [85, 88, 86, 90, 87]
            }],
            xaxis: {
                categories: ['Qualité', 'Délais', 'Communication', 'Technique', 'Satisfaction']
            },
            yaxis: {
                show: false
            },
            colors: ['#2fb344', '#e9ecef'],
            plotOptions: {
                radar: {
                    polygons: {
                        strokeColors: '#e9ecef',
                        strokeWidth: 1,
                        connectorColors: '#e9ecef',
                        fill: {
                            colors: ['#f8f9fa', '#ffffff']
                        }
                    }
                }
            },
            markers: {
                size: 4,
                colors: ['#2fb344', '#626976'],
                strokeColors: '#fff',
                strokeWidth: 2,
                hover: {
                        size: 8
                    }
            },
            fill: {
                opacity: [0.2, 0.1]
            },
            stroke: {
                width: 2
            },
            legend: {
                position: 'bottom',
                horizontalAlign: 'center'
            },
            tooltip: {
                y: {
                    formatter: function(val) {
                        return val + '%';
                    }
                }
            }
        };
        
        const chartElement = document.querySelector("#performanceRadar");
        if (chartElement) {
            this.charts.radar = new ApexCharts(chartElement, options);
            this.charts.radar.render();
        }
    }
    
    // Tendances de performance
    initPerformanceTrends() {
        const options = {
            chart: {
                type: 'line',
                height: 350,
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
            series: [{
                name: 'Score Global',
                data: this.performanceData.trends.global
            }],
            xaxis: {
                categories: this.performanceData.trends.labels,
                labels: {
                    style: {
                        colors: '#6c757d'
                    }
                }
            },
            yaxis: {
                min: 80,
                max: 100,
                labels: {
                    formatter: function(val) {
                        return val + '%';
                    },
                    style: {
                        colors: '#6c757d'
                    }
                }
            },
            colors: ['#206bc4'],
            stroke: {
                curve: 'smooth',
                width: 3
            },
            fill: {
                type: 'gradient',
                gradient: {
                    shadeIntensity: 1,
                    opacityFrom: 0.7,
                    opacityTo: 0.3,
                    stops: [0, 90, 100]
                }
            },
            dataLabels: {
                enabled: false
            },
            grid: {
                borderColor: '#e9ecef',
                strokeDashArray: 4,
                xaxis: {
                    lines: {
                        show: true
                    }
                },
                yaxis: {
                    lines: {
                        show: true
                    }
                }
            },
            markers: {
                size: 5,
                colors: ['#206bc4'],
                strokeColors: '#fff',
                strokeWidth: 2,
                hover: {
                    size: 7
                }
            },
            tooltip: {
                shared: false,
                y: {
                    formatter: function(val) {
                        return val + '%';
                    }
                }
            }
        };
        
        const chartElement = document.querySelector("#performanceTrends");
        if (chartElement) {
            this.charts.trends = new ApexCharts(chartElement, options);
            this.charts.trends.render();
        }
    }
    
    // Générer données de tendances
    generateTrendsData() {
        const periods = {
            week: {
                labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
                global: [92, 93, 94, 93, 95, 96, 95]
            },
            month: {
                labels: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8'],
                global: [91, 92, 93, 92, 94, 95, 94, 95]
            },
            quarter: {
                labels: ['Oct', 'Nov', 'Déc', 'Jan', 'Fév'],
                global: [88, 90, 92, 94, 95]
            },
            year: {
                labels: ['T1', 'T2', 'T3', 'T4'],
                global: [85, 88, 92, 95]
            }
        };
        
        return periods[this.currentPeriod] || periods.month;
    }
    
    // Event listeners
    initEventListeners() {
        // Changement de période
        document.querySelectorAll('[name="period-selector"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.currentPeriod = e.target.value;
                this.loadPeriodData(this.currentPeriod);
            });
        });
        
        // Type de tendance
        document.querySelectorAll('[name="trend-type"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.updateTrendChart(e.target.id === 'trend-detailed');
            });
        });
    }
    
    // Charger données par période
    loadPeriodData(period) {
        console.log('Chargement période:', period);
        
        // Animation de transition
        document.querySelectorAll('.card').forEach(card => {
            card.style.opacity = '0.8';
        });
        
        // Mettre à jour les données
        this.performanceData.trends = this.generateTrendsData();
        
        // Mettre à jour les graphiques
        if (this.charts.trends) {
            this.charts.trends.updateOptions({
                xaxis: {
                    categories: this.performanceData.trends.labels
                }
            });
            this.charts.trends.updateSeries([{
                name: 'Score Global',
                data: this.performanceData.trends.global
            }]);
        }
        
        setTimeout(() => {
            document.querySelectorAll('.card').forEach(card => {
                card.style.opacity = '1';
            });
        }, 300);
        
        // Mettre à jour les métriques
        this.updateMetrics(period);
    }
    
    // Mettre à jour graphique tendances
    updateTrendChart(detailed) {
        if (!this.charts.trends) return;
        
        if (detailed) {
            // Vue détaillée avec tous les critères
            const detailedData = [
                {
                    name: 'Qualité',
                    data: this.generateRandomTrend(96, 2)
                },
                {
                    name: 'Délais',
                    data: this.generateRandomTrend(94, 3)
                },
                {
                    name: 'Communication',
                    data: this.generateRandomTrend(92, 4)
                },
                {
                    name: 'Technique',
                    data: this.generateRandomTrend(98, 1)
                },
                {
                    name: 'Satisfaction',
                    data: this.generateRandomTrend(95, 2)
                }
            ];
            
            this.charts.trends.updateOptions({
                colors: ['#206bc4', '#2fb344', '#f59f00', '#6f42c1', '#d63939']
            });
            this.charts.trends.updateSeries(detailedData);
        } else {
            // Vue globale simple
            this.charts.trends.updateOptions({
                colors: ['#206bc4']
            });
            this.charts.trends.updateSeries([{
                name: 'Score Global',
                data: this.performanceData.trends.global
            }]);
        }
    }
    
    // Générer tendance aléatoire (simulation)
    generateRandomTrend(base, variance) {
        const length = this.performanceData.trends.labels.length;
        return Array.from({ length }, (_, i) => {
            const trend = i / length * 2; // Tendance positive
            const random = (Math.random() - 0.5) * variance;
            return Math.max(80, Math.min(100, base + trend + random));
        }).map(v => Math.round(v));
    }
    
    // Mettre à jour les métriques
    updateMetrics(period) {
        // Simulation de changement selon la période
        const variations = {
            week: { quality: -1, deadlines: 0, communication: +2, technical: 0, satisfaction: +1 },
            month: { quality: 0, deadlines: 0, communication: 0, technical: 0, satisfaction: 0 },
            quarter: { quality: +2, deadlines: +1, communication: +3, technical: +1, satisfaction: +2 },
            year: { quality: +5, deadlines: +6, communication: +7, technical: +3, satisfaction: +8 }
        };
        
        const periodVariations = variations[period] || variations.month;
        
        // Animer les changements
        Object.entries(periodVariations).forEach(([criterion, change]) => {
            if (change !== 0) {
                this.animateMetricChange(criterion, change);
            }
        });
    }
    
    // Animation changement métrique
    animateMetricChange(criterion, change) {
        // Trouver l'élément correspondant
        const elements = document.querySelectorAll('.card-sm');
        elements.forEach(el => {
            if (el.textContent.toLowerCase().includes(criterion)) {
                const valueEl = el.querySelector('.text-muted');
                if (valueEl) {
                    const currentValue = parseInt(valueEl.textContent);
                    const newValue = Math.max(0, Math.min(100, currentValue + change));
                    
                    // Animation du nombre
                    this.animateNumber(valueEl, currentValue, newValue);
                    
                    // Animation de la progress bar
                    const progressBar = el.querySelector('.progress-bar');
                    if (progressBar) {
                        progressBar.style.width = `${newValue}%`;
                    }
                }
            }
        });
    }
    
    // Animation des nombres
    animateNumber(element, start, end) {
        const duration = 1000;
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const current = Math.floor(start + (end - start) * progress);
            element.textContent = current + '%';
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    // Animation des métriques au chargement
    animateMetrics() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const progressBar = entry.target.querySelector('.progress-bar');
                    if (progressBar) {
                        const width = progressBar.style.width;
                        progressBar.style.width = '0';
                        setTimeout(() => {
                            progressBar.style.width = width;
                        }, 100);
                    }
                }
            });
        }, { threshold: 0.5 });
        
        document.querySelectorAll('.card-sm').forEach(card => {
            observer.observe(card);
        });
    }
    
    // Export rapport PDF
    exportReport() {
        console.log('Export rapport performance');
        
        // Données pour le rapport
        const reportData = {
            period: this.currentPeriod,
            global: this.performanceData.global,
            criteria: this.performanceData.criteria,
            trends: this.performanceData.trends,
            comparison: this.performanceData.comparison,
            recommendations: this.getRecommendations()
        };
        
        // Simulation export
        PortalApp.showToast('Génération du rapport en cours...', 'info');
        
        setTimeout(() => {
            console.log('Rapport généré:', reportData);
            PortalApp.showToast('Rapport PDF téléchargé avec succès', 'success');
            
            // Créer un lien de téléchargement (simulation)
            const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `performance-report-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
        }, 2000);
    }
    
    // Obtenir recommandations
    getRecommendations() {
        return [
            {
                type: 'communication',
                title: 'Communication proactive',
                description: 'Envoyer un update quotidien sur les missions en cours',
                impact: '+3 pts',
                priority: 'high'
            },
            {
                type: 'training',
                title: 'Formation React avancé',
                description: '2 formations disponibles pour projets complexes',
                impact: 'Compétences',
                priority: 'medium'
            },
            {
                type: 'planning',
                title: 'Buffer temps estimations',
                description: 'Ajouter 15% aux estimations initiales',
                impact: 'Optimisation',
                priority: 'low'
            }
        ];
    }
}

// Styles additionnels pour les animations
const performanceStyles = document.createElement('style');
performanceStyles.textContent = `
    /* Animations performance */
    .card {
        transition: all 0.3s ease;
    }
    
    .progress-bar {
        transition: width 1s ease-out;
    }
    
    .badge {
        animation: fadeIn 0.6s ease-out;
    }
    
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: scale(0.8);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }
    
    /* AI Recommendations */
    .ai-recommendations {
        background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
        border: 2px solid #e9ecef;
    }
    
    .recommendation-card {
        background: white;
        border: 1px solid #e9ecef;
        border-radius: 10px;
        padding: 1.5rem;
        transition: all 0.3s ease;
        height: 100%;
    }
    
    .recommendation-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        border-color: #6f42c1;
    }
    
    .recommendation-icon {
        width: 50px;
        height: 50px;
        background: #f8f9fa;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 1rem;
        font-size: 1.25rem;
        color: #6f42c1;
    }
    
    /* Metric cards hover */
    .card-sm:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0,0,0,0.08);
    }
    
    /* Ranking display */
    .display-6 {
        font-weight: 700;
        background: linear-gradient(135deg, #6f42c1 0%, #8b5cf6 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }
`;
document.head.appendChild(performanceStyles);

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    console.log('📊 Performance Analytics prêt');
});