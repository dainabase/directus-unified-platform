/**
 * Health Check Routes
 * Checks Directus, Redis, and PostgreSQL connectivity.
 *
 * @version 1.0.0
 * @date 2026-02-19
 */

import express from 'express';
import axios from 'axios';

const router = express.Router();

/**
 * GET /health
 * Returns overall system health with per-service status.
 * HTTP 200 if ok or degraded, HTTP 503 if down.
 */
router.get('/', async (req, res) => {
  const checks = {};
  let overall = 'ok';

  // Check Directus
  const directusStart = Date.now();
  try {
    const directusUrl = process.env.DIRECTUS_URL || 'http://localhost:8055';
    await axios.get(`${directusUrl}/server/health`, { timeout: 5000 });
    checks.directus = { status: 'ok', latency_ms: Date.now() - directusStart };
  } catch {
    checks.directus = { status: 'down', latency_ms: Date.now() - directusStart };
    overall = 'degraded';
  }

  // Check Redis
  const redisStart = Date.now();
  try {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    // Simple TCP check via axios to Redis (will fail on protocol but confirms reachability)
    // For real check, use ioredis — keeping it simple without extra deps
    const { createClient } = await import('redis').catch(() => ({ createClient: null }));
    if (createClient) {
      const client = createClient({ url: redisUrl });
      client.on('error', () => {});
      await client.connect();
      await client.ping();
      await client.disconnect();
      checks.redis = { status: 'ok', latency_ms: Date.now() - redisStart };
    } else {
      checks.redis = { status: 'unknown', latency_ms: 0, note: 'redis client not installed' };
    }
  } catch {
    checks.redis = { status: 'down', latency_ms: Date.now() - redisStart };
    overall = 'degraded';
  }

  // Check PostgreSQL (via Directus — we don't connect directly)
  const dbStart = Date.now();
  try {
    const directusUrl = process.env.DIRECTUS_URL || 'http://localhost:8055';
    const token = process.env.DIRECTUS_ADMIN_TOKEN;
    if (token) {
      await axios.get(`${directusUrl}/items/owner_companies?limit=1`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000
      });
      checks.database = { status: 'ok', latency_ms: Date.now() - dbStart };
    } else {
      checks.database = { status: 'unknown', latency_ms: 0, note: 'no admin token to verify' };
    }
  } catch {
    checks.database = { status: 'down', latency_ms: Date.now() - dbStart };
    overall = 'degraded';
  }

  // If any critical service is down, mark as down
  if (checks.directus.status === 'down' && checks.database.status === 'down') {
    overall = 'down';
  }

  const statusCode = overall === 'down' ? 503 : 200;

  res.status(statusCode).json({
    status: overall,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '2.1.0',
    uptime_seconds: Math.floor(process.uptime()),
    services: checks
  });
});

export default router;
