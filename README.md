# 🚀 Directus Unified Platform

## Vue d'ensemble

Plateforme de gestion d'entreprise multi-portails complète construite avec Directus CMS, React, et intégrant plusieurs services externes.

### 🏢 5 Entreprises Gérées
- **HYPERVISUAL** - ID: `2d6b906a-5b8a-4d9e-a37b-aee8c1281b22`
- **DAINAMICS** - ID: `55483d07-6621-43d4-89a9-5ebbffe86fea`
- **ENKI REALTY** - ID: `6f4bc42a-d083-4df5-ace3-6b910164ae18`
- **LEXAIA** - ID: `9314fda4-cf3b-4021-9556-3acaa5f35b3f`
- **TAKEOUT** - ID: `a1313adf-0347-424b-aff2-c5f0b33c4a05`

## 🏗️ Architecture

```
directus-unified-platform/
├── src/
│   ├── frontend/          # Application React
│   │   ├── modules/       # Modules (OCR, etc.)
│   │   └── portals/       # 4 portails distincts
│   └── backend/           # Backend Directus
├── scripts/               # Scripts organisés
│   ├── testing/          # Tests
│   ├── migration/        # Migrations
│   ├── deployment/       # Déploiement
│   ├── utilities/        # Utilitaires
│   ├── maintenance/      # Maintenance
│   └── setup/            # Installation
├── packages/ui/          # Composants UI ⚠️ NE PAS TOUCHER
├── integrations/         # Services externes
├── docs/                 # Documentation
└── config/              # Configuration
```

## 🚦 Démarrage Rapide

### Prérequis
- Node.js 18+
- Docker & Docker Compose
- pnpm (gestionnaire de paquets)

### Installation

```bash
# 1. Cloner le repository
git clone https://github.com/dainabase/directus-unified-platform.git
cd directus-unified-platform

# 2. Installer les dépendances
pnpm install

# 3. Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos configurations

# 4. Démarrer les services Docker
docker-compose up -d

# 5. Lancer Directus
cd src/backend
pnpm dev

# 6. Lancer le frontend React
cd src/frontend
pnpm dev
```

## 📋 Configuration

### Directus
- **URL**: http://localhost:8055
- **Admin**: jmd@hypervisual.ch / Spiral74@#
- **Token**: À régénérer à chaque session

### Services Intégrés
1. **Invoice Ninja v5** - Facturation
2. **Revolut Business API** - Banking
3. **ERPNext v15** - ERP complet
4. **Mautic 5.x** - Marketing automation
5. **OpenAI Vision** - OCR documents

## 🔧 Scripts Utiles

```bash
# Tests
./scripts/testing/test-connection.js

# Migration de données
node scripts/migration/migrate-massive-data.js

# Démarrage de la plateforme
./scripts/deployment/start-platform.sh

# Nettoyage
./scripts/utilities/cleanup-temp-files.sh
```

## 📊 État du Projet

### ✅ Complété
- Structure React avec 4 portails
- 83 collections Directus créées
- 100/105 relations configurées
- Intégration OCR fonctionnelle
- 5 services externes intégrés

### 🔄 En Cours
- Migration des données de production
- Connexion React ↔ Directus
- Dashboard temps réel
- Synchronisation multi-services

### 📅 À Faire
- Tests E2E complets
- Documentation API
- Déploiement production
- Monitoring & Analytics

## 🔌 MCP (Model Context Protocol)

Le projet utilise plusieurs serveurs MCP :
- **Directus MCP** - Gestion des données
- **GitHub MCP** - Gestion du code
- **Desktop Commander** - Commandes système
- **Notion MCP** - Import données (lecture seule)

## 🛠️ Technologies

### Backend
- **Directus 10.x** - Headless CMS
- **PostgreSQL 15** - Base de données
- **Node.js 18+** - Runtime
- **Redis** - Cache
- **Docker** - Containerisation

### Frontend
- **React 18.2** - UI Framework
- **Vite 5.0** - Build tool
- **Recharts 2.10** - Graphiques
- **Tabler.io** - UI Components
- **React Router** - Navigation

## 📚 Documentation

- [Guide d'intégration](docs/integration-guide.md)
- [Architecture technique](docs/architecture.md)
- [API Documentation](docs/api.md)
- [Guide de déploiement](docs/deployment.md)

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## ⚠️ Points d'Attention

- **ENKI REALTY** - Orthographe exacte (pas ENKY)
- **Recharts** pour les graphiques (pas ApexCharts)
- **pnpm** comme gestionnaire de paquets (pas npm)
- **packages/ui/** - Ne jamais modifier (seul module propre)
- **Notion** - Lecture seule, jamais écrire

## 📝 License

Propriétaire - © 2024 DAINAMICS

## 📞 Contact

- **Email**: jmd@hypervisual.ch
- **GitHub**: [@dainabase](https://github.com/dainabase)
- **Website**: https://hypervisual.ch

---

**Dernière mise à jour**: 24 décembre 2024
