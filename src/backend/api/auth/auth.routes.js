/**
 * Authentication Routes - ES Modules
 * Login, logout, token refresh with Directus integration
 *
 * @version 2.0.0
 * @author Claude Code
 */

import express from 'express';
import bcrypt from 'bcryptjs';
import { createDirectus, rest, staticToken, readItems, readItem, createItem, updateItem } from '@directus/sdk';
import {
  authMiddleware,
  checkLoginAttempts,
  recordLoginAttempt,
  generateTokens,
  verifyToken,
  blacklistToken,
  getDirectusClient,
  COMPANIES
} from '../../middleware/auth.middleware.js';

const router = express.Router();

// Directus client for user operations (using staticToken for SDK v17+)
const getDirectus = () => {
  return createDirectus(process.env.DIRECTUS_URL || 'http://localhost:8055')
    .with(staticToken(process.env.DIRECTUS_ADMIN_TOKEN))
    .with(rest());
};

/**
 * Helper: asyncHandler for route error handling
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/**
 * POST /api/auth/login
 * Authenticate user and return JWT tokens
 */
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password, portal } = req.body;

  // Validation
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Email et mot de passe requis',
      code: 'VALIDATION_ERROR'
    });
  }

  // Check brute force protection
  const attemptCheck = checkLoginAttempts(email.toLowerCase());
  if (attemptCheck.blocked) {
    return res.status(429).json({
      success: false,
      error: attemptCheck.message,
      code: 'RATE_LIMITED'
    });
  }

  try {
    const directus = getDirectus();

    // Find user by email in directus_users or custom users collection
    let user = null;

    // Try directus_users first (for admin/internal users)
    try {
      const directusUsers = await directus.request(
        readItems('directus_users', {
          filter: {
            email: { _eq: email.toLowerCase() }
          },
          limit: 1
        })
      );
      if (directusUsers.length > 0) {
        user = { ...directusUsers[0], source: 'directus_users' };
      }
    } catch (e) {
      // May not have access to directus_users, try custom collection
    }

    // Try portal_users collection (for portal users)
    if (!user) {
      try {
        const portalUsers = await directus.request(
          readItems('portal_users', {
            filter: {
              email: { _eq: email.toLowerCase() }
            },
            limit: 1
          })
        );
        if (portalUsers.length > 0) {
          user = { ...portalUsers[0], source: 'portal_users' };
        }
      } catch (e) {
        // Collection may not exist
      }
    }

    // Try finance_users collection
    if (!user) {
      try {
        const financeUsers = await directus.request(
          readItems('finance_users', {
            filter: {
              email: { _eq: email.toLowerCase() }
            },
            limit: 1
          })
        );
        if (financeUsers.length > 0) {
          user = { ...financeUsers[0], source: 'finance_users' };
        }
      } catch (e) {
        // Collection may not exist
      }
    }

    if (!user) {
      recordLoginAttempt(email.toLowerCase(), false);
      return res.status(401).json({
        success: false,
        error: 'Email ou mot de passe incorrect',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Check if account is active
    if (user.status === 'suspended' || user.status === 'inactive') {
      return res.status(403).json({
        success: false,
        error: 'Compte suspendu ou inactif',
        code: 'ACCOUNT_DISABLED'
      });
    }

    // Verify password
    const passwordField = user.password || user.password_hash;
    if (!passwordField) {
      recordLoginAttempt(email.toLowerCase(), false);
      return res.status(401).json({
        success: false,
        error: 'Configuration du compte invalide',
        code: 'ACCOUNT_SETUP_REQUIRED'
      });
    }

    const isValidPassword = await bcrypt.compare(password, passwordField);
    if (!isValidPassword) {
      recordLoginAttempt(email.toLowerCase(), false);
      return res.status(401).json({
        success: false,
        error: 'Email ou mot de passe incorrect',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Success - clear login attempts
    recordLoginAttempt(email.toLowerCase(), true);

    // Get user role and permissions
    const role = user.role || 'user';
    const companies = user.companies || (role === 'admin' ? COMPANIES : []);
    const permissions = user.permissions || [];

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens({
      id: user.id,
      email: user.email,
      name: user.first_name || user.name || 'Utilisateur',
      role: role,
      companies: companies,
      permissions: permissions
    });

    // Update last login timestamp
    try {
      if (user.source === 'portal_users') {
        await directus.request(
          updateItem('portal_users', user.id, {
            last_login: new Date().toISOString()
          })
        );
      } else if (user.source === 'finance_users') {
        await directus.request(
          updateItem('finance_users', user.id, {
            last_login: new Date().toISOString()
          })
        );
      }
    } catch (e) {
      // Non-critical - continue
    }

    // Validate portal matches role if specified
    const portalRoleMap = {
      superadmin: ['admin', 'superadmin'],
      client: ['client'],
      prestataire: ['prestataire'],
      revendeur: ['revendeur']
    };

    if (portal && portalRoleMap[portal] && !portalRoleMap[portal].includes(role)) {
      return res.status(403).json({
        success: false,
        error: `Acces au portail ${portal} non autorise pour le role ${role}`,
        code: 'PORTAL_ACCESS_DENIED'
      });
    }

    res.json({
      success: true,
      accessToken,
      refreshToken,
      expiresIn: '24h',
      portal: portal || null,
      user: {
        id: user.id,
        email: user.email,
        name: user.first_name || user.name,
        role: role,
        companies: companies,
        avatar: user.avatar
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    recordLoginAttempt(email.toLowerCase(), false);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la connexion',
      code: 'SERVER_ERROR'
    });
  }
}));

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
router.post('/refresh', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      error: 'Refresh token requis',
      code: 'VALIDATION_ERROR'
    });
  }

  const { valid, decoded, error } = verifyToken(refreshToken);

  if (!valid || decoded.type !== 'refresh') {
    return res.status(401).json({
      success: false,
      error: 'Refresh token invalide ou expiré',
      code: 'INVALID_REFRESH_TOKEN'
    });
  }

  try {
    const directus = getDirectus();

    // Get fresh user data
    let user = null;

    // Try different user collections
    for (const collection of ['portal_users', 'finance_users']) {
      try {
        user = await directus.request(readItem(collection, decoded.userId));
        if (user) break;
      } catch (e) {
        continue;
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Utilisateur non trouvé',
        code: 'USER_NOT_FOUND'
      });
    }

    if (user.status === 'suspended' || user.status === 'inactive') {
      return res.status(403).json({
        success: false,
        error: 'Compte suspendu ou inactif',
        code: 'ACCOUNT_DISABLED'
      });
    }

    // Blacklist old refresh token (rotation)
    blacklistToken(refreshToken);

    // Generate new tokens
    const tokens = generateTokens({
      id: user.id,
      email: user.email,
      name: user.first_name || user.name,
      role: user.role || 'user',
      companies: user.companies || [],
      permissions: user.permissions || []
    });

    res.json({
      success: true,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: '24h'
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors du rafraîchissement du token',
      code: 'SERVER_ERROR'
    });
  }
}));

/**
 * POST /api/auth/logout
 * Logout user and blacklist token
 */
router.post('/logout', authMiddleware, asyncHandler(async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.substring(7);

  if (token) {
    blacklistToken(token);
  }

  res.json({
    success: true,
    message: 'Déconnexion réussie'
  });
}));

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get('/me', authMiddleware, asyncHandler(async (req, res) => {
  try {
    const directus = getDirectus();
    let user = null;

    // Try to get fresh user data
    for (const collection of ['portal_users', 'finance_users']) {
      try {
        user = await directus.request(readItem(collection, req.user.id));
        if (user) break;
      } catch (e) {
        continue;
      }
    }

    res.json({
      success: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        name: user?.first_name || user?.name || req.user.name,
        role: user?.role || req.user.role,
        companies: user?.companies || req.user.companies,
        avatar: user?.avatar,
        last_login: user?.last_login,
        created_at: user?.date_created
      }
    });
  } catch (error) {
    // Fall back to token data
    res.json({
      success: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
        role: req.user.role,
        companies: req.user.companies
      }
    });
  }
}));

/**
 * PUT /api/auth/me
 * Update current user profile
 */
router.put('/me', authMiddleware, asyncHandler(async (req, res) => {
  const { name, avatar } = req.body;

  try {
    const directus = getDirectus();
    const updates = {};

    if (name) updates.first_name = name;
    if (avatar) updates.avatar = avatar;

    // Try to update in the appropriate collection
    let updated = false;
    for (const collection of ['portal_users', 'finance_users']) {
      try {
        await directus.request(updateItem(collection, req.user.id, updates));
        updated = true;
        break;
      } catch (e) {
        continue;
      }
    }

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé',
        code: 'USER_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      message: 'Profil mis à jour'
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la mise à jour du profil',
      code: 'SERVER_ERROR'
    });
  }
}));

/**
 * POST /api/auth/change-password
 * Change user password
 */
router.post('/change-password', authMiddleware, asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Validation
  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      error: 'Mot de passe actuel et nouveau requis',
      code: 'VALIDATION_ERROR'
    });
  }

  // Password strength validation
  if (newPassword.length < 8) {
    return res.status(400).json({
      success: false,
      error: 'Le nouveau mot de passe doit contenir au moins 8 caractères',
      code: 'WEAK_PASSWORD'
    });
  }

  if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
    return res.status(400).json({
      success: false,
      error: 'Le mot de passe doit contenir des majuscules, minuscules et chiffres',
      code: 'WEAK_PASSWORD'
    });
  }

  try {
    const directus = getDirectus();
    let user = null;
    let userCollection = null;

    // Find user
    for (const collection of ['portal_users', 'finance_users']) {
      try {
        user = await directus.request(readItem(collection, req.user.id));
        if (user) {
          userCollection = collection;
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé',
        code: 'USER_NOT_FOUND'
      });
    }

    // Verify current password
    const passwordField = user.password || user.password_hash;
    const isValidPassword = await bcrypt.compare(currentPassword, passwordField);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Mot de passe actuel incorrect',
        code: 'INVALID_PASSWORD'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(12);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    // Update password
    await directus.request(updateItem(userCollection, req.user.id, {
      password: newPasswordHash,
      password_updated_at: new Date().toISOString()
    }));

    // Blacklist current token to force re-login
    const authHeader = req.headers.authorization;
    const token = authHeader?.substring(7);
    if (token) {
      blacklistToken(token);
    }

    res.json({
      success: true,
      message: 'Mot de passe modifié avec succès. Veuillez vous reconnecter.'
    });

  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors du changement de mot de passe',
      code: 'SERVER_ERROR'
    });
  }
}));

/**
 * GET /api/auth/verify
 * Verify token is valid
 */
router.get('/verify', authMiddleware, (req, res) => {
  res.json({
    success: true,
    valid: true,
    user: {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      role: req.user.role
    }
  });
});

/**
 * GET /api/auth/companies
 * Get companies user has access to
 */
router.get('/companies', authMiddleware, (req, res) => {
  const allCompanies = COMPANIES.map(code => ({
    code,
    name: {
      'HYPERVISUAL': 'Hypervisual Agency Sàrl',
      'DAINAMICS': 'Dainamics Sàrl',
      'LEXAIA': 'Lexaia Sàrl',
      'ENKI_REALTY': 'Enki Realty SA',
      'TAKEOUT': 'TakeOut Factory Sàrl'
    }[code] || code,
    hasAccess: req.user.role === 'admin' || req.user.role === 'superadmin' || req.user.companies.includes(code)
  }));

  res.json({
    success: true,
    companies: allCompanies.filter(c => c.hasAccess),
    allCompanies: req.user.role === 'admin' || req.user.role === 'superadmin' ? allCompanies : undefined
  });
});

/**
 * POST /api/auth/register (Admin only)
 * Register a new user
 */
router.post('/register', authMiddleware, asyncHandler(async (req, res) => {
  // Only admin can create users
  if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
    return res.status(403).json({
      success: false,
      error: 'Permissions insuffisantes',
      code: 'FORBIDDEN'
    });
  }

  const { email, password, name, role, companies } = req.body;

  // Validation
  if (!email || !password || !name) {
    return res.status(400).json({
      success: false,
      error: 'Email, mot de passe et nom requis',
      code: 'VALIDATION_ERROR'
    });
  }

  try {
    const directus = getDirectus();

    // Check if user exists
    const existing = await directus.request(
      readItems('finance_users', {
        filter: { email: { _eq: email.toLowerCase() } },
        limit: 1
      })
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Cet email est déjà utilisé',
        code: 'EMAIL_EXISTS'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await directus.request(
      createItem('finance_users', {
        email: email.toLowerCase(),
        password: passwordHash,
        first_name: name,
        role: role || 'user',
        companies: companies || [],
        status: 'active',
        date_created: new Date().toISOString(),
        created_by: req.user.id
      })
    );

    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.first_name,
        role: newUser.role
      }
    });

  } catch (error) {
    console.error('User registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la création de l\'utilisateur',
      code: 'SERVER_ERROR'
    });
  }
}));

/**
 * POST /api/auth/magic-link
 * Send a one-time login link (client portal only)
 */
router.post('/magic-link', asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      error: 'Email requis',
      code: 'VALIDATION_ERROR'
    });
  }

  try {
    const directus = getDirectus();
    const crypto = await import('crypto');

    // Find contact in contacts collection
    const contacts = await directus.request(
      readItems('contacts', {
        filter: { email: { _eq: email.toLowerCase() } },
        limit: 1
      })
    );

    // Always return success to avoid email enumeration
    if (!contacts || contacts.length === 0) {
      return res.json({
        success: true,
        message: 'Si un compte existe avec cet email, un lien de connexion a ete envoye.'
      });
    }

    const contact = contacts[0];

    // Generate one-time token
    const token = crypto.randomUUID();

    // Store token in Directus (magic_link_tokens collection or contact field)
    try {
      await directus.request(
        createItem('magic_link_tokens', {
          token,
          contact_id: contact.id,
          email: contact.email,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          used: false
        })
      );
    } catch {
      // If collection doesn't exist, store on contact directly
      await directus.request(
        updateItem('contacts', contact.id, {
          magic_link_token: token,
          magic_link_expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        })
      );
    }

    // In dev mode, return token for testing
    const isDev = process.env.NODE_ENV !== 'production';
    if (isDev) {
      console.log(`[auth] Magic link token for ${email}: ${token}`);
    }

    // TODO: Send email via Mautic when available
    // await sendMagicLinkEmail(contact.email, token);

    res.json({
      success: true,
      message: 'Si un compte existe avec cet email, un lien de connexion a ete envoye.',
      ...(isDev && { dev_token: token })
    });

  } catch (error) {
    console.error('Magic link error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'envoi du lien',
      code: 'SERVER_ERROR'
    });
  }
}));

/**
 * GET /api/auth/magic-link/verify/:token
 * Verify a magic link token and create a session
 */
router.get('/magic-link/verify/:token', asyncHandler(async (req, res) => {
  const { token } = req.params;

  if (!token) {
    return res.status(400).json({
      success: false,
      error: 'Token requis',
      code: 'VALIDATION_ERROR'
    });
  }

  try {
    const directus = getDirectus();
    let contact = null;

    // Try magic_link_tokens collection first
    try {
      const tokens = await directus.request(
        readItems('magic_link_tokens', {
          filter: {
            _and: [
              { token: { _eq: token } },
              { used: { _eq: false } },
              { expires_at: { _gt: new Date().toISOString() } }
            ]
          },
          limit: 1
        })
      );

      if (tokens.length > 0) {
        const tokenRecord = tokens[0];
        contact = await directus.request(readItem('contacts', tokenRecord.contact_id));

        // Mark token as used (one-time)
        await directus.request(
          updateItem('magic_link_tokens', tokenRecord.id, { used: true })
        );
      }
    } catch {
      // Fallback: check contact directly
      const contacts = await directus.request(
        readItems('contacts', {
          filter: {
            _and: [
              { magic_link_token: { _eq: token } },
              { magic_link_expires: { _gt: new Date().toISOString() } }
            ]
          },
          limit: 1
        })
      );

      if (contacts.length > 0) {
        contact = contacts[0];
        // Clear token (one-time use)
        await directus.request(
          updateItem('contacts', contact.id, {
            magic_link_token: null,
            magic_link_expires: null
          })
        );
      }
    }

    if (!contact) {
      return res.status(401).json({
        success: false,
        error: 'Lien invalide ou expire',
        code: 'INVALID_MAGIC_LINK'
      });
    }

    // Generate client session token (24h)
    const { accessToken } = generateTokens({
      id: contact.id,
      email: contact.email,
      name: contact.first_name || contact.name || 'Client',
      role: 'client',
      companies: contact.company_id ? [contact.company_id] : [],
      permissions: ['projects.read', 'quotes.read', 'invoices.read']
    });

    res.json({
      success: true,
      accessToken,
      contact: {
        id: contact.id,
        name: contact.first_name || contact.name,
        email: contact.email
      }
    });

  } catch (error) {
    console.error('Magic link verify error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur de verification',
      code: 'SERVER_ERROR'
    });
  }
}));

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'auth',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

export default router;
