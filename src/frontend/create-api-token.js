// Script pour créer un token API Directus
const axios = require('axios');

const API_URL = 'http://localhost:8055';
const ADMIN_EMAIL = 'admin@dainabase.com';
const ADMIN_PASSWORD = 'YhI3FayWKfkrXcdYd7AuWQ==';

async function createAPIToken() {
  try {
    console.log('🔐 Connexion à Directus...');
    
    // 1. Login pour obtenir un access token temporaire
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    
    const { access_token, refresh_token } = loginResponse.data.data;
    console.log('✅ Connecté avec succès');
    
    // 2. Récupérer l'ID du rôle Administrator
    const rolesResponse = await axios.get(`${API_URL}/roles`, {
      headers: { Authorization: `Bearer ${access_token}` }
    });
    
    const adminRole = rolesResponse.data.data.find(role => role.name === 'Administrator');
    if (!adminRole) {
      throw new Error('Rôle Administrator non trouvé');
    }
    
    // 3. Créer un utilisateur API avec token statique
    const tokenValue = 'directus-dashboard-token-' + Date.now();
    
    const userResponse = await axios.post(`${API_URL}/users`, {
      email: `api-dashboard-${Date.now()}@dainabase.com`,
      password: 'unused-password-' + Math.random(),
      status: 'active',
      role: adminRole.id,
      token: tokenValue,
      first_name: 'API',
      last_name: 'Dashboard'
    }, {
      headers: { Authorization: `Bearer ${access_token}` }
    });
    
    console.log('✅ Token API créé avec succès !');
    console.log('\n📋 Copiez ce token dans .env.local :');
    console.log('─'.repeat(50));
    console.log(`VITE_API_TOKEN=${tokenValue}`);
    console.log('─'.repeat(50));
    console.log('\n🚀 Étapes suivantes :');
    console.log('1. Copiez le token ci-dessus');
    console.log('2. Mettez à jour VITE_API_TOKEN dans .env.local');
    console.log('3. Redémarrez le serveur de développement (npm run dev)');
    
  } catch (error) {
    console.error('❌ Erreur :', error.response?.data?.errors?.[0]?.message || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Le mot de passe admin a peut-être changé.');
      console.log('Vérifiez le fichier .env pour ADMIN_PASSWORD');
    }
  }
}

// Exécuter
createAPIToken();