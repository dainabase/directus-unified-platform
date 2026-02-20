/**
 * I-05 + I-06 — Workflow validation factures fournisseurs + Detection ecarts
 * POST /api/supplier-invoices/:id/approve — Approuver
 * POST /api/supplier-invoices/:id/reject — Rejeter
 * GET  /api/supplier-invoices/pending — File d'attente CEO
 * GET  /api/supplier-invoices/pending/count — Badge notification
 * GET  /api/supplier-invoices/:id/deviation — Analyse ecart devis/facture
 * GET  /api/supplier-invoices/health — Health check
 */

import express from 'express';
import { directusGet, directusPatch, addDays, logAutomation } from '../../lib/financeUtils.js';

const router = express.Router();

// ── I-06 : Deviation analysis ──

function analyzeDeviation(invoiceAmount, quoteAmount, tolerance = 5) {
  if (!quoteAmount || quoteAmount === 0) return { status: 'no_quote', percentage: null };

  const deviation = ((invoiceAmount - quoteAmount) / quoteAmount) * 100;
  const absDeviation = Math.abs(deviation);

  return {
    deviation_percentage: Math.round(deviation * 100) / 100,
    abs_percentage: Math.round(absDeviation * 100) / 100,
    status: absDeviation > tolerance ? 'blocked' :
            absDeviation > tolerance * 0.6 ? 'warning' : 'ok',
    quote_amount: quoteAmount,
    invoice_amount: invoiceAmount,
    difference: Math.round((invoiceAmount - quoteAmount) * 100) / 100
  };
}

// GET /api/supplier-invoices/pending
router.get('/pending', async (req, res) => {
  try {
    const invoices = await directusGet('/items/supplier_invoices', {
      'filter[status][_eq]': 'pending',
      sort: '-date_created',
      limit: req.query.limit || 100
    });

    // Enrichir avec analyse deviation
    const enriched = (invoices || []).map(inv => ({
      ...inv,
      deviation: analyzeDeviation(
        parseFloat(inv.total_ttc || inv.amount || 0),
        parseFloat(inv.quote_amount || 0)
      )
    }));

    res.json({ success: true, invoices: enriched, total: enriched.length });
  } catch (error) {
    console.error('[I-05] Erreur liste pending:', error.message);
    res.status(500).json({ error: 'Erreur lecture file attente', details: error.message });
  }
});

// GET /api/supplier-invoices/pending/count
router.get('/pending/count', async (req, res) => {
  try {
    const invoices = await directusGet('/items/supplier_invoices', {
      'filter[status][_eq]': 'pending',
      'aggregate[count]': 'id'
    });
    const count = parseInt(invoices?.[0]?.count?.id || 0);
    res.json({ success: true, count });
  } catch (error) {
    console.error('[I-05] Erreur count pending:', error.message);
    res.status(500).json({ error: 'Erreur comptage', details: error.message });
  }
});

// GET /api/supplier-invoices/:id/deviation
router.get('/:id/deviation', async (req, res) => {
  try {
    const invoice = await directusGet(`/items/supplier_invoices/${req.params.id}`);
    if (!invoice) {
      return res.status(404).json({ error: 'Facture non trouvee' });
    }

    const deviation = analyzeDeviation(
      parseFloat(invoice.total_ttc || invoice.amount || 0),
      parseFloat(invoice.quote_amount || 0)
    );

    res.json({ success: true, invoice_id: req.params.id, deviation });
  } catch (error) {
    console.error('[I-06] Erreur analyse deviation:', error.message);
    res.status(500).json({ error: 'Erreur analyse', details: error.message });
  }
});

// POST /api/supplier-invoices/:id/approve
router.post('/:id/approve', async (req, res) => {
  try {
    const { approved_by, payment_date, force } = req.body;
    const invoice = await directusGet(`/items/supplier_invoices/${req.params.id}`);
    if (!invoice) {
      return res.status(404).json({ error: 'Facture non trouvee' });
    }

    // Verifier deviation avant approbation
    const deviation = analyzeDeviation(
      parseFloat(invoice.total_ttc || invoice.amount || 0),
      parseFloat(invoice.quote_amount || 0)
    );

    if (deviation.status === 'blocked' && !force) {
      return res.status(403).json({
        error: 'Ecart > 5% — approbation bloquee',
        deviation,
        hint: 'Ajouter force:true pour forcer'
      });
    }

    const scheduledDate = payment_date || addDays(new Date(), 30);

    await directusPatch(`/items/supplier_invoices/${req.params.id}`, {
      status: 'approved',
      approved_by: approved_by || 'CEO',
      approved_at: new Date().toISOString(),
      payment_scheduled_date: scheduledDate,
      deviation_percentage: deviation.deviation_percentage
    });

    await logAutomation({
      rule_name: 'I-05-supplier-approved',
      entity_type: 'supplier_invoices',
      entity_id: String(req.params.id),
      status: 'success',
      trigger_data: { invoice_number: invoice.invoice_number, payment_date: scheduledDate, deviation: deviation.deviation_percentage }
    });

    res.json({ success: true, approved: true, payment_scheduled_date: scheduledDate, deviation });
  } catch (error) {
    console.error('[I-05] Erreur approbation:', error.message);
    res.status(500).json({ error: 'Erreur approbation', details: error.message });
  }
});

// POST /api/supplier-invoices/:id/reject
router.post('/:id/reject', async (req, res) => {
  try {
    const { rejected_by, reason } = req.body;

    if (!reason) {
      return res.status(400).json({ error: 'Raison de rejet obligatoire' });
    }

    const invoice = await directusGet(`/items/supplier_invoices/${req.params.id}`);
    if (!invoice) {
      return res.status(404).json({ error: 'Facture non trouvee' });
    }

    await directusPatch(`/items/supplier_invoices/${req.params.id}`, {
      status: 'rejected',
      approved_by: rejected_by || 'CEO',
      rejection_reason: reason
    });

    await logAutomation({
      rule_name: 'I-05-supplier-rejected',
      entity_type: 'supplier_invoices',
      entity_id: String(req.params.id),
      status: 'success',
      trigger_data: { invoice_number: invoice.invoice_number, reason }
    });

    res.json({ success: true, rejected: true, reason });
  } catch (error) {
    console.error('[I-05] Erreur rejet:', error.message);
    res.status(500).json({ error: 'Erreur rejet', details: error.message });
  }
});

// Health check
router.get('/health', (req, res) => {
  res.json({ success: true, service: 'supplier-invoices-approval', stories: ['I-05', 'I-06'], timestamp: new Date().toISOString() });
});

export default router;
