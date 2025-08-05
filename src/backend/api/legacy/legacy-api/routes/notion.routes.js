/**
 * Notion Routes
 * Endpoints pour l'interaction directe avec Notion
 */

const express = require('express');
const { body, param, validationResult } = require('express-validator');
const logger = require('../utils/logger');
const DirectusAdapter = require('../adapters/directus-adapter');
const notionService = new DirectusAdapter();

const router = express.Router();

/**
 * GET /api/notion/databases
 * List all configured Notion databases
 */
router.get('/databases', async (req, res) => {
    try {
        const databases = Object.entries(notionService.databases).map(([type, id]) => ({
            type,
            id,
            configured: !!id
        }));

        res.json({
            success: true,
            databases
        });

    } catch (error) {
        logger.error('Error listing databases:', error);
        res.status(500).json({
            error: 'Failed to list databases',
            message: error.message
        });
    }
});

/**
 * POST /api/notion/search
 * Search for documents in Notion
 */
router.post('/search', [
    body('documentType').notEmpty().withMessage('Document type is required'),
    body('query').notEmpty().withMessage('Search query is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { documentType, query } = req.body;
        
        const result = await notionService.getItems(documentType, query);

        res.json({
            success: true,
            found: !!result,
            document: result
        });

    } catch (error) {
        logger.error('Error searching Notion:', error);
        res.status(500).json({
            error: 'Search failed',
            message: error.message
        });
    }
});

/**
 * GET /api/notion/page/:pageId
 * Get a specific Notion page
 */
router.get('/page/:pageId', [
    param('pageId').notEmpty().withMessage('Page ID is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { pageId } = req.params;
        
        // This would be implemented in the notion service
        // For now, return a placeholder
        res.json({
            success: true,
            pageId,
            message: 'Get page endpoint - to be implemented'
        });

    } catch (error) {
        logger.error('Error getting page:', error);
        res.status(500).json({
            error: 'Failed to get page',
            message: error.message
        });
    }
});

/**
 * PUT /api/notion/page/:pageId
 * Update a Notion page
 */
router.put('/page/:pageId', [
    param('pageId').notEmpty().withMessage('Page ID is required'),
    body('properties').notEmpty().withMessage('Properties are required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { pageId } = req.params;
        const { properties } = req.body;
        
        const result = await notionService.updateDocument(pageId, properties);

        res.json({
            success: true,
            ...result
        });

    } catch (error) {
        logger.error('Error updating page:', error);
        res.status(500).json({
            error: 'Failed to update page',
            message: error.message
        });
    }
});

/**
 * POST /api/notion/webhook
 * Webhook endpoint for Notion updates
 */
router.post('/webhook', async (req, res) => {
    try {
        // Log webhook payload
        logger.info('Notion webhook received', {
            type: req.body.type,
            pageId: req.body.page?.id
        });

        // Process webhook based on type
        switch (req.body.type) {
            case 'page_updated':
                // Handle page update
                break;
            case 'page_created':
                // Handle page creation
                break;
            default:
                logger.warn('Unknown webhook type:', req.body.type);
        }

        res.json({ success: true });

    } catch (error) {
        logger.error('Webhook processing error:', error);
        res.status(500).json({
            error: 'Webhook processing failed',
            message: error.message
        });
    }
});

module.exports = router;