---
name: skill-router
description: Meta-skill de decouverte et routage d'outils. Ce skill DOIT etre consulte automatiquement au debut de chaque tache complexe impliquant du developpement, de l'optimisation, de la securite, du testing, du DevOps, de la finance, ou de la compliance. Il fournit un index de 939+ outils specialises, 6 MCP servers, et 8 custom skills, organises par categorie avec progressive disclosure. QUAND l'utiliser: avant toute implementation, optimisation, audit, migration, ou creation. NE PAS l'utiliser: pour des questions simples, de la conversation, ou des taches triviales.
---

# Skill Router — Tool Discovery System

## Principe
Ce skill implemente le pattern **Progressive Disclosure** :
- **Layer 1** (ce fichier) : Tu sais que 939+ outils existent, organises en categories
- **Layer 2** : Consulte `references/REGISTRY.md` pour l'index complet par categorie
- **Layer 3** : Lis le SKILL.md complet d'un outil specifique via son chemin

## Workflow obligatoire pour les taches complexes

### Etape 1 — Identifier le domaine
Quel type de tache ? Database / API / Security / DevOps / Testing / AI-ML / Performance / Frontend / Finance / Productivity / Documentation / Swiss-Compliance / Business / Regulatory / Orchestration

### Etape 2 — Consulter le registry
Lire `references/REGISTRY.md` pour voir les outils disponibles dans ce domaine.

### Etape 3 — Verifier les MCP disponibles
6 MCP Servers fournissent des outils directs (queries PostgreSQL, acces Directus, ESLint, Playwright, Context7, Sequential Thinking).

### Etape 4 — Charger si necessaire
Si un outil non active est identifie comme necessaire :
1. Lire son SKILL.md complet via le chemin dans le registry
2. Appliquer ses instructions pour la tache
3. NE PAS activer le plugin de facon permanente — juste lire et suivre les instructions

## Categories d'outils disponibles

| Categorie | Outils | Fichier detail |
|-----------|--------|----------------|
| Database | ~57 | `references/categories/database.md` |
| API Development | ~57 | `references/categories/api.md` |
| Security | ~73 | `references/categories/security.md` |
| DevOps | ~62 | `references/categories/devops.md` |
| Testing | ~68 | `references/categories/testing.md` |
| AI / ML | ~76 | `references/categories/ai-ml.md` |
| Performance | ~36 | `references/categories/performance.md` |
| Frontend | ~39 | `references/categories/frontend.md` |
| Finance | ~3 | `references/categories/finance.md` |
| Productivity | ~73 | `references/categories/productivity.md` |
| Documentation | ~33 | `references/categories/documentation.md` |
| Business / C-Level | ~10 | `references/categories/business.md` |
| Regulatory | ~55 | `references/categories/regulatory.md` |
| Orchestration | ~19 | `references/categories/orchestration.md` |
| Other / General | ~278 | `references/categories/other.md` |
| **MCP Servers** | 6 | `references/mcp-servers.md` |
| **Custom Skills** | 8 | Toujours actifs dans `.claude/skills/` |

> Pour le detail complet : lire `references/REGISTRY.md`
> Pour une categorie specifique : lire `references/categories/<categorie>.md`
