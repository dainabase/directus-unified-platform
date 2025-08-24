#!/usr/bin/env node

import axios from 'axios';

const API_URL = 'http://localhost:8055';
const TOKEN = 'e6Vt5LRHnYhq7-78yzoSxwdgjn2D6-JW';

// Collections à tester
const COLLECTIONS_TO_TEST = [
  'companies',
  'people',
  'time_tracking',
  'proposals',
  'quotes',
  'support_tickets',
  'orders',
  'talents',
  'activities',
  'notes',
  'teams'
];

async function testCollectionPermissions() {
  console.log('🔍 TEST DES PERMISSIONS PAR COLLECTION');
  console.log('='.repeat(60));
  
  const client = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOKEN}`
    }
  });
  
  const results = {
    canRead: [],
    cannotRead: [],
    canAddField: [],
    cannotAddField: [],
    hasOwnerCompany: [],
    noOwnerCompany: []
  };
  
  for (const collection of COLLECTIONS_TO_TEST) {
    console.log(`\n📦 Test de: ${collection}`);
    console.log('-'.repeat(40));
    
    // 1. Test lecture
    try {
      const response = await client.get(`/items/${collection}`, {
        params: { limit: 1 }
      });
      console.log(`  ✅ Peut lire la collection`);
      results.canRead.push(collection);
    } catch (error) {
      console.log(`  ❌ Ne peut pas lire: ${error.response?.status}`);
      results.cannotRead.push(collection);
    }
    
    // 2. Test existence owner_company
    try {
      await client.get(`/fields/${collection}/owner_company`);
      console.log(`  ℹ️  owner_company existe déjà`);
      results.hasOwnerCompany.push(collection);
      continue; // Passer au suivant
    } catch (error) {
      if (error.response?.status === 404) {
        console.log(`  ⚠️  owner_company n'existe pas`);
        results.noOwnerCompany.push(collection);
      }
    }
    
    // 3. Test ajout de field
    try {
      const testField = {
        field: 'test_perm_' + Date.now(),
        type: 'string',
        schema: { max_length: 10, is_nullable: true }
      };
      
      await client.post(`/fields/${collection}`, testField);
      console.log(`  ✅ Peut ajouter des fields`);
      results.canAddField.push(collection);
      
      // Nettoyer
      await client.delete(`/fields/${collection}/${testField.field}`);
      
    } catch (error) {
      console.log(`  ❌ Ne peut pas ajouter de field: ${error.response?.status}`);
      results.cannotAddField.push(collection);
    }
  }
  
  // Résumé
  console.log('\n\n' + '='.repeat(60));
  console.log('📊 RÉSUMÉ DES PERMISSIONS');
  console.log('='.repeat(60));
  
  console.log(`\n✅ Collections lisibles: ${results.canRead.length}/${COLLECTIONS_TO_TEST.length}`);
  if (results.canRead.length > 0) {
    console.log('   ' + results.canRead.join(', '));
  }
  
  console.log(`\n❌ Collections non lisibles: ${results.cannotRead.length}`);
  if (results.cannotRead.length > 0) {
    console.log('   ' + results.cannotRead.join(', '));
  }
  
  console.log(`\n✅ Peuvent recevoir des fields: ${results.canAddField.length}`);
  if (results.canAddField.length > 0) {
    console.log('   ' + results.canAddField.join(', '));
  }
  
  console.log(`\n❌ Ne peuvent pas recevoir de fields: ${results.cannotAddField.length}`);
  if (results.cannotAddField.length > 0) {
    console.log('   ' + results.cannotAddField.join(', '));
  }
  
  console.log(`\n📌 Ont déjà owner_company: ${results.hasOwnerCompany.length}`);
  if (results.hasOwnerCompany.length > 0) {
    console.log('   ' + results.hasOwnerCompany.join(', '));
  }
  
  console.log(`\n⚠️  N'ont pas owner_company: ${results.noOwnerCompany.length}`);
  if (results.noOwnerCompany.length > 0) {
    console.log('   ' + results.noOwnerCompany.join(', '));
  }
  
  // Recommandations
  console.log('\n💡 RECOMMANDATIONS:');
  if (results.cannotAddField.length > 0) {
    console.log('   ⚠️  Certaines collections nécessitent des permissions spécifiques');
    console.log('   → Vérifiez les permissions dans Directus Admin > Settings > Roles');
    console.log('   → Assurez-vous que le rôle a "Fields" permissions sur ces collections');
  }
  
  if (results.canAddField.length > 0) {
    console.log(`   ✅ Vous pouvez ajouter owner_company à: ${results.canAddField.join(', ')}`);
  }
}

testCollectionPermissions().catch(console.error);