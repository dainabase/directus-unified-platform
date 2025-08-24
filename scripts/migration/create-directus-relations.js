#!/usr/bin/env node

/**
 * Script pour créer les relations critiques dans Directus
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

// Fonction pour créer une relation
async function createRelation(relationData) {
  try {
    const response = await directus.post('/relations', relationData);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.errors?.[0]?.message || error.message,
      details: error.response?.data
    };
  }
}

// Fonction pour vérifier si une collection existe
async function checkCollection(collectionName) {
  try {
    const response = await directus.get(`/collections/${collectionName}`);
    return response.data?.data ? true : false;
  } catch (error) {
    return false;
  }
}

// Relations à créer
const relations = [
  // 1. time_tracking → projects
  {
    name: 'time_tracking → projects',
    data: {
      collection: 'time_tracking',
      field: 'project_id',
      related_collection: 'projects',
      schema: {
        constraint_name: 'time_tracking_project_id_foreign',
        table: 'time_tracking',
        column: 'project_id',
        foreign_key_table: 'projects',
        foreign_key_column: 'id',
        on_update: 'NO ACTION',
        on_delete: 'SET NULL'
      },
      meta: {
        many_collection: 'time_tracking',
        many_field: 'project_id',
        one_collection: 'projects',
        one_field: null,
        junction_field: null
      }
    }
  },
  
  // 2. time_tracking → deliverables (tasks)
  {
    name: 'time_tracking → deliverables',
    data: {
      collection: 'time_tracking',
      field: 'task_id',
      related_collection: 'deliverables',
      schema: {
        constraint_name: 'time_tracking_task_id_foreign',
        table: 'time_tracking',
        column: 'task_id',
        foreign_key_table: 'deliverables',
        foreign_key_column: 'id',
        on_update: 'NO ACTION',
        on_delete: 'SET NULL'
      },
      meta: {
        many_collection: 'time_tracking',
        many_field: 'task_id',
        one_collection: 'deliverables',
        one_field: null,
        junction_field: null
      }
    }
  },
  
  // 3. permissions → directus_users
  {
    name: 'permissions → directus_users',
    data: {
      collection: 'permissions',
      field: 'user_id',
      related_collection: 'directus_users',
      schema: {
        constraint_name: 'permissions_user_id_foreign',
        table: 'permissions',
        column: 'user_id',
        foreign_key_table: 'directus_users',
        foreign_key_column: 'id',
        on_update: 'NO ACTION',
        on_delete: 'CASCADE'
      },
      meta: {
        many_collection: 'permissions',
        many_field: 'user_id',
        one_collection: 'directus_users',
        one_field: 'permissions',
        junction_field: null
      }
    }
  },
  
  // 4. permissions → directus_roles
  {
    name: 'permissions → directus_roles',
    data: {
      collection: 'permissions',
      field: 'role_id',
      related_collection: 'directus_roles',
      schema: {
        constraint_name: 'permissions_role_id_foreign',
        table: 'permissions',
        column: 'role_id',
        foreign_key_table: 'directus_roles',
        foreign_key_column: 'id',
        on_update: 'NO ACTION',
        on_delete: 'CASCADE'
      },
      meta: {
        many_collection: 'permissions',
        many_field: 'role_id',
        one_collection: 'directus_roles',
        one_field: 'permissions',
        junction_field: null
      }
    }
  },
  
  // 5. content_calendar → companies (campaigns)
  {
    name: 'content_calendar → companies',
    data: {
      collection: 'content_calendar',
      field: 'campaign_id',
      related_collection: 'companies',
      schema: {
        constraint_name: 'content_calendar_campaign_id_foreign',
        table: 'content_calendar',
        column: 'campaign_id',
        foreign_key_table: 'companies',
        foreign_key_column: 'id',
        on_update: 'NO ACTION',
        on_delete: 'SET NULL'
      },
      meta: {
        many_collection: 'content_calendar',
        many_field: 'campaign_id',
        one_collection: 'companies',
        one_field: null,
        junction_field: null
      }
    }
  },
  
  // 6. interactions → people (contacts)
  {
    name: 'interactions → people',
    data: {
      collection: 'interactions',
      field: 'contact_id',
      related_collection: 'people',
      schema: {
        constraint_name: 'interactions_contact_id_foreign',
        table: 'interactions',
        column: 'contact_id',
        foreign_key_table: 'people',
        foreign_key_column: 'id',
        on_update: 'NO ACTION',
        on_delete: 'CASCADE'
      },
      meta: {
        many_collection: 'interactions',
        many_field: 'contact_id',
        one_collection: 'people',
        one_field: 'interactions',
        junction_field: null
      }
    }
  },
  
  // 7. interactions → projects
  {
    name: 'interactions → projects',
    data: {
      collection: 'interactions',
      field: 'project_id',
      related_collection: 'projects',
      schema: {
        constraint_name: 'interactions_project_id_foreign',
        table: 'interactions',
        column: 'project_id',
        foreign_key_table: 'projects',
        foreign_key_column: 'id',
        on_update: 'NO ACTION',
        on_delete: 'SET NULL'
      },
      meta: {
        many_collection: 'interactions',
        many_field: 'project_id',
        one_collection: 'projects',
        one_field: null,
        junction_field: null
      }
    }
  },
  
  // 8. budgets → projects
  {
    name: 'budgets → projects',
    data: {
      collection: 'budgets',
      field: 'project_id',
      related_collection: 'projects',
      schema: {
        constraint_name: 'budgets_project_id_foreign',
        table: 'budgets',
        column: 'project_id',
        foreign_key_table: 'projects',
        foreign_key_column: 'id',
        on_update: 'NO ACTION',
        on_delete: 'CASCADE'
      },
      meta: {
        many_collection: 'budgets',
        many_field: 'project_id',
        one_collection: 'projects',
        one_field: 'budgets',
        junction_field: null
      }
    }
  },
  
  // 9. compliance → companies
  {
    name: 'compliance → companies',
    data: {
      collection: 'compliance',
      field: 'company_id',
      related_collection: 'companies',
      schema: {
        constraint_name: 'compliance_company_id_foreign',
        table: 'compliance',
        column: 'company_id',
        foreign_key_table: 'companies',
        foreign_key_column: 'id',
        on_update: 'NO ACTION',
        on_delete: 'CASCADE'
      },
      meta: {
        many_collection: 'compliance',
        many_field: 'company_id',
        one_collection: 'companies',
        one_field: 'compliance_records',
        junction_field: null
      }
    }
  },
  
  // 10. talents → companies
  {
    name: 'talents → companies',
    data: {
      collection: 'talents',
      field: 'company_id',
      related_collection: 'companies',
      schema: {
        constraint_name: 'talents_company_id_foreign',
        table: 'talents',
        column: 'company_id',
        foreign_key_table: 'companies',
        foreign_key_column: 'id',
        on_update: 'NO ACTION',
        on_delete: 'SET NULL'
      },
      meta: {
        many_collection: 'talents',
        many_field: 'company_id',
        one_collection: 'companies',
        one_field: 'talents',
        junction_field: null
      }
    }
  }
];

// Fonction principale
async function main() {
  console.log('🚀 Début de la création des relations Directus');
  console.log('=' .repeat(50));
  
  // Vérifier la connexion
  try {
    const ping = await directus.get('/server/ping');
    console.log('✅ Connexion à Directus établie\n');
  } catch (error) {
    console.error('❌ Impossible de se connecter à Directus');
    console.error('   Vérifiez que Directus est démarré sur http://localhost:8055');
    process.exit(1);
  }
  
  // Vérifier les collections requises
  console.log('🔍 Vérification des collections...\n');
  const requiredCollections = [
    'time_tracking', 'projects', 'deliverables', 'permissions',
    'content_calendar', 'companies', 'interactions', 'people',
    'budgets', 'compliance', 'talents'
  ];
  
  const missingCollections = [];
  for (const collection of requiredCollections) {
    const exists = await checkCollection(collection);
    if (!exists) {
      missingCollections.push(collection);
      console.log(`   ❌ Collection manquante: ${collection}`);
    } else {
      console.log(`   ✅ Collection trouvée: ${collection}`);
    }
  }
  
  if (missingCollections.length > 0) {
    console.log('\n⚠️  Collections manquantes détectées !');
    console.log('   Les collections suivantes doivent être créées avant de pouvoir établir les relations :');
    missingCollections.forEach(c => console.log(`   - ${c}`));
    console.log('\n   Créez d\'abord ces collections dans Directus Admin ou via l\'API.');
    process.exit(1);
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log('📝 Création des relations...\n');
  
  // Créer les relations
  const results = {
    success: [],
    failed: []
  };
  
  for (const relation of relations) {
    console.log(`\n🔗 Création: ${relation.name}`);
    const result = await createRelation(relation.data);
    
    if (result.success) {
      console.log(`   ✅ Succès`);
      results.success.push(relation.name);
    } else {
      console.log(`   ❌ Échec: ${result.error}`);
      if (result.details) {
        console.log(`   Détails:`, JSON.stringify(result.details, null, 2));
      }
      results.failed.push({ name: relation.name, error: result.error });
    }
  }
  
  // Rapport final
  console.log('\n' + '=' .repeat(50));
  console.log('📊 RAPPORT FINAL\n');
  console.log(`✅ Relations créées avec succès: ${results.success.length}`);
  results.success.forEach(r => console.log(`   - ${r}`));
  
  if (results.failed.length > 0) {
    console.log(`\n❌ Relations échouées: ${results.failed.length}`);
    results.failed.forEach(r => console.log(`   - ${r.name}: ${r.error}`));
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log('✨ Script terminé !');
  
  // Sauvegarder le rapport
  const report = {
    date: new Date().toISOString(),
    success: results.success,
    failed: results.failed,
    total: relations.length
  };
  
  require('fs').writeFileSync(
    '/Users/jean-mariedelaunay/directus-unified-platform/STATUS/relations-creation-report.json',
    JSON.stringify(report, null, 2)
  );
  console.log('\n📄 Rapport sauvegardé dans STATUS/relations-creation-report.json');
}

// Exécuter le script
main().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});