import { useQuery } from '@tanstack/react-query'
import { companiesAPI } from '../api/collections/companies'

export const useCompanies = () => {
  return useQuery({
    queryKey: ['companies'],
    queryFn: companiesAPI.getAll,
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

export const useCompanyMetrics = (companyId) => {
  return useQuery({
    queryKey: ['company-metrics', companyId],
    queryFn: () => companiesAPI.getMetrics(companyId),
    enabled: !!companyId && companyId !== 'all',
    staleTime: 1000 * 60 * 5,
  })
}