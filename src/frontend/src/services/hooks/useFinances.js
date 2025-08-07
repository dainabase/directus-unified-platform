import { useQuery } from '@tanstack/react-query'
import { financesAPI } from '../api/collections/finances'

export const useCashFlow = (year) => {
  return useQuery({
    queryKey: ['cash-flow', year],
    queryFn: () => financesAPI.getCashFlow(year),
    staleTime: 1000 * 60 * 30, // 30 minutes
  })
}

export const useRevenue = () => {
  return useQuery({
    queryKey: ['revenue'],
    queryFn: financesAPI.getRevenue,
    staleTime: 1000 * 60 * 15,
  })
}

export const useRunway = () => {
  return useQuery({
    queryKey: ['runway'],
    queryFn: financesAPI.getRunway,
    staleTime: 1000 * 60 * 60, // 1 heure
  })
}