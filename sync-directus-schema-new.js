import axios from 'axios';

const API_URL = 'http://localhost:8055';
const TOKEN = 'e6Vt5LRHnYhq7-78yzoSxwdgjn2D6-JW'; // Utilisons le token existant

async function syncSchema() {
  console.log('🔄 Synchronisation du schéma Directus...');
  
  const client = axios.create({
    baseURL: API_URL,
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json'
    }
  });
  
  try {
    // Forcer Directus à recharger le schéma
    console.log('🔄 Vidage du cache Directus...');
    try {
      await client.post('/utils/cache/clear');
      console.log('✅ Cache Directus vidé');
    } catch (error) {
      console.log('⚠️  Cache clear non disponible ou non nécessaire');
    }
    
    // Vérifier les nouvelles colonnes
    const collections = ['companies', 'people', 'time_tracking', 'projects', 'client_invoices'];
    console.log('\n📊 Vérification des champs owner_company:');
    
    for (const collection of collections) {
      try {
        const fields = await client.get(`/fields/${collection}`);
        const hasOwnerCompany = fields.data.data.some(f => f.field === 'owner_company');
        console.log(`  ${collection}: ${hasOwnerCompany ? '✅' : '❌'} owner_company`);
      } catch (error) {
        console.log(`  ${collection}: ⚠️  Erreur - ${error.message}`);
      }
    }
    
    // Vérifier quelques enregistrements
    console.log('\n📊 Vérification des données:');
    try {
      const projects = await client.get('/items/projects?limit=5');
      console.log(`  Projets trouvés: ${projects.data.data.length}`);
      if (projects.data.data.length > 0) {
        console.log(`  Premier projet: ${projects.data.data[0].name || 'Sans nom'} (owner_company: ${projects.data.data[0].owner_company || 'Non défini'})`);
      }
    } catch (error) {
      console.log(`  Projets: ⚠️  Erreur - ${error.message}`);
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

syncSchema();