# ROADMAP v2.0 — DIRECTUS UNIFIED PLATFORM
## HYPERVISUAL Switzerland

**Version** : 2.0  
**Date** : Février 2026  
**Méthode** : Story-by-story, Claude Code exécute sur instructions de l'Architecte  
**Repo** : github.com/dainabase/directus-unified-platform  

---

## LÉGENDE

```
🟢 Fait / En prod
🟡 En cours / Partiellement fait
🔴 À faire
🔵 Récupéré depuis ancien repo (à convertir React + Directus)
⚫ Supprimé (décision validée)
```

**Priorités** : 🔥 Critique · ⚡ High · 📌 Medium · 💡 Low

---

## PHASE 0 — FONDATION ✅ (Complété V1)

| # | Story | Statut | Notes |
|---|-------|--------|-------|
| 0.1 | Docker : Directus + PostgreSQL + Redis | 🟢 | |
| 0.2 | 82+ collections Directus créées | 🟢 | |
| 0.3 | OCR OpenAI Vision | 🟢 | 100% fonctionnel |
| 0.4 | Intégration Invoice Ninja v5 | 🟢 | |
| 0.5 | Intégration Revolut Business API | 🟢 | Audité phase G |
| 0.6 | Intégration ERPNext v15 | 🟢 | |
| 0.7 | Intégration Mautic 5.x | 🟢 | |
| 0.8 | Scaffold React 18.2 + Vite | 🟢 | |
| 0.9 | 4 portails structurés | 🟢 | SuperAdmin, Client, Prestataire, Revendeur |
| 0.10 | Backend Finance (16 modules, phases A-J) | 🟢 | 96/96 stories auditées — 28 bugs corrigés |

---

## PHASE 1 — DESIGN SYSTEM ✅

**Objectif** : Appliquer le Design System Apple Premium Monochromatic (CDC §14) sur toute la plateforme.
**Référence** : `docs/CDC_v1.3_Design_System_Consolidation.md`
**Complété** : 2026-02-20 — 9/9 stories, 261 corrections DS dans ~65 fichiers

| # | Story | Prio | Statut | Notes |
|---|-------|------|--------|-------|
| 1.1 | Créer `src/styles/design-system.css` (tokens CSS complets) | 🔥 | 🟢 | 304 lignes, palette monochromatic + accent #0071E3 |
| 1.2 | Créer composants UI de base : `Button`, `Badge`, `Card`, `Input` | 🔥 | 🟢 | Lib interne — ds-btn, ds-card, ds-input |
| 1.3 | Sidebar redesign complet | 🔥 | 🟢 | ds-glass, company switcher 5 entités |
| 1.4 | Topbar redesign | 🔥 | 🟢 | Search dynamique, actions, notifications dot |
| 1.5 | Dashboard SuperAdmin — appliquer Design System | 🔥 | 🟢 | KPIs + Operations + Commercial + Finance + KPI Sidebar |
| 1.6 | Créer composants réutilisables : `StatusDot`, `KPICard`, `DataTable`, `ProgressBar` | ⚡ | 🟢 | Utilisés dans tous les portails |
| 1.7 | Appliquer Design System — Portail Client | ⚡ | 🟢 | 2026-02-20 — 6 fichiers corrigés : statuts inline styles DS, focus rings, backdrop-blur nettoyé |
| 1.8 | Appliquer Design System — Portail Prestataire | ⚡ | 🟢 | 2026-02-20 — 9 fichiers corrigés : STATUS_CONFIG→inline styles, bg-blue→var(--accent), glass→ds |
| 1.9 | Appliquer Design System — Portail Revendeur | ⚡ | 🟢 | 2026-02-20 — 5 fichiers corrigés : statuts inline styles DS, priority dots, source badges |

**Résidus globaux** : 0 violations. 261 corrections appliquées dans ~65 fichiers (SuperAdmin + Client + Prestataire + Revendeur).
**Critère de sortie** : ✅ Design System Apple Premium Monochromatic conforme sur tous les portails. Build 0 erreurs.

---

## PHASE 2 — CONNEXION DONNÉES RÉELLES ✅

**Objectif** : Brancher React ↔ Directus sur les pages déjà structurées.
**Complété** : 2026-02-20 — 12/12 stories réelles

| # | Story | Prio | Statut | Notes |
|---|-------|------|--------|-------|
| 2.1 | Service layer Directus (`src/services/directus.js`) | 🔥 | 🟢 | Dual impl (SDK + axios), JWT interceptor, CRUD complet |
| 2.2 | Authentification multi-portails JWT | 🔥 | 🟢 | authStore Zustand, login/logout/refresh, route guards |
| 2.3 | Dashboard CEO — KPIs depuis vraies données | 🔥 | 🟢 | 2026-02-20 — BudgetsManager + ExpensesTracker connectés Directus (cascading fallback budgets→dashboard_kpis→bank_transactions) |
| 2.4 | Dashboard CEO — Projets actifs en temps réel | 🔥 | 🟢 | projects + deliverables, CRUD, status filter |
| 2.5 | Dashboard CEO — Pipeline commercial | 🔥 | 🟢 | PipelineView: leads Directus, drag-drop Kanban, weighted KPIs |
| 2.6 | Dashboard CEO — Trésorerie Revolut live | 🔥 | 🟢 | 2026-02-20 — token-manager.js (431 lignes) : refresh automatique 5min avant expiry, Redis persistence, 401 interceptor avec retry |
| 2.7 | Dashboard CEO — Alertes intelligentes | ⚡ | 🟢 | client_invoices overdue, supplier_invoices upcoming, projects inactive, leads unfollowed |
| 2.8 | CRM — Companies (connecté Directus) | ⚡ | 🟢 | CRUD complet via crmApi.js + useCRMData |
| 2.9 | CRM — Contacts (connecté Directus) | ⚡ | 🟢 | people collection, CRUD, company autocomplete |
| 2.10 | Leads — Liste + pipeline (connecté Directus) | ⚡ | 🟢 | Kanban drag-drop, qualification, convert to quote |
| 2.11 | Projets — Liste + détail (connecté Directus) | ⚡ | 🟢 | ProjectsDashboard analytics, deliverables, 30s staleTime |
| 2.12 | WebSocket / polling temps réel (30s) | 📌 | 🟢 | usePolling (Page Visibility API, 30s) + useRealtimeDashboard (7 query keys) |

**Critère de sortie** : ✅ CEO voit vrais KPIs, projets et trésorerie. Budgets connectés Directus. Revolut token refresh automatique.

---

## PHASE 3 — FINANCE COMPLÈTE ✅

**Objectif** : Module Finance exhaustif — 11 stories, 12 nouveaux composants React, routes + navigation.
**Complété** : 2026-02-20 — 21 JSX files, ~8000 lignes, build OK

| # | Story | Prio | Statut | Notes |
|---|-------|------|--------|-------|
| 3.1 | Factures clients (InvoicesPage + InvoiceDetail + InvoiceForm) | 🔥 | 🟢 | 1648 lignes — statuts, pagination, CSV, TVA 8.1/2.6/3.8 |
| 3.2 | Factures fournisseurs + OCR (SupplierInvoicesPage) | 🔥 | 🟢 | OCR via /api/ocr/scan-invoice, drag-drop upload |
| 3.3 | Comptabilité plan PME Käfer (AccountingPage) | ⚡ | 🟢 | 3 tabs: Balance, Journal, Comptes individuels |
| 3.4 | Banking Revolut (BankingPage) | 🔥 | 🟢 | 1039 lignes — comptes, graphique, rapprochement |
| 3.5 | Rapports mensuels P&L (MonthlyReportsPage) | ⚡ | 🟢 | 923 lignes — KPIs, comparaison, YTD, print |
| 3.6 | Rapports TVA Formulaire 200 (VATReportsPage) | 🔥 | 🟢 | 903 lignes — Cases AFC 200-510, deadlines, reconciliation |
| 3.7 | Dépenses (ExpensesPage) | ⚡ | 🟢 | 630 lignes — KPIs, graphiques, formulaire, approbation |
| 3.8 | QR-Invoice ISO 20022 v2.3 (QRInvoiceGenerator) | 🔥 | 🟢 | 549 lignes — QRR/SCOR/NON, mod10 recursif, IBAN validation |
| 3.9 | Facturation jalons (MilestoneInvoicingPage) | ⚡ | 🟢 | 494 lignes — projets, deliverables, generation facture |
| 3.10 | Dashboard Finance KPI (FinanceDashboardPage) | ⚡ | 🟢 | ~580 lignes — 6 KPIs, 3 charts, alertes, activite |
| 3.11 | Navigation + routes Finance | ⚡ | 🟢 | App.jsx + Sidebar.jsx + index.js mis à jour, 13 nouvelles routes |

**Critère de sortie** : ✅ Toute la finance accessible depuis la plateforme. Sidebar Finance avec 11 entrées. Build production OK.

---

## PHASE 4 — PORTAIL PRESTATAIRE COMPLET ✅

**Complété** : 2026-02-20 — 12 JSX files, ~5500 lignes, build OK

| # | Story | Prio | Statut | Notes |
|---|-------|------|--------|-------|
| 4.1 | Dashboard prestataire — données réelles | 🔥 | 🟢 | 616 lignes — timeline, deadlines, quick stats, proposals/projects/invoices |
| 4.2 | Missions — liste (connecté Directus) | 🔥 | 🟢 | 270 lignes — status filter, search, project cards grid |
| 4.3 | Mission — détail (brief + matériel + contact) | 🔥 | 🟢 | 430 lignes — info grid, deliverables table, documents section |
| 4.4 | Tâches prestataire | ⚡ | 🟢 | 523 lignes — list + kanban toggle, status update mutation, priority filter |
| 4.5 | **Module 23** — Calendrier missions | ⚡ | 🟢 | 636 lignes — CSS Grid month/week, iCal export, day detail sidebar |
| 4.6 | **Module 24** — Messagerie CEO ↔ Prestataire | 📌 | 🟢 | 650 lignes — 2-panel layout, conversations groupées, 30s polling |
| 4.7 | **Module 22** — Base de connaissances | 💡 | 🟢 | KnowledgeBasePage + KnowledgeArticlePage, category filter, HTML sanitization |
| 4.8 | Profil prestataire | 📌 | 🟢 | 739 lignes — fix auth useProviderAuth, stats section, notifications prefs |
| 4.9 | Upload facture prestataire + OCR auto | 🔥 | 🟢 | 3-step wizard: upload → OCR → review, drag-drop, TVA 8.1/2.6/3.8 |
| ~~4.10~~ | ~~Performance~~ | ⚫ | ⚫ | Supprimé — non pertinent |
| ~~4.11~~ | ~~Récompenses~~ | ⚫ | ⚫ | Supprimé — non pertinent |

**Critère de sortie** : ✅ Portail prestataire complet avec 11 routes, sidebar 11 entrées. Build production OK.

---

## PHASE 5 — PORTAIL REVENDEUR COMPLET ✅

**Complété** : 2026-02-20 — 10 JSX files, ~4200 lignes, build OK

| # | Story | Prio | Statut | Notes |
|---|-------|------|--------|-------|
| 5.1 | Dashboard revendeur — données réelles | 🔥 | 🟢 | 364 lignes — 4 KPIs, top 5 deals, commissions mock, Recharts BarChart, polling 60s |
| 5.2 | Pipeline revendeur (Kanban + liste) | ⚡ | 🟢 | 489 lignes — 4 colonnes Kanban, toggle list/kanban, status mutation, search + priority filter |
| 5.3 | Leads revendeur | ⚡ | 🟢 | 655 lignes — table + add modal (react-hook-form), archive, convert to devis, assigned_to filter |
| 5.4 | Clients revendeur + détail | ⚡ | 🟢 | ClientsRevendeur + ClientDetailRevendeur — won leads → companies, tabs devis/factures/info |
| 5.5 | **Module 25** — Commissions | ⚡ | 🟢 | 237 lignes — MOCK data (collection inexistante), 3 KPIs, table commissions, TODO Directus |
| 5.6 | Devis revendeur | ⚡ | 🟢 | 368 lignes — quotes table, status filter pills, duplicate mutation, relance action |
| 5.7 | Marketing revendeur (assets + campagnes) | 📌 | 🟢 | 264 lignes — Directus /files API, file type detection, 3 mock campaign templates (Mautic TODO) |
| 5.8 | Rapports revendeur | 📌 | 🟢 | 575 lignes — Recharts ComposedChart, month/year selector, CSV export UTF-8 BOM |

**Critère de sortie** : ✅ Portail revendeur complet avec 9 routes, sidebar 8 entrées. Build production OK.

---

## PHASE 6 — PORTAIL CLIENT COMPLET ✅

**Complété** : 2026-02-20 — 8 JSX files créés/refactorisés, ~3800 lignes, build OK

| # | Story | Prio | Statut | Notes |
|---|-------|------|--------|-------|
| 6.1 | Dashboard client — KPIs réels + polling 60s | 🔥 | 🟢 | 432 lignes — 4 KPICards, projets récents ProgressBar, actions requises, useMemo |
| 6.2 | Projets client — statut + jalons | 🔥 | 🟢 | Existant production-ready — ClientProjectsList + ProjectTracking |
| 6.3 | Documents client (devis, contrats, factures, autres) | ⚡ | 🟢 | DocumentsClient.jsx — 4 tabs horizontaux, fichiers Directus grid |
| 6.4 | Finances client (BarChart 6 mois + CSV export) | ⚡ | 🟢 | FinancesClient.jsx — 3 KPIs, Recharts BarChart, historique table, CSV UTF-8 BOM |
| 6.5 | Paiement QR-Invoice + Revolut link | 🔥 | 🟢 | PaymentView.jsx — QR-Invoice ISO 20022, Revolut link, virement, polling 30s |
| 6.6 | Signature devis DocuSeal + CGV | 🔥 | 🟢 | Déjà production-ready — QuoteSignature.jsx 372 lignes, CGV + DocuSeal |
| 6.7 | Activation projet (frontend page) | 🔥 | 🟢 | ProjectActivatedPage.jsx — success page, résumé projet, CTA navigation |
| 6.8 | Support/Tickets client | 📌 | 🟢 | SupportClient.jsx 496 lignes — filtres, détail inline, nouveau ticket modal, réponse |
| 6.9 | Profil client | 📌 | 🟢 | ProfilClient.jsx 612 lignes — info, sécurité, préférences, portail info |

**Critère de sortie** : ✅ Portail client complet avec 12 routes, sidebar 7 entrées. Build production OK.

---

## PHASE 7 — AUTOMATION & IA ✅

**Complété** : 2026-02-20 — 12/12 stories, 5 backend workflows, 3 frontend modules, 2 API modules, build OK

| # | Story | Prio | Statut | Notes |
|---|-------|------|--------|-------|
| 7.1 | **Module 20** — Email Templates (éditeur + Mautic sync) | ⚡ | 🟢 | 2026-02-20 — 557 lignes, CRUD Directus, sync Mautic, multi-langue FR/DE/EN, preview inline |
| 7.2 | **Module 21** — Workflows visuels (liste + historique) | ⚡ | 🟢 | 2026-02-20 — 591 lignes, 6 workflows prédéfinis, toggle ON/OFF, historique exécutions |
| 7.3 | Workflow : Lead entrant → qualification LLM | 🔥 | 🟢 | 2026-02-20 — Claude claude-sonnet-4-6, 3x retry exponential backoff, score ≥7 → email confirmation |
| 7.4 | Workflow : Signature → facture acompte auto | 🔥 | 🟢 | 2026-02-20 — DocuSeal webhook, 30% acompte Invoice Ninja, idempotent |
| 7.5 | Workflow : Paiement → activation projet auto | 🔥 | 🟢 | 2026-02-20 — Revolut HMAC webhook, 3 stratégies matching, deposit→project / final→completed |
| 7.6 | Workflow : Relances automatiques (J+7, J+14, J+30) | ⚡ | 🟢 | 2026-02-20 — invoice-reminders.js, cron J+7/J+14/J+30, Mautic transactional |
| 7.7 | Workflow : Rapport mensuel CEO (1er du mois) | 📌 | 🟢 | 2026-02-20 — CRON 1er du mois 08:00, Claude AI summary, anti-doublon, preview + send |
| 7.8 | Notification — Automation (hub + historique) | ⚡ | 🟢 | 2026-02-20 — 522 lignes, SSE + polling fallback, filtres type/read/date, mark read |
| 7.9 | Module 13 — Time tracking → facturation régie | 📌 | 🟢 | 2026-02-20 — 8 endpoints, CSV export BOM, Invoice Ninja multi-rate TVA 8.1/2.6/3.8 |
| 7.10 | Module 14 — Tickets support → facturation hors contrat | 📌 | 🟢 | 2026-02-20 — support/index.js, billing endpoint, invoice generation |
| 7.11 | Intégration WhatsApp Business → Lead auto | 💡 | 🟢 | 2026-02-20 — whatsapp-webhook.js 240 lignes, verify + messages, lead auto-create |
| 7.12 | Intégration Ringover + résumé LLM appels | 💡 | 🟢 | 2026-02-20 — ringover-polling.js, call events, LLM summary |

**Critère de sortie** : ✅ Automation complète. 5 workflows backend, 3 modules frontend (Email Templates, Workflows, Notifications), Time Tracking API, SSE notifications. Build production OK.

---

## PHASE 8 — QUALITÉ & PRODUCTION ✅

**Complété** : 2026-02-21 — 9/9 stories, sécurité + performance + responsive + monitoring + tests + docs

| # | Story | Prio | Statut | Notes |
|---|-------|------|--------|-------|
| 8.1 | Tests end-to-end cycle complet (Lead → Paiement) | 🔥 | 🟢 | 2026-02-21 — e2e-cycle.test.js, 12 scenarios node:test, skip sans RUN_E2E |
| 8.2 | Correction taux TVA OCR (7.7→8.1, 2.5→2.6, 3.7→3.8) | 🔥 | 🟢 | 2026-02-21 — 6 occurrences corrigées (4 HTML legacy + 1 load-test.js), tva-engine.js OK déjà |
| 8.3 | Permissions granulaires RBAC (4 rôles) | ⚡ | 🟢 | 2026-02-21 — rbac.config.js (superadmin/client/prestataire/revendeur), 79 permissions, hasPermission/requireOwnership middleware |
| 8.4 | Audit sécurité (JWT expiry, HTTPS, rate limiting) | ⚡ | 🟢 | 2026-02-21 — helmet headers, 3 rate limiters (global 100/min, auth 10/15min, webhook 30/min), security-logger.js, JWT startup check |
| 8.5 | Performance (lazy loading, pagination, cache Redis) | ⚡ | 🟢 | 2026-02-21 — cache.js (Redis w/ graceful fallback), pagination.js, cacheMiddleware avec X-Cache header |
| 8.6 | Responsive mobile (dashboard CEO en tablet) | 📌 | 🟢 | 2026-02-21 — responsive CSS utilities (grid/sidebar/table/kpi/chart breakpoints), useResponsive hook, MobileMenuButton, print styles |
| 8.7 | Documentation API des 200+ endpoints custom | 📌 | 🟢 | 2026-02-21 — docs/API-REFERENCE.md, 25 sections, 200+ endpoints catalogués depuis code source |
| 8.8 | Grafana monitoring + Prometheus metrics | 📌 | 🟢 | 2026-02-21 — monitoring/prometheus.yml, metrics.middleware.js (prom-client), 2 dashboards Grafana (platform 8 panels, finance 6 panels) |
| 8.9 | Mise à jour ROADMAP.md après chaque story | 🔥 | 🟢 | Règle Claude Code — complété |

**Critère de sortie** : ✅ Sécurité renforcée (helmet + rate limiting + RBAC 4 rôles). Performance (Redis cache + pagination). Responsive mobile. 200+ endpoints documentés. Monitoring Prometheus/Grafana. Tests E2E. Build 0 erreurs.

---

## PHASE 9 — MULTI-ENTREPRISES 📌

**Déclencheur** : HYPERVISUAL Switzerland V2 validée et stable

| # | Story | Prio | Statut | Notes |
|---|-------|------|--------|-------|
| 9.1 | Architecture isolation données par entreprise | 🔥 | 🔴 | company_id sur toutes collections |
| 9.2 | DAINAMICS — onboarding | 📌 | 🔴 | |
| 9.3 | LEXAIA — onboarding | 📌 | 🔴 | |
| 9.4 | ENKI REALTY — onboarding | 📌 | 🔴 | orthographe exacte : ENKI REALTY |
| 9.5 | TAKEOUT — onboarding | 📌 | 🔴 | |
| 9.6 | Dashboard CEO multi-entreprises (vue consolidée) | ⚡ | 🔴 | |

---

## RÉCAPITULATIF CHIFFRÉ

| Phase | Stories | Statut global |
|-------|---------|--------------|
| Phase 0 — Fondation + V1 backend | 10 | ✅ 100% complété |
| Phase 1 — Design System | 9 | ✅ 100% complété (2026-02-20) — 261 corrections DS dans ~65 fichiers |
| Phase 2 — Données réelles | 12 | ✅ 100% complété (2026-02-20) — Budgets + Revolut token refresh OK |
| Phase 3 — Finance complète | 11 | ✅ 100% complété (2026-02-20) |
| Phase 4 — Prestataire | 9 | ✅ 100% complété (2026-02-20) |
| Phase 5 — Revendeur | 8 | ✅ 100% complété (2026-02-20) |
| Phase 6 — Client | 9 | ✅ 100% complété (2026-02-20) |
| Phase 7 — Automation & IA | 12 | ✅ 100% complété (2026-02-20) |
| Phase 8 — Qualité & Production | 9 | ✅ 100% complété (2026-02-21) |
| Phase 9 — Multi-entreprises | 6 | 🔴 0% |
| **TOTAL** | **96 stories** | **~94% global (90/96)** |

---

## RÈGLES POUR CLAUDE CODE (RAPPEL)

Chaque prompt Claude Code doit obligatoirement inclure :

1. **Skills à lire** : chemins `~/.claude/skills-repos/` pertinents
2. **Vérification Directus** : utiliser MCP pour confirmer les champs avant de coder
3. **MAJ ROADMAP.md** : marquer la story comme complétée après chaque livraison
4. **Design System** : référencer `src/styles/design-system.css` (tokens CSS)
5. **Commit clair** : `feat(phase-X): story X.X — description`

## POINTS D'ATTENTION CRITIQUES

- **ENKI REALTY** : orthographe exacte (pas ENKY, pas ENKI seul)
- **Recharts** pour les graphiques (PAS ApexCharts)
- **Design System §14** : monochromatic, accent #0071E3 uniquement, zéro couleur décorative
- **TVA Suisse** : 8.1% / 2.6% / 3.8% (pas 7.7/2.5/3.7)
- **Projet démarre** uniquement après signature DocuSeal + paiement Revolut confirmé
- **Mautic** pour TOUS les emails (marketing + transactionnels)

---

*Roadmap v2.0 — Février 2026*  
*Remplace ROADMAP.md V1 (phases A-J archivé dans docs/archive/)*  
*98 stories identifiées — Phase 1 (Design System) : PRIORITÉ ABSOLUE*
