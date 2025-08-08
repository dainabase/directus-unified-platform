#!/usr/bin/env node

import axios from 'axios';

const API_URL = 'http://localhost:8055';
const TOKEN = 'e6Vt5LRHnYhq7-78yzoSxwdgjn2D6-JW';

async function checkCollections() {
  console.log('🔍 VÉRIFICATION DES COLLECTIONS');
  console.log('='.repeat(60));
  
  const client = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOKEN}`
    }
  });
  
  try {
    // Récupérer toutes les collections
    const response = await client.get('/collections');
    const allCollections = response.data?.data || [];
    
    // Filtrer les collections utilisateur
    const userCollections = allCollections
      .filter(col => !col.collection.startsWith('directus_'))
      .map(col => col.collection)
      .sort();
    
    console.log(`\n📊 Collections utilisateur (${userCollections.length}):`);
    userCollections.forEach(col => {
      console.log(`   - ${col}`);
    });
    
    // Collections qui n'existent pas
    const wantedCollections = [
      'companies', 'people', 'time_tracking', 'budgets', 'proposals',
      'quotes', 'support_tickets', 'orders', 'talents', 'activities',
      'notes', 'teams', 'comments', 'accounting_entries'
    ];
    
    console.log('\n🔍 Vérification des collections voulues:');
    const existing = [];
    const missing = [];
    
    wantedCollections.forEach(col => {
      if (userCollections.includes(col)) {
        existing.push(col);
        console.log(`   ✅ ${col} - existe`);
      } else {
        missing.push(col);
        console.log(`   ❌ ${col} - N'EXISTE PAS`);
      }
    });
    
    console.log(`\n📊 Résumé:`);
    console.log(`   Existent: ${existing.length}/${wantedCollections.length}`);
    console.log(`   Manquantes: ${missing.length}`);
    
    // Vérifier owner_company sur les collections existantes
    console.log('\n🔍 Vérification owner_company:');
    let withOwnerCompany = 0;
    let withoutOwnerCompany = [];
    
    for (const col of userCollections) {
      try {
        await client.get(`/fields/${col}/owner_company`);
        withOwnerCompany++;
      } catch (e) {
        if (e.response?.status === 404) {
          withoutOwnerCompany.push(col);
        }
      }
    }
    
    console.log(`\n✅ Collections avec owner_company: ${withOwnerCompany}`);
    console.log(`❌ Collections sans owner_company: ${withoutOwnerCompany.length}`);
    
    if (withoutOwnerCompany.length > 0 && withoutOwnerCompany.length <= 20) {
      console.log('\nCollections sans owner_company:');
      withoutOwnerCompany.forEach(col => {
        console.log(`   - ${col}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

checkCollections().catch(console.error);