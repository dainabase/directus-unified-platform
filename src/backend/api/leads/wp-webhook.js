/**
 * F-01 : WordPress Fluent Form Pro → Lead Directus
 * Webhook receiver pour le formulaire ID 17
 * Declencheur : POST depuis Fluent Form Pro webhook integration
 * REQ-LEAD — capture automatique
 */

import crypto from 'crypto';
import { createOrUpdateLead } from './lead-creator.js';

export default function handler(directusGet, directusPost, directusPatch, logAutomation, hasSentRecently) {
  return async (req, res) => {
    try {
      console.log('[F-01 WP Webhook] Payload recu:', JSON.stringify(req.body).slice(0, 200));

      // Verification signature HMAC (optionnelle si WP_WEBHOOK_SECRET configure)
      const secret = process.env.WP_WEBHOOK_SECRET;
      if (secret) {
        const signature = req.headers['x-fluent-signature'] || req.headers['x-webhook-signature'];
        if (signature) {
          const computed = crypto.createHmac('sha256', secret)
            .update(JSON.stringify(req.body))
            .digest('hex');
          if (!crypto.timingSafeEqual(Buffer.from(signature, 'utf8'), Buffer.from(computed, 'utf8'))) {
            console.warn('[F-01] Signature HMAC invalide');
            return res.status(401).json({ error: 'Signature invalide' });
          }
        }
      }

      // Extraction des champs Fluent Form (mapping flexible)
      const payload = req.body;
      const fields = payload.data || payload.fields || payload;

      const email = fields.email || fields.email_address || '';
      if (!email) {
        return res.status(400).json({ error: 'Email requis' });
      }

      // Anti-doublon : verifier si email deja traite dans les 30 dernieres minutes
      const isDuplicate = await hasSentRecently('wp_form_17', email);
      if (isDuplicate) {
        console.log('[F-01] Doublon detecte, skip:', email);
        return res.json({ success: true, skipped: true, reason: 'Duplicate (30min window)' });
      }

      const phone = fields.phone || fields.telephone || fields.mobile || '';
      const companyName = fields.company || fields.entreprise || fields.societe || '';
      const budgetRaw = fields.budget || fields.budget_estimate || fields.budget_estime || 0;
      const budget = parseFloat(String(budgetRaw).replace(/[^0-9.]/g, '')) || 0;
      const eventDate = fields.event_date || fields.date_evenement || fields.date || '';
      const typeProjet = fields.type_projet || fields.type || '';

      // Qualification score (1-5)
      let score = 1;
      if (budget > 10000) score += 2;
      else if (budget >= 3000) score += 1;
      if (eventDate) {
        const daysUntil = (new Date(eventDate) - new Date()) / (1000 * 60 * 60 * 24);
        if (daysUntil > 0 && daysUntil <= 30) score += 1;
      }
      if (email && phone && companyName) score += 1;
      if (typeProjet && typeProjet !== 'inconnu') score += 1;
      score = Math.min(score, 5);

      // Fluent Form Pro envoie souvent les noms dans un objet "names"
      const names = fields.names || {};
      const leadData = {
        first_name: fields.first_name || names.first_name || fields.prenom || (fields.name ? fields.name.split(' ')[0] : ''),
        last_name: fields.last_name || names.last_name || fields.nom || (fields.name ? fields.name.split(' ').slice(1).join(' ') : ''),
        email,
        phone,
        company_name: companyName,
        estimated_value: budget || null,
        message: fields.message || fields.description || fields.besoin || '',
        source_channel: 'wordpress',
        source_detail: `Fluent Form #${payload.form_id || 17} — ${payload.form_title || 'Contact Form'}`,
        raw_data: payload,
        status: 'new',
        score
      };

      // Creer le lead
      const lead = await createOrUpdateLead(directusGet, directusPost, directusPatch, leadData, 'wp_form_17');

      // Create lead_activity
      try {
        await directusPost('/items/lead_activities', {
          lead: lead?.id || null,
          type: 'created',
          subject: 'Lead cree via Fluent Forms Pro',
          content: `Formulaire #${payload.form_id || 17} — Score: ${score}/5 — Budget: ${budget ? `CHF ${budget}` : 'N/A'}`,
          is_automated: true,
          metadata: JSON.stringify({ form_id: payload.form_id, score, budget, type_projet: typeProjet })
        });
      } catch (actErr) {
        console.error('[F-01] Error creating lead_activity:', actErr.message);
      }

      // Trigger email confirmation (best-effort)
      try {
        const fetch = (await import('node-fetch')).default;
        await fetch('http://localhost:3000/api/email/send-lead-confirmation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lead_id: lead?.id, email, first_name: leadData.first_name })
        }).catch(() => {});
      } catch { /* best-effort */ }

      // Log automation
      await logAutomation({
        rule_name: 'F-01-wp-webhook',
        entity_type: 'leads',
        entity_id: lead?.id || email,
        status: 'success',
        recipient_email: email,
        trigger_data: { form_id: payload.form_id, source: 'wordpress' }
      });

      res.json({ success: true, lead_id: lead?.id });
    } catch (error) {
      console.error('[F-01 WP Webhook] Erreur:', error.message);
      await logAutomation({
        rule_name: 'F-01-wp-webhook',
        entity_type: 'leads',
        entity_id: req.body?.data?.email || req.body?.email || 'unknown',
        status: 'failed',
        error_message: error.message
      });
      res.status(500).json({ error: 'Erreur traitement webhook', details: error.message });
    }
  };
}
