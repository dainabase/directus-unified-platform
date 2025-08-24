#!/usr/bin/env node

/**
 * Script pour créer les collections manquantes dans Directus
 * Date: 03/08/2025
 */

const axios = require('axios');

// Configuration
const DIRECTUS_URL = 'http://localhost:8055';
const DIRECTUS_TOKEN = 'hHKnrW949zcwx2372KH2AjwDyROAjgZ2';

// Client Directus
const directus = axios.create({
  baseURL: DIRECTUS_URL,
  headers: {
    'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// Collections à créer avec leurs champs
const collections = [
  {
    collection: 'projects',
    meta: {
      collection: 'projects',
      icon: 'folder_open',
      note: 'Gestion des projets',
      display_template: '{{name}}',
      hidden: false,
      singleton: false,
      archive_field: 'status',
      archive_value: 'archived',
      unarchive_value: 'active',
      sort_field: 'sort'
    },
    fields: [
      { field: 'id', type: 'uuid', meta: { hidden: true, readonly: true, interface: 'input', special: ['uuid'] } },
      { field: 'name', type: 'string', meta: { interface: 'input', required: true } },
      { field: 'description', type: 'text', meta: { interface: 'input-multiline' } },
      { field: 'status', type: 'string', meta: { interface: 'select-dropdown', options: { choices: [
        { text: 'Active', value: 'active' },
        { text: 'On Hold', value: 'on_hold' },
        { text: 'Completed', value: 'completed' },
        { text: 'Archived', value: 'archived' }
      ] } } },
      { field: 'start_date', type: 'date', meta: { interface: 'datetime' } },
      { field: 'end_date', type: 'date', meta: { interface: 'datetime' } },
      { field: 'budget', type: 'decimal', meta: { interface: 'input' } },
      { field: 'sort', type: 'integer', meta: { interface: 'input', hidden: true } },
      { field: 'date_created', type: 'timestamp', meta: { interface: 'datetime', readonly: true, hidden: true, special: ['date-created'] } },
      { field: 'date_updated', type: 'timestamp', meta: { interface: 'datetime', readonly: true, hidden: true, special: ['date-updated'] } }
    ]
  },
  {
    collection: 'time_tracking',
    meta: {
      collection: 'time_tracking',
      icon: 'schedule',
      note: 'Suivi du temps',
      display_template: '{{date}} - {{hours}}h',
      hidden: false,
      singleton: false
    },
    fields: [
      { field: 'id', type: 'uuid', meta: { hidden: true, readonly: true, interface: 'input', special: ['uuid'] } },
      { field: 'date', type: 'date', meta: { interface: 'datetime', required: true } },
      { field: 'hours', type: 'decimal', meta: { interface: 'input', required: true } },
      { field: 'description', type: 'text', meta: { interface: 'input-multiline' } },
      { field: 'project_id', type: 'uuid', meta: { interface: 'select-dropdown-m2o' } },
      { field: 'task_id', type: 'uuid', meta: { interface: 'select-dropdown-m2o' } },
      { field: 'user_created', type: 'uuid', meta: { interface: 'select-dropdown-m2o', readonly: true, hidden: true, special: ['user-created'] } },
      { field: 'date_created', type: 'timestamp', meta: { interface: 'datetime', readonly: true, hidden: true, special: ['date-created'] } }
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
    fields: [
      { field: 'id', type: 'uuid', meta: { hidden: true, readonly: true, interface: 'input', special: ['uuid'] } },
      { field: 'title', type: 'string', meta: { interface: 'input', required: true } },
      { field: 'description', type: 'text', meta: { interface: 'input-multiline' } },
      { field: 'status', type: 'string', meta: { interface: 'select-dropdown' } },
      { field: 'due_date', type: 'date', meta: { interface: 'datetime' } },
      { field: 'project_id', type: 'uuid', meta: { interface: 'select-dropdown-m2o' } }
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
    fields: [
      { field: 'id', type: 'uuid', meta: { hidden: true, readonly: true, interface: 'input', special: ['uuid'] } },
      { field: 'name', type: 'string', meta: { interface: 'input', required: true } },
      { field: 'industry', type: 'string', meta: { interface: 'input' } },
      { field: 'website', type: 'string', meta: { interface: 'input' } },
      { field: 'email', type: 'string', meta: { interface: 'input' } },
      { field: 'phone', type: 'string', meta: { interface: 'input' } },
      { field: 'address', type: 'text', meta: { interface: 'input-multiline' } }
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
    fields: [
      { field: 'id', type: 'uuid', meta: { hidden: true, readonly: true, interface: 'input', special: ['uuid'] } },
      { field: 'first_name', type: 'string', meta: { interface: 'input', required: true } },
      { field: 'last_name', type: 'string', meta: { interface: 'input', required: true } },
      { field: 'email', type: 'string', meta: { interface: 'input' } },
      { field: 'phone', type: 'string', meta: { interface: 'input' } },
      { field: 'company_id', type: 'uuid', meta: { interface: 'select-dropdown-m2o' } },
      { field: 'position', type: 'string', meta: { interface: 'input' } }
    ]
  },
  {
    collection: 'permissions',
    meta: {
      collection: 'permissions',
      icon: 'lock',
      note: 'Gestion des permissions',
      display_template: '{{action}} - {{collection}}',
      hidden: false,
      singleton: false
    },
    fields: [
      { field: 'id', type: 'uuid', meta: { hidden: true, readonly: true, interface: 'input', special: ['uuid'] } },
      { field: 'action', type: 'string', meta: { interface: 'input', required: true } },
      { field: 'collection', type: 'string', meta: { interface: 'input', required: true } },
      { field: 'user_id', type: 'uuid', meta: { interface: 'select-dropdown-m2o' } },
      { field: 'role_id', type: 'uuid', meta: { interface: 'select-dropdown-m2o' } },
      { field: 'permissions', type: 'json', meta: { interface: 'input-code', options: { language: 'json' } } }
    ]
  },
  {
    collection: 'content_calendar',
    meta: {
      collection: 'content_calendar',
      icon: 'calendar_today',
      note: 'Calendrier de contenu',
      display_template: '{{title}} - {{publish_date}}',
      hidden: false,
      singleton: false
    },
    fields: [
      { field: 'id', type: 'uuid', meta: { hidden: true, readonly: true, interface: 'input', special: ['uuid'] } },
      { field: 'title', type: 'string', meta: { interface: 'input', required: true } },
      { field: 'content', type: 'text', meta: { interface: 'input-rich-text-html' } },
      { field: 'publish_date', type: 'datetime', meta: { interface: 'datetime' } },
      { field: 'status', type: 'string', meta: { interface: 'select-dropdown' } },
      { field: 'campaign_id', type: 'uuid', meta: { interface: 'select-dropdown-m2o' } }
    ]
  },
  {
    collection: 'interactions',
    meta: {
      collection: 'interactions',
      icon: 'chat',
      note: 'Interactions et communications',
      display_template: '{{type}} - {{date}}',
      hidden: false,
      singleton: false
    },
    fields: [
      { field: 'id', type: 'uuid', meta: { hidden: true, readonly: true, interface: 'input', special: ['uuid'] } },
      { field: 'type', type: 'string', meta: { interface: 'select-dropdown', options: { choices: [
        { text: 'Email', value: 'email' },
        { text: 'Phone', value: 'phone' },
        { text: 'Meeting', value: 'meeting' },
        { text: 'Note', value: 'note' }
      ] } } },
      { field: 'date', type: 'datetime', meta: { interface: 'datetime', required: true } },
      { field: 'notes', type: 'text', meta: { interface: 'input-multiline' } },
      { field: 'contact_id', type: 'uuid', meta: { interface: 'select-dropdown-m2o' } },
      { field: 'project_id', type: 'uuid', meta: { interface: 'select-dropdown-m2o' } }
    ]
  },
  {
    collection: 'budgets',
    meta: {
      collection: 'budgets',
      icon: 'attach_money',
      note: 'Gestion des budgets',
      display_template: '{{name}} - {{amount}}',
      hidden: false,
      singleton: false
    },
    fields: [
      { field: 'id', type: 'uuid', meta: { hidden: true, readonly: true, interface: 'input', special: ['uuid'] } },
      { field: 'name', type: 'string', meta: { interface: 'input', required: true } },
      { field: 'amount', type: 'decimal', meta: { interface: 'input', required: true } },
      { field: 'spent', type: 'decimal', meta: { interface: 'input' } },
      { field: 'project_id', type: 'uuid', meta: { interface: 'select-dropdown-m2o' } },
      { field: 'category', type: 'string', meta: { interface: 'input' } }
    ]
  },
  {
    collection: 'compliance',
    meta: {
      collection: 'compliance',
      icon: 'verified_user',
      note: 'Conformité et réglementations',
      display_template: '{{regulation}} - {{status}}',
      hidden: false,
      singleton: false
    },
    fields: [
      { field: 'id', type: 'uuid', meta: { hidden: true, readonly: true, interface: 'input', special: ['uuid'] } },
      { field: 'regulation', type: 'string', meta: { interface: 'input', required: true } },
      { field: 'status', type: 'string', meta: { interface: 'select-dropdown', options: { choices: [
        { text: 'Compliant', value: 'compliant' },
        { text: 'Non-Compliant', value: 'non_compliant' },
        { text: 'In Progress', value: 'in_progress' }
      ] } } },
      { field: 'due_date', type: 'date', meta: { interface: 'datetime' } },
      { field: 'company_id', type: 'uuid', meta: { interface: 'select-dropdown-m2o' } },
      { field: 'notes', type: 'text', meta: { interface: 'input-multiline' } }
    ]
  },
  {
    collection: 'talents',
    meta: {
      collection: 'talents',
      icon: 'groups',
      note: 'Gestion des talents',
      display_template: '{{name}} - {{role}}',
      hidden: false,
      singleton: false
    },
    fields: [
      { field: 'id', type: 'uuid', meta: { hidden: true, readonly: true, interface: 'input', special: ['uuid'] } },
      { field: 'name', type: 'string', meta: { interface: 'input', required: true } },
      { field: 'role', type: 'string', meta: { interface: 'input' } },
      { field: 'skills', type: 'json', meta: { interface: 'tags' } },
      { field: 'experience_years', type: 'integer', meta: { interface: 'input' } },
      { field: 'company_id', type: 'uuid', meta: { interface: 'select-dropdown-m2o' } },
      { field: 'availability', type: 'string', meta: { interface: 'select-dropdown' } }
    ]
  }
];

// Fonction pour créer une collection
async function createCollection(collectionData) {
  try {
    // Créer la collection
    const response = await directus.post('/collections', {
      collection: collectionData.collection,
      meta: collectionData.meta
    });
    
    // Créer les champs
    for (const field of collectionData.fields) {
      try {
        await directus.post(`/fields/${collectionData.collection}`, {
          field: field.field,
          type: field.type,
          meta: field.meta
        });
      } catch (fieldError) {
        console.log(`      ⚠️  Champ ${field.field}: ${fieldError.response?.data?.errors?.[0]?.message || 'existe déjà'}`);
      }
    }
    
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.errors?.[0]?.message || error.message 
    };
  }
}

// Fonction principale
async function main() {
  console.log('🚀 Création des collections Directus');
  console.log('=' .repeat(50));
  
  // Vérifier la connexion
  try {
    await directus.get('/server/ping');
    console.log('✅ Connexion à Directus établie\n');
  } catch (error) {
    console.error('❌ Impossible de se connecter à Directus');
    process.exit(1);
  }
  
  // Créer les collections
  const results = { success: [], failed: [] };
  
  for (const collection of collections) {
    console.log(`\n📦 Création de la collection: ${collection.collection}`);
    const result = await createCollection(collection);
    
    if (result.success) {
      console.log(`   ✅ Collection créée avec succès`);
      results.success.push(collection.collection);
    } else if (result.error?.includes('already exists')) {
      console.log(`   ℹ️  Collection existe déjà`);
      results.success.push(collection.collection);
    } else {
      console.log(`   ❌ Erreur: ${result.error}`);
      results.failed.push({ name: collection.collection, error: result.error });
    }
  }
  
  // Rapport final
  console.log('\n' + '=' .repeat(50));
  console.log('📊 RAPPORT FINAL\n');
  console.log(`✅ Collections créées/vérifiées: ${results.success.length}`);
  results.success.forEach(c => console.log(`   - ${c}`));
  
  if (results.failed.length > 0) {
    console.log(`\n❌ Collections échouées: ${results.failed.length}`);
    results.failed.forEach(c => console.log(`   - ${c.name}: ${c.error}`));
  }
  
  console.log('\n✨ Collections prêtes pour les relations !');
}

// Exécuter
main().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});