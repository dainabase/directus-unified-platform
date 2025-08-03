#!/usr/bin/env node

/**
 * Script pour créer uniquement les relations possibles
 * avec les collections existantes
 */

const axios = require('axios');

const DIRECTUS_URL = 'http://localhost:8055';
const DIRECTUS_TOKEN = 'd9HE8Gs8A4MWxrOSg2_1gWLaQrXsJW5s';

const directus = axios.create({
  baseURL: DIRECTUS_URL,
  headers: {
    'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// Relations possibles entre collections existantes uniquement
const possibleRelations = [
  // Relations companies ↔ autres collections existantes
  { from: 'companies', field: 'parent_company_id', to: 'companies' },
  { from: 'companies', field: 'primary_contact_id', to: 'people' },
  
  // Relations people ↔ autres collections existantes  
  { from: 'people', field: 'company_id', to: 'companies' },
  { from: 'people', field: 'manager_id', to: 'people' },
  
  // Relations deliverables
  { from: 'deliverables', field: 'assigned_to', to: 'people' },
  { from: 'deliverables', field: 'reviewed_by', to: 'people' },
  { from: 'deliverables', field: 'parent_task_id', to: 'deliverables' },
  
  // Relations client_invoices
  { from: 'client_invoices', field: 'company_id', to: 'companies' },
  { from: 'client_invoices', field: 'contact_id', to: 'people' },
  
  // Relations supplier_invoices  
  { from: 'supplier_invoices', field: 'provider_id', to: 'providers' },
  { from: 'supplier_invoices', field: 'approved_by', to: 'people' },
  
  // Relations expenses
  { from: 'expenses', field: 'employee_id', to: 'people' },
  { from: 'expenses', field: 'approved_by', to: 'people' },
  
  // Relations bank_transactions ↔ autres
  { from: 'accounting_entries', field: 'transaction_id', to: 'bank_transactions' },
  
  // Relations support_tickets
  { from: 'support_tickets', field: 'requester_id', to: 'people' },
  { from: 'support_tickets', field: 'assigned_to', to: 'people' },
  { from: 'support_tickets', field: 'company_id', to: 'companies' },
  
  // Relations subscriptions
  { from: 'subscriptions', field: 'company_id', to: 'companies' },
  { from: 'subscriptions', field: 'contact_id', to: 'people' }
];

async function ensureField(collection, field) {
  try {
    await directus.get(`/fields/${collection}/${field}`);
    return { exists: true };
  } catch (error) {
    if (error.response?.status === 404) {
      try {
        await directus.post(`/fields/${collection}`, {
          field: field,
          type: 'uuid',
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

async function createRelation(relation) {
  try {
    const response = await directus.post('/relations', {
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
    });
    return { success: true };
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

async function main() {
  console.log('🚀 CRÉATION DES RELATIONS POSSIBLES');
  console.log('=' .repeat(60));
  
  // Vérifier la connexion
  try {
    await directus.get('/server/ping');
    console.log('✅ Connexion à Directus établie\n');
  } catch (error) {
    console.error('❌ Impossible de se connecter à Directus');
    process.exit(1);
  }
  
  // Vérifier les collections existantes
  console.log('📦 Collections existantes :');
  const collections = await directus.get('/collections');
  const existingCollections = new Set(
    collections.data.data
      .filter(c => !c.collection.startsWith('directus_'))
      .map(c => c.collection)
  );
  
  existingCollections.forEach(c => console.log(`  - ${c}`));
  
  // Filtrer les relations possibles
  const validRelations = possibleRelations.filter(r => 
    existingCollections.has(r.from) && existingCollections.has(r.to)
  );
  
  console.log(`\n🔗 Relations possibles : ${validRelations.length}/${possibleRelations.length}\n`);
  
  const results = {
    created: [],
    existing: [],
    failed: []
  };
  
  let index = 0;
  for (const relation of validRelations) {
    index++;
    process.stdout.write(`[${index}/${validRelations.length}] ${relation.from} → ${relation.to} (${relation.field})...`);
    
    // Créer le champ si nécessaire
    const fieldResult = await ensureField(relation.from, relation.field);
    
    if (fieldResult.error) {
      console.log(` ❌ ${fieldResult.error}`);
      results.failed.push({
        relation: `${relation.from}.${relation.field} → ${relation.to}`,
        error: fieldResult.error
      });
      continue;
    }
    
    // Créer la relation
    const result = await createRelation(relation);
    
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
  }
  
  // Résumé
  console.log('\n' + '='.repeat(60));
  console.log('📊 RÉSUMÉ');
  console.log('='.repeat(60));
  
  console.log(`\n✅ Relations créées : ${results.created.length}`);
  if (results.created.length > 0) {
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
    console.log(`\n🔍 Total des relations dans Directus : ${totalRelations}`);
  } catch (error) {
    console.log('\n⚠️  Impossible de vérifier le nombre total de relations');
  }
  
  console.log('\n✨ Terminé !');
}

main().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});