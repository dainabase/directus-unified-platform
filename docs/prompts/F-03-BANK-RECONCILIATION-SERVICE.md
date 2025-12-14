
    
    if (invoiceNumber && description.includes(invoiceNumber)) {
      score += 15; // Référence facture trouvée
    } else if (clientName && description.includes(clientName.split(' ')[0])) {
      score += 10; // Nom client/fournisseur trouvé
    }

    return score / maxScore;
  }

  /**
   * Récupérer les factures clients non payées
   */
  async getUnpaidClientInvoices(directus, companyName) {
    return directus.request(
      readItems('client_invoices', {
        filter: {
          owner_company: { _eq: companyName },
          status: { _in: ['sent', 'pending', 'overdue'] }
        },
        fields: ['id', 'invoice_number', 'client_name', 'amount', 'currency', 'date', 'due_date', 'status']
      })
    );
  }

  /**
   * Récupérer les factures fournisseurs non payées
   */
  async getUnpaidSupplierInvoices(directus, companyName) {
    return directus.request(
      readItems('supplier_invoices', {
        filter: {
          owner_company: { _eq: companyName },
          status: { _in: ['pending', 'approved', 'overdue'] }
        },
        fields: ['id', 'invoice_number', 'supplier_name', 'amount', 'currency', 'date', 'due_date', 'status']
      })
    );
  }

  /**
   * Confirmer un rapprochement
   */
  async confirmReconciliation(directus, transactionId, invoice, invoiceType) {
    const now = new Date().toISOString();
    
    // 1. Mettre à jour la transaction
    await directus.request(
      updateItem('bank_transactions', transactionId, {
        reconciled: true,
        reconciled_at: now,
        reconciled_invoice_id: invoice.id,
        reconciled_invoice_type: invoiceType,
        reconciliation_type: 'auto'
      })
    );

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
    await directus.request(
      createItem('payments', {
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
      })
    );

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
    await directus.request(
      updateItem('bank_transactions', transactionId, {
        suggested_match: null,
        reconciliation_type: 'manual'
      })
    );

    return { success: true, message: 'Rapprochement validé' };
  }

  /**
   * Rejeter une suggestion
   */
  async rejectSuggestion(transactionId) {
    const directus = this.getDirectus();
    
    await directus.request(
      updateItem('bank_transactions', transactionId, {
        suggested_match: null
      })
    );

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
      directus.request(readItems('bank_transactions', {
        filter: {
          owner_company: { _eq: companyName },
          date: { _between: [startDate, endDate] }
        },
        aggregate: { count: '*', sum: ['amount'] }
      })),
      directus.request(readItems('bank_transactions', {
        filter: {
          owner_company: { _eq: companyName },
          date: { _between: [startDate, endDate] },
          reconciled: { _eq: true }
        },
        aggregate: { count: '*' }
      })),
      directus.request(readItems('bank_transactions', {
        filter: {
          owner_company: { _eq: companyName },
          date: { _between: [startDate, endDate] },
          reconciled: { _eq: false },
          suggested_match: { _nnull: true }
        },
        aggregate: { count: '*' }
      }))
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
    await directus.request(
      updateItem('bank_transactions', transactionId, {
        reconciliation_type: 'manual'
      })
    );

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
    await directus.request(
      updateItem('bank_transactions', transactionId, {
        reconciled: false,
        reconciled_at: null,
        reconciled_invoice_id: null,
        reconciled_invoice_type: null,
        reconciliation_type: null
      })
    );

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
```

## Instructions pour Claude Code
1. Créer le fichier dans `src/backend/services/finance/`
2. Vérifier que les collections `bank_transactions`, `client_invoices`, `supplier_invoices` existent
3. Ajouter les champs manquants si nécessaire (voir section suivante)

## Champs à ajouter dans Directus

### Collection `bank_transactions`
```
- reconciled: boolean (default: false)
- reconciled_at: datetime
- reconciled_invoice_id: uuid
- reconciled_invoice_type: string (client_invoice | supplier_invoice)
- reconciliation_type: string (auto | manual | suggested)
- suggested_match: json
```

### Collections `client_invoices` et `supplier_invoices`
```
- payment_transaction_id: uuid (relation vers bank_transactions)
- paid_at: datetime
```

## Test
```javascript
import { bankReconciliationService } from './bank-reconciliation.service.js';

// Lancer le rapprochement automatique
const results = await bankReconciliationService.autoReconcile('HYPERVISUAL');
console.log(results);

// Voir les suggestions en attente
const suggestions = await bankReconciliationService.getPendingSuggestions('HYPERVISUAL');
console.log(suggestions);

// Rapport
const report = await bankReconciliationService.getReconciliationReport('HYPERVISUAL');
console.log(report);
```
