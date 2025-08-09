import axios from 'axios';

const INVOICE_NINJA_URL = 'http://localhost:8090';

async function testConnection() {
  console.log('🔌 Test de connexion à Invoice Ninja...\n');
  
  try {
    // Test 1: Accès simple
    console.log('1️⃣ Test accès HTTP');
    const response = await axios.get(`${INVOICE_NINJA_URL}/`, {
      timeout: 5000,
      validateStatus: () => true
    });
    console.log(`   Status: ${response.status}`);
    console.log(`   Headers:`, response.headers['content-type']);
    
    // Test 2: API
    console.log('\n2️⃣ Test API');
    try {
      const apiResponse = await axios.get(`${INVOICE_NINJA_URL}/api/v1/ping`, {
        timeout: 5000
      });
      console.log('   ✅ API accessible');
      console.log('   Setup requis:', apiResponse.data);
    } catch (error) {
      console.log('   ⚠️  API Error:', error.message);
    }
    
    // Test 3: Health check
    console.log('\n3️⃣ Test Health');
    try {
      const healthResponse = await axios.get(`${INVOICE_NINJA_URL}/api/v1/health`, {
        timeout: 5000
      });
      console.log('   ✅ Health check OK');
    } catch (error) {
      console.log('   ⚠️  Health Error:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
  }
}

testConnection();