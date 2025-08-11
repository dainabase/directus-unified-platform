# 🔧 Solution Proxy OCR pour Serveur Python

## 📋 Problème résolu

Le serveur Python (port 8000) ne pouvait pas gérer les requêtes API Notion, causant des erreurs lors de l'envoi de documents OCR. Cette solution ajoute un proxy transparent qui redirige automatiquement les requêtes vers le serveur Node.js.

## ✅ Changements apportés

### 1. **Serveur Python amélioré** (`simple_http_server.py`)
- Ajout d'un handler de proxy intégré
- Redirection automatique des requêtes `/api/notion/*` vers le serveur Node.js
- Support CORS complet
- Messages d'erreur informatifs si Node.js n'est pas disponible

### 2. **Détection intelligente du serveur** (`ocr-notion-smart-resolver.js`)
- Détection automatique du serveur utilisé (Python ou Node.js)
- Configuration dynamique de l'URL de l'API
- Avertissement visuel si le serveur Node.js n'est pas disponible
- Test automatique de la disponibilité du proxy

### 3. **Scripts de démarrage unifiés**
- `start-ocr-with-proxy.sh` (Mac/Linux)
- `start-ocr-with-proxy.bat` (Windows)
- Lance automatiquement les deux serveurs
- Vérifie les dépendances
- Ouvre le navigateur

## 🚀 Utilisation

### Option 1 : Script unifié (RECOMMANDÉ)
```bash
# Mac/Linux
./start-ocr-with-proxy.sh

# Windows
start-ocr-with-proxy.bat
```

### Option 2 : Démarrage manuel
1. **Terminal 1** - Serveur Node.js :
   ```bash
   cd portal-project/server
   npm start
   ```

2. **Terminal 2** - Serveur Python avec proxy :
   ```bash
   python3 simple_http_server.py
   ```

3. Accéder à : http://localhost:8000/superadmin/finance/ocr-premium-dashboard-fixed.html

## 🎯 Résultat

- ✅ **Les deux serveurs fonctionnent** : Python (8000) et Node.js (3000)
- ✅ **OCR fonctionne depuis les deux** : Le proxy redirige automatiquement
- ✅ **Aucune modification de configuration** : Détection automatique
- ✅ **Messages d'erreur clairs** : Si Node.js n'est pas démarré

## 📊 Architecture

```
Navigateur → Python:8000 → Proxy intégré → Node.js:3000 → API Notion
     ↓                                            ↑
     └────────── Fichiers statiques ──────────────┘
```

## 🔍 Dépannage

### "Serveur Node.js non disponible"
- Assurez-vous que le serveur Node.js est démarré sur le port 3000
- Utilisez le script unifié pour démarrer les deux serveurs

### "Module 'requests' non installé"
```bash
pip3 install requests
```

### Ports déjà utilisés
Le script nettoie automatiquement les ports, mais si nécessaire :
```bash
# Mac/Linux
lsof -ti:3000 | xargs kill -9
lsof -ti:8000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

## 💡 Avantages de cette solution

1. **Transparent** : Aucune modification du code client nécessaire
2. **Flexible** : Fonctionne avec les deux serveurs
3. **Robuste** : Gestion d'erreurs et fallbacks
4. **Simple** : Un seul script pour tout démarrer
5. **Informatif** : Messages clairs en cas de problème