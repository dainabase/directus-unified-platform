/**
 * Daily CEO Report — Phase J-03
 * CRON 0 7 * * * (07h00 chaque matin)
 * POST /report/send — envoi manuel immédiat
 * GET /report/preview — preview HTML du rapport
 *
 * Dépendance: Mautic Phase E actif
 */

import { Router } from 'express';
import axios from 'axios';
import { directusGet, logAutomation, checkAutomationLog } from '../../lib/financeUtils.js';

const router = Router();

const MAUTIC_URL = process.env.MAUTIC_URL || 'http://localhost:8080';
const CEO_EMAIL = process.env.CEO_EMAIL || 'jean@hypervisual.ch';

/**
 * Build the CEO daily report data.
 */
async function buildReportData(company = 'HYPERVISUAL') {
  // 1. KPIs
  const allKpis = await directusGet('/items/kpis', {
    'filter[owner_company][_eq]': company,
    sort: '-date',
    limit: 200,
    fields: 'metric_name,value,date'
  }).catch(() => []);

  const latestKpis = {};
  const previousKpis = {};
  for (const kpi of allKpis) {
    if (!latestKpis[kpi.metric_name]) {
      latestKpis[kpi.metric_name] = parseFloat(kpi.value || 0);
    } else if (!previousKpis[kpi.metric_name]) {
      previousKpis[kpi.metric_name] = parseFloat(kpi.value || 0);
    }
  }

  // 2. Alerts (threshold check — same 6 metrics as thresholds.js)
  const alerts = [];
  const thresholds = {
    MRR:     { warning: 60000,  critical: 40000 },
    ARR:     { warning: 700000, critical: 500000 },
    RUNWAY:  { warning: 6,      critical: 3 },
    NPS:     { warning: 50,     critical: 30 },
    LTV_CAC: { warning: 3,      critical: 2 },
    EBITDA:  { warning: 0,      critical: -10000 }
  };

  for (const [metric, thresh] of Object.entries(thresholds)) {
    const val = latestKpis[metric];
    if (val !== undefined) {
      if (val <= thresh.critical) alerts.push({ metric, level: 'critical', value: val });
      else if (val <= thresh.warning) alerts.push({ metric, level: 'warning', value: val });
    }
  }

  // 3. Operational data
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
      'aggregate[sum]': 'amount'
    }).catch(() => [{ sum: { amount: 0 } }]),
    directusGet('/items/supplier_invoices', {
      'filter[owner_company][_eq]': company,
      'filter[status][_eq]': 'pending',
      'aggregate[count]': 'id'
    }).catch(() => [{ count: { id: 0 } }])
  ]);

  // 4. Treasury forecast — call internal API logic
  let treasuryData = null;
  try {
    const axios = (await import('axios')).default;
    const port = process.env.UNIFIED_PORT || process.env.PORT || 3000;
    const treasuryRes = await axios.get(`http://localhost:${port}/api/kpis/treasury`, {
      params: { company },
      timeout: 5000
    });
    if (treasuryRes.data) {
      treasuryData = {
        current_balance: treasuryRes.data.current_balance || 0,
        d30: treasuryRes.data.d30?.balance || 0,
        d60: treasuryRes.data.d60?.balance || 0,
        d90: treasuryRes.data.d90?.balance || 0,
        burn_rate: treasuryRes.data.burn_rate_monthly || 0,
        runway: treasuryRes.data.runway_months || 0
      };
    }
  } catch {
    // Treasury API unavailable — fallback to basic balance
    try {
      const lastTx = await directusGet('/items/bank_transactions', {
        'filter[owner_company][_eq]': company,
        sort: '-date',
        limit: 1,
        fields: 'balance_after'
      });
      if (lastTx && lastTx.length > 0) {
        const balance = parseFloat(lastTx[0].balance_after || 0);
        treasuryData = { current_balance: balance, d30: null, d60: null, d90: null };
      }
    } catch {
      // Treasury data completely unavailable
    }
  }

  return {
    date: new Date().toLocaleDateString('fr-CH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
    company,
    kpis: latestKpis,
    previousKpis,
    alerts,
    operations: {
      active_projects: parseInt(activeProjects[0]?.count?.id || 0),
      pending_invoices_chf: parseFloat(pendingInvoices[0]?.sum?.amount || 0),
      pending_invoices_count: parseInt(pendingInvoices[0]?.count?.id || 0),
      overdue_invoices_chf: parseFloat(overdueInvoices[0]?.sum?.amount || 0),
      pending_approvals: parseInt(pendingApprovals[0]?.count?.id || 0)
    },
    treasury: treasuryData
  };
}

/**
 * Generate HTML email from report data.
 */
function generateEmailHTML(data) {
  const fmtCHF = (v) => `CHF ${Math.round(v || 0).toLocaleString('fr-CH')}`;
  const variation = (metric) => {
    const curr = data.kpis[metric];
    const prev = data.previousKpis[metric];
    if (!curr || !prev || prev === 0) return '';
    const pct = (((curr - prev) / prev) * 100).toFixed(1);
    const sign = pct >= 0 ? '+' : '';
    const color = pct >= 0 ? '#22c55e' : '#ef4444';
    return `<span style="color:${color};font-size:12px;margin-left:6px;">${sign}${pct}%</span>`;
  };

  const alertsHTML = data.alerts.length === 0
    ? '<div style="background:#dcfce7;border-left:4px solid #22c55e;padding:12px;border-radius:4px;margin-bottom:16px;"><span style="color:#166534;">Tout est OK — aucune alerte active</span></div>'
    : data.alerts.map(a => {
      const bg = a.level === 'critical' ? '#fef2f2' : '#fffbeb';
      const border = a.level === 'critical' ? '#ef4444' : '#f59e0b';
      const color = a.level === 'critical' ? '#991b1b' : '#92400e';
      const icon = a.level === 'critical' ? '🔴' : '🟡';
      return `<div style="background:${bg};border-left:4px solid ${border};padding:12px;border-radius:4px;margin-bottom:8px;"><span style="color:${color};">${icon} ${a.metric} ${a.level} — ${fmtCHF(a.value)}</span></div>`;
    }).join('');

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f8fafc;padding:20px;margin:0;">
<div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.05);">

  <!-- Header -->
  <div style="background:linear-gradient(135deg,#1e40af,#3b82f6);padding:24px;color:white;">
    <h1 style="margin:0;font-size:20px;">Rapport CEO — ${data.company}</h1>
    <p style="margin:4px 0 0;font-size:14px;opacity:0.9;">${data.date}</p>
  </div>

  <div style="padding:24px;">
    <!-- Alertes -->
    <h2 style="font-size:16px;color:#1e293b;margin:0 0 12px;">Alertes</h2>
    ${alertsHTML}

    <!-- KPIs -->
    <h2 style="font-size:16px;color:#1e293b;margin:24px 0 12px;">KPIs</h2>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <tr style="background:#f8fafc;">
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;font-weight:600;">MRR</td>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:right;">${fmtCHF(data.kpis.MRR)}${variation('MRR')}</td>
      </tr>
      <tr>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;font-weight:600;">ARR</td>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:right;">${fmtCHF(data.kpis.ARR)}${variation('ARR')}</td>
      </tr>
      <tr style="background:#f8fafc;">
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;font-weight:600;">NPS</td>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:right;">${(data.kpis.NPS || 0).toFixed(1)} pts${variation('NPS')}</td>
      </tr>
      <tr>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;font-weight:600;">LTV/CAC</td>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:right;">${(data.kpis.LTV_CAC || 0).toFixed(2)}x${variation('LTV_CAC')}</td>
      </tr>
    </table>

    <!-- Operations -->
    <h2 style="font-size:16px;color:#1e293b;margin:24px 0 12px;">Operations</h2>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <tr style="background:#f8fafc;">
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;">Projets actifs</td>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:600;">${data.operations.active_projects}</td>
      </tr>
      <tr>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;">Factures en attente</td>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:600;">${fmtCHF(data.operations.pending_invoices_chf)} (${data.operations.pending_invoices_count})</td>
      </tr>
      <tr style="background:#f8fafc;">
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;">Factures en retard</td>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:600;color:#ef4444;">${fmtCHF(data.operations.overdue_invoices_chf)}</td>
      </tr>
      <tr>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;">Approbations fournisseurs</td>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:600;">${data.operations.pending_approvals}</td>
      </tr>
    </table>

    ${data.treasury ? `
    <!-- Tresorerie -->
    <h2 style="font-size:16px;color:#1e293b;margin:24px 0 12px;">Tresorerie previsionnelle</h2>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <tr style="background:#f8fafc;">
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;">Solde actuel</td>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:600;">${fmtCHF(data.treasury.current_balance)}</td>
      </tr>
      <tr>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;">+30 jours</td>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:right;">${data.treasury.d30 != null ? fmtCHF(data.treasury.d30) : '<span style="color:#94a3b8;">N/D</span>'}</td>
      </tr>
      <tr style="background:#f8fafc;">
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;">+60 jours</td>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:right;">${data.treasury.d60 != null ? fmtCHF(data.treasury.d60) : '<span style="color:#94a3b8;">N/D</span>'}</td>
      </tr>
      <tr>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;">+90 jours</td>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:right;">${data.treasury.d90 != null ? fmtCHF(data.treasury.d90) : '<span style="color:#94a3b8;">N/D</span>'}</td>
      </tr>
    </table>` : ''}
  </div>

  <!-- Footer -->
  <div style="background:#f8fafc;padding:16px 24px;text-align:center;border-top:1px solid #e2e8f0;">
    <p style="margin:0;font-size:12px;color:#94a3b8;">Rapport genere automatiquement par HYPERVISUAL Unified Platform</p>
  </div>
</div>
</body></html>`;
}

/**
 * Send email via Mautic API.
 */
async function sendEmailViaMautic(to, subject, htmlContent) {
  try {
    const res = await axios.post(`${MAUTIC_URL}/api/emails/new`, {
      name: subject,
      subject: subject,
      customHtml: htmlContent,
      emailType: 'template'
    }, {
      headers: { 'Content-Type': 'application/json' },
      auth: {
        username: process.env.MAUTIC_USER || 'admin',
        password: process.env.MAUTIC_PASSWORD || 'admin'
      },
      timeout: 10000
    });

    // Send the email to the CEO
    if (res.data?.email?.id) {
      await axios.post(`${MAUTIC_URL}/api/emails/${res.data.email.id}/contact/send`, {
        tokens: {},
        to: to
      }, {
        headers: { 'Content-Type': 'application/json' },
        auth: {
          username: process.env.MAUTIC_USER || 'admin',
          password: process.env.MAUTIC_PASSWORD || 'admin'
        },
        timeout: 10000
      });
    }

    return { success: true };
  } catch (err) {
    console.warn('[daily-report] Mautic send failed:', err.message);
    // Fallback: log that we tried
    return { success: false, error: err.message };
  }
}

/**
 * GET /api/kpis/report/preview
 * Preview the email HTML without sending.
 */
router.get('/report/preview', async (req, res) => {
  try {
    const data = await buildReportData(req.query.company || 'HYPERVISUAL');
    const html = generateEmailHTML(data);
    res.type('html').send(html);
  } catch (err) {
    res.status(500).json({ error: 'Erreur génération rapport', details: err.message });
  }
});

/**
 * POST /api/kpis/report/send
 * Send the CEO report immediately (manual trigger).
 */
router.post('/report/send', async (req, res) => {
  try {
    const company = req.body?.company || 'HYPERVISUAL';
    const email = req.body?.email || CEO_EMAIL;

    const data = await buildReportData(company);
    const html = generateEmailHTML(data);
    const subject = `Rapport CEO ${company} — ${data.date}`;

    const result = await sendEmailViaMautic(email, subject, html);

    // Log in automation_logs
    await logAutomation({
      rule_name: 'ceo_daily_report',
      entity_type: 'report',
      entity_id: new Date().toISOString().split('T')[0],
      status: result.success ? 'success' : 'error',
      recipient_email: email,
      error_message: result.error || null
    });

    res.json({
      success: true,
      sent_to: email,
      mautic_status: result.success ? 'sent' : 'failed',
      report_date: data.date,
      alerts_count: data.alerts.length
    });
  } catch (err) {
    console.error('[daily-report] Error:', err.message);
    res.status(500).json({ error: 'Erreur envoi rapport', details: err.message });
  }
});

/**
 * Start the daily CRON job (07h00 each morning).
 */
export function startDailyCEOReport() {
  function scheduleNext() {
    const now = new Date();
    const next = new Date(now);
    next.setHours(7, 0, 0, 0);

    // If 07h00 already passed today, schedule for tomorrow
    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }

    const delay = next.getTime() - now.getTime();
    console.log(`[daily-report] Next CEO report scheduled at ${next.toISOString()} (in ${Math.round(delay / 60000)} min)`);

    setTimeout(async () => {
      try {
        const today = new Date().toISOString().split('T')[0];

        // Anti-doublon check
        const alreadySent = await checkAutomationLog('ceo_daily_report', today, today);
        if (alreadySent) {
          console.log('[daily-report] Already sent today — skipping');
        } else {
          console.log('[daily-report] Generating and sending CEO daily report...');
          const data = await buildReportData('HYPERVISUAL');
          const html = generateEmailHTML(data);
          const subject = `Rapport CEO HYPERVISUAL — ${data.date}`;

          const result = await sendEmailViaMautic(CEO_EMAIL, subject, html);
          await logAutomation({
            rule_name: 'ceo_daily_report',
            entity_type: 'report',
            entity_id: today,
            status: result.success ? 'success' : 'error',
            recipient_email: CEO_EMAIL,
            error_message: result.error || null
          });
          console.log(`[daily-report] Report sent: ${result.success ? 'OK' : 'FAILED'}`);
        }
      } catch (err) {
        console.error('[daily-report] CRON error:', err.message);
      }

      // Schedule next day
      scheduleNext();
    }, delay);
  }

  scheduleNext();
}

export default router;
