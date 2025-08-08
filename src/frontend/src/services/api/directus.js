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
    
    // Si erreur CORS ou connexion, NE PAS UTILISER MODE DÉMO
    if (error.code === 'ERR_NETWORK' || error.response?.status === 0) {
      console.error('❌ API non disponible')
      // Laisser l'erreur se propager
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

// SUPPRIMÉ : Plus de données démo ! On utilise UNIQUEMENT les vraies données Directus

// Fonctions helper avec cache
export const directus = {
  // GET avec paramètres
  async get(collection, params = {}) {
    try {
      console.log(`📡 GET /${collection}`, params)
      const response = await directusAPI.get(`/${collection}`, { params })
      const data = response.data.data || []
      console.log(`✅ ${collection}: ${data.length} items`)
      
      // Log des premières données pour debug
      if (data.length > 0) {
        console.log(`   Exemple:`, data[0])
      }
      
      return data
    } catch (error) {
      console.error(`❌ Error fetching ${collection}:`, error.message)
      console.error(`   Status:`, error.response?.status)
      console.error(`   Data:`, error.response?.data)
      
      // IMPORTANT: Retourner tableau vide, JAMAIS de données démo
      return []
    }
  },

  // GET par ID
  async getById(collection, id, params = {}) {
    try {
      console.log(`📡 GET /${collection}/${id}`, params)
      const response = await directusAPI.get(`/${collection}/${id}`, { params })
      const data = response.data.data
      console.log(`✅ ${collection}/${id}:`, data)
      return data
    } catch (error) {
      console.error(`❌ Error fetching ${collection}/${id}:`, error.message)
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
      const data = response.data.data || []
      console.log(`✅ Aggregate ${collection}:`, data)
      return data
    } catch (error) {
      console.error(`❌ Error aggregating ${collection}:`, error.message)
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