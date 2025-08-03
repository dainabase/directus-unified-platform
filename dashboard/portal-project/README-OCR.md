# 🚀 Démarrage Rapide OCR

## Lancement en 1 commande
```bash
./ocr-quick-start.sh
```

## Lancement manuel

### Terminal 1:
```bash
cd superadmin/finance
python3 -m http.server 8000
```

### Terminal 2:
```bash
cd server
npm start
```

## URL OCR
http://localhost:8000/superadmin/finance/ocr-premium-dashboard-fixed.html

## Résolution de problèmes

- **Erreur 403** : Vérifiez la clé API dans server/.env
- **Connection refused** : Lancez le serveur Node.js sur port 3000
- **Base non trouvée** : Ajoutez l'intégration dans Notion

## ⚡ Démarrage rapide

### 🪟 Windows
```batch
# Double-cliquez simplement sur :
start-ocr.bat
```

### 🍎 Mac / 🐧 Linux
```bash
# Double-cliquez sur le fichier ou exécutez :
./start-ocr.sh
```

## 🔧 Démarrage manuel

Si les scripts automatiques ne fonctionnent pas :

```bash
# 1. Ouvrir un terminal dans le dossier du projet
cd "Dashboard Client: Presta/portal-project"

# 2. Installer les dépendances (première fois seulement)
npm install

# 3. Lancer le serveur
npm start

# 4. Ouvrir le navigateur à :
# http://localhost:3000/superadmin/finance/ocr-premium-dashboard-fixed.html
```

## 🎯 Fonctionnalités du module

### 📤 Upload intelligent
- **Drag & Drop** : Glissez votre PDF directement dans la zone
- **OCR automatique** : Extraction des données avec GPT-4 Vision
- **Smart resolver** : Résolution automatique des entités clients
- **Upload Notion** : Envoi direct vers la base de données avec nouvelle API 2024

### 🔄 Workflow complet
1. **📁 Sélection** : Glissez un PDF de facture
2. **🔍 Analyse** : OCR extraction automatique des données
3. **🤖 Résolution** : Matching intelligent des clients/projets
4. **✅ Validation** : Vérification des données extraites
5. **☁️ Upload** : Création dans DB-DOCUMENTS avec fichier attaché
6. **🔗 Liaison** : Relation bidirectionnelle avec DB-FACTURES-CLIENTS

## ❌ ERREURS COURANTES

### 🚨 "Upload impossible en mode fichier local"

**Cause :** Vous avez ouvert le fichier HTML directement (URL commence par `file:///`)

**Solutions :**
- ✅ **Rapide :** Utilisez `start-ocr.bat` (Windows) ou `start-ocr.sh` (Mac/Linux)
- ✅ **Manuel :** Lancez `npm start` puis ouvrez `http://localhost:3000`

### 🚨 "Failed to fetch" / "Network Error"

**Cause :** Le serveur n'est pas démarré

**Solution :** Lancez `npm start` avant d'ouvrir la page

### 🚨 "EADDRINUSE: address already in use"

**Cause :** Le port 3000 est déjà utilisé

**Solutions :**
- Fermez l'autre application utilisant le port 3000
- Ou modifiez le port dans `.env` : `PORT=3001`

### 🚨 "Module not found" / "Cannot find package"

**Cause :** Dépendances manquantes

**Solution :** Exécutez `npm install` dans le dossier du projet

## ✅ VÉRIFICATION

Votre barre d'adresse doit afficher :

- ✅ **Correct :** `http://localhost:3000/superadmin/finance/ocr-premium-dashboard-fixed.html`
- ❌ **Incorrect :** `file:///C:/Users/.../ocr-premium-dashboard-fixed.html`

## 🔧 Configuration avancée

### Variables d'environnement
Copiez `.env.example` vers `.env` et ajustez :

```bash
# Port du serveur
PORT=3000

# Clés API
NOTION_API_KEY=your_notion_integration_secret
OPENAI_API_KEY=your_openai_api_key

# Origines CORS autorisées
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### Limites d'upload
- **Taille max :** 20MB par fichier
- **Formats supportés :** PDF, JPG, PNG, WEBP
- **Types de documents :** Factures, devis, contrats

## 📊 Architecture technique

### Serveur Node.js
- **Framework :** Express.js avec sécurité (Helmet, CORS, Rate Limiting)
- **Authentification :** JWT tokens
- **Upload :** Multer avec stockage en mémoire
- **Proxy Notion :** API 2024 avec upload en 3 étapes

### Frontend
- **Framework UI :** Tabler.io v1.0.0-beta20
- **OCR :** OpenAI GPT-4 Vision API
- **Upload :** FormData avec nouvelle API Notion
- **Détection :** Protocole automatique (file:// vs http://)

### Base de données
- **Notion :** DB-DOCUMENTS et DB-FACTURES-CLIENTS
- **Relations :** Bidirectionnelles avec smart resolver
- **Fichiers :** Attachement direct via nouvelle API 2024

## 🔒 Sécurité

- **HTTPS :** Recommandé en production
- **CORS :** Limité aux origines autorisées
- **Rate Limiting :** Protection contre les abus
- **Validation :** Types et tailles de fichiers
- **JWT :** Authentification sécurisée

## 🚀 Déploiement production

```bash
# 1. Cloner le repository
git clone [repository-url]
cd portal-project

# 2. Installer les dépendances
npm install --production

# 3. Configurer l'environnement
cp .env.example .env
# Éditez .env avec vos vraies clés API

# 4. Lancer en production
NODE_ENV=production npm start

# 5. Servir avec un reverse proxy (nginx/apache)
# Configuration exemple dans config/nginx.conf
```

## 🆘 Support

### Logs détaillés
Consultez la console du navigateur (F12) pour les logs détaillés du processus OCR.

### Debug serveur
```bash
# Lancer avec logs verbeux
DEBUG=* npm start

# Tester les endpoints
curl http://localhost:3000/health
curl http://localhost:3000/api/notion/health
```

### Contact
- **Logs :** Toujours inclure les logs de la console
- **URL :** Préciser l'URL exacte utilisée
- **Navigateur :** Version et type de navigateur
- **Système :** Windows/Mac/Linux + version

---

## 🇨🇭 Qualité Suisse

Ce module a été conçu selon les standards de qualité suisse :
- **Fiabilité** : Détection automatique des erreurs avec solutions proposées
- **Simplicité** : Scripts de démarrage one-click
- **Robustesse** : Gestion d'erreurs complète et fallbacks
- **Documentation** : Guide complet avec exemples pratiques

**Version :** 2.0.0  
**Dernière mise à jour :** 27.07.2025  
**Compatibilité :** Node.js 16+, navigateurs modernes