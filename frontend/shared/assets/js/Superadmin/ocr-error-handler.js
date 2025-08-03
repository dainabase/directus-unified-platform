/**
 * OCR Error Handler
 * Gestion d'erreurs robuste pour le système OCR
 * Avec logging, récupération et messages utilisateur clairs
 */

class OCRErrorHandler {
    constructor(options = {}) {
        this.maxLogSize = options.maxLogSize || 100;
        this.enableRemoteLogging = options.enableRemoteLogging || false;
        this.remoteEndpoint = options.remoteEndpoint || '/api/log-error';
        this.debug = options.debug || false;
        
        // Types d'erreurs connus
        this.errorTypes = {
            TESSERACT_INIT: {
                code: 'OCR_001',
                message: 'Impossible d\'initialiser l\'OCR. Vérifiez votre connexion.',
                severity: 'critical',
                recovery: 'reload'
            },
            DOCUMENT_TOO_LARGE: {
                code: 'OCR_002',
                message: 'Document trop volumineux (max 10MB).',
                severity: 'warning',
                recovery: 'resize'
            },
            UNSUPPORTED_FORMAT: {
                code: 'OCR_003',
                message: 'Format de document non supporté.',
                severity: 'error',
                recovery: 'convert'
            },
            OPENAI_API_ERROR: {
                code: 'OCR_004',
                message: 'Erreur d\'analyse IA. Réessayez plus tard.',
                severity: 'error',
                recovery: 'retry'
            },
            NETWORK_ERROR: {
                code: 'OCR_005',
                message: 'Erreur réseau. Vérifiez votre connexion.',
                severity: 'error',
                recovery: 'check_network'
            },
            TIMEOUT_ERROR: {
                code: 'OCR_006',
                message: 'Traitement trop long. Le document est peut-être trop complexe.',
                severity: 'warning',
                recovery: 'simplify'
            },
            MEMORY_ERROR: {
                code: 'OCR_007',
                message: 'Mémoire insuffisante. Fermez d\'autres onglets.',
                severity: 'critical',
                recovery: 'free_memory'
            },
            NOTION_API_ERROR: {
                code: 'OCR_008',
                message: 'Erreur de connexion à Notion.',
                severity: 'error',
                recovery: 'retry'
            },
            VALIDATION_ERROR: {
                code: 'OCR_009',
                message: 'Données invalides détectées.',
                severity: 'warning',
                recovery: 'manual_fix'
            },
            WORKER_CRASH: {
                code: 'OCR_010',
                message: 'Le processus OCR a planté.',
                severity: 'critical',
                recovery: 'restart'
            }
        };
        
        // Stratégies de récupération
        this.recoveryStrategies = {
            reload: () => {
                setTimeout(() => location.reload(), 3000);
                return 'Rechargement de la page dans 3 secondes...';
            },
            retry: (context) => {
                if (context && context.retry) {
                    setTimeout(() => context.retry(), 2000);
                    return 'Nouvelle tentative dans 2 secondes...';
                }
                return 'Veuillez réessayer manuellement.';
            },
            resize: () => {
                return 'Veuillez réduire la taille du document (compression PDF, réduction image).';
            },
            convert: () => {
                return 'Formats supportés : PDF, JPG, PNG, TIFF. Veuillez convertir votre document.';
            },
            check_network: () => {
                this.checkNetworkStatus();
                return 'Vérification de la connexion réseau...';
            },
            simplify: () => {
                return 'Essayez avec un document plus simple ou divisez-le en plusieurs parties.';
            },
            free_memory: () => {
                this.suggestMemoryCleanup();
                return 'Libération de mémoire recommandée.';
            },
            restart: () => {
                return 'Redémarrage du processus OCR...';
            },
            manual_fix: () => {
                return 'Veuillez vérifier et corriger les données manuellement.';
            }
        };
        
        this.initializeErrorHandling();
    }
    
    /**
     * Initialiser la capture globale d'erreurs
     */
    initializeErrorHandling() {
        // Capturer les erreurs non gérées
        window.addEventListener('error', (event) => {
            if (this.isOCRRelated(event)) {
                event.preventDefault();
                this.handle(event.error, 'global_error_handler');
            }
        });
        
        // Capturer les promesses rejetées
        window.addEventListener('unhandledrejection', (event) => {
            if (this.isOCRRelated(event)) {
                event.preventDefault();
                this.handle(event.reason, 'unhandled_promise');
            }
        });
        
        if (this.debug) {
            console.log('🛡️ OCR Error Handler initialisé');
        }
    }
    
    /**
     * Vérifier si l'erreur est liée à l'OCR
     */
    isOCRRelated(event) {
        const error = event.error || event.reason;
        const filename = event.filename || '';
        
        return filename.includes('ocr') || 
               filename.includes('tesseract') ||
               (error && error.message && (
                   error.message.toLowerCase().includes('ocr') ||
                   error.message.toLowerCase().includes('tesseract') ||
                   error.message.toLowerCase().includes('worker')
               ));
    }
    
    /**
     * Gérer une erreur
     */
    handle(error, context = '') {
        console.error(`🚨 OCR Error in ${context}:`, error);
        
        // Identifier le type d'erreur
        const errorType = this.identifyErrorType(error);
        const errorInfo = this.errorTypes[errorType] || {
            code: 'OCR_999',
            message: 'Une erreur inattendue s\'est produite.',
            severity: 'error',
            recovery: 'retry'
        };
        
        // Logger l'erreur
        const logEntry = this.logError(error, context, errorInfo);
        
        // Tenter la récupération
        let recoveryMessage = '';
        if (errorInfo.recovery && this.recoveryStrategies[errorInfo.recovery]) {
            recoveryMessage = this.recoveryStrategies[errorInfo.recovery]({ error, context });
        }
        
        // Retourner les informations pour l'UI
        return {
            code: errorInfo.code,
            message: errorInfo.message,
            severity: errorInfo.severity,
            recovery: recoveryMessage,
            technical: this.debug ? error.stack : null,
            logId: logEntry.id
        };
    }
    
    /**
     * Identifier le type d'erreur
     */
    identifyErrorType(error) {
        const message = error.message || error.toString();
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('worker') || lowerMessage.includes('tesseract')) {
            return error.name === 'NetworkError' ? 'TESSERACT_INIT' : 'WORKER_CRASH';
        }
        
        if (lowerMessage.includes('size') || lowerMessage.includes('too large')) {
            return 'DOCUMENT_TOO_LARGE';
        }
        
        if (lowerMessage.includes('format') || lowerMessage.includes('unsupported')) {
            return 'UNSUPPORTED_FORMAT';
        }
        
        if (lowerMessage.includes('openai') || lowerMessage.includes('gpt')) {
            return 'OPENAI_API_ERROR';
        }
        
        if (lowerMessage.includes('network') || error.name === 'NetworkError') {
            return 'NETWORK_ERROR';
        }
        
        if (lowerMessage.includes('timeout')) {
            return 'TIMEOUT_ERROR';
        }
        
        if (lowerMessage.includes('memory') || lowerMessage.includes('heap')) {
            return 'MEMORY_ERROR';
        }
        
        if (lowerMessage.includes('notion')) {
            return 'NOTION_API_ERROR';
        }
        
        if (lowerMessage.includes('validation') || lowerMessage.includes('invalid')) {
            return 'VALIDATION_ERROR';
        }
        
        return 'UNKNOWN';
    }
    
    /**
     * Logger l'erreur
     */
    logError(error, context, errorInfo) {
        const logEntry = {
            id: this.generateLogId(),
            timestamp: new Date().toISOString(),
            context: context,
            errorInfo: errorInfo,
            error: {
                message: error.message,
                stack: error.stack,
                name: error.name,
                code: error.code
            },
            browser: {
                userAgent: navigator.userAgent,
                language: navigator.language,
                platform: navigator.platform,
                memory: performance.memory ? {
                    used: Math.round(performance.memory.usedJSHeapSize / 1048576) + 'MB',
                    total: Math.round(performance.memory.totalJSHeapSize / 1048576) + 'MB'
                } : null
            },
            url: window.location.href,
            sessionId: this.getSessionId()
        };
        
        // Stocker localement
        this.storeLocalLog(logEntry);
        
        // Envoyer au serveur si activé
        if (this.enableRemoteLogging) {
            this.sendRemoteLog(logEntry);
        }
        
        return logEntry;
    }
    
    /**
     * Stocker le log localement
     */
    storeLocalLog(logEntry) {
        try {
            const logs = JSON.parse(localStorage.getItem('ocr_error_logs') || '[]');
            logs.push(logEntry);
            
            // Limiter la taille
            if (logs.length > this.maxLogSize) {
                logs.shift();
            }
            
            localStorage.setItem('ocr_error_logs', JSON.stringify(logs));
        } catch (e) {
            console.warn('Impossible de stocker le log:', e);
        }
    }
    
    /**
     * Envoyer le log au serveur
     */
    async sendRemoteLog(logEntry) {
        try {
            await fetch(this.remoteEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(logEntry)
            });
        } catch (e) {
            // Silent fail - ne pas créer d'erreur supplémentaire
            if (this.debug) {
                console.warn('Envoi log distant échoué:', e);
            }
        }
    }
    
    /**
     * Vérifier le statut réseau
     */
    async checkNetworkStatus() {
        const endpoints = [
            '/api/health',
            'https://api.notion.com/v1/users/me',
            'https://www.google.com/favicon.ico'
        ];
        
        const results = await Promise.allSettled(
            endpoints.map(url => 
                fetch(url, { method: 'HEAD', mode: 'no-cors' })
                    .then(() => ({ url, status: 'online' }))
                    .catch(() => ({ url, status: 'offline' }))
            )
        );
        
        if (this.debug) {
            console.log('🌐 Network status:', results);
        }
        
        return results;
    }
    
    /**
     * Suggérer nettoyage mémoire
     */
    suggestMemoryCleanup() {
        if (performance.memory) {
            const used = performance.memory.usedJSHeapSize;
            const total = performance.memory.totalJSHeapSize;
            const percent = (used / total * 100).toFixed(1);
            
            console.warn(`💾 Mémoire utilisée: ${percent}%`);
            
            if (percent > 80) {
                // Forcer garbage collection si disponible
                if (window.gc) {
                    window.gc();
                    console.log('🧹 Garbage collection forcée');
                }
                
                // Nettoyer les caches
                if (window.ocrCache) {
                    window.ocrCache.clear();
                }
                
                // Suggérer fermeture d'onglets
                return true;
            }
        }
        return false;
    }
    
    /**
     * Générer un ID de log unique
     */
    generateLogId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    /**
     * Obtenir l'ID de session
     */
    getSessionId() {
        let sessionId = sessionStorage.getItem('ocr_session_id');
        if (!sessionId) {
            sessionId = this.generateLogId();
            sessionStorage.setItem('ocr_session_id', sessionId);
        }
        return sessionId;
    }
    
    /**
     * Obtenir les logs d'erreur
     */
    getLogs(filter = {}) {
        try {
            const logs = JSON.parse(localStorage.getItem('ocr_error_logs') || '[]');
            
            // Appliquer filtres
            return logs.filter(log => {
                if (filter.severity && log.errorInfo.severity !== filter.severity) return false;
                if (filter.code && log.errorInfo.code !== filter.code) return false;
                if (filter.context && !log.context.includes(filter.context)) return false;
                if (filter.since && new Date(log.timestamp) < new Date(filter.since)) return false;
                return true;
            });
        } catch (e) {
            return [];
        }
    }
    
    /**
     * Nettoyer les logs
     */
    clearLogs() {
        localStorage.removeItem('ocr_error_logs');
        if (this.debug) {
            console.log('🗑️ Logs d\'erreur nettoyés');
        }
    }
    
    /**
     * Exporter les logs
     */
    exportLogs() {
        const logs = this.getLogs();
        const data = JSON.stringify(logs, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `ocr-error-logs-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
    }
}

// Export pour utilisation
window.OCRErrorHandler = OCRErrorHandler;