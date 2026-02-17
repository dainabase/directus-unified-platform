/**
 * Routes API Module Légal
 * CGV, Signatures, Documents légaux
 */

import express from 'express';
import { cgvService } from '../../services/legal/cgv.service.js';
import { signatureService } from '../../services/legal/signature.service.js';

const router = express.Router();

// Middleware d'authentification basique (à adapter selon votre système)
const authMiddleware = (req, res, next) => {
  // TODO: Implémenter la vérification du token d'authentification
  // if (!req.headers.authorization) {
  //   return res.status(401).json({ error: 'Non authentifié' });
  // }
  next();
};

const companyAccessMiddleware = (req, res, next) => {
  // TODO: Vérifier que l'utilisateur a accès à l'entreprise spécifiée
  next();
};

// Middleware d'authentification sur toutes les routes
router.use(authMiddleware);

// ==================== ROUTES CGV ====================

/**
 * GET /api/legal/cgv/:company/:type
 * Obtenir le CGV actif pour une entreprise et un type
 */
router.get('/cgv/:company/:type', companyAccessMiddleware, async (req, res) => {
  try {
    const { company, type } = req.params;
    const { language = 'fr' } = req.query;

    const cgv = await cgvService.getActiveCGV(company, type, language);
    
    if (!cgv) {
      return res.status(404).json({ error: 'CGV non trouvé' });
    }

    res.json(cgv);
  } catch (error) {
    console.error('Erreur récupération CGV:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/legal/cgv
 * Créer un nouveau document CGV
 */
router.post('/cgv', companyAccessMiddleware, async (req, res) => {
  try {
    const cgv = await cgvService.createCGV(req.body);
    res.status(201).json(cgv);
  } catch (error) {
    console.error('Erreur création CGV:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/legal/cgv/:id/accept
 * Enregistrer l'acceptation d'un CGV par un client
 */
router.post('/cgv/:id/accept', async (req, res) => {
  try {
    const { id } = req.params;
    const acceptance = await cgvService.recordCGVAcceptance({
      cgv_document_id: id,
      ...req.body,
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    });

    res.status(201).json(acceptance);
  } catch (error) {
    console.error('Erreur acceptation CGV:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/legal/cgv/:company/:type/check/:clientId
 * Vérifier si un client a accepté les CGV actuels
 */
router.get('/cgv/:company/:type/check/:clientId', companyAccessMiddleware, async (req, res) => {
  try {
    const { company, type, clientId } = req.params;
    const hasAccepted = await cgvService.hasClientAcceptedCGV(clientId, company, type);
    
    res.json({ has_accepted: hasAccepted });
  } catch (error) {
    console.error('Erreur vérification acceptation:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/legal/cgv/:company/:type/history
 * Historique des versions CGV
 */
router.get('/cgv/:company/:type/history', companyAccessMiddleware, async (req, res) => {
  try {
    const { company, type } = req.params;
    const history = await cgvService.getCGVHistory(company, type);
    
    res.json(history);
  } catch (error) {
    console.error('Erreur historique CGV:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/legal/cgv/generate
 * Générer le contenu CGV avec les données de l'entreprise
 */
router.post('/cgv/generate', companyAccessMiddleware, async (req, res) => {
  try {
    const { owner_company, document_type, custom_data } = req.body;
    const content = await cgvService.generateCGVContent(owner_company, document_type, custom_data);
    
    res.json({ content });
  } catch (error) {
    console.error('Erreur génération CGV:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== ROUTES SIGNATURE ====================

/**
 * POST /api/legal/signature/request
 * Créer une demande de signature
 */
router.post('/signature/request', companyAccessMiddleware, async (req, res) => {
  try {
    const request = await signatureService.createSignatureRequest(req.body);
    res.status(201).json(request);
  } catch (error) {
    console.error('Erreur création demande signature:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/legal/signature/callback
 * Webhook callback du prestataire de signature
 */
router.post('/signature/callback', async (req, res) => {
  try {
    const result = await signatureService.handleSignatureCallback(req.body);
    res.json(result);
  } catch (error) {
    console.error('Erreur callback signature:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/legal/signature/:id/verify
 * Vérifier la validité d'une signature
 */
router.get('/signature/:id/verify', async (req, res) => {
  try {
    const { id } = req.params;
    const verification = await signatureService.verifySignature(id);
    
    res.json(verification);
  } catch (error) {
    console.error('Erreur vérification signature:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/legal/signature/:company
 * Liste des demandes de signature pour une entreprise
 */
router.get('/signature/:company', companyAccessMiddleware, async (req, res) => {
  try {
    const { company } = req.params;
    const { status, limit } = req.query;

    const filters = {};
    if (status) filters.status = { _eq: status };
    if (limit) filters.limit = parseInt(limit);

    const requests = await signatureService.getSignatureRequests(company, filters);
    res.json(requests);
  } catch (error) {
    console.error('Erreur liste signatures:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/legal/signature/:id/cancel
 * Annuler une demande de signature
 */
router.post('/signature/:id/cancel', companyAccessMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await signatureService.cancelSignatureRequest(id);
    
    res.json(result);
  } catch (error) {
    console.error('Erreur annulation signature:', error);
    res.status(400).json({ error: error.message });
  }
});

// ==================== HEALTH CHECK ====================

/**
 * GET /api/legal/health
 * Health check du module légal
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    service: 'legal',
    modules: ['cgv', 'signature'],
    timestamp: new Date().toISOString()
  });
});

export default router;