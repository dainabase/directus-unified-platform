/**
 * I-04 — Avoirs & remboursements (notes de credit)
 * POST /api/credits — Creer un avoir depuis une facture
 * POST /api/credits/:id/apply — Appliquer avoir sur une facture
 * GET  /api/credits — Liste avoirs
 * GET  /api/credits/health — Health check
 */

import express from 'express';
import { directusGet, directusPost, directusPatch, generateCreditNumber, logAutomation } from '../../lib/financeUtils.js';

const router = express.Router();

// POST /api/credits
router.post('/', async (req, res) => {
  try {
    const { invoice_id, amount, reason, type } = req.body;

    if (!invoice_id || !reason) {
      return res.status(400).json({ error: 'invoice_id et reason requis' });
    }

    const invoice = await directusGet(`/items/client_invoices/${invoice_id}`);
    if (!invoice) {
      return res.status(404).json({ error: 'Facture non trouvee' });
    }

    const creditType = type || 'full';
    const creditAmount = creditType === 'full' ? parseFloat(invoice.amount || 0) : parseFloat(amount || 0);

    if (creditAmount <= 0) {
      return res.status(400).json({ error: 'Montant avoir invalide' });
    }

    const taxRate = parseFloat(invoice.tax_rate || 8.1);
    const taxAmount = Math.round(creditAmount * taxRate) / 100;
    const total = Math.round((creditAmount + taxAmount) * 100) / 100;
    const creditNumber = await generateCreditNumber();

    const credit = await directusPost('/items/credits', {
      credit_number: creditNumber,
      invoice_id: String(invoice_id),
      amount: creditAmount,
      tax_amount: taxAmount,
      total,
      reason,
      status: 'issued',
      contact_id: invoice.contact_id || null,
      project_id: invoice.project_id || null,
      owner_company: invoice.owner_company,
      issued_at: new Date().toISOString()
    });

    // Si avoir total → annuler la facture originale
    if (creditType === 'full') {
      await directusPatch(`/items/client_invoices/${invoice_id}`, {
        status: 'cancelled',
        credit_id: String(credit.id)
      });
    }

    // Log audit suisse (CO Art. 958f)
    await logAutomation({
      rule_name: 'I-04-credit-issued',
      entity_type: 'credits',
      entity_id: String(credit.id),
      status: 'success',
      trigger_data: {
        credit_number: creditNumber,
        invoice_number: invoice.invoice_number,
        amount: creditAmount,
        type: creditType,
        reason
      }
    });

    res.json({ success: true, credit, type: creditType });
  } catch (error) {
    console.error('[I-04] Erreur creation avoir:', error.message);
    res.status(500).json({ error: 'Erreur creation avoir', details: error.message });
  }
});

// POST /api/credits/:id/apply
router.post('/:id/apply', async (req, res) => {
  try {
    const { target_invoice_id } = req.body;

    if (!target_invoice_id) {
      return res.status(400).json({ error: 'target_invoice_id requis' });
    }

    const credit = await directusGet(`/items/credits/${req.params.id}`);
    if (!credit) {
      return res.status(404).json({ error: 'Avoir non trouve' });
    }
    if (credit.status !== 'issued') {
      return res.status(400).json({ error: 'Avoir non applicable', status: credit.status });
    }

    const targetInvoice = await directusGet(`/items/client_invoices/${target_invoice_id}`);
    if (!targetInvoice) {
      return res.status(404).json({ error: 'Facture cible non trouvee' });
    }

    // Appliquer l'avoir
    await directusPatch(`/items/credits/${req.params.id}`, {
      status: 'applied',
      applied_to_invoice_id: String(target_invoice_id)
    });

    // Reduire le montant de la facture cible
    const newAmount = Math.round(Math.max(0, parseFloat(targetInvoice.amount || 0) - parseFloat(credit.amount || 0)) * 100) / 100;
    const taxRate = parseFloat(targetInvoice.tax_rate || 8.1);
    const newTax = Math.round(newAmount * taxRate) / 100;

    await directusPatch(`/items/client_invoices/${target_invoice_id}`, {
      amount: newAmount,
      tax_amount: newTax,
      total: Math.round((newAmount + newTax) * 100) / 100,
      credit_id: String(req.params.id)
    });

    await logAutomation({
      rule_name: 'I-04-credit-applied',
      entity_type: 'credits',
      entity_id: String(req.params.id),
      status: 'success',
      trigger_data: { target_invoice_id, original_amount: targetInvoice.amount, new_amount: newAmount }
    });

    res.json({ success: true, credit_id: req.params.id, applied_to: target_invoice_id, new_amount: newAmount });
  } catch (error) {
    console.error('[I-04] Erreur application avoir:', error.message);
    res.status(500).json({ error: 'Erreur application avoir', details: error.message });
  }
});

// GET /api/credits
router.get('/', async (req, res) => {
  try {
    const filters = {};
    if (req.query.status) filters['filter[status][_eq]'] = req.query.status;
    if (req.query.owner_company) filters['filter[owner_company][_eq]'] = req.query.owner_company;

    const credits = await directusGet('/items/credits', {
      ...filters,
      sort: '-issued_at',
      limit: req.query.limit || 100
    });

    res.json({ success: true, credits: credits || [], total: (credits || []).length });
  } catch (error) {
    console.error('[I-04] Erreur liste avoirs:', error.message);
    res.status(500).json({ error: 'Erreur liste avoirs', details: error.message });
  }
});

// Health check
router.get('/health', (req, res) => {
  res.json({ success: true, service: 'credits', story: 'I-04', timestamp: new Date().toISOString() });
});

export default router;
