/**
 * G-01 : Sync transactions Revolut → Directus bank_transactions
 * Utilise par webhook (temps reel) et polling de secours (horaire)
 *
 * Champs bank_transactions verifies via MCP :
 *   id(uuid), description, amount(decimal), type, date, revolut_transaction_id,
 *   currency, reference, state, owner_company_id, reconciliation_status,
 *   matched_invoice_id, match_score, match_method, raw_data, suggestions
 */

import axios from 'axios';

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_TOKEN = process.env.DIRECTUS_ADMIN_TOKEN;
const HEADERS = {
  Authorization: `Bearer ${DIRECTUS_TOKEN}`,
  'Content-Type': 'application/json'
};

/**
 * Sauvegarder une transaction Revolut dans Directus (upsert par revolut_transaction_id)
 */
export async function saveTransaction(revolutTx) {
  const revolutId = revolutTx.id;

  // Verifier si deja existante
  const existing = await axios.get(`${DIRECTUS_URL}/items/bank_transactions`, {
    headers: HEADERS,
    params: { 'filter[revolut_transaction_id][_eq]': revolutId, limit: 1 }
  });

  const leg = revolutTx.legs?.[0] || {};
  const txData = {
    revolut_transaction_id: revolutId,
    amount: leg.amount || revolutTx.amount || 0,
    currency: leg.currency || revolutTx.currency || 'CHF',
    description: revolutTx.reference || revolutTx.merchant?.name || '',
    reference: revolutTx.reference || '',
    state: revolutTx.state || 'completed',
    type: revolutTx.type || 'transfer',
    date: revolutTx.created_at ? revolutTx.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
    reconciliation_status: 'unmatched',
    raw_data: revolutTx,
    owner_company_id: determineOwnerCompany(leg.account_id)
  };

  if (existing.data.data?.length > 0) {
    const existingTx = existing.data.data[0];
    // Mettre a jour si etat change
    const res = await axios.patch(
      `${DIRECTUS_URL}/items/bank_transactions/${existingTx.id}`,
      { state: txData.state, raw_data: txData.raw_data },
      { headers: HEADERS }
    );
    console.log(`[Sync] Transaction mise a jour: ${revolutId}`);
    return { ...existingTx, ...res.data.data };
  }

  // Creer nouvelle transaction
  const res = await axios.post(
    `${DIRECTUS_URL}/items/bank_transactions`,
    txData,
    { headers: HEADERS }
  );
  console.log(`[Sync] Transaction sauvegardee: ${revolutId} — ${txData.amount} ${txData.currency}`);
  return res.data.data;
}

/**
 * Sync toutes les transactions recentes depuis l'API Revolut (polling de secours)
 */
export async function syncRecentTransactions(revolut, hoursBack = 24) {
  try {
    const from = new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString();
    const transactions = await revolut.getTransactions({ from, count: 100 });

    if (!Array.isArray(transactions)) {
      console.error('[Sync] Reponse API inattendue:', typeof transactions);
      return { synced: 0, error: 'Invalid API response' };
    }

    console.log(`[Sync] ${transactions.length} transaction(s) a synchroniser`);
    let synced = 0;

    for (const tx of transactions) {
      try {
        await saveTransaction(tx);
        synced++;
      } catch (err) {
        console.error(`[Sync] Erreur tx ${tx.id}:`, err.message);
      }
    }

    return { synced, total: transactions.length };
  } catch (error) {
    console.error('[Sync] Erreur sync:', error.message);
    return { synced: 0, error: error.message };
  }
}

/**
 * Determiner l'owner_company a partir du compte Revolut
 * Les 5 entreprises ont chacune un compte Revolut distinct
 */
function determineOwnerCompany(accountId) {
  // Mapping a completer avec les vrais IDs de comptes Revolut
  // Pour l'instant, default HYPERVISUAL
  return null;
}
