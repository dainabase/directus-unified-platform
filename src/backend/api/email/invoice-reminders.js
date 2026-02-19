/**
 * E-04 — Rappels automatiques factures impayees
 * Declencheur : CRON quotidien 09h00 (Directus Flow schedule)
 * REQ-FACT-010 — Procedure recouvrement suisse SchKG/LP
 *
 * Logique :
 * - J+7 : rappel courtois
 * - J+14 : rappel ferme (mention SchKG/LP)
 * - J+30 : mise en demeure (SchKG Art. 67)
 */

import { invoiceReminderTemplate, formatCHF } from './templates.js';

export default function handler(mautic, directusGet, directusPost, logAutomation, hasSentToday) {
  return async (req, res) => {
    try {
      const now = new Date();
      const results = { sent: 0, skipped: 0, errors: 0, details: [] };

      // Recuperer les factures en statut "sent" dont la due_date est depassee
      // Si pas de due_date, fallback = date_created + 30 jours
      const invoices = await directusGet('/items/client_invoices', {
        filter: JSON.stringify({
          _and: [
            { status: { _eq: 'sent' } }
          ]
        }),
        fields: '*,contact_id.id,contact_id.first_name,contact_id.last_name,contact_id.email',
        limit: -1
      });

      if (!invoices || invoices.length === 0) {
        return res.json({ success: true, message: 'Aucune facture impayee', results });
      }

      for (const invoice of invoices) {
        try {
          // Calculer la due_date effective
          const dueDate = invoice.due_date
            ? new Date(invoice.due_date)
            : new Date(new Date(invoice.date_created).getTime() + 30 * 24 * 60 * 60 * 1000);

          const daysOverdue = Math.floor((now - dueDate) / (1000 * 60 * 60 * 24));

          // Pas encore en retard
          if (daysOverdue < 7) continue;

          // Determiner le niveau
          let level;
          if (daysOverdue >= 30) level = '30';
          else if (daysOverdue >= 14) level = '14';
          else level = '7';

          const contact = invoice.contact_id;
          if (!contact || !contact.email) {
            results.skipped++;
            continue;
          }

          // Verifier doublon (meme facture + meme level + meme jour)
          const alreadySent = await hasSentToday('E-04-invoice-reminder', invoice.id, level);
          if (alreadySent) {
            results.skipped++;
            continue;
          }

          // Verifier qu'on n'a pas deja envoye un niveau superieur
          // (si level=14 et on a deja envoye 30, skip)
          // On envoie uniquement le niveau correspondant au retard actuel
          // et on verifie qu'il n'a pas deja ete envoye (pas seulement aujourd'hui)
          const existingLog = await directusGet('/items/automation_logs', {
            filter: JSON.stringify({
              _and: [
                { rule_name: { _eq: 'E-04-invoice-reminder' } },
                { entity_id: { _eq: String(invoice.id) } },
                { level: { _eq: level } },
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
          const { subject, html } = invoiceReminderTemplate(invoice, contact, level);

          // Envoyer via Mautic
          await mautic.sendEmailToAddress(contact.email, {
            first_name: contact.first_name,
            last_name: contact.last_name,
            tags: ['client', `rappel-${level}j`, 'phase-e']
          }, { name: `E-04-reminder-${level}j-${invoice.id}`, subject, html });

          // Logger
          await logAutomation({
            rule_name: 'E-04-invoice-reminder',
            entity_type: 'client_invoices',
            entity_id: invoice.id,
            status: 'success',
            recipient_email: contact.email,
            level,
            trigger_data: { invoice_number: invoice.invoice_number, days_overdue: daysOverdue, amount: invoice.amount }
          });

          results.sent++;
          results.details.push({
            invoice: invoice.invoice_number,
            level,
            days_overdue: daysOverdue,
            email: contact.email
          });
        } catch (err) {
          console.error(`[E-04] Erreur facture ${invoice.invoice_number}:`, err.message);
          results.errors++;
          await logAutomation({
            rule_name: 'E-04-invoice-reminder',
            entity_type: 'client_invoices',
            entity_id: invoice.id,
            status: 'failed',
            error_message: err.message,
            level: '0'
          });
        }
      }

      res.json({ success: true, results });
    } catch (error) {
      console.error('[E-04] Erreur globale:', error.message);
      res.status(500).json({ error: 'Erreur rappels factures', details: error.message });
    }
  };
}
