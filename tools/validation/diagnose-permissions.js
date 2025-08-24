#!/usr/bin/env node

import axios from 'axios';

const API_URL = 'http://localhost:8055';
const TOKEN = 'e6Vt5LRHnYhq7-78yzoSxwdgjn2D6-JW';

async function diagnosePermissions() {
  console.log('🔍 DIAGNOSTIC DES PERMISSIONS DIRECTUS');
  console.log('='.repeat(60));
  
  const client = axios.create({
    baseURL: API_URL,
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json'
    }
  });
  
  try {
    // 1. Info utilisateur
    console.log('\n1️⃣ Utilisateur actuel:');
    const meRes = await client.get('/users/me');
    const user = meRes.data.data;
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    
    // 2. Permissions du rôle
    console.log('\n2️⃣ Permissions du rôle:');
    const permissionsRes = await client.get(`/permissions`, {
      params: {
        filter: { role: { _eq: user.role } },
        limit: -1
      }
    });
    
    const permissions = permissionsRes.data.data || [];
    console.log(`   Total permissions: ${permissions.length}`);
    
    // Analyser les permissions par collection
    const collectionPerms = {};
    permissions.forEach(perm => {
      if (!collectionPerms[perm.collection]) {
        collectionPerms[perm.collection] = [];
      }
      collectionPerms[perm.collection].push(perm.action);
    });
    
    // 3. Collections problématiques
    console.log('\n3️⃣ Permissions sur collections critiques:');
    const criticalCollections = ['companies', 'people', 'time_tracking'];
    
    criticalCollections.forEach(col => {
      const perms = collectionPerms[col] || [];
      console.log(`\n   ${col}:`);
      console.log(`     - read: ${perms.includes('read') ? '✅' : '❌'}`);
      console.log(`     - create: ${perms.includes('create') ? '✅' : '❌'}`);
      console.log(`     - update: ${perms.includes('update') ? '✅' : '❌'}`);
      console.log(`     - delete: ${perms.includes('delete') ? '✅' : '❌'}`);
    });
    
    // 4. Permissions sur les fields
    console.log('\n4️⃣ Permissions sur directus_fields:');
    const fieldPerms = collectionPerms['directus_fields'] || [];
    console.log(`   - read: ${fieldPerms.includes('read') ? '✅' : '❌'}`);
    console.log(`   - create: ${fieldPerms.includes('create') ? '✅' : '❌'}`);
    console.log(`   - update: ${fieldPerms.includes('update') ? '✅' : '❌'}`);
    console.log(`   - delete: ${fieldPerms.includes('delete') ? '✅' : '❌'}`);
    
    // 5. Test direct
    console.log('\n5️⃣ Test direct de création de field:');
    try {
      // Test sur une collection simple
      const testField = {
        collection: 'companies',
        field: 'test_perm_' + Date.now(),
        type: 'string',
        schema: { max_length: 10 }
      };
      
      await client.post('/fields/companies', testField);
      console.log('   ✅ Peut créer des fields!');
      
      // Nettoyer
      await client.delete(`/fields/companies/${testField.field}`);
      
    } catch (error) {
      console.log(`   ❌ Ne peut pas créer de fields: ${error.response?.status} - ${error.response?.data?.errors?.[0]?.message}`);
    }
    
    // 6. Recommandations
    console.log('\n💡 RECOMMANDATIONS:');
    console.log('   1. Connectez-vous à Directus Admin: http://localhost:8055/admin');
    console.log('   2. Allez dans Settings > Roles & Permissions');
    console.log('   3. Éditez le rôle de votre utilisateur');
    console.log('   4. Assurez-vous que:');
    console.log('      - Le rôle a "Admin Access" activé');
    console.log('      - Ou donnez les permissions CREATE/UPDATE sur toutes les collections');
    console.log('   5. Sauvegardez et relancez la migration');
    
  } catch (error) {
    console.error('❌ Erreur diagnostic:', error.message);
  }
}

diagnosePermissions().catch(console.error);