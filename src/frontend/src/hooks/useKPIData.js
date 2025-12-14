import { useCallback, useEffect } from 'react'
import { useCachedData, cacheUtils } from './useCache'
import kpiAPI from '../services/api/kpi'

/**
 * Hook for fetching KPI data with caching and deduplication
 */

// Cache keys
const CACHE_KEYS = {
  OVERVIEW: 'kpi:overview',
  COMPANY: (company) => `kpi:company:${company}`,
  TRENDS: (period, company) => `kpi:trends:${period}:${company || 'all'}`
}

// Cache TTL configurations
const TTL = {
  OVERVIEW: 2 * 60 * 1000,      // 2 minutes for overview
  COMPANY: 5 * 60 * 1000,       // 5 minutes for company specific
  TRENDS: 10 * 60 * 1000,       // 10 minutes for trends
  LONG: 30 * 60 * 1000          // 30 minutes for rarely changing data
}

export function useKPIOverview(company = null) {
  const fetcher = useCallback(async () => {
    return await kpiAPI.getOverview(company)
  }, [company])

  const cacheKey = company ? CACHE_KEYS.COMPANY(company) : CACHE_KEYS.OVERVIEW

  return useCachedData(cacheKey, fetcher, {
    ttl: TTL.OVERVIEW,
    staleWhileRevalidate: true
  })
}

export function useCompanyKPIs(company) {
  const fetcher = useCallback(async () => {
    if (!company) return null
    return await kpiAPI.getCompanyKPIs(company)
  }, [company])

  return useCachedData(CACHE_KEYS.COMPANY(company), fetcher, {
    ttl: TTL.COMPANY,
    staleWhileRevalidate: true,
    enabled: !!company
  })
}

export function useKPITrends(period = '30d', company = null) {
  const fetcher = useCallback(async () => {
    return await kpiAPI.getTrends(period, company)
  }, [period, company])

  return useCachedData(CACHE_KEYS.TRENDS(period, company), fetcher, {
    ttl: TTL.TRENDS,
    staleWhileRevalidate: true
  })
}

// Batch fetcher for multiple companies
export function useMultipleCompanyKPIs(companies = []) {
  const fetcher = useCallback(async () => {
    if (!companies.length) return {}

    // Deduplicate and fetch in parallel
    const uniqueCompanies = [...new Set(companies)]
    const promises = uniqueCompanies.map(company => 
      kpiAPI.getCompanyKPIs(company)
        .then(data => ({ company, data }))
        .catch(error => ({ company, error }))
    )

    const results = await Promise.all(promises)
    
    // Transform to object
    return results.reduce((acc, { company, data, error }) => {
      acc[company] = error ? { error } : data
      return acc
    }, {})
  }, [companies])

  const cacheKey = `kpi:companies:${companies.sort().join(',')}`

  return useCachedData(cacheKey, fetcher, {
    ttl: TTL.COMPANY,
    staleWhileRevalidate: true,
    enabled: companies.length > 0
  })
}

// Hook for prefetching KPI data
export function useKPIPrefetch() {
  const prefetchOverview = useCallback(async () => {
    await cacheUtils.prefetch(
      CACHE_KEYS.OVERVIEW,
      () => kpiAPI.getOverview(),
      TTL.OVERVIEW
    )
  }, [])

  const prefetchCompany = useCallback(async (company) => {
    await cacheUtils.prefetch(
      CACHE_KEYS.COMPANY(company),
      () => kpiAPI.getCompanyKPIs(company),
      TTL.COMPANY
    )
  }, [])

  const prefetchTrends = useCallback(async (period = '30d', company = null) => {
    await cacheUtils.prefetch(
      CACHE_KEYS.TRENDS(period, company),
      () => kpiAPI.getTrends(period, company),
      TTL.TRENDS
    )
  }, [])

  return {
    prefetchOverview,
    prefetchCompany,
    prefetchTrends,
    prefetchAll: useCallback(async (companies = []) => {
      // Prefetch overview
      await prefetchOverview()
      
      // Prefetch each company in parallel
      await Promise.all(
        companies.map(company => prefetchCompany(company))
      )
      
      // Prefetch trends for common periods
      await Promise.all([
        prefetchTrends('7d'),
        prefetchTrends('30d'),
        prefetchTrends('90d')
      ])
    }, [prefetchOverview, prefetchCompany, prefetchTrends])
  }
}

// Hook for invalidating KPI cache
export function useKPIInvalidation() {
  const invalidateAll = useCallback(() => {
    cacheUtils.invalidate(/^kpi:/)
  }, [])

  const invalidateCompany = useCallback((company) => {
    cacheUtils.invalidate(CACHE_KEYS.COMPANY(company))
    // Also invalidate overview as it includes company data
    cacheUtils.invalidate(CACHE_KEYS.OVERVIEW)
  }, [])

  const invalidateTrends = useCallback(() => {
    cacheUtils.invalidate(/^kpi:trends:/)
  }, [])

  return {
    invalidateAll,
    invalidateCompany,
    invalidateTrends
  }
}

// Combined hook for complete KPI data management
export function useKPIData(options = {}) {
  const {
    company = null,
    period = '30d',
    prefetchOnMount = true
  } = options

  const overview = useKPIOverview(company)
  const trends = useKPITrends(period, company)
  const { prefetchAll } = useKPIPrefetch()
  const { invalidateAll } = useKPIInvalidation()

  // Prefetch related data on mount
  useEffect(() => {
    if (prefetchOnMount) {
      // Get list of companies from overview data
      if (overview.data?.summary) {
        const companies = ['HYPERVISUAL', 'DAINAMICS', 'LEXAIA', 'ENKI REALTY', 'TAKEOUT']
        prefetchAll(companies)
      }
    }
  }, [overview.data, prefetchOnMount, prefetchAll])

  // Aggregate loading and error states
  const loading = overview.loading || trends.loading
  const error = overview.error || trends.error
  const isStale = overview.isStale || trends.isStale

  const refresh = useCallback(async () => {
    await Promise.all([
      overview.refresh(true),
      trends.refresh(true)
    ])
  }, [overview, trends])

  return {
    overview: overview.data,
    trends: trends.data,
    loading,
    error,
    isStale,
    refresh,
    invalidate: invalidateAll
  }
}