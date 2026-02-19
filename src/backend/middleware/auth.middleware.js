/**
 * Authentication Middleware - ES Modules
 * JWT authentication for Finance API with Directus integration
 *
 * @version 2.0.0
 * @author Claude Code
 */

import jwt from 'jsonwebtoken';
import { createDirectus, rest, readItems, readItem } from '@directus/sdk';

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// Directus client
const getDirectusClient = () => {
  return createDirectus(process.env.DIRECTUS_URL || 'http://localhost:8055')
    .with(rest({
      headers: {
        'Authorization': `Bearer ${process.env.DIRECTUS_TOKEN}`
      }
    }));
};

// Companies for multi-tenant access
const COMPANIES = ['HYPERVISUAL', 'DAINAMICS', 'LEXAIA', 'ENKI_REALTY', 'TAKEOUT'];

/**
 * Rate limiting storage (use Redis in production)
 */
const loginAttempts = new Map();
const tokenBlacklist = new Set();

/**
 * Check login attempts for brute force protection
 */
function checkLoginAttempts(email) {
  const attempts = loginAttempts.get(email) || { count: 0, lastAttempt: 0 };
  const now = Date.now();

  // Reset after 15 minutes
  if (now - attempts.lastAttempt > 15 * 60 * 1000) {
    attempts.count = 0;
  }

  // Block after 5 attempts
  if (attempts.count >= 5) {
    const remainingTime = Math.ceil((15 * 60 * 1000 - (now - attempts.lastAttempt)) / 1000 / 60);
    return {
      blocked: true,
      message: `Compte temporairement bloqué. Réessayez dans ${remainingTime} minutes.`
    };
  }

  return { blocked: false };
}

/**
 * Record login attempt
 */
function recordLoginAttempt(email, success = false) {
  const attempts = loginAttempts.get(email) || { count: 0, lastAttempt: 0 };

  if (success) {
    loginAttempts.delete(email);
  } else {
    attempts.count++;
    attempts.lastAttempt = Date.now();
    loginAttempts.set(email, attempts);
  }
}

/**
 * Generate JWT tokens
 */
function generateTokens(user) {
  const accessToken = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      name: user.name || user.first_name,
      role: user.role,
      companies: user.companies || COMPANIES, // Default: all companies for admin
      permissions: user.permissions || []
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  const refreshToken = jwt.sign(
    {
      userId: user.id,
      type: 'refresh'
    },
    JWT_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRES_IN }
  );

  return { accessToken, refreshToken };
}

/**
 * Verify JWT token
 */
function verifyToken(token) {
  try {
    if (tokenBlacklist.has(token)) {
      return { valid: false, error: 'Token has been revoked' };
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    return { valid: true, decoded };
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return { valid: false, error: 'Token expired' };
    }
    return { valid: false, error: 'Invalid token' };
  }
}

/**
 * Blacklist a token (for logout)
 */
function blacklistToken(token) {
  tokenBlacklist.add(token);
  // Auto-cleanup after token would have expired anyway
  setTimeout(() => tokenBlacklist.delete(token), 24 * 60 * 60 * 1000);
}

/**
 * Main authentication middleware
 * Extracts and validates JWT from Authorization header
 */
export const authMiddleware = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Token manquant ou invalide',
        code: 'AUTH_TOKEN_MISSING'
      });
    }

    const token = authHeader.substring(7);
    const { valid, decoded, error } = verifyToken(token);

    if (!valid) {
      return res.status(401).json({
        success: false,
        error: error === 'Token expired' ? 'Token expiré' : 'Token invalide',
        code: error === 'Token expired' ? 'AUTH_TOKEN_EXPIRED' : 'AUTH_TOKEN_INVALID'
      });
    }

    // Add user info to request
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
      companies: decoded.companies || [],
      permissions: decoded.permissions || []
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur d\'authentification',
      code: 'AUTH_ERROR'
    });
  }
};

/**
 * Optional authentication middleware
 * Allows both authenticated and unauthenticated requests
 */
export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.substring(7);
  const { valid, decoded } = verifyToken(token);

  if (valid) {
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
      companies: decoded.companies || [],
      permissions: decoded.permissions || []
    };
  } else {
    req.user = null;
  }

  next();
};

/**
 * Company access middleware
 * Validates user has access to requested company
 */
export const companyAccess = (req, res, next) => {
  const company = req.params.company || req.query.company || req.body.company;

  if (!company) {
    return res.status(400).json({
      success: false,
      error: 'Company parameter required',
      code: 'COMPANY_REQUIRED'
    });
  }

  // Admin role has access to all companies
  if (req.user.role === 'admin' || req.user.role === 'superadmin') {
    return next();
  }

  // Check if user has access to this company
  if (!req.user.companies.includes(company)) {
    return res.status(403).json({
      success: false,
      error: `Accès non autorisé à ${company}`,
      code: 'COMPANY_ACCESS_DENIED'
    });
  }

  next();
};

/**
 * Role-based access control middleware
 * @param {string[]} allowedRoles - Array of roles allowed to access
 */
export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentification requise',
        code: 'AUTH_REQUIRED'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Permissions insuffisantes',
        code: 'ROLE_ACCESS_DENIED',
        required: allowedRoles,
        current: req.user.role
      });
    }

    next();
  };
};

/**
 * Permission-based access control middleware
 * @param {string} permission - Required permission (e.g., 'finance.read', 'invoice.write')
 */
export const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentification requise',
        code: 'AUTH_REQUIRED'
      });
    }

    // Admin/superadmin bypass permission checks
    if (req.user.role === 'admin' || req.user.role === 'superadmin') {
      return next();
    }

    // Check for specific permission
    const [resource, action] = permission.split('.');
    const hasPermission = req.user.permissions.some(p => {
      const [pResource, pAction] = p.split('.');
      // Exact match or wildcard
      return (pResource === resource || pResource === '*') &&
             (pAction === action || pAction === '*');
    });

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        error: 'Permission insuffisante',
        code: 'PERMISSION_DENIED',
        required: permission
      });
    }

    next();
  };
};

/**
 * API Key authentication middleware
 * For service-to-service communication
 */
export const apiKeyAuth = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  const validApiKey = process.env.FINANCE_API_KEY;

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: 'API key required',
      code: 'API_KEY_MISSING'
    });
  }

  if (apiKey !== validApiKey) {
    return res.status(401).json({
      success: false,
      error: 'Invalid API key',
      code: 'API_KEY_INVALID'
    });
  }

  // Service account user
  req.user = {
    id: 'service-account',
    email: 'service@internal',
    name: 'Service Account',
    role: 'service',
    companies: COMPANIES,
    permissions: ['*.*']
  };

  next();
};

/**
 * Combined authentication (JWT or API Key)
 */
export const flexibleAuth = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  const authHeader = req.headers.authorization;

  if (apiKey) {
    return apiKeyAuth(req, res, next);
  }

  if (authHeader) {
    return authMiddleware(req, res, next);
  }

  return res.status(401).json({
    success: false,
    error: 'Authentication required (JWT or API Key)',
    code: 'AUTH_REQUIRED'
  });
};

// Export utilities
export {
  checkLoginAttempts,
  recordLoginAttempt,
  generateTokens,
  verifyToken,
  blacklistToken,
  getDirectusClient,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  COMPANIES
};

export default authMiddleware;
