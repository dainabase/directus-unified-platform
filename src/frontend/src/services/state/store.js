import { create } from 'zustand'
import directusAPI from '../api/directus'

const useStore = create((set, get) => ({
  // État
  companies: [],
  selectedCompany: 'all',
  dashboardData: null,
  isLoading: false,
  error: null,
  demoMode: true,
  
  // Actions simples sans boucle
  setSelectedCompany: (company) => set({ selectedCompany: company }),
  setDemoMode: (mode) => set({ demoMode: mode }),
  
  // Fetch companies
  fetchCompanies: async () => {
    try {
      const response = await directusAPI.getCompanies()
      set({ companies: response.data || [] })
    } catch (error) {
      console.error('Error fetching companies:', error)
      set({ companies: [] })
    }
  },
  
  // Fetch dashboard data
  fetchDashboardData: async () => {
    try {
      const data = await directusAPI.getDashboardData()
      set({ dashboardData: data })
    } catch (error) {
      console.error('Error fetching dashboard:', error)
      set({ dashboardData: null })
    }
  },
  
  // Getters simples
  getFormattedMetrics: () => {
    const state = get()
    return state.dashboardData?.metrics || {}
  },
  
  getAlerts: () => {
    return [
      { id: 1, type: 'warning', title: 'Cash runway < 8 mois' },
      { id: 2, type: 'info', title: '3 factures en retard' }
    ]
  }
}))

export default useStore