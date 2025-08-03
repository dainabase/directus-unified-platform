# 🔧 Configuration du Module OCR Premium

> **Guide complet pour configurer les clés API et résoudre les erreurs CSP**

## 📋 Prérequis

### 1. Clés API requises

#### 🤖 OpenAI (pour l'OCR automatique)
- **Obligatoire** pour l'extraction automatique des données
- **Obtenir une clé** : [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- **Format** : `sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- **Coût** : ~0.01$ par document traité

#### 🗃️ Notion (pour l'upload et stockage)
- **Obligatoire** pour sauvegarder les documents
- **Obtenir une clé** : [notion.so/my-integrations](https://www.notion.so/my-integrations)
- **Format** : `secret_xxxxxxxxxxxxxxxxxxxxxxxxx` ou `ntn_xxxxxxxxxxxxx`
- **Gratuit** avec limitations de taille

## ⚙️ Configuration étape par étape

### Étape 1 : Copier le fichier de configuration

```bash
# Dans le dossier du projet
cp .env.example .env
```

### Étape 2 : Éditer le fichier .env

Ouvrez le fichier `.env` et remplissez vos clés :

```bash
# Configuration du serveur
NODE_ENV=development
PORT=3000

# Sécurité
JWT_SECRET=your-super-secret-jwt-key-change-in-production
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# ✅ API Notion (obligatoire)
NOTION_API_KEY=secret_votre_vraie_cle_notion_ici
NOTION_VERSION=2022-06-28

# ✅ OpenAI (obligatoire)
OPENAI_API_KEY=sk-votre_vraie_cle_openai_ici
OPENAI_MODEL=gpt-4o-mini
OPENAI_MAX_TOKENS=1000
OPENAI_TEMPERATURE=0.1

# Upload Settings
MAX_FILE_SIZE=20971520
```

### Étape 3 : Redémarrer le serveur

```bash
# Arrêter le serveur actuel (Ctrl+C)
# Puis relancer
npm start
```

## 🛡️ Problèmes CSP corrigés

### Qu'est-ce que CSP ?
**Content Security Policy** = Politique de sécurité qui contrôle quelles ressources peuvent être chargées.

### Ressources autorisées après correction :

✅ **Scripts** :
- `https://cdn.jsdelivr.net` (Tabler.io)
- `https://cdnjs.cloudflare.com` (PDF.js)
- `https://unpkg.com` (Packages NPM)

✅ **Styles** :
- `https://rsms.me` (Police Inter)
- `https://fonts.googleapis.com` (Google Fonts)
- `https://cdn.jsdelivr.net` (Tabler CSS)

✅ **Polices** :
- `https://rsms.me/inter/inter.css`
- `https://fonts.gstatic.com`
- Polices base64 (`data:`)

✅ **APIs** :
- `https://api.openai.com` (OCR)
- `https://api.notion.com` (Upload)

## 🔍 Vérification de la configuration

### Test 1 : Vérifier les variables d'environnement

```bash
# Lancer le serveur et vérifier les logs
npm start

# Vous devriez voir :
# ✅ OpenAI configuré
# ✅ Notion configuré
# ⚠️ Ou des avertissements si manquant
```

### Test 2 : Tester l'interface

1. Ouvrir : `http://localhost:3000/superadmin/finance/ocr-premium-dashboard-fixed.html`
2. Vérifier la console (F12) :
   - ✅ Aucune erreur CSP
   - ✅ PDF.js chargé
   - ✅ Police Inter affichée

### Test 3 : Page de test automatique

```
http://localhost:3000/test-file-detection.html
```

Cette page vérifie automatiquement :
- Mode serveur HTTP (vs fichier local)
- Ressources chargées correctement
- Configuration générale

## ❌ Erreurs courantes et solutions

### 🚨 "CSP violation: script blocked"

**Cause** : Configuration CSP trop restrictive  
**Solution** : Les corrections sont déjà appliquées dans `server.js`

```javascript
// ✅ Configuration CSP corrigée
scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 
           "https://cdn.jsdelivr.net", 
           "https://cdnjs.cloudflare.com"]
```

### 🚨 "Font loading error from rsms.me"

**Cause** : Police Inter bloquée par CSP  
**Solution** : Ajout de `https://rsms.me` dans `fontSrc`

### 🚨 "OpenAI API key not found"

**Cause** : Variable OPENAI_API_KEY manquante  
**Solutions** :
1. Ajouter la clé dans `.env`
2. Ou désactiver l'OCR automatique (mode manuel)

### 🚨 "Notion upload failed"

**Causes possibles** :
1. Clé API Notion invalide
2. Base de données non partagée avec l'intégration
3. Permissions insuffisantes

**Solutions** :
1. Vérifier la clé dans `.env`
2. Partager DB-DOCUMENTS avec votre intégration Notion
3. Vérifier les permissions de l'intégration

## 🔧 Configuration avancée

### Mode développement avec clés optionnelles

Si vous n'avez pas encore de clés API :

```bash
# Dans .env - mode démonstration
OPENAI_API_KEY=
NOTION_API_KEY=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
```

Le système fonctionnera avec :
- ✅ Interface complète
- ✅ Upload vers Notion (clé démo)
- ❌ OCR automatique désactivé (extraction manuelle)

### Validation automatique des clés

Le serveur valide automatiquement vos clés au démarrage :

```bash
✅ Configuration valide
⚠️ Avertissements non bloquants
❌ Erreurs critiques
```

### Bases de données Notion

Les IDs des bases de données sont préconfigurés :

```bash
NOTION_DB_DOCUMENTS=230adb95-3c6f-80eb-9903-ff117c2a518f
NOTION_DB_FACTURES=231adb95-3c6f-80ac-a702-edc3398c37b0
NOTION_DB_CLIENTS=232adb95-3c6f-80ac-a702-edc3398c37b1
```

**Pour utiliser vos propres bases** :
1. Créer les bases dans votre espace Notion
2. Copier les IDs depuis les URLs
3. Mettre à jour les variables dans `.env`

## 📊 Monitoring et debugging

### Logs détaillés

Le serveur affiche des logs détaillés :

```bash
🚀 Serveur API sécurisé démarré
📍 Port: 3000
🔒 Environnement: development
🔐 Sécurité: Helmet + CORS + Rate Limiting + JWT
🌐 CORS Origins: http://localhost:3000
⏰ Démarré le: [timestamp]

✅ OpenAI: Configuré (gpt-4o-mini)
✅ Notion: Configuré (3 bases de données)
⚠️ Mode développement: Certaines validations allégées
```

### Console navigateur

Dans la console (F12), surveillez :

```bash
✅ Mode serveur HTTP détecté - Upload disponible
✅ PDF.js chargé
✅ OCR Smart Resolver initialisé
✅ Notion API disponible
```

### Endpoints de santé

```bash
# Santé générale
curl http://localhost:3000/health

# APIs Notion
curl http://localhost:3000/api/notion/health

# Proxy upload
curl http://localhost:3000/api/notion/upload-proxy/health
```

## 🎯 Checklist finale

Avant d'utiliser le module OCR :

- [ ] ✅ Serveur démarré sur `http://localhost:3000`
- [ ] ✅ Fichier `.env` configuré avec vraies clés
- [ ] ✅ Aucune erreur CSP dans la console
- [ ] ✅ PDF.js chargé correctement
- [ ] ✅ Police Inter affichée
- [ ] ✅ Page de test fonctionnelle
- [ ] ✅ Endpoints de santé répondent

**🎉 Votre module OCR Premium est prêt !**

---

## 🆘 Support

### En cas de problème :

1. **Vérifier les logs serveur** dans le terminal
2. **Consulter la console navigateur** (F12)
3. **Tester les endpoints** avec curl
4. **Utiliser la page de test** : `/test-file-detection.html`

### Informations à fournir :

- Logs du serveur (terminal)
- Erreurs de la console (F12)
- URL exacte utilisée
- Contenu du fichier `.env` (sans les clés)
- Version du navigateur et OS