// 🚀 SCRIPT DE POPULATION MASSIVE DIRECTUS
// Créer des milliers d'enregistrements réalistes pour tester le dashboard SuperAdmin
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

// Utilitaires
const randomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min, max) => Math.random() * (max - min) + min;
const randomDate = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - randomNumber(0, daysAgo));
  return date.toISOString().split('T')[0];
};
const randomDateTime = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - randomNumber(0, daysAgo));
  date.setHours(randomNumber(8, 18), randomNumber(0, 59));
  return date.toISOString();
};

// Variables globales pour stocker les IDs créés
let companyIds = [];
let personIds = [];
let projectIds = [];
let invoiceIds = [];

async function populateDirectusMassive() {
  console.log('🚀 DÉBUT DE LA POPULATION MASSIVE DIRECTUS');
  console.log('═'.repeat(60));

  try {
    // Test de connexion
    await api.get('/server/ping');
    console.log('✅ Connexion API Directus réussie\\n');

    // ÉTAPE 1: Créer les 5 entreprises principales
    console.log('🏢 ÉTAPE 1: Création des 5 entreprises principales...');
    await createMainCompanies();

    // ÉTAPE 2: Créer 100+ contacts
    console.log('\\n👥 ÉTAPE 2: Création de 100+ contacts...');
    await createPeople();

    // ÉTAPE 3: Créer 50+ projets
    console.log('\\n📂 ÉTAPE 3: Création de 50+ projets...');
    await createProjects();

    // ÉTAPE 4: Créer 200+ factures clients
    console.log('\\n💰 ÉTAPE 4: Création de 200+ factures clients...');
    await createClientInvoices();

    // ÉTAPE 5: Créer 500+ transactions bancaires
    console.log('\\n🏦 ÉTAPE 5: Création de 500+ transactions bancaires...');
    await createBankTransactions();

    // ÉTAPE 6: Créer 150+ factures fournisseurs
    console.log('\\n📄 ÉTAPE 6: Création de 150+ factures fournisseurs...');
    await createSupplierInvoices();

    // ÉTAPE 7: Créer 100+ tâches/livrables
    console.log('\\n📋 ÉTAPE 7: Création de 100+ tâches/livrables...');
    await createDeliverables();

    // ÉTAPE 8: Créer données financières
    console.log('\\n💸 ÉTAPE 8: Création des données financières...');
    await createFinancialData();

    // ÉTAPE 9: Créer données opérationnelles
    console.log('\\n🔄 ÉTAPE 9: Création des données opérationnelles...');
    await createOperationalData();

    console.log('\\n🎉 POPULATION MASSIVE TERMINÉE !');
    console.log('═'.repeat(60));
    console.log('📊 Allez sur http://localhost:5175 pour voir le dashboard avec toutes les données !');

  } catch (error) {
    console.error('❌ Erreur fatale:', error.response?.data?.errors || error.message);
  }
}

// 🏢 ÉTAPE 1: Entreprises principales
async function createMainCompanies() {
  const mainCompanies = [
    {
      id: 'hypervisual-001',
      name: 'HYPERVISUAL',
      industry: 'Studio Créatif',
      website: 'https://hypervisual.ch',
      email: 'contact@hypervisual.ch',
      phone: '+41 21 555 01 01',
      address: 'Rue du Lac 15, 1005 Lausanne'
    },
    {
      id: 'dainamics-001', 
      name: 'DAINAMICS',
      industry: 'Solutions Tech & IA',
      website: 'https://dainamics.ch',
      email: 'hello@dainamics.ch',
      phone: '+41 21 555 02 02',
      address: 'Avenue de la Gare 20, 1003 Lausanne'
    },
    {
      id: 'lexaia-001',
      name: 'LEXAIA', 
      industry: 'Services Juridiques & IA',
      website: 'https://lexaia.ch',
      email: 'info@lexaia.ch',
      phone: '+41 21 555 03 03',
      address: 'Place de la Palud 7, 1003 Lausanne'
    },
    {
      id: 'enki-realty-001',
      name: 'ENKI REALTY',
      industry: 'Immobilier Premium', 
      website: 'https://enki-realty.ch',
      email: 'invest@enki-realty.ch',
      phone: '+41 21 555 04 04',
      address: 'Quai de Ouchy 1, 1006 Lausanne'
    },
    {
      id: 'takeout-001',
      name: 'TAKEOUT',
      industry: 'Restauration & Livraison',
      website: 'https://takeout.ch', 
      email: 'orders@takeout.ch',
      phone: '+41 21 555 05 05',
      address: 'Rue de Bourg 25, 1003 Lausanne'
    }
  ];

  for (const company of mainCompanies) {
    try {
      const response = await api.post('/items/companies', company);
      companyIds.push(response.data.data.id);
      console.log(`  ✅ ${company.name} créée`);
    } catch (error) {
      if (error.response?.data?.errors?.[0]?.message?.includes('duplicate')) {
        console.log(`  ℹ️  ${company.name} existe déjà`);
        companyIds.push(company.id);
      } else {
        console.log(`  ❌ Erreur ${company.name}: ${error.response?.data?.errors?.[0]?.message || error.message}`);
      }
    }
  }

  // Ajouter les entreprises existantes
  try {
    const existingCompanies = await api.get('/items/companies');
    existingCompanies.data.data.forEach(company => {
      if (!companyIds.includes(company.id)) {
        companyIds.push(company.id);
      }
    });
    console.log(`  📊 Total entreprises disponibles: ${companyIds.length}`);
  } catch (error) {
    console.log('  ⚠️  Erreur récupération entreprises existantes');
  }
}

// 👥 ÉTAPE 2: Contacts
async function createPeople() {
  const firstNames = ['Jean-Marie', 'Sophie', 'Marc', 'Lisa', 'David', 'Emma', 'Thomas', 'Marie', 'Paul', 'Julie', 'Nicolas', 'Sarah', 'Pierre', 'Laura', 'François', 'Alice', 'Vincent', 'Clara', 'Antoine', 'Léa'];
  const lastNames = ['Delaunay', 'Martin', 'Bernard', 'Thomas', 'Robert', 'Petit', 'Dubois', 'Moreau', 'Laurent', 'Simon', 'Michel', 'Lefebvre', 'Leroy', 'Roux', 'David', 'Bertrand', 'Morel', 'Fournier', 'Girard', 'Bonnet'];
  const roles = ['CEO', 'CTO', 'CFO', 'CMO', 'Développeur', 'Designer', 'Commercial', 'Chef de Projet', 'Consultant', 'Directeur Marketing'];
  const departments = ['Direction', 'Technique', 'Commercial', 'Marketing', 'Finance', 'RH', 'Support'];

  const targetCount = 120;
  let created = 0;

  for (let i = 0; i < targetCount; i++) {
    const firstName = randomElement(firstNames);
    const lastName = randomElement(lastNames);
    const companyId = randomElement(companyIds);
    
    const person = {
      first_name: firstName,
      last_name: lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@company${randomNumber(1,5)}.ch`,
      phone: `+41 ${randomNumber(20,79)} ${randomNumber(100,999)} ${randomNumber(10,99)} ${randomNumber(10,99)}`,
      role: randomElement(roles),
      department: randomElement(departments),
      company_id: companyId,
      is_primary_contact: Math.random() < 0.1, // 10% de contacts principaux
      linkedin: Math.random() < 0.6 ? `https://linkedin.com/in/${firstName.toLowerCase()}${lastName.toLowerCase()}` : null,
      hired_date: randomDate(365 * 3) // 3 ans
    };

    try {
      const response = await api.post('/items/people', person);
      personIds.push(response.data.data.id);
      created++;
      if (created % 20 === 0) {
        console.log(`  📈 Créé ${created}/${targetCount} contacts...`);
      }
    } catch (error) {
      console.log(`  ❌ Erreur contact ${i}: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
  }
  
  console.log(`  ✅ ${created} contacts créés au total`);
}

// 📂 ÉTAPE 3: Projets
async function createProjects() {
  const projectNames = [
    'Refonte Site Web Premium', 'App Mobile Banking', 'Dashboard Analytics', 
    'Système CRM Intégré', 'Plateforme E-commerce', 'API Gateway Enterprise',
    'Solution BI Advanced', 'Marketplace B2B', 'Infrastructure DevOps',
    'Migration Cloud AWS', 'Système de Paiement', 'Plateforme IoT Smart',
    'Solution RH Digital', 'Portail Client Premium', 'Système Facturation',
    'App Réalité Augmentée', 'Plateforme Formation', 'Système Logistique',
    'Solution Marketing Automation', 'Dashboard Temps Réel'
  ];
  
  const statuses = ['active', 'completed', 'planning', 'on_hold', 'cancelled'];
  const priorities = ['low', 'medium', 'high', 'critical'];
  const categories = ['web', 'mobile', 'infrastructure', 'data', 'design'];

  const targetCount = 60;
  let created = 0;

  for (let i = 0; i < targetCount; i++) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - randomNumber(0, 180));
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + randomNumber(30, 300));

    const budget = randomNumber(10000, 500000);
    const spent = budget * randomFloat(0.1, 0.8);

    const project = {
      name: `${randomElement(projectNames)} ${randomNumber(1, 99)}`,
      description: `Projet de ${randomElement(categories)} avec intégration ${randomElement(['IA', 'Cloud', 'Mobile', 'API', 'UX'])}`,
      status: randomElement(statuses),
      priority: randomElement(priorities),
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      budget: budget,
      spent_amount: Math.round(spent),
      completion_percentage: randomNumber(5, 95),
      company_id: randomElement(companyIds),
      project_manager_id: personIds.length > 0 ? randomElement(personIds) : null,
      team_size: randomNumber(2, 12),
      created_at: randomDateTime(120)
    };

    try {
      const response = await api.post('/items/projects', project);
      projectIds.push(response.data.data.id);
      created++;
      if (created % 10 === 0) {
        console.log(`  📈 Créé ${created}/${targetCount} projets...`);
      }
    } catch (error) {
      console.log(`  ❌ Erreur projet ${i}: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
  }

  console.log(`  ✅ ${created} projets créés au total`);
}

// 💰 ÉTAPE 4: Factures clients
async function createClientInvoices() {
  const statuses = ['paid', 'pending', 'overdue', 'sent', 'draft'];
  const clientNames = [
    'Swiss Medical Network', 'Credit Suisse', 'Nestlé SA', 'UBS Group',
    'Roche Holding', 'Novartis AG', 'Zurich Insurance', 'ABB Ltd',
    'Glencore International', 'LafargeHolcim', 'Adecco Group', 'Richemont',
    'Swatch Group', 'Givaudan SA', 'Schindler Group', 'SGS SA'
  ];

  const targetCount = 250;
  let created = 0;

  for (let i = 0; i < targetCount; i++) {
    const issueDate = new Date();
    issueDate.setDate(issueDate.getDate() - randomNumber(0, 365));
    const dueDate = new Date(issueDate);
    dueDate.setDate(dueDate.getDate() + randomNumber(15, 60));

    const amount = randomNumber(5000, 150000);
    const taxRate = 0.077; // TVA Suisse 7.7%
    const taxAmount = Math.round(amount * taxRate);

    const invoice = {
      invoice_number: `INV-${new Date().getFullYear()}-${String(i + 1).padStart(4, '0')}`,
      client_name: randomElement(clientNames),
      company_id: randomElement(companyIds),
      project_id: projectIds.length > 0 ? (Math.random() < 0.8 ? randomElement(projectIds) : null) : null,
      amount: amount,
      tax_amount: taxAmount,
      total_amount: amount + taxAmount,
      status: randomElement(statuses),
      issue_date: issueDate.toISOString().split('T')[0],
      due_date: dueDate.toISOString().split('T')[0],
      payment_terms: randomElement([15, 30, 45, 60]),
      currency: 'CHF',
      date_created: issueDate.toISOString()
    };

    // Si payé, ajouter date de paiement
    if (invoice.status === 'paid') {
      const paidDate = new Date(issueDate);
      paidDate.setDate(paidDate.getDate() + randomNumber(1, 45));
      invoice.paid_date = paidDate.toISOString().split('T')[0];
    }

    try {
      const response = await api.post('/items/client_invoices', invoice);
      invoiceIds.push(response.data.data.id);
      created++;
      if (created % 25 === 0) {
        console.log(`  📈 Créé ${created}/${targetCount} factures clients...`);
      }
    } catch (error) {
      console.log(`  ❌ Erreur facture ${i}: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
  }

  console.log(`  ✅ ${created} factures clients créées au total`);
}

// 🏦 ÉTAPE 5: Transactions bancaires
async function createBankTransactions() {
  const transactionTypes = [
    { type: 'credit', category: 'revenue', descriptions: ['Virement client', 'Paiement facture', 'Encaissement', 'Virement SEPA'] },
    { type: 'debit', category: 'payroll', descriptions: ['Salaires équipe', 'Charges sociales', 'Primes', 'Avantages sociaux'] },
    { type: 'debit', category: 'expenses', descriptions: ['Loyer bureaux', 'Électricité', 'Internet', 'Assurances'] },
    { type: 'debit', category: 'software', descriptions: ['Adobe Creative', 'Microsoft 365', 'Slack Premium', 'GitHub Enterprise'] },
    { type: 'debit', category: 'marketing', descriptions: ['Publicité Google', 'LinkedIn Ads', 'Events', 'Matériel marketing'] },
    { type: 'debit', category: 'travel', descriptions: ['Déplacements clients', 'Hotels', 'Restaurants', 'Transport'] }
  ];

  const targetCount = 600;
  let created = 0;
  let runningBalance = 850000; // Solde initial

  for (let i = 0; i < targetCount; i++) {
    const transactionType = randomElement(transactionTypes);
    const isCredit = transactionType.type === 'credit';
    
    let amount;
    if (isCredit) {
      amount = randomNumber(5000, 80000); // Revenus
    } else {
      // Dépenses selon catégorie
      switch (transactionType.category) {
        case 'payroll': amount = randomNumber(15000, 45000); break;
        case 'expenses': amount = randomNumber(2000, 15000); break;
        case 'software': amount = randomNumber(500, 5000); break;
        case 'marketing': amount = randomNumber(1000, 20000); break;
        case 'travel': amount = randomNumber(300, 3000); break;
        default: amount = randomNumber(500, 10000);
      }
      amount = -amount; // Négatif pour les débits
    }

    runningBalance += amount;

    const transaction = {
      date: randomDate(180),
      description: `${randomElement(transactionType.descriptions)} - ${randomElement(['Swiss Medical', 'Credit Suisse', 'UBS', 'Nestlé', 'Novartis'])}`,
      amount: amount,
      type: transactionType.type,
      category: transactionType.category,
      company_id: randomElement(companyIds),
      balance_after: Math.round(runningBalance),
      reconciled: Math.random() < 0.9, // 90% réconciliées
      reference: `TRX-${Date.now()}-${i}`,
      date_created: randomDateTime(180)
    };

    try {
      const response = await api.post('/items/bank_transactions', transaction);
      created++;
      if (created % 50 === 0) {
        console.log(`  📈 Créé ${created}/${targetCount} transactions bancaires... (Solde: ${Math.round(runningBalance).toLocaleString()} CHF)`);
      }
    } catch (error) {
      console.log(`  ❌ Erreur transaction ${i}: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
  }

  console.log(`  ✅ ${created} transactions bancaires créées au total`);
  console.log(`  💰 Solde final simulé: ${Math.round(runningBalance).toLocaleString()} CHF`);
}

// 📄 ÉTAPE 6: Factures fournisseurs
async function createSupplierInvoices() {
  const suppliers = [
    { name: 'Adobe Creative Cloud', category: 'software', amounts: [899, 1299, 1699] },
    { name: 'Microsoft 365', category: 'software', amounts: [299, 599, 899] },
    { name: 'AWS Services', category: 'infrastructure', amounts: [1500, 3000, 5000] },
    { name: 'Google Workspace', category: 'software', amounts: [180, 360, 720] },
    { name: 'Slack Premium', category: 'software', amounts: [240, 480, 960] },
    { name: 'GitHub Enterprise', category: 'software', amounts: [400, 800, 1200] },
    { name: 'Figma Professional', category: 'software', amounts: [144, 360, 720] },
    { name: 'Notion Team', category: 'software', amounts: [96, 240, 480] },
    { name: 'Swisscom Business', category: 'telecom', amounts: [450, 890, 1250] },
    { name: 'Migros Restaurant', category: 'food', amounts: [280, 560, 840] }
  ];

  const statuses = ['paid', 'pending', 'approved', 'processing'];
  const targetCount = 180;
  let created = 0;

  for (let i = 0; i < targetCount; i++) {
    const supplier = randomElement(suppliers);
    const issueDate = new Date();
    issueDate.setDate(issueDate.getDate() - randomNumber(0, 120));
    const dueDate = new Date(issueDate);
    dueDate.setDate(dueDate.getDate() + randomNumber(15, 45));

    const invoice = {
      invoice_number: `SUPP-${new Date().getFullYear()}-${String(i + 1).padStart(4, '0')}`,
      supplier_name: supplier.name,
      company_id: randomElement(companyIds),
      amount: randomElement(supplier.amounts),
      category: supplier.category,
      status: randomElement(statuses),
      issue_date: issueDate.toISOString().split('T')[0],
      due_date: dueDate.toISOString().split('T')[0],
      recurring: Math.random() < 0.7, // 70% récurrentes
      payment_method: randomElement(['credit_card', 'bank_transfer', 'direct_debit']),
      date_created: issueDate.toISOString()
    };

    try {
      const response = await api.post('/items/supplier_invoices', invoice);
      created++;
      if (created % 20 === 0) {
        console.log(`  📈 Créé ${created}/${targetCount} factures fournisseurs...`);
      }
    } catch (error) {
      console.log(`  ❌ Erreur facture fournisseur ${i}: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
  }

  console.log(`  ✅ ${created} factures fournisseurs créées au total`);
}

// 📋 ÉTAPE 7: Tâches/Livrables
async function createDeliverables() {
  const taskTitles = [
    'Design Interface Utilisateur', 'Développement API REST', 'Tests Unitaires',
    'Intégration Base de Données', 'Optimisation Performance', 'Documentation Technique',
    'Révision Code', 'Déploiement Production', 'Configuration SSL', 'Audit Sécurité',
    'Formation Utilisateurs', 'Migration Données', 'Backup Système', 'Monitoring Setup'
  ];

  const statuses = ['todo', 'in_progress', 'review', 'completed', 'blocked'];
  const priorities = ['low', 'medium', 'high', 'urgent', 'critical'];
  const targetCount = 120;
  let created = 0;

  for (let i = 0; i < targetCount; i++) {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + randomNumber(-10, 30)); // Certaines en retard

    const estimatedHours = randomNumber(4, 40);
    const actualHours = randomNumber(2, estimatedHours + 10);

    const deliverable = {
      title: `${randomElement(taskTitles)} - Phase ${randomNumber(1, 4)}`,
      description: `Tâche ${randomElement(['critique', 'importante', 'urgente', 'prioritaire'])} à réaliser dans les délais`,
      project_id: projectIds.length > 0 ? randomElement(projectIds) : null,
      assigned_to: personIds.length > 0 ? randomElement(personIds) : null,
      status: randomElement(statuses),
      priority: randomElement(priorities),
      due_date: dueDate.toISOString(),
      estimated_hours: estimatedHours,
      actual_hours: Math.random() < 0.6 ? actualHours : null, // 60% ont des heures réelles
      completion_percentage: randomNumber(0, 100),
      date_created: randomDateTime(90)
    };

    try {
      const response = await api.post('/items/deliverables', deliverable);
      created++;
      if (created % 15 === 0) {
        console.log(`  📈 Créé ${created}/${targetCount} tâches/livrables...`);
      }
    } catch (error) {
      console.log(`  ❌ Erreur tâche ${i}: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
  }

  console.log(`  ✅ ${created} tâches/livrables créées au total`);
}

// 💸 ÉTAPE 8: Données financières
async function createFinancialData() {
  console.log('  💰 Création des expenses...');
  await createExpenses();
  console.log('  💳 Création des payments...');
  await createPayments();
  console.log('  📊 Création des budgets...');
  await createBudgets();
}

async function createExpenses() {
  const expenseTypes = [
    { category: 'rent', descriptions: ['Loyer bureaux Lausanne', 'Charges locatives'], amounts: [8500, 12000] },
    { category: 'utilities', descriptions: ['Électricité', 'Chauffage', 'Internet'], amounts: [450, 890] },
    { category: 'insurance', descriptions: ['Assurance RC', 'Assurance matériel'], amounts: [650, 1200] },
    { category: 'equipment', descriptions: ['Ordinateurs portables', 'Écrans', 'Mobilier'], amounts: [2500, 15000] }
  ];

  let created = 0;
  for (let i = 0; i < 80; i++) {
    const expenseType = randomElement(expenseTypes);
    const expense = {
      description: randomElement(expenseType.descriptions),
      amount: randomElement(expenseType.amounts),
      category: expenseType.category,
      company_id: randomElement(companyIds),
      date: randomDate(90),
      recurring: Math.random() < 0.6,
      frequency: randomElement(['monthly', 'quarterly', 'yearly']),
      date_created: randomDateTime(90)
    };

    try {
      await api.post('/items/expenses', expense);
      created++;
    } catch (error) {
      // Silencieux si la collection n'existe pas
    }
  }
  if (created > 0) console.log(`    ✅ ${created} expenses créées`);
}

async function createPayments() {
  let created = 0;
  // Créer des paiements pour certaines factures
  for (let i = 0; i < Math.min(invoiceIds.length, 50); i++) {
    const payment = {
      amount: randomNumber(5000, 80000),
      payment_date: randomDate(60),
      invoice_id: invoiceIds[i],
      payment_method: randomElement(['bank_transfer', 'credit_card', 'cash', 'check']),
      reference: `PAY-${new Date().getFullYear()}-${String(i + 1).padStart(4, '0')}`,
      status: randomElement(['completed', 'pending', 'failed']),
      date_created: randomDateTime(60)
    };

    try {
      await api.post('/items/payments', payment);
      created++;
    } catch (error) {
      // Silencieux si la collection n'existe pas
    }
  }
  if (created > 0) console.log(`    ✅ ${created} payments créés`);
}

async function createBudgets() {
  const budgetCategories = ['marketing', 'development', 'operations', 'sales', 'hr'];
  let created = 0;
  
  for (let i = 0; i < 25; i++) {
    const totalAmount = randomNumber(20000, 150000);
    const spent = totalAmount * randomFloat(0.2, 0.8);

    const budget = {
      title: `Budget ${randomElement(budgetCategories)} Q${randomNumber(1,4)} 2025`,
      category: randomElement(budgetCategories),
      amount: totalAmount,
      spent: Math.round(spent),
      company_id: randomElement(companyIds),
      year: 2025,
      quarter: randomNumber(1, 4),
      status: randomElement(['active', 'completed', 'exceeded']),
      date_created: randomDateTime(120)
    };

    try {
      await api.post('/items/budgets', budget);
      created++;
    } catch (error) {
      // Silencieux si la collection n'existe pas
    }
  }
  if (created > 0) console.log(`    ✅ ${created} budgets créés`);
}

// 🔄 ÉTAPE 9: Données opérationnelles
async function createOperationalData() {
  console.log('  💼 Création des subscriptions...');
  await createSubscriptions();
  console.log('  📄 Création des contracts...');  
  await createContracts();
  console.log('  💡 Création des proposals...');
  await createProposals();
}

async function createSubscriptions() {
  const subscriptionTypes = [
    { name: 'Maintenance Site Premium', amounts: [2500, 5000, 7500] },
    { name: 'Support Technique 24/7', amounts: [1200, 2400, 3600] },
    { name: 'Hosting Cloud Enterprise', amounts: [800, 1500, 2500] },
    { name: 'Consulting Mensuel', amounts: [3000, 6000, 12000] }
  ];

  let created = 0;
  for (let i = 0; i < 60; i++) {
    const subType = randomElement(subscriptionTypes);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - randomNumber(0, 365));
    const nextBilling = new Date(startDate);
    nextBilling.setMonth(nextBilling.getMonth() + 1);

    const subscription = {
      name: subType.name,
      client_id: randomElement(companyIds),
      company_id: randomElement(companyIds),
      amount: randomElement(subType.amounts),
      frequency: randomElement(['monthly', 'quarterly', 'yearly']),
      status: randomElement(['active', 'paused', 'cancelled']),
      start_date: startDate.toISOString().split('T')[0],
      next_billing_date: nextBilling.toISOString().split('T')[0],
      auto_renew: Math.random() < 0.8,
      date_created: startDate.toISOString()
    };

    try {
      await api.post('/items/subscriptions', subscription);
      created++;
    } catch (error) {
      // Silencieux si erreur
    }
  }
  if (created > 0) console.log(`    ✅ ${created} subscriptions créées`);
}

async function createContracts() {
  let created = 0;
  for (let i = 0; i < 30; i++) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - randomNumber(0, 180));
    const endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + randomNumber(1, 3));

    const contract = {
      title: `Contrat ${randomElement(['Cadre', 'Premium', 'Enterprise', 'Standard'])} Development`,
      client_id: randomElement(companyIds),
      company_id: randomElement(companyIds),
      value: randomNumber(50000, 800000),
      status: randomElement(['active', 'signed', 'expired', 'terminated']),
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      auto_renew: Math.random() < 0.6,
      date_created: startDate.toISOString()
    };

    try {
      await api.post('/items/contracts', contract);
      created++;
    } catch (error) {
      // Silencieux si erreur
    }
  }
  if (created > 0) console.log(`    ✅ ${created} contracts créés`);
}

async function createProposals() {
  const proposalTitles = [
    'App Mobile Banking Premium', 'Refonte Site E-commerce', 'Dashboard BI Advanced',
    'Système CRM Intégré', 'Plateforme Formation', 'Solution IoT Smart'
  ];

  let created = 0;
  for (let i = 0; i < 40; i++) {
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + randomNumber(15, 60));

    const proposal = {
      title: `Proposition ${randomElement(proposalTitles)}`,
      client_id: randomElement(companyIds),
      company_id: randomElement(companyIds),
      amount: randomNumber(80000, 500000),
      status: randomElement(['draft', 'sent', 'accepted', 'rejected', 'negotiation']),
      valid_until: validUntil.toISOString().split('T')[0],
      probability: randomNumber(25, 90),
      date_created: randomDateTime(60)
    };

    try {
      await api.post('/items/proposals', proposal);
      created++;
    } catch (error) {
      // Silencieux si erreur
    }
  }
  if (created > 0) console.log(`    ✅ ${created} proposals créées`);
}

// Exécuter
populateDirectusMassive();