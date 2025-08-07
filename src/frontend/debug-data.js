// debug-data.js - Analyse structure données Directus
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

async function debugData() {
  console.log('🔍 ANALYSE STRUCTURE DONNÉES DIRECTUS\n');
  
  try {
    // Test 1: Structure companies
    const companies = await api.get('/items/companies?limit=3');
    console.log('📊 COMPANIES:');
    console.log('- Nombre:', companies.data.data.length);
    console.log('- Exemple:', companies.data.data[0]);
    console.log('- Champs disponibles:', companies.data.data[0] ? Object.keys(companies.data.data[0]) : 'Aucun');
    
    // Test 2: Structure projects
    const projects = await api.get('/items/projects?limit=3');
    console.log('\n📊 PROJECTS:');
    console.log('- Nombre:', projects.data.data.length);
    console.log('- Exemple:', projects.data.data[0]);
    console.log('- Champs disponibles:', projects.data.data[0] ? Object.keys(projects.data.data[0]) : 'Aucun');
    
    // Test 3: Structure invoices
    const invoices = await api.get('/items/client_invoices?limit=3');
    console.log('\n📊 CLIENT_INVOICES:');
    console.log('- Nombre:', invoices.data.data.length);
    console.log('- Exemple:', invoices.data.data[0]);
    console.log('- Champs disponibles:', invoices.data.data[0] ? Object.keys(invoices.data.data[0]) : 'Aucun');
    
    // Test 4: Structure bank_transactions
    const bank = await api.get('/items/bank_transactions?limit=3');
    console.log('\n📊 BANK_TRANSACTIONS:');
    console.log('- Nombre:', bank.data.data.length);
    console.log('- Exemple:', bank.data.data[0]);
    console.log('- Champs disponibles:', bank.data.data[0] ? Object.keys(bank.data.data[0]) : 'Aucun');
    
    // Test 5: Structure subscriptions
    const subscriptions = await api.get('/items/subscriptions?limit=3');
    console.log('\n📊 SUBSCRIPTIONS:');
    console.log('- Nombre:', subscriptions.data.data.length);
    console.log('- Exemple:', subscriptions.data.data[0]);
    console.log('- Champs disponibles:', subscriptions.data.data[0] ? Object.keys(subscriptions.data.data[0]) : 'Aucun');
    
    // Test 6: Vérifier les agrégations client_invoices
    console.log('\n💰 AGRÉGATION CLIENT_INVOICES:');
    try {
      const aggregate1 = await api.get('/items/client_invoices?aggregate[sum]=amount&aggregate[count]=*');
      console.log('- Par "amount":', aggregate1.data.data);
      
      const aggregate2 = await api.get('/items/client_invoices?aggregate[sum]=amount_ttc&aggregate[count]=*');
      console.log('- Par "amount_ttc":', aggregate2.data.data);
    } catch (err) {
      console.log('- Erreur agrégation:', err.response?.data?.errors?.[0]?.message || err.message);
    }
    
    // Test 7: Calculer le cash flow
    console.log('\n🏦 CALCUL CASH FLOW:');
    const allBankTx = await api.get('/items/bank_transactions');
    const transactions = allBankTx.data.data;
    
    let totalIncome = 0;
    let totalExpense = 0;
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    
    transactions.forEach(tx => {
      const amount = parseFloat(tx.amount || 0);
      if (amount > 0) {
        totalIncome += amount;
      } else {
        totalExpense += Math.abs(amount);
      }
    });
    
    console.log(`- Total revenus: ${totalIncome}€`);
    console.log(`- Total dépenses: ${totalExpense}€`);
    console.log(`- Solde net: ${totalIncome - totalExpense}€`);
    
    // Test 8: Vérifier deliverables pour les tâches urgentes
    console.log('\n🚨 DELIVERABLES (Tâches urgentes):');
    const deliverables = await api.get('/items/deliverables?limit=5');
    console.log('- Nombre:', deliverables.data.data.length);
    console.log('- Exemple:', deliverables.data.data[0]);
    console.log('- Champs disponibles:', deliverables.data.data[0] ? Object.keys(deliverables.data.data[0]) : 'Aucun');
    
    // Test 9: Vérifier les champs de dates
    console.log('\n📅 FORMATS DE DATES:');
    if (projects.data.data[0]) {
      const proj = projects.data.data[0];
      console.log('- start_date:', proj.start_date, typeof proj.start_date);
      console.log('- end_date:', proj.end_date, typeof proj.end_date);
      console.log('- created_at:', proj.created_at, typeof proj.created_at);
    }
    
    if (invoices.data.data[0]) {
      const inv = invoices.data.data[0];
      console.log('- issue_date:', inv.issue_date, typeof inv.issue_date);
      console.log('- due_date:', inv.due_date, typeof inv.due_date);
    }
    
    // Test 10: Vérifier les champs numériques pour KPIs
    console.log('\n💰 CHAMPS NUMÉRIQUES POUR KPIs:');
    if (invoices.data.data[0]) {
      const inv = invoices.data.data[0];
      console.log('Facture exemple:');
      console.log('- amount:', inv.amount, typeof inv.amount);
      console.log('- amount_ttc:', inv.amount_ttc, typeof inv.amount_ttc);
      console.log('- total_amount:', inv.total_amount, typeof inv.total_amount);
      console.log('- status:', inv.status);
    }
    
    if (projects.data.data[0]) {
      const proj = projects.data.data[0];
      console.log('\nProjet exemple:');
      console.log('- budget:', proj.budget, typeof proj.budget);
      console.log('- status:', proj.status);
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.response?.data?.errors?.[0]?.message || error.message);
  }
}

// Exécuter
debugData().then(() => {
  console.log('\n✅ Diagnostic terminé');
}).catch(err => {
  console.error('\n❌ Erreur fatale:', err);
});