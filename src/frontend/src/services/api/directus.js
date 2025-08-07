import demoData from './demoData'

class DirectusAPI {
  constructor() {
    this.baseURL = import.meta.env.VITE_DIRECTUS_URL || 'http://localhost:8055'
    this.demoMode = true // Toujours en mode démo
    console.log('🎭 Mode Démo activé')
  }

  // Méthode qui manquait
  async getCompanies() {
    return this.generateDemoData('/items/companies')
  }

  async getDashboardData() {
    return this.generateDemoData('/dashboard')
  }

  async getMetrics() {
    return this.generateDemoData('/metrics')
  }

  generateDemoData(endpoint) {
    // Données démo selon l'endpoint
    if (endpoint.includes('companies')) {
      return {
        data: [
          { id: 1, name: 'HYPERVISUAL', status: 'active' },
          { id: 2, name: 'DAINAMICS', status: 'active' },
          { id: 3, name: 'LEXAIA', status: 'active' },
          { id: 4, name: 'ENKI REALTY', status: 'active' },
          { id: 5, name: 'TAKEOUT', status: 'active' }
        ]
      }
    }
    
    if (endpoint.includes('dashboard')) {
      return {
        metrics: {
          runway: { value: 7.3, trend: 'up', formatted: '7.3 mois' },
          arr: { value: 2400000, trend: 'up', formatted: '€2.4M' },
          mrr: { value: 200000, trend: 'up', formatted: '€200K' },
          ebitda: { value: 18.5, trend: 'up', formatted: '18.5%' },
          ltvcac: { value: 3.2, trend: 'up', formatted: '3.2x' },
          nps: { value: 72, trend: 'up', formatted: '72' }
        },
        tasks: {
          total: 24,
          urgent: [
            { id: 1, name: 'Révision contrat client', priority: 1, deadline: '2024-12-15' },
            { id: 2, name: 'Présentation investisseurs', priority: 2, deadline: '2024-12-20' },
            { id: 3, name: 'Audit sécurité', priority: 3, deadline: '2024-12-18' }
          ]
        },
        projects: {
          total: 8,
          active: [
            { id: 1, name: 'Migration Cloud', status: 'En cours', progress: 65 },
            { id: 2, name: 'Refonte UI/UX', status: 'En cours', progress: 40 },
            { id: 3, name: 'API v2', status: 'En cours', progress: 80 }
          ]
        },
        pipeline: {
          totalValue: 850000,
          opportunities: [
            { id: 1, status: 'lead', value: 150000 },
            { id: 2, status: 'proposal', value: 300000 },
            { id: 3, status: 'negotiation', value: 250000 },
            { id: 4, status: 'won', value: 150000 }
          ]
        },
        invoices: {
          totalUnpaid: 320000,
          totalOverdue: 85000,
          unpaid: [
            { id: 1, client_name: 'Tech Corp', amount: 45000 },
            { id: 2, client_name: 'StartupXYZ', amount: 28000 }
          ],
          overdue: [
            { id: 1, client_name: 'OldClient SA', amount: 85000 }
          ]
        },
        cashFlow: [
          { date: '2024-12-01', amount: 50000, type: 'in' },
          { date: '2024-12-02', amount: -30000, type: 'out' },
          { date: '2024-12-03', amount: 75000, type: 'in' }
        ]
      }
    }
    
    return { data: [] }
  }
}

export default new DirectusAPI()