/**
 * Dashboard Commercial Revendeur
 * Gestion des graphiques, carte et animations
 */

// Configuration dashboard revendeur
class SalesDashboard {
    constructor() {
        this.currentPeriod = 'month';
        this.salesData = this.loadSalesData();
        this.initCharts();
        this.initMap();
        this.animateFunnel();
        this.startAutoRefresh();
        this.initTicker();
    }
    
    // Charger données de vente
    loadSalesData() {
        return {
            currentMonth: 67500,
            objective: 100000,
            lastMonth: 55328,
            newClients: 8,
            clientsObjective: 10,
            leads: 33,
            converted: 8,
            commissionRate: 0.1
        };
    }
    
    // Calcul projections
    calculateProjection() {
        const daysInMonth = 30;
        const daysPassed = 18;
        const currentSales = this.salesData.currentMonth;
        
        const dailyAverage = currentSales / daysPassed;
        const projection = dailyAverage * daysInMonth;
        
        return {
            projection: Math.round(projection),
            dailyNeeded: Math.round((this.salesData.objective - currentSales) / (daysInMonth - daysPassed)),
            probability: this.calculateProbability(projection, this.salesData.objective)
        };
    }
    
    // Calculer probabilité d'atteindre l'objectif
    calculateProbability(projection, objective) {
        const ratio = projection / objective;
        if (ratio >= 1) return 100;
        if (ratio >= 0.9) return 75;
        if (ratio >= 0.8) return 50;
        if (ratio >= 0.7) return 25;
        return 10;
    }
    
    // Initialiser tous les graphiques
    initCharts() {
        this.initSparklineRevenue();
        this.initSalesChart();
        this.initProductChart();
    }
    
    // Mini graphique revenus
    initSparklineRevenue() {
        const options = {
            series: [{
                data: [45000, 52000, 48000, 55000, 58000, 62000, 65000, 67500]
            }],
            chart: {
                type: 'line',
                height: 40,
                sparkline: {
                    enabled: true
                }
            },
            stroke: {
                width: 2,
                curve: 'smooth'
            },
            colors: ['#2fb344'],
            tooltip: {
                enabled: false
            }
        };
        
        new ApexCharts(document.querySelector("#sparkline-revenue"), options).render();
    }
    
    // Graphique évolution CA vs Objectifs
    initSalesChart() {
        const options = {
            series: [{
                name: 'CA Réalisé',
                type: 'column',
                data: [85000, 92000, 78000, 95000, 88000, 91000, 87000, 93000, 89000, 96000, 91000, 67500]
            }, {
                name: 'Objectif',
                type: 'line',
                data: [80000, 85000, 85000, 90000, 90000, 95000, 95000, 100000, 100000, 100000, 100000, 100000]
            }],
            chart: {
                height: 350,
                type: 'line',
                toolbar: { show: false },
                animations: {
                    enabled: true,
                    easing: 'easeinout',
                    speed: 800
                }
            },
            stroke: {
                width: [0, 3]
            },
            colors: ['#f76707', '#206bc4'],
            plotOptions: {
                bar: {
                    borderRadius: 4,
                    columnWidth: '60%'
                }
            },
            fill: {
                opacity: [0.85, 1]
            },
            labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
            xaxis: {
                type: 'category'
            },
            yaxis: {
                labels: {
                    formatter: (val) => PortalApp.formatCurrency(val)
                }
            },
            tooltip: {
                shared: true,
                intersect: false,
                y: {
                    formatter: (val) => PortalApp.formatCurrency(val)
                }
            },
            legend: {
                position: 'top',
                horizontalAlign: 'right'
            }
        };
        
        new ApexCharts(document.querySelector("#salesEvolution"), options).render();
    }
    
    // Graphique répartition produits
    initProductChart() {
        const options = {
            series: [45, 30, 15, 10],
            chart: {
                type: 'donut',
                height: 250,
                animations: {
                    enabled: true,
                    easing: 'easeinout',
                    speed: 800
                }
            },
            labels: ['Licences', 'Services', 'Support', 'Formation'],
            colors: ['#206bc4', '#17a2b8', '#ffc107', '#28a745'],
            legend: {
                show: false
            },
            plotOptions: {
                pie: {
                    donut: {
                        size: '70%',
                        labels: {
                            show: true,
                            name: {
                                show: true,
                                fontSize: '14px',
                                fontWeight: 600
                            },
                            value: {
                                show: true,
                                fontSize: '18px',
                                fontWeight: 600,
                                formatter: (val) => val + '%'
                            },
                            total: {
                                show: true,
                                label: 'Total',
                                formatter: () => 'CHF 67.5k'
                            }
                        }
                    }
                }
            },
            dataLabels: {
                enabled: false
            },
            responsive: [{
                breakpoint: 480,
                options: {
                    chart: {
                        width: 200
                    }
                }
            }]
        };
        
        new ApexCharts(document.querySelector("#productDistribution"), options).render();
    }
    
    // Carte Suisse avec jVectorMap
    initMap() {
        const mapData = {
            'CH-GE': 25000,
            'CH-VD': 18500,
            'CH-VS': 12000,
            'CH-FR': 8000,
            'CH-NE': 4000,
            'CH-JU': 2000,
            'CH-BE': 1500,
            'CH-TI': 1000
        };
        
        const clientsData = {
            'CH-GE': 12,
            'CH-VD': 8,
            'CH-VS': 5,
            'CH-FR': 3,
            'CH-NE': 2,
            'CH-JU': 1,
            'CH-BE': 1,
            'CH-TI': 1
        };
        
        $('#swissMap').vectorMap({
            map: 'ch_mill',
            backgroundColor: 'transparent',
            regionStyle: {
                initial: {
                    fill: '#e9ecef',
                    'fill-opacity': 1,
                    stroke: '#dee2e6',
                    'stroke-width': 1,
                    'stroke-opacity': 1
                },
                hover: {
                    'fill-opacity': 0.8,
                    cursor: 'pointer'
                },
                selected: {
                    fill: '#f76707'
                }
            },
            series: {
                regions: [{
                    values: mapData,
                    scale: ['#fef3c7', '#f59e0b'],
                    normalizeFunction: 'polynomial',
                    legend: {
                        horizontal: true,
                        cssClass: 'jvectormap-legend-gradient'
                    }
                }]
            },
            onRegionTipShow: function(e, el, code) {
                const revenue = mapData[code] || 0;
                const clients = clientsData[code] || 0;
                const cantonName = el.html();
                
                el.html(`
                    <div style="background: #1a1a1a; color: white; padding: 8px; border-radius: 4px;">
                        <strong>${cantonName}</strong><br>
                        CA: ${PortalApp.formatCurrency(revenue)}<br>
                        Clients: ${clients}
                    </div>
                `);
            },
            onRegionOver: function(e, code) {
                if (code === 'CH-GE' || code === 'CH-VD' || code === 'CH-VS' || code === 'CH-FR' || code === 'CH-NE') {
                    $(e.target).css('cursor', 'pointer');
                }
            }
        });
        
        // Surligner la zone Suisse Romande
        const map = $('#swissMap').vectorMap('get', 'mapObject');
        map.setSelectedRegions(['CH-GE', 'CH-VD', 'CH-VS', 'CH-FR', 'CH-NE', 'CH-JU']);
    }
    
    // Animation funnel
    animateFunnel() {
        const stages = [
            { id: 'prospects', width: 100 },
            { id: 'qualifies', width: 80 },
            { id: 'negociation', width: 60 },
            { id: 'closing', width: 40 }
        ];
        
        stages.forEach((stage, index) => {
            setTimeout(() => {
                const element = document.querySelector(`#funnel-${stage.id}`);
                if (element) {
                    element.style.width = `${stage.width}%`;
                    element.style.opacity = '1';
                    element.style.transform = 'translateX(0)';
                }
            }, index * 200);
        });
    }
    
    // Ticker nouvelles ventes
    initTicker() {
        const tickerItems = [
            '🎉 Nouvelle vente : CHF 8\'500 - Client ABC',
            '📈 Objectif hebdomadaire atteint à 85%',
            '🏆 Top performer : Jean Dupont - CHF 125k ce mois',
            '🚀 3 nouveaux leads qualifiés aujourd\'hui',
            '💰 Commission du jour : CHF 850'
        ];
        
        let currentIndex = 0;
        const tickerContent = document.querySelector('.ticker-content');
        
        if (tickerContent) {
            setInterval(() => {
                tickerContent.style.opacity = '0';
                setTimeout(() => {
                    tickerContent.innerHTML = `<span class="ticker-item">${tickerItems[currentIndex]}</span>`;
                    tickerContent.style.opacity = '1';
                    currentIndex = (currentIndex + 1) % tickerItems.length;
                }, 300);
            }, 5000);
        }
    }
    
    // Mise à jour automatique
    startAutoRefresh() {
        // Rafraîchir les données toutes les 5 minutes
        setInterval(() => {
            this.refreshData();
        }, 5 * 60 * 1000);
    }
    
    // Rafraîchir les données
    refreshData() {
        console.log('🔄 Rafraîchissement des données...');
        // Simuler une mise à jour des données
        this.salesData.currentMonth += Math.floor(Math.random() * 5000);
        
        // Mettre à jour l'affichage
        this.updateDisplay();
        
        // Notification
        this.showSalesAlert('update', 'Données mises à jour');
    }
    
    // Mettre à jour l'affichage
    updateDisplay() {
        const projection = this.calculateProjection();
        
        // Mettre à jour la barre de progression
        const progressBar = document.querySelector('.objective-progress-bar');
        if (progressBar) {
            const percentage = (this.salesData.currentMonth / this.salesData.objective) * 100;
            progressBar.style.width = `${percentage}%`;
            progressBar.textContent = `CHF ${PortalApp.formatNumber(this.salesData.currentMonth)} / ${PortalApp.formatNumber(this.salesData.objective)} (${percentage.toFixed(1)}%)`;
        }
    }
    
    // Afficher alertes
    showSalesAlert(type, message) {
        const alerts = {
            'new-lead': { icon: 'ti-user-plus', color: 'info' },
            'deal-won': { icon: 'ti-trophy', color: 'success' },
            'target-reached': { icon: 'ti-confetti', color: 'warning' },
            'update': { icon: 'ti-refresh', color: 'secondary' }
        };
        
        const alert = alerts[type] || alerts['update'];
        PortalApp.showToast(`<i class="ti ${alert.icon} me-2"></i>${message}`, alert.color);
    }
}

// Gestion des événements
document.addEventListener('DOMContentLoaded', function() {
    // Sélecteur de période
    const periodSelector = document.getElementById('periodSelector');
    if (periodSelector) {
        periodSelector.addEventListener('change', function(e) {
            console.log('Période sélectionnée:', e.target.value);
            if (window.salesDashboard) {
                window.salesDashboard.currentPeriod = e.target.value;
                window.salesDashboard.refreshData();
            }
        });
    }
    
    console.log('💼 Dashboard commercial chargé');
});