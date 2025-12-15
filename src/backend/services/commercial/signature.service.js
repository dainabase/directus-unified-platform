/**
 * Signature Service - Intégration DocuSeal pour signatures électroniques
 *
 * Fonctionnalités:
 * - Création de demandes de signature
 * - Envoi via DocuSeal API
 * - Traitement webhooks signature
 * - Stockage logs légaux
 * - Support SES/AES/QES
 *
 * @date 15 Décembre 2025
 */

import axios from 'axios';

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN || 'hbQz-9935crJ2YkLul_zpQJDBw2M-y5v';

// DocuSeal Configuration
const DOCUSEAL_API_URL = process.env.DOCUSEAL_API_URL || 'https://api.docuseal.co';
const DOCUSEAL_API_KEY = process.env.DOCUSEAL_API_KEY || '';

const directusApi = axios.create({
  baseURL: DIRECTUS_URL,
  headers: {
    'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

const docusealApi = axios.create({
  baseURL: DOCUSEAL_API_URL,
  headers: {
    'X-Auth-Token': DOCUSEAL_API_KEY,
    'Content-Type': 'application/json'
  }
});

// Signature types
const SIGNATURE_TYPES = {
  SES: 'Simple Electronic Signature',
  AES: 'Advanced Electronic Signature',
  QES: 'Qualified Electronic Signature'
};

/**
 * Créer une demande de signature pour un devis
 */
export async function createSignatureRequest(quoteId, options = {}) {
  try {
    const {
      signature_type = 'SES',
      send_email = true,
      expiry_days = 7
    } = options;

    // Get quote with relations
    const quoteRes = await directusApi.get(`/items/quotes/${quoteId}`, {
      params: {
        fields: [
          '*',
          'contact_id.id',
          'contact_id.first_name',
          'contact_id.last_name',
          'contact_id.email',
          'owner_company_id.id',
          'owner_company_id.name',
          'owner_company_id.code',
          'cgv_version_id.id',
          'cgv_version_id.content_html'
        ].join(',')
      }
    });

    const quote = quoteRes.data.data;
    if (!quote) {
      throw new Error('Quote not found');
    }

    if (!quote.contact_id?.email) {
      throw new Error('Contact email is required for signature');
    }

    // Check if DocuSeal is configured
    if (!DOCUSEAL_API_KEY) {
      console.warn('⚠️ DocuSeal API key not configured - using mock signature');
      return createMockSignatureRequest(quote, signature_type);
    }

    // Create DocuSeal submission
    const submissionData = {
      template_id: await getTemplateIdForCompany(quote.owner_company_id?.id),
      send_email,
      submitters: [
        {
          name: `${quote.contact_id.first_name} ${quote.contact_id.last_name}`,
          email: quote.contact_id.email,
          role: 'Client',
          fields: [
            { name: 'quote_number', default_value: quote.quote_number },
            { name: 'total', default_value: formatCurrency(quote.total, quote.currency) },
            { name: 'company_name', default_value: quote.owner_company_id?.name || '' },
            { name: 'valid_until', default_value: quote.valid_until },
            { name: 'cgv_content', default_value: quote.cgv_version_id?.content_html || '' }
          ]
        }
      ],
      expire_at: new Date(Date.now() + expiry_days * 24 * 60 * 60 * 1000).toISOString()
    };

    const docusealRes = await docusealApi.post('/submissions', submissionData);
    const submission = docusealRes.data;

    // Update quote with DocuSeal info
    await directusApi.patch(`/items/quotes/${quoteId}`, {
      docuseal_submission_id: submission.id,
      signature_request_sent_at: new Date().toISOString()
    });

    console.log(`✅ Signature request created for quote ${quote.quote_number}`);

    return {
      success: true,
      submission_id: submission.id,
      signing_url: submission.submitters[0]?.embed_src,
      status: 'pending'
    };
  } catch (error) {
    console.error('Error creating signature request:', error.message);
    throw error;
  }
}

/**
 * Mock signature request pour dev/test
 */
async function createMockSignatureRequest(quote, signatureType) {
  const mockSubmissionId = `mock_${Date.now()}_${Math.random().toString(36).substring(7)}`;

  await directusApi.patch(`/items/quotes/${quote.id}`, {
    docuseal_submission_id: mockSubmissionId,
    signature_request_sent_at: new Date().toISOString()
  });

  return {
    success: true,
    submission_id: mockSubmissionId,
    signing_url: `http://localhost:5173/portal/sign/${quote.id}?mock=true`,
    status: 'pending',
    is_mock: true
  };
}

/**
 * Traiter un webhook DocuSeal
 */
export async function processWebhook(webhookData) {
  try {
    const { event_type, data } = webhookData;

    switch (event_type) {
      case 'submission.completed':
        return await handleSignatureCompleted(data);
      case 'submission.viewed':
        return await handleSubmissionViewed(data);
      case 'submission.expired':
        return await handleSubmissionExpired(data);
      default:
        console.log(`Unhandled DocuSeal event: ${event_type}`);
        return { success: true, handled: false };
    }
  } catch (error) {
    console.error('Error processing DocuSeal webhook:', error.message);
    throw error;
  }
}

/**
 * Gérer signature complétée
 */
async function handleSignatureCompleted(data) {
  try {
    const { submission_id, submitters, documents } = data;

    // Find quote by submission ID
    const quoteRes = await directusApi.get('/items/quotes', {
      params: {
        filter: { docuseal_submission_id: { _eq: submission_id } },
        limit: 1,
        fields: ['*', 'contact_id.id', 'contact_id.email']
      }
    });

    if (quoteRes.data.data.length === 0) {
      console.warn(`Quote not found for submission: ${submission_id}`);
      return { success: false, error: 'quote_not_found' };
    }

    const quote = quoteRes.data.data[0];
    const submitter = submitters?.[0];
    const signedDocument = documents?.[0];

    // Create signature log
    const signatureLog = {
      quote_id: quote.id,
      contact_id: quote.contact_id?.id,
      signer_name: submitter?.name,
      signer_email: submitter?.email,
      signer_role: 'client',
      docuseal_submission_id: submission_id,
      signed_at: new Date().toISOString(),
      ip_address: submitter?.ip,
      user_agent: submitter?.ua,
      signed_document_url: signedDocument?.url,
      signature_type: 'SES',
      is_valid: true
    };

    await directusApi.post('/items/signature_logs', signatureLog);

    // Update quote status
    await directusApi.patch(`/items/quotes/${quote.id}`, {
      status: 'signed',
      is_signed: true,
      signed_at: new Date().toISOString(),
      signed_document_url: signedDocument?.url
    });

    console.log(`✅ Signature completed for quote ${quote.quote_number}`);

    return {
      success: true,
      quote_id: quote.id,
      quote_number: quote.quote_number
    };
  } catch (error) {
    console.error('Error handling signature completed:', error.message);
    throw error;
  }
}

/**
 * Gérer document vu
 */
async function handleSubmissionViewed(data) {
  try {
    const { submission_id } = data;

    // Find and update quote
    const quoteRes = await directusApi.get('/items/quotes', {
      params: {
        filter: { docuseal_submission_id: { _eq: submission_id } },
        limit: 1
      }
    });

    if (quoteRes.data.data.length > 0) {
      const quote = quoteRes.data.data[0];

      if (quote.status === 'sent') {
        await directusApi.patch(`/items/quotes/${quote.id}`, {
          status: 'viewed',
          viewed_at: new Date().toISOString()
        });
        console.log(`✅ Quote ${quote.quote_number} marked as viewed`);
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error handling submission viewed:', error.message);
    return { success: false };
  }
}

/**
 * Gérer expiration
 */
async function handleSubmissionExpired(data) {
  try {
    const { submission_id } = data;

    const quoteRes = await directusApi.get('/items/quotes', {
      params: {
        filter: { docuseal_submission_id: { _eq: submission_id } },
        limit: 1
      }
    });

    if (quoteRes.data.data.length > 0) {
      const quote = quoteRes.data.data[0];

      if (['sent', 'viewed'].includes(quote.status)) {
        await directusApi.patch(`/items/quotes/${quote.id}`, {
          status: 'expired'
        });
        console.log(`⚠️ Quote ${quote.quote_number} expired`);
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error handling submission expired:', error.message);
    return { success: false };
  }
}

/**
 * Signer manuellement (pour portail client sans DocuSeal)
 */
export async function signQuoteManually(quoteId, signatureData) {
  try {
    const {
      signer_name,
      signer_email,
      ip_address,
      user_agent,
      signature_image_base64
    } = signatureData;

    // Get quote
    const quoteRes = await directusApi.get(`/items/quotes/${quoteId}`, {
      params: {
        fields: ['*', 'contact_id.id']
      }
    });

    const quote = quoteRes.data.data;
    if (!quote) {
      throw new Error('Quote not found');
    }

    if (quote.is_signed) {
      throw new Error('Quote already signed');
    }

    // Create signature log
    const signatureLog = {
      quote_id: quoteId,
      contact_id: quote.contact_id?.id,
      signer_name,
      signer_email,
      signer_role: 'client',
      signed_at: new Date().toISOString(),
      ip_address,
      user_agent,
      signature_type: 'SES',
      is_valid: true,
      signature_metadata: signature_image_base64 ? { image: 'stored' } : null
    };

    const logRes = await directusApi.post('/items/signature_logs', signatureLog);

    // Update quote
    await directusApi.patch(`/items/quotes/${quoteId}`, {
      status: 'signed',
      is_signed: true,
      signed_at: new Date().toISOString()
    });

    console.log(`✅ Quote ${quote.quote_number} signed manually`);

    return {
      success: true,
      signature_log_id: logRes.data.data.id
    };
  } catch (error) {
    console.error('Error signing quote manually:', error.message);
    throw error;
  }
}

/**
 * Récupérer les logs de signature d'un devis
 */
export async function getSignatureLogs(quoteId) {
  try {
    const res = await directusApi.get('/items/signature_logs', {
      params: {
        filter: { quote_id: { _eq: quoteId } },
        sort: ['-signed_at'],
        fields: ['*', 'contact_id.first_name', 'contact_id.last_name']
      }
    });

    return res.data.data;
  } catch (error) {
    console.error('Error getting signature logs:', error.message);
    return [];
  }
}

/**
 * Vérifier l'intégrité d'une signature
 */
export async function verifySignature(signatureLogId) {
  try {
    const res = await directusApi.get(`/items/signature_logs/${signatureLogId}`);
    const log = res.data.data;

    if (!log) {
      return { valid: false, error: 'signature_not_found' };
    }

    // Basic validity check
    const checks = {
      has_signer: !!log.signer_name && !!log.signer_email,
      has_timestamp: !!log.signed_at,
      has_ip: !!log.ip_address,
      is_marked_valid: log.is_valid === true
    };

    const allValid = Object.values(checks).every(v => v);

    return {
      valid: allValid,
      checks,
      signature_type: log.signature_type,
      signed_at: log.signed_at
    };
  } catch (error) {
    console.error('Error verifying signature:', error.message);
    return { valid: false, error: error.message };
  }
}

/**
 * Obtenir le template DocuSeal pour une entreprise
 */
async function getTemplateIdForCompany(ownerCompanyId) {
  // In production, this would fetch from company settings
  // For now, return default template or environment variable
  const templateIds = {
    'HYPERVISUAL': process.env.DOCUSEAL_TEMPLATE_HYPERVISUAL,
    'DAINAMICS': process.env.DOCUSEAL_TEMPLATE_DAINAMICS,
    'LEXAIA': process.env.DOCUSEAL_TEMPLATE_LEXAIA,
    'ENKI_REALTY': process.env.DOCUSEAL_TEMPLATE_ENKI,
    'TAKEOUT': process.env.DOCUSEAL_TEMPLATE_TAKEOUT
  };

  // Get company code
  try {
    const companyRes = await directusApi.get(`/items/owner_companies/${ownerCompanyId}`);
    const code = companyRes.data.data?.code;
    return templateIds[code] || process.env.DOCUSEAL_DEFAULT_TEMPLATE;
  } catch {
    return process.env.DOCUSEAL_DEFAULT_TEMPLATE;
  }
}

/**
 * Formatter devise
 */
function formatCurrency(amount, currency = 'CHF') {
  return new Intl.NumberFormat('fr-CH', {
    style: 'currency',
    currency
  }).format(amount);
}

export default {
  createSignatureRequest,
  processWebhook,
  signQuoteManually,
  getSignatureLogs,
  verifySignature,
  SIGNATURE_TYPES
};
