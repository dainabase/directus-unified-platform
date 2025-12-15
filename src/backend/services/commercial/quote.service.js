/**
 * Quote Service - Gestion des devis
 *
 * Fonctionnalités:
 * - Création de devis avec numérotation auto
 * - Calcul TVA suisse (8.1%, 2.6%, 3.8%, 0%)
 * - Gestion statuts workflow (draft → sent → viewed → signed → completed)
 * - Génération PDF
 * - Intégration avec CGV et acomptes
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

// Project type to tax rate mapping
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
 * Générer le prochain numéro de devis
 */
async function generateQuoteNumber(ownerCompanyId) {
  try {
    // Get company prefix
    const companyRes = await api.get(`/items/owner_companies/${ownerCompanyId}`);
    const company = companyRes.data.data;
    const prefix = company.code?.substring(0, 3).toUpperCase() || 'DEV';

    const year = new Date().getFullYear();
    const pattern = `${prefix}-${year}-%`;

    // Get last quote number
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
    console.error('Error generating quote number:', error.message);
    return `DEV-${Date.now()}`;
  }
}

/**
 * Calculer les totaux du devis
 */
function calculateTotals(lineItems, projectType = 'web_design') {
  const subtotal = lineItems.reduce((sum, item) => {
    const quantity = parseFloat(item.quantity) || 1;
    const unitPrice = parseFloat(item.unit_price) || 0;
    return sum + (quantity * unitPrice);
  }, 0);

  const taxType = PROJECT_TYPE_TAX[projectType] || 'standard';
  const taxRate = TAX_RATES[taxType];
  const taxAmount = Math.round(subtotal * taxRate / 100 * 100) / 100;
  const total = Math.round((subtotal + taxAmount) * 100) / 100;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    tax_rate: taxRate,
    tax_amount: taxAmount,
    total
  };
}

/**
 * Récupérer la configuration d'acompte
 */
async function getDepositConfig(ownerCompanyId, projectType) {
  try {
    // Try specific project type first
    let configRes = await api.get('/items/deposit_configs', {
      params: {
        filter: {
          _and: [
            { owner_company_id: { _eq: ownerCompanyId } },
            { project_type: { _eq: projectType } },
            { status: { _eq: 'active' } }
          ]
        },
        limit: 1
      }
    });

    if (configRes.data.data.length > 0) {
      return configRes.data.data[0];
    }

    // Fallback to default
    configRes = await api.get('/items/deposit_configs', {
      params: {
        filter: {
          _and: [
            { owner_company_id: { _eq: ownerCompanyId } },
            { project_type: { _eq: 'default' } },
            { status: { _eq: 'active' } }
          ]
        },
        limit: 1
      }
    });

    if (configRes.data.data.length > 0) {
      return configRes.data.data[0];
    }

    // Ultimate fallback
    return { deposit_percentage: 30 };
  } catch (error) {
    console.error('Error getting deposit config:', error.message);
    return { deposit_percentage: 30 };
  }
}

/**
 * Récupérer la CGV active pour une entreprise
 */
async function getActiveCGV(ownerCompanyId) {
  try {
    const res = await api.get('/items/cgv_versions', {
      params: {
        filter: {
          _and: [
            { owner_company_id: { _eq: ownerCompanyId } },
            { status: { _eq: 'active' } }
          ]
        },
        sort: ['-version'],
        limit: 1
      }
    });

    return res.data.data[0] || null;
  } catch (error) {
    console.error('Error getting active CGV:', error.message);
    return null;
  }
}

/**
 * Créer un nouveau devis
 */
export async function createQuote(data) {
  try {
    const {
      contact_id,
      company_id,
      owner_company_id,
      project_type,
      line_items = [],
      title,
      description,
      internal_notes,
      client_notes,
      currency = 'CHF',
      valid_days = 30
    } = data;

    // Validate required fields
    if (!contact_id || !owner_company_id) {
      throw new Error('contact_id et owner_company_id sont requis');
    }

    // Generate quote number
    const quote_number = await generateQuoteNumber(owner_company_id);

    // Calculate totals
    const totals = calculateTotals(line_items, project_type);

    // Get deposit config
    const depositConfig = await getDepositConfig(owner_company_id, project_type);
    const deposit_percentage = parseFloat(depositConfig.deposit_percentage) || 30;
    const deposit_amount = Math.round(totals.total * deposit_percentage / 100 * 100) / 100;

    // Get active CGV
    const cgv = await getActiveCGV(owner_company_id);

    // Calculate valid_until date
    const valid_until = new Date();
    valid_until.setDate(valid_until.getDate() + valid_days);

    // Create quote
    const quoteData = {
      quote_number,
      status: 'draft',
      contact_id,
      company_id,
      owner_company_id,
      project_type,
      title,
      description,
      internal_notes,
      client_notes,
      currency,
      ...totals,
      deposit_percentage,
      deposit_amount,
      valid_until: valid_until.toISOString().split('T')[0],
      cgv_version_id: cgv?.id || null,
      is_signed: false,
      cgv_accepted: false,
      deposit_paid: false
    };

    const res = await api.post('/items/quotes', quoteData);
    const quoteId = res.data.data.id;

    console.log(`✅ Quote created: ${quote_number} (ID: ${quoteId})`);

    return {
      success: true,
      quote: res.data.data,
      quote_number
    };
  } catch (error) {
    console.error('Error creating quote:', error.message);
    throw error;
  }
}

/**
 * Récupérer un devis par ID avec relations
 */
export async function getQuote(quoteId) {
  try {
    const res = await api.get(`/items/quotes/${quoteId}`, {
      params: {
        fields: [
          '*',
          'contact_id.id',
          'contact_id.first_name',
          'contact_id.last_name',
          'contact_id.email',
          'contact_id.phone',
          'company_id.id',
          'company_id.name',
          'owner_company_id.id',
          'owner_company_id.name',
          'owner_company_id.code',
          'cgv_version_id.id',
          'cgv_version_id.version',
          'cgv_version_id.title',
          'deposit_invoice_id.id',
          'deposit_invoice_id.invoice_number',
          'project_id.id',
          'project_id.name'
        ].join(',')
      }
    });

    return res.data.data;
  } catch (error) {
    console.error('Error getting quote:', error.message);
    return null;
  }
}

/**
 * Lister les devis avec filtres
 */
export async function listQuotes(filters = {}) {
  try {
    const {
      owner_company_id,
      status,
      contact_id,
      limit = 50,
      offset = 0
    } = filters;

    const filterQuery = { _and: [] };

    if (owner_company_id) {
      filterQuery._and.push({ owner_company_id: { _eq: owner_company_id } });
    }
    if (status) {
      filterQuery._and.push({ status: { _eq: status } });
    }
    if (contact_id) {
      filterQuery._and.push({ contact_id: { _eq: contact_id } });
    }

    const params = {
      sort: ['-date_created'],
      limit,
      offset,
      fields: [
        '*',
        'contact_id.first_name',
        'contact_id.last_name',
        'company_id.name',
        'owner_company_id.name'
      ].join(',')
    };

    if (filterQuery._and.length > 0) {
      params.filter = filterQuery;
    }

    const res = await api.get('/items/quotes', { params });

    return {
      quotes: res.data.data,
      total: res.data.data.length
    };
  } catch (error) {
    console.error('Error listing quotes:', error.message);
    return { quotes: [], total: 0 };
  }
}

/**
 * Mettre à jour le statut d'un devis
 */
export async function updateQuoteStatus(quoteId, newStatus, additionalData = {}) {
  try {
    const validTransitions = {
      draft: ['sent'],
      sent: ['viewed', 'expired', 'rejected'],
      viewed: ['signed', 'expired', 'rejected'],
      signed: ['awaiting_deposit', 'completed'],
      awaiting_deposit: ['completed'],
      completed: [],
      expired: [],
      rejected: []
    };

    // Get current quote
    const quote = await getQuote(quoteId);
    if (!quote) {
      throw new Error('Quote not found');
    }

    // Check valid transition
    const allowedStatuses = validTransitions[quote.status] || [];
    if (!allowedStatuses.includes(newStatus)) {
      throw new Error(`Invalid status transition: ${quote.status} → ${newStatus}`);
    }

    // Prepare update data
    const updateData = {
      status: newStatus,
      ...additionalData
    };

    // Add timestamps based on status
    const now = new Date().toISOString();
    switch (newStatus) {
      case 'sent':
        updateData.sent_at = now;
        break;
      case 'viewed':
        updateData.viewed_at = now;
        break;
      case 'signed':
        updateData.signed_at = now;
        updateData.is_signed = true;
        break;
    }

    const res = await api.patch(`/items/quotes/${quoteId}`, updateData);

    console.log(`✅ Quote ${quoteId} status updated: ${quote.status} → ${newStatus}`);

    return {
      success: true,
      quote: res.data.data,
      previous_status: quote.status,
      new_status: newStatus
    };
  } catch (error) {
    console.error('Error updating quote status:', error.message);
    throw error;
  }
}

/**
 * Marquer un devis comme signé
 */
export async function markQuoteAsSigned(quoteId, signatureData) {
  try {
    const {
      signer_name,
      signer_email,
      ip_address,
      user_agent,
      docuseal_submission_id,
      signed_document_url
    } = signatureData;

    const quote = await getQuote(quoteId);
    if (!quote) {
      throw new Error('Quote not found');
    }

    // Create signature log
    await api.post('/items/signature_logs', {
      quote_id: quoteId,
      contact_id: quote.contact_id?.id,
      signer_name,
      signer_email,
      signer_role: 'client',
      docuseal_submission_id,
      signed_at: new Date().toISOString(),
      ip_address,
      user_agent,
      signed_document_url,
      signature_type: 'SES',
      is_valid: true
    });

    // Update quote status
    return await updateQuoteStatus(quoteId, 'signed', {
      docuseal_submission_id,
      signed_document_url
    });
  } catch (error) {
    console.error('Error marking quote as signed:', error.message);
    throw error;
  }
}

/**
 * Enregistrer l'acceptation des CGV
 */
export async function recordCGVAcceptance(quoteId, acceptanceData) {
  try {
    const {
      contact_id,
      company_id,
      cgv_version_id,
      ip_address,
      user_agent,
      acceptance_method = 'portal_checkbox'
    } = acceptanceData;

    // Get CGV content for snapshot
    const cgvRes = await api.get(`/items/cgv_versions/${cgv_version_id}`);
    const cgv = cgvRes.data.data;

    // Create hash of CGV content
    const crypto = await import('crypto');
    const cgvHash = crypto.createHash('sha256')
      .update(cgv.content_html || '')
      .digest('hex');

    // Create acceptance record
    const acceptance = await api.post('/items/cgv_acceptances', {
      contact_id,
      company_id,
      cgv_version_id,
      quote_id: quoteId,
      accepted_at: new Date().toISOString(),
      ip_address,
      user_agent,
      acceptance_method,
      cgv_content_snapshot: cgv.content_html,
      cgv_hash: cgvHash,
      is_valid: true
    });

    // Update quote
    await api.patch(`/items/quotes/${quoteId}`, {
      cgv_accepted: true,
      cgv_acceptance_id: acceptance.data.data.id
    });

    console.log(`✅ CGV acceptance recorded for quote ${quoteId}`);

    return {
      success: true,
      acceptance_id: acceptance.data.data.id
    };
  } catch (error) {
    console.error('Error recording CGV acceptance:', error.message);
    throw error;
  }
}

/**
 * Statistiques des devis
 */
export async function getQuoteStats(ownerCompanyId, dateFrom = null, dateTo = null) {
  try {
    const filter = { _and: [] };

    if (ownerCompanyId) {
      filter._and.push({ owner_company_id: { _eq: ownerCompanyId } });
    }
    if (dateFrom) {
      filter._and.push({ date_created: { _gte: dateFrom } });
    }
    if (dateTo) {
      filter._and.push({ date_created: { _lte: dateTo } });
    }

    const res = await api.get('/items/quotes', {
      params: {
        filter: filter._and.length > 0 ? filter : undefined,
        aggregate: {
          count: '*',
          sum: ['total']
        },
        groupBy: ['status']
      }
    });

    const stats = {
      total_quotes: 0,
      total_value: 0,
      by_status: {}
    };

    for (const item of res.data.data) {
      const count = parseInt(item.count) || 0;
      const value = parseFloat(item.sum?.total) || 0;

      stats.total_quotes += count;
      stats.total_value += value;
      stats.by_status[item.status] = { count, value };
    }

    return stats;
  } catch (error) {
    console.error('Error getting quote stats:', error.message);
    return { total_quotes: 0, total_value: 0, by_status: {} };
  }
}

export default {
  createQuote,
  getQuote,
  listQuotes,
  updateQuoteStatus,
  markQuoteAsSigned,
  recordCGVAcceptance,
  getQuoteStats,
  calculateTotals,
  generateQuoteNumber,
  getDepositConfig,
  getActiveCGV
};
