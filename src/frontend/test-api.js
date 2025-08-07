// Test de connexion API Directus
const testAPI = async () => {
  console.log('🔧 Test de connexion API Directus...\n');
  
  const API_URL = 'http://localhost:8055';
  const TOKEN = 'dashboard-api-token-2025'; // Token du .env
  
  // Test 1: Ping serveur
  console.log('1️⃣ Test ping serveur...');
  try {
    const pingResponse = await fetch(`${API_URL}/server/ping`);
    if (pingResponse.ok) {
      console.log('✅ Serveur accessible');
    } else {
      console.log('❌ Serveur inaccessible:', pingResponse.status);
    }
  } catch (error) {
    console.error('❌ Erreur connexion:', error.message);
  }
  
  // Test 2: Collections sans auth
  console.log('\n2️⃣ Test accès collections (sans auth)...');
  try {
    const response = await fetch(`${API_URL}/items/companies`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Accès public autorisé');
      console.log('   Données reçues:', data);
    } else {
      console.log('❌ Accès refusé (code:', response.status + ')');
      console.log('   Besoin d\'authentification');
    }
  } catch (error) {
    console.error('❌ Erreur CORS ou réseau:', error.message);
  }
  
  // Test 3: Collections avec token
  console.log('\n3️⃣ Test accès avec token...');
  try {
    const response = await fetch(`${API_URL}/items/companies`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API connectée avec succès !');
      console.log('   Nombre d\'entreprises:', data.data?.length || 0);
    } else {
      console.log('❌ Token invalide ou expiré (code:', response.status + ')');
      const error = await response.text();
      console.log('   Erreur:', error);
    }
  } catch (error) {
    console.error('❌ CORS toujours bloqué:', error.message);
  }
  
  // Test 4: Vérifier les headers CORS
  console.log('\n4️⃣ Vérification headers CORS...');
  try {
    const response = await fetch(`${API_URL}/items/companies`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:5175',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type,Authorization'
      }
    });
    
    console.log('Headers CORS reçus:');
    console.log('- Access-Control-Allow-Origin:', response.headers.get('Access-Control-Allow-Origin'));
    console.log('- Access-Control-Allow-Methods:', response.headers.get('Access-Control-Allow-Methods'));
    console.log('- Access-Control-Allow-Headers:', response.headers.get('Access-Control-Allow-Headers'));
    console.log('- Access-Control-Allow-Credentials:', response.headers.get('Access-Control-Allow-Credentials'));
  } catch (error) {
    console.error('❌ Erreur OPTIONS:', error.message);
  }
  
  console.log('\n📝 Instructions:');
  console.log('1. Si CORS bloqué: Redémarrer Directus avec docker-compose down && docker-compose up -d');
  console.log('2. Si token invalide: Créer un nouveau token dans Directus Admin');
  console.log('3. Mettre à jour VITE_API_TOKEN dans .env.local');
};

// Exécuter le test
testAPI();