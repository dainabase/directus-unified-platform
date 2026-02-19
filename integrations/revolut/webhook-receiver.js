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
import { saveTransaction } from './sync-transactions.js';

const router = express.Router();

/**
 * Verification signature webhook Revolut (HMAC-SHA256)
 */
function verifyRevolutSignature(rawBody, signature, secret) {
  if (!secret) return true; // skip en dev si pas configure
  if (!signature) return false;

  try {
    const expected = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'utf8'),
      Buffer.from(expected, 'utf8')
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
  const signature = req.headers['revolut-signature'] || req.headers['revolut-request-timestamp-signature'];
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
