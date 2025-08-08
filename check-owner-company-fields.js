#!/usr/bin/env node

import axios from 'axios';

const API_URL = 'http://localhost:8055';
const TOKEN = 'e6Vt5LRHnYhq7-78yzoSxwdgjn2D6-JW';

// Collections déjà confirmées avec owner_company
const COLLECTIONS_WITH_OWNER_COMPANY = [
  'projects',
  'client_invoices',
  'supplier_invoices',
  'expenses',
  'bank_transactions',
  'deliverables',
  'subscriptions',
  'contracts',
  'payments',
  'kpis'
];

// Collections à vérifier
const COLLECTIONS_TO_CHECK = [
  'companies',
  'people',
  'time_tracking',
  'budgets',
  'proposals',
  'quotes',
  'support_tickets',
  'orders',
  'talents',
  'interactions',
  'activities',
  'notes',
  'comments',
  'accounting_entries',
  'reconciliations',
  'credits',
  'debits',
  'refunds',
  'returns',
  'content_calendar',
  'events',
  'teams',
  'departments',
  'skills',
  'approvals',
  'audit_logs',
  'company_people',
  'compliance',
  'customer_success',
  'deliveries',
  'evaluations',
  'goals',
  'notifications',
  'permissions',
  'projects_team',
  'providers',
  'roles',
  'settings',
  'tags',
  'talents_simple',
  'trainings',
  'workflows'
];

async function checkCollections() {
  console.log('🔍 VÉRIFICATION DES CHAMPS OWNER_COMPANY');
  console.log('========================================\n');
  
  const client = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOKEN}`
    }
  });
  
  console.log('✅ Collections confirmées avec owner_company:');
  COLLECTIONS_WITH_OWNER_COMPANY.forEach(col => {
    console.log(`   - ${col}`);
  });
  
  console.log(`\n📊 Total confirmé: ${COLLECTIONS_WITH_OWNER_COMPANY.length}\n`);
  
  console.log('🔍 Vérification des autres collections...\n');
  
  const missingOwnerCompany = [];
  const hasOwnerCompany = [];
  const errorCollections = [];
  
  for (const collection of COLLECTIONS_TO_CHECK) {
    try {
      // Essayer de récupérer le champ owner_company
      await client.get(`/fields/${collection}/owner_company`);
      hasOwnerCompany.push(collection);
      console.log(`✅ ${collection} - A le champ owner_company`);
    } catch (error) {
      if (error.response?.status === 404) {
        missingOwnerCompany.push(collection);
        console.log(`❌ ${collection} - MANQUE owner_company`);
      } else if (error.response?.status === 403) {
        errorCollections.push(collection);
        console.log(`⚠️  ${collection} - Erreur de permission`);
      } else {
        errorCollections.push(collection);
        console.log(`⚠️  ${collection} - Erreur: ${error.message}`);
      }
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 RÉSUMÉ:');
  console.log('='.repeat(60));
  
  const totalWithOwnerCompany = COLLECTIONS_WITH_OWNER_COMPANY.length + hasOwnerCompany.length;
  const totalCollections = COLLECTIONS_WITH_OWNER_COMPANY.length + COLLECTIONS_TO_CHECK.length;
  
  console.log(`\n✅ Collections AVEC owner_company: ${totalWithOwnerCompany}`);
  console.log(`❌ Collections SANS owner_company: ${missingOwnerCompany.length}`);
  console.log(`⚠️  Collections avec erreurs: ${errorCollections.length}`);
  console.log(`\n📊 Couverture: ${totalWithOwnerCompany}/${totalCollections} (${((totalWithOwnerCompany/totalCollections)*100).toFixed(1)}%)`);
  
  if (missingOwnerCompany.length > 0) {
    console.log('\n🔧 Collections nécessitant owner_company:');
    missingOwnerCompany.forEach(col => {
      console.log(`   - ${col}`);
    });
    
    // Générer la liste pour le script de migration
    console.log('\n📝 Liste pour migration (copier-coller):');
    console.log('const COLLECTIONS_NEEDING_OWNER_COMPANY = [');
    missingOwnerCompany.forEach(col => {
      console.log(`  '${col}',`);
    });
    console.log('];');
  }
  
  if (errorCollections.length > 0) {
    console.log('\n⚠️  Collections avec erreurs (vérifier permissions):');
    errorCollections.forEach(col => {
      console.log(`   - ${col}`);
    });
  }
}

checkCollections().catch(console.error);