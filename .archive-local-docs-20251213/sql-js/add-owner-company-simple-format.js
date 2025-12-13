#!/usr/bin/env node

import axios from 'axios';

const API_URL = 'http://localhost:8055';
const TOKEN = 'e6Vt5LRHnYhq7-78yzoSxwdgjn2D6-JW';

// Collections prioritaires
const PRIORITY_COLLECTIONS = [
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

async function addOwnerCompanySimple() {
  console.log('🚀 AJOUT OWNER_COMPANY - FORMAT SIMPLE');
  console.log('='.repeat(60));
  
  const client = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOKEN}`
    }
  });
  
  let successCount = 0;
  let existingCount = 0;
  let errorCount = 0;
  
  for (const collection of PRIORITY_COLLECTIONS) {
    console.log(`\n📦 ${collection}:`);
    
    try {
      // Vérifier si existe
      try {
        await client.get(`/fields/${collection}/owner_company`);
        console.log('  ℹ️  Existe déjà');
        existingCount++;
        continue;
      } catch (e) {
        if (e.response?.status !== 404) throw e;
      }
      
      // Format MINIMAL qui a fonctionné dans notre test
      const fieldConfig = {
        field: 'owner_company',
        type: 'string',
        meta: {
          interface: 'select-dropdown',
          options: {
            choices: [
              { text: 'HYPERVISUAL', value: 'HYPERVISUAL' },
              { text: 'DAINAMICS', value: 'DAINAMICS' },
              { text: 'LEXAIA', value: 'LEXAIA' },
              { text: 'ENKI REALTY', value: 'ENKI_REALTY' },
              { text: 'TAKEOUT', value: 'TAKEOUT' }
            ]
          },
          width: 'half'
        }
      };
      
      console.log('  🔄 Ajout du champ...');
      await client.post(`/fields/${collection}`, fieldConfig);
      console.log('  ✅ Succès!');
      successCount++;
      
    } catch (error) {
      console.log(`  ❌ Erreur: ${error.response?.data?.errors?.[0]?.message || error.message}`);
      errorCount++;
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 RÉSUMÉ:');
  console.log(`✅ Créés: ${successCount}`);
  console.log(`ℹ️  Existants: ${existingCount}`);
  console.log(`❌ Erreurs: ${errorCount}`);
  console.log(`\nTotal: ${successCount + existingCount}/${PRIORITY_COLLECTIONS.length}`);
}

addOwnerCompanySimple().catch(console.error);