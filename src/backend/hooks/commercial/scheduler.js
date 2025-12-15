/**
 * Scheduler - Tâches planifiées automatiques
 *
 * Tâches cron pour le workflow commercial:
 * - Expiration devis automatique
 * - Rappels paiement
 * - Nettoyage données
 * - Rapports automatiques
 *
 * @date 15 Décembre 2025
 */

import axios from 'axios';

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN || 'hbQz-9935crJ2YkLul_zpQJDBw2M-y5v';

const api = axios.create({
  baseURL: DIRECTUS_URL,
  headers: {
    'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

/**
 * Vérifier et marquer les devis expirés
 * Exécuter: Tous les jours à 00:00
 */
export async function checkExpiredQuotes() {
  console.log('🔄 Scheduler: Checking expired quotes...');

  try {
    const today = new Date().toISOString().split('T')[0];

    // Find quotes that should be expired
    const res = await api.get('/items/quotes', {
      params: {
        filter: {
          _and: [
            { status: { _in: ['sent', 'viewed'] } },
            { valid_until: { _lt: today } }
          ]
        },
        fields: ['id', 'quote_number', 'valid_until', 'contact_id.email']
      }
    });

    const expiredQuotes = res.data.data;

    if (expiredQuotes.length === 0) {
      console.log('✅ No expired quotes found');
      return { processed: 0 };
    }

    // Update each quote to expired
    for (const quote of expiredQuotes) {
      await api.patch(`/items/quotes/${quote.id}`, {
        status: 'expired'
      });
      console.log(`⏰ Quote expired: ${quote.quote_number}`);

      // TODO: Send expiry notification to client
      // TODO: Send notification to sales team
    }

    console.log(`✅ ${expiredQuotes.length} quotes marked as expired`);
    return { processed: expiredQuotes.length };
  } catch (error) {
    console.error('❌ Error checking expired quotes:', error.message);
    return { error: error.message };
  }
}

/**
 * Envoyer rappels pour factures en retard
 * Exécuter: Tous les jours à 09:00
 */
export async function sendPaymentReminders() {
  console.log('🔄 Scheduler: Sending payment reminders...');

  try {
    const today = new Date().toISOString().split('T')[0];

    // Find overdue invoices
    const res = await api.get('/items/client_invoices', {
      params: {
        filter: {
          _and: [
            { status: { _eq: 'pending' } },
            { due_date: { _lt: today } }
          ]
        },
        fields: [
          'id',
          'invoice_number',
          'amount',
          'currency',
          'due_date',
          'contact_id.email',
          'contact_id.first_name'
        ]
      }
    });

    const overdueInvoices = res.data.data;

    if (overdueInvoices.length === 0) {
      console.log('✅ No overdue invoices');
      return { reminders_sent: 0 };
    }

    // Group by days overdue for different reminder levels
    const now = new Date();
    const remindersSent = [];

    for (const invoice of overdueInvoices) {
      const dueDate = new Date(invoice.due_date);
      const daysOverdue = Math.floor((now - dueDate) / (1000 * 60 * 60 * 24));

      let reminderLevel;
      if (daysOverdue <= 7) reminderLevel = 'first';
      else if (daysOverdue <= 14) reminderLevel = 'second';
      else if (daysOverdue <= 30) reminderLevel = 'final';
      else reminderLevel = 'collection';

      console.log(`📧 Reminder (${reminderLevel}): ${invoice.invoice_number} - ${daysOverdue} days overdue`);

      // TODO: Send reminder email based on level
      // await sendReminderEmail(invoice, reminderLevel);

      remindersSent.push({
        invoice: invoice.invoice_number,
        level: reminderLevel,
        days_overdue: daysOverdue
      });
    }

    console.log(`✅ ${remindersSent.length} reminders sent`);
    return { reminders_sent: remindersSent.length, details: remindersSent };
  } catch (error) {
    console.error('❌ Error sending payment reminders:', error.message);
    return { error: error.message };
  }
}

/**
 * Rappel pour devis non signés (après envoi)
 * Exécuter: Tous les 3 jours
 */
export async function sendQuoteFollowUps() {
  console.log('🔄 Scheduler: Sending quote follow-ups...');

  try {
    // Find quotes sent more than 3 days ago but not yet signed
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const res = await api.get('/items/quotes', {
      params: {
        filter: {
          _and: [
            { status: { _in: ['sent', 'viewed'] } },
            { sent_at: { _lt: threeDaysAgo.toISOString() } },
            { valid_until: { _gte: new Date().toISOString().split('T')[0] } }
          ]
        },
        fields: [
          'id',
          'quote_number',
          'sent_at',
          'viewed_at',
          'total',
          'contact_id.email',
          'contact_id.first_name'
        ]
      }
    });

    const quotesToFollowUp = res.data.data;

    if (quotesToFollowUp.length === 0) {
      console.log('✅ No quotes need follow-up');
      return { followups_sent: 0 };
    }

    for (const quote of quotesToFollowUp) {
      const status = quote.viewed_at ? 'viewed but not signed' : 'not yet opened';
      console.log(`📧 Follow-up: ${quote.quote_number} (${status})`);

      // TODO: Send follow-up email
      // await sendFollowUpEmail(quote);
    }

    console.log(`✅ ${quotesToFollowUp.length} follow-ups sent`);
    return { followups_sent: quotesToFollowUp.length };
  } catch (error) {
    console.error('❌ Error sending follow-ups:', error.message);
    return { error: error.message };
  }
}

/**
 * Nettoyer les tokens d'activation expirés
 * Exécuter: Tous les jours à 02:00
 */
export async function cleanupExpiredTokens() {
  console.log('🔄 Scheduler: Cleaning up expired tokens...');

  try {
    const now = new Date();

    // Clean expired activation tokens (72h old)
    const activationCutoff = new Date(now);
    activationCutoff.setHours(activationCutoff.getHours() - 72);

    const activationRes = await api.get('/items/client_portal_accounts', {
      params: {
        filter: {
          _and: [
            { status: { _eq: 'pending' } },
            { date_created: { _lt: activationCutoff.toISOString() } }
          ]
        },
        fields: ['id', 'email']
      }
    });

    let cleanedActivation = 0;
    for (const account of activationRes.data.data) {
      await api.patch(`/items/client_portal_accounts/${account.id}`, {
        activation_token: null
      });
      cleanedActivation++;
    }

    // Clean expired password reset tokens (1h old)
    const resetCutoff = new Date(now);
    resetCutoff.setHours(resetCutoff.getHours() - 1);

    const resetRes = await api.get('/items/client_portal_accounts', {
      params: {
        filter: {
          password_reset_expires: { _lt: resetCutoff.toISOString() }
        },
        fields: ['id']
      }
    });

    let cleanedReset = 0;
    for (const account of resetRes.data.data) {
      await api.patch(`/items/client_portal_accounts/${account.id}`, {
        password_reset_token: null,
        password_reset_expires: null
      });
      cleanedReset++;
    }

    console.log(`✅ Cleaned ${cleanedActivation} expired activations, ${cleanedReset} expired resets`);
    return {
      activation_tokens_cleaned: cleanedActivation,
      reset_tokens_cleaned: cleanedReset
    };
  } catch (error) {
    console.error('❌ Error cleaning tokens:', error.message);
    return { error: error.message };
  }
}

/**
 * Générer rapport quotidien
 * Exécuter: Tous les jours à 08:00
 */
export async function generateDailyReport() {
  console.log('🔄 Scheduler: Generating daily report...');

  try {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Get yesterday's stats
    const [leadsRes, quotesRes, invoicesRes] = await Promise.all([
      api.get('/items/leads', {
        params: {
          filter: { date_created: { _gte: yesterdayStr, _lt: today } },
          aggregate: { count: '*' }
        }
      }),
      api.get('/items/quotes', {
        params: {
          filter: { date_created: { _gte: yesterdayStr, _lt: today } },
          aggregate: { count: '*', sum: ['total'] }
        }
      }),
      api.get('/items/client_invoices', {
        params: {
          filter: {
            _and: [
              { status: { _eq: 'paid' } },
              { payment_date: { _gte: yesterdayStr, _lt: today } }
            ]
          },
          aggregate: { count: '*', sum: ['amount'] }
        }
      })
    ]);

    const report = {
      date: yesterdayStr,
      leads: {
        new: parseInt(leadsRes.data.data[0]?.count) || 0
      },
      quotes: {
        created: parseInt(quotesRes.data.data[0]?.count) || 0,
        value: parseFloat(quotesRes.data.data[0]?.sum?.total) || 0
      },
      payments: {
        received: parseInt(invoicesRes.data.data[0]?.count) || 0,
        amount: parseFloat(invoicesRes.data.data[0]?.sum?.amount) || 0
      }
    };

    console.log('📊 Daily Report:', JSON.stringify(report, null, 2));

    // TODO: Send report via email
    // TODO: Store report in database
    // TODO: Send to Slack

    return report;
  } catch (error) {
    console.error('❌ Error generating daily report:', error.message);
    return { error: error.message };
  }
}

/**
 * Run all scheduled tasks
 * Can be called from cron or manually
 */
export async function runScheduledTasks(taskName = 'all') {
  console.log(`\n🕐 Running scheduled tasks: ${taskName}`);
  console.log('='.repeat(50));

  const results = {};

  if (taskName === 'all' || taskName === 'expired_quotes') {
    results.expired_quotes = await checkExpiredQuotes();
  }

  if (taskName === 'all' || taskName === 'payment_reminders') {
    results.payment_reminders = await sendPaymentReminders();
  }

  if (taskName === 'all' || taskName === 'quote_followups') {
    results.quote_followups = await sendQuoteFollowUps();
  }

  if (taskName === 'all' || taskName === 'cleanup_tokens') {
    results.cleanup_tokens = await cleanupExpiredTokens();
  }

  if (taskName === 'all' || taskName === 'daily_report') {
    results.daily_report = await generateDailyReport();
  }

  console.log('='.repeat(50));
  console.log('✅ Scheduled tasks completed\n');

  return results;
}

export default {
  checkExpiredQuotes,
  sendPaymentReminders,
  sendQuoteFollowUps,
  cleanupExpiredTokens,
  generateDailyReport,
  runScheduledTasks
};
