/**
 * useFinance — S-03-06
 * Hook TanStack Query pour les donnees finance.
 * Remplace useFinanceData (fetch direct) par des queries cachees.
 */

import { useQuery } from '@tanstack/react-query'
import {
  fetchFinanceKPIs,
  fetchRecentTransactions,
  fetchCashFlowEvolution,
  fetchFinanceAlerts
} from '../services/api/finance'

export function useFinanceKPIs(company) {
  return useQuery({
    queryKey: ['finance-kpis', company],
    queryFn: () => fetchFinanceKPIs(company),
    staleTime: 30_000,
    refetchInterval: 60_000
  })
}

export function useRecentTransactions(company, limit = 10) {
  return useQuery({
    queryKey: ['finance-transactions', company, limit],
    queryFn: () => fetchRecentTransactions(company, limit),
    staleTime: 30_000,
    refetchInterval: 60_000
  })
}

export function useCashFlowEvolution(company) {
  return useQuery({
    queryKey: ['finance-evolution', company],
    queryFn: () => fetchCashFlowEvolution(company),
    staleTime: 120_000 // 2 min — ce calcul est couteux
  })
}

export function useFinanceAlerts(company) {
  return useQuery({
    queryKey: ['finance-alerts', company],
    queryFn: () => fetchFinanceAlerts(company),
    staleTime: 60_000
  })
}

/**
 * Hook unifie — retourne toutes les donnees finance
 */
export function useFinance(company) {
  const kpis = useFinanceKPIs(company)
  const transactions = useRecentTransactions(company)
  const evolution = useCashFlowEvolution(company)
  const alerts = useFinanceAlerts(company)

  return {
    kpis: kpis.data,
    kpisLoading: kpis.isLoading,
    transactions: transactions.data || [],
    transactionsLoading: transactions.isLoading,
    evolution: evolution.data || [],
    evolutionLoading: evolution.isLoading,
    alerts: alerts.data || [],
    alertsLoading: alerts.isLoading,
    isLoading: kpis.isLoading,
    error: kpis.error || transactions.error || evolution.error || alerts.error,
    refetch: () => {
      kpis.refetch()
      transactions.refetch()
      evolution.refetch()
      alerts.refetch()
    }
  }
}

export default useFinance
