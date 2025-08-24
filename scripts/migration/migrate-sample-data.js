#!/usr/bin/env node

/**
 * Script pour créer des données d'exemple dans Directus
 */

const axios = require('axios');

const DIRECTUS_URL = 'http://localhost:8055';
const DIRECTUS_TOKEN = 'e6Vt5LRHnYhq7-78yzoSxwdgjn2D6-JW';

const directus = axios.create({
  baseURL: DIRECTUS_URL,
  headers: {
    'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

async function createSampleData() {
  console.log('🚀 CRÉATION DE DONNÉES D\'EXEMPLE\n');
  
  const results = {
    success: 0,
    failed: 0,
    collections: {}
  };
  
  try {
    // 1. Créer des companies
    console.log('📦 Création de companies...');
    const companies = [
      { name: 'Acme Corp', type: 'client', status: 'active', website: 'https://acme.com' },
      { name: 'Tech Solutions', type: 'provider', status: 'active', email: 'contact@techsol.com' },
      { name: 'Digital Agency', type: 'partner', status: 'active', phone: '+33123456789' }
    ];
    
    for (const company of companies) {
      try {
        await directus.post('/items/companies', company);
        results.success++;
      } catch (e) {
        results.failed++;
      }
    }
    results.collections.companies = companies.length;
    
    // 2. Créer des people
    console.log('📦 Création de people...');
    const people = [
      { first_name: 'Jean', last_name: 'Dupont', email: 'jean@acme.com', role: 'CEO' },
      { first_name: 'Marie', last_name: 'Martin', email: 'marie@techsol.com', role: 'CTO' },
      { first_name: 'Pierre', last_name: 'Bernard', email: 'pierre@digital.com', role: 'Developer' }
    ];
    
    for (const person of people) {
      try {
        await directus.post('/items/people', person);
        results.success++;
      } catch (e) {
        results.failed++;
      }
    }
    results.collections.people = people.length;
    
    // 3. Créer des projects
    console.log('📦 Création de projects...');
    const projects = [
      { 
        name: 'Migration Directus',
        status: 'in_progress',
        start_date: '2025-08-01',
        budget: 50000,
        description: 'Migration complète de Notion vers Directus'
      },
      {
        name: 'Site E-commerce',
        status: 'planning',
        start_date: '2025-09-01',
        budget: 75000,
        description: 'Développement plateforme e-commerce'
      },
      {
        name: 'App Mobile',
        status: 'completed',
        start_date: '2025-01-01',
        end_date: '2025-07-31',
        budget: 100000,
        description: 'Application mobile iOS/Android'
      }
    ];
    
    for (const project of projects) {
      try {
        await directus.post('/items/projects', project);
        results.success++;
      } catch (e) {
        results.failed++;
      }
    }
    results.collections.projects = projects.length;
    
    // 4. Créer des deliverables
    console.log('📦 Création de deliverables...');
    const deliverables = [
      { name: 'Analyse des besoins', status: 'completed', description: 'Document d\'analyse' },
      { name: 'Maquettes UI/UX', status: 'in_progress', description: 'Design des interfaces' },
      { name: 'Backend API', status: 'pending', description: 'Développement API REST' }
    ];
    
    for (const deliverable of deliverables) {
      try {
        await directus.post('/items/deliverables', deliverable);
        results.success++;
      } catch (e) {
        results.failed++;
      }
    }
    results.collections.deliverables = deliverables.length;
    
    // 5. Créer des invoices
    console.log('📦 Création de client_invoices...');
    const invoices = [
      {
        invoice_number: 'INV-2025-001',
        date: '2025-08-01',
        amount: 15000,
        status: 'paid',
        ocr_extracted: false
      },
      {
        invoice_number: 'INV-2025-002',
        date: '2025-08-03',
        amount: 25000,
        status: 'pending',
        ocr_extracted: false
      }
    ];
    
    for (const invoice of invoices) {
      try {
        await directus.post('/items/client_invoices', invoice);
        results.success++;
      } catch (e) {
        results.failed++;
      }
    }
    results.collections.client_invoices = invoices.length;
    
    // 6. Créer des time_tracking
    console.log('📦 Création de time_tracking...');
    const timeEntries = [
      {
        date: '2025-08-01',
        hours: 8,
        description: 'Développement frontend',
        billable: true
      },
      {
        date: '2025-08-02',
        hours: 6,
        description: 'Réunion client',
        billable: true
      },
      {
        date: '2025-08-03',
        hours: 4,
        description: 'Documentation',
        billable: false
      }
    ];
    
    for (const entry of timeEntries) {
      try {
        await directus.post('/items/time_tracking', entry);
        results.success++;
      } catch (e) {
        results.failed++;
      }
    }
    results.collections.time_tracking = timeEntries.length;
    
    // 7. Créer des expenses
    console.log('📦 Création de expenses...');
    const expenses = [
      { description: 'Licences logiciels', amount: 500, date: '2025-08-01', status: 'approved' },
      { description: 'Matériel informatique', amount: 2000, date: '2025-08-02', status: 'pending' },
      { description: 'Formation équipe', amount: 1500, date: '2025-08-03', status: 'approved' }
    ];
    
    for (const expense of expenses) {
      try {
        await directus.post('/items/expenses', expense);
        results.success++;
      } catch (e) {
        results.failed++;
      }
    }
    results.collections.expenses = expenses.length;
    
    console.log('\n📊 RÉSUMÉ:');
    console.log(`✅ Succès: ${results.success} items créés`);
    console.log(`❌ Échecs: ${results.failed}`);
    console.log('\nPar collection:');
    Object.entries(results.collections).forEach(([col, count]) => {
      console.log(`  - ${col}: ${count} items`);
    });
    
  } catch (error) {
    console.error('Erreur:', error.response?.data || error.message);
  }
}

createSampleData().catch(console.error);
