# 🚀 Dashboard Client: Presta - Multi-Rôles

**Version**: 2.2.0  
**Tech Stack**: Node.js + Notion API + Vanilla JS + Tabler.io  
**Repository**: [dainabase/dashboard](https://github.com/dainabase/dashboard)

## 📋 Vue d'ensemble

Dashboard complet multi-rôles pour la gestion d'entreprise avec 4 espaces spécialisés :
- **👤 Client** : Gestion de projets et documents
- **🔧 Prestataire** : Missions, calendrier et récompenses  
- **🏪 Revendeur** : CRM, pipeline de ventes et commissions
- **⚙️ Superadmin** : Administration, finance et OCR premium

## 🚀 Démarrage Rapide

### Option 1 : Script automatique (Recommandé)

#### Linux/Mac
```bash
./start-dashboard.sh
```

#### Windows
```cmd
start-dashboard.bat
```

### Option 2 : Démarrage manuel

#### 1. Configuration
```bash
cd server
cp .env.example .env
# Éditer .env avec votre NOTION_API_KEY
```

#### 2. Installation des dépendances
```bash
npm install
```

#### 3. Démarrage des serveurs
```bash
# Terminal 1 - API Node.js (port 3000)
cd server
npm start

# Terminal 2 - Serveur statique Python (port 8000)
python3 -m http.server 8000
```

## 🌐 URLs d'accès

### Interfaces principales
- **Dashboard principal** : http://localhost:8000
- **API Node.js** : http://localhost:3000

### Espaces par rôle
- **Client** : http://localhost:8000/client/dashboard.html
- **Prestataire** : http://localhost:8000/prestataire/dashboard.html
- **Revendeur** : http://localhost:8000/revendeur/dashboard.html
- **Superadmin** : http://localhost:8000/superadmin/dashboard.html

### Modules spécialisés
- **OCR Premium** : http://localhost:3000/superadmin/finance/ocr-premium-dashboard-fixed.html
- **Finance** : http://localhost:8000/superadmin/finance/dashboard.html
- **Analytics** : http://localhost:8000/superadmin/analytics/dashboard.html

### Outils développement
- **Health check** : http://localhost:3000/health
- **Config status** : http://localhost:3000/api/config/status
- **Auth test** : http://localhost:3000/api/auth/me

## ⚙️ Configuration

### Variables d'environnement (.env)
```env
# Notion API
NOTION_API_KEY=ntn_votre_clé_ici
NOTION_VERSION=2022-06-28

# Serveur
PORT=3000
NODE_ENV=development

# Sécurité
JWT_SECRET=votre_secret_jwt_securise
JWT_REFRESH_SECRET=votre_refresh_secret

# CORS
ALLOWED_ORIGINS=http://localhost:8000,http://localhost:3000

# OCR (optionnel)
OCR_API_KEY=ocr_secret_unique

# Cloudinary (optionnel)
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret
```

### Obtenir une clé Notion API
1. Aller sur https://www.notion.so/my-integrations
2. Créer une nouvelle intégration
3. Copier la clé secrète dans `NOTION_API_KEY`
4. Partager vos bases de données avec l'intégration

## 🏗️ Architecture

### Structure des fichiers
```
portal-project/
├── server/                     # API Node.js
│   ├── routes/                 # Routes API
│   │   ├── auth.js            # Authentification JWT
│   │   ├── notion.js          # API Notion générale
│   │   ├── ocr-notion.js      # Routes OCR sécurisées
│   │   └── upload-proxy.js    # Proxy upload Cloudinary
│   ├── middleware/            # Middlewares
│   ├── .env                   # Configuration
│   └── server.js              # Serveur principal
├── assets/js/                 # Frontend JavaScript
│   ├── Core/                  # Modules stables (NE PAS MODIFIER)
│   │   ├── auth-notion-v2.js  # Auth v2.0 🔒 STABLE
│   │   ├── notion-api-client.js # Client API 🔒 STABLE
│   │   └── permissions-notion.js # RBAC 🔒 STABLE
│   ├── Client/                # Interface client
│   ├── Prestataire/           # Interface prestataire
│   ├── Revendeur/             # Interface revendeur
│   └── Superadmin/            # Interface superadmin
├── client/                    # Pages client
├── prestataire/               # Pages prestataire
├── revendeur/                 # Pages revendeur
├── superadmin/                # Pages superadmin
├── start-dashboard.sh         # Script démarrage Linux/Mac
├── start-dashboard.bat        # Script démarrage Windows
└── README.md                  # Ce fichier
```

### Modules stables 🔒

**⚠️ ATTENTION** : Les modules suivants sont verrouillés et NE DOIVENT PAS être modifiés :
- `/assets/js/Core/auth-notion-v2.js` - Authentification v2.0
- `/assets/js/Core/notion-api-client.js` - Client API Notion
- `/assets/js/Core/permissions-notion.js` - Système de permissions RBAC
- `/assets/js/Optimizations/*` - Modules d'optimisation

Voir `Architecture/STABLE_MODULES.md` pour plus de détails.

## 🔧 API Endpoints

### Authentification
```
POST   /api/auth/login           # Connexion
POST   /api/auth/logout          # Déconnexion  
POST   /api/auth/register        # Inscription
GET    /api/auth/me              # Profil utilisateur
POST   /api/auth/refresh-token   # Rafraîchir token
```

### OCR (Superadmin)
```
POST   /api/ocr/notion/pages     # Créer page depuis OCR
PATCH  /api/ocr/notion/pages/:id # Mettre à jour page
GET    /api/ocr/health           # Santé du service OCR
```

### Upload Cloudinary
```
POST   /api/notion/upload-proxy/create    # Créer session upload
POST   /api/notion/upload-proxy/send/:id  # Uploader fichier
GET    /api/notion/upload-proxy/info/:id  # Info fichier
```

### Notion API (avec auth JWT)
```
GET    /api/notion/databases     # Lister bases
POST   /api/notion/query         # Query base de données
GET    /api/notion/page/:id      # Récupérer page
POST   /api/notion/page          # Créer page
PATCH  /api/notion/page/:id      # Mettre à jour page
```

**Status API** : 156/180 endpoints (86.7%) - Voir `Architecture/api_implementation_status.md`

## 🔒 Sécurité

- **Authentification** : JWT avec refresh tokens
- **RBAC** : Système de permissions basé sur les rôles
- **Rate Limiting** : 100 req/min global, 5 req/15min pour auth
- **CORS** : Configuration restrictive
- **Helmet.js** : Headers de sécurité
- **CSP** : Content Security Policy
- **OCR Auth** : Clé API dédiée pour les routes OCR

## 📊 Fonctionnalités par rôle

### 👤 Client
- Dashboard projets et statistiques
- Gestion documents et fichiers
- Suivi factures et paiements
- Système de tickets support

### 🔧 Prestataire  
- Missions disponibles et assignées
- Calendrier et gestion du temps
- Système de récompenses et points
- Base de connaissances
- Suivi performance

### 🏪 Revendeur
- CRM complet avec pipeline
- Gestion leads et opportunités
- Calcul commissions automatique
- Matériel marketing
- Rapports de ventes

### ⚙️ Superadmin
- Gestion utilisateurs et rôles
- Module OCR premium avec IA
- Comptabilité et rapports TVA
- Monitoring système
- Intégrations tierces

## 🧪 Tests et développement

### Commandes utiles
```bash
# Vérifier modules stables
npm run verify:stable

# Tests authentification
node server/test-auth.js

# Tests Notion API
npm run test:notion

# Logs serveurs
tail -f /tmp/nodejs-dashboard.log
tail -f /tmp/python-static.log
```

### Scripts de gestion
```bash
# Démarrer dashboard
./start-dashboard.sh

# Arrêter serveurs (Linux/Mac)
/tmp/stop-dashboard.sh

# Arrêter serveurs (Windows)
%TEMP%\stop-dashboard.bat
```

## 🚧 Troubleshooting

### Problèmes courants

#### Port 3000 occupé
```bash
# Identifier le processus
lsof -ti:3000

# Arrêter le processus
kill -9 $(lsof -ti:3000)
```

#### Erreur Notion API
1. Vérifier `NOTION_API_KEY` dans `.env`
2. Contrôler les permissions d'intégration Notion
3. Tester avec : `curl http://localhost:3000/api/config/status`

#### OCR ne fonctionne pas
1. Vérifier que Node.js est sur port 3000 : `curl http://localhost:3000/health`
2. Contrôler l'URL : http://localhost:3000/superadmin/finance/ocr-premium-dashboard-fixed.html
3. Vérifier la console navigateur pour les erreurs CORS

#### Erreur 404 sur les assets
1. Vérifier que Python sert sur port 8000 : `curl http://localhost:8000`
2. Accéder via l'URL correcte : http://localhost:8000
3. Contrôler la structure des fichiers

### Logs et debugging
```bash
# Activer debug détaillé
export NODE_ENV=development
export DEBUG=notion:*

# Vérifier santé serveurs
curl http://localhost:3000/health
curl http://localhost:8000

# Status configuration
curl http://localhost:3000/api/config/status
```

## 📅 Roadmap

### Q1 2025 (En cours)
- ✅ Module OCR finalisé avec Cloudinary
- ✅ Authentification v2.0 sécurisée
- 🚧 Tests E2E avec Cypress
- 📅 Migration TypeScript progressive

### Q2 2025
- Monitoring production (Sentry)
- CI/CD Pipeline GitHub Actions
- PWA complète avec offline
- Bundle optimization Webpack

### Q3 2025
- Internationalisation (FR/EN/DE/IT)
- GraphQL API layer
- Machine Learning features
- Mobile apps React Native

## 🤝 Contribution

### Workflow développement
1. **Forker** le repository dainabase/dashboard
2. **Créer branche** : `git checkout -b feature/ma-feature`
3. **Respecter** les modules stables (voir `Architecture/STABLE_MODULES.md`)
4. **Tester** : `npm test && npm run verify:stable`
5. **Commit** : `git commit -m "feat: description"`
6. **Push** : `git push origin feature/ma-feature`
7. **Pull Request** vers `main`

### Standards de code
- **JavaScript** : ES6+ moderne
- **CSS** : Tabler.io framework
- **API** : REST JSON + JWT auth  
- **Rate limits** : Respect 3 req/sec Notion
- **Logs** : Console structurés + timestamps

## 📞 Support

### Resources
- **Documentation** : `Architecture/` directory
- **Issues** : https://github.com/dainabase/dashboard/issues
- **API Status** : `Architecture/api_implementation_status.md`
- **TODOs** : `Architecture/TODO-DEVELOPPEMENT.md`

### Contacts
- **Architecture** : Équipe technique senior
- **Bugs critiques** : GitHub Issues avec label `critical`
- **Features** : GitHub Issues avec label `enhancement`

---

**🇨🇭 Made with Swiss Quality** | **Version 2.2.0** | **Dashboard Client: Presta** | **2025**