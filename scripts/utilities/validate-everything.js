#!/usr/bin/env node

/**
 * Validation complète du système
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

async function validateSystem() {
  console.log('🔍 VALIDATION COMPLÈTE DU SYSTÈME\n');
  console.log('=' .repeat(50));
  
  const results = {
    data: {},
    schemas: {},
    portals: {},
    ocr: false,
    api: {},
    overall: 'FAIL'
  };
  
  // 1. Vérifier les données
  console.log('\n📊 VÉRIFICATION DES DONNÉES:');
  const collections = [
    'companies', 'projects', 'people', 'deliverables',
    'client_invoices', 'expenses', 'time_tracking', 'payments',
    'contracts', 'activities', 'files'
  ];
  
  let totalItems = 0;
  for (const collection of collections) {
    try {
      const response = await directus.get(`/items/${collection}?limit=100`);
      const count = response.data.data?.length || 0;
      results.data[collection] = count;
      totalItems += count;
      console.log(`  ${collection}: ${count} items ${count > 0 ? '✅' : '⚠️'}`);
    } catch (error) {
      results.data[collection] = 'error';
      console.log(`  ${collection}: ❌ Erreur`);
    }
  }
  console.log(`\n  Total: ${totalItems} items`);
  
  // 2. Vérifier les schémas
  console.log('\n🔧 VÉRIFICATION DES SCHÉMAS:');
  try {
    const response = await directus.get('/collections');
    const collections = response.data.data;
    
    let withSchema = 0;
    let withoutSchema = 0;
    
    collections.forEach(col => {
      if (!col.collection.startsWith('directus_')) {
        if (col.schema) {
          withSchema++;
        } else {
          withoutSchema++;
        }
      }
    });
    
    results.schemas = {
      with_schema: withSchema,
      without_schema: withoutSchema,
      percentage: Math.round(withSchema / (withSchema + withoutSchema) * 100)
    };
    
    console.log(`  Avec schéma: ${withSchema} (${results.schemas.percentage}%)`);
    console.log(`  Sans schéma: ${withoutSchema}`);
    
  } catch (error) {
    console.log('  ❌ Erreur lors de la vérification');
  }
  
  // 3. Tester l'OCR
  console.log('\n🔍 TEST OCR:');
  require('dotenv').config();
  results.ocr = !!(process.env.OPENAI_API_KEY || process.env.OCR_OPENAI_API_KEY);
  console.log(`  Clé OpenAI: ${results.ocr ? '✅ Configurée' : '❌ Non configurée'}`);
  
  if (!results.ocr) {
    console.log('  ⚠️ Ajouter OPENAI_API_KEY dans le fichier .env');
  }
  
  // 4. Tester les portails
  console.log('\n🌐 TEST DES PORTAILS:');
  const portals = [
    { name: 'Dashboard unifié', url: 'http://localhost:3000' },
    { name: 'SuperAdmin', url: 'http://localhost:3000/superadmin' },
    { name: 'Client', url: 'http://localhost:3000/client' },
    { name: 'Prestataire', url: 'http://localhost:3000/prestataire' },
    { name: 'Revendeur', url: 'http://localhost:3000/revendeur' }
  ];
  
  for (const portal of portals) {
    try {
      const response = await axios.get(portal.url, {
        validateStatus: () => true,
        timeout: 2000
      });
      results.portals[portal.name] = response.status;
      console.log(`  ${portal.name}: ${response.status === 200 ? '✅' : '⚠️'} (HTTP ${response.status})`);
    } catch (error) {
      results.portals[portal.name] = 'error';
      console.log(`  ${portal.name}: ❌ Non accessible`);
    }
  }
  
  // 5. Tester l'API
  console.log('\n🔌 TEST DES ENDPOINTS:');
  const endpoints = [
    { name: 'Directus Health', url: `${DIRECTUS_URL}/server/health` },
    { name: 'Collections API', url: `${DIRECTUS_URL}/collections` },
    { name: 'Items API', url: `${DIRECTUS_URL}/items/projects` }
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(endpoint.url, {
        headers: { 'Authorization': `Bearer ${DIRECTUS_TOKEN}` },
        validateStatus: () => true,
        timeout: 2000
      });
      results.api[endpoint.name] = response.status;
      console.log(`  ${endpoint.name}: ${response.status < 400 ? '✅' : '⚠️'} (${response.status})`);
    } catch (error) {
      results.api[endpoint.name] = 'error';
      console.log(`  ${endpoint.name}: ❌ Erreur`);
    }
  }
  
  // 6. Verdict final
  const hasData = totalItems > 0;
  const hasSchemas = results.schemas.percentage > 90;
  const hasPortals = Object.values(results.portals).some(s => s === 200);
  const hasAPI = Object.values(results.api).some(s => s < 400);
  
  if (hasData && hasSchemas && hasPortals && hasAPI) {
    results.overall = '✅ SUCCESS';
  } else if (hasData || hasSchemas || hasPortals || hasAPI) {
    results.overall = '⚠️ PARTIAL';
  } else {
    results.overall = '❌ FAIL';
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 RÉSULTAT FINAL: ' + results.overall);
  console.log('='.repeat(50));
  
  console.log('\n📈 MÉTRIQUES:');
  console.log(`  - Données: ${hasData ? '✅' : '❌'} (${totalItems} items)`);
  console.log(`  - Schémas: ${hasSchemas ? '✅' : '❌'} (${results.schemas.percentage}%)`);
  console.log(`  - Portails: ${hasPortals ? '✅' : '❌'}`);
  console.log(`  - API: ${hasAPI ? '✅' : '❌'}`);
  console.log(`  - OCR: ${results.ocr ? '✅' : '❌'}`);
  
  // Sauvegarder le rapport
  require('fs').writeFileSync(
    'validation-report.json',
    JSON.stringify(results, null, 2)
  );
  
  console.log('\n📄 Rapport sauvegardé: validation-report.json');
  
  // Recommandations
  if (results.overall !== '✅ SUCCESS') {
    console.log('\n⚠️ ACTIONS REQUISES:');
    if (!hasData) console.log('  1. Migrer des données depuis Notion');
    if (!hasSchemas) console.log('  2. Réparer les collections sans schéma');
    if (!hasPortals) console.log('  3. Démarrer le serveur unifié (node server.js)');
    if (!results.ocr) console.log('  4. Configurer OPENAI_API_KEY dans .env');
  } else {
    console.log('\n🎉 SYSTÈME 100% OPÉRATIONNEL !');
  }
}

validateSystem().catch(console.error);
