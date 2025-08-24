#!/usr/bin/env node

/**
 * Script pour créer les 12 dernières relations manquantes
 * Objectif: Passer de 93 à 105 relations
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

// Les 12 relations finales à créer
const finalRelations = [
  // Relations critiques identifiées
  {
    name: 'projects.company_id → companies',
    collection: 'projects',
    field: 'company_id',
    related_collection: 'companies'
  },
  {
    name: 'bank_transactions.invoice_id → client_invoices',
    collection: 'bank_transactions',
    field: 'invoice_id',
    related_collection: 'client_invoices'
  },
  {
    name: 'time_tracking.person_id → people',
    collection: 'time_tracking',
    field: 'person_id',
    related_collection: 'people'
  },
  // Relations complémentaires importantes
  {
    name: 'payments.project_id → projects',
    collection: 'payments',
    field: 'project_id',
    related_collection: 'projects'
  },
  {
    name: 'contracts.company_id → companies',
    collection: 'contracts',
    field: 'company_id',
    related_collection: 'companies'
  },
  {
    name: 'proposals.company_id → companies',
    collection: 'proposals',
    field: 'company_id',
    related_collection: 'companies'
  },
  {
    name: 'quotes.company_id → companies',
    collection: 'quotes',
    field: 'company_id',
    related_collection: 'companies'
  },
  {
    name: 'orders.company_id → companies',
    collection: 'orders',
    field: 'company_id',
    related_collection: 'companies'
  },
  {
    name: 'activities.project_id → projects',
    collection: 'activities',
    field: 'project_id',
    related_collection: 'projects'
  },
  {
    name: 'comments.project_id → projects',
    collection: 'comments',
    field: 'project_id',
    related_collection: 'projects'
  },
  {
    name: 'files.project_id → projects',
    collection: 'files',
    field: 'project_id',
    related_collection: 'projects'
  },
  {
    name: 'notifications.user_id → people',
    collection: 'notifications',
    field: 'user_id',
    related_collection: 'people'
  }
];

// Fonction pour créer une relation
async function createRelation(relation) {
  try {
    console.log(`🔗 Création: ${relation.name}`);
    
    const response = await directus.post('/relations', {
      collection: relation.collection,
      field: relation.field,
      related_collection: relation.related_collection,
      schema: {
        constraint_name: `${relation.collection}_${relation.field}_foreign`,
        table: relation.collection,
        column: relation.field,
        foreign_key_table: relation.related_collection,
        foreign_key_column: 'id',
        on_update: 'NO ACTION',
        on_delete: 'SET NULL'
      },
      meta: {
        many_collection: relation.collection,
        many_field: relation.field,
        one_collection: relation.related_collection,
        one_field: null,
        one_collection_field: null,
        one_allowed_collections: null,
        junction_field: null,
        sort_field: null,
        one_deselect_action: 'nullify'
      }
    });
    
    console.log(`   ✅ Succès`);
    return { status: 'success', relation: relation.name };
  } catch (error) {
    const errorMsg = error.response?.data?.errors?.[0]?.message || error.message;
    console.log(`   ❌ Erreur: ${errorMsg}`);
    return { status: 'error', relation: relation.name, error: errorMsg };
  }
}

// Fonction principale
async function main() {
  console.log('🚀 CRÉATION DES 12 DERNIÈRES RELATIONS\n');
  console.log('=' .repeat(60));
  console.log('Objectif: Passer de 93 à 105 relations (100% de l\'objectif)\n');
  
  const results = {
    success: [],
    errors: []
  };
  
  // Créer les relations
  for (const relation of finalRelations) {
    const result = await createRelation(relation);
    
    if (result.status === 'success') {
      results.success.push(result.relation);
    } else {
      results.errors.push(result);
    }
    
    // Pause pour éviter le rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Rapport final
  console.log('\n' + '=' .repeat(60));
  console.log('📊 RAPPORT FINAL:\n');
  console.log(`✅ Relations créées avec succès: ${results.success.length}/12`);
  
  if (results.success.length > 0) {
    console.log('\n📋 Relations créées:');
    results.success.forEach(rel => console.log(`   • ${rel}`));
  }
  
  if (results.errors.length > 0) {
    console.log('\n⚠️ Relations échouées: ${results.errors.length}');
    results.errors.forEach(err => console.log(`   • ${err.relation}: ${err.error}`));
  }
  
  // Vérifier le total
  try {
    const response = await directus.get('/relations');
    const totalRelations = response.data.data.length;
    
    console.log('\n' + '=' .repeat(60));
    console.log('📈 ÉTAT FINAL:');
    console.log(`   • Relations totales: ${totalRelations}/105`);
    console.log(`   • Progression: ${Math.round(totalRelations/105*100)}%`);
    
    if (totalRelations >= 105) {
      console.log('\n🎉 OBJECTIF ATTEINT ! 105 relations créées !');
    } else {
      console.log(`\n⚠️ Il reste ${105 - totalRelations} relations à créer`);
    }
  } catch (error) {
    console.error('\n❌ Impossible de vérifier le total des relations');
  }
  
  // Sauvegarder le rapport
  const fs = require('fs');
  const report = {
    date: new Date().toISOString(),
    attempted: finalRelations.length,
    success: results.success,
    errors: results.errors
  };
  
  fs.writeFileSync(
    '/Users/jean-mariedelaunay/directus-unified-platform/STATUS/final-12-relations-report.json',
    JSON.stringify(report, null, 2)
  );
  
  console.log('\n📄 Rapport sauvegardé dans STATUS/final-12-relations-report.json');
  console.log('\n✨ Script terminé !');
}

// Exécution
main().catch(console.error);
