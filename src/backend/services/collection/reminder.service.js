/**
 * Service de Rappels - Conforme Droit Suisse
 * 
 * Génère et envoie les rappels et mises en demeure
 * Respect des exigences légales (art. 102 CO)
 */

import directus from '../../config/directus.js';
import { interestCalculator } from './interest-calculator.js';

class ReminderService {
  constructor() {
    this.directus = directus;
  }

  /**
   * Envoyer un rappel
   * @param {object} tracking - Données de suivi
   * @param {number} level - Niveau du rappel (1 ou 2)
   * @param {object} config - Configuration du workflow
   */
  async sendReminder(tracking, level, config) {
    // Récupérer les données complètes
    const invoice = await this.directus.items('client_invoices').readOne(tracking.invoice_id);
    const client = await this.directus.items('people').readOne(tracking.client_id);
    const company = await this.directus.items('companies').readByQuery({
      filter: { name: { _eq: tracking.owner_company } },
      limit: 1
    });

    // Calculer les intérêts à date
    const interestDetails = interestCalculator.generateInterestStatement({
      amount: tracking.original_amount,
      due_date: tracking.due_date,
      number: invoice.invoice_number,
      date: invoice.invoice_date,
      contractual_interest_rate: config.contractual_rate
    });

    // Générer le contenu du rappel
    const content = this.generateReminderContent(level, {
      client,
      invoice,
      tracking,
      interestDetails,
      company: company.data?.[0],
      fee: level === 1 ? config.reminder_1_fee : config.reminder_2_fee
    });

    // Enregistrer le rappel
    const reminder = await this.directus.items('collection_reminders').createOne({
      tracking_id: tracking.id,
      invoice_id: tracking.invoice_id,
      owner_company: tracking.owner_company,
      level,
      content,
      amount_due: interestDetails.total + (level === 2 ? config.reminder_2_fee : 0),
      sent_at: new Date().toISOString(),
      sent_via: 'email',
      recipient_email: client.email
    });

    // Envoyer par email (via Mautic)
    await this.sendReminderEmail(client, content, level);

    return reminder;
  }

  /**
   * Générer le contenu du rappel
   */
  generateReminderContent(level, data) {
    const { client, invoice, tracking, interestDetails, company, fee } = data;
    
    const templates = {
      1: this.getReminder1Template(),
      2: this.getReminder2Template()
    };

    let content = templates[level];
    
    // Remplacer les variables
    const variables = {
      client_name: `${client.first_name} ${client.last_name}`,
      client_company: client.company_name || '',
      company_name: company?.name || tracking.owner_company,
      company_address: company?.address || '',
      company_email: company?.email || '',
      invoice_number: invoice.invoice_number,
      invoice_date: new Date(invoice.invoice_date).toLocaleDateString('fr-CH'),
      due_date: new Date(tracking.due_date).toLocaleDateString('fr-CH'),
      original_amount: tracking.original_amount.toFixed(2),
      interest_amount: interestDetails.interest.toFixed(2),
      fee_amount: fee?.toFixed(2) || '0.00',
      total_amount: (interestDetails.total + (fee || 0)).toFixed(2),
      days_overdue: interestDetails.days_overdue,
      interest_rate: interestDetails.interest_rate,
      payment_deadline: this.calculatePaymentDeadline(level),
      current_date: new Date().toLocaleDateString('fr-CH'),
      iban: company?.iban || '',
      reference: invoice.payment_reference || invoice.invoice_number
    };

    for (const [key, value] of Object.entries(variables)) {
      content = content.replace(new RegExp(`{{${key}}}`, 'g'), value || '');
    }

    return content;
  }

  /**
   * Template 1er rappel (courtois)
   */
  getReminder1Template() {
    return `
{{company_name}}
{{company_address}}

{{current_date}}

{{client_name}}
{{client_company}}

**RAPPEL DE PAIEMENT**

Madame, Monsieur,

Nous nous permettons de vous rappeler que notre facture n° {{invoice_number}} du {{invoice_date}} d'un montant de CHF {{original_amount}} est arrivée à échéance le {{due_date}}.

Sauf erreur de notre part, ce montant n'a pas encore été réglé.

Nous vous prions de bien vouloir procéder au paiement dans les meilleurs délais, soit jusqu'au **{{payment_deadline}}**.

**Coordonnées de paiement :**
- IBAN : {{iban}}
- Référence : {{reference}}
- Montant : CHF {{original_amount}}

Si vous avez déjà effectué ce paiement, nous vous prions de ne pas tenir compte de ce rappel.

Nous restons à votre disposition pour toute question.

Avec nos meilleures salutations,

{{company_name}}
{{company_email}}
`;
  }

  /**
   * Template 2ème rappel (formel)
   */
  getReminder2Template() {
    return `
{{company_name}}
{{company_address}}

{{current_date}}

{{client_name}}
{{client_company}}

**DEUXIÈME RAPPEL - URGENT**

Réf: Facture n° {{invoice_number}}

Madame, Monsieur,

Malgré notre premier rappel, nous constatons que notre facture n° {{invoice_number}} du {{invoice_date}} demeure impayée.

**Situation au {{current_date}} :**
- Montant principal : CHF {{original_amount}}
- Intérêts de retard ({{interest_rate}}% - art. 104 CO) : CHF {{interest_amount}}
- Frais de rappel : CHF {{fee_amount}}
- **TOTAL DÛ : CHF {{total_amount}}**

Retard de paiement : {{days_overdue}} jours

Nous vous mettons en demeure de régler ce montant jusqu'au **{{payment_deadline}}** au plus tard.

**Coordonnées de paiement :**
- IBAN : {{iban}}
- Référence : {{reference}}
- Montant : CHF {{total_amount}}

Sans règlement dans le délai imparti, nous serons contraints d'engager des poursuites légales conformément à la Loi sur la poursuite pour dettes (LP), ce qui entraînera des frais supplémentaires à votre charge.

Nous restons à votre disposition pour convenir d'un éventuel arrangement de paiement.

Avec nos meilleures salutations,

{{company_name}}
{{company_email}}
`;
  }

  /**
   * Envoyer une mise en demeure formelle
   */
  async sendFormalNotice(tracking, config) {
    const invoice = await this.directus.items('client_invoices').readOne(tracking.invoice_id);
    const client = await this.directus.items('people').readOne(tracking.client_id);
    const company = await this.directus.items('companies').readByQuery({
      filter: { name: { _eq: tracking.owner_company } },
      limit: 1
    });

    const interestDetails = interestCalculator.generateInterestStatement({
      amount: tracking.original_amount,
      due_date: tracking.due_date,
      number: invoice.invoice_number,
      date: invoice.invoice_date,
      contractual_interest_rate: config.contractual_rate
    });

    const totalFees = config.reminder_1_fee + config.reminder_2_fee + config.formal_notice_fee;

    const content = this.generateFormalNoticeContent({
      client,
      invoice,
      tracking,
      interestDetails,
      company: company.data?.[0],
      totalFees
    });

    // Enregistrer la mise en demeure
    const notice = await this.directus.items('collection_reminders').createOne({
      tracking_id: tracking.id,
      invoice_id: tracking.invoice_id,
      owner_company: tracking.owner_company,
      level: 3, // Mise en demeure
      type: 'formal_notice',
      content,
      amount_due: interestDetails.total + totalFees,
      sent_at: new Date().toISOString(),
      sent_via: 'registered_mail', // Recommandé
      recipient_email: client.email,
      recipient_address: client.address
    });

    // Envoyer par email ET courrier recommandé
    await this.sendFormalNoticeEmail(client, content);
    
    // Déclencher l'envoi du recommandé (via API externe ou queue)
    await this.queueRegisteredMail(client, content, notice.id);

    return notice;
  }

  /**
   * Générer le contenu de la mise en demeure
   */
  generateFormalNoticeContent(data) {
    const { client, invoice, tracking, interestDetails, company, totalFees } = data;

    return `
${company?.name || tracking.owner_company}
${company?.address || ''}

${new Date().toLocaleDateString('fr-CH')}

**ENVOI RECOMMANDÉ**

${client.first_name} ${client.last_name}
${client.company_name || ''}
${client.address || ''}

**MISE EN DEMEURE**
Facture n° ${invoice.invoice_number}

Madame, Monsieur,

Par la présente, nous vous mettons formellement en demeure de nous régler le montant suivant :

**DÉCOMPTE AU ${new Date().toLocaleDateString('fr-CH')} :**
┌─────────────────────────────────────────────────────┐
│ Montant principal de la facture    CHF ${tracking.original_amount.toFixed(2).padStart(12)} │
│ Intérêts moratoires (${interestDetails.interest_rate}% - art. 104 CO)  CHF ${interestDetails.interest.toFixed(2).padStart(12)} │
│ Frais de rappels et recouvrement   CHF ${totalFees.toFixed(2).padStart(12)} │
├─────────────────────────────────────────────────────┤
│ **TOTAL DÛ**                       **CHF ${(interestDetails.total + totalFees).toFixed(2).padStart(12)}** │
└─────────────────────────────────────────────────────┘

**Détail du calcul des intérêts :**
${interestDetails.calculation_formula}
Base légale : ${interestDetails.legal_reference}

**DÉLAI DE PAIEMENT : 10 JOURS**
Date limite : ${this.calculatePaymentDeadline(3)}

**Coordonnées de paiement :**
IBAN : ${company?.iban || 'À COMPLÉTER'}
Référence : ${invoice.payment_reference || invoice.invoice_number}

**CONSÉQUENCES DU NON-PAIEMENT**
Sans règlement intégral dans le délai imparti, nous engagerons immédiatement une **procédure de poursuite** conformément à la Loi fédérale sur la poursuite pour dettes et la faillite (LP, RS 281.1), sans autre avis.

Cette procédure entraînera des frais supplémentaires à votre charge (frais de réquisition, commandement de payer, etc.).

Nous vous accordons toutefois la possibilité de nous contacter pour convenir d'un arrangement de paiement raisonnable.

La présente vaut mise en demeure au sens de l'article 102 du Code des obligations.

Avec nos meilleures salutations,

${company?.name || tracking.owner_company}

_____________________________
Signature autorisée

Contact : ${company?.email || ''}
`;
  }

  /**
   * Calculer le délai de paiement selon le niveau
   */
  calculatePaymentDeadline(level) {
    const delays = {
      1: 10, // 1er rappel : 10 jours
      2: 10, // 2ème rappel : 10 jours
      3: 10  // Mise en demeure : 10 jours (délai légal raisonnable)
    };

    const deadline = new Date();
    deadline.setDate(deadline.getDate() + delays[level]);
    return deadline.toLocaleDateString('fr-CH');
  }

  /**
   * Envoyer le rappel par email (via Mautic)
   */
  async sendReminderEmail(client, content, level) {
    await this.directus.items('email_queue').createOne({
      to_email: client.email,
      to_name: `${client.first_name} ${client.last_name}`,
      template: `reminder_level_${level}`,
      subject: level === 1 ? 'Rappel de paiement' : 'URGENT - Deuxième rappel de paiement',
      body: content,
      priority: level === 1 ? 'normal' : 'high',
      status: 'pending'
    });
  }

  /**
   * Envoyer la mise en demeure par email
   */
  async sendFormalNoticeEmail(client, content) {
    await this.directus.items('email_queue').createOne({
      to_email: client.email,
      to_name: `${client.first_name} ${client.last_name}`,
      template: 'formal_notice',
      subject: 'MISE EN DEMEURE - Action requise immédiatement',
      body: content,
      priority: 'urgent',
      status: 'pending'
    });
  }

  /**
   * Mettre en queue l'envoi du recommandé
   */
  async queueRegisteredMail(client, content, noticeId) {
    await this.directus.items('registered_mail_queue').createOne({
      notice_id: noticeId,
      recipient_name: `${client.first_name} ${client.last_name}`,
      recipient_company: client.company_name,
      recipient_address: client.address,
      content,
      status: 'pending',
      created_at: new Date().toISOString()
    });
  }
}

export const reminderService = new ReminderService();
export default reminderService;