# SKILLS-MAPPING-ROADMAP — HYPERVISUAL Unified Platform
## Mapping Architecte → Skills Claude Code par Story (Phases B-G)

**Version** : 1.0  
**Date** : 21 février 2026  
**Auteur** : Jean (CEO / Architecte) via analyse complète 939 skills  
**Usage** : Ce document est la **référence unique** pour la sélection des skills dans tous les prompts Claude Code. L'Architecte pré-sélectionne les skills. Claude Code ne choisit plus.

> **Règle critique** : Chaque prompt Claude Code doit inclure EXACTEMENT les skills listés ci-dessous pour sa story, ni plus ni moins. Les chemins sont absolus et vérifiés.

---

## ABRÉVIATIONS CHEMINS

Pour alléger la lecture, les préfixes longs sont abrégés :

| Alias | Chemin réel |
|-------|-------------|
| `[CUSTOM]` | `/Users/jean-mariedelaunay/.claude/skills/` |
| `[PLUGINS]` | `/Users/jean-mariedelaunay/.claude/skills-repos/claude-code-plugins-plus-skills/skills/` |
| `[JEFF]` | `/Users/jean-mariedelaunay/.claude/skills-repos/jeffallan-claude-skills/skills/` |
| `[ALI]` | `/Users/jean-mariedelaunay/.claude/skills-repos/alirezarezvanhi-claude-skills/` |

---

## SKILLS DE BASE — TOUJOURS PRÉSENTS (OBLIGATOIRES DANS TOUT PROMPT)

Ces 2 skills sont inclus dans **chaque** prompt Claude Code, sans exception :

```
SKILL-BASE-1 : directus-api-patterns
→ [CUSTOM]directus-api-patterns/SKILL.md
→ Raison : Toute story touche Directus. ItemsService, filtres, relations.

SKILL-BASE-2 : swiss-compliance-engine  
→ [CUSTOM]swiss-compliance-engine/SKILL.md
→ Raison : TVA 8.1/2.6/3.8 — vérification obligatoire à chaque story Finance/Legal.
```

---

## PHASE B — CONNECTER (15 stories)
### Semaines 1-2 | Priorité : Zéro mock data, workflows testés en réel

---

### B.1.1 — CommissionsPage.jsx → collection `commissions` Directus

**Domaine** : Frontend + Database  
**Risque** : Affichage données incorrectes (anciennement 100% mock)

| # | Skill | Chemin | Justification |
|---|-------|--------|---------------|
| 1 | `directus-api-patterns` | [CUSTOM]directus-api-patterns/SKILL.md | CRUD collection commissions — M2O vers contacts et projects |
| 2 | `react-expert` | [JEFF]react-expert/SKILL.md | Hooks, polling 30s, skeleton loader, cleanup intervals |

**MCP obligatoires** : `directus:describe_table commissions` avant de coder  
**Plugins** : Aucun  
**TVA** : ❌ Non applicable

---

### B.1.2 — Dashboard Revendeur → commissions réelles

**Domaine** : Frontend + Database  
**Risque** : Dashboard vide ou données incohérentes

| # | Skill | Chemin | Justification |
|---|-------|--------|---------------|
| 1 | `directus-api-patterns` | [CUSTOM]directus-api-patterns/SKILL.md | Requête agrégée commissions par revendeur |
| 2 | `react-expert` | [JEFF]react-expert/SKILL.md | State management, useEffect propre |
| 3 | `ceo-dashboard-designer` | [CUSTOM]ceo-dashboard-designer/SKILL.md | Layout KPI widgets cohérent avec le dashboard CEO |

**MCP obligatoires** : `directus:list_collections`, `directus:describe_table commissions`  
**Plugins** : Aucun  
**TVA** : ❌ Non applicable

---

### B.1.3 — Marketing.jsx (Revendeur) → email_templates Directus + Mautic API

**Domaine** : Frontend + API Integration  
**Risque** : Sync Mautic non fonctionnelle si collection mal connectée

| # | Skill | Chemin | Justification |
|---|-------|--------|---------------|
| 1 | `directus-api-patterns` | [CUSTOM]directus-api-patterns/SKILL.md | Lecture collection email_templates |
| 2 | `integration-sync-engine` | [CUSTOM]integration-sync-engine/SKILL.md | Appels API Mautic pour templates — patterns auth + retry |
| 3 | `react-expert` | [JEFF]react-expert/SKILL.md | Composants liste templates + error states |
| 4 | `api-client-generator` | [PLUGINS]16-api-integration/api-client-generator/SKILL.md | Client Mautic propre avec timeout, retry, error handling |

**MCP obligatoires** : `directus:describe_table email_templates`  
**Plugins** : Aucun  
**TVA** : ❌ Non applicable

---

### B.1.4 — BudgetManager → suppression fallback, données réelles uniquement

**Domaine** : Frontend + Database  
**Risque** : Affichage silencieux de zéros si collections vides

| # | Skill | Chemin | Justification |
|---|-------|--------|---------------|
| 1 | `directus-api-patterns` | [CUSTOM]directus-api-patterns/SKILL.md | Requêtes collections budgets, kpis |
| 2 | `react-expert` | [JEFF]react-expert/SKILL.md | Error boundaries, empty states explicites (jamais de fallback silencieux) |

**MCP obligatoires** : `directus:list_collections` pour identifier budgets/kpis  
**Plugins** : Aucun  
**TVA** : ❌ Non applicable

---

### B.1.5 — WorkflowsPage.jsx → statuts réels Directus Flows

**Domaine** : Frontend + API  
**Risque** : États fictifs trompeurs — CEO pense workflow actif quand il ne l'est pas

| # | Skill | Chemin | Justification |
|---|-------|--------|---------------|
| 1 | `directus-api-patterns` | [CUSTOM]directus-api-patterns/SKILL.md | Polling statut Directus Flows via /flows endpoint |
| 2 | `react-expert` | [JEFF]react-expert/SKILL.md | Polling 30s propre avec cleanup, statuts visuels clairs |
| 3 | `api-health-checker` | [PLUGINS]16-api-integration/api-health-checker/SKILL.md | Vérification statut endpoint flows — online/offline/degraded |

**MCP obligatoires** : `directus:list_collections`  
**Plugins** : Aucun  
**TVA** : ❌ Non applicable

---

### B.2.1 — Page Paramètres/Settings → toutes actions connectées

**Domaine** : Frontend + Backend  
**Risque** : Actions Settings qui ne persistent pas — confusion CEO

| # | Skill | Chemin | Justification |
|---|-------|--------|---------------|
| 1 | `directus-api-patterns` | [CUSTOM]directus-api-patterns/SKILL.md | Lecture/écriture config Directus (settings collection) |
| 2 | `react-expert` | [JEFF]react-expert/SKILL.md | Formulaires controlled, toast confirmations |
| 3 | `express-route-generator` | [PLUGINS]06-backend-dev/express-route-generator/SKILL.md | Endpoints Express pour settings qui n'ont pas d'API Directus native |

**MCP obligatoires** : `directus:describe_table settings` ou équivalent  
**Plugins** : Aucun  
**TVA** : ❌ Non applicable

---

### B.2.2 — Banking Dashboard → gestion gracieuse token Revolut expiré

**Domaine** : Frontend + Backend + Cache  
**Risque** : 🔥 Page blanche = CEO aveugle sur la trésorerie. Token expire toutes les 40min.

| # | Skill | Chemin | Justification |
|---|-------|--------|---------------|
| 1 | `redis-cache-manager` | [PLUGINS]06-backend-dev/redis-cache-manager/SKILL.md | **CRITIQUE** — Token OAuth Revolut doit être stocké Redis côté backend (pas localStorage) |
| 2 | `integration-sync-engine` | [CUSTOM]integration-sync-engine/SKILL.md | OAuth2 Revolut — détection expiration + refresh flow |
| 3 | `react-expert` | [JEFF]react-expert/SKILL.md | Dégradation gracieuse UI : banner orange, bouton reconnexion, dernière valeur connue |
| 4 | `api-health-checker` | [PLUGINS]16-api-integration/api-health-checker/SKILL.md | Healthcheck token avant chaque requête Revolut |

**MCP obligatoires** : Aucun spécifique  
**Plugins** : Aucun  
**TVA** : ❌ Non applicable  
**⚠️ Note architecte** : La gestion token DOIT être backend (Redis). Jamais localStorage. C'était l'oubli critique de l'analyse précédente.

---

### B.2.3 — Module 24 Messagerie → collection `messages`

**Domaine** : Frontend + Database + Temps réel  
**Risque** : Messages perdus ou non affichés si collection mal mappée

| # | Skill | Chemin | Justification |
|---|-------|--------|---------------|
| 1 | `directus-api-patterns` | [CUSTOM]directus-api-patterns/SKILL.md | CRUD collection messages — M2O users et projects |
| 2 | `react-expert` | [JEFF]react-expert/SKILL.md | Optimistic updates, scroll-to-bottom, read_at tracking |
| 3 | `server-sent-events-setup` | [PLUGINS]16-api-integration/server-sent-events-setup/SKILL.md | Push temps réel pour nouveaux messages (pas de polling WebSocket complexe) |

**MCP obligatoires** : `directus:describe_table messages`  
**Plugins** : Aucun  
**TVA** : ❌ Non applicable

---

### B.2.4 — Module 22 Base de connaissances → collection `knowledge_base`

**Domaine** : Frontend + Database  
**Risque** : Faible — CRUD standard, mais vérification champs requise

| # | Skill | Chemin | Justification |
|---|-------|--------|---------------|
| 1 | `directus-api-patterns` | [CUSTOM]directus-api-patterns/SKILL.md | CRUD knowledge_base — filtres catégorie/tags |
| 2 | `react-expert` | [JEFF]react-expert/SKILL.md | Search/filter UI, pagination, markdown renderer |

**MCP obligatoires** : `directus:describe_table knowledge_base`  
**Plugins** : Aucun  
**TVA** : ❌ Non applicable

---

### B.2.5 — Module 20 Email Templates → sync Mautic vérifiée

**Domaine** : Frontend + API Integration  
**Risque** : Sync silencieuse — templates Directus et Mautic désynchronisés sans alerte

| # | Skill | Chemin | Justification |
|---|-------|--------|---------------|
| 1 | `directus-api-patterns` | [CUSTOM]directus-api-patterns/SKILL.md | Collection email_templates — champ mautic_id |
| 2 | `integration-sync-engine` | [CUSTOM]integration-sync-engine/SKILL.md | API Mautic — création/update template, vérification sync bidirectionnelle |
| 3 | `api-client-generator` | [PLUGINS]16-api-integration/api-client-generator/SKILL.md | Client Mautic robuste avec gestion erreurs |

**MCP obligatoires** : `directus:describe_table email_templates`  
**Plugins** : Aucun  
**TVA** : ❌ Non applicable

---

### B.3.1 — Workflow DocuSeal → facture acompte (test conditions réelles)

**Domaine** : Backend + API + Finance  
**Risque** : 🔥🔥 CRITIQUE — Argent réel. Facture acompte générée sans validation HMAC = faille sécurité.

| # | Skill | Chemin | Justification |
|---|-------|--------|---------------|
| 1 | `webhook-signature-validator` | [PLUGINS]16-api-integration/webhook-signature-validator/SKILL.md | **CRITIQUE SÉCURITÉ** — Validation HMAC webhook DocuSeal avant traitement |
| 2 | `webhook-receiver-generator` | [PLUGINS]16-api-integration/webhook-receiver-generator/SKILL.md | Endpoint Express propre pour recevoir webhook DocuSeal |
| 3 | `integration-sync-engine` | [CUSTOM]integration-sync-engine/SKILL.md | Chaîne complète : signature reçue → facture IN → email Mautic |
| 4 | `swiss-compliance-engine` | [CUSTOM]swiss-compliance-engine/SKILL.md | Facture acompte 30% : TVA 8.1%, QR-Invoice v2.3, montants corrects |
| 5 | `webhook-retry-handler` | [PLUGINS]16-api-integration/webhook-retry-handler/SKILL.md | Retry si Invoice Ninja ou Mautic indisponibles au moment de la signature |

**MCP obligatoires** : `directus:describe_table client_invoices`, `directus:describe_table quotes`  
**Plugins** : Aucun  
**TVA** : ✅ OBLIGATOIRE — 8.1% facture acompte

---

### B.3.2 — Workflow Revolut → activation projet (test conditions réelles)

**Domaine** : Backend + API + Finance + Cache  
**Risque** : 🔥🔥🔥 CRITIQUE — Transaction Revolut réelle. HMAC invalide = fraude possible.

| # | Skill | Chemin | Justification |
|---|-------|--------|---------------|
| 1 | `webhook-signature-validator` | [PLUGINS]16-api-integration/webhook-signature-validator/SKILL.md | **CRITIQUE SÉCURITÉ** — HMAC Revolut Business (RS256 + shared secret) |
| 2 | `webhook-receiver-generator` | [PLUGINS]16-api-integration/webhook-receiver-generator/SKILL.md | Endpoint Express pour webhooks paiement Revolut |
| 3 | `redis-cache-manager` | [PLUGINS]06-backend-dev/redis-cache-manager/SKILL.md | Idempotence : éviter activation double si webhook reçu 2x |
| 4 | `integration-sync-engine` | [CUSTOM]integration-sync-engine/SKILL.md | Matching facture → paiement → activation projet → email client |
| 5 | `swiss-compliance-engine` | [CUSTOM]swiss-compliance-engine/SKILL.md | Validation montant CHF/EUR, enregistrement comptable PME Käfer |

**MCP obligatoires** : `directus:describe_table bank_transactions`, `directus:describe_table projects`  
**Plugins** : `pci-dss-validator` (plugin actif — vérifier conformité données CB)  
**TVA** : ✅ OBLIGATOIRE — vérification montants facture/paiement

---

### B.3.3 — Workflow relances automatiques (cron J+7/J+14/J+30)

**Domaine** : Backend + API  
**Risque** : Relances non envoyées = perte trésorerie. Relances doublées = problème client.

| # | Skill | Chemin | Justification |
|---|-------|--------|---------------|
| 1 | `integration-sync-engine` | [CUSTOM]integration-sync-engine/SKILL.md | API Mautic — envoi email relance avec template + QR-Invoice |
| 2 | `directus-api-patterns` | [CUSTOM]directus-api-patterns/SKILL.md | Tracking statut relance (J+7/J+14/J+30) dans collection invoices |
| 3 | `swiss-compliance-engine` | [CUSTOM]swiss-compliance-engine/SKILL.md | QR-Invoice dans email relance — spec ISO 20022 v2.3 |

**MCP obligatoires** : `directus:describe_table client_invoices` (champs relance)  
**Plugins** : Aucun  
**TVA** : ✅ Vérification taux dans QR-Invoice généré

---

### B.3.4 — Workflow lead qualification LLM (test avec vrai lead)

**Domaine** : AI/ML + API  
**Risque** : Faible — qualification incorrecte = lead manqué, pas de risque financier direct

| # | Skill | Chemin | Justification |
|---|-------|--------|---------------|
| 1 | `integration-sync-engine` | [CUSTOM]integration-sync-engine/SKILL.md | Webhook lead entrant → appel Claude API → mise à jour Directus |
| 2 | `directus-api-patterns` | [CUSTOM]directus-api-patterns/SKILL.md | Écriture score + catégorie lead qualifié dans contacts |

**MCP obligatoires** : `directus:describe_table contacts` (champ score, qualification)  
**Plugins** : Aucun  
**TVA** : ❌ Non applicable

---

### B.3.5 — Workflow rapport mensuel CEO (cron 1er du mois)

**Domaine** : Analytics + AI  
**Risque** : Faible — rapport ne partant pas = gêne non bloquante

| # | Skill | Chemin | Justification |
|---|-------|--------|---------------|
| 1 | `ceo-dashboard-designer` | [CUSTOM]ceo-dashboard-designer/SKILL.md | Structure rapport CEO — KPIs, métriques, format |
| 2 | `financial-analyst` | [ALI]finance/financial-analyst/SKILL.md | Calculs MRR, ARR, cash flow, P&L mensuel |
| 3 | `directus-api-patterns` | [CUSTOM]directus-api-patterns/SKILL.md | Agrégations collections Finance pour période M-1 |

**MCP obligatoires** : `directus:list_collections` (finance)  
**Plugins** : Aucun  
**TVA** : ✅ Vérification dans le rapport mensuel

---

## PHASE C — SIMPLIFIER L'UX (7 stories)
### Semaines 2-3 | Objectif : Sidebar ≤7 entrées, Dashboard workflow-first

---

### C.1 — Refactoriser sidebar SuperAdmin (7 entrées max)

**Domaine** : Frontend + Architecture  
**Risque** : Régression navigation — links cassés si routes non mises à jour

| # | Skill | Chemin | Justification |
|---|-------|--------|---------------|
| 1 | `multi-portal-architecture` | [CUSTOM]multi-portal-architecture/SKILL.md | Structure portals SuperAdmin — logique routes, guards |
| 2 | `react-expert` | [JEFF]react-expert/SKILL.md | Refactoring sidebar React — nested routes, active states |

**MCP obligatoires** : GitHub MCP — lire `src/portals/superadmin/` avant toute modification  
**Plugins** : Aucun  
**TVA** : ❌ Non applicable

---

### C.2 — Créer section "Intégrations" sidebar (4 Hubs)

**Domaine** : Frontend + Architecture  
**Risque** : Faible — ajout de routes, pas de suppression

| # | Skill | Chemin | Justification |
|---|-------|--------|---------------|
| 1 | `multi-portal-architecture` | [CUSTOM]multi-portal-architecture/SKILL.md | Nouvelle section dans architecture portals |
| 2 | `react-expert` | [JEFF]react-expert/SKILL.md | Composants Hub (InvoiceNinjaHub, MauticHub, RevolutHub, ERPNextHub) |

**MCP obligatoires** : GitHub MCP — structure routes existantes  
**Plugins** : Aucun  
**TVA** : ❌ Non applicable

---

### C.3 — Migrer sous-pages Finance (QR-Invoice → Factures, Jalons → Projets)

**Domaine** : Frontend + Architecture  
**Risque** : Liens internes cassés si redirection non gérée

| # | Skill | Chemin | Justification |
|---|-------|--------|---------------|
| 1 | `multi-portal-architecture` | [CUSTOM]multi-portal-architecture/SKILL.md | Déplacement routes dans la hiérarchie portals |
| 2 | `react-expert` | [JEFF]react-expert/SKILL.md | React Router redirections, lazy loading conservé |

**MCP obligatoires** : GitHub MCP — mapping routes actuelles  
**Plugins** : Aucun  
**TVA** : ❌ Non applicable

---

### C.4 — Fusionner CRM Dashboard + Leads + Pipeline dans "CRM"

**Domaine** : Frontend + Database  
**Risque** : Perte de filtres ou queries CRM si composants fusionnés maladroitement

| # | Skill | Chemin | Justification |
|---|-------|--------|---------------|
| 1 | `multi-portal-architecture` | [CUSTOM]multi-portal-architecture/SKILL.md | Fusion sections CRM dans architecture portals |
| 2 | `react-expert` | [JEFF]react-expert/SKILL.md | Composants CRM unifiés — tabs, filtres, queries |
| 3 | `directus-api-patterns` | [CUSTOM]directus-api-patterns/SKILL.md | Vérification requêtes leads/contacts/pipeline après fusion |

**MCP obligatoires** : GitHub MCP — lire composants CRM actuels  
**Plugins** : Aucun  
**TVA** : ❌ Non applicable

---

### C.5 — Déplacer Support/Tickets sous Projets

**Domaine** : Frontend  
**Risque** : Faible — déplacement simple, vérifier permissions

| # | Skill | Chemin | Justification |
|---|-------|--------|---------------|
| 1 | `react-expert` | [JEFF]react-expert/SKILL.md | Déplacement route, mise à jour navigation |

**MCP obligatoires** : Aucun spécifique  
**Plugins** : Aucun  
**TVA** : ❌ Non applicable

---

### C.6 — Dashboard CEO workflow-first (CDC §3.3)

**Domaine** : Frontend + Database + Design  
**Risque** : 🔥 Dashboard CEO est la page la plus critique — régression visible immédiatement

| # | Skill | Chemin | Justification |
|---|-------|--------|---------------|
| 1 | `ceo-dashboard-designer` | [CUSTOM]ceo-dashboard-designer/SKILL.md | Layout workflow-first : 5 workflows visibles, KPIs, alertes urgentes |
| 2 | `react-expert` | [JEFF]react-expert/SKILL.md | Recharts intégration, refresh automatique, responsive |
| 3 | `directus-api-patterns` | [CUSTOM]directus-api-patterns/SKILL.md | Agrégations multi-collections (invoices, projects, leads) |
| 4 | `financial-analyst` | [ALI]finance/financial-analyst/SKILL.md | Calculs MRR, ARR, cash flow pour widgets dashboard |

**MCP obligatoires** : `directus:list_collections`, `directus:describe_table projects`, `directus:describe_table client_invoices`  
**Plugins** : Aucun  
**TVA** : ✅ Vérification dans widgets Finance

---

### C.7 — Barre statut intégrations Dashboard CEO

**Domaine** : Frontend + API  
**Risque** : Faux positifs (vert alors qu'offline) = pire que pas de barre

| # | Skill | Chemin | Justification |
|---|-------|--------|---------------|
| 1 | `api-health-checker` | [PLUGINS]16-api-integration/api-health-checker/SKILL.md | Healthcheck réel 4 services : Invoice Ninja, Mautic, Revolut, ERPNext |
| 2 | `react-expert` | [JEFF]react-expert/SKILL.md | Pastilles visuelles — polling 60s, click → Hub concerné |
| 3 | `integration-sync-engine` | [CUSTOM]integration-sync-engine/SKILL.md | Endpoints health de chaque service externe |

**MCP obligatoires** : Aucun spécifique  
**Plugins** : Aucun  
**TVA** : ❌ Non applicable

---

## PHASE D — RENDRE VISIBLE (11 stories)
### Semaines 3-4 | Objectif : 4 Hubs + actions contextuelles dans les pages

---

### D.1.1 — Créer InvoiceNinjaHub.jsx

**Domaine** : Frontend + API Integration  
**Risque** : Token Invoice Ninja invalide = Hub vide sans message clair

| # | Skill | Chemin | Justification |
|---|-------|--------|---------------|
| 1 | `integration-sync-engine` | [CUSTOM]integration-sync-engine/SKILL.md | API Invoice Ninja v5 — dernières factures, statuts, raccourcis |
| 2 | `react-expert` | [JEFF]react-expert/SKILL.md | Hub layout : statut, liste factures, raccourcis actions |
| 3 | `api-health-checker` | [PLUGINS]16-api-integration/api-health-checker/SKILL.md | Statut connexion Invoice Ninja online/offline |

**MCP obligatoires** : Aucun spécifique  
**Plugins** : Aucun  
**TVA** : ✅ Vérification montants affichés

---

### D.1.2 — Bouton "Envoyer via Invoice Ninja" — Factures clients (liste + détail)

**Domaine** : Frontend + API Integration  
**Risque** : Double envoi si bouton cliqué 2x — facture envoyée 2 fois au client

| # | Skill | Chemin | Justification |
|---|-------|--------|---------------|
| 1 | `integration-sync-engine` | [CUSTOM]integration-sync-engine/SKILL.md | API Invoice Ninja — envoi facture, statut envoi, idempotence |
| 2 | `react-expert` | [JEFF]react-expert/SKILL.md | Loading state bouton, disable après envoi, toast confirmation |
| 3 | `directus-api-patterns` | [CUSTOM]directus-api-patterns/SKILL.md | Mise à jour statut IN dans Directus après envoi |

**MCP obligatoires** : `directus:describe_table client_invoices` (champ invoice_ninja_id, sent_at)  
**Plugins** : Aucun  
**TVA** : ✅ Vérification TVA avant envoi

---

### D.1.3 — Bouton "Envoyer via Invoice Ninja" — Page Devis

**Domaine** : Frontend + API Integration  
**Risque** : Devis envoyé sans signature DocuSeal liée — erreur workflow

| # | Skill | Chemin | Justification |
|---|-------|--------|---------------|
| 1 | `integration-sync-engine` | [CUSTOM]integration-sync-engine/SKILL.md | API Invoice Ninja quotes — envoi devis + statut |
| 2 | `react-expert` | [JEFF]react-expert/SKILL.md | Action contextuelle dans page Devis |

**MCP obligatoires** : `directus:describe_table quotes`  
**Plugins** : Aucun  
**TVA** : ✅ Vérification TVA dans devis

---

### D.1.4 — Widget "Impayés Invoice Ninja" Dashboard CEO

**Domaine** : Frontend + API Integration  
**Risque** : Faible — widget lecture seule, refresh auto

| # | Skill | Chemin | Justification |
|---|-------|--------|---------------|
| 1 | `ceo-dashboard-designer` | [CUSTOM]ceo-dashboard-designer/SKILL.md | Widget impayés — placement, style, KPI format |
| 2 | `integration-sync-engine` | [CUSTOM]integration-sync-engine/SKILL.md | API Invoice Ninja — liste invoices avec statut overdue |

**MCP obligatoires** : Aucun  
**Plugins** : Aucun  
**TVA** : ✅ Montants CHF affichés

---

### D.2.1 — Créer MauticHub.jsx

**Domaine** : Frontend + API Integration  
**Risque** : Stats Mautic incorrectes = décisions marketing erronées

| # | Skill | Chemin | Justification |
|---|-------|--------|---------------|
| 1 | `integration-sync-engine` | [CUSTOM]integration-sync-engine/SKILL.md | API Mautic 5.x — campagnes actives, stats ouvertures/clics |
| 2 | `react-expert` | [JEFF]react-expert/SKILL.md | Hub layout Mautic — statut, campagnes, raccourcis |
| 3 | `api-health-checker` | [PLUGINS]16-api-integration/api-health-checker/SKILL.md | Statut connexion Mautic online/offline |

**MCP obligatoires** : Aucun  
**Plugins** : Aucun  
**TVA** : ❌ Non applicable

---

### D.2.2 — Bouton "Envoyer relance (Mautic)" sur factures en retard

**Domaine** : Frontend + API Integration + Finance  
**Risque** : Relance envoyée sans QR-Invoice correct = problème légal suisse

| # | Skill | Chemin | Justification |
|---|-------|--------|---------------|
| 1 | `integration-sync-engine` | [CUSTOM]integration-sync-engine/SKILL.md | API Mautic — déclenchement campagne relance avec template |
| 2 | `swiss-compliance-engine` | [CUSTOM]swiss-compliance-engine/SKILL.md | QR-Invoice v2.3 dans email relance — obligation légale |
| 3 | `react-expert` | [JEFF]react-expert/SKILL.md | Modal confirmation relance, historique relances |

**MCP obligatoires** : `directus:describe_table client_invoices` (champs relance, overdue)  
**Plugins** : Aucun  
**TVA** : ✅ OBLIGATOIRE — QR-Invoice dans relance

---

### D.2.3 — Stat "Emails envoyés ce mois" Dashboard CEO

**Domaine** : Frontend + API  
**Risque** : Faible — stat lecture seule

| # | Skill | Chemin | Justification |
|---|-------|--------|---------------|
| 1 | `ceo-dashboard-designer` | [CUSTOM]ceo-dashboard-designer/SKILL.md | Widget stat emails — placement dans dashboard |
| 2 | `integration-sync-engine` | [CUSTOM]integration-sync-engine/SKILL.md | API Mautic — stats envois période courante |

**MCP obligatoires** : Aucun  
**Plugins** : Aucun  
**TVA** : ❌ Non applicable

---

### D.3.1 — RevolutHub.jsx — balances multi-devises + statut token

**Domaine** : Frontend + API + Cache  
**Risque** : 🔥 Affichage solde incorrect = décision trésorerie erronée. Token management critique.

| # | Skill | Chemin | Justification |
|---|-------|--------|---------------|
| 1 | `integration-sync-engine` | [CUSTOM]integration-sync-engine/SKILL.md | API Revolut Business — balances CHF/EUR/USD, transactions récentes |
| 2 | `redis-cache-manager` | [PLUGINS]06-backend-dev/redis-cache-manager/SKILL.md | Token OAuth Revolut côté backend, TTL 40min, refresh proactif |
| 3 | `react-expert` | [JEFF]react-expert/SKILL.md | Affichage balances, date expiration token, banner warning |
| 4 | `api-health-checker` | [PLUGINS]16-api-integration/api-health-checker/SKILL.md | Statut token : valide / expirant (banner orange) / expiré (dégradé) |

**MCP obligatoires** : Aucun  
**Plugins** : Aucun  
**TVA** : ❌ Non applicable (affichage soldes bruts)

---

### D.3.2 — Bouton "Payer via Revolut" sur facture fournisseur validée

**Domaine** : Frontend + API + Finance + Sécurité  
**Risque** : 🔥🔥🔥 CRITIQUE — Virement Revolut réel. Confirmation obligatoire avant paiement.

| # | Skill | Chemin | Justification |
|---|-------|--------|---------------|
| 1 | `integration-sync-engine` | [CUSTOM]integration-sync-engine/SKILL.md | API Revolut — initiation virement, confirmation, statut |
| 2 | `swiss-compliance-engine` | [CUSTOM]swiss-compliance-engine/SKILL.md | Validation montant CHF, enregistrement comptable PME Käfer |
| 3 | `react-expert` | [JEFF]react-expert/SKILL.md | Flow confirmation : montant → modal → validation → paiement → toast |
| 4 | `webhook-signature-validator` | [PLUGINS]16-api-integration/webhook-signature-validator/SKILL.md | Confirmation paiement reçue via webhook Revolut — validation HMAC |

**MCP obligatoires** : `directus:describe_table supplier_invoices`, `directus:describe_table payments`  
**Plugins** : `pci-dss-validator` (plugin actif — vérifier conformité)  
**TVA** : ✅ OBLIGATOIRE — TVA déductible fournisseur

---

### D.3.3 — Balances Revolut live Dashboard CEO (refresh 60s)

**Domaine** : Frontend + API  
**Risque** : Affichage stale si refresh non implémenté correctement

| # | Skill | Chemin | Justification |
|---|-------|--------|---------------|
| 1 | `ceo-dashboard-designer` | [CUSTOM]ceo-dashboard-designer/SKILL.md | Widget balances — placement, format CHF/EUR |
| 2 | `integration-sync-engine` | [CUSTOM]integration-sync-engine/SKILL.md | API Revolut balances — polling 60s côté serveur (pas front direct) |

**MCP obligatoires** : Aucun  
**Plugins** : Aucun  
**TVA** : ❌ Non applicable

---

### D.4.1 — ERPNextHub.jsx (lecture seule v3)

**Domaine** : Frontend + API  
**Risque** : Faible — lecture seule, pas d'écriture en v3

| # | Skill | Chemin | Justification |
|---|-------|--------|---------------|
| 1 | `integration-sync-engine` | [CUSTOM]integration-sync-engine/SKILL.md | API ERPNext v15 — statut stock, indicateurs RH |
| 2 | `react-expert` | [JEFF]react-expert/SKILL.md | Hub lecture seule — layout statut + indicateurs clés |
| 3 | `api-health-checker` | [PLUGINS]16-api-integration/api-health-checker/SKILL.md | Statut connexion ERPNext |

**MCP obligatoires** : Aucun  
**Plugins** : Aucun  
**TVA** : ❌ Non applicable

---

## PHASE E — TESTS END-TO-END (6 stories)
### Semaine 5 | Objectif : 5 workflows CEO validés en conditions réelles

---

### E.1 — Test W1 — Cycle vente complet (Lead → Paiement → Projet activé)

**Domaine** : Testing + Finance + API  
**Risque** : 🔥 Test complet = risque régression sur tout le workflow vente

| # | Skill | Chemin | Justification |
|---|-------|--------|---------------|
| 1 | `playwright-expert` | [JEFF]playwright-expert/SKILL.md | Tests E2E automatisés du workflow complet |
| 2 | `senior-qa` | [ALI]engineering-team/senior-qa/SKILL.md | Stratégie test : happy path + cas d'erreur + cas limites |
| 3 | `swiss-compliance-engine` | [CUSTOM]swiss-compliance-engine/SKILL.md | Vérification factures générées — TVA, QR-Invoice, montants |
| 4 | `integration-sync-engine` | [CUSTOM]integration-sync-engine/SKILL.md | Validation webhooks reçus et traités (DocuSeal + Revolut) |

**MCP obligatoires** : GitHub MCP — vérifier tests existants avant d'en créer  
**Plugins** : Playwright MCP  
**TVA** : ✅ OBLIGATOIRE dans tests de validation factures

---

### E.2 — Test W2 — Paiement Revolut → rapprochement → comptabilité

**Domaine** : Testing + Finance  
**Risque** : Rapprochement bancaire incorrect = comptabilité fausse

| # | Skill | Chemin | Justification |
|---|-------|--------|---------------|
| 1 | `playwright-expert` | [JEFF]playwright-expert/SKILL.md | Tests E2E flux paiement Revolut |
| 2 | `senior-qa` | [ALI]engineering-team/senior-qa/SKILL.md | Test matching 3 stratégies + cas anomalie |
| 3 | `swiss-compliance-engine` | [CUSTOM]swiss-compliance-engine/SKILL.md | Validation enregistrements PME Käfer |

**MCP obligatoires** : `directus:describe_table bank_transactions`, `directus:describe_table payments`  
**Plugins** : Playwright MCP  
**TVA** : ✅ OBLIGATOIRE — comptabilité Käfer

---

### E.3 — Test W3 — Facture fournisseur + paiement Revolut

**Domaine** : Testing + Finance  
**Risque** : Virement déclenché en test = toujours utiliser compte Revolut sandbox

| # | Skill | Chemin | Justification |
|---|-------|--------|---------------|
| 1 | `playwright-expert` | [JEFF]playwright-expert/SKILL.md | Tests E2E validation + paiement fournisseur |
| 2 | `senior-qa` | [ALI]engineering-team/senior-qa/SKILL.md | Test flow complet : upload → OCR → validation → paiement |

**MCP obligatoires** : Aucun  
**Plugins** : Playwright MCP  
**TVA** : ✅ TVA déductible fournisseur — vérification

---

### E.4 — Test W4 — Vue projet CEO (statut, jalons, prestataires, budget)

**Domaine** : Testing + Frontend  
**Risque** : Faible — tests UI principalement

| # | Skill | Chemin | Justification |
|---|-------|--------|---------------|
| 1 | `playwright-expert` | [JEFF]playwright-expert/SKILL.md | Tests E2E vue projet CEO |
| 2 | `senior-qa` | [ALI]engineering-team/senior-qa/SKILL.md | Validation exhaustivité informations affichées |

**MCP obligatoires** : Aucun  
**Plugins** : Playwright MCP  
**TVA** : ❌ Non applicable

---

### E.5 — Test W5 — Relance client (déclenchement + email + traçage)

**Domaine** : Testing + API  
**Risque** : Email relance envoyé en production pendant test = utiliser Mautic sandbox

| # | Skill | Chemin | Justification |
|---|-------|--------|---------------|
| 1 | `playwright-expert` | [JEFF]playwright-expert/SKILL.md | Tests E2E workflow relance |
| 2 | `senior-qa` | [ALI]engineering-team/senior-qa/SKILL.md | Validation : email envoyé + statut tracé + J+14/J+30 |

**MCP obligatoires** : Aucun  
**Plugins** : Playwright MCP  
**TVA** : ✅ QR-Invoice dans email relance

---

### E.6 — Checklist critères de succès production (CDC §12)

**Domaine** : QA + Sécurité  
**Risque** : Critères non vérifiés rigoureusement = mise en prod prématurée

| # | Skill | Chemin | Justification |
|---|-------|--------|---------------|
| 1 | `senior-qa` | [ALI]engineering-team/senior-qa/SKILL.md | Audit exhaustif checklist : fonctionnel + qualité + technique |
| 2 | `senior-security` | [ALI]engineering-team/senior-security/SKILL.md | Vérification score sécurité ≥85/100, CVE audit |

**MCP obligatoires** : GitHub MCP — rapport sécurité post Phase 10  
**Plugins** : `project-health-auditor` (plugin actif)  
**TVA** : ✅ Vérification globale

---

## PHASE F — PRODUCTION (6 stories)
### Semaine 6 | Objectif : Build déployé, SSL, monitoring, score sécurité ≥85

---

### F.1 — Build production React compilé et déployé

**Domaine** : DevOps  
**Risque** : Build différent de dev — vite.config.js à vérifier

| # | Skill | Chemin | Justification |
|---|-------|--------|---------------|
| 1 | `docker-stack-ops` | [CUSTOM]docker-stack-ops/SKILL.md | Build et déploiement stack Docker HYPERVISUAL complet |

**MCP obligatoires** : GitHub MCP — vite.config.js actuel  
**Plugins** : `ci-cd-pipeline-builder` (plugin actif)  
**TVA** : ❌ Non applicable

---

### F.2 — SSL certificats production configurés

**Domaine** : DevOps + Sécurité  
**Risque** : HTTPS obligatoire pour webhooks Revolut et DocuSeal

| # | Skill | Chemin | Justification |
|---|-------|--------|---------------|
| 1 | `docker-stack-ops` | [CUSTOM]docker-stack-ops/SKILL.md | Configuration Nginx/Traefik SSL dans Docker stack |
| 2 | `senior-security` | [ALI]engineering-team/senior-security/SKILL.md | Validation configuration SSL — TLS 1.2+ minimum |

**MCP obligatoires** : Aucun  
**Plugins** : Aucun  
**TVA** : ❌ Non applicable

---

### F.3 — Audit npm CVE — zéro vulnérabilité critique

**Domaine** : Sécurité  
**Risque** : Dépendances vulnérables = breach potentiel

| # | Skill | Chemin | Justification |
|---|-------|--------|---------------|
| 1 | `senior-security` | [ALI]engineering-team/senior-security/SKILL.md | Audit complet npm, stratégie remédiation CVE critiques |

**MCP obligatoires** : GitHub MCP — package.json actuel  
**Plugins** : `gdpr-compliance-scanner` (plugin actif — RGPD également)  
**TVA** : ❌ Non applicable

---

### F.4 — Score sécurité ≥ 85/100 (actuellement 72/100)

**Domaine** : Sécurité  
**Risque** : Score insuffisant = rejet mise en prod

| # | Skill | Chemin | Justification |
|---|-------|--------|---------------|
| 1 | `senior-security` | [ALI]engineering-team/senior-security/SKILL.md | OWASP checklist, penetration test basique, headers sécurité |
| 2 | `secure-code-guardian` | [JEFF]secure-code-guardian/SKILL.md | Review code sécurité — injections, XSS, CSRF |

**MCP obligatoires** : GitHub MCP — rapport Phase 10 sécurité  
**Plugins** : `gdpr-compliance-scanner`, `pci-dss-validator` (plugins actifs)  
**TVA** : ❌ Non applicable

---

### F.5 — Grafana monitoring déployé + alertes critiques

**Domaine** : DevOps + Monitoring  
**Risque** : Sans monitoring = incidents invisibles en production

| # | Skill | Chemin | Justification |
|---|-------|--------|---------------|
| 1 | `docker-stack-ops` | [CUSTOM]docker-stack-ops/SKILL.md | Déploiement Grafana dans Docker stack existant |

**MCP obligatoires** : Aucun  
**Plugins** : `apm-dashboard-creator` (plugin actif)  
**TVA** : ❌ Non applicable

---

### F.6 — ROADMAP v3.0 mise à jour — toutes stories complétées

**Domaine** : Documentation  
**Risque** : Faible  

| # | Skill | Chemin | Justification |
|---|-------|--------|---------------|
| 1 | `directus-api-patterns` | [CUSTOM]directus-api-patterns/SKILL.md | Skill de base obligatoire |

**MCP obligatoires** : GitHub MCP — ROADMAP.md actuel  
**Plugins** : Aucun  
**TVA** : ❌ Non applicable

---

## PHASE G — MULTI-ENTREPRISES (7 stories)
### Post-production | Déclencheur : HV Switzerland stable en prod

---

### G.1 — Architecture isolation données (company_id sur toutes collections)

**Domaine** : Database + Backend  
**Risque** : 🔥🔥 CRITIQUE — Fuite de données entre entreprises si mal implémenté

| # | Skill | Chemin | Justification |
|---|-------|--------|---------------|
| 1 | `directus-api-patterns` | [CUSTOM]directus-api-patterns/SKILL.md | Ajout company_id comme filtre obligatoire sur toutes requêtes |
| 2 | `senior-backend` | [ALI]engineering-team/senior-backend/SKILL.md | Middleware isolation données — jamais de cross-company query |
| 3 | `postgresql-directus-optimizer` | [CUSTOM]postgresql-directus-optimizer/SKILL.md | Index company_id sur 82+ collections — performance critique |

**MCP obligatoires** : `directus:list_collections` — audit complet avant migration  
**Plugins** : `database-migration-manager` (plugin actif)  
**TVA** : ✅ Chaque entreprise a sa propre configuration TVA

---

### G.2 — Company switcher sidebar (5 entreprises)

**Domaine** : Frontend + Architecture  
**Risque** : Switch vers mauvaise entreprise sans confirmation = données mélangées

| # | Skill | Chemin | Justification |
|---|-------|--------|---------------|
| 1 | `multi-portal-architecture` | [CUSTOM]multi-portal-architecture/SKILL.md | Company switcher dans architecture portals |
| 2 | `react-expert` | [JEFF]react-expert/SKILL.md | Dropdown entreprises, confirmation switch, flush state |

**MCP obligatoires** : GitHub MCP — sidebar SuperAdmin actuelle  
**Plugins** : Aucun  
**TVA** : ❌ Non applicable (géré par G.1)

---

### G.3 — DAINAMICS onboarding

**Domaine** : Database + Frontend + Finance  
**Risque** : Configuration TVA/légal spécifique à vérifier

| # | Skill | Chemin | Justification |
|---|-------|--------|---------------|
| 1 | `directus-api-patterns` | [CUSTOM]directus-api-patterns/SKILL.md | Seed données DAINAMICS dans Directus |
| 2 | `multi-portal-architecture` | [CUSTOM]multi-portal-architecture/SKILL.md | Configuration portals DAINAMICS |
| 3 | `swiss-compliance-engine` | [CUSTOM]swiss-compliance-engine/SKILL.md | TVA et légal DAINAMICS (même spec Suisse) |

**MCP obligatoires** : `directus:list_collections` — état isolation G.1 requis  
**Plugins** : Aucun  
**TVA** : ✅ Configuration TVA par entreprise

---

### G.4 — LEXAIA onboarding

*(Même skills que G.3 — configuration LEXAIA)*

| # | Skill | Chemin | Justification |
|---|-------|--------|---------------|
| 1 | `directus-api-patterns` | [CUSTOM]directus-api-patterns/SKILL.md | Seed données LEXAIA |
| 2 | `multi-portal-architecture` | [CUSTOM]multi-portal-architecture/SKILL.md | Configuration portals LEXAIA |
| 3 | `swiss-compliance-engine` | [CUSTOM]swiss-compliance-engine/SKILL.md | TVA et légal LEXAIA |

---

### G.5 — ENKI REALTY onboarding

*(Orthographe exacte : ENKI REALTY — jamais ENKY)*

| # | Skill | Chemin | Justification |
|---|-------|--------|---------------|
| 1 | `directus-api-patterns` | [CUSTOM]directus-api-patterns/SKILL.md | Seed données ENKI REALTY |
| 2 | `multi-portal-architecture` | [CUSTOM]multi-portal-architecture/SKILL.md | Configuration portals ENKI REALTY |
| 3 | `swiss-compliance-engine` | [CUSTOM]swiss-compliance-engine/SKILL.md | TVA immobilière (taux différent ?) — à vérifier |

---

### G.6 — TAKEOUT onboarding

| # | Skill | Chemin | Justification |
|---|-------|--------|---------------|
| 1 | `directus-api-patterns` | [CUSTOM]directus-api-patterns/SKILL.md | Seed données TAKEOUT |
| 2 | `multi-portal-architecture` | [CUSTOM]multi-portal-architecture/SKILL.md | Configuration portals TAKEOUT |
| 3 | `swiss-compliance-engine` | [CUSTOM]swiss-compliance-engine/SKILL.md | TVA restauration (taux réduit 2.6% ?) — à vérifier |

---

### G.7 — Dashboard CEO multi-entreprises (vue consolidée)

**Domaine** : Frontend + Database + Finance  
**Risque** : Agrégations cross-company complexes — performance critique

| # | Skill | Chemin | Justification |
|---|-------|--------|---------------|
| 1 | `ceo-dashboard-designer` | [CUSTOM]ceo-dashboard-designer/SKILL.md | Layout SuperAdmin multi-entreprises — vue consolidée + vue par entreprise |
| 2 | `directus-api-patterns` | [CUSTOM]directus-api-patterns/SKILL.md | Agrégations multi-company avec company_id filters |
| 3 | `react-expert` | [JEFF]react-expert/SKILL.md | Toggle vue consolidée / vue entreprise |
| 4 | `postgresql-directus-optimizer` | [CUSTOM]postgresql-directus-optimizer/SKILL.md | Queries consolidées performantes sur 5 entreprises |
| 5 | `financial-analyst` | [ALI]finance/financial-analyst/SKILL.md | Métriques consolidées multi-devises (CHF dominant) |

**MCP obligatoires** : `directus:list_collections`, PostgreSQL MCP (requêtes agrégées)  
**Plugins** : Aucun  
**TVA** : ✅ Consolidation TVA par entreprise

---

## SYNTHÈSE — FRÉQUENCE D'UTILISATION

| Skill | Stories | Fréquence |
|-------|---------|-----------|
| `directus-api-patterns` | Toutes (obligatoire) | 52/52 |
| `swiss-compliance-engine` | Finance/Legal | 20/52 |
| `react-expert` | UI stories | 28/52 |
| `integration-sync-engine` | Intégrations externes | 18/52 |
| `ceo-dashboard-designer` | Dashboard stories | 8/52 |
| `multi-portal-architecture` | Architecture/Nav | 7/52 |
| `api-health-checker` | Status/Hub stories | 7/52 |
| `webhook-signature-validator` | Webhooks Revolut/DocuSeal | 3/52 |
| `redis-cache-manager` | Token/Cache | 3/52 |
| `playwright-expert` | Phase E tests | 5/52 |
| `senior-qa` | Phase E + F | 6/52 |
| `senior-security` | Phase F | 3/52 |
| `docker-stack-ops` | Phase F | 3/52 |
| `financial-analyst` | Rapports/Dashboard | 3/52 |
| `webhook-receiver-generator` | Webhooks entrants | 2/52 |
| `webhook-retry-handler` | Webhooks fiabilité | 1/52 |
| `server-sent-events-setup` | Temps réel messages | 1/52 |
| `api-client-generator` | Clients API externes | 2/52 |
| `express-route-generator` | Routes backend | 1/52 |
| `senior-backend` | Architecture backend | 1/52 |
| `postgresql-directus-optimizer` | Performance BD | 2/52 |
| `secure-code-guardian` | Review sécurité | 1/52 |

---

## SKILLS ABSENTS DE CE PROJET (INTERDITS)

| Skill | Raison |
|-------|--------|
| `nextjs-*` | React + Vite uniquement |
| `apexcharts-*` | Recharts uniquement |
| `glassmorphism` décoratif | Apple Premium Monochromatic uniquement |
| `react-native-*` | Pas d'app mobile V1 |
| AWS/GCP/Azure | Storage Directus local |
| `multi-portal-architecture` en Phase B | Phase B ne restructure pas les portals |

---

## INSTRUCTIONS D'UTILISATION

**Pour chaque prompt Claude Code** :

1. Identifier la story (ex: B.2.2)
2. Copier les skills exacts de cette story
3. Ajouter toujours `directus-api-patterns` et `swiss-compliance-engine` (si Finance)
4. Inclure dans le prompt le bloc DÉCLARATION SKILLS avec les chemins complets
5. Le bloc RÉSUMÉ EXÉCUTION doit lister les skills effectivement utilisés

**Format chemin complet** (remplacer alias) :
- `[CUSTOM]` → `/Users/jean-mariedelaunay/.claude/skills/`
- `[PLUGINS]` → `/Users/jean-mariedelaunay/.claude/skills-repos/claude-code-plugins-plus-skills/skills/`
- `[JEFF]` → `/Users/jean-mariedelaunay/.claude/skills-repos/jeffallan-claude-skills/skills/`
- `[ALI]` → `/Users/jean-mariedelaunay/.claude/skills-repos/alirezarezvanhi-claude-skills/`

---

*SKILLS-MAPPING-ROADMAP v1.0 — Février 2026*
*Analyse complète 939 skills — Mapping 45 stories Phases B-G*
*Document de référence unique — Ne pas modifier sans validation Architecte*
