/**
 * Invoice Hooks - Automatisations Factures
 *
 * Hooks pour les factures clients:
 * - Génération auto numéro facture
 * - Détection paiement acompte → MAJ devis
 * - Rappels paiement automatiques
 * - Synchronisation Invoice Ninja
 *
 * @date 15 Décembre 2025
 */

import axios from 'axios';

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_ADMIN_TOKEN = process.env.DIRECTUS_ADMIN_TOKEN;

const api = axios.create({
  baseURL: DIRECTUS_URL,
  headers: {
    'Authorization': `Bearer ${DIRECTUS_ADMIN_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

/**
 * Hook: Before Invoice Create
 * - Génère le numéro de facture
 * - Définit la date d'échéance
 */
export async function beforeInvoiceCreate(payload, meta) {
  try {
    console.log('🔄 Hook: beforeInvoiceCreate');

    // Generate invoice number if not provided
    if (!payload.invoice_number && payload.owner_company) {
      payload.invoice_number = await generateInvoiceNumber(payload.owner_company, payload.is_deposit);
    }

    // Set default due date (30 days)
    if (!payload.due_date) {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);
      payload.due_date = dueDate.toISOString().split('T')[0];
    }

    // Set default status
    if (!payload.status) {
      payload.status = 'pending';
    }

    console.log(`✅ Invoice prepared: ${payload.invoice_number}`);
    return payload;
  } catch (error) {
    console.error('❌ beforeInvoiceCreate error:', error.message);
    return payload;
  }
}

/**
 * Hook: After Invoice Update
 * - Détecte le paiement
 * - Met à jour le devis associé si acompte
 */
export async function afterInvoiceUpdate(meta, context) {
  try {
    const { keys, payload } = meta;

    // Check if status changed to paid
    if (payload.status !== 'paid') return;

    console.log(`🔄 Hook: afterInvoiceUpdate - Payment detected`);

    for (const invoiceId of keys) {
      const invoice = await getInvoice(invoiceId);
      if (!invoice) continue;

      // If this is a deposit invoice, update the quote
      if (invoice.is_deposit && invoice.quote_id) {
        await onDepositPaid(invoice);
      }

      // Log payment event
      await logPaymentEvent(invoice);

      // TODO: Sync with Invoice Ninja
      // await syncToInvoiceNinja(invoice);
    }
  } catch (error) {
    console.error('❌ afterInvoiceUpdate error:', error.message);
  }
}

/**
 * Action: Deposit Paid
 * - Met à jour le devis
 * - Déclenche création projet
 */
async function onDepositPaid(invoice) {
  console.log(`💰 Deposit paid for quote: ${invoice.quote_id}`);

  try {
    // Update quote
    await api.patch(`/items/quotes/${invoice.quote_id}`, {
      deposit_paid: true,
      deposit_paid_at: new Date().toISOString(),
      status: 'completed'
    });

    // Get quote to create project
    const quoteRes = await api.get(`/items/quotes/${invoice.quote_id}`);
    const quote = quoteRes.data.data;

    // Create project if not exists
    if (!quote.project_id) {
      await createProjectFromQuote(quote);
    }

    console.log(`✅ Quote ${quote.quote_number} completed after deposit payment`);
  } catch (error) {
    console.error('Error handling deposit payment:', error.message);
  }
}

/**
 * Log payment event for audit
 */
async function logPaymentEvent(invoice) {
  try {
    // This could be stored in a separate audit/events table
    console.log(`📝 Payment logged: ${invoice.invoice_number} - ${invoice.amount} ${invoice.currency}`);

    // TODO: Create audit log entry
    // await api.post('/items/audit_logs', {
    //   event_type: 'payment_received',
    //   entity_type: 'client_invoices',
    //   entity_id: invoice.id,
    //   data: { amount: invoice.amount, currency: invoice.currency }
    // });
  } catch (error) {
    console.error('Error logging payment:', error.message);
  }
}

/**
 * Create project from quote (helper)
 */
async function createProjectFromQuote(quote) {
  try {
    const project = await api.post('/items/projects', {
      name: quote.title || `Projet - ${quote.quote_number}`,
      description: quote.description,
      client_id: quote.contact_id,
      company_id: quote.company_id,
      owner_company: quote.owner_company_id?.code,
      quote_id: quote.id,
      budget: quote.total,
      status: 'planning',
      start_date: new Date().toISOString().split('T')[0]
    });

    await api.patch(`/items/quotes/${quote.id}`, {
      project_id: project.data.data.id
    });

    console.log(`✅ Project created from quote`);
  } catch (error) {
    console.error('Error creating project:', error.message);
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

async function generateInvoiceNumber(ownerCompanyCode, isDeposit = false) {
  try {
    const prefix = ownerCompanyCode?.substring(0, 3).toUpperCase() || 'INV';
    const suffix = isDeposit ? 'A' : '';
    const year = new Date().getFullYear();

    const invoicesRes = await api.get('/items/client_invoices', {
      params: {
        filter: {
          invoice_number: { _starts_with: `${prefix}-${year}` }
        },
        sort: ['-invoice_number'],
        limit: 1,
        fields: ['invoice_number']
      }
    });

    let nextNum = 1;
    if (invoicesRes.data.data.length > 0) {
      const lastNumber = invoicesRes.data.data[0].invoice_number;
      const match = lastNumber.match(/(\d{4})A?$/);
      if (match) {
        nextNum = parseInt(match[1]) + 1;
      }
    }

    return `${prefix}-${year}-${String(nextNum).padStart(4, '0')}${suffix}`;
  } catch (error) {
    return `INV-${Date.now()}`;
  }
}

async function getInvoice(invoiceId) {
  try {
    const res = await api.get(`/items/client_invoices/${invoiceId}`, {
      params: {
        fields: '*,quote_id.*'
      }
    });
    return res.data.data;
  } catch {
    return null;
  }
}

export default {
  beforeInvoiceCreate,
  afterInvoiceUpdate
};
