/**
 * Shared LLM Lead Extraction Service — Phase F
 * Used by F-02 (WhatsApp), F-03 (Email), F-04 (Ringover)
 * Uses Claude API (Anthropic) as primary, OpenAI as fallback
 */

import Anthropic from '@anthropic-ai/sdk';

const LEAD_SYSTEM_PROMPT = `Tu es un assistant de qualification de leads pour HYPERVISUAL Switzerland,
specialiste en ecrans LED geants, totems, kiosques, hologrammes, mobilier LED.
Analyse le message et extrais les informations structurees.
Reponds UNIQUEMENT en JSON valide, sans markdown, sans backticks.`;

const LEAD_SCHEMA_INSTRUCTION = `
Schema de sortie obligatoire :
{
  "is_lead": true/false,
  "confidence": 0-100,
  "first_name": "",
  "last_name": "",
  "company_name": "",
  "email": "",
  "phone": "",
  "type_projet": "location|achat|installation|software|inconnu",
  "equipment_type": "",
  "localisation": "",
  "event_date": "",
  "budget_estimate": null,
  "notes": "resume en 3-5 lignes",
  "score": 1-5,
  "langue_detectee": "fr|de|en|it",
  "urgency": "high|medium|low"
}

Regles de scoring (1-5) :
- budget > 10000 CHF : +2 points (base 1)
- budget 3000-10000 CHF : +1 point
- event_date dans les 30 jours : +1 point
- Champs complets (email + phone + company) : +1 point
- Type projet precise (pas "inconnu") : +1 point
Maximum 5 points.`;

/**
 * Call Claude API for lead extraction.
 * @param {string} systemPrompt - context-specific system prompt
 * @param {string} userPrompt - the message/content to analyze
 * @returns {Object|null} parsed JSON or null on failure
 */
export async function callLLM(systemPrompt, userPrompt) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (apiKey) {
    // Primary: Claude API
    try {
      const anthropic = new Anthropic({ apiKey });
      const response = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }]
      });
      const text = response.content[0]?.text || '';
      // Extract JSON from response (handle potential markdown wrapping)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
      return null;
    } catch (err) {
      console.error('[LLM] Claude API error:', err.message);
    }
  }

  // Fallback: OpenAI if available
  if (process.env.OPENAI_API_KEY) {
    try {
      const { default: OpenAI } = await import('openai');
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1
      });
      return JSON.parse(response.choices[0].message.content);
    } catch (err) {
      console.error('[LLM] OpenAI fallback error:', err.message);
    }
  }

  console.warn('[LLM] No API key configured (ANTHROPIC_API_KEY or OPENAI_API_KEY)');
  return null;
}

/**
 * Extract lead from WhatsApp message.
 */
export async function extractLeadFromWhatsApp(message, phone) {
  const system = `${LEAD_SYSTEM_PROMPT}\n${LEAD_SCHEMA_INSTRUCTION}`;
  const user = `Message WhatsApp de ${phone}: "${message}"`;
  const result = await callLLM(system, user);
  if (!result) {
    return {
      is_lead: true,
      confidence: 50,
      first_name: '',
      last_name: '',
      company_name: '',
      phone,
      notes: message,
      score: 2,
      langue_detectee: 'fr'
    };
  }
  return result;
}

/**
 * Extract lead from email.
 */
export async function extractLeadFromEmail(from, subject, body) {
  const system = `${LEAD_SYSTEM_PROMPT}
Analyse cet email et determine s'il s'agit d'une demande commerciale potentielle.
Si ce n'est pas une demande commerciale (spam, newsletter, facture fournisseur) : is_lead=false.
${LEAD_SCHEMA_INSTRUCTION}`;
  const user = `DE: ${from}\nSUJET: ${subject}\n\nCORPS:\n${(body || '').slice(0, 3000)}`;
  return callLLM(system, user);
}

/**
 * Extract lead from phone call transcript/metadata.
 */
export async function extractLeadFromCall(transcript, fromNumber, duration) {
  const system = `${LEAD_SYSTEM_PROMPT}
Analyse les metadonnees de cet appel telephonique.
Regles supplementaires :
- Appels manques > 10s = probablement un lead
- Appels tres courts < 5s = probablement spam (is_lead=false)
- Appels repondus > 30s = probablement un lead
- Numeros masques = is_lead=false
${LEAD_SCHEMA_INSTRUCTION}`;

  const user = transcript
    ? `Transcription appel de ${fromNumber} (${duration}s):\n${transcript}`
    : `Appel de ${fromNumber} (${duration}s) — pas de transcription disponible`;

  const result = await callLLM(system, user);
  if (!result && fromNumber) {
    return {
      is_lead: duration > 10,
      confidence: 30,
      phone: fromNumber,
      notes: `Appel de ${fromNumber} (${duration}s)`,
      score: duration > 30 ? 3 : 2,
      follow_up_needed: duration > 10
    };
  }
  return result;
}
