import axios from 'axios';
import { revolutAuth } from './auth.js';
import { logger } from '../utils/logger.js';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

/**
 * Revolut Transactions API
 * Handles transaction fetching and synchronization
 */
class RevolutTransactions {
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
   * Get transactions for a specific period
   * @param {string} companyName - Company identifier
   * @param {Object} options - Query options
   * @returns {Promise<Array>} List of transactions
   */
  async getTransactions(companyName, options = {}) {
    try {
      const client = await this.createClient(companyName);
      
      // Default to last 30 days if no dates provided
      const params = {
        from: options.from || format(subDays(new Date(), 30), 'yyyy-MM-dd'),
        to: options.to || format(new Date(), 'yyyy-MM-dd'),
        count: options.count || 1000,
        ...options
      };

      const response = await client.get('/transactions', { params });
      
      const transactions = response.data.map(tx => ({
        ...tx,
        owner_company: companyName,
        revolut_transaction_id: tx.id
      }));

      logger.info(`Retrieved ${transactions.length} transactions for ${companyName}`);
      return transactions;
    } catch (error) {
      logger.error(`Failed to get transactions for ${companyName}:`, error.response?.data || error);
      throw error;
    }
  }

  /**
   * Get transaction details
   * @param {string} companyName - Company identifier
   * @param {string} transactionId - Transaction ID
   * @returns {Promise<Object>} Transaction details
   */
  async getTransactionDetails(companyName, transactionId) {
    try {
      const client = await this.createClient(companyName);
      const response = await client.get(`/transaction/${transactionId}`);
      
      return {
        ...response.data,
        owner_company: companyName,
        revolut_transaction_id: response.data.id
      };
    } catch (error) {
      logger.error(`Failed to get transaction ${transactionId}:`, error);
      throw error;
    }
  }

  /**
   * Map Revolut transaction to Directus format
   * @param {Object} revolutTx - Revolut transaction
   * @returns {Object} Directus-formatted transaction
   */
  mapToDirectusFormat(revolutTx) {
    const { legs = [] } = revolutTx;
    const primaryLeg = legs[0] || {};
    
    return {
      // Existing Directus fields
      owner_company: revolutTx.owner_company,
      date: revolutTx.created_at || revolutTx.completed_at,
      description: primaryLeg.description || revolutTx.reference || 'Revolut Transaction',
      amount: primaryLeg.amount || 0,
      type: primaryLeg.amount >= 0 ? 'credit' : 'debit',
      category: revolutTx.merchant?.category || 'Other',
      
      // New Revolut-specific fields
      revolut_transaction_id: revolutTx.id,
      revolut_account_id: primaryLeg.account_id,
      currency: primaryLeg.currency || 'CHF',
      exchange_rate: revolutTx.rate || 1,
      merchant_name: revolutTx.merchant?.name,
      merchant_category: revolutTx.merchant?.category,
      merchant_country: revolutTx.merchant?.country,
      fees: primaryLeg.fee || 0,
      balance_after: primaryLeg.balance || null,
      state: revolutTx.state,
      reference: revolutTx.reference,
      
      // Additional metadata
      created_at: revolutTx.created_at,
      completed_at: revolutTx.completed_at,
      updated_at: revolutTx.updated_at
    };
  }

  /**
   * Sync transactions to Directus
   * @param {string} companyName - Company identifier
   * @param {Object} directusClient - Directus SDK client
   * @param {Date} fromDate - Start date for sync
   * @returns {Promise<Object>} Sync results
   */
  async syncToDirectus(companyName, directusClient, fromDate = null) {
    try {
      // Default to last 7 days if no date provided
      const from = fromDate || subDays(new Date(), 7);
      
      const transactions = await this.getTransactions(companyName, {
        from: format(from, 'yyyy-MM-dd'),
        to: format(new Date(), 'yyyy-MM-dd')
      });

      const results = { 
        synced: 0, 
        skipped: 0, 
        errors: 0,
        totalAmount: 0 
      };

      for (const tx of transactions) {
        try {
          // Check if transaction already exists
          const existing = await directusClient.items('bank_transactions').readByQuery({
            filter: {
              revolut_transaction_id: { _eq: tx.id }
            },
            limit: 1
          });

          if (existing.data && existing.data.length > 0) {
            // Update if state changed
            if (existing.data[0].state !== tx.state) {
              const mapped = this.mapToDirectusFormat(tx);
              await directusClient.items('bank_transactions').updateOne(
                existing.data[0].id,
                mapped
              );
              results.synced++;
            } else {
              results.skipped++;
            }
          } else {
            // Create new transaction
            const mapped = this.mapToDirectusFormat(tx);
            await directusClient.items('bank_transactions').createOne(mapped);
            results.synced++;
            results.totalAmount += Math.abs(mapped.amount);
          }
        } catch (error) {
          logger.error(`Failed to sync transaction ${tx.id}:`, error);
          results.errors++;
        }
      }

      logger.info(`Transaction sync completed for ${companyName}:`, results);
      return results;
    } catch (error) {
      logger.error(`Failed to sync transactions for ${companyName}:`, error);
      throw error;
    }
  }

  /**
   * Get transactions by type
   * @param {string} companyName - Company identifier
   * @param {string} type - Transaction type (card_payment, transfer, etc.)
   * @param {Object} options - Additional options
   * @returns {Promise<Array>} Filtered transactions
   */
  async getTransactionsByType(companyName, type, options = {}) {
    try {
      const transactions = await this.getTransactions(companyName, {
        ...options,
        type
      });

      return transactions;
    } catch (error) {
      logger.error(`Failed to get ${type} transactions for ${companyName}:`, error);
      throw error;
    }
  }

  /**
   * Get pending transactions
   * @param {string} companyName - Company identifier
   * @returns {Promise<Array>} Pending transactions
   */
  async getPendingTransactions(companyName) {
    try {
      const transactions = await this.getTransactions(companyName, {
        from: format(subDays(new Date(), 7), 'yyyy-MM-dd')
      });

      return transactions.filter(tx => tx.state === 'pending');
    } catch (error) {
      logger.error(`Failed to get pending transactions for ${companyName}:`, error);
      throw error;
    }
  }

  /**
   * Calculate daily statistics
   * @param {string} companyName - Company identifier
   * @param {Date} date - Date for statistics
   * @returns {Promise<Object>} Daily statistics
   */
  async getDailyStats(companyName, date = new Date()) {
    try {
      const transactions = await this.getTransactions(companyName, {
        from: format(startOfDay(date), 'yyyy-MM-dd'),
        to: format(endOfDay(date), 'yyyy-MM-dd')
      });

      const stats = {
        date: format(date, 'yyyy-MM-dd'),
        totalTransactions: transactions.length,
        totalIncome: 0,
        totalExpenses: 0,
        netFlow: 0,
        byCategory: {},
        byCurrency: {}
      };

      for (const tx of transactions) {
        const amount = tx.legs?.[0]?.amount || 0;
        const currency = tx.legs?.[0]?.currency || 'CHF';
        const category = tx.merchant?.category || 'Other';

        if (amount > 0) {
          stats.totalIncome += amount;
        } else {
          stats.totalExpenses += Math.abs(amount);
        }

        // Group by category
        if (!stats.byCategory[category]) {
          stats.byCategory[category] = { count: 0, amount: 0 };
        }
        stats.byCategory[category].count++;
        stats.byCategory[category].amount += amount;

        // Group by currency
        if (!stats.byCurrency[currency]) {
          stats.byCurrency[currency] = { count: 0, amount: 0 };
        }
        stats.byCurrency[currency].count++;
        stats.byCurrency[currency].amount += amount;
      }

      stats.netFlow = stats.totalIncome - stats.totalExpenses;

      logger.info(`Daily stats for ${companyName} on ${format(date, 'yyyy-MM-dd')}:`, stats);
      return stats;
    } catch (error) {
      logger.error(`Failed to calculate daily stats for ${companyName}:`, error);
      throw error;
    }
  }

  /**
   * Sync all companies transactions
   * @param {Object} directusClient - Directus SDK client
   * @returns {Promise<Object>} Sync results by company
   */
  async syncAllCompanies(directusClient) {
    const companies = ['HYPERVISUAL', 'DAINAMICS', 'LEXAIA', 'ENKI_REALTY', 'TAKEOUT'];
    const results = {};

    for (const company of companies) {
      try {
        results[company] = await this.syncToDirectus(company, directusClient);
      } catch (error) {
        logger.error(`Failed to sync ${company}:`, error);
        results[company] = { error: error.message };
      }
    }

    return results;
  }
}

// Export singleton instance
export const revolutTransactions = new RevolutTransactions();