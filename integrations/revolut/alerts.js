/**
 * G-05 : Alertes transactions non rapprochees > 5 jours
 * Polling horaire — cree des notifications dans Directus
 *
 * Champs notifications verifies via MCP :
 *   id(uuid), name, description, status, owner_company
 */

import axios from 'axios';

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_TOKEN = process.env.DIRECTUS_ADMIN_TOKEN;
const HEADERS = {
  Authorization: `Bearer ${DIRECTUS_TOKEN}`,
  'Content-Type': 'application/json'
};

/**
 * Verifier et alerter sur les transactions non rapprochees > 5 jours
 */
export async function checkUnmatchedTransactions() {
  try {
    const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();

    const res = await axios.get(`${DIRECTUS_URL}/items/bank_transactions`, {
      headers: HEADERS,
      params: {
        'filter[reconciliation_status][_eq]': 'unmatched',
        'filter[date][_lt]': fiveDaysAgo.split('T')[0],
        'filter[state][_eq]': 'completed',
        limit: 50,
        fields: 'id,amount,currency,description,date,reference'
      }
    });

    const unmatched = res.data.data || [];
    if (!unmatched.length) {
      console.log('[G-05 Alertes] Aucune transaction non rapprochee > 5 jours');
      return { alerts: 0 };
    }

    console.log(`[G-05 Alertes] ${unmatched.length} transaction(s) non rapprochee(s) > 5 jours`);

    let alertsCreated = 0;
    for (const tx of unmatched) {
      try {
        // Verifier qu'une alerte n'existe pas deja pour cette transaction
        const existingAlert = await axios.get(`${DIRECTUS_URL}/items/automation_logs`, {
          headers: HEADERS,
          params: {
            'filter[rule_name][_eq]': 'G-05-unmatched-alert',
            'filter[entity_id][_eq]': tx.id,
            limit: 1
          }
        });

        if (existingAlert.data.data?.length > 0) continue;

        // Creer notification
        await axios.post(`${DIRECTUS_URL}/items/notifications`, {
          name: `Transaction non rapprochee — ${Math.abs(tx.amount)} ${tx.currency}`,
          description: `La transaction Revolut du ${tx.date} (${Math.abs(tx.amount)} ${tx.currency}, ref: ${tx.reference || 'N/A'}) n'a pas ete rapprochee depuis plus de 5 jours.`,
          status: 'active'
        }, { headers: HEADERS });

        // Logger pour anti-doublon
        await axios.post(`${DIRECTUS_URL}/items/automation_logs`, {
          rule_name: 'G-05-unmatched-alert',
          entity_type: 'bank_transactions',
          entity_id: tx.id,
          status: 'success',
          trigger_data: { amount: tx.amount, currency: tx.currency, date: tx.date }
        }, { headers: HEADERS });

        alertsCreated++;
      } catch (err) {
        console.error(`[G-05] Erreur alerte tx ${tx.id}:`, err.message);
      }
    }

    return { alerts: alertsCreated, total: unmatched.length };
  } catch (error) {
    console.error('[G-05 Alertes] Erreur:', error.message);
    return { alerts: 0, error: error.message };
  }
}

/**
 * Demarrer le monitoring des alertes (polling horaire)
 */
export function startAlertsMonitor() {
  console.log('[G-05 Alertes] Demarrage monitoring transactions non rapprochees (horaire)');

  // Premiere execution apres 30 secondes
  setTimeout(checkUnmatchedTransactions, 30000);

  // Puis toutes les heures
  const intervalId = setInterval(checkUnmatchedTransactions, 60 * 60 * 1000);
  return intervalId;
}
