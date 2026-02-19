/**
 * E-02 — Email devis envoye au client avec PDF
 * Declencheur : items.update sur quotes, status → "sent"
 * REQ-FACT-004
 */

import { quoteSentTemplate } from './templates.js';

export default function handler(mautic, directusGet, directusPost, logAutomation, hasSentToday) {
  return async (req, res) => {
    try {
      const { quote_id } = req.body;

      if (!quote_id) {
        return res.status(400).json({ error: 'quote_id requis' });
      }

      // Verifier doublon
      const alreadySent = await hasSentToday('E-02-quote-sent', quote_id);
      if (alreadySent) {
        return res.json({ success: true, skipped: true, reason: 'Email deja envoye aujourd\'hui' });
      }

      // Recuperer le devis avec le contact
      const quote = await directusGet(`/items/quotes/${quote_id}`, {
        fields: '*,contact_id.id,contact_id.first_name,contact_id.last_name,contact_id.email'
      });

      if (!quote) {
        return res.status(404).json({ error: 'Devis introuvable' });
      }

      const contact = quote.contact_id;
      if (!contact || !contact.email) {
        await logAutomation({
          rule_name: 'E-02-quote-sent',
          entity_type: 'quotes',
          entity_id: quote_id,
          status: 'failed',
          error_message: 'Contact introuvable ou email manquant'
        });
        return res.status(404).json({ error: 'Contact du devis introuvable ou email manquant' });
      }

      // Generer le HTML
      const html = quoteSentTemplate(quote, contact);
      const subject = `Votre devis HYPERVISUAL Switzerland — ${quote.quote_number || quote_id}`;

      // Envoyer via Mautic
      const result = await mautic.sendEmailToAddress(contact.email, {
        first_name: contact.first_name,
        last_name: contact.last_name,
        tags: ['client', 'devis', 'phase-e']
      }, { name: `E-02-quote-${quote_id}`, subject, html });

      // Logger
      await logAutomation({
        rule_name: 'E-02-quote-sent',
        entity_type: 'quotes',
        entity_id: quote_id,
        status: 'success',
        recipient_email: contact.email,
        trigger_data: { quote_number: quote.quote_number }
      });

      res.json({ success: true, mautic: result });
    } catch (error) {
      console.error('[E-02] Erreur:', error.message);
      await logAutomation({
        rule_name: 'E-02-quote-sent',
        entity_type: 'quotes',
        entity_id: req.body.quote_id,
        status: 'failed',
        error_message: error.message
      });
      res.status(500).json({ error: 'Erreur envoi email', details: error.message });
    }
  };
}
