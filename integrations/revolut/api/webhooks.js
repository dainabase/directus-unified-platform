import express from 'express';
import crypto from 'crypto';
import { createDirectus, rest, authentication } from '@directus/sdk';
import { revolutTransactions } from './transactions.js';
import { revolutAccounts } from './accounts.js';
import { logger, requestLogger } from '../utils/logger.js';

const app = express();
const PORT = process.env.WEBHOOK_PORT || 3002;

// Middleware
app.use(express.json());
app.use(express.raw({ type: 'application/json' }));
app.use(requestLogger);

// Initialize Directus client
const directusClient = createDirectus(process.env.DIRECTUS_URL || 'http://localhost:8055')
  .with(authentication())
  .with(rest());

// Authenticate with Directus
directusClient.setToken(process.env.DIRECTUS_TOKEN);

/**
 * Verify webhook signature
 * @param {Buffer} payload - Raw request body
 * @param {string} signature - Revolut signature header
 * @param {string} secret - Webhook secret
 * @returns {boolean} Signature validity
 */
function verifyWebhookSignature(payload, signature, secret) {
  try {
    const computedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(computedSignature)
    );
  } catch (error) {
    logger.error('Signature verification error:', error);
    return false;
  }
}

/**
 * Process transaction created event
 * @param {Object} event - Webhook event data
 * @param {string} companyName - Company identifier
 */
async function handleTransactionCreated(event, companyName) {
  try {
    const transaction = event.data;
    logger.info(`Processing new transaction ${transaction.id} for ${companyName}`);

    // Map transaction to Directus format
    const mapped = revolutTransactions.mapToDirectusFormat({
      ...transaction,
      owner_company: companyName
    });

    // Create in Directus
    await directusClient.items('bank_transactions').createOne(mapped);
    
    logger.info(`Transaction ${transaction.id} created in Directus`);
  } catch (error) {
    logger.error(`Failed to process transaction created:`, error);
    throw error;
  }
}

/**
 * Process transaction state changed event
 * @param {Object} event - Webhook event data
 * @param {string} companyName - Company identifier
 */
async function handleTransactionStateChanged(event, companyName) {
  try {
    const transaction = event.data;
    logger.info(`Processing state change for transaction ${transaction.id}`);

    // Find existing transaction
    const existing = await directusClient.items('bank_transactions').readByQuery({
      filter: {
        revolut_transaction_id: { _eq: transaction.id }
      },
      limit: 1
    });

    if (existing.data && existing.data.length > 0) {
      // Update transaction state
      const mapped = revolutTransactions.mapToDirectusFormat({
        ...transaction,
        owner_company: companyName
      });

      await directusClient.items('bank_transactions').updateOne(
        existing.data[0].id,
        {
          state: mapped.state,
          completed_at: mapped.completed_at,
          balance_after: mapped.balance_after,
          updated_at: new Date()
        }
      );

      logger.info(`Transaction ${transaction.id} state updated to ${mapped.state}`);
    } else {
      // Transaction not found, create it
      await handleTransactionCreated(event, companyName);
    }
  } catch (error) {
    logger.error(`Failed to process transaction state change:`, error);
    throw error;
  }
}

/**
 * Process account balance changed event
 * @param {Object} event - Webhook event data
 * @param {string} companyName - Company identifier
 */
async function handleAccountBalanceChanged(event, companyName) {
  try {
    const { account_id, balance, currency } = event.data;
    logger.info(`Processing balance change for account ${account_id}`);

    // Update account balance in Directus
    const existing = await directusClient.items('bank_accounts').readByQuery({
      filter: {
        revolut_account_id: { _eq: account_id }
      },
      limit: 1
    });

    if (existing.data && existing.data.length > 0) {
      await directusClient.items('bank_accounts').updateOne(
        existing.data[0].id,
        {
          balance: balance,
          available_balance: balance,
          last_sync: new Date()
        }
      );

      logger.info(`Account ${account_id} balance updated to ${balance} ${currency}`);
    } else {
      // Fetch full account details and create
      const accountDetails = await revolutAccounts.getAccountDetails(companyName, account_id);
      await revolutAccounts.syncToDirectus(companyName, directusClient);
    }
  } catch (error) {
    logger.error(`Failed to process balance change:`, error);
    throw error;
  }
}

/**
 * Process payment completed event
 * @param {Object} event - Webhook event data
 * @param {string} companyName - Company identifier
 */
async function handlePaymentCompleted(event, companyName) {
  try {
    const payment = event.data;
    logger.info(`Processing completed payment ${payment.id} for ${companyName}`);

    // Payment events might need special handling
    // For now, treat as transaction
    await handleTransactionCreated({
      ...event,
      data: {
        ...payment,
        state: 'completed'
      }
    }, companyName);
  } catch (error) {
    logger.error(`Failed to process payment completed:`, error);
    throw error;
  }
}

/**
 * Main webhook handler for each company
 */
app.post('/webhooks/revolut/:company', async (req, res) => {
  const { company } = req.params;
  const signature = req.headers['x-revolut-signature'];
  const rawBody = req.body;

  try {
    // Validate company
    const validCompanies = ['HYPERVISUAL', 'DAINAMICS', 'LEXAIA', 'ENKI_REALTY', 'TAKEOUT'];
    if (!validCompanies.includes(company)) {
      logger.warn(`Invalid company in webhook URL: ${company}`);
      return res.status(404).json({ error: 'Invalid company' });
    }

    // Get webhook secret for company
    const webhookSecret = process.env[`REVOLUT_${company}_WEBHOOK_SECRET`];
    if (!webhookSecret) {
      logger.error(`No webhook secret configured for ${company}`);
      return res.status(500).json({ error: 'Configuration error' });
    }

    // Verify signature
    if (signature && !verifyWebhookSignature(rawBody, signature, webhookSecret)) {
      logger.warn(`Invalid webhook signature for ${company}`);
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Parse event
    const event = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody;
    logger.info(`Received ${event.event} webhook for ${company}`);

    // Process event based on type
    switch (event.event) {
      case 'TransactionCreated':
        await handleTransactionCreated(event, company);
        break;
      
      case 'TransactionStateChanged':
        await handleTransactionStateChanged(event, company);
        break;
      
      case 'AccountBalanceChanged':
        await handleAccountBalanceChanged(event, company);
        break;
      
      case 'PaymentCompleted':
        await handlePaymentCompleted(event, company);
        break;
      
      default:
        logger.warn(`Unhandled event type: ${event.event}`);
    }

    // Acknowledge webhook
    res.status(200).json({ 
      status: 'ok',
      event: event.event,
      company: company
    });

  } catch (error) {
    logger.error(`Webhook processing error for ${company}:`, error);
    res.status(500).json({ 
      error: 'Processing error',
      message: error.message 
    });
  }
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'revolut-webhook-receiver',
    port: PORT,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

/**
 * Webhook test endpoint (for debugging)
 */
app.post('/webhooks/test', (req, res) => {
  logger.info('Test webhook received:', req.body);
  res.json({ 
    status: 'ok',
    received: req.body
  });
});

/**
 * List configured webhooks
 */
app.get('/webhooks/config', (req, res) => {
  const companies = ['HYPERVISUAL', 'DAINAMICS', 'LEXAIA', 'ENKI_REALTY', 'TAKEOUT'];
  const config = {};

  for (const company of companies) {
    config[company] = {
      url: `${process.env.WEBHOOK_HOST}/webhooks/revolut/${company}`,
      hasSecret: !!process.env[`REVOLUT_${company}_WEBHOOK_SECRET`]
    };
  }

  res.json(config);
});

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 Revolut Webhook Receiver started on port ${PORT}`);
  logger.info('Webhook URLs:');
  
  const companies = ['HYPERVISUAL', 'DAINAMICS', 'LEXAIA', 'ENKI_REALTY', 'TAKEOUT'];
  companies.forEach(company => {
    logger.info(`  - ${company}: http://localhost:${PORT}/webhooks/revolut/${company}`);
  });
  
  logger.info(`Health check: http://localhost:${PORT}/health`);
});