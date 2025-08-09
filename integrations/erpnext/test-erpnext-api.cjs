const axios = require('axios');
const fs = require('fs');

// Charger les credentials
let credentials = {};
try {
  credentials = JSON.parse(fs.readFileSync('./erpnext-api-keys.json', 'utf8'));
} catch (e) {
  console.error('❌ Fichier de clés non trouvé');
  process.exit(1);
}

const { api_key, api_secret, url } = credentials;

// Configuration axios
const client = axios.create({
  baseURL: url || 'http://localhost:8083',
  headers: {
    'Authorization': `token ${api_key}:${api_secret}`,
    'Content-Type': 'application/json'
  }
});

// Test 1: Vérifier l'authentification
async function testAuth() {
  try {
    const response = await client.get('/api/method/frappe.auth.get_logged_user');
    console.log('✅ Authentification réussie:', response.data.message);
    return true;
  } catch (error) {
    console.error('❌ Erreur authentification:', error.message);
    return false;
  }
}

// Test 2: Test simple de connexion HTTP
async function testConnection() {
  try {
    const response = await client.get('/');
    console.log('✅ Connexion HTTP établie (status:', response.status, ')');
    return true;
  } catch (error) {
    if (error.response) {
      console.log('⚠️ ERPNext répond mais pas configuré (status:', error.response.status, ')');
      return true; // Considéré comme un succès car le service répond
    } else {
      console.error('❌ Erreur connexion:', error.message);
      return false;
    }
  }
}

// Test 3: Vérifier les containers Docker
async function testDockerStatus() {
  const { exec } = require('child_process');
  return new Promise((resolve) => {
    exec('docker ps | grep erpnext | wc -l', (error, stdout) => {
      const count = parseInt(stdout.trim());
      if (count > 0) {
        console.log(`✅ ${count} containers ERPNext actifs`);
        resolve(true);
      } else {
        console.log('❌ Aucun container ERPNext actif');
        resolve(false);
      }
    });
  });
}

// Exécuter les tests
async function runTests() {
  console.log('\n🔍 TEST DE L\'API ERPNEXT');
  console.log('========================\n');
  
  const tests = [
    { name: 'Containers Docker', fn: testDockerStatus },
    { name: 'Connexion HTTP', fn: testConnection },
    { name: 'Authentification API', fn: testAuth }
  ];
  
  let passed = 0;
  for (const test of tests) {
    console.log(`\n📝 Test: ${test.name}`);
    if (await test.fn()) passed++;
  }
  
  console.log('\n========================');
  console.log(`✅ Tests réussis: ${passed}/${tests.length}`);
  
  if (passed >= 2) {
    console.log('\n🎉 ERPNext partiellement fonctionnel - MCP peut être configuré !');
  } else {
    console.log('\n⚠️ ERPNext nécessite une configuration supplémentaire');
  }
}

runTests();