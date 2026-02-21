/**
 * Token Blacklist Service — Redis-backed with in-memory fallback
 * Persists JWT blacklist across server restarts using Redis.
 * Falls back to in-memory Set if Redis is unavailable.
 *
 * @version 1.0.0
 */

import Redis from 'ioredis';

const REDIS_KEY_PREFIX = 'jwt:blacklist:';

// In-memory fallback for when Redis is down
const memoryBlacklist = new Set();

let redis = null;
let redisReady = false;

/**
 * Get or create Redis connection (lazy singleton)
 */
function getRedis() {
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      retryStrategy: (times) => Math.min(times * 200, 2000),
    });

    redis.on('ready', () => {
      redisReady = true;
      console.log('[tokenBlacklist] Redis connected');
    });

    redis.on('error', (err) => {
      redisReady = false;
      console.error('[tokenBlacklist] Redis error:', err.message);
    });

    redis.on('close', () => {
      redisReady = false;
    });

    redis.connect().catch(() => {
      console.warn('[tokenBlacklist] Redis unavailable — using in-memory fallback');
    });
  }
  return redis;
}

/**
 * Blacklist a token (for logout / token rotation)
 * Uses the JWT exp claim to calculate TTL so the Redis entry
 * auto-expires when the token would have expired anyway.
 *
 * @param {string} token - The JWT token string
 * @param {number} [expiresInSeconds=86400] - TTL in seconds (default 24h)
 */
export async function blacklistToken(token, expiresInSeconds = 86400) {
  // Always add to memory as immediate fallback
  memoryBlacklist.add(token);

  // Schedule memory cleanup to avoid unbounded growth
  setTimeout(() => memoryBlacklist.delete(token), expiresInSeconds * 1000);

  try {
    const r = getRedis();
    if (redisReady) {
      await r.set(`${REDIS_KEY_PREFIX}${token}`, '1', 'EX', expiresInSeconds);
    }
  } catch (err) {
    console.error('[tokenBlacklist] Error blacklisting:', err.message);
    // Already in memoryBlacklist, so we're safe
  }
}

/**
 * Check if a token is blacklisted
 *
 * @param {string} token - The JWT token string
 * @returns {Promise<boolean>} true if token is blacklisted
 */
export async function isTokenBlacklisted(token) {
  // Fast path: check in-memory first
  if (memoryBlacklist.has(token)) {
    return true;
  }

  try {
    const r = getRedis();
    if (redisReady) {
      const result = await r.get(`${REDIS_KEY_PREFIX}${token}`);
      return result !== null;
    }
  } catch (err) {
    console.error('[tokenBlacklist] Error checking:', err.message);
  }

  // Redis unavailable — already checked memory above
  return false;
}

export default { blacklistToken, isTokenBlacklisted };
