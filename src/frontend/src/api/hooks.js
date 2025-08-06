import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { directusAPI, mockDataGenerator } from './directus'
import { useDashboardStore, useDashboardActions } from '../stores/dashboardStore'

// Configuration
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true' || true // Pour dev

// Hook pour récupérer les données du dashboard
export const useDashboardData = (companyId, options = {}) => {
  const { updateMetrics, updateAlerts, setLoading, setError } = useDashboardActions()
  
  return useQuery({
    queryKey: ['dashboard', companyId, options.dateRange],
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        // Simuler un délai réseau
        await new Promise(resolve => setTimeout(resolve, 500))
        const data = mockDataGenerator.generateDashboardData()
        const alerts = mockDataGenerator.generateAlerts()
        
        // Mettre à jour le store
        updateMetrics('operational', data.operational)
        updateMetrics('commercial', data.commercial)
        updateMetrics('financial', data.financial)
        updateMetrics('kpis', data.kpis)
        updateAlerts(alerts)
        
        return { metrics: data, alerts }
      }
      
      // Vraies données Directus
      const metrics = await directusAPI.dashboard.getMetrics(companyId, options.dateRange)
      const alerts = await directusAPI.dashboard.getAlerts(companyId)
      
      // Transformer et mettre à jour le store
      const transformedData = transformMetricsData(metrics)
      const transformedAlerts = transformAlertsData(alerts)
      
      updateMetrics('operational', transformedData.operational)
      updateMetrics('commercial', transformedData.commercial)
      updateMetrics('financial', transformedData.financial)
      updateMetrics('kpis', transformedData.kpis)
      updateAlerts(transformedAlerts)
      
      return { metrics: transformedData, alerts: transformedAlerts }
    },
    refetchInterval: options.refreshInterval || 30000, // 30 secondes par défaut
    staleTime: 10000, // Les données sont considérées fraîches pendant 10 secondes
    cacheTime: 300000, // Cache pendant 5 minutes
    onError: (error) => {
      setError('dashboard', error.message)
      console.error('Dashboard data error:', error)
    },
    ...options
  })
}

// Hook pour récupérer les entreprises
export const useCompanies = () => {
  return useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        return [
          { id: 1, name: 'Entreprise A', logo: null },
          { id: 2, name: 'Entreprise B', logo: null },
          { id: 3, name: 'Entreprise C', logo: null }
        ]
      }
      return await directusAPI.companies.getAll()
    },
    staleTime: 600000, // 10 minutes
    cacheTime: 3600000 // 1 heure
  })
}

// Hook pour l'historique des KPIs
export const useKPIHistory = (companyId, kpiType, days = 7) => {
  return useQuery({
    queryKey: ['kpi-history', companyId, kpiType, days],
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        // Générer des données mock pour l'historique
        const history = []
        for (let i = days; i >= 0; i--) {
          const date = new Date()
          date.setDate(date.getDate() - i)
          history.push({
            date: date.toISOString(),
            value: Math.random() * 100 + 50
          })
        }
        return history
      }
      return await directusAPI.dashboard.getKPIHistory(companyId, kpiType, days)
    },
    staleTime: 300000, // 5 minutes
    cacheTime: 600000 // 10 minutes
  })
}

// Hook pour marquer une alerte comme lue
export const useMarkAlertAsRead = () => {
  const queryClient = useQueryClient()
  const { removeAlert } = useDashboardActions()
  
  return useMutation({
    mutationFn: async ({ alertId, type }) => {
      if (USE_MOCK_DATA) {
        // Simulation
        await new Promise(resolve => setTimeout(resolve, 300))
        return { success: true }
      }
      // TODO: Implémenter l'API Directus pour marquer comme lu
      return { success: true }
    },
    onSuccess: (data, { alertId, type }) => {
      removeAlert(type, alertId)
      queryClient.invalidateQueries(['dashboard'])
    }
  })
}

// Hook pour rafraîchir les données
export const useRefreshDashboard = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async () => {
      await queryClient.invalidateQueries(['dashboard'])
      return { refreshed: true }
    }
  })
}

// Transformations des données
function transformMetricsData(rawData) {
  // TODO: Implémenter la transformation des données Directus
  // Pour l'instant, retourner la structure attendue
  return {
    operational: {
      tasks: rawData.tasks || {},
      projects: rawData.projects || {}
    },
    commercial: {
      pipeline: rawData.opportunities || {},
      marketing: rawData.marketing || {}
    },
    financial: {
      treasury: rawData.financial || {},
      invoices: rawData.invoices || {}
    },
    kpis: {
      // Calculer les KPIs à partir des données
      runway: calculateRunway(rawData.financial),
      arr: calculateARR(rawData.invoices),
      ebitda: calculateEBITDA(rawData.financial),
      ltvcac: calculateLTVCAC(rawData.marketing, rawData.invoices),
      nps: calculateNPS(rawData.marketing)
    }
  }
}

function transformAlertsData(rawAlerts) {
  // Classer les alertes par type
  const alerts = {
    urgent: [],
    deadlines: [],
    financial: []
  }
  
  rawAlerts.forEach(alert => {
    if (alert.priority === 'critical' || alert.priority === 'high') {
      alerts.urgent.push(alert)
    } else if (alert.type === 'deadline' || alert.type === 'task') {
      alerts.deadlines.push(alert)
    } else if (alert.type === 'financial' || alert.type === 'invoice') {
      alerts.financial.push(alert)
    }
  })
  
  return alerts
}

// Calculs de KPIs (exemples)
function calculateRunway(financial) {
  if (!financial || !financial.available || !financial.burnRate) {
    return { value: 0, trend: 0, status: 'unknown' }
  }
  const runway = financial.available / financial.burnRate
  return {
    value: runway,
    trend: 0, // TODO: Calculer la tendance
    status: runway > 12 ? 'excellent' : runway > 6 ? 'good' : 'warning'
  }
}

function calculateARR(invoices) {
  // TODO: Implémenter le calcul réel
  return { value: 2400000, trend: 23, status: 'growth' }
}

function calculateEBITDA(financial) {
  // TODO: Implémenter le calcul réel
  return { value: 18.5, trend: 2.3, status: 'growth' }
}

function calculateLTVCAC(marketing, invoices) {
  // TODO: Implémenter le calcul réel
  return { value: 4.2, trend: 0.2, status: 'good' }
}

function calculateNPS(marketing) {
  // TODO: Implémenter le calcul réel
  return { value: 72, trend: 2, status: 'excellent' }
}