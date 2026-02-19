/**
 * F-04 : Ringover API Polling → Lead Directus
 * Detecte appels manques et termines → analyse LLM → Lead si pertinent
 * Polling toutes les 15 minutes
 * API : https://public-api.ringover.com/v2/
 * Auth : Header Authorization: API_KEY (sans Bearer)
 * REQ-LEAD — capture automatique telephone
 */

import OpenAI from 'openai';
import { createOrUpdateLead } from './lead-creator.js';

const RINGOVER_API = 'https://public-api.ringover.com/v2';

const CALL_ANALYSIS_PROMPT = `Tu es un assistant qui analyse des metadonnees d'appels telephoniques pour HYPERVISUAL Switzerland (location/vente d'ecrans LED geants, totems, kiosques, mobilier LED).

Determine si cet appel represente un lead commercial potentiel a suivre.

Reponds UNIQUEMENT en JSON :
{
  "is_lead": true/false,
  "reason": "explication courte",
  "phone": "numero appelant",
  "estimated_name": "si detectable sinon null",
  "estimated_company": "si detectable sinon null",
  "message": "resume de l'interaction en francais",
  "priority": "high|medium|low",
  "follow_up_needed": true/false
}

Regles :
- Appels manques > 10s = probablement un lead (follow_up_needed=true)
- Appels tres courts < 5s = probablement spam ou erreur (is_lead=false)
- Appels repondus > 30s = probablement un lead
- Numeros masques/prives = is_lead=false

Contexte de l'appel:`;

/**
 * Analyser un appel via OpenAI
 */
async function analyzeCallWithLLM(openai, callData) {
  try {
    const context = `
Numero appelant: ${callData.from_number || 'Inconnu'}
Numero appele: ${callData.to_number || ''}
Duree: ${callData.duration || 0} secondes
Type: ${callData.type || ''} (missed=manque, answered=repondu)
Date/heure: ${callData.start_time || ''}
Commentaire: ${callData.comment || 'aucun'}
Tags: ${callData.tags ? callData.tags.join(', ') : 'aucun'}`.trim();

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: CALL_ANALYSIS_PROMPT },
        { role: 'user', content: context }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1
    });
    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('[F-04 Ringover] Erreur analyse LLM:', error.message);
    return null;
  }
}

/**
 * Recuperer les appels recents via Ringover API
 */
async function fetchRecentCalls() {
  try {
    // 16 min pour overlap avec le polling 15 min
    const startDate = new Date(Date.now() - 16 * 60 * 1000).toISOString();

    const response = await fetch(
      `${RINGOVER_API}/calls?limit_count=50&start_date=${encodeURIComponent(startDate)}&order=DESC`,
      {
        headers: {
          Authorization: process.env.RINGOVER_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Ringover API error: ${response.status}`);
    }

    const data = await response.json();
    return data.call_list || [];
  } catch (error) {
    console.error('[F-04 Ringover] Erreur fetch calls:', error.message);
    return [];
  }
}

/**
 * Traiter les appels Ringover
 */
async function processRingoverCalls(directusGet, directusPost, directusPatch, logAutomation, hasSentRecently) {
  console.log('[F-04 Ringover] Polling appels...');
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const results = { processed: 0, leads: 0, skipped: 0, errors: 0 };

  const calls = await fetchRecentCalls();

  if (!calls.length) {
    console.log('[F-04 Ringover] Aucun appel recent');
    return results;
  }

  console.log(`[F-04 Ringover] ${calls.length} appel(s) a analyser`);

  for (const call of calls) {
    try {
      const callId = String(call.call_id || call.id);

      // Anti-doublon
      const isDuplicate = await hasSentRecently('F-04-ringover', callId);
      if (isDuplicate) {
        results.skipped++;
        continue;
      }

      // Log immediatement pour eviter double traitement
      await logAutomation({
        rule_name: 'F-04-ringover',
        entity_type: 'calls',
        entity_id: callId,
        status: 'processing'
      });

      // Skip appels depuis numeros internes HYPERVISUAL
      const fromNumber = call.from_number || '';
      if (fromNumber.startsWith('+4178327') || !fromNumber) {
        results.skipped++;
        continue;
      }

      // Analyser avec LLM
      const analysis = await analyzeCallWithLLM(openai, call);

      if (!analysis || !analysis.is_lead) {
        console.log(`[F-04 Ringover] Call ${callId} non-lead: ${analysis?.reason || 'N/A'}`);
        results.skipped++;
        continue;
      }

      console.log(`[F-04 Ringover] Lead detecte: ${fromNumber} — ${analysis.reason}`);

      const leadData = {
        first_name: analysis.estimated_name ? analysis.estimated_name.split(' ')[0] : '',
        last_name: analysis.estimated_name ? analysis.estimated_name.split(' ').slice(1).join(' ') : '',
        email: '',
        phone: fromNumber,
        company_name: analysis.estimated_company || '',
        message: analysis.message || `Appel ${call.type === 'missed' ? 'manque' : 'recu'} — ${call.duration || 0}s`,
        source_channel: 'ringover',
        source_detail: `Ringover: ${call.type || 'call'} ${call.duration || 0}s`,
        ringover_call_id: callId,
        call_duration: call.duration || 0,
        raw_data: call,
        openai_summary: JSON.stringify(analysis),
        status: 'new'
      };

      const lead = await createOrUpdateLead(directusGet, directusPost, directusPatch, leadData, 'ringover_polling');

      await logAutomation({
        rule_name: 'F-04-ringover',
        entity_type: 'leads',
        entity_id: callId,
        status: 'success',
        trigger_data: { lead_id: lead?.id, phone: fromNumber, priority: analysis.priority }
      });

      results.leads++;
      results.processed++;
    } catch (callError) {
      console.error(`[F-04 Ringover] Erreur traitement appel:`, callError.message);
      results.errors++;
    }
  }

  return results;
}

/**
 * Demarrer le polling Ringover toutes les 15 minutes
 */
function startRingoverPolling(directusGet, directusPost, directusPatch, logAutomation, hasSentRecently) {
  if (!process.env.RINGOVER_API_KEY) {
    console.warn('[F-04 Ringover] RINGOVER_API_KEY non configure — polling desactive');
    return null;
  }
  if (!process.env.OPENAI_API_KEY) {
    console.warn('[F-04 Ringover] OPENAI_API_KEY non configure — polling desactive');
    return null;
  }

  console.log('[F-04 Ringover] Demarrage polling (toutes les 15 min)');

  // Premiere execution apres 15 secondes
  setTimeout(() => {
    processRingoverCalls(directusGet, directusPost, directusPatch, logAutomation, hasSentRecently);
  }, 15000);

  // Puis toutes les 15 minutes
  const intervalId = setInterval(() => {
    processRingoverCalls(directusGet, directusPost, directusPatch, logAutomation, hasSentRecently);
  }, 15 * 60 * 1000);

  return intervalId;
}

export { startRingoverPolling, processRingoverCalls };
