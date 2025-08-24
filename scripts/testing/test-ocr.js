#!/usr/bin/env node

/**
 * Script de test de l'OCR OpenAI Vision
 * Vérifie que le service OCR fonctionne correctement
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Configuration
const OCR_SERVICE_URL = 'http://localhost:3001'; // Port du service OCR
const DIRECTUS_TOKEN = 'e6Vt5LRHnYhq7-78yzoSxwdgjn2D6-JW';

// Fonction pour vérifier la santé du service OCR
async function checkOCRHealth() {
  try {
    console.log('🔍 Vérification du service OCR...');
    
    const response = await axios.get(`${OCR_SERVICE_URL}/api/health`, {
      timeout: 5000
    });
    
    if (response.data.status === 'healthy') {
      console.log('✅ Service OCR opérationnel');
      console.log(`   Version: ${response.data.version}`);
      console.log(`   OpenAI configuré: ${response.data.openai?.configured ? 'Oui' : 'Non'}`);
      return true;
    } else {
      console.log('⚠️ Service OCR en état dégradé');
      return false;
    }
  } catch (error) {
    console.error('❌ Service OCR non accessible:', error.message);
    return false;
  }
}

// Fonction pour tester l'extraction OCR
async function testOCRExtraction() {
  try {
    console.log('\n📄 Test d\'extraction OCR...');
    
    // Créer une image de test
    const testImagePath = path.join(__dirname, 'test-ocr-image.png');
    
    // Vérifier si une image de test existe
    if (!fs.existsSync(testImagePath)) {
      console.log('   ⚠️ Pas d\'image de test disponible');
      console.log('   💡 Créez test-ocr-image.png dans le dossier scripts/');
      return false;
    }
    
    // Préparer la requête multipart
    const form = new FormData();
    form.append('document', fs.createReadStream(testImagePath));
    form.append('documentType', 'facture');
    form.append('language', 'fr');
    
    // Envoyer la requête OCR
    const response = await axios.post(
      `${OCR_SERVICE_URL}/api/ocr/vision/process`,
      form,
      {
        headers: {
          ...form.getHeaders(),
          'Authorization': `Bearer ${DIRECTUS_TOKEN}`
        },
        timeout: 30000 // 30 secondes pour le traitement OCR
      }
    );
    
    if (response.data.success) {
      console.log('✅ Extraction OCR réussie !');
      console.log('   Données extraites:');
      console.log(JSON.stringify(response.data.data, null, 2).substring(0, 500) + '...');
      return true;
    } else {
      console.log('❌ Échec de l\'extraction OCR');
      console.log('   Message:', response.data.message);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test OCR:', error.response?.data || error.message);
    return false;
  }
}

// Fonction pour vérifier la configuration OpenAI
async function checkOpenAIConfig() {
  try {
    console.log('\n🔑 Vérification de la configuration OpenAI...');
    
    // Lire le fichier de configuration
    const configPath = path.join(__dirname, '../backend/config/api-keys.js');
    
    if (fs.existsSync(configPath)) {
      const config = require(configPath);
      
      if (config.OPENAI_API_KEY && config.OPENAI_API_KEY !== 'your-openai-api-key-here') {
        console.log('✅ Clé API OpenAI configurée');
        
        // Vérifier que la clé commence par sk-
        if (config.OPENAI_API_KEY.startsWith('sk-')) {
          console.log('   Format de clé valide');
        } else {
          console.log('   ⚠️ Format de clé inhabituel');
        }
        
        return true;
      } else {
        console.log('❌ Clé API OpenAI non configurée');
        console.log('   Configurez OPENAI_API_KEY dans backend/config/api-keys.js');
        return false;
      }
    } else {
      console.log('❌ Fichier de configuration non trouvé');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.message);
    return false;
  }
}

// Fonction pour tester l'intégration complète
async function testFullIntegration() {
  console.log('\n🔗 Test d\'intégration complète OCR → Directus...');
  
  try {
    // Simuler un document extrait
    const extractedData = {
      documentType: 'facture',
      numero: 'INV-2025-001',
      date: '2025-08-03',
      montant: 1500.00,
      client: 'Test Company',
      items: [
        { description: 'Service OCR', quantity: 1, price: 1500.00 }
      ]
    };
    
    // Envoyer vers Directus
    const response = await axios.post(
      'http://localhost:8055/items/client_invoices',
      {
        invoice_number: extractedData.numero,
        date: extractedData.date,
        amount: extractedData.montant,
        status: 'draft',
        ocr_extracted: true,
        ocr_data: JSON.stringify(extractedData)
      },
      {
        headers: {
          'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Intégration Directus réussie');
    console.log(`   Facture créée: ID ${response.data.data.id}`);
    return true;
    
  } catch (error) {
    console.error('❌ Erreur d\'intégration:', error.response?.data?.errors?.[0]?.message || error.message);
    return false;
  }
}

// Fonction principale
async function main() {
  console.log('🚀 TEST COMPLET DU SERVICE OCR\n');
  console.log('=' .repeat(60));
  
  const results = {
    health: false,
    config: false,
    extraction: false,
    integration: false
  };
  
  // 1. Vérifier la santé du service
  results.health = await checkOCRHealth();
  
  // 2. Vérifier la configuration OpenAI
  results.config = await checkOpenAIConfig();
  
  // 3. Tester l'extraction OCR (si service disponible)
  if (results.health && results.config) {
    results.extraction = await testOCRExtraction();
  }
  
  // 4. Tester l'intégration Directus
  results.integration = await testFullIntegration();
  
  // Rapport final
  console.log('\n' + '=' .repeat(60));
  console.log('📊 RAPPORT DE TEST OCR:\n');
  
  console.log(`🔍 Service OCR: ${results.health ? '✅ OK' : '❌ KO'}`);
  console.log(`🔑 Config OpenAI: ${results.config ? '✅ OK' : '❌ KO'}`);
  console.log(`📄 Extraction OCR: ${results.extraction ? '✅ OK' : '❌ KO'}`);
  console.log(`🔗 Intégration Directus: ${results.integration ? '✅ OK' : '❌ KO'}`);
  
  const allPassed = Object.values(results).every(r => r);
  
  if (allPassed) {
    console.log('\n🎉 TOUS LES TESTS OCR SONT PASSÉS !');
    console.log('Le service OCR est 100% fonctionnel.');
  } else {
    console.log('\n⚠️ Certains tests ont échoué.');
    console.log('Vérifiez les points suivants:');
    
    if (!results.health) {
      console.log('   • Démarrez le service OCR: npm run ocr:start');
    }
    if (!results.config) {
      console.log('   • Configurez la clé OpenAI dans backend/config/api-keys.js');
    }
    if (!results.extraction) {
      console.log('   • Créez une image test dans scripts/test-ocr-image.png');
    }
    if (!results.integration) {
      console.log('   • Vérifiez que Directus est démarré et accessible');
    }
  }
  
  console.log('\n✨ Test terminé !');
  process.exit(allPassed ? 0 : 1);
}

// Exécution
main().catch(error => {
  console.error('Erreur fatale:', error);
  process.exit(1);
});
