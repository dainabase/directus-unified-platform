# Serveur API Notion - Dashboard Multi-Rôles

## 🚀 Installation

### 1. Installer les dépendances
```bash
cd server
npm install
```

### 2. Configuration
Copier le fichier `.env.example` en `.env` et remplir les valeurs :

```bash
cp .env.example .env
```

Éditer `.env` avec vos vraies valeurs :
```env
# Notion API
NOTION_API_KEY=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_VERSION=2022-06-28

# JWT Secret (générer une chaîne aléatoire sécurisée)
JWT_SECRET=votre_secret_jwt_tres_securise_ici_minimum_32_caracteres

# Server Config
PORT=3001
NODE_ENV=development

# CORS Origins
ALLOWED_ORIGINS=http://localhost:8000,http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. Obtenir la clé API Notion

1. Aller sur https://www.notion.so/my-integrations
2. Créer une nouvelle intégration
3. Copier la clé secrète dans `NOTION_API_KEY`
4. Partager vos bases de données avec l'intégration

### 4. Créer les bases de données Notion

Créer les bases suivantes dans Notion avec les propriétés indiquées :

#### Base Users (Authentification)
- **Email** (Email) - Requis, unique
- **Password** (Text) - Hash SHA256
- **Name** (Title) - Nom complet
- **Roles** (Multi-select) - Options: client, prestataire, revendeur
- **Avatar** (URL) - Photo profil
- **Active** (Checkbox) - Compte actif
- **CreatedAt** (Created time)

#### Base Projects (Client)
- **Name** (Title) - Nom du projet
- **ClientId** (Relation → Users)
- **Status** (Select) - Options: En cours, Terminé, En pause
- **Progress** (Number) - 0-100
- **Budget** (Number) - Montant CHF
- **StartDate** (Date)
- **EndDate** (Date)
- **Description** (Text)
- **Team** (People)

[Continuer avec les autres bases selon vos besoins...]

## 🏃‍♂️ Démarrage

### Mode développement
```bash
npm run dev
```

### Mode production
```bash
npm start
```

## 🚀 Démarrage Rapide OCR

### Option 1 : Script automatique
```bash
# Linux/Mac
./start-ocr.sh

# Windows
start-ocr.bat
```

### Option 2 : Manuel
```bash
cd portal-project/server
npm run ocr
```

### ⚠️ IMPORTANT

- Le serveur DOIT tourner sur le port 3000
- N'utilisez PAS Python pour servir les fichiers
- Accès direct : http://localhost:3000/superadmin/finance/ocr-premium-dashboard-fixed.html

### 🚀 Démarrage rapide OCR

Le module OCR dispose d'un système de configuration automatique pour simplifier le démarrage :

#### Option 1 : Commande unifiée (Recommandé)
```bash
npm run ocr
```
Cette commande va automatiquement :
- ✅ Configurer l'environnement (.env)
- ✅ Vérifier les dépendances
- ✅ Trouver un port disponible (3000 par défaut)
- ✅ Démarrer le serveur
- ✅ Ouvrir l'interface OCR dans votre navigateur

#### Option 2 : Script de démarrage avancé
```bash
./scripts/start-ocr.sh
```
Ce script offre plus de contrôle avec :
- 🔍 Vérification complète des prérequis
- 🧹 Nettoyage des processus existants
- 📊 Affichage détaillé du statut
- 🌐 Ouverture automatique du navigateur

#### Option 3 : Configuration manuelle
```bash
# 1. Configurer l'environnement
node setup-ocr.js

# 2. Démarrer le serveur
npm start
```

#### 📍 URLs d'accès OCR
- Interface OCR : `http://localhost:3000/superadmin/finance/ocr-premium-dashboard-fixed.html`
- API Notion : `http://localhost:3000/api/notion`
- Statut config : `http://localhost:3000/api/config/status`

#### 🔧 Configuration OCR
Un fichier `.env.ocr` est fourni avec la configuration par défaut. Pour personnaliser :
1. Copiez `.env.ocr` vers `.env`
2. Modifiez `NOTION_API_KEY` avec votre clé
3. Ajustez `PORT` si nécessaire (détection automatique sinon)

#### ⚠️ Résolution des problèmes courants

**Port 3000 occupé ?**
Le serveur trouvera automatiquement un port libre (3001, 8001, etc.)

**Erreur de connexion Notion ?**
Vérifiez votre clé API dans `.env` ou utilisez la clé de test par défaut

**Le serveur Python est sur le port 8000 ?**
L'OCR détecte automatiquement et redirige vers le bon serveur Node.js

## 📡 Endpoints API

### Authentification
- `POST /api/auth/login` - Connexion
- `POST /api/auth/register` - Inscription
- `POST /api/auth/refresh` - Rafraîchir token
- `GET /api/auth/me` - Utilisateur actuel

### Notion API
- `POST /api/notion/query` - Query base de données
- `GET /api/notion/page/:id` - Récupérer une page
- `POST /api/notion/page` - Créer une page
- `PATCH /api/notion/page/:id` - Mettre à jour une page

### Routes spécifiques
- `GET /api/notion/client/projects` - Projets du client
- `GET /api/notion/prestataire/missions` - Missions du prestataire
- `GET /api/notion/revendeur/pipeline` - Pipeline du revendeur
- etc...

## 🔒 Sécurité

- Authentification JWT
- Rate limiting (100 req/min par défaut)
- CORS configuré
- Helmet.js pour les headers de sécurité
- Validation des entrées
- Permissions vérifiées côté serveur

## 🧪 Tests

Pour tester l'API :

```bash
# Test de santé
curl http://localhost:3001/health

# Test de connexion
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## 🚀 Déploiement

### Heroku
```bash
heroku create votre-app-name
heroku config:set NOTION_API_KEY=xxx JWT_SECRET=xxx
git push heroku main
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["node", "server.js"]
```

## 📝 Notes importantes

1. **Ne jamais commiter le fichier `.env`**
2. Toujours utiliser HTTPS en production
3. Configurer un reverse proxy (Nginx) en production
4. Mettre en place des logs (Winston/Morgan)
5. Monitorer les performances (New Relic/DataDog)

## 🐛 Debugging

Activer les logs détaillés :
```env
NODE_ENV=development
DEBUG=notion:*
```

Vérifier les permissions Notion :
- L'intégration doit avoir accès aux bases
- Les propriétés doivent correspondre exactement

## 📚 Documentation

- [Notion API](https://developers.notion.com/)
- [Express.js](https://expressjs.com/)
- [JWT](https://jwt.io/)
- [Helmet.js](https://helmetjs.github.io/)