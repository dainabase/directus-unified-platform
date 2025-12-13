/**
 * OCR Hybrid Processor v1.1.0 - CORRECTION BROWSER
 * Tesseract.js + OpenAI pour extraction intelligente
 * Compatible navigateur (pas de process.env)
 */

class OCRHybridProcessor {
    constructor() {
        console.log('🧠 OCR Hybrid Processor v1.1.0 - Tesseract + OpenAI (Browser Fixed)');
        this.tesseract = null;
        this.openaiKey = null;
        this.initialized = false;
        this.config = {
            tesseract: {
                language: 'fra+eng',
                options: {
                    logger: info => console.log('📄 Tesseract:', info.status, info.progress)
                }
            },
            openai: {
                model: 'gpt-4',
                maxTokens: 2000,
                temperature: 0.1
            }
        };
    }

    /**
     * Initialisation - CORRIGÉ pour navigateur
     */
    async init() {
        try {
            console.log('🚀 Initialisation OCR Hybrid...');
            
            // ✅ CORRECTION: Récupérer la clé depuis localStorage au lieu de process.env
            this.openaiKey = localStorage.getItem('openai_api_key');
            
            if (!this.openaiKey) {
                console.warn('⚠️ Clé OpenAI non trouvée dans localStorage');
                console.log('💡 Utilisez: localStorage.setItem("openai_api_key", "sk-...")');
            }

            // Vérifier les dépendances
            await this.checkDependencies();
            
            // Initialiser Tesseract
            if (typeof Tesseract !== 'undefined') {
                this.tesseract = Tesseract;
                console.log('✅ Tesseract.js prêt');
            }

            this.initialized = true;
            console.log('✅ OCR Hybrid initialisé');
            
        } catch (error) {
            console.error('❌ Erreur initialisation:', error);
            throw error;
        }
    }

    /**
     * Vérification des dépendances
     */
    async checkDependencies() {
        const deps = {
            'Tesseract': typeof Tesseract !== 'undefined',
            'pdfjsLib': typeof pdfjsLib !== 'undefined',
            'OpenAI Key': !!this.openaiKey
        };

        console.log('📦 Vérification dépendances:', deps);
        
        const missing = Object.entries(deps)
            .filter(([name, available]) => !available)
            .map(([name]) => name);

        if (missing.length > 0) {
            console.warn('⚠️ Dépendances manquantes:', missing);
        }
        
        return deps;
    }

    /**
     * Traitement principal d'un document
     */
    async processDocument(file, options = {}) {
        try {
            if (!this.initialized) {
                await this.init();
            }

            console.log('📄 Traitement document:', file.name);
            
            // 1. Conversion en image si nécessaire
            const images = await this.convertToImages(file);
            
            // 2. OCR Tesseract
            const ocrResults = await this.extractTextWithTesseract(images);
            
            // 3. Extraction basique (fallback)
            const basicData = await this.extractBasicData(ocrResults.text);
            
            // 4. Extraction intelligente OpenAI (si disponible)
            let smartData = null;
            if (this.openaiKey && options.useOpenAI !== false) {
                try {
                    smartData = await this.extractWithOpenAI(ocrResults.text, basicData);
                } catch (error) {
                    console.warn('⚠️ Extraction OpenAI échouée, utilisation fallback:', error.message);
                }
            }

            // 5. Fusion et validation
            const finalData = this.mergeResults(basicData, smartData);
            const validation = await this.validateData(finalData);

            return {
                success: true,
                data: finalData,
                validation: validation,
                confidence: smartData ? 0.95 : 0.75,
                source: smartData ? 'openai+tesseract' : 'tesseract',
                processing_time: Date.now() - performance.now(),
                raw_ocr: ocrResults
            };

        } catch (error) {
            console.error('❌ Erreur traitement:', error);
            return {
                success: false,
                error: error.message,
                data: null
            };
        }
    }

    /**
     * Conversion fichier en images
     */
    async convertToImages(file) {
        const images = [];
        
        if (file.type === 'application/pdf') {
            // Conversion PDF en images
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
            
            for (let i = 1; i <= Math.min(pdf.numPages, 5); i++) {
                const page = await pdf.getPage(i);
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                
                const viewport = page.getViewport({ scale: 2.0 });
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                
                await page.render({
                    canvasContext: context,
                    viewport: viewport
                }).promise;
                
                images.push(canvas);
            }
        } else {
            // Image directe
            images.push(file);
        }
        
        return images;
    }

    /**
     * OCR avec Tesseract.js
     */
    async extractTextWithTesseract(images) {
        console.log('🔍 Extraction OCR Tesseract...');
        
        let allText = '';
        let confidence = 0;
        
        for (const image of images) {
            const result = await Tesseract.recognize(
                image,
                this.config.tesseract.language,
                this.config.tesseract.options
            );
            
            allText += result.data.text + '\n';
            confidence += result.data.confidence;
        }
        
        return {
            text: allText,
            confidence: confidence / images.length,
            pages: images.length
        };
    }

    /**
     * Extraction basique (regex + heuristiques)
     */
    async extractBasicData(text) {
        console.log('📋 Extraction basique (fallback)...');
        
        // NOUVEAU: Détection intelligente devise et TVA
        const currencyAndVAT = this.detectCurrencyAndVAT(text);
        
        // NOUVEAU: Extraction client
        const clientInfo = this.extractClientInfo(text);
        
        // Données de base pour aider la détection du type
        const basicInfo = {
            company: this.detectEntity(text),
            client: clientInfo.client
        };
        
        // NOUVEAU: Détection type avec contexte
        const documentTypeResult = this.detectDocumentType(text, basicInfo);
        
        const data = {
            type: documentTypeResult.type,
            typeConfidence: documentTypeResult.confidence,
            typeAlternatives: documentTypeResult.alternativeTypes,
            entite: basicInfo.company,
            date: this.extractDate(text),
            numero: this.extractNumber(text),
            fournisseur: this.extractSupplier(text),
            client: clientInfo.client,
            clientAddress: clientInfo.clientAddress,
            clientCountry: clientInfo.clientCountry,
            montant_ht: this.extractAmount(text, 'HT'),
            montant_tva: this.extractAmount(text, 'TVA'),
            montant_ttc: this.extractAmount(text, 'TTC'),
            taux_tva: currencyAndVAT.vatRate,
            devise: currencyAndVAT.currency,
            // NOUVEAU: Statut TVA explicite
            vat_status: currencyAndVAT.vatStatus
        };
        
        return data;
    }

    /**
     * Méthode publique pour extraction basique (compatibilité tests)
     * @public
     */
    basicExtraction(text) {
        console.log('📋 Extraction basique publique...');
        
        const extractedData = {
            type: this.detectDocumentType(text),
            entite: this.detectEntity(text), 
            date: this.extractDate(text),
            numero: this.extractNumber(text),
            fournisseur: this.extractSupplier(text),
            montant_ht: this.extractAmount(text, 'HT'),
            montant_tva: this.extractAmount(text, 'TVA'),
            montant_ttc: this.extractAmount(text, 'TTC'),
            taux_tva: this.extractVATRate(text),
            devise: 'CHF'
        };

        // Format uniforme pour compatibilité
        return {
            document_type: extractedData.type,
            entity: extractedData.entite,
            currency: extractedData.devise,
            confidence: 0.75, // Extraction basique = confiance moyenne
            method: 'tesseract',
            extracted_data: extractedData
        };
    }

    /**
     * Extraction intelligente avec OpenAI
     */
    async extractWithOpenAI(text, basicData) {
        if (!this.openaiKey) {
            throw new Error('Clé OpenAI manquante');
        }

        console.log('🧠 Extraction intelligente OpenAI...');
        
        const prompt = this.buildOpenAIPrompt(text, basicData);
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.openaiKey}`
            },
            body: JSON.stringify({
                model: this.config.openai.model,
                messages: [
                    {
                        role: 'system',
                        content: 'Tu es un expert en extraction de données financières. Retourne uniquement du JSON valide.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: this.config.openai.maxTokens,
                temperature: this.config.openai.temperature
            })
        });

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status}`);
        }

        const result = await response.json();
        const jsonResponse = result.choices[0].message.content;
        
        try {
            return JSON.parse(jsonResponse);
        } catch (error) {
            console.error('❌ Erreur parsing JSON OpenAI:', jsonResponse);
            throw new Error('Réponse OpenAI invalide');
        }
    }

    /**
     * Construction du prompt OpenAI
     */
    buildOpenAIPrompt(text, basicData) {
        return `
Extrait les données financières de ce document OCR multi-devises et retourne un JSON structuré.

TEXTE OCR:
${text.substring(0, 3000)}

DONNÉES BASIQUES DÉTECTÉES:
${JSON.stringify(basicData, null, 2)}

🎯 INSTRUCTIONS CRITIQUES - CLIENT OBLIGATOIRE:
1. IDENTIFIE LE CLIENT DESTINATAIRE (entreprise facturée par HYPERVISUAL)
   - Le client est APRÈS l'émetteur HYPERVISUAL et AVANT le numéro de document
   - Cherche des sociétés comme "PUBLIGRAMA ADVERTISING S.L.", "PROMIDEA SRL"
2. DETECTE la devise PRINCIPALE utilisée dans le document (CHF, EUR, USD, GBP, CAD)
3. IDENTIFIE le statut TVA:
   - "hors_tva" : Si mention explicite HT, Hors TVA, excluding VAT, net
   - "ttc" : Si mention TTC, including VAT, avec TVA, gross
   - "non_applicable" : Si mention N/A, exempt, exonéré
4. NE CALCULE PAS la TVA - détecte seulement les montants présents
5. Si devise EUR et pas de mention TVA = suppose "hors_tva"

STRUCTURE DOCUMENT TYPE:
- Lignes 1-3: HYPERVISUAL (émetteur)
- Lignes 4-7: CLIENT DESTINATAIRE + adresse
- Lignes 8+: Numéro document, date, détails

RETOURNE UN JSON avec cette structure exacte:
{
  "type": "facture_fournisseur|facture_client|ticket_cb|devis|note_frais",
  "entite": "hypervisual|dainamics|enki_reality|takeout|lexaia",
  "client": "NOM COMPLET DU CLIENT DESTINATAIRE",
  "clientAddress": "adresse complète du client",
  "clientCountry": "pays du client",
  "numero": "string",
  "date": "YYYY-MM-DD",
  "date_echeance": "YYYY-MM-DD ou null",
  "fournisseur": {
    "nom": "string",
    "adresse": "string",
    "npa_ville": "string",
    "numero_tva": "string ou null"
  },
  "montant_ht": "number ou null",
  "montant_tva": "number ou null", 
  "montant_ttc": "number",
  "taux_tva": "number (0 si hors_tva)",
  "devise": "CHF|EUR|USD|GBP|CAD",
  "vat_status": "hors_tva|ttc|non_applicable",
  "ligne_articles": [
    {
      "description": "string",
      "quantite": "number",
      "prix_unitaire": "number",
      "total": "number"
    }
  ],
  "confidence": "number entre 0.8 et 1.0"
}

RÈGLES MULTI-DEVISES:
- CHF: TVA 8.1% (standard), 2.6% (réduit), 3.8% (hébergement)
- EUR: TVA varie selon pays (France 20%, Belgique 21%, etc.)
- USD/GBP/CAD: Adapter selon contexte
- Montants DOIVENT être dans la devise détectée
- Si "hors_tva": montant_tva = 0 et taux_tva = 0
- Dates au format ISO (YYYY-MM-DD)
`;
    }

    /**
     * Méthode publique pour construire le prompt (compatibilité tests)
     * @public
     */
    buildPrompt(text, documentType = 'invoice') {
        const basicData = {
            type: documentType,
            entite: this.detectEntity(text),
            date: this.extractDate(text),
            numero: this.extractNumber(text),
            fournisseur: this.extractSupplier(text),
            montant_ttc: this.extractAmount(text, 'TTC'),
            devise: 'CHF'
        };
        
        return this.buildOpenAIPrompt(text, basicData);
    }

    /**
     * NOUVEAU: Extraction intelligente du client destinataire
     */
    extractClientInfo(text) {
        console.log('👤 Extraction client destinataire...');
        
        const lines = text.split('\n').map(l => l.trim()).filter(l => l);
        
        // 1. Trouver fin du bloc émetteur HYPERVISUAL
        let emitterEndIndex = -1;
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes('Fribourg') || lines[i].includes('1700') || 
                lines[i].includes('HMF Corporation') || lines[i].includes('HYPERVISUAL')) {
                emitterEndIndex = i;
            }
        }
        
        // 2. Trouver début en-tête document
        let documentStartIndex = lines.length;
        for (let i = emitterEndIndex + 1; i < lines.length; i++) {
            if (/^(Offer|Invoice|Facture|Devis|Quote)\s+[A-Z0-9-]+/i.test(lines[i]) || 
                lines[i].includes('Date:') || lines[i].includes('N°') || lines[i].includes('No.')) {
                documentStartIndex = i;
                break;
            }
        }
        
        // 3. Extraire bloc client entre émetteur et document
        const clientLines = lines.slice(emitterEndIndex + 1, documentStartIndex)
                               .filter(line => line.length > 0);
        
        // 4. Identifier nom client (ligne la plus "corporate")
        let clientName = '';
        
        // Patterns pour détecter les noms d'entreprises
        const corporatePatterns = [
            /[A-Z][A-Z\s&\.\-]{4,}(?:S\.?L\.?|SRL|SA|SARL|LLC|LTD|GmbH|AG|SAS|Inc|Corp)\.?$/i,
            /^[A-Z][A-Z\s&\.\-]{6,}$/,
            /(?:Client|Destinataire|To|Bill\s+to)[\s:]*(.+)/i
        ];
        
        // Chercher d'abord avec les patterns
        for (const pattern of corporatePatterns) {
            for (const line of clientLines) {
                const match = line.match(pattern);
                if (match) {
                    clientName = match[1] || match[0];
                    break;
                }
            }
            if (clientName) break;
        }
        
        // Si pas trouvé, prendre la première ligne significative après l'émetteur
        if (!clientName && clientLines.length > 0) {
            clientName = clientLines[0];
        }
        
        // 5. Extraire adresse et pays
        const addressLines = clientName ? 
            clientLines.filter(line => line !== clientName) : 
            clientLines.slice(1);
        const address = addressLines.join(', ');
        const country = this.extractCountry(address);
        
        console.log(`✅ Client détecté: "${clientName}" | Adresse: "${address}"`);
        
        return {
            client: clientName.trim(),
            clientAddress: address.trim(),
            clientCountry: country
        };
    }

    /**
     * Extraction du pays depuis une adresse
     */
    extractCountry(address) {
        const countries = {
            'Switzerland': ['Switzerland', 'Suisse', 'Schweiz', 'Svizzera', 'CH'],
            'Spain': ['Spain', 'España', 'Espagne', 'ES'],
            'France': ['France', 'FR'],
            'Germany': ['Germany', 'Deutschland', 'Allemagne', 'DE'],
            'Italy': ['Italy', 'Italia', 'Italie', 'IT'],
            'USA': ['USA', 'United States', 'America', 'US'],
            'Canada': ['Canada', 'CA'],
            'United Kingdom': ['United Kingdom', 'UK', 'England', 'GB'],
            'Belgium': ['Belgium', 'Belgique', 'België', 'BE'],
            'Netherlands': ['Netherlands', 'Nederland', 'Pays-Bas', 'NL']
        };
        
        const lowerAddress = address.toLowerCase();
        
        for (const [country, variants] of Object.entries(countries)) {
            for (const variant of variants) {
                if (lowerAddress.includes(variant.toLowerCase())) {
                    return country;
                }
            }
        }
        
        return '';
    }

    /**
     * NOUVEAU: Détection intelligente devise et TVA
     */
    detectCurrencyAndVAT(text) {
        const patterns = {
            currencies: {
                'EUR': /€|EUR(?!O)|euros?(?:\s|$)/gi,
                'USD': /\$|USD|dollars?(?:\s|$)/gi,
                'CHF': /CHF|francs?\s+suisses?/gi,
                'GBP': /£|GBP|pounds?(?:\s|$)/gi
            },
            vatIndicators: {
                hors_tva: /hors\s+tva|excluding\s+vat|net\s+amount|sans\s+tva|excl\.\s*vat|htva|ht\s|net/gi,
                avec_tva: /ttc|including\s+vat|avec\s+tva|gross\s+amount|incl\.\s*vat|tvac/gi,
                non_applicable: /non\s+applicable|n\/a|exempt|exonéré/gi
            }
        };
        
        // Détection devise principale
        let detectedCurrency = 'CHF'; // Par défaut Suisse
        let maxMatches = 0;
        
        for (const [currency, pattern] of Object.entries(patterns.currencies)) {
            const matches = (text.match(pattern) || []).length;
            if (matches > maxMatches) {
                maxMatches = matches;
                detectedCurrency = currency;
            }
        }
        
        // Détection statut TVA
        let vatStatus = 'ttc'; // Par défaut TTC
        
        if (patterns.vatIndicators.hors_tva.test(text)) {
            vatStatus = 'hors_tva';
        } else if (patterns.vatIndicators.non_applicable.test(text)) {
            vatStatus = 'non_applicable';
        }
        
        // Extraction taux TVA si présent
        let vatRate = 0;
        const vatRatePattern = /(?:tva|vat|mwst)\s*:?\s*(\d+(?:[.,]\d+)?)\s*%/gi;
        const vatMatch = vatRatePattern.exec(text);
        
        if (vatMatch) {
            vatRate = parseFloat(vatMatch[1].replace(',', '.'));
        } else if (vatStatus === 'ttc' && detectedCurrency === 'CHF') {
            // Défaut Suisse si TTC et CHF
            vatRate = 8.1;
        }
        
        // Si hors TVA, forcer le taux à 0
        if (vatStatus === 'hors_tva' || vatStatus === 'non_applicable') {
            vatRate = 0;
        }
        
        console.log(`💱 Devise détectée: ${detectedCurrency}, TVA: ${vatRate}% (${vatStatus})`);
        
        return {
            currency: detectedCurrency,
            vatRate: vatRate,
            vatStatus: vatStatus
        };
    }

    /**
     * Détection intelligente du type de document
     */
    detectDocumentType(text, extractedData = {}) {
        console.log('📄 Détection type document...');
        
        const patterns = {
            facture_client: {
                keywords: ['facture', 'invoice', 'rechnung', 'bill'],
                indicators: [
                    text.includes('facturé à') || text.includes('bill to') || text.includes('rechnung an'),
                    extractedData.company?.toLowerCase().includes('hypervisual'),
                    extractedData.client && !extractedData.client.toLowerCase().includes('hypervisual'),
                    text.includes('échéance') || text.includes('due date'),
                    text.includes('conditions de paiement') || text.includes('payment terms')
                ],
                weight: 30
            },
            
            facture_fournisseur: {
                keywords: ['facture', 'invoice', 'bill', 'receipt'],
                indicators: [
                    !extractedData.company?.toLowerCase().includes('hypervisual'),
                    extractedData.client?.toLowerCase().includes('hypervisual'),
                    text.includes('payment due') || text.includes('à payer'),
                    text.includes('remit to') || text.includes('payer à')
                ],
                weight: 25
            },
            
            devis: {
                keywords: ['devis', 'quote', 'quotation', 'offer', 'proposal', 'offre'],
                indicators: [
                    text.includes('valable jusqu') || text.includes('valid until') || text.includes('expires'),
                    text.includes('estimation') || text.includes('estimated'),
                    text.includes('proposition') || text.includes('proposed'),
                    !text.includes('payment') && !text.includes('paiement'),
                    text.includes('acceptance') || text.includes('acceptation')
                ],
                weight: 35
            },
            
            note_frais: {
                keywords: ['expense', 'frais', 'spesen', 'reimbursement', 'remboursement'],
                indicators: [
                    text.includes('expense report') || text.includes('note de frais'),
                    text.includes('reimbursement') || text.includes('remboursement'),
                    text.includes('per diem') || text.includes('indemnité'),
                    text.includes('mileage') || text.includes('kilométrage')
                ],
                weight: 20
            },
            
            ticket_cb: {
                keywords: ['ticket', 'reçu', 'receipt', 'terminal'],
                indicators: [
                    text.includes('carte') || text.includes('card'),
                    text.includes('terminal') || text.includes('pos'),
                    text.includes('mastercard') || text.includes('visa'),
                    text.length < 500 // Les tickets sont généralement courts
                ],
                weight: 15
            }
        };
        
        // Calcul des scores pour chaque type
        const scores = Object.entries(patterns).map(([type, pattern]) => {
            let score = 0;
            
            // Points pour mots-clés
            pattern.keywords.forEach(keyword => {
                if (text.toLowerCase().includes(keyword)) {
                    score += pattern.weight;
                }
            });
            
            // Points pour indicateurs
            const matchedIndicators = pattern.indicators.filter(indicator => {
                if (typeof indicator === 'boolean') return indicator;
                if (typeof indicator === 'string') return true;
                return false;
            }).length;
            
            score += matchedIndicators * 10;
            
            // Calcul de la confiance (0-1)
            const maxPossibleScore = pattern.weight + (pattern.indicators.length * 10);
            const confidence = Math.min(score / maxPossibleScore, 1);
            
            return {
                type,
                score,
                confidence,
                matchedKeywords: pattern.keywords.filter(k => text.toLowerCase().includes(k)).length,
                matchedIndicators
            };
        });
        
        // Trouver le meilleur match
        const bestMatch = scores.reduce((best, current) => 
            current.score > best.score ? current : best
        );
        
        // Ajuster la confiance si score trop bas
        if (bestMatch.score < 20) {
            bestMatch.confidence = 0.5; // Confiance faible
        }
        
        console.log(`✅ Type détecté: ${bestMatch.type} (confiance: ${Math.round(bestMatch.confidence * 100)}%)`);
        
        return {
            type: bestMatch.type,
            confidence: bestMatch.confidence,
            alternativeTypes: scores
                .filter(s => s.type !== bestMatch.type && s.score > 10)
                .sort((a, b) => b.score - a.score)
                .slice(0, 2), // Top 2 alternatives
            details: {
                matchedKeywords: bestMatch.matchedKeywords,
                matchedIndicators: bestMatch.matchedIndicators
            }
        };
    }

    /**
     * Détection de l'entité
     */
    detectEntity(text) {
        const entities = {
            hypervisual: /hypervisual|hyper.visual/i,
            dainamics: /dainamics|daina.mics/i,
            enki_reality: /enki.reality|enki/i,
            takeout: /takeout|take.out/i,
            lexaia: /lexaia|lexa.ia/i
        };

        for (const [entity, pattern] of Object.entries(entities)) {
            if (pattern.test(text)) {
                return entity;
            }
        }
        
        return 'hypervisual'; // Par défaut
    }

    /**
     * Extraction de la date
     */
    extractDate(text) {
        const patterns = [
            /(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{4})/,
            /(\d{4})[.\/-](\d{1,2})[.\/-](\d{1,2})/
        ];

        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) {
                const [, p1, p2, p3] = match;
                // Essayer différents formats
                if (p3.length === 4) {
                    return `${p3}-${p2.padStart(2, '0')}-${p1.padStart(2, '0')}`;
                } else {
                    return `${p1}-${p2.padStart(2, '0')}-${p3.padStart(2, '0')}`;
                }
            }
        }

        return new Date().toISOString().split('T')[0]; // Aujourd'hui par défaut
    }

    /**
     * Extraction des montants
     */
    extractAmount(text, type) {
        const patterns = {
            HT: /(?:HT|hors.tva)[\s:]*([0-9]+[',.]?[0-9]*)/i,
            TVA: /(?:TVA|tva|mwst)[\s:]*([0-9]+[',.]?[0-9]*)/i,
            TTC: /(?:TTC|total|ttc)[\s:]*([0-9]+[',.]?[0-9]*)/i
        };

        const pattern = patterns[type];
        if (!pattern) return null;

        const match = text.match(pattern);
        if (match) {
            return parseFloat(match[1].replace(/[',]/g, '.'));
        }

        // Fallback: chercher tous les montants
        const amounts = text.match(/([0-9]+[',.]?[0-9]*)/g);
        if (amounts && amounts.length > 0) {
            return parseFloat(amounts[amounts.length - 1].replace(/[',]/g, '.'));
        }

        return null;
    }

    /**
     * Extraction du taux de TVA
     */
    extractVATRate(text) {
        const match = text.match(/([0-9]+[.,]?[0-9]*)\s*%/);
        if (match) {
            const rate = parseFloat(match[1].replace(',', '.'));
            // Arrondir aux taux suisses standards
            if (rate >= 7 && rate <= 9) return 8.1;
            if (rate >= 2 && rate <= 3) return 2.6;
            if (rate >= 3.5 && rate <= 4) return 3.8;
            return rate;
        }
        return 8.1; // Taux standard par défaut
    }

    /**
     * Extraction du numéro de document
     */
    extractNumber(text) {
        const patterns = [
            /(?:facture|invoice|n°|no|nr)[\s:]*([A-Z0-9\-]+)/i,
            /([A-Z]{2,4}[-_]?[0-9]{3,6})/
        ];

        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) {
                return match[1];
            }
        }

        return `AUTO-${Date.now()}`;
    }

    /**
     * Extraction du fournisseur
     */
    extractSupplier(text) {
        const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 3);
        
        // Heuristique: première ligne significative souvent = nom fournisseur
        for (const line of lines.slice(0, 5)) {
            if (!/facture|invoice|date|tva|total/i.test(line) && line.length > 5) {
                return line;
            }
        }
        
        return 'Fournisseur non identifié';
    }

    /**
     * Fusion des résultats
     */
    mergeResults(basicData, smartData) {
        if (!smartData) {
            return basicData;
        }

        // Normaliser le fournisseur si c'est un objet
        let fournisseur = smartData.fournisseur || basicData.fournisseur;
        if (fournisseur && typeof fournisseur === 'object') {
            fournisseur = fournisseur.nom || fournisseur.name || 'Fournisseur non identifié';
        }

        // Fusionner en privilégiant les données intelligentes
        const merged = {
            ...basicData,
            ...smartData,
            // S'assurer que fournisseur est toujours une string
            fournisseur: String(fournisseur || basicData.fournisseur || 'Fournisseur non identifié'),
            // CLIENT - privilégier OpenAI mais garder fallback
            client: smartData.client || basicData.client || 'CLIENT NON DÉTECTÉ',
            clientAddress: smartData.clientAddress || basicData.clientAddress || '',
            clientCountry: smartData.clientCountry || basicData.clientCountry || '',
            // Garder les meilleurs montants
            montant_ttc: smartData.montant_ttc || basicData.montant_ttc,
            montant_ht: smartData.montant_ht || basicData.montant_ht,
            montant_tva: smartData.montant_tva || basicData.montant_tva,
            // Garder le statut TVA
            vat_status: smartData.vat_status || basicData.vat_status || 'ttc',
            // Devise
            devise: smartData.devise || basicData.devise || 'CHF'
        };

        // Si hors TVA, forcer montant_tva à 0
        if (merged.vat_status === 'hors_tva' || merged.vat_status === 'non_applicable') {
            merged.montant_tva = 0;
            merged.taux_tva = 0;
        }

        return merged;
    }

    /**
     * Validation des données extraites
     */
    async validateData(data) {
        console.log('✅ Validation des données multi-devises...');
        
        const errors = [];
        const warnings = [];

        // Validation cohérence montants selon statut TVA
        if (data.vat_status === 'hors_tva') {
            // Si hors TVA, pas de validation HT+TVA=TTC
            if (data.montant_tva && data.montant_tva > 0) {
                warnings.push({
                    field: 'montant_tva',
                    message: 'Montant TVA présent mais statut "hors_tva"'
                });
            }
        } else if (data.vat_status === 'ttc' && data.montant_ht && data.montant_tva && data.montant_ttc) {
            // Validation uniquement si TTC
            const calculatedTTC = data.montant_ht + data.montant_tva;
            const diff = Math.abs(calculatedTTC - data.montant_ttc);
            
            if (diff > 0.02) { // Tolérance 2 centimes
                errors.push({
                    field: 'montant_ttc',
                    message: `Incohérence: HT(${data.montant_ht}) + TVA(${data.montant_tva}) ≠ TTC(${data.montant_ttc})`,
                    suggestion: Math.round(calculatedTTC * 100) / 100
                });
            }
        }

        // Validation taux TVA selon devise
        if (data.devise === 'CHF' && data.taux_tva && ![0, 2.6, 3.8, 8.1].includes(data.taux_tva)) {
            warnings.push({
                field: 'taux_tva',
                message: `Taux TVA inhabituel pour CHF: ${data.taux_tva}% (attendu: 0%, 2.6%, 3.8%, 8.1%)`
            });
        } else if (data.devise === 'EUR' && data.taux_tva && data.taux_tva > 0) {
            // TVA EUR varie selon pays (5% à 27%)
            if (data.taux_tva < 5 || data.taux_tva > 27) {
                warnings.push({
                    field: 'taux_tva',
                    message: `Taux TVA inhabituel pour EUR: ${data.taux_tva}% (Europe: 5% à 27%)`
                });
            }
        }

        // Validation devise
        if (!['CHF', 'EUR', 'USD', 'GBP', 'CAD'].includes(data.devise)) {
            errors.push({
                field: 'devise',
                message: `Devise non supportée: ${data.devise}`
            });
        }

        // Validation date
        if (data.date && new Date(data.date) > new Date()) {
            warnings.push({
                field: 'date',
                message: 'Date future détectée'
            });
        }

        console.log(`✅ Validation terminée: ${errors.length} erreur(s), ${data.devise} ${data.vat_status}`);
        
        return {
            valid: errors.length === 0,
            errors: errors,
            warnings: warnings,
            score: errors.length === 0 ? (warnings.length === 0 ? 1.0 : 0.8) : 0.6
        };
    }

    /**
     * Méthode publique pour validation et normalisation (compatibilité tests)
     * @public
     */
    async validateAndNormalize(data) {
        console.log('🔍 Validation et normalisation...');
        
        const errors = [];
        const warnings = [];
        
        // Assurer que le fournisseur est toujours une string
        if (!data.extracted_data) {
            data.extracted_data = {};
        }
        
        if (typeof data.extracted_data.fournisseur !== 'string') {
            data.extracted_data.fournisseur = String(data.extracted_data.fournisseur || 'Fournisseur non identifié');
        }
        
        // Validation cohérence montants
        if (data.extracted_data.montant_ht && data.extracted_data.montant_tva && data.extracted_data.montant_ttc) {
            const calculatedTTC = data.extracted_data.montant_ht + data.extracted_data.montant_tva;
            const diff = Math.abs(calculatedTTC - data.extracted_data.montant_ttc);
            
            if (diff > 0.02) {
                const suggestedFix = Math.round(calculatedTTC * 100) / 100;
                errors.push({
                    field: 'montant_ttc',
                    message: `Incohérence: HT(${data.extracted_data.montant_ht}) + TVA(${data.extracted_data.montant_tva}) ≠ TTC(${data.extracted_data.montant_ttc})`,
                    suggested_fix: suggestedFix
                });
                
                // Auto-correction
                data.extracted_data.montant_ttc = suggestedFix;
            }
        }
        
        // Validation taux TVA
        if (data.extracted_data.taux_tva && ![0, 2.6, 3.8, 8.1].includes(data.extracted_data.taux_tva)) {
            warnings.push({
                field: 'taux_tva',
                message: `Taux TVA inhabituel: ${data.extracted_data.taux_tva}%`
            });
        }
        
        // Normalisation des données
        const normalized = {
            ...data,
            validation_errors: errors,
            validation_warnings: warnings,
            confidence: data.confidence || 0.75,
            normalized: true
        };
        
        return normalized;
    }
}

// Export pour utilisation
window.OCRHybridProcessor = OCRHybridProcessor;

console.log('✅ OCR Hybrid Processor v1.2.0 chargé (Multi-Devises + VAT Detection)');