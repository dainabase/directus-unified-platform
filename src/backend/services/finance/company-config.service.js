/**
 * CompanyConfigService
 * Centralized configuration management for multi-tenant finance
 * Loads company configs from Directus database with caching
 *
 * @version 2.0.0
 * @author Claude Code
 */

import { createDirectus, rest, readItems, readItem, createItem, updateItem } from '@directus/sdk';

// Default TVA rates for Switzerland 2025
const DEFAULT_TVA_RATES = {
  NORMAL: 8.1,
  REDUIT: 2.6,
  HEBERGEMENT: 3.8,
  EXONERE: 0
};

// Default interest rate (Art. 104 CO - Swiss Code of Obligations)
const DEFAULT_INTEREST_RATE = 5.0;

// Default alert thresholds
const DEFAULT_ALERT_THRESHOLDS = {
  runway_danger: 3,       // Months of runway before danger alert
  runway_warning: 6,      // Months of runway before warning alert
  overdue_high: 30,       // Days overdue for high severity
  overdue_medium: 14,     // Days overdue for medium severity
  large_receivable: 10000, // Amount threshold for large receivable alerts
  large_payable: 5000     // Amount threshold for large payable alerts
};

// Default exchange rates (CHF base)
const DEFAULT_EXCHANGE_RATES = {
  CHF: 1.0,
  EUR: 0.94,
  USD: 0.88,
  GBP: 1.13
};

// Fallback company configs (used when DB not available)
const FALLBACK_COMPANIES = {
  'HYPERVISUAL': {
    code: 'HYPERVISUAL',
    name: 'HYPERVISUAL Sàrl',
    display_name: 'Hypervisual Agency Sàrl',
    ide: 'CHE-XXX.XXX.XXX',
    vat_number: 'CHE-XXX.XXX.XXX TVA',
    street: 'Rue du Commerce 15',
    postal_code: '1003',
    city: 'Lausanne',
    country: 'CH',
    qr_iban: 'CH4431999123000889012',
    regular_iban: 'CH4431999123000889012',
    email: 'contact@hypervisual.ch',
    phone: '+41 21 123 45 67',
    website: 'https://hypervisual.ch',
    color: '#2563eb',
    currency: 'CHF'
  },
  'DAINAMICS': {
    code: 'DAINAMICS',
    name: 'DAINAMICS SA',
    display_name: 'Dainamics SA',
    ide: 'CHE-XXX.XXX.XXX',
    vat_number: 'CHE-XXX.XXX.XXX TVA',
    street: 'Avenue de la Gare 10',
    postal_code: '1005',
    city: 'Lausanne',
    country: 'CH',
    qr_iban: 'CH5604835012345678009',
    regular_iban: 'CH5604835012345678009',
    email: 'contact@dainamics.ch',
    phone: '+41 21 234 56 78',
    website: 'https://dainamics.ch',
    color: '#7c3aed',
    currency: 'CHF'
  },
  'LEXAIA': {
    code: 'LEXAIA',
    name: 'LEXAIA Sàrl',
    display_name: 'Lexaia Sàrl',
    ide: 'CHE-XXX.XXX.XXX',
    vat_number: 'CHE-XXX.XXX.XXX TVA',
    street: 'Place de la Riponne 3',
    postal_code: '1005',
    city: 'Lausanne',
    country: 'CH',
    qr_iban: 'CH9300762011623852957',
    regular_iban: 'CH9300762011623852957',
    email: 'contact@lexaia.ch',
    phone: '+41 21 345 67 89',
    website: 'https://lexaia.ch',
    color: '#059669',
    currency: 'CHF'
  },
  'ENKI_REALTY': {
    code: 'ENKI_REALTY',
    name: 'ENKI Realty SA',
    display_name: 'Enki Realty SA',
    ide: 'CHE-XXX.XXX.XXX',
    vat_number: 'CHE-XXX.XXX.XXX TVA',
    street: 'Chemin des Vignes 8',
    postal_code: '1007',
    city: 'Lausanne',
    country: 'CH',
    qr_iban: 'CH7709000000876543210',
    regular_iban: 'CH7709000000876543210',
    email: 'contact@enki-realty.ch',
    phone: '+41 21 456 78 90',
    website: 'https://enki-realty.ch',
    color: '#dc2626',
    currency: 'CHF'
  },
  'TAKEOUT': {
    code: 'TAKEOUT',
    name: 'TakeOut Factory Sàrl',
    display_name: 'TakeOut Factory Sàrl',
    ide: 'CHE-XXX.XXX.XXX',
    vat_number: 'CHE-XXX.XXX.XXX TVA',
    street: 'Rue de Bourg 12',
    postal_code: '1003',
    city: 'Lausanne',
    country: 'CH',
    qr_iban: 'CH2804835011111111111',
    regular_iban: 'CH2804835011111111111',
    email: 'contact@takeout-factory.ch',
    phone: '+41 21 567 89 01',
    website: 'https://takeout-factory.ch',
    color: '#ea580c',
    currency: 'CHF'
  }
};

class CompanyConfigService {
  constructor() {
    this.directusUrl = process.env.DIRECTUS_URL || 'http://localhost:8055';
    this.directusToken = process.env.DIRECTUS_TOKEN;

    // Cache settings
    this.cache = {
      companies: null,
      exchangeRates: null,
      tvaRates: null,
      alertThresholds: null,
      lastUpdate: null,
      cacheDuration: 5 * 60 * 1000 // 5 minutes
    };

    // Static configs (rarely change)
    this.tvaRates = { ...DEFAULT_TVA_RATES };
    this.interestRate = DEFAULT_INTEREST_RATE;
    this.alertThresholds = { ...DEFAULT_ALERT_THRESHOLDS };
    this.exchangeRates = { ...DEFAULT_EXCHANGE_RATES };
  }

  /**
   * Get Directus client
   */
  getDirectus() {
    const client = createDirectus(this.directusUrl).with(rest());
    if (this.directusToken) {
      client.setToken(this.directusToken);
    }
    return client;
  }

  /**
   * Check if cache is valid
   */
  isCacheValid() {
    if (!this.cache.lastUpdate) return false;
    return (Date.now() - this.cache.lastUpdate) < this.cache.cacheDuration;
  }

  /**
   * Load all configurations from database
   */
  async loadAllConfigs() {
    if (this.isCacheValid()) {
      return {
        companies: this.cache.companies,
        tvaRates: this.tvaRates,
        exchangeRates: this.exchangeRates,
        alertThresholds: this.alertThresholds
      };
    }

    const directus = this.getDirectus();

    try {
      // Load companies
      await this.loadCompanies(directus);

      // Load TVA rates
      await this.loadTvaRates(directus);

      // Load exchange rates
      await this.loadExchangeRates(directus);

      // Load alert thresholds
      await this.loadAlertThresholds(directus);

      this.cache.lastUpdate = Date.now();

    } catch (error) {
      console.warn('Using fallback configs:', error.message);
      // Use fallback values already set in constructor
    }

    return {
      companies: this.cache.companies || FALLBACK_COMPANIES,
      tvaRates: this.tvaRates,
      exchangeRates: this.exchangeRates,
      alertThresholds: this.alertThresholds
    };
  }

  /**
   * Load company configurations from database
   */
  async loadCompanies(directus) {
    try {
      const companies = await directus.request(
        readItems('company_configs', {
          filter: { is_active: { _eq: true } },
          limit: -1
        })
      );

      if (companies && companies.length > 0) {
        this.cache.companies = {};
        for (const company of companies) {
          this.cache.companies[company.code] = {
            code: company.code,
            name: company.name,
            display_name: company.display_name || company.name,
            ide: company.ide,
            vat_number: company.vat_number,
            street: company.street,
            postal_code: company.postal_code,
            city: company.city,
            country: company.country || 'CH',
            qr_iban: company.qr_iban,
            regular_iban: company.regular_iban || company.qr_iban,
            email: company.email,
            phone: company.phone,
            website: company.website,
            color: company.color,
            currency: company.currency || 'CHF',
            logo_url: company.logo_url,
            settings: company.settings || {}
          };
        }
      } else {
        // No companies in DB, use fallback
        this.cache.companies = { ...FALLBACK_COMPANIES };
      }
    } catch (error) {
      // Collection might not exist
      console.warn('company_configs not found, using fallback');
      this.cache.companies = { ...FALLBACK_COMPANIES };
    }
  }

  /**
   * Load TVA rates from database
   */
  async loadTvaRates(directus) {
    try {
      const rates = await directus.request(
        readItems('tva_rates', {
          filter: { is_active: { _eq: true } },
          sort: ['sort_order'],
          limit: -1
        })
      );

      if (rates && rates.length > 0) {
        this.tvaRates = {};
        for (const rate of rates) {
          this.tvaRates[rate.code] = parseFloat(rate.rate);
        }
      }
    } catch (error) {
      // Use default rates
      this.tvaRates = { ...DEFAULT_TVA_RATES };
    }
  }

  /**
   * Load exchange rates from database
   */
  async loadExchangeRates(directus) {
    try {
      const rates = await directus.request(
        readItems('exchange_rates', {
          filter: { is_active: { _eq: true } },
          sort: ['-date'],
          limit: 10
        })
      );

      if (rates && rates.length > 0) {
        this.exchangeRates = { CHF: 1.0 };
        for (const rate of rates) {
          this.exchangeRates[rate.currency] = parseFloat(rate.rate_to_chf) || 1;
        }
        this.cache.exchangeRates = this.exchangeRates;
      }
    } catch (error) {
      // Use default rates
      this.exchangeRates = { ...DEFAULT_EXCHANGE_RATES };
    }
  }

  /**
   * Load alert thresholds from database
   */
  async loadAlertThresholds(directus) {
    try {
      const settings = await directus.request(
        readItems('finance_settings', {
          filter: { category: { _eq: 'alerts' } },
          limit: -1
        })
      );

      if (settings && settings.length > 0) {
        for (const setting of settings) {
          if (this.alertThresholds.hasOwnProperty(setting.key)) {
            this.alertThresholds[setting.key] = parseFloat(setting.value);
          }
        }
      }
    } catch (error) {
      // Use default thresholds
      this.alertThresholds = { ...DEFAULT_ALERT_THRESHOLDS };
    }
  }

  /**
   * Get company configuration by code
   * @param {string} companyCode - Company code (e.g., 'HYPERVISUAL')
   * @returns {Object} Company configuration
   */
  async getCompanyConfig(companyCode) {
    await this.loadAllConfigs();

    const companies = this.cache.companies || FALLBACK_COMPANIES;
    const company = companies[companyCode];

    if (!company) {
      throw new Error(`Company not found: ${companyCode}`);
    }

    return company;
  }

  /**
   * Get all companies
   * @returns {Object} All company configurations
   */
  async getAllCompanies() {
    await this.loadAllConfigs();
    return this.cache.companies || FALLBACK_COMPANIES;
  }

  /**
   * Get company list (codes and names only)
   * @returns {Array} List of companies
   */
  async getCompanyList() {
    const companies = await this.getAllCompanies();
    return Object.values(companies).map(c => ({
      code: c.code,
      name: c.name,
      display_name: c.display_name,
      color: c.color
    }));
  }

  /**
   * Get TVA rates
   * @returns {Object} TVA rates by code
   */
  async getTvaRates() {
    await this.loadAllConfigs();
    return this.tvaRates;
  }

  /**
   * Get specific TVA rate
   * @param {string} code - Rate code (NORMAL, REDUIT, etc.)
   * @returns {number} TVA rate percentage
   */
  async getTvaRate(code) {
    const rates = await this.getTvaRates();
    return rates[code] || rates.NORMAL || DEFAULT_TVA_RATES.NORMAL;
  }

  /**
   * Get interest rate for late payments (Art. 104 CO)
   * @returns {number} Interest rate percentage
   */
  getInterestRate() {
    return this.interestRate;
  }

  /**
   * Get exchange rates
   * @returns {Object} Exchange rates (currency -> CHF rate)
   */
  async getExchangeRates() {
    await this.loadAllConfigs();
    return this.exchangeRates;
  }

  /**
   * Convert amount to CHF
   * @param {number} amount - Amount in original currency
   * @param {string} currency - Original currency code
   * @returns {number} Amount in CHF
   */
  async convertToCHF(amount, currency) {
    if (currency === 'CHF') return amount;

    const rates = await this.getExchangeRates();
    const rate = rates[currency] || 1;
    return amount / rate;
  }

  /**
   * Get alert thresholds
   * @returns {Object} Alert thresholds
   */
  async getAlertThresholds() {
    await this.loadAllConfigs();
    return this.alertThresholds;
  }

  /**
   * Clear cache (force reload on next request)
   */
  clearCache() {
    this.cache.companies = null;
    this.cache.exchangeRates = null;
    this.cache.tvaRates = null;
    this.cache.alertThresholds = null;
    this.cache.lastUpdate = null;
  }

  /**
   * Update company configuration in database
   * @param {string} companyCode - Company code
   * @param {Object} updates - Fields to update
   * @returns {Object} Updated company config
   */
  async updateCompanyConfig(companyCode, updates) {
    const directus = this.getDirectus();

    try {
      // Find existing company
      const existing = await directus.request(
        readItems('company_configs', {
          filter: { code: { _eq: companyCode } },
          limit: 1
        })
      );

      if (existing && existing.length > 0) {
        // Update existing
        await directus.request(
          updateItem('company_configs', existing[0].id, {
            ...updates,
            updated_at: new Date().toISOString()
          })
        );
      } else {
        // Create new
        await directus.request(
          createItem('company_configs', {
            code: companyCode,
            ...updates,
            is_active: true,
            created_at: new Date().toISOString()
          })
        );
      }

      // Clear cache to reload
      this.clearCache();

      return await this.getCompanyConfig(companyCode);

    } catch (error) {
      console.error('Error updating company config:', error);
      throw error;
    }
  }

  /**
   * Sync fallback companies to database (admin function)
   * Creates company_configs records from fallback data
   */
  async syncFallbackToDatabase() {
    const directus = this.getDirectus();
    const results = { created: 0, updated: 0, errors: [] };

    for (const [code, config] of Object.entries(FALLBACK_COMPANIES)) {
      try {
        // Check if exists
        const existing = await directus.request(
          readItems('company_configs', {
            filter: { code: { _eq: code } },
            limit: 1
          })
        );

        if (existing && existing.length > 0) {
          // Update
          await directus.request(
            updateItem('company_configs', existing[0].id, {
              ...config,
              is_active: true,
              updated_at: new Date().toISOString()
            })
          );
          results.updated++;
        } else {
          // Create
          await directus.request(
            createItem('company_configs', {
              ...config,
              is_active: true,
              created_at: new Date().toISOString()
            })
          );
          results.created++;
        }
      } catch (error) {
        results.errors.push({ code, error: error.message });
      }
    }

    // Clear cache
    this.clearCache();

    return results;
  }
}

// Singleton instance
export const companyConfigService = new CompanyConfigService();

// Named exports for convenience
export {
  DEFAULT_TVA_RATES,
  DEFAULT_INTEREST_RATE,
  DEFAULT_ALERT_THRESHOLDS,
  DEFAULT_EXCHANGE_RATES,
  FALLBACK_COMPANIES
};

export default CompanyConfigService;
