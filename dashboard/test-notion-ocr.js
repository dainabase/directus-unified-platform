const axios = require('axios');

async function testOCR() {
  console.log('🔍 Test OCR API...');
  
  try {
    // Test connexion
    const testResponse = await axios.get('http://localhost:3000/api/notion/test-ocr');
    console.log('✅ Test connexion:', testResponse.data);
    
    // Test création page
    const pageData = {
      parent: { database_id: '226adb95-3c6f-8011-a9bb-ca31f7da8e6a' },
      properties: {
        'Document': { title: [{ text: { content: 'TEST OCR DIRECT' } }] },
        'Type': { select: { name: 'Facture' } },
        'Statut': { select: { name: 'Brouillon' } }
      }
    };
    
    const createResponse = await axios.post('http://localhost:3000/api/notion/pages', pageData);
    console.log('✅ Page créée:', createResponse.data.id);
    
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
  }
}

testOCR();