/**
 * G-01 : Webhook Revolut — Reception transactions en temps reel
 * Events : TransactionCreated, TransactionStateChanged
 * Signing secret : REVOLUT_WEBHOOK_SECRET (env)
 *
 * IMPORTANT : express.raw() OBLIGATOIRE avant express.json()
 * pour pouvoir verifier la signature HMAC sur le body brut
 */

import express from 'express';
import crypto from 'crypto';
import axios from 'axios';
import { saveTransaction } from './sync-transactions.js';

const router = express.Router();

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_TOKEN = process.env.DIRECTUS_ADMIN_TOKEN;

/**
 * Check if a Revolut transaction has already been processed (replay protection).
 */
async function isAlreadyProcessed(revolutTxId) {
  if (!revolutTxId) return false;
  try {
    const res = await axios.get(`${DIRECTUS_URL}/items/bank_transactions`, {
      headers: { Authorization: `Bearer ${DIRECTUS_TOKEN}`, 'Content-Type': 'application/json' },
      params: { 'filter[revolut_transaction_id][_eq]': revolutTxId, limit: 1, fields: 'id' }
    });
    return (res.data?.data?.length || 0) > 0;
  } catch {
    return false;
  }
}

/**
 * Verification signature webhook Revolut (HMAC-SHA256)
 * SECURITY: Refuse ALL requests if secret is not configured.
 */
function verifyRevolutSignature(rawBody, signature, secret) {
  if (!secret) {
    console.error('[G-01 Webhook] REVOLUT_WEBHOOK_SECRET non configure — webhook REJETE');
    return false;
  }
  if (!signature) return false;

  try {
    const expected = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expected, 'hex')
    );
  } catch {
    return false;
  }
}

/**
 * POST /api/revolut/webhook-receiver
 * Body brut (express.raw) pour verification signature
 */
router.post('/', express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['revolut-signature'] || req.headers['x-revolut-signature'] || req.headers['x-revolut-signature-sha256'];
  const rawBody = typeof req.body === 'string' ? req.body : req.body.toString();

  // Verifier signature
  if (!verifyRevolutSignature(rawBody, signature, process.env.REVOLUT_WEBHOOK_SECRET)) {
    console.error('[G-01 Webhook] Signature invalide');
    return res.status(401).json({ error: 'Invalid signature' });
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  console.log('[G-01 Webhook] Event recu:', event.event, event.data?.id);

  // Repondre immediatement a Revolut (delai max 10s)
  res.json({ received: true });

  // Traitement asynchrone
  try {
    if (event.event === 'TransactionCreated' || event.event === 'TransactionStateChanged') {
      const transaction = event.data;

      // Deduplication: reject replayed webhooks
      if (await isAlreadyProcessed(transaction.id)) {
        console.log(`[G-01 Webhook] Transaction ${transaction.id} deja traitee — ignore (replay protection)`);
        return;
      }

      // Sauvegarder en base
      const savedTx = await saveTransaction(transaction);

      // Tenter rapprochement automatique si transaction completee
      if (transaction.state === 'completed' && savedTx) {
        try {
          // Import dynamique pour eviter les imports circulaires
          const { reconcileTransaction, activateProjectIfDeposit } = await import('./reconciliation.js');
          const result = await reconcileTransaction(savedTx);

          if (result.matched && result.score >= 85) {
            console.log(`[G-01 Webhook] Rapprochement auto: ${result.score}% — Facture ${result.invoice?.invoice_number}`);
            await activateProjectIfDeposit(result.invoice, transaction);
          }
        } catch (reconcileErr) {
          console.error('[G-01 Webhook] Erreur reconciliation:', reconcileErr.message);
        }
      }
    }
  } catch (error) {
    console.error('[G-01 Webhook] Erreur traitement:', error.message);
  }
});

export default router;
