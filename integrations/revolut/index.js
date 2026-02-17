/**
 * Revolut Router - ES Modules
 * Routes API pour l'integration Revolut Business
 * @version 2.0.0
 */

import express from 'express';
import RevolutAPI from './revolut-api.js';

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

// Webhook endpoint (réception des notifications Revolut)
router.post('/webhook-handler', async (req, res) => {
  try {
    const event = req.body;
    console.log('Webhook Revolut reçu:', event.event);

    // Traiter les différents types d'événements
    switch (event.event) {
      case 'TransactionCreated':
        console.log('Nouvelle transaction:', event.data?.id);
        // TODO: Synchroniser avec Directus
        break;

      case 'TransactionStateChanged':
        console.log('État transaction changé:', event.data?.id, event.data?.state);
        // TODO: Mettre à jour le statut dans Directus
        break;

      case 'PayoutLinkCreated':
        console.log('Lien de paiement créé:', event.data?.id);
        break;

      default:
        console.log('Événement Revolut non traité:', event.event);
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Erreur webhook Revolut:', error);
    res.status(200).send('OK'); // Toujours répondre 200 pour éviter les retries
  }
});

// === HEALTH CHECK ===

router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    service: 'revolut',
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

export default router;
