#!/usr/bin/env node

import axios from 'axios';
import { OWNER_COMPANIES } from '../../frontend/src/utils/company-filter.js';

const API_URL = 'http://localhost:8055';
const TOKEN = 'e6Vt5LRHnYhq7-78yzoSxwdgjn2D6-JW';

const COMPANIES = Object.keys(OWNER_COMPANIES);

// Collections à tester (celles qui ont des données)
const collectionsToTest = [
  'projects',
  'client_invoices', 
  'supplier_invoices',
  'expenses',
  'bank_transactions',
  'deliverables',
  'time_tracking',
  'budgets',
  'subscriptions',
  'contracts',
  'support_tickets',
  'quotes',
  'proposals',
  'activities',
  'notifications'
];

async function testOwnerCompanyFiltering() {
  console.log('🧪 TESTING OWNER_COMPANY FILTERING SYSTEM');
  console.log('==========================================\n');
  
  const results = {
    collections: {},
    summary: {
      totalCollections: 0,
      workingCollections: 0,
      emptyCollections: 0,
      errorCollections: 0,
      totalItems: 0,
      filteredItems: {}
    }
  };

  for (const collection of collectionsToTest) {
    console.log(`\n📊 Testing ${collection}:`);
    console.log('-'.repeat(50));
    
    results.collections[collection] = {
      total: 0,
      byCompany: {},
      withoutOwner: 0,
      error: null
    };
    
    results.summary.totalCollections++;
    
    try {
      // Test 1: Compter total sans filtre
      const allResponse = await axios.get(`${API_URL}/items/${collection}`, {
        headers: { Authorization: `Bearer ${TOKEN}` },
        params: {
          aggregate: { count: '*' }
        }
      });
      
      const totalCount = allResponse.data?.data?.[0]?.count || 0;
      results.collections[collection].total = totalCount;
      results.summary.totalItems += totalCount;
      
      console.log(`   Total items: ${totalCount}`);
      
      if (totalCount === 0) {
        console.log('   ⚠️ Empty collection - skipping');
        results.summary.emptyCollections++;
        continue;
      }
      
      results.summary.workingCollections++;
      
      // Test 2: Compter par entreprise
      let totalFiltered = 0;
      for (const company of COMPANIES) {
        try {
          const filteredResponse = await axios.get(`${API_URL}/items/${collection}`, {
            headers: { Authorization: `Bearer ${TOKEN}` },
            params: {
              filter: {
                owner_company: { _eq: company }
              },
              aggregate: { count: '*' }
            }
          });
          
          const count = filteredResponse.data?.data?.[0]?.count || 0;
          results.collections[collection].byCompany[company] = count;
          totalFiltered += count;
          
          if (count > 0) {
            console.log(`   ${company}: ${count} items`);
            
            if (!results.summary.filteredItems[company]) {
              results.summary.filteredItems[company] = 0;
            }
            results.summary.filteredItems[company] += count;
          }
        } catch (companyError) {
          console.log(`   ❌ Error filtering ${company}:`, companyError.message);
          results.collections[collection].byCompany[company] = -1;
        }
      }
      
      // Test 3: Vérifier les items sans owner_company
      try {
        const nullResponse = await axios.get(`${API_URL}/items/${collection}`, {
          headers: { Authorization: `Bearer ${TOKEN}` },
          params: {
            filter: {
              owner_company: { _null: true }
            },
            aggregate: { count: '*' }
          }
        });
        
        const nullCount = nullResponse.data?.data?.[0]?.count || 0;
        results.collections[collection].withoutOwner = nullCount;
        
        if (nullCount > 0) {
          console.log(`   ⚠️ WITHOUT owner_company: ${nullCount} items`);
        }
        
        // Vérification de cohérence
        const expectedTotal = totalFiltered + nullCount;
        if (Math.abs(expectedTotal - totalCount) > 1) {
          console.log(`   ⚠️ INCONSISTENCY: Total=${totalCount}, Filtered+Null=${expectedTotal}`);
        }
      } catch (nullError) {
        console.log(`   ❌ Error checking null owner_company:`, nullError.message);
      }
      
    } catch (error) {
      console.log(`   ❌ ERROR: ${error.message}`);
      results.collections[collection].error = error.message;
      results.summary.errorCollections++;
    }
    
    // Petit délai pour éviter de surcharger l'API
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Tester aussi owner_companies elle-même
  console.log('\n🏢 Testing owner_companies collection:');
  console.log('-'.repeat(50));
  
  try {
    const companiesResponse = await axios.get(`${API_URL}/items/owner_companies`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });
    
    const companies = companiesResponse.data?.data || [];
    console.log(`   Found ${companies.length} owner companies:`);
    
    companies.forEach(company => {
      console.log(`   - ${company.name} (${company.code}) - ${company.status}`);
    });
    
    // Vérifier qu'on a bien nos 5 entreprises
    const expectedCodes = Object.keys(OWNER_COMPANIES);
    const actualCodes = companies.map(c => c.code);
    const missingCodes = expectedCodes.filter(code => !actualCodes.includes(code));
    
    if (missingCodes.length > 0) {
      console.log(`   ⚠️ Missing companies: ${missingCodes.join(', ')}`);
    } else {
      console.log('   ✅ All expected companies found');
    }
    
  } catch (error) {
    console.log(`   ❌ Error testing owner_companies: ${error.message}`);
  }

  // Afficher le résumé final
  console.log('\n' + '='.repeat(60));
  console.log('📊 FILTERING TEST SUMMARY:');
  console.log('='.repeat(60));
  console.log(`Collections tested: ${results.summary.totalCollections}`);
  console.log(`Working collections: ${results.summary.workingCollections}`);
  console.log(`Empty collections: ${results.summary.emptyCollections}`);
  console.log(`Error collections: ${results.summary.errorCollections}`);
  console.log(`Total items across all collections: ${results.summary.totalItems}`);
  
  console.log('\nItems by company:');
  for (const [company, count] of Object.entries(results.summary.filteredItems)) {
    const percentage = results.summary.totalItems > 0 ? 
      ((count / results.summary.totalItems) * 100).toFixed(1) : 0;
    console.log(`  ${company}: ${count} items (${percentage}%)`);
  }
  
  // Recommandations
  console.log('\n📋 RECOMMENDATIONS:');
  if (results.summary.errorCollections > 0) {
    console.log('❌ Fix collections with errors');
  }
  
  const totalFilteredItems = Object.values(results.summary.filteredItems)
    .reduce((sum, count) => sum + count, 0);
  
  if (totalFilteredItems < results.summary.totalItems * 0.8) {
    console.log('⚠️ Many items lack owner_company - run data migration');
  }
  
  if (results.summary.workingCollections > 0) {
    console.log('✅ Company filtering is working!');
  }
  
  console.log('\n✅ Testing completed!');
  
  return results;
}

// Exécuter si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  testOwnerCompanyFiltering().catch(error => {
    console.error('💥 Test failed:', error);
    process.exit(1);
  });
}