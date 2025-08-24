#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs/promises';

const API_URL = 'http://localhost:8055';
const TOKEN = 'e6Vt5LRHnYhq7-78yzoSxwdgjn2D6-JW';

async function syncDirectusSchema() {
  console.log('🔄 SYNCHRONISATION DU SCHÉMA DIRECTUS');
  console.log('='.repeat(80));
  console.log('Cette commande synchronise les métadonnées Directus après ajout SQL des colonnes');
  console.log('='.repeat(80));
  
  const client = axios.create({
    baseURL: API_URL,
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json'
    }
  });
  
  try {
    // 1. Forcer Directus à recharger le schéma
    console.log('\n📊 Rechargement du schéma Directus...');
    
    try {
      // Essayer de déclencher un snapshot du schéma
      await client.post('/schema/snapshot', {
        force: true
      });
      console.log('✅ Snapshot du schéma créé');
    } catch (e) {
      console.log('⚠️  Impossible de créer un snapshot (normal si pas les permissions)');
    }
    
    // 2. Essayer de synchroniser via l'endpoint utils/cache/clear
    try {
      await client.post('/utils/cache/clear');
      console.log('✅ Cache Directus vidé');
    } catch (e) {
      console.log('⚠️  Impossible de vider le cache');
    }
    
    // 3. Alternative: Redémarrer Directus manuellement
    console.log('\n💡 IMPORTANT:');
    console.log('Si les champs n\'apparaissent pas dans Directus après l\'ajout SQL:');
    console.log('\n1. Redémarrer Directus:');
    console.log('   docker-compose restart directus');
    console.log('\n2. Ou utiliser l\'interface Admin:');
    console.log('   - Aller dans Settings > Data Model');
    console.log('   - Cliquer sur "Sync from Database" si disponible');
    console.log('\n3. Ou exécuter dans Directus:');
    console.log('   npx directus schema apply');
    
    // 4. Créer un script pour vérifier les colonnes SQL
    const checkScript = `#!/bin/bash
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
"`;
    
    await fs.writeFile('check-owner-company-sql.sh', checkScript);
    await fs.chmod('check-owner-company-sql.sh', 0o755);
    console.log('\n✅ Script de vérification créé: check-owner-company-sql.sh');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

// Exécuter
syncDirectusSchema().catch(console.error);