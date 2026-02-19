# AUDIT-REPO.md — Audit complet du repository

> **Date** : 2026-02-19
> **Auditeur** : Claude Code (Opus 4)
> **Repo** : directus-unified-platform
> **Methode** : Scan recursif complet (excl. node_modules, .git)

---

## RESUME EXECUTIF

| Metrique | Valeur |
|----------|--------|
| **Fichiers totaux** | 2,913 |
| **Collections Directus** | 83 actives |
| **Relations Directus** | 100/105 |
| **Endpoints backend** | 155+ |
| **Composants frontend** | 195 fichiers (JSX/JS/CSS) |
| **Composants mockes** | 20 (faker/hardcoded) |
| **Composants connectes Directus** | ~70% |
| **Integrations configurees** | 6/9 |
| **Hooks custom** | 18 (11 module + 7 globaux) |
| **Zustand stores** | 2 (fonctionnels) |
| **Tests** | 1 fichier (couverture critique) |
| **Score sante global** | 62/100 |

---

## 1. STRUCTURE DES FICHIERS

### 1.1 Arborescence principale

```
directus-unified-platform/
├── src/
│   ├── backend/           237 fichiers — API Express (port 3000)
│   │   ├── api/           73 fichiers routes
│   │   ├── services/      25 fichiers services
│   │   ├── modules/       12 fichiers (comptabilite suisse)
│   │   ├── middleware/    auth + company access
│   │   ├── hooks/         commercial workflow hooks
│   │   ├── migrations/    8 scripts migration
│   │   └── scripts/       14 scripts utilitaires
│   └── frontend/          195 fichiers — React 18 + Vite 6
│       └── src/
│           ├── api/       config Directus + hooks
│           ├── hooks/     hooks globaux (7)
│           ├── components/ UI + charts (18 fichiers)
│           ├── stores/    Zustand (2 stores)
│           ├── styles/    design-system + glassmorphism
│           └── portals/
│               ├── superadmin/  56 JSX — 10 modules
│               ├── client/      13 JSX — production-ready
│               ├── prestataire/ 1 JSX — mockup
│               └── revendeur/   1 JSX — mockup
├── integrations/          5 dossiers (revolut, invoice-ninja, mautic, erpnext, twenty)
├── directus/
│   └── extensions/        2 extensions (kpi-dashboard, cache)
├── docs/                  75+ fichiers documentation
├── tools/                 5 sous-dossiers (migration, cleanup, monitoring, testing, validation)
├── scripts/               25 sous-dossiers utilitaires
└── [fichiers racine]      ~30 fichiers config + docs
```

### 1.2 Inventaire par categorie

| Categorie | Fichiers | Taille | Statut |
|-----------|----------|--------|--------|
| Backend (src/backend) | 237 | ~120 KB code | Actif |
| Frontend (src/frontend) | 195 | ~180 KB code | Actif |
| Integrations | 45 | ~60 KB | Mixte |
| Directus extensions | 2 | ~5 KB | Actif |
| Documentation (docs/) | 75+ | ~500 KB | A trier |
| Scripts/Tools | 150+ | ~200 KB | Legacy mixte |
| Fichiers racine (.md) | 24 | ~250 KB | A nettoyer |

---

## 2. FICHIERS ACTIFS (a conserver)

### 2.1 Backend — Fichiers critiques

| Fichier | Lignes | Fonction | Connecte |
|---------|--------|----------|----------|
| `src/backend/server.js` | ~400 | Point d'entree, routes, proxy | Directus |
| `src/backend/api/finance/finance.routes.js` | 1,774 | 77 endpoints finance | Directus |
| `src/backend/api/commercial/` (6 fichiers) | ~1,200 | 28 endpoints workflow | Directus |
| `src/backend/api/collection/collection.routes.js` | 300 | 25 endpoints recouvrement | Directus |
| `src/backend/api/legal/legal.routes.js` | 234 | 18 endpoints juridique | Directus |
| `src/backend/api/auth/auth.routes.js` | 661 | 15 endpoints auth | JWT |
| `src/backend/services/finance/` (6 fichiers) | 5,346 | Services finance complets | Directus |
| `src/backend/services/commercial/` (7 fichiers) | 2,900 | Workflow Lead→Projet | Directus |
| `src/backend/services/collection/` (5 fichiers) | 1,824 | Recouvrement complet | Directus |
| `src/backend/services/integrations/` (3 fichiers) | 1,508 | IN, Mautic, DocuSeal | APIs |
| `src/backend/services/legal/` (2 fichiers) | 1,119 | CGV + Signatures | Directus |
| `src/backend/modules/accounting/` (12 fichiers) | ~2,000 | Moteur comptable suisse | Conforme |
| `src/backend/middleware/auth.middleware.js` | ~200 | JWT + API Key auth | JWT |

### 2.2 Frontend — Fichiers critiques

| Module | Fichiers | Connecte Directus | Statut |
|--------|----------|-------------------|--------|
| Collection (superadmin) | 12 | 100% | Production |
| Settings (superadmin) | 12 | 100% | Production |
| CRM (superadmin) | 11 | ~60% | Partiel |
| Finance (superadmin) | 10 | ~80% | 2 mockes |
| Leads (superadmin) | 5 | 100% | Production |
| Legal (superadmin) | 12 | ~60% | 2 mockes |
| Marketing (superadmin) | 5 | 0% | 100% mocke |
| Support (superadmin) | 3 | 0% | 100% mocke |
| HR (superadmin) | 5 | ~40% | Partiel |
| Projects (superadmin) | 3 | ~30% | Partiel |
| Client Portal | 13 | 100% | Production-ready |

### 2.3 Integrations — Etat reel

| Integration | Dossier | Fichiers | Implementation | Pret prod |
|-------------|---------|----------|----------------|-----------|
| Invoice Ninja v5 | `/integrations/invoice-ninja/` | 4 | Sync bidirectionnelle, webhooks, status mapping | Oui |
| Revolut Business | `/integrations/revolut/` | 3 | OAuth2 + JWT RS256, 5 comptes, auto-refresh | Oui |
| Mautic 5.x | `/integrations/mautic/` | 8+ | Docker setup complet, web install en attente | Partiel |
| ERPNext v15 | `/integrations/erpnext/` | 2 | Stub 45 lignes seulement | Non |
| Twenty CRM | `/integrations/twenty/` | 5 | Template MCP server optionnel | Non |
| DocuSeal | — | 0 | Aucun code backend | Non |
| Notion | — | 0 | .env configure, pas d'implementation | Non |
| Cloudinary | — | 0 | .env vide | Non |
| OpenAI Vision | `src/backend/services/` | 1 | OCR fonctionnel | Oui |

---

## 3. FICHIERS SUSPECTS

### 3.1 Credentials hardcodes (SECURITE)

| Fichier | Ligne | Probleme |
|---------|-------|----------|
| `src/backend/server.js` | ~29 | Token Directus en fallback |
| `src/backend/hooks/commercial/lead-hooks.js` | — | Token Directus hardcode |
| `src/backend/hooks/commercial/quote-hooks.js` | — | Token Directus hardcode |
| `src/backend/hooks/commercial/invoice-hooks.js` | — | Token Directus hardcode |
| `src/backend/api/mautic/router.js` | 16-17 | Username/password Mautic hardcodes |
| `src/backend/api/mautic/router.js` | 52, 133 | Token Directus alternatif hardcode |
| `src/frontend/src/api/directus.js` | 7 | Token API hardcode |
| `integrations/erpnext/erpnext-api-keys.json` | — | Cles API en JSON |

**Action** : Supprimer tous les fallback, exiger .env, rotation des tokens exposes.

### 3.2 Auth middleware bypass

| Fichier | Probleme |
|---------|----------|
| `src/backend/api/collection/collection.routes.js` L13-21 | `authMiddleware` = `next()` sans verification |
| `src/backend/api/collection/collection.routes.js` L13-21 | `companyAccessMiddleware` = `next()` sans verification |

### 3.3 Imports casses

| Fichier | Import | Statut |
|---------|--------|--------|
| `src/backend/api/erpnext/index.js` L11 | `../../../services/erpnext-api.js` | FICHIER MANQUANT |
| `src/backend/server.js` L322-328 | `./api/revolut/index.js` | FICHIER MANQUANT (silent fail) |

### 3.4 CORS trop permissif

| Fichier | Probleme |
|---------|----------|
| `src/backend/server.js` | `Access-Control-Allow-Origin: *` |

---

## 4. FICHIERS OBSOLETES (a archiver ou supprimer)

### 4.1 Racine — Markdown a deplacer dans docs/

| Fichier | Taille | Action |
|---------|--------|--------|
| `ANALYSE-WORKFLOWS-COMPLET.md` | 16 KB | → docs/reference/ |
| `PROMPT-CLAUDE-CODE-DASHBOARD-V5.md` | 69 KB | → docs/prompts/ |
| `PLAN-DASHBOARD-SUPERADMIN-COMPLET.md` | 12 KB | → docs/reference/ |
| `RAPPORT-*.md` (4 fichiers) | ~40 KB | → docs/audit/ |
| `CDC_HYPERVISUAL_Switzerland_Directus_Unified_Platform.md` | 67 KB | Doublon de docs/ |
| `audit_*.md` (9 fichiers) | 95 KB | Doublons des audits existants |

### 4.2 Dossiers legacy a supprimer

| Dossier | Taille | Raison |
|---------|--------|--------|
| `backend/legacy-api/` | 37 MB (node_modules) | Remplace par src/backend |
| `backend/ocr-service/` | ~5 MB | Integre dans src/backend |
| `.archive-local-docs-20251213/` | 18 MB (145 fichiers) | Archive obsolete |
| `STATUS/` | 42 fichiers | Remplace par PROGRESS.md |
| `QUICK/` | 5 fichiers | Obsolete |
| `audit-results/` | Multiple | Remplace par AUDIT-REPO.md |
| `.directus-template-cli/` | ~2 MB | Template setup termine |
| `mcp-docker-setup/` | ~1 MB | Setup MCP termine |

### 4.3 Fichiers isoles a traiter

| Fichier | Action | Raison |
|---------|--------|--------|
| `backup_before_finance_fix.sql` | Archiver | 10.1 MB, ne devrait pas etre a la racine |
| `.overnight-dev-log.txt` | Supprimer | Log temporaire |
| `package-lock.json` (racine) | Supprimer | Doublon de pnpm-lock.yaml |

---

## 5. DOUBLONS DETECTES

| Fichier | Occurrences | Localisation |
|---------|-------------|--------------|
| `.DS_Store` | 23 | Partout — a .gitignore |
| `package.json` | 5 | root, frontend, legacy-api, ocr-service, .mcp |
| `server.js` | 2+ | src/backend, backend/legacy-api |
| `auth.js` | 2 | + fichier .backup |
| `add-owner-company.sql` | 4+ | tools/migration, scripts/migration |
| `README.md` | 5+ | root, integrations/*, docs/ |

---

## 6. REPERTOIRES VIDES

| Repertoire | Action |
|------------|--------|
| `/database` | Supprimer ou .gitkeep |
| `/uploads/invoices` | Supprimer ou .gitkeep |
| `/extensions` | Supprimer (doublon de directus/extensions) |
| `/integrations/revolut/keys` | .gitkeep (necessite les cles privees) |
| `/packages/ui/dist/chunks` | Supprimer (build artifact) |
| `/src/backend/uploads/invoices` | .gitkeep |
| `/src/backend/services/finance/uploads/invoices` | Supprimer (doublon) |

---

## 7. ETAT DES INTEGRATIONS

### 7.1 Invoice Ninja v5 — OPERATIONNEL

- **Sync bidirectionnelle** : Directus ↔ Invoice Ninja (statuts, factures, clients)
- **Webhook handler** : 230 lignes, gestion des evenements
- **Mapping statuts** : draft→1, pending→2, sent→2, paid→4, overdue→-1, cancelled→5
- **Auth** : X-API-TOKEN
- **Config** : INVOICE_NINJA_URL=localhost:8082 (token de test)

### 7.2 Revolut Business API v2 — OPERATIONNEL

- **OAuth2 + JWT RS256** : Token auto-refresh (40 min expiration)
- **5 comptes** : HYPERVISUAL, Dynamics, Lexia, NK Reality, Etekout
- **Sync** : bank_transactions collection, intervalle 60s configurable
- **Webhook** : Configure (REVOLUT_WEBHOOK_URL)
- **Mode** : Sandbox (REVOLUT_ENV=sandbox)

### 7.3 Mautic 5.x — PARTIEL

- **Docker** : Compose complet (mautic-app + MariaDB + cron)
- **Installation web** : EN ATTENTE (port 8084)
- **Backend routes** : 7 endpoints (credentials hardcodes)
- **n8n workflows** : Templates prepares dans le dossier

### 7.4 ERPNext v15 — STUB SEULEMENT

- **Code** : 45 lignes (migration script placeholder)
- **Service backend** : FICHIER MANQUANT (`erpnext-api.js`)
- **Import casse** dans `src/backend/api/erpnext/index.js`
- **Config .env** : Non presente

### 7.5 DocuSeal — NON IMPLEMENTE

- Reference dans CLAUDE.md et dans les composants frontend
- `SignatureEmbed.jsx` existe dans le portail client
- Aucun code backend d'integration
- Service backend existe : `src/backend/services/integrations/docuseal.service.js`

### 7.6 Notion — CONFIG SEULEMENT

- .env configure (NOTION_TOKEN + 4 DB IDs)
- Aucun fichier d'implementation
- Usage prevu : sync projets/prestataires/livrables/tickets

---

## 8. ETAT DU FRONTEND

### 8.1 Composants 100% mockes (priorite connexion)

| Composant | Module | Donnees | Lignes |
|-----------|--------|---------|--------|
| `MarketingDashboard.jsx` | Marketing | emailsSent, openRate mock | 80 |
| `CampaignsList.jsx` | Marketing | Campagnes hardcodees | ~150 |
| `ContentCalendar.jsx` | Marketing | Evenements mock | ~120 |
| `EventsManager.jsx` | Marketing | Evenements mock | ~100 |
| `MarketingAnalytics.jsx` | Marketing | Analytics mock | ~130 |
| `SupportDashboard.jsx` | Support | Tickets mock | 130 |
| `TicketsManager.jsx` | Support | Tickets/priorites mock | ~150 |
| `NotificationsCenter.jsx` | Support | Notifications mock | ~100 |
| `BudgetsManager.jsx` | Finance | 5 budgets hardcodes | 150 |
| `ExpensesTracker.jsx` | Finance | Categories mock | 150 |
| `PipelineView.jsx` | CRM | 8 deals hardcodes | 120 |
| `CustomerSuccess.jsx` | CRM | Donnees mock | ~100 |
| `ComplianceManager.jsx` | Legal | RGPD/ISO mock | ~120 |
| `ContractsManager.jsx` | Legal | Contrats mock | ~100 |
| `TimeTrackingView.jsx` | Projects | Faker | ~100 |
| `DeliverablesView.jsx` | Projects | Faker | ~100 |
| `TalentsView.jsx` | HR | Faker | ~100 |
| `PerformanceView.jsx` | HR | Faker | ~100 |
| `TrainingsView.jsx` | HR | Faker | ~100 |
| `Dashboard.jsx` (prestataire) | Prestataire | Hardcode complet | 280 |
| `Dashboard.jsx` (revendeur) | Revendeur | Hardcode complet | 323 |

### 8.2 Hooks fonctionnels

| Hook | Type | Source |
|------|------|--------|
| `useDirectusQuery` | Global | TanStack Query + Directus |
| `useCompanies` | Global | owner_companies |
| `useFinances` | Global | Donnees financieres |
| `useProjects` | Global | Projets |
| `usePeople` | Global | Personnes/contacts |
| `useMetrics` | Global | KPIs |
| `useInitialize` | Global | Init app |
| `useCollectionData` | Module | Collection/recouvrement |
| `useCRMData` | Module | CRM |
| `useFinanceData` | Module | Finance dashboard |
| `useLegalData` | Module | Juridique |
| `useSettingsData` | Module | Parametres |
| `useLeads` | Module | Leads |

### 8.3 Design System

- **design-system.css** : Variables completes (couleurs, espacements, typographie, ombres)
- **glassmorphism.css** : Effets backdrop-blur pour TopBar, modales, cartes
- **Composants UI** : Button, Input, Select, Table, Badge, GlassCard
- **Charts Recharts** : 6 composants (CashFlow, Clients, Radar, Performance, Projects, Revenue)
- **Coherence** : Tailwind CSS + custom classes

---

## 9. DOCKER & INFRASTRUCTURE

### 9.1 Services Docker

| Service | Image | Port | Statut |
|---------|-------|------|--------|
| directus | directus/directus:11.10.0 | 8055 | Actif |
| postgres | postgres:15-alpine | 5432 | Actif |

### 9.2 Configuration cle

- **Redis** : localhost:6379, cache TTL 1h, auto-purge
- **Rate limiting** : 200 points/60s via Redis
- **CORS** : 4 origines dev (localhost:5173/5174/5175/3000)
- **DB Pool** : min=10, max=50
- **Query limits** : default=50, max=500

### 9.3 Variables d'environnement (.env)

**68 variables configurees** reparties en :
- Directus Core (6) | Database (10) | Cache/Redis (6)
- Rate Limiting (4) | CORS (7) | Dashboard (3)
- Invoice Ninja (3) | Revolut (15+) | Notion (6)
- OpenAI (5) | Cloudinary (3 — vide) | Environment (2)

---

## 10. PROBLEMES TODO/FIXME

**~100 TODO trouves dans le backend :**
- `lead-hooks.js` : 6 TODOs (sync Mautic, analytics, notifications)
- `quote-hooks.js` : 3 TODOs (email, webhooks, expiry)
- `invoice-hooks.js` : 2 TODOs (sync Invoice Ninja, audit logs)
- `scheduler.js` : 5 TODOs (expiry, reminders, reports)
- `collection.routes.js` : 2 TODOs (auth middleware, company access)
- `api/hooks.js` (frontend) : 9 TODOs (notifications API, KPI calculations)

---

## 11. RECOMMANDATIONS

### Priorite 1 — Securite (immediat)

1. **Supprimer tous les tokens hardcodes** dans 8 fichiers identifies
2. **Implementer auth middleware reel** dans collection.routes.js
3. **Restreindre CORS** (supprimer `Access-Control-Allow-Origin: *`)
4. **Rotation des tokens** exposes dans le code source
5. **Ajouter .gitignore** pour .DS_Store, backup_*.sql

### Priorite 2 — Nettoyage (cette session)

1. **Archiver les dossiers legacy** : backend/legacy-api, .archive-local-docs, STATUS/, QUICK/
2. **Deplacer les .md racine** vers docs/
3. **Supprimer les fichiers temporaires** : .overnight-dev-log.txt, package-lock.json root
4. **Supprimer les repertoires vides** ou ajouter .gitkeep

### Priorite 3 — Stabilite (Phase 0)

1. **Fixer l'import ERPNext casse** ou retirer le router
2. **Completer l'installation Mautic** (web wizard)
3. **Creer le service Revolut manquant** dans src/backend/api/
4. **Ajouter validation .env** au demarrage du serveur

### Priorite 4 — Connexion mockups (Phase 1)

1. Marketing (5 composants) → iframe Mautic
2. Support (3 composants) → collection support_tickets
3. Finance (2 composants) → collections budgets/expenses
4. CRM (2 composants) → collections opportunities/pipeline
5. Legal (2 composants) → collections contracts/compliance
6. HR (3 composants) → collections employees/trainings
7. Projects (2 composants) → collections deliverables/time_tracking

---

## 12. SCORE DE SANTE

| Critere | Score | Details |
|---------|-------|---------|
| Architecture | 8/10 | Bien structuree (src/backend + src/frontend), quelques legacy |
| Securite | 4/10 | Tokens hardcodes, auth bypass, CORS permissif |
| Couverture donnees | 7/10 | 70% connecte Directus, 20 composants mockes |
| Integrations | 6/10 | 2/6 production-ready, 1 partiel, 3 non implementees |
| Tests | 1/10 | 1 seul fichier de test |
| Documentation | 7/10 | Extensive mais dispersee |
| Dette technique | 5/10 | ~100 TODOs, 3 imports casses, doublons |
| Infrastructure | 8/10 | Docker + Redis + Rate limiting configures |
| Design system | 8/10 | Coherent, variables CSS, composants UI |
| Build/DX | 8/10 | Vite 6, TanStack Query, Zustand, pnpm |

**Score global : 62/100**

---

## 13. METRIQUES DE NETTOYAGE PREVU

| Action | Fichiers | Taille estimee |
|--------|----------|----------------|
| Archiver backend/legacy-api | ~500 | 37 MB |
| Supprimer .archive-local-docs | 145 | 18 MB |
| Supprimer STATUS/ | 42 | ~200 KB |
| Supprimer QUICK/ | 5 | ~50 KB |
| Deplacer .md racine | 15 | ~250 KB |
| Supprimer .DS_Store | 23 | ~92 KB |
| Archiver backup SQL | 1 | 10.1 MB |
| **Total** | **~730** | **~65 MB** |

---

*Genere le 2026-02-19 par Claude Code — Story S-00-01*
