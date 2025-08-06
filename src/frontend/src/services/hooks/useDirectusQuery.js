import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import directusAPI from '../api/directus'
import useStore from '../state/store'

// Hook pour les métriques KPI
export const useKPIMetrics = () => {
  const selectedCompany = useStore(state => state.selectedCompany)
  const selectedPeriod = useStore(state => state.selectedPeriod)
  
  return useQuery({
    queryKey: ['kpi-metrics', selectedCompany, selectedPeriod],
    queryFn: () => directusAPI.getKPIMetrics(selectedCompany, selectedPeriod),
    staleTime: 30000, // 30 secondes
    refetchInterval: 60000, // 1 minute
    refetchOnWindowFocus: true
  })
}

// Hook pour les tâches urgentes
export const useUrgentTasks = () => {
  const selectedCompany = useStore(state => state.selectedCompany)
  
  return useQuery({
    queryKey: ['urgent-tasks', selectedCompany],
    queryFn: () => directusAPI.getUrgentTasks(selectedCompany),
    staleTime: 30000,
    refetchInterval: 60000
  })
}

// Hook pour les projets actifs
export const useActiveProjects = () => {
  const selectedCompany = useStore(state => state.selectedCompany)
  
  return useQuery({
    queryKey: ['active-projects', selectedCompany],
    queryFn: () => directusAPI.getProjects('active', selectedCompany),
    staleTime: 60000,
    refetchInterval: 120000
  })
}

// Hook pour le pipeline commercial
export const usePipeline = () => {
  const selectedCompany = useStore(state => state.selectedCompany)
  
  return useQuery({
    queryKey: ['pipeline', selectedCompany],
    queryFn: () => directusAPI.getPipeline(selectedCompany),
    staleTime: 60000,
    refetchInterval: 120000
  })
}

// Hook pour les factures impayées
export const useUnpaidInvoices = () => {
  const selectedCompany = useStore(state => state.selectedCompany)
  
  return useQuery({
    queryKey: ['unpaid-invoices', selectedCompany],
    queryFn: () => directusAPI.getUnpaidInvoices(selectedCompany),
    staleTime: 60000,
    refetchInterval: 300000 // 5 minutes
  })
}

// Hook pour le cash flow
export const useCashFlow = (days = 7) => {
  const selectedCompany = useStore(state => state.selectedCompany)
  
  return useQuery({
    queryKey: ['cash-flow', selectedCompany, days],
    queryFn: () => directusAPI.getCashFlow(selectedCompany, days),
    staleTime: 60000,
    refetchInterval: 300000
  })
}

// Hook pour toutes les données du dashboard
export const useDashboardData = () => {
  const selectedCompany = useStore(state => state.selectedCompany)
  
  return useQuery({
    queryKey: ['dashboard-data', selectedCompany],
    queryFn: () => directusAPI.getDashboardData(selectedCompany),
    staleTime: 30000,
    refetchInterval: 60000,
    refetchOnWindowFocus: true
  })
}

// Hook pour rafraîchir manuellement
export const useRefreshDashboard = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async () => {
      await queryClient.invalidateQueries({ queryKey: ['dashboard-data'] })
      await queryClient.invalidateQueries({ queryKey: ['kpi-metrics'] })
      await queryClient.invalidateQueries({ queryKey: ['urgent-tasks'] })
      await queryClient.invalidateQueries({ queryKey: ['active-projects'] })
      await queryClient.invalidateQueries({ queryKey: ['pipeline'] })
      await queryClient.invalidateQueries({ queryKey: ['unpaid-invoices'] })
      await queryClient.invalidateQueries({ queryKey: ['cash-flow'] })
    },
    onSuccess: () => {
      console.log('Dashboard refreshed successfully')
    }
  })
}