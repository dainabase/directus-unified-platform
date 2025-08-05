#!/usr/bin/env node

/**
 * Script pour analyser les relations manquantes et identifier les 12 à créer
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

// Fonction pour obtenir toutes les relations existantes
async function getExistingRelations() {
  try {
    const response = await directus.get('/relations');
    return response.data.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des relations:', error.message);
    return [];
  }
}

// Fonction principale
async function main() {
  console.log('🔍 ANALYSE DES RELATIONS MANQUANTES\n');
  console.log('=' .repeat(60));
  
  // Récupérer les relations existantes
  const existingRelations = await getExistingRelations();
  console.log(`\n📊 Relations existantes: ${existingRelations.length}`);
  
  // Grouper par collection
  const relationsByCollection = {};
  existingRelations.forEach(rel => {
    if (!relationsByCollection[rel.collection]) {
      relationsByCollection[rel.collection] = [];
    }
    relationsByCollection[rel.collection].push({
      field: rel.field,
      related: rel.related_collection,
      type: rel.meta?.one_field ? 'O2M' : 'M2O'
    });
  });
  
  // Afficher les relations par collection
  console.log('\n📋 RELATIONS PAR COLLECTION:\n');
  Object.keys(relationsByCollection).sort().forEach(collection => {
    console.log(`📁 ${collection} (${relationsByCollection[collection].length} relations):`);
    relationsByCollection[collection].forEach(rel => {
      console.log(`   - ${rel.field} → ${rel.related} (${rel.type})`);
    });
    console.log();
  });
  
  // Relations critiques attendues (basées sur le modèle de données)
  const criticalRelations = [
    { collection: 'projects', field: 'company_id', related: 'companies' },
    { collection: 'people', field: 'company_id', related: 'companies' },
    { collection: 'deliverables', field: 'project_id', related: 'projects' },
    { collection: 'client_invoices', field: 'project_id', related: 'projects' },
    { collection: 'client_invoices', field: 'company_id', related: 'companies' },
    { collection: 'supplier_invoices', field: 'provider_id', related: 'providers' },
    { collection: 'expenses', field: 'project_id', related: 'projects' },
    { collection: 'bank_transactions', field: 'invoice_id', related: 'client_invoices' },
    { collection: 'time_tracking', field: 'project_id', related: 'projects' },
    { collection: 'time_tracking', field: 'person_id', related: 'people' },
    { collection: 'support_tickets', field: 'company_id', related: 'companies' },
    { collection: 'support_tickets', field: 'assigned_to', related: 'people' }
  ];
  
  // Vérifier les relations manquantes
  console.log('🎯 RELATIONS CRITIQUES MANQUANTES:\n');
  const missingRelations = [];
  
  criticalRelations.forEach(expectedRel => {
    const exists = existingRelations.find(rel => 
      rel.collection === expectedRel.collection && 
      rel.field === expectedRel.field
    );
    
    if (!exists) {
      missingRelations.push(expectedRel);
      console.log(`❌ ${expectedRel.collection}.${expectedRel.field} → ${expectedRel.related}`);
    } else {
      console.log(`✅ ${expectedRel.collection}.${expectedRel.field} → ${expectedRel.related}`);
    }
  });
  
  // Rapport final
  console.log('\n' + '=' .repeat(60));
  console.log('📈 RÉSUMÉ:\n');
  console.log(`• Relations totales: ${existingRelations.length}/105`);
  console.log(`• Relations critiques manquantes: ${missingRelations.length}`);
  console.log(`• Collections avec relations: ${Object.keys(relationsByCollection).length}`);
  console.log(`• Objectif restant: ${105 - existingRelations.length} relations`);
  
  // Sauvegarder le rapport
  const fs = require('fs');
  const report = {
    date: new Date().toISOString(),
    total_relations: existingRelations.length,
    relations_by_collection: relationsByCollection,
    missing_critical: missingRelations,
    collections_with_relations: Object.keys(relationsByCollection)
  };
  
  fs.writeFileSync(
    '/Users/jean-mariedelaunay/directus-unified-platform/STATUS/relations-analysis.json',
    JSON.stringify(report, null, 2)
  );
  
  console.log('\n📄 Rapport détaillé sauvegardé dans STATUS/relations-analysis.json');
  console.log('\n✨ Analyse terminée !');
}

// Exécution
main().catch(console.error);
