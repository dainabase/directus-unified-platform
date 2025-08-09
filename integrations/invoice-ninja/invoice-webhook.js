import express from 'express';
import crypto from 'crypto';
import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Charger les variables d'environnement
dotenv.config({ path: join(__dirname, '.env.invoice-ninja') });

const app = express();
app.use(express.json());

const WEBHOOK_PORT = 3001;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
const DIRECTUS_URL = 'http://localhost:8055';
const DIRECTUS_TOKEN = 'e6Vt5LRHnYhq7-78yzoSxwdgjn2D6-JW';

// Client Directus
const directusClient = axios.create({
  baseURL: DIRECTUS_URL,
  headers: {
    'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// Mapping inverse des statuts
const STATUS_MAP_REVERSE = {
  '1': 'draft',
  '2': 'sent',
  '3': 'viewed',
  '4': 'paid',
  '5': 'cancelled',
  '6': 'archived',
  '-1': 'overdue'
};

// Vérifier la signature du webhook
function verifyWebhookSignature(payload, signature) {
  const hash = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return hash === signature;
}

// Récupérer la correspondance entreprise depuis Invoice Ninja ID
async function getCompanyFromInvoiceNinja(companyId) {
  try {
    const response = await directusClient.get('/items/invoice_ninja_companies', {
      params: {
        filter: { invoice_ninja_id: { _eq: companyId } }
      }
    });
    
    if (response.data.data.length > 0) {
      return response.data.data[0].company_key;
    }
  } catch (error) {
    console.error('Erreur récupération company:', error.message);
  }
  return null;
}

// Traiter les événements Invoice Ninja
async function processWebhookEvent(event) {
  console.log(`\n📨 Événement reçu: ${event.event_type}`);
  
  switch (event.event_type) {
    case 'create_invoice':
    case 'update_invoice':
      await handleInvoiceEvent(event);
      break;
      
    case 'create_payment':
    case 'update_payment':
      await handlePaymentEvent(event);
      break;
      
    case 'create_client':
    case 'update_client':
      console.log('   ℹ️  Événement client ignoré (géré via les factures)');
      break;
      
    default:
      console.log(`   ⚠️  Type d'événement non géré: ${event.event_type}`);
  }
}

// Traiter les événements de facture
async function handleInvoiceEvent(event) {
  const invoice = event.invoice;
  
  try {
    // Récupérer l'entreprise correspondante
    const ownerCompany = await getCompanyFromInvoiceNinja(invoice.company_id);
    if (!ownerCompany) {
      console.error('   ❌ Entreprise non trouvée pour company_id:', invoice.company_id);
      return;
    }
    
    // Vérifier si la facture existe dans Directus (via custom_value1)
    let directusInvoiceId = invoice.custom_value1;
    
    if (!directusInvoiceId) {
      // Chercher par numéro de facture
      const searchResponse = await directusClient.get('/items/client_invoices', {
        params: {
          filter: {
            invoice_number: { _eq: invoice.number },
            owner_company: { _eq: ownerCompany }
          }
        }
      });
      
      if (searchResponse.data.data.length > 0) {
        directusInvoiceId = searchResponse.data.data[0].id;
      }
    }
    
    // Préparer les données pour Directus
    const invoiceData = {
      invoice_number: invoice.number,
      client_name: invoice.client?.name || 'Client non spécifié',
      amount: invoice.amount,
      status: STATUS_MAP_REVERSE[invoice.status_id] || 'draft',
      issue_date: invoice.date,
      due_date: invoice.due_date,
      description: invoice.public_notes || '',
      owner_company: ownerCompany
    };
    
    if (directusInvoiceId) {
      // Mettre à jour
      await directusClient.patch(`/items/client_invoices/${directusInvoiceId}`, invoiceData);
      console.log(`   ✅ Facture mise à jour: ${invoice.number}`);
    } else {
      // Créer
      const response = await directusClient.post('/items/client_invoices', invoiceData);
      console.log(`   ✅ Facture créée: ${invoice.number}`);
    }
    
  } catch (error) {
    console.error('   ❌ Erreur traitement facture:', error.response?.data || error.message);
  }
}

// Traiter les événements de paiement
async function handlePaymentEvent(event) {
  const payment = event.payment;
  
  try {
    // Pour chaque facture liée au paiement
    for (const paymentable of payment.paymentables || []) {
      if (paymentable.invoice_id) {
        // Chercher la facture dans Directus
        const invoiceResponse = await directusClient.get('/items/client_invoices', {
          params: {
            filter: {
              invoice_number: { _eq: paymentable.invoice?.number }
            }
          }
        });
        
        if (invoiceResponse.data.data.length > 0) {
          const directusInvoice = invoiceResponse.data.data[0];
          
          // Mettre à jour le statut et la date de paiement
          await directusClient.patch(`/items/client_invoices/${directusInvoice.id}`, {
            status: 'paid',
            payment_date: payment.date
          });
          
          console.log(`   ✅ Paiement enregistré pour: ${paymentable.invoice?.number}`);
        }
      }
    }
  } catch (error) {
    console.error('   ❌ Erreur traitement paiement:', error.response?.data || error.message);
  }
}

// Routes
app.post('/webhook/invoice-ninja', async (req, res) => {
  console.log('\n🔔 Webhook reçu d\'Invoice Ninja');
  
  // Vérifier la signature
  const signature = req.headers['x-ninja-signature'];
  if (signature && !verifyWebhookSignature(req.body, signature)) {
    console.error('   ❌ Signature invalide');
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  try {
    // Traiter l'événement
    await processWebhookEvent(req.body);
    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('   ❌ Erreur traitement webhook:', error.message);
    res.status(500).json({ error: 'Processing error' });
  }
});

// Route de santé
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'invoice-ninja-webhook',
    port: WEBHOOK_PORT,
    timestamp: new Date().toISOString()
  });
});

// Démarrer le serveur
app.listen(WEBHOOK_PORT, () => {
  console.log('🚀 Invoice Ninja Webhook Receiver');
  console.log('='.repeat(60));
  console.log(`📡 Écoute sur le port ${WEBHOOK_PORT}`);
  console.log(`🔗 URL du webhook : http://localhost:${WEBHOOK_PORT}/webhook/invoice-ninja`);
  console.log('\n⚠️  Configuration dans Invoice Ninja :');
  console.log('   1. Aller dans Settings > Integrations > Webhooks');
  console.log('   2. Ajouter un nouveau webhook');
  console.log(`   3. URL : http://host.docker.internal:${WEBHOOK_PORT}/webhook/invoice-ninja`);
  console.log('   4. Secret : ' + WEBHOOK_SECRET);
  console.log('   5. Événements : Invoice Created/Updated, Payment Created');
  console.log('\n✅ Prêt à recevoir des webhooks !');
});