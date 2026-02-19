/**
 * Lead Capture Router — Phase F
 * F-01: WordPress Fluent Form webhook
 * F-03: IMAP email monitor (background polling)
 * F-04: Ringover API polling (background polling)
 * F-02: WhatsApp — reporte Phase F-bis
 *
 * Pattern identique a Phase E : helpers centralises, factory handlers
 */

import express from 'express';
import axios from 'axios';

// Story handlers
import wpWebhookHandler from './wp-webhook.js';
import { startImapMonitor } from './imap-monitor.js';
import { startRingoverPolling } from './ringover-polling.js';

const router = express.Router();

// Configuration Directus
const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_TOKEN = process.env.DIRECTUS_ADMIN_TOKEN;

// ── Helpers Directus (meme pattern que Phase E) ──

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

async function directusPatch(path, data) {
  const res = await axios.patch(`${DIRECTUS_URL}${path}`, data, {
    headers: { Authorization: `Bearer ${DIRECTUS_TOKEN}`, 'Content-Type': 'application/json' }
  });
  return res.data.data;
}

// ── Log dans automation_logs ──

async function logAutomation({ rule_name, entity_type, entity_id, status, recipient_email, error_message, trigger_data }) {
  try {
    await directusPost('/items/automation_logs', {
      rule_name,
      entity_type: entity_type || null,
      entity_id: entity_id ? String(entity_id) : null,
      status: status || 'success',
      recipient_email: recipient_email || null,
      error_message: error_message || null,
      trigger_data: trigger_data || null
    });
  } catch (err) {
    console.error('[leads] Erreur log automation_logs:', err.message);
  }
}

// ── Anti-doublon (fenetre de 30 minutes) ──

async function hasSentRecently(rule_name, entity_id) {
  try {
    const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    const logs = await directusGet('/items/automation_logs', {
      'filter[rule_name][_eq]': rule_name,
      'filter[entity_id][_eq]': String(entity_id),
      'filter[executed_at][_gte]': thirtyMinAgo,
      limit: 1
    });
    return logs && logs.length > 0;
  } catch {
    return false;
  }
}

// ── Routes ──

// F-01 : WordPress Fluent Form webhook
router.post('/wp-webhook', wpWebhookHandler(directusGet, directusPost, directusPatch, logAutomation, hasSentRecently));

// F-03 : IMAP polling trigger manuel (pour tests)
router.post('/imap-scan', async (req, res) => {
  try {
    const { processNewEmails } = await import('./imap-monitor.js');
    const results = await processNewEmails(directusGet, directusPost, directusPatch, logAutomation, hasSentRecently);
    res.json({ success: true, results });
  } catch (error) {
    console.error('[F-03 IMAP] Erreur scan manuel:', error.message);
    res.status(500).json({ error: 'Erreur scan IMAP', details: error.message });
  }
});

// F-04 : Ringover polling trigger manuel (pour tests)
router.post('/ringover-scan', async (req, res) => {
  try {
    const { processRingoverCalls } = await import('./ringover-polling.js');
    const results = await processRingoverCalls(directusGet, directusPost, directusPatch, logAutomation, hasSentRecently);
    res.json({ success: true, results });
  } catch (error) {
    console.error('[F-04 Ringover] Erreur scan manuel:', error.message);
    res.status(500).json({ error: 'Erreur scan Ringover', details: error.message });
  }
});

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'lead-capture',
    channels: {
      'F-01-wordpress': 'active',
      'F-02-whatsapp': 'pending (Phase F-bis)',
      'F-03-imap': process.env.IMAP_PASSWORD ? 'active' : 'disabled (no IMAP_PASSWORD)',
      'F-04-ringover': process.env.RINGOVER_API_KEY ? 'active' : 'disabled (no RINGOVER_API_KEY)'
    },
    timestamp: new Date().toISOString()
  });
});

// ── Demarrer les monitors background ──

startImapMonitor(directusGet, directusPost, directusPatch, logAutomation, hasSentRecently);
startRingoverPolling(directusGet, directusPost, directusPatch, logAutomation, hasSentRecently);

export default router;
