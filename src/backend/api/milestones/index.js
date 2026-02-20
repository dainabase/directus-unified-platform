/**
 * I-01 — Facturation par jalons (deliverables → factures)
 * POST /api/milestones/:deliverableId/invoice — Genere facture depuis livrable complete
 * GET  /api/milestones/project/:projectId — Jalons avec statut facturation
 * GET  /api/milestones/health — Health check
 */

import express from 'express';
import { directusGet, directusPost, directusPatch, addDays, generateInvoiceNumber, logAutomation } from '../../lib/financeUtils.js';

const router = express.Router();

// POST /api/milestones/:deliverableId/invoice
router.post('/:deliverableId/invoice', async (req, res) => {
  try {
    const { deliverableId } = req.params;

    const deliverable = await directusGet(`/items/deliverables/${deliverableId}`);
    if (!deliverable) {
      return res.status(404).json({ error: 'Livrable non trouve' });
    }
    if (deliverable.status !== 'completed') {
      return res.status(400).json({ error: 'Livrable non complete', status: deliverable.status });
    }
    if (deliverable.invoice_id) {
      return res.status(409).json({ error: 'Deja facture', invoice_id: deliverable.invoice_id });
    }
    if (deliverable.billable === false) {
      return res.status(400).json({ error: 'Livrable non facturable (billable=false)' });
    }

    // Recuperer le projet pour le client
    let clientName = '';
    let contactId = null;
    if (deliverable.project_id) {
      try {
        const project = await directusGet(`/items/projects/${deliverable.project_id}`);
        clientName = project.client_name || project.name || '';
        contactId = project.contact_id || null;
      } catch { /* project lookup optional */ }
    }

    const amount = parseFloat(deliverable.amount || 0);
    if (amount <= 0) {
      return res.status(400).json({ error: 'Montant livrable invalide (amount <= 0 ou null)' });
    }
    const taxRate = 8.1;
    const taxAmount = Math.round(amount * taxRate) / 100;
    const total = Math.round((amount + taxAmount) * 100) / 100;
    const invoiceNumber = await generateInvoiceNumber('JAL');

    const invoice = await directusPost('/items/client_invoices', {
      invoice_number: invoiceNumber,
      client_name: clientName,
      project_id: deliverable.project_id,
      contact_id: contactId,
      amount,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      total,
      currency: 'CHF',
      status: 'draft',
      due_date: addDays(new Date(), 30),
      description: `Jalon : ${deliverable.title}`,
      owner_company: deliverable.owner_company,
      type: 'milestone'
    });

    // Lier le livrable a la facture
    await directusPatch(`/items/deliverables/${deliverableId}`, {
      invoice_id: invoice.id,
      invoiced_at: new Date().toISOString()
    });

    await logAutomation({
      rule_name: 'I-01-milestone-invoice',
      entity_type: 'deliverables',
      entity_id: deliverableId,
      status: 'success',
      trigger_data: { invoice_id: invoice.id, invoice_number: invoiceNumber, amount }
    });

    res.json({ success: true, invoice, deliverable_id: deliverableId });
  } catch (error) {
    console.error('[I-01] Erreur generation facture jalon:', error.message);
    res.status(500).json({ error: 'Erreur generation facture', details: error.message });
  }
});

// GET /api/milestones/project/:projectId
router.get('/project/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;

    const deliverables = await directusGet('/items/deliverables', {
      'filter[project_id][_eq]': projectId,
      sort: 'due_date',
      limit: -1
    });

    const milestones = (deliverables || []).map(d => ({
      ...d,
      can_invoice: d.status === 'completed' && !d.invoice_id && d.billable !== false,
      is_invoiced: !!d.invoice_id
    }));

    const totalAmount = milestones.reduce((sum, d) => sum + parseFloat(d.amount || 0), 0);
    const invoicedAmount = milestones
      .filter(d => d.is_invoiced)
      .reduce((sum, d) => sum + parseFloat(d.amount || 0), 0);

    res.json({
      success: true,
      milestones,
      summary: {
        total: milestones.length,
        completed: milestones.filter(d => d.status === 'completed').length,
        invoiced: milestones.filter(d => d.is_invoiced).length,
        can_invoice: milestones.filter(d => d.can_invoice).length,
        total_amount: totalAmount,
        invoiced_amount: invoicedAmount
      }
    });
  } catch (error) {
    console.error('[I-01] Erreur lecture jalons:', error.message);
    res.status(500).json({ error: 'Erreur lecture jalons', details: error.message });
  }
});

// Health check
router.get('/health', (req, res) => {
  res.json({ success: true, service: 'milestones', story: 'I-01', timestamp: new Date().toISOString() });
});

export default router;
