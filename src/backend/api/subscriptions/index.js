/**
 * I-02 — Contrats recurrents avances (panier multi-services)
 * GET    /api/subscriptions — Liste avec prochaine echeance
 * POST   /api/subscriptions — Creer contrat
 * PUT    /api/subscriptions/:id — Modifier
 * POST   /api/subscriptions/:id/cancel — Annuler
 * GET    /api/subscriptions/due-today — Abonnements a facturer aujourd'hui
 */

import express from 'express';
import { directusGet, directusPost, directusPatch, addMonths } from '../../lib/financeUtils.js';

const router = express.Router();

function calculateNextBillingDate(startDate, billingCycle, lastInvoicedAt) {
  const base = lastInvoicedAt ? new Date(lastInvoicedAt) : new Date(startDate);
  switch (billingCycle) {
    case 'monthly': return addMonths(base, 1);
    case 'quarterly': return addMonths(base, 3);
    case 'annual': return addMonths(base, 12);
    default: return addMonths(base, 1);
  }
}

// GET /api/subscriptions
router.get('/', async (req, res) => {
  try {
    const filters = {};
    if (req.query.status) filters['filter[status][_eq]'] = req.query.status;
    if (req.query.owner_company) filters['filter[owner_company][_eq]'] = req.query.owner_company;

    const subscriptions = await directusGet('/items/subscriptions', {
      ...filters,
      sort: '-date_created',
      limit: req.query.limit || 100
    });

    const enriched = (subscriptions || []).map(sub => ({
      ...sub,
      computed_next_billing: sub.next_billing_date || calculateNextBillingDate(sub.start_date, sub.billing_cycle, sub.last_invoiced_at),
      services_list: sub.services ? (typeof sub.services === 'string' ? JSON.parse(sub.services) : sub.services) : []
    }));

    res.json({ success: true, subscriptions: enriched, total: enriched.length });
  } catch (error) {
    console.error('[I-02] Erreur liste subscriptions:', error.message);
    res.status(500).json({ error: 'Erreur liste abonnements', details: error.message });
  }
});

// POST /api/subscriptions
router.post('/', async (req, res) => {
  try {
    const { name, amount, billing_cycle, start_date, project_id, contact_id, services, auto_renew, invoice_day, owner_company } = req.body;

    if (!name || !amount || !billing_cycle) {
      return res.status(400).json({ error: 'name, amount, billing_cycle requis' });
    }

    const nextBilling = calculateNextBillingDate(start_date || new Date().toISOString(), billing_cycle, null);

    const subscription = await directusPost('/items/subscriptions', {
      name,
      amount: parseFloat(amount),
      billing_cycle,
      start_date: start_date || new Date().toISOString().split('T')[0],
      status: 'active',
      project_id: project_id || null,
      contact_id: contact_id || null,
      services: services || null,
      auto_renew: auto_renew !== false,
      invoice_day: invoice_day || 1,
      next_billing_date: nextBilling,
      owner_company: owner_company || null
    });

    res.json({ success: true, subscription });
  } catch (error) {
    console.error('[I-02] Erreur creation subscription:', error.message);
    res.status(500).json({ error: 'Erreur creation abonnement', details: error.message });
  }
});

// PUT /api/subscriptions/:id
router.put('/:id', async (req, res) => {
  try {
    const updated = await directusPatch(`/items/subscriptions/${req.params.id}`, req.body);
    res.json({ success: true, subscription: updated });
  } catch (error) {
    console.error('[I-02] Erreur MAJ subscription:', error.message);
    res.status(500).json({ error: 'Erreur mise a jour', details: error.message });
  }
});

// POST /api/subscriptions/:id/cancel
router.post('/:id/cancel', async (req, res) => {
  try {
    const updated = await directusPatch(`/items/subscriptions/${req.params.id}`, {
      status: 'cancelled',
      end_date: new Date().toISOString().split('T')[0]
    });
    res.json({ success: true, subscription: updated });
  } catch (error) {
    console.error('[I-02] Erreur annulation:', error.message);
    res.status(500).json({ error: 'Erreur annulation', details: error.message });
  }
});

// GET /api/subscriptions/due-today
router.get('/due-today', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const subscriptions = await directusGet('/items/subscriptions', {
      'filter[status][_eq]': 'active',
      'filter[next_billing_date][_lte]': today,
      limit: -1
    });
    res.json({ success: true, subscriptions: subscriptions || [], count: (subscriptions || []).length });
  } catch (error) {
    console.error('[I-02] Erreur due-today:', error.message);
    res.status(500).json({ error: 'Erreur lecture echeances', details: error.message });
  }
});

// Health check
router.get('/health', (req, res) => {
  res.json({ success: true, service: 'subscriptions', story: 'I-02', timestamp: new Date().toISOString() });
});

export { calculateNextBillingDate };
export default router;
