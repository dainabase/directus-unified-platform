/**
 * Revolut Token Manager
 * Handles automatic token refresh before 40min expiration.
 * Tokens stored in-memory with Redis fallback when available.
 *
 * Revolut OAuth2 tokens expire after 40 minutes.
 * This manager proactively refreshes tokens 5 minutes before expiry.
 *
 * @version 1.0.0
 * @date 2026-02-20
 */

import axios from 'axios';
import crypto from 'crypto';
import { createPrivateKey, createSign } from 'crypto';

// ── Constants ──

const TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000; // Refresh 5 minutes before expiry
const TOKEN_DEFAULT_TTL_MS = 40 * 60 * 1000;    // Revolut tokens last 40 minutes
const REDIS_KEY_PREFIX = 'revolut:token:';

const REVOLUT_TOKEN_URL_PRODUCTION = 'https://b2b.revolut.com/api/1.0/auth/token';
const REVOLUT_TOKEN_URL_SANDBOX = 'https://sandbox-b2b.revolut.com/api/1.0/auth/token';

// ── In-memory store ──
// Map<companyId, { access_token, refresh_token, expires_at, warning }>

const tokenStore = new Map();

// ── Redis client (lazy init) ──

let redisClient = null;
let redisAvailable = false;

async function getRedisClient() {
  if (redisClient !== null) return redisClient;
  if (!process.env.REDIS_URL) {
    redisClient = false;
    return false;
  }

  try {
    const { createClient } = await import('redis');
    redisClient = createClient({ url: process.env.REDIS_URL });

    redisClient.on('error', (err) => {
      console.warn('[Revolut TokenManager] Redis error:', err.message);
      redisAvailable = false;
    });

    redisClient.on('connect', () => {
      redisAvailable = true;
    });

    await redisClient.connect();
    redisAvailable = true;
    console.log('[Revolut TokenManager] Redis connected for token persistence');
    return redisClient;
  } catch (err) {
    console.warn('[Revolut TokenManager] Redis unavailable, using in-memory only:', err.message);
    redisClient = false;
    redisAvailable = false;
    return false;
  }
}

// ── JWT Assertion Generator ──

/**
 * Generate a JWT client assertion for Revolut OAuth2 token requests.
 * Uses RS256 signing with the private key from REVOLUT_PRIVATE_KEY or
 * REVOLUT_PRIVATE_KEY_PATH environment variable.
 */
function generateClientAssertion() {
  const clientId = process.env.REVOLUT_CLIENT_ID;
  if (!clientId) {
    throw new Error('REVOLUT_CLIENT_ID is not set');
  }

  const isSandbox = process.env.REVOLUT_SANDBOX === 'true';
  const audience = isSandbox
    ? 'https://revolut.com'
    : 'https://revolut.com';

  const now = Math.floor(Date.now() / 1000);
  const header = {
    alg: 'RS256',
    typ: 'JWT'
  };
  const payload = {
    iss: clientId,
    sub: clientId,
    aud: audience,
    iat: now,
    exp: now + 60 // JWT valid for 60 seconds — single use
  };

  const encode = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
  const headerB64 = encode(header);
  const payloadB64 = encode(payload);
  const signingInput = `${headerB64}.${payloadB64}`;

  // Get private key from env or file
  let privateKeyPem = process.env.REVOLUT_PRIVATE_KEY;
  if (!privateKeyPem && process.env.REVOLUT_PRIVATE_KEY_PATH) {
    const fs = await import('fs');
    privateKeyPem = fs.readFileSync(process.env.REVOLUT_PRIVATE_KEY_PATH, 'utf8');
  }

  if (!privateKeyPem) {
    throw new Error('REVOLUT_PRIVATE_KEY or REVOLUT_PRIVATE_KEY_PATH must be set');
  }

  const sign = createSign('RSA-SHA256');
  sign.update(signingInput);
  const signature = sign.sign(privateKeyPem, 'base64url');

  return `${signingInput}.${signature}`;
}

/**
 * Synchronous version: generate JWT without async file read.
 * Expects REVOLUT_PRIVATE_KEY to be set as env variable (PEM string).
 */
function generateClientAssertionSync() {
  const clientId = process.env.REVOLUT_CLIENT_ID;
  if (!clientId) {
    throw new Error('REVOLUT_CLIENT_ID is not set');
  }

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: clientId,
    sub: clientId,
    aud: 'https://revolut.com',
    iat: now,
    exp: now + 60
  };

  const encode = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
  const headerB64 = encode(header);
  const payloadB64 = encode(payload);
  const signingInput = `${headerB64}.${payloadB64}`;

  const privateKeyPem = process.env.REVOLUT_PRIVATE_KEY;
  if (!privateKeyPem) {
    throw new Error('REVOLUT_PRIVATE_KEY env variable must be set (PEM format)');
  }

  const sign = createSign('RSA-SHA256');
  sign.update(signingInput);
  const signature = sign.sign(privateKeyPem, 'base64url');

  return `${signingInput}.${signature}`;
}

// ── Token URL ──

function getTokenURL() {
  return process.env.REVOLUT_SANDBOX === 'true'
    ? REVOLUT_TOKEN_URL_SANDBOX
    : REVOLUT_TOKEN_URL_PRODUCTION;
}

// ── Core Functions ──

/**
 * Check if the token for a given company is expired or about to expire.
 * @param {string} companyId - Company identifier
 * @returns {boolean} true if token is expired or will expire within 5 minutes
 */
export function isTokenExpired(companyId) {
  const entry = tokenStore.get(companyId);
  if (!entry || !entry.expires_at) return true;
  return Date.now() >= (entry.expires_at - TOKEN_REFRESH_BUFFER_MS);
}

/**
 * Store token data for a company.
 * Persists to both in-memory Map and Redis (if available).
 *
 * @param {string} companyId - Company identifier
 * @param {object} tokenData - { access_token, refresh_token, expires_in? }
 */
export async function storeToken(companyId, tokenData) {
  const expiresAt = tokenData.expires_at
    || (Date.now() + (tokenData.expires_in ? tokenData.expires_in * 1000 : TOKEN_DEFAULT_TTL_MS));

  const entry = {
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token,
    expires_at: expiresAt,
    updated_at: Date.now(),
    warning: null
  };

  // In-memory store
  tokenStore.set(companyId, entry);

  console.log(
    `[Revolut TokenManager] Token stored for ${companyId} — expires in ${Math.round((expiresAt - Date.now()) / 60000)} min`
  );

  // Redis persistence
  try {
    const redis = await getRedisClient();
    if (redis && redisAvailable) {
      const redisKey = `${REDIS_KEY_PREFIX}${companyId}`;
      const ttlSeconds = Math.max(1, Math.round((expiresAt - Date.now()) / 1000) + 300); // +5min buffer
      await redis.set(redisKey, JSON.stringify(entry), { EX: ttlSeconds });
      console.log(`[Revolut TokenManager] Token persisted to Redis for ${companyId}`);
    }
  } catch (err) {
    console.warn(`[Revolut TokenManager] Redis persist failed for ${companyId}:`, err.message);
  }
}

/**
 * Attempt to refresh the token via Revolut OAuth2 endpoint.
 *
 * @param {string} companyId - Company identifier
 * @returns {object} New token data { access_token, refresh_token, expires_at }
 * @throws {Error} If refresh fails
 */
async function refreshToken(companyId) {
  const entry = tokenStore.get(companyId);
  if (!entry?.refresh_token) {
    throw new Error(`No refresh token available for company ${companyId}`);
  }

  console.log(`[Revolut TokenManager] Refreshing token for ${companyId}...`);

  const tokenURL = getTokenURL();
  const requestBody = {
    grant_type: 'refresh_token',
    refresh_token: entry.refresh_token,
    client_id: process.env.REVOLUT_CLIENT_ID,
    client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer'
  };

  // Try to add client_assertion (JWT signing)
  try {
    requestBody.client_assertion = generateClientAssertionSync();
  } catch (jwtErr) {
    console.warn(`[Revolut TokenManager] JWT assertion generation failed: ${jwtErr.message}`);
    // Continue without assertion — some sandbox configs may not require it
  }

  try {
    const response = await axios.post(tokenURL, requestBody, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    });

    const data = response.data;

    const newEntry = {
      access_token: data.access_token,
      refresh_token: data.refresh_token || entry.refresh_token,
      expires_at: Date.now() + (data.expires_in ? data.expires_in * 1000 : TOKEN_DEFAULT_TTL_MS),
      updated_at: Date.now(),
      warning: null
    };

    // Store the new token
    await storeToken(companyId, newEntry);

    console.log(`[Revolut TokenManager] Token refreshed successfully for ${companyId}`);
    return newEntry;
  } catch (err) {
    const status = err.response?.status;
    const detail = err.response?.data?.message || err.message;
    console.error(`[Revolut TokenManager] Refresh FAILED for ${companyId}: ${status} — ${detail}`);
    throw new Error(`Token refresh failed (${status}): ${detail}`);
  }
}

/**
 * Load token from Redis if not in memory.
 * Called on cold start or when in-memory store is empty.
 *
 * @param {string} companyId
 */
async function loadFromRedis(companyId) {
  try {
    const redis = await getRedisClient();
    if (!redis || !redisAvailable) return null;

    const redisKey = `${REDIS_KEY_PREFIX}${companyId}`;
    const raw = await redis.get(redisKey);
    if (!raw) return null;

    const entry = JSON.parse(raw);
    tokenStore.set(companyId, entry);
    console.log(`[Revolut TokenManager] Token loaded from Redis for ${companyId}`);
    return entry;
  } catch (err) {
    console.warn(`[Revolut TokenManager] Redis load failed for ${companyId}:`, err.message);
    return null;
  }
}

/**
 * Get a valid (non-expired) access token for a company.
 * If the token is expired or about to expire, refreshes it automatically.
 * On refresh failure, returns the last known token with a warning flag.
 *
 * @param {string} companyId - Company identifier
 * @returns {object} { access_token, warning?, source }
 *   - source: 'cache' | 'refreshed' | 'redis' | 'env_fallback'
 *   - warning: string if token may be stale
 */
export async function getValidToken(companyId) {
  let entry = tokenStore.get(companyId);

  // Try Redis if not in memory
  if (!entry) {
    entry = await loadFromRedis(companyId);
  }

  // Fallback to env access token (initial bootstrap)
  if (!entry && process.env.REVOLUT_ACCESS_TOKEN) {
    entry = {
      access_token: process.env.REVOLUT_ACCESS_TOKEN,
      refresh_token: process.env.REVOLUT_REFRESH_TOKEN || null,
      expires_at: Date.now() + TOKEN_DEFAULT_TTL_MS,
      updated_at: Date.now(),
      warning: null
    };
    tokenStore.set(companyId, entry);
    console.log(`[Revolut TokenManager] Bootstrap from env for ${companyId}`);
    return { access_token: entry.access_token, source: 'env_fallback' };
  }

  if (!entry) {
    throw new Error(`No token available for company ${companyId}. Please authenticate via Revolut OAuth2 first.`);
  }

  // Check if token is still valid
  if (!isTokenExpired(companyId)) {
    return { access_token: entry.access_token, source: 'cache' };
  }

  // Token expired or about to expire — attempt refresh
  try {
    const newEntry = await refreshToken(companyId);
    return { access_token: newEntry.access_token, source: 'refreshed' };
  } catch (refreshErr) {
    console.warn(
      `[Revolut TokenManager] Refresh failed for ${companyId}, returning last known token with warning`
    );

    // Mark the entry with a warning
    entry.warning = `Refresh failed: ${refreshErr.message}`;
    tokenStore.set(companyId, entry);

    return {
      access_token: entry.access_token,
      warning: entry.warning,
      source: 'stale'
    };
  }
}

/**
 * Force a token refresh regardless of expiry status.
 * Used when a 401 is received from Revolut API.
 *
 * @param {string} companyId
 * @returns {object} { access_token, source: 'force_refreshed' }
 */
export async function forceRefresh(companyId) {
  const newEntry = await refreshToken(companyId);
  return { access_token: newEntry.access_token, source: 'force_refreshed' };
}

/**
 * Get token status for diagnostics / health endpoint.
 *
 * @param {string} companyId
 * @returns {object} Status info
 */
export function getTokenStatus(companyId) {
  const entry = tokenStore.get(companyId);
  if (!entry) {
    return {
      companyId,
      hasToken: false,
      expired: true,
      message: 'No token stored'
    };
  }

  const expired = isTokenExpired(companyId);
  const expiresIn = entry.expires_at ? Math.round((entry.expires_at - Date.now()) / 1000) : 0;

  return {
    companyId,
    hasToken: !!entry.access_token,
    hasRefreshToken: !!entry.refresh_token,
    expired,
    expiresInSeconds: Math.max(0, expiresIn),
    expiresInMinutes: Math.max(0, Math.round(expiresIn / 60)),
    warning: entry.warning || null,
    updatedAt: entry.updated_at ? new Date(entry.updated_at).toISOString() : null,
    redisAvailable
  };
}

/**
 * Get all stored token statuses.
 * @returns {object[]} Array of status objects
 */
export function getAllTokenStatuses() {
  const statuses = [];
  for (const [companyId] of tokenStore) {
    statuses.push(getTokenStatus(companyId));
  }
  return statuses;
}

export default {
  getValidToken,
  storeToken,
  isTokenExpired,
  forceRefresh,
  getTokenStatus,
  getAllTokenStatuses
};
