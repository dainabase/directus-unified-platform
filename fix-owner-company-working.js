#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs/promises';

const API_URL = 'http://localhost:8055';
const TOKEN = 'e6Vt5LRHnYhq7-78yzoSxwdgjn2D6-JW'; // Token JMD qui fonctionne !

// Collections qui n'ont PAS owner_company
const COLLECTIONS_TO_FIX = [
  // Critiques
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
  // Autres
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
];

async function fixOwnerCompany() {
  console.log('🚀 AJOUT OWNER_COMPANY - VERSION QUI FONCTIONNE!');
  console.log('='.repeat(80));
  console.log(`Collections à traiter: ${COLLECTIONS_TO_FIX.length}`);
  console.log('='.repeat(80));
  
  const client = axios.create({
    baseURL: API_URL,
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json'
    },
    timeout: 30000
  });
  
  let successCount = 0;
  let errorCount = 0;
  let existingCount = 0;
  const errors = [];
  
  for (let i = 0; i < COLLECTIONS_TO_FIX.length; i++) {
    const collection = COLLECTIONS_TO_FIX[i];
    const progress = `[${i + 1}/${COLLECTIONS_TO_FIX.length}]`;
    
    console.log(`\n${progress} ${collection}`);
    console.log('-'.repeat(40));
    
    try {
      // 1. Vérifier si le champ existe déjà
      try {
        await client.get(`/fields/${collection}/owner_company`);
        console.log('  ℹ️  owner_company existe déjà');
        existingCount++;
        continue;
      } catch (e) {
        if (e.response?.status !== 404) throw e;
        // 404 = le champ n'existe pas, on continue
      }
      
      // 2. Créer le champ avec le format EXACT qui fonctionne dans test-all-tokens.js
      console.log('  ➕ Ajout du champ owner_company...');
      
      const fieldConfig = {
        collection: collection,
        field: 'owner_company',
        type: 'string',
        schema: {
          name: 'owner_company',
          table: collection,
          data_type: 'varchar',
          max_length: 50,
          is_nullable: true
        },
        meta: {
          collection: collection,
          field: 'owner_company',
          interface: 'select-dropdown',
          special: null,
          options: {
            choices: [
              { text: 'HYPERVISUAL', value: 'HYPERVISUAL' },
              { text: 'DAINAMICS', value: 'DAINAMICS' },
              { text: 'LEXAIA', value: 'LEXAIA' },
              { text: 'ENKI REALTY', value: 'ENKI_REALTY' },
              { text: 'TAKEOUT', value: 'TAKEOUT' }
            ]
          },
          display: 'labels',
          display_options: {
            showAsDot: true,
            choices: [
              { text: 'HYPERVISUAL', value: 'HYPERVISUAL', foreground: '#FFFFFF', background: '#2196F3' },
              { text: 'DAINAMICS', value: 'DAINAMICS', foreground: '#FFFFFF', background: '#4CAF50' },
              { text: 'LEXAIA', value: 'LEXAIA', foreground: '#FFFFFF', background: '#FF9800' },
              { text: 'ENKI REALTY', value: 'ENKI_REALTY', foreground: '#FFFFFF', background: '#9C27B0' },
              { text: 'TAKEOUT', value: 'TAKEOUT', foreground: '#FFFFFF', background: '#F44336' }
            ]
          },
          readonly: false,
          hidden: false,
          required: false,
          width: 'half',
          note: 'Entreprise propriétaire'
        }
      };
      
      const response = await client.post(`/fields/${collection}`, fieldConfig);
      
      if (response.status === 200 || response.status === 201) {
        console.log('  ✅ owner_company ajouté avec succès!');
        successCount++;
        
        // 3. Migrer quelques données de test
        await migrateCollectionData(client, collection);
      }
      
    } catch (error) {
      errorCount++;
      const errorMsg = error.response?.data?.errors?.[0]?.message || error.message;
      console.log(`  ❌ Erreur: ${errorMsg}`);
      errors.push({ collection, error: errorMsg });
    }
    
    // Petite pause entre les collections
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Rapport final
  console.log('\n\n' + '='.repeat(80));
  console.log('📊 RAPPORT FINAL');
  console.log('='.repeat(80));
  console.log(`✅ Champs créés: ${successCount}`);
  console.log(`ℹ️  Déjà existants: ${existingCount}`);
  console.log(`❌ Erreurs: ${errorCount}`);
  console.log(`\n📊 Total: ${successCount + existingCount}/${COLLECTIONS_TO_FIX.length} collections avec owner_company`);
  
  if (errors.length > 0) {
    console.log('\n❌ Collections avec erreurs:');
    errors.forEach(err => {
      console.log(`   - ${err.collection}: ${err.error}`);
    });
  }
  
  // Sauvegarder le rapport
  const report = {
    timestamp: new Date().toISOString(),
    success: successCount,
    existing: existingCount,
    errors: errorCount,
    total: COLLECTIONS_TO_FIX.length,
    details: errors
  };
  
  try {
    await fs.writeFile('migration-report-final.json', JSON.stringify(report, null, 2));
    console.log('\n📄 Rapport sauvegardé: migration-report-final.json');
  } catch (e) {
    // Ignorer
  }
  
  if (successCount > 0) {
    console.log('\n🎉 MIGRATION RÉUSSIE!');
    console.log('Prochaine étape: node src/backend/test/test-complete-filtering.js');
  }
}

async function migrateCollectionData(client, collection) {
  console.log('  🔄 Migration de quelques données...');
  
  try {
    // Récupérer quelques items sans owner_company
    const response = await client.get(`/items/${collection}`, {
      params: {
        filter: { owner_company: { _null: true } },
        limit: 10
      }
    });
    
    const items = response.data.data || [];
    
    if (items.length === 0) {
      console.log('  ✅ Pas de données à migrer');
      return;
    }
    
    // Distribuer selon les proportions
    const distribution = ['HYPERVISUAL', 'HYPERVISUAL', 'HYPERVISUAL', 'HYPERVISUAL', 
                         'DAINAMICS', 'DAINAMICS', 'LEXAIA', 'ENKI_REALTY', 'ENKI_REALTY', 'TAKEOUT'];
    
    let migratedCount = 0;
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const company = distribution[i % distribution.length];
      
      try {
        await client.patch(`/items/${collection}/${item.id}`, {
          owner_company: company
        });
        migratedCount++;
      } catch (e) {
        // Ignorer les erreurs individuelles
      }
    }
    
    console.log(`  ✅ ${migratedCount} items migrés`);
    
  } catch (error) {
    console.log('  ⚠️  Erreur migration:', error.message);
  }
}

// Exécuter
fixOwnerCompany().catch(console.error);