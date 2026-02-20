# MEGA AUDIT COMPLET — PHASES A À H — DIRECTUS UNIFIED PLATFORM
# HYPERVISUAL Switzerland — 2026-02-20
# NE JAMAIS S'ARRÊTER — TOUTES LES AUTORISATIONS SONT DONNÉES

## ⚠️ RÈGLES ABSOLUES

1. Ne jamais s'arrêter, jamais demander confirmation
2. Si un fichier manque → le créer avec le bon code
3. Si un champ Directus manque → l'ajouter via API
4. Si erreur de syntaxe → la corriger
5. Si build échoue → corriger et rebuilder
6. Si endpoint ne répond pas → diagnostiquer et corriger
7. Committer chaque correction avec --no-verify
8. ES Modules partout → import/export, jamais require()
9. TVA suisse → 8.1% (pas 7.7%), 2.6% (pas 2.5%), 3.8% (pas 3.7%)
10. Rapport final obligatoire → AUDIT-COMPLET-2026-02-20.md

---

## SKILLS À LIRE EN PREMIER

```bash
cat ~/.claude/skills-repos/backend-api/SKILL.md
cat ~/.claude/skills-repos/directus-integration/SKILL.md
cat ~/.claude/skills-repos/webhook-handler/SKILL.md
```

---

## CREDENTIALS

```
DIRECTUS_URL=http://localhost:8055
DIRECTUS_TOKEN=hypervisual-admin-static-token-2026
DOCUSEAL_URL=http://localhost:3003
DOCUSEAL_API_KEY=TVWA5W7U455srEN678aC6bZn1rfbAMcn6dhdkZS2LRS
REVOLUT_CLIENT_ID=hwRXT0_BsXXDrWszkEpKEaZ0jfID_K1JgpqOv8DKRZI
REVOLUT_PRIVATE_KEY_PATH=./keys/revolut_private.pem
REVOLUT_REFRESH_TOKEN=oa_prod_lKbdWkmbtHbHkz4_JZdFTYI1mlW-s1I3oyEIxjDXQLE
REVOLUT_WEBHOOK_SECRET=wsk_ODGRAALJTW2rEVAFwPtoYoOgcBgNHrBL
```

---

## ÉTAPE 0 — INFRASTRUCTURE

```bash
cd /Users/jean-mariedelaunay/directus-unified-platform

# Docker
docker ps --format "table {{.Names}}\t{{.Status}}"

# Directus
curl -s http://localhost:8055/server/health | python3 -m json.tool

# Nombre de collections
curl -s -H "Authorization: Bearer hypervisual-admin-static-token-2026" \
  http://localhost:8055/collections | python3 -c \
  "import sys,json; d=json.load(sys.stdin); user=[c for c in d['data'] if not c['collection'].startswith('directus_')]; print(f'Collections user: {len(user)}')"

# Backend Node
curl -s http://localhost:3001/health || curl -s http://localhost:3001/api/health

# DocuSeal
curl -s -H "X-Auth-Token: TVWA5W7U455srEN678aC6bZn1rfbAMcn6dhdkZS2LRS" \
  http://localhost:3003/api/templates | python3 -c \
  "import sys,json; d=json.load(sys.stdin); print(f'DocuSeal OK — {len(d[\"data\"])} templates')"

# Build frontend
npm run build --prefix src/frontend 2>&1 | tail -10
```

---

## ÉTAPE 1 — PHASE A : INFRASTRUCTURE + AFFICHAGE (47 stories)

```bash
echo "=== PHASE A ==="

# Les 4 portails existent
for portal in superadmin client prestataire revendeur; do
  [ -d "src/frontend/src/portals/$portal" ] && echo "OK $portal" || echo "MANQUANT $portal"
done

# Collections critiques
for col in leads quotes projects client_invoices supplier_invoices \
  bank_transactions contacts companies deliverables payments \
  proposals providers orders automation_logs kpis; do
  RES=$(curl -s -H "Authorization: Bearer hypervisual-admin-static-token-2026" \
    "http://localhost:8055/items/$col?limit=1" | python3 -c \
    "import sys,json; d=json.load(sys.stdin); print('OK' if 'data' in d else 'FAIL')" 2>/dev/null)
  echo "$RES — $col"
done

# Tabler CDN
grep "tabler" src/frontend/index.html && echo "OK Tabler" || echo "MANQUANT Tabler"

# Recharts pas ApexCharts
grep "recharts" src/frontend/package.json && echo "OK Recharts"
grep "apexcharts" src/frontend/package.json && echo "ERREUR ApexCharts detecte" || true

# App.jsx routing
grep -c "Route\|router" src/frontend/src/App.jsx

# Code splitting
grep -r "React.lazy" src/frontend/src/ | wc -l

# CHF formatting
grep -r "CHF\|fr-CH" src/frontend/src/ | wc -l
```

---

## ÉTAPE 2 — PHASE B : CYCLE DE VENTE (8 stories)

```bash
echo "=== PHASE B ==="

for f in \
  "src/frontend/src/portals/superadmin/leads/LeadsDashboard.jsx" \
  "src/frontend/src/portals/superadmin/quotes/QuoteForm.jsx" \
  "src/frontend/src/portals/superadmin/quotes/QuotesModule.jsx" \
  "src/frontend/src/portals/superadmin/invoices/InvoiceGenerator.jsx" \
  "src/frontend/src/portals/superadmin/invoices/InvoiceDetailView.jsx" \
  "src/frontend/src/portals/superadmin/invoices/InvoicesModule.jsx" \
  "src/frontend/src/portals/superadmin/widgets/AlertsWidget.jsx" \
  "src/frontend/src/portals/superadmin/widgets/KPIWidget.jsx" \
  "src/backend/lib/projectActivation.js"; do
  [ -f "$f" ] && echo "OK $(basename $f)" || echo "MANQUANT $f"
done

# Qualify/convert/archive
grep -c "qualify\|convert\|archive" src/frontend/src/portals/superadmin/leads/LeadsDashboard.jsx

# TVA 8.1% dans QuoteForm
grep -n "8.1\|tax_rate" src/frontend/src/portals/superadmin/quotes/QuoteForm.jsx | head -5

# Wizard deposit/balance
grep -n "deposit\|acompte" src/frontend/src/portals/superadmin/invoices/InvoiceGenerator.jsx | head -5

# ProjectActivation
grep -n "activateProject\|deliverables" src/backend/lib/projectActivation.js | head -5

# Données réelles
curl -s -H "Authorization: Bearer hypervisual-admin-static-token-2026" \
  "http://localhost:8055/items/leads?filter[owner_company][_eq]=HYPERVISUAL&meta=filter_count&limit=1" | \
  python3 -c "import sys,json; d=json.load(sys.stdin); print(f'Leads HV: {d[\"meta\"][\"filter_count\"]}')"

curl -s -H "Authorization: Bearer hypervisual-admin-static-token-2026" \
  "http://localhost:8055/items/quotes?filter[owner_company][_eq]=HYPERVISUAL&meta=filter_count&limit=1" | \
  python3 -c "import sys,json; d=json.load(sys.stdin); print(f'Devis HV: {d[\"meta\"][\"filter_count\"]}')"

curl -s -H "Authorization: Bearer hypervisual-admin-static-token-2026" \
  "http://localhost:8055/items/client_invoices?filter[owner_company][_eq]=HYPERVISUAL&meta=filter_count&limit=1" | \
  python3 -c "import sys,json; d=json.load(sys.stdin); print(f'Factures HV: {d[\"meta\"][\"filter_count\"]}')"
```

---

## ÉTAPE 3 — PHASE C : PORTAIL CLIENT (8 stories)

```bash
echo "=== PHASE C ==="

for f in \
  "src/frontend/src/portals/client/auth/ClientAuth.jsx" \
  "src/frontend/src/portals/client/hooks/useClientAuth.js" \
  "src/frontend/src/portals/client/auth/ClientPortalGuard.jsx" \
  "src/frontend/src/portals/client/Dashboard.jsx" \
  "src/frontend/src/portals/client/quotes/QuoteSignature.jsx" \
  "src/frontend/src/portals/client/projects/ClientProjectsList.jsx" \
  "src/frontend/src/portals/client/projects/ProjectTracking.jsx" \
  "src/frontend/src/portals/client/invoices/ClientInvoices.jsx" \
  "src/frontend/src/portals/client/messages/ClientMessages.jsx" \
  "src/frontend/src/portals/client/layout/ClientLayout.jsx"; do
  [ -f "$f" ] && echo "OK $(basename $f)" || echo "MANQUANT $f"
done

# Magic link auth
grep -n "magic\|token\|localStorage" \
  src/frontend/src/portals/client/auth/ClientAuth.jsx | head -3

# CGV 3 etapes
grep -c "CGV\|cgv\|signature_log" \
  src/frontend/src/portals/client/quotes/QuoteSignature.jsx

# Polling 15s messagerie
grep -n "setInterval\|15000" \
  src/frontend/src/portals/client/messages/ClientMessages.jsx | head -3

# Route protegee
grep -n "ClientPortalGuard\|client" src/frontend/src/App.jsx | head -5

# Thème emerald
grep -c "emerald" src/frontend/src/portals/client/layout/ClientLayout.jsx
```

---

## ÉTAPE 4 — PHASE D : PORTAIL PRESTATAIRE (7 stories)

```bash
echo "=== PHASE D ==="

for f in \
  "src/frontend/src/portals/prestataire/hooks/useProviderAuth.js" \
  "src/frontend/src/portals/prestataire/auth/ProviderAuth.jsx" \
  "src/frontend/src/portals/prestataire/auth/ProviderPortalGuard.jsx" \
  "src/frontend/src/portals/prestataire/Dashboard.jsx" \
  "src/frontend/src/portals/prestataire/quotes/QuoteRequests.jsx" \
  "src/frontend/src/portals/prestataire/orders/PurchaseOrders.jsx" \
  "src/frontend/src/portals/prestataire/invoices/ProviderInvoices.jsx" \
  "src/frontend/src/portals/prestataire/layout/PrestataireLayout.jsx" \
  "src/frontend/src/portals/superadmin/providers/ProvidersModule.jsx"; do
  [ -f "$f" ] && echo "OK $(basename $f)" || echo "MANQUANT $f"
done

# Thème violet
grep -c "violet\|indigo" \
  src/frontend/src/portals/prestataire/layout/PrestataireLayout.jsx

# Upload PDF
grep -n "FormData\|upload\|files" \
  src/frontend/src/portals/prestataire/invoices/ProviderInvoices.jsx | head -3

# TVA auto 8.1%
grep -n "8.1\|tax" \
  src/frontend/src/portals/prestataire/quotes/QuoteRequests.jsx | head -3

# Collections
curl -s -H "Authorization: Bearer hypervisual-admin-static-token-2026" \
  "http://localhost:8055/items/proposals?limit=2&fields=id,status,amount" | python3 -m json.tool

curl -s -H "Authorization: Bearer hypervisual-admin-static-token-2026" \
  "http://localhost:8055/items/providers?limit=2&fields=id,name,email" | python3 -m json.tool
```

---

## ÉTAPE 5 — PHASE E : EMAILS MAUTIC (6 stories)

```bash
echo "=== PHASE E ==="

for f in \
  "src/backend/api/email/lead-confirmation.js" \
  "src/backend/api/email/quote-sent.js" \
  "src/backend/api/email/payment-confirmed.js" \
  "src/backend/api/email/invoice-reminders.js" \
  "src/backend/api/email/supplier-approved.js" \
  "src/backend/api/email/provider-reminder.js" \
  "src/backend/api/email/templates.js"; do
  [ -f "$f" ] && echo "OK $(basename $f)" || echo "MANQUANT $f"
done

# Mautic sendEmail
grep -n "sendEmail" src/backend/api/mautic/index.js | head -3

# CRON rappels J+7/J+14/J+30
grep -n "7\|14\|30" src/backend/api/email/invoice-reminders.js | head -5

# Anti-doublon automation_logs
grep -c "automation_logs" src/backend/api/email/lead-confirmation.js

# Route email
grep -n "email" src/backend/server.js | head -5

# Health
curl -s http://localhost:3001/api/email/health | python3 -m json.tool

# CRITIQUE — anciens taux TVA dans emails
grep -rn "7\.7\|2\.5\|3\.7" src/backend/api/email/ && \
  echo "ERREUR anciens taux TVA — corriger vers 8.1/2.6/3.8" || \
  echo "OK taux TVA corrects"
```

---

## ÉTAPE 6 — PHASE F : LEADS MULTICANAL (3/4 stories)

```bash
echo "=== PHASE F ==="

for f in \
  "src/backend/api/leads/wp-webhook.js" \
  "src/backend/api/leads/imap-monitor.js" \
  "src/backend/api/leads/ringover-polling.js" \
  "src/backend/api/leads/lead-creator.js" \
  "src/backend/api/leads/index.js"; do
  [ -f "$f" ] && echo "OK $(basename $f)" || echo "MANQUANT $f"
done

# Route leads
grep -n "leads" src/backend/server.js

# Health
curl -s http://localhost:3001/api/leads/health | python3 -m json.tool

# Anti-doublon 30min
grep -n "30\|duplicate\|automation_logs" src/backend/api/leads/lead-creator.js | head -5

# Pas de require()
grep -rn "require(" src/backend/api/leads/ && echo "ERREUR require detecte" || echo "OK ES Modules"

# 6 champs Phase F sur leads
curl -s -H "Authorization: Bearer hypervisual-admin-static-token-2026" \
  "http://localhost:8055/items/leads?limit=1" | python3 -m json.tool | \
  grep -E "source_channel|source_detail|raw_data|openai_summary|ringover_call_id|call_duration"

# Si champs manquants les creer
for field_def in "source_channel:string" "source_detail:string" "raw_data:json" \
  "openai_summary:text" "ringover_call_id:string" "call_duration:integer"; do
  field="${field_def%:*}"
  ftype="${field_def#*:}"
  EXISTS=$(curl -s -H "Authorization: Bearer hypervisual-admin-static-token-2026" \
    "http://localhost:8055/items/leads?limit=1" | python3 -c \
    "import sys,json; d=json.load(sys.stdin); print('yes' if '$field' in (d['data'][0] if d['data'] else {}) else 'no')")
  if [ "$EXISTS" = "no" ]; then
    echo "Ajout champ $field ($ftype) sur leads..."
    curl -s -X POST "http://localhost:8055/fields/leads" \
      -H "Authorization: Bearer hypervisual-admin-static-token-2026" \
      -H "Content-Type: application/json" \
      -d "{\"field\": \"$field\", \"type\": \"$ftype\"}"
  fi
done

# Test WordPress webhook
curl -s -X POST http://localhost:3001/api/leads/wp-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "fields": {
      "field_1": "Audit Test Complet",
      "field_2": "audit.complet@hypervisual.ch",
      "field_3": "+41791234999",
      "field_4": "Ecran LED 5x3m evenement Geneve"
    },
    "form_id": 17
  }' | python3 -m json.tool

sleep 2
curl -s -H "Authorization: Bearer hypervisual-admin-static-token-2026" \
  "http://localhost:8055/items/leads?filter[email][_eq]=audit.complet@hypervisual.ch&limit=1" | \
  python3 -m json.tool | grep -E "id|email|source_channel|status"

# Test IMAP scan
curl -s -X POST http://localhost:3001/api/leads/imap-scan | python3 -m json.tool

# Test Ringover scan
curl -s -X POST http://localhost:3001/api/leads/ringover-scan | python3 -m json.tool
```

---

## ÉTAPE 7 — PHASE G : REVOLUT + RÉCONCILIATION (5 stories)

```bash
echo "=== PHASE G ==="

for f in \
  "integrations/revolut/webhook-receiver.js" \
  "integrations/revolut/sync-transactions.js" \
  "integrations/revolut/reconciliation.js" \
  "integrations/revolut/alerts.js" \
  "src/frontend/src/components/banking/ReconciliationDashboard.jsx"; do
  [ -f "$f" ] && echo "OK $(basename $f)" || echo "MANQUANT $f"
done

# Route revolut
grep -n "revolut" src/backend/server.js

# Champs bank_transactions Phase G
curl -s -H "Authorization: Bearer hypervisual-admin-static-token-2026" \
  "http://localhost:8055/items/bank_transactions?limit=1" | python3 -m json.tool | \
  grep -E "reconciliation_score|reconciliation_method|reconciled_at|revolut_transaction_id"

# Si champs manquants les creer
for field_def in "reconciliation_score:integer" "reconciliation_method:string" \
  "reconciled_at:timestamp" "reconciliation_notes:text"; do
  field="${field_def%:*}"
  ftype="${field_def#*:}"
  EXISTS=$(curl -s -H "Authorization: Bearer hypervisual-admin-static-token-2026" \
    "http://localhost:8055/items/bank_transactions?limit=1" | python3 -c \
    "import sys,json; d=json.load(sys.stdin); print('yes' if '$field' in (d['data'][0] if d['data'] else {}) else 'no')")
  if [ "$EXISTS" = "no" ]; then
    echo "Ajout champ $field sur bank_transactions..."
    curl -s -X POST "http://localhost:8055/fields/bank_transactions" \
      -H "Authorization: Bearer hypervisual-admin-static-token-2026" \
      -H "Content-Type: application/json" \
      -d "{\"field\": \"$field\", \"type\": \"$ftype\"}"
  fi
done

# Scoring 4 criteres
grep -n "40\|35\|15\|10\|score\|Levenshtein" integrations/revolut/reconciliation.js | head -10

# Seuil 85%
grep -n "85\|autoMatch\|auto_match" integrations/revolut/reconciliation.js | head -3

# Test webhook Revolut
curl -s -X POST http://localhost:3001/api/revolut/webhook \
  -H "Content-Type: application/json" \
  -H "revolut-signature: TEST_SKIP" \
  -d '{
    "event": "TransactionCreated",
    "timestamp": "2026-02-20T03:00:00Z",
    "data": {
      "id": "txn_audit_mega_001",
      "account_id": "acc_hypervisual_chf",
      "type": "transfer",
      "state": "completed",
      "created_at": "2026-02-20T03:00:00Z",
      "completed_at": "2026-02-20T03:00:01Z",
      "amount": 1250000,
      "currency": "CHF",
      "description": "Acompte LED Geneve MEGA AUDIT",
      "reference": null,
      "balance": 4500000
    }
  }' | python3 -m json.tool

sleep 2
curl -s -H "Authorization: Bearer hypervisual-admin-static-token-2026" \
  "http://localhost:8055/items/bank_transactions?filter[revolut_transaction_id][_eq]=txn_audit_mega_001&limit=1" | \
  python3 -m json.tool | grep -E "id|amount|state|revolut_transaction_id"

# Endpoints reconciliation
curl -s "http://localhost:3001/api/revolut/transactions?status=unreconciled" | python3 -m json.tool | head -20

# Dashboard dans router
grep -rn "ReconciliationDashboard\|reconciliation" src/frontend/src/ | grep -i "route\|import" | head -5

# CRON alertes
grep -n "cron\|setInterval\|5.*day" integrations/revolut/alerts.js | head -5

# Token Revolut valide
cd keys && node --input-type=module -e "
import crypto from 'crypto';
import fs from 'fs';
const privateKey = fs.readFileSync('revolut_private.pem', 'utf8');
const clientId = 'hwRXT0_BsXXDrWszkEpKEaZ0jfID_K1JgpqOv8DKRZI';
const refreshToken = 'oa_prod_lKbdWkmbtHbHkz4_JZdFTYI1mlW-s1I3oyEIxjDXQLE';
const header = Buffer.from(JSON.stringify({alg:'RS256',typ:'JWT'})).toString('base64url');
const now = Math.floor(Date.now()/1000);
const payload = Buffer.from(JSON.stringify({iss:'plain-yaks-taste.loca.lt',sub:clientId,aud:'https://revolut.com',iat:now,exp:now+3600})).toString('base64url');
const sign = crypto.createSign('RSA-SHA256');
sign.update(header+'.'+payload);
const jwt = header+'.'+payload+'.'+sign.sign(privateKey,'base64url');
const res = await fetch('https://b2b.revolut.com/api/1.0/auth/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'refresh_token',refresh_token:refreshToken,client_id:clientId,client_assertion_type:'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',client_assertion:jwt})});
const d = await res.json();
console.log(d.access_token ? 'OK Token Revolut VALIDE' : 'ERREUR Token: '+JSON.stringify(d));
" && cd ..
```

---

## ÉTAPE 8 — PHASE H : DOCUSEAL SIGNATURES (3 stories)

```bash
echo "=== PHASE H ==="

# DocuSeal running
docker ps | grep docuseal && echo "OK DocuSeal" || docker start docuseal

for f in \
  "src/backend/api/docuseal/index.js" \
  "src/backend/api/docuseal/send-for-signature.js" \
  "src/backend/api/docuseal/webhook.js" \
  "src/backend/api/docuseal/templates.js" \
  "src/frontend/src/portals/client/pages/SignaturePage.jsx"; do
  [ -f "$f" ] && echo "OK $(basename $f)" || echo "MANQUANT $f"
done

# Route docuseal
grep -n "docuseal" src/backend/server.js

# Champs quotes Phase H
curl -s -H "Authorization: Bearer hypervisual-admin-static-token-2026" \
  "http://localhost:8055/items/quotes?limit=1" | python3 -m json.tool | \
  grep -E "docuseal_submission_id|docuseal_embed_url|docuseal_signed_pdf_url|signature_requested_at"

# Si champs manquants les creer
for field_def in "docuseal_submission_id:integer" "docuseal_embed_url:string" \
  "docuseal_signed_pdf_url:string" "signature_requested_at:timestamp"; do
  field="${field_def%:*}"
  ftype="${field_def#*:}"
  EXISTS=$(curl -s -H "Authorization: Bearer hypervisual-admin-static-token-2026" \
    "http://localhost:8055/items/quotes?limit=1" | python3 -c \
    "import sys,json; d=json.load(sys.stdin); print('yes' if '$field' in (d['data'][0] if d['data'] else {}) else 'no')")
  if [ "$EXISTS" = "no" ]; then
    echo "Ajout champ $field sur quotes..."
    curl -s -X POST "http://localhost:8055/fields/quotes" \
      -H "Authorization: Bearer hypervisual-admin-static-token-2026" \
      -H "Content-Type: application/json" \
      -d "{\"field\": \"$field\", \"type\": \"$ftype\"}"
  fi
done

# Template DocuSeal
curl -s -H "X-Auth-Token: TVWA5W7U455srEN678aC6bZn1rfbAMcn6dhdkZS2LRS" \
  http://localhost:3003/api/templates | python3 -m json.tool

# Test envoi signature
QUOTE_ID=$(curl -s -H "Authorization: Bearer hypervisual-admin-static-token-2026" \
  "http://localhost:8055/items/quotes?filter[owner_company][_eq]=HYPERVISUAL&filter[status][_nin]=signed,cancelled&limit=1" | \
  python3 -c "import sys,json; d=json.load(sys.stdin); print(d['data'][0]['id'] if d['data'] else 'NONE')")
echo "Quote ID: $QUOTE_ID"

if [ "$QUOTE_ID" != "NONE" ]; then
  curl -s -X POST "http://localhost:3001/api/docuseal/send/$QUOTE_ID" \
    -H "Content-Type: application/json" | python3 -m json.tool
  sleep 2
  curl -s -H "Authorization: Bearer hypervisual-admin-static-token-2026" \
    "http://localhost:8055/items/quotes/$QUOTE_ID" | python3 -m json.tool | \
    grep -E "docuseal_submission_id|docuseal_embed_url|status|sent_at"
fi

# Test webhook signature complete
SUBMISSION_ID=$(curl -s -H "Authorization: Bearer hypervisual-admin-static-token-2026" \
  "http://localhost:8055/items/quotes?filter[docuseal_submission_id][_nnull]=true&limit=1" | \
  python3 -c "import sys,json; d=json.load(sys.stdin); print(d['data'][0].get('docuseal_submission_id',1) if d['data'] else 1)")

curl -s -X POST http://localhost:3001/api/docuseal/webhook \
  -H "Content-Type: application/json" \
  -d "{
    \"event_type\": \"form.completed\",
    \"data\": {
      \"submission\": {
        \"id\": $SUBMISSION_ID,
        \"status\": \"completed\",
        \"completed_at\": \"2026-02-20T03:30:00Z\"
      },
      \"submitter\": {
        \"name\": \"Client Audit\",
        \"email\": \"audit@hypervisual.ch\",
        \"completed_at\": \"2026-02-20T03:30:00Z\",
        \"documents\": [{\"url\": \"http://localhost:3003/documents/audit.pdf\"}]
      }
    }
  }" | python3 -m json.tool

# SignaturePage iframe
grep -n "iframe\|docuseal_embed_url" \
  src/frontend/src/portals/client/pages/SignaturePage.jsx | head -5
```

---

## ÉTAPE 9 — AUDIT TRANSVERSAL

```bash
echo "=== AUDIT TRANSVERSAL ==="

# Anciens taux TVA partout
echo "--- Taux TVA ---"
grep -rn "7\.7\|7,7\|2\.5\|2,5\|3\.7\|3,7" \
  src/backend/ src/frontend/src/ integrations/ \
  --include="*.js" --include="*.jsx" 2>/dev/null | \
  grep -v node_modules | \
  grep -v ".git" && \
  echo "ERREUR anciens taux — corriger vers 8.1/2.6/3.8" || \
  echo "OK taux TVA corrects partout"

# require() interdit
echo "--- ES Modules ---"
grep -rn "^const.*= require\|^var.*= require" \
  src/backend/ integrations/ \
  --include="*.js" 2>/dev/null | \
  grep -v node_modules && \
  echo "ERREUR require detecte — convertir en import" || \
  echo "OK ES Modules partout"

# Syntaxe tous fichiers backend
echo "--- Syntaxe backend ---"
find src/backend/api integrations -name "*.js" 2>/dev/null | while read f; do
  node --check "$f" 2>&1 | grep -v "^$" && echo "ERREUR SYNTAXE: $f" || echo "OK $f"
done

# Build final
echo "--- Build final ---"
npm run build --prefix src/frontend 2>&1 | tail -10

# Commits du jour
echo "--- Commits 2026-02-20 ---"
git log --oneline --since="2026-02-20 00:00:00"

# automation_logs recents
curl -s -H "Authorization: Bearer hypervisual-admin-static-token-2026" \
  "http://localhost:8055/items/automation_logs?limit=10&sort[]=-date_created" | \
  python3 -m json.tool | grep -E "action|entity_type|level" | head -20
```

---

## ÉTAPE 10 — RAPPORT FINAL

```bash
echo "=== RAPPORT FINAL ==="

cd /Users/jean-mariedelaunay/directus-unified-platform

# Commit toutes corrections
git add -A
git diff --cached --stat
git commit --no-verify -m "audit: corrections completes phases A-H — 2026-02-20" 2>/dev/null || \
  echo "Rien a committer — tout est propre"

# Creer rapport
cat > AUDIT-COMPLET-2026-02-20.md << 'EOF'
# AUDIT COMPLET PHASES A-H — 2026-02-20

## PHASE A — Infrastructure (47 stories)
- 4 portails : [resultat]
- Collections : [resultat]/83
- Tabler CDN : [resultat]
- Recharts : [resultat]
- CHF fr-CH : [resultat]

## PHASE B — Cycle de vente (8 stories)
- LeadsDashboard : [resultat]
- QuoteForm TVA 8.1% : [resultat]
- InvoiceGenerator : [resultat]
- InvoiceDetailView : [resultat]
- ProjectActivation : [resultat]
- AlertsWidget : [resultat]
- KPIWidget : [resultat]

## PHASE C — Portail client (8 stories)
- ClientAuth magic link : [resultat]
- ClientPortalGuard : [resultat]
- Dashboard Directus : [resultat]
- QuoteSignature CGV : [resultat]
- ProjectTracking : [resultat]
- ClientInvoices : [resultat]
- ClientMessages polling : [resultat]
- ClientLayout emerald : [resultat]

## PHASE D — Portail prestataire (7 stories)
- ProviderAuth : [resultat]
- Dashboard prestataire : [resultat]
- QuoteRequests TVA auto : [resultat]
- PurchaseOrders : [resultat]
- ProviderInvoices upload : [resultat]
- PrestataireLayout violet : [resultat]
- ProvidersModule admin : [resultat]

## PHASE E — Emails Mautic (6 stories)
- lead-confirmation : [resultat]
- quote-sent : [resultat]
- payment-confirmed : [resultat]
- invoice-reminders J+7/14/30 : [resultat]
- supplier-approved : [resultat]
- provider-reminder CRON : [resultat]
- Anti-doublon logs : [resultat]

## PHASE F — Leads multicanal (3/4 stories)
- wp-webhook : [resultat]
- imap-monitor : [resultat]
- ringover-polling : [resultat]
- 6 champs leads : [resultat]
- Test webhook OK : [resultat]

## PHASE G — Revolut (5 stories)
- webhook-receiver : [resultat]
- reconciliation 4 criteres : [resultat]
- ReconciliationDashboard : [resultat]
- activateProjectIfDeposit : [resultat]
- alerts CRON : [resultat]
- Token Revolut valide : [resultat]
- Champs bank_transactions : [resultat]

## PHASE H — DocuSeal (3 stories)
- DocuSeal running : [resultat]
- send-for-signature : [resultat]
- webhook form.completed : [resultat]
- SignaturePage iframe : [resultat]
- Champs quotes : [resultat]

## TRANSVERSAL
- TVA 8.1% partout : [resultat]
- ES Modules partout : [resultat]
- Build 0 erreurs : [resultat]

## Corrections effectuees
[liste des corrections]

## Champs ajoutes
[liste des champs]

## Score final
A: 47/47 | B: 8/8 | C: 8/8 | D: 7/7 | E: 6/6 | F: 3/4 | G: 5/5 | H: 3/3
TOTAL: XX/88
EOF

git add AUDIT-COMPLET-2026-02-20.md
git commit --no-verify -m "audit: rapport final complet phases A-H — 2026-02-20"

echo ""
echo "AUDIT COMPLET TERMINE — RAPPORT: AUDIT-COMPLET-2026-02-20.md"
```
