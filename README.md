# 🚀 Directus Unified Platform

> Plateforme complète intégrant migration Notion (62→48 collections) et Dashboard Multi-espaces avec Directus

## 🎯 Vue d'ensemble

Ce projet unifie deux systèmes majeurs :
1. **Migration intelligente** : 62 bases Notion → 48 collections Directus optimisées
2. **Dashboard Multi-espaces** : 4 portails (SuperAdmin, Clients, Prestataires, Revendeurs)

### 🔢 Chiffres clés
- **62 bases Notion** à migrer
- **48 collections Directus** optimisées
- **4 espaces utilisateurs** distincts
- **128 automatisations** prévues
- **ROI attendu** : -85% temps opérationnel

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────┐
│            DASHBOARD MULTI-ESPACES               │
│         (Vue/React avec Directus SDK)            │
├────────────┬────────────┬────────────┬───────────┤
│ SuperAdmin │  Clients   │Prestataires│Revendeurs │
└─────┬──────┴─────┬──────┴─────┬──────┴─────┬─────┘
      └────────────┴────────────┴────────────┘
                         │
              ┌──────────▼──────────┐
              │    DIRECTUS API     │
              │   REST + GraphQL    │
              └──────────┬──────────┘
                         │
              ┌──────────▼──────────┐
              │   48 COLLECTIONS    │
              │  (depuis 62 Notion) │
              └─────────────────────┘
```

## 🚀 Démarrage rapide

### Prérequis
- Node.js 18+
- Directus instance
- Notion API key
- MCP configuré (Claude Desktop)

### Installation
```bash
# Cloner le repo
git clone https://github.com/dainabase/directus-unified-platform.git
cd directus-unified-platform

# Installer les dépendances
npm run setup:deps

# Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos clés

# Initialiser Directus
npm run directus:setup
```

## 📊 Modules de migration

### État actuel : 0/11 modules migrés

| Module | Bases Notion | Collections Directus | Status |
|--------|-------------|---------------------|---------|
| CRM & Contacts | 5 | 4 | ⏳ À faire |
| Finance | 9 | 6 | ⏳ À faire |
| Projets | 3 | 3 | ⏳ À faire |
| Documents | 3 | 2 | ⏳ À faire |
| Marketing | 11 | 7 | ⏳ À faire |
| RH | 5 | 4 | ⏳ À faire |
| Prestataires | 5 | 5 | ⏳ À faire |
| Système | 9 | 7 | ⏳ À faire |
| Analytics | 6 | 4 | ⏳ À faire |
| Juridique | 2 | 2 | ⏳ À faire |
| Multi-Entités | 4 | 4 | ⏳ À faire |

## 🛠️ Commandes disponibles

### Migration
```bash
npm run migrate:analyze      # Analyser les bases Notion
npm run migrate:plan         # Générer le plan de migration
npm run migrate:execute      # Exécuter la migration
npm run migrate:validate     # Valider les données
```

### Dashboard
```bash
npm run dashboard:dev        # Lancer en développement
npm run dashboard:build      # Build production
```

### Directus
```bash
npm run directus:setup       # Configuration initiale
npm run directus:create-collections  # Créer les 48 collections
```

## 📁 Structure du projet

```
directus-unified-platform/
├── migration/              # Module de migration Notion → Directus
├── dashboard/              # Dashboard multi-espaces
├── directus/               # Configuration Directus
├── automation/             # Workflows et automatisations
├── config/                 # Configuration globale
└── tests/                  # Tests unitaires et E2E
```

## 🔐 Sécurité

- **Notion** : Lecture seule, jamais de suppression
- **Directus** : RBAC granulaire par rôle
- **API** : Rate limiting et authentification JWT
- **Dashboard** : Sessions sécurisées

## 📝 Documentation

- [Guide de migration](migration/docs/README.md)
- [Architecture dashboard](dashboard/docs/README.md)
- [Configuration Directus](directus/README.md)
- [Automatisations](automation/README.md)

## 🤝 Contribution

Voir [CONTRIBUTING.md](CONTRIBUTING.md)

## 📄 License

MIT - Voir [LICENSE](LICENSE)

---

Made with ❤️ par DainaBase