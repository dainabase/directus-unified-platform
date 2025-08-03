#!/usr/bin/env node

const axios = require('axios');

const DIRECTUS_URL = 'http://localhost:8055';

async function getNewToken() {
  console.log('🔐 Tentative d\'obtention d\'un nouveau token...\n');
  
  try {
    // Essayer de se connecter avec les identifiants admin
    const response = await axios.post(`${DIRECTUS_URL}/auth/login`, {
      email: 'admin@dainabase.com',
      password: 'admin' // Mot de passe par défaut, à ajuster si nécessaire
    });
    
    if (response.data.data.access_token) {
      console.log('✅ Connexion réussie !');
      console.log('\n📝 Nouveau token :');
      console.log(response.data.data.access_token);
      console.log('\n💾 Refresh token :');
      console.log(response.data.data.refresh_token);
      
      // Tester le token
      const directus = axios.create({
        baseURL: DIRECTUS_URL,
        headers: {
          'Authorization': `Bearer ${response.data.data.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const me = await directus.get('/users/me');
      console.log(`\n👤 Utilisateur : ${me.data.data.email}`);
      console.log(`🔑 Rôle : ${me.data.data.role?.name || me.data.data.role}`);
      console.log(`🛡️  Admin : ${me.data.data.role?.admin_access ? 'OUI' : 'NON'}`);
      
      return response.data.data.access_token;
    }
  } catch (error) {
    console.log('❌ Erreur de connexion :', error.response?.data?.errors?.[0]?.message || error.message);
    console.log('\n💡 Solutions possibles :');
    console.log('1. Vérifier les identifiants (email/mot de passe)');
    console.log('2. Se connecter manuellement à http://localhost:8055');
    console.log('3. Créer un token statique via l\'interface admin');
  }
}

getNewToken();