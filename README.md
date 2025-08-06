# 🚀 Directus Unified Platform

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/React-18.2.0-61dafb.svg)
![Directus](https://img.shields.io/badge/Directus-10.x-6644ff.svg)
[![Status](https://img.shields.io/badge/status-active-success.svg)]()

## 📋 Vue d'ensemble

Directus Unified Platform est une solution complète de gestion d'entreprise multi-portails construite sur Directus CMS avec un frontend React moderne. La plateforme offre 4 portails distincts pour différents types d'utilisateurs.

### 🎯 Portails disponibles

- **🚀 SuperAdmin** - Dashboard CEO avec vue consolidée et gestion multi-entreprises
- **👤 Client** - Espace client pour le suivi de projets
- **🛠️ Prestataire** - Gestion des missions et timesheet
- **🏪 Revendeur** - Gestion des ventes et commissions

### 🏢 Entreprises gérées
- HYPERVISUAL - Studio créatif
- DAINAMICS - Solutions tech
- LEXAIA - Services juridiques
- ENKI REALTY - Immobilier
- TAKEOUT - Restauration

## 🛠️ Stack Technique

### Backend
- **Directus 10.x** - Headless CMS
- **PostgreSQL** - Base de données via Docker
- **Node.js + Express** - API backend
- **Redis** - Cache
- **OpenAI Vision API** - OCR

### Frontend
- **React 18.2** - Framework UI
- **Vite 5.4.19** - Build tool
- **Recharts 2.10.0** - Visualisations de données
- **Tabler.io** - Framework CSS
- **@tabler/icons-react** - Icônes

## 📦 Installation

### Prérequis
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 15+

### 1. Cloner le repository
```bash
git clone https://github.com/dainabase/directus-unified-platform.git
cd directus-unified-platform
```

### 2. Configuration Backend (Directus)
```bash
# Copier le fichier d'environnement
cp .env.example .env

# Démarrer Directus avec Docker
docker-compose up -d

# L'API Directus sera accessible sur http://localhost:8055
```

### 3. Configuration Frontend (React)
```bash
# Naviguer vers le dossier frontend
cd src/frontend

# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev

# L'application sera accessible sur http://localhost:5173
```

## 🏗️ Architecture du Projet

```
directus-unified-platform/
├── src/
│   ├── frontend/                # Application React
│   │   ├── src/
│   │   │   ├── components/      # Composants réutilisables
│   │   │   │   └── layout/      # Sidebar, Navigation
│   │   │   ├── portals/         # Dashboards par portail
│   │   │   │   ├── superadmin/  # Dashboard CEO
│   │   │   │   ├── client/      # Dashboard Client
│   │   │   │   ├── prestataire/ # Dashboard Prestataire
│   │   │   │   └── revendeur/   # Dashboard Revendeur
│   │   │   ├── App.jsx          # Composant principal
│   │   │   ├── main.jsx         # Point d'entrée
│   │   │   └── index.css        # Styles globaux
│   │   ├── index.html           # Template HTML
│   │   ├── package.json         # Dépendances npm
│   │   └── vite.config.js       # Configuration Vite
│   ├── backend/                 # Backend Node.js
│   ├── extensions/              # Extensions Directus
│   └── directus/                # Configuration Directus
├── docker-compose.yml           # Configuration Docker
├── .env.example                 # Variables d'environnement
└── README.md                    # Ce fichier
```

## 🎨 Fonctionnalités

### Dashboard SuperAdmin (CEO) - Architecture Validée ✅
- **Bloc Tâches Importantes** : En haut avec barre rouge d'alerte
- **3 Colonnes Thématiques** :
  - 🔧 **Opérationnel** (cyan) - Tâches, projets, tickets, bugs
  - 📈 **Commercial** (vert) - Pipeline, devis, leads, contrats
  - 💰 **Finance** (bleu) - Cash, factures, CA, marges
- **5 KPIs CEO Stratégiques** (colonne droite) :
  - Cash Runway avec alerte
  - ARR/MRR avec évolution
  - EBITDA Margin
  - LTV:CAC Ratio
  - NPS Global
- **4 Sections Détaillées** (bas) :
  - Revenus Mensuels (graphique)
  - Top Clients (tableau)
  - Activité Récente (timeline)
  - Tâches Récentes (liste)

### Dashboard Client
- **Suivi de projets** : Progression en temps réel
- **Gestion documentaire** : Accès aux documents
- **Historique factures** : Visualisation des paiements
- **Support intégré** : Messages et tickets

### Dashboard Prestataire
- **Gestion missions** : Suivi des projets actifs
- **Timesheet** : Enregistrement des heures
- **Planning** : Vue hebdomadaire
- **Revenus** : Calcul automatique

### Dashboard Revendeur
- **Gestion ventes** : Suivi des commandes
- **Calcul commissions** : Automatique
- **Stock** : Alertes rupture
- **Analytics** : Performance commerciale

## 🔧 Configuration

### Variables d'environnement
```env
# Backend Directus
KEY=your-random-key
SECRET=your-random-secret
DATABASE_CLIENT=pg
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=directus
DATABASE_USER=directus
DATABASE_PASSWORD=directus

# Frontend React
VITE_API_URL=http://localhost:8055
VITE_API_TOKEN=your-directus-token
```

### Proxy API
Le frontend utilise un proxy Vite pour communiquer avec Directus :
```javascript
// vite.config.js
proxy: {
  '/api': {
    target: 'http://localhost:8055',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, '')
  }
}
```

## 🚀 Déploiement

### Production Build
```bash
# Frontend
cd src/frontend
npm run build

# Les fichiers de production seront dans dist/
```

### Docker Production
```bash
# Build et démarrer tous les services
docker-compose -f docker-compose.prod.yml up -d
```

## 🐛 Dépannage

### Problèmes Résolus

#### 1. Erreur "react-hot-toast"
**Problème**: Module "react-hot-toast" externalized for browser compatibility
**Solution**: Import retiré de App.jsx car non utilisé

#### 2. Port 5173 déjà utilisé
**Solution**:
```bash
pkill -f "node.*vite"
npm run dev -- --port 3000
```

#### 3. Application React ne s'affiche pas
**Vérifications effectuées**:
- ✅ Import CSS dans main.jsx
- ✅ Simplification de App.jsx
- ✅ Vérification du serveur Vite
- ✅ Test avec composant basique

**Solution finale**: Refonte complète de App.jsx avec structure layout correcte

#### 4. Layout Header/Sidebar Cassé
**Problème**: Chevauchement des éléments
**Solution**: Positions CSS fixes avec z-index appropriés

#### 5. Serveur s'arrête après que Claude Code termine
**Problème**: Le serveur de développement s'arrête quand Claude Code finit son exécution
**Solution**: Utiliser un terminal séparé pour maintenir le serveur actif
```bash
# Terminal dédié
cd src/frontend
npm run dev

# Ou avec PM2 pour gestion avancée
pm2 start npm --name "frontend-dev" -- run dev
```
**Documentation**: Voir [DEVELOPER_WORKFLOW_GUIDE.md](./DEVELOPER_WORKFLOW_GUIDE.md)

### 📚 Documentation Complète
- **[CLAUDE_CODE_ANALYSIS.md](./CLAUDE_CODE_ANALYSIS.md)** - Analyse complète pour Claude Code
- **[TROUBLESHOOTING_GUIDE.md](./TROUBLESHOOTING_GUIDE.md)** - Guide de dépannage détaillé
- **[DASHBOARD_CEO_IMPLEMENTATION.md](./DASHBOARD_CEO_IMPLEMENTATION.md)** - Implémentation Dashboard CEO
- **[DASHBOARD_TECHNICAL_GUIDE.md](./src/frontend/DASHBOARD_TECHNICAL_GUIDE.md)** - Guide technique développeurs
- **[DASHBOARD_USER_GUIDE.md](./DASHBOARD_USER_GUIDE.md)** - Guide d'utilisation pour dirigeants
- **[DASHBOARD_CEO_HOTFIX.md](./DASHBOARD_CEO_HOTFIX.md)** - 🚨 Correction urgente conflits CSS
- **[CSS_CONFLICTS_TROUBLESHOOTING.md](./CSS_CONFLICTS_TROUBLESHOOTING.md)** - Guide conflits CSS
- **[DEBUG_HISTORY.md](./src/frontend/DEBUG_HISTORY.md)** - Historique des problèmes
- **[SERVER_PERSISTENCE_ISSUE.md](./SERVER_PERSISTENCE_ISSUE.md)** - 🔴 Problème serveur qui s'arrête
- **[DEVELOPER_WORKFLOW_GUIDE.md](./DEVELOPER_WORKFLOW_GUIDE.md)** - 🔄 Guide workflow développement
- **[KEEP_SERVER_RUNNING.md](./src/frontend/KEEP_SERVER_RUNNING.md)** - 🚀 Maintenir serveur actif

## 📊 État du Projet

### Frontend React ✅
- **Portails créés**: 4/4 (100%)
- **Dashboard SuperAdmin validé**: 100%
- **Graphiques Recharts**: 100%
- **Responsive design**: 100%
- **Architecture 3 colonnes + KPIs**: ✅
- **Application fonctionnelle**: ✅ (Port 3000)
- **Tous les bugs résolus**: ✅

### Backend Directus 🔄
- **Collections migrées**: 7/62 (11.3%)
- **Relations créées**: 10/105 (9.5%)
- **Dashboard importé**: 100%
- **OCR fonctionnel**: 100%
- **Endpoints adaptés**: 38/156 (24%)

### 🚀 Dernière Session de Travail (2025-08-06)
- ✅ Résolution définitive du problème react-hot-toast
- ✅ Correction complète du layout (header/sidebar/content)
- ✅ **Dashboard CEO Validé** avec structure 3 colonnes + KPI sidebar
- ✅ **5 KPIs CEO** avec sparklines Recharts interactives
- ✅ **Graphique Cash Flow** 7 jours avec AreaChart
- ✅ **3 Alertes prioritaires** avec système de couleurs
- ✅ **🚨 HOTFIX Dashboard CEO** - Résolution conflits CSS et affichage
- ✅ **Structure HTML optimisée** - Double wrapping résolu
- ✅ **CSS Tabler natif** - Conflits custom résolus
- ✅ Sélecteurs d'entreprise et portail opérationnels
- ✅ Application stable sur http://localhost:3000

## 🧪 Tests

```bash
# Tests unitaires
npm run test

# Tests E2E
npm run test:e2e

# Coverage
npm run test:coverage
```

## 📈 Performance

- Code splitting par portail
- Lazy loading des composants
- Cache API avec React Query
- Optimisation des bundles Vite
- CDN pour les assets statiques

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'feat: Add AmazingFeature'`)
4. Push sur la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

### Conventions de Commit
- `feat:` Nouvelle fonctionnalité
- `fix:` Correction de bug
- `docs:` Documentation
- `style:` Formatage, style
- `refactor:` Refactoring code
- `test:` Ajout de tests
- `chore:` Maintenance

## 📝 Changelog

### v2.0.0 (2025-08-06)
- 🎉 Migration complète vers React 18
- 📊 Intégration Recharts pour les visualisations
- 🎨 Nouveau design avec Tabler.io
- 🚀 4 portails distincts fonctionnels
- ⚡ Performance optimisée avec Vite
- ✅ Dashboard SuperAdmin avec architecture validée

### v1.0.0 (2024-11-01)
- Version initiale avec Directus
- Dashboard HTML basique
- Structure multi-entreprises

## 📄 License

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 👥 Équipe

- **CEO Operations** - Architecture & Vision
- **Développement** - DAINAMICS Team
- **Design** - HYPERVISUAL Studio

## 📞 Support

- 📧 Email: support@dainamics.ch
- 💬 Discord: [Rejoindre le serveur](https://discord.gg/dainamics)
- 📚 Documentation: [Wiki](https://github.com/dainabase/directus-unified-platform/wiki)
- 🐛 Issues: [GitHub Issues](https://github.com/dainabase/directus-unified-platform/issues)

---

<p align="center">
  Fait avec ❤️ par <a href="https://dainamics.ch">DAINAMICS</a>
</p>