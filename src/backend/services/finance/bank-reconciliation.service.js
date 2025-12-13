/**
 * BankReconciliationService
 * Service de rapprochement bancaire automatique et manuel
 */

import { Directus } from '@directus/sdk';

class BankReconciliationService {
  constructor() {
    this.directusUrl = process.env.DIRECTUS_URL || 'http://localhost:8055';
    this.directusToken = process.env.DIRECTUS_TOKEN;
  }

  getDirectus() {
    const client = new Directus(this.directusUrl);
    if (this.directusToken) {
      client.auth.static(this.directusToken);
    }
    return client;
  }

  /**
   * Lancer le rapprochement automatique
   */
  async autoReconcile(companyName) {
    const directus = this.getDirectus();
    
    console.log(`🔄 Début du rapprochement automatique pour ${companyName}`);
    
    // 1. Récupérer les transactions non rapprochées
    const transactions = await directus.items('bank_transactions').readMany({
      filter: {
        owner_company: { _eq: companyName },
        reconciled: { _eq: false }
      },
      sort: ['-date'],
      limit: 100
    });

    // 2. Récupérer les factures non payées
    const [clientInvoices, supplierInvoices] = await Promise.all([
      this.getUnpaidClientInvoices(directus, companyName),
      this.getUnpaidSupplierInvoices(directus, companyName)
    ]);

    const results = {
      processed: 0,
      auto_reconciled: 0,
      suggestions_created: 0,
      failed: 0,
      details: []
    };

    // 3. Traiter chaque transaction
    for (const transaction of transactions) {
      try {
        results.processed++;
        
        // Chercher correspondance avec factures clients (encaissement)
        if (transaction.amount > 0) {
          const match = await this.findBestMatch(transaction, clientInvoices, 'client_invoice');
          
          if (match.confidence >= 0.8) {
            // Rapprochement automatique
            await this.confirmReconciliation(directus, transaction.id, match.invoice, 'client_invoice');
            results.auto_reconciled++;
            results.details.push({
              transaction_id: transaction.id,
              action: 'auto_reconciled',
              invoice: match.invoice.invoice_number,
              confidence: match.confidence
            });
          } else if (match.confidence >= 0.5) {
            // Créer suggestion
            await this.createSuggestion(directus, transaction.id, match.invoice, 'client_invoice', match.confidence);
            results.suggestions_created++;
            results.details.push({
              transaction_id: transaction.id,
              action: 'suggestion_created',
              invoice: match.invoice.invoice_number,
              confidence: match.confidence
            });
          }
        }
        
        // Chercher correspondance avec factures fournisseurs (décaissement)
        else if (transaction.amount < 0) {
          const match = await this.findBestMatch(transaction, supplierInvoices, 'supplier_invoice');
          
          if (match.confidence >= 0.8) {
            await this.confirmReconciliation(directus, transaction.id, match.invoice, 'supplier_invoice');
            results.auto_reconciled++;
            results.details.push({
              transaction_id: transaction.id,
              action: 'auto_reconciled',
              invoice: match.invoice.invoice_number,
              confidence: match.confidence
            });
          } else if (match.confidence >= 0.5) {
            await this.createSuggestion(directus, transaction.id, match.invoice, 'supplier_invoice', match.confidence);
            results.suggestions_created++;
            results.details.push({
              transaction_id: transaction.id,
              action: 'suggestion_created',
              invoice: match.invoice.invoice_number,
              confidence: match.confidence
            });
          }
        }

      } catch (error) {
        results.failed++;
        console.error(`❌ Erreur rapprochement transaction ${transaction.id}:`, error.message);
        results.details.push({
          transaction_id: transaction.id,
          action: 'failed',
          error: error.message
        });
      }
    }

    console.log(`✅ Rapprochement terminé: ${results.auto_reconciled} automatiques, ${results.suggestions_created} suggestions`);
    return results;
  }

  /**
   * Trouver la meilleure correspondance pour une transaction
   */
  async findBestMatch(transaction, invoices, invoiceType) {
    let bestMatch = null;
    let bestScore = 0;

    for (const invoice of invoices) {
      const score = this.calculateMatchScore(transaction, invoice);
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = invoice;
      }
    }

    return {
      invoice: bestMatch,
      confidence: bestScore
    };
  }

  /**
   * Calculer le score de correspondance (0 à 1)
   */
  calculateMatchScore(transaction, invoice) {
    let score = 0;
    let maxScore = 20;

    // 1. Montant exact (score max: 10)
    const transactionAmount = Math.abs(transaction.amount);
    const invoiceAmount = parseFloat(invoice.amount);
    
    if (Math.abs(transactionAmount - invoiceAmount) < 0.01) {
      score += 10;
    } else {
      const amountDiff = Math.abs(transactionAmount - invoiceAmount) / invoiceAmount;
      if (amountDiff < 0.05) score += 8; // Différence < 5%
      else if (amountDiff < 0.1) score += 5; // Différence < 10%
    }

    // 2. Date proximité (score max: 5)
    const txDate = new Date(transaction.date);
    const invDate = new Date(invoice.date);
    const daysDiff = Math.abs((txDate - invDate) / (1000 * 60 * 60 * 24));
    
    if (daysDiff <= 1) score += 5;
    else if (daysDiff <= 7) score += 3;
    else if (daysDiff <= 30) score += 1;

    // 3. Texte description (score max: 5)
    const description = transaction.description.toLowerCase();
    const invoiceNumber = invoice.invoice_number;
    const clientName = invoice.client_name || invoice.supplier_name || '';
    
    if (invoiceNumber && description.includes(invoiceNumber)) {
      score += 5; // Référence facture trouvée
    } else if (clientName && description.includes(clientName.split(' ')[0])) {
      score += 3; // Nom client/fournisseur trouvé
    }

    return score / maxScore;
  }

  /**
   * Récupérer les factures clients non payées
   */
  async getUnpaidClientInvoices(directus, companyName) {
    return directus.items('client_invoices').readMany({
      filter: {
        owner_company: { _eq: companyName },
        status: { _in: ['sent', 'pending', 'overdue'] }
      },
      fields: ['id', 'invoice_number', 'client_name', 'amount', 'currency', 'date', 'due_date', 'status']
    });
  }

  /**
   * Récupérer les factures fournisseurs non payées
   */
  async getUnpaidSupplierInvoices(directus, companyName) {
    return directus.items('supplier_invoices').readMany({
      filter: {
        owner_company: { _eq: companyName },
        status: { _in: ['pending', 'approved', 'overdue'] }
      },
      fields: ['id', 'invoice_number', 'supplier_name', 'amount', 'currency', 'date', 'due_date', 'status']
    });
  }

  /**
   * Confirmer un rapprochement
   */
  async confirmReconciliation(directus, transactionId, invoice, invoiceType) {
    const now = new Date().toISOString();
    
    // 1. Mettre à jour la transaction
    await directus.items('bank_transactions').updateOne(transactionId, {
        reconciled: true,
        reconciled_at: now,
        reconciled_invoice_id: invoice.id,
        reconciled_invoice_type: invoiceType,
        reconciliation_type: 'auto'
      });

    // 2. Mettre à jour la facture
    const collection = invoiceType === 'client_invoice' ? 'client_invoices' : 'supplier_invoices';
    await directus.request(
      updateItem(collection, invoice.id, {
        status: 'paid',
        paid_at: now,
        payment_transaction_id: transactionId
      })
    );

    // 3. Créer un enregistrement de paiement
    await directus.items('payments').createOne({
        owner_company: invoice.owner_company || 'HYPERVISUAL',
        invoice_id: invoice.id,
        invoice_type: invoiceType,
        amount: invoice.amount,
        currency: invoice.currency || 'CHF',
        payment_date: now,
        payment_method: 'bank_transfer',
        bank_transaction_id: transactionId,
        status: 'completed',
        auto_reconciled: true
      });

    console.log(`✅ Rapprochement confirmé: Transaction ${transactionId} ↔ ${invoiceType} ${invoice.id}`);
  }

  /**
   * Créer une suggestion de rapprochement (pour validation manuelle)
   */
  async createSuggestion(directus, transactionId, invoice, invoiceType, confidence) {
    // Stocker dans les métadonnées de la transaction
    await directus.request(
      updateItem('bank_transactions', transactionId, {
        suggested_match: JSON.stringify({
          invoice_id: invoice.id,
          invoice_type: invoiceType,
          invoice_number: invoice.invoice_number,
          confidence: confidence,
          suggested_at: new Date().toISOString()
        })
      })
    );

    console.log(`💡 Suggestion créée: Transaction ${transactionId} ↔ ${invoice.invoice_number} (${Math.round(confidence * 100)}%)`);
  }

  /**
   * Valider manuellement une suggestion
   */
  async validateSuggestion(transactionId) {
    const directus = this.getDirectus();
    
    // Récupérer la transaction avec sa suggestion
    const transaction = await directus.request(
      readItems('bank_transactions', {
        filter: { id: { _eq: transactionId } },
        limit: 1
      })
    );

    if (!transaction[0]?.suggested_match) {
      throw new Error('Aucune suggestion trouvée pour cette transaction');
    }

    const suggestion = JSON.parse(transaction[0].suggested_match);
    
    // Récupérer la facture
    const collection = suggestion.invoice_type === 'client_invoice' ? 'client_invoices' : 'supplier_invoices';
    const invoice = await directus.request(
      readItems(collection, {
        filter: { id: { _eq: suggestion.invoice_id } },
        limit: 1
      })
    );

    if (!invoice[0]) {
      throw new Error('Facture suggérée non trouvée');
    }

    // Confirmer le rapprochement
    await this.confirmReconciliation(directus, transactionId, invoice[0], suggestion.invoice_type);

    // Nettoyer la suggestion
    await directus.items('bank_transactions').updateOne(transactionId, {
        suggested_match: null,
        reconciliation_type: 'manual'
      });

    return { success: true, message: 'Rapprochement validé' };
  }

  /**
   * Rejeter une suggestion
   */
  async rejectSuggestion(transactionId) {
    const directus = this.getDirectus();
    
    await directus.items('bank_transactions').updateOne(transactionId, {
        suggested_match: null
      });

    return { success: true, message: 'Suggestion rejetée' };
  }

  /**
   * Obtenir les suggestions en attente
   */
  async getPendingSuggestions(companyName) {
    const directus = this.getDirectus();
    
    const transactions = await directus.request(
      readItems('bank_transactions', {
        filter: {
          owner_company: { _eq: companyName },
          reconciled: { _eq: false },
          suggested_match: { _nnull: true }
        },
        sort: ['-date']
      })
    );

    return transactions.map(tx => ({
      transaction: {
        id: tx.id,
        date: tx.date,
        amount: tx.amount,
        currency: tx.currency,
        description: tx.description
      },
      suggestion: JSON.parse(tx.suggested_match)
    }));
  }

  /**
   * Rapport de rapprochement
   */
  async getReconciliationReport(companyName, period = {}) {
    const directus = this.getDirectus();
    
    const startDate = period.start || new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString();
    const endDate = period.end || new Date().toISOString();

    // Statistiques des transactions
    const [allTx, reconciledTx, pendingTx] = await Promise.all([
      directus.items('bank_transactions').readMany({
        filter: {
          owner_company: { _eq: companyName },
          date: { _between: [startDate, endDate] }
        },
        aggregate: { count: '*', sum: ['amount'] }
      }),
      directus.items('bank_transactions').readMany({
        filter: {
          owner_company: { _eq: companyName },
          date: { _between: [startDate, endDate] },
          reconciled: { _eq: true }
        },
        aggregate: { count: '*' }
      }),
      directus.items('bank_transactions').readMany({
        filter: {
          owner_company: { _eq: companyName },
          date: { _between: [startDate, endDate] },
          reconciled: { _eq: false },
          suggested_match: { _nnull: true }
        },
        aggregate: { count: '*' }
      })
    ]);

    const total = parseInt(allTx[0]?.count || 0);
    const reconciled = parseInt(reconciledTx[0]?.count || 0);
    const pending = parseInt(pendingTx[0]?.count || 0);
    const unmatched = total - reconciled - pending;

    return {
      period: { start: startDate, end: endDate },
      company: companyName,
      summary: {
        total,
        reconciled,
        pending_validation: pending,
        unmatched,
        reconciliation_rate: total > 0 ? Math.round((reconciled / total) * 100) : 0
      },
      generated_at: new Date().toISOString()
    };
  }

  /**
   * Rapprochement manuel direct
   */
  async manualReconcile(transactionId, invoiceId, invoiceType) {
    const directus = this.getDirectus();
    
    const collection = invoiceType === 'client_invoice' ? 'client_invoices' : 'supplier_invoices';
    const invoice = await directus.request(
      readItems(collection, {
        filter: { id: { _eq: invoiceId } },
        limit: 1
      })
    );

    if (!invoice[0]) {
      throw new Error('Facture non trouvée');
    }

    await this.confirmReconciliation(directus, transactionId, invoice[0], invoiceType);
    
    // Marquer comme rapprochement manuel
    await directus.items('bank_transactions').updateOne(transactionId, {
        reconciliation_type: 'manual'
      });

    return { success: true, message: 'Rapprochement manuel effectué' };
  }

  /**
   * Annuler un rapprochement
   */
  async undoReconciliation(transactionId) {
    const directus = this.getDirectus();
    
    const transaction = await directus.request(
      readItems('bank_transactions', {
        filter: { id: { _eq: transactionId } },
        limit: 1
      })
    );

    if (!transaction[0]?.reconciled) {
      throw new Error('Transaction non rapprochée');
    }

    const invoiceType = transaction[0].reconciled_invoice_type;
    const invoiceId = transaction[0].reconciled_invoice_id;
    const collection = invoiceType === 'client_invoice' ? 'client_invoices' : 'supplier_invoices';

    // 1. Remettre la transaction comme non rapprochée
    await directus.items('bank_transactions').updateOne(transactionId, {
        reconciled: false,
        reconciled_at: null,
        reconciled_invoice_id: null,
        reconciled_invoice_type: null,
        reconciliation_type: null
      });

    // 2. Remettre la facture comme non payée
    await directus.request(
      updateItem(collection, invoiceId, {
        status: 'pending',
        paid_at: null,
        payment_transaction_id: null
      })
    );

    console.log(`↩️ Rapprochement annulé: Transaction ${transactionId}`);
    return { success: true, message: 'Rapprochement annulé' };
  }
}

export const bankReconciliationService = new BankReconciliationService();
export default BankReconciliationService;