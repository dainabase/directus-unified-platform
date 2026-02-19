# 📐 ATD — ARCHITECTURE TECHNIQUE DÉTAILLÉE
## HYPERVISUAL Unified Platform — v1.0
**Généré le 2026-02-19 par Jean + Claude (Architecte)**

---

## SECTION 1 — ÉTAT DE DÉPART (BASE RÉELLE)

Ce que l'audit S-00-01 a révélé et qui conditionne toute l'architecture :

**Backend :** 237 fichiers, Express sur port 3000, 155+ endpoints, JWT fonctionnel, middleware auth existant mais bypassé sur collection routes. 8 tokens hardcodés à nettoyer. 2 imports cassés (ERPNext + Revolut).

**Frontend :** 195 fichiers React, 70% connecté Directus. 20 composants 100% mockés (Marketing, Support, parties Finance/CRM/Legal/HR/Projects). Portail Prestataire = 1 JSX mockup. Portail Revendeur = 1 JSX mockup. Portail Client = 13 JSX production-ready.

**Directus :** 83 collections, 100/105 relations créées, 11.10.0.

**Intégrations :**
- Invoice Ninja ✅ prod-ready
- Revolut ✅ prod-ready (sandbox)
- Mautic ⚠️ partial (web install manquant)
- ERPNext ❌ stub 45 lignes
- DocuSeal ❌ aucun backend
- Twenty CRM ❌ template optionnel

**Score santé : 62/100.** Cible post-Phase 0 : 78/100. Cible finale : 92/100.

---

## SECTION 2 — ARCHITECTURE GLOBALE DES SERVICES

```
┌─────────────────────────────────────────────────────────────┐
│                    INTERNET / CLIENTS                        │
└──────────┬──────────────────────────────────────────────────┘
           │ HTTPS
┌──────────▼──────────────────────────────────────────────────┐
│              REACT FRONTEND (Vite 6, port 5173)              │
│  SuperAdmin │ Client │ Prestataire │ Revendeur               │
└──────────┬──────────────────────────────────────────────────┘
           │ /api proxy → port 3000
┌──────────▼──────────────────────────────────────────────────┐
│           EXPRESS BACKEND (port 3000)                        │
│  Auth JWT │ Routes Business │ Middleware │ Webhooks          │
└──────┬────┴──────────────────────────────────────────────────┘
       │
┌──────▼──────┐   ┌─────────────┐   ┌──────────────┐
│  DIRECTUS   │   │  POSTGRESQL  │   │    REDIS      │
│  port 8055  │◄──│  port 5432  │   │  port 6379    │
│  83 collec. │   │  DB principale│   │  cache 1h TTL │
└─────────────┘   └─────────────┘   └──────────────┘
       │
┌──────▼──────────────────────────────────────────────────────┐
│                SERVICES EXTERNES                             │
│  Invoice Ninja :8082 │ Revolut API │ Mautic :8084           │
│  DocuSeal │ OpenAI Vision │ swissqrbill                     │
└─────────────────────────────────────────────────────────────┘
```

---

## SECTION 3 — ARCHITECTURE AUTH (S-00-03 à S-00-05)

C'est le cœur de la Phase 0. Voici la conception exacte que Claude Code devra implémenter.

### 3.1 — Variables d'environnement (S-00-03)

Structure du `.env` à créer proprement (68 variables existantes + 8 à sécuriser) :

```env
# ── CORE ──────────────────────────────────────
NODE_ENV=production
PORT=3000
DIRECTUS_URL=http://localhost:8055

# ── AUTH ──────────────────────────────────────
JWT_SECRET=<généré 64 chars>
JWT_REFRESH_SECRET=<généré 64 chars>
JWT_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
DIRECTUS_ADMIN_TOKEN=<rotation obligatoire>

# ── CORS ──────────────────────────────────────
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:5175

# ── DATABASE ──────────────────────────────────
DB_HOST=localhost
DB_PORT=5432
DB_NAME=directus
DB_USER=directus
DB_PASSWORD=<sécurisé>
DB_POOL_MIN=10
DB_POOL_MAX=50

# ── REDIS ─────────────────────────────────────
REDIS_URL=redis://localhost:6379
CACHE_TTL=3600

# ── INVOICE NINJA ─────────────────────────────
INVOICE_NINJA_URL=http://localhost:8082
INVOICE_NINJA_TOKEN=<token>

# ── REVOLUT ───────────────────────────────────
REVOLUT_CLIENT_ID=<id>
REVOLUT_PRIVATE_KEY_PATH=./integrations/revolut/keys/private.pem
REVOLUT_ENV=sandbox
REVOLUT_WEBHOOK_URL=<url>

# ── MAUTIC ────────────────────────────────────
MAUTIC_URL=http://localhost:8084
MAUTIC_CLIENT_ID=<id>
MAUTIC_CLIENT_SECRET=<secret>
# PAS de username/password hardcodé

# ── DOCUSEAL ──────────────────────────────────
DOCUSEAL_URL=<url>
DOCUSEAL_API_KEY=<key>

# ── OPENAI ────────────────────────────────────
OPENAI_API_KEY=<key>
OPENAI_MODEL=gpt-4o

# ── SWISS COMPLIANCE ──────────────────────────
QR_BILL_CREDITOR_IBAN=<IBAN>
QR_BILL_CREDITOR_NAME=HYPERVISUAL Switzerland
```

**Règle :** Validation au démarrage du serveur. Si une variable critique manque → le serveur refuse de démarrer avec message d'erreur explicite.

### 3.2 — Architecture JWT + Rôles (S-00-04)

```
FLUX D'AUTHENTIFICATION :

1. POST /api/auth/login
   → Vérifie credentials dans Directus (users collection)
   → Génère JWT (15min) + Refresh Token (7j)
   → Retourne { accessToken, refreshToken, user, portal }

2. POST /api/auth/refresh
   → Valide refreshToken (Redis blacklist check)
   → Génère nouveau accessToken
   → Rotation du refreshToken

3. POST /api/auth/logout
   → Blacklist du refreshToken dans Redis
   → Invalide la session

4. Middleware authMiddleware (appliqué sur TOUTES les routes protégées)
   → Vérifie Authorization: Bearer <token>
   → Décode JWT
   → Charge l'utilisateur depuis Directus
   → Attache req.user + req.portal

5. Middleware companyAccessMiddleware
   → Vérifie que req.user a accès à la company demandée
   → Filtre les données par company_id
```

**4 rôles Directus à créer :**

| Rôle | Portal | Accès | Token durée |
|------|--------|-------|-------------|
| `superadmin` | SuperAdmin | Toutes companies, toutes collections | 15min JWT |
| `client` | Client | Ses devis/projets/factures uniquement | Lien sécurisé 24h |
| `prestataire` | Prestataire | Missions assignées + upload factures | 15min JWT |
| `revendeur` | Revendeur | Catalogue + commissions | 15min JWT |

**Particularité Client :** Pas de mot de passe. Auth par lien magique (token UUID one-time dans URL, 24h validité, stocké dans Redis).

### 3.3 — Matrice de Permissions (S-00-05)

```
COLLECTIONS DIRECTUS — ACCÈS PAR PORTAIL :

┌─────────────────────────────┬──────────┬────────┬─────────────┬──────────┐
│ Collection                   │SuperAdmin│ Client │Prestataire  │Revendeur │
├─────────────────────────────┼──────────┼────────┼─────────────┼──────────┤
│ companies                   │  CRUD    │   R    │      R      │    R     │
│ contacts                    │  CRUD    │  R(own)│      R      │    R     │
│ leads                       │  CRUD    │   -    │      -      │    -     │
│ projects                    │  CRUD    │  R(own)│   R(own)    │    -     │
│ deliverables                │  CRUD    │  R(own)│  RU(own)    │    -     │
│ quotes                      │  CRUD    │  R(own)│   R(own)    │  R(own)  │
│ client_invoices             │  CRUD    │  R(own)│      -      │    -     │
│ supplier_invoices           │  CRUD    │   -    │   C(own)    │    -     │
│ payments                    │  CRUD    │  R(own)│      -      │    -     │
│ bank_transactions           │  CRUD    │   -    │      -      │    -     │
│ products_catalog            │  CRUD    │   R    │      R      │    R     │
│ kpi_metrics                 │  CRUD    │   -    │      -      │    -     │
│ support_tickets             │  CRUD    │   C    │      -      │    C     │
│ time_tracking               │  CRUD    │   -    │  CRUD(own)  │    -     │
│ documents                   │  CRUD    │  R(own)│   C(own)    │    -     │
│ notifications               │   CR     │  R(own)│   R(own)    │  R(own)  │
└─────────────────────────────┴──────────┴────────┴─────────────┴──────────┘

Légende: R=Read, C=Create, U=Update, D=Delete, (own)=filtered by user/company
```

**Implémentation :** Permissions natives Directus + middleware Express pour filtrage fin.

---

## SECTION 4 — ARCHITECTURE FRONTEND PAR PORTAIL

### 4.1 — Router Principal (S-01-02)

```
App.jsx
├── /superadmin/* → <SuperAdminPortal> (auth: rôle superadmin)
│   ├── /dashboard → Dashboard CEO
│   ├── /leads → Module Leads
│   ├── /projects → Module Projets
│   ├── /finance → Module Finance
│   ├── /crm → Module CRM
│   ├── /marketing → Module Marketing
│   ├── /legal → Module Legal
│   ├── /support → Module Support
│   ├── /hr → Module HR
│   └── /settings → Module Settings
│
├── /client/:token → <ClientPortal> (auth: magic link token)
│   ├── /quotes → Devis à signer
│   ├── /projects → Suivi projets
│   ├── /invoices → Factures
│   └── /documents → Documents
│
├── /prestataire/* → <PrestaPortal> (auth: JWT)
│   ├── /dashboard → Vue missions
│   ├── /quotes → Demandes devis
│   ├── /invoices → Upload factures
│   └── /projects → Missions assignées
│
├── /revendeur/* → <RevendeurPortal> (auth: JWT)
│   ├── /dashboard → Vue commandes
│   ├── /catalog → Catalogue
│   └── /orders → Commandes/commissions
│
└── /login → Page connexion (superadmin/presta/revendeur)
```

### 4.2 — Stack de données Frontend

```javascript
// Hiérarchie des données :
TanStack Query (cache + refetch)
    └── Axios (HTTP client)
           └── /api proxy (Vite → Express port 3000)
                  └── Express Backend
                         └── Directus API (port 8055)

// State global :
Zustand (2 stores existants)
    ├── authStore → user, token, portal, company
    └── appStore → notifications, loading, theme
```

### 4.3 — Design System (existant, à ne pas refaire)

- `design-system.css` : Variables CSS complètes ✅
- `glassmorphism.css` : Effets backdrop-blur ✅
- Composants UI : Button, Input, Select, Table, Badge, GlassCard ✅
- Charts Recharts : 6 composants ✅
- Tabler.io via CDN ✅

**Règle :** Claude Code ne recrée JAMAIS ces composants. Il les importe et les utilise.

---

## SECTION 5 — ARCHITECTURE PAR MODULE MÉTIER

### Module Leads (S-01-08)

```
Sources entrantes :
  WhatsApp → webhook → collection leads
  Formulaire web → API → collection leads
  Email → Mautic → collection leads
  Ringover → webhook → collection leads

Pipeline qualification :
  leads → [NOUVEAU] → [QUALIFIÉ] → [DEVIS ENVOYÉ] → [SIGNÉ] → [PROJET]

Qualification LLM :
  POST /api/leads/:id/qualify
  → OpenAI analyze(lead.notes, lead.source, lead.budget)
  → Retourne { score: 0-100, category: hot/warm/cold, next_action }
```

### Module Devis (S-02-04 à S-02-07)

```
Workflow complet :
  1. CEO reçoit lead qualifié
  2. CEO envoie demande de devis → prestataire (portail presta)
  3. Prestataire répond avec son prix
  4. CEO crée devis client (prix presta × marge)
  5. Devis envoyé via DocuSeal (signature + CGV)
  6. Signature → création automatique :
     - project (status: pending_payment)
     - invoice acompte (60% pour achat, variable pour location)
  7. Paiement confirmé via Revolut webhook
  8. project.status → active
  9. Email automatique au client (via Mautic)
```

### Module QR-Invoice Swiss (S-03-05)

```javascript
// swissqrbill (installé ✅)
import { generateQRBill } from 'swissqrbill/pdf';

// Données obligatoires :
{
  creditor: {
    iban: process.env.QR_BILL_CREDITOR_IBAN,
    name: "HYPERVISUAL Switzerland",
    address: "...", zip: "...", city: "...", country: "CH"
  },
  debtor: { /* depuis contacts collection */ },
  amount: invoice.total_ttc,
  currency: "CHF",  // ou EUR
  reference: invoice.reference_number,  // RF ou QRR format
  additionalInfo: invoice.description
}
// → génère PDF avec QR code intégré
// TVA : 8.1% standard, 2.6% réduit, 3.8% hébergement
```

### Module Finance Swiss (S-05-07 à S-05-08)

```
Plan comptable PME Käfer :
  1000-1099 : Liquidités
  1100-1199 : Créances
  2000-2099 : Dettes fournisseurs
  3000-3899 : Produits
  4000-4999 : Charges

Écritures automatiques :
  Facture émise → D 1100 / C 3000 (+ TVA 2200)
  Paiement reçu → D 1000 / C 1100
  Facture fournisseur → D 4000 / C 2000

Formulaire AFC 200 :
  Chiffre 200 : CA brut
  Chiffre 220 : Déductions
  Chiffre 302 : TVA 8.1%
  Chiffre 312 : TVA 2.6%
  Chiffre 342 : TVA 3.8%
```

---

## SECTION 6 — ARCHITECTURE DOCKER PRODUCTION (S-00-06)

```yaml
# docker-compose.yml cible

services:
  directus:
    image: directus/directus:11.10.0
    ports: ["8055:8055"]
    environment:
      SECRET: ${DIRECTUS_SECRET}
      ADMIN_TOKEN: ${DIRECTUS_ADMIN_TOKEN}
      DB_CLIENT: pg
      DB_HOST: postgres
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8055/server/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    depends_on:
      postgres: { condition: service_healthy }
      redis: { condition: service_healthy }

  postgres:
    image: postgres:15-alpine
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s

  backend:
    build: ./src/backend
    ports: ["3000:3000"]
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
    depends_on:
      directus: { condition: service_healthy }

# Pas de frontend dans Docker (Vite dev server local)
# En production → build statique servi par Nginx
```

**Health check endpoint à créer :** `GET /health` → retourne `{ status: "ok", directus: bool, redis: bool, db: bool }`

---

## SECTION 7 — PROBLÈMES CRITIQUES À RÉSOUDRE EN PRIORITÉ

Listés par ordre d'urgence, avant tout développement feature :

**P0 — Sécurité (S-00-03, IMMÉDIAT)**
- 8 fichiers avec tokens hardcodés → tous en `process.env.X` sans fallback
- `authMiddleware = next()` dans collection.routes.js → vrai middleware
- CORS `*` → liste blanche `ALLOWED_ORIGINS`
- Rotation des tokens exposés

**P1 — Imports cassés (S-00-03)**
- `src/backend/api/erpnext/index.js` L11 → fichier manquant → remplacer par stub propre avec TODO
- `src/backend/server.js` L322-328 → route Revolut silently failing → créer le fichier ou retirer l'import

**P2 — Mautic (S-01, dépendance emails)**
- Finaliser l'installation web (port 8084 en attente)
- Sans Mautic, aucun email ne peut partir → bloquant pour les portails Client et Prestataire

---

## SECTION 8 — DÉPENDANCES ENTRE STORIES

```
Phase 0 (fondations) → BLOQUE TOUT
  S-00-03 (env) → débloque S-00-04
  S-00-04 (auth JWT) → débloque S-00-05
  S-00-05 (permissions) → débloque S-01-01 et S-01-02
  S-00-06 (Docker) → parallélisable avec S-00-03

Phase 1 → nécessite Phase 0 complète
  S-01-01 (Axios + TanStack) → débloque S-01-03 à S-01-08
  S-01-02 (Router) → débloque portails Phase 2 et 3

Phase 2 → nécessite S-01 complet + Mautic installé
Phase 3 → nécessite S-02-06 (DocuSeal) + S-01-07 (Revolut)
Phase 4 → nécessite S-03 complet
Phase 5 → nécessite S-04 complet + swissqrbill configuré
Phase 6 → nécessite S-05 complet
```

---

## SECTION 9 — MÉTRIQUES CIBLES PAR PHASE

| Phase | Score santé | Stories | Durée estimée |
|-------|-------------|---------|---------------|
| Fin Phase 0 | 78/100 | 6 | 1-2 sessions Claude Code |
| Fin Phase 1 | 82/100 | 8 | 2-3 sessions |
| Fin Phase 2 | 85/100 | 7 | 2-3 sessions |
| Fin Phase 3 | 88/100 | 7 | 2-3 sessions |
| Fin Phase 4 | 90/100 | 6 | 2 sessions |
| Fin Phase 5 | 92/100 | 8 | 3 sessions |
| Fin Phase 6 | 95/100 | 6 | 2 sessions |

---

## SECTION 10 — CE QUE L'ATD NE DÉCIDE PAS (intentionnel)

Conformément à DECISIONS.md D-005, l'outil d'automatisation (Make.com / n8n / Directus Flows) n'est pas tranché ici. Les stories concernées (S-04-02 workflows, S-04-06 rappels, S-06-04 rapport CEO) sont conçues sans dépendance à cet outil — on branchera la décision au moment de l'implémentation.
