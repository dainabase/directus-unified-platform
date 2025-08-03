/**
 * OCR Notion Sender
 * Module d'envoi sécurisé vers les bases de données Notion
 * Avec validation et confirmation
 */

class OCRNotionSender {
    constructor(options = {}) {
        this.options = {
            apiEndpoint: options.apiEndpoint || '/api/ocr/notion/save',
            validateBeforeSend: options.validateBeforeSend !== false,
            showConfirmation: options.showConfirmation !== false,
            retryAttempts: options.retryAttempts || 3,
            debug: options.debug || false
        };
        
        // Configuration Notion
        this.notionConfig = {
            apiKey: localStorage.getItem('notion_api_key') || null,
            workspace: localStorage.getItem('notion_workspace') || null
        };
        
        // État
        this.sendingQueue = new Map();
        this.sentDocuments = new Set();
    }
    
    /**
     * Envoyer un document vers Notion
     */
    async sendToNotion(documentType, data, options = {}) {
        const jobId = this.generateJobId();
        
        try {
            console.log(`📤 Envoi vers Notion: ${documentType}`, data);
            
            // Validation
            if (this.options.validateBeforeSend) {
                const validation = await this.validateData(documentType, data);
                if (!validation.valid) {
                    throw new Error(`Validation échouée: ${validation.errors.join(', ')}`);
                }
            }
            
            // Confirmation utilisateur
            if (this.options.showConfirmation && !options.skipConfirmation) {
                const confirmed = await this.showConfirmationDialog(documentType, data);
                if (!confirmed) {
                    return { success: false, cancelled: true };
                }
            }
            
            // Préparer les données
            const payload = this.preparePayload(documentType, data);
            
            // Ajouter à la queue
            this.sendingQueue.set(jobId, {
                documentType,
                data: payload,
                status: 'pending',
                attempts: 0
            });
            
            // Envoyer
            const result = await this.performSend(jobId, payload);
            
            if (result.success) {
                this.sentDocuments.add(jobId);
                this.showSuccessNotification(result);
            }
            
            return result;
            
        } catch (error) {
            console.error('❌ Erreur envoi Notion:', error);
            
            return {
                success: false,
                jobId,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        } finally {
            this.sendingQueue.delete(jobId);
        }
    }
    
    /**
     * Valider les données avant envoi
     */
    async validateData(documentType, data) {
        const errors = [];
        const warnings = [];
        
        // Récupérer le schéma
        const schema = window.DOCUMENT_TYPES?.[documentType];
        if (!schema) {
            errors.push(`Type de document non reconnu: ${documentType}`);
            return { valid: false, errors, warnings };
        }
        
        // Vérifier les champs requis
        for (const [fieldName, config] of Object.entries(schema.fields)) {
            if (config.required && !data[fieldName]) {
                errors.push(`Champ requis manquant: ${fieldName}`);
            }
        }
        
        // Validations spécifiques par type
        switch (documentType) {
            case 'FACTURE_CLIENT':
            case 'FACTURE_FOURNISSEUR':
                // Vérifier la cohérence des montants
                if (data['Montant HT'] && data['TVA'] && data['Montant TTC']) {
                    const calculated = parseFloat(data['Montant HT']) + parseFloat(data['TVA']);
                    const ttc = parseFloat(data['Montant TTC']);
                    
                    if (Math.abs(calculated - ttc) > 0.02) {
                        warnings.push(`Incohérence montants: ${calculated.toFixed(2)} ≠ ${ttc.toFixed(2)}`);
                    }
                }
                
                // Vérifier le format du numéro
                if (data['Numéro'] && !/^[A-Z]{2,3}-\d{4,6}$/.test(data['Numéro'])) {
                    warnings.push('Format numéro non standard');
                }
                break;
                
            case 'NOTE_FRAIS':
                // Vérifier le montant max
                const montant = parseFloat(data['Montant']);
                if (montant > 1000) {
                    warnings.push('Montant élevé pour une note de frais');
                }
                break;
        }
        
        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }
    
    /**
     * Afficher la boîte de confirmation
     */
    async showConfirmationDialog(documentType, data) {
        return new Promise((resolve) => {
            // Créer le modal
            const modal = this.createConfirmationModal(documentType, data);
            document.body.appendChild(modal);
            
            // Gérer les actions
            const confirmBtn = modal.querySelector('#btnConfirmSend');
            const cancelBtn = modal.querySelector('#btnCancelSend');
            
            confirmBtn.addEventListener('click', () => {
                modal.remove();
                resolve(true);
            });
            
            cancelBtn.addEventListener('click', () => {
                modal.remove();
                resolve(false);
            });
            
            // Afficher le modal
            const bsModal = new bootstrap.Modal(modal);
            bsModal.show();
        });
    }
    
    /**
     * Créer le modal de confirmation
     */
    createConfirmationModal(documentType, data) {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'notionConfirmModal';
        modal.setAttribute('tabindex', '-1');
        
        const schema = window.DOCUMENT_TYPES?.[documentType];
        const dbName = schema?.notionDB || 'Base inconnue';
        
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="ti ti-database-import me-2"></i>
                            Confirmer l'envoi vers Notion
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="alert alert-info">
                            <div class="d-flex">
                                <div>
                                    <h4 class="alert-title">Type de document: ${this.getDisplayName(documentType)}</h4>
                                    <div class="text-muted">
                                        Base de données: <code>${dbName}</code>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <h6 class="mb-3">Données à envoyer:</h6>
                        <div class="table-responsive">
                            <table class="table table-sm">
                                <tbody>
                                    ${this.generateDataPreview(data)}
                                </tbody>
                            </table>
                        </div>
                        
                        ${this.generateWarnings(documentType, data)}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" id="btnCancelSend">
                            <i class="ti ti-x me-2"></i>Annuler
                        </button>
                        <button type="button" class="btn btn-success" id="btnConfirmSend">
                            <i class="ti ti-send me-2"></i>Envoyer vers Notion
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        return modal;
    }
    
    /**
     * Générer l'aperçu des données
     */
    generateDataPreview(data) {
        let html = '';
        const skipFields = ['_metadata'];
        
        for (const [key, value] of Object.entries(data)) {
            if (skipFields.includes(key)) continue;
            
            const displayValue = this.formatDisplayValue(value);
            html += `
                <tr>
                    <td class="text-muted">${key}</td>
                    <td><strong>${displayValue}</strong></td>
                </tr>
            `;
        }
        
        return html;
    }
    
    /**
     * Générer les avertissements
     */
    generateWarnings(documentType, data) {
        const validation = this.validateDataSync(documentType, data);
        
        if (validation.warnings.length === 0) {
            return '';
        }
        
        let html = '<div class="alert alert-warning mt-3">';
        html += '<h6 class="alert-heading">Avertissements:</h6>';
        html += '<ul class="mb-0">';
        
        validation.warnings.forEach(warning => {
            html += `<li>${warning}</li>`;
        });
        
        html += '</ul></div>';
        
        return html;
    }
    
    /**
     * Préparer le payload pour l'API
     */
    preparePayload(documentType, data) {
        const schema = window.DOCUMENT_TYPES?.[documentType];
        
        return {
            documentType,
            databaseId: schema?.notionDB,
            properties: this.mapToNotionProperties(documentType, data),
            metadata: {
                source: 'ocr-vision-ai',
                extractedAt: data._metadata?.extractedAt || new Date().toISOString(),
                modifiedFields: data._metadata?.modifiedFields || [],
                userAgent: navigator.userAgent
            }
        };
    }
    
    /**
     * Mapper vers les propriétés Notion
     */
    mapToNotionProperties(documentType, data) {
        const properties = {};
        const schema = window.DOCUMENT_TYPES?.[documentType];
        
        if (!schema) return properties;
        
        for (const [fieldName, config] of Object.entries(schema.fields)) {
            const value = data[fieldName] || data[fieldName.replace(/\s+/g, '')];
            
            if (value !== undefined && value !== null && value !== '') {
                properties[fieldName] = this.formatNotionProperty(config.type, value);
            }
        }
        
        return properties;
    }
    
    /**
     * Formater une propriété pour Notion
     */
    formatNotionProperty(type, value) {
        switch (type) {
            case 'text':
                return {
                    type: 'title',
                    title: [{ text: { content: String(value) } }]
                };
                
            case 'number':
                return {
                    type: 'number',
                    number: parseFloat(value) || 0
                };
                
            case 'date':
                return {
                    type: 'date',
                    date: { start: value }
                };
                
            case 'select':
                return {
                    type: 'select',
                    select: { name: String(value) }
                };
                
            case 'checkbox':
                return {
                    type: 'checkbox',
                    checkbox: Boolean(value)
                };
                
            default:
                return {
                    type: 'rich_text',
                    rich_text: [{ text: { content: String(value) } }]
                };
        }
    }
    
    /**
     * Effectuer l'envoi avec retry
     */
    async performSend(jobId, payload) {
        const job = this.sendingQueue.get(jobId);
        let lastError = null;
        
        for (let attempt = 1; attempt <= this.options.retryAttempts; attempt++) {
            try {
                job.attempts = attempt;
                job.status = 'sending';
                
                console.log(`🚀 Tentative ${attempt}/${this.options.retryAttempts}...`);
                
                // Simuler l'envoi en mode démo
                if (!this.notionConfig.apiKey || this.isDemoMode()) {
                    return await this.simulateSend(payload);
                }
                
                // Envoi réel via API
                const response = await fetch(this.options.apiEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.notionConfig.apiKey}`
                    },
                    body: JSON.stringify(payload)
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const result = await response.json();
                
                return {
                    success: true,
                    jobId,
                    notionPageId: result.pageId,
                    notionUrl: result.url,
                    timestamp: new Date().toISOString()
                };
                
            } catch (error) {
                lastError = error;
                console.error(`❌ Tentative ${attempt} échouée:`, error);
                
                if (attempt < this.options.retryAttempts) {
                    // Attendre avant de réessayer
                    await this.delay(Math.pow(2, attempt) * 1000);
                }
            }
        }
        
        throw lastError || new Error('Envoi échoué après plusieurs tentatives');
    }
    
    /**
     * Simuler l'envoi (mode démo)
     */
    async simulateSend(payload) {
        console.log('🎭 Mode démo - Simulation envoi Notion:', payload);
        
        // Simuler un délai réseau
        await this.delay(1500 + Math.random() * 1000);
        
        // Simuler une réponse
        return {
            success: true,
            jobId: this.generateJobId(),
            notionPageId: `demo-${Date.now()}`,
            notionUrl: `https://notion.so/demo/${Date.now()}`,
            timestamp: new Date().toISOString(),
            demo: true
        };
    }
    
    /**
     * Afficher la notification de succès
     */
    showSuccessNotification(result) {
        // Créer la notification
        const notification = document.createElement('div');
        notification.className = 'position-fixed top-0 end-0 p-3';
        notification.style.zIndex = '9999';
        
        notification.innerHTML = `
            <div class="toast show" role="alert">
                <div class="toast-header bg-success text-white">
                    <i class="ti ti-check me-2"></i>
                    <strong class="me-auto">Envoi réussi!</strong>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
                </div>
                <div class="toast-body">
                    <p class="mb-2">Document envoyé vers Notion avec succès.</p>
                    ${result.notionUrl && !result.demo ? 
                        `<a href="${result.notionUrl}" target="_blank" class="btn btn-sm btn-primary">
                            <i class="ti ti-external-link me-1"></i>Voir dans Notion
                        </a>` : 
                        '<small class="text-muted">Mode démo - Pas d\'URL réelle</small>'
                    }
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-fermer après 5 secondes
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
    
    /**
     * Utilitaires
     */
    
    generateJobId() {
        return `notion-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    isDemoMode() {
        return !this.notionConfig.apiKey || 
               window.location.hostname === 'localhost' ||
               localStorage.getItem('notion_demo_mode') === 'true';
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    formatDisplayValue(value) {
        if (value === null || value === undefined) return '-';
        
        if (typeof value === 'number') {
            return value.toLocaleString('fr-CH');
        }
        
        if (typeof value === 'object') {
            return JSON.stringify(value);
        }
        
        return String(value);
    }
    
    getDisplayName(documentType) {
        const names = {
            'FACTURE_FOURNISSEUR': 'Facture Fournisseur',
            'FACTURE_CLIENT': 'Facture Client',
            'CONTRAT': 'Contrat',
            'NOTE_FRAIS': 'Note de Frais'
        };
        
        return names[documentType] || documentType;
    }
    
    validateDataSync(documentType, data) {
        // Version synchrone de validateData pour l'affichage
        const errors = [];
        const warnings = [];
        
        const schema = window.DOCUMENT_TYPES?.[documentType];
        if (!schema) {
            errors.push(`Type de document non reconnu: ${documentType}`);
            return { valid: false, errors, warnings };
        }
        
        // Validation basique synchrone
        for (const [fieldName, config] of Object.entries(schema.fields)) {
            if (config.required && !data[fieldName] && !data[fieldName.replace(/\s+/g, '')]) {
                errors.push(`Champ requis manquant: ${fieldName}`);
            }
        }
        
        return { valid: errors.length === 0, errors, warnings };
    }
    
    /**
     * Obtenir les statistiques d'envoi
     */
    getStats() {
        return {
            sentCount: this.sentDocuments.size,
            queueSize: this.sendingQueue.size,
            isDemoMode: this.isDemoMode()
        };
    }
}

// Export
window.OCRNotionSender = OCRNotionSender;