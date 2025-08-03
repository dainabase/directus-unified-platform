// tasks-notion.js - Intégration Notion pour la gestion des tâches prestataire
// Ce fichier gère la connexion avec les bases de données Notion pour les tâches

const TasksNotion = {
    // Configuration
    DB_IDS: {
        TACHES: '227adb95-3c6f-8047-b7c1-e7d309071682',
        MISSIONS: '236adb95-3c6f-80ca-a317-c7ff9dc7153c'
    },
    
    // État local
    allTasks: [],
    currentFilter: 'all',
    currentSort: 'priority',
    
    // Initialisation
    init() {
        console.log('🔌 Initialisation de la page tâches avec Notion');
        this.loadTasks();
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
        const sortSelect = document.getElementById('sort-tasks');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortTasks(e.target.value);
            });
        }
        
        // Recherche
        const searchInput = document.getElementById('search-tasks');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTasks(e.target.value);
            });
        }
        
        // Bouton de rafraîchissement
        const refreshBtn = document.getElementById('refresh-tasks');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadTasks());
        }
        
        // Bouton nouvelle tâche
        const newTaskBtn = document.getElementById('new-task-btn');
        if (newTaskBtn) {
            newTaskBtn.addEventListener('click', () => this.showNewTaskModal());
        }
    },
    
    // Charger les tâches depuis Notion
    async loadTasks() {
        try {
            // Récupérer l'utilisateur connecté
            const currentUser = window.AuthNotionModule?.getCurrentUser();
            if (!currentUser || currentUser.role !== 'prestataire') {
                console.warn('Utilisateur non connecté ou mauvais rôle');
                window.location.href = '/portal-project/login.html';
                return;
            }
            
            // Vérifier les permissions pour voir les tâches
            const canViewTasks = await window.PermissionsNotion.checkPermission(
                currentUser.id,
                'tasks',
                'view.assigned'
            );
            
            if (!canViewTasks) {
                window.showNotification('Vous n\'avez pas accès aux tâches', 'error');
                window.location.href = `/${currentUser.role}/dashboard.html`;
                return;
            }
            
            // Afficher le loader
            this.showLoadingState();
            
            // Récupérer les tâches avec le middleware sécurisé
            const tasks = await window.PermissionsMiddleware.secureApiCall(
                'tasks',
                'view',
                this.getPrestataireTasks.bind(this),
                currentUser.id
            );
            
            // Enrichir les tâches avec des données supplémentaires
            const enrichedTasks = await this.enrichTasksData(tasks);
            
            // Stocker les tâches
            this.allTasks = enrichedTasks;
            
            // Mettre à jour l'interface
            this.updateTasksView(enrichedTasks);
            this.updateTasksStats(enrichedTasks);
            
            // Cacher le loader
            this.hideLoadingState();
            
            // Logger l'accès
            await window.PermissionsNotion.logAccess('view', 'tasks.list', true, {
                taskCount: tasks.length,
                prestataireId: currentUser.id
            });
            
        } catch (error) {
            console.error('Erreur lors du chargement des tâches:', error);
            this.showErrorState();
            
            if (window.PermissionsNotion) {
                await window.PermissionsNotion.logAccess('view', 'tasks.list', false, {
                    error: error.message
                });
            }
        }
    },
    
    // Récupérer les tâches du prestataire (stub)
    async getPrestataireTasks(prestataireId) {
        // TODO: Implémenter la vraie requête Notion
        // Pour l'instant, on simule avec des données de démo
        return [
            {
                id: 't1',
                title: 'Développer API authentification',
                description: 'Créer les endpoints pour login/logout/register',
                status: 'En cours',
                priority: 'Haute',
                deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Dans 2 jours
                estimatedHours: 8,
                actualHours: 4,
                missionId: 'm1',
                missionTitle: 'Projet API TechCorp',
                assignedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                tags: ['API', 'Backend', 'Security']
            },
            {
                id: 't2',
                title: 'Tests unitaires composants React',
                description: 'Couvrir au moins 80% des composants principaux',
                status: 'À faire',
                priority: 'Moyenne',
                deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
                estimatedHours: 12,
                actualHours: 0,
                missionId: 'm2',
                missionTitle: 'App Mobile StartupFood',
                assignedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                tags: ['Frontend', 'Testing', 'React']
            },
            {
                id: 't3',
                title: 'Documentation technique API',
                description: 'Rédiger la documentation Swagger complète',
                status: 'Terminé',
                priority: 'Basse',
                deadline: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                estimatedHours: 6,
                actualHours: 7,
                missionId: 'm1',
                missionTitle: 'Projet API TechCorp',
                assignedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                tags: ['Documentation', 'API']
            },
            {
                id: 't4',
                title: 'Optimisation performances DB',
                description: 'Analyser et optimiser les requêtes lentes',
                status: 'En cours',
                priority: 'Haute',
                deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // Demain
                estimatedHours: 10,
                actualHours: 6,
                missionId: 'm3',
                missionTitle: 'Migration Cloud Banking',
                assignedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                tags: ['Database', 'Performance', 'Backend']
            }
        ];
    },
    
    // Enrichir les données des tâches
    async enrichTasksData(tasks) {
        return tasks.map(task => {
            // Calculer la progression en heures
            const progressHours = task.estimatedHours > 0 
                ? Math.round((task.actualHours / task.estimatedHours) * 100)
                : 0;
            
            // Vérifier si la tâche est en retard
            const isOverdue = this.checkIfOverdue(task.deadline, task.status);
            
            // Calculer les jours restants
            const daysRemaining = this.calculateDaysRemaining(task.deadline);
            
            return {
                ...task,
                progressHours: Math.min(progressHours, 100),
                isOverdue: isOverdue,
                daysRemaining: daysRemaining,
                urgency: this.calculateUrgency(task.deadline, task.priority)
            };
        });
    },
    
    // Mettre à jour la vue des tâches
    updateTasksView(tasks) {
        const container = document.getElementById('tasks-container');
        if (!container) return;
        
        if (tasks.length === 0) {
            container.innerHTML = `
                <div class="col-12">
                    <div class="card">
                        <div class="card-body text-center py-5">
                            <i class="ti ti-list-check fs-1 text-muted mb-3"></i>
                            <h3 class="text-muted">Aucune tâche trouvée</h3>
                            <p class="text-muted">Vous n'avez pas encore de tâches assignées</p>
                        </div>
                    </div>
                </div>
            `;
            return;
        }
        
        container.innerHTML = tasks.map(task => `
            <div class="col-12 task-item" 
                 data-status="${task.status}"
                 data-priority="${task.priority}"
                 data-urgency="${task.urgency}">
                <div class="card ${task.isOverdue ? 'border-danger' : ''}">
                    <div class="card-status-top ${this.getStatusColor(task.status)}"></div>
                    <div class="card-body">
                        <div class="row align-items-start">
                            <div class="col">
                                <div class="d-flex align-items-center mb-2">
                                    <h3 class="card-title mb-0 me-2">
                                        <a href="#" onclick="TasksNotion.showTaskDetails('${task.id}'); return false;">
                                            ${task.title}
                                        </a>
                                    </h3>
                                    <span class="badge ${this.getPriorityBadgeClass(task.priority)} me-2">
                                        ${task.priority}
                                    </span>
                                    ${task.isOverdue ? '<span class="badge badge-danger">En retard</span>' : ''}
                                </div>
                                
                                <div class="text-muted mb-2">
                                    <i class="ti ti-briefcase me-1"></i>
                                    ${task.missionTitle}
                                </div>
                                
                                ${task.description ? `
                                    <p class="text-muted mb-3">${task.description}</p>
                                ` : ''}
                                
                                <div class="mb-3">
                                    <div class="d-flex justify-content-between mb-1">
                                        <span class="text-muted">Temps passé</span>
                                        <span class="text-muted">${task.actualHours}h / ${task.estimatedHours}h</span>
                                    </div>
                                    <div class="progress progress-sm">
                                        <div class="progress-bar ${task.progressHours > 100 ? 'bg-warning' : ''}" 
                                             style="width: ${Math.min(task.progressHours, 100)}%" 
                                             role="progressbar">
                                            <span class="visually-hidden">${task.progressHours}% Complete</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="row g-2 align-items-center text-muted small">
                                    <div class="col-auto">
                                        <i class="ti ti-calendar"></i>
                                        ${task.isOverdue ? 
                                            `<span class="text-danger">En retard de ${Math.abs(task.daysRemaining)} jours</span>` :
                                            task.daysRemaining !== null ? 
                                                `${task.daysRemaining} jours restants` : 
                                                'Pas de deadline'
                                        }
                                    </div>
                                    <div class="col-auto">
                                        <i class="ti ti-clock"></i>
                                        ${task.estimatedHours}h estimées
                                    </div>
                                </div>
                                
                                ${task.tags && task.tags.length > 0 ? `
                                    <div class="mt-2">
                                        ${task.tags.map(tag => `
                                            <span class="badge badge-outline me-1">${tag}</span>
                                        `).join('')}
                                    </div>
                                ` : ''}
                            </div>
                            
                            <div class="col-auto">
                                <div class="d-flex flex-column gap-2">
                                    ${task.status !== 'Terminé' ? `
                                        <button class="btn btn-sm btn-success" 
                                                onclick="TasksNotion.markTaskCompleted('${task.id}')"
                                                data-bs-toggle="tooltip" 
                                                title="Marquer comme terminée">
                                            <i class="ti ti-check"></i>
                                        </button>
                                    ` : ''}
                                    
                                    <button class="btn btn-sm btn-primary" 
                                            onclick="TasksNotion.startTimeTracking('${task.id}')"
                                            data-bs-toggle="tooltip" 
                                            title="Démarrer le suivi temps">
                                        <i class="ti ti-play"></i>
                                    </button>
                                    
                                    <div class="dropdown">
                                        <button class="btn btn-sm btn-ghost-secondary" 
                                                data-bs-toggle="dropdown"
                                                aria-expanded="false">
                                            <i class="ti ti-dots-vertical"></i>
                                        </button>
                                        <ul class="dropdown-menu dropdown-menu-end">
                                            <li>
                                                <a class="dropdown-item" href="#" 
                                                   onclick="TasksNotion.editTask('${task.id}'); return false;">
                                                    <i class="ti ti-edit me-2"></i>
                                                    Modifier
                                                </a>
                                            </li>
                                            <li>
                                                <a class="dropdown-item" href="#" 
                                                   onclick="TasksNotion.addTimeEntry('${task.id}'); return false;">
                                                    <i class="ti ti-clock-plus me-2"></i>
                                                    Ajouter du temps
                                                </a>
                                            </li>
                                            <li><hr class="dropdown-divider"></li>
                                            <li>
                                                <a class="dropdown-item text-danger" href="#" 
                                                   onclick="TasksNotion.deleteTask('${task.id}'); return false;">
                                                    <i class="ti ti-trash me-2"></i>
                                                    Supprimer
                                                </a>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
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
    updateTasksStats(tasks) {
        const stats = {
            total: tasks.length,
            todo: tasks.filter(t => t.status === 'À faire').length,
            inProgress: tasks.filter(t => t.status === 'En cours').length,
            completed: tasks.filter(t => t.status === 'Terminé').length,
            overdue: tasks.filter(t => t.isOverdue).length,
            totalHours: tasks.reduce((sum, t) => sum + (t.actualHours || 0), 0),
            estimatedHours: tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0)
        };
        
        // Mettre à jour les compteurs
        const updateStat = (id, value) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        };
        
        updateStat('total-tasks', stats.total);
        updateStat('todo-tasks', stats.todo);
        updateStat('inprogress-tasks', stats.inProgress);
        updateStat('completed-tasks', stats.completed);
        updateStat('overdue-tasks', stats.overdue);
        updateStat('total-hours', `${stats.totalHours}h`);
        updateStat('estimated-hours', `${stats.estimatedHours}h`);
        
        // Calculer le taux de complétion
        const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
        updateStat('completion-rate', `${completionRate}%`);
        
        // Mettre à jour les badges de filtre
        document.querySelectorAll('[data-filter-count]').forEach(badge => {
            const filter = badge.dataset.filterCount;
            if (filter === 'all') badge.textContent = stats.total;
            else if (filter === 'todo') badge.textContent = stats.todo;
            else if (filter === 'inprogress') badge.textContent = stats.inProgress;
            else if (filter === 'completed') badge.textContent = stats.completed;
            else if (filter === 'overdue') badge.textContent = stats.overdue;
        });
    },
    
    // Filtrer par statut
    filterByStatus(status) {
        this.currentFilter = status;
        
        // Mettre à jour l'UI des filtres
        document.querySelectorAll('[data-filter-status]').forEach(filter => {
            filter.classList.toggle('active', filter.dataset.filterStatus === status);
        });
        
        // Filtrer les tâches
        let filteredTasks = [...this.allTasks];
        
        if (status !== 'all') {
            const statusMap = {
                'todo': 'À faire',
                'inprogress': 'En cours',
                'completed': 'Terminé',
                'overdue': tasks => tasks.filter(t => t.isOverdue)
            };
            
            if (status === 'overdue') {
                filteredTasks = statusMap[status](filteredTasks);
            } else {
                filteredTasks = filteredTasks.filter(t => 
                    t.status === statusMap[status]
                );
            }
        }
        
        // Appliquer le tri actuel
        this.applySorting(filteredTasks);
        
        // Mettre à jour la vue
        this.updateTasksView(filteredTasks);
    },
    
    // Trier les tâches
    sortTasks(sortBy) {
        this.currentSort = sortBy;
        
        // Récupérer les tâches actuellement affichées
        const currentTasks = this.getCurrentFilteredTasks();
        
        // Appliquer le tri
        this.applySorting(currentTasks);
        
        // Mettre à jour la vue
        this.updateTasksView(currentTasks);
    },
    
    // Appliquer le tri
    applySorting(tasks) {
        tasks.sort((a, b) => {
            switch (this.currentSort) {
                case 'deadline':
                    if (!a.deadline) return 1;
                    if (!b.deadline) return -1;
                    return new Date(a.deadline) - new Date(b.deadline);
                    
                case 'priority':
                    const priorityOrder = { 'Haute': 0, 'Moyenne': 1, 'Basse': 2 };
                    return (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2);
                    
                case 'progress':
                    return b.progressHours - a.progressHours;
                    
                case 'title':
                    return a.title.localeCompare(b.title);
                    
                default:
                    return 0;
            }
        });
    },
    
    // Rechercher dans les tâches
    searchTasks(query) {
        const searchTerm = query.toLowerCase().trim();
        
        if (!searchTerm) {
            this.filterByStatus(this.currentFilter);
            return;
        }
        
        const filteredTasks = this.allTasks.filter(task => 
            task.title.toLowerCase().includes(searchTerm) ||
            task.description?.toLowerCase().includes(searchTerm) ||
            task.missionTitle.toLowerCase().includes(searchTerm) ||
            task.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
        );
        
        this.updateTasksView(filteredTasks);
    },
    
    // Actions sur les tâches
    async markTaskCompleted(taskId) {
        try {
            const currentUser = window.AuthNotionModule?.getCurrentUser();
            if (!currentUser) return;
            
            // Vérifier les permissions pour modifier les tâches
            const canUpdate = await window.PermissionsNotion.checkPermission(
                currentUser.id,
                'tasks',
                'update.assigned'
            );
            
            if (!canUpdate) {
                window.showNotification('Vous n\'avez pas le droit de modifier cette tâche', 'error');
                return;
            }
            
            if (!confirm('Êtes-vous sûr de vouloir marquer cette tâche comme terminée ?')) {
                return;
            }
            
            // TODO: Implémenter la mise à jour dans Notion
            window.showNotification('Tâche marquée comme terminée', 'success');
            
            // Recharger les tâches
            await this.loadTasks();
            
            // Logger l'action
            await window.PermissionsNotion.logAccess('update', 'tasks', true, {
                taskId: taskId,
                action: 'mark_completed'
            });
            
        } catch (error) {
            console.error('Erreur mise à jour tâche:', error);
            window.showNotification('Erreur lors de la mise à jour', 'error');
        }
    },
    
    async startTimeTracking(taskId) {
        try {
            const currentUser = window.AuthNotionModule?.getCurrentUser();
            if (!currentUser) return;
            
            // Vérifier les permissions pour le time tracking
            const canTrack = await window.PermissionsNotion.checkPermission(
                currentUser.id,
                'timetracking',
                'create'
            );
            
            if (!canTrack) {
                window.showNotification('Vous n\'avez pas le droit de faire du suivi temps', 'error');
                return;
            }
            
            // TODO: Implémenter le démarrage du time tracking
            window.showNotification('Suivi temps démarré', 'success');
            
            // Logger l'action
            await window.PermissionsNotion.logAccess('create', 'timetracking', true, {
                taskId: taskId,
                action: 'start_tracking'
            });
            
        } catch (error) {
            console.error('Erreur time tracking:', error);
            window.showNotification('Erreur lors du démarrage du suivi', 'error');
        }
    },
    
    async showTaskDetails(taskId) {
        // TODO: Implémenter l'affichage des détails
        console.log('Affichage détails tâche:', taskId);
    },
    
    async editTask(taskId) {
        // TODO: Implémenter l'édition
        console.log('Édition tâche:', taskId);
    },
    
    async addTimeEntry(taskId) {
        // TODO: Implémenter l'ajout de temps
        console.log('Ajout temps tâche:', taskId);
    },
    
    async deleteTask(taskId) {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
            // TODO: Implémenter la suppression
            window.showNotification('Tâche supprimée', 'success');
            await this.loadTasks();
        }
    },
    
    async showNewTaskModal() {
        // TODO: Implémenter le modal de création
        console.log('Nouvelle tâche');
    },
    
    // Récupérer les tâches filtrées actuelles
    getCurrentFilteredTasks() {
        if (this.currentFilter === 'all') {
            return [...this.allTasks];
        }
        
        const statusMap = {
            'todo': 'À faire',
            'inprogress': 'En cours',
            'completed': 'Terminé'
        };
        
        if (this.currentFilter === 'overdue') {
            return this.allTasks.filter(t => t.isOverdue);
        }
        
        return this.allTasks.filter(t => 
            t.status === statusMap[this.currentFilter]
        );
    },
    
    // Fonctions utilitaires
    checkIfOverdue(deadline, status) {
        if (!deadline || status === 'Terminé') return false;
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
    
    calculateUrgency(deadline, priority) {
        const daysRemaining = this.calculateDaysRemaining(deadline);
        const priorityWeight = { 'Haute': 3, 'Moyenne': 2, 'Basse': 1 };
        
        if (daysRemaining === null) return 'low';
        if (daysRemaining < 0) return 'critical';
        if (daysRemaining <= 1 && priorityWeight[priority] >= 2) return 'critical';
        if (daysRemaining <= 3) return 'high';
        if (daysRemaining <= 7) return 'medium';
        return 'low';
    },
    
    getStatusColor(status) {
        const colors = {
            'À faire': 'bg-warning',
            'En cours': 'bg-primary',
            'Terminé': 'bg-success'
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
        const container = document.getElementById('tasks-container');
        if (container) {
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Chargement...</span>
                    </div>
                    <div class="text-muted mt-2">Chargement des tâches...</div>
                </div>
            `;
        }
    },
    
    hideLoadingState() {
        // Le contenu est remplacé par updateTasksView
    },
    
    showErrorState() {
        const container = document.getElementById('tasks-container');
        if (container) {
            container.innerHTML = `
                <div class="col-12">
                    <div class="card">
                        <div class="card-body text-center py-5">
                            <i class="ti ti-alert-circle fs-1 text-danger mb-3"></i>
                            <h3 class="text-danger">Erreur de chargement</h3>
                            <p class="text-muted">Impossible de charger les tâches</p>
                            <button class="btn btn-primary mt-2" onclick="TasksNotion.loadTasks()">
                                Réessayer
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }
        
        if (window.showNotification) {
            window.showNotification('Erreur lors du chargement des tâches', 'error');
        }
    }
};

// Auto-initialisation
document.addEventListener('DOMContentLoaded', () => {
    // Vérifier qu'on est sur la page des tâches
    if (window.location.pathname.includes('tasks.html')) {
        // Attendre que NotionConnector soit prêt
        const checkNotionConnector = setInterval(() => {
            if (window.NotionConnector && window.AuthNotionModule && window.PermissionsNotion) {
                clearInterval(checkNotionConnector);
                TasksNotion.init();
            }
        }, 100);
    }
});

// Export global
window.TasksNotion = TasksNotion;