/**
 * E-03 — Email accuse de reception paiement + activation projet
 * Declencheur : items.update sur payments, status → "completed"
 * REQ-FACT-006
 */

import { paymentConfirmedTemplate } from './templates.js';

export default function handler(mautic, directusGet, directusPost, logAutomation, hasSentToday) {
  return async (req, res) => {
    try {
      const { payment_id } = req.body;

      if (!payment_id) {
        return res.status(400).json({ error: 'payment_id requis' });
      }

      // Verifier doublon
      const alreadySent = await hasSentToday('E-03-payment-confirmed', payment_id);
      if (alreadySent) {
        return res.json({ success: true, skipped: true, reason: 'Email deja envoye aujourd\'hui' });
      }

      // Chaine : payment → invoice → contact
      const payment = await directusGet(`/items/payments/${payment_id}`);
      if (!payment || !payment.invoice_id) {
        await logAutomation({
          rule_name: 'E-03-payment-confirmed',
          entity_type: 'payments',
          entity_id: payment_id,
          status: 'failed',
          error_message: 'Paiement introuvable ou invoice_id manquant'
        });
        return res.status(404).json({ error: 'Paiement introuvable ou pas de facture associee' });
      }

      const invoice = await directusGet(`/items/client_invoices/${payment.invoice_id}`, {
        fields: '*,contact_id.id,contact_id.first_name,contact_id.last_name,contact_id.email'
      });

      if (!invoice) {
        return res.status(404).json({ error: 'Facture introuvable' });
      }

      const contact = invoice.contact_id;
      if (!contact || !contact.email) {
        await logAutomation({
          rule_name: 'E-03-payment-confirmed',
          entity_type: 'payments',
          entity_id: payment_id,
          status: 'failed',
          error_message: 'Contact facture introuvable ou email manquant'
        });
        return res.status(404).json({ error: 'Contact de la facture introuvable' });
      }

      // Generer le HTML
      const html = paymentConfirmedTemplate(payment, invoice, contact);
      const subject = 'Paiement reçu — Votre projet est activé';

      // Envoyer via Mautic
      const result = await mautic.sendEmailToAddress(contact.email, {
        first_name: contact.first_name,
        last_name: contact.last_name,
        tags: ['client', 'paiement', 'phase-e']
      }, { name: `E-03-payment-${payment_id}`, subject, html });

      // Logger
      await logAutomation({
        rule_name: 'E-03-payment-confirmed',
        entity_type: 'payments',
        entity_id: payment_id,
        status: 'success',
        recipient_email: contact.email,
        trigger_data: { invoice_number: invoice.invoice_number, amount: payment.amount }
      });

      res.json({ success: true, mautic: result });
    } catch (error) {
      console.error('[E-03] Erreur:', error.message);
      await logAutomation({
        rule_name: 'E-03-payment-confirmed',
        entity_type: 'payments',
        entity_id: req.body.payment_id,
        status: 'failed',
        error_message: error.message
      });
      res.status(500).json({ error: 'Erreur envoi email', details: error.message });
    }
  };
}
