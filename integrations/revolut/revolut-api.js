/**
 * Revolut Business API Service
 * Integration Revolut Banking - ES Modules
 * @version 2.0.0
 */

import axios from 'axios';
import crypto from 'crypto';

class RevolutAPI {
  constructor(config) {
    this.baseURL = config.baseURL || 'https://b2b.revolut.com/api/1.0';
    this.sandboxURL = 'https://sandbox-b2b.revolut.com/api/1.0';
    this.clientId = config.clientId;
    this.privateKey = config.privateKey;
    this.accessToken = config.accessToken;
    this.sandbox = config.sandbox || false;

    this.api = axios.create({
      baseURL: this.sandbox ? this.sandboxURL : this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    // Interceptor pour refresh token
    this.api.interceptors.response.use(
      response => response,
      async error => {
        if (error.response?.status === 401 && this.refreshToken) {
          await this.refreshAccessToken();
          return this.api.request(error.config);
        }
        return Promise.reject(error);
      }
    );
  }

  // === AUTHENTIFICATION ===
  async refreshAccessToken() {
    try {
      const response = await axios.post(`${this.baseURL}/auth/token`, {
        grant_type: 'refresh_token',
        refresh_token: this.refreshToken,
        client_id: this.clientId
      });

      this.accessToken = response.data.access_token;
      this.api.defaults.headers['Authorization'] = `Bearer ${this.accessToken}`;

      return response.data;
    } catch (error) {
      console.error('Erreur refresh token Revolut:', error.message);
      throw error;
    }
  }

  // === COMPTES ===
  async getAccounts() {
    try {
      const response = await this.api.get('/accounts');
      return response.data;
    } catch (error) {
      console.error('Erreur récupération comptes:', error.response?.data || error.message);
      throw error;
    }
  }

  async getAccount(accountId) {
    try {
      const response = await this.api.get(`/accounts/${accountId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur récupération compte:', error.response?.data || error.message);
      throw error;
    }
  }

  async getAccountDetails(accountId) {
    try {
      const response = await this.api.get(`/accounts/${accountId}/bank-details`);
      return response.data;
    } catch (error) {
      console.error('Erreur récupération détails compte:', error.response?.data || error.message);
      throw error;
    }
  }

  // === TRANSACTIONS ===
  async getTransactions(params = {}) {
    try {
      const response = await this.api.get('/transactions', {
        params: {
          from: params.from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          to: params.to || new Date().toISOString(),
          count: params.count || 100,
          type: params.type // payment, refund, card_payment, etc.
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur récupération transactions:', error.response?.data || error.message);
      throw error;
    }
  }

  async getTransaction(transactionId) {
    try {
      const response = await this.api.get(`/transaction/${transactionId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur récupération transaction:', error.response?.data || error.message);
      throw error;
    }
  }

  // === PAIEMENTS ===
  async createPayment(payment) {
    try {
      const paymentData = {
        request_id: payment.requestId || crypto.randomUUID(),
        account_id: payment.accountId,
        receiver: {
          counterparty_id: payment.counterpartyId,
          account_id: payment.receiverAccountId
        },
        amount: payment.amount,
        currency: payment.currency || 'CHF',
        reference: payment.reference || `PAY-${Date.now()}`
      };

      const response = await this.api.post('/pay', paymentData);
      return response.data;
    } catch (error) {
      console.error('Erreur création paiement:', error.response?.data || error.message);
      throw error;
    }
  }

  async schedulePayment(payment) {
    try {
      const paymentData = {
        request_id: payment.requestId || crypto.randomUUID(),
        account_id: payment.accountId,
        receiver: {
          counterparty_id: payment.counterpartyId
        },
        amount: payment.amount,
        currency: payment.currency || 'CHF',
        reference: payment.reference,
        schedule_for: payment.scheduleFor // ISO date string
      };

      const response = await this.api.post('/pay', paymentData);
      return response.data;
    } catch (error) {
      console.error('Erreur planification paiement:', error.response?.data || error.message);
      throw error;
    }
  }

  // === CONTREPARTIES ===
  async getCounterparties() {
    try {
      const response = await this.api.get('/counterparties');
      return response.data;
    } catch (error) {
      console.error('Erreur récupération contreparties:', error.response?.data || error.message);
      throw error;
    }
  }

  async createCounterparty(counterparty) {
    try {
      const data = {
        company_name: counterparty.companyName,
        bank_country: counterparty.bankCountry || 'CH',
        currency: counterparty.currency || 'CHF',
        iban: counterparty.iban,
        bic: counterparty.bic
      };

      const response = await this.api.post('/counterparty', data);
      return response.data;
    } catch (error) {
      console.error('Erreur création contrepartie:', error.response?.data || error.message);
      throw error;
    }
  }

  async deleteCounterparty(counterpartyId) {
    try {
      await this.api.delete(`/counterparty/${counterpartyId}`);
      return { success: true };
    } catch (error) {
      console.error('Erreur suppression contrepartie:', error.response?.data || error.message);
      throw error;
    }
  }

  // === TAUX DE CHANGE ===
  async getExchangeRate(from, to, amount) {
    try {
      const response = await this.api.get('/rate', {
        params: { from, to, amount }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur récupération taux de change:', error.response?.data || error.message);
      throw error;
    }
  }

  async exchangeCurrency(exchange) {
    try {
      const data = {
        request_id: exchange.requestId || crypto.randomUUID(),
        from: {
          account_id: exchange.fromAccountId,
          currency: exchange.fromCurrency,
          amount: exchange.amount
        },
        to: {
          account_id: exchange.toAccountId,
          currency: exchange.toCurrency
        },
        reference: exchange.reference
      };

      const response = await this.api.post('/exchange', data);
      return response.data;
    } catch (error) {
      console.error('Erreur échange devise:', error.response?.data || error.message);
      throw error;
    }
  }

  // === WEBHOOKS ===
  async createWebhook(url, events) {
    try {
      const response = await this.api.post('/webhook', {
        url,
        events: events || ['TransactionCreated', 'TransactionStateChanged']
      });
      return response.data;
    } catch (error) {
      console.error('Erreur création webhook:', error.response?.data || error.message);
      throw error;
    }
  }

  async getWebhooks() {
    try {
      const response = await this.api.get('/webhooks');
      return response.data;
    } catch (error) {
      console.error('Erreur récupération webhooks:', error.response?.data || error.message);
      throw error;
    }
  }

  async deleteWebhook(webhookId) {
    try {
      await this.api.delete(`/webhook/${webhookId}`);
      return { success: true };
    } catch (error) {
      console.error('Erreur suppression webhook:', error.response?.data || error.message);
      throw error;
    }
  }

  // === DASHBOARD HELPERS ===
  async getDashboardData() {
    try {
      const [accounts, transactions] = await Promise.all([
        this.getAccounts(),
        this.getTransactions({ count: 50 })
      ]);

      // Calculer les totaux par devise
      const balances = {};
      accounts.forEach(account => {
        if (!balances[account.currency]) {
          balances[account.currency] = 0;
        }
        balances[account.currency] += account.balance;
      });

      // Statistiques transactions
      const incoming = transactions.filter(t => t.type === 'transfer' && t.direction === 'in');
      const outgoing = transactions.filter(t => t.type === 'transfer' && t.direction === 'out');

      return {
        accounts: accounts.length,
        balances,
        totalCHF: balances.CHF || 0,
        totalEUR: balances.EUR || 0,
        recentTransactions: transactions.slice(0, 10),
        stats: {
          incoming: {
            count: incoming.length,
            total: incoming.reduce((sum, t) => sum + t.amount, 0)
          },
          outgoing: {
            count: outgoing.length,
            total: outgoing.reduce((sum, t) => sum + t.amount, 0)
          }
        }
      };
    } catch (error) {
      console.error('Erreur dashboard Revolut:', error.message);
      return {
        accounts: 0,
        balances: {},
        totalCHF: 0,
        totalEUR: 0,
        recentTransactions: [],
        stats: { incoming: { count: 0, total: 0 }, outgoing: { count: 0, total: 0 } }
      };
    }
  }

  // === RAPPROCHEMENT BANCAIRE ===
  async matchTransactionToInvoice(transaction, invoices) {
    // Chercher une correspondance par référence ou montant
    const matches = invoices.filter(invoice => {
      const refMatch = transaction.reference?.includes(invoice.invoice_number);
      const amountMatch = Math.abs(transaction.amount - invoice.amount) < 0.01;
      return refMatch || amountMatch;
    });

    return matches;
  }
}

export default RevolutAPI;
