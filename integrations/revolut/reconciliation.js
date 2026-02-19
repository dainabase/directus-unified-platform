/**
 * G-02 : Algorithme rapprochement multi-criteres
 * G-04 : Activation automatique projet a reception acompte
 *
 * Criteres (CDC REQ-RECO-001) :
 * 1. Montant exact ±0.05 CHF arrondi suisse (40 pts)
 * 2. Reference QR 27 chiffres (35 pts)
 * 3. Date ±3 jours (15 pts)
 * 4. Fuzzy match nom client 80% (10 pts)
 * Score final → rapprochement auto si >= 85%
 *
 * Champs client_invoices verifies via MCP :
 *   id(uuid), invoice_number, client_name, amount(decimal), status, due_date,
 *   project_id, qr_reference, revolut_transaction_id, payment_confirmed_at
 *
 * Champs projects verifies via MCP :
 *   id(uuid), name, status, activated_at, activation_method
 */

import axios from 'axios';

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_TOKEN = process.env.DIRECTUS_ADMIN_TOKEN;
const HEADERS = {
  Authorization: `Bearer ${DIRECTUS_TOKEN}`,
  'Content-Type': 'application/json'
};

// ── Helpers ──

async function directusGet(path, params = {}) {
  const res = await axios.get(`${DIRECTUS_URL}${path}`, { headers: HEADERS, params });
  return res.data.data;
}

async function directusPatch(path, data) {
  const res = await axios.patch(`${DIRECTUS_URL}${path}`, data, { headers: HEADERS });
  return res.data.data;
}

async function directusPost(path, data) {
  const res = await axios.post(`${DIRECTUS_URL}${path}`, data, { headers: HEADERS });
  return res.data.data;
}

// ── Similarite Levenshtein normalisee (0-100) ──

function similarity(s1, s2) {
  if (!s1 || !s2) return 0;
  s1 = s1.toLowerCase().trim();
  s2 = s2.toLowerCase().trim();
  if (s1 === s2) return 100;

  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  if (longer.length === 0) return 100;

  const costs = new Array(longer.length + 1);
  for (let j = 0; j <= longer.length; j++) costs[j] = j;

  for (let i = 1; i <= shorter.length; i++) {
    let prev = costs[0];
    costs[0] = i;
    for (let j = 1; j <= longer.length; j++) {
      const temp = costs[j];
      if (shorter[i - 1] === longer[j - 1]) {
        costs[j] = prev;
      } else {
        costs[j] = 1 + Math.min(prev, costs[j], costs[j - 1]);
      }
      prev = temp;
    }
  }

  return Math.round((1 - costs[longer.length] / longer.length) * 100);
}

// ── Verifier reference QR 27 chiffres ──

function matchQRReference(txRef, invoiceQR) {
  if (!txRef || !invoiceQR) return false;
  const cleanTx = txRef.replace(/\s/g, '');
  const cleanQR = invoiceQR.replace(/\s/g, '');
  return cleanTx === cleanQR || cleanTx.includes(cleanQR) || cleanQR.includes(cleanTx);
}

// ── Algorithme principal de scoring ──

export function calculateMatchScore(transaction, invoice) {
  let score = 0;
  const reasons = [];

  // 1. Montant exact (40 points) — arrondi suisse 0.05 CHF
  const txAmount = Math.abs(parseFloat(transaction.amount) || 0);
  const invAmount = parseFloat(invoice.amount || 0);
  const amountDiff = Math.abs(txAmount - invAmount);

  if (invAmount > 0) {
    if (amountDiff <= 0.05) {
      score += 40;
      reasons.push('montant_exact');
    } else if (amountDiff <= 1) {
      score += 25;
      reasons.push('montant_approx');
    } else if (amountDiff / invAmount <= 0.02) {
      score += 15;
      reasons.push('montant_ecart_2pct');
    }
  }

  // 2. Reference QR 27 chiffres (35 points)
  if (matchQRReference(transaction.reference, invoice.qr_reference)) {
    score += 35;
    reasons.push('qr_match');
  }

  // 3. Date ±3 jours (15 points)
  const txDate = new Date(transaction.date || transaction.date_created);
  const invDate = new Date(invoice.due_date || invoice.date_created);
  if (!isNaN(txDate) && !isNaN(invDate)) {
    const daysDiff = Math.abs((txDate - invDate) / (1000 * 60 * 60 * 24));
    if (daysDiff <= 1) {
      score += 15;
      reasons.push('date_exact');
    } else if (daysDiff <= 3) {
      score += 10;
      reasons.push('date_proche');
    } else if (daysDiff <= 7) {
      score += 5;
      reasons.push('date_semaine');
    }
  }

  // 4. Fuzzy match nom client (10 points)
  const txDescription = transaction.description || transaction.reference || '';
  const clientName = invoice.client_name || '';
  if (clientName && txDescription) {
    const nameSim = similarity(txDescription, clientName);
    if (nameSim >= 80) {
      score += 10;
      reasons.push(`fuzzy_${nameSim}pct`);
    } else if (nameSim >= 60) {
      score += 5;
      reasons.push(`fuzzy_partiel_${nameSim}pct`);
    }
  }

  return { score: Math.min(score, 100), reasons };
}

// ── Recuperer factures en attente de paiement ──

async function getPendingInvoices() {
  const invoices = await directusGet('/items/client_invoices', {
    'filter[status][_in]': 'sent,partial',
    limit: 200,
    fields: '*'
  });
  return invoices || [];
}

// ── Rapprocher une transaction avec les factures existantes ──

export async function reconcileTransaction(transaction) {
  try {
    const invoices = await getPendingInvoices();

    if (!invoices.length) {
      return { matched: false, reason: 'no_pending_invoices', suggestions: [] };
    }

    // Calculer score pour chaque facture
    const candidates = invoices
      .map(invoice => ({
        invoice,
        ...calculateMatchScore(transaction, invoice)
      }))
      .filter(c => c.score > 0)
      .sort((a, b) => b.score - a.score);

    // Top 3 suggestions pour le dashboard
    const suggestions = candidates.slice(0, 3).map(c => ({
      invoice_id: c.invoice.id,
      invoice_number: c.invoice.invoice_number,
      client_name: c.invoice.client_name,
      amount: c.invoice.amount,
      score: c.score,
      reasons: c.reasons
    }));

    const best = candidates[0];

    if (best && best.score >= 85) {
      // Rapprochement automatique
      await applyReconciliation(transaction, best.invoice, best.score, 'auto', best.reasons);
      return {
        matched: true,
        auto: true,
        score: best.score,
        invoice: best.invoice,
        suggestions
      };
    }

    // Score insuffisant → suggestions pour validation manuelle
    if (transaction.id) {
      await directusPatch(`/items/bank_transactions/${transaction.id}`, {
        reconciliation_status: 'unmatched',
        match_score: best?.score || 0,
        suggestions: suggestions
      });
    }

    return {
      matched: false,
      auto: false,
      score: best?.score || 0,
      suggestions
    };
  } catch (error) {
    console.error('[Reconciliation] Erreur:', error.message);
    return { matched: false, error: error.message, suggestions: [] };
  }
}

// ── Appliquer un rapprochement ──

export async function applyReconciliation(transaction, invoice, score, method, reasons) {
  // MAJ bank_transaction
  await directusPatch(`/items/bank_transactions/${transaction.id}`, {
    reconciliation_status: method === 'auto' ? 'auto_matched' : 'manual_matched',
    matched_invoice_id: invoice.id,
    match_score: score,
    match_method: method
  });

  // MAJ facture — marquer payee
  await directusPatch(`/items/client_invoices/${invoice.id}`, {
    status: 'paid',
    revolut_transaction_id: transaction.revolut_transaction_id || transaction.id,
    payment_confirmed_at: new Date().toISOString()
  });

  // Creer enregistrement reconciliation
  await directusPost('/items/reconciliations', {
    transaction_id: transaction.id,
    invoice_id: invoice.id,
    score,
    method,
    reasons: reasons,
    reconciled_at: new Date().toISOString(),
    status: 'completed'
  });

  console.log(`[Reconciliation] ${method} — Score: ${score}% — Facture: ${invoice.invoice_number}`);
}

// ── G-04 : Activer projet si paiement acompte confirme (REQ-FACT-006) ──

export async function activateProjectIfDeposit(invoice, transaction) {
  if (!invoice?.project_id) return;

  try {
    // Verifier si c'est une facture d'acompte
    const isDeposit = invoice.invoice_number?.toLowerCase().includes('acompte') ||
                      invoice.type === 'deposit' ||
                      invoice.description?.toLowerCase().includes('acompte');

    if (!isDeposit) return;

    // Verifier que le projet n'est pas deja actif
    const project = await directusGet(`/items/projects/${invoice.project_id}`);
    if (project?.status === 'active') return;

    // Activer le projet
    await directusPatch(`/items/projects/${invoice.project_id}`, {
      status: 'active',
      activated_at: new Date().toISOString(),
      activation_method: 'revolut_webhook'
    });

    console.log(`[G-04] Projet ${invoice.project_id} active automatiquement — paiement Revolut confirme`);

    // Declencher email confirmation (Phase E - E-03)
    try {
      await axios.post('http://localhost:3000/api/email/payment-confirmed', {
        payment_id: transaction.id
      }, { headers: { 'Content-Type': 'application/json' } });
    } catch (e) {
      console.error('[G-04] Erreur declenchement email:', e.message);
    }
  } catch (error) {
    console.error('[G-04] Erreur activation projet:', error.message);
  }
}
