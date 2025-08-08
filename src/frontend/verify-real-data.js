const axios = require('axios');

const API_URL = 'http://localhost:8055';
const API_TOKEN = 'dashboard-api-token-2025';

async function verifyData() {
  console.log('🔍 Vérification des données Directus...\n');
  
  const api = axios.create({
    baseURL: API_URL,
    headers: { 'Authorization': `Bearer ${API_TOKEN}` }
  });
  
  try {
    // Vérifier companies
    const companies = await api.get('/items/companies?limit=5');
    console.log(`✅ Companies: ${companies.data.data.length}`);
    console.log('   Exemples:', companies.data.data.slice(0, 3).map(c => c.name));
    
    // Vérifier projects (sans sort pour éviter l'erreur 403)
    const projects = await api.get('/items/projects?limit=5');
    console.log(`\n✅ Projects: ${projects.data.data.length}`);
    console.log('   Exemples:', projects.data.data.slice(0, 3).map(p => p.name));
    
    // Vérifier invoices
    const invoices = await api.get('/items/client_invoices?limit=10');
    console.log(`\n✅ Invoices: ${invoices.data.data.length}`);
    const totalAmount = invoices.data.data.reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0);
    console.log(`   Total amount (10 premières): ${totalAmount.toLocaleString()} CHF`);
    
    // Calculer MRR/ARR depuis les vraies factures
    const allInvoices = await api.get('/items/client_invoices?filter[status][_eq]=paid');
    const paidInvoices = allInvoices.data.data;
    const totalRevenue = paidInvoices.reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0);
    const avgMonthlyRevenue = totalRevenue / 12; // Estimation
    console.log(`\n💰 Calculs Revenue:`);
    console.log(`   Total factures payées: ${totalRevenue.toLocaleString()} CHF`);
    console.log(`   MRR estimé: ${Math.round(avgMonthlyRevenue).toLocaleString()} CHF`);
    console.log(`   ARR estimé: ${Math.round(avgMonthlyRevenue * 12).toLocaleString()} CHF`);
    
    // Vérifier transactions
    const transactions = await api.get('/items/bank_transactions?limit=100');
    console.log(`\n✅ Transactions: ${transactions.data.data.length}`);
    const balance = transactions.data.data.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    console.log(`   Balance calculée: ${balance.toLocaleString()} CHF`);
    
    // Calculer burn rate
    const expenses = transactions.data.data.filter(t => parseFloat(t.amount) < 0);
    const totalExpenses = expenses.reduce((sum, t) => sum + Math.abs(parseFloat(t.amount || 0)), 0);
    const monthlyBurn = totalExpenses / 3; // Sur 3 mois
    const runway = balance > 0 ? Math.floor(balance / monthlyBurn) : 0;
    console.log(`\n🏃 Calculs Runway:`);
    console.log(`   Total dépenses: ${totalExpenses.toLocaleString()} CHF`);
    console.log(`   Burn rate mensuel: ${Math.round(monthlyBurn).toLocaleString()} CHF`);
    console.log(`   Runway: ${runway} mois`);
    
    // Vérifier si owner_company existe
    console.log('\n🏢 Vérification multi-entreprises:');
    const projectsWithOwner = await api.get('/items/projects?limit=1&fields=*');
    if (projectsWithOwner.data.data[0]?.owner_company) {
      console.log('   ✅ Champ owner_company présent');
      
      // Compter par entreprise
      for (const company of ['HYPERVISUAL', 'DAINAMICS', 'LEXAIA', 'ENKI_REALTY', 'TAKEOUT']) {
        const companyProjects = await api.get(`/items/projects?filter[owner_company][_eq]=${company}`);
        console.log(`   ${company}: ${companyProjects.data.data.length} projets`);
      }
    } else {
      console.log('   ❌ Champ owner_company manquant');
    }
    
    console.log('\n✅ TOUTES LES DONNÉES SONT ACCESSIBLES !');
    console.log('   Si elles ne s\'affichent pas dans le dashboard, vérifiez:');
    console.log('   1. Le mode démo est-il vraiment désactivé ?');
    console.log('   2. Les calculs dans les hooks sont-ils corrects ?');
    console.log('   3. Le cache du navigateur est-il vidé ?');
    
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
  }
}

verifyData();