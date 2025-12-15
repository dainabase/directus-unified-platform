/**
 * CGV API Routes
 *
 * Endpoints pour la gestion des Conditions Générales de Vente
 *
 * @date 15 Décembre 2025
 */

import express from 'express';
import * as cgvService from '../../services/commercial/cgv.service.js';

const router = express.Router();

/**
 * GET /api/commercial/cgv/:owner_company_id
 * Récupérer la CGV active pour une entreprise
 */
router.get('/:owner_company_id', async (req, res) => {
  try {
    const cgv = await cgvService.getActiveCGV(req.params.owner_company_id);

    if (!cgv) {
      return res.status(404).json({
        success: false,
        error: 'No active CGV found for this company'
      });
    }

    res.json({
      success: true,
      cgv
    });
  } catch (error) {
    console.error('GET /cgv/:owner_company_id error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/commercial/cgv/:owner_company_id/versions
 * Liste toutes les versions CGV d'une entreprise
 */
router.get('/:owner_company_id/versions', async (req, res) => {
  try {
    const versions = await cgvService.listCGVVersions(req.params.owner_company_id);

    res.json({
      success: true,
      versions,
      count: versions.length
    });
  } catch (error) {
    console.error('GET /cgv/:owner_company_id/versions error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/commercial/cgv/:owner_company_id/stats
 * Statistiques CGV d'une entreprise
 */
router.get('/:owner_company_id/stats', async (req, res) => {
  try {
    const stats = await cgvService.getCGVStats(req.params.owner_company_id);

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('GET /cgv/:owner_company_id/stats error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/commercial/cgv
 * Créer une nouvelle version CGV
 */
router.post('/', async (req, res) => {
  try {
    const result = await cgvService.createCGVVersion(req.body);

    res.status(201).json(result);
  } catch (error) {
    console.error('POST /cgv error:', error.message);
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/commercial/cgv/:cgv_id/activate
 * Activer une version CGV
 */
router.post('/:cgv_id/activate', async (req, res) => {
  try {
    const result = await cgvService.activateCGVVersion(req.params.cgv_id);

    res.json(result);
  } catch (error) {
    console.error('POST /cgv/:cgv_id/activate error:', error.message);
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/commercial/cgv/accept
 * Enregistrer une acceptation CGV
 */
router.post('/accept', async (req, res) => {
  try {
    const {
      contact_id,
      company_id,
      cgv_version_id,
      quote_id,
      ip_address,
      user_agent,
      acceptance_method
    } = req.body;

    // Get IP from request if not provided
    const clientIp = ip_address || req.ip || req.connection.remoteAddress;
    const clientUa = user_agent || req.get('User-Agent');

    const result = await cgvService.recordAcceptance({
      contact_id,
      company_id,
      cgv_version_id,
      quote_id,
      ip_address: clientIp,
      user_agent: clientUa,
      acceptance_method
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('POST /cgv/accept error:', error.message);
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/commercial/cgv/check/:contact_id/:owner_company_id
 * Vérifier si un contact a accepté les CGV actuelles
 */
router.get('/check/:contact_id/:owner_company_id', async (req, res) => {
  try {
    const result = await cgvService.hasAcceptedCurrentCGV(
      req.params.contact_id,
      req.params.owner_company_id
    );

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('GET /cgv/check error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/commercial/cgv/history/:contact_id
 * Historique des acceptations d'un contact
 */
router.get('/history/:contact_id', async (req, res) => {
  try {
    const { owner_company_id } = req.query;

    const history = await cgvService.getAcceptanceHistory(
      req.params.contact_id,
      owner_company_id
    );

    res.json({
      success: true,
      acceptances: history,
      count: history.length
    });
  } catch (error) {
    console.error('GET /cgv/history error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/commercial/cgv/acceptance/:acceptance_id
 * Invalider une acceptation (admin)
 */
router.delete('/acceptance/:acceptance_id', async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        error: 'reason is required'
      });
    }

    const result = await cgvService.invalidateAcceptance(
      req.params.acceptance_id,
      reason
    );

    res.json(result);
  } catch (error) {
    console.error('DELETE /cgv/acceptance error:', error.message);
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
