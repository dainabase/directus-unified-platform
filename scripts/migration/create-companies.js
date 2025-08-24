#!/usr/bin/env node

import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const API_URL = 'http://localhost:8055';
const TOKEN = 'e6Vt5LRHnYhq7-78yzoSxwdgjn2D6-JW';

async function createCompaniesData() {
  console.log('🏢 Creating owner_companies data...');
  
  const companies = [
    {
      id: uuidv4(),
      code: 'HYPERVISUAL',
      name: 'HYPERVISUAL',
      type: 'main',
      color: '#2196F3',
      sort: 1,
      status: 'active',
      description: 'Entreprise principale - Solutions de visualisation et développement'
    },
    {
      id: uuidv4(),
      code: 'DAINAMICS',
      name: 'DAINAMICS', 
      type: 'subsidiary',
      color: '#4CAF50',
      sort: 2,
      status: 'active',
      description: 'Filiale spécialisée en data analytics et intelligence artificielle'
    },
    {
      id: uuidv4(),
      code: 'LEXAIA',
      name: 'LEXAIA',
      type: 'subsidiary',
      color: '#FF9800',
      sort: 3,
      status: 'active',
      description: 'Solutions juridiques et conformité réglementaire'
    },
    {
      id: uuidv4(),
      code: 'ENKI_REALTY',
      name: 'ENKI REALTY',
      type: 'subsidiary',
      color: '#9C27B0',
      sort: 4,
      status: 'active',
      description: 'Immobilier commercial et résidentiel'
    },
    {
      id: uuidv4(),
      code: 'TAKEOUT',
      name: 'TAKEOUT',
      type: 'subsidiary',
      color: '#F44336',
      sort: 5,
      status: 'active',
      description: 'Services de restauration et livraison'
    }
  ];

  let successCount = 0;
  
  for (const company of companies) {
    try {
      await axios.post(`${API_URL}/items/owner_companies`, company, {
        headers: { Authorization: `Bearer ${TOKEN}` }
      });
      console.log(`✅ Created ${company.name} (${company.code})`);
      successCount++;
    } catch (error) {
      if (error.response?.data?.errors?.[0]?.message.includes('duplicate')) {
        console.log(`⚠️ ${company.name} already exists`);
      } else {
        console.log(`❌ Error creating ${company.name}:`, error.response?.data?.errors?.[0]?.message || error.message);
      }
    }
  }

  console.log(`\n📊 Successfully created ${successCount}/${companies.length} companies`);
  
  // Vérifier le résultat
  try {
    const result = await axios.get(`${API_URL}/items/owner_companies`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });
    
    console.log(`\n✅ Total companies in database: ${result.data.data.length}`);
    result.data.data.forEach(company => {
      console.log(`   - ${company.name} (${company.code}) - ${company.color}`);
    });
  } catch (error) {
    console.error('❌ Could not verify companies:', error.message);
  }
}

createCompaniesData();