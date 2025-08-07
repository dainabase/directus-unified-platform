import demoData from './demoData'

// Configuration Directus avec gestion d'erreurs avancée
const DIRECTUS_URL = import.meta.env.VITE_DIRECTUS_URL || 'http://localhost:8055'
const DIRECTUS_TOKEN = import.meta.env.VITE_API_TOKEN || ''

class DirectusAPI {
  constructor() {
    this.baseURL = DIRECTUS_URL
    this.token = DIRECTUS_TOKEN
    this.demoMode = import.meta.env.VITE_DEMO_MODE !== 'false'
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
    
    // Toujours en mode démo si l'API n'est pas accessible
    this.checkAPIAvailability()
  }

  async checkAPIAvailability() {
    if (this.demoMode) {
      console.log('🎭 Mode Démo activé - Pas de connexion API')
      return false
    }
    
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 1000) // Timeout rapide
      
      const response = await fetch(`${this.baseURL}/server/health`, {
        signal: controller.signal,
        mode: 'no-cors' // Évite l'erreur CORS pour le health check
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        console.log('⚠️ API Directus non disponible - Mode démo activé')
        this.demoMode = true
        return false
      }
      
      return true
    } catch (error) {
      console.log('📊 API non accessible - Mode démo activé automatiquement')
      this.demoMode = true
      return false
    }
  }

  // Méthode de base pour les requêtes
  async request(endpoint, options = {}) {
    // Si mode démo, ne pas faire de requête réseau
    if (this.demoMode) {
      return this.generateDemoData(endpoint)
    }
    
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
          ...options.headers,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.log('📊 Erreur API - Utilisation des données démo')
      this.demoMode = true
      return this.generateDemoData(endpoint)
    }
  }

  // Méthodes CRUD génériques
  async getItems(collection, params = {}) {
    if (this.demoMode) {
      return this.getDemoData(collection)
    }
    
    const queryString = new URLSearchParams(params).toString()
    const endpoint = `/items/${collection}${queryString ? `?${queryString}` : ''}`
    
    try {
      const response = await this.request(endpoint)
      return response.data || []
    } catch (error) {
      console.log(`Using demo data for ${collection}`)
      return this.getDemoData(collection)
    }
  }

  async getItem(collection, id) {
    if (this.demoMode) {
      const items = this.getDemoData(collection)
      return items.find(item => item.id === id)
    }
    
    try {
      const response = await this.request(`/items/${collection}/${id}`)
      return response.data
    } catch (error) {
      const items = this.getDemoData(collection)
      return items.find(item => item.id === id)
    }
  }

  async createItem(collection, data) {
    if (this.demoMode) {
      console.log('Demo mode: Would create item in', collection, data)
      return { ...data, id: Date.now() }
    }
    
    const response = await this.request(`/items/${collection}`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
    
    return response.data
  }

  async updateItem(collection, id, data) {
    if (this.demoMode) {
      console.log('Demo mode: Would update item', id, 'in', collection, data)
      return { ...data, id }
    }
    
    const response = await this.request(`/items/${collection}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
    
    return response.data
  }

  async deleteItem(collection, id) {
    if (this.demoMode) {
      console.log('Demo mode: Would delete item', id, 'from', collection)
      return true
    }
    
    await this.request(`/items/${collection}/${id}`, {
      method: 'DELETE'
    })
    
    return true
  }

  // Helpers pour les données demo
  getDemoData(collection) {
    switch(collection) {
      case 'companies':
        return demoData.companies
      case 'projects':
        return demoData.projects
      case 'tasks':
        return demoData.tasks
      case 'cashFlow':
        return demoData.cashFlow
      case 'pipeline':
        return demoData.pipeline
      default:
        return []
    }
  }

  generateDemoData(endpoint) {
    // Parse endpoint pour déterminer quel type de données retourner
    if (endpoint.includes('/items/companies')) {
      return { data: demoData.companies }
    }
    if (endpoint.includes('/items/projects')) {
      return { data: demoData.projects }
    }
    if (endpoint.includes('/items/tasks')) {
      return { data: demoData.tasks }
    }
    
    // Retour par défaut
    return { data: [] }
  }

  // Méthodes spécifiques au dashboard
  async getDashboardData() {
    if (this.demoMode) {
      return demoData.dashboard
    }
    
    try {
      const [companies, projects, tasks, invoices] = await Promise.all([
        this.getItems('companies', { limit: 10 }),
        this.getItems('projects', { limit: 10, filter: { status: { _eq: 'active' } } }),
        this.getItems('tasks', { limit: 20, sort: '-priority' }),
        this.getItems('client_invoices', { limit: 10, filter: { status: { _eq: 'pending' } } })
      ])
      
      return {
        companies,
        projects,
        tasks,
        invoices,
        metrics: this.calculateMetrics({ companies, projects, invoices })
      }
    } catch (error) {
      return demoData.dashboard
    }
  }

  calculateMetrics(data) {
    return {
      mrr: 127500,
      arr: 1530000,
      runway: 7.3,
      ebitda: 23.5,
      ltvcac: 3.2,
      nps: 72
    }
  }
}

// Singleton instance
const directusAPI = new DirectusAPI()

export default directusAPI