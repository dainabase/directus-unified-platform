# PROMPT CLAUDE CODE — PHASE G : REVOLUT WEBHOOKS + RÉCONCILIATION BANCAIRE

**Date** : 2026-02-20  
**Auteur** : Jean (Architecte) + Claude  
**Référence ROADMAP** : Phase G — 5 stories (G-01 à G-05)  
**Commit cible** : `feat(phase-g): revolut webhooks + reconciliation bancaire`

---

## 🎯 OBJECTIF

Implémenter la détection automatique des paiements Revolut et le rapprochement bancaire.  
Quand un client paie, le système :
1. Reçoit le webhook Revolut en temps réel
2. Rapproche la transaction avec la bonne facture (algorithme multi-critères)
3. Active le projet automatiquement si acompte confirmé
4. Alerte le CEO pour les transactions non rapprochées > 5 jours

**Critères d'acceptation CDC** :
- Taux rapprochement automatique ≥ 85% (REQ-RECO-001)
- Projet activé en < 60 secondes après réception paiement (REQ-FACT-006)

---

## 📚 SKILLS OBLIGATOIRES — LIRE EN PREMIER

```bash
# Lire dans cet ordre avant tout code
cat ~/.claude/skills-repos/backend-api/SKILL.md
cat ~/.claude/skills-repos/webhook-handler/SKILL.md
cat ~/.claude/skills-repos/directus-integration/SKILL.md
cat /Users/jean-mariedelaunay/directus-unified-platform/.claude/skills/swiss-accounting/SKILL.md
```

---

## 🔑 CREDENTIALS DISPONIBLES DANS .env

```env
# Revolut Business API
REVOLUT_CLIENT_ID=hwRXT0_BsXXDrWszkEpKEaZ0jfID_K1JgpqOv8DKRZI
REVOLUT_PRIVATE_KEY_PATH=./keys/revolut_private.pem
REVOLUT_REFRESH_TOKEN=oa_prod_lKbdWkmbtHbHkz4_JZdFTYI1mlW-s1I3oyEIxjDXQLE
REVOLUT_JWT_ISS=plain-yaks-taste.loca.lt
REVOLUT_REDIRECT_URI=https://plain-yaks-taste.loca.lt/
REVOLUT_WEBHOOK_SECRET=wsk_ODGRAALJTW2rEVAFwPtoYoOgcBgNHrBL
REVOLUT_WEBHOOK_ID=a1916593-ae7c-49a8-be02-577434db2dff
REVOLUT_ENV=production

# Directus
DIRECTUS_URL=http://localhost:8055
DIRECTUS_TOKEN=hypervisual-admin-static-token-2026
```

---

## 🗄️ COLLECTIONS DIRECTUS RÉELLES — CHAMPS VÉRIFIÉS VIA MCP

### `bank_transactions` (champs réels confirmés)
```
id, description, amount, type (credit/debit), date, date_created,
project_id, account_id, invoice_id, company_id, owner_company,
revolut_transaction_id, revolut_account_id, currency, exchange_rate,
merchant_name, merchant_category, merchant_country, fees, balance_after,
state, reference, completed_at, updated_at, owner_company_id,
supplier_invoice_id, payment_id
```

### `client_invoices` (champs réels confirmés)
```
id, invoice_number, client_name, amount, status, date_created,
project_id, company_id, contact_id, owner_company, owner_company_id, due_date
```

### `projects` (champs réels confirmés)
```
id, name, description, status, start_date, end_date, budget,
client_id, main_provider_id, project_manager_id, sales_person_id,
company_id, owner_company, date_created
```

### `automation_logs` (anti-doublon, champs réels)
```
id, action, entity_type, entity_id, recipient_email, level,
created_at (ou date_created)
```

---

## 📋 STORIES À IMPLÉMENTER

---

### G-01 · Revolut Webhook — Réception transactions temps réel

**Fichier** : `src/backend/api/revolut/webhook.js`

**Fonctionnement** :
- Écoute POST `/api/revolut/webhook`
- Vérifie signature HMAC avec `REVOLUT_WEBHOOK_SECRET`
- Parse le payload Revolut
- Sauvegarde la transaction dans `bank_transactions`
- Déclenche immédiatement l'algorithme de rapprochement (G-02)
- Anti-doublon : vérifier `revolut_transaction_id` avant insertion

**Payload Revolut exemple** :
```json
{
  "event": "TransactionCreated",
  "timestamp": "2026-02-20T10:30:00Z",
  "data": {
    "id": "txn_abc123",
    "account_id": "acc_xyz",
    "type": "transfer",
    "state": "completed",
    "created_at": "2026-02-20T10:30:00Z",
    "completed_at": "2026-02-20T10:30:01Z",
    "amount": -5000,
    "currency": "CHF",
    "description": "Paiement facture INV-2026-042",
    "reference": "RF12345678901234567890",
    "merchant": null,
    "balance": 45000
  }
}
```

**Mapping vers bank_transactions** :
```javascript
{
  revolut_transaction_id: data.id,
  revolut_account_id: data.account_id,
  amount: Math.abs(data.amount / 100), // Revolut envoie en centimes
  type: data.amount > 0 ? 'credit' : 'debit',
  currency: data.currency,
  description: data.description,
  reference: data.reference,
  state: data.state,
  date: data.created_at.split('T')[0],
  completed_at: data.completed_at,
  balance_after: data.balance ? data.balance / 100 : null,
  owner_company: 'HYPERVISUAL' // Phase K: multi-company
}
```

**Vérification signature** :
```javascript
import crypto from 'crypto';

function verifyRevolutSignature(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  const expected = hmac.digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expected, 'hex')
  );
}
```

---

### G-02 · Algorithme rapprochement multi-critères

**Fichier** : `src/backend/api/revolut/reconciliation.js`

**Algorithme** (par ordre de priorité décroissante) :

**Critère 1 — Référence QR exacte (score 100)** :
- Extraire les 27 chiffres QR depuis `bank_transactions.reference`
- Chercher dans `client_invoices.invoice_number` (format INV-YYYY-NN)
- Match = rapprochement automatique immédiat

**Critère 2 — Montant exact + date ±3 jours (score 85)** :
- `bank_transactions.amount` === `client_invoices.amount` (tolérance 0.05 CHF arrondi suisse)
- `bank_transactions.date` entre `client_invoices.due_date - 3j` et `client_invoices.due_date + 3j`

**Critère 3 — Fuzzy match description (score 70)** :
- Comparer `bank_transactions.description` avec `client_invoices.client_name`
- Score similarité Levenshtein ≥ 80%
- Si montant correspond aussi → score 80

**Critère 4 — Montant seul (score 60)** :
- Uniquement si montant > 1000 CHF (évite faux positifs sur petits montants)

**Seuils de décision** :
- Score ≥ 85 → **Rapprochement automatique** (sans intervention CEO)
- Score 60-84 → **Suggestion au CEO** (top 3 candidats dans dashboard)
- Score < 60 → **Non rapproché** → alerte G-05

**Fonction principale** :
```javascript
async function reconcileTransaction(bankTxId) {
  const bankTx = await getTransaction(bankTxId);
  
  // Chercher uniquement les factures pending/overdue HYPERVISUAL
  const invoices = await getPendingInvoices('HYPERVISUAL');
  
  let bestMatch = null;
  let bestScore = 0;
  const candidates = [];
  
  for (const invoice of invoices) {
    const score = calculateMatchScore(bankTx, invoice);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = invoice;
    }
    if (score >= 60) candidates.push({ invoice, score });
  }
  
  if (bestScore >= 85) {
    // Rapprochement automatique
    await applyReconciliation(bankTxId, bestMatch.id, bestScore, 'auto');
    // Déclencher activation projet si acompte (G-04)
    await checkProjectActivation(bestMatch);
  } else if (candidates.length > 0) {
    // Proposer suggestions CEO
    await saveSuggestions(bankTxId, candidates.slice(0, 3));
  }
  
  return { score: bestScore, match: bestMatch };
}
```

**`applyReconciliation`** met à jour :
- `bank_transactions.invoice_id` = invoice.id
- `bank_transactions.project_id` = invoice.project_id
- `client_invoices.status` = 'paid'
- `client_invoices.payment_id` = bankTx.id (si champ existe)

---

### G-03 · Dashboard rapprochement bancaire

**Fichier** : `src/frontend/src/portals/superadmin/banking/ReconciliationDashboard.jsx`

**Interface CEO** :
```
┌─────────────────────────────────────────────────────────┐
│  💳 Rapprochement Bancaire — HYPERVISUAL                │
├──────────────┬──────────────┬──────────────────────────┤
│ ✅ Rapprochés│ ⚡ Suggestions│ ❌ Non rapprochés         │
│    42         │      8        │        3                  │
│  CHF 187,340  │  CHF 45,200  │     CHF 12,800            │
└──────────────┴──────────────┴──────────────────────────┘

📋 TRANSACTIONS À RAPPROCHER
┌──────────┬──────────┬──────────┬────────────────────────┐
│  Date    │ Montant  │Description│ Suggestions (top 3)   │
├──────────┼──────────┼──────────┼────────────────────────┤
│ 20/02/26 │ CHF 5,000│Virement X │ [INV-2026-042 ●●●●○]  │
│          │          │           │ [INV-2026-038 ●●●○○]  │
│          │          │           │ [Confirmer] [Ignorer]  │
└──────────┴──────────┴──────────┴────────────────────────┘

📋 TRANSACTIONS RAPPROCHÉES RÉCENTES
[Liste des 20 dernières avec badges vert "AUTO" ou "MANUEL"]
```

**Fonctionnalités** :
- Affichage 3 colonnes : rapprochés / suggestions / non rapprochés
- Pour chaque suggestion : bouton "Confirmer" → appelle POST `/api/revolut/reconcile/confirm`
- Bouton "Rapprocher manuellement" → modal avec recherche facture
- Refresh automatique toutes les 30 secondes
- Design glassmorphism blue-600 existant (utiliser `banking-glassmorphism.css`)

**API backend nécessaire** :
```
GET  /api/revolut/transactions?status=unreconciled
GET  /api/revolut/transactions?status=suggestions
GET  /api/revolut/transactions?status=reconciled&limit=20
POST /api/revolut/reconcile/confirm { bankTxId, invoiceId }
POST /api/revolut/reconcile/ignore  { bankTxId }
```

---

### G-04 · Activation automatique projet à réception acompte

**Fichier** : `src/backend/api/revolut/project-activation.js`

**Logique** (réutilise `lib/projectActivation.js` de Phase B-06) :
```javascript
async function checkProjectActivation(invoice) {
  // Seulement pour les factures d'acompte
  if (!invoice.invoice_number.includes('ACOMPTE') && 
      !invoice.invoice_number.includes('DEP')) {
    return;
  }
  
  const project = await getProject(invoice.project_id);
  if (!project || project.status === 'active') return;
  
  // Réutiliser l'utilitaire existant Phase B-06
  await activateProject(project.id);
  
  // Email confirmation client via Mautic (Phase E)
  await sendPaymentConfirmationEmail({
    projectName: project.name,
    invoiceNumber: invoice.invoice_number,
    amount: invoice.amount,
    currency: 'CHF'
  });
  
  await logAutomation('project_activation', project.id, 'info',
    `Projet activé automatiquement — paiement reçu ${invoice.amount} CHF`);
}
```

**Email de confirmation** (via Mautic, template existant Phase E) :
- Objet : `✅ Paiement reçu — Projet ${project.name} activé`
- Corps : confirmation montant, numéro facture, nom projet, prochaines étapes

---

### G-05 · Alertes transactions non rapprochées > 5 jours

**Fichier** : `src/backend/api/revolut/unreconciled-alert.js`

**CRON** : toutes les 24h à 08h00 (utiliser le système CRON existant du projet)

**Logique** :
```javascript
async function checkUnreconciledTransactions() {
  const fiveDaysAgo = new Date();
  fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
  
  // Chercher transactions credit non rapprochées > 5 jours
  const unreconciled = await directus.request(
    readItems('bank_transactions', {
      filter: {
        invoice_id: { _null: true },
        type: { _eq: 'credit' },
        date: { _lt: fiveDaysAgo.toISOString().split('T')[0] },
        state: { _eq: 'completed' }
      }
    })
  );
  
  if (unreconciled.length === 0) return;
  
  const total = unreconciled.reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
  
  // Email CEO via Mautic
  await sendAlertEmail({
    subject: `⚠️ ${unreconciled.length} transaction(s) non rapprochée(s) — CHF ${total.toFixed(2)}`,
    transactions: unreconciled
  });
  
  // Log
  await logAutomation('unreconciled_alert', null, 'warning',
    `${unreconciled.length} transactions non rapprochées > 5j — Total CHF ${total.toFixed(2)}`);
}
```

---

## 📁 STRUCTURE FICHIERS FINALE

```
src/backend/api/revolut/
├── index.js              # Router Express /api/revolut
├── webhook.js            # G-01 — Réception webhook + vérif signature
├── reconciliation.js     # G-02 — Algorithme rapprochement
├── project-activation.js # G-04 — Activation projet automatique
├── unreconciled-alert.js  # G-05 — CRON alertes non rapprochés
└── revolut-client.js     # Client API Revolut (refresh token auto)

src/frontend/src/portals/superadmin/banking/
├── ReconciliationDashboard.jsx  # G-03 — Dashboard CEO
└── reconciliationApi.js         # Appels API backend
```

---

## 🔧 CLIENT REVOLUT — REFRESH TOKEN AUTOMATIQUE

**Fichier** : `src/backend/api/revolut/revolut-client.js`

Le access_token expire toutes les **40 minutes**. Implémenter refresh automatique :

```javascript
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

class RevolutClient {
  constructor() {
    this.accessToken = null;
    this.tokenExpiry = null;
    this.baseUrl = 'https://b2b.revolut.com/api';
  }

  async getAccessToken() {
    if (this.accessToken && this.tokenExpiry > Date.now() + 60000) {
      return this.accessToken;
    }
    
    const privateKey = fs.readFileSync(
      path.resolve(process.env.REVOLUT_PRIVATE_KEY_PATH), 'utf8'
    );
    const clientId = process.env.REVOLUT_CLIENT_ID;
    const iss = process.env.REVOLUT_JWT_ISS;
    
    const header = Buffer.from(JSON.stringify({alg:'RS256',typ:'JWT'})).toString('base64url');
    const now = Math.floor(Date.now()/1000);
    const payload = Buffer.from(JSON.stringify({
      iss, sub: clientId, aud: 'https://revolut.com', iat: now, exp: now + 3600
    })).toString('base64url');
    
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(header + '.' + payload);
    const jwt = header + '.' + payload + '.' + sign.sign(privateKey, 'base64url');
    
    const res = await fetch(`${this.baseUrl}/1.0/auth/token`, {
      method: 'POST',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: process.env.REVOLUT_REFRESH_TOKEN,
        client_id: clientId,
        client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
        client_assertion: jwt
      })
    });
    
    const data = await res.json();
    this.accessToken = data.access_token;
    this.tokenExpiry = Date.now() + (data.expires_in * 1000);
    return this.accessToken;
  }

  async get(endpoint) {
    const token = await this.getAccessToken();
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {'Authorization': `Bearer ${token}`}
    });
    return res.json();
  }
}

export const revolutClient = new RevolutClient();
```

---

## 🔌 INTÉGRATION DANS SERVER.JS

```javascript
// Après les routes existantes
import revolutRouter from './api/revolut/index.js';
app.use('/api/revolut', revolutRouter);

// Démarrer CRON alerte non rapprochés
import { startUnreconciledCron } from './api/revolut/unreconciled-alert.js';
startUnreconciledCron(); // Lance CRON 24h
```

---

## ✅ VÉRIFICATIONS AVANT DE CODER

```bash
# 1. Vérifier collections existantes
curl -H "Authorization: Bearer hypervisual-admin-static-token-2026" \
  "http://localhost:8055/items/bank_transactions?limit=1"

# 2. Vérifier que invoice_id existe sur bank_transactions
curl -H "Authorization: Bearer hypervisual-admin-static-token-2026" \
  "http://localhost:8055/collections/bank_transactions" | grep invoice_id

# 3. Vérifier projectActivation.js Phase B-06
ls src/backend/lib/projectActivation.js
```

**Si un champ manque sur bank_transactions**, l'ajouter via :
```bash
curl -X POST "http://localhost:8055/fields/bank_transactions" \
  -H "Authorization: Bearer hypervisual-admin-static-token-2026" \
  -H "Content-Type: application/json" \
  -d '{"field": "reconciliation_score", "type": "integer"}'
```

**Champs potentiellement manquants à ajouter** :
- `reconciliation_score` (integer) — score algorithme 0-100
- `reconciliation_method` (string) — 'auto' | 'manual' | 'ignored'
- `reconciled_at` (timestamp)
- `reconciliation_suggestions` (json) — top 3 candidats

---

## 🧪 COMMANDES DE TEST

```bash
# Test webhook (simuler paiement Revolut)
curl -X POST http://localhost:3001/api/revolut/webhook \
  -H "Content-Type: application/json" \
  -H "revolut-signature: TEST_SKIP" \
  -d '{
    "event": "TransactionCreated",
    "timestamp": "2026-02-20T10:30:00Z",
    "data": {
      "id": "txn_test_001",
      "account_id": "acc_hypervisual_chf",
      "type": "transfer",
      "state": "completed",
      "created_at": "2026-02-20T10:30:00Z",
      "completed_at": "2026-02-20T10:30:01Z",
      "amount": 500000,
      "currency": "CHF",
      "description": "Paiement acompte projet LED",
      "reference": null,
      "balance": 4500000
    }
  }'

# Test rapprochement manuel
curl -X POST http://localhost:3001/api/revolut/reconcile/confirm \
  -H "Content-Type: application/json" \
  -d '{"bankTxId": "ID_TRANSACTION", "invoiceId": "ID_FACTURE"}'

# Test health
curl http://localhost:3001/api/revolut/health
```

---

## 📝 COMMIT FORMAT

```
feat(G-01): revolut webhook reception + signature verification
feat(G-02): algorithme rapprochement multi-criteres (score 60/85/100)
feat(G-03): dashboard reconciliation CEO avec suggestions top-3
feat(G-04): activation projet automatique a paiement confirme
feat(G-05): cron alertes transactions non rapprochees > 5 jours
feat(phase-g): update ROADMAP.md G-01 to G-05 [V] DONE
```

---

## ⚠️ POINTS D'ATTENTION CRITIQUES

1. **Signature webhook** : En mode test local, accepter un header `revolut-signature: TEST_SKIP` pour bypass (DEV uniquement, avec vérification `NODE_ENV !== 'production'`)
2. **Montants Revolut** : API Revolut envoie en **centimes** (5000 CHF = 500000) — toujours diviser par 100
3. **ES Modules** : Le projet est en `"type": "module"` — utiliser `import/export`, jamais `require()`
4. **Réutiliser Phase B-06** : `lib/projectActivation.js` existe déjà — NE PAS réécrire
5. **Réutiliser Phase E** : `api/email/` avec Mautic existe déjà — utiliser pour emails confirmation
6. **HYPERVISUAL only** : Phase G concerne uniquement HYPERVISUAL (owner_company = 'HYPERVISUAL')
7. **Arrondi suisse** : Tolérance 0.05 CHF sur comparaison montants
8. **MAJ ROADMAP** : Mettre à jour ROADMAP.md avec `[V]` pour chaque story après commit
