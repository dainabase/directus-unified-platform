# Dashboard Client: Presta

[![Version](https://img.shields.io/badge/version-2.2.0-blue.svg)](https://github.com/yourusername/dashboard-client-presta)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D%2014.0.0-brightgreen.svg)](https://nodejs.org)

Portail multi-rôles avec gestion complète pour Clients, Prestataires, Revendeurs et Superadmin. Intégration Notion API, OCR intelligent, et optimisations avancées.

## 🚀 Fonctionnalités

### 👥 Portails par rôle
- **Client** : Projets, documents, finances, support
- **Prestataire** : Missions, calendrier, récompenses, timetracking
- **Revendeur** : CRM, pipeline, leads, commissions
- **Superadmin** : OCR, multi-entités, comptabilité, automation

### 🛠 Technologies
- Frontend : HTML5, JavaScript vanilla, Tabler.io v1.0.0-beta20
- Backend : Node.js, Express, Notion API
- Optimisations : Service Worker, lazy loading, virtual scroll
- OCR : OpenAI Vision API

## 📋 Prérequis

- Node.js >= 14.0.0
- npm ou yarn
- Compte Notion avec API key
- (Optionnel) Redis pour le cache
- (Optionnel) OpenAI API key pour l'OCR

## 🔧 Installation

1. **Cloner le repository**
```bash
git clone https://github.com/yourusername/dashboard-client-presta.git
cd dashboard-client-presta
```

2. **Installer les dépendances**
```bash
# Backend
cd portal-project/server
npm install

# Frontend (optionnel pour dev)
cd ../
npm install
```

3. **Configuration environnement**
```bash
# Copier le template
cp .env.example .env

# Éditer avec vos valeurs
nano .env
```

4. **Configuration Notion**
- Créer une intégration : https://www.notion.so/my-integrations
- Copier la clé dans `NOTION_API_KEY`
- Partager vos bases de données avec l'intégration

## 🚀 Démarrage

### Développement
```bash
# Terminal 1 : Backend
cd portal-project/server
npm start

# Terminal 2 : Frontend (optionnel)
cd portal-project
python3 -m http.server 8000
```

Accès : http://localhost:3000

### Production
```bash
cd portal-project/server
NODE_ENV=production npm start
```

## 📁 Structure du projet

```
dashboard-client-presta/
├── .env.example          # Template variables environnement
├── .gitignore           # Fichiers ignorés par Git
├── README.md            # Ce fichier
├── portal-project/      # Application principale
│   ├── Architecture/    # Documentation architecture
│   ├── client/         # Portail Client
│   ├── prestataire/    # Portail Prestataire
│   ├── revendeur/      # Portail Revendeur
│   ├── superadmin/     # Portail Superadmin
│   ├── assets/         # JS, CSS, images
│   ├── server/         # Backend Node.js
│   └── api/            # Proxy PHP Notion
└── tabler/             # Framework UI
```

## 📚 Documentation

- [Guide d'architecture](portal-project/Architecture/ONBOARDING-PROMPT-DASHBOARD.md)
- [Modules stables](portal-project/Architecture/STABLE_MODULES.md)
- [État des API](portal-project/Architecture/api_implementation_status.md)
- [TODO List](portal-project/Architecture/TODO-DEVELOPPEMENT.md)

## 🧪 Tests

```bash
# Tests unitaires
npm test

# Tests E2E (à venir)
npm run test:e2e

# Vérifications
npm run verify:all
```

## 🔒 Sécurité

- Authentification JWT avec refresh tokens
- Permissions RBAC granulaires
- Rate limiting (3 req/sec Notion API)
- CSP headers configurés
- Validation et sanitization des inputs

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

Voir [CONTRIBUTING.md](portal-project/CONTRIBUTING.md) pour plus de détails.

## 📊 État du projet

- **Version** : 2.2.0
- **Endpoints implémentés** : 156/180 (86.7%)
- **Couverture de tests** : 20% (en cours)
- **Status** : Beta - Prêt pour tests

## 🐛 Problèmes connus

- Migration des mots de passe en cours
- OCR Superadmin en finalisation (90%)
- Tests E2E à implémenter

## 📄 License

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 👥 Équipe

- **Lead Developer** : [Votre nom]
- **Contact** : contact@dashboard-presta.ch

## 🙏 Remerciements

- [Tabler.io](https://tabler.io) pour le framework UI
- [Notion API](https://developers.notion.com) pour l'intégration
- Tous les contributeurs

---

Made with ❤️ in Switzerland 🇨🇭