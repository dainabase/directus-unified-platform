import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN || 'e6Vt5LRHnYhq7-78yzoSxwdgjn2D6-JW';

// Créer le client axios
const client = axios.create({
  baseURL: DIRECTUS_URL,
  headers: {
    'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// Configuration des entreprises
const COMPANIES = {
  HYPERVISUAL: {
    name: 'HYPERVISUAL Studio Créatif',
    avgInvoice: 15000,
    invoiceCount: 36,
    expenseRatio: 0.72,
    clientPrefix: 'HV'
  },
  DAINAMICS: {
    name: 'DAINAMICS Solutions Tech', 
    avgInvoice: 12000,
    invoiceCount: 32,
    expenseRatio: 0.78,
    clientPrefix: 'DA'
  },
  LEXAIA: {
    name: 'LEXAIA Services Juridiques',
    avgInvoice: 8000,
    invoiceCount: 30,
    expenseRatio: 0.65,
    clientPrefix: 'LX'
  },
  ENKI_REALTY: {
    name: 'ENKI REALTY Immobilier Premium',
    avgInvoice: 35000,
    invoiceCount: 24,
    expenseRatio: 0.58,
    clientPrefix: 'ER'
  },
  TAKEOUT: {
    name: 'TAKEOUT Restauration',
    avgInvoice: 3500,
    invoiceCount: 45,
    expenseRatio: 0.85,
    clientPrefix: 'TO'
  }
};

// Générer des factures clients
async function createInvoices(company, config) {
  console.log(`   📄 Création des factures pour ${company}...`);
  const invoices = [];
  const today = new Date();
  
  for (let i = 0; i < config.invoiceCount; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - Math.floor(Math.random() * 90));
    
    const amount = config.avgInvoice * (0.5 + Math.random() * 1.5);
    const isPaid = Math.random() > 0.2; // 80% payées
    
    invoices.push({
      owner_company: company,
      client_name: `Client ${config.clientPrefix}-${i + 1}`,
      invoice_number: `${company}-2024-${String(i + 1).padStart(4, '0')}`,
      amount: Math.round(amount),
      status: isPaid ? 'paid' : 'pending',
      issue_date: date.toISOString().split('T')[0],
      due_date: new Date(date.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      payment_date: isPaid ? new Date(date.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : null,
      description: `Services ${config.name} - ${date.toLocaleString('fr-FR', { month: 'long', year: 'numeric' })}`
    });
  }
  
  try {
    await client.post('/items/client_invoices', invoices);
    console.log(`   ✅ ${invoices.length} factures créées`);
    return invoices;
  } catch (error) {
    console.error(`   ❌ Erreur factures: ${error.message}`);
    return [];
  }
}

// Générer des dépenses
async function createExpenses(company, totalRevenue) {
  console.log(`   💸 Création des dépenses pour ${company}...`);
  const expenses = [];
  const today = new Date();
  const config = COMPANIES[company];
  
  // Catégories de dépenses
  const categories = [
    { name: 'Salaires', ratio: 0.45 },
    { name: 'Loyer', ratio: 0.15 },
    { name: 'Marketing', ratio: 0.10 },
    { name: 'IT & Software', ratio: 0.08 },
    { name: 'Fournitures', ratio: 0.05 },
    { name: 'Autres', ratio: 0.17 }
  ];
  
  const totalExpenses = totalRevenue * config.expenseRatio;
  
  for (let month = 0; month < 3; month++) {
    for (const category of categories) {
      const date = new Date(today);
      date.setMonth(date.getMonth() - month);
      
      const monthlyAmount = (totalExpenses / 3) * category.ratio;
      const variation = 0.8 + Math.random() * 0.4; // ±20%
      
      expenses.push({
        owner_company: company,
        category: category.name,
        amount: Math.round(monthlyAmount * variation),
        date: date.toISOString().split('T')[0],
        description: `${category.name} - ${date.toLocaleString('fr-FR', { month: 'long', year: 'numeric' })}`,
        status: 'paid'
      });
    }
  }
  
  try {
    await client.post('/items/expenses', expenses);
    console.log(`   ✅ ${expenses.length} dépenses créées`);
    return expenses;
  } catch (error) {
    console.error(`   ❌ Erreur dépenses: ${error.message}`);
    return [];
  }
}

// Générer des transactions bancaires
async function createTransactions(company, invoices, expenses) {
  console.log(`   🏦 Création des transactions bancaires pour ${company}...`);
  const transactions = [];
  let balance = 100000 + Math.random() * 200000; // Solde initial
  
  // Transactions pour les factures payées
  const paidInvoices = invoices.filter(inv => inv.status === 'paid');
  for (const invoice of paidInvoices) {
    balance += invoice.amount;
    transactions.push({
      owner_company: company,
      date: invoice.payment_date,
      description: `Paiement ${invoice.client_name} - Facture ${invoice.invoice_number}`,
      amount: invoice.amount,
      type: 'credit',
      balance: Math.round(balance),
      category: 'Revenue'
    });
  }
  
  // Transactions pour les dépenses
  for (const expense of expenses) {
    balance -= expense.amount;
    transactions.push({
      owner_company: company,
      date: expense.date,
      description: expense.description,
      amount: -expense.amount,
      type: 'debit',
      balance: Math.round(balance),
      category: expense.category
    });
  }
  
  // Trier par date
  transactions.sort((a, b) => new Date(a.date) - new Date(b.date));
  
  // Recalculer les balances
  let runningBalance = 100000 + Math.random() * 200000;
  for (const tx of transactions) {
    runningBalance += tx.type === 'credit' ? tx.amount : Math.abs(tx.amount);
    tx.balance = Math.round(runningBalance);
  }
  
  try {
    await client.post('/items/bank_transactions', transactions);
    console.log(`   ✅ ${transactions.length} transactions créées`);
    console.log(`   💰 Balance finale: ${runningBalance.toLocaleString('fr-CH')} CHF`);
    return transactions;
  } catch (error) {
    console.error(`   ❌ Erreur transactions: ${error.message}`);
    return [];
  }
}

// Générer des abonnements
async function createSubscriptions(company) {
  console.log(`   🔄 Création des abonnements pour ${company}...`);
  
  const subscriptionTemplates = [
    { name: 'Microsoft 365', amount: 25, category: 'Software' },
    { name: 'Adobe Creative Cloud', amount: 80, category: 'Software' },
    { name: 'Slack', amount: 15, category: 'Communication' },
    { name: 'AWS', amount: 250, category: 'Infrastructure' },
    { name: 'Google Workspace', amount: 20, category: 'Software' },
    { name: 'Zoom', amount: 30, category: 'Communication' },
    { name: 'Notion', amount: 25, category: 'Productivity' },
    { name: 'GitHub', amount: 45, category: 'Development' },
    { name: 'Figma', amount: 60, category: 'Design' },
    { name: 'Salesforce', amount: 150, category: 'CRM' },
    { name: 'HubSpot', amount: 200, category: 'Marketing' },
    { name: 'Mailchimp', amount: 75, category: 'Marketing' }
  ];
  
  // Sélectionner 2 à 12 abonnements selon l'entreprise
  const count = company === 'TAKEOUT' ? 2 + Math.floor(Math.random() * 3) : 
                 company === 'ENKI_REALTY' ? 8 + Math.floor(Math.random() * 5) :
                 5 + Math.floor(Math.random() * 5);
  
  const selectedSubs = subscriptionTemplates
    .sort(() => Math.random() - 0.5)
    .slice(0, count);
  
  const subscriptions = selectedSubs.map(sub => ({
    owner_company: company,
    name: sub.name,
    amount: sub.amount * (0.8 + Math.random() * 0.4),
    billing_cycle: 'monthly',
    status: 'active',
    category: sub.category,
    start_date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    next_billing_date: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  }));
  
  try {
    await client.post('/items/subscriptions', subscriptions);
    console.log(`   ✅ ${subscriptions.length} abonnements créés`);
    return subscriptions;
  } catch (error) {
    console.error(`   ❌ Erreur abonnements: ${error.message}`);
    return [];
  }
}

// Générer des tâches
async function createTasks(company) {
  console.log(`   ✅ Création des tâches pour ${company}...`);
  
  const taskTemplates = [
    'Révision du contrat',
    'Préparation présentation client',
    'Mise à jour site web',
    'Analyse des métriques',
    'Formation équipe',
    'Audit de sécurité',
    'Optimisation processus',
    'Développement nouvelle feature',
    'Support client urgent',
    'Planning stratégique'
  ];
  
  const count = company === 'HYPERVISUAL' ? 80 + Math.floor(Math.random() * 40) :
                company === 'TAKEOUT' ? 15 + Math.floor(Math.random() * 10) :
                30 + Math.floor(Math.random() * 20);
  
  const tasks = [];
  for (let i = 0; i < count; i++) {
    const template = taskTemplates[Math.floor(Math.random() * taskTemplates.length)];
    const priority = Math.random() < 0.2 ? 'high' : Math.random() < 0.5 ? 'medium' : 'low';
    const status = Math.random() < 0.3 ? 'completed' : Math.random() < 0.6 ? 'in_progress' : 'todo';
    
    tasks.push({
      owner_company: company,
      title: `${template} #${i + 1}`,
      description: `${template} pour ${COMPANIES[company].name}`,
      priority: priority,
      status: status,
      due_date: new Date(Date.now() + (Math.random() - 0.3) * 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    });
  }
  
  try {
    await client.post('/items/tasks', tasks);
    console.log(`   ✅ ${tasks.length} tâches créées`);
    return tasks;
  } catch (error) {
    console.error(`   ❌ Erreur tâches: ${error.message}`);
    return [];
  }
}

// Générer des budgets
async function createBudgets(company) {
  console.log(`   💰 Création des budgets pour ${company}...`);
  
  const categories = ['Marketing', 'IT', 'Operations', 'HR'];
  const budgets = categories.map(category => ({
    owner_company: company,
    category: category,
    allocated_amount: 10000 + Math.floor(Math.random() * 40000),
    spent_amount: Math.floor(5000 + Math.random() * 20000),
    period: 'Q4 2024',
    status: 'active'
  }));
  
  try {
    await client.post('/items/budgets', budgets);
    console.log(`   ✅ ${budgets.length} budgets créés`);
    return budgets;
  } catch (error) {
    console.error(`   ❌ Erreur budgets: ${error.message}`);
    return [];
  }
}

// Générer des devis
async function createQuotes(company, config) {
  console.log(`   📝 Création des devis pour ${company}...`);
  
  const count = 5 + Math.floor(Math.random() * 10);
  const quotes = [];
  
  for (let i = 0; i < count; i++) {
    const status = Math.random() < 0.3 ? 'accepted' : Math.random() < 0.6 ? 'pending' : 'rejected';
    quotes.push({
      owner_company: company,
      client_name: `Prospect ${config.clientPrefix}-${i + 1}`,
      quote_number: `DEVIS-${company}-2024-${String(i + 1).padStart(3, '0')}`,
      amount: Math.round(config.avgInvoice * (0.8 + Math.random() * 1.5)),
      status: status,
      issue_date: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      valid_until: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: `Proposition ${config.name}`
    });
  }
  
  try {
    await client.post('/items/quotes', quotes);
    console.log(`   ✅ ${quotes.length} devis créés`);
    return quotes;
  } catch (error) {
    console.error(`   ❌ Erreur devis: ${error.message}`);
    return [];
  }
}

// Fonction principale
async function main() {
  console.log('🚀 Démarrage de la population des données');
  console.log('='.repeat(60));
  
  try {
    // Test de connexion
    console.log('\n🔌 Test de connexion à Directus...');
    await client.get('/server/ping');
    console.log('   ✅ Connecté à Directus');
    
    // Traiter chaque entreprise
    for (const [company, config] of Object.entries(COMPANIES)) {
      console.log(`\n🏢 ${company}`);
      console.log('='.repeat(50));
      
      // Créer les données
      const invoices = await createInvoices(company, config);
      const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0);
      const expenses = await createExpenses(company, totalRevenue);
      await createTransactions(company, invoices, expenses);
      await createSubscriptions(company);
      await createTasks(company);
      await createBudgets(company);
      await createQuotes(company, config);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Population terminée avec succès!');
    console.log('📊 Vérifiez le Dashboard V4 sur http://localhost:5173');
    
  } catch (error) {
    console.error('\n❌ Erreur fatale:', error.message);
    if (error.response) {
      console.error('Détails:', error.response.data);
    }
    process.exit(1);
  }
}

// Exécution
main();