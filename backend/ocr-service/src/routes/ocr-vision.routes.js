/**
 * Routes OCR Vision - OpenAI Vision API
 * Endpoints dédiés pour le traitement Vision AI
 */

const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs').promises;
const authMiddleware = require('../middlewares/auth.middleware');
const OCRVisionService = require('../services/ocr-vision.service');
const { logger } = require('../config/logger');

const router = express.Router();

// Configuration upload optimisée pour Vision
const storage = multer.memoryStorage(); // Stockage en mémoire pour performance

const upload = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024 // 20MB max pour Vision
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf'
    ];
    
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error(`Type non supporté: ${file.mimetype}`), false);
    }
    
    cb(null, true);
  }
});

/**
 * POST /api/ocr/vision/process
 * Traitement d'un document avec Vision AI
 */
router.post('/process',
  authMiddleware,
  upload.single('document'),
  async (req, res, next) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier fourni'
      });
    }

    try {
      const { 
        documentType = 'auto',
        notionSync = true,
        language = 'fr'
      } = req.body;
      
      logger.info('Vision OCR Request', {
        userId: req.user?.id,
        filename: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype
      });

      // Pour les PDFs, convertir en image (première page)
      let processBuffer = req.file.buffer;
      
      if (req.file.mimetype === 'application/pdf') {
        // TODO: Implémenter la conversion PDF → Image
        // Pour l'instant, on rejette les PDFs
        return res.status(400).json({
          success: false,
          message: 'Les PDFs nécessitent une conversion préalable. Utilisez une image (JPG, PNG).'
        });
      }

      const result = await OCRVisionService.processDocument({
        buffer: processBuffer,
        filename: req.file.originalname,
        documentType,
        options: {
          language,
          notionSync
        }
      });

      // Si succès et Notion sync activé
      if (result.success && notionSync && result.notionMapping) {
        // TODO: Appeler le service Notion pour sauvegarder
        result.notionSaved = false; // Pour l'instant
      }

      res.json(result);

    } catch (error) {
      logger.error('Erreur Vision OCR:', error);
      
      // Gérer les erreurs spécifiques
      if (error.message.includes('Limite de taux')) {
        return res.status(429).json({
          success: false,
          message: 'Limite API atteinte. Réessayez dans 60 secondes.',
          retryAfter: 60
        });
      }
      
      if (error.message.includes('trop volumineux')) {
        return res.status(413).json({
          success: false,
          message: error.message
        });
      }
      
      next(error);
    }
  }
);

/**
 * POST /api/ocr/vision/batch
 * Traitement par lot avec Vision AI
 */
router.post('/batch',
  authMiddleware,
  upload.array('documents', 10), // Max 10 fichiers
  async (req, res, next) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier fourni'
      });
    }

    try {
      const { documentType = 'auto' } = req.body;
      
      logger.info('Vision OCR Batch', {
        userId: req.user?.id,
        fileCount: req.files.length,
        totalSize: req.files.reduce((sum, f) => sum + f.size, 0)
      });

      const results = [];
      
      // Traiter en parallèle avec limite de concurrence
      const BATCH_SIZE = 3;
      for (let i = 0; i < req.files.length; i += BATCH_SIZE) {
        const batch = req.files.slice(i, i + BATCH_SIZE);
        
        const batchResults = await Promise.all(
          batch.map(file => 
            OCRVisionService.processDocument({
              buffer: file.buffer,
              filename: file.originalname,
              documentType
            }).catch(error => ({
              success: false,
              filename: file.originalname,
              error: error.message
            }))
          )
        );
        
        results.push(...batchResults);
      }

      const successCount = results.filter(r => r.success).length;
      
      res.json({
        success: true,
        totalFiles: req.files.length,
        successCount,
        failureCount: req.files.length - successCount,
        results
      });

    } catch (error) {
      logger.error('Erreur Vision OCR Batch:', error);
      next(error);
    }
  }
);

/**
 * GET /api/ocr/vision/status
 * Statut du service Vision
 */
router.get('/status', async (req, res) => {
  try {
    const status = OCRVisionService.getStatus();
    const stats = await OCRVisionService.getUsageStats();
    
    res.json({
      success: true,
      service: 'ocr-vision',
      status,
      stats,
      features: {
        autoDetection: true,
        multiCurrency: true,
        notionIntegration: true,
        batchProcessing: true,
        supportedFormats: ['JPEG', 'PNG', 'GIF', 'WebP'],
        maxFileSize: '20MB',
        averageProcessingTime: '10-15s'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur récupération statut'
    });
  }
});

/**
 * POST /api/ocr/vision/test
 * Endpoint de test avec image exemple
 */
router.post('/test', authMiddleware, async (req, res) => {
  try {
    // Créer une image de test
    const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    const testBuffer = Buffer.from(testImageBase64, 'base64');
    
    const result = await OCRVisionService.processDocument({
      buffer: testBuffer,
      filename: 'test-document.png',
      documentType: 'auto'
    });
    
    res.json({
      success: true,
      message: 'Test Vision OCR exécuté',
      result
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur test Vision OCR',
      error: error.message
    });
  }
});

/**
 * GET /api/ocr/vision/schemas
 * Récupérer les schémas Notion disponibles
 */
router.get('/schemas', (req, res) => {
  const schemas = {
    FACTURE_FOURNISSEUR: {
      label: 'Facture Fournisseur',
      icon: '🧾',
      databaseId: '237adb95-3c6f-80de-9f92-c795334e5561',
      requiredFields: ['Numéro Facture', 'Fournisseur', 'Date Facture', 'Montant TTC']
    },
    FACTURE_CLIENT: {
      label: 'Facture Client',
      icon: '💰',
      databaseId: '226adb95-3c6f-8011-a9bb-ca31f7da8e6a',
      requiredFields: ['Numéro', 'Client', 'Date Émission', 'Montant TTC']
    },
    CONTRAT: {
      label: 'Contrat',
      icon: '📋',
      databaseId: '22eadb95-3c6f-8099-81fe-d4890db02d9c',
      requiredFields: ['Nom Contrat', 'Partie Contractante', 'Date Début']
    },
    NOTE_FRAIS: {
      label: 'Note de Frais',
      icon: '🎫',
      databaseId: '237adb95-3c6f-804b-a530-e44d07ac9f7b',
      requiredFields: ['Description', 'Montant', 'Date']
    }
  };
  
  res.json({
    success: true,
    schemas
  });
});

module.exports = router;