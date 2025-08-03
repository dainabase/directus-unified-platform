/**
 * Missions Prestataire
 * Gestion des missions, tâches et système Kanban avec timer intégré
 */

// Variables globales
let currentTimer = null;
let timerInterval = null;
let kanbanInstances = {};
let currentFilters = {
    mission: 'all',
    priority: 'all',
    status: 'all'
};

// Données simulées des missions
const missionsData = {
    missions: [
        {
            id: 1,
            title: 'Développement API REST',
            client: 'TechCorp SA',
            project: 'Refonte Infrastructure',
            budget: 10000,
            used: 8500,
            deadline: '2024-01-25',
            status: 'active',
            priority: 'high',
            progress: 65,
            tasksCompleted: 13,
            totalTasks: 20,
            health: 85
        },
        {
            id: 2,
            title: 'App Mobile E-commerce',
            client: 'StartupFood',
            project: 'Nouvelle Application',
            budget: 12000,
            used: 4800,
            deadline: '2024-02-05',
            status: 'active',
            priority: 'medium',
            progress: 40,
            tasksCompleted: 8,
            totalTasks: 20,
            health: 92
        },
        {
            id: 3,
            title: 'Design System UI',
            client: 'DesignStudio',
            project: 'Refonte Design',
            budget: 6500,
            used: 4875,
            deadline: '2024-01-30',
            status: 'review',
            priority: 'high',
            progress: 75,
            tasksCompleted: 9,
            totalTasks: 12,
            health: 78
        },
        {
            id: 4,
            title: 'Migration Cloud AWS',
            client: 'MobileBanking',
            project: 'Infrastructure',
            budget: 15000,
            used: 4500,
            deadline: '2024-02-15',
            status: 'active',
            priority: 'medium',
            progress: 30,
            tasksCompleted: 6,
            totalTasks: 20,
            health: 95
        }
    ],
    pendingMissions: [
        {
            id: 5,
            title: 'E-commerce React',
            client: 'WebStore SA',
            description: 'Refonte complète de la boutique en ligne',
            skills: ['React', 'Stripe', 'API'],
            budget: 25000,
            deadline: '6 semaines',
            negotiable: true
        },
        {
            id: 6,
            title: 'Chatbot IA',
            client: 'TechAI Corp',
            description: 'Bot conversationnel avec IA générative',
            skills: ['Python', 'OpenAI', 'FastAPI'],
            budget: 18000,
            deadline: '4 semaines',
            negotiable: false
        }
    ]
};

// Classe de gestion des missions
class MissionsManager {
    constructor() {
        this.missions = missionsData.missions;
        this.pendingMissions = missionsData.pendingMissions;
        this.tasks = this.generateTasks();
    }
    
    init() {
        console.log('🎯 Initialisation MissionsManager');
        this.updateStatistics();
        this.initEventListeners();
    }
    
    // Générer des tâches simulées
    generateTasks() {
        return [
            {
                id: 1,
                title: 'Endpoints produits',
                description: 'Implémenter CRUD pour les produits avec validation',
                missionId: 1,
                mission: 'API REST',
                priority: 'high',
                status: 'todo',
                estimatedHours: 6,
                actualHours: 0,
                deadline: '2024-01-24',
                tags: ['Node.js', 'PostgreSQL'],
                assignee: 'Vous'
            },
            {
                id: 2,
                title: 'Panier d\'achat',
                description: 'Interface utilisateur pour gestion panier',
                missionId: 2,
                mission: 'E-commerce',
                priority: 'medium',
                status: 'todo',
                estimatedHours: 4,
                actualHours: 0,
                deadline: '2024-01-28',
                tags: ['React Native', 'Redux'],
                assignee: 'Vous'
            },
            {
                id: 3,
                title: 'Composants boutons',
                description: 'Créer variantes boutons pour design system',
                missionId: 3,
                mission: 'Design System',
                priority: 'low',
                status: 'todo',
                estimatedHours: 3,
                actualHours: 0,
                deadline: '2024-01-30',
                tags: ['Figma', 'CSS'],
                assignee: 'Vous'
            },
            {
                id: 4,
                title: 'Auth JWT',
                description: 'Système d\'authentification avec tokens',
                missionId: 1,
                mission: 'API REST',
                priority: 'high',
                status: 'inprogress',
                estimatedHours: 8,
                actualHours: 2.25,
                deadline: '2024-01-23',
                tags: ['JWT', 'Bcrypt'],
                assignee: 'Vous',
                timerActive: true
            },
            {
                id: 5,
                title: 'Paiement Stripe',
                description: 'Intégration API Stripe pour paiements',
                missionId: 2,
                mission: 'E-commerce',
                priority: 'medium',
                status: 'inprogress',
                estimatedHours: 5,
                actualHours: 1.5,
                deadline: '2024-01-26',
                tags: ['Stripe', 'Webhooks'],
                assignee: 'Vous'
            },
            {
                id: 6,
                title: 'Grille layout',
                description: 'Système de grille responsive CSS',
                missionId: 3,
                mission: 'Design System',
                priority: 'high',
                status: 'review',
                estimatedHours: 4,
                actualHours: 4,
                deadline: '2024-01-25',
                tags: ['CSS Grid', 'Flexbox'],
                assignee: 'Vous',
                reviewer: 'Marie D.'
            },
            {
                id: 7,
                title: 'Base de données',
                description: 'Setup PostgreSQL et migrations initiales',
                missionId: 1,
                mission: 'API REST',
                priority: 'high',
                status: 'done',
                estimatedHours: 4,
                actualHours: 3,
                deadline: '2024-01-22',
                completedDate: '2024-01-22',
                tags: ['PostgreSQL', 'Migrations'],
                assignee: 'Vous'
            },
            {
                id: 8,
                title: 'Setup projet',
                description: 'Configuration React Native et dépendances',
                missionId: 2,
                mission: 'E-commerce',
                priority: 'medium',
                status: 'done',
                estimatedHours: 3,
                actualHours: 2,
                deadline: '2024-01-21',
                completedDate: '2024-01-21',
                tags: ['React Native', 'Metro'],
                assignee: 'Vous'
            }
        ];
    }
    
    // Mettre à jour les statistiques
    updateStatistics() {
        const stats = this.calculateStatistics();
        
        // Mettre à jour les compteurs dans les en-têtes si on est sur la page appropriée
        if (document.getElementById('count-todo')) {
            document.getElementById('count-todo').textContent = stats.todo;
            document.getElementById('count-inprogress').textContent = stats.inprogress;
            document.getElementById('count-review').textContent = stats.review;
            document.getElementById('count-done').textContent = stats.done;
        }
    }
    
    // Calculer les statistiques
    calculateStatistics() {
        const taskCounts = this.tasks.reduce((acc, task) => {
            acc[task.status] = (acc[task.status] || 0) + 1;
            return acc;
        }, {});
        
        return {
            todo: taskCounts.todo || 0,
            inprogress: taskCounts.inprogress || 0,
            review: taskCounts.review || 0,
            done: taskCounts.done || 0,
            total: this.tasks.length
        };
    }
    
    // Initialiser les événements
    initEventListeners() {
        // Auto-save timer toutes les 30 secondes
        setInterval(() => {
            if (currentTimer) {
                this.saveTimerData();
            }
        }, 30000);
    }
    
    // Accepter une mission
    acceptMission(missionId) {
        const mission = this.pendingMissions.find(m => m.id === missionId);
        if (!mission) return;
        
        if (confirm(`Accepter la mission "${mission.title}" ?`)) {
            // Animation de la carte
            const card = document.querySelector(`[data-mission="${missionId}"]`);
            if (card) {
                card.classList.add('accepting');
                card.style.transform = 'scale(0.95)';
                card.style.opacity = '0.7';
            }
            
            setTimeout(() => {
                PortalApp.showToast('Mission acceptée ! Vous avez reçu le brief détaillé.', 'success');
                
                // Déplacer vers missions actives
                mission.status = 'active';
                mission.progress = 0;
                mission.tasksCompleted = 0;
                mission.totalTasks = 10;
                this.missions.push(mission);
                
                // Retirer des missions en attente
                const index = this.pendingMissions.findIndex(m => m.id === missionId);
                this.pendingMissions.splice(index, 1);
                
                if (card) {
                    card.remove();
                }
                
                // Mettre à jour les compteurs
                this.updateBadges();
                
            }, 1000);
        }
    }
    
    // Négocier une mission
    negotiateMission(missionId) {
        PortalApp.showToast('Ouverture de la négociation...', 'info');
        // Ouvrir modal de négociation (à implémenter)
    }
    
    // Refuser une mission
    declineMission(missionId) {
        if (confirm('Êtes-vous sûr de vouloir refuser cette mission ?')) {
            const index = this.pendingMissions.findIndex(m => m.id === missionId);
            this.pendingMissions.splice(index, 1);
            
            const card = document.querySelector(`[data-mission="${missionId}"]`);
            if (card) {
                card.style.animation = 'slideOut 0.5s ease-out forwards';
                setTimeout(() => card.remove(), 500);
            }
            
            PortalApp.showToast('Mission refusée', 'warning');
        }
    }
    
    // Calculer la santé d'une mission
    calculateHealth(mission) {
        let score = 100;
        
        const daysUntilDeadline = this.getDaysUntilDeadline(mission.deadline);
        const progressRatio = mission.tasksCompleted / mission.totalTasks;
        
        // Critères de santé
        if (daysUntilDeadline < 3) score -= 20;
        if (progressRatio < 0.7 && daysUntilDeadline < 5) score -= 15;
        if (mission.used / mission.budget > 0.9) score -= 10;
        
        return Math.max(0, score);
    }
    
    // Obtenir les jours jusqu'à la deadline
    getDaysUntilDeadline(deadline) {
        const now = new Date();
        const deadlineDate = new Date(deadline);
        const diffTime = deadlineDate - now;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    
    // Mettre à jour les badges
    updateBadges() {
        const activeMissions = this.missions.filter(m => m.status === 'active').length;
        const pendingMissions = this.pendingMissions.length;
        
        // Mettre à jour les badges dans le header
        const activeBadge = document.querySelector('.badge.bg-success');
        const pendingBadge = document.querySelector('.badge.bg-warning');
        
        if (activeBadge) {
            activeBadge.innerHTML = `<i class="ti ti-circle-check icon"></i> ${activeMissions} actives`;
        }
        if (pendingBadge) {
            pendingBadge.innerHTML = `<i class="ti ti-clock icon"></i> ${pendingMissions} en attente`;
        }
    }
    
    // Upload d'un livrable
    uploadDeliverable(missionId) {
        const modal = new bootstrap.Modal(document.getElementById('modal-upload'));
        modal.show();
        
        // Simuler l'upload avec progress bar
        document.getElementById('uploadBtn').addEventListener('click', () => {
            const progressBar = document.getElementById('uploadProgress');
            progressBar.style.display = 'block';
            let percent = 0;
            
            const interval = setInterval(() => {
                percent += 10;
                progressBar.querySelector('.progress-bar').style.width = percent + '%';
                
                if (percent >= 100) {
                    clearInterval(interval);
                    modal.hide();
                    PortalApp.showToast('Livrable envoyé au client !', 'success');
                    this.updateMissionProgress(missionId);
                }
            }, 200);
        });
    }
    
    // Mettre à jour le progrès d'une mission
    updateMissionProgress(missionId) {
        const mission = this.missions.find(m => m.id === missionId);
        if (mission) {
            mission.progress = Math.min(100, mission.progress + 10);
            mission.tasksCompleted += 1;
        }
    }
    
    // Sauvegarder les données du timer
    saveTimerData() {
        if (currentTimer) {
            const data = {
                taskId: currentTimer.taskId,
                startTime: currentTimer.startTime,
                totalTime: Date.now() - currentTimer.startTime
            };
            localStorage.setItem('activeTimer', JSON.stringify(data));
        }
    }
    
    // Restaurer le timer depuis le localStorage
    restoreTimer() {
        const saved = localStorage.getItem('activeTimer');
        if (saved) {
            const data = JSON.parse(saved);
            const task = this.tasks.find(t => t.id === data.taskId);
            if (task && task.status === 'inprogress') {
                this.startTaskTimer(data.taskId, data.startTime);
            }
        }
    }
    
    // Démarrer le timer pour une tâche
    startTaskTimer(taskId, startTime = null) {
        // Arrêter le timer actuel s'il existe
        if (currentTimer) {
            this.stopTaskTimer(currentTimer.taskId);
        }
        
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        currentTimer = {
            taskId: taskId,
            startTime: startTime || Date.now()
        };
        
        // Marquer la tâche comme ayant un timer actif
        task.timerActive = true;
        
        // Mettre à jour l'interface
        this.updateTimerDisplay(taskId);
        this.showActiveTimer();
        
        // Démarrer l'intervalle de mise à jour
        timerInterval = setInterval(() => {
            this.updateTimerDisplay(taskId);
        }, 1000);
        
        PortalApp.showToast(`Timer démarré pour "${task.title}"`, 'success');
    }
    
    // Arrêter le timer
    stopTaskTimer(taskId) {
        if (!currentTimer || currentTimer.taskId !== taskId) return;
        
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            // Calculer le temps passé
            const timeSpent = (Date.now() - currentTimer.startTime) / (1000 * 60 * 60); // en heures
            task.actualHours += timeSpent;
            task.timerActive = false;
            
            PortalApp.showToast(`Timer arrêté. Temps enregistré: ${this.formatTime(timeSpent * 3600000)}`, 'info');
        }
        
        // Nettoyer le timer
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        
        currentTimer = null;
        this.hideActiveTimer();
        localStorage.removeItem('activeTimer');
        
        // Mettre à jour l'interface
        this.updateTaskButtons(taskId);
    }
    
    // Mettre à jour l'affichage du timer
    updateTimerDisplay(taskId) {
        if (!currentTimer) return;
        
        const elapsed = Date.now() - currentTimer.startTime;
        const formattedTime = this.formatTime(elapsed);
        
        // Mettre à jour le timer dans la carte de tâche
        const taskTimer = document.querySelector(`#timer-${taskId}`);
        if (taskTimer) {
            taskTimer.textContent = formattedTime;
        }
        
        // Mettre à jour le widget timer global
        const globalTimer = document.getElementById('timerDisplay');
        if (globalTimer) {
            globalTimer.textContent = formattedTime;
        }
    }
    
    // Formater le temps en HH:MM:SS
    formatTime(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // Afficher le widget timer actif
    showActiveTimer() {
        const timerWidget = document.getElementById('activeTimer');
        if (timerWidget) {
            timerWidget.style.display = 'block';
        }
    }
    
    // Masquer le widget timer
    hideActiveTimer() {
        const timerWidget = document.getElementById('activeTimer');
        if (timerWidget) {
            timerWidget.style.display = 'none';
        }
    }
    
    // Mettre à jour les boutons de tâche
    updateTaskButtons(taskId) {
        const taskCard = document.querySelector(`[data-task-id="${taskId}"]`);
        if (!taskCard) return;
        
        const task = this.tasks.find(t => t.id === taskId);
        const actionsDiv = taskCard.querySelector('.task-actions');
        
        if (task && actionsDiv) {
            if (task.timerActive) {
                actionsDiv.innerHTML = `
                    <button class="btn btn-sm btn-danger w-100" onclick="window.missionsManager.stopTaskTimer(${taskId})">
                        <i class="ti ti-square-filled icon"></i>
                        Arrêter timer
                    </button>
                `;
            } else {
                actionsDiv.innerHTML = `
                    <button class="btn btn-sm btn-success w-100" onclick="window.missionsManager.startTaskTimer(${taskId})">
                        <i class="ti ti-play icon"></i>
                        Démarrer timer
                    </button>
                `;
            }
        }
    }
}

// Fonctions globales pour l'interface

// Filtrer les missions
function filterMissions(status) {
    currentFilters.status = status;
    
    const missions = document.querySelectorAll('.mission-card');
    missions.forEach(card => {
        const missionStatus = card.dataset.status;
        
        if (status === 'all' || missionStatus === status) {
            card.style.display = 'block';
            card.style.animation = 'fadeIn 0.3s ease';
        } else {
            card.style.display = 'none';
        }
    });
    
    // Mettre à jour le texte du bouton filtre
    const filterBtn = document.querySelector('.dropdown-toggle');
    const statusText = {
        'all': 'Toutes',
        'active': 'Actives',
        'completed': 'Terminées',
        'pending': 'En attente'
    };
    
    if (filterBtn) {
        filterBtn.innerHTML = `<i class="ti ti-filter icon"></i> Filtre: ${statusText[status]}`;
    }
}

// Demander de l'aide
function requestHelp(missionId) {
    PortalApp.showToast('Demande d\'aide envoyée à l\'équipe support', 'info');
}

// Reporter un problème
function reportIssue(missionId) {
    PortalApp.showToast('Problème signalé. Un responsable vous contactera sous peu.', 'warning');
}

// Upload de livrable
function uploadDeliverable(missionId) {
    if (window.missionsManager) {
        window.missionsManager.uploadDeliverable(missionId);
    }
}

// Accepter mission
function acceptMission(missionId) {
    if (window.missionsManager) {
        window.missionsManager.acceptMission(missionId);
    }
}

// Négocier mission
function negotiateMission(missionId) {
    if (window.missionsManager) {
        window.missionsManager.negotiateMission(missionId);
    }
}

// Refuser mission
function declineMission(missionId) {
    if (window.missionsManager) {
        window.missionsManager.declineMission(missionId);
    }
}

// Timer functions pour l'interface
function startTaskTimer(taskId) {
    if (window.missionsManager) {
        window.missionsManager.startTaskTimer(taskId);
    }
}

function stopTaskTimer(taskId) {
    if (window.missionsManager) {
        window.missionsManager.stopTaskTimer(taskId);
    }
}

function stopTimer() {
    if (currentTimer && window.missionsManager) {
        window.missionsManager.stopTaskTimer(currentTimer.taskId);
    }
}

function toggleActiveTimer() {
    if (currentTimer) {
        stopTimer();
    } else {
        // Démarrer le timer de la première tâche en cours
        const inProgressTask = document.querySelector('[data-status="inprogress"] .kanban-item');
        if (inProgressTask) {
            const taskId = parseInt(inProgressTask.dataset.taskId);
            startTaskTimer(taskId);
        }
    }
}

// Fonctions Kanban (pour tasks.html)
function initKanban() {
    console.log('🎯 Initialisation Kanban');
    
    // Initialiser SortableJS pour chaque colonne
    const columns = document.querySelectorAll('.kanban-items');
    columns.forEach(column => {
        const status = column.closest('.kanban-column').dataset.status;
        
        kanbanInstances[status] = new Sortable(column, {
            group: 'kanban',
            animation: 150,
            ghostClass: 'kanban-ghost',
            chosenClass: 'kanban-chosen',
            dragClass: 'kanban-drag',
            onEnd: function(evt) {
                const taskId = parseInt(evt.item.dataset.taskId);
                const newStatus = evt.to.closest('.kanban-column').dataset.status;
                updateTaskStatus(taskId, newStatus);
            }
        });
    });
    
    // Restaurer le timer s'il existe
    if (window.missionsManager) {
        window.missionsManager.restoreTimer();
    }
}

// Mettre à jour le statut d'une tâche
function updateTaskStatus(taskId, newStatus) {
    if (!window.missionsManager) return;
    
    const task = window.missionsManager.tasks.find(t => t.id === taskId);
    if (task) {
        const oldStatus = task.status;
        task.status = newStatus;
        
        // Si la tâche est déplacée vers "done", arrêter le timer
        if (newStatus === 'done' && task.timerActive) {
            window.missionsManager.stopTaskTimer(taskId);
            task.completedDate = new Date().toISOString().split('T')[0];
        }
        
        // Mettre à jour les compteurs
        window.missionsManager.updateStatistics();
        
        PortalApp.showToast(`Tâche "${task.title}" déplacée vers ${this.getStatusLabel(newStatus)}`, 'success');
    }
}

// Obtenir le label du statut
function getStatusLabel(status) {
    const labels = {
        'todo': 'À faire',
        'inprogress': 'En cours',
        'review': 'En review',
        'done': 'Terminé'
    };
    return labels[status] || status;
}

// Filtrer par mission
function filterByMission(missionId) {
    const tasks = document.querySelectorAll('.kanban-item');
    tasks.forEach(task => {
        const taskMission = task.dataset.mission;
        
        if (missionId === 'all' || taskMission === missionId) {
            task.style.display = 'block';
        } else {
            task.style.display = 'none';
        }
    });
}

// Filtrer par priorité
function filterByPriority(priority) {
    const tasks = document.querySelectorAll('.kanban-item');
    tasks.forEach(task => {
        const taskPriority = task.dataset.priority;
        
        if (priority === 'all' || taskPriority === priority) {
            task.style.display = 'block';
        } else {
            task.style.display = 'none';
        }
    });
}

// Ajouter une nouvelle tâche
function addNewTask() {
    const modal = new bootstrap.Modal(document.getElementById('modal-new-task'));
    modal.show();
}

// Créer une nouvelle tâche
function createTask() {
    const title = document.getElementById('taskTitle').value;
    const description = document.getElementById('taskDescription').value;
    const missionId = document.getElementById('taskMission').value;
    const priority = document.getElementById('taskPriority').value;
    const effort = document.getElementById('taskEffort').value;
    const deadline = document.getElementById('taskDeadline').value;
    const tags = document.getElementById('taskTags').value;
    
    if (!title.trim()) {
        PortalApp.showToast('Le titre est requis', 'error');
        return;
    }
    
    // Créer l'objet tâche
    const newTask = {
        id: Date.now(), // ID temporaire
        title: title,
        description: description,
        missionId: parseInt(missionId),
        mission: document.querySelector(`#taskMission option[value="${missionId}"]`).textContent.split(' - ')[0],
        priority: priority,
        status: 'todo',
        estimatedHours: parseFloat(effort) || 0,
        actualHours: 0,
        deadline: deadline,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        assignee: 'Vous'
    };
    
    // Ajouter à la liste des tâches
    if (window.missionsManager) {
        window.missionsManager.tasks.push(newTask);
        window.missionsManager.updateStatistics();
    }
    
    // Fermer le modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('modal-new-task'));
    modal.hide();
    
    // Réinitialiser le formulaire
    document.getElementById('taskTitle').value = '';
    document.getElementById('taskDescription').value = '';
    document.getElementById('taskEffort').value = '';
    document.getElementById('taskDeadline').value = '';
    document.getElementById('taskTags').value = '';
    
    PortalApp.showToast('Nouvelle tâche créée avec succès', 'success');
    
    // Recharger la page pour afficher la nouvelle tâche
    setTimeout(() => {
        window.location.reload();
    }, 1000);
}

// Modifier une tâche
function editTask(taskId) {
    PortalApp.showToast('Édition de tâche (modal à implémenter)', 'info');
}

// Supprimer une tâche
function deleteTask(taskId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
        if (window.missionsManager) {
            const index = window.missionsManager.tasks.findIndex(t => t.id === taskId);
            if (index > -1) {
                window.missionsManager.tasks.splice(index, 1);
                window.missionsManager.updateStatistics();
                
                const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
                if (taskElement) {
                    taskElement.remove();
                }
                
                PortalApp.showToast('Tâche supprimée', 'success');
            }
        }
    }
}

// Voir les commentaires de review
function viewReviewComments(taskId) {
    PortalApp.showToast('Ouverture des commentaires de review...', 'info');
}

// Afficher toutes les tâches terminées
function showAllCompletedTasks() {
    PortalApp.showToast('Vue étendue des tâches terminées', 'info');
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    // Auto-save timer data on page unload
    window.addEventListener('beforeunload', function() {
        if (window.missionsManager && currentTimer) {
            window.missionsManager.saveTimerData();
        }
    });
});