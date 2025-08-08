#!/usr/bin/env node

import axios from 'axios';

const API_URL = 'http://localhost:8055';

// Les deux tokens disponibles
const TOKENS = {
  'Token JMD': 'e6Vt5LRHnYhq7-78yzoSxwdgjn2D6-JW',
  'Token Admin .env': 'de366613eba7c0fa39d9e6c3ced8b0ac282fe7726741e44d9f04dd65ca67ca3c'
};

async function testTokenPermissions() {
  console.log('🔐 TEST DES PERMISSIONS APRÈS MODIFICATION');
  console.log('='.repeat(60));
  console.log(`Date: ${new Date().toISOString()}`);
  console.log('='.repeat(60));
  
  for (const [tokenName, token] of Object.entries(TOKENS)) {
    console.log(`\n\n📌 Test avec ${tokenName}`);
    console.log('-'.repeat(50));
    
    const client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    try {
      // 1. Test info utilisateur
      console.log('\n1️⃣ Test /users/me:');
      try {
        const meResponse = await client.get('/users/me');
        const user = meResponse.data?.data;
        console.log(`   ✅ Utilisateur: ${user.email} (Role: ${user.role})`);
      } catch (error) {
        console.log(`   ❌ Erreur: ${error.response?.status} - ${error.response?.data?.errors?.[0]?.message || error.message}`);
      }
      
      // 2. Test lecture collections
      console.log('\n2️⃣ Test lecture /collections:');
      try {
        const collectionsResponse = await client.get('/collections');
        const collections = collectionsResponse.data?.data || [];
        console.log(`   ✅ Peut lire ${collections.length} collections`);
      } catch (error) {
        console.log(`   ❌ Erreur: ${error.response?.status} - ${error.response?.data?.errors?.[0]?.message || error.message}`);
      }
      
      // 3. Test lecture fields
      console.log('\n3️⃣ Test lecture /fields/projects:');
      try {
        const fieldsResponse = await client.get('/fields/projects');
        const fields = fieldsResponse.data?.data || [];
        console.log(`   ✅ Peut lire ${fields.length} champs de la collection projects`);
      } catch (error) {
        console.log(`   ❌ Erreur: ${error.response?.status} - ${error.response?.data?.errors?.[0]?.message || error.message}`);
      }
      
      // 4. Test création de field (le plus important)
      console.log('\n4️⃣ Test création de field sur companies:');
      try {
        // D'abord vérifier si le champ existe
        try {
          await client.get('/fields/companies/test_permission_field');
          console.log('   ℹ️  Le champ test existe déjà, tentative de suppression...');
          await client.delete('/fields/companies/test_permission_field');
        } catch (e) {
          // Le champ n'existe pas, c'est OK
        }
        
        // Créer un champ de test
        const fieldConfig = {
          field: 'test_permission_field',
          type: 'string',
          schema: {
            max_length: 50,
            is_nullable: true
          },
          meta: {
            interface: 'input',
            hidden: true,
            note: 'Champ de test permissions - à supprimer'
          }
        };
        
        await client.post('/fields/companies', fieldConfig);
        console.log('   ✅ SUCCÈS! Peut créer des fields!');
        
        // Nettoyer
        await client.delete('/fields/companies/test_permission_field');
        console.log('   ✅ Champ de test supprimé');
        
      } catch (error) {
        console.log(`   ❌ ÉCHEC: ${error.response?.status} - ${error.response?.data?.errors?.[0]?.message || error.message}`);
      }
      
      // 5. Test spécifique owner_company
      console.log('\n5️⃣ Test ajout owner_company sur budgets:');
      try {
        const ownerCompanyField = {
          field: 'owner_company',
          type: 'string',
          schema: {
            max_length: 50,
            is_nullable: true,
            default_value: null
          },
          meta: {
            interface: 'select-dropdown',
            display: 'labels',
            display_options: {
              choices: [
                { text: 'HYPERVISUAL', value: 'HYPERVISUAL', foreground: '#FFFFFF', background: '#2196F3' },
                { text: 'DAINAMICS', value: 'DAINAMICS', foreground: '#FFFFFF', background: '#4CAF50' },
                { text: 'LEXAIA', value: 'LEXAIA', foreground: '#FFFFFF', background: '#FF9800' },
                { text: 'ENKI REALTY', value: 'ENKI_REALTY', foreground: '#FFFFFF', background: '#9C27B0' },
                { text: 'TAKEOUT', value: 'TAKEOUT', foreground: '#FFFFFF', background: '#F44336' }
              ]
            },
            width: 'half',
            note: 'Entreprise propriétaire'
          }
        };
        
        await client.post('/fields/budgets', ownerCompanyField);
        console.log('   ✅ SUCCÈS! owner_company ajouté à budgets!');
        
      } catch (error) {
        if (error.response?.data?.errors?.[0]?.message?.includes('already exists')) {
          console.log('   ℹ️  Le champ owner_company existe déjà sur budgets');
        } else {
          console.log(`   ❌ ÉCHEC: ${error.response?.status} - ${error.response?.data?.errors?.[0]?.message || error.message}`);
        }
      }
      
      // Résumé pour ce token
      console.log(`\n📊 Résumé ${tokenName}:`);
      console.log('   Si le test 4️⃣ ou 5️⃣ est ✅, les permissions sont OK!');
      
    } catch (error) {
      console.log(`\n❌ Erreur générale avec ${tokenName}: ${error.message}`);
    }
  }
  
  console.log('\n\n' + '='.repeat(60));
  console.log('✅ TEST TERMINÉ');
  console.log('='.repeat(60));
  console.log('\nSi au moins un token peut créer des fields (test 4️⃣), vous pouvez:');
  console.log('1. Exécuter: node src/backend/migrations/add-owner-company-all-collections.js');
  console.log('2. Ou utiliser: node add-owner-company-simplified.js');
}

testTokenPermissions().catch(console.error);