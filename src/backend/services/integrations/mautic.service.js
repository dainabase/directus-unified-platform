/**
 * Mautic Integration Service for Commercial Workflow
 *
 * Marketing automation for the commercial process:
 * - Quote sent notifications
 * - Follow-up campaigns
 * - Lead nurturing
 * - Payment reminders
 *
 * @date 15 Décembre 2025
 */

import axios from 'axios';

const MAUTIC_URL = process.env.MAUTIC_URL || 'http://localhost:8084';
const MAUTIC_USERNAME = process.env.MAUTIC_USERNAME || 'admin';
const MAUTIC_PASSWORD = process.env.MAUTIC_PASSWORD || 'mautic123';
const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN || 'hbQz-9935crJ2YkLul_zpQJDBw2M-y5v';

// Mautic API client with basic auth
const mauticApi = axios.create({
  baseURL: `${MAUTIC_URL}/api`,
  auth: {
    username: MAUTIC_USERNAME,
    password: MAUTIC_PASSWORD
  },
  headers: {
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

// Campaign IDs (to be configured per company)
const CAMPAIGNS = {
  quote_sent: process.env.MAUTIC_CAMPAIGN_QUOTE_SENT || 1,
  quote_followup: process.env.MAUTIC_CAMPAIGN_QUOTE_FOLLOWUP || 2,
  payment_reminder: process.env.MAUTIC_CAMPAIGN_PAYMENT_REMINDER || 3,
  welcome_new_client: process.env.MAUTIC_CAMPAIGN_WELCOME || 4,
  lead_nurturing: process.env.MAUTIC_CAMPAIGN_LEAD_NURTURING || 5
};

// Segment IDs
const SEGMENTS = {
  leads: process.env.MAUTIC_SEGMENT_LEADS || 1,
  prospects: process.env.MAUTIC_SEGMENT_PROSPECTS || 2,
  clients: process.env.MAUTIC_SEGMENT_CLIENTS || 3,
  pending_quotes: process.env.MAUTIC_SEGMENT_PENDING_QUOTES || 4,
  overdue_payments: process.env.MAUTIC_SEGMENT_OVERDUE_PAYMENTS || 5
};

/**
 * Sync or create contact in Mautic
 */
export async function syncContactToMautic(contactData) {
  try {
    const { email, first_name, last_name, phone, company_name, company_id, owner_company } = contactData;

    if (!email) {
      throw new Error('Email is required');
    }

    // Search for existing contact
    const searchRes = await mauticApi.get('/contacts', {
      params: { search: `email:${email}` }
    });

    const mauticContact = {
      firstname: first_name,
      lastname: last_name,
      email: email,
      phone: phone,
      company: company_name,
      tags: ['directus-sync', owner_company?.toLowerCase()].filter(Boolean),
      custom_fields: {
        directus_id: contactData.id,
        company_id: company_id,
        owner_company: owner_company
      }
    };

    let result;

    if (searchRes.data.total > 0) {
      // Update existing contact
      const existingId = Object.keys(searchRes.data.contacts)[0];
      result = await mauticApi.patch(`/contacts/${existingId}/edit`, mauticContact);
      console.log(`✅ Mautic contact updated: ${email}`);
    } else {
      // Create new contact
      result = await mauticApi.post('/contacts/new', mauticContact);
      console.log(`✅ Mautic contact created: ${email}`);
    }

    return {
      success: true,
      mauticId: result.data.contact?.id,
      email: email
    };
  } catch (error) {
    console.error('❌ Mautic syncContact error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Trigger quote sent campaign
 */
export async function triggerQuoteSentCampaign(quoteId) {
  try {
    // Get quote with contact
    const quoteRes = await directusApi.get(`/items/quotes/${quoteId}`, {
      params: {
        fields: '*,contact_id.*,owner_company_id.*'
      }
    });
    const quote = quoteRes.data.data;

    if (!quote?.contact_id?.email) {
      throw new Error('Contact email not found');
    }

    // Sync contact to Mautic
    const syncResult = await syncContactToMautic({
      ...quote.contact_id,
      owner_company: quote.owner_company_id?.code
    });

    const mauticContactId = syncResult.mauticId;

    // Add to "pending quotes" segment
    await mauticApi.post(`/segments/${SEGMENTS.pending_quotes}/contact/${mauticContactId}/add`);

    // Add to quote sent campaign
    await mauticApi.post(`/campaigns/${CAMPAIGNS.quote_sent}/contact/${mauticContactId}/add`);

    // Track event
    await trackEvent(mauticContactId, {
      name: 'quote_sent',
      properties: {
        quote_id: quoteId,
        quote_number: quote.quote_number,
        total: quote.total,
        currency: quote.currency,
        valid_until: quote.valid_until
      }
    });

    console.log(`✅ Quote sent campaign triggered for: ${quote.contact_id.email}`);

    return { success: true, mauticContactId };
  } catch (error) {
    console.error('❌ Mautic triggerQuoteSentCampaign error:', error.message);
    throw error;
  }
}

/**
 * Trigger quote follow-up (for unsigned quotes)
 */
export async function triggerQuoteFollowUp(quoteId) {
  try {
    const quoteRes = await directusApi.get(`/items/quotes/${quoteId}`, {
      params: {
        fields: '*,contact_id.*'
      }
    });
    const quote = quoteRes.data.data;

    if (!quote?.contact_id?.email) {
      return { success: false, error: 'Contact email not found' };
    }

    // Find Mautic contact
    const searchRes = await mauticApi.get('/contacts', {
      params: { search: `email:${quote.contact_id.email}` }
    });

    if (searchRes.data.total === 0) {
      return { success: false, error: 'Contact not in Mautic' };
    }

    const mauticContactId = Object.keys(searchRes.data.contacts)[0];

    // Track follow-up event
    await trackEvent(mauticContactId, {
      name: 'quote_followup',
      properties: {
        quote_id: quoteId,
        quote_number: quote.quote_number,
        days_since_sent: calculateDaysSince(quote.sent_at),
        viewed: !!quote.viewed_at
      }
    });

    // Add to follow-up campaign
    await mauticApi.post(`/campaigns/${CAMPAIGNS.quote_followup}/contact/${mauticContactId}/add`);

    return { success: true };
  } catch (error) {
    console.error('❌ Mautic triggerQuoteFollowUp error:', error.message);
    throw error;
  }
}

/**
 * Trigger payment reminder campaign
 */
export async function triggerPaymentReminder(invoiceId, reminderLevel) {
  try {
    const invoiceRes = await directusApi.get(`/items/client_invoices/${invoiceId}`, {
      params: {
        fields: '*,contact_id.*'
      }
    });
    const invoice = invoiceRes.data.data;

    if (!invoice?.contact_id?.email) {
      return { success: false, error: 'Contact email not found' };
    }

    // Find Mautic contact
    const searchRes = await mauticApi.get('/contacts', {
      params: { search: `email:${invoice.contact_id.email}` }
    });

    if (searchRes.data.total === 0) {
      // Create contact if not exists
      await syncContactToMautic(invoice.contact_id);
    }

    const mauticContactId = searchRes.data.total > 0
      ? Object.keys(searchRes.data.contacts)[0]
      : null;

    if (!mauticContactId) {
      return { success: false, error: 'Could not find/create contact' };
    }

    // Add to overdue payments segment
    await mauticApi.post(`/segments/${SEGMENTS.overdue_payments}/contact/${mauticContactId}/add`);

    // Track payment reminder event
    await trackEvent(mauticContactId, {
      name: 'payment_reminder',
      properties: {
        invoice_id: invoiceId,
        invoice_number: invoice.invoice_number,
        amount: invoice.amount,
        currency: invoice.currency,
        due_date: invoice.due_date,
        reminder_level: reminderLevel,
        days_overdue: calculateDaysSince(invoice.due_date)
      }
    });

    return { success: true, reminderLevel };
  } catch (error) {
    console.error('❌ Mautic triggerPaymentReminder error:', error.message);
    throw error;
  }
}

/**
 * Trigger welcome campaign for new client
 */
export async function triggerWelcomeCampaign(contactId) {
  try {
    const contactRes = await directusApi.get(`/items/people/${contactId}`);
    const contact = contactRes.data.data;

    if (!contact?.email) {
      return { success: false, error: 'Contact email not found' };
    }

    const syncResult = await syncContactToMautic(contact);
    const mauticContactId = syncResult.mauticId;

    // Add to clients segment
    await mauticApi.post(`/segments/${SEGMENTS.clients}/contact/${mauticContactId}/add`);

    // Remove from leads/prospects segments
    try {
      await mauticApi.post(`/segments/${SEGMENTS.leads}/contact/${mauticContactId}/remove`);
      await mauticApi.post(`/segments/${SEGMENTS.prospects}/contact/${mauticContactId}/remove`);
    } catch {
      // Ignore errors if contact wasn't in these segments
    }

    // Add to welcome campaign
    await mauticApi.post(`/campaigns/${CAMPAIGNS.welcome_new_client}/contact/${mauticContactId}/add`);

    // Track conversion event
    await trackEvent(mauticContactId, {
      name: 'client_converted',
      properties: {
        contact_id: contactId,
        conversion_date: new Date().toISOString()
      }
    });

    console.log(`✅ Welcome campaign triggered for: ${contact.email}`);

    return { success: true };
  } catch (error) {
    console.error('❌ Mautic triggerWelcomeCampaign error:', error.message);
    throw error;
  }
}

/**
 * Track payment received
 */
export async function trackPaymentReceived(invoiceId) {
  try {
    const invoiceRes = await directusApi.get(`/items/client_invoices/${invoiceId}`, {
      params: {
        fields: '*,contact_id.*'
      }
    });
    const invoice = invoiceRes.data.data;

    if (!invoice?.contact_id?.email) {
      return { success: false };
    }

    // Find Mautic contact
    const searchRes = await mauticApi.get('/contacts', {
      params: { search: `email:${invoice.contact_id.email}` }
    });

    if (searchRes.data.total === 0) {
      return { success: false };
    }

    const mauticContactId = Object.keys(searchRes.data.contacts)[0];

    // Remove from overdue payments segment
    try {
      await mauticApi.post(`/segments/${SEGMENTS.overdue_payments}/contact/${mauticContactId}/remove`);
      await mauticApi.post(`/segments/${SEGMENTS.pending_quotes}/contact/${mauticContactId}/remove`);
    } catch {
      // Ignore
    }

    // Track payment event
    await trackEvent(mauticContactId, {
      name: 'payment_received',
      properties: {
        invoice_id: invoiceId,
        invoice_number: invoice.invoice_number,
        amount: invoice.amount,
        currency: invoice.currency,
        is_deposit: invoice.is_deposit
      }
    });

    return { success: true };
  } catch (error) {
    console.error('❌ Mautic trackPaymentReceived error:', error.message);
    return { success: false };
  }
}

/**
 * Sync lead to Mautic
 */
export async function syncLeadToMautic(leadId) {
  try {
    const leadRes = await directusApi.get(`/items/leads/${leadId}`);
    const lead = leadRes.data.data;

    if (!lead?.email) {
      return { success: false, error: 'Lead email not found' };
    }

    const syncResult = await syncContactToMautic({
      id: lead.id,
      email: lead.email,
      first_name: lead.first_name,
      last_name: lead.last_name,
      phone: lead.phone,
      company_name: lead.company_name,
      owner_company: lead.owner_company
    });

    const mauticContactId = syncResult.mauticId;

    // Add to leads segment
    await mauticApi.post(`/segments/${SEGMENTS.leads}/contact/${mauticContactId}/add`);

    // Add lead score as points
    if (lead.score) {
      await mauticApi.post(`/contacts/${mauticContactId}/points/plus`, {
        points: lead.score
      });
    }

    // Add to nurturing campaign if score > 50
    if (lead.score >= 50) {
      await mauticApi.post(`/campaigns/${CAMPAIGNS.lead_nurturing}/contact/${mauticContactId}/add`);
    }

    // Track lead created event
    await trackEvent(mauticContactId, {
      name: 'lead_created',
      properties: {
        lead_id: leadId,
        source: lead.source,
        score: lead.score,
        priority: lead.priority
      }
    });

    console.log(`✅ Lead synced to Mautic: ${lead.email}`);

    return { success: true, mauticContactId };
  } catch (error) {
    console.error('❌ Mautic syncLeadToMautic error:', error.message);
    throw error;
  }
}

/**
 * Track custom event
 */
async function trackEvent(mauticContactId, event) {
  try {
    // Mautic doesn't have a direct event API, but we can use timeline notes
    await mauticApi.post(`/contacts/${mauticContactId}/notes`, {
      type: event.name,
      text: `Event: ${event.name}\n${JSON.stringify(event.properties, null, 2)}`,
      dateAdded: new Date().toISOString()
    });

    return { success: true };
  } catch (error) {
    console.error('Error tracking event:', error.message);
    return { success: false };
  }
}

/**
 * Get campaign statistics
 */
export async function getCampaignStats(campaignId) {
  try {
    const response = await mauticApi.get(`/campaigns/${campaignId}`);
    const campaign = response.data.campaign;

    return {
      id: campaign.id,
      name: campaign.name,
      isPublished: campaign.isPublished,
      contactCount: campaign.contactCount || 0,
      stats: campaign.stats || {}
    };
  } catch (error) {
    console.error('❌ Mautic getCampaignStats error:', error.message);
    return null;
  }
}

/**
 * Get segment statistics
 */
export async function getSegmentStats(segmentId) {
  try {
    const response = await mauticApi.get(`/segments/${segmentId}`);
    const segment = response.data.list;

    return {
      id: segment.id,
      name: segment.name,
      alias: segment.alias,
      contactCount: segment.contactCount || 0
    };
  } catch (error) {
    console.error('❌ Mautic getSegmentStats error:', error.message);
    return null;
  }
}

/**
 * Get marketing dashboard data
 */
export async function getMarketingDashboard() {
  try {
    const [contactsRes, campaignsRes, segmentsRes] = await Promise.all([
      mauticApi.get('/contacts?limit=1'),
      mauticApi.get('/campaigns?limit=100'),
      mauticApi.get('/segments?limit=100')
    ]);

    const campaigns = campaignsRes.data.campaigns || {};
    const segments = segmentsRes.data.lists || {};

    return {
      totalContacts: contactsRes.data.total || 0,
      campaigns: Object.values(campaigns).map(c => ({
        id: c.id,
        name: c.name,
        isPublished: c.isPublished,
        contactCount: c.contactCount || 0
      })),
      segments: Object.values(segments).map(s => ({
        id: s.id,
        name: s.name,
        contactCount: s.contactCount || 0
      })),
      workflow: {
        leads: SEGMENTS.leads,
        prospects: SEGMENTS.prospects,
        clients: SEGMENTS.clients,
        pending_quotes: SEGMENTS.pending_quotes,
        overdue_payments: SEGMENTS.overdue_payments
      }
    };
  } catch (error) {
    console.error('❌ Mautic getMarketingDashboard error:', error.message);
    return {
      totalContacts: 0,
      campaigns: [],
      segments: [],
      workflow: {}
    };
  }
}

/**
 * Calculate days since a date
 */
function calculateDaysSince(dateString) {
  if (!dateString) return 0;
  const date = new Date(dateString);
  const now = new Date();
  return Math.floor((now - date) / (1000 * 60 * 60 * 24));
}

export default {
  syncContactToMautic,
  triggerQuoteSentCampaign,
  triggerQuoteFollowUp,
  triggerPaymentReminder,
  triggerWelcomeCampaign,
  trackPaymentReceived,
  syncLeadToMautic,
  getCampaignStats,
  getSegmentStats,
  getMarketingDashboard,
  CAMPAIGNS,
  SEGMENTS
};
