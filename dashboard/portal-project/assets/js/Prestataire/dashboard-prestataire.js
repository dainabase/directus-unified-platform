/**
 * Dashboard Prestataire
 * Gestion du tableau de bord avec système de rewards et gamification
 */

// Variables globales
let scoreCircleChart = null;
let revenueTrendChart = null;
let rewardsHistoryChart = null;

// Données simulées
const prestataireData = {
    score: 95,
    rating: 4.5,
    level: 'GOLD',
    points: 2450,
    pointsNext: 3000,
    missions: {
        active: 4,
        completed: 45,
        onTime: 96
    },
    tasks: {
        current: 28,
        total: 32,
        bonus: 3
    },
    revenue: {
        current: 18750,
        previous: 16304,
        trend: [15000, 16000, 17500, 16500, 17000, 18750]
    },
    bonus: {
        punctuality: 5,
        quality: 5,
        volume: 0
    },
    rewards: {
        history: [1200, 1450, 1680, 1590, 1750, 1875]
    },
    achievements: [
        { id: 1, name: 'Première mission 5 étoiles', icon: '🏆', unlocked: true },
        { id: 2, name: '10 projets livrés', icon: '🚀', unlocked: true },
        { id: 3, name: 'Speed Demon', icon: '⚡', description: 'Livraison < 24h', unlocked: true },
        { id: 4, name: 'Client Premium', icon: '💎', unlocked: true },
        { id: 5, name: '100% ponctuel', icon: '🎯', unlocked: false, progress: 45, total: 50 },
        { id: 6, name: 'Note parfaite x10', icon: '🌟', unlocked: false }
    ]
};

// Initialiser le dashboard
function initDashboardPrestataire() {
    console.log('📊 Initialisation Dashboard Prestataire');
    
    // Animation du score
    animateScore();
    
    // Initialiser les graphiques
    initCharts();
    
    // Charger les données
    updateMetrics();
    
    // Initialiser les tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// Animation du score global
function animateScore() {
    const scoreElement = document.getElementById('globalScore');
    const targetScore = prestataireData.score;
    let currentScore = 0;
    
    const interval = setInterval(() => {
        currentScore += 2;
        if (currentScore >= targetScore) {
            currentScore = targetScore;
            clearInterval(interval);
            // Animation des étoiles après le score
            animateStars(prestataireData.rating);
        }
        scoreElement.textContent = currentScore;
    }, 30);
    
    // Dessiner le cercle de score
    drawScoreCircle();
}

// Dessiner le cercle de progression du score
function drawScoreCircle() {
    const canvas = document.getElementById('scoreCircle');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 50;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Background circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 8;
    ctx.stroke();
    
    // Progress circle
    const progress = (prestataireData.score / 100) * 2 * Math.PI;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + progress);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.stroke();
}

// Animation des étoiles
function animateStars(rating) {
    const starContainer = document.getElementById('starRating');
    if (!starContainer) return;
    
    const stars = starContainer.querySelectorAll('.icon');
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    stars.forEach((star, index) => {
        setTimeout(() => {
            star.classList.remove('text-white-50');
            
            if (index < fullStars) {
                star.classList.remove('ti-star');
                star.classList.add('ti-star-filled', 'text-white');
            } else if (index === fullStars && hasHalfStar) {
                star.classList.remove('ti-star');
                star.classList.add('ti-star-half-filled', 'text-white');
            }
            
            // Animation scale
            star.style.transform = 'scale(1.3)';
            setTimeout(() => {
                star.style.transform = 'scale(1)';
            }, 200);
        }, index * 100);
    });
}

// Initialiser les graphiques
function initCharts() {
    // Mini graphique tendance revenus
    const revenueTrendOptions = {
        series: [{
            data: prestataireData.revenue.trend
        }],
        chart: {
            type: 'line',
            height: 40,
            sparkline: {
                enabled: true
            }
        },
        stroke: {
            curve: 'smooth',
            width: 2
        },
        colors: ['#2fb344'],
        tooltip: {
            enabled: false
        }
    };
    
    const revenueTrendElement = document.querySelector("#revenue-trend");
    if (revenueTrendElement) {
        revenueTrendChart = new ApexCharts(revenueTrendElement, revenueTrendOptions);
        revenueTrendChart.render();
    }
    
    // Graphique historique des rewards
    const rewardsHistoryOptions = {
        series: [{
            name: 'Bonus CHF',
            data: prestataireData.rewards.history
        }],
        chart: {
            type: 'bar',
            height: 200,
            toolbar: {
                show: false
            }
        },
        plotOptions: {
            bar: {
                borderRadius: 4,
                columnWidth: '60%'
            }
        },
        dataLabels: {
            enabled: false
        },
        xaxis: {
            categories: ['Août', 'Sep', 'Oct', 'Nov', 'Déc', 'Jan'],
            labels: {
                style: {
                    fontSize: '12px'
                }
            }
        },
        yaxis: {
            labels: {
                formatter: function(val) {
                    return 'CHF ' + val.toLocaleString('fr-CH');
                }
            }
        },
        colors: ['#2fb344'],
        grid: {
            strokeDashArray: 4
        },
        tooltip: {
            y: {
                formatter: function(val) {
                    return 'CHF ' + val.toLocaleString('fr-CH');
                }
            }
        }
    };
    
    const rewardsHistoryElement = document.querySelector("#rewardsHistory");
    if (rewardsHistoryElement) {
        rewardsHistoryChart = new ApexCharts(rewardsHistoryElement, rewardsHistoryOptions);
        rewardsHistoryChart.render();
    }
}

// Mettre à jour les métriques
function updateMetrics() {
    // Calcul des bonus
    const baseAmount = prestataireData.revenue.current;
    const bonuses = calculateBonus(baseAmount, {
        punctuality: prestataireData.missions.onTime,
        rating: prestataireData.rating,
        tasksCompleted: prestataireData.tasks.current
    });
    
    // Mettre à jour l'affichage des bonus
    updateBonusDisplay(bonuses);
    
    // Mettre à jour les achievements
    updateAchievements();
}

// Calculer les bonus automatiquement
function calculateBonus(baseAmount, performance) {
    const bonuses = {
        punctuality: performance.punctuality >= 95 ? 0.05 : 0,
        quality: performance.rating >= 4.5 ? 0.05 : 0,
        volume: performance.tasksCompleted >= 30 ? 0.02 : 0
    };
    
    return {
        punctuality: Math.round(baseAmount * bonuses.punctuality),
        quality: Math.round(baseAmount * bonuses.quality),
        volume: Math.round(baseAmount * bonuses.volume),
        total: Math.round(baseAmount * (bonuses.punctuality + bonuses.quality + bonuses.volume))
    };
}

// Mettre à jour l'affichage des bonus
function updateBonusDisplay(bonuses) {
    // Les éléments sont déjà dans le HTML avec les bonnes valeurs
    // Cette fonction pourrait être utilisée pour une mise à jour dynamique
}

// Mettre à jour les achievements
function updateAchievements() {
    // Animation pour les achievements débloqués
    const achievementBadges = document.querySelectorAll('.achievement-badge.unlocked');
    achievementBadges.forEach((badge, index) => {
        setTimeout(() => {
            badge.style.transform = 'scale(1.1)';
            setTimeout(() => {
                badge.style.transform = 'scale(1)';
            }, 200);
        }, index * 100);
    });
}

// Afficher une alerte pour deadline proche
function checkDeadlines() {
    // Vérifier les deadlines dans les 3 prochains jours
    const urgentDeadlines = 2; // Simulé
    
    if (urgentDeadlines > 0) {
        setTimeout(() => {
            const alertHtml = `
                <div class="alert alert-warning alert-dismissible" role="alert">
                    <div class="d-flex">
                        <div>
                            <i class="ti ti-alert-triangle icon alert-icon"></i>
                        </div>
                        <div>
                            <h4 class="alert-title">Attention!</h4>
                            <div class="text-muted">Vous avez ${urgentDeadlines} deadlines dans les prochaines 48h.</div>
                        </div>
                    </div>
                    <a class="btn-close" data-bs-dismiss="alert" aria-label="close"></a>
                </div>
            `;
            
            // Ajouter l'alerte en haut de la page
            const pageBody = document.querySelector('.page-body .container-xl');
            if (pageBody) {
                const alertDiv = document.createElement('div');
                alertDiv.innerHTML = alertHtml;
                pageBody.insertBefore(alertDiv.firstElementChild, pageBody.firstChild);
            }
        }, 3000);
    }
}

// Simuler des notifications temps réel
function simulateNotifications() {
    // Nouvelle mission après 10 secondes
    setTimeout(() => {
        PortalApp.showToast('Nouvelle mission disponible: "E-commerce React" - Budget CHF 25\'000', 'info');
        
        // Mettre à jour le badge du menu
        const missionBadge = document.querySelector('[data-page="missions"] .badge');
        if (missionBadge) {
            const currentCount = parseInt(missionBadge.textContent) || 0;
            missionBadge.textContent = currentCount + 1;
        }
    }, 10000);
    
    // Bonus débloqué après 20 secondes
    setTimeout(() => {
        PortalApp.showToast('🎉 Félicitations! Bonus qualité débloqué: +CHF 938', 'success');
    }, 20000);
}

// Actions rapides
function viewMission(missionId) {
    console.log('Voir mission:', missionId);
    window.location.href = `mission-detail.html?id=${missionId}`;
}

function uploadDeliverable(missionId) {
    console.log('Upload livrable pour mission:', missionId);
    // Ouvrir modal d'upload ou rediriger
}

// Exporter les données de performance
function exportPerformanceData() {
    PortalApp.showToast('Export des données de performance en cours...', 'info');
    
    setTimeout(() => {
        PortalApp.showToast('Données exportées avec succès', 'success');
    }, 1500);
}

// Refresh des données
function refreshDashboard() {
    PortalApp.showToast('Actualisation des données...', 'info');
    
    // Simuler le rechargement
    setTimeout(() => {
        // Re-render les graphiques
        if (revenueTrendChart) revenueTrendChart.updateSeries([{ data: prestataireData.revenue.trend }]);
        if (rewardsHistoryChart) rewardsHistoryChart.updateSeries([{ data: prestataireData.rewards.history }]);
        
        PortalApp.showToast('Données actualisées', 'success');
    }, 1000);
}

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', function() {
    // Vérifier les deadlines
    checkDeadlines();
    
    // Démarrer les notifications simulées
    simulateNotifications();
    
    // Auto-refresh toutes les 5 minutes
    setInterval(refreshDashboard, 300000);
});