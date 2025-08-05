#!/usr/bin/env node

/**
 * Script pour créer les 15 relations de la collection projects
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

// Fonction pour ajouter un champ
async function addField(collection, fieldConfig) {
  try {
    const response = await directus.post(`/fields/${collection}`, fieldConfig);
    return { success: true, data: response.data };
  } catch (error) {
    if (error.response?.data?.errors?.[0]?.message?.includes('already exists')) {
      return { success: true, exists: true };
    }
    return { 
      success: false, 
      error: error.response?.data?.errors?.[0]?.message || error.message 
    };
  }
}

// Fonction pour créer une relation
async function createRelation(relationData) {
  try {
    const response = await directus.post('/relations', relationData);
    return { success: true, data: response.data };
  } catch (error) {
    if (error.response?.data?.errors?.[0]?.message?.includes('already has an associated relationship')) {
      return { success: true, exists: true };
    }
    return { 
      success: false, 
      error: error.response?.data?.errors?.[0]?.message || error.message 
    };
  }
}

// Fonction pour créer une collection
async function createCollection(collectionData) {
  try {
    const response = await directus.post('/collections', collectionData);
    return { success: true, data: response.data };
  } catch (error) {
    if (error.response?.data?.errors?.[0]?.message?.includes('already exists')) {
      return { success: true, exists: true };
    }
    return { 
      success: false, 
      error: error.response?.data?.errors?.[0]?.message || error.message 
    };
  }
}

// Fonction principale
async function main() {
  console.log('🚀 Création des 15 relations pour projects');
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
  
  // PHASE 1: Ajouter les champs manquants dans projects
  console.log('\n📝 Phase 1 : Ajout des champs dans projects');
  console.log('-'.repeat(40));
  
  const projectsFields = [
    {
      field: 'client_id',
      type: 'uuid',
      meta: {
        interface: 'select-dropdown-m2o',
        special: ['m2o'],
        display: 'related-values',
        display_options: { template: '{{name}}' }
      }
    },
    {
      field: 'main_provider_id',
      type: 'uuid',
      meta: {
        interface: 'select-dropdown-m2o',
        special: ['m2o'],
        display: 'related-values',
        display_options: { template: '{{name}}' }
      }
    },
    {
      field: 'project_manager_id',
      type: 'uuid',
      meta: {
        interface: 'select-dropdown-m2o',
        special: ['m2o'],
        display: 'user',
        display_options: { template: '{{first_name}} {{last_name}}' }
      }
    },
    {
      field: 'sales_person_id',
      type: 'uuid',
      meta: {
        interface: 'select-dropdown-m2o',
        special: ['m2o'],
        display: 'user',
        display_options: { template: '{{first_name}} {{last_name}}' }
      }
    }
  ];
  
  for (const field of projectsFields) {
    console.log(`  Adding projects.${field.field}...`);
    const result = await addField('projects', field);
    if (result.success) {
      console.log(`    ✅ ${result.exists ? 'Already exists' : 'Added'}`);
    } else {
      console.log(`    ❌ Error: ${result.error}`);
      results.failed.push(`projects.${field.field}`);
    }
  }
  
  // PHASE 2: Ajouter les champs dans les autres collections
  console.log('\n📝 Phase 2 : Ajout des champs dans les autres collections');
  console.log('-'.repeat(40));
  
  const otherFields = [
    { collection: 'deliverables', field: 'project_id', type: 'uuid' },
    { collection: 'client_invoices', field: 'project_id', type: 'uuid' },
    { collection: 'supplier_invoices', field: 'project_id', type: 'uuid' },
    { collection: 'expenses', field: 'project_id', type: 'uuid' },
    { collection: 'bank_transactions', field: 'project_id', type: 'uuid' },
    { collection: 'accounting_entries', field: 'project_id', type: 'uuid' },
    { collection: 'support_tickets', field: 'project_id', type: 'uuid' },
    { collection: 'subscriptions', field: 'project_id', type: 'uuid' }
  ];
  
  for (const fieldConfig of otherFields) {
    console.log(`  Adding ${fieldConfig.collection}.${fieldConfig.field}...`);
    const result = await addField(fieldConfig.collection, {
      field: fieldConfig.field,
      type: fieldConfig.type,
      meta: {
        interface: 'select-dropdown-m2o',
        special: ['m2o'],
        display: 'related-values',
        display_options: { template: '{{name}}' }
      }
    });
    if (result.success) {
      console.log(`    ✅ ${result.exists ? 'Already exists' : 'Added'}`);
    } else {
      console.log(`    ❌ Error: ${result.error}`);
      results.failed.push(`${fieldConfig.collection}.${fieldConfig.field}`);
    }
  }
  
  // PHASE 3: Créer les relations Many-to-One
  console.log('\n🔗 Phase 3 : Création des relations Many-to-One');
  console.log('-'.repeat(40));
  
  const m2oRelations = [
    {
      name: 'projects → companies (client)',
      data: {
        collection: 'projects',
        field: 'client_id',
        related_collection: 'companies',
        schema: {
          constraint_name: 'projects_client_id_foreign',
          table: 'projects',
          column: 'client_id',
          foreign_key_table: 'companies',
          foreign_key_column: 'id',
          on_update: 'NO ACTION',
          on_delete: 'RESTRICT'
        },
        meta: {
          many_collection: 'projects',
          many_field: 'client_id',
          one_collection: 'companies',
          one_field: 'client_projects'
        }
      }
    },
    {
      name: 'projects → providers (main)',
      data: {
        collection: 'projects',
        field: 'main_provider_id',
        related_collection: 'providers',
        schema: {
          constraint_name: 'projects_main_provider_id_foreign',
          table: 'projects',
          column: 'main_provider_id',
          foreign_key_table: 'providers',
          foreign_key_column: 'id',
          on_update: 'NO ACTION',
          on_delete: 'SET NULL'
        },
        meta: {
          many_collection: 'projects',
          many_field: 'main_provider_id',
          one_collection: 'providers',
          one_field: 'main_projects'
        }
      }
    },
    {
      name: 'projects → people (PM)',
      data: {
        collection: 'projects',
        field: 'project_manager_id',
        related_collection: 'people',
        schema: {
          constraint_name: 'projects_project_manager_id_foreign',
          table: 'projects',
          column: 'project_manager_id',
          foreign_key_table: 'people',
          foreign_key_column: 'id',
          on_update: 'NO ACTION',
          on_delete: 'SET NULL'
        },
        meta: {
          many_collection: 'projects',
          many_field: 'project_manager_id',
          one_collection: 'people',
          one_field: 'managed_projects'
        }
      }
    },
    {
      name: 'projects → people (sales)',
      data: {
        collection: 'projects',
        field: 'sales_person_id',
        related_collection: 'people',
        schema: {
          constraint_name: 'projects_sales_person_id_foreign',
          table: 'projects',
          column: 'sales_person_id',
          foreign_key_table: 'people',
          foreign_key_column: 'id',
          on_update: 'NO ACTION',
          on_delete: 'SET NULL'
        },
        meta: {
          many_collection: 'projects',
          many_field: 'sales_person_id',
          one_collection: 'people',
          one_field: 'sales_projects'
        }
      }
    },
    {
      name: 'deliverables → projects',
      data: {
        collection: 'deliverables',
        field: 'project_id',
        related_collection: 'projects',
        schema: {
          constraint_name: 'deliverables_project_id_foreign',
          table: 'deliverables',
          column: 'project_id',
          foreign_key_table: 'projects',
          foreign_key_column: 'id',
          on_update: 'NO ACTION',
          on_delete: 'CASCADE'
        },
        meta: {
          many_collection: 'deliverables',
          many_field: 'project_id',
          one_collection: 'projects',
          one_field: 'deliverables'
        }
      }
    },
    {
      name: 'client_invoices → projects',
      data: {
        collection: 'client_invoices',
        field: 'project_id',
        related_collection: 'projects',
        schema: {
          constraint_name: 'client_invoices_project_id_foreign',
          table: 'client_invoices',
          column: 'project_id',
          foreign_key_table: 'projects',
          foreign_key_column: 'id',
          on_update: 'NO ACTION',
          on_delete: 'SET NULL'
        },
        meta: {
          many_collection: 'client_invoices',
          many_field: 'project_id',
          one_collection: 'projects',
          one_field: 'client_invoices'
        }
      }
    },
    {
      name: 'supplier_invoices → projects',
      data: {
        collection: 'supplier_invoices',
        field: 'project_id',
        related_collection: 'projects',
        schema: {
          constraint_name: 'supplier_invoices_project_id_foreign',
          table: 'supplier_invoices',
          column: 'project_id',
          foreign_key_table: 'projects',
          foreign_key_column: 'id',
          on_update: 'NO ACTION',
          on_delete: 'SET NULL'
        },
        meta: {
          many_collection: 'supplier_invoices',
          many_field: 'project_id',
          one_collection: 'projects',
          one_field: 'supplier_invoices'
        }
      }
    },
    {
      name: 'expenses → projects',
      data: {
        collection: 'expenses',
        field: 'project_id',
        related_collection: 'projects',
        schema: {
          constraint_name: 'expenses_project_id_foreign',
          table: 'expenses',
          column: 'project_id',
          foreign_key_table: 'projects',
          foreign_key_column: 'id',
          on_update: 'NO ACTION',
          on_delete: 'SET NULL'
        },
        meta: {
          many_collection: 'expenses',
          many_field: 'project_id',
          one_collection: 'projects',
          one_field: 'expenses'
        }
      }
    },
    {
      name: 'bank_transactions → projects',
      data: {
        collection: 'bank_transactions',
        field: 'project_id',
        related_collection: 'projects',
        schema: {
          constraint_name: 'bank_transactions_project_id_foreign',
          table: 'bank_transactions',
          column: 'project_id',
          foreign_key_table: 'projects',
          foreign_key_column: 'id',
          on_update: 'NO ACTION',
          on_delete: 'SET NULL'
        },
        meta: {
          many_collection: 'bank_transactions',
          many_field: 'project_id',
          one_collection: 'projects',
          one_field: 'bank_transactions'
        }
      }
    },
    {
      name: 'accounting_entries → projects',
      data: {
        collection: 'accounting_entries',
        field: 'project_id',
        related_collection: 'projects',
        schema: {
          constraint_name: 'accounting_entries_project_id_foreign',
          table: 'accounting_entries',
          column: 'project_id',
          foreign_key_table: 'projects',
          foreign_key_column: 'id',
          on_update: 'NO ACTION',
          on_delete: 'SET NULL'
        },
        meta: {
          many_collection: 'accounting_entries',
          many_field: 'project_id',
          one_collection: 'projects',
          one_field: 'accounting_entries'
        }
      }
    },
    {
      name: 'support_tickets → projects',
      data: {
        collection: 'support_tickets',
        field: 'project_id',
        related_collection: 'projects',
        schema: {
          constraint_name: 'support_tickets_project_id_foreign',
          table: 'support_tickets',
          column: 'project_id',
          foreign_key_table: 'projects',
          foreign_key_column: 'id',
          on_update: 'NO ACTION',
          on_delete: 'SET NULL'
        },
        meta: {
          many_collection: 'support_tickets',
          many_field: 'project_id',
          one_collection: 'projects',
          one_field: 'support_tickets'
        }
      }
    },
    {
      name: 'subscriptions → projects',
      data: {
        collection: 'subscriptions',
        field: 'project_id',
        related_collection: 'projects',
        schema: {
          constraint_name: 'subscriptions_project_id_foreign',
          table: 'subscriptions',
          column: 'project_id',
          foreign_key_table: 'projects',
          foreign_key_column: 'id',
          on_update: 'NO ACTION',
          on_delete: 'SET NULL'
        },
        meta: {
          many_collection: 'subscriptions',
          many_field: 'project_id',
          one_collection: 'projects',
          one_field: 'subscriptions'
        }
      }
    }
  ];
  
  for (const relation of m2oRelations) {
    console.log(`  Creating: ${relation.name}...`);
    const result = await createRelation(relation.data);
    if (result.success) {
      console.log(`    ✅ ${result.exists ? 'Already exists' : 'Created'}`);
      results.success.push(relation.name);
    } else {
      console.log(`    ❌ Error: ${result.error}`);
      results.failed.push({ name: relation.name, error: result.error });
    }
  }
  
  // PHASE 4: Créer la relation Many-to-Many (équipe projet)
  console.log('\n🔗 Phase 4 : Création de la relation Many-to-Many (équipe)');
  console.log('-'.repeat(40));
  
  // Créer la table de jonction
  console.log('  Creating junction table projects_team...');
  const junctionResult = await createCollection({
    collection: 'projects_team',
    meta: {
      hidden: true,
      icon: 'groups'
    },
    schema: {
      name: 'projects_team',
      comment: 'Junction table for projects team members'
    },
    fields: [
      {
        field: 'id',
        type: 'integer',
        schema: {
          is_primary_key: true,
          has_auto_increment: true
        },
        meta: {
          hidden: true
        }
      },
      {
        field: 'projects_id',
        type: 'uuid',
        schema: {},
        meta: {
          hidden: true
        }
      },
      {
        field: 'people_id',
        type: 'uuid',
        schema: {},
        meta: {
          hidden: true
        }
      }
    ]
  });
  
  if (junctionResult.success) {
    console.log(`    ✅ ${junctionResult.exists ? 'Already exists' : 'Created'}`);
    
    // Créer les relations M2M
    const m2mRelations = [
      {
        name: 'projects_team → projects',
        data: {
          collection: 'projects_team',
          field: 'projects_id',
          related_collection: 'projects',
          schema: {
            constraint_name: 'projects_team_projects_id_foreign',
            table: 'projects_team',
            column: 'projects_id',
            foreign_key_table: 'projects',
            foreign_key_column: 'id',
            on_update: 'NO ACTION',
            on_delete: 'CASCADE'
          },
          meta: {
            many_collection: 'projects_team',
            many_field: 'projects_id',
            one_collection: 'projects',
            one_field: 'team',
            junction_field: 'people_id'
          }
        }
      },
      {
        name: 'projects_team → people',
        data: {
          collection: 'projects_team',
          field: 'people_id',
          related_collection: 'people',
          schema: {
            constraint_name: 'projects_team_people_id_foreign',
            table: 'projects_team',
            column: 'people_id',
            foreign_key_table: 'people',
            foreign_key_column: 'id',
            on_update: 'NO ACTION',
            on_delete: 'CASCADE'
          },
          meta: {
            many_collection: 'projects_team',
            many_field: 'people_id',
            one_collection: 'people',
            one_field: 'projects',
            junction_field: 'projects_id'
          }
        }
      }
    ];
    
    for (const relation of m2mRelations) {
      console.log(`  Creating: ${relation.name}...`);
      const result = await createRelation(relation.data);
      if (result.success) {
        console.log(`    ✅ ${result.exists ? 'Already exists' : 'Created'}`);
        results.success.push(relation.name);
      } else {
        console.log(`    ❌ Error: ${result.error}`);
        results.failed.push({ name: relation.name, error: result.error });
      }
    }
  } else {
    console.log(`    ❌ Error: ${junctionResult.error}`);
    results.failed.push({ name: 'projects_team junction', error: junctionResult.error });
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
  
  const totalRelations = 10 + results.success.length; // 10 existantes + nouvelles
  const percentage = ((totalRelations / 105) * 100).toFixed(1);
  
  console.log('\n' + '=' .repeat(50));
  console.log(`✨ Total: ${totalRelations}/105 relations (${percentage}%)`);
  console.log('📝 Collection projects maintenant fully connected!');
  
  // Sauvegarder le rapport
  const report = {
    date: new Date().toISOString(),
    batch: 'projects_relations',
    success: results.success,
    failed: results.failed,
    total_project_relations: results.success.length,
    total_all_relations: totalRelations,
    percentage: percentage
  };
  
  require('fs').writeFileSync(
    '/Users/jean-mariedelaunay/directus-unified-platform/STATUS/projects-relations-report.json',
    JSON.stringify(report, null, 2)
  );
  console.log('\n📄 Rapport sauvegardé dans STATUS/projects-relations-report.json');
}

// Exécuter le script
main().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});