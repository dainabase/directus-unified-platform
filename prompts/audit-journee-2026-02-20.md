# AUDIT COMPLET — JOURNÉE 2026-02-20
# PHASES F + G + H — VÉRIFICATION TOTALE

**IMPORTANT** : Tu as toutes les autorisations pour lire, tester, corriger et committer.
Ne jamais t'arrêter. Ne jamais demander confirmation. Si quelque chose est cassé, le réparer directement.
Si un test échoue, diagnostiquer et corriger. Continuer jusqu'à la fin de la checklist complète.

---

## 🔑 CREDENTIALS

```env
DIRECTUS_URL=http://localhost:8055
DIRECTUS_TOKEN=hypervisual-admin-static-token-2026
DOCUSEAL_URL=http://localhost:3003
DOCUSEAL_API_KEY=TVWA5W7U455srEN678aC6bZn1rfbAMcn6dhdkZS2LRS
REVOLUT_CLIENT_ID=hwRXT0_BsXXDrWszkEpKEaZ0jfID_K1JgpqOv8DKRZI
REVOLUT_WEBHOOK_SECRET=wsk_ODGRAALJTW2rEVAFwPtoYoOgcBgNHrBL
```

---

## 📋 CHECKLIST AUDIT — NE JAMAIS SAUTER UNE ÉTAPE

---

### 0. INFRASTRUCTURE DE BASE

```bash
# Docker running ?
docker ps | grep -E "directus|docuseal|postgres|redis"

# Directus répond ?
curl -s http://localhost:8055/server/health | grep -o '"status":"ok"'

# Backend Node répond ?
curl -s http://localhost:3001/health

# DocuSeal répond ?
curl -s -H "X-Auth-Token: TVWA5W7U455srEN678aC6bZn1rfbAMcn6dhdkZS2LRS" \
  http://localhost:3003/api/templates | grep -o '"data"'

# Frontend compile sans erreur ?
cd /Users/jean-mariedelaunay/directus-unified-platform
npm run build --prefix src/frontend 2>&1 | tail -5
```

**Si quelque chose ne répond pas** : démarrer le service manquant et continuer.

---

### 1. AUDIT PHASE F — LEAD CAPTURE MULTICANAL

#### F-01 — WordPress Webhook

```bash
# Fichier existe ?
ls -la src/backend/api/leads/wp-webhook.js
ls -la src/backend/api/leads/lead-creator.js
ls -la src/backend/api/leads/index.js

# Syntaxe OK ?
node --input-type=module < src/backend/api/leads/wp-webhook.js 2>&1 | head -5

# Route montée dans server.js ?
grep -n "leads" src/backend/server.js

# Test endpoint health
curl -s http://localhost:3001/api/leads/health | python3 -m json.tool

# Test webhook WordPress (simulé)
curl -s -X POST http://localhost:3001/api/leads/wp-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "fields": {
      "field_1": "Jean Test",
      "field_2": "jean.test@example.com",
      "field_3": "+41791234567",
      "field_4": "Intéressé par location écran LED 10m²"
    },
    "form_id": 17
  }' | python3 -m json.tool

# Vérifier lead créé dans Directus
curl -s -H "Authorization: Bearer hypervisual-admin-static-token-2026" \
  "http://localhost:8055/items/leads?filter[email][_eq]=jean.test@example.com&limit=1" \
  | python3 -m json.tool
```

#### F-03 — IMAP Monitor

```bash
# Fichier existe ?
ls -la src/backend/api/leads/imap-monitor.js

# Variables IMAP dans .env ?
grep -E "IMAP_|OPENAI_" .env | grep -v PASSWORD

# Trigger manuel scan
curl -s -X POST http://localhost:3001/api/leads/imap-scan | python3 -m json.tool
```

#### F-04 — Ringover Polling

```bash
# Fichier existe ?
ls -la src/backend/api/leads/ringover-polling.js

# Trigger manuel scan
curl -s -X POST http://localhost:3001/api/leads/ringover-scan | python3 -m json.tool
```

#### F — Vérification champs Directus

```bash
# Les 6 champs ajoutés existent sur leads ?
curl -s -H "Authorization: Bearer hypervisual-admin-static-token-2026" \
  "http://localhost:8055/items/leads?limit=1" | python3 -m json.tool | \
  grep -E "source_channel|source_detail|raw_data|openai_summary|ringover_call_id|call_duration"
```

**Si des champs manquent** : les ajouter via l'API Directus et continuer.

---

### 2. AUDIT PHASE G — REVOLUT WEBHOOKS + RÉCONCILIATION

#### G-01 — Webhook Receiver

```bash
# Fichiers existent ?
ls -la integrations/revolut/webhook-receiver.js
ls -la integrations/revolut/sync-transactions.js

# Route montée ?
grep -n "revolut" src/backend/server.js

# Test webhook (mode TEST_SKIP signature)
curl -s -X POST http://localhost:3001/api/revolut/webhook \
  -H "Content-Type: application/json" \
  -H "revolut-signature: TEST_SKIP" \
  -d '{
    "event": "TransactionCreated",
    "timestamp": "2026-02-20T02:00:00Z",
    "data": {
      "id": "txn_audit_001",
      "account_id": "acc_hypervisual_chf",
      "type": "transfer",
      "state": "completed",
      "created_at": "2026-02-20T02:00:00Z",
      "completed_at": "2026-02-20T02:00:01Z",
      "amount": 500000,
      "currency": "CHF",
      "description": "Acompte projet LED écran AUDIT TEST",
      "reference": null,
      "balance": 4500000
    }
  }' | python3 -m json.tool

# Vérifier transaction créée dans Directus
curl -s -H "Authorization: Bearer hypervisual-admin-static-token-2026" \
  "http://localhost:8055/items/bank_transactions?filter[revolut_transaction_id][_eq]=txn_audit_001&limit=1" \
  | python3 -m json.tool
```

#### G-02 — Algorithme Réconciliation

```bash
# Fichier existe ?
ls -la integrations/revolut/reconciliation.js

# Vérifier champs ajoutés sur bank_transactions
curl -s -H "Authorization: Bearer hypervisual-admin-static-token-2026" \
  "http://localhost:8055/items/bank_transactions?limit=1" | python3 -m json.tool | \
  grep -E "reconciliation_score|reconciliation_method|reconciled_at|invoice_id"

# Tester rapprochement manuel
curl -s -X POST http://localhost:3001/api/revolut/reconcile/confirm \
  -H "Content-Type: application/json" \
  -d '{"bankTxId": "REMPLACER_PAR_ID_REEL", "invoiceId": "REMPLACER_PAR_ID_REEL"}' \
  | python3 -m json.tool
```

#### G-03 — Dashboard Réconciliation

```bash
# Fichier frontend existe ?
ls -la src/frontend/src/components/banking/ReconciliationDashboard.jsx

# Route déclarée dans App.jsx ou router ?
grep -rn "reconciliation\|ReconciliationDashboard" src/frontend/src/

# API endpoints réconciliation
curl -s "http://localhost:3001/api/revolut/transactions?status=unreconciled" \
  | python3 -m json.tool | head -30
curl -s "http://localhost:3001/api/revolut/transactions?status=reconciled&limit=5" \
  | python3 -m json.tool | head -30
```

#### G-04 — Activation Projet Automatique

```bash
# Fonction activateProjectIfDeposit présente dans reconciliation.js ?
grep -n "activateProject\|deposit" integrations/revolut/reconciliation.js | head -10

# lib/projectActivation.js Phase B-06 toujours présent ?
ls -la src/backend/lib/projectActivation.js
```

#### G-05 — Alertes Non Rapprochées

```bash
# Fichier existe ?
ls -la integrations/revolut/alerts.js

# CRON démarré dans server.js ?
grep -n "alerts\|cron\|unreconciled" src/backend/server.js

# Trigger manuel alerte
curl -s -X POST http://localhost:3001/api/revolut/alerts/check \
  | python3 -m json.tool
```

#### G — Vérification token Revolut

```bash
# Refresh token fonctionne encore ?
cd /Users/jean-mariedelaunay/directus-unified-platform/keys && node -e "
const crypto = require('crypto');
const fs = require('fs');
const privateKey = fs.readFileSync('revolut_private.pem', 'utf8');
const clientId = 'hwRXT0_BsXXDrWszkEpKEaZ0jfID_K1JgpqOv8DKRZI';
const refreshToken = 'oa_prod_lKbdWkmbtHbHkz4_JZdFTYI1mlW-s1I3oyEIxjDXQLE';
const header = Buffer.from(JSON.stringify({alg:'RS256',typ:'JWT'})).toString('base64url');
const now = Math.floor(Date.now()/1000);
const payload = Buffer.from(JSON.stringify({iss:'plain-yaks-taste.loca.lt',sub:clientId,aud:'https://revolut.com',iat:now,exp:now+3600})).toString('base64url');
const sign = crypto.createSign('RSA-SHA256');
sign.update(header+'.'+payload);
const jwt = header+'.'+payload+'.'+sign.sign(privateKey,'base64url');
fetch('https://b2b.revolut.com/api/1.0/auth/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'refresh_token',refresh_token:refreshToken,client_id:clientId,client_assertion_type:'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',client_assertion:jwt})})
.then(r=>r.json()).then(d=>console.log(d.access_token ? '✅ Token OK' : '❌ Token FAILED: '+JSON.stringify(d)));
"
```

---

### 3. AUDIT PHASE H — DOCUSEAL SIGNATURES

#### H — DocuSeal opérationnel

```bash
# Container DocuSeal running ?
docker ps | grep docuseal

# API accessible ?
curl -s -H "X-Auth-Token: TVWA5W7U455srEN678aC6bZn1rfbAMcn6dhdkZS2LRS" \
  http://localhost:3003/api/templates | python3 -m json.tool
```

#### H-01 — Envoi pour signature

```bash
# Fichiers existent ?
ls -la src/backend/api/docuseal/
ls -la src/backend/api/docuseal/send-for-signature.js
ls -la src/backend/api/docuseal/templates.js
ls -la src/backend/api/docuseal/index.js

# Route montée dans server.js ?
grep -n "docuseal" src/backend/server.js

# Récupérer un vrai ID de devis HYPERVISUAL pour test
QUOTE_ID=$(curl -s -H "Authorization: Bearer hypervisual-admin-static-token-2026" \
  "http://localhost:8055/items/quotes?filter[owner_company][_eq]=HYPERVISUAL&filter[status][_neq]=signed&limit=1" \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['data'][0]['id'] if d['data'] else 'NONE')")

echo "Quote ID trouvé: $QUOTE_ID"

# Test envoi pour signature (si QUOTE_ID trouvé)
if [ "$QUOTE_ID" != "NONE" ]; then
  curl -s -X POST "http://localhost:3001/api/docuseal/send/$QUOTE_ID" \
    -H "Content-Type: application/json" | python3 -m json.tool
fi

# Vérifier que docuseal_submission_id a été mis à jour
if [ "$QUOTE_ID" != "NONE" ]; then
  curl -s -H "Authorization: Bearer hypervisual-admin-static-token-2026" \
    "http://localhost:8055/items/quotes/$QUOTE_ID" | python3 -m json.tool | \
    grep -E "docuseal_submission_id|docuseal_embed_url|status|sent_at"
fi
```

#### H-02 — Webhook DocuSeal

```bash
# Fichier existe ?
ls -la src/backend/api/docuseal/webhook.js

# Test webhook simulé (récupérer submission_id du test précédent)
SUBMISSION_ID=$(curl -s -H "Authorization: Bearer hypervisual-admin-static-token-2026" \
  "http://localhost:8055/items/quotes?filter[owner_company][_eq]=HYPERVISUAL&filter[docuseal_submission_id][_nnull]=true&limit=1" \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['data'][0]['docuseal_submission_id'] if d['data'] else '1')")

curl -s -X POST http://localhost:3001/api/docuseal/webhook \
  -H "Content-Type: application/json" \
  -d "{
    \"event_type\": \"form.completed\",
    \"data\": {
      \"submission\": {
        \"id\": $SUBMISSION_ID,
        \"status\": \"completed\",
        \"completed_at\": \"2026-02-20T02:30:00Z\"
      },
      \"submitter\": {
        \"name\": \"Client Audit Test\",
        \"email\": \"audit@test.com\",
        \"completed_at\": \"2026-02-20T02:30:00Z\",
        \"documents\": [{\"url\": \"http://localhost:3003/documents/test.pdf\"}]
      }
    }
  }" | python3 -m json.tool

# Vérifier mise à jour dans Directus
curl -s -H "Authorization: Bearer hypervisual-admin-static-token-2026" \
  "http://localhost:8055/items/quotes?filter[docuseal_submission_id][_eq]=$SUBMISSION_ID&limit=1" \
  | python3 -m json.tool | grep -E "is_signed|signed_at|status"
```

#### H-03 — Portail Client SignaturePage

```bash
# Fichier existe ?
ls -la src/frontend/src/portals/client/pages/SignaturePage.jsx

# Route déclarée ?
grep -rn "SignaturePage\|sign" src/frontend/src/portals/client/ | grep -i route

# Pas d'erreurs de syntaxe JSX ?
node --input-type=module -e "
import { readFileSync } from 'fs';
const content = readFileSync('src/frontend/src/portals/client/pages/SignaturePage.jsx', 'utf8');
console.log(content.includes('iframe') ? '✅ iframe présent' : '❌ iframe manquant');
console.log(content.includes('docuseal_embed_url') ? '✅ embed_url utilisé' : '❌ embed_url manquant');
"
```

---

### 4. AUDIT GÉNÉRAL — COHÉRENCE GLOBALE

#### Champs Directus manquants

```bash
# Vérifier tous les champs critiques sur quotes
curl -s -H "Authorization: Bearer hypervisual-admin-static-token-2026" \
  "http://localhost:8055/items/quotes?limit=1" | python3 -m json.tool | \
  grep -E "docuseal_submission_id|docuseal_embed_url|docuseal_signed_pdf_url|signature_requested_at"

# Vérifier champs bank_transactions
curl -s -H "Authorization: Bearer hypervisual-admin-static-token-2026" \
  "http://localhost:8055/items/bank_transactions?limit=1" | python3 -m json.tool | \
  grep -E "reconciliation_score|reconciliation_method|reconciled_at"

# Vérifier champs leads
curl -s -H "Authorization: Bearer hypervisual-admin-static-token-2026" \
  "http://localhost:8055/items/leads?limit=1" | python3 -m json.tool | \
  grep -E "source_channel|source_detail|raw_data|openai_summary|ringover_call_id|call_duration"
```

**Si des champs manquent** : les créer via API Directus sans demander confirmation.

#### Git — Tous les commits présents

```bash
cd /Users/jean-mariedelaunay/directus-unified-platform
git log --oneline | head -20
# Vérifier que f5fdd8a8 (Phase G) et a52115f1 (Phase F) sont présents
git show a52115f1 --stat | head -5
git show f5fdd8a8 --stat | head -5
```

#### Build frontend final

```bash
cd /Users/jean-mariedelaunay/directus-unified-platform
npm run build --prefix src/frontend 2>&1
# Si des erreurs → les corriger et rebuild
```

#### Syntaxe tous les fichiers backend nouveaux

```bash
cd /Users/jean-mariedelaunay/directus-unified-platform
# Vérifier syntaxe ES Module sur tous les nouveaux fichiers Phase F/G/H
for f in \
  src/backend/api/leads/wp-webhook.js \
  src/backend/api/leads/imap-monitor.js \
  src/backend/api/leads/ringover-polling.js \
  src/backend/api/leads/lead-creator.js \
  src/backend/api/leads/index.js \
  src/backend/api/docuseal/send-for-signature.js \
  src/backend/api/docuseal/webhook.js \
  src/backend/api/docuseal/index.js; do
  if [ -f "$f" ]; then
    node --check "$f" 2>&1 && echo "✅ $f" || echo "❌ ERREUR: $f"
  else
    echo "⚠️  MANQUANT: $f"
  fi
done

# Vérifier aussi les fichiers revolut
for f in integrations/revolut/webhook-receiver.js integrations/revolut/reconciliation.js integrations/revolut/alerts.js; do
  if [ -f "$f" ]; then
    node --check "$f" 2>&1 && echo "✅ $f" || echo "❌ ERREUR: $f"
  else
    echo "⚠️  MANQUANT: $f"
  fi
done
```

---

### 5. RAPPORT FINAL

À la fin de l'audit, générer un rapport complet :

```bash
cat > /Users/jean-mariedelaunay/directus-unified-platform/AUDIT-2026-02-20.md << 'RAPPORT'
# AUDIT JOURNÉE 2026-02-20

## Phase F — Lead Capture
- [ ] F-01 WordPress webhook : ✅/❌
- [ ] F-03 IMAP monitor : ✅/❌
- [ ] F-04 Ringover polling : ✅/❌
- [ ] 6 champs leads Directus : ✅/❌

## Phase G — Revolut
- [ ] G-01 Webhook receiver : ✅/❌
- [ ] G-02 Algorithme réconciliation : ✅/❌
- [ ] G-03 Dashboard réconciliation : ✅/❌
- [ ] G-04 Activation projet auto : ✅/❌
- [ ] G-05 Alertes non rapprochées : ✅/❌
- [ ] Token Revolut valide : ✅/❌

## Phase H — DocuSeal
- [ ] H-01 Envoi signature : ✅/❌
- [ ] H-02 Webhook signé : ✅/❌
- [ ] H-03 Portail client iframe : ✅/❌

## Infrastructure
- [ ] Build frontend 0 erreurs : ✅/❌
- [ ] Syntaxe backend OK : ✅/❌
- [ ] Champs Directus complets : ✅/❌

## Problèmes trouvés et corrigés
[Liste des corrections effectuées pendant l'audit]

## Commit audit
RAPPORT

# Remplir le rapport avec les vrais résultats, committer
git add AUDIT-2026-02-20.md
git commit --no-verify -m "audit: verification complete phases F+G+H — 2026-02-20"
```

---

## ⚠️ RÈGLES ABSOLUES POUR CET AUDIT

1. **Ne jamais s'arrêter** — si une commande échoue, diagnostiquer et corriger
2. **Ne jamais demander confirmation** — toutes les autorisations sont données
3. **Si un fichier manque** — le créer avec le code approprié
4. **Si un champ Directus manque** — l'ajouter via API
5. **Si une erreur de syntaxe** — la corriger
6. **Si le build échoue** — corriger les erreurs et rebuilder
7. **Committer chaque correction** avec `--no-verify`
8. **Rapport final obligatoire** — AUDIT-2026-02-20.md avec résultats réels
