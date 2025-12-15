/**
 * Workflow Service - Orchestration du workflow commercial complet
 *
 * Lead → Quote → CGV → Signature → Acompte → Projet
 *
 * Fonctionnalités:
 * - Conversion lead → devis
 * - Envoi devis au client
 * - Workflow complet automatisé
 * - Création projet post-signature
 * - Statistiques pipeline
 *
 * @date 15 Décembre 2025
 */

import axios from 'axios';
import * as quoteService from './quote.service.js';
import * as cgvService from './cgv.service.js';
import * as signatureService from './signature.service.js';
import * as depositService from './deposit.service.js';
import * as portalService from './client-portal.service.js';

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
 * Convertir un lead en devis
 */
export async function convertLeadToQuote(leadId, quoteData = {}) {
  try {
    // Get lead with details
    const leadRes = await api.get(`/items/leads/${leadId}`, {
      params: {
        fields: [
          '*',
          'company.id',
          'company.name',
          'owner_company'
        ]
      }
    });

    const lead = leadRes.data.data;
    if (!lead) {
      throw new Error('Lead not found');
    }

    // Check if lead already converted
    if (lead.status === 'converted') {
      throw new Error('Lead already converted');
    }

    // Find or create contact
    let contactId = null;
    if (lead.email) {
      const contactRes = await api.get('/items/people', {
        params: {
          filter: { email: { _eq: lead.email } },
          limit: 1
        }
      });

      if (contactRes.data.data.length > 0) {
        contactId = contactRes.data.data[0].id;
      } else {
        // Create contact
        const names = (lead.company_name || lead.name || '').split(' ');
        const newContact = await api.post('/items/people', {
          first_name: names[0] || 'Contact',
          last_name: names.slice(1).join(' ') || lead.company_name,
          email: lead.email,
          phone: lead.phone,
          company_id: lead.company?.id,
          owner_company: lead.owner_company
        });
        contactId = newContact.data.data.id;
      }
    }

    // Get owner company ID
    let ownerCompanyId = null;
    if (lead.owner_company) {
      const ownerRes = await api.get('/items/owner_companies', {
        params: {
          filter: { code: { _eq: lead.owner_company } },
          limit: 1
        }
      });
      if (ownerRes.data.data.length > 0) {
        ownerCompanyId = ownerRes.data.data[0].id;
      }
    }

    // Create quote
    const quote = await quoteService.createQuote({
      contact_id: contactId,
      company_id: lead.company?.id,
      owner_company_id: ownerCompanyId,
      lead_id: leadId,
      title: quoteData.title || `Devis - ${lead.company_name || lead.name}`,
      description: quoteData.description || lead.notes,
      project_type: quoteData.project_type || 'web_design',
      line_items: quoteData.line_items || [],
      ...quoteData
    });

    // Update lead status
    await api.patch(`/items/leads/${leadId}`, {
      status: 'converted',
      converted_at: new Date().toISOString(),
      converted_quote_id: quote.quote.id
    });

    console.log(`✅ Lead ${leadId} converted to quote ${quote.quote_number}`);

    return {
      success: true,
      lead_id: leadId,
      quote_id: quote.quote.id,
      quote_number: quote.quote_number,
      contact_id: contactId
    };
  } catch (error) {
    console.error('Error converting lead to quote:', error.message);
    throw error;
  }
}

/**
 * Envoyer un devis au client
 */
export async function sendQuoteToClient(quoteId, options = {}) {
  try {
    const {
      send_email = true,
      create_portal_account = true,
      message
    } = options;

    // Get quote with contact
    const quote = await quoteService.getQuote(quoteId);
    if (!quote) {
      throw new Error('Quote not found');
    }

    if (quote.status !== 'draft') {
      throw new Error(`Cannot send quote in status: ${quote.status}`);
    }

    const contactEmail = quote.contact_id?.email;
    if (!contactEmail) {
      throw new Error('Contact email required to send quote');
    }

    // Create portal account if needed
    let portalAccount = null;
    if (create_portal_account) {
      portalAccount = await portalService.createPortalAccount({
        contact_id: quote.contact_id?.id,
        company_id: quote.company_id?.id,
        owner_company_id: quote.owner_company_id?.id,
        email: contactEmail
      });
    }

    // Update quote status to sent
    await quoteService.updateQuoteStatus(quoteId, 'sent');

    // TODO: Send email via Mautic or SMTP
    if (send_email) {
      console.log(`📧 Email would be sent to ${contactEmail} for quote ${quote.quote_number}`);
      // await sendQuoteEmail(quote, portalAccount, message);
    }

    console.log(`✅ Quote ${quote.quote_number} sent to ${contactEmail}`);

    return {
      success: true,
      quote_number: quote.quote_number,
      sent_to: contactEmail,
      portal_account: portalAccount?.isNew ? 'created' : 'existing',
      activation_url: portalAccount?.activationUrl
    };
  } catch (error) {
    console.error('Error sending quote:', error.message);
    throw error;
  }
}

/**
 * Processus complet de signature: CGV + Signature + Acompte
 */
export async function initiateSigningProcess(quoteId, clientData) {
  try {
    const {
      ip_address,
      user_agent,
      accept_cgv = true
    } = clientData;

    const quote = await quoteService.getQuote(quoteId);
    if (!quote) {
      throw new Error('Quote not found');
    }

    // Step 1: Record CGV acceptance if not done
    if (accept_cgv && !quote.cgv_accepted && quote.cgv_version_id) {
      await cgvService.recordAcceptance({
        contact_id: quote.contact_id?.id,
        company_id: quote.company_id?.id,
        cgv_version_id: quote.cgv_version_id?.id,
        quote_id: quoteId,
        ip_address,
        user_agent,
        acceptance_method: 'portal_checkbox'
      });

      // Update quote
      await api.patch(`/items/quotes/${quoteId}`, {
        cgv_accepted: true
      });
    }

    // Step 2: Create signature request
    const signatureRequest = await signatureService.createSignatureRequest(quoteId, {
      signature_type: 'SES',
      send_email: true
    });

    return {
      success: true,
      cgv_accepted: true,
      signature_request: signatureRequest,
      next_step: 'sign_document'
    };
  } catch (error) {
    console.error('Error initiating signing process:', error.message);
    throw error;
  }
}

/**
 * Compléter le processus après signature
 */
export async function completeSigningProcess(quoteId, signatureData) {
  try {
    // Mark quote as signed
    await signatureService.signQuoteManually(quoteId, signatureData);

    // Create deposit invoice
    const depositResult = await depositService.createDepositInvoice(quoteId);

    return {
      success: true,
      signed: true,
      deposit_invoice: depositResult.invoice,
      next_step: 'await_payment'
    };
  } catch (error) {
    console.error('Error completing signing process:', error.message);
    throw error;
  }
}

/**
 * Créer un projet à partir d'un devis payé
 */
export async function createProjectFromQuote(quoteId) {
  try {
    const quote = await quoteService.getQuote(quoteId);
    if (!quote) {
      throw new Error('Quote not found');
    }

    if (!quote.deposit_paid) {
      throw new Error('Deposit must be paid before creating project');
    }

    if (quote.project_id) {
      // Return existing project
      const projectRes = await api.get(`/items/projects/${quote.project_id}`);
      return {
        success: true,
        project: projectRes.data.data,
        isNew: false
      };
    }

    // Create project
    const projectData = {
      name: quote.title || `Projet - ${quote.quote_number}`,
      description: quote.description,
      client_id: quote.contact_id?.id,
      company_id: quote.company_id?.id,
      owner_company: quote.owner_company_id?.code,
      quote_id: quoteId,
      budget: quote.total,
      status: 'planning',
      start_date: new Date().toISOString().split('T')[0]
    };

    const projectRes = await api.post('/items/projects', projectData);
    const project = projectRes.data.data;

    // Update quote with project reference
    await api.patch(`/items/quotes/${quoteId}`, {
      project_id: project.id
    });

    console.log(`✅ Project created from quote ${quote.quote_number}`);

    return {
      success: true,
      project,
      isNew: true
    };
  } catch (error) {
    console.error('Error creating project from quote:', error.message);
    throw error;
  }
}

/**
 * Traiter le paiement de l'acompte (après confirmation bancaire)
 */
export async function processDepositPayment(quoteId, paymentData) {
  try {
    // Mark deposit as paid
    await depositService.markDepositPaid(quoteId, paymentData);

    // Auto-create project
    const projectResult = await createProjectFromQuote(quoteId);

    // TODO: Send confirmation email
    // TODO: Notify team via Slack/webhook

    return {
      success: true,
      deposit_paid: true,
      project: projectResult.project,
      workflow_complete: true
    };
  } catch (error) {
    console.error('Error processing deposit payment:', error.message);
    throw error;
  }
}

/**
 * Obtenir le statut complet du workflow pour un devis
 */
export async function getWorkflowStatus(quoteId) {
  try {
    const quote = await quoteService.getQuote(quoteId);
    if (!quote) {
      throw new Error('Quote not found');
    }

    const signatureLogs = await signatureService.getSignatureLogs(quoteId);

    const status = {
      quote_id: quoteId,
      quote_number: quote.quote_number,
      quote_status: quote.status,
      steps: {
        created: {
          completed: true,
          date: quote.date_created
        },
        sent: {
          completed: !!quote.sent_at,
          date: quote.sent_at
        },
        viewed: {
          completed: !!quote.viewed_at,
          date: quote.viewed_at
        },
        cgv_accepted: {
          completed: quote.cgv_accepted,
          date: null // Could be tracked
        },
        signed: {
          completed: quote.is_signed,
          date: quote.signed_at,
          signatures: signatureLogs.length
        },
        deposit_invoiced: {
          completed: !!quote.deposit_invoice_id,
          invoice_id: quote.deposit_invoice_id
        },
        deposit_paid: {
          completed: quote.deposit_paid,
          date: quote.deposit_paid_at
        },
        project_created: {
          completed: !!quote.project_id,
          project_id: quote.project_id
        }
      },
      next_action: getNextAction(quote),
      completion_percentage: calculateCompletion(quote)
    };

    return status;
  } catch (error) {
    console.error('Error getting workflow status:', error.message);
    throw error;
  }
}

/**
 * Déterminer la prochaine action requise
 */
function getNextAction(quote) {
  if (quote.status === 'draft') return 'send_to_client';
  if (quote.status === 'sent') return 'await_client_view';
  if (quote.status === 'viewed' && !quote.cgv_accepted) return 'await_cgv_acceptance';
  if (quote.status === 'viewed' && quote.cgv_accepted && !quote.is_signed) return 'await_signature';
  if (quote.is_signed && !quote.deposit_invoice_id) return 'create_deposit_invoice';
  if (quote.deposit_invoice_id && !quote.deposit_paid) return 'await_deposit_payment';
  if (quote.deposit_paid && !quote.project_id) return 'create_project';
  if (quote.project_id) return 'workflow_complete';
  return 'unknown';
}

/**
 * Calculer le pourcentage de complétion
 */
function calculateCompletion(quote) {
  let completed = 0;
  const total = 7;

  if (quote.sent_at) completed++;
  if (quote.viewed_at) completed++;
  if (quote.cgv_accepted) completed++;
  if (quote.is_signed) completed++;
  if (quote.deposit_invoice_id) completed++;
  if (quote.deposit_paid) completed++;
  if (quote.project_id) completed++;

  return Math.round(completed / total * 100);
}

/**
 * Statistiques du pipeline commercial
 */
export async function getPipelineStats(ownerCompanyId, dateFrom = null, dateTo = null) {
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

    // Get quotes by status
    const quotesRes = await api.get('/items/quotes', {
      params: {
        filter: filter._and.length > 0 ? filter : undefined,
        aggregate: {
          count: '*',
          sum: ['total', 'deposit_amount']
        },
        groupBy: ['status']
      }
    });

    // Get leads stats
    const leadsFilter = { ...filter };
    if (ownerCompanyId) {
      // Need to get owner company code
      const ownerRes = await api.get(`/items/owner_companies/${ownerCompanyId}`);
      const code = ownerRes.data.data?.code;
      if (code) {
        leadsFilter._and = leadsFilter._and.filter(f => !f.owner_company_id);
        leadsFilter._and.push({ owner_company: { _eq: code } });
      }
    }

    const leadsRes = await api.get('/items/leads', {
      params: {
        filter: leadsFilter._and.length > 0 ? leadsFilter : undefined,
        aggregate: { count: '*' },
        groupBy: ['status']
      }
    });

    // Build stats
    const stats = {
      pipeline: {
        leads: {},
        quotes: {}
      },
      totals: {
        leads: 0,
        quotes: 0,
        total_value: 0,
        pending_deposits: 0,
        collected_deposits: 0
      },
      conversion_rates: {}
    };

    // Process leads
    for (const item of leadsRes.data.data) {
      const count = parseInt(item.count) || 0;
      stats.pipeline.leads[item.status] = count;
      stats.totals.leads += count;
    }

    // Process quotes
    for (const item of quotesRes.data.data) {
      const count = parseInt(item.count) || 0;
      const value = parseFloat(item.sum?.total) || 0;
      const deposits = parseFloat(item.sum?.deposit_amount) || 0;

      stats.pipeline.quotes[item.status] = { count, value };
      stats.totals.quotes += count;
      stats.totals.total_value += value;

      if (['completed'].includes(item.status)) {
        stats.totals.collected_deposits += deposits;
      } else if (['signed', 'awaiting_deposit'].includes(item.status)) {
        stats.totals.pending_deposits += deposits;
      }
    }

    // Calculate conversion rates
    const leadTotal = stats.totals.leads;
    const quoteTotal = stats.totals.quotes;
    const signedQuotes = (stats.pipeline.quotes['signed']?.count || 0) +
                         (stats.pipeline.quotes['awaiting_deposit']?.count || 0) +
                         (stats.pipeline.quotes['completed']?.count || 0);

    stats.conversion_rates = {
      lead_to_quote: leadTotal > 0 ? Math.round((quoteTotal / leadTotal) * 100) : 0,
      quote_to_signed: quoteTotal > 0 ? Math.round((signedQuotes / quoteTotal) * 100) : 0,
      overall: leadTotal > 0 ? Math.round((signedQuotes / leadTotal) * 100) : 0
    };

    return stats;
  } catch (error) {
    console.error('Error getting pipeline stats:', error.message);
    return null;
  }
}

export default {
  convertLeadToQuote,
  sendQuoteToClient,
  initiateSigningProcess,
  completeSigningProcess,
  createProjectFromQuote,
  processDepositPayment,
  getWorkflowStatus,
  getPipelineStats
};
