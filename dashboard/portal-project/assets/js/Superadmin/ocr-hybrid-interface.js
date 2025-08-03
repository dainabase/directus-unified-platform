/**
 * OCR Hybrid Interface - Interface utilisateur avec validation
 * @version 1.0.0
 */

class OCRHybridInterface {
    constructor() {
        this.processor = null;
        this.currentResult = null;
        this.dropzone = null;
        this.fileInput = null;
        this.isProcessing = false;
        
        console.log('🎨 OCR Hybrid Interface initialisée');
    }

    /**
     * Initialisation de l'interface
     */
    async init() {
        try {
            console.log('🚀 Initialisation interface OCR Hybrid...');
            
            // 1. Créer le processeur
            this.processor = new OCRHybridProcessor();
            
            // 2. Vérifier/demander la clé OpenAI
            await this.checkOpenAIKey();
            
            // 3. Initialiser le processeur
            await this.processor.init();
            
            // 4. Configurer l'interface
            this.setupInterface();
            
            // 5. Écouter les événements de progression
            this.listenProgressEvents();
            
            console.log('✅ Interface OCR Hybrid prête');
            
        } catch (error) {
            console.error('❌ Erreur initialisation interface:', error);
            this.showError('Erreur initialisation: ' + error.message);
        }
    }

    /**
     * Vérification/Configuration clé OpenAI
     */
    async checkOpenAIKey() {
        let apiKey = localStorage.getItem('openai_api_key');
        
        if (!apiKey) {
            // Créer modal pour demander la clé
            const modal = this.createAPIKeyModal();
            document.body.appendChild(modal);
            
            // Attendre la saisie
            apiKey = await new Promise((resolve) => {
                const submitBtn = modal.querySelector('#submit-api-key');
                const input = modal.querySelector('#api-key-input');
                
                submitBtn.addEventListener('click', () => {
                    const key = input.value.trim();
                    if (key) {
                        localStorage.setItem('openai_api_key', key);
                        modal.remove();
                        resolve(key);
                    }
                });
                
                // Option skip pour mode dégradé
                const skipBtn = modal.querySelector('#skip-api-key');
                skipBtn.addEventListener('click', () => {
                    modal.remove();
                    resolve(null);
                });
            });
        }
        
        return apiKey;
    }

    /**
     * Création modal clé API
     */
    createAPIKeyModal() {
        const modal = document.createElement('div');
        modal.innerHTML = `
            <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 9999; display: flex; align-items: center; justify-content: center;">
                <div style="background: white; padding: 30px; border-radius: 8px; max-width: 500px; width: 90%;">
                    <h3 style="margin-top: 0;">Configuration OpenAI</h3>
                    <p>Pour utiliser l'extraction intelligente, veuillez entrer votre clé API OpenAI :</p>
                    <input type="password" id="api-key-input" placeholder="sk-..." style="width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #ddd; border-radius: 4px;">
                    <p style="font-size: 0.9em; color: #666;">
                        Votre clé sera stockée localement et jamais envoyée à nos serveurs.<br>
                        <a href="https://platform.openai.com/api-keys" target="_blank">Obtenir une clé API</a>
                    </p>
                    <div style="display: flex; gap: 10px; justify-content: flex-end;">
                        <button id="skip-api-key" style="padding: 10px 20px; border: 1px solid #ddd; background: white; border-radius: 4px; cursor: pointer;">
                            Utiliser mode basique
                        </button>
                        <button id="submit-api-key" style="padding: 10px 20px; border: none; background: #0066cc; color: white; border-radius: 4px; cursor: pointer;">
                            Valider
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        return modal;
    }

    /**
     * Configuration de l'interface
     */
    setupInterface() {
        // Éléments DOM
        this.dropzone = document.getElementById('dropzone');
        this.fileInput = document.getElementById('file-input');
        
        if (!this.dropzone) {
            console.error('❌ Dropzone non trouvée');
            return;
        }
        
        // Créer container de résultats si nécessaire
        let resultsContainer = document.getElementById('ocr-hybrid-results');
        if (!resultsContainer) {
            resultsContainer = document.createElement('div');
            resultsContainer.id = 'ocr-hybrid-results';
            resultsContainer.style.marginTop = '20px';
            
            const ocrContainer = document.getElementById('ocr-results-container');
            if (ocrContainer) {
                ocrContainer.appendChild(resultsContainer);
            } else {
                this.dropzone.parentNode.appendChild(resultsContainer);
            }
        }
        
        // Events dropzone
        this.dropzone.addEventListener('click', () => {
            if (!this.isProcessing && this.fileInput) {
                this.fileInput.click();
            }
        });
        
        this.dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.dropzone.classList.add('dragover');
        });
        
        this.dropzone.addEventListener('dragleave', () => {
            this.dropzone.classList.remove('dragover');
        });
        
        this.dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            this.dropzone.classList.remove('dragover');
            
            const files = Array.from(e.dataTransfer.files);
            if (files.length > 0) {
                this.handleFile(files[0]);
            }
        });
        
        // Event file input
        if (this.fileInput) {
            this.fileInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    this.handleFile(e.target.files[0]);
                }
            });
        }
        
        // Ajouter styles
        this.injectStyles();
    }

    /**
     * Injection des styles CSS
     */
    injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .ocr-progress-bar {
                height: 4px;
                background: #e9ecef;
                border-radius: 2px;
                overflow: hidden;
                margin: 20px 0;
            }
            
            .ocr-progress-fill {
                height: 100%;
                background: #0066cc;
                transition: width 0.3s ease;
            }
            
            .ocr-validation-field {
                margin-bottom: 15px;
            }
            
            .ocr-validation-field label {
                display: block;
                font-weight: 600;
                margin-bottom: 5px;
                color: #333;
            }
            
            .ocr-validation-field input,
            .ocr-validation-field select {
                width: 100%;
                padding: 8px 12px;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 14px;
            }
            
            .ocr-validation-field.has-error input {
                border-color: #dc3545;
            }
            
            .ocr-validation-error {
                color: #dc3545;
                font-size: 12px;
                margin-top: 5px;
            }
            
            .ocr-validation-suggestion {
                color: #0066cc;
                font-size: 12px;
                margin-top: 5px;
                cursor: pointer;
            }
            
            .ocr-confidence-badge {
                display: inline-block;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: 600;
            }
            
            .ocr-confidence-high {
                background: #d4edda;
                color: #155724;
            }
            
            .ocr-confidence-medium {
                background: #fff3cd;
                color: #856404;
            }
            
            .ocr-confidence-low {
                background: #f8d7da;
                color: #721c24;
            }
            
            .dropzone.dragover {
                border-color: #0066cc;
                background: #f0f8ff;
            }
        `;
        
        document.head.appendChild(style);
    }

    /**
     * Écouter les événements de progression
     */
    listenProgressEvents() {
        window.addEventListener('ocr-progress', (e) => {
            this.updateProgressUI(e.detail.stage, e.detail.percentage);
        });
    }

    /**
     * Traitement d'un fichier
     */
    async handleFile(file) {
        if (this.isProcessing) {
            this.showError('Un traitement est déjà en cours');
            return;
        }
        
        // Validation du fichier
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
            this.showError('Type de fichier non supporté');
            return;
        }
        
        const maxSize = 50 * 1024 * 1024; // 50MB
        if (file.size > maxSize) {
            this.showError('Fichier trop volumineux (max 50MB)');
            return;
        }
        
        this.isProcessing = true;
        
        try {
            console.log(`📄 Traitement: ${file.name}`);
            
            // Afficher l'interface de progression
            this.showProgressUI();
            
            // Traiter le document
            const result = await this.processor.processDocument(file);
            
            // Sauvegarder le résultat
            this.currentResult = result;
            
            // Afficher les résultats pour validation
            this.showValidationUI(result);
            
        } catch (error) {
            console.error('❌ Erreur traitement:', error);
            this.showError(`Erreur: ${error.message}`);
        } finally {
            this.isProcessing = false;
            this.hideProgressUI();
        }
    }

    /**
     * Affichage de l'interface de progression
     */
    showProgressUI() {
        const container = document.getElementById('ocr-hybrid-results');
        if (!container) return;
        
        container.innerHTML = `
            <div class="card">
                <div class="card-body">
                    <h4>Traitement en cours...</h4>
                    <div class="ocr-progress-bar">
                        <div class="ocr-progress-fill" id="ocr-progress-fill" style="width: 0%"></div>
                    </div>
                    <p id="ocr-progress-stage" style="text-align: center; color: #666;">Initialisation...</p>
                </div>
            </div>
        `;
    }

    /**
     * Mise à jour de la progression
     */
    updateProgressUI(stage, percentage) {
        const fill = document.getElementById('ocr-progress-fill');
        const stageText = document.getElementById('ocr-progress-stage');
        
        if (fill) fill.style.width = percentage + '%';
        
        if (stageText) {
            const stages = {
                'converting': '📄 Conversion PDF...',
                'extracting': '👁️ Extraction OCR...',
                'processing': '🧠 Analyse Intelligence...',
                'validating': '✅ Validation...',
                'preparing': '📊 Préparation données...'
            };
            
            stageText.textContent = stages[stage] || stage;
        }
    }

    /**
     * Masquer l'interface de progression
     */
    hideProgressUI() {
        setTimeout(() => {
            const progressCard = document.querySelector('#ocr-hybrid-results .card');
            if (progressCard && progressCard.textContent.includes('Traitement en cours')) {
                progressCard.style.display = 'none';
            }
        }, 1000);
    }

    /**
     * Affichage de l'interface de validation
     */
    showValidationUI(result) {
        const container = document.getElementById('ocr-hybrid-results');
        if (!container) return;
        
        const data = result.validatedData || result.structuredData;
        const confidence = data.confidence || 0;
        const confidenceClass = confidence >= 0.9 ? 'high' : confidence >= 0.7 ? 'medium' : 'low';
        const confidenceText = confidence >= 0.9 ? 'Élevée' : confidence >= 0.7 ? 'Moyenne' : 'Faible';
        
        let html = `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">
                        Validation des données extraites
                        <span class="ocr-confidence-badge ocr-confidence-${confidenceClass}" style="margin-left: 10px;">
                            Confiance: ${Math.round(confidence * 100)}% (${confidenceText})
                        </span>
                    </h3>
                </div>
                <div class="card-body">
        `;
        
        // Type de document et entité
        html += `
            <div class="row">
                <div class="col-md-6">
                    <div class="ocr-validation-field">
                        <label>Type de document</label>
                        <select id="val-document-type" class="form-control">
                            <option value="facture_client" ${data.document_type === 'facture_client' ? 'selected' : ''}>Facture Client (émise)</option>
                            <option value="facture_fournisseur" ${data.document_type === 'facture_fournisseur' ? 'selected' : ''}>Facture Fournisseur (reçue)</option>
                            <option value="note_frais" ${data.document_type === 'note_frais' ? 'selected' : ''}>Note de frais</option>
                        </select>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="ocr-validation-field">
                        <label>Entité du groupe</label>
                        <select id="val-entity" class="form-control">
                            ${Object.entries(ENTITIES_CONFIG || {}).map(([key, config]) => 
                                `<option value="${key}" ${data.entity === key ? 'selected' : ''}>${config.name}</option>`
                            ).join('')}
                        </select>
                    </div>
                </div>
            </div>
        `;
        
        // Données extraites selon le type
        if (data.extracted_data) {
            const extracted = data.extracted_data;
            
            html += '<div class="row">';
            
            // Colonne gauche
            html += '<div class="col-md-6">';
            
            // Numéro document
            html += this.createValidationField('numero_document', 'Numéro document', extracted.numero_document);
            
            // Entreprises
            if (data.document_type === 'facture_client') {
                html += this.createValidationField('client_nom', 'Client', 
                    extracted.entreprise_destinataire?.nom || '');
            } else {
                html += this.createValidationField('fournisseur_nom', 'Fournisseur', 
                    extracted.entreprise_emettrice?.nom || '');
            }
            
            // Dates
            html += this.createValidationField('date_emission', 'Date émission', 
                extracted.date_emission || '', 'date');
            html += this.createValidationField('date_echeance', 'Date échéance', 
                extracted.date_echeance || '', 'date');
            
            html += '</div>'; // Fin colonne gauche
            
            // Colonne droite
            html += '<div class="col-md-6">';
            
            // Montants
            html += this.createValidationField('montant_ht', 'Montant HT', 
                extracted.montant_ht || 0, 'number', 0.01);
            html += this.createValidationField('taux_tva', 'Taux TVA (%)', 
                extracted.taux_tva || 8.1, 'number', 0.1);
            html += this.createValidationField('montant_tva', 'Montant TVA', 
                extracted.montant_tva || 0, 'number', 0.01);
            html += this.createValidationField('montant_ttc', 'Montant TTC', 
                extracted.montant_ttc || 0, 'number', 0.01);
            
            // IBAN si présent
            if (extracted.iban) {
                html += this.createValidationField('iban', 'IBAN', extracted.iban);
            }
            
            html += '</div>'; // Fin colonne droite
            html += '</div>'; // Fin row
        }
        
        // Erreurs de validation
        if (data.validation_errors && data.validation_errors.length > 0) {
            html += `
                <div class="alert alert-warning mt-3">
                    <h5>⚠️ Erreurs de validation détectées :</h5>
                    <ul class="mb-0">
                        ${data.validation_errors.map(err => `
                            <li>${err.message} 
                                ${err.suggested_fix ? 
                                    `<a href="#" class="ocr-apply-fix" data-field="${err.field}" data-value="${err.suggested_fix}">
                                        → Appliquer correction (${err.suggested_fix})
                                    </a>` : ''
                                }
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `;
        }
        
        // Aperçu du texte OCR
        html += `
            <details class="mt-3">
                <summary style="cursor: pointer;">📄 Texte OCR brut</summary>
                <pre style="background: #f8f9fa; padding: 10px; border-radius: 4px; max-height: 200px; overflow-y: auto; margin-top: 10px;">
${result.rawText ? result.rawText.substring(0, 1000) + '...' : 'Non disponible'}
                </pre>
            </details>
        `;
        
        // Boutons d'action
        html += `
                </div>
                <div class="card-footer">
                    <div class="d-flex justify-content-between">
                        <button class="btn btn-secondary" onclick="ocrHybridInterface.reset()">
                            <i class="ti ti-x"></i> Annuler
                        </button>
                        <div>
                            <button class="btn btn-warning" onclick="ocrHybridInterface.recalculateAmounts()">
                                <i class="ti ti-calculator"></i> Recalculer montants
                            </button>
                            <button class="btn btn-success ms-2" onclick="ocrHybridInterface.validateAndSave()">
                                <i class="ti ti-check"></i> Valider et enregistrer
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        container.innerHTML = html;
        
        // Ajouter les événements aux corrections suggérées
        document.querySelectorAll('.ocr-apply-fix').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const field = e.target.dataset.field;
                const value = e.target.dataset.value;
                const input = document.getElementById(`val-${field}`);
                if (input) {
                    input.value = value;
                    input.style.borderColor = '#28a745';
                    setTimeout(() => input.style.borderColor = '', 2000);
                }
            });
        });
    }

    /**
     * Création d'un champ de validation
     */
    createValidationField(id, label, value, type = 'text', step = null) {
        const fieldId = `val-${id}`;
        let input = '';
        
        if (type === 'number') {
            input = `<input type="number" id="${fieldId}" value="${value || 0}" step="${step || 0.01}" class="form-control">`;
        } else if (type === 'date') {
            // Convertir la date au format YYYY-MM-DD si nécessaire
            let dateValue = value;
            if (value && value.includes('/')) {
                const parts = value.split('/');
                if (parts.length === 3) {
                    dateValue = `20${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                }
            }
            input = `<input type="date" id="${fieldId}" value="${dateValue || ''}" class="form-control">`;
        } else {
            input = `<input type="text" id="${fieldId}" value="${value || ''}" class="form-control">`;
        }
        
        return `
            <div class="ocr-validation-field">
                <label for="${fieldId}">${label}</label>
                ${input}
            </div>
        `;
    }

    /**
     * Recalcul des montants
     */
    recalculateAmounts() {
        const montantHT = parseFloat(document.getElementById('val-montant_ht')?.value || 0);
        const tauxTVA = parseFloat(document.getElementById('val-taux_tva')?.value || 0);
        
        const montantTVA = Math.round((montantHT * tauxTVA / 100) * 100) / 100;
        const montantTTC = Math.round((montantHT + montantTVA) * 100) / 100;
        
        // Mettre à jour les champs
        const tvaInput = document.getElementById('val-montant_tva');
        const ttcInput = document.getElementById('val-montant_ttc');
        
        if (tvaInput) {
            tvaInput.value = montantTVA;
            tvaInput.style.borderColor = '#28a745';
        }
        
        if (ttcInput) {
            ttcInput.value = montantTTC;
            ttcInput.style.borderColor = '#28a745';
        }
        
        // Animation de confirmation
        setTimeout(() => {
            if (tvaInput) tvaInput.style.borderColor = '';
            if (ttcInput) ttcInput.style.borderColor = '';
        }, 2000);
        
        this.showSuccess('Montants recalculés');
    }

    /**
     * Validation et sauvegarde
     */
    async validateAndSave() {
        try {
            // Collecter les données validées
            const validatedData = this.collectValidatedData();
            
            // Vérifier les champs requis
            const errors = this.validateRequiredFields(validatedData);
            if (errors.length > 0) {
                this.showError('Veuillez corriger les erreurs:\n' + errors.join('\n'));
                return;
            }
            
            // Préparer pour Notion
            const notionData = await this.processor.prepareNotionData({
                ...this.currentResult.structuredData,
                extracted_data: validatedData
            });
            
            console.log('📊 Données prêtes pour Notion:', notionData);
            
            // TODO: Implémenter l'envoi vers Notion
            this.showSuccess('Document validé avec succès!\n(Intégration Notion à implémenter)');
            
            // Afficher un résumé
            this.showSummary(notionData);
            
        } catch (error) {
            console.error('❌ Erreur validation:', error);
            this.showError('Erreur lors de la validation: ' + error.message);
        }
    }

    /**
     * Collecte des données validées
     */
    collectValidatedData() {
        const data = {
            numero_document: document.getElementById('val-numero_document')?.value || '',
            date_emission: document.getElementById('val-date_emission')?.value || '',
            date_echeance: document.getElementById('val-date_echeance')?.value || '',
            montant_ht: parseFloat(document.getElementById('val-montant_ht')?.value || 0),
            taux_tva: parseFloat(document.getElementById('val-taux_tva')?.value || 0),
            montant_tva: parseFloat(document.getElementById('val-montant_tva')?.value || 0),
            montant_ttc: parseFloat(document.getElementById('val-montant_ttc')?.value || 0),
            iban: document.getElementById('val-iban')?.value || ''
        };
        
        // Ajouter les données spécifiques selon le type
        const docType = document.getElementById('val-document-type')?.value;
        if (docType === 'facture_client') {
            data.entreprise_destinataire = {
                nom: document.getElementById('val-client_nom')?.value || ''
            };
        } else {
            data.entreprise_emettrice = {
                nom: document.getElementById('val-fournisseur_nom')?.value || ''
            };
        }
        
        return data;
    }

    /**
     * Validation des champs requis
     */
    validateRequiredFields(data) {
        const errors = [];
        
        if (!data.numero_document) errors.push('Numéro de document requis');
        if (!data.date_emission) errors.push('Date émission requise');
        if (data.montant_ttc <= 0) errors.push('Montant TTC doit être positif');
        
        return errors;
    }

    /**
     * Affichage du résumé
     */
    showSummary(notionData) {
        const container = document.getElementById('ocr-hybrid-results');
        if (!container) return;
        
        let html = `
            <div class="card mt-3">
                <div class="card-header bg-success text-white">
                    <h4 class="mb-0">✅ Document prêt pour Notion</h4>
                </div>
                <div class="card-body">
                    <p><strong>Base de données:</strong> ${notionData.database}</p>
                    <p><strong>Propriétés:</strong></p>
                    <pre style="background: #f8f9fa; padding: 10px; border-radius: 4px;">
${JSON.stringify(notionData.properties, null, 2)}
                    </pre>
                    <button class="btn btn-primary" onclick="ocrHybridInterface.reset()">
                        Traiter un autre document
                    </button>
                </div>
            </div>
        `;
        
        const summaryDiv = document.createElement('div');
        summaryDiv.innerHTML = html;
        container.appendChild(summaryDiv);
    }

    /**
     * Réinitialisation
     */
    reset() {
        this.currentResult = null;
        const container = document.getElementById('ocr-hybrid-results');
        if (container) container.innerHTML = '';
        if (this.fileInput) this.fileInput.value = '';
    }

    /**
     * Affichage message de succès
     */
    showSuccess(message) {
        // Utiliser Tabler toast si disponible
        if (window.bootstrap) {
            const toast = document.createElement('div');
            toast.className = 'toast align-items-center text-white bg-success border-0';
            toast.innerHTML = `
                <div class="d-flex">
                    <div class="toast-body">${message}</div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
                </div>
            `;
            document.body.appendChild(toast);
            const bsToast = new bootstrap.Toast(toast);
            bsToast.show();
            toast.addEventListener('hidden.bs.toast', () => toast.remove());
        } else {
            alert('✅ ' + message);
        }
    }

    /**
     * Affichage message d'erreur
     */
    showError(message) {
        // Utiliser Tabler toast si disponible
        if (window.bootstrap) {
            const toast = document.createElement('div');
            toast.className = 'toast align-items-center text-white bg-danger border-0';
            toast.innerHTML = `
                <div class="d-flex">
                    <div class="toast-body">${message}</div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
                </div>
            `;
            document.body.appendChild(toast);
            const bsToast = new bootstrap.Toast(toast);
            bsToast.show();
            toast.addEventListener('hidden.bs.toast', () => toast.remove());
        } else {
            alert('❌ ' + message);
        }
    }
}

// Instance globale
window.ocrHybridInterface = new OCRHybridInterface();

// Auto-init si sur la page OCR
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('dropzone')) {
        window.ocrHybridInterface.init();
    }
});