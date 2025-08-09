import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN || 'e6Vt5LRHnYhq7-78yzoSxwdgjn2D6-JW';

const client = axios.create({
  baseURL: DIRECTUS_URL,
  headers: {
    'Authorization': `Bearer ${DIRECTUS_TOKEN}`
  }
});

async function testConnection() {
  console.log('🔌 Test de connexion à Directus...\n');
  
  try {
    // Test 1: Server Info
    console.log('1️⃣ Test Server Info');
    const serverInfo = await client.get('/server/ping');
    console.log('✅ Serveur accessible');
    
    // Test 2: Collections
    console.log('\n2️⃣ Test Collections');
    const collections = await client.get('/collections');
    const kpisCollection = collections.data.data.find(c => c.collection === 'kpis');
    if (kpisCollection) {
      console.log('✅ Collection KPIs trouvée');
    } else {
      console.log('❌ Collection KPIs non trouvée');
    }
    
    // Test 3: KPIs existants
    console.log('\n3️⃣ Test KPIs existants');
    const companies = ['HYPERVISUAL', 'DAINAMICS', 'LEXAIA', 'ENKI_REALTY', 'TAKEOUT'];
    
    console.log('📊 KPIs par entreprise:');
    for (const company of companies) {
      const kpis = await client.get(`/items/kpis?filter[owner_company][_eq]=${company}&aggregate[count]=*`);
      const count = kpis.data.data[0]?.count || 0;
      console.log(`   ${company}: ${count} KPIs`);
    }
    
    console.log('\n✅ Connexion réussie !');
    
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
    if (error.response) {
      console.error('Détails:', error.response.data);
    }
    process.exit(1);
  }
}

testConnection();