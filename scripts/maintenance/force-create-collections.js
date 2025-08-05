#!/usr/bin/env node

const axios = require('axios');

const DIRECTUS_URL = 'http://localhost:8055';
const DIRECTUS_TOKEN = 'e6Vt5LRHnYhq7-78yzoSxwdgjn2D6-JW';

const directus = axios.create({
  baseURL: DIRECTUS_URL,
  headers: {
    'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// Collections à créer
const collectionsToCreate = [
  'departments', 'teams', 'roles', 'contracts', 'proposals',
  'quotes', 'orders', 'payments', 'events', 'activities',
  'notes', 'files', 'kpis', 'comments', 'approvals',
  'evaluations', 'goals', 'trainings', 'skills', 'notifications',
  'audit_logs', 'workflows', 'deliveries', 'returns', 'refunds',
  'credits', 'debits', 'reconciliations', 'tags', 'settings'
];

async function forceCreateCollection(name) {
  try {
    const result = await directus.post('/collections', {
      collection: name,
      meta: {
        icon: 'folder'
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
        }
      ]
    });
    return { status: 'created' };
  } catch (error) {
    if (error.response?.data?.errors?.[0]?.message?.includes('already exists')) {
      return { status: 'exists' };
    }
    return { 
      status: 'error', 
      error: error.response?.data?.errors?.[0]?.message || error.message 
    };
  }
}

async function main() {
  console.log('🚀 FORCE CRÉATION DES COLLECTIONS');
  console.log('=' .repeat(60));
  
  const results = {
    created: [],
    existing: [],
    errors: []
  };
  
  console.log(`\n📦 Création forcée de ${collectionsToCreate.length} collections...\n`);
  
  for (const collection of collectionsToCreate) {
    process.stdout.write(`  ${collection}...`);
    const result = await forceCreateCollection(collection);
    
    if (result.status === 'created') {
      console.log(' ✅ Créée');
      results.created.push(collection);
    } else if (result.status === 'exists') {
      console.log(' ⏭️  Existe déjà');
      results.existing.push(collection);
    } else {
      console.log(` ❌ ${result.error}`);
      results.errors.push({ collection, error: result.error });
    }
  }
  
  // Résumé
  console.log('\n' + '='.repeat(60));
  console.log('📊 RÉSUMÉ FINAL');
  console.log('='.repeat(60));
  
  console.log(`\n✅ Collections créées avec succès : ${results.created.length}`);
  if (results.created.length > 0) {
    console.log('Collections créées :');
    results.created.forEach(c => console.log(`   - ${c}`));
  }
  
  console.log(`\n⏭️  Collections déjà existantes : ${results.existing.length}`);
  
  if (results.errors.length > 0) {
    console.log(`\n❌ Collections impossibles à créer : ${results.errors.length}`);
    results.errors.forEach(e => console.log(`   - ${e.collection}: ${e.error}`));
  }
  
  console.log('\n✨ Script terminé !');
  
  if (results.created.length > 0) {
    console.log('\n🎉 SUCCÈS ! Les collections ont été créées.');
    console.log('Prochaine étape : exécuter le script de création des relations.');
  }
}

main().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});