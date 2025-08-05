const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs').promises;
const authMiddleware = require('../middlewares/auth.middleware');
const OCRService = require('../services/ocr.service');
const { logger } = require('../config/logger');

const router = express.Router();

// Configuration upload
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../temp/uploads');
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 50 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/tiff'
    ];
    cb(null, allowedTypes.includes(file.mimetype));
  }
});

// POST /api/ocr/process
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
      const { documentType = 'invoice', enhance = true } = req.body;
      
      logger.info('Traitement OCR', {
        userId: req.user.id,
        filename: req.file.originalname,
        size: req.file.size
      });

      const fileBuffer = await fs.readFile(req.file.path);
      
      // Nettoyer le fichier temporaire
      await fs.unlink(req.file.path).catch(err => 
        logger.warn('Erreur suppression temp:', err)
      );

      const result = await OCRService.processDocument({
        buffer: fileBuffer,
        filename: req.file.originalname,
        documentType,
        options: { enhance }
      });

      res.json(result);

    } catch (error) {
      logger.error('Erreur OCR:', error);
      next(error);
    }
  }
);

// GET /api/ocr/supported-languages
router.get('/supported-languages', (req, res) => {
  const languages = process.env.TESSERACT_LANG.split('+');
  
  const languageMap = {
    fra: { code: 'fra', name: 'Français' },
    eng: { code: 'eng', name: 'English' },
    deu: { code: 'deu', name: 'Deutsch' },
    ita: { code: 'ita', name: 'Italiano' }
  };

  const supported = languages
    .filter(lang => languageMap[lang])
    .map(lang => languageMap[lang]);

  res.json({
    success: true,
    languages: supported
  });
});

// GET /api/ocr/document-types
router.get('/document-types', (req, res) => {
  res.json({
    success: true,
    types: [
      {
        value: 'invoice',
        label: 'Facture',
        extractedFields: ['supplier', 'invoice', 'amounts']
      },
      {
        value: 'receipt',
        label: 'Ticket de caisse',
        extractedFields: ['merchant', 'amounts']
      },
      {
        value: 'generic',
        label: 'Document générique',
        extractedFields: ['text']
      }
    ]
  });
});

module.exports = router;