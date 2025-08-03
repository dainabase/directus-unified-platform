/**
 * Script de test pour le service OCR
 */
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const OCR_SERVICE_URL = 'http://localhost:3001';
const API_URL = `${OCR_SERVICE_URL}/api/ocr`;

// Couleurs pour les logs
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`)
};

async function testOCR() {
  console.log('\n🧪 Démarrage des tests OCR...\n');

  // Test 1: Health check
  try {
    const health = await axios.get(`${OCR_SERVICE_URL}/health`);
    log.success(`Health check OK: ${health.data.status}`);
    log.info(`Version: ${health.data.version}`);
    log.info(`Services: ${JSON.stringify(health.data.services)}`);
  } catch (error) {
    log.error(`Health check échoué: ${error.message}`);
    return;
  }

  // Test 2: Langues supportées
  try {
    const languages = await axios.get(`${API_URL}/supported-languages`);
    log.success(`Langues supportées: ${languages.data.languages.map(l => l.name).join(', ')}`);
  } catch (error) {
    log.error(`Erreur langues: ${error.message}`);
  }

  // Test 3: Types de documents
  try {
    const types = await axios.get(`${API_URL}/document-types`);
    log.success(`Types de documents: ${types.data.types.map(t => t.label).join(', ')}`);
  } catch (error) {
    log.error(`Erreur types: ${error.message}`);
  }

  // Test 4: OCR sur image test
  await testOCRProcessing();
}

async function testOCRProcessing() {
  // Créer une image test avec texte
  const testImagePath = path.join(__dirname, 'test-invoice.jpg');
  
  if (!fs.existsSync(testImagePath)) {
    log.warn('Image test non trouvée. Création d\'une image test...');
    await createTestImage(testImagePath);
  }

  try {
    const form = new FormData();
    form.append('document', fs.createReadStream(testImagePath));
    form.append('documentType', 'invoice');
    form.append('enhance', 'true');

    log.info('Envoi de l\'image pour traitement OCR...');
    const startTime = Date.now();

    const response = await axios.post(`${API_URL}/process`, form, {
      headers: {
        ...form.getHeaders(),
        'Authorization': 'Bearer test-token' // Token de test
      }
    });

    const processingTime = Date.now() - startTime;
    const result = response.data;

    if (result.success) {
      log.success(`OCR terminé en ${processingTime}ms`);
      log.info(`Confiance: ${result.confidence}%`);
      log.info(`Texte extrait: ${result.rawText.substring(0, 100)}...`);
      
      if (result.structuredData) {
        log.success('Données structurées extraites:');
        console.log(JSON.stringify(result.structuredData, null, 2));
      }
    } else {
      log.error(`OCR échoué: ${result.error}`);
    }

  } catch (error) {
    if (error.response?.status === 401) {
      log.warn('Authentification requise. Utiliser un token JWT valide.');
    } else {
      log.error(`Erreur OCR: ${error.message}`);
    }
  }
}

async function createTestImage(imagePath) {
  // Créer une image test simple avec Canvas
  try {
    const { createCanvas } = require('canvas');
    const canvas = createCanvas(800, 600);
    const ctx = canvas.getContext('2d');

    // Fond blanc
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 800, 600);

    // Texte de facture
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText('FACTURE', 50, 50);
    ctx.font = '16px Arial';
    ctx.fillText('Hypervisual SA', 50, 100);
    ctx.fillText('CHE-123.456.789', 50, 130);
    ctx.fillText('contact@hypervisual.ch', 50, 160);
    ctx.fillText('Facture N° INV-2025-001', 50, 220);
    ctx.fillText('Date: 25.07.2025', 50, 250);
    ctx.fillText('Montant HT: CHF 1\'000.00', 50, 310);
    ctx.fillText('TVA 8.1%: CHF 81.00', 50, 340);
    ctx.fillText('Total: CHF 1\'081.00', 50, 370);

    // Sauvegarder
    const buffer = canvas.toBuffer('image/jpeg');
    fs.writeFileSync(imagePath, buffer);
    log.success('Image test créée');
  } catch (error) {
    log.warn('Canvas non disponible. Utiliser une vraie image de facture.');
  }
}

// Instructions
console.log(`
📋 Instructions pour tester le service OCR:

1. Démarrer Redis:
   docker run -d -p 6379:6379 redis:alpine

2. Démarrer le service OCR:
   cd ocr-service
   npm install
   npm start

3. Exécuter ce test:
   node test-ocr.js

Pour Docker:
   cd ocr-service
   docker-compose up -d
   node test-ocr.js
`);

// Attendre que le service soit prêt
setTimeout(() => {
  testOCR().catch(console.error);
}, 2000);