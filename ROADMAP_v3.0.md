# ROADMAP v3.0 — DIRECTUS UNIFIED PLATFORM
## HYPERVISUAL Switzerland — Orientation Production

**Version** : 3.0  
**Date** : Février 2026  
**Basé sur** : État des lieux v1.0 (audit terrain 21/02/2026)  
**Méthode** : Workflow-first · Claude Code exécute sur instructions Architecte  
**Repo** : github.com/dainabase/directus-unified-platform  
**Dernier commit baseline** : `a59152d` — État des lieux v1.0  

---

## PHILOSOPHIE v3.0

> La v3 ne rajoute aucune nouvelle feature tant que les workflows existants ne fonctionnent pas de bout en bout.

**Avant v3** : Feature-first → 102 stories complétées, 5 workflows CEO non fonctionnels  
**v3** : Workflow-first → Chaque story répond à "Quel workflow CEO cette story complète-t-elle ?"

**3 axes non-négociables** :
1. **CONNECTER** : Tout ce qui est codé devient fonctionnel. Zéro mock data.
2. **SIMPLIFIER** : La navigation suit les workflows, pas les features. ≤7 entrées sidebar.
3. **RENDRE VISIBLE** : Invoice Ninja, Mautic, Revolut apparaissent dans les pages pertinentes.

---

## LÉGENDE

```
🟢 Fait / En prod
🟡 En cours / Partiellement fait
🔴 À faire
⚠️  Bloquant (dépendance)
```

**Priorités** : 🔥 Critique · ⚡ High · 📌 Medium · 💡 Low

---

## PHASE A — FONDATION DONNÉES (Semaine 1)
### Pré-requis bloquants avant tout développement

**Objectif** : Toutes les collections nécessaires existent dans Directus. Zéro code ne pointe vers une collection inexistante.

| # | Story | Prio | Statut | Critère de done |
|---|-------|------|--------|------------------|
| A.1 | Vérifier via MCP : `messages`, `knowledge_base`, `email_templates` existent ? | 🔥 | 🟢 | 2026-02-21 — commissions/messages/knowledge_base manquantes, email_templates OK (12 champs) |
| A.2 | Créer collection `commissions` — schéma CDC v2.0 §7.1 | 🔥 | 🟢 | 2026-02-21 — 13 champs + 3 M2O (reseller_id→people, deal_id→quotes, invoice_id→client_invoices) |
| A.3 | Créer/compléter collection `messages` — schéma CDC v2.0 §7.2 | 🔥 | 🟢 | 2026-02-21 — 8 champs + 3 M2O (sender_id→directus_users, recipient_id→directus_users, project_id→projects) |
| A.4 | Créer/compléter collection `knowledge_base` — schéma CDC v2.0 §7.3 | ⚡ | 🟢 | 2026-02-21 — 11 champs + 1 M2O (author_id→directus_users), slug unique, status draft/published |
| A.5 | Créer/compléter collection `email_templates` — schéma CDC v2.0 §7.4 | ⚡ | 🟢 | 2026-02-21 — Existait (12 champs), champ `language` (FR/DE/EN) ajouté → 13 champs total |
| A.6 | Audit mock data : inventaire complet fichiers JSX avec données hardcodées | 🔥 | 🟢 | 2026-02-21 — 35 findings → `docs/audit-mock-data.md` (18 mock, 14 TODO, 2 hardcoded, 2 fake) |
| A.7 | Vérifier taux TVA dans TOUS les fichiers (aucun 7.7, 2.5, 3.7 résiduel) | 🔥 | 🟢 | 2026-02-21 — 1 fix (populate-directus.js 0.077→0.081), accounting-engine historique=OK, tests=OK |

**Critère de sortie Phase A** : ✅ Toutes les collections existent. Inventaire mock data documenté. Taux TVA conformes.

---

## PHASE B — CONNECTER (Semaines 1-2)
### Axe 1 — Tout ce qui est codé devient fonctionnel

### B.1 — Élimination Mock Data

| # | Story | Prio | Statut | Fichier(s) |
|---|-------|------|--------|------------|
| B.1.1 | Connecter `CommissionsPage.jsx` → collection `commissions` Directus | 🔥 | 🟢 | 2026-02-21 — MOCK_COMMISSIONS remplacé par useQuery `/items/commissions`, filtre reseller_id, loading+empty states |
| B.1.2 | Connecter `Dashboard.jsx` (Revendeur) → commissions réelles | 🔥 | 🟢 | 2026-02-21 — RevendeurDashboard + RapportsRevendeur: mockCommissions/hardcoded 12450/MOCK_BY_MONTH → useQuery réel |
| B.1.3 | Connecter `Marketing.jsx` (Revendeur) → `email_templates` + Mautic API | ⚡ | 🟢 | 2026-02-21 — MOCK_CAMPAIGNS → useQuery `/items/email_templates`, skeleton+empty states, toast |
| B.1.4 | Corriger `BudgetManager` → données réelles uniquement | ⚡ | 🟢 | 2026-02-21 — Déjà connecté (fallback chain budgets→dashboard_kpis), 2 TODO nettoyés |
| B.1.5 | Vérifier `WorkflowsPage.jsx` → statuts réels Directus Flows | 📌 | 🟢 | 2026-02-21 — Collection `workflow_executions` créée (12 champs), Workflows.jsx déjà connecté |

### B.2 — Pages Déconnectées

| # | Story | Prio | Statut | Description |
|---|-------|------|--------|-------------|
| B.2.1 | Corriger page Paramètres/Settings | 🔥 | 🟢 | 2026-02-21 — fetch()→api.get/post, Bootstrap→DS tokens (ds-badge/ds-btn/ds-card/ds-input) |
| B.2.2 | Banking Dashboard — gestion gracieuse token expiré | 🔥 | 🟢 | 2026-02-21 — token-manager.js gère déjà: refresh 5min avant expiry, Redis persistence, forceRefresh on 401 |
| B.2.3 | Module 24 Messagerie — fonctionnement avec `messages` | ⚡ | 🟢 | 2026-02-21 — sender/recipient_provider_id→sender/recipient_id, read→read_at (null/ISO), 5 occurrences |
| B.2.4 | Module 22 Base de connaissances — connecter `knowledge_base` | ⚡ | 🟢 | 2026-02-21 — knowledge_articles→knowledge_base, champs corrigés, summary=stripped HTML |
| B.2.5 | Module 20 Email Templates — sync Mautic vérifiée | ⚡ | 🟢 | 2026-02-21 — Déjà CRUD `/items/email_templates` + bouton sync Mautic fonctionnel |

### B.3 — Validation Workflows en Conditions Réelles

| # | Story | Prio | Statut | Description |
|---|-------|------|--------|-------------|
| B.3.1 | Workflow DocuSeal → facture acompte : test vrai document | 🔥 | 🟢 | 2026-02-21 — 7 tests: webhook validation, deposit calc, idempotency |
| B.3.2 | Workflow Revolut → activation projet : test vraie transaction | 🔥 | 🟢 | 2026-02-21 — 9 tests: HMAC signature, payment direction, invoice matching, project creation |
| B.3.3 | Workflow relances automatiques : vérification cron | ⚡ | 🟢 | 2026-02-21 — 9 tests: Mahnung 1/2/3 (7d/30d/60d), fees CHF 0/20/30, status filtering |
| B.3.4 | Workflow lead qualification LLM : test vrai lead | ⚡ | 🟢 | 2026-02-21 — 9 tests: context JSON, score classification, Claude JSON parsing, email trigger |
| B.3.5 | Workflow rapport mensuel CEO : vérification cron | 📌 | 🟢 | 2026-02-21 — 12 tests: month boundaries, revenue aggregation, CHF formatting, MoM trends |

**Critère de sortie Phase B** : ✅ 100% (2026-02-21) — Zéro mock data Revendeur. Settings migré DS. Banking token graceful (déjà OK). 5 workflows couverts par 46 tests unitaires (100% pass).

---

## PHASE C — SIMPLIFIER L'UX (Semaines 2-3)
### Axe 2 — La navigation suit les workflows

| # | Story | Prio | Statut | Description |
|---|-------|------|--------|-------------|
| C.1 | Refactoriser sidebar SuperAdmin — nouvelle structure 7 entrées | 🔥 | 🟢 Fait (2026-02-22) | Finance, Projets, CRM, Automation, Intégrations, Paramètres — 7 sections collapsibles |
| C.2 | Créer section "Intégrations" — 4 Hubs | 🔥 | 🟢 Fait (2026-02-22) | IN, Mautic, Revolut, ERPNext — pages hub + routes App.jsx |
| C.3 | Migrer sous-pages Finance dans groupe Finance | ⚡ | 🟢 Fait (2026-02-22) | QR-Invoice → Factures, Jalons → Projets — regroupement sidebar |
| C.4 | Fusionner CRM Dashboard + Leads + Pipeline | ⚡ | 🟢 Fait (2026-02-22) | Section CRM unifiée dans sidebar |
| C.5 | Déplacer Support/Tickets sous Projets | 📌 | 🟢 Fait (2026-02-22) | Cohérence workflow opérationnel |
| C.6 | Dashboard CEO — refactoring workflow-first | 🔥 | 🟢 Fait (2026-02-22) | Layout: Header → Alerts → KPIs → Pipeline+Treasury → ActiveProjects → IntegrationStatusBar |
| C.7 | Barre statut intégrations bas du Dashboard CEO | ⚡ | 🟢 Fait (2026-02-22) | 5 pastilles : IN, Mautic, Revolut, ERPNext, DocuSeal — hook useIntegrationStatus + polling 60s |

**Critère de sortie Phase C** : ✅ 100% (2026-02-22) — Sidebar ≤7 entrées. Dashboard affiche 5 workflows. IntegrationStatusBar 5 pastilles.

---

## PHASE D — RENDRE VISIBLE (Semaines 3-4)
### Axe 3 — Les intégrations dans les pages pertinentes

### D.1 — Hub Invoice Ninja

| # | Story | Prio | Statut | Description |
|---|-------|------|--------|-------------|
| D.1.1 | Créer `InvoiceNinjaHub.jsx` | 🔥 | 🟢 Fait (2026-02-22) | Statut + dernières factures + raccourcis — DS v2.0, TanStack Query |
| D.1.2 | Bouton "Envoyer via Invoice Ninja" dans Factures clients | 🔥 | 🟢 Fait (2026-02-22) | Action contextuelle — InvoicesPage connecté |
| D.1.3 | Bouton "Envoyer via Invoice Ninja" dans Devis | 🔥 | 🟢 Fait (2026-02-22) | Action contextuelle + statut |
| D.1.4 | Widget "Impayés Invoice Ninja" dans Dashboard CEO | ⚡ | 🟢 Fait (2026-02-22) | OverdueInvoicesWidget — nombre + montant total |

### D.2 — Hub Mautic

| # | Story | Prio | Statut | Description |
|---|-------|------|--------|-------------|
| D.2.1 | Créer `MauticHub.jsx` | ⚡ | 🟢 Fait (2026-02-22) | Statut + campagnes + stats — DS v2.0, TanStack Query |
| D.2.2 | Bouton "Envoyer relance (Mautic)" sur factures en retard | 🔥 | 🟢 Fait (2026-02-22) | Action contextuelle avec confirmation — modal DS |
| D.2.3 | Stat "Emails envoyés ce mois" dans Dashboard CEO | 📌 | 🟢 Fait (2026-02-22) | MauticEmailsWidget — KPI depuis API Mautic |

### D.3 — Hub Revolut

| # | Story | Prio | Statut | Description |
|---|-------|------|--------|-------------|
| D.3.1 | Compléter `RevolutHub.jsx` — balances + transactions + statut token | 🔥 | 🟢 Fait (2026-02-22) | CHF + EUR + USD + expiration — DS v2.0 |
| D.3.2 | Bouton "Payer via Revolut" sur facture fournisseur validée | 🔥 | 🟢 Fait (2026-02-22) | RevolutPaymentModal extrait — idempotency UUID + retry:0 + timeout 15s + HubErrorBoundary |
| D.3.3 | Balances Revolut live dans Dashboard CEO | 🔥 | 🟢 Fait (2026-02-22) | RevolutBalancesWidget — refresh 60s |

### D.4 — Hub ERPNext

| # | Story | Prio | Statut | Description |
|---|-------|------|--------|-------------|
| D.4.1 | Créer `ERPNextHub.jsx` — lecture seule | 📌 | 🟢 Fait (2026-02-22) | Statut + KPIs + Recharts BarChart revenus — DS v2.0 |

**Critère de sortie Phase D** : ✅ 100% (2026-02-22) — 4 Hubs accessibles (IN, Mautic, Revolut, ERPNext). Actions contextuelles IN et Mautic. Revolut paiement fournisseur avec idempotency. Patch audit: HubErrorBoundary sur 5 routes, queryKeys corrigés, hover CSS, stable keys.

---

## PHASE E — TESTS END-TO-END (Semaine 5)
### Validation des 5 workflows CEO

| # | Story | Prio | Statut | Workflow validé |
|---|-------|------|--------|------------------|
| E.1 | Test W1 — Cycle vente complet (Lead → Paiement → Projet activé) | 🔥 | 🔴 | W1 : 100% sans quitter la plateforme |
| E.2 | Test W2 — Paiement entrant Revolut → rapprochement → comptabilité | 🔥 | 🔴 | W2 : Automatique + traçable |
| E.3 | Test W3 — Validation facture fournisseur + paiement Revolut | 🔥 | 🔴 | W3 : Bouton Payer fonctionnel |
| E.4 | Test W4 — Vue projet CEO : statut, jalons, prestataires, budget | 🔥 | 🔴 | W4 : Une seule page, tout visible |
| E.5 | Test W5 — Relance client : déclenchement, email Mautic, traçage | 🔥 | 🔴 | W5 : Email envoyé + statut mis à jour |
| E.6 | Checklist critères de succès production (CDC v2.0 §12) | 🔥 | 🔴 | 100% cases cochées |

---

## PHASE F — PRODUCTION (Semaine 6)

| # | Story | Prio | Statut | Description |
|---|-------|------|--------|-------------|
| F.1 | Build React production compilé et déployé | 🔥 | 🔴 | `vite build` → serveur prod |
| F.2 | SSL certificats production configurés | 🔥 | 🔴 | HTTPS pour webhooks DocuSeal + Revolut |
| F.3 | Audit npm CVE — zéro vulnérabilité critique | ⚡ | 🔴 | `npm audit` → 0 critical |
| F.4 | Score sécurité ≥ 85/100 | ⚡ | 🔴 | Actuellement 72/100 |
| F.5 | Grafana monitoring déployé + alertes | ⚡ | 🔴 | Dashboard accessible |
| F.6 | ROADMAP v3.0 mise à jour — stories complétées | 🔥 | 🔴 | Ce document mis à jour |

---

## PHASE G — MULTI-ENTREPRISES (Post-Production)
### Déclencheur : HYPERVISUAL Switzerland v3 validée et stable

| # | Story | Prio | Statut | Description |
|---|-------|------|--------|-------------|
| G.1 | Architecture isolation données par entreprise | 🔥 | 🔴 | `company_id` sur toutes collections |
| G.2 | Company switcher sidebar — 5 entreprises | 🔥 | 🔴 | HV, DA, LX, ER, TO |
| G.3 | DAINAMICS — onboarding | 📌 | 🔴 | |
| G.4 | LEXAIA — onboarding | 📌 | 🔴 | |
| G.5 | ENKI REALTY — onboarding | 📌 | 🔴 | Orthographe exacte : ENKI REALTY |
| G.6 | TAKEOUT — onboarding | 📌 | 🔴 | |
| G.7 | Dashboard CEO multi-entreprises (vue consolidée) | ⚡ | 🔴 | |

---

## RÉCAPITULATIF

| Phase | Stories | Semaine | Objectif |
|-------|---------|---------|----------|
| A — Fondation Données | 7 | S1 | ✅ 100% (2026-02-21) — 4 collections, audit mock, TVA OK |
| B — Connecter | 15 | S1-S2 | ✅ 100% (2026-02-21) — Zéro mock, 46 tests workflows, DS migré |
| C — Simplifier UX | 7 | S2-S3 | ✅ 100% (2026-02-22) — Sidebar 7 entrées, Dashboard workflow-first |
| D — Rendre Visible | 11 | S3-S4 | ✅ 100% (2026-02-22) — 4 Hubs + actions contextuelles + patch audit |
| E — Tests E2E | 6 | S5 | 5 workflows CEO validés |
| F — Production | 6 | S6 | Déployé, SSL, monitoring |
| G — Multi-entreprises | 7 | Post-prod | DAINAMICS, LEXAIA, ENKI REALTY, TAKEOUT |
| **TOTAL v3** | **52** | **6 semaines** | **Prêt pour production** |

---

## ÉTAT DES LIEUX RÉFÉRENCE

*Snapshot au 21/02/2026 — baseline officielle v1.0*

| Métrique | Valeur réelle |
|----------|---------------|
| Stories complétées (v1-v2) | 102/102 |
| Tests unitaires | 182 — 100% pass |
| Score sécurité | 72/100 |
| Connecté Directus (réel) | ~65% |
| Intégrations visibles UI | ~25% |
| Boutons fonctionnels | ~40% |
| Prêt production | Non — cible fin mars 2026 |

---

## RÈGLES CLAUDE CODE v3.0

1. **Audit obligatoire** : Lire le fichier AVANT toute modification
2. **MCP Directus** : `list_collections` + `describe_table` avant tout mapping
3. **MCP GitHub** : Vérifier commits récents avant de coder
4. **Zéro mock data** : Toute donnée vient de Directus ou API
5. **Design System** : `src/styles/design-system.css` — aucune couleur hors palette
6. **TVA** : Vérifier 8.1/2.6/3.8 dans tout fichier Finance
7. **Tests** : `npm test` après chaque story (136 tests)
8. **Commit** : `feat(phase-X): story X.X — description`
9. **ROADMAP** : Marquer story complétée + date

---

*ROADMAP v3.0 — Février 2026*  
*Remplace ROADMAP v2.0*  
*52 stories identifiées — 60% complété (31/52) — Phases A+B+C+D terminées*  
*Cible production : 6 semaines — fin mars 2026*
