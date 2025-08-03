#!/usr/bin/env node

/**
 * Script pour corriger les collections virtuelles (sans schema)
 * Ces collections doivent être supprimées et recréées avec un schema
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

// Collections à recréer avec schema
const collectionsToFix = [
  {
    collection: 'projects',
    meta: {
      collection: 'projects',
      icon: 'folder_open',
      note: 'Gestion des projets',
      display_template: '{{name}}',
      hidden: false,
      singleton: false
    },
    schema: {
      name: 'projects',
      comment: 'Gestion des projets'
    },
    fields: [
      { field: 'id', type: 'uuid', schema: { is_primary_key: true, has_auto_increment: false }, meta: { hidden: true, readonly: true, interface: 'input', special: ['uuid'] } },
      { field: 'name', type: 'string', schema: { is_nullable: false }, meta: { interface: 'input', required: true } },
      { field: 'description', type: 'text', schema: { is_nullable: true }, meta: { interface: 'input-multiline' } },
      { field: 'status', type: 'string', schema: { is_nullable: true }, meta: { interface: 'select-dropdown' } },
      { field: 'start_date', type: 'date', schema: { is_nullable: true }, meta: { interface: 'datetime' } },
      { field: 'end_date', type: 'date', schema: { is_nullable: true }, meta: { interface: 'datetime' } },
      { field: 'budget', type: 'decimal', schema: { is_nullable: true, numeric_precision: 10, numeric_scale: 2 }, meta: { interface: 'input' } }
    ]
  },
  {
    collection: 'companies',
    meta: {
      collection: 'companies',
      icon: 'business',
      note: 'Entreprises et clients',
      display_template: '{{name}}',
      hidden: false,
      singleton: false
    },
    schema: {
      name: 'companies',
      comment: 'Entreprises et clients'
    },
    fields: [
      { field: 'id', type: 'uuid', schema: { is_primary_key: true, has_auto_increment: false }, meta: { hidden: true, readonly: true, interface: 'input', special: ['uuid'] } },
      { field: 'name', type: 'string', schema: { is_nullable: false }, meta: { interface: 'input', required: true } },
      { field: 'industry', type: 'string', schema: { is_nullable: true }, meta: { interface: 'input' } },
      { field: 'website', type: 'string', schema: { is_nullable: true }, meta: { interface: 'input' } },
      { field: 'email', type: 'string', schema: { is_nullable: true }, meta: { interface: 'input' } },
      { field: 'phone', type: 'string', schema: { is_nullable: true }, meta: { interface: 'input' } },
      { field: 'address', type: 'text', schema: { is_nullable: true }, meta: { interface: 'input-multiline' } }
    ]
  },
  {
    collection: 'people',
    meta: {
      collection: 'people',
      icon: 'person',
      note: 'Contacts et personnes',
      display_template: '{{first_name}} {{last_name}}',
      hidden: false,
      singleton: false
    },
    schema: {
      name: 'people',
      comment: 'Contacts et personnes'
    },
    fields: [
      { field: 'id', type: 'uuid', schema: { is_primary_key: true, has_auto_increment: false }, meta: { hidden: true, readonly: true, interface: 'input', special: ['uuid'] } },
      { field: 'first_name', type: 'string', schema: { is_nullable: false }, meta: { interface: 'input', required: true } },
      { field: 'last_name', type: 'string', schema: { is_nullable: false }, meta: { interface: 'input', required: true } },
      { field: 'email', type: 'string', schema: { is_nullable: true }, meta: { interface: 'input' } },
      { field: 'phone', type: 'string', schema: { is_nullable: true }, meta: { interface: 'input' } },
      { field: 'position', type: 'string', schema: { is_nullable: true }, meta: { interface: 'input' } }
    ]
  },
  {
    collection: 'deliverables',
    meta: {
      collection: 'deliverables',
      icon: 'task_alt',
      note: 'Livrables et tâches',
      display_template: '{{title}}',
      hidden: false,
      singleton: false
    },
    schema: {
      name: 'deliverables',
      comment: 'Livrables et tâches'
    },
    fields: [
      { field: 'id', type: 'uuid', schema: { is_primary_key: true, has_auto_increment: false }, meta: { hidden: true, readonly: true, interface: 'input', special: ['uuid'] } },
      { field: 'title', type: 'string', schema: { is_nullable: false }, meta: { interface: 'input', required: true } },
      { field: 'description', type: 'text', schema: { is_nullable: true }, meta: { interface: 'input-multiline' } },
      { field: 'status', type: 'string', schema: { is_nullable: true }, meta: { interface: 'select-dropdown' } },
      { field: 'due_date', type: 'date', schema: { is_nullable: true }, meta: { interface: 'datetime' } }
    ]
  }
];

async function deleteCollection(collectionName) {
  try {
    await directus.delete(`/collections/${collectionName}`);
    return true;
  } catch (error) {
    if (error.response?.status === 404) {
      return true; // Déjà supprimée
    }
    console.error(`Erreur lors de la suppression de ${collectionName}:`, error.response?.data || error.message);
    return false;
  }
}

async function createCollection(collectionData) {
  try {
    // Créer la collection avec schema
    await directus.post('/collections', {
      collection: collectionData.collection,
      meta: collectionData.meta,
      schema: collectionData.schema,
      fields: collectionData.fields
    });
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.errors?.[0]?.message || error.message 
    };
  }
}

async function main() {
  console.log('🔧 Correction des collections virtuelles');
  console.log('=' .repeat(50));
  
  // Vérifier la connexion
  try {
    await directus.get('/server/ping');
    console.log('✅ Connexion à Directus établie\n');
  } catch (error) {
    console.error('❌ Impossible de se connecter à Directus');
    process.exit(1);
  }
  
  const results = { success: [], failed: [] };
  
  for (const collection of collectionsToFix) {
    console.log(`\n📦 Traitement de: ${collection.collection}`);
    
    // 1. Supprimer l'ancienne collection virtuelle
    console.log('   1. Suppression de la collection virtuelle...');
    const deleted = await deleteCollection(collection.collection);
    if (!deleted) {
      console.log('   ❌ Impossible de supprimer, passage au suivant');
      results.failed.push(collection.collection);
      continue;
    }
    console.log('   ✅ Collection supprimée');
    
    // 2. Recréer avec schema
    console.log('   2. Création de la collection avec schema...');
    const result = await createCollection(collection);
    
    if (result.success) {
      console.log('   ✅ Collection créée avec succès');
      results.success.push(collection.collection);
    } else {
      console.log(`   ❌ Erreur: ${result.error}`);
      results.failed.push({ name: collection.collection, error: result.error });
    }
  }
  
  // Rapport final
  console.log('\n' + '=' .repeat(50));
  console.log('📊 RAPPORT FINAL\n');
  console.log(`✅ Collections corrigées: ${results.success.length}`);
  results.success.forEach(c => console.log(`   - ${c}`));
  
  if (results.failed.length > 0) {
    console.log(`\n❌ Collections échouées: ${results.failed.length}`);
    results.failed.forEach(c => {
      if (typeof c === 'object') {
        console.log(`   - ${c.name}: ${c.error}`);
      } else {
        console.log(`   - ${c}`);
      }
    });
  }
  
  console.log('\n✨ Collections prêtes pour les relations !');
  console.log('\n🔗 Relancez maintenant le script de création des relations :');
  console.log('   node scripts/create-directus-relations.js');
}

// Exécuter
main().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});