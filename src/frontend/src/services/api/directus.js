// Configuration Directus avec gestion d'erreurs avancée
const DIRECTUS_URL = import.meta.env.VITE_API_URL || 'http://localhost:8055'
const DIRECTUS_TOKEN = import.meta.env.VITE_API_TOKEN || ''

class DirectusAPI {
  constructor() {
    this.baseURL = DIRECTUS_URL
    this.token = DIRECTUS_TOKEN
    this.collections = {
      companies: 'companies',
      contacts: 'contacts', 
      projects: 'projects',
      deliverables: 'deliverables',
      clientInvoices: 'client_invoices',
      supplierInvoices: 'supplier_invoices',
      payments: 'payments',
      bankTransactions: 'bank_transactions',
      kpiMetrics: 'kpi_metrics'
    }
  }

  // Méthode de base pour les requêtes
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
        ...options.headers
      }
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.errors?.[0]?.message || `API Error: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Directus API Error:', error)
      throw error
    }
  }

  // === MÉTRIQUES KPI ===
  async getKPIMetrics(company = 'all', period = '7d') {
    const filters = {}
    if (company !== 'all') {
      filters.company = { _eq: company }
    }
    
    const queryString = new URLSearchParams({
      filter: JSON.stringify(filters),
      sort: '-date_created',
      limit: 1
    }).toString()
    
    return this.request(`/items/${this.collections.kpiMetrics}?${queryString}`)
  }

  // === TÂCHES & DELIVERABLES ===
  async getTasks(status = 'active', company = 'all') {
    const filters = { status: { _eq: status } }
    if (company !== 'all') {
      filters.company = { _eq: company }
    }
    
    const queryString = new URLSearchParams({
      filter: JSON.stringify(filters),
      sort: 'deadline',
      limit: 50
    }).toString()
    
    return this.request(`/items/${this.collections.deliverables}?${queryString}`)
  }

  async getUrgentTasks(company = 'all') {
    const today = new Date().toISOString().split('T')[0]
    const filters = {
      deadline: { _lte: today },
      status: { _neq: 'completed' }
    }
    if (company !== 'all') {
      filters.company = { _eq: company }
    }
    
    const queryString = new URLSearchParams({
      filter: JSON.stringify(filters),
      sort: 'deadline',
      limit: 10
    }).toString()
    
    return this.request(`/items/${this.collections.deliverables}?${queryString}`)
  }

  // === PROJETS ===
  async getProjects(status = 'active', company = 'all') {
    const filters = { status: { _eq: status } }
    if (company !== 'all') {
      filters.company = { _eq: company }
    }
    
    const queryString = new URLSearchParams({
      filter: JSON.stringify(filters),
      sort: '-date_created',
      limit: 20
    }).toString()
    
    return this.request(`/items/${this.collections.projects}?${queryString}`)
  }

  // === PIPELINE COMMERCIAL ===
  async getPipeline(company = 'all') {
    const filters = { status: { _in: ['lead', 'proposal', 'negotiation'] } }
    if (company !== 'all') {
      filters.company = { _eq: company }
    }
    
    const queryString = new URLSearchParams({
      filter: JSON.stringify(filters),
      sort: '-value',
      limit: 50
    }).toString()
    
    return this.request(`/items/${this.collections.projects}?${queryString}`)
  }

  // === FACTURES ===
  async getUnpaidInvoices(company = 'all') {
    const filters = { 
      status: { _in: ['sent', 'overdue'] },
      payment_status: { _neq: 'paid' }
    }
    if (company !== 'all') {
      filters.company = { _eq: company }
    }
    
    const queryString = new URLSearchParams({
      filter: JSON.stringify(filters),
      sort: 'due_date',
      limit: 20
    }).toString()
    
    return this.request(`/items/${this.collections.clientInvoices}?${queryString}`)
  }

  async getOverdueInvoices(company = 'all') {
    const today = new Date().toISOString().split('T')[0]
    const filters = {
      due_date: { _lt: today },
      payment_status: { _neq: 'paid' }
    }
    if (company !== 'all') {
      filters.company = { _eq: company }
    }
    
    const queryString = new URLSearchParams({
      filter: JSON.stringify(filters),
      sort: 'due_date',
      limit: 10
    }).toString()
    
    return this.request(`/items/${this.collections.clientInvoices}?${queryString}`)
  }

  // === TRÉSORERIE ===
  async getCashFlow(company = 'all', days = 7) {
    const startDate = new Date()
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + days)
    
    const filters = {
      date: {
        _between: [startDate.toISOString(), endDate.toISOString()]
      }
    }
    if (company !== 'all') {
      filters.company = { _eq: company }
    }
    
    const queryString = new URLSearchParams({
      filter: JSON.stringify(filters),
      sort: 'date',
      limit: 100
    }).toString()
    
    return this.request(`/items/${this.collections.bankTransactions}?${queryString}`)
  }

  // === ENTREPRISES ===
  async getCompanies() {
    return this.request(`/items/${this.collections.companies}?sort=name`)
  }

  // === DASHBOARD DATA AGGREGÉE ===
  async getDashboardData(company = 'all') {
    try {
      const [
        metrics,
        urgentTasks,
        projects,
        pipeline,
        unpaidInvoices,
        overdueInvoices,
        cashFlow
      ] = await Promise.all([
        this.getKPIMetrics(company),
        this.getUrgentTasks(company),
        this.getProjects('active', company),
        this.getPipeline(company),
        this.getUnpaidInvoices(company),
        this.getOverdueInvoices(company),
        this.getCashFlow(company)
      ])

      return {
        metrics: metrics.data?.[0] || null,
        tasks: {
          urgent: urgentTasks.data || [],
          total: urgentTasks.meta?.filter_count || 0
        },
        projects: {
          active: projects.data || [],
          total: projects.meta?.filter_count || 0
        },
        pipeline: {
          opportunities: pipeline.data || [],
          totalValue: pipeline.data?.reduce((sum, opp) => sum + (opp.value || 0), 0) || 0
        },
        invoices: {
          unpaid: unpaidInvoices.data || [],
          overdue: overdueInvoices.data || [],
          totalUnpaid: unpaidInvoices.data?.reduce((sum, inv) => sum + (inv.amount || 0), 0) || 0,
          totalOverdue: overdueInvoices.data?.reduce((sum, inv) => sum + (inv.amount || 0), 0) || 0
        },
        cashFlow: cashFlow.data || []
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      throw error
    }
  }
}

export default new DirectusAPI()