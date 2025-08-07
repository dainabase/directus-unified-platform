// test-token.js
const TOKEN = 'dashboard-api-token-2025'; // Token actuel
const API_URL = 'http://localhost:8055';

async function testToken() {
  console.log('🔍 Test du token:', TOKEN);
  console.log('📡 API URL:', API_URL);
  console.log('\n');
  
  const collections = [
    'companies',
    'projects', 
    'client_invoices',
    'supplier_invoices',
    'payments',
    'subscriptions',
    'bank_transactions',
    'expenses',
    'deliverables',
    'people',
    'time_tracking'
  ];
  
  console.log('📋 Test des collections:');
  console.log('─'.repeat(50));
  
  for (const collection of collections) {
    try {
      const response = await fetch(`${API_URL}/items/${collection}?limit=1`, {
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${collection.padEnd(20)}: OK (${response.status}) - ${data.data?.length || 0} items`);
      } else {
        console.log(`❌ ${collection.padEnd(20)}: ERREUR ${response.status}`);
        const error = await response.text();
        try {
          const errorJson = JSON.parse(error);
          console.log(`   Message: ${errorJson.errors?.[0]?.message || error}`);
        } catch {
          console.log(`   Message: ${error.substring(0, 100)}...`);
        }
      }
    } catch (err) {
      console.log(`❌ ${collection.padEnd(20)}: ERREUR RÉSEAU`, err.message);
    }
  }
  
  console.log('\n📊 Test des agrégations:');
  console.log('─'.repeat(50));
  
  // Test des agrégations (utilisées par le dashboard)
  const aggregationTests = [
    { collection: 'companies', query: 'aggregate[count]=*' },
    { collection: 'projects', query: 'filter[status][_eq]=active&aggregate[count]=*' },
    { collection: 'client_invoices', query: 'aggregate[sum]=amount&aggregate[count]=*' }
  ];
  
  for (const test of aggregationTests) {
    try {
      const response = await fetch(`${API_URL}/items/${test.collection}?${test.query}`, {
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        console.log(`✅ Agrégation ${test.collection}: OK`);
      } else {
        console.log(`❌ Agrégation ${test.collection}: ERREUR ${response.status}`);
      }
    } catch (err) {
      console.log(`❌ Agrégation ${test.collection}: ERREUR`, err.message);
    }
  }
  
  // Test des permissions de l'utilisateur
  console.log('\n👤 Test du token utilisateur:');
  console.log('─'.repeat(50));
  
  try {
    const meResponse = await fetch(`${API_URL}/users/me`, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`
      }
    });
    
    if (meResponse.ok) {
      const user = await meResponse.json();
      console.log('✅ Token valide');
      console.log(`   Email: ${user.data.email}`);
      console.log(`   Rôle: ${user.data.role}`);
      console.log(`   Status: ${user.data.status}`);
      console.log(`   ID: ${user.data.id}`);
    } else {
      console.log('❌ Token invalide ou expiré');
      const error = await meResponse.text();
      console.log(`   Erreur: ${error}`);
    }
  } catch (err) {
    console.log('❌ Erreur de connexion à Directus:', err.message);
  }
  
  // Test des permissions du rôle
  console.log('\n🔐 Test des permissions:');
  console.log('─'.repeat(50));
  
  try {
    const permResponse = await fetch(`${API_URL}/permissions`, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`
      }
    });
    
    if (permResponse.ok) {
      const perms = await permResponse.json();
      console.log(`✅ ${perms.data?.length || 0} permissions trouvées`);
      
      // Compter les permissions par collection
      const permsByCollection = {};
      perms.data?.forEach(perm => {
        if (!permsByCollection[perm.collection]) {
          permsByCollection[perm.collection] = [];
        }
        permsByCollection[perm.collection].push(perm.action);
      });
      
      console.log('\nPermissions par collection:');
      Object.entries(permsByCollection).slice(0, 10).forEach(([coll, actions]) => {
        console.log(`   ${coll}: ${actions.join(', ')}`);
      });
    }
  } catch (err) {
    console.log('❌ Erreur permissions:', err.message);
  }
}

// Exécuter le test
testToken().then(() => {
  console.log('\n✅ Test terminé');
}).catch(err => {
  console.error('\n❌ Erreur fatale:', err);
});