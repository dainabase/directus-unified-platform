/**
 * Phase 7 — Backend Workflow Engine (Route Aggregator)
 * Mounts all workflow sub-routers:
 *   /lead-qualification  → Story 7.3 — AI lead qualification
 *   /quote-signed        → Story 7.4 — DocuSeal signed → deposit invoice
 *   /payment             → Story 7.5 — Revolut payment → project activation
 *   /monthly-report      → Story 7.7 — Monthly report with AI summary
 *   GET /health          → Health check
 *   GET /executions      → Recent workflow executions
 */

import express from 'express';
import { directusGet } from '../../lib/financeUtils.js';

const router = express.Router();

// ── Import sub-routers ──

import leadQualificationRouter from './lead-qualification.js';
import quoteSignedRouter from './quote-signed-to-deposit.js';
import paymentRouter from './payment-to-project-activation.js';
import monthlyReportRouter, { startMonthlyCron } from './monthly-report.js';

// ── Mount sub-routers ──

router.use('/lead-qualification', leadQualificationRouter);
router.use('/quote-signed', quoteSignedRouter);
router.use('/payment', paymentRouter);
router.use('/monthly-report', monthlyReportRouter);

// ── GET /health — Health check endpoint ──

router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'workflow-engine',
    phase: '7',
    stories: ['7.3', '7.4', '7.5', '7.7'],
    workflows: [
      { name: 'lead-qualification', path: '/api/workflows/lead-qualification', stories: ['7.3'] },
      { name: 'quote-signed-to-deposit', path: '/api/workflows/quote-signed', stories: ['7.4'] },
      { name: 'payment-to-project', path: '/api/workflows/payment', stories: ['7.5'] },
      { name: 'monthly-report', path: '/api/workflows/monthly-report', stories: ['7.7'] }
    ],
    timestamp: new Date().toISOString()
  });
});

// ── GET /executions — List recent workflow executions from Directus ──

router.get('/executions', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 200);
    const workflow = req.query.workflow || null;
    const status = req.query.status || null;

    const params = {
      sort: '-executed_at',
      limit
    };

    // Build filters
    const filters = [];
    if (workflow) {
      filters.push({ workflow_name: { _eq: workflow } });
    }
    if (status) {
      filters.push({ status: { _eq: status } });
    }
    if (filters.length > 0) {
      params.filter = JSON.stringify({ _and: filters });
    }

    const executions = await directusGet('/items/workflow_executions', params);

    res.json({
      success: true,
      total: (executions || []).length,
      executions: executions || []
    });
  } catch (error) {
    // Fallback: try automation_logs if workflow_executions doesn't exist
    try {
      const limit = Math.min(parseInt(req.query.limit) || 50, 200);
      const params = {
        sort: '-date_created',
        limit,
        'filter[rule_name][_starts_with]': '7.'
      };

      const logs = await directusGet('/items/automation_logs', params);

      res.json({
        success: true,
        source: 'automation_logs',
        total: (logs || []).length,
        executions: (logs || []).map(log => ({
          workflow_name: log.rule_name,
          entity_type: log.entity_type,
          entity_id: log.entity_id,
          status: log.status,
          executed_at: log.date_created,
          input_data: log.trigger_data,
          output_data: null
        }))
      });
    } catch (fallbackError) {
      console.error('[workflows] Erreur liste executions:', fallbackError.message);
      res.status(500).json({
        error: 'Erreur liste executions',
        details: fallbackError.message
      });
    }
  }
});

// ── Export CRON starter ──

export { startMonthlyCron };
export default router;
