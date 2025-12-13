const axios = require('axios');

// Configuration Invoice Ninja API
const invoiceNinjaAPI = axios.create({
  baseURL: process.env.INVOICE_NINJA_URL + '/api/v1',
  headers: {
    'X-API-TOKEN': process.env.INVOICE_NINJA_API_TOKEN,
    'X-Requested-With': 'XMLHttpRequest',
    'Content-Type': 'application/json'
  }
});

// Configuration Directus API
const directusAPI = axios.create({
  baseURL: 'http://localhost:8055',
  headers: {
    'Authorization': `Bearer ${process.env.DIRECTUS_API_TOKEN || 'e6Vt5LRHnYhq7-78yzoSxwdgjn2D6-JW'}`,
    'Content-Type': 'application/json'
  }
});

/**
 * Synchroniser un contact Directus vers Invoice Ninja
 */
async function syncContactToInvoiceNinja(contact) {
  try {
    console.log(`Synchronisation contact ${contact.first_name} ${contact.last_name} vers Invoice Ninja...`);
    
    const invoiceNinjaClient = {
      name: `${contact.first_name} ${contact.last_name}`,
      contacts: [{
        first_name: contact.first_name,
        last_name: contact.last_name,
        email: contact.email,
        phone: contact.phone || ''
      }],
      address1: contact.address || '',
      city: contact.city || '',
      postal_code: contact.postal_code || '',
      country_id: 756, // Suisse
      currency_id: 3, // CHF
      language_id: 4 // Français
    };
    
    const response = await invoiceNinjaAPI.post('/clients', invoiceNinjaClient);
    console.log('Client créé dans Invoice Ninja:', response.data.data.id);
    
    // Sauvegarder l'ID Invoice Ninja dans Directus
    await directusAPI.patch(`/items/contacts/${contact.id}`, {
      invoice_ninja_id: response.data.data.id
    });
    
    return response.data.data;
  } catch (error) {
    console.error('Erreur sync Invoice Ninja:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Créer une facture dans Invoice Ninja
 */
async function createInvoiceInInvoiceNinja(invoiceData) {
  try {
    console.log('Création facture Invoice Ninja...');
    
    const invoice = {
      client_id: invoiceData.client_invoice_ninja_id,
      date: invoiceData.date || new Date().toISOString().split('T')[0],
      due_date: invoiceData.due_date,
      line_items: invoiceData.line_items.map(item => ({
        product_key: item.description,
        notes: item.notes || '',
        cost: parseFloat(item.unit_price || 0),
        qty: parseFloat(item.quantity || 1),
        tax_name1: 'TVA',
        tax_rate1: 8.1 // TVA Suisse 8.1%
      })),
      terms: invoiceData.terms || 'Paiement à 30 jours',
      public_notes: invoiceData.notes || '',
      footer: 'Merci pour votre confiance !',
      partial: 0,
      auto_bill_enabled: false
    };
    
    const response = await invoiceNinjaAPI.post('/invoices', invoice);
    console.log('Facture créée dans Invoice Ninja:', response.data.data.number);
    
    return response.data.data;
  } catch (error) {
    console.error('Erreur création facture Invoice Ninja:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Synchroniser un paiement Invoice Ninja vers Directus
 */
async function syncPaymentToDirectus(paymentData) {
  try {
    console.log('Synchronisation paiement vers Directus...');
    
    // Trouver la facture Directus par invoice_ninja_id
    const invoicesResponse = await directusAPI.get('/items/client_invoices', {
      params: {
        filter: {
          invoice_ninja_id: paymentData.invoice_id
        }
      }
    });
    
    if (invoicesResponse.data.data.length === 0) {
      throw new Error(`Facture Invoice Ninja ${paymentData.invoice_id} non trouvée dans Directus`);
    }
    
    const directusInvoice = invoicesResponse.data.data[0];
    
    // Mettre à jour la facture Directus
    await directusAPI.patch(`/items/client_invoices/${directusInvoice.id}`, {
      status: 'paid',
      payment_date: paymentData.date,
      payment_amount: parseFloat(paymentData.amount),
      payment_method: paymentData.type || 'bank_transfer',
      notes: (directusInvoice.notes || '') + `\nPaiement reçu via Invoice Ninja le ${paymentData.date}`
    });
    
    console.log(`Facture Directus ${directusInvoice.id} marquée comme payée`);
    return true;
  } catch (error) {
    console.error('Erreur sync paiement Directus:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Webhook Invoice Ninja pour les paiements
 */
async function handleInvoiceNinjaWebhook(webhookData) {
  try {
    console.log('Webhook Invoice Ninja reçu:', webhookData.event);
    
    switch (webhookData.event) {
      case 'payment_success':
        await syncPaymentToDirectus(webhookData.payment);
        break;
      case 'invoice_sent':
        console.log(`Facture ${webhookData.invoice.number} envoyée au client`);
        break;
      case 'invoice_viewed':
        console.log(`Facture ${webhookData.invoice.number} vue par le client`);
        break;
      default:
        console.log(`Événement Invoice Ninja non traité: ${webhookData.event}`);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Erreur webhook Invoice Ninja:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Tester la connexion API Invoice Ninja
 */
async function testInvoiceNinjaConnection() {
  try {
    const response = await invoiceNinjaAPI.get('/ping');
    console.log('Connexion Invoice Ninja OK:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Erreur connexion Invoice Ninja:', error.response?.data || error.message);
    return { success: false, error: error.message };
  }
}

module.exports = {
  syncContactToInvoiceNinja,
  createInvoiceInInvoiceNinja,
  syncPaymentToDirectus,
  handleInvoiceNinjaWebhook,
  testInvoiceNinjaConnection
};