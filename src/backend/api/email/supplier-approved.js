/**
 * E-05 — Notification prestataire approbation facture + date paiement
 * Declencheur : items.update sur supplier_invoices, status → "approved"
 * REQ-APPRO-005
 */

import { supplierInvoiceApprovedTemplate } from './templates.js';

export default function handler(mautic, directusGet, directusPost, logAutomation, hasSentToday) {
  return async (req, res) => {
    try {
      const { invoice_id } = req.body;

      if (!invoice_id) {
        return res.status(400).json({ error: 'invoice_id requis' });
      }

      // Verifier doublon
      const alreadySent = await hasSentToday('E-05-supplier-approved', invoice_id);
      if (alreadySent) {
        return res.json({ success: true, skipped: true, reason: 'Email deja envoye aujourd\'hui' });
      }

      // Recuperer la facture fournisseur avec le provider
      const invoice = await directusGet(`/items/supplier_invoices/${invoice_id}`, {
        fields: '*,provider_id.id,provider_id.name,provider_id.email'
      });

      if (!invoice) {
        return res.status(404).json({ error: 'Facture fournisseur introuvable' });
      }

      const provider = invoice.provider_id;
      if (!provider || !provider.email) {
        await logAutomation({
          rule_name: 'E-05-supplier-approved',
          entity_type: 'supplier_invoices',
          entity_id: invoice_id,
          status: 'failed',
          error_message: 'Prestataire introuvable ou email manquant'
        });
        return res.status(404).json({ error: 'Prestataire introuvable ou email manquant' });
      }

      // Generer le HTML
      const html = supplierInvoiceApprovedTemplate(invoice, provider);
      const subject = `Votre facture a été approuvée — Paiement prévu`;

      // Envoyer via Mautic
      const result = await mautic.sendEmailToAddress(provider.email, {
        first_name: provider.name,
        last_name: '',
        company: provider.name,
        tags: ['prestataire', 'facture-approuvee', 'phase-e']
      }, { name: `E-05-supplier-${invoice_id}`, subject, html });

      // Logger
      await logAutomation({
        rule_name: 'E-05-supplier-approved',
        entity_type: 'supplier_invoices',
        entity_id: invoice_id,
        status: 'success',
        recipient_email: provider.email,
        trigger_data: { invoice_number: invoice.invoice_number, amount: invoice.total_ttc || invoice.amount }
      });

      res.json({ success: true, mautic: result });
    } catch (error) {
      console.error('[E-05] Erreur:', error.message);
      await logAutomation({
        rule_name: 'E-05-supplier-approved',
        entity_type: 'supplier_invoices',
        entity_id: req.body.invoice_id,
        status: 'failed',
        error_message: error.message
      });
      res.status(500).json({ error: 'Erreur envoi email', details: error.message });
    }
  };
}
