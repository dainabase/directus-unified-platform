---
name: skill-router
description: >
  Meta-skill de découverte et routage d'outils. Ce skill DOIT être consulté
  automatiquement au début de chaque tâche complexe. Il fournit un index de
  939+ outils spécialisés, 6 MCP servers, et 8 custom skills, organisés par
  catégorie avec progressive disclosure.
  QUAND l'utiliser : avant toute implémentation, optimisation, audit,
  migration, ou création. NE PAS l'utiliser : pour des questions simples,
  de la conversation, ou des tâches triviales.
---

# Skill Router — Tool Discovery System

---

## ⛔ RÈGLE N°1 — DÉCLARATION EN DÉBUT DE TÂCHE (BLOQUANT)

**Avant d'écrire UNE SEULE LIGNE de code ou de modifier UN SEUL FICHIER, produire obligatoirement :**

```
=== DÉCLARATION SKILLS ===
Tâche : [description courte]
Domaine(s) : [ex: Frontend, Database, Swiss Compliance]

Skills sélectionnés :
1. [nom-skill] — [chemin exact] — [raison]
2. [nom-skill] — [chemin exact] — [raison]
...

Plugins actifs utilisés :
- [nom-plugin] — [usage dans cette tâche]

MCP utilisés :
- [MCP name] — [usage]

Skills lus : ✅ [liste confirmée]
=== FIN DÉCLARATION SKILLS ===
```

**Si cette déclaration est absente → STOP IMMÉDIAT. Ne pas continuer.**

---

## ⛔ RÈGLE N°2 — RÉSUMÉ EN FIN DE TÂCHE (BLOQUANT)

**À la fin de chaque story, phase ou prompt, produire obligatoirement le bloc suivant AVANT les commits :**

```
=== RÉSUMÉ EXÉCUTION ===
Story/Phase : [ex: A.3 — Collection messages]
Statut : ✅ Complété | ⚠️ Partiel | ❌ Échoué

Skills effectivement utilisés :
1. [nom-skill] — [chemin] — [comment utilisé concrètement]
2. [nom-skill] — [chemin] — [comment utilisé concrètement]
...

Plugins effectivement utilisés :
- [nom-plugin] — [comment utilisé]
(Si aucun plugin utilisé : indiquer "Aucun plugin activé pour cette tâche")

MCP effectivement utilisés :
- [MCP name] — [opérations effectuées]

Skills disponibles NON utilisés (pourquoi) :
- [nom-skill] — [raison : non pertinent / déjà couvert par X / hors scope]

Fichiers modifiés :
- [chemin/fichier] — [description changement]

Commits pushés :
- [hash court] — [message commit]

Écarts vs prompt initial :
- [AUCUN | description de tout écart]
=== FIN RÉSUMÉ EXÉCUTION ===
```

**Ce bloc est OBLIGATOIRE. Sans lui, la story n'est pas considérée comme complète.**

**Pourquoi cette règle :** Permet à l'Architecte (Jean) de vérifier en 30 secondes que les bons skills ont été consultés, que les plugins pertinents ont été activés, et qu'aucun outil pertinent n'a été ignoré.

---

## Workflow de consultation (30 secondes)

### Étape 1 — Point d'entrée unique : SKILLS-QUICK-INDEX.md
Lire **en premier** : `SKILLS-QUICK-INDEX.md` (racine du repo)
→ Contient les 50+ skills les plus utilisés avec chemins directs
→ Résout 80% des besoins sans aller plus loin
→ Contient aussi la liste des **plugins actifs** à consulter

### Étape 2 — Plugins actifs disponibles
Lire : `.claude/skills/skill-router/references/active-plugins.md`
→ 17 skills invocables + 8 custom skills = **25 outils toujours chargés**
→ Vérifier si un plugin actif couvre déjà le besoin avant de charger un skill externe

### Étape 3 — Si besoin de plus : REGISTRY.md
Lire : `.claude/skills/skill-router/references/REGISTRY.md`
→ Index complet 939+ skills par catégorie
→ Puis lire le fichier catégorie pertinent :
   `.claude/skills/skill-router/references/categories/<categorie>.md`

### Étape 4 — Vérifier les MCP disponibles
Lire : `.claude/skills/skill-router/references/mcp-servers.md`
→ 6 MCP servers disponibles directement (pas besoin de SKILL.md)

### Étape 5 — Charger les skills retenus
Pour chaque skill sélectionné :
1. Lire son SKILL.md complet via le chemin exact du registry
2. Appliquer ses instructions pour la tâche
3. NE PAS activer de plugin permanent — juste lire et suivre les instructions

---

## Catégories disponibles (939+ skills au total)

| Catégorie | Skills | Fichier détail |
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
| **Swiss Compliance** | **custom** | `references/categories/swiss-compliance.md` ← |
| Orchestration | ~19 | `references/categories/orchestration.md` |
| Other / General | ~278 | `references/categories/other.md` |
| **MCP Servers** | **6** | `references/mcp-servers.md` |
| **Plugins Actifs** | **17+8=25** | `references/active-plugins.md` |
| **Custom Skills Projet** | **8** | Toujours actifs dans `.claude/skills/` |

> Pour le détail complet : lire `references/REGISTRY.md`

---

## Mapping rapide tâche → skills

| Type de tâche | Skills à consulter en priorité |
|---------------|-------------------------------|
| Créer/modifier collection Directus | `directus-api-patterns` + MCP Directus |
| Page React / composant UI | `SKILLS-QUICK-INDEX.md` § UI/Design + React |
| TVA / Finance suisse | `swiss-compliance-engine` (OBLIGATOIRE) |
| QR-Invoice | `swiss-compliance-engine` (OBLIGATOIRE) |
| Webhook Revolut/DocuSeal | `integration-sync-engine` + `webhook-receiver-generator` |
| Dashboard CEO / KPIs | `ceo-dashboard-designer` |
| PostgreSQL / performances | `postgresql-directus-optimizer` |
| Docker / infrastructure | `docker-stack-ops` |
| Tests E2E portails | MCP Playwright + `playwright-expert` |
| Graphiques Recharts | MCP Context7 → rechercher "recharts" |
| Multi-portails RBAC | `multi-portal-architecture` |
| Extension Directus | `directus-extension-architect` |

---

## Règle de sélection optimale

- **Tâche simple** (1 fichier, 1 composant) → 2-3 skills max
- **Tâche moyenne** (1 module complet) → 3-5 skills
- **Tâche complexe** (phase entière, multi-fichiers) → 5-8 skills
- **Ne jamais charger plus de 8 skills** — risque de confusion contextuelle

---

## Skills interdits sur ce projet

| Skill | Raison |
|-------|--------|
| `nextjs-*` | React + Vite uniquement |
| `react-native-*` | Pas d'app mobile V1 |
| `angular-*` / `vue-*` | React uniquement |
| Tout skill AWS/GCP/Azure | Storage Directus local |
| `apexcharts-*` | Recharts uniquement |
| glassmorphism décoratif | Design Apple Premium Monochromatic |
