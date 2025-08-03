/**
 * OCR Clean Interface v1.0 - Tabler.io Native
 * Interface épurée pour traitement OCR avec détection client
 */
class OCRCleanInterface {
    constructor() {
        this.processor = null;
        this.currentFile = null;
        this.currentResult = null;
        
        this.initElements();
        this.attachEvents();
        this.initProcessor();
        
        console.log('🎨 OCR Clean Interface v1.0 initialisée - Détection client activée');
    }
    
    initElements() {
        this.el = {
            // Upload
            dropzone: document.getElementById('dropzone'),
            fileInput: document.getElementById('fileInput'),
            progressBar: document.getElementById('progressBar'),
            statusArea: document.getElementById('statusArea'),
            
            // Résultats
            resultsSection: document.getElementById('resultsSection'),
            clientField: document.getElementById('clientField'),
            clientHint: document.getElementById('clientHint'),
            companyField: document.getElementById('companyField'),
            numberField: document.getElementById('numberField'),
            dateField: document.getElementById('dateField'),
            clientAddressField: document.getElementById('clientAddressField'),
            amountField: document.getElementById('amountField'),
            currencySpan: document.getElementById('currencySpan'),
            vatField: document.getElementById('vatField'),
            vatStatusBadge: document.getElementById('vatStatusBadge'),
            confidenceBadge: document.getElementById('confidenceBadge'),
            
            // Actions
            editBtn: document.getElementById('editBtn'),
            saveBtn: document.getElementById('saveBtn')
        };
    }
    
    attachEvents() {
        // Drag & Drop
        this.el.dropzone.addEventListener('dragover', this.onDragOver.bind(this));
        this.el.dropzone.addEventListener('dragleave', this.onDragLeave.bind(this));
        this.el.dropzone.addEventListener('drop', this.onDrop.bind(this));
        this.el.dropzone.addEventListener('click', () => this.el.fileInput.click());
        
        // File selection
        this.el.fileInput.addEventListener('change', this.onFileSelect.bind(this));
        
        // Actions
        this.el.editBtn.addEventListener('click', this.enableEditing.bind(this));
        this.el.saveBtn.addEventListener('click', this.saveDocument.bind(this));
    }
    
    async initProcessor() {
        try {
            this.processor = new OCRHybridProcessor();
            await this.processor.init();
            console.log('✅ Processeur OCR initialisé avec détection client');
            
            // Vérifier si clé OpenAI disponible
            if (!localStorage.getItem('openai_api_key')) {
                this.showWarning('Clé OpenAI non configurée. Utilisation du mode basique uniquement.');
            }
        } catch (error) {
            console.error('❌ Erreur init OCR:', error);
            this.showError('Impossible d\'initialiser le système OCR');
        }
    }
    
    // === Event Handlers ===
    
    onDragOver(e) {
        e.preventDefault();
        this.el.dropzone.classList.add('dragover');
    }
    
    onDragLeave(e) {
        e.preventDefault();
        this.el.dropzone.classList.remove('dragover');
    }
    
    onDrop(e) {
        e.preventDefault();
        this.el.dropzone.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }
    
    onFileSelect(e) {
        if (e.target.files.length > 0) {
            this.processFile(e.target.files[0]);
        }
    }
    
    // === File Processing ===
    
    async processFile(file) {
        if (!this.validateFile(file)) return;
        
        this.currentFile = file;
        
        try {
            this.showProgress(`Analyse de ${file.name}...`);
            
            // Traitement OCR avec détection client
            const result = await this.processor.processDocument(file);
            
            this.hideProgress();
            
            if (result.success) {
                this.displayResults(result.data);
                this.validateClientDetection(result.data);
                
                // Afficher infos de traitement
                this.showInfo(`Document traité avec ${result.source} (${Math.round(result.confidence * 100)}% de confiance)`);
            } else {
                this.showError(`Erreur: ${result.error}`);
            }
            
        } catch (error) {
            console.error('❌ Erreur traitement:', error);
            this.hideProgress();
            this.showError('Erreur lors du traitement du document');
        }
    }
    
    validateFile(file) {
        const validTypes = ['application/pdf', 'image/png', 'image/jpeg'];
        const maxSize = 10 * 1024 * 1024; // 10MB
        
        if (!validTypes.includes(file.type)) {
            this.showError('Format non supporté. Utilisez PDF, PNG ou JPG.');
            return false;
        }
        
        if (file.size > maxSize) {
            this.showError('Fichier trop volumineux (max 10MB).');
            return false;
        }
        
        return true;
    }
    
    // === Results Display ===
    
    displayResults(data) {
        this.currentResult = data;
        
        // CLIENT EN PRIORITÉ
        this.el.clientField.value = data.client || 'CLIENT NON DÉTECTÉ';
        this.el.clientField.classList.remove('is-valid', 'is-invalid');
        
        if (data.client && data.client !== 'CLIENT NON DÉTECTÉ') {
            this.el.clientField.classList.add('is-valid');
            this.el.clientHint.textContent = data.clientAddress || 'Adresse client';
            this.el.clientHint.className = 'form-hint text-success';
        } else {
            this.el.clientField.classList.add('is-invalid');
            this.el.clientHint.textContent = '⚠️ Client non détecté - Vérification manuelle requise';
            this.el.clientHint.className = 'form-hint text-danger';
        }
        
        // Autres champs
        this.el.companyField.value = data.entite || data.company || 'HYPERVISUAL';
        this.el.numberField.value = data.numero || data.number || '';
        this.el.dateField.value = this.formatDate(data.date);
        this.el.clientAddressField.value = data.clientAddress || '';
        
        // Montants et devise
        const amount = data.montant_ttc || data.amount || '';
        this.el.amountField.value = this.formatAmount(amount);
        this.el.currencySpan.textContent = data.devise || data.currency || 'CHF';
        
        // TVA
        const vatRate = data.taux_tva || data.vatRate || 0;
        this.el.vatField.value = `${vatRate}%`;
        
        // Badge TVA avec style selon statut
        const vatStatus = data.vat_status || data.vatStatus || 'ttc';
        this.el.vatStatusBadge.textContent = this.getVatStatusLabel(vatStatus);
        this.el.vatStatusBadge.className = `input-group-text ${this.getVatStatusClass(vatStatus)}`;
        
        // Badge confiance
        const confidence = Math.round((data.confidence || 0.75) * 100);
        this.el.confidenceBadge.innerHTML = `<i class="ti ti-brain me-1"></i>${confidence}%`;
        this.el.confidenceBadge.className = `badge ${
            confidence > 90 ? 'bg-success' : 
            confidence > 75 ? 'bg-primary' : 'bg-warning'
        }`;
        
        // Afficher résultats
        this.el.resultsSection.classList.add('show');
    }
    
    validateClientDetection(data) {
        const warnings = [];
        
        if (!data.client || data.client === 'CLIENT NON DÉTECTÉ') {
            warnings.push('Client non détecté - Vérification manuelle requise');
        }
        
        if (!data.clientAddress) {
            warnings.push('Adresse client non trouvée');
        }
        
        if (data.numero && (data.numero.includes('AN-00087') || data.numero.includes('AN-00094'))) {
            // Documents de test spécifiques
            if (data.numero.includes('AN-00087') && data.client !== 'PUBLIGRAMA ADVERTISING S.L.') {
                warnings.push(`Document AN-00087: Client attendu "PUBLIGRAMA ADVERTISING S.L.", trouvé "${data.client}"`);
            }
            if (data.numero.includes('AN-00094') && data.client !== 'PROMIDEA SRL') {
                warnings.push(`Document AN-00094: Client attendu "PROMIDEA SRL", trouvé "${data.client}"`);
            }
        }
        
        if (warnings.length > 0) {
            this.showWarnings(warnings);
        }
    }
    
    // === Formatting Helpers ===
    
    formatDate(date) {
        if (!date) return '';
        try {
            const d = new Date(date);
            return d.toISOString().split('T')[0];
        } catch (e) {
            return date;
        }
    }
    
    formatAmount(amount) {
        if (!amount) return '';
        // Format suisse avec apostrophe
        return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'");
    }
    
    getVatStatusLabel(status) {
        const labels = {
            'hors_tva': 'Hors TVA',
            'ttc': 'TTC',
            'non_applicable': 'N/A'
        };
        return labels[status] || status;
    }
    
    getVatStatusClass(status) {
        const classes = {
            'hors_tva': 'bg-info text-white',
            'ttc': 'bg-success text-white',
            'non_applicable': 'bg-secondary text-white'
        };
        return classes[status] || '';
    }
    
    // === UI States ===
    
    showProgress(message) {
        this.el.progressBar.classList.remove('d-none');
        this.el.statusArea.innerHTML = `
            <div class="alert alert-info">
                <div class="d-flex align-items-center">
                    <div class="spinner-border spinner-border-sm me-3"></div>
                    ${message}
                </div>
            </div>
        `;
    }
    
    hideProgress() {
        this.el.progressBar.classList.add('d-none');
        this.el.statusArea.innerHTML = '';
    }
    
    showError(message) {
        this.el.statusArea.innerHTML = `
            <div class="alert alert-danger alert-dismissible">
                <div class="d-flex">
                    <div>
                        <i class="ti ti-alert-circle me-2"></i>
                        ${message}
                    </div>
                </div>
                <a class="btn-close" data-bs-dismiss="alert" aria-label="close"></a>
            </div>
        `;
    }
    
    showWarning(message) {
        this.el.statusArea.innerHTML = `
            <div class="alert alert-warning alert-dismissible">
                <div class="d-flex">
                    <div>
                        <i class="ti ti-alert-triangle me-2"></i>
                        ${message}
                    </div>
                </div>
                <a class="btn-close" data-bs-dismiss="alert" aria-label="close"></a>
            </div>
        `;
    }
    
    showWarnings(warnings) {
        const html = warnings.map(w => `<li>${w}</li>`).join('');
        this.el.statusArea.innerHTML = `
            <div class="alert alert-warning">
                <h4 class="alert-title">
                    <i class="ti ti-alert-triangle me-2"></i>
                    Vérifications requises
                </h4>
                <ul class="mb-0">${html}</ul>
            </div>
        `;
    }
    
    showSuccess(message) {
        this.el.statusArea.innerHTML = `
            <div class="alert alert-success alert-dismissible">
                <div class="d-flex">
                    <div>
                        <i class="ti ti-check me-2"></i>
                        ${message}
                    </div>
                </div>
                <a class="btn-close" data-bs-dismiss="alert" aria-label="close"></a>
            </div>
        `;
    }
    
    showInfo(message) {
        this.el.statusArea.innerHTML = `
            <div class="alert alert-info alert-dismissible">
                <div class="d-flex">
                    <div>
                        <i class="ti ti-info-circle me-2"></i>
                        ${message}
                    </div>
                </div>
                <a class="btn-close" data-bs-dismiss="alert" aria-label="close"></a>
            </div>
        `;
    }
    
    // === Actions ===
    
    enableEditing() {
        const editableFields = [
            this.el.clientField, this.el.companyField, this.el.numberField,
            this.el.dateField, this.el.clientAddressField, this.el.amountField
        ];
        
        editableFields.forEach(field => {
            field.readOnly = false;
            field.classList.add('border-warning');
        });
        
        this.el.editBtn.innerHTML = '<i class="ti ti-lock-open me-2"></i>Mode édition';
        this.el.editBtn.disabled = true;
        
        this.showInfo('Mode édition activé. Vous pouvez maintenant corriger les données.');
    }
    
    async saveDocument() {
        if (!this.currentResult) return;
        
        try {
            // Récupérer données des champs
            const data = {
                ...this.currentResult,
                client: this.el.clientField.value,
                company: this.el.companyField.value,
                numero: this.el.numberField.value,
                date: this.el.dateField.value,
                clientAddress: this.el.clientAddressField.value,
                montant_ttc: this.el.amountField.value.replace(/'/g, '')
            };
            
            // Validation avant sauvegarde
            if (!data.client || data.client === 'CLIENT NON DÉTECTÉ') {
                this.showError('Client obligatoire avant sauvegarde. Veuillez corriger le champ client.');
                this.el.clientField.focus();
                return;
            }
            
            this.showProgress('Sauvegarde en cours...');
            
            // Appel API sauvegarde
            await this.saveToNotion(data);
            
            this.hideProgress();
            this.showSuccess('Document enregistré avec succès dans Notion !');
            
            // Auto-reset après 3s
            setTimeout(() => {
                if (confirm('Document sauvegardé. Voulez-vous traiter un nouveau document ?')) {
                    this.resetInterface();
                }
            }, 1500);
            
        } catch (error) {
            console.error('❌ Erreur sauvegarde:', error);
            this.hideProgress();
            this.showError('Erreur lors de la sauvegarde: ' + error.message);
        }
    }
    
    async saveToNotion(data) {
        // Appel API pour sauvegarder dans Notion
        console.log('💾 Sauvegarde Notion:', data);
        
        // Simulation API - TODO: Implémenter appel réel
        const response = await fetch('/api/ocr/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: data.type || 'facture_client',
                entity: data.entite || 'hypervisual',
                client: data.client,
                clientAddress: data.clientAddress,
                clientCountry: data.clientCountry,
                documentNumber: data.numero,
                date: data.date,
                amount: data.montant_ttc,
                currency: data.devise,
                vatStatus: data.vat_status,
                vatRate: data.taux_tva,
                confidence: data.confidence
            })
        });
        
        if (!response.ok) {
            throw new Error('Échec de la sauvegarde');
        }
        
        return response.json();
    }
    
    resetInterface() {
        this.el.resultsSection.classList.remove('show');
        this.el.statusArea.innerHTML = '';
        this.el.fileInput.value = '';
        this.currentFile = null;
        this.currentResult = null;
        
        // Reset readonly states et styles
        const fields = [
            this.el.clientField, this.el.companyField, this.el.numberField,
            this.el.dateField, this.el.clientAddressField, this.el.amountField
        ];
        
        fields.forEach(field => {
            field.readOnly = true;
            field.classList.remove('border-warning', 'is-valid', 'is-invalid');
            field.value = '';
        });
        
        this.el.editBtn.disabled = false;
        this.el.editBtn.innerHTML = '<i class="ti ti-edit me-2"></i>Corriger';
        
        console.log('🔄 Interface réinitialisée');
    }
}

// Export global
window.OCRCleanInterface = OCRCleanInterface;