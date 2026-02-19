/**
 * Email Templates — HYPERVISUAL Switzerland
 * Helpers HTML pour emails transactionnels fr-CH
 * Phase E — Email Automation
 */

/**
 * Formater un montant en CHF suisse (ex: CHF 1'234.50)
 */
export function formatCHF(amount) {
  const num = parseFloat(amount) || 0;
  const parts = num.toFixed(2).split('.');
  const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, "'");
  return `CHF ${intPart}.${parts[1]}`;
}

/**
 * Formater une date en DD.MM.YYYY (fr-CH)
 */
export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

/**
 * Wrapper HTML email HYPERVISUAL
 */
export function wrapEmail(contentHtml) {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; background-color: #f9fafb;">
  <div style="background: #1e40af; padding: 20px; text-align: center;">
    <span style="color: #ffffff; font-size: 22px; font-weight: bold; letter-spacing: 1px;">HYPERVISUAL</span>
    <span style="color: #93c5fd; font-size: 12px; display: block;">Switzerland</span>
  </div>
  <div style="padding: 30px; background: #ffffff;">
    ${contentHtml}
  </div>
  <div style="background: #f3f4f6; padding: 20px; font-size: 12px; color: #666; text-align: center;">
    HYPERVISUAL Switzerland &middot; Fribourg, Suisse<br>
    <a href="mailto:info@hypervisual.ch" style="color: #1e40af;">info@hypervisual.ch</a><br>
    <a href="{unsubscribe_url}" style="color: #999; font-size: 11px;">Se d&eacute;sabonner</a>
  </div>
</body>
</html>`;
}

/**
 * Template E-01 — Confirmation lead
 */
export function leadConfirmationTemplate(lead) {
  const content = `
    <h2 style="color: #1e40af; margin-top: 0;">Merci pour votre int&eacute;r&ecirc;t</h2>
    <p>Bonjour ${lead.first_name || 'Madame, Monsieur'},</p>
    <p>Nous avons bien re&ccedil;u votre demande${lead.company_name ? ` pour <strong>${lead.company_name}</strong>` : ''} et nous vous en remercions.</p>
    ${lead.notes ? `<p style="background: #f0f9ff; padding: 12px; border-left: 3px solid #1e40af; margin: 16px 0;"><em>${lead.notes}</em></p>` : ''}
    <p>Notre &eacute;quipe vous contacte <strong>sous 24 heures</strong> pour discuter de votre projet.</p>
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
    <p style="font-size: 14px; color: #666;">
      <strong>HYPERVISUAL Switzerland</strong><br>
      Email : <a href="mailto:info@hypervisual.ch" style="color: #1e40af;">info@hypervisual.ch</a><br>
      T&eacute;l : +41 26 321 00 00
    </p>`;
  return wrapEmail(content);
}

/**
 * Template E-02 — Devis envoye au client
 */
export function quoteSentTemplate(quote, contact) {
  const validUntil = quote.valid_until ? formatDate(quote.valid_until) : formatDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
  const content = `
    <h2 style="color: #1e40af; margin-top: 0;">Votre devis HYPERVISUAL Switzerland</h2>
    <p>Bonjour ${contact.first_name || 'Madame, Monsieur'},</p>
    <p>Veuillez trouver ci-dessous les d&eacute;tails de votre devis :</p>
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
      <tr style="background: #f0f9ff;">
        <td style="padding: 10px; font-weight: bold;">N&deg; devis</td>
        <td style="padding: 10px;">${quote.quote_number || '—'}</td>
      </tr>
      <tr>
        <td style="padding: 10px; font-weight: bold;">Montant TTC</td>
        <td style="padding: 10px; font-size: 18px; color: #1e40af; font-weight: bold;">${formatCHF(quote.total)}</td>
      </tr>
      <tr style="background: #f0f9ff;">
        <td style="padding: 10px; font-weight: bold;">Validit&eacute;</td>
        <td style="padding: 10px;">Jusqu'au ${validUntil}</td>
      </tr>
    </table>
    <div style="text-align: center; margin: 24px 0;">
      <a href="http://localhost:5173/client/quotes/${quote.id}" style="background: #1e40af; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Signer mon devis</a>
    </div>
    <p style="font-size: 13px; color: #666;">Ce devis est valable 30 jours. Pass&eacute; ce d&eacute;lai, un nouveau devis pourra &ecirc;tre &eacute;tabli.</p>`;
  return wrapEmail(content);
}

/**
 * Template E-03 — Paiement confirme
 */
export function paymentConfirmedTemplate(payment, invoice, contact) {
  const content = `
    <h2 style="color: #059669; margin-top: 0;">Paiement re&ccedil;u &#10003;</h2>
    <p>Bonjour ${contact.first_name || 'Madame, Monsieur'},</p>
    <p>Nous confirmons la r&eacute;ception de votre paiement :</p>
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
      <tr style="background: #f0fdf4;">
        <td style="padding: 10px; font-weight: bold;">Montant re&ccedil;u</td>
        <td style="padding: 10px; font-size: 18px; color: #059669; font-weight: bold;">${formatCHF(payment.amount)}</td>
      </tr>
      <tr>
        <td style="padding: 10px; font-weight: bold;">Facture</td>
        <td style="padding: 10px;">${invoice?.invoice_number || '—'}</td>
      </tr>
      <tr style="background: #f0fdf4;">
        <td style="padding: 10px; font-weight: bold;">Date</td>
        <td style="padding: 10px;">${formatDate(payment.payment_date || payment.updated_at)}</td>
      </tr>
    </table>
    <p><strong>Votre projet est maintenant activ&eacute; !</strong> Vous pouvez suivre son avancement depuis votre portail client.</p>
    <div style="text-align: center; margin: 24px 0;">
      <a href="http://localhost:5173/client/projects" style="background: #059669; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Suivre mon projet</a>
    </div>
    <p style="font-size: 13px; color: #666;">Re&ccedil;u fiscal disponible sur demande &agrave; <a href="mailto:info@hypervisual.ch">info@hypervisual.ch</a>.</p>`;
  return wrapEmail(content);
}

/**
 * Template E-04 — Rappel facture impayee (3 niveaux)
 */
export function invoiceReminderTemplate(invoice, contact, level) {
  const subjects = {
    '7': `Rappel : Votre facture ${invoice.invoice_number} arrive à échéance`,
    '14': `2ème rappel — Facture ${invoice.invoice_number} impayée`,
    '30': `Mise en demeure — Facture ${invoice.invoice_number}`
  };

  const bodies = {
    '7': `
      <h2 style="color: #d97706; margin-top: 0;">Rappel de paiement</h2>
      <p>Bonjour ${contact.first_name || 'Madame, Monsieur'},</p>
      <p>Nous souhaitons vous rappeler que la facture suivante est arriv&eacute;e &agrave; &eacute;ch&eacute;ance :</p>
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        <tr style="background: #fffbeb;">
          <td style="padding: 10px; font-weight: bold;">Facture</td>
          <td style="padding: 10px;">${invoice.invoice_number}</td>
        </tr>
        <tr>
          <td style="padding: 10px; font-weight: bold;">Montant</td>
          <td style="padding: 10px; font-weight: bold;">${formatCHF(invoice.amount)}</td>
        </tr>
        <tr style="background: #fffbeb;">
          <td style="padding: 10px; font-weight: bold;">&Eacute;ch&eacute;ance</td>
          <td style="padding: 10px;">${formatDate(invoice.due_date)}</td>
        </tr>
      </table>
      <p>Merci de proc&eacute;der au r&egrave;glement dans les meilleurs d&eacute;lais.</p>
      <p style="font-size: 13px; color: #666;">Si le paiement a d&eacute;j&agrave; &eacute;t&eacute; effectu&eacute;, veuillez ignorer ce message.</p>`,
    '14': `
      <h2 style="color: #ea580c; margin-top: 0;">2&egrave;me rappel — Facture impay&eacute;e</h2>
      <p>Bonjour ${contact.first_name || 'Madame, Monsieur'},</p>
      <p>Malgr&eacute; notre pr&eacute;c&eacute;dent rappel, la facture <strong>${invoice.invoice_number}</strong> d'un montant de <strong>${formatCHF(invoice.amount)}</strong> reste impay&eacute;e.</p>
      <p>Nous vous prions de r&eacute;gler cette facture <strong>sous 7 jours</strong>.</p>
      <p style="font-size: 13px; color: #666;">En cas de difficult&eacute; de paiement, contactez-nous &agrave; <a href="mailto:info@hypervisual.ch">info@hypervisual.ch</a> pour trouver une solution.</p>`,
    '30': `
      <h2 style="color: #dc2626; margin-top: 0;">Mise en demeure</h2>
      <p>Bonjour ${contact.first_name || 'Madame, Monsieur'},</p>
      <p>Conform&eacute;ment &agrave; la loi f&eacute;d&eacute;rale sur la poursuite pour dettes et la faillite (LP/SchKG, art. 67), nous vous mettons formellement en demeure de r&eacute;gler la facture :</p>
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0; border: 2px solid #dc2626;">
        <tr style="background: #fef2f2;">
          <td style="padding: 10px; font-weight: bold;">Facture</td>
          <td style="padding: 10px;">${invoice.invoice_number}</td>
        </tr>
        <tr>
          <td style="padding: 10px; font-weight: bold;">Montant</td>
          <td style="padding: 10px; font-weight: bold; color: #dc2626;">${formatCHF(invoice.amount)}</td>
        </tr>
        <tr style="background: #fef2f2;">
          <td style="padding: 10px; font-weight: bold;">&Eacute;ch&eacute;ance d&eacute;pass&eacute;e</td>
          <td style="padding: 10px;">${formatDate(invoice.due_date)}</td>
        </tr>
      </table>
      <p><strong>Sans r&egrave;glement sous 10 jours</strong>, nous nous verrons contraints d'engager une proc&eacute;dure de poursuite (Betreibungsbegehren / R&eacute;quisition de poursuite).</p>
      <p style="font-size: 13px; color: #666;">R&eacute;f&eacute;rence l&eacute;gale : LP/SchKG Art. 67 &mdash; Droit suisse</p>`
  };

  return {
    subject: subjects[level] || subjects['7'],
    html: wrapEmail(bodies[level] || bodies['7'])
  };
}

/**
 * Template E-05 — Facture fournisseur approuvee
 */
export function supplierInvoiceApprovedTemplate(invoice, provider) {
  const paymentDate = invoice.date_paid
    ? formatDate(invoice.date_paid)
    : formatDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));

  const content = `
    <h2 style="color: #059669; margin-top: 0;">Facture approuv&eacute;e &#10003;</h2>
    <p>Bonjour ${provider.name || 'Cher prestataire'},</p>
    <p>Nous avons le plaisir de vous informer que votre facture a &eacute;t&eacute; approuv&eacute;e :</p>
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
      <tr style="background: #f0fdf4;">
        <td style="padding: 10px; font-weight: bold;">N&deg; facture</td>
        <td style="padding: 10px;">${invoice.invoice_number}</td>
      </tr>
      <tr>
        <td style="padding: 10px; font-weight: bold;">Montant TTC</td>
        <td style="padding: 10px; font-weight: bold;">${formatCHF(invoice.total_ttc || invoice.amount)}</td>
      </tr>
      <tr style="background: #f0fdf4;">
        <td style="padding: 10px; font-weight: bold;">Paiement pr&eacute;vu le</td>
        <td style="padding: 10px; font-weight: bold; color: #059669;">${paymentDate}</td>
      </tr>
    </table>
    <p style="font-size: 13px; color: #666;">
      Service comptabilit&eacute; HYPERVISUAL Switzerland<br>
      <a href="mailto:info@hypervisual.ch">info@hypervisual.ch</a>
    </p>`;
  return wrapEmail(content);
}

/**
 * Template E-06 — Rappel prestataire proposal en attente
 */
export function providerReminderTemplate(proposal, provider, project) {
  const content = `
    <h2 style="color: #d97706; margin-top: 0;">Rappel : Demande de devis en attente</h2>
    <p>Bonjour ${provider.name || 'Cher prestataire'},</p>
    <p>Nous n'avons pas encore re&ccedil;u votre r&eacute;ponse &agrave; notre demande de devis pour le projet :</p>
    <div style="background: #fffbeb; padding: 16px; border-radius: 6px; margin: 16px 0;">
      <strong>${project?.name || proposal.name || 'Projet HYPERVISUAL'}</strong>
      ${proposal.mission_description ? `<p style="margin: 8px 0 0; font-size: 14px;">${proposal.mission_description}</p>` : ''}
      ${proposal.amount ? `<p style="margin: 8px 0 0;">Budget estimatif : <strong>${formatCHF(proposal.amount)}</strong></p>` : ''}
    </div>
    <div style="text-align: center; margin: 24px 0;">
      <a href="http://localhost:5173/prestataire/quotes" style="background: #d97706; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">R&eacute;pondre &agrave; la demande</a>
    </div>
    <p style="font-size: 13px; color: #666;">Merci de r&eacute;pondre dans les meilleurs d&eacute;lais.</p>`;
  return wrapEmail(content);
}
