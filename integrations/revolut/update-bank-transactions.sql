-- Update bank_transactions table with Revolut-specific fields
-- This script adds new columns for Revolut integration

-- Add Revolut-specific columns to bank_transactions
ALTER TABLE bank_transactions 
ADD COLUMN IF NOT EXISTS revolut_transaction_id VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS revolut_account_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'CHF',
ADD COLUMN IF NOT EXISTS exchange_rate DECIMAL(10,6) DEFAULT 1.0,
ADD COLUMN IF NOT EXISTS merchant_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS merchant_category VARCHAR(100),
ADD COLUMN IF NOT EXISTS merchant_country VARCHAR(2),
ADD COLUMN IF NOT EXISTS fees DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS balance_after DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS state VARCHAR(50),
ADD COLUMN IF NOT EXISTS reference VARCHAR(255),
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_revolut_transaction_id ON bank_transactions(revolut_transaction_id);
CREATE INDEX IF NOT EXISTS idx_revolut_account_id ON bank_transactions(revolut_account_id);
CREATE INDEX IF NOT EXISTS idx_transaction_state ON bank_transactions(state);
CREATE INDEX IF NOT EXISTS idx_merchant_category ON bank_transactions(merchant_category);

-- Create bank_accounts table for account management
CREATE TABLE IF NOT EXISTS bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_company VARCHAR(50) NOT NULL,
  bank_name VARCHAR(100) DEFAULT 'Revolut',
  account_name VARCHAR(255),
  account_number VARCHAR(50),
  iban VARCHAR(50),
  currency VARCHAR(3) NOT NULL,
  balance DECIMAL(15,2) DEFAULT 0,
  available_balance DECIMAL(15,2) DEFAULT 0,
  revolut_account_id VARCHAR(255) UNIQUE,
  status VARCHAR(50) DEFAULT 'active',
  last_sync TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for bank_accounts
CREATE INDEX IF NOT EXISTS idx_bank_accounts_company ON bank_accounts(owner_company);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_currency ON bank_accounts(currency);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_revolut_id ON bank_accounts(revolut_account_id);

-- Create sync_logs table for tracking synchronization
CREATE TABLE IF NOT EXISTS revolut_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_company VARCHAR(50) NOT NULL,
  sync_type VARCHAR(50) NOT NULL, -- 'accounts', 'transactions', 'balances'
  sync_status VARCHAR(50) NOT NULL, -- 'started', 'completed', 'failed'
  records_synced INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  metadata JSONB
);

-- Create index for sync logs
CREATE INDEX IF NOT EXISTS idx_sync_logs_company ON revolut_sync_logs(owner_company);
CREATE INDEX IF NOT EXISTS idx_sync_logs_status ON revolut_sync_logs(sync_status);
CREATE INDEX IF NOT EXISTS idx_sync_logs_started ON revolut_sync_logs(started_at);

-- Create exchange_rates table for multi-currency support
CREATE TABLE IF NOT EXISTS exchange_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_currency VARCHAR(3) NOT NULL,
  to_currency VARCHAR(3) NOT NULL,
  rate DECIMAL(10,6) NOT NULL,
  source VARCHAR(50) DEFAULT 'revolut',
  valid_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  valid_to TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(from_currency, to_currency, valid_from)
);

-- Create index for exchange rates
CREATE INDEX IF NOT EXISTS idx_exchange_rates_currencies ON exchange_rates(from_currency, to_currency);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_valid ON exchange_rates(valid_from, valid_to);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to bank_transactions
DROP TRIGGER IF EXISTS update_bank_transactions_updated_at ON bank_transactions;
CREATE TRIGGER update_bank_transactions_updated_at 
BEFORE UPDATE ON bank_transactions 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to bank_accounts
DROP TRIGGER IF EXISTS update_bank_accounts_updated_at ON bank_accounts;
CREATE TRIGGER update_bank_accounts_updated_at 
BEFORE UPDATE ON bank_accounts 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions to directus user
GRANT ALL PRIVILEGES ON TABLE bank_accounts TO directus;
GRANT ALL PRIVILEGES ON TABLE revolut_sync_logs TO directus;
GRANT ALL PRIVILEGES ON TABLE exchange_rates TO directus;

-- Insert sample exchange rates
INSERT INTO exchange_rates (from_currency, to_currency, rate, source) VALUES
('EUR', 'CHF', 1.08, 'revolut'),
('USD', 'CHF', 0.92, 'revolut'),
('GBP', 'CHF', 1.15, 'revolut'),
('CHF', 'EUR', 0.926, 'revolut'),
('CHF', 'USD', 1.087, 'revolut'),
('CHF', 'GBP', 0.870, 'revolut')
ON CONFLICT (from_currency, to_currency, valid_from) DO NOTHING;

-- Add comment to tables
COMMENT ON TABLE bank_accounts IS 'Revolut bank accounts for each company';
COMMENT ON TABLE revolut_sync_logs IS 'Synchronization logs for Revolut integration';
COMMENT ON TABLE exchange_rates IS 'Currency exchange rates for multi-currency support';

-- Verify changes
SELECT 
    column_name, 
    data_type, 
    is_nullable 
FROM information_schema.columns 
WHERE table_name = 'bank_transactions' 
AND column_name LIKE 'revolut%' OR column_name IN ('currency', 'exchange_rate', 'merchant_name', 'fees', 'state')
ORDER BY ordinal_position;