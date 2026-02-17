# CLAUDE.md — Directus Unified Platform

> **Projet** : Plateforme de gestion multi-entreprises (ERP/CRM/Finance/RH/Legal)
> **Propriétaire** : Jean-Marie Delaunay — HMF Corporation SA, Fribourg, Suisse
> **Stack** : Directus 11.10 + PostgreSQL + Express API + React 18 (Vite 6)
> **Repo** : 1,605 commits · 83 collections Directus · 100/105 relations
> **Dernière mise à jour** : Février 2026

---

## 🏗️ ARCHITECTURE GLOBALE

### Stratégie hybride "Dashboard ORCHESTRE"
Le Superadmin React orchestre tout. Les outils spécialisés sont intégrés en iframe ou via API :
- **Invoice Ninja** → Facturation (iframe dans Finance)
- **Mautic** → Marketing automation (iframe dans Marketing)
- **Revolut API** → Transactions bancaires (sync automatique, 5 comptes entreprise)
- **ERPNext** → Comptabilité avancée (API REST)
- **DocuSeal** → Signatures électroniques (embedded dans Legal/Client)
- **Directus** → CMS/Data layer central (API REST + WebSockets)

### Les 5 entreprises (owner_companies)
| # | Entreprise | Domaine |
|---|-----------|---------|
| 1 | HMF Corporation SA | Holding |
| 2 | HYPERVISUAL | Digital signage / LED |
| 3 | ETEKOUT | Technologie |
| 4 | NK REALITY | Réalité virtuelle/augmentée |
| 5 | LEXIA | Services juridiques |

Toutes les données sont filtrées par `owner_company` via un sélecteur global dans le TopBar.

---

## 📁 STRUCTURE DES FICHIERS

```
directus-unified-platform/
├── CLAUDE.md                          ← CE FICHIER
├── docker-compose.yml                 ← Directus 11.10 + PostgreSQL
├── .env                               ← Config (voir section ENV)
├── package.json                       ← pnpm monorepo
│
├── src/
│   ├── backend/                       ← Express API (port 3000)
│   │   ├── server.js                  ← Point d'entrée, routes, proxy Directus
│   │   ├── api/
│   │   │   ├── auth/                  ← JWT authentication middleware
│   │   │   ├── finance/               ← 80+ endpoints finance
│   │   │   ├── commercial/            ← Workflow Lead→Quote→CGV→Signature→Acompte→Projet
│   │   │   │   ├── pipeline.routes.js
│   │   │   │   ├── quotes.routes.js
│   │   │   │   ├── cgv.routes.js
│   │   │   │   ├── signatures.routes.js
│   │   │   │   ├── deposits.routes.js
│   │   │   │   └── portal.routes.js
│   │   │   ├── collection/            ← Recouvrement de créances
│   │   │   ├── legal/                 ← Juridique / CGV
│   │   │   ├── invoice-ninja/         ← Sync facturation
│   │   │   ├── revolut/               ← Sync bancaire (5 comptes)
│   │   │   ├── mautic/                ← Marketing automation
│   │   │   └── erpnext/               ← Comptabilité
│   │   ├── services/
│   │   │   ├── commercial/            ← 7 services (workflow, quotes, cgv, signatures, deposits...)
│   │   │   ├── finance/               ← 6 services
│   │   │   ├── collection/            ← 5 services (recouvrement)
│   │   │   ├── legal/                 ← 2 services
│   │   │   └── integrations/          ← 3 services
│   │   └── modules/
│   │       └── accounting/            ← Moteur comptable suisse
│   │           ├── core/              ← Plan comptable PME (Käfer)
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
│           ├── services/             ← API services partagés
│           ├── stores/               ← Zustand stores
│           ├── utils/                ← Helpers, formatters
│           ├── styles/               ← design-system.css, glassmorphism.css
│           └── portals/
│               ├── superadmin/       ← ⭐ PORTAIL PRINCIPAL (voir détails ci-dessous)
│               ├── client/           ← ✅ PRODUCTION-READY (14 fichiers)
│               ├── prestataire/      ← 🟡 Mockup (1 fichier)
│               └── revendeur/        ← 🟡 Mockup (1 fichier)
│
├── docs/                              ← Documentation technique extensive
│   ├── directus-collections.md        ← 83 collections, statuts
│   ├── COMPLETE_COLLECTIONS_MAPPING.md ← Mapping legacy → Directus
│   ├── ARCHITECTURE-FINANCE-MODULE.md
│   ├── ANALYSE-WORKFLOWS-COMPLET.md
│   └── ...
│
├── tools/
│   └── migration/                     ← Scripts migration Directus
│
└── scripts/                           ← Scripts utilitaires (à trier)
```

---

## 🖥️ LES 4 PORTAILS

### 1. Superadmin (React) — Portail principal
**Chemin** : `src/frontend/src/portals/superadmin/`
**Accès** : `http://localhost:5173/superadmin`

10 modules avec routing unifié dans App.jsx :

| Module | Composants | État données | Notes |
|--------|-----------|-------------|-------|
| **Finance** | FinanceDashboard, KPICards, CashFlowChart, RecentTransactions, AlertsPanel | ✅ Partiel Directus | BudgetsManager & ExpensesTracker = mockés |
| **Collection** | CollectionDashboard, DebtorsList, DebtorDetail, AgingChart, InterestCalculator, WorkflowConfig, WorkflowTimeline, LPCases | ✅ Connecté Directus | Module recouvrement le plus avancé |
| **CRM** | CRMDashboard, CompaniesList, CompanyForm, ContactsList, ContactForm, QuickStats | ✅ Partiel Directus | CustomerSuccess & PipelineView = mockés |
| **Leads** | LeadsDashboard, LeadKanban, LeadsList, LeadForm, LeadStats | ✅ Connecté Directus | |
| **Legal** | LegalDashboard, CGVManager, CGVEditor, CGVPreview, AcceptanceHistory, SignatureRequests, LegalStats | ✅ Partiel Directus | ComplianceManager & ContractsManager = mockés |
| **Marketing** | MarketingDashboard, CampaignsList, ContentCalendar, EventsManager, MarketingAnalytics | ❌ 100% mocké | Prévu : iframe Mautic |
| **Support** | SupportDashboard, TicketsManager, NotificationsCenter | ❌ 100% mocké | |
| **HR** | HRModule, TrainingsView + views Talents/Performance | ❌ Partiel mocké | |
| **Projects** | ProjectsModule, DeliverablesView, TimeTrackingView | ⚠️ Partiellement mocké | |
| **Settings** | SettingsDashboard, CompanySettings, UsersSettings, PermissionsSettings, IntegrationsSettings, ProductsList, ProductForm, TaxSettings, InvoiceSettings | ✅ Connecté Directus | |

**25 composants utilisent faker/Math.random au lieu de Directus** — priorité de connexion.

### 2. Client Portal — ✅ Production-ready
**Chemin** : `src/frontend/src/portals/client/`
14 fichiers, authentification JWT fonctionnelle.

| Composant | Fonction |
|-----------|----------|
| LoginPage | Connexion client |
| ActivationPage | Activation première connexion |
| ResetPasswordPage | Réinitialisation mot de passe |
| ClientPortalDashboard | Tableau de bord client |
| QuoteViewer | Consultation des devis |
| InvoicesList | Liste des factures |
| PaymentHistory | Historique paiements |
| ProjectTimeline | Timeline du projet |
| SignatureEmbed | Signature DocuSeal intégrée |
| ClientAuthContext | Context d'authentification React |

### 3. Prestataire Portal — 🟡 Mockup
**Chemin** : `src/frontend/src/portals/prestataire/Dashboard.jsx`
Un seul fichier avec données hardcodées (missions, heures, revenus). À développer.

### 4. Revendeur Portal — 🟡 Mockup
**Chemin** : `src/frontend/src/portals/revendeur/Dashboard.jsx`
Un seul fichier avec données hardcodées (ventes, produits, clients). À développer.

---

## 🗄️ DIRECTUS — 83 Collections

### Collections principales peuplées
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

### Collections vides (à peupler)
`campaigns`, `leads`, `opportunities`, `contracts` (travail), `salaries`, `leaves`, `trainings`, `newsletters`, `emails`

### Relations clés
Toutes les collections métier ont une relation `owner_company` → `owner_companies` pour le filtrage multi-entreprise.
Voir `docs/directus-collections.md` et `docs/COMPLETE_COLLECTIONS_MAPPING.md` pour le mapping complet.

---

## ⚡ BACKEND API — Routes Express

**Port** : 3000
**Base** : `src/backend/server.js`

```
/api/auth          → JWT authentication
/api/finance       → 80+ endpoints finance (partiellement implémentés)
/api/commercial    → Workflow complet Lead→Quote→CGV→Signature→Acompte→Projet
/api/collection    → Recouvrement de créances
/api/legal         → Juridique / CGV
/api/invoice-ninja → Sync Invoice Ninja
/api/revolut       → Sync bancaire Revolut (5 comptes)
/api/erpnext       → Comptabilité ERPNext
/api/mautic        → Marketing automation

/admin    → Proxy vers Directus admin (port 8055)
/items    → Proxy vers Directus API
/auth     → Proxy vers Directus auth
/graphql  → Proxy vers Directus GraphQL
```

### Workflow commercial complet
```
Lead → Quote (devis) → CGV (conditions générales) → Signature (DocuSeal) → Acompte (paiement) → Projet
```
Implémenté dans `src/backend/services/commercial/` (7 services).

### Moteur comptable suisse
`src/backend/modules/accounting/` — Conforme droit suisse :
- Plan comptable PME selon norme Käfer
- TVA 2025 avec codes AFC
- QR-Factures (QR-Invoice)
- Formulaire 200 AFC
- Export comptable

---

## 🔧 INTÉGRATIONS EXTERNES

| Service | Usage | Config |
|---------|-------|--------|
| **Directus 11.10** | CMS / Data layer | Docker, port 8055, PostgreSQL |
| **Invoice Ninja** | Facturation | API token dans .env |
| **Revolut** | Banking (5 comptes) | OAuth2, clés privées par entreprise |
| **Mautic** | Marketing automation | API dans .env |
| **ERPNext** | Comptabilité | API dans .env |
| **DocuSeal** | Signatures électroniques | Embedded dans portails |
| **Cloudinary** | Stockage médias | API keys dans .env |
| **OpenAI** | OCR / AI features | API key dans .env |
| **Notion** | Sync projets/prestataires | Token + DB IDs dans .env |

---

## 🛠️ DÉVELOPPEMENT

### Démarrage
```bash
# Infrastructure
docker-compose up -d          # Directus + PostgreSQL

# Backend API
cd src/backend && node server.js   # Port 3000

# Frontend React
cd src/frontend && pnpm dev        # Port 5173 (Vite)
```

### Stack frontend
- **React 18** + **Vite 6**
- **React Router 6** — Routing SPA
- **TanStack Query** (React Query) — Data fetching & cache
- **Zustand** — State management léger
- **Tailwind CSS** — Styling utility-first
- **Recharts** — Graphiques
- **React Hot Toast** — Notifications
- **Design** : Glassmorphism (backdrop-blur, transparences)

### Conventions
- `selectedCompany` prop globale pour filtrage multi-entreprise
- Chaque module a : `Dashboard.jsx`, `components/`, `hooks/`, `services/`, `index.js`
- API Directus via `src/frontend/src/api/directus.js`
- Hooks custom : `useDirectusQuery`, `useCompanies`, `useFinances`, `useProjects`, `usePeople`

---

## 🎯 PRIORITÉS DE DÉVELOPPEMENT

### Phase 1 — Connecter les mockups (priorité)
25 composants utilisent des données faker/random. Les connecter à Directus :
1. **Marketing** (4 composants) → Intégrer iframe Mautic
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

---

## ⚠️ RÈGLES IMPORTANTES

1. **Ne jamais inventer de données HYPERVISUAL/HMF** (dates, clients, prix) sans vérification
2. **Backup avant modification majeure** — Référence : `REFERENCE_DESKTOP_20251216_TESTED.sql`
3. **Toujours filtrer par owner_company** dans les requêtes Directus
4. **Les portails prestataire et revendeur sont des mockups** — ne pas les traiter comme production-ready
5. **Le moteur comptable suisse est fonctionnel** — ne pas le modifier sans comprendre les normes AFC/TVA
6. **Docker doit tourner** pour accéder à Directus (port 8055)
