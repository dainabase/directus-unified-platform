# 📊 ANALYSE COMPLÈTE - DIRECTUS UNIFIED PLATFORM
## Document exhaustif généré le 14 décembre 2025

---

## 🎯 RÉSUMÉ EXÉCUTIF

**Plateforme:** Directus Unified Platform
**Architecture:** Multi-portails headless CMS avec 5 entreprises
**Stack:** React 18.2 + Vite + Tailwind CSS + Directus + PostgreSQL
**Collections Directus:** 82 (55 métier + 27 système)
**État global:** ~75% fonctionnel

---

## 🏢 ENTREPRISES PROPRIÉTAIRES (CONFIRMÉES VIA MCP)

| Code | Nom | Type | Couleur | Statut |
|------|-----|------|---------|--------|
| HYPERVISUAL | HYPERVISUAL | main | #2196F3 | active |
| DAINAMICS | DAINAMICS | subsidiary | #4CAF50 | active |
| LEXAIA | LEXAIA | subsidiary | #FF9800 | active |
| ENKI_REALTY | ENKI REALTY | subsidiary | #9C27B0 | active |
| TAKEOUT | TAKEOUT | subsidiary | #F44336 | active |

---

## 📦 COLLECTIONS DIRECTUS (82 au total)

### Collections Métier (55)

#### 🏢 CRM & Contacts (7)
- `companies` - Entreprises clients
- `people` - Contacts individuels
- `company_people` - Liaison companies↔people
- `interactions` - Historique interactions client
- `customer_success` - Suivi satisfaction client
- `providers` - Fournisseurs/Prestataires
- `owner_companies` - Les 5 entreprises propriétaires

#### 💰 Finance (14)
- `accounting_entries` - Écritures comptables
- `bank_transactions` - Transactions bancaires Revolut
- `bank_accounts` - Comptes bancaires multi-devises
- `budgets` - Gestion budgétaire
- `client_invoices` - Factures clients
- `supplier_invoices` - Factures fournisseurs
- `expenses` - Notes de frais
- `payments` - Paiements reçus/émis
- `reconciliations` - Rapprochements bancaires
- `subscriptions` - Abonnements récurrents
- `credits` - Crédits/Avoirs
- `debits` - Débits
- `refunds` - Remboursements
- `exchange_rates` - Taux de change

#### 📋 Projets (9)
- `projects` - Projets clients
- `projects_team` - Équipe projet
- `deliverables` - Livrables/Tâches
- `time_tracking` - Suivi temps
- `contracts` - Contrats
- `proposals` - Propositions commerciales
- `quotes` - Devis
- `orders` - Commandes
- `deliveries` - Livraisons

#### 👥 RH (8)
- `talents` - Collaborateurs
- `talents_simple` - Version simplifiée
- `teams` - Équipes
- `departments` - Départements
- `skills` - Compétences
- `evaluations` - Évaluations performance
- `trainings` - Formations
- `roles` - Rôles système

#### 🎫 Support (8)
- `support_tickets` - Tickets support
- `notifications` - Notifications système
- `comments` - Commentaires
- `notes` - Notes
- `activities` - Journal activités
- `events` - Événements/RDV
- `workflows` - Workflows automatisés
- `approvals` - Approbations

#### ⚙️ Système (6)
- `permissions` - Permissions granulaires
- `settings` - Paramètres
- `tags` - Tags/Labels
- `audit_logs` - Logs d'audit
- `compliance` - Conformité réglementaire
- `content_calendar` - Calendrier éditorial

#### 📊 Intégrations (4)
- `kpis` - Indicateurs de performance
- `goals` - Objectifs
- `returns` - Retours produits
- `revolut_sync_logs` - Logs sync Revolut

### Collections Système Directus (27)
directus_access, directus_activity, directus_collections, directus_comments, 
directus_fields, directus_files, directus_folders, directus_migrations, 
directus_permissions, directus_policies, directus_presets, directus_relations, 
directus_revisions, directus_roles, directus_sessions, directus_settings, 
directus_users, directus_webhooks, directus_dashboards, directus_panels, 
directus_notifications, directus_shares, directus_flows, directus_operations, 
directus_translations, directus_versions, directus_extensions

---

## 🔍 MODULE OCR - 100% FONCTIONNEL ✅

### Architecture

```
services/ocr/
├── FINAL-OCR-MODULE-STATUS.md    # Documentation complète
├── ocr-premium-dashboard-fixed.html
└── [assets]

backend/ocr-service/
├── src/
│   ├── server.js                 # Serveur Express port 3001
│   ├── config/
│   │   ├── logger.js             # Winston logging
│   │   └── redis.js              # Redis/Bull config
│   ├── services/
│   │   ├── ocr.service.js        # Service Tesseract
│   │   └── extraction.service.js # Extraction données
│   ├── routes/
│   │   └── ocr.routes.js         # Routes API
│   └── utils/
│       └── patterns.js           # Regex extraction
├── Dockerfile                    # Image Docker
├── docker-compose.yml            # Stack complète
└── README.md
```

### Capacités

| Fonctionnalité | Statut | Détails |
|----------------|--------|---------|
| OpenAI Vision API | ✅ | gpt-4o-mini configuré |
| Mode fallback manuel | ✅ | Fonctionne sans clé OpenAI |
| Tesseract OCR Docker | ✅ | Multi-langues: FR, EN, DE, IT |
| Traitement parallèle | ✅ | 4 workers + Redis queue |
| Précision | ✅ | >95% sur factures suisses |

### Configuration

```env
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-4o-mini
OPENAI_MAX_TOKENS=4096
OPENAI_TEMPERATURE=0.2
```

### Performance

- **Temps traitement:** <15s par document
- **Formats supportés:** JPG, PNG, GIF, WebP, PDF
- **Taille max:** 20 MB par fichier
- **Coût estimé:** ~$0.01 par page

### Flux de traitement

```
1. Upload PDF/Image
   ↓
2. Extraction OCR (OpenAI Vision ou Manuel)
   ↓
3. Validation données
   ↓
4. Création document dans Directus
   ↓
5. Création facture si applicable
   ↓
6. Relations automatiques
```

---

## 🔌 INTÉGRATIONS EXTERNES (5 Systèmes)

### 1. Invoice Ninja v5 ✅ 100% OPÉRATIONNEL

**Port:** 8090
**URL:** http://localhost:8090

```
integrations/invoice-ninja/
├── docker-compose.invoice-ninja.yml
├── setup-invoice-ninja.js
├── sync-invoices.js
├── invoice-webhook.js          # Port 3001
├── README.md
└── .env.invoice-ninja
```

**Fonctionnalités:**
- ✅ Facturation multi-entreprises
- ✅ Devis et paiements
- ✅ Sync bidirectionnel Directus
- ✅ Templates par entreprise
- ✅ Webhooks temps réel

**Mapping statuts:**
| Directus | Invoice Ninja |
|----------|---------------|
| draft | 1 |
| sent | 2 |
| paid | 4 |
| overdue | -1 |
| cancelled | 5 |

### 2. Revolut Business API v2 ✅ PRÊT

**Port webhooks:** 3002
**Lignes de code:** 1,129 lignes

```
integrations/revolut/
├── api/
│   ├── auth.js           (256 lignes) - OAuth2 JWT RS256
│   ├── accounts.js       (249 lignes) - Multi-devises
│   ├── transactions.js   (316 lignes) - Sync Directus
│   └── webhooks.js       (308 lignes) - Temps réel
├── sync/
│   ├── scheduler.js      # Cron jobs
│   ├── mapper.js
│   └── reconciliation.js
├── config/
│   └── companies.json
├── keys/                 # RSA private keys (gitignored)
└── README.md
```

**Scheduler:**
- Transactions: toutes les 5 minutes
- Balances: toutes les 30 minutes
- Réconciliation: 2h AM quotidien

**Devises supportées:** CHF, EUR, USD, GBP

### 3. Mautic 5.x ⚠️ INSTALLATION EN COURS

**Port:** 8084
**URL:** http://localhost:8084

```
integrations/mautic/
├── docker-compose.yml
├── webhook-config.json
├── MAUTIC_ACTIVATED.md
└── [scripts]
```

**Services Docker:**
- mautic-app (application)
- mautic-db (MariaDB 10.6)
- mautic-cron (jobs automatiques)

**Configuration DB:**
```
Host: mautic-db
Port: 3306
Database: mautic
Username: mautic
Password: mautic_secure_2025
Admin: admin@superadmin.com / Admin@Mautic2025
```

**Statut:** Containers actifs, installation web à finaliser

### 4. ERPNext v15 ❌ NON FONCTIONNEL

**Port prévu:** 8083

```
integrations/erpnext/
├── docker-compose.yml         # 11 services - ÉCHEC
├── docker-compose-simple.yml  # 3 services - Partiel
├── docker-compose-ultra-simple.yml
├── migrate-to-erpnext.js
├── test-erpnext.sh
└── ERPNEXT_STATUS.md
```

**Problèmes:**
- Images Docker v15.latest introuvables
- Configuration réseau complexe
- Initialisation manuelle requise

**Recommandation:** Utiliser Invoice Ninja ou ERPNext Cloud (frappe.cloud)

### 5. Twenty CRM ⏳ EN COURS

```
integrations/twenty/
├── install-twenty-mcp-server.sh
└── test-twenty-api.sh
```

---

## 🖥️ FRONTEND REACT

### Stack Technique

```json
{
  "react": "^18.2.0",
  "vite": "^5.0.8",
  "@tabler/core": "1.0.0-beta20",
  "@tanstack/react-query": "^5.84.1",
  "recharts": "^3.1.2",
  "framer-motion": "^12.23.12",
  "lucide-react": "^0.536.0",
  "tailwindcss": "^3.4.0",
  "zustand": "^5.0.7",
  "axios": "^1.6.2",
  "date-fns": "^3.6.0"
}
```

### Architecture Frontend

```
src/frontend/src/
├── App.jsx              # Router principal
├── main.jsx             # Bootstrap
├── index.css            # Styles globaux
│
├── api/
│   ├── directus.js      # Client API
│   └── hooks.js         # React Query hooks
│
├── components/
│   ├── banking/
│   │   ├── BankingDashboard.jsx
│   │   └── banking-glassmorphism.css
│   ├── charts/          # 6 composants Recharts
│   │   ├── CashFlowChart.jsx
│   │   ├── ClientsChart.jsx
│   │   ├── MetricsRadar.jsx
│   │   ├── PerformanceChart.jsx
│   │   ├── ProjectsChart.jsx
│   │   └── RevenueChart.jsx
│   ├── layout/
│   │   ├── Layout.jsx
│   │   ├── Sidebar.jsx
│   │   └── TopBar.jsx
│   └── ui/              # Design System
│       ├── Badge.jsx
│       ├── Button.jsx
│       ├── GlassCard.jsx
│       ├── Input.jsx
│       ├── Select.jsx
│       └── Table.jsx
│
├── hooks/
│   ├── useCache.js
│   └── useKPIData.js
│
├── modules/
│   ├── hr/
│   │   └── HRModule.jsx
│   └── projects/
│       └── ProjectsModule.jsx
│
├── portals/
│   ├── client/
│   │   └── Dashboard.jsx    # Minimal
│   ├── prestataire/
│   │   └── Dashboard.jsx    # Minimal
│   ├── revendeur/
│   │   └── Dashboard.jsx    # Minimal
│   └── superadmin/          # DÉVELOPPÉ
│       ├── Dashboard.jsx
│       ├── collection/
│       │   ├── CollectionDashboard.jsx
│       │   ├── components/  # 8 composants
│       │   ├── hooks/
│       │   └── services/
│       ├── crm/
│       │   ├── CRMDashboard.jsx
│       │   ├── components/  # 5 composants
│       │   ├── hooks/
│       │   └── services/
│       ├── finance/
│       │   ├── FinanceDashboard.jsx
│       │   ├── components/  # 4 composants
│       │   ├── hooks/
│       │   └── services/
│       ├── legal/
│       │   ├── LegalDashboard.jsx
│       │   ├── components/  # 6 composants
│       │   ├── hooks/
│       │   └── services/
│       └── settings/
│           └── services/
│
├── services/
│   ├── api/
│   │   ├── config.js
│   │   ├── demoData.js
│   │   ├── directus.js
│   │   └── kpi.js
│   ├── hooks/           # 7 hooks métier
│   │   ├── useCompanies.js
│   │   ├── useDirectusQuery.js
│   │   ├── useFinances.js
│   │   ├── useInitialize.js
│   │   ├── useMetrics.js
│   │   ├── usePeople.js
│   │   └── useProjects.js
│   └── state/
│       └── store.js     # Zustand
│
├── styles/
│   ├── design-system.css
│   └── glassmorphism.css
│
└── utils/
    ├── company-filter.js
    ├── company-mapping.js
    ├── filter-helpers.js
    ├── recharts.js
    └── optimizations/
        ├── advanced-cache.js
        ├── lazy-loader.js
        ├── service-worker.js
        └── virtual-scroll.js
```

### 4 Portails

| Portail | URL | État | Fonctionnalités |
|---------|-----|------|-----------------|
| SuperAdmin | /superadmin | 🟡 En dev | Dashboard CEO, CRM, Finance, Collection, Legal |
| Client | /client | 🔴 Minimal | Structure de base uniquement |
| Prestataire | /prestataire | 🔴 Minimal | Structure de base uniquement |
| Revendeur | /revendeur | 🔴 Minimal | Structure de base uniquement |

---

## 🧮 MODULE COMPTABILITÉ SUISSE

### Architecture (7,393 lignes de code)

```
src/backend/modules/accounting/
├── index.js
├── README.md
├── core/
│   └── accounting-engine.js      (764 lignes)
├── swiss-compliance/
│   ├── qr-invoice.js             (693 lignes) - ISO 20022 v2.3
│   ├── chart-of-accounts.js      (2,536 lignes) - Plan PME Käfer
│   ├── afc-codes.js              (396 lignes) - 21 codes officiels
│   ├── form-200-generator.js     (577 lignes) - Formulaire TVA AFC
│   ├── tva-engine.js             # Taux 2025
│   └── export-handlers.js        # PDF/XML eCH-0217
├── services/
│   └── entry-automation.js
├── utils/
│   └── formatters.js
└── browser/
    └── accounting-engine-browser.js
```

### Conformité Suisse

| Composant | Standard | Statut |
|-----------|----------|--------|
| QR-Facture | ISO 20022 v2.3 | ✅ |
| Plan comptable | Käfer PME | ✅ |
| Codes AFC | 21 codes officiels | ✅ |
| TVA 2025 | 8.1% / 2.6% / 3.8% | ✅ |
| Formulaire 200 | Format officiel | ✅ |
| Export | eCH-0217 XML | ✅ |

### Taux TVA 2025

| Type | Taux |
|------|------|
| Normal | 8.1% |
| Réduit | 2.6% |
| Hébergement | 3.8% |

---

## 🔧 BACKEND SERVICES

### Structure

```
backend/
├── adapters/
│   └── directus-adapter.js
├── config/
│   ├── nginx.conf
│   ├── performance-config.js
│   └── security-config.js
├── legacy-api/
│   ├── server.js
│   ├── routes/
│   ├── services/
│   ├── middleware/
│   └── schemas/
├── ocr-service/
│   └── [voir section OCR]
└── services/
    └── [services métier]
```

### Serveurs

| Fichier | Port | Description |
|---------|------|-------------|
| server-directus-unified.js | 3000 | Serveur principal |
| server.js | 3000 | Legacy |
| Directus | 8055 | Admin CMS |

---

## 📁 ARBORESCENCE COMPLÈTE

```
directus-unified-platform/
├── .archive-local-docs-20251213/  # 123 fichiers archivés
├── .changeset/                    # Gestion versions
├── .claude/                       # Config Claude
├── .github/
│   └── workflows/                 # 50+ workflows CI/CD
├── .mcp/                          # MCP Directus server
├── .vscode/                       # Config VSCode
├── .workspace/                    # Postman collections
│
├── QUICK/                         # Références rapides
│   ├── GUIDE-TOKEN-DIRECTUS.md
│   ├── ISSUES.md
│   ├── TODO.md
│   ├── TODO-COMPLETED.md
│   ├── VICTORY-REPORT.md
│   └── WINS.md
│
├── STATUS/                        # Rapports d'état (30+ fichiers)
│   ├── ocr-configured-success.md
│   ├── FINAL-SUCCESS-REPORT.md
│   └── [...]
│
├── apps/
│   ├── super-admin-dashboard/
│   └── web/
│
├── audit-results/
│   └── AUDIT_REPORT.md
│
├── automation/
│   ├── cron/
│   ├── n8n/
│   └── webhooks/
│
├── backend/
│   ├── adapters/
│   ├── config/
│   ├── legacy-api/
│   ├── ocr-service/
│   └── services/
│
├── config/
│   ├── docker/
│   ├── env/
│   ├── nginx/
│   └── ssl/
│
├── database/
│
├── directus/
│   ├── database/
│   ├── extensions/
│   ├── flows/
│   ├── init-db/
│   ├── migrations/
│   ├── templates/
│   └── uploads/
│
├── directus-template/
│
├── docs/                          # Documentation
│   ├── ANALYSE-COMPLETE-2025-12-14.md
│   ├── ARCHITECTURE-FINANCE-MODULE.md
│   ├── components/                # 60+ fichiers .md
│   ├── prompts/                   # PROMPT-01 à 13
│   └── superadmin/
│
├── e2e/
│   ├── dashboard.spec.ts
│   └── storybook.spec.ts
│
├── extensions/
│
├── integrations/
│   ├── erpnext/
│   ├── invoice-ninja/
│   ├── mautic/
│   ├── revolut/
│   └── twenty/
│
├── mcp/                           # Config MCP
│
├── mcp-docker-setup/
│
├── migration/
│   ├── active/
│   ├── analysis/
│   ├── docs/
│   ├── logs/
│   ├── prompts/
│   ├── reports/
│   ├── schemas/
│   └── scripts/
│
├── migrations/
│   └── 20241213_finance_relations_fix.sql
│
├── monitoring/
│   ├── alerts/
│   ├── dashboards/
│   └── logs/
│
├── owner-company-migration/
│
├── packages/
│   ├── ui/                        # Design System Library
│   │   ├── .storybook/
│   │   ├── src/
│   │   └── NPM_PUBLICATION_GUIDE.md
│   └── ui-cli/
│
├── scripts/
│   ├── analysis/
│   ├── archive/
│   ├── build/
│   ├── cleanup/
│   ├── deploy/
│   ├── deployment/
│   ├── dev/
│   ├── kpis-personnalization/
│   ├── maintenance/
│   ├── migration/
│   ├── populate-data/
│   ├── setup/
│   ├── testing/
│   ├── utilities/
│   └── validation/
│
├── services/
│   ├── notion/
│   └── ocr/
│
├── src/
│   ├── backend/
│   ├── directus/
│   ├── frontend/
│   └── services/
│
├── tests/
│   ├── dashboard/
│   ├── e2e/
│   ├── integration/
│   ├── migration/
│   ├── performance/
│   └── unit/
│
├── tools/
│   ├── cleanup/
│   ├── migration/
│   ├── monitoring/
│   ├── testing/
│   └── validation/
│
├── uploads/
│   └── invoices/
│
├── docker-compose.yml
├── docker-compose.mcp.yml
├── docker-compose.storybook.yml
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── server.js
├── server-directus-unified.js
└── README.md
```

---

## 🚀 DÉMARRAGE RAPIDE

### 1. Démarrer la stack Docker

```bash
cd directus-unified-platform
docker compose up -d
```

### 2. Démarrer le frontend

```bash
cd src/frontend
npm install
npm run dev
```

### 3. Accès

| Service | URL |
|---------|-----|
| Dashboard | http://localhost:3000 |
| Directus Admin | http://localhost:8055/admin |
| Invoice Ninja | http://localhost:8090 |
| Mautic | http://localhost:8084 |
| OCR Service | http://localhost:3001 |

### 4. API Token

```
dashboard-api-token-2025
```

---

## 📊 ÉTAT D'AVANCEMENT

### Par Module

| Module | Avancement | Détails |
|--------|------------|---------|
| Collections Directus | 95% | 82 collections créées |
| OCR | 100% | Complètement fonctionnel |
| Invoice Ninja | 100% | Opérationnel |
| Revolut API | 95% | Prêt, tests en cours |
| Mautic | 50% | Installation web à finaliser |
| ERPNext | 10% | Problèmes Docker |
| Frontend SuperAdmin | 70% | Dashboard en développement |
| Frontend Autres | 10% | Structures minimales |
| Comptabilité Suisse | 100% | Module complet |
| Relations Directus | 80% | Quelques manquantes |

### Actions Prioritaires

1. ⚡ **Finaliser installation Mautic** (web interface)
2. ⚡ **Compléter les relations Directus** (FK manquantes)
3. ⚡ **Développer Dashboard SuperAdmin** (prompts 1-10)
4. 📋 Créer collections manquantes (opportunities, tax_declarations...)
5. 📋 Développer portails Client/Prestataire/Revendeur
6. 📋 Importer données historiques

---

## 🔐 SÉCURITÉ & CONFIGURATION

### Variables d'Environnement (.env)

```env
# Directus
DIRECTUS_URL=http://localhost:8055
DIRECTUS_TOKEN=dashboard-api-token-2025

# OpenAI
OPENAI_API_KEY=sk-proj-...

# Notion (Legacy)
NOTION_API_KEY=ntn_...

# JWT
JWT_SECRET=...

# Revolut (par entreprise)
REVOLUT_HYPERVISUAL_CLIENT_ID=...
REVOLUT_HYPERVISUAL_PRIVATE_KEY_PATH=...
```

### Authentification

| Méthode | Usage |
|---------|-------|
| JWT Tokens | API Directus |
| OAuth2 RS256 | Revolut Business |
| API Keys | OpenAI, Invoice Ninja |
| Basic Auth | Mautic |

### Permissions (RBAC)

- **SuperAdmin:** Accès total, toutes entreprises
- **Client:** Ses projets, factures, support
- **Prestataire:** Ses missions, facturation
- **Revendeur:** Ses clients, commissions

---

## 📝 DOCUMENTATION ASSOCIÉE

| Document | Localisation |
|----------|--------------|
| Guide d'intégration | `/mnt/project/Guide_Complet_d_Intégration_pour_Dashboard_React_Directus_Unifié.md` |
| Architecture Finance | `/docs/ARCHITECTURE-FINANCE-MODULE.md` |
| Prompts Claude Code | `/docs/prompts/PROMPT-01.md` à `PROMPT-13.md` |
| Audit Frontend | `/RAPPORT-AUDIT-FRONTEND-SUPERADMIN.md` |
| Collections Mapping | `/docs/COMPLETE_COLLECTIONS_MAPPING.md` |

---

**Document généré le 14 décembre 2025**
**Analyse via MCP Directus + Desktop Commander**
**82 collections confirmées | 5 intégrations | 4 portails**
