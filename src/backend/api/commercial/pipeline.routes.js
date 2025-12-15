/**
 * Pipeline API Routes
 *
 * Endpoints pour les statistiques du pipeline commercial
 *
 * @date 15 Décembre 2025
 */

import express from 'express';
import * as workflowService from '../../services/commercial/workflow.service.js';
import * as quoteService from '../../services/commercial/quote.service.js';
import * as depositService from '../../services/commercial/deposit.service.js';
import * as cgvService from '../../services/commercial/cgv.service.js';

const router = express.Router();

/**
 * GET /api/commercial/pipeline/stats
 * Statistiques complètes du pipeline
 */
router.get('/stats', async (req, res) => {
  try {
    const { owner_company_id, date_from, date_to } = req.query;

    const stats = await workflowService.getPipelineStats(
      owner_company_id,
      date_from,
      date_to
    );

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('GET /pipeline/stats error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/commercial/pipeline/dashboard
 * Dashboard complet (combinaison de stats)
 */
router.get('/dashboard', async (req, res) => {
  try {
    const { owner_company_id, date_from, date_to } = req.query;

    // Parallel fetch all stats
    const [pipelineStats, quoteStats, depositStats] = await Promise.all([
      workflowService.getPipelineStats(owner_company_id, date_from, date_to),
      quoteService.getQuoteStats(owner_company_id, date_from, date_to),
      depositService.getDepositStats(owner_company_id, date_from, date_to)
    ]);

    res.json({
      success: true,
      dashboard: {
        pipeline: pipelineStats,
        quotes: quoteStats,
        deposits: depositStats,
        generated_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('GET /pipeline/dashboard error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/commercial/pipeline/funnel
 * Données pour le funnel de conversion
 */
router.get('/funnel', async (req, res) => {
  try {
    const { owner_company_id, date_from, date_to } = req.query;

    const stats = await workflowService.getPipelineStats(
      owner_company_id,
      date_from,
      date_to
    );

    // Build funnel data
    const funnel = {
      stages: [
        {
          name: 'Leads',
          count: stats?.totals?.leads || 0,
          status_breakdown: stats?.pipeline?.leads || {}
        },
        {
          name: 'Quotes Created',
          count: stats?.totals?.quotes || 0,
          value: stats?.totals?.total_value || 0
        },
        {
          name: 'Quotes Sent',
          count: (stats?.pipeline?.quotes?.sent?.count || 0) +
                 (stats?.pipeline?.quotes?.viewed?.count || 0) +
                 (stats?.pipeline?.quotes?.signed?.count || 0) +
                 (stats?.pipeline?.quotes?.awaiting_deposit?.count || 0) +
                 (stats?.pipeline?.quotes?.completed?.count || 0)
        },
        {
          name: 'Quotes Signed',
          count: (stats?.pipeline?.quotes?.signed?.count || 0) +
                 (stats?.pipeline?.quotes?.awaiting_deposit?.count || 0) +
                 (stats?.pipeline?.quotes?.completed?.count || 0)
        },
        {
          name: 'Deposits Received',
          count: stats?.pipeline?.quotes?.completed?.count || 0,
          value: stats?.totals?.collected_deposits || 0
        }
      ],
      conversion_rates: stats?.conversion_rates || {}
    };

    res.json({
      success: true,
      funnel
    });
  } catch (error) {
    console.error('GET /pipeline/funnel error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/commercial/pipeline/kpis
 * KPIs principaux
 */
router.get('/kpis', async (req, res) => {
  try {
    const { owner_company_id } = req.query;

    // Get current month dates
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

    // Get previous month dates
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
    const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0).toISOString();

    // Parallel fetch
    const [currentStats, prevStats, pendingDeposits, overdueDeposits] = await Promise.all([
      workflowService.getPipelineStats(owner_company_id, startOfMonth, endOfMonth),
      workflowService.getPipelineStats(owner_company_id, startOfPrevMonth, endOfPrevMonth),
      depositService.getPendingDeposits(owner_company_id),
      depositService.getOverdueDeposits(owner_company_id)
    ]);

    // Calculate KPIs
    const kpis = {
      current_month: {
        leads: currentStats?.totals?.leads || 0,
        quotes: currentStats?.totals?.quotes || 0,
        quote_value: currentStats?.totals?.total_value || 0,
        signed_quotes: (currentStats?.pipeline?.quotes?.signed?.count || 0) +
                       (currentStats?.pipeline?.quotes?.awaiting_deposit?.count || 0) +
                       (currentStats?.pipeline?.quotes?.completed?.count || 0),
        conversion_rate: currentStats?.conversion_rates?.overall || 0
      },
      previous_month: {
        leads: prevStats?.totals?.leads || 0,
        quotes: prevStats?.totals?.quotes || 0,
        quote_value: prevStats?.totals?.total_value || 0,
        conversion_rate: prevStats?.conversion_rates?.overall || 0
      },
      pending: {
        deposits_count: pendingDeposits.length,
        deposits_value: pendingDeposits.reduce((sum, q) => sum + (parseFloat(q.deposit_amount) || 0), 0)
      },
      overdue: {
        count: overdueDeposits.length,
        value: overdueDeposits.reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0)
      },
      trends: {
        leads_change: calculateChange(currentStats?.totals?.leads, prevStats?.totals?.leads),
        quotes_change: calculateChange(currentStats?.totals?.quotes, prevStats?.totals?.quotes),
        value_change: calculateChange(currentStats?.totals?.total_value, prevStats?.totals?.total_value)
      }
    };

    res.json({
      success: true,
      kpis
    });
  } catch (error) {
    console.error('GET /pipeline/kpis error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Calculate percentage change
 */
function calculateChange(current, previous) {
  if (!previous || previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return Math.round(((current - previous) / previous) * 100);
}

/**
 * GET /api/commercial/pipeline/activity
 * Activité récente du pipeline
 */
router.get('/activity', async (req, res) => {
  try {
    const { owner_company_id, limit = 20 } = req.query;

    // Get recent quotes with status changes
    const quotes = await quoteService.listQuotes({
      owner_company_id,
      limit: parseInt(limit)
    });

    // Build activity feed
    const activity = quotes.quotes.map(quote => {
      const events = [];

      if (quote.date_created) {
        events.push({
          type: 'created',
          date: quote.date_created,
          description: `Quote ${quote.quote_number} created`
        });
      }
      if (quote.sent_at) {
        events.push({
          type: 'sent',
          date: quote.sent_at,
          description: `Quote ${quote.quote_number} sent to client`
        });
      }
      if (quote.viewed_at) {
        events.push({
          type: 'viewed',
          date: quote.viewed_at,
          description: `Quote ${quote.quote_number} viewed by client`
        });
      }
      if (quote.signed_at) {
        events.push({
          type: 'signed',
          date: quote.signed_at,
          description: `Quote ${quote.quote_number} signed`
        });
      }
      if (quote.deposit_paid_at) {
        events.push({
          type: 'paid',
          date: quote.deposit_paid_at,
          description: `Deposit received for ${quote.quote_number}`
        });
      }

      return events;
    }).flat().sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, parseInt(limit));

    res.json({
      success: true,
      activity,
      count: activity.length
    });
  } catch (error) {
    console.error('GET /pipeline/activity error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
