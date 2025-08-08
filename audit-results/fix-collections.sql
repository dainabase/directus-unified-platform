-- Script SQL de correction pour les collections Directus
-- Généré le 08/08/2025 20:02:51

-- 1. AJOUTER LE CHAMP owner_company AUX COLLECTIONS MANQUANTES
DO $$
DECLARE
    tbl RECORD;
BEGIN
    FOR tbl IN
        SELECT unnest(ARRAY[
            'owner_companies'
        ]) AS table_name
    LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = tbl.table_name) THEN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = tbl.table_name AND column_name = 'owner_company'
            ) THEN
                EXECUTE format('ALTER TABLE %I ADD COLUMN owner_company VARCHAR(50) DEFAULT ''HYPERVISUAL''', tbl.table_name);
                RAISE NOTICE 'Added owner_company to %', tbl.table_name;
            END IF;
        END IF;
    END LOOP;
END $$;

-- 2. METTRE À JOUR LES ENREGISTREMENTS SANS owner_company
UPDATE budgets SET owner_company = 'HYPERVISUAL' WHERE owner_company IS NULL; -- 53 enregistrements

-- 3. CRÉER DES INDEX POUR OPTIMISER LES PERFORMANCES
CREATE INDEX IF NOT EXISTS idx_accounting_entries_owner_company ON accounting_entries(owner_company);
CREATE INDEX IF NOT EXISTS idx_activities_owner_company ON activities(owner_company);
CREATE INDEX IF NOT EXISTS idx_approvals_owner_company ON approvals(owner_company);
CREATE INDEX IF NOT EXISTS idx_audit_logs_owner_company ON audit_logs(owner_company);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_owner_company ON bank_transactions(owner_company);
CREATE INDEX IF NOT EXISTS idx_budgets_owner_company ON budgets(owner_company);
CREATE INDEX IF NOT EXISTS idx_client_invoices_owner_company ON client_invoices(owner_company);
CREATE INDEX IF NOT EXISTS idx_comments_owner_company ON comments(owner_company);
CREATE INDEX IF NOT EXISTS idx_companies_owner_company ON companies(owner_company);
CREATE INDEX IF NOT EXISTS idx_company_people_owner_company ON company_people(owner_company);
CREATE INDEX IF NOT EXISTS idx_compliance_owner_company ON compliance(owner_company);
CREATE INDEX IF NOT EXISTS idx_content_calendar_owner_company ON content_calendar(owner_company);
CREATE INDEX IF NOT EXISTS idx_contracts_owner_company ON contracts(owner_company);
CREATE INDEX IF NOT EXISTS idx_credits_owner_company ON credits(owner_company);
CREATE INDEX IF NOT EXISTS idx_customer_success_owner_company ON customer_success(owner_company);
CREATE INDEX IF NOT EXISTS idx_debits_owner_company ON debits(owner_company);
CREATE INDEX IF NOT EXISTS idx_deliverables_owner_company ON deliverables(owner_company);
CREATE INDEX IF NOT EXISTS idx_deliveries_owner_company ON deliveries(owner_company);
CREATE INDEX IF NOT EXISTS idx_departments_owner_company ON departments(owner_company);
CREATE INDEX IF NOT EXISTS idx_evaluations_owner_company ON evaluations(owner_company);
CREATE INDEX IF NOT EXISTS idx_events_owner_company ON events(owner_company);
CREATE INDEX IF NOT EXISTS idx_expenses_owner_company ON expenses(owner_company);
CREATE INDEX IF NOT EXISTS idx_goals_owner_company ON goals(owner_company);
CREATE INDEX IF NOT EXISTS idx_interactions_owner_company ON interactions(owner_company);
CREATE INDEX IF NOT EXISTS idx_kpis_owner_company ON kpis(owner_company);
CREATE INDEX IF NOT EXISTS idx_notes_owner_company ON notes(owner_company);
CREATE INDEX IF NOT EXISTS idx_notifications_owner_company ON notifications(owner_company);
CREATE INDEX IF NOT EXISTS idx_orders_owner_company ON orders(owner_company);
CREATE INDEX IF NOT EXISTS idx_payments_owner_company ON payments(owner_company);
CREATE INDEX IF NOT EXISTS idx_people_owner_company ON people(owner_company);
CREATE INDEX IF NOT EXISTS idx_permissions_owner_company ON permissions(owner_company);
CREATE INDEX IF NOT EXISTS idx_projects_owner_company ON projects(owner_company);
CREATE INDEX IF NOT EXISTS idx_projects_team_owner_company ON projects_team(owner_company);
CREATE INDEX IF NOT EXISTS idx_proposals_owner_company ON proposals(owner_company);
CREATE INDEX IF NOT EXISTS idx_providers_owner_company ON providers(owner_company);
CREATE INDEX IF NOT EXISTS idx_quotes_owner_company ON quotes(owner_company);
CREATE INDEX IF NOT EXISTS idx_reconciliations_owner_company ON reconciliations(owner_company);
CREATE INDEX IF NOT EXISTS idx_refunds_owner_company ON refunds(owner_company);
CREATE INDEX IF NOT EXISTS idx_returns_owner_company ON returns(owner_company);
CREATE INDEX IF NOT EXISTS idx_roles_owner_company ON roles(owner_company);
CREATE INDEX IF NOT EXISTS idx_settings_owner_company ON settings(owner_company);
CREATE INDEX IF NOT EXISTS idx_skills_owner_company ON skills(owner_company);
CREATE INDEX IF NOT EXISTS idx_subscriptions_owner_company ON subscriptions(owner_company);
CREATE INDEX IF NOT EXISTS idx_supplier_invoices_owner_company ON supplier_invoices(owner_company);
CREATE INDEX IF NOT EXISTS idx_support_tickets_owner_company ON support_tickets(owner_company);
CREATE INDEX IF NOT EXISTS idx_tags_owner_company ON tags(owner_company);
CREATE INDEX IF NOT EXISTS idx_talents_owner_company ON talents(owner_company);
CREATE INDEX IF NOT EXISTS idx_talents_simple_owner_company ON talents_simple(owner_company);
CREATE INDEX IF NOT EXISTS idx_teams_owner_company ON teams(owner_company);
CREATE INDEX IF NOT EXISTS idx_time_tracking_owner_company ON time_tracking(owner_company);
CREATE INDEX IF NOT EXISTS idx_trainings_owner_company ON trainings(owner_company);
CREATE INDEX IF NOT EXISTS idx_workflows_owner_company ON workflows(owner_company);
