# SKILLS MAPPING — HYPERVISUAL Unified Platform
**Version** : 2.1 | **Date** : Fevrier 2026  
**Usage** : Ce fichier est lu par Claude Code AVANT chaque story.  
**Repository skills** : `~/.claude/skills-repos/`

> **REGLE D'OR** : Claude Code DOIT lire au minimum 2 skills avant de coder.  
> Un skill projet (`.claude/skills/`) + un skill specialise (`.claude/skills-repos/`).  
> Sans cette etape, le code produit sera generique. Avec, il sera exceptionnel.

---

## SKILLS PROJET (Niveau 1 — Toujours lire en premier)

Ces 8 skills sont specifiques au projet HYPERVISUAL. Lire selon le type de tache.

| Tache | Skill projet a lire |
|-------|--------------------|
| Tout ce qui touche Directus (fetch, write, relations) | `.claude/skills/directus-api-patterns/SKILL.md` |
| TVA, QR-Invoice, CGV, conformite CO suisse | `.claude/skills/swiss-compliance-engine/SKILL.md` |
| Logique portails (SuperAdmin/Client/Prestataire/Revendeur) | `.claude/skills/multi-portal-architecture/SKILL.md` |
| Dashboard CEO (layout, KPIs, widgets) | `.claude/skills/ceo-dashboard-designer/SKILL.md` |
| Performance requetes PostgreSQL | `.claude/skills/postgresql-directus-optimizer/SKILL.md` |
| Docker, services, infrastructure | `.claude/skills/docker-stack-ops/SKILL.md` |
| Connexions Invoice Ninja / Revolut / Mautic / ERPNext | `.claude/skills/integration-sync-engine/SKILL.md` |
| Choisir quel skill utiliser | `.claude/skills/skill-router/SKILL.md` |

---

## 🎨 DESIGN SYSTEM APPLE PREMIUM — STACK UI SENIOR++ (PRIORITE ABSOLUE)

> **CONTEXTE** : Le projet passe de l'ancien glassmorphism a un design Apple Premium Monochromatic.  
> **OBJECTIF** : UI/UX de niveau product designer senior, comme Linear, Vercel, Apple Developer Portal.  
> Chaque composant visuel DOIT refleter ce changement. Code UI mediocre = inacceptable.

### Philosophie design obligatoire
- **Monochromatic** : zinc/slate/white/black comme palette principale
- **Semantique uniquement** : couleurs UNIQUEMENT pour success (emerald), warning (amber), danger (red), info (blue)
- **Typographie** : Inter, hierarchie stricte (text-xs → text-2xl), jamais plus grand sauf hero
- **Espacement** : genereux, respirant, jamais compresse (min p-4 pour cards, gap-6 entre sections)
- **Micro-interactions** : transitions 150ms ease-out, hover states subtils (scale-[1.01], brightness-95)
- **Densite** : information dense mais lisible — comme Linear ou Vercel, pas comme Material UI
- **Ombres** : shadow-sm uniquement, JAMAIS de glow, blur ou box-shadow colorees
- **Bords** : rounded-lg max pour les cards, rounded-md pour les inputs, rounded-full UNIQUEMENT pour les badges pill
- **ZERO glassmorphism** : pas de backdrop-blur, pas de bg-white/50, pas de border-white/20
- **ZERO gradients decoratifs** : les gradients sont INTERDITS sauf pour les graphiques de donnees

---

### 📐 STACK DESIGN SKILLS — CHEMINS REELS VERIFIES

#### NIVEAU 1 — Fondations UI (OBLIGATOIRE pour tout composant visuel)

```
# 1a. QUALITE VISUELLE EXCEPTIONNELLE (toujours lire en 1er)
# Source : Anthropic official skills
~/.claude/skills-repos/anthropics-skills/skills/frontend-design/SKILL.md

# 1b. DESIGN SYSTEM (tokens couleurs, spacing, typographie)
# Source : alirezarezvani - product-team
~/.claude/skills-repos/alirezarezvani-claude-skills/product-team/ui-design-system/SKILL.md

# 1c. METHODOLOGIE DESIGN WEB (BEM, accessibilite, dark mode, conventions)
# Source : jezweb
~/.claude/skills-repos/jezweb-claude-skills/skills/web-design-methodology/SKILL.md
```

#### NIVEAU 2 — UX Research & Patterns (pour nouveaux modules)

```
# 2a. UX RESEARCHER/DESIGNER (personas, user flows, heuristics)
# Source : alirezarezvani - product-team
~/.claude/skills-repos/alirezarezvani-claude-skills/product-team/ux-researcher-designer/SKILL.md

# 2b. PATTERNS DESIGN WEB (layouts, navigation, interaction patterns)
# Source : jezweb
~/.claude/skills-repos/jezweb-claude-skills/skills/web-design-patterns/SKILL.md

# 2c. AUDIT UX (evaluer et ameliorer l'UX existante)
# Source : jezweb
~/.claude/skills-repos/jezweb-claude-skills/skills/ux-audit/SKILL.md
```

#### NIVEAU 3 — React Implementation (pour tout composant React)

```
# 3a. REACT 18 EXPERT (hooks, patterns, performance, composition)
# Source : jeffallan
~/.claude/skills-repos/jeffallan-claude-skills/skills/react-expert/SKILL.md

# 3b. SENIOR FRONTEND (best practices, architecture frontend senior)
# Source : alirezarezvani - engineering-team
~/.claude/skills-repos/alirezarezvani-claude-skills/engineering-team/senior-frontend/SKILL.md

# 3c. COMPOSANTS STRUCTURES (generation composant propre)
# Source : claude-code-plugins-plus
~/.claude/skills-repos/claude-code-plugins-plus-skills/skills/05-frontend-dev/react-component-generator/SKILL.md

# 3d. HOOKS CUSTOM DEDIES (useQuote, useInvoice, useProjects...)
# Source : claude-code-plugins-plus
~/.claude/skills-repos/claude-code-plugins-plus-skills/skills/05-frontend-dev/react-hook-creator/SKILL.md
```

#### NIVEAU 4 — Theming & Styles (pour design system et refactoring)

```
# 4a. TAILWIND THEME BUILDER (CSS variables, dark mode, theming)
# Source : jezweb
~/.claude/skills-repos/jezweb-claude-skills/skills/tailwind-theme-builder/SKILL.md

# 4b. TAILWIND OPTIMIZER (eviter le bloat, classes coherentes)
# Source : claude-code-plugins-plus
~/.claude/skills-repos/claude-code-plugins-plus-skills/skills/05-frontend-dev/tailwind-class-optimizer/SKILL.md

# 4c. COLOR PALETTE (coherence des couleurs, tokens semantiques)
# Source : jezweb
~/.claude/skills-repos/jezweb-claude-skills/skills/color-palette/SKILL.md

# 4d. THEME FACTORY (generation de themes complets)
# Source : Anthropic official
~/.claude/skills-repos/anthropics-skills/skills/theme-factory/SKILL.md

# 4e. ICON SET (icones coherentes dans le design system)
# Source : jezweb
~/.claude/skills-repos/jezweb-claude-skills/skills/icon-set-generator/SKILL.md
```

#### NIVEAU 5 — Qualite & Performance (avant chaque commit)

```
# 5a. ACCESSIBILITE (WCAG, aria-labels, contraste, navigation clavier)
# Source : claude-code-plugins-plus
~/.claude/skills-repos/claude-code-plugins-plus-skills/skills/05-frontend-dev/accessibility-audit-runner/SKILL.md

# 5b. CONTRASTE COULEURS (verificateur WCAG AA/AAA)
# Source : claude-code-plugins-plus
~/.claude/skills-repos/claude-code-plugins-plus-skills/skills/05-frontend-dev/color-contrast-checker/SKILL.md

# 5c. WEB VITALS (LCP, FID, CLS — Core Web Vitals)
# Source : claude-code-plugins-plus
~/.claude/skills-repos/claude-code-plugins-plus-skills/skills/05-frontend-dev/web-vitals-monitor/SKILL.md

# 5d. BUNDLE SIZE (analyser et reduire le poids JS/CSS)
# Source : claude-code-plugins-plus
~/.claude/skills-repos/claude-code-plugins-plus-skills/skills/05-frontend-dev/bundle-size-analyzer/SKILL.md

# 5e. RESPONSIVE BREAKPOINTS (sm/md/lg/xl/2xl coherents)
# Source : claude-code-plugins-plus
~/.claude/skills-repos/claude-code-plugins-plus-skills/skills/05-frontend-dev/responsive-breakpoint-analyzer/SKILL.md

# 5f. WEBAPP TESTING (tests visuels, interactions)
# Source : Anthropic official
~/.claude/skills-repos/anthropics-skills/skills/webapp-testing/SKILL.md
```

#### NIVEAU 6 — Composants Speciaux

```
# 6a. SHADCN/UI (composants accessibles et bien architectures)
# Source : jezweb
~/.claude/skills-repos/jezweb-claude-skills/skills/shadcn-ui/SKILL.md

# 6b. ZUSTAND STORE (etat global bien structure)
# Source : claude-code-plugins-plus
~/.claude/skills-repos/claude-code-plugins-plus-skills/skills/05-frontend-dev/zustand-store-creator/SKILL.md

# 6c. FULLSTACK GUARDIAN (feature complete front + back)
# Source : jeffallan
~/.claude/skills-repos/jeffallan-claude-skills/skills/fullstack-guardian/SKILL.md

# 6d. REACT PATTERNS AVANCES (formulaires complexes, HOC, render props)
# Source : awesome-claude-code-toolkit
~/.claude/skills-repos/awesome-claude-code-toolkit/skills/react-patterns/SKILL.md

# 6e. WEB ARTIFACTS BUILDER (composants elabores multi-layer)
# Source : Anthropic official
~/.claude/skills-repos/anthropics-skills/skills/web-artifacts-builder/SKILL.md
```

---

### Checklist qualite UI OBLIGATOIRE avant chaque commit

```
[ ] Palette : uniquement zinc/slate/white + couleurs semantiques pour statuts
[ ] ZERO glassmorphism, ZERO gradient decoratif, ZERO shadow coloree
[ ] Typographie : hierarchie Inter coherente, tailles standard
[ ] Espacement : padding/margin genereux et coherents (multiples de 4px)
[ ] Etats complets : hover, active, disabled, loading, empty state
[ ] Responsive : fonctionne a 1280px et 1920px minimum
[ ] Performance : pas de re-renders inutiles, useMemo/useCallback si pertinent
[ ] Accessibilite : aria-labels sur actions, contraste WCAG AA minimum
[ ] Animations : 150ms max, prefers-reduced-motion respecte
[ ] Dark mode : si le design system le prevoit, implement correctement
```

---

## 💰 FINANCE & CONFORMITE SUISSE (Phases B, I)

```
OBLIGATOIRE pour QR-Invoice, TVA, mentions legales :
.claude/skills/swiss-compliance-engine/SKILL.md

POUR generation de factures (swissqrbill npm) :
Context7 MCP → rechercher "swissqrbill" documentation

POUR les workflows financiers complexes :
~/.claude/skills-repos/jeffallan-claude-skills/skills/fullstack-guardian/SKILL.md

POUR analyse financiere et KPIs :
~/.claude/skills-repos/alirezarezvani-claude-skills/finance/financial-analyst/SKILL.md
```

---

## 📡 WEBHOOKS & AUTOMATIONS (Phases E, G)

```
POUR Revolut webhook (reception paiements) :
~/.claude/skills-repos/claude-code-plugins-plus-skills/skills/16-api-integration/webhook-receiver-generator/SKILL.md

POUR valider la signature des webhooks (securite) :
~/.claude/skills-repos/claude-code-plugins-plus-skills/skills/16-api-integration/webhook-signature-validator/SKILL.md

POUR retry automatique si webhook echoue :
~/.claude/skills-repos/claude-code-plugins-plus-skills/skills/16-api-integration/webhook-retry-handler/SKILL.md

POUR Server-Sent Events (notifications push temps reel) :
~/.claude/skills-repos/claude-code-plugins-plus-skills/skills/16-api-integration/server-sent-events-setup/SKILL.md

POUR integration API Mautic, Invoice Ninja, Revolut :
~/.claude/skills-repos/claude-code-plugins-plus-skills/skills/16-api-integration/api-client-generator/SKILL.md

POUR mise en cache des reponses API (perf) :
~/.claude/skills-repos/claude-code-plugins-plus-skills/skills/16-api-integration/api-response-cacher/SKILL.md
```

---

## 🗄️ BASE DE DONNEES & PERFORMANCE (Phase G — Rapprochement)

```
POUR optimisation requetes PostgreSQL :
~/.claude/skills-repos/jeffallan-claude-skills/skills/postgres-pro/SKILL.md
.claude/skills/postgresql-directus-optimizer/SKILL.md

POUR queries SQL complexes (rapprochement multi-criteres) :
~/.claude/skills-repos/jeffallan-claude-skills/skills/sql-pro/SKILL.md

POUR optimiser les CTE (rapprochement avance) :
~/.claude/skills-repos/claude-code-plugins-plus-skills/skills/12-data-analytics/cte-query-builder/SKILL.md
```

---

## 📦 BACKEND & API EXPRESS (Phases B, E, G, H)

```
POUR creer des routes Express propres :
~/.claude/skills-repos/claude-code-plugins-plus-skills/skills/06-backend-dev/express-route-generator/SKILL.md

POUR design REST API (endpoints Revolut, DocuSeal) :
~/.claude/skills-repos/alirezarezvani-claude-skills/engineering/api-design-reviewer/SKILL.md

POUR cache Redis (sessions, tokens Revolut 40min) :
~/.claude/skills-repos/claude-code-plugins-plus-skills/skills/06-backend-dev/redis-cache-manager/SKILL.md

POUR senior backend patterns :
~/.claude/skills-repos/alirezarezvani-claude-skills/engineering-team/senior-backend/SKILL.md
```

---

## 📊 GRAPHIQUES & VISUALISATION (Dashboard CEO, KPIs)

```
POUR Recharts (seul outil autorise — JAMAIS ApexCharts) :
Context7 MCP → rechercher "recharts" documentation officielle

POUR diagrammes Mermaid (architecture, flows) :
~/.claude/skills-repos/claude-code-plugins-plus-skills/skills/18-visual-content/mermaid-flowchart-generator/SKILL.md
```

---

## 🧪 TESTS & QUALITE (Toutes phases)

```
POUR tests E2E Playwright (portails) :
Playwright MCP (deja configure dans .mcp.json)
~/.claude/skills-repos/jeffallan-claude-skills/skills/playwright-expert/SKILL.md

POUR tests API :
~/.claude/skills-repos/claude-code-plugins-plus-skills/skills/09-test-automation/api-test-generator/SKILL.md

POUR analyse statique du code :
ESLint MCP (deja configure dans .mcp.json)

POUR senior QA :
~/.claude/skills-repos/alirezarezvani-claude-skills/engineering-team/senior-qa/SKILL.md
```

---

## 🔐 SECURITE (Toutes phases)

```
POUR gestion API keys (Revolut, DocuSeal, OpenAI) :
~/.claude/skills-repos/claude-code-plugins-plus-skills/skills/03-security-fundamentals/api-key-manager/SKILL.md

POUR rate limiting (protection endpoints publics) :
~/.claude/skills-repos/claude-code-plugins-plus-skills/skills/03-security-fundamentals/rate-limiter-config/SKILL.md

POUR review securite du code :
~/.claude/skills-repos/jeffallan-claude-skills/skills/secure-code-guardian/SKILL.md
```

---

## COMBINAISONS RECOMMANDEES PAR STORY ROADMAP

| Story | Skills a lire dans l'ordre |
|-------|---------------------------|
| **Tout refactoring design** | `frontend-design` + `ui-design-system` + `web-design-methodology` + `ux-audit` |
| **Nouveau composant UI** | `frontend-design` + `ui-design-system` + `react-expert` + `react-component-generator` |
| **Dashboard / KPI widget** | `ceo-dashboard-designer` + `frontend-design` + `ui-design-system` + `directus-api-patterns` |
| **Formulaire complexe** | `frontend-design` + `react-expert` + `react-hook-creator` + `directus-api-patterns` |
| **Nouveau module complet** | `frontend-design` + `ux-researcher-designer` + `web-design-patterns` + `fullstack-guardian` |
| **Audit UX module existant** | `ux-audit` + `web-design-methodology` + `color-contrast-checker` + `accessibility-audit-runner` |
| **F-01** Lead WordPress | `directus-api-patterns` + `integration-sync-engine` + `webhook-receiver-generator` |
| **F-02** WhatsApp Lead | `directus-api-patterns` + `api-client-generator` + `webhook-receiver-generator` |
| **G-01** Revolut Webhook | `integration-sync-engine` + `webhook-receiver-generator` + `webhook-signature-validator` |
| **G-02** Rapprochement | `postgresql-directus-optimizer` + `sql-pro` + `cte-query-builder` |
| **G-03** Dashboard reconciliation | `ceo-dashboard-designer` + `frontend-design` + `ui-design-system` + `directus-api-patterns` |
| **H-01** DocuSeal integration | `integration-sync-engine` + `swiss-compliance-engine` + `fullstack-guardian` |
| **I-01** Facturation Jalons | `swiss-compliance-engine` + `directus-api-patterns` + `fullstack-guardian` |
| **I-02** Contrats recurrents | `swiss-compliance-engine` + `directus-api-patterns` + `frontend-design` + `react-expert` |
| **J-01** KPI Dashboard | `ceo-dashboard-designer` + `frontend-design` + `ui-design-system` + `ux-researcher-designer` |
| **J-02** Alertes KPI | `ceo-dashboard-designer` + `frontend-design` + `react-hook-creator` |

---

## COMMENT UTILISER DANS UN PROMPT CLAUDE CODE

Chaque prompt doit commencer par :

```
## ETAPE 0 — OBLIGATOIRE AVANT TOUT CODE

Lire dans l'ordre ces fichiers AVANT d'ecrire la premiere ligne de code :

1. SKILL PROJET : .claude/skills/[NOM]/SKILL.md
2. SKILL DESIGN : ~/.claude/skills-repos/anthropics-skills/skills/frontend-design/SKILL.md
3. SKILL SPECIALISE : ~/.claude/skills-repos/[CHEMIN]/SKILL.md
4. VERIFICATION DIRECTUS : Via MCP directus, confirmer les champs reels de [COLLECTION]

Si tu ne peux pas lire un fichier → STOP et signale l'erreur. Ne jamais deviner.
Reference : SKILLS-MAPPING.md pour les chemins complets par type de tache.

## ETAPE FINALE — OBLIGATOIRE APRES TOUT CODE

Mettre a jour ROADMAP.md :
- Passer la story [Story-ID] de [ ] → [V]
- Ajouter la date (format YYYY-MM-DD)
- Logger toute decouverte inattendue dans la section DECOUVERTES
```

---

## SKILLS A NE PAS UTILISER SUR CE PROJET

| Skill | Raison |
|-------|-------|
| `nextjs-developer` | React + Vite uniquement, pas Next.js |
| `react-native-expert` | Pas d'app mobile dans V1 |
| `angular-architect` / `vue-expert` | React uniquement |
| Tout skill AWS / GCP / Azure | Storage Directus local |
| `wordpress-pro` | JAMAIS de WordPress pour le dashboard |
| Tout skill ApexCharts | Recharts uniquement |
| `glassmorphism` / gradients decoratifs | Design Apple Premium Monochromatic uniquement |
