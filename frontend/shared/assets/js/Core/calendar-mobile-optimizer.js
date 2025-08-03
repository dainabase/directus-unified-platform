/**
 * Calendar Mobile Optimizer
 * Optimise l'affichage et les performances du calendrier sur mobile
 */

const CalendarMobileOptimizer = {
    /**
     * Initialiser l'optimiseur
     */
    init() {
        console.log('📅 Initialisation de l\'optimiseur calendrier mobile');
        
        this.createMobileStyles();
        this.detectMobile();
        this.optimizeExistingCalendars();
        this.setupTouchHandlers();
        this.observeCalendarChanges();
    },

    /**
     * Créer les styles pour mobile
     */
    createMobileStyles() {
        const styles = `
        <style>
        /* Optimisations calendrier mobile */
        @media (max-width: 768px) {
            /* FullCalendar mobile */
            .fc {
                font-size: 0.875rem;
            }
            
            .fc-toolbar {
                flex-direction: column;
                gap: 0.5rem;
            }
            
            .fc-toolbar-chunk {
                display: flex;
                justify-content: center;
                width: 100%;
            }
            
            .fc-toolbar-title {
                font-size: 1.125rem;
            }
            
            .fc-button-group {
                display: flex;
                width: 100%;
            }
            
            .fc-button {
                flex: 1;
                padding: 0.5rem 0.75rem;
                font-size: 0.875rem;
            }
            
            /* Vue jour mobile */
            .fc-dayGridDay-view .fc-daygrid-day-frame {
                min-height: 80px;
            }
            
            /* Vue mois mobile */
            .fc-dayGridMonth-view .fc-daygrid-day-number {
                font-size: 0.75rem;
                padding: 0.25rem;
            }
            
            .fc-dayGridMonth-view .fc-daygrid-event {
                font-size: 0.625rem;
                padding: 0 0.25rem;
            }
            
            .fc-dayGridMonth-view .fc-daygrid-day-events {
                margin-top: 0;
            }
            
            /* Vue liste mobile */
            .fc-list-view {
                font-size: 0.875rem;
            }
            
            .fc-list-day-cushion {
                padding: 0.5rem;
            }
            
            .fc-list-event-time {
                white-space: nowrap;
            }
            
            .fc-list-event-title {
                padding-left: 0.5rem;
            }
            
            /* Mode agenda mobile */
            .fc-timeGridWeek-view .fc-timegrid-slot {
                height: 40px;
            }
            
            .fc-timeGridWeek-view .fc-timegrid-slot-label {
                font-size: 0.75rem;
            }
            
            /* Popover événements */
            .fc-popover {
                max-width: 90vw;
            }
            
            .fc-popover-header {
                padding: 0.5rem;
                font-size: 0.875rem;
            }
            
            .fc-popover-body {
                padding: 0.5rem;
            }
            
            /* Optimisation swipe */
            .fc-view-harness {
                touch-action: pan-y;
            }
            
            .fc-scroller {
                -webkit-overflow-scrolling: touch;
                scroll-behavior: smooth;
            }
            
            /* Événements tactiles */
            .fc-event {
                cursor: pointer;
                -webkit-tap-highlight-color: rgba(0,0,0,0.1);
            }
            
            .fc-event:active {
                opacity: 0.8;
            }
            
            /* Indicateur de chargement mobile */
            .calendar-loading-mobile {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(255,255,255,0.95);
                padding: 1rem;
                border-radius: 0.5rem;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                z-index: 1000;
            }
            
            /* Navigation rapide mobile */
            .calendar-mobile-nav {
                position: fixed;
                bottom: 20px;
                right: 20px;
                display: flex;
                gap: 0.5rem;
                z-index: 100;
            }
            
            .calendar-mobile-nav .btn {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                padding: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            }
            
            /* Vue mini-calendrier */
            .calendar-mini-month {
                display: grid;
                grid-template-columns: repeat(7, 1fr);
                gap: 2px;
                font-size: 0.75rem;
                margin-bottom: 1rem;
            }
            
            .calendar-mini-day {
                aspect-ratio: 1;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 0.25rem;
                cursor: pointer;
            }
            
            .calendar-mini-day.has-events {
                background-color: var(--tblr-primary);
                color: white;
            }
            
            .calendar-mini-day.today {
                border: 2px solid var(--tblr-primary);
            }
            
            /* Mode compact mobile */
            .fc-mobile-compact .fc-event-title {
                display: none;
            }
            
            .fc-mobile-compact .fc-event-time {
                font-size: 0.625rem;
            }
            
            .fc-mobile-compact .fc-event {
                background-color: var(--tblr-primary);
                border: none;
                padding: 1px 3px;
            }
        }
        
        /* Gestes tactiles */
        .calendar-swipe-hint {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            opacity: 0;
            pointer-events: none;
            font-size: 2rem;
            color: var(--tblr-primary);
            animation: swipeHint 0.5s ease-out;
        }
        
        @keyframes swipeHint {
            0% {
                opacity: 0;
                transform: translate(-50%, -50%) scale(0.5);
            }
            50% {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1.2);
            }
            100% {
                opacity: 0;
                transform: translate(-50%, -50%) scale(1);
            }
        }
        
        /* Performance */
        @media (max-width: 768px) {
            /* Désactiver les animations coûteuses */
            .fc-event {
                transition: none !important;
            }
            
            /* Simplifier les ombres */
            .fc-popover,
            .fc-more-popover {
                box-shadow: 0 2px 5px rgba(0,0,0,0.15);
            }
            
            /* Réduire les re-rendus */
            .fc-bg-event {
                opacity: 0.1;
            }
        }
        </style>
        `;

        if (!document.querySelector('#calendar-mobile-styles')) {
            const styleElement = document.createElement('div');
            styleElement.id = 'calendar-mobile-styles';
            styleElement.innerHTML = styles;
            document.head.appendChild(styleElement.firstElementChild);
        }
    },

    /**
     * Détecter si on est sur mobile
     */
    detectMobile() {
        this.isMobile = window.matchMedia('(max-width: 768px)').matches;
        this.isTouch = 'ontouchstart' in window;
        
        // Écouter les changements
        window.matchMedia('(max-width: 768px)').addEventListener('change', (e) => {
            this.isMobile = e.matches;
            this.updateCalendarView();
        });
    },

    /**
     * Optimiser les calendriers existants
     */
    optimizeExistingCalendars() {
        // Pour FullCalendar
        if (window.FullCalendar) {
            this.optimizeFullCalendar();
        }
        
        // Pour les calendriers custom
        const calendars = document.querySelectorAll('.calendar, [data-calendar]');
        calendars.forEach(calendar => {
            this.optimizeCalendar(calendar);
        });
    },

    /**
     * Optimiser FullCalendar
     */
    optimizeFullCalendar() {
        // Intercepter la création de calendriers
        const originalCalendar = window.FullCalendar.Calendar;
        
        window.FullCalendar.Calendar = function(element, options) {
            // Ajouter les options mobile
            if (CalendarMobileOptimizer.isMobile) {
                options = CalendarMobileOptimizer.addMobileOptions(options);
            }
            
            const calendar = new originalCalendar(element, options);
            
            // Ajouter les fonctionnalités mobile
            CalendarMobileOptimizer.enhanceCalendarInstance(calendar);
            
            return calendar;
        };
        
        // Copier les propriétés statiques
        Object.setPrototypeOf(window.FullCalendar.Calendar, originalCalendar);
    },

    /**
     * Ajouter les options mobile
     */
    addMobileOptions(options) {
        return {
            ...options,
            height: 'auto',
            aspectRatio: this.isMobile ? 1.2 : 1.35,
            dayMaxEvents: this.isMobile ? 2 : 3,
            moreLinkClick: 'popover',
            navLinks: true,
            headerToolbar: this.isMobile ? {
                left: 'prev,next',
                center: 'title',
                right: 'today,dayGridMonth,listWeek'
            } : options.headerToolbar,
            views: {
                dayGridMonth: {
                    dayMaxEvents: this.isMobile ? 2 : 4
                },
                listWeek: {
                    displayEventTime: true,
                    displayEventEnd: false
                }
            },
            // Performance
            progressiveEventRendering: true,
            windowResizeDelay: 100,
            eventMaxStack: this.isMobile ? 2 : 3
        };
    },

    /**
     * Améliorer une instance de calendrier
     */
    enhanceCalendarInstance(calendar) {
        // Ajouter la navigation mobile
        this.addMobileNavigation(calendar);
        
        // Gérer les gestes tactiles
        this.addSwipeGestures(calendar);
        
        // Optimiser le rendu
        this.optimizeRendering(calendar);
        
        // Vue mobile par défaut
        if (this.isMobile) {
            calendar.changeView('listWeek');
        }
    },

    /**
     * Ajouter la navigation mobile
     */
    addMobileNavigation(calendar) {
        if (!this.isMobile) return;
        
        const nav = document.createElement('div');
        nav.className = 'calendar-mobile-nav';
        nav.innerHTML = `
            <button class="btn btn-primary btn-icon" id="calendar-today">
                <i class="ti ti-calendar-event"></i>
            </button>
            <button class="btn btn-primary btn-icon" id="calendar-view-toggle">
                <i class="ti ti-list"></i>
            </button>
        `;
        
        calendar.el.appendChild(nav);
        
        // Aujourd'hui
        document.getElementById('calendar-today').addEventListener('click', () => {
            calendar.today();
        });
        
        // Basculer la vue
        let currentView = 'list';
        document.getElementById('calendar-view-toggle').addEventListener('click', (e) => {
            const btn = e.currentTarget;
            if (currentView === 'list') {
                calendar.changeView('dayGridMonth');
                btn.innerHTML = '<i class="ti ti-calendar"></i>';
                currentView = 'month';
            } else {
                calendar.changeView('listWeek');
                btn.innerHTML = '<i class="ti ti-list"></i>';
                currentView = 'list';
            }
        });
    },

    /**
     * Ajouter les gestes tactiles
     */
    addSwipeGestures(calendar) {
        if (!this.isTouch) return;
        
        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let touchEndY = 0;
        
        const el = calendar.el;
        
        el.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        }, { passive: true });
        
        el.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;
            this.handleSwipe(calendar, touchStartX, touchStartY, touchEndX, touchEndY);
        }, { passive: true });
    },

    /**
     * Gérer le swipe
     */
    handleSwipe(calendar, startX, startY, endX, endY) {
        const diffX = endX - startX;
        const diffY = endY - startY;
        const threshold = 50;
        
        // Swipe horizontal seulement
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > threshold) {
            if (diffX > 0) {
                // Swipe vers la droite -> précédent
                calendar.prev();
                this.showSwipeHint('←');
            } else {
                // Swipe vers la gauche -> suivant
                calendar.next();
                this.showSwipeHint('→');
            }
        }
    },

    /**
     * Afficher l'indicateur de swipe
     */
    showSwipeHint(direction) {
        const hint = document.createElement('div');
        hint.className = 'calendar-swipe-hint';
        hint.textContent = direction;
        document.body.appendChild(hint);
        
        setTimeout(() => {
            hint.remove();
        }, 500);
    },

    /**
     * Optimiser le rendu
     */
    optimizeRendering(calendar) {
        if (!this.isMobile) return;
        
        // Debounce les re-rendus
        let renderTimeout;
        const originalRender = calendar.render;
        
        calendar.render = function() {
            clearTimeout(renderTimeout);
            renderTimeout = setTimeout(() => {
                originalRender.call(this);
            }, 100);
        };
        
        // Lazy loading des événements
        calendar.on('datesSet', (info) => {
            this.lazyLoadEvents(calendar, info);
        });
    },

    /**
     * Lazy loading des événements
     */
    lazyLoadEvents(calendar, dateInfo) {
        // Afficher un loader
        const loader = document.createElement('div');
        loader.className = 'calendar-loading-mobile';
        loader.innerHTML = '<div class="spinner-border"></div>';
        calendar.el.appendChild(loader);
        
        // Simuler le chargement (à adapter avec votre API)
        setTimeout(() => {
            loader.remove();
        }, 300);
    },

    /**
     * Optimiser un calendrier custom
     */
    optimizeCalendar(element) {
        // Ajouter la classe mobile
        if (this.isMobile) {
            element.classList.add('calendar-mobile');
        }
        
        // Simplifier l'affichage
        this.simplifyCalendarDisplay(element);
        
        // Ajouter touch events
        this.addTouchEvents(element);
    },

    /**
     * Simplifier l'affichage du calendrier
     */
    simplifyCalendarDisplay(element) {
        if (!this.isMobile) return;
        
        // Cacher les éléments non essentiels
        const hideElements = element.querySelectorAll('.calendar-week-number, .calendar-time-details');
        hideElements.forEach(el => el.style.display = 'none');
        
        // Réduire la taille des textes
        const events = element.querySelectorAll('.calendar-event');
        events.forEach(event => {
            event.classList.add('calendar-event-mobile');
        });
    },

    /**
     * Ajouter les événements tactiles
     */
    addTouchEvents(element) {
        if (!this.isTouch) return;
        
        const events = element.querySelectorAll('.calendar-event, .fc-event');
        events.forEach(event => {
            // Tap pour ouvrir
            event.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.openEventDetails(event);
            });
        });
    },

    /**
     * Configuration des handlers tactiles globaux
     */
    setupTouchHandlers() {
        if (!this.isTouch) return;
        
        // Empêcher le zoom sur double tap
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
        
        // Améliorer le scroll
        document.addEventListener('touchmove', (e) => {
            if (e.target.closest('.fc-scroller')) {
                // Permettre le scroll dans le calendrier
            }
        }, { passive: true });
    },

    /**
     * Ouvrir les détails d'un événement
     */
    openEventDetails(event) {
        // Créer un modal mobile-friendly
        const modal = document.createElement('div');
        modal.className = 'modal fade show';
        modal.style.display = 'block';
        modal.innerHTML = `
            <div class="modal-dialog modal-dialog-centered modal-sm">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${event.title || 'Événement'}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <!-- Détails de l'événement -->
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Fermer au clic
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.matches('.btn-close')) {
                modal.remove();
            }
        });
    },

    /**
     * Mettre à jour la vue du calendrier
     */
    updateCalendarView() {
        const calendars = document.querySelectorAll('.calendar, [data-calendar]');
        calendars.forEach(calendar => {
            if (this.isMobile) {
                calendar.classList.add('calendar-mobile');
            } else {
                calendar.classList.remove('calendar-mobile');
            }
        });
    },

    /**
     * Observer les changements de calendrier
     */
    observeCalendarChanges() {
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) {
                        if (node.matches && (node.matches('.calendar, [data-calendar]') || 
                            node.id === 'calendar' || node.classList.contains('fc'))) {
                            this.optimizeCalendar(node);
                        }
                        
                        // Vérifier les enfants
                        if (node.querySelectorAll) {
                            const calendars = node.querySelectorAll('.calendar, [data-calendar], .fc');
                            calendars.forEach(cal => this.optimizeCalendar(cal));
                        }
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
};

// Initialiser au chargement
document.addEventListener('DOMContentLoaded', () => {
    CalendarMobileOptimizer.init();
});

// Exporter pour utilisation
window.CalendarMobileOptimizer = CalendarMobileOptimizer;