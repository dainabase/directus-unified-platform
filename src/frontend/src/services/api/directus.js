import axios from 'axios'
import toast from 'react-hot-toast'

// Configuration API avec gestion d'erreurs
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8055'
const API_TOKEN = import.meta.env.VITE_API_TOKEN || ''

// Créer instance Axios
const directusAPI = axios.create({
  baseURL: `${API_URL}/items`,
  headers: {
    'Content-Type': 'application/json',
    ...(API_TOKEN && { 'Authorization': `Bearer ${API_TOKEN}` })
  },
  timeout: 10000
})

// Intercepteur pour les requêtes
directusAPI.interceptors.request.use(
  config => {
    // Log en dev
    if (import.meta.env.DEV) {
      console.log(`📡 API Request: ${config.method?.toUpperCase()} ${config.url}`)
    }
    return config
  },
  error => {
    console.error('❌ Request Error:', error)
    return Promise.reject(error)
  }
)

// Intercepteur pour les réponses
directusAPI.interceptors.response.use(
  response => {
    if (import.meta.env.DEV) {
      console.log(`✅ API Response:`, response.data)
    }
    return response
  },
  error => {
    const message = error.response?.data?.errors?.[0]?.message || 
                   error.response?.data?.error?.message ||
                   error.message || 
                   'Une erreur est survenue'
    
    // Si erreur CORS ou connexion, utiliser mode démo
    if (error.code === 'ERR_NETWORK' || error.response?.status === 0) {
      console.warn('⚠️ API non disponible, mode démo activé')
      return { data: { data: null, demo: true } }
    }
    
    // Notification d'erreur
    if (error.response?.status !== 404) {
      toast.error(message, {
        style: {
          background: 'linear-gradient(135deg, #1e293b, #334155)',
          color: '#fff',
          border: '1px solid rgba(239, 68, 68, 0.3)'
        }
      })
    }
    
    return Promise.reject(error)
  }
)

// Données démo fallback
const getDemoData = (collection) => {
  const demoData = {
    companies: [
      { id: 1, name: 'HYPERVISUAL', type: 'client', status: 'active' },
      { id: 2, name: 'DAINAMICS', type: 'internal', status: 'active' },
      { id: 3, name: 'LEXAIA', type: 'client', status: 'active' },
      { id: 4, name: 'ENKI REALTY', type: 'client', status: 'active' },
      { id: 5, name: 'TAKEOUT', type: 'client', status: 'active' }
    ],
    projects: [
      { id: 1, name: 'Migration Cloud', status: 'in_progress', progress: 65, company: { name: 'HYPERVISUAL' } },
      { id: 2, name: 'Refonte UI/UX', status: 'in_progress', progress: 40, company: { name: 'DAINAMICS' } },
      { id: 3, name: 'API v2', status: 'in_progress', progress: 80, company: { name: 'LEXAIA' } },
      { id: 4, name: 'Module CRM', status: 'completed', progress: 100, company: { name: 'ENKI REALTY' } },
      { id: 5, name: 'App Mobile', status: 'on_hold', progress: 25, company: { name: 'TAKEOUT' } }
    ],
    client_invoices: [
      { id: 1, invoice_date: '2024-01-15', amount_ttc: 45000, status: 'paid' },
      { id: 2, invoice_date: '2024-02-15', amount_ttc: 62000, status: 'paid' },
      { id: 3, invoice_date: '2024-03-15', amount_ttc: 38000, status: 'overdue' },
      { id: 4, invoice_date: '2024-04-15', amount_ttc: 55000, status: 'paid' },
      { id: 5, invoice_date: '2024-05-15', amount_ttc: 71000, status: 'paid' },
      { id: 6, invoice_date: '2024-06-15', amount_ttc: 48000, status: 'pending' }
    ],
    supplier_invoices: [
      { id: 1, invoice_date: '2024-01-10', amount_ttc: 15000, status: 'paid' },
      { id: 2, invoice_date: '2024-02-10', amount_ttc: 22000, status: 'paid' },
      { id: 3, invoice_date: '2024-03-10', amount_ttc: 18000, status: 'paid' },
      { id: 4, invoice_date: '2024-04-10', amount_ttc: 25000, status: 'pending' },
      { id: 5, invoice_date: '2024-05-10', amount_ttc: 20000, status: 'paid' },
      { id: 6, invoice_date: '2024-06-10', amount_ttc: 23000, status: 'paid' }
    ],
    subscriptions: [
      { id: 1, monthly_amount: 50000, annual_amount: 600000, status: 'active' },
      { id: 2, monthly_amount: 75000, annual_amount: 900000, status: 'active' },
      { id: 3, monthly_amount: 30000, annual_amount: 360000, status: 'active' },
      { id: 4, monthly_amount: 45000, annual_amount: 540000, status: 'active' }
    ],
    bank_transactions: [
      { id: 1, amount: 847000 } // Solde bancaire
    ],
    expenses: [
      { id: 1, date: '2024-04-01', amount: 115000 },
      { id: 2, date: '2024-05-01', amount: 108000 },
      { id: 3, date: '2024-06-01', amount: 122000 }
    ],
    people: [
      { id: 1, role: 'employee' },
      { id: 2, role: 'employee' },
      { id: 3, role: 'contractor' },
      { id: 4, role: 'employee' },
      { id: 5, role: 'employee' },
      { id: 6, role: 'contractor' }
    ],
    time_tracking: [
      { id: 1, hours: 160, date: '2024-06-01' },
      { id: 2, hours: 168, date: '2024-06-02' },
      { id: 3, hours: 152, date: '2024-06-03' }
    ]
  }
  
  return demoData[collection] || []
}

// Fonctions helper avec cache
export const directus = {
  // GET avec paramètres
  async get(collection, params = {}) {
    try {
      const response = await directusAPI.get(`/${collection}`, { params })
      
      // Si mode démo activé
      if (response.data?.demo || import.meta.env.VITE_USE_DEMO_DATA === 'true') {
        console.warn(`📊 Mode démo pour ${collection}`)
        return getDemoData(collection)
      }
      
      return response.data.data || []
    } catch (error) {
      if (import.meta.env.VITE_USE_DEMO_DATA === 'true') {
        console.warn(`📊 Mode démo pour ${collection}`)
        return getDemoData(collection)
      }
      console.error(`Error fetching ${collection}:`, error)
      return []
    }
  },

  // GET par ID
  async getById(collection, id, params = {}) {
    try {
      const response = await directusAPI.get(`/${collection}/${id}`, { params })
      
      if (response.data?.demo) {
        const demoData = getDemoData(collection)
        return demoData.find(item => item.id === parseInt(id)) || null
      }
      
      return response.data.data
    } catch (error) {
      if (import.meta.env.VITE_USE_DEMO_DATA === 'true') {
        const demoData = getDemoData(collection)
        return demoData.find(item => item.id === parseInt(id)) || null
      }
      console.error(`Error fetching ${collection}/${id}:`, error)
      return null
    }
  },

  // GET avec agrégation
  async aggregate(collection, params = {}) {
    try {
      const aggregateParams = {
        aggregate: {
          sum: params.sum || [],
          avg: params.avg || [],
          count: params.count || '*'
        },
        ...params
      }
      
      const response = await directusAPI.get(`/${collection}`, { params: aggregateParams })
      
      if (response.data?.demo) {
        // Simuler l'agrégation pour le mode démo
        const demoData = getDemoData(collection)
        const result = {}
        
        if (params.count) {
          result.count = demoData.length
        }
        
        if (params.sum) {
          params.sum.forEach(field => {
            result[`sum_${field}`] = demoData.reduce((sum, item) => sum + (item[field] || 0), 0)
          })
        }
        
        return [result]
      }
      
      return response.data.data || []
    } catch (error) {
      if (import.meta.env.VITE_USE_DEMO_DATA === 'true') {
        const demoData = getDemoData(collection)
        const result = {}
        
        if (params.count) {
          result.count = demoData.length
        }
        
        if (params.sum) {
          params.sum.forEach(field => {
            result[`sum_${field}`] = demoData.reduce((sum, item) => sum + (item[field] || 0), 0)
          })
        }
        
        return [result]
      }
      console.error(`Error aggregating ${collection}:`, error)
      return []
    }
  },

  // POST
  async create(collection, data) {
    try {
      const response = await directusAPI.post(`/${collection}`, data)
      toast.success('Créé avec succès')
      return response.data.data
    } catch (error) {
      throw error
    }
  },

  // PATCH
  async update(collection, id, data) {
    try {
      const response = await directusAPI.patch(`/${collection}/${id}`, data)
      toast.success('Mis à jour avec succès')
      return response.data.data
    } catch (error) {
      throw error
    }
  },

  // DELETE
  async delete(collection, id) {
    try {
      await directusAPI.delete(`/${collection}/${id}`)
      toast.success('Supprimé avec succès')
      return true
    } catch (error) {
      throw error
    }
  }
}

export default directus