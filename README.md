# 🚀 Directus Unified Platform

[![Status](https://img.shields.io/badge/status-active-success.svg)]()
[![Directus](https://img.shields.io/badge/directus-v10-purple.svg)]()
[![Tabler](https://img.shields.io/badge/tabler-v1.0.0--beta20-blue.svg)]()

## 📊 État du Projet (Réorganisé)

### Migration Notion → Directus
- **Collections migrées**: 7/62 (11.3%) ✅
- **Relations créées**: 10/105 (9.5%) ✅
- **Dashboard importé**: 100% ✅
- **OCR fonctionnel**: 100% ✅
- **Endpoints adaptés**: 38/156 (24%) 🔄

### Infrastructure
- **Backend**: Node.js + Express + Directus SDK
- **Frontend**: 4 portails avec Tabler.io
- **Base de données**: PostgreSQL via Docker
- **Cache**: Redis
- **OCR**: OpenAI Vision API

## 🚀 Démarrage Rapide

```bash
# Installation
npm install

# Configuration
cp .env.example .env
# Éditer .env avec vos clés API

# Développement
npm run dev

# Production
npm run build
npm start
```

## 📁 Nouvelle Structure du Projet

```
src/
├── backend/        # Serveur Node.js unifié
├── frontend/       # 4 portails métier
│   └── portals/
│       ├── dashboard-legacy/  # Dashboard original préservé
│       ├── superadmin/       # Dashboard consolidé + OCR
│       ├── client/           # Espace client
│       ├── prestataire/      # Espace prestataire
│       └── revendeur/        # Espace revendeur
└── directus/       # Extensions Directus

migration/          # Scripts de migration Notion
docs/              # Documentation complète
design-system/     # Design System Tabler
tests/            # Tests automatisés
```

## 📚 Documentation

- [Architecture](./docs/architecture/overview.md)
- [API Reference](./docs/api/reference.md)
- [Guide de développement](./docs/development/setup.md)
- [Déploiement](./docs/deployment/production.md)

## 🔧 Scripts Disponibles

- `npm run dev` - Lance l'environnement de développement
- `npm run migrate` - Execute les migrations
- `npm run test` - Lance les tests
- `npm run backup` - Créé un backup complet

## ⚠️ Notes Importantes

- Le dashboard original est préservé dans `src/frontend/portals/dashboard-legacy/`
- Les 156 endpoints legacy sont dans `src/backend/api/legacy/`
- Le code OCR n'a pas été modifié
- Tous les fichiers originaux ont été préservés

## 📄 Licence

Propriétaire - Dainamics SA
