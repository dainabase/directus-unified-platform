# 🤝 Guide de Contribution

## Vue d'ensemble

Ce projet unifie la migration de 62 bases Notion vers 48 collections Directus avec un dashboard multi-espaces.

## 🔴 Règles critiques

1. **JAMAIS** supprimer de données Notion - LECTURE SEULE
2. **TOUJOURS** vérifier les connexions MCP avant d'agir
3. **DOCUMENTER** chaque action dans les logs

## 📋 Workflow de contribution

### 1. Branches

- `main` : Production stable
- `feature/migration-*` : Fonctionnalités migration
- `feature/dashboard-*` : Fonctionnalités dashboard
- `fix/*` : Corrections de bugs

### 2. Commits

Format : `type(scope): description`

Types :
- `feat` : Nouvelle fonctionnalité
- `fix` : Correction de bug
- `docs` : Documentation
- `refactor` : Refactoring
- `test` : Tests
- `chore` : Maintenance

Exemples :
```
feat(migration): add CRM module transformation
fix(dashboard): resolve client portal auth
docs(api): update Directus schema documentation
```

### 3. Tests

Avant chaque PR :
```bash
npm run test:migration
npm run test:dashboard
npm run verify:all
```

## 🏗️ Structure des modules

### Migration
```
migration/
├── src/
│   ├── analyzers/     # Analyse des bases Notion
│   ├── transformers/  # Transformation des données
│   ├── migrators/     # Exécution des migrations
│   └── validators/    # Validation des résultats
├── scripts/           # Scripts d'exécution
└── docs/             # Documentation technique
```

### Dashboard
```
dashboard/
├── frontend/
│   ├── superadmin/   # Interface SuperAdmin
│   ├── client/       # Portail Client
│   ├── prestataire/  # Portail Prestataire
│   ├── revendeur/    # Portail Revendeur
│   └── shared/       # Composants partagés
└── backend/          # API et logique métier
```

## 📊 Progression

Utilisez les scripts de suivi :
```bash
npm run migrate:report     # Rapport de migration
npm run dashboard:status   # État du dashboard
```

## 🔐 Sécurité

- Variables d'environnement dans `.env`
- Tokens Notion en lecture seule
- Permissions Directus granulaires
- Validation des données avant migration

## 🚀 Développement

### Setup initial
```bash
npm run setup:deps
cp .env.example .env
# Configurer les variables
npm run directus:setup
```

### Développement migration
```bash
npm run migrate:test-connections
npm run migrate:analyze
```

### Développement dashboard
```bash
npm run dashboard:dev
```

## 📝 Documentation

- Documenter chaque nouvelle collection Directus
- Mettre à jour les mappings Notion → Directus
- Ajouter des exemples d'usage dans `/docs`