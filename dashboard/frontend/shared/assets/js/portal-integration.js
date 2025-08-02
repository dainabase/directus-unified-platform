/**
 * Portal Integration Manager
 * Système d'intégration globale unifiant tous les modules
 */

// Portal Integration Manager
class PortalIntegration {
    constructor() {
        this.modules = {
            client: ['dashboard', 'projects', 'documents', 'finances'],
            prestataire: ['dashboard', 'missions', 'rewards', 'collaboration'],
            revendeur: ['dashboard', 'pipeline', 'marketing', 'reports']
        };
        this.cache = new Map();
        this.eventBus = new EventTarget();
        this.performanceMonitor = new PerformanceMonitor();
        this.initializePortal();
    }
    
    // Initialisation globale
    async initializePortal() {
        console.log('🚀 Initialisation Portal Integration...');
        
        // Détection rôle et chargement modules
        const userRole = this.getUserRole();
        await this.loadModules(userRole);
        
        // Navigation intelligente
        this.initRouter();
        
        // Synchronisation données
        this.initDataSync();
        
        // Notifications temps réel
        this.initRealTimeNotifications();
        
        // Mode offline
        this.initServiceWorker();
        
        // Optimisations performances
        this.initLazyLoading();
        this.initPrefetch();
        
        // Monitoring
        this.performanceMonitor.measurePageLoad();
        
        console.log('✅ Portal Integration initialisé');
    }
    
    // Obtenir le rôle utilisateur
    getUserRole() {
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        return user.role || 'client';
    }
    
    // Charger modules selon rôle
    async loadModules(role) {
        const modules = this.modules[role] || [];
        console.log(`📦 Chargement modules ${role}:`, modules);
        
        for (const module of modules) {
            await this.loadModule(role, module);
        }
    }
    
    // Charger un module
    async loadModule(role, module) {
        const cacheKey = `${role}-${module}`;
        
        // Vérifier cache
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        
        // Charger le module
        try {
            const moduleData = await this.fetchModule(role, module);
            this.cache.set(cacheKey, moduleData);
            return moduleData;
        } catch (error) {
            console.error(`Erreur chargement module ${module}:`, error);
        }
    }
    
    // Router SPA-like
    initRouter() {
        // Gérer navigation browser
        window.addEventListener('popstate', (e) => this.handleRoute(e));
        
        // Intercepter clics sur liens
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[data-link]');
            if (link) {
                e.preventDefault();
                this.navigate(link.href);
            }
        });
        
        // Route initiale
        this.handleRoute();
    }
    
    // Navigation programmatique
    navigate(url, options = {}) {
        if (options.replace) {
            history.replaceState(null, null, url);
        } else {
            history.pushState(null, null, url);
        }
        this.handleRoute();
        
        // Analytics
        if (typeof gtag !== 'undefined') {
            gtag('config', 'GA_MEASUREMENT_ID', {
                page_path: url
            });
        }
    }
    
    // Gérer route actuelle
    async handleRoute() {
        const path = window.location.pathname;
        const startTime = performance.now();
        
        // Vérifier cache (5 minutes TTL)
        const cached = this.cache.get(path);
        if (cached && Date.now() - cached.timestamp < 300000) {
            this.renderContent(cached.content);
            this.performanceMonitor.recordRender(performance.now() - startTime);
            return;
        }
        
        // Charger nouveau contenu
        try {
            const content = await this.loadContent(path);
            this.cache.set(path, { 
                content, 
                timestamp: Date.now() 
            });
            this.renderContent(content);
            this.performanceMonitor.recordRender(performance.now() - startTime);
        } catch (error) {
            console.error('Erreur chargement route:', error);
            this.showError();
        }
    }
    
    // Charger contenu page
    async loadContent(path) {
        // Simuler chargement AJAX
        const response = await fetch(path, {
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        return await response.text();
    }
    
    // Afficher contenu
    renderContent(content) {
        const mainContent = document.querySelector('.page-wrapper');
        if (mainContent) {
            // Transition smooth
            mainContent.style.opacity = '0';
            setTimeout(() => {
                mainContent.innerHTML = content;
                mainContent.style.opacity = '1';
                this.afterRender();
            }, 200);
        }
    }
    
    // Après rendu
    afterRender() {
        // Réinitialiser composants
        this.initComponents();
        
        // Émettre événement
        this.eventBus.dispatchEvent(
            new CustomEvent('page-rendered', {
                detail: { path: window.location.pathname }
            })
        );
    }
    
    // Synchronisation inter-modules
    initDataSync() {
        // Client -> Prestataire
        this.eventBus.addEventListener('project-updated', (e) => {
            console.log('📤 Project updated:', e.detail);
            
            // Notifier prestataires concernés
            if (e.detail.prestataires) {
                e.detail.prestataires.forEach(prestataireId => {
                    this.notifyPrestataire(prestataireId, {
                        type: 'project-update',
                        project: e.detail
                    });
                });
            }
            
            // Mettre à jour dashboard prestataire si actif
            if (window.location.pathname.includes('prestataire')) {
                this.updatePrestataireMissions(e.detail);
            }
        });
        
        // Prestataire -> Client
        this.eventBus.addEventListener('deliverable-uploaded', (e) => {
            console.log('📤 Deliverable uploaded:', e.detail);
            
            // Notifier client
            this.notifyClient(e.detail.clientId, {
                type: 'new-deliverable',
                deliverable: e.detail
            });
            
            // Mettre à jour progression projet
            this.updateProjectProgress(e.detail.projectId);
            
            // Tracker analytics
            this.trackEvent('deliverable_uploaded', e.detail);
        });
        
        // Revendeur -> Tous
        this.eventBus.addEventListener('deal-closed', (e) => {
            console.log('📤 Deal closed:', e.detail);
            
            // Créer nouveau projet
            this.createNewProject({
                clientId: e.detail.clientId,
                title: e.detail.dealName,
                budget: e.detail.amount,
                startDate: new Date()
            });
            
            // Notifier toutes les parties
            this.notifyAllParties(e.detail);
            
            // Mettre à jour commissions
            this.updateCommissions(e.detail);
        });
        
        // Sync générale toutes les 5 minutes
        setInterval(() => this.syncAllData(), 300000);
    }
    
    // Notifications temps réel
    initRealTimeNotifications() {
        // WebSocket ou SSE selon disponibilité
        if ('WebSocket' in window) {
            this.initWebSocket();
        } else if ('EventSource' in window) {
            this.initSSE();
        } else {
            // Fallback polling
            this.initPolling();
        }
    }
    
    // WebSocket pour temps réel
    initWebSocket() {
        try {
            this.ws = new WebSocket('wss://api.portal.com/notifications');
            
            this.ws.onopen = () => {
                console.log('✅ WebSocket connecté');
                this.ws.send(JSON.stringify({
                    type: 'auth',
                    token: this.getAuthToken()
                }));
            };
            
            this.ws.onmessage = (event) => {
                const notification = JSON.parse(event.data);
                this.handleNotification(notification);
            };
            
            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                // Fallback to polling
                setTimeout(() => this.initPolling(), 5000);
            };
            
            this.ws.onclose = () => {
                console.log('WebSocket fermé, reconnexion...');
                setTimeout(() => this.initWebSocket(), 5000);
            };
            
        } catch (error) {
            console.error('WebSocket init failed:', error);
            this.initPolling();
        }
    }
    
    // Server-Sent Events alternative
    initSSE() {
        this.eventSource = new EventSource('/api/notifications/stream');
        
        this.eventSource.onmessage = (event) => {
            const notification = JSON.parse(event.data);
            this.handleNotification(notification);
        };
        
        this.eventSource.onerror = () => {
            console.error('SSE error, falling back to polling');
            this.eventSource.close();
            this.initPolling();
        };
    }
    
    // Polling fallback
    initPolling() {
        setInterval(async () => {
            try {
                const response = await fetch('/api/notifications/poll');
                const notifications = await response.json();
                notifications.forEach(n => this.handleNotification(n));
            } catch (error) {
                console.error('Polling error:', error);
            }
        }, 30000); // 30 secondes
    }
    
    // Gérer notification
    handleNotification(notification) {
        console.log('📨 Notification:', notification);
        
        // Afficher toast
        if (window.PortalApp && window.PortalApp.showToast) {
            window.PortalApp.showToast(notification.message, notification.type);
        }
        
        // Mettre à jour UI selon type
        switch(notification.type) {
            case 'new-message':
                this.updateMessageBadge();
                break;
            case 'project-update':
                this.refreshProjectList();
                break;
            case 'payment-received':
                this.updateFinancialData();
                break;
        }
        
        // Notification système si permission
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(notification.title || 'Portal', {
                body: notification.message,
                icon: '/assets/img/logo.svg',
                badge: '/assets/img/badge.png'
            });
        }
    }
    
    // Service Worker pour offline
    async initServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('✅ Service Worker enregistré:', registration.scope);
                
                // Vérifier mises à jour
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // Nouveau contenu disponible
                            this.showUpdateNotification();
                        }
                    });
                });
                
            } catch (error) {
                console.error('❌ Service Worker registration failed:', error);
            }
        }
    }
    
    // Lazy loading
    initLazyLoading() {
        // Images
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px'
        });
        
        images.forEach(img => imageObserver.observe(img));
        
        // Composants
        const components = document.querySelectorAll('[data-component]');
        const componentObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadComponent(entry.target.dataset.component);
                    componentObserver.unobserve(entry.target);
                }
            });
        });
        
        components.forEach(comp => componentObserver.observe(comp));
    }
    
    // Prefetch intelligent
    initPrefetch() {
        // Précharger au survol
        document.addEventListener('mouseover', (e) => {
            const link = e.target.closest('a[href]');
            if (link && !link.dataset.prefetched) {
                const href = link.href;
                if (this.shouldPrefetch(href)) {
                    this.prefetchResource(href);
                    link.dataset.prefetched = 'true';
                }
            }
        });
        
        // Précharger routes probables
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => {
                this.prefetchProbableRoutes();
            });
        }
    }
    
    // Vérifier si prefetch nécessaire
    shouldPrefetch(url) {
        // Ne pas précharger externe, téléchargements, etc
        if (url.includes('http') && !url.includes(window.location.host)) return false;
        if (url.includes('#')) return false;
        if (url.match(/\.(pdf|zip|xlsx|docx)$/)) return false;
        
        return true;
    }
    
    // Précharger ressource
    prefetchResource(url) {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        link.as = 'document';
        document.head.appendChild(link);
    }
    
    // Précharger routes probables
    prefetchProbableRoutes() {
        const currentPath = window.location.pathname;
        const role = this.getUserRole();
        
        // Routes suivantes probables selon contexte
        const probableRoutes = {
            '/client/dashboard.html': ['/client/projects.html', '/client/documents.html'],
            '/prestataire/dashboard.html': ['/prestataire/missions.html'],
            '/revendeur/dashboard.html': ['/revendeur/pipeline.html', '/revendeur/clients.html']
        };
        
        const routes = probableRoutes[currentPath] || [];
        routes.forEach(route => this.prefetchResource(route));
    }
    
    // Réinitialiser composants après navigation
    initComponents() {
        // DataTables
        if ($.fn.DataTable) {
            $('[data-datatable]').DataTable();
        }
        
        // Charts
        if (window.ApexCharts) {
            this.initCharts();
        }
        
        // Tooltips
        const tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        tooltips.forEach(el => new bootstrap.Tooltip(el));
        
        // Popovers
        const popovers = document.querySelectorAll('[data-bs-toggle="popover"]');
        popovers.forEach(el => new bootstrap.Popover(el));
    }
    
    // Synchroniser toutes les données
    async syncAllData() {
        console.log('🔄 Synchronisation globale...');
        
        try {
            // Sync selon rôle
            const role = this.getUserRole();
            
            switch(role) {
                case 'client':
                    await this.syncClientData();
                    break;
                case 'prestataire':
                    await this.syncPrestataireData();
                    break;
                case 'revendeur':
                    await this.syncRevendeurData();
                    break;
            }
            
            console.log('✅ Synchronisation terminée');
            
        } catch (error) {
            console.error('❌ Erreur synchronisation:', error);
        }
    }
    
    // Afficher notification mise à jour
    showUpdateNotification() {
        const notification = document.createElement('div');
        notification.className = 'update-notification';
        notification.innerHTML = `
            <div class="alert alert-info alert-dismissible" role="alert">
                <div class="d-flex">
                    <div>
                        <i class="ti ti-refresh icon alert-icon"></i>
                    </div>
                    <div>
                        <h4 class="alert-title">Nouvelle version disponible!</h4>
                        <div class="text-muted">Cliquez pour recharger et obtenir les dernières fonctionnalités.</div>
                    </div>
                </div>
                <a class="btn-close" data-bs-dismiss="alert" aria-label="close"></a>
            </div>
        `;
        
        notification.addEventListener('click', () => {
            window.location.reload();
        });
        
        document.body.appendChild(notification);
    }
    
    // Tracker événement
    trackEvent(event, data) {
        // Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', event, data);
        }
        
        // Custom analytics
        this.performanceMonitor.trackEvent(event, data);
    }
}

// Event Bus Global
class EventBus {
    constructor() {
        this.eventTarget = new EventTarget();
    }
    
    emit(event, data) {
        this.eventTarget.dispatchEvent(
            new CustomEvent(event, { detail: data })
        );
    }
    
    on(event, callback) {
        this.eventTarget.addEventListener(event, callback);
    }
    
    off(event, callback) {
        this.eventTarget.removeEventListener(event, callback);
    }
}

// Performance Monitor
class PerformanceMonitor {
    constructor() {
        this.metrics = {
            pageLoad: [],
            apiCalls: [],
            renderTime: [],
            events: []
        };
        this.initMonitoring();
    }
    
    initMonitoring() {
        // Observer pour les performances
        if ('PerformanceObserver' in window) {
            // Navigation timing
            const navObserver = new PerformanceObserver((list) => {
                list.getEntries().forEach((entry) => {
                    this.recordNavigationTiming(entry);
                });
            });
            navObserver.observe({ entryTypes: ['navigation'] });
            
            // Resource timing
            const resObserver = new PerformanceObserver((list) => {
                list.getEntries().forEach((entry) => {
                    this.recordResourceTiming(entry);
                });
            });
            resObserver.observe({ entryTypes: ['resource'] });
        }
    }
    
    measurePageLoad() {
        if (performance.timing) {
            const timing = performance.timing;
            const loadTime = timing.loadEventEnd - timing.navigationStart;
            const domReady = timing.domContentLoadedEventEnd - timing.navigationStart;
            const ttfb = timing.responseStart - timing.navigationStart;
            
            this.metrics.pageLoad.push({
                timestamp: Date.now(),
                loadTime,
                domReady,
                ttfb,
                url: window.location.href
            });
            
            // Alert si performance dégradée
            if (loadTime > 3000) {
                console.warn(`⚠️ Page load time: ${loadTime}ms (exceeds 3s threshold)`);
                this.reportSlowLoad(loadTime);
            }
            
            console.log(`📊 Page metrics: Load ${loadTime}ms, DOM ${domReady}ms, TTFB ${ttfb}ms`);
        }
    }
    
    recordNavigationTiming(entry) {
        const metrics = {
            dns: entry.domainLookupEnd - entry.domainLookupStart,
            tcp: entry.connectEnd - entry.connectStart,
            ttfb: entry.responseStart - entry.requestStart,
            download: entry.responseEnd - entry.responseStart,
            domInteractive: entry.domInteractive,
            domComplete: entry.domComplete,
            loadComplete: entry.loadEventEnd - entry.loadEventStart
        };
        
        console.log('Navigation metrics:', metrics);
    }
    
    recordResourceTiming(entry) {
        if (entry.duration > 1000) {
            console.warn(`Slow resource: ${entry.name} (${entry.duration}ms)`);
        }
    }
    
    recordRender(time) {
        this.metrics.renderTime.push({
            timestamp: Date.now(),
            duration: time,
            path: window.location.pathname
        });
    }
    
    trackEvent(event, data) {
        this.metrics.events.push({
            timestamp: Date.now(),
            event,
            data
        });
    }
    
    recordApiCall(endpoint, duration, status) {
        this.metrics.apiCalls.push({
            timestamp: Date.now(),
            endpoint,
            duration,
            status
        });
        
        // Alert si API lente
        if (duration > 2000) {
            console.warn(`⚠️ Slow API call: ${endpoint} (${duration}ms)`);
        }
    }
    
    reportSlowLoad(loadTime) {
        // Envoyer métriques au serveur
        if (navigator.sendBeacon) {
            const data = JSON.stringify({
                type: 'slow_load',
                loadTime,
                url: window.location.href,
                userAgent: navigator.userAgent,
                connection: navigator.connection?.effectiveType
            });
            
            navigator.sendBeacon('/api/metrics', data);
        }
    }
    
    getMetricsSummary() {
        return {
            avgPageLoad: this.average(this.metrics.pageLoad.map(m => m.loadTime)),
            avgApiCall: this.average(this.metrics.apiCalls.map(m => m.duration)),
            avgRender: this.average(this.metrics.renderTime.map(m => m.duration)),
            totalEvents: this.metrics.events.length
        };
    }
    
    average(numbers) {
        if (numbers.length === 0) return 0;
        return numbers.reduce((a, b) => a + b, 0) / numbers.length;
    }
}

// Cache Manager
class CacheManager {
    constructor() {
        this.cache = new Map();
        this.maxSize = 50; // 50 entrées max
        this.ttl = 300000; // 5 minutes TTL
    }
    
    set(key, value, customTTL) {
        // Vérifier taille cache
        if (this.cache.size >= this.maxSize) {
            // Supprimer entrée la plus ancienne
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        
        this.cache.set(key, {
            value,
            timestamp: Date.now(),
            ttl: customTTL || this.ttl
        });
    }
    
    get(key) {
        const entry = this.cache.get(key);
        if (!entry) return null;
        
        // Vérifier expiration
        if (Date.now() - entry.timestamp > entry.ttl) {
            this.cache.delete(key);
            return null;
        }
        
        return entry.value;
    }
    
    clear() {
        this.cache.clear();
    }
    
    clearExpired() {
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (now - entry.timestamp > entry.ttl) {
                this.cache.delete(key);
            }
        }
    }
}

// API Interceptor
class APIInterceptor {
    constructor(performanceMonitor) {
        this.performanceMonitor = performanceMonitor;
        this.setupInterceptor();
    }
    
    setupInterceptor() {
        // Intercepter fetch
        const originalFetch = window.fetch;
        
        window.fetch = async (...args) => {
            const startTime = performance.now();
            const [url, options] = args;
            
            try {
                // Ajouter headers par défaut
                const modifiedOptions = {
                    ...options,
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-CSRF-Token': this.getCSRFToken(),
                        ...options?.headers
                    }
                };
                
                const response = await originalFetch(url, modifiedOptions);
                const duration = performance.now() - startTime;
                
                // Enregistrer métriques
                this.performanceMonitor.recordApiCall(url, duration, response.status);
                
                // Gérer erreurs
                if (!response.ok) {
                    this.handleAPIError(response);
                }
                
                return response;
                
            } catch (error) {
                const duration = performance.now() - startTime;
                this.performanceMonitor.recordApiCall(url, duration, 0);
                throw error;
            }
        };
    }
    
    getCSRFToken() {
        return document.querySelector('meta[name="csrf-token"]')?.content || '';
    }
    
    handleAPIError(response) {
        switch(response.status) {
            case 401:
                // Non authentifié
                window.location.href = '/login.html';
                break;
            case 403:
                // Non autorisé
                PortalApp.showToast('Accès non autorisé', 'error');
                break;
            case 429:
                // Rate limit
                PortalApp.showToast('Trop de requêtes, veuillez patienter', 'warning');
                break;
            case 500:
                // Erreur serveur
                PortalApp.showToast('Erreur serveur, veuillez réessayer', 'error');
                break;
        }
    }
}

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', function() {
    // Créer instance globale
    window.PortalIntegration = new PortalIntegration();
    window.portalEventBus = new EventBus();
    
    // API Interceptor
    new APIInterceptor(window.PortalIntegration.performanceMonitor);
    
    // Demander permission notifications
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
    
    console.log('✅ Portal Integration System loaded');
});