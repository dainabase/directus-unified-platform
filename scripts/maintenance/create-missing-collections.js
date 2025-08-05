#!/usr/bin/env node

/**
 * Script pour créer les collections manquantes nécessaires aux relations
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

// Collections à créer
const collectionsToCreate = [
  'tags',
  'settings'
];

// Fonction pour créer une collection
async function createCollection(name) {
  try {
    console.log(`📦 Création de la collection: ${name}`);
    
    const result = await directus.post('/collections', {
      collection: name,
      meta: {
        icon: name === 'tags' ? 'label' : 'settings',
        hidden: false,
        singleton: name === 'settings',
        translations: null,
        archive_field: null,
        archive_app_filter: true,
        archive_value: null,
        unarchive_value: null,
        sort_field: null,
        accountability: 'all',
        color: null,
        item_duplication_fields: null,
        sort: null,
        group: null,
        collapse: 'open'
      },
      schema: name === 'settings' ? {} : null,
      fields: name === 'settings' ? [] : [
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
            display: null,
            display_options: null,
            special: ['uuid']
          }
        },
        {
          field: 'name',
          type: 'string',
          schema: {
            is_nullable: false,
            max_length: 255
          },
          meta: {
            interface: 'input',
            special: null,
            required: true
          }
        }
      ]
    });
    
    console.log(`✅ Collection ${name} créée avec succès`);
    return { status: 'created', name };
  } catch (error) {
    if (error.response?.data?.errors?.[0]?.message?.includes('already exists')) {
      console.log(`⚠️ Collection ${name} existe déjà`);
      return { status: 'exists', name };
    }
    console.error(`❌ Erreur pour ${name}:`, error.response?.data?.errors?.[0]?.message || error.message);
    return { status: 'error', name, error: error.response?.data?.errors?.[0]?.message || error.message };
  }
}

// Fonction principale
async function main() {
  console.log('🚀 Création des collections manquantes\n');
  
  const results = {
    created: [],
    exists: [],
    errors: []
  };
  
  for (const collection of collectionsToCreate) {
    const result = await createCollection(collection);
    
    if (result.status === 'created') {
      results.created.push(result.name);
    } else if (result.status === 'exists') {
      results.exists.push(result.name);
    } else {
      results.errors.push(result);
    }
    
    // Pause entre les créations
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Rapport final
  console.log('\n📊 RAPPORT FINAL:');
  console.log(`✅ Créées: ${results.created.length}`);
  if (results.created.length > 0) {
    results.created.forEach(name => console.log(`   - ${name}`));
  }
  
  console.log(`⚠️ Existantes: ${results.exists.length}`);
  if (results.exists.length > 0) {
    results.exists.forEach(name => console.log(`   - ${name}`));
  }
  
  if (results.errors.length > 0) {
    console.log(`❌ Erreurs: ${results.errors.length}`);
    results.errors.forEach(err => console.log(`   - ${err.name}: ${err.error}`));
  }
  
  console.log('\n✨ Script terminé \!');
}

// Exécution
main().catch(console.error);
