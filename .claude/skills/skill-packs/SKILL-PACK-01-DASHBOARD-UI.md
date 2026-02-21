# SKILL-PACK-01 — DASHBOARD UI
**Phases ROADMAP** : C.6, C.7, D.1.1, D.2.1, D.3.1, D.4.1, E.4
**Objectif** : Dashboard CEO workflow-first + 4 Hubs intégrations

## Custom Skills HYPERVISUAL (toujours disponibles dans le repo)
1. **ceo-dashboard-designer**
   PATH: `.claude/skills/ceo-dashboard-designer/SKILL.md`
   USAGE: Layout dashboard CEO, KPIs, alertes urgentes, barre statut intégrations

2. **multi-portal-architecture**
   PATH: `.claude/skills/multi-portal-architecture/SKILL.md`
   USAGE: Navigation multi-portails, sidebar SuperAdmin structure

3. **integration-sync-engine**
   PATH: `.claude/skills/integration-sync-engine/SKILL.md`
   USAGE: Statut connexions Invoice Ninja, Mautic, Revolut, ERPNext dans le dashboard

## Skills React/Frontend
4. **react-expert**
   PATH: `/Users/jean-mariedelaunay/.claude/skills-repos/jeffallan-claude-skills/skills/react-expert/SKILL.md`
   USAGE: Composants React 18, hooks, state management pour Hubs

5. **react-context-setup**
   PATH: `/Users/jean-mariedelaunay/.claude/skills-repos/claude-code-plugins-plus-skills/skills/05-frontend-dev/react-context-setup/SKILL.md`
   USAGE: Context global pour partage statut intégrations

6. **react-component-generator**
   PATH: `/Users/jean-mariedelaunay/.claude/skills-repos/claude-code-plugins-plus-skills/skills/05-frontend-dev/react-component-generator/SKILL.md`
   USAGE: Génération composants Hub (InvoiceNinjaHub, MauticHub, RevolutHub, ERPNextHub)

7. **react-hook-creator**
   PATH: `/Users/jean-mariedelaunay/.claude/skills-repos/claude-code-plugins-plus-skills/skills/05-frontend-dev/react-hook-creator/SKILL.md`
   USAGE: Hooks custom useRevolutBalance, useIntegrationStatus

8. **ui-design-system**
   PATH: `/Users/jean-mariedelaunay/.claude/skills-repos/alirezarezvani-claude-skills/product-team/ui-design-system/SKILL.md`
   USAGE: Design System Apple Premium Monochromatic — #F5F5F7, #1D1D1F, #0071E3

9. **frontend-design**
   PATH: `/Users/jean-mariedelaunay/.claude/skills-repos/anthropics-skills/skills/frontend-design/SKILL.md`
   USAGE: Production-grade interfaces, layout premium

10. **fullstack-guardian**
    PATH: `/Users/jean-mariedelaunay/.claude/skills-repos/jeffallan-claude-skills/skills/fullstack-guardian/SKILL.md`
    USAGE: Connexion API → UI pour les 4 Hubs (données réelles uniquement)

## Skills Data Visualization
11. **recharts** (via MCP Context7)
    PATH: MCP Context7 — rechercher "recharts 2.10"
    USAGE: BarChart trésorerie 30j dans Dashboard CEO

## MCP à utiliser
- MCP Directus : Lire collections pour données réelles (pas de mock)
- MCP GitHub : Vérifier commits avant modification
- MCP Context7 : Documentation Recharts live

## Design System OBLIGATOIRE
- Background: #F5F5F7 | Texte: #1D1D1F | Accent: #0071E3
- Sidebar: 240px, glassmorphism rgba(255,255,255,0.80) + backdrop-filter: blur(20px)
- Référence: src/styles/design-system.css
- ZÉRO couleur hors palette
