/**
 * KPI API — Phase J-01
 * Endpoints pour KPIs depuis collection `kpis` Directus.
 * GET /latest — dernière valeur de chaque métrique HYPERVISUAL
 * GET /history/:metric?days=30 — historique pour sparkline
 * GET /summary — résumé pour rapport CEO
 *
 * Métriques en base: MRR, ARR, NPS, LTV_CAC, ACTIVE_PROJECTS, CASH_RUNWAY, etc.
 * Métriques calculées: EBITDA, RUNWAY
 */

import { Router } from 'express';
import { directusGet } from '../../lib/financeUtils.js';

const router = Router();

// ── Distinct metric names we track ──
const TRACKED_METRICS = ['MRR', 'ARR', 'NPS', 'LTV_CAC', 'ACTIVE_PROJECTS'];

/**
 * GET /api/kpis/latest
 * Returns the latest value for each metric_name for a given company (default HYPERVISUAL).
 * For each metric, fetches the 2 most recent records to compute variation.
 */
router.get('/latest', async (req, res) => {
  try {
    const company = req.query.company || 'HYPERVISUAL';

    // Fetch all kpis for the company, sorted by date desc
    const allKpis = await directusGet('/items/kpis', {
      'filter[owner_company][_eq]': company,
      sort: '-date',
      limit: 200,
      fields: 'id,metric_name,value,date'
    });

    // Group by metric_name, keep only the 2 most recent per metric
    const byMetric = {};
    for (const kpi of allKpis) {
      if (!byMetric[kpi.metric_name]) byMetric[kpi.metric_name] = [];
      if (byMetric[kpi.metric_name].length < 2) {
        byMetric[kpi.metric_name].push(kpi);
      }
    }

    // Build response with variation
    const result = {};
    for (const [metric, records] of Object.entries(byMetric)) {
      const current = parseFloat(records[0]?.value || 0);
      const previous = records.length > 1 ? parseFloat(records[1]?.value || 0) : null;
      const variation = previous && previous !== 0
        ? parseFloat((((current - previous) / previous) * 100).toFixed(1))
        : 0;

      result[metric] = {
        value: current,
        date: records[0]?.date || null,
        variation,
        trend: variation > 0 ? 'up' : variation < 0 ? 'down' : 'stable'
      };
    }

    // Add computed metrics: EBITDA and RUNWAY
    try {
      const [invoices, expenses] = await Promise.all([
        directusGet('/items/client_invoices', {
          'filter[owner_company][_eq]': company,
          'filter[status][_eq]': 'paid',
          fields: 'amount',
          limit: -1
        }).catch(() => []),
        directusGet('/items/expenses', {
          'filter[owner_company][_eq]': company,
          fields: 'amount',
          limit: -1
        }).catch(() => [])
      ]);

      const totalRevenue = invoices.reduce((s, i) => s + parseFloat(i.amount || 0), 0);
      const totalExpenses = expenses.reduce((s, e) => s + parseFloat(e.amount || 0), 0);
      const ebitda = totalRevenue - totalExpenses;

      result.EBITDA = {
        value: Math.round(ebitda),
        date: new Date().toISOString().split('T')[0],
        variation: 0,
        trend: ebitda > 0 ? 'up' : 'down'
      };

      // RUNWAY = cash / burn rate monthly
      const cashRunway = result.CASH_RUNWAY || result.Cash_Runway;
      if (cashRunway) {
        result.RUNWAY = {
          value: cashRunway.value,
          date: cashRunway.date,
          variation: cashRunway.variation,
          trend: cashRunway.trend
        };
      }
    } catch {
      // EBITDA/RUNWAY calculation failed — skip silently
    }

    res.json({ kpis: result, company, updated_at: new Date().toISOString() });
  } catch (err) {
    console.error('[kpis/latest] Error:', err.message);
    res.status(500).json({ error: 'Erreur récupération KPIs', details: err.message });
  }
});

/**
 * GET /api/kpis/history/:metric?days=30
 * Returns time-series data for a specific metric (for sparkline charts).
 */
router.get('/history/:metric', async (req, res) => {
  try {
    const { metric } = req.params;
    const days = parseInt(req.query.days) || 30;
    const company = req.query.company || 'HYPERVISUAL';

    const since = new Date();
    since.setDate(since.getDate() - days);
    const sinceStr = since.toISOString().split('T')[0];

    const history = await directusGet('/items/kpis', {
      'filter[owner_company][_eq]': company,
      'filter[metric_name][_eq]': metric,
      'filter[date][_gte]': sinceStr,
      sort: 'date',
      limit: -1,
      fields: 'value,date'
    });

    const data = history.map(h => ({
      date: h.date,
      value: parseFloat(h.value || 0)
    }));

    res.json({ metric, days, company, data });
  } catch (err) {
    console.error('[kpis/history] Error:', err.message);
    res.status(500).json({ error: 'Erreur historique KPI', details: err.message });
  }
});

/**
 * GET /api/kpis/summary
 * Full summary for CEO report: all KPIs + operational data.
 */
router.get('/summary', async (req, res) => {
  try {
    const company = req.query.company || 'HYPERVISUAL';

    // KPIs
    const allKpis = await directusGet('/items/kpis', {
      'filter[owner_company][_eq]': company,
      sort: '-date',
      limit: 200,
      fields: 'metric_name,value,date'
    });

    const latestByMetric = {};
    for (const kpi of allKpis) {
      if (!latestByMetric[kpi.metric_name]) {
        latestByMetric[kpi.metric_name] = {
          value: parseFloat(kpi.value || 0),
          date: kpi.date
        };
      }
    }

    // Operational data
    const [activeProjects, pendingInvoices, overdueInvoices, pendingApprovals] = await Promise.all([
      directusGet('/items/projects', {
        'filter[owner_company][_eq]': company,
        'filter[status][_in]': 'active,in_progress',
        'aggregate[count]': 'id'
      }).catch(() => [{ count: { id: 0 } }]),
      directusGet('/items/client_invoices', {
        'filter[owner_company][_eq]': company,
        'filter[status][_eq]': 'pending',
        'aggregate[sum]': 'amount',
        'aggregate[count]': 'id'
      }).catch(() => [{ sum: { amount: 0 }, count: { id: 0 } }]),
      directusGet('/items/client_invoices', {
        'filter[owner_company][_eq]': company,
        'filter[status][_eq]': 'overdue',
        'aggregate[sum]': 'amount',
        'aggregate[count]': 'id'
      }).catch(() => [{ sum: { amount: 0 }, count: { id: 0 } }]),
      directusGet('/items/supplier_invoices', {
        'filter[owner_company][_eq]': company,
        'filter[status][_eq]': 'pending',
        'aggregate[count]': 'id'
      }).catch(() => [{ count: { id: 0 } }])
    ]);

    res.json({
      company,
      kpis: latestByMetric,
      operations: {
        active_projects: parseInt(activeProjects[0]?.count?.id || 0),
        pending_invoices_chf: parseFloat(pendingInvoices[0]?.sum?.amount || 0),
        pending_invoices_count: parseInt(pendingInvoices[0]?.count?.id || 0),
        overdue_invoices_chf: parseFloat(overdueInvoices[0]?.sum?.amount || 0),
        overdue_invoices_count: parseInt(overdueInvoices[0]?.count?.id || 0),
        pending_approvals: parseInt(pendingApprovals[0]?.count?.id || 0)
      },
      generated_at: new Date().toISOString()
    });
  } catch (err) {
    console.error('[kpis/summary] Error:', err.message);
    res.status(500).json({ error: 'Erreur résumé KPIs', details: err.message });
  }
});

export default router;
