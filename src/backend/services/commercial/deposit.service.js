/**
 * Deposit Service - Gestion des acomptes
 *
 * Fonctionnalités:
 * - Calcul montant acompte selon config
 * - Génération facture acompte
 * - Suivi paiement
 * - Rappels automatiques
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

/**
 * Récupérer la configuration d'acompte
 */
export async function getDepositConfig(ownerCompanyId, projectType = 'default') {
  try {
    // Try specific project type first
    let res = await api.get('/items/deposit_configs', {
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

    if (res.data.data.length > 0) {
      return res.data.data[0];
    }

    // Fallback to default config
    res = await api.get('/items/deposit_configs', {
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

    if (res.data.data.length > 0) {
      return res.data.data[0];
    }

    // Ultimate fallback
    return {
      deposit_percentage: 30,
      project_type: 'default',
      is_fallback: true
    };
  } catch (error) {
    console.error('Error getting deposit config:', error.message);
    return { deposit_percentage: 30, is_fallback: true };
  }
}

/**
 * Calculer le montant de l'acompte pour un devis
 */
export async function calculateDeposit(quoteId) {
  try {
    // Get quote
    const quoteRes = await api.get(`/items/quotes/${quoteId}`, {
      params: {
        fields: ['id', 'total', 'project_type', 'owner_company_id', 'deposit_percentage', 'deposit_amount']
      }
    });

    const quote = quoteRes.data.data;
    if (!quote) {
      throw new Error('Quote not found');
    }

    // If already calculated, return existing
    if (quote.deposit_amount && quote.deposit_percentage) {
      return {
        percentage: quote.deposit_percentage,
        amount: quote.deposit_amount,
        total: quote.total
      };
    }

    // Get config
    const config = await getDepositConfig(quote.owner_company_id, quote.project_type);
    const percentage = parseFloat(config.deposit_percentage) || 30;
    const amount = Math.round(quote.total * percentage / 100 * 100) / 100;

    // Update quote with calculated values
    await api.patch(`/items/quotes/${quoteId}`, {
      deposit_percentage: percentage,
      deposit_amount: amount
    });

    return {
      percentage,
      amount,
      total: quote.total
    };
  } catch (error) {
    console.error('Error calculating deposit:', error.message);
    throw error;
  }
}

/**
 * Générer le prochain numéro de facture
 */
async function generateInvoiceNumber(ownerCompanyId, isDeposit = false) {
  try {
    const companyRes = await api.get(`/items/owner_companies/${ownerCompanyId}`);
    const company = companyRes.data.data;
    const prefix = company.code?.substring(0, 3).toUpperCase() || 'INV';
    const suffix = isDeposit ? 'A' : '';

    const year = new Date().getFullYear();
    const pattern = `${prefix}-${year}`;

    const invoicesRes = await api.get('/items/client_invoices', {
      params: {
        filter: {
          invoice_number: { _starts_with: pattern }
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
    console.error('Error generating invoice number:', error.message);
    return `INV-${Date.now()}`;
  }
}

/**
 * Créer une facture d'acompte
 */
export async function createDepositInvoice(quoteId) {
  try {
    // Get quote with relations
    const quoteRes = await api.get(`/items/quotes/${quoteId}`, {
      params: {
        fields: [
          '*',
          'contact_id.id',
          'contact_id.first_name',
          'contact_id.last_name',
          'contact_id.email',
          'company_id.id',
          'company_id.name',
          'owner_company_id.id',
          'owner_company_id.name',
          'owner_company_id.code'
        ].join(',')
      }
    });

    const quote = quoteRes.data.data;
    if (!quote) {
      throw new Error('Quote not found');
    }

    if (!quote.is_signed) {
      throw new Error('Quote must be signed before creating deposit invoice');
    }

    if (quote.deposit_invoice_id) {
      // Return existing invoice
      const existingInvoice = await api.get(`/items/client_invoices/${quote.deposit_invoice_id}`);
      return {
        success: true,
        invoice: existingInvoice.data.data,
        isNew: false
      };
    }

    // Calculate deposit if not already done
    const deposit = await calculateDeposit(quoteId);

    // Generate invoice number
    const invoiceNumber = await generateInvoiceNumber(quote.owner_company_id, true);

    // Create invoice
    const invoiceData = {
      invoice_number: invoiceNumber,
      contact_id: quote.contact_id?.id,
      company_id: quote.company_id?.id,
      owner_company: quote.owner_company_id?.code,
      quote_id: quoteId,
      amount: deposit.amount,
      currency: quote.currency || 'CHF',
      status: 'pending',
      is_deposit: true,
      description: `Acompte ${deposit.percentage}% - Devis ${quote.quote_number}`,
      due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 10 days
    };

    const invoiceRes = await api.post('/items/client_invoices', invoiceData);
    const invoice = invoiceRes.data.data;

    // Update quote with invoice reference
    await api.patch(`/items/quotes/${quoteId}`, {
      deposit_invoice_id: invoice.id,
      status: 'awaiting_deposit'
    });

    console.log(`✅ Deposit invoice created: ${invoiceNumber} for quote ${quote.quote_number}`);

    return {
      success: true,
      invoice,
      isNew: true
    };
  } catch (error) {
    console.error('Error creating deposit invoice:', error.message);
    throw error;
  }
}

/**
 * Marquer l'acompte comme payé
 */
export async function markDepositPaid(quoteId, paymentData = {}) {
  try {
    const {
      payment_date = new Date().toISOString(),
      payment_method,
      payment_reference,
      bank_transaction_id
    } = paymentData;

    // Get quote
    const quoteRes = await api.get(`/items/quotes/${quoteId}`, {
      params: {
        fields: ['*', 'deposit_invoice_id']
      }
    });

    const quote = quoteRes.data.data;
    if (!quote) {
      throw new Error('Quote not found');
    }

    // Update invoice if exists
    if (quote.deposit_invoice_id) {
      await api.patch(`/items/client_invoices/${quote.deposit_invoice_id}`, {
        status: 'paid',
        payment_date: payment_date.split('T')[0],
        payment_method,
        payment_reference
      });
    }

    // Update quote
    await api.patch(`/items/quotes/${quoteId}`, {
      deposit_paid: true,
      deposit_paid_at: payment_date,
      status: 'completed'
    });

    console.log(`✅ Deposit marked as paid for quote ${quote.quote_number}`);

    return {
      success: true,
      status: 'completed'
    };
  } catch (error) {
    console.error('Error marking deposit as paid:', error.message);
    throw error;
  }
}

/**
 * Récupérer les acomptes en attente
 */
export async function getPendingDeposits(ownerCompanyId = null, daysOld = null) {
  try {
    const filter = {
      _and: [
        { deposit_paid: { _eq: false } },
        { is_signed: { _eq: true } },
        { status: { _in: ['signed', 'awaiting_deposit'] } }
      ]
    };

    if (ownerCompanyId) {
      filter._and.push({ owner_company_id: { _eq: ownerCompanyId } });
    }

    if (daysOld) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);
      filter._and.push({ signed_at: { _lte: cutoffDate.toISOString() } });
    }

    const res = await api.get('/items/quotes', {
      params: {
        filter,
        sort: ['signed_at'],
        fields: [
          '*',
          'contact_id.first_name',
          'contact_id.last_name',
          'contact_id.email',
          'company_id.name',
          'owner_company_id.name',
          'deposit_invoice_id.invoice_number',
          'deposit_invoice_id.status'
        ].join(',')
      }
    });

    return res.data.data;
  } catch (error) {
    console.error('Error getting pending deposits:', error.message);
    return [];
  }
}

/**
 * Récupérer les acomptes en retard
 */
export async function getOverdueDeposits(ownerCompanyId = null) {
  try {
    const filter = {
      _and: [
        { is_deposit: { _eq: true } },
        { status: { _eq: 'pending' } },
        { due_date: { _lt: new Date().toISOString().split('T')[0] } }
      ]
    };

    if (ownerCompanyId) {
      filter._and.push({ owner_company: { _eq: ownerCompanyId } });
    }

    const res = await api.get('/items/client_invoices', {
      params: {
        filter,
        sort: ['due_date'],
        fields: [
          '*',
          'contact_id.first_name',
          'contact_id.last_name',
          'contact_id.email',
          'quote_id.quote_number'
        ].join(',')
      }
    });

    return res.data.data;
  } catch (error) {
    console.error('Error getting overdue deposits:', error.message);
    return [];
  }
}

/**
 * Mettre à jour la configuration d'acompte
 */
export async function updateDepositConfig(configId, updates) {
  try {
    const allowedFields = ['deposit_percentage', 'min_amount', 'max_amount', 'status'];
    const updateData = {};

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field];
      }
    }

    await api.patch(`/items/deposit_configs/${configId}`, updateData);

    return { success: true };
  } catch (error) {
    console.error('Error updating deposit config:', error.message);
    throw error;
  }
}

/**
 * Statistiques des acomptes
 */
export async function getDepositStats(ownerCompanyId, dateFrom = null, dateTo = null) {
  try {
    const filter = { _and: [] };

    if (ownerCompanyId) {
      filter._and.push({ owner_company_id: { _eq: ownerCompanyId } });
    }

    filter._and.push({ is_signed: { _eq: true } });

    if (dateFrom) {
      filter._and.push({ signed_at: { _gte: dateFrom } });
    }
    if (dateTo) {
      filter._and.push({ signed_at: { _lte: dateTo } });
    }

    const res = await api.get('/items/quotes', {
      params: {
        filter: filter._and.length > 0 ? filter : undefined,
        fields: ['deposit_amount', 'deposit_paid', 'deposit_paid_at']
      }
    });

    const quotes = res.data.data;

    const stats = {
      total_expected: 0,
      total_received: 0,
      total_pending: 0,
      count_paid: 0,
      count_pending: 0,
      average_deposit: 0
    };

    for (const quote of quotes) {
      const amount = parseFloat(quote.deposit_amount) || 0;
      stats.total_expected += amount;

      if (quote.deposit_paid) {
        stats.total_received += amount;
        stats.count_paid++;
      } else {
        stats.total_pending += amount;
        stats.count_pending++;
      }
    }

    if (quotes.length > 0) {
      stats.average_deposit = Math.round(stats.total_expected / quotes.length * 100) / 100;
    }

    stats.collection_rate = stats.total_expected > 0
      ? Math.round(stats.total_received / stats.total_expected * 100)
      : 0;

    return stats;
  } catch (error) {
    console.error('Error getting deposit stats:', error.message);
    return null;
  }
}

export default {
  getDepositConfig,
  calculateDeposit,
  createDepositInvoice,
  markDepositPaid,
  getPendingDeposits,
  getOverdueDeposits,
  updateDepositConfig,
  getDepositStats
};
