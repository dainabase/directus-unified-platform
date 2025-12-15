/**
 * Portal API Routes
 *
 * Endpoints pour le portail client
 *
 * @date 15 Décembre 2025
 */

import express from 'express';
import * as portalService from '../../services/commercial/client-portal.service.js';

const router = express.Router();

/**
 * Middleware d'authentification portail
 */
function authenticatePortal(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  const token = authHeader.split(' ')[1];
  const result = portalService.verifyToken(token);

  if (!result.valid) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token'
    });
  }

  req.portalUser = result.payload;
  next();
}

/**
 * POST /api/commercial/portal/auth/login
 * Connexion portail client
 */
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    const result = await portalService.authenticateUser(
      email,
      password,
      ipAddress,
      userAgent
    );

    res.json(result);
  } catch (error) {
    console.error('POST /portal/auth/login error:', error.message);
    res.status(401).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/commercial/portal/auth/activate
 * Activer un compte portail
 */
router.post('/auth/activate', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        error: 'Token and password are required'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters'
      });
    }

    const result = await portalService.activateAccount(token, password);

    res.json(result);
  } catch (error) {
    console.error('POST /portal/auth/activate error:', error.message);
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/commercial/portal/auth/forgot-password
 * Demande de réinitialisation mot de passe
 */
router.post('/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    const result = await portalService.requestPasswordReset(email);

    // Always return success to prevent email enumeration
    res.json({
      success: true,
      message: 'If the email exists, a reset link will be sent.'
    });

    // In production, send email here
    if (result.resetUrl) {
      console.log(`📧 Password reset email would be sent to ${email}`);
    }
  } catch (error) {
    console.error('POST /portal/auth/forgot-password error:', error.message);
    // Still return success to prevent enumeration
    res.json({
      success: true,
      message: 'If the email exists, a reset link will be sent.'
    });
  }
});

/**
 * POST /api/commercial/portal/auth/reset-password
 * Réinitialiser le mot de passe
 */
router.post('/auth/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        error: 'Token and password are required'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters'
      });
    }

    const result = await portalService.resetPassword(token, password);

    res.json(result);
  } catch (error) {
    console.error('POST /portal/auth/reset-password error:', error.message);
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/commercial/portal/auth/verify
 * Vérifier un token
 */
router.get('/auth/verify', authenticatePortal, (req, res) => {
  res.json({
    success: true,
    valid: true,
    user: req.portalUser
  });
});

/**
 * GET /api/commercial/portal/me
 * Profil utilisateur connecté
 */
router.get('/me', authenticatePortal, async (req, res) => {
  try {
    const account = await portalService.getAccountByContact(
      req.portalUser.contactId,
      req.portalUser.ownerCompanyId
    );

    if (!account) {
      return res.status(404).json({
        success: false,
        error: 'Account not found'
      });
    }

    res.json({
      success: true,
      account: {
        id: account.id,
        email: account.email,
        firstName: account.contact_id?.first_name,
        lastName: account.contact_id?.last_name,
        company: account.company_id?.name,
        portalDomain: account.portal_domain,
        language: account.language,
        lastLoginAt: account.last_login_at
      }
    });
  } catch (error) {
    console.error('GET /portal/me error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PATCH /api/commercial/portal/me/preferences
 * Mettre à jour les préférences
 */
router.patch('/me/preferences', authenticatePortal, async (req, res) => {
  try {
    const { language, notification_preferences } = req.body;

    const result = await portalService.updatePreferences(
      req.portalUser.accountId,
      { language, notification_preferences }
    );

    res.json(result);
  } catch (error) {
    console.error('PATCH /portal/me/preferences error:', error.message);
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/commercial/portal/accounts
 * Créer un compte portail (admin)
 */
router.post('/accounts', async (req, res) => {
  try {
    const {
      contact_id,
      company_id,
      owner_company_id,
      email
    } = req.body;

    const result = await portalService.createPortalAccount({
      contact_id,
      company_id,
      owner_company_id,
      email
    });

    res.status(result.isNew ? 201 : 200).json(result);
  } catch (error) {
    console.error('POST /portal/accounts error:', error.message);
    res.status(400).json({ success: false, error: error.message });
  }
});

// Export middleware for use in other routes
export { authenticatePortal };
export default router;
