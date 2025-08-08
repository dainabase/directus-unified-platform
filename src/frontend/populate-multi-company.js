const axios = require('axios');
const { faker } = require('@faker-js/faker/locale/fr_CH');

const API_URL = 'http://localhost:8055';
const API_TOKEN = 'dashboard-api-token-2025';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Authorization': `Bearer ${API_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// NOS 5 ENTREPRISES (constantes du système)
const OUR_COMPANIES = {
  HYPERVISUAL: {
    name: 'HYPERVISUAL',
    industry: 'Studio Créatif',
    bank_account: 'CH93 0076 2011 6238 5295 1',
    initial_balance: 450000
  },
  DAINAMICS: {
    name: 'DAINAMICS', 
    industry: 'Solutions Tech & IA',
    bank_account: 'CH93 0076 2011 6238 5295 2',
    initial_balance: 780000
  },
  LEXAIA: {
    name: 'LEXAIA',
    industry: 'Services Juridiques & IA',
    bank_account: 'CH93 0076 2011 6238 5295 3',
    initial_balance: 320000
  },
  ENKI_REALTY: {
    name: 'ENKI REALTY',
    industry: 'Immobilier Premium',
    bank_account: 'CH93 0076 2011 6238 5295 4',
    initial_balance: 1200000
  },
  TAKEOUT: {
    name: 'TAKEOUT',
    industry: 'Restauration & Livraison',
    bank_account: 'CH93 0076 2011 6238 5295 5',
    initial_balance: 280000
  }
};

// Helpers
const randomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const randomAmount = (min, max) => {
  return Math.floor(Math.random() * (max - min) + min);
};

const getRandomCompany = () => {
  const companies = Object.keys(OUR_COMPANIES);
  return companies[Math.floor(Math.random() * companies.length)];
};

// 🏢 ÉTAPE 1 : CRÉER LES ENTREPRISES CLIENTES
async function createClientCompanies() {
  console.log('\n🏢 Création de 100 entreprises clientes...');
  
  const industries = ['Banque', 'Assurance', 'Pharma', 'Horlogerie', 'Finance', 'Tech', 
                      'E-commerce', 'Consulting', 'Industrie', 'Services', 'Retail', 'Santé'];
  
  const clientIds = [];
  
  for (let i = 0; i < 100; i++) {
    const company = {
      name: faker.company.name(),
      industry: industries[Math.floor(Math.random() * industries.length)],
      website: faker.internet.url(),
      email: faker.internet.email(),
      phone: faker.phone.number('+41 ## ### ## ##'),
      address: `${faker.location.streetAddress()}, ${faker.location.zipCode()} ${faker.location.city()}`,
      is_client: true,
      status: 'active'
    };
    
    try {
      const response = await api.post('/items/companies', company);
      clientIds.push(response.data.data.id);
      
      if (i % 10 === 0) {
        console.log(`✅ ${i}/100 clients créés...`);
      }
    } catch (error) {
      console.error(`❌ Erreur client ${i}:`, error.response?.data?.errors?.[0]?.message);
    }
  }
  
  console.log('✅ 100 entreprises clientes créées');
  return clientIds;
}

// 👥 ÉTAPE 2 : CRÉER DES CONTACTS POUR NOS ENTREPRISES ET NOS CLIENTS
async function createContacts(clientIds) {
  console.log('\n👥 Création de 300 contacts...');
  
  const roles = ['CEO', 'CTO', 'CFO', 'CMO', 'Directeur', 'Manager', 'Chef de projet',
                  'Responsable IT', 'Responsable Marketing', 'Acheteur', 'Décideur'];
  
  // Créer des employés pour NOS entreprises
  console.log('📌 Création des employés de nos entreprises...');
  
  // CEO et équipes de direction pour chaque entreprise
  const ourTeams = [
    // HYPERVISUAL
    { first_name: 'Jean-Marie', last_name: 'Delaunay', role: 'CEO', company: 'HYPERVISUAL' },
    { first_name: 'Sophie', last_name: 'Martin', role: 'Creative Director', company: 'HYPERVISUAL' },
    { first_name: 'Lucas', last_name: 'Dubois', role: 'Lead Designer', company: 'HYPERVISUAL' },
    
    // DAINAMICS
    { first_name: 'Alexandre', last_name: 'Rousseau', role: 'CEO', company: 'DAINAMICS' },
    { first_name: 'Marie', last_name: 'Lefort', role: 'CTO', company: 'DAINAMICS' },
    { first_name: 'Thomas', last_name: 'Bernard', role: 'Lead Developer', company: 'DAINAMICS' },
    
    // LEXAIA
    { first_name: 'Catherine', last_name: 'Moreau', role: 'CEO', company: 'LEXAIA' },
    { first_name: 'Pierre', last_name: 'Durand', role: 'Head of Legal', company: 'LEXAIA' },
    
    // ENKI REALTY
    { first_name: 'Michael', last_name: 'Weber', role: 'CEO', company: 'ENKI_REALTY' },
    { first_name: 'Sarah', last_name: 'Fischer', role: 'Head of Sales', company: 'ENKI_REALTY' },
    
    // TAKEOUT
    { first_name: 'David', last_name: 'Chen', role: 'CEO', company: 'TAKEOUT' },
    { first_name: 'Emma', last_name: 'Wilson', role: 'Operations Director', company: 'TAKEOUT' }
  ];
  
  for (const member of ourTeams) {
    const contact = {
      first_name: member.first_name,
      last_name: member.last_name,
      email: `${member.first_name.toLowerCase()}.${member.last_name.toLowerCase()}@${member.company.toLowerCase().replace(' ', '')}.ch`,
      phone: faker.phone.number('+41 79 ### ## ##'),
      role: member.role,
      is_employee: true,
      employee_company: member.company
    };
    
    try {
      await api.post('/items/people', contact);
      console.log(`✅ ${member.first_name} ${member.last_name} (${member.company})`);
    } catch (error) {
      console.error(`❌ Erreur:`, error.response?.data?.errors?.[0]?.message);
    }
  }
  
  // Créer des contacts clients
  console.log('\n📌 Création des contacts clients...');
  
  for (let i = 0; i < 250; i++) {
    const contact = {
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      email: faker.internet.email(),
      phone: faker.phone.number('+41 ## ### ## ##'),
      role: roles[Math.floor(Math.random() * roles.length)],
      is_employee: false,
      company_id: clientIds[Math.floor(Math.random() * clientIds.length)]
    };
    
    try {
      await api.post('/items/people', contact);
      
      if (i % 25 === 0) {
        console.log(`✅ ${i}/250 contacts clients créés...`);
      }
    } catch (error) {
      console.error(`❌ Erreur contact ${i}:`, error.response?.data?.errors?.[0]?.message);
    }
  }
  
  console.log('✅ 300 contacts créés (équipes + clients)');
}

// 📂 ÉTAPE 3 : CRÉER DES PROJETS (PAR nos entreprises POUR des clients)
async function createProjects(clientIds) {
  console.log('\n📂 Création de 150 projets...');
  
  const projectTemplates = {
    HYPERVISUAL: [
      'Refonte Site Web', 'Création Identité Visuelle', 'Campagne Publicitaire',
      'Design Application Mobile', 'Motion Design', 'Branding Complet'
    ],
    DAINAMICS: [
      'Développement API', 'Migration Cloud AWS', 'App Mobile Native',
      'Dashboard Analytics', 'Infrastructure DevOps', 'Intégration IA'
    ],
    LEXAIA: [
      'Audit Juridique', 'Mise en Conformité RGPD', 'Contrats Numériques',
      'Propriété Intellectuelle', 'Due Diligence', 'Conseil Stratégique'
    ],
    ENKI_REALTY: [
      'Vente Appartement Luxe', 'Gestion Locative', 'Promotion Immobilière',
      'Investissement Commercial', 'Rénovation Premium', 'Conseil Patrimonial'
    ],
    TAKEOUT: [
      'Ouverture Restaurant', 'Service Traiteur', 'Événement Corporate',
      'Formation Équipe', 'Consulting Restauration', 'Franchise Setup'
    ]
  };
  
  const statuses = ['active', 'completed', 'pending', 'on_hold'];
  const priorities = ['low', 'medium', 'high', 'critical'];
  
  for (let i = 0; i < 150; i++) {
    const ownerCompany = getRandomCompany();
    const templates = projectTemplates[ownerCompany];
    const projectName = templates[Math.floor(Math.random() * templates.length)];
    
    const startDate = randomDate(new Date(2024, 0, 1), new Date());
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + Math.floor(Math.random() * 6) + 1);
    
    const budget = ownerCompany === 'ENKI_REALTY' 
      ? randomAmount(100000, 2000000)
      : randomAmount(10000, 300000);
    
    const project = {
      name: `${projectName} - ${faker.company.name()}`,
      description: faker.lorem.paragraph(),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      budget: budget,
      spent_amount: Math.floor(budget * Math.random() * 0.8),
      owner_company: ownerCompany,
      client_id: clientIds[Math.floor(Math.random() * clientIds.length)],
      completion_percentage: Math.floor(Math.random() * 100),
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      date_created: new Date().toISOString()
    };
    
    try {
      await api.post('/items/projects', project);
      
      if (i % 15 === 0) {
        console.log(`✅ ${i}/150 projets créés...`);
      }
    } catch (error) {
      console.error(`❌ Erreur projet ${i}:`, error.response?.data?.errors?.[0]?.message);
    }
  }
  
  console.log('✅ 150 projets créés');
}

// 💰 ÉTAPE 4 : CRÉER DES FACTURES (ÉMISES PAR nos entreprises)
async function createInvoices(clientIds) {
  console.log('\n💰 Création de 500 factures clients...');
  
  const statuses = ['draft', 'sent', 'paid', 'overdue', 'cancelled'];
  const prefixes = {
    HYPERVISUAL: 'HV',
    DAINAMICS: 'DA',
    LEXAIA: 'LX',
    ENKI_REALTY: 'ER',
    TAKEOUT: 'TO'
  };
  
  for (let i = 0; i < 500; i++) {
    const ownerCompany = getRandomCompany();
    const prefix = prefixes[ownerCompany];
    
    const issueDate = randomDate(new Date(2024, 0, 1), new Date());
    const dueDate = new Date(issueDate);
    dueDate.setDate(dueDate.getDate() + 30);
    
    const amount = ownerCompany === 'ENKI_REALTY'
      ? randomAmount(50000, 500000)
      : randomAmount(5000, 100000);
    
    const invoice = {
      invoice_number: `${prefix}-2025-${String(i + 1).padStart(4, '0')}`,
      amount: amount,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      date_created: issueDate.toISOString(),
      issue_date: issueDate.toISOString().split('T')[0],
      due_date: dueDate.toISOString().split('T')[0],
      owner_company: ownerCompany,
      company_id: clientIds[Math.floor(Math.random() * clientIds.length)],
      payment_terms: 30,
      currency: 'CHF'
    };
    
    if (invoice.status === 'paid') {
      invoice.paid_date = randomDate(issueDate, new Date()).toISOString().split('T')[0];
    }
    
    try {
      await api.post('/items/client_invoices', invoice);
      
      if (i % 50 === 0) {
        console.log(`✅ ${i}/500 factures créées...`);
      }
    } catch (error) {
      console.error(`❌ Erreur facture ${i}:`, error.response?.data?.errors?.[0]?.message);
    }
  }
  
  console.log('✅ 500 factures clients créées');
}

// 🏦 ÉTAPE 5 : CRÉER DES TRANSACTIONS BANCAIRES (1 compte par entreprise)
async function createBankTransactions() {
  console.log('\n🏦 Création de 2000 transactions bancaires...');
  
  const categories = ['revenue', 'payroll', 'software', 'rent', 'marketing', 'equipment', 
                      'consulting', 'travel', 'taxes', 'dividends'];
  
  // Initialiser les soldes
  const balances = {
    HYPERVISUAL: OUR_COMPANIES.HYPERVISUAL.initial_balance,
    DAINAMICS: OUR_COMPANIES.DAINAMICS.initial_balance,
    LEXAIA: OUR_COMPANIES.LEXAIA.initial_balance,
    ENKI_REALTY: OUR_COMPANIES.ENKI_REALTY.initial_balance,
    TAKEOUT: OUR_COMPANIES.TAKEOUT.initial_balance
  };
  
  for (let i = 0; i < 2000; i++) {
    const ownerCompany = getRandomCompany();
    const isCredit = Math.random() > 0.4; // 60% de crédits
    
    let amount;
    if (ownerCompany === 'ENKI_REALTY') {
      amount = isCredit ? randomAmount(50000, 500000) : randomAmount(10000, 100000);
    } else {
      amount = isCredit ? randomAmount(5000, 100000) : randomAmount(1000, 30000);
    }
    
    balances[ownerCompany] = isCredit 
      ? balances[ownerCompany] + amount 
      : balances[ownerCompany] - amount;
    
    const transaction = {
      date: randomDate(new Date(2024, 0, 1), new Date()).toISOString().split('T')[0],
      description: isCredit 
        ? `Paiement client - ${faker.company.name()}`
        : `${faker.commerce.department()} - ${faker.company.name()}`,
      amount: isCredit ? amount : -amount,
      type: isCredit ? 'credit' : 'debit',
      category: categories[Math.floor(Math.random() * categories.length)],
      owner_company: ownerCompany,
      bank_account: OUR_COMPANIES[ownerCompany].bank_account,
      balance_after: balances[ownerCompany],
      reconciled: Math.random() > 0.1
    };
    
    try {
      await api.post('/items/bank_transactions', transaction);
      
      if (i % 200 === 0) {
        console.log(`✅ ${i}/2000 transactions créées...`);
      }
    } catch (error) {
      console.error(`❌ Erreur transaction ${i}:`, error.response?.data?.errors?.[0]?.message);
    }
  }
  
  console.log('✅ 2000 transactions bancaires créées');
  console.log('\n💰 Soldes finaux:');
  Object.entries(balances).forEach(([company, balance]) => {
    console.log(`   ${company}: ${balance.toLocaleString('fr-CH')} CHF`);
  });
}

// 📋 ÉTAPE 6 : CRÉER DES TÂCHES/LIVRABLES
async function createDeliverables() {
  console.log('\n📋 Création de 300 tâches/livrables...');
  
  const tasksByCompany = {
    HYPERVISUAL: ['Maquette Homepage', 'Logo Design', 'Charte Graphique', 'Animation 3D'],
    DAINAMICS: ['API Development', 'Database Setup', 'Security Audit', 'Performance Optimization'],
    LEXAIA: ['Rédaction Contrat', 'Analyse Juridique', 'Veille Légale', 'Formation RGPD'],
    ENKI_REALTY: ['Visite Propriété', 'Estimation', 'Photos Pro', 'Plan Marketing'],
    TAKEOUT: ['Menu Design', 'Formation Staff', 'Audit Hygiène', 'Event Planning']
  };
  
  const statuses = ['todo', 'in_progress', 'review', 'completed'];
  const priorities = ['low', 'medium', 'high', 'critical'];
  
  for (let i = 0; i < 300; i++) {
    const ownerCompany = getRandomCompany();
    const tasks = tasksByCompany[ownerCompany];
    
    const deliverable = {
      title: `${tasks[Math.floor(Math.random() * tasks.length)]} #${i + 1}`,
      description: faker.lorem.paragraph(),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      due_date: randomDate(new Date(), new Date(2025, 11, 31)).toISOString().split('T')[0],
      owner_company: ownerCompany,
      estimated_hours: randomAmount(4, 80),
      actual_hours: randomAmount(2, 60),
      completion_percentage: Math.floor(Math.random() * 100)
    };
    
    try {
      await api.post('/items/deliverables', deliverable);
      
      if (i % 30 === 0) {
        console.log(`✅ ${i}/300 tâches créées...`);
      }
    } catch (error) {
      console.error(`❌ Erreur tâche ${i}:`, error.response?.data?.errors?.[0]?.message);
    }
  }
  
  console.log('✅ 300 tâches/livrables créées');
}

// 💸 ÉTAPE 7 : CRÉER DES DÉPENSES PAR ENTREPRISE
async function createExpenses() {
  console.log('\n💸 Création de 600 dépenses...');
  
  const expensesByCompany = {
    HYPERVISUAL: {
      rent: 8500,
      categories: ['Adobe Creative Cloud', 'Figma', 'Sketch', 'Stock Photos', 'Matériel Design']
    },
    DAINAMICS: {
      rent: 12000,
      categories: ['AWS', 'GitHub', 'Jira', 'Serveurs', 'Licences Dev']
    },
    LEXAIA: {
      rent: 5500,
      categories: ['LexisNexis', 'Formation', 'Documentation', 'Conseil', 'Abonnements']
    },
    ENKI_REALTY: {
      rent: 15000,
      categories: ['Marketing', 'Photos Pro', 'Staging', 'Publicité', 'Events']
    },
    TAKEOUT: {
      rent: 25000,
      categories: ['Fournisseurs', 'Équipement', 'Delivery', 'Marketing', 'Staff']
    }
  };
  
  for (let i = 0; i < 600; i++) {
    const ownerCompany = getRandomCompany();
    const companyExpenses = expensesByCompany[ownerCompany];
    
    const isRent = i % 10 === 0;
    
    const expense = {
      description: isRent 
        ? `Loyer mensuel ${ownerCompany}`
        : companyExpenses.categories[Math.floor(Math.random() * companyExpenses.categories.length)],
      amount: isRent 
        ? companyExpenses.rent
        : randomAmount(100, 10000),
      category: isRent ? 'rent' : 'operations',
      date: randomDate(new Date(2024, 0, 1), new Date()).toISOString().split('T')[0],
      owner_company: ownerCompany,
      recurring: isRent,
      frequency: isRent ? 'monthly' : null
    };
    
    try {
      await api.post('/items/expenses', expense);
      
      if (i % 60 === 0) {
        console.log(`✅ ${i}/600 dépenses créées...`);
      }
    } catch (error) {
      console.error(`❌ Erreur dépense ${i}:`, error.response?.data?.errors?.[0]?.message);
    }
  }
  
  console.log('✅ 600 dépenses créées');
}

// 📊 ÉTAPE 8 : CRÉER DES KPIs PAR ENTREPRISE
async function createKPIs() {
  console.log('\n📊 Création de métriques KPI par entreprise...');
  
  const metricsData = {
    HYPERVISUAL: { arr: 1250000, mrr: 104000, runway: 12, nps: 78 },
    DAINAMICS: { arr: 2100000, mrr: 175000, runway: 18, nps: 82 },
    LEXAIA: { arr: 890000, mrr: 74000, runway: 8, nps: 75 },
    ENKI_REALTY: { arr: 3500000, mrr: 291000, runway: 24, nps: 85 },
    TAKEOUT: { arr: 780000, mrr: 65000, runway: 6, nps: 71 }
  };
  
  for (const [company, metrics] of Object.entries(metricsData)) {
    // Créer des KPIs pour les 12 derniers mois
    for (let month = 11; month >= 0; month--) {
      const date = new Date();
      date.setMonth(date.getMonth() - month);
      
      const variance = 1 + (Math.random() * 0.2 - 0.1); // ±10% variation
      
      const kpis = [
        {
          metric_name: 'ARR',
          value: Math.floor(metrics.arr * variance),
          date: date.toISOString().split('T')[0],
          owner_company: company,
          category: 'revenue',
          trend: variance > 1 ? 'up' : 'down',
          change_percentage: ((variance - 1) * 100).toFixed(2)
        },
        {
          metric_name: 'MRR',
          value: Math.floor(metrics.mrr * variance),
          date: date.toISOString().split('T')[0],
          owner_company: company,
          category: 'revenue',
          trend: variance > 1 ? 'up' : 'down',
          change_percentage: ((variance - 1) * 100).toFixed(2)
        },
        {
          metric_name: 'Cash_Runway',
          value: metrics.runway + Math.floor(Math.random() * 4 - 2),
          date: date.toISOString().split('T')[0],
          owner_company: company,
          category: 'finance',
          trend: 'stable',
          change_percentage: 0
        },
        {
          metric_name: 'NPS',
          value: metrics.nps + Math.floor(Math.random() * 10 - 5),
          date: date.toISOString().split('T')[0],
          owner_company: company,
          category: 'satisfaction',
          trend: 'up',
          change_percentage: Math.random() * 5
        }
      ];
      
      for (const kpi of kpis) {
        try {
          await api.post('/items/kpis', kpi);
        } catch (error) {
          console.error(`❌ Erreur KPI:`, error.response?.data?.errors?.[0]?.message);
        }
      }
    }
    
    console.log(`✅ KPIs créés pour ${company}`);
  }
  
  console.log('✅ Toutes les métriques KPI créées');
}

// 🚀 FONCTION PRINCIPALE
async function populateMultiCompanyData() {
  console.log('🚀 DÉBUT DE LA POPULATION MULTI-ENTREPRISES');
  console.log('================================================');
  console.log('🏢 Nos 5 entreprises:');
  console.log('   1. HYPERVISUAL - Studio Créatif');
  console.log('   2. DAINAMICS - Solutions Tech & IA');
  console.log('   3. LEXAIA - Services Juridiques & IA');
  console.log('   4. ENKI REALTY - Immobilier Premium');
  console.log('   5. TAKEOUT - Restauration & Livraison');
  console.log('================================================\n');
  
  try {
    // Créer toutes les données
    const clientIds = await createClientCompanies();
    await createContacts(clientIds);
    await createProjects(clientIds);
    await createInvoices(clientIds);
    await createBankTransactions();
    await createDeliverables();
    await createExpenses();
    await createKPIs();
    
    console.log('\n================================================');
    console.log('✅ POPULATION MULTI-ENTREPRISES TERMINÉE !');
    console.log('================================================');
    console.log('\n📊 Résumé:');
    console.log('- 5 entreprises propriétaires (nos sociétés)');
    console.log('- 100 entreprises clientes');
    console.log('- 300 contacts (équipes + clients)');
    console.log('- 150 projets multi-entreprises');
    console.log('- 500 factures par entreprise');
    console.log('- 2000 transactions bancaires');
    console.log('- 300 tâches/livrables');
    console.log('- 600 dépenses');
    console.log('- KPIs sur 12 mois par entreprise');
    console.log('\n🎯 Dashboard CEO prêt sur http://localhost:5175');
    console.log('   Sélecteur d\'entreprise en haut pour switcher entre:');
    console.log('   HYPERVISUAL | DAINAMICS | LEXAIA | ENKI REALTY | TAKEOUT');
    
  } catch (error) {
    console.error('❌ ERREUR FATALE:', error);
  }
}

// LANCER LE SCRIPT
populateMultiCompanyData();