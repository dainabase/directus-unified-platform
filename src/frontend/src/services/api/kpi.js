import { mockAPI } from '../mockKPIData'

// Check if we're in development mode or if API is not available
const USE_MOCK = import.meta.env.DEV || !import.meta.env.VITE_API_URL

// Real API configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8055'
const API_TOKEN = import.meta.env.VITE_API_TOKEN || 'dashboard-api-token-2025'

// Real API client
const realAPI = {
  async get(endpoint) {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }
      
      const data = await response.json()
      return data
    } catch (error) {
      console.warn('API call failed, falling back to mock data:', error)
      // Fallback to mock data on error
      throw error
    }
  }
}

// KPI API wrapper
export const kpiAPI = {
  async getOverview(company = null) {
    if (USE_MOCK) {
      return mockAPI.getOverview(company)
    }
    
    try {
      const params = company ? `?company=${company}` : ''
      const response = await realAPI.get(`/extensions/kpi-dashboard/overview${params}`)
      return response.data || response
    } catch (error) {
      console.warn('Using mock data due to API error')
      return mockAPI.getOverview(company)
    }
  },

  async getTrends(period = '30d', company = null) {
    if (USE_MOCK) {
      return mockAPI.getTrends(period, company)
    }
    
    try {
      const params = new URLSearchParams({ period })
      if (company) params.append('company', company)
      const response = await realAPI.get(`/extensions/kpi-dashboard/trends?${params}`)
      return response.data || response
    } catch (error) {
      console.warn('Using mock data due to API error')
      return mockAPI.getTrends(period, company)
    }
  },

  async getCompanyKPIs(company) {
    if (USE_MOCK) {
      return mockAPI.getCompanyKPIs(company)
    }
    
    try {
      const response = await realAPI.get(`/extensions/kpi-dashboard/company/${company}`)
      return response.data || response
    } catch (error) {
      console.warn('Using mock data due to API error')
      return mockAPI.getCompanyKPIs(company)
    }
  },

  // Check API connection
  async checkConnection() {
    if (USE_MOCK) {
      return { connected: false, mode: 'mock' }
    }
    
    try {
      await realAPI.get('/server/ping')
      return { connected: true, mode: 'live' }
    } catch (error) {
      return { connected: false, mode: 'mock', error: error.message }
    }
  }
}

export default kpiAPI