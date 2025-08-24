#!/usr/bin/env node

/**
 * Migration massive de données réelles
 * Ajoute 100+ items dans Directus
 */

require('dotenv').config();
const axios = require('axios');

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_TOKEN = process.env.DIRECTUS_STATIC_TOKEN || 'e6Vt5LRHnYhq7-78yzoSxwdgjn2D6-JW';

const directus = axios.create({
  baseURL: DIRECTUS_URL,
  headers: {
    'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// Compteurs pour le rapport
const report = {
  companies: 0,
  projects: 0,
  invoices: 0,
  people: 0,
  timeTracking: 0,
  supportTickets: 0
};

async function createCompanies() {
  console.log('\n📢 Création des entreprises...');
  
  const companies = [
    // 10 Clients suisses
    { name: 'Groupe Helvetia', type: 'client', industry: 'Assurance', email: 'contact@helvetia.ch', phone: '+41 21 321 65 11', website: 'https://helvetia.com' },
    { name: 'Banque Riviera', type: 'client', industry: 'Finance', email: 'info@banque-riviera.ch', phone: '+41 21 925 00 00', website: 'https://banque-riviera.ch' },
    { name: 'Lausanne Hospitality', type: 'client', industry: 'Formation', email: 'contact@ehl.ch', phone: '+41 21 785 11 11', website: 'https://ehl.ch' },
    { name: 'Swiss Medical Network', type: 'client', industry: 'Santé', email: 'info@swissmedical.net', phone: '+41 21 923 38 38', website: 'https://swissmedical.net' },
    { name: 'Léman Technologies', type: 'client', industry: 'Tech', email: 'hello@leman-tech.ch', phone: '+41 22 365 10 00', website: 'https://leman-tech.ch' },
    { name: 'Romande Énergie', type: 'client', industry: 'Énergie', email: 'contact@romande-energie.ch', phone: '+41 21 802 95 95', website: 'https://romande-energie.ch' },
    { name: 'Vaud Immobilier SA', type: 'client', industry: 'Immobilier', email: 'info@vaud-immo.ch', phone: '+41 21 316 85 00' },
    { name: 'Geneva Watch Group', type: 'client', industry: 'Luxe', email: 'contact@gwg.ch', phone: '+41 22 908 48 48', website: 'https://gwg.ch' },
    { name: 'Alpine Logistics', type: 'client', industry: 'Logistique', email: 'info@alpine-log.ch', phone: '+41 21 644 20 20' },
    { name: 'Swiss Innovation Park', type: 'client', industry: 'Innovation', email: 'hello@sip.ch', phone: '+41 21 693 70 00', website: 'https://sip.ch' },
    
    // 5 Fournisseurs
    { name: 'DataPro Solutions', type: 'provider', industry: 'IT Services', email: 'sales@datapro.ch', phone: '+41 22 518 05 05' },
    { name: 'Cloud Experts SA', type: 'provider', industry: 'Cloud', email: 'support@cloudexperts.ch', phone: '+41 21 558 30 30' },
    { name: 'Security First GmbH', type: 'provider', industry: 'Cybersecurity', email: 'info@secfirst.ch', phone: '+41 44 515 20 20' },
    { name: 'Dev Factory Sàrl', type: 'provider', industry: 'Development', email: 'team@devfactory.ch', phone: '+41 21 311 13 13' },
    { name: 'Quality Assurance Pro', type: 'provider', industry: 'Testing', email: 'qa@qapro.ch', phone: '+41 22 734 14 14' },
    
    // 5 Partenaires
    { name: 'Swiss Partners Network', type: 'partner', industry: 'Consulting', email: 'partner@spn.ch', phone: '+41 21 345 67 89' },
    { name: 'Innovation Hub Léman', type: 'partner', industry: 'Incubateur', email: 'contact@ihl.ch', phone: '+41 22 456 78 90' },
    { name: 'Digital Transform Co', type: 'partner', industry: 'Digital', email: 'hello@dtc.ch', phone: '+41 21 789 01 23' },
    { name: 'Alliance Romande', type: 'partner', industry: 'Business', email: 'info@alliance-romande.ch', phone: '+41 22 890 12 34' },
    { name: 'Swiss Tech Association', type: 'partner', industry: 'Association', email: 'contact@sta.ch', phone: '+41 21 901 23 45' }
  ];

  const createdCompanies = [];
  for (const company of companies) {
    try {
      const response = await directus.post('/items/companies', company);
      createdCompanies.push(response.data.data);
      report.companies++;
      console.log(`  ✅ ${company.name} (${company.type})`);
    } catch (error) {
      console.log(`  ❌ Erreur pour ${company.name}: ${error.message}`);
    }
  }
  
  return createdCompanies;
}

async function createProjects(companies) {
  console.log('\n📂 Création des projets...');
  
  const clientIds = companies.filter(c => c.type === 'client').map(c => c.id);
  const projects = [
    // 5 Projets actifs
    { name: 'Migration Cloud Helvetia', status: 'active', budget: 150000, company_id: clientIds[0], start_date: '2025-01-15', end_date: '2025-06-30' },
    { name: 'App Mobile Banque Riviera', status: 'active', budget: 280000, company_id: clientIds[1], start_date: '2025-02-01', end_date: '2025-08-31' },
    { name: 'Plateforme E-learning EHL', status: 'active', budget: 95000, company_id: clientIds[2], start_date: '2025-03-01', end_date: '2025-09-30' },
    { name: 'Système RH Medical Network', status: 'active', budget: 120000, company_id: clientIds[3], start_date: '2025-01-01', end_date: '2025-12-31' },
    { name: 'IoT Dashboard Léman Tech', status: 'active', budget: 75000, company_id: clientIds[4], start_date: '2025-04-01', end_date: '2025-10-31' },
    
    // 5 Projets en attente
    { name: 'Smart Grid Romande', status: 'pending', budget: 200000, company_id: clientIds[5], start_date: '2025-06-01', end_date: '2025-12-31' },
    { name: 'CRM Immobilier', status: 'pending', budget: 85000, company_id: clientIds[6], start_date: '2025-05-15' },
    { name: 'E-commerce Watches', status: 'pending', budget: 165000, company_id: clientIds[7], start_date: '2025-07-01' },
    { name: 'Tracking Logistics', status: 'pending', budget: 110000, company_id: clientIds[8], start_date: '2025-09-01' },
    { name: 'Innovation Platform', status: 'pending', budget: 140000, company_id: clientIds[9], start_date: '2025-08-01' },
    
    // 5 Projets terminés
    { name: 'Audit Sécurité 2024', status: 'completed', budget: 45000, company_id: clientIds[0], start_date: '2024-09-01', end_date: '2024-12-31' },
    { name: 'Migration Base Données', status: 'completed', budget: 68000, company_id: clientIds[1], start_date: '2024-06-01', end_date: '2024-11-30' },
    { name: 'Refonte Site Web', status: 'completed', budget: 52000, company_id: clientIds[2], start_date: '2024-03-01', end_date: '2024-08-31' },
    { name: 'API Integration', status: 'completed', budget: 38000, company_id: clientIds[3], start_date: '2024-01-15', end_date: '2024-05-31' },
    { name: 'Dashboard Analytics', status: 'completed', budget: 72000, company_id: clientIds[4], start_date: '2024-02-01', end_date: '2024-07-31' }
  ];

  const createdProjects = [];
  for (const project of projects) {
    try {
      const response = await directus.post('/items/projects', project);
      createdProjects.push(response.data.data);
      report.projects++;
      console.log(`  ✅ ${project.name} (${project.status})`);
    } catch (error) {
      console.log(`  ❌ Erreur pour ${project.name}: ${error.message}`);
    }
  }
  
  return createdProjects;
}

async function createInvoices(companies, projects) {
  console.log('\n💰 Création des factures...');
  
  const clientIds = companies.filter(c => c.type === 'client').map(c => c.id);
  const invoices = [
    // 8 Factures payées
    { invoice_number: 'INV-2025-001', company_id: clientIds[0], amount: 15000, currency: 'CHF', status: 'paid', issue_date: '2025-01-15', payment_date: '2025-01-30' },
    { invoice_number: 'INV-2025-002', company_id: clientIds[1], amount: 28000, currency: 'CHF', status: 'paid', issue_date: '2025-01-20', payment_date: '2025-02-05' },
    { invoice_number: 'INV-2025-003', company_id: clientIds[2], amount: 9500, currency: 'CHF', status: 'paid', issue_date: '2025-02-01', payment_date: '2025-02-15' },
    { invoice_number: 'INV-2025-004', company_id: clientIds[3], amount: 12000, currency: 'CHF', status: 'paid', issue_date: '2025-02-10', payment_date: '2025-02-25' },
    { invoice_number: 'INV-2025-005', company_id: clientIds[4], amount: 7500, currency: 'CHF', status: 'paid', issue_date: '2025-02-15', payment_date: '2025-03-01' },
    { invoice_number: 'INV-2024-098', company_id: clientIds[0], amount: 45000, currency: 'CHF', status: 'paid', issue_date: '2024-12-01', payment_date: '2024-12-20' },
    { invoice_number: 'INV-2024-099', company_id: clientIds[1], amount: 68000, currency: 'CHF', status: 'paid', issue_date: '2024-11-15', payment_date: '2024-12-10' },
    { invoice_number: 'INV-2024-100', company_id: clientIds[2], amount: 52000, currency: 'CHF', status: 'paid', issue_date: '2024-08-20', payment_date: '2024-09-15' },
    
    // 7 Factures envoyées
    { invoice_number: 'INV-2025-006', company_id: clientIds[5], amount: 20000, currency: 'CHF', status: 'sent', issue_date: '2025-03-01', due_date: '2025-03-31' },
    { invoice_number: 'INV-2025-007', company_id: clientIds[6], amount: 8500, currency: 'CHF', status: 'sent', issue_date: '2025-03-05', due_date: '2025-04-05' },
    { invoice_number: 'INV-2025-008', company_id: clientIds[7], amount: 16500, currency: 'CHF', status: 'sent', issue_date: '2025-03-10', due_date: '2025-04-10' },
    { invoice_number: 'INV-2025-009', company_id: clientIds[8], amount: 11000, currency: 'CHF', status: 'sent', issue_date: '2025-03-15', due_date: '2025-04-15' },
    { invoice_number: 'INV-2025-010', company_id: clientIds[9], amount: 14000, currency: 'CHF', status: 'sent', issue_date: '2025-03-20', due_date: '2025-04-20' },
    { invoice_number: 'INV-2025-011', company_id: clientIds[0], amount: 15000, currency: 'CHF', status: 'sent', issue_date: '2025-03-25', due_date: '2025-04-25' },
    { invoice_number: 'INV-2025-012', company_id: clientIds[1], amount: 28000, currency: 'CHF', status: 'sent', issue_date: '2025-03-28', due_date: '2025-04-28' },
    
    // 5 Factures draft
    { invoice_number: 'INV-2025-013', company_id: clientIds[2], amount: 9500, currency: 'CHF', status: 'draft', issue_date: '2025-04-01' },
    { invoice_number: 'INV-2025-014', company_id: clientIds[3], amount: 12000, currency: 'CHF', status: 'draft', issue_date: '2025-04-05' },
    { invoice_number: 'INV-2025-015', company_id: clientIds[4], amount: 7500, currency: 'CHF', status: 'draft', issue_date: '2025-04-10' },
    { invoice_number: 'INV-2025-016', company_id: clientIds[5], amount: 20000, currency: 'CHF', status: 'draft', issue_date: '2025-04-15' },
    { invoice_number: 'INV-2025-017', company_id: clientIds[6], amount: 8500, currency: 'CHF', status: 'draft', issue_date: '2025-04-20' }
  ];

  for (const invoice of invoices) {
    try {
      const response = await directus.post('/items/client_invoices', invoice);
      report.invoices++;
      console.log(`  ✅ ${invoice.invoice_number} - ${invoice.amount} CHF (${invoice.status})`);
    } catch (error) {
      console.log(`  ❌ Erreur pour ${invoice.invoice_number}: ${error.message}`);
    }
  }
}

async function createPeople(companies) {
  console.log('\n👥 Création des personnes...');
  
  const people = [
    { first_name: 'Jean-Marc', last_name: 'Dubois', email: 'jm.dubois@helvetia.ch', phone: '+41 79 123 45 67', position: 'CEO', company_id: companies[0].id },
    { first_name: 'Marie', last_name: 'Laurent', email: 'm.laurent@banque-riviera.ch', phone: '+41 78 234 56 78', position: 'CTO', company_id: companies[1].id },
    { first_name: 'Pierre', last_name: 'Müller', email: 'p.mueller@ehl.ch', phone: '+41 79 345 67 89', position: 'Directeur IT', company_id: companies[2].id },
    { first_name: 'Sophie', last_name: 'Rochat', email: 's.rochat@swissmedical.net', phone: '+41 78 456 78 90', position: 'CFO', company_id: companies[3].id },
    { first_name: 'Luc', last_name: 'Favre', email: 'l.favre@leman-tech.ch', phone: '+41 79 567 89 01', position: 'Product Manager', company_id: companies[4].id },
    { first_name: 'Isabelle', last_name: 'Blanc', email: 'i.blanc@romande-energie.ch', phone: '+41 78 678 90 12', position: 'Directrice Digital', company_id: companies[5].id },
    { first_name: 'Marc', last_name: 'Schwarz', email: 'm.schwarz@vaud-immo.ch', phone: '+41 79 789 01 23', position: 'Head of Sales', company_id: companies[6].id },
    { first_name: 'Céline', last_name: 'Dupont', email: 'c.dupont@gwg.ch', phone: '+41 78 890 12 34', position: 'Marketing Director', company_id: companies[7].id },
    { first_name: 'Thomas', last_name: 'Weber', email: 't.weber@alpine-log.ch', phone: '+41 79 901 23 45', position: 'Operations Manager', company_id: companies[8].id },
    { first_name: 'Laura', last_name: 'Schmid', email: 'l.schmid@sip.ch', phone: '+41 78 012 34 56', position: 'Innovation Lead', company_id: companies[9].id }
  ];

  for (const person of people) {
    try {
      const response = await directus.post('/items/people', person);
      report.people++;
      console.log(`  ✅ ${person.first_name} ${person.last_name} - ${person.position}`);
    } catch (error) {
      console.log(`  ❌ Erreur pour ${person.first_name} ${person.last_name}: ${error.message}`);
    }
  }
}

async function createTimeTracking(projects) {
  console.log('\n⏱️ Création du time tracking...');
  
  const today = new Date();
  const timeEntries = [];
  
  // Générer 25 entrées sur 30 jours
  for (let i = 0; i < 25; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date(today);
    date.setDate(date.getDate() - daysAgo);
    
    const projectIndex = Math.floor(Math.random() * Math.min(5, projects.length));
    const hours = Math.floor(Math.random() * 6) + 2; // Entre 2 et 8 heures
    
    timeEntries.push({
      project_id: projects[projectIndex]?.id,
      date: date.toISOString().split('T')[0],
      hours: hours,
      description: `Travail sur ${projects[projectIndex]?.name || 'Projet'}`,
      billable: Math.random() > 0.3 // 70% billable
    });
  }

  for (const entry of timeEntries) {
    try {
      const response = await directus.post('/items/time_tracking', entry);
      report.timeTracking++;
      console.log(`  ✅ ${entry.date} - ${entry.hours}h`);
    } catch (error) {
      console.log(`  ❌ Erreur pour time tracking: ${error.message}`);
    }
  }
}

async function createSupportTickets(companies) {
  console.log('\n🎫 Création des tickets support...');
  
  const priorities = ['low', 'medium', 'high', 'critical'];
  const statuses = ['open', 'in_progress', 'resolved', 'closed'];
  const categories = ['Bug', 'Feature Request', 'Question', 'Incident', 'Maintenance'];
  
  const tickets = [];
  for (let i = 0; i < 15; i++) {
    const companyIndex = Math.floor(Math.random() * companies.length);
    tickets.push({
      title: `Ticket #${1000 + i} - ${categories[Math.floor(Math.random() * categories.length)]}`,
      description: `Description détaillée du ticket support numéro ${1000 + i}`,
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      company_id: companies[companyIndex].id,
      created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    });
  }

  for (const ticket of tickets) {
    try {
      const response = await directus.post('/items/support_tickets', ticket);
      report.supportTickets++;
      console.log(`  ✅ ${ticket.title} (${ticket.priority})`);
    } catch (error) {
      console.log(`  ❌ Erreur pour ${ticket.title}: ${error.message}`);
    }
  }
}

async function main() {
  console.log('🚀 MIGRATION MASSIVE DE DONNÉES');
  console.log('================================\n');
  
  try {
    // 1. Créer les entreprises
    const companies = await createCompanies();
    
    // 2. Créer les projets
    const projects = await createProjects(companies);
    
    // 3. Créer les factures
    await createInvoices(companies, projects);
    
    // 4. Créer les personnes
    await createPeople(companies);
    
    // 5. Créer le time tracking
    await createTimeTracking(projects);
    
    // 6. Créer les tickets support
    await createSupportTickets(companies);
    
    // Rapport final
    console.log('\n' + '='.repeat(50));
    console.log('📊 RAPPORT FINAL DE MIGRATION');
    console.log('='.repeat(50));
    console.log(`✅ ${report.companies} entreprises créées`);
    console.log(`✅ ${report.projects} projets créés`);
    console.log(`✅ ${report.invoices} factures créées`);
    console.log(`✅ ${report.people} personnes créées`);
    console.log(`✅ ${report.timeTracking} entrées time tracking créées`);
    console.log(`✅ ${report.supportTickets} tickets support créés`);
    console.log('='.repeat(50));
    console.log(`TOTAL: ${Object.values(report).reduce((a, b) => a + b, 0)} items créés !`);
    console.log('\n🎉 Migration massive terminée avec succès !');
    
  } catch (error) {
    console.error('\n❌ Erreur générale:', error.message);
    process.exit(1);
  }
}

// Exécuter
main();