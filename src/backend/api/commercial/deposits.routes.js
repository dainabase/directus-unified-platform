/**
 * Deposits API Routes
 *
 * Endpoints pour la gestion des acomptes
 *
 * @date 15 Décembre 2025
 */

import express from 'express';
import * as depositService from '../../services/commercial/deposit.service.js';
import * as workflowService from '../../services/commercial/workflow.service.js';

const router = express.Router();

/**
 * GET /api/commercial/deposits/pending
 * Liste des acomptes en attente
 */
router.get('/pending', async (req, res) => {
  try {
    const { owner_company_id, days_old } = req.query;

    const deposits = await depositService.getPendingDeposits(
      owner_company_id,
      days_old ? parseInt(days_old) : null
    );

    res.json({
      success: true,
      deposits,
      count: deposits.length
    });
  } catch (error) {
    console.error('GET /deposits/pending error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/commercial/deposits/overdue
 * Liste des acomptes en retard
 */
router.get('/overdue', async (req, res) => {
  try {
    const { owner_company_id } = req.query;

    const deposits = await depositService.getOverdueDeposits(owner_company_id);

    res.json({
      success: true,
      deposits,
      count: deposits.length
    });
  } catch (error) {
    console.error('GET /deposits/overdue error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/commercial/deposits/stats
 * Statistiques des acomptes
 */
router.get('/stats', async (req, res) => {
  try {
    const { owner_company_id, date_from, date_to } = req.query;

    const stats = await depositService.getDepositStats(
      owner_company_id,
      date_from,
      date_to
    );

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('GET /deposits/stats error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/commercial/deposits/config/:owner_company_id
 * Configuration des acomptes pour une entreprise
 */
router.get('/config/:owner_company_id', async (req, res) => {
  try {
    const { project_type } = req.query;

    const config = await depositService.getDepositConfig(
      req.params.owner_company_id,
      project_type || 'default'
    );

    res.json({
      success: true,
      config
    });
  } catch (error) {
    console.error('GET /deposits/config error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/commercial/deposits/calculate/:quote_id
 * Calculer le montant d'acompte pour un devis
 */
router.post('/calculate/:quote_id', async (req, res) => {
  try {
    const deposit = await depositService.calculateDeposit(req.params.quote_id);

    res.json({
      success: true,
      deposit
    });
  } catch (error) {
    console.error('POST /deposits/calculate error:', error.message);
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/commercial/deposits/invoice/:quote_id
 * Créer une facture d'acompte
 */
router.post('/invoice/:quote_id', async (req, res) => {
  try {
    const result = await depositService.createDepositInvoice(req.params.quote_id);

    res.status(result.isNew ? 201 : 200).json(result);
  } catch (error) {
    console.error('POST /deposits/invoice error:', error.message);
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/commercial/deposits/paid/:quote_id
 * Marquer un acompte comme payé
 */
router.post('/paid/:quote_id', async (req, res) => {
  try {
    const {
      payment_date,
      payment_method,
      payment_reference,
      bank_transaction_id,
      auto_create_project = true
    } = req.body;

    let result;

    if (auto_create_project) {
      // Full workflow: mark paid + create project
      result = await workflowService.processDepositPayment(req.params.quote_id, {
        payment_date,
        payment_method,
        payment_reference,
        bank_transaction_id
      });
    } else {
      // Just mark as paid
      result = await depositService.markDepositPaid(req.params.quote_id, {
        payment_date,
        payment_method,
        payment_reference,
        bank_transaction_id
      });
    }

    res.json(result);
  } catch (error) {
    console.error('POST /deposits/paid error:', error.message);
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * PATCH /api/commercial/deposits/config/:config_id
 * Mettre à jour une configuration d'acompte
 */
router.patch('/config/:config_id', async (req, res) => {
  try {
    const result = await depositService.updateDepositConfig(
      req.params.config_id,
      req.body
    );

    res.json(result);
  } catch (error) {
    console.error('PATCH /deposits/config error:', error.message);
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
