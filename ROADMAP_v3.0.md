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
| A.1 | Vérifier via MCP : `messages`, `knowledge_base`, `email_templates` existent ? | 🔥 | 🔴 | Rapport MCP avec champs |
| A.2 | Créer collection `commissions` — schéma CDC v2.0 §7.1 | 🔥 | 🔴 | `describe_table commissions` OK |
| A.3 | Créer/compléter collection `messages` — schéma CDC v2.0 §7.2 | 🔥 | 🔴 | Tous champs requis présents |
| A.4 | Créer/compléter collection `knowledge_base` — schéma CDC v2.0 §7.3 | ⚡ | 🔴 | Tous champs requis présents |
| A.5 | Créer/compléter collection `email_templates` — schéma CDC v2.0 §7.4 | ⚡ | 🔴 | Tous champs requis présents |
| A.6 | Audit mock data : inventaire complet fichiers JSX avec données hardcodées | 🔥 | 🔴 | Liste exhaustive chemin + ligne |
| A.7 | Vérifier taux TVA dans TOUS les fichiers (aucun 7.7, 2.5, 3.7 résiduel) | 🔥 | 🔴 | grep retourne 0 résultat TVA |

**Critère de sortie Phase A** : Toutes les collections existent. Inventaire mock data complet. Zéro ancien taux TVA.

---

## PHASE B — CONNECTER (Semaines 1-2)
### Axe 1 — Tout ce qui est codé devient fonctionnel

### B.1 — Élimination Mock Data

| # | Story | Prio | Statut | Fichier(s) |
|---|-------|------|--------|------------|
| B.1.1 | Connecter `CommissionsPage.jsx` → collection `commissions` Directus | 🔥 | 🔴 | `src/portals/revendeur/CommissionsPage.jsx` |
| B.1.2 | Connecter `Dashboard.jsx` (Revendeur) → commissions réelles | 🔥 | 🔴 | `src/portals/revendeur/Dashboard.jsx` |
| B.1.3 | Connecter `Marketing.jsx` (Revendeur) → `email_templates` + Mautic API | ⚡ | 🔴 | `src/portals/revendeur/Marketing.jsx` |
| B.1.4 | Corriger `BudgetManager` → données réelles uniquement | ⚡ | 🔴 | Fichier BudgetManager |
| B.1.5 | Vérifier `WorkflowsPage.jsx` → statuts réels Directus Flows | 📌 | 🔴 | Automation/WorkflowsPage.jsx |

### B.2 — Pages Déconnectées

| # | Story | Prio | Statut | Description |
|---|-------|------|--------|-------------|
| B.2.1 | Corriger page Paramètres/Settings | 🔥 | 🔴 | Endpoints API + Directus config |
| B.2.2 | Banking Dashboard — gestion gracieuse token expiré | 🔥 | 🔴 | Banner orange + bouton reconnexion OAuth2 |
| B.2.3 | Module 24 Messagerie — fonctionnement avec `messages` | ⚡ | 🔴 | MessagesPage.jsx |
| B.2.4 | Module 22 Base de connaissances — connecter `knowledge_base` | ⚡ | 🔴 | KnowledgePage.jsx |
| B.2.5 | Module 20 Email Templates — sync Mautic vérifiée | ⚡ | 🔴 | EmailTemplatesPage.jsx |

### B.3 — Validation Workflows en Conditions Réelles

| # | Story | Prio | Statut | Description |
|---|-------|------|--------|-------------|
| B.3.1 | Workflow DocuSeal → facture acompte : test vrai document | 🔥 | 🔴 | Webhook reçu + facture Invoice Ninja + email Mautic |
| B.3.2 | Workflow Revolut → activation projet : test vraie transaction | 🔥 | 🔴 | Webhook HMAC + projet activé + email client |
| B.3.3 | Workflow relances automatiques : vérification cron | ⚡ | 🔴 | Email Mautic + statut tracé |
| B.3.4 | Workflow lead qualification LLM : test vrai lead | ⚡ | 🔴 | Lead qualifié + email confirmation |
| B.3.5 | Workflow rapport mensuel CEO : vérification cron | 📌 | 🔴 | Rapport généré + envoyé |

**Critère de sortie Phase B** : Zéro mock data visible. Settings fonctionnel. Banking graceful. 5 workflows testés en réel.

---

## PHASE C — SIMPLIFIER L'UX (Semaines 2-3)
### Axe 2 — La navigation suit les workflows

| # | Story | Prio | Statut | Description |
|---|-------|------|--------|-------------|
| C.1 | Refactoriser sidebar SuperAdmin — nouvelle structure 7 entrées | 🔥 | 🔴 | Finance, Projets, CRM, Automation, Intégrations, Paramètres |
| C.2 | Créer section "Intégrations" — 4 Hubs | 🔥 | 🔴 | IN, Mautic, Revolut, ERPNext |
| C.3 | Migrer sous-pages Finance dans groupe Finance | ⚡ | 🔴 | QR-Invoice → Factures, Jalons → Projets |
| C.4 | Fusionner CRM Dashboard + Leads + Pipeline | ⚡ | 🔴 | Suppression CRM Dashboard standalone |
| C.5 | Déplacer Support/Tickets sous Projets | 📌 | 🔴 | Cohérence workflow opérationnel |
| C.6 | Dashboard CEO — refactoring workflow-first | 🔥 | 🔴 | Layout 5 workflows (CDC v2.0 §3.3) |
| C.7 | Barre statut intégrations bas du Dashboard CEO | ⚡ | 🔴 | 4 pastilles : IN, Mautic, Revolut, ERPNext |

**Critère de sortie Phase C** : Sidebar ≤7 entrées. Dashboard affiche 5 workflows.

---

## PHASE D — RENDRE VISIBLE (Semaines 3-4)
### Axe 3 — Les intégrations dans les pages pertinentes

### D.1 — Hub Invoice Ninja

| # | Story | Prio | Statut | Description |
|---|-------|------|--------|-------------|
| D.1.1 | Créer `InvoiceNinjaHub.jsx` | 🔥 | 🔴 | Statut + dernières factures + raccourcis |
| D.1.2 | Bouton "Envoyer via Invoice Ninja" dans Factures clients | 🔥 | 🔴 | Action contextuelle |
| D.1.3 | Bouton "Envoyer via Invoice Ninja" dans Devis | 🔥 | 🔴 | Action contextuelle + statut |
| D.1.4 | Widget "Impayés Invoice Ninja" dans Dashboard CEO | ⚡ | 🔴 | Nombre + montant total |

### D.2 — Hub Mautic

| # | Story | Prio | Statut | Description |
|---|-------|------|--------|-------------|
| D.2.1 | Créer `MauticHub.jsx` | ⚡ | 🔴 | Statut + campagnes + stats |
| D.2.2 | Bouton "Envoyer relance (Mautic)" sur factures en retard | 🔥 | 🔴 | Action contextuelle avec confirmation |
| D.2.3 | Stat "Emails envoyés ce mois" dans Dashboard CEO | 📌 | 🔴 | KPI depuis API Mautic |

### D.3 — Hub Revolut

| # | Story | Prio | Statut | Description |
|---|-------|------|--------|-------------|
| D.3.1 | Compléter `RevolutHub.jsx` — balances + transactions + statut token | 🔥 | 🔴 | CHF + EUR + USD + expiration |
| D.3.2 | Bouton "Payer via Revolut" sur facture fournisseur validée | 🔥 | 🔴 | Flow : validation → montant → confirmation → paiement |
| D.3.3 | Balances Revolut live dans Dashboard CEO | 🔥 | 🔴 | Refresh 60s |

### D.4 — Hub ERPNext

| # | Story | Prio | Statut | Description |
|---|-------|------|--------|-------------|
| D.4.1 | Créer `ERPNextHub.jsx` — lecture seule | 📌 | 🔴 | Statut + stock critique + RH |

**Critère de sortie Phase D** : 4 Hubs accessibles. Actions contextuelles IN et Mautic. Revolut paiement fournisseur fonctionnel.

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
| A — Fondation Données | 7 | S1 | Collections créées, mock data inventorié |
| B — Connecter | 15 | S1-S2 | Zéro mock, workflows testés en réel |
| C — Simplifier UX | 7 | S2-S3 | Sidebar ≤7, Dashboard workflow-first |
| D — Rendre Visible | 11 | S3-S4 | 4 Hubs + actions contextuelles |
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
| Tests unitaires | 136 — 100% pass |
| Score sécurité | 72/100 |
| Connecté Directus (réel) | ~45% |
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
*52 stories identifiées — 0% complété (baseline a59152d)*  
*Cible production : 6 semaines — fin mars 2026*
