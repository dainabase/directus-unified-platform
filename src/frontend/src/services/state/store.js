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
  
  // Actions
  setSelectedCompany: (company) => set({ selectedCompany: company }),
  
  setDemoMode: (mode) => set({ demoMode: mode }),
  
  fetchCompanies: async () => {
    try {
      set({ isLoading: true })
      const response = await directusAPI.getCompanies()
      set({ 
        companies: response.data || [],
        isLoading: false 
      })
    } catch (error) {
      console.error('Error fetching companies:', error)
      set({ 
        companies: [],
        error: error.message,
        isLoading: false 
      })
    }
  },
  
  fetchDashboardData: async () => {
    try {
      set({ isLoading: true })
      const state = get()
      const companyId = state.selectedCompany === 'all' ? null : state.selectedCompany
      const data = await directusAPI.getDashboardData(companyId)
      
      set({ 
        dashboardData: data,
        isLoading: false,
        error: null 
      })
    } catch (error) {
      console.error('Error fetching dashboard:', error)
      set({ 
        dashboardData: null,
        error: error.message,
        isLoading: false 
      })
    }
  },
  
  // Getters
  getFormattedMetrics: () => {
    const state = get()
    return state.dashboardData?.metrics || {}
  },
  
  getAlerts: () => {
    const state = get()
    const alerts = []
    
    if (state.dashboardData?.metrics?.runway?.value < 8) {
      alerts.push({
        id: 'runway',
        type: 'warning',
        title: 'Cash runway < 8 mois',
        priority: 1
      })
    }
    
    if (state.dashboardData?.invoices?.overdue?.length > 0) {
      alerts.push({
        id: 'invoices',
        type: 'danger',
        title: `${state.dashboardData.invoices.overdue.length} factures en retard`,
        priority: 2
      })
    }
    
    return alerts
  }
}))

export default useStore