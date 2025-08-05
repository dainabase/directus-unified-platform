const express = require('express');
const router = express.Router();
const RevolutClient = require('./services/revolut-client');
const RevolutSyncService = require('./services/sync-service');
const config = require('./config');

// Instances globales
let revolutClient;
let syncService;

try {
  revolutClient = new RevolutClient(config);
  syncService = new RevolutSyncService(config);
  console.log('✅ Services Revolut initialisés');
} catch (error) {
  console.error('❌ Erreur initialisation Revolut:', error.message);
}

// Middleware de validation des entreprises
const validateCompany = (req, res, next) => {
  const { company } = req.params;
  const validCompanies = ['hypervisual', 'dynamics', 'lexia', 'nkreality', 'etekout'];
  
  if (!validCompanies.includes(company)) {
    return res.status(400).json({
      error: 'Entreprise invalide',
      validCompanies
    });
  }
  
  next();
};

// Middleware de gestion d'erreurs
const handleError = (error, req, res) => {
  console.error(`❌ Erreur API Revolut ${req.method} ${req.path}:`, error.message);
  
  if (error.response?.status === 401) {
    return res.status(401).json({
      error: 'Authentification Revolut échouée',
      message: 'Vérifiez la configuration OAuth2'
    });
  }
  
  if (error.response?.status === 403) {
    return res.status(403).json({
      error: 'Accès refusé par Revolut',
      message: 'Permissions insuffisantes'
    });
  }
  
  if (error.response?.status === 429) {
    return res.status(429).json({
      error: 'Limite de taux atteinte',
      message: 'Trop de requêtes, réessayez plus tard'
    });
  }
  
  res.status(500).json({
    error: error.message,
    details: error.response?.data,
    timestamp: new Date().toISOString()
  });
};

// === ENDPOINTS DE BASE ===

/**
 * GET /api/revolut/status
 * Statut général du service Revolut
 */
router.get('/status', async (req, res) => {
  try {
    if (!revolutClient) {
      return res.status(503).json({
        error: 'Service Revolut non initialisé'
      });
    }

    const tokensStatus = revolutClient.getTokensStatus();
    const stats = await syncService.getSyncStats().catch(() => null);

    res.json({
      status: 'operational',
      environment: process.env.REVOLUT_ENV || 'sandbox',
      companies: Object.keys(config.revolut.companies),
      tokens: tokensStatus,
      syncStats: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    handleError(error, req, res);
  }
});

/**
 * GET /api/revolut/test/:company
 * Tester la connexion pour une entreprise
 */
router.get('/test/:company', validateCompany, async (req, res) => {
  try {
    const result = await revolutClient.testConnection(req.params.company);
    res.json(result);
  } catch (error) {
    handleError(error, req, res);
  }
});

// === COMPTES BANCAIRES ===

/**
 * GET /api/revolut/accounts/:company
 * Récupérer tous les comptes d'une entreprise
 */
router.get('/accounts/:company', validateCompany, async (req, res) => {
  try {
    const accounts = await revolutClient.getAccounts(req.params.company);
    res.json({
      company: req.params.company,
      accounts,
      count: accounts.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    handleError(error, req, res);
  }
});

/**
 * GET /api/revolut/accounts/:company/:accountId
 * Récupérer un compte spécifique
 */
router.get('/accounts/:company/:accountId', validateCompany, async (req, res) => {
  try {
    const account = await revolutClient.getAccountById(
      req.params.company,
      req.params.accountId
    );
    
    // Récupérer aussi les détails bancaires
    let bankDetails = null;
    try {
      bankDetails = await revolutClient.getAccountBankDetails(
        req.params.company,
        req.params.accountId
      );
    } catch (e) {
      // Pas grave si pas disponible
    }

    res.json({
      account,
      bankDetails,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    handleError(error, req, res);
  }
});

// === TRANSACTIONS ===

/**
 * GET /api/revolut/transactions/:company
 * Récupérer les transactions d'une entreprise
 */
router.get('/transactions/:company', validateCompany, async (req, res) => {
  try {
    const transactions = await revolutClient.getTransactions(
      req.params.company,
      req.query
    );
    
    res.json({
      company: req.params.company,
      transactions,
      count: transactions.length,
      filters: req.query,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    handleError(error, req, res);
  }
});

/**
 * GET /api/revolut/transactions/:company/:transactionId
 * Récupérer une transaction spécifique
 */
router.get('/transactions/:company/:transactionId', validateCompany, async (req, res) => {
  try {
    const transaction = await revolutClient.getTransactionById(
      req.params.company,
      req.params.transactionId
    );
    
    res.json({
      transaction,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    handleError(error, req, res);
  }
});

// === PAIEMENTS ===

/**
 * POST /api/revolut/payments/:company
 * Créer un paiement
 */
router.post('/payments/:company', validateCompany, async (req, res) => {
  try {
    const payment = await revolutClient.createPayment(
      req.params.company,
      req.body
    );
    
    res.status(201).json({
      success: true,
      payment,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    handleError(error, req, res);
  }
});

/**
 * GET /api/revolut/payments/:company/:paymentId
 * Récupérer un paiement
 */
router.get('/payments/:company/:paymentId', validateCompany, async (req, res) => {
  try {
    const payment = await revolutClient.getPaymentById(
      req.params.company,
      req.params.paymentId
    );
    
    res.json({
      payment,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    handleError(error, req, res);
  }
});

/**
 * DELETE /api/revolut/payments/:company/:paymentId
 * Annuler un paiement
 */
router.delete('/payments/:company/:paymentId', validateCompany, async (req, res) => {
  try {
    const result = await revolutClient.cancelPayment(
      req.params.company,
      req.params.paymentId
    );
    
    res.json({
      success: true,
      result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    handleError(error, req, res);
  }
});

// === CONTREPARTIES ===

/**
 * GET /api/revolut/counterparties/:company
 * Récupérer les contreparties
 */
router.get('/counterparties/:company', validateCompany, async (req, res) => {
  try {
    const counterparties = await revolutClient.getCounterparties(req.params.company);
    
    res.json({
      company: req.params.company,
      counterparties,
      count: counterparties.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    handleError(error, req, res);
  }
});

/**
 * POST /api/revolut/counterparties/:company
 * Créer une contrepartie
 */
router.post('/counterparties/:company', validateCompany, async (req, res) => {
  try {
    const counterparty = await revolutClient.createCounterparty(
      req.params.company,
      req.body
    );
    
    res.status(201).json({
      success: true,
      counterparty,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    handleError(error, req, res);
  }
});

// === SYNCHRONISATION ===

/**
 * POST /api/revolut/sync/:company
 * Synchroniser une entreprise avec Directus
 */
router.post('/sync/:company', validateCompany, async (req, res) => {
  try {
    // Lancer sync en arrière-plan
    const syncPromise = syncService.syncCompanyAccounts(req.params.company);
    
    // Répondre immédiatement
    res.json({
      message: `Synchronisation lancée pour ${req.params.company}`,
      company: req.params.company,
      timestamp: new Date().toISOString()
    });

    // Gérer le résultat en arrière-plan
    syncPromise
      .then(result => console.log(`✅ Sync ${req.params.company} terminée:`, result))
      .catch(error => console.error(`❌ Erreur sync ${req.params.company}:`, error));

  } catch (error) {
    handleError(error, req, res);
  }
});

/**
 * POST /api/revolut/sync-all
 * Synchroniser toutes les entreprises
 */
router.post('/sync-all', async (req, res) => {
  try {
    // Lancer sync globale en arrière-plan
    const syncPromise = syncService.syncAllCompanies();
    
    res.json({
      message: 'Synchronisation globale lancée',
      companies: config.sync.companies,
      timestamp: new Date().toISOString()
    });

    // Gérer le résultat en arrière-plan
    syncPromise
      .then(results => console.log('✅ Sync globale terminée:', results))
      .catch(error => console.error('❌ Erreur sync globale:', error));

  } catch (error) {
    handleError(error, req, res);
  }
});

/**
 * GET /api/revolut/sync-stats/:company?
 * Statistiques de synchronisation
 */
router.get('/sync-stats/:company?', async (req, res) => {
  try {
    const stats = await syncService.getSyncStats(req.params.company);
    res.json({
      company: req.params.company || 'all',
      stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    handleError(error, req, res);
  }
});

// === WEBHOOKS ===

/**
 * POST /api/revolut/webhook
 * Recevoir les webhooks Revolut
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    // TODO: Vérifier la signature webhook
    const payload = JSON.parse(req.body);
    
    console.log('🔔 Webhook Revolut reçu:', {
      type: payload.event,
      timestamp: payload.timestamp,
      data: payload.data
    });

    // Traitement selon le type d'événement
    switch (payload.event) {
      case 'TransactionStateChanged':
        // Mettre à jour la transaction dans Directus
        console.log('💳 Transaction mise à jour:', payload.data.id);
        break;
        
      case 'PayoutStateChanged':
        // Mettre à jour le paiement dans Directus
        console.log('💸 Paiement mis à jour:', payload.data.id);
        break;
        
      default:
        console.log('🔔 Événement webhook non géré:', payload.event);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('❌ Erreur webhook:', error);
    res.status(400).json({ error: 'Webhook invalide' });
  }
});

// === CARTES ===

/**
 * GET /api/revolut/cards/:company
 * Récupérer les cartes d'une entreprise
 */
router.get('/cards/:company', validateCompany, async (req, res) => {
  try {
    const cards = await revolutClient.getCards(req.params.company);
    res.json({
      company: req.params.company,
      cards,
      count: cards.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    handleError(error, req, res);
  }
});

// === GESTION DES WEBHOOKS ===

/**
 * GET /api/revolut/webhooks/:company
 * Récupérer les webhooks configurés
 */
router.get('/webhooks/:company', validateCompany, async (req, res) => {
  try {
    const webhooks = await revolutClient.getWebhooks(req.params.company);
    res.json({
      company: req.params.company,
      webhooks,
      count: webhooks.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    handleError(error, req, res);
  }
});

/**
 * POST /api/revolut/webhooks/:company
 * Créer un webhook
 */
router.post('/webhooks/:company', validateCompany, async (req, res) => {
  try {
    const webhook = await revolutClient.createWebhook(
      req.params.company,
      req.body
    );
    
    res.status(201).json({
      success: true,
      webhook,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    handleError(error, req, res);
  }
});

module.exports = router;