const jwt = require('jsonwebtoken');
const axios = require('axios');
const fs = require('fs').promises;

/**
 * Service d'authentification OAuth2 pour Revolut Business API
 * Gère les tokens pour les 5 entreprises du système
 */
class RevolutOAuth {
  constructor(config) {
    this.config = config;
    this.tokens = new Map(); // Cache tokens par entreprise
  }

  /**
   * Obtenir un access token valide pour une entreprise
   * @param {string} companyId - ID de l'entreprise (hypervisual, dynamics, lexia, nkreality, etekout)
   * @returns {Promise<string>} Access token
   */
  async getAccessToken(companyId) {
    // Vérifier cache
    const cached = this.tokens.get(companyId);
    if (cached && cached.expiresAt > Date.now()) {
      console.log(`🟢 Token cached valide pour ${companyId}`);
      return cached.token;
    }

    // Charger config entreprise
    const companyConfig = this.config.companies[companyId];
    if (!companyConfig) {
      throw new Error(`Configuration Revolut manquante pour ${companyId}`);
    }

    try {
      // Lire clé privée RSA
      const privateKey = await fs.readFile(companyConfig.privateKeyPath, 'utf8');

      // Créer JWT pour OAuth2
      const now = Math.floor(Date.now() / 1000);
      const payload = {
        iss: companyConfig.clientId, // Issuer
        sub: companyConfig.clientId, // Subject
        aud: 'https://revolut.com',  // Audience
        iat: now,                    // Issued at
        exp: now + 3600              // Expires in 1 hour
      };

      const clientAssertion = jwt.sign(payload, privateKey, {
        algorithm: 'RS256',
        header: {
          typ: 'JWT',
          alg: 'RS256'
        }
      });

      console.log(`🔑 JWT créé pour ${companyId}`);

      // Échanger contre access token
      const response = await axios.post(
        this.config.authURL,
        new URLSearchParams({
          grant_type: 'client_credentials',
          client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
          client_assertion: clientAssertion,
          scope: 'read write'
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
          },
          timeout: 30000
        }
      );

      // Mettre en cache avec marge de sécurité
      const expiresIn = response.data.expires_in || 3600;
      this.tokens.set(companyId, {
        token: response.data.access_token,
        expiresAt: Date.now() + (expiresIn * 1000) - 60000 // -1min de marge
      });

      console.log(`✅ Token OAuth2 obtenu pour ${companyId} (expires in ${expiresIn}s)`);
      return response.data.access_token;

    } catch (error) {
      console.error(`❌ Erreur auth Revolut ${companyId}:`, {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Nettoyer le cache en cas d'erreur
      this.tokens.delete(companyId);
      throw new Error(`Échec authentification Revolut ${companyId}: ${error.message}`);
    }
  }

  /**
   * Vider le cache d'un token (pour forcer le renouvellement)
   * @param {string} companyId - ID de l'entreprise
   */
  clearCache(companyId) {
    this.tokens.delete(companyId);
    console.log(`🗑️ Cache token vidé pour ${companyId}`);
  }

  /**
   * Vider tous les caches
   */
  clearAllCaches() {
    this.tokens.clear();
    console.log('🗑️ Tous les caches tokens vidés');
  }

  /**
   * Obtenir le statut du cache
   * @returns {Object} Statut des tokens en cache
   */
  getCacheStatus() {
    const status = {};
    for (const [companyId, tokenData] of this.tokens.entries()) {
      status[companyId] = {
        hasToken: !!tokenData.token,
        expiresAt: new Date(tokenData.expiresAt).toISOString(),
        expiresInMinutes: Math.round((tokenData.expiresAt - Date.now()) / 60000)
      };
    }
    return status;
  }
}

module.exports = RevolutOAuth;