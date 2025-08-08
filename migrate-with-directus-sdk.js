#!/usr/bin/env node

import { createDirectus, rest, staticToken, createField } from '@directus/sdk';

const DIRECTUS_URL = 'http://localhost:8055';
const TOKEN = 'e6Vt5LRHnYhq7-78yzoSxwdgjn2D6-JW';

// Collections qui n'ont PAS owner_company
const COLLECTIONS_WITHOUT_OWNER_COMPANY = [
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
];

async function migrateWithSDK() {
  console.log('🚀 MIGRATION AVEC DIRECTUS SDK');
  console.log('='.repeat(80));
  
  // Créer le client Directus
  const directus = createDirectus(DIRECTUS_URL)
    .with(staticToken(TOKEN))
    .with(rest());
  
  // Vérifier la connexion
  try {
    const me = await directus.request(
      rest.readMe()
    );
    console.log('✅ Connecté en tant que:', me.email);
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
    return;
  }
  
  // Définition du champ owner_company
  const ownerCompanyField = {
    field: 'owner_company',
    type: 'string',
    schema: {
      max_length: 50,
      is_nullable: true,
      default_value: 'HYPERVISUAL'
    },
    meta: {
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
          {
            text: 'HYPERVISUAL',
            value: 'HYPERVISUAL',
            foreground: '#FFFFFF',
            background: '#2196F3'
          },
          {
            text: 'DAINAMICS',
            value: 'DAINAMICS',
            foreground: '#FFFFFF',
            background: '#4CAF50'
          },
          {
            text: 'LEXAIA',
            value: 'LEXAIA',
            foreground: '#FFFFFF',
            background: '#FF9800'
          },
          {
            text: 'ENKI REALTY',
            value: 'ENKI_REALTY',
            foreground: '#FFFFFF',
            background: '#9C27B0'
          },
          {
            text: 'TAKEOUT',
            value: 'TAKEOUT',
            foreground: '#FFFFFF',
            background: '#F44336'
          }
        ]
      },
      width: 'half',
      note: 'Entreprise propriétaire',
      required: false,
      readonly: false,
      hidden: false
    }
  };
  
  let successCount = 0;
  let errorCount = 0;
  let existingCount = 0;
  const errors = [];
  
  // Ajouter le champ à chaque collection
  for (let i = 0; i < COLLECTIONS_WITHOUT_OWNER_COMPANY.length; i++) {
    const collection = COLLECTIONS_WITHOUT_OWNER_COMPANY[i];
    const progress = `[${i + 1}/${COLLECTIONS_WITHOUT_OWNER_COMPANY.length}]`;
    
    console.log(`\n${progress} ${collection}`);
    console.log('-'.repeat(40));
    
    try {
      // Vérifier si le champ existe déjà
      try {
        const fields = await directus.request(
          rest.readFieldsByCollection(collection)
        );
        
        const hasOwnerCompany = fields.some(f => f.field === 'owner_company');
        
        if (hasOwnerCompany) {
          console.log('  ℹ️  owner_company existe déjà');
          existingCount++;
          continue;
        }
      } catch (e) {
        // Continuer si on ne peut pas lire les champs
      }
      
      // Créer le champ
      console.log('  ➕ Ajout du champ owner_company...');
      
      await directus.request(
        createField(collection, ownerCompanyField)
      );
      
      console.log('  ✅ owner_company ajouté avec succès!');
      successCount++;
      
    } catch (error) {
      errorCount++;
      const errorMsg = error.errors?.[0]?.message || error.message;
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
  console.log(`\n📊 Total: ${successCount + existingCount}/${COLLECTIONS_WITHOUT_OWNER_COMPANY.length} collections avec owner_company`);
  
  if (errors.length > 0) {
    console.log('\n❌ Collections avec erreurs:');
    errors.forEach(err => {
      console.log(`   - ${err.collection}: ${err.error}`);
    });
  }
  
  if (successCount > 0) {
    console.log('\n🎉 MIGRATION RÉUSSIE!');
    console.log('Prochaine étape: node src/backend/tests/test-filtering.js');
  }
}

// Exécuter
migrateWithSDK().catch(console.error);