/**
 * Signatures API Routes
 *
 * Endpoints pour la gestion des signatures électroniques
 *
 * @date 15 Décembre 2025
 */

import express from 'express';
import * as signatureService from '../../services/commercial/signature.service.js';
import * as workflowService from '../../services/commercial/workflow.service.js';

const router = express.Router();

/**
 * POST /api/commercial/signatures/request/:quote_id
 * Créer une demande de signature DocuSeal
 */
router.post('/request/:quote_id', async (req, res) => {
  try {
    const {
      signature_type = 'SES',
      send_email = true,
      expiry_days = 7
    } = req.body;

    const result = await signatureService.createSignatureRequest(
      req.params.quote_id,
      { signature_type, send_email, expiry_days }
    );

    res.status(201).json(result);
  } catch (error) {
    console.error('POST /signatures/request error:', error.message);
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/commercial/signatures/initiate/:quote_id
 * Initier le processus complet (CGV + Signature)
 */
router.post('/initiate/:quote_id', async (req, res) => {
  try {
    const {
      accept_cgv = true,
      ip_address,
      user_agent
    } = req.body;

    // Get IP from request if not provided
    const clientIp = ip_address || req.ip || req.connection.remoteAddress;
    const clientUa = user_agent || req.get('User-Agent');

    const result = await workflowService.initiateSigningProcess(
      req.params.quote_id,
      {
        accept_cgv,
        ip_address: clientIp,
        user_agent: clientUa
      }
    );

    res.json(result);
  } catch (error) {
    console.error('POST /signatures/initiate error:', error.message);
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/commercial/signatures/manual/:quote_id
 * Signature manuelle (sans DocuSeal)
 */
router.post('/manual/:quote_id', async (req, res) => {
  try {
    const {
      signer_name,
      signer_email,
      ip_address,
      user_agent,
      signature_image_base64
    } = req.body;

    if (!signer_name || !signer_email) {
      return res.status(400).json({
        success: false,
        error: 'signer_name and signer_email are required'
      });
    }

    // Get IP from request if not provided
    const clientIp = ip_address || req.ip || req.connection.remoteAddress;
    const clientUa = user_agent || req.get('User-Agent');

    const result = await signatureService.signQuoteManually(
      req.params.quote_id,
      {
        signer_name,
        signer_email,
        ip_address: clientIp,
        user_agent: clientUa,
        signature_image_base64
      }
    );

    res.json(result);
  } catch (error) {
    console.error('POST /signatures/manual error:', error.message);
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/commercial/signatures/logs/:quote_id
 * Logs de signature d'un devis
 */
router.get('/logs/:quote_id', async (req, res) => {
  try {
    const logs = await signatureService.getSignatureLogs(req.params.quote_id);

    res.json({
      success: true,
      logs,
      count: logs.length
    });
  } catch (error) {
    console.error('GET /signatures/logs error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/commercial/signatures/verify/:signature_log_id
 * Vérifier l'intégrité d'une signature
 */
router.get('/verify/:signature_log_id', async (req, res) => {
  try {
    const result = await signatureService.verifySignature(
      req.params.signature_log_id
    );

    res.json({
      success: true,
      verification: result
    });
  } catch (error) {
    console.error('GET /signatures/verify error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/commercial/signatures/webhook/docuseal
 * Webhook DocuSeal
 */
router.post('/webhook/docuseal', async (req, res) => {
  try {
    // TODO: Verify webhook signature from DocuSeal
    const result = await signatureService.processWebhook(req.body);

    res.json(result);
  } catch (error) {
    console.error('POST /signatures/webhook/docuseal error:', error.message);
    // Return 200 to acknowledge receipt even on error
    res.status(200).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/commercial/signatures/types
 * Liste des types de signature disponibles
 */
router.get('/types', (req, res) => {
  res.json({
    success: true,
    types: signatureService.SIGNATURE_TYPES
  });
});

export default router;
