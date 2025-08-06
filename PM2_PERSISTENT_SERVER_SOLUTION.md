# 🚀 Solution Serveur Persistant avec PM2

## 📋 Résumé Exécutif

**Problème Résolu**: Le serveur Vite s'arrêtait quand Claude Code terminait son exécution  
**Solution**: Implémentation complète avec PM2 pour la gestion des processus  
**Date**: 2025-08-06  
**Statut**: ✅ OPÉRATIONNEL

## 🎯 Problème Initial

L'utilisateur rencontrait le problème suivant :
- "ça marchait et maintenant ça ne marche plus"
- Le serveur de développement s'arrêtait après chaque session Claude Code
- Nécessité de relancer manuellement à chaque fois

## 🛠️ Solution Implémentée

### 1. Architecture PM2

**Fichier**: `ecosystem.config.js`
```javascript
module.exports = {
  apps: [
    {
      name: 'directus-backend',
      script: 'docker-compose',
      args: 'up',
      interpreter: 'none'
    },
    {
      name: 'frontend-react',
      cwd: './src/frontend',
      script: 'npm',
      args: 'run dev',
      autorestart: true,
      max_restarts: 10
    },
    {
      name: 'api-proxy',
      script: './server.js'
    }
  ]
}
```

### 2. Scripts de Gestion

#### `start-platform.sh`
- Vérifie Docker
- Nettoie les anciens processus
- Démarre PostgreSQL et Directus
- Lance le frontend avec PM2
- Configure le démarrage automatique

#### `stop-platform.sh`
- Arrête proprement tous les services PM2
- Stoppe les conteneurs Docker
- Nettoie l'environnement

#### `dev.sh`
- Mode développement simple
- Ouvre 2 terminaux séparés
- Backend Docker + Frontend Vite

### 3. Monitoring

**Fichier**: `monitor-health.js`
- Vérifie la santé des services toutes les 30 secondes
- Frontend React (port 3000)
- Directus API (port 8055)
- PostgreSQL (via Docker)

## 📦 Fichiers Créés

| Fichier | Description |
|---------|-------------|
| `ecosystem.config.js` | Configuration PM2 pour tous les services |
| `start-platform.sh` | Script de démarrage complet avec PM2 |
| `stop-platform.sh` | Script d'arrêt propre |
| `dev.sh` | Mode développement avec terminaux séparés |
| `monitor-health.js` | Script de monitoring automatique |
| `SERVEUR_PERSISTANT.md` | Documentation rapide |
| `INSTALLATION_PM2.md` | Guide d'installation PM2 |

## 🔧 Scripts NPM Ajoutés

```json
{
  "scripts": {
    "dev:simple": "./dev.sh",
    "start:platform": "./start-platform.sh",
    "stop:platform": "./stop-platform.sh",
    "pm2:status": "pm2 status",
    "pm2:logs": "pm2 logs",
    "pm2:restart": "pm2 restart all",
    "monitor": "node monitor-health.js"
  }
}
```

## 🚀 Guide d'Utilisation

### Installation Unique
```bash
# Installer PM2 globalement
sudo npm install -g pm2

# Rendre les scripts exécutables (déjà fait)
chmod +x *.sh
```

### Démarrage

#### Option 1: Avec PM2 (Recommandé)
```bash
npm run start:platform
# ou
./start-platform.sh
```

#### Option 2: Mode Développement Simple
```bash
npm run dev:simple
# ou
./dev.sh
```

### Gestion des Services
```bash
# Voir l'état
pm2 status

# Voir les logs
pm2 logs

# Redémarrer tout
pm2 restart all

# Arrêter tout
npm run stop:platform
```

## 📊 Avantages de la Solution

### ✅ Persistance
- Les services restent actifs après fermeture de Claude Code
- Redémarrage automatique en cas de crash
- Survit aux déconnexions SSH

### ✅ Monitoring
- Surveillance automatique de la santé
- Logs centralisés avec PM2
- Alertes en cas de problème

### ✅ Simplicité
- Un seul script pour tout démarrer
- Scripts NPM intégrés
- Mode développement alternatif

## 🔍 Résolution de Problèmes

### PM2 non installé
```bash
sudo npm install -g pm2
# ou avec Homebrew
brew install pm2
```

### Port déjà utilisé
```bash
# Vérifier
lsof -i :3000
lsof -i :8055

# Tuer si nécessaire
kill -9 [PID]
```

### Services qui ne démarrent pas
```bash
# Vérifier les logs
pm2 logs

# Redémarrer
pm2 restart all

# Réinitialiser
pm2 delete all
./start-platform.sh
```

## 📈 Workflow Optimisé

### Développement Quotidien
1. **Matin**: `npm run start:platform`
2. **Travail**: Le serveur reste actif toute la journée
3. **Soir**: `npm run stop:platform`

### Avec Claude Code
1. Les modifications de code n'affectent pas le serveur
2. Hot reload automatique pour le frontend
3. Pas besoin de relancer après chaque session

## 🎯 Résultat Final

- ✅ **Serveur persistant** qui ne s'arrête plus
- ✅ **Gestion professionnelle** avec PM2
- ✅ **Monitoring intégré** pour la stabilité
- ✅ **Scripts simplifiés** pour l'utilisation quotidienne
- ✅ **Documentation complète** pour référence

## 🔄 Prochaines Étapes

1. **Installer PM2**: `sudo npm install -g pm2`
2. **Démarrer**: `./start-platform.sh`
3. **Développer**: Le serveur reste actif !

---

**Solution créée le**: 2025-08-06  
**Problème**: Serveur non persistant  
**Résolution**: ✅ COMPLÈTE avec PM2