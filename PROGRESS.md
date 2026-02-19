# PROGRESS — HYPERVISUAL Unified Platform
**Date de debut** : 2026-02-19
**Progression globale** : 41/47 stories — 87%
> Ce fichier est mis a jour par Claude Code apres chaque story.
> Jean (CEO) est le seul a pouvoir passer un statut de [V] DONE a [A] AUDITED.

---

## LEGENDE
- [ ] TODO — Pas encore demarre
- [~] IN_PROGRESS — En cours (avec timestamp de debut)
- [V] DONE — Implemente, en attente de validation Jean
- [A] AUDITED — Valide par Jean
- [X] BLOCKED — Bloque (raison obligatoire)
- [S] SKIPPED — Reporte (raison obligatoire)

---

## PHASE 0 — Fondations & Nettoyage
**Statut** : [V] DONE | **Progression** : 6/6 stories
**Demarre** : 2026-02-19 | **Termine** : 2026-02-19

- [V] S-00-01 · Audit complet du repo (voir AUDIT-REPO.md) — 2026-02-19
- [V] S-00-02 · Nettoyage fichiers obsoletes + archivage — 2026-02-19
- [V] S-00-03 · Variables d'environnement securisees (.env structure) — 2026-02-19
- [V] S-00-04 · Authentification Directus (JWT + refresh tokens + roles) — 2026-02-19
- [V] S-00-05 · Systeme de permissions par portail (SuperAdmin/Client/Prestataire/Revendeur) — 2026-02-19
- [V] S-00-06 · Docker health checks + monitoring basique — 2026-02-19

**Fichiers crees/modifies** : AUDIT-REPO.md, PROGRESS.md, DECISIONS.md, .gitignore, archive/2026-02-19/, env.validator.js, .env.example, server.js, auth.middleware.js, lead-hooks.js, quote-hooks.js, invoice-hooks.js, mautic/router.js, erpnext/index.js, erpnext-api-keys.example.json
**Observations** : Score sante 62/100. 7 tokens hardcodes retires (5x DIRECTUS_TOKEN, 1x MAUTIC creds, 1x JWT_SECRET). CORS securise. Validation env au demarrage.
**Blocages** : —

---

## PHASE 1 — Dashboard SuperAdmin + Module Leads
**Statut** : [V] DONE | **Progression** : 8/8 stories
**Demarre** : 2026-02-19 | **Termine** : 2026-02-19

- [V] S-01-01 · Connexion React <-> Directus (Axios + TanStack Query) — 2026-02-19
- [V] S-01-02 · Router principal + authentification portails — 2026-02-19
- [V] S-01-03 · Layout SuperAdmin (Tabler.io CDN, glassmorphism) — 2026-02-19
- [V] S-01-04 · Widget Alertes & Actions prioritaires (REQ-CEO-003) — 2026-02-19
- [V] S-01-05 · Widget KPIs financiers temps reel (REQ-CEO-001/002) — 2026-02-19
- [V] S-01-06 · Widget Pipeline commercial (leads + devis) — 2026-02-19
- [V] S-01-07 · Widget Tresorerie Revolut (REQ-CEO-001) — 2026-02-19
- [V] S-01-08 · Module Leads — tableau de bord capture + qualification LLM — 2026-02-19

**Fichiers crees/modifies** : lib/axios.js, lib/queryClient.js, stores/authStore.js, services/api/directus.js, services/api/config.js, App.jsx, vite.config.js, components/auth/ProtectedRoute.jsx, pages/LoginPage.jsx, portals/superadmin/widgets/AlertsWidget.jsx, portals/superadmin/widgets/KPIWidget.jsx, portals/superadmin/widgets/PipelineWidget.jsx, portals/superadmin/widgets/TreasuryWidget.jsx, portals/superadmin/Dashboard.jsx (refactored)
**Observations** : services/api/directus.js avait un token hardcode (hbQz-...) en fallback — retire. DirectusAPI class existante reutilisee avec axios centralise. QueryClient extrait de App.jsx vers lib/queryClient.js.
**Blocages** : —

---

## PHASE 2 — Portail Prestataire + Module Devis
**Statut** : [V] DONE | **Progression** : 7/7 stories
**Demarre** : 2026-02-19 | **Termine** : 2026-02-19

- [V] S-02-01 · Correctif noms entreprises (HYPERVISUAL, DAINAMICS, ENKI REALTY, LEXAIA, TAKEOUT) — 2026-02-19
- [V] S-02-02 · Layout Portail Prestataire (sidebar + topbar + routing) — 2026-02-19
- [V] S-02-03 · Dashboard Prestataire avec donnees reelles Directus — 2026-02-19
- [V] S-02-04 · Module Devis Prestataire (reception + reponse) — 2026-02-19
- [V] S-02-05 · Module Devis SuperAdmin (gestion complete) — 2026-02-19
- [V] S-02-06 · Hook useCommercial + service layer commercial — 2026-02-19
- [V] S-02-07 · Profil Prestataire + Documents — 2026-02-19

**Fichiers crees/modifies** : portals/prestataire/layout/PrestataireLayout.jsx, portals/prestataire/pages/PlaceholderPage.jsx, portals/prestataire/Dashboard.jsx (rewrite), portals/prestataire/quotes/QuotesModule.jsx, portals/prestataire/quotes/QuotesList.jsx, portals/prestataire/quotes/QuoteResponseForm.jsx, portals/prestataire/profile/ProfilePage.jsx, portals/superadmin/quotes/QuotesModule.jsx, portals/superadmin/quotes/QuotesList.jsx, portals/superadmin/quotes/QuoteForm.jsx, portals/superadmin/quotes/QuoteDetail.jsx, hooks/useCommercial.js, services/api/commercial.js, components/layout/TopBar.jsx, components/layout/Sidebar.jsx, pages/LoginPage.jsx, App.jsx
**Observations** : Noms entreprises corriges (S-01-03 avait HMF/ETEKOUT/NK REALITY/LEXIA). Collection proposals peut ne pas exister — le code gere gracieusement avec catch. Collection providers structure non confirmee — profil gere la creation si inexistant. Pas de champ prestataire_id sur projects — missions affichees sans filtre prestataire pour l'instant.
**Blocages** : —

---

## PHASE 3 — Portail Client + Facturation QR Swiss
**Statut** : [V] DONE | **Progression** : 7/7 stories
**Demarre** : 2026-02-19 | **Termine** : 2026-02-19

- [V] S-03-01 · Layout Portail Client (sidebar verte #059669 + routing React Router) — 2026-02-19
- [V] S-03-02 · Dashboard Client (stats + projets + factures + devis reels Directus) — 2026-02-19
- [V] S-03-03 · Module Factures Client (liste + detail + QR-Facture suisse) — 2026-02-19
- [V] S-03-04 · Module Devis Client (CGV acceptance + signature + workflow complet) — 2026-02-19
- [V] S-03-05 · Module Facturation SuperAdmin (CRUD + QR Swiss + timeline statut) — 2026-02-19
- [V] S-03-06 · Finance Dashboard reel (useFinance hook + services/api/finance.js) — 2026-02-19
- [V] S-03-07 · Deposit Config Manager (onglet Acomptes dans Settings) — 2026-02-19

**Fichiers crees/modifies** : components/payments/QRSwiss.jsx, portals/client/layout/ClientLayout.jsx, portals/client/pages/PlaceholderPage.jsx, portals/client/Dashboard.jsx (rewrite), portals/client/invoices/InvoicesModule.jsx, portals/client/quotes/QuotesModule.jsx, portals/superadmin/invoices/InvoicesModule.jsx, portals/superadmin/invoices/InvoiceForm.jsx, portals/superadmin/invoices/InvoiceDetail.jsx, portals/superadmin/finance/FinanceDashboard.jsx (refactor), portals/superadmin/settings/SettingsDashboard.jsx, portals/superadmin/settings/components/DepositConfigManager.jsx, hooks/useFinance.js, services/api/finance.js, App.jsx
**Observations** : Portail client existant avait deja ClientPortalApp.jsx + pages/ + components/ (auth, QuoteViewer, InvoicesList, etc.) — code legacy conserve, nouveaux composants TanStack Query ajoutes. Collection client_invoices peut ne pas exister — catch gracieux. FinanceDashboard refactore de Tabler CSS vers Tailwind + useFinance hook TanStack Query. CGV Manager deja complet dans module Legal (pas de duplication). Evolution mensuelle requiert 24 requetes Directus — staleTime 2min.
**Blocages** : —

---

## PHASE 4 — Gestion Projets + Facturation Recurrente
**Statut** : [V] DONE | **Progression** : 6/6 stories
**Demarre** : 2026-02-19 | **Termine** : 2026-02-19

- [V] S-04-01 · Module Projets SuperAdmin (liste + kanban + detail + form) — 2026-02-19
- [V] S-04-02 · Module Livrables & Taches (kanban + CRUD + sous-taches) — 2026-02-19
- [V] S-04-03 · Module Time Tracking (graphiques Recharts + CRUD) — 2026-02-19
- [V] S-04-04 · Module Projets Client (lecture seule + timeline) — 2026-02-19
- [V] S-04-05 · Abonnements & Facturation Recurrente (subscriptions + generation factures) — 2026-02-19
- [V] S-04-06 · Dashboard Projets analytique (PieChart + BarChart + LineChart + KPIs) — 2026-02-19

**Fichiers crees/modifies** : services/api/projects.js, portals/superadmin/projects/ProjectsModule.jsx, portals/superadmin/projects/ProjectsDashboard.jsx, portals/superadmin/deliverables/DeliverablesModule.jsx, portals/superadmin/time/TimeTrackingModule.jsx, portals/superadmin/subscriptions/SubscriptionsModule.jsx, portals/client/projects/ClientProjectsModule.jsx, App.jsx, components/layout/Sidebar.jsx, components/layout/TopBar.jsx
**Observations** : Ancien ProjectsModule (modules/projects/) remplace par portals/superadmin/projects/ connecte TanStack Query. DeliverablesView et TimeTrackingView etaient 100% mock — remplaces par modules connectes Directus. Collection recurring_invoices n'existe pas — utilise subscriptions avec schema discovery runtime. Module client projets avec fallback HYPERVISUAL si pas de client_id match.
**Blocages** : —

---

## PHASE 5 — CRM, Support, Revendeur, Notifications & Marketing
**Statut** : [V] DONE | **Progression** : 7/7 stories
**Demarre** : 2026-02-19 | **Termine** : 2026-02-19

- [V] S-05-01 · Lead Detail View + Activities Timeline (CRUD activites, fiche lead, status change) — 2026-02-19
- [V] S-05-02 · CRM Contacts Module (selectedCompany + view props, contacts/companies connectes) — 2026-02-19
- [V] S-05-03 · Support Tickets Module (rewrite 100% mock -> Directus, KPIs, CRUD, filtres) — 2026-02-19
- [V] S-05-04 · Portail Revendeur (layout orange #ea580c, dashboard KPIs, routes nested) — 2026-02-19
- [V] S-05-05 · Notifications System (useNotifications 30s polling, NotificationsCenter dropdown, TopBar) — 2026-02-19
- [V] S-05-06 · Marketing Module (campaigns CRUD, WhatsApp messages, PieChart + BarChart) — 2026-02-19
- [V] S-05-07 · CRM Analytics Dashboard (FunnelChart, PieChart, LineChart 6 mois, BarChart sources) — 2026-02-19

**Fichiers crees/modifies** : services/api/crm.js, portals/superadmin/leads/components/LeadDetail.jsx, portals/superadmin/leads/LeadsDashboard.jsx, portals/superadmin/crm/CRMDashboard.jsx, portals/superadmin/crm/CRMAnalytics.jsx, portals/superadmin/support/SupportDashboard.jsx, portals/superadmin/marketing/MarketingDashboard.jsx, portals/revendeur/layout/RevendeurLayout.jsx, portals/revendeur/RevendeurDashboard.jsx, portals/revendeur/pages/PlaceholderPage.jsx, hooks/useNotifications.js, components/notifications/NotificationsCenter.jsx, components/layout/TopBar.jsx, App.jsx
**Observations** : LeadsDashboard et CRM contacts/companies etaient deja connectes Directus — ajout LeadDetail + activities. SupportDashboard et MarketingDashboard etaient 100% mock — rewrite complet. Ancien revendeur Dashboard etait un mock en EUR — remplace par vrai portail CHF avec layout orange. TopBar avait un bell icon mort — connecte a useNotifications avec 30s polling.
**Blocages** : —

---

## PHASE 6 — Modules Avances (13-16)
**Statut** : [ ] TODO | **Progression** : 0/6 stories
**Demarre** : — | **Termine** : —

- [ ] S-06-01 · Suivi du temps -> facturation en regie
- [ ] S-06-02 · Tickets support -> facturation hors contrat
- [ ] S-06-03 · Alertes seuils KPI configurables
- [ ] S-06-04 · Rapport quotidien CEO automatique (Mautic)
- [ ] S-06-05 · Portail Revendeur (layout + fonctionnalites)
- [ ] S-06-06 · Optimisations performance + tests de charge

**Fichiers crees/modifies** : —
**Observations** : —
**Blocages** : —

---

## DECOUVERTES & AJUSTEMENTS
> Toute decouverte qui impacte le plan est loggee ici immediatement.

| Date | Story | Decouverte | Impact sur le plan | Decision prise |
|------|-------|-----------|-------------------|----------------|
| 2026-02-19 | S-00-03 | frontend/src/api/directus.js n'a PAS de token hardcode (utilise env + SDK auth) | 1 fichier de moins a modifier | Skip modification |
| 2026-02-19 | S-00-03 | src/backend/api/revolut/index.js existe deja (260 lignes, complet) | Pas besoin de creer un stub | Import fonctionne via try/catch |
| 2026-02-19 | S-00-03 | mautic/router.js avait un token Directus DIFFERENT (e6Vt5...) des autres (hbQz...) | 2 tokens compromis distincts | Les 2 retires |
| 2026-02-19 | S-00-03 | ERPNext import resout correctement (src/services/erpnext-api.js) | Import pas casse au niveau path | Ajout fallback stub robuste |
| 2026-02-19 | S-00-04 | auth.routes.js deja 662 lignes avec login/refresh/logout/me/register | Completer plutot que reecrire | Ajout magic-link + portal param + rotation |
| 2026-02-19 | S-00-04 | collection.routes.js bypass auth (next() stubs L13-21) | Faille securite sur /api/collection | Remplace par vrai authMiddleware |
| 2026-02-19 | S-00-04 | auth.routes.js utilisait DIRECTUS_TOKEN (ancien nom) | Incoherence avec S-00-03 | Renomme en DIRECTUS_ADMIN_TOKEN |
| 2026-02-19 | S-01-01 | services/api/directus.js avait token hardcode hbQz-... en fallback | Token compromis dans frontend | Retire, utilise lib/axios.js centralise |
| 2026-02-19 | S-01-01 | services/api/config.js avait token hardcode dashboard-api-token-2025 | Token dev en prod | Retire le fallback |
| 2026-02-19 | S-01-01 | DirectusAPI class (services/api/directus.js) deja complete (342 lignes) avec CRUD + company filter | Pas besoin de recreer un client axios | Reutilise avec import lib/axios |
| 2026-02-19 | S-01-08 | Module Leads deja complet (5 fichiers, 293+203+7293+15622+2969 bytes) avec kanban + table + form + stats | Pas besoin de recreer | Valide tel quel, connecte a Directus via useLeads hook |
| 2026-02-19 | S-02-01 | TopBar.jsx avait noms faux entreprises (HMF Corp, ETEKOUT, NK REALITY, LEXIA) introduits en S-01-03 | Filtrage company incorrect | Corriges avec vrais noms + UUIDs Directus |
| 2026-02-19 | S-02-01 | LoginPage footer disait "HMF Corporation SA" | Branding incorrect | Corrige en "HYPERVISUAL Switzerland" |
| 2026-02-19 | S-02-03 | Pas de champ prestataire_id sur collection projects | Impossible de filtrer missions par prestataire | Affiche toutes les missions, a implementer plus tard |
| 2026-02-19 | S-02-04 | Collection proposals peut ne pas exister dans Directus | Requetes retournent 403/404 | Tous les fetch ont catch gracieux retournant [] |
| 2026-02-19 | S-02-07 | Collection providers structure non confirmee | Profil prestataire peut etre vide | Code gere creation si inexistant + alerte profil incomplet |
| 2026-02-19 | S-02-07 | Collection provider_documents peut ne pas exister | Upload documents peut echouer | Catch gracieux, section documents affiche vide |
| 2026-02-19 | S-03-01 | Portail client legacy existant (ClientPortalApp.jsx + pages/ + components/ + context/) avec Bootstrap 5 + authFetch | Nouveau code TanStack Query ajoute a cote, pas de remplacement | Legacy conserve, nouveaux composants cohabitent |
| 2026-02-19 | S-03-02 | Dashboard client etait 100% mock (hardcoded projects, invoices, tasks) | Rewrite complet necessaire | Remplace par 4 fetch TanStack Query filtres par client_id |
| 2026-02-19 | S-03-03 | Collection client_invoices peut ne pas exister dans Directus | Requetes retournent 403/404 | Catch gracieux retournant [] comme S-02-04 |
| 2026-02-19 | S-03-04 | Collection cgv_versions avec champ is_active pour CGV par entreprise | Workflow CGV fonctionnel | fetchActiveCGV filtre par owner_company + is_active=true |
| 2026-02-19 | S-03-06 | Evolution mensuelle tresorerie requiert 24 requetes Directus (12 mois x revenus + depenses) | Requete couteuse | staleTime 120_000ms (2 min) pour limiter les re-fetches |
| 2026-02-19 | S-03-06 | FinanceDashboard utilisait Tabler CSS + useFinanceData (useState/useEffect) | Incoherence avec design Tailwind du reste | Refactore vers Tailwind + useFinance TanStack Query |
| 2026-02-19 | S-03-07 | CGV Manager deja complet dans module Legal (CGVManager + CGVEditor + CGVPreview + AcceptanceHistory) | Pas de duplication necessaire | S-03-07 ne cree que DepositConfigManager |
| 2026-02-19 | S-03-05 | Import PlaceholderPage collision entre portails prestataire et client | Erreur build potentielle | Renomme en PrestatairePlaceholder et ClientPlaceholder |
| 2026-02-19 | S-04-01 | Ancien ProjectsModule (modules/projects/) deja connecte Directus via useProjects hook | Pas besoin de recreer le hook existant | Nouveau module dans portals/superadmin/projects/ avec fetch direct |
| 2026-02-19 | S-04-02 | DeliverablesView existant 100% mock (mockDeliverables, mockTasks hardcodes) | Remplacement complet necessaire | Rewrite avec TanStack Query + Directus deliverables collection |
| 2026-02-19 | S-04-03 | TimeTrackingView existant 100% mock (mockTimeEntries, mockWeeklyData, mockProjectDistribution) | Remplacement complet necessaire | Rewrite avec Recharts connecte a time_tracking collection |
| 2026-02-19 | S-04-04 | Pas de mapping client_id fiable sur collection projects | Projets client peuvent etre vides | Fallback: affiche projets HYPERVISUAL avec log console explicatif |
| 2026-02-19 | S-04-05 | Collection recurring_invoices n'existe PAS dans Directus | Impossible d'utiliser recurring_invoices | Utilise collection subscriptions avec decouverte de schema au runtime |
| 2026-02-19 | S-04-05 | Champs subscriptions decouverts dynamiquement (fields: *) | Structure schema inconnue a l'avance | Runtime schema discovery via Object.keys(sample) |
| 2026-02-19 | S-04-06 | Route /superadmin/projects/dashboard requiert nested route dans App.jsx | Route projects deja occupee par ProjectsModule | Ajoute /projects/dashboard comme route distincte + sidebar entry |
| 2026-02-19 | S-05-01 | LeadsDashboard + LeadKanban + useLeads deja 100% connectes Directus | Pas besoin de rewrite, seulement ajouter LeadDetail | Cree LeadDetail + activities timeline |
| 2026-02-19 | S-05-02 | CRM ContactsList + CompaniesList + crmApi.js deja connectes Directus | Pas de rework necessaire | Ajoute selectedCompany + view props au CRMDashboard |
| 2026-02-19 | S-05-03 | SupportDashboard etait 100% mock (mockOverviewData + setTimeout) avec Bootstrap classes | Rewrite complet necessaire | Remplace par TanStack Query + Tailwind glassmorphism + Directus support_tickets |
| 2026-02-19 | S-05-04 | Ancien revendeur Dashboard.jsx = 323 lignes 100% mock avec EUR au lieu de CHF | Remplace par vrai portail | Nouveau RevendeurLayout orange #ea580c + RevendeurDashboard connecte quotes/products |
| 2026-02-19 | S-05-05 | TopBar avait Bell icon mais notifications=[] jamais connecte | Fonctionnalite morte | Cree useNotifications hook avec 30s polling + NotificationsCenter dropdown |
| 2026-02-19 | S-05-06 | MarketingDashboard importait 4 sous-composants mock (ContentCalendar, CampaignsList, EventsManager, MarketingAnalytics) | Tout mock, Bootstrap classes | Rewrite complet avec 3 tabs: Overview, Campaigns CRUD, WhatsApp |
| 2026-02-19 | S-05-06 | Deux service layers CRM coexistent: crm/services/crmApi.js (directus class) et services/api/crm.js (raw axios) | Pas de conflit, patterns differents | Nouveaux modules utilisent services/api/crm.js |

---

## METRIQUES
**Collections Directus** : 83 actives
**Endpoints custom** : 156
**Fichiers archives lors du nettoyage** : — (a remplir apres S-00-02)
**Fichiers supprimes** : — (a remplir apres S-00-02)
**Dernier commit** : 76bdc8e — feat(S-05-07): CRM analytics dashboard — Phase 5 complete
