/**
 * OCR Vision Service - OpenAI Vision API
 * Remplacement de Tesseract.js par GPT-4 Vision
 * Performance cible: <15s par document
 */

const axios = require('axios');
const FormData = require('form-data');
const { v4: uuidv4 } = require('uuid');
const { logger } = require('../config/logger');
const ExtractionService = require('./extraction.service');
const { getRedisClient } = require('../config/redis');
const crypto = require('crypto');

class OCRVisionService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.apiEndpoint = 'https://api.openai.com/v1/chat/completions';
    this.model = process.env.OPENAI_MODEL || 'gpt-4o-mini'; // Nouveau modèle avec vision
    this.isInitialized = false;
    
    // Configuration
    this.config = {
      maxTokens: 4096,
      temperature: 0.1,
      detailLevel: 'high',
      timeout: 30000,
      maxFileSize: 20 * 1024 * 1024 // 20MB
    };
    
    // Schémas Notion
    this.notionSchemas = {
      FACTURE_FOURNISSEUR: {
        dbId: "237adb95-3c6f-80de-9f92-c795334e5561",
        fields: ["Numéro Facture", "Fournisseur", "Date Facture", "Montant TTC", "Devise"]
      },
      FACTURE_CLIENT: {
        dbId: "226adb95-3c6f-8011-a9bb-ca31f7da8e6a",
        fields: ["Numéro", "Client", "Date Émission", "Montant TTC", "Statut"]
      },
      CONTRAT: {
        dbId: "22eadb95-3c6f-8099-81fe-d4890db02d9c",
        fields: ["Nom Contrat", "Partie Contractante", "Valeur Contrat", "Date Début"]
      },
      NOTE_FRAIS: {
        dbId: "237adb95-3c6f-804b-a530-e44d07ac9f7b",
        fields: ["Description", "Montant", "Date", "Employé"]
      }
    };
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      if (!this.apiKey) {
        throw new Error('OPENAI_API_KEY manquante dans l\'environnement');
      }
      
      // Vérifier la clé API
      const isValid = await this.validateAPIKey();
      if (!isValid) {
        throw new Error('Clé API OpenAI invalide');
      }
      
      this.isInitialized = true;
      logger.info('✅ OCR Vision Service initialisé (OpenAI Vision)');
      
    } catch (error) {
      logger.error('Erreur initialisation OCR Vision:', error);
      throw error;
    }
  }

  async validateAPIKey() {
    try {
      const response = await axios.get('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  async processDocument({ buffer, filename, documentType = 'auto', options = {} }) {
    const jobId = uuidv4();
    const startTime = Date.now();
    
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      logger.info(`Vision OCR Job ${jobId}: ${filename}`);

      // Vérifier la taille
      if (buffer.length > this.config.maxFileSize) {
        throw new Error(`Fichier trop volumineux: ${(buffer.length / 1024 / 1024).toFixed(2)}MB (max: 20MB)`);
      }

      // Vérifier le cache
      const cacheKey = this.getCacheKey(buffer);
      const cached = await this.getFromCache(cacheKey);
      if (cached && !options.noCache) {
        logger.info(`Cache hit pour ${jobId}`);
        return cached;
      }

      // Convertir en base64
      const base64Image = buffer.toString('base64');
      
      // Déterminer le type MIME
      const mimeType = this.detectMimeType(filename, buffer);
      
      // Appel OpenAI Vision
      const visionResult = await this.callVisionAPI(base64Image, mimeType, documentType);
      
      // Structurer les résultats
      const result = {
        jobId,
        success: true,
        filename,
        documentType: visionResult.document_type,
        processingTime: Date.now() - startTime,
        confidence: visionResult.confidence || 0.95,
        rawText: visionResult.raw_text || '',
        structuredData: visionResult.extracted_data,
        notionMapping: visionResult.notion_mapping,
        statistics: {
          method: 'openai-vision',
          model: this.model,
          tokensUsed: visionResult.usage?.total_tokens || 0
        }
      };

      // Mettre en cache
      await this.putInCache(cacheKey, result);
      
      logger.info(`Vision OCR terminé ${jobId}: ${result.processingTime}ms`);
      return result;

    } catch (error) {
      logger.error(`Erreur Vision OCR ${jobId}:`, error);
      
      return {
        jobId,
        success: false,
        error: error.message,
        filename,
        processingTime: Date.now() - startTime,
        fallbackAvailable: true // Possibilité de fallback sur Tesseract
      };
    }
  }

  async callVisionAPI(base64Image, mimeType, documentType) {
    const prompt = this.buildPrompt(documentType);
    
    const requestBody = {
      model: this.model,
      messages: [
        {
          role: "system",
          content: "Tu es un expert en extraction de données de documents financiers. Analyse l'image et retourne un JSON structuré avec toutes les informations."
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
                url: `data:${mimeType};base64,${base64Image}`,
                detail: this.config.detailLevel
              }
            }
          ]
        }
      ],
      max_tokens: this.config.maxTokens,
      temperature: this.config.temperature
    };

    try {
      const response = await axios.post(this.apiEndpoint, requestBody, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: this.config.timeout
      });

      const content = response.data.choices[0].message.content;
      
      // Extraire le JSON de la réponse
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/);
      const jsonString = jsonMatch ? jsonMatch[1] : content;
      
      const parsedData = JSON.parse(jsonString);
      
      // Ajouter les statistiques d'usage
      parsedData.usage = response.data.usage;
      
      return parsedData;
      
    } catch (error) {
      if (error.response?.status === 429) {
        throw new Error('Limite de taux OpenAI atteinte. Réessayez dans quelques secondes.');
      }
      
      if (error.code === 'ECONNABORTED') {
        throw new Error('Timeout: L\'analyse a pris trop de temps');
      }
      
      throw new Error(`Erreur API Vision: ${error.message}`);
    }
  }

  buildPrompt(documentType) {
    const schemas = this.getSchemasSummary();
    
    return `Analyse cette image de document et extrais TOUTES les informations importantes.

INSTRUCTIONS CRITIQUES:
1. Détecter automatiquement le type de document (facture fournisseur, facture client, contrat, note de frais)
2. Si l'émetteur est HYPERVISUAL/DAINAMICS/ENKI REALITY/TAKEOUT/LEXAIA → Type = FACTURE_CLIENT
3. Si le destinataire est une de ces entités → Type = FACTURE_FOURNISSEUR
4. Extraire le CLIENT COMPLET (nom entreprise + adresse) - TRÈS IMPORTANT
5. Détecter la devise (EUR, CHF, USD, GBP) et tous les montants
6. Identifier les dates au format YYYY-MM-DD

SCHÉMAS NOTION DISPONIBLES:
${schemas}

RETOURNE OBLIGATOIREMENT CE FORMAT JSON:
\`\`\`json
{
  "document_type": "FACTURE_CLIENT|FACTURE_FOURNISSEUR|CONTRAT|NOTE_FRAIS",
  "confidence": 0.95,
  "raw_text": "Texte brut extrait pour référence",
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
      "pays": "Italy"
    },
    "date_emission": "2025-07-21",
    "date_echeance": "2025-08-04",
    "devise": "EUR",
    "montant_ht": 3020.00,
    "montant_tva": 244.62,
    "montant_ttc": 3264.62,
    "taux_tva": 8.1,
    "lignes_detail": []
  },
  "notion_mapping": {
    "database_id": "226adb95-3c6f-8011-a9bb-ca31f7da8e6a",
    "mapped_fields": {
      "Numéro": "AN-00094",
      "Client": "PROMIDEA SRL",
      "Montant TTC": 3264.62,
      "Devise": "EUR"
    }
  }
}
\`\`\``;
  }

  getSchemasSummary() {
    let summary = '';
    
    for (const [type, config] of Object.entries(this.notionSchemas)) {
      summary += `\n${type} (DB: ${config.dbId}):\n`;
      summary += config.fields.map(f => `  - ${f}`).join('\n');
      summary += '\n';
    }
    
    return summary;
  }

  detectMimeType(filename, buffer) {
    const ext = filename.toLowerCase().split('.').pop();
    const mimeTypes = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'pdf': 'application/pdf'
    };
    
    return mimeTypes[ext] || 'image/jpeg';
  }

  getCacheKey(buffer) {
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');
    return `ocr:vision:${hash}`;
  }

  async getFromCache(key) {
    try {
      const redis = getRedisClient();
      const cached = await redis.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      logger.warn('Erreur cache Vision:', error);
      return null;
    }
  }

  async putInCache(key, data) {
    try {
      const redis = getRedisClient();
      const ttl = parseInt(process.env.VISION_CACHE_TTL) || 7200; // 2h par défaut
      await redis.setex(key, ttl, JSON.stringify(data));
    } catch (error) {
      logger.warn('Erreur cache Vision:', error);
    }
  }

  getStatus() {
    return {
      initialized: this.isInitialized,
      model: this.model,
      hasApiKey: !!this.apiKey,
      maxFileSize: `${(this.config.maxFileSize / 1024 / 1024).toFixed(0)}MB`
    };
  }

  async getUsageStats() {
    // Récupérer les statistiques d'usage depuis Redis
    try {
      const redis = getRedisClient();
      const stats = await redis.get('ocr:vision:stats');
      return stats ? JSON.parse(stats) : {
        totalRequests: 0,
        totalTokens: 0,
        averageProcessingTime: 0,
        successRate: 100
      };
    } catch (error) {
      return null;
    }
  }

  async terminate() {
    this.isInitialized = false;
    logger.info('OCR Vision Service terminé');
  }
}

module.exports = new OCRVisionService();