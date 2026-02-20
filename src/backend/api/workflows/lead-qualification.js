/**
 * Story 7.3 — Lead Qualification via Claude AI
 * POST /qualify/:leadId — Manual trigger to qualify a lead
 * POST /webhook/new-lead — Called by Directus hook when new lead created
 *
 * Uses Claude claude-sonnet-4-6 to analyze leads and produce structured qualification data.
 * Retry 3x on failure.
 */

import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { directusGet, directusPost, directusPatch, logAutomation } from '../../lib/financeUtils.js';
import axios from 'axios';

const router = express.Router();

const WORKFLOW_NAME = '7.3-lead-qualification';
const EMAIL_API_BASE = `http://localhost:${process.env.UNIFIED_PORT || 3000}/api/email`;

// ── Claude AI client (lazy init to avoid crash if key missing) ──

let anthropicClient = null;

function getAnthropicClient() {
  if (!anthropicClient) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not set');
    }
    anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return anthropicClient;
}

// ── System prompt for lead qualification ──

const QUALIFICATION_SYSTEM_PROMPT = `Tu es un assistant de qualification de leads pour HYPERVISUAL Switzerland, une agence de digital signage/LED/hologrammes a Fribourg.
Analyse ce lead et fournis un JSON structure avec:
- score (1-10): qualite du lead
- sector: secteur detecte
- priority: high/medium/low
- recommended_action: prochaine action recommandee
- language: fr/de/en/it
- summary: resume en 2-3 phrases

Reponds UNIQUEMENT avec le JSON, sans markdown, sans backticks, sans texte supplementaire.`;

// ── Core qualification logic with retry ──

async function qualifyLead(leadId, retries = 3) {
  // 1. Fetch lead from Directus
  const lead = await directusGet(`/items/leads/${leadId}`);
  if (!lead) {
    throw new Error(`Lead ${leadId} introuvable`);
  }

  // 2. Build user message from lead data
  const leadContext = JSON.stringify({
    name: `${lead.first_name || ''} ${lead.last_name || ''}`.trim(),
    company: lead.company_name || lead.company || null,
    email: lead.email || null,
    phone: lead.phone || null,
    message: lead.notes || lead.message || lead.description || null,
    source: lead.source || null,
    budget: lead.budget || null,
    website: lead.website || null
  }, null, 2);

  // 3. Call Claude API with retry logic
  let lastError = null;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const client = getAnthropicClient();
      const response = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: QUALIFICATION_SYSTEM_PROMPT,
        messages: [
          { role: 'user', content: `Analyse ce lead:\n${leadContext}` }
        ]
      });

      const rawText = response.content[0]?.text || '';

      // 4. Parse JSON response (handle potential markdown wrapping)
      let qualification;
      try {
        // Try direct parse first
        qualification = JSON.parse(rawText);
      } catch {
        // Try extracting JSON from response
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          qualification = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error(`Invalid JSON response from Claude: ${rawText.substring(0, 200)}`);
        }
      }

      // 5. Update lead in Directus
      const updateData = {
        qualification_score: qualification.score || 0,
        qualification_notes: qualification.summary || '',
        detected_language: qualification.language || 'fr',
        recommended_action: qualification.recommended_action || '',
        qualified_at: new Date().toISOString(),
        status: qualification.score >= 7 ? 'qualified' : (qualification.score >= 4 ? 'warm' : 'cold')
      };

      await directusPatch(`/items/leads/${leadId}`, updateData);

      // 6. If score >= 7: send confirmation email
      if (qualification.score >= 7) {
        try {
          await axios.post(`${EMAIL_API_BASE}/lead-confirmation`, {
            lead_id: leadId
          }, { timeout: 10000 });
          console.log(`[${WORKFLOW_NAME}] Email de confirmation envoye pour lead ${leadId} (score: ${qualification.score})`);
        } catch (emailErr) {
          console.warn(`[${WORKFLOW_NAME}] Email non envoye pour lead ${leadId}: ${emailErr.message}`);
        }
      }

      // 7. Log to workflow_executions
      await logWorkflowExecution({
        workflow: WORKFLOW_NAME,
        entity_type: 'leads',
        entity_id: leadId,
        status: 'success',
        input: { lead_name: `${lead.first_name || ''} ${lead.last_name || ''}`.trim(), source: lead.source },
        output: qualification,
        duration_ms: null
      });

      console.log(`[${WORKFLOW_NAME}] Lead ${leadId} qualifie: score=${qualification.score}, priority=${qualification.priority}`);

      return { lead_id: leadId, qualification, updated: updateData };

    } catch (err) {
      lastError = err;
      console.warn(`[${WORKFLOW_NAME}] Tentative ${attempt}/${retries} echouee pour lead ${leadId}: ${err.message}`);
      if (attempt < retries) {
        // Exponential backoff: 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)));
      }
    }
  }

  // All retries exhausted
  await logWorkflowExecution({
    workflow: WORKFLOW_NAME,
    entity_type: 'leads',
    entity_id: leadId,
    status: 'failed',
    input: { lead_id: leadId },
    output: { error: lastError?.message },
    duration_ms: null
  });

  throw lastError;
}

// ── Helper: Log to workflow_executions collection ──

async function logWorkflowExecution({ workflow, entity_type, entity_id, status, input, output, duration_ms }) {
  try {
    await directusPost('/items/workflow_executions', {
      workflow_name: workflow,
      entity_type,
      entity_id: String(entity_id),
      status,
      input_data: input || null,
      output_data: output || null,
      duration_ms: duration_ms || null,
      executed_at: new Date().toISOString()
    });
  } catch (err) {
    // Fallback to automation_logs if workflow_executions doesn't exist
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

// ── Routes ──

/**
 * POST /qualify/:leadId — Manual trigger to qualify a lead
 */
router.post('/qualify/:leadId', async (req, res) => {
  try {
    const { leadId } = req.params;
    if (!leadId) {
      return res.status(400).json({ error: 'leadId requis' });
    }

    const startTime = Date.now();
    const result = await qualifyLead(leadId);
    const duration = Date.now() - startTime;

    res.json({
      success: true,
      ...result,
      duration_ms: duration
    });
  } catch (error) {
    console.error(`[${WORKFLOW_NAME}] Erreur qualification lead ${req.params.leadId}:`, error.message);
    res.status(500).json({
      error: 'Erreur qualification lead',
      details: error.message,
      lead_id: req.params.leadId
    });
  }
});

/**
 * POST /webhook/new-lead — Called by Directus hook when new lead created
 * Expects body: { key: leadId } or { keys: [leadId] } or { payload: { id: leadId } }
 */
router.post('/webhook/new-lead', async (req, res) => {
  try {
    // Support multiple Directus webhook payload formats
    const leadId = req.body.key
      || req.body.keys?.[0]
      || req.body.payload?.id
      || req.body.id
      || req.body.lead_id;

    if (!leadId) {
      console.warn(`[${WORKFLOW_NAME}] Webhook recu sans lead_id:`, JSON.stringify(req.body).substring(0, 500));
      return res.status(400).json({ error: 'lead_id introuvable dans le payload' });
    }

    console.log(`[${WORKFLOW_NAME}] Webhook new-lead recu: lead_id=${leadId}`);

    // Process async — return 202 immediately
    res.status(202).json({ success: true, message: 'Qualification en cours', lead_id: leadId });

    // Run qualification in background
    try {
      await qualifyLead(leadId);
    } catch (err) {
      console.error(`[${WORKFLOW_NAME}] Erreur qualification async lead ${leadId}:`, err.message);
    }
  } catch (error) {
    console.error(`[${WORKFLOW_NAME}] Erreur webhook new-lead:`, error.message);
    res.status(500).json({ error: 'Erreur webhook', details: error.message });
  }
});

export default router;
