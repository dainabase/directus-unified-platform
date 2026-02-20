/**
 * DocuSeal Integration Service
 *
 * Electronic signature integration for quotes and contracts
 * Supports SES, AES, and QES signature levels
 * Phase H: local DocuSeal (http://localhost:3003), HTML templates, deposit invoice trigger
 *
 * @date 15 Decembre 2025 / Phase H: 20 Fevrier 2026
 */

import axios from 'axios';
import crypto from 'crypto';

const DOCUSEAL_API_URL = process.env.DOCUSEAL_URL || process.env.DOCUSEAL_API_URL || 'http://localhost:3003';
const DOCUSEAL_API_KEY = process.env.DOCUSEAL_API_KEY || '';
const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_TOKEN = process.env.DIRECTUS_ADMIN_TOKEN || process.env.DIRECTUS_TOKEN || 'hypervisual-admin-static-token-2026';
const WEBHOOK_BASE_URL = process.env.APP_URL || process.env.WEBHOOK_BASE_URL || 'http://localhost:3000';

// Cached template ID
let cachedTemplateId = null;

// DocuSeal API client
const docusealApi = axios.create({
  baseURL: DOCUSEAL_API_URL,
  headers: {
    'X-Auth-Token': DOCUSEAL_API_KEY,
    'Content-Type': 'application/json'
  }
});

// Directus API client
const directusApi = axios.create({
  baseURL: DIRECTUS_URL,
  headers: {
    'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// Signature levels mapping
const SIGNATURE_LEVELS = {
  simple: 'SES',     // Simple Electronic Signature
  advanced: 'AES',   // Advanced Electronic Signature
  qualified: 'QES'   // Qualified Electronic Signature (Swiss ZertES)
};

/**
 * Create a signature request from a quote
 * H-01: Uses local DocuSeal submitters API + HTML template
 */
export async function createQuoteSignatureRequest(quoteId, options = {}) {
  try {
    // Get quote data
    const quoteRes = await directusApi.get(`/items/quotes/${quoteId}`, {
      params: {
        fields: '*,contact_id.*,owner_company_id.*'
      }
    });
    const quote = quoteRes.data.data;

    if (!quote) {
      throw new Error('Quote not found');
    }

    if (!quote.contact_id?.email) {
      throw new Error('Contact email is required for signature');
    }

    // Already sent?
    if (quote.docuseal_submission_id) {
      return {
        success: true,
        alreadySent: true,
        submissionId: quote.docuseal_submission_id,
        embedUrl: quote.docuseal_embed_url,
        message: 'Signature request already sent'
      };
    }

    // Get or create HTML template
    const templateId = await getOrCreateHtmlTemplate();

    const formatCHF = (v) => new Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF' }).format(v || 0);

    // Create DocuSeal submission with submitters API
    const submission = await docusealApi.post('/api/submissions', {
      template_id: templateId,
      send_email: true,
      submitters: [
        {
          name: `${quote.contact_id.first_name || ''} ${quote.contact_id.last_name || ''}`.trim() || quote.contact_id.email,
          email: quote.contact_id.email,
          role: 'Client',
          fields: [
            { name: 'quote_number', default_value: quote.quote_number || '' },
            { name: 'total_amount', default_value: formatCHF(quote.total) },
            { name: 'project_type', default_value: quote.project_type || '' },
            { name: 'valid_until', default_value: quote.valid_until || '' }
          ]
        }
      ]
    });

    const submissionData = submission.data;
    const embedSrc = submissionData.submitters?.[0]?.embed_src
      || submissionData[0]?.embed_src
      || null;

    const submissionId = submissionData.id || submissionData[0]?.submission_id;

    // Log signature request in Directus
    try {
      await directusApi.post('/items/signature_logs', {
        quote_id: quoteId,
        provider: 'docuseal',
        provider_reference: String(submissionId),
        status: 'pending',
        signature_level: options.signatureLevel || 'SES',
        ip_address: options.clientIP,
        user_agent: options.userAgent
      });
    } catch (logErr) {
      console.error('[DocuSeal] Signature log creation failed:', logErr.message);
    }

    // Update quote with DocuSeal fields
    await directusApi.patch(`/items/quotes/${quoteId}`, {
      status: 'sent',
      sent_at: new Date().toISOString(),
      docuseal_submission_id: submissionId,
      docuseal_embed_url: embedSrc,
      signature_requested_at: new Date().toISOString()
    });

    console.log(`[H-01] Devis ${quote.quote_number} envoye pour signature — DocuSeal #${submissionId}`);

    return {
      success: true,
      submissionId,
      embedUrl: embedSrc,
      signingUrls: submissionData.submitters?.map(s => ({
        email: s.email,
        url: s.embed_src
      })) || [],
      message: 'Signature request created successfully'
    };
  } catch (error) {
    console.error('[DocuSeal] createQuoteSignatureRequest error:', error.message);
    throw error;
  }
}

/**
 * Create a signature request for CGV acceptance
 */
export async function createCGVSignatureRequest(cgvAcceptanceId, options = {}) {
  try {
    const acceptanceRes = await directusApi.get(`/items/cgv_acceptances/${cgvAcceptanceId}`, {
      params: {
        fields: '*,cgv_version_id.*,contact_id.*,owner_company_id.*'
      }
    });
    const acceptance = acceptanceRes.data.data;

    if (!acceptance) {
      throw new Error('CGV acceptance record not found');
    }

    const signer = {
      name: `${acceptance.contact_id.first_name} ${acceptance.contact_id.last_name}`,
      email: acceptance.contact_id.email,
      role: 'Client'
    };

    const submission = await docusealApi.post('/submissions', {
      template_id: options.templateId || getTemplateIdForType('cgv'),
      send_email: true,
      signers: [{
        ...signer,
        fields: [
          {
            name: 'signature',
            type: 'signature',
            required: true
          },
          {
            name: 'acceptance_checkbox',
            type: 'checkbox',
            required: true,
            label: 'Je confirme avoir lu et accepté les CGV'
          }
        ]
      }],
      external_id: `cgv-${cgvAcceptanceId}`,
      metadata: {
        cgv_acceptance_id: cgvAcceptanceId,
        cgv_version: acceptance.cgv_version_id?.version,
        owner_company: acceptance.owner_company_id?.code
      },
      webhook_url: `${WEBHOOK_BASE_URL}/api/commercial/signatures/webhook/docuseal`,
      documents: [
        {
          name: `CGV_${acceptance.owner_company_id?.code}_v${acceptance.cgv_version_id?.version}.pdf`,
          url: acceptance.cgv_version_id?.pdf_url
        }
      ]
    });

    await directusApi.patch(`/items/cgv_acceptances/${cgvAcceptanceId}`, {
      signature_request_id: submission.data.id,
      status: 'pending_signature'
    });

    return {
      success: true,
      submissionId: submission.data.id,
      signingUrl: submission.data.signers?.[0]?.embed_url
    };
  } catch (error) {
    console.error('❌ DocuSeal createCGVSignatureRequest error:', error.message);
    throw error;
  }
}

/**
 * Get signature status from DocuSeal
 */
export async function getSignatureStatus(submissionId) {
  try {
    const response = await docusealApi.get(`/submissions/${submissionId}`);
    const submission = response.data;

    return {
      id: submission.id,
      status: mapDocuSealStatus(submission.status),
      completedAt: submission.completed_at,
      signers: submission.signers?.map(s => ({
        email: s.email,
        status: s.status,
        signedAt: s.signed_at
      })),
      documents: submission.documents?.map(d => ({
        name: d.name,
        url: d.url
      }))
    };
  } catch (error) {
    console.error('❌ DocuSeal getSignatureStatus error:', error.message);
    throw error;
  }
}

/**
 * Handle DocuSeal webhook
 * H-02: Supports form.completed, form.viewed (local DocuSeal) + submission.* events (cloud)
 */
export async function handleWebhook(payload, signature) {
  try {
    // Verify webhook signature (optional — skip if no signature in dev)
    if (DOCUSEAL_API_KEY && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', DOCUSEAL_API_KEY)
        .update(JSON.stringify(payload))
        .digest('hex');

      if (signature !== expectedSignature) {
        throw new Error('Invalid webhook signature');
      }
    }

    const { event_type, data } = payload;
    console.log(`[DocuSeal Webhook] Event: ${event_type}`);

    switch (event_type) {
      // Local DocuSeal events
      case 'form.completed':
        await handleFormCompleted(payload);
        break;
      case 'form.viewed':
        await handleFormViewed(payload);
        break;
      // Cloud DocuSeal events (backward compat)
      case 'submission.completed':
        await handleSubmissionCompleted(data);
        break;
      case 'submission.expired':
        await handleSubmissionExpired(data);
        break;
      case 'submission.declined':
        await handleSubmissionDeclined(data);
        break;
      case 'signer.signed':
        await handleSignerSigned(data);
        break;
      default:
        console.log(`[DocuSeal Webhook] Unhandled event: ${event_type}`);
    }

    return { success: true };
  } catch (error) {
    console.error('[DocuSeal Webhook] Error:', error.message);
    throw error;
  }
}

/**
 * H-02: Handle form.completed (local DocuSeal event)
 */
async function handleFormCompleted(payload) {
  const submissionId = payload.data?.submission?.id;
  const signedAt = payload.data?.submission?.completed_at || new Date().toISOString();
  const pdfUrl = payload.data?.submitter?.documents?.[0]?.url;

  if (!submissionId) {
    console.error('[DocuSeal H-02] No submission ID in form.completed payload');
    return;
  }

  // Find quote by docuseal_submission_id
  const quotesRes = await directusApi.get('/items/quotes', {
    params: {
      filter: { docuseal_submission_id: { _eq: submissionId } },
      fields: '*',
      limit: 1
    }
  });

  const quote = quotesRes.data.data?.[0];
  if (!quote) {
    console.log(`[DocuSeal H-02] No quote found for submission #${submissionId}`);
    return;
  }

  // Update quote — mark signed
  await directusApi.patch(`/items/quotes/${quote.id}`, {
    status: 'signed',
    is_signed: true,
    signed_at: signedAt,
    docuseal_signed_pdf_url: pdfUrl
  });

  // Update signature log
  await updateSignatureLog(String(submissionId), {
    status: 'completed',
    completed_at: signedAt
  });

  console.log(`[H-02] Devis ${quote.quote_number} signe via DocuSeal — PDF: ${pdfUrl || 'N/A'}`);

  // H-02: Generate deposit invoice if deposit_amount > 0
  if (parseFloat(quote.deposit_amount) > 0) {
    try {
      const { createDepositInvoice } = await import('../commercial/deposit.service.js');
      const result = await createDepositInvoice(quote.id);
      console.log(`[H-02] Facture acompte generee: ${result.invoice?.invoice_number || 'OK'} (isNew: ${result.isNew})`);
    } catch (depErr) {
      console.error(`[H-02] Erreur generation facture acompte: ${depErr.message}`);
    }
  }

  // Trigger confirmation email (Phase E)
  try {
    await axios.post(`${WEBHOOK_BASE_URL}/api/email/quote-signed`, {
      quote_id: quote.id
    }, { headers: { 'Content-Type': 'application/json' } });
  } catch (emailErr) {
    console.error(`[H-02] Erreur email confirmation: ${emailErr.message}`);
  }

  // Log automation
  try {
    await directusApi.post('/items/automation_logs', {
      action: 'quote_signed_docuseal',
      entity_type: 'quotes',
      entity_id: quote.id,
      level: 'info'
    });
  } catch (logErr) {
    // non-critical
  }
}

/**
 * H-02: Handle form.viewed (local DocuSeal event)
 */
async function handleFormViewed(payload) {
  const submissionId = payload.data?.submission?.id;
  if (!submissionId) return;

  const quotesRes = await directusApi.get('/items/quotes', {
    params: {
      filter: { docuseal_submission_id: { _eq: submissionId } },
      fields: 'id,viewed_at',
      limit: 1
    }
  });

  const quote = quotesRes.data.data?.[0];
  if (quote && !quote.viewed_at) {
    await directusApi.patch(`/items/quotes/${quote.id}`, {
      viewed_at: new Date().toISOString()
    });
    console.log(`[H-02] Devis consulte via DocuSeal — submission #${submissionId}`);
  }
}

/**
 * Handle submission completed (cloud DocuSeal — backward compat)
 */
async function handleSubmissionCompleted(data) {
  const externalId = data.external_id;
  const [type, id] = externalId?.split('-') || [];

  if (type === 'quote') {
    // Update quote
    await directusApi.patch(`/items/quotes/${id}`, {
      status: 'signed',
      is_signed: true,
      signed_at: new Date().toISOString(),
      docuseal_signed_pdf_url: data.documents?.[0]?.url
    });

    // Update signature log
    await updateSignatureLog(data.id, {
      status: 'completed',
      completed_at: new Date().toISOString()
    });

    // H-02: Generate deposit invoice
    try {
      const quoteRes = await directusApi.get(`/items/quotes/${id}`, { params: { fields: 'deposit_amount' } });
      const quote = quoteRes.data.data;
      if (quote && parseFloat(quote.deposit_amount) > 0) {
        const { createDepositInvoice } = await import('../commercial/deposit.service.js');
        await createDepositInvoice(id);
        console.log(`[H-02] Deposit invoice triggered for quote ${id}`);
      }
    } catch (depErr) {
      console.error(`[H-02] Deposit invoice error: ${depErr.message}`);
    }

    console.log(`[H-02] Quote ${id} signed successfully`);
  } else if (type === 'cgv') {
    // Update CGV acceptance
    await directusApi.patch(`/items/cgv_acceptances/${id}`, {
      status: 'accepted',
      accepted_at: new Date().toISOString(),
      signed_document_url: data.documents?.[0]?.url
    });

    console.log(`[H-02] CGV acceptance ${id} completed`);
  }
}

/**
 * Handle submission expired
 */
async function handleSubmissionExpired(data) {
  const externalId = data.external_id;
  const [type, id] = externalId?.split('-') || [];

  if (type === 'quote') {
    await directusApi.patch(`/items/quotes/${id}`, {
      signature_status: 'expired'
    });
    await updateSignatureLog(data.id, { status: 'expired' });
  }
}

/**
 * Handle submission declined
 */
async function handleSubmissionDeclined(data) {
  const externalId = data.external_id;
  const [type, id] = externalId?.split('-') || [];

  if (type === 'quote') {
    await directusApi.patch(`/items/quotes/${id}`, {
      signature_status: 'declined',
      status: 'rejected'
    });
    await updateSignatureLog(data.id, {
      status: 'declined',
      decline_reason: data.decline_reason
    });
  }
}

/**
 * Handle signer signed
 */
async function handleSignerSigned(data) {
  console.log(`📝 Signer ${data.signer?.email} signed document`);
  // Can be used to update partial signature status
}

/**
 * Update signature log
 */
async function updateSignatureLog(providerReference, updates) {
  try {
    const logRes = await directusApi.get('/items/signature_logs', {
      params: {
        filter: { provider_reference: { _eq: providerReference } },
        limit: 1
      }
    });

    if (logRes.data.data.length > 0) {
      await directusApi.patch(`/items/signature_logs/${logRes.data.data[0].id}`, updates);
    }
  } catch (error) {
    console.error('Error updating signature log:', error.message);
  }
}

/**
 * H-01: Get or create HTML template in local DocuSeal
 */
async function getOrCreateHtmlTemplate() {
  if (cachedTemplateId) return cachedTemplateId;

  try {
    // Check existing templates
    const existing = await docusealApi.get('/api/templates');
    const templates = existing.data?.data || existing.data || [];

    if (Array.isArray(templates) && templates.length > 0) {
      cachedTemplateId = templates[0].id;
      return cachedTemplateId;
    }

    // Create HTML template for quotes
    const templateRes = await docusealApi.post('/api/templates/html', {
      name: 'Devis HYPERVISUAL Switzerland',
      html: `
        <h1 style="color:#2563eb;margin-bottom:8px">HYPERVISUAL Switzerland</h1>
        <p style="font-size:18px;font-weight:bold">Devis N\u00b0 {{quote_number}}</p>
        <table style="width:100%;border-collapse:collapse;margin:20px 0">
          <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;color:#6b7280">Montant total</td>
              <td style="padding:8px;border-bottom:1px solid #e5e7eb;font-weight:bold">{{total_amount}}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;color:#6b7280">Type de projet</td>
              <td style="padding:8px;border-bottom:1px solid #e5e7eb">{{project_type}}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;color:#6b7280">Valable jusqu'au</td>
              <td style="padding:8px;border-bottom:1px solid #e5e7eb">{{valid_until}}</td></tr>
        </table>
        <p style="margin-top:24px">En signant ce document, le client accepte les conditions generales de vente d'HYPERVISUAL Switzerland SA.</p>
        <br><br>
        <p style="font-weight:bold">Signature client :</p>
        {{sig_client}}
      `,
      fields: [
        { name: 'quote_number', type: 'text' },
        { name: 'total_amount', type: 'text' },
        { name: 'project_type', type: 'text' },
        { name: 'valid_until', type: 'text' },
        { name: 'sig_client', type: 'signature', role: 'Client' }
      ]
    });

    cachedTemplateId = templateRes.data?.id || templateRes.data;
    console.log(`[H-01] DocuSeal HTML template cree: #${cachedTemplateId}`);
    return cachedTemplateId;
  } catch (error) {
    console.error('[H-01] Erreur creation template DocuSeal:', error.message);
    // Fallback to env var
    return process.env.DOCUSEAL_TEMPLATE_QUOTE || 1;
  }
}

/**
 * Map DocuSeal status to internal status
 */
function mapDocuSealStatus(status) {
  const statusMap = {
    pending: 'pending',
    sent: 'pending',
    viewed: 'viewed',
    completed: 'completed',
    expired: 'expired',
    declined: 'declined'
  };
  return statusMap[status] || status;
}

/**
 * Cancel signature request
 */
export async function cancelSignatureRequest(submissionId) {
  try {
    await docusealApi.delete(`/submissions/${submissionId}`);
    await updateSignatureLog(submissionId, { status: 'cancelled' });
    return { success: true };
  } catch (error) {
    console.error('❌ DocuSeal cancelSignatureRequest error:', error.message);
    throw error;
  }
}

/**
 * Resend signature request
 */
export async function resendSignatureRequest(submissionId, email) {
  try {
    await docusealApi.post(`/submissions/${submissionId}/remind`, {
      email: email
    });
    return { success: true };
  } catch (error) {
    console.error('❌ DocuSeal resendSignatureRequest error:', error.message);
    throw error;
  }
}

/**
 * Get embed URL for iframe signing
 */
export async function getEmbedSigningUrl(submissionId, signerEmail) {
  try {
    const response = await docusealApi.get(`/submissions/${submissionId}`);
    const signer = response.data.signers?.find(s => s.email === signerEmail);

    if (!signer?.embed_url) {
      throw new Error('Signing URL not found');
    }

    return {
      embedUrl: signer.embed_url,
      expiresAt: signer.embed_url_expires_at
    };
  } catch (error) {
    console.error('❌ DocuSeal getEmbedSigningUrl error:', error.message);
    throw error;
  }
}

/**
 * H-02: Setup DocuSeal webhook (call once at startup)
 */
export async function setupDocuSealWebhook() {
  try {
    const webhookUrl = `${WEBHOOK_BASE_URL}/api/integrations/docuseal/webhook`;
    await docusealApi.post('/api/webhooks', {
      url: webhookUrl,
      events: ['form.completed', 'form.viewed']
    });
    console.log(`[H-02] DocuSeal webhook configure: ${webhookUrl}`);
  } catch (error) {
    // Non-fatal — webhook may already exist or DocuSeal not running
    console.warn(`[H-02] DocuSeal webhook setup: ${error.message}`);
  }
}

export default {
  createQuoteSignatureRequest,
  createCGVSignatureRequest,
  getSignatureStatus,
  handleWebhook,
  cancelSignatureRequest,
  resendSignatureRequest,
  getEmbedSigningUrl,
  setupDocuSealWebhook,
  SIGNATURE_LEVELS
};
