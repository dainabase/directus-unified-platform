/**
 * OCR OpenAI Vision Module
 * Remplacement complet de Tesseract.js par OpenAI Vision API
 * Extraction intelligente de documents avec mapping Notion automatique
 * 
 * @version 2.0.0
 * @author Dashboard SuperAdmin
 */

class OCROpenAIVision {
    constructor(apiKey = null) {
        console.log('🚀 OCR OpenAI Vision v2.0.0 - Initialisation');
        
        this.apiKey = apiKey || localStorage.getItem('openai_api_key');
        this.apiEndpoint = 'https://api.openai.com/v1/chat/completions';
        // Permettre le choix du modèle via localStorage ou utiliser gpt-4o-mini par défaut
        this.model = localStorage.getItem('openai_model') || 'gpt-4o-mini';
        this.maxImageSize = 20 * 1024 * 1024; // 20MB max
        
        console.log(`🤖 Modèle OpenAI sélectionné: ${this.model}`);
        
        // Configuration par défaut
        this.config = {
            maxTokens: 4096,
            temperature: 0.1,
            detailLevel: 'high', // 'low' | 'high' | 'auto'
            supportedFormats: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'],
            timeout: 30000 // 30 secondes
        };
        
        // Schémas Notion (importés depuis ocr-notion-workflow.js)
        this.notionSchemas = this.loadNotionSchemas();
        
        this.initialized = false;
    }
    
    /**
     * Initialisation et vérification
     */
    async init() {
        try {
            if (!this.apiKey) {
                throw new Error('Clé API OpenAI manquante. Configurez: localStorage.setItem("openai_api_key", "sk-...")');
            }
            
            // Vérifier la clé API
            const isValid = await this.validateAPIKey();
            if (!isValid) {
                throw new Error('Clé API OpenAI invalide');
            }
            
            // Vérifier que le modèle est supporté
            const supportedModels = ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'];
            if (!supportedModels.includes(this.model)) {
                console.warn(`⚠️ Modèle ${this.model} non reconnu, utilisation de gpt-4o-mini`);
                this.model = 'gpt-4o-mini';
            }
            
            this.initialized = true;
            console.log(`✅ OpenAI Vision initialisé avec succès (${this.model})`);
            
            return true;
        } catch (error) {
            console.error('❌ Erreur initialisation OpenAI Vision:', error);
            throw error;
        }
    }
    
    /**
     * Validation de la clé API
     */
    async validateAPIKey() {
        try {
            const response = await fetch('https://api.openai.com/v1/models', {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });
            
            return response.ok;
        } catch (error) {
            return false;
        }
    }
    
    /**
     * Charger les schémas Notion
     */
    loadNotionSchemas() {
        // Import des schémas depuis le workflow existant
        if (window.OCRNotionWorkflow && window.DOCUMENT_TYPES) {
            return window.DOCUMENT_TYPES;
        }
        
        // Schémas par défaut si non disponibles
        return {
            FACTURE_FOURNISSEUR: {
                notionDB: "237adb95-3c6f-80de-9f92-c795334e5561",
                fields: {
                    "Numéro Facture": { type: "text", required: true },
                    "Fournisseur": { type: "text", required: true },
                    "Date Facture": { type: "date", required: true },
                    "Montant TTC": { type: "number", required: true },
                    "Devise": { type: "select", options: ["CHF", "EUR", "USD"], default: "CHF" }
                }
            },
            FACTURE_CLIENT: {
                notionDB: "226adb95-3c6f-8011-a9bb-ca31f7da8e6a",
                fields: {
                    "Numéro": { type: "text", required: true },
                    "Client": { type: "text", required: true },
                    "Montant TTC": { type: "number", required: true },
                    "Statut": { type: "select", options: ["Envoyé", "Payé"], default: "Envoyé" }
                }
            }
        };
    }
    
    /**
     * Traitement principal d'un document
     */
    async processDocument(file, options = {}) {
        const startTime = performance.now();
        
        try {
            if (!this.initialized) {
                await this.init();
            }
            
            console.log(`📄 Traitement du document: ${file.name}`);
            
            // 1. Validation du fichier
            this.validateFile(file);
            
            // 2. Conversion en base64
            const base64Image = await this.fileToBase64(file);
            
            // 3. Détection du type de document et extraction
            const extractionResult = await this.extractWithVision(base64Image, file);
            
            // 4. Mapping vers schéma Notion
            const mappedData = await this.mapToNotionSchema(
                extractionResult.documentType,
                extractionResult.extractedData
            );
            
            // 5. Validation finale
            const validation = await this.validateExtractedData(
                extractionResult.documentType,
                mappedData
            );
            
            const processingTime = performance.now() - startTime;
            
            return {
                success: true,
                documentType: extractionResult.documentType,
                confidence: extractionResult.confidence,
                extractedData: mappedData,
                validation: validation,
                rawData: extractionResult.rawData,
                processingTime: processingTime,
                method: 'openai-vision'
            };
            
        } catch (error) {
            console.error('❌ Erreur traitement document:', error);
            
            return {
                success: false,
                error: error.message,
                processingTime: performance.now() - startTime
            };
        }
    }
    
    /**
     * Validation du fichier
     */
    validateFile(file) {
        const maxSize = 20 * 1024 * 1024; // 20MB OpenAI limit
        const allowedTypes = [
            'application/pdf',        // PDF (sera converti)
            'image/jpeg',
            'image/jpg', 
            'image/png',
            'image/webp',
            'image/heic',
            'image/tiff',
            'image/bmp'
        ];
        
        if (file.size > maxSize) {
            throw new Error(`Fichier trop volumineux: ${(file.size/1024/1024).toFixed(1)}MB (max 20MB)`);
        }
        
        if (!allowedTypes.includes(file.type)) {
            throw new Error(`Type non supporté: ${file.type}. Formats acceptés: PDF, JPG, PNG, WebP`);
        }
        
        // Validation spéciale pour PDF
        if (file.type === 'application/pdf' && file.size > 10 * 1024 * 1024) {
            console.warn('⚠️ PDF volumineux, la conversion peut prendre du temps...');
        }
        
        return true;
    }
    
    /**
     * Conversion fichier en base64
     */
    async fileToBase64(file) {
        try {
            if (file.type === 'application/pdf') {
                // Traitement spécial pour PDF
                return await this.extractFirstPageFromPDF(file);
            } else {
                // Traitement normal pour images
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => {
                        const base64 = reader.result.split(',')[1];
                        resolve(base64);
                    };
                    reader.onerror = () => reject(new Error('Erreur lecture fichier'));
                    reader.readAsDataURL(file);
                });
            }
        } catch (error) {
            throw new Error(`Conversion base64 échouée: ${error.message}`);
        }
    }
    
    /**
     * Extraction de la première page d'un PDF
     */
    async extractFirstPageFromPDF(file) {
        let pdf = null;
        let page = null;
        let canvas = null;
        
        try {
            console.log('📄 Conversion PDF → Image avec PDF.js...');
            
            // Lire le fichier PDF
            const arrayBuffer = await file.arrayBuffer();
            pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            
            // Prendre la première page
            page = await pdf.getPage(1);
            
            // Calculer la taille optimale (max 2048px pour OpenAI)
            const viewport = page.getViewport({ scale: 1.0 });
            const scale = Math.min(2048 / viewport.width, 2048 / viewport.height, 2.0);
            const scaledViewport = page.getViewport({ scale });
            
            // Créer canvas
            canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = scaledViewport.width;
            canvas.height = scaledViewport.height;
            
            // Render la page sur le canvas
            const renderContext = {
                canvasContext: context,
                viewport: scaledViewport
            };
            
            await page.render(renderContext).promise;
            
            // Convertir canvas → base64
            const base64 = canvas.toDataURL('image/jpeg', 0.85);
            
            console.log(`✅ PDF converti: ${Math.round(base64.length/1024)}KB`);
            return base64.split(',')[1]; // Retourner sans préfixe data:
            
        } catch (error) {
            console.error('❌ Erreur conversion PDF:', error);
            throw new Error(`Échec conversion PDF: ${error.message}`);
        } finally {
            // Nettoyage complet des ressources PDF.js
            if (page) {
                page.cleanup();
            }
            
            if (pdf) {
                pdf.destroy();
            }
            
            if (canvas) {
                // Nettoyer le contexte
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                }
                
                // Libérer la mémoire du canvas
                canvas.width = 0;
                canvas.height = 0;
                
                // Retirer du DOM si ajouté
                if (canvas.parentNode) {
                    canvas.remove();
                }
            }
            
            // Forcer garbage collection si disponible
            if (window.gc) {
                window.gc();
            }
        }
    }
    
    /**
     * Extraction avec OpenAI Vision
     */
    async extractWithVision(base64Image, file) {
        console.log('🔍 Extraction OpenAI Vision en cours...');
        
        const prompt = this.buildVisionPrompt();
        
        const requestBody = {
            model: this.model,
            messages: [
                {
                    role: "system",
                    content: "Tu es un expert en extraction de données de documents financiers. Tu dois analyser l'image et extraire toutes les informations pertinentes en JSON structuré."
                },
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: prompt
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:image/jpeg;base64,${base64Image}`,
                                detail: this.config.detailLevel
                            }
                        }
                    ]
                }
            ],
            max_tokens: this.config.maxTokens,
            temperature: this.config.temperature
        };
        
        const response = await this.makeAPIRequest(requestBody);
        
        // Parser la réponse JSON
        const content = response.choices[0].message.content;
        const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/);
        const jsonString = jsonMatch ? jsonMatch[1] : content;
        
        try {
            const parsedData = JSON.parse(jsonString);
            
            return {
                documentType: parsedData.document_type || 'UNKNOWN',
                confidence: parsedData.confidence || 0.8,
                extractedData: parsedData.extracted_data || {},
                rawData: parsedData
            };
        } catch (error) {
            console.error('❌ Erreur parsing JSON:', error);
            throw new Error('Réponse OpenAI invalide');
        }
    }
    
    /**
     * Construction du prompt pour Vision
     */
    buildVisionPrompt() {
        const notionSchemasSummary = this.summarizeNotionSchemas();
        
        return `Analyse cette image de document et extrais TOUTES les informations en suivant ces instructions:

1. DETECTION DU TYPE DE DOCUMENT
   - Si émetteur = HYPERVISUAL/DAINAMICS/ENKI REALITY/TAKEOUT/LEXAIA → FACTURE_CLIENT
   - Si destinataire = une de ces entités → FACTURE_FOURNISSEUR
   - Cherche: facture, devis, contrat, note de frais, ticket

2. EXTRACTION OBLIGATOIRE
   - Émetteur: nom complet, adresse, numéro TVA
   - Destinataire/Client: nom COMPLET (très important!), adresse
   - Numéro document: facture, devis, référence
   - Dates: émission, échéance (format YYYY-MM-DD)
   - Montants: HT, TVA, TTC avec la devise
   - Devise: détecter EUR/CHF/USD/GBP
   - Lignes détaillées si présentes
   - Statut TVA: "hors_tva" si HT only, "ttc" si avec TVA

3. SCHEMAS NOTION DISPONIBLES:
${notionSchemasSummary}

4. FORMAT DE REPONSE OBLIGATOIRE:
\`\`\`json
{
  "document_type": "FACTURE_CLIENT|FACTURE_FOURNISSEUR|CONTRAT|NOTE_FRAIS",
  "confidence": 0.95,
  "extracted_data": {
    "numero": "AN-00094",
    "emetteur": {
      "nom": "HYPERVISUAL by HMF Corporation SA",
      "adresse": "Avenue de Beauregard 1, 1700 Fribourg",
      "numero_tva": "CHE-317.833.626"
    },
    "client": {
      "nom": "PROMIDEA SRL",
      "adresse": "Via Alessandro Manzoni, 15, 20121 Milano MI",
      "pays": "Italy",
      "numero_tva": "IT12345678901"
    },
    "date_emission": "2025-07-21",
    "date_echeance": "2025-08-04",
    "devise": "EUR",
    "montant_ht": 3020.00,
    "montant_tva": 244.62,
    "montant_ttc": 3264.62,
    "taux_tva": 8.1,
    "statut_tva": "ttc",
    "lignes": [
      {
        "description": "Social Media Management (3 months)",
        "quantite": 3,
        "prix_unitaire": 840.00,
        "total": 2520.00
      }
    ],
    "conditions_paiement": "30 days net",
    "iban": "CH71 0024 0240 C022 2310 T"
  },
  "notion_mapping": {
    "database_id": "226adb95-3c6f-8011-a9bb-ca31f7da8e6a",
    "mapped_fields": {
      "Numéro": "AN-00094",
      "Client": "PROMIDEA SRL",
      "Montant TTC": 3264.62
    }
  }
}
\`\`\`

IMPORTANT: Le client doit être extrait COMPLETEMENT avec nom complet de l'entreprise.`;
    }
    
    /**
     * Résumé des schémas Notion
     */
    summarizeNotionSchemas() {
        let summary = '';
        
        for (const [type, config] of Object.entries(this.notionSchemas)) {
            summary += `\n${type} (${config.notionDB}):\n`;
            
            for (const [field, fieldConfig] of Object.entries(config.fields)) {
                summary += `  - ${field}: ${fieldConfig.type}${fieldConfig.required ? ' (requis)' : ''}\n`;
            }
        }
        
        return summary;
    }
    
    /**
     * Appel API OpenAI
     */
    async makeAPIRequest(requestBody) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
        
        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify(requestBody),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(`OpenAI API Error: ${error.error?.message || response.statusText}`);
            }
            
            return await response.json();
            
        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                throw new Error('Timeout: La requête a pris trop de temps');
            }
            
            throw error;
        }
    }
    
    /**
     * Mapping vers schéma Notion
     */
    async mapToNotionSchema(documentType, extractedData) {
        console.log(`📊 Mapping vers schéma Notion: ${documentType}`);
        
        const schema = this.notionSchemas[documentType];
        if (!schema) {
            console.warn(`⚠️ Schéma non trouvé pour: ${documentType}`);
            return extractedData;
        }
        
        const mappedData = {};
        
        // Mapping intelligent basé sur le schéma
        for (const [fieldName, fieldConfig] of Object.entries(schema.fields)) {
            const value = this.findMatchingValue(fieldName, extractedData);
            
            if (value !== undefined) {
                // Conversion selon le type
                switch (fieldConfig.type) {
                    case 'number':
                        mappedData[fieldName] = parseFloat(value) || 0;
                        break;
                    case 'date':
                        mappedData[fieldName] = this.formatDate(value);
                        break;
                    case 'select':
                        mappedData[fieldName] = this.matchSelectOption(value, fieldConfig.options);
                        break;
                    default:
                        mappedData[fieldName] = String(value);
                }
            } else if (fieldConfig.default) {
                mappedData[fieldName] = fieldConfig.default;
            }
        }
        
        // Ajouter les métadonnées
        mappedData._metadata = {
            source: 'openai-vision',
            documentType: documentType,
            databaseId: schema.notionDB,
            extractedAt: new Date().toISOString()
        };
        
        return mappedData;
    }
    
    /**
     * Recherche de valeur correspondante
     */
    findMatchingValue(fieldName, data) {
        // Normaliser le nom du champ
        const normalizedField = fieldName.toLowerCase()
            .replace(/[éèê]/g, 'e')
            .replace(/[àâ]/g, 'a')
            .replace(/\s+/g, '_');
        
        // Mappings directs
        const mappings = {
            'numero_facture': ['numero', 'invoice_number', 'bill_number'],
            'fournisseur': ['emetteur.nom', 'supplier', 'vendor'],
            'client': ['client.nom', 'customer', 'bill_to'],
            'date_facture': ['date_emission', 'invoice_date', 'date'],
            'date_echeance': ['date_echeance', 'due_date', 'payment_due'],
            'montant_ht': ['montant_ht', 'subtotal', 'net_amount'],
            'montant_ttc': ['montant_ttc', 'total', 'gross_amount'],
            'tva': ['montant_tva', 'vat_amount', 'tax'],
            'devise': ['devise', 'currency']
        };
        
        // Chercher dans les mappings
        const possibleKeys = mappings[normalizedField] || [normalizedField];
        
        for (const key of possibleKeys) {
            const value = this.getNestedValue(data, key);
            if (value !== undefined && value !== null && value !== '') {
                return value;
            }
        }
        
        return undefined;
    }
    
    /**
     * Récupération de valeur imbriquée
     */
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => 
            current && current[key] !== undefined ? current[key] : undefined, obj);
    }
    
    /**
     * Formatage de date
     */
    formatDate(value) {
        if (!value) return null;
        
        // Si déjà au format ISO
        if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
            return value.split('T')[0];
        }
        
        // Conversion depuis autres formats
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0];
        }
        
        return null;
    }
    
    /**
     * Matching d'option select
     */
    matchSelectOption(value, options) {
        if (!value || !options) return options[0];
        
        const normalizedValue = value.toString().toLowerCase();
        
        // Recherche exacte
        const exactMatch = options.find(opt => 
            opt.toLowerCase() === normalizedValue
        );
        if (exactMatch) return exactMatch;
        
        // Recherche partielle
        const partialMatch = options.find(opt => 
            opt.toLowerCase().includes(normalizedValue) ||
            normalizedValue.includes(opt.toLowerCase())
        );
        if (partialMatch) return partialMatch;
        
        return options[0]; // Valeur par défaut
    }
    
    /**
     * Validation des données extraites
     */
    async validateExtractedData(documentType, data) {
        const schema = this.notionSchemas[documentType];
        const errors = [];
        const warnings = [];
        
        if (!schema) {
            errors.push({
                field: 'documentType',
                message: `Type de document non reconnu: ${documentType}`
            });
            return { valid: false, errors, warnings };
        }
        
        // Vérifier les champs requis
        for (const [fieldName, fieldConfig] of Object.entries(schema.fields)) {
            if (fieldConfig.required && !data[fieldName]) {
                errors.push({
                    field: fieldName,
                    message: `Champ requis manquant: ${fieldName}`
                });
            }
        }
        
        // Validations spécifiques
        if (documentType.includes('FACTURE')) {
            // Vérifier la cohérence des montants
            if (data['Montant HT'] && data['TVA'] && data['Montant TTC']) {
                const calculated = data['Montant HT'] + data['TVA'];
                const diff = Math.abs(calculated - data['Montant TTC']);
                
                if (diff > 0.02) {
                    warnings.push({
                        field: 'Montant TTC',
                        message: `Incohérence de calcul: ${calculated.toFixed(2)} != ${data['Montant TTC']}`
                    });
                }
            }
            
            // Vérifier les dates
            if (data['Date Facture'] && data['Date Échéance']) {
                const dateFacture = new Date(data['Date Facture']);
                const dateEcheance = new Date(data['Date Échéance']);
                
                if (dateEcheance < dateFacture) {
                    warnings.push({
                        field: 'Date Échéance',
                        message: 'La date d\'échéance est antérieure à la date de facture'
                    });
                }
            }
        }
        
        return {
            valid: errors.length === 0,
            errors: errors,
            warnings: warnings,
            completeness: this.calculateCompleteness(data, schema)
        };
    }
    
    /**
     * Calcul du taux de complétude
     */
    calculateCompleteness(data, schema) {
        const totalFields = Object.keys(schema.fields).length;
        const filledFields = Object.keys(schema.fields).filter(field => 
            data[field] !== undefined && data[field] !== null && data[field] !== ''
        ).length;
        
        return Math.round((filledFields / totalFields) * 100);
    }
    
    /**
     * Méthode de test pour vérifier l'extraction
     */
    async testExtraction(imageUrl) {
        console.log('🧪 Test d\'extraction OpenAI Vision...');
        
        try {
            // Charger l'image depuis l'URL
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const file = new File([blob], 'test-document.jpg', { type: blob.type });
            
            // Traiter le document
            const result = await this.processDocument(file);
            
            console.log('✅ Résultat du test:', result);
            
            return result;
            
        } catch (error) {
            console.error('❌ Erreur test:', error);
            throw error;
        }
    }
}

// Export pour utilisation
window.OCROpenAIVision = OCROpenAIVision;

// Auto-initialisation si clé disponible
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('openai_api_key')) {
        window.ocrVision = new OCROpenAIVision();
        console.log('💡 OCR OpenAI Vision disponible: window.ocrVision');
    } else {
        console.warn('⚠️ Configurez votre clé OpenAI: localStorage.setItem("openai_api_key", "sk-...")');
    }
});