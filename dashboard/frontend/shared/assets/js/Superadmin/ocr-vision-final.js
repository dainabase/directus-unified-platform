/**
 * OCR Vision Final - Module OpenAI Vision
 * Extraction complète avec le prompt EXACT fourni
 */

// Prompt AMÉLIORÉ pour extraction ultra-précise avec détection TVA intelligente
const ENHANCED_OCR_PROMPT = `
Vous êtes un expert comptable international spécialisé dans l'analyse de documents financiers multi-pays.

ANALYSEZ CE DOCUMENT avec une PRÉCISION MAXIMALE et extrayez TOUTES les informations suivantes :

🔍 IDENTIFICATION ÉMETTEUR/DESTINATAIRE :
- Nom complet de l'entreprise émettrice (société qui facture)
- Adresse complète émettrice (rue, ville, pays, CP)
- Numéro SIRET/TVA/IDE émetteur si visible
- Nom complet du client/destinataire
- Adresse complète destinataire
- Contact (email, téléphone) si visible

💰 INFORMATIONS FINANCIÈRES :
- Numéro de facture/document (format exact)
- Date d'émission (format JJ/MM/AAAA)
- Date d'échéance si mentionnée
- DEVISE utilisée (chercher symboles: €, CHF, $, £ ou mentions: EUR, USD, GBP, CHF)
- Montant hors taxes (HT) avec devise
- Taux de TVA appliqué (%, exemple: 8.1%, 20%, 0%, Non soumis, Exonéré)
- Montant TVA en valeur absolue (peut être 0)
- Montant toutes taxes comprises (TTC) avec devise
- Mode de paiement mentionné
- Références bancaires si présentes

🔍 DÉTECTION TVA INTELLIGENTE :
1. ANALYSE TVA DOCUMENT :
   - Si AUCUN montant TVA visible → TVA = 0% ou "Non soumis"
   - Si UN SEUL montant total → Probablement TTC sans TVA
   - Si DEUX montants (HT + TTC) → TVA normale
   - Si mention "TVA non applicable" → "Non soumis"
   - Si mention "Exonéré" → "Exonéré"

2. RÈGLES GÉOGRAPHIQUES :
   - Suisse → Destinataire : 8.1% (défaut), 0% (export)
   - France → Destinataire : 20% (défaut), 0% (export)
   - Export UE → UE : 0% (règles intra-UE)
   - Export Hors UE → 0% (export international)
   - Organisations diplomatiques → 0% (exemption)

3. DÉTECTION DEVISE :
   - Chercher symboles : €, CHF, $, £
   - Chercher mentions : EUR, USD, GBP, CHF
   - Analyser contexte pays (Espagne = EUR, Suisse = CHF)
   - Si aucune devise → Déduire du pays destinataire

📄 DÉTAILS SERVICES/PRODUITS :
- Description détaillée des services/produits
- Quantités et unités si applicable
- Prix unitaires si détaillés
- Remises ou ajustements
- Période de facturation si mentionnée

🏢 CLASSIFICATION AUTOMATIQUE :
Déterminez le type selon ces règles EXACTES :
- Si ÉMETTEUR = "HYPERVISUAL" ou "DAINAMICS" ou "ENKI REALITY" ou "TAKEOUT" ou "LEXAIA" → FACTURE_CLIENT
- Si DESTINATAIRE = une de ces entités → FACTURE_FOURNISSEUR
- Si contient "restaurant", "taxi", "hôtel", "transport", "essence", "repas" → NOTE_FRAIS
- Si contient "contrat", "agreement", "accord", "convention" → CONTRAT
- Sinon → DOCUMENT_GENERAL

🏢 DÉTECTION ENTITÉ DU GROUPE :
- Analysez l'en-tête/logo de la facture pour identifier l'émetteur
- HYPERVISUAL → Services digitaux, sites web, apps
- DAINAMICS → Conseil et stratégie
- ENKI REALITY → VR/AR, métaverse  
- TAKEOUT → Services traiteur/événementiel
- LEXAIA → Services juridiques

💼 DÉTECTION TYPE OPÉRATION :
- COMMISSION → Mots-clés: "commission", "pourcentage", "intermédiaire"
- SAAS → Mots-clés: "abonnement", "licence", "SaaS", "mensuel"
- LOCATION → Mots-clés: "location", "loyer", "bail"
- VENTE → Mots-clés: "vente", "achat", "produit"

💰 CALCULS AUTOMATIQUES :
- Montant TVA = Montant TTC - Prix Client HT
- Si Prix HT manquant : Prix HT = Montant TTC / (1 + Taux TVA/100)
- Taux TVA détection : 8.1% (Suisse), 20% (France), 0% (exonéré)

⚠️ EXIGENCES CRITIQUES :
1. Si une information n'est pas visible, mettez "NON_VISIBLE"
2. Pour les montants, incluez TOUJOURS la devise (CHF, EUR, USD)
3. Pour les dates, format OBLIGATOIRE : YYYY-MM-DD
4. Soyez EXHAUSTIF : cherchez dans TOUS les coins du document
5. Si le document est flou/illisible, indiquez "ILLEGIBLE" pour les champs concernés

RÉPONSE OBLIGATOIRE EN JSON :
{
  "document_type": "TYPE_DÉTECTÉ",
  "confidence": 0.XX,
  "document_quality": "EXCELLENT|BON|MOYEN|ILLISIBLE",
  "extracted_data": {
    "numero_document": "valeur exacte ou NON_VISIBLE",
    "emetteur": {
      "nom": "nom complet",
      "adresse": "adresse complète avec PAYS",
      "siret_tva": "numéro ou NON_VISIBLE"
    },
    "destinataire": {
      "nom": "nom complet",
      "adresse": "adresse complète avec PAYS"
    },
    "dates": {
      "emission": "YYYY-MM-DD ou NON_VISIBLE",
      "echeance": "YYYY-MM-DD ou NON_VISIBLE"
    },
    "montants": {
      "devise": "EUR|CHF|USD|GBP (obligatoire)",
      "ht": "montant SANS devise ou NON_APPLICABLE",
      "tva_taux": "0%|8.1%|20%|Non soumis|Exonéré",
      "tva_montant": "montant SANS devise ou 0.00", 
      "ttc": "montant SANS devise"
    },
    "tva_context": {
      "raison_tva_zero": "Export|Non soumis|Exonéré|Diplomatique|Normal",
      "pays_origine": "Suisse|France|Espagne|Autre",
      "pays_destination": "Suisse|France|Espagne|Autre",
      "type_client": "Entreprise|Diplomatique|Particulier"
    },
    "services": {
      "description": "description complète",
      "periode": "période si mentionnée ou NON_VISIBLE"
    },
    "paiement": {
      "mode": "mode mentionné ou NON_VISIBLE",
      "iban": "IBAN si visible ou NON_VISIBLE"
    },
    "autres_infos": "toutes autres informations importantes visibles"
  },
  "zones_illisibles": ["liste des zones floues/illisibles"],
  "suggestions_amelioration": "suggestions si document de mauvaise qualité"
}

EXTRAYEZ ABSOLUMENT TOUT CE QUI EST LISIBLE. Soyez un détective financier !
`;

class OCRVisionFinal {
    constructor() {
        this.apiKey = localStorage.getItem('openai_api_key');
        this.model = localStorage.getItem('openai_model') || 'gpt-4o-mini';
        this.apiEndpoint = 'https://api.openai.com/v1/chat/completions';
        this.isManualMode = false; // Mode manuel si pas de clé API
        
        // Configuration
        this.config = {
            maxTokens: 4096,
            temperature: 0.1,
            maxImageSize: 20 * 1024 * 1024, // 20MB
            timeout: 30000, // 30 secondes
            supportedFormats: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
        };
    }
    
    /**
     * Initialisation et vérification de la clé API
     */
    async init() {
        if (!this.apiKey) {
            console.warn('⚠️ Clé API OpenAI manquante - Mode OCR manuel activé');
            this.isManualMode = true;
            return true; // Ne pas planter, mais activer le mode manuel
        }
        
        // Vérifier la clé API seulement si elle existe
        try {
            const response = await fetch('https://api.openai.com/v1/models', {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });
            
            if (!response.ok) {
                console.warn('⚠️ Clé API OpenAI invalide - Mode OCR manuel activé');
                this.isManualMode = true;
                return true; // Ne pas planter
            }
            
            console.log('✅ OCR Vision initialisé avec succès');
            return true;
        } catch (error) {
            console.error('❌ Erreur validation API:', error);
            throw error;
        }
    }
    
    /**
     * Traitement principal du document
     */
    async processDocument(file, progressCallback) {
        try {
            // Validation du fichier
            this.validateFile(file);
            
            // Mise à jour de la progression
            if (progressCallback) progressCallback(10, 'Préparation du document...');
            
            // Conversion en base64 pour affichage
            const base64Image = await this.convertToBase64(file);
            
            if (progressCallback) progressCallback(30, 'Conversion terminée...');
            
            // Vérifier le mode
            if (this.isManualMode) {
                if (progressCallback) progressCallback(50, 'Mode manuel - clé OpenAI manquante...');
                
                // Retourner un template pour saisie manuelle
                const manualResult = this.generateManualTemplate(file);
                
                if (progressCallback) progressCallback(100, 'Prêt pour saisie manuelle!');
                
                return {
                    success: true,
                    isManualMode: true,
                    needsConfiguration: !this.apiKey,
                    ...manualResult,
                    fileName: file.name,
                    fileSize: file.size,
                    processedAt: new Date().toISOString(),
                    preview: base64Image // Pour affichage du document
                };
            }
            
            // Mode automatique avec OpenAI
            if (progressCallback) progressCallback(50, 'Analyse IA en cours...');
            
            const result = await this.callOpenAIVision(base64Image);
            
            if (progressCallback) progressCallback(90, 'Finalisation...');
            
            // Parser et valider la réponse
            const parsedResult = this.parseResponse(result);
            
            if (progressCallback) progressCallback(100, 'Terminé!');
            
            return {
                success: true,
                isManualMode: false,
                ...parsedResult,
                fileName: file.name,
                fileSize: file.size,
                processedAt: new Date().toISOString(),
                preview: base64Image
            };
            
        } catch (error) {
            console.error('❌ Erreur traitement document:', error);
            return {
                success: false,
                error: error.message,
                isManualMode: this.isManualMode
            };
        }
    }
    
    /**
     * Générer un template pour saisie manuelle
     */
    generateManualTemplate(file) {
        return {
            confidence: 0,
            documentType: 'FACTURE',
            data: {
                emetteur: {
                    nom: '',
                    adresse: '',
                    siret: '',
                    tva: ''
                },
                destinataire: {
                    nom: '',
                    adresse: '',
                    contact: ''
                },
                facture: {
                    numero: '',
                    date_emission: '',
                    date_echeance: '',
                    devise: 'EUR'
                },
                montants: {
                    ht: '',
                    tva_taux: '0',
                    tva_montant: '0',
                    ttc: ''
                },
                paiement: {
                    mode: '',
                    iban: ''
                }
            },
            isManualEntry: true,
            instruction: 'Veuillez remplir les informations manuellement en consultant le document'
        };
    }
    
    /**
     * Validation du fichier
     */
    validateFile(file) {
        // Vérifier la taille
        if (file.size > this.config.maxImageSize) {
            throw new Error(`Fichier trop volumineux: ${(file.size / 1024 / 1024).toFixed(1)}MB (max 20MB)`);
        }
        
        // Vérifier le format
        if (!this.config.supportedFormats.includes(file.type)) {
            throw new Error(`Format non supporté: ${file.type}`);
        }
        
        return true;
    }
    
    /**
     * Conversion en base64
     */
    async convertToBase64(file) {
        if (file.type === 'application/pdf') {
            // Conversion PDF → Image
            return await this.convertPDFToImage(file);
        } else {
            // Image directe
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => {
                    const base64 = reader.result.split(',')[1];
                    resolve(base64);
                };
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        }
    }
    
    /**
     * Conversion PDF → Image avec PDF.js
     */
    async convertPDFToImage(file) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const page = await pdf.getPage(1);
        
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        const renderContext = {
            canvasContext: context,
            viewport: viewport
        };
        
        await page.render(renderContext).promise;
        
        // Convertir canvas en base64
        const base64 = canvas.toDataURL('image/jpeg', 0.95);
        
        // Cleanup
        page.cleanup();
        pdf.destroy();
        
        return base64.split(',')[1];
    }
    
    /**
     * Appel API OpenAI Vision
     */
    async callOpenAIVision(base64Image) {
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
                            text: ENHANCED_OCR_PROMPT
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:image/jpeg;base64,${base64Image}`,
                                detail: "high"
                            }
                        }
                    ]
                }
            ],
            max_tokens: this.config.maxTokens,
            temperature: this.config.temperature
        };
        
        // Timeout controller
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
                if (response.status === 429) {
                    throw new Error('Rate limit dépassé. Attendez quelques secondes.');
                }
                if (response.status === 401) {
                    throw new Error('Clé API invalide');
                }
                const error = await response.json();
                throw new Error(`Erreur OpenAI: ${error.error?.message || response.statusText}`);
            }
            
            const data = await response.json();
            return data.choices[0].message.content;
            
        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                throw new Error('Timeout: La requête a pris trop de temps');
            }
            
            throw error;
        }
    }
    
    /**
     * Parser la réponse JSON
     */
    parseResponse(responseText) {
        try {
            // Extraire le JSON de la réponse
            const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/);
            const jsonString = jsonMatch ? jsonMatch[1] : responseText;
            
            const parsed = JSON.parse(jsonString);
            
            // Valider la structure
            if (!parsed.document_type || !parsed.extracted_data) {
                throw new Error('Structure de réponse invalide');
            }
            
            // Adapter la structure pour la rétrocompatibilité
            const adaptedData = this.adaptExtractedData(parsed);
            
            return {
                ...parsed,
                extracted_data: adaptedData
            };
            
        } catch (error) {
            console.error('❌ Erreur parsing JSON:', error);
            console.log('Réponse brute:', responseText);
            throw new Error('Impossible de parser la réponse de l\'IA');
        }
    }
    
    /**
     * Adapter les données extraites au format attendu
     */
    adaptExtractedData(parsed) {
        const data = parsed.extracted_data;
        
        // Appliquer la logique TVA intelligente
        const enhancedData = this.enhancedVATLogic(data);
        
        // Récupérer la devise
        const devise = enhancedData.montants?.devise || 'CHF';
        
        // Calculs automatiques avec données améliorées
        let montantTTC = this.parseAmount(enhancedData.montants?.ttc);
        let montantHT = this.parseAmount(enhancedData.montants?.ht);
        let montantTVA = this.parseAmount(enhancedData.montants?.tva_montant);
        let tauxTVA = enhancedData.montants?.tva_taux;
        
        // Détection de l'entité du groupe
        const entiteGroupe = this.detectEntiteGroupe(enhancedData.emetteur?.nom || '');
        
        // Détection du type d'opération
        const typeOperation = this.detectTypeOperation(enhancedData.services?.description || '');
        
        return {
            // Champs de base
            numero: enhancedData.numero_document || 'NON_VISIBLE',
            client: enhancedData.destinataire?.nom || 'NON_VISIBLE',
            emetteur: enhancedData.emetteur?.nom || 'NON_VISIBLE',
            emetteur_adresse: enhancedData.emetteur?.adresse || 'NON_VISIBLE',
            emetteur_siret: enhancedData.emetteur?.siret_tva || 'NON_VISIBLE',
            destinataire: enhancedData.destinataire?.nom || 'NON_VISIBLE',
            destinataire_adresse: enhancedData.destinataire?.adresse || 'NON_VISIBLE',
            
            // Dates
            date_emission: enhancedData.dates?.emission || 'NON_VISIBLE',
            date_echeance: enhancedData.dates?.echeance || 'NON_VISIBLE',
            
            // Montants avec devise correcte
            prix_client_ht: montantHT ? `${devise} ${montantHT.toFixed(2)}` : 'NON_VISIBLE',
            montant_ttc: montantTTC ? `${devise} ${montantTTC.toFixed(2)}` : 'NON_VISIBLE',
            montant_tva: montantTVA ? `${devise} ${montantTVA.toFixed(2)}` : 'NON_VISIBLE',
            tva_pourcent: tauxTVA || '8.1%',
            
            // Devise
            devise: devise,
            
            // Services
            description: enhancedData.services?.description || 'NON_VISIBLE',
            
            // Paiement avec défaut
            mode_paiement: enhancedData.paiement?.mode || 'Virement',
            reference: enhancedData.paiement?.iban || 'NON_VISIBLE',
            
            // Champs avec détection intelligente
            entite_groupe: entiteGroupe,
            type_operation: typeOperation,
            
            // Contexte TVA
            tva_context: enhancedData.tva_context,
            
            // Valeurs par défaut
            statut: 'Envoyé',
            type_document: 'Facture Client',
            
            // Données brutes pour accès complet
            _raw: enhancedData
        };
    }
    
    /**
     * Logique TVA intelligente améliorée
     */
    enhancedVATLogic(data) {
        // Détection devise intelligente
        let devise = data.montants?.devise || 'CHF';
        if (!devise || devise === 'NON_VISIBLE') {
            // Déduction par pays destinataire
            const pays = data.destinataire?.adresse?.toLowerCase() || '';
            if (pays.includes('spain') || pays.includes('espagne') || pays.includes('madrid') || pays.includes('barcelona')) {
                devise = 'EUR';
            } else if (pays.includes('france') || pays.includes('paris')) {
                devise = 'EUR';
            } else if (pays.includes('suisse') || pays.includes('switzerland') || pays.includes('geneva') || pays.includes('zürich')) {
                devise = 'CHF';
            } else if (pays.includes('usa') || pays.includes('états-unis') || pays.includes('new york')) {
                devise = 'USD';
            } else if (pays.includes('royaume-uni') || pays.includes('london')) {
                devise = 'GBP';
            }
        }
        
        // Logique TVA intelligente
        let tva_taux = data.montants?.tva_taux || '8.1%';
        let tva_montant = data.montants?.tva_montant;
        let tva_raison = data.tva_context?.raison_tva_zero || 'Normal';
        
        if (!tva_montant || tva_montant === '0' || tva_montant === '0.00' || tva_montant === 'NON_VISIBLE') {
            // Cas sans TVA détectée
            const emetteur_pays = this.detectCountryFromAddress(data.emetteur?.adresse);
            const destinataire_pays = this.detectCountryFromAddress(data.destinataire?.adresse);
            
            if (emetteur_pays === 'Suisse' && destinataire_pays !== 'Suisse') {
                // Export depuis Suisse
                tva_taux = '0%';
                tva_montant = '0.00';
                tva_raison = 'Export international';
            } else if (data.destinataire?.nom?.toLowerCase().includes('mission') || 
                       data.destinataire?.nom?.toLowerCase().includes('ambassade') ||
                       data.destinataire?.nom?.toLowerCase().includes('consulat')) {
                // Organisation diplomatique
                tva_taux = 'Non soumis';
                tva_montant = '0.00';
                tva_raison = 'Organisation diplomatique';
            } else if (emetteur_pays !== destinataire_pays) {
                // Transaction internationale
                tva_taux = '0%';
                tva_montant = '0.00';
                tva_raison = 'Export';
            }
        }
        
        // Calcul cohérence HT/TTC
        let montant_ht = data.montants?.ht;
        let montant_ttc = data.montants?.ttc;
        
        if ((tva_taux === '0%' || tva_taux === 'Non soumis' || tva_taux === 'Exonéré') && montant_ttc && !montant_ht) {
            // Si pas de TVA, HT = TTC
            montant_ht = montant_ttc;
        }
        
        return {
            ...data,
            montants: {
                ...data.montants,
                devise: devise,
                ht: montant_ht,
                tva_taux: tva_taux,
                tva_montant: tva_montant,
                ttc: montant_ttc
            },
            tva_context: {
                raison_tva_zero: tva_raison,
                pays_origine: this.detectCountryFromAddress(data.emetteur?.adresse),
                pays_destination: this.detectCountryFromAddress(data.destinataire?.adresse),
                type_client: data.tva_context?.type_client || 'Entreprise'
            }
        };
    }
    
    /**
     * Détecter le pays depuis une adresse
     */
    detectCountryFromAddress(address) {
        if (!address) return 'Inconnu';
        const addr = address.toLowerCase();
        
        if (addr.includes('switzerland') || addr.includes('suisse') || addr.includes('geneva') || 
            addr.includes('genève') || addr.includes('zürich') || addr.includes('bern')) {
            return 'Suisse';
        } else if (addr.includes('spain') || addr.includes('espagne') || addr.includes('españa') || 
                   addr.includes('madrid') || addr.includes('barcelona')) {
            return 'Espagne';
        } else if (addr.includes('france') || addr.includes('paris') || addr.includes('lyon') || 
                   addr.includes('marseille')) {
            return 'France';
        } else if (addr.includes('usa') || addr.includes('états-unis') || addr.includes('united states') || 
                   addr.includes('new york') || addr.includes('california')) {
            return 'USA';
        } else if (addr.includes('royaume-uni') || addr.includes('united kingdom') || addr.includes('london') || 
                   addr.includes('uk')) {
            return 'Royaume-Uni';
        }
        return 'Autre';
    }
    
    /**
     * Parser un montant
     */
    parseAmount(value) {
        if (!value || value === 'NON_VISIBLE') return null;
        const amount = String(value).replace(/[^\d.-]/g, '');
        return parseFloat(amount) || null;
    }
    
    /**
     * Parser un taux de TVA
     */
    parseTaxRate(value) {
        if (!value || value === 'NON_VISIBLE') return 8.1; // Défaut Suisse
        const rate = String(value).replace(/[^\d.]/g, '');
        return parseFloat(rate) || 8.1;
    }
    
    /**
     * Détecter l'entité du groupe
     */
    detectEntiteGroupe(emetteur) {
        const emetteurUpper = emetteur.toUpperCase();
        const entites = ['HYPERVISUAL', 'DAINAMICS', 'ENKI REALITY', 'TAKEOUT', 'LEXAIA'];
        
        for (const entite of entites) {
            if (emetteurUpper.includes(entite)) {
                return entite;
            }
        }
        
        return 'HYPERVISUAL'; // Défaut
    }
    
    /**
     * Détecter le type d'opération
     */
    detectTypeOperation(description) {
        const descUpper = description.toUpperCase();
        
        if (descUpper.includes('COMMISSION') || descUpper.includes('POURCENTAGE')) {
            return 'COMMISSION';
        }
        if (descUpper.includes('ABONNEMENT') || descUpper.includes('SAAS') || descUpper.includes('LICENCE')) {
            return 'SAAS';
        }
        if (descUpper.includes('LOCATION') || descUpper.includes('LOYER')) {
            return 'LOCATION';
        }
        if (descUpper.includes('VENTE') || descUpper.includes('ACHAT')) {
            return 'VENTE';
        }
        
        return 'VENTE'; // Défaut
    }
    
    /**
     * Valider les données extraites
     */
    validateExtractedData(ocrResult) {
        const issues = [];
        const data = ocrResult.extracted_data;
        
        // Validation numéro document
        if (!data.numero || data.numero === "NON_VISIBLE") {
            issues.push({
                field: "numero_document",
                severity: "HIGH", 
                message: "Numéro de document manquant - requis pour Notion"
            });
        }
        
        // Validation montants
        if (!data.montant_ttc || data.montant_ttc === "NON_VISIBLE") {
            issues.push({
                field: "montant_ttc",
                severity: "HIGH",
                message: "Montant TTC manquant - requis pour comptabilité"
            });
        }
        
        // Validation dates
        if (!data.date_emission || data.date_emission === "NON_VISIBLE") {
            issues.push({
                field: "date_emission", 
                severity: "MEDIUM",
                message: "Date d'émission manquante"
            });
        }
        
        // Validation qualité document
        if (ocrResult.confidence < 0.8) {
            issues.push({
                field: "global",
                severity: "WARNING",
                message: `Confiance faible (${Math.round((ocrResult.confidence || 0) * 100)}%) - Vérifiez les données`
            });
        }
        
        // Qualité du document
        if (ocrResult.document_quality === "ILLISIBLE") {
            issues.push({
                field: "global",
                severity: "HIGH",
                message: "Document illisible - Veuillez fournir une meilleure image"
            });
        }
        
        return {
            isValid: issues.filter(i => i.severity === "HIGH").length === 0,
            issues: issues,
            score: this.calculateQualityScore(data, issues)
        };
    }
    
    /**
     * Calculer le score de qualité
     */
    calculateQualityScore(data, issues) {
        let score = 100;
        issues.forEach(issue => {
            switch(issue.severity) {
                case "HIGH": score -= 30; break;
                case "MEDIUM": score -= 15; break;
                case "WARNING": score -= 5; break;
            }
        });
        return Math.max(0, score);
    }
    
    /**
     * Méthode utilitaire pour tester avec une image exemple
     */
    async testWithSampleImage() {
        console.log('🧪 Test OCR Vision avec image exemple...');
        
        // URL d'une facture exemple
        const sampleImageUrl = 'https://example.com/sample-invoice.jpg';
        
        try {
            const response = await fetch(sampleImageUrl);
            const blob = await response.blob();
            const file = new File([blob], 'sample-invoice.jpg', { type: 'image/jpeg' });
            
            const result = await this.processDocument(file);
            console.log('✅ Résultat test:', result);
            
            return result;
            
        } catch (error) {
            console.error('❌ Erreur test:', error);
            throw error;
        }
    }
}

// Export global
window.OCRVisionFinal = OCRVisionFinal;