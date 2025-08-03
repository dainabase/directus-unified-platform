/**
 * OCR Memory Manager
 * Gestionnaire de mémoire pour éviter les fuites
 * Nettoyage automatique des ressources OCR
 */

class OCRMemoryManager {
    constructor(options = {}) {
        this.resources = {
            workers: new Set(),
            canvases: new Set(),
            images: new Set(),
            intervals: new Set(),
            timeouts: new Set(),
            eventListeners: new Map(),
            blobs: new Set(),
            objectURLs: new Set()
        };
        
        this.options = {
            autoCleanup: options.autoCleanup !== false,
            cleanupInterval: options.cleanupInterval || 60000, // 1 minute
            memoryThreshold: options.memoryThreshold || 150 * 1024 * 1024, // 150MB au lieu de %
            checkInterval: options.checkInterval || 15000, // 15s au lieu de 1s
            emergencyThreshold: options.emergencyThreshold || 200 * 1024 * 1024, // 200MB urgence
            cleanupDelay: options.cleanupDelay || 2000, // Délai avant cleanup
            debug: options.debug || false
        };
        
        this.memoryCheckInterval = null;
        this.cleanupTimer = null;
        this.debouncedCheck = null;
        
        this.init();
    }
    
    init() {
        // Créer la fonction debouncée
        this.debouncedCheck = this.debounce(this.checkMemoryUsage.bind(this), this.options.cleanupDelay);
        
        if (this.options.autoCleanup) {
            // Vérification périodique de la mémoire avec debounce
            this.memoryCheckInterval = setInterval(() => {
                this.debouncedCheck();
            }, this.options.checkInterval); // 15s par défaut
            
            // Nettoyage périodique
            this.cleanupTimer = setInterval(() => {
                this.cleanupOrphaned();
            }, this.options.cleanupInterval);
        }
        
        // Écouter les événements de fermeture
        window.addEventListener('beforeunload', () => this.destroy());
        
        if (this.options.debug) {
            console.log('🧹 OCR Memory Manager initialisé');
        }
    }
    
    /**
     * Fonction debounce pour éviter les appels trop fréquents
     */
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
    }
    
    /**
     * Nettoyage complet des ressources PDF.js
     */
    cleanupPDFResources(pdfDoc, canvas, context, imageData) {
        try {
            // Nettoyer le contexte
            if (context) {
                context.clearRect(0, 0, canvas ? canvas.width : 0, canvas ? canvas.height : 0);
                context = null;
            }
            
            // Nettoyer le canvas
            if (canvas) {
                // Réduire la taille pour libérer la mémoire
                canvas.width = 1;
                canvas.height = 1;
                
                // Retirer du DOM
                if (canvas.parentNode) {
                    canvas.remove();
                }
                canvas = null;
            }
            
            // Libérer imageData
            if (imageData) {
                imageData = null;
            }
            
            // Détruire le document PDF
            if (pdfDoc) {
                pdfDoc.destroy();
                pdfDoc = null;
            }
            
            // Force garbage collection hint
            if (window.gc) {
                window.gc();
            }
        } catch (error) {
            console.warn('Cleanup PDF warning:', error);
        }
    }
    
    /**
     * Enregistrer un worker Tesseract
     */
    registerWorker(worker) {
        if (!worker) return;
        
        this.resources.workers.add(worker);
        
        if (this.options.debug) {
            console.log(`👷 Worker enregistré. Total: ${this.resources.workers.size}`);
        }
        
        return worker;
    }
    
    /**
     * Libérer un worker
     */
    async releaseWorker(worker) {
        if (!worker || !this.resources.workers.has(worker)) return;
        
        try {
            await worker.terminate();
            this.resources.workers.delete(worker);
            
            if (this.options.debug) {
                console.log(`👷 Worker libéré. Restant: ${this.resources.workers.size}`);
            }
        } catch (error) {
            console.error('Erreur lors de la libération du worker:', error);
        }
    }
    
    /**
     * Enregistrer un canvas
     */
    registerCanvas(canvas) {
        if (!canvas) return;
        
        this.resources.canvases.add(canvas);
        
        // Ajouter un marqueur pour tracking
        canvas._ocrManagerId = Date.now();
        
        if (this.options.debug) {
            console.log(`🎨 Canvas enregistré. Total: ${this.resources.canvases.size}`);
        }
        
        return canvas;
    }
    
    /**
     * Libérer un canvas
     */
    releaseCanvas(canvas) {
        if (!canvas || !this.resources.canvases.has(canvas)) return;
        
        // Nettoyer le contexte
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        
        // Libérer la mémoire
        canvas.width = 0;
        canvas.height = 0;
        
        this.resources.canvases.delete(canvas);
        
        if (this.options.debug) {
            console.log(`🎨 Canvas libéré. Restant: ${this.resources.canvases.size}`);
        }
    }
    
    /**
     * Enregistrer une image
     */
    registerImage(img) {
        if (!img) return;
        
        this.resources.images.add(img);
        
        // Nettoyer quand l'image est chargée
        img.addEventListener('load', () => {
            // L'image peut être nettoyée après un délai
            setTimeout(() => {
                if (this.resources.images.has(img)) {
                    this.releaseImage(img);
                }
            }, 60000); // 1 minute
        });
        
        return img;
    }
    
    /**
     * Libérer une image
     */
    releaseImage(img) {
        if (!img || !this.resources.images.has(img)) return;
        
        // Révoquer l'URL si c'est un blob
        if (img.src && img.src.startsWith('blob:')) {
            URL.revokeObjectURL(img.src);
        }
        
        img.src = '';
        this.resources.images.delete(img);
    }
    
    /**
     * Enregistrer un interval
     */
    registerInterval(intervalId) {
        this.resources.intervals.add(intervalId);
        return intervalId;
    }
    
    /**
     * Libérer un interval
     */
    releaseInterval(intervalId) {
        if (!intervalId || !this.resources.intervals.has(intervalId)) return;
        
        clearInterval(intervalId);
        this.resources.intervals.delete(intervalId);
    }
    
    /**
     * Enregistrer un timeout
     */
    registerTimeout(timeoutId) {
        this.resources.timeouts.add(timeoutId);
        return timeoutId;
    }
    
    /**
     * Libérer un timeout
     */
    releaseTimeout(timeoutId) {
        if (!timeoutId || !this.resources.timeouts.has(timeoutId)) return;
        
        clearTimeout(timeoutId);
        this.resources.timeouts.delete(timeoutId);
    }
    
    /**
     * Enregistrer un event listener
     */
    registerEventListener(element, event, handler) {
        if (!element || !event || !handler) return;
        
        const key = `${element.tagName || 'window'}_${event}`;
        if (!this.resources.eventListeners.has(key)) {
            this.resources.eventListeners.set(key, []);
        }
        
        this.resources.eventListeners.get(key).push({
            element,
            event,
            handler
        });
        
        element.addEventListener(event, handler);
    }
    
    /**
     * Libérer les event listeners
     */
    releaseEventListeners(element = null) {
        for (const [key, listeners] of this.resources.eventListeners.entries()) {
            const filtered = listeners.filter(listener => {
                if (!element || listener.element === element) {
                    listener.element.removeEventListener(listener.event, listener.handler);
                    return false;
                }
                return true;
            });
            
            if (filtered.length === 0) {
                this.resources.eventListeners.delete(key);
            } else {
                this.resources.eventListeners.set(key, filtered);
            }
        }
    }
    
    /**
     * Enregistrer un Blob
     */
    registerBlob(blob) {
        if (!blob) return;
        
        this.resources.blobs.add(blob);
        
        // Auto-nettoyage après 5 minutes
        setTimeout(() => {
            this.releaseBlob(blob);
        }, 300000);
        
        return blob;
    }
    
    /**
     * Libérer un Blob
     */
    releaseBlob(blob) {
        if (!blob || !this.resources.blobs.has(blob)) return;
        
        this.resources.blobs.delete(blob);
        
        // Forcer garbage collection si possible
        if (window.gc) {
            window.gc();
        }
    }
    
    /**
     * Enregistrer une Object URL
     */
    registerObjectURL(url) {
        if (!url) return;
        
        this.resources.objectURLs.add(url);
        
        // Auto-nettoyage après 5 minutes
        setTimeout(() => {
            this.releaseObjectURL(url);
        }, 300000);
        
        return url;
    }
    
    /**
     * Libérer une Object URL
     */
    releaseObjectURL(url) {
        if (!url || !this.resources.objectURLs.has(url)) return;
        
        URL.revokeObjectURL(url);
        this.resources.objectURLs.delete(url);
    }
    
    /**
     * Vérifier l'utilisation mémoire
     */
    checkMemoryUsage() {
        if (!performance.memory) return;
        
        const used = performance.memory.usedJSHeapSize;
        const total = performance.memory.totalJSHeapSize;
        const usedMB = used / 1048576;
        const totalMB = total / 1048576;
        
        if (this.options.debug) {
            console.log(`💾 Mémoire: ${usedMB.toFixed(1)}MB utilisée / ${totalMB.toFixed(1)}MB total`);
        }
        
        // Nettoyage basé sur seuil en MB au lieu de %
        if (used > this.options.memoryThreshold) {
            console.warn(`⚠️ Seuil mémoire dépassé: ${usedMB.toFixed(1)}MB > ${(this.options.memoryThreshold / 1048576).toFixed(1)}MB`);
            this.cleanupAll();
            
            // Forcer garbage collection si disponible
            if (window.gc) {
                window.gc();
                console.log('🧹 Garbage collection forcée');
            }
            
            // Si toujours au-dessus après cleanup, forcer un nettoyage plus agressif
            setTimeout(() => {
                const afterUsed = performance.memory ? performance.memory.usedJSHeapSize : 0;
                if (afterUsed > this.options.memoryThreshold) {
                    console.warn('⚠️ Mémoire toujours élevée après cleanup, nettoyage agressif...');
                    this.aggressiveCleanup();
                }
            }, 1000);
        }
        
        // Nettoyage d'urgence
        if (used > this.options.emergencyThreshold) {
            console.error(`🚨 Seuil d'urgence atteint: ${usedMB.toFixed(1)}MB!`);
            this.emergencyCleanup();
        }
        
        return {
            used: used,
            total: total,
            ratio: used / total,
            usedMB: usedMB,
            totalMB: totalMB,
            thresholdMB: this.options.memoryThreshold / 1048576,
            emergencyMB: this.options.emergencyThreshold / 1048576
        };
    }
    
    /**
     * Nettoyage d'urgence plus agressif
     */
    async emergencyCleanup() {
        console.error('🚨 Nettoyage d\'urgence - Libération maximale...');
        
        // Libérer TOUT immédiatement
        await this.cleanupAll();
        
        // Appeler le nettoyage agressif
        await this.aggressiveCleanup();
        
        // Vider tous les caches du navigateur si possible
        if ('caches' in window) {
            try {
                const names = await caches.keys();
                for (const name of names) {
                    if (name.includes('ocr') || name.includes('pdf') || name.includes('cache')) {
                        await caches.delete(name);
                    }
                }
            } catch (error) {
                console.warn('Erreur nettoyage caches urgence:', error);
            }
        }
        
        // Forcer plusieurs GC si possible
        if (window.gc) {
            for (let i = 0; i < 5; i++) {
                setTimeout(() => window.gc(), i * 50);
            }
        }
    }
    
    /**
     * Nettoyage agressif pour libérer plus de mémoire
     */
    async aggressiveCleanup() {
        console.warn('🚨 Nettoyage agressif de la mémoire...');
        
        // Nettoyer tous les types de ressources
        for (const type of ['canvases', 'images', 'workers', 'blobs', 'objectURLs']) {
            this.cleanupByType(type);
        }
        
        // Nettoyer les caches du navigateur
        if ('caches' in window) {
            try {
                const cacheNames = await caches.keys();
                for (const name of cacheNames) {
                    if (name.includes('ocr') || name.includes('pdf')) {
                        await caches.delete(name);
                    }
                }
            } catch (error) {
                console.warn('Erreur nettoyage caches:', error);
            }
        }
        
        // Forcer plusieurs garbage collections
        if (window.gc) {
            for (let i = 0; i < 3; i++) {
                setTimeout(() => window.gc(), i * 100);
            }
        }
    }
    
    /**
     * Nettoyer les ressources orphelines
     */
    cleanupOrphaned() {
        let cleaned = 0;
        
        // Nettoyer les canvas orphelins
        this.resources.canvases.forEach(canvas => {
            if (!document.body.contains(canvas)) {
                this.releaseCanvas(canvas);
                cleaned++;
            }
        });
        
        // Nettoyer les images orphelines
        this.resources.images.forEach(img => {
            if (!document.body.contains(img)) {
                this.releaseImage(img);
                cleaned++;
            }
        });
        
        if (this.options.debug && cleaned > 0) {
            console.log(`🧹 Nettoyage: ${cleaned} ressources orphelines`);
        }
    }
    
    /**
     * Nettoyer toutes les ressources d'un type
     */
    cleanupByType(type) {
        switch (type) {
            case 'workers':
                this.resources.workers.forEach(worker => this.releaseWorker(worker));
                break;
            case 'canvases':
                this.resources.canvases.forEach(canvas => this.releaseCanvas(canvas));
                break;
            case 'images':
                this.resources.images.forEach(img => this.releaseImage(img));
                break;
            case 'intervals':
                this.resources.intervals.forEach(id => this.releaseInterval(id));
                break;
            case 'timeouts':
                this.resources.timeouts.forEach(id => this.releaseTimeout(id));
                break;
            case 'blobs':
                this.resources.blobs.forEach(blob => this.releaseBlob(blob));
                break;
            case 'objectURLs':
                this.resources.objectURLs.forEach(url => this.releaseObjectURL(url));
                break;
        }
    }
    
    /**
     * Nettoyer toutes les ressources
     */
    async cleanupAll() {
        console.log('🧹 Nettoyage complet des ressources OCR...');
        
        // Nettoyer dans l'ordre optimal
        this.releaseEventListeners();
        
        // Timers
        this.resources.intervals.forEach(id => clearInterval(id));
        this.resources.intervals.clear();
        
        this.resources.timeouts.forEach(id => clearTimeout(id));
        this.resources.timeouts.clear();
        
        // Images et canvas
        this.resources.images.forEach(img => this.releaseImage(img));
        this.resources.canvases.forEach(canvas => this.releaseCanvas(canvas));
        
        // URLs
        this.resources.objectURLs.forEach(url => URL.revokeObjectURL(url));
        this.resources.objectURLs.clear();
        
        // Blobs
        this.resources.blobs.clear();
        
        // Workers (async)
        const workerPromises = [];
        this.resources.workers.forEach(worker => {
            workerPromises.push(this.releaseWorker(worker));
        });
        await Promise.all(workerPromises);
        
        // Forcer garbage collection si possible
        if (window.gc) {
            window.gc();
        }
        
        console.log('✅ Nettoyage terminé');
    }
    
    /**
     * Obtenir les statistiques
     */
    getStats() {
        const stats = {
            workers: this.resources.workers.size,
            canvases: this.resources.canvases.size,
            images: this.resources.images.size,
            intervals: this.resources.intervals.size,
            timeouts: this.resources.timeouts.size,
            eventListeners: this.resources.eventListeners.size,
            blobs: this.resources.blobs.size,
            objectURLs: this.resources.objectURLs.size,
            total: 0
        };
        
        stats.total = Object.values(stats).reduce((sum, val) => sum + val, 0);
        
        if (performance.memory) {
            stats.memory = this.checkMemoryUsage();
        }
        
        return stats;
    }
    
    /**
     * Destruction complète
     */
    async destroy() {
        if (this.options.debug) {
            console.log('💥 Destruction du Memory Manager...');
        }
        
        // Arrêter les timers
        if (this.memoryCheckInterval) {
            clearInterval(this.memoryCheckInterval);
        }
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
        }
        
        // Nettoyer toutes les ressources
        await this.cleanupAll();
        
        console.log('✅ Memory Manager détruit');
    }
}

// Export pour utilisation
window.OCRMemoryManager = OCRMemoryManager;