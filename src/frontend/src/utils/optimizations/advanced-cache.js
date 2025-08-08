/**
 * Système de cache avancé pour optimiser les performances
 * Inspiré des optimisations du dashboard legacy
 */

class AdvancedCache {
  constructor() {
    this.memoryCache = new Map();
    this.indexedDBCache = null;
    this.compressionEnabled = true;
    this.maxMemorySize = 50 * 1024 * 1024; // 50MB
    this.defaultTTL = 5 * 60 * 1000; // 5 minutes
    
    this.initIndexedDB();
    this.setupMemoryManagement();
  }

  async initIndexedDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('DirectusCache', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.indexedDBCache = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Store pour les données API
        if (!db.objectStoreNames.contains('apiCache')) {
          const apiStore = db.createObjectStore('apiCache', { keyPath: 'key' });
          apiStore.createIndex('expiry', 'expiry', { unique: false });
          apiStore.createIndex('collection', 'collection', { unique: false });
        }
        
        // Store pour les assets
        if (!db.objectStoreNames.contains('assetCache')) {
          const assetStore = db.createObjectStore('assetCache', { keyPath: 'url' });
          assetStore.createIndex('size', 'size', { unique: false });
        }
      };
    });
  }

  setupMemoryManagement() {
    // Nettoyage automatique toutes les 30 secondes
    setInterval(() => {
      this.cleanExpiredMemoryCache();
      this.enforceMemoryLimit();
    }, 30000);

    // Nettoyage IndexedDB quotidien
    setInterval(() => {
      this.cleanExpiredIndexedDB();
    }, 24 * 60 * 60 * 1000);
  }

  // Cache en mémoire pour accès ultra-rapide
  setMemory(key, data, ttl = this.defaultTTL) {
    const entry = {
      data: this.compressionEnabled ? this.compress(data) : data,
      expiry: Date.now() + ttl,
      size: this.calculateSize(data),
      compressed: this.compressionEnabled,
      accessed: Date.now(),
      hits: 0
    };
    
    this.memoryCache.set(key, entry);
    this.enforceMemoryLimit();
  }

  getMemory(key) {
    const entry = this.memoryCache.get(key);
    
    if (!entry) return null;
    
    if (Date.now() > entry.expiry) {
      this.memoryCache.delete(key);
      return null;
    }
    
    // Mettre à jour statistiques d'accès
    entry.accessed = Date.now();
    entry.hits++;
    
    return entry.compressed ? this.decompress(entry.data) : entry.data;
  }

  // Cache IndexedDB pour persistance
  async setIndexedDB(key, data, collection = 'general', ttl = this.defaultTTL * 12) {
    if (!this.indexedDBCache) return;
    
    const transaction = this.indexedDBCache.transaction(['apiCache'], 'readwrite');
    const store = transaction.objectStore('apiCache');
    
    const entry = {
      key,
      data: this.compressionEnabled ? this.compress(data) : data,
      collection,
      expiry: Date.now() + ttl,
      created: Date.now(),
      compressed: this.compressionEnabled,
      size: this.calculateSize(data)
    };
    
    await store.put(entry);
  }

  async getIndexedDB(key) {
    if (!this.indexedDBCache) return null;
    
    const transaction = this.indexedDBCache.transaction(['apiCache'], 'readonly');
    const store = transaction.objectStore('apiCache');
    
    return new Promise((resolve) => {
      const request = store.get(key);
      
      request.onsuccess = () => {
        const entry = request.result;
        
        if (!entry || Date.now() > entry.expiry) {
          resolve(null);
          return;
        }
        
        const data = entry.compressed ? this.decompress(entry.data) : entry.data;
        
        // Remettre en cache mémoire pour accès rapide
        this.setMemory(key, data, Math.max(0, entry.expiry - Date.now()));
        
        resolve(data);
      };
      
      request.onerror = () => resolve(null);
    });
  }

  // API unifiée
  async set(key, data, options = {}) {
    const {
      ttl = this.defaultTTL,
      collection = 'general',
      persistent = true,
      priority = 'normal'
    } = options;
    
    // Toujours en mémoire pour accès rapide
    this.setMemory(key, data, ttl);
    
    // En IndexedDB si persistant
    if (persistent && this.indexedDBCache) {
      await this.setIndexedDB(key, data, collection, ttl * 3);
    }
  }

  async get(key) {
    // Essayer d'abord le cache mémoire
    let data = this.getMemory(key);
    if (data) return data;
    
    // Puis IndexedDB
    data = await this.getIndexedDB(key);
    return data;
  }

  // Cache spécialisé pour les requêtes API
  async cacheAPIResponse(endpoint, params, response, options = {}) {
    const cacheKey = this.generateAPIKey(endpoint, params);
    const collection = endpoint.split('/')[0] || 'api';
    
    await this.set(cacheKey, response, {
      collection,
      ttl: options.ttl || this.getAPITTL(endpoint),
      persistent: options.persistent !== false
    });
  }

  async getAPICache(endpoint, params) {
    const cacheKey = this.generateAPIKey(endpoint, params);
    return await this.get(cacheKey);
  }

  generateAPIKey(endpoint, params = {}) {
    const normalizedParams = Object.keys(params)
      .sort()
      .reduce((acc, key) => {
        acc[key] = params[key];
        return acc;
      }, {});
    
    return `api:${endpoint}:${btoa(JSON.stringify(normalizedParams))}`;
  }

  getAPITTL(endpoint) {
    // TTL adaptatif selon le type d'endpoint
    if (endpoint.includes('dashboard') || endpoint.includes('stats')) {
      return 2 * 60 * 1000; // 2 minutes pour données temps réel
    }
    
    if (endpoint.includes('projects') || endpoint.includes('invoices')) {
      return 5 * 60 * 1000; // 5 minutes pour données business
    }
    
    if (endpoint.includes('companies') || endpoint.includes('people')) {
      return 15 * 60 * 1000; // 15 minutes pour données de référence
    }
    
    return this.defaultTTL;
  }

  // Invalidation intelligente
  async invalidateCollection(collection) {
    // Invalider cache mémoire
    for (const [key, entry] of this.memoryCache.entries()) {
      if (key.includes(collection)) {
        this.memoryCache.delete(key);
      }
    }
    
    // Invalider IndexedDB
    if (this.indexedDBCache) {
      const transaction = this.indexedDBCache.transaction(['apiCache'], 'readwrite');
      const store = transaction.objectStore('apiCache');
      const index = store.index('collection');
      
      const request = index.getAllKeys(collection);
      request.onsuccess = () => {
        const keys = request.result;
        keys.forEach(key => store.delete(key));
      };
    }
  }

  async invalidatePattern(pattern) {
    const regex = new RegExp(pattern);
    
    // Cache mémoire
    for (const key of this.memoryCache.keys()) {
      if (regex.test(key)) {
        this.memoryCache.delete(key);
      }
    }
    
    // IndexedDB - plus complexe, on itère
    if (this.indexedDBCache) {
      const transaction = this.indexedDBCache.transaction(['apiCache'], 'readwrite');
      const store = transaction.objectStore('apiCache');
      
      store.openCursor().onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          if (regex.test(cursor.value.key)) {
            cursor.delete();
          }
          cursor.continue();
        }
      };
    }
  }

  // Nettoyage et maintenance
  cleanExpiredMemoryCache() {
    const now = Date.now();
    for (const [key, entry] of this.memoryCache.entries()) {
      if (now > entry.expiry) {
        this.memoryCache.delete(key);
      }
    }
  }

  enforceMemoryLimit() {
    const currentSize = this.getMemoryCacheSize();
    
    if (currentSize <= this.maxMemorySize) return;
    
    // Trier par score (fréquence d'accès vs taille vs age)
    const entries = Array.from(this.memoryCache.entries())
      .map(([key, entry]) => ({
        key,
        entry,
        score: this.calculateEvictionScore(entry)
      }))
      .sort((a, b) => a.score - b.score);
    
    // Supprimer les moins utiles jusqu'à respecter la limite
    let removedSize = 0;
    for (const { key, entry } of entries) {
      this.memoryCache.delete(key);
      removedSize += entry.size;
      
      if (currentSize - removedSize <= this.maxMemorySize * 0.8) break;
    }
  }

  calculateEvictionScore(entry) {
    const age = Date.now() - entry.accessed;
    const hitRate = entry.hits / Math.max(1, (Date.now() - (entry.accessed - age)) / 60000);
    const sizeWeight = entry.size / 1024; // KB
    
    // Score plus bas = plus susceptible d'être évincé
    return sizeWeight / (hitRate + 1) + (age / 60000); // Âge en minutes
  }

  async cleanExpiredIndexedDB() {
    if (!this.indexedDBCache) return;
    
    const transaction = this.indexedDBCache.transaction(['apiCache'], 'readwrite');
    const store = transaction.objectStore('apiCache');
    const index = store.index('expiry');
    
    const now = Date.now();
    const range = IDBKeyRange.upperBound(now);
    
    index.openCursor(range).onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      }
    };
  }

  getMemoryCacheSize() {
    let total = 0;
    for (const entry of this.memoryCache.values()) {
      total += entry.size;
    }
    return total;
  }

  calculateSize(data) {
    return new Blob([JSON.stringify(data)]).size;
  }

  compress(data) {
    if (typeof data !== 'string') {
      data = JSON.stringify(data);
    }
    
    // Compression LZ simple pour les navigateurs
    return this.lzCompress(data);
  }

  decompress(compressedData) {
    const decompressed = this.lzDecompress(compressedData);
    try {
      return JSON.parse(decompressed);
    } catch {
      return decompressed;
    }
  }

  // Compression LZ basique
  lzCompress(str) {
    const dict = {};
    const data = str.split('');
    let out = [];
    let code = 256;
    let phrase = data[0];
    
    for (let i = 1; i < data.length; i++) {
      const curr = data[i];
      const combined = phrase + curr;
      
      if (dict[combined] != null) {
        phrase = combined;
      } else {
        out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
        dict[combined] = code++;
        phrase = curr;
      }
    }
    
    out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
    return out;
  }

  lzDecompress(data) {
    const dict = {};
    let code = 256;
    let entry = String.fromCharCode(data[0]);
    let result = entry;
    
    for (let i = 1; i < data.length; i++) {
      const curr = data[i];
      let phrase;
      
      if (dict[curr]) {
        phrase = dict[curr];
      } else if (curr === code) {
        phrase = entry + entry[0];
      } else {
        phrase = String.fromCharCode(curr);
      }
      
      result += phrase;
      dict[code++] = entry + phrase[0];
      entry = phrase;
    }
    
    return result;
  }

  // Statistiques et debugging
  getStats() {
    return {
      memory: {
        size: this.getMemoryCacheSize(),
        entries: this.memoryCache.size,
        maxSize: this.maxMemorySize,
        usage: (this.getMemoryCacheSize() / this.maxMemorySize * 100).toFixed(2) + '%'
      },
      hitRate: this.calculateHitRate(),
      compressionEnabled: this.compressionEnabled
    };
  }

  calculateHitRate() {
    let totalHits = 0;
    let totalEntries = 0;
    
    for (const entry of this.memoryCache.values()) {
      totalHits += entry.hits;
      totalEntries++;
    }
    
    return totalEntries > 0 ? (totalHits / totalEntries).toFixed(2) : 0;
  }

  clear() {
    this.memoryCache.clear();
    
    if (this.indexedDBCache) {
      const transaction = this.indexedDBCache.transaction(['apiCache'], 'readwrite');
      const store = transaction.objectStore('apiCache');
      store.clear();
    }
  }
}

// Instance singleton
const cache = new AdvancedCache();

export default cache;