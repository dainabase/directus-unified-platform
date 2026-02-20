/**
 * I-07 — Suivi du temps → facturation en regie
 * POST /api/time-tracking — Saisir heures
 * GET  /api/time-tracking/project/:projectId — Heures par projet
 * GET  /api/time-tracking/billable/:projectId — Heures billables non facturees
 * POST /api/time-tracking/invoice — Generer facture depuis selection d'heures
 * GET  /api/time-tracking/health — Health check
 */

import express from 'express';
import { directusGet, directusPost, directusPatch, addDays, generateInvoiceNumber, logAutomation } from '../../lib/financeUtils.js';

const router = express.Router();

// POST /api/time-tracking
router.post('/', async (req, res) => {
  try {
    const { project_id, deliverable_id, person_id, date, hours, task_description, billable, hourly_rate, category, owner_company } = req.body;

    if (!project_id || !hours || !date) {
      return res.status(400).json({ error: 'project_id, hours, date requis' });
    }

    const entry = await directusPost('/items/time_tracking', {
      project_id,
      deliverable_id: deliverable_id || null,
      person_id: person_id || null,
      date,
      hours: parseFloat(hours),
      task_description: task_description || '',
      billable: billable !== false,
      billed: false,
      hourly_rate: parseFloat(hourly_rate || 150),
      category: category || 'development',
      status: 'logged',
      owner_company: owner_company || null
    });

    res.json({ success: true, entry });
  } catch (error) {
    console.error('[I-07] Erreur saisie heures:', error.message);
    res.status(500).json({ error: 'Erreur saisie heures', details: error.message });
  }
});

// GET /api/time-tracking/project/:projectId
router.get('/project/:projectId', async (req, res) => {
  try {
    const entries = await directusGet('/items/time_tracking', {
      'filter[project_id][_eq]': req.params.projectId,
      sort: '-date',
      limit: req.query.limit || 200
    });

    const totalHours = (entries || []).reduce((sum, e) => sum + parseFloat(e.hours || 0), 0);
    const billableHours = (entries || []).filter(e => e.billable).reduce((sum, e) => sum + parseFloat(e.hours || 0), 0);
    const billedHours = (entries || []).filter(e => e.billed || e.invoice_id).reduce((sum, e) => sum + parseFloat(e.hours || 0), 0);

    res.json({
      success: true,
      entries: entries || [],
      summary: {
        total_entries: (entries || []).length,
        total_hours: Math.round(totalHours * 100) / 100,
        billable_hours: Math.round(billableHours * 100) / 100,
        billed_hours: Math.round(billedHours * 100) / 100,
        unbilled_hours: Math.round((billableHours - billedHours) * 100) / 100
      }
    });
  } catch (error) {
    console.error('[I-07] Erreur lecture heures projet:', error.message);
    res.status(500).json({ error: 'Erreur lecture heures', details: error.message });
  }
});

// GET /api/time-tracking/billable/:projectId
router.get('/billable/:projectId', async (req, res) => {
  try {
    const entries = await directusGet('/items/time_tracking', {
      'filter[project_id][_eq]': req.params.projectId,
      'filter[billable][_eq]': true,
      'filter[invoice_id][_null]': true,
      sort: '-date',
      limit: -1
    });

    const totalHours = (entries || []).reduce((sum, e) => sum + parseFloat(e.hours || 0), 0);
    const defaultRate = (entries || []).length > 0 ? parseFloat(entries[0].hourly_rate || 150) : 150;
    const totalAmount = (entries || []).reduce((sum, e) => sum + (parseFloat(e.hours || 0) * parseFloat(e.hourly_rate || defaultRate)), 0);

    res.json({
      success: true,
      entries: entries || [],
      summary: {
        count: (entries || []).length,
        total_hours: Math.round(totalHours * 100) / 100,
        total_amount: Math.round(totalAmount * 100) / 100,
        default_hourly_rate: defaultRate
      }
    });
  } catch (error) {
    console.error('[I-07] Erreur billable:', error.message);
    res.status(500).json({ error: 'Erreur lecture billable', details: error.message });
  }
});

// POST /api/time-tracking/invoice
router.post('/invoice', async (req, res) => {
  try {
    const { project_id, entry_ids, hourly_rate } = req.body;

    if (!project_id || !entry_ids || !entry_ids.length) {
      return res.status(400).json({ error: 'project_id et entry_ids requis' });
    }

    // Recuperer les entrees selectionnees (billable + non facturees)
    const allEntries = await directusGet('/items/time_tracking', {
      'filter[project_id][_eq]': project_id,
      'filter[billable][_eq]': true,
      'filter[invoice_id][_null]': true,
      limit: -1
    });

    const entries = (allEntries || []).filter(e => entry_ids.includes(e.id) || entry_ids.includes(String(e.id)));

    if (entries.length === 0) {
      return res.status(400).json({ error: 'Aucune entree billable trouvee pour les IDs fournis' });
    }

    const rate = parseFloat(hourly_rate || entries[0].hourly_rate || 150);
    const totalHours = entries.reduce((sum, e) => sum + parseFloat(e.hours || 0), 0);
    const totalAmount = entries.reduce((sum, e) => sum + (parseFloat(e.hours || 0) * parseFloat(e.hourly_rate || rate)), 0);

    const invoiceNumber = await generateInvoiceNumber('REG');
    const taxRate = 8.1;
    const taxAmount = Math.round(totalAmount * taxRate) / 100;
    const total = Math.round((totalAmount + taxAmount) * 100) / 100;

    // Recuperer info projet
    let ownerCompany = entries[0].owner_company || 'HYPERVISUAL';
    let contactId = null;
    try {
      const project = await directusGet(`/items/projects/${project_id}`);
      ownerCompany = project.owner_company || ownerCompany;
      contactId = project.contact_id || null;
    } catch { /* optional */ }

    const invoice = await directusPost('/items/client_invoices', {
      invoice_number: invoiceNumber,
      project_id,
      contact_id: contactId,
      amount: totalAmount,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      total,
      currency: 'CHF',
      status: 'draft',
      due_date: addDays(new Date(), 30),
      description: `Facturation en regie — ${Math.round(totalHours * 100) / 100}h x ${rate} CHF/h`,
      owner_company: ownerCompany,
      type: 'time_and_materials'
    });

    // Marquer les entrees comme facturees
    for (const entry of entries) {
      await directusPatch(`/items/time_tracking/${entry.id}`, {
        invoice_id: String(invoice.id),
        invoiced_at: new Date().toISOString(),
        billed: true
      });
    }

    await logAutomation({
      rule_name: 'I-07-time-invoice',
      entity_type: 'time_tracking',
      entity_id: String(invoice.id),
      status: 'success',
      trigger_data: { invoice_number: invoiceNumber, total_hours: totalHours, total_amount: totalAmount, entries_count: entries.length }
    });

    res.json({ success: true, invoice, total_hours: totalHours, total_amount: totalAmount, entries_billed: entries.length });
  } catch (error) {
    console.error('[I-07] Erreur generation facture regie:', error.message);
    res.status(500).json({ error: 'Erreur generation facture', details: error.message });
  }
});

// Health check
router.get('/health', (req, res) => {
  res.json({ success: true, service: 'time-tracking', story: 'I-07', timestamp: new Date().toISOString() });
});

export default router;
