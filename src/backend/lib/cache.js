/**
 * Redis Cache Utility — HYPERVISUAL Platform
 * Provides caching layer for expensive API calls and aggregations.
 * Falls back gracefully to no-cache if Redis is unavailable.
 */

import Redis from 'ioredis'

let redis = null
let cacheEnabled = false

/**
 * Initialize Redis connection
 */
export function initCache() {
  const url = process.env.REDIS_URL || 'redis://localhost:6379'
  try {
    redis = new Redis(url, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => Math.min(times * 200, 3000),
      lazyConnect: true,
    })

    redis.on('connect', () => {
      cacheEnabled = true
      console.log('[cache] Redis connected')
    })

    redis.on('error', (err) => {
      cacheEnabled = false
      console.warn('[cache] Redis error:', err.message)
    })

    redis.connect().catch(() => {
      console.warn('[cache] Redis unavailable — running without cache')
    })
  } catch (err) {
    console.warn('[cache] Redis init failed:', err.message)
  }
}

/**
 * Get cached value
 * @param {string} key
 * @returns {any|null}
 */
export async function cacheGet(key) {
  if (!cacheEnabled || !redis) return null
  try {
    const val = await redis.get(`hv:${key}`)
    return val ? JSON.parse(val) : null
  } catch { return null }
}

/**
 * Set cached value with TTL
 * @param {string} key
 * @param {any} value
 * @param {number} ttl - Time to live in seconds (default 300 = 5 minutes)
 */
export async function cacheSet(key, value, ttl = 300) {
  if (!cacheEnabled || !redis) return
  try {
    await redis.set(`hv:${key}`, JSON.stringify(value), 'EX', ttl)
  } catch { /* silent fail */ }
}

/**
 * Delete cached key
 */
export async function cacheDel(key) {
  if (!cacheEnabled || !redis) return
  try {
    await redis.del(`hv:${key}`)
  } catch { /* silent fail */ }
}

/**
 * Clear all cache with prefix
 */
export async function cacheClear(pattern = 'hv:*') {
  if (!cacheEnabled || !redis) return
  try {
    const keys = await redis.keys(pattern)
    if (keys.length) await redis.del(...keys)
  } catch { /* silent fail */ }
}

/**
 * Express middleware: cache GET responses
 * @param {number} ttl - TTL in seconds
 */
export function cacheMiddleware(ttl = 300) {
  return async (req, res, next) => {
    if (req.method !== 'GET') return next()

    const key = `route:${req.originalUrl}`
    const cached = await cacheGet(key)

    if (cached) {
      res.set('X-Cache', 'HIT')
      return res.json(cached)
    }

    // Intercept res.json to cache the response
    const originalJson = res.json.bind(res)
    res.json = (data) => {
      if (res.statusCode === 200) {
        cacheSet(key, data, ttl).catch(() => {})
      }
      res.set('X-Cache', 'MISS')
      return originalJson(data)
    }

    next()
  }
}

export default { initCache, cacheGet, cacheSet, cacheDel, cacheClear, cacheMiddleware }
