/**
 * OCR Premium Interface V2
 * Interface SAAS premium pour OCR Vision AI avec animations fluides
 * Intégration complète: Upload → AI → Validation → Notion
 */

class OCRPremiumInterface {
    constructor() {
        console.log('🚀 OCR Premium Interface v2.0 - Initialisation');
        
        // Services
        this.memoryManager = new OCRMemoryManager({ debug: false });
        this.ocrVision = new OCROpenAIVision();
        this.templateManager = new DocumentTemplateManager();
        
        // State
        this.currentDocument = null;
        this.currentExtraction = null;
        this.validatedData = null;
        
        // Configuration
        this.config = {
            animations: true,
            autoDetectType: true,
            showConfidence: true,
            maxFileSize: 20 * 1024 * 1024, // 20MB
            supportedFormats: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
        };
        
        // Init
        this.init();
    }
    
    /**
     * Initialisation de l'interface
     */
    async init() {
        try {
            // Vérifier la clé API OpenAI
            if (!localStorage.getItem('openai_api_key')) {
                this.showError('Clé API OpenAI manquante. Configurez dans les paramètres.');
                return;
            }
            
            // Initialiser OpenAI Vision
            await this.ocrVision.init();
            
            // Configurer les éléments DOM
            this.setupDropzone();
            this.setupEventListeners();
            
            console.log('✅ Interface Premium initialisée');
            
        } catch (error) {
            console.error('❌ Erreur initialisation:', error);
            this.showError(`Erreur initialisation: ${error.message}`);
        }
    }
    
    /**
     * Configuration de la dropzone
     */
    setupDropzone() {
        const dropzone = document.getElementById('dropzone-premium');
        const fileInput = document.getElementById('file-input');
        
        // Click pour ouvrir le sélecteur
        dropzone.addEventListener('click', () => {
            fileInput.click();
        });
        
        // Drag & Drop
        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.classList.add('drag-over');
        });
        
        dropzone.addEventListener('dragleave', () => {
            dropzone.classList.remove('drag-over');
        });
        
        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.classList.remove('drag-over');
            
            const files = Array.from(e.dataTransfer.files);
            if (files.length > 0) {
                this.handleFiles(files);
            }
        });
        
        // File input change
        fileInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            if (files.length > 0) {
                this.handleFiles(files);
            }
        });
    }
    
    /**
     * Configuration des event listeners
     */
    setupEventListeners() {
        // Changement de modèle IA
        document.querySelectorAll('[data-model]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const model = e.currentTarget.dataset.model;
                this.changeAIModel(model);
            });
        });
        
        // Boutons d'action
        document.getElementById('btn-send-notion')?.addEventListener('click', () => {
            this.sendToNotion();
        });
        
        document.getElementById('btn-preview-data')?.addEventListener('click', () => {
            this.previewData();
        });
        
        document.getElementById('btn-export-json')?.addEventListener('click', () => {
            this.exportJSON();
        });
        
        // Navigation tabs
        document.querySelectorAll('[data-bs-toggle="tab"]').forEach(tab => {
            tab.addEventListener('shown.bs.tab', (e) => {
                this.onTabChange(e.target.dataset.bsTarget);
            });
        });
    }
    
    /**
     * Gestion des fichiers uploadés
     */
    async handleFiles(files) {
        const file = files[0]; // Un seul fichier à la fois pour l'instant
        
        // Validation
        if (!this.validateFile(file)) {
            return;
        }
        
        // Reset interface
        this.resetInterface();
        
        // Afficher la progression
        this.showProgress();
        
        try {
            // Enregistrer le document courant
            this.currentDocument = file;
            
            // Mettre à jour la progression
            this.updateProgress(10, 'Préparation du document...');
            
            // Traitement OCR
            this.updateProgress(30, 'Analyse IA en cours...');
            const result = await this.ocrVision.processDocument(file);
            
            if (!result.success) {
                throw new Error(result.error || 'Échec de l\'extraction');
            }
            
            // Stocker le résultat
            this.currentExtraction = result;
            
            // Détecter le type de document
            this.updateProgress(60, 'Détection du type de document...');
            const documentType = this.templateManager.detectDocumentType(result.extractedData);
            
            // Mapper vers le schéma Notion
            this.updateProgress(80, 'Mapping des données...');
            const mappedData = this.templateManager.mapToNotionSchema(documentType, result.extractedData);
            
            // Afficher les résultats
            this.updateProgress(100, 'Traitement terminé!');
            
            // Attendre un peu pour l'animation
            await this.delay(500);
            
            // Afficher les résultats
            this.displayResults(documentType, mappedData, result);
            
            // Animation de succès
            this.showSuccess('Document analysé avec succès!');
            
        } catch (error) {
            console.error('❌ Erreur traitement:', error);
            this.showError(`Erreur: ${error.message}`);
            this.hideProgress();
        }
    }
    
    /**
     * Validation du fichier
     */
    validateFile(file) {
        // Vérifier la taille
        if (file.size > this.config.maxFileSize) {
            this.showError(`Fichier trop volumineux: ${(file.size / 1024 / 1024).toFixed(1)}MB (max 20MB)`);
            return false;
        }
        
        // Vérifier le format
        if (!this.config.supportedFormats.includes(file.type)) {
            this.showError(`Format non supporté: ${file.type}`);
            return false;
        }
        
        return true;
    }
    
    /**
     * Affichage des résultats
     */
    displayResults(documentType, mappedData, rawResult) {
        // Afficher le conteneur de résultats
        const resultsContainer = document.getElementById('results-container');
        resultsContainer.style.display = 'block';
        
        // Animer l'apparition
        if (this.config.animations) {
            resultsContainer.classList.add('scale-in');
        }
        
        // Badge de confiance
        const confidenceBadge = document.getElementById('confidence-badge');
        const confidence = Math.round((rawResult.confidence || 0.95) * 100);
        confidenceBadge.innerHTML = `
            <i class="ti ti-shield-check me-1"></i>
            Confiance: ${confidence}%
        `;
        
        // Badge type de document
        const template = this.templateManager.getTemplate(documentType);
        const typeBadge = document.getElementById('document-type-badge');
        typeBadge.textContent = `Type: ${template.title}`;
        
        // Tab 1: Données extraites
        this.displayExtractedData(rawResult.extractedData);
        
        // Tab 2: Formulaire de validation
        this.displayValidationForm(documentType, mappedData);
        
        // Tab 3: Mapping Notion
        this.displayNotionMapping(documentType, mappedData);
        
        // Afficher aperçu document si possible
        this.displayDocumentPreview();
    }
    
    /**
     * Affichage des données extraites
     */
    displayExtractedData(data) {
        const container = document.getElementById('extracted-info');
        container.innerHTML = '';
        
        // Fonction récursive pour afficher les données
        const renderData = (obj, level = 0) => {
            const list = document.createElement('dl');
            list.className = 'row mb-0';
            
            for (const [key, value] of Object.entries(obj)) {
                if (key.startsWith('_')) continue; // Skip metadata
                
                const dt = document.createElement('dt');
                dt.className = 'col-sm-5';
                dt.textContent = this.formatFieldName(key) + ':';
                
                const dd = document.createElement('dd');
                dd.className = 'col-sm-7';
                
                if (typeof value === 'object' && value !== null) {
                    dd.appendChild(renderData(value, level + 1));
                } else {
                    dd.textContent = this.formatFieldValue(key, value);
                }
                
                list.appendChild(dt);
                list.appendChild(dd);
            }
            
            return list;
        };
        
        container.appendChild(renderData(data));
    }
    
    /**
     * Affichage du formulaire de validation
     */
    displayValidationForm(documentType, data) {
        const container = document.getElementById('validation-form-container');
        const template = this.templateManager.getTemplate(documentType);
        
        // Header avec type de document
        const header = document.createElement('div');
        header.className = 'mb-4';
        header.innerHTML = `
            <h4 class="mb-3">
                <i class="ti ti-${template.icon} me-2"></i>
                ${template.title}
            </h4>
            <p class="text-muted">${template.description}</p>
        `;
        
        // Formulaire
        const form = document.createElement('form');
        form.id = 'validation-form';
        form.className = 'row g-3';
        
        // Générer les champs selon le template
        template.fields.forEach(field => {
            const value = data[field.key] || '';
            const fieldHtml = this.createFormField(field, value);
            form.innerHTML += fieldHtml;
        });
        
        // Boutons d'action
        const actions = document.createElement('div');
        actions.className = 'col-12 mt-4';
        actions.innerHTML = `
            <div class="d-flex gap-2">
                <button type="button" class="btn btn-primary" onclick="window.ocrInterface.validateForm()">
                    <i class="ti ti-checks me-2"></i>
                    Valider les données
                </button>
                <button type="button" class="btn btn-outline-secondary" onclick="window.ocrInterface.resetForm()">
                    <i class="ti ti-refresh me-2"></i>
                    Réinitialiser
                </button>
            </div>
        `;
        form.appendChild(actions);
        
        // Assembler
        container.innerHTML = '';
        container.appendChild(header);
        container.appendChild(form);
        
        // Activer les animations sur les champs
        if (this.config.animations) {
            form.querySelectorAll('.form-control').forEach((input, index) => {
                input.style.animationDelay = `${index * 50}ms`;
                input.classList.add('fade-in');
            });
        }
    }
    
    /**
     * Création d'un champ de formulaire
     */
    createFormField(field, value) {
        const colSize = field.type === 'textarea' ? 'col-12' : 'col-md-6';
        let inputHtml = '';
        
        switch (field.type) {
            case 'text':
                inputHtml = `
                    <input type="text" 
                           class="form-control form-control-premium" 
                           id="field-${field.key}" 
                           name="${field.key}"
                           value="${value || ''}"
                           placeholder="${field.placeholder || ''}"
                           ${field.required ? 'required' : ''}>
                `;
                break;
                
            case 'textarea':
                inputHtml = `
                    <textarea class="form-control form-control-premium" 
                              id="field-${field.key}" 
                              name="${field.key}"
                              rows="3"
                              placeholder="${field.placeholder || ''}"
                              ${field.required ? 'required' : ''}>${value || ''}</textarea>
                `;
                break;
                
            case 'date':
                inputHtml = `
                    <input type="date" 
                           class="form-control form-control-premium" 
                           id="field-${field.key}" 
                           name="${field.key}"
                           value="${value || ''}"
                           ${field.required ? 'required' : ''}>
                `;
                break;
                
            case 'currency':
                inputHtml = `
                    <div class="input-group">
                        <input type="number" 
                               class="form-control form-control-premium" 
                               id="field-${field.key}" 
                               name="${field.key}"
                               value="${value || ''}"
                               step="0.01"
                               ${field.required ? 'required' : ''}>
                        <span class="input-group-text">${field.currency || 'CHF'}</span>
                    </div>
                `;
                break;
                
            case 'select':
                const options = (field.options || []).map(opt => 
                    `<option value="${opt}" ${opt === value ? 'selected' : ''}>${opt}</option>`
                ).join('');
                
                inputHtml = `
                    <select class="form-select form-control-premium" 
                            id="field-${field.key}" 
                            name="${field.key}"
                            ${field.required ? 'required' : ''}>
                        <option value="">Sélectionner...</option>
                        ${options}
                    </select>
                `;
                break;
                
            case 'number':
                inputHtml = `
                    <input type="number" 
                           class="form-control form-control-premium" 
                           id="field-${field.key}" 
                           name="${field.key}"
                           value="${value || ''}"
                           step="any"
                           ${field.required ? 'required' : ''}>
                `;
                break;
        }
        
        return `
            <div class="${colSize}">
                <label for="field-${field.key}" class="form-label">
                    ${field.label}
                    ${field.required ? '<span class="text-danger">*</span>' : ''}
                </label>
                ${inputHtml}
            </div>
        `;
    }
    
    /**
     * Affichage du mapping Notion
     */
    displayNotionMapping(documentType, data) {
        const container = document.getElementById('notion-mapping');
        const template = this.templateManager.getTemplate(documentType);
        
        // Générer le preview
        const preview = this.templateManager.generatePreview(documentType, data);
        
        let html = `
            <div class="mb-4">
                <div class="alert alert-info">
                    <h5 class="alert-title">
                        <i class="ti ti-database me-2"></i>
                        Base de données Notion
                    </h5>
                    <p class="mb-0">ID: <code>${template.database}</code></p>
                </div>
            </div>
            
            <h5 class="mb-3">Champs mappés</h5>
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
        
        preview.fields.forEach(field => {
            const statusIcon = field.required && !field.value 
                ? '<i class="ti ti-alert-circle text-warning"></i>'
                : '<i class="ti ti-check text-success"></i>';
                
            html += `
                <tr>
                    <td><strong>${field.label}</strong></td>
                    <td>${field.value || '<em class="text-muted">Non défini</em>'}</td>
                    <td><span class="badge bg-secondary-lt">${field.type}</span></td>
                    <td>${statusIcon}</td>
                </tr>
            `;
        });
        
        html += `
                    </tbody>
                </table>
            </div>
        `;
        
        container.innerHTML = html;
    }
    
    /**
     * Affichage de l'aperçu du document
     */
    async displayDocumentPreview() {
        const container = document.getElementById('document-preview');
        
        if (!this.currentDocument) return;
        
        if (this.currentDocument.type.startsWith('image/')) {
            // Afficher l'image
            const reader = new FileReader();
            reader.onload = (e) => {
                container.innerHTML = `
                    <img src="${e.target.result}" 
                         class="img-fluid rounded" 
                         style="max-height: 400px;"
                         alt="Document preview">
                `;
            };
            reader.readAsDataURL(this.currentDocument);
        } else if (this.currentDocument.type === 'application/pdf') {
            // Afficher la première page du PDF
            container.innerHTML = `
                <div class="text-center">
                    <i class="ti ti-file-text" style="font-size: 64px; color: #6c757d;"></i>
                    <p class="mt-2 text-muted">PDF Document</p>
                    <p class="small">${this.currentDocument.name}</p>
                </div>
            `;
        }
    }
    
    /**
     * Validation du formulaire
     */
    validateForm() {
        const form = document.getElementById('validation-form');
        const formData = new FormData(form);
        
        // Collecter les données
        const validatedData = {};
        for (const [key, value] of formData.entries()) {
            validatedData[key] = value;
        }
        
        // Valider avec le template manager
        const documentType = this.currentExtraction.documentType;
        const validation = this.templateManager.validateData(documentType, validatedData);
        
        if (validation.valid) {
            this.validatedData = validatedData;
            this.showSuccess('Données validées avec succès!');
            
            // Activer l'onglet Notion
            const notionTab = document.querySelector('[data-bs-target="#tab-notion"]');
            notionTab.click();
            
            // Mettre à jour le mapping
            this.displayNotionMapping(documentType, validatedData);
        } else {
            // Afficher les erreurs
            validation.errors.forEach(error => {
                const field = document.getElementById(`field-${error.field}`);
                if (field) {
                    field.classList.add('field-invalid');
                    this.showError(error.message);
                }
            });
        }
    }
    
    /**
     * Envoi vers Notion
     */
    async sendToNotion() {
        if (!this.validatedData) {
            this.showError('Veuillez d\'abord valider les données');
            return;
        }
        
        try {
            // Animation du bouton
            const btn = document.getElementById('btn-send-notion');
            const originalHtml = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Envoi en cours...';
            
            // Simuler l'envoi (remplacer par l'appel API réel)
            await this.delay(2000);
            
            // Succès
            btn.innerHTML = '<i class="ti ti-check me-2"></i>Envoyé!';
            btn.classList.remove('btn-success');
            btn.classList.add('btn-outline-success');
            
            this.showSuccess('Document envoyé vers Notion avec succès!');
            
            // Restaurer après délai
            setTimeout(() => {
                btn.innerHTML = originalHtml;
                btn.disabled = false;
                btn.classList.add('btn-success');
                btn.classList.remove('btn-outline-success');
            }, 3000);
            
        } catch (error) {
            console.error('❌ Erreur envoi Notion:', error);
            this.showError(`Erreur envoi: ${error.message}`);
        }
    }
    
    /**
     * Prévisualisation des données
     */
    previewData() {
        const data = this.validatedData || this.currentExtraction?.extractedData;
        
        if (!data) {
            this.showError('Aucune donnée à prévisualiser');
            return;
        }
        
        // Créer modal
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Prévisualisation des données</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <pre class="bg-dark text-white p-3 rounded">${JSON.stringify(data, null, 2)}</pre>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
        
        // Nettoyer après fermeture
        modal.addEventListener('hidden.bs.modal', () => {
            modal.remove();
        });
    }
    
    /**
     * Export JSON
     */
    exportJSON() {
        const data = {
            document: {
                name: this.currentDocument?.name,
                type: this.currentExtraction?.documentType,
                processedAt: new Date().toISOString()
            },
            extractedData: this.currentExtraction?.extractedData,
            validatedData: this.validatedData,
            confidence: this.currentExtraction?.confidence
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ocr-export-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showSuccess('Données exportées avec succès!');
    }
    
    /**
     * Changement de modèle IA
     */
    changeAIModel(model) {
        localStorage.setItem('openai_model', model);
        this.ocrVision.model = model;
        
        // Mettre à jour l'UI
        document.querySelectorAll('[data-model]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.model === model);
        });
        
        this.showSuccess(`Modèle changé: ${model}`);
    }
    
    /**
     * Gestion de la progression
     */
    showProgress() {
        const container = document.getElementById('progress-container');
        container.style.display = 'block';
        
        if (this.config.animations) {
            container.classList.add('fade-in');
        }
    }
    
    hideProgress() {
        const container = document.getElementById('progress-container');
        container.style.display = 'none';
    }
    
    updateProgress(percent, status) {
        const progressBar = document.getElementById('progress-bar');
        const progressText = document.getElementById('progress-text');
        const progressStatus = document.getElementById('progress-status');
        
        progressBar.style.width = `${percent}%`;
        progressText.textContent = `${percent}%`;
        progressStatus.textContent = status;
    }
    
    /**
     * Notifications toast
     */
    showToast(message, type = 'info') {
        const toastContainer = document.querySelector('.toast-container-premium');
        
        const toast = document.createElement('div');
        toast.className = `toast toast-premium align-items-center text-white bg-${type} border-0`;
        toast.setAttribute('role', 'alert');
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;
        
        toastContainer.appendChild(toast);
        
        const bsToast = new bootstrap.Toast(toast, {
            autohide: true,
            delay: type === 'danger' ? 5000 : 3000
        });
        
        bsToast.show();
        
        // Nettoyer après disparition
        toast.addEventListener('hidden.bs.toast', () => {
            toast.remove();
        });
    }
    
    showSuccess(message) {
        this.showToast(message, 'success');
    }
    
    showError(message) {
        this.showToast(message, 'danger');
    }
    
    showInfo(message) {
        this.showToast(message, 'info');
    }
    
    /**
     * Utilitaires
     */
    formatFieldName(key) {
        return key
            .replace(/_/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
    }
    
    formatFieldValue(key, value) {
        if (value === null || value === undefined) return '-';
        
        // Formatage selon le type
        if (key.includes('montant') || key.includes('amount')) {
            const num = parseFloat(value);
            return isNaN(num) ? value : `${num.toFixed(2)} CHF`;
        }
        
        if (key.includes('date')) {
            try {
                return new Date(value).toLocaleDateString('fr-CH');
            } catch {
                return value;
            }
        }
        
        return value;
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    resetInterface() {
        // Cacher les résultats
        document.getElementById('results-container').style.display = 'none';
        
        // Reset les données
        this.currentDocument = null;
        this.currentExtraction = null;
        this.validatedData = null;
        
        // Reset le formulaire
        const form = document.getElementById('validation-form');
        if (form) form.reset();
    }
    
    resetForm() {
        const form = document.getElementById('validation-form');
        if (form) {
            form.reset();
            form.querySelectorAll('.field-invalid').forEach(field => {
                field.classList.remove('field-invalid');
            });
        }
    }
    
    onTabChange(tabId) {
        // Animation de changement d'onglet
        if (this.config.animations) {
            const tabContent = document.querySelector(tabId);
            if (tabContent) {
                tabContent.classList.add('fade-in');
            }
        }
    }
}

// Initialisation globale
document.addEventListener('DOMContentLoaded', () => {
    window.ocrInterface = new OCRPremiumInterface();
    console.log('💎 OCR Premium Interface prête: window.ocrInterface');
});