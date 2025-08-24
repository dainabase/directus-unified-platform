#!/usr/bin/env node

import axios from 'axios';

const API_URL = 'http://localhost:8055';
const TOKEN = 'e6Vt5LRHnYhq7-78yzoSxwdgjn2D6-JW';

async function testOwnerCompaniesCreation() {
  console.log('🏢 Testing owner_companies collection creation...');
  
  try {
    // 1. Vérifier si la collection existe déjà
    const collectionsResponse = await axios.get(`${API_URL}/collections`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });
    
    const ownerCompaniesExists = collectionsResponse.data.data.some(c => c.collection === 'owner_companies');
    
    if (ownerCompaniesExists) {
      console.log('✅ owner_companies collection already exists');
      
      // Vérifier les données
      const companiesResponse = await axios.get(`${API_URL}/items/owner_companies`, {
        headers: { Authorization: `Bearer ${TOKEN}` }
      });
      
      console.log(`📊 Found ${companiesResponse.data.data.length} companies:`);
      companiesResponse.data.data.forEach(company => {
        console.log(`   - ${company.name} (${company.code}) - ${company.color}`);
      });
    } else {
      console.log('⚠️ owner_companies collection does not exist - need to create it');
      
      // Créer la collection avec les données
      console.log('🚀 Creating owner_companies collection...');
      
      // Données des entreprises
      const companies = [
        {
          code: 'HYPERVISUAL',
          name: 'HYPERVISUAL',
          type: 'main',
          color: '#2196F3',
          sort: 1,
          status: 'active',
          description: 'Entreprise principale - Solutions de visualisation et développement'
        },
        {
          code: 'DAINAMICS',
          name: 'DAINAMICS', 
          type: 'subsidiary',
          color: '#4CAF50',
          sort: 2,
          status: 'active',
          description: 'Filiale spécialisée en data analytics et intelligence artificielle'
        },
        {
          code: 'LEXAIA',
          name: 'LEXAIA',
          type: 'subsidiary',
          color: '#FF9800',
          sort: 3,
          status: 'active',
          description: 'Solutions juridiques et conformité réglementaire'
        },
        {
          code: 'ENKI_REALTY',
          name: 'ENKI REALTY',
          type: 'subsidiary',
          color: '#9C27B0',
          sort: 4,
          status: 'active',
          description: 'Immobilier commercial et résidentiel'
        },
        {
          code: 'TAKEOUT',
          name: 'TAKEOUT',
          type: 'subsidiary',
          color: '#F44336',
          sort: 5,
          status: 'active',
          description: 'Services de restauration et livraison'
        }
      ];

      // Créer la collection avec l'API REST simple
      try {
        await axios.post(`${API_URL}/collections`, {
          collection: 'owner_companies',
          meta: {
            icon: 'business',
            color: '#2196F3'
          },
          schema: {},
          fields: [
            {
              field: 'id',
              type: 'uuid',
              schema: { is_primary_key: true },
              meta: { interface: 'input', readonly: true, hidden: true }
            },
            {
              field: 'code',
              type: 'string',
              schema: { max_length: 50, is_unique: true, is_nullable: false },
              meta: { interface: 'input', required: true }
            },
            {
              field: 'name', 
              type: 'string',
              schema: { max_length: 255, is_nullable: false },
              meta: { interface: 'input', required: true }
            },
            {
              field: 'type',
              type: 'string',
              schema: { max_length: 50, default_value: 'subsidiary' },
              meta: { interface: 'select-dropdown' }
            },
            {
              field: 'color',
              type: 'string', 
              schema: { max_length: 7, default_value: '#2196F3' },
              meta: { interface: 'select-color' }
            },
            {
              field: 'sort',
              type: 'integer',
              schema: { default_value: 1 },
              meta: { interface: 'input' }
            },
            {
              field: 'status',
              type: 'string',
              schema: { default_value: 'active' },
              meta: { interface: 'select-dropdown' }
            },
            {
              field: 'description',
              type: 'text',
              meta: { interface: 'input-multiline' }
            }
          ]
        }, {
          headers: { Authorization: `Bearer ${TOKEN}` }
        });
        
        console.log('✅ owner_companies collection created');
      } catch (createError) {
        console.log('⚠️ Collection creation error (might exist):', createError.response?.data?.errors?.[0]?.message || createError.message);
      }

      // Insérer les données
      for (const company of companies) {
        try {
          await axios.post(`${API_URL}/items/owner_companies`, company, {
            headers: { Authorization: `Bearer ${TOKEN}` }
          });
          console.log(`✅ Inserted ${company.name}`);
        } catch (insertError) {
          console.log(`⚠️ Insert ${company.name} error:`, insertError.response?.data?.errors?.[0]?.message || insertError.message);
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}

testOwnerCompaniesCreation();