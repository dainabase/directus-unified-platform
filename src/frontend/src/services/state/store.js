import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import directusAPI from '../api/directus'

const useStore = create(
  devtools(
    persist(
      (set, get) => ({
        // === STATE ===
        // Sélections
        selectedCompany: 'all',
        selectedPeriod: '7d',
        
        // Données
        dashboardData: null,
        companies: [],
        
        // UI State
        isLoading: false,
        error: null,
        lastRefresh: null,
        
        // Préférences utilisateur
        preferences: {
          theme: 'dark',
          notifications: true,
          autoRefresh: true,
          refreshInterval: 30000 // 30 secondes
        },

        // === ACTIONS ===
        // Setters simples
        setSelectedCompany: (company) => set({ 
          selectedCompany: company,
          dashboardData: null // Reset data on company change
        }),
        
        setSelectedPeriod: (period) => set({ 
          selectedPeriod: period,
          dashboardData: null
        }),
        
        setLoading: (isLoading) => set({ isLoading }),
        setError: (error) => set({ error }),
        
        // Fetch companies
        fetchCompanies: async () => {
          try {
            const response = await directusAPI.getCompanies()
            set({ companies: response.data || [] })
          } catch (error) {
            console.error('Error fetching companies:', error)
            set({ error: error.message })
          }
        },
        
        // Fetch dashboard data
        fetchDashboardData: async (forceRefresh = false) => {
          const state = get()
          
          // Skip if already loading
          if (state.isLoading && !forceRefresh) return
          
          // Skip if data is fresh (less than 30 seconds old)
          if (!forceRefresh && state.lastRefresh) {
            const timeSinceRefresh = Date.now() - state.lastRefresh
            if (timeSinceRefresh < 30000) return
          }
          
          set({ isLoading: true, error: null })
          
          try {
            const data = await directusAPI.getDashboardData(state.selectedCompany)
            set({ 
              dashboardData: data,
              lastRefresh: Date.now(),
              isLoading: false
            })
          } catch (error) {
            console.error('Error fetching dashboard data:', error)
            set({ 
              error: error.message,
              isLoading: false
            })
          }
        },
        
        // Refresh all data
        refreshAll: async () => {
          const { fetchCompanies, fetchDashboardData } = get()
          await Promise.all([
            fetchCompanies(),
            fetchDashboardData(true)
          ])
        },
        
        // Update preferences
        updatePreferences: (newPreferences) => {
          set((state) => ({
            preferences: {
              ...state.preferences,
              ...newPreferences
            }
          }))
        },
        
        // Clear all data
        clearData: () => set({
          dashboardData: null,
          error: null,
          lastRefresh: null
        }),
        
        // === COMPUTED VALUES ===
        // Get formatted metrics
        getFormattedMetrics: () => {
          const { dashboardData } = get()
          if (!dashboardData?.metrics) return null
          
          const metrics = dashboardData.metrics
          return {
            runway: {
              value: metrics.cash_runway || 0,
              trend: metrics.cash_runway_trend || 'neutral',
              formatted: `${metrics.cash_runway || 0}m`
            },
            arr: {
              value: metrics.arr || 0,
              trend: metrics.arr_trend || 'neutral',
              formatted: `€${(metrics.arr / 1000000).toFixed(1)}M`
            },
            mrr: {
              value: metrics.mrr || 0,
              trend: metrics.mrr_trend || 'neutral',
              formatted: `€${(metrics.mrr / 1000).toFixed(0)}K`
            },
            ebitda: {
              value: metrics.ebitda_margin || 0,
              trend: metrics.ebitda_trend || 'neutral',
              formatted: `${metrics.ebitda_margin || 0}%`
            },
            ltvcac: {
              value: metrics.ltv_cac_ratio || 0,
              trend: metrics.ltv_cac_trend || 'neutral',
              formatted: `${metrics.ltv_cac_ratio || 0}:1`
            },
            nps: {
              value: metrics.nps || 0,
              trend: metrics.nps_trend || 'neutral',
              formatted: metrics.nps || 0
            }
          }
        },
        
        // Get alerts for command center
        getAlerts: () => {
          const { dashboardData } = get()
          if (!dashboardData) return []
          
          const alerts = []
          
          // Tâches urgentes
          if (dashboardData.tasks.urgent.length > 0) {
            alerts.push({
              id: 'urgent-tasks',
              type: 'critical',
              title: `${dashboardData.tasks.urgent.length} tâches urgentes`,
              description: 'À traiter aujourd\'hui',
              action: 'Voir les tâches'
            })
          }
          
          // Factures en retard
          if (dashboardData.invoices.overdue.length > 0) {
            alerts.push({
              id: 'overdue-invoices',
              type: 'warning',
              title: `${dashboardData.invoices.overdue.length} factures impayées`,
              description: `Total: €${(dashboardData.invoices.totalOverdue / 1000).toFixed(0)}K`,
              action: 'Relancer'
            })
          }
          
          // Cash runway faible
          const runway = dashboardData.metrics?.cash_runway
          if (runway && runway < 6) {
            alerts.push({
              id: 'low-runway',
              type: runway < 3 ? 'critical' : 'warning',
              title: `Cash runway: ${runway} mois`,
              description: 'Attention à la trésorerie',
              action: 'Analyser'
            })
          }
          
          return alerts
        }
      }),
      {
        name: 'dashboard-storage',
        partialize: (state) => ({ 
          selectedCompany: state.selectedCompany,
          selectedPeriod: state.selectedPeriod,
          preferences: state.preferences
        })
      }
    )
  )
)

export default useStore