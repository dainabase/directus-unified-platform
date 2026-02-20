# SKILLS MAPPING — HYPERVISUAL Unified Platform
**Version** : 2.0 | **Date** : Fevrier 2026  
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
> Chaque composant visuel doit reflechir ce changement. Le code UI mediocre est INACCEPTABLE.

### Philosophie design obligatoire
- **Monochromatic** : zinc/slate/white/black comme palette principale
- **Semantique uniquement** : couleurs UNIQUEMENT pour success (emerald), warning (amber), danger (red), info (blue)
- **Typographie** : Inter/SF Pro, hierarchie stricte (text-xs a text-2xl), jamais plus grand
- **Espacement** : genereux, respirant, pas de compression
- **Micro-interactions** : transitions 150-200ms, hover states subtils
- **Densite** : information dense mais lisible, comme Linear ou Vercel
- **Ombres** : shadow-sm uniquement, jamais de glow ou blur decoratif
- **Bords** : rounded-lg max, jamais rounded-full sur les cartes

### Stack skills obligatoire pour tout composant visuel

```
OBLIGATOIRE pour tout composant React UI :
~/.claude/skills-repos/anthropics-skills/skills/frontend-design/SKILL.md

OBLIGATOIRE pour le design system (couleurs, tokens, spacing) :
~/.claude/skills-repos/aliregarezvan i-claude-skills/product-team/ui-design-system/SKILL.md

OBLIGATOIRE pour les composants React (hooks, patterns) :
~/.claude/skills-repos/jeffallan-claude-skills/skills/react-expert/SKILL.md

OBLIGATOIRE pour composants structures :
~/.claude/skills-repos/claude-code-plugins-plus-skills/skills/05-frontend-dev/react-component-generator/SKILL.md
```

### Skills complementaires par besoin

```
# Formulaires complexes (QuoteForm, InvoiceGenerator, filtres)
~/.claude/skills-repos/awesome-claude-code-toolkit/skills/react-patterns/SKILL.md

# Hooks custom dedies (useQuote, useInvoice, useActivation)
~/.claude/skills-repos/claude-code-plugins-plus-skills/skills/05-frontend-dev/react-hook-creator/SKILL.md

# Classes Tailwind optimisees (eviter le bloat)
~/.claude/skills-repos/claude-code-plugins-plus-skills/skills/05-frontend-dev/tailwind-class-optimizer/SKILL.md

# Responsive design et breakpoints (sm/md/lg/xl/2xl)
~/.claude/skills-repos/claude-code-plugins-plus-skills/skills/05-frontend-dev/responsive-breakpoint-analyzer/SKILL.md

# Design system complet (theming, CSS variables, dark mode)
~/.claude/skills-repos/jezweb-claude-skills/skills/tailwind-theme-builder/SKILL.md

# Methodologie design web (BEM, accessibilite, WCAG)
~/.claude/skills-repos/jezweb-claude-skills/skills/web-design-methodology/SKILL.md

# shadcn/ui components
~/.claude/skills-repos/jezweb-claude-skills/skills/shadcn-ui/SKILL.md

# Feature complete frontend + backend
~/.claude/skills-repos/jeffallan-claude-skills/skills/fullstack-guardian/SKILL.md
```

### Checklist qualite UI avant de committer
- [ ] Palette : uniquement zinc/slate/white + couleurs semantiques pour statuts
- [ ] Typographie : hierarchie Inter, tailles cohérentes
- [ ] Espacement : padding/margin genereux et coherents
- [ ] Etats : hover, active, disabled, loading tous definis
- [ ] Responsive : fonctionne sur 1280px et 1920px minimum
- [ ] Performance : pas de re-renders inutiles, memo si necessaire
- [ ] Accessibilite : aria-labels sur les actions, contraste suffisant
- [ ] Animations : 150-200ms max, prefers-reduced-motion respecte

---

## 💰 FINANCE & CONFORMITE SUISSE (Phases B, I)

```
OBLIGATOIRE pour QR-Invoice, TVA, mentions legales :
.claude/skills/swiss-compliance-engine/SKILL.md

POUR generation de factures (swissqrbill npm) :
Context7 MCP → rechercher "swissqrbill" documentation

POUR les workflows financiers complexes :
~/.claude/skills-repos/jeffallan-claude-skills/skills/fullstack-guardian/SKILL.md
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

POUR WebSocket / temps reel dashboard :
~/.claude/skills-repos/awesome-claude-code-toolkit/skills/websocket-realtime/SKILL.md

POUR Server-Sent Events (notifications push) :
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
~/.claude/skills-repos/awesome-claude-code-toolkit/skills/postgres-optimization/SKILL.md
.claude/skills/postgresql-directus-optimizer/SKILL.md

POUR queries SQL complexes (rapprochement multi-criteres) :
~/.claude/skills-repos/jeffallan-claude-skills/skills/sql-pro/SKILL.md

POUR profiling requetes lentes :
~/.claude/skills-repos/claude-code-plugins-plus-skills/skills/10-performance-testing/database-query-profiler/SKILL.md

POUR optimiser les CTE (rapprochement avance) :
~/.claude/skills-repos/claude-code-plugins-plus-skills/skills/12-data-analytics/cte-query-builder/SKILL.md
```

---

## 📦 BACKEND & API EXPRESS (Phases B, E, G, H)

```
POUR creer des routes Express propres :
~/.claude/skills-repos/claude-code-plugins-plus-skills/skills/06-backend-dev/express-route-generator/SKILL.md

POUR design REST API (endpoints Revolut, DocuSeal) :
~/.claude/skills-repos/awesome-claude-code-toolkit/skills/api-design-patterns/SKILL.md

POUR cache Redis (sessions, tokens Revolut 40min) :
~/.claude/skills-repos/claude-code-plugins-plus-skills/skills/06-backend-dev/redis-cache-manager/SKILL.md

POUR fullstack (feature complete frontend + backend) :
~/.claude/skills-repos/jeffallan-claude-skills/skills/fullstack-guardian/SKILL.md
```

---

## 📊 GRAPHIQUES & VISUALISATION (Dashboard CEO, KPIs)

```
POUR Recharts (seul outil autorise — JAMAIS ApexCharts) :
Context7 MCP → rechercher "recharts" documentation officielle

POUR diagrammes Mermaid (architecture, flows) :
~/.claude/skills-repos/daymade-claude-code-skills/mermaid-tools/SKILL.md
~/.claude/skills-repos/claude-code-plugins-plus-skills/skills/18-visual-content/mermaid-flowchart-generator/SKILL.md

POUR visualiser les flux de donnees (Lead → Devis → Facture → Projet) :
~/.claude/skills-repos/claude-code-plugins-plus-skills/skills/18-visual-content/api-flow-diagram-creator/SKILL.md
```

---

## 🧪 TESTS & QUALITE (Toutes phases)

```
POUR tests E2E Playwright (portails) :
Playwright MCP (deja configure dans .mcp.json)

POUR tests API :
~/.claude/skills-repos/claude-code-plugins-plus-skills/skills/09-test-automation/api-test-generator/SKILL.md

POUR tests base de donnees :
~/.claude/skills-repos/claude-code-plugins-plus-skills/skills/09-test-automation/database-test-helper/SKILL.md

POUR analyse statique du code :
ESLint MCP (deja configure dans .mcp.json)
```

---

## 🔐 SECURITE (Toutes phases)

```
POUR gestion API keys (Revolut, DocuSeal, OpenAI) :
~/.claude/skills-repos/claude-code-plugins-plus-skills/skills/03-security-fundamentals/api-key-manager/SKILL.md

POUR rate limiting (protection endpoints publics) :
~/.claude/skills-repos/claude-code-plugins-plus-skills/skills/03-security-fundamentals/rate-limiter-config/SKILL.md
```

---

## COMBINAISONS RECOMMANDEES PAR STORY ROADMAP

| Story | Skills a lire dans l'ordre |
|-------|---------------------------|
| **F-01** Lead WordPress | `directus-api-patterns` + `integration-sync-engine` + `webhook-receiver-generator` |
| **F-02** WhatsApp Lead | `directus-api-patterns` + `api-client-generator` + `webhook-receiver-generator` |
| **G-01** Revolut Webhook | `integration-sync-engine` + `webhook-receiver-generator` + `webhook-signature-validator` |
| **G-02** Rapprochement | `postgresql-directus-optimizer` + `sql-pro` + `cte-query-builder` |
| **G-03** Dashboard reconciliation | `ceo-dashboard-designer` + `frontend-design` + `directus-api-patterns` |
| **H-01** DocuSeal integration | `integration-sync-engine` + `swiss-compliance-engine` + `fullstack-guardian` |
| **H-02** DocuSeal webhook | `webhook-receiver-generator` + `webhook-signature-validator` + `directus-api-patterns` |
| **I-01** Facturation Jalons | `swiss-compliance-engine` + `directus-api-patterns` + `fullstack-guardian` |
| **I-02** Contrats recurrents | `swiss-compliance-engine` + `directus-api-patterns` + `react-expert` + `frontend-design` |
| **I-05** Validation fournisseurs | `directus-api-patterns` + `swiss-compliance-engine` + `react-component-generator` |
| **J-01** KPI Dashboard | `ceo-dashboard-designer` + `frontend-design` + `ui-design-system` + `directus-api-patterns` |
| **J-02** Alertes KPI | `ceo-dashboard-designer` + `frontend-design` + `react-hook-creator` |
| **Tout composant UI** | `frontend-design` + `ui-design-system` + `react-expert` + `react-component-generator` |
| **Tout refactoring design** | `frontend-design` + `ui-design-system` + `tailwind-theme-builder` + `web-design-methodology` |

---

## COMMENT UTILISER DANS UN PROMPT CLAUDE CODE

Chaque prompt doit commencer par :

```
## ETAPE 0 — OBLIGATOIRE AVANT TOUT CODE

Lire dans l'ordre ces fichiers AVANT d'ecrire la premiere ligne de code :

1. SKILL PROJET : /Users/jean-mariedelaunay/directus-unified-platform/.claude/skills/[NOM]/SKILL.md
2. SKILL SPECIALISE : /Users/jean-mariedelaunay/.claude/skills-repos/[CHEMIN]/SKILL.md
3. VERIFICATION DIRECTUS : Via MCP directus, confirmer les champs reels de [COLLECTION]

Si tu ne peux pas lire un fichier → STOP et signale l'erreur. Ne jamais deviner.
Reference : SKILLS-MAPPING.md pour trouver le bon skill par type de tache.

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
| `nextjs-mastery` | On est sur React + Vite, pas Next.js |
| `mobile-development` / `react-native-expert` | Pas d'app mobile dans V1 |
| `angular-architect` / `vue-expert` | On est sur React uniquement |
| Tout skill AWS / GCP / Azure | Storage Directus local, pas de cloud |
| `wordpress-pro` | JAMAIS de WordPress pour le dashboard |
| Tout skill ApexCharts | On utilise **uniquement Recharts** |
| Tout skill glassmorphism / gradient decoratif | Design Apple Premium Monochromatic uniquement |
