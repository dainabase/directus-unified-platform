-- =====================================================
-- MIGRATION FINANCE RELATIONS FIX - CORRECTED
-- Date: 2024-12-13
-- Objectif: Corriger toutes les relations module Finance
-- =====================================================

BEGIN;

-- =====================================================
-- TÂCHE 1 : Créer les Bank Accounts (15 comptes)
-- =====================================================

-- Vider la table bank_accounts d'abord
DELETE FROM bank_accounts;

-- Insérer les 15 comptes bancaires (3 devises × 5 entreprises)
-- Note: on utilise owner_company en STRING temporairement
INSERT INTO bank_accounts (owner_company, account_name, currency, bank_name, status) VALUES
-- HYPERVISUAL
('HYPERVISUAL', 'HYPERVISUAL - CHF', 'CHF', 'Revolut', 'active'),
('HYPERVISUAL', 'HYPERVISUAL - EUR', 'EUR', 'Revolut', 'active'),
('HYPERVISUAL', 'HYPERVISUAL - USD', 'USD', 'Revolut', 'active'),
-- DAINAMICS
('DAINAMICS', 'DAINAMICS - CHF', 'CHF', 'Revolut', 'active'),
('DAINAMICS', 'DAINAMICS - EUR', 'EUR', 'Revolut', 'active'),
('DAINAMICS', 'DAINAMICS - USD', 'USD', 'Revolut', 'active'),
-- LEXAIA
('LEXAIA', 'LEXAIA - CHF', 'CHF', 'Revolut', 'active'),
('LEXAIA', 'LEXAIA - EUR', 'EUR', 'Revolut', 'active'),
('LEXAIA', 'LEXAIA - USD', 'USD', 'Revolut', 'active'),
-- ENKI REALTY
('ENKI_REALTY', 'ENKI REALTY - CHF', 'CHF', 'Revolut', 'active'),
('ENKI_REALTY', 'ENKI REALTY - EUR', 'EUR', 'Revolut', 'active'),
('ENKI_REALTY', 'ENKI REALTY - USD', 'USD', 'Revolut', 'active'),
-- TAKEOUT
('TAKEOUT', 'TAKEOUT - CHF', 'CHF', 'Revolut', 'active'),
('TAKEOUT', 'TAKEOUT - EUR', 'EUR', 'Revolut', 'active'),
('TAKEOUT', 'TAKEOUT - USD', 'USD', 'Revolut', 'active');

-- =====================================================
-- TÂCHE 2 : Convertir owner_company STRING → FK
-- =====================================================

-- 2.1 CLIENT_INVOICES
DO $$
BEGIN
    -- Ajouter la colonne si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'client_invoices' AND column_name = 'owner_company_id') THEN
        ALTER TABLE client_invoices ADD COLUMN owner_company_id UUID;
    END IF;
    
    -- Migrer les données
    UPDATE client_invoices ci
    SET owner_company_id = oc.id
    FROM owner_companies oc
    WHERE ci.owner_company = oc.code;
    
    -- Ajouter contrainte FK si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'client_invoices_owner_company_id_fkey') THEN
        ALTER TABLE client_invoices
        ADD CONSTRAINT client_invoices_owner_company_id_fkey 
        FOREIGN KEY (owner_company_id) REFERENCES owner_companies(id) ON DELETE SET NULL;
    END IF;
    
    -- Créer index
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_client_invoices_owner_company_id') THEN
        CREATE INDEX idx_client_invoices_owner_company_id ON client_invoices(owner_company_id);
    END IF;
END $$;

-- 2.2 SUPPLIER_INVOICES
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'supplier_invoices' AND column_name = 'owner_company_id') THEN
        ALTER TABLE supplier_invoices ADD COLUMN owner_company_id UUID;
    END IF;
    
    UPDATE supplier_invoices si
    SET owner_company_id = oc.id
    FROM owner_companies oc
    WHERE si.owner_company = oc.code;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'supplier_invoices_owner_company_id_fkey') THEN
        ALTER TABLE supplier_invoices
        ADD CONSTRAINT supplier_invoices_owner_company_id_fkey 
        FOREIGN KEY (owner_company_id) REFERENCES owner_companies(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_supplier_invoices_owner_company_id') THEN
        CREATE INDEX idx_supplier_invoices_owner_company_id ON supplier_invoices(owner_company_id);
    END IF;
END $$;

-- 2.3 PAYMENTS
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'payments' AND column_name = 'owner_company_id') THEN
        ALTER TABLE payments ADD COLUMN owner_company_id UUID;
    END IF;
    
    UPDATE payments p
    SET owner_company_id = oc.id
    FROM owner_companies oc
    WHERE p.owner_company = oc.code;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'payments_owner_company_id_fkey') THEN
        ALTER TABLE payments
        ADD CONSTRAINT payments_owner_company_id_fkey 
        FOREIGN KEY (owner_company_id) REFERENCES owner_companies(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_payments_owner_company_id') THEN
        CREATE INDEX idx_payments_owner_company_id ON payments(owner_company_id);
    END IF;
END $$;

-- 2.4 BANK_TRANSACTIONS
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'bank_transactions' AND column_name = 'owner_company_id') THEN
        ALTER TABLE bank_transactions ADD COLUMN owner_company_id UUID;
    END IF;
    
    UPDATE bank_transactions bt
    SET owner_company_id = oc.id
    FROM owner_companies oc
    WHERE bt.owner_company = oc.code;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'bank_transactions_owner_company_id_fkey') THEN
        ALTER TABLE bank_transactions
        ADD CONSTRAINT bank_transactions_owner_company_id_fkey 
        FOREIGN KEY (owner_company_id) REFERENCES owner_companies(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_bank_transactions_owner_company_id') THEN
        CREATE INDEX idx_bank_transactions_owner_company_id ON bank_transactions(owner_company_id);
    END IF;
END $$;

-- 2.5 BANK_ACCOUNTS (convertir son propre owner_company)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'bank_accounts' AND column_name = 'owner_company_id') THEN
        ALTER TABLE bank_accounts ADD COLUMN owner_company_id UUID;
    END IF;
    
    UPDATE bank_accounts ba
    SET owner_company_id = oc.id
    FROM owner_companies oc
    WHERE ba.owner_company = oc.code;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'bank_accounts_owner_company_id_fkey') THEN
        ALTER TABLE bank_accounts
        ADD CONSTRAINT bank_accounts_owner_company_id_fkey 
        FOREIGN KEY (owner_company_id) REFERENCES owner_companies(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_bank_accounts_owner_company_id') THEN
        CREATE INDEX idx_bank_accounts_owner_company_id ON bank_accounts(owner_company_id);
    END IF;
END $$;

-- 2.6 EXPENSES
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'expenses' AND column_name = 'owner_company_id') THEN
        ALTER TABLE expenses ADD COLUMN owner_company_id UUID;
    END IF;
    
    UPDATE expenses e
    SET owner_company_id = oc.id
    FROM owner_companies oc
    WHERE e.owner_company = oc.code;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'expenses_owner_company_id_fkey') THEN
        ALTER TABLE expenses
        ADD CONSTRAINT expenses_owner_company_id_fkey 
        FOREIGN KEY (owner_company_id) REFERENCES owner_companies(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_expenses_owner_company_id') THEN
        CREATE INDEX idx_expenses_owner_company_id ON expenses(owner_company_id);
    END IF;
END $$;

-- 2.7 BUDGETS
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'budgets' AND column_name = 'owner_company_id') THEN
        ALTER TABLE budgets ADD COLUMN owner_company_id UUID;
    END IF;
    
    UPDATE budgets b
    SET owner_company_id = oc.id
    FROM owner_companies oc
    WHERE b.owner_company = oc.code;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'budgets_owner_company_id_fkey') THEN
        ALTER TABLE budgets
        ADD CONSTRAINT budgets_owner_company_id_fkey 
        FOREIGN KEY (owner_company_id) REFERENCES owner_companies(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_budgets_owner_company_id') THEN
        CREATE INDEX idx_budgets_owner_company_id ON budgets(owner_company_id);
    END IF;
END $$;

-- =====================================================
-- TÂCHE 3 : Ajouter les Relations Manquantes
-- =====================================================

-- 3.1 payments → bank_transactions (réconciliation)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'payments' AND column_name = 'bank_transaction_id') THEN
        ALTER TABLE payments
        ADD COLUMN bank_transaction_id UUID REFERENCES bank_transactions(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_payments_bank_transaction') THEN
        CREATE INDEX idx_payments_bank_transaction ON payments(bank_transaction_id);
    END IF;
END $$;

-- 3.2 bank_transactions → bank_accounts (vérifier FK account_id)
DO $$
BEGIN
    -- Modifier account_id pour être une vraie FK si pas déjà fait
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'bank_transactions_account_id_fkey') THEN
        -- On suppose que account_id existe déjà comme colonne
        ALTER TABLE bank_transactions
        ADD CONSTRAINT bank_transactions_account_id_fkey
        FOREIGN KEY (account_id) REFERENCES bank_accounts(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_bank_transactions_account_2') THEN
        CREATE INDEX idx_bank_transactions_account_2 ON bank_transactions(account_id);
    END IF;
END $$;

-- 3.3 bank_transactions → supplier_invoices
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'bank_transactions' AND column_name = 'supplier_invoice_id') THEN
        ALTER TABLE bank_transactions
        ADD COLUMN supplier_invoice_id UUID REFERENCES supplier_invoices(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_bank_transactions_supplier_invoice') THEN
        CREATE INDEX idx_bank_transactions_supplier_invoice ON bank_transactions(supplier_invoice_id);
    END IF;
END $$;

-- 3.4 bank_transactions → payments (lien inverse)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'bank_transactions' AND column_name = 'payment_id') THEN
        ALTER TABLE bank_transactions
        ADD COLUMN payment_id UUID REFERENCES payments(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_bank_transactions_payment') THEN
        CREATE INDEX idx_bank_transactions_payment ON bank_transactions(payment_id);
    END IF;
END $$;

-- 3.5 expenses → supplier_invoices
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'expenses' AND column_name = 'supplier_invoice_id') THEN
        ALTER TABLE expenses
        ADD COLUMN supplier_invoice_id UUID REFERENCES supplier_invoices(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_expenses_supplier_invoice') THEN
        CREATE INDEX idx_expenses_supplier_invoice ON expenses(supplier_invoice_id);
    END IF;
END $$;

-- 3.6 expenses → bank_transactions
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'expenses' AND column_name = 'bank_transaction_id') THEN
        ALTER TABLE expenses
        ADD COLUMN bank_transaction_id UUID REFERENCES bank_transactions(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_expenses_bank_transaction') THEN
        CREATE INDEX idx_expenses_bank_transaction ON expenses(bank_transaction_id);
    END IF;
END $$;

-- 3.7 reconciliations - Structure complète
CREATE TABLE IF NOT EXISTS reconciliations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status VARCHAR(50) DEFAULT 'pending',
    reconciliation_date DATE,
    amount DECIMAL(15,2),
    currency VARCHAR(3) DEFAULT 'CHF',
    notes TEXT,
    
    -- Relations
    bank_transaction_id UUID REFERENCES bank_transactions(id),
    client_invoice_id UUID REFERENCES client_invoices(id),
    supplier_invoice_id UUID REFERENCES supplier_invoices(id),
    payment_id UUID REFERENCES payments(id),
    expense_id UUID REFERENCES expenses(id),
    owner_company_id UUID REFERENCES owner_companies(id),
    
    -- Métadonnées
    reconciled_by UUID REFERENCES directus_users(id),
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour reconciliations
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_reconciliations_bank_transaction') THEN
        CREATE INDEX idx_reconciliations_bank_transaction ON reconciliations(bank_transaction_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_reconciliations_owner_company') THEN
        CREATE INDEX idx_reconciliations_owner_company ON reconciliations(owner_company_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_reconciliations_status') THEN
        CREATE INDEX idx_reconciliations_status ON reconciliations(status);
    END IF;
END $$;

-- =====================================================
-- VALIDATION
-- =====================================================

-- Vérifier que les comptes ont été créés
DO $$
DECLARE
    compte_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO compte_count FROM bank_accounts;
    IF compte_count != 15 THEN
        RAISE EXCEPTION 'Erreur: % comptes bancaires créés au lieu de 15', compte_count;
    END IF;
    RAISE NOTICE 'SUCCÈS: 15 comptes bancaires créés correctement';
END $$;

COMMIT;

-- Afficher un résumé
SELECT 
    'bank_accounts' as table_name,
    COUNT(*) as total_records,
    COUNT(owner_company_id) as with_fk
FROM bank_accounts
UNION ALL
SELECT 
    'owner_companies',
    COUNT(*),
    COUNT(id)
FROM owner_companies
ORDER BY table_name;