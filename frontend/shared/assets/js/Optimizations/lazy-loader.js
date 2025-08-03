// lazy-loader.js
const LazyLoader = {
    // Modules chargés
    loadedModules: new Set(),
    loadingModules: new Map(),
    
    // Configuration des modules
    moduleConfig: {
        // Client
        'projects': {
            files: ['assets/js/projects-notion.js'],
            dependencies: ['notion-connector']
        },
        'documents': {
            files: ['assets/js/documents-notion.js', 'assets/js/document-preview.js'],
            dependencies: ['notion-connector']
        },
        'finances': {
            files: ['assets/js/finances-notion.js'],
            dependencies: ['notion-connector', 'charts']
        },
        
        // Prestataire
        'missions': {
            files: ['assets/js/missions-notion.js'],
            dependencies: ['notion-connector']
        },
        'calendar': {
            files: ['assets/js/calendar-notion.js'],
            dependencies: ['notion-connector', 'fullcalendar']
        },
        
        // Revendeur
        'pipeline': {
            files: ['assets/js/pipeline-notion.js'],
            dependencies: ['notion-connector', 'draggable']
        },
        
        // Librairies tierces
        'charts': {
            files: ['https://cdn.jsdelivr.net/npm/apexcharts@3.44.0/dist/apexcharts.min.js'],
            global: 'ApexCharts'
        },
        'fullcalendar': {
            files: [
                'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.10/index.global.min.js'
            ],
            global: 'FullCalendar'
        },
        'draggable': {
            files: ['https://cdn.jsdelivr.net/npm/@shopify/draggable@1.0.0-beta.12/lib/draggable.bundle.js'],
            global: 'Draggable'
        }
    },
    
    // Charger un module
    async load(moduleName) {
        // Déjà chargé
        if (this.loadedModules.has(moduleName)) {
            return true;
        }
        
        // En cours de chargement
        if (this.loadingModules.has(moduleName)) {
            return this.loadingModules.get(moduleName);
        }
        
        // Créer la promesse de chargement
        const loadPromise = this._loadModule(moduleName);
        this.loadingModules.set(moduleName, loadPromise);
        
        try {
            await loadPromise;
            this.loadedModules.add(moduleName);
            this.loadingModules.delete(moduleName);
            return true;
        } catch (error) {
            this.loadingModules.delete(moduleName);
            throw error;
        }
    },
    
    // Charger plusieurs modules
    async loadMultiple(moduleNames) {
        const promises = moduleNames.map(name => this.load(name));
        return Promise.all(promises);
    },
    
    // Logique de chargement interne
    async _loadModule(moduleName) {
        const config = this.moduleConfig[moduleName];
        if (!config) {
            throw new Error(`Module inconnu: ${moduleName}`);
        }
        
        // Charger les dépendances d'abord
        if (config.dependencies) {
            await this.loadMultiple(config.dependencies);
        }
        
        // Charger les fichiers du module
        await Promise.all(config.files.map(file => this._loadScript(file)));
        
        // Vérifier que le module est bien chargé (pour les librairies)
        if (config.global && !window[config.global]) {
            throw new Error(`Module ${moduleName} non trouvé après chargement`);
        }
        
        console.log(`✅ Module chargé: ${moduleName}`);
    },
    
    // Charger un script
    _loadScript(src) {
        return new Promise((resolve, reject) => {
            // Vérifier si déjà chargé
            if (document.querySelector(`script[src="${src}"]`)) {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            
            script.onload = resolve;
            script.onerror = () => reject(new Error(`Échec chargement: ${src}`));
            
            document.head.appendChild(script);
        });
    },
    
    // Précharger des modules (pour performance)
    preload(moduleNames) {
        moduleNames.forEach(name => {
            const config = this.moduleConfig[name];
            if (!config) return;
            
            config.files.forEach(file => {
                const link = document.createElement('link');
                link.rel = 'preload';
                link.as = 'script';
                link.href = file;
                document.head.appendChild(link);
            });
        });
    },
    
    // Charger un module quand visible (Intersection Observer)
    loadWhenVisible(elementId, moduleName) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.load(moduleName);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '50px' // Charger 50px avant d'être visible
        });
        
        observer.observe(element);
    },
    
    // Charger selon la route
    async loadForRoute(path) {
        // Déterminer les modules nécessaires selon la route
        const routeModules = {
            '/client/projects.html': ['projects'],
            '/client/documents.html': ['documents'],
            '/client/finances.html': ['finances', 'charts'],
            '/prestataire/missions.html': ['missions'],
            '/prestataire/calendar.html': ['calendar'],
            '/revendeur/pipeline.html': ['pipeline']
        };
        
        const modules = routeModules[path] || [];
        
        if (modules.length > 0) {
            console.log(`🔄 Chargement des modules pour ${path}:`, modules);
            await this.loadMultiple(modules);
        }
    }
};

// Auto-chargement selon la page
document.addEventListener('DOMContentLoaded', () => {
    const currentPath = window.location.pathname;
    LazyLoader.loadForRoute(currentPath);
});

// Export global
window.LazyLoader = LazyLoader;