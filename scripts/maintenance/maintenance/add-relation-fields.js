#!/usr/bin/env node

/**
 * Script pour ajouter les champs de relation manquants dans Directus
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

// Champs à ajouter pour les relations
const fieldsToAdd = [
  // time_tracking
  {
    collection: 'time_tracking',
    field: 'project_id',
    type: 'uuid',
    meta: {
      interface: 'select-dropdown-m2o',
      special: ['m2o'],
      display: 'related-values',
      display_options: {
        template: '{{name}}'
      }
    }
  },
  {
    collection: 'time_tracking',
    field: 'task_id',
    type: 'uuid',
    meta: {
      interface: 'select-dropdown-m2o',
      special: ['m2o'],
      display: 'related-values',
      display_options: {
        template: '{{title}}'
      }
    }
  },
  
  // permissions
  {
    collection: 'permissions',
    field: 'user_id',
    type: 'uuid',
    meta: {
      interface: 'select-dropdown-m2o',
      special: ['m2o', 'user-created'],
      display: 'user',
      display_options: {
        template: '{{first_name}} {{last_name}}'
      }
    }
  },
  {
    collection: 'permissions',
    field: 'role_id',
    type: 'uuid',
    meta: {
      interface: 'select-dropdown-m2o',
      special: ['m2o'],
      display: 'related-values',
      display_options: {
        template: '{{name}}'
      }
    }
  },
  
  // content_calendar
  {
    collection: 'content_calendar',
    field: 'campaign_id',
    type: 'uuid',
    meta: {
      interface: 'select-dropdown-m2o',
      special: ['m2o'],
      display: 'related-values',
      display_options: {
        template: '{{name}}'
      }
    }
  },
  
  // interactions
  {
    collection: 'interactions',
    field: 'contact_id',
    type: 'uuid',
    meta: {
      interface: 'select-dropdown-m2o',
      special: ['m2o'],
      display: 'related-values',
      display_options: {
        template: '{{first_name}} {{last_name}}'
      }
    }
  },
  {
    collection: 'interactions',
    field: 'project_id',
    type: 'uuid',
    meta: {
      interface: 'select-dropdown-m2o',
      special: ['m2o'],
      display: 'related-values',
      display_options: {
        template: '{{name}}'
      }
    }
  },
  
  // budgets
  {
    collection: 'budgets',
    field: 'project_id',
    type: 'uuid',
    meta: {
      interface: 'select-dropdown-m2o',
      special: ['m2o'],
      display: 'related-values',
      display_options: {
        template: '{{name}}'
      }
    }
  },
  
  // compliance
  {
    collection: 'compliance',
    field: 'company_id',
    type: 'uuid',
    meta: {
      interface: 'select-dropdown-m2o',
      special: ['m2o'],
      display: 'related-values',
      display_options: {
        template: '{{name}}'
      }
    }
  },
  
  // talents
  {
    collection: 'talents',
    field: 'company_id',
    type: 'uuid',
    meta: {
      interface: 'select-dropdown-m2o',
      special: ['m2o'],
      display: 'related-values',
      display_options: {
        template: '{{name}}'
      }
    }
  }
];

// Fonction pour ajouter un champ
async function addField(fieldData) {
  try {
    const response = await directus.post(`/fields/${fieldData.collection}`, {
      field: fieldData.field,
      type: fieldData.type,
      meta: fieldData.meta,
      schema: {}
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.errors?.[0]?.message || error.message 
    };
  }
}

// Fonction principale
async function main() {
  console.log('🚀 Ajout des champs de relation dans Directus');
  console.log('=' .repeat(50));
  
  // Vérifier la connexion
  try {
    await directus.get('/server/ping');
    console.log('✅ Connexion à Directus établie\n');
  } catch (error) {
    console.error('❌ Impossible de se connecter à Directus');
    process.exit(1);
  }
  
  // Ajouter les champs
  const results = { success: [], failed: [] };
  
  for (const field of fieldsToAdd) {
    console.log(`\n📝 Ajout du champ: ${field.collection}.${field.field}`);
    const result = await addField(field);
    
    if (result.success) {
      console.log(`   ✅ Champ ajouté avec succès`);
      results.success.push(`${field.collection}.${field.field}`);
    } else if (result.error?.includes('already exists')) {
      console.log(`   ℹ️  Champ existe déjà`);
      results.success.push(`${field.collection}.${field.field}`);
    } else {
      console.log(`   ❌ Erreur: ${result.error}`);
      results.failed.push({ field: `${field.collection}.${field.field}`, error: result.error });
    }
  }
  
  // Rapport final
  console.log('\n' + '=' .repeat(50));
  console.log('📊 RAPPORT FINAL\n');
  console.log(`✅ Champs ajoutés/vérifiés: ${results.success.length}`);
  results.success.forEach(f => console.log(`   - ${f}`));
  
  if (results.failed.length > 0) {
    console.log(`\n❌ Champs échoués: ${results.failed.length}`);
    results.failed.forEach(f => console.log(`   - ${f.field}: ${f.error}`));
  }
  
  console.log('\n✨ Champs prêts pour les relations !');
  console.log('\n🔗 Relancez maintenant le script de création des relations :');
  console.log('   node scripts/create-directus-relations.js');
}

// Exécuter
main().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});