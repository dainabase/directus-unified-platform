// calendar-notion.js - Intégration Notion pour le calendrier prestataire
// Ce fichier gère la connexion avec les bases de données Notion pour le planning

const CalendarNotion = {
    // Configuration
    DB_IDS: {
        MISSIONS: '236adb95-3c6f-80ca-a317-c7ff9dc7153c',
        EVENTS: '236adb95-3c6f-8024-94b1-ef0928d5c8a9',
        TACHES: '227adb95-3c6f-8047-b7c1-e7d309071682'
    },
    
    // État local
    calendar: null,
    currentEvent: null,
    allEvents: [],
    
    // Initialisation
    init() {
        console.log('🔌 Initialisation du calendrier avec Notion');
        this.initializeCalendar();
        this.loadEvents();
        this.attachEventListeners();
    },
    
    // Initialiser FullCalendar
    initializeCalendar() {
        const calendarEl = document.getElementById('calendar');
        if (!calendarEl) return;
        
        this.calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            locale: 'fr',
            height: 'auto',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,listWeek'
            },
            buttonText: {
                today: "Aujourd'hui",
                month: 'Mois',
                week: 'Semaine',
                list: 'Liste'
            },
            weekends: true,
            weekNumbers: true,
            weekNumberCalculation: 'ISO',
            eventClick: (info) => this.showEventDetails(info.event),
            dateClick: (info) => this.handleDateClick(info),
            events: []
        });
        
        this.calendar.render();
    },
    
    // Attacher les écouteurs d'événements
    attachEventListeners() {
        // Filtres par type
        document.querySelectorAll('input[name="event-type"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => this.filterEvents());
        });
        
        // Bouton aujourd'hui
        const todayBtn = document.querySelector('[onclick="calendarToday()"]');
        if (todayBtn) {
            todayBtn.onclick = () => this.calendar.today();
        }
        
        // Bouton créer événement
        const createBtn = document.querySelector('[onclick="createEvent()"]');
        if (createBtn) {
            createBtn.onclick = () => this.createEvent();
        }
        
        // Bouton marquer fait
        const doneBtn = document.querySelector('[onclick="markEventDone()"]');
        if (doneBtn) {
            doneBtn.onclick = () => this.markEventDone();
        }
        
        // Bouton export
        const exportBtn = document.querySelector('[onclick="exportCalendar()"]');
        if (exportBtn) {
            exportBtn.onclick = () => this.exportCalendar();
        }
    },
    
    // Charger les événements depuis Notion
    async loadEvents() {
        try {
            // Récupérer l'utilisateur connecté
            const currentUser = window.AuthNotionModule?.getCurrentUser();
            if (!currentUser || currentUser.role !== 'prestataire') {
                console.warn('Utilisateur non connecté ou mauvais rôle');
                window.location.href = '/portal-project/login.html';
                return;
            }
            
            // Vérifier les permissions pour voir le calendrier
            const canViewCalendar = await window.PermissionsNotion.checkPermission(
                currentUser.id,
                'calendar',
                'view.own'
            );
            
            if (!canViewCalendar) {
                window.showNotification('Vous n\'avez pas accès au calendrier', 'error');
                window.location.href = `/${currentUser.role}/dashboard.html`;
                return;
            }
            
            // Afficher le loader
            this.showLoadingState();
            
            // Charger les événements en parallèle avec permissions
            const [missions, events] = await Promise.all([
                this.loadMissionEvents(currentUser.id),
                this.loadCustomEvents(currentUser.id)
            ]);
            
            // Combiner tous les événements
            this.allEvents = [...missions, ...events];
            
            // Mettre à jour le calendrier
            this.updateCalendarEvents(this.allEvents);
            
            // Mettre à jour les prochains événements
            this.updateUpcomingEvents(this.allEvents);
            
            // Cacher le loader
            this.hideLoadingState();
            
            // Logger l'accès
            await window.PermissionsNotion.logAccess('view', 'calendar', true, {
                eventCount: this.allEvents.length,
                prestataireId: currentUser.id
            });
            
        } catch (error) {
            console.error('Erreur lors du chargement du calendrier:', error);
            this.showErrorState();
            
            if (window.PermissionsNotion) {
                await window.PermissionsNotion.logAccess('view', 'calendar', false, {
                    error: error.message
                });
            }
        }
    },
    
    // Charger les événements des missions
    async loadMissionEvents(prestataireId) {
        try {
            // Vérifier les permissions pour voir les missions
            const canViewMissions = await window.PermissionsNotion.checkPermission(
                prestataireId,
                'missions',
                'view.assigned'
            );
            
            if (!canViewMissions) {
                console.warn('Pas de permission pour voir les missions');
                return [];
            }
            
            const missions = await window.PermissionsMiddleware.secureApiCall(
                'missions',
                'view',
                window.NotionConnector.prestataire.getPrestataireMissions.bind(window.NotionConnector.prestataire),
                prestataireId
            );
            
            // Convertir les missions en événements calendrier
            const missionEvents = [];
            
            missions.forEach(mission => {
                // Deadline de mission
                if (mission.deadline) {
                    missionEvents.push({
                        id: `mission-${mission.id}`,
                        title: `📋 ${mission.title}`,
                        start: mission.deadline,
                        allDay: true,
                        backgroundColor: '#d63939',
                        borderColor: '#d63939',
                        extendedProps: {
                            type: 'deadline',
                            source: 'mission',
                            project: mission.title,
                            client: mission.client,
                            description: `Deadline pour la mission: ${mission.description || mission.title}`,
                            priority: mission.priority,
                            status: mission.status
                        }
                    });
                }
                
                // Date de début si mission en cours
                if (mission.startDate && mission.status === 'En cours') {
                    missionEvents.push({
                        id: `mission-start-${mission.id}`,
                        title: `🚀 Début: ${mission.title}`,
                        start: mission.startDate,
                        allDay: true,
                        backgroundColor: '#2fb344',
                        borderColor: '#2fb344',
                        extendedProps: {
                            type: 'livrable',
                            source: 'mission',
                            project: mission.title,
                            client: mission.client,
                            description: `Début de la mission: ${mission.title}`
                        }
                    });
                }
            });
            
            return missionEvents;
            
        } catch (error) {
            console.error('Erreur chargement événements missions:', error);
            return [];
        }
    },
    
    // Charger les événements personnalisés
    async loadCustomEvents(prestataireId) {
        try {
            // Vérifier les permissions pour voir les événements personnalisés
            const canViewEvents = await window.PermissionsNotion.checkPermission(
                prestataireId,
                'events',
                'view.own'
            );
            
            if (!canViewEvents) {
                console.warn('Pas de permission pour voir les événements');
                return [];
            }
            
            // TODO: Implémenter la vraie requête Notion pour les événements
            // Pour l'instant, on simule avec des données de démo
            return [
                {
                    id: 'event-1',
                    title: 'Review Design',
                    start: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16), // Demain
                    end: new Date(Date.now() + 24 * 60 * 60 * 1000 + 90 * 60 * 1000).toISOString().slice(0, 16), // +1h30
                    backgroundColor: '#206bc4',
                    borderColor: '#206bc4',
                    extendedProps: {
                        type: 'meeting',
                        source: 'custom',
                        attendees: ['Marie D.', 'Jean P.'],
                        location: 'Zoom',
                        description: 'Review des maquettes pour validation'
                    }
                },
                {
                    id: 'event-2',
                    title: 'Formation React Avancé',
                    start: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), // Dans 5 jours
                    allDay: true,
                    backgroundColor: '#6f42c1',
                    borderColor: '#6f42c1',
                    extendedProps: {
                        type: 'formation',
                        source: 'custom',
                        instructor: 'Expert React',
                        description: 'Hooks avancés et optimisation performances'
                    }
                }
            ];
            
        } catch (error) {
            console.error('Erreur chargement événements personnalisés:', error);
            return [];
        }
    },
    
    // Mettre à jour les événements du calendrier
    updateCalendarEvents(events) {
        if (!this.calendar) return;
        
        // Supprimer tous les événements existants
        this.calendar.removeAllEvents();
        
        // Ajouter les nouveaux événements
        events.forEach(event => {
            this.calendar.addEvent(event);
        });
    },
    
    // Mettre à jour les prochains événements
    updateUpcomingEvents(events) {
        const container = document.querySelector('.list-group.list-group-flush');
        if (!container) return;
        
        // Filtrer et trier les événements à venir
        const now = new Date();
        const upcomingEvents = events
            .filter(event => new Date(event.start) > now)
            .sort((a, b) => new Date(a.start) - new Date(b.start))
            .slice(0, 5); // Top 5
        
        if (upcomingEvents.length === 0) {
            container.innerHTML = `
                <div class="list-group-item">
                    <div class="text-center text-muted py-3">
                        <i class="ti ti-calendar-off fs-2 mb-2"></i>
                        <p class="mb-0">Aucun événement à venir</p>
                    </div>
                </div>
            `;
            return;
        }
        
        container.innerHTML = upcomingEvents.map(event => `
            <div class="list-group-item">
                <div class="row align-items-center">
                    <div class="col-auto">
                        <span class="badge ${this.getEventBadgeClass(event.extendedProps.type)}">●</span>
                    </div>
                    <div class="col">
                        <div class="font-weight-medium">${event.title.replace(/[📋🚀]/g, '').trim()}</div>
                        <div class="text-muted small">${this.formatEventTime(event.start)}</div>
                    </div>
                </div>
            </div>
        `).join('');
    },
    
    // Filtrer les événements
    filterEvents() {
        if (!this.calendar) return;
        
        const checkedTypes = Array.from(document.querySelectorAll('input[name="event-type"]:checked'))
            .map(cb => cb.value);
        
        // Mettre à jour la visibilité des événements
        this.calendar.getEvents().forEach(event => {
            const eventType = event.extendedProps.type;
            if (checkedTypes.includes(eventType)) {
                event.setProp('display', 'auto');
            } else {
                event.setProp('display', 'none');
            }
        });
    },
    
    // Gérer le clic sur une date
    handleDateClick(info) {
        // Vérifier les permissions pour créer des événements
        const currentUser = window.AuthNotionModule?.getCurrentUser();
        if (!currentUser) return;
        
        window.PermissionsNotion.checkPermission(
            currentUser.id,
            'events',
            'create'
        ).then(canCreate => {
            if (!canCreate) {
                window.showNotification('Vous n\'avez pas le droit de créer des événements', 'error');
                return;
            }
            
            // Pré-remplir la date dans le modal
            const startField = document.getElementById('eventStart');
            if (startField) {
                startField.value = info.dateStr + 'T09:00';
            }
            
            const modal = new bootstrap.Modal(document.getElementById('modal-new-event'));
            modal.show();
        });
    },
    
    // Afficher les détails d'un événement
    showEventDetails(event) {
        this.currentEvent = event;
        const modal = new bootstrap.Modal(document.getElementById('modal-event-details'));
        
        document.getElementById('eventDetailsTitle').textContent = event.title.replace(/[📋🚀]/g, '').trim();
        
        const props = event.extendedProps;
        let detailsHtml = `
            <div class="mb-3">
                <div class="row">
                    <div class="col-auto">
                        <span class="badge bg-${this.getEventColor(props.type)}">${this.getEventTypeLabel(props.type)}</span>
                    </div>
                    ${props.source ? `
                        <div class="col-auto">
                            <span class="badge badge-outline">${props.source === 'mission' ? 'Mission' : 'Personnel'}</span>
                        </div>
                    ` : ''}
                </div>
            </div>
            <div class="mb-3">
                <label class="form-label">Date et heure</label>
                <div>${this.formatEventDate(event)}</div>
            </div>
        `;
        
        if (props.description) {
            detailsHtml += `
                <div class="mb-3">
                    <label class="form-label">Description</label>
                    <div>${props.description}</div>
                </div>
            `;
        }
        
        if (props.project) {
            detailsHtml += `
                <div class="mb-3">
                    <label class="form-label">Projet</label>
                    <div>${props.project}${props.client ? ' - ' + props.client : ''}</div>
                </div>
            `;
        }
        
        if (props.attendees && props.attendees.length > 0) {
            detailsHtml += `
                <div class="mb-3">
                    <label class="form-label">Participants</label>
                    <div>${props.attendees.join(', ')}</div>
                </div>
            `;
        }
        
        if (props.location) {
            detailsHtml += `
                <div class="mb-3">
                    <label class="form-label">Lieu</label>
                    <div>${props.location}</div>
                </div>
            `;
        }
        
        document.getElementById('eventDetailsBody').innerHTML = detailsHtml;
        modal.show();
    },
    
    // Créer un nouvel événement
    async createEvent() {
        try {
            const currentUser = window.AuthNotionModule?.getCurrentUser();
            if (!currentUser) return;
            
            // Vérifier les permissions pour créer des événements
            const canCreate = await window.PermissionsNotion.checkPermission(
                currentUser.id,
                'events',
                'create'
            );
            
            if (!canCreate) {
                window.showNotification('Vous n\'avez pas le droit de créer des événements', 'error');
                return;
            }
            
            const title = document.getElementById('eventTitle')?.value;
            const type = document.getElementById('eventType')?.value;
            const start = document.getElementById('eventStart')?.value;
            const end = document.getElementById('eventEnd')?.value || start;
            
            if (!title || !start) {
                window.showNotification('Veuillez remplir les champs obligatoires', 'error');
                return;
            }
            
            const eventData = {
                title: title,
                type: type,
                start: start,
                end: end,
                description: document.getElementById('eventDescription')?.value || '',
                projectId: document.getElementById('eventProject')?.value || null
            };
            
            // Créer l'événement via l'API sécurisée
            const newEvent = await window.PermissionsMiddleware.secureApiCall(
                'events',
                'create',
                this.createEventInNotion.bind(this),
                eventData
            );
            
            // Ajouter au calendrier
            this.calendar.addEvent({
                id: newEvent.id,
                title: title,
                start: start,
                end: end,
                backgroundColor: this.getEventColorCode(type),
                borderColor: this.getEventColorCode(type),
                extendedProps: {
                    type: type,
                    source: 'custom',
                    description: eventData.description
                }
            });
            
            // Fermer le modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('modal-new-event'));
            modal.hide();
            
            // Reset form
            document.getElementById('modal-new-event').querySelector('form')?.reset();
            
            window.showNotification('Événement créé avec succès', 'success');
            
            // Logger l'action
            await window.PermissionsNotion.logAccess('create', 'events', true, {
                eventTitle: title,
                eventType: type
            });
            
        } catch (error) {
            console.error('Erreur création événement:', error);
            window.showNotification('Erreur lors de la création de l\'événement', 'error');
            
            if (window.PermissionsNotion) {
                await window.PermissionsNotion.logAccess('create', 'events', false, {
                    error: error.message
                });
            }
        }
    },
    
    // Créer événement dans Notion (stub)
    async createEventInNotion(eventData) {
        // TODO: Implémenter la vraie création dans Notion
        return {
            id: Date.now().toString(),
            ...eventData
        };
    },
    
    // Marquer un événement comme terminé
    async markEventDone() {
        try {
            if (!this.currentEvent) return;
            
            const currentUser = window.AuthNotionModule?.getCurrentUser();
            if (!currentUser) return;
            
            // Vérifier les permissions pour modifier des événements
            const canUpdate = await window.PermissionsNotion.checkPermission(
                currentUser.id,
                'events',
                'update.own'
            );
            
            if (!canUpdate) {
                window.showNotification('Vous n\'avez pas le droit de modifier cet événement', 'error');
                return;
            }
            
            // Mettre à jour visuellement
            this.currentEvent.setProp('backgroundColor', '#626976');
            this.currentEvent.setProp('borderColor', '#626976');
            this.currentEvent.setExtendedProp('done', true);
            
            // Fermer le modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('modal-event-details'));
            modal.hide();
            
            window.showNotification('Événement marqué comme terminé', 'success');
            
            // Logger l'action
            await window.PermissionsNotion.logAccess('update', 'events', true, {
                eventId: this.currentEvent.id,
                action: 'mark_done'
            });
            
        } catch (error) {
            console.error('Erreur marquage événement:', error);
            window.showNotification('Erreur lors de la mise à jour', 'error');
        }
    },
    
    // Exporter le calendrier
    async exportCalendar() {
        try {
            const currentUser = window.AuthNotionModule?.getCurrentUser();
            if (!currentUser) return;
            
            // Vérifier les permissions pour exporter
            const canExport = await window.PermissionsNotion.checkPermission(
                currentUser.id,
                'calendar',
                'export'
            );
            
            if (!canExport) {
                window.showNotification('Vous n\'avez pas le droit d\'exporter le calendrier', 'error');
                return;
            }
            
            window.showNotification('Export iCal en cours...', 'info');
            
            // TODO: Implémenter l'export réel
            
            // Logger l'action
            await window.PermissionsNotion.logAccess('export', 'calendar', true, {
                eventCount: this.allEvents.length
            });
            
        } catch (error) {
            console.error('Erreur export calendrier:', error);
            window.showNotification('Erreur lors de l\'export', 'error');
        }
    },
    
    // Fonctions utilitaires
    getEventColor(type) {
        const colors = {
            deadline: 'red',
            meeting: 'blue',
            livrable: 'green',
            formation: 'purple'
        };
        return colors[type] || 'secondary';
    },
    
    getEventColorCode(type) {
        const colors = {
            deadline: '#d63939',
            meeting: '#206bc4',
            livrable: '#2fb344',
            formation: '#6f42c1'
        };
        return colors[type] || '#626976';
    },
    
    getEventBadgeClass(type) {
        const classes = {
            deadline: 'bg-red',
            meeting: 'bg-blue',
            livrable: 'bg-green',
            formation: 'bg-purple'
        };
        return classes[type] || 'bg-secondary';
    },
    
    getEventTypeLabel(type) {
        const labels = {
            deadline: 'Deadline',
            meeting: 'Meeting',
            livrable: 'Livrable',
            formation: 'Formation'
        };
        return labels[type] || type;
    },
    
    formatEventDate(event) {
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: event.allDay ? undefined : '2-digit',
            minute: event.allDay ? undefined : '2-digit'
        };
        
        let dateStr = event.start.toLocaleDateString('fr-FR', options);
        
        if (event.end && !event.allDay) {
            dateStr += ' - ' + event.end.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        }
        
        return dateStr;
    },
    
    formatEventTime(dateStr) {
        const date = new Date(dateStr);
        const now = new Date();
        const diffTime = date - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return "Aujourd'hui";
        if (diffDays === 1) return 'Demain';
        if (diffDays === -1) return 'Hier';
        if (diffDays > 1 && diffDays <= 7) return `Dans ${diffDays} jours`;
        if (diffDays < -1 && diffDays >= -7) return `Il y a ${Math.abs(diffDays)} jours`;
        
        return date.toLocaleDateString('fr-FR', { 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },
    
    // États de chargement
    showLoadingState() {
        const calendarEl = document.getElementById('calendar');
        if (calendarEl) {
            calendarEl.innerHTML = `
                <div class="text-center py-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Chargement...</span>
                    </div>
                    <div class="text-muted mt-2">Chargement du calendrier...</div>
                </div>
            `;
        }
    },
    
    hideLoadingState() {
        // Le calendrier se recharge automatiquement
    },
    
    showErrorState() {
        const calendarEl = document.getElementById('calendar');
        if (calendarEl) {
            calendarEl.innerHTML = `
                <div class="text-center py-5">
                    <i class="ti ti-alert-circle fs-1 text-danger mb-3"></i>
                    <h3 class="text-danger">Erreur de chargement</h3>
                    <p class="text-muted">Impossible de charger le calendrier</p>
                    <button class="btn btn-primary mt-2" onclick="CalendarNotion.loadEvents()">
                        Réessayer
                    </button>
                </div>
            `;
        }
        
        if (window.showNotification) {
            window.showNotification('Erreur lors du chargement du calendrier', 'error');
        }
    }
};

// Auto-initialisation
document.addEventListener('DOMContentLoaded', () => {
    // Vérifier qu'on est sur la page du calendrier
    if (window.location.pathname.includes('calendar.html')) {
        // Attendre que FullCalendar et les autres dépendances soient prêtes
        const checkDependencies = setInterval(() => {
            if (window.FullCalendar && window.NotionConnector && window.AuthNotionModule && window.PermissionsNotion) {
                clearInterval(checkDependencies);
                CalendarNotion.init();
            }
        }, 100);
    }
});

// Export global
window.CalendarNotion = CalendarNotion;