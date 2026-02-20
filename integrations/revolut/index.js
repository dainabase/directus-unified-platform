/**
 * Revolut Router - ES Modules
 * Routes API pour l'integration Revolut Business
 *
 * Token management: automatic refresh via token-manager.js
 * On 401 from Revolut, force-refresh + retry once.
 * On persistent failure, fallback to Directus data with source='directus'.
 *
 * @version 3.0.0
 * @date 2026-02-20
 */

import express from 'express';
import axios from 'axios';
import RevolutAPI from './revolut-api.js';
import { getValidToken, storeToken, forceRefresh, getTokenStatus, getAllTokenStatuses } from './token-manager.js';
import webhookReceiver from './webhook-receiver.js';
import { syncRecentTransactions } from './sync-transactions.js';
import { reconcileTransaction, applyReconciliation } from './reconciliation.js';
import { startAlertsMonitor, checkUnmatchedTransactions } from './alerts.js';

const router = express.Router();

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_TOKEN = process.env.DIRECTUS_ADMIN_TOKEN;
const DIRECTUS_HEADERS = {
  Authorization: `Bearer ${DIRECTUS_TOKEN}`,
  'Content-Type': 'application/json'
};

// Initialiser Revolut API (with token manager integration)
const revolut = new RevolutAPI({
  baseURL: process.env.REVOLUT_API_URL || 'https://b2b.revolut.com/api/1.0',
  clientId: process.env.REVOLUT_CLIENT_ID,
  accessToken: process.env.REVOLUT_ACCESS_TOKEN,
  refreshToken: process.env.REVOLUT_REFRESH_TOKEN,
  companyId: 'HYPERVISUAL',
  sandbox: process.env.REVOLUT_SANDBOX === 'true'
});

/**
 * Helper: fetch Directus fallback data for treasury / balance
 */
async function getDirectusFallbackBalance(companyFilter) {
  try {
    const params = companyFilter
      ? { 'filter[owner_company][_eq]': companyFilter, fields: '*', limit: 20 }
      : { fields: '*', limit: 20 };

    const [accountsRes, transactionsRes] = await Promise.all([
      axios.get(`${DIRECTUS_URL}/items/bank_accounts`, { headers: DIRECTUS_HEADERS, params }),
      axios.get(`${DIRECTUS_URL}/items/bank_transactions`, {
        headers: DIRECTUS_HEADERS,
        params: { ...params, sort: '-date', limit: 30, fields: 'amount,type,date,description,currency' }
      })
    ]);

    const accounts = accountsRes.data?.data || [];
    const transactions = transactionsRes.data?.data || [];
    const balance = accounts.reduce((sum, a) => sum + parseFloat(a.balance || a.current_balance || 0), 0);

    return {
      source: 'directus',
      balance,
      accounts,
      transactions,
      lastSync: null
    };
  } catch (err) {
    console.error('[Revolut] Directus fallback also failed:', err.message);
    return { source: 'offline', balance: 0, accounts: [], transactions: [] };
  }
}

// === TOKEN MANAGEMENT ===

// Token status (diagnostic)
router.get('/token-status', (req, res) => {
  const companyId = req.query.company || 'HYPERVISUAL';
  const status = getTokenStatus(companyId);
  res.json({ success: true, data: status });
});

// All token statuses
router.get('/token-status/all', (req, res) => {
  const statuses = getAllTokenStatuses();
  res.json({ success: true, data: statuses });
});

// Force token refresh
router.post('/refresh', async (req, res) => {
  const companyId = req.body.company || 'HYPERVISUAL';
  try {
    const result = await forceRefresh(companyId);
    res.json({
      success: true,
      message: `Token refreshed for ${companyId}`,
      source: result.source
    });
  } catch (error) {
    res.status(502).json({
      success: false,
      error: error.message,
      message: `Token refresh failed for ${companyId}. Please re-authenticate via Revolut OAuth2.`
    });
  }
});

// Store a new token (called after OAuth2 flow completes)
router.post('/token', async (req, res) => {
  const { company, access_token, refresh_token, expires_in } = req.body;
  if (!access_token) {
    return res.status(400).json({ success: false, error: 'access_token is required' });
  }
  const companyId = company || 'HYPERVISUAL';
  try {
    await storeToken(companyId, { access_token, refresh_token, expires_in });
    res.json({ success: true, message: `Token stored for ${companyId}` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// === BALANCE (Treasury widget main endpoint) ===

router.get('/balance', async (req, res) => {
  const companyId = req.query.company || 'HYPERVISUAL';
  try {
    const accounts = await revolut.getAccounts();
    const balance = (accounts || []).reduce((sum, a) => sum + (a.balance || 0), 0);
    res.json({
      success: true,
      source: 'revolut',
      balance,
      accounts,
      lastSync: new Date().toISOString()
    });
  } catch (error) {
    if (error._tokenRefreshFailed || error.response?.status === 401) {
      console.warn(`[Revolut] Token expired for balance — falling back to Directus`);
      const fallback = await getDirectusFallbackBalance(companyId);
      return res.json({ success: true, token_expired: true, ...fallback });
    }
    // Other errors — still try Directus fallback
    console.error('[Revolut] Balance error:', error.message);
    const fallback = await getDirectusFallbackBalance(companyId);
    res.json({ success: true, ...fallback });
  }
});

// === COMPTES ===

// Liste des comptes
router.get('/accounts', async (req, res) => {
  try {
    const accounts = await revolut.getAccounts();
    res.json({ success: true, data: accounts });
  } catch (error) {
    if (error._tokenRefreshFailed || error.response?.status === 401) {
      const fallback = await getDirectusFallbackBalance(req.query.company);
      return res.json({ success: true, source: 'directus', token_expired: true, data: fallback.accounts });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

// Détails d'un compte
router.get('/accounts/:id', async (req, res) => {
  try {
    const account = await revolut.getAccount(req.params.id);
    res.json({ success: true, data: account });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Coordonnées bancaires d'un compte
router.get('/accounts/:id/bank-details', async (req, res) => {
  try {
    const details = await revolut.getAccountDetails(req.params.id);
    res.json({ success: true, data: details });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// === TRANSACTIONS ===

// Liste des transactions
router.get('/transactions', async (req, res) => {
  try {
    const { from, to, count, type } = req.query;
    const transactions = await revolut.getTransactions({ from, to, count, type });
    res.json({ success: true, source: 'revolut', data: transactions });
  } catch (error) {
    if (error._tokenRefreshFailed || error.response?.status === 401) {
      // Fallback to Directus bank_transactions
      try {
        const params = { sort: '-date', limit: count || 50, fields: '*' };
        const directusRes = await axios.get(`${DIRECTUS_URL}/items/bank_transactions`, {
          headers: DIRECTUS_HEADERS, params
        });
        return res.json({
          success: true,
          source: 'directus',
          token_expired: true,
          data: directusRes.data?.data || []
        });
      } catch (fbErr) {
        return res.status(500).json({ success: false, source: 'offline', error: fbErr.message });
      }
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

// Détails d'une transaction
router.get('/transactions/:id', async (req, res) => {
  try {
    const transaction = await revolut.getTransaction(req.params.id);
    res.json({ success: true, data: transaction });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// === PAIEMENTS ===

// Créer un paiement
router.post('/payments', async (req, res) => {
  try {
    const payment = await revolut.createPayment(req.body);
    res.json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Planifier un paiement
router.post('/payments/schedule', async (req, res) => {
  try {
    const payment = await revolut.schedulePayment(req.body);
    res.json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// === CONTREPARTIES ===

// Liste des contreparties
router.get('/counterparties', async (req, res) => {
  try {
    const counterparties = await revolut.getCounterparties();
    res.json({ success: true, data: counterparties });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Créer une contrepartie
router.post('/counterparties', async (req, res) => {
  try {
    const counterparty = await revolut.createCounterparty(req.body);
    res.json({ success: true, data: counterparty });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Supprimer une contrepartie
router.delete('/counterparties/:id', async (req, res) => {
  try {
    await revolut.deleteCounterparty(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// === TAUX DE CHANGE ===

// Obtenir un taux de change
router.get('/exchange-rate', async (req, res) => {
  try {
    const { from, to, amount } = req.query;
    const rate = await revolut.getExchangeRate(from, to, amount);
    res.json({ success: true, data: rate });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Effectuer un échange de devises
router.post('/exchange', async (req, res) => {
  try {
    const exchange = await revolut.exchangeCurrency(req.body);
    res.json({ success: true, data: exchange });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// === DASHBOARD ===

// Données dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const data = await revolut.getDashboardData();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// === WEBHOOKS ===

// Créer un webhook
router.post('/webhooks', async (req, res) => {
  try {
    const { url, events } = req.body;
    const webhook = await revolut.createWebhook(url, events);
    res.json({ success: true, data: webhook });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Liste des webhooks
router.get('/webhooks', async (req, res) => {
  try {
    const webhooks = await revolut.getWebhooks();
    res.json({ success: true, data: webhooks });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Supprimer un webhook
router.delete('/webhooks/:id', async (req, res) => {
  try {
    await revolut.deleteWebhook(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// === PHASE G — WEBHOOK + RECONCILIATION ===

// G-01 : Webhook Revolut (raw body pour verification signature)
router.use('/webhook-receiver', webhookReceiver);

// G-01 : Sync manuelle (pour tests)
router.post('/sync-transactions', async (req, res) => {
  try {
    const hours = req.body.hours || 24;
    const result = await syncRecentTransactions(revolut, hours);
    res.json({ success: true, ...result });
  } catch (error) {
    if (error._tokenRefreshFailed || error.response?.status === 401) {
      return res.status(401).json({
        success: false,
        token_expired: true,
        error: 'Token expired. Please refresh via POST /api/revolut/refresh'
      });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

// Sync endpoint for TreasuryWidget
router.post('/sync', async (req, res) => {
  try {
    const hours = req.body.hours || 24;
    const result = await syncRecentTransactions(revolut, hours);
    res.json({ success: true, ...result });
  } catch (error) {
    if (error._tokenRefreshFailed || error.response?.status === 401) {
      return res.status(401).json({
        success: false,
        token_expired: true,
        error: 'Token expired. Please refresh via POST /api/revolut/refresh'
      });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

// G-02 : Rapprochement manuel depuis dashboard
router.post('/reconcile', async (req, res) => {
  try {
    const { transaction_id, invoice_id } = req.body;
    if (!transaction_id || !invoice_id) {
      return res.status(400).json({ error: 'transaction_id et invoice_id requis' });
    }

    const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
    const DIRECTUS_TOKEN = process.env.DIRECTUS_ADMIN_TOKEN;
    const headers = { Authorization: `Bearer ${DIRECTUS_TOKEN}` };

    const [txRes, invRes] = await Promise.all([
      fetch(`${DIRECTUS_URL}/items/bank_transactions/${transaction_id}`, { headers }),
      fetch(`${DIRECTUS_URL}/items/client_invoices/${invoice_id}`, { headers })
    ]);

    const tx = (await txRes.json()).data;
    const invoice = (await invRes.json()).data;

    if (!tx || !invoice) {
      return res.status(404).json({ error: 'Transaction ou facture introuvable' });
    }

    await applyReconciliation(tx, invoice, 100, 'manual', ['manual_validation']);
    res.json({ success: true, method: 'manual', score: 100 });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// G-05 : Verification manuelle des alertes
router.post('/check-alerts', async (req, res) => {
  try {
    const result = await checkUnmatchedTransactions();
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// === HEALTH CHECK ===

router.get('/health', (req, res) => {
  const companyId = req.query.company || 'HYPERVISUAL';
  const tokenStatus = getTokenStatus(companyId);

  res.json({
    success: true,
    status: 'healthy',
    service: 'revolut',
    token: {
      hasToken: tokenStatus.hasToken,
      expired: tokenStatus.expired,
      expiresInMinutes: tokenStatus.expiresInMinutes,
      warning: tokenStatus.warning,
      redisAvailable: tokenStatus.redisAvailable
    },
    phase_g: {
      'G-01-webhook': 'active',
      'G-02-reconciliation': 'active',
      'G-03-dashboard': 'frontend',
      'G-04-auto-activate': 'active',
      'G-05-alerts': 'active'
    },
    webhook_id: process.env.REVOLUT_WEBHOOK_ID || null,
    env: process.env.REVOLUT_ENV || 'not_set',
    sandbox: process.env.REVOLUT_SANDBOX === 'true',
    timestamp: new Date().toISOString()
  });
});

// Test de connexion
router.get('/test', async (req, res) => {
  try {
    const accounts = await revolut.getAccounts();
    res.json({
      success: true,
      message: 'Connexion Revolut OK',
      accountCount: accounts.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// === SERVICES BACKGROUND (Phase G) ===

// Demarrer alertes monitoring (G-05)
startAlertsMonitor();

// Sync horaire de secours (au cas ou webhook rate un event)
setInterval(() => {
  syncRecentTransactions(revolut, 2).catch(err => {
    console.error('[Revolut] Erreur sync horaire:', err.message);
  });
}, 60 * 60 * 1000);

console.log('[Revolut Phase G] Services demarres — webhook, reconciliation, alertes, sync horaire');

export default router;
