import jwt from 'jsonwebtoken';
import axios from 'axios';
import fs from 'fs/promises';
import crypto from 'crypto';
import { logger } from '../utils/logger.js';

/**
 * Revolut Business API v2 OAuth2 Authentication
 * Implements JWT RS256 signing and token management
 */
class RevolutAuth {
  constructor() {
    this.baseUrl = process.env.REVOLUT_API_URL || 'https://b2b.revolut.com/api/1.0';
    this.tokenCache = new Map();
    this.refreshTimers = new Map();
  }

  /**
   * Generate JWT for OAuth2 authentication
   * @param {string} clientId - Revolut client ID
   * @param {string} privateKeyPath - Path to RSA private key
   * @returns {Promise<string>} Signed JWT
   */
  async generateJWT(clientId, privateKeyPath) {
    try {
      const privateKey = await fs.readFile(privateKeyPath, 'utf8');
      const now = Math.floor(Date.now() / 1000);
      
      const payload = {
        iss: clientId,
        sub: clientId,
        aud: 'https://revolut.com',
        iat: now,
        exp: now + 300, // 5 minutes
        jti: crypto.randomUUID()
      };

      const token = jwt.sign(payload, privateKey, {
        algorithm: 'RS256',
        header: {
          alg: 'RS256',
          typ: 'JWT'
        }
      });

      logger.info(`JWT generated for client ${clientId}`);
      return token;
    } catch (error) {
      logger.error('JWT generation failed:', error);
      throw new Error(`Failed to generate JWT: ${error.message}`);
    }
  }

  /**
   * Exchange JWT for access token
   * @param {string} jwt - Signed JWT
   * @param {string} companyName - Company identifier
   * @returns {Promise<Object>} Access token response
   */
  async getAccessToken(jwt, companyName) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/auth/token`,
        {
          grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
          assertion: jwt
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      const tokenData = {
        ...response.data,
        company: companyName,
        obtained_at: new Date()
      };

      // Cache the token
      this.tokenCache.set(companyName, tokenData);
      
      // Schedule refresh before expiry
      this.scheduleTokenRefresh(companyName, tokenData);

      logger.info(`Access token obtained for ${companyName}`);
      return tokenData;
    } catch (error) {
      logger.error(`Token exchange failed for ${companyName}:`, error.response?.data || error);
      throw new Error(`Failed to obtain access token: ${error.message}`);
    }
  }

  /**
   * Get valid token for a company (from cache or refresh)
   * @param {string} companyName - Company identifier
   * @returns {Promise<string>} Valid access token
   */
  async getTokenForCompany(companyName) {
    // Check cache first
    const cached = this.tokenCache.get(companyName);
    if (cached && this.isTokenValid(cached)) {
      return cached.access_token;
    }

    // Generate new token
    const clientId = process.env[`REVOLUT_${companyName}_CLIENT_ID`];
    const privateKeyPath = process.env[`REVOLUT_${companyName}_PRIVATE_KEY_PATH`];

    if (!clientId || !privateKeyPath) {
      throw new Error(`Missing Revolut configuration for ${companyName}`);
    }

    const jwt = await this.generateJWT(clientId, privateKeyPath);
    const tokenData = await this.getAccessToken(jwt, companyName);
    
    return tokenData.access_token;
  }

  /**
   * Refresh access token
   * @param {string} companyName - Company identifier
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object>} New token data
   */
  async refreshToken(companyName, refreshToken) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/auth/token`,
        {
          grant_type: 'refresh_token',
          refresh_token: refreshToken
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      const tokenData = {
        ...response.data,
        company: companyName,
        obtained_at: new Date()
      };

      // Update cache
      this.tokenCache.set(companyName, tokenData);
      
      // Reschedule refresh
      this.scheduleTokenRefresh(companyName, tokenData);

      logger.info(`Token refreshed for ${companyName}`);
      return tokenData;
    } catch (error) {
      logger.error(`Token refresh failed for ${companyName}:`, error);
      
      // Clear invalid token and timer
      this.tokenCache.delete(companyName);
      this.clearRefreshTimer(companyName);
      
      throw error;
    }
  }

  /**
   * Check if token is still valid
   * @param {Object} tokenData - Token data object
   * @returns {boolean} Token validity
   */
  isTokenValid(tokenData) {
    if (!tokenData || !tokenData.obtained_at || !tokenData.expires_in) {
      return false;
    }

    const expiryTime = new Date(tokenData.obtained_at).getTime() + (tokenData.expires_in * 1000);
    const now = Date.now();
    const buffer = 60000; // 1 minute buffer

    return now < (expiryTime - buffer);
  }

  /**
   * Schedule automatic token refresh
   * @param {string} companyName - Company identifier
   * @param {Object} tokenData - Token data
   */
  scheduleTokenRefresh(companyName, tokenData) {
    // Clear existing timer
    this.clearRefreshTimer(companyName);

    // Schedule refresh 5 minutes before expiry
    const refreshIn = (tokenData.expires_in - 300) * 1000;
    
    const timer = setTimeout(async () => {
      try {
        if (tokenData.refresh_token) {
          await this.refreshToken(companyName, tokenData.refresh_token);
        } else {
          // Re-authenticate if no refresh token
          await this.getTokenForCompany(companyName);
        }
      } catch (error) {
        logger.error(`Scheduled refresh failed for ${companyName}:`, error);
      }
    }, refreshIn);

    this.refreshTimers.set(companyName, timer);
    logger.info(`Token refresh scheduled for ${companyName} in ${refreshIn / 1000} seconds`);
  }

  /**
   * Clear refresh timer for a company
   * @param {string} companyName - Company identifier
   */
  clearRefreshTimer(companyName) {
    const timer = this.refreshTimers.get(companyName);
    if (timer) {
      clearTimeout(timer);
      this.refreshTimers.delete(companyName);
    }
  }

  /**
   * Clear all tokens and timers (for cleanup)
   */
  clearAll() {
    this.tokenCache.clear();
    this.refreshTimers.forEach(timer => clearTimeout(timer));
    this.refreshTimers.clear();
  }

  /**
   * Initialize authentication for all companies
   */
  async initializeAllCompanies() {
    const companies = ['HYPERVISUAL', 'DAINAMICS', 'LEXAIA', 'ENKI_REALTY', 'TAKEOUT'];
    const results = {};

    for (const company of companies) {
      try {
        await this.getTokenForCompany(company);
        results[company] = 'success';
      } catch (error) {
        logger.error(`Failed to initialize ${company}:`, error);
        results[company] = 'failed';
      }
    }

    return results;
  }
}

// Export singleton instance
export const revolutAuth = new RevolutAuth();