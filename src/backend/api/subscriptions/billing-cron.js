/**
 * I-03 — Facturation recurrente automatique (CRON mensuel)
 * CRON quotidien 08h00 → verifie subscriptions actives dont next_billing_date = aujourd'hui
 * POST /api/subscriptions/run-billing — Trigger manuel
 */

import express from 'express';
import { directusGet, directusPost, directusPatch, addDays, addMonths, formatMonthYear, generateInvoiceNumber, logAutomation, checkAutomationLog } from '../../lib/financeUtils.js';
import { calculateNextBillingDate } from './index.js';

const router = express.Router();

async function runRecurringBilling() {
  console.log('[I-03 CRON] Demarrage facturation recurrente...');
  const today = new Date().toISOString().split('T')[0];
  const results = { processed: 0, invoiced: 0, skipped: 0, errors: 0 };

  try {
    const subscriptions = await directusGet('/items/subscriptions', {
      'filter[status][_eq]': 'active',
      'filter[next_billing_date][_lte]': today,
      limit: -1
    });

    if (!subscriptions || subscriptions.length === 0) {
      console.log('[I-03 CRON] Aucun abonnement a facturer');
      return results;
    }

    console.log(`[I-03 CRON] ${subscriptions.length} abonnement(s) a facturer`);

    for (const sub of subscriptions) {
      try {
        results.processed++;

        // Anti-doublon
        const alreadyBilled = await checkAutomationLog('subscription_billed', sub.id, today);
        if (alreadyBilled) {
          results.skipped++;
          continue;
        }

        const amount = parseFloat(sub.amount || 0);
        if (amount <= 0) {
          results.skipped++;
          continue;
        }

        const invoiceNumber = await generateInvoiceNumber('REC');
        const taxRate = 8.1;
        const taxAmount = Math.round(amount * taxRate) / 100;
        const total = Math.round((amount + taxAmount) * 100) / 100;

        const invoice = await directusPost('/items/client_invoices', {
          invoice_number: invoiceNumber,
          project_id: sub.project_id,
          contact_id: sub.contact_id,
          amount,
          tax_rate: taxRate,
          tax_amount: taxAmount,
          total,
          currency: 'CHF',
          status: 'sent',
          due_date: addDays(new Date(), 30),
          description: `Abonnement ${sub.name} — ${formatMonthYear(new Date())}`,
          owner_company: sub.owner_company,
          type: 'recurring',
          subscription_id: String(sub.id)
        });

        // MAJ next_billing_date + last_invoiced_at
        const nextBilling = calculateNextBillingDate(sub.start_date, sub.billing_cycle, new Date());
        await directusPatch(`/items/subscriptions/${sub.id}`, {
          last_invoiced_at: new Date().toISOString(),
          next_billing_date: nextBilling
        });

        await logAutomation({
          rule_name: 'subscription_billed',
          entity_type: 'subscriptions',
          entity_id: String(sub.id),
          status: 'success',
          trigger_data: { invoice_id: invoice.id, invoice_number: invoiceNumber, amount, next_billing: nextBilling }
        });

        console.log(`[I-03 CRON] Facture ${invoiceNumber} generee pour ${sub.name} (CHF ${amount})`);
        results.invoiced++;
      } catch (subError) {
        console.error(`[I-03 CRON] Erreur abonnement ${sub.id}:`, subError.message);
        results.errors++;
      }
    }
  } catch (error) {
    console.error('[I-03 CRON] Erreur globale:', error.message);
  }

  console.log(`[I-03 CRON] Termine: ${results.invoiced} factures, ${results.skipped} ignores, ${results.errors} erreurs`);
  return results;
}

// POST /api/subscriptions/run-billing (trigger manuel)
router.post('/run-billing', async (req, res) => {
  try {
    const results = await runRecurringBilling();
    res.json({ success: true, results });
  } catch (error) {
    console.error('[I-03] Erreur billing manuel:', error.message);
    res.status(500).json({ error: 'Erreur facturation', details: error.message });
  }
});

// CRON quotidien 08h00
function startRecurringBillingCron() {
  console.log('[I-03 CRON] Planifie: facturation recurrente quotidienne 08h00');

  function scheduleNext() {
    const now = new Date();
    const next = new Date(now);
    next.setHours(8, 0, 0, 0);
    if (now >= next) {
      next.setDate(next.getDate() + 1);
    }
    const delay = next.getTime() - now.getTime();
    console.log(`[I-03 CRON] Prochain run dans ${Math.round(delay / 60000)} minutes`);

    setTimeout(async () => {
      await runRecurringBilling();
      scheduleNext();
    }, delay);
  }

  // Premier run 30 secondes apres demarrage (pour tests)
  setTimeout(() => {
    console.log('[I-03 CRON] Premier check initial...');
    runRecurringBilling();
  }, 30000);

  scheduleNext();
}

export { startRecurringBillingCron, runRecurringBilling };
export default router;
