/**
 * OCR Cache Manager
 * Gestionnaire de cache pour optimiser les performances OCR
 * Évite de retraiter les mêmes documents
 */

class OCRCacheManager {
    constructor(options = {}) {
        this.cache = new Map();
        this.maxSize = options.maxSize || 50;
        this.ttl = options.ttl || 3600000; // 1 heure par défaut
        this.debug = options.debug || false;
        
        // Statistiques de cache
        this.stats = {
            hits: 0,
            misses: 0,
            evictions: 0
        };
        
        // Nettoyage automatique toutes les 10 minutes
        this.cleanupInterval = setInterval(() => this.cleanup(), 600000);
        
        if (this.debug) {
            console.log('🗄️ OCR Cache Manager initialisé', {
                maxSize: this.maxSize,
                ttl: this.ttl / 1000 + 's'
            });
        }
    }
    
    /**
     * Générer une clé unique pour un fichier
     */
    getKey(file) {
        if (!file) return null;
        
        // Utiliser nom, taille et date de modification pour l'unicité
        const key = `${file.name}_${file.size}_${file.lastModified || Date.now()}`;
        return this.hashCode(key);
    }
    
    /**
     * Hash simple pour clés compactes
     */
    hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash).toString(36);
    }
    
    /**
     * Récupérer du cache
     */
    get(file) {
        const key = this.getKey(file);
        if (!key) return null;
        
        const entry = this.cache.get(key);
        
        if (!entry) {
            this.stats.misses++;
            if (this.debug) console.log('❌ Cache MISS:', file.name);
            return null;
        }
        
        // Vérifier expiration
        if (Date.now() > entry.expiry) {
            this.cache.delete(key);
            this.stats.misses++;
            if (this.debug) console.log('⏰ Cache EXPIRED:', file.name);
            return null;
        }
        
        // Mettre à jour l'accès pour LRU
        entry.lastAccess = Date.now();
        this.stats.hits++;
        
        if (this.debug) {
            console.log('✅ Cache HIT:', file.name, {
                hitRate: ((this.stats.hits / (this.stats.hits + this.stats.misses)) * 100).toFixed(1) + '%'
            });
        }
        
        return entry.data;
    }
    
    /**
     * Ajouter au cache
     */
    set(file, data) {
        const key = this.getKey(file);
        if (!key || !data) return false;
        
        // Vérifier la taille du cache
        if (this.cache.size >= this.maxSize) {
            this.evictLRU();
        }
        
        const entry = {
            data: data,
            expiry: Date.now() + this.ttl,
            lastAccess: Date.now(),
            size: JSON.stringify(data).length,
            filename: file.name
        };
        
        this.cache.set(key, entry);
        
        if (this.debug) {
            console.log('💾 Cache SET:', file.name, {
                size: (entry.size / 1024).toFixed(1) + 'KB',
                cacheSize: this.cache.size + '/' + this.maxSize
            });
        }
        
        return true;
    }
    
    /**
     * Éviction LRU (Least Recently Used)
     */
    evictLRU() {
        let oldestKey = null;
        let oldestTime = Infinity;
        
        for (const [key, entry] of this.cache.entries()) {
            if (entry.lastAccess < oldestTime) {
                oldestTime = entry.lastAccess;
                oldestKey = key;
            }
        }
        
        if (oldestKey) {
            const evicted = this.cache.get(oldestKey);
            this.cache.delete(oldestKey);
            this.stats.evictions++;
            
            if (this.debug) {
                console.log('🗑️ Cache EVICT:', evicted.filename);
            }
        }
    }
    
    /**
     * Nettoyer les entrées expirées
     */
    cleanup() {
        const now = Date.now();
        let cleaned = 0;
        
        for (const [key, entry] of this.cache.entries()) {
            if (now > entry.expiry) {
                this.cache.delete(key);
                cleaned++;
            }
        }
        
        if (this.debug && cleaned > 0) {
            console.log('🧹 Cache CLEANUP:', cleaned + ' entrées supprimées');
        }
    }
    
    /**
     * Vider le cache
     */
    clear() {
        const size = this.cache.size;
        this.cache.clear();
        this.stats = { hits: 0, misses: 0, evictions: 0 };
        
        if (this.debug) {
            console.log('🗑️ Cache CLEAR:', size + ' entrées supprimées');
        }
    }
    
    /**
     * Obtenir les statistiques
     */
    getStats() {
        const total = this.stats.hits + this.stats.misses;
        return {
            ...this.stats,
            hitRate: total > 0 ? (this.stats.hits / total * 100).toFixed(1) + '%' : '0%',
            size: this.cache.size,
            maxSize: this.maxSize
        };
    }
    
    /**
     * Précharger des résultats
     */
    preload(entries) {
        if (!Array.isArray(entries)) return;
        
        let loaded = 0;
        for (const entry of entries) {
            if (entry.file && entry.data) {
                this.set(entry.file, entry.data);
                loaded++;
            }
        }
        
        if (this.debug) {
            console.log('📦 Cache PRELOAD:', loaded + ' entrées');
        }
    }
    
    /**
     * Sauvegarder dans localStorage
     */
    persist() {
        try {
            const data = [];
            for (const [key, entry] of this.cache.entries()) {
                // Ne sauvegarder que les données essentielles
                data.push({
                    key,
                    filename: entry.filename,
                    data: entry.data,
                    expiry: entry.expiry
                });
            }
            
            localStorage.setItem('ocr_cache', JSON.stringify(data));
            
            if (this.debug) {
                console.log('💾 Cache PERSIST:', data.length + ' entrées');
            }
            
            return true;
        } catch (e) {
            console.error('Erreur sauvegarde cache:', e);
            return false;
        }
    }
    
    /**
     * Restaurer depuis localStorage
     */
    restore() {
        try {
            const data = JSON.parse(localStorage.getItem('ocr_cache') || '[]');
            let restored = 0;
            
            for (const entry of data) {
                if (entry.expiry > Date.now()) {
                    this.cache.set(entry.key, {
                        ...entry,
                        lastAccess: Date.now()
                    });
                    restored++;
                }
            }
            
            if (this.debug) {
                console.log('📂 Cache RESTORE:', restored + ' entrées');
            }
            
            return restored;
        } catch (e) {
            console.error('Erreur restauration cache:', e);
            return 0;
        }
    }
    
    /**
     * Destruction propre
     */
    destroy() {
        clearInterval(this.cleanupInterval);
        this.clear();
        
        if (this.debug) {
            console.log('💥 Cache Manager détruit');
        }
    }
}

// Export pour utilisation
window.OCRCacheManager = OCRCacheManager;