/**
 * Story 7.5 — Payment to Project Activation
 * POST /webhook/revolut/payment — Receives Revolut payment webhook
 *
 * Workflow:
 * 1. Validate HMAC signature (Revolut webhook security)
 * 2. Parse payment data
 * 3. Match payment to invoice in Directus
 * 4. If deposit invoice + signed quote -> create project
 * 5. If final balance -> mark project completed
 * 6. Send payment confirmation email
 * 7. Log to workflow_executions
 */

import express from 'express';
import crypto from 'crypto';
import axios from 'axios';
import { directusGet, directusPost, directusPatch, logAutomation } from '../../lib/financeUtils.js';

const router = express.Router();

const WORKFLOW_NAME = '7.5-payment-to-project';
const EMAIL_API_BASE = `http://localhost:${process.env.UNIFIED_PORT || 3000}/api/email`;

// ── Helper: Log to workflow_executions collection ──

async function logWorkflowExecution({ workflow, entity_type, entity_id, status, input, output }) {
  try {
    await directusPost('/items/workflow_executions', {
      workflow_name: workflow,
      entity_type,
      entity_id: String(entity_id),
      status,
      input_data: input || null,
      output_data: output || null,
      executed_at: new Date().toISOString()
    });
  } catch (err) {
    console.warn(`[${WORKFLOW_NAME}] workflow_executions log failed, using automation_logs: ${err.message}`);
    await logAutomation({
      rule_name: workflow,
      entity_type,
      entity_id: String(entity_id),
      status,
      trigger_data: { ...input, ...output }
    });
  }
}

// ── Helper: Validate Revolut HMAC signature ──

function validateRevolutSignature(rawBody, signature) {
  const signingKey = process.env.REVOLUT_WEBHOOK_SECRET;
  if (!signingKey) {
    console.error(`[${WORKFLOW_NAME}] REVOLUT_WEBHOOK_SECRET non configure — webhook REJETE`);
    return false;
  }

  if (!signature) {
    return false;
  }

  try {
    const expectedSignature = crypto
      .createHmac('sha256', signingKey)
      .update(rawBody)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch (err) {
    console.error(`[${WORKFLOW_NAME}] Erreur validation HMAC:`, err.message);
    return false;
  }
}

// ── Helper: Match payment to invoice ──

async function matchPaymentToInvoice(reference, amount, currency) {
  // Strategy 1: Match by reference in client_invoices
  if (reference) {
    try {
      const invoices = await directusGet('/items/client_invoices', {
        'filter[reference][_contains]': reference,
        'filter[status][_in]': 'pending_payment,sent,pending',
        limit: 5,
        fields: '*,contact_id.*'
      });

      if (invoices && invoices.length > 0) {
        // Prefer exact amount match
        const exactMatch = invoices.find(inv => {
          const invAmount = parseFloat(inv.total || inv.amount || 0);
          return Math.abs(invAmount - amount) < 0.01;
        });
        return exactMatch || invoices[0];
      }
    } catch (err) {
      console.warn(`[${WORKFLOW_NAME}] Erreur recherche par reference:`, err.message);
    }
  }

  // Strategy 2: Match by invoice_number in reference
  if (reference) {
    try {
      const invoiceNumberMatch = reference.match(/(?:INV|FAC|DEP|SUP)-?\d+[-/]?\d*/i);
      if (invoiceNumberMatch) {
        const invoices = await directusGet('/items/client_invoices', {
          'filter[invoice_number][_contains]': invoiceNumberMatch[0],
          'filter[status][_in]': 'pending_payment,sent,pending',
          limit: 1,
          fields: '*,contact_id.*'
        });
        if (invoices && invoices.length > 0) return invoices[0];
      }
    } catch (err) {
      console.warn(`[${WORKFLOW_NAME}] Erreur recherche par invoice_number:`, err.message);
    }
  }

  // Strategy 3: Match by exact amount + currency + pending status
  try {
    const invoices = await directusGet('/items/client_invoices', {
      'filter[status][_in]': 'pending_payment,sent,pending',
      'filter[currency][_eq]': currency || 'CHF',
      limit: 50,
      fields: '*,contact_id.*'
    });

    if (invoices && invoices.length > 0) {
      const match = invoices.find(inv => {
        const invAmount = parseFloat(inv.total || inv.amount || 0);
        return Math.abs(invAmount - amount) < 0.01;
      });
      return match || null;
    }
  } catch (err) {
    console.warn(`[${WORKFLOW_NAME}] Erreur recherche par montant:`, err.message);
  }

  return null;
}

// ── Helper: Create project from signed quote ──

async function createProjectFromQuote(quote, invoice) {
  // Fetch quote details with relations
  const fullQuote = await directusGet(`/items/quotes/${typeof quote === 'object' ? quote.id : quote}`, {
    fields: '*,contact_id.*,company_id.*'
  });

  if (!fullQuote) {
    throw new Error(`Quote ${typeof quote === 'object' ? quote.id : quote} introuvable`);
  }

  const projectData = {
    name: fullQuote.title || fullQuote.name || `Projet - ${fullQuote.quote_number || fullQuote.id}`,
    description: fullQuote.description || '',
    status: 'active',
    quote_id: fullQuote.id,
    contact_id: typeof fullQuote.contact_id === 'object' ? fullQuote.contact_id?.id : fullQuote.contact_id,
    company_id: typeof fullQuote.company_id === 'object' ? fullQuote.company_id?.id : fullQuote.company_id,
    owner_company: fullQuote.owner_company || null,
    budget: parseFloat(fullQuote.total_ht || fullQuote.total || 0),
    currency: fullQuote.currency || 'CHF',
    start_date: new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString(),
    source: 'workflow-7.5-auto'
  };

  const project = await directusPost('/items/projects', projectData);
  console.log(`[${WORKFLOW_NAME}] Projet cree: ${project.id} — ${projectData.name}`);

  return project;
}

// ── Middleware: Parse raw body for HMAC validation ──
// Note: The main server.js already handles raw body exclusion for webhook paths.
// We use express.raw() here as a dedicated middleware.

const rawBodyParser = express.raw({ type: 'application/json', limit: '1mb' });

// ── Route: POST /webhook/revolut/payment ──

router.post('/webhook/revolut/payment', rawBodyParser, async (req, res) => {
  const startTime = Date.now();

  try {
    // 1. Get raw body and signature
    const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body));
    const signature = req.headers['revolut-signature'] || req.headers['x-revolut-signature'] || req.headers['x-revolut-signature-sha256'];

    // 2. Validate HMAC signature
    if (!validateRevolutSignature(rawBody, signature)) {
      console.warn(`[${WORKFLOW_NAME}] Signature HMAC invalide`);
      return res.status(401).json({ error: 'Signature invalide' });
    }

    // 3. Parse payment data
    let payload;
    try {
      payload = Buffer.isBuffer(req.body) ? JSON.parse(req.body.toString()) : req.body;
    } catch {
      return res.status(400).json({ error: 'Payload JSON invalide' });
    }

    console.log(`[${WORKFLOW_NAME}] Revolut webhook recu:`, JSON.stringify(payload).substring(0, 500));

    // Extract payment info from Revolut payload format
    const paymentData = payload.data || payload;
    const amount = parseFloat(paymentData.legs?.[0]?.amount || paymentData.amount || 0);
    const currency = paymentData.legs?.[0]?.currency || paymentData.currency || 'CHF';
    const reference = paymentData.reference || paymentData.description || '';
    const counterparty = paymentData.counterparty?.name || paymentData.counterparty_name || '';
    const revolutTxId = paymentData.id || payload.id || '';
    const paymentDate = paymentData.completed_at || paymentData.created_at || new Date().toISOString();

    if (amount <= 0) {
      console.log(`[${WORKFLOW_NAME}] Montant <= 0, ignore: ${amount} ${currency}`);
      return res.json({ success: true, skipped: true, reason: 'Montant non positif' });
    }

    // Deduplication: reject replayed webhooks
    if (revolutTxId) {
      try {
        const existing = await directusGet('/items/payments', {
          'filter[revolut_transaction_id][_eq]': revolutTxId,
          limit: 1,
          fields: 'id'
        });
        if (existing && existing.length > 0) {
          console.log(`[${WORKFLOW_NAME}] Transaction ${revolutTxId} deja traitee — ignore (replay protection)`);
          return res.json({ success: true, skipped: true, reason: 'Deja traite (deduplication)' });
        }
      } catch (dedupErr) {
        console.warn(`[${WORKFLOW_NAME}] Dedup check failed, continuing: ${dedupErr.message}`);
      }
    }

    // Only process incoming payments (credit)
    const direction = paymentData.legs?.[0]?.direction || paymentData.direction || paymentData.type;
    if (direction === 'sell' || direction === 'debit' || direction === 'outgoing') {
      console.log(`[${WORKFLOW_NAME}] Paiement sortant ignore: ${direction}`);
      return res.json({ success: true, skipped: true, reason: 'Paiement sortant' });
    }

    console.log(`[${WORKFLOW_NAME}] Paiement entrant: ${amount} ${currency} de ${counterparty} — ref: ${reference}`);

    // 4. Match payment to invoice
    const matchedInvoice = await matchPaymentToInvoice(reference, amount, currency);

    if (matchedInvoice) {
      console.log(`[${WORKFLOW_NAME}] Facture matchee: ${matchedInvoice.invoice_number} (${matchedInvoice.id})`);

      // 4a. Create payment record in Directus
      const paymentRecord = await directusPost('/items/payments', {
        amount,
        currency,
        payment_date: paymentDate,
        reference: reference || revolutTxId,
        source: 'revolut',
        revolut_transaction_id: revolutTxId,
        counterparty_name: counterparty,
        invoice_id: matchedInvoice.id,
        status: 'confirmed',
        owner_company: matchedInvoice.owner_company || null
      });

      // 4b. Mark invoice as paid
      await directusPatch(`/items/client_invoices/${matchedInvoice.id}`, {
        status: 'paid',
        payment_date: paymentDate,
        payment_reference: revolutTxId,
        paid_amount: amount
      });

      let project = null;

      // 4c. If deposit invoice + linked signed quote -> create project
      if (
        (matchedInvoice.type === 'deposit' || matchedInvoice.type === 'acompte') &&
        matchedInvoice.quote_id
      ) {
        try {
          const linkedQuote = await directusGet(`/items/quotes/${typeof matchedInvoice.quote_id === 'object' ? matchedInvoice.quote_id.id : matchedInvoice.quote_id}`);
          if (linkedQuote && (linkedQuote.status === 'signed' || linkedQuote.status === 'accepted')) {
            project = await createProjectFromQuote(linkedQuote, matchedInvoice);

            // Update quote with project reference
            await directusPatch(`/items/quotes/${linkedQuote.id}`, {
              project_id: project.id,
              status: 'converted'
            });
          }
        } catch (projectErr) {
          console.error(`[${WORKFLOW_NAME}] Erreur creation projet:`, projectErr.message);
        }
      }

      // 4d. If final balance -> mark project completed
      if (matchedInvoice.type === 'final' || matchedInvoice.type === 'solde') {
        try {
          const projectId = matchedInvoice.project_id;
          if (projectId) {
            await directusPatch(`/items/projects/${typeof projectId === 'object' ? projectId.id : projectId}`, {
              status: 'completed',
              completed_at: new Date().toISOString()
            });
            console.log(`[${WORKFLOW_NAME}] Projet ${projectId} marque comme termine (paiement solde)`);
          }
        } catch (projectErr) {
          console.error(`[${WORKFLOW_NAME}] Erreur finalisation projet:`, projectErr.message);
        }
      }

      // 4e. Send payment confirmation email
      try {
        await axios.post(`${EMAIL_API_BASE}/payment-confirmed`, {
          payment_id: paymentRecord.id,
          invoice_id: matchedInvoice.id
        }, { timeout: 10000 });
        console.log(`[${WORKFLOW_NAME}] Email de confirmation envoye`);
      } catch (emailErr) {
        console.warn(`[${WORKFLOW_NAME}] Email non envoye: ${emailErr.message}`);
      }

      // 4f. Log success
      const duration = Date.now() - startTime;
      await logWorkflowExecution({
        workflow: WORKFLOW_NAME,
        entity_type: 'payments',
        entity_id: paymentRecord.id,
        status: 'success',
        input: {
          revolut_tx_id: revolutTxId,
          amount,
          currency,
          counterparty,
          reference
        },
        output: {
          matched_invoice: matchedInvoice.invoice_number,
          invoice_id: matchedInvoice.id,
          project_created: project ? project.id : null,
          duration_ms: duration
        }
      });

      res.json({
        success: true,
        payment_id: paymentRecord.id,
        matched_invoice: matchedInvoice.invoice_number,
        invoice_status: 'paid',
        project_created: project ? { id: project.id, name: project.name } : null,
        duration_ms: duration
      });

    } else {
      // 5. No match found — log and notify CEO
      console.warn(`[${WORKFLOW_NAME}] Aucune facture matchee pour: ${amount} ${currency} — ref: ${reference}`);

      // Create unmatched payment record
      try {
        await directusPost('/items/payments', {
          amount,
          currency,
          payment_date: paymentDate,
          reference: reference || revolutTxId,
          source: 'revolut',
          revolut_transaction_id: revolutTxId,
          counterparty_name: counterparty,
          status: 'unmatched',
          notes: `Paiement Revolut non rapproche automatiquement. Ref: ${reference}`
        });
      } catch (err) {
        console.warn(`[${WORKFLOW_NAME}] Erreur creation paiement non-matche:`, err.message);
      }

      // Create notification for CEO
      try {
        await directusPost('/items/notifications', {
          title: 'Paiement Revolut non rapproche',
          message: `Paiement de ${amount} ${currency} de ${counterparty} (ref: ${reference}) ne correspond a aucune facture en attente.`,
          type: 'warning',
          target_role: 'admin',
          status: 'unread',
          link: '/superadmin/finance'
        });
      } catch (notifErr) {
        console.warn(`[${WORKFLOW_NAME}] Notification non creee:`, notifErr.message);
      }

      const duration = Date.now() - startTime;
      await logWorkflowExecution({
        workflow: WORKFLOW_NAME,
        entity_type: 'payments',
        entity_id: revolutTxId || 'unmatched',
        status: 'warning',
        input: { revolut_tx_id: revolutTxId, amount, currency, counterparty, reference },
        output: { matched: false, reason: 'Aucune facture correspondante', duration_ms: duration }
      });

      res.json({
        success: true,
        matched: false,
        amount,
        currency,
        counterparty,
        reference,
        message: 'Paiement recu mais non rapproche — notification CEO creee'
      });
    }

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[${WORKFLOW_NAME}] Erreur:`, error.message);

    await logWorkflowExecution({
      workflow: WORKFLOW_NAME,
      entity_type: 'payments',
      entity_id: 'error',
      status: 'failed',
      input: { raw: JSON.stringify(req.body).substring(0, 300) },
      output: { error: error.message, duration_ms: duration }
    });

    res.status(500).json({
      error: 'Erreur traitement paiement',
      details: error.message
    });
  }
});

export default router;
