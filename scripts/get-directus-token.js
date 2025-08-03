#!/usr/bin/env node

/**
 * Script pour obtenir un token d'accès Directus
 */

const axios = require('axios');

const DIRECTUS_URL = 'http://localhost:8055';

async function getToken() {
  console.log('🔐 Tentative d\'authentification avec Directus...\n');
  
  // Essayons les identifiants par défaut
  const credentials = [
    { email: 'admin@example.com', password: 'admin' },
    { email: 'admin@admin.com', password: 'admin' },
    { email: 'admin@directus.io', password: 'admin' },
    { email: 'admin@directus.local', password: 'd1r3ctu5' }
  ];
  
  for (const cred of credentials) {
    console.log(`Essai avec : ${cred.email}`);
    try {
      const response = await axios.post(`${DIRECTUS_URL}/auth/login`, {
        email: cred.email,
        password: cred.password
      });
      
      if (response.data.data.access_token) {
        console.log('\n✅ Authentification réussie !');
        console.log('🔑 Access Token:', response.data.data.access_token);
        console.log('\n📝 Utilisez ce token dans vos scripts');
        console.log('   Durée de validité: 15 minutes par défaut');
        return response.data.data.access_token;
      }
    } catch (error) {
      console.log(`   ❌ Échec avec ${cred.email}`);
    }
  }
  
  console.log('\n❌ Aucun identifiant par défaut ne fonctionne.');
  console.log('\n📝 Instructions :');
  console.log('1. Ouvrez http://localhost:8055/admin');
  console.log('2. Connectez-vous avec vos identifiants');
  console.log('3. Une fois connecté, ouvrez les DevTools (F12)');
  console.log('4. Allez dans l\'onglet Application/Storage → Local Storage');
  console.log('5. Cherchez la clé "auth" et copiez le access_token');
  console.log('\nOU');
  console.log('\n1. Dans Directus Admin, allez dans Settings');
  console.log('2. Créez un Static Access Token dans Users & Roles');
  console.log('3. Ce token n\'expire jamais');
}

getToken();