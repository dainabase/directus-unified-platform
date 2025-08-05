const RevolutClient = require('./revolut-client');
const axios = require('axios');

/**
 * Service de synchronisation Revolut -> Directus
 * Synchronise les comptes, transactions et paiements des 5 entreprises
 */
class RevolutSyncService {
  constructor(config) {
    this.revolut = new RevolutClient(config.revolut);
    this.directusUrl = config.directusUrl;
    this.directusToken = config.directusToken;
    
    // Instance axios pour Directus
    this.directus = axios.create({
      baseURL: this.directusUrl,
      headers: {
        'Authorization': `Bearer ${this.directusToken}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    // Map des entreprises
    this.companies = ['hypervisual', 'dynamics', 'lexia', 'nkreality', 'etekout'];
  }

  /**
   * Synchroniser tous les comptes d'une entreprise
   * @param {string} companyId - ID de l'entreprise
   * @returns {Promise<Object>} Résultat de la synchronisation
   */
  async syncCompanyAccounts(companyId) {
    console.log(`🏦 Début sync comptes Revolut pour ${companyId}`);
    
    try {
      const startTime = Date.now();
      
      // Récupérer comptes Revolut
      const accounts = await this.revolut.getAccounts(companyId);
      console.log(`📊 ${accounts.length} comptes trouvés pour ${companyId}`);
      
      let createdCount = 0;
      let updatedCount = 0;

      for (const account of accounts) {
        try {
          // Récupérer détails bancaires si disponible
          let bankDetails = null;
          try {
            bankDetails = await this.revolut.getAccountBankDetails(companyId, account.id);
          } catch (e) {
            console.log(`ℹ️ Pas de détails bancaires pour compte ${account.id}`);
          }

          // Vérifier si compte existe dans Directus
          const existing = await this.directus.get('/items/financial_accounts', {
            params: {
              filter: {
                external_id: { _eq: account.id },
                company_id: { _eq: companyId }
              }
            }
          });

          const accountData = {
            external_id: account.id,
            company_id: companyId,
            provider: 'revolut',
            currency: account.currency,
            account_type: account.state || 'active',
            account_name: account.name || `${account.currency} Account`,
            balance: account.balance ? parseFloat(account.balance) / 100 : 0, // Revolut en centimes
            is_active: account.state === 'active',
            iban: bankDetails?.iban || null,
            bic: bankDetails?.bic || null,
            account_number: bankDetails?.account_number || null,
            sort_code: bankDetails?.sort_code || null,
            routing_number: bankDetails?.routing_number || null,
            last_sync: new Date().toISOString(),
            metadata: JSON.stringify({
              revolut_data: account,
              bank_details: bankDetails
            })
          };

          if (existing.data.data.length === 0) {
            // Créer nouveau compte
            await this.directus.post('/items/financial_accounts', accountData);
            createdCount++;
            console.log(`✅ Compte créé: ${account.currency} (${account.id})`);
          } else {
            // Mettre à jour compte existant
            await this.directus.patch(
              `/items/financial_accounts/${existing.data.data[0].id}`,
              accountData
            );
            updatedCount++;
            console.log(`🔄 Compte mis à jour: ${account.currency} (${account.id})`);
          }

        } catch (error) {
          console.error(`❌ Erreur sync compte ${account.id}:`, error.message);
        }
      }

      // Synchroniser les transactions pour tous les comptes
      const transactionResult = await this.syncCompanyTransactions(companyId, accounts);

      const duration = Date.now() - startTime;
      const result = {
        success: true,
        companyId,
        accounts: {
          total: accounts.length,
          created: createdCount,
          updated: updatedCount
        },
        transactions: transactionResult,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      };

      console.log(`✅ Sync ${companyId} terminée:`, result);
      return result;

    } catch (error) {
      console.error(`❌ Erreur sync comptes ${companyId}:`, error.message);
      throw new Error(`Échec sync ${companyId}: ${error.message}`);
    }
  }

  /**
   * Synchroniser les transactions d'une entreprise
   * @param {string} companyId - ID de l'entreprise
   * @param {Array} accounts - Liste des comptes (optionnel)
   * @returns {Promise<Object>} Résultat de la synchronisation
   */
  async syncCompanyTransactions(companyId, accounts = null) {
    console.log(`💳 Sync transactions pour ${companyId}`);

    if (!accounts) {
      accounts = await this.revolut.getAccounts(companyId);
    }

    let totalTransactions = 0;
    let newTransactions = 0;

    // Période de sync (30 derniers jours par défaut)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    try {
      // Récupérer transactions de l'entreprise
      const transactions = await this.revolut.getTransactions(companyId, {
        from: thirtyDaysAgo.toISOString().split('T')[0],
        limit: 1000 // Maximum autorisé
      });

      totalTransactions = transactions.length;
      console.log(`📊 ${totalTransactions} transactions trouvées pour ${companyId}`);

      for (const tx of transactions) {
        try {
          // Vérifier si transaction existe déjà
          const existing = await this.directus.get('/items/transactions', {
            params: {
              filter: {
                external_id: { _eq: tx.id }
              }
            }
          });

          if (existing.data.data.length === 0) {
            // Déterminer le compte associé
            const accountId = this.findAccountForTransaction(tx, accounts);

            // Extraire les informations de la transaction
            const leg = tx.legs?.[0] || {};
            const merchant = tx.merchant || {};

            const transactionData = {
              external_id: tx.id,
              company_id: companyId,
              account_external_id: accountId,
              type: tx.type || 'unknown',
              state: tx.state || 'completed',
              amount: leg.amount ? parseFloat(leg.amount) / 100 : 0,
              fee: tx.fee ? parseFloat(tx.fee) / 100 : 0,
              currency: leg.currency || 'EUR',
              description: tx.reference || tx.description || merchant.name || 'Transaction Revolut',
              counterparty: merchant.name || leg.description || null,
              counterparty_account: leg.counterparty?.account_id || null,
              transaction_date: tx.created_at || tx.completed_at,
              completed_date: tx.completed_at,
              category: merchant.category || null,
              merchant_name: merchant.name || null,
              merchant_city: merchant.city || null,
              merchant_country: merchant.country || null,
              card_last_four: null, // À extraire si disponible
              metadata: JSON.stringify({
                revolut_data: tx,
                legs: tx.legs,
                merchant: merchant
              })
            };

            await this.directus.post('/items/transactions', transactionData);
            newTransactions++;

            if (newTransactions % 50 === 0) {
              console.log(`📊 ${newTransactions} nouvelles transactions synchronisées...`);
            }
          }

        } catch (error) {
          console.error(`❌ Erreur sync transaction ${tx.id}:`, error.message);
        }
      }

      console.log(`✅ Transactions ${companyId}: ${newTransactions} nouvelles sur ${totalTransactions}`);
      
      return {
        total: totalTransactions,
        new: newTransactions,
        existing: totalTransactions - newTransactions
      };

    } catch (error) {
      console.error(`❌ Erreur sync transactions ${companyId}:`, error.message);
      return {
        total: 0,
        new: 0,
        existing: 0,
        error: error.message
      };
    }
  }

  /**
   * Trouver le compte associé à une transaction
   * @param {Object} transaction - Transaction Revolut
   * @param {Array} accounts - Liste des comptes
   * @returns {string|null} ID du compte
   */
  findAccountForTransaction(transaction, accounts) {
    // Chercher dans les legs de la transaction
    const leg = transaction.legs?.[0];
    if (leg?.account_id) {
      return leg.account_id;
    }

    // Fallback: prendre le premier compte de la même devise
    if (leg?.currency) {
      const matchingAccount = accounts.find(acc => acc.currency === leg.currency);
      if (matchingAccount) {
        return matchingAccount.id;
      }
    }

    // Dernier recours: premier compte
    return accounts[0]?.id || null;
  }

  /**
   * Synchroniser toutes les entreprises
   * @returns {Promise<Array>} Résultats pour toutes les entreprises
   */
  async syncAllCompanies() {
    console.log('🚀 Début synchronisation complète Revolut');
    const results = [];

    for (const companyId of this.companies) {
      try {
        const result = await this.syncCompanyAccounts(companyId);
        results.push(result);
      } catch (error) {
        console.error(`❌ Échec sync ${companyId}:`, error.message);
        results.push({
          success: false,
          companyId,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }

    console.log('✅ Synchronisation complète terminée');
    return results;
  }

  /**
   * Obtenir les statistiques de synchronisation
   * @param {string} companyId - ID de l'entreprise (optionnel)
   * @returns {Promise<Object>} Statistiques
   */
  async getSyncStats(companyId = null) {
    try {
      const filter = companyId ? { company_id: { _eq: companyId } } : {};

      // Comptes par entreprise
      const accountsResponse = await this.directus.get('/items/financial_accounts', {
        params: {
          filter: { provider: { _eq: 'revolut' }, ...filter },
          aggregate: { countDistinct: 'company_id', sum: 'balance' },
          groupBy: ['company_id', 'currency']
        }
      });

      // Transactions récentes (7 derniers jours)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const transactionsResponse = await this.directus.get('/items/transactions', {
        params: {
          filter: {
            transaction_date: { _gte: sevenDaysAgo.toISOString() },
            ...filter
          },
          aggregate: { count: 'id', sum: 'amount' },
          groupBy: ['company_id']
        }
      });

      return {
        accounts: accountsResponse.data.data,
        recentTransactions: transactionsResponse.data.data,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Erreur récupération stats:', error.message);
      throw error;
    }
  }

  /**
   * Nettoyer les anciennes données (> 90 jours)
   * @param {string} companyId - ID de l'entreprise (optionnel)
   * @returns {Promise<Object>} Résultat du nettoyage
   */
  async cleanupOldData(companyId = null) {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    try {
      const filter = {
        transaction_date: { _lt: ninetyDaysAgo.toISOString() }
      };

      if (companyId) {
        filter.company_id = { _eq: companyId };
      }

      const result = await this.directus.delete('/items/transactions', {
        params: { filter }
      });

      console.log(`🧹 Nettoyage terminé: ${result.data.data.length} transactions supprimées`);
      return {
        deleted: result.data.data.length,
        cutoffDate: ninetyDaysAgo.toISOString()
      };

    } catch (error) {
      console.error('❌ Erreur nettoyage:', error.message);
      throw error;
    }
  }
}

module.exports = RevolutSyncService;