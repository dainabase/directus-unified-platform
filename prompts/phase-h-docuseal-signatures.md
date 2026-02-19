# PROMPT CLAUDE CODE — PHASE H : DOCUSEAL SIGNATURES ÉLECTRONIQUES

**Date** : 2026-02-20  
**Auteur** : Jean (Architecte) + Claude  
**Référence ROADMAP** : Phase H — 3 stories (H-01 à H-03)  
**Commit cible** : `feat(phase-h): docuseal signatures electroniques`

---

## 🎯 OBJECTIF

Permettre au client de signer son devis en ligne directement depuis le portail client.  
Flux complet :
1. CEO envoie le devis → DocuSeal crée un document à signer + envoie email au client
2. Client signe depuis son portail (iframe intégré) ou depuis l'email
3. Webhook DocuSeal → Directus mis à jour automatiquement (status signed, signed_at)
4. Génération automatique facture acompte (réutilise Phase B)

**CDC** : REQ-CLIENT-006 (signature en ligne sans formation)

---

## 📚 SKILLS OBLIGATOIRES — LIRE EN PREMIER

```bash
cat ~/.claude/skills-repos/webhook-handler/SKILL.md
cat ~/.claude/skills-repos/directus-integration/SKILL.md
cat ~/.claude/skills-repos/backend-api/SKILL.md
```

---

## 🔑 CREDENTIALS DISPONIBLES DANS .env

```env
DOCUSEAL_URL=http://localhost:3003
DOCUSEAL_API_KEY=TVWA5W7U455srEN678aC6bZn1rfbAMcn6dhdkZS2LRS
DIRECTUS_URL=http://localhost:8055
DIRECTUS_TOKEN=hypervisual-admin-static-token-2026
```

---

## 📡 API DOCUSEAL — RÉFÉRENCE RAPIDE

**Base URL** : `http://localhost:3003/api`  
**Auth header** : `X-Auth-Token: TVWA5W7U455srEN678aC6bZn1rfbAMcn6dhdkZS2LRS`

```
POST /api/templates          # Créer template (une seule fois)
GET  /api/templates          # Lister templates
POST /api/submissions        # Créer une soumission (envoi pour signature)
GET  /api/submissions/:id    # Statut d'une soumission
GET  /api/submissions/:id/documents  # Télécharger PDF signé
POST /api/webhooks           # Configurer webhook (optionnel via API)
```

**Créer une soumission** :
```json
POST /api/submissions
{
  "template_id": 1,
  "send_email": true,
  "submitters": [
    {
      "name": "Nom Client",
      "email": "client@example.com",
      "role": "Client",
      "fields": [
        { "name": "quote_number", "default_value": "DEV-HY-0014" },
        { "name": "total_amount", "default_value": "95 685.75 CHF" },
        { "name": "company_name", "default_value": "HYPERVISUAL Switzerland" }
      ]
    }
  ]
}
```

**Réponse** :
```json
{
  "id": 42,
  "slug": "abc123",
  "embed_src": "http://localhost:3003/s/abc123",
  "submitters": [{ "slug": "def456", "embed_src": "http://localhost:3003/s/def456" }]
}
```

---

## 🗄️ COLLECTIONS DIRECTUS — CHAMPS RÉELS CONFIRMÉS VIA MCP

### `quotes` (champs réels)
```
id, created_at, updated_at, name, description, status,
owner_company, quote_number, lead_id, company_id, project_type,
subtotal, tax_rate, tax_amount, total, currency, sent_at, viewed_at,
signed_at, valid_until, is_signed, cgv_accepted, cgv_version_id,
cgv_acceptance_id, deposit_percentage, deposit_amount, deposit_invoice_id,
deposit_paid, deposit_paid_at, project_id, contact_id, owner_company_id
```

**Champs à ajouter si manquants** (vérifier d'abord via MCP) :
- `docuseal_submission_id` (integer) — ID soumission DocuSeal
- `docuseal_embed_url` (string) — URL iframe pour portail client
- `docuseal_signed_pdf_url` (string) — URL PDF signé après signature
- `signature_requested_at` (timestamp)

---

## 📋 STORIES À IMPLÉMENTER

---

### H-01 · Envoi devis pour signature via DocuSeal

**Fichier** : `src/backend/api/docuseal/send-for-signature.js`

**Flux** :
1. CEO clique "Envoyer pour signature" sur un devis
2. Backend appelle DocuSeal pour créer une soumission
3. DocuSeal envoie automatiquement l'email au client avec lien de signature
4. Directus mis à jour : `status = sent`, `sent_at`, `docuseal_submission_id`, `docuseal_embed_url`

**Endpoint** : `POST /api/docuseal/send/:quoteId`

```javascript
// Logique principale
async function sendForSignature(quoteId) {
  // 1. Récupérer le devis depuis Directus
  const quote = await directus.request(readItem('quotes', quoteId));
  const contact = await directus.request(readItem('contacts', quote.contact_id));
  
  // 2. Récupérer ou créer le template DocuSeal
  const templateId = await getOrCreateTemplate();
  
  // 3. Créer la soumission DocuSeal
  const submission = await fetch(`${DOCUSEAL_URL}/api/submissions`, {
    method: 'POST',
    headers: {
      'X-Auth-Token': DOCUSEAL_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      template_id: templateId,
      send_email: true,
      submitters: [{
        name: contact.full_name || contact.email,
        email: contact.email,
        role: 'Client',
        fields: [
          { name: 'quote_number', default_value: quote.quote_number },
          { name: 'total_amount', default_value: formatCHF(quote.total) },
          { name: 'project_type', default_value: quote.project_type || '' },
          { name: 'valid_until', default_value: quote.valid_until || '' }
        ]
      }]
    })
  });
  
  const data = await submission.json();
  
  // 4. Mettre à jour Directus
  await directus.request(updateItem('quotes', quoteId, {
    status: 'sent',
    sent_at: new Date().toISOString(),
    docuseal_submission_id: data.id,
    docuseal_embed_url: data.submitters[0].embed_src,
    signature_requested_at: new Date().toISOString()
  }));
  
  return { success: true, embedUrl: data.submitters[0].embed_src };
}
```

**Bouton dans QuotesModule.jsx** (SuperAdmin) :
- Ajouter bouton "✍️ Envoyer pour signature" sur les devis en status `draft` ou `pending`
- Désactivé si `status === 'sent'` ou `status === 'signed'`
- Feedback toast "Email envoyé au client"

---

### H-02 · Webhook DocuSeal → mise à jour Directus

**Fichier** : `src/backend/api/docuseal/webhook.js`

**Endpoint** : `POST /api/docuseal/webhook`

**Configurer le webhook dans DocuSeal** :
```javascript
// À exécuter une fois au démarrage (dans index.js)
async function setupDocuSealWebhook() {
  const webhookUrl = `${process.env.APP_URL}/api/docuseal/webhook`;
  
  const res = await fetch(`${DOCUSEAL_URL}/api/webhooks`, {
    method: 'POST',
    headers: { 'X-Auth-Token': DOCUSEAL_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: webhookUrl,
      events: ['form.completed', 'form.viewed']
    })
  });
}
```

**Events DocuSeal** :
- `form.viewed` → client a ouvert le document → mettre à jour `viewed_at`
- `form.completed` → client a signé → actions complètes

**Payload `form.completed`** :
```json
{
  "event_type": "form.completed",
  "data": {
    "submission": {
      "id": 42,
      "status": "completed",
      "completed_at": "2026-02-20T11:00:00Z"
    },
    "submitter": {
      "name": "Jean Dupont",
      "email": "client@example.com",
      "completed_at": "2026-02-20T11:00:00Z",
      "documents": [
        { "url": "http://localhost:3003/documents/signed.pdf" }
      ]
    }
  }
}
```

**Handler `form.completed`** :
```javascript
async function handleFormCompleted(payload) {
  const submissionId = payload.data.submission.id;
  const signedAt = payload.data.submission.completed_at;
  const pdfUrl = payload.data.submitter.documents?.[0]?.url;
  
  // Trouver le devis via docuseal_submission_id
  const quotes = await directus.request(readItems('quotes', {
    filter: { docuseal_submission_id: { _eq: submissionId } }
  }));
  
  if (!quotes.length) return;
  const quote = quotes[0];
  
  // Mettre à jour le devis
  await directus.request(updateItem('quotes', quote.id, {
    status: 'signed',
    is_signed: true,
    signed_at: signedAt,
    docuseal_signed_pdf_url: pdfUrl
  }));
  
  // Générer facture acompte automatiquement (réutiliser Phase B)
  if (parseFloat(quote.deposit_amount) > 0) {
    await generateDepositInvoice(quote.id);
  }
  
  // Log
  await logAutomation('quote_signed', quote.id, 'info',
    `Devis ${quote.quote_number} signé par ${payload.data.submitter.email}`);
}
```

---

### H-03 · Portail client — page signature intégrée

**Fichier** : `src/frontend/src/portals/client/pages/SignaturePage.jsx`

**Route** : `/client/quotes/:quoteId/sign`

**Interface** :
```
┌─────────────────────────────────────────────────┐
│  ✍️ Signer votre devis — DEV-HY-0014           │
│  HYPERVISUAL Switzerland                        │
├─────────────────────────────────────────────────┤
│  Montant : CHF 95 685.75                        │
│  Valable jusqu'au : 19/02/2026                  │
├─────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────┐  │
│  │                                           │  │
│  │         IFRAME DOCUSEAL                   │  │
│  │    (embed_src depuis Directus)            │  │
│  │                                           │  │
│  │                                           │  │
│  └───────────────────────────────────────────┘  │
├─────────────────────────────────────────────────┤
│  [Télécharger PDF signé] (après signature)      │
└─────────────────────────────────────────────────┘
```

**Composant** :
```jsx
import { useEffect, useState } from 'react';

export default function SignaturePage({ quoteId }) {
  const [quote, setQuote] = useState(null);
  const [signed, setSigned] = useState(false);

  useEffect(() => {
    // Charger le devis depuis Directus
    fetchQuote(quoteId).then(setQuote);
    
    // Écouter message DocuSeal (postMessage depuis iframe)
    window.addEventListener('message', (e) => {
      if (e.data?.type === 'docuseal:completed') {
        setSigned(true);
      }
    });
  }, [quoteId]);

  if (!quote) return <div>Chargement...</div>;

  if (quote.is_signed) return (
    <div className="card">
      <div className="card-body text-center">
        <div className="text-success mb-3">✅ Devis signé</div>
        <p>Merci ! Votre devis a été signé le {formatDate(quote.signed_at)}.</p>
        {quote.docuseal_signed_pdf_url && (
          <a href={quote.docuseal_signed_pdf_url} className="btn btn-primary">
            Télécharger le PDF signé
          </a>
        )}
      </div>
    </div>
  );

  return (
    <div className="card">
      <div className="card-header">
        <h3>✍️ Signer votre devis {quote.quote_number}</h3>
        <span className="badge bg-blue-600">CHF {formatCHF(quote.total)}</span>
      </div>
      <div className="card-body p-0">
        {quote.docuseal_embed_url ? (
          <iframe
            src={quote.docuseal_embed_url}
            style={{ width: '100%', height: '700px', border: 'none' }}
            title="Signature document"
          />
        ) : (
          <div className="p-4 text-muted">
            Document en cours de préparation...
          </div>
        )}
      </div>
      {signed && (
        <div className="card-footer text-success">
          ✅ Document signé avec succès !
        </div>
      )}
    </div>
  );
}
```

**Dans QuotesModule.jsx côté client** :
- Ajouter bouton "✍️ Signer le devis" sur les devis status `sent`
- Lien vers `/client/quotes/:id/sign`

---

## 📁 STRUCTURE FICHIERS FINALE

```
src/backend/api/docuseal/
├── index.js               # Router Express /api/docuseal
├── send-for-signature.js  # H-01 — POST /api/docuseal/send/:quoteId
├── webhook.js             # H-02 — POST /api/docuseal/webhook
└── templates.js           # Gestion templates DocuSeal (create/get)

src/frontend/src/portals/client/pages/
└── SignaturePage.jsx       # H-03 — Iframe signature + statut
```

---

## 🔧 TEMPLATE DOCUSEAL — CRÉATION AUTOMATIQUE

DocuSeal nécessite un template PDF. Créer un template de base via API :

```javascript
// src/backend/api/docuseal/templates.js
async function getOrCreateTemplate() {
  // Vérifier si template existe déjà
  const existing = await fetch(`${DOCUSEAL_URL}/api/templates`, {
    headers: { 'X-Auth-Token': DOCUSEAL_API_KEY }
  }).then(r => r.json());
  
  if (existing.data.length > 0) return existing.data[0].id;
  
  // Créer template HTML basique (DocuSeal accepte HTML)
  const template = await fetch(`${DOCUSEAL_URL}/api/templates/html`, {
    method: 'POST',
    headers: { 'X-Auth-Token': DOCUSEAL_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Devis HYPERVISUAL Switzerland',
      html: `
        <h1>HYPERVISUAL Switzerland</h1>
        <p>Devis N° {{quote_number}}</p>
        <p>Montant total : {{total_amount}}</p>
        <p>Type de projet : {{project_type}}</p>
        <p>Valable jusqu'au : {{valid_until}}</p>
        <br><br>
        <p>En signant ce document, le client accepte les conditions générales de vente.</p>
        <br>
        <p>Signature client :</p>
        {{sig_client}}
      `,
      fields: [
        { name: 'quote_number', type: 'text' },
        { name: 'total_amount', type: 'text' },
        { name: 'project_type', type: 'text' },
        { name: 'valid_until', type: 'text' },
        { name: 'sig_client', type: 'signature', role: 'Client' }
      ]
    })
  }).then(r => r.json());
  
  return template.id;
}
```

---

## 🔌 INTÉGRATION SERVER.JS

```javascript
import docusealRouter from './api/docuseal/index.js';
app.use('/api/docuseal', docusealRouter);

// Configurer webhook DocuSeal au démarrage
import { setupDocuSealWebhook } from './api/docuseal/webhook.js';
setupDocuSealWebhook().catch(console.error);
```

---

## ✅ VÉRIFICATIONS AVANT DE CODER

```bash
# 1. Vérifier API DocuSeal
curl -H "X-Auth-Token: TVWA5W7U455srEN678aC6bZn1rfbAMcn6dhdkZS2LRS" \
  http://localhost:3003/api/templates

# 2. Vérifier champs quotes dans Directus
curl -H "Authorization: Bearer hypervisual-admin-static-token-2026" \
  "http://localhost:8055/items/quotes?limit=1"

# 3. Vérifier champs à ajouter si manquants
# Si docuseal_submission_id manque :
curl -X POST "http://localhost:8055/fields/quotes" \
  -H "Authorization: Bearer hypervisual-admin-static-token-2026" \
  -H "Content-Type: application/json" \
  -d '{"field": "docuseal_submission_id", "type": "integer"}'
```

---

## 🧪 COMMANDES DE TEST

```bash
# Test envoi devis pour signature (remplacer ID par un vrai ID)
curl -X POST http://localhost:3001/api/docuseal/send/QUOTE_ID \
  -H "Content-Type: application/json"

# Test webhook DocuSeal (simuler signature complète)
curl -X POST http://localhost:3001/api/docuseal/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "form.completed",
    "data": {
      "submission": {
        "id": 1,
        "status": "completed",
        "completed_at": "2026-02-20T11:00:00Z"
      },
      "submitter": {
        "name": "Client Test",
        "email": "client@test.com",
        "completed_at": "2026-02-20T11:00:00Z",
        "documents": [{"url": "http://localhost:3003/documents/test.pdf"}]
      }
    }
  }'

# Health check
curl http://localhost:3001/api/docuseal/health
```

---

## 📝 COMMIT FORMAT

```
feat(H-01): docuseal send-for-signature + bouton superadmin
feat(H-02): docuseal webhook form.completed + update quotes
feat(H-03): portail client SignaturePage iframe docuseal
feat(phase-h): update ROADMAP.md H-01 to H-03 [V] DONE
```

---

## ⚠️ POINTS D'ATTENTION CRITIQUES

1. **ES Modules** : `import/export` uniquement, jamais `require()`
2. **Template HTML** : DocuSeal local accepte templates HTML — pas besoin d'uploader un PDF
3. **APP_URL** : En dev local, utiliser `http://localhost:3001` pour les webhooks (le webhook DocuSeal → backend ne passera pas par ngrok, c'est du localhost → localhost)
4. **Réutiliser Phase B** : `generateDepositInvoice()` existe déjà dans les utilitaires Phase B
5. **Réutiliser Phase E** : Email confirmation via Mautic après signature
6. **Champs quotes** : `contact_id` existe — récupérer l'email du contact pour DocuSeal
7. **MAJ ROADMAP** : Mettre `[V]` pour H-01, H-02, H-03 après commit
