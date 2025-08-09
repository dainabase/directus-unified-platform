import jose from 'node-jose';
import crypto from 'crypto';
import fs from 'fs/promises';
import { logger } from './logger.js';

/**
 * JWT Handler for Revolut OAuth2
 * Implements RS256 signing with node-jose
 */
export class JWTHandler {
  constructor() {
    this.keyStore = jose.JWK.createKeyStore();
    this.keys = new Map();
  }

  /**
   * Load RSA private key from file
   * @param {string} keyPath - Path to private key file
   * @param {string} keyId - Identifier for the key
   * @returns {Promise<Object>} JWK key object
   */
  async loadPrivateKey(keyPath, keyId) {
    try {
      // Check cache first
      if (this.keys.has(keyId)) {
        return this.keys.get(keyId);
      }

      // Read key from file
      const pemKey = await fs.readFile(keyPath, 'utf8');
      
      // Import to keystore
      const key = await this.keyStore.add(pemKey, 'pem', {
        kid: keyId,
        use: 'sig',
        alg: 'RS256'
      });

      // Cache the key
      this.keys.set(keyId, key);
      
      logger.info(`Private key loaded for ${keyId}`);
      return key;
    } catch (error) {
      logger.error(`Failed to load private key from ${keyPath}:`, error);
      throw new Error(`Failed to load private key: ${error.message}`);
    }
  }

  /**
   * Create and sign JWT for Revolut OAuth2
   * @param {string} clientId - Revolut client ID
   * @param {Object} key - JWK key object
   * @param {Object} additionalClaims - Additional JWT claims
   * @returns {Promise<string>} Signed JWT
   */
  async createSignedJWT(clientId, key, additionalClaims = {}) {
    try {
      const now = Math.floor(Date.now() / 1000);
      
      // JWT payload
      const payload = {
        iss: clientId,
        sub: clientId,
        aud: 'https://revolut.com',
        iat: now,
        exp: now + 300, // 5 minutes
        jti: crypto.randomUUID(),
        ...additionalClaims
      };

      // Create JWT
      const jwt = await jose.JWS.createSign(
        {
          format: 'compact',
          fields: {
            typ: 'JWT',
            alg: 'RS256',
            kid: key.kid
          }
        },
        key
      )
      .update(JSON.stringify(payload))
      .final();

      logger.debug(`JWT created for client ${clientId}`);
      return jwt;
    } catch (error) {
      logger.error('JWT creation failed:', error);
      throw new Error(`Failed to create JWT: ${error.message}`);
    }
  }

  /**
   * Verify JWT signature (for testing)
   * @param {string} jwt - JWT to verify
   * @param {Object} key - JWK key object
   * @returns {Promise<Object>} Decoded payload
   */
  async verifyJWT(jwt, key) {
    try {
      const result = await jose.JWS.createVerify(key)
        .verify(jwt);
      
      const payload = JSON.parse(result.payload.toString());
      
      // Check expiration
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        throw new Error('JWT expired');
      }
      
      return payload;
    } catch (error) {
      logger.error('JWT verification failed:', error);
      throw new Error(`Failed to verify JWT: ${error.message}`);
    }
  }

  /**
   * Generate JWT for Revolut OAuth2 authentication
   * @param {string} clientId - Revolut client ID
   * @param {string} privateKeyPath - Path to RSA private key
   * @returns {Promise<string>} Signed JWT ready for OAuth2
   */
  async generateRevolutJWT(clientId, privateKeyPath) {
    try {
      // Load or get cached key
      const key = await this.loadPrivateKey(privateKeyPath, clientId);
      
      // Create and sign JWT
      const jwt = await this.createSignedJWT(clientId, key);
      
      return jwt;
    } catch (error) {
      logger.error(`Failed to generate Revolut JWT for ${clientId}:`, error);
      throw error;
    }
  }

  /**
   * Clear cached keys
   */
  clearCache() {
    this.keys.clear();
    this.keyStore = jose.JWK.createKeyStore();
    logger.info('JWT key cache cleared');
  }
}

// Export singleton instance
export const jwtHandler = new JWTHandler();