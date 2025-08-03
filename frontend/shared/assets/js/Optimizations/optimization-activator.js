/**
 * Optimization Activator - Portal Multi-Rôles
 * Centralise l'activation de toutes les optimisations v2
 */

const OptimizationActivator = {
    // Configuration des optimisations
    config: {
        enablePagination: true,
        enableVirtualScroll: true,
        enableAdvancedCache: true,
        enableLazyLoader: true,
        enableV2Modules: true,
        autoDetectLargeLists: true,
        largeListThreshold: 100
    },

    // Modules optimisés à activer automatiquement
    v2Modules: {
        'auth-notion.js': 'auth-notion-v2.js',
        'pipeline-notion.js': 'pipeline-notion-v2.js',
        // Ajouter d'autres modules v2 ici au fur et à mesure
    },

    // Initialisation
    async init() {
        console.log('🚀 Activation des optimisations v2...');

        try {
            // Charger les modules d'optimisation
            await this.loadOptimizationModules();

            // Activer les modules v2
            this.activateV2Modules();

            // Configurer les optimisations automatiques
            this.setupAutomaticOptimizations();

            // Initialiser les optimisations par page
            this.initPageOptimizations();

            console.log('✅ Toutes les optimisations v2 sont activées');
        } catch (error) {
            console.error('❌ Erreur lors de l\'activation des optimisations:', error);
        }
    },

    // Charger les modules d'optimisation
    async loadOptimizationModules() {
        const modules = [];

        if (this.config.enablePagination && !window.PaginationSystem) {
            modules.push(this.loadScript('/assets/js/pagination-system.js'));
        }

        if (this.config.enableVirtualScroll && !window.VirtualScroll) {
            modules.push(this.loadScript('/assets/js/virtual-scroll.js'));
        }

        if (this.config.enableAdvancedCache && !window.AdvancedCache) {
            modules.push(this.loadScript('/assets/js/advanced-cache.js'));
        }

        if (this.config.enableLazyLoader && !window.LazyLoader) {
            modules.push(this.loadScript('/assets/js/lazy-loader.js'));
        }

        await Promise.all(modules);
    },

    // Charger un script
    loadScript(src) {
        return new Promise((resolve, reject) => {
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

    // Activer les modules v2
    activateV2Modules() {
        if (!this.config.enableV2Modules) return;

        // Intercepter les chargements de modules
        const originalAppendChild = HTMLHeadElement.prototype.appendChild;
        const v2Modules = this.v2Modules;

        HTMLHeadElement.prototype.appendChild = function(element) {
            if (element.tagName === 'SCRIPT' && element.src) {
                // Vérifier si c'est un module à remplacer
                Object.entries(v2Modules).forEach(([original, v2]) => {
                    if (element.src.includes(original)) {
                        console.log(`🔄 Redirection vers module v2: ${original} → ${v2}`);
                        element.src = element.src.replace(original, v2);
                    }
                });
            }
            return originalAppendChild.call(this, element);
        };
    },

    // Configurer les optimisations automatiques
    setupAutomaticOptimizations() {
        // Observer les nouvelles listes pour la pagination
        if (this.config.autoDetectLargeLists) {
            this.observeLargeLists();
        }

        // Optimiser les tableaux DataTables
        this.optimizeDataTables();

        // Configurer le cache pour les données Notion
        this.setupNotionCache();
    },

    // Observer les grandes listes
    observeLargeLists() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) { // Element node
                        this.checkAndOptimizeList(node);
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    },

    // Vérifier et optimiser une liste
    checkAndOptimizeList(element) {
        // Vérifier les tables
        const tables = element.querySelectorAll('table:not([data-optimized])');
        tables.forEach(table => {
            const rows = table.querySelectorAll('tbody tr');
            if (rows.length > this.config.largeListThreshold) {
                this.optimizeTable(table);
            }
        });

        // Vérifier les listes
        const lists = element.querySelectorAll('.list:not([data-optimized]), .list-group:not([data-optimized])');
        lists.forEach(list => {
            const items = list.children;
            if (items.length > this.config.largeListThreshold) {
                this.optimizeList(list);
            }
        });
    },

    // Optimiser une table
    optimizeTable(table) {
        if (!window.PaginationSystem) return;

        console.log(`📄 Optimisation table avec ${table.querySelectorAll('tbody tr').length} lignes`);

        // Marquer comme optimisé
        table.setAttribute('data-optimized', 'true');

        // Créer un conteneur pour les contrôles
        const controlsContainer = document.createElement('div');
        controlsContainer.id = `pagination-${Date.now()}`;
        controlsContainer.className = 'mt-3';
        table.parentNode.insertBefore(controlsContainer, table.nextSibling);

        // Initialiser la pagination
        const moduleId = `table-${Date.now()}`;
        PaginationSystem.createPaginationState(moduleId, { pageSize: 20 });

        // Fonction de rendu
        const renderTable = (page, pageSize) => {
            const rows = Array.from(table.querySelectorAll('tbody tr'));
            const totalItems = rows.length;

            // Mettre à jour l'état
            PaginationSystem.updateState(moduleId, {
                totalItems,
                currentPage: page
            });

            // Afficher/Masquer les lignes
            rows.forEach((row, index) => {
                const start = (page - 1) * pageSize;
                const end = start + pageSize;
                row.style.display = (index >= start && index < end) ? '' : 'none';
            });

            // Créer les contrôles
            PaginationSystem.createControls(moduleId, controlsContainer.id, renderTable);
        };

        // Rendu initial
        renderTable(1, 20);
    },

    // Optimiser une liste
    optimizeList(list) {
        if (!window.VirtualScroll) return;

        console.log(`📜 Optimisation liste avec ${list.children.length} items`);

        // Marquer comme optimisé
        list.setAttribute('data-optimized', 'true');

        // Créer conteneur pour virtual scroll
        const container = document.createElement('div');
        container.id = `virtual-${Date.now()}`;
        container.style.height = '400px';
        
        // Remplacer la liste
        list.parentNode.insertBefore(container, list);
        list.style.display = 'none';

        // Convertir les items en données
        const items = Array.from(list.children).map(child => ({
            html: child.outerHTML,
            data: child.textContent
        }));

        // Initialiser virtual scroll
        VirtualScroll.create(container.id, items, (item) => item.html, {
            height: 400,
            itemHeight: 60
        });
    },

    // Optimiser DataTables
    optimizeDataTables() {
        // Intercepter l'initialisation DataTable
        if (window.$ && window.$.fn && window.$.fn.DataTable) {
            const originalDataTable = window.$.fn.DataTable;

            window.$.fn.DataTable = function(options) {
                // Ajouter les optimisations par défaut
                const optimizedOptions = {
                    ...options,
                    deferRender: true,
                    orderClasses: false,
                    searchDelay: 400,
                    stateSave: true,
                    pageLength: 25,
                    lengthMenu: [[10, 25, 50, 100, -1], [10, 25, 50, 100, "Tout"]]
                };

                console.log('🔧 DataTable optimisé avec deferRender');
                return originalDataTable.call(this, optimizedOptions);
            };

            // Copier les propriétés statiques
            Object.setPrototypeOf(window.$.fn.DataTable, originalDataTable);
            Object.keys(originalDataTable).forEach(key => {
                window.$.fn.DataTable[key] = originalDataTable[key];
            });
        }
    },

    // Configurer le cache Notion
    setupNotionCache() {
        if (!window.AdvancedCache) return;

        // Intercepter les appels API Notion
        if (window.NotionAPI) {
            const originalQuery = window.NotionAPI.query;

            window.NotionAPI.query = async function(database, options) {
                const cacheKey = `notion-${database}-${JSON.stringify(options)}`;

                // Essayer de récupérer du cache
                const cached = await AdvancedCache.get(cacheKey);
                if (cached) {
                    console.log(`💾 Données Notion récupérées du cache: ${database}`);
                    return cached;
                }

                // Sinon, appeler l'API originale
                const result = await originalQuery.call(this, database, options);

                // Mettre en cache
                await AdvancedCache.set(cacheKey, result, {
                    ttl: 300000, // 5 minutes
                    category: 'notion-api'
                });

                return result;
            };
        }
    },

    // Initialiser les optimisations spécifiques à la page
    initPageOptimizations() {
        const pathname = window.location.pathname;

        // Optimisations par page
        const pageOptimizations = {
            '/client/projects.html': () => this.optimizeProjectsPage(),
            '/client/documents.html': () => this.optimizeDocumentsPage(),
            '/prestataire/missions.html': () => this.optimizeMissionsPage(),
            '/revendeur/pipeline.html': () => this.optimizePipelinePage(),
        };

        const optimizer = pageOptimizations[pathname];
        if (optimizer) {
            // Attendre que le DOM soit prêt
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', optimizer);
            } else {
                optimizer();
            }
        }
    },

    // Optimisations spécifiques aux pages
    optimizeProjectsPage() {
        console.log('🔧 Optimisation page projets');
        
        // Précharger les modules nécessaires
        if (window.LazyLoader) {
            LazyLoader.preload(['project-detail', 'documents']);
        }
    },

    optimizeDocumentsPage() {
        console.log('🔧 Optimisation page documents');
        
        // Charger le viewer PDF à la demande
        if (window.LazyLoader) {
            LazyLoader.loadWhenVisible('document-preview', 'pdf-viewer');
        }
    },

    optimizeMissionsPage() {
        console.log('🔧 Optimisation page missions');
        
        // Virtual scroll pour la liste des missions
        setTimeout(() => {
            const missionsList = document.querySelector('.missions-list');
            if (missionsList && missionsList.children.length > 50) {
                this.optimizeList(missionsList);
            }
        }, 1000);
    },

    optimizePipelinePage() {
        console.log('🔧 Optimisation page pipeline');
        
        // Utiliser v2 pour le pipeline
        // Déjà géré par activateV2Modules
    },

    // Obtenir les statistiques d'optimisation
    async getStats() {
        const stats = {
            modules: {
                pagination: !!window.PaginationSystem,
                virtualScroll: !!window.VirtualScroll,
                advancedCache: !!window.AdvancedCache,
                lazyLoader: !!window.LazyLoader
            },
            cache: null,
            optimizedElements: {
                tables: document.querySelectorAll('table[data-optimized]').length,
                lists: document.querySelectorAll('.list[data-optimized], .list-group[data-optimized]').length
            }
        };

        if (window.AdvancedCache) {
            stats.cache = await AdvancedCache.getSize();
        }

        return stats;
    },

    // Afficher les statistiques
    async showStats() {
        const stats = await this.getStats();
        console.log('📊 Statistiques d\'optimisation:', stats);
        return stats;
    }
};

// Auto-initialisation
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => OptimizationActivator.init());
} else {
    OptimizationActivator.init();
}

// Export global
window.OptimizationActivator = OptimizationActivator;