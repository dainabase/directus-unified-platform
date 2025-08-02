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
            memoryThreshold: options.memoryThreshold || 0.8, // 80% usage
            debug: options.debug || false
        };
        
        this.memoryCheckInterval = null;
        this.cleanupTimer = null;
        
        this.init();
    }
    
    init() {
        if (this.options.autoCleanup) {
            // Vérification périodique de la mémoire
            this.memoryCheckInterval = setInterval(() => {
                this.checkMemoryUsage();
            }, 30000); // Toutes les 30 secondes
            
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
        const ratio = used / total;
        
        if (this.options.debug) {
            console.log(`💾 Mémoire: ${(ratio * 100).toFixed(1)}% utilisée (${(used / 1048576).toFixed(1)}MB / ${(total / 1048576).toFixed(1)}MB)`);
        }
        
        // Nettoyage d'urgence si seuil dépassé
        if (ratio > this.options.memoryThreshold) {
            console.warn('⚠️ Seuil mémoire dépassé, nettoyage d\'urgence...');
            this.cleanupAll();
            
            // Forcer garbage collection si disponible
            if (window.gc) {
                window.gc();
                console.log('🧹 Garbage collection forcée');
            }
        }
        
        return {
            used: used,
            total: total,
            ratio: ratio,
            usedMB: used / 1048576,
            totalMB: total / 1048576
        };
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