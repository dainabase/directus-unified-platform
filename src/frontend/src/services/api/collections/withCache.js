import { useCachedData, useMutation, cacheUtils } from '../../../hooks/useCache'

/**
 * Wrapper to add caching to existing collection services
 */

// Cache TTL configurations per collection
const CACHE_TTL = {
  finances: 5 * 60 * 1000,      // 5 minutes
  projects: 10 * 60 * 1000,     // 10 minutes  
  people: 15 * 60 * 1000,       // 15 minutes
  kpis: 2 * 60 * 1000,          // 2 minutes
  static: 60 * 60 * 1000        // 1 hour for rarely changing data
}

// Wrap collection fetch functions with caching
export function withCache(fetcher, options = {}) {
  const {
    key,
    ttl = CACHE_TTL.static,
    transform = (data) => data,
    invalidates = []
  } = options

  return function useCachedCollection(params = {}) {
    // Build cache key from params
    const cacheKey = typeof key === 'function' 
      ? key(params)
      : `${key}:${JSON.stringify(params)}`

    // Wrapped fetcher with params
    const wrappedFetcher = () => fetcher(params).then(transform)

    return useCachedData(cacheKey, wrappedFetcher, { ttl })
  }
}

// Common cache wrappers for collections
export const cachedCollections = {
  // Finance data
  useFinances: (params) => {
    const cacheKey = params.company 
      ? `finances:${params.company}:${params.period || '30d'}`
      : `finances:all:${params.period || '30d'}`
    
    return useCachedData(
      cacheKey,
      () => import('./finances').then(m => m.getFinanceData(params)),
      { ttl: CACHE_TTL.finances }
    )
  },

  // Projects data
  useProjects: (params) => {
    const cacheKey = params.company 
      ? `projects:${params.company}:${params.status || 'all'}`
      : `projects:all:${params.status || 'all'}`
    
    return useCachedData(
      cacheKey,
      () => import('./projects').then(m => m.getProjects(params)),
      { ttl: CACHE_TTL.projects }
    )
  },

  // People data
  usePeople: (params) => {
    const cacheKey = params.company 
      ? `people:${params.company}:${params.role || 'all'}`
      : `people:all:${params.role || 'all'}`
    
    return useCachedData(
      cacheKey,
      () => import('./people').then(m => m.getPeople(params)),
      { ttl: CACHE_TTL.people }
    )
  },

  // KPIs data
  useKPIs: (params) => {
    const cacheKey = `kpis:${params.metric}:${params.period || '30d'}`
    
    return useCachedData(
      cacheKey,
      () => import('./kpis').then(m => m.getKPIs(params)),
      { ttl: CACHE_TTL.kpis }
    )
  }
}

// Mutations with cache invalidation
export const cachedMutations = {
  // Update project
  useUpdateProject: () => {
    return useMutation(
      (variables) => import('./projects').then(m => m.updateProject(variables)),
      {
        invalidateKeys: [
          /^projects:/,
          /^kpi:/
        ],
        onSuccess: (data, variables) => {
          // Update specific project in cache
          const key = `project:${variables.id}`
          cacheUtils.set(key, data)
        }
      }
    )
  },

  // Create invoice
  useCreateInvoice: () => {
    return useMutation(
      (variables) => import('./finances').then(m => m.createInvoice(variables)),
      {
        invalidateKeys: [
          /^finances:/,
          /^kpi:/
        ]
      }
    )
  },

  // Update person
  useUpdatePerson: () => {
    return useMutation(
      (variables) => import('./people').then(m => m.updatePerson(variables)),
      {
        invalidateKeys: [
          /^people:/,
          (vars) => `person:${vars.id}`
        ]
      }
    )
  }
}

// Batch fetching with deduplication
export function useBatchFetch(requests) {
  const results = []
  
  requests.forEach(({ collection, params, key }) => {
    const hook = cachedCollections[collection]
    if (hook) {
      results.push({
        key,
        ...hook(params)
      })
    }
  })

  // Aggregate states
  const loading = results.some(r => r.loading)
  const error = results.find(r => r.error)?.error
  const data = results.reduce((acc, r) => {
    if (r.data) {
      acc[r.key] = r.data
    }
    return acc
  }, {})

  return { data, loading, error }
}

// Prefetch utilities
export const prefetchUtils = {
  // Prefetch dashboard data
  prefetchDashboard: async (company = null) => {
    const collections = [
      { key: 'finances', params: { company, period: '30d' } },
      { key: 'projects', params: { company, status: 'active' } },
      { key: 'people', params: { company } },
      { key: 'kpis', params: { metric: 'all', period: '30d' } }
    ]

    await Promise.all(
      collections.map(({ key, params }) => {
        const cacheKey = `${key}:${JSON.stringify(params)}`
        return cacheUtils.prefetch(
          cacheKey,
          () => import(`./${key}`).then(m => m[`get${key.charAt(0).toUpperCase() + key.slice(1)}`](params)),
          CACHE_TTL[key]
        )
      })
    )
  },

  // Prefetch company data
  prefetchCompany: async (company) => {
    const promises = [
      cacheUtils.prefetch(
        `finances:${company}:30d`,
        () => import('./finances').then(m => m.getFinanceData({ company })),
        CACHE_TTL.finances
      ),
      cacheUtils.prefetch(
        `projects:${company}:all`,
        () => import('./projects').then(m => m.getProjects({ company })),
        CACHE_TTL.projects
      ),
      cacheUtils.prefetch(
        `people:${company}:all`,
        () => import('./people').then(m => m.getPeople({ company })),
        CACHE_TTL.people
      )
    ]

    await Promise.all(promises)
  }
}

// Export cache management utilities
export { cacheUtils }