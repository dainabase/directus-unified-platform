/**
 * Invoice Ninja Integration Service
 *
 * Bidirectional sync between Directus and Invoice Ninja
 * - Create/Update invoices
 * - Sync payments
 * - Client management
 *
 * @date 15 Décembre 2025
 */

import axios from 'axios';
import crypto from 'crypto';

const INVOICE_NINJA_URL = process.env.INVOICE_NINJA_URL || 'http://localhost:8085';
const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN || 'hbQz-9935crJ2YkLul_zpQJDBw2M-y5v';

// Company-specific API keys mapping
const COMPANY_API_KEYS = {
  HYPERVISUAL: process.env.INVOICE_NINJA_KEY_HYPERVISUAL || '',
  DAINAMICS: process.env.INVOICE_NINJA_KEY_DAINAMICS || '',
  LEXAIA: process.env.INVOICE_NINJA_KEY_LEXAIA || '',
  ENKI_REALTY: process.env.INVOICE_NINJA_KEY_ENKI || '',
  TAKEOUT: process.env.INVOICE_NINJA_KEY_TAKEOUT || ''
};

// Directus API client
const directusApi = axios.create({
  baseURL: DIRECTUS_URL,
  headers: {
    'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// Status mappings
const STATUS_TO_NINJA = {
  draft: 1,
  sent: 2,
  viewed: 3,
  paid: 4,
  cancelled: 5,
  archived: 6,
  overdue: -1
};

const STATUS_FROM_NINJA = {
  1: 'draft',
  2: 'sent',
  3: 'viewed',
  4: 'paid',
  5: 'cancelled',
  6: 'archived',
  '-1': 'overdue'
};

/**
 * Get Invoice Ninja API client for a specific company
 */
function getCompanyClient(ownerCompanyCode) {
  const apiKey = COMPANY_API_KEYS[ownerCompanyCode];

  if (!apiKey) {
    console.warn(`⚠️ No Invoice Ninja API key for company: ${ownerCompanyCode}`);
    return null;
  }

  return axios.create({
    baseURL: `${INVOICE_NINJA_URL}/api/v1`,
    headers: {
      'X-Api-Token': apiKey,
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    }
  });
}

/**
 * Sync invoice to Invoice Ninja
 */
export async function syncInvoiceToNinja(invoiceId) {
  try {
    // Get invoice from Directus
    const invoiceRes = await directusApi.get(`/items/client_invoices/${invoiceId}`, {
      params: {
        fields: '*,contact_id.*,company_id.*,quote_id.*,invoice_items.*'
      }
    });
    const invoice = invoiceRes.data.data;

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    const client = getCompanyClient(invoice.owner_company);
    if (!client) {
      return { success: false, error: 'No API key configured for company' };
    }

    // Get or create client in Invoice Ninja
    const ninjaClientId = await getOrCreateNinjaClient(client, invoice);

    // Prepare invoice data
    const ninjaInvoice = {
      client_id: ninjaClientId,
      number: invoice.invoice_number,
      date: invoice.issue_date || new Date().toISOString().split('T')[0],
      due_date: invoice.due_date,
      amount: invoice.amount,
      status_id: STATUS_TO_NINJA[invoice.status] || 1,
      public_notes: invoice.description || '',
      private_notes: `Directus ID: ${invoice.id}`,
      custom_value1: String(invoice.id),
      custom_value2: invoice.is_deposit ? 'ACOMPTE' : 'STANDARD',
      line_items: formatLineItems(invoice.invoice_items || []),
      tax_rate1: invoice.tax_rate || 8.1,
      tax_name1: 'TVA'
    };

    let result;

    // Check if invoice already exists in Ninja
    if (invoice.invoice_ninja_id) {
      // Update existing
      result = await client.put(`/invoices/${invoice.invoice_ninja_id}`, ninjaInvoice);
      console.log(`✅ Invoice updated in Invoice Ninja: ${invoice.invoice_number}`);
    } else {
      // Create new
      result = await client.post('/invoices', ninjaInvoice);

      // Store Invoice Ninja ID in Directus
      await directusApi.patch(`/items/client_invoices/${invoiceId}`, {
        invoice_ninja_id: result.data.data.id
      });

      console.log(`✅ Invoice created in Invoice Ninja: ${invoice.invoice_number}`);
    }

    return {
      success: true,
      ninjaId: result.data.data.id,
      ninjaNumber: result.data.data.number
    };
  } catch (error) {
    console.error('❌ Invoice Ninja sync error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Get or create client in Invoice Ninja
 */
async function getOrCreateNinjaClient(client, invoice) {
  try {
    // Search for existing client by email
    const contactEmail = invoice.contact_id?.email;

    if (contactEmail) {
      const searchRes = await client.get('/clients', {
        params: { email: contactEmail }
      });

      if (searchRes.data.data?.length > 0) {
        return searchRes.data.data[0].id;
      }
    }

    // Create new client
    const newClient = await client.post('/clients', {
      name: invoice.company_id?.name || invoice.contact_id?.company_name || 'Client',
      contacts: [{
        first_name: invoice.contact_id?.first_name || '',
        last_name: invoice.contact_id?.last_name || '',
        email: contactEmail,
        phone: invoice.contact_id?.phone || ''
      }],
      address1: invoice.company_id?.address || '',
      city: invoice.company_id?.city || '',
      postal_code: invoice.company_id?.postal_code || '',
      country_id: getCountryId(invoice.company_id?.country),
      custom_value1: String(invoice.contact_id?.id || ''),
      custom_value2: String(invoice.company_id?.id || '')
    });

    return newClient.data.data.id;
  } catch (error) {
    console.error('Error creating/finding client:', error.message);
    throw error;
  }
}

/**
 * Format line items for Invoice Ninja
 */
function formatLineItems(items) {
  if (!items || items.length === 0) {
    return [];
  }

  return items.map(item => ({
    product_key: item.product_code || '',
    notes: item.description || '',
    quantity: item.quantity || 1,
    cost: item.unit_price || 0,
    discount: item.discount || 0,
    tax_rate1: item.tax_rate || 0,
    tax_name1: item.tax_rate ? 'TVA' : ''
  }));
}

/**
 * Sync payment from Invoice Ninja to Directus
 */
export async function syncPaymentToDirectus(paymentData, ownerCompanyCode) {
  try {
    const { invoice_id, amount, date, transaction_reference } = paymentData;

    // Find invoice in Directus by Invoice Ninja ID
    const invoiceRes = await directusApi.get('/items/client_invoices', {
      params: {
        filter: {
          invoice_ninja_id: { _eq: invoice_id }
        },
        limit: 1
      }
    });

    if (invoiceRes.data.data.length === 0) {
      console.warn(`Invoice not found in Directus for Ninja ID: ${invoice_id}`);
      return { success: false, error: 'Invoice not found' };
    }

    const invoice = invoiceRes.data.data[0];

    // Update invoice status
    await directusApi.patch(`/items/client_invoices/${invoice.id}`, {
      status: 'paid',
      payment_date: date,
      payment_reference: transaction_reference
    });

    // If this is a deposit invoice, update the quote
    if (invoice.is_deposit && invoice.quote_id) {
      await directusApi.patch(`/items/quotes/${invoice.quote_id}`, {
        deposit_paid: true,
        deposit_paid_at: new Date().toISOString(),
        status: 'completed'
      });
    }

    console.log(`✅ Payment synced from Invoice Ninja: ${invoice.invoice_number}`);

    return { success: true, invoiceId: invoice.id };
  } catch (error) {
    console.error('❌ Payment sync error:', error.message);
    throw error;
  }
}

/**
 * Create deposit invoice in Invoice Ninja
 */
export async function createDepositInvoiceInNinja(quoteId) {
  try {
    // Get quote
    const quoteRes = await directusApi.get(`/items/quotes/${quoteId}`, {
      params: {
        fields: '*,contact_id.*,company_id.*,owner_company_id.*'
      }
    });
    const quote = quoteRes.data.data;

    if (!quote) {
      throw new Error('Quote not found');
    }

    const ownerCompanyCode = quote.owner_company_id?.code;
    const client = getCompanyClient(ownerCompanyCode);

    if (!client) {
      return { success: false, error: 'No API key configured' };
    }

    // Get or create client
    const ninjaClientId = await getOrCreateNinjaClient(client, {
      contact_id: quote.contact_id,
      company_id: quote.company_id
    });

    // Create deposit invoice
    const depositAmount = quote.deposit_amount || (quote.total * 0.3);
    const invoiceNumber = `${ownerCompanyCode?.substring(0, 3) || 'INV'}-${new Date().getFullYear()}-ACOMPTE-${quoteId}`;

    const ninjaInvoice = await client.post('/invoices', {
      client_id: ninjaClientId,
      number: invoiceNumber,
      date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status_id: 2, // Sent
      public_notes: `Acompte ${quote.deposit_percentage || 30}% - Devis ${quote.quote_number}`,
      custom_value1: `quote-${quoteId}`,
      custom_value2: 'ACOMPTE',
      line_items: [{
        product_key: 'ACOMPTE',
        notes: `Acompte ${quote.deposit_percentage || 30}% pour devis ${quote.quote_number}`,
        quantity: 1,
        cost: depositAmount,
        tax_rate1: quote.tax_rate || 8.1,
        tax_name1: 'TVA'
      }]
    });

    // Create corresponding invoice in Directus
    const directusInvoice = await directusApi.post('/items/client_invoices', {
      invoice_number: invoiceNumber,
      contact_id: quote.contact_id?.id,
      company_id: quote.company_id?.id,
      owner_company: ownerCompanyCode,
      quote_id: quoteId,
      amount: depositAmount,
      currency: quote.currency || 'CHF',
      status: 'sent',
      is_deposit: true,
      description: `Acompte ${quote.deposit_percentage || 30}% - Devis ${quote.quote_number}`,
      due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      invoice_ninja_id: ninjaInvoice.data.data.id
    });

    // Update quote with invoice reference
    await directusApi.patch(`/items/quotes/${quoteId}`, {
      deposit_invoice_id: directusInvoice.data.data.id,
      status: 'awaiting_deposit'
    });

    console.log(`✅ Deposit invoice created: ${invoiceNumber}`);

    return {
      success: true,
      invoiceId: directusInvoice.data.data.id,
      ninjaId: ninjaInvoice.data.data.id,
      invoiceNumber: invoiceNumber
    };
  } catch (error) {
    console.error('❌ Create deposit invoice error:', error.message);
    throw error;
  }
}

/**
 * Get invoice PDF from Invoice Ninja
 */
export async function getInvoicePDF(invoiceId, ownerCompanyCode) {
  try {
    const client = getCompanyClient(ownerCompanyCode);
    if (!client) {
      throw new Error('No API key configured');
    }

    const response = await client.get(`/invoices/${invoiceId}/download`, {
      responseType: 'arraybuffer'
    });

    return {
      success: true,
      pdf: Buffer.from(response.data),
      contentType: 'application/pdf'
    };
  } catch (error) {
    console.error('❌ Get invoice PDF error:', error.message);
    throw error;
  }
}

/**
 * Send invoice email via Invoice Ninja
 */
export async function sendInvoiceEmail(invoiceId, ownerCompanyCode, recipientEmail) {
  try {
    const client = getCompanyClient(ownerCompanyCode);
    if (!client) {
      throw new Error('No API key configured');
    }

    await client.post(`/invoices/${invoiceId}/email`, {
      template: 'email_template_invoice',
      to_contact: recipientEmail
    });

    return { success: true };
  } catch (error) {
    console.error('❌ Send invoice email error:', error.message);
    throw error;
  }
}

/**
 * Handle Invoice Ninja webhook
 */
export async function handleWebhook(payload, signature, webhookSecret) {
  try {
    // Verify signature if secret provided
    if (webhookSecret && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(payload))
        .digest('hex');

      if (signature !== expectedSignature) {
        throw new Error('Invalid webhook signature');
      }
    }

    const { event_type } = payload;
    console.log(`📨 Invoice Ninja webhook: ${event_type}`);

    switch (event_type) {
      case 'create_invoice':
      case 'update_invoice':
        await handleInvoiceWebhook(payload);
        break;
      case 'create_payment':
      case 'update_payment':
        await handlePaymentWebhook(payload);
        break;
      default:
        console.log(`   ⚠️ Unhandled event: ${event_type}`);
    }

    return { success: true };
  } catch (error) {
    console.error('❌ Invoice Ninja webhook error:', error.message);
    throw error;
  }
}

/**
 * Handle invoice webhook
 */
async function handleInvoiceWebhook(payload) {
  const invoice = payload.invoice;
  if (!invoice) return;

  try {
    // Check if this invoice exists in Directus
    const searchRes = await directusApi.get('/items/client_invoices', {
      params: {
        filter: {
          _or: [
            { invoice_ninja_id: { _eq: invoice.id } },
            { invoice_number: { _eq: invoice.number } }
          ]
        },
        limit: 1
      }
    });

    if (searchRes.data.data.length > 0) {
      // Update existing
      const directusInvoice = searchRes.data.data[0];
      await directusApi.patch(`/items/client_invoices/${directusInvoice.id}`, {
        status: STATUS_FROM_NINJA[invoice.status_id] || directusInvoice.status,
        amount: invoice.amount,
        due_date: invoice.due_date
      });
    }
  } catch (error) {
    console.error('Error handling invoice webhook:', error.message);
  }
}

/**
 * Handle payment webhook
 */
async function handlePaymentWebhook(payload) {
  const payment = payload.payment;
  if (!payment) return;

  for (const paymentable of payment.paymentables || []) {
    if (paymentable.invoice_id) {
      await syncPaymentToDirectus({
        invoice_id: paymentable.invoice_id,
        amount: paymentable.amount,
        date: payment.date,
        transaction_reference: payment.transaction_reference
      });
    }
  }
}

/**
 * Get country ID for Invoice Ninja
 */
function getCountryId(countryCode) {
  const countryMap = {
    CH: 756,
    FR: 250,
    DE: 276,
    IT: 380,
    AT: 40,
    US: 840
  };
  return countryMap[countryCode] || 756; // Default to Switzerland
}

/**
 * Get invoices list from Invoice Ninja
 */
export async function getInvoicesFromNinja(ownerCompanyCode, filters = {}) {
  try {
    const client = getCompanyClient(ownerCompanyCode);
    if (!client) {
      return { success: false, invoices: [] };
    }

    const response = await client.get('/invoices', { params: filters });

    return {
      success: true,
      invoices: response.data.data || [],
      meta: response.data.meta
    };
  } catch (error) {
    console.error('❌ Get invoices error:', error.message);
    return { success: false, invoices: [], error: error.message };
  }
}

export default {
  syncInvoiceToNinja,
  syncPaymentToDirectus,
  createDepositInvoiceInNinja,
  getInvoicePDF,
  sendInvoiceEmail,
  handleWebhook,
  getInvoicesFromNinja
};
