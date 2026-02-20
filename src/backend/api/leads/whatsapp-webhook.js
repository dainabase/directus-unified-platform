/**
 * F-02 : WhatsApp Business API → Lead Directus
 * GET  /whatsapp-webhook — Meta webhook verification
 * POST /whatsapp-webhook — Message reception + LLM extraction
 *
 * Requires: WHATSAPP_VERIFY_TOKEN, WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID
 * LLM: ANTHROPIC_API_KEY (primary) or OPENAI_API_KEY (fallback)
 *
 * REQ-LEAD-002 : Lead depuis WhatsApp avec resume LLM
 */

import { createOrUpdateLead } from './lead-creator.js';
import { extractLeadFromWhatsApp } from './llm-lead-extractor.js';

/**
 * Factory handler — receives injected Directus helpers from index.js
 */
export default function whatsappWebhookHandler(directusGet, directusPost, directusPatch, logAutomation, hasSentRecently) {

  /**
   * GET — Meta webhook verification (hub.mode=subscribe)
   */
  async function verify(req, res) {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;
    if (!verifyToken) {
      console.warn('[F-02 WhatsApp] WHATSAPP_VERIFY_TOKEN not configured');
      return res.sendStatus(403);
    }

    if (mode === 'subscribe' && token === verifyToken) {
      console.log('[F-02 WhatsApp] Webhook verified successfully');
      return res.status(200).send(challenge);
    }

    console.warn('[F-02 WhatsApp] Webhook verification failed');
    return res.sendStatus(403);
  }

  /**
   * POST — Receive WhatsApp messages from Meta API
   */
  async function receive(req, res) {
    try {
      // Meta sends 200 immediately to acknowledge receipt
      res.sendStatus(200);

      const body = req.body;

      // Validate Meta webhook structure
      if (!body?.object || body.object !== 'whatsapp_business_account') {
        console.log('[F-02 WhatsApp] Non-WhatsApp payload, ignoring');
        return;
      }

      const entries = body.entry || [];

      for (const entry of entries) {
        const changes = entry.changes || [];

        for (const change of changes) {
          if (change.field !== 'messages') continue;

          const value = change.value || {};
          const messages = value.messages || [];
          const contacts = value.contacts || [];

          for (const msg of messages) {
            await processMessage(msg, contacts, directusGet, directusPost, directusPatch, logAutomation, hasSentRecently);
          }
        }
      }
    } catch (error) {
      console.error('[F-02 WhatsApp] Error processing webhook:', error.message);
    }
  }

  return { verify, receive };
}

/**
 * Process a single WhatsApp message
 */
async function processMessage(msg, contacts, directusGet, directusPost, directusPatch, logAutomation, hasSentRecently) {
  const phone = msg.from;
  const messageId = msg.id;
  const timestamp = msg.timestamp;

  // Only process text messages for now
  const textBody = msg.text?.body || msg.button?.text || '';
  if (!textBody) {
    console.log(`[F-02 WhatsApp] Non-text message from ${phone}, type: ${msg.type}`);
    return;
  }

  console.log(`[F-02 WhatsApp] Message from ${phone}: "${textBody.slice(0, 100)}..."`);

  // Anti-doublon: check if this message was already processed
  const isDuplicate = await hasSentRecently('F-02-whatsapp', messageId);
  if (isDuplicate) {
    console.log(`[F-02 WhatsApp] Duplicate message ${messageId}, skipping`);
    return;
  }

  // Get contact name from Meta payload
  const contact = contacts?.find(c => c.wa_id === phone);
  const contactName = contact?.profile?.name || '';

  // Store raw message in whatsapp_messages
  let storedMessage = null;
  try {
    storedMessage = await directusPost('/items/whatsapp_messages', {
      phone: formatPhone(phone),
      direction: 'inbound',
      message_type: msg.type || 'text',
      content: textBody,
      external_id: messageId,
      status: 'received',
      metadata: JSON.stringify({ timestamp, contact_name: contactName }),
      company: 'HYPERVISUAL'
    });
  } catch (err) {
    console.error('[F-02 WhatsApp] Error storing message:', err.message);
  }

  // LLM extraction
  const extracted = await extractLeadFromWhatsApp(textBody, formatPhone(phone));

  if (!extracted) {
    console.log(`[F-02 WhatsApp] LLM extraction failed for ${phone}`);
    await logAutomation({
      rule_name: 'F-02-whatsapp',
      entity_type: 'whatsapp_messages',
      entity_id: messageId,
      status: 'error',
      error_message: 'LLM extraction returned null'
    });
    return;
  }

  // Create or update lead
  const leadData = {
    first_name: extracted.first_name || (contactName ? contactName.split(' ')[0] : ''),
    last_name: extracted.last_name || (contactName ? contactName.split(' ').slice(1).join(' ') : ''),
    email: extracted.email || '',
    phone: formatPhone(phone),
    company_name: extracted.company_name || '',
    message: extracted.notes || textBody,
    source_channel: 'whatsapp',
    source_detail: `WhatsApp: ${textBody.slice(0, 100)}`,
    openai_summary: JSON.stringify(extracted),
    raw_data: { message_id: messageId, text: textBody, contact_name: contactName },
    status: 'new',
    score: extracted.score || null,
    estimated_value: extracted.budget_estimate || null
  };

  const lead = await createOrUpdateLead(directusGet, directusPost, directusPatch, leadData, 'whatsapp_business');

  // Create lead_activity
  try {
    await directusPost('/items/lead_activities', {
      lead: lead?.id || null,
      type: 'whatsapp',
      subject: `Message WhatsApp recu de ${formatPhone(phone)}`,
      content: textBody.slice(0, 1000),
      is_automated: true,
      metadata: JSON.stringify({
        message_id: messageId,
        confidence: extracted.confidence,
        score: extracted.score,
        langue: extracted.langue_detectee
      })
    });
  } catch (err) {
    console.error('[F-02 WhatsApp] Error creating lead_activity:', err.message);
  }

  // Mark whatsapp_message as processed
  if (storedMessage?.id) {
    try {
      await directusPatch(`/items/whatsapp_messages/${storedMessage.id}`, {
        status: 'processed',
        lead: lead?.id || null
      });
    } catch (err) {
      console.error('[F-02 WhatsApp] Error updating message status:', err.message);
    }
  }

  // Log automation
  await logAutomation({
    rule_name: 'F-02-whatsapp',
    entity_type: 'leads',
    entity_id: messageId,
    status: 'success',
    trigger_data: {
      lead_id: lead?.id,
      phone: formatPhone(phone),
      confidence: extracted.confidence,
      score: extracted.score
    }
  });

  // Trigger email confirmation if email extracted
  if (extracted.email) {
    try {
      const { default: fetch } = await import('node-fetch');
      await fetch(`http://localhost:3000/api/email/send-lead-confirmation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: lead?.id,
          email: extracted.email,
          first_name: leadData.first_name
        })
      }).catch(() => {});
    } catch {
      // Email confirmation is best-effort
    }
  }

  console.log(`[F-02 WhatsApp] Lead created/updated: ${lead?.id} from ${formatPhone(phone)} (score: ${extracted.score || 'N/A'})`);
}

/**
 * Format phone number to international format
 */
function formatPhone(phone) {
  if (!phone) return '';
  // WhatsApp sends numbers without +, add it
  if (!phone.startsWith('+') && phone.length > 8) {
    return `+${phone}`;
  }
  return phone;
}
