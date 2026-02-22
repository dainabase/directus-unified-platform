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
| A.2 | Créer collection `commissions` — schéma CDC v2.0 §7.1 | 🔥 | 🟢 | 2026-02-21 — 15 champs + 3 M2O (reseller_id→people, deal_id→projects, invoice_id→client_invoices). Ajoutés: base_amount, payment_ref. Status enum +validated. deal_id corrigé quotes→projects |
| A.3 | Créer/compléter collection `messages` — schéma CDC v2.0 §7.2 | 🔥 | 🟢 | 2026-02-22 — 10 champs: +date_updated, +owner_company, attachments default=[]. 3 M2O (sender_id→directus_users, recipient_id→directus_users, project_id→projects) |
| A.4 | Créer/compléter collection `knowledge_base` — schéma CDC v2.0 §7.3 | ⚡ | 🟢 | 2026-02-22 — 15 champs: +published, +featured_image, +tags, +owner_company. category enum étendu (+led,totem,hologramme,software,general). attachments default=[] |
| A.5 | Créer/compléter collection `email_templates` — schéma CDC v2.0 §7.4 | ⚡ | 🟢 | 2026-02-22 — 16 champs: +type enum, +mautic_id, +owner_company. variables default=[]. language enum [fr,de,en] OK |
| A.6 | Audit mock data : inventaire complet fichiers JSX avec données hardcodées | 🔥 | 🟢 | 2026-02-22 — 9 P0 + 7 P1 + 2 modules sans API → `docs/MOCK-DATA-INVENTORY.md` |
| A.7 | Vérifier taux TVA dans TOUS les fichiers (aucun 7.7, 2.5, 3.7 résiduel) | 🔥 | 🟢 | 2026-02-22 — 0 violation. Anciens taux uniquement dans PREVIOUS historique + tests non-régression. 191 fichiers vérifiés. |

**Critère de sortie Phase A** : ✅ Toutes les collections existent. Inventaire mock data documenté. Taux TVA conformes.

---

## PHASE B — CONNECTER (Semaines 1-2)
### Axe 1 — Tout ce qui est codé devient fonctionnel

### B.1 — Élimination Mock Data

| # | Story | Prio | Statut | Fichier(s) |
|---|-------|------|--------|------------|
| B.1.1 | Connecter `CommissionsPage.jsx` → collection `commissions` Directus | 🔥 | 🟢 2026-02-22 | Déjà connecté (CommissionsRevendeur.jsx) |
| B.1.2 | Connecter `Dashboard.jsx` (Revendeur) → commissions réelles | 🔥 | 🟢 2026-02-22 | Dashboard.jsx orphelin supprimé, RevendeurDashboard.jsx connecté |
| B.1.3 | Connecter `Marketing.jsx` (Revendeur) → `email_templates` + Mautic API | ⚡ | 🟢 2026-02-22 | Déjà connecté (MarketingRevendeur.jsx) |
| B.1.4 | Corriger `BudgetManager` → données réelles uniquement | ⚡ | 🟢 2026-02-22 | Déjà connecté avec fallback cascading |
| B.1.5 | Vérifier `WorkflowsPage.jsx` → statuts réels Directus Flows | 📌 | 🟢 2026-02-22 | Connecté à workflow_executions |

### B.2 — Pages Déconnectées

| # | Story | Prio | Statut | Description |
|---|-------|------|--------|-------------|
| B.2.1 | Corriger page Paramètres/Settings | 🔥 | 🟢 2026-02-22 | IntegrationsSettings save wired to API |
| B.2.2 | Banking Dashboard — gestion gracieuse token expiré | 🔥 | 🟢 2026-02-22 | TokenExpired/Warning renders + 60s polling |
| B.2.3 | Module 24 Messagerie — fonctionnement avec `messages` | ⚡ | 🟢 2026-02-22 | Déjà connecté (useQuery + useMutation) |
| B.2.4 | Module 22 Base de connaissances — connecter `knowledge_base` | ⚡ | 🟢 2026-02-22 | Déjà connecté (graceful 403/404) |
| B.2.5 | Module 20 Email Templates — sync Mautic vérifiée | ⚡ | 🟢 2026-02-22 | Déjà connecté (CRUD + Mautic sync) |

### B.3 — Validation Workflows en Conditions Réelles

| # | Story | Prio | Statut | Description |
|---|-------|------|--------|-------------|
| B.3.1 | Workflow DocuSeal → facture acompte : test vrai document | 🔥 | 🟢 2026-02-22 | 13 tests: webhook signature HMAC, payload extraction, deposit calculation, idempotency |
| B.3.2 | Workflow Revolut → activation projet : test vraie transaction | 🔥 | 🟢 2026-02-22 | 20 tests: HMAC SHA-256 + timingSafeEqual, replay protection, invoice matching, project activation |
| B.3.3 | Workflow relances automatiques : vérification cron | ⚡ | 🟢 2026-02-22 | 10 tests: Mahnung 1/2/3 Swiss SchKG, deduplication, due date fallback, escalation sequence |
| B.3.4 | Workflow lead qualification LLM : test vrai lead | ⚡ | 🟢 2026-02-22 | 14 tests: Claude AI JSON parsing, markdown fallback, score thresholds, exponential backoff |
| B.3.5 | Workflow rapport mensuel CEO : vérification cron | 📌 | 🟢 2026-02-22 | 20 tests: date boundaries, CHF formatting, MoM trend, conversion rate, CRON scheduling |

**Critère de sortie Phase B** : Zéro mock data visible. Settings fonctionnel. Banking graceful. 5 workflows testés en réel.

---

## PHASE C — SIMPLIFIER L'UX (Semaines 2-3)
### Axe 2 — La navigation suit les workflows

| # | Story | Prio | Statut | Description |
|---|-------|------|--------|-------------|
| C.1 | Refactoriser sidebar SuperAdmin — nouvelle structure 7 entrées | 🔥 | 🟢 Fait (2026-02-22) | Finance, Projets, CRM, Automation, Intégrations, Paramètres — 7 sections collapsibles |
| C.2 | Créer section "Intégrations" —  4 Hubs | 🔥 | 🟢 Fait (2026-02-22) | IN, Mautic, Revolut, ERPNext — pages hub + routes App.jsx |
| C.3 | Migrer sous-pages Finance dans groupe Finance | ⚡ | 🟢 Fait (2026-02-22) | QR-Invoice → Factures, Jalons → Projets — regroupement sidebar |
| C.4 | Fusionner CRM Dashboard + Leads + Pipeline | ⚡ | 🟢 Fait (2026-02-22) | Section CRM unifiée dans sidebar |
| C.5 | Déplacer Support/Tickets sous Projets | 📌 | 🟢 Fait (2026-02-22) | Cohérence workflow opérationnel |
| C.6 | Dashboard CEO — refactoring workflow-first | 🔥 | 🟢 Fait (2026-02-22) | Layout: Header → Alerts → KPIs → Pipeline+Treasury → ActiveProjects → IntegrationStatusBar |
| C.7 | Barre statut intégrations bas du Dashboard CEO | ⚡ | 🟢 Fait (2026-02-22) | 5 pastilles : IN, Mautic, Revolut, ERPNext, DocuSeal — hook useIntegrationStatus + polling 60s |

**Critère de sortie Phase C** : Sidebar ≤7 entrées. Dashboard affiche 5 workflows.

---

## PHASE D — RENDRE VISIBLE (Semaines 3-4)
### Axe 3 — Les intégrations dans les pages pertinentes

### D.1 — Hub Invoice Ninja

| # | Story | Prio | Statut | Description |
|---|-------|------|--------|-------------|
| D.1.1 | Créer `InvoiceNinjaHub.jsx` | 🔥 | 🟢 2026-02-22 | Statut + dernières factures + raccourcis — DS v2.0 rewrite complet |
| D.1.2 | Bouton "Envoyer via Invoice Ninja" dans Factures clients | 🔥 | 🟢 2026-02-22 | Action contextuelle dans InvoicesPage |
| D.1.3 | Bouton "Envoyer via Invoice Ninja" dans Devis | 🔥 | 🟢 2026-02-22 | Action contextuelle + conversion dans QuotesModule |
| D.1.4 | Widget "Impayés Invoice Ninja" dans Dashboard CEO | ⚡ | 🟢 2026-02-22 | OverdueInvoicesWidget — nombre + montant, polling 60s |

### D.2 — Hub Mautic

| # | Story | Prio | Statut | Description |
|---|-------|------|--------|-------------|
| D.2.1 | Créer `MauticHub.jsx` | ⚡ | 🟢 2026-02-22 | Statut + campagnes + stats — live data via /api/mautic/* |
| D.2.2 | Bouton "Envoyer relance (Mautic)" sur factures en retard | 🔥 | 🟢 2026-02-22 | Action contextuelle avec confirmation dans InvoicesPage |
| D.2.3 | Stat "Emails envoyés ce mois" dans Dashboard CEO | 📌 | 🟢 2026-02-22 | MauticEmailsWidget — KPI polling 60s |

### D.3 — Hub Revolut

| # | Story | Prio | Statut | Description |
|---|-------|------|--------|-------------|
| D.3.1 | Compléter `RevolutHub.jsx` — balances + transactions + statut token | 🔥 | 🟢 2026-02-22 | CHF + EUR + USD + token warning + transactions list |
| D.3.2 | Bouton "Payer via Revolut" sur facture fournisseur validée | 🔥 | 🟢 2026-02-22 | Flow 3 étapes : vérification → confirmation → résultat |
| D.3.3 | Balances Revolut live dans Dashboard CEO | 🔥 | 🟢 2026-02-22 | RevolutBalancesWidget — solde CHF, polling 60s |

### D.4 — Hub ERPNext

| # | Story | Prio | Statut | Description |
|---|-------|------|--------|-------------|
| D.4.1 | Créer `ERPNextHub.jsx` — lecture seule | 📌 | 🟢 2026-02-22 | 6 KPIs (revenus, dépenses, GL, stock, employés, commandes) + activités + chart revenus |

**Critère de sortie Phase D** : ✅ 4 Hubs accessibles. Actions contextuelles IN et Mautic. Revolut paiement fournisseur fonctionnel.

---

## PHASE E — TESTS END-TO-END (Semaine 5)
### Validation des 5 workflows CEO

| # | Story | Prio | Statut | Workflow validé |
|---|-------|------|--------|------------------|
| E.1 | Test W1 — Cyle vente complet (Lead → Paiement → Projet activé) | 🔥 | 🔴 | W1 : 100% sans quitter la plateforme |
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
| G.6 | TAKEOUT ��

## RÉCAPITULATIF

| Phase | Stories | Semaine | Objectif |
|-------|---------|---------|----------|
| A — Fondation Données | 7 | S1 | ✅ 100% (2026-02-21) |
| B — Connecter | 15 | S1-S2 | ✅ 100% (2026-02-22) |
| C — Simplifier UX | 7 | S2-S3 | Sidebar ≤7, Dashboard workflow-first |
| D — Rendre Visible | 11 | S3-S4 | 4 Hubs + actions contextuelles |
| E — Tests E2E | 6 | S5 | 5 workflows CEO validés |
| F — Production | 6 | S6 | Déployé, SSL, monitoring |
| G — Multi-entreprises | 7 | Post-prod | DAINAMICS, LEXAIA, ENKI REALTR� TAHEOUT |
| **TOTAL v3** | **52** | **6 semaines** | **Prêt pour production** |

---

## ÉTAT DESLIEUX RÉFÉRENCE

*Snapshot au 21/02/2026 — baseline officielle v1.0*

| Métrique | Valeur réelle |
|----------|---------------|
| Stories complétées (v1-v2) | 102/102 |
| Tests unitaires | 213 — 100% pass |
| Score sécurité | 72/100 |
| Connecté Directus (p�el) | ~45% |
| Intégrations visibles UH | ~25% |
| Boutons fonctionnels | ~50% |
| Prêt production | Non — cible fin mars 2026 |

---

## RÈGLES CLAUDE CODE v3.0

1. **Audit obligatoire** : Lire le fichier AVANT toute modification
2. **MCP Directus** : `list_collections` + `describe_table` avant tout mapping
3. **MCP GitHub** : Vérifier commits råcents avant de coder
4. **Zéro mock data** : Toute donnée vient de Directus ou API
5. **Design System** : `src/styles/design-system.css` — aucune couleur hors palette
6. **TVA** : Vérifier 8.1/2.6/3.8 dans tout fichier Finance
7. **Tests** : `npm test` après chaque story (213 tests)
8. **Commit** : `feat(phase-X): story X.X — description`
9. **ROADMAP** : Marquer story complétée + date

---

*ROADMAP v3.0 — Février 2026*  
*Remplace ROADMAP v2.0*  
*52 stories identificées — 42% complété (22/52) - Phase A terminée, Phase B terminée*  
Cible production : 6 semaines — fin mars 2026
