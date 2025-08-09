import cron from 'node-cron';
import { createDirectus, rest, authentication } from '@directus/sdk';
import { revolutAccounts } from '../api/accounts.js';
import { revolutTransactions } from '../api/transactions.js';
import { revolutAuth } from '../api/auth.js';
import { logger } from '../utils/logger.js';
import { subHours, format } from 'date-fns';

/**
 * Revolut Synchronization Scheduler
 * Manages automatic sync jobs for all companies
 */
class SyncScheduler {
  constructor() {
    this.jobs = new Map();
    this.directusClient = null;
    this.companies = ['HYPERVISUAL', 'DAINAMICS', 'LEXAIA', 'ENKI_REALTY', 'TAKEOUT'];
    this.syncInterval = process.env.SYNC_INTERVAL_MINUTES || 5;
    this.reconciliationHour = process.env.RECONCILIATION_HOUR || 2;
  }

  /**
   * Initialize Directus client
   */
  async initializeDirectus() {
    this.directusClient = createDirectus(process.env.DIRECTUS_URL || 'http://localhost:8055')
      .with(authentication())
      .with(rest());
    
    this.directusClient.setToken(process.env.DIRECTUS_TOKEN);
    logger.info('Directus client initialized for sync scheduler');
  }

  /**
   * Start all scheduled jobs
   */
  async start() {
    try {
      await this.initializeDirectus();
      
      // Initialize authentication for all companies
      await revolutAuth.initializeAllCompanies();
      
      // Schedule regular sync jobs
      this.scheduleTransactionSync();
      this.scheduleAccountSync();
      this.scheduleReconciliation();
      
      logger.info('🚀 Sync scheduler started successfully');
      logger.info(`Transaction sync: every ${this.syncInterval} minutes`);
      logger.info(`Account sync: every 30 minutes`);
      logger.info(`Reconciliation: daily at ${this.reconciliationHour}:00`);
    } catch (error) {
      logger.error('Failed to start sync scheduler:', error);
      throw error;
    }
  }

  /**
   * Schedule transaction synchronization
   */
  scheduleTransactionSync() {
    const schedule = `*/${this.syncInterval} * * * *`;
    
    const job = cron.schedule(schedule, async () => {
      logger.info('🔄 Starting scheduled transaction sync');
      const startTime = Date.now();
      
      for (const company of this.companies) {
        try {
          await this.syncCompanyTransactions(company);
        } catch (error) {
          logger.error(`Transaction sync failed for ${company}:`, error);
          await this.logSyncError(company, 'transactions', error);
        }
      }
      
      const duration = Date.now() - startTime;
      logger.info(`✅ Transaction sync completed in ${duration}ms`);
    });
    
    this.jobs.set('transaction-sync', job);
  }

  /**
   * Schedule account balance synchronization
   */
  scheduleAccountSync() {
    // Every 30 minutes
    const job = cron.schedule('*/30 * * * *', async () => {
      logger.info('🔄 Starting scheduled account sync');
      const startTime = Date.now();
      
      for (const company of this.companies) {
        try {
          await this.syncCompanyAccounts(company);
        } catch (error) {
          logger.error(`Account sync failed for ${company}:`, error);
          await this.logSyncError(company, 'accounts', error);
        }
      }
      
      const duration = Date.now() - startTime;
      logger.info(`✅ Account sync completed in ${duration}ms`);
    });
    
    this.jobs.set('account-sync', job);
  }

  /**
   * Schedule daily reconciliation
   */
  scheduleReconciliation() {
    const schedule = `0 ${this.reconciliationHour} * * *`;
    
    const job = cron.schedule(schedule, async () => {
      logger.info('🔄 Starting daily reconciliation');
      const startTime = Date.now();
      
      try {
        await this.performReconciliation();
      } catch (error) {
        logger.error('Reconciliation failed:', error);
      }
      
      const duration = Date.now() - startTime;
      logger.info(`✅ Reconciliation completed in ${duration}ms`);
    });
    
    this.jobs.set('reconciliation', job);
  }

  /**
   * Sync transactions for a specific company
   */
  async syncCompanyTransactions(company) {
    const syncLog = await this.createSyncLog(company, 'transactions');
    
    try {
      // Sync last 3 hours of transactions to catch any delays
      const fromDate = subHours(new Date(), 3);
      const result = await revolutTransactions.syncToDirectus(
        company, 
        this.directusClient,
        fromDate
      );
      
      await this.updateSyncLog(syncLog.id, 'completed', result);
      logger.info(`Transaction sync for ${company}:`, result);
    } catch (error) {
      await this.updateSyncLog(syncLog.id, 'failed', null, error);
      throw error;
    }
  }

  /**
   * Sync accounts and balances for a specific company
   */
  async syncCompanyAccounts(company) {
    const syncLog = await this.createSyncLog(company, 'accounts');
    
    try {
      const result = await revolutAccounts.syncToDirectus(
        company,
        this.directusClient
      );
      
      await this.updateSyncLog(syncLog.id, 'completed', result);
      logger.info(`Account sync for ${company}:`, result);
    } catch (error) {
      await this.updateSyncLog(syncLog.id, 'failed', null, error);
      throw error;
    }
  }

  /**
   * Perform daily reconciliation
   */
  async performReconciliation() {
    const results = {
      matched: 0,
      unmatched: 0,
      errors: 0
    };

    for (const company of this.companies) {
      try {
        // Get unreconciled transactions
        const transactions = await this.directusClient.items('bank_transactions').readByQuery({
          filter: {
            owner_company: { _eq: company },
            reconciled: { _eq: false },
            state: { _eq: 'completed' }
          },
          limit: -1
        });

        // Get unpaid invoices
        const invoices = await this.directusClient.items('client_invoices').readByQuery({
          filter: {
            owner_company: { _eq: company },
            status: { _neq: 'paid' }
          },
          limit: -1
        });

        // Attempt to match transactions with invoices
        for (const transaction of transactions.data) {
          const match = await this.findMatchingInvoice(transaction, invoices.data);
          
          if (match) {
            // Update both transaction and invoice
            await this.reconcileTransaction(transaction, match);
            results.matched++;
          } else {
            results.unmatched++;
          }
        }
      } catch (error) {
        logger.error(`Reconciliation error for ${company}:`, error);
        results.errors++;
      }
    }

    logger.info('Reconciliation results:', results);
  }

  /**
   * Find matching invoice for a transaction
   */
  async findMatchingInvoice(transaction, invoices) {
    // Try exact amount match first
    let match = invoices.find(invoice => 
      Math.abs(invoice.amount - transaction.amount) < 0.01
    );

    if (!match) {
      // Try reference matching
      const reference = transaction.reference?.toLowerCase() || '';
      match = invoices.find(invoice => 
        reference.includes(invoice.invoice_number.toLowerCase()) ||
        reference.includes(invoice.client_name.toLowerCase())
      );
    }

    return match;
  }

  /**
   * Reconcile a transaction with an invoice
   */
  async reconcileTransaction(transaction, invoice) {
    try {
      // Update transaction
      await this.directusClient.items('bank_transactions').updateOne(transaction.id, {
        reconciled: true,
        invoice_id: invoice.id,
        updated_at: new Date()
      });

      // Update invoice
      await this.directusClient.items('client_invoices').updateOne(invoice.id, {
        status: 'paid',
        payment_date: transaction.date,
        payment_reference: transaction.revolut_transaction_id
      });

      logger.info(`Reconciled transaction ${transaction.id} with invoice ${invoice.invoice_number}`);
    } catch (error) {
      logger.error('Reconciliation update failed:', error);
      throw error;
    }
  }

  /**
   * Create sync log entry
   */
  async createSyncLog(company, syncType) {
    try {
      const log = await this.directusClient.items('revolut_sync_logs').createOne({
        owner_company: company,
        sync_type: syncType,
        sync_status: 'started',
        started_at: new Date()
      });
      
      return log;
    } catch (error) {
      logger.error('Failed to create sync log:', error);
      return { id: null };
    }
  }

  /**
   * Update sync log entry
   */
  async updateSyncLog(logId, status, result = null, error = null) {
    if (!logId) return;

    try {
      const update = {
        sync_status: status,
        completed_at: new Date()
      };

      if (result) {
        update.records_synced = result.synced || 0;
        update.records_failed = result.errors || 0;
        update.metadata = result;
      }

      if (error) {
        update.error_message = error.message;
      }

      await this.directusClient.items('revolut_sync_logs').updateOne(logId, update);
    } catch (err) {
      logger.error('Failed to update sync log:', err);
    }
  }

  /**
   * Log sync error
   */
  async logSyncError(company, syncType, error) {
    try {
      await this.directusClient.items('revolut_sync_logs').createOne({
        owner_company: company,
        sync_type: syncType,
        sync_status: 'failed',
        error_message: error.message,
        started_at: new Date(),
        completed_at: new Date()
      });
    } catch (err) {
      logger.error('Failed to log sync error:', err);
    }
  }

  /**
   * Stop all scheduled jobs
   */
  stop() {
    this.jobs.forEach((job, name) => {
      job.stop();
      logger.info(`Stopped job: ${name}`);
    });
    
    this.jobs.clear();
    revolutAuth.clearAll();
    logger.info('🛑 Sync scheduler stopped');
  }

  /**
   * Get job status
   */
  getStatus() {
    const status = {};
    
    this.jobs.forEach((job, name) => {
      status[name] = {
        running: job.running !== undefined ? job.running : true,
        nextRun: job.nextDates ? job.nextDates(1)[0] : null
      };
    });
    
    return status;
  }
}

// Create and start scheduler if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const scheduler = new SyncScheduler();
  
  // Start scheduler
  scheduler.start().catch(error => {
    logger.error('Failed to start scheduler:', error);
    process.exit(1);
  });

  // Graceful shutdown
  process.on('SIGINT', () => {
    logger.info('Received SIGINT, shutting down gracefully...');
    scheduler.stop();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    logger.info('Received SIGTERM, shutting down gracefully...');
    scheduler.stop();
    process.exit(0);
  });
}

export default SyncScheduler;