# PROGRESS — HYPERVISUAL Unified Platform
**Date de debut** : 2026-02-19
**Progression globale** : 13/47 stories — 27%
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
**Statut** : [~] IN_PROGRESS | **Progression** : 7/8 stories
**Demarre** : 2026-02-19 | **Termine** : —

- [V] S-01-01 · Connexion React <-> Directus (Axios + TanStack Query) — 2026-02-19
- [V] S-01-02 · Router principal + authentification portails — 2026-02-19
- [V] S-01-03 · Layout SuperAdmin (Tabler.io CDN, glassmorphism) — 2026-02-19
- [V] S-01-04 · Widget Alertes & Actions prioritaires (REQ-CEO-003) — 2026-02-19
- [V] S-01-05 · Widget KPIs financiers temps reel (REQ-CEO-001/002) — 2026-02-19
- [V] S-01-06 · Widget Pipeline commercial (leads + devis) — 2026-02-19
- [V] S-01-07 · Widget Tresorerie Revolut (REQ-CEO-001) — 2026-02-19
- [ ] S-01-08 · Module Leads — tableau de bord capture + qualification LLM

**Fichiers crees/modifies** : lib/axios.js, lib/queryClient.js, stores/authStore.js, services/api/directus.js, services/api/config.js, App.jsx, vite.config.js, components/auth/ProtectedRoute.jsx, pages/LoginPage.jsx, portals/superadmin/widgets/AlertsWidget.jsx, portals/superadmin/widgets/KPIWidget.jsx, portals/superadmin/widgets/PipelineWidget.jsx, portals/superadmin/widgets/TreasuryWidget.jsx, portals/superadmin/Dashboard.jsx (refactored)
**Observations** : services/api/directus.js avait un token hardcode (hbQz-...) en fallback — retire. DirectusAPI class existante reutilisee avec axios centralise. QueryClient extrait de App.jsx vers lib/queryClient.js.
**Blocages** : —

---

## PHASE 2 — Portail Prestataire + Module Devis
**Statut** : [ ] TODO | **Progression** : 0/7 stories
**Demarre** : — | **Termine** : —

- [ ] S-02-01 · Layout Portail Prestataire (auth + projets assignes)
- [ ] S-02-02 · Module demande de devis prestataire (REQ-PRES-001/002)
- [ ] S-02-03 · Upload factures prestataires + OCR automatique
- [ ] S-02-04 · Createur de devis client (interface CEO)
- [ ] S-02-05 · Calcul marges automatique (cout prestataire -> prix client)
- [ ] S-02-06 · Integration DocuSeal (signature electronique)
- [ ] S-02-07 · Workflow post-signature (creation projet + facture acompte)

**Fichiers crees/modifies** : —
**Observations** : —
**Blocages** : —

---

## PHASE 3 — Portail Client + Facturation QR Swiss
**Statut** : [ ] TODO | **Progression** : 0/7 stories
**Demarre** : — | **Termine** : —

- [ ] S-03-01 · Layout Portail Client (auth par lien securise)
- [ ] S-03-02 · Vue devis + signature client
- [ ] S-03-03 · Vue suivi projet temps reel
- [ ] S-03-04 · Vue jalons + tableau recapitulatif paiements
- [ ] S-03-05 · Generation QR-Invoice v2.3 (swissqrbill)
- [ ] S-03-06 · Integration Invoice Ninja (sync bidirectionnelle)
- [ ] S-03-07 · Workflow paiement acompte -> activation projet

**Fichiers crees/modifies** : —
**Observations** : —
**Blocages** : —

---

## PHASE 4 — Gestion Projets + Facturation Recurrente
**Statut** : [ ] TODO | **Progression** : 0/6 stories
**Demarre** : — | **Termine** : —

- [ ] S-04-01 · Module Projets — tableau de bord CEO
- [ ] S-04-02 · Statuts projet + workflow automatique
- [ ] S-04-03 · Gestion documentaire projet (upload/download)
- [ ] S-04-04 · Suivi commandes hardware Chine
- [ ] S-04-05 · Facturation recurrente (maintenance/hebergement)
- [ ] S-04-06 · Rappels automatiques paiements (J+7, J+14, J+30)

**Fichiers crees/modifies** : —
**Observations** : —
**Blocages** : —

---

## PHASE 5 — Finance Avancee (Modules 9-12)
**Statut** : [ ] TODO | **Progression** : 0/8 stories
**Demarre** : — | **Termine** : —

- [ ] S-05-01 · Facturation par jalons (deliverables -> factures auto)
- [ ] S-05-02 · Avoirs & remboursements (annulations evenementielles)
- [ ] S-05-03 · Contrats recurrents (maintenance mensuelle/annuelle)
- [ ] S-05-04 · Workflow validation factures fournisseurs (collection approvals)
- [ ] S-05-05 · Dashboard KPI Finance pre-alimente (240 KPIs existants)
- [ ] S-05-06 · Rapprochement bancaire renforce (matching multi-criteres)
- [ ] S-05-07 · Module comptabilite suisse (ecritures automatiques)
- [ ] S-05-08 · Formulaire TVA AFC 200 (taux 8.1% / 2.6% / 3.8%)

**Fichiers crees/modifies** : —
**Observations** : —
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

---

## METRIQUES
**Collections Directus** : 83 actives
**Endpoints custom** : 156
**Fichiers archives lors du nettoyage** : — (a remplir apres S-00-02)
**Fichiers supprimes** : — (a remplir apres S-00-02)
**Dernier commit** : efa444b — feat(auth): add permissions matrix
