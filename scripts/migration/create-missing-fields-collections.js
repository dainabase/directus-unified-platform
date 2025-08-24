#!/usr/bin/env node

/**
 * Script pour créer les champs et collections manquants
 */

const axios = require('axios');

// Configuration
const DIRECTUS_URL = 'http://localhost:8055';
const DIRECTUS_TOKEN = 'e6Vt5LRHnYhq7-78yzoSxwdgjn2D6-JW';

// Client Directus
const directus = axios.create({
  baseURL: DIRECTUS_URL,
  headers: {
    'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// Champs à ajouter aux collections existantes
const fieldsToAdd = [
  {
    collection: 'projects',
    field: 'company_id',
    type: 'uuid'
  },
  {
    collection: 'bank_transactions',
    field: 'invoice_id',
    type: 'uuid'
  },
  {
    collection: 'time_tracking',
    field: 'person_id',
    type: 'uuid'
  }
];

// Collections à créer
const collectionsToCreate = [
  'payments',
  'contracts',
  'proposals',
  'quotes',
  'orders',
  'activities',
  'comments',
  'files',
  'notifications'
];

// Fonction pour créer un champ
async function createField(collection, field, type) {
  try {
    console.log(`📝 Ajout du champ ${collection}.${field}`);
    
    await directus.post(`/fields/${collection}`, {
      field: field,
      type: type,
      schema: {
        is_nullable: true
      },
      meta: {
        interface: 'select-dropdown-m2o',
        special: ['m2o'],
        required: false
      }
    });
    
    console.log(`   ✅ Champ créé`);
    return { status: 'success', field: `${collection}.${field}` };
  } catch (error) {
    const errorMsg = error.response?.data?.errors?.[0]?.message || error.message;
    console.log(`   ❌ Erreur: ${errorMsg}`);
    return { status: 'error', field: `${collection}.${field}`, error: errorMsg };
  }
}

// Fonction pour créer une collection
async function createCollection(name) {
  try {
    console.log(`📦 Création de la collection: ${name}`);
    
    await directus.post('/collections', {
      collection: name,
      meta: {
        icon: 'folder',
        hidden: false
      },
      schema: {},
      fields: [
        {
          field: 'id',
          type: 'uuid',
          schema: {
            is_primary_key: true,
            has_auto_increment: false,
            is_nullable: false,
            is_unique: true
          },
          meta: {
            hidden: true,
            readonly: true,
            interface: 'input',
            special: ['uuid']
          }
        },
        {
          field: 'created_at',
          type: 'timestamp',
          schema: {
            is_nullable: false,
            default_value: 'CURRENT_TIMESTAMP'
          },
          meta: {
            interface: 'datetime',
            readonly: true,
            hidden: true,
            special: ['date-created']
          }
        }
      ]
    });
    
    console.log(`   ✅ Collection créée`);
    return { status: 'success', collection: name };
  } catch (error) {
    const errorMsg = error.response?.data?.errors?.[0]?.message || error.message;
    
    if (errorMsg.includes('already exists')) {
      console.log(`   ⚠️ Collection existe déjà`);
      return { status: 'exists', collection: name };
    }
    
    console.log(`   ❌ Erreur: ${errorMsg}`);
    return { status: 'error', collection: name, error: errorMsg };
  }
}

// Fonction principale
async function main() {
  console.log('🚀 CRÉATION DES CHAMPS ET COLLECTIONS MANQUANTS\n');
  console.log('=' .repeat(60));
  
  const results = {
    fields: { success: [], errors: [] },
    collections: { created: [], exists: [], errors: [] }
  };
  
  // Créer les champs manquants
  console.log('\n📋 AJOUT DES CHAMPS MANQUANTS:\n');
  for (const fieldInfo of fieldsToAdd) {
    const result = await createField(fieldInfo.collection, fieldInfo.field, fieldInfo.type);
    
    if (result.status === 'success') {
      results.fields.success.push(result.field);
    } else {
      results.fields.errors.push(result);
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Créer les collections manquantes
  console.log('\n📦 CRÉATION DES COLLECTIONS MANQUANTES:\n');
  for (const collection of collectionsToCreate) {
    const result = await createCollection(collection);
    
    if (result.status === 'success') {
      results.collections.created.push(result.collection);
    } else if (result.status === 'exists') {
      results.collections.exists.push(result.collection);
    } else {
      results.collections.errors.push(result);
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Rapport final
  console.log('\n' + '=' .repeat(60));
  console.log('📊 RAPPORT FINAL:\n');
  
  console.log('📝 CHAMPS:');
  console.log(`   ✅ Créés: ${results.fields.success.length}`);
  if (results.fields.success.length > 0) {
    results.fields.success.forEach(f => console.log(`      • ${f}`));
  }
  if (results.fields.errors.length > 0) {
    console.log(`   ❌ Erreurs: ${results.fields.errors.length}`);
    results.fields.errors.forEach(e => console.log(`      • ${e.field}: ${e.error}`));
  }
  
  console.log('\n📦 COLLECTIONS:');
  console.log(`   ✅ Créées: ${results.collections.created.length}`);
  if (results.collections.created.length > 0) {
    results.collections.created.forEach(c => console.log(`      • ${c}`));
  }
  console.log(`   ⚠️ Existantes: ${results.collections.exists.length}`);
  if (results.collections.exists.length > 0) {
    results.collections.exists.forEach(c => console.log(`      • ${c}`));
  }
  if (results.collections.errors.length > 0) {
    console.log(`   ❌ Erreurs: ${results.collections.errors.length}`);
    results.collections.errors.forEach(e => console.log(`      • ${e.collection}: ${e.error}`));
  }
  
  console.log('\n✨ Préparation terminée ! Vous pouvez maintenant créer les relations.');
}

// Exécution
main().catch(console.error);
