/**
 * Quote Hooks - Automatisations Devis
 *
 * Hooks Directus pour le workflow des devis:
 * - Génération auto numéro devis
 * - Calcul TVA automatique
 * - Notifications changement statut
 * - Création facture acompte automatique
 *
 * @date 15 Décembre 2025
 */

import axios from 'axios';

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN || 'hbQz-9935crJ2YkLul_zpQJDBw2M-y5v';

const api = axios.create({
  baseURL: DIRECTUS_URL,
  headers: {
    'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// TVA rates Suisse 2025
const TAX_RATES = {
  standard: 8.1,
  reduced: 2.6,
  accommodation: 3.8,
  exempt: 0
};

const PROJECT_TYPE_TAX = {
  web_design: 'standard',
  ai_project: 'standard',
  consulting: 'standard',
  maintenance: 'standard',
  training: 'exempt',
  rental: 'exempt',
  real_estate_sale: 'exempt',
  food_service: 'reduced',
  legal: 'standard'
};

/**
 * Hook: Before Quote Create
 * - Génère le numéro de devis
 * - Calcule les totaux
 * - Définit le statut initial
 */
export async function beforeQuoteCreate(payload, meta) {
  try {
    console.log('🔄 Hook: beforeQuoteCreate');

    // Generate quote number if not provided
    if (!payload.quote_number && payload.owner_company_id) {
      payload.quote_number = await generateQuoteNumber(payload.owner_company_id);
    }

    // Set default status
    if (!payload.status) {
      payload.status = 'draft';
    }

    // Calculate totals if line_items provided
    if (payload.subtotal) {
      const totals = calculateTotals(payload.subtotal, payload.project_type);
      payload.tax_rate = totals.tax_rate;
      payload.tax_amount = totals.tax_amount;
      payload.total = totals.total;
    }

    // Calculate deposit if not set
    if (payload.total && !payload.deposit_amount && payload.owner_company_id) {
      const depositConfig = await getDepositConfig(payload.owner_company_id, payload.project_type);
      payload.deposit_percentage = depositConfig.deposit_percentage;
      payload.deposit_amount = Math.round(payload.total * depositConfig.deposit_percentage / 100 * 100) / 100;
    }

    // Set valid_until if not provided
    if (!payload.valid_until) {
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + 30);
      payload.valid_until = validUntil.toISOString().split('T')[0];
    }

    console.log(`✅ Quote prepared: ${payload.quote_number}`);
    return payload;
  } catch (error) {
    console.error('❌ beforeQuoteCreate error:', error.message);
    return payload;
  }
}

/**
 * Hook: After Quote Update
 * - Détecte les changements de statut
 * - Déclenche les actions automatiques
 */
export async function afterQuoteUpdate(meta, context) {
  try {
    const { keys, payload } = meta;

    // Check if status changed
    if (!payload.status) return;

    console.log(`🔄 Hook: afterQuoteUpdate - Status change detected: ${payload.status}`);

    for (const quoteId of keys) {
      // Get full quote data
      const quote = await getQuote(quoteId);
      if (!quote) continue;

      switch (payload.status) {
        case 'sent':
          await onQuoteSent(quote);
          break;
        case 'signed':
          await onQuoteSigned(quote);
          break;
        case 'completed':
          await onQuoteCompleted(quote);
          break;
        case 'expired':
          await onQuoteExpired(quote);
          break;
      }
    }
  } catch (error) {
    console.error('❌ afterQuoteUpdate error:', error.message);
  }
}

/**
 * Action: Quote Sent
 * - Créer compte portail si nécessaire
 * - Envoyer notification email
 */
async function onQuoteSent(quote) {
  console.log(`📧 Quote sent: ${quote.quote_number}`);

  // Create portal account if needed
  if (quote.contact_id && !await hasPortalAccount(quote.contact_id, quote.owner_company_id)) {
    await createPortalAccountForQuote(quote);
  }

  // TODO: Send email notification via Mautic
  // await sendQuoteEmail(quote);
}

/**
 * Action: Quote Signed
 * - Créer facture acompte automatiquement
 */
async function onQuoteSigned(quote) {
  console.log(`✍️ Quote signed: ${quote.quote_number}`);

  // Create deposit invoice if not exists
  if (!quote.deposit_invoice_id && quote.deposit_amount > 0) {
    await createDepositInvoice(quote);
  }

  // TODO: Notify team via webhook/Slack
}

/**
 * Action: Quote Completed
 * - Créer projet automatiquement
 */
async function onQuoteCompleted(quote) {
  console.log(`✅ Quote completed: ${quote.quote_number}`);

  // Create project if not exists
  if (!quote.project_id) {
    await createProjectFromQuote(quote);
  }
}

/**
 * Action: Quote Expired
 * - Envoyer rappel au client
 */
async function onQuoteExpired(quote) {
  console.log(`⏰ Quote expired: ${quote.quote_number}`);

  // TODO: Send expiry notification
}

// ============================================
// HELPER FUNCTIONS
// ============================================

async function generateQuoteNumber(ownerCompanyId) {
  try {
    const companyRes = await api.get(`/items/owner_companies/${ownerCompanyId}`);
    const company = companyRes.data.data;
    const prefix = company.code?.substring(0, 3).toUpperCase() || 'DEV';

    const year = new Date().getFullYear();

    const quotesRes = await api.get('/items/quotes', {
      params: {
        filter: {
          owner_company_id: { _eq: ownerCompanyId },
          quote_number: { _starts_with: `${prefix}-${year}` }
        },
        sort: ['-quote_number'],
        limit: 1,
        fields: ['quote_number']
      }
    });

    let nextNum = 1;
    if (quotesRes.data.data.length > 0) {
      const lastNumber = quotesRes.data.data[0].quote_number;
      const parts = lastNumber.split('-');
      if (parts.length === 3) {
        nextNum = parseInt(parts[2]) + 1;
      }
    }

    return `${prefix}-${year}-${String(nextNum).padStart(4, '0')}`;
  } catch (error) {
    return `DEV-${Date.now()}`;
  }
}

function calculateTotals(subtotal, projectType = 'web_design') {
  const taxType = PROJECT_TYPE_TAX[projectType] || 'standard';
  const taxRate = TAX_RATES[taxType];
  const taxAmount = Math.round(subtotal * taxRate / 100 * 100) / 100;
  const total = Math.round((subtotal + taxAmount) * 100) / 100;

  return { tax_rate: taxRate, tax_amount: taxAmount, total };
}

async function getDepositConfig(ownerCompanyId, projectType) {
  try {
    const res = await api.get('/items/deposit_configs', {
      params: {
        filter: {
          _and: [
            { owner_company_id: { _eq: ownerCompanyId } },
            { project_type: { _eq: projectType || 'default' } },
            { status: { _eq: 'active' } }
          ]
        },
        limit: 1
      }
    });

    if (res.data.data.length > 0) {
      return res.data.data[0];
    }

    return { deposit_percentage: 30 };
  } catch {
    return { deposit_percentage: 30 };
  }
}

async function getQuote(quoteId) {
  try {
    const res = await api.get(`/items/quotes/${quoteId}`, {
      params: {
        fields: '*,contact_id.id,contact_id.email,owner_company_id.id,owner_company_id.code'
      }
    });
    return res.data.data;
  } catch {
    return null;
  }
}

async function hasPortalAccount(contactId, ownerCompanyId) {
  try {
    const res = await api.get('/items/client_portal_accounts', {
      params: {
        filter: {
          _and: [
            { contact_id: { _eq: contactId } },
            { owner_company_id: { _eq: ownerCompanyId } }
          ]
        },
        limit: 1
      }
    });
    return res.data.data.length > 0;
  } catch {
    return false;
  }
}

async function createPortalAccountForQuote(quote) {
  try {
    const contactRes = await api.get(`/items/people/${quote.contact_id}`);
    const contact = contactRes.data.data;

    if (!contact?.email) return;

    // Import crypto for password generation
    const crypto = await import('crypto');
    const bcrypt = await import('bcryptjs');

    const tempPassword = crypto.randomBytes(12).toString('base64url');
    const passwordHash = await bcrypt.hash(tempPassword, 12);
    const activationToken = crypto.randomUUID();

    await api.post('/items/client_portal_accounts', {
      contact_id: quote.contact_id,
      company_id: quote.company_id,
      owner_company_id: quote.owner_company_id,
      email: contact.email,
      password_hash: passwordHash,
      status: 'pending',
      activation_token: activationToken,
      language: 'fr'
    });

    console.log(`✅ Portal account created for ${contact.email}`);
  } catch (error) {
    console.error('Error creating portal account:', error.message);
  }
}

async function createDepositInvoice(quote) {
  try {
    const companyRes = await api.get(`/items/owner_companies/${quote.owner_company_id}`);
    const prefix = companyRes.data.data?.code?.substring(0, 3).toUpperCase() || 'INV';
    const year = new Date().getFullYear();

    // Get next invoice number
    const invoicesRes = await api.get('/items/client_invoices', {
      params: {
        filter: { invoice_number: { _starts_with: `${prefix}-${year}` } },
        sort: ['-invoice_number'],
        limit: 1
      }
    });

    let nextNum = 1;
    if (invoicesRes.data.data.length > 0) {
      const lastNum = invoicesRes.data.data[0].invoice_number;
      const match = lastNum.match(/(\d{4})A?$/);
      if (match) nextNum = parseInt(match[1]) + 1;
    }

    const invoiceNumber = `${prefix}-${year}-${String(nextNum).padStart(4, '0')}A`;

    const invoice = await api.post('/items/client_invoices', {
      invoice_number: invoiceNumber,
      contact_id: quote.contact_id,
      company_id: quote.company_id,
      owner_company: companyRes.data.data?.code,
      quote_id: quote.id,
      amount: quote.deposit_amount,
      currency: quote.currency || 'CHF',
      status: 'pending',
      is_deposit: true,
      description: `Acompte ${quote.deposit_percentage}% - Devis ${quote.quote_number}`,
      due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });

    // Update quote with invoice reference
    await api.patch(`/items/quotes/${quote.id}`, {
      deposit_invoice_id: invoice.data.data.id,
      status: 'awaiting_deposit'
    });

    console.log(`✅ Deposit invoice created: ${invoiceNumber}`);
  } catch (error) {
    console.error('Error creating deposit invoice:', error.message);
  }
}

async function createProjectFromQuote(quote) {
  try {
    const companyRes = await api.get(`/items/owner_companies/${quote.owner_company_id}`);

    const project = await api.post('/items/projects', {
      name: quote.title || `Projet - ${quote.quote_number}`,
      description: quote.description,
      client_id: quote.contact_id,
      company_id: quote.company_id,
      owner_company: companyRes.data.data?.code,
      quote_id: quote.id,
      budget: quote.total,
      status: 'planning',
      start_date: new Date().toISOString().split('T')[0]
    });

    // Update quote with project reference
    await api.patch(`/items/quotes/${quote.id}`, {
      project_id: project.data.data.id
    });

    console.log(`✅ Project created from quote ${quote.quote_number}`);
  } catch (error) {
    console.error('Error creating project:', error.message);
  }
}

export default {
  beforeQuoteCreate,
  afterQuoteUpdate
};
