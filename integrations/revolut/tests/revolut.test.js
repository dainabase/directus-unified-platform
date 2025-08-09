import { jest } from '@jest/globals';
import { revolutAuth } from '../api/auth.js';
import { revolutAccounts } from '../api/accounts.js';
import { revolutTransactions } from '../api/transactions.js';

// Mock environment variables
process.env.REVOLUT_API_URL = 'https://b2b.revolut.com/api/1.0';
process.env.REVOLUT_HYPERVISUAL_CLIENT_ID = 'test_client_id';
process.env.REVOLUT_HYPERVISUAL_PRIVATE_KEY_PATH = './tests/test-private.pem';

// Mock axios
jest.mock('axios');

describe('Revolut Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authentication', () => {
    test('should generate valid JWT', async () => {
      // Mock file system
      jest.spyOn(fs.promises, 'readFile').mockResolvedValue('mock_private_key');
      
      const jwt = await revolutAuth.generateJWT('test_client_id', './test.pem');
      
      expect(jwt).toBeDefined();
      expect(typeof jwt).toBe('string');
      expect(jwt.split('.').length).toBe(3); // JWT has 3 parts
    });

    test('should handle missing private key', async () => {
      jest.spyOn(fs.promises, 'readFile').mockRejectedValue(new Error('File not found'));
      
      await expect(
        revolutAuth.generateJWT('test_client_id', './missing.pem')
      ).rejects.toThrow('Failed to generate JWT');
    });

    test('should cache tokens correctly', async () => {
      const mockToken = {
        access_token: 'test_token',
        expires_in: 3600,
        refresh_token: 'refresh_token'
      };
      
      // Mock successful token exchange
      axios.post.mockResolvedValueOnce({ data: mockToken });
      
      const token1 = await revolutAuth.getTokenForCompany('HYPERVISUAL');
      const token2 = await revolutAuth.getTokenForCompany('HYPERVISUAL');
      
      expect(token1).toBe('test_token');
      expect(token2).toBe('test_token');
      expect(axios.post).toHaveBeenCalledTimes(1); // Should use cache
    });
  });

  describe('Accounts API', () => {
    test('should fetch accounts successfully', async () => {
      const mockAccounts = [
        { id: 'acc_1', currency: 'CHF', balance: 10000 },
        { id: 'acc_2', currency: 'EUR', balance: 5000 }
      ];
      
      axios.create.mockReturnValue({
        get: jest.fn().mockResolvedValue({ data: mockAccounts })
      });
      
      const accounts = await revolutAccounts.getAccounts('HYPERVISUAL');
      
      expect(accounts).toHaveLength(2);
      expect(accounts[0].owner_company).toBe('HYPERVISUAL');
      expect(accounts[0].bank_name).toBe('Revolut');
    });

    test('should calculate total balance in CHF', async () => {
      const mockAccounts = [
        { id: 'acc_1', currency: 'CHF', balance: 10000 },
        { id: 'acc_2', currency: 'EUR', balance: 5000 }
      ];
      
      axios.create.mockReturnValue({
        get: jest.fn().mockResolvedValue({ data: mockAccounts })
      });
      
      const totalCHF = await revolutAccounts.getTotalBalanceInCHF('HYPERVISUAL', {
        EUR: 1.08
      });
      
      expect(totalCHF).toBe(15400); // 10000 + (5000 * 1.08)
    });

    test('should handle API errors gracefully', async () => {
      axios.create.mockReturnValue({
        get: jest.fn().mockRejectedValue(new Error('API Error'))
      });
      
      await expect(
        revolutAccounts.getAccounts('HYPERVISUAL')
      ).rejects.toThrow('API Error');
    });
  });

  describe('Transactions API', () => {
    test('should fetch transactions with default date range', async () => {
      const mockTransactions = [
        { id: 'tx_1', amount: 100, type: 'credit' },
        { id: 'tx_2', amount: -50, type: 'debit' }
      ];
      
      axios.create.mockReturnValue({
        get: jest.fn().mockResolvedValue({ data: mockTransactions })
      });
      
      const transactions = await revolutTransactions.getTransactions('DAINAMICS');
      
      expect(transactions).toHaveLength(2);
      expect(transactions[0].revolut_transaction_id).toBe('tx_1');
    });

    test('should map transaction to Directus format correctly', () => {
      const revolutTx = {
        id: 'tx_123',
        created_at: '2025-08-09T10:00:00Z',
        state: 'completed',
        legs: [{
          amount: 100,
          currency: 'CHF',
          account_id: 'acc_1',
          description: 'Test payment',
          fee: 1.5,
          balance: 10000
        }],
        merchant: {
          name: 'Test Merchant',
          category: 'Services',
          country: 'CH'
        },
        reference: 'INV-001',
        owner_company: 'HYPERVISUAL'
      };
      
      const mapped = revolutTransactions.mapToDirectusFormat(revolutTx);
      
      expect(mapped.amount).toBe(100);
      expect(mapped.type).toBe('credit');
      expect(mapped.merchant_name).toBe('Test Merchant');
      expect(mapped.fees).toBe(1.5);
      expect(mapped.revolut_transaction_id).toBe('tx_123');
    });

    test('should calculate daily statistics', async () => {
      const mockTransactions = [
        { legs: [{ amount: 1000, currency: 'CHF' }], merchant: { category: 'Sales' } },
        { legs: [{ amount: -200, currency: 'CHF' }], merchant: { category: 'Expenses' } },
        { legs: [{ amount: 500, currency: 'EUR' }], merchant: { category: 'Sales' } }
      ];
      
      axios.create.mockReturnValue({
        get: jest.fn().mockResolvedValue({ data: mockTransactions })
      });
      
      const stats = await revolutTransactions.getDailyStats('LEXAIA');
      
      expect(stats.totalTransactions).toBe(3);
      expect(stats.totalIncome).toBe(1500);
      expect(stats.totalExpenses).toBe(200);
      expect(stats.netFlow).toBe(1300);
      expect(stats.byCategory.Sales.count).toBe(2);
    });
  });

  describe('Webhook Signature Verification', () => {
    test('should verify valid webhook signature', () => {
      const payload = JSON.stringify({ event: 'test' });
      const secret = 'webhook_secret';
      const signature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');
      
      const isValid = verifyWebhookSignature(
        Buffer.from(payload),
        signature,
        secret
      );
      
      expect(isValid).toBe(true);
    });

    test('should reject invalid webhook signature', () => {
      const payload = JSON.stringify({ event: 'test' });
      const secret = 'webhook_secret';
      const invalidSignature = 'invalid_signature';
      
      const isValid = verifyWebhookSignature(
        Buffer.from(payload),
        invalidSignature,
        secret
      );
      
      expect(isValid).toBe(false);
    });
  });

  describe('Error Handling', () => {
    test('should handle rate limiting', async () => {
      axios.create.mockReturnValue({
        get: jest.fn().mockRejectedValue({
          response: { status: 429, data: { error: 'Rate limit exceeded' } }
        })
      });
      
      await expect(
        revolutAccounts.getAccounts('HYPERVISUAL')
      ).rejects.toThrow();
    });

    test('should handle network errors', async () => {
      axios.create.mockReturnValue({
        get: jest.fn().mockRejectedValue(new Error('ECONNREFUSED'))
      });
      
      await expect(
        revolutTransactions.getTransactions('TAKEOUT')
      ).rejects.toThrow('ECONNREFUSED');
    });
  });

  describe('Multi-Company Support', () => {
    test('should handle multiple companies independently', async () => {
      const companies = ['HYPERVISUAL', 'DAINAMICS', 'LEXAIA'];
      const results = {};
      
      for (const company of companies) {
        // Each company should have its own configuration
        const clientId = process.env[`REVOLUT_${company}_CLIENT_ID`];
        expect(clientId).toBeDefined();
        
        results[company] = { configured: !!clientId };
      }
      
      expect(Object.keys(results)).toHaveLength(3);
    });
  });
});

// Helper function for webhook tests
function verifyWebhookSignature(payload, signature, secret) {
  const crypto = require('crypto');
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
    return false;
  }
}