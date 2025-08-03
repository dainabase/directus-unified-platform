// projects-notion.js - Intégration Notion pour la page des projets
// Ce fichier remplace les données mockées par de vraies données Notion

const ProjectsNotion = {
    // Initialisation
    init() {
        console.log('🔌 Initialisation de la page projets avec Notion');
        this.loadProjects();
        this.attachEventListeners();
    },
    
    // Attacher les écouteurs d'événements
    attachEventListeners() {
        // Bouton de rafraîchissement
        const refreshBtn = document.getElementById('refresh-projects');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadProjects());
        }
        
        // Bouton de nouveau projet
        const newProjectBtn = document.getElementById('new-project-btn');
        if (newProjectBtn) {
            newProjectBtn.addEventListener('click', () => this.showNewProjectModal());
        }
    },
    
    // Charger les projets depuis Notion
    async loadProjects() {
        try {
            // Récupérer l'utilisateur connecté
            const currentUser = window.AuthNotionModule?.getCurrentUser();
            if (!currentUser) {
                console.warn('Utilisateur non connecté');
                window.location.href = '/portal-project/login.html';
                return;
            }
            
            // Vérifier les permissions d'accès aux projets
            const canViewProjects = await window.PermissionsNotion.checkPermission(
                currentUser.id,
                'projects',
                'view'
            );
            
            if (!canViewProjects) {
                window.showNotification('Vous n\'avez pas accès aux projets', 'error');
                window.location.href = `/${currentUser.role}/dashboard.html`;
                return;
            }
            
            // Afficher le loader
            this.showLoadingState();
            
            // Récupérer les projets avec le middleware sécurisé
            const projects = await window.PermissionsMiddleware.secureApiCall(
                'projects',
                'view',
                window.NotionConnector.client.getClientProjects.bind(window.NotionConnector.client),
                currentUser.id
            );
            
            // Charger les données supplémentaires pour chaque projet
            const enrichedProjects = await this.enrichProjectsData(projects);
            
            // Mettre à jour la table
            this.updateProjectsTable(enrichedProjects);
            
            // Mettre à jour les statistiques
            this.updateProjectsStats(enrichedProjects);
            
            // Cacher le loader
            this.hideLoadingState();
            
            // Logger l'accès réussi
            await window.PermissionsNotion.logAccess('view', 'projects.list', true, {
                projectCount: projects.length
            });
            
        } catch (error) {
            console.error('Erreur lors du chargement des projets:', error);
            this.showErrorState();
            
            // Logger l'échec
            if (window.PermissionsNotion) {
                await window.PermissionsNotion.logAccess('view', 'projects.list', false, {
                    error: error.message
                });
            }
        }
    },
    
    // Enrichir les données des projets avec des informations supplémentaires
    async enrichProjectsData(projects) {
        const enrichedProjects = [];
        
        for (const project of projects) {
            try {
                // Vérifier les permissions pour les tâches
                const canViewTasks = await window.PermissionsNotion.checkPermission(
                    window.AuthNotionModule?.getCurrentUser()?.id,
                    'tasks',
                    'view'
                );
                
                let tasks = [];
                if (canViewTasks) {
                    // Récupérer les tâches du projet avec le middleware sécurisé
                    tasks = await window.PermissionsMiddleware.secureApiCall(
                        'tasks',
                        'view',
                        window.NotionConnector.client.getProjectTasks.bind(window.NotionConnector.client),
                        project.id
                    );
                }
                
                // Calculer les statistiques des tâches
                const taskStats = {
                    total: tasks.length,
                    completed: tasks.filter(t => t.status === 'Terminé').length,
                    inProgress: tasks.filter(t => t.status === 'En cours').length,
                    pending: tasks.filter(t => t.status === 'À faire').length
                };
                
                // Calculer la progression réelle basée sur les tâches
                const realProgress = taskStats.total > 0 
                    ? Math.round((taskStats.completed / taskStats.total) * 100)
                    : 0;
                
                enrichedProjects.push({
                    ...project,
                    tasks: taskStats,
                    progress: realProgress,
                    manager: project.manager || 'Non assigné',
                    daysRemaining: this.calculateDaysRemaining(project.endDate)
                });
                
            } catch (error) {
                console.error(`Erreur enrichissement projet ${project.id}:`, error);
                enrichedProjects.push({
                    ...project,
                    tasks: { total: 0, completed: 0, inProgress: 0, pending: 0 },
                    manager: 'Non assigné',
                    daysRemaining: 0
                });
            }
        }
        
        return enrichedProjects;
    },
    
    // Calculer les jours restants
    calculateDaysRemaining(endDate) {
        if (!endDate) return null;
        const end = new Date(endDate);
        const today = new Date();
        const diffTime = end - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    },
    
    // Mettre à jour la table des projets
    updateProjectsTable(projects) {
        // Si DataTable existe, la détruire d'abord
        if (window.projectsTable) {
            window.projectsTable.destroy();
        }
        
        const tableBody = document.querySelector('#projectsTable tbody');
        if (!tableBody) return;
        
        // Générer le HTML de la table
        tableBody.innerHTML = projects.map(project => `
            <tr>
                <td>
                    <div>
                        <a href="project-detail.html?id=${project.id}" class="text-reset">
                            ${project.name}
                        </a>
                        <div class="small text-muted mt-1">
                            ${project.description || 'Pas de description'}
                        </div>
                    </div>
                </td>
                <td>${project.client || 'Client non défini'}</td>
                <td>
                    <span class="badge ${this.getStatusBadgeClass(project.status)}">
                        ${project.status}
                    </span>
                </td>
                <td>
                    <div class="progress progress-sm">
                        <div class="progress-bar" style="width: ${project.progress}%" 
                             role="progressbar">
                            <span class="visually-hidden">${project.progress}% Complete</span>
                        </div>
                    </div>
                    <small>${project.progress}%</small>
                </td>
                <td>${window.NotionConnector.utils.formatCurrency(project.budget || 0)}</td>
                <td>
                    ${window.NotionConnector.utils.formatDate(project.endDate)}
                    ${project.daysRemaining !== null ? `
                        <div class="small text-muted">
                            ${project.daysRemaining > 0 ? `${project.daysRemaining} jours restants` : 'Échéance dépassée'}
                        </div>
                    ` : ''}
                </td>
                <td>${project.manager}</td>
                <td>
                    <div class="btn-list flex-nowrap">
                        <a href="project-detail.html?id=${project.id}" 
                           class="btn btn-sm btn-icon btn-ghost-secondary"
                           data-bs-toggle="tooltip" 
                           title="Voir les détails">
                            <i class="ti ti-eye"></i>
                        </a>
                        <button class="btn btn-sm btn-icon btn-ghost-secondary"
                                onclick="ProjectsNotion.editProject('${project.id}')"
                                data-bs-toggle="tooltip" 
                                title="Modifier">
                            <i class="ti ti-edit"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
        
        // Réinitialiser DataTable
        if (window.initProjectsTable) {
            window.initProjectsTable();
        }
        
        // Réinitialiser les tooltips
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    },
    
    // Mettre à jour les statistiques
    updateProjectsStats(projects) {
        const stats = {
            total: projects.length,
            active: projects.filter(p => p.status === 'En cours').length,
            completed: projects.filter(p => p.status === 'Terminé').length,
            planned: projects.filter(p => p.status === 'Planifié').length,
            totalBudget: projects.reduce((sum, p) => sum + (p.budget || 0), 0),
            avgProgress: projects.length > 0 
                ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length)
                : 0
        };
        
        // Mettre à jour les éléments du DOM
        const updateStat = (id, value) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        };
        
        updateStat('total-projects', stats.total);
        updateStat('active-projects', stats.active);
        updateStat('completed-projects', stats.completed);
        updateStat('planned-projects', stats.planned);
        updateStat('total-budget', window.NotionConnector.utils.formatCurrency(stats.totalBudget));
        updateStat('avg-progress', `${stats.avgProgress}%`);
        
        // Mettre à jour la barre de progression moyenne
        const avgProgressBar = document.querySelector('#avg-progress-bar');
        if (avgProgressBar) {
            avgProgressBar.style.width = `${stats.avgProgress}%`;
        }
    },
    
    // Obtenir la classe CSS pour le badge de statut
    getStatusBadgeClass(status) {
        const statusClasses = {
            'En cours': 'badge-primary',
            'Terminé': 'badge-success',
            'Planifié': 'badge-secondary',
            'En attente': 'badge-warning',
            'Annulé': 'badge-danger'
        };
        return statusClasses[status] || 'badge-secondary';
    },
    
    // Afficher le modal de nouveau projet
    showNewProjectModal() {
        // TODO: Implémenter la création de projet avec Notion
        if (window.showNotification) {
            window.showNotification('La création de projet sera disponible prochainement', 'info');
        }
    },
    
    // Éditer un projet
    editProject(projectId) {
        // TODO: Implémenter l'édition de projet avec Notion
        console.log('Édition du projet:', projectId);
        if (window.showNotification) {
            window.showNotification('L\'édition de projet sera disponible prochainement', 'info');
        }
    },
    
    // Afficher l'état de chargement
    showLoadingState() {
        const tableContainer = document.querySelector('#projectsTable').closest('.table-responsive');
        if (tableContainer) {
            const loader = document.createElement('div');
            loader.className = 'text-center py-4';
            loader.id = 'projects-loader';
            loader.innerHTML = `
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Chargement...</span>
                </div>
                <div class="text-muted mt-2">Chargement des projets...</div>
            `;
            tableContainer.prepend(loader);
        }
    },
    
    // Cacher l'état de chargement
    hideLoadingState() {
        const loader = document.getElementById('projects-loader');
        if (loader) loader.remove();
    },
    
    // Afficher l'état d'erreur
    showErrorState() {
        this.hideLoadingState();
        if (window.showNotification) {
            window.showNotification('Erreur lors du chargement des projets', 'error');
        }
        
        const tableBody = document.querySelector('#projectsTable tbody');
        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center text-muted py-4">
                        <i class="ti ti-alert-circle fs-1 mb-2"></i>
                        <div>Erreur lors du chargement des projets</div>
                        <button class="btn btn-sm btn-primary mt-2" onclick="ProjectsNotion.loadProjects()">
                            Réessayer
                        </button>
                    </td>
                </tr>
            `;
        }
    }
};

// Auto-initialisation
document.addEventListener('DOMContentLoaded', () => {
    // Vérifier qu'on est sur la page des projets
    if (window.location.pathname.includes('projects.html')) {
        // Attendre que NotionConnector soit prêt
        const checkNotionConnector = setInterval(() => {
            if (window.NotionConnector && window.AuthNotionModule) {
                clearInterval(checkNotionConnector);
                ProjectsNotion.init();
            }
        }, 100);
    }
});

// Export global
window.ProjectsNotion = ProjectsNotion;