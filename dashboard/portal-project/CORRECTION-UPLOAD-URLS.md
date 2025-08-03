# 🔧 Correction URLs Upload OCR

## 📋 Problème identifié
L'upload PDF utilisait le port 8000 au lieu de 3000 :
- ❌ **Avant** : `POST http://localhost:8000/api/notion/upload-proxy/create`
- ✅ **Après** : `POST http://localhost:3000/api/notion/upload-proxy/create`

## 🛠️ Corrections apportées

### Fichier modifié
`portal-project/assets/js/Superadmin/ocr-notion-smart-resolver.js`

### 1. Ajout propriété `uploadBaseUrl`
```javascript
// Python (8000) -> redirection vers Node.js (3000)
if (currentPort === '8000') {
    this.uploadBaseUrl = 'http://localhost:3000';
}

// Node.js (3000) -> utilisation locale
if (currentPort === '3000') {
    this.uploadBaseUrl = '';
}
```

### 2. Correction des URLs d'upload
Remplacé les chemins relatifs par des URLs absolues :

```javascript
// Étape 1: Création upload
- '/api/notion/upload-proxy/create'
+ '${this.uploadBaseUrl}/api/notion/upload-proxy/create'

// Étape 2: Envoi fichier  
- '/api/notion/upload-proxy/send/${id}'
+ '${this.uploadBaseUrl}/api/notion/upload-proxy/send/${id}'

// Étape 3: Récupération infos
- '/api/notion/upload-proxy/info/${id}'
+ '${this.uploadBaseUrl}/api/notion/upload-proxy/info/${id}'
```

## ✅ Tests de validation
- **Route accessible** : Status 401 (authentification demandée) ✅
- **Redirection Python→Node.js** : URLs pointent vers port 3000 ✅  
- **Configuration automatique** : Détection port correcte ✅

## 🚀 Résultat
L'upload PDF depuis Python (port 8000) utilise maintenant correctement le serveur Node.js (port 3000).

## 📁 Fichiers test créés
- `test-upload-urls.html` - Vérification configuration URLs
- `CORRECTION-UPLOAD-URLS.md` - Documentation correction

## 🇨🇭 Qualité Suisse
- Correction minimale et ciblée
- Tests immédiats
- Documentation complète