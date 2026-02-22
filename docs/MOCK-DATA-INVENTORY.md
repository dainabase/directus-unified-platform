# Mock Data Inventory — Phase A.6
> Audit realise le 2026-02-22
> Objectif : identifier toutes les donnees mock/statiques a connecter en Phase B

---

## P0 — Fichiers avec mock data explicite (a connecter en priorite)

| # | Fichier | Variables mock | Type |
|---|---------|----------------|------|
| 1 | `src/frontend/src/services/mockKPIData.js` | `generateMockKPIData`, `mockAPI` | Service complet mock KPI |
| 2 | `src/frontend/src/api/directus.js:239` | `mockDataGenerator` | Generateur mock dans API client |
| 3 | `src/frontend/src/api/hooks.js:18-19` | imports `mockDataGenerator` | Hook utilisant mock au lieu d'API |
| 4 | `src/frontend/src/services/hooks/usePeople.js:4` | `mockPeople` | Array statique 100% mock |
| 5 | `src/frontend/src/modules/projects/views/DeliverablesView.jsx:10,83` | `mockDeliverables`, `mockTasks` | 2 arrays statiques |
| 6 | `src/frontend/src/modules/projects/views/TimeTrackingView.jsx:13,71,81` | `mockTimeEntries`, `mockWeeklyData`, `mockProjectDistribution` | 3 arrays statiques |
| 7 | `src/frontend/src/portals/superadmin/marketing/components/CampaignsList.jsx:9` | `mockCampaigns` | Array statique |
| 8 | `src/frontend/src/portals/superadmin/marketing/components/EventsManager.jsx:9` | `mockEvents` | Array statique |
| 9 | `src/frontend/src/portals/superadmin/support/components/TicketsManager.jsx:10` | `mockTickets` | Array statique |

## P1 — Fichiers avec donnees statiques inline

| # | Fichier | Variables | Description |
|---|---------|-----------|-------------|
| 10 | `portals/revendeur/Dashboard.jsx:9,19,26,34` | `salesData`, `productsData`, `clientsData`, `topClients` | Dashboard entier mock |
| 11 | `portals/superadmin/legal/components/LegalStats.jsx:29,38` | `monthlyAcceptances`, `complianceData` | Graphiques avec donnees inventees |
| 12 | `portals/superadmin/collection/components/LPCases.jsx:6` | `cases` | Cas poursuites statiques |
| 13 | `portals/superadmin/collection/components/CollectionStats.jsx:41` | `lpStepsData` | Etapes LP statiques |
| 14 | `portals/superadmin/collection/components/WorkflowTimeline.jsx:6` | `steps` | Dates hardcodees |
| 15 | `portals/superadmin/collection/components/WorkflowConfig.jsx:6` | `steps` | Config statique |
| 16 | `portals/superadmin/crm/components/QuickStats.jsx:17` | `activityData` | Graphique activite statique |

## Modules entiers sans connexion API

| Module | Fichiers | Statut |
|--------|----------|--------|
| `modules/projects/` | ProjectsModule, ListView, GridView, KanbanView, TimelineView, DeliverablesView, TimeTrackingView | Aucun useQuery/useMutation — 100% props ou mock |
| `modules/hr/` | HRModule, TeamView, TrainingsView, PerformanceView, RecruitmentView, TalentsView | Quasi-aucune API (4/5 sans hook API) |

## Donnees statiques ACCEPTABLES (pas du mock — config UI)

- `PORTALS`, `NAV_ITEMS`, `TABS`, `STATUS_FILTERS`, `PRIORITY_FILTERS` — config UI navigation
- `CANTONS_CH`, `MONTH_LABELS`, `CHART_COLORS` — reference data
- `VAT_RATES` (8.1/2.6/3.8) — config UI correcte
- `KAFER_ACCOUNTS` — reference comptable Swiss PME Kafer
- `FORBIDDEN_CLAUSES` — reference legale CO suisse
- `COMPANIES` hardcoded UUIDs — a migrer vers API en Phase G (multi-company dynamic)

## Resume

| Categorie | Count |
|-----------|-------|
| Fichiers P0 (mock explicite) | 9 |
| Fichiers P1 (donnees statiques inline) | 7 |
| Modules entiers sans API | 2 (projects/, hr/) |
| Import @faker-js dans src/ | 0 |
| **Total fichiers a traiter Phase B** | **16+** |
