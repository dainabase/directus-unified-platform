// timetracking-notion.js - Intégration Notion pour le suivi du temps
// Ce fichier gère la connexion avec les bases de données Notion pour le time tracking

const TimeTrackingNotion = {
    // Configuration
    DB_IDS: {
        TIME_ENTRIES: '269adb95-3c6f-8089-c753-ggf8e0d6f745',
        PROJECTS_TIME: '236adb95-3c6f-8024-94b1-ef0928d5c8a9',
        TASKS_TIME: '247adb95-3c6f-8056-b864-10f864e9dc43',
        CLIENTS_TIME: '223adb95-3c6f-80e7-aa2b-cfd9888f2af3'
    },
    
    // État local
    currentTimer: null,
    activeEntry: null,
    allTimeEntries: [],
    currentView: 'timer', // timer, timesheet, reports, settings
    currentPeriod: 'week',
    timerInterval: null,
    
    // Initialisation
    init() {
        console.log('🔌 Initialisation du time tracking avec Notion');
        this.loadTimeEntries();
        this.attachEventListeners();
        this.initializeTimer();
        this.checkActiveTimer();
    },
    
    // Attacher les écouteurs d'événements
    attachEventListeners() {
        // Boutons du timer
        const startBtn = document.getElementById('start-timer');
        const stopBtn = document.getElementById('stop-timer');
        const pauseBtn = document.getElementById('pause-timer');
        
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startTimer());
        }
        if (stopBtn) {
            stopBtn.addEventListener('click', () => this.stopTimer());
        }
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => this.pauseTimer());
        }
        
        // Changement de vue
        document.querySelectorAll('[data-timetracking-view]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchView(e.target.dataset.timetrackingView);
            });
        });
        
        // Sélecteur de période
        const periodSelector = document.getElementById('timesheet-period');
        if (periodSelector) {
            periodSelector.addEventListener('change', (e) => {
                this.currentPeriod = e.target.value;
                this.loadTimeEntries();
            });
        }
        
        // Filtres
        document.querySelectorAll('[data-filter-timesheet]').forEach(filter => {
            filter.addEventListener('click', (e) => {
                e.preventDefault();
                this.filterTimesheet(e.target.dataset.filterTimesheet);
            });
        });
        
        // Nouvelle entrée manuelle
        const manualEntryBtn = document.getElementById('add-manual-entry');
        if (manualEntryBtn) {
            manualEntryBtn.addEventListener('click', () => this.showManualEntryModal());
        }
        
        // Export
        const exportBtn = document.getElementById('export-timesheet');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportTimesheet());
        }
        
        // Raccourcis clavier
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Shift + T pour démarrer/arrêter le timer
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
                e.preventDefault();
                if (this.activeEntry) {
                    this.stopTimer();
                } else {
                    this.startTimer();
                }
            }
        });
    },
    
    // Vérifier s'il y a un timer actif
    async checkActiveTimer() {
        try {
            const currentUser = window.AuthNotionModule?.getCurrentUser();
            if (!currentUser) return;
            
            // Vérifier les permissions pour voir le time tracking
            const canViewTime = await window.PermissionsNotion.checkPermission(
                currentUser.id,
                'timetracking',
                'view.own'
            );
            
            if (!canViewTime) {
                console.warn('Pas de permission pour le time tracking');
                return;
            }
            
            // Récupérer le timer actif éventuel
            const activeTimer = await window.PermissionsMiddleware.secureApiCall(
                'timetracking',
                'view',
                this.getActiveTimer.bind(this),
                currentUser.id
            );
            
            if (activeTimer) {
                this.activeEntry = activeTimer;
                this.resumeTimer();
            }
            
        } catch (error) {
            console.error('Erreur vérification timer actif:', error);
        }
    },
    
    // Charger les entrées de temps depuis Notion
    async loadTimeEntries() {
        try {
            // Récupérer l'utilisateur connecté
            const currentUser = window.AuthNotionModule?.getCurrentUser();
            if (!currentUser) {
                console.warn('Utilisateur non connecté');
                return;
            }
            
            // Vérifier les permissions pour voir le time tracking
            const canViewTime = await window.PermissionsNotion.checkPermission(
                currentUser.id,
                'timetracking',
                'view.own'
            );
            
            if (!canViewTime) {
                window.showNotification('Vous n\'avez pas accès au time tracking', 'error');
                return;
            }
            
            // Afficher le loader
            this.showLoadingState();
            
            // Récupérer les entrées avec le middleware sécurisé
            const entries = await window.PermissionsMiddleware.secureApiCall(
                'timetracking',
                'view',
                this.getUserTimeEntries.bind(this),
                currentUser.id,
                this.currentPeriod
            );
            
            // Enrichir les données
            const enrichedEntries = this.enrichTimeEntries(entries);
            
            // Stocker les entrées
            this.allTimeEntries = enrichedEntries;
            
            // Mettre à jour l'interface
            this.updateTimeTrackingView();
            this.updateTimeStats(enrichedEntries);
            
            // Cacher le loader
            this.hideLoadingState();
            
            // Logger l'accès
            await window.PermissionsNotion.logAccess('view', 'timetracking', true, {
                entriesCount: entries.length,
                period: this.currentPeriod,
                userId: currentUser.id
            });
            
        } catch (error) {
            console.error('Erreur lors du chargement des entrées:', error);
            this.showErrorState();
            
            if (window.PermissionsNotion) {
                await window.PermissionsNotion.logAccess('view', 'timetracking', false, {
                    error: error.message
                });
            }
        }
    },
    
    // Récupérer le timer actif (stub)
    async getActiveTimer(userId) {
        // TODO: Implémenter la vraie requête Notion
        const savedTimer = localStorage.getItem(`timer_${userId}`);
        if (savedTimer) {
            return JSON.parse(savedTimer);
        }
        return null;
    },
    
    // Récupérer les entrées de temps de l'utilisateur (stub)
    async getUserTimeEntries(userId, period) {
        // TODO: Implémenter la vraie requête Notion
        const now = new Date();
        const entries = [
            {
                id: 'entry1',
                userId: userId,
                project: 'API TechCorp',
                client: 'TechCorp SA',
                task: 'Développement endpoints REST',
                description: 'Implémentation des endpoints pour la gestion des utilisateurs',
                startTime: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
                endTime: new Date(now - 30 * 60 * 1000).toISOString(),
                duration: 90 * 60, // 90 minutes en secondes
                billable: true,
                rate: 150,
                tags: ['backend', 'api', 'développement'],
                status: 'completed'
            },
            {
                id: 'entry2',
                userId: userId,
                project: 'Design System',
                client: 'DesignStudio',
                task: 'Révision composants UI',
                description: 'Review et optimisation des composants React',
                startTime: new Date(now - 24 * 60 * 60 * 1000).toISOString(),
                endTime: new Date(now - 22 * 60 * 60 * 1000).toISOString(),
                duration: 120 * 60, // 120 minutes
                billable: true,
                rate: 120,
                tags: ['frontend', 'design', 'review'],
                status: 'completed'
            },
            {
                id: 'entry3',
                userId: userId,
                project: 'Formation interne',
                client: 'Interne',
                task: 'Préparation formation Git',
                description: 'Création des supports de formation',
                startTime: new Date(now - 48 * 60 * 60 * 1000).toISOString(),
                endTime: new Date(now - 46 * 60 * 60 * 1000).toISOString(),
                duration: 120 * 60,
                billable: false,
                rate: 0,
                tags: ['formation', 'interne'],
                status: 'completed'
            }
        ];
        
        // Filtrer selon la période
        return this.filterEntriesByPeriod(entries, period);
    },
    
    // Démarrer le timer
    async startTimer() {
        try {
            const currentUser = window.AuthNotionModule?.getCurrentUser();
            if (!currentUser) return;
            
            // Vérifier les permissions pour créer des entrées
            const canCreateTime = await window.PermissionsNotion.checkPermission(
                currentUser.id,
                'timetracking',
                'create'
            );
            
            if (!canCreateTime) {
                window.showNotification('Vous n\'avez pas le droit de tracker du temps', 'error');
                return;
            }
            
            // Demander les détails du projet/tâche
            const entryDetails = await this.promptTimerDetails();
            if (!entryDetails) return;
            
            // Créer une nouvelle entrée
            this.activeEntry = {
                id: `temp_${Date.now()}`,
                userId: currentUser.id,
                project: entryDetails.project,
                client: entryDetails.client,
                task: entryDetails.task,
                description: entryDetails.description,
                startTime: new Date().toISOString(),
                endTime: null,
                duration: 0,
                billable: entryDetails.billable,
                rate: entryDetails.rate || this.getDefaultRate(currentUser),
                tags: entryDetails.tags || [],
                status: 'active'
            };
            
            // Sauvegarder localement
            localStorage.setItem(`timer_${currentUser.id}`, JSON.stringify(this.activeEntry));
            
            // Démarrer l'interval de mise à jour
            this.timerInterval = setInterval(() => {
                this.updateTimerDisplay();
            }, 1000);
            
            // Mettre à jour l'interface
            this.updateTimerUI('running');
            
            window.showNotification('Timer démarré', 'success');
            
            // Logger l'action
            await window.PermissionsNotion.logAccess('create', 'timetracking.timer', true, {
                project: entryDetails.project,
                billable: entryDetails.billable
            });
            
        } catch (error) {
            console.error('Erreur démarrage timer:', error);
            window.showNotification('Erreur lors du démarrage du timer', 'error');
        }
    },
    
    // Arrêter le timer
    async stopTimer() {
        try {
            if (!this.activeEntry) return;
            
            const currentUser = window.AuthNotionModule?.getCurrentUser();
            if (!currentUser) return;
            
            // Calculer la durée finale
            const endTime = new Date();
            const startTime = new Date(this.activeEntry.startTime);
            const duration = Math.floor((endTime - startTime) / 1000); // en secondes
            
            // Mettre à jour l'entrée
            this.activeEntry.endTime = endTime.toISOString();
            this.activeEntry.duration = duration;
            this.activeEntry.status = 'completed';
            
            // Sauvegarder dans Notion via le middleware sécurisé
            await window.PermissionsMiddleware.secureApiCall(
                'timetracking',
                'create',
                this.saveTimeEntry.bind(this),
                this.activeEntry
            );
            
            // Nettoyer
            clearInterval(this.timerInterval);
            localStorage.removeItem(`timer_${currentUser.id}`);
            this.activeEntry = null;
            
            // Mettre à jour l'interface
            this.updateTimerUI('stopped');
            await this.loadTimeEntries();
            
            window.showNotification('Timer arrêté et sauvegardé', 'success');
            
            // Logger l'action
            await window.PermissionsNotion.logAccess('create', 'timetracking.entry', true, {
                duration: duration,
                billable: this.activeEntry?.billable
            });
            
        } catch (error) {
            console.error('Erreur arrêt timer:', error);
            window.showNotification('Erreur lors de l\'arrêt du timer', 'error');
        }
    },
    
    // Mettre en pause le timer
    pauseTimer() {
        if (!this.activeEntry || this.activeEntry.status !== 'active') return;
        
        clearInterval(this.timerInterval);
        this.activeEntry.status = 'paused';
        this.activeEntry.pausedAt = new Date().toISOString();
        
        // Sauvegarder l'état
        const currentUser = window.AuthNotionModule?.getCurrentUser();
        if (currentUser) {
            localStorage.setItem(`timer_${currentUser.id}`, JSON.stringify(this.activeEntry));
        }
        
        this.updateTimerUI('paused');
        window.showNotification('Timer mis en pause', 'info');
    },
    
    // Reprendre le timer
    resumeTimer() {
        if (!this.activeEntry) return;
        
        // Si le timer était en pause, ajuster le startTime
        if (this.activeEntry.status === 'paused' && this.activeEntry.pausedAt) {
            const pauseDuration = new Date() - new Date(this.activeEntry.pausedAt);
            const originalStart = new Date(this.activeEntry.startTime);
            this.activeEntry.startTime = new Date(originalStart.getTime() + pauseDuration).toISOString();
            delete this.activeEntry.pausedAt;
        }
        
        this.activeEntry.status = 'active';
        
        // Redémarrer l'interval
        this.timerInterval = setInterval(() => {
            this.updateTimerDisplay();
        }, 1000);
        
        this.updateTimerUI('running');
    },
    
    // Mettre à jour l'affichage du timer
    updateTimerDisplay() {
        if (!this.activeEntry || !this.activeEntry.startTime) return;
        
        const now = new Date();
        const start = new Date(this.activeEntry.startTime);
        const duration = Math.floor((now - start) / 1000);
        
        const hours = Math.floor(duration / 3600);
        const minutes = Math.floor((duration % 3600) / 60);
        const seconds = duration % 60;
        
        const timerDisplay = document.getElementById('timer-display');
        if (timerDisplay) {
            timerDisplay.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }
        
        // Mettre à jour le titre de la page
        document.title = `${hours}:${String(minutes).padStart(2, '0')} - ${this.activeEntry.task || 'Timer actif'}`;
    },
    
    // Initialiser l'interface du timer
    initializeTimer() {
        const timerDisplay = document.getElementById('timer-display');
        if (timerDisplay) {
            timerDisplay.textContent = '00:00:00';
        }
    },
    
    // Enrichir les données des entrées
    enrichTimeEntries(entries) {
        return entries.map(entry => ({
            ...entry,
            formattedDate: this.formatDate(entry.startTime),
            formattedStartTime: this.formatTime(entry.startTime),
            formattedEndTime: entry.endTime ? this.formatTime(entry.endTime) : null,
            formattedDuration: this.formatDuration(entry.duration),
            totalAmount: entry.billable ? (entry.duration / 3600) * entry.rate : 0,
            durationHours: Math.round((entry.duration / 3600) * 100) / 100,
            isToday: this.isToday(entry.startTime),
            isThisWeek: this.isThisWeek(entry.startTime)
        }));
    },
    
    // Mettre à jour la vue du time tracking
    updateTimeTrackingView() {
        switch (this.currentView) {
            case 'timer':
                this.renderTimerView();
                break;
            case 'timesheet':
                this.renderTimesheetView();
                break;
            case 'reports':
                this.renderReportsView();
                break;
            case 'settings':
                this.renderSettingsView();
                break;
        }
    },
    
    // Afficher la vue timer
    renderTimerView() {
        const container = document.getElementById('timetracking-container');
        if (!container) return;
        
        const recentEntries = this.allTimeEntries.slice(0, 5);
        
        container.innerHTML = `
            <div class="row g-4">
                <!-- Timer principal -->
                <div class="col-12">
                    <div class="card">
                        <div class="card-body text-center py-5">
                            <div class="mb-4">
                                <h1 id="timer-display" class="display-1 fw-bold text-primary">00:00:00</h1>
                                ${this.activeEntry ? `
                                    <div class="mt-3">
                                        <h4>${this.activeEntry.task}</h4>
                                        <p class="text-muted">${this.activeEntry.project} - ${this.activeEntry.client}</p>
                                    </div>
                                ` : ''}
                            </div>
                            
                            <div class="btn-list justify-content-center">
                                ${!this.activeEntry ? `
                                    <button class="btn btn-primary btn-lg" id="start-timer-main">
                                        <i class="ti ti-player-play"></i> Démarrer
                                    </button>
                                ` : this.activeEntry.status === 'paused' ? `
                                    <button class="btn btn-primary btn-lg" id="resume-timer-main">
                                        <i class="ti ti-player-play"></i> Reprendre
                                    </button>
                                    <button class="btn btn-danger btn-lg" id="stop-timer-main">
                                        <i class="ti ti-player-stop"></i> Arrêter
                                    </button>
                                ` : `
                                    <button class="btn btn-warning btn-lg" id="pause-timer-main">
                                        <i class="ti ti-player-pause"></i> Pause
                                    </button>
                                    <button class="btn btn-danger btn-lg" id="stop-timer-main">
                                        <i class="ti ti-player-stop"></i> Arrêter
                                    </button>
                                `}
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Entrées récentes -->
                <div class="col-12">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Entrées récentes</h3>
                            <div class="card-actions">
                                <a href="#" onclick="TimeTrackingNotion.switchView('timesheet'); return false;">
                                    Voir tout <i class="ti ti-arrow-right ms-1"></i>
                                </a>
                            </div>
                        </div>
                        <div class="list-group list-group-flush">
                            ${recentEntries.length > 0 ? recentEntries.map(entry => `
                                <div class="list-group-item">
                                    <div class="row align-items-center">
                                        <div class="col-auto">
                                            <span class="status-dot ${entry.billable ? 'bg-success' : 'bg-secondary'} d-block"></span>
                                        </div>
                                        <div class="col">
                                            <div class="text-body d-block">${entry.task}</div>
                                            <div class="d-block text-muted text-truncate mt-n1">
                                                ${entry.project} - ${entry.client}
                                            </div>
                                        </div>
                                        <div class="col-auto">
                                            <div class="font-weight-medium">${entry.formattedDuration}</div>
                                            ${entry.billable ? `
                                                <div class="text-success small">
                                                    ${window.NotionConnector.utils.formatCurrency(entry.totalAmount)}
                                                </div>
                                            ` : ''}
                                        </div>
                                        <div class="col-auto">
                                            <div class="dropdown">
                                                <button class="btn btn-sm btn-ghost-secondary" data-bs-toggle="dropdown">
                                                    <i class="ti ti-dots-vertical"></i>
                                                </button>
                                                <ul class="dropdown-menu dropdown-menu-end">
                                                    <li>
                                                        <a class="dropdown-item" href="#" 
                                                           onclick="TimeTrackingNotion.editEntry('${entry.id}'); return false;">
                                                            <i class="ti ti-edit me-2"></i>
                                                            Modifier
                                                        </a>
                                                    </li>
                                                    <li>
                                                        <a class="dropdown-item" href="#" 
                                                           onclick="TimeTrackingNotion.duplicateEntry('${entry.id}'); return false;">
                                                            <i class="ti ti-copy me-2"></i>
                                                            Dupliquer
                                                        </a>
                                                    </li>
                                                    <li><hr class="dropdown-divider"></li>
                                                    <li>
                                                        <a class="dropdown-item text-danger" href="#" 
                                                           onclick="TimeTrackingNotion.deleteEntry('${entry.id}'); return false;">
                                                            <i class="ti ti-trash me-2"></i>
                                                            Supprimer
                                                        </a>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            `).join('') : `
                                <div class="list-group-item text-center text-muted py-4">
                                    Aucune entrée récente
                                </div>
                            `}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Réattacher les événements du timer principal
        if (!this.activeEntry) {
            const startMainBtn = document.getElementById('start-timer-main');
            if (startMainBtn) {
                startMainBtn.addEventListener('click', () => this.startTimer());
            }
        } else if (this.activeEntry.status === 'paused') {
            const resumeMainBtn = document.getElementById('resume-timer-main');
            const stopMainBtn = document.getElementById('stop-timer-main');
            if (resumeMainBtn) {
                resumeMainBtn.addEventListener('click', () => this.resumeTimer());
            }
            if (stopMainBtn) {
                stopMainBtn.addEventListener('click', () => this.stopTimer());
            }
        } else {
            const pauseMainBtn = document.getElementById('pause-timer-main');
            const stopMainBtn = document.getElementById('stop-timer-main');
            if (pauseMainBtn) {
                pauseMainBtn.addEventListener('click', () => this.pauseTimer());
            }
            if (stopMainBtn) {
                stopMainBtn.addEventListener('click', () => this.stopTimer());
            }
        }
        
        // Mettre à jour l'affichage si timer actif
        if (this.activeEntry) {
            this.updateTimerDisplay();
        }
    },
    
    // Afficher la vue timesheet
    renderTimesheetView() {
        const container = document.getElementById('timetracking-container');
        if (!container) return;
        
        const groupedEntries = this.groupEntriesByDate(this.allTimeEntries);
        
        container.innerHTML = `
            <div class="row g-4">
                <!-- En-tête avec actions -->
                <div class="col-12">
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <h2>Feuille de temps</h2>
                        <div class="btn-list">
                            <button class="btn btn-primary" onclick="TimeTrackingNotion.showManualEntryModal()">
                                <i class="ti ti-plus"></i> Nouvelle entrée
                            </button>
                            <button class="btn btn-secondary" onclick="TimeTrackingNotion.exportTimesheet()">
                                <i class="ti ti-download"></i> Exporter
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- Timesheet -->
                <div class="col-12">
                    ${Object.entries(groupedEntries).map(([date, entries]) => {
                        const totalDuration = entries.reduce((sum, e) => sum + e.duration, 0);
                        const totalBillable = entries.filter(e => e.billable).reduce((sum, e) => sum + e.totalAmount, 0);
                        
                        return `
                            <div class="card mb-3">
                                <div class="card-header">
                                    <h4 class="card-title">${this.formatDateHeader(date)}</h4>
                                    <div class="card-subtitle">
                                        ${this.formatDuration(totalDuration)} total
                                        ${totalBillable > 0 ? `• ${window.NotionConnector.utils.formatCurrency(totalBillable)} facturable` : ''}
                                    </div>
                                </div>
                                <div class="table-responsive">
                                    <table class="table table-vcenter card-table">
                                        <thead>
                                            <tr>
                                                <th>Projet / Tâche</th>
                                                <th>Client</th>
                                                <th>Heure</th>
                                                <th>Durée</th>
                                                <th>Facturable</th>
                                                <th class="w-1"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${entries.map(entry => `
                                                <tr>
                                                    <td>
                                                        <div class="text-body">${entry.task}</div>
                                                        <div class="text-muted small">${entry.project}</div>
                                                        ${entry.description ? `
                                                            <div class="text-muted small mt-1">${entry.description}</div>
                                                        ` : ''}
                                                    </td>
                                                    <td class="text-muted">${entry.client}</td>
                                                    <td class="text-muted">
                                                        ${entry.formattedStartTime} - ${entry.formattedEndTime || 'En cours'}
                                                    </td>
                                                    <td>
                                                        <div class="font-weight-medium">${entry.formattedDuration}</div>
                                                    </td>
                                                    <td>
                                                        ${entry.billable ? `
                                                            <span class="badge badge-success-lt">
                                                                ${window.NotionConnector.utils.formatCurrency(entry.totalAmount)}
                                                            </span>
                                                        ` : `
                                                            <span class="text-muted">Non facturable</span>
                                                        `}
                                                    </td>
                                                    <td>
                                                        <div class="btn-list flex-nowrap">
                                                            <button class="btn btn-sm btn-ghost-secondary" 
                                                                    onclick="TimeTrackingNotion.editEntry('${entry.id}')"
                                                                    data-bs-toggle="tooltip" 
                                                                    title="Modifier">
                                                                <i class="ti ti-edit"></i>
                                                            </button>
                                                            <button class="btn btn-sm btn-ghost-secondary" 
                                                                    onclick="TimeTrackingNotion.duplicateEntry('${entry.id}')"
                                                                    data-bs-toggle="tooltip" 
                                                                    title="Dupliquer">
                                                                <i class="ti ti-copy"></i>
                                                            </button>
                                                            <button class="btn btn-sm btn-ghost-danger" 
                                                                    onclick="TimeTrackingNotion.deleteEntry('${entry.id}')"
                                                                    data-bs-toggle="tooltip" 
                                                                    title="Supprimer">
                                                                <i class="ti ti-trash"></i>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            `).join('')}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    },
    
    // Mettre à jour les statistiques
    updateTimeStats(entries) {
        const stats = {
            totalTime: entries.reduce((sum, e) => sum + e.duration, 0),
            billableTime: entries.filter(e => e.billable).reduce((sum, e) => sum + e.duration, 0),
            nonBillableTime: entries.filter(e => !e.billable).reduce((sum, e) => sum + e.duration, 0),
            totalAmount: entries.filter(e => e.billable).reduce((sum, e) => sum + e.totalAmount, 0),
            averageDaily: this.calculateAverageDailyTime(entries),
            productivity: this.calculateProductivity(entries),
            topProjects: this.getTopProjects(entries),
            topClients: this.getTopClients(entries)
        };
        
        // Mettre à jour les KPIs
        const updateStat = (id, value) => {
            const element = document.getElementById(id);
            if (element) {
                if (id.includes('amount')) {
                    element.textContent = window.NotionConnector.utils.formatCurrency(value);
                } else if (id.includes('time')) {
                    element.textContent = this.formatDuration(value);
                } else {
                    element.textContent = value;
                }
            }
        };
        
        updateStat('total-time-tracked', stats.totalTime);
        updateStat('billable-time', stats.billableTime);
        updateStat('non-billable-time', stats.nonBillableTime);
        updateStat('total-billable-amount', stats.totalAmount);
        updateStat('average-daily-time', stats.averageDaily);
        updateStat('productivity-rate', stats.productivity + '%');
        
        // Mettre à jour la répartition facturable/non-facturable
        const billablePercentage = stats.totalTime > 0 ? Math.round((stats.billableTime / stats.totalTime) * 100) : 0;
        const billableProgress = document.getElementById('billable-progress');
        if (billableProgress) {
            billableProgress.style.width = billablePercentage + '%';
            billableProgress.textContent = billablePercentage + '%';
        }
    },
    
    // Demander les détails pour le timer
    async promptTimerDetails() {
        // TODO: Implémenter un modal approprié
        // Pour l'instant, utilisation de prompts simples
        const project = prompt('Projet:');
        if (!project) return null;
        
        const task = prompt('Tâche:');
        if (!task) return null;
        
        const client = prompt('Client:');
        if (!client) return null;
        
        const billable = confirm('Facturable ?');
        
        return {
            project,
            task,
            client,
            description: '',
            billable,
            rate: billable ? 150 : 0, // Taux par défaut
            tags: []
        };
    },
    
    // Obtenir le taux par défaut de l'utilisateur
    getDefaultRate(user) {
        // TODO: Récupérer depuis les paramètres utilisateur
        return user.role === 'prestataire' ? 150 : 0;
    },
    
    // Sauvegarder une entrée de temps (stub)
    async saveTimeEntry(entry) {
        // TODO: Implémenter la vraie sauvegarde dans Notion
        console.log('Sauvegarde entrée:', entry);
        return { success: true, id: entry.id };
    },
    
    // Actions sur les entrées
    async editEntry(entryId) {
        // TODO: Implémenter l'édition
        console.log('Édition entrée:', entryId);
    },
    
    async duplicateEntry(entryId) {
        try {
            const currentUser = window.AuthNotionModule?.getCurrentUser();
            if (!currentUser) return;
            
            // Vérifier les permissions
            const canCreate = await window.PermissionsNotion.checkPermission(
                currentUser.id,
                'timetracking',
                'create'
            );
            
            if (!canCreate) {
                window.showNotification('Vous n\'avez pas le droit de créer des entrées', 'error');
                return;
            }
            
            const entry = this.allTimeEntries.find(e => e.id === entryId);
            if (!entry) return;
            
            // Créer une copie avec nouvelle date
            const newEntry = {
                ...entry,
                id: `temp_${Date.now()}`,
                startTime: new Date().toISOString(),
                endTime: new Date(Date.now() + entry.duration * 1000).toISOString(),
                status: 'completed'
            };
            
            // Sauvegarder
            await window.PermissionsMiddleware.secureApiCall(
                'timetracking',
                'create',
                this.saveTimeEntry.bind(this),
                newEntry
            );
            
            window.showNotification('Entrée dupliquée', 'success');
            await this.loadTimeEntries();
            
        } catch (error) {
            console.error('Erreur duplication:', error);
        }
    },
    
    async deleteEntry(entryId) {
        try {
            const currentUser = window.AuthNotionModule?.getCurrentUser();
            if (!currentUser) return;
            
            // Vérifier les permissions
            const canDelete = await window.PermissionsNotion.checkPermission(
                currentUser.id,
                'timetracking',
                'delete.own'
            );
            
            if (!canDelete) {
                window.showNotification('Vous n\'avez pas le droit de supprimer des entrées', 'error');
                return;
            }
            
            if (!confirm('Supprimer cette entrée ?')) return;
            
            // TODO: Implémenter la suppression réelle
            window.showNotification('Entrée supprimée', 'success');
            await this.loadTimeEntries();
            
        } catch (error) {
            console.error('Erreur suppression:', error);
        }
    },
    
    // Exporter la feuille de temps
    async exportTimesheet() {
        try {
            const currentUser = window.AuthNotionModule?.getCurrentUser();
            if (!currentUser) return;
            
            // Vérifier les permissions
            const canExport = await window.PermissionsNotion.checkPermission(
                currentUser.id,
                'timetracking',
                'export'
            );
            
            if (!canExport) {
                window.showNotification('Vous n\'avez pas le droit d\'exporter', 'error');
                return;
            }
            
            window.showNotification('Export en cours...', 'info');
            
            // TODO: Implémenter l'export réel (CSV, PDF, etc.)
            
        } catch (error) {
            console.error('Erreur export:', error);
        }
    },
    
    // Changer de vue
    switchView(viewType) {
        this.currentView = viewType;
        
        // Mettre à jour les boutons
        document.querySelectorAll('[data-timetracking-view]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.timetrackingView === viewType);
        });
        
        // Mettre à jour l'affichage
        this.updateTimeTrackingView();
    },
    
    // Mettre à jour l'UI du timer
    updateTimerUI(state) {
        const startBtn = document.getElementById('start-timer');
        const stopBtn = document.getElementById('stop-timer');
        const pauseBtn = document.getElementById('pause-timer');
        
        switch (state) {
            case 'running':
                if (startBtn) startBtn.style.display = 'none';
                if (stopBtn) stopBtn.style.display = 'inline-block';
                if (pauseBtn) pauseBtn.style.display = 'inline-block';
                break;
            case 'paused':
                if (startBtn) {
                    startBtn.style.display = 'inline-block';
                    startBtn.innerHTML = '<i class="ti ti-player-play"></i> Reprendre';
                    startBtn.onclick = () => this.resumeTimer();
                }
                if (stopBtn) stopBtn.style.display = 'inline-block';
                if (pauseBtn) pauseBtn.style.display = 'none';
                break;
            case 'stopped':
                if (startBtn) {
                    startBtn.style.display = 'inline-block';
                    startBtn.innerHTML = '<i class="ti ti-player-play"></i> Démarrer';
                    startBtn.onclick = () => this.startTimer();
                }
                if (stopBtn) stopBtn.style.display = 'none';
                if (pauseBtn) pauseBtn.style.display = 'none';
                // Réinitialiser le titre
                document.title = 'Time Tracking';
                break;
        }
    },
    
    // Fonctions utilitaires
    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        });
    },
    
    formatDateHeader(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (date.toDateString() === today.toDateString()) {
            return "Aujourd'hui";
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Hier';
        } else {
            return this.formatDate(dateString);
        }
    },
    
    formatTime(dateString) {
        return new Date(dateString).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    },
    
    formatDuration(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes}min`;
        } else {
            return `${minutes}min`;
        }
    },
    
    isToday(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        return date.toDateString() === today.toDateString();
    },
    
    isThisWeek(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        
        return date >= weekStart && date <= weekEnd;
    },
    
    filterEntriesByPeriod(entries, period) {
        const now = new Date();
        let startDate;
        
        switch (period) {
            case 'today':
                startDate = new Date(now);
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'week':
                startDate = new Date(now);
                startDate.setDate(now.getDate() - now.getDay());
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            default:
                return entries;
        }
        
        return entries.filter(entry => new Date(entry.startTime) >= startDate);
    },
    
    groupEntriesByDate(entries) {
        const grouped = {};
        
        entries.forEach(entry => {
            const date = new Date(entry.startTime).toDateString();
            if (!grouped[date]) {
                grouped[date] = [];
            }
            grouped[date].push(entry);
        });
        
        // Trier par date décroissante
        const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));
        const sortedGrouped = {};
        sortedDates.forEach(date => {
            sortedGrouped[date] = grouped[date];
        });
        
        return sortedGrouped;
    },
    
    calculateAverageDailyTime(entries) {
        const dailyTotals = {};
        
        entries.forEach(entry => {
            const date = new Date(entry.startTime).toDateString();
            dailyTotals[date] = (dailyTotals[date] || 0) + entry.duration;
        });
        
        const days = Object.keys(dailyTotals).length;
        if (days === 0) return 0;
        
        const totalTime = Object.values(dailyTotals).reduce((sum, time) => sum + time, 0);
        return Math.round(totalTime / days);
    },
    
    calculateProductivity(entries) {
        if (entries.length === 0) return 0;
        
        const billableTime = entries.filter(e => e.billable).reduce((sum, e) => sum + e.duration, 0);
        const totalTime = entries.reduce((sum, e) => sum + e.duration, 0);
        
        return totalTime > 0 ? Math.round((billableTime / totalTime) * 100) : 0;
    },
    
    getTopProjects(entries) {
        const projects = {};
        
        entries.forEach(entry => {
            const project = entry.project || 'Sans projet';
            if (!projects[project]) {
                projects[project] = { time: 0, amount: 0 };
            }
            projects[project].time += entry.duration;
            projects[project].amount += entry.totalAmount || 0;
        });
        
        return Object.entries(projects)
            .sort((a, b) => b[1].time - a[1].time)
            .slice(0, 5)
            .map(([project, data]) => ({ project, ...data }));
    },
    
    getTopClients(entries) {
        const clients = {};
        
        entries.forEach(entry => {
            const client = entry.client || 'Sans client';
            if (!clients[client]) {
                clients[client] = { time: 0, amount: 0 };
            }
            clients[client].time += entry.duration;
            clients[client].amount += entry.totalAmount || 0;
        });
        
        return Object.entries(clients)
            .sort((a, b) => b[1].amount - a[1].amount)
            .slice(0, 5)
            .map(([client, data]) => ({ client, ...data }));
    },
    
    // États de chargement
    showLoadingState() {
        const container = document.getElementById('timetracking-container');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Chargement...</span>
                    </div>
                    <div class="text-muted mt-2">Chargement des entrées de temps...</div>
                </div>
            `;
        }
    },
    
    hideLoadingState() {
        // Le contenu est remplacé par les fonctions de rendu
    },
    
    showErrorState() {
        if (window.showNotification) {
            window.showNotification('Erreur lors du chargement des entrées', 'error');
        }
    },
    
    // Nettoyage
    destroy() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        document.title = 'Time Tracking';
    }
};

// Auto-initialisation
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('timetracking.html') || 
        window.location.pathname.includes('time-tracking.html')) {
        const checkNotionConnector = setInterval(() => {
            if (window.NotionConnector && window.AuthNotionModule && window.PermissionsNotion) {
                clearInterval(checkNotionConnector);
                TimeTrackingNotion.init();
            }
        }, 100);
    }
});

// Nettoyage lors du changement de page
window.addEventListener('beforeunload', () => {
    if (window.TimeTrackingNotion) {
        window.TimeTrackingNotion.destroy();
    }
});

// Export global
window.TimeTrackingNotion = TimeTrackingNotion;