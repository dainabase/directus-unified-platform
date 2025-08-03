#!/usr/bin/env node

const axios = require('axios');

const DIRECTUS_URL = 'http://localhost:8055';
const NEW_TOKEN = 'jcmVznim7U5Rq2FIXrlgbSJ3U8ZlVcIw';
const OLD_TOKEN = 'hHKnrW949zcwx2372KH2AjwDyROAjgZ2';

async function testToken(token, name) {
  console.log(`\n🔍 Test du token ${name}...`);
  
  const directus = axios.create({
    baseURL: DIRECTUS_URL,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  try {
    // Test simple ping
    const ping = await directus.get('/server/ping');
    console.log('  ✅ Ping serveur : OK');
    
    // Test accès collections
    const collections = await directus.get('/collections');
    console.log(`  ✅ Accès collections : ${collections.data.data.length} collections`);
    
    // Test utilisateur
    const me = await directus.get('/users/me');
    console.log(`  ✅ Utilisateur : ${me.data.data.email || 'Inconnu'}`);
    console.log(`  ✅ Admin : ${me.data.data.role?.admin_access ? 'OUI' : 'NON'}`);
    
    return true;
  } catch (error) {
    console.log(`  ❌ Erreur : ${error.response?.status} - ${error.response?.statusText || error.message}`);
    if (error.response?.status === 401) {
      console.log('     Token invalide ou expiré');
    }
    return false;
  }
}

async function main() {
  console.log('🧪 TEST DES TOKENS DIRECTUS');
  console.log('=' .repeat(60));
  
  // Test nouveau token
  const newValid = await testToken(NEW_TOKEN, 'NOUVEAU');
  
  // Test ancien token
  const oldValid = await testToken(OLD_TOKEN, 'ANCIEN');
  
  console.log('\n' + '=' .repeat(60));
  console.log('📊 RÉSUMÉ');
  console.log('=' .repeat(60));
  
  if (newValid) {
    console.log('\n✅ Le nouveau token est valide ! Utilisons-le.');
  } else if (oldValid) {
    console.log('\n⚠️  Le nouveau token ne fonctionne pas.');
    console.log('✅ L\'ancien token fonctionne toujours.');
  } else {
    console.log('\n❌ Aucun token ne fonctionne !');
  }
}

main();