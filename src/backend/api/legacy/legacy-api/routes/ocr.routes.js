/**
 * OCR Routes
 * Endpoints pour l'upload et le traitement OCR
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const logger = require('../utils/logger');
const ocrService = require('../services/ocr.service');
const DirectusAdapter = require('../adapters/directus-adapter');
const notionService = new DirectusAdapter();

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, process.env.UPLOAD_DIR || './uploads');
    },
    filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'pdf,png,jpg,jpeg,heic').split(',');
        const ext = path.extname(file.originalname).toLowerCase().substring(1);
        
        if (allowedTypes.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error(`File type .${ext} not allowed`));
        }
    }
});

/**
 * POST /api/ocr/upload
 * Upload and process a document
 */
router.post('/upload', upload.single('document'), async (req, res) => {
    try {
        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({
                error: 'No file uploaded',
                code: 'NO_FILE'
            });
        }

        logger.info('Document uploaded for OCR processing', {
            filename: req.file.filename,
            originalName: req.file.originalname,
            size: req.file.size
        });

        // Process document with OCR
        const ocrResult = await ocrService.processDocument(req.file);

        if (!ocrResult.success) {
            return res.status(422).json({
                error: 'OCR processing failed',
                message: ocrResult.error,
                code: 'OCR_FAILED'
            });
        }

        // Return OCR results
        res.json({
            success: true,
            fileId: req.file.filename,
            data: ocrResult.data,
            processingTime: ocrResult.processingTime
        });

    } catch (error) {
        logger.error('Error in OCR upload:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
});

/**
 * POST /api/ocr/analyze
 * Analyze document text (for paste or text input)
 */
router.post('/analyze', [
    body('text').notEmpty().withMessage('Text is required'),
    body('documentType').optional().isIn(['facture_client', 'facture_fournisseur', 'devis', 'note_frais', 'ticket_cb'])
], async (req, res) => {
    try {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { text, documentType } = req.body;

        // Process text with OCR service
        const result = await ocrService.analyzeText(text, documentType);

        res.json({
            success: true,
            data: result.data,
            processingTime: result.processingTime
        });

    } catch (error) {
        logger.error('Error in text analysis:', error);
        res.status(500).json({
            error: 'Analysis failed',
            message: error.message
        });
    }
});

/**
 * POST /api/ocr/save-to-notion
 * Save processed document to Notion
 */
router.post('/save-to-notion', [
    body('fileId').optional(),
    body('documentType').notEmpty().withMessage('Document type is required'),
    body('extractedData').notEmpty().withMessage('Extracted data is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { fileId, documentType, extractedData } = req.body;

        // Build file URL if fileId provided
        let fileUrl = null;
        if (fileId) {
            const protocol = req.protocol;
            const host = req.get('host');
            fileUrl = `${protocol}://${host}/uploads/${fileId}`;
        }

        // Check for duplicate
        if (extractedData.numero) {
            const existing = await notionService.getItems(documentType, extractedData.numero);
            if (existing) {
                return res.status(409).json({
                    error: 'Document already exists',
                    code: 'DUPLICATE_DOCUMENT',
                    notionPageId: existing.id,
                    url: existing.url
                });
            }
        }

        // Mapper le type de document vers le type du service
        const typeMapping = {
            'facture_fournisseur': 'facture_fournisseur',
            'facture_client': 'facture_client',
            'contrat': 'contrat',
            'note_frais': 'note_frais',
            'ticket_cb': 'ticket_cb',
            // Mapping depuis le workflow frontend
            'FACTURE_FOURNISSEUR': 'facture_fournisseur',
            'FACTURE_CLIENT': 'facture_client',
            'CONTRAT': 'contrat',
            'NOTE_FRAIS': 'note_frais'
        };
        
        const mappedType = typeMapping[documentType] || documentType.toLowerCase();
        
        // Save to Notion
        const notionResult = await notionService.createDocument(
            mappedType,
            extractedData,
            fileUrl
        );

        logger.info('Document saved to Notion', {
            documentType,
            notionPageId: notionResult.notionPageId
        });

        res.json({
            success: true,
            notionPageId: notionResult.notionPageId,
            notionUrl: notionResult.url
        });

    } catch (error) {
        logger.error('Error saving to Notion:', error);
        res.status(500).json({
            error: 'Failed to save to Notion',
            message: error.message
        });
    }
});

/**
 * POST /api/ocr/batch
 * Process multiple documents
 */
router.post('/batch', upload.array('documents', 10), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                error: 'No files uploaded',
                code: 'NO_FILES'
            });
        }

        logger.info(`Batch processing ${req.files.length} documents`);

        // Process all documents in parallel
        const processingPromises = req.files.map(file => 
            ocrService.processDocument(file).catch(error => ({
                success: false,
                filename: file.originalname,
                error: error.message
            }))
        );

        const results = await Promise.all(processingPromises);

        // Separate successful and failed
        const successful = results.filter(r => r.success);
        const failed = results.filter(r => !r.success);

        res.json({
            success: true,
            total: req.files.length,
            processed: successful.length,
            failed: failed.length,
            results: results
        });

    } catch (error) {
        logger.error('Error in batch processing:', error);
        res.status(500).json({
            error: 'Batch processing failed',
            message: error.message
        });
    }
});

/**
 * GET /api/ocr/status/:fileId
 * Get processing status for a file
 */
router.get('/status/:fileId', async (req, res) => {
    try {
        const { fileId } = req.params;
        
        // Check if file exists and get status
        const status = await ocrService.getProcessingStatus(fileId);
        
        if (!status) {
            return res.status(404).json({
                error: 'File not found',
                code: 'FILE_NOT_FOUND'
            });
        }

        res.json(status);

    } catch (error) {
        logger.error('Error getting status:', error);
        res.status(500).json({
            error: 'Failed to get status',
            message: error.message
        });
    }
});

/**
 * DELETE /api/ocr/file/:fileId
 * Delete an uploaded file
 */
router.delete('/file/:fileId', async (req, res) => {
    try {
        const { fileId } = req.params;
        
        await ocrService.deleteFile(fileId);
        
        res.json({
            success: true,
            message: 'File deleted successfully'
        });

    } catch (error) {
        logger.error('Error deleting file:', error);
        res.status(500).json({
            error: 'Failed to delete file',
            message: error.message
        });
    }
});

module.exports = router;