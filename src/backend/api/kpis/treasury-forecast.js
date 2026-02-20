/**
 * Treasury Forecast — Phase J-04
 * GET /treasury — Prévision trésorerie 30/60/90 jours
 *
 * Algorithme:
 * 1. Solde actuel = balance_after dernière tx HYPERVISUAL
 * 2. Entrées = client_invoices sent/overdue dont due_date <= horizon
 * 3. Récurrent = subscriptions actives dont next_billing_date <= horizon × 1.081 TVA
 * 4. Sorties = supplier_invoices approved dont payment_scheduled_date <= horizon
 * 5. Burn opérationnel = moyenne débits 90 derniers jours / 3
 * 6. Runway = current_balance / burn_rate_monthly
 */

import { Router } from 'express';
import { directusGet } from '../../lib/financeUtils.js';

const router = Router();

const TVA_RATE = 1.081; // 8.1% Swiss standard VAT

/**
 * GET /api/kpis/treasury
 * Returns treasury forecast with 30/60/90 day projections.
 */
router.get('/', async (req, res) => {
  try {
    const company = req.query.company || 'HYPERVISUAL';
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    // Horizon dates
    const d30 = new Date(now); d30.setDate(d30.getDate() + 30);
    const d60 = new Date(now); d60.setDate(d60.getDate() + 60);
    const d90 = new Date(now); d90.setDate(d90.getDate() + 90);
    const past90 = new Date(now); past90.setDate(past90.getDate() - 90);

    const d30Str = d30.toISOString().split('T')[0];
    const d60Str = d60.toISOString().split('T')[0];
    const d90Str = d90.toISOString().split('T')[0];
    const past90Str = past90.toISOString().split('T')[0];

    // 1. Current balance — last bank transaction
    const lastTx = await directusGet('/items/bank_transactions', {
      'filter[owner_company][_eq]': company,
      sort: '-date',
      limit: 1,
      fields: 'balance_after,date'
    }).catch(() => []);

    const currentBalance = lastTx.length > 0 ? parseFloat(lastTx[0].balance_after || 0) : 0;

    // 2. Incoming: client invoices (sent/overdue) with due_date in each horizon
    const pendingInvoices = await directusGet('/items/client_invoices', {
      'filter[owner_company][_eq]': company,
      'filter[status][_in]': 'sent,overdue,pending',
      fields: 'amount,due_date',
      limit: -1
    }).catch(() => []);

    const incomingByHorizon = (maxDate) =>
      pendingInvoices
        .filter(inv => inv.due_date && inv.due_date <= maxDate)
        .reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0);

    // 3. Recurring: active subscriptions
    const subscriptions = await directusGet('/items/subscriptions', {
      'filter[owner_company][_eq]': company,
      'filter[status][_eq]': 'active',
      fields: 'amount,billing_cycle,next_billing_date',
      limit: -1
    }).catch(() => []);

    const recurringByHorizon = (maxDate) => {
      let total = 0;
      for (const sub of subscriptions) {
        const nextBill = sub.next_billing_date;
        if (nextBill && nextBill <= maxDate) {
          total += parseFloat(sub.amount || 0) * TVA_RATE;
        }
      }
      return Math.round(total);
    };

    // 4. Outgoing: approved supplier invoices with payment_scheduled_date
    const supplierInvoices = await directusGet('/items/supplier_invoices', {
      'filter[owner_company][_eq]': company,
      'filter[status][_eq]': 'approved',
      fields: 'total_ttc,amount,payment_scheduled_date',
      limit: -1
    }).catch(() => []);

    const outgoingByHorizon = (maxDate) =>
      supplierInvoices
        .filter(inv => inv.payment_scheduled_date && inv.payment_scheduled_date <= maxDate)
        .reduce((sum, inv) => sum + parseFloat(inv.total_ttc || inv.amount || 0), 0);

    // 5. Burn rate: average monthly debits over 90 days
    const recentDebits = await directusGet('/items/bank_transactions', {
      'filter[owner_company][_eq]': company,
      'filter[type][_eq]': 'debit',
      'filter[date][_gte]': past90Str,
      fields: 'amount',
      limit: -1
    }).catch(() => []);

    const totalDebits = recentDebits.reduce((sum, tx) => sum + Math.abs(parseFloat(tx.amount || 0)), 0);
    const burnRateMonthly = Math.round(totalDebits / 3); // 90 days = 3 months

    // 6. Runway
    const runwayMonths = burnRateMonthly > 0
      ? parseFloat((currentBalance / burnRateMonthly).toFixed(1))
      : 99;

    // Build forecasts
    const forecast = (horizonDate) => {
      const maxDate = horizonDate.toISOString().split('T')[0];
      const incoming = incomingByHorizon(maxDate) + recurringByHorizon(maxDate);
      const outgoing = outgoingByHorizon(maxDate);
      const daysInHorizon = Math.round((horizonDate - now) / (1000 * 60 * 60 * 24));
      const burnProrated = Math.round(burnRateMonthly * (daysInHorizon / 30));
      const balance = Math.round(currentBalance + incoming - outgoing - burnProrated);

      return {
        balance,
        incoming: Math.round(incoming),
        outgoing: Math.round(outgoing + burnProrated)
      };
    };

    res.json({
      current_balance: Math.round(currentBalance),
      burn_rate_monthly: burnRateMonthly,
      runway_months: runwayMonths,
      d30: forecast(d30),
      d60: forecast(d60),
      d90: forecast(d90),
      company,
      calculated_at: new Date().toISOString()
    });
  } catch (err) {
    console.error('[treasury-forecast] Error:', err.message);
    res.status(500).json({ error: 'Erreur prévision trésorerie', details: err.message });
  }
});

export default router;
