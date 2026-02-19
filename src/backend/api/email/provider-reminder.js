/**
 * E-06 — Rappel prestataire si pas de reponse sous 24h
 * Declencheur : CRON toutes les heures (Directus Flow schedule)
 * REQ-PREST-004
 *
 * Logique : proposals ou status = "pending"/"active" ET created_at < now() - 24h
 * Max 1 rappel par proposal (check automation_logs)
 */

import { providerReminderTemplate } from './templates.js';

export default function handler(mautic, directusGet, directusPost, logAutomation, hasSentToday) {
  return async (req, res) => {
    try {
      const now = new Date();
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      const results = { sent: 0, skipped: 0, errors: 0, details: [] };

      // Recuperer les proposals en attente depuis > 24h
      const proposals = await directusGet('/items/proposals', {
        filter: JSON.stringify({
          _and: [
            {
              _or: [
                { status: { _eq: 'pending' } },
                { status: { _eq: 'active' } }
              ]
            },
            { created_at: { _lt: twentyFourHoursAgo } },
            { submitted_at: { _null: true } }
          ]
        }),
        fields: '*,provider_id.id,provider_id.name,provider_id.email,project_id.id,project_id.name',
        limit: -1
      });

      if (!proposals || proposals.length === 0) {
        return res.json({ success: true, message: 'Aucune proposal en attente > 24h', results });
      }

      for (const proposal of proposals) {
        try {
          const provider = proposal.provider_id;
          if (!provider || !provider.email) {
            results.skipped++;
            continue;
          }

          // Max 1 rappel par proposal (jamais, pas juste aujourd'hui)
          const existingLog = await directusGet('/items/automation_logs', {
            filter: JSON.stringify({
              _and: [
                { rule_name: { _eq: 'E-06-provider-reminder' } },
                { entity_id: { _eq: String(proposal.id) } },
                { status: { _eq: 'success' } }
              ]
            }),
            limit: 1
          });

          if (existingLog && existingLog.length > 0) {
            results.skipped++;
            continue;
          }

          // Generer template
          const project = proposal.project_id;
          const html = providerReminderTemplate(proposal, provider, project);
          const subject = `Rappel : Demande de devis en attente — ${project?.name || proposal.name || 'Projet HYPERVISUAL'}`;

          // Envoyer via Mautic
          await mautic.sendEmailToAddress(provider.email, {
            first_name: provider.name,
            last_name: '',
            company: provider.name,
            tags: ['prestataire', 'rappel', 'phase-e']
          }, { name: `E-06-reminder-${proposal.id}`, subject, html });

          // Logger
          await logAutomation({
            rule_name: 'E-06-provider-reminder',
            entity_type: 'proposals',
            entity_id: proposal.id,
            status: 'success',
            recipient_email: provider.email,
            trigger_data: { proposal_name: proposal.name, provider_name: provider.name }
          });

          results.sent++;
          results.details.push({
            proposal: proposal.name || proposal.id,
            provider: provider.name,
            email: provider.email
          });
        } catch (err) {
          console.error(`[E-06] Erreur proposal ${proposal.id}:`, err.message);
          results.errors++;
          await logAutomation({
            rule_name: 'E-06-provider-reminder',
            entity_type: 'proposals',
            entity_id: proposal.id,
            status: 'failed',
            error_message: err.message
          });
        }
      }

      res.json({ success: true, results });
    } catch (error) {
      console.error('[E-06] Erreur globale:', error.message);
      res.status(500).json({ error: 'Erreur rappels prestataires', details: error.message });
    }
  };
}
