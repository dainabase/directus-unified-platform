/**
 * Story 7.4 — Quote Signed to Deposit Invoice
 * POST /webhook/docuseal/signed — Receives DocuSeal webhook when a quote is signed
 *
 * Workflow:
 * 1. Validate DocuSeal webhook payload
 * 2. Fetch quote from Directus
 * 3. Calculate 30% deposit (configurable)
 * 4. Create deposit invoice in Invoice Ninja
 * 5. Update quote status in Directus
 * 6. Send deposit invoice email
 * 7. Log to workflow_executions
 */

import express from 'express';
import axios from 'axios';
import { directusGet, directusPost, directusPatch, addDays, formatCHF, logAutomation } from '../../lib/financeUtils.js';

const router = express.Router();

const WORKFLOW_NAME = '7.4-quote-signed-to-deposit';
const INVOICE_NINJA_URL = process.env.INVOICE_NINJA_URL || 'http://localhost:8085';
const INVOICE_NINJA_TOKEN = process.env.INVOICE_NINJA_TOKEN;
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

// ── Helper: Get deposit percentage from Directus settings ──

async function getDepositPercentage() {
  try {
    const settings = await directusGet('/items/settings', {
      'filter[key][_eq]': 'deposit_percentage',
      limit: 1
    });
    if (settings && settings.length > 0) {
      const pct = parseFloat(settings[0].value);
      if (pct > 0 && pct <= 100) return pct;
    }
  } catch {
    // Settings collection may not exist, use default
  }
  return 30; // Default: 30%
}

// ── Helper: Create Invoice Ninja deposit invoice ──

async function createDepositInvoice(quote, depositAmount, dueDate) {
  if (!INVOICE_NINJA_TOKEN) {
    console.warn(`[${WORKFLOW_NAME}] INVOICE_NINJA_TOKEN non configure, creation facture simulee`);
    return {
      id: `simulated-${Date.now()}`,
      number: `DEP-SIM-${quote.quote_number || quote.id}`,
      amount: depositAmount,
      simulated: true
    };
  }

  const invoiceData = {
    client_id: quote.invoice_ninja_client_id || quote.client_id || null,
    line_items: [
      {
        description: `Acompte 30% - ${quote.quote_number || `Devis #${quote.id}`}`,
        quantity: 1,
        cost: depositAmount
      }
    ],
    due_date: dueDate,
    custom_value1: quote.quote_number || '',
    custom_value2: String(quote.id),
    notes: `Facture d'acompte generee automatiquement suite a la signature du devis ${quote.quote_number || quote.id}`
  };

  try {
    const response = await axios.post(
      `${INVOICE_NINJA_URL}/api/v1/invoices`,
      invoiceData,
      {
        headers: {
          'X-API-TOKEN': INVOICE_NINJA_TOKEN,
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        timeout: 15000
      }
    );

    return response.data?.data || response.data;
  } catch (err) {
    console.error(`[${WORKFLOW_NAME}] Invoice Ninja erreur:`, err.response?.data || err.message);
    throw new Error(`Invoice Ninja: ${err.response?.data?.message || err.message}`);
  }
}

// ── Route: POST /webhook/docuseal/signed ──

router.post('/webhook/docuseal/signed', async (req, res) => {
  const startTime = Date.now();

  try {
    const payload = req.body;

    // 1. Log raw payload for debugging
    console.log(`[${WORKFLOW_NAME}] DocuSeal webhook recu:`, JSON.stringify(payload).substring(0, 500));

    // 2. Extract quote_id from payload metadata
    // DocuSeal sends: { event_type, timestamp, data: { submission_id, template_id, metadata: { quote_id }, ... } }
    const quoteId = payload.data?.metadata?.quote_id
      || payload.data?.metadata?.quoteId
      || payload.metadata?.quote_id
      || payload.quote_id
      || payload.data?.external_id;

    if (!quoteId) {
      console.warn(`[${WORKFLOW_NAME}] Webhook sans quote_id dans metadata:`, JSON.stringify(payload).substring(0, 300));
      return res.status(400).json({ error: 'quote_id introuvable dans le payload DocuSeal' });
    }

    // 3. Validate event type (only process completion events)
    const eventType = payload.event_type || payload.type || 'form.completed';
    if (eventType !== 'form.completed' && eventType !== 'submission.completed' && eventType !== 'signed') {
      console.log(`[${WORKFLOW_NAME}] Event type ignore: ${eventType}`);
      return res.json({ success: true, skipped: true, reason: `Event type ${eventType} non traite` });
    }

    // 4. Fetch quote from Directus
    const quote = await directusGet(`/items/quotes/${quoteId}`);
    if (!quote) {
      return res.status(404).json({ error: `Devis ${quoteId} introuvable` });
    }

    // Check if already processed
    if (quote.status === 'signed' && quote.deposit_invoice_id) {
      console.log(`[${WORKFLOW_NAME}] Devis ${quoteId} deja traite (deposit_invoice_id: ${quote.deposit_invoice_id})`);
      return res.json({ success: true, skipped: true, reason: 'Devis deja signe et facture d\'acompte creee' });
    }

    // 5. Calculate deposit amount
    const depositPercentage = await getDepositPercentage();
    const totalHT = parseFloat(quote.total_ht || quote.total || quote.amount || 0);
    if (totalHT <= 0) {
      return res.status(400).json({ error: `Devis ${quoteId} a un montant HT invalide: ${totalHT}` });
    }

    const depositAmount = Math.round(totalHT * depositPercentage) / 100;
    const dueDate = addDays(new Date(), 15);

    console.log(`[${WORKFLOW_NAME}] Devis ${quoteId}: total_ht=${totalHT}, deposit=${depositPercentage}% = ${depositAmount} CHF, echeance=${dueDate}`);

    // 6. Create deposit invoice in Invoice Ninja
    const invoice = await createDepositInvoice(quote, depositAmount, dueDate);

    // 7. Update quote in Directus
    const updateData = {
      status: 'signed',
      signed_at: new Date().toISOString(),
      deposit_invoice_id: String(invoice.id || invoice.number || ''),
      deposit_amount: depositAmount,
      deposit_percentage: depositPercentage
    };

    // Store DocuSeal submission data
    if (payload.data?.submission_id) {
      updateData.docuseal_submission_id = String(payload.data.submission_id);
    }
    if (payload.data?.documents) {
      updateData.signed_document_url = payload.data.documents[0]?.url || null;
    }

    await directusPatch(`/items/quotes/${quoteId}`, updateData);

    // 8. Send deposit invoice email via internal API
    try {
      const contact = quote.contact_id
        ? await directusGet(`/items/contacts/${typeof quote.contact_id === 'object' ? quote.contact_id.id : quote.contact_id}`)
        : null;

      if (contact && contact.email) {
        await axios.post(`${EMAIL_API_BASE}/quote-sent`, {
          quote_id: quoteId,
          template: 'deposit_invoice'
        }, { timeout: 10000 });
        console.log(`[${WORKFLOW_NAME}] Email facture acompte envoye a ${contact.email}`);
      }
    } catch (emailErr) {
      console.warn(`[${WORKFLOW_NAME}] Email non envoye: ${emailErr.message}`);
    }

    // 9. Log to workflow_executions
    const duration = Date.now() - startTime;
    await logWorkflowExecution({
      workflow: WORKFLOW_NAME,
      entity_type: 'quotes',
      entity_id: quoteId,
      status: 'success',
      input: {
        quote_number: quote.quote_number,
        total_ht: totalHT,
        deposit_percentage: depositPercentage,
        docuseal_event: eventType
      },
      output: {
        deposit_amount: depositAmount,
        invoice_id: invoice.id,
        invoice_number: invoice.number,
        due_date: dueDate,
        duration_ms: duration
      }
    });

    console.log(`[${WORKFLOW_NAME}] Devis ${quote.quote_number || quoteId} signe -> facture acompte ${formatCHF(depositAmount)} creee (${duration}ms)`);

    res.json({
      success: true,
      quote_id: quoteId,
      quote_number: quote.quote_number,
      deposit_amount: depositAmount,
      deposit_percentage: depositPercentage,
      invoice_id: invoice.id,
      invoice_number: invoice.number,
      due_date: dueDate,
      duration_ms: duration
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[${WORKFLOW_NAME}] Erreur:`, error.message);

    // Log failure
    await logWorkflowExecution({
      workflow: WORKFLOW_NAME,
      entity_type: 'quotes',
      entity_id: req.body?.data?.metadata?.quote_id || 'unknown',
      status: 'failed',
      input: { raw_payload: JSON.stringify(req.body).substring(0, 500) },
      output: { error: error.message, duration_ms: duration }
    });

    res.status(500).json({
      error: 'Erreur traitement signature devis',
      details: error.message
    });
  }
});

export default router;
