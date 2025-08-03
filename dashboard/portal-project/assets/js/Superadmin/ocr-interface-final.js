/**
 * OCR Interface Final - Interface principale
 * Gestion complète du workflow OCR avec formulaires adaptatifs
 */

// Variable globale pour éviter les doubles clics
let isProcessingOCR = false;

class OCRInterfaceFinal {
    constructor() {
        console.log('🚀 OCR Interface Final - Initialisation');
        
        // Services
        this.ocrVision = new OCRVisionFinal();
        this.templateManager = new OCRTemplateManager();
        this.notionIntegration = new OCRNotionIntegration();
        
        // État
        this.currentFile = null;
        this.currentExtraction = null;
        this.currentDocumentType = null;
        this.validatedData = null;
        this.isProcessing = false; // Flag pour éviter les doubles soumissions
        
        // Éléments DOM
        this.elements = {
            fileInput: null,
            uploadProgress: null,
            progressBar: null,
            progressText: null,
            statusText: null,
            resultsSection: null,
            extractedInfo: null,
            validationFormContainer: null,
            notionMapping: null,
            documentPreview: null,
            confidenceBadge: null,
            typeBadge: null,
            documentTypeBadge: null
        };
        
        // Initialisation
        this.init();
    }
    
    /**
     * Initialisation de l'interface
     */
    async init() {
        try {
            // Initialiser OCR Vision
            await this.ocrVision.init();
            
            // Initialiser Notion Integration
            await this.notionIntegration.init();
            
            // Récupérer les éléments DOM
            this.initializeElements();
            
            // Configurer les event listeners
            this.setupEventListeners();
            
            console.log('✅ Interface initialisée avec succès');
            
        } catch (error) {
            console.error('❌ Erreur initialisation:', error);
            // On continue quand même, juste un warning
            console.log('✅ Interface prête malgré l\'erreur Notion (mode local)');
        }
    }
    
    /**
     * Initialiser les références DOM
     */
    initializeElements() {
        this.elements = {
            fileInput: document.getElementById('document-upload'),
            uploadProgress: document.getElementById('upload-progress'),
            progressBar: document.getElementById('progress-bar'),
            progressText: document.getElementById('progress-text'),
            statusText: document.getElementById('status-text'),
            resultsSection: document.getElementById('results-section'),
            extractedInfo: document.getElementById('extracted-info'),
            validationFormContainer: document.getElementById('validation-form-container'),
            notionMapping: document.getElementById('notion-mapping'),
            documentPreview: document.getElementById('document-preview'),
            confidenceBadge: document.getElementById('confidence-badge'),
            typeBadge: document.getElementById('type-badge'),
            documentTypeBadge: document.getElementById('document-type-badge')
        };
    }
    
    /**
     * Configuration des event listeners
     */
    setupEventListeners() {
        // Dropzone
        const dropzone = document.getElementById('dropzone');
        const fileInput = document.getElementById('document-upload');
        const filePreview = document.getElementById('file-preview');
        const removeFileBtn = document.getElementById('remove-file');
        
        // Note: La protection globale est maintenant gérée dans le HTML directement
        // pour s'assurer qu'elle est active avant même le chargement de ce script
        
        // Click sur la dropzone
        dropzone?.addEventListener('click', () => {
            fileInput.click();
        });
        
        // Drag & Drop
        if (dropzone) {
            dropzone.addEventListener('dragenter', (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropzone.classList.add('drag-over');
            });
            
            dropzone.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropzone.classList.add('drag-over');
            });
            
            dropzone.addEventListener('dragleave', (e) => {
                e.preventDefault();
                e.stopPropagation();
                // Vérifier si on quitte vraiment la dropzone
                const rect = dropzone.getBoundingClientRect();
                if (e.clientX < rect.left || e.clientX >= rect.right || 
                    e.clientY < rect.top || e.clientY >= rect.bottom) {
                    dropzone.classList.remove('drag-over');
                }
            });
            
            dropzone.addEventListener('drop', (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropzone.classList.remove('drag-over');
                
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    this.handleFileUpload(files[0]);
                }
            });
        }
        
        // File input change
        fileInput?.addEventListener('change', (e) => {
            const files = e.target.files;
            if (files.length > 0) {
                this.handleFileUpload(files[0]);
            }
        });
        
        // Remove file
        removeFileBtn?.addEventListener('click', () => {
            fileInput.value = '';
            filePreview.classList.remove('show');
            this.currentFile = null;
            this.resetInterface();
        });
        
        // Boutons d'action avec protection double clic
        const sendButton = document.getElementById('btn-send-notion');
        if (sendButton) {
            sendButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.sendToNotion();
            });
        }
        
        document.getElementById('btn-preview-data')?.addEventListener('click', () => {
            this.previewData();
        });
        
        document.getElementById('btn-export-json')?.addEventListener('click', () => {
            this.exportJSON();
        });
        
        // Changement de modèle IA
        document.querySelectorAll('[data-model]').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.changeAIModel(e.currentTarget.dataset.model);
            });
        });
        
        // Paste image
        document.addEventListener('paste', (e) => {
            const items = e.clipboardData.items;
            for (let item of items) {
                if (item.type.indexOf('image') !== -1) {
                    const blob = item.getAsFile();
                    this.handleFileUpload(blob);
                    break;
                }
            }
        });
    }
    
    /**
     * Gestion de l'upload de fichier
     */
    async handleFileUpload(file) {
        console.log('📄 Fichier uploadé:', file.name);
        
        this.currentFile = file;
        this.resetInterface();
        this.showFilePreview(file);
        this.showProgress();
        
        try {
            // Traiter le document avec OCR Vision
            const result = await this.ocrVision.processDocument(
                file,
                (progress, status) => this.updateProgress(progress, status)
            );
            
            if (!result.success) {
                throw new Error(result.error || 'Échec de l\'extraction');
            }
            
            // Stocker les résultats
            this.currentExtraction = result;
            this.currentDocumentType = result.document_type;
            
            // Valider les données extraites
            const validation = this.ocrVision.validateExtractedData(result);
            
            // Mapper les données vers le template
            const mappedData = this.templateManager.mapExtractedDataToTemplate(
                result.document_type,
                result.extracted_data
            );
            
            // Afficher les résultats
            this.displayResults(result, mappedData);
            
            // Afficher la validation
            this.displayValidationFeedback(validation, result);
            
            // Notification selon le score
            if (validation.score >= 85) {
                this.showAlert('success', `Document analysé avec succès! Score qualité: ${validation.score}%`);
            } else if (validation.score >= 60) {
                this.showAlert('warning', `Analyse terminée avec des avertissements. Score: ${validation.score}%`);
            } else {
                this.showAlert('error', `Qualité d'extraction faible. Score: ${validation.score}%`);
            }
            
        } catch (error) {
            console.error('❌ Erreur traitement:', error);
            this.showAlert('error', `Erreur: ${error.message}`);
            this.hideProgress();
        }
    }
    
    /**
     * Afficher les résultats
     */
    displayResults(extraction, mappedData) {
        // Cacher la progression avec délai pour animation
        setTimeout(() => {
            this.hideProgress();
            
            // Afficher la section résultats avec animation
            this.elements.resultsSection.classList.remove('d-none');
            this.elements.resultsSection.classList.add('slide-up');
            
            // Mettre à jour les badges
            this.updateBadges(extraction);
            
            // Tab 1: Données extraites
            this.displayExtractedData(extraction.extracted_data);
            
            // Tab 2: Formulaire de validation
            this.displayValidationForm(extraction.document_type, mappedData);
            
            // Tab 3: Mapping Notion
            this.displayNotionMapping(extraction.document_type, mappedData);
            
            // Afficher l'aperçu du document
            this.displayDocumentPreview();
            
            // Scroll vers les résultats
            this.elements.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 500);
    }
    
    /**
     * Mettre à jour les badges
     */
    updateBadges(extraction) {
        // Badge de confiance
        const confidence = Math.round((extraction.confidence || 0.95) * 100);
        this.elements.confidenceBadge.innerHTML = `Confiance: ${confidence}%`;
        
        // Badge de type
        const template = this.templateManager.getTemplate(extraction.document_type);
        this.elements.typeBadge.textContent = `Type: ${extraction.document_type}`;
        this.elements.documentTypeBadge.textContent = `Type: ${extraction.document_type}`;
    }
    
    /**
     * Afficher les données extraites
     */
    displayExtractedData(data) {
        let html = '<dl class="row">';
        
        // Ajouter le contexte TVA en premier si disponible
        if (data.tva_context) {
            html += `
                <dt class="col-sm-4">Contexte TVA</dt>
                <dd class="col-sm-8">
                    <span class="badge bg-info" id="tva-context-badge">
                        ${data.tva_context.raison_tva_zero || 'TVA normale'} 
                        ${data.tva_context.pays_origine ? `(${data.tva_context.pays_origine} → ${data.tva_context.pays_destination})` : ''}
                    </span>
                </dd>
            `;
        }
        
        // Parcourir toutes les données extraites
        for (const [key, value] of Object.entries(data)) {
            // Skip les données internes et contexte TVA (déjà affiché)
            if (key.startsWith('_') || key === 'tva_context') continue;
            
            let label = this.formatLabel(key);
            
            // Clarifier certains labels
            if (key === 'reference') {
                label = 'IBAN/Références bancaires';
            } else if (key === 'devise') {
                label = 'Devise utilisée';
            }
            
            const displayValue = this.formatValue(value);
            
            html += `
                <dt class="col-sm-4">${label}</dt>
                <dd class="col-sm-8">${displayValue}</dd>
            `;
        }
        
        html += '</dl>';
        
        this.elements.extractedInfo.innerHTML = html;
    }
    
    /**
     * Afficher le formulaire de validation
     */
    displayValidationForm(documentType, data) {
        const template = this.templateManager.getTemplate(documentType);
        
        console.log('🔍 DEBUG displayValidationForm:');
        console.log('documentType:', documentType);
        console.log('data to display:', data);
        console.log(`💱 Devise dans data.devise: ${data.devise || 'MANQUANTE ❌'}`);
        if (!data.devise) {
            console.error('❌ ATTENTION: La devise n\'est pas dans data!');
        }
        
        // Header
        let html = `
            <div class="mb-4">
                <h4 class="card-title">${template.database_name}</h4>
                <p class="text-muted">Vérifiez et corrigez les données avant l'envoi vers Notion</p>
            </div>
        `;
        
        // Formulaire généré
        html += this.templateManager.generateFormHTML(documentType, data);
        
        this.elements.validationFormContainer.innerHTML = html;
        
        // Ajouter les event listeners pour la validation en temps réel
        this.setupFormValidation();
        
        // Debug final - vérifier que les valeurs sont bien dans le DOM
        this.debugFormValues(data);
    }
    
    /**
     * Debug des valeurs du formulaire
     */
    debugFormValues(data) {
        console.log('🔍 DEBUG FORM VALUES IN DOM:');
        
        const criticalFields = ['montant_ttc', 'prix_client_ht', 'montant_tva', 'mode_paiement'];
        
        criticalFields.forEach(fieldKey => {
            const input = document.getElementById(fieldKey) || document.querySelector(`[name="${fieldKey}"]`);
            if (input) {
                console.log(`✅ ${fieldKey}: value="${input.value}" (expected: "${data[fieldKey]}")`);
            } else {
                console.log(`❌ ${fieldKey}: INPUT NOT FOUND!`);
            }
        });
        
        // Vérifier spécifiquement le mode de paiement
        const modePaiementSelect = document.getElementById('mode_paiement');
        if (modePaiementSelect) {
            const selectedOption = modePaiementSelect.selectedOptions[0];
            console.log(`Mode paiement: selected="${selectedOption?.value}" (${selectedOption?.text})`);
        }
    }
    
    /**
     * Afficher le mapping Notion
     */
    displayNotionMapping(documentType, data) {
        const template = this.templateManager.getTemplate(documentType);
        
        let html = `
            <div class="card">
                <div class="card-header">
                    <h4 class="card-title">Base de données Notion cible</h4>
                </div>
                <div class="card-body">
                    <div class="mb-4">
                        <div class="alert alert-info">
                            <h5 class="alert-title">
                                <svg xmlns="http://www.w3.org/2000/svg" class="icon alert-icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 8v4m0 4h.01"/><path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0"/></svg>
                                ${template.database_name}
                            </h5>
                            <div class="text-secondary">
                                ID: <code>${template.database_id}</code>
                            </div>
                        </div>
                    </div>
                    
                    <h5>Champs mappés</h5>
                    <div class="table-responsive">
                        <table class="table table-sm">
                            <thead>
                                <tr>
                                    <th>Champ Notion</th>
                                    <th>Valeur</th>
                                    <th>Type</th>
                                    <th>Statut</th>
                                </tr>
                            </thead>
                            <tbody>
        `;
        
        // Afficher chaque champ
        template.fields.forEach(field => {
            const value = data[field.key];
            const hasValue = value !== undefined && value !== null && value !== '';
            const statusIcon = field.required && !hasValue 
                ? '<span class="badge bg-warning">Requis</span>'
                : '<span class="badge bg-success">OK</span>';
            
            html += `
                <tr>
                    <td><strong>${field.label}</strong></td>
                    <td>${hasValue ? this.formatValue(value) : '<em class="text-muted">Non défini</em>'}</td>
                    <td><span class="badge bg-secondary">${field.type}</span></td>
                    <td>${statusIcon}</td>
                </tr>
            `;
        });
        
        html += `
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
        
        this.elements.notionMapping.innerHTML = html;
    }
    
    /**
     * Afficher l'aperçu du document
     */
    displayDocumentPreview() {
        if (!this.currentFile) return;
        
        if (this.currentFile.type.startsWith('image/')) {
            // Afficher l'image
            const reader = new FileReader();
            reader.onload = (e) => {
                this.elements.documentPreview.innerHTML = `
                    <img src="${e.target.result}" class="img-fluid rounded" alt="Document preview">
                `;
            };
            reader.readAsDataURL(this.currentFile);
        } else if (this.currentFile.type === 'application/pdf') {
            // Afficher une icône PDF
            this.elements.documentPreview.innerHTML = `
                <div class="text-center p-4">
                    <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-lg text-danger" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M14 3v4a1 1 0 0 0 1 1h4"/><path d="M5 12v-7a2 2 0 0 1 2 -2h7l5 5v4"/><path d="M5 18h1.5a1.5 1.5 0 0 0 0 -3h-1.5v6"/><path d="M17 18h2"/><path d="M20 15h-3v6"/><path d="M11 15v6h1a2 2 0 0 0 2 -2v-2a2 2 0 0 0 -2 -2h-1z"/></svg>
                    <p class="mt-2">${this.currentFile.name}</p>
                    <p class="text-muted small">${(this.currentFile.size / 1024).toFixed(1)} KB</p>
                </div>
            `;
        }
    }
    
    /**
     * Configuration de la validation du formulaire
     */
    setupFormValidation() {
        const form = this.elements.validationFormContainer.querySelector('form');
        if (!form) return;
        
        // Validation en temps réel
        form.addEventListener('input', (e) => {
            const input = e.target;
            if (input.hasAttribute('required') && !input.value) {
                input.classList.add('is-invalid');
            } else {
                input.classList.remove('is-invalid');
            }
        });
        
        // Collecter les données du formulaire
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.collectFormData();
        });
    }
    
    /**
     * Collecter les données du formulaire
     */
    collectFormData() {
        const form = this.elements.validationFormContainer.querySelector('form');
        if (!form) return;
        
        const formData = new FormData(form);
        const data = {};
        
        for (const [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        // Valider les données
        const validation = this.templateManager.validateData(this.currentDocumentType, data);
        
        if (validation.valid) {
            this.validatedData = data;
            this.showAlert('success', 'Données validées avec succès!');
            
            // Activer l'onglet Notion
            const notionTab = document.querySelector('[href="#tabs-notion"]');
            if (notionTab) {
                notionTab.click();
            }
            
            // Mettre à jour le mapping
            this.displayNotionMapping(this.currentDocumentType, data);
            
            // Scroll vers la section Notion
            setTimeout(() => {
                document.getElementById('tabs-notion')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 300);
        } else {
            // Afficher les erreurs
            let errorMessage = 'Erreurs de validation:<br>';
            validation.errors.forEach(error => {
                errorMessage += `- ${error.message}<br>`;
            });
            this.showAlert('error', errorMessage);
        }
    }
    
    /**
     * Envoyer vers Notion
     */
    async sendToNotion() {
        // Protection contre double clic avec variable globale
        if (isProcessingOCR || this.isProcessing) {
            console.warn('⚠️ Traitement déjà en cours, veuillez patienter...');
            this.showAlert('warning', 'Un envoi est déjà en cours, veuillez patienter...');
            return;
        }
        
        const submitButton = document.getElementById('btn-send-notion');
        const originalButtonHTML = submitButton ? submitButton.innerHTML : '';
        
        // Double vérification avec attribut data
        if (submitButton && submitButton.getAttribute('data-processing') === 'true') {
            console.warn('⚠️ Bouton déjà en traitement');
            return;
        }
        
        if (!this.validatedData) {
            // Collecter d'abord les données du formulaire
            this.collectFormData();
            
            if (!this.validatedData) {
                this.showAlert('warning', 'Veuillez d\'abord valider les données');
                return;
            }
        }
        
        const template = this.templateManager.getTemplate(this.currentDocumentType);
        
        // Vérifier la clé API Notion
        let notionApiKey = localStorage.getItem('notion_api_key');
        
        // Si pas de clé, utiliser celle par défaut
        if (!notionApiKey) {
            notionApiKey = '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';
            localStorage.setItem('notion_api_key', notionApiKey);
            this.showAlert('info', 'Clé API Notion configurée automatiquement');
        }
        
        // Activer le flag de traitement global et local
        isProcessingOCR = true;
        this.isProcessing = true;
        
        // État loading avec triple protection
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.setAttribute('data-processing', 'true');
            submitButton.classList.add('disabled');
            submitButton.style.pointerEvents = 'none';
            submitButton.style.opacity = '0.6';
            submitButton.innerHTML = `
                <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                Envoi en cours...
            `;
        }
        
        try {
            // Si on est sur Python, avertir l'utilisateur
            if (window.location.port === '8000') {
                console.warn('⚠️ ATTENTION : Vous utilisez Python (port 8000)');
                console.warn('📍 Le serveur Node.js doit tourner sur le port 3000 pour l\'API Notion');
                console.warn('💡 Lancez dans un autre terminal : cd portal-project/server && npm start');
                console.warn('🚀 Ou utilisez directement : http://localhost:3000/superadmin/finance/ocr-premium-dashboard-fixed.html');
            }
            
            // Essayer d'utiliser le proxy (Python local ou PHP distant)
            let apiUrl;
            if (window.location.protocol === 'file:') {
                // Mode fichier local - utiliser le serveur Python
                apiUrl = 'http://localhost:8080/api/notion-proxy.php';
            } else if (window.location.hostname === 'localhost' && window.location.port === '8080') {
                // Mode serveur local
                apiUrl = 'http://localhost:8080/api/notion-proxy.php';
            } else {
                // Mode production
                apiUrl = '/api/notion-proxy.php';
            }
            // Utiliser le Smart Resolver pour gérer les relations
            const resolver = new OCRNotionSmartResolver();
            let result = null; // Déclarer result
            
            try {
                // Afficher progression
                this.showProgress('🧠 Résolution intelligente des relations...');
                
                // Traiter le document avec le resolver (inclure le fichier PDF si disponible)
                const resolverResult = await resolver.processOCRDocument(
                    this.validatedData,
                    this.currentDocumentType,
                    this.currentFile  // Passer le fichier PDF
                );
                
                if (!resolverResult.success && !resolverResult.document) {
                    throw new Error(resolverResult.error || 'Échec de création du document');
                }
                
                // Mettre à jour l'interface avec le résultat
                if (resolverResult.success) {
                    this.showSuccess(`✅ Document créé avec ${resolverResult.relations_created.length} relation(s)`);
                    
                    // Afficher le résumé des relations créées
                    if (resolverResult.relations_created && resolverResult.relations_created.length > 0) {
                        console.log('🔗 Détails relations:');
                        resolverResult.relations_created.forEach((rel, index) => {
                            console.log(`  ${index + 1}. ${rel.type}: ${rel.name} (${rel.status})`);
                        });
                        
                        const relationsHtml = resolverResult.relations_created.map(rel => 
                            `<li>${rel.type}: ${rel.name} (${rel.status})</li>`
                        ).join('');
                        
                        const summaryHtml = `
                            <div class="mt-3">
                                <h6>Relations créées:</h6>
                                <ul class="mb-0">${relationsHtml}</ul>
                            </div>
                        `;
                        
                        // Ajouter le résumé à l'interface
                        const notionTab = document.getElementById('tabs-notion');
                        if (notionTab) {
                            notionTab.insertAdjacentHTML('beforeend', summaryHtml);
                        }
                    }
                } else {
                    this.showWarning(`⚠️ Document créé en mode dégradé: ${resolverResult.message}`);
                }
                
                // Stocker le résultat pour la suite du traitement
                result = resolverResult.document;
                
            } catch (resolverError) {
                console.error('❌ Erreur Smart Resolver:', resolverError);
                this.showError(`Smart Resolver indisponible: ${resolverError.message}`);
                
                // Désactiver temporairement le fallback défaillant
                console.warn('⚠️ Fallback désactivé temporairement');
                return; // Arrêter ici
            }
            
            // Succès réel! (ce code n'est plus exécuté car on utilise Smart Resolver)
            if (result) {
                const successHtml = `
                    <div class="alert alert-success alert-dismissible fade show" role="alert">
                        <div class="d-flex">
                            <div>
                                <svg xmlns="http://www.w3.org/2000/svg" class="icon alert-icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none">
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                    <path d="M5 12l5 5l10 -10"/>
                                </svg>
                            </div>
                            <div>
                                <h4 class="alert-title">✅ Document créé dans Notion!</h4>
                                <div class="text-muted">
                                    Le document a été ajouté à ${template.database_name}.
                                </div>
                                ${result.url ? `
                            <div class="mt-2">
                                <a href="${result.url}" target="_blank" class="btn btn-sm btn-primary">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none">
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                        <path d="M9 15l6 -6"/>
                                        <path d="M11 6l.463 -.536a5 5 0 0 1 7.071 7.072l-.534 .464"/>
                                        <path d="M13 18l-.397 .534a5.068 5.068 0 0 1 -7.127 0a4.972 4.972 0 0 1 0 -7.071l.524 -.463"/>
                                    </svg>
                                    Ouvrir dans Notion
                                </a>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            `;
            
            this.showAlertHtml(successHtml);
            console.log('✅ Envoi Notion réussi:', result);
            
            // Sauvegarder localement aussi
            this.saveToLocalStorage(this.currentDocumentType, this.validatedData);
            
            // Réinitialiser après succès
            setTimeout(() => {
                this.resetInterface();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 5000);
            }
            
        } catch (error) {
            console.error('❌ Erreur envoi Notion:', error);
            
            // Si le proxy n'est pas disponible, utiliser le mode simulation
            if (error.message.includes('proxy') || error.message.includes('404') || error.message.includes('Failed to fetch')) {
                console.log('📤 Mode simulation activé');
                
                // Simuler un délai
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                const successHtml = `
                    <div class="alert alert-warning alert-dismissible fade show" role="alert">
                        <div class="d-flex">
                            <div>
                                <svg xmlns="http://www.w3.org/2000/svg" class="icon alert-icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none">
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                    <path d="M12 9v4"/>
                                    <path d="M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0z"/>
                                    <path d="M12 16h.01"/>
                                </svg>
                            </div>
                            <div>
                                <h4 class="alert-title">Mode Simulation</h4>
                                <div class="text-muted">
                                    Le proxy backend n'est pas configuré. Les données ont été préparées mais non envoyées.<br>
                                    Pour activer l'envoi réel, déployez le fichier <code>/api/notion-proxy.php</code> sur votre serveur.
                                </div>
                                <div class="mt-2">
                                    <details>
                                        <summary class="text-primary cursor-pointer">Voir les données préparées</summary>
                                        <pre class="mt-2 p-2 bg-dark text-white rounded" style="font-size: 0.8rem;">${JSON.stringify(this.validatedData, null, 2)}</pre>
                                    </details>
                                </div>
                            </div>
                        </div>
                        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                    </div>
                `;
                
                this.showAlertHtml(successHtml);
                this.saveToLocalStorage(this.currentDocumentType, this.validatedData);
                
            } else {
                // Vraie erreur
                const errorHtml = `
                    <div class="alert alert-danger alert-dismissible fade show" role="alert">
                        <div class="d-flex">
                            <div>
                                <svg xmlns="http://www.w3.org/2000/svg" class="icon alert-icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none">
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                    <path d="M10.29 3.86l1.82 14.14a2 2 0 0 0 1.71 3h.46a2 2 0 0 0 1.71 -3l1.82 -14.14a2 2 0 0 0 -3.42 0z"/>
                                    <path d="M12 9v4"/>
                                    <path d="M12 17h.01"/>
                                </svg>
                            </div>
                            <div>
                                <h4 class="alert-title">Erreur d'envoi</h4>
                                <div class="text-muted">${error.message}</div>
                            </div>
                        </div>
                        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                    </div>
                `;
                
                this.showAlertHtml(errorHtml);
            }
            
        } finally {
            // Toujours réactiver le bouton après traitement
            setTimeout(() => {
                isProcessingOCR = false;
                this.isProcessing = false;
                
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.removeAttribute('data-processing');
                    submitButton.classList.remove('disabled');
                    submitButton.style.pointerEvents = 'auto';
                    submitButton.style.opacity = '1';
                    submitButton.innerHTML = originalButtonHTML || `
                        <svg xmlns="http://www.w3.org/2000/svg" class="icon me-2" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                            <path d="M22 7.535v9.465a3 3 0 0 1 -2.824 2.995l-.176 .005h-14a3 3 0 0 1 -2.995 -2.824l-.005 -.176v-9.465l9.445 6.297l.116 .066a1 1 0 0 0 .878 0l.116 -.066l9.445 -6.297z"/>
                            <path d="M19 4c1.08 0 2.027 .57 2.555 1.427l-9.555 6.37l-9.555 -6.37a2.999 2.999 0 0 1 2.354 -1.42l.201 -.007h14z"/>
                        </svg>
                        Envoyer vers Notion
                    `;
                }
            }, 1000);
        }
    }
    
    /**
     * Préparer les propriétés pour Notion
     */
    prepareNotionProperties(template, data) {
        const properties = {};
        
        template.fields.forEach(field => {
            const value = data[field.key];
            if (value === undefined || value === null || value === '') return;
            
            // Nettoyer les valeurs numériques (enlever CHF, virgules, etc)
            let cleanValue = value;
            if (field.type === 'number' && typeof value === 'string') {
                cleanValue = value.replace(/[^\d.-]/g, '');
            }
            
            switch (field.type) {
                case 'text':
                case 'textarea':
                    properties[field.label] = {
                        [field.key === 'numero' || field.key === 'nom_document' ? 'title' : 'rich_text']: [{
                            type: 'text',
                            text: { content: String(value) }
                        }]
                    };
                    break;
                    
                case 'number':
                    properties[field.label] = {
                        number: parseFloat(cleanValue) || 0
                    };
                    break;
                    
                case 'date':
                    properties[field.label] = {
                        date: {
                            start: value,
                            end: null
                        }
                    };
                    break;
                    
                case 'select':
                    properties[field.label] = {
                        select: {
                            name: String(value)
                        }
                    };
                    break;
                    
                case 'checkbox':
                    properties[field.label] = {
                        checkbox: Boolean(value)
                    };
                    break;
            }
        });
        
        // Ajouter metadata
        properties['Créé par OCR'] = {
            checkbox: true
        };
        
        properties['Date Import'] = {
            date: {
                start: new Date().toISOString().split('T')[0]
            }
        };
        
        return properties;
    }
    
    /**
     * Créer le contenu de la page Notion
     */
    createPageContent(data) {
        const blocks = [];
        
        // Titre
        blocks.push({
            object: 'block',
            type: 'heading_1',
            heading_1: {
                rich_text: [{
                    type: 'text',
                    text: { content: 'Document importé par OCR' }
                }]
            }
        });
        
        // Informations extraites
        blocks.push({
            object: 'block',
            type: 'heading_2',
            heading_2: {
                rich_text: [{
                    type: 'text',
                    text: { content: 'Données extraites' }
                }]
            }
        });
        
        // Table des données
        Object.entries(data).forEach(([key, value]) => {
            if (value && value !== 'NON_VISIBLE') {
                blocks.push({
                    object: 'block',
                    type: 'bulleted_list_item',
                    bulleted_list_item: {
                        rich_text: [{
                            type: 'text',
                            text: { 
                                content: `${this.formatLabel(key)}: ${value}` 
                            }
                        }]
                    }
                });
            }
        });
        
        return blocks;
    }
    
    /**
     * Sauvegarder localement (backup)
     */
    saveToLocalStorage(documentType, data) {
        try {
            const saved = JSON.parse(localStorage.getItem('ocr_saved_documents') || '[]');
            saved.push({
                id: Date.now(),
                documentType,
                data,
                savedAt: new Date().toISOString()
            });
            // Garder seulement les 50 derniers
            if (saved.length > 50) {
                saved.shift();
            }
            localStorage.setItem('ocr_saved_documents', JSON.stringify(saved));
            console.log('💾 Document sauvegardé localement');
        } catch (e) {
            console.error('Erreur sauvegarde locale:', e);
        }
    }
    
    /**
     * Afficher une alerte HTML
     */
    showAlertHtml(html) {
        const container = document.querySelector('.page-body .container-xl');
        const alertContainer = document.createElement('div');
        alertContainer.innerHTML = html;
        container.insertBefore(alertContainer.firstChild, container.firstChild);
        
        // Auto-fermer après 10 secondes
        setTimeout(() => {
            const alert = alertContainer.querySelector('.alert');
            if (alert) {
                const bsAlert = new bootstrap.Alert(alert);
                bsAlert.close();
            }
        }, 10000);
    }
    
    /**
     * Prévisualiser les données
     */
    previewData() {
        const data = this.validatedData || this.currentExtraction?.extracted_data;
        
        if (!data) {
            this.showAlert('warning', 'Aucune donnée à prévisualiser');
            return;
        }
        
        const jsonString = JSON.stringify(data, null, 2);
        
        // Créer une modal Bootstrap
        const modalHtml = `
            <div class="modal modal-blur fade" id="previewModal" tabindex="-1">
                <div class="modal-dialog modal-lg modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Prévisualisation des données</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <pre class="bg-dark text-white p-3 rounded"><code>${jsonString}</code></pre>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fermer</button>
                            <button type="button" class="btn btn-primary" onclick="navigator.clipboard.writeText('${jsonString.replace(/'/g, "\\'")}')">
                                <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-copy" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M7 7m0 2.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667z"/><path d="M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1"/></svg>
                                Copier
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Ajouter la modal au DOM
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Ouvrir la modal
        const modal = new bootstrap.Modal(document.getElementById('previewModal'));
        modal.show();
        
        // Nettoyer après fermeture
        document.getElementById('previewModal').addEventListener('hidden.bs.modal', function () {
            this.remove();
        });
    }
    
    /**
     * Exporter en JSON
     */
    exportJSON() {
        const data = {
            document: {
                name: this.currentFile?.name,
                type: this.currentDocumentType,
                processedAt: new Date().toISOString()
            },
            extraction: this.currentExtraction,
            validatedData: this.validatedData,
            template: this.templateManager.getTemplate(this.currentDocumentType)
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ocr-export-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showAlert('success', 'Données exportées avec succès!');
    }
    
    /**
     * Changer le modèle IA
     */
    changeAIModel(model) {
        localStorage.setItem('openai_model', model);
        this.ocrVision.model = model;
        
        // Mettre à jour l'UI
        document.querySelectorAll('[data-model]').forEach(item => {
            if (item.dataset.model === model) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        
        this.showAlert('info', `Modèle changé: ${model}`);
    }
    
    /**
     * Afficher le preview du fichier
     */
    showFilePreview(file) {
        const filePreview = document.getElementById('file-preview');
        const fileName = document.getElementById('file-name');
        const fileSize = document.getElementById('file-size');
        const fileIcon = document.getElementById('file-icon');
        
        // Afficher le nom et la taille
        fileName.textContent = file.name;
        fileSize.textContent = this.formatFileSize(file.size);
        
        // Icône selon le type
        if (file.type === 'application/pdf') {
            fileIcon.innerHTML = `
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <path d="M14 3v4a1 1 0 0 0 1 1h4"/>
                <path d="M5 12v-7a2 2 0 0 1 2 -2h7l5 5v4"/>
                <path d="M5 18h1.5a1.5 1.5 0 0 0 0 -3h-1.5v6"/>
                <path d="M17 18h2"/>
                <path d="M20 15h-3v6"/>
                <path d="M11 15v6h1a2 2 0 0 0 2 -2v-2a2 2 0 0 0 -2 -2h-1z"/>
            `;
            fileIcon.style.color = 'var(--tblr-danger)';
        } else {
            fileIcon.innerHTML = `
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <path d="M15 8h.01"/>
                <path d="M3 6a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v12a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3v-12z"/>
                <path d="M3 16l5 -5c.928 -.893 2.072 -.893 3 0l5 5"/>
                <path d="M14 14l1 -1c.928 -.893 2.072 -.893 3 0l3 3"/>
            `;
            fileIcon.style.color = 'var(--tblr-info)';
        }
        
        // Afficher avec animation
        filePreview.classList.add('show');
    }
    
    /**
     * Formater la taille du fichier
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    /**
     * Gestion de la progression
     */
    showProgress() {
        const uploadProgress = document.getElementById('upload-progress');
        const progressBar = document.getElementById('progress-bar');
        
        uploadProgress.classList.remove('d-none');
        uploadProgress.classList.add('fade-in');
        
        // Commencer avec une barre indéterminée
        progressBar.classList.add('progress-bar-indeterminate');
        progressBar.style.width = '100%';
    }
    
    hideProgress() {
        const uploadProgress = document.getElementById('upload-progress');
        uploadProgress.classList.add('d-none');
    }
    
    updateProgress(percent, status) {
        const progressBar = document.getElementById('progress-bar');
        const progressText = document.getElementById('progress-text');
        const progressStatus = document.getElementById('progress-status');
        
        // Si on a un pourcentage, passer en mode déterminé
        if (percent > 0) {
            progressBar.classList.remove('progress-bar-indeterminate');
            progressBar.style.width = `${percent}%`;
        }
        
        progressText.textContent = `${percent}%`;
        progressStatus.textContent = status;
        
        // Animation de succès à 100%
        if (percent === 100) {
            progressBar.classList.add('bg-success');
        }
    }
    
    /**
     * Afficher une alerte
     */
    showAlert(type, message) {
        const alertTypes = {
            success: 'alert-success',
            error: 'alert-danger',
            warning: 'alert-warning',
            info: 'alert-info'
        };
        
        const alertHtml = `
            <div class="alert ${alertTypes[type]} alert-dismissible fade show" role="alert">
                <div class="d-flex">
                    <div>${message}</div>
                </div>
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        
        // Ajouter l'alerte en haut de la page
        const container = document.querySelector('.page-body .container-xl');
        const alertContainer = document.createElement('div');
        alertContainer.innerHTML = alertHtml;
        container.insertBefore(alertContainer.firstChild, container.firstChild);
        
        // Auto-fermer après 5 secondes
        setTimeout(() => {
            alertContainer.firstChild.remove();
        }, 5000);
    }
    
    /**
     * Utilitaires
     */
    formatLabel(key) {
        return key
            .replace(/_/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
    }
    
    formatValue(value) {
        if (value === null || value === undefined) return '-';
        
        if (typeof value === 'object') {
            return JSON.stringify(value);
        }
        
        if (typeof value === 'number') {
            return value.toLocaleString('fr-CH');
        }
        
        return String(value);
    }
    
    resetInterface() {
        console.log('🔄 Réinitialisation de l\'interface');
        
        // Vérifier que les éléments existent avant de les modifier
        const elements = {
            scanButton: document.getElementById('scan-button'),
            scanStatus: document.getElementById('scan-status'),
            resultSection: document.getElementById('results-section'),
            validationForm: document.getElementById('validation-form-container'),
            jsonResult: document.getElementById('json-result'),
            uploadProgress: document.getElementById('upload-progress'),
            progressBar: document.getElementById('progress-bar'),
            progressText: document.getElementById('progress-text'),
            statusText: document.getElementById('progress-status'),
            confidenceBadge: document.getElementById('confidence-badge'),
            typeBadge: document.getElementById('type-badge'),
            documentTypeBadge: document.getElementById('document-type-badge')
        };
        
        // Vérifier et réinitialiser chaque élément
        if (elements.scanButton) {
            elements.scanButton.classList.remove('btn-danger');
            elements.scanButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="icon me-2" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 7v-1a2 2 0 0 1 2 -2h2"/><path d="M4 17v1a2 2 0 0 0 2 2h2"/><path d="M16 4h2a2 2 0 0 1 2 2v1"/><path d="M16 20h2a2 2 0 0 0 2 -2v-1"/><path d="M5 12l14 0"/></svg>Scanner le document';
        }
        
        if (elements.scanStatus) {
            elements.scanStatus.innerHTML = '';
        }
        
        if (elements.resultSection || this.elements.resultsSection) {
            const section = elements.resultSection || this.elements.resultsSection;
            if (section) {
                section.classList.add('d-none');
            }
        }
        
        if (elements.validationForm) {
            elements.validationForm.innerHTML = '';
        }
        
        if (elements.jsonResult) {
            elements.jsonResult.textContent = '';
        }
        
        if (elements.uploadProgress) {
            elements.uploadProgress.classList.add('d-none');
        }
        
        if (elements.progressBar) {
            elements.progressBar.style.width = '0%';
            elements.progressBar.classList.remove('progress-bar-indeterminate');
        }
        
        if (elements.progressText) {
            elements.progressText.textContent = '0%';
        }
        
        if (elements.statusText) {
            elements.statusText.textContent = '';
        }
        
        // Réinitialiser les badges
        if (elements.confidenceBadge) {
            elements.confidenceBadge.textContent = 'Confiance: 0%';
            elements.confidenceBadge.className = 'badge bg-secondary';
        }
        
        if (elements.typeBadge) {
            elements.typeBadge.textContent = 'Type: -';
            elements.typeBadge.className = 'badge bg-secondary';
        }
        
        if (elements.documentTypeBadge) {
            elements.documentTypeBadge.textContent = '-';
            elements.documentTypeBadge.className = 'badge bg-secondary-lt';
        }
        
        // Réinitialiser l'état interne
        this.currentExtraction = null;
        this.currentDocumentType = null;
        this.validatedData = null;
        this.isProcessing = false;
        
        // Réinitialiser le flag global
        if (typeof isProcessingOCR !== 'undefined') {
            isProcessingOCR = false;
        }
        
        console.log('✅ Interface réinitialisée');
    }
    
    /**
     * Afficher le feedback de validation
     */
    displayValidationFeedback(validation, ocrResult) {
        // Créer la section si elle n'existe pas
        let feedbackSection = document.getElementById('validation-feedback');
        if (!feedbackSection) {
            const resultsSection = document.getElementById('results-section');
            const feedbackHTML = `
                <div class="col-12 mt-3" id="validation-feedback">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">
                                <svg xmlns="http://www.w3.org/2000/svg" class="icon me-2" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none">
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                    <path d="M9 12l2 2l4 -4"/>
                                    <path d="M12 3a12 9 0 0 0 0 18a12 9 0 0 0 0 -18z"/>
                                </svg>
                                Validation & Qualité
                            </h3>
                            <div class="card-actions">
                                <span class="badge" id="quality-score">Score: ${validation.score}%</span>
                            </div>
                        </div>
                        <div class="card-body">
                            <div id="validation-issues"></div>
                            <div class="mt-3" id="validation-actions">
                                <button class="btn btn-warning" id="retry-different-model">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="icon me-2" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none">
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                        <path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4"/>
                                        <path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4"/>
                                    </svg>
                                    Réessayer avec GPT-4o (Précision Max)
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            resultsSection.insertAdjacentHTML('afterend', feedbackHTML);
            
            // Ajouter l'event listener pour le bouton
            document.getElementById('retry-different-model')?.addEventListener('click', () => {
                this.retryWithDifferentModel();
            });
        }
        
        // Mettre à jour le score
        const scoreBadge = document.getElementById('quality-score');
        if (scoreBadge) {
            scoreBadge.textContent = `Score: ${validation.score}%`;
            scoreBadge.className = 'badge';
            if (validation.score >= 85) {
                scoreBadge.classList.add('bg-success');
            } else if (validation.score >= 60) {
                scoreBadge.classList.add('bg-warning');
            } else {
                scoreBadge.classList.add('bg-danger');
            }
        }
        
        // Afficher les issues
        const issuesContainer = document.getElementById('validation-issues');
        if (issuesContainer) {
            let issuesHTML = '';
            
            if (validation.issues.length === 0) {
                issuesHTML = '<div class="alert alert-success">✅ Toutes les données ont été extraites avec succès!</div>';
            } else {
                // Grouper par sévérité
                const highIssues = validation.issues.filter(i => i.severity === 'HIGH');
                const mediumIssues = validation.issues.filter(i => i.severity === 'MEDIUM');
                const warningIssues = validation.issues.filter(i => i.severity === 'WARNING');
                
                if (highIssues.length > 0) {
                    issuesHTML += '<div class="alert alert-danger"><h5>❌ Problèmes critiques</h5><ul class="mb-0">';
                    highIssues.forEach(issue => {
                        issuesHTML += `<li>${issue.message}</li>`;
                    });
                    issuesHTML += '</ul></div>';
                }
                
                if (mediumIssues.length > 0) {
                    issuesHTML += '<div class="alert alert-warning"><h5>⚠️ Avertissements</h5><ul class="mb-0">';
                    mediumIssues.forEach(issue => {
                        issuesHTML += `<li>${issue.message}</li>`;
                    });
                    issuesHTML += '</ul></div>';
                }
                
                if (warningIssues.length > 0) {
                    issuesHTML += '<div class="alert alert-info"><h5>ℹ️ Informations</h5><ul class="mb-0">';
                    warningIssues.forEach(issue => {
                        issuesHTML += `<li>${issue.message}</li>`;
                    });
                    issuesHTML += '</ul></div>';
                }
            }
            
            // Ajouter info qualité document
            if (ocrResult.document_quality) {
                issuesHTML += `<div class="mt-2"><strong>Qualité document:</strong> ${ocrResult.document_quality}</div>`;
            }
            
            issuesContainer.innerHTML = issuesHTML;
        }
    }
    
    /**
     * Afficher un message de progression
     */
    showProgress(message) {
        const progressStatus = document.getElementById('progress-status');
        if (progressStatus) {
            progressStatus.textContent = message;
        }
        console.log('⏳', message);
    }
    
    /**
     * Afficher un message de succès
     */
    showSuccess(message) {
        console.log('✅', message);
        
        // Créer ou mettre à jour le conteneur de résultat
        let statusDiv = document.getElementById('validation-result');
        if (!statusDiv) {
            // Chercher un endroit approprié pour afficher le message
            const notionTab = document.getElementById('tabs-notion');
            if (notionTab) {
                statusDiv = document.createElement('div');
                statusDiv.id = 'validation-result';
                notionTab.insertAdjacentHTML('afterbegin', '<div id="validation-result"></div>');
                statusDiv = document.getElementById('validation-result');
            }
        }
        
        if (statusDiv) {
            statusDiv.innerHTML = `
                <div class="alert alert-success alert-dismissible fade show" role="alert">
                    <div class="d-flex">
                        <div>
                            <svg xmlns="http://www.w3.org/2000/svg" class="icon alert-icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                <path d="M5 12l5 5l10 -10"></path>
                            </svg>
                        </div>
                        <div class="ms-3">
                            ${message}
                        </div>
                    </div>
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>
            `;
        }
    }
    
    /**
     * Afficher un message d'avertissement
     */
    showWarning(message) {
        console.warn('⚠️', message);
        
        let statusDiv = document.getElementById('validation-result');
        if (!statusDiv) {
            const notionTab = document.getElementById('tabs-notion');
            if (notionTab) {
                statusDiv = document.createElement('div');
                statusDiv.id = 'validation-result';
                notionTab.insertAdjacentHTML('afterbegin', '<div id="validation-result"></div>');
                statusDiv = document.getElementById('validation-result');
            }
        }
        
        if (statusDiv) {
            statusDiv.innerHTML = `
                <div class="alert alert-warning alert-dismissible fade show" role="alert">
                    <div class="d-flex">
                        <div>
                            <svg xmlns="http://www.w3.org/2000/svg" class="icon alert-icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                <path d="M10.24 3.957l-8.422 14.06a1.989 1.989 0 0 0 1.7 2.983h16.845a1.989 1.989 0 0 0 1.7 -2.983l-8.423 -14.06a1.989 1.989 0 0 0 -3.4 0z"></path>
                                <path d="M12 9v4"></path>
                                <path d="M12 17h.01"></path>
                            </svg>
                        </div>
                        <div class="ms-3">
                            ${message}
                        </div>
                    </div>
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>
            `;
        }
    }
    
    /**
     * Afficher un message d'erreur
     */
    showError(message) {
        console.error('❌', message);
        
        let statusDiv = document.getElementById('validation-result');
        if (!statusDiv) {
            const notionTab = document.getElementById('tabs-notion');
            if (notionTab) {
                statusDiv = document.createElement('div');
                statusDiv.id = 'validation-result';
                notionTab.insertAdjacentHTML('afterbegin', '<div id="validation-result"></div>');
                statusDiv = document.getElementById('validation-result');
            }
        }
        
        if (statusDiv) {
            statusDiv.innerHTML = `
                <div class="alert alert-danger alert-dismissible fade show" role="alert">
                    <div class="d-flex">
                        <div>
                            <svg xmlns="http://www.w3.org/2000/svg" class="icon alert-icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                <path d="M10.24 3.957l-8.422 14.06a1.989 1.989 0 0 0 1.7 2.983h16.845a1.989 1.989 0 0 0 1.7 -2.983l-8.423 -14.06a1.989 1.989 0 0 0 -3.4 0z"></path>
                                <path d="M12 9v4"></path>
                                <path d="M12 17h.01"></path>
                            </svg>
                        </div>
                        <div class="ms-3">
                            ${message}
                        </div>
                    </div>
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>
            `;
        }
    }
    
    /**
     * Réessayer avec un modèle différent
     */
    async retryWithDifferentModel() {
        if (!this.currentFile) return;
        
        // Changer temporairement le modèle
        const originalModel = this.ocrVision.model;
        this.ocrVision.model = 'gpt-4o'; // Utiliser le modèle le plus précis
        
        this.showAlert('info', 'Nouvelle analyse avec GPT-4o en cours...');
        
        try {
            await this.handleFileUpload(this.currentFile);
        } finally {
            // Restaurer le modèle original
            this.ocrVision.model = originalModel;
        }
    }
    
    /**
     * Sauvegarder les paramètres
     */
    saveSettings() {
        const apiKeyInput = document.getElementById('api-key-input');
        const notionApiKeyInput = document.getElementById('notion-api-key-input');
        const modelSelect = document.getElementById('default-model');
        
        if (apiKeyInput.value) {
            localStorage.setItem('openai_api_key', apiKeyInput.value);
            this.ocrVision.apiKey = apiKeyInput.value;
        }
        
        if (notionApiKeyInput.value) {
            localStorage.setItem('notion_api_key', notionApiKeyInput.value);
            this.notionIntegration.apiKey = notionApiKeyInput.value;
        }
        
        if (modelSelect.value) {
            localStorage.setItem('openai_model', modelSelect.value);
            this.ocrVision.model = modelSelect.value;
            
            // Mettre à jour le badge
            const modelBadge = document.getElementById('model-badge');
            if (modelBadge) {
                modelBadge.textContent = modelSelect.value;
            }
        }
        
        // Fermer la modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('settings-modal'));
        modal.hide();
        
        // Réinitialiser les services
        Promise.all([
            this.ocrVision.init(),
            this.notionIntegration.init()
        ]).then(() => {
            this.showAlert('success', 'Paramètres sauvegardés avec succès!');
        }).catch(error => {
            this.showAlert('error', `Erreur: ${error.message}`);
        });
    }
    
    /**
     * Charger les paramètres au démarrage
     */
    loadSettings() {
        const apiKey = localStorage.getItem('openai_api_key');
        const notionApiKey = localStorage.getItem('notion_api_key');
        const model = localStorage.getItem('openai_model') || 'gpt-4o-mini';
        
        const apiKeyInput = document.getElementById('api-key-input');
        const notionApiKeyInput = document.getElementById('notion-api-key-input');
        const modelSelect = document.getElementById('default-model');
        const modelBadge = document.getElementById('model-badge');
        
        if (apiKeyInput && apiKey) {
            apiKeyInput.value = apiKey;
        }
        
        if (notionApiKeyInput && notionApiKey) {
            notionApiKeyInput.value = notionApiKey;
        }
        
        if (modelSelect) {
            modelSelect.value = model;
        }
        
        if (modelBadge) {
            modelBadge.textContent = model;
        }
    }
}

// Initialisation globale
document.addEventListener('DOMContentLoaded', () => {
    window.ocrInterface = new OCRInterfaceFinal();
    
    // Charger les paramètres
    window.ocrInterface.loadSettings();
});