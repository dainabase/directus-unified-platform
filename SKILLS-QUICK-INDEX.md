# SKILLS QUICK INDEX — HYPERVISUAL Unified Platform

---

## 🚦 NAVIGATION DU SYSTÈME SKILLS — LIRE EN PREMIER

```
CE FICHIER = Point d'entrée OBLIGATOIRE (50+ skills les plus utilisés, chemins directs)
     ↓ Si skill non trouvé ici
.claude/skills/skill-router/references/REGISTRY.md  (939+ skills par catégorie)
     ↓ Pour une catégorie spécifique
.claude/skills/skill-router/references/categories/<categorie>.md
     ↓ Pour le skill exact
Lire son SKILL.md via le chemin absolu indiqué dans la catégorie
```

**Règle : Ce fichier couvre 80% des besoins. Pour les 20% restants → REGISTRY.**

---

## ⛔ BLOC DE DÉCLARATION OBLIGATOIRE (avant tout code)

> Format défini dans `.claude/skills/skill-router/SKILL.md` — **Si absent → STOP**

```
=== DÉCLARATION SKILLS ===
Tâche : [description courte]
Domaine(s) : [ex: Frontend, Database, Swiss Compliance]

Skills sélectionnés :
1. [nom-skill] — [chemin exact] — [raison]
2. [nom-skill] — [chemin exact] — [raison]

MCP utilisés :
- [MCP name] — [usage]

Skills lus : ✅ [liste]
=== FIN DÉCLARATION SKILLS ===
```

---

**Racine skills-repos** : `~/.claude/skills-repos/`
**Custom skills projet** : `.claude/skills/`
**Mis à jour** : Février 2026 — Chemins vérifiés

---

## ⚡ MCP SERVERS (disponibles directement — pas de lecture SKILL.md)

| MCP | Usage | Déclencher quand |
|-----|-------|-----------------|
| **Directus MCP** | CRUD collections, vérifier champs, schema | Toujours avant de coder avec collections |
| **PostgreSQL MCP** | SQL direct, 83+ collections, migrations | Requêtes complexes, rapprochement |
| **ESLint MCP** | Analyse statique JS/TS | Avant chaque commit |
| **Playwright MCP** | Tests E2E, screenshots, navigation | Tests portails |
| **Context7 MCP** | Docs live 44k+ libraries (Recharts, swissqrbill...) | Toute lib externe |
| **Sequential Thinking MCP** | Raisonnement multi-étapes structuré | Problèmes complexes |

---

## 🎯 CUSTOM SKILLS PROJET (8 skills — toujours disponibles dans `.claude/skills/`)

| Skill | Usage |
|-------|-------|
| `.claude/skills/directus-api-patterns/SKILL.md` | TOUT ce qui touche Directus (fetch, write, relations) |
| `.claude/skills/swiss-compliance-engine/SKILL.md` | TVA, QR-Invoice, CGV, conformité CO suisse |
| `.claude/skills/multi-portal-architecture/SKILL.md` | Logique portails SuperAdmin/Client/Prestataire/Revendeur |
| `.claude/skills/ceo-dashboard-designer/SKILL.md` | Dashboard CEO (layout, KPIs, widgets) |
| `.claude/skills/postgresql-directus-optimizer/SKILL.md` | Performance requêtes PostgreSQL |
| `.claude/skills/docker-stack-ops/SKILL.md` | Docker, services, infrastructure |
| `.claude/skills/integration-sync-engine/SKILL.md` | Invoice Ninja / Revolut / Mautic / ERPNext |
| `.claude/skills/skill-router/SKILL.md` | Choisir quel skill utiliser |

---

## 🎨 UI / DESIGN SYSTEM (Apple Premium Monochromatic)

| Skill | Usage | Chemin exact |
|-------|-------|-------------|
| **frontend-design** | Qualité visuelle exceptionnelle (Anthropic official) | `~/anthropics-skills/skills/frontend-design/SKILL.md` |
| **ui-design-system** | Design tokens, couleurs, spacing, typographie | `~/alirezarezvanhi-claude-skills/product-team/ui-design-system/SKILL.md` |
| **web-design-methodology** | BEM, accessibilité, dark mode, conventions | `~/jezweb-claude-skills/skills/web-design-methodology/SKILL.md` |
| **ux-researcher-designer** | Personas, user flows, heuristics | `~/alirezarezvanhi-claude-skills/product-team/ux-researcher-designer/SKILL.md` |
| **web-design-patterns** | Layouts, navigation, interaction patterns | `~/jezweb-claude-skills/skills/web-design-patterns/SKILL.md` |
| **ux-audit** | Évaluer et améliorer l'UX existante | `~/jezweb-claude-skills/skills/ux-audit/SKILL.md` |
| **tailwind-theme-builder** | CSS variables, dark mode, theming | `~/jezweb-claude-skills/skills/tailwind-theme-builder/SKILL.md` |
| **color-palette** | Cohérence couleurs, tokens sémantiques | `~/jezweb-claude-skills/skills/color-palette/SKILL.md` |
| **icon-set-generator** | Icônes cohérentes dans le design system | `~/jezweb-claude-skills/skills/icon-set-generator/SKILL.md` |
| **theme-factory** | Génération de thèmes complets | `~/anthropics-skills/skills/theme-factory/SKILL.md` |
| **shadcn-ui** | Composants accessibles et bien architecturés | `~/jezweb-claude-skills/skills/shadcn-ui/SKILL.md` |
| **web-artifacts-builder** | Composants élaborés multi-layer | `~/anthropics-skills/skills/web-artifacts-builder/SKILL.md` |

---

## ⚛️ REACT / FRONTEND

| Skill | Usage | Chemin exact |
|-------|-------|-------------|
| **react-expert** | React 18 hooks, patterns, performance, composition | `~/jeffallan-claude-skills/skills/react-expert/SKILL.md` |
| **senior-frontend** | Best practices, architecture frontend senior | `~/alirezarezvanhi-claude-skills/engineering-team/senior-frontend/SKILL.md` |
| **react-component-generator** | Génération composant structuré propre | `~/claude-code-plugins-plus-skills/skills/05-frontend-dev/react-component-generator/SKILL.md` |
| **react-hook-creator** | Hooks custom dédiés (useQuote, useInvoice...) | `~/claude-code-plugins-plus-skills/skills/05-frontend-dev/react-hook-creator/SKILL.md` |
| **tailwind-class-optimizer** | Éviter le bloat Tailwind | `~/claude-code-plugins-plus-skills/skills/05-frontend-dev/tailwind-class-optimizer/SKILL.md` |
| **responsive-breakpoint-analyzer** | sm/md/lg/xl/2xl cohérents | `~/claude-code-plugins-plus-skills/skills/05-frontend-dev/responsive-breakpoint-analyzer/SKILL.md` |
| **react-patterns** | Formulaires complexes, HOC, render props | `~/awesome-claude-code-toolkit/skills/react-patterns/SKILL.md` |
| **zustand-store-creator** | État global bien structuré | `~/claude-code-plugins-plus-skills/skills/05-frontend-dev/zustand-store-creator/SKILL.md` |
| **senior-fullstack** | Architecture fullstack complète | `~/alirezarezvanhi-claude-skills/engineering-team/senior-fullstack/SKILL.md` |
| **fullstack-guardian** | Feature complète front + back | `~/jeffallan-claude-skills/skills/fullstack-guardian/SKILL.md` |
| **webapp-testing** | Tests visuels, interactions | `~/anthropics-skills/skills/webapp-testing/SKILL.md` |

---

## 🗄️ BASE DE DONNÉES & BACKEND

| Skill | Usage | Chemin exact |
|-------|-------|-------------|
| **postgres-pro** | Optimisation requêtes PostgreSQL | `~/jeffallan-claude-skills/skills/postgres-pro/SKILL.md` |
| **sql-pro** | Requêtes SQL complexes, rapprochement | `~/jeffallan-claude-skills/skills/sql-pro/SKILL.md` |
| **cte-query-builder** | CTEs avancées (rapprochement multi-critères) | `~/claude-code-plugins-plus-skills/skills/12-data-analytics/cte-query-builder/SKILL.md` |
| **senior-data-engineer** | Architecture data, pipelines | `~/alirezarezvanhi-claude-skills/engineering-team/senior-data-engineer/SKILL.md` |
| **senior-backend** | Patterns backend senior | `~/alirezarezvanhi-claude-skills/engineering-team/senior-backend/SKILL.md` |
| **express-route-generator** | Routes Express propres | `~/claude-code-plugins-plus-skills/skills/06-backend-dev/express-route-generator/SKILL.md` |
| **redis-cache-manager** | Cache Redis (sessions, tokens Revolut 40min) | `~/claude-code-plugins-plus-skills/skills/06-backend-dev/redis-cache-manager/SKILL.md` |
| **api-design-reviewer** | Design REST API (endpoints Revolut, DocuSeal) | `~/alirezarezvanhi-claude-skills/engineering/api-design-reviewer/SKILL.md` |
| **database-optimization** | Indexation, performance BD | `~/alirezarezvanhi-claude-skills/engineering/database-optimization/SKILL.md` |

---

## 📤 API & WEBHOOKS

| Skill | Usage | Chemin exact |
|-------|-------|-------------|
| **webhook-receiver-generator** | Réception paiements Revolut, leads WP | `~/claude-code-plugins-plus-skills/skills/16-api-integration/webhook-receiver-generator/SKILL.md` |
| **webhook-signature-validator** | Sécurité webhooks (validation HMAC) | `~/claude-code-plugins-plus-skills/skills/16-api-integration/webhook-signature-validator/SKILL.md` |
| **webhook-retry-handler** | Retry automatique si webhook échoue | `~/claude-code-plugins-plus-skills/skills/16-api-integration/webhook-retry-handler/SKILL.md` |
| **server-sent-events-setup** | Notifications push temps réel | `~/claude-code-plugins-plus-skills/skills/16-api-integration/server-sent-events-setup/SKILL.md` |
| **api-client-generator** | Clients API (Mautic, Invoice Ninja, Revolut) | `~/claude-code-plugins-plus-skills/skills/16-api-integration/api-client-generator/SKILL.md` |
| **api-response-cacher** | Cache réponses API (performance) | `~/claude-code-plugins-plus-skills/skills/16-api-integration/api-response-cacher/SKILL.md` |
| **senior-fullstack** | Architecture API complète | `~/jeffallan-claude-skills/skills/fullstack-guardian/SKILL.md` |

---

## 💰 FINANCE & CONFORMITÉ SUISSE

| Skill | Usage | Chemin exact |
|-------|-------|-------------|
| **swiss-compliance-engine** ⚠️ | TVA 8.1/2.6/3.8%, QR-Invoice, Form 200 | `.claude/skills/swiss-compliance-engine/SKILL.md` |
| **financial-analyst** | Analyse financière, KPIs, P&L | `~/alirezarezvanhi-claude-skills/finance/financial-analyst/SKILL.md` |
| **invoice-generator** | Génération factures | Dans registry categories/finance.md |

> ⚠️ `swiss-compliance-engine` est **OBLIGATOIRE** pour tout fichier touchant TVA, facturation, comptabilité

---

## 📊 GRAPHIQUES & VISUALISATION

| Skill | Usage | Chemin exact |
|-------|-------|-------------|
| **Recharts via Context7** | SEUL outil graphique autorisé (JAMAIS ApexCharts) | `Context7 MCP → rechercher "recharts"` |
| **mermaid-flowchart-generator** | Diagrammes Mermaid (architecture, flows) | `~/claude-code-plugins-plus-skills/skills/18-visual-content/mermaid-flowchart-generator/SKILL.md` |

---

## 🛡️ SÉCURITÉ

| Skill | Usage | Chemin exact |
|-------|-------|-------------|
| **api-key-manager** | Gestion API keys (Revolut, DocuSeal, OpenAI) | `~/claude-code-plugins-plus-skills/skills/03-security-fundamentals/api-key-manager/SKILL.md` |
| **rate-limiter-config** | Protection endpoints publics | `~/claude-code-plugins-plus-skills/skills/03-security-fundamentals/rate-limiter-config/SKILL.md` |
| **secure-code-guardian** | Review sécurité du code | `~/jeffallan-claude-skills/skills/secure-code-guardian/SKILL.md` |
| **senior-security** | Architecture sécurité senior | `~/alirezarezvanhi-claude-skills/engineering-team/senior-security/SKILL.md` |

---

## ✅ QUALITÉ & TESTS

| Skill | Usage | Chemin exact |
|-------|-------|-------------|
| **playwright-expert** | Tests E2E portails | `~/jeffallan-claude-skills/skills/playwright-expert/SKILL.md` |
| **senior-qa** | QA senior methodology | `~/alirezarezvanhi-claude-skills/engineering-team/senior-qa/SKILL.md` |
| **api-test-generator** | Tests API automatisés | `~/claude-code-plugins-plus-skills/skills/09-test-automation/api-test-generator/SKILL.md` |
| **accessibility-audit-runner** | WCAG, aria-labels, contraste | `~/claude-code-plugins-plus-skills/skills/05-frontend-dev/accessibility-audit-runner/SKILL.md` |
| **color-contrast-checker** | Vérificateur WCAG AA/AAA | `~/claude-code-plugins-plus-skills/skills/05-frontend-dev/color-contrast-checker/SKILL.md` |
| **web-vitals-monitor** | LCP, FID, CLS — Core Web Vitals | `~/claude-code-plugins-plus-skills/skills/05-frontend-dev/web-vitals-monitor/SKILL.md` |
| **bundle-size-analyzer** | Analyser et réduire le poids JS/CSS | `~/claude-code-plugins-plus-skills/skills/05-frontend-dev/bundle-size-analyzer/SKILL.md` |
| **webapp-testing** | Tests visuels composants | `~/anthropics-skills/skills/webapp-testing/SKILL.md` |

---

## 🧠 AI / ML

| Skill | Usage | Chemin exact |
|-------|-------|-------------|
| **senior-ml-engineer** | Features ML/IA (qualification leads) | Dans registry categories/ai-ml.md |
| **senior-prompt-engineer** | Optimisation prompts Claude API | Dans registry categories/ai-ml.md |
| **financial-analyst** | Analyse data financière | `~/alirezarezvanhi-claude-skills/finance/financial-analyst/SKILL.md` |
| **senior-computer-vision** | OCR/Vision (OpenAI Vision) | Dans registry categories/ai-ml.md |

---

## 🏢 BUSINESS / CEO

| Skill | Usage | Chemin exact |
|-------|-------|-------------|
| **ceo-advisor** | Décisions stratégiques CEO | Dans registry categories/business.md |
| **cto-advisor** | Choix techniques architecturaux | Dans registry categories/business.md |
| **product-strategist** | Stratégie produit | Dans registry categories/business.md |
| **ceo-dashboard-designer** | Dashboard CEO HYPERVISUAL | `.claude/skills/ceo-dashboard-designer/SKILL.md` |

---

## 🚀 DEVOPS

| Skill | Usage | Chemin exact |
|-------|-------|-------------|
| **senior-devops** | Architecture DevOps senior | Dans registry categories/devops.md |
| **docker-stack-ops** | Docker HYPERVISUAL | `.claude/skills/docker-stack-ops/SKILL.md` |
| **ln-731-docker-generator** | Génération Docker configs | Dans registry categories/devops.md |
| **ln-771-logging-configurator** | Logging et monitoring | Dans registry categories/devops.md |

---

## ❌ SKILLS INTERDITS SUR CE PROJET

| Skill | Raison |
|-------|--------|
| `nextjs-*` | React + Vite uniquement |
| `react-native-*` | Pas d'app mobile V1 |
| `angular-*` / `vue-*` | React uniquement |
| Tout skill AWS/GCP/Azure | Storage Directus local |
| `apexcharts-*` | Recharts uniquement |
| `glassmorphism` / gradients décoratifs | Design Apple Premium Monochromatic |

---

## 📍 COMMENT UTILISER CET INDEX

**30 secondes pour choisir tes skills :**
1. Identifier le type de tâche (UI ? Backend ? Finance ? Webhook ?)
2. Scanner la section correspondante ci-dessus
3. Choisir 2-4 skills avec leurs chemins exacts
4. Lire chaque SKILL.md choisi AVANT de coder
5. Écrire le BLOC DE DÉCLARATION (voir format en haut)

**Pour les 939 skills non listés ici :**
→ Lire `.claude/skills/skill-router/references/categories/<categorie>.md`
→ Disponible pour : ai-ml (76), api (57), business (10), database (57), devops (62), documentation (33), finance (3), frontend (39), orchestration (19), other (278), performance (36), productivity (73), regulatory (55), security (73), testing (68)
