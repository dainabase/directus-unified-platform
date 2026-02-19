# SKILLS MAPPING — HYPERVISUAL Unified Platform
**Version** : 1.0 | **Date** : Février 2026  
**Usage** : Ce fichier est lu par Claude Code AVANT chaque story.  
**Repository skills** : `~/.claude/skills-repos/`

> **RÈGLE D'OR** : Claude Code DOIT lire au minimum 2 skills avant de coder.  
> Un skill projet (`.claude/skills/`) + un skill spécialisé (`.claude/skills-repos/`).  
> Sans cette étape, le code produit sera générique. Avec, il sera exceptionnel.

---

## SKILLS PROJET (Niveau 1 — Toujours lire en premier)

Ces 8 skills sont spécifiques au projet HYPERVISUAL. Lire selon le type de tâche.

| Tâche | Skill projet à lire |
|-------|---------------------|
| Tout ce qui touche Directus (fetch, write, relations) | `.claude/skills/directus-api-patterns/SKILL.md` |
| TVA, QR-Invoice, CGV, conformité CO suisse | `.claude/skills/swiss-compliance-engine/SKILL.md` |
| Logique portails (SuperAdmin/Client/Prestataire/Revendeur) | `.claude/skills/multi-portal-architecture/SKILL.md` |
| Dashboard CEO (layout, KPIs, widgets) | `.claude/skills/ceo-dashboard-designer/SKILL.md` |
| Performance requêtes PostgreSQL | `.claude/skills/postgresql-directus-optimizer/SKILL.md` |
| Docker, services, infrastructure | `.claude/skills/docker-stack-ops/SKILL.md` |
| Connexions Invoice Ninja / Revolut / Mautic / ERPNext | `.claude/skills/integration-sync-engine/SKILL.md` |
| Choisir quel skill utiliser | `.claude/skills/skill-router/SKILL.md` |

---

## SKILLS SPÉCIALISÉS PAR TYPE DE TÂCHE (Niveau 2 — Les 939 skills)

### 🎨 FRONTEND — Design & UI (Phase B, C, D, J)

Pour produire des interfaces **exceptionnelles** et non génériques :

```
OBLIGATOIRE pour tout composant React UI :
~/.claude/skills-repos/anthropics-skills/skills/frontend-design/SKILL.md

OBLIGATOIRE pour le design system glassmorphism :
~/.claude/skills-repos/alirezarezvani-claude-skills/product-team/ui-design-system/SKILL.md

OBLIGATOIRE pour les composants React (hooks, patterns) :
~/.claude/skills-repos/jeffallan-claude-skills/skills/react-expert/SKILL.md

POUR les formulaires complexes (QuoteForm, InvoiceGenerator) :
~/.claude/skills-repos/awesome-claude-code-toolkit/skills/react-patterns/SKILL.md

POUR optimiser les classes Tailwind :
~/.claude/skills-repos/claude-code-plugins-plus-skills/skills/05-frontend-dev/tailwind-class-optimizer/SKILL.md

POUR les hooks custom (useQuote, useInvoice, useActivation) :
~/.claude/skills-repos/claude-code-plugins-plus-skills/skills/05-frontend-dev/react-hook-creator/SKILL.md

POUR générer des composants structurés :
~/.claude/skills-repos/claude-code-plugins-plus-skills/skills/05-frontend-dev/react-component-generator/SKILL.md

POUR responsive design et breakpoints :
~/.claude/skills-repos/claude-code-plugins-plus-skills/skills/05-frontend-dev/responsive-breakpoint-analyzer/SKILL.md

POUR le design system complet (couleurs, tokens, spacing) :
~/.claude/skills-repos/jezweb-claude-skills/skills/tailwind-theme-builder/SKILL.md

POUR la méthodologie design web (BEM, accessibilité, dark mode) :
~/.claude/skills-repos/jezweb-claude-skills/skills/web-design-methodology/SKILL.md

POUR shadcn/ui si utilisé :
~/.claude/skills-repos/jezweb-claude-skills/skills/shadcn-ui/SKILL.md
```

**Combinaison recommandée pour un nouveau composant UI complexe (ex: QuoteForm) :**
1. `directus-api-patterns` → comment fetch/write correctement
2. `frontend-design` (Anthropic) → qualité visuelle exceptionnelle
3. `react-expert` → patterns React 18 corrects
4. `react-hook-creator` → hook dédié propre

---

### 💰 FINANCE & CONFORMITÉ SUISSE (Phases B, I)

```
OBLIGATOIRE pour QR-Invoice, TVA, mentions légales :
.claude/skills/swiss-compliance-engine/SKILL.md

POUR génération de factures (swissqrbill npm) :
Context7 MCP → rechercher "swissqrbill" documentation

POUR les workflows financiers complexes :
~/.claude/skills-repos/jeffallan-claude-skills/skills/fullstack-guardian/SKILL.md
```

---

### 🔗 WEBHOOKS & AUTOMATISATIONS (Phases E, G)

Pour que les automatisations soient **robustes et production-ready** :

```
POUR Revolut webhook (réception paiements) :
~/.claude/skills-repos/claude-code-plugins-plus-skills/skills/16-api-integration/webhook-receiver-generator/SKILL.md

POUR valider la signature des webhooks (sécurité) :
~/.claude/skills-repos/claude-code-plugins-plus-skills/skills/16-api-integration/webhook-signature-validator/SKILL.md

POUR retry automatique si webhook échoue :
~/.claude/skills-repos/claude-code-plugins-plus-skills/skills/16-api-integration/webhook-retry-handler/SKILL.md

POUR WebSocket / temps réel dashboard :
~/.claude/skills-repos/awesome-claude-code-toolkit/skills/websocket-realtime/SKILL.md

POUR Server-Sent Events (notifications push) :
~/.claude/skills-repos/claude-code-plugins-plus-skills/skills/16-api-integration/server-sent-events-setup/SKILL.md

POUR intégration API Mautic, Invoice Ninja, Revolut :
~/.claude/skills-repos/claude-code-plugins-plus-skills/skills/16-api-integration/api-client-generator/SKILL.md

POUR mise en cache des réponses API (perf) :
~/.claude/skills-repos/claude-code-plugins-plus-skills/skills/16-api-integration/api-response-cacher/SKILL.md
```

---

### 🗃️ BASE DE DONNÉES & PERFORMANCE (Phase G — Rapprochement)

Pour l'algorithme de rapprochement bancaire et les requêtes complexes :

```
POUR optimisation requêtes PostgreSQL :
~/.claude/skills-repos/awesome-claude-code-toolkit/skills/postgres-optimization/SKILL.md
.claude/skills/postgresql-directus-optimizer/SKILL.md

POUR queries SQL complexes (rapprochement multi-critères) :
~/.claude/skills-repos/jeffallan-claude-skills/skills/sql-pro/SKILL.md

POUR profiling requêtes lentes :
~/.claude/skills-repos/claude-code-plugins-plus-skills/skills/10-performance-testing/database-query-profiler/SKILL.md

POUR optimiser les CTE (rapprochement avancé) :
~/.claude/skills-repos/claude-code-plugins-plus-skills/skills/12-data-analytics/cte-query-builder/SKILL.md
```

---

### 🔌 BACKEND & API EXPRESS (Phases B, E, G, H)

```
POUR créer des routes Express propres :
~/.claude/skills-repos/claude-code-plugins-plus-skills/skills/06-backend-dev/express-route-generator/SKILL.md

POUR design REST API (endpoints Revolut, DocuSeal) :
~/.claude/skills-repos/awesome-claude-code-toolkit/skills/api-design-patterns/SKILL.md

POUR cache Redis (sessions, tokens Revolut 40min) :
~/.claude/skills-repos/claude-code-plugins-plus-skills/skills/06-backend-dev/redis-cache-manager/SKILL.md

POUR fullstack (feature complète frontend + backend) :
~/.claude/skills-repos/jeffallan-claude-skills/skills/fullstack-guardian/SKILL.md
```

---

### 📊 GRAPHIQUES & VISUALISATION (Dashboard CEO, KPIs)

```
POUR Recharts (seul outil autorisé — JAMAIS ApexCharts) :
Context7 MCP → rechercher "recharts" documentation officielle

POUR diagrammes Mermaid (architecture, flows) :
~/.claude/skills-repos/daymade-claude-code-skills/mermaid-tools/SKILL.md
~/.claude/skills-repos/claude-code-plugins-plus-skills/skills/18-visual-content/mermaid-flowchart-generator/SKILL.md

POUR visualiser les flux de données (Lead → Devis → Facture → Projet) :
~/.claude/skills-repos/claude-code-plugins-plus-skills/skills/18-visual-content/api-flow-diagram-creator/SKILL.md
```

---

### 🧪 TESTS & QUALITÉ (Toutes phases)

```
POUR tests E2E Playwright (portails) :
Playwright MCP (déjà configuré dans .mcp.json)

POUR tests API :
~/.claude/skills-repos/claude-code-plugins-plus-skills/skills/09-test-automation/api-test-generator/SKILL.md

POUR tests base de données :
~/.claude/skills-repos/claude-code-plugins-plus-skills/skills/09-test-automation/database-test-helper/SKILL.md

POUR analyse statique du code :
ESLint MCP (déjà configuré dans .mcp.json)
```

---

### 🔒 SÉCURITÉ (Toutes phases)

```
POUR gestion API keys (Revolut, DocuSeal, OpenAI) :
~/.claude/skills-repos/claude-code-plugins-plus-skills/skills/03-security-fundamentals/api-key-manager/SKILL.md

POUR rate limiting (protection endpoints publics) :
~/.claude/skills-repos/claude-code-plugins-plus-skills/skills/03-security-fundamentals/rate-limiter-config/SKILL.md
```

---

## COMBINAISONS RECOMMANDÉES PAR STORY ROADMAP

| Story | Skills à lire dans l'ordre |
|-------|---------------------------|
| **B-01** Lead Actions | `directus-api-patterns` + `react-expert` + `react-component-generator` |
| **B-02** QuoteForm | `directus-api-patterns` + `swiss-compliance-engine` + `frontend-design` + `react-expert` |
| **B-04** InvoiceGenerator | `swiss-compliance-engine` + `directus-api-patterns` + `frontend-design` |
| **B-07** AlertsWidget | `ceo-dashboard-designer` + `frontend-design` + `directus-api-patterns` |
| **C-01** Signature Client | `swiss-compliance-engine` + `multi-portal-architecture` + `react-expert` |
| **E-01** Mautic Emails | `integration-sync-engine` + `webhook-sender-creator` |
| **G-01** Revolut Webhook | `integration-sync-engine` + `webhook-receiver-generator` + `webhook-signature-validator` |
| **G-02** Rapprochement | `postgresql-directus-optimizer` + `sql-pro` + `cte-query-builder` |
| **I-01** Facturation Jalons | `swiss-compliance-engine` + `directus-api-patterns` + `fullstack-guardian` |
| **J-01** KPI Dashboard | `ceo-dashboard-designer` + `frontend-design` + `directus-api-patterns` |

---

## COMMENT UTILISER DANS UN PROMPT CLAUDE CODE

Chaque prompt doit commencer par :

```
## ÉTAPE 0 — OBLIGATOIRE AVANT TOUT CODE

Lire dans l'ordre ces fichiers AVANT d'écrire la première ligne de code :

1. SKILL PROJET : /Users/jean-mariedelaunay/directus-unified-platform/.claude/skills/[NOM]/SKILL.md
2. SKILL SPÉCIALISÉ : /Users/jean-mariedelaunay/.claude/skills-repos/[CHEMIN]/SKILL.md
3. VÉRIFICATION DIRECTUS : Via MCP directus, confirmer les champs réels de [COLLECTION]

Si tu ne peux pas lire un fichier → STOP et signale l'erreur. Ne jamais deviner.
Référence : SKILLS-MAPPING.md pour trouver le bon skill par type de tâche.

## ÉTAPE FINALE — OBLIGATOIRE APRÈS TOUT CODE

Mettre à jour ROADMAP.md :
- Passer la story [Story-ID] de [ ] → [V]
- Ajouter la date (format YYYY-MM-DD)
- Logger toute découverte inattendue dans la section DÉCOUVERTES
```

---

## SKILLS À NE PAS UTILISER SUR CE PROJET

| Skill | Raison |
|-------|--------|
| `nextjs-mastery` | On est sur React + Vite, pas Next.js |
| `mobile-development` / `react-native-expert` | Pas d'app mobile dans V1 |
| `angular-architect` / `vue-expert` | On est sur React uniquement |
| Tout skill AWS / GCP / Azure | Storage Directus local, pas de cloud |
| `wordpress-pro` | JAMAIS de WordPress pour le dashboard |
| Tout skill ApexCharts | On utilise **uniquement Recharts** |
