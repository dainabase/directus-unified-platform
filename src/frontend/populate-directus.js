// populate-directus.js - Script pour créer des données de test dans Directus
const axios = require('axios');

const API_URL = 'http://localhost:8055';
const TOKEN = 'dashboard-api-token-2025';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// Générateurs de données aléatoires
const randomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomDate = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - randomNumber(0, daysAgo));
  return date.toISOString().split('T')[0];
};

// Données de référence
const projectNames = [
  'Migration Cloud AWS', 'Refonte Site E-commerce', 'App Mobile Banking',
  'Dashboard Analytics', 'API Gateway', 'Système CRM', 'Plateforme IoT',
  'Marketplace B2B', 'Solution BI', 'Infrastructure DevOps'
];

const projectStatuses = ['active', 'completed', 'on_hold', 'planning'];

const clientNames = [
  'TechCorp SA', 'Digital Solutions Ltd', 'Innovation Hub', 'Smart Systems',
  'Future Tech', 'Data Masters', 'Cloud Experts', 'Mobile First', 'AI Ventures'
];

const taskNames = [
  'Intégration API', 'Tests de performance', 'Documentation technique',
  'Revue de code', 'Déploiement production', 'Configuration serveur',
  'Optimisation base de données', 'Formation utilisateurs', 'Audit sécurité',
  'Migration données'
];

const transactionLabels = [
  'Paiement facture client', 'Achat licences', 'Salaires équipe',
  'Services cloud', 'Matériel informatique', 'Consulting externe',
  'Formation équipe', 'Marketing digital', 'Location bureaux', 'Frais bancaires'
];

async function populateData() {
  console.log('🚀 Création des données de test Directus...\n');
  
  try {
    // Test de connexion
    await api.get('/server/ping');
    console.log('✅ Connexion API réussie\n');
    
    // Récupérer les entreprises existantes
    const companiesResponse = await api.get('/items/companies');
    const companies = companiesResponse.data.data;
    console.log(`📊 ${companies.length} entreprises trouvées\n`);
    
    if (companies.length === 0) {
      console.log('❌ Aucune entreprise trouvée. Création d\'entreprises de test...');
      // Créer quelques entreprises
      for (let i = 0; i < 5; i++) {
        const company = await api.post('/items/companies', {
          name: clientNames[i],
          status: 'active',
          created_at: new Date().toISOString()
        });
        companies.push(company.data.data);
      }
    }
    
    // 1. CRÉER 10 PROJETS
    console.log('📁 Création de 10 projets...');
    const projects = [];
    for (let i = 0; i < 10; i++) {
      try {
        const project = await api.post('/items/projects', {
          name: projectNames[i],
          status: randomElement(projectStatuses),
          company_id: randomElement(companies).id,
          start_date: randomDate(180),
          end_date: randomDate(30),
          budget: randomNumber(10000, 100000),
          description: `Projet ${projectNames[i]} - Phase de ${randomElement(['développement', 'test', 'déploiement'])}`,
          created_at: new Date().toISOString()
        });
        projects.push(project.data.data);
        console.log(`  ✅ Projet "${projectNames[i]}" créé`);
      } catch (error) {
        console.log(`  ❌ Erreur projet ${i}: ${error.response?.data?.errors?.[0]?.message || error.message}`);
      }
    }
    
    // 2. CRÉER 20 FACTURES CLIENTS
    console.log('\n💰 Création de 20 factures clients...');
    const clientInvoices = [];
    for (let i = 0; i < 20; i++) {
      try {
        const amount = randomNumber(5000, 50000);
        const invoice = await api.post('/items/client_invoices', {
          invoice_number: `FC-2025-${String(i + 1).padStart(4, '0')}`,
          company_id: randomElement(companies).id,
          project_id: projects.length > 0 ? randomElement(projects).id : null,
          amount: amount,
          status: randomElement(['paid', 'pending', 'overdue']),
          issue_date: randomDate(180),
          due_date: randomDate(30),
          description: `Facture pour ${randomElement(['développement', 'consulting', 'maintenance', 'support'])}`,
          created_at: new Date().toISOString()
        });
        clientInvoices.push(invoice.data.data);
        console.log(`  ✅ Facture client #${i + 1} créée (${amount}€)`);
      } catch (error) {
        console.log(`  ❌ Erreur facture client ${i}: ${error.response?.data?.errors?.[0]?.message || error.message}`);
      }
    }
    
    // 3. CRÉER 15 FACTURES FOURNISSEURS
    console.log('\n📋 Création de 15 factures fournisseurs...');
    for (let i = 0; i < 15; i++) {
      try {
        const amount = randomNumber(1000, 20000);
        await api.post('/items/supplier_invoices', {
          invoice_number: `FF-2025-${String(i + 1).padStart(4, '0')}`,
          supplier_name: randomElement(['AWS', 'Microsoft', 'Adobe', 'Slack', 'GitHub', 'Atlassian']),
          amount: amount,
          status: randomElement(['paid', 'pending', 'approved']),
          issue_date: randomDate(90),
          due_date: randomDate(15),
          category: randomElement(['software', 'hardware', 'services', 'infrastructure']),
          description: `${randomElement(['Abonnement', 'Licence', 'Service', 'Matériel'])} - ${randomElement(['mensuel', 'annuel', 'ponctuel'])}`,
          created_at: new Date().toISOString()
        });
        console.log(`  ✅ Facture fournisseur #${i + 1} créée (${amount}€)`);
      } catch (error) {
        console.log(`  ❌ Erreur facture fournisseur ${i}: ${error.response?.data?.errors?.[0]?.message || error.message}`);
      }
    }
    
    // 4. CRÉER 30 TRANSACTIONS BANCAIRES
    console.log('\n🏦 Création de 30 transactions bancaires...');
    for (let i = 0; i < 30; i++) {
      try {
        const isIncome = Math.random() > 0.4; // 60% de revenus
        const amount = isIncome ? randomNumber(5000, 50000) : -randomNumber(1000, 15000);
        await api.post('/items/bank_transactions', {
          label: randomElement(transactionLabels),
          amount: amount,
          type: isIncome ? 'income' : 'expense',
          date: randomDate(60),
          company_id: randomElement(companies).id,
          reference: `TRX-${Date.now()}-${i}`,
          status: 'completed',
          category: randomElement(['operations', 'salaries', 'services', 'infrastructure']),
          created_at: new Date().toISOString()
        });
        console.log(`  ✅ Transaction #${i + 1} créée (${amount}€)`);
      } catch (error) {
        console.log(`  ❌ Erreur transaction ${i}: ${error.response?.data?.errors?.[0]?.message || error.message}`);
      }
    }
    
    // 5. CRÉER 10 TÂCHES URGENTES (DELIVERABLES)
    console.log('\n🚨 Création de 10 tâches urgentes...');
    // Récupérer des personnes pour l'assignation
    const peopleResponse = await api.get('/items/people?limit=10');
    const people = peopleResponse.data.data;
    
    for (let i = 0; i < 10; i++) {
      try {
        await api.post('/items/deliverables', {
          name: randomElement(taskNames),
          project_id: projects.length > 0 ? randomElement(projects).id : null,
          assigned_to: people.length > 0 ? randomElement(people).id : null,
          status: randomElement(['todo', 'in_progress', 'review', 'blocked']),
          priority: randomElement(['high', 'urgent', 'critical']),
          due_date: randomDate(-5), // Dates proches ou dépassées
          description: `Tâche urgente - ${randomElement(['Bug critique', 'Deadline client', 'Problème production', 'Demande urgente'])}`,
          estimated_hours: randomNumber(4, 16),
          created_at: new Date().toISOString()
        });
        console.log(`  ✅ Tâche urgente #${i + 1} créée`);
      } catch (error) {
        console.log(`  ❌ Erreur tâche ${i}: ${error.response?.data?.errors?.[0]?.message || error.message}`);
      }
    }
    
    // Résumé final
    console.log('\n📊 Résumé de la création des données:');
    console.log('─'.repeat(50));
    
    const counts = await Promise.all([
      api.get('/items/projects?aggregate[count]=*'),
      api.get('/items/client_invoices?aggregate[count]=*'),
      api.get('/items/supplier_invoices?aggregate[count]=*'),
      api.get('/items/bank_transactions?aggregate[count]=*'),
      api.get('/items/deliverables?aggregate[count]=*')
    ]);
    
    console.log(`✅ Projets: ${counts[0].data.data[0].count}`);
    console.log(`✅ Factures clients: ${counts[1].data.data[0].count}`);
    console.log(`✅ Factures fournisseurs: ${counts[2].data.data[0].count}`);
    console.log(`✅ Transactions bancaires: ${counts[3].data.data[0].count}`);
    console.log(`✅ Tâches urgentes: ${counts[4].data.data[0].count}`);
    
    console.log('\n🎉 Données de test créées avec succès !');
    console.log('📊 Rechargez le dashboard pour voir les nouvelles données.');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.response?.data?.errors?.[0]?.message || error.message);
  }
}

// Exécuter
populateData();