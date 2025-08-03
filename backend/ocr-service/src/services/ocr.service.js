const Tesseract = require('tesseract.js');
const { v4: uuidv4 } = require('uuid');
const { logger } = require('../config/logger');
const ExtractionService = require('./extraction.service');
const { getRedisClient } = require('../config/redis');

class OCRService {
  constructor() {
    this.scheduler = null;
    this.workers = [];
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      const workerCount = parseInt(process.env.WORKERS) || 4;
      logger.info(`Initialisation de ${workerCount} workers Tesseract...`);
      
      this.scheduler = Tesseract.createScheduler();
      
      for (let i = 0; i < workerCount; i++) {
        const worker = await this.createWorker(i);
        this.workers.push(worker);
        this.scheduler.addWorker(worker);
      }
      
      this.isInitialized = true;
      logger.info('✅ OCR Service initialisé');
    } catch (error) {
      logger.error('Erreur initialisation OCR:', error);
      throw error;
    }
  }

  async createWorker(workerId) {
    const worker = await Tesseract.createWorker({
      logger: (m) => {
        if (m.status === 'recognizing text') {
          logger.debug(`Worker ${workerId}: ${Math.round(m.progress * 100)}%`);
        }
      }
    });

    const languages = process.env.TESSERACT_LANG || 'fra+eng';
    await worker.loadLanguage(languages);
    await worker.initialize(languages);
    
    // Configuration pour factures
    await worker.setParameters({
      tessedit_pageseg_mode: Tesseract.PSM.AUTO_OSD,
      preserve_interword_spaces: '1',
      user_defined_dpi: '300',
      tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzàâäçèéêëîïôùûüÀÂÄÇÈÉÊËÎÏÔÙÛÜ.,;:!?-/()[]{}@#$%&*+=€£¥°"\'',
    });
    
    logger.info(`Worker ${workerId} configuré`);
    return worker;
  }

  async processDocument({ buffer, filename, documentType = 'invoice', options = {} }) {
    const jobId = uuidv4();
    const startTime = Date.now();
    
    try {
      logger.info(`OCR Job ${jobId}: ${filename}`);

      // Vérifier cache
      const cacheKey = this.getCacheKey(buffer);
      const cached = await this.getFromCache(cacheKey);
      if (cached) {
        logger.info(`Cache hit pour ${jobId}`);
        return cached;
      }

      // OCR
      const ocrResult = await this.performOCR(buffer, options);
      
      // Extraction
      const structuredData = await ExtractionService.extract(ocrResult, documentType);
      
      const result = {
        jobId,
        success: true,
        filename,
        documentType,
        processingTime: Date.now() - startTime,
        confidence: ocrResult.data.confidence,
        rawText: ocrResult.data.text,
        structuredData,
        statistics: {
          words: ocrResult.data.words.length,
          lines: ocrResult.data.lines.length
        }
      };

      // Cache
      await this.putInCache(cacheKey, result);
      
      logger.info(`OCR terminé ${jobId}: ${result.processingTime}ms`);
      return result;

    } catch (error) {
      logger.error(`Erreur OCR ${jobId}:`, error);
      return {
        jobId,
        success: false,
        error: error.message,
        filename,
        processingTime: Date.now() - startTime
      };
    }
  }

  async performOCR(buffer, options = {}) {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return await this.scheduler.addJob('recognize', buffer, options);
  }

  getCacheKey(buffer) {
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');
    return `ocr:result:${hash}`;
  }

  async getFromCache(key) {
    try {
      const redis = getRedisClient();
      const cached = await redis.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      logger.warn('Erreur cache:', error);
      return null;
    }
  }

  async putInCache(key, data) {
    try {
      const redis = getRedisClient();
      const ttl = parseInt(process.env.CACHE_TTL) || 3600;
      await redis.setex(key, ttl, JSON.stringify(data));
    } catch (error) {
      logger.warn('Erreur cache:', error);
    }
  }

  getStatus() {
    return {
      initialized: this.isInitialized,
      workers: this.workers.length,
      scheduler: !!this.scheduler
    };
  }

  async terminate() {
    if (this.scheduler) {
      await this.scheduler.terminate();
    }
    this.isInitialized = false;
  }
}

module.exports = new OCRService();