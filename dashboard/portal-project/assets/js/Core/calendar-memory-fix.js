/**
 * Calendar Memory Fix
 * Corrige le memory leak du calendrier après utilisation prolongée
 */

const CalendarMemoryFix = {
    // Stockage des instances de calendrier
    instances: new WeakMap(),
    cleanupTimers: new Map(),
    
    /**
     * Initialiser le fix
     */
    init() {
        console.log('🔧 Initialisation du fix memory leak calendrier');
        
        this.patchFullCalendar();
        this.setupPageUnloadHandler();
        this.setupMemoryMonitor();
    },

    /**
     * Patcher FullCalendar pour ajouter le cleanup automatique
     */
    patchFullCalendar() {
        if (!window.FullCalendar) return;
        
        const originalCalendar = window.FullCalendar.Calendar;
        const self = this;
        
        window.FullCalendar.Calendar = function(element, options) {
            // Créer l'instance
            const calendar = new originalCalendar(element, options);
            
            // Stocker l'instance
            self.instances.set(element, calendar);
            
            // Ajouter la méthode de cleanup
            calendar._cleanup = function() {
                // Nettoyer les event listeners
                this.removeAllEventSources();
                this.removeAllEvents();
                
                // Détruire les plugins
                if (this.currentViewData) {
                    this.currentViewData.calendar = null;
                    this.currentViewData.view = null;
                }
                
                // Nettoyer le DOM
                if (this.el) {
                    this.el.innerHTML = '';
                    this.el.classList.remove('fc');
                }
                
                // Nettoyer les références
                this.el = null;
                this.emitter = null;
                this.dispatcher = null;
                this.currentViewData = null;
                this.viewsByType = null;
                this.eventSources = null;
                this.stickySource = null;
                this.calendarApi = null;
                
                // Retirer de la WeakMap
                self.instances.delete(element);
            };
            
            // Override destroy pour assurer le cleanup
            const originalDestroy = calendar.destroy;
            calendar.destroy = function() {
                this._cleanup();
                if (originalDestroy) {
                    originalDestroy.call(this);
                }
            };
            
            // Auto-cleanup après 1 heure
            const cleanupTimer = setTimeout(() => {
                console.log('⏰ Auto-cleanup calendrier après 1h');
                if (calendar && !calendar.isDestroyed) {
                    calendar.refetchEvents();
                    // Nettoyer les vieux événements en cache
                    if (calendar.state && calendar.state.eventStore) {
                        const now = new Date();
                        const oneMonthAgo = new Date(now.setMonth(now.getMonth() - 1));
                        
                        Object.keys(calendar.state.eventStore.instances).forEach(key => {
                            const event = calendar.state.eventStore.instances[key];
                            if (event && event.range && event.range.end < oneMonthAgo) {
                                delete calendar.state.eventStore.instances[key];
                            }
                        });
                    }
                }
            }, 3600000); // 1 heure
            
            self.cleanupTimers.set(calendar, cleanupTimer);
            
            return calendar;
        };
        
        // Copier les propriétés statiques
        Object.setPrototypeOf(window.FullCalendar.Calendar, originalCalendar);
        Object.getOwnPropertyNames(originalCalendar).forEach(name => {
            if (name !== 'prototype' && name !== 'name' && name !== 'length') {
                window.FullCalendar.Calendar[name] = originalCalendar[name];
            }
        });
    },

    /**
     * Nettoyer lors du changement de page
     */
    setupPageUnloadHandler() {
        // Navigation SPA
        const originalPushState = history.pushState;
        const originalReplaceState = history.replaceState;
        const self = this;
        
        history.pushState = function() {
            self.cleanupAllCalendars();
            return originalPushState.apply(history, arguments);
        };
        
        history.replaceState = function() {
            self.cleanupAllCalendars();
            return originalReplaceState.apply(history, arguments);
        };
        
        window.addEventListener('popstate', () => {
            this.cleanupAllCalendars();
        });
        
        // Déchargement de page
        window.addEventListener('beforeunload', () => {
            this.cleanupAllCalendars();
        });
        
        // Observer les changements de DOM pour détecter les calendriers supprimés
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.removedNodes.forEach(node => {
                    if (node.nodeType === 1) {
                        this.cleanupCalendarsInNode(node);
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    },

    /**
     * Nettoyer tous les calendriers
     */
    cleanupAllCalendars() {
        // Nettoyer par sélecteur
        document.querySelectorAll('.fc').forEach(element => {
            const calendar = this.instances.get(element);
            if (calendar) {
                calendar.destroy();
            }
        });
        
        // Nettoyer les timers
        this.cleanupTimers.forEach(timer => clearTimeout(timer));
        this.cleanupTimers.clear();
    },

    /**
     * Nettoyer les calendriers dans un nœud supprimé
     */
    cleanupCalendarsInNode(node) {
        if (!node.querySelectorAll) return;
        
        node.querySelectorAll('.fc').forEach(element => {
            const calendar = this.instances.get(element);
            if (calendar) {
                calendar.destroy();
                const timer = this.cleanupTimers.get(calendar);
                if (timer) {
                    clearTimeout(timer);
                    this.cleanupTimers.delete(calendar);
                }
            }
        });
    },

    /**
     * Moniteur de mémoire
     */
    setupMemoryMonitor() {
        if (!performance.memory) return;
        
        let lastCheck = performance.memory.usedJSHeapSize;
        
        setInterval(() => {
            const current = performance.memory.usedJSHeapSize;
            const diff = current - lastCheck;
            
            // Si augmentation de plus de 50MB en 5 minutes
            if (diff > 50 * 1024 * 1024) {
                console.warn('⚠️ Augmentation mémoire détectée, nettoyage des calendriers');
                this.forceCleanup();
            }
            
            lastCheck = current;
        }, 300000); // Toutes les 5 minutes
    },

    /**
     * Forcer le nettoyage
     */
    forceCleanup() {
        // Nettoyer les événements anciens
        document.querySelectorAll('.fc').forEach(element => {
            const calendar = this.instances.get(element);
            if (calendar && calendar.getEvents) {
                const events = calendar.getEvents();
                const now = new Date();
                const oneMonthAgo = new Date(now.setMonth(now.getMonth() - 1));
                
                events.forEach(event => {
                    if (event.end && event.end < oneMonthAgo) {
                        event.remove();
                    }
                });
            }
        });
        
        // Forcer garbage collection si disponible
        if (window.gc) {
            window.gc();
        }
    },

    /**
     * API publique pour nettoyer manuellement
     */
    cleanup(calendarElement) {
        const calendar = this.instances.get(calendarElement);
        if (calendar) {
            calendar.destroy();
        }
    }
};

// Initialiser au chargement
document.addEventListener('DOMContentLoaded', () => {
    CalendarMemoryFix.init();
});

// Exporter pour utilisation
window.CalendarMemoryFix = CalendarMemoryFix;