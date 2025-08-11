const axios = require('axios');

async function testOCRSecure() {
  console.log('🔍 Test OCR API sécurisée...');
  
  const headers = {
    'X-OCR-API-Key': 'ocr_secret_xY9kL3mN7pQ2wR5tV8bC4fG6hJ1aS0dE',
    'Content-Type': 'application/json'
  };
  
  try {
    // Test santé
    const health = await axios.get('http://localhost:3000/api/ocr/health', { headers });
    console.log('✅ Santé OCR:', health.data);
    
    // Test sans clé API (doit échouer)
    try {
      await axios.get('http://localhost:3000/api/ocr/health');
      console.log('❌ PROBLÈME: Accès sans clé autorisé !');
    } catch (error) {
      console.log('✅ Sécurité OK: Accès sans clé bloqué');
    }
    
    // Test création
    const pageData = {
      parent: { database_id: '226adb95-3c6f-8011-a9bb-ca31f7da8e6a' },
      properties: {
        'Document': { title: [{ text: { content: 'TEST OCR SÉCURISÉ' } }] }
      }
    };
    
    const create = await axios.post('http://localhost:3000/api/ocr/notion/pages', pageData, { headers });
    console.log('✅ Page créée:', create.data.id);
    
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
  }
}

testOCRSecure();