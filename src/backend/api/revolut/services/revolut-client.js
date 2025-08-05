const axios = require('axios');
const RevolutOAuth = require('../auth/revolut-oauth');

/**
 * Client principal pour l'API Revolut Business
 * Gère toutes les opérations bancaires pour les 5 entreprises
 */
class RevolutClient {
  constructor(config) {
    this.config = config;
    this.auth = new RevolutOAuth(config);
    
    // Instance axios avec configuration optimisée
    this.api = axios.create({
      baseURL: config.baseURL,
      timeout: 30000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'Directus-Unified-Platform/1.0'
      }
    });

    // Intercepteur pour retry automatique sur 401
    this.api.interceptors.response.use(
      response => response,
      async error => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          console.log(`🔄 Token expiré pour ${originalRequest.companyId}, renouvellement...`);
          
          // Clear cache et obtenir nouveau token
          this.auth.clearCache(originalRequest.companyId);
          const newToken = await this.auth.getAccessToken(originalRequest.companyId);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          
          return this.api(originalRequest);
        }
        
        return Promise.reject(error);
      }
    );
  }

  /**
   * Helper pour requêtes avec authentification automatique
   * @param {string} companyId - ID de l'entreprise
   * @param {string} method - Méthode HTTP
   * @param {string} url - URL relative
   * @param {Object} data - Données pour POST/PUT
   * @param {Object} params - Paramètres query
   * @returns {Promise<Object>} Réponse de l'API
   */
  async request(companyId, method, url, data = null, params = null) {
    try {
      const token = await this.auth.getAccessToken(companyId);
      
      const config = {
        method,
        url,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        companyId // Pour l'intercepteur
      };

      if (data) config.data = data;
      if (params) config.params = params;

      const response = await this.api(config);
      return response.data;
    } catch (error) {
      console.error(`❌ Erreur API Revolut ${companyId} ${method} ${url}:`, {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  }

  // === COMPTES BANCAIRES ===

  /**
   * Récupérer tous les comptes d'une entreprise
   * @param {string} companyId - ID de l'entreprise
   * @returns {Promise<Array>} Liste des comptes
   */
  async getAccounts(companyId) {
    console.log(`📊 Récupération comptes Revolut pour ${companyId}`);
    return this.request(companyId, 'GET', '/accounts');
  }

  /**
   * Récupérer un compte spécifique
   * @param {string} companyId - ID de l'entreprise
   * @param {string} accountId - ID du compte
   * @returns {Promise<Object>} Détails du compte
   */
  async getAccountById(companyId, accountId) {
    return this.request(companyId, 'GET', `/accounts/${accountId}`);
  }

  /**
   * Récupérer les détails bancaires d'un compte
   * @param {string} companyId - ID de l'entreprise
   * @param {string} accountId - ID du compte
   * @returns {Promise<Object>} Détails bancaires (IBAN, etc.)
   */
  async getAccountBankDetails(companyId, accountId) {
    return this.request(companyId, 'GET', `/accounts/${accountId}/bank-details`);
  }

  // === TRANSACTIONS ===

  /**
   * Récupérer les transactions d'une entreprise
   * @param {string} companyId - ID de l'entreprise
   * @param {Object} params - Paramètres de filtrage
   * @returns {Promise<Array>} Liste des transactions
   */
  async getTransactions(companyId, params = {}) {
    // Paramètres par défaut optimisés
    const defaultParams = {
      from: params.from || new Date(Date.now() - 30*24*60*60*1000).toISOString().split('T')[0],
      to: params.to || new Date().toISOString().split('T')[0],
      limit: params.limit || 100,
      type: params.type, // 'atm', 'card_payment', 'transfer', etc.
      counterparty: params.counterparty
    };

    // Nettoyer les paramètres undefined
    Object.keys(defaultParams).forEach(key => 
      defaultParams[key] === undefined && delete defaultParams[key]
    );

    console.log(`📊 Récupération transactions ${companyId}:`, defaultParams);
    return this.request(companyId, 'GET', '/transactions', null, defaultParams);
  }

  /**
   * Récupérer une transaction spécifique
   * @param {string} companyId - ID de l'entreprise
   * @param {string} transactionId - ID de la transaction
   * @returns {Promise<Object>} Détails de la transaction
   */
  async getTransactionById(companyId, transactionId) {
    return this.request(companyId, 'GET', `/transactions/${transactionId}`);
  }

  // === PAIEMENTS SORTANTS ===

  /**
   * Créer un paiement sortant
   * @param {string} companyId - ID de l'entreprise
   * @param {Object} payment - Données du paiement
   * @returns {Promise<Object>} Détails du paiement créé
   */
  async createPayment(companyId, payment) {
    console.log(`💸 Création paiement ${companyId}:`, payment.amount, payment.currency);
    
    // Validation basique
    if (!payment.account_id || !payment.receiver || !payment.amount) {
      throw new Error('Données paiement incomplètes: account_id, receiver et amount requis');
    }

    return this.request(companyId, 'POST', '/pay-outs/single', payment);
  }

  /**
   * Récupérer un paiement par ID
   * @param {string} companyId - ID de l'entreprise
   * @param {string} paymentId - ID du paiement
   * @returns {Promise<Object>} Détails du paiement
   */
  async getPaymentById(companyId, paymentId) {
    return this.request(companyId, 'GET', `/pay-outs/${paymentId}`);
  }

  /**
   * Annuler un paiement (si possible)
   * @param {string} companyId - ID de l'entreprise
   * @param {string} paymentId - ID du paiement
   * @returns {Promise<Object>} Statut de l'annulation
   */
  async cancelPayment(companyId, paymentId) {
    console.log(`❌ Annulation paiement ${companyId}:`, paymentId);
    return this.request(companyId, 'DELETE', `/pay-outs/${paymentId}`);
  }

  // === CONTREPARTIES ===

  /**
   * Récupérer toutes les contreparties
   * @param {string} companyId - ID de l'entreprise
   * @returns {Promise<Array>} Liste des contreparties
   */
  async getCounterparties(companyId) {
    return this.request(companyId, 'GET', '/counterparties');
  }

  /**
   * Créer une nouvelle contrepartie
   * @param {string} companyId - ID de l'entreprise
   * @param {Object} counterparty - Données de la contrepartie
   * @returns {Promise<Object>} Contrepartie créée
   */
  async createCounterparty(companyId, counterparty) {
    console.log(`👤 Création contrepartie ${companyId}:`, counterparty.name);
    return this.request(companyId, 'POST', '/counterparties', counterparty);
  }

  /**
   * Récupérer une contrepartie par ID
   * @param {string} companyId - ID de l'entreprise
   * @param {string} counterpartyId - ID de la contrepartie
   * @returns {Promise<Object>} Détails de la contrepartie
   */
  async getCounterpartyById(companyId, counterpartyId) {
    return this.request(companyId, 'GET', `/counterparties/${counterpartyId}`);
  }

  // === CARTES ===

  /**
   * Récupérer toutes les cartes d'une entreprise
   * @param {string} companyId - ID de l'entreprise
   * @returns {Promise<Array>} Liste des cartes
   */
  async getCards(companyId) {
    return this.request(companyId, 'GET', '/cards');
  }

  // === WEBHOOKS ===

  /**
   * Récupérer les webhooks configurés
   * @param {string} companyId - ID de l'entreprise
   * @returns {Promise<Array>} Liste des webhooks
   */
  async getWebhooks(companyId) {
    return this.request(companyId, 'GET', '/webhooks');
  }

  /**
   * Créer un webhook
   * @param {string} companyId - ID de l'entreprise
   * @param {Object} webhook - Configuration du webhook
   * @returns {Promise<Object>} Webhook créé
   */
  async createWebhook(companyId, webhook) {
    console.log(`🔗 Création webhook ${companyId}:`, webhook.url);
    return this.request(companyId, 'POST', '/webhooks', webhook);
  }

  // === UTILITAIRES ===

  /**
   * Tester la connexion pour une entreprise
   * @param {string} companyId - ID de l'entreprise
   * @returns {Promise<Object>} Statut de la connexion
   */
  async testConnection(companyId) {
    try {
      console.log(`🔧 Test connexion Revolut ${companyId}`);
      const accounts = await this.getAccounts(companyId);
      return {
        success: true,
        message: `Connexion réussie pour ${companyId}`,
        accountsCount: accounts.length,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Obtenir le statut des tokens pour toutes les entreprises
   * @returns {Object} Statut des caches de tokens
   */
  getTokensStatus() {
    return this.auth.getCacheStatus();
  }
}

module.exports = RevolutClient;