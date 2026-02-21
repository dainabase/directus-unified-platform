const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');
const path = require('path');

// Configuration
const OCR_SERVICE_URL = 'http://localhost:3001/api/ocr';
const CONCURRENT_REQUESTS = 10;
const TEST_ROUNDS = 3;

// Statistiques
const stats = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  totalTime: 0,
  minTime: Infinity,
  maxTime: 0,
  avgConfidence: 0
};

async function createTestInvoice(index) {
  const { createCanvas } = require('canvas');
  const canvas = createCanvas(800, 600);
  const ctx = canvas.getContext('2d');

  // Fond blanc
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, 800, 600);

  // Générer une facture unique
  ctx.fillStyle = 'black';
  ctx.font = 'bold 24px Arial';
  ctx.fillText('FACTURE', 50, 50);
  
  ctx.font = '16px Arial';
  ctx.fillText(`Fournisseur Test ${index}`, 50, 100);
  ctx.fillText(`CHE-${Math.floor(Math.random() * 900 + 100)}.${Math.floor(Math.random() * 900 + 100)}.${Math.floor(Math.random() * 900 + 100)}`, 50, 130);
  ctx.fillText('contact@test.ch', 50, 160);
  
  ctx.fillText(`Facture N° TEST-${Date.now()}-${index}`, 50, 220);
  ctx.fillText(`Date: ${new Date().toLocaleDateString('fr-CH')}`, 50, 250);
  
  const amount = Math.floor(Math.random() * 9000 + 1000);
  const vat = Math.round(amount * 0.081);
  const total = amount + vat;
  
  ctx.fillText(`Montant HT: CHF ${amount.toFixed(2)}`, 50, 310);
  ctx.fillText(`TVA 8.1%: CHF ${vat.toFixed(2)}`, 50, 340);
  ctx.font = 'bold 18px Arial';
  ctx.fillText(`Total: CHF ${total.toFixed(2)}`, 50, 380);

  const buffer = canvas.toBuffer('image/jpeg');
  const filename = `test-invoice-${index}.jpg`;
  fs.writeFileSync(filename, buffer);
  return filename;
}

async function processDocument(filename, index) {
  const startTime = Date.now();
  
  try {
    const form = new FormData();
    form.append('document', fs.createReadStream(filename));
    form.append('documentType', 'invoice');
    form.append('enhance', 'true');

    const response = await axios.post(`${OCR_SERVICE_URL}/process`, form, {
      headers: {
        ...form.getHeaders(),
        'Authorization': 'Bearer test-token'
      },
      timeout: 30000
    });

    const duration = Date.now() - startTime;
    const result = response.data;

    if (result.success) {
      stats.successfulRequests++;
      stats.totalTime += duration;
      stats.minTime = Math.min(stats.minTime, duration);
      stats.maxTime = Math.max(stats.maxTime, duration);
      stats.avgConfidence = (stats.avgConfidence + result.confidence) / 2;
      
      console.log(`✅ Document ${index} traité en ${duration}ms (Confiance: ${result.confidence}%)`);
      return { success: true, duration, confidence: result.confidence };
    } else {
      stats.failedRequests++;
      console.log(`❌ Document ${index} échoué: ${result.error}`);
      return { success: false, error: result.error };
    }

  } catch (error) {
    stats.failedRequests++;
    console.error(`❌ Erreur document ${index}:`, error.message);
    return { success: false, error: error.message };
  }
}

async function runLoadTest() {
  console.log('🚀 Démarrage du test de charge OCR...\n');
  console.log(`Configuration:`);
  console.log(`- Documents simultanés: ${CONCURRENT_REQUESTS}`);
  console.log(`- Rounds de test: ${TEST_ROUNDS}`);
  console.log(`- Total documents: ${CONCURRENT_REQUESTS * TEST_ROUNDS}\n`);

  // Créer les images de test
  console.log('📝 Création des factures de test...');
  const testFiles = [];
  for (let i = 0; i < CONCURRENT_REQUESTS; i++) {
    testFiles.push(await createTestInvoice(i));
  }

  // Exécuter les rounds de test
  for (let round = 1; round <= TEST_ROUNDS; round++) {
    console.log(`\n🔄 Round ${round}/${TEST_ROUNDS}`);
    const roundStart = Date.now();
    
    // Lancer toutes les requêtes en parallèle
    const promises = testFiles.map((file, idx) => 
      processDocument(file, idx + (round - 1) * CONCURRENT_REQUESTS)
    );
    
    const results = await Promise.all(promises);
    const roundDuration = Date.now() - roundStart;
    
    console.log(`⏱️  Round ${round} terminé en ${roundDuration}ms`);
    console.log(`   Moyenne par document: ${Math.round(roundDuration / CONCURRENT_REQUESTS)}ms`);
    
    stats.totalRequests += CONCURRENT_REQUESTS;
  }

  // Nettoyer les fichiers de test
  testFiles.forEach(file => {
    try {
      fs.unlinkSync(file);
    } catch (e) {}
  });

  // Afficher les statistiques
  displayStats();
}

function displayStats() {
  console.log('\n📊 RÉSULTATS DU TEST DE CHARGE');
  console.log('================================');
  console.log(`Total requêtes: ${stats.totalRequests}`);
  console.log(`✅ Succès: ${stats.successfulRequests} (${Math.round(stats.successfulRequests / stats.totalRequests * 100)}%)`);
  console.log(`❌ Échecs: ${stats.failedRequests} (${Math.round(stats.failedRequests / stats.totalRequests * 100)}%)`);
  console.log(`\n⏱️  PERFORMANCE`);
  console.log(`Temps total: ${stats.totalTime}ms`);
  console.log(`Temps moyen: ${Math.round(stats.totalTime / stats.successfulRequests)}ms`);
  console.log(`Temps min: ${stats.minTime}ms`);
  console.log(`Temps max: ${stats.maxTime}ms`);
  console.log(`\n🎯 PRÉCISION`);
  console.log(`Confiance moyenne: ${Math.round(stats.avgConfidence)}%`);
  console.log(`\n💪 CAPACITÉ`);
  console.log(`Throughput: ${Math.round(stats.successfulRequests / (stats.totalTime / 1000))} docs/sec`);
  console.log(`Capacité estimée: ${Math.round(stats.successfulRequests / (stats.totalTime / 1000) * 60)} docs/min`);
  
  // Recommandations
  console.log('\n💡 RECOMMANDATIONS');
  if (stats.avgConfidence < 90) {
    console.log('⚠️  Confiance < 90% - Améliorer la qualité des scans');
  }
  if (stats.failedRequests > stats.totalRequests * 0.05) {
    console.log('⚠️  Taux d\'échec > 5% - Vérifier la stabilité du service');
  }
  if (stats.maxTime > 5000) {
    console.log('⚠️  Temps max > 5s - Optimiser les performances');
  }
  if (stats.successfulRequests / (stats.totalTime / 1000) < 0.5) {
    console.log('⚠️  Throughput < 0.5 docs/sec - Augmenter les workers');
  }
}

// Vérifier les dépendances
async function checkDependencies() {
  const dependencies = ['axios', 'form-data', 'canvas'];
  const missing = [];
  
  for (const dep of dependencies) {
    try {
      require(dep);
    } catch (e) {
      missing.push(dep);
    }
  }
  
  if (missing.length > 0) {
    console.log('📦 Installation des dépendances manquantes...');
    console.log(`npm install ${missing.join(' ')}`);
    process.exit(1);
  }
}

// Main
(async () => {
  await checkDependencies();
  
  // Vérifier que le service est disponible
  try {
    const health = await axios.get('http://localhost:3001/health');
    console.log('✅ Service OCR disponible\n');
  } catch (error) {
    console.error('❌ Service OCR non disponible sur http://localhost:3001');
    console.log('Démarrez le service avec: docker-compose up -d');
    process.exit(1);
  }
  
  await runLoadTest();
})();