import { useQuery } from '@tanstack/react-query'
import { metricsAPI } from '../api/collections/metrics'

export const useMetrics = (filters = {}) => {
  return useQuery({
    queryKey: ['metrics', filters],
    queryFn: () => metricsAPI.getKPIs(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5 // Auto-refresh toutes les 5 minutes
  })
}

export const useAlerts = (filters = {}) => {
  return useQuery({
    queryKey: ['alerts', filters],
    queryFn: () => metricsAPI.getAlerts(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: 1000 * 60 * 2 // Auto-refresh toutes les 2 minutes
  })
}

export const useUrgentTasks = (filters = {}) => {
  return useQuery({
    queryKey: ['urgent-tasks', filters],
    queryFn: () => metricsAPI.getUrgentTasks(filters),
    staleTime: 1000 * 60 * 5,
  })
}

export const useInsights = (filters = {}) => {
  return useQuery({
    queryKey: ['insights', filters],
    queryFn: () => metricsAPI.getInsights(filters),
    staleTime: 1000 * 60 * 30, // 30 minutes
  })
}