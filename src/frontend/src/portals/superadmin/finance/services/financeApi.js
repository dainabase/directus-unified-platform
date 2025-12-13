/**
 * Finance API Service
 * Gère tous les appels API pour le module Finance
 */

const API_BASE = '/api/finance';

class FinanceApiService {
  constructor() {
    this.baseUrl = API_BASE;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erreur API');
      }
      
      return data;
    } catch (error) {
      console.error(`Finance API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // Dashboard
  async getDashboard(company) {
    return this.request(`/dashboard/${company}`);
  }

  async getKPIs(company, period = {}) {
    const params = new URLSearchParams();
    if (period.start) params.append('start', period.start);
    if (period.end) params.append('end', period.end);
    
    const query = params.toString() ? `?${params}` : '';
    return this.request(`/kpis/${company}${query}`);
  }

  async getAlerts(company) {
    return this.request(`/alerts/${company}`);
  }

  async getEvolution(company, months = 12) {
    return this.request(`/evolution/${company}?months=${months}`);
  }

  async getCashPosition(company) {
    return this.request(`/cash-position/${company}`);
  }

  async getUpcoming(company, days = 30) {
    return this.request(`/upcoming/${company}?days=${days}`);
  }

  async getTransactions(company, limit = 20) {
    return this.request(`/transactions/${company}?limit=${limit}`);
  }

  // Rapprochement
  async getPendingReconciliations(company) {
    return this.request(`/reconciliation/${company}`);
  }

  async confirmMatch(transactionId, invoiceId, type) {
    return this.request('/reconciliation/match', {
      method: 'POST',
      body: JSON.stringify({ transaction_id: transactionId, invoice_id: invoiceId, type })
    });
  }

  // Factures
  async createInvoice(data) {
    return this.request('/invoices', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getInvoice(id) {
    return this.request(`/invoices/${id}`);
  }

  async generatePDF(invoiceId) {
    return this.request(`/invoices/${invoiceId}/pdf`, { method: 'POST' });
  }
}

export const financeApi = new FinanceApiService();
export default financeApi;