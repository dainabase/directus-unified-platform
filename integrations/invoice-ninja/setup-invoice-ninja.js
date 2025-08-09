import axios from 'axios';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Charger les variables d'environnement
dotenv.config({ path: join(__dirname, '.env.invoice-ninja') });

const INVOICE_NINJA_URL = process.env.APP_URL || 'http://localhost:8090';
const DIRECTUS_URL = 'http://localhost:8055';
const DIRECTUS_TOKEN = 'e6Vt5LRHnYhq7-78yzoSxwdgjn2D6-JW';

// Configuration des entreprises
const COMPANIES = {
  HYPERVISUAL: {
    name: 'HYPERVISUAL Studio Créatif',
    address1: 'Rue de la Création 10',
    city: 'Genève',
    postal_code: '1201',
    phone: '+41 22 123 45 67',
    email: 'contact@hypervisual.ch',
    website: 'https://hypervisual.ch',
    vat_number: 'CHE-123.456.789'
  },
  DAINAMICS: {
    name: 'DAINAMICS Solutions Tech',
    address1: 'Avenue de la Technologie 25',
    city: 'Lausanne',
    postal_code: '1003',
    phone: '+41 21 234 56 78',
    email: 'info@dainamics.ch',
    website: 'https://dainamics.ch',
    vat_number: 'CHE-234.567.890'
  },
  LEXAIA: {
    name: 'LEXAIA Services Juridiques',
    address1: 'Place du Droit 5',
    city: 'Zurich',
    postal_code: '8001',
    phone: '+41 44 345 67 89',
    email: 'legal@lexaia.ch',
    website: 'https://lexaia.ch',
    vat_number: 'CHE-345.678.901'
  },
  ENKI_REALTY: {
    name: 'ENKI REALTY Immobilier Premium',
    address1: 'Quai du Luxe 100',
    city: 'Montreux',
    postal_code: '1820',
    phone: '+41 21 456 78 90',
    email: 'premium@enkirealty.ch',
    website: 'https://enkirealty.ch',
    vat_number: 'CHE-456.789.012'
  },
  TAKEOUT: {
    name: 'TAKEOUT Restauration',
    address1: 'Rue des Saveurs 15',
    city: 'Berne',
    postal_code: '3000',
    phone: '+41 31 567 89 01',
    email: 'commande@takeout.ch',
    website: 'https://takeout.ch',
    vat_number: 'CHE-567.890.123'
  }
};

// Attendre que Invoice Ninja soit prêt
async function waitForInvoiceNinja(maxAttempts = 30) {
  console.log('⏳ En attente du démarrage d\'Invoice Ninja...');
  
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await axios.get(`${INVOICE_NINJA_URL}/api/v1/health`, {
        timeout: 5000
      });
      
      if (response.status === 200) {
        console.log('✅ Invoice Ninja est prêt !');
        return true;
      }
    } catch (error) {
      process.stdout.write('.');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  throw new Error('Invoice Ninja n\'a pas démarré dans le temps imparti');
}

// Créer un compte admin
async function setupAdminAccount() {
  console.log('\n👤 Configuration du compte administrateur...');
  
  try {
    // Vérifier si le setup est nécessaire
    const checkResponse = await axios.get(`${INVOICE_NINJA_URL}/api/v1/ping`);
    
    if (checkResponse.data.setup !== true) {
      console.log('   ℹ️  Invoice Ninja est déjà configuré');
      return await loginAdmin();
    }
    
    // Créer le compte admin
    const setupData = {
      email: process.env.IN_USER_EMAIL,
      password: process.env.IN_PASSWORD,
      terms_of_service: true,
      privacy_policy: true
    };
    
    const response = await axios.post(`${INVOICE_NINJA_URL}/api/v1/setup`, setupData);
    console.log('   ✅ Compte administrateur créé');
    
    return response.data.data.token;
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('   ℹ️  Le compte existe déjà, connexion...');
      return await loginAdmin();
    }
    throw error;
  }
}

// Se connecter en tant qu'admin
async function loginAdmin() {
  const loginData = {
    email: process.env.IN_USER_EMAIL,
    password: process.env.IN_PASSWORD
  };
  
  const response = await axios.post(`${INVOICE_NINJA_URL}/api/v1/login`, loginData);
  return response.data.data.token;
}

// Créer les compagnies
async function createCompanies(token) {
  console.log('\n🏢 Création des compagnies...');
  const createdCompanies = {};
  
  // D'abord récupérer le compte principal
  const accountResponse = await axios.get(`${INVOICE_NINJA_URL}/api/v1/accounts`, {
    headers: { 'X-Api-Token': token }
  });
  
  const accountId = accountResponse.data.data[0].id;
  
  for (const [key, company] of Object.entries(COMPANIES)) {
    try {
      // Créer la compagnie
      const companyData = {
        name: company.name,
        address1: company.address1,
        city: company.city,
        postal_code: company.postal_code,
        country_id: '756', // Suisse
        phone: company.phone,
        email: company.email,
        website: company.website,
        vat_number: company.vat_number,
        currency_id: '109', // CHF
        language_id: '7', // Français
        timezone_id: '279', // Europe/Zurich
        date_format_id: '4', // DD/MM/YYYY
        military_time: true
      };
      
      const response = await axios.post(
        `${INVOICE_NINJA_URL}/api/v1/companies`,
        companyData,
        { headers: { 'X-Api-Token': token } }
      );
      
      createdCompanies[key] = {
        id: response.data.data.id,
        name: company.name,
        api_token: response.data.data.tokens[0].token
      };
      
      console.log(`   ✅ ${company.name} créée`);
    } catch (error) {
      console.error(`   ❌ Erreur pour ${company.name}:`, error.response?.data || error.message);
    }
  }
  
  return createdCompanies;
}

// Sauvegarder les credentials dans Directus
async function saveCredentialsToDirectus(companies) {
  console.log('\n💾 Sauvegarde des credentials dans Directus...');
  
  const directusClient = axios.create({
    baseURL: DIRECTUS_URL,
    headers: {
      'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });
  
  // Créer la collection si elle n'existe pas
  try {
    await directusClient.post('/collections', {
      collection: 'invoice_ninja_companies',
      fields: [
        { field: 'id', type: 'uuid', primary_key: true },
        { field: 'company_key', type: 'string' },
        { field: 'company_name', type: 'string' },
        { field: 'invoice_ninja_id', type: 'string' },
        { field: 'api_token', type: 'string' },
        { field: 'created_at', type: 'timestamp' }
      ]
    });
    console.log('   ✅ Collection invoice_ninja_companies créée');
  } catch (error) {
    if (error.response?.status === 409) {
      console.log('   ℹ️  Collection existe déjà');
    } else {
      console.error('   ⚠️  Erreur création collection:', error.message);
    }
  }
  
  // Sauvegarder les données
  for (const [key, company] of Object.entries(companies)) {
    try {
      await directusClient.post('/items/invoice_ninja_companies', {
        company_key: key,
        company_name: company.name,
        invoice_ninja_id: company.id,
        api_token: company.api_token
      });
      console.log(`   ✅ Credentials sauvegardés pour ${company.name}`);
    } catch (error) {
      console.error(`   ❌ Erreur sauvegarde ${company.name}:`, error.message);
    }
  }
}

// Fonction principale
async function main() {
  console.log('🚀 Configuration d\'Invoice Ninja v5');
  console.log('='.repeat(60));
  
  try {
    // Attendre que Invoice Ninja soit prêt
    await waitForInvoiceNinja();
    
    // Configurer le compte admin
    const adminToken = await setupAdminAccount();
    
    // Créer les compagnies
    const companies = await createCompanies(adminToken);
    
    // Sauvegarder dans Directus
    await saveCredentialsToDirectus(companies);
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Configuration terminée avec succès !');
    console.log('\n📋 Résumé :');
    console.log(`   - URL Invoice Ninja : ${INVOICE_NINJA_URL}`);
    console.log(`   - Email admin : ${process.env.IN_USER_EMAIL}`);
    console.log(`   - ${Object.keys(companies).length} compagnies créées`);
    console.log('\n🔗 Prochaines étapes :');
    console.log('   1. npm run sync - Pour synchroniser les factures');
    console.log('   2. npm run webhook - Pour démarrer le webhook receiver');
    
  } catch (error) {
    console.error('\n❌ Erreur fatale:', error.message);
    process.exit(1);
  }
}

// Exécution
main();