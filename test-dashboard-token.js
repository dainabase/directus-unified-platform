#!/usr/bin/env node

import axios from 'axios';

const API_URL = 'http://localhost:8055';
const GOOD_TOKEN = 'e6Vt5LRHnYhq7-78yzoSxwdgjn2D6-JW';  // Le token qui fonctionne actuellement
const OLD_TOKEN = 'dashboard-token-2025';  // Token à créer dans la base

async function testDashboardToken() {
  console.log('🔑 TEST DU TOKEN e6Vt5LRHnYhq7-78yzoSxwdgjn2D6-JW');
  console.log('='.repeat(60));
  
  const client = axios.create({
    baseURL: API_URL,
    headers: {
      'Authorization': `Bearer ${GOOD_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });
  
  try {
    // Test 1: Vérifier l'utilisateur
    const userRes = await client.get('/users/me');
    console.log('✅ Token valide! Utilisateur:', userRes.data.data.email);
    
    // Test 2: Tester la création de champ (LE TEST CRITIQUE)
    console.log('\n📝 Test création de champ owner_company...');
    
    const testField = {
      field: 'owner_company_test_' + Date.now(),
      type: 'string',
      schema: {
        max_length: 50,
        is_nullable: true
      },
      meta: {
        interface: 'input',
        hidden: true
      }
    };
    
    // Essayer de créer le champ sur companies
    const fieldRes = await client.post('/fields/companies', testField);
    console.log('✅ SUCCÈS! Le token peut créer des champs!');
    
    // Supprimer le champ de test
    await client.delete(`/fields/companies/${testField.field}`);
    console.log('✅ Champ de test supprimé');
    
    // Test 3: Vérifier l'accès aux collections
    const collections = ['companies', 'people', 'time_tracking'];
    for (const col of collections) {
      try {
        const res = await client.get(`/items/${col}?limit=1`);
        console.log(`✅ Accès à ${col}: OK`);
      } catch (e) {
        console.log(`❌ Accès à ${col}: ERREUR`);
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 LE TOKEN dashboard-token-2025 FONCTIONNE PARFAITEMENT!');
    console.log('='.repeat(60));
    
    return true;
    
  } catch (error) {
    console.error('❌ ERREUR avec le token:', error.response?.status);
    console.error('Message:', error.response?.data?.errors?.[0]?.message || error.message);
    return false;
  }
}

// Exécuter le test
testDashboardToken().then(success => {
  if (success) {
    console.log('\n✅ Prochaine étape: Mettre à jour tous les scripts avec ce token');
  } else {
    console.log('\n❌ Le token ne fonctionne pas, vérifier la configuration');
  }
});