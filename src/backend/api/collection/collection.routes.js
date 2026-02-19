/**
 * Routes API Recouvrement
 */

import express from 'express';
import { collectionService } from '../../services/collection/collection.service.js';
import { lpIntegrationService } from '../../services/collection/lp-integration.service.js';
import { interestCalculator } from '../../services/collection/interest-calculator.js';

const router = express.Router();

import { authMiddleware, companyAccess as companyAccessMiddleware } from '../../middleware/auth.middleware.js';

router.use(authMiddleware);

// ==================== ROUTES RECOUVREMENT ====================

/**
 * POST /api/collection/initialize/:invoiceId
 * Initialiser le suivi de recouvrement pour une facture
 */
router.post('/initialize/:invoiceId', companyAccessMiddleware, async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const tracking = await collectionService.initializeCollection(invoiceId);
    res.status(201).json(tracking);
  } catch (error) {
    console.error('Erreur initialisation recouvrement:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/collection/process
 * Traiter le workflow de recouvrement (cron job)
 */
router.post('/process', async (req, res) => {
  try {
    const { owner_company } = req.body;
    const results = await collectionService.processCollectionWorkflow(owner_company);
    res.json(results);
  } catch (error) {
    console.error('Erreur traitement recouvrement:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/collection/dashboard/:company
 * Obtenir le tableau de bord de recouvrement
 */
router.get('/dashboard/:company', companyAccessMiddleware, async (req, res) => {
  try {
    const { company } = req.params;
    const dashboard = await collectionService.getCollectionDashboard(company);
    res.json(dashboard);
  } catch (error) {
    console.error('Erreur dashboard recouvrement:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/collection/:trackingId/payment
 * Enregistrer un paiement
 */
router.post('/:trackingId/payment', companyAccessMiddleware, async (req, res) => {
  try {
    const { trackingId } = req.params;
    const result = await collectionService.recordPayment(trackingId, req.body);
    res.json(result);
  } catch (error) {
    console.error('Erreur enregistrement paiement:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/collection/:trackingId/suspend
 * Suspendre le recouvrement
 */
router.post('/:trackingId/suspend', companyAccessMiddleware, async (req, res) => {
  try {
    const { trackingId } = req.params;
    const { reason } = req.body;
    const result = await collectionService.suspendCollection(trackingId, reason);
    res.json(result);
  } catch (error) {
    console.error('Erreur suspension:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/collection/:trackingId/resume
 * Reprendre le recouvrement
 */
router.post('/:trackingId/resume', companyAccessMiddleware, async (req, res) => {
  try {
    const { trackingId } = req.params;
    const result = await collectionService.resumeCollection(trackingId);
    res.json(result);
  } catch (error) {
    console.error('Erreur reprise:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/collection/:trackingId/write-off
 * Passer en perte
 */
router.post('/:trackingId/write-off', companyAccessMiddleware, async (req, res) => {
  try {
    const { trackingId } = req.params;
    const { reason } = req.body;
    const result = await collectionService.writeOffDebt(trackingId, reason);
    res.json(result);
  } catch (error) {
    console.error('Erreur passage en perte:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/collection/:trackingId/history
 * Historique d'un recouvrement
 */
router.get('/:trackingId/history', companyAccessMiddleware, async (req, res) => {
  try {
    const { trackingId } = req.params;
    const history = await collectionService.getCollectionHistory(trackingId);
    res.json(history);
  } catch (error) {
    console.error('Erreur historique:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== ROUTES CALCUL INTÉRÊTS ====================

/**
 * POST /api/collection/calculate-interest
 * Calculer les intérêts moratoires
 */
router.post('/calculate-interest', async (req, res) => {
  try {
    const { principal, rate, days, start_date, end_date } = req.body;

    let result;
    if (start_date && end_date) {
      result = interestCalculator.calculateBetweenDates(principal, rate, start_date, end_date);
    } else {
      result = {
        principal,
        rate: rate || 5,
        days,
        interest: interestCalculator.calculate(principal, rate, days),
        total: principal + interestCalculator.calculate(principal, rate, days)
      };
    }

    res.json(result);
  } catch (error) {
    console.error('Erreur calcul intérêts:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/collection/rate-check/:rate
 * Vérifier si un taux d'intérêt est acceptable
 */
router.get('/rate-check/:rate', async (req, res) => {
  try {
    const rate = parseFloat(req.params.rate);
    const result = interestCalculator.isRateAcceptable(rate);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ==================== ROUTES LP (POURSUITES) ====================

/**
 * POST /api/collection/lp/initiate/:trackingId
 * Initier une poursuite LP
 */
router.post('/lp/initiate/:trackingId', companyAccessMiddleware, async (req, res) => {
  try {
    const { trackingId } = req.params;
    const tracking = await collectionService.directus.items('collection_tracking').readOne(trackingId);
    
    const lpCase = await lpIntegrationService.initiateRequisition(tracking);
    res.status(201).json(lpCase);
  } catch (error) {
    console.error('Erreur initiation LP:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/collection/lp/webhook
 * Webhook e-LP
 */
router.post('/lp/webhook', async (req, res) => {
  try {
    const result = await lpIntegrationService.handleELPWebhook(req.body);
    res.json(result);
  } catch (error) {
    console.error('Erreur webhook LP:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/collection/lp/:caseId
 * Statut d'un cas LP
 */
router.get('/lp/:caseId', companyAccessMiddleware, async (req, res) => {
  try {
    const { caseId } = req.params;
    const status = await lpIntegrationService.getLPCaseStatus(caseId);
    res.json(status);
  } catch (error) {
    console.error('Erreur statut LP:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/collection/lp/:caseId/continue
 * Demander la continuation de poursuite
 */
router.post('/lp/:caseId/continue', companyAccessMiddleware, async (req, res) => {
  try {
    const { caseId } = req.params;
    const result = await lpIntegrationService.requestContinuation(caseId);
    res.json(result);
  } catch (error) {
    console.error('Erreur continuation LP:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/collection/lp/stats/:company
 * Statistiques LP pour une entreprise
 */
router.get('/lp/stats/:company', companyAccessMiddleware, async (req, res) => {
  try {
    const { company } = req.params;
    const stats = await lpIntegrationService.getLPStatistics(company);
    res.json(stats);
  } catch (error) {
    console.error('Erreur stats LP:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/collection/lp/fees/:amount
 * Calculer les frais LP pour un montant
 */
router.get('/lp/fees/:amount', async (req, res) => {
  try {
    const amount = parseFloat(req.params.amount);
    const fees = lpIntegrationService.calculateLPFees(amount);
    res.json({ claim_amount: amount, lp_fees: fees, total: amount + fees });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ==================== HEALTH CHECK ====================

/**
 * GET /api/collection/health
 * Health check du module recouvrement
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    service: 'collection',
    modules: ['collection', 'interest-calculator', 'lp-integration'],
    timestamp: new Date().toISOString()
  });
});

export default router;