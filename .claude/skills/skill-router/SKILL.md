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
(Si aucun plugin utilisé : indiquer "Aucun plugin actif pour cette tâche")

MCP effectivement utilisés :
- [MCP name] — [opérations effectuées]

Fichiers modifiés :
- [chemin/fichier] — [description changement]

Commits poussés :
- [hash court] — [message commit]

Écarts vs prompt initial :
- [AUCUN | description de tout écart]
=== FIN RÉSUMÉ EXÉCUTION ===
```

**Ce bloc est OBLIGATOIRE. Sans lui, la story n'est pas considérée comme complète.**

---

## ⚠️ RÈGLES OBLIGATOIRES — POST-AUDIT (BLOQUANT)

**Ces 4 règles s'appliquent SANS EXCEPTION à chaque tâche.**

### ⚠️ OBLIGATOIRE 1 — Relire chaque SKILL.md à chaque session

Relire le SKILL.md de chaque skill sélectionné même s'il a été utilisé dans une session précédente. Ne jamais utiliser le contexte existant comme substitut à la lecture. Les skills peuvent avoir été mis à jour entre deux sessions. La lecture complète est le seul moyen de garantir que les instructions appliquées sont à jour.

### ⚠️ OBLIGATOIRE 2 — MCP Directus pour toute donnée de configuration

Toujours inclure MCP Directus si la tâche touche des données de configuration, des tokens, des paramètres système ou des collections. Cela inclut : audit de schéma, vérification de champs, création/modification de collections, migration de données, et toute opération nécessitant la connaissance de la structure réelle en base.

### ⚠️ OBLIGATOIRE 3 — MCP GitHub avant tout audit ou modification

Toujours inclure MCP GitHub avant tout audit ou modification de code existant — vérifier les commits récents pour éviter les régressions. Avant de modifier un fichier, consulter son historique de commits récents pour comprendre les changements effectués et ne pas annuler un fix précédent.

### ⚠️ OBLIGATOIRE 4 — PACK-03-SECURITY pour tout webhook + paiement

Si la tâche mentionne webhook + paiement (Revolut, DocuSeal ou autre) → PACK-03-SECURITY obligatoire + skill `senior-security` obligatoire, sans exception. Cela couvre : validation HMAC, vérification de signature, audit des endpoints exposés, et tout traitement de données financières entrantes.

---

## Workflow de consultation (30 secondes)

### Étape 1 — Point d'entrée unique : SKILLS-QUICK-INDEX.md
Lire **en premier** : `SKILLS-QUICK-INDEX.md` (racine du repo)
→ Contient le mapping phases ROADMAP → packs de skills
→ Contient aussi la liste des **plugins actifs** à consulter
→ Résout 80% des besoins sans aller plus loin

### Étape 2 — Charger le SKILL-PACK correspondant
Lire : `.claude/skills/skill-packs/SKILL-PACK-[XX]-[NOM].md`
→ Contient la liste des skills nécessaires AVEC chemins absolus
→ UN seul pack par tâche (le pack couvre la phase complète)

### Étape 3 — Lire les SKILL.md réels
Pour chaque skill listé dans le pack :
1. Copier le chemin absolu depuis le pack
2. Lire le fichier SKILL.md à ce chemin exact
3. Appliquer ses instructions pour la tâche
4. NE PAS activer de plugin permanent — juste lire et suivre les instructions

### Étape 4 — Vérifier les MCP disponibles
Lire : `.claude/skills/skill-router/references/mcp-servers.md`
→ 6 MCP servers disponibles directement (pas besoin de SKILL.md)

### Étape 5 — Si besoin de skills hors-pack : REGISTRY.md
Lire : `.claude/skills/skill-router/references/REGISTRY.md`
→ Index complet 939+ skills par catégorie
→ Puis lire le fichier catégorie pertinent :
   `.claude/skills/skill-router/references/categories/<categorie>.md`

---

## Règle de sélection optimale

- **Un pack** couvre une phase complète du ROADMAP
- **Pas de limite arbitraire** sur le nombre de skills dans un pack
- **Toujours lire SKILLS-QUICK-INDEX.md en premier** — point d'entrée unique
- **Si la tâche est hors-roadmap** (ponctuelle) : charger 2-5 skills depuis REGISTRY directement

---

## Mapping rapide tâche → skills

| Type de tâche | Aller vers |
|----------------|------------|
| Phase A/B/C/D/E/F du ROADMAP | `SKILLS-QUICK-INDEX.md` → pack approprié |
| Collection Directus | `directus-api-patterns` + MCP Directus |
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

## Skills interdits sur ce projet

| Skill | Raison |
|-------|--------|
| `nextjs-*` | React + Vite uniquement |
| `react-native-*` | Pas d'app mobile V1 |
| `angular-*` / `vue-*` | React uniquement |
| Tout skill AWS/GCP/Azure | Storage Directus local |
| `apexcharts-*` | Recharts uniquement |
| glassmorphisme décoratif | Design Apple Premium Monochromatic |
