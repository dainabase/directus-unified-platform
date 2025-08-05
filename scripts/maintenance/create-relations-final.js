#!/usr/bin/env node

/**
 * Script final pour créer toutes les relations manquantes
 * Crée d'abord les champs, puis les relations
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

// Toutes les relations manquantes à créer
const relationsToCreate = [
  // Relations companies
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
  
  // Relations people
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
  
  // Relations deliverables
  { from: 'deliverables', field: 'assigned_to', to: 'people' },
  { from: 'deliverables', field: 'reviewed_by', to: 'people' },
  { from: 'deliverables', field: 'parent_task_id', to: 'deliverables' },
  { from: 'comments', field: 'deliverable_id', to: 'deliverables' },
  { from: 'files', field: 'deliverable_id', to: 'deliverables' },
  { from: 'activities', field: 'deliverable_id', to: 'deliverables' },
  { from: 'approvals', field: 'deliverable_id', to: 'deliverables' },
  { from: 'time_tracking', field: 'deliverable_id', to: 'deliverables' },
  
  // Relations financières
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
  
  // Relations support
  { from: 'support_tickets', field: 'requester_id', to: 'people' },
  { from: 'support_tickets', field: 'assigned_to', to: 'people' },
  { from: 'support_tickets', field: 'company_id', to: 'companies' },
  { from: 'support_tickets', field: 'priority_id', to: 'tags' },
  { from: 'support_tickets', field: 'category_id', to: 'tags' },
  { from: 'comments', field: 'ticket_id', to: 'support_tickets' },
  { from: 'activities', field: 'ticket_id', to: 'support_tickets' },
  { from: 'files', field: 'ticket_id', to: 'support_tickets' },
  
  // Relations commerciales
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
  
  // Relations RH
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

async function createFieldAndRelation(relation) {
  try {
    // 1. Créer le champ d'abord
    try {
      await directus.post(`/fields/${relation.from}`, {
        field: relation.field,
        type: 'uuid',
        meta: {
          interface: 'select-dropdown-m2o',
          special: ['m2o'],
          display: 'related-values',
          display_options: {
            template: '{{name}}'
          }
        }
      });
    } catch (fieldError) {
      // Si le champ existe déjà, c'est OK
      if (!fieldError.response?.data?.errors?.[0]?.message?.includes('already exists')) {
        throw fieldError;
      }
    }
    
    // 2. Créer la relation
    await directus.post('/relations', {
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
        one_collection: relation.to,
        one_field: null,
        one_collection_field: null,
        one_allowed_collections: null,
        junction_field: null,
        sort_field: null,
        one_deselect_action: 'nullify'
      }
    });
    
    return { success: true };
    
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

async function main() {
  console.log('🚀 CRÉATION FINALE DES RELATIONS');
  console.log('=' .repeat(60));
  
  // Test connexion
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
    failed: []
  };
  
  console.log(`📦 Création de ${relationsToCreate.length} relations...\n`);
  
  let index = 0;
  for (const relation of relationsToCreate) {
    index++;
    process.stdout.write(`[${index}/${relationsToCreate.length}] ${relation.from}.${relation.field} → ${relation.to}...`);
    
    const result = await createFieldAndRelation(relation);
    
    if (result.success) {
      if (result.exists) {
        console.log(' ⏭️  Existe');
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
    
    // Pause de 500ms entre chaque création
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Résumé
  console.log('\n' + '='.repeat(60));
  console.log('📊 RÉSUMÉ FINAL');
  console.log('='.repeat(60));
  
  console.log(`\n✅ Relations créées : ${results.created.length}`);
  if (results.created.length > 0 && results.created.length <= 20) {
    results.created.forEach(r => console.log(`   - ${r}`));
  }
  
  console.log(`\n⏭️  Relations existantes : ${results.existing.length}`);
  
  if (results.failed.length > 0) {
    console.log(`\n❌ Erreurs : ${results.failed.length}`);
    results.failed.forEach(r => console.log(`   - ${r.relation}: ${r.error}`));
  }
  
  // Vérification finale
  try {
    const relationsResponse = await directus.get('/relations');
    const totalRelations = relationsResponse.data.data.length;
    console.log(`\n🔍 TOTAL FINAL : ${totalRelations} relations dans Directus`);
    
    if (totalRelations >= 105) {
      console.log('\n🎉 🎉 🎉 SUCCÈS TOTAL ! 🎉 🎉 🎉');
      console.log('Objectif de 105 relations ATTEINT !');
    } else if (totalRelations >= 100) {
      console.log('\n🎉 EXCELLENT ! Plus de 100 relations créées !');
    } else {
      console.log(`\nProgression : ${totalRelations}/105 relations`);
    }
  } catch (error) {
    console.log('\n⚠️  Impossible de vérifier le total');
  }
  
  console.log('\n✨ Script terminé !');
}

main().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});