/**
 * Service Intégration e-LP - Poursuites Suisses
 * 
 * Intégration avec le système e-LP (poursuite électronique)
 * Conforme à la Loi sur la poursuite pour dettes (LP, RS 281.1)
 */

import directus from '../../config/directus.js';

// Frais de poursuite officiels (barème fédéral)
const LP_FEES = {
  requisition: {
    '0-100': 10,
    '100-500': 20,
    '500-1000': 30,
    '1000-10000': 74,
    '10000-100000': 128,
    '100000-1000000': 190,
    '1000000+': 275
  },
  commandment: {
    // Similaire + frais de notification
    surcharge: 0 // Inclus dans requisition
  }
};

// Offices des poursuites (cantons principaux)
const OFFICES_LP = {
  GE: { name: 'Office des poursuites de Genève', code: 'GE01', elp_enabled: true },
  VD: { name: 'Office des poursuites de Vaud', code: 'VD01', elp_enabled: true },
  VS: { name: 'Office des poursuites du Valais', code: 'VS01', elp_enabled: true },
  NE: { name: 'Office des poursuites de Neuchâtel', code: 'NE01', elp_enabled: true },
  FR: { name: 'Office des poursuites de Fribourg', code: 'FR01', elp_enabled: true },
  BE: { name: 'Office des poursuites de Berne', code: 'BE01', elp_enabled: true },
  ZH: { name: 'Office des poursuites de Zurich', code: 'ZH01', elp_enabled: true },
  BS: { name: 'Office des poursuites de Bâle-Ville', code: 'BS01', elp_enabled: true },
  TI: { name: 'Office des poursuites du Tessin', code: 'TI01', elp_enabled: true }
};

// Statuts LP
const LP_STATUS = {
  REQUISITION_SUBMITTED: 'requisition_submitted',
  REQUISITION_ACCEPTED: 'requisition_accepted',
  COMMANDMENT_ISSUED: 'commandment_issued',
  COMMANDMENT_NOTIFIED: 'commandment_notified',
  OPPOSITION_FILED: 'opposition_filed',
  PAYMENT_RECEIVED: 'payment_received',
  CONTINUATION_REQUIRED: 'continuation_required',
  MAINLEVEE_REQUIRED: 'mainlevee_required',
  COMPLETED: 'completed',
  EXPIRED: 'expired'
};

class LPIntegrationService {
  constructor() {
    this.directus = directus;
    this.eLpApiUrl = process.env.ELP_API_URL;
    this.eLpApiKey = process.env.ELP_API_KEY;
  }

  /**
   * Calculer les frais de poursuite
   * @param {number} amount - Montant de la créance
   * @returns {number} Frais de réquisition
   */
  calculateLPFees(amount) {
    if (amount <= 100) return LP_FEES.requisition['0-100'];
    if (amount <= 500) return LP_FEES.requisition['100-500'];
    if (amount <= 1000) return LP_FEES.requisition['500-1000'];
    if (amount <= 10000) return LP_FEES.requisition['1000-10000'];
    if (amount <= 100000) return LP_FEES.requisition['10000-100000'];
    if (amount <= 1000000) return LP_FEES.requisition['100000-1000000'];
    return LP_FEES.requisition['1000000+'];
  }

  /**
   * Déterminer l'office des poursuites compétent
   * (domicile du débiteur - art. 46 LP)
   */
  getCompetentOffice(debtorCanton) {
    const canton = debtorCanton?.toUpperCase() || 'GE';
    return OFFICES_LP[canton] || OFFICES_LP['GE'];
  }

  /**
   * Initier une réquisition de poursuite
   */
  async initiateRequisition(tracking) {
    // Récupérer les données nécessaires
    const invoice = await this.directus.items('client_invoices').readOne(tracking.invoice_id);
    const debtor = await this.directus.items('people').readOne(tracking.client_id);
    const creditor = await this.directus.items('companies').readByQuery({
      filter: { name: { _eq: tracking.owner_company } },
      limit: 1
    });

    // Déterminer l'office compétent
    const office = this.getCompetentOffice(debtor.canton);

    // Calculer les montants
    const lpFees = this.calculateLPFees(tracking.current_amount);
    const totalClaim = tracking.current_amount + lpFees;

    // Préparer les données de réquisition
    const requisitionData = {
      // Créancier
      creditor: {
        name: creditor.data?.[0]?.name,
        address: creditor.data?.[0]?.address,
        postal_code: creditor.data?.[0]?.postal_code,
        city: creditor.data?.[0]?.city,
        ide_number: creditor.data?.[0]?.ide_number
      },
      // Débiteur
      debtor: {
        type: debtor.company_name ? 'legal_entity' : 'natural_person',
        name: debtor.company_name || `${debtor.first_name} ${debtor.last_name}`,
        address: debtor.address,
        postal_code: debtor.postal_code,
        city: debtor.city,
        date_of_birth: debtor.date_of_birth
      },
      // Créance
      claim: {
        principal: tracking.original_amount,
        interest: tracking.interest_accrued,
        fees: tracking.fees_accrued,
        total: tracking.current_amount,
        currency: 'CHF',
        cause: `Facture n° ${invoice.invoice_number} du ${invoice.invoice_date}`,
        interest_rate: 5, // Taux légal
        interest_from: tracking.due_date
      },
      // Métadonnées
      office_code: office.code,
      tracking_id: tracking.id,
      invoice_id: tracking.invoice_id
    };

    // Créer l'enregistrement LP
    const lpCase = await this.directus.items('lp_cases').createOne({
      tracking_id: tracking.id,
      invoice_id: tracking.invoice_id,
      owner_company: tracking.owner_company,
      office_code: office.code,
      office_name: office.name,
      claim_amount: tracking.current_amount,
      lp_fees: lpFees,
      total_claim: totalClaim,
      status: LP_STATUS.REQUISITION_SUBMITTED,
      requisition_data: JSON.stringify(requisitionData),
      created_at: new Date().toISOString()
    });

    // Soumettre à e-LP si disponible
    if (office.elp_enabled && this.eLpApiUrl) {
      try {
        const eLpResponse = await this.submitToELP(requisitionData);
        
        await this.directus.items('lp_cases').updateOne(lpCase.id, {
          elp_reference: eLpResponse.reference,
          elp_submission_date: new Date().toISOString(),
          elp_status: 'submitted'
        });
      } catch (error) {
        console.error('Erreur soumission e-LP:', error);
        // Marquer pour soumission manuelle
        await this.directus.items('lp_cases').updateOne(lpCase.id, {
          elp_status: 'manual_required',
          elp_error: error.message
        });
      }
    } else {
      // Mode manuel - générer le formulaire PDF
      await this.generateRequisitionPDF(lpCase.id, requisitionData);
    }

    // Logger l'événement
    await this.logLPEvent(lpCase.id, 'requisition_initiated', {
      amount: totalClaim,
      office: office.name
    });

    return lpCase;
  }

  /**
   * Soumettre à e-LP (API)
   */
  async submitToELP(requisitionData) {
    if (!this.eLpApiUrl) {
      throw new Error('API e-LP non configurée');
    }

    const response = await fetch(`${this.eLpApiUrl}/requisitions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.eLpApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requisitionData)
    });

    if (!response.ok) {
      throw new Error(`Erreur e-LP: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Générer le PDF de réquisition pour soumission manuelle
   */
  async generateRequisitionPDF(caseId, data) {
    // Utiliser le pdf-generator.service
    const PDFGenerator = (await import('../finance/pdf-generator.service.js')).default;
    
    const pdfContent = await PDFGenerator.generateFromTemplate('lp_requisition', data);
    
    // Sauvegarder le PDF
    await this.directus.items('lp_documents').createOne({
      lp_case_id: caseId,
      document_type: 'requisition',
      filename: `requisition_${caseId}.pdf`,
      content: pdfContent.base64,
      created_at: new Date().toISOString()
    });

    return pdfContent;
  }

  /**
   * Traiter le webhook e-LP (mise à jour de statut)
   */
  async handleELPWebhook(webhookData) {
    const { reference, event_type, data } = webhookData;

    // Trouver le cas LP
    const lpCase = await this.directus.items('lp_cases').readByQuery({
      filter: { elp_reference: { _eq: reference } },
      limit: 1
    });

    if (!lpCase.data?.[0]) {
      console.error('Cas LP non trouvé pour référence:', reference);
      return { success: false, error: 'Case not found' };
    }

    const caseData = lpCase.data[0];
    let newStatus = caseData.status;
    let updateData = {};

    // Mapper les événements e-LP vers nos statuts
    switch (event_type) {
      case 'requisition_accepted':
        newStatus = LP_STATUS.REQUISITION_ACCEPTED;
        updateData.requisition_date = data.date;
        break;

      case 'commandment_issued':
        newStatus = LP_STATUS.COMMANDMENT_ISSUED;
        updateData.commandment_number = data.commandment_number;
        updateData.commandment_date = data.date;
        break;

      case 'commandment_notified':
        newStatus = LP_STATUS.COMMANDMENT_NOTIFIED;
        updateData.notification_date = data.date;
        // Calculer la date limite opposition (10 jours)
        const oppositionDeadline = new Date(data.date);
        oppositionDeadline.setDate(oppositionDeadline.getDate() + 10);
        updateData.opposition_deadline = oppositionDeadline.toISOString();
        // Calculer la date limite paiement (20 jours)
        const paymentDeadline = new Date(data.date);
        paymentDeadline.setDate(paymentDeadline.getDate() + 20);
        updateData.payment_deadline = paymentDeadline.toISOString();
        break;

      case 'opposition_filed':
        newStatus = LP_STATUS.OPPOSITION_FILED;
        updateData.opposition_date = data.date;
        updateData.opposition_reason = data.reason;
        break;

      case 'payment_received':
        newStatus = LP_STATUS.PAYMENT_RECEIVED;
        updateData.payment_date = data.date;
        updateData.payment_amount = data.amount;
        break;

      default:
        console.log('Événement e-LP non géré:', event_type);
    }

    // Mettre à jour le cas
    await this.directus.items('lp_cases').updateOne(caseData.id, {
      status: newStatus,
      ...updateData,
      last_update: new Date().toISOString()
    });

    // Logger l'événement
    await this.logLPEvent(caseData.id, event_type, data);

    // Actions automatiques selon le statut
    await this.handleStatusChange(caseData.id, newStatus, data);

    return { success: true, new_status: newStatus };
  }

  /**
   * Gérer les actions automatiques après changement de statut
   */
  async handleStatusChange(caseId, newStatus, eventData) {
    const lpCase = await this.directus.items('lp_cases').readOne(caseId);

    switch (newStatus) {
      case LP_STATUS.OPPOSITION_FILED:
        // Notifier pour demande de mainlevée
        await this.notifyMainleveeRequired(lpCase);
        break;

      case LP_STATUS.COMMANDMENT_NOTIFIED:
        // Planifier le rappel de continuation (1 an max - art. 88 LP)
        await this.scheduleContinuationReminder(lpCase);
        break;

      case LP_STATUS.PAYMENT_RECEIVED:
        // Mettre à jour le tracking de recouvrement
        await this.handleLPPayment(lpCase, eventData);
        break;
    }
  }

  /**
   * Notifier la nécessité d'une mainlevée
   */
  async notifyMainleveeRequired(lpCase) {
    await this.directus.items('notifications').createOne({
      type: 'lp_mainlevee_required',
      owner_company: lpCase.owner_company,
      title: 'Opposition à la poursuite - Mainlevée requise',
      message: `Le débiteur a fait opposition au commandement de payer (Facture ${lpCase.invoice_id}). Une demande de mainlevée est nécessaire.`,
      priority: 'high',
      related_entity: 'lp_cases',
      related_id: lpCase.id,
      created_at: new Date().toISOString()
    });
  }

  /**
   * Planifier le rappel de continuation (péremption 1 an)
   */
  async scheduleContinuationReminder(lpCase) {
    // Rappel 11 mois après notification (1 mois avant péremption)
    const reminderDate = new Date(lpCase.notification_date);
    reminderDate.setMonth(reminderDate.getMonth() + 11);

    await this.directus.items('scheduled_tasks').createOne({
      type: 'lp_continuation_reminder',
      scheduled_date: reminderDate.toISOString(),
      related_entity: 'lp_cases',
      related_id: lpCase.id,
      data: JSON.stringify({
        peremption_date: new Date(new Date(lpCase.notification_date).setFullYear(
          new Date(lpCase.notification_date).getFullYear() + 1
        )).toISOString()
      })
    });
  }

  /**
   * Gérer le paiement reçu via LP
   */
  async handleLPPayment(lpCase, paymentData) {
    // Mettre à jour le tracking de recouvrement
    const tracking = await this.directus.items('collection_tracking').readOne(lpCase.tracking_id);
    
    if (tracking) {
      const collectionService = (await import('./collection.service.js')).collectionService;
      await collectionService.recordPayment(tracking.id, {
        amount: paymentData.amount,
        payment_date: paymentData.date,
        payment_method: 'lp_payment',
        reference: lpCase.elp_reference
      });
    }
  }

  /**
   * Demander la continuation de la poursuite
   */
  async requestContinuation(caseId) {
    const lpCase = await this.directus.items('lp_cases').readOne(caseId);
    
    if (!lpCase) {
      throw new Error('Cas LP non trouvé');
    }

    // Vérifier que la péremption n'est pas atteinte
    const notificationDate = new Date(lpCase.notification_date);
    const peremptionDate = new Date(notificationDate);
    peremptionDate.setFullYear(peremptionDate.getFullYear() + 1);

    if (new Date() > peremptionDate) {
      throw new Error('La poursuite est périmée (art. 88 LP - délai 1 an dépassé)');
    }

    // Soumettre la demande de continuation
    if (this.eLpApiUrl && lpCase.elp_reference) {
      await fetch(`${this.eLpApiUrl}/continuations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.eLpApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reference: lpCase.elp_reference,
          type: 'continuation'
        })
      });
    }

    await this.directus.items('lp_cases').updateOne(caseId, {
      status: LP_STATUS.CONTINUATION_REQUIRED,
      continuation_requested_at: new Date().toISOString()
    });

    await this.logLPEvent(caseId, 'continuation_requested', {});

    return { success: true };
  }

  /**
   * Obtenir le statut d'un cas LP
   */
  async getLPCaseStatus(caseId) {
    const lpCase = await this.directus.items('lp_cases').readOne(caseId);
    
    if (!lpCase) {
      throw new Error('Cas LP non trouvé');
    }

    const events = await this.directus.items('lp_events').readByQuery({
      filter: { lp_case_id: { _eq: caseId } },
      sort: ['-timestamp']
    });

    return {
      ...lpCase,
      events: events.data || []
    };
  }

  /**
   * Logger un événement LP
   */
  async logLPEvent(caseId, eventType, metadata) {
    await this.directus.items('lp_events').createOne({
      lp_case_id: caseId,
      event_type: eventType,
      metadata: JSON.stringify(metadata),
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Obtenir les statistiques LP pour une entreprise
   */
  async getLPStatistics(ownerCompany) {
    const stats = await this.directus.items('lp_cases').readByQuery({
      filter: { owner_company: { _eq: ownerCompany } },
      groupBy: ['status'],
      aggregate: { count: '*', sum: ['claim_amount'] }
    });

    const activeCount = await this.directus.items('lp_cases').readByQuery({
      filter: {
        owner_company: { _eq: ownerCompany },
        status: { _nin: [LP_STATUS.COMPLETED, LP_STATUS.EXPIRED] }
      },
      aggregate: { count: '*', sum: ['claim_amount'] }
    });

    return {
      by_status: stats.data || [],
      active_cases: activeCount.data?.[0]?.count || 0,
      active_amount: activeCount.data?.[0]?.sum?.claim_amount || 0
    };
  }
}

export const lpIntegrationService = new LPIntegrationService();
export default lpIntegrationService;