/**
 * OCR Validation Interface
 * Interface dynamique de validation et modification des données extraites
 * Avec affichage adaptatif selon le type de document
 */

class OCRValidationInterface {
    constructor(options = {}) {
        this.options = {
            container: options.container || 'fieldsContainer',
            showConfidence: options.showConfidence !== false,
            autoValidate: options.autoValidate !== false,
            debug: options.debug || false
        };
        
        this.currentData = null;
        this.currentSchema = null;
        this.modifiedFields = new Set();
        
        // Mapping des icônes par type
        this.iconMapping = {
            'FACTURE_FOURNISSEUR': 'ti-file-invoice',
            'FACTURE_CLIENT': 'ti-file-dollar',
            'CONTRAT': 'ti-file-certificate',
            'NOTE_FRAIS': 'ti-receipt'
        };
        
        // Mapping des couleurs par type
        this.colorMapping = {
            'FACTURE_FOURNISSEUR': 'danger',
            'FACTURE_CLIENT': 'success',
            'CONTRAT': 'info',
            'NOTE_FRAIS': 'warning'
        };
    }
    
    /**
     * Afficher les données extraites
     */
    displayExtractedData(result) {
        if (!result || !result.success) {
            console.error('❌ Résultat invalide:', result);
            return false;
        }
        
        console.log('📊 Affichage des données extraites:', result);
        
        // Stocker les données actuelles
        this.currentData = result;
        this.currentSchema = this.getSchema(result.documentType);
        
        // Mettre à jour le type de document
        this.updateDocumentType(result.documentType);
        
        // Afficher les méta-informations
        this.displayMetaInfo(result);
        
        // Générer le formulaire
        this.generateValidationForm(result.documentType, result.extractedData);
        
        // Afficher les données brutes si debug
        if (this.options.debug) {
            this.displayRawData(result);
        }
        
        return true;
    }
    
    /**
     * Mettre à jour l'affichage du type de document
     */
    updateDocumentType(documentType) {
        const typeElement = document.getElementById('documentType');
        const alertElement = document.getElementById('documentTypeAlert');
        const dbElement = document.getElementById('notionDatabase');
        
        if (typeElement) {
            const displayName = this.getDisplayName(documentType);
            typeElement.textContent = displayName;
        }
        
        if (alertElement) {
            // Mettre à jour la couleur selon le type
            const color = this.colorMapping[documentType] || 'info';
            alertElement.className = `alert alert-${color} mb-4`;
            
            // Mettre à jour l'icône
            const icon = this.iconMapping[documentType] || 'ti-file';
            const iconElement = alertElement.querySelector('i');
            if (iconElement) {
                iconElement.className = `ti ${icon} fs-1 me-3`;
            }
        }
        
        if (dbElement && this.currentSchema) {
            dbElement.textContent = this.currentSchema.notionDB || 'Non configuré';
        }
    }
    
    /**
     * Afficher les méta-informations
     */
    displayMetaInfo(result) {
        // Confidence badge
        const confidenceBadge = document.getElementById('confidenceBadge');
        if (confidenceBadge) {
            const confidence = Math.round((result.confidence || 0.9) * 100);
            confidenceBadge.textContent = `${confidence}%`;
            
            // Couleur selon le niveau
            if (confidence >= 95) {
                confidenceBadge.className = 'badge bg-success';
            } else if (confidence >= 80) {
                confidenceBadge.className = 'badge bg-warning';
            } else {
                confidenceBadge.className = 'badge bg-danger';
            }
        }
        
        // Processing time
        if (result.processingTime) {
            const timeElement = document.getElementById('processingTimeDisplay');
            if (timeElement) {
                timeElement.textContent = `${Math.round(result.processingTime)}ms`;
            }
        }
    }
    
    /**
     * Générer le formulaire de validation
     */
    generateValidationForm(documentType, extractedData) {
        const container = document.getElementById(this.options.container);
        if (!container) return;
        
        container.innerHTML = '';
        
        // Si pas de schéma, afficher les données brutes
        if (!this.currentSchema) {
            this.displayRawFields(extractedData);
            return;
        }
        
        // Afficher d'abord les informations principales
        this.displayMainInfo(extractedData);
        
        // Grouper les champs
        const groups = this.groupFields(this.currentSchema.fields);
        
        // Afficher chaque groupe
        for (const [groupName, fields] of Object.entries(groups)) {
            this.displayFieldGroup(groupName, fields, extractedData);
        }
        
        // Ajouter les champs non mappés
        this.displayUnmappedFields(extractedData);
        
        // Activer la validation temps réel
        if (this.options.autoValidate) {
            this.setupRealtimeValidation();
        }
    }
    
    /**
     * Afficher les informations principales
     */
    displayMainInfo(data) {
        const container = document.getElementById(this.options.container);
        
        // Card pour les infos principales
        let mainInfoHtml = `
        <div class="col-12 mb-4">
            <div class="card bg-light">
                <div class="card-body">
                    <div class="row g-3">`;
        
        // Émetteur
        if (data.emetteur || data.fournisseur || data.vendor) {
            const emetteur = data.emetteur || data.fournisseur || data.vendor;
            mainInfoHtml += `
                <div class="col-md-6">
                    <h6 class="text-muted mb-1">Émetteur</h6>
                    <strong>${emetteur.nom || emetteur}</strong>
                    ${emetteur.adresse ? `<br><small class="text-muted">${emetteur.adresse}</small>` : ''}
                    ${emetteur.numero_tva ? `<br><small class="text-muted">TVA: ${emetteur.numero_tva}</small>` : ''}
                </div>`;
        }
        
        // Client/Destinataire
        if (data.client || data.destinataire || data.customer) {
            const client = data.client || data.destinataire || data.customer;
            mainInfoHtml += `
                <div class="col-md-6">
                    <h6 class="text-muted mb-1">Client/Destinataire</h6>
                    <strong>${client.nom || client}</strong>
                    ${client.adresse ? `<br><small class="text-muted">${client.adresse}</small>` : ''}
                    ${client.pays ? `<br><small class="text-muted">${client.pays}</small>` : ''}
                </div>`;
        }
        
        mainInfoHtml += `
                    </div>
                </div>
            </div>
        </div>`;
        
        container.innerHTML += mainInfoHtml;
    }
    
    /**
     * Grouper les champs par catégorie
     */
    groupFields(fields) {
        const groups = {
            'Identification': [],
            'Dates': [],
            'Montants': [],
            'Autres': []
        };
        
        for (const [fieldName, config] of Object.entries(fields)) {
            if (fieldName.toLowerCase().includes('numero') || 
                fieldName.toLowerCase().includes('reference') ||
                fieldName.toLowerCase().includes('client') ||
                fieldName.toLowerCase().includes('fournisseur')) {
                groups['Identification'].push([fieldName, config]);
            } else if (fieldName.toLowerCase().includes('date')) {
                groups['Dates'].push([fieldName, config]);
            } else if (fieldName.toLowerCase().includes('montant') || 
                       fieldName.toLowerCase().includes('tva') ||
                       fieldName.toLowerCase().includes('devise') ||
                       fieldName.toLowerCase().includes('prix')) {
                groups['Montants'].push([fieldName, config]);
            } else {
                groups['Autres'].push([fieldName, config]);
            }
        }
        
        // Retirer les groupes vides
        return Object.fromEntries(
            Object.entries(groups).filter(([_, fields]) => fields.length > 0)
        );
    }
    
    /**
     * Afficher un groupe de champs
     */
    displayFieldGroup(groupName, fields, data) {
        const container = document.getElementById(this.options.container);
        
        // Titre du groupe
        container.innerHTML += `
            <div class="col-12 mt-3">
                <h5 class="text-muted d-flex align-items-center">
                    <i class="ti ti-folder me-2"></i>
                    ${groupName}
                </h5>
                <hr class="mt-1 mb-3">
            </div>`;
        
        // Champs du groupe
        fields.forEach(([fieldName, config]) => {
            const value = this.findFieldValue(fieldName, data);
            const fieldHtml = this.createEnhancedField(fieldName, config, value);
            container.innerHTML += fieldHtml;
        });
    }
    
    /**
     * Créer un champ amélioré
     */
    createEnhancedField(fieldName, config, value) {
        const fieldId = this.sanitizeId(fieldName);
        const colSize = this.getFieldColSize(config.type);
        const required = config.required || false;
        
        let html = `<div class="${colSize} mb-3">`;
        
        // Label avec indicateurs
        html += `<label for="${fieldId}" class="form-label d-flex justify-content-between align-items-center">`;
        html += `<span>${fieldName}${required ? ' <span class="text-danger">*</span>' : ''}</span>`;
        
        // Indicateur de confiance
        if (this.options.showConfidence && value) {
            const confidence = this.calculateFieldConfidence(fieldName, value);
            html += `<small class="badge bg-${this.getConfidenceBadgeColor(confidence)}">${confidence}%</small>`;
        }
        
        html += '</label>';
        
        // Container pour le champ
        html += '<div class="position-relative">';
        
        // Input selon le type
        html += this.createFieldInput(fieldId, fieldName, config, value, required);
        
        // Actions du champ
        html += this.createFieldActions(fieldId, value);
        
        html += '</div>';
        
        // Message d'aide
        if (config.help) {
            html += `<small class="form-hint">${config.help}</small>`;
        }
        
        html += '</div>';
        
        return html;
    }
    
    /**
     * Créer l'input selon le type
     */
    createFieldInput(fieldId, fieldName, config, value, required) {
        const baseClass = 'form-control';
        const validClass = value ? 'is-valid' : '';
        
        switch (config.type) {
            case 'text':
                return `<input type="text" 
                    class="${baseClass} ${validClass}" 
                    id="${fieldId}" 
                    name="${fieldName}"
                    value="${value || ''}" 
                    ${required ? 'required' : ''}
                    data-original="${value || ''}"
                    placeholder="Entrez ${fieldName.toLowerCase()}">`;
                
            case 'number':
                const step = config.decimals ? `0.${'0'.repeat(config.decimals - 1)}1` : '0.01';
                return `<input type="number" 
                    class="${baseClass} ${validClass}" 
                    id="${fieldId}" 
                    name="${fieldName}"
                    value="${value || ''}" 
                    step="${step}"
                    ${required ? 'required' : ''}
                    data-original="${value || ''}"
                    placeholder="0.00">`;
                
            case 'date':
                return `<input type="date" 
                    class="${baseClass} ${validClass}" 
                    id="${fieldId}" 
                    name="${fieldName}"
                    value="${value || ''}" 
                    ${required ? 'required' : ''}
                    data-original="${value || ''}">`;
                
            case 'select':
                let selectHtml = `<select 
                    class="form-select ${validClass}" 
                    id="${fieldId}" 
                    name="${fieldName}"
                    ${required ? 'required' : ''}
                    data-original="${value || ''}">`;
                
                selectHtml += '<option value="">-- Sélectionner --</option>';
                
                for (const option of config.options || []) {
                    const selected = value === option ? 'selected' : '';
                    selectHtml += `<option value="${option}" ${selected}>${option}</option>`;
                }
                
                selectHtml += '</select>';
                return selectHtml;
                
            case 'textarea':
                return `<textarea 
                    class="${baseClass} ${validClass}" 
                    id="${fieldId}" 
                    name="${fieldName}"
                    rows="3"
                    ${required ? 'required' : ''}
                    data-original="${value || ''}"
                    placeholder="Entrez ${fieldName.toLowerCase()}">${value || ''}</textarea>`;
                
            default:
                return `<input type="text" 
                    class="${baseClass} ${validClass}" 
                    id="${fieldId}" 
                    name="${fieldName}"
                    value="${value || ''}" 
                    ${required ? 'required' : ''}
                    data-original="${value || ''}">`;
        }
    }
    
    /**
     * Créer les actions du champ
     */
    createFieldActions(fieldId, value) {
        let html = '<div class="field-actions position-absolute end-0 top-50 translate-middle-y me-2">';
        
        // Bouton reset si modifié
        html += `<button type="button" 
            class="btn btn-sm btn-ghost-secondary field-reset d-none" 
            data-field="${fieldId}"
            title="Réinitialiser">
            <i class="ti ti-arrow-back-up"></i>
        </button>`;
        
        // Indicateur de modification
        html += `<span class="badge bg-warning-lt field-modified d-none ms-1">Modifié</span>`;
        
        html += '</div>';
        
        return html;
    }
    
    /**
     * Afficher les champs non mappés
     */
    displayUnmappedFields(data) {
        const container = document.getElementById(this.options.container);
        const mappedFields = new Set();
        
        // Collecter les champs mappés
        if (this.currentSchema && this.currentSchema.fields) {
            Object.keys(this.currentSchema.fields).forEach(field => {
                mappedFields.add(field.toLowerCase());
            });
        }
        
        // Trouver les champs non mappés
        const unmappedFields = [];
        const skipFields = ['_metadata', 'emetteur', 'client', 'destinataire'];
        
        for (const [key, value] of Object.entries(data)) {
            if (!mappedFields.has(key.toLowerCase()) && 
                !skipFields.includes(key) &&
                typeof value !== 'object') {
                unmappedFields.push([key, value]);
            }
        }
        
        if (unmappedFields.length > 0) {
            container.innerHTML += `
                <div class="col-12 mt-4">
                    <h5 class="text-muted d-flex align-items-center">
                        <i class="ti ti-database-off me-2"></i>
                        Autres données extraites
                    </h5>
                    <hr class="mt-1 mb-3">
                </div>`;
            
            unmappedFields.forEach(([key, value]) => {
                const fieldHtml = this.createEnhancedField(
                    key,
                    { type: 'text', required: false },
                    value
                );
                container.innerHTML += fieldHtml;
            });
        }
    }
    
    /**
     * Configuration de la validation temps réel
     */
    setupRealtimeValidation() {
        const container = document.getElementById(this.options.container);
        if (!container) return;
        
        // Écouter les changements
        container.addEventListener('input', (e) => {
            const field = e.target;
            if (!field.name) return;
            
            const originalValue = field.getAttribute('data-original');
            const currentValue = field.value;
            const fieldId = field.id;
            
            // Marquer comme modifié si différent
            if (originalValue !== currentValue) {
                this.modifiedFields.add(field.name);
                field.classList.add('is-valid');
                
                // Afficher les indicateurs
                const resetBtn = container.querySelector(`.field-reset[data-field="${fieldId}"]`);
                const modifiedBadge = field.parentElement.querySelector('.field-modified');
                
                if (resetBtn) resetBtn.classList.remove('d-none');
                if (modifiedBadge) modifiedBadge.classList.remove('d-none');
            } else {
                this.modifiedFields.delete(field.name);
                
                // Masquer les indicateurs
                const resetBtn = container.querySelector(`.field-reset[data-field="${fieldId}"]`);
                const modifiedBadge = field.parentElement.querySelector('.field-modified');
                
                if (resetBtn) resetBtn.classList.add('d-none');
                if (modifiedBadge) modifiedBadge.classList.add('d-none');
            }
            
            // Validation spécifique selon le type
            this.validateField(field);
        });
        
        // Gérer les boutons reset
        container.addEventListener('click', (e) => {
            if (e.target.closest('.field-reset')) {
                const btn = e.target.closest('.field-reset');
                const fieldId = btn.getAttribute('data-field');
                const field = document.getElementById(fieldId);
                
                if (field) {
                    field.value = field.getAttribute('data-original') || '';
                    field.dispatchEvent(new Event('input'));
                }
            }
        });
    }
    
    /**
     * Valider un champ
     */
    validateField(field) {
        const value = field.value;
        const type = field.type;
        let isValid = true;
        
        // Validation basique
        if (field.hasAttribute('required') && !value) {
            isValid = false;
        }
        
        // Validation spécifique
        switch (type) {
            case 'email':
                isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
                break;
                
            case 'number':
                isValid = !isNaN(value) && value !== '';
                break;
                
            case 'date':
                isValid = !isNaN(Date.parse(value));
                break;
        }
        
        // Appliquer les classes
        if (isValid) {
            field.classList.remove('is-invalid');
            if (value) field.classList.add('is-valid');
        } else {
            field.classList.add('is-invalid');
            field.classList.remove('is-valid');
        }
        
        return isValid;
    }
    
    /**
     * Obtenir les données validées
     */
    getValidatedData() {
        const form = document.getElementById('extractedDataForm');
        if (!form) return null;
        
        const formData = new FormData(form);
        const data = {};
        
        // Collecter toutes les données
        for (const [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        // Ajouter les métadonnées
        data._metadata = {
            documentType: this.currentData?.documentType,
            modifiedFields: Array.from(this.modifiedFields),
            validatedAt: new Date().toISOString()
        };
        
        return data;
    }
    
    /**
     * Utilitaires
     */
    
    findFieldValue(fieldName, data) {
        // Recherche directe
        if (data[fieldName] !== undefined) {
            return data[fieldName];
        }
        
        // Recherche insensible à la casse
        const lowerFieldName = fieldName.toLowerCase();
        for (const [key, value] of Object.entries(data)) {
            if (key.toLowerCase() === lowerFieldName) {
                return value;
            }
        }
        
        // Recherche avec mapping
        const mappings = {
            'Numéro Facture': ['numero', 'invoice_number', 'bill_number'],
            'Montant TTC': ['montant_ttc', 'total', 'gross_amount'],
            'Date Facture': ['date_emission', 'invoice_date', 'date'],
            'Client': ['client.nom', 'customer', 'bill_to'],
            'Fournisseur': ['emetteur.nom', 'supplier', 'vendor']
        };
        
        const possibleKeys = mappings[fieldName] || [];
        for (const key of possibleKeys) {
            const value = this.getNestedValue(data, key);
            if (value !== undefined && value !== null) {
                return value;
            }
        }
        
        return '';
    }
    
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => 
            current && current[key] !== undefined ? current[key] : undefined, obj);
    }
    
    sanitizeId(text) {
        return text.replace(/[^a-zA-Z0-9]/g, '');
    }
    
    getFieldColSize(type) {
        switch (type) {
            case 'textarea': return 'col-12';
            case 'text': return 'col-md-6';
            case 'select': return 'col-md-6';
            case 'number': return 'col-md-4';
            case 'date': return 'col-md-4';
            default: return 'col-md-6';
        }
    }
    
    calculateFieldConfidence(fieldName, value) {
        // Simulation de confiance basée sur le contenu
        if (!value) return 0;
        
        // Plus le champ est complet, plus la confiance est élevée
        const baseConfidence = 85;
        const bonus = Math.min(15, value.toString().length);
        
        return Math.min(100, baseConfidence + bonus);
    }
    
    getConfidenceBadgeColor(confidence) {
        if (confidence >= 95) return 'success';
        if (confidence >= 80) return 'warning';
        return 'danger';
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
    
    getSchema(documentType) {
        if (window.DOCUMENT_TYPES && window.DOCUMENT_TYPES[documentType]) {
            return window.DOCUMENT_TYPES[documentType];
        }
        
        return null;
    }
    
    displayRawData(result) {
        console.group('📋 Données brutes extraites');
        console.log('Type:', result.documentType);
        console.log('Confiance:', result.confidence);
        console.log('Données:', result.extractedData);
        console.log('Mapping Notion:', result.notion_mapping);
        console.groupEnd();
    }
}

// Export
window.OCRValidationInterface = OCRValidationInterface;