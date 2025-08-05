#!/usr/bin/env node

const axios = require('axios');

const DIRECTUS_URL = 'http://localhost:8055';
const DIRECTUS_TOKEN = 'e6Vt5LRHnYhq7-78yzoSxwdgjn2D6-JW';

const directus = axios.create({
  baseURL: DIRECTUS_URL,
  headers: {
    'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

async function testPermissions() {
  console.log('🔍 TEST DES NOUVELLES PERMISSIONS');
  console.log('=' .repeat(60));
  
  try {
    // 1. Info utilisateur
    const me = await directus.get('/users/me');
    console.log(`\n👤 Utilisateur: ${me.data.data.email}`);
    
    // 2. Test création de champ
    console.log('\n🧪 Test création de champ dans companies...');
    try {
      await directus.post('/fields/companies', {
        field: 'test_field_' + Date.now(),
        type: 'string',
        meta: {
          interface: 'input'
        }
      });
      console.log('✅ PEUT créer des champs !');
    } catch (error) {
      console.log('❌ NE PEUT PAS créer de champs');
      console.log(`Erreur: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
    
    // 3. Test création de relation
    console.log('\n🔗 Test création de relation...');
    try {
      await directus.post('/relations', {
        collection: 'companies',
        field: 'test_relation_' + Date.now(),
        related_collection: 'people'
      });
      console.log('✅ PEUT créer des relations !');
    } catch (error) {
      console.log('❌ NE PEUT PAS créer de relations');
      console.log(`Erreur: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
    
    // 4. Test permissions admin
    console.log('\n🛡️  Test permissions admin...');
    try {
      const role = await directus.get(`/roles/${me.data.data.role}`);
      console.log(`Admin Access: ${role.data.data.admin_access ? '✅ OUI' : '❌ NON'}`);
      console.log(`App Access: ${role.data.data.app_access ? '✅ OUI' : '❌ NON'}`);
    } catch (e) {
      console.log('Impossible de vérifier le rôle');
    }
    
    console.log('\n' + '=' .repeat(60));
    console.log('📊 RÉSUMÉ');
    console.log('=' .repeat(60));
    
    console.log('\n💡 Si les permissions ont été changées :');
    console.log('1. Le token actuel peut encore utiliser les anciennes permissions (cache)');
    console.log('2. Solution : Créer un nouveau token API');
    console.log('3. Ou attendre quelques minutes que le cache expire');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

testPermissions();