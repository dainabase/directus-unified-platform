/**
 * Story 7.7 — Monthly Report with AI Summary
 * GET  /preview — Preview the monthly report HTML
 * POST /send — Manual send trigger
 * Function: startMonthlyCron() — Scheduled 1st of month at 08:00
 *
 * Aggregates data from Directus for the previous month, calls Claude AI
 * for executive summary, sends HTML email via Mautic.
 */

import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import axios from 'axios';
import { directusGet, directusPost, formatCHF, formatMonthYear, logAutomation, checkAutomationLog } from '../../lib/financeUtils.js';

const router = express.Router();

const WORKFLOW_NAME = '7.7-monthly-report';
const CEO_EMAIL = process.env.CEO_EMAIL || 'jean@hypervisual.ch';
const MAUTIC_URL = process.env.MAUTIC_URL || 'http://localhost:8080';

// ── Claude AI client (lazy init) ──

let anthropicClient = null;

function getAnthropicClient() {
  if (!anthropicClient) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not set');
    }
    anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return anthropicClient;
}

// ── Helper: Log to workflow_executions collection ──

async function logWorkflowExecution({ workflow, entity_type, entity_id, status, input, output }) {
  try {
    await directusPost('/items/workflow_executions', {
      workflow_name: workflow,
      entity_type,
      entity_id: String(entity_id),
      status,
      input_data: input || null,
      output_data: output || null,
      executed_at: new Date().toISOString()
    });
  } catch (err) {
    console.warn(`[${WORKFLOW_NAME}] workflow_executions log failed, using automation_logs: ${err.message}`);
    await logAutomation({
      rule_name: workflow,
      entity_type,
      entity_id: String(entity_id),
      status,
      trigger_data: { ...input, ...output }
    });
  }
}

// ── Helper: Get previous month date range ──

function getPreviousMonthRange() {
  const now = new Date();
  const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDayPrevMonth = new Date(firstDayCurrentMonth.getTime() - 1);
  const firstDayPrevMonth = new Date(lastDayPrevMonth.getFullYear(), lastDayPrevMonth.getMonth(), 1);

  return {
    start: firstDayPrevMonth.toISOString().split('T')[0],
    end: lastDayPrevMonth.toISOString().split('T')[0],
    label: formatMonthYear(firstDayPrevMonth),
    month: firstDayPrevMonth.getMonth() + 1,
    year: firstDayPrevMonth.getFullYear()
  };
}

// ── Core: Aggregate monthly data from Directus ──

async function aggregateMonthlyData(company = 'HYPERVISUAL') {
  const period = getPreviousMonthRange();

  // Parallel fetches for performance
  const [
    paidInvoices,
    paidSupplierInvoices,
    newProjects,
    completedProjects,
    newLeads,
    wonLeads,
    totalLeads,
    topClients
  ] = await Promise.all([
    // Total revenue: SUM of paid client_invoices in period
    directusGet('/items/client_invoices', {
      filter: JSON.stringify({
        _and: [
          { status: { _eq: 'paid' } },
          { payment_date: { _gte: period.start } },
          { payment_date: { _lte: period.end } },
          ...(company ? [{ owner_company: { _eq: company } }] : [])
        ]
      }),
      'aggregate[sum]': 'amount',
      'aggregate[count]': 'id'
    }).catch(() => [{ sum: { amount: 0 }, count: { id: 0 } }]),

    // Total expenses: SUM of paid supplier_invoices in period
    directusGet('/items/supplier_invoices', {
      filter: JSON.stringify({
        _and: [
          { status: { _in: ['paid', 'approved'] } },
          { date_paid: { _gte: period.start } },
          { date_paid: { _lte: period.end } },
          ...(company ? [{ owner_company: { _eq: company } }] : [])
        ]
      }),
      'aggregate[sum]': 'total_ttc',
      'aggregate[count]': 'id'
    }).catch(() => [{ sum: { total_ttc: 0 }, count: { id: 0 } }]),

    // New projects started in period
    directusGet('/items/projects', {
      filter: JSON.stringify({
        _and: [
          { date_created: { _gte: period.start } },
          { date_created: { _lte: `${period.end}T23:59:59` } },
          ...(company ? [{ owner_company: { _eq: company } }] : [])
        ]
      }),
      'aggregate[count]': 'id'
    }).catch(() => [{ count: { id: 0 } }]),

    // Completed projects in period
    directusGet('/items/projects', {
      filter: JSON.stringify({
        _and: [
          { status: { _eq: 'completed' } },
          { completed_at: { _gte: period.start } },
          { completed_at: { _lte: `${period.end}T23:59:59` } },
          ...(company ? [{ owner_company: { _eq: company } }] : [])
        ]
      }),
      'aggregate[count]': 'id'
    }).catch(() => [{ count: { id: 0 } }]),

    // New leads in period
    directusGet('/items/leads', {
      filter: JSON.stringify({
        _and: [
          { date_created: { _gte: period.start } },
          { date_created: { _lte: `${period.end}T23:59:59` } },
          ...(company ? [{ owner_company: { _eq: company } }] : [])
        ]
      }),
      'aggregate[count]': 'id'
    }).catch(() => [{ count: { id: 0 } }]),

    // Won leads in period
    directusGet('/items/leads', {
      filter: JSON.stringify({
        _and: [
          { status: { _eq: 'won' } },
          { date_created: { _gte: period.start } },
          { date_created: { _lte: `${period.end}T23:59:59` } },
          ...(company ? [{ owner_company: { _eq: company } }] : [])
        ]
      }),
      'aggregate[count]': 'id'
    }).catch(() => [{ count: { id: 0 } }]),

    // Total leads ever (for context)
    directusGet('/items/leads', {
      ...(company ? { 'filter[owner_company][_eq]': company } : {}),
      'aggregate[count]': 'id'
    }).catch(() => [{ count: { id: 0 } }]),

    // Top 5 clients by revenue in period
    directusGet('/items/client_invoices', {
      filter: JSON.stringify({
        _and: [
          { status: { _eq: 'paid' } },
          { payment_date: { _gte: period.start } },
          { payment_date: { _lte: period.end } },
          ...(company ? [{ owner_company: { _eq: company } }] : [])
        ]
      }),
      fields: 'contact_id.first_name,contact_id.last_name,contact_id.id,amount',
      limit: -1
    }).catch(() => [])
  ]);

  // Parse results
  const revenue = parseFloat(paidInvoices[0]?.sum?.amount || 0);
  const revenueCount = parseInt(paidInvoices[0]?.count?.id || 0);
  const expenses = parseFloat(paidSupplierInvoices[0]?.sum?.total_ttc || 0);
  const expensesCount = parseInt(paidSupplierInvoices[0]?.count?.id || 0);
  const newProjectsCount = parseInt(newProjects[0]?.count?.id || 0);
  const completedProjectsCount = parseInt(completedProjects[0]?.count?.id || 0);
  const newLeadsCount = parseInt(newLeads[0]?.count?.id || 0);
  const wonLeadsCount = parseInt(wonLeads[0]?.count?.id || 0);
  const totalLeadsCount = parseInt(totalLeads[0]?.count?.id || 0);
  const conversionRate = newLeadsCount > 0 ? Math.round((wonLeadsCount / newLeadsCount) * 100) : 0;

  // Compute top 5 clients by revenue
  const clientRevenue = {};
  for (const inv of (Array.isArray(topClients) ? topClients : [])) {
    const contact = inv.contact_id;
    if (!contact) continue;
    const clientName = `${contact.first_name || ''} ${contact.last_name || ''}`.trim() || `Contact #${contact.id || 'inconnu'}`;
    clientRevenue[clientName] = (clientRevenue[clientName] || 0) + parseFloat(inv.amount || 0);
  }
  const top5Clients = Object.entries(clientRevenue)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, total]) => ({ name, revenue: total }));

  return {
    period,
    company,
    revenue: { total: revenue, count: revenueCount },
    expenses: { total: expenses, count: expensesCount },
    profit: revenue - expenses,
    projects: { new: newProjectsCount, completed: completedProjectsCount },
    leads: { new: newLeadsCount, won: wonLeadsCount, total: totalLeadsCount, conversion_rate: conversionRate },
    top5Clients
  };
}

// ── Core: Generate Claude AI executive summary ──

async function generateExecutiveSummary(data) {
  try {
    const client = getAnthropicClient();

    const dataContext = `
Rapport mensuel ${data.period.label} pour ${data.company}:
- Chiffre d'affaires: ${formatCHF(data.revenue.total)} (${data.revenue.count} factures)
- Depenses: ${formatCHF(data.expenses.total)} (${data.expenses.count} factures fournisseurs)
- Resultat net: ${formatCHF(data.profit)}
- Projets demarres: ${data.projects.new}
- Projets termines: ${data.projects.completed}
- Nouveaux leads: ${data.leads.new}
- Leads gagnes: ${data.leads.won}
- Taux de conversion: ${data.leads.conversion_rate}%
- Top clients: ${data.top5Clients.map(c => `${c.name} (${formatCHF(c.revenue)})`).join(', ') || 'aucun'}`;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      system: 'Tu es un analyste financier pour une PME suisse specialisee en digital signage. Redige un resume executif en francais (3-5 phrases) du rapport mensuel. Sois concis, factuel et actionnable. Identifie les tendances cles et recommandations. Ne mets pas de titre ni de formatage markdown.',
      messages: [
        { role: 'user', content: dataContext }
      ]
    });

    return response.content[0]?.text || '';
  } catch (err) {
    console.warn(`[${WORKFLOW_NAME}] Claude AI summary indisponible: ${err.message}`);
    return `Rapport mensuel ${data.period.label}: CA de ${formatCHF(data.revenue.total)} pour des depenses de ${formatCHF(data.expenses.total)}, soit un resultat de ${formatCHF(data.profit)}. ${data.leads.new} nouveaux leads avec un taux de conversion de ${data.leads.conversion_rate}%.`;
  }
}

// ── Core: Build HTML email ──

function buildReportHTML(data, summary) {
  const fmtCHF = (v) => formatCHF(v);
  const profitColor = data.profit >= 0 ? '#059669' : '#dc2626';

  const clientRows = data.top5Clients.length > 0
    ? data.top5Clients.map((c, i) => `
      <tr style="${i % 2 === 0 ? 'background:#f8fafc;' : ''}">
        <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;">${i + 1}. ${c.name}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:600;">${fmtCHF(c.revenue)}</td>
      </tr>`).join('')
    : '<tr><td colspan="2" style="padding:12px;text-align:center;color:#94a3b8;">Aucune donnee disponible</td></tr>';

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f1f5f9;padding:20px;margin:0;">
<div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);">

  <!-- Header -->
  <div style="background:#18181b;padding:28px 24px;color:white;">
    <h1 style="margin:0;font-size:22px;font-weight:700;letter-spacing:-0.5px;">Rapport Mensuel</h1>
    <p style="margin:6px 0 0;font-size:15px;color:#a1a1aa;">${data.period.label} — ${data.company}</p>
  </div>

  <div style="padding:28px 24px;">
    <!-- Resume executif (Claude AI) -->
    <div style="background:#f0f9ff;border-left:4px solid #3b82f6;padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:28px;">
      <h3 style="margin:0 0 8px;font-size:13px;color:#3b82f6;text-transform:uppercase;letter-spacing:0.5px;">Resume executif</h3>
      <p style="margin:0;font-size:14px;line-height:1.6;color:#1e293b;">${summary}</p>
    </div>

    <!-- KPIs principaux -->
    <h2 style="font-size:15px;color:#18181b;margin:0 0 16px;font-weight:600;">Indicateurs financiers</h2>
    <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:24px;">
      <tr style="background:#f8fafc;">
        <td style="padding:12px;border-bottom:1px solid #e2e8f0;font-weight:600;">Chiffre d'affaires</td>
        <td style="padding:12px;border-bottom:1px solid #e2e8f0;text-align:right;font-size:16px;font-weight:700;color:#18181b;">${fmtCHF(data.revenue.total)}</td>
      </tr>
      <tr>
        <td style="padding:12px;border-bottom:1px solid #e2e8f0;font-weight:600;">Depenses</td>
        <td style="padding:12px;border-bottom:1px solid #e2e8f0;text-align:right;font-size:16px;font-weight:700;color:#dc2626;">${fmtCHF(data.expenses.total)}</td>
      </tr>
      <tr style="background:#f8fafc;">
        <td style="padding:12px;border-bottom:2px solid #18181b;font-weight:700;">Resultat net</td>
        <td style="padding:12px;border-bottom:2px solid #18181b;text-align:right;font-size:18px;font-weight:700;color:${profitColor};">${fmtCHF(data.profit)}</td>
      </tr>
    </table>

    <!-- Projets -->
    <h2 style="font-size:15px;color:#18181b;margin:0 0 16px;font-weight:600;">Projets</h2>
    <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:24px;">
      <tr style="background:#f8fafc;">
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;">Projets demarres</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:600;">${data.projects.new}</td>
      </tr>
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;">Projets termines</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:600;">${data.projects.completed}</td>
      </tr>
    </table>

    <!-- Leads -->
    <h2 style="font-size:15px;color:#18181b;margin:0 0 16px;font-weight:600;">Leads & Commercial</h2>
    <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:24px;">
      <tr style="background:#f8fafc;">
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;">Nouveaux leads</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:600;">${data.leads.new}</td>
      </tr>
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;">Leads gagnes</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:600;color:#059669;">${data.leads.won}</td>
      </tr>
      <tr style="background:#f8fafc;">
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;">Taux de conversion</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:700;font-size:16px;">${data.leads.conversion_rate}%</td>
      </tr>
    </table>

    <!-- Top 5 clients -->
    <h2 style="font-size:15px;color:#18181b;margin:0 0 16px;font-weight:600;">Top 5 clients par CA</h2>
    <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:24px;">
      ${clientRows}
    </table>
  </div>

  <!-- Footer -->
  <div style="background:#fafafa;padding:16px 24px;text-align:center;border-top:1px solid #e2e8f0;">
    <p style="margin:0;font-size:12px;color:#a1a1aa;">Rapport genere automatiquement par HYPERVISUAL Unified Platform</p>
    <p style="margin:4px 0 0;font-size:11px;color:#d4d4d8;">Genere le ${new Date().toLocaleDateString('fr-CH', { day: '2-digit', month: '2-digit', year: 'numeric' })} a ${new Date().toLocaleTimeString('fr-CH', { hour: '2-digit', minute: '2-digit' })}</p>
  </div>
</div>
</body></html>`;
}

// ── Core: Send email via Mautic ──

async function sendReportEmail(to, subject, htmlContent) {
  try {
    const mauticUser = process.env.MAUTIC_USER || process.env.MAUTIC_USERNAME || 'admin';
    const mauticPassword = process.env.MAUTIC_PASSWORD || '';
    if (!mauticPassword) {
      console.warn(`[${WORKFLOW_NAME}] WARNING: MAUTIC_PASSWORD is not set. Email sending will likely fail.`);
    }

    const res = await axios.post(`${MAUTIC_URL}/api/emails/new`, {
      name: subject,
      subject,
      customHtml: htmlContent,
      emailType: 'template'
    }, {
      headers: { 'Content-Type': 'application/json' },
      auth: {
        username: mauticUser,
        password: mauticPassword
      },
      timeout: 15000
    });

    if (res.data?.email?.id) {
      await axios.post(`${MAUTIC_URL}/api/emails/${res.data.email.id}/contact/send`, {
        tokens: {},
        to
      }, {
        headers: { 'Content-Type': 'application/json' },
        auth: {
          username: mauticUser,
          password: mauticPassword
        },
        timeout: 15000
      });
    }

    return { success: true };
  } catch (err) {
    console.warn(`[${WORKFLOW_NAME}] Mautic erreur:`, err.message);
    return { success: false, error: err.message };
  }
}

// ── Core: Full report generation and send ──

async function generateAndSendReport(company = 'HYPERVISUAL', email = CEO_EMAIL) {
  const startTime = Date.now();

  // 1. Aggregate data
  const data = await aggregateMonthlyData(company);

  // 2. Generate AI executive summary
  const summary = await generateExecutiveSummary(data);

  // 3. Build HTML email
  const html = buildReportHTML(data, summary);
  const subject = `Rapport mensuel ${data.period.label} — ${company}`;

  // 4. Send via Mautic
  const sendResult = await sendReportEmail(email, subject, html);

  // 5. Create KPI record in Directus
  try {
    await directusPost('/items/kpis', {
      metric_name: 'monthly_revenue',
      value: data.revenue.total,
      date: data.period.start,
      owner_company: company,
      metadata: {
        expenses: data.expenses.total,
        profit: data.profit,
        leads_new: data.leads.new,
        conversion_rate: data.leads.conversion_rate,
        projects_new: data.projects.new,
        projects_completed: data.projects.completed
      }
    });
  } catch (kpiErr) {
    console.warn(`[${WORKFLOW_NAME}] KPI record non cree:`, kpiErr.message);
  }

  // 6. Log to workflow_executions
  const duration = Date.now() - startTime;
  await logWorkflowExecution({
    workflow: WORKFLOW_NAME,
    entity_type: 'report',
    entity_id: `${data.period.year}-${String(data.period.month).padStart(2, '0')}`,
    status: sendResult.success ? 'success' : 'partial',
    input: { company, period: data.period.label, email },
    output: {
      revenue: data.revenue.total,
      expenses: data.expenses.total,
      profit: data.profit,
      leads_new: data.leads.new,
      email_sent: sendResult.success,
      duration_ms: duration
    }
  });

  return { data, summary, html, sendResult, duration };
}

// ── Routes ──

/**
 * GET /preview — Preview the monthly report HTML
 */
router.get('/preview', async (req, res) => {
  try {
    const company = req.query.company || 'HYPERVISUAL';
    const data = await aggregateMonthlyData(company);
    const summary = await generateExecutiveSummary(data);
    const html = buildReportHTML(data, summary);
    res.type('html').send(html);
  } catch (error) {
    console.error(`[${WORKFLOW_NAME}] Erreur preview:`, error.message);
    res.status(500).json({ error: 'Erreur generation rapport', details: error.message });
  }
});

/**
 * POST /send — Manual send trigger
 */
router.post('/send', async (req, res) => {
  try {
    const company = req.body?.company || 'HYPERVISUAL';
    const email = req.body?.email || CEO_EMAIL;

    const result = await generateAndSendReport(company, email);

    res.json({
      success: true,
      period: result.data.period.label,
      sent_to: email,
      email_sent: result.sendResult.success,
      revenue: formatCHF(result.data.revenue.total),
      expenses: formatCHF(result.data.expenses.total),
      profit: formatCHF(result.data.profit),
      leads_new: result.data.leads.new,
      conversion_rate: `${result.data.leads.conversion_rate}%`,
      duration_ms: result.duration
    });
  } catch (error) {
    console.error(`[${WORKFLOW_NAME}] Erreur envoi:`, error.message);
    res.status(500).json({ error: 'Erreur envoi rapport mensuel', details: error.message });
  }
});

// ── CRON: 1st of month at 08:00 ──

export function startMonthlyCron() {
  function scheduleNext() {
    const now = new Date();

    // Calculate next 1st of month at 08:00
    let next = new Date(now.getFullYear(), now.getMonth(), 1, 8, 0, 0, 0);

    // If we're past the 1st at 08:00, schedule for next month
    if (next <= now) {
      next = new Date(now.getFullYear(), now.getMonth() + 1, 1, 8, 0, 0, 0);
    }

    const delay = next.getTime() - now.getTime();
    const delayHours = Math.round(delay / 3600000);

    console.log(`[${WORKFLOW_NAME}] Prochain rapport mensuel prevu le ${next.toLocaleDateString('fr-CH')} a 08:00 (dans ${delayHours}h)`);

    setTimeout(async () => {
      try {
        const monthKey = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`;

        // Anti-doublon check
        const alreadySent = await checkAutomationLog(WORKFLOW_NAME, monthKey, next.toISOString().split('T')[0]);
        if (alreadySent) {
          console.log(`[${WORKFLOW_NAME}] Rapport deja envoye pour ${monthKey} — ignore`);
        } else {
          console.log(`[${WORKFLOW_NAME}] Generation et envoi du rapport mensuel...`);
          const result = await generateAndSendReport('HYPERVISUAL', CEO_EMAIL);
          console.log(`[${WORKFLOW_NAME}] Rapport envoye: ${result.sendResult.success ? 'OK' : 'ECHEC'} (${result.duration}ms)`);
        }
      } catch (err) {
        console.error(`[${WORKFLOW_NAME}] CRON erreur:`, err.message);

        // Log failure
        await logWorkflowExecution({
          workflow: WORKFLOW_NAME,
          entity_type: 'report',
          entity_id: 'cron-error',
          status: 'failed',
          input: { trigger: 'cron' },
          output: { error: err.message }
        });
      }

      // Schedule next month
      scheduleNext();
    }, delay);
  }

  scheduleNext();
}

export default router;
