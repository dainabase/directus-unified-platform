/**
 * OCR Premium Interface
 * Interface ultra-professionnelle niveau SaaS Premium
 * Avec détection type document, animations 60fps et micro-interactions
 */

class OCRPremiumInterface {
    constructor() {
        this.processor = null;
        this.apiClient = null;
        this.currentFile = null;
        this.currentResult = null;
        this.isProcessing = false;
        this.dragCounter = 0;
        this.useBackendAPI = true; // Use backend API by default
        
        // Micro-interactions settings
        this.enableSound = true;
        this.enableHaptic = true;
        this.enableAnimations = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        // Processing steps
        this.steps = [
            { id: 'step1', label: 'Lecture document', duration: 800 },
            { id: 'step2', label: 'Analyse IA', duration: 1500 },
            { id: 'step3', label: 'Extraction données', duration: 1200 },
            { id: 'step4', label: 'Validation', duration: 500 }
        ];
        
        this.init();
    }
    
    async init() {
        console.log('🚀 OCR Premium Interface v2.0 - Initialisation');
        
        this.initElements();
        await this.initServices();
        this.attachEvents();
        this.initMicroInteractions();
        await this.checkBackendHealth();
        
        console.log('✅ Interface Premium prête');
    }
    
    initElements() {
        // Dropzone elements
        this.el = {
            dropzone: document.getElementById('dropzonePremium'),
            dropzoneContent: document.getElementById('dropzoneContent'),
            dropzoneOverlay: document.getElementById('dropzoneOverlay'),
            fileInput: document.getElementById('fileInput'),
            browseBtn: document.getElementById('browseBtn'),
            filePreview: document.getElementById('filePreview'),
            previewThumbnail: document.getElementById('previewThumbnail'),
            previewName: document.getElementById('previewName'),
            previewSize: document.getElementById('previewSize'),
            previewRemove: document.getElementById('previewRemove'),
            
            // Sections
            uploadSection: document.getElementById('uploadSection'),
            processingSection: document.getElementById('processingSection'),
            resultsSection: document.getElementById('resultsSection'),
            
            // Processing elements
            detailedProgress: document.getElementById('detailedProgress'),
            processingMessage: document.getElementById('processingMessage'),
            processingDetail: document.getElementById('processingDetail'),
            estimatedTime: document.getElementById('estimatedTime'),
            
            // Results elements
            documentTypeBadge: document.getElementById('documentTypeBadge'),
            documentTypeText: document.getElementById('documentTypeText'),
            typeConfidenceBar: document.getElementById('typeConfidenceBar'),
            typeConfidenceText: document.getElementById('typeConfidenceText'),
            overallConfidence: document.getElementById('overallConfidence'),
            
            clientField: document.getElementById('clientField'),
            clientAddress: document.getElementById('clientAddress'),
            companyField: document.getElementById('companyField'),
            numberField: document.getElementById('numberField'),
            dateField: document.getElementById('dateField'),
            amountField: document.getElementById('amountField'),
            currencyBadge: document.getElementById('currencyBadge'),
            vatStatusBadge: document.getElementById('vatStatusBadge'),
            vatRateText: document.getElementById('vatRateText'),
            vatAmountDisplay: document.getElementById('vatAmountDisplay'),
            validationWarnings: document.getElementById('validationWarnings'),
            
            // Actions
            editBtn: document.getElementById('editBtn'),
            regenerateBtn: document.getElementById('regenerateBtn'),
            saveBtn: document.getElementById('saveBtn'),
            
            // Notion workflow containers
            documentTypeContainer: document.getElementById('documentTypeContainer'),
            validationFormContainer: document.getElementById('validationFormContainer'),
            notificationContainer: document.getElementById('notificationContainer'),
            
            // Quick actions
            pasteBtn: document.getElementById('pasteBtn'),
            cameraBtn: document.getElementById('cameraBtn'),
            templateBtn: document.getElementById('templateBtn'),
            historyBtn: document.getElementById('historyBtn'),
            batchBtn: document.getElementById('batchBtn')
        };
        
        // Step elements
        this.steps.forEach(step => {
            step.element = document.getElementById(step.id);
        });
    }
    
    async initServices() {
        try {
            // Initialize API client
            const backendURL = localStorage.getItem('ocr_backend_url') || 'http://localhost:3001/api';
            this.apiClient = new OCRAPIClient(backendURL);
            
            // Check if backend is available
            const health = await this.apiClient.checkHealth();
            
            if (health.status === 'healthy' || health.status === 'degraded') {
                console.log('✅ Backend API connecté');
                this.useBackendAPI = true;
            } else {
                throw new Error('Backend not available');
            }
            
        } catch (error) {
            console.warn('⚠️ Backend non disponible, utilisation du processeur local');
            this.useBackendAPI = false;
            
            // Fallback to local processor
            try {
                this.processor = new OCRHybridProcessor();
                await this.processor.init();
                console.log('✅ Processeur OCR local initialisé');
            } catch (procError) {
                console.error('❌ Erreur initialisation processeur local:', procError);
                this.showNotification('error', 'Erreur initialisation OCR');
            }
        }
    }
    
    attachEvents() {
        // Drag & Drop events
        this.el.dropzone.addEventListener('dragenter', this.handleDragEnter.bind(this));
        this.el.dropzone.addEventListener('dragover', this.handleDragOver.bind(this));
        this.el.dropzone.addEventListener('dragleave', this.handleDragLeave.bind(this));
        this.el.dropzone.addEventListener('drop', this.handleDrop.bind(this));
        
        // Click events
        this.el.browseBtn.addEventListener('click', () => this.el.fileInput.click());
        this.el.fileInput.addEventListener('change', this.handleFileSelect.bind(this));
        this.el.previewRemove?.addEventListener('click', this.removeFile.bind(this));
        
        // Actions
        this.el.editBtn?.addEventListener('click', this.enableEditing.bind(this));
        this.el.regenerateBtn?.addEventListener('click', this.regenerateAnalysis.bind(this));
        this.el.saveBtn?.addEventListener('click', this.saveDocument.bind(this));
        
        // Quick actions
        this.el.pasteBtn?.addEventListener('click', this.handlePaste.bind(this));
        this.el.cameraBtn?.addEventListener('click', this.handleCamera.bind(this));
        this.el.templateBtn?.addEventListener('click', this.showTemplates.bind(this));
        
        // Keyboard shortcuts
        document.addEventListener('paste', this.handlePasteEvent.bind(this));
        document.addEventListener('keydown', this.handleKeyboard.bind(this));
    }
    
    // ===========================
    // MICRO-INTERACTIONS
    // ===========================
    
    initMicroInteractions() {
        // Sound effects (subtle)
        this.sounds = {
            hover: this.createSound([800, 0.1, 0.05]),
            success: this.createSound([600, 0.15, 0.1, 800, 0.1, 0.05]),
            error: this.createSound([300, 0.2, 0.1]),
            drop: this.createSound([400, 0.1, 0.05, 600, 0.1, 0.05])
        };
        
        // Haptic patterns
        this.hapticPatterns = {
            light: 10,
            medium: 25,
            strong: 50,
            success: [50, 100, 50],
            error: [100, 50, 100]
        };
    }
    
    createSound(pattern) {
        // Web Audio API pour sons subtils
        if (!window.AudioContext) return null;
        
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            return () => {
                if (!this.enableSound) return;
                
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.value = pattern[0];
                gainNode.gain.value = pattern[1];
                
                oscillator.start();
                oscillator.stop(audioContext.currentTime + (pattern[2] || 0.1));
            };
        } catch (e) {
            return null;
        }
    }
    
    triggerHaptic(pattern) {
        if (!this.enableHaptic || !navigator.vibrate) return;
        navigator.vibrate(pattern);
    }
    
    // ===========================
    // DRAG & DROP HANDLERS
    // ===========================
    
    handleDragEnter(e) {
        e.preventDefault();
        this.dragCounter++;
        
        if (this.dragCounter === 1) {
            this.el.dropzone.classList.add('drag-over');
            this.sounds.hover?.();
            this.triggerHaptic(this.hapticPatterns.light);
        }
    }
    
    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    }
    
    handleDragLeave(e) {
        e.preventDefault();
        this.dragCounter--;
        
        if (this.dragCounter === 0) {
            this.el.dropzone.classList.remove('drag-over');
        }
    }
    
    handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        
        this.dragCounter = 0;
        this.el.dropzone.classList.remove('drag-over');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.sounds.drop?.();
            this.triggerHaptic(this.hapticPatterns.medium);
            this.processFile(files[0]);
        }
    }
    
    handleFileSelect(e) {
        const files = e.target.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }
    
    // ===========================
    // FILE PROCESSING
    // ===========================
    
    async processFile(file) {
        if (this.isProcessing) {
            this.showNotification('warning', 'Un traitement est déjà en cours');
            return;
        }
        
        if (!this.validateFile(file)) return;
        
        this.currentFile = file;
        this.isProcessing = true;
        
        // Show file preview
        this.showFilePreview(file);
        
        // Start processing
        await this.sleep(300); // Small delay for UX
        this.startProcessing();
        
        try {
            let result;
            
            // Use backend API if available
            if (this.useBackendAPI) {
                result = await this.apiClient.uploadDocument(file);
            } else {
                // Fallback to local processing
                result = await this.processor.processDocument(file);
            }
            
            if (result.success) {
                this.currentResult = result.data;
                this.currentResult.fileId = result.fileId; // Store fileId from backend
                await this.completeProcessing();
                
                // Détecter le type de document
                const documentType = OCRNotionWorkflow.detectDocumentType(
                    result.data.rawText || JSON.stringify(result.data)
                );
                
                // Stocker les données pour le workflow
                OCRNotionWorkflow.setCurrentData(documentType, result.data, result.fileId);
                
                // Afficher le type détecté
                OCRNotionWorkflow.displayDetectedType(documentType);
                
                // Mapper les données extraites aux champs
                const mappedData = OCRNotionWorkflow.mapExtractedDataToFields(documentType, result.data);
                
                // Générer le formulaire de validation
                OCRNotionWorkflow.generateValidationForm(documentType, mappedData);
                
                // Afficher les résultats
                this.displayResults(result.data);
                
                // Masquer les résultats originaux, afficher le formulaire
                document.getElementById('originalExtractionResults').style.display = 'none';
                document.getElementById('validationFormContainer').style.display = 'block';
                
                // Success feedback
                this.sounds.success?.();
                this.triggerHaptic(this.hapticPatterns.success);
                this.showNotification('success', 'Document analysé avec succès - Vérifiez les données avant sauvegarde');
            } else {
                throw new Error(result.error || 'Erreur traitement');
            }
            
        } catch (error) {
            console.error('❌ Erreur traitement:', error);
            this.handleProcessingError(error);
        } finally {
            this.isProcessing = false;
        }
    }
    
    validateFile(file) {
        const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/heic'];
        const maxSize = 10 * 1024 * 1024; // 10MB
        
        if (!validTypes.includes(file.type)) {
            this.showNotification('error', 'Format non supporté. Utilisez PDF, PNG, JPG ou HEIC');
            this.sounds.error?.();
            return false;
        }
        
        if (file.size > maxSize) {
            this.showNotification('error', 'Fichier trop volumineux (max 10MB)');
            this.sounds.error?.();
            return false;
        }
        
        return true;
    }
    
    showFilePreview(file) {
        this.el.previewName.textContent = file.name;
        this.el.previewSize.textContent = this.formatFileSize(file.size);
        
        // Set icon based on file type
        const icon = file.type.includes('pdf') ? 'ti-file-text' : 'ti-photo';
        this.el.previewThumbnail.innerHTML = `<i class="ti ${icon}"></i>`;
        
        this.el.filePreview.classList.add('show');
        this.el.dropzoneContent.style.opacity = '0.5';
    }
    
    removeFile() {
        this.currentFile = null;
        this.el.filePreview.classList.remove('show');
        this.el.dropzoneContent.style.opacity = '1';
        this.el.fileInput.value = '';
    }
    
    // ===========================
    // PROCESSING ANIMATION
    // ===========================
    
    startProcessing() {
        // Hide upload, show processing
        this.el.uploadSection.style.display = 'none';
        this.el.processingSection.style.display = 'block';
        
        // Reset progress
        this.el.detailedProgress.style.width = '0%';
        this.steps.forEach(step => {
            step.element.classList.remove('active', 'completed');
        });
        
        // Start step animation
        this.animateProcessingSteps();
    }
    
    async animateProcessingSteps() {
        let totalDuration = this.steps.reduce((sum, step) => sum + step.duration, 0);
        let currentProgress = 0;
        
        for (const step of this.steps) {
            // Activate step
            step.element.classList.add('active');
            
            // Update message
            this.updateProcessingMessage(step.label);
            
            // Animate progress
            const stepProgress = (step.duration / totalDuration) * 100;
            await this.animateProgress(currentProgress, currentProgress + stepProgress, step.duration);
            currentProgress += stepProgress;
            
            // Complete step
            step.element.classList.remove('active');
            step.element.classList.add('completed');
        }
    }
    
    async animateProgress(from, to, duration) {
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentValue = from + (to - from) * easeOutQuart;
            
            this.el.detailedProgress.style.width = `${currentValue}%`;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
        await this.sleep(duration);
    }
    
    updateProcessingMessage(stepLabel) {
        const messages = {
            'Lecture document': 'Analyse du format et extraction du contenu...',
            'Analyse IA': 'Intelligence artificielle GPT-4 en action...',
            'Extraction données': 'Identification des informations clés...',
            'Validation': 'Vérification et structuration finale...'
        };
        
        this.el.processingDetail.textContent = messages[stepLabel] || stepLabel;
    }
    
    async completeProcessing() {
        // Final progress animation
        await this.animateProgress(95, 100, 200);
        await this.sleep(300);
    }
    
    // ===========================
    // RESULTS DISPLAY
    // ===========================
    
    displayResults(data) {
        // Hide processing, show results
        this.el.processingSection.style.display = 'none';
        this.el.resultsSection.style.display = 'block';
        
        // Document type with icon
        this.updateDocumentType(data);
        
        // Client information (priority)
        this.el.clientField.value = data.client || 'Non détecté';
        this.el.clientAddress.textContent = data.clientAddress || 'Adresse non disponible';
        
        // Company and document info
        this.el.companyField.value = data.entite || data.company || '';
        this.el.numberField.value = data.numero || data.number || '';
        this.el.dateField.value = this.formatDate(data.date);
        
        // Amount and currency
        const amount = data.montant_ttc || data.amount || 0;
        this.el.amountField.value = this.formatAmount(amount, data.devise);
        this.el.currencyBadge.textContent = data.devise || 'EUR';
        
        // VAT information
        this.updateVATDisplay(data);
        
        // Overall confidence
        const confidence = Math.round((data.confidence || 0.95) * 100);
        this.el.overallConfidence.textContent = `${confidence}%`;
        this.el.overallConfidence.className = `badge ${
            confidence > 90 ? 'bg-success' : 
            confidence > 75 ? 'bg-warning' : 'bg-danger'
        }`;
        
        // Validation warnings
        this.displayValidationWarnings(data);
    }
    
    updateDocumentType(data) {
        const typeConfig = {
            'facture_client': { icon: 'ti-file-invoice', label: 'Facture Client', color: 'primary' },
            'facture_fournisseur': { icon: 'ti-file-dollar', label: 'Facture Fournisseur', color: 'info' },
            'devis': { icon: 'ti-file-description', label: 'Devis', color: 'success' },
            'note_frais': { icon: 'ti-receipt', label: 'Note de Frais', color: 'warning' },
            'ticket_cb': { icon: 'ti-credit-card', label: 'Ticket CB', color: 'secondary' }
        };
        
        const config = typeConfig[data.type] || typeConfig['facture_client'];
        
        this.el.documentTypeBadge.innerHTML = `
            <i class="ti ${config.icon} me-1"></i>
            <span>${config.label}</span>
        `;
        this.el.documentTypeBadge.className = `badge badge-lg bg-${config.color}`;
        
        // Type confidence
        const typeConfidence = Math.round((data.typeConfidence || 0.9) * 100);
        this.el.typeConfidenceBar.style.width = `${typeConfidence}%`;
        this.el.typeConfidenceText.textContent = `${typeConfidence}%`;
        
        // Color based on confidence
        this.el.typeConfidenceBar.className = `progress-bar ${
            typeConfidence > 80 ? 'bg-success' :
            typeConfidence > 60 ? 'bg-warning' : 'bg-danger'
        }`;
    }
    
    updateVATDisplay(data) {
        const vatStatus = data.vat_status || data.vatStatus || 'ttc';
        const vatRate = data.taux_tva || data.vatRate || 0;
        
        const statusConfig = {
            'hors_tva': { label: 'Hors TVA', color: 'info' },
            'ttc': { label: 'TTC', color: 'success' },
            'non_applicable': { label: 'N/A', color: 'secondary' }
        };
        
        const config = statusConfig[vatStatus] || statusConfig['ttc'];
        
        this.el.vatStatusBadge.textContent = config.label;
        this.el.vatStatusBadge.className = `badge badge-lg bg-${config.color}`;
        this.el.vatRateText.textContent = `${vatRate}%`;
        
        // VAT amount
        const vatAmount = data.montant_tva || 0;
        const currency = data.devise || 'EUR';
        this.el.vatAmountDisplay.textContent = `${this.formatAmount(vatAmount, currency)} ${currency}`;
    }
    
    displayValidationWarnings(data) {
        const warnings = [];
        
        if (!data.client || data.client === 'Non détecté') {
            warnings.push({
                type: 'warning',
                message: 'Client non détecté - Vérification manuelle recommandée'
            });
        }
        
        if (data.typeConfidence && data.typeConfidence < 0.8) {
            warnings.push({
                type: 'info',
                message: `Type de document détecté avec ${Math.round(data.typeConfidence * 100)}% de confiance`
            });
        }
        
        if (warnings.length > 0) {
            this.el.validationWarnings.innerHTML = warnings.map(w => `
                <div class="alert alert-${w.type} alert-dismissible fade show" role="alert">
                    <i class="ti ti-alert-triangle me-2"></i>
                    ${w.message}
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            `).join('');
        } else {
            this.el.validationWarnings.innerHTML = '';
        }
    }
    
    // ===========================
    // ACTIONS
    // ===========================
    
    enableEditing() {
        const fields = [
            this.el.clientField,
            this.el.companyField,
            this.el.numberField,
            this.el.dateField,
            this.el.amountField
        ];
        
        fields.forEach(field => {
            field.readOnly = false;
            field.classList.add('border-warning');
        });
        
        this.el.editBtn.innerHTML = '<i class="ti ti-lock-open me-2"></i>Mode édition';
        this.el.editBtn.disabled = true;
        
        this.showNotification('info', 'Mode édition activé');
    }
    
    async regenerateAnalysis() {
        if (!this.currentFile) return;
        
        const confirmed = await this.showConfirmDialog(
            'Relancer l\'analyse ?',
            'Cette action va analyser à nouveau le document.'
        );
        
        if (confirmed) {
            this.el.resultsSection.style.display = 'none';
            this.processFile(this.currentFile);
        }
    }
    
    async saveDocument() {
        if (!this.currentResult) return;
        
        try {
            this.el.saveBtn.disabled = true;
            this.el.saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Enregistrement...';
            
            if (this.useBackendAPI) {
                // Save to Notion via backend
                const notionResult = await this.apiClient.saveToNotion(
                    this.currentResult.type,
                    this.currentResult,
                    this.currentResult.fileId
                );
                
                if (notionResult.isDuplicate) {
                    // Handle duplicate
                    const update = await this.showConfirmDialog(
                        'Document existant',
                        `Ce document existe déjà dans Notion (${this.currentResult.numero}). Voulez-vous le mettre à jour ?`
                    );
                    
                    if (!update) {
                        this.el.saveBtn.disabled = false;
                        this.el.saveBtn.innerHTML = '<i class="ti ti-device-floppy me-2"></i>Enregistrer en comptabilité';
                        return;
                    }
                    
                    // Update existing document
                    await this.apiClient.updateNotionPage(notionResult.notionPageId, this.currentResult);
                }
                
                this.sounds.success?.();
                this.triggerHaptic(this.hapticPatterns.success);
                this.showNotification('success', 'Document enregistré dans Notion avec succès');
                
                // Open Notion page if URL available
                if (notionResult.notionUrl) {
                    const openNotion = await this.showConfirmDialog(
                        'Ouvrir dans Notion ?',
                        'Le document a été créé. Voulez-vous l\'ouvrir dans Notion ?'
                    );
                    
                    if (openNotion) {
                        window.open(notionResult.notionUrl, '_blank');
                    }
                }
            } else {
                // Fallback: simulate save
                await this.sleep(1500);
                this.sounds.success?.();
                this.triggerHaptic(this.hapticPatterns.success);
                this.showNotification('success', 'Document enregistré localement');
            }
            
            // Reset after delay
            setTimeout(() => this.resetInterface(), 2000);
            
        } catch (error) {
            this.sounds.error?.();
            this.showNotification('error', `Erreur: ${error.message}`);
        } finally {
            this.el.saveBtn.disabled = false;
            this.el.saveBtn.innerHTML = '<i class="ti ti-device-floppy me-2"></i>Enregistrer en comptabilité';
        }
    }
    
    // ===========================
    // QUICK ACTIONS
    // ===========================
    
    async handlePaste() {
        try {
            const clipboardItems = await navigator.clipboard.read();
            for (const item of clipboardItems) {
                for (const type of item.types) {
                    if (type.startsWith('image/')) {
                        const blob = await item.getType(type);
                        const file = new File([blob], 'pasted-image.png', { type });
                        this.processFile(file);
                        break;
                    }
                }
            }
        } catch (error) {
            this.showNotification('error', 'Impossible de coller depuis le presse-papier');
        }
    }
    
    handlePasteEvent(e) {
        const items = e.clipboardData?.items;
        if (!items) return;
        
        for (const item of items) {
            if (item.type.startsWith('image/')) {
                e.preventDefault();
                const file = item.getAsFile();
                if (file) this.processFile(file);
                break;
            }
        }
    }
    
    async handleCamera() {
        // Mobile camera capture
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.capture = 'environment';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) this.processFile(file);
        };
        
        input.click();
    }
    
    showTemplates() {
        this.showNotification('info', 'Exemples de documents disponibles bientôt');
    }
    
    handleKeyboard(e) {
        // Ctrl/Cmd + O to open file dialog
        if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
            e.preventDefault();
            this.el.fileInput.click();
        }
        
        // Escape to cancel
        if (e.key === 'Escape' && this.isProcessing) {
            this.cancelProcessing();
        }
    }
    
    // ===========================
    // ERROR HANDLING
    // ===========================
    
    handleProcessingError(error) {
        this.el.processingSection.style.display = 'none';
        this.el.uploadSection.style.display = 'block';
        
        this.sounds.error?.();
        this.triggerHaptic(this.hapticPatterns.error);
        
        this.el.dropzone.classList.add('error');
        setTimeout(() => this.el.dropzone.classList.remove('error'), 3000);
        
        this.showNotification('error', error.message || 'Erreur lors du traitement');
    }
    
    // ===========================
    // UTILITIES
    // ===========================
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    formatDate(date) {
        if (!date) return '';
        try {
            return new Date(date).toISOString().split('T')[0];
        } catch {
            return date;
        }
    }
    
    formatAmount(amount, currency = 'EUR') {
        if (!amount) return '0.00';
        
        // Format based on currency
        const formats = {
            'CHF': { locale: 'fr-CH', options: { minimumFractionDigits: 2 } },
            'EUR': { locale: 'fr-FR', options: { minimumFractionDigits: 2 } },
            'USD': { locale: 'en-US', options: { minimumFractionDigits: 2 } },
            'GBP': { locale: 'en-GB', options: { minimumFractionDigits: 2 } }
        };
        
        const format = formats[currency] || formats['EUR'];
        return amount.toLocaleString(format.locale, format.options);
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    showNotification(type, message) {
        // Using Tabler's built-in notifications
        const toast = document.createElement('div');
        toast.className = `toast show align-items-center text-white bg-${type} border-0`;
        toast.setAttribute('role', 'alert');
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">${message}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;
        
        // Add to page
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
            document.body.appendChild(container);
        }
        
        container.appendChild(toast);
        
        // Auto remove after 5s
        setTimeout(() => toast.remove(), 5000);
    }
    
    async showConfirmDialog(title, message) {
        // For now, using native confirm
        // TODO: Implement custom modal
        return confirm(`${title}\n\n${message}`);
    }
    
    resetInterface() {
        // Reset all sections
        this.el.uploadSection.style.display = 'block';
        this.el.processingSection.style.display = 'none';
        this.el.resultsSection.style.display = 'none';
        
        // Clear file
        this.removeFile();
        
        // Reset form
        this.currentFile = null;
        this.currentResult = null;
        
        // Clear validation warnings
        this.el.validationWarnings.innerHTML = '';
        
        // Clear Notion workflow containers
        if (document.getElementById('documentTypeContainer')) {
            document.getElementById('documentTypeContainer').innerHTML = '';
            document.getElementById('documentTypeContainer').style.display = 'none';
        }
        if (document.getElementById('validationFormContainer')) {
            document.getElementById('validationFormContainer').innerHTML = '';
            document.getElementById('validationFormContainer').style.display = 'none';
        }
        if (document.getElementById('notificationContainer')) {
            document.getElementById('notificationContainer').innerHTML = '';
            document.getElementById('notificationContainer').style.display = 'none';
        }
    }
    
    async checkBackendHealth() {
        if (!this.useBackendAPI) return;
        
        try {
            const health = await this.apiClient.checkHealth();
            
            // Check services status
            if (health.services?.notion?.status === 'not_configured') {
                console.warn('⚠️ Notion API non configurée');
                this.showNotification('warning', 'Configuration Notion requise pour la sauvegarde automatique');
            }
            
            if (health.services?.openai?.status === 'not_configured') {
                console.warn('⚠️ OpenAI API non configurée');
                this.showNotification('warning', 'Configuration OpenAI requise pour une précision maximale');
            }
            
            // Show backend status
            console.log('📊 Backend status:', health);
            
        } catch (error) {
            console.error('❌ Erreur vérification backend:', error);
        }
    }

    /**
     * Settings modal for backend configuration
     */
    showSettingsModal() {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Configuration Backend</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <label class="form-label">URL Backend API</label>
                            <input type="text" class="form-control" id="backendUrl" 
                                value="${localStorage.getItem('ocr_backend_url') || 'http://localhost:3001/api'}">
                            <div class="form-hint">URL du serveur backend OCR/Notion</div>
                        </div>
                        <div class="mb-3">
                            <button class="btn btn-sm btn-outline-primary" onclick="window.ocrPremium.testBackendConnection()">
                                <i class="ti ti-plug-connected me-2"></i>Tester la connexion
                            </button>
                        </div>
                        <div id="connectionStatus"></div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
                        <button type="button" class="btn btn-primary" onclick="window.ocrPremium.saveSettings()">
                            Enregistrer
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
        
        modal.addEventListener('hidden.bs.modal', () => {
            modal.remove();
        });
    }
    
    async testBackendConnection() {
        const statusDiv = document.getElementById('connectionStatus');
        const backendUrl = document.getElementById('backendUrl').value;
        
        statusDiv.innerHTML = '<div class="spinner-border spinner-border-sm me-2"></div>Test en cours...';
        
        try {
            const testClient = new OCRAPIClient(backendUrl);
            const result = await testClient.testServices();
            
            statusDiv.innerHTML = `
                <div class="alert alert-success">
                    <h6>✅ Connexion réussie</h6>
                    <p class="mb-1">Notion: ${result.results.notion?.status || 'non configuré'}</p>
                    <p class="mb-0">OpenAI: ${result.results.openai?.status || 'non configuré'}</p>
                </div>
            `;
        } catch (error) {
            statusDiv.innerHTML = `
                <div class="alert alert-danger">
                    <h6>❌ Erreur de connexion</h6>
                    <p class="mb-0">${error.message}</p>
                </div>
            `;
        }
    }
    
    saveSettings() {
        const backendUrl = document.getElementById('backendUrl').value;
        localStorage.setItem('ocr_backend_url', backendUrl);
        
        this.showNotification('success', 'Configuration enregistrée');
        
        // Reinitialize services
        this.initServices();
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.querySelector('.modal'));
        modal.hide();
    }
}

// Auto-initialize
window.OCRPremiumInterface = OCRPremiumInterface;