/**
 * Service Recouvrement - Conforme Droit Suisse
 * 
 * Automatise le processus de recouvrement selon:
 * - Code des Obligations (art. 102-109)
 * - Loi sur la poursuite pour dettes (LP)
 */

import directus from '../../config/directus.js';
import { interestCalculator } from './interest-calculator.js';
import { reminderService } from './reminder.service.js';
import { lpIntegrationService } from './lp-integration.service.js';

// Entreprises du groupe
const COMPANIES = ['HYPERVISUAL', 'DAINAMICS', 'LEXAIA', 'ENKI_REALTY', 'TAKEOUT'];

// Statuts de recouvrement
const COLLECTION_STATUS = {
  CURRENT: 'current',                    // Facture dans les délais
  OVERDUE: 'overdue',                    // En retard
  REMINDER_1: 'reminder_1',              // 1er rappel envoyé
  REMINDER_2: 'reminder_2',              // 2ème rappel envoyé
  FORMAL_NOTICE: 'formal_notice',        // Mise en demeure
  COLLECTION: 'collection',              // En recouvrement
  LP_REQUISITION: 'lp_requisition',      // Réquisition de poursuite
  LP_COMMANDMENT: 'lp_commandment',      // Commandement de payer
  LP_OPPOSITION: 'lp_opposition',        // Opposition du débiteur
  LP_MAINLEVEE: 'lp_mainlevee',         // Mainlevée demandée
  PAID: 'paid',                          // Payé
  WRITTEN_OFF: 'written_off',            // Passé en perte
  SUSPENDED: 'suspended'                 // Suspendu
};

// Configuration par défaut du workflow
const DEFAULT_WORKFLOW_CONFIG = {
  // Délais en jours après échéance
  reminder_1_delay: 10,        // J+10 : 1er rappel
  reminder_2_delay: 25,        // J+25 : 2ème rappel
  formal_notice_delay: 40,     // J+40 : Mise en demeure
  lp_requisition_delay: 55,    // J+55 : Poursuite LP
  
  // Frais (doivent être dans les CGV)
  reminder_1_fee: 0,           // 1er rappel gratuit
  reminder_2_fee: 20,          // CHF
  formal_notice_fee: 30,       // CHF
  
  // Taux intérêts
  interest_rate: 5,            // % annuel (légal)
  contractual_rate: null,      // Si défini dans CGV
  
  // Seuils
  minimum_collection_amount: 100,  // CHF minimum pour poursuites
  auto_lp_threshold: 1000          // CHF pour LP automatique
};

class CollectionService {
  constructor() {
    this.directus = directus;
  }

  /**
   * Obtenir la configuration de recouvrement pour une entreprise
   */
  async getWorkflowConfig(ownerCompany) {
    const config = await this.directus.items('collection_config').readByQuery({
      filter: { owner_company: { _eq: ownerCompany } },
      limit: 1
    });

    return config.data?.[0] || { ...DEFAULT_WORKFLOW_CONFIG, owner_company: ownerCompany };
  }

  /**
   * Initialiser le suivi de recouvrement pour une facture
   */
  async initializeCollection(invoiceId) {
    // Récupérer la facture
    const invoice = await this.directus.items('client_invoices').readOne(invoiceId);
    if (!invoice) {
      throw new Error('Facture non trouvée');
    }

    // Vérifier si un suivi existe déjà
    const existing = await this.directus.items('collection_tracking').readByQuery({
      filter: { invoice_id: { _eq: invoiceId } },
      limit: 1
    });

    if (existing.data?.length > 0) {
      return existing.data[0];
    }

    // Créer le suivi
    const tracking = await this.directus.items('collection_tracking').createOne({
      invoice_id: invoiceId,
      owner_company: invoice.owner_company,
      client_id: invoice.client_id,
      original_amount: invoice.total_amount,
      current_amount: invoice.total_amount,
      interest_accrued: 0,
      fees_accrued: 0,
      due_date: invoice.due_date,
      status: COLLECTION_STATUS.CURRENT,
      created_at: new Date().toISOString(),
      workflow_started: false,
      reminders_sent: 0,
      last_action_date: null,
      next_action_date: invoice.due_date
    });

    await this.logEvent(tracking.id, 'collection_initialized', {
      invoice_id: invoiceId,
      amount: invoice.total_amount
    });

    return tracking;
  }

  /**
   * Traiter le workflow de recouvrement quotidien
   * À exécuter via cron job
   */
  async processCollectionWorkflow(ownerCompany = null) {
    const companies = ownerCompany ? [ownerCompany] : COMPANIES;
    const results = { processed: 0, actions: [] };

    for (const company of companies) {
      const config = await this.getWorkflowConfig(company);
      
      // Récupérer les factures à traiter
      const trackings = await this.directus.items('collection_tracking').readByQuery({
        filter: {
          owner_company: { _eq: company },
          status: { 
            _nin: [COLLECTION_STATUS.PAID, COLLECTION_STATUS.WRITTEN_OFF, COLLECTION_STATUS.SUSPENDED]
          },
          next_action_date: { _lte: new Date().toISOString().split('T')[0] }
        }
      });

      for (const tracking of trackings.data || []) {
        const action = await this.processTrackingItem(tracking, config);
        if (action) {
          results.actions.push(action);
          results.processed++;
        }
      }
    }

    return results;
  }

  /**
   * Traiter un élément de recouvrement
   */
  async processTrackingItem(tracking, config) {
    const today = new Date();
    const dueDate = new Date(tracking.due_date);
    const daysOverdue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));

    // Pas en retard
    if (daysOverdue <= 0) {
      return null;
    }

    // Calculer les intérêts
    const interestRate = config.contractual_rate || config.interest_rate;
    const newInterest = interestCalculator.calculate(
      tracking.original_amount,
      interestRate,
      daysOverdue
    );

    // Déterminer l'action suivante
    let action = null;
    let newStatus = tracking.status;
    let newFees = tracking.fees_accrued;

    if (tracking.status === COLLECTION_STATUS.CURRENT && daysOverdue > 0) {
      // Première échéance dépassée
      newStatus = COLLECTION_STATUS.OVERDUE;
      action = { type: 'status_change', to: COLLECTION_STATUS.OVERDUE };
    }
    else if (tracking.status === COLLECTION_STATUS.OVERDUE && daysOverdue >= config.reminder_1_delay) {
      // Envoyer 1er rappel
      await reminderService.sendReminder(tracking, 1, config);
      newStatus = COLLECTION_STATUS.REMINDER_1;
      newFees += config.reminder_1_fee;
      action = { type: 'reminder_sent', level: 1 };
    }
    else if (tracking.status === COLLECTION_STATUS.REMINDER_1 && daysOverdue >= config.reminder_2_delay) {
      // Envoyer 2ème rappel
      await reminderService.sendReminder(tracking, 2, config);
      newStatus = COLLECTION_STATUS.REMINDER_2;
      newFees += config.reminder_2_fee;
      action = { type: 'reminder_sent', level: 2 };
    }
    else if (tracking.status === COLLECTION_STATUS.REMINDER_2 && daysOverdue >= config.formal_notice_delay) {
      // Envoyer mise en demeure
      await reminderService.sendFormalNotice(tracking, config);
      newStatus = COLLECTION_STATUS.FORMAL_NOTICE;
      newFees += config.formal_notice_fee;
      action = { type: 'formal_notice_sent' };
    }
    else if (tracking.status === COLLECTION_STATUS.FORMAL_NOTICE && daysOverdue >= config.lp_requisition_delay) {
      // Vérifier le seuil pour LP automatique
      const totalDue = tracking.original_amount + newInterest + newFees;
      
      if (totalDue >= config.auto_lp_threshold) {
        // Initier la poursuite LP
        await lpIntegrationService.initiateRequisition(tracking);
        newStatus = COLLECTION_STATUS.LP_REQUISITION;
        action = { type: 'lp_requisition_initiated' };
      } else {
        // Montant trop faible, passer en recouvrement manuel
        newStatus = COLLECTION_STATUS.COLLECTION;
        action = { type: 'manual_collection' };
      }
    }

    if (action) {
      // Calculer la prochaine date d'action
      const nextActionDate = this.calculateNextActionDate(newStatus, tracking.due_date, config);

      // Mettre à jour le tracking
      await this.directus.items('collection_tracking').updateOne(tracking.id, {
        status: newStatus,
        interest_accrued: newInterest,
        fees_accrued: newFees,
        current_amount: tracking.original_amount + newInterest + newFees,
        last_action_date: new Date().toISOString(),
        next_action_date: nextActionDate,
        reminders_sent: action.type === 'reminder_sent' ? tracking.reminders_sent + 1 : tracking.reminders_sent
      });

      // Logger l'événement
      await this.logEvent(tracking.id, action.type, {
        status: newStatus,
        interest: newInterest,
        fees: newFees,
        days_overdue: daysOverdue
      });

      return {
        tracking_id: tracking.id,
        invoice_id: tracking.invoice_id,
        action,
        new_status: newStatus,
        total_due: tracking.original_amount + newInterest + newFees
      };
    }

    return null;
  }

  /**
   * Calculer la prochaine date d'action
   */
  calculateNextActionDate(status, dueDate, config) {
    const due = new Date(dueDate);
    let daysToAdd = 0;

    switch (status) {
      case COLLECTION_STATUS.CURRENT:
      case COLLECTION_STATUS.OVERDUE:
        daysToAdd = config.reminder_1_delay;
        break;
      case COLLECTION_STATUS.REMINDER_1:
        daysToAdd = config.reminder_2_delay;
        break;
      case COLLECTION_STATUS.REMINDER_2:
        daysToAdd = config.formal_notice_delay;
        break;
      case COLLECTION_STATUS.FORMAL_NOTICE:
        daysToAdd = config.lp_requisition_delay;
        break;
      default:
        // Pour LP et au-delà, vérification hebdomadaire
        return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    }

    due.setDate(due.getDate() + daysToAdd);
    return due.toISOString().split('T')[0];
  }

  /**
   * Enregistrer un paiement
   */
  async recordPayment(trackingId, paymentData) {
    const { amount, payment_date, payment_method, reference } = paymentData;

    const tracking = await this.directus.items('collection_tracking').readOne(trackingId);
    if (!tracking) {
      throw new Error('Suivi de recouvrement non trouvé');
    }

    // Enregistrer le paiement
    await this.directus.items('collection_payments').createOne({
      tracking_id: trackingId,
      amount,
      payment_date: payment_date || new Date().toISOString(),
      payment_method,
      reference,
      created_at: new Date().toISOString()
    });

    // Calculer le total payé
    const payments = await this.directus.items('collection_payments').readByQuery({
      filter: { tracking_id: { _eq: trackingId } },
      aggregate: { sum: ['amount'] }
    });

    const totalPaid = payments.data?.[0]?.sum?.amount || 0;
    const totalDue = tracking.original_amount + tracking.interest_accrued + tracking.fees_accrued;

    // Mettre à jour le statut
    const isPaid = totalPaid >= totalDue;
    await this.directus.items('collection_tracking').updateOne(trackingId, {
      status: isPaid ? COLLECTION_STATUS.PAID : tracking.status,
      paid_amount: totalPaid,
      paid_at: isPaid ? new Date().toISOString() : null
    });

    // Logger
    await this.logEvent(trackingId, 'payment_received', {
      amount,
      total_paid: totalPaid,
      is_fully_paid: isPaid
    });

    // Mettre à jour la facture
    if (isPaid) {
      await this.directus.items('client_invoices').updateOne(tracking.invoice_id, {
        status: 'paid',
        paid_at: new Date().toISOString()
      });
    }

    return { tracking_id: trackingId, status: isPaid ? 'paid' : 'partial', total_paid: totalPaid };
  }

  /**
   * Suspendre le recouvrement
   */
  async suspendCollection(trackingId, reason) {
    await this.directus.items('collection_tracking').updateOne(trackingId, {
      status: COLLECTION_STATUS.SUSPENDED,
      suspension_reason: reason,
      suspended_at: new Date().toISOString()
    });

    await this.logEvent(trackingId, 'collection_suspended', { reason });

    return { success: true };
  }

  /**
   * Reprendre le recouvrement
   */
  async resumeCollection(trackingId) {
    const tracking = await this.directus.items('collection_tracking').readOne(trackingId);
    
    // Déterminer le statut approprié
    const previousStatus = tracking.status_before_suspension || COLLECTION_STATUS.OVERDUE;
    
    await this.directus.items('collection_tracking').updateOne(trackingId, {
      status: previousStatus,
      suspension_reason: null,
      suspended_at: null,
      next_action_date: new Date().toISOString().split('T')[0]
    });

    await this.logEvent(trackingId, 'collection_resumed', {});

    return { success: true };
  }

  /**
   * Passer une créance en perte
   */
  async writeOffDebt(trackingId, reason) {
    const tracking = await this.directus.items('collection_tracking').readOne(trackingId);
    
    await this.directus.items('collection_tracking').updateOne(trackingId, {
      status: COLLECTION_STATUS.WRITTEN_OFF,
      written_off_at: new Date().toISOString(),
      written_off_reason: reason,
      written_off_amount: tracking.current_amount
    });

    // Créer une écriture comptable pour la perte
    await this.directus.items('accounting_entries').createOne({
      owner_company: tracking.owner_company,
      date: new Date().toISOString().split('T')[0],
      description: `Créance passée en perte - Facture ${tracking.invoice_id}`,
      debit_account: '6900',  // Pertes sur créances (plan comptable suisse)
      credit_account: '1100', // Débiteurs
      amount: tracking.current_amount,
      reference: tracking.invoice_id,
      type: 'write_off'
    });

    await this.logEvent(trackingId, 'debt_written_off', { reason, amount: tracking.current_amount });

    return { success: true };
  }

  /**
   * Obtenir le tableau de bord de recouvrement
   */
  async getCollectionDashboard(ownerCompany) {
    // Statistiques par statut
    const statusStats = await this.directus.items('collection_tracking').readByQuery({
      filter: { 
        owner_company: { _eq: ownerCompany },
        status: { _nin: [COLLECTION_STATUS.PAID, COLLECTION_STATUS.WRITTEN_OFF] }
      },
      groupBy: ['status'],
      aggregate: { count: '*', sum: ['current_amount'] }
    });

    // Créances par ancienneté
    const agingBuckets = await this.calculateAgingBuckets(ownerCompany);

    // Top débiteurs
    const topDebtors = await this.directus.items('collection_tracking').readByQuery({
      filter: {
        owner_company: { _eq: ownerCompany },
        status: { _nin: [COLLECTION_STATUS.PAID, COLLECTION_STATUS.WRITTEN_OFF] }
      },
      sort: ['-current_amount'],
      limit: 10,
      fields: ['*', 'client_id.*']
    });

    // Actions récentes
    const recentActions = await this.directus.items('collection_events').readByQuery({
      filter: { owner_company: { _eq: ownerCompany } },
      sort: ['-timestamp'],
      limit: 20
    });

    // KPIs
    const totalOutstanding = statusStats.data?.reduce((sum, s) => sum + (s.sum?.current_amount || 0), 0) || 0;
    const countOverdue = statusStats.data?.reduce((sum, s) => sum + (s.count || 0), 0) || 0;

    return {
      kpis: {
        total_outstanding: totalOutstanding,
        count_overdue: countOverdue,
        average_days_overdue: await this.calculateAverageDaysOverdue(ownerCompany)
      },
      by_status: statusStats.data || [],
      aging_buckets: agingBuckets,
      top_debtors: topDebtors.data || [],
      recent_actions: recentActions.data || []
    };
  }

  /**
   * Calculer les créances par ancienneté
   */
  async calculateAgingBuckets(ownerCompany) {
    const today = new Date();
    const buckets = {
      'current': { label: 'À jour', count: 0, amount: 0 },
      '1-30': { label: '1-30 jours', count: 0, amount: 0 },
      '31-60': { label: '31-60 jours', count: 0, amount: 0 },
      '61-90': { label: '61-90 jours', count: 0, amount: 0 },
      '90+': { label: '> 90 jours', count: 0, amount: 0 }
    };

    const trackings = await this.directus.items('collection_tracking').readByQuery({
      filter: {
        owner_company: { _eq: ownerCompany },
        status: { _nin: [COLLECTION_STATUS.PAID, COLLECTION_STATUS.WRITTEN_OFF] }
      }
    });

    for (const tracking of trackings.data || []) {
      const dueDate = new Date(tracking.due_date);
      const daysOverdue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
      
      let bucket;
      if (daysOverdue <= 0) bucket = 'current';
      else if (daysOverdue <= 30) bucket = '1-30';
      else if (daysOverdue <= 60) bucket = '31-60';
      else if (daysOverdue <= 90) bucket = '61-90';
      else bucket = '90+';

      buckets[bucket].count++;
      buckets[bucket].amount += tracking.current_amount;
    }

    return Object.entries(buckets).map(([key, value]) => ({
      bucket: key,
      ...value
    }));
  }

  /**
   * Calculer la moyenne des jours de retard
   */
  async calculateAverageDaysOverdue(ownerCompany) {
    const trackings = await this.directus.items('collection_tracking').readByQuery({
      filter: {
        owner_company: { _eq: ownerCompany },
        status: { _nin: [COLLECTION_STATUS.PAID, COLLECTION_STATUS.WRITTEN_OFF, COLLECTION_STATUS.CURRENT] }
      }
    });

    if (!trackings.data?.length) return 0;

    const today = new Date();
    const totalDays = trackings.data.reduce((sum, t) => {
      const dueDate = new Date(t.due_date);
      return sum + Math.max(0, Math.floor((today - dueDate) / (1000 * 60 * 60 * 24)));
    }, 0);

    return Math.round(totalDays / trackings.data.length);
  }

  /**
   * Logger un événement de recouvrement
   */
  async logEvent(trackingId, eventType, metadata) {
    const tracking = await this.directus.items('collection_tracking').readOne(trackingId);
    
    await this.directus.items('collection_events').createOne({
      tracking_id: trackingId,
      invoice_id: tracking.invoice_id,
      owner_company: tracking.owner_company,
      event_type: eventType,
      metadata: JSON.stringify(metadata),
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Obtenir l'historique d'un recouvrement
   */
  async getCollectionHistory(trackingId) {
    const events = await this.directus.items('collection_events').readByQuery({
      filter: { tracking_id: { _eq: trackingId } },
      sort: ['-timestamp']
    });

    const payments = await this.directus.items('collection_payments').readByQuery({
      filter: { tracking_id: { _eq: trackingId } },
      sort: ['-payment_date']
    });

    return {
      events: events.data || [],
      payments: payments.data || []
    };
  }
}

export const collectionService = new CollectionService();
export default collectionService;