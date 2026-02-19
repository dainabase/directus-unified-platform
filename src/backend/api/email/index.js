/**
 * Email Automation Router — Phase E
 * Routes pour emails transactionnels via Mautic
 * Tous les emails passent par Mautic — jamais nodemailer direct
 */

import express from 'express';
import axios from 'axios';
import MauticAPI from '../mautic/index.js';

const router = express.Router();

// Configuration
const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_TOKEN = process.env.DIRECTUS_ADMIN_TOKEN;

const mautic = new MauticAPI({
  baseURL: process.env.MAUTIC_URL || 'http://localhost:8084',
  username: process.env.MAUTIC_USERNAME,
  password: process.env.MAUTIC_PASSWORD
});

// Helper: Directus API call
async function directusGet(path, params = {}) {
  const res = await axios.get(`${DIRECTUS_URL}${path}`, {
    headers: { Authorization: `Bearer ${DIRECTUS_TOKEN}` },
    params
  });
  return res.data.data;
}

async function directusPost(path, data) {
  const res = await axios.post(`${DIRECTUS_URL}${path}`, data, {
    headers: { Authorization: `Bearer ${DIRECTUS_TOKEN}`, 'Content-Type': 'application/json' }
  });
  return res.data.data;
}

// Helper: Log dans automation_logs
async function logAutomation({ rule_name, entity_type, entity_id, status, recipient_email, level, error_message, trigger_data }) {
  try {
    await directusPost('/items/automation_logs', {
      rule_name,
      entity_type: entity_type || null,
      entity_id: entity_id ? String(entity_id) : null,
      status: status || 'success',
      recipient_email: recipient_email || null,
      level: level || null,
      error_message: error_message || null,
      trigger_data: trigger_data || null
    });
  } catch (err) {
    console.error('[email] Erreur log automation_logs:', err.message);
  }
}

// Helper: Check doublon dans automation_logs (meme jour + meme rule + meme entity)
async function hasSentToday(rule_name, entity_id, level) {
  try {
    const today = new Date().toISOString().split('T')[0];
    const filter = {
      _and: [
        { rule_name: { _eq: rule_name } },
        { entity_id: { _eq: String(entity_id) } },
        { status: { _eq: 'success' } },
        { executed_at: { _gte: `${today}T00:00:00` } }
      ]
    };
    if (level) {
      filter._and.push({ level: { _eq: level } });
    }
    const logs = await directusGet('/items/automation_logs', {
      filter: JSON.stringify(filter),
      limit: 1
    });
    return logs && logs.length > 0;
  } catch {
    return false;
  }
}

// Import story handlers
import leadConfirmationHandler from './lead-confirmation.js';
import quoteSentHandler from './quote-sent.js';
import paymentConfirmedHandler from './payment-confirmed.js';
import invoiceRemindersHandler from './invoice-reminders.js';
import supplierApprovedHandler from './supplier-approved.js';
import providerReminderHandler from './provider-reminder.js';

// Mount routes
router.post('/lead-confirmation', leadConfirmationHandler(mautic, directusGet, directusPost, logAutomation, hasSentToday));
router.post('/quote-sent', quoteSentHandler(mautic, directusGet, directusPost, logAutomation, hasSentToday));
router.post('/payment-confirmed', paymentConfirmedHandler(mautic, directusGet, directusPost, logAutomation, hasSentToday));
router.post('/invoice-reminders', invoiceRemindersHandler(mautic, directusGet, directusPost, logAutomation, hasSentToday));
router.post('/supplier-invoice-approved', supplierApprovedHandler(mautic, directusGet, directusPost, logAutomation, hasSentToday));
router.post('/provider-reminder', providerReminderHandler(mautic, directusGet, directusPost, logAutomation, hasSentToday));

// Health check
router.get('/health', (req, res) => {
  res.json({ success: true, service: 'email-automation', stories: ['E-01', 'E-02', 'E-03', 'E-04', 'E-05', 'E-06'] });
});

export default router;
