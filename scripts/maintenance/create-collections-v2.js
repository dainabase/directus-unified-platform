#!/usr/bin/env node

/**
 * Script corrigé pour créer les collections manquantes
 */

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

async function createCollection(name) {
  try {
    // Vérifier si existe déjà
    try {
      await directus.get(`/collections/${name}`);
      return { status: 'exists' };
    } catch (checkError) {
      // Si 404, la collection n'existe pas, on peut la créer
      if (checkError.response?.status !== 404) {
        return { status: 'error', error: 'Erreur de vérification' };
      }
    }
    
    // Créer la collection
    const result = await directus.post('/collections', {
      collection: name,
      meta: {
        icon: 'folder',
        display_template: '{{id}}',
        hidden: false,
        singleton: false,
        archive_field: null,
        archive_value: null,
        unarchive_value: null,
        sort_field: null
      },
      schema: {
        name: name
      },
      fields: [
        {
          field: 'id',
          type: 'uuid',
          schema: {
            is_primary_key: true,
            has_auto_increment: false,
            is_nullable: false
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
          schema: {
            is_nullable: true
          },
          meta: {
            interface: 'input',
            width: 'full'
          }
        },
        {
          field: 'date_created',
          type: 'timestamp',
          schema: {
            is_nullable: true
          },
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
          schema: {
            is_nullable: true
          },
          meta: {
            interface: 'datetime',
            readonly: true,
            hidden: true,
            special: ['date-updated']
          }
        }
      ]
    });
    
    return { status: 'created' };
    
  } catch (error) {
    return { 
      status: 'error', 
      error: error.response?.data?.errors?.[0]?.message || error.message 
    };
  }
}

async function main() {
  console.log('🚀 CRÉATION DES COLLECTIONS V2');
  console.log('=' .repeat(60));
  
  // Test de connexion
  try {
    await directus.get('/server/ping');
    console.log('✅ Connexion établie\n');
  } catch (error) {
    console.error('❌ Erreur de connexion');
    process.exit(1);
  }
  
  const results = {
    created: [],
    existing: [],
    errors: []
  };
  
  console.log(`📦 Création de ${collectionsToCreate.length} collections...\n`);
  
  for (const collection of collectionsToCreate) {
    process.stdout.write(`  ${collection}...`);
    const result = await createCollection(collection);
    
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
    
    // Petite pause entre les créations
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
  
  // Vérification finale
  try {
    const collections = await directus.get('/collections');
    const userCollections = collections.data.data.filter(c => !c.collection.startsWith('directus_'));
    console.log(`\n🔍 Total des collections utilisateur : ${userCollections.length}`);
  } catch (error) {
    console.log('\n⚠️  Impossible de vérifier le nombre total');
  }
  
  console.log('\n✨ Terminé !');
}

main().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});