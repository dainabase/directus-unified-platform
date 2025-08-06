import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

// Store principal du dashboard
export const useDashboardStore = create(
  devtools(
    persist(
      immer((set, get) => ({
        // État des données
        metrics: {
          operational: {
            tasks: {
              total: 0,
              thisWeek: 0,
              overdue: 0,
              urgent: 0,
              priorities: []
            },
            projects: {
              active: 0,
              inProgress: 0,
              waiting: 0,
              deliveriesPerWeek: 0,
              upcoming: []
            }
          },
          commercial: {
            pipeline: {
              total: 0,
              amount: 0,
              opportunities: 0,
              activeQuotes: { count: 0, amount: 0 },
              conversionRate: 0,
              monthlyClosing: 0,
              hotLeads: []
            },
            marketing: {
              visitorsPerDay: 0,
              leadsPerWeek: 0,
              conversionRate: 0,
              cac: 0,
              sources: {}
            }
          },
          financial: {
            treasury: {
              available: 0,
              runway: 0,
              burnRate: 0,
              forecast: 0,
              weeklyInflows: 0,
              weeklyOutflows: 0,
              cashFlow: []
            },
            invoices: {
              unpaid: { count: 0, amount: 0 },
              overdue30Days: { count: 0, amount: 0 },
              toIssue: 0,
              pending: 0,
              actions: []
            }
          },
          kpis: {
            runway: { value: 0, trend: 0, status: 'stable' },
            arr: { value: 0, trend: 0, status: 'growth' },
            ebitda: { value: 0, trend: 0, status: 'stable' },
            ltvcac: { value: 0, trend: 0, status: 'good' },
            nps: { value: 0, trend: 0, status: 'excellent' }
          }
        },
        
        // État des alertes
        alerts: {
          urgent: [],
          deadlines: [],
          financial: []
        },
        
        // État UI
        ui: {
          selectedCompany: null,
          selectedPortal: 'superadmin',
          refreshInterval: 30000, // 30 secondes
          lastUpdated: null,
          isLoading: false,
          errors: {}
        },
        
        // Filtres et préférences
        filters: {
          dateRange: 'last7days',
          companies: [],
          portals: [],
          showArchived: false
        },
        
        // Actions pour mettre à jour le store
        actions: {
          // Mettre à jour les métriques
          updateMetrics: (section, data) => set((state) => {
            state.metrics[section] = { ...state.metrics[section], ...data }
          }),
          
          // Mettre à jour toutes les métriques
          setAllMetrics: (metrics) => set((state) => {
            state.metrics = metrics
          }),
          
          // Mettre à jour les alertes
          updateAlerts: (alerts) => set((state) => {
            state.alerts = alerts
          }),
          
          // Ajouter une alerte
          addAlert: (type, alert) => set((state) => {
            state.alerts[type].push(alert)
          }),
          
          // Supprimer une alerte
          removeAlert: (type, alertId) => set((state) => {
            state.alerts[type] = state.alerts[type].filter(a => a.id !== alertId)
          }),
          
          // Mettre à jour l'UI
          updateUI: (updates) => set((state) => {
            state.ui = { ...state.ui, ...updates }
          }),
          
          // Sélectionner une entreprise
          selectCompany: (companyId) => set((state) => {
            state.ui.selectedCompany = companyId
          }),
          
          // Sélectionner un portail
          selectPortal: (portalId) => set((state) => {
            state.ui.selectedPortal = portalId
          }),
          
          // Toggle loading
          setLoading: (isLoading) => set((state) => {
            state.ui.isLoading = isLoading
          }),
          
          // Set error
          setError: (section, error) => set((state) => {
            if (error) {
              state.ui.errors[section] = error
            } else {
              delete state.ui.errors[section]
            }
          }),
          
          // Mettre à jour les filtres
          updateFilters: (filters) => set((state) => {
            state.filters = { ...state.filters, ...filters }
          }),
          
          // Reset complet du store
          reset: () => set((state) => {
            state.metrics = get().metrics
            state.alerts = { urgent: [], deadlines: [], financial: [] }
            state.ui.errors = {}
          })
        }
      })),
      {
        name: 'dashboard-storage',
        partialize: (state) => ({
          ui: {
            selectedCompany: state.ui.selectedCompany,
            selectedPortal: state.ui.selectedPortal,
            refreshInterval: state.ui.refreshInterval
          },
          filters: state.filters
        })
      }
    ),
    {
      name: 'DashboardStore'
    }
  )
)

// Sélecteurs pour accéder facilement aux données
export const dashboardSelectors = {
  // Sélecteurs de métriques
  getOperationalMetrics: (state) => state.metrics.operational,
  getCommercialMetrics: (state) => state.metrics.commercial,
  getFinancialMetrics: (state) => state.metrics.financial,
  getKPIs: (state) => state.metrics.kpis,
  
  // Sélecteurs d'alertes
  getUrgentAlerts: (state) => state.alerts.urgent,
  getDeadlineAlerts: (state) => state.alerts.deadlines,
  getFinancialAlerts: (state) => state.alerts.financial,
  getAllAlerts: (state) => [
    ...state.alerts.urgent,
    ...state.alerts.deadlines,
    ...state.alerts.financial
  ],
  getAlertsCount: (state) => ({
    urgent: state.alerts.urgent.length,
    deadlines: state.alerts.deadlines.length,
    financial: state.alerts.financial.length,
    total: state.alerts.urgent.length + state.alerts.deadlines.length + state.alerts.financial.length
  }),
  
  // Sélecteurs UI
  getSelectedCompany: (state) => state.ui.selectedCompany,
  getSelectedPortal: (state) => state.ui.selectedPortal,
  isLoading: (state) => state.ui.isLoading,
  getErrors: (state) => state.ui.errors,
  
  // Sélecteurs de filtres
  getFilters: (state) => state.filters,
  getDateRange: (state) => state.filters.dateRange
}

// Hook personnalisé pour les actions
export const useDashboardActions = () => {
  const actions = useDashboardStore((state) => state.actions)
  return actions
}