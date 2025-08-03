// dashboard-prestataire-notion.js - Intégration Notion pour le dashboard prestataire
// Ce fichier gère la connexion avec les bases de données Notion pour l'espace prestataire

const DashboardPrestataireNotion = {
    // Configuration
    REFRESH_INTERVAL: 30000, // 30 secondes
    refreshTimer: null,
    
    // IDs des bases de données
    DB_IDS: {
        PERFORMANCE: '236adb95-3c6f-804b-807e-ffb4318fb667',
        MISSIONS: '236adb95-3c6f-80ca-a317-c7ff9dc7153c',
        REWARDS: '236adb95-3c6f-80f7-8034-dedae4272189',
        TACHES: '227adb95-3c6f-8047-b7c1-e7d309071682'
    },
    
    // Initialisation
    init() {
        console.log('🔌 Initialisation du dashboard prestataire avec Notion');
        this.loadDashboardData();
        this.attachEventListeners();
        this.startAutoRefresh();
    },
    
    // Attacher les écouteurs d'événements
    attachEventListeners() {
        // Bouton de rafraîchissement manuel
        const refreshBtn = document.getElementById('refresh-dashboard');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadDashboardData());
        }
        
        // Sélecteur de période
        const periodSelector = document.getElementById('period-selector');
        if (periodSelector) {
            periodSelector.addEventListener('change', (e) => this.changePeriod(e.target.value));
        }
    },
    
    // Démarrer le rafraîchissement automatique
    startAutoRefresh() {
        this.refreshTimer = setInterval(() => {
            this.loadDashboardData(true); // silent refresh
        }, this.REFRESH_INTERVAL);
    },
    
    // Arrêter le rafraîchissement automatique
    stopAutoRefresh() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
        }
    },
    
    // Charger toutes les données du dashboard
    async loadDashboardData(silent = false) {
        try {
            // Récupérer l'utilisateur connecté
            const currentUser = window.AuthNotionModule?.getCurrentUser();
            if (!currentUser || currentUser.role !== 'prestataire') {
                console.warn('Utilisateur non connecté ou mauvais rôle');
                window.location.href = '/portal-project/login.html';
                return;
            }
            
            // Vérifier les permissions d'accès au dashboard prestataire
            const canAccessDashboard = await window.PermissionsNotion.checkPermission(
                currentUser.id,
                'dashboard.prestataire',
                'view'
            );
            
            if (!canAccessDashboard) {
                window.showNotification('Accès non autorisé au dashboard prestataire', 'error');
                window.location.href = '/portal-project/login.html';
                return;
            }
            
            if (!silent) {
                this.showLoadingState();
            }
            
            // Charger toutes les données en parallèle avec permissions
            const [performance, missions, rewards, recentActivity] = await Promise.all([
                this.loadPerformanceMetrics(currentUser.id),
                this.loadActiveMissions(currentUser.id),
                this.loadRewardsData(currentUser.id),
                this.loadRecentActivity(currentUser.id)
            ]);
            
            // Mettre à jour l'interface
            this.updateDashboard({
                performance,
                missions,
                rewards,
                recentActivity
            });
            
            if (!silent) {
                this.hideLoadingState();
            }
            
            // Logger l'accès
            await window.PermissionsNotion.logAccess('view', 'dashboard.prestataire', true, {
                userId: currentUser.id,
                missionsCount: missions.length
            });
            
        } catch (error) {
            console.error('Erreur lors du chargement du dashboard:', error);
            if (!silent) {
                this.showErrorState();
            }
            
            if (window.PermissionsNotion) {
                await window.PermissionsNotion.logAccess('view', 'dashboard.prestataire', false, {
                    error: error.message
                });
            }
        }
    },
    
    // Charger les métriques de performance
    async loadPerformanceMetrics(prestataireId) {
        try {
            // Vérifier les permissions pour voir les performances
            const canViewPerformance = await window.PermissionsNotion.checkPermission(
                prestataireId,
                'performance',
                'view.own'
            );
            
            if (!canViewPerformance) {
                console.warn('Pas de permission pour voir les performances');
                return { score: 0, metrics: {} };
            }
            const performance = await window.NotionConnector.prestataire.getPrestatairePerformance(prestataireId);
            
            // Calculer le niveau et la couleur
            const level = this.calculateLevel(performance.totalPoints);
            const ratingColor = this.getRatingColor(performance.avgQualityScore);
            
            return {
                ...performance,
                level: level,
                ratingColor: ratingColor,
                completionRate: performance.completedMissions > 0 
                    ? Math.round((performance.onTimeMissions / performance.completedMissions) * 100)
                    : 0
            };
            
        } catch (error) {
            console.error('Erreur chargement performance:', error);
            return this.getDefaultPerformance();
        }
    },
    
    // Charger les missions actives
    async loadActiveMissions(prestataireId) {
        try {
            const missions = await window.NotionConnector.prestataire.getPrestataireMissions(prestataireId);
            
            // Séparer par statut
            const activeMissions = missions.filter(m => m.status === 'En cours');
            const pendingMissions = missions.filter(m => m.status === 'À faire');
            const completedMissions = missions.filter(m => m.status === 'Terminé');
            
            // Calculer les statistiques
            const stats = {
                active: activeMissions.length,
                pending: pendingMissions.length,
                completed: completedMissions.length,
                total: missions.length,
                totalRewards: missions.reduce((sum, m) => sum + (m.reward || 0), 0)
            };
            
            return {
                list: missions.slice(0, 5), // Top 5 pour le dashboard
                stats: stats,
                urgent: missions.filter(m => this.isUrgent(m.deadline)).length
            };
            
        } catch (error) {
            console.error('Erreur chargement missions:', error);
            return { list: [], stats: {}, urgent: 0 };
        }
    },
    
    // Charger les données de rewards
    async loadRewardsData(prestataireId) {
        try {
            const rewards = await window.NotionConnector.prestataire.getPrestataireRewards(prestataireId);
            
            // Calculer la progression vers le niveau suivant
            const currentLevel = this.calculateLevel(rewards.totalPoints);
            const nextLevelThreshold = this.getNextLevelThreshold(currentLevel);
            const progressToNext = this.calculateProgressToNextLevel(rewards.totalPoints, nextLevelThreshold);
            
            return {
                ...rewards,
                currentLevel: currentLevel,
                nextLevelThreshold: nextLevelThreshold,
                progressToNext: progressToNext,
                recentBadges: rewards.badges.slice(0, 3) // 3 derniers badges
            };
            
        } catch (error) {
            console.error('Erreur chargement rewards:', error);
            return this.getDefaultRewards();
        }
    },
    
    // Charger l'activité récente depuis Notion
    async loadRecentActivity(prestataireId) {
        try {
            const activities = [];
            
            // Récupérer les missions récentes assignées
            try {
                const recentMissions = await window.NotionConnector.prestataire.getRecentMissions(prestataireId);
                recentMissions.forEach(mission => {
                    activities.push({
                        type: 'mission',
                        title: 'Nouvelle mission assignée',
                        description: mission.title || 'Mission de projet',
                        time: this.formatTimeAgo(mission.assignedDate),
                        icon: 'ti-briefcase',
                        color: 'primary',
                        timestamp: new Date(mission.assignedDate).getTime()
                    });
                });
            } catch (error) {
                console.warn('Erreur récupération missions récentes:', error);
            }
            
            // Récupérer les points de récompense récents
            try {
                const recentRewards = await window.NotionConnector.prestataire.getRecentRewards(prestataireId);
                recentRewards.forEach(reward => {
                    activities.push({
                        type: 'reward',
                        title: 'Points gagnés',
                        description: `+${reward.points} points pour ${reward.reason}`,
                        time: this.formatTimeAgo(reward.earnedDate),
                        icon: 'ti-trophy',
                        color: 'success',
                        timestamp: new Date(reward.earnedDate).getTime()
                    });
                });
            } catch (error) {
                console.warn('Erreur récupération récompenses récentes:', error);
            }
            
            // Récupérer les validations de livrables récentes
            try {
                const recentValidations = await window.NotionConnector.prestataire.getRecentValidations(prestataireId);
                recentValidations.forEach(validation => {
                    activities.push({
                        type: 'validation',
                        title: 'Livrable validé',
                        description: validation.deliverableName || 'Livrable approuvé',
                        time: this.formatTimeAgo(validation.validatedDate),
                        icon: 'ti-check',
                        color: 'success',
                        timestamp: new Date(validation.validatedDate).getTime()
                    });
                });
            } catch (error) {
                console.warn('Erreur récupération validations récentes:', error);
            }
            
            // Récupérer les messages/commentaires récents
            try {
                const recentMessages = await window.NotionConnector.prestataire.getRecentMessages(prestataireId);
                recentMessages.forEach(message => {
                    activities.push({
                        type: 'message',
                        title: 'Nouveau message',
                        description: `${message.author} a commenté`,
                        time: this.formatTimeAgo(message.createdDate),
                        icon: 'ti-message',
                        color: 'info',
                        timestamp: new Date(message.createdDate).getTime()
                    });
                });
            } catch (error) {
                console.warn('Erreur récupération messages récents:', error);
            }
            
            // Trier par timestamp (plus récent en premier) et limiter à 6
            return activities
                .sort((a, b) => b.timestamp - a.timestamp)
                .slice(0, 6);
                
        } catch (error) {
            console.error('Erreur chargement activité:', error);
            return [];
        }
    },
    
    // Mettre à jour l'interface du dashboard
    updateDashboard(data) {
        const { performance, missions, rewards, recentActivity } = data;
        
        // Mettre à jour les KPIs de performance
        this.updatePerformanceMetrics(performance);
        
        // Mettre à jour les statistiques de missions
        this.updateMissionsStats(missions);
        
        // Mettre à jour les rewards
        this.updateRewardsDisplay(rewards);
        
        // Mettre à jour la liste des missions
        this.updateMissionsList(missions.list);
        
        // Mettre à jour l'activité récente
        this.updateRecentActivity(recentActivity);
        
        // Mettre à jour les graphiques
        this.updateCharts(performance, missions);
    },
    
    // Mettre à jour les métriques de performance
    updatePerformanceMetrics(performance) {
        // Score global
        const scoreElement = document.getElementById('global-score');
        if (scoreElement) {
            scoreElement.textContent = performance.globalScore + '%';
            scoreElement.className = `h1 mb-0 ${performance.globalScore >= 90 ? 'text-success' : 
                                                performance.globalScore >= 70 ? 'text-warning' : 'text-danger'}`;
        }
        
        // Niveau
        const levelElement = document.getElementById('performance-level');
        if (levelElement) {
            levelElement.textContent = performance.level.name;
            levelElement.className = `badge badge-lg ${performance.level.color}`;
        }
        
        // Taux de ponctualité
        const punctualityElement = document.getElementById('punctuality-rate');
        if (punctualityElement) {
            punctualityElement.textContent = performance.completionRate + '%';
        }
        
        // Note qualité
        const qualityElement = document.getElementById('quality-rating');
        if (qualityElement) {
            qualityElement.innerHTML = `
                ${performance.avgQualityScore.toFixed(1)} 
                <i class="ti ti-star-filled text-${performance.ratingColor} ms-1"></i>
            `;
        }
        
        // Missions complétées
        const completedElement = document.getElementById('completed-missions');
        if (completedElement) {
            completedElement.textContent = performance.completedMissions;
        }
    },
    
    // Mettre à jour les statistiques de missions
    updateMissionsStats(missions) {
        const updateStat = (id, value) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        };
        
        updateStat('active-missions', missions.stats.active || 0);
        updateStat('pending-missions', missions.stats.pending || 0);
        updateStat('urgent-missions', missions.urgent || 0);
        updateStat('total-rewards-pending', window.NotionConnector.utils.formatCurrency(missions.stats.totalRewards || 0));
    },
    
    // Mettre à jour l'affichage des rewards
    updateRewardsDisplay(rewards) {
        // Points totaux
        const totalPointsElement = document.getElementById('total-points');
        if (totalPointsElement) {
            totalPointsElement.textContent = rewards.totalPoints.toLocaleString();
        }
        
        // Points disponibles
        const availablePointsElement = document.getElementById('available-points');
        if (availablePointsElement) {
            availablePointsElement.textContent = rewards.availablePoints.toLocaleString();
        }
        
        // Niveau actuel
        const currentLevelElement = document.getElementById('current-level');
        if (currentLevelElement) {
            currentLevelElement.innerHTML = `
                <span class="badge ${rewards.currentLevel.color} badge-lg">
                    <i class="ti ${rewards.currentLevel.icon} me-1"></i>
                    ${rewards.currentLevel.name}
                </span>
            `;
        }
        
        // Progression vers le niveau suivant
        const progressElement = document.getElementById('level-progress');
        if (progressElement) {
            progressElement.style.width = rewards.progressToNext + '%';
        }
        
        const progressTextElement = document.getElementById('level-progress-text');
        if (progressTextElement) {
            progressTextElement.textContent = `${rewards.progressToNext}% vers ${rewards.nextLevelThreshold.toLocaleString()} points`;
        }
        
        // Badges récents
        const badgesContainer = document.getElementById('recent-badges');
        if (badgesContainer && rewards.recentBadges) {
            badgesContainer.innerHTML = rewards.recentBadges.map(badge => `
                <div class="col-auto">
                    <div class="badge badge-lg bg-secondary-lt" 
                         data-bs-toggle="tooltip" 
                         title="${badge.name} - ${window.NotionConnector.utils.formatDate(badge.date)}">
                        <span class="fs-2">${badge.icon}</span>
                    </div>
                </div>
            `).join('');
            
            // Réinitialiser les tooltips
            const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
            tooltipTriggerList.map(function (tooltipTriggerEl) {
                return new bootstrap.Tooltip(tooltipTriggerEl);
            });
        }
    },
    
    // Mettre à jour la liste des missions
    updateMissionsList(missions) {
        const container = document.getElementById('missions-list');
        if (!container) return;
        
        if (missions.length === 0) {
            container.innerHTML = `
                <div class="text-center py-4 text-muted">
                    <i class="ti ti-briefcase-off fs-1 mb-2"></i>
                    <p>Aucune mission active</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = missions.map(mission => `
            <div class="list-group-item">
                <div class="row align-items-center">
                    <div class="col-auto">
                        <span class="status-dot ${this.getMissionStatusClass(mission.status)} d-block"></span>
                    </div>
                    <div class="col">
                        <a href="mission-detail.html?id=${mission.id}" class="text-body d-block">
                            ${mission.title}
                        </a>
                        <div class="d-block text-muted text-truncate mt-n1">
                            <span class="badge badge-sm ${this.getPriorityBadgeClass(mission.priority)} me-2">
                                ${mission.priority}
                            </span>
                            ${mission.client}
                        </div>
                    </div>
                    <div class="col-auto">
                        <div class="d-flex align-items-center">
                            <div class="me-3 text-end">
                                <div class="text-primary fw-bold">
                                    +${mission.reward} pts
                                </div>
                                <small class="text-muted">
                                    ${this.getDeadlineText(mission.deadline)}
                                </small>
                            </div>
                            <div class="progress progress-sm" style="width: 80px;">
                                <div class="progress-bar" style="width: ${mission.progress}%" role="progressbar">
                                    <span class="visually-hidden">${mission.progress}% Complete</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Ajouter le lien "Voir toutes les missions"
        container.innerHTML += `
            <div class="list-group-item">
                <div class="row align-items-center">
                    <div class="col text-center">
                        <a href="missions.html" class="text-primary">
                            Voir toutes les missions <i class="ti ti-arrow-right ms-1"></i>
                        </a>
                    </div>
                </div>
            </div>
        `;
    },
    
    // Mettre à jour l'activité récente
    updateRecentActivity(activities) {
        const container = document.getElementById('recent-activity');
        if (!container) return;
        
        container.innerHTML = activities.map(activity => `
            <div class="list-group-item">
                <div class="row align-items-center">
                    <div class="col-auto">
                        <span class="avatar avatar-sm bg-${activity.color}-lt">
                            <i class="ti ${activity.icon}"></i>
                        </span>
                    </div>
                    <div class="col">
                        <div class="text-body d-block">${activity.title}</div>
                        <div class="d-block text-muted text-truncate mt-n1">
                            ${activity.description}
                        </div>
                    </div>
                    <div class="col-auto">
                        <small class="text-muted">${activity.time}</small>
                    </div>
                </div>
            </div>
        `).join('');
    },
    
    // Mettre à jour les graphiques
    updateCharts(performance, missions) {
        // Graphique de performance mensuelle
        if (window.performanceChart && performance.monthlyStats) {
            const categories = performance.monthlyStats.map(s => s.month);
            const completedData = performance.monthlyStats.map(s => s.completed);
            const pointsData = performance.monthlyStats.map(s => s.points);
            
            window.performanceChart.updateOptions({
                xaxis: { categories: categories }
            });
            
            window.performanceChart.updateSeries([
                { name: 'Missions complétées', data: completedData },
                { name: 'Points gagnés', data: pointsData }
            ]);
        }
        
        // Graphique circulaire de répartition des missions
        if (window.missionStatusChart && missions.stats) {
            const data = [
                missions.stats.active || 0,
                missions.stats.pending || 0,
                missions.stats.completed || 0
            ];
            
            window.missionStatusChart.updateSeries(data);
        }
    },
    
    // Fonctions utilitaires
    calculateLevel(points) {
        const levels = [
            { min: 0, name: 'Bronze', color: 'badge-orange', icon: 'ti-shield-star' },
            { min: 1000, name: 'Argent', color: 'badge-secondary', icon: 'ti-shield-star' },
            { min: 5000, name: 'Or', color: 'badge-yellow', icon: 'ti-crown' },
            { min: 10000, name: 'Platine', color: 'badge-primary', icon: 'ti-diamond' },
            { min: 20000, name: 'Diamant', color: 'badge-cyan', icon: 'ti-diamond-filled' }
        ];
        
        for (let i = levels.length - 1; i >= 0; i--) {
            if (points >= levels[i].min) {
                return levels[i];
            }
        }
        return levels[0];
    },
    
    getNextLevelThreshold(currentLevel) {
        const thresholds = {
            'Bronze': 1000,
            'Argent': 5000,
            'Or': 10000,
            'Platine': 20000,
            'Diamant': 50000
        };
        return thresholds[currentLevel.name] || 50000;
    },
    
    calculateProgressToNextLevel(currentPoints, nextThreshold) {
        const currentLevel = this.calculateLevel(currentPoints);
        const currentThreshold = currentLevel.min;
        const pointsInLevel = currentPoints - currentThreshold;
        const pointsNeeded = nextThreshold - currentThreshold;
        return Math.min(Math.round((pointsInLevel / pointsNeeded) * 100), 100);
    },
    
    getRatingColor(rating) {
        if (rating >= 4.5) return 'yellow';
        if (rating >= 4) return 'success';
        if (rating >= 3) return 'warning';
        return 'danger';
    },
    
    getMissionStatusClass(status) {
        const statusClasses = {
            'En cours': 'status-dot-animated bg-primary',
            'À faire': 'bg-warning',
            'Terminé': 'bg-success',
            'En retard': 'bg-danger'
        };
        return statusClasses[status] || 'bg-secondary';
    },
    
    getPriorityBadgeClass(priority) {
        const priorityClasses = {
            'Haute': 'badge-danger',
            'Moyenne': 'badge-warning',
            'Basse': 'badge-secondary'
        };
        return priorityClasses[priority] || 'badge-secondary';
    },
    
    isUrgent(deadline) {
        if (!deadline) return false;
        const deadlineDate = new Date(deadline);
        const today = new Date();
        const diffDays = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
        return diffDays <= 3 && diffDays >= 0;
    },
    
    getDeadlineText(deadline) {
        if (!deadline) return 'Pas de deadline';
        const deadlineDate = new Date(deadline);
        const today = new Date();
        const diffDays = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) return `En retard de ${Math.abs(diffDays)} jours`;
        if (diffDays === 0) return "Aujourd'hui";
        if (diffDays === 1) return 'Demain';
        if (diffDays <= 7) return `Dans ${diffDays} jours`;
        return window.NotionConnector.utils.formatDate(deadline);
    },
    
    // Obtenir les valeurs par défaut
    getDefaultPerformance() {
        return {
            globalScore: 0,
            completedMissions: 0,
            onTimeMissions: 0,
            avgQualityScore: 0,
            totalPoints: 0,
            level: this.calculateLevel(0),
            ratingColor: 'secondary',
            completionRate: 0,
            monthlyStats: []
        };
    },
    
    getDefaultRewards() {
        return {
            totalPoints: 0,
            availablePoints: 0,
            currentLevel: this.calculateLevel(0),
            nextLevelThreshold: 1000,
            progressToNext: 0,
            badges: [],
            recentBadges: [],
            history: []
        };
    },
    
    // Changer la période d'affichage
    changePeriod(period) {
        console.log('Changement de période:', period);
        // TODO: Implémenter le filtrage par période
        this.loadDashboardData();
    },
    
    // États de chargement
    showLoadingState() {
        // Ajouter des spinners aux cartes principales
        const cards = ['performance-card', 'missions-card', 'rewards-card'];
        cards.forEach(cardId => {
            const card = document.getElementById(cardId);
            if (card && !card.querySelector('.spinner-border')) {
                const spinner = document.createElement('div');
                spinner.className = 'text-center py-4';
                spinner.innerHTML = '<div class="spinner-border text-primary" role="status"></div>';
                spinner.id = 'loading-spinner-' + cardId;
                card.querySelector('.card-body').prepend(spinner);
            }
        });
    },
    
    hideLoadingState() {
        document.querySelectorAll('[id^="loading-spinner-"]').forEach(spinner => {
            spinner.remove();
        });
    },
    
    showErrorState() {
        if (window.showNotification) {
            window.showNotification('Erreur lors du chargement du dashboard', 'error');
        }
        this.hideLoadingState();
    },
    
    // Nettoyage lors de la destruction
    destroy() {
        this.stopAutoRefresh();
    },
    
    // Fonction utilitaire pour formater le temps écoulé
    formatTimeAgo(dateString) {
        if (!dateString) return 'Inconnue';
        
        const now = new Date();
        const date = new Date(dateString);
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'À l\'instant';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
        if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} jour(s)`;
        if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} mois`;
        return `${Math.floor(diffInSeconds / 31536000)} an(s)`;
    }
};

// Auto-initialisation
document.addEventListener('DOMContentLoaded', () => {
    // Vérifier qu'on est sur le dashboard prestataire
    if (window.location.pathname.includes('prestataire/dashboard.html')) {
        // Attendre que NotionConnector soit prêt
        const checkNotionConnector = setInterval(() => {
            if (window.NotionConnector && window.AuthNotionModule) {
                clearInterval(checkNotionConnector);
                DashboardPrestataireNotion.init();
            }
        }, 100);
    }
});

// Nettoyage lors du changement de page
window.addEventListener('beforeunload', () => {
    if (window.DashboardPrestataireNotion) {
        window.DashboardPrestataireNotion.destroy();
    }
});

// Export global
window.DashboardPrestataireNotion = DashboardPrestataireNotion;