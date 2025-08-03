# Guide d'Optimisation des Performances - Dashboard Multi-Rôles
*Date : 20 Janvier 2025*

## 🎯 Objectifs
- Réduire le temps de chargement initial à < 2 secondes
- Améliorer la fluidité de navigation
- Optimiser la consommation mémoire
- Supporter 1000+ entrées dans les listes
- Réduire la bande passante utilisée

## 📊 Analyse de Performance Actuelle

### Problèmes Identifiés
1. **Chargement initial lent** : ~45 fichiers JS chargés
2. **Pas de pagination** : Toutes les données chargées d'un coup
3. **Cache basique** : LocalStorage limité à 5MB
4. **Pas de lazy loading** : Tous les modules chargés au démarrage
5. **CSS non optimisé** : 4000+ lignes non utilisées
6. **Images non optimisées** : Format PNG/JPG lourd

## 🚀 Plan d'Optimisation

### Phase 1 : Pagination et Virtualisation
1. Système de pagination universel
2. Virtual scrolling pour grandes listes
3. Chargement progressif des données
4. Infinite scroll intelligent

### Phase 2 : Cache Avancé
1. IndexedDB pour stockage illimité
2. Service Worker amélioré
3. Cache stratégique par type de données
4. Synchronisation en arrière-plan

### Phase 3 : Lazy Loading
1. Chargement des modules à la demande
2. Code splitting par rôle
3. Préchargement intelligent
4. Routes dynamiques

### Phase 4 : Build et Bundle
1. Configuration Webpack
2. Tree shaking
3. Minification avancée
4. Compression Gzip/Brotli

### Phase 5 : Optimisations Frontend
1. Images WebP avec fallback
2. CSS critique inline
3. Fonts optimisées
4. Préconnexion aux CDN

## 💻 Implémentations

### 1. Système de Pagination Universel

```javascript
// pagination-system.js
const PaginationSystem = {
    // Configuration par défaut
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
    
    // État de pagination par module
    paginationStates: new Map(),
    
    // Créer un état de pagination
    createPaginationState(moduleId, options = {}) {
        const state = {
            currentPage: 1,
            pageSize: options.pageSize || this.DEFAULT_PAGE_SIZE,
            totalItems: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPrevPage: false,
            isLoading: false,
            sortBy: options.sortBy || 'created_at',
            sortOrder: options.sortOrder || 'desc',
            filters: options.filters || {}
        };
        
        this.paginationStates.set(moduleId, state);
        return state;
    },
    
    // Obtenir l'état de pagination
    getState(moduleId) {
        return this.paginationStates.get(moduleId) || this.createPaginationState(moduleId);
    },
    
    // Mettre à jour l'état
    updateState(moduleId, updates) {
        const state = this.getState(moduleId);
        Object.assign(state, updates);
        this.paginationStates.set(moduleId, state);
        return state;
    },
    
    // Calculer les métadonnées de pagination
    calculateMetadata(totalItems, currentPage, pageSize) {
        const totalPages = Math.ceil(totalItems / pageSize);
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize, totalItems);
        
        return {
            totalItems,
            totalPages,
            currentPage,
            pageSize,
            startIndex,
            endIndex,
            hasNextPage: currentPage < totalPages,
            hasPrevPage: currentPage > 1,
            displayRange: `${startIndex + 1}-${endIndex} sur ${totalItems}`
        };
    },
    
    // Paginer un tableau de données
    paginateArray(data, page, pageSize) {
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        return data.slice(start, end);
    },
    
    // Créer les contrôles de pagination
    createControls(moduleId, containerId, onPageChange) {
        const state = this.getState(moduleId);
        const container = document.getElementById(containerId);
        
        if (!container) return;
        
        const metadata = this.calculateMetadata(
            state.totalItems,
            state.currentPage,
            state.pageSize
        );
        
        container.innerHTML = `
            <div class="pagination-controls d-flex align-items-center justify-content-between">
                <div class="pagination-info text-muted">
                    ${metadata.displayRange}
                </div>
                
                <nav>
                    <ul class="pagination pagination-sm mb-0">
                        <li class="page-item ${!metadata.hasPrevPage ? 'disabled' : ''}">
                            <a class="page-link" href="#" data-page="1" title="Première page">
                                <i class="ti ti-chevrons-left"></i>
                            </a>
                        </li>
                        <li class="page-item ${!metadata.hasPrevPage ? 'disabled' : ''}">
                            <a class="page-link" href="#" data-page="${metadata.currentPage - 1}" title="Page précédente">
                                <i class="ti ti-chevron-left"></i>
                            </a>
                        </li>
                        
                        ${this.generatePageNumbers(metadata).map(page => `
                            <li class="page-item ${page === metadata.currentPage ? 'active' : ''} ${page === '...' ? 'disabled' : ''}">
                                <a class="page-link" href="#" data-page="${page}">${page}</a>
                            </li>
                        `).join('')}
                        
                        <li class="page-item ${!metadata.hasNextPage ? 'disabled' : ''}">
                            <a class="page-link" href="#" data-page="${metadata.currentPage + 1}" title="Page suivante">
                                <i class="ti ti-chevron-right"></i>
                            </a>
                        </li>
                        <li class="page-item ${!metadata.hasNextPage ? 'disabled' : ''}">
                            <a class="page-link" href="#" data-page="${metadata.totalPages}" title="Dernière page">
                                <i class="ti ti-chevrons-right"></i>
                            </a>
                        </li>
                    </ul>
                </nav>
                
                <div class="pagination-size">
                    <select class="form-select form-select-sm" id="${moduleId}-page-size">
                        <option value="10" ${state.pageSize === 10 ? 'selected' : ''}>10 / page</option>
                        <option value="20" ${state.pageSize === 20 ? 'selected' : ''}>20 / page</option>
                        <option value="50" ${state.pageSize === 50 ? 'selected' : ''}>50 / page</option>
                        <option value="100" ${state.pageSize === 100 ? 'selected' : ''}>100 / page</option>
                    </select>
                </div>
            </div>
        `;
        
        // Attacher les événements
        container.querySelectorAll('[data-page]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = parseInt(e.currentTarget.dataset.page);
                if (!isNaN(page) && page !== metadata.currentPage) {
                    this.goToPage(moduleId, page, onPageChange);
                }
            });
        });
        
        // Changement de taille de page
        const pageSizeSelect = document.getElementById(`${moduleId}-page-size`);
        if (pageSizeSelect) {
            pageSizeSelect.addEventListener('change', (e) => {
                const newSize = parseInt(e.target.value);
                this.changePageSize(moduleId, newSize, onPageChange);
            });
        }
    },
    
    // Générer les numéros de page
    generatePageNumbers(metadata) {
        const { currentPage, totalPages } = metadata;
        const pages = [];
        
        if (totalPages <= 7) {
            // Afficher toutes les pages
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Affichage avec ellipses
            if (currentPage <= 3) {
                pages.push(1, 2, 3, 4, '...', totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
            }
        }
        
        return pages;
    },
    
    // Aller à une page
    async goToPage(moduleId, page, callback) {
        const state = this.getState(moduleId);
        
        if (page < 1 || page > Math.ceil(state.totalItems / state.pageSize)) {
            return;
        }
        
        this.updateState(moduleId, { 
            currentPage: page,
            isLoading: true 
        });
        
        if (callback) {
            await callback(page, state.pageSize);
        }
        
        this.updateState(moduleId, { isLoading: false });
    },
    
    // Changer la taille de page
    async changePageSize(moduleId, newSize, callback) {
        const state = this.getState(moduleId);
        
        // Calculer la nouvelle page pour garder la position
        const firstItemIndex = (state.currentPage - 1) * state.pageSize;
        const newPage = Math.floor(firstItemIndex / newSize) + 1;
        
        this.updateState(moduleId, {
            pageSize: newSize,
            currentPage: newPage,
            isLoading: true
        });
        
        if (callback) {
            await callback(newPage, newSize);
        }
        
        this.updateState(moduleId, { isLoading: false });
    }
};

// Export global
window.PaginationSystem = PaginationSystem;
```

### 2. Virtual Scrolling

```javascript
// virtual-scroll.js
const VirtualScroll = {
    // Configuration
    ITEM_HEIGHT: 60, // Hauteur d'un item en pixels
    BUFFER_SIZE: 5, // Items supplémentaires à rendre
    
    // Créer un conteneur virtual scroll
    create(containerId, data, renderItem, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const itemHeight = options.itemHeight || this.ITEM_HEIGHT;
        const bufferSize = options.bufferSize || this.BUFFER_SIZE;
        
        // Structure HTML
        container.innerHTML = `
            <div class="virtual-scroll-viewport" style="height: ${options.height || 400}px; overflow-y: auto;">
                <div class="virtual-scroll-spacer"></div>
                <div class="virtual-scroll-content"></div>
            </div>
        `;
        
        const viewport = container.querySelector('.virtual-scroll-viewport');
        const spacer = container.querySelector('.virtual-scroll-spacer');
        const content = container.querySelector('.virtual-scroll-content');
        
        // Calculer la hauteur totale
        const totalHeight = data.length * itemHeight;
        spacer.style.height = `${totalHeight}px`;
        
        // État du scroll
        let scrollTop = 0;
        let startIndex = 0;
        let endIndex = 0;
        
        // Fonction de rendu
        const render = () => {
            const viewportHeight = viewport.clientHeight;
            
            // Calculer les indices visibles
            startIndex = Math.floor(scrollTop / itemHeight) - bufferSize;
            endIndex = Math.ceil((scrollTop + viewportHeight) / itemHeight) + bufferSize;
            
            // Limiter les indices
            startIndex = Math.max(0, startIndex);
            endIndex = Math.min(data.length, endIndex);
            
            // Rendre les items visibles
            const visibleItems = data.slice(startIndex, endIndex);
            
            content.innerHTML = visibleItems.map((item, index) => {
                const actualIndex = startIndex + index;
                const top = actualIndex * itemHeight;
                
                return `
                    <div class="virtual-scroll-item" 
                         style="position: absolute; top: ${top}px; height: ${itemHeight}px; width: 100%;">
                        ${renderItem(item, actualIndex)}
                    </div>
                `;
            }).join('');
        };
        
        // Gérer le scroll
        let scrollTimeout;
        viewport.addEventListener('scroll', () => {
            scrollTop = viewport.scrollTop;
            
            // Debounce pour performance
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(render, 10);
        });
        
        // Rendu initial
        render();
        
        // API publique
        return {
            update: (newData) => {
                data = newData;
                spacer.style.height = `${data.length * itemHeight}px`;
                render();
            },
            scrollTo: (index) => {
                viewport.scrollTop = index * itemHeight;
            },
            refresh: render
        };
    }
};
```

### 3. Cache Avancé avec IndexedDB

```javascript
// advanced-cache.js
const AdvancedCache = {
    DB_NAME: 'DashboardCache',
    DB_VERSION: 1,
    STORE_NAME: 'cache',
    db: null,
    
    // Initialiser IndexedDB
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                if (!db.objectStoreNames.contains(this.STORE_NAME)) {
                    const store = db.createObjectStore(this.STORE_NAME, { keyPath: 'key' });
                    store.createIndex('expires', 'expires', { unique: false });
                    store.createIndex('category', 'category', { unique: false });
                }
            };
        });
    },
    
    // Sauvegarder dans le cache
    async set(key, data, options = {}) {
        const ttl = options.ttl || 3600000; // 1 heure par défaut
        const category = options.category || 'general';
        
        const item = {
            key,
            data,
            category,
            expires: Date.now() + ttl,
            created: Date.now(),
            size: JSON.stringify(data).length
        };
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.STORE_NAME], 'readwrite');
            const store = transaction.objectStore(this.STORE_NAME);
            const request = store.put(item);
            
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    },
    
    // Récupérer du cache
    async get(key) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.STORE_NAME], 'readonly');
            const store = transaction.objectStore(this.STORE_NAME);
            const request = store.get(key);
            
            request.onsuccess = () => {
                const item = request.result;
                
                if (!item) {
                    resolve(null);
                    return;
                }
                
                // Vérifier l'expiration
                if (Date.now() > item.expires) {
                    this.delete(key);
                    resolve(null);
                    return;
                }
                
                resolve(item.data);
            };
            
            request.onerror = () => reject(request.error);
        });
    },
    
    // Supprimer du cache
    async delete(key) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.STORE_NAME], 'readwrite');
            const store = transaction.objectStore(this.STORE_NAME);
            const request = store.delete(key);
            
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    },
    
    // Nettoyer les entrées expirées
    async cleanup() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.STORE_NAME], 'readwrite');
            const store = transaction.objectStore(this.STORE_NAME);
            const index = store.index('expires');
            const range = IDBKeyRange.upperBound(Date.now());
            const request = index.openCursor(range);
            
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    store.delete(cursor.primaryKey);
                    cursor.continue();
                } else {
                    resolve();
                }
            };
            
            request.onerror = () => reject(request.error);
        });
    },
    
    // Obtenir la taille du cache
    async getSize() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.STORE_NAME], 'readonly');
            const store = transaction.objectStore(this.STORE_NAME);
            const request = store.getAll();
            
            request.onsuccess = () => {
                const items = request.result;
                const totalSize = items.reduce((sum, item) => sum + item.size, 0);
                resolve({
                    itemCount: items.length,
                    totalSize: totalSize,
                    formattedSize: this.formatBytes(totalSize)
                });
            };
            
            request.onerror = () => reject(request.error);
        });
    },
    
    // Invalider par catégorie
    async invalidateCategory(category) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.STORE_NAME], 'readwrite');
            const store = transaction.objectStore(this.STORE_NAME);
            const index = store.index('category');
            const request = index.openCursor(IDBKeyRange.only(category));
            
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    store.delete(cursor.primaryKey);
                    cursor.continue();
                } else {
                    resolve();
                }
            };
            
            request.onerror = () => reject(request.error);
        });
    },
    
    // Formater la taille en bytes
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    
    // Cache avec fallback
    async getOrFetch(key, fetchFn, options = {}) {
        // Essayer de récupérer du cache
        const cached = await this.get(key);
        if (cached !== null) {
            return cached;
        }
        
        // Sinon, fetch et mettre en cache
        try {
            const data = await fetchFn();
            await this.set(key, data, options);
            return data;
        } catch (error) {
            console.error('Fetch error:', error);
            throw error;
        }
    }
};

// Initialiser au chargement
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await AdvancedCache.init();
        console.log('✅ Cache avancé initialisé');
        
        // Nettoyer automatiquement toutes les heures
        setInterval(() => {
            AdvancedCache.cleanup();
        }, 3600000);
        
    } catch (error) {
        console.error('❌ Erreur initialisation cache:', error);
    }
});

// Export global
window.AdvancedCache = AdvancedCache;
```

### 4. Lazy Loading des Modules

```javascript
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
```

## 📦 Configuration Webpack

```javascript
// webpack.config.js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
    mode: 'production',
    
    entry: {
        // Points d'entrée par rôle
        client: './assets/js/entries/client.js',
        prestataire: './assets/js/entries/prestataire.js',
        revendeur: './assets/js/entries/revendeur.js',
        
        // Modules partagés
        shared: './assets/js/entries/shared.js',
        auth: './assets/js/auth-notion.js'
    },
    
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'js/[name].[contenthash:8].js',
        chunkFilename: 'js/[name].[contenthash:8].chunk.js',
        publicPath: '/'
    },
    
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    compress: {
                        drop_console: true,
                        drop_debugger: true
                    }
                }
            }),
            new CssMinimizerPlugin()
        ],
        
        splitChunks: {
            chunks: 'all',
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                    priority: 10
                },
                
                tabler: {
                    test: /tabler/,
                    name: 'tabler',
                    priority: 20
                },
                
                common: {
                    minChunks: 2,
                    priority: -10,
                    reuseExistingChunk: true
                }
            }
        },
        
        runtimeChunk: 'single'
    },
    
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                        plugins: ['@babel/plugin-syntax-dynamic-import']
                    }
                }
            },
            
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    {
                        loader: 'postcss-loader',
                        options: {
                            postcssOptions: {
                                plugins: [
                                    require('autoprefixer'),
                                    require('cssnano')
                                ]
                            }
                        }
                    }
                ]
            },
            
            {
                test: /\.(png|jpg|jpeg|gif|svg|webp)$/i,
                type: 'asset',
                parser: {
                    dataUrlCondition: {
                        maxSize: 8 * 1024 // 8kb
                    }
                },
                generator: {
                    filename: 'images/[name].[hash:8][ext]'
                }
            },
            
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/i,
                type: 'asset/resource',
                generator: {
                    filename: 'fonts/[name].[hash:8][ext]'
                }
            }
        ]
    },
    
    plugins: [
        new CleanWebpackPlugin(),
        
        new MiniCssExtractPlugin({
            filename: 'css/[name].[contenthash:8].css',
            chunkFilename: 'css/[name].[contenthash:8].chunk.css'
        }),
        
        // Compression Gzip/Brotli
        new CompressionPlugin({
            algorithm: 'gzip',
            test: /\.(js|css|html|svg)$/,
            threshold: 8192,
            minRatio: 0.8
        }),
        
        new CompressionPlugin({
            algorithm: 'brotliCompress',
            test: /\.(js|css|html|svg)$/,
            threshold: 8192,
            minRatio: 0.8,
            filename: '[path][base].br'
        }),
        
        // Générer les HTML avec les bons bundles
        ...generateHtmlPlugins()
    ],
    
    performance: {
        maxEntrypointSize: 250000,
        maxAssetSize: 250000,
        hints: 'warning'
    }
};

// Fonction pour générer les plugins HTML
function generateHtmlPlugins() {
    const pages = [
        { role: 'client', pages: ['dashboard', 'projects', 'documents', 'finances'] },
        { role: 'prestataire', pages: ['dashboard', 'missions', 'calendar', 'tasks'] },
        { role: 'revendeur', pages: ['dashboard', 'pipeline', 'clients', 'reports'] }
    ];
    
    const plugins = [];
    
    pages.forEach(({ role, pages: rolePages }) => {
        rolePages.forEach(page => {
            plugins.push(
                new HtmlWebpackPlugin({
                    template: `./${role}/${page}.html`,
                    filename: `${role}/${page}.html`,
                    chunks: ['shared', 'auth', role],
                    minify: {
                        removeComments: true,
                        collapseWhitespace: true,
                        removeAttributeQuotes: true
                    }
                })
            );
        });
    });
    
    return plugins;
}
```

## 🚀 Optimisations Immédiates

### 1. Images WebP avec Fallback
```html
<picture>
    <source srcset="image.webp" type="image/webp">
    <source srcset="image.jpg" type="image/jpeg">
    <img src="image.jpg" alt="Description" loading="lazy">
</picture>
```

### 2. CSS Critique Inline
```html
<style>
/* CSS critique pour le rendu initial */
.page-wrapper{display:flex;min-height:100vh}
.sidebar{width:250px;background:#fff}
/* ... */
</style>
<link rel="preload" href="css/main.css" as="style">
<link rel="stylesheet" href="css/main.css" media="print" onload="this.media='all'">
```

### 3. Préconnexion CDN
```html
<link rel="preconnect" href="https://cdn.jsdelivr.net">
<link rel="dns-prefetch" href="https://cdn.jsdelivr.net">
```

## 📊 Résultats Attendus

### Avant Optimisation
- First Paint: ~3.5s
- First Contentful Paint: ~4.2s
- Time to Interactive: ~6.8s
- Bundle Size: ~2.5MB

### Après Optimisation
- First Paint: < 1.5s (-57%)
- First Contentful Paint: < 2s (-52%)
- Time to Interactive: < 3s (-56%)
- Bundle Size: < 800KB (-68%)

## ✅ Checklist de Déploiement

- [ ] Activer la pagination sur toutes les listes
- [ ] Implémenter le cache IndexedDB
- [ ] Configurer le lazy loading
- [ ] Build avec Webpack
- [ ] Activer la compression serveur
- [ ] Optimiser les images
- [ ] Tester les performances
- [ ] Monitorer avec Lighthouse