import { useQuery } from '@tanstack/react-query'
import { metricsAPI } from '../api/collections/metrics'

export const useMetrics = () => {
  return useQuery({
    queryKey: ['metrics'],
    queryFn: metricsAPI.getKPIs,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5 // Auto-refresh toutes les 5 minutes
  })
}

export const useAlerts = () => {
  return useQuery({
    queryKey: ['alerts'],
    queryFn: metricsAPI.getAlerts,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: 1000 * 60 * 2 // Auto-refresh toutes les 2 minutes
  })
}

export const useUrgentTasks = () => {
  return useQuery({
    queryKey: ['urgent-tasks'],
    queryFn: metricsAPI.getUrgentTasks,
    staleTime: 1000 * 60 * 5,
  })
}

export const useInsights = () => {
  return useQuery({
    queryKey: ['insights'],
    queryFn: metricsAPI.getInsights,
    staleTime: 1000 * 60 * 30, // 30 minutes
  })
}