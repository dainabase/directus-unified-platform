const axios = require('axios');

// Configuration
const DIRECTUS_URL = 'http://localhost:8055';
const DIRECTUS_TOKEN = 'e6Vt5LRHnYhq7-78yzoSxwdgjn2D6-JW';
const ERPNEXT_URL = 'http://localhost:8083';
const ERPNEXT_USER = 'Administrator';
const ERPNEXT_PASSWORD = 'Admin@ERPNext2025';

async function migrateCompanies() {
  try {
    // Récupérer les companies depuis Directus
    const response = await axios.get(`${DIRECTUS_URL}/items/companies`, {
      headers: { 'Authorization': `Bearer ${DIRECTUS_TOKEN}` }
    });
    
    console.log(`📊 ${response.data.data.length} entreprises à migrer`);
    
    // Pour chaque entreprise, créer dans ERPNext
    for (const company of response.data.data) {
      console.log(`  - Migration de ${company.name}...`);
      // Logique de migration ici
    }
    
    console.log('✅ Migration terminée');
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

// Test de connexion
async function testConnection() {
  try {
    const response = await axios.get(`${ERPNEXT_URL}/api/method/frappe.auth.get_logged_user`, {
      auth: {
        username: ERPNEXT_USER,
        password: ERPNEXT_PASSWORD
      }
    });
    console.log('✅ Connexion ERPNext OK:', response.data);
  } catch (error) {
    console.error('❌ Connexion ERPNext échouée:', error.message);
  }
}

testConnection();