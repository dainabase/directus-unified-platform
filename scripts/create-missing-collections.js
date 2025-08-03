#!/usr/bin/env node

/**
 * Script pour créer toutes les collections manquantes nécessaires
 * pour les 95 relations
 */

const axios = require('axios');

const DIRECTUS_URL = 'http://localhost:8055';
const DIRECTUS_TOKEN = 'hHKnrW949zcwx2372KH2AjwDyROAjgZ2';

const directus = axios.create({
  baseURL: DIRECTUS_URL,
  headers: {
    'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// Collections nécessaires pour les 95 relations
const collectionsNeeded = [
  'companies', 'people', 'departments', 'teams', 'roles',
  'contracts', 'proposals', 'quotes', 'orders', 'payments',
  'events', 'activities', 'notes', 'files', 'kpis',
  'comments', 'approvals', 'evaluations', 'goals', 'trainings',
  'skills', 'notifications', 'audit_logs', 'workflows',
  'deliveries', 'returns', 'refunds', 'credits', 'debits',
  'bank_transactions', 'accounting_entries', 'reconciliations',
  'support_tickets', 'tags', 'settings', 'expenses'
];

async function createCollection(name) {
  try {
    // Vérifier si existe
    await directus.get(`/collections/${name}`);
    return { name, status: 'exists' };
  } catch (error) {
    if (error.response?.status === 404) {
      // Créer la collection
      try {
        await directus.post('/collections', {
          collection: name,
          meta: {
            icon: 'folder',
            display_template: '{{id}}'
          },
          schema: {
            name: name,
            comment: `Table for ${name}`
          },
          fields: [
            {
              field: 'id',
              type: 'uuid',
              schema: {
                is_primary_key: true
              },
              meta: {
                hidden: true,
                readonly: true,
                interface: 'input',
                special: ['uuid']
              }
            },
            {
              field: 'name',
              type: 'string',
              meta: {
                interface: 'input',
                width: 'full'
              }
            },
            {
              field: 'date_created',
              type: 'timestamp',
              meta: {
                interface: 'datetime',
                readonly: true,
                hidden: true,
                special: ['date-created']
              }
            },
            {
              field: 'date_updated',
              type: 'timestamp',
              meta: {
                interface: 'datetime',
                readonly: true,
                hidden: true,
                special: ['date-updated']
              }
            }
          ]
        });
        return { name, status: 'created' };
      } catch (createError) {
        return { 
          name, 
          status: 'error', 
          error: createError.response?.data?.errors?.[0]?.message || createError.message 
        };
      }
    }
    return { 
      name, 
      status: 'error', 
      error: error.response?.data?.errors?.[0]?.message || error.message 
    };
  }
}

async function main() {
  console.log('🚀 CRÉATION DES COLLECTIONS MANQUANTES');
  console.log('=' .repeat(60));
  
  // Vérifier la connexion
  try {
    await directus.get('/server/ping');
    console.log('✅ Connexion à Directus établie\n');
  } catch (error) {
    console.error('❌ Impossible de se connecter à Directus');
    process.exit(1);
  }
  
  const results = {
    created: [],
    existing: [],
    errors: []
  };
  
  console.log('📦 Création des collections...\n');
  
  for (const collection of collectionsNeeded) {
    process.stdout.write(`  ${collection}...`);
    const result = await createCollection(collection);
    
    if (result.status === 'created') {
      console.log(' ✅ Créée');
      results.created.push(collection);
    } else if (result.status === 'exists') {
      console.log(' ⏭️  Existe déjà');
      results.existing.push(collection);
    } else {
      console.log(` ❌ Erreur: ${result.error}`);
      results.errors.push({ collection, error: result.error });
    }
    
    // Pause pour éviter de surcharger l'API
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Résumé
  console.log('\n' + '='.repeat(60));
  console.log('📊 RÉSUMÉ');
  console.log('='.repeat(60));
  
  console.log(`\n✅ Collections créées : ${results.created.length}`);
  if (results.created.length > 0) {
    results.created.forEach(c => console.log(`   - ${c}`));
  }
  
  console.log(`\n⏭️  Collections existantes : ${results.existing.length}`);
  
  if (results.errors.length > 0) {
    console.log(`\n❌ Erreurs : ${results.errors.length}`);
    results.errors.forEach(e => console.log(`   - ${e.collection}: ${e.error}`));
  }
  
  console.log('\n✨ Terminé !');
}

main().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});