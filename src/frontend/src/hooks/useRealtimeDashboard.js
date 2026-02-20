/**
 * useRealtimeDashboard — Story 2.12
 * Aggregates all dashboard data fetching with 30s polling.
 * Uses TanStack Query's queryClient.invalidateQueries for refresh.
 *
 * On each poll cycle, all dashboard-related query keys are invalidated,
 * triggering TanStack Query to re-fetch cached data in the background.
 *
 * @param {string} selectedCompany - Company filter (reserved for future per-company logic)
 * @returns {{ lastUpdated: Date|null, isRefreshing: boolean, forceRefresh: Function }}
 */

import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { usePolling } from './usePolling'

const DASHBOARD_QUERY_KEYS = [
  ['dashboard-kpis'],
  ['alerts'],
  ['pipeline'],
  ['treasury'],
  ['active-projects'],
  ['kpis-latest'],
  ['treasury-forecast'],
]

const DEFAULT_INTERVAL_MS = 30_000

export function useRealtimeDashboard(selectedCompany, { enabled = true, intervalMs = DEFAULT_INTERVAL_MS } = {}) {
  const queryClient = useQueryClient()

  const invalidateAllDashboardQueries = useCallback(async () => {
    const promises = DASHBOARD_QUERY_KEYS.map((queryKey) =>
      queryClient.invalidateQueries({ queryKey })
    )
    await Promise.all(promises)
  }, [queryClient])

  const { lastUpdated, isRefreshing } = usePolling(
    invalidateAllDashboardQueries,
    intervalMs,
    enabled
  )

  const forceRefresh = useCallback(() => {
    invalidateAllDashboardQueries()
  }, [invalidateAllDashboardQueries])

  return { lastUpdated, isRefreshing, forceRefresh }
}

export default useRealtimeDashboard
