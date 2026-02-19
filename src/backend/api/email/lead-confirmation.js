/**
 * E-01 — Email confirmation lead
 * Declencheur : items.create sur leads (status = "new")
 * REQ-LEAD-007 — delai < 5 minutes
 */

import { leadConfirmationTemplate } from './templates.js';

export default function handler(mautic, directusGet, directusPost, logAutomation, hasSentToday) {
  return async (req, res) => {
    try {
      const { lead_id } = req.body;

      if (!lead_id) {
        return res.status(400).json({ error: 'lead_id requis' });
      }

      // Verifier doublon
      const alreadySent = await hasSentToday('E-01-lead-confirmation', lead_id);
      if (alreadySent) {
        return res.json({ success: true, skipped: true, reason: 'Email deja envoye aujourd\'hui' });
      }

      // Recuperer le lead
      const lead = await directusGet(`/items/leads/${lead_id}`);
      if (!lead || !lead.email) {
        await logAutomation({
          rule_name: 'E-01-lead-confirmation',
          entity_type: 'leads',
          entity_id: lead_id,
          status: 'failed',
          error_message: 'Lead introuvable ou email manquant'
        });
        return res.status(404).json({ error: 'Lead introuvable ou email manquant' });
      }

      // Generer le HTML
      const html = leadConfirmationTemplate(lead);
      const subject = 'Merci pour votre intérêt — HYPERVISUAL Switzerland';

      // Envoyer via Mautic
      const result = await mautic.sendEmailToAddress(lead.email, {
        first_name: lead.first_name,
        last_name: lead.last_name,
        company: lead.company_name,
        tags: ['lead', 'phase-e']
      }, { name: `E-01-lead-${lead_id}`, subject, html });

      // Logger
      await logAutomation({
        rule_name: 'E-01-lead-confirmation',
        entity_type: 'leads',
        entity_id: lead_id,
        status: 'success',
        recipient_email: lead.email,
        trigger_data: { lead_name: `${lead.first_name} ${lead.last_name}` }
      });

      res.json({ success: true, mautic: result });
    } catch (error) {
      console.error('[E-01] Erreur:', error.message);
      await logAutomation({
        rule_name: 'E-01-lead-confirmation',
        entity_type: 'leads',
        entity_id: req.body.lead_id,
        status: 'failed',
        error_message: error.message
      });
      res.status(500).json({ error: 'Erreur envoi email', details: error.message });
    }
  };
}
