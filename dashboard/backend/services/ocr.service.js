/**
 * OCR Service
 * Service principal pour le traitement OCR avec IA
 */

const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');
const logger = require('../utils/logger');
const { extractionSchemas, getExtractionHints, validateExtractedData } = require('../schemas/extraction.schemas');

class OCRService {
    constructor() {
        this.processingQueue = new Map();
        this.uploadDir = process.env.UPLOAD_DIR || './uploads';
        
        // Ensure upload directory exists
        this.ensureUploadDir();
    }

    async ensureUploadDir() {
        try {
            await fs.access(this.uploadDir);
        } catch {
            await fs.mkdir(this.uploadDir, { recursive: true });
            logger.info(`Created upload directory: ${this.uploadDir}`);
        }
    }

    /**
     * Process a document file with OCR
     */
    async processDocument(file) {
        const startTime = Date.now();
        const fileId = file.filename;

        try {
            // Update processing status
            this.updateStatus(fileId, 'processing', 'Reading document...');

            // Read file
            const filePath = path.join(this.uploadDir, file.filename);
            const fileBuffer = await fs.readFile(filePath);

            // Extract text based on file type
            let extractedText = '';
            
            if (file.mimetype === 'application/pdf') {
                extractedText = await this.extractTextFromPDF(fileBuffer);
            } else {
                extractedText = await this.extractTextFromImage(fileBuffer, file.mimetype);
            }

            // Update status
            this.updateStatus(fileId, 'processing', 'Analyzing with AI...');

            // Analyze text with AI
            const analysisResult = await this.analyzeWithAI(extractedText);

            // Add metadata
            analysisResult.data.fileName = file.originalname;
            analysisResult.data.fileSize = file.size;
            analysisResult.data.processingTime = Date.now() - startTime;

            // Validate extracted data
            const validation = validateExtractedData(analysisResult.data.type, analysisResult.data);
            
            if (!validation.valid) {
                logger.warn('Validation warnings:', validation.errors);
                analysisResult.data.validationWarnings = validation.errors;
            }

            // Update final status
            this.updateStatus(fileId, 'completed', 'Processing completed');

            return {
                success: true,
                data: analysisResult.data,
                processingTime: Date.now() - startTime
            };

        } catch (error) {
            logger.error('Error processing document:', error);
            this.updateStatus(fileId, 'error', error.message);
            
            return {
                success: false,
                error: error.message,
                processingTime: Date.now() - startTime
            };
        }
    }

    /**
     * Analyze text without file upload
     */
    async analyzeText(text, suggestedType = null) {
        const startTime = Date.now();

        try {
            const result = await this.analyzeWithAI(text, suggestedType);
            
            return {
                success: true,
                data: result.data,
                processingTime: Date.now() - startTime
            };

        } catch (error) {
            logger.error('Error analyzing text:', error);
            throw error;
        }
    }

    /**
     * Extract text from PDF using basic parsing
     * (In production, you would use pdf-parse or similar)
     */
    async extractTextFromPDF(buffer) {
        try {
            // This is a placeholder - in production use pdf-parse
            // For now, we'll simulate text extraction
            logger.info('Extracting text from PDF');
            
            // In real implementation:
            // const pdfParse = require('pdf-parse');
            // const data = await pdfParse(buffer);
            // return data.text;
            
            return 'PDF text extraction placeholder - implement with pdf-parse';
            
        } catch (error) {
            logger.error('PDF extraction error:', error);
            throw new Error('Failed to extract text from PDF');
        }
    }

    /**
     * Extract text from image using Tesseract
     * (In production, you would use tesseract.js)
     */
    async extractTextFromImage(buffer, mimeType) {
        try {
            logger.info('Extracting text from image');
            
            // This is a placeholder - in production use tesseract.js
            // For now, we'll simulate text extraction
            
            // In real implementation:
            // const Tesseract = require('tesseract.js');
            // const result = await Tesseract.recognize(buffer, 'fra+eng');
            // return result.data.text;
            
            return 'Image OCR text extraction placeholder - implement with tesseract.js';
            
        } catch (error) {
            logger.error('Image OCR error:', error);
            throw new Error('Failed to extract text from image');
        }
    }

    /**
     * Analyze extracted text with OpenAI
     */
    async analyzeWithAI(text, suggestedType = null) {
        try {
            // Detect document type if not suggested
            const documentType = suggestedType || await this.detectDocumentType(text);
            
            // Get extraction hints for the document type
            const hints = getExtractionHints(documentType);
            
            // Prepare prompt for OpenAI
            const prompt = `
                Analyse le document suivant et extrais les informations structurées.
                Type de document détecté: ${documentType}
                
                ${hints}
                
                Texte du document:
                ${text}
                
                Retourne les données extraites au format JSON avec tous les champs pertinents.
                Assure-toi d'extraire le CLIENT (entre l'émetteur et le numéro de document).
                Inclus un champ "confidence" entre 0 et 1 pour indiquer la fiabilité de l'extraction.
            `;

            // Call OpenAI API
            const response = await this.callOpenAI(prompt);
            
            // Parse and enhance response
            const extractedData = JSON.parse(response);
            extractedData.type = documentType;
            extractedData.rawText = text.substring(0, 2000); // Store first 2000 chars
            
            // Detect client if not found
            if (!extractedData.client && documentType !== 'note_frais') {
                extractedData.client = this.extractClientInfo(text).client;
            }
            
            // Auto-detect currency if not found
            if (!extractedData.devise) {
                extractedData.devise = this.detectCurrency(text);
            }
            
            // Calculate VAT status
            if (extractedData.montant_ttc && !extractedData.vat_status) {
                extractedData.vat_status = this.detectVATStatus(text);
            }

            return {
                success: true,
                data: extractedData
            };

        } catch (error) {
            logger.error('AI analysis error:', error);
            throw new Error('Failed to analyze document with AI');
        }
    }

    /**
     * Call OpenAI API
     */
    async callOpenAI(prompt) {
        try {
            const response = await axios.post('https://api.openai.com/v1/chat/completions', {
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: 'Tu es un expert en extraction de données de documents comptables. Tu retournes toujours des données structurées en JSON.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.1,
                max_tokens: 1000
            }, {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.data.choices[0].message.content;

        } catch (error) {
            logger.error('OpenAI API error:', error.response?.data || error.message);
            
            // Fallback to basic extraction
            return this.basicExtraction(prompt);
        }
    }

    /**
     * Basic extraction fallback when AI is not available
     */
    basicExtraction(text) {
        const data = {
            numero: this.extractPattern(text, /[A-Z]{2,3}-\d{4,6}/),
            date: this.extractDate(text),
            montant_ttc: this.extractAmount(text),
            devise: this.detectCurrency(text),
            client: this.extractClientInfo(text).client,
            confidence: 0.7
        };

        return JSON.stringify(data);
    }

    /**
     * Detect document type from text
     */
    detectDocumentType(text) {
        const textLower = text.toLowerCase();
        
        const typePatterns = {
            'facture_client': [/facture/i, /invoice/i, /bill/i],
            'facture_fournisseur': [/facture fournisseur/i, /supplier invoice/i],
            'devis': [/devis/i, /quote/i, /quotation/i, /offre/i, /offer/i],
            'note_frais': [/note de frais/i, /expense/i, /remboursement/i],
            'ticket_cb': [/ticket/i, /reçu/i, /receipt/i, /cb/i, /carte/i]
        };

        // Score each type
        const scores = {};
        
        for (const [type, patterns] of Object.entries(typePatterns)) {
            scores[type] = patterns.reduce((score, pattern) => {
                return score + (pattern.test(text) ? 1 : 0);
            }, 0);
        }

        // Additional scoring based on content
        if (text.includes('IBAN') || text.includes('RIB')) {
            scores['facture_client'] += 0.5;
        }
        
        if (textLower.includes('fournisseur') || textLower.includes('supplier')) {
            scores['facture_fournisseur'] += 1;
        }

        // Return type with highest score
        const bestType = Object.entries(scores).reduce((best, [type, score]) => {
            return score > best.score ? { type, score } : best;
        }, { type: 'document_divers', score: 0 });

        return bestType.type;
    }

    /**
     * Extract client information
     */
    extractClientInfo(text) {
        const lines = text.split('\n').map(l => l.trim()).filter(l => l);
        const result = { client: null, clientAddress: null, clientCountry: null };

        // Find emitter end and document number
        let emitterEndIndex = -1;
        let docNumberIndex = -1;

        // Common emitter indicators
        const emitterPatterns = [
            /^(switzerland|suisse|france|fribourg|paris)/i,
            /^(tél|tel|phone|email|www\.|site)/i,
            /^[A-Z]{2}\d{2}/i // VAT number
        ];

        // Document number patterns
        const docNumberPattern = /^(facture|invoice|devis|quote|offer|an-|inv-|f-)\s*[:#]?\s*[\w-]+/i;

        // Find indices
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // Check for emitter end
            if (emitterEndIndex === -1 && emitterPatterns.some(p => p.test(line))) {
                emitterEndIndex = i;
            }
            
            // Check for document number
            if (docNumberPattern.test(line)) {
                docNumberIndex = i;
                break;
            }
        }

        // Extract client info between emitter and document number
        if (emitterEndIndex !== -1 && docNumberIndex !== -1 && docNumberIndex > emitterEndIndex + 1) {
            const clientLines = lines.slice(emitterEndIndex + 1, docNumberIndex);
            
            // Find company name (usually first line with corporate pattern)
            const corporatePattern = /[A-Z][A-Z\s&\.\-]{3,}(?:S\.?L\.?|SRL|SA|SARL|LLC|LTD|GmbH|AG|SAS|Inc|Corp)\.?$/i;
            
            for (const line of clientLines) {
                if (!result.client && corporatePattern.test(line)) {
                    result.client = line.trim();
                } else if (result.client && !result.clientAddress) {
                    // Next lines are likely address
                    result.clientAddress = line;
                } else if (result.client && /^(spain|italy|france|switzerland|deutschland|usa)/i.test(line)) {
                    result.clientCountry = line;
                    break;
                }
            }
        }

        return result;
    }

    /**
     * Detect currency from text
     */
    detectCurrency(text) {
        const currencyPatterns = {
            'CHF': /\bCHF\b|Fr\.|Swiss Franc/i,
            'EUR': /\bEUR\b|€|Euro/i,
            'USD': /\bUSD\b|\$|Dollar/i,
            'GBP': /\bGBP\b|£|Pound/i
        };

        for (const [currency, pattern] of Object.entries(currencyPatterns)) {
            if (pattern.test(text)) {
                return currency;
            }
        }

        return 'EUR'; // Default
    }

    /**
     * Detect VAT status
     */
    detectVATStatus(text) {
        const textLower = text.toLowerCase();
        
        if (textLower.includes('hors tva') || textLower.includes('ht') || textLower.includes('excluding vat')) {
            return 'hors_tva';
        }
        
        if (textLower.includes('ttc') || textLower.includes('tva incluse') || textLower.includes('including vat')) {
            return 'ttc';
        }
        
        if (textLower.includes('autoliquidation') || textLower.includes('reverse charge')) {
            return 'autoliquidation';
        }
        
        if (textLower.includes('non soumis') || textLower.includes('exempt')) {
            return 'non_applicable';
        }
        
        return 'ttc'; // Default
    }

    /**
     * Extract patterns from text
     */
    extractPattern(text, pattern) {
        const match = text.match(pattern);
        return match ? match[0] : null;
    }

    /**
     * Extract date from text
     */
    extractDate(text) {
        // Try various date formats
        const datePatterns = [
            /\d{2}\/\d{2}\/\d{4}/,
            /\d{2}-\d{2}-\d{4}/,
            /\d{2}\.\d{2}\.\d{4}/,
            /\d{4}-\d{2}-\d{2}/
        ];

        for (const pattern of datePatterns) {
            const match = text.match(pattern);
            if (match) {
                return match[0];
            }
        }

        return new Date().toISOString().split('T')[0];
    }

    /**
     * Extract amount from text
     */
    extractAmount(text) {
        // Look for amounts with currency
        const amountPattern = /(\d{1,3}(?:[',\s]?\d{3})*(?:\.\d{2})?)\s*(?:CHF|EUR|USD|GBP|€|\$|£)?/g;
        const matches = text.match(amountPattern);
        
        if (matches) {
            // Return the largest amount found (likely total)
            const amounts = matches.map(m => {
                const cleanAmount = m.replace(/[^0-9.]/g, '');
                return parseFloat(cleanAmount) || 0;
            });
            
            return Math.max(...amounts);
        }
        
        return 0;
    }

    /**
     * Update processing status
     */
    updateStatus(fileId, status, message) {
        this.processingQueue.set(fileId, {
            status,
            message,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Get processing status
     */
    async getProcessingStatus(fileId) {
        return this.processingQueue.get(fileId) || null;
    }

    /**
     * Delete uploaded file
     */
    async deleteFile(fileId) {
        try {
            const filePath = path.join(this.uploadDir, fileId);
            await fs.unlink(filePath);
            this.processingQueue.delete(fileId);
            logger.info(`Deleted file: ${fileId}`);
        } catch (error) {
            logger.error('Error deleting file:', error);
            throw error;
        }
    }
}

module.exports = new OCRService();