/**
 * Finance Utilities — Phase I
 * Shared helpers for I-01 to I-08 stories
 * ES Modules — import/export only
 */

import axios from 'axios';

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_TOKEN = process.env.DIRECTUS_ADMIN_TOKEN || process.env.DIRECTUS_TOKEN;

// ── Directus HTTP helpers ──

export async function directusGet(path, params = {}) {
  const res = await axios.get(`${DIRECTUS_URL}${path}`, {
    headers: { Authorization: `Bearer ${DIRECTUS_TOKEN}` },
    params
  });
  return res.data.data;
}

export async function directusPost(path, data) {
  const res = await axios.post(`${DIRECTUS_URL}${path}`, data, {
    headers: { Authorization: `Bearer ${DIRECTUS_TOKEN}`, 'Content-Type': 'application/json' }
  });
  return res.data.data;
}

export async function directusPatch(path, data) {
  const res = await axios.patch(`${DIRECTUS_URL}${path}`, data, {
    headers: { Authorization: `Bearer ${DIRECTUS_TOKEN}`, 'Content-Type': 'application/json' }
  });
  return res.data.data;
}

// ── Date helpers ──

export function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export function addMonths(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split('T')[0];
}

export function formatMonthYear(date) {
  const d = new Date(date);
  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];
  return `${months[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatCHF(amount) {
  return `CHF ${parseFloat(amount || 0).toLocaleString('fr-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ── Invoice number generator (anti-doublon via count) ──

export async function generateInvoiceNumber(prefix) {
  const items = await directusGet('/items/client_invoices', {
    'filter[invoice_number][_starts_with]': prefix,
    'aggregate[count]': 'id'
  });
  const count = parseInt(items?.[0]?.count?.id || 0) + 1;
  const yyyymm = new Date().toISOString().slice(0, 7).replace('-', '');
  return `${prefix}-${yyyymm}-${String(count).padStart(3, '0')}`;
}

export async function generateCreditNumber() {
  const items = await directusGet('/items/credits', {
    'filter[credit_number][_starts_with]': 'NC',
    'aggregate[count]': 'id'
  });
  const count = parseInt(items?.[0]?.count?.id || 0) + 1;
  const yyyymm = new Date().toISOString().slice(0, 7).replace('-', '');
  return `NC-${yyyymm}-${String(count).padStart(3, '0')}`;
}

// ── Automation log (anti-doublon) ──

export async function logAutomation({ rule_name, entity_type, entity_id, status, recipient_email, error_message, trigger_data }) {
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
    console.error('[financeUtils] Erreur log automation_logs:', err.message);
  }
}

export async function checkAutomationLog(ruleName, entityId, date) {
  try {
    const startOfDay = `${date}T00:00:00.000Z`;
    const endOfDay = `${date}T23:59:59.999Z`;
    const logs = await directusGet('/items/automation_logs', {
      'filter[rule_name][_eq]': ruleName,
      'filter[entity_id][_eq]': String(entityId),
      'filter[executed_at][_gte]': startOfDay,
      'filter[executed_at][_lte]': endOfDay,
      limit: 1
    });
    return logs && logs.length > 0;
  } catch {
    return false;
  }
}
