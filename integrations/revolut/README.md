# Revolut Business API v2 Integration

This integration provides complete synchronization between Revolut Business accounts and Directus Unified Platform.

## 🚀 Features

- **OAuth2 Authentication** with JWT RS256 signing
- **Multi-company support** for 5 independent businesses
- **Real-time transaction sync** via webhooks
- **Multi-currency support** (CHF, EUR, USD, GBP)
- **Automatic reconciliation** with invoices
- **Glassmorphism banking dashboard** with live updates
- **Comprehensive error handling** and logging

## 📋 Prerequisites

- Node.js 18+
- Revolut Business API access
- RSA private keys for each company
- Directus instance running on port 8055

## 🔧 Installation

### 1. Install dependencies

```bash
cd integrations/revolut
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required environment variables:
- `REVOLUT_[COMPANY]_CLIENT_ID` - OAuth client ID for each company
- `REVOLUT_[COMPANY]_PRIVATE_KEY_PATH` - Path to RSA private key
- `REVOLUT_[COMPANY]_WEBHOOK_SECRET` - Webhook signature secret

### 3. Generate RSA keys

For each company, generate an RSA key pair:

```bash
openssl genrsa -out keys/hypervisual-private.pem 2048
openssl rsa -in keys/hypervisual-private.pem -pubout -out keys/hypervisual-public.pem
```

Upload the public key to Revolut Business API settings.

### 4. Update database

Run the SQL migration to add Revolut fields:

```bash
psql -U directus -d directus < update-bank-transactions.sql
```

## 🏃 Running the Integration

### Start webhook server

```bash
npm run dev
```

This starts the webhook receiver on port 3002.

### Start synchronization scheduler

```bash
npm run sync
```

This runs:
- Transaction sync every 5 minutes
- Account balance sync every 30 minutes
- Daily reconciliation at 2 AM

### Run tests

```bash
npm test
```

## 📊 Dashboard Integration

Add the Banking Dashboard to your React app:

```jsx
import BankingDashboard from './components/banking/BankingDashboard';

// In your main dashboard
<BankingDashboard company={selectedCompany} />
```

## 🔄 API Usage

### Authentication

```javascript
import { revolutAuth } from './integrations/revolut/api';

// Get token for a company
const token = await revolutAuth.getTokenForCompany('HYPERVISUAL');
```

### Fetch Accounts

```javascript
import { revolutAccounts } from './integrations/revolut/api';

// Get all accounts for a company
const accounts = await revolutAccounts.getAccounts('DAINAMICS');

// Get total balance in CHF
const totalCHF = await revolutAccounts.getTotalBalanceInCHF('DAINAMICS');
```

### Sync Transactions

```javascript
import { revolutTransactions } from './integrations/revolut/api';

// Sync last 7 days of transactions
await revolutTransactions.syncToDirectus('LEXAIA', directusClient);

// Get daily statistics
const stats = await revolutTransactions.getDailyStats('ENKI_REALTY');
```

## 🪝 Webhook Configuration

Configure webhooks in Revolut Business for each company:

1. **URL**: `https://your-domain.com/webhooks/revolut/[COMPANY]`
2. **Events**:
   - TransactionCreated
   - TransactionStateChanged
   - AccountBalanceChanged
   - PaymentCompleted
3. **Secret**: Use the webhook secret from your `.env`

## 📁 Project Structure

```
integrations/revolut/
├── api/
│   ├── auth.js            # OAuth2 authentication
│   ├── accounts.js        # Account management
│   ├── transactions.js    # Transaction sync
│   ├── webhooks.js        # Webhook server
│   └── index.js          # Main exports
├── sync/
│   ├── scheduler.js       # Cron job scheduler
│   ├── mapper.js         # Data mapping
│   └── reconciliation.js # Invoice matching
├── config/
│   ├── companies.json    # Company configuration
│   └── currencies.json   # Currency settings
├── utils/
│   ├── jwt-handler.js    # JWT utilities
│   ├── error-handler.js  # Error handling
│   └── logger.js        # Winston logger
├── tests/
│   └── revolut.test.js  # Unit tests
├── keys/                # RSA private keys (gitignored)
├── logs/               # Application logs (gitignored)
└── README.md          # This file
```

## 🔐 Security

- Private keys are stored in `keys/` directory (gitignored)
- All webhook signatures are verified
- OAuth tokens are automatically refreshed
- Rate limiting implemented (1000 req/min)
- All sensitive data in environment variables

## 📊 Database Schema

### bank_accounts
- `revolut_account_id` - Unique Revolut account ID
- `currency` - Account currency
- `balance` - Current balance
- `available_balance` - Available balance
- `last_sync` - Last synchronization timestamp

### bank_transactions
- `revolut_transaction_id` - Unique transaction ID
- `revolut_account_id` - Associated account
- `currency` - Transaction currency
- `exchange_rate` - Applied exchange rate
- `merchant_name` - Merchant information
- `fees` - Transaction fees
- `state` - Transaction state
- `balance_after` - Balance after transaction

### revolut_sync_logs
- Tracks all synchronization attempts
- Records success/failure metrics
- Stores error messages for debugging

## 🚨 Troubleshooting

### Authentication fails
- Verify RSA private key format
- Check client ID is correct
- Ensure key permissions are 600

### Webhooks not received
- Check webhook URL is publicly accessible
- Verify webhook secret matches
- Look for signature verification errors in logs

### Sync gaps
- Check `revolut_sync_logs` for errors
- Verify Directus token is valid
- Ensure database permissions are correct

## 📝 License

MIT License - See LICENSE file for details