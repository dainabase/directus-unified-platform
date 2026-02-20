# Directus Unified Platform — Multi-Portal Business Management

> **Projet** : Plateforme de gestion multi-entreprises (ERP/CRM/Finance/RH/Legal)
> **Proprietaire** : Jean-Marie Delaunay — HMF Corporation SA, Fribourg, Suisse
> **Stack** : Directus 11.10 + PostgreSQL 15 + Redis 7 + Express API + React 18 (Vite 6)
> **Repo** : 1,600+ commits · 83 collections Directus · 100/105 relations
> **Derniere mise a jour** : Fevrier 2026

## Tech Stack
- Backend: Directus 11.10 (headless CMS), PostgreSQL 15, Redis 7, Node.js 18+, Express API (port 3000)
- Frontend: React 18, Vite 6, Tailwind CSS, Recharts, React Router v6
- State: Zustand (client) + TanStack Query (server/API)
- Forms: React Hook Form + Zod
- Integrations: Invoice Ninja v5, Revolut Business API v2, ERPNext v15, Mautic 5.x, DocuSeal, OpenAI Vision
- Docker Compose pour tous les services
- **Design : Apple Premium Monochromatic** — couleurs neutres (zinc/slate/white), couleurs sémantiques UNIQUEMENT pour les statuts (success/warning/danger/info), typographie SF Pro / Inter, espacement généreux, micro-interactions subtiles. Inspiration : Apple, Linear, Vercel. JAMAIS de glassmorphism, JAMAIS de gradients décoratifs.

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

---

## ⚠️ REGLE DE SECURITE — BLOCAGE SI NON RESPECTE

> Si le prompt recu ne mentionne pas de skills a lire, Claude Code DOIT :
> 1. NE PAS commencer a coder
> 2. Repondre : "Aucun skill specifie dans le prompt. Je lance le skill-router pour identifier les meilleurs outils avant de commencer."
> 3. Executer le skill-router (voir ci-dessous)
> 4. Proposer une liste de skills et attendre confirmation
>
> Cette regle protege la qualite du code. Elle n'est JAMAIS sautee.

---

## PROTOCOLE OBLIGATOIRE — A EXECUTER AVANT CHAQUE TACHE

> Ce protocol s'applique SANS EXCEPTION a chaque story, chaque composant, chaque feature.
> Il n'est jamais saute, meme pour une "petite" modification.

### 🔴 ETAPE 0a BLOQUANT — Générer et lire l'index complet des skills

**Cette étape est OBLIGATOIRE avant toute autre action. Sans elle, Claude Code n'a accès qu'aux skills qu'il "connaît déjà" — les 939 skills restants sont invisibles.**

```bash
# TOUJOURS exécuter en premier
bash scripts/generate-skills-index.sh
```

Ce script :
1. Scanne `~/.claude/skills-repos/` (939+ skills spécialisés)
2. Scanne `.claude/skills/` (8 skills projet HYPERVISUAL)
3. Met à jour `SKILLS-INDEX.md` avec les chemins réels
4. Affiche le compte total

**Après exécution du script :**
1. Lire `SKILLS-INDEX.md` EN ENTIER (toutes les catégories)
2. Identifier les 3-6 skills les plus pertinents pour CETTE tâche précise
3. Lire leurs fichiers `SKILL.md` complets
4. **SEULEMENT ALORS** commencer à coder

> ⚠️ Si le script échoue (répertoire absent, permissions) :
> - Lire `SKILLS-INDEX.md` statique comme fallback
> - Consulter `SKILLS-MAPPING.md` pour les combinaisons pré-sélectionnées par story
> - NE PAS ignorer cette étape — continuer sans skills = code de qualité médiocre

---

### ETAPE 0b — Lire la roadmap et confirmer la story

**0b-1. Roadmap :**
1. Lire `ROADMAP.md` → identifier la story en cours
2. Lire `SKILLS-MAPPING.md` → combinaisons pre-selectionnees par story

**0b-2. Skill-router (verification supplementaire) :**
1. Lire `.claude/skills/skill-router/SKILL.md`
2. Lire `.claude/skills/skill-router/references/REGISTRY.md`
3. Identifier les categories pertinentes pour cette tache (Frontend ? API ? Database ? Security ?)
4. Lire `references/categories/<categorie>.md` pour chaque categorie pertinente
5. Choisir les 2-4 skills les plus adaptes avec leurs chemins complets
→ Ce processus garantit que les 939 skills sont consideres, pas seulement les 3-4 connus.

---

### ETAPE 1 — Lire les skills (OBLIGATOIRE — minimum 2 skills)

**1a. Skill projet (toujours en premier) :**
Selon le type de tache, lire dans `.claude/skills/` :
- Directus : `.claude/skills/directus-api-patterns/SKILL.md`
- Swiss/Finance : `.claude/skills/swiss-compliance-engine/SKILL.md`
- Portails : `.claude/skills/multi-portal-architecture/SKILL.md`
- Dashboard CEO : `.claude/skills/ceo-dashboard-designer/SKILL.md`
- PostgreSQL : `.claude/skills/postgresql-directus-optimizer/SKILL.md`
- Integrations : `.claude/skills/integration-sync-engine/SKILL.md`

**1b. Skills specialises UI/UX (OBLIGATOIRE pour tout composant visuel) :**
Racine : `/Users/jean-marieddelaunay/.claude/skills-repos/`

⚠️ **DESIGN SYSTEM APPLE PREMIUM — STACK UI OBLIGATOIRE** ⚠️

Pour tout composant React avec UI (SANS EXCEPTION) :
```
# 1. QUALITE VISUELLE EXCEPTIONNELLE (toujours en premier)
~/.claude/skills-repos/anthropics-skills/skills/frontend-design/SKILL.md

# 2. DESIGN SYSTEM & TOKENS (couleurs, spacing, typographie)
~/.claude/skills-repos/alirezarezvani-claude-skills/product-team/ui-design-system/SKILL.md

# 3. REACT 18 PATTERNS (hooks, performance, composition)
~/.claude/skills-repos/jeffallan-claude-skills/skills/react-expert/SKILL.md

# 4. COMPOSANTS STRUCTURES (architecture propre)
~/.claude/skills-repos/claude-code-plugins-plus-skills/skills/05-frontend-dev/react-component-generator/SKILL.md
```

Selon le type de composant, ajouter :
```
# Dashboard/KPIs/Charts
~/.claude/skills-repos/anthropics-skills/skills/frontend-design/SKILL.md  # deja inclus
.claude/skills/ceo-dashboard-designer/SKILL.md

# Formulaires complexes (QuoteForm, InvoiceGenerator)
~/.claude/skills-repos/awesome-claude-code-toolkit/skills/react-patterns/SKILL.md

# Hooks custom (useQuote, useInvoice, useActivation)
~/.claude/skills-repos/claude-code-plugins-plus-skills/skills/05-frontend-dev/react-hook-creator/SKILL.md

# Tailwind optimise
~/.claude/skills-repos/claude-code-plugins-plus-skills/skills/05-frontend-dev/tailwind-class-optimizer/SKILL.md

# Responsive design et breakpoints
~/.claude/skills-repos/claude-code-plugins-plus-skills/skills/05-frontend-dev/responsive-breakpoint-analyzer/SKILL.md

# Design system complet (tokens, theming)
~/.claude/skills-repos/jezweb-claude-skills/skills/tailwind-theme-builder/SKILL.md

# Methodologie design web (BEM, accessibilite, dark mode)
~/.claude/skills-repos/jezweb-claude-skills/skills/web-design-methodology/SKILL.md

# shadcn/ui si utilise
~/.claude/skills-repos/jezweb-claude-skills/skills/shadcn-ui/SKILL.md

# Fullstack (feature complete frontend + backend)
~/.claude/skills-repos/jeffallan-claude-skills/skills/fullstack-guardian/SKILL.md
```

**1c. Verifier les champs Directus via MCP avant de coder :**
JAMAIS supposer un nom de champ — toujours `directus:get_collection_items(collection, limit=1)`.

> ⚠️ **SI MCP Directus retourne 401** : utiliser curl avec le static token admin.
> Ne JAMAIS bloquer sur ce probleme — passer directement au fallback :
> ```bash
> # Lister les champs d'une collection
> curl -s "http://localhost:8055/items/COLLECTION?limit=1" \
>    -H "Authorization: Bearer hypervisual-admin-static-token-2026"
>
> # Creer un champ
> curl -s -X POST "http://localhost:8055/fields/COLLECTION" \
>    -H "Authorization: Bearer hypervisual-admin-static-token-2026" \
>    -H "Content-Type: application/json" \
>    -d '{"field":"nom_champ","type":"string"}'
> ```
> Le token statique est valide pour jmd@hypervisual.ch (admin).

### ETAPE FINALE — Mettre a jour ROADMAP.md (OBLIGATOIRE apres chaque story)
1. Passer la story `[ ]` → `[V]` avec date YYYY-MM-DD
2. Logger toute decouverte dans section DECOUVERTES
3. Commit : `feat(X-XX): description courte`

## Tool Discovery — Ressources
- **6 MCP Servers** : PostgreSQL, Directus, ESLint, Playwright, Context7, Sequential Thinking
- **8 Custom Skills projet** : `.claude/skills/`
- **939 Skills specialises** : `/Users/jean-marieddelaunay/.claude/skills-repos/`
- **Index complet** : `SKILLS-INDEX.md` (regénérer avec `bash scripts/generate-skills-index.sh`)
- **Mapping complet** : `SKILLS-MAPPING.md` (combinaisons recommandees par story)

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
- NEVER use glassmorphism, gradients decoratifs, ou couleurs non-semantiques
- TOUJOURS lire les skills UI avant de coder un composant visuel

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
|---|------------|---------|
| 1 | HYPERVISUAL | Digital signage / LED / Totems / Hologrammes |
| 2 | DAINAMICS | Technologie / SaaS |
| 3 | LEXAIA | Services juridiques |
| 4 | ENKI REALTY | Immobilier |
| 5 | TAKEOUT | Food tech |

Toutes les donnees sont filtrees par `owner_company` via un selecteur global dans le TopBar.

---

## Structure des fichiers

```
directus-unified-platform/
├── CLAUDE.md                               → CE FICHIER
├── .mcp.json                               → MCP servers config (postgres, directus, eslint)
├── docker-compose.yml                      → Directus 11.10 + PostgreSQL
├── .env                                    → Config (JAMAIS commiter)
├── package.json                            → pnpm monorepo
│
├── .claude/skills/                         → 8 custom skills Claude Code
│
├── src/
│   ├── backend/                            → Express API (port 3000)
│   │   ├── server.js                       → Point d'entree, routes, proxy Directus
│   │   ├── api/
│   │   │   ├── auth/                       → JWT authentication middleware
│   │   │   ├── finance/                    → 80+ endpoints finance
│   │   │   ├── commercial/                 → Workflow Lead→Quote→CGV→Signature→Acompte→Projet
│   │   │   ├── collection/                 → Recouvrement de creances
│   │   │   ├── legal/                      → Juridique / CGV
│   │   │   ├── invoice-ninja/              → Sync facturation
│   │   │   ├── revolut/                    → Sync bancaire (5 comptes)
│   │   │   ├── mautic/                     → Marketing automation
│   │   │   └── erpnext/                    → Comptabilite
│   │   ├── services/
│   │   │   ├── commercial/                 → 7 services (workflow, quotes, cgv, signatures, deposits...)
│   │   │   ├── finance/                    → 6 services
│   │   │   ├── collection/                 → 5 services (recouvrement)
│   │   │   ├── legal/                      → 2 services
│   │   │   └── integrations/              → 3 services
│   │   └── modules/
│   │       └── accounting/                 → Moteur comptable suisse
│   │           ├── core/                   → Plan comptable PME (Kafer)
│   │           ├── swiss-compliance/       → TVA 2025, codes AFC, Form 200
│   │           ├── services/               → QR-Invoice, export handlers
│   │           └── browser/               → Version navigateur
│   │
│   └── frontend/
│       ├── vite.config.js
│       ├── package.json                    → React 18, Vite 6, TanStack Query, Zustand, Tailwind
│       └── src/
│           ├── App.jsx                     → ~50 routes, layout avec Sidebar + TopBar
│           ├── main.jsx                    → Entry point React
│           ├── api/                        → API layer (config.js, directus.js)
│           ├── hooks/                      → useDirectusQuery, useCompanies, useFinances, useProjects, usePeople
│           ├── components/
│           │   ├── layout/                 → Sidebar.jsx, TopBar.jsx
│           │   ├── ui/                     → Badge, Button, GlassCard, Input, Select, Table
│           │   └── banking/               → BankingDashboard.jsx
│           ├── services/                   → API services partages
│           ├── stores/                     → Zustand stores
│           ├── utils/                      → Helpers, formatters
│           ├── styles/                     → design-system.css, apple-premium.css
│           └── portals/
│                   ├── superadmin/         → PORTAIL PRINCIPAL
│                   ├── client/             → PRODUCTION-READY (14 fichiers)
│                   ├── prestataire/        → Fonctionnel (Phase D)
│                   └── revendeur/          → Mockup (1 fichier)
│
├── directus/extensions/                    → Custom Directus extensions
├── integrations/                           → External API sync modules
├── docs/                                   → Documentation technique extensive
├── tools/migration/                        → Scripts migration Directus
└── scripts/                                → Scripts utilitaires
    └── generate-skills-index.sh           → 🔴 SCRIPT BLOQUANT — regenere SKILLS-INDEX.md
```

---

## Les 4 Portails

### 1. Superadmin (React) — Portail principal
**Chemin** : `src/frontend/src/portals/superadmin/`
**Acces** : `http://localhost:5173/superadmin`

10 modules avec routing unifie dans App.jsx :

| Module | Composants | Etat donnees | Notes |
|--------|-----------|--------------|-------|
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

### 3. Prestataire Portal — Fonctionnel (Phase D)
**Chemin** : `src/frontend/src/portals/prestataire/`
Auth magic link, dashboard connecte Directus, gestion devis/commandes/factures.

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
/api/auth        → JWT authentication
/api/finance     → 80+ endpoints finance (partiellement implementes)
/api/commercial  → Workflow complet Lead→Quote→CGV→Signature→Acompte→Projet
/api/collection  → Recouvrement de creances
/api/legal       → Juridique / CGV
/api/invoice-ninja → Sync Invoice Ninja
/api/revolut     → Sync bancaire Revolut (5 comptes)
/api/erpnext     → Comptabilite ERPNext
/api/mautic      → Marketing automation

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

## Phases restantes (ROADMAP v2.0)

| Phase | Objectif | Stories |
|-------|---------|---------|
| **1** | Design System Apple Premium Monochromatic | 0/9 — PRIORITE ABSOLUE |
| **2** | Connexion donnees reelles React ↔ Directus | 0/12 |
| **3** | Finance complete (tous modules) | 0/14 |
| **4** | Portail Prestataire complet | 0/9 |
| **5** | Portail Revendeur complet | 0/8 |
| **6** | Portail Client complet | 0/9 |
| **7** | Automation & IA | 0/12 |
| **8** | Qualite & Production | 0/9 |
| **9** | Multi-entreprises post-V1 | 0/6 |

**Voir ROADMAP.md pour le detail complet de chaque story.**
