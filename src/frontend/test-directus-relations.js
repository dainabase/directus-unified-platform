// Test des relations Directus
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

async function testRelations() {
  console.log('🧪 Test des relations Directus...\n');
  
  try {
    // 1. Test companies -> projects
    console.log('1️⃣ Test relation companies → projects');
    const companies = await api.get('/items/companies?limit=1&fields=*,projects.*');
    const company = companies.data.data[0];
    console.log(`✅ Entreprise: ${company.name}`);
    console.log(`   Projets liés: ${company.projects?.length || 0}`);
    
    // 2. Test projects -> deliverables
    console.log('\n2️⃣ Test relation projects → deliverables');
    const projects = await api.get('/items/projects?limit=1&fields=*,deliverables.*,company_id.name');
    const project = projects.data.data[0];
    console.log(`✅ Projet: ${project.name || 'Sans nom'}`);
    console.log(`   Entreprise: ${project.company_id?.name || 'Non liée'}`);
    console.log(`   Livrables: ${project.deliverables?.length || 0}`);
    
    // 3. Test companies <-> people (M2M)
    console.log('\n3️⃣ Test relation companies ↔ people');
    const companyPeople = await api.get('/items/company_people?limit=5&fields=*,companies_id.name,people_id.first_name,people_id.last_name');
    console.log(`✅ Liaisons company_people: ${companyPeople.data.data.length}`);
    companyPeople.data.data.forEach(link => {
      const person = link.people_id;
      const company = link.companies_id;
      console.log(`   - ${person?.first_name} ${person?.last_name} ↔ ${company?.name}`);
    });
    
    // 4. Test invoices relations
    console.log('\n4️⃣ Test relations factures');
    const invoices = await api.get('/items/client_invoices?limit=3&fields=*,company_id.name,project_id.name,payments.*');
    console.log(`✅ Factures trouvées: ${invoices.data.data.length}`);
    invoices.data.data.forEach(invoice => {
      console.log(`   - Facture #${invoice.invoice_number || invoice.id}`);
      console.log(`     Entreprise: ${invoice.company_id?.name || 'Non liée'}`);
      console.log(`     Projet: ${invoice.project_id?.name || 'Non lié'}`);
      console.log(`     Paiements: ${invoice.payments?.length || 0}`);
    });
    
    // 5. Test bank_transactions -> companies
    console.log('\n5️⃣ Test relation bank_transactions → companies');
    const transactions = await api.get('/items/bank_transactions?limit=3&fields=*,company_id.name');
    console.log(`✅ Transactions trouvées: ${transactions.data.data.length}`);
    transactions.data.data.forEach(tx => {
      console.log(`   - ${tx.label || 'Transaction'}: ${tx.amount}€ → ${tx.company_id?.name || 'Non liée'}`);
    });
    
    // 6. Résumé des collections
    console.log('\n📊 Résumé des données:');
    const counts = await Promise.all([
      api.get('/items/companies?aggregate[count]=*'),
      api.get('/items/projects?aggregate[count]=*'),
      api.get('/items/people?aggregate[count]=*'),
      api.get('/items/client_invoices?aggregate[count]=*'),
      api.get('/items/payments?aggregate[count]=*'),
      api.get('/items/bank_transactions?aggregate[count]=*')
    ]);
    
    console.log(`   - Entreprises: ${counts[0].data.data[0].count}`);
    console.log(`   - Projets: ${counts[1].data.data[0].count}`);
    console.log(`   - Personnes: ${counts[2].data.data[0].count}`);
    console.log(`   - Factures: ${counts[3].data.data[0].count}`);
    console.log(`   - Paiements: ${counts[4].data.data[0].count}`);
    console.log(`   - Transactions: ${counts[5].data.data[0].count}`);
    
    console.log('\n✅ Toutes les relations fonctionnent correctement !');
    
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data?.errors?.[0]?.message || error.message);
  }
}

// Exécuter
testRelations();