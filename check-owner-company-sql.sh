#!/bin/bash
# Vérifier les colonnes owner_company dans PostgreSQL

echo "🔍 Vérification des colonnes owner_company dans la base de données"
echo "================================================================"

docker exec directus-unified-platform-postgres-1 psql -U directus -c "
SELECT 
    table_name,
    CASE 
        WHEN column_name IS NOT NULL THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END AS status
FROM (
    SELECT unnest(ARRAY[
        'companies', 'people', 'time_tracking', 'proposals', 'quotes',
        'support_tickets', 'orders', 'talents', 'interactions', 'teams'
    ]) AS table_name
) t
LEFT JOIN information_schema.columns c 
    ON c.table_name = t.table_name 
    AND c.column_name = 'owner_company'
ORDER BY status DESC, table_name;
"