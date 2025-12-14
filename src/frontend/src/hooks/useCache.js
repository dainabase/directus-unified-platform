import { useState, useRef, useCallback, useEffect } from 'react'

/**
 * Cache Hook for optimizing data fetching and preventing unnecessary requests
 * Implements LRU (Least Recently Used) cache with TTL (Time To Live)
 */

class CacheStore {
  constructor(maxSize = 50, defaultTTL = 5 * 60 * 1000) { // 5 minutes default
    this.cache = new Map()
    this.maxSize = maxSize
    this.defaultTTL = defaultTTL
    this.accessOrder = []
  }

  get(key) {
    const item = this.cache.get(key)
    if (!item) return null
    
    // Check if expired
    if (item.expiry && Date.now() > item.expiry) {
      this.delete(key)
      return null
    }
    
    // Update access order (LRU)
    this.updateAccessOrder(key)
    
    return item.value
  }

  set(key, value, ttl = this.defaultTTL) {
    // If cache is full, remove least recently used
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const lru = this.accessOrder[0]
      this.delete(lru)
    }
    
    const expiry = ttl ? Date.now() + ttl : null
    this.cache.set(key, { value, expiry })
    this.updateAccessOrder(key)
  }

  delete(key) {
    this.cache.delete(key)
    this.accessOrder = this.accessOrder.filter(k => k !== key)
  }

  clear() {
    this.cache.clear()
    this.accessOrder = []
  }

  updateAccessOrder(key) {
    this.accessOrder = this.accessOrder.filter(k => k !== key)
    this.accessOrder.push(key)
  }

  has(key) {
    const item = this.cache.get(key)
    if (!item) return false
    
    if (item.expiry && Date.now() > item.expiry) {
      this.delete(key)
      return false
    }
    
    return true
  }
}

// Global cache instance
const globalCache = new CacheStore()

export function useCache(key, fetcher, options = {}) {
  const {
    ttl = 5 * 60 * 1000, // 5 minutes
    staleWhileRevalidate = true,
    onError = console.error,
    enabled = true
  } = options

  const [data, setData] = useState(() => globalCache.get(key))
  const [loading, setLoading] = useState(!data)
  const [error, setError] = useState(null)
  const [isStale, setIsStale] = useState(false)
  
  const fetcherRef = useRef(fetcher)
  const isFetchingRef = useRef(false)
  
  // Update fetcher ref on each render
  useEffect(() => {
    fetcherRef.current = fetcher
  })

  const refresh = useCallback(async (force = false) => {
    if (!enabled) return
    if (isFetchingRef.current && !force) return

    try {
      isFetchingRef.current = true
      
      // Check cache first if not forcing refresh
      if (!force && globalCache.has(key)) {
        const cached = globalCache.get(key)
        setData(cached)
        setLoading(false)
        setIsStale(false)
        return cached
      }

      // If stale while revalidate, return stale data immediately
      if (staleWhileRevalidate && data && !force) {
        setIsStale(true)
      } else {
        setLoading(true)
      }

      // Fetch fresh data
      const freshData = await fetcherRef.current()
      
      // Update cache
      globalCache.set(key, freshData, ttl)
      
      // Update state
      setData(freshData)
      setError(null)
      setIsStale(false)
      
      return freshData
    } catch (err) {
      setError(err)
      onError(err)
      throw err
    } finally {
      setLoading(false)
      isFetchingRef.current = false
    }
  }, [key, ttl, staleWhileRevalidate, onError, data, enabled])

  // Initial fetch
  useEffect(() => {
    if (enabled && !data) {
      refresh()
    }
  }, [enabled, refresh])

  // Prefetch function
  const prefetch = useCallback(async () => {
    if (!enabled || globalCache.has(key)) return
    
    try {
      const data = await fetcherRef.current()
      globalCache.set(key, data, ttl)
    } catch (err) {
      // Silent fail for prefetch
    }
  }, [key, ttl, enabled])

  // Invalidate cache
  const invalidate = useCallback(() => {
    globalCache.delete(key)
    setData(null)
    setIsStale(false)
  }, [key])

  return {
    data,
    loading,
    error,
    isStale,
    refresh,
    prefetch,
    invalidate,
    mutate: (newData) => {
      globalCache.set(key, newData, ttl)
      setData(newData)
      setIsStale(false)
    }
  }
}

// Hook for deduplication of concurrent requests
export function useDeduplication() {
  const pendingRequests = useRef(new Map())

  const dedupeFetch = useCallback(async (key, fetcher) => {
    // If there's already a pending request for this key, return it
    if (pendingRequests.current.has(key)) {
      return pendingRequests.current.get(key)
    }

    // Create new promise and store it
    const promise = fetcher().finally(() => {
      // Clean up after completion
      pendingRequests.current.delete(key)
    })

    pendingRequests.current.set(key, promise)
    return promise
  }, [])

  return { dedupeFetch }
}

// Combined hook for cached and deduplicated fetching
export function useCachedData(key, fetcher, options = {}) {
  const { dedupeFetch } = useDeduplication()
  
  const wrappedFetcher = useCallback(() => {
    return dedupeFetch(key, fetcher)
  }, [key, fetcher, dedupeFetch])

  return useCache(key, wrappedFetcher, options)
}

// Utility functions for cache management
export const cacheUtils = {
  clear: () => globalCache.clear(),
  invalidate: (pattern) => {
    if (pattern instanceof RegExp) {
      Array.from(globalCache.cache.keys()).forEach(key => {
        if (pattern.test(key)) {
          globalCache.delete(key)
        }
      })
    } else {
      globalCache.delete(pattern)
    }
  },
  prefetch: async (key, fetcher, ttl) => {
    if (!globalCache.has(key)) {
      try {
        const data = await fetcher()
        globalCache.set(key, data, ttl)
      } catch (err) {
        // Silent fail for prefetch
      }
    }
  }
}

// React Query style mutation hook
export function useMutation(mutationFn, options = {}) {
  const {
    onSuccess,
    onError,
    onSettled,
    invalidateKeys = []
  } = options

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  const mutate = useCallback(async (variables) => {
    setLoading(true)
    setError(null)

    try {
      const result = await mutationFn(variables)
      setData(result)

      // Invalidate related cache keys
      invalidateKeys.forEach(key => {
        if (typeof key === 'function') {
          cacheUtils.invalidate(key(variables))
        } else {
          cacheUtils.invalidate(key)
        }
      })

      if (onSuccess) {
        await onSuccess(result, variables)
      }

      return result
    } catch (err) {
      setError(err)
      if (onError) {
        onError(err, variables)
      }
      throw err
    } finally {
      setLoading(false)
      if (onSettled) {
        onSettled(data, error, variables)
      }
    }
  }, [mutationFn, onSuccess, onError, onSettled, invalidateKeys, data, error])

  return {
    mutate,
    loading,
    error,
    data,
    reset: () => {
      setData(null)
      setError(null)
      setLoading(false)
    }
  }
}