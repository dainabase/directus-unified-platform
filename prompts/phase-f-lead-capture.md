# PHASE F — CAPTURE LEADS MULTICANAL
## Prompt Claude Code — Exécution Autonome

---

## 🎯 OBJECTIF
Implémenter la capture automatique de leads depuis 3 canaux :
- **F-01** : WordPress (Fluent Form Pro, form ID 17) → Lead Directus via webhook
- **F-03** : Email IMAP (info@hypervisual.ch) → Lead via extraction LLM OpenAI
- **F-04** : Ringover (API polling) → Lead via transcription + LLM OpenAI

**F-02 (WhatsApp)** : Reporté à Phase F-bis.

---

## 📋 PRÉREQUIS — LIRE EN PREMIER

### Skills obligatoires à lire avant tout code :
```bash
cat ~/.claude/skills-repos/claude-code-plugins-plus/skills/backend-api/SKILL.md
cat ~/.claude/skills-repos/claude-code-plugins-plus/skills/directus-integration/SKILL.md
cat ~/.claude/skills-repos/claude-code-plugins-plus/skills/webhook-handler/SKILL.md
```

### Vérifier champs existants via MCP Directus :
```bash
# Champs de la collection leads
curl -s "http://localhost:8055/fields/leads" \
  -H "Authorization: Bearer hypervisual-admin-static-token-2026" | node -e "
const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
d.data.forEach(f=>console.log(f.field, '-', f.type));
"

# Champs de lead_sources
curl -s "http://localhost:8055/fields/lead_sources" \
  -H "Authorization: Bearer hypervisual-admin-static-token-2026" | node -e "
const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
d.data.forEach(f=>console.log(f.field, '-', f.type));
"
```

### Variables d'environnement nécessaires (ajouter au .env) :
```env
# Ringover
RINGOVER_API_KEY=edeca2a8e584783035b068f2a21789621566e9cd

# Email IMAP
IMAP_HOST=mail.hypervisual.ch
IMAP_PORT=993
IMAP_USER=info@hypervisual.ch
IMAP_PASSWORD=PLACEHOLDER_A_COMPLETER
IMAP_TLS=true

# WordPress webhook secret
WP_WEBHOOK_SECRET=hypervisual-wp-secret-2026

# OpenAI (déjà existant dans le projet)
# OPENAI_API_KEY=déjà configuré
```

---

## 🗄️ COLLECTIONS DIRECTUS CONCERNÉES

Collections existantes confirmées via MCP :
- `leads` — collection principale
- `lead_sources` — sources des leads (WordPress, Email, Ringover)
- `lead_activities` — historique interactions
- `automation_logs` — anti-doublon

### Champs à ajouter si manquants (vérifier d'abord via MCP) :
```
leads :
  - source_channel (string) : 'wordpress' | 'email' | 'ringover' | 'whatsapp' | 'manual'
  - source_detail (text) : détail brut (URL form, objet email, numéro appelant)
  - raw_data (json) : payload brut original
  - openai_summary (text) : résumé LLM si applicable
  - ringover_call_id (string) : ID appel Ringover si source=ringover
  - call_duration (integer) : durée en secondes si source=ringover

lead_sources :
  - code (string) : identifiant court ('wp_form_17', 'imap_info', 'ringover_polling')
```

---

## 📁 FICHIERS À CRÉER

```
src/backend/api/leads/
├── index.js              # Router Express principal
├── wp-webhook.js         # F-01 : Réception webhook Fluent Form
├── imap-monitor.js       # F-03 : Polling IMAP + extraction LLM
├── ringover-polling.js   # F-04 : Polling Ringover API + LLM
└── lead-creator.js       # Service commun : création lead dans Directus
```

---

## 📖 STORY F-01 — WORDPRESS FLUENT FORM → LEAD

### Contexte
- Site WordPress : `hypervisual-wp.local` (dev local)
- Plugin : **Fluent Form Pro**
- Formulaire ID : **17** (`[fluentform id="17"]`)
- En production, l'URL sera `https://hypervisual.ch`

### Mechanism
Fluent Form Pro envoie un webhook POST JSON à notre API quand le form 17 est soumis.

### Fichier : `src/backend/api/leads/wp-webhook.js`

```javascript
/**
 * F-01 : WordPress Fluent Form Pro → Lead Directus
 * Webhook receiver pour le formulaire ID 17
 */
const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const { createOrUpdateLead } = require('./lead-creator');

// Vérification signature HMAC (optionnelle mais recommandée)
function verifyWebhookSignature(req) {
  const secret = process.env.WP_WEBHOOK_SECRET;
  if (!secret) return true; // skip si pas configuré
  const signature = req.headers['x-fluent-signature'] || req.headers['x-webhook-signature'];
  if (!signature) return false;
  const computed = crypto.createHmac('sha256', secret)
    .update(JSON.stringify(req.body))
    .digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(computed));
}

// POST /api/leads/wp-webhook
router.post('/', async (req, res) => {
  try {
    // Log réception
    console.log('[F-01 WP Webhook] Payload reçu:', JSON.stringify(req.body).slice(0, 200));

    // Extraction des champs Fluent Form (adapter selon les champs réels du form 17)
    // Les noms de champs Fluent Form sont personnalisables — mapping flexible
    const payload = req.body;
    const fields = payload.data || payload.fields || payload;

    const leadData = {
      // Champs standard — adapter aux noms réels des champs du form 17
      first_name: fields.first_name || fields.prenom || fields.name?.split(' ')[0] || '',
      last_name: fields.last_name || fields.nom || fields.name?.split(' ').slice(1).join(' ') || '',
      email: fields.email || fields.email_address || '',
      phone: fields.phone || fields.telephone || fields.mobile || '',
      company_name: fields.company || fields.entreprise || fields.societe || '',
      message: fields.message || fields.description || fields.besoin || '',
      
      // Métadonnées
      source_channel: 'wordpress',
      source_detail: `Fluent Form #17 — ${payload.form_title || 'Contact Form'}`,
      raw_data: payload,
      status: 'new',
    };

    // Anti-doublon : vérifier si email déjà traité dans les 30 dernières minutes
    const isDuplicate = await checkDuplicate('wp_form_17', leadData.email);
    if (isDuplicate) {
      console.log('[F-01] Doublon détecté, skip:', leadData.email);
      return res.json({ success: true, message: 'Duplicate skipped' });
    }

    // Créer le lead
    const lead = await createOrUpdateLead(leadData, 'wp_form_17');
    
    // Log automation
    await logAutomation('wp_form_17', lead.id, 'success');

    res.json({ success: true, lead_id: lead.id });
  } catch (error) {
    console.error('[F-01 WP Webhook] Erreur:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

async function checkDuplicate(ruleName, entityId) {
  try {
    const response = await fetch(
      `http://localhost:8055/items/automation_logs?filter[rule_name][_eq]=${ruleName}&filter[entity_id][_eq]=${encodeURIComponent(entityId)}&filter[date_created][_gte]=${new Date(Date.now() - 30 * 60000).toISOString()}&limit=1`,
      { headers: { 'Authorization': `Bearer ${process.env.DIRECTUS_TOKEN || 'hypervisual-admin-static-token-2026'}` } }
    );
    const data = await response.json();
    return data.data && data.data.length > 0;
  } catch { return false; }
}

async function logAutomation(ruleName, entityId, status) {
  try {
    await fetch('http://localhost:8055/items/automation_logs', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.DIRECTUS_TOKEN || 'hypervisual-admin-static-token-2026'}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ rule_name: ruleName, entity_id: String(entityId), status })
    });
  } catch (e) { console.error('logAutomation error:', e.message); }
}

module.exports = router;
```

### Configuration WordPress (instructions pour Jean)
Dans WordPress admin → Fluent Forms → Form #17 → Settings → Integrations → Webhooks :
- URL : `http://localhost:8055` en dev → `https://api.hypervisual.ch/api/leads/wp-webhook` en prod  
- **En développement local** : utiliser ngrok pour exposer l'endpoint
  ```bash
  ngrok http 3001
  # Mettre l'URL ngrok dans Fluent Form webhook
  ```
- Method : POST
- Content-Type : application/json
- Body : Form Data (JSON)

---

## 📖 STORY F-03 — EMAIL IMAP → LEAD

### Contexte
- Adresse surveillée : `info@hypervisual.ch`
- Protocole : IMAP/SMTP classique avec TLS
- Méthode : Polling IMAP toutes les 5 minutes via node-imap ou imapflow
- Extraction : OpenAI GPT-4o-mini pour identifier leads potentiels

### Packages à installer
```bash
cd src/backend && npm install imapflow mailparser
```

### Fichier : `src/backend/api/leads/imap-monitor.js`

```javascript
/**
 * F-03 : IMAP Email Monitor → Lead Directus
 * Polling info@hypervisual.ch toutes les 5 minutes
 * Extraction intelligente via OpenAI
 */
const { ImapFlow } = require('imapflow');
const { simpleParser } = require('mailparser');
const { createOrUpdateLead } = require('./lead-creator');
const { OpenAI } = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const IMAP_CONFIG = {
  host: process.env.IMAP_HOST || 'mail.hypervisual.ch',
  port: parseInt(process.env.IMAP_PORT) || 993,
  secure: process.env.IMAP_TLS !== 'false',
  auth: {
    user: process.env.IMAP_USER || 'info@hypervisual.ch',
    pass: process.env.IMAP_PASSWORD
  },
  logger: false
};

// Prompt LLM pour extraction données lead depuis email
const EXTRACTION_PROMPT = `Tu es un assistant qui extrait des informations de contact depuis des emails reçus par HYPERVISUAL Switzerland (location/vente d'écrans LED géants, totems, kiosques, mobilier LED).

Analyse cet email et détermine s'il s'agit d'une demande commerciale potentielle.

Réponds UNIQUEMENT en JSON avec ce format exact :
{
  "is_lead": true/false,
  "confidence": 0-100,
  "first_name": "...",
  "last_name": "...",
  "email": "...",
  "phone": "...",
  "company_name": "...",
  "message": "résumé concis en français de la demande",
  "interest_type": "location|vente|information|autre",
  "urgency": "high|medium|low"
}

Si ce n'est pas une demande commerciale (spam, newsletter, facture fournisseur, etc.) : is_lead=false.`;

async function extractLeadFromEmail(subject, body, from) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: EXTRACTION_PROMPT },
        { role: 'user', content: `DE: ${from}\nSUJET: ${subject}\n\nCORPS:\n${body.slice(0, 3000)}` }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1
    });
    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('[F-03 IMAP] Erreur extraction LLM:', error.message);
    return null;
  }
}

async function processNewEmails() {
  const client = new ImapFlow(IMAP_CONFIG);
  
  try {
    await client.connect();
    const lock = await client.getMailboxLock('INBOX');
    
    try {
      // Chercher emails non lus des 24 dernières heures
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const messages = await client.search({ unseen: true, since });
      
      console.log(`[F-03 IMAP] ${messages.length} email(s) non lu(s) trouvé(s)`);
      
      for (const uid of messages) {
        try {
          const message = await client.fetchOne(uid, { source: true });
          const parsed = await simpleParser(message.source);
          
          const from = parsed.from?.text || '';
          const subject = parsed.subject || '';
          const body = parsed.text || parsed.html?.replace(/<[^>]+>/g, ' ') || '';
          
          // Anti-doublon : vérifier Message-ID
          const messageId = parsed.messageId || `email-${uid}`;
          const isDuplicate = await checkEmailDuplicate(messageId);
          if (isDuplicate) {
            console.log(`[F-03 IMAP] Email déjà traité: ${messageId}`);
            continue;
          }
          
          // Extraction LLM
          const extracted = await extractLeadFromEmail(subject, body, from);
          
          if (!extracted || !extracted.is_lead || extracted.confidence < 60) {
            console.log(`[F-03 IMAP] Email non-lead ou confiance faible (${extracted?.confidence}%): ${subject}`);
            // Log quand même pour traçabilité
            await logEmailProcessed(messageId, false);
            continue;
          }
          
          console.log(`[F-03 IMAP] Lead détecté (${extracted.confidence}%): ${extracted.first_name} ${extracted.last_name}`);
          
          // Créer le lead
          const leadData = {
            first_name: extracted.first_name || '',
            last_name: extracted.last_name || '',
            email: extracted.email || from.match(/<(.+)>/)?.[1] || from,
            phone: extracted.phone || '',
            company_name: extracted.company_name || '',
            message: extracted.message || subject,
            source_channel: 'email',
            source_detail: `Email: ${subject}`,
            openai_summary: JSON.stringify(extracted),
            raw_data: { subject, from, messageId },
            status: 'new',
          };
          
          const lead = await createOrUpdateLead(leadData, 'imap_info');
          await logEmailProcessed(messageId, true, lead.id);
          
          // Marquer comme lu
          await client.messageFlagsAdd(uid, ['\\Seen']);
          
        } catch (msgError) {
          console.error(`[F-03 IMAP] Erreur traitement message ${uid}:`, msgError.message);
        }
      }
    } finally {
      lock.release();
    }
    
    await client.logout();
  } catch (error) {
    console.error('[F-03 IMAP] Erreur connexion:', error.message);
  }
}

async function checkEmailDuplicate(messageId) {
  try {
    const response = await fetch(
      `http://localhost:8055/items/automation_logs?filter[rule_name][_eq]=imap_info&filter[entity_id][_eq]=${encodeURIComponent(messageId)}&limit=1`,
      { headers: { 'Authorization': `Bearer ${process.env.DIRECTUS_TOKEN || 'hypervisual-admin-static-token-2026'}` } }
    );
    const data = await response.json();
    return data.data && data.data.length > 0;
  } catch { return false; }
}

async function logEmailProcessed(messageId, isLead, leadId = null) {
  try {
    await fetch('http://localhost:8055/items/automation_logs', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.DIRECTUS_TOKEN || 'hypervisual-admin-static-token-2026'}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        rule_name: 'imap_info',
        entity_id: messageId,
        status: isLead ? 'success' : 'skipped',
        metadata: leadId ? { lead_id: leadId } : null
      })
    });
  } catch (e) { console.error('logEmailProcessed error:', e.message); }
}

// Démarrer le polling toutes les 5 minutes
function startImapMonitor() {
  if (!process.env.IMAP_PASSWORD) {
    console.warn('[F-03 IMAP] IMAP_PASSWORD non configuré — monitor désactivé');
    return;
  }
  console.log('[F-03 IMAP] Démarrage monitoring info@hypervisual.ch (polling 5 min)');
  processNewEmails(); // Première exécution immédiate
  setInterval(processNewEmails, 5 * 60 * 1000); // Puis toutes les 5 min
}

module.exports = { startImapMonitor, processNewEmails };
```

---

## 📖 STORY F-04 — RINGOVER POLLING → LEAD

### Contexte
- API Ringover v2 : `https://public-api.ringover.com/v2/`
- Auth : Header `Authorization: API_KEY` (sans Bearer)
- Méthode : Polling toutes les 15 minutes pour les appels terminés
- Endpoint : `GET /v2/calls?limit_count=50&start_date=TIMESTAMP`
- Transcription : OpenAI Whisper si audio disponible, sinon résumé depuis métadonnées
- **Pas de webhook possible** → polling uniquement

### Fichier : `src/backend/api/leads/ringover-polling.js`

```javascript
/**
 * F-04 : Ringover API Polling → Lead Directus
 * Détecte appels manqués et appels terminés → analyse LLM → Lead si pertinent
 * Polling toutes les 15 minutes
 * API Key : process.env.RINGOVER_API_KEY
 */
const { createOrUpdateLead } = require('./lead-creator');
const { OpenAI } = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const RINGOVER_API = 'https://public-api.ringover.com/v2';

const CALL_ANALYSIS_PROMPT = `Tu es un assistant qui analyse des métadonnées d'appels téléphoniques pour HYPERVISUAL Switzerland (location/vente d'écrans LED géants, totems, kiosques, mobilier LED).

Détermine si cet appel représente un lead commercial potentiel à suivre.

Réponds UNIQUEMENT en JSON :
{
  "is_lead": true/false,
  "reason": "explication courte",
  "phone": "numéro appelant",
  "estimated_name": "si détectable sinon null",
  "estimated_company": "si détectable sinon null",
  "message": "résumé de l'interaction en français",
  "priority": "high|medium|low",
  "follow_up_needed": true/false
}

Contexte de l'appel:`;

async function analyzeCallWithLLM(callData) {
  try {
    const context = `
Numéro appelant: ${callData.from_number || 'Inconnu'}
Numéro appelé: ${callData.to_number || ''}
Durée: ${callData.duration || 0} secondes
Type: ${callData.type || ''} (missed=manqué, answered=répondu)
Date/heure: ${callData.start_time || ''}
Commentaire: ${callData.comment || 'aucun'}
Tags: ${callData.tags?.join(', ') || 'aucun'}
    `.trim();
    
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

async function fetchRecentCalls(sinceTimestamp) {
  try {
    const startDate = sinceTimestamp || new Date(Date.now() - 16 * 60 * 1000).toISOString(); // 16min pour overlap
    
    const response = await fetch(
      `${RINGOVER_API}/calls?limit_count=50&start_date=${encodeURIComponent(startDate)}&order=DESC`,
      {
        headers: {
          'Authorization': process.env.RINGOVER_API_KEY,
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

async function processRingoverCalls() {
  console.log('[F-04 Ringover] Polling appels...');
  
  const calls = await fetchRecentCalls();
  
  if (!calls.length) {
    console.log('[F-04 Ringover] Aucun appel récent');
    return;
  }
  
  console.log(`[F-04 Ringover] ${calls.length} appel(s) à analyser`);
  
  for (const call of calls) {
    try {
      const callId = call.call_id || call.id;
      
      // Anti-doublon
      const isDuplicate = await checkCallDuplicate(callId);
      if (isDuplicate) continue;
      
      // Log immédiatement pour éviter double traitement
      await logCallProcessed(callId, false);
      
      // Skip appels internes (même prefix)
      const fromNumber = call.from_number || '';
      if (fromNumber.startsWith('+4178327')) {
        // Numéro interne HYPERVISUAL — skip
        continue;
      }
      
      // Analyser avec LLM
      const analysis = await analyzeCallWithLLM(call);
      
      if (!analysis || !analysis.is_lead) {
        console.log(`[F-04 Ringover] Call ${callId} non-lead: ${analysis?.reason}`);
        continue;
      }
      
      console.log(`[F-04 Ringover] Lead détecté: ${fromNumber} — ${analysis.reason}`);
      
      const leadData = {
        first_name: analysis.estimated_name?.split(' ')[0] || '',
        last_name: analysis.estimated_name?.split(' ').slice(1).join(' ') || '',
        email: '', // Non disponible via Ringover
        phone: fromNumber,
        company_name: analysis.estimated_company || '',
        message: analysis.message || `Appel ${call.type === 'missed' ? 'manqué' : 'reçu'} — ${call.duration || 0}s`,
        source_channel: 'ringover',
        source_detail: `Ringover: ${call.type || 'call'} ${call.duration || 0}s`,
        ringover_call_id: String(callId),
        call_duration: call.duration || 0,
        raw_data: call,
        openai_summary: JSON.stringify(analysis),
        status: 'new',
      };
      
      const lead = await createOrUpdateLead(leadData, `ringover_${callId}`);
      await logCallProcessed(callId, true, lead.id);
      
    } catch (callError) {
      console.error(`[F-04 Ringover] Erreur traitement appel:`, callError.message);
    }
  }
}

async function checkCallDuplicate(callId) {
  try {
    const response = await fetch(
      `http://localhost:8055/items/automation_logs?filter[rule_name][_eq]=ringover_polling&filter[entity_id][_eq]=${callId}&limit=1`,
      { headers: { 'Authorization': `Bearer ${process.env.DIRECTUS_TOKEN || 'hypervisual-admin-static-token-2026'}` } }
    );
    const data = await response.json();
    return data.data && data.data.length > 0;
  } catch { return false; }
}

async function logCallProcessed(callId, isLead, leadId = null) {
  try {
    await fetch('http://localhost:8055/items/automation_logs', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.DIRECTUS_TOKEN || 'hypervisual-admin-static-token-2026'}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        rule_name: 'ringover_polling',
        entity_id: String(callId),
        status: isLead ? 'success' : 'skipped',
        metadata: leadId ? { lead_id: leadId } : null
      })
    });
  } catch (e) { console.error('logCallProcessed error:', e.message); }
}

function startRingoverPolling() {
  if (!process.env.RINGOVER_API_KEY) {
    console.warn('[F-04 Ringover] RINGOVER_API_KEY non configuré — polling désactivé');
    return;
  }
  console.log('[F-04 Ringover] Démarrage polling (toutes les 15 min)');
  processRingoverCalls(); // Première exécution immédiate
  setInterval(processRingoverCalls, 15 * 60 * 1000);
}

module.exports = { startRingoverPolling, processRingoverCalls };
```

---

## 📖 SERVICE COMMUN — LEAD CREATOR

### Fichier : `src/backend/api/leads/lead-creator.js`

```javascript
/**
 * Service commun : création/mise à jour lead dans Directus
 * Utilisé par F-01, F-03, F-04
 */
const DIRECTUS_URL = 'http://localhost:8055';
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN || 'hypervisual-admin-static-token-2026';

const HEADERS = {
  'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
  'Content-Type': 'application/json'
};

// Récupérer ou créer la source dans lead_sources
async function getOrCreateLeadSource(code, name) {
  try {
    // Chercher source existante
    const search = await fetch(
      `${DIRECTUS_URL}/items/lead_sources?filter[code][_eq]=${code}&limit=1`,
      { headers: HEADERS }
    );
    const searchData = await search.json();
    
    if (searchData.data && searchData.data.length > 0) {
      return searchData.data[0].id;
    }
    
    // Créer si inexistante
    const create = await fetch(`${DIRECTUS_URL}/items/lead_sources`, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify({ name, code, status: 'active' })
    });
    const createData = await create.json();
    return createData.data?.id;
  } catch (e) {
    console.error('getOrCreateLeadSource error:', e.message);
    return null;
  }
}

// Vérifier si lead existant par email ou téléphone
async function findExistingLead(email, phone) {
  if (!email && !phone) return null;
  
  try {
    let filter = '';
    if (email) filter = `filter[email][_eq]=${encodeURIComponent(email)}`;
    else if (phone) filter = `filter[phone][_eq]=${encodeURIComponent(phone)}`;
    
    const response = await fetch(
      `${DIRECTUS_URL}/items/leads?${filter}&limit=1&sort=-date_created`,
      { headers: HEADERS }
    );
    const data = await response.json();
    return data.data?.[0] || null;
  } catch { return null; }
}

// Créer ou mettre à jour un lead
async function createOrUpdateLead(leadData, sourceCode) {
  // Source channel → code mapping
  const sourceNames = {
    'wp_form_17': 'WordPress Form #17',
    'imap_info': 'Email info@hypervisual.ch',
    'ringover_polling': 'Ringover Téléphone',
  };
  
  // Récupérer source ID
  const sourceId = await getOrCreateLeadSource(
    sourceCode,
    sourceNames[sourceCode] || sourceCode
  );
  
  // Vérifier lead existant (upsert par email/phone)
  const existing = await findExistingLead(leadData.email, leadData.phone);
  
  const payload = {
    ...leadData,
    lead_source_id: sourceId,
    owner_company_id: 1, // HYPERVISUAL Switzerland — adapter si nécessaire
    date_created: new Date().toISOString(),
  };
  
  // Supprimer champs undefined
  Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);
  
  if (existing && leadData.source_channel !== 'ringover') {
    // Mise à jour uniquement si même source (éviter écraser lead existant avec appel Ringover)
    console.log(`[LeadCreator] Lead existant trouvé (ID: ${existing.id}), mise à jour...`);
    const response = await fetch(`${DIRECTUS_URL}/items/leads/${existing.id}`, {
      method: 'PATCH',
      headers: HEADERS,
      body: JSON.stringify({
        last_contact_channel: leadData.source_channel,
        last_contact_date: new Date().toISOString(),
      })
    });
    const data = await response.json();
    return data.data || existing;
  }
  
  // Créer nouveau lead
  console.log(`[LeadCreator] Création nouveau lead: ${leadData.first_name} ${leadData.last_name} via ${leadData.source_channel}`);
  const response = await fetch(`${DIRECTUS_URL}/items/leads`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify(payload)
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Directus error ${response.status}: ${error}`);
  }
  
  const data = await response.json();
  return data.data;
}

module.exports = { createOrUpdateLead, findExistingLead };
```

---

## 📖 ROUTER PRINCIPAL

### Fichier : `src/backend/api/leads/index.js`

```javascript
/**
 * Phase F — Lead Capture Router
 * Monte tous les endpoints de capture leads
 */
const express = require('express');
const router = express.Router();

// F-01 : WordPress Fluent Form webhook
const wpWebhook = require('./wp-webhook');
router.use('/wp-webhook', wpWebhook);

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    channels: {
      'F-01-wordpress': 'active',
      'F-03-imap': process.env.IMAP_PASSWORD ? 'active' : 'disabled (no IMAP_PASSWORD)',
      'F-04-ringover': process.env.RINGOVER_API_KEY ? 'active' : 'disabled (no RINGOVER_API_KEY)',
      'F-02-whatsapp': 'pending (Phase F-bis)',
    },
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
```

### Intégration dans le serveur principal (`src/backend/server.js` ou `src/backend/index.js`)

Chercher le fichier serveur principal et ajouter :
```javascript
// Phase F — Lead capture
const leadsRouter = require('./api/leads');
app.use('/api/leads', leadsRouter);

// Démarrer les monitors background
const { startImapMonitor } = require('./api/leads/imap-monitor');
const { startRingoverPolling } = require('./api/leads/ringover-polling');

startImapMonitor();
startRingoverPolling();
```

---

## 🗄️ SCHEMA ADDITIONS — CHAMPS DIRECTUS

Vérifier d'abord via MCP si ces champs existent. Ajouter seulement les manquants via l'API Directus :

```bash
# Ajouter champs à leads si manquants
FIELDS=(
  '{"field":"source_channel","type":"string","meta":{"interface":"select-dropdown","options":{"choices":[{"text":"WordPress","value":"wordpress"},{"text":"Email","value":"email"},{"text":"Ringover","value":"ringover"},{"text":"WhatsApp","value":"whatsapp"},{"text":"Manuel","value":"manual"}]}}}'
  '{"field":"source_detail","type":"text","meta":{"interface":"input-multiline"}}'
  '{"field":"raw_data","type":"json","meta":{"interface":"input-code"}}'
  '{"field":"openai_summary","type":"text","meta":{"interface":"input-multiline"}}'
  '{"field":"ringover_call_id","type":"string","meta":{"interface":"input"}}'
  '{"field":"call_duration","type":"integer","meta":{"interface":"input"}}'
)

for FIELD in "${FIELDS[@]}"; do
  curl -s -X POST "http://localhost:8055/fields/leads" \
    -H "Authorization: Bearer hypervisual-admin-static-token-2026" \
    -H "Content-Type: application/json" \
    -d "$FIELD" > /dev/null
  echo "Champ ajouté"
done

# Ajouter champ code à lead_sources si manquant
curl -s -X POST "http://localhost:8055/fields/lead_sources" \
  -H "Authorization: Bearer hypervisual-admin-static-token-2026" \
  -H "Content-Type: application/json" \
  -d '{"field":"code","type":"string","meta":{"interface":"input","required":false}}'
```

---

## ✅ VÉRIFICATION FINALE

```bash
# 1. Test health endpoint
curl http://localhost:3001/api/leads/health

# 2. Test webhook WordPress (simuler Fluent Form)
curl -X POST http://localhost:3001/api/leads/wp-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "form_id": 17,
    "form_title": "Contact HYPERVISUAL",
    "data": {
      "first_name": "Jean",
      "last_name": "Test",
      "email": "test@example.com",
      "phone": "+41791234567",
      "company": "Test SA",
      "message": "Besoin location écran LED pour événement"
    }
  }'

# 3. Vérifier lead créé dans Directus
curl -s "http://localhost:8055/items/leads?sort=-date_created&limit=3" \
  -H "Authorization: Bearer hypervisual-admin-static-token-2026" | node -e "
const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
d.data.forEach(l=>console.log(l.id, l.first_name, l.last_name, l.source_channel, l.email));
"

# 4. Test Ringover polling manuel
node -e "
const {processRingoverCalls} = require('./src/backend/api/leads/ringover-polling');
processRingoverCalls().then(()=>console.log('Done')).catch(console.error);
"

# 5. Vérifier automation_logs
curl -s "http://localhost:8055/items/automation_logs?sort=-date_created&limit=5" \
  -H "Authorization: Bearer hypervisual-admin-static-token-2026" | node -e "
const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
d.data.forEach(l=>console.log(l.rule_name, l.entity_id, l.status));
"
```

---

## 📝 APRÈS IMPLÉMENTATION

1. **MAJ ROADMAP.md** : Marquer F-01, F-03, F-04 comme complétés (✅)
2. **Commit** avec message : `feat(phase-f): lead capture WordPress/IMAP/Ringover F-01 F-03 F-04`
3. **Tester** le webhook avec un vrai formulaire WordPress (via ngrok en dev)
4. **Configurer** `IMAP_PASSWORD` dans `.env` pour activer F-03
5. **Note** pour Jean : demander credentials IMAP à l'hébergeur de info@hypervisual.ch

---

## ⚠️ POINTS D'ATTENTION

- **Si MCP Directus retourne 401** : utiliser curl avec `hypervisual-admin-static-token-2026`
- **IMAP_PASSWORD** : placeholder dans .env — Jean doit fournir le mot de passe info@hypervisual.ch
- **Ringover** : polling 15min suffit, pas de webhook disponible avec ce compte
- **WordPress en local** : ngrok nécessaire pour tester le webhook depuis Fluent Form
- **Anti-doublon** : basé sur `automation_logs` — toujours vérifier avant créer
- **Champs Directus** : vérifier via MCP avant d'ajouter — ne pas créer de doublons
- **`--no-verify`** : utiliser si pre-commit hook bloque (bug connu Overnight Dev plugin)

---

*Phase F — 3/4 stories (F-01, F-03, F-04) | F-02 WhatsApp → Phase F-bis*
*Généré le 2026-02-20*
