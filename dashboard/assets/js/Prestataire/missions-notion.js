// missions-notion.js - Intégration Notion pour la gestion des missions prestataire
// Ce fichier gère la connexion avec les bases de données Notion pour les missions

const MissionsNotion = {
    // Configuration
    DB_IDS: {
        MISSIONS: '236adb95-3c6f-80ca-a317-c7ff9dc7153c',
        TACHES: '227adb95-3c6f-8047-b7c1-e7d309071682',
        LIVRABLES: '236adb95-3c6f-801f-94d8-ee19736de74c'
    },
    
    // État local
    allMissions: [],
    currentFilter: 'all',
    currentSort: 'deadline',
    
    // Initialisation
    init() {
        console.log('🔌 Initialisation de la page missions avec Notion');
        this.loadMissions();
        this.attachEventListeners();
    },
    
    // Attacher les écouteurs d'événements
    attachEventListeners() {
        // Filtres par statut
        document.querySelectorAll('[data-filter-status]').forEach(filter => {
            filter.addEventListener('click', (e) => {
                e.preventDefault();
                this.filterByStatus(e.target.dataset.filterStatus);
            });
        });
        
        // Tri
        const sortSelect = document.getElementById('sort-missions');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortMissions(e.target.value);
            });
        }
        
        // Recherche
        const searchInput = document.getElementById('search-missions');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchMissions(e.target.value);
            });
        }
        
        // Bouton de rafraîchissement
        const refreshBtn = document.getElementById('refresh-missions');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadMissions());
        }
    },
    
    // Charger les missions depuis Notion
    async loadMissions() {
        try {
            // Récupérer l'utilisateur connecté
            const currentUser = window.AuthNotionModule?.getCurrentUser();
            if (!currentUser || currentUser.role !== 'prestataire') {
                console.warn('Utilisateur non connecté ou mauvais rôle');
                window.location.href = '/portal-project/login.html';
                return;
            }
            
            // Vérifier les permissions pour voir les missions
            const canViewMissions = await window.PermissionsNotion.checkPermission(
                currentUser.id,
                'missions',
                'view.assigned'
            );
            
            if (!canViewMissions) {
                window.showNotification('Vous n\'avez pas accès aux missions', 'error');
                window.location.href = `/${currentUser.role}/dashboard.html`;
                return;
            }
            
            // Afficher le loader
            this.showLoadingState();
            
            // Récupérer les missions avec le middleware sécurisé
            const missions = await window.PermissionsMiddleware.secureApiCall(
                'missions',
                'view',
                window.NotionConnector.prestataire.getPrestataireMissions.bind(window.NotionConnector.prestataire),
                currentUser.id
            );
            
            // Les missions sont automatiquement filtrées par le middleware
            // pour ne montrer que celles assignées au prestataire
            
            // Enrichir les missions avec des données supplémentaires
            const enrichedMissions = await this.enrichMissionsData(missions);
            
            // Stocker les missions
            this.allMissions = enrichedMissions;
            
            // Mettre à jour l'interface
            this.updateMissionsView(enrichedMissions);
            this.updateMissionsStats(enrichedMissions);
            
            // Cacher le loader
            this.hideLoadingState();
            
            // Logger l'accès
            await window.PermissionsNotion.logAccess('view', 'missions.list', true, {
                missionCount: missions.length,
                prestataireId: currentUser.id
            });
            
        } catch (error) {
            console.error('Erreur lors du chargement des missions:', error);
            this.showErrorState();
            
            if (window.PermissionsNotion) {
                await window.PermissionsNotion.logAccess('view', 'missions.list', false, {
                    error: error.message
                });
            }
        }
    },
    
    // Enrichir les données des missions
    async enrichMissionsData(missions) {
        const enrichedMissions = [];
        
        for (const mission of missions) {
            try {
                // Vérifier les permissions pour les tâches
                const canViewTasks = await window.PermissionsNotion.checkPermission(
                    window.AuthNotionModule?.getCurrentUser()?.id,
                    'tasks',
                    'view.assigned'
                );
                
                let tasks = [];
                if (canViewTasks) {
                    // Récupérer les tâches de la mission
                    tasks = await this.getMissionTasks(mission.id);
                }
                
                // Calculer les statistiques
                const taskStats = {
                    total: tasks.length,
                    completed: tasks.filter(t => t.status === 'Terminé').length,
                    inProgress: tasks.filter(t => t.status === 'En cours').length,
                    pending: tasks.filter(t => t.status === 'À faire').length
                };
                
                // Calculer la progression réelle
                const realProgress = taskStats.total > 0 
                    ? Math.round((taskStats.completed / taskStats.total) * 100)
                    : 0;
                
                // Vérifier si la mission est en retard
                const isOverdue = this.checkIfOverdue(mission.deadline);
                
                enrichedMissions.push({
                    ...mission,
                    tasks: taskStats,
                    progress: realProgress,
                    isOverdue: isOverdue,
                    daysRemaining: this.calculateDaysRemaining(mission.deadline),
                    estimatedReward: this.calculateEstimatedReward(mission, realProgress)
                });
                
            } catch (error) {
                console.error(`Erreur enrichissement mission ${mission.id}:`, error);
                enrichedMissions.push({
                    ...mission,
                    tasks: { total: 0, completed: 0, inProgress: 0, pending: 0 },
                    progress: mission.progress || 0,
                    isOverdue: false,
                    daysRemaining: null,
                    estimatedReward: mission.reward || 0
                });
            }
        }
        
        return enrichedMissions;
    },
    
    // Récupérer les tâches d'une mission
    async getMissionTasks(missionId) {
        try {
            // TODO: Implémenter la vraie requête Notion
            // Pour l'instant, on simule
            return [
                { id: 't1', status: 'Terminé', title: 'Analyse des besoins' },
                { id: 't2', status: 'En cours', title: 'Développement frontend' },
                { id: 't3', status: 'À faire', title: 'Tests unitaires' }
            ];
        } catch (error) {
            console.error('Erreur récupération tâches:', error);
            return [];
        }
    },
    
    // Mettre à jour la vue des missions
    updateMissionsView(missions) {
        const container = document.getElementById('missions-container');
        if (!container) return;
        
        if (missions.length === 0) {
            container.innerHTML = `
                <div class="col-12">
                    <div class="card">
                        <div class="card-body text-center py-5">
                            <i class="ti ti-briefcase-off fs-1 text-muted mb-3"></i>
                            <h3 class="text-muted">Aucune mission trouvée</h3>
                            <p class="text-muted">Vous n'avez pas encore de missions assignées</p>
                        </div>
                    </div>
                </div>
            `;
            return;
        }
        
        container.innerHTML = missions.map(mission => `
            <div class="col-12 col-md-6 col-lg-4 mission-card" 
                 data-status="${mission.status}"
                 data-priority="${mission.priority}">
                <div class="card ${mission.isOverdue ? 'border-danger' : ''}">
                    <div class="card-status-top ${this.getStatusColor(mission.status)}"></div>
                    <div class="card-body">
                        <div class="d-flex align-items-start mb-3">
                            <div class="flex-fill">
                                <h3 class="card-title mb-1">
                                    <a href="mission-detail.html?id=${mission.id}" class="text-reset">
                                        ${mission.title}
                                    </a>
                                </h3>
                                <div class="text-muted">${mission.client}</div>
                            </div>
                            <div class="ms-3">
                                <span class="badge ${this.getPriorityBadgeClass(mission.priority)}">
                                    ${mission.priority}
                                </span>
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <div class="d-flex justify-content-between mb-1">
                                <span class="text-muted">Progression</span>
                                <span class="text-muted">${mission.progress}%</span>
                            </div>
                            <div class="progress progress-sm">
                                <div class="progress-bar" style="width: ${mission.progress}%" role="progressbar">
                                    <span class="visually-hidden">${mission.progress}% Complete</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <div class="row g-2 align-items-center">
                                <div class="col-auto">
                                    <i class="ti ti-calendar text-muted"></i>
                                </div>
                                <div class="col">
                                    <div class="text-muted">
                                        ${mission.isOverdue ? 
                                            `<span class="text-danger fw-bold">En retard de ${Math.abs(mission.daysRemaining)} jours</span>` :
                                            mission.daysRemaining !== null ? 
                                                `${mission.daysRemaining} jours restants` : 
                                                'Pas de deadline'
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <div class="d-flex justify-content-between text-muted small">
                                <span>
                                    <i class="ti ti-list-check"></i>
                                    ${mission.tasks.completed}/${mission.tasks.total} tâches
                                </span>
                                <span>
                                    <i class="ti ti-trophy"></i>
                                    +${mission.estimatedReward} pts
                                </span>
                            </div>
                        </div>
                        
                        <div class="d-flex gap-2">
                            <a href="mission-detail.html?id=${mission.id}" 
                               class="btn btn-primary btn-sm flex-fill">
                                <i class="ti ti-eye"></i> Voir détails
                            </a>
                            ${mission.status === 'En cours' ? `
                                <button class="btn btn-success btn-sm"
                                        onclick="MissionsNotion.markAsCompleted('${mission.id}')"
                                        data-bs-toggle="tooltip"
                                        title="Marquer comme terminée">
                                    <i class="ti ti-check"></i>
                                </button>
                            ` : ''}
                        </div>
                    </div>
                    ${mission.status === 'En cours' && mission.tasks.pending > 0 ? `
                        <div class="card-footer">
                            <div class="text-warning small">
                                <i class="ti ti-alert-circle"></i>
                                ${mission.tasks.pending} tâches en attente
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');
        
        // Réinitialiser les tooltips
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    },
    
    // Mettre à jour les statistiques
    updateMissionsStats(missions) {
        const stats = {
            total: missions.length,
            active: missions.filter(m => m.status === 'En cours').length,
            pending: missions.filter(m => m.status === 'À faire').length,
            completed: missions.filter(m => m.status === 'Terminé').length,
            overdue: missions.filter(m => m.isOverdue).length,
            totalRewards: missions.reduce((sum, m) => sum + (m.estimatedReward || 0), 0)
        };
        
        // Mettre à jour les compteurs
        const updateStat = (id, value) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        };
        
        updateStat('total-missions', stats.total);
        updateStat('active-missions', stats.active);
        updateStat('pending-missions', stats.pending);
        updateStat('completed-missions', stats.completed);
        updateStat('overdue-missions', stats.overdue);
        updateStat('potential-rewards', stats.totalRewards.toLocaleString() + ' pts');
        
        // Mettre à jour les badges de filtre
        document.querySelectorAll('[data-filter-count]').forEach(badge => {
            const filter = badge.dataset.filterCount;
            if (filter === 'all') badge.textContent = stats.total;
            else if (filter === 'active') badge.textContent = stats.active;
            else if (filter === 'pending') badge.textContent = stats.pending;
            else if (filter === 'completed') badge.textContent = stats.completed;
        });
    },
    
    // Filtrer par statut
    filterByStatus(status) {
        this.currentFilter = status;
        
        // Mettre à jour l'UI des filtres
        document.querySelectorAll('[data-filter-status]').forEach(filter => {
            filter.classList.toggle('active', filter.dataset.filterStatus === status);
        });
        
        // Filtrer les missions
        let filteredMissions = [...this.allMissions];
        
        if (status !== 'all') {
            const statusMap = {
                'active': 'En cours',
                'pending': 'À faire',
                'completed': 'Terminé'
            };
            
            filteredMissions = filteredMissions.filter(m => 
                m.status === statusMap[status]
            );
        }
        
        // Appliquer le tri actuel
        this.applySorting(filteredMissions);
        
        // Mettre à jour la vue
        this.updateMissionsView(filteredMissions);
    },
    
    // Trier les missions
    sortMissions(sortBy) {
        this.currentSort = sortBy;
        
        // Récupérer les missions actuellement affichées
        const currentMissions = this.getCurrentFilteredMissions();
        
        // Appliquer le tri
        this.applySorting(currentMissions);
        
        // Mettre à jour la vue
        this.updateMissionsView(currentMissions);
    },
    
    // Appliquer le tri
    applySorting(missions) {
        missions.sort((a, b) => {
            switch (this.currentSort) {
                case 'deadline':
                    if (!a.deadline) return 1;
                    if (!b.deadline) return -1;
                    return new Date(a.deadline) - new Date(b.deadline);
                    
                case 'priority':
                    const priorityOrder = { 'Haute': 0, 'Moyenne': 1, 'Basse': 2 };
                    return (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2);
                    
                case 'progress':
                    return b.progress - a.progress;
                    
                case 'reward':
                    return b.estimatedReward - a.estimatedReward;
                    
                default:
                    return 0;
            }
        });
    },
    
    // Rechercher dans les missions
    searchMissions(query) {
        const searchTerm = query.toLowerCase().trim();
        
        if (!searchTerm) {
            this.filterByStatus(this.currentFilter);
            return;
        }
        
        const filteredMissions = this.allMissions.filter(mission => 
            mission.title.toLowerCase().includes(searchTerm) ||
            mission.client.toLowerCase().includes(searchTerm) ||
            mission.description?.toLowerCase().includes(searchTerm)
        );
        
        this.updateMissionsView(filteredMissions);
    },
    
    // Marquer une mission comme terminée
    async markAsCompleted(missionId) {
        try {
            if (!confirm('Êtes-vous sûr de vouloir marquer cette mission comme terminée ?')) {
                return;
            }
            
            // TODO: Implémenter la mise à jour dans Notion
            if (window.showNotification) {
                window.showNotification('Mission marquée comme terminée', 'success');
            }
            
            // Recharger les missions
            await this.loadMissions();
            
        } catch (error) {
            console.error('Erreur mise à jour mission:', error);
            if (window.showNotification) {
                window.showNotification('Erreur lors de la mise à jour', 'error');
            }
        }
    },
    
    // Récupérer les missions filtrées actuelles
    getCurrentFilteredMissions() {
        if (this.currentFilter === 'all') {
            return [...this.allMissions];
        }
        
        const statusMap = {
            'active': 'En cours',
            'pending': 'À faire',
            'completed': 'Terminé'
        };
        
        return this.allMissions.filter(m => 
            m.status === statusMap[this.currentFilter]
        );
    },
    
    // Fonctions utilitaires
    checkIfOverdue(deadline) {
        if (!deadline) return false;
        return new Date(deadline) < new Date();
    },
    
    calculateDaysRemaining(deadline) {
        if (!deadline) return null;
        const deadlineDate = new Date(deadline);
        const today = new Date();
        const diffTime = deadlineDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    },
    
    calculateEstimatedReward(mission, progress) {
        if (!mission.reward) return 0;
        
        // Récompense de base
        let reward = mission.reward;
        
        // Bonus si terminé à temps
        if (progress === 100 && !this.checkIfOverdue(mission.deadline)) {
            reward += 10; // Bonus ponctualité
        }
        
        return reward;
    },
    
    getStatusColor(status) {
        const colors = {
            'En cours': 'bg-primary',
            'À faire': 'bg-warning',
            'Terminé': 'bg-success',
            'En retard': 'bg-danger'
        };
        return colors[status] || 'bg-secondary';
    },
    
    getPriorityBadgeClass(priority) {
        const classes = {
            'Haute': 'badge-danger',
            'Moyenne': 'badge-warning',
            'Basse': 'badge-secondary'
        };
        return classes[priority] || 'badge-secondary';
    },
    
    // États de chargement
    showLoadingState() {
        const container = document.getElementById('missions-container');
        if (container) {
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Chargement...</span>
                    </div>
                    <div class="text-muted mt-2">Chargement des missions...</div>
                </div>
            `;
        }
    },
    
    hideLoadingState() {
        // Le contenu est remplacé par updateMissionsView
    },
    
    showErrorState() {
        const container = document.getElementById('missions-container');
        if (container) {
            container.innerHTML = `
                <div class="col-12">
                    <div class="card">
                        <div class="card-body text-center py-5">
                            <i class="ti ti-alert-circle fs-1 text-danger mb-3"></i>
                            <h3 class="text-danger">Erreur de chargement</h3>
                            <p class="text-muted">Impossible de charger les missions</p>
                            <button class="btn btn-primary mt-2" onclick="MissionsNotion.loadMissions()">
                                Réessayer
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }
        
        if (window.showNotification) {
            window.showNotification('Erreur lors du chargement des missions', 'error');
        }
    }
};

// Auto-initialisation
document.addEventListener('DOMContentLoaded', () => {
    // Vérifier qu'on est sur la page des missions
    if (window.location.pathname.includes('missions.html')) {
        // Attendre que NotionConnector soit prêt
        const checkNotionConnector = setInterval(() => {
            if (window.NotionConnector && window.AuthNotionModule) {
                clearInterval(checkNotionConnector);
                MissionsNotion.init();
            }
        }, 100);
    }
});

// Export global
window.MissionsNotion = MissionsNotion;