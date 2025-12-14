/**
 * BankReconciliationService
 * Service de rapprochement bancaire automatique et manuel
 * Conforme aux normes bancaires suisses (CAMT.053, ISO 20022)
 *
 * @module finance/bank-reconciliation
 * @version 2.0.0
 */

import { createDirectus, rest, readItems, createItem, updateItem, deleteItem } from '@directus/sdk';

/**
 * Service de rapprochement bancaire
 * Gère le matching automatique et manuel entre transactions bancaires et factures
 */
class BankReconciliationService {
  constructor() {
    this.directusUrl = process.env.DIRECTUS_URL || 'http://localhost:8055';
    this.directusToken = process.env.DIRECTUS_TOKEN;

    // Seuils de confiance pour le rapprochement
    this.AUTO_RECONCILE_THRESHOLD = 0.85; // 85% de confiance minimum pour auto
    this.SUGGESTION_THRESHOLD = 0.50;     // 50% minimum pour créer une suggestion

    // Configuration des entreprises avec IBAN
    this.companyConfig = {
      'HYPERVISUAL': {
        iban: 'CH93 0076 2011 6238 5295 7',
        bic: 'BCVLCH2LXXX',
        bank: 'Banque Cantonale Vaudoise',
        currency: 'CHF'
      },
      'DAINAMICS': {
        iban: 'CH45 0076 2011 6238 5296 8',
        bic: 'BCVLCH2LXXX',
        bank: 'Banque Cantonale Vaudoise',
        currency: 'CHF'
      },
      'LEXAIA': {
        iban: 'CH67 0076 2011 6238 5297 9',
        bic: 'BCVLCH2LXXX',
        bank: 'Banque Cantonale Vaudoise',
        currency: 'CHF'
      },
      'ENKI REALTY': {
        iban: 'CH89 0076 2011 6238 5298 0',
        bic: 'BCVLCH2LXXX',
        bank: 'Banque Cantonale Vaudoise',
        currency: 'CHF'
      },
      'TAKEOUT': {
        iban: 'CH12 0076 2011 6238 5299 1',
        bic: 'BCVLCH2LXXX',
        bank: 'Banque Cantonale Vaudoise',
        currency: 'CHF'
      }
    };
  }

  /**
   * Obtenir le client Directus configuré
   * @returns {Object} Client Directus
   */
  getDirectus() {
    const client = createDirectus(this.directusUrl).with(rest());
    return client;
  }

  /**
   * Obtenir les headers d'authentification
   * @returns {Object} Headers avec token
   */
  getAuthHeaders() {
    return {
      Authorization: `Bearer ${this.directusToken}`
    };
  }

  // ==========================================
  // RAPPROCHEMENT AUTOMATIQUE
  // ==========================================

  /**
   * Lancer le rapprochement automatique pour une entreprise
   * @param {string} companyName - Nom de l'entreprise
   * @param {Object} options - Options de rapprochement
   * @returns {Promise<Object>} Résultats du rapprochement
   */
  async autoReconcile(companyName, options = {}) {
    const directus = this.getDirectus();
    const limit = options.limit || 100;
    const dryRun = options.dryRun || false;

    console.log(`🔄 Début du rapprochement automatique pour ${companyName}`);
    if (dryRun) console.log('⚠️ Mode simulation activé');

    // 1. Récupérer les transactions non rapprochées
    const transactions = await directus.request(
      readItems('bank_transactions', {
        filter: {
          owner_company: { _eq: companyName },
          reconciled: { _eq: false }
        },
        sort: ['-date'],
        limit: limit
      })
    );

    if (transactions.length === 0) {
      console.log('ℹ️ Aucune transaction non rapprochée trouvée');
      return {
        processed: 0,
        auto_reconciled: 0,
        suggestions_created: 0,
        no_match: 0,
        failed: 0,
        details: []
      };
    }

    // 2. Récupérer les factures non payées
    const [clientInvoices, supplierInvoices] = await Promise.all([
      this.getUnpaidClientInvoices(companyName),
      this.getUnpaidSupplierInvoices(companyName)
    ]);

    const results = {
      processed: 0,
      auto_reconciled: 0,
      suggestions_created: 0,
      no_match: 0,
      failed: 0,
      details: []
    };

    // 3. Traiter chaque transaction
    for (const transaction of transactions) {
      try {
        results.processed++;

        // Déterminer le type de facture selon le sens de la transaction
        const isIncome = transaction.amount > 0;
        const invoices = isIncome ? clientInvoices : supplierInvoices;
        const invoiceType = isIncome ? 'client_invoice' : 'supplier_invoice';

        if (invoices.length === 0) {
          results.no_match++;
          results.details.push({
            transaction_id: transaction.id,
            action: 'no_invoices_available',
            amount: transaction.amount,
            date: transaction.date
          });
          continue;
        }

        // Chercher la meilleure correspondance
        const match = this.findBestMatch(transaction, invoices);

        if (match.confidence >= this.AUTO_RECONCILE_THRESHOLD) {
          // Rapprochement automatique
          if (!dryRun) {
            await this.confirmReconciliation(transaction.id, match.invoice, invoiceType);
          }
          results.auto_reconciled++;
          results.details.push({
            transaction_id: transaction.id,
            action: dryRun ? 'would_auto_reconcile' : 'auto_reconciled',
            invoice_id: match.invoice.id,
            invoice_number: match.invoice.invoice_number,
            confidence: Math.round(match.confidence * 100),
            amount_transaction: transaction.amount,
            amount_invoice: match.invoice.total_ttc || match.invoice.amount
          });

          // Retirer la facture des candidats pour éviter les doublons
          const idx = invoices.findIndex(inv => inv.id === match.invoice.id);
          if (idx > -1) invoices.splice(idx, 1);

        } else if (match.confidence >= this.SUGGESTION_THRESHOLD) {
          // Créer une suggestion
          if (!dryRun) {
            await this.createSuggestion(transaction.id, match.invoice, invoiceType, match.confidence);
          }
          results.suggestions_created++;
          results.details.push({
            transaction_id: transaction.id,
            action: dryRun ? 'would_suggest' : 'suggestion_created',
            invoice_id: match.invoice.id,
            invoice_number: match.invoice.invoice_number,
            confidence: Math.round(match.confidence * 100)
          });
        } else {
          results.no_match++;
          results.details.push({
            transaction_id: transaction.id,
            action: 'no_match',
            best_confidence: match.confidence ? Math.round(match.confidence * 100) : 0,
            amount: transaction.amount
          });
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

    console.log(`✅ Rapprochement terminé: ${results.auto_reconciled} auto, ${results.suggestions_created} suggestions, ${results.no_match} sans correspondance`);
    return results;
  }

  /**
   * Trouver la meilleure correspondance pour une transaction
   * @param {Object} transaction - Transaction bancaire
   * @param {Array} invoices - Liste des factures candidates
   * @returns {Object} Meilleure correspondance avec score
   */
  findBestMatch(transaction, invoices) {
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
   * Calculer le score de correspondance entre transaction et facture
   * Score de 0 à 1 basé sur plusieurs critères pondérés
   * @param {Object} transaction - Transaction bancaire
   * @param {Object} invoice - Facture
   * @returns {number} Score de 0 à 1
   */
  calculateMatchScore(transaction, invoice) {
    let score = 0;
    const weights = {
      amount: 40,      // Montant: 40%
      reference: 30,   // Référence QR/facture: 30%
      date: 15,        // Proximité de date: 15%
      client: 15       // Nom client/fournisseur: 15%
    };
    const maxScore = Object.values(weights).reduce((a, b) => a + b, 0);

    // 1. Comparaison du montant (40 points max)
    const transactionAmount = Math.abs(transaction.amount);
    const invoiceAmount = parseFloat(invoice.total_ttc || invoice.amount || 0);

    if (invoiceAmount > 0) {
      const amountDiff = Math.abs(transactionAmount - invoiceAmount) / invoiceAmount;

      if (amountDiff < 0.001) {
        score += weights.amount; // Montant exact
      } else if (amountDiff < 0.01) {
        score += weights.amount * 0.95; // Différence < 1%
      } else if (amountDiff < 0.02) {
        score += weights.amount * 0.85; // Différence < 2%
      } else if (amountDiff < 0.05) {
        score += weights.amount * 0.70; // Différence < 5%
      } else if (amountDiff < 0.10) {
        score += weights.amount * 0.50; // Différence < 10%
      }
    }

    // 2. Référence QR ou numéro de facture dans la description (30 points max)
    const description = (transaction.description || '').toLowerCase();
    const reference = (transaction.reference || '').toLowerCase();
    const invoiceNumber = (invoice.invoice_number || '').toLowerCase();
    const qrReference = (invoice.qr_reference || '').toLowerCase().replace(/\s/g, '');

    if (qrReference && (description.includes(qrReference) || reference.includes(qrReference))) {
      score += weights.reference; // Référence QR exacte trouvée
    } else if (invoiceNumber && (description.includes(invoiceNumber) || reference.includes(invoiceNumber))) {
      score += weights.reference * 0.90; // Numéro de facture trouvé
    } else {
      // Recherche partielle du numéro
      const invoiceNumParts = invoiceNumber.split(/[-_]/);
      for (const part of invoiceNumParts) {
        if (part.length >= 4 && (description.includes(part) || reference.includes(part))) {
          score += weights.reference * 0.60;
          break;
        }
      }
    }

    // 3. Proximité de date (15 points max)
    const txDate = new Date(transaction.date);
    const invDate = new Date(invoice.date || invoice.issue_date);
    const dueDate = invoice.due_date ? new Date(invoice.due_date) : null;

    if (!isNaN(txDate.getTime()) && !isNaN(invDate.getTime())) {
      const daysDiffFromInvoice = Math.abs((txDate - invDate) / (1000 * 60 * 60 * 24));
      const daysDiffFromDue = dueDate ? Math.abs((txDate - dueDate) / (1000 * 60 * 60 * 24)) : Infinity;
      const minDaysDiff = Math.min(daysDiffFromInvoice, daysDiffFromDue);

      if (minDaysDiff <= 3) {
        score += weights.date;
      } else if (minDaysDiff <= 7) {
        score += weights.date * 0.85;
      } else if (minDaysDiff <= 14) {
        score += weights.date * 0.70;
      } else if (minDaysDiff <= 30) {
        score += weights.date * 0.50;
      } else if (minDaysDiff <= 60) {
        score += weights.date * 0.25;
      }
    }

    // 4. Nom du client/fournisseur (15 points max)
    const clientName = (invoice.client_name || invoice.supplier_name || '').toLowerCase();
    const clientNameParts = clientName.split(/\s+/).filter(p => p.length > 2);

    let nameMatchScore = 0;
    for (const part of clientNameParts) {
      if (description.includes(part) || reference.includes(part)) {
        nameMatchScore += 1 / clientNameParts.length;
      }
    }
    score += weights.client * Math.min(nameMatchScore, 1);

    return score / maxScore;
  }

  // ==========================================
  // GESTION DES FACTURES
  // ==========================================

  /**
   * Récupérer les factures clients non payées
   * @param {string} companyName - Nom de l'entreprise
   * @returns {Promise<Array>} Liste des factures
   */
  async getUnpaidClientInvoices(companyName) {
    const directus = this.getDirectus();

    return directus.request(
      readItems('client_invoices', {
        filter: {
          owner_company: { _eq: companyName },
          status: { _in: ['sent', 'pending', 'overdue', 'partial'] }
        },
        fields: [
          'id', 'invoice_number', 'client_name', 'client_id',
          'total_ht', 'total_tva', 'total_ttc', 'amount',
          'currency', 'date', 'issue_date', 'due_date',
          'status', 'qr_reference', 'owner_company',
          'paid_amount', 'remaining_amount'
        ],
        sort: ['-date'],
        limit: 500
      })
    );
  }

  /**
   * Récupérer les factures fournisseurs non payées
   * @param {string} companyName - Nom de l'entreprise
   * @returns {Promise<Array>} Liste des factures
   */
  async getUnpaidSupplierInvoices(companyName) {
    const directus = this.getDirectus();

    return directus.request(
      readItems('supplier_invoices', {
        filter: {
          owner_company: { _eq: companyName },
          status: { _in: ['pending', 'approved', 'overdue', 'partial'] }
        },
        fields: [
          'id', 'invoice_number', 'supplier_name', 'supplier_id',
          'total_ht', 'total_tva', 'total_ttc', 'amount',
          'currency', 'date', 'issue_date', 'due_date',
          'status', 'reference', 'owner_company',
          'paid_amount', 'remaining_amount'
        ],
        sort: ['-date'],
        limit: 500
      })
    );
  }

  // ==========================================
  // CONFIRMATION ET GESTION DES RAPPROCHEMENTS
  // ==========================================

  /**
   * Confirmer un rapprochement (auto ou manuel)
   * @param {string} transactionId - ID de la transaction
   * @param {Object} invoice - Facture associée
   * @param {string} invoiceType - Type de facture
   * @param {string} reconciliationType - Type de rapprochement (auto/manual/suggested)
   * @returns {Promise<Object>} Résultat de l'opération
   */
  async confirmReconciliation(transactionId, invoice, invoiceType, reconciliationType = 'auto') {
    const directus = this.getDirectus();
    const now = new Date().toISOString();

    // 1. Mettre à jour la transaction
    await directus.request(
      updateItem('bank_transactions', transactionId, {
        reconciled: true,
        reconciled_at: now,
        reconciled_invoice_id: invoice.id,
        reconciled_invoice_type: invoiceType,
        reconciliation_type: reconciliationType,
        suggested_match: null // Nettoyer les suggestions si présentes
      })
    );

    // 2. Récupérer la transaction pour obtenir le montant
    const transactions = await directus.request(
      readItems('bank_transactions', {
        filter: { id: { _eq: transactionId } },
        limit: 1
      })
    );
    const transaction = transactions[0];
    const paymentAmount = Math.abs(transaction?.amount || invoice.total_ttc || invoice.amount);

    // 3. Mettre à jour la facture
    const collection = invoiceType === 'client_invoice' ? 'client_invoices' : 'supplier_invoices';
    const invoiceTotal = parseFloat(invoice.total_ttc || invoice.amount || 0);
    const currentPaidAmount = parseFloat(invoice.paid_amount || 0);
    const newPaidAmount = currentPaidAmount + paymentAmount;
    const remaining = Math.max(0, invoiceTotal - newPaidAmount);

    const newStatus = remaining <= 0.01 ? 'paid' : 'partial';

    await directus.request(
      updateItem(collection, invoice.id, {
        status: newStatus,
        paid_at: newStatus === 'paid' ? now : null,
        payment_transaction_id: transactionId,
        paid_amount: newPaidAmount,
        remaining_amount: remaining
      })
    );

    // 4. Créer un enregistrement de paiement
    await directus.request(
      createItem('payments', {
        owner_company: invoice.owner_company || 'HYPERVISUAL',
        invoice_id: invoice.id,
        invoice_type: invoiceType,
        amount: paymentAmount,
        currency: transaction?.currency || invoice.currency || 'CHF',
        payment_date: transaction?.date || now,
        payment_method: 'bank_transfer',
        bank_transaction_id: transactionId,
        status: 'completed',
        auto_reconciled: reconciliationType === 'auto',
        notes: `Rapprochement ${reconciliationType} - ${invoice.invoice_number}`
      })
    );

    console.log(`✅ Rapprochement confirmé: Transaction ${transactionId} ↔ ${invoiceType} ${invoice.invoice_number}`);

    return {
      success: true,
      transaction_id: transactionId,
      invoice_id: invoice.id,
      invoice_number: invoice.invoice_number,
      amount: paymentAmount,
      new_status: newStatus,
      remaining: remaining
    };
  }

  /**
   * Créer une suggestion de rapprochement (pour validation manuelle)
   * @param {string} transactionId - ID de la transaction
   * @param {Object} invoice - Facture suggérée
   * @param {string} invoiceType - Type de facture
   * @param {number} confidence - Score de confiance (0-1)
   * @returns {Promise<Object>} Résultat de l'opération
   */
  async createSuggestion(transactionId, invoice, invoiceType, confidence) {
    const directus = this.getDirectus();

    const suggestion = {
      invoice_id: invoice.id,
      invoice_type: invoiceType,
      invoice_number: invoice.invoice_number,
      invoice_amount: invoice.total_ttc || invoice.amount,
      client_name: invoice.client_name || invoice.supplier_name,
      confidence: confidence,
      suggested_at: new Date().toISOString()
    };

    await directus.request(
      updateItem('bank_transactions', transactionId, {
        suggested_match: JSON.stringify(suggestion),
        reconciliation_type: 'suggested'
      })
    );

    console.log(`💡 Suggestion créée: Transaction ${transactionId} ↔ ${invoice.invoice_number} (${Math.round(confidence * 100)}%)`);

    return {
      success: true,
      transaction_id: transactionId,
      suggestion: suggestion
    };
  }

  /**
   * Valider une suggestion existante
   * @param {string} transactionId - ID de la transaction
   * @returns {Promise<Object>} Résultat de l'opération
   */
  async validateSuggestion(transactionId) {
    const directus = this.getDirectus();

    // Récupérer la transaction avec sa suggestion
    const transactions = await directus.request(
      readItems('bank_transactions', {
        filter: { id: { _eq: transactionId } },
        limit: 1
      })
    );

    if (!transactions[0]?.suggested_match) {
      throw new Error('Aucune suggestion trouvée pour cette transaction');
    }

    const suggestion = JSON.parse(transactions[0].suggested_match);

    // Récupérer la facture
    const collection = suggestion.invoice_type === 'client_invoice' ? 'client_invoices' : 'supplier_invoices';
    const invoices = await directus.request(
      readItems(collection, {
        filter: { id: { _eq: suggestion.invoice_id } },
        limit: 1
      })
    );

    if (!invoices[0]) {
      throw new Error('Facture suggérée non trouvée');
    }

    // Confirmer le rapprochement comme manuel (validé par utilisateur)
    return this.confirmReconciliation(transactionId, invoices[0], suggestion.invoice_type, 'manual');
  }

  /**
   * Rejeter une suggestion
   * @param {string} transactionId - ID de la transaction
   * @param {string} reason - Raison du rejet (optionnel)
   * @returns {Promise<Object>} Résultat de l'opération
   */
  async rejectSuggestion(transactionId, reason = null) {
    const directus = this.getDirectus();

    await directus.request(
      updateItem('bank_transactions', transactionId, {
        suggested_match: null,
        reconciliation_type: null,
        rejection_reason: reason,
        rejected_at: reason ? new Date().toISOString() : null
      })
    );

    console.log(`❌ Suggestion rejetée: Transaction ${transactionId}`);
    return { success: true, message: 'Suggestion rejetée', transaction_id: transactionId };
  }

  /**
   * Rapprochement manuel direct
   * @param {string} transactionId - ID de la transaction
   * @param {string} invoiceId - ID de la facture
   * @param {string} invoiceType - Type de facture
   * @returns {Promise<Object>} Résultat de l'opération
   */
  async manualReconcile(transactionId, invoiceId, invoiceType) {
    const directus = this.getDirectus();

    const collection = invoiceType === 'client_invoice' ? 'client_invoices' : 'supplier_invoices';
    const invoices = await directus.request(
      readItems(collection, {
        filter: { id: { _eq: invoiceId } },
        limit: 1
      })
    );

    if (!invoices[0]) {
      throw new Error('Facture non trouvée');
    }

    return this.confirmReconciliation(transactionId, invoices[0], invoiceType, 'manual');
  }

  /**
   * Annuler un rapprochement
   * @param {string} transactionId - ID de la transaction
   * @param {string} reason - Raison de l'annulation
   * @returns {Promise<Object>} Résultat de l'opération
   */
  async undoReconciliation(transactionId, reason = null) {
    const directus = this.getDirectus();

    // Récupérer la transaction
    const transactions = await directus.request(
      readItems('bank_transactions', {
        filter: { id: { _eq: transactionId } },
        limit: 1
      })
    );

    if (!transactions[0]?.reconciled) {
      throw new Error('Transaction non rapprochée');
    }

    const transaction = transactions[0];
    const invoiceType = transaction.reconciled_invoice_type;
    const invoiceId = transaction.reconciled_invoice_id;
    const collection = invoiceType === 'client_invoice' ? 'client_invoices' : 'supplier_invoices';

    // 1. Récupérer les infos de la facture actuelle
    const invoices = await directus.request(
      readItems(collection, {
        filter: { id: { _eq: invoiceId } },
        limit: 1
      })
    );
    const invoice = invoices[0];

    // 2. Calculer le nouveau montant payé
    const paymentAmount = Math.abs(transaction.amount);
    const currentPaidAmount = parseFloat(invoice?.paid_amount || 0);
    const newPaidAmount = Math.max(0, currentPaidAmount - paymentAmount);
    const invoiceTotal = parseFloat(invoice?.total_ttc || invoice?.amount || 0);
    const newRemaining = invoiceTotal - newPaidAmount;

    // Déterminer le nouveau statut
    let newStatus = 'pending';
    if (newPaidAmount > 0 && newPaidAmount < invoiceTotal) {
      newStatus = 'partial';
    } else if (newPaidAmount >= invoiceTotal) {
      newStatus = 'paid'; // Ne devrait pas arriver
    }

    // 3. Remettre la transaction comme non rapprochée
    await directus.request(
      updateItem('bank_transactions', transactionId, {
        reconciled: false,
        reconciled_at: null,
        reconciled_invoice_id: null,
        reconciled_invoice_type: null,
        reconciliation_type: null,
        undo_reason: reason,
        undo_at: new Date().toISOString()
      })
    );

    // 4. Mettre à jour la facture
    if (invoice) {
      await directus.request(
        updateItem(collection, invoiceId, {
          status: newStatus,
          paid_at: null,
          payment_transaction_id: null,
          paid_amount: newPaidAmount,
          remaining_amount: newRemaining
        })
      );
    }

    // 5. Supprimer ou annuler le paiement associé
    const payments = await directus.request(
      readItems('payments', {
        filter: { bank_transaction_id: { _eq: transactionId } },
        limit: 1
      })
    );

    if (payments[0]) {
      await directus.request(
        updateItem('payments', payments[0].id, {
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancellation_reason: reason || 'Rapprochement annulé'
        })
      );
    }

    console.log(`↩️ Rapprochement annulé: Transaction ${transactionId}`);
    return {
      success: true,
      message: 'Rapprochement annulé',
      transaction_id: transactionId,
      invoice_id: invoiceId,
      new_invoice_status: newStatus
    };
  }

  // ==========================================
  // CONSULTATION ET RAPPORTS
  // ==========================================

  /**
   * Obtenir les suggestions en attente de validation
   * @param {string} companyName - Nom de l'entreprise
   * @returns {Promise<Array>} Liste des suggestions
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
        sort: ['-date'],
        limit: 100
      })
    );

    return transactions.map(tx => ({
      transaction: {
        id: tx.id,
        date: tx.date,
        amount: tx.amount,
        currency: tx.currency,
        description: tx.description,
        reference: tx.reference
      },
      suggestion: tx.suggested_match ? JSON.parse(tx.suggested_match) : null
    })).filter(item => item.suggestion !== null);
  }

  /**
   * Obtenir les transactions non rapprochées
   * @param {string} companyName - Nom de l'entreprise
   * @param {Object} options - Options de filtrage
   * @returns {Promise<Array>} Liste des transactions
   */
  async getUnreconciledTransactions(companyName, options = {}) {
    const directus = this.getDirectus();

    const filter = {
      owner_company: { _eq: companyName },
      reconciled: { _eq: false }
    };

    // Exclure les suggestions si demandé
    if (options.excludeSuggestions) {
      filter.suggested_match = { _null: true };
    }

    // Filtrer par type de mouvement
    if (options.type === 'income') {
      filter.amount = { _gt: 0 };
    } else if (options.type === 'expense') {
      filter.amount = { _lt: 0 };
    }

    // Filtrer par période
    if (options.startDate) {
      filter.date = filter.date || {};
      filter.date._gte = options.startDate;
    }
    if (options.endDate) {
      filter.date = filter.date || {};
      filter.date._lte = options.endDate;
    }

    return directus.request(
      readItems('bank_transactions', {
        filter,
        sort: ['-date'],
        limit: options.limit || 200
      })
    );
  }

  /**
   * Obtenir l'historique des rapprochements
   * @param {string} companyName - Nom de l'entreprise
   * @param {Object} options - Options de filtrage
   * @returns {Promise<Array>} Historique des rapprochements
   */
  async getReconciliationHistory(companyName, options = {}) {
    const directus = this.getDirectus();

    const filter = {
      owner_company: { _eq: companyName },
      reconciled: { _eq: true }
    };

    if (options.startDate) {
      filter.reconciled_at = filter.reconciled_at || {};
      filter.reconciled_at._gte = options.startDate;
    }
    if (options.endDate) {
      filter.reconciled_at = filter.reconciled_at || {};
      filter.reconciled_at._lte = options.endDate;
    }
    if (options.type) {
      filter.reconciliation_type = { _eq: options.type };
    }

    const transactions = await directus.request(
      readItems('bank_transactions', {
        filter,
        sort: ['-reconciled_at'],
        limit: options.limit || 100
      })
    );

    // Enrichir avec les infos de facture
    const enriched = [];
    for (const tx of transactions) {
      const invoiceType = tx.reconciled_invoice_type;
      const collection = invoiceType === 'client_invoice' ? 'client_invoices' : 'supplier_invoices';

      let invoiceInfo = null;
      if (tx.reconciled_invoice_id) {
        const invoices = await directus.request(
          readItems(collection, {
            filter: { id: { _eq: tx.reconciled_invoice_id } },
            fields: ['id', 'invoice_number', 'client_name', 'supplier_name', 'total_ttc', 'amount'],
            limit: 1
          })
        );
        invoiceInfo = invoices[0] || null;
      }

      enriched.push({
        transaction: {
          id: tx.id,
          date: tx.date,
          amount: tx.amount,
          description: tx.description,
          reconciled_at: tx.reconciled_at,
          reconciliation_type: tx.reconciliation_type
        },
        invoice: invoiceInfo ? {
          id: invoiceInfo.id,
          number: invoiceInfo.invoice_number,
          name: invoiceInfo.client_name || invoiceInfo.supplier_name,
          amount: invoiceInfo.total_ttc || invoiceInfo.amount,
          type: invoiceType
        } : null
      });
    }

    return enriched;
  }

  /**
   * Générer un rapport de rapprochement
   * @param {string} companyName - Nom de l'entreprise
   * @param {Object} period - Période du rapport
   * @returns {Promise<Object>} Rapport détaillé
   */
  async getReconciliationReport(companyName, period = {}) {
    const directus = this.getDirectus();

    const now = new Date();
    const startDate = period.start || new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
    const endDate = period.end || now.toISOString();

    // Statistiques des transactions
    const baseFilter = {
      owner_company: { _eq: companyName },
      date: { _between: [startDate, endDate] }
    };

    const [allTransactions, reconciledAuto, reconciledManual, pendingSuggestions, unreconciled] = await Promise.all([
      // Total des transactions
      directus.request(readItems('bank_transactions', {
        filter: baseFilter,
        fields: ['id', 'amount', 'currency']
      })),
      // Rapprochements automatiques
      directus.request(readItems('bank_transactions', {
        filter: { ...baseFilter, reconciled: { _eq: true }, reconciliation_type: { _eq: 'auto' } },
        fields: ['id', 'amount']
      })),
      // Rapprochements manuels
      directus.request(readItems('bank_transactions', {
        filter: { ...baseFilter, reconciled: { _eq: true }, reconciliation_type: { _in: ['manual', 'suggested'] } },
        fields: ['id', 'amount']
      })),
      // Suggestions en attente
      directus.request(readItems('bank_transactions', {
        filter: { ...baseFilter, reconciled: { _eq: false }, suggested_match: { _nnull: true } },
        fields: ['id', 'amount']
      })),
      // Non rapprochées sans suggestion
      directus.request(readItems('bank_transactions', {
        filter: { ...baseFilter, reconciled: { _eq: false }, suggested_match: { _null: true } },
        fields: ['id', 'amount']
      }))
    ]);

    // Calculs
    const total = allTransactions.length;
    const reconciledAutoCount = reconciledAuto.length;
    const reconciledManualCount = reconciledManual.length;
    const reconciledTotal = reconciledAutoCount + reconciledManualCount;
    const pendingCount = pendingSuggestions.length;
    const unreconciledCount = unreconciled.length;

    const sumAmount = (items) => items.reduce((sum, t) => sum + Math.abs(parseFloat(t.amount || 0)), 0);

    return {
      period: { start: startDate, end: endDate },
      company: companyName,
      summary: {
        total_transactions: total,
        reconciled: {
          total: reconciledTotal,
          automatic: reconciledAutoCount,
          manual: reconciledManualCount
        },
        pending_validation: pendingCount,
        unreconciled: unreconciledCount,
        reconciliation_rate: total > 0 ? Math.round((reconciledTotal / total) * 100) : 0,
        automation_rate: reconciledTotal > 0 ? Math.round((reconciledAutoCount / reconciledTotal) * 100) : 0
      },
      amounts: {
        total: sumAmount(allTransactions),
        reconciled: sumAmount([...reconciledAuto, ...reconciledManual]),
        pending: sumAmount(pendingSuggestions),
        unreconciled: sumAmount(unreconciled),
        currency: this.companyConfig[companyName]?.currency || 'CHF'
      },
      generated_at: new Date().toISOString()
    };
  }

  // ==========================================
  // IMPORT DE TRANSACTIONS BANCAIRES
  // ==========================================

  /**
   * Importer des transactions depuis un fichier CAMT.053 (ISO 20022)
   * @param {string} companyName - Nom de l'entreprise
   * @param {string} xmlContent - Contenu XML du fichier CAMT.053
   * @returns {Promise<Object>} Résultat de l'import
   */
  async importCAMT053(companyName, xmlContent) {
    const directus = this.getDirectus();

    // Parser le XML (simplified - en production utiliser un parser XML robuste)
    const transactions = this.parseCAMT053(xmlContent);

    const results = {
      imported: 0,
      duplicates: 0,
      errors: 0,
      details: []
    };

    for (const tx of transactions) {
      try {
        // Vérifier si la transaction existe déjà (par référence bancaire)
        const existing = await directus.request(
          readItems('bank_transactions', {
            filter: {
              owner_company: { _eq: companyName },
              bank_reference: { _eq: tx.reference }
            },
            limit: 1
          })
        );

        if (existing.length > 0) {
          results.duplicates++;
          results.details.push({
            reference: tx.reference,
            action: 'duplicate',
            existing_id: existing[0].id
          });
          continue;
        }

        // Créer la transaction
        const created = await directus.request(
          createItem('bank_transactions', {
            owner_company: companyName,
            bank_reference: tx.reference,
            date: tx.date,
            value_date: tx.valueDate,
            amount: tx.amount,
            currency: tx.currency,
            description: tx.description,
            reference: tx.endToEndId,
            creditor_name: tx.creditorName,
            creditor_iban: tx.creditorIban,
            debtor_name: tx.debtorName,
            debtor_iban: tx.debtorIban,
            reconciled: false,
            import_source: 'CAMT053',
            imported_at: new Date().toISOString()
          })
        );

        results.imported++;
        results.details.push({
          reference: tx.reference,
          action: 'imported',
          id: created.id
        });

      } catch (error) {
        results.errors++;
        results.details.push({
          reference: tx.reference,
          action: 'error',
          error: error.message
        });
      }
    }

    console.log(`📥 Import CAMT.053 terminé: ${results.imported} importées, ${results.duplicates} doublons, ${results.errors} erreurs`);
    return results;
  }

  /**
   * Parser un fichier CAMT.053 (simplifié)
   * @param {string} xmlContent - Contenu XML
   * @returns {Array} Liste des transactions
   */
  parseCAMT053(xmlContent) {
    // Note: En production, utiliser un parser XML comme xml2js ou fast-xml-parser
    const transactions = [];

    // Regex simplifiée pour extraire les transactions (à améliorer avec un vrai parser)
    const entryRegex = /<Ntry>([\s\S]*?)<\/Ntry>/g;
    let match;

    while ((match = entryRegex.exec(xmlContent)) !== null) {
      const entry = match[1];

      // Extraire les champs
      const getValue = (tag) => {
        const regex = new RegExp(`<${tag}>([^<]+)</${tag}>`);
        const m = entry.match(regex);
        return m ? m[1].trim() : null;
      };

      const amount = parseFloat(getValue('Amt') || 0);
      const cdtDbtInd = getValue('CdtDbtInd'); // CRDT ou DBIT

      transactions.push({
        reference: getValue('AcctSvcrRef') || getValue('NtryRef'),
        date: getValue('BookgDt')?.match(/\d{4}-\d{2}-\d{2}/)?.[0] || getValue('ValDt')?.match(/\d{4}-\d{2}-\d{2}/)?.[0],
        valueDate: getValue('ValDt')?.match(/\d{4}-\d{2}-\d{2}/)?.[0],
        amount: cdtDbtInd === 'DBIT' ? -amount : amount,
        currency: entry.match(/Ccy="([^"]+)"/)?.[1] || 'CHF',
        description: getValue('AddtlNtryInf') || getValue('RmtInf'),
        endToEndId: getValue('EndToEndId'),
        creditorName: entry.match(/<Cdtr>[\s\S]*?<Nm>([^<]+)<\/Nm>/)?.[1],
        creditorIban: entry.match(/<CdtrAcct>[\s\S]*?<IBAN>([^<]+)<\/IBAN>/)?.[1],
        debtorName: entry.match(/<Dbtr>[\s\S]*?<Nm>([^<]+)<\/Nm>/)?.[1],
        debtorIban: entry.match(/<DbtrAcct>[\s\S]*?<IBAN>([^<]+)<\/IBAN>/)?.[1]
      });
    }

    return transactions;
  }

  /**
   * Importer des transactions depuis un CSV bancaire
   * @param {string} companyName - Nom de l'entreprise
   * @param {string} csvContent - Contenu CSV
   * @param {Object} mapping - Mapping des colonnes
   * @returns {Promise<Object>} Résultat de l'import
   */
  async importCSV(companyName, csvContent, mapping = {}) {
    const directus = this.getDirectus();

    // Configuration par défaut du mapping
    const config = {
      dateCol: mapping.date || 'Date',
      amountCol: mapping.amount || 'Montant',
      descriptionCol: mapping.description || 'Description',
      referenceCol: mapping.reference || 'Référence',
      currencyCol: mapping.currency || 'Devise',
      delimiter: mapping.delimiter || ';',
      dateFormat: mapping.dateFormat || 'DD.MM.YYYY'
    };

    // Parser le CSV
    const lines = csvContent.split('\n').filter(l => l.trim());
    if (lines.length < 2) {
      throw new Error('Fichier CSV vide ou invalide');
    }

    const headers = lines[0].split(config.delimiter).map(h => h.trim().replace(/"/g, ''));
    const getIndex = (colName) => headers.indexOf(colName);

    const results = {
      imported: 0,
      duplicates: 0,
      errors: 0,
      details: []
    };

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(config.delimiter).map(v => v.trim().replace(/"/g, ''));

      try {
        const dateStr = values[getIndex(config.dateCol)];
        const amountStr = values[getIndex(config.amountCol)];
        const description = values[getIndex(config.descriptionCol)] || '';
        const reference = values[getIndex(config.referenceCol)] || `CSV-${i}-${Date.now()}`;
        const currency = values[getIndex(config.currencyCol)] || 'CHF';

        if (!dateStr || !amountStr) continue;

        // Parser la date
        let date;
        if (config.dateFormat === 'DD.MM.YYYY') {
          const [d, m, y] = dateStr.split('.');
          date = new Date(y, m - 1, d).toISOString().split('T')[0];
        } else {
          date = new Date(dateStr).toISOString().split('T')[0];
        }

        // Parser le montant
        const amount = parseFloat(amountStr.replace(/['\s]/g, '').replace(',', '.'));

        // Vérifier doublon
        const existing = await directus.request(
          readItems('bank_transactions', {
            filter: {
              owner_company: { _eq: companyName },
              _or: [
                { bank_reference: { _eq: reference } },
                {
                  _and: [
                    { date: { _eq: date } },
                    { amount: { _eq: amount } },
                    { description: { _eq: description } }
                  ]
                }
              ]
            },
            limit: 1
          })
        );

        if (existing.length > 0) {
          results.duplicates++;
          continue;
        }

        // Créer la transaction
        await directus.request(
          createItem('bank_transactions', {
            owner_company: companyName,
            bank_reference: reference,
            date: date,
            amount: amount,
            currency: currency,
            description: description,
            reconciled: false,
            import_source: 'CSV',
            imported_at: new Date().toISOString()
          })
        );

        results.imported++;

      } catch (error) {
        results.errors++;
        results.details.push({
          line: i + 1,
          error: error.message
        });
      }
    }

    console.log(`📥 Import CSV terminé: ${results.imported} importées, ${results.duplicates} doublons, ${results.errors} erreurs`);
    return results;
  }

  // ==========================================
  // STATISTIQUES ET ANALYSE
  // ==========================================

  /**
   * Obtenir les statistiques de trésorerie
   * @param {string} companyName - Nom de l'entreprise
   * @param {Object} period - Période d'analyse
   * @returns {Promise<Object>} Statistiques de trésorerie
   */
  async getCashFlowStats(companyName, period = {}) {
    const directus = this.getDirectus();

    const now = new Date();
    const startDate = period.start || new Date(now.getFullYear(), now.getMonth() - 3, 1).toISOString();
    const endDate = period.end || now.toISOString();

    const transactions = await directus.request(
      readItems('bank_transactions', {
        filter: {
          owner_company: { _eq: companyName },
          date: { _between: [startDate, endDate] }
        },
        sort: ['date']
      })
    );

    // Calculer les flux par mois
    const monthlyFlows = {};
    for (const tx of transactions) {
      const month = tx.date.substring(0, 7); // YYYY-MM
      if (!monthlyFlows[month]) {
        monthlyFlows[month] = { income: 0, expenses: 0, net: 0, count: 0 };
      }

      const amount = parseFloat(tx.amount);
      if (amount > 0) {
        monthlyFlows[month].income += amount;
      } else {
        monthlyFlows[month].expenses += Math.abs(amount);
      }
      monthlyFlows[month].net += amount;
      monthlyFlows[month].count++;
    }

    // Totaux
    const totalIncome = transactions.filter(t => t.amount > 0).reduce((s, t) => s + parseFloat(t.amount), 0);
    const totalExpenses = transactions.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(parseFloat(t.amount)), 0);

    return {
      period: { start: startDate, end: endDate },
      company: companyName,
      totals: {
        income: totalIncome,
        expenses: totalExpenses,
        net: totalIncome - totalExpenses,
        transaction_count: transactions.length
      },
      monthly: monthlyFlows,
      averages: {
        monthly_income: totalIncome / (Object.keys(monthlyFlows).length || 1),
        monthly_expenses: totalExpenses / (Object.keys(monthlyFlows).length || 1)
      },
      currency: this.companyConfig[companyName]?.currency || 'CHF',
      generated_at: new Date().toISOString()
    };
  }

  /**
   * Prédire les flux de trésorerie futurs
   * @param {string} companyName - Nom de l'entreprise
   * @param {number} daysAhead - Nombre de jours à prévoir
   * @returns {Promise<Object>} Prévisions
   */
  async predictCashFlow(companyName, daysAhead = 30) {
    const directus = this.getDirectus();

    // Récupérer les factures à encaisser
    const clientInvoices = await this.getUnpaidClientInvoices(companyName);
    const expectedIncome = clientInvoices.reduce((sum, inv) => {
      const remaining = parseFloat(inv.remaining_amount || inv.total_ttc || inv.amount || 0);
      return sum + remaining;
    }, 0);

    // Récupérer les factures à payer
    const supplierInvoices = await this.getUnpaidSupplierInvoices(companyName);
    const expectedExpenses = supplierInvoices.reduce((sum, inv) => {
      const remaining = parseFloat(inv.remaining_amount || inv.total_ttc || inv.amount || 0);
      return sum + remaining;
    }, 0);

    // Factures en retard
    const now = new Date();
    const overdueInvoices = clientInvoices.filter(inv => {
      const dueDate = new Date(inv.due_date);
      return dueDate < now;
    });
    const overdueAmount = overdueInvoices.reduce((sum, inv) => {
      return sum + parseFloat(inv.remaining_amount || inv.total_ttc || inv.amount || 0);
    }, 0);

    // Factures dues dans les X jours
    const futureDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
    const dueSoonInvoices = clientInvoices.filter(inv => {
      const dueDate = new Date(inv.due_date);
      return dueDate >= now && dueDate <= futureDate;
    });

    return {
      company: companyName,
      forecast_period: {
        from: now.toISOString(),
        to: futureDate.toISOString(),
        days: daysAhead
      },
      expected_income: {
        total: expectedIncome,
        invoices_count: clientInvoices.length,
        overdue: {
          amount: overdueAmount,
          count: overdueInvoices.length
        },
        due_in_period: {
          amount: dueSoonInvoices.reduce((s, i) => s + parseFloat(i.remaining_amount || i.total_ttc || i.amount || 0), 0),
          count: dueSoonInvoices.length
        }
      },
      expected_expenses: {
        total: expectedExpenses,
        invoices_count: supplierInvoices.length
      },
      net_forecast: expectedIncome - expectedExpenses,
      currency: this.companyConfig[companyName]?.currency || 'CHF',
      generated_at: new Date().toISOString()
    };
  }
}

export const bankReconciliationService = new BankReconciliationService();
export default BankReconciliationService;
