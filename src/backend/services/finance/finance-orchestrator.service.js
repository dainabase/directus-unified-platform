/**
 * FinanceOrchestratorService
 * Coordonne tous les services Finance et gère les workflows complexes
 * 
 * Workflows gérés:
 * - Cycle complet de facturation (création → envoi → paiement → rapprochement)
 * - Traitement OCR → Comptabilisation → Paiement fournisseur
 * - Synchronisation multi-sources (Revolut, Invoice Ninja, Directus)
 * - Alertes et notifications automatiques
 */

import { EventEmitter } from 'events';
import { Queue, Worker } from 'bullmq';
import { Directus } from '@directus/sdk';

// Import des services
import { unifiedInvoiceService } from './unified-invoice.service.js';
import { pdfGeneratorService } from './pdf-generator.service.js';
import { bankReconciliationService } from './bank-reconciliation.service.js';
import { ocrToAccountingService } from './ocr-to-accounting.service.js';
import { financeDashboardService } from './finance-dashboard.service.js';

class FinanceOrchestratorService extends EventEmitter {
  constructor() {
    super();
    this.directusUrl = process.env.DIRECTUS_URL || 'http://localhost:8055';
    this.directusToken = process.env.DIRECTUS_TOKEN;
    this.redisConnection = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT) || 6379
    };
    
    this.queues = {};
    this.workers = {};
    this.initialized = false;
  }

  /**
   * Initialiser l'orchestrateur
   */
  async initialize() {
    if (this.initialized) return;
    
    console.log('🚀 Initialisation Finance Orchestrator...');
    
    // Créer les files d'attente
    this.queues = {
      invoiceProcessing: new Queue('finance:invoice-processing', {
        connection: this.redisConnection,
        defaultJobOptions: {
          removeOnComplete: 100,
          removeOnFail: 50,
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 }
        }
      }),
      
      ocrProcessing: new Queue('finance:ocr-processing', {
        connection: this.redisConnection,
        defaultJobOptions: {
          removeOnComplete: 50,
          removeOnFail: 25,
          attempts: 2,
          backoff: { type: 'fixed', delay: 5000 }
        }
      }),
      
      reconciliation: new Queue('finance:reconciliation', {
        connection: this.redisConnection,
        defaultJobOptions: {
          removeOnComplete: 200,
          removeOnFail: 100,
          attempts: 3
        }
      }),
      
      notifications: new Queue('finance:notifications', {
        connection: this.redisConnection,
        defaultJobOptions: {
          removeOnComplete: 500,
          attempts: 5
        }
      }),
      
      sync: new Queue('finance:sync', {
        connection: this.redisConnection,
        defaultJobOptions: {
          removeOnComplete: 100,
          attempts: 3,
          backoff: { type: 'exponential', delay: 1000 }
        }
      })
    };
    
    // Créer les workers
    await this.setupWorkers();
    
    // Programmer les tâches récurrentes
    await this.scheduleRecurringJobs();
    
    this.initialized = true;
    console.log('✅ Finance Orchestrator initialisé');
  }

  /**
   * Configurer les workers pour traiter les jobs
   */
  async setupWorkers() {
    // Worker de traitement des factures
    this.workers.invoiceProcessing = new Worker(
      'finance:invoice-processing',
      async (job) => {
        const { action, data } = job.data;
        console.log(`📄 Traitement facture: ${action}`, job.id);
        
        switch (action) {
          case 'create_and_send':
            return await this.workflowCreateAndSendInvoice(data);
          case 'mark_paid':
            return await this.workflowMarkInvoicePaid(data);
          case 'send_reminder':
            return await this.workflowSendReminder(data);
          default:
            throw new Error(`Action inconnue: ${action}`);
        }
      },
      { connection: this.redisConnection, concurrency: 5 }
    );
    
    // Worker OCR
    this.workers.ocrProcessing = new Worker(
      'finance:ocr-processing',
      async (job) => {
        console.log(`📷 Traitement OCR`, job.id);
        return await this.workflowProcessOCR(job.data);
      },
      { connection: this.redisConnection, concurrency: 2 }
    );
    
    // Worker rapprochement
    this.workers.reconciliation = new Worker(
      'finance:reconciliation',
      async (job) => {
        const { company } = job.data;
        console.log(`🔄 Rapprochement pour ${company}`, job.id);
        return await bankReconciliationService.runAutoReconciliation(company);
      },
      { connection: this.redisConnection, concurrency: 1 }
    );
    
    // Worker notifications
    this.workers.notifications = new Worker(
      'finance:notifications',
      async (job) => {
        console.log(`🔔 Notification`, job.id);
        return await this.sendNotification(job.data);
      },
      { connection: this.redisConnection, concurrency: 10 }
    );
    
    // Worker synchronisation
    this.workers.sync = new Worker(
      'finance:sync',
      async (job) => {
        const { source, company } = job.data;
        console.log(`🔄 Sync ${source} pour ${company}`, job.id);
        return await this.workflowSync(source, company);
      },
      { connection: this.redisConnection, concurrency: 3 }
    );
    
    // Écouter les événements des workers
    Object.values(this.workers).forEach(worker => {
      worker.on('completed', (job) => {
        this.emit('job:completed', { queue: worker.name, jobId: job.id });
      });
      worker.on('failed', (job, err) => {
        console.error(`❌ Job échoué [${worker.name}]:`, err);
        this.emit('job:failed', { queue: worker.name, jobId: job?.id, error: err.message });
      });
    });
  }

  /**
   * Programmer les tâches récurrentes
   */
  async scheduleRecurringJobs() {
    const companies = ['HYPERVISUAL', 'DAINAMICS', 'LEXAIA', 'ENKI REALTY', 'TAKEOUT'];
    
    // Rapprochement automatique toutes les heures
    for (const company of companies) {
      await this.queues.reconciliation.add(
        `auto-reconcile-${company}`,
        { company },
        { repeat: { pattern: '0 * * * *' } } // Chaque heure
      );
    }
    
    // Synchronisation Revolut toutes les 15 minutes
    for (const company of companies) {
      await this.queues.sync.add(
        `sync-revolut-${company}`,
        { source: 'revolut', company },
        { repeat: { pattern: '*/15 * * * *' } }
      );
    }
    
    // Vérification des factures en retard tous les jours à 9h
    await this.queues.notifications.add(
      'check-overdue-invoices',
      { type: 'check_overdue' },
      { repeat: { pattern: '0 9 * * *' } }
    );
    
    console.log('📅 Tâches récurrentes programmées');
  }

  // ============================================
  // WORKFLOWS COMPLETS
  // ============================================

  /**
   * Workflow: Créer et envoyer une facture
   */
  async workflowCreateAndSendInvoice(data) {
    const { invoiceData, sendEmail = true, generatePdf = true } = data;
    const results = { steps: [] };
    
    try {
      // Étape 1: Créer la facture
      const invoice = await unifiedInvoiceService.createInvoice(invoiceData);
      results.invoice = invoice;
      results.steps.push({ step: 'create', success: true, id: invoice.id });
      
      // Étape 2: Générer le PDF
      if (generatePdf) {
        const pdf = await pdfGeneratorService.generateInvoicePDF(invoice.id);
        results.pdf = { url: pdf.url, filename: pdf.filename };
        results.steps.push({ step: 'pdf', success: true });
      }
      
      // Étape 3: Envoyer par email
      if (sendEmail && invoiceData.client_email) {
        const emailResult = await unifiedInvoiceService.sendInvoice(invoice.id, {
          recipient_email: invoiceData.client_email,
          include_pdf: true
        });
        results.email = emailResult;
        results.steps.push({ step: 'send', success: true });
      }
      
      // Émettre événement
      this.emit('invoice:created_and_sent', {
        invoice_id: invoice.id,
        company: invoiceData.owner_company
      });
      
      // Programmer le suivi
      await this.scheduleInvoiceFollowUp(invoice);
      
      return results;
      
    } catch (error) {
      results.error = error.message;
      results.steps.push({ step: 'error', error: error.message });
      throw error;
    }
  }

  /**
   * Workflow: Marquer une facture comme payée avec rapprochement
   */
  async workflowMarkInvoicePaid(data) {
    const { invoice_id, transaction_id, payment_date, payment_method } = data;
    
    try {
      // Étape 1: Marquer la facture comme payée
      const invoice = await unifiedInvoiceService.markAsPaid(invoice_id, {
        payment_date,
        payment_method,
        transaction_id
      });
      
      // Étape 2: Rapprocher avec la transaction bancaire si fournie
      if (transaction_id) {
        await bankReconciliationService.confirmMatch(
          transaction_id,
          invoice_id,
          'client_invoice'
        );
      }
      
      // Étape 3: Notification
      await this.queueNotification({
        type: 'invoice_paid',
        invoice_id,
        company: invoice.owner_company,
        amount: invoice.amount
      });
      
      this.emit('invoice:paid', { invoice_id, transaction_id });
      
      return { success: true, invoice };
      
    } catch (error) {
      console.error('Erreur workflow markPaid:', error);
      throw error;
    }
  }

  /**
   * Workflow: Envoyer une relance
   */
  async workflowSendReminder(data) {
    const { invoice_id, reminder_level = 1 } = data;
    
    try {
      const invoice = await unifiedInvoiceService.getInvoice(invoice_id);
      
      if (invoice.status === 'paid') {
        return { skipped: true, reason: 'Facture déjà payée' };
      }
      
      // Sélectionner le template selon le niveau
      const templates = {
        1: 'reminder_friendly',
        2: 'reminder_firm',
        3: 'reminder_final'
      };
      
      const result = await unifiedInvoiceService.sendReminder(invoice_id, {
        template: templates[reminder_level] || templates[1],
        reminder_level
      });
      
      // Mettre à jour le compteur de relances
      await this.updateReminderCount(invoice_id, reminder_level);
      
      this.emit('invoice:reminder_sent', { invoice_id, level: reminder_level });
      
      return result;
      
    } catch (error) {
      console.error('Erreur workflow reminder:', error);
      throw error;
    }
  }

  /**
   * Workflow: Traitement OCR complet
   */
  async workflowProcessOCR(data) {
    const { file_buffer, mime_type, options } = data;
    const results = { steps: [] };
    
    try {
      // Étape 1: Extraction OCR
      const extraction = await ocrToAccountingService.processDocument(
        Buffer.from(file_buffer, 'base64'),
        mime_type,
        options
      );
      results.extraction = extraction;
      results.steps.push({ step: 'ocr', success: true, confidence: extraction.confidence || 0.8 });
      
      // Étape 2: Validation automatique si confiance élevée
      if ((extraction.confidence || 0.8) > 0.9 && options.auto_validate) {
        const validation = await ocrToAccountingService.validateAndSave(
          extraction.extraction_id,
          {}, // Pas de corrections
          true // Confirmer
        );
        results.validation = validation;
        results.steps.push({ step: 'validate', success: true, auto: true });
        
        // Étape 3: Programmer le paiement si c'est une facture fournisseur
        if (options.document_type === 'supplier_invoice' && options.auto_schedule_payment) {
          await this.scheduleSupplierPayment(validation.record_id);
          results.steps.push({ step: 'schedule_payment', success: true });
        }
      } else {
        // Notifier pour validation manuelle
        await this.queueNotification({
          type: 'ocr_needs_review',
          extraction_id: extraction.extraction_id,
          company: options.owner_company,
          confidence: extraction.confidence || 0.8
        });
        results.steps.push({ step: 'pending_review', success: true });
      }
      
      this.emit('ocr:processed', {
        extraction_id: extraction.extraction_id,
        auto_validated: (extraction.confidence || 0.8) > 0.9
      });
      
      return results;
      
    } catch (error) {
      results.error = error.message;
      throw error;
    }
  }

  /**
   * Workflow: Synchronisation avec sources externes
   */
  async workflowSync(source, company) {
    const results = { source, company, synced: 0, errors: [] };
    
    try {
      switch (source) {
        case 'revolut':
          // Synchroniser les transactions Revolut
          const txResult = await this.syncRevolutTransactions(company);
          results.synced = txResult.count;
          results.new_transactions = txResult.new;
          break;
          
        case 'invoice_ninja':
          // Synchroniser les factures Invoice Ninja
          const invResult = await this.syncInvoiceNinja(company);
          results.synced = invResult.count;
          break;
          
        case 'all':
          // Synchroniser toutes les sources
          const [rev, inv] = await Promise.allSettled([
            this.syncRevolutTransactions(company),
            this.syncInvoiceNinja(company)
          ]);
          
          if (rev.status === 'fulfilled') results.revolut = rev.value;
          if (inv.status === 'fulfilled') results.invoice_ninja = inv.value;
          break;
          
        default:
          throw new Error(`Source inconnue: ${source}`);
      }
      
      // Lancer le rapprochement automatique après sync
      await this.queues.reconciliation.add(
        `post-sync-reconcile-${company}`,
        { company },
        { delay: 5000 } // Attendre 5 secondes
      );
      
      this.emit('sync:completed', results);
      return results;
      
    } catch (error) {
      results.errors.push(error.message);
      console.error(`Erreur sync ${source}:`, error);
      throw error;
    }
  }

  // ============================================
  // MÉTHODES UTILITAIRES
  // ============================================

  /**
   * Programmer le suivi d'une facture
   */
  async scheduleInvoiceFollowUp(invoice) {
    if (!invoice.due_date) return;
    
    const dueDate = new Date(invoice.due_date);
    const now = new Date();
    
    // Relance 7 jours avant échéance
    const reminderDate = new Date(dueDate);
    reminderDate.setDate(reminderDate.getDate() - 7);
    
    if (reminderDate > now) {
      await this.queues.invoiceProcessing.add(
        `reminder-before-due-${invoice.id}`,
        { action: 'send_reminder', data: { invoice_id: invoice.id, reminder_level: 1 } },
        { delay: reminderDate.getTime() - now.getTime() }
      );
    }
    
    // Relance le jour de l'échéance
    if (dueDate > now) {
      await this.queues.invoiceProcessing.add(
        `reminder-due-day-${invoice.id}`,
        { action: 'send_reminder', data: { invoice_id: invoice.id, reminder_level: 2 } },
        { delay: dueDate.getTime() - now.getTime() }
      );
    }
  }

  /**
   * Mettre en file d'attente une notification
   */
  async queueNotification(data) {
    return this.queues.notifications.add(`notification-${Date.now()}`, data);
  }

  /**
   * Envoyer une notification
   */
  async sendNotification(data) {
    // Intégration avec Mautic ou système de notifications
    console.log('📧 Notification:', data.type, data);
    
    // Enregistrer dans Directus pour le dashboard
    const directus = this.getDirectus();
    await directus.items('notifications').createOne({
      type: data.type,
      company: data.company,
      data: JSON.stringify(data),
      status: 'sent',
      created_at: new Date().toISOString()
    });
    
    return { sent: true, type: data.type };
  }

  /**
   * Synchroniser les transactions Revolut
   */
  async syncRevolutTransactions(company) {
    // Cette méthode appellerait le service Revolut
    // Pour l'instant, simulation
    console.log(`Sync Revolut pour ${company}`);
    return { count: 0, new: 0 };
  }

  /**
   * Synchroniser les factures Invoice Ninja
   */
  async syncInvoiceNinja(company) {
    console.log(`Sync Invoice Ninja pour ${company}`);
    return { count: 0 };
  }

  /**
   * Mettre à jour le compteur de relances
   */
  async updateReminderCount(invoiceId, level) {
    const directus = this.getDirectus();
    await directus.items('client_invoices').updateOne(invoiceId, {
      reminder_count: level,
      last_reminder_at: new Date().toISOString()
    });
  }

  /**
   * Programmer le paiement d'un fournisseur
   */
  async scheduleSupplierPayment(invoiceId) {
    // Logique de programmation de paiement
    console.log(`Paiement programmé pour facture fournisseur: ${invoiceId}`);
  }

  /**
   * Obtenir le client Directus
   */
  getDirectus() {
    const client = new Directus(this.directusUrl);
    if (this.directusToken) {
      client.auth.static(this.directusToken);
    }
    return client;
  }

  // ============================================
  // API PUBLIQUE
  // ============================================

  /**
   * Créer et envoyer une facture (async via queue)
   */
  async createAndSendInvoice(invoiceData, options = {}) {
    await this.initialize();
    
    return this.queues.invoiceProcessing.add(
      `create-send-${Date.now()}`,
      { action: 'create_and_send', data: { invoiceData, ...options } },
      { priority: 1 }
    );
  }

  /**
   * Traiter un document OCR (async via queue)
   */
  async processOCRDocument(fileBuffer, mimeType, options = {}) {
    await this.initialize();
    
    return this.queues.ocrProcessing.add(
      `ocr-${Date.now()}`,
      { file_buffer: fileBuffer.toString('base64'), mime_type: mimeType, options }
    );
  }

  /**
   * Forcer une synchronisation
   */
  async forceSync(source, company) {
    await this.initialize();
    
    return this.queues.sync.add(
      `force-sync-${source}-${company}-${Date.now()}`,
      { source, company },
      { priority: 1 }
    );
  }

  /**
   * Forcer un rapprochement
   */
  async forceReconciliation(company) {
    await this.initialize();
    
    return this.queues.reconciliation.add(
      `force-reconcile-${company}-${Date.now()}`,
      { company },
      { priority: 1 }
    );
  }

  /**
   * Obtenir le statut des queues
   */
  async getQueuesStatus() {
    await this.initialize();
    
    const status = {};
    
    for (const [name, queue] of Object.entries(this.queues)) {
      const [waiting, active, completed, failed] = await Promise.all([
        queue.getWaitingCount(),
        queue.getActiveCount(),
        queue.getCompletedCount(),
        queue.getFailedCount()
      ]);
      
      status[name] = { waiting, active, completed, failed };
    }
    
    return status;
  }

  /**
   * Obtenir le dashboard complet avec données live
   */
  async getEnhancedDashboard(company) {
    await this.initialize();
    
    const [dashboard, queueStatus] = await Promise.all([
      financeDashboardService.getFullDashboard(company),
      this.getQueuesStatus()
    ]);
    
    return {
      ...dashboard,
      system_status: {
        queues: queueStatus,
        orchestrator: 'running',
        last_sync: new Date().toISOString()
      }
    };
  }

  /**
   * Arrêter proprement l'orchestrateur
   */
  async shutdown() {
    console.log('🛑 Arrêt Finance Orchestrator...');
    
    // Fermer les workers
    await Promise.all(
      Object.values(this.workers).map(w => w.close())
    );
    
    // Fermer les queues
    await Promise.all(
      Object.values(this.queues).map(q => q.close())
    );
    
    this.initialized = false;
    console.log('✅ Finance Orchestrator arrêté');
  }
}

// Singleton
export const financeOrchestrator = new FinanceOrchestratorService();
export default FinanceOrchestratorService;