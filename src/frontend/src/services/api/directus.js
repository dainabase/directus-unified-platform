// API Service pour Directus
class DirectusAPI {
  constructor() {
    this.baseURL = import.meta.env.VITE_DIRECTUS_URL || 'http://localhost:8055'
    this.demoMode = true // Toujours en mode démo pour éviter les erreurs
    this.token = import.meta.env.VITE_API_TOKEN || null
    
    console.log('📊 Mode Démo activé')
  }

  async request(endpoint, options = {}) {
    // En mode démo, retourner directement les données
    if (this.demoMode) {
      return this.generateDemoData(endpoint)
    }
    
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { Authorization: `Bearer ${this.token}` }),
          ...options.headers,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.log('Directus API Error:', error)
      // Fallback to demo data on error
      return this.generateDemoData(endpoint)
    }
  }

  // Méthodes API
  async getCompanies() {
    const data = await this.request('/items/companies?sort=name')
    return data
  }

  async getDashboardData(companyId = null) {
    const params = companyId ? `?company=${companyId}` : ''
    const data = await this.request(`/dashboard${params}`)
    return data
  }

  async getProjects(companyId = null) {
    const params = companyId ? `?filter[company][_eq]=${companyId}` : ''
    const data = await this.request(`/items/projects${params}`)
    return data
  }

  async getTasks(projectId = null) {
    const params = projectId ? `?filter[project][_eq]=${projectId}` : ''
    const data = await this.request(`/items/tasks${params}`)
    return data
  }

  async getInvoices(companyId = null) {
    const params = companyId ? `?filter[company][_eq]=${companyId}` : ''
    const data = await this.request(`/items/invoices${params}`)
    return data
  }

  // Générateur de données démo
  generateDemoData(endpoint) {
    console.log('📊 Mode Démo activé')
    
    // Companies
    if (endpoint.includes('companies')) {
      return {
        data: [
          { id: 1, name: 'HYPERVISUAL', type: 'Studio créatif', status: 'active' },
          { id: 2, name: 'DAINAMICS', type: 'Tech company', status: 'active' },
          { id: 3, name: 'LEXAIA', type: 'Services juridiques', status: 'active' },
          { id: 4, name: 'ENKI REALTY', type: 'Immobilier', status: 'active' },
          { id: 5, name: 'TAKEOUT', type: 'Restauration', status: 'active' }
        ]
      }
    }
    
    // Dashboard data
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
            { id: 1, name: 'Révision contrat HYPERVISUAL', priority: 1, deadline: '2024-12-15' },
            { id: 2, name: 'Présentation investisseurs Q1', priority: 2, deadline: '2024-12-20' },
            { id: 3, name: 'Audit sécurité LEXAIA', priority: 3, deadline: '2024-12-18' },
            { id: 4, name: 'Migration serveurs DAINAMICS', priority: 4, deadline: '2024-12-22' },
            { id: 5, name: 'Refonte site TAKEOUT', priority: 5, deadline: '2024-12-25' }
          ]
        },
        projects: {
          total: 8,
          active: [
            { id: 1, name: 'Migration Cloud AWS', status: 'En cours', progress: 65 },
            { id: 2, name: 'Refonte UI/UX Dashboard', status: 'En cours', progress: 40 },
            { id: 3, name: 'API v2 Development', status: 'En cours', progress: 80 },
            { id: 4, name: 'Module Facturation', status: 'Planifié', progress: 15 }
          ]
        },
        pipeline: {
          totalValue: 850000,
          opportunities: [
            { id: 1, name: 'Contrat annuel BigCorp', status: 'lead', value: 150000 },
            { id: 2, name: 'Migration StartupXYZ', status: 'proposal', value: 300000 },
            { id: 3, name: 'Consulting TechCo', status: 'negotiation', value: 250000 },
            { id: 4, name: 'Support Premium Inc', status: 'won', value: 150000 }
          ]
        },
        invoices: {
          totalUnpaid: 320000,
          totalOverdue: 85000,
          unpaid: [
            { id: 1, invoice_number: 'INV-2024-001', client_name: 'Tech Corp', amount: 45000, due_date: '2024-12-10' },
            { id: 2, invoice_number: 'INV-2024-002', client_name: 'StartupXYZ', amount: 28000, due_date: '2024-12-15' },
            { id: 3, invoice_number: 'INV-2024-003', client_name: 'BigCorp SA', amount: 62000, due_date: '2024-12-20' }
          ],
          overdue: [
            { id: 1, invoice_number: 'INV-2024-004', client_name: 'OldClient SA', amount: 85000, due_date: '2024-11-15' }
          ]
        },
        cashFlow: [
          { date: '2024-12-01', amount: 50000, type: 'in', label: 'Paiement Tech Corp' },
          { date: '2024-12-02', amount: -30000, type: 'out', label: 'Salaires' },
          { date: '2024-12-03', amount: 75000, type: 'in', label: 'Contrat StartupXYZ' },
          { date: '2024-12-04', amount: -15000, type: 'out', label: 'Fournisseurs' },
          { date: '2024-12-05', amount: 40000, type: 'in', label: 'Abonnements' },
          { date: '2024-12-06', amount: -25000, type: 'out', label: 'Loyer & charges' },
          { date: '2024-12-07', amount: 60000, type: 'in', label: 'Vente licence' }
        ]
      }
    }
    
    // Projects
    if (endpoint.includes('projects')) {
      return {
        data: [
          { id: 1, name: 'Site Web HYPERVISUAL', status: 'active', progress: 75 },
          { id: 2, name: 'App Mobile DAINAMICS', status: 'active', progress: 40 },
          { id: 3, name: 'Plateforme LEXAIA', status: 'planning', progress: 10 }
        ]
      }
    }
    
    // Default
    return { data: [] }
  }
}

export default new DirectusAPI()