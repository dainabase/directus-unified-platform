/**
 * F-03 : IMAP Email Monitor → Lead Directus
 * Polling info@hypervisual.ch toutes les 5 minutes
 * Extraction intelligente via OpenAI GPT-4o-mini
 * REQ-LEAD — capture automatique email
 */

import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import OpenAI from 'openai';
import { createOrUpdateLead } from './lead-creator.js';

const EXTRACTION_PROMPT = `Tu es un assistant qui extrait des informations de contact depuis des emails recus par HYPERVISUAL Switzerland (location/vente d'ecrans LED geants, totems, kiosques, mobilier LED).

Analyse cet email et determine s'il s'agit d'une demande commerciale potentielle.

Reponds UNIQUEMENT en JSON avec ce format exact :
{
  "is_lead": true/false,
  "confidence": 0-100,
  "first_name": "...",
  "last_name": "...",
  "email": "...",
  "phone": "...",
  "company_name": "...",
  "message": "resume concis en francais de la demande",
  "interest_type": "location|vente|information|autre",
  "urgency": "high|medium|low"
}

Si ce n'est pas une demande commerciale (spam, newsletter, facture fournisseur, etc.) : is_lead=false.`;

/**
 * Extraire les donnees lead d'un email via OpenAI
 */
async function extractLeadFromEmail(openai, subject, body, from) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: EXTRACTION_PROMPT },
        { role: 'user', content: `DE: ${from}\nSUJET: ${subject}\n\nCORPS:\n${body.slice(0, 3000)}` }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1
    });
    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('[F-03 IMAP] Erreur extraction LLM:', error.message);
    return null;
  }
}

/**
 * Traiter les emails non lus
 */
async function processNewEmails(directusGet, directusPost, directusPatch, logAutomation, hasSentRecently) {
  const imapConfig = {
    host: process.env.IMAP_HOST || 'mail.hypervisual.ch',
    port: parseInt(process.env.IMAP_PORT) || 993,
    secure: process.env.IMAP_TLS !== 'false',
    auth: {
      user: process.env.IMAP_USER || 'info@hypervisual.ch',
      pass: process.env.IMAP_PASSWORD
    },
    logger: false
  };

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const client = new ImapFlow(imapConfig);
  const results = { processed: 0, leads: 0, skipped: 0, errors: 0 };

  try {
    await client.connect();
    const lock = await client.getMailboxLock('INBOX');

    try {
      // Chercher emails non lus des 24 dernieres heures
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const messages = await client.search({ unseen: true, since });

      console.log(`[F-03 IMAP] ${messages.length} email(s) non lu(s) trouve(s)`);

      for (const uid of messages) {
        try {
          const message = await client.fetchOne(uid, { source: true });
          const parsed = await simpleParser(message.source);

          const from = parsed.from?.text || '';
          const subject = parsed.subject || '';
          const body = parsed.text || (parsed.html ? parsed.html.replace(/<[^>]+>/g, ' ') : '');
          const messageId = parsed.messageId || `email-${uid}`;

          // Anti-doublon : verifier Message-ID
          const isDuplicate = await hasSentRecently('F-03-imap', messageId);
          if (isDuplicate) {
            console.log(`[F-03 IMAP] Email deja traite: ${messageId}`);
            results.skipped++;
            continue;
          }

          // Extraction LLM
          const extracted = await extractLeadFromEmail(openai, subject, body, from);

          if (!extracted || !extracted.is_lead || extracted.confidence < 60) {
            console.log(`[F-03 IMAP] Non-lead (${extracted?.confidence || 0}%): ${subject}`);
            await logAutomation({
              rule_name: 'F-03-imap',
              entity_type: 'emails',
              entity_id: messageId,
              status: 'skipped',
              trigger_data: { subject, confidence: extracted?.confidence }
            });
            results.skipped++;
            continue;
          }

          console.log(`[F-03 IMAP] Lead detecte (${extracted.confidence}%): ${extracted.first_name} ${extracted.last_name}`);

          const leadData = {
            first_name: extracted.first_name || '',
            last_name: extracted.last_name || '',
            email: extracted.email || (from.match(/<(.+)>/) ? from.match(/<(.+)>/)[1] : from),
            phone: extracted.phone || '',
            company_name: extracted.company_name || '',
            message: extracted.message || subject,
            source_channel: 'email',
            source_detail: `Email: ${subject}`,
            openai_summary: JSON.stringify(extracted),
            raw_data: { subject, from, messageId },
            status: 'new'
          };

          const lead = await createOrUpdateLead(directusGet, directusPost, directusPatch, leadData, 'imap_info');

          await logAutomation({
            rule_name: 'F-03-imap',
            entity_type: 'leads',
            entity_id: messageId,
            status: 'success',
            trigger_data: { lead_id: lead?.id, confidence: extracted.confidence }
          });

          // Marquer comme lu
          await client.messageFlagsAdd(uid, ['\\Seen']);

          results.leads++;
          results.processed++;
        } catch (msgError) {
          console.error(`[F-03 IMAP] Erreur message ${uid}:`, msgError.message);
          results.errors++;
        }
      }
    } finally {
      lock.release();
    }

    await client.logout();
  } catch (error) {
    console.error('[F-03 IMAP] Erreur connexion:', error.message);
  }

  return results;
}

/**
 * Demarrer le polling IMAP toutes les 5 minutes
 */
function startImapMonitor(directusGet, directusPost, directusPatch, logAutomation, hasSentRecently) {
  if (!process.env.IMAP_PASSWORD) {
    console.warn('[F-03 IMAP] IMAP_PASSWORD non configure — monitor desactive');
    return null;
  }
  if (!process.env.OPENAI_API_KEY) {
    console.warn('[F-03 IMAP] OPENAI_API_KEY non configure — monitor desactive');
    return null;
  }

  console.log('[F-03 IMAP] Demarrage monitoring info@hypervisual.ch (polling 5 min)');

  // Premiere execution apres 10 secondes (laisser le serveur demarrer)
  setTimeout(() => {
    processNewEmails(directusGet, directusPost, directusPatch, logAutomation, hasSentRecently);
  }, 10000);

  // Puis toutes les 5 minutes
  const intervalId = setInterval(() => {
    processNewEmails(directusGet, directusPost, directusPatch, logAutomation, hasSentRecently);
  }, 5 * 60 * 1000);

  return intervalId;
}

export { startImapMonitor, processNewEmails };
