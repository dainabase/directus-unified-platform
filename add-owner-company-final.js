#!/usr/bin/env node

import axios from 'axios';

const API_URL = 'http://localhost:8055';
const TOKEN = 'e6Vt5LRHnYhq7-78yzoSxwdgjn2D6-JW';

// Toutes les collections qui doivent avoir owner_company
const ALL_COLLECTIONS_NEEDING_OWNER_COMPANY = [
  // Critiques
  'companies',
  'people',
  'time_tracking',
  'budgets',
  'proposals',
  'quotes',
  'support_tickets',
  'orders',
  'talents',
  
  // Moyennes
  'interactions',
  'activities',
  'notes',
  'comments',
  'accounting_entries',
  'reconciliations',
  'credits',
  'debits',
  'refunds',
  'returns',
  'content_calendar',
  'events',
  'teams',
  'departments',
  'skills',
  
  // Autres
  'approvals',
  'audit_logs',
  'company_people',
  'compliance',
  'customer_success',
  'deliveries',
  'evaluations',
  'goals',
  'notifications',
  'permissions',
  'projects_team',
  'providers',
  'roles',
  'settings',
  'tags',
  'talents_simple',
  'trainings',
  'workflows'
];

async function addOwnerCompanyToAll() {
  console.log('🚀 AJOUT OWNER_COMPANY - MIGRATION FINALE');
  console.log('='.repeat(60));
  console.log(`Collections à traiter: ${ALL_COLLECTIONS_NEEDING_OWNER_COMPANY.length}`);
  console.log('='.repeat(60));
  
  const client = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOKEN}`
    }
  });
  
  let successCount = 0;
  let existingCount = 0;
  let errorCount = 0;
  const errors = [];
  
  for (let i = 0; i < ALL_COLLECTIONS_NEEDING_OWNER_COMPANY.length; i++) {
    const collection = ALL_COLLECTIONS_NEEDING_OWNER_COMPANY[i];
    const progress = `[${i + 1}/${ALL_COLLECTIONS_NEEDING_OWNER_COMPANY.length}]`;
    
    process.stdout.write(`\r${progress} Traitement de ${collection}...`.padEnd(60));
    
    try {
      // Vérifier si le champ existe
      try {
        await client.get(`/fields/${collection}/owner_company`);
        existingCount++;
        continue;
      } catch (e) {
        if (e.response?.status !== 404) throw e;
      }
      
      // Créer le champ owner_company
      const fieldConfig = {
        collection: collection,
        field: 'owner_company',
        type: 'string',
        schema: {
          name: 'owner_company',
          table: collection,
          data_type: 'varchar',
          default_value: null,
          max_length: 50,
          numeric_precision: null,
          numeric_scale: null,
          is_nullable: true,
          is_unique: false,
          is_primary_key: false,
          is_generated: false,
          generation_expression: null,
          has_auto_increment: false,
          foreign_key_table: null,
          foreign_key_column: null
        },
        meta: {
          collection: collection,
          field: 'owner_company',
          special: null,
          interface: 'select-dropdown',
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
          validation: null,
          required: false,
          readonly: false,
          hidden: false,
          sort: null,
          width: 'half',
          translations: null,
          note: 'Entreprise propriétaire',
          conditions: null,
          group: null,
          validation_message: null
        }
      };
      
      await client.post(`/fields/${collection}`, fieldConfig);
      successCount++;
      
    } catch (error) {
      errorCount++;
      errors.push({
        collection,
        error: error.response?.data?.errors?.[0]?.message || error.message
      });
    }
    
    // Petite pause
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Résumé
  console.log('\n\n' + '='.repeat(60));
  console.log('📊 RÉSUMÉ DE LA MIGRATION');
  console.log('='.repeat(60));
  console.log(`✅ Champs créés: ${successCount}`);
  console.log(`ℹ️  Déjà existants: ${existingCount}`);
  console.log(`❌ Erreurs: ${errorCount}`);
  console.log(`\n📊 Total: ${successCount + existingCount}/${ALL_COLLECTIONS_NEEDING_OWNER_COMPANY.length} collections avec owner_company`);
  
  if (errors.length > 0) {
    console.log('\n❌ Collections avec erreurs:');
    errors.forEach(err => {
      console.log(`   - ${err.collection}: ${err.error}`);
    });
  }
  
  // Vérification finale
  console.log('\n🔍 Vérification finale...');
  try {
    const collectionsResponse = await client.get('/collections');
    const allCollections = collectionsResponse.data?.data || [];
    const userCollections = allCollections.filter(col => 
      !col.collection.startsWith('directus_')
    );
    
    let collectionsWithOwnerCompany = 0;
    
    for (const col of userCollections) {
      try {
        await client.get(`/fields/${col.collection}/owner_company`);
        collectionsWithOwnerCompany++;
      } catch (e) {
        // Pas de owner_company
      }
    }
    
    console.log(`\n✅ TOTAL FINAL: ${collectionsWithOwnerCompany}/${userCollections.length} collections ont owner_company`);
    
    const coverage = ((collectionsWithOwnerCompany / userCollections.length) * 100).toFixed(1);
    console.log(`📊 Couverture: ${coverage}%`);
    
    if (coverage >= 90) {
      console.log('\n🎉 EXCELLENT! Le système de filtrage multi-entreprises est opérationnel!');
    }
    
  } catch (error) {
    console.error('\n❌ Erreur vérification:', error.message);
  }
  
  console.log('\n✅ Migration terminée!');
  console.log('\nProchaine étape: node src/backend/migrations/verify-owner-company.js');
}

addOwnerCompanyToAll().catch(console.error);