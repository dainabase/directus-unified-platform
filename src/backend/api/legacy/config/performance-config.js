/**
 * Performance Configuration - Portal Multi-Rôles
 * Optimisations et monitoring des performances
 */

// Performance Optimizations
const PerformanceConfig = {
    // Configuration générale
    config: {
        lazyLoadOffset: 50, // pixels avant viewport
        debounceDelay: 300, // ms pour recherche
        throttleDelay: 100, // ms pour scroll
        cacheTimeout: 300000, // 5 minutes
        prefetchDelay: 2000, // Délai avant prefetch au hover
        chunkSize: 50, // Items par chunk pour grandes listes
        imageQuality: 0.85, // Qualité compression images
        webpSupport: false // Détecté automatiquement
    },
    
    // État
    state: {
        observers: new Map(),
        prefetched: new Set(),
        loadedChunks: new Set(),
        performanceData: []
    },
    
    // Initialisation
    init() {
        console.log('⚡ Initialisation Performance Config...');
        
        // Détecter support WebP
        this.detectWebPSupport();
        
        // Lazy loading
        this.initLazyLoading();
        
        // Image optimization
        this.initImageOptimization();
        
        // Prefetch intelligent
        this.initPrefetch();
        
        // Virtualization pour grandes listes
        this.initVirtualization();
        
        // Web Workers si disponible
        this.initWebWorkers();
        
        // Resource hints
        this.addResourceHints();
        
        // Performance monitoring
        this.initPerformanceMonitoring();
        
        console.log('✅ Performance Config initialisé');
    },
    
    // Détecter support WebP
    detectWebPSupport() {
        const webP = new Image();
        webP.onload = webP.onerror = () => {
            this.config.webpSupport = webP.height === 2;
        };
        webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    },
    
    // Lazy loading images et components
    initLazyLoading() {
        // Observer pour images
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadImage(entry.target);
                    imageObserver.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: `${this.config.lazyLoadOffset}px`
        });
        
        // Observer pour components
        const componentObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadComponent(entry.target);
                    componentObserver.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '100px'
        });
        
        // Observer toutes les images avec data-src
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
        
        // Observer tous les components lazy
        document.querySelectorAll('[data-component-lazy]').forEach(component => {
            componentObserver.observe(component);
        });
        
        // Sauvegarder observers
        this.state.observers.set('images', imageObserver);
        this.state.observers.set('components', componentObserver);
    },
    
    // Charger image
    loadImage(img) {
        const src = img.dataset.src;
        if (!src) return;
        
        // Support WebP si disponible
        if (this.config.webpSupport && img.dataset.srcWebp) {
            img.src = img.dataset.srcWebp;
        } else {
            img.src = src;
        }
        
        // Responsive images
        if (img.dataset.srcset) {
            img.srcset = img.dataset.srcset;
        }
        
        // Cleanup
        img.removeAttribute('data-src');
        img.removeAttribute('data-src-webp');
        img.removeAttribute('data-srcset');
        
        // Animation fade-in
        img.classList.add('loaded');
    },
    
    // Charger component
    async loadComponent(element) {
        const componentName = element.dataset.componentLazy;
        const componentPath = element.dataset.componentPath || `/components/${componentName}.js`;
        
        try {
            // Charger dynamiquement
            const module = await import(componentPath);
            
            // Initialiser component
            if (module.default && typeof module.default.init === 'function') {
                module.default.init(element);
            }
            
            // Marquer comme chargé
            element.removeAttribute('data-component-lazy');
            element.classList.add('component-loaded');
            
        } catch (error) {
            console.error(`Erreur chargement component ${componentName}:`, error);
        }
    },
    
    // Optimisation images
    initImageOptimization() {
        // Créer canvas pour compression
        this.compressionCanvas = document.createElement('canvas');
        this.compressionCtx = this.compressionCanvas.getContext('2d');
        
        // Observer uploads
        document.addEventListener('change', (e) => {
            if (e.target.type === 'file' && e.target.accept?.includes('image')) {
                this.handleImageUpload(e.target);
            }
        });
    },
    
    // Gérer upload image
    async handleImageUpload(input) {
        const files = Array.from(input.files);
        
        const optimizedFiles = await Promise.all(
            files.map(file => this.optimizeImage(file))
        );
        
        // Remplacer fichiers par versions optimisées
        const dt = new DataTransfer();
        optimizedFiles.forEach(file => dt.items.add(file));
        input.files = dt.files;
    },
    
    // Optimiser image
    async optimizeImage(file) {
        // Skip si déjà petit
        if (file.size < 100000) return file; // < 100KB
        
        return new Promise((resolve) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const img = new Image();
                
                img.onload = () => {
                    // Calculer nouvelles dimensions
                    const maxWidth = 1920;
                    const maxHeight = 1080;
                    let { width, height } = img;
                    
                    if (width > maxWidth || height > maxHeight) {
                        const ratio = Math.min(maxWidth / width, maxHeight / height);
                        width *= ratio;
                        height *= ratio;
                    }
                    
                    // Redimensionner
                    this.compressionCanvas.width = width;
                    this.compressionCanvas.height = height;
                    this.compressionCtx.drawImage(img, 0, 0, width, height);
                    
                    // Convertir en blob
                    this.compressionCanvas.toBlob((blob) => {
                        const optimizedFile = new File([blob], file.name, {
                            type: blob.type,
                            lastModified: Date.now()
                        });
                        
                        console.log(`Image optimisée: ${file.size} → ${optimizedFile.size} bytes`);
                        resolve(optimizedFile);
                        
                    }, file.type, this.config.imageQuality);
                };
                
                img.src = e.target.result;
            };
            
            reader.readAsDataURL(file);
        });
    },
    
    // Debounce pour recherche et inputs
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Throttle pour scroll et resize
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    // Préchargement intelligent
    initPrefetch() {
        // Précharger au survol avec délai
        let hoverTimeout;
        
        document.addEventListener('mouseover', (e) => {
            const link = e.target.closest('a[href]:not([data-no-prefetch])');
            if (!link) return;
            
            const href = link.href;
            
            // Vérifier si déjà préchargé
            if (this.state.prefetched.has(href)) return;
            
            // Délai avant prefetch
            hoverTimeout = setTimeout(() => {
                if (this.shouldPrefetch(href)) {
                    this.prefetchLink(href);
                }
            }, this.config.prefetchDelay);
        });
        
        document.addEventListener('mouseout', () => {
            clearTimeout(hoverTimeout);
        });
        
        // Précharger routes critiques
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => {
                this.prefetchCriticalRoutes();
            });
        } else {
            setTimeout(() => this.prefetchCriticalRoutes(), 2000);
        }
    },
    
    // Vérifier si doit précharger
    shouldPrefetch(url) {
        try {
            const urlObj = new URL(url);
            
            // Même origine seulement
            if (urlObj.origin !== window.location.origin) return false;
            
            // Pas les téléchargements
            if (url.match(/\.(pdf|zip|xlsx|docx|csv)$/i)) return false;
            
            // Pas les ancres
            if (urlObj.hash && urlObj.pathname === window.location.pathname) return false;
            
            return true;
        } catch {
            return false;
        }
    },
    
    // Précharger lien
    prefetchLink(url) {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        link.as = 'document';
        
        link.onload = () => {
            this.state.prefetched.add(url);
            console.log(`✅ Prefetched: ${url}`);
        };
        
        link.onerror = () => {
            console.warn(`❌ Prefetch failed: ${url}`);
        };
        
        document.head.appendChild(link);
    },
    
    // Précharger routes critiques
    prefetchCriticalRoutes() {
        const currentPath = window.location.pathname;
        
        // Routes suivantes probables
        const criticalRoutes = {
            '/login.html': ['/client/dashboard.html', '/prestataire/dashboard.html'],
            '/client/dashboard.html': ['/client/projects.html', '/client/documents.html'],
            '/prestataire/dashboard.html': ['/prestataire/missions.html'],
            '/revendeur/dashboard.html': ['/revendeur/pipeline.html']
        };
        
        const routes = criticalRoutes[currentPath] || [];
        
        routes.forEach(route => {
            if (!this.state.prefetched.has(route)) {
                this.prefetchLink(route);
            }
        });
    },
    
    // Virtualisation pour grandes listes
    initVirtualization() {
        const virtualLists = document.querySelectorAll('[data-virtual-list]');
        
        virtualLists.forEach(list => {
            this.virtualizeList(list);
        });
    },
    
    // Virtualiser une liste
    virtualizeList(container) {
        const items = Array.from(container.children);
        const itemHeight = items[0]?.offsetHeight || 50;
        const containerHeight = container.offsetHeight;
        const buffer = 5; // Items de buffer
        
        const visibleItems = Math.ceil(containerHeight / itemHeight) + buffer * 2;
        
        // État de scroll
        let scrollTop = 0;
        let startIndex = 0;
        
        // Créer conteneur virtuel
        const virtualContainer = document.createElement('div');
        virtualContainer.style.height = `${items.length * itemHeight}px`;
        virtualContainer.style.position = 'relative';
        
        // Conteneur visible
        const visibleContainer = document.createElement('div');
        visibleContainer.style.position = 'absolute';
        visibleContainer.style.top = '0';
        visibleContainer.style.left = '0';
        visibleContainer.style.right = '0';
        
        virtualContainer.appendChild(visibleContainer);
        container.innerHTML = '';
        container.appendChild(virtualContainer);
        
        // Fonction de rendu
        const render = () => {
            startIndex = Math.floor(scrollTop / itemHeight) - buffer;
            startIndex = Math.max(0, startIndex);
            
            const endIndex = Math.min(startIndex + visibleItems, items.length);
            
            // Clear et re-render
            visibleContainer.innerHTML = '';
            visibleContainer.style.transform = `translateY(${startIndex * itemHeight}px)`;
            
            for (let i = startIndex; i < endIndex; i++) {
                visibleContainer.appendChild(items[i].cloneNode(true));
            }
        };
        
        // Scroll handler
        container.addEventListener('scroll', this.throttle(() => {
            scrollTop = container.scrollTop;
            render();
        }, 16)); // ~60fps
        
        // Render initial
        render();
    },
    
    // Web Workers pour tâches lourdes
    initWebWorkers() {
        if (!window.Worker) return;
        
        // Créer worker pour calculs
        const workerCode = `
            self.addEventListener('message', (e) => {
                const { type, data } = e.data;
                
                switch(type) {
                    case 'sort':
                        const sorted = data.sort((a, b) => a.value - b.value);
                        self.postMessage({ type: 'sorted', data: sorted });
                        break;
                        
                    case 'filter':
                        const filtered = data.items.filter(item => 
                            item.name.toLowerCase().includes(data.query.toLowerCase())
                        );
                        self.postMessage({ type: 'filtered', data: filtered });
                        break;
                        
                    case 'calculate':
                        const result = data.reduce((sum, item) => sum + item.value, 0);
                        self.postMessage({ type: 'calculated', data: result });
                        break;
                }
            });
        `;
        
        const blob = new Blob([workerCode], { type: 'application/javascript' });
        this.worker = new Worker(URL.createObjectURL(blob));
        
        this.worker.onerror = (error) => {
            console.error('Worker error:', error);
        };
    },
    
    // Utiliser worker pour tâche
    async runInWorker(type, data) {
        if (!this.worker) {
            // Fallback synchrone
            return this.runSyncTask(type, data);
        }
        
        return new Promise((resolve) => {
            const handler = (e) => {
                if (e.data.type === type + 'd') {
                    this.worker.removeEventListener('message', handler);
                    resolve(e.data.data);
                }
            };
            
            this.worker.addEventListener('message', handler);
            this.worker.postMessage({ type, data });
        });
    },
    
    // Resource hints
    addResourceHints() {
        const hints = [
            // DNS Prefetch pour domaines externes
            { rel: 'dns-prefetch', href: '//cdn.jsdelivr.net' },
            { rel: 'dns-prefetch', href: '//fonts.googleapis.com' },
            { rel: 'dns-prefetch', href: '//www.google-analytics.com' },
            
            // Preconnect pour API
            { rel: 'preconnect', href: 'https://api.portal.com' },
            
            // Preload pour fonts critiques
            { rel: 'preload', href: '/assets/fonts/inter-var.woff2', as: 'font', type: 'font/woff2', crossorigin: true }
        ];
        
        hints.forEach(hint => {
            const link = document.createElement('link');
            Object.assign(link, hint);
            document.head.appendChild(link);
        });
    },
    
    // Monitoring performances
    initPerformanceMonitoring() {
        // Long Task Observer
        if ('PerformanceObserver' in window) {
            try {
                const longTaskObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        console.warn(`⚠️ Long task detected: ${entry.duration}ms`);
                        
                        // Reporter si > 100ms
                        if (entry.duration > 100) {
                            this.reportPerformanceIssue('long-task', {
                                duration: entry.duration,
                                startTime: entry.startTime,
                                name: entry.name
                            });
                        }
                    }
                });
                
                longTaskObserver.observe({ entryTypes: ['longtask'] });
                
            } catch (e) {
                console.log('Long Task Observer not supported');
            }
        }
        
        // Layout Shift Observer
        if ('LayoutShift' in window) {
            let cumulativeLayoutShift = 0;
            
            const layoutShiftObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (!entry.hadRecentInput) {
                        cumulativeLayoutShift += entry.value;
                        
                        if (entry.value > 0.1) {
                            console.warn(`⚠️ Layout shift: ${entry.value}`);
                        }
                    }
                }
            });
            
            layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });
        }
        
        // Mesurer Core Web Vitals
        this.measureCoreWebVitals();
    },
    
    // Mesurer Core Web Vitals
    measureCoreWebVitals() {
        // LCP (Largest Contentful Paint)
        new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            console.log(`📊 LCP: ${lastEntry.startTime}ms`);
            
            if (lastEntry.startTime > 2500) {
                console.warn('⚠️ LCP exceeds 2.5s threshold');
            }
        }).observe({ entryTypes: ['largest-contentful-paint'] });
        
        // FID (First Input Delay) - utiliser polyfill
        if (window.perfMetrics && window.perfMetrics.onFirstInputDelay) {
            window.perfMetrics.onFirstInputDelay((fid) => {
                console.log(`📊 FID: ${fid}ms`);
                
                if (fid > 100) {
                    console.warn('⚠️ FID exceeds 100ms threshold');
                }
            });
        }
        
        // CLS (Cumulative Layout Shift) - déjà mesuré ci-dessus
    },
    
    // Reporter problème de performance
    reportPerformanceIssue(type, data) {
        const issue = {
            type,
            data,
            timestamp: Date.now(),
            url: window.location.href,
            userAgent: navigator.userAgent
        };
        
        // Envoyer au serveur si disponible
        if (navigator.sendBeacon) {
            navigator.sendBeacon('/api/performance', JSON.stringify(issue));
        }
        
        // Stocker localement
        this.state.performanceData.push(issue);
        
        // Limiter taille
        if (this.state.performanceData.length > 100) {
            this.state.performanceData = this.state.performanceData.slice(-50);
        }
    },
    
    // Nettoyer resources
    cleanup() {
        // Arrêter observers
        this.state.observers.forEach(observer => observer.disconnect());
        
        // Terminer worker
        if (this.worker) {
            this.worker.terminate();
        }
        
        // Clear state
        this.state.prefetched.clear();
        this.state.loadedChunks.clear();
    }
};

// Auto-init si DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => PerformanceConfig.init());
} else {
    PerformanceConfig.init();
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceConfig;
}