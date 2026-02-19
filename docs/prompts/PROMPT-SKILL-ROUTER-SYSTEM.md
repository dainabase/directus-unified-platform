# 🧠 PROMPT CLAUDE CODE — SKILL ROUTER & TOOL DISCOVERY SYSTEM

## Contexte
Notre projet Directus Unified Platform dispose d'un arsenal massif d'outils :
- **3 MCP Servers** configurés (postgres, directus, eslint)
- **19 plugins activés** depuis le marketplace claude-code-plugins-plus
- **8 custom skills** dans `.claude/skills/`
- **974 SKILL.md** disponibles mais NON chargés dans 13 repos sous `~/.claude/skills-repos/`

Le problème : Claude Code ne voit que les 19 plugins activés + 8 custom skills au démarrage. Les 974 skills dans les repos sont invisibles. On perd 95% de notre arsenal.

La solution : Créer un **système de découverte intelligente en couches (Progressive Disclosure)** qui permet à Claude Code de consulter l'ensemble des outils disponibles SANS charger le contexte, et de sélectionner les bons outils pour chaque tâche.

## Objectif
Mettre en place un "Skill Router" — un meta-skill qui sert de **table de routage intelligente** vers les 974+ outils disponibles, organisé en couches progressives.

---

## PHASE 1 : Scanner et cataloguer tous les outils disponibles

### 1.1 Scanner les 974 SKILL.md
Exécuter un script qui parcourt TOUS les repos de skills et extrait pour chaque SKILL.md :
- Le `name` (du frontmatter YAML)
- La `description` (du frontmatter YAML)  
- Le chemin complet vers le fichier
- Le repo source

```bash
# Script à exécuter pour scanner
find ~/.claude/skills-repos -name "SKILL.md" -maxdepth 5 -exec grep -l "^---" {} \; | while read file; do
  name=$(sed -n '/^---$/,/^---$/p' "$file" | grep "^name:" | head -1 | sed 's/name: *//')
  desc=$(sed -n '/^---$/,/^---$/p' "$file" | grep "^description:" | head -1 | sed 's/description: *//' | cut -c1-120)
  repo=$(echo "$file" | sed 's|.*skills-repos/||' | cut -d'/' -f1)
  echo "$name|$desc|$repo|$file"
done > /tmp/all-skills-inventory.csv
```

### 1.2 Scanner les 19 plugins activés
Lire `~/.claude/settings.json` et extraire la liste des `enabledPlugins`.

### 1.3 Scanner les 3 MCP Servers
Lire `.mcp.json` du projet et documenter chaque MCP avec ses capacités.

### 1.4 Scanner les 8 custom skills
Lire les SKILL.md dans `.claude/skills/` du projet.

---

## PHASE 2 : Créer le Skill Router (meta-skill)

### 2.1 Créer la structure
```
.claude/skills/skill-router/
├── SKILL.md                    # Le meta-skill (Layer 1 — ~200 tokens dans le budget)
├── references/
│   ├── REGISTRY.md             # Index complet catégorisé (Layer 2 — ~3000 tokens à la demande)
│   ├── mcp-servers.md          # Documentation MCP détaillée
│   ├── active-plugins.md       # Les 19 plugins actuellement activés + quand les utiliser
│   └── categories/             # Index par catégorie avec chemins vers SKILL.md complets
│       ├── database.md         # Tous les skills database avec chemins
│       ├── api.md              # Tous les skills API
│       ├── security.md         # Tous les skills sécurité
│       ├── devops.md           # Tous les skills DevOps
│       ├── testing.md          # Tous les skills testing
│       ├── ai-ml.md            # Tous les skills AI/ML
│       ├── performance.md      # Tous les skills performance
│       ├── frontend.md         # Tous les skills frontend
│       ├── finance.md          # Tous les skills finance
│       ├── productivity.md     # Tous les skills productivité
│       ├── documentation.md    # Tous les skills documentation
│       └── swiss-compliance.md # Skills spécifiques Swiss compliance
└── scripts/
    └── scan-skills.sh          # Script pour re-scanner et mettre à jour le registry
```

### 2.2 Contenu du SKILL.md (meta-skill)

```markdown
---
name: skill-router
description: Meta-skill de découverte et routage d'outils. Ce skill DOIT être consulté automatiquement au début de chaque tâche complexe impliquant du développement, de l'optimisation, de la sécurité, du testing, du DevOps, de la finance, ou de la compliance. Il fournit un index de 974+ outils spécialisés, 3 MCP servers, 19 plugins activés et 8 custom skills, organisés par catégorie avec progressive disclosure. QUAND l'utiliser: avant toute implémentation, optimisation, audit, migration, ou création. NE PAS l'utiliser: pour des questions simples, de la conversation, ou des tâches triviales qui ne nécessitent pas d'outils spécialisés.
---

# Skill Router — Tool Discovery System

## Principe
Ce skill implémente le pattern **Progressive Disclosure** :
- **Layer 1** (ce fichier) : Tu sais que 974+ outils existent, organisés en catégories
- **Layer 2** : Consulte `references/REGISTRY.md` pour l'index complet par catégorie
- **Layer 3** : Lis le SKILL.md complet d'un outil spécifique via son chemin

## Workflow obligatoire pour les tâches complexes

### Étape 1 — Identifier le domaine
Quel type de tâche ? Database / API / Security / DevOps / Testing / AI-ML / Performance / Frontend / Finance / Productivity / Documentation / Swiss-Compliance

### Étape 2 — Consulter le registry
Lire `references/REGISTRY.md` pour voir les outils disponibles dans ce domaine.

### Étape 3 — Vérifier les outils déjà actifs
Lire `references/active-plugins.md` — un des 19 plugins activés couvre peut-être déjà le besoin.

### Étape 4 — Charger si nécessaire
Si un outil non activé est identifié comme nécessaire :
1. Lire son SKILL.md complet via le chemin dans le registry
2. Appliquer ses instructions pour la tâche
3. NE PAS activer le plugin de façon permanente — juste lire et suivre les instructions

### Étape 5 — Vérifier les MCP disponibles
Lire `references/mcp-servers.md` — un MCP Server peut fournir des outils directs (queries PostgreSQL, accès Directus, etc.)

## Catégories d'outils disponibles

| Catégorie | Outils | Exemples |
|-----------|--------|----------|
| Database | ~80+ | schema-designer, query-optimizer, migration-manager, index-advisor |
| API Development | ~60+ | rest-api-generator, graphql-builder, webhook-handler, rate-limiter |
| Security | ~50+ | gdpr-scanner, pci-validator, vulnerability-scanner, secret-scanner |
| DevOps | ~70+ | docker-compose-gen, ci-cd-pipeline, kubernetes-ops, backup-automator |
| Testing | ~50+ | unit-test-gen, e2e-framework, api-test-automation, coverage-analyzer |
| AI / ML | ~40+ | anomaly-detection, time-series-forecaster, sentiment-analysis, nlp |
| Performance | ~40+ | apm-dashboard, bottleneck-detector, memory-leak-detector, profiler |
| Frontend | ~30+ | frontend-design, react-patterns, accessibility, responsive |
| Finance | ~15+ | openbb-terminal, financial-modeling, swiss-accounting |
| Productivity | ~20+ | overnight-dev, ai-commit-gen, workflow-orchestrator |
| Documentation | ~25+ | api-docs-generator, project-docs, changelog-generator |
| Swiss Compliance | 8 | swiss-compliance-engine, qr-invoice, vat-calculator, recouvrement |
| MCP Servers | 3 | PostgreSQL direct, Directus API, ESLint |

→ Pour le détail complet : lire `references/REGISTRY.md`
→ Pour une catégorie spécifique : lire `references/categories/<categorie>.md`
```

### 2.3 Contenu du REGISTRY.md (index compact)

Ce fichier doit être **généré automatiquement** par le script de scan. Format :

```markdown
# Tool Registry — 974+ Skills Index
> Généré automatiquement le [DATE]. Re-scanner avec `scripts/scan-skills.sh`

## 🔌 MCP Servers (Outils directs — pas besoin de skill)

### PostgreSQL (MCP)
- **Capacité** : Exécuter des requêtes SQL directement sur la base Directus
- **Usage** : Queries SELECT, analyses de données, vérification de schéma
- **Config** : `.mcp.json` → serveur postgres

### Directus (MCP)
- **Capacité** : CRUD sur toutes les 83+ collections Directus
- **Usage** : Créer/modifier/lire des items, gérer les collections, les relations
- **Config** : `.mcp.json` → serveur directus (token: hbQz-...)

### ESLint (MCP)
- **Capacité** : Analyse statique du code JavaScript/TypeScript
- **Usage** : Qualité de code, détection de bugs, conventions
- **Config** : `.mcp.json` → serveur eslint

## ⚡ Plugins Activés (19 — toujours disponibles)

| Plugin | Catégorie | Déclencheur |
|--------|-----------|-------------|
| database-schema-designer | Database | Conception de schéma, ERD, relations |
| sql-query-optimizer | Database | Optimisation de requêtes, EXPLAIN, index |
| rest-api-generator | API | Création d'endpoints REST |
| api-authentication-builder | API | OAuth, JWT, sessions, auth |
| webhook-handler-creator | API | Webhooks entrants/sortants |
| n8n-workflow-designer | Automation | Workflows n8n |
| anomaly-detection-system | AI/ML | Détection anomalies transactions |
| time-series-forecaster | AI/ML | Prévisions cash flow, métriques |
| gdpr-compliance-scanner | Security | Conformité RGPD |
| pci-dss-validator | Security | Validation PCI DSS paiements |
| database-migration-manager | Database | Migrations SQL, versioning schéma |
| ci-cd-pipeline-builder | DevOps | GitHub Actions, pipelines CI/CD |
| unit-test-generator | Testing | Tests unitaires auto |
| e2e-test-framework | Testing | Tests E2E Playwright/Cypress |
| apm-dashboard-creator | Performance | Dashboards monitoring |
| overnight-dev | Productivity | Développement autonome nocturne |
| project-health-auditor | Productivity | Audit santé projet continu |
| domain-memory-agent | Productivity | Mémoire persistante par domaine |
| workflow-orchestrator | Productivity | Orchestration workflows complexes |

## 🎯 Custom Skills Projet (8 — toujours disponibles)

| Skill | Déclencheur |
|-------|-------------|
| directus-extension-architect | Création d'extensions Directus (hooks, endpoints, modules) |
| swiss-compliance-engine | TVA suisse, QR-factures, recouvrement SchKG, PME Käfer |
| multi-portal-architecture | Architecture des 4 portails (SuperAdmin, Client, Prestataire, Revendeur) |
| directus-api-patterns | Patterns API Directus (ItemsService, filtres, relations) |
| integration-sync-engine | Synchronisation Invoice Ninja, Revolut, ERPNext, Mautic, DocuSeal |
| ceo-dashboard-designer | Dashboard CEO glassmorphism, KPIs, métriques temps réel |
| postgresql-directus-optimizer | Optimisation PostgreSQL pour Directus (index, requêtes, cache) |
| docker-stack-ops | Opérations Docker Compose pour le stack complet |

## 📦 Skills Disponibles par Catégorie (974 — chargement à la demande)

### Database (~80 skills)
→ Détail complet : `references/categories/database.md`
Highlights : database-schema-designer, sql-query-optimizer, database-index-advisor, database-health-monitor, database-backup-automator, database-security-scanner, database-cache-layer, nosql-data-modeler, orm-code-generator, data-seeder-generator...

### API Development (~60 skills)  
→ Détail complet : `references/categories/api.md`
Highlights : rest-api-generator, graphql-server-builder, api-documentation-generator, api-rate-limiter, api-monitoring-dashboard, api-schema-validator, api-gateway-builder, api-mock-server, websocket-server-builder...

### Security (~50 skills)
→ Détail complet : `references/categories/security.md`
Highlights : vulnerability-scanner, sql-injection-detector, secret-scanner, dependency-checker, authentication-validator, encryption-tool, ssl-certificate-manager, security-audit-reporter, xss-vulnerability-scanner, penetration-tester...

### DevOps (~70 skills)
→ Détail complet : `references/categories/devops.md`
Highlights : docker-compose-generator, kubernetes-deployment-creator, infrastructure-as-code-generator, deployment-pipeline-orchestrator, monitoring-stack-deployer, backup-strategy-implementor, helm-chart-generator, ansible-playbook-creator...

### Testing (~50 skills)
→ Détail complet : `references/categories/testing.md`
Highlights : unit-test-generator, e2e-test-framework, api-test-automation, test-coverage-analyzer, test-data-generator, performance-test-suite, security-test-scanner, chaos-engineering-toolkit, visual-regression-tester...

### AI / ML (~40 skills)
→ Détail complet : `references/categories/ai-ml.md`
Highlights : anomaly-detection-system, time-series-forecaster, sentiment-analysis-tool, recommendation-engine, nlp-text-analyzer, data-visualization-creator, ml-model-trainer, computer-vision-processor...

### Performance (~40 skills)
→ Détail complet : `references/categories/performance.md`
Highlights : apm-dashboard-creator, bottleneck-detector, memory-leak-detector, database-query-profiler, application-profiler, network-latency-analyzer, cache-performance-optimizer, load-test-runner...

### Frontend (~30 skills)
→ Détail complet : `references/categories/frontend.md`
Highlights : frontend-design, react-patterns, accessibility-test-scanner, responsive-design, css-optimization, component-library-builder, storybook-setup...

### Finance & Business (~15 skills)
→ Détail complet : `references/categories/finance.md`
Highlights : openbb-terminal, excel-analyst-pro, financial-modeling, roi-calculator, sow-generator, discovery-questionnaire...

### Productivity & Workflows (~20 skills)
→ Détail complet : `references/categories/productivity.md`
Highlights : overnight-dev, ai-commit-gen, workflow-orchestrator, domain-memory-agent, project-health-auditor, agent-context-manager, taskwarrior-integration...

### Documentation (~25 skills)
→ Détail complet : `references/categories/documentation.md`
Highlights : api-documentation-generator, project-docs-coordinator, changelog-generator, root-docs-creator, backend-docs-creator, frontend-docs-creator, reference-docs-creator...

### Orchestration & Agents (~15 skills)
→ Détail complet : `references/categories/orchestration.md`
Highlights : swarm-orchestration, multi-agent-coordination, pipeline-orchestrator, task-observer, agent-communication-patterns, tool-integration-framework...
```

### 2.4 Fichiers de catégorie (`references/categories/*.md`)

Chaque fichier de catégorie liste TOUS les skills de cette catégorie avec :
- Nom
- Description (1 ligne)
- Chemin absolu vers le SKILL.md
- Repo source

Format :
```markdown
# Database Skills (Détail)

| # | Skill | Description | Chemin |
|---|-------|-------------|--------|
| 1 | database-schema-designer | Design schémas DB avec ERD | ~/.claude/skills-repos/claude-code-plugins-plus-skills/plugins/database-schema-designer/skills/database-schema-designer/SKILL.md |
| 2 | sql-query-optimizer | Optimisation requêtes SQL | ~/.claude/skills-repos/claude-code-plugins-plus-skills/plugins/sql-query-optimizer/skills/sql-query-optimizer/SKILL.md |
| ... | ... | ... | ... |
```

---

## PHASE 3 : Créer le script de scan automatique

### 3.1 Créer `scripts/scan-skills.sh`

Ce script Bash doit :
1. Scanner tous les SKILL.md dans `~/.claude/skills-repos/`
2. Extraire name + description du frontmatter YAML
3. Catégoriser automatiquement (par mots-clés dans le nom/description ou par dossier parent)
4. Générer `REGISTRY.md` + tous les fichiers `categories/*.md`
5. Afficher un résumé des résultats

Le script doit aussi :
- Détecter les doublons (même skill dans plusieurs repos)
- Privilégier le repo le plus spécifique en cas de doublon
- Ignorer les SKILL.md malformés (sans frontmatter YAML valide)

### 3.2 Rendre exécutable
```bash
chmod +x .claude/skills/skill-router/scripts/scan-skills.sh
```

---

## PHASE 4 : Mettre à jour CLAUDE.md

Ajouter cette section JUSTE APRÈS "## Code Conventions" dans le CLAUDE.md existant :

```markdown
## Tool Discovery — Skill Router System

AVANT toute tâche complexe (développement, optimisation, audit, migration, sécurité, testing) :
1. Consulter le skill-router : `.claude/skills/skill-router/references/REGISTRY.md`
2. Identifier les outils pertinents dans la catégorie appropriée
3. Lire le SKILL.md complet de l'outil choisi avant d'implémenter
4. Utiliser les MCP servers quand l'accès direct (DB, Directus, ESLint) est plus efficace

### Outils disponibles
- 3 MCP Servers : PostgreSQL (SQL direct), Directus (CRUD collections), ESLint (qualité code)
- 19 Plugins activés : Voir `active-plugins.md` dans le skill-router
- 8 Custom Skills : Directus, Swiss compliance, Multi-portal, Docker, CEO dashboard, etc.
- 974+ Skills à la demande : Voir `REGISTRY.md` dans le skill-router
- TOTAL : ~1000 outils spécialisés via progressive disclosure

### Règle d'or
Ne jamais coder "à l'aveugle" quand un skill spécialisé existe. Toujours vérifier le registry d'abord.
```

---

## PHASE 5 : Déplacer le guide de référence

Déplacer le fichier `CLAUDE-CODE-SKILLS-GUIDE.md` du projet (s'il existe dans le repo) vers `docs/reference/CLAUDE-CODE-SKILLS-GUIDE.md`.

Si le fichier n'existe pas dans le repo mais uniquement comme documentation externe, créer un lien dans `docs/README.md` :
```markdown
## Documentation de référence
- `reference/CLAUDE-CODE-SKILLS-GUIDE.md` — Inventaire original des 257+ plugins documentés
- Le registry complet (974+ skills) est dans `.claude/skills/skill-router/references/REGISTRY.md`
```

---

## PHASE 6 : Vérification

Après toutes les phases, vérifier :

1. **Structure créée** :
```bash
ls -la .claude/skills/skill-router/
ls -la .claude/skills/skill-router/references/
ls -la .claude/skills/skill-router/references/categories/
ls -la .claude/skills/skill-router/scripts/
```

2. **REGISTRY.md peuplé** :
```bash
wc -l .claude/skills/skill-router/references/REGISTRY.md
# Doit contenir 500+ lignes
```

3. **Catégories générées** :
```bash
for f in .claude/skills/skill-router/references/categories/*.md; do echo "$f: $(wc -l < $f) lignes"; done
# Chaque fichier doit contenir les skills de sa catégorie
```

4. **CLAUDE.md mis à jour** :
```bash
grep "Skill Router" CLAUDE.md
# Doit trouver la section Tool Discovery
```

5. **Test fonctionnel** :
Démarrer une nouvelle session Claude Code et demander :
- "Quels outils ai-je pour optimiser mes requêtes PostgreSQL ?"
- Claude devrait consulter le skill-router et lister les outils pertinents
- "Je veux auditer la sécurité de mon API"
- Claude devrait identifier vulnerability-scanner, sql-injection-detector, etc.

---

## Résumé de l'architecture

```
CLAUDE.MD (toujours chargé, ~500 tokens)
  └── "Consulte le skill-router pour les tâches complexes"
        │
        ▼
SKILL-ROUTER/SKILL.md (Layer 1 — ~200 tokens metadata)
  └── Description: "Meta-skill de découverte, 974+ outils..."
        │ Déclenché automatiquement pour tâches complexes
        ▼
SKILL-ROUTER/references/REGISTRY.md (Layer 2 — ~3000 tokens)
  ├── 3 MCP Servers documentés
  ├── 19 Plugins activés avec déclencheurs
  ├── 8 Custom Skills avec déclencheurs
  └── 974 Skills indexés par catégorie → liens vers categories/*.md
        │
        ▼
SKILL-ROUTER/references/categories/*.md (Layer 2.5 — ~500 tokens par catégorie)
  └── Liste complète avec chemins vers chaque SKILL.md
        │
        ▼
~/.claude/skills-repos/*/SKILL.md (Layer 3 — ~5000 tokens chacun)
  └── Instructions complètes, scripts, références de l'outil spécifique
        │
        ▼
Scripts, assets, références de l'outil (Layer 4 — à la demande)
  └── Code exécutable, templates, documentation détaillée
```

**Coût en tokens** :
- Sans le skill-router : Impossible (974 × 5000 = 4,870,000 tokens — dépasse tout context window)
- Avec le skill-router : ~500 + 200 + 3000 + 500 + 5000 = **~9,200 tokens** pour utiliser un outil spécialisé
- Ratio d'efficacité : **99.8% d'économie de contexte**

---

## ⚠️ Points d'attention

- NE PAS activer les 974 plugins dans `settings.json` — cela dépasserait le budget de 2% du context window
- Le scan doit être re-exécuté quand on ajoute de nouveaux repos de skills
- Les MCP Servers sont des outils DIRECTS (pas besoin de skill) — les utiliser en priorité
- Le skill-router ne remplace pas les 8 custom skills du projet — ceux-ci restent toujours actifs et prioritaires
- Si un skill non activé s'avère indispensable récurremment, on peut l'ajouter aux 19 plugins activés dans `settings.json`
