/**
 * Invoice Ninja Router - ES Modules
 * Routes API pour l'integration Invoice Ninja v5
 * @version 2.0.0
 */

import express from 'express';
import InvoiceNinjaAPI from './invoice-ninja-api.js';
import { createDirectus, rest, staticToken, readItems, updateItem, createItem } from '@directus/sdk';

const router = express.Router();

// Initialiser Invoice Ninja API
const invoiceNinja = new InvoiceNinjaAPI({
  baseURL: process.env.INVOICE_NINJA_URL || 'http://localhost:8080',
  apiToken: process.env.INVOICE_NINJA_API_TOKEN
});

// Initialiser Directus SDK v17
const getDirectus = () => {
  return createDirectus(process.env.DIRECTUS_URL || 'http://localhost:8055')
    .with(staticToken(process.env.DIRECTUS_TOKEN || 'e6Vt5LRHnYhq7-78yzoSxwdgjn2D6-JW'))
    .with(rest());
};

// === CLIENTS ===

// Liste des clients
router.get('/clients', async (req, res) => {
  try {
    const clients = await invoiceNinja.getClients(req.query);
    res.json({ success: true, data: clients });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Détails d'un client
router.get('/clients/:id', async (req, res) => {
  try {
    const client = await invoiceNinja.getClient(req.params.id);
    res.json({ success: true, data: client });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Créer un client
router.post('/clients', async (req, res) => {
  try {
    const client = await invoiceNinja.createClient(req.body);
    res.json({ success: true, data: client });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Mettre à jour un client
router.put('/clients/:id', async (req, res) => {
  try {
    const client = await invoiceNinja.updateClient(req.params.id, req.body);
    res.json({ success: true, data: client });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Supprimer un client
router.delete('/clients/:id', async (req, res) => {
  try {
    await invoiceNinja.deleteClient(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// === FACTURES ===

// Liste des factures
router.get('/invoices', async (req, res) => {
  try {
    const invoices = await invoiceNinja.getInvoices(req.query);
    res.json({ success: true, data: invoices });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Détails d'une facture
router.get('/invoices/:id', async (req, res) => {
  try {
    const invoice = await invoiceNinja.getInvoice(req.params.id);
    res.json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Créer une facture
router.post('/invoices', async (req, res) => {
  try {
    const invoice = await invoiceNinja.createInvoice(req.body);
    res.json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Mettre à jour une facture
router.put('/invoices/:id', async (req, res) => {
  try {
    const invoice = await invoiceNinja.updateInvoice(req.params.id, req.body);
    res.json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Envoyer une facture par email
router.post('/invoices/:id/send', async (req, res) => {
  try {
    const result = await invoiceNinja.sendInvoice(req.params.id);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Marquer une facture comme payée
router.post('/invoices/:id/mark-paid', async (req, res) => {
  try {
    const { amount } = req.body;
    const invoice = await invoiceNinja.markInvoicePaid(req.params.id, amount);
    res.json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Télécharger le PDF d'une facture
router.get('/invoices/:id/pdf', async (req, res) => {
  try {
    const pdf = await invoiceNinja.downloadInvoicePDF(req.params.id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${req.params.id}.pdf"`);
    res.send(pdf);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// === PAIEMENTS ===

// Liste des paiements
router.get('/payments', async (req, res) => {
  try {
    const payments = await invoiceNinja.getPayments(req.query);
    res.json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Créer un paiement
router.post('/payments', async (req, res) => {
  try {
    const payment = await invoiceNinja.createPayment(req.body);
    res.json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// === PRODUITS ===

// Liste des produits
router.get('/products', async (req, res) => {
  try {
    const products = await invoiceNinja.getProducts(req.query);
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Créer un produit
router.post('/products', async (req, res) => {
  try {
    const product = await invoiceNinja.createProduct(req.body);
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// === DEVIS ===

// Liste des devis
router.get('/quotes', async (req, res) => {
  try {
    const quotes = await invoiceNinja.getQuotes(req.query);
    res.json({ success: true, data: quotes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Créer un devis
router.post('/quotes', async (req, res) => {
  try {
    const quote = await invoiceNinja.createQuote(req.body);
    res.json({ success: true, data: quote });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Convertir un devis en facture
router.post('/quotes/:id/convert', async (req, res) => {
  try {
    const invoice = await invoiceNinja.convertQuoteToInvoice(req.params.id);
    res.json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// === SYNCHRONISATION DIRECTUS ===

// Synchroniser un contact Directus vers Invoice Ninja
router.post('/sync/contact', async (req, res) => {
  try {
    const { contactId } = req.body;
    const directus = getDirectus();

    // Récupérer le contact depuis Directus
    const contacts = await directus.request(
      readItems('contacts', {
        filter: { id: { _eq: contactId } }
      })
    );

    if (!contacts || contacts.length === 0) {
      return res.status(404).json({ success: false, error: 'Contact non trouvé' });
    }

    const contact = contacts[0];

    // Créer le client dans Invoice Ninja
    const client = await invoiceNinja.createClient({
      first_name: contact.first_name,
      last_name: contact.last_name,
      email: contact.email,
      phone: contact.phone,
      address: contact.address,
      city: contact.city,
      postal_code: contact.postal_code
    });

    // Sauvegarder l'ID Invoice Ninja dans Directus
    await directus.request(
      updateItem('contacts', contact.id, {
        invoice_ninja_id: client.id
      })
    );

    res.json({ success: true, data: { directus_id: contact.id, invoice_ninja_id: client.id } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Synchroniser une facture Directus vers Invoice Ninja
router.post('/sync/invoice', async (req, res) => {
  try {
    const { invoiceId } = req.body;
    const directus = getDirectus();

    // Récupérer la facture depuis Directus
    const invoices = await directus.request(
      readItems('client_invoices', {
        filter: { id: { _eq: invoiceId } },
        fields: ['*', 'contact.*', 'items.*']
      })
    );

    if (!invoices || invoices.length === 0) {
      return res.status(404).json({ success: false, error: 'Facture non trouvée' });
    }

    const invoice = invoices[0];

    // Vérifier que le contact a un ID Invoice Ninja
    if (!invoice.contact?.invoice_ninja_id) {
      return res.status(400).json({
        success: false,
        error: 'Le contact doit d\'abord être synchronisé avec Invoice Ninja'
      });
    }

    // Créer la facture dans Invoice Ninja
    const ninjaInvoice = await invoiceNinja.createInvoice({
      client_id: invoice.contact.invoice_ninja_id,
      date: invoice.issue_date,
      due_date: invoice.due_date,
      items: invoice.items || [{
        description: invoice.description || 'Prestation',
        quantity: 1,
        unit_price: invoice.amount
      }],
      notes: invoice.notes
    });

    // Sauvegarder l'ID Invoice Ninja dans Directus
    await directus.request(
      updateItem('client_invoices', invoice.id, {
        invoice_ninja_id: ninjaInvoice.id,
        invoice_ninja_number: ninjaInvoice.number
      })
    );

    res.json({
      success: true,
      data: {
        directus_id: invoice.id,
        invoice_ninja_id: ninjaInvoice.id,
        invoice_ninja_number: ninjaInvoice.number
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Import en masse depuis Directus
router.post('/sync/bulk', async (req, res) => {
  try {
    const { type, filter } = req.body;
    const directus = getDirectus();

    if (type === 'contacts') {
      const contacts = await directus.request(
        readItems('contacts', {
          filter: { invoice_ninja_id: { _null: true }, ...filter },
          limit: -1
        })
      );

      let synced = 0;
      let errors = [];

      for (const contact of contacts) {
        try {
          const client = await invoiceNinja.createClient(contact);
          await directus.request(
            updateItem('contacts', contact.id, {
              invoice_ninja_id: client.id
            })
          );
          synced++;
        } catch (error) {
          errors.push({ id: contact.id, error: error.message });
        }
      }

      res.json({ success: true, synced, total: contacts.length, errors });
    } else {
      res.status(400).json({ success: false, error: 'Type non supporté' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// === WEBHOOKS ===

// Webhook endpoint (réception des notifications Invoice Ninja)
router.post('/webhook', async (req, res) => {
  try {
    const { event, data } = req.body;
    console.log('Webhook Invoice Ninja reçu:', event);

    const directus = getDirectus();

    switch (event) {
      case 'payment.success':
      case 'payment_success':
        // Synchroniser le paiement vers Directus
        if (data.invoice_id) {
          const invoices = await directus.request(
            readItems('client_invoices', {
              filter: { invoice_ninja_id: { _eq: data.invoice_id } }
            })
          );

          if (invoices && invoices.length > 0) {
            await directus.request(
              updateItem('client_invoices', invoices[0].id, {
                status: 'paid',
                payment_date: data.date || new Date().toISOString().split('T')[0],
                payment_amount: parseFloat(data.amount)
              })
            );
            console.log(`Facture Directus ${invoices[0].id} marquée comme payée`);
          }
        }
        break;

      case 'invoice.sent':
      case 'invoice_sent':
        console.log(`Facture ${data.number} envoyée au client`);
        break;

      case 'invoice.viewed':
      case 'invoice_viewed':
        console.log(`Facture ${data.number} vue par le client`);
        break;

      default:
        console.log(`Événement Invoice Ninja non traité: ${event}`);
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Erreur webhook Invoice Ninja:', error);
    res.status(200).send('OK');
  }
});

// === DASHBOARD ===

router.get('/dashboard', async (req, res) => {
  try {
    const data = await invoiceNinja.getDashboardData();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// === HEALTH CHECK ===

router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    service: 'invoice-ninja',
    timestamp: new Date().toISOString()
  });
});

// Test de connexion
router.get('/test', async (req, res) => {
  try {
    const result = await invoiceNinja.testConnection();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
