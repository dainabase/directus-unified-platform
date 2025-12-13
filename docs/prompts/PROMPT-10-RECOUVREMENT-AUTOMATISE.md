# PROMPT 10/10 - MODULE RECOUVREMENT AUTOMATISÉ

## Contexte
Ce module automatise le processus de recouvrement de créances conformément au droit suisse (Code des Obligations art. 102-109, Loi sur la poursuite pour dettes LP RS 281.1).

## Cadre Légal Suisse - Recouvrement

### Mise en demeure (art. 102 CO)
- **Avec délai contractuel** : Demeure automatique à l'expiration du délai (aucun rappel nécessaire)
- **Sans délai convenu** : Mise en demeure formelle obligatoire pour faire courir les intérêts

### Exigences de la mise en demeure
- Écrite (recommandée par lettre recommandée)
- Identification claire de l'obligation et du montant
- Délai raisonnable de paiement (date précise)
- Mention des conséquences du non-paiement

### Intérêts moratoires (art. 104 CO)
- **Taux légal** : 5% par an (inchangé depuis 1912)
- **Taux contractuel** : Peut être supérieur (8-10% acceptable B2B)
- **Maximum recommandé** : 15-18% (au-delà = risque usure art. 157 CP)
- Court automatiquement dès la demeure

### Frais de rappel
- **Pas de frais légaux** - doivent être convenus dans les CGV
- **Standard industrie** : 30 CHF max par rappel
- **Plafond total** : 120 CHF pour tous rappels

### Frais de recouvrement (art. 106 CO)
- Dommages excédant les intérêts : preuve du dommage réel requise
- Art. 27 LP : interdit de facturer les frais d'agence au débiteur

### Clauses pénales (art. 160-163 CO)
- Montant libre mais réductible par le juge (art. 163 al. 3)
- Pénalités > 20% scrutées attentivement

### Procédure de poursuite LP
1. **Réquisition de poursuite** : Office des poursuites du domicile du débiteur
2. **Commandement de payer** : Notifié au débiteur (1-2 mois)
3. **Opposition** : 10 jours pour le débiteur
4. **Paiement** : 20 jours après notification
5. **Mainlevée** : Judiciaire si opposition
6. **Péremption** : 1 an pour continuer la poursuite (art. 88 LP)

### Frais de poursuite
- 1'000 - 10'000 CHF : ~74 CHF
- 10'000 - 100'000 CHF : ~128 CHF  
- 100'000 - 1M CHF : ~190 CHF

### QR-Facture obligatoire
- Obligatoire depuis octobre 2022
- Adresses structurées obligatoires depuis novembre 2025
- Format ISO 20022

## Structure du Module

### Fichiers à créer
```
src/backend/services/collection/
├── collection.service.js       # Service principal recouvrement
├── reminder.service.js         # Gestion des rappels
├── interest-calculator.js      # Calcul intérêts moratoires
├── lp-integration.service.js   # Intégration e-LP (poursuites)
└── index.js

src/backend/api/collection/
├── collection.routes.js
└── index.js

src/frontend/src/portals/superadmin/collection/
├── components/
│   ├── CollectionDashboard.jsx
│   ├── ReminderTimeline.jsx
│   ├── DebtorsList.jsx
│   ├── InterestCalculator.jsx
│   └── LPStatusTracker.jsx
├── hooks/
│   └── useCollectionData.js
├── services/
│   └── collectionApi.js
└── index.js
```

## Fichier 1: collection.service.js

```javascript
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
```


## Fichier 2: interest-calculator.js

```javascript
/**
 * Calculateur d'intérêts moratoires - Droit Suisse
 * 
 * Art. 104 CO : Taux légal 5% par an
 * Art. 104 al. 2 CO : Taux contractuel supérieur possible
 */

// Taux légal suisse (inchangé depuis 1912)
const LEGAL_INTEREST_RATE = 5; // %

// Jours dans une année (convention bancaire)
const DAYS_IN_YEAR = 365;

class InterestCalculator {
  /**
   * Calculer les intérêts moratoires
   * @param {number} principal - Montant principal
   * @param {number} rate - Taux annuel en % (défaut: 5%)
   * @param {number} days - Nombre de jours de retard
   * @returns {number} Intérêts calculés
   */
  calculate(principal, rate = LEGAL_INTEREST_RATE, days) {
    if (principal <= 0 || days <= 0) return 0;
    
    // Formule : Principal × Taux × Jours / 365
    const interest = (principal * (rate / 100) * days) / DAYS_IN_YEAR;
    
    // Arrondir à 2 décimales (centimes)
    return Math.round(interest * 100) / 100;
  }

  /**
   * Calculer les intérêts entre deux dates
   * @param {number} principal - Montant principal
   * @param {number} rate - Taux annuel en %
   * @param {Date|string} startDate - Date de début (mise en demeure)
   * @param {Date|string} endDate - Date de fin (paiement)
   * @returns {object} Détails du calcul
   */
  calculateBetweenDates(principal, rate, startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const days = Math.floor((end - start) / (1000 * 60 * 60 * 24));
    const interest = this.calculate(principal, rate, days);
    
    return {
      principal,
      rate,
      start_date: start.toISOString().split('T')[0],
      end_date: end.toISOString().split('T')[0],
      days,
      interest,
      total: principal + interest
    };
  }

  /**
   * Générer le détail des intérêts pour une facture
   * Utile pour le document de mise en demeure
   * @param {object} invoice - Données de la facture
   * @param {Date|string} calculationDate - Date de calcul
   * @returns {object} Détail complet des intérêts
   */
  generateInterestStatement(invoice, calculationDate = new Date()) {
    const dueDate = new Date(invoice.due_date);
    const calcDate = new Date(calculationDate);
    
    // Vérifier si en retard
    if (calcDate <= dueDate) {
      return {
        is_overdue: false,
        principal: invoice.amount,
        interest: 0,
        total: invoice.amount,
        message: 'Facture dans les délais de paiement'
      };
    }

    const days = Math.floor((calcDate - dueDate) / (1000 * 60 * 60 * 24));
    const rate = invoice.contractual_interest_rate || LEGAL_INTEREST_RATE;
    const interest = this.calculate(invoice.amount, rate, days);

    return {
      is_overdue: true,
      invoice_number: invoice.number,
      invoice_date: invoice.date,
      due_date: invoice.due_date,
      calculation_date: calcDate.toISOString().split('T')[0],
      days_overdue: days,
      principal: invoice.amount,
      interest_rate: rate,
      interest_rate_type: invoice.contractual_interest_rate ? 'contractual' : 'legal',
      interest: interest,
      total: invoice.amount + interest,
      legal_reference: 'Art. 104 CO - Intérêts moratoires',
      calculation_formula: `${invoice.amount} CHF × ${rate}% × ${days} jours / 365 = ${interest} CHF`
    };
  }

  /**
   * Calculer les intérêts composés (mensuel)
   * Pour les situations de long retard
   */
  calculateCompound(principal, annualRate, months) {
    const monthlyRate = annualRate / 100 / 12;
    const amount = principal * Math.pow(1 + monthlyRate, months);
    return Math.round((amount - principal) * 100) / 100;
  }

  /**
   * Vérifier si un taux est acceptable (non usuraire)
   * Art. 157 CP : L'usure est punissable
   */
  isRateAcceptable(rate) {
    // Seuil généralement accepté en B2B
    const MAX_B2B_RATE = 15;
    // Seuil scruté par les tribunaux
    const SCRUTINY_THRESHOLD = 18;

    if (rate <= LEGAL_INTEREST_RATE) {
      return { acceptable: true, level: 'legal', message: 'Taux légal' };
    } else if (rate <= 10) {
      return { acceptable: true, level: 'standard', message: 'Taux B2B standard' };
    } else if (rate <= MAX_B2B_RATE) {
      return { acceptable: true, level: 'elevated', message: 'Taux élevé mais acceptable' };
    } else if (rate <= SCRUTINY_THRESHOLD) {
      return { acceptable: true, level: 'risky', message: 'Risque de contestation' };
    } else {
      return { acceptable: false, level: 'usurious', message: 'Risque usure (art. 157 CP)' };
    }
  }
}

export const interestCalculator = new InterestCalculator();
export default interestCalculator;
```

## Fichier 3: reminder.service.js

```javascript
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
```


## Fichier 4: lp-integration.service.js

```javascript
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
      const (await import('./collection.service.js')).collectionService;
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
```

## Fichier 5: src/backend/api/collection/collection.routes.js

```javascript
/**
 * Routes API Recouvrement
 */

import express from 'express';
import { collectionService } from '../../services/collection/collection.service.js';
import { lpIntegrationService } from '../../services/collection/lp-integration.service.js';
import { interestCalculator } from '../../services/collection/interest-calculator.js';
import { authMiddleware, companyAccessMiddleware } from '../../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

// ==================== ROUTES RECOUVREMENT ====================

/**
 * POST /api/collection/initialize/:invoiceId
 * Initialiser le suivi de recouvrement pour une facture
 */
router.post('/initialize/:invoiceId', companyAccessMiddleware, async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const tracking = await collectionService.initializeCollection(invoiceId);
    res.status(201).json(tracking);
  } catch (error) {
    console.error('Erreur initialisation recouvrement:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/collection/process
 * Traiter le workflow de recouvrement (cron job)
 */
router.post('/process', async (req, res) => {
  try {
    const { owner_company } = req.body;
    const results = await collectionService.processCollectionWorkflow(owner_company);
    res.json(results);
  } catch (error) {
    console.error('Erreur traitement recouvrement:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/collection/dashboard/:company
 * Obtenir le tableau de bord de recouvrement
 */
router.get('/dashboard/:company', companyAccessMiddleware, async (req, res) => {
  try {
    const { company } = req.params;
    const dashboard = await collectionService.getCollectionDashboard(company);
    res.json(dashboard);
  } catch (error) {
    console.error('Erreur dashboard recouvrement:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/collection/:trackingId/payment
 * Enregistrer un paiement
 */
router.post('/:trackingId/payment', companyAccessMiddleware, async (req, res) => {
  try {
    const { trackingId } = req.params;
    const result = await collectionService.recordPayment(trackingId, req.body);
    res.json(result);
  } catch (error) {
    console.error('Erreur enregistrement paiement:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/collection/:trackingId/suspend
 * Suspendre le recouvrement
 */
router.post('/:trackingId/suspend', companyAccessMiddleware, async (req, res) => {
  try {
    const { trackingId } = req.params;
    const { reason } = req.body;
    const result = await collectionService.suspendCollection(trackingId, reason);
    res.json(result);
  } catch (error) {
    console.error('Erreur suspension:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/collection/:trackingId/resume
 * Reprendre le recouvrement
 */
router.post('/:trackingId/resume', companyAccessMiddleware, async (req, res) => {
  try {
    const { trackingId } = req.params;
    const result = await collectionService.resumeCollection(trackingId);
    res.json(result);
  } catch (error) {
    console.error('Erreur reprise:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/collection/:trackingId/write-off
 * Passer en perte
 */
router.post('/:trackingId/write-off', companyAccessMiddleware, async (req, res) => {
  try {
    const { trackingId } = req.params;
    const { reason } = req.body;
    const result = await collectionService.writeOffDebt(trackingId, reason);
    res.json(result);
  } catch (error) {
    console.error('Erreur passage en perte:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/collection/:trackingId/history
 * Historique d'un recouvrement
 */
router.get('/:trackingId/history', companyAccessMiddleware, async (req, res) => {
  try {
    const { trackingId } = req.params;
    const history = await collectionService.getCollectionHistory(trackingId);
    res.json(history);
  } catch (error) {
    console.error('Erreur historique:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== ROUTES CALCUL INTÉRÊTS ====================

/**
 * POST /api/collection/calculate-interest
 * Calculer les intérêts moratoires
 */
router.post('/calculate-interest', async (req, res) => {
  try {
    const { principal, rate, days, start_date, end_date } = req.body;

    let result;
    if (start_date && end_date) {
      result = interestCalculator.calculateBetweenDates(principal, rate, start_date, end_date);
    } else {
      result = {
        principal,
        rate: rate || 5,
        days,
        interest: interestCalculator.calculate(principal, rate, days),
        total: principal + interestCalculator.calculate(principal, rate, days)
      };
    }

    res.json(result);
  } catch (error) {
    console.error('Erreur calcul intérêts:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/collection/rate-check/:rate
 * Vérifier si un taux d'intérêt est acceptable
 */
router.get('/rate-check/:rate', async (req, res) => {
  try {
    const rate = parseFloat(req.params.rate);
    const result = interestCalculator.isRateAcceptable(rate);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ==================== ROUTES LP (POURSUITES) ====================

/**
 * POST /api/collection/lp/initiate/:trackingId
 * Initier une poursuite LP
 */
router.post('/lp/initiate/:trackingId', companyAccessMiddleware, async (req, res) => {
  try {
    const { trackingId } = req.params;
    const tracking = await collectionService.directus.items('collection_tracking').readOne(trackingId);
    
    const lpCase = await lpIntegrationService.initiateRequisition(tracking);
    res.status(201).json(lpCase);
  } catch (error) {
    console.error('Erreur initiation LP:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/collection/lp/webhook
 * Webhook e-LP
 */
router.post('/lp/webhook', async (req, res) => {
  try {
    const result = await lpIntegrationService.handleELPWebhook(req.body);
    res.json(result);
  } catch (error) {
    console.error('Erreur webhook LP:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/collection/lp/:caseId
 * Statut d'un cas LP
 */
router.get('/lp/:caseId', companyAccessMiddleware, async (req, res) => {
  try {
    const { caseId } = req.params;
    const status = await lpIntegrationService.getLPCaseStatus(caseId);
    res.json(status);
  } catch (error) {
    console.error('Erreur statut LP:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/collection/lp/:caseId/continue
 * Demander la continuation de poursuite
 */
router.post('/lp/:caseId/continue', companyAccessMiddleware, async (req, res) => {
  try {
    const { caseId } = req.params;
    const result = await lpIntegrationService.requestContinuation(caseId);
    res.json(result);
  } catch (error) {
    console.error('Erreur continuation LP:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/collection/lp/stats/:company
 * Statistiques LP pour une entreprise
 */
router.get('/lp/stats/:company', companyAccessMiddleware, async (req, res) => {
  try {
    const { company } = req.params;
    const stats = await lpIntegrationService.getLPStatistics(company);
    res.json(stats);
  } catch (error) {
    console.error('Erreur stats LP:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/collection/lp/fees/:amount
 * Calculer les frais LP pour un montant
 */
router.get('/lp/fees/:amount', async (req, res) => {
  try {
    const amount = parseFloat(req.params.amount);
    const fees = lpIntegrationService.calculateLPFees(amount);
    res.json({ claim_amount: amount, lp_fees: fees, total: amount + fees });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
```


## Collections Directus à créer

### Collection: collection_config
```json
{
  "collection": "collection_config",
  "fields": [
    { "field": "id", "type": "uuid", "primary": true },
    { "field": "owner_company", "type": "string", "unique": true },
    { "field": "reminder_1_delay", "type": "integer", "default": 10 },
    { "field": "reminder_2_delay", "type": "integer", "default": 25 },
    { "field": "formal_notice_delay", "type": "integer", "default": 40 },
    { "field": "lp_requisition_delay", "type": "integer", "default": 55 },
    { "field": "reminder_1_fee", "type": "decimal", "default": 0 },
    { "field": "reminder_2_fee", "type": "decimal", "default": 20 },
    { "field": "formal_notice_fee", "type": "decimal", "default": 30 },
    { "field": "interest_rate", "type": "decimal", "default": 5 },
    { "field": "contractual_rate", "type": "decimal" },
    { "field": "minimum_collection_amount", "type": "decimal", "default": 100 },
    { "field": "auto_lp_threshold", "type": "decimal", "default": 1000 },
    { "field": "updated_at", "type": "timestamp" }
  ]
}
```

### Collection: collection_tracking
```json
{
  "collection": "collection_tracking",
  "fields": [
    { "field": "id", "type": "uuid", "primary": true },
    { "field": "invoice_id", "type": "uuid", "required": true },
    { "field": "owner_company", "type": "string", "required": true },
    { "field": "client_id", "type": "uuid", "required": true },
    { "field": "original_amount", "type": "decimal", "required": true },
    { "field": "current_amount", "type": "decimal" },
    { "field": "interest_accrued", "type": "decimal", "default": 0 },
    { "field": "fees_accrued", "type": "decimal", "default": 0 },
    { "field": "paid_amount", "type": "decimal", "default": 0 },
    { "field": "due_date", "type": "date", "required": true },
    { "field": "status", "type": "string", "default": "current" },
    { "field": "created_at", "type": "timestamp" },
    { "field": "workflow_started", "type": "boolean", "default": false },
    { "field": "reminders_sent", "type": "integer", "default": 0 },
    { "field": "last_action_date", "type": "timestamp" },
    { "field": "next_action_date", "type": "date" },
    { "field": "paid_at", "type": "timestamp" },
    { "field": "suspended_at", "type": "timestamp" },
    { "field": "suspension_reason", "type": "string" },
    { "field": "written_off_at", "type": "timestamp" },
    { "field": "written_off_reason", "type": "string" },
    { "field": "written_off_amount", "type": "decimal" }
  ]
}
```

### Collection: collection_reminders
```json
{
  "collection": "collection_reminders",
  "fields": [
    { "field": "id", "type": "uuid", "primary": true },
    { "field": "tracking_id", "type": "uuid", "required": true },
    { "field": "invoice_id", "type": "uuid" },
    { "field": "owner_company", "type": "string" },
    { "field": "level", "type": "integer" },
    { "field": "type", "type": "string" },
    { "field": "content", "type": "text" },
    { "field": "amount_due", "type": "decimal" },
    { "field": "sent_at", "type": "timestamp" },
    { "field": "sent_via", "type": "string" },
    { "field": "recipient_email", "type": "string" },
    { "field": "recipient_address", "type": "text" }
  ]
}
```

### Collection: collection_payments
```json
{
  "collection": "collection_payments",
  "fields": [
    { "field": "id", "type": "uuid", "primary": true },
    { "field": "tracking_id", "type": "uuid", "required": true },
    { "field": "amount", "type": "decimal", "required": true },
    { "field": "payment_date", "type": "timestamp" },
    { "field": "payment_method", "type": "string" },
    { "field": "reference", "type": "string" },
    { "field": "created_at", "type": "timestamp" }
  ]
}
```

### Collection: collection_events
```json
{
  "collection": "collection_events",
  "fields": [
    { "field": "id", "type": "uuid", "primary": true },
    { "field": "tracking_id", "type": "uuid" },
    { "field": "invoice_id", "type": "uuid" },
    { "field": "owner_company", "type": "string" },
    { "field": "event_type", "type": "string" },
    { "field": "metadata", "type": "json" },
    { "field": "timestamp", "type": "timestamp" }
  ]
}
```

### Collection: lp_cases
```json
{
  "collection": "lp_cases",
  "fields": [
    { "field": "id", "type": "uuid", "primary": true },
    { "field": "tracking_id", "type": "uuid" },
    { "field": "invoice_id", "type": "uuid" },
    { "field": "owner_company", "type": "string" },
    { "field": "office_code", "type": "string" },
    { "field": "office_name", "type": "string" },
    { "field": "claim_amount", "type": "decimal" },
    { "field": "lp_fees", "type": "decimal" },
    { "field": "total_claim", "type": "decimal" },
    { "field": "status", "type": "string" },
    { "field": "requisition_data", "type": "json" },
    { "field": "elp_reference", "type": "string" },
    { "field": "elp_submission_date", "type": "timestamp" },
    { "field": "elp_status", "type": "string" },
    { "field": "elp_error", "type": "string" },
    { "field": "commandment_number", "type": "string" },
    { "field": "commandment_date", "type": "date" },
    { "field": "notification_date", "type": "date" },
    { "field": "opposition_deadline", "type": "date" },
    { "field": "payment_deadline", "type": "date" },
    { "field": "opposition_date", "type": "date" },
    { "field": "opposition_reason", "type": "string" },
    { "field": "payment_date", "type": "date" },
    { "field": "payment_amount", "type": "decimal" },
    { "field": "continuation_requested_at", "type": "timestamp" },
    { "field": "created_at", "type": "timestamp" },
    { "field": "last_update", "type": "timestamp" }
  ]
}
```

### Collection: lp_events
```json
{
  "collection": "lp_events",
  "fields": [
    { "field": "id", "type": "uuid", "primary": true },
    { "field": "lp_case_id", "type": "uuid" },
    { "field": "event_type", "type": "string" },
    { "field": "metadata", "type": "json" },
    { "field": "timestamp", "type": "timestamp" }
  ]
}
```

### Collection: lp_documents
```json
{
  "collection": "lp_documents",
  "fields": [
    { "field": "id", "type": "uuid", "primary": true },
    { "field": "lp_case_id", "type": "uuid" },
    { "field": "document_type", "type": "string" },
    { "field": "filename", "type": "string" },
    { "field": "content", "type": "text" },
    { "field": "created_at", "type": "timestamp" }
  ]
}
```

### Collection: registered_mail_queue
```json
{
  "collection": "registered_mail_queue",
  "fields": [
    { "field": "id", "type": "uuid", "primary": true },
    { "field": "notice_id", "type": "uuid" },
    { "field": "recipient_name", "type": "string" },
    { "field": "recipient_company", "type": "string" },
    { "field": "recipient_address", "type": "text" },
    { "field": "content", "type": "text" },
    { "field": "status", "type": "string", "default": "pending" },
    { "field": "tracking_number", "type": "string" },
    { "field": "sent_at", "type": "timestamp" },
    { "field": "delivered_at", "type": "timestamp" },
    { "field": "created_at", "type": "timestamp" }
  ]
}
```

## Variables d'environnement requises

```bash
# API e-LP (poursuites électroniques)
ELP_API_URL=https://api.elp.ch
ELP_API_KEY=your_elp_api_key

# Webhook callback
COLLECTION_WEBHOOK_SECRET=your_webhook_secret
```

## Cron Jobs à configurer

```javascript
// Dans server.js ou via système cron externe

import cron from 'node-cron';
import { collectionService } from './services/collection/collection.service.js';

// Traitement quotidien du recouvrement (8h00)
cron.schedule('0 8 * * *', async () => {
  console.log('Démarrage traitement recouvrement quotidien...');
  const results = await collectionService.processCollectionWorkflow();
  console.log('Recouvrement traité:', results);
});

// Vérification péremption LP (tous les lundis 9h00)
cron.schedule('0 9 * * 1', async () => {
  console.log('Vérification péremption LP...');
  // Vérifier les cas LP approchant de la péremption
});
```

## Instructions pour Claude Code

### Étape 1: Créer le module Collection
1. Créer le dossier `src/backend/services/collection/`
2. Créer `collection.service.js` (service principal)
3. Créer `interest-calculator.js` (calcul intérêts)
4. Créer `reminder.service.js` (gestion rappels)
5. Créer `lp-integration.service.js` (intégration poursuites)
6. Créer `index.js` pour les exports

### Étape 2: Créer les routes API
1. Créer le dossier `src/backend/api/collection/`
2. Créer `collection.routes.js`
3. Créer `index.js`
4. Mettre à jour `server.js` pour inclure les routes

### Étape 3: Créer les collections Directus
- collection_config
- collection_tracking
- collection_reminders
- collection_payments
- collection_events
- lp_cases
- lp_events
- lp_documents
- registered_mail_queue

### Étape 4: Configurer les cron jobs
Ajouter les tâches planifiées dans server.js

### Étape 5: Tests
1. Tester le calcul des intérêts
2. Tester le workflow de rappels
3. Tester l'initialisation du suivi

## Rapport à créer: RAPPORT-10-RECOUVREMENT-AUTOMATISE.md

---

## 🎯 RÉCAPITULATIF MODULE FINANCE COMPLET (PROMPTS 1-10)

| Prompt | Service | Description |
|--------|---------|-------------|
| 1 | unified-invoice.service.js | Facturation unifiée client/fournisseur |
| 2 | pdf-generator.service.js | Génération PDF avec templates |
| 3 | bank-reconciliation.service.js | Rapprochement bancaire automatique |
| 4 | ocr-to-accounting.service.js | OCR et comptabilisation |
| 5 | finance-dashboard.service.js | Agrégation KPIs |
| 6 | finance.routes.js | Endpoints API Finance |
| 7 | Composants React | Frontend dashboard Finance |
| 8 | finance-orchestrator.service.js | Orchestration et workflows |
| **9** | **cgv.service.js + signature.service.js** | **CGV et signature électronique** |
| **10** | **collection.service.js + LP** | **Recouvrement automatisé suisse** |

## Architecture finale complète

```
src/backend/
├── api/
│   ├── finance/
│   │   ├── finance.routes.js
│   │   └── index.js
│   ├── legal/                    # PROMPT 9
│   │   ├── legal.routes.js
│   │   └── index.js
│   └── collection/               # PROMPT 10
│       ├── collection.routes.js
│       └── index.js
└── services/
    ├── finance/
    │   ├── unified-invoice.service.js
    │   ├── pdf-generator.service.js
    │   ├── bank-reconciliation.service.js
    │   ├── ocr-to-accounting.service.js
    │   ├── finance-dashboard.service.js
    │   ├── finance-orchestrator.service.js
    │   └── index.js
    ├── legal/                    # PROMPT 9
    │   ├── cgv.service.js
    │   ├── signature.service.js
    │   ├── documents-legal.service.js
    │   └── index.js
    └── collection/               # PROMPT 10
        ├── collection.service.js
        ├── interest-calculator.js
        ├── reminder.service.js
        ├── lp-integration.service.js
        └── index.js

src/frontend/src/portals/superadmin/
├── finance/
│   ├── FinanceDashboard.jsx
│   ├── components/
│   ├── hooks/
│   └── services/
├── legal/                        # PROMPT 9
│   ├── LegalDashboard.jsx
│   ├── components/
│   └── ...
└── collection/                   # PROMPT 10
    ├── CollectionDashboard.jsx
    ├── components/
    └── ...
```

## Collections Directus totales pour le module Finance

### Existantes (Prompts 1-8)
- client_invoices
- supplier_invoices
- payments
- bank_transactions
- bank_accounts
- reconciliations
- ocr_documents
- accounting_entries

### Nouvelles (Prompt 9)
- cgv_documents
- cgv_acceptances
- signature_requests
- signature_events
- signed_documents

### Nouvelles (Prompt 10)
- collection_config
- collection_tracking
- collection_reminders
- collection_payments
- collection_events
- lp_cases
- lp_events
- lp_documents
- registered_mail_queue

**TOTAL: 17 nouvelles collections pour le module Finance complet**
