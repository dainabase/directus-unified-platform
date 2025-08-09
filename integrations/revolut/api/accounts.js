import axios from 'axios';
import { revolutAuth } from './auth.js';
import { logger } from '../utils/logger.js';

/**
 * Revolut Accounts API
 * Manages bank accounts and balances
 */
class RevolutAccounts {
  constructor() {
    this.baseUrl = process.env.REVOLUT_API_URL || 'https://b2b.revolut.com/api/1.0';
  }

  /**
   * Create API client with authentication
   * @param {string} companyName - Company identifier
   * @returns {Promise<axios>} Configured axios instance
   */
  async createClient(companyName) {
    const token = await revolutAuth.getTokenForCompany(companyName);
    
    return axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 30000
    });
  }

  /**
   * Get all accounts for a company
   * @param {string} companyName - Company identifier
   * @returns {Promise<Array>} List of accounts
   */
  async getAccounts(companyName) {
    try {
      const client = await this.createClient(companyName);
      const response = await client.get('/accounts');
      
      const accounts = response.data.map(account => ({
        ...account,
        owner_company: companyName,
        bank_name: 'Revolut'
      }));

      logger.info(`Retrieved ${accounts.length} accounts for ${companyName}`);
      return accounts;
    } catch (error) {
      logger.error(`Failed to get accounts for ${companyName}:`, error.response?.data || error);
      throw error;
    }
  }

  /**
   * Get account details with current balance
   * @param {string} companyName - Company identifier
   * @param {string} accountId - Revolut account ID
   * @returns {Promise<Object>} Account details with balance
   */
  async getAccountDetails(companyName, accountId) {
    try {
      const client = await this.createClient(companyName);
      const response = await client.get(`/accounts/${accountId}`);
      
      const account = {
        ...response.data,
        owner_company: companyName,
        bank_name: 'Revolut',
        last_sync: new Date()
      };

      logger.info(`Retrieved details for account ${accountId} (${companyName})`);
      return account;
    } catch (error) {
      logger.error(`Failed to get account details for ${accountId}:`, error);
      throw error;
    }
  }

  /**
   * Get all balances for a company
   * @param {string} companyName - Company identifier
   * @returns {Promise<Object>} Balances by currency
   */
  async getBalances(companyName) {
    try {
      const accounts = await this.getAccounts(companyName);
      const balances = {};

      for (const account of accounts) {
        balances[account.currency] = {
          balance: account.balance,
          available_balance: account.balance - (account.blocked_amount || 0),
          currency: account.currency,
          account_id: account.id,
          account_name: account.name,
          last_updated: new Date()
        };
      }

      logger.info(`Retrieved balances for ${companyName}:`, Object.keys(balances));
      return balances;
    } catch (error) {
      logger.error(`Failed to get balances for ${companyName}:`, error);
      throw error;
    }
  }

  /**
   * Get account by currency
   * @param {string} companyName - Company identifier
   * @param {string} currency - Currency code (CHF, EUR, USD)
   * @returns {Promise<Object>} Account details
   */
  async getAccountByCurrency(companyName, currency) {
    try {
      const accounts = await this.getAccounts(companyName);
      const account = accounts.find(acc => acc.currency === currency);
      
      if (!account) {
        throw new Error(`No ${currency} account found for ${companyName}`);
      }

      return account;
    } catch (error) {
      logger.error(`Failed to get ${currency} account for ${companyName}:`, error);
      throw error;
    }
  }

  /**
   * Get aggregated balance across all currencies in CHF
   * @param {string} companyName - Company identifier
   * @param {Object} exchangeRates - Exchange rates to CHF
   * @returns {Promise<number>} Total balance in CHF
   */
  async getTotalBalanceInCHF(companyName, exchangeRates = {}) {
    try {
      const balances = await this.getBalances(companyName);
      let totalCHF = 0;

      // Default exchange rates if not provided
      const rates = {
        CHF: 1,
        EUR: exchangeRates.EUR || 1.08,
        USD: exchangeRates.USD || 0.92,
        GBP: exchangeRates.GBP || 1.15,
        ...exchangeRates
      };

      for (const [currency, data] of Object.entries(balances)) {
        const rate = rates[currency] || 1;
        totalCHF += data.balance * rate;
      }

      logger.info(`Total balance for ${companyName}: ${totalCHF.toFixed(2)} CHF`);
      return totalCHF;
    } catch (error) {
      logger.error(`Failed to calculate total balance for ${companyName}:`, error);
      throw error;
    }
  }

  /**
   * Sync accounts to Directus
   * @param {string} companyName - Company identifier
   * @param {Object} directusClient - Directus SDK client
   * @returns {Promise<Object>} Sync results
   */
  async syncToDirectus(companyName, directusClient) {
    try {
      const accounts = await this.getAccounts(companyName);
      const results = { created: 0, updated: 0, errors: 0 };

      for (const account of accounts) {
        try {
          // Check if account exists in Directus
          const existing = await directusClient.items('bank_accounts').readByQuery({
            filter: {
              revolut_account_id: { _eq: account.id }
            },
            limit: 1
          });

          const accountData = {
            owner_company: companyName,
            bank_name: 'Revolut',
            account_name: account.name,
            iban: account.iban,
            currency: account.currency,
            balance: account.balance,
            available_balance: account.balance - (account.blocked_amount || 0),
            revolut_account_id: account.id,
            status: account.state === 'active' ? 'active' : 'inactive',
            last_sync: new Date()
          };

          if (existing.data && existing.data.length > 0) {
            // Update existing account
            await directusClient.items('bank_accounts').updateOne(
              existing.data[0].id,
              accountData
            );
            results.updated++;
          } else {
            // Create new account
            await directusClient.items('bank_accounts').createOne(accountData);
            results.created++;
          }
        } catch (error) {
          logger.error(`Failed to sync account ${account.id}:`, error);
          results.errors++;
        }
      }

      logger.info(`Accounts sync completed for ${companyName}:`, results);
      return results;
    } catch (error) {
      logger.error(`Failed to sync accounts for ${companyName}:`, error);
      throw error;
    }
  }

  /**
   * Get all accounts for all companies
   * @returns {Promise<Object>} Accounts grouped by company
   */
  async getAllCompanyAccounts() {
    const companies = ['HYPERVISUAL', 'DAINAMICS', 'LEXAIA', 'ENKI_REALTY', 'TAKEOUT'];
    const allAccounts = {};

    for (const company of companies) {
      try {
        allAccounts[company] = await this.getAccounts(company);
      } catch (error) {
        logger.error(`Failed to get accounts for ${company}:`, error);
        allAccounts[company] = { error: error.message };
      }
    }

    return allAccounts;
  }
}

// Export singleton instance
export const revolutAccounts = new RevolutAccounts();