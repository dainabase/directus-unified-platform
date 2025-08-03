// dashboard-client-notion.js - Intégration Notion pour le dashboard client
// Ce fichier remplace les données mockées par de vraies données Notion

const DashboardClientNotion = {
    // Initialisation
    init() {
        console.log('🔌 Initialisation du dashboard client avec Notion');
        this.loadRealData();
    },
    
    // Charger les vraies données depuis Notion
    async loadRealData() {
        try {
            // Récupérer l'utilisateur connecté
            const currentUser = window.AuthNotionModule?.getCurrentUser();
            if (!currentUser) {
                console.warn('Utilisateur non connecté');
                window.location.href = '/portal-project/login.html';
                return;
            }
            
            // Vérifier les permissions d'accès au dashboard
            const canAccessDashboard = await window.PermissionsNotion.checkPermission(
                currentUser.id,
                'dashboard',
                'view'
            );
            
            if (!canAccessDashboard) {
                window.showNotification('Accès non autorisé au dashboard', 'error');
                window.location.href = '/portal-project/login.html';
                return;
            }
            
            // Afficher un loader pendant le chargement
            this.showLoadingState();
            
            // Charger toutes les données en parallèle avec vérification des permissions
            const [projects, finances, recentActivity] = await Promise.all([
                this.loadProjects(currentUser.id),
                this.loadFinances(currentUser.id),
                this.loadRecentActivity(currentUser.id)
            ]);
            
            // Mettre à jour le dashboard avec les vraies données
            this.updateDashboard({
                projects,
                finances,
                recentActivity
            });
            
            // Logger l'accès pour l'audit
            await window.PermissionsNotion.logAccess('view', 'dashboard', true, {
                userId: currentUser.id,
                role: currentUser.role
            });
            
        } catch (error) {
            console.error('Erreur lors du chargement des données:', error);
            this.showErrorState();
            
            // Logger l'échec pour l'audit
            if (window.PermissionsNotion) {
                await window.PermissionsNotion.logAccess('view', 'dashboard', false, {
                    error: error.message
                });
            }
        }
    },
    
    // Charger les projets du client
    async loadProjects(clientId) {
        try {
            const currentUser = window.AuthNotionModule?.getCurrentUser();
            
            // Vérifier les permissions pour voir les projets
            const canViewProjects = await window.PermissionsNotion.checkPermission(
                currentUser.id,
                'projects',
                'view'
            );
            
            if (!canViewProjects) {
                console.warn('Pas de permission pour voir les projets');
                return { list: [], stats: {}, totalTasks: 0 };
            }
            
            // Vérifier que le client ne peut voir que ses propres projets
            if (currentUser.role === 'client' && currentUser.id !== clientId) {
                console.error('Tentative d\'accès aux projets d\'un autre client');
                await window.PermissionsNotion.logAccess('view', 'projects.other', false, {
                    attemptedClientId: clientId,
                    actualClientId: currentUser.id
                });
                return { list: [], stats: {}, totalTasks: 0 };
            }
            
            // Utiliser le middleware sécurisé pour récupérer les projets
            const projects = await window.PermissionsMiddleware.secureApiCall(
                'projects',
                'view',
                window.NotionConnector.client.getClientProjects.bind(window.NotionConnector.client),
                clientId
            );
            
            // Les données sont automatiquement filtrées par le middleware
            
            // Calculer les statistiques
            const stats = {
                total: projects.length,
                active: projects.filter(p => p.status === 'En cours').length,
                completed: projects.filter(p => p.status === 'Terminé').length,
                planned: projects.filter(p => p.status === 'Planifié').length
            };
            
            // Calculer les tâches totales avec permissions
            let totalTasks = 0;
            for (const project of projects) {
                const canViewTasks = await window.PermissionsNotion.checkPermission(
                    currentUser.id,
                    'tasks',
                    'view'
                );
                
                if (canViewTasks) {
                    const tasks = await window.PermissionsMiddleware.secureApiCall(
                        'tasks',
                        'view',
                        window.NotionConnector.client.getProjectTasks.bind(window.NotionConnector.client),
                        project.id
                    );
                    totalTasks += tasks.length;
                }
            }
            
            return {
                list: projects,
                stats: stats,
                totalTasks: totalTasks
            };
            
        } catch (error) {
            console.error('Erreur chargement projets:', error);
            return { list: [], stats: {}, totalTasks: 0 };
        }
    },
    
    // Charger les données financières
    async loadFinances(clientId) {
        try {
            const currentUser = window.AuthNotionModule?.getCurrentUser();
            
            // Vérifier les permissions pour voir les finances
            const canViewFinances = await window.PermissionsNotion.checkPermission(
                currentUser.id,
                'finances',
                'view.own'
            );
            
            if (!canViewFinances) {
                console.warn('Pas de permission pour voir les finances');
                return { totals: {}, invoices: [], quotes: [] };
            }
            
            // Un client ne peut voir que ses propres finances
            if (currentUser.role === 'client' && currentUser.id !== clientId) {
                console.error('Tentative d\'accès aux finances d\'un autre client');
                await window.PermissionsNotion.logAccess('view', 'finances.other', false, {
                    attemptedClientId: clientId,
                    actualClientId: currentUser.id
                });
                return { totals: {}, invoices: [], quotes: [] };
            }
            
            // Utiliser le middleware sécurisé
            const finances = await window.PermissionsMiddleware.secureApiCall(
                'finances',
                'view',
                window.NotionConnector.client.getClientFinances.bind(window.NotionConnector.client),
                clientId
            );
            
            return finances;
        } catch (error) {
            console.error('Erreur chargement finances:', error);
            return { totals: {}, invoices: [], quotes: [] };
        }
    },
    
    // Charger l'activité récente depuis Notion
    async loadRecentActivity(clientId) {
        try {
            const activities = [];
            
            // Récupérer les tâches récentes des projets du client
            try {
                const recentTasks = await window.NotionConnector.client.getRecentTasks(clientId);
                recentTasks.forEach(task => {
                    activities.push({
                        type: 'task',
                        title: 'Nouvelle tâche assignée',
                        description: task.title || 'Tâche de projet',
                        time: this.formatTimeAgo(task.createdTime),
                        icon: 'ti-checkbox',
                        timestamp: new Date(task.createdTime).getTime()
                    });
                });
            } catch (error) {
                console.warn('Erreur récupération tâches récentes:', error);
            }
            
            // Récupérer les documents récents des projets du client
            try {
                const recentDocuments = await window.NotionConnector.client.getRecentDocuments(clientId);
                recentDocuments.forEach(doc => {
                    activities.push({
                        type: 'document',
                        title: 'Document ajouté',
                        description: doc.name || 'Document de projet',
                        time: this.formatTimeAgo(doc.uploadedAt),
                        icon: 'ti-file',
                        timestamp: new Date(doc.uploadedAt).getTime()
                    });
                });
            } catch (error) {
                console.warn('Erreur récupération documents récents:', error);
            }
            
            // Récupérer les communications récentes
            try {
                const recentComms = await window.NotionConnector.client.getRecentCommunications(clientId);
                recentComms.forEach(comm => {
                    activities.push({
                        type: 'message',
                        title: 'Nouveau message',
                        description: `${comm.author} a commenté`,
                        time: this.formatTimeAgo(comm.createdAt),
                        icon: 'ti-message',
                        timestamp: new Date(comm.createdAt).getTime()
                    });
                });
            } catch (error) {
                console.warn('Erreur récupération communications récentes:', error);
            }
            
            // Trier par timestamp (plus récent en premier) et limiter à 5
            return activities
                .sort((a, b) => b.timestamp - a.timestamp)
                .slice(0, 5);
                
        } catch (error) {
            console.error('Erreur chargement activité:', error);
            return [];
        }
    },
    
    // Mettre à jour l'interface du dashboard
    updateDashboard(data) {
        const { projects, finances, recentActivity } = data;
        
        // Mettre à jour les KPIs
        this.updateKPIs({
            projectsCount: projects.stats.active || 0,
            tasksCount: projects.totalTasks || 0,
            budgetAmount: finances.totals?.totalQuoted || 0,
            messagesCount: recentActivity.filter(a => a.type === 'message').length || 0
        });
        
        // Mettre à jour les graphiques
        this.updateCharts(projects, finances);
        
        // Mettre à jour la liste des projets
        this.updateProjectsList(projects.list);
        
        // Mettre à jour l'activité récente
        this.updateRecentActivity(recentActivity);
        
        // Cacher le loader
        this.hideLoadingState();
    },
    
    // Mettre à jour les KPIs avec animation
    updateKPIs(kpis) {
        // Utiliser la fonction animateCounter existante
        if (window.animateCounter) {
            animateCounter('projects-count', kpis.projectsCount, 1000);
            animateCounter('tasks-count', kpis.tasksCount, 1000);
            animateCounter('budget-amount', kpis.budgetAmount, 1500, 'CHF ');
            animateCounter('messages-count', kpis.messagesCount, 1000);
        }
    },
    
    // Mettre à jour les graphiques
    updateCharts(projects, finances) {
        // Graphique de progression des projets
        if (window.charts && window.charts.projectsProgress) {
            const projectNames = projects.list.slice(0, 3).map(p => p.name);
            const projectProgress = projects.list.slice(0, 3).map(p => p.progress || 0);
            
            window.charts.projectsProgress.updateOptions({
                xaxis: {
                    categories: projectNames
                }
            });
            
            window.charts.projectsProgress.updateSeries([{
                name: 'Progression',
                data: projectProgress
            }]);
        }
        
        // Graphique de répartition du budget
        if (window.charts && window.charts.budgetDistribution) {
            const categories = ['Développement', 'Design', 'Infrastructure'];
            const amounts = [
                finances.totals?.totalInvoiced || 0,
                Math.floor((finances.totals?.totalInvoiced || 0) * 0.3),
                Math.floor((finances.totals?.totalInvoiced || 0) * 0.2)
            ];
            
            window.charts.budgetDistribution.updateSeries(amounts);
        }
    },
    
    // Mettre à jour la liste des projets
    updateProjectsList(projects) {
        const projectsContainer = document.getElementById('projects-list');
        if (!projectsContainer) return;
        
        // Limiter à 5 projets
        const displayProjects = projects.slice(0, 5);
        
        projectsContainer.innerHTML = displayProjects.map(project => `
            <div class="list-group-item">
                <div class="row align-items-center">
                    <div class="col-auto">
                        <span class="status-dot ${this.getStatusClass(project.status)} d-block"></span>
                    </div>
                    <div class="col text-truncate">
                        <a href="project-detail.html?id=${project.id}" class="text-body d-block">${project.name}</a>
                        <div class="d-block text-muted text-truncate mt-n1">
                            ${project.description || 'Pas de description'}
                        </div>
                    </div>
                    <div class="col-auto">
                        <div class="progress progress-sm">
                            <div class="progress-bar" style="width: ${project.progress || 0}%" role="progressbar">
                                <span class="visually-hidden">${project.progress || 0}% Complete</span>
                            </div>
                        </div>
                        <small class="text-muted">${project.progress || 0}%</small>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Ajouter le lien "Voir tous les projets"
        projectsContainer.innerHTML += `
            <div class="list-group-item">
                <div class="row align-items-center">
                    <div class="col text-center">
                        <a href="projects.html" class="text-primary">
                            Voir tous les projets <i class="ti ti-arrow-right ms-1"></i>
                        </a>
                    </div>
                </div>
            </div>
        `;
    },
    
    // Mettre à jour l'activité récente
    updateRecentActivity(activities) {
        const activityContainer = document.getElementById('recent-activity');
        if (!activityContainer) return;
        
        activityContainer.innerHTML = activities.map(activity => `
            <div class="list-group-item">
                <div class="row align-items-center">
                    <div class="col-auto">
                        <span class="avatar avatar-sm">
                            <i class="ti ${activity.icon}"></i>
                        </span>
                    </div>
                    <div class="col text-truncate">
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
    
    // Obtenir la classe CSS selon le statut
    getStatusClass(status) {
        const statusClasses = {
            'En cours': 'status-dot-animated bg-primary',
            'Terminé': 'bg-success',
            'Planifié': 'bg-secondary',
            'En attente': 'bg-warning',
            'Annulé': 'bg-danger'
        };
        return statusClasses[status] || 'bg-secondary';
    },
    
    // Afficher l'état de chargement
    showLoadingState() {
        // Ajouter des spinners aux cartes
        document.querySelectorAll('.card-body').forEach(card => {
            if (!card.querySelector('.spinner-border')) {
                const spinner = document.createElement('div');
                spinner.className = 'text-center py-4';
                spinner.innerHTML = '<div class="spinner-border text-primary" role="status"></div>';
                spinner.id = 'loading-spinner';
                card.prepend(spinner);
            }
        });
    },
    
    // Cacher l'état de chargement
    hideLoadingState() {
        document.querySelectorAll('#loading-spinner').forEach(spinner => {
            spinner.remove();
        });
    },
    
    // Afficher l'état d'erreur
    showErrorState() {
        if (window.showNotification) {
            window.showNotification('Erreur lors du chargement des données', 'error');
        }
        this.hideLoadingState();
    },
    
    // Fonction de rafraîchissement
    refresh() {
        console.log('🔄 Rafraîchissement du dashboard avec données Notion...');
        this.loadRealData();
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

// Remplacer la fonction de rafraîchissement existante
if (window.refreshDashboard) {
    window.refreshDashboard = () => DashboardClientNotion.refresh();
}

// Auto-initialisation
document.addEventListener('DOMContentLoaded', () => {
    // Attendre que NotionConnector soit prêt
    const checkNotionConnector = setInterval(() => {
        if (window.NotionConnector && window.AuthNotionModule) {
            clearInterval(checkNotionConnector);
            DashboardClientNotion.init();
        }
    }, 100);
});

// Export global
window.DashboardClientNotion = DashboardClientNotion;