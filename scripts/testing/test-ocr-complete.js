#!/usr/bin/env node

/**
 * Test complet du service OCR avec OpenAI Vision
 */

require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function testOCRConfiguration() {
  console.log('🚀 TEST COMPLET DE L\'OCR OPENAI VISION\n');
  console.log('=' .repeat(60));
  
  const results = {
    config: false,
    keyValid: false,
    modelAccess: false,
    serviceReady: false
  };
  
  // 1. Vérifier la configuration
  console.log('\n📋 1. VÉRIFICATION DE LA CONFIGURATION:');
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || 'gpt-4-vision-preview';
  
  if (apiKey && apiKey.startsWith('sk-')) {
    console.log('  ✅ Clé API présente et formatée correctement');
    console.log('  ✅ Modèle configuré:', model);
    console.log('  ✅ Max tokens:', process.env.OPENAI_MAX_TOKENS || '4096');
    console.log('  ✅ Temperature:', process.env.OPENAI_TEMPERATURE || '0.2');
    results.config = true;
  } else {
    console.log('  ❌ Clé API manquante ou invalide');
    return results;
  }
  
  // 2. Tester la validité de la clé
  console.log('\n📋 2. TEST DE LA CLÉ API:');
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'Test' }],
        max_tokens: 10
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );
    
    if (response.data.choices) {
      console.log('  ✅ Clé API valide et fonctionnelle');
      results.keyValid = true;
    }
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('  ❌ Clé API invalide (401 Unauthorized)');
    } else if (error.response?.status === 429) {
      console.log('  ⚠️ Limite de taux atteinte (429 Too Many Requests)');
      results.keyValid = true; // La clé est valide mais limite atteinte
    } else {
      console.log('  ❌ Erreur:', error.response?.data?.error?.message || error.message);
    }
  }
  
  // 3. Tester l'accès au modèle Vision
  console.log('\n📋 3. TEST DU MODÈLE VISION:');
  if (results.keyValid) {
    try {
      // Créer une image de test simple (base64)
      const testImage = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: model,
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: 'What is in this image?' },
                { type: 'image_url', image_url: { url: `data:image/png;base64,${testImage}` } }
              ]
            }
          ],
          max_tokens: 100
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 15000
        }
      );
      
      if (response.data.choices) {
        console.log('  ✅ Modèle Vision accessible');
        console.log('  ✅ Réponse reçue:', response.data.choices[0].message.content.substring(0, 50) + '...');
        results.modelAccess = true;
      }
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('  ❌ Modèle Vision non disponible avec cette clé');
      } else {
        console.log('  ❌ Erreur:', error.response?.data?.error?.message || error.message);
      }
    }
  }
  
  // 4. Vérifier l'intégration avec le service
  console.log('\n📋 4. VÉRIFICATION DU SERVICE OCR:');
  
  // Vérifier les fichiers OCR
  const ocrServicePath = path.join(__dirname, '../backend/ocr-service');
  const ocrFilesExist = fs.existsSync(ocrServicePath);
  
  if (ocrFilesExist) {
    console.log('  ✅ Service OCR présent');
    
    // Vérifier les fichiers critiques
    const criticalFiles = [
      'src/services/ocr-vision.service.js',
      'src/routes/ocr-vision.routes.js'
    ];
    
    criticalFiles.forEach(file => {
      const filePath = path.join(ocrServicePath, file);
      if (fs.existsSync(filePath)) {
        console.log(`  ✅ ${file} présent`);
      } else {
        console.log(`  ❌ ${file} manquant`);
      }
    });
    
    results.serviceReady = true;
  } else {
    console.log('  ❌ Service OCR non trouvé');
  }
  
  // Résumé final
  console.log('\n' + '=' .repeat(60));
  console.log('📊 RÉSUMÉ DU TEST OCR:\n');
  
  const allPassed = Object.values(results).every(v => v);
  
  console.log(`Configuration: ${results.config ? '✅' : '❌'}`);
  console.log(`Clé API valide: ${results.keyValid ? '✅' : '❌'}`);
  console.log(`Modèle Vision: ${results.modelAccess ? '✅' : '❌'}`);
  console.log(`Service prêt: ${results.serviceReady ? '✅' : '❌'}`);
  
  if (allPassed) {
    console.log('\n🎉 OCR OPENAI VISION 100% OPÉRATIONNEL !');
    console.log('\nVous pouvez maintenant:');
    console.log('1. Uploader des documents dans SuperAdmin');
    console.log('2. Extraire automatiquement les données avec GPT-4 Vision');
    console.log('3. Synchroniser avec Directus');
  } else {
    console.log('\n⚠️ Configuration incomplète');
    if (!results.keyValid) {
      console.log('\n❌ La clé API semble invalide ou expirée');
      console.log('Vérifiez votre clé sur: https://platform.openai.com/api-keys');
    }
    if (!results.modelAccess) {
      console.log('\n❌ Le modèle Vision n\'est pas accessible');
      console.log('Votre clé API doit avoir accès à GPT-4 Vision');
    }
  }
  
  return results;
}

// Exécuter le test
testOCRConfiguration().catch(console.error);
