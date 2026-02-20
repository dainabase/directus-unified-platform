/**
 * I-08 — Tickets support → facturation hors contrat
 * POST /api/support/tickets — Creer ticket
 * GET  /api/support/tickets — Liste tickets
 * PUT  /api/support/tickets/:id — MAJ ticket
 * POST /api/support/tickets/:id/close — Cloturer + facturer si applicable
 * POST /api/support/tickets/:id/bill — Facturer manuellement
 * GET  /api/support/tickets/stats — Statistiques
 * GET  /api/support/health — Health check
 */

import express from 'express';
import { directusGet, directusPost, directusPatch, addDays, generateInvoiceNumber, logAutomation } from '../../lib/financeUtils.js';

const router = express.Router();

// GET /api/support/tickets
router.get('/tickets', async (req, res) => {
  try {
    const filters = {};
    if (req.query.status) filters['filter[status][_eq]'] = req.query.status;
    if (req.query.owner_company) filters['filter[owner_company][_eq]'] = req.query.owner_company;
    if (req.query.billable) filters['filter[billable][_eq]'] = req.query.billable;

    const tickets = await directusGet('/items/support_tickets', {
      ...filters,
      sort: '-date_created',
      limit: req.query.limit || 100
    });

    // Enrichir : contrat ou hors-contrat
    const enriched = (tickets || []).map(t => ({
      ...t,
      coverage: t.subscription_id ? 'contract' : 'out_of_contract',
      estimated_amount: t.billable && !t.subscription_id
        ? parseFloat(t.hours_spent || 0) * parseFloat(t.hourly_rate || 150)
        : 0
    }));

    res.json({ success: true, tickets: enriched, total: enriched.length });
  } catch (error) {
    console.error('[I-08] Erreur liste tickets:', error.message);
    res.status(500).json({ error: 'Erreur liste tickets', details: error.message });
  }
});

// POST /api/support/tickets
router.post('/tickets', async (req, res) => {
  try {
    const { subject, description, priority, project_id, contact_id, company_id, subscription_id, billable, assigned_to, owner_company } = req.body;

    if (!subject) {
      return res.status(400).json({ error: 'subject requis' });
    }

    // Generer ticket_number
    const existing = await directusGet('/items/support_tickets', {
      'aggregate[count]': 'id'
    });
    const count = parseInt(existing?.[0]?.count?.id || 0) + 1;
    const ticketNumber = `#${String(count).padStart(4, '0')}`;

    // Verifier si couvert par contrat
    let isCovered = false;
    if (subscription_id) {
      try {
        const sub = await directusGet(`/items/subscriptions/${subscription_id}`);
        isCovered = sub && sub.status === 'active';
      } catch { /* no subscription */ }
    }

    const ticket = await directusPost('/items/support_tickets', {
      ticket_number: ticketNumber,
      subject,
      description: description || '',
      priority: priority || 'medium',
      status: 'open',
      project_id: project_id || null,
      contact_id: contact_id || null,
      company_id: company_id || null,
      subscription_id: subscription_id || null,
      billable: isCovered ? false : (billable !== false),
      hourly_rate: 150,
      hours_spent: 0,
      assigned_to: assigned_to || null,
      owner_company: owner_company || null
    });

    res.json({ success: true, ticket });
  } catch (error) {
    console.error('[I-08] Erreur creation ticket:', error.message);
    res.status(500).json({ error: 'Erreur creation ticket', details: error.message });
  }
});

// PUT /api/support/tickets/:id
router.put('/tickets/:id', async (req, res) => {
  try {
    const updated = await directusPatch(`/items/support_tickets/${req.params.id}`, req.body);
    res.json({ success: true, ticket: updated });
  } catch (error) {
    console.error('[I-08] Erreur MAJ ticket:', error.message);
    res.status(500).json({ error: 'Erreur mise a jour', details: error.message });
  }
});

// POST /api/support/tickets/:id/close
router.post('/tickets/:id/close', async (req, res) => {
  try {
    const ticket = await directusGet(`/items/support_tickets/${req.params.id}`);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket non trouve' });
    }

    const shouldBill = ticket.billable && !ticket.subscription_id && parseFloat(ticket.hours_spent || 0) > 0;
    let invoice = null;

    if (shouldBill) {
      const rate = parseFloat(ticket.hourly_rate || 150);
      const hours = parseFloat(ticket.hours_spent || 0);
      const amount = hours * rate;
      const invoiceNumber = await generateInvoiceNumber('SUP');
      const taxRate = 8.1;
      const taxAmount = Math.round(amount * taxRate) / 100;
      const total = amount + taxAmount;

      invoice = await directusPost('/items/client_invoices', {
        invoice_number: invoiceNumber,
        contact_id: ticket.contact_id,
        project_id: ticket.project_id,
        amount,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        total,
        currency: 'CHF',
        status: 'draft',
        due_date: addDays(new Date(), 30),
        description: `Support hors contrat — Ticket ${ticket.ticket_number} : ${ticket.subject} — ${hours}h x ${rate} CHF/h`,
        owner_company: ticket.owner_company,
        type: 'support'
      });

      await directusPatch(`/items/support_tickets/${req.params.id}`, {
        status: 'billed',
        invoice_id: String(invoice.id),
        invoiced_at: new Date().toISOString()
      });

      await logAutomation({
        rule_name: 'I-08-support-billed',
        entity_type: 'support_tickets',
        entity_id: String(req.params.id),
        status: 'success',
        trigger_data: { ticket_number: ticket.ticket_number, invoice_number: invoiceNumber, amount, hours }
      });
    } else {
      await directusPatch(`/items/support_tickets/${req.params.id}`, {
        status: 'closed'
      });
    }

    res.json({ success: true, invoiced: !!invoice, invoice, ticket_id: req.params.id });
  } catch (error) {
    console.error('[I-08] Erreur cloture ticket:', error.message);
    res.status(500).json({ error: 'Erreur cloture', details: error.message });
  }
});

// POST /api/support/tickets/:id/bill
router.post('/tickets/:id/bill', async (req, res) => {
  try {
    const ticket = await directusGet(`/items/support_tickets/${req.params.id}`);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket non trouve' });
    }
    if (ticket.invoice_id) {
      return res.status(409).json({ error: 'Deja facture', invoice_id: ticket.invoice_id });
    }

    const rate = parseFloat(req.body.hourly_rate || ticket.hourly_rate || 150);
    const hours = parseFloat(req.body.hours_spent || ticket.hours_spent || 0);
    if (hours <= 0) {
      return res.status(400).json({ error: 'hours_spent doit etre > 0' });
    }

    const amount = hours * rate;
    const invoiceNumber = await generateInvoiceNumber('SUP');
    const taxRate = 8.1;
    const taxAmount = Math.round(amount * taxRate) / 100;
    const total = amount + taxAmount;

    const invoice = await directusPost('/items/client_invoices', {
      invoice_number: invoiceNumber,
      contact_id: ticket.contact_id,
      project_id: ticket.project_id,
      amount,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      total,
      currency: 'CHF',
      status: 'draft',
      due_date: addDays(new Date(), 30),
      description: `Support hors contrat — Ticket ${ticket.ticket_number} : ${ticket.subject} — ${hours}h x ${rate} CHF/h`,
      owner_company: ticket.owner_company,
      type: 'support'
    });

    await directusPatch(`/items/support_tickets/${req.params.id}`, {
      status: 'billed',
      invoice_id: String(invoice.id),
      invoiced_at: new Date().toISOString(),
      hours_spent: hours,
      hourly_rate: rate
    });

    res.json({ success: true, invoice, hours, rate, amount });
  } catch (error) {
    console.error('[I-08] Erreur facturation ticket:', error.message);
    res.status(500).json({ error: 'Erreur facturation', details: error.message });
  }
});

// GET /api/support/tickets/stats
router.get('/tickets/stats', async (req, res) => {
  try {
    const all = await directusGet('/items/support_tickets', { limit: -1 });
    const tickets = all || [];

    const stats = {
      total: tickets.length,
      open: tickets.filter(t => t.status === 'open').length,
      in_progress: tickets.filter(t => t.status === 'in_progress').length,
      resolved: tickets.filter(t => t.status === 'resolved').length,
      closed: tickets.filter(t => t.status === 'closed').length,
      billed: tickets.filter(t => t.status === 'billed').length,
      billable_pending: tickets.filter(t => t.billable && !t.invoice_id && t.status !== 'closed' && t.status !== 'billed').length,
      total_hours: tickets.reduce((sum, t) => sum + parseFloat(t.hours_spent || 0), 0),
      total_revenue: tickets
        .filter(t => t.invoice_id)
        .reduce((sum, t) => sum + (parseFloat(t.hours_spent || 0) * parseFloat(t.hourly_rate || 150)), 0)
    };

    res.json({ success: true, stats });
  } catch (error) {
    console.error('[I-08] Erreur stats:', error.message);
    res.status(500).json({ error: 'Erreur statistiques', details: error.message });
  }
});

// Health check
router.get('/health', (req, res) => {
  res.json({ success: true, service: 'support', story: 'I-08', timestamp: new Date().toISOString() });
});

export default router;
