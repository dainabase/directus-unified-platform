/**
 * Système de rewards complet avec gamification
 * Gestion des points, niveaux, achievements et bonus
 */

// Classe principale du système de rewards
class RewardsSystem {
    constructor() {
        this.userPoints = 2450;
        this.level = 'GOLD';
        this.achievements = ['first_blood', 'speed_runner', 'quality_master', 'hot_streak', 'team_player'];
        this.bonusRules = {
            performance: { threshold: 90, rate: 0.05 },
            punctuality: { threshold: 95, rate: 0.03 },
            quality: { threshold: 4.5, rate: 0.02 }
        };
        this.revenueChart = null;
    }
    
    init() {
        console.log('🎮 Initialisation du système de rewards');
        this.initCharts();
        this.initEventListeners();
        this.animateEntries();
        this.simulatePointsGain();
    }
    
    // Animation gain de points
    addPoints(amount, reason) {
        const startPoints = this.userPoints;
        const endPoints = this.userPoints + amount;
        
        // Animation compteur
        const counter = document.getElementById('pointsCounter');
        if (!counter) return;
        
        const duration = 2000;
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            
            const currentPoints = Math.floor(startPoints + (amount * easeOutQuart));
            counter.textContent = this.formatNumber(currentPoints);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.userPoints = endPoints;
                counter.textContent = this.formatNumber(endPoints);
                this.checkLevelUp();
                this.showPointsNotification(amount, reason);
                this.updateProgressBar();
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    // Vérification level up
    checkLevelUp() {
        const levels = {
            BRONZE: { min: 0, max: 500, color: 'bronze' },
            SILVER: { min: 501, max: 1500, color: 'secondary' },
            GOLD: { min: 1501, max: 3000, color: 'warning' },
            PLATINUM: { min: 3001, max: 5000, color: 'purple' },
            DIAMOND: { min: 5001, max: Infinity, color: 'info' }
        };
        
        for (const [level, range] of Object.entries(levels)) {
            if (this.userPoints >= range.min && this.userPoints <= range.max) {
                if (level !== this.level) {
                    this.levelUp(level, range.color);
                }
                break;
            }
        }
    }
    
    // Animation level up
    levelUp(newLevel, color) {
        const modal = new bootstrap.Modal(document.getElementById('levelUpModal'));
        document.getElementById('newLevelName').textContent = newLevel;
        
        // Confetti animation
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#ffd700', '#ffed4e', '#ffa500']
        });
        
        // Update badge
        const levelBadge = document.querySelector('.level-badge');
        if (levelBadge) {
            levelBadge.className = `badge badge-lg bg-${color} level-badge animated pulse`;
            levelBadge.innerHTML = `<i class="ti ti-star-filled icon"></i> ${newLevel}`;
        }
        
        modal.show();
        this.level = newLevel;
        this.unlockLevelRewards(newLevel);
        
        // Son de succès (optionnel)
        // this.playSound('levelup');
    }
    
    // Déblocage des récompenses de niveau
    unlockLevelRewards(level) {
        const rewards = {
            SILVER: {
                bonus: 0.05,
                formations: 1,
                support: '12h'
            },
            GOLD: {
                bonus: 0.10,
                formations: 2,
                support: '24/7'
            },
            PLATINUM: {
                bonus: 0.15,
                formations: 4,
                support: 'VIP'
            },
            DIAMOND: {
                bonus: 0.20,
                formations: 'Illimité',
                support: 'Dédié'
            }
        };
        
        const levelRewards = rewards[level];
        if (levelRewards) {
            PortalApp.showToast(`Nouveaux avantages débloqués : +${levelRewards.bonus * 100}% bonus, ${levelRewards.formations} formations`, 'success');
        }
    }
    
    // Notification de points flottante
    showPointsNotification(amount, reason) {
        const notification = document.getElementById('pointsNotification');
        if (!notification) return;
        
        notification.innerHTML = `
            <div class="points-gain">+${amount} pts</div>
            <div class="points-reason">${reason}</div>
        `;
        
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
    
    // Mise à jour de la barre de progression
    updateProgressBar() {
        const progressBar = document.querySelector('.level-progress');
        if (!progressBar) return;
        
        let progress = 0;
        let nextLevelPoints = 3000; // PLATINUM
        let currentLevelMin = 1501; // GOLD min
        
        if (this.level === 'GOLD') {
            progress = ((this.userPoints - currentLevelMin) / (nextLevelPoints - currentLevelMin)) * 100;
        }
        
        progressBar.style.width = `${progress}%`;
        progressBar.querySelector('.progress-bar-label').textContent = `${this.formatNumber(this.userPoints)} / ${this.formatNumber(nextLevelPoints)}`;
        
        // Update points restants
        const pointsLeft = nextLevelPoints - this.userPoints;
        const badge = document.querySelector('.badge.bg-warning-lt');
        if (badge) {
            badge.innerHTML = `<i class="ti ti-trending-up icon"></i> ${pointsLeft} points avant niveau PLATINUM`;
        }
    }
    
    // Déblocage achievements
    checkAchievements(data) {
        const achievements = {
            'first_blood': { 
                condition: () => data.missionsCompleted >= 1,
                points: 10,
                name: 'First Blood',
                description: 'Première mission complétée'
            },
            'speed_runner': {
                condition: () => data.expressDeliveries >= 10,
                points: 50,
                name: 'Speed Runner',
                description: '10 livraisons express'
            },
            'quality_master': {
                condition: () => data.fiveStarMissions >= 20,
                points: 100,
                name: 'Quality Master',
                description: '20 missions 5 étoiles'
            },
            'hot_streak': {
                condition: () => data.daysWithoutDelay >= 30,
                points: 75,
                name: 'Hot Streak',
                description: '30 jours sans retard'
            },
            'team_player': {
                condition: () => data.positiveFeedbacks >= 50,
                points: 60,
                name: 'Team Player',
                description: '50 feedbacks positifs'
            }
        };
        
        for (const [id, achievement] of Object.entries(achievements)) {
            if (!this.achievements.includes(id) && achievement.condition()) {
                this.unlockAchievement(id, achievement);
            }
        }
    }
    
    // Animation déblocage achievement
    unlockAchievement(id, achievement) {
        const badge = document.querySelector(`[data-achievement="${id}"]`);
        if (!badge) return;
        
        // Animation
        badge.classList.remove('locked');
        badge.classList.add('unlocked', 'unlocking');
        
        // Notification
        PortalApp.showToast(`🏆 Achievement débloqué : ${achievement.name} (+${achievement.points} pts)`, 'success');
        
        // Ajouter les points
        this.addPoints(achievement.points, `Achievement: ${achievement.name}`);
        
        // Confetti local
        const rect = badge.getBoundingClientRect();
        confetti({
            particleCount: 30,
            angle: 90,
            spread: 45,
            origin: {
                x: (rect.left + rect.width / 2) / window.innerWidth,
                y: (rect.top + rect.height / 2) / window.innerHeight
            }
        });
        
        this.achievements.push(id);
    }
    
    // Initialiser les graphiques
    initCharts() {
        this.initRevenueChart();
    }
    
    // Graphique évolution revenus
    initRevenueChart() {
        const options = {
            chart: {
                type: 'area',
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
                name: 'Revenus base',
                data: [15500, 16200, 17100, 17800, 18200, 18750]
            }, {
                name: 'Bonus',
                data: [775, 972, 1197, 1424, 1638, 1874]
            }],
            xaxis: {
                categories: ['Sept', 'Oct', 'Nov', 'Déc', 'Jan', 'Fév'],
                labels: {
                    style: {
                        colors: '#6c757d'
                    }
                }
            },
            yaxis: {
                labels: {
                    formatter: function(val) {
                        return 'CHF ' + val.toLocaleString('de-CH');
                    },
                    style: {
                        colors: '#6c757d'
                    }
                }
            },
            colors: ['#206bc4', '#2fb344'],
            stroke: {
                curve: 'smooth',
                width: 2
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
            legend: {
                position: 'top',
                horizontalAlign: 'right'
            },
            tooltip: {
                shared: true,
                intersect: false,
                y: {
                    formatter: function(val) {
                        return 'CHF ' + val.toLocaleString('de-CH');
                    }
                }
            }
        };
        
        const chartElement = document.querySelector("#revenueChart");
        if (chartElement) {
            this.revenueChart = new ApexCharts(chartElement, options);
            this.revenueChart.render();
        }
    }
    
    // Animations d'entrée
    animateEntries() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated-in');
                }
            });
        }, { threshold: 0.1 });
        
        document.querySelectorAll('.animated-entry').forEach(el => {
            observer.observe(el);
        });
    }
    
    // Simulation gain de points (démo)
    simulatePointsGain() {
        // Simuler un gain de points après 5 secondes
        setTimeout(() => {
            // this.addPoints(15, 'Tâche complexe réussie');
        }, 5000);
    }
    
    // Event listeners
    initEventListeners() {
        // Changement de période leaderboard
        document.querySelectorAll('[name="leaderboard-period"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.updateLeaderboard(e.target.value);
            });
        });
        
        // Hover sur achievements
        document.querySelectorAll('.achievement-badge').forEach(badge => {
            badge.addEventListener('mouseenter', function() {
                if (!this.classList.contains('locked')) {
                    this.style.transform = 'scale(1.1) rotate(5deg)';
                }
            });
            
            badge.addEventListener('mouseleave', function() {
                this.style.transform = '';
            });
        });
    }
    
    // Mise à jour du leaderboard
    updateLeaderboard(period) {
        console.log('Mise à jour leaderboard:', period);
        // Animation de transition
        const tbody = document.querySelector('.table tbody');
        if (tbody) {
            tbody.style.opacity = '0.5';
            setTimeout(() => {
                tbody.style.opacity = '1';
            }, 300);
        }
    }
    
    // Formatage des nombres
    formatNumber(num) {
        return num.toLocaleString('de-CH').replace(/,/g, "'");
    }
}

// Fonctions globales
function showBonusDetails() {
    PortalApp.showToast('Ouverture du détail des calculs de bonus...', 'info');
    // Ouvrir modal avec détails (à implémenter)
}

function exportPerformanceReport() {
    PortalApp.showToast('Génération du rapport PDF en cours...', 'info');
    
    // Simuler génération
    setTimeout(() => {
        PortalApp.showToast('Rapport PDF téléchargé avec succès', 'success');
    }, 2000);
}

// Animations CSS additionnelles
const style = document.createElement('style');
style.textContent = `
    /* Points notification flottante */
    .points-notification {
        position: fixed;
        top: 100px;
        right: 30px;
        background: linear-gradient(135deg, #2fb344 0%, #20c464 100%);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(47, 179, 68, 0.3);
        transform: translateX(400px);
        transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        z-index: 9999;
    }
    
    .points-notification.show {
        transform: translateX(0);
    }
    
    .points-gain {
        font-size: 1.5rem;
        font-weight: 700;
        margin-bottom: 0.25rem;
    }
    
    .points-reason {
        font-size: 0.875rem;
        opacity: 0.9;
    }
    
    /* Animated entries */
    .animated-entry {
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.6s ease-out;
    }
    
    .animated-entry.animated-in {
        opacity: 1;
        transform: translateY(0);
    }
    
    /* Level badge animation */
    .level-badge.animated {
        animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
        0% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(255, 193, 7, 0.7);
        }
        70% {
            transform: scale(1.05);
            box-shadow: 0 0 0 10px rgba(255, 193, 7, 0);
        }
        100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(255, 193, 7, 0);
        }
    }
    
    /* Gaming style cards */
    .level-card.gaming-style {
        background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
        border: 2px solid #e9ecef;
        position: relative;
        overflow: hidden;
    }
    
    .level-card.gaming-style::before {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: linear-gradient(45deg, transparent, rgba(255, 193, 7, 0.1), transparent);
        transform: rotate(45deg);
        animation: shimmer 3s infinite;
    }
    
    @keyframes shimmer {
        0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
        100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
    }
    
    /* Recommendation cards */
    .recommendation-card {
        background: #f8f9fa;
        border-radius: 10px;
        padding: 1.5rem;
        text-align: center;
        transition: all 0.3s ease;
        height: 100%;
    }
    
    .recommendation-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    }
    
    .recommendation-icon {
        width: 60px;
        height: 60px;
        background: linear-gradient(135deg, #6f42c1 0%, #8b5cf6 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 1rem;
        color: white;
        font-size: 1.5rem;
    }
`;
document.head.appendChild(style);

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎮 Rewards System prêt');
});