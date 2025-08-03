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