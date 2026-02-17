/**
 * Invoice Ninja v5 API Service
 * Integration Invoice Ninja - ES Modules
 * @version 2.0.0
 */

import axios from 'axios';

class InvoiceNinjaAPI {
  constructor(config) {
    this.baseURL = config.baseURL || 'http://localhost:8080';
    this.apiToken = config.apiToken;

    this.api = axios.create({
      baseURL: `${this.baseURL}/api/v1`,
      headers: {
        'X-API-TOKEN': this.apiToken,
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json'
      }
    });
  }

  // === CLIENTS ===
  async getClients(params = {}) {
    try {
      const response = await this.api.get('/clients', { params });
      return response.data.data;
    } catch (error) {
      console.error('Erreur récupération clients:', error.response?.data || error.message);
      throw error;
    }
  }

  async getClient(clientId) {
    try {
      const response = await this.api.get(`/clients/${clientId}`);
      return response.data.data;
    } catch (error) {
      console.error('Erreur récupération client:', error.response?.data || error.message);
      throw error;
    }
  }

  async createClient(client) {
    try {
      const data = {
        name: client.name || `${client.first_name} ${client.last_name}`,
        contacts: [{
          first_name: client.first_name,
          last_name: client.last_name,
          email: client.email,
          phone: client.phone || ''
        }],
        address1: client.address || '',
        city: client.city || '',
        postal_code: client.postal_code || '',
        country_id: client.country_id || '756', // Suisse
        currency_id: client.currency_id || '3', // CHF
        language_id: client.language_id || '4', // Français
        vat_number: client.vat_number || ''
      };

      const response = await this.api.post('/clients', data);
      return response.data.data;
    } catch (error) {
      console.error('Erreur création client:', error.response?.data || error.message);
      throw error;
    }
  }

  async updateClient(clientId, data) {
    try {
      const response = await this.api.put(`/clients/${clientId}`, data);
      return response.data.data;
    } catch (error) {
      console.error('Erreur mise à jour client:', error.response?.data || error.message);
      throw error;
    }
  }

  async deleteClient(clientId) {
    try {
      await this.api.delete(`/clients/${clientId}`);
      return { success: true };
    } catch (error) {
      console.error('Erreur suppression client:', error.response?.data || error.message);
      throw error;
    }
  }

  // === FACTURES ===
  async getInvoices(params = {}) {
    try {
      const response = await this.api.get('/invoices', { params });
      return response.data.data;
    } catch (error) {
      console.error('Erreur récupération factures:', error.response?.data || error.message);
      throw error;
    }
  }

  async getInvoice(invoiceId) {
    try {
      const response = await this.api.get(`/invoices/${invoiceId}`);
      return response.data.data;
    } catch (error) {
      console.error('Erreur récupération facture:', error.response?.data || error.message);
      throw error;
    }
  }

  async createInvoice(invoice) {
    try {
      const data = {
        client_id: invoice.client_id,
        date: invoice.date || new Date().toISOString().split('T')[0],
        due_date: invoice.due_date,
        line_items: invoice.items.map(item => ({
          product_key: item.product_key || item.description,
          notes: item.notes || item.description,
          cost: parseFloat(item.unit_price || item.rate || 0),
          quantity: parseFloat(item.quantity || 1),
          tax_name1: item.tax_name || 'TVA',
          tax_rate1: item.tax_rate || 8.1 // TVA Suisse 8.1%
        })),
        terms: invoice.terms || 'Paiement à 30 jours',
        public_notes: invoice.notes || '',
        footer: invoice.footer || 'Merci pour votre confiance !',
        partial: invoice.partial || 0,
        auto_bill_enabled: invoice.auto_bill || false
      };

      const response = await this.api.post('/invoices', data);
      return response.data.data;
    } catch (error) {
      console.error('Erreur création facture:', error.response?.data || error.message);
      throw error;
    }
  }

  async updateInvoice(invoiceId, data) {
    try {
      const response = await this.api.put(`/invoices/${invoiceId}`, data);
      return response.data.data;
    } catch (error) {
      console.error('Erreur mise à jour facture:', error.response?.data || error.message);
      throw error;
    }
  }

  async sendInvoice(invoiceId) {
    try {
      const response = await this.api.post(`/invoices/${invoiceId}/email`);
      return response.data;
    } catch (error) {
      console.error('Erreur envoi facture:', error.response?.data || error.message);
      throw error;
    }
  }

  async markInvoicePaid(invoiceId, amount) {
    try {
      const response = await this.api.post(`/invoices/${invoiceId}/mark_paid`, {
        amount
      });
      return response.data.data;
    } catch (error) {
      console.error('Erreur marquage facture payée:', error.response?.data || error.message);
      throw error;
    }
  }

  async downloadInvoicePDF(invoiceId) {
    try {
      const response = await this.api.get(`/invoices/${invoiceId}/download`, {
        responseType: 'arraybuffer'
      });
      return response.data;
    } catch (error) {
      console.error('Erreur téléchargement PDF:', error.response?.data || error.message);
      throw error;
    }
  }

  // === PAIEMENTS ===
  async getPayments(params = {}) {
    try {
      const response = await this.api.get('/payments', { params });
      return response.data.data;
    } catch (error) {
      console.error('Erreur récupération paiements:', error.response?.data || error.message);
      throw error;
    }
  }

  async createPayment(payment) {
    try {
      const data = {
        client_id: payment.client_id,
        amount: parseFloat(payment.amount),
        date: payment.date || new Date().toISOString().split('T')[0],
        type_id: payment.type_id || '1', // Bank Transfer
        invoices: payment.invoices?.map(inv => ({
          invoice_id: inv.invoice_id,
          amount: inv.amount
        })) || []
      };

      const response = await this.api.post('/payments', data);
      return response.data.data;
    } catch (error) {
      console.error('Erreur création paiement:', error.response?.data || error.message);
      throw error;
    }
  }

  // === PRODUITS ===
  async getProducts(params = {}) {
    try {
      const response = await this.api.get('/products', { params });
      return response.data.data;
    } catch (error) {
      console.error('Erreur récupération produits:', error.response?.data || error.message);
      throw error;
    }
  }

  async createProduct(product) {
    try {
      const data = {
        product_key: product.code || product.product_key,
        notes: product.description,
        price: parseFloat(product.price || 0),
        tax_name1: product.tax_name || 'TVA',
        tax_rate1: product.tax_rate || 8.1
      };

      const response = await this.api.post('/products', data);
      return response.data.data;
    } catch (error) {
      console.error('Erreur création produit:', error.response?.data || error.message);
      throw error;
    }
  }

  // === DEVIS ===
  async getQuotes(params = {}) {
    try {
      const response = await this.api.get('/quotes', { params });
      return response.data.data;
    } catch (error) {
      console.error('Erreur récupération devis:', error.response?.data || error.message);
      throw error;
    }
  }

  async createQuote(quote) {
    try {
      const data = {
        client_id: quote.client_id,
        date: quote.date || new Date().toISOString().split('T')[0],
        valid_until: quote.valid_until,
        line_items: quote.items.map(item => ({
          product_key: item.product_key || item.description,
          notes: item.notes || item.description,
          cost: parseFloat(item.unit_price || item.rate || 0),
          quantity: parseFloat(item.quantity || 1)
        })),
        terms: quote.terms,
        public_notes: quote.notes
      };

      const response = await this.api.post('/quotes', data);
      return response.data.data;
    } catch (error) {
      console.error('Erreur création devis:', error.response?.data || error.message);
      throw error;
    }
  }

  async convertQuoteToInvoice(quoteId) {
    try {
      const response = await this.api.post(`/quotes/${quoteId}/convert`);
      return response.data.data;
    } catch (error) {
      console.error('Erreur conversion devis:', error.response?.data || error.message);
      throw error;
    }
  }

  // === RAPPORTS & DASHBOARD ===
  async getDashboardData() {
    try {
      const [clients, invoices, payments] = await Promise.all([
        this.getClients({ per_page: 1000 }),
        this.getInvoices({ per_page: 1000 }),
        this.getPayments({ per_page: 1000 })
      ]);

      // Calculs
      const totalRevenue = invoices
        .filter(inv => inv.status_id === '4') // Payées
        .reduce((sum, inv) => sum + parseFloat(inv.amount), 0);

      const pendingAmount = invoices
        .filter(inv => ['2', '3'].includes(inv.status_id)) // Envoyées, partiellement payées
        .reduce((sum, inv) => sum + parseFloat(inv.balance), 0);

      const overdueInvoices = invoices.filter(inv => {
        const dueDate = new Date(inv.due_date);
        return dueDate < new Date() && parseFloat(inv.balance) > 0;
      });

      return {
        clients: clients.length,
        totalInvoices: invoices.length,
        totalPayments: payments.length,
        totalRevenue,
        pendingAmount,
        overdueInvoices: overdueInvoices.length,
        overdueAmount: overdueInvoices.reduce((sum, inv) => sum + parseFloat(inv.balance), 0),
        recentInvoices: invoices.slice(0, 10),
        recentPayments: payments.slice(0, 10)
      };
    } catch (error) {
      console.error('Erreur dashboard Invoice Ninja:', error.message);
      return {
        clients: 0,
        totalInvoices: 0,
        totalPayments: 0,
        totalRevenue: 0,
        pendingAmount: 0,
        overdueInvoices: 0,
        overdueAmount: 0,
        recentInvoices: [],
        recentPayments: []
      };
    }
  }

  // === TEST CONNEXION ===
  async testConnection() {
    try {
      const response = await this.api.get('/ping');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erreur connexion Invoice Ninja:', error.response?.data || error.message);
      return { success: false, error: error.message };
    }
  }
}

export default InvoiceNinjaAPI;
