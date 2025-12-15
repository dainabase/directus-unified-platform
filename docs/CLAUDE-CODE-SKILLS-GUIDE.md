# 🚀 GUIDE COMPLET DES CLAUDE CODE SKILLS
## Pour Directus Unified Platform

**Date**: 14 Décembre 2025  
**Version**: 1.0  
**Repository Source**: `jeremylongshore/claude-code-plugins-plus`  
**Stats**: 240+ Agent Skills | 257+ Total Plugins | 100% Anthropic 2025 Schema

---

## 📋 TABLE DES MATIÈRES

1. [Résumé Exécutif](#résumé-exécutif)
2. [Concept des Agent Skills](#concept-des-agent-skills)
3. [Inventaire Complet par Catégorie](#inventaire-complet)
4. [Sélection Prioritaire pour Directus](#sélection-prioritaire)
5. [Instructions d'Installation](#instructions-installation)
6. [Mapping avec les Besoins du Projet](#mapping-besoins)
7. [Roadmap d'Intégration](#roadmap-intégration)

---

## 🎯 RÉSUMÉ EXÉCUTIF

Cette recherche documente **257+ plugins** organisés en **15 catégories** provenant du marketplace Claude Code le plus complet disponible. Ces skills permettent d'automatiser massivement le développement et les opérations de la plateforme Directus Unified Platform.

### Statistiques Globales

| Catégorie | Plugins | Pertinence Projet |
|-----------|---------|-------------------|
| DevOps | 35 | ⭐⭐⭐⭐⭐ |
| AI/ML | 30+ | ⭐⭐⭐⭐⭐ |
| Database | 25 | ⭐⭐⭐⭐⭐ |
| Security | 25 | ⭐⭐⭐⭐⭐ |
| API Development | 24 | ⭐⭐⭐⭐⭐ |
| Testing | 24 | ⭐⭐⭐⭐ |
| Performance | 25 | ⭐⭐⭐⭐ |
| MCP Servers | 6 | ⭐⭐⭐⭐⭐ |
| AI Agency | 7 | ⭐⭐⭐⭐⭐ |
| Productivity | 10+ | ⭐⭐⭐⭐ |
| Skill Enhancers | 6 | ⭐⭐⭐ |
| Business Tools | 1 | ⭐⭐⭐⭐ |
| Finance | 1 | ⭐⭐⭐⭐ |
| Community | TBD | ⭐⭐⭐ |
| Crypto | TBD | ⭐⭐ |

---

## 🧠 CONCEPT DES AGENT SKILLS

### Qu'est-ce qu'un Agent Skill?

Un **Agent Skill** est un fichier `SKILL.md` qui enseigne à Claude **QUAND** et **COMMENT** utiliser automatiquement un plugin basé sur le contexte de conversation. Pas besoin de commande `/command` manuelle.

### Fonctionnement

```
┌─────────────────────────────────────────────────────────┐
│  Utilisateur: "Optimise mes requêtes PostgreSQL"        │
├─────────────────────────────────────────────────────────┤
│  Claude détecte automatiquement:                        │
│  → sql-query-optimizer                                  │
│  → database-index-advisor                               │
│  → query-performance-analyzer                           │
│  Et les active sans intervention manuelle               │
└─────────────────────────────────────────────────────────┘
```

### Structure d'un Skill

```
plugin-name/
├── SKILL.md          # Instructions pour Claude (QUAND/COMMENT)
├── plugin.json       # Métadonnées et configuration
├── README.md         # Documentation utilisateur
└── src/              # Code source si applicable
```

---

## 📦 INVENTAIRE COMPLET

### 1. 🔧 DEVOPS (35 plugins)

**Infrastructure as Code**
- `infrastructure-as-code-generator` - Génération Terraform/Pulumi
- `terraform-module-builder` - Modules Terraform réutilisables
- `jeremy-adk-terraform` - ADK + Terraform Google Cloud
- `jeremy-genkit-terraform` - Genkit + Terraform
- `jeremy-vertex-terraform` - Vertex AI + Terraform
- `infrastructure-drift-detector` - Détection de dérive

**Containers & Kubernetes**
- `docker-compose-generator` - Génération docker-compose
- `kubernetes-deployment-creator` - Déploiements K8s
- `helm-chart-generator` - Charts Helm
- `container-registry-manager` - Gestion registres
- `container-security-scanner` - Scan sécurité containers

**CI/CD**
- `ci-cd-pipeline-builder` ⭐ - Pipelines GitHub Actions/GitLab
- `deployment-pipeline-orchestrator` - Orchestration déploiements
- `deployment-rollback-manager` - Rollback automatique
- `gitops-workflow-builder` - Workflows GitOps
- `jeremy-github-actions-gcp` - Actions GitHub pour GCP

**Configuration & Secrets**
- `ansible-playbook-creator` - Playbooks Ansible
- `environment-config-manager` - Gestion configs environnement
- `secrets-manager-integrator` - Intégration gestionnaires secrets

**Monitoring & Logging**
- `monitoring-stack-deployer` - Stack Prometheus/Grafana
- `log-aggregation-setup` - Setup ELK/Loki
- `auto-scaling-configurator` - Auto-scaling

**Réseau & Sécurité**
- `load-balancer-configurator` - Load balancers
- `network-policy-manager` - Politiques réseau
- `service-mesh-configurator` - Service mesh (Istio)

**Backup & Recovery**
- `backup-strategy-implementor` ⭐ - Stratégies backup
- `disaster-recovery-planner` - Plans DR

**Autres**
- `git-commit-smart` - Commits intelligents
- `compliance-checker` - Vérification conformité
- `fairdb-operations-kit` - Opérations FairDB
- `sugar` - Utilitaires DevOps

---

### 2. 🤖 AI/ML (30+ plugins)

**Machine Learning Core**
- `ml-model-trainer` - Entraînement modèles
- `automl-pipeline-builder` - Pipelines AutoML
- `computer-vision-processor` - Traitement vision

**Analyse & Prédiction**
- `anomaly-detection-system` ⭐ - Détection anomalies (transactions)
- `time-series-forecaster` ⭐ - Prévisions temporelles (cash flow)
- `sentiment-analysis-tool` ⭐ - Analyse sentiments (feedback clients)
- `recommendation-engine` ⭐ - Moteur recommandations
- `nlp-text-analyzer` ⭐ - Analyse NLP (tickets support)

**Visualisation**
- `data-visualization-creator` ⭐ - Création visualisations

**Google Cloud AI**
- `jeremy-vertex-engine` ⭐ - Vertex AI Engine
- `jeremy-genkit-pro` ⭐ - Framework Genkit
- `jeremy-adk-orchestrator` ⭐ - Orchestration agents ADK

**Agents AI**
- `ai-sdk-agents` - SDK pour agents IA

---

### 3. 🗄️ DATABASE (25 plugins)

**Design & Migration**
- `database-schema-designer` ⭐ - Design schémas
- `database-migration-manager` ⭐ - Gestion migrations
- `database-diff-tool` - Comparaison schémas
- `nosql-data-modeler` - Modélisation NoSQL
- `orm-code-generator` - Génération ORM

**Performance**
- `sql-query-optimizer` ⭐ - Optimisation requêtes
- `query-performance-analyzer` ⭐ - Analyse performances
- `database-index-advisor` ⭐ - Conseils index
- `database-cache-layer` - Couche cache
- `database-connection-pooler` - Pooling connexions

**Monitoring & Health**
- `database-health-monitor` ⭐ - Monitoring santé
- `database-deadlock-detector` - Détection deadlocks
- `database-transaction-monitor` - Monitoring transactions

**Backup & Recovery**
- `database-backup-automator` ⭐ - Backup automatique
- `database-recovery-manager` - Récupération
- `database-archival-system` - Archivage

**Sécurité & Audit**
- `database-security-scanner` ⭐ - Scan sécurité
- `database-audit-logger` - Logs audit

**Scaling**
- `database-partition-manager` - Partitionnement
- `database-sharding-manager` - Sharding
- `database-replication-manager` - Réplication

**Génération**
- `data-seeder-generator` - Génération données test
- `data-validation-engine` - Validation données
- `stored-procedure-generator` - Procédures stockées
- `database-documentation-gen` - Documentation auto

---

### 4. 🔒 SECURITY (25 plugins)

**Compliance**
- `gdpr-compliance-scanner` ⭐ - Conformité RGPD
- `pci-dss-validator` ⭐ - Validation PCI DSS (paiements)
- `hipaa-compliance-checker` - Conformité HIPAA
- `soc2-audit-helper` - Audit SOC2
- `owasp-compliance-checker` - Standards OWASP
- `compliance-report-generator` - Rapports conformité

**Vulnérabilités**
- `vulnerability-scanner` ⭐ - Scan vulnérabilités
- `sql-injection-detector` ⭐ - Détection SQL injection
- `xss-vulnerability-scanner` - Scan XSS
- `penetration-tester` - Tests pénétration
- `secret-scanner` ⭐ - Détection secrets exposés
- `dependency-checker` ⭐ - Vulnérabilités dépendances

**Authentification & Accès**
- `authentication-validator` ⭐ - Validation auth
- `access-control-auditor` - Audit contrôle accès
- `session-security-checker` - Sécurité sessions

**Configuration**
- `security-headers-analyzer` - Analyse headers
- `cors-policy-validator` - Validation CORS
- `csrf-protection-validator` - Protection CSRF
- `security-misconfiguration-finder` - Mauvaises configs

**Chiffrement**
- `encryption-tool` - Outils chiffrement
- `ssl-certificate-manager` - Gestion certificats SSL

**Audit & Réponse**
- `security-audit-reporter` - Rapports audit
- `security-incident-responder` - Réponse incidents
- `data-privacy-scanner` - Scan confidentialité
- `input-validation-scanner` - Validation inputs

---

### 5. 🌐 API DEVELOPMENT (24 plugins)

**Génération**
- `rest-api-generator` ⭐ - Génération API REST
- `graphql-server-builder` ⭐ - Serveur GraphQL
- `grpc-service-generator` - Services gRPC
- `api-sdk-generator` - SDK clients API
- `webhook-handler-creator` ⭐ - Handlers webhooks
- `websocket-server-builder` - Serveurs WebSocket

**Documentation**
- `api-documentation-generator` ⭐ - Documentation auto (OpenAPI)
- `api-contract-generator` - Contrats API

**Sécurité & Auth**
- `api-authentication-builder` ⭐ - Auth API (OAuth, JWT)
- `api-security-scanner` - Scan sécurité API

**Performance**
- `api-cache-manager` - Cache API
- `api-rate-limiter` ⭐ - Limitation débit
- `api-throttling-manager` - Throttling
- `api-batch-processor` - Traitement batch
- `api-load-tester` - Tests charge

**Monitoring**
- `api-monitoring-dashboard` ⭐ - Dashboard monitoring
- `api-request-logger` - Logs requêtes
- `api-error-handler` - Gestion erreurs

**Validation**
- `api-schema-validator` - Validation schémas
- `api-response-validator` - Validation réponses

**Gestion**
- `api-versioning-manager` - Versioning API
- `api-migration-tool` - Migration API
- `api-mock-server` - Serveur mock
- `api-gateway-builder` - API Gateway
- `api-event-emitter` - Émission événements

---

### 6. 🧪 TESTING (24 plugins)

**Unit & Integration**
- `unit-test-generator` ⭐ - Génération tests unitaires
- `integration-test-runner` - Tests intégration
- `test-doubles-generator` - Mocks/Stubs

**E2E & UI**
- `e2e-test-framework` ⭐ - Framework E2E (Playwright/Cypress)
- `visual-regression-tester` - Tests régression visuelle
- `browser-compatibility-tester` - Compatibilité navigateurs
- `accessibility-test-scanner` ⭐ - Tests accessibilité

**API Testing**
- `api-test-automation` ⭐ - Automatisation tests API
- `api-fuzzer` - Fuzzing API
- `contract-test-validator` - Tests contrats

**Performance**
- `performance-test-suite` - Suite tests performance
- `load-balancer-tester` - Tests load balancer

**Database**
- `database-test-manager` - Tests base de données

**Quality**
- `test-coverage-analyzer` ⭐ - Analyse couverture
- `mutation-test-runner` - Tests mutation
- `regression-test-tracker` - Suivi régressions

**Infrastructure**
- `test-data-generator` ⭐ - Génération données test
- `test-environment-manager` - Gestion environnements
- `test-orchestrator` - Orchestration tests
- `test-report-generator` - Rapports tests

**Spécialisés**
- `security-test-scanner` - Tests sécurité
- `smoke-test-runner` - Smoke tests
- `snapshot-test-manager` - Tests snapshot
- `chaos-engineering-toolkit` - Chaos engineering
- `mobile-app-tester` - Tests mobile

---

### 7. ⚡ PERFORMANCE (25 plugins)

**Monitoring**
- `apm-dashboard-creator` ⭐ - Dashboards APM
- `real-user-monitoring` - RUM
- `synthetic-monitoring-setup` - Monitoring synthétique
- `sla-sli-tracker` - Suivi SLA/SLI

**Analyse**
- `application-profiler` - Profiling application
- `bottleneck-detector` ⭐ - Détection goulots
- `performance-optimization-advisor` - Conseils optimisation
- `performance-regression-detector` - Détection régressions

**Resources**
- `cpu-usage-monitor` - Monitoring CPU
- `memory-leak-detector` ⭐ - Détection fuites mémoire
- `resource-usage-tracker` - Suivi ressources

**Network**
- `network-latency-analyzer` - Analyse latence
- `throughput-analyzer` - Analyse débit

**Database**
- `database-query-profiler` ⭐ - Profiling requêtes
- `cache-performance-optimizer` - Optimisation cache

**Testing**
- `load-test-runner` - Tests charge
- `capacity-planning-analyzer` - Planification capacité

**Logs & Metrics**
- `log-analysis-tool` - Analyse logs
- `metrics-aggregator` - Agrégation métriques
- `infrastructure-metrics-collector` - Collecte métriques

**Alerting**
- `alerting-rule-creator` ⭐ - Création règles alertes
- `error-rate-monitor` - Monitoring erreurs
- `response-time-tracker` - Suivi temps réponse
- `distributed-tracing-setup` - Tracing distribué
- `performance-budget-validator` - Budgets performance

---

### 8. 🔌 MCP SERVERS (6 plugins)

Ces plugins sont des serveurs MCP avancés offrant des capacités d'automatisation exceptionnelles:

- `workflow-orchestrator` ⭐⭐⭐ - Orchestration workflows complexes
- `domain-memory-agent` ⭐⭐⭐ - Mémoire persistante par domaine
- `project-health-auditor` ⭐⭐⭐ - Audit santé projet continu
- `conversational-api-debugger` ⭐⭐ - Debug API conversationnel
- `design-to-code` ⭐⭐ - Conversion design vers code
- `ai-experiment-logger` - Logging expériences AI

---

### 9. 🏢 AI AGENCY (7 plugins)

- `n8n-workflow-designer` ⭐⭐⭐ - Design workflows n8n
- `zapier-zap-builder` - Construction Zaps
- `make-scenario-builder` - Scénarios Make.com
- `discovery-questionnaire` - Questionnaires découverte
- `sow-generator` - Génération SOW
- `roi-calculator` - Calcul ROI
- `overnight-dev` ⭐⭐ - Développement autonome nocturne

---

### 10. 📈 PRODUCTIVITY (10+ plugins)

- `agent-context-manager` - Gestion contexte agent
- `ai-commit-gen` ⭐ - Génération commits AI
- `overnight-dev` ⭐⭐ - Dev autonome
- `taskwarrior-integration` - Intégration TaskWarrior
- `yaml-master-agent` - Maîtrise YAML
- `vertex-ai-media-master` - Médias Vertex AI
- `google-cloud-agent-sdk` - SDK Agent Google Cloud

---

### 11. 🎯 SKILL ENHANCERS (6 plugins)

- `calendar-to-workflow` - Calendrier vers workflow
- `file-to-code` - Fichier vers code
- `research-to-deploy` ⭐ - Recherche vers déploiement
- `search-to-slack` - Recherche vers Slack
- `web-to-github-issue` - Web vers GitHub Issues

---

### 12. 💼 BUSINESS TOOLS

- `excel-analyst-pro` ⭐ - Analyse Excel avancée

---

### 13. 💰 FINANCE

- `openbb-terminal` ⭐ - Terminal financier OpenBB

---

## 🎯 SÉLECTION PRIORITAIRE POUR DIRECTUS UNIFIED PLATFORM

### Vue d'ensemble des Besoins

La plateforme Directus Unified Platform nécessite des skills spécifiques pour :

| Domaine | Besoin | Priorité |
|---------|--------|----------|
| **Comptabilité Suisse** | TVA 8.1%, QR-Factures v2.3, Formulaire 200 AFC | 🔴 CRITIQUE |
| **Intégration API** | Invoice Ninja, Revolut, ERPNext, Mautic | 🔴 CRITIQUE |
| **Base de données** | PostgreSQL 83 collections, optimisation | 🔴 CRITIQUE |
| **Dashboard React** | SuperAdmin glassmorphism, temps réel | 🟡 HAUTE |
| **Sécurité** | Multi-tenant, RGPD, PCI DSS | 🟡 HAUTE |
| **Automatisation** | Workflows n8n, agents IA | 🟢 MOYENNE |

---

### 🏆 TOP 30 SKILLS PRIORITAIRES

#### TIER 1 - CRITIQUES (Installation Immédiate)

| # | Skill | Catégorie | Usage Directus |
|---|-------|-----------|----------------|
| 1 | `database-schema-designer` | Database | Design 83 collections PostgreSQL |
| 2 | `sql-query-optimizer` | Database | Optimisation requêtes Directus |
| 3 | `database-migration-manager` | Database | Migrations schéma |
| 4 | `rest-api-generator` | API | Endpoints custom Directus |
| 5 | `api-authentication-builder` | API | Auth multi-portails OAuth/JWT |
| 6 | `webhook-handler-creator` | API | Sync Invoice Ninja/Revolut |
| 7 | `n8n-workflow-designer` | AI Agency | Workflows automatisation |
| 8 | `anomaly-detection-system` | AI/ML | Détection fraudes transactions |
| 9 | `time-series-forecaster` | AI/ML | Prévisions cash flow |
| 10 | `gdpr-compliance-scanner` | Security | Conformité RGPD Suisse |

#### TIER 2 - HAUTE PRIORITÉ (Semaine 1-2)

| # | Skill | Catégorie | Usage Directus |
|---|-------|-----------|----------------|
| 11 | `pci-dss-validator` | Security | Conformité paiements Revolut |
| 12 | `api-rate-limiter` | API | Protection API Directus |
| 13 | `database-health-monitor` | Database | Monitoring PostgreSQL |
| 14 | `unit-test-generator` | Testing | Tests composants React |
| 15 | `e2e-test-framework` | Testing | Tests portails Playwright |
| 16 | `api-documentation-generator` | API | OpenAPI 156 endpoints |
| 17 | `ci-cd-pipeline-builder` | DevOps | GitHub Actions déploiement |
| 18 | `docker-compose-generator` | DevOps | Docker multi-services |
| 19 | `apm-dashboard-creator` | Performance | Monitoring temps réel |
| 20 | `workflow-orchestrator` | MCP | Orchestration multi-services |

#### TIER 3 - PRIORITÉ MOYENNE (Semaine 3-4)

| # | Skill | Catégorie | Usage Directus |
|---|-------|-----------|----------------|
| 21 | `sentiment-analysis-tool` | AI/ML | Analyse feedback clients |
| 22 | `nlp-text-analyzer` | AI/ML | Traitement tickets support |
| 23 | `recommendation-engine` | AI/ML | Suggestions produits/services |
| 24 | `backup-strategy-implementor` | DevOps | Backup PostgreSQL automatisé |
| 25 | `vulnerability-scanner` | Security | Scan sécurité continu |
| 26 | `database-query-profiler` | Performance | Profiling requêtes lentes |
| 27 | `alerting-rule-creator` | Performance | Alertes métriques critiques |
| 28 | `overnight-dev` | AI Agency | Dev autonome nocturne |
| 29 | `domain-memory-agent` | MCP | Mémoire contexte projet |
| 30 | `project-health-auditor` | MCP | Audit continu santé code |

---

### 📊 Matrice Skills × Entreprises

```
                    HYPER   DAINA   LEXAIA  ENKI    TAKEOUT
                    VISUAL  MICS            REALTY
────────────────────────────────────────────────────────────
database-schema     ✅      ✅      ✅      ✅      ✅
sql-query-optimizer ✅      ✅      ✅      ✅      ✅
api-auth-builder    ✅      ✅      ✅      ✅      ✅
webhook-handler     ✅      ✅      ✅      ✅      ✅
n8n-workflow        ✅      ✅      ✅      ✅      ✅
anomaly-detection   ⬜      ✅      ⬜      ✅      ✅
time-series-forecast⬜      ✅      ⬜      ✅      ✅
gdpr-compliance     ✅      ✅      ✅      ✅      ✅
pci-dss-validator   ⬜      ✅      ⬜      ✅      ✅
sentiment-analysis  ⬜      ⬜      ✅      ⬜      ✅
────────────────────────────────────────────────────────────
```

**Légende**: ✅ Applicable | ⬜ Non applicable

---

## 📥 INSTRUCTIONS D'INSTALLATION

### Prérequis

```bash
# Vérifier Claude Code installé
claude --version

# Vérifier Node.js 18+
node --version

# Vérifier Git
git --version
```

### Installation Méthode 1 : Clone Complet

```bash
# Cloner le repository de skills
cd ~/claude-skills
git clone https://github.com/jeremylongshore/claude-code-plugins-plus.git

# Structure obtenue
claude-code-plugins-plus/
├── plugins/
│   ├── ai-agency/
│   ├── ai-ml/
│   ├── api/
│   ├── business-tools/
│   ├── database/
│   ├── devops/
│   ├── finance/
│   ├── mcp/
│   ├── performance/
│   ├── productivity/
│   ├── security/
│   ├── skill-enhancers/
│   └── testing/
└── README.md
```

### Installation Méthode 2 : Skills Individuels

```bash
# Créer le dossier des skills utilisateur
mkdir -p ~/.claude/skills

# Copier un skill spécifique
cp -r claude-code-plugins-plus/plugins/database/sql-query-optimizer ~/.claude/skills/

# Ou télécharger directement
curl -L https://raw.githubusercontent.com/jeremylongshore/claude-code-plugins-plus/main/plugins/database/sql-query-optimizer/SKILL.md \
  -o ~/.claude/skills/sql-query-optimizer/SKILL.md
```

### Installation Méthode 3 : Via /mnt/skills (Recommandé)

```bash
# Pour les skills utilisateur personnalisés
sudo mkdir -p /mnt/skills/user

# Copier les skills prioritaires
sudo cp -r claude-code-plugins-plus/plugins/database/sql-query-optimizer /mnt/skills/user/
sudo cp -r claude-code-plugins-plus/plugins/api/webhook-handler-creator /mnt/skills/user/
sudo cp -r claude-code-plugins-plus/plugins/ai-agency/n8n-workflow-designer /mnt/skills/user/

# Permissions
sudo chmod -R 755 /mnt/skills/user/
```

### Configuration Claude Code

```json
// ~/.claude/config.json
{
  "skills": {
    "paths": [
      "/mnt/skills/public",
      "/mnt/skills/user",
      "~/.claude/skills"
    ],
    "autoload": true,
    "priority": ["user", "public"]
  }
}
```

### Vérification Installation

```bash
# Lister les skills disponibles
ls -la /mnt/skills/user/

# Vérifier structure d'un skill
cat /mnt/skills/user/sql-query-optimizer/SKILL.md | head -50

# Test dans Claude
# Demander: "Optimise cette requête SQL: SELECT * FROM users WHERE..."
# Claude devrait automatiquement utiliser sql-query-optimizer
```

---

### Script d'Installation Automatique

```bash
#!/bin/bash
# install-priority-skills.sh
# Installation des 30 skills prioritaires pour Directus Unified Platform

set -e

SKILLS_DIR="/mnt/skills/user"
REPO_URL="https://github.com/jeremylongshore/claude-code-plugins-plus"
TEMP_DIR="/tmp/claude-skills-install"

echo "🚀 Installation des Skills Claude Code Prioritaires"
echo "=================================================="

# Créer les répertoires
sudo mkdir -p $SKILLS_DIR
mkdir -p $TEMP_DIR

# Cloner le repo
echo "📥 Clonage du repository..."
git clone --depth 1 $REPO_URL $TEMP_DIR/repo

# Skills Tier 1 - Critiques
TIER1_SKILLS=(
  "database/database-schema-designer"
  "database/sql-query-optimizer"
  "database/database-migration-manager"
  "api/rest-api-generator"
  "api/api-authentication-builder"
  "api/webhook-handler-creator"
  "ai-agency/n8n-workflow-designer"
  "ai-ml/anomaly-detection-system"
  "ai-ml/time-series-forecaster"
  "security/gdpr-compliance-scanner"
)

# Skills Tier 2 - Haute Priorité
TIER2_SKILLS=(
  "security/pci-dss-validator"
  "api/api-rate-limiter"
  "database/database-health-monitor"
  "testing/unit-test-generator"
  "testing/e2e-test-framework"
  "api/api-documentation-generator"
  "devops/ci-cd-pipeline-builder"
  "devops/docker-compose-generator"
  "performance/apm-dashboard-creator"
  "mcp/workflow-orchestrator"
)

# Skills Tier 3 - Priorité Moyenne
TIER3_SKILLS=(
  "ai-ml/sentiment-analysis-tool"
  "ai-ml/nlp-text-analyzer"
  "ai-ml/recommendation-engine"
  "devops/backup-strategy-implementor"
  "security/vulnerability-scanner"
  "performance/database-query-profiler"
  "performance/alerting-rule-creator"
  "ai-agency/overnight-dev"
  "mcp/domain-memory-agent"
  "mcp/project-health-auditor"
)

install_skills() {
  local tier=$1
  shift
  local skills=("$@")
  
  echo ""
  echo "📦 Installation Tier $tier..."
  
  for skill in "${skills[@]}"; do
    skill_name=$(basename $skill)
    if [ -d "$TEMP_DIR/repo/plugins/$skill" ]; then
      echo "  ✅ $skill_name"
      sudo cp -r "$TEMP_DIR/repo/plugins/$skill" "$SKILLS_DIR/"
    else
      echo "  ⚠️ $skill_name (non trouvé)"
    fi
  done
}

# Installation par tiers
install_skills "1 (CRITIQUE)" "${TIER1_SKILLS[@]}"
install_skills "2 (HAUTE)" "${TIER2_SKILLS[@]}"
install_skills "3 (MOYENNE)" "${TIER3_SKILLS[@]}"

# Permissions
sudo chmod -R 755 $SKILLS_DIR

# Nettoyage
rm -rf $TEMP_DIR

echo ""
echo "✨ Installation terminée!"
echo "📁 Skills installés dans: $SKILLS_DIR"
echo ""
echo "🔍 Vérification:"
ls -la $SKILLS_DIR | head -20
```

---

## 🔗 MAPPING AVEC LES BESOINS DU PROJET

### Architecture Actuelle Directus Unified Platform

```
┌─────────────────────────────────────────────────────────────────┐
│                    DIRECTUS UNIFIED PLATFORM                     │
├─────────────────────────────────────────────────────────────────┤
│  Frontend React 18.2 + Vite + Tailwind + shadcn/ui              │
│  ┌──────────┬──────────┬──────────┬──────────┐                  │
│  │SuperAdmin│  Client  │Prestataire│Revendeur│                  │
│  │ Portal   │  Portal  │  Portal   │ Portal  │                  │
│  └──────────┴──────────┴──────────┴──────────┘                  │
├─────────────────────────────────────────────────────────────────┤
│  Backend Directus CMS + PostgreSQL                              │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  83 Collections │ 156 Endpoints │ Hooks & Extensions    │    │
│  └─────────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────────┤
│  Intégrations Externes                                          │
│  ┌────────┬────────┬────────┬────────┬────────┐                │
│  │Invoice │Revolut │ERPNext │ Mautic │OpenAI  │                │
│  │ Ninja  │  API   │  v15   │  5.x   │ Vision │                │
│  └────────┴────────┴────────┴────────┴────────┘                │
└─────────────────────────────────────────────────────────────────┘
```

---

### Mapping Détaillé : Skills → Fonctionnalités

#### 🏦 MODULE COMPTABILITÉ SUISSE

| Fonctionnalité | Skill Requis | Implémentation |
|----------------|--------------|----------------|
| Plan comptable PME Käfer | `database-schema-designer` | Créer collection `chart_of_accounts` avec 300+ comptes |
| TVA 2025 (8.1%/2.6%/3.8%) | `rest-api-generator` | Endpoint `/api/vat/calculate` |
| Formulaire 200 AFC | `api-documentation-generator` | Endpoint `/api/vat/form200` + export XML |
| QR-Factures v2.3 | `webhook-handler-creator` | Génération automatique depuis Invoice Ninja |
| Rapprochement bancaire | `anomaly-detection-system` | Matching transactions Revolut |
| Prévisions trésorerie | `time-series-forecaster` | ML sur historique cash flow |

**Skill Custom Existant**: `/mnt/skills/user/swiss-accounting/SKILL.md`

---

#### 💳 MODULE PAIEMENTS REVOLUT

| Fonctionnalité | Skill Requis | Implémentation |
|----------------|--------------|----------------|
| OAuth2 + JWT RS256 | `api-authentication-builder` | Auth sécurisée multi-comptes |
| Multi-devises CHF/EUR/USD | `database-schema-designer` | Collections `bank_accounts`, `exchange_rates` |
| Sync transactions temps réel | `webhook-handler-creator` | Webhooks Revolut → Directus |
| Détection fraudes | `anomaly-detection-system` | ML sur patterns transactions |
| Conformité PCI DSS | `pci-dss-validator` | Audit sécurité paiements |
| Dashboard banking | `apm-dashboard-creator` | Composants React glassmorphism |

---

#### 📄 MODULE FACTURATION INVOICE NINJA

| Fonctionnalité | Skill Requis | Implémentation |
|----------------|--------------|----------------|
| Sync bidirectionnelle | `webhook-handler-creator` | Webhooks Invoice Ninja ↔ Directus |
| Templates par entreprise | `rest-api-generator` | Endpoints templates CRUD |
| Génération PDF | `api-batch-processor` | Traitement batch factures |
| Relances automatiques | `n8n-workflow-designer` | Workflow relance à J+30, J+45, J+60 |
| Analytics facturation | `data-visualization-creator` | Graphiques Recharts |

---

#### 🤖 MODULE AUTOMATISATION IA

| Fonctionnalité | Skill Requis | Implémentation |
|----------------|--------------|----------------|
| OCR documents | `computer-vision-processor` | OpenAI Vision extraction |
| Analyse sentiments | `sentiment-analysis-tool` | Feedback clients NPS |
| Tickets support | `nlp-text-analyzer` | Catégorisation automatique |
| Recommandations | `recommendation-engine` | Suggestions produits/services |
| Workflows n8n | `n8n-workflow-designer` | Orchestration multi-services |
| Agents autonomes | `overnight-dev` | Développement nocturne |

---

#### 🔒 MODULE SÉCURITÉ & CONFORMITÉ

| Fonctionnalité | Skill Requis | Implémentation |
|----------------|--------------|----------------|
| Multi-tenant isolation | `access-control-auditor` | Permissions par entreprise |
| RGPD Suisse | `gdpr-compliance-scanner` | Audit données personnelles |
| Audit trail | `database-audit-logger` | Logs toutes modifications |
| Scan vulnérabilités | `vulnerability-scanner` | Scan continu CI/CD |
| Secrets management | `secrets-manager-integrator` | Vault intégration |

---

#### 📊 MODULE DASHBOARD SUPERADMIN

| Fonctionnalité | Skill Requis | Implémentation |
|----------------|--------------|----------------|
| Métriques temps réel | `apm-dashboard-creator` | WebSocket + React Query |
| KPIs financiers | `time-series-forecaster` | Prédictions ARR/MRR/EBITDA |
| Alertes intelligentes | `alerting-rule-creator` | Seuils dynamiques |
| Performance DB | `database-query-profiler` | Monitoring requêtes lentes |
| Santé système | `project-health-auditor` | Audit continu |

---

### Mapping Collections Directus → Skills

```
COLLECTION                  SKILLS APPLICABLES
─────────────────────────────────────────────────────────
companies (5)               database-schema-designer
                           gdpr-compliance-scanner
                           
contacts/people            gdpr-compliance-scanner
                           nlp-text-analyzer
                           
projects                   database-schema-designer
                           time-series-forecaster
                           
client_invoices            rest-api-generator
                           webhook-handler-creator
                           pci-dss-validator
                           
supplier_invoices          anomaly-detection-system
                           webhook-handler-creator
                           
bank_transactions          anomaly-detection-system
                           pci-dss-validator
                           database-audit-logger
                           
chart_of_accounts          database-schema-designer
                           (swiss-accounting skill)
                           
vat_declarations           rest-api-generator
                           (swiss-accounting skill)
                           
journal_entries            database-audit-logger
                           sql-query-optimizer
```

---

## 📅 ROADMAP D'INTÉGRATION

### Phase 1 : Fondation (Semaine 1)

```
┌─────────────────────────────────────────────────────────┐
│  SEMAINE 1 - FONDATION                                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Jour 1-2: Installation Skills                          │
│  ├─ Exécuter install-priority-skills.sh                │
│  ├─ Configurer /mnt/skills/user/                       │
│  └─ Vérifier activation automatique                    │
│                                                         │
│  Jour 3-4: Database Optimization                        │
│  ├─ database-schema-designer → audit 83 collections    │
│  ├─ sql-query-optimizer → optimiser requêtes lentes    │
│  └─ database-migration-manager → migrations pending    │
│                                                         │
│  Jour 5: API Foundation                                 │
│  ├─ rest-api-generator → nouveaux endpoints            │
│  ├─ api-authentication-builder → OAuth multi-portal    │
│  └─ api-documentation-generator → OpenAPI spec         │
│                                                         │
│  Livrables:                                             │
│  ✅ 30 skills installés et fonctionnels                │
│  ✅ Schéma DB optimisé                                 │
│  ✅ API documentée                                     │
└─────────────────────────────────────────────────────────┘
```

### Phase 2 : Intégrations (Semaine 2)

```
┌─────────────────────────────────────────────────────────┐
│  SEMAINE 2 - INTÉGRATIONS                               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Jour 1-2: Webhooks & Sync                              │
│  ├─ webhook-handler-creator → Invoice Ninja hooks      │
│  ├─ webhook-handler-creator → Revolut webhooks         │
│  └─ webhook-handler-creator → Mautic webhooks          │
│                                                         │
│  Jour 3-4: Automatisation                               │
│  ├─ n8n-workflow-designer → workflows facturation      │
│  ├─ n8n-workflow-designer → workflows relances         │
│  └─ n8n-workflow-designer → workflows notifications    │
│                                                         │
│  Jour 5: Monitoring                                     │
│  ├─ apm-dashboard-creator → dashboard monitoring       │
│  ├─ database-health-monitor → alertes DB               │
│  └─ alerting-rule-creator → règles critiques           │
│                                                         │
│  Livrables:                                             │
│  ✅ Sync temps réel 4 services externes                │
│  ✅ 10+ workflows n8n automatisés                      │
│  ✅ Monitoring complet opérationnel                    │
└─────────────────────────────────────────────────────────┘
```

### Phase 3 : Intelligence (Semaine 3)

```
┌─────────────────────────────────────────────────────────┐
│  SEMAINE 3 - INTELLIGENCE IA                            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Jour 1-2: ML & Prédictions                             │
│  ├─ anomaly-detection-system → fraudes transactions    │
│  ├─ time-series-forecaster → prévisions cash flow      │
│  └─ recommendation-engine → suggestions clients        │
│                                                         │
│  Jour 3-4: NLP & Analyse                                │
│  ├─ sentiment-analysis-tool → analyse NPS              │
│  ├─ nlp-text-analyzer → catégorisation tickets         │
│  └─ data-visualization-creator → dashboards ML         │
│                                                         │
│  Jour 5: Agents Autonomes                               │
│  ├─ overnight-dev → dev nocturne automatisé            │
│  ├─ domain-memory-agent → contexte persistant          │
│  └─ project-health-auditor → audit continu             │
│                                                         │
│  Livrables:                                             │
│  ✅ Détection anomalies opérationnelle                 │
│  ✅ Prévisions financières automatiques                │
│  ✅ Agents IA autonomes actifs                         │
└─────────────────────────────────────────────────────────┘
```

### Phase 4 : Sécurité & Compliance (Semaine 4)

```
┌─────────────────────────────────────────────────────────┐
│  SEMAINE 4 - SÉCURITÉ & COMPLIANCE                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Jour 1-2: Audits Conformité                            │
│  ├─ gdpr-compliance-scanner → audit RGPD complet       │
│  ├─ pci-dss-validator → conformité paiements           │
│  └─ compliance-report-generator → rapports             │
│                                                         │
│  Jour 3-4: Tests & Qualité                              │
│  ├─ unit-test-generator → tests React components       │
│  ├─ e2e-test-framework → tests Playwright              │
│  └─ test-coverage-analyzer → rapport couverture        │
│                                                         │
│  Jour 5: CI/CD & Production                             │
│  ├─ ci-cd-pipeline-builder → GitHub Actions            │
│  ├─ docker-compose-generator → stack production        │
│  └─ backup-strategy-implementor → backup automatisé    │
│                                                         │
│  Livrables:                                             │
│  ✅ Conformité RGPD + PCI DSS validée                  │
│  ✅ Couverture tests > 80%                             │
│  ✅ Pipeline CI/CD production-ready                    │
└─────────────────────────────────────────────────────────┘
```

---

### Timeline Visuelle

```
      Semaine 1        Semaine 2        Semaine 3        Semaine 4
    ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
    │FONDATION │────▶│INTÉGRATION────▶│INTELLIGENCE───▶│SÉCURITÉ  │
    │          │     │          │     │    IA    │     │COMPLIANCE│
    └──────────┘     └──────────┘     └──────────┘     └──────────┘
         │                │                │                │
         ▼                ▼                ▼                ▼
    ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
    │• Skills  │     │• Webhooks│     │• ML/AI   │     │• RGPD    │
    │• Database│     │• n8n     │     │• Prédic- │     │• Tests   │
    │• API     │     │• Monitor │     │  tions   │     │• CI/CD   │
    └──────────┘     └──────────┘     └──────────┘     └──────────┘
```

---

### Métriques de Succès

| Métrique | Objectif S1 | Objectif S2 | Objectif S3 | Objectif S4 |
|----------|-------------|-------------|-------------|-------------|
| Skills actifs | 10 | 20 | 25 | 30 |
| Temps réponse API | < 500ms | < 300ms | < 200ms | < 100ms |
| Couverture tests | 20% | 40% | 60% | 80% |
| Workflows n8n | 0 | 10 | 15 | 20 |
| Conformité RGPD | 0% | 50% | 80% | 100% |
| Prédictions ML | 0 | 2 | 5 | 7 |
| Alertes automatisées | 5 | 15 | 25 | 40 |

---

### Dépendances Critiques

```
graph TD
    A[Skills Installation] --> B[Database Optimization]
    B --> C[API Foundation]
    C --> D[Webhook Handlers]
    D --> E[n8n Workflows]
    E --> F[ML/AI Models]
    F --> G[Compliance Audits]
    G --> H[CI/CD Pipeline]
    
    style A fill:#ff6b6b
    style B fill:#ff6b6b
    style C fill:#ff6b6b
    style D fill:#feca57
    style E fill:#feca57
    style F fill:#48dbfb
    style G fill:#1dd1a1
    style H fill:#1dd1a1
```

**Légende**: 🔴 Bloquant | 🟡 Important | 🔵 Optionnel | 🟢 Final

---

## 📚 RESSOURCES ADDITIONNELLES

### Liens Utiles

- **Repository Skills**: https://github.com/jeremylongshore/claude-code-plugins-plus
- **Documentation Anthropic**: https://docs.anthropic.com/claude/docs/claude-code
- **Directus API**: https://docs.directus.io/reference/introduction.html
- **Invoice Ninja API**: https://api-docs.invoicing.co/
- **Revolut Business API**: https://developer.revolut.com/docs/business/

### Skills Custom Projet

| Skill | Chemin | Description |
|-------|--------|-------------|
| swiss-accounting | `/mnt/skills/user/swiss-accounting/` | Comptabilité suisse 2025 |
| geo-optimizer | `/mnt/skills/user/geo-optimizer/` | Optimisation GEO |
| geo-seo-auditor | `/mnt/skills/user/geo-seo-auditor/` | Audit SEO/GEO |
| content-research-writer | `/mnt/skills/user/content-research-writer/` | Rédaction SEO |

### Contacts Support

- **Maintainer Skills**: Jeremy Longshore (@jeremylongshore)
- **Projet Directus**: Jean-Marie (@dainabase)

---

## ✅ CHECKLIST FINALE

### Avant Démarrage
- [ ] Repository claude-code-plugins-plus cloné
- [ ] Script install-priority-skills.sh exécuté
- [ ] /mnt/skills/user/ configuré avec permissions
- [ ] Claude Code configuré pour charger les skills
- [ ] Skill swiss-accounting vérifié

### Après Phase 1
- [ ] 10 skills Tier 1 installés et testés
- [ ] Schéma DB 83 collections optimisé
- [ ] Documentation API OpenAPI générée
- [ ] Authentification OAuth multi-portails

### Après Phase 2
- [ ] Webhooks Invoice Ninja/Revolut/Mautic actifs
- [ ] 10+ workflows n8n fonctionnels
- [ ] Dashboard monitoring opérationnel
- [ ] Alertes critiques configurées

### Après Phase 3
- [ ] ML anomaly detection opérationnel
- [ ] Prévisions cash flow automatiques
- [ ] Agents IA overnight-dev actifs
- [ ] Mémoire domaine persistante

### Après Phase 4
- [ ] Conformité RGPD 100%
- [ ] Conformité PCI DSS validée
- [ ] Couverture tests > 80%
- [ ] Pipeline CI/CD production

---

*Document généré le 14 Décembre 2025*  
*Version 1.0 - Directus Unified Platform*