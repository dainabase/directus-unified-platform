/**
 * Quotes API Routes
 *
 * Endpoints pour la gestion des devis
 *
 * @date 15 Décembre 2025
 */

import express from 'express';
import * as quoteService from '../../services/commercial/quote.service.js';
import * as workflowService from '../../services/commercial/workflow.service.js';

const router = express.Router();

/**
 * GET /api/commercial/quotes
 * Liste des devis avec filtres
 */
router.get('/', async (req, res) => {
  try {
    const {
      owner_company_id,
      status,
      contact_id,
      limit = 50,
      offset = 0
    } = req.query;

    const result = await quoteService.listQuotes({
      owner_company_id,
      status,
      contact_id,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('GET /quotes error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/commercial/quotes/stats
 * Statistiques des devis
 */
router.get('/stats', async (req, res) => {
  try {
    const { owner_company_id, date_from, date_to } = req.query;

    const stats = await quoteService.getQuoteStats(
      owner_company_id,
      date_from,
      date_to
    );

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('GET /quotes/stats error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/commercial/quotes/:id
 * Récupérer un devis par ID
 */
router.get('/:id', async (req, res) => {
  try {
    const quote = await quoteService.getQuote(req.params.id);

    if (!quote) {
      return res.status(404).json({
        success: false,
        error: 'Quote not found'
      });
    }

    res.json({
      success: true,
      quote
    });
  } catch (error) {
    console.error('GET /quotes/:id error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/commercial/quotes/:id/workflow
 * Statut du workflow d'un devis
 */
router.get('/:id/workflow', async (req, res) => {
  try {
    const status = await workflowService.getWorkflowStatus(req.params.id);

    res.json({
      success: true,
      workflow: status
    });
  } catch (error) {
    console.error('GET /quotes/:id/workflow error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/commercial/quotes
 * Créer un nouveau devis
 */
router.post('/', async (req, res) => {
  try {
    const result = await quoteService.createQuote(req.body);

    res.status(201).json(result);
  } catch (error) {
    console.error('POST /quotes error:', error.message);
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/commercial/quotes/from-lead
 * Convertir un lead en devis
 */
router.post('/from-lead', async (req, res) => {
  try {
    const { lead_id, ...quoteData } = req.body;

    if (!lead_id) {
      return res.status(400).json({
        success: false,
        error: 'lead_id is required'
      });
    }

    const result = await workflowService.convertLeadToQuote(lead_id, quoteData);

    res.status(201).json(result);
  } catch (error) {
    console.error('POST /quotes/from-lead error:', error.message);
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/commercial/quotes/:id/send
 * Envoyer un devis au client
 */
router.post('/:id/send', async (req, res) => {
  try {
    const {
      send_email = true,
      create_portal_account = true,
      message
    } = req.body;

    const result = await workflowService.sendQuoteToClient(req.params.id, {
      send_email,
      create_portal_account,
      message
    });

    res.json(result);
  } catch (error) {
    console.error('POST /quotes/:id/send error:', error.message);
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * PATCH /api/commercial/quotes/:id/status
 * Mettre à jour le statut d'un devis
 */
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, ...additionalData } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'status is required'
      });
    }

    const result = await quoteService.updateQuoteStatus(
      req.params.id,
      status,
      additionalData
    );

    res.json(result);
  } catch (error) {
    console.error('PATCH /quotes/:id/status error:', error.message);
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/commercial/quotes/:id/cgv-accept
 * Enregistrer l'acceptation des CGV
 */
router.post('/:id/cgv-accept', async (req, res) => {
  try {
    const {
      contact_id,
      company_id,
      cgv_version_id,
      ip_address,
      user_agent,
      acceptance_method
    } = req.body;

    // Get IP from request if not provided
    const clientIp = ip_address || req.ip || req.connection.remoteAddress;
    const clientUa = user_agent || req.get('User-Agent');

    const result = await quoteService.recordCGVAcceptance(req.params.id, {
      contact_id,
      company_id,
      cgv_version_id,
      ip_address: clientIp,
      user_agent: clientUa,
      acceptance_method
    });

    res.json(result);
  } catch (error) {
    console.error('POST /quotes/:id/cgv-accept error:', error.message);
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/commercial/quotes/:id/sign
 * Marquer un devis comme signé
 */
router.post('/:id/sign', async (req, res) => {
  try {
    const {
      signer_name,
      signer_email,
      ip_address,
      user_agent,
      signature_image_base64
    } = req.body;

    // Get IP from request if not provided
    const clientIp = ip_address || req.ip || req.connection.remoteAddress;
    const clientUa = user_agent || req.get('User-Agent');

    const result = await workflowService.completeSigningProcess(req.params.id, {
      signer_name,
      signer_email,
      ip_address: clientIp,
      user_agent: clientUa,
      signature_image_base64
    });

    res.json(result);
  } catch (error) {
    console.error('POST /quotes/:id/sign error:', error.message);
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
