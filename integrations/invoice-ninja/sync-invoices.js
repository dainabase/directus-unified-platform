import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Charger les variables d'environnement
dotenv.config({ path: join(__dirname, '.env.invoice-ninja') });

const INVOICE_NINJA_URL = process.env.APP_URL || 'http://localhost:8090';
const DIRECTUS_URL = 'http://localhost:8055';
const DIRECTUS_TOKEN = 'e6Vt5LRHnYhq7-78yzoSxwdgjn2D6-JW';

// Clients API
const directusClient = axios.create({
  baseURL: DIRECTUS_URL,
  headers: {
    'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// Mapping des statuts
const STATUS_MAP = {
  'draft': '1',
  'pending': '2',
  'sent': '2',
  'paid': '4',
  'overdue': '-1',
  'cancelled': '5',
  'archived': '6'
};

// Récupérer les credentials Invoice Ninja depuis Directus
async function getInvoiceNinjaCredentials() {
  console.log('🔑 Récupération des credentials Invoice Ninja...');
  
  try {
    const response = await directusClient.get('/items/invoice_ninja_companies');
    const companies = {};
    
    for (const company of response.data.data) {
      companies[company.company_key] = {
        id: company.invoice_ninja_id,
        token: company.api_token,
        name: company.company_name
      };
    }
    
    console.log(`   ✅ ${Object.keys(companies).length} compagnies trouvées`);
    return companies;
  } catch (error) {
    console.error('   ❌ Erreur récupération credentials:', error.message);
    return {};
  }
}

// Créer ou récupérer un client dans Invoice Ninja
async function ensureClient(clientData, companyToken) {
  const invoiceClient = axios.create({
    baseURL: INVOICE_NINJA_URL,
    headers: {
      'X-Api-Token': companyToken,
      'Content-Type': 'application/json'
    }
  });
  
  // Chercher le client existant
  try {
    const searchResponse = await invoiceClient.get('/api/v1/clients', {
      params: { email: clientData.email || `${clientData.name.toLowerCase().replace(/\s+/g, '.')}@client.local` }
    });
    
    if (searchResponse.data.data.length > 0) {
      return searchResponse.data.data[0].id;
    }
  } catch (error) {
    // Client non trouvé, on continue pour le créer
  }
  
  // Créer le client
  const newClient = {
    name: clientData.name,
    email: clientData.email || `${clientData.name.toLowerCase().replace(/\s+/g, '.')}@client.local`,
    phone: clientData.phone || '+41 00 000 00 00',
    address1: clientData.address || 'Adresse non spécifiée',
    city: clientData.city || 'Genève',
    postal_code: clientData.postal_code || '1200',
    country_id: '756' // Suisse
  };
  
  const response = await invoiceClient.post('/api/v1/clients', newClient);
  return response.data.data.id;
}

// Synchroniser une facture
async function syncInvoice(invoice, companyCredentials) {
  const invoiceClient = axios.create({
    baseURL: INVOICE_NINJA_URL,
    headers: {
      'X-Api-Token': companyCredentials.token,
      'Content-Type': 'application/json'
    }
  });
  
  try {
    // Créer ou récupérer le client
    const clientId = await ensureClient({
      name: invoice.client_name,
      email: invoice.client_email
    }, companyCredentials.token);
    
    // Préparer les données de la facture
    const invoiceData = {
      client_id: clientId,
      number: invoice.invoice_number,
      date: invoice.issue_date,
      due_date: invoice.due_date,
      status_id: STATUS_MAP[invoice.status] || '1',
      public_notes: invoice.description,
      line_items: [
        {
          product_key: 'SERVICE',
          notes: invoice.description || 'Services professionnels',
          cost: invoice.amount,
          quantity: 1,
          tax_rate1: 0,
          tax_name1: ''
        }
      ],
      custom_value1: invoice.id // Stocker l'ID Directus
    };
    
    // Vérifier si la facture existe déjà
    const searchResponse = await invoiceClient.get('/api/v1/invoices', {
      params: { number: invoice.invoice_number }
    });
    
    let result;
    if (searchResponse.data.data.length > 0) {
      // Mettre à jour la facture existante
      const existingId = searchResponse.data.data[0].id;
      result = await invoiceClient.put(`/api/v1/invoices/${existingId}`, invoiceData);
      console.log(`   📝 Mise à jour : ${invoice.invoice_number}`);
    } else {
      // Créer une nouvelle facture
      result = await invoiceClient.post('/api/v1/invoices', invoiceData);
      console.log(`   ✅ Créée : ${invoice.invoice_number}`);
    }
    
    // Si la facture est payée, marquer le paiement
    if (invoice.status === 'paid' && invoice.payment_date) {
      const paymentData = {
        invoice_id: result.data.data.id,
        amount: invoice.amount,
        date: invoice.payment_date,
        type_id: '1', // Cash
        transaction_reference: `PAYMENT-${invoice.invoice_number}`
      };
      
      await invoiceClient.post('/api/v1/payments', paymentData);
      console.log(`   💰 Paiement enregistré`);
    }
    
    return result.data.data;
  } catch (error) {
    console.error(`   ❌ Erreur sync ${invoice.invoice_number}:`, error.response?.data || error.message);
    return null;
  }
}

// Synchroniser toutes les factures
async function syncAllInvoices() {
  console.log('🔄 Synchronisation des factures Directus → Invoice Ninja');
  console.log('='.repeat(60));
  
  try {
    // Récupérer les credentials
    const companies = await getInvoiceNinjaCredentials();
    
    if (Object.keys(companies).length === 0) {
      console.error('❌ Aucune compagnie configurée. Exécutez d\'abord npm run setup');
      return;
    }
    
    // Récupérer toutes les factures de Directus
    console.log('\n📄 Récupération des factures Directus...');
    const invoicesResponse = await directusClient.get('/items/client_invoices?limit=-1&sort=-issue_date');
    const invoices = invoicesResponse.data.data;
    console.log(`   ✅ ${invoices.length} factures trouvées`);
    
    // Grouper par entreprise
    const invoicesByCompany = {};
    for (const invoice of invoices) {
      if (!invoicesByCompany[invoice.owner_company]) {
        invoicesByCompany[invoice.owner_company] = [];
      }
      invoicesByCompany[invoice.owner_company].push(invoice);
    }
    
    // Synchroniser par entreprise
    const results = {
      success: 0,
      failed: 0,
      skipped: 0
    };
    
    for (const [company, companyInvoices] of Object.entries(invoicesByCompany)) {
      if (!companies[company]) {
        console.log(`\n⚠️  ${company} : Pas de configuration Invoice Ninja`);
        results.skipped += companyInvoices.length;
        continue;
      }
      
      console.log(`\n🏢 ${companies[company].name} (${companyInvoices.length} factures)`);
      
      for (const invoice of companyInvoices) {
        const result = await syncInvoice(invoice, companies[company]);
        if (result) {
          results.success++;
        } else {
          results.failed++;
        }
      }
    }
    
    // Résumé
    console.log('\n' + '='.repeat(60));
    console.log('📊 Résumé de la synchronisation :');
    console.log(`   ✅ Succès : ${results.success}`);
    console.log(`   ❌ Échecs : ${results.failed}`);
    console.log(`   ⏭️  Ignorées : ${results.skipped}`);
    console.log('\n✅ Synchronisation terminée !');
    
  } catch (error) {
    console.error('\n❌ Erreur fatale:', error.message);
    process.exit(1);
  }
}

// Exécution
syncAllInvoices();