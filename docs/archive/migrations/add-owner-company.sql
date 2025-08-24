-- Script SQL pour ajouter le champ owner_company aux collections manquantes
-- Date: 8 janvier 2025

-- INSTRUCTIONS:
-- 1. Se connecter à PostgreSQL: docker exec -it directus-unified-platform-postgres-1 psql -U directus
-- 2. Exécuter ce script: \i /path/to/add-owner-company.sql

-- Ajouter la colonne owner_company aux tables qui ne l'ont pas
DO $$
DECLARE
    tbl RECORD;
    sql_cmd TEXT;
BEGIN
    -- Liste des tables qui doivent avoir owner_company
    FOR tbl IN 
        SELECT unnest(ARRAY[
            'companies',
            'people',
            'time_tracking',
            'proposals',
            'quotes',
            'support_tickets',
            'orders',
            'talents',
            'interactions',
            'teams',
            'accounting_entries',
            'activities',
            'approvals',
            'audit_logs',
            'comments',
            'company_people',
            'compliance',
            'content_calendar',
            'credits',
            'customer_success',
            'debits',
            'deliveries',
            'departments',
            'evaluations',
            'events',
            'goals',
            'notes',
            'notifications',
            'permissions',
            'projects_team',
            'providers',
            'reconciliations',
            'refunds',
            'returns',
            'roles',
            'settings',
            'skills',
            'tags',
            'talents_simple',
            'trainings',
            'workflows'
        ]) AS table_name
    LOOP
        -- Vérifier si la colonne existe déjà
        IF NOT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = tbl.table_name 
            AND column_name = 'owner_company'
        ) THEN
            -- Ajouter la colonne
            sql_cmd := format('ALTER TABLE %I ADD COLUMN owner_company VARCHAR(50) DEFAULT ''HYPERVISUAL''', tbl.table_name);
            EXECUTE sql_cmd;
            RAISE NOTICE 'Added owner_company to %', tbl.table_name;
        ELSE
            RAISE NOTICE 'owner_company already exists in %', tbl.table_name;
        END IF;
    END LOOP;
END $$;

-- Mettre à jour les métadonnées Directus pour les champs
-- Ceci doit être fait via l'API Directus après l'ajout des colonnes

SELECT 
    table_name,
    CASE 
        WHEN column_name IS NOT NULL THEN 'EXISTS'
        ELSE 'MISSING'
    END AS owner_company_status
FROM (
    SELECT unnest(ARRAY[
        'companies', 'people', 'time_tracking', 'proposals', 'quotes',
        'support_tickets', 'orders', 'talents', 'interactions', 'teams',
        'accounting_entries', 'activities', 'approvals', 'audit_logs', 'comments',
        'company_people', 'compliance', 'content_calendar', 'credits', 'customer_success',
        'debits', 'deliveries', 'departments', 'evaluations', 'events',
        'goals', 'notes', 'notifications', 'permissions', 'projects_team',
        'providers', 'reconciliations', 'refunds', 'returns', 'roles',
        'settings', 'skills', 'tags', 'talents_simple', 'trainings', 'workflows'
    ]) AS table_name
) t
LEFT JOIN information_schema.columns c 
    ON c.table_name = t.table_name 
    AND c.column_name = 'owner_company'
ORDER BY owner_company_status, table_name;