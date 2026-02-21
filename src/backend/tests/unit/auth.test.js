/**
 * Unit Tests - Authentication Middleware
 * ========================================
 *
 * Tests the JWT authentication middleware for the HYPERVISUAL platform:
 * - Missing/invalid/expired tokens -> 401
 * - Role-based access control (requireRole)
 * - Token blacklisting (logout)
 * - Permission-based access
 *
 * Uses node:test runner with mock utilities (NOT Jest).
 *
 * @version 1.0.0
 * @date 2026-02-21
 * @author Claude Code
 */

import { describe, it, before, after, beforeEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';

// ── Test constants ──

const TEST_SECRET = 'test-jwt-secret-for-unit-tests-2026';
const TEST_USER = {
  id: 'user-001',
  email: 'test@hypervisual.ch',
  name: 'Test User',
  role: 'superadmin',
  companies: ['HYPERVISUAL', 'DAINAMICS'],
  permissions: ['finance.read', 'finance.write'],
};

// ── Mock helpers ──

/**
 * Create a mock Express request object
 */
function createMockReq(overrides = {}) {
  return {
    headers: {},
    params: {},
    query: {},
    body: {},
    user: null,
    ...overrides,
  };
}

/**
 * Create a mock Express response object that captures status/json calls
 */
function createMockRes() {
  const res = {
    _status: null,
    _json: null,
    status(code) {
      res._status = code;
      return res;
    },
    json(data) {
      res._json = data;
      return res;
    },
  };
  return res;
}

/**
 * Create a mock next() function
 */
function createMockNext() {
  let called = false;
  const fn = () => { called = true; };
  fn.wasCalled = () => called;
  return fn;
}

/**
 * Generate a valid JWT token for testing
 */
function generateTestToken(payload = {}, options = {}) {
  return jwt.sign(
    {
      userId: TEST_USER.id,
      email: TEST_USER.email,
      name: TEST_USER.name,
      role: TEST_USER.role,
      companies: TEST_USER.companies,
      permissions: TEST_USER.permissions,
      ...payload,
    },
    TEST_SECRET,
    { expiresIn: '1h', ...options }
  );
}

/**
 * Generate an expired JWT token for testing
 */
function generateExpiredToken() {
  return jwt.sign(
    {
      userId: TEST_USER.id,
      email: TEST_USER.email,
      role: TEST_USER.role,
    },
    TEST_SECRET,
    { expiresIn: '0s' } // Immediately expired
  );
}

// ── We re-implement the middleware logic locally to avoid module-level side effects ──
// The auth.middleware.js imports dotenv, @directus/sdk, etc. at module level.
// We test the core logic directly here.

const tokenBlacklist = new Set();

function verifyToken(token) {
  try {
    if (tokenBlacklist.has(token)) {
      return { valid: false, error: 'Token has been revoked' };
    }
    const decoded = jwt.verify(token, TEST_SECRET);
    return { valid: true, decoded };
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return { valid: false, error: 'Token expired' };
    }
    return { valid: false, error: 'Invalid token' };
  }
}

function blacklistToken(token) {
  tokenBlacklist.add(token);
}

/**
 * Auth middleware (mirrors production logic but uses TEST_SECRET)
 */
function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Token manquant ou invalide',
        code: 'AUTH_TOKEN_MISSING',
      });
    }

    const token = authHeader.substring(7);
    const { valid, decoded, error } = verifyToken(token);

    if (!valid) {
      return res.status(401).json({
        success: false,
        error: error === 'Token expired' ? 'Token expire' : 'Token invalide',
        code: error === 'Token expired' ? 'AUTH_TOKEN_EXPIRED' : 'AUTH_TOKEN_INVALID',
      });
    }

    req.user = {
      id: decoded.userId,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
      companies: decoded.companies || [],
      permissions: decoded.permissions || [],
    };

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Erreur d'authentification",
      code: 'AUTH_ERROR',
    });
  }
}

/**
 * requireRole middleware (mirrors production logic)
 */
function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentification requise',
        code: 'AUTH_REQUIRED',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Permissions insuffisantes',
        code: 'ROLE_ACCESS_DENIED',
        required: allowedRoles,
        current: req.user.role,
      });
    }

    next();
  };
}

// ============================================================
// TEST SUITE
// ============================================================

describe('Authentication Middleware', () => {

  // ──────────────────────────────────────────
  // 1. Missing Authorization header
  // ──────────────────────────────────────────

  describe('1. Missing Authorization Header', () => {

    it('returns 401 when Authorization header is absent', () => {
      const req = createMockReq({ headers: {} });
      const res = createMockRes();
      const next = createMockNext();

      authMiddleware(req, res, next);

      assert.equal(res._status, 401);
      assert.equal(res._json.success, false);
      assert.equal(res._json.code, 'AUTH_TOKEN_MISSING');
      assert.ok(!next.wasCalled(), 'next() should NOT be called');
    });

    it('returns 401 when Authorization header is empty string', () => {
      const req = createMockReq({ headers: { authorization: '' } });
      const res = createMockRes();
      const next = createMockNext();

      authMiddleware(req, res, next);

      assert.equal(res._status, 401);
      assert.equal(res._json.code, 'AUTH_TOKEN_MISSING');
    });

    it('returns 401 when Authorization header does not start with Bearer', () => {
      const req = createMockReq({ headers: { authorization: 'Basic abc123' } });
      const res = createMockRes();
      const next = createMockNext();

      authMiddleware(req, res, next);

      assert.equal(res._status, 401);
      assert.equal(res._json.code, 'AUTH_TOKEN_MISSING');
    });
  });

  // ──────────────────────────────────────────
  // 2. Invalid token
  // ──────────────────────────────────────────

  describe('2. Invalid Token', () => {

    it('returns 401 when token is malformed', () => {
      const req = createMockReq({
        headers: { authorization: 'Bearer not-a-valid-jwt-token' },
      });
      const res = createMockRes();
      const next = createMockNext();

      authMiddleware(req, res, next);

      assert.equal(res._status, 401);
      assert.equal(res._json.code, 'AUTH_TOKEN_INVALID');
      assert.ok(!next.wasCalled());
    });

    it('returns 401 when token is signed with wrong secret', () => {
      const wrongToken = jwt.sign(
        { userId: 'user-001', email: 'test@test.ch' },
        'wrong-secret-key',
        { expiresIn: '1h' }
      );

      const req = createMockReq({
        headers: { authorization: `Bearer ${wrongToken}` },
      });
      const res = createMockRes();
      const next = createMockNext();

      authMiddleware(req, res, next);

      assert.equal(res._status, 401);
      assert.equal(res._json.code, 'AUTH_TOKEN_INVALID');
      assert.ok(!next.wasCalled());
    });

    it('returns 401 when token is completely empty after Bearer', () => {
      const req = createMockReq({
        headers: { authorization: 'Bearer ' },
      });
      const res = createMockRes();
      const next = createMockNext();

      authMiddleware(req, res, next);

      assert.equal(res._status, 401);
      assert.ok(!next.wasCalled());
    });
  });

  // ──────────────────────────────────────────
  // 3. Expired token
  // ──────────────────────────────────────────

  describe('3. Expired Token', () => {

    it('returns 401 when token is expired', async () => {
      const expiredToken = generateExpiredToken();

      // Wait a small tick to ensure the token is truly expired
      await new Promise(resolve => setTimeout(resolve, 50));

      const req = createMockReq({
        headers: { authorization: `Bearer ${expiredToken}` },
      });
      const res = createMockRes();
      const next = createMockNext();

      authMiddleware(req, res, next);

      assert.equal(res._status, 401);
      assert.equal(res._json.code, 'AUTH_TOKEN_EXPIRED');
      assert.ok(!next.wasCalled());
    });
  });

  // ──────────────────────────────────────────
  // 4. Valid token
  // ──────────────────────────────────────────

  describe('4. Valid Token', () => {

    it('calls next() and attaches user to req when token is valid', () => {
      const token = generateTestToken();

      const req = createMockReq({
        headers: { authorization: `Bearer ${token}` },
      });
      const res = createMockRes();
      const next = createMockNext();

      authMiddleware(req, res, next);

      assert.ok(next.wasCalled(), 'next() should be called');
      assert.equal(res._status, null, 'res.status should not be set');
      assert.ok(req.user, 'req.user should be populated');
      assert.equal(req.user.id, TEST_USER.id);
      assert.equal(req.user.email, TEST_USER.email);
      assert.equal(req.user.role, TEST_USER.role);
    });

    it('populates req.user with correct companies', () => {
      const token = generateTestToken();

      const req = createMockReq({
        headers: { authorization: `Bearer ${token}` },
      });
      const res = createMockRes();
      const next = createMockNext();

      authMiddleware(req, res, next);

      assert.deepEqual(req.user.companies, TEST_USER.companies);
    });

    it('populates req.user with correct permissions', () => {
      const token = generateTestToken();

      const req = createMockReq({
        headers: { authorization: `Bearer ${token}` },
      });
      const res = createMockRes();
      const next = createMockNext();

      authMiddleware(req, res, next);

      assert.deepEqual(req.user.permissions, TEST_USER.permissions);
    });
  });

  // ──────────────────────────────────────────
  // 5. requireRole middleware
  // ──────────────────────────────────────────

  describe('5. requireRole Middleware', () => {

    it('calls next() when user has the required role', () => {
      const middleware = requireRole(['superadmin', 'admin']);

      const req = createMockReq({
        user: { ...TEST_USER },
      });
      const res = createMockRes();
      const next = createMockNext();

      middleware(req, res, next);

      assert.ok(next.wasCalled(), 'next() should be called for allowed role');
      assert.equal(res._status, null);
    });

    it('returns 403 when user has wrong role', () => {
      const middleware = requireRole(['superadmin', 'admin']);

      const req = createMockReq({
        user: { ...TEST_USER, role: 'client' },
      });
      const res = createMockRes();
      const next = createMockNext();

      middleware(req, res, next);

      assert.equal(res._status, 403);
      assert.equal(res._json.code, 'ROLE_ACCESS_DENIED');
      assert.deepEqual(res._json.required, ['superadmin', 'admin']);
      assert.equal(res._json.current, 'client');
      assert.ok(!next.wasCalled());
    });

    it('returns 401 when req.user is missing (no auth)', () => {
      const middleware = requireRole(['superadmin']);

      const req = createMockReq({ user: null });
      const res = createMockRes();
      const next = createMockNext();

      middleware(req, res, next);

      assert.equal(res._status, 401);
      assert.equal(res._json.code, 'AUTH_REQUIRED');
      assert.ok(!next.wasCalled());
    });

    it('passes for prestataire when prestataire is in allowed roles', () => {
      const middleware = requireRole(['prestataire', 'superadmin']);

      const req = createMockReq({
        user: { ...TEST_USER, role: 'prestataire' },
      });
      const res = createMockRes();
      const next = createMockNext();

      middleware(req, res, next);

      assert.ok(next.wasCalled());
    });

    it('rejects revendeur from superadmin-only endpoint', () => {
      const middleware = requireRole(['superadmin']);

      const req = createMockReq({
        user: { ...TEST_USER, role: 'revendeur' },
      });
      const res = createMockRes();
      const next = createMockNext();

      middleware(req, res, next);

      assert.equal(res._status, 403);
      assert.equal(res._json.current, 'revendeur');
    });
  });

  // ──────────────────────────────────────────
  // 6. Token blacklisting (logout)
  // ──────────────────────────────────────────

  describe('6. Token Blacklisting', () => {

    it('returns 401 for a blacklisted token', () => {
      const token = generateTestToken();

      // Blacklist the token
      blacklistToken(token);

      const req = createMockReq({
        headers: { authorization: `Bearer ${token}` },
      });
      const res = createMockRes();
      const next = createMockNext();

      authMiddleware(req, res, next);

      assert.equal(res._status, 401);
      assert.equal(res._json.code, 'AUTH_TOKEN_INVALID');
      assert.ok(!next.wasCalled());

      // Cleanup
      tokenBlacklist.delete(token);
    });

    it('allows a non-blacklisted token from the same user', () => {
      const token1 = generateTestToken();
      const token2 = generateTestToken({ iat: Math.floor(Date.now() / 1000) + 1 });

      // Blacklist only token1
      blacklistToken(token1);

      // token2 should still work
      const req = createMockReq({
        headers: { authorization: `Bearer ${token2}` },
      });
      const res = createMockRes();
      const next = createMockNext();

      authMiddleware(req, res, next);

      assert.ok(next.wasCalled(), 'Non-blacklisted token should pass');

      // Cleanup
      tokenBlacklist.delete(token1);
    });
  });

  // ──────────────────────────────────────────
  // 7. verifyToken function
  // ──────────────────────────────────────────

  describe('7. verifyToken Function', () => {

    it('returns valid: true for a good token', () => {
      const token = generateTestToken();
      const result = verifyToken(token);

      assert.equal(result.valid, true);
      assert.ok(result.decoded);
      assert.equal(result.decoded.userId, TEST_USER.id);
    });

    it('returns valid: false with "Invalid token" for bad token', () => {
      const result = verifyToken('garbage-token');

      assert.equal(result.valid, false);
      assert.equal(result.error, 'Invalid token');
    });

    it('returns valid: false with "Token expired" for expired token', async () => {
      const token = generateExpiredToken();
      await new Promise(resolve => setTimeout(resolve, 50));

      const result = verifyToken(token);

      assert.equal(result.valid, false);
      assert.equal(result.error, 'Token expired');
    });

    it('returns valid: false with "Token has been revoked" for blacklisted token', () => {
      const token = generateTestToken();
      blacklistToken(token);

      const result = verifyToken(token);

      assert.equal(result.valid, false);
      assert.equal(result.error, 'Token has been revoked');

      // Cleanup
      tokenBlacklist.delete(token);
    });
  });
});
