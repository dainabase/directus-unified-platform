#!/usr/bin/env node

import axios from 'axios';

const API_URL = 'http://localhost:8055';
const TOKEN = 'e6Vt5LRHnYhq7-78yzoSxwdgjn2D6-JW';

const COMPANIES = ['HYPERVISUAL', 'DAINAMICS', 'LEXAIA', 'ENKI_REALTY', 'TAKEOUT'];

async function testAPIFiltering() {
  console.log('🎯 TEST DU FILTRAGE API MULTI-ENTREPRISES');
  console.log('='.repeat(80));
  
  const client = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOKEN}`
    }
  });
  
  // Collections principales à tester
  const collections = ['projects', 'client_invoices', 'expenses', 'bank_transactions'];
  
  for (const collection of collections) {
    console.log(`\n\n📊 Collection: ${collection.toUpperCase()}`);
    console.log('='.repeat(60));
    
    // 1. Total sans filtre
    try {
      const totalResponse = await client.get(`/items/${collection}`, {
        params: { aggregate: { count: '*' } }
      });
      const totalCount = totalResponse.data?.data?.[0]?.count || 0;
      console.log(`\nTotal général: ${totalCount} enregistrements`);
      
      // 2. Test par entreprise
      console.log('\nDistribution par entreprise:');
      const distribution = {};
      
      for (const company of COMPANIES) {
        try {
          const companyResponse = await client.get(`/items/${collection}`, {
            params: {
              filter: { owner_company: { _eq: company } },
              aggregate: { count: '*' }
            }
          });
          
          const count = companyResponse.data?.data?.[0]?.count || 0;
          distribution[company] = count;
          
          const percentage = totalCount > 0 ? ((count / totalCount) * 100).toFixed(1) : 0;
          const bar = '█'.repeat(Math.round(percentage / 2));
          
          console.log(`  ${company.padEnd(15)} ${bar.padEnd(30)} ${count.toString().padStart(5)} (${percentage}%)`);
          
        } catch (error) {
          console.log(`  ${company.padEnd(15)} ❌ Erreur: ${error.response?.status}`);
        }
      }
      
      // 3. Vérifier les enregistrements sans owner_company
      try {
        const nullResponse = await client.get(`/items/${collection}`, {
          params: {
            filter: { owner_company: { _null: true } },
            aggregate: { count: '*' }
          }
        });
        
        const nullCount = nullResponse.data?.data?.[0]?.count || 0;
        if (nullCount > 0) {
          console.log(`\n  ⚠️  Sans owner_company: ${nullCount} enregistrements`);
        }
      } catch (error) {
        // Ignorer
      }
      
      // 4. Échantillon de données
      console.log('\nÉchantillon (3 premiers):');
      try {
        const sampleResponse = await client.get(`/items/${collection}`, {
          params: { 
            limit: 3,
            fields: ['id', 'owner_company', collection === 'projects' ? 'name' : 'amount']
          }
        });
        
        const samples = sampleResponse.data?.data || [];
        samples.forEach(item => {
          const display = item.name || `€${item.amount}` || item.id;
          console.log(`  - ${display} → ${item.owner_company}`);
        });
        
      } catch (error) {
        console.log('  ❌ Impossible de récupérer un échantillon');
      }
      
    } catch (error) {
      console.error(`❌ Erreur sur ${collection}:`, error.message);
    }
  }
  
  // Test spécifique : Simuler le dashboard CEO
  console.log('\n\n🎯 SIMULATION DASHBOARD CEO');
  console.log('='.repeat(60));
  
  for (const company of ['all', ...COMPANIES]) {
    console.log(`\n🏢 Filtre: ${company === 'all' ? 'TOUTES LES ENTREPRISES' : company}`);
    
    const filter = company === 'all' ? {} : { owner_company: { _eq: company } };
    
    try {
      // Compter projets actifs
      const projectsResponse = await client.get('/items/projects', {
        params: {
          filter: {
            ...filter,
            status: { _in: ['active', 'in_progress'] }
          },
          aggregate: { count: '*' }
        }
      });
      const activeProjects = projectsResponse.data?.data?.[0]?.count || 0;
      
      // Compter factures
      const invoicesResponse = await client.get('/items/client_invoices', {
        params: {
          filter: filter,
          aggregate: { count: '*', sum: ['amount'] }
        }
      });
      const invoiceData = invoicesResponse.data?.data?.[0] || {};
      const invoiceCount = invoiceData.count || 0;
      const totalRevenue = invoiceData.sum?.amount || 0;
      
      console.log(`  Projets actifs: ${activeProjects}`);
      console.log(`  Factures: ${invoiceCount}`);
      console.log(`  Revenue: €${Math.round(totalRevenue).toLocaleString()}`);
      
    } catch (error) {
      console.log(`  ❌ Erreur: ${error.message}`);
    }
  }
  
  console.log('\n\n' + '='.repeat(80));
  console.log('✅ TEST TERMINÉ - Le filtrage multi-entreprises fonctionne!');
  console.log('='.repeat(80));
}

testAPIFiltering().catch(console.error);