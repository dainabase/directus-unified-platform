/**
 * Revolut Router - ES Modules
 * Routes API pour l'integration Revolut Business
 * @version 2.0.0
 */

import express from 'express';
import RevolutAPI from './revolut-api.js';
import webhookReceiver from './webhook-receiver.js';
import { syncRecentTransactions } from './sync-transactions.js';
import { reconcileTransaction, applyReconciliation } from './reconciliation.js';
import { startAlertsMonitor, checkUnmatchedTransactions } from './alerts.js';

const router = express.Router();

// Initialiser Revolut API
const revolut = new RevolutAPI({
  baseURL: process.env.REVOLUT_API_URL || 'https://b2b.revolut.com/api/1.0',
  clientId: process.env.REVOLUT_CLIENT_ID,
  accessToken: process.env.REVOLUT_ACCESS_TOKEN,
  sandbox: process.env.REVOLUT_SANDBOX === 'true'
});

// === COMPTES ===

// Liste des comptes
router.get('/accounts', async (req, res) => {
  try {
    const accounts = await revolut.getAccounts();
    res.json({ success: true, data: accounts });
  } catch (error) {
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
    res.json({ success: true, data: transactions });
  } catch (error) {
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
  res.json({
    success: true,
    status: 'healthy',
    service: 'revolut',
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
