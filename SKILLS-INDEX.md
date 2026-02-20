# SKILLS-INDEX.md — Index Complet des Skills Disponibles

> **IMPORTANT** : Ce fichier est une version initiale statique.
> Pour obtenir l'index à jour complet (939 skills), exécuter :
> ```bash
> bash scripts/generate-skills-index.sh
> ```
> Ce script scanne `~/.claude/skills-repos/` en temps réel et régénère ce fichier.

> ## COMMENT UTILISER CET INDEX
> 1. **Lire ce fichier EN ENTIER** avant toute tâche (2-3 minutes)
> 2. **Identifier** les skills pertinents pour la tâche en cours
> 3. **Lire** leurs fichiers SKILL.md complets (chemins indiqués)
> 4. **Coder** seulement après avoir lu minimum 2-3 skills
>
> ⛔ **RÈGLE ABSOLUE** : Ne jamais commencer à coder sans avoir lu cet index

---

## 📁 SKILLS PROJET (Spécifiques HYPERVISUAL — PRIORITÉ MAXIMALE)

Ces skills connaissent l'architecture exacte du projet. Toujours lire en premier.

- **directus-api-patterns** `.claude/skills/directus-api-patterns/SKILL.md`
  > Patterns d'accès Directus : ItemsService, relations, filtres, hooks. Ne jamais utiliser Knex brut.

- **swiss-compliance-engine** `.claude/skills/swiss-compliance-engine/SKILL.md`
  > TVA 2025 (8.1%/2.6%/3.8%), QR-Invoice v2.3, Formulaire 200 AFC, Code des Obligations

- **multi-portal-architecture** `.claude/skills/multi-portal-architecture/SKILL.md`
  > Architecture 4 portails (SuperAdmin/Client/Prestataire/Revendeur), RBAC, routing JWT

- **ceo-dashboard-designer** `.claude/skills/ceo-dashboard-designer/SKILL.md`
  > Layout dashboard CEO, KPIs, widgets, graphiques Recharts, alertes temps réel

- **postgresql-directus-optimizer** `.claude/skills/postgresql-directus-optimizer/SKILL.md`
  > Optimisation requêtes PostgreSQL via Directus, index, explain analyze

- **integration-sync-engine** `.claude/skills/integration-sync-engine/SKILL.md`
  > Synchronisation Invoice Ninja / Revolut / Mautic / ERPNext avec Directus

- **docker-stack-ops** `.claude/skills/docker-stack-ops/SKILL.md`
  > Opérations Docker Compose, services, networking, volumes

- **skill-router** `.claude/skills/skill-router/SKILL.md`
  > Router intelligent pour sélectionner les meilleurs skills selon la tâche

---

## 🗂️ SKILLS REPOS EXTERNES

### 📦 anthropics-skills (Skills officiels Anthropic)

- **frontend-design** `~/.claude/skills-repos/anthropics-skills/skills/frontend-design/SKILL.md`
  *Qualité visuelle exceptionnelle, design system, composants premium. TOUJOURS lire pour tout composant UI.*

- **theme-factory** `~/.claude/skills-repos/anthropics-skills/skills/theme-factory/SKILL.md`
  *Génération de thèmes complets, tokens CSS, design tokens cohérents*

- **web-artifacts-builder** `~/.claude/skills-repos/anthropics-skills/skills/web-artifacts-builder/SKILL.md`
  *Composants web élaborés multi-couches, artifacts complexes*

- **webapp-testing** `~/.claude/skills-repos/anthropics-skills/skills/webapp-testing/SKILL.md`
  *Tests visuels, tests d'interactions, validation UI*

---

### 📦 alirezarezvani-claude-skills

#### product-team
- **ui-design-system** `~/.claude/skills-repos/alirezarezvani-claude-skills/product-team/ui-design-system/SKILL.md`
  *Design system complet : tokens couleurs, spacing, typographie, composants*

- **ux-researcher-designer** `~/.claude/skills-repos/alirezarezvani-claude-skills/product-team/ux-researcher-designer/SKILL.md`
  *Personas, user flows, heuristiques Nielsen, UX research*

#### engineering-team
- **senior-frontend** `~/.claude/skills-repos/alirezarezvani-claude-skills/engineering-team/senior-frontend/SKILL.md`
  *Best practices frontend senior, architecture propre, performance*

- **senior-backend** `~/.claude/skills-repos/alirezarezvani-claude-skills/engineering-team/senior-backend/SKILL.md`
  *Patterns backend senior, API design, services*

- **senior-fullstack** `~/.claude/skills-repos/alirezarezvani-claude-skills/engineering-team/senior-fullstack/SKILL.md`
  *Architecture fullstack, feature complète front+back*

- **senior-qa** `~/.claude/skills-repos/alirezarezvani-claude-skills/engineering-team/senior-qa/SKILL.md`
  *QA senior : stratégie tests, couverture, qualité*

#### finance
- **financial-analyst** `~/.claude/skills-repos/alirezarezvani-claude-skills/finance/financial-analyst/SKILL.md`
  *Analyse financière, KPIs, P&L, tableaux de bord financiers*

#### engineering
- **api-design-reviewer** `~/.claude/skills-repos/alirezarezvani-claude-skills/engineering/api-design-reviewer/SKILL.md`
  *Review design API REST, conventions, sécurité*

---

### 📦 jezweb-claude-skills

- **web-design-methodology** `~/.claude/skills-repos/jezweb-claude-skills/skills/web-design-methodology/SKILL.md`
  *BEM, accessibilité, dark mode, conventions design web*

- **web-design-patterns** `~/.claude/skills-repos/jezweb-claude-skills/skills/web-design-patterns/SKILL.md`
  *Patterns layouts, navigation, interaction design*

- **ux-audit** `~/.claude/skills-repos/jezweb-claude-skills/skills/ux-audit/SKILL.md`
  *Évaluer et améliorer l'UX existante, audit heuristique*

- **tailwind-theme-builder** `~/.claude/skills-repos/jezweb-claude-skills/skills/tailwind-theme-builder/SKILL.md`
  *Variables CSS Tailwind, dark mode, theming complet*

- **color-palette** `~/.claude/skills-repos/jezweb-claude-skills/skills/color-palette/SKILL.md`
  *Cohérence couleurs, tokens sémantiques, contrastes*

- **shadcn-ui** `~/.claude/skills-repos/jezweb-claude-skills/skills/shadcn-ui/SKILL.md`
  *Composants shadcn/ui accessibles et bien architecturés*

- **icon-set-generator** `~/.claude/skills-repos/jezweb-claude-skills/skills/icon-set-generator/SKILL.md`
  *Icônes cohérentes dans le design system*

---

### 📦 jeffallan-claude-skills

- **react-expert** `~/.claude/skills-repos/jeffallan-claude-skills/skills/react-expert/SKILL.md`
  *React 18 patterns, hooks avancés, performance, composition*

- **fullstack-guardian** `~/.claude/skills-repos/jeffallan-claude-skills/skills/fullstack-guardian/SKILL.md`
  *Feature complète fullstack front+back, architecture propre*

- **playwright-expert** `~/.claude/skills-repos/jeffallan-claude-skills/skills/playwright-expert/SKILL.md`
  *Tests E2E Playwright, portails, parcours utilisateur*

- **postgres-pro** `~/.claude/skills-repos/jeffallan-claude-skills/skills/postgres-pro/SKILL.md`
  *PostgreSQL avancé, optimisation, index, requêtes complexes*

- **sql-pro** `~/.claude/skills-repos/jeffallan-claude-skills/skills/sql-pro/SKILL.md`
  *SQL expert, CTEs, window functions, optimisation*

- **secure-code-guardian** `~/.claude/skills-repos/jeffallan-claude-skills/skills/secure-code-guardian/SKILL.md`
  *Review sécurité, vulnérabilités, bonnes pratiques*

---

### 📦 claude-code-plugins-plus-skills

#### 03-security-fundamentals
- **api-key-manager** `~/.claude/skills-repos/claude-code-plugins-plus-skills/skills/03-security-fundamentals/api-key-manager/SKILL.md`
  *Gestion sécurisée des API keys (Revolut, DocuSeal, OpenAI)*

- **rate-limiter-config** `~/.claude/skills-repos/claude-code-plugins-plus-skills/skills/03-security-fundamentals/rate-limiter-config/SKILL.md`
  *Protection endpoints publics, rate limiting*

#### 05-frontend-dev
- **react-component-generator** `~/.claude/skills-repos/claude-code-plugins-plus-skills/skills/05-frontend-dev/react-component-generator/SKILL.md`
  *Génération composants React structurés et architecturés*

- **react-hook-creator** `~/.claude/skills-repos/claude-code-plugins-plus-skills/skills/05-frontend-dev/react-hook-creator/SKILL.md`
  *Hooks custom dédiés (useQuote, useInvoice, useProjects...)*

- **tailwind-class-optimizer** `~/.claude/skills-repos/claude-code-plugins-plus-skills/skills/05-frontend-dev/tailwind-class-optimizer/SKILL.md`
  *Éviter le bloat Tailwind, classes cohérentes et optimisées*

- **responsive-breakpoint-analyzer** `~/.claude/skills-repos/claude-code-plugins-plus-skills/skills/05-frontend-dev/responsive-breakpoint-analyzer/SKILL.md`
  *Breakpoints sm/md/lg/xl/2xl cohérents, responsive design*

- **accessibility-audit-runner** `~/.claude/skills-repos/claude-code-plugins-plus-skills/skills/05-frontend-dev/accessibility-audit-runner/SKILL.md`
  *WCAG, aria-labels, navigation clavier, contraste*

- **color-contrast-checker** `~/.claude/skills-repos/claude-code-plugins-plus-skills/skills/05-frontend-dev/color-contrast-checker/SKILL.md`
  *Vérificateur WCAG AA/AAA, contrastes couleurs*

- **web-vitals-monitor** `~/.claude/skills-repos/claude-code-plugins-plus-skills/skills/05-frontend-dev/web-vitals-monitor/SKILL.md`
  *LCP, FID, CLS — Core Web Vitals*

- **bundle-size-analyzer** `~/.claude/skills-repos/claude-code-plugins-plus-skills/skills/05-frontend-dev/bundle-size-analyzer/SKILL.md`
  *Analyser et réduire le poids JS/CSS*

- **zustand-store-creator** `~/.claude/skills-repos/claude-code-plugins-plus-skills/skills/05-frontend-dev/zustand-store-creator/SKILL.md`
  *État global Zustand bien structuré*

#### 06-backend-dev
- **express-route-generator** `~/.claude/skills-repos/claude-code-plugins-plus-skills/skills/06-backend-dev/express-route-generator/SKILL.md`
  *Routes Express propres, middleware, validation*

- **redis-cache-manager** `~/.claude/skills-repos/claude-code-plugins-plus-skills/skills/06-backend-dev/redis-cache-manager/SKILL.md`
  *Cache Redis, sessions, tokens Revolut 40min*

#### 09-test-automation
- **api-test-generator** `~/.claude/skills-repos/claude-code-plugins-plus-skills/skills/09-test-automation/api-test-generator/SKILL.md`
  *Tests API automatisés, couverture endpoints*

#### 12-data-analytics
- **cte-query-builder** `~/.claude/skills-repos/claude-code-plugins-plus-skills/skills/12-data-analytics/cte-query-builder/SKILL.md`
  *CTEs optimisées, rapprochement bancaire multi-critères*

#### 16-api-integration
- **webhook-receiver-generator** `~/.claude/skills-repos/claude-code-plugins-plus-skills/skills/16-api-integration/webhook-receiver-generator/SKILL.md`
  *Réception webhooks Revolut, validation signature, retry*

- **webhook-signature-validator** `~/.claude/skills-repos/claude-code-plugins-plus-skills/skills/16-api-integration/webhook-signature-validator/SKILL.md`
  *Sécurité webhooks, validation HMAC*

- **webhook-retry-handler** `~/.claude/skills-repos/claude-code-plugins-plus-skills/skills/16-api-integration/webhook-retry-handler/SKILL.md`
  *Retry automatique si webhook échoue*

- **server-sent-events-setup** `~/.claude/skills-repos/claude-code-plugins-plus-skills/skills/16-api-integration/server-sent-events-setup/SKILL.md`
  *Notifications push temps réel via SSE*

- **api-client-generator** `~/.claude/skills-repos/claude-code-plugins-plus-skills/skills/16-api-integration/api-client-generator/SKILL.md`
  *Clients API Mautic, Invoice Ninja, Revolut*

- **api-response-cacher** `~/.claude/skills-repos/claude-code-plugins-plus-skills/skills/16-api-integration/api-response-cacher/SKILL.md`
  *Mise en cache des réponses API, performance*

#### 18-visual-content
- **mermaid-flowchart-generator** `~/.claude/skills-repos/claude-code-plugins-plus-skills/skills/18-visual-content/mermaid-flowchart-generator/SKILL.md`
  *Diagrammes Mermaid, architecture, flows*

---

### 📦 awesome-claude-code-toolkit

- **react-patterns** `~/.claude/skills-repos/awesome-claude-code-toolkit/skills/react-patterns/SKILL.md`
  *Patterns React avancés : formulaires complexes, HOC, render props*

---

## 🎯 GUIDE DE SÉLECTION RAPIDE

| Type de tâche | Skills prioritaires (dans l'ordre) |
|---------------|------------------------------------|
| **UI/UX — nouveau composant React** | `frontend-design` → `ui-design-system` → `react-expert` → `react-component-generator` |
| **UI/UX — refactoring design** | `frontend-design` → `ui-design-system` → `web-design-methodology` → `ux-audit` |
| **Dashboard / KPIs / Charts** | `ceo-dashboard-designer` → `frontend-design` → `ui-design-system` → `directus-api-patterns` |
| **Formulaire complexe** | `frontend-design` → `react-expert` → `react-hook-creator` → `directus-api-patterns` |
| **Sidebar / Navigation** | `frontend-design` → `ui-design-system` → `web-design-patterns` → `react-expert` |
| **Design system — tokens CSS** | `ui-design-system` → `theme-factory` → `tailwind-theme-builder` → `color-palette` |
| **Module complet fullstack** | `frontend-design` → `ux-researcher-designer` → `fullstack-guardian` → `directus-api-patterns` |
| **API Express / Webhook** | `express-route-generator` → `webhook-receiver-generator` → `integration-sync-engine` |
| **Finance / TVA / QR-Invoice** | `swiss-compliance-engine` → `directus-api-patterns` → `fullstack-guardian` |
| **Base de données / PostgreSQL** | `postgresql-directus-optimizer` → `postgres-pro` → `sql-pro` |
| **Sécurité / Auth JWT** | `secure-code-guardian` → `api-key-manager` → `rate-limiter-config` |
| **Tests E2E** | `playwright-expert` → `webapp-testing` → `api-test-generator` |
| **Performance frontend** | `web-vitals-monitor` → `bundle-size-analyzer` → `tailwind-class-optimizer` |
| **Accessibilité** | `accessibility-audit-runner` → `color-contrast-checker` → `web-design-methodology` |

> 📖 Voir aussi **SKILLS-MAPPING.md** pour les combinaisons recommandées par story ROADMAP  
> 🔄 Pour régénérer cet index : `bash scripts/generate-skills-index.sh`
