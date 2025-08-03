# 🚀 Prompt d'Onboarding pour Claude Code - Projet Lexaia

## Instructions pour votre associé

Copiez ce prompt dans Claude Code pour synchroniser notre organisation :

---

## PROMPT À COPIER :

Je rejoins le projet Lexaia en tant qu'associé développeur. Voici le contexte et les règles à suivre absolument :

### 📋 Contexte du projet
- **Projet** : Lexaia - Plateforme juridique multitenant avec RAG
- **Repository** : https://github.com/dainabase/lexaia
- **Tech Stack** : NestJS (API), Next.js (Frontend), Keycloak (Auth), PostgreSQL, Redis
- **Phase actuelle** : Infrastructure de base complétée (70%), API fonctionnelle

### 🚨 RÈGLES CRITIQUES À RESPECTER

1. **TOUJOURS lire ces fichiers en premier** :
   - `CLAUDE.md` - Instructions obligatoires pour l'IA
   - `STABLE_MODULES.md` - Modules à NE JAMAIS modifier
   - `ENV_RULES.md` - Règles pour le fichier .env
   - `.protected-files` - Liste des fichiers protégés

2. **Modules STABLES (NE PAS MODIFIER)** :
   - `/src/auth/*` - Module d'authentification
   - `/src/health/*` - Module health check
   - `/src/config/configuration.ts` - Configuration
   - Ces fichiers sont verrouillés et fonctionnels

3. **Fichier .env** :
   - JAMAIS utiliser `Write` sur .env
   - TOUJOURS utiliser `Edit` pour ajouter des variables
   - JAMAIS supprimer les variables existantes

4. **Avant toute modification** :
   ```bash
   npm run verify:stable
   npm run check:env
   ```

### 📚 SYSTÈME DE DOCUMENTATION COMPLET

Notre projet utilise un système de suivi exhaustif en Markdown. **CONSULTEZ ET METTEZ À JOUR CES FICHIERS** :

#### 1. **Documentation de planification**
- `docs/1 - lexaia_development_plan.md` - Plan de développement complet (6 phases)
- `docs/1-1 - lexaia_architecture report.md` - Rapport d'architecture et décisions techniques
- `docs/2 - container_separation_architecture.md` - Architecture multi-containers détaillée

#### 2. **Suivi d'implémentation**
- `docs/api_implementation_status.md` - **CRITIQUE** : État temps réel des 137 endpoints
  - Dashboard de progression (6/137 implémentés)
  - Status par module avec symboles (✅/🚧/📅)
  - Assignations et priorités
- `docs/lexaia_endpoints.md` - Spécifications complètes des 137 endpoints
  - Méthodes HTTP, auth requise, rôles
  - Conventions et formats de réponse

#### 3. **Documentation technique**
- `docs/3 - keycloak_authentication_complete_guide.md` - Guide Keycloak complet
- `docs/4 - git_automation_github_setup.md` - Workflows Git et automatisation
- `docs/5 - docker_installation_wsl.md` - Setup Docker/WSL
- `docs/monitoring-access-list.md` - Liste exhaustive pour le monitoring futur

#### 4. **Fichiers de protection**
- `STABLE_MODULES.md` - Modules verrouillés avec workflow de modification
- `ENV_RULES.md` - Règles critiques pour .env
- `.protected-files` - Liste technique des fichiers protégés
- `.validate-project.json` - Configuration de validation automatique

### 📊 État actuel du projet

**Infrastructure en place** :
- ✅ Keycloak sur http://localhost:8080 (admin/admin123)
- ✅ API NestJS sur http://localhost:4000
- ✅ PostgreSQL sur localhost:5432
- ✅ Redis sur localhost:6379
- ✅ pgAdmin sur http://localhost:5050

**Progression par module** (voir `api_implementation_status.md` pour détails) :
- Auth : 4/11 endpoints (36.4%)
- System : 2/4 endpoints (50%)
- Users : 0/11 endpoints (0%)
- Documents : 0/16 endpoints (0%)
- Chat/RAG : 0/12 endpoints (0%)
- Organizations : 0/9 endpoints (0%)
- Admin : 0/7 endpoints (0%)
- **TOTAL : 6/137 endpoints (4.4%)**

### 🛠️ Pour commencer

1. **Clone et setup** :
   ```bash
   git clone https://github.com/dainabase/lexaia.git
   cd lexaia
   git checkout develop
   ```

2. **Lire la documentation** :
   ```bash
   # Ordre de lecture recommandé
   cat CLAUDE.md
   cat docs/1-1\ -\ lexaia_architecture\ report.md
   cat docs/api_implementation_status.md
   ```

3. **Lancer l'infrastructure** :
   ```bash
   docker compose -f docker-compose.keycloak.yml up -d
   docker compose -f docker-compose.dev.yml up -d
   ```

4. **Lancer l'API** :
   ```bash
   cd lexaia-api
   npm install
   npm run start:dev
   ```

5. **Vérifier que tout fonctionne** :
   ```bash
   ./scripts/test-api-windows.ps1  # ou test-api.sh sur Linux
   npm run verify:all
   ```

### 📁 Structure du projet

```
lexaia/
├── CLAUDE.md              # ⚠️ LIRE EN PREMIER
├── STABLE_MODULES.md      # ⚠️ Modules verrouillés
├── ENV_RULES.md          # ⚠️ Règles .env
├── .env                  # ⚠️ NE JAMAIS écraser
├── lexaia-api/           # Backend NestJS
│   └── src/
│       ├── auth/         # 🔒 STABLE v1.0
│       ├── health/       # 🔒 STABLE v1.0
│       └── config/       # 🔒 STABLE v1.0
├── docs/                 # 📚 TOUTE LA DOCUMENTATION
│   ├── 1 - lexaia_development_plan.md
│   ├── 1-1 - lexaia_architecture report.md
│   ├── api_implementation_status.md    # ⭐ CRITIQUE
│   ├── lexaia_endpoints.md             # ⭐ RÉFÉRENCE
│   └── monitoring-access-list.md
└── scripts/              # Scripts utilitaires
    ├── check-stable.sh
    ├── check-env-safety.sh
    └── test-api.sh
```

### 🎯 Workflow de développement

1. **Avant de coder** :
   - Lire `api_implementation_status.md`
   - Choisir un endpoint non implémenté
   - Mettre à jour le status à "🚧 En cours"

2. **Après implémentation** :
   - Mettre à jour le status à "✅"
   - Modifier le dashboard de progression
   - Ajouter des notes si nécessaire

3. **Documentation continue** :
   - Chaque décision technique → `1-1 - lexaia_architecture report.md`
   - Chaque endpoint complété → `api_implementation_status.md`
   - Chaque nouveau service → `monitoring-access-list.md`

### ⚡ Commandes essentielles

```bash
# Vérifications d'intégrité
npm run verify:stable     # Vérifie modules stables
npm run check:env         # Vérifie .env
npm run verify:all        # Tout vérifier

# Tests
npm test                  # Tests unitaires
npm run test:e2e          # Tests E2E
./scripts/test-api.sh     # Test endpoints

# Monitoring des services
docker ps                 # Containers actifs
docker logs -f lexaia-api # Logs API
```

### 🤝 Règles de collaboration

1. **Branches** : 
   - `main` : Production (protégée)
   - `develop` : Développement actif

2. **Commits** :
   - Format : `type: description`
   - Types : feat, fix, docs, style, refactor, test

3. **Documentation** :
   - TOUJOURS mettre à jour `api_implementation_status.md`
   - Documenter les décisions dans `architecture report.md`

4. **Code Review** :
   - Vérifier STABLE_MODULES.md
   - Lancer verify:stable
   - Mettre à jour la doc

### 📞 Points d'entrée critiques

1. **État global** : `docs/api_implementation_status.md`
2. **Architecture** : `docs/1-1 - lexaia_architecture report.md`
3. **Endpoints** : `docs/lexaia_endpoints.md`
4. **Monitoring** : `docs/monitoring-access-list.md`

### 🚀 Prochaines priorités (depuis la doc)

1. Créer un utilisateur test dans Keycloak
2. Installer Prisma ORM (`npm install prisma @prisma/client`)
3. Implémenter les 7 endpoints Auth restants
4. Module Users avec CRUD (11 endpoints)
5. Setup monitoring basique (UptimeKuma)

**IMPORTANT** : Notre succès repose sur cette documentation centralisée. Lisez-la, suivez-la, mettez-la à jour. La cohérence prime sur la vitesse.

---

## FIN DU PROMPT

### Instructions pour votre associé :

1. Copiez tout le texte entre "PROMPT À COPIER" et "FIN DU PROMPT"
2. Collez-le dans une nouvelle conversation Claude Code
3. Claude aura immédiatement accès à toute notre organisation
4. Il suivra automatiquement notre système de documentation

Cette approche garantit une synchronisation parfaite et un suivi rigoureux du projet ! 🚀