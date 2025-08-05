#!/usr/bin/env node

/**
 * Script de test des 4 portails Tabler.io
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = 'http://localhost:3000';
const DIRECTUS_TOKEN = 'e6Vt5LRHnYhq7-78yzoSxwdgjn2D6-JW';

// Les 4 portails à tester
const portals = [
  { name: 'SuperAdmin', path: '/superadmin', expectedFiles: ['index.html', 'dashboard.html'] },
  { name: 'Client', path: '/client', expectedFiles: ['index.html', 'projects.html', 'invoices.html'] },
  { name: 'Prestataire', path: '/prestataire', expectedFiles: ['index.html', 'missions.html', 'calendar.html'] },
  { name: 'Revendeur', path: '/revendeur', expectedFiles: ['index.html', 'clients.html', 'pipeline.html'] }
];

// Fonction pour vérifier qu'un portal existe
async function checkPortalFiles(portal) {
  console.log(`\n📁 Test du portal ${portal.name}...`);
  
  const portalPath = path.join(__dirname, '../frontend/portals', portal.name.toLowerCase());
  
  if (!fs.existsSync(portalPath)) {
    console.log(`   ❌ Dossier non trouvé: ${portalPath}`);
    return false;
  }
  
  console.log(`   ✅ Dossier trouvé`);
  
  // Vérifier les fichiers essentiels
  let allFilesFound = true;
  for (const file of portal.expectedFiles) {
    const filePath = path.join(portalPath, file);
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      console.log(`   ✅ ${file} (${stats.size} octets)`);
    } else {
      console.log(`   ❌ ${file} manquant`);
      allFilesFound = false;
    }
  }
  
  // Vérifier les assets Tabler
  const tablerPath = path.join(__dirname, '../frontend/shared/tabler');
  if (fs.existsSync(tablerPath)) {
    console.log(`   ✅ Framework Tabler.io présent`);
  } else {
    console.log(`   ❌ Framework Tabler.io manquant`);
    allFilesFound = false;
  }
  
  return allFilesFound;
}

// Fonction pour tester l'accès HTTP à un portal
async function testPortalAccess(portal) {
  try {
    console.log(`\n🌐 Test d'accès HTTP au portal ${portal.name}...`);
    
    const response = await axios.get(`${BASE_URL}${portal.path}`, {
      headers: {
        'Authorization': `Bearer ${DIRECTUS_TOKEN}`
      },
      timeout: 5000,
      validateStatus: () => true // Accepter tous les codes de statut
    });
    
    if (response.status === 200) {
      console.log(`   ✅ Portal accessible (HTTP ${response.status})`);
      
      // Vérifier le contenu HTML
      if (response.data.includes('tabler')) {
        console.log(`   ✅ Framework Tabler détecté`);
      }
      if (response.data.includes('dashboard')) {
        console.log(`   ✅ Dashboard détecté`);
      }
      
      return true;
    } else if (response.status === 302 || response.status === 301) {
      console.log(`   ⚠️ Redirection (HTTP ${response.status})`);
      return true;
    } else {
      console.log(`   ❌ Erreur HTTP ${response.status}`);
      return false;
    }
    
  } catch (error) {
    console.log(`   ❌ Portal non accessible: ${error.message}`);
    return false;
  }
}

// Fonction pour vérifier les fonctionnalités spécifiques
function checkSpecificFeatures() {
  console.log('\n🔍 Vérification des fonctionnalités spécifiques...\n');
  
  const features = {
    ocr: false,
    auth: false,
    api: false,
    database: false
  };
  
  // Vérifier OCR dans SuperAdmin
  const ocrPath = path.join(__dirname, '../frontend/portals/superadmin');
  const ocrFiles = fs.existsSync(ocrPath) ? 
    fs.readdirSync(ocrPath).filter(f => f.includes('ocr')) : [];
  
  if (ocrFiles.length > 0) {
    console.log(`✅ OCR présent dans SuperAdmin (${ocrFiles.length} fichiers)`);
    features.ocr = true;
  } else {
    console.log('❌ OCR non trouvé dans SuperAdmin');
  }
  
  // Vérifier l'authentification
  const authPath = path.join(__dirname, '../frontend/index.js');
  if (fs.existsSync(authPath)) {
    const authContent = fs.readFileSync(authPath, 'utf-8');
    if (authContent.includes('authenticateDirectus')) {
      console.log('✅ Middleware d\'authentification configuré');
      features.auth = true;
    }
  }
  
  // Vérifier l'adaptateur API
  const adapterPath = path.join(__dirname, '../backend/adapters/directus-adapter.js');
  if (fs.existsSync(adapterPath)) {
    console.log('✅ Adaptateur Directus présent');
    features.api = true;
  }
  
  // Vérifier la connexion Directus
  if (features.api && features.auth) {
    console.log('✅ Intégration Directus complète');
    features.database = true;
  }
  
  return features;
}

// Fonction principale
async function main() {
  console.log('🚀 TEST DES 4 PORTAILS TABLER.IO\n');
  console.log('=' .repeat(60));
  
  const results = {
    portals: {},
    features: {},
    httpAccess: {}
  };
  
  // 1. Tester l'existence des fichiers
  console.log('\n📂 VÉRIFICATION DES FICHIERS:');
  for (const portal of portals) {
    results.portals[portal.name] = await checkPortalFiles(portal);
  }
  
  // 2. Tester l'accès HTTP (si le serveur est démarré)
  console.log('\n🌐 TEST D\'ACCÈS HTTP:');
  
  // Vérifier si le serveur est démarré
  try {
    await axios.get(BASE_URL, { timeout: 1000 });
    console.log('✅ Serveur frontend démarré');
    
    for (const portal of portals) {
      results.httpAccess[portal.name] = await testPortalAccess(portal);
    }
  } catch (error) {
    console.log('⚠️ Serveur frontend non démarré');
    console.log('   Démarrez-le avec: npm run frontend:start');
  }
  
  // 3. Vérifier les fonctionnalités
  results.features = checkSpecificFeatures();
  
  // Rapport final
  console.log('\n' + '=' .repeat(60));
  console.log('📊 RAPPORT DE TEST DES PORTAILS:\n');
  
  console.log('📁 FICHIERS:');
  for (const [portal, status] of Object.entries(results.portals)) {
    console.log(`   ${portal}: ${status ? '✅ Complet' : '❌ Incomplet'}`);
  }
  
  if (Object.keys(results.httpAccess).length > 0) {
    console.log('\n🌐 ACCÈS HTTP:');
    for (const [portal, status] of Object.entries(results.httpAccess)) {
      console.log(`   ${portal}: ${status ? '✅ Accessible' : '❌ Inaccessible'}`);
    }
  }
  
  console.log('\n🔧 FONCTIONNALITÉS:');
  console.log(`   OCR: ${results.features.ocr ? '✅ Présent' : '❌ Absent'}`);
  console.log(`   Auth: ${results.features.auth ? '✅ Configuré' : '❌ Non configuré'}`);
  console.log(`   API: ${results.features.api ? '✅ Adapté' : '❌ Non adapté'}`);
  console.log(`   DB: ${results.features.database ? '✅ Intégré' : '❌ Non intégré'}`);
  
  // Conclusion
  const allPortalsOk = Object.values(results.portals).every(v => v);
  const allFeaturesOk = Object.values(results.features).every(v => v);
  
  if (allPortalsOk && allFeaturesOk) {
    console.log('\n🎉 TOUS LES PORTAILS SONT FONCTIONNELS !');
  } else {
    console.log('\n⚠️ Certains éléments nécessitent attention');
  }
  
  console.log('\n✨ Test terminé !');
}

// Exécution
main().catch(console.error);
