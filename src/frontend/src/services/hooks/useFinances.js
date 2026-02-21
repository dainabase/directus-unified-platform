import { useQuery } from '@tanstack/react-query'
import { financesAPI } from '../api/collections/finances'

export const useCashFlow = (filters = {}) => {
  return useQuery({
    queryKey: ['cash-flow', filters],
    queryFn: () => financesAPI.getCashFlow(filters),
    staleTime: 1000 * 60 * 30, // 30 minutes
  })
}

export const useRevenue = (filters = {}) => {
  return useQuery({
    queryKey: ['revenue', filters],
    queryFn: async () => {
      const revenue = await financesAPI.getRevenue(filters);
      return revenue;
    },
    staleTime: 1000 * 60 * 15,
  })
}

export const useRunway = (filters = {}) => {
  return useQuery({
    queryKey: ['runway', filters],
    queryFn: async () => {
      const runway = await financesAPI.getRunway(filters);
      return runway;
    },
    staleTime: 1000 * 60 * 60, // 1 heure
  })
}