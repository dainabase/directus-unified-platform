#!/usr/bin/env node

// Script de migration pour ajouter owner_company aux collections qui n'en ont pas
import { createDirectus, rest, authentication, createField } from '@directus/sdk';

const client = createDirectus('http://localhost:8055')
  .with(authentication())
  .with(rest());

// Token API Directus
const DIRECTUS_TOKEN = 'e6Vt5LRHnYhq7-78yzoSxwdgjn2D6-JW';

// Se connecter avec le token
client.setToken(DIRECTUS_TOKEN);

// Collections qui DOIVENT avoir owner_company
const collectionsToUpdate = [
  // Finance
  'accounting_entries',
  'budgets', 
  'credits',
  'debits',
  'payments',
  'reconciliations',
  'refunds',
  
  // Projets et temps
  'activities',
  'time_tracking',
  'goals',
  'workflows',
  'deliverables',
  
  // Commerce
  'quotes',
  'proposals',
  'orders',
  'deliveries',
  'returns',
  
  // Support et communication
  'support_tickets',
  'comments',
  'notes',
  'notifications',
  'customer_success',
  'interactions',
  
  // Organisation
  'permissions',
  'settings',
  'approvals',
  
  // Analytics et conformité
  'audit_logs',
  'compliance',
  'content_calendar',
  'evaluations',
  'events',
  'kpis',
  'trainings',
  
  // Banking et subscriptions (au cas où)
  'bank_transactions',
  'subscriptions'
];

// Configuration du champ owner_company
const fieldConfig = {
  field: 'owner_company',
  type: 'string',
  schema: {
    max_length: 50,
    is_nullable: true,
    default_value: 'HYPERVISUAL'
  },
  meta: {
    interface: 'select-dropdown',
    display: 'formatted-value',
    display_options: {
      format: true,
      color: '#2196F3'
    },
    options: {
      choices: [
        { text: 'HYPERVISUAL', value: 'HYPERVISUAL', color: '#2196F3' },
        { text: 'DAINAMICS', value: 'DAINAMICS', color: '#4CAF50' },
        { text: 'LEXAIA', value: 'LEXAIA', color: '#FF9800' },
        { text: 'ENKI REALTY', value: 'ENKI_REALTY', color: '#9C27B0' },
        { text: 'TAKEOUT', value: 'TAKEOUT', color: '#F44336' }
      ]
    },
    translations: [
      {
        language: 'fr-FR',
        translation: 'Entreprise propriétaire'
      }
    ],
    width: 'half',
    sort: 1000
  }
};

async function addOwnerCompanyFields() {
  console.log('🚀 Starting migration: Add owner_company fields');
  console.log('='.repeat(60));
  
  let successCount = 0;
  let errorCount = 0;
  let skippedCount = 0;

  // Ajouter le champ à chaque collection
  for (const collection of collectionsToUpdate) {
    try {
      console.log(`\n📝 Adding owner_company to ${collection}...`);
      
      await client.request(
        createField(collection, {
          ...fieldConfig,
          collection
        })
      );
      
      console.log(`✅ Successfully added owner_company to ${collection}`);
      successCount++;
    } catch (error) {
      if (error.message && error.message.includes('already exists')) {
        console.log(`⚠️ owner_company already exists in ${collection}`);
        skippedCount++;
      } else if (error.errors && error.errors[0] && error.errors[0].message.includes('doesn\'t exist')) {
        console.log(`⚠️ Collection ${collection} doesn't exist - skipping`);
        skippedCount++;
      } else {
        console.error(`❌ Error adding owner_company to ${collection}:`, error.message || error);
        errorCount++;
      }
    }
    
    // Petit délai pour éviter de surcharger l'API
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 MIGRATION SUMMARY:');
  console.log(`✅ Successfully added: ${successCount} collections`);
  console.log(`⚠️ Skipped (already exists): ${skippedCount} collections`);
  console.log(`❌ Errors: ${errorCount} collections`);
  console.log('✅ Migration completed!');
}

// Exécuter si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  addOwnerCompanyFields().catch(error => {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  });
}