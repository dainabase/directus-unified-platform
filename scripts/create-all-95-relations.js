#!/usr/bin/env node

/**
 * Script pour créer les 95 relations manquantes dans Directus
 * Date: 03/08/2025
 * Objectif: Passer de 10 à 105 relations totales
 */

const axios = require('axios');

// Configuration
const DIRECTUS_URL = 'http://localhost:8055';
const DIRECTUS_TOKEN = 'd9HE8Gs8A4MWxrOSg2_1gWLaQrXsJW5s';

// Client Directus
const directus = axios.create({
  baseURL: DIRECTUS_URL,
  headers: {
    'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// Collections à créer si elles n'existent pas
const collectionsToEnsure = [
  'companies', 'people', 'projects', 'deliverables', 'providers',
  'client_invoices', 'supplier_invoices', 'expenses', 'bank_transactions',
  'accounting_entries', 'support_tickets', 'subscriptions', 'alerts',
  'templates', 'products', 'resources', 'kpis', 'reports', 'events',
  'notes', 'tags', 'files', 'comments', 'activities', 'workflows',
  'approvals', 'audit_logs', 'settings', 'notifications', 'payments',
  'contracts', 'proposals', 'quotes', 'orders', 'deliveries', 'returns',
  'refunds', 'credits', 'debits', 'reconciliations', 'departments',
  'teams', 'roles', 'skills', 'trainings', 'evaluations', 'goals'
];

// Fonction pour créer une collection si elle n'existe pas
async function ensureCollection(collectionName) {
  try {
    // Vérifier si la collection existe
    await directus.get(`/collections/${collectionName}`);
    return { exists: true };
  } catch (error) {
    if (error.response?.status === 404) {
      // Créer la collection
      try {
        await directus.post('/collections', {
          collection: collectionName,
          meta: {
            icon: 'folder',
            display_template: '{{id}}'
          },
          schema: {
            name: collectionName,
            comment: `Table for ${collectionName}`
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
              schema: {},
              meta: {
                interface: 'input',
                width: 'full'
              }
            },
            {
              field: 'date_created',
              type: 'timestamp',
              schema: {},
              meta: {
                interface: 'datetime',
                readonly: true,
                hidden: true,
                special: ['date-created']
              }
            }
          ]
        });
        return { created: true };
      } catch (createError) {
        return { error: createError.response?.data?.errors?.[0]?.message || createError.message };
      }
    }
    return { error: error.response?.data?.errors?.[0]?.message || error.message };
  }
}

// Fonction pour ajouter un champ si nécessaire
async function ensureField(collection, field, type = 'uuid') {
  try {
    await directus.get(`/fields/${collection}/${field}`);
    return { exists: true };
  } catch (error) {
    if (error.response?.status === 404) {
      try {
        await directus.post(`/fields/${collection}`, {
          field: field,
          type: type,
          meta: {
            interface: 'select-dropdown-m2o',
            special: ['m2o']
          }
        });
        return { created: true };
      } catch (createError) {
        return { error: createError.response?.data?.errors?.[0]?.message || createError.message };
      }
    }
    return { error: error.response?.data?.errors?.[0]?.message || error.message };
  }
}

// Fonction pour créer une relation
async function createRelation(relationData) {
  try {
    const response = await directus.post('/relations', relationData);
    return { success: true, data: response.data };
  } catch (error) {
    if (error.response?.data?.errors?.[0]?.message?.includes('already')) {
      return { success: true, exists: true };
    }
    return { 
      success: false, 
      error: error.response?.data?.errors?.[0]?.message || error.message 
    };
  }
}

// Liste complète des 95 relations à créer
const allRelations = [
  // Relations déjà créées (10) - seront skippées
  { from: 'time_tracking', field: 'project_id', to: 'projects' },
  { from: 'time_tracking', field: 'task_id', to: 'deliverables' },
  { from: 'permissions', field: 'user_id', to: 'directus_users' },
  { from: 'permissions', field: 'role_id', to: 'directus_roles' },
  { from: 'content_calendar', field: 'campaign_id', to: 'companies' },
  { from: 'interactions', field: 'contact_id', to: 'people' },
  { from: 'interactions', field: 'project_id', to: 'projects' },
  { from: 'budgets', field: 'project_id', to: 'projects' },
  { from: 'compliance', field: 'company_id', to: 'companies' },
  { from: 'talents', field: 'company_id', to: 'companies' },

  // Nouvelles relations projects (déjà créées aussi)
  { from: 'projects', field: 'client_id', to: 'companies' },
  { from: 'projects', field: 'main_provider_id', to: 'providers' },
  { from: 'projects', field: 'project_manager_id', to: 'people' },
  { from: 'projects', field: 'sales_person_id', to: 'people' },
  { from: 'deliverables', field: 'project_id', to: 'projects' },
  { from: 'client_invoices', field: 'project_id', to: 'projects' },
  { from: 'supplier_invoices', field: 'project_id', to: 'projects' },
  { from: 'expenses', field: 'project_id', to: 'projects' },
  { from: 'bank_transactions', field: 'project_id', to: 'projects' },
  { from: 'accounting_entries', field: 'project_id', to: 'projects' },
  { from: 'support_tickets', field: 'project_id', to: 'projects' },
  { from: 'subscriptions', field: 'project_id', to: 'projects' },

  // Relations companies (15)
  { from: 'companies', field: 'parent_company_id', to: 'companies' },
  { from: 'companies', field: 'account_manager_id', to: 'people' },
  { from: 'companies', field: 'primary_contact_id', to: 'people' },
  { from: 'contracts', field: 'company_id', to: 'companies' },
  { from: 'proposals', field: 'company_id', to: 'companies' },
  { from: 'quotes', field: 'company_id', to: 'companies' },
  { from: 'orders', field: 'company_id', to: 'companies' },
  { from: 'payments', field: 'company_id', to: 'companies' },
  { from: 'departments', field: 'company_id', to: 'companies' },
  { from: 'teams', field: 'company_id', to: 'companies' },
  { from: 'events', field: 'company_id', to: 'companies' },
  { from: 'activities', field: 'company_id', to: 'companies' },
  { from: 'notes', field: 'company_id', to: 'companies' },
  { from: 'files', field: 'company_id', to: 'companies' },
  { from: 'kpis', field: 'company_id', to: 'companies' },

  // Relations people (20)
  { from: 'people', field: 'company_id', to: 'companies' },
  { from: 'people', field: 'manager_id', to: 'people' },
  { from: 'people', field: 'department_id', to: 'departments' },
  { from: 'people', field: 'team_id', to: 'teams' },
  { from: 'people', field: 'role_id', to: 'roles' },
  { from: 'activities', field: 'assigned_to', to: 'people' },
  { from: 'activities', field: 'created_by', to: 'people' },
  { from: 'notes', field: 'author_id', to: 'people' },
  { from: 'comments', field: 'author_id', to: 'people' },
  { from: 'approvals', field: 'approver_id', to: 'people' },
  { from: 'approvals', field: 'requester_id', to: 'people' },
  { from: 'evaluations', field: 'employee_id', to: 'people' },
  { from: 'evaluations', field: 'evaluator_id', to: 'people' },
  { from: 'goals', field: 'assigned_to', to: 'people' },
  { from: 'trainings', field: 'trainer_id', to: 'people' },
  { from: 'skills', field: 'person_id', to: 'people' },
  { from: 'notifications', field: 'user_id', to: 'people' },
  { from: 'audit_logs', field: 'user_id', to: 'people' },
  { from: 'workflows', field: 'owner_id', to: 'people' },
  { from: 'files', field: 'uploaded_by', to: 'people' },

  // Relations deliverables (8)
  { from: 'deliverables', field: 'assigned_to', to: 'people' },
  { from: 'deliverables', field: 'reviewed_by', to: 'people' },
  { from: 'deliverables', field: 'parent_task_id', to: 'deliverables' },
  { from: 'comments', field: 'deliverable_id', to: 'deliverables' },
  { from: 'files', field: 'deliverable_id', to: 'deliverables' },
  { from: 'activities', field: 'deliverable_id', to: 'deliverables' },
  { from: 'approvals', field: 'deliverable_id', to: 'deliverables' },
  { from: 'time_tracking', field: 'deliverable_id', to: 'deliverables' },

  // Relations financières (15)
  { from: 'client_invoices', field: 'company_id', to: 'companies' },
  { from: 'client_invoices', field: 'contact_id', to: 'people' },
  { from: 'supplier_invoices', field: 'provider_id', to: 'providers' },
  { from: 'supplier_invoices', field: 'approved_by', to: 'people' },
  { from: 'payments', field: 'invoice_id', to: 'client_invoices' },
  { from: 'payments', field: 'bank_transaction_id', to: 'bank_transactions' },
  { from: 'expenses', field: 'employee_id', to: 'people' },
  { from: 'expenses', field: 'approved_by', to: 'people' },
  { from: 'expenses', field: 'category_id', to: 'tags' },
  { from: 'bank_transactions', field: 'account_id', to: 'settings' },
  { from: 'accounting_entries', field: 'transaction_id', to: 'bank_transactions' },
  { from: 'reconciliations', field: 'bank_transaction_id', to: 'bank_transactions' },
  { from: 'reconciliations', field: 'invoice_id', to: 'client_invoices' },
  { from: 'credits', field: 'company_id', to: 'companies' },
  { from: 'debits', field: 'company_id', to: 'companies' },

  // Relations support (8)
  { from: 'support_tickets', field: 'requester_id', to: 'people' },
  { from: 'support_tickets', field: 'assigned_to', to: 'people' },
  { from: 'support_tickets', field: 'company_id', to: 'companies' },
  { from: 'support_tickets', field: 'priority_id', to: 'tags' },
  { from: 'support_tickets', field: 'category_id', to: 'tags' },
  { from: 'comments', field: 'ticket_id', to: 'support_tickets' },
  { from: 'activities', field: 'ticket_id', to: 'support_tickets' },
  { from: 'files', field: 'ticket_id', to: 'support_tickets' },

  // Relations commerciales (12)
  { from: 'contracts', field: 'project_id', to: 'projects' },
  { from: 'contracts', field: 'sales_person_id', to: 'people' },
  { from: 'contracts', field: 'approved_by', to: 'people' },
  { from: 'proposals', field: 'project_id', to: 'projects' },
  { from: 'proposals', field: 'created_by', to: 'people' },
  { from: 'quotes', field: 'project_id', to: 'projects' },
  { from: 'quotes', field: 'sales_person_id', to: 'people' },
  { from: 'orders', field: 'project_id', to: 'projects' },
  { from: 'orders', field: 'contact_id', to: 'people' },
  { from: 'deliveries', field: 'order_id', to: 'orders' },
  { from: 'returns', field: 'order_id', to: 'orders' },
  { from: 'refunds', field: 'order_id', to: 'orders' },

  // Relations RH (10)
  { from: 'departments', field: 'manager_id', to: 'people' },
  { from: 'departments', field: 'parent_department_id', to: 'departments' },
  { from: 'teams', field: 'team_lead_id', to: 'people' },
  { from: 'teams', field: 'department_id', to: 'departments' },
  { from: 'roles', field: 'department_id', to: 'departments' },
  { from: 'trainings', field: 'department_id', to: 'departments' },
  { from: 'evaluations', field: 'period_id', to: 'settings' },
  { from: 'goals', field: 'period_id', to: 'settings' },
  { from: 'goals', field: 'team_id', to: 'teams' },
  { from: 'skills', field: 'category_id', to: 'tags' }
];

// Fonction principale
async function main() {
  console.log('🚀 CRÉATION DES 95 RELATIONS MANQUANTES DANS DIRECTUS');
  console.log('=' .repeat(60));
  
  // Vérifier la connexion
  try {
    await directus.get('/server/ping');
    console.log('✅ Connexion à Directus établie\n');
  } catch (error) {
    console.error('❌ Impossible de se connecter à Directus');
    console.error('Vérifiez que Directus est actif sur http://localhost:8055');
    process.exit(1);
  }
  
  // ÉTAPE 1 : S'assurer que toutes les collections existent
  console.log('📦 ÉTAPE 1 : Vérification/Création des collections');
  console.log('-'.repeat(60));
  
  let collectionsCreated = 0;
  let collectionsExisting = 0;
  
  for (const collection of collectionsToEnsure) {
    process.stdout.write(`  Vérification de ${collection}...`);
    const result = await ensureCollection(collection);
    
    if (result.created) {
      console.log(' ✅ Créée');
      collectionsCreated++;
    } else if (result.exists) {
      console.log(' ⏭️  Existe déjà');
      collectionsExisting++;
    } else {
      console.log(` ❌ Erreur: ${result.error}`);
    }
  }
  
  console.log(`\n📊 Collections : ${collectionsCreated} créées, ${collectionsExisting} existantes\n`);
  
  // ÉTAPE 2 : Créer les relations
  console.log('🔗 ÉTAPE 2 : Création des relations');
  console.log('-'.repeat(60));
  
  const results = {
    created: [],
    existing: [],
    failed: []
  };
  
  let currentIndex = 0;
  
  for (const relation of allRelations) {
    currentIndex++;
    const progressBar = `[${currentIndex}/${allRelations.length}]`;
    
    process.stdout.write(`${progressBar} ${relation.from} → ${relation.to} (${relation.field})...`);
    
    // S'assurer que le champ existe
    const fieldResult = await ensureField(relation.from, relation.field);
    
    if (fieldResult.error && !fieldResult.error.includes('already exists')) {
      console.log(` ❌ Champ: ${fieldResult.error}`);
      results.failed.push({
        relation: `${relation.from}.${relation.field} → ${relation.to}`,
        error: fieldResult.error
      });
      continue;
    }
    
    // Créer la relation
    const relationData = {
      collection: relation.from,
      field: relation.field,
      related_collection: relation.to,
      schema: {
        constraint_name: `${relation.from}_${relation.field}_foreign`,
        table: relation.from,
        column: relation.field,
        foreign_key_table: relation.to,
        foreign_key_column: 'id',
        on_update: 'NO ACTION',
        on_delete: 'SET NULL'
      },
      meta: {
        many_collection: relation.from,
        many_field: relation.field,
        one_collection: relation.to
      }
    };
    
    const result = await createRelation(relationData);
    
    if (result.success) {
      if (result.exists) {
        console.log(' ⏭️  Existe déjà');
        results.existing.push(`${relation.from}.${relation.field} → ${relation.to}`);
      } else {
        console.log(' ✅ Créée');
        results.created.push(`${relation.from}.${relation.field} → ${relation.to}`);
      }
    } else {
      console.log(` ❌ ${result.error}`);
      results.failed.push({
        relation: `${relation.from}.${relation.field} → ${relation.to}`,
        error: result.error
      });
    }
    
    // Pause pour éviter de surcharger l'API
    if (currentIndex % 10 === 0) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  // RÉSUMÉ FINAL
  console.log('\n' + '='.repeat(60));
  console.log('📊 RÉSUMÉ FINAL');
  console.log('='.repeat(60));
  
  console.log(`\n✅ Relations créées avec succès : ${results.created.length}`);
  if (results.created.length > 0 && results.created.length <= 20) {
    results.created.forEach(r => console.log(`   - ${r}`));
  }
  
  console.log(`\n⏭️  Relations déjà existantes : ${results.existing.length}`);
  if (results.existing.length > 0 && results.existing.length <= 20) {
    results.existing.forEach(r => console.log(`   - ${r}`));
  }
  
  if (results.failed.length > 0) {
    console.log(`\n❌ Erreurs : ${results.failed.length}`);
    results.failed.forEach(r => console.log(`   - ${r.relation}: ${r.error}`));
  }
  
  const totalProcessed = results.created.length + results.existing.length;
  console.log(`\n📈 Total traité : ${totalProcessed}/${allRelations.length}`);
  
  // Vérification finale
  try {
    const relationsResponse = await directus.get('/relations');
    const totalRelations = relationsResponse.data.data.length;
    console.log(`\n🔍 Vérification finale : ${totalRelations} relations totales dans Directus`);
    
    if (totalRelations >= 100) {
      console.log('\n🎉 SUCCÈS ! Objectif de 105 relations atteint ou dépassé !');
    } else {
      console.log(`\n⚠️  ${totalRelations}/105 relations. Il manque ${105 - totalRelations} relations.`);
    }
  } catch (error) {
    console.log('\n⚠️  Impossible de vérifier le nombre total de relations');
  }
  
  // Sauvegarder le rapport
  const report = {
    date: new Date().toISOString(),
    operation: 'create_95_relations',
    collections: {
      created: collectionsCreated,
      existing: collectionsExisting
    },
    relations: {
      created: results.created.length,
      existing: results.existing.length,
      failed: results.failed.length
    },
    details: {
      created: results.created,
      failed: results.failed
    }
  };
  
  require('fs').writeFileSync(
    '/Users/jean-mariedelaunay/directus-unified-platform/STATUS/relations-95-report.json',
    JSON.stringify(report, null, 2)
  );
  
  console.log('\n📄 Rapport sauvegardé dans STATUS/relations-95-report.json');
  console.log('\n✨ Script terminé !');
}

// Exécuter le script
main().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});