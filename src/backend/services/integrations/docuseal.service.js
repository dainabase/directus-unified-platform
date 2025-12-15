/**
 * DocuSeal Integration Service
 *
 * Electronic signature integration for quotes and contracts
 * Supports SES, AES, and QES signature levels
 *
 * @date 15 Décembre 2025
 */

import axios from 'axios';
import crypto from 'crypto';

const DOCUSEAL_API_URL = process.env.DOCUSEAL_API_URL || 'https://api.docuseal.co';
const DOCUSEAL_API_KEY = process.env.DOCUSEAL_API_KEY || '';
const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN || 'hbQz-9935crJ2YkLul_zpQJDBw2M-y5v';
const WEBHOOK_BASE_URL = process.env.WEBHOOK_BASE_URL || 'http://localhost:3000';

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
 */
export async function createQuoteSignatureRequest(quoteId, options = {}) {
  try {
    // Get quote data
    const quoteRes = await directusApi.get(`/items/quotes/${quoteId}`, {
      params: {
        fields: '*,contact_id.*,owner_company_id.*,quote_items.*'
      }
    });
    const quote = quoteRes.data.data;

    if (!quote) {
      throw new Error('Quote not found');
    }

    if (!quote.contact_id?.email) {
      throw new Error('Contact email is required for signature');
    }

    // Generate PDF or use existing
    const pdfUrl = quote.pdf_url || await generateQuotePDF(quote);

    // Prepare signers
    const signers = [
      {
        name: `${quote.contact_id.first_name} ${quote.contact_id.last_name}`,
        email: quote.contact_id.email,
        role: 'Client'
      }
    ];

    // Add company signatory if required
    if (options.requireCompanySignature) {
      signers.push({
        name: quote.owner_company_id?.legal_representative || 'Représentant légal',
        email: quote.owner_company_id?.email || 'admin@company.com',
        role: 'Company Representative'
      });
    }

    // Create DocuSeal submission
    const submission = await docusealApi.post('/submissions', {
      template_id: options.templateId || getTemplateIdForType('quote'),
      send_email: true,
      signers: signers.map((signer, idx) => ({
        ...signer,
        fields: [
          {
            name: 'signature',
            type: 'signature',
            required: true
          },
          {
            name: 'date',
            type: 'date',
            default_value: new Date().toISOString().split('T')[0]
          }
        ]
      })),
      external_id: `quote-${quoteId}`,
      metadata: {
        quote_id: quoteId,
        quote_number: quote.quote_number,
        owner_company: quote.owner_company_id?.code,
        type: 'quote',
        amount: quote.total,
        currency: quote.currency
      },
      webhook_url: `${WEBHOOK_BASE_URL}/api/commercial/signatures/webhook/docuseal`,
      documents: [
        {
          name: `Devis_${quote.quote_number}.pdf`,
          url: pdfUrl
        }
      ]
    });

    // Log signature request in Directus
    await directusApi.post('/items/signature_logs', {
      quote_id: quoteId,
      provider: 'docuseal',
      provider_reference: submission.data.id,
      status: 'pending',
      signature_level: options.signatureLevel || 'SES',
      signers: JSON.stringify(signers),
      ip_address: options.clientIP,
      user_agent: options.userAgent
    });

    // Update quote
    await directusApi.patch(`/items/quotes/${quoteId}`, {
      signature_status: 'pending',
      signature_request_id: submission.data.id,
      signature_request_date: new Date().toISOString()
    });

    return {
      success: true,
      submissionId: submission.data.id,
      signingUrls: submission.data.signers?.map(s => ({
        email: s.email,
        url: s.embed_url
      })),
      message: 'Signature request created successfully'
    };
  } catch (error) {
    console.error('❌ DocuSeal createQuoteSignatureRequest error:', error.message);
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
 */
export async function handleWebhook(payload, signature) {
  try {
    // Verify webhook signature
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
    console.log(`📨 DocuSeal webhook: ${event_type}`);

    switch (event_type) {
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
        console.log(`   ⚠️ Unhandled event type: ${event_type}`);
    }

    return { success: true };
  } catch (error) {
    console.error('❌ DocuSeal webhook error:', error.message);
    throw error;
  }
}

/**
 * Handle submission completed
 */
async function handleSubmissionCompleted(data) {
  const externalId = data.external_id;
  const [type, id] = externalId?.split('-') || [];

  if (type === 'quote') {
    // Update quote
    await directusApi.patch(`/items/quotes/${id}`, {
      status: 'signed',
      signature_status: 'completed',
      signed_at: new Date().toISOString(),
      signed_document_url: data.documents?.[0]?.url
    });

    // Update signature log
    await updateSignatureLog(data.id, {
      status: 'completed',
      completed_at: new Date().toISOString(),
      signed_document_url: data.documents?.[0]?.url
    });

    console.log(`✅ Quote ${id} signed successfully`);
  } else if (type === 'cgv') {
    // Update CGV acceptance
    await directusApi.patch(`/items/cgv_acceptances/${id}`, {
      status: 'accepted',
      accepted_at: new Date().toISOString(),
      signed_document_url: data.documents?.[0]?.url
    });

    console.log(`✅ CGV acceptance ${id} completed`);
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
 * Get template ID for document type
 */
function getTemplateIdForType(type) {
  const templates = {
    quote: process.env.DOCUSEAL_TEMPLATE_QUOTE || 'template_quote',
    cgv: process.env.DOCUSEAL_TEMPLATE_CGV || 'template_cgv',
    contract: process.env.DOCUSEAL_TEMPLATE_CONTRACT || 'template_contract'
  };
  return templates[type] || templates.quote;
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
 * Generate quote PDF (placeholder)
 */
async function generateQuotePDF(quote) {
  // In production, this would generate or retrieve the PDF URL
  // For now, return a placeholder
  return `${DIRECTUS_URL}/assets/${quote.id}/quote.pdf`;
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

export default {
  createQuoteSignatureRequest,
  createCGVSignatureRequest,
  getSignatureStatus,
  handleWebhook,
  cancelSignatureRequest,
  resendSignatureRequest,
  getEmbedSigningUrl,
  SIGNATURE_LEVELS
};
