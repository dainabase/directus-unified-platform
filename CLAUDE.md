# Directus Unified Platform — Multi-Portal Business Management

> **Projet** : Plateforme de gestion multi-entreprises (ERP/CRM/Finance/RH/Legal)
> **Proprietaire** : Jean-Marie Delaunay — HMF Corporation SA, Fribourg, Suisse
> **Stack** : Directus 11.10 + PostgreSQL 15 + Redis 7 + Express API + React 18 (Vite 6)
> **Repo** : 1,605 commits · 83 collections Directus · 100/105 relations
> **Derniere mise a jour** : Fevrier 2026

## Tech Stack
- Backend: Directus 11.10 (headless CMS), PostgreSQL 15, Redis 7, Node.js 18+, Express API (port 3000)
- Frontend: React 18, Vite 6, Tailwind CSS, Recharts, React Router v6
- State: Zustand (client) + TanStack Query (server/API)
- Forms: React Hook Form + Zod
- Integrations: Invoice Ninja v5, Revolut Business API v2, ERPNext v15, Mautic 5.x, DocuSeal, OpenAI Vision
- Docker Compose pour tous les services
- Design: Glassmorphism (backdrop-blur, transparences)

## Commands
- `docker-compose up -d` — Start full stack (Directus + PostgreSQL)
- `cd src/backend && node server.js` — Backend Express API (port 3000)
- `cd src/frontend && pnpm dev` — React dev server (port 5173)
- `cd src/frontend && pnpm build` — Production build
- `npx directus schema snapshot > schema.yaml` — Snapshot schema
- `npx directus schema apply ./schema-diff.yaml` — Apply changes

## Code Conventions
- Functional React components, hooks only
- Named exports preferred
- All Directus endpoints: ItemsService (NEVER raw Knex)
- All monetary values: integer cents (CHF centimes), Dinero.js for arithmetic
- Swiss locale: fr-CH primary, de-CH secondary, date DD.MM.YYYY
- `selectedCompany` prop globale pour filtrage multi-entreprise
- Chaque module a : `Dashboard.jsx`, `components/`, `hooks/`, `services/`, `index.js`
- API Directus via `src/frontend/src/api/directus.js`
- Hooks custom : `useDirectusQuery`, `useCompanies`, `useFinances`, `useProjects`, `usePeople`

## Swiss Compliance (Critical)
- QR-Invoice: SIX Group IG v2.3, structured addresses mandatory, `swissqrbill` npm
- VAT: 8.1% normal, 2.6% reduced, 3.8% accommodation — NEVER hardcode, always config
- Chart of accounts: Swiss PME Kafer (9 decimal classes)
- Signatures: ZertES-compliant QES via Swisscom Trust Services
- Currency: CHF primary, EUR/USD supported, Dinero.js
- Recouvrement: SchKG/LP — Mahnung 1/2/3 → Betreibungsbegehren → Commandement de payer

## Warnings
- NEVER commit .env or API tokens
- NEVER bypass Directus permissions with raw SQL
- NEVER use ApexCharts (use Recharts)
- NEVER use S3 storage (use Directus Storage)
- NEVER use SendGrid (use Mautic for ALL emails)
- NEVER invent HYPERVISUAL/HMF data (dates, clients, prices) without verification
- Revolut tokens expire 40min — ALWAYS implement refresh
- TVA rates: 8.1%, 2.6%, 3.8% — NEVER 7.7%, 2.5%, 3.7% (anciens taux)
- Backup avant modification majeure — Reference : `REFERENCE_DESKTOP_20251216_TESTED.sql`
- Le moteur comptable suisse est fonctionnel — ne pas le modifier sans comprendre les normes AFC/TVA
- Docker doit tourner pour acceder a Directus (port 8055)

---

## Architecture Globale

### Strategie hybride "Dashboard ORCHESTRE"
Le Superadmin React orchestre tout. Les outils specialises sont integres en iframe ou via API :
- **Invoice Ninja** → Facturation (iframe dans Finance)
- **Mautic** → Marketing automation (iframe dans Marketing)
- **Revolut API** → Transactions bancaires (sync automatique, 5 comptes entreprise)
- **ERPNext** → Comptabilite avancee (API REST)
- **DocuSeal** → Signatures electroniques (embedded dans Legal/Client)
- **Directus** → CMS/Data layer central (API REST + WebSockets)

### Les 5 entreprises (owner_companies)
| # | Entreprise | Domaine |
|---|-----------|---------|
| 1 | HMF Corporation SA | Holding |
| 2 | HYPERVISUAL | Digital signage / LED |
| 3 | ETEKOUT | Technologie |
| 4 | NK REALITY | Realite virtuelle/augmentee |
| 5 | LEXIA | Services juridiques |

Toutes les donnees sont filtrees par `owner_company` via un selecteur global dans le TopBar.

---

## Structure des fichiers

```
directus-unified-platform/
├── CLAUDE.md                          ← CE FICHIER
├── .mcp.json                          ← MCP servers config (postgres, directus, eslint)
├── docker-compose.yml                 ← Directus 11.10 + PostgreSQL
├── .env                               ← Config (JAMAIS commiter)
├── package.json                       ← pnpm monorepo
│
├── .claude/skills/                    ← 8 custom skills Claude Code
│
├── src/
│   ├── backend/                       ← Express API (port 3000)
│   │   ├── server.js                  ← Point d'entree, routes, proxy Directus
│   │   ├── api/
│   │   │   ├── auth/                  ← JWT authentication middleware
│   │   │   ├── finance/               ← 80+ endpoints finance
│   │   │   ├── commercial/            ← Workflow Lead→Quote→CGV→Signature→Acompte→Projet
│   │   │   ├── collection/            ← Recouvrement de creances
│   │   │   ├── legal/                 ← Juridique / CGV
│   │   │   ├── invoice-ninja/         ← Sync facturation
│   │   │   ├── revolut/               ← Sync bancaire (5 comptes)
│   │   │   ├── mautic/                ← Marketing automation
│   │   │   └── erpnext/               ← Comptabilite
│   │   ├── services/
│   │   │   ├── commercial/            ← 7 services (workflow, quotes, cgv, signatures, deposits...)
│   │   │   ├── finance/               ← 6 services
│   │   │   ├── collection/            ← 5 services (recouvrement)
│   │   │   ├── legal/                 ← 2 services
│   │   │   └── integrations/          ← 3 services
│   │   └── modules/
│   │       └── accounting/            ← Moteur comptable suisse
│   │           ├── core/              ← Plan comptable PME (Kafer)
│   │           ├── swiss-compliance/  ← TVA 2025, codes AFC, Form 200
│   │           ├── services/          ← QR-Invoice, export handlers
│   │           └── browser/           ← Version navigateur
│   │
│   └── frontend/
│       ├── vite.config.js
│       ├── package.json               ← React 18, Vite 6, TanStack Query, Zustand, Tailwind
│       └── src/
│           ├── App.jsx                ← ~50 routes, layout avec Sidebar + TopBar
│           ├── main.jsx               ← Entry point React
│           ├── api/                   ← API layer (config.js, directus.js)
│           ├── hooks/                 ← useDirectusQuery, useCompanies, useFinances, useProjects, usePeople
│           ├── components/
│           │   ├── layout/            ← Sidebar.jsx, TopBar.jsx
│           │   ├── ui/               ← Badge, Button, GlassCard, Input, Select, Table
│           │   └── banking/          ← BankingDashboard.jsx
│           ├── services/             ← API services partages
│           ├── stores/               ← Zustand stores
│           ├── utils/                ← Helpers, formatters
│           ├── styles/               ← design-system.css, glassmorphism.css
│           └── portals/
│               ├── superadmin/       ← PORTAIL PRINCIPAL
│               ├── client/           ← PRODUCTION-READY (14 fichiers)
│               ├── prestataire/      ← Mockup (1 fichier)
│               └── revendeur/        ← Mockup (1 fichier)
│
├── directus/extensions/               ← Custom Directus extensions
├── integrations/                      ← External API sync modules
├── docs/                              ← Documentation technique extensive
├── tools/migration/                   ← Scripts migration Directus
└── scripts/                           ← Scripts utilitaires
```

---

## Les 4 Portails

### 1. Superadmin (React) — Portail principal
**Chemin** : `src/frontend/src/portals/superadmin/`
**Acces** : `http://localhost:5173/superadmin`

10 modules avec routing unifie dans App.jsx :

| Module | Composants | Etat donnees | Notes |
|--------|-----------|-------------|-------|
| **Finance** | FinanceDashboard, KPICards, CashFlowChart, RecentTransactions, AlertsPanel | Partiel Directus | BudgetsManager & ExpensesTracker = mockes |
| **Collection** | CollectionDashboard, DebtorsList, DebtorDetail, AgingChart, InterestCalculator, WorkflowConfig, WorkflowTimeline, LPCases | Connecte Directus | Module recouvrement le plus avance |
| **CRM** | CRMDashboard, CompaniesList, CompanyForm, ContactsList, ContactForm, QuickStats | Partiel Directus | CustomerSuccess & PipelineView = mockes |
| **Leads** | LeadsDashboard, LeadKanban, LeadsList, LeadForm, LeadStats | Connecte Directus | |
| **Legal** | LegalDashboard, CGVManager, CGVEditor, CGVPreview, AcceptanceHistory, SignatureRequests, LegalStats | Partiel Directus | ComplianceManager & ContractsManager = mockes |
| **Marketing** | MarketingDashboard, CampaignsList, ContentCalendar, EventsManager, MarketingAnalytics | 100% mocke | Prevu : iframe Mautic |
| **Support** | SupportDashboard, TicketsManager, NotificationsCenter | 100% mocke | |
| **HR** | HRModule, TrainingsView + views Talents/Performance | Partiel mocke | |
| **Projects** | ProjectsModule, DeliverablesView, TimeTrackingView | Partiellement mocke | |
| **Settings** | SettingsDashboard, CompanySettings, UsersSettings, PermissionsSettings, IntegrationsSettings, ProductsList, ProductForm, TaxSettings, InvoiceSettings | Connecte Directus | |

**25 composants utilisent faker/Math.random au lieu de Directus** — priorite de connexion.

### 2. Client Portal — Production-ready
**Chemin** : `src/frontend/src/portals/client/`
14 fichiers, authentification JWT fonctionnelle.

### 3. Prestataire Portal — Mockup
**Chemin** : `src/frontend/src/portals/prestataire/Dashboard.jsx`
Un seul fichier avec donnees hardcodees. A developper.

### 4. Revendeur Portal — Mockup
**Chemin** : `src/frontend/src/portals/revendeur/Dashboard.jsx`
Un seul fichier avec donnees hardcodees. A developper.

---

## Directus — 83 Collections

### Collections principales peuplees
- `owner_companies` (5) — Les 5 entreprises du groupe
- `companies` — Entreprises clients/fournisseurs
- `people` / `contacts` — Personnes physiques
- `clients` / `suppliers` — Relations commerciales
- `projects` (100+) — Projets
- `deliverables` (100+) — Livrables
- `client_invoices` / `supplier_invoices` — Facturation
- `quotes` — Devis
- `payments` — Paiements
- `bank_transactions` — Transactions bancaires (sync Revolut)
- `bank_accounts` — Comptes bancaires
- `expenses` / `revenues` — Charges et revenus
- `products` / `services` — Catalogue
- `support_tickets` — Tickets support
- `dashboard_kpis` — KPIs

### Collections vides (a peupler)
`campaigns`, `leads`, `opportunities`, `contracts` (travail), `salaries`, `leaves`, `trainings`, `newsletters`, `emails`

### Relations cles
Toutes les collections metier ont une relation `owner_company` → `owner_companies` pour le filtrage multi-entreprise.
Voir `docs/directus-collections.md` et `docs/COMPLETE_COLLECTIONS_MAPPING.md` pour le mapping complet.

---

## Backend API — Routes Express

**Port** : 3000
**Base** : `src/backend/server.js`

```
/api/auth          → JWT authentication
/api/finance       → 80+ endpoints finance (partiellement implementes)
/api/commercial    → Workflow complet Lead→Quote→CGV→Signature→Acompte→Projet
/api/collection    → Recouvrement de creances
/api/legal         → Juridique / CGV
/api/invoice-ninja → Sync Invoice Ninja
/api/revolut       → Sync bancaire Revolut (5 comptes)
/api/erpnext       → Comptabilite ERPNext
/api/mautic        → Marketing automation

/admin    → Proxy vers Directus admin (port 8055)
/items    → Proxy vers Directus API
/auth     → Proxy vers Directus auth
/graphql  → Proxy vers Directus GraphQL
```

### Workflow commercial complet
```
Lead → Quote (devis) → CGV (conditions generales) → Signature (DocuSeal) → Acompte (paiement) → Projet
```
Implemente dans `src/backend/services/commercial/` (7 services).

### Moteur comptable suisse
`src/backend/modules/accounting/` — Conforme droit suisse :
- Plan comptable PME selon norme Kafer
- TVA 2025 avec codes AFC
- QR-Factures (QR-Invoice)
- Formulaire 200 AFC
- Export comptable

---

## Integrations externes

| Service | Usage | Config |
|---------|-------|--------|
| **Directus 11.10** | CMS / Data layer | Docker, port 8055, PostgreSQL |
| **Invoice Ninja** | Facturation | API token dans .env |
| **Revolut** | Banking (5 comptes) | OAuth2, cles privees par entreprise |
| **Mautic** | Marketing automation | API dans .env |
| **ERPNext** | Comptabilite | API dans .env |
| **DocuSeal** | Signatures electroniques | Embedded dans portails |
| **Cloudinary** | Stockage medias | API keys dans .env |
| **OpenAI** | OCR / AI features | API key dans .env |
| **Notion** | Sync projets/prestataires | Token + DB IDs dans .env |

---

## Priorites de developpement

### Phase 1 — Connecter les mockups (priorite)
25 composants utilisent des donnees faker/random. Les connecter a Directus :
1. **Marketing** (4 composants) → Integrer iframe Mautic
2. **Support** (2 composants) → Collection `support_tickets`
3. **HR** (3 views) → Collections `employees`, `trainings`
4. **Finance** (2 composants) → Collections `budgets`, `expenses`
5. **CRM** (2 composants) → Collections `companies`, pipeline
6. **Legal** (2 composants) → Collections `contracts`
7. **Projects** (2 views) → Collections `deliverables`, `time_tracking`

### Phase 2 — Portails secondaires
- Portail Prestataire : missions, time tracking, facturation
- Portail Revendeur : commandes, stocks, commissions

### Phase 3 — Production
- TypeScript migration
- Tests E2E
- CI/CD
- Monitoring
