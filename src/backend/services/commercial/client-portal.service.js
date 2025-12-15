/**
 * Client Portal Service - Gestion des comptes portail client
 *
 * Fonctionnalités:
 * - Création de comptes avec mot de passe temporaire
 * - Activation de compte
 * - Authentification
 * - Réinitialisation mot de passe
 * - Gestion des sessions
 *
 * @date 15 Décembre 2025
 */

import axios from 'axios';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN || 'hbQz-9935crJ2YkLul_zpQJDBw2M-y5v';
const JWT_SECRET = process.env.JWT_SECRET || process.env.SECRET || 'portal-secret-key-change-in-production';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '24h';

const api = axios.create({
  baseURL: DIRECTUS_URL,
  headers: {
    'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// Portal domains by company
const PORTAL_DOMAINS = {
  HYPERVISUAL: 'client.hypervisual.ch',
  DAINAMICS: 'client.dainamics.ch',
  LEXAIA: 'client.lexaia.ch',
  ENKI_REALTY: 'client.enkirealty.ch',
  TAKEOUT: 'client.takeout.ch'
};

/**
 * Générer un mot de passe temporaire sécurisé
 */
function generateTempPassword() {
  return crypto.randomBytes(12).toString('base64url');
}

/**
 * Générer un token d'activation
 */
function generateActivationToken() {
  return crypto.randomUUID();
}

/**
 * Récupérer le domaine portail pour une entreprise
 */
async function getPortalDomain(ownerCompanyId) {
  try {
    const res = await api.get(`/items/owner_companies/${ownerCompanyId}`);
    const company = res.data.data;
    return PORTAL_DOMAINS[company.code] || `client.${company.code?.toLowerCase()}.ch`;
  } catch (error) {
    return 'client.portal.ch';
  }
}

/**
 * Créer un compte portail client
 */
export async function createPortalAccount(data) {
  try {
    const {
      contact_id,
      company_id,
      owner_company_id,
      email
    } = data;

    // Validate required fields
    if (!contact_id || !owner_company_id || !email) {
      throw new Error('contact_id, owner_company_id et email sont requis');
    }

    // Check if account already exists
    const existingRes = await api.get('/items/client_portal_accounts', {
      params: {
        filter: {
          _and: [
            { contact_id: { _eq: contact_id } },
            { owner_company_id: { _eq: owner_company_id } }
          ]
        },
        limit: 1
      }
    });

    if (existingRes.data.data.length > 0) {
      const existingAccount = existingRes.data.data[0];
      return {
        success: true,
        account: existingAccount,
        message: 'Account already exists',
        isNew: false
      };
    }

    // Generate temp password
    const tempPassword = generateTempPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    // Generate activation token
    const activationToken = generateActivationToken();
    const activationExpires = new Date();
    activationExpires.setHours(activationExpires.getHours() + 72); // 72h

    // Get portal domain
    const portalDomain = await getPortalDomain(owner_company_id);

    // Create account
    const accountData = {
      contact_id,
      company_id,
      owner_company_id,
      email,
      password_hash: passwordHash,
      status: 'pending',
      activation_token: activationToken,
      portal_domain: portalDomain,
      language: 'fr',
      failed_login_attempts: 0
    };

    const res = await api.post('/items/client_portal_accounts', accountData);
    const account = res.data.data;

    console.log(`✅ Portal account created for ${email} (${portalDomain})`);

    return {
      success: true,
      account,
      tempPassword, // Return to send in email
      activationToken,
      activationUrl: `https://${portalDomain}/activate?token=${activationToken}`,
      isNew: true
    };
  } catch (error) {
    console.error('Error creating portal account:', error.message);
    throw error;
  }
}

/**
 * Activer un compte portail
 */
export async function activateAccount(activationToken, newPassword) {
  try {
    // Find account by activation token
    const res = await api.get('/items/client_portal_accounts', {
      params: {
        filter: {
          activation_token: { _eq: activationToken }
        },
        limit: 1
      }
    });

    if (res.data.data.length === 0) {
      throw new Error('Token d\'activation invalide ou expiré');
    }

    const account = res.data.data[0];

    if (account.status !== 'pending') {
      throw new Error('Ce compte a déjà été activé');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Update account
    await api.patch(`/items/client_portal_accounts/${account.id}`, {
      status: 'active',
      password_hash: passwordHash,
      activation_token: null,
      activated_at: new Date().toISOString()
    });

    console.log(`✅ Portal account activated: ${account.email}`);

    return {
      success: true,
      message: 'Compte activé avec succès',
      email: account.email
    };
  } catch (error) {
    console.error('Error activating account:', error.message);
    throw error;
  }
}

/**
 * Authentifier un utilisateur portail
 */
export async function authenticateUser(email, password, ipAddress = null, userAgent = null) {
  try {
    // Find account by email
    const res = await api.get('/items/client_portal_accounts', {
      params: {
        filter: {
          email: { _eq: email }
        },
        fields: [
          '*',
          'contact_id.id',
          'contact_id.first_name',
          'contact_id.last_name',
          'company_id.id',
          'company_id.name',
          'owner_company_id.id',
          'owner_company_id.name',
          'owner_company_id.code'
        ].join(','),
        limit: 1
      }
    });

    if (res.data.data.length === 0) {
      throw new Error('Email ou mot de passe incorrect');
    }

    const account = res.data.data[0];

    // Check if account is active
    if (account.status !== 'active') {
      if (account.status === 'pending') {
        throw new Error('Veuillez d\'abord activer votre compte');
      }
      if (account.status === 'suspended' || account.status === 'disabled') {
        throw new Error('Votre compte est désactivé. Contactez le support.');
      }
    }

    // Check if account is locked
    if (account.locked_until) {
      const lockExpiry = new Date(account.locked_until);
      if (lockExpiry > new Date()) {
        throw new Error('Compte temporairement bloqué. Réessayez plus tard.');
      }
    }

    // Verify password
    const passwordValid = await bcrypt.compare(password, account.password_hash);

    if (!passwordValid) {
      // Increment failed attempts
      const failedAttempts = (account.failed_login_attempts || 0) + 1;
      const updateData = { failed_login_attempts: failedAttempts };

      // Lock account after 5 failed attempts (30 minutes)
      if (failedAttempts >= 5) {
        const lockUntil = new Date();
        lockUntil.setMinutes(lockUntil.getMinutes() + 30);
        updateData.locked_until = lockUntil.toISOString();
      }

      await api.patch(`/items/client_portal_accounts/${account.id}`, updateData);

      throw new Error('Email ou mot de passe incorrect');
    }

    // Generate JWT token
    const tokenPayload = {
      accountId: account.id,
      contactId: account.contact_id?.id,
      companyId: account.company_id?.id,
      ownerCompanyId: account.owner_company_id?.id,
      email: account.email,
      portalDomain: account.portal_domain
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRY });

    // Update login info
    await api.patch(`/items/client_portal_accounts/${account.id}`, {
      last_login_at: new Date().toISOString(),
      last_login_ip: ipAddress,
      failed_login_attempts: 0,
      locked_until: null
    });

    console.log(`✅ User authenticated: ${account.email}`);

    return {
      success: true,
      token,
      user: {
        id: account.id,
        email: account.email,
        firstName: account.contact_id?.first_name,
        lastName: account.contact_id?.last_name,
        company: account.company_id?.name,
        ownerCompany: account.owner_company_id?.name,
        ownerCompanyCode: account.owner_company_id?.code,
        portalDomain: account.portal_domain,
        language: account.language
      }
    };
  } catch (error) {
    console.error('Authentication error:', error.message);
    throw error;
  }
}

/**
 * Vérifier un token JWT
 */
export function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return {
      valid: true,
      payload: decoded
    };
  } catch (error) {
    return {
      valid: false,
      error: error.message
    };
  }
}

/**
 * Demander une réinitialisation de mot de passe
 */
export async function requestPasswordReset(email) {
  try {
    // Find account by email
    const res = await api.get('/items/client_portal_accounts', {
      params: {
        filter: {
          email: { _eq: email }
        },
        limit: 1
      }
    });

    // Always return success to prevent email enumeration
    if (res.data.data.length === 0) {
      return { success: true, message: 'Si l\'email existe, un lien de réinitialisation sera envoyé.' };
    }

    const account = res.data.data[0];

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 1); // 1 hour

    // Save reset token
    await api.patch(`/items/client_portal_accounts/${account.id}`, {
      password_reset_token: resetToken,
      password_reset_expires: resetExpires.toISOString()
    });

    const resetUrl = `https://${account.portal_domain}/reset-password?token=${resetToken}`;

    console.log(`✅ Password reset requested for ${email}`);

    return {
      success: true,
      message: 'Si l\'email existe, un lien de réinitialisation sera envoyé.',
      resetUrl, // Return for email sending
      email
    };
  } catch (error) {
    console.error('Error requesting password reset:', error.message);
    throw error;
  }
}

/**
 * Réinitialiser le mot de passe
 */
export async function resetPassword(resetToken, newPassword) {
  try {
    // Find account by reset token
    const res = await api.get('/items/client_portal_accounts', {
      params: {
        filter: {
          password_reset_token: { _eq: resetToken }
        },
        limit: 1
      }
    });

    if (res.data.data.length === 0) {
      throw new Error('Token de réinitialisation invalide');
    }

    const account = res.data.data[0];

    // Check if token is expired
    if (account.password_reset_expires) {
      const expiry = new Date(account.password_reset_expires);
      if (expiry < new Date()) {
        throw new Error('Le lien de réinitialisation a expiré');
      }
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Update account
    await api.patch(`/items/client_portal_accounts/${account.id}`, {
      password_hash: passwordHash,
      password_reset_token: null,
      password_reset_expires: null,
      failed_login_attempts: 0,
      locked_until: null
    });

    console.log(`✅ Password reset successful for ${account.email}`);

    return {
      success: true,
      message: 'Mot de passe modifié avec succès'
    };
  } catch (error) {
    console.error('Error resetting password:', error.message);
    throw error;
  }
}

/**
 * Récupérer un compte par contact ID
 */
export async function getAccountByContact(contactId, ownerCompanyId) {
  try {
    const filter = {
      contact_id: { _eq: contactId }
    };

    if (ownerCompanyId) {
      filter.owner_company_id = { _eq: ownerCompanyId };
    }

    const res = await api.get('/items/client_portal_accounts', {
      params: {
        filter,
        fields: [
          '*',
          'contact_id.first_name',
          'contact_id.last_name',
          'company_id.name',
          'owner_company_id.name'
        ].join(','),
        limit: 1
      }
    });

    return res.data.data[0] || null;
  } catch (error) {
    console.error('Error getting account by contact:', error.message);
    return null;
  }
}

/**
 * Mettre à jour les préférences utilisateur
 */
export async function updatePreferences(accountId, preferences) {
  try {
    const allowedFields = ['language', 'notification_preferences'];
    const updateData = {};

    for (const field of allowedFields) {
      if (preferences[field] !== undefined) {
        updateData[field] = preferences[field];
      }
    }

    await api.patch(`/items/client_portal_accounts/${accountId}`, updateData);

    return { success: true };
  } catch (error) {
    console.error('Error updating preferences:', error.message);
    throw error;
  }
}

export default {
  createPortalAccount,
  activateAccount,
  authenticateUser,
  verifyToken,
  requestPasswordReset,
  resetPassword,
  getAccountByContact,
  updatePreferences,
  generateTempPassword,
  getPortalDomain
};
