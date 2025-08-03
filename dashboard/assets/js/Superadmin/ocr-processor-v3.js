/**
 * OCR Processor v3.0 - Ultra Fiable
 * Support PDF + Images avec fallback automatique
 */

class OCRProcessorV3 {
    constructor() {
        this.version = '3.0';
        this.dropzone = null;
        this.fileInput = null;
        this.isProcessing = false;
        this.currentFile = null;
        this.results = null;
        
        console.log(`🚀 OCR Processor v${this.version} - Initialisation`);
    }

    async init() {
        try {
            // 1. Vérifier les dépendances
            await this.checkDependencies();
            
            // 2. Initialiser les éléments DOM
            this.initializeElements();
            
            // 3. Configurer les événements
            this.setupEvents();
            
            // 4. Tests automatiques
            await this.runSelfTests();
            
            console.log('✅ OCR Processor v3 initialisé avec succès');
            
        } catch (error) {
            console.error('❌ Erreur initialisation OCR:', error);
            this.showError('Erreur critique initialisation OCR');
        }
    }

    async checkDependencies() {
        console.log('🔍 Vérification des dépendances...');
        
        // Vérifier PDF.js
        if (typeof pdfjsLib === 'undefined') {
            throw new Error('PDF.js non disponible - Ajoutez le script dans <head>');
        }
        console.log('✅ PDF.js disponible');
        
        // Vérifier Tesseract.js
        if (typeof Tesseract === 'undefined') {
            throw new Error('Tesseract.js non disponible - Ajoutez le script dans <head>');
        }
        console.log('✅ Tesseract.js disponible');
        
        // Configuration PDF.js
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }

    initializeElements() {
        console.log('🎯 Initialisation des éléments DOM...');
        
        // Chercher dropzone avec plusieurs sélecteurs
        this.dropzone = document.getElementById('dropzone') || 
                       document.getElementById('ocr-dropzone') ||
                       document.querySelector('.dropzone');
        
        if (!this.dropzone) {
            throw new Error('Zone de drop non trouvée');
        }
        
        // Chercher file input
        this.fileInput = document.getElementById('file-input') ||
                        document.getElementById('fileInput') ||
                        document.querySelector('input[type="file"]');
        
        if (!this.fileInput) {
            // Créer file input si manquant
            this.fileInput = document.createElement('input');
            this.fileInput.type = 'file';
            this.fileInput.id = 'file-input';
            this.fileInput.accept = '.pdf,.jpg,.jpeg,.png,.heic';
            this.fileInput.multiple = true;
            this.fileInput.style.display = 'none';
            document.body.appendChild(this.fileInput);
        }
        
        console.log('✅ Éléments DOM trouvés:', {
            dropzone: !!this.dropzone,
            fileInput: !!this.fileInput
        });
    }

    setupEvents() {
        console.log('⚡ Configuration des événements...');
        
        // Empêcher comportement par défaut sur document
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            document.addEventListener(eventName, this.preventDefaults, false);
        });
        
        // Events sur dropzone
        this.dropzone.addEventListener('dragenter', this.onDragEnter.bind(this));
        this.dropzone.addEventListener('dragover', this.onDragOver.bind(this));
        this.dropzone.addEventListener('dragleave', this.onDragLeave.bind(this));
        this.dropzone.addEventListener('drop', this.onDrop.bind(this));
        this.dropzone.addEventListener('click', this.onDropzoneClick.bind(this));
        
        // Events sur file input
        this.fileInput.addEventListener('change', this.onFileSelect.bind(this));
        
        console.log('✅ Événements configurés');
    }

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    onDragEnter(e) {
        e.preventDefault();
        this.dropzone.classList.add('dragover');
        console.log('📁 Drag enter');
    }

    onDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    }

    onDragLeave(e) {
        e.preventDefault();
        if (!this.dropzone.contains(e.relatedTarget)) {
            this.dropzone.classList.remove('dragover');
            console.log('📁 Drag leave');
        }
    }

    onDrop(e) {
        e.preventDefault();
        this.dropzone.classList.remove('dragover');
        
        const files = Array.from(e.dataTransfer.files);
        console.log('📁 Drop détecté:', files.length, 'fichier(s)');
        
        if (files.length > 0) {
            this.handleFiles(files);
        }
    }

    onDropzoneClick(e) {
        if (!this.isProcessing) {
            this.fileInput.click();
            console.log('🖱️ Click dropzone → ouverture sélecteur');
        }
    }

    onFileSelect(e) {
        const files = Array.from(e.target.files);
        console.log('📁 Fichiers sélectionnés:', files.length);
        
        if (files.length > 0) {
            this.handleFiles(files);
        }
    }

    async handleFiles(files) {
        if (this.isProcessing) {
            console.warn('⚠️ Traitement en cours, ignoré');
            return;
        }

        console.log('🚀 Début traitement fichiers:', files.map(f => f.name));

        for (const file of files) {
            if (this.validateFile(file)) {
                await this.processFile(file);
            }
        }
    }

    validateFile(file) {
        const allowedTypes = [
            'application/pdf',
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/heic',
            'image/heif'
        ];

        const maxSize = 50 * 1024 * 1024; // 50MB

        if (!allowedTypes.includes(file.type)) {
            this.showError(`Type non supporté: ${file.name} (${file.type})`);
            return false;
        }

        if (file.size > maxSize) {
            this.showError(`Fichier trop volumineux: ${file.name} (${this.formatFileSize(file.size)})`);
            return false;
        }

        console.log(`✅ Fichier valide: ${file.name} (${this.formatFileSize(file.size)})`);
        return true;
    }

    async processFile(file) {
        this.isProcessing = true;
        this.currentFile = file;
        
        try {
            console.log(`🔄 Traitement: ${file.name}`);
            
            // 1. Afficher progression
            this.showProcessing(file.name);
            
            // 2. Convertir en image si PDF
            let imageFile = file;
            if (file.type === 'application/pdf') {
                this.updateProgress('Conversion PDF...', 20);
                imageFile = await this.convertPDFToImage(file);
            } else {
                this.updateProgress('Préparation image...', 20);
            }
            
            // 3. OCR avec Tesseract
            this.updateProgress('Analyse OCR...', 40);
            const ocrResult = await this.performOCR(imageFile);
            
            // 4. Parser les données suisses
            this.updateProgress('Extraction données...', 80);
            const parsedData = this.parseSwissData(ocrResult);
            
            // 5. Afficher résultats
            this.updateProgress('Terminé!', 100);
            this.showResults(parsedData);
            
            console.log('✅ Traitement terminé avec succès');
            
        } catch (error) {
            console.error('❌ Erreur traitement:', error);
            this.showError(`Erreur traitement ${file.name}: ${error.message}`);
        } finally {
            this.isProcessing = false;
            setTimeout(() => this.hideProcessing(), 2000);
        }
    }

    async convertPDFToImage(file) {
        console.log('📄 Conversion PDF → Image...');
        
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            console.log(`📄 PDF chargé: ${pdf.numPages} page(s)`);
            
            // Première page seulement
            const page = await pdf.getPage(1);
            
            // Haute résolution pour OCR optimal
            const scale = 3.0; // 300 DPI equivalent
            const viewport = page.getViewport({ scale });
            
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            
            console.log(`📐 Canvas: ${canvas.width}x${canvas.height}px`);
            
            await page.render({ canvasContext: context, viewport }).promise;
            console.log('✅ Page PDF rendue');
            
            // Convertir en blob haute qualité
            return new Promise((resolve) => {
                canvas.toBlob((blob) => {
                    const imageFile = new File([blob], file.name.replace('.pdf', '.png'), {
                        type: 'image/png'
                    });
                    
                    console.log(`✅ Image créée: ${imageFile.name} (${this.formatFileSize(imageFile.size)})`);
                    resolve(imageFile);
                }, 'image/png', 1.0);
            });
            
        } catch (error) {
            console.error('❌ Erreur conversion PDF:', error);
            throw new Error(`Impossible de convertir le PDF: ${error.message}`);
        }
    }

    async performOCR(imageFile) {
        console.log('🤖 Début OCR Tesseract...');
        
        let worker = null;
        
        try {
            // Créer worker simplifié
            worker = await Tesseract.createWorker();
            console.log('✅ Worker créé');
            
            // Charger langues
            await worker.loadLanguage('fra+eng');
            await worker.initialize('fra+eng');
            console.log('✅ Langues chargées');
            
            // Configuration optimisée pour factures
            await worker.setParameters({
                tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz .,:-/€CHF\'',
                tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK
            });
            console.log('✅ Configuration appliquée');
            
            // Reconnaissance avec langues multiples
            const result = await worker.recognize(imageFile);
            console.log('✅ OCR terminé');
            
            return result;
            
        } catch (error) {
            console.error('❌ Erreur OCR:', error);
            throw new Error(`Erreur OCR: ${error.message}`);
        } finally {
            if (worker) {
                await worker.terminate();
                console.log('🧹 Worker nettoyé');
            }
        }
    }

    parseSwissData(ocrResult) {
        console.log('🌍 Parsing INTERNATIONAL MULTI-ENTITÉS...');
        
        const text = ocrResult.data.text;
        
        // 1. Détection intelligente
        const detection = this.detectInvoiceType(text);
        
        // 2. Parser avec patterns adaptés
        if (detection.type === 'client_invoice') {
            return this.parseClientInvoiceGeneric(text, ocrResult, detection);
        } else if (detection.type === 'supplier_invoice') {
            return this.parseSupplierInvoiceGeneric(text, ocrResult, detection);
        } else {
            return this.parseUnknownDocument(text, ocrResult, detection);
        }
    }

    detectInvoiceType(text) {
        console.log('🌍 Détection MULTI-ENTITÉS & MULTI-PAYS...');
        
        let detectedEntity = null;
        let detectedCurrency = null;
        let detectedLanguage = null;
        
        // 1. Détecter quelle entité du groupe
        for (const [entityKey, config] of Object.entries(ENTITIES_CONFIG)) {
            for (const identifier of config.identifiers) {
                if (text.includes(identifier)) {
                    detectedEntity = { key: entityKey, config };
                    console.log(`🏢 Entité détectée: ${config.name}`);
                    break;
                }
            }
            if (detectedEntity) break;
        }
        
        // 2. Détecter la devise
        for (const [currency, pattern] of Object.entries(CURRENCY_PATTERNS)) {
            if (pattern.test(text)) {
                detectedCurrency = currency;
                console.log(`💰 Devise détectée: ${currency}`);
                break;
            }
        }
        
        // 3. Détecter la langue
        for (const [lang, keywords] of Object.entries(KEYWORDS_BY_LANGUAGE)) {
            const keywordMatches = keywords.invoice.filter(kw => 
                text.toLowerCase().includes(kw)
            ).length;
            
            if (keywordMatches > 0) {
                detectedLanguage = lang;
                console.log(`🌐 Langue détectée: ${lang} (${keywordMatches} mots-clés)`);
                break;
            }
        }
        
        // 4. Déterminer le type de document
        let documentType = 'unknown';
        let confidence = 0;
        
        if (detectedEntity) {
            // Position de notre entité dans le document
            const entityPosition = this.findEntityPosition(text, detectedEntity.config.identifiers);
            
            if (entityPosition >= 0 && entityPosition < 10) {
                // Notre entité en haut = document sortant
                documentType = 'client_invoice';
                confidence = 90;
            } else if (entityPosition >= 10) {
                // Notre entité en bas = document entrant  
                documentType = 'supplier_invoice';
                confidence = 80;
            }
        }
        
        return {
            type: documentType,
            confidence: confidence,
            entity: detectedEntity,
            currency: detectedCurrency || 'CHF', // Default
            language: detectedLanguage || 'fr', // Default
            patterns: this.getPatterns(detectedCurrency, detectedLanguage)
        };
    }

    findEntityPosition(text, identifiers) {
        const lines = text.split('\n');
        for (let i = 0; i < lines.length; i++) {
            for (const identifier of identifiers) {
                if (lines[i].includes(identifier)) {
                    return i;
                }
            }
        }
        return -1;
    }

    getPatterns(currency, language) {
        const patterns = {
            amounts: CURRENCY_PATTERNS[currency] || CURRENCY_PATTERNS.CHF,
            keywords: KEYWORDS_BY_LANGUAGE[language] || KEYWORDS_BY_LANGUAGE.fr
        };
        
        console.log('🔧 Patterns sélectionnés:', patterns);
        return patterns;
    }

    parseClientInvoice(text, ocrResult) {
        console.log('📤 Parsing FACTURE CLIENT (sortante)...');
        
        const lines = text.split('\n').map(l => l.trim());
        
        // Pour facture client, on cherche :
        // - Le NOM DU CLIENT (destinataire)
        // - Le montant À ENCAISSER
        // - La date d'échéance
        
        // Patterns facture client
        const patterns = {
            amounts: /\b\d{1,3}(?:'\d{3})*(?:\.\d{2})?\b/g,
            dates: /\d{1,2}[.\/\-]\d{1,2}[.\/\-]\d{2,4}/g,
            invoice: /(?:offer|facture|invoice|devis)[\s#-]*([A-Z0-9\-]+)/i
        };
        
        // Trouver le CLIENT (pas nous!)
        const client = this.extractClient(text);
        
        // Montants
        const amounts = this.extractAmounts(text);
        const dates = text.match(patterns.dates) || [];
        const invoiceMatch = text.match(patterns.invoice);
        
        return {
            document_type: 'client_invoice',
            direction: 'sortante',
            
            // Données CLIENT
            client_name: client,
            client_address: this.extractClientAddress(text),
            
            // Données facture
            invoice_number: invoiceMatch ? invoiceMatch[1] : '',
            date: dates[0] || '',
            due_date: dates[1] || '', // Souvent 2ème date
            
            // Montants
            amount_ht: amounts[0] || '',
            amount_ttc: amounts[0] || '', // Souvent identique sur devis
            
            // Métadonnées
            confidence: Math.round(ocrResult.data.confidence || 85),
            our_company: 'HYPERVISUAL by HMF Corporation SA',
            
            // Interface
            display_title: 'Facture Client (Sortante)',
            display_color: 'success', // Vert = argent à recevoir
            
            raw_text: text
        };
    }

    parseSupplierInvoice(text, ocrResult) {
        console.log('📥 Parsing FACTURE FOURNISSEUR (entrante)...');
        
        // Pour facture fournisseur, on cherche :
        // - Le NOM DU FOURNISSEUR (émetteur)
        // - Le montant À PAYER
        // - L'IBAN du fournisseur
        
        const patterns = {
            amounts: /\b\d{1,3}(?:'\d{3})*(?:\.\d{2})?\b/g,
            che: /CHE[-\s]*\d{3}[.\s]*\d{3}[.\s]*\d{3}/gi,
            iban: /(?:CH|FR|DE|IT)\d{2}[\s]*(?:[A-Z0-9]{4}[\s]*){2,}[A-Z0-9]{1,4}/g,
            dates: /\d{1,2}[.\/\-]\d{1,2}[.\/\-]\d{2,4}/g,
            invoice: /(?:facture|invoice|bill)[\s#-]*([A-Z0-9\-]+)/i
        };
        
        // Trouver le FOURNISSEUR
        const supplier = this.extractSupplier(text);
        const amounts = this.extractAmounts(text);
        const ibans = text.match(patterns.iban) || [];
        const dates = text.match(patterns.dates) || [];
        const invoiceMatch = text.match(patterns.invoice);
        
        return {
            document_type: 'supplier_invoice', 
            direction: 'entrante',
            
            // Données FOURNISSEUR
            supplier_name: supplier,
            supplier_iban: ibans[0] || '',
            
            // Données facture
            invoice_number: invoiceMatch ? invoiceMatch[1] : '',
            date: dates[0] || '',
            due_date: dates[1] || '',
            
            // Montants
            amount_ht: amounts[0] || '',
            amount_ttc: amounts[amounts.length - 1] || amounts[0] || '',
            
            // Métadonnées
            confidence: Math.round(ocrResult.data.confidence || 85),
            
            // Interface
            display_title: 'Facture Fournisseur (Entrante)',
            display_color: 'danger', // Rouge = argent à payer
            
            raw_text: text
        };
    }

    parseGenericInvoice(text, ocrResult) {
        console.log('📄 Parsing générique...');
        
        // Patterns améliorés Suisse
        const patterns = {
            // Montants - gère espaces et retours à la ligne
            amounts: /(?:CHF|EUR|USD)[\s\n]*[\d']+(?:[.,]\d{1,2})?|[\d']+(?:[.,]\d{1,2})?[\s\n]*(?:CHF|EUR|USD)/g,
            
            // CHE plus flexible
            che: /CHE[-\s]*\d{3}[.\s]*\d{3}[.\s]*\d{3}(?:\s*TVA)?/gi,
            
            // IBAN Suisse et international
            iban: /(?:CH|GB|FR|DE|IT)\d{2}[\s]*(?:[A-Z0-9]{4}[\s]*){2,}[A-Z0-9]{1,4}/g,
            
            // Dates multiples formats
            dates: /\d{1,2}[.\/\-]\d{1,2}[.\/\-]\d{2,4}/g,
            
            // TVA rates
            vat: /(?:TVA|MwSt|VAT)[\s]*[\d.,]+\s*%|[\d.,]+\s*%[\s]*(?:TVA|MwSt|VAT)/gi,
            
            // Facture/Offre/Devis - AMÉLIORÉ
            invoice: /(?:FACTURE|INVOICE|OFFER|OFFRE|DEVIS|REF|N°|NO)[:\s#-]*([A-Z0-9\-]{2,})/i,
            
            // Patterns spécifiques document
            totals: /(?:TOTAL|Total|MONTANT|Montant)[\s:]*(?:CHF|EUR)?\s*[\d']+(?:[.,]\d{2})?/gi,
            subtotals: /(?:SOUS.TOTAL|Subtotal|NET)[\s:]*(?:CHF|EUR)?\s*[\d']+(?:[.,]\d{2})?/gi
        };

        // Extraction
        const amounts = this.extractAmounts(text);
        const cheNumbers = text.match(patterns.che) || [];
        const ibans = text.match(patterns.iban) || [];
        const dates = text.match(patterns.dates) || [];
        const vatRates = text.match(patterns.vat) || [];
        const invoiceMatch = text.match(patterns.invoice);
        
        // Debug extraction
        console.log('🔍 Debug extraction:', {
            invoiceMatch,
            amounts,
            dates,
            cheNumbers
        });

        // Fournisseur (entre émetteur et destinataire)
        const supplier = this.extractSupplier(text);

        // Analyse des montants
        let amount_ht = '';
        let amount_ttc = '';

        if (amounts.length > 0) {
            // Si un seul montant, c'est probablement le total
            if (amounts.length === 1) {
                amount_ttc = amounts[0];
                amount_ht = amounts[0]; // Même valeur si pas de TVA
            } else {
                // Prendre les 2 plus gros montants (HT et TTC)
                const sortedAmounts = amounts
                    .map(a => ({ original: a, value: parseFloat(a.replace(/'/g, '')) }))
                    .sort((a, b) => b.value - a.value);
                
                amount_ttc = sortedAmounts[0]?.original || '';
                amount_ht = sortedAmounts[1]?.original || sortedAmounts[0]?.original || '';
            }
        }

        console.log('💰 Montants analysés:', { amount_ht, amount_ttc, all_amounts: amounts });

        const result = {
            supplier: supplier,
            invoice_number: invoiceMatch ? invoiceMatch[2] : '',
            date: dates[0] || '',
            amount_ht: amount_ht,
            amount_ttc: amount_ttc,
            vat_rate: vatRates[0] || 'Hors TVA',
            che_number: cheNumbers[0] || '',
            iban: ibans[0] || '',
            confidence: Math.round(ocrResult.data.confidence || 85),
            raw_text: text,
            extracted_data: {
                amounts_found: amounts,
                dates_found: dates,
                che_found: cheNumbers,
                ibans_found: ibans,
                invoice_matches: invoiceMatch
            }
        };

        console.log('📊 Données extraites:', result);
        return result;
    }

    extractSupplier(text) {
        console.log('🏢 Extraction fournisseur...');
        
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        
        // Chercher les lignes avec des suffixes d'entreprise
        const businessSuffixes = ['SA', 'AG', 'GmbH', 'Sàrl', 'SARL', 'Ltd', 'Inc', 'SAS', 'S.L.'];
        
        for (let i = 0; i < Math.min(lines.length, 15); i++) {
            const line = lines[i];
            
            // Si la ligne contient un suffixe business
            if (businessSuffixes.some(suffix => line.includes(suffix))) {
                console.log(`🏢 Fournisseur trouvé: "${line}" (ligne ${i})`);
                return line;
            }
        }
        
        // Fallback: première ligne significative
        for (const line of lines.slice(0, 5)) {
            if (line.length > 5 && /[a-zA-Z]/.test(line) && !line.includes('@')) {
                console.log(`🏢 Fournisseur fallback: "${line}"`);
                return line;
            }
        }
        
        return 'Fournisseur non détecté';
    }

    extractAmounts(text) {
        console.log('💰 Extraction montants avancée...');
        
        const amounts = [];
        const lines = text.split('\n');
        
        // Méthode 1: Chercher les lignes avec montants formatés
        for (const line of lines) {
            // Pattern pour montants avec apostrophes : 1'190.00
            const formattedAmounts = line.match(/\b\d{1,3}(?:'\d{3})*(?:\.\d{2})?\b/g);
            if (formattedAmounts) {
                for (const amount of formattedAmounts) {
                    const numValue = parseFloat(amount.replace(/'/g, ''));
                    // Seulement les montants > 10 (éviter les quantités)
                    if (numValue > 10) {
                        amounts.push(amount);
                        console.log(`💰 Montant trouvé: ${amount} (ligne: "${line.trim()}")`);
                    }
                }
            }
        }
        
        // Méthode 2: Chercher spécifiquement dans les lignes avec "Total", "price", etc.
        const priceLines = lines.filter(line => 
            /(?:total|price|sum|montant|prix)/i.test(line) && 
            /\d/.test(line)
        );
        
        for (const line of priceLines) {
            const nums = line.match(/\b\d{1,3}(?:'\d{3})*(?:\.\d{2})?\b/g) || [];
            for (const num of nums) {
                const val = parseFloat(num.replace(/'/g, ''));
                if (val > 10 && !amounts.includes(num)) {
                    amounts.push(num);
                    console.log(`💰 Montant prix trouvé: ${num} (ligne: "${line.trim()}")`);
                }
            }
        }
        
        // Nettoyer et retourner
        const uniqueAmounts = [...new Set(amounts)];
        console.log('💰 Montants finaux:', uniqueAmounts);
        
        return uniqueAmounts;
    }

    extractClient(text) {
        console.log('👤 Extraction nom CLIENT...');
        
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        
        // Dans un devis/facture client, le client est souvent après notre nom
        let foundOurCompany = false;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // Skip notre entreprise
            if (line.includes('HYPERVISUAL')) {
                foundOurCompany = true;
                continue;
            }
            
            // Après avoir trouvé notre nom, chercher le client
            if (foundOurCompany && line.length > 5) {
                // Possible nom de client
                if (/[A-Z].*(?:S\.L\.|SA|GmbH|Ltd|Inc)/.test(line)) {
                    console.log(`👤 Client trouvé: "${line}"`);
                    return line;
                }
            }
        }
        
        // Fallback: chercher des patterns de noms d'entreprise
        for (const line of lines) {
            if (/^[A-Z][A-Z\s&]+(?:S\.L\.|SA|GmbH|Ltd|SARL)$/.test(line)) {
                if (!line.includes('HYPERVISUAL')) {
                    console.log(`👤 Client fallback: "${line}"`);
                    return line;
                }
            }
        }
        
        return 'Client non détecté';
    }

    extractClientAddress(text) {
        console.log('📍 Extraction adresse client...');
        
        const lines = text.split('\n').map(l => l.trim());
        let clientFound = false;
        let addressParts = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // Si on trouve le client
            if (/(?:S\.L\.|SA|GmbH|Ltd|Inc)/.test(line) && !line.includes('HYPERVISUAL')) {
                clientFound = true;
                continue;
            }
            
            // Après le client, chercher l'adresse (2-3 lignes suivantes)
            if (clientFound && addressParts.length < 3) {
                if (line.length > 3 && !/^(HYPERVISUAL|Tel|Email|IBAN)/.test(line)) {
                    addressParts.push(line);
                }
            }
        }
        
        return addressParts.join(', ') || '';
    }

    // Nouvelles méthodes génériques multi-entités
    parseClientInvoiceGeneric(text, ocrResult, detection) {
        console.log(`📤 Parsing CLIENT (${detection.entity?.config.name || 'Unknown'}) - ${detection.currency}`);
        
        // Utiliser les patterns détectés
        const amounts = this.extractAmountsGeneric(text, detection.patterns.amounts);
        const dates = this.extractDatesGeneric(text);
        const invoiceNumber = this.extractInvoiceNumberGeneric(text, detection.patterns.keywords);
        const clientName = this.extractClientGeneric(text, detection.entity?.config.identifiers || []);
        
        return {
            success: true,
            text: text,
            confidence: Math.round(ocrResult.data.confidence || 85),
            extractedData: {
                document_type: 'client_invoice',
                direction: 'sortante',
                
                // Données adaptatives
                entity_detected: detection.entity?.config.name || 'Entité inconnue',
                entity_key: detection.entity?.key || 'unknown',
                currency_detected: detection.currency,
                language_detected: detection.language,
                
                // Données extraites
                client: {
                    name: clientName || 'Client non détecté',
                    type: 'destinataire'
                },
                
                invoice: {
                    number: invoiceNumber || '',
                    date: dates[0] || '',
                    due_date: dates[1] || ''
                },
                
                amounts: {
                    subtotal: amounts[0] || '',
                    vat: amounts[1] || '',
                    total: amounts[amounts.length - 1] || amounts[0] || '',
                    currency: detection.currency
                },
                
                // Interface adaptative
                display: {
                    title: `Facture Client (${detection.currency})`,
                    subtitle: `À encaisser de: ${clientName || 'Client à identifier'}`,
                    color: 'success',
                    icon: 'ti-cash-banknote',
                    badge: `À ENCAISSER - ${detection.entity?.config.name || 'Groupe'}`
                }
            },
            metadata: {
                processingTime: Date.now(),
                language: detection.language,
                documentType: 'client_invoice',
                detection_confidence: detection.confidence
            }
        };
    }

    parseSupplierInvoiceGeneric(text, ocrResult, detection) {
        console.log(`📥 Parsing SUPPLIER (${detection.entity?.config.name || 'Unknown'}) - ${detection.currency}`);
        
        // Utiliser les patterns détectés
        const supplier = this.extractSupplierGeneric(text, detection.entity?.config.identifiers || []);
        const amounts = this.extractAmountsGeneric(text, detection.patterns.amounts);
        const dates = this.extractDatesGeneric(text);
        const invoiceNumber = this.extractInvoiceNumberGeneric(text, detection.patterns.keywords);
        const vatNumber = this.extractVATNumberGeneric(text, detection.entity?.config.vat_format);
        const iban = this.extractIBANGeneric(text, detection.entity?.config.iban_format);
        
        return {
            success: true,
            text: text,
            confidence: Math.round(ocrResult.data.confidence || 85),
            extractedData: {
                document_type: 'supplier_invoice',
                direction: 'entrante',
                
                // Données adaptatives
                entity_detected: detection.entity?.config.name || 'Entité inconnue',
                entity_key: detection.entity?.key || 'unknown',
                currency_detected: detection.currency,
                language_detected: detection.language,
                
                supplier: {
                    name: supplier || 'Fournisseur non détecté',
                    vatNumber: vatNumber || '',
                    type: 'émetteur'
                },
                
                invoice: {
                    number: invoiceNumber || '',
                    date: dates[0] || '',
                    due_date: dates[1] || ''
                },
                
                amounts: {
                    subtotal: amounts[0] || '',
                    vat: amounts[1] || '',
                    total: amounts[amounts.length - 1] || amounts[0] || '',
                    currency: detection.currency
                },
                
                banking: {
                    iban: iban || ''
                },
                
                // Interface adaptative
                display: {
                    title: `Facture Fournisseur (${detection.currency})`,
                    subtitle: `À payer à: ${supplier || 'Fournisseur à identifier'}`,
                    color: 'danger',
                    icon: 'ti-file-invoice',
                    badge: `À PAYER - ${detection.entity?.config.name || 'Groupe'}`
                }
            },
            metadata: {
                processingTime: Date.now(),
                language: detection.language,
                documentType: 'supplier_invoice',
                detection_confidence: detection.confidence
            }
        };
    }

    parseUnknownDocument(text, ocrResult, detection) {
        console.log('❓ Document type inconnu');
        
        return {
            success: true,
            text: text,
            confidence: Math.round(ocrResult.data.confidence || 50),
            extractedData: {
                document_type: 'unknown',
                direction: 'unknown',
                
                entity_detected: detection.entity?.config.name || 'Aucune entité détectée',
                currency_detected: detection.currency || 'Non détectée',
                language_detected: detection.language || 'Non détectée',
                
                display: {
                    title: 'Document non identifié',
                    subtitle: 'Nécessite une vérification manuelle',
                    color: 'warning',
                    icon: 'ti-question-mark',
                    badge: 'À VÉRIFIER'
                }
            },
            metadata: {
                processingTime: Date.now(),
                documentType: 'unknown'
            }
        };
    }

    // Méthodes d'extraction génériques
    extractAmountsGeneric(text, amountPattern) {
        console.log('💰 Extraction montants avec pattern:', amountPattern);
        const matches = text.match(amountPattern) || [];
        return matches.map(m => m.trim());
    }

    extractDatesGeneric(text) {
        const datePattern = /\d{1,2}[.\/\-]\d{1,2}[.\/\-]\d{2,4}/g;
        return text.match(datePattern) || [];
    }

    extractInvoiceNumberGeneric(text, keywords) {
        let pattern = new RegExp(`(?:${keywords.invoice.join('|')})\\s*[:#-]?\\s*([A-Z0-9\\-]+)`, 'i');
        const match = text.match(pattern);
        return match ? match[1] : '';
    }

    extractClientGeneric(text, entityIdentifiers) {
        const lines = text.split('\n').map(l => l.trim());
        let foundEntity = false;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // Skip notre entité
            if (entityIdentifiers.some(id => line.includes(id))) {
                foundEntity = true;
                continue;
            }
            
            // Après notre entité, chercher le client
            if (foundEntity && line.length > 5) {
                if (/[A-Z].*(?:S\.L\.|SA|GmbH|Ltd|Inc|SAS|SARL)/.test(line)) {
                    return line;
                }
            }
        }
        
        return 'Client non détecté';
    }

    extractSupplierGeneric(text, entityIdentifiers) {
        const lines = text.split('\n').map(l => l.trim());
        
        for (const line of lines.slice(0, 15)) {
            // Ne pas prendre notre entité
            if (entityIdentifiers.some(id => line.includes(id))) {
                continue;
            }
            
            // Chercher des noms d'entreprise
            if (/(?:SA|AG|GmbH|Sàrl|SARL|Ltd|Inc|SAS|S\.L\.)/.test(line)) {
                return line;
            }
        }
        
        return 'Fournisseur non détecté';
    }

    extractVATNumberGeneric(text, vatPattern) {
        if (!vatPattern) return '';
        const match = text.match(vatPattern);
        return match ? match[0] : '';
    }

    extractIBANGeneric(text, ibanPattern) {
        if (!ibanPattern) return '';
        const match = text.match(ibanPattern);
        return match ? match[0] : '';
    }

    // Interface utilisateur
    showProcessing(filename) {
        // Masquer résultats précédents
        const results = document.getElementById('ocr-results-container');
        if (results) results.innerHTML = '';
        
        // Créer élément de progression
        const processing = document.createElement('div');
        processing.className = 'alert alert-info';
        processing.innerHTML = `
            <div class="d-flex align-items-center">
                <div class="spinner-border spinner-border-sm me-3" role="status"></div>
                <div class="flex-fill">
                    <strong>Traitement: ${filename}</strong>
                    <div class="progress mt-2">
                        <div class="progress-bar progress-bar-striped progress-bar-animated" 
                             id="progress-bar" style="width: 0%"></div>
                    </div>
                    <small class="text-muted" id="progress-status">Initialisation...</small>
                </div>
            </div>
        `;
        
        const container = document.getElementById('ocr-results-container');
        if (container) {
            container.appendChild(processing);
        }
        
        console.log(`📺 Interface: Affichage progression pour ${filename}`);
    }

    updateProgress(message, percent) {
        const statusEl = document.getElementById('progress-status');
        if (statusEl) statusEl.textContent = message;
        
        const progressBar = document.getElementById('progress-bar');
        if (progressBar) progressBar.style.width = percent + '%';
        
        console.log(`📊 Progress: ${message} (${percent}%)`);
    }

    hideProcessing() {
        const alerts = document.querySelectorAll('.alert-info');
        alerts.forEach(alert => {
            if (alert.textContent.includes('Traitement:')) {
                alert.remove();
            }
        });
    }

    showResults(parsedResult) {
        console.log('📺 Affichage des résultats:', parsedResult);
        
        const data = parsedResult.extractedData || parsedResult;
        
        // Déterminer le type et la couleur
        const isClientInvoice = data.document_type === 'client_invoice';
        const bgColor = data.display?.color || (isClientInvoice ? 'success' : 'danger');
        const icon = data.display?.icon || (isClientInvoice ? 'ti-cash-banknote' : 'ti-file-invoice');
        const title = data.display?.title || 'Données extraites';
        const badge = data.display?.badge || 'Document';
        
        // Créer carte de résultats adaptée au type
        const resultsCard = document.createElement('div');
        resultsCard.className = 'card';
        resultsCard.innerHTML = `
            <div class="card-header bg-${bgColor}-lt">
                <h3 class="card-title">
                    <i class="${icon}"></i> ${title}
                </h3>
                <div class="card-actions">
                    <span class="badge bg-${bgColor}">
                        ${badge}
                    </span>
                    ${data.entity_detected ? `<span class="badge bg-info">${data.entity_detected}</span>` : ''}
                    ${data.currency_detected ? `<span class="badge bg-primary">${data.currency_detected}</span>` : ''}
                    <span class="badge ${parsedResult.confidence >= 90 ? 'bg-success' : parsedResult.confidence >= 70 ? 'bg-warning' : 'bg-danger'}">
                        Confiance: ${parsedResult.confidence}%
                    </span>
                </div>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-6">
                        ${isClientInvoice ? `
                            <div class="mb-3">
                                <label class="form-label">👤 Client</label>
                                <input type="text" class="form-control" value="${data.client?.name || data.client_name || ''}" id="result-client">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">📍 Adresse client</label>
                                <input type="text" class="form-control" value="${data.client?.address || data.client_address || ''}" id="result-client-address">
                            </div>
                        ` : `
                            <div class="mb-3">
                                <label class="form-label">🏢 Fournisseur</label>
                                <input type="text" class="form-control" value="${data.supplier?.name || data.supplier_name || data.supplier || ''}" id="result-supplier">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">🏦 IBAN Fournisseur</label>
                                <input type="text" class="form-control" value="${data.banking?.iban || data.supplier_iban || data.iban || ''}" id="result-iban">
                            </div>
                        `}
                        <div class="mb-3">
                            <label class="form-label">📄 N° Document</label>
                            <input type="text" class="form-control" value="${data.invoice?.number || data.invoice_number || ''}" id="result-invoice">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">📅 Date</label>
                            <input type="text" class="form-control" value="${data.invoice?.date || data.date || ''}" id="result-date">
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label class="form-label">💰 Montant HT</label>
                            <input type="text" class="form-control" value="${data.amounts?.subtotal || data.amount_ht || ''}" id="result-amount-ht">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">💰 Montant TTC ${data.amounts?.currency ? `(${data.amounts.currency})` : ''}</label>
                            <input type="text" class="form-control font-weight-bold" value="${data.amounts?.total || data.amount_ttc || ''}" id="result-amount-ttc">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">📊 TVA</label>
                            <input type="text" class="form-control" value="${data.amounts?.vat || data.vat_rate || 'Hors TVA'}" id="result-vat">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">📅 Échéance</label>
                            <input type="text" class="form-control" value="${data.invoice?.due_date || data.due_date || ''}" id="result-due-date">
                        </div>
                    </div>
                </div>
                <div class="mt-3">
                    <details>
                        <summary>Données brutes extraites</summary>
                        <div class="mt-2">
                            ${data.extracted_data.amounts_found.length > 0 ? `<p><strong>Montants:</strong> ${data.extracted_data.amounts_found.join(', ')}</p>` : ''}
                            ${data.extracted_data.dates_found.length > 0 ? `<p><strong>Dates:</strong> ${data.extracted_data.dates_found.join(', ')}</p>` : ''}
                            ${data.extracted_data.che_found.length > 0 ? `<p><strong>CHE:</strong> ${data.extracted_data.che_found.join(', ')}</p>` : ''}
                            ${data.extracted_data.ibans_found.length > 0 ? `<p><strong>IBANs:</strong> ${data.extracted_data.ibans_found.join(', ')}</p>` : ''}
                        </div>
                    </details>
                </div>
            </div>
            <div class="card-footer">
                <button class="btn btn-success" onclick="ocrProcessor.validateDocument()">
                    <i class="ti ti-check"></i> Valider
                </button>
                <button class="btn btn-warning ms-2" onclick="ocrProcessor.editDocument()">
                    <i class="ti ti-pencil"></i> Modifier
                </button>
                <button class="btn btn-danger ms-2" onclick="ocrProcessor.rejectDocument()">
                    <i class="ti ti-x"></i> Rejeter
                </button>
            </div>
        `;
        
        const container = document.getElementById('ocr-results-container');
        if (container) {
            container.appendChild(resultsCard);
        }
        
        this.results = data;
        console.log('✅ Résultats affichés');
    }

    showError(message) {
        console.error('❌ Erreur:', message);
        
        // Créer toast d'erreur
        const toast = document.createElement('div');
        toast.className = 'alert alert-danger alert-dismissible fade show';
        toast.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        // Insérer dans le container de résultats
        const container = document.getElementById('ocr-results-container');
        if (container) {
            container.appendChild(toast);
        }
        
        // Auto-remove après 5s
        setTimeout(() => {
            if (toast.parentNode) toast.remove();
        }, 5000);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Actions utilisateur
    validateDocument() {
        if (!this.results) {
            this.showError('Aucun document à valider');
            return;
        }
        
        console.log('✅ Validation document:', this.results);
        this.showError('Document validé avec succès ! (Intégration API à implémenter)');
        
        // TODO: Intégration avec API backend
    }

    editDocument() {
        if (!this.results) {
            this.showError('Aucun document à modifier');
            return;
        }
        
        console.log('✏️ Édition document:', this.results);
        // Focus sur le premier champ
        document.getElementById('result-supplier')?.focus();
    }

    rejectDocument() {
        if (!this.results) {
            this.showError('Aucun document à rejeter');
            return;
        }
        
        console.log('❌ Rejet document:', this.results);
        
        // Reset interface
        const container = document.getElementById('ocr-results-container');
        if (container) container.innerHTML = '';
        this.results = null;
        
        this.showError('Document rejeté');
    }

    // Tests automatiques
    async runSelfTests() {
        console.log('🧪 Tests automatiques...');
        
        const tests = {
            dom: false,
            dependencies: false,
            tesseract: false
        };
        
        try {
            // Test 1: Éléments DOM
            if (this.dropzone && this.fileInput) {
                tests.dom = true;
                console.log('✅ Test DOM: OK');
            }
            
            // Test 2: Dépendances
            if (typeof pdfjsLib !== 'undefined' && typeof Tesseract !== 'undefined') {
                tests.dependencies = true;
                console.log('✅ Test dépendances: OK');
            }
            
            // Test 3: Worker Tesseract simple
            const testWorker = await Tesseract.createWorker();
            await testWorker.terminate();
            tests.tesseract = true;
            console.log('✅ Test Tesseract: OK');
            
            console.log('📊 Résumé tests:', tests);
            
            // Retourner true si tous les tests passent
            return Object.values(tests).every(t => t === true);
            
        } catch (error) {
            console.warn('⚠️ Tests échoués:', error);
            return false;
        }
    }
}

// Instance globale
window.ocrProcessor = new OCRProcessorV3();

// Auto-initialisation
document.addEventListener('DOMContentLoaded', () => {
    window.ocrProcessor.init();
});

// Export pour tests
window.OCRProcessorV3 = OCRProcessorV3;