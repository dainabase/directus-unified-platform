// rewards-notion.js - Intégration Notion pour le système de rewards prestataire
// Ce fichier gère le système de points et récompenses avec Notion

const RewardsNotion = {
    // Configuration
    DB_IDS: {
        REWARDS: '236adb95-3c6f-80f7-8034-dedae4272189',
        PERFORMANCE: '236adb95-3c6f-804b-807e-ffb4318fb667'
    },
    
    // Règles de calcul des points
    POINT_RULES: {
        LIVRABLE_A_TEMPS: 10,
        VALIDATION_PREMIER_COUP: 5,
        PROJET_5_ETOILES: 20,
        BONUS_MENSUEL_EXCELLENCE: 50,
        MISSION_COMPLETE: 15,
        FEEDBACK_POSITIF: 10,
        CERTIFICATION_OBTENUE: 100
    },
    
    // Niveaux
    LEVELS: [
        { min: 0, max: 999, name: 'Bronze', icon: 'ti-shield', color: 'badge-orange', benefits: ['Accès basique'] },
        { min: 1000, max: 4999, name: 'Argent', icon: 'ti-shield-star', color: 'badge-secondary', benefits: ['Priorité support', '5% bonus missions'] },
        { min: 5000, max: 9999, name: 'Or', icon: 'ti-crown', color: 'badge-yellow', benefits: ['Support dédié', '10% bonus missions', 'Badge profil'] },
        { min: 10000, max: 19999, name: 'Platine', icon: 'ti-diamond', color: 'badge-primary', benefits: ['Accès VIP', '15% bonus missions', 'Formations gratuites'] },
        { min: 20000, max: Infinity, name: 'Diamant', icon: 'ti-diamond-filled', color: 'badge-cyan', benefits: ['Tous avantages', '20% bonus missions', 'Mentorat personnalisé'] }
    ],
    
    // État local
    currentRewardsData: null,
    
    // Initialisation
    init() {
        console.log('🔌 Initialisation du système de rewards avec Notion');
        this.loadRewardsData();
        this.attachEventListeners();
    },
    
    // Attacher les écouteurs d'événements
    attachEventListeners() {
        // Onglets
        document.querySelectorAll('[data-rewards-tab]').forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchTab(e.target.dataset.rewardsTab);
            });
        });
        
        // Filtres historique
        const periodFilter = document.getElementById('filter-rewards-period');
        if (periodFilter) {
            periodFilter.addEventListener('change', (e) => {
                this.filterHistory(e.target.value);
            });
        }
        
        // Bouton de rafraîchissement
        const refreshBtn = document.getElementById('refresh-rewards');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadRewardsData());
        }
        
        // Échange de points
        document.querySelectorAll('[data-redeem-reward]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.redeemReward(e.target.dataset.redeemReward);
            });
        });
    },
    
    // Charger les données de rewards
    async loadRewardsData() {
        try {
            // Récupérer l'utilisateur connecté
            const currentUser = window.AuthNotionModule?.getCurrentUser();
            if (!currentUser || currentUser.role !== 'prestataire') {
                console.warn('Utilisateur non connecté ou mauvais rôle');
                window.location.href = '/portal-project/login.html';
                return;
            }
            
            // Vérifier les permissions pour voir les rewards
            const canViewRewards = await window.PermissionsNotion.checkPermission(
                currentUser.id,
                'rewards',
                'view.own'
            );
            
            if (!canViewRewards) {
                window.showNotification('Vous n\'avez pas accès aux rewards', 'error');
                window.location.href = `/${currentUser.role}/dashboard.html`;
                return;
            }
            
            // Afficher le loader
            this.showLoadingState();
            
            // Charger les données de rewards et performance avec le middleware sécurisé
            const [rewardsData, performanceData] = await Promise.all([
                window.PermissionsMiddleware.secureApiCall(
                    'rewards',
                    'view',
                    window.NotionConnector.prestataire.getPrestataireRewards.bind(window.NotionConnector.prestataire),
                    currentUser.id
                ),
                window.PermissionsMiddleware.secureApiCall(
                    'performance',
                    'view',
                    window.NotionConnector.prestataire.getPrestatairePerformance.bind(window.NotionConnector.prestataire),
                    currentUser.id
                )
            ]);
            
            // Enrichir les données
            const enrichedData = this.enrichRewardsData(rewardsData, performanceData);
            
            // Stocker les données
            this.currentRewardsData = enrichedData;
            
            // Mettre à jour l'interface
            this.updateRewardsView(enrichedData);
            
            // Logger l'accès
            await window.PermissionsNotion.logAccess('view', 'rewards', true, {
                currentLevel: enrichedData.currentLevel,
                totalPoints: enrichedData.totalPoints
            });
            
            // Cacher le loader
            this.hideLoadingState();
            
        } catch (error) {
            console.error('Erreur lors du chargement des rewards:', error);
            this.showErrorState();
        }
    },
    
    // Enrichir les données de rewards
    enrichRewardsData(rewardsData, performanceData) {
        // Calculer le niveau actuel
        const currentLevel = this.getCurrentLevel(rewardsData.totalPoints);
        const nextLevel = this.getNextLevel(currentLevel);
        const progressToNext = this.calculateProgressToNext(rewardsData.totalPoints, currentLevel, nextLevel);
        
        // Calculer les statistiques
        const stats = {
            totalEarned: rewardsData.history
                .filter(h => h.points > 0)
                .reduce((sum, h) => sum + h.points, 0),
            totalSpent: Math.abs(rewardsData.history
                .filter(h => h.points < 0)
                .reduce((sum, h) => sum + h.points, 0)),
            monthlyAverage: this.calculateMonthlyAverage(rewardsData.history),
            bestMonth: this.getBestMonth(rewardsData.history)
        };
        
        // Badges spéciaux basés sur la performance
        const specialBadges = this.calculateSpecialBadges(performanceData);
        
        return {
            ...rewardsData,
            currentLevel: currentLevel,
            nextLevel: nextLevel,
            progressToNext: progressToNext,
            stats: stats,
            specialBadges: specialBadges,
            performance: performanceData,
            availableRewards: this.getAvailableRewards(rewardsData.availablePoints),
            upcomingMilestones: this.getUpcomingMilestones(rewardsData.totalPoints)
        };
    },
    
    // Mettre à jour la vue des rewards
    updateRewardsView(data) {
        // Mettre à jour l'en-tête
        this.updateRewardsHeader(data);
        
        // Mettre à jour les statistiques
        this.updateRewardsStats(data);
        
        // Mettre à jour le niveau et progression
        this.updateLevelProgress(data);
        
        // Mettre à jour les badges
        this.updateBadgesDisplay(data);
        
        // Mettre à jour l'historique
        this.updateRewardsHistory(data.history);
        
        // Mettre à jour les récompenses disponibles
        this.updateAvailableRewards(data);
        
        // Mettre à jour les jalons
        this.updateMilestones(data);
    },
    
    // Mettre à jour l'en-tête des rewards
    updateRewardsHeader(data) {
        // Points totaux
        const totalPointsElement = document.getElementById('total-reward-points');
        if (totalPointsElement) {
            totalPointsElement.textContent = data.totalPoints.toLocaleString();
        }
        
        // Points disponibles
        const availablePointsElement = document.getElementById('available-reward-points');
        if (availablePointsElement) {
            availablePointsElement.textContent = data.availablePoints.toLocaleString();
        }
        
        // Rang
        const rankElement = document.getElementById('prestataire-rank');
        if (rankElement) {
            rankElement.innerHTML = `
                <span class="badge badge-lg ${data.currentLevel.color}">
                    <i class="ti ${data.currentLevel.icon} me-1"></i>
                    ${data.currentLevel.name}
                </span>
                <div class="text-muted small mt-1">Top ${data.rank || '?'}%</div>
            `;
        }
    },
    
    // Mettre à jour les statistiques
    updateRewardsStats(data) {
        const stats = [
            { id: 'total-earned', value: data.stats.totalEarned, suffix: ' pts gagnés' },
            { id: 'total-spent', value: data.stats.totalSpent, suffix: ' pts dépensés' },
            { id: 'monthly-average', value: data.stats.monthlyAverage, suffix: ' pts/mois' },
            { id: 'best-month', value: data.stats.bestMonth.points || 0, suffix: ' pts', 
              subtitle: data.stats.bestMonth.month || '' }
        ];
        
        stats.forEach(stat => {
            const element = document.getElementById(stat.id);
            if (element) {
                element.innerHTML = `
                    <div class="h2 mb-0">${stat.value.toLocaleString()}</div>
                    <div class="text-muted">${stat.suffix}</div>
                    ${stat.subtitle ? `<div class="text-muted small">${stat.subtitle}</div>` : ''}
                `;
            }
        });
    },
    
    // Mettre à jour la progression de niveau
    updateLevelProgress(data) {
        const container = document.getElementById('level-progress-container');
        if (!container) return;
        
        const pointsInLevel = data.totalPoints - data.currentLevel.min;
        const pointsForLevel = data.nextLevel ? data.nextLevel.min - data.currentLevel.min : 1;
        const progress = Math.min((pointsInLevel / pointsForLevel) * 100, 100);
        
        container.innerHTML = `
            <div class="mb-3">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <div>
                        <span class="badge ${data.currentLevel.color} badge-lg">
                            <i class="ti ${data.currentLevel.icon} me-1"></i>
                            ${data.currentLevel.name}
                        </span>
                    </div>
                    ${data.nextLevel ? `
                        <div class="text-end">
                            <span class="badge ${data.nextLevel.color} badge-lg badge-outline">
                                <i class="ti ${data.nextLevel.icon} me-1"></i>
                                ${data.nextLevel.name}
                            </span>
                            <div class="text-muted small mt-1">
                                ${(data.nextLevel.min - data.totalPoints).toLocaleString()} pts restants
                            </div>
                        </div>
                    ` : ''}
                </div>
                
                <div class="progress progress-lg">
                    <div class="progress-bar ${data.currentLevel.color.replace('badge-', 'bg-')}" 
                         style="width: ${progress}%" 
                         role="progressbar">
                        <span class="visually-hidden">${progress}% Complete</span>
                    </div>
                </div>
                
                <div class="text-center text-muted small mt-2">
                    ${data.totalPoints.toLocaleString()} / ${data.nextLevel ? data.nextLevel.min.toLocaleString() : '∞'} points
                </div>
            </div>
            
            <div class="card-body">
                <h4>Avantages ${data.currentLevel.name}</h4>
                <ul class="list-unstyled space-y-1">
                    ${data.currentLevel.benefits.map(benefit => `
                        <li><i class="ti ti-check text-success"></i> ${benefit}</li>
                    `).join('')}
                </ul>
            </div>
        `;
    },
    
    // Mettre à jour l'affichage des badges
    updateBadgesDisplay(data) {
        const container = document.getElementById('badges-container');
        if (!container) return;
        
        const allBadges = [...data.badges, ...data.specialBadges].sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        );
        
        if (allBadges.length === 0) {
            container.innerHTML = `
                <div class="text-center text-muted py-4">
                    <i class="ti ti-award-off fs-1 mb-2"></i>
                    <p>Aucun badge obtenu pour le moment</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = allBadges.map(badge => `
            <div class="col-6 col-md-4 col-lg-3">
                <div class="card badge-card">
                    <div class="card-body text-center">
                        <div class="badge-icon mb-2">
                            <span class="fs-1">${badge.icon}</span>
                        </div>
                        <h4 class="card-title mb-1">${badge.name}</h4>
                        <p class="text-muted small mb-0">
                            ${window.NotionConnector.utils.formatDate(badge.date)}
                        </p>
                        ${badge.description ? `
                            <p class="text-muted small mt-2 mb-0">${badge.description}</p>
                        ` : ''}
                    </div>
                </div>
            </div>
        `).join('');
    },
    
    // Mettre à jour l'historique
    updateRewardsHistory(history) {
        const container = document.getElementById('rewards-history');
        if (!container) return;
        
        if (history.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center text-muted py-4">
                        Aucune transaction pour le moment
                    </td>
                </tr>
            `;
            return;
        }
        
        // Trier par date décroissante
        const sortedHistory = [...history].sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        );
        
        container.innerHTML = sortedHistory.slice(0, 20).map(transaction => `
            <tr>
                <td>
                    <div class="d-flex align-items-center">
                        <span class="avatar avatar-sm ${transaction.points > 0 ? 'bg-success-lt' : 'bg-danger-lt'} me-2">
                            <i class="ti ${transaction.points > 0 ? 'ti-plus' : 'ti-minus'}"></i>
                        </span>
                        <div>
                            <div>${transaction.reason}</div>
                            <div class="text-muted small">
                                ${window.NotionConnector.utils.formatDate(transaction.date)}
                            </div>
                        </div>
                    </div>
                </td>
                <td class="text-end">
                    <span class="${transaction.points > 0 ? 'text-success' : 'text-danger'} fw-bold">
                        ${transaction.points > 0 ? '+' : ''}${transaction.points} pts
                    </span>
                </td>
                <td class="text-end text-muted">
                    ${transaction.balance ? transaction.balance.toLocaleString() + ' pts' : '-'}
                </td>
                <td class="text-center">
                    ${transaction.details ? `
                        <button class="btn btn-sm btn-ghost-secondary" 
                                onclick="RewardsNotion.showTransactionDetails('${transaction.id}')">
                            <i class="ti ti-info-circle"></i>
                        </button>
                    ` : '-'}
                </td>
            </tr>
        `).join('');
    },
    
    // Mettre à jour les récompenses disponibles
    updateAvailableRewards(data) {
        const container = document.getElementById('available-rewards-list');
        if (!container) return;
        
        const rewards = [
            { id: 'gift-card-50', name: 'Carte cadeau CHF 50', cost: 5000, icon: '🎁', available: data.availablePoints >= 5000 },
            { id: 'gift-card-100', name: 'Carte cadeau CHF 100', cost: 9000, icon: '🎁', available: data.availablePoints >= 9000 },
            { id: 'formation', name: 'Formation en ligne', cost: 3000, icon: '🎓', available: data.availablePoints >= 3000 },
            { id: 'mentor-session', name: 'Session mentorat 1h', cost: 2000, icon: '👨‍🏫', available: data.availablePoints >= 2000 },
            { id: 'priority-support', name: 'Support prioritaire 1 mois', cost: 1500, icon: '⚡', available: data.availablePoints >= 1500 },
            { id: 'profile-boost', name: 'Boost profil 1 semaine', cost: 1000, icon: '🚀', available: data.availablePoints >= 1000 }
        ];
        
        container.innerHTML = rewards.map(reward => `
            <div class="col-md-6 col-lg-4">
                <div class="card ${!reward.available ? 'card-inactive' : ''}">
                    <div class="card-body">
                        <div class="d-flex align-items-center mb-3">
                            <span class="avatar avatar-md bg-primary-lt me-3">
                                <span class="fs-2">${reward.icon}</span>
                            </span>
                            <div class="flex-fill">
                                <h4 class="card-title mb-0">${reward.name}</h4>
                                <div class="text-primary fw-bold">${reward.cost.toLocaleString()} pts</div>
                            </div>
                        </div>
                        <button class="btn btn-primary w-100 ${!reward.available ? 'disabled' : ''}"
                                onclick="RewardsNotion.redeemReward('${reward.id}')"
                                ${!reward.available ? 'disabled' : ''}>
                            ${reward.available ? 'Échanger' : 'Points insuffisants'}
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    },
    
    // Mettre à jour les jalons
    updateMilestones(data) {
        const container = document.getElementById('milestones-container');
        if (!container) return;
        
        const milestones = data.upcomingMilestones.slice(0, 5);
        
        container.innerHTML = milestones.map(milestone => `
            <div class="list-group-item">
                <div class="row align-items-center">
                    <div class="col-auto">
                        <span class="avatar avatar-sm ${milestone.achieved ? 'bg-success' : 'bg-secondary-lt'}">
                            <i class="ti ${milestone.achieved ? 'ti-check' : milestone.icon}"></i>
                        </span>
                    </div>
                    <div class="col">
                        <div class="${milestone.achieved ? 'text-decoration-line-through' : ''}">
                            ${milestone.name}
                        </div>
                        <div class="text-muted small">
                            ${milestone.points.toLocaleString()} points
                            ${!milestone.achieved ? ` - ${(milestone.points - data.totalPoints).toLocaleString()} restants` : ' - Obtenu!'}
                        </div>
                    </div>
                    ${milestone.reward ? `
                        <div class="col-auto">
                            <span class="badge badge-primary">+${milestone.reward} pts</span>
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');
    },
    
    // Fonctions utilitaires
    getCurrentLevel(points) {
        for (let i = this.LEVELS.length - 1; i >= 0; i--) {
            if (points >= this.LEVELS[i].min) {
                return this.LEVELS[i];
            }
        }
        return this.LEVELS[0];
    },
    
    getNextLevel(currentLevel) {
        const currentIndex = this.LEVELS.findIndex(l => l.name === currentLevel.name);
        return currentIndex < this.LEVELS.length - 1 ? this.LEVELS[currentIndex + 1] : null;
    },
    
    calculateProgressToNext(points, currentLevel, nextLevel) {
        if (!nextLevel) return 100;
        const pointsInLevel = points - currentLevel.min;
        const pointsForLevel = nextLevel.min - currentLevel.min;
        return Math.min(Math.round((pointsInLevel / pointsForLevel) * 100), 100);
    },
    
    calculateMonthlyAverage(history) {
        if (history.length === 0) return 0;
        
        // Grouper par mois
        const monthlyTotals = {};
        history.forEach(transaction => {
            if (transaction.points > 0) {
                const month = new Date(transaction.date).toISOString().slice(0, 7);
                monthlyTotals[month] = (monthlyTotals[month] || 0) + transaction.points;
            }
        });
        
        const months = Object.keys(monthlyTotals);
        if (months.length === 0) return 0;
        
        const total = Object.values(monthlyTotals).reduce((sum, points) => sum + points, 0);
        return Math.round(total / months.length);
    },
    
    getBestMonth(history) {
        const monthlyTotals = {};
        history.forEach(transaction => {
            if (transaction.points > 0) {
                const date = new Date(transaction.date);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                const monthName = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
                
                if (!monthlyTotals[monthKey]) {
                    monthlyTotals[monthKey] = { points: 0, month: monthName };
                }
                monthlyTotals[monthKey].points += transaction.points;
            }
        });
        
        let bestMonth = { points: 0, month: '' };
        Object.values(monthlyTotals).forEach(month => {
            if (month.points > bestMonth.points) {
                bestMonth = month;
            }
        });
        
        return bestMonth;
    },
    
    calculateSpecialBadges(performanceData) {
        const badges = [];
        
        // Badge ponctualité
        if (performanceData.completionRate >= 95) {
            badges.push({
                id: 'punctuality-master',
                name: 'Maître de la ponctualité',
                icon: '⏰',
                date: new Date().toISOString(),
                description: '95%+ de missions à temps'
            });
        }
        
        // Badge qualité
        if (performanceData.avgQualityScore >= 4.8) {
            badges.push({
                id: 'quality-expert',
                name: 'Expert qualité',
                icon: '⭐',
                date: new Date().toISOString(),
                description: 'Note moyenne 4.8+/5'
            });
        }
        
        // Badge productivité
        if (performanceData.completedMissions >= 50) {
            badges.push({
                id: 'productivity-hero',
                name: 'Héros de la productivité',
                icon: '🚀',
                date: new Date().toISOString(),
                description: '50+ missions complétées'
            });
        }
        
        return badges;
    },
    
    getAvailableRewards(availablePoints) {
        // Liste des récompenses possibles selon les points
        return [
            { threshold: 1000, items: ['Boost profil', 'Badge spécial'] },
            { threshold: 2000, items: ['Session mentorat', 'Formation courte'] },
            { threshold: 5000, items: ['Carte cadeau CHF 50', 'Certification'] },
            { threshold: 10000, items: ['Carte cadeau CHF 100', 'Pack formation complet'] }
        ].filter(r => availablePoints >= r.threshold);
    },
    
    getUpcomingMilestones(currentPoints) {
        const milestones = [
            { points: 100, name: 'Premier centenaire', icon: 'ti-medal', reward: 10 },
            { points: 500, name: 'Demi-millier', icon: 'ti-trophy', reward: 25 },
            { points: 1000, name: 'Niveau Argent', icon: 'ti-shield-star', reward: 50 },
            { points: 2500, name: 'Prestataire confirmé', icon: 'ti-award', reward: 75 },
            { points: 5000, name: 'Niveau Or', icon: 'ti-crown', reward: 100 },
            { points: 10000, name: 'Niveau Platine', icon: 'ti-diamond', reward: 200 },
            { points: 20000, name: 'Niveau Diamant', icon: 'ti-diamond-filled', reward: 500 }
        ];
        
        return milestones.map(m => ({
            ...m,
            achieved: currentPoints >= m.points
        }));
    },
    
    // Actions
    async redeemReward(rewardId) {
        try {
            if (!confirm('Êtes-vous sûr de vouloir échanger cette récompense ?')) {
                return;
            }
            
            // TODO: Implémenter l'échange réel avec Notion
            if (window.showNotification) {
                window.showNotification('Récompense échangée avec succès!', 'success');
            }
            
            // Recharger les données
            await this.loadRewardsData();
            
        } catch (error) {
            console.error('Erreur échange récompense:', error);
            if (window.showNotification) {
                window.showNotification('Erreur lors de l\'échange', 'error');
            }
        }
    },
    
    // Afficher les détails d'une transaction
    showTransactionDetails(transactionId) {
        // TODO: Implémenter l'affichage des détails
        console.log('Détails transaction:', transactionId);
    },
    
    // Changer d'onglet
    switchTab(tabName) {
        // Mettre à jour les onglets actifs
        document.querySelectorAll('[data-rewards-tab]').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.rewardsTab === tabName);
        });
        
        // Afficher le contenu correspondant
        document.querySelectorAll('[data-rewards-content]').forEach(content => {
            content.style.display = content.dataset.rewardsContent === tabName ? 'block' : 'none';
        });
    },
    
    // Filtrer l'historique
    filterHistory(period) {
        if (!this.currentRewardsData) return;
        
        let filteredHistory = [...this.currentRewardsData.history];
        const now = new Date();
        
        switch (period) {
            case 'week':
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                filteredHistory = filteredHistory.filter(t => new Date(t.date) >= weekAgo);
                break;
                
            case 'month':
                const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                filteredHistory = filteredHistory.filter(t => new Date(t.date) >= monthAgo);
                break;
                
            case 'year':
                const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
                filteredHistory = filteredHistory.filter(t => new Date(t.date) >= yearAgo);
                break;
        }
        
        this.updateRewardsHistory(filteredHistory);
    },
    
    // États de chargement
    showLoadingState() {
        const containers = ['rewards-header', 'rewards-content'];
        containers.forEach(id => {
            const container = document.getElementById(id);
            if (container && !container.querySelector('.spinner-border')) {
                const spinner = document.createElement('div');
                spinner.className = 'text-center py-5';
                spinner.innerHTML = '<div class="spinner-border text-primary" role="status"></div>';
                spinner.id = 'loading-spinner-' + id;
                container.prepend(spinner);
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
            window.showNotification('Erreur lors du chargement des rewards', 'error');
        }
        this.hideLoadingState();
    }
};

// Auto-initialisation
document.addEventListener('DOMContentLoaded', () => {
    // Vérifier qu'on est sur la page des rewards
    if (window.location.pathname.includes('rewards.html')) {
        // Attendre que NotionConnector soit prêt
        const checkNotionConnector = setInterval(() => {
            if (window.NotionConnector && window.AuthNotionModule) {
                clearInterval(checkNotionConnector);
                RewardsNotion.init();
            }
        }, 100);
    }
});

// Export global
window.RewardsNotion = RewardsNotion;