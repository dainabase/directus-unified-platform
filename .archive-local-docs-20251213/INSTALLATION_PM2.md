# 🚀 Installation PM2 - Guide Complet

## ⚠️ Installation Requise

PM2 doit être installé globalement pour gérer les processus. Exécutez cette commande dans votre terminal :

```bash
sudo npm install -g pm2
```

Ou si vous utilisez Homebrew sur macOS :
```bash
brew install pm2
```

## 🛠️ Vérification de l'Installation

```bash
pm2 --version
```

## 🚀 Utilisation Immédiate

### 1. Démarrage Simple (Sans PM2)
En attendant l'installation de PM2, utilisez :
```bash
# Terminal 1
cd /Users/jean-mariedelaunay/directus-unified-platform
docker-compose up

# Terminal 2  
cd /Users/jean-mariedelaunay/directus-unified-platform/src/frontend
npm run dev
```

### 2. Avec le Script de Développement
```bash
cd /Users/jean-mariedelaunay/directus-unified-platform
./dev.sh
```

### 3. Après Installation PM2
```bash
# Démarrer la plateforme complète
npm run start:platform

# Ou directement
./start-platform.sh
```

## 📋 Scripts Disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev:simple` | Lance les serveurs dans des terminaux séparés |
| `npm run start:platform` | Démarre tout avec PM2 (après installation) |
| `npm run stop:platform` | Arrête tous les services |
| `npm run pm2:status` | Vérifie l'état des services |
| `npm run pm2:logs` | Affiche les logs en temps réel |
| `npm run monitor` | Monitoring de santé des services |

## 🔧 Alternative sans PM2

Si vous ne souhaitez pas installer PM2, utilisez `screen` :

```bash
# Installer screen
brew install screen  # macOS
sudo apt-get install screen  # Ubuntu/Debian

# Créer une session pour le frontend
screen -S frontend
cd src/frontend
npm run dev
# Détacher avec Ctrl+A puis D

# Créer une session pour le backend
screen -S backend
docker-compose up
# Détacher avec Ctrl+A puis D

# Lister les sessions
screen -ls

# Réattacher une session
screen -r frontend
```

## ✅ Prochaines Étapes

1. Installer PM2 : `sudo npm install -g pm2`
2. Lancer la plateforme : `./start-platform.sh`
3. Vérifier le statut : `pm2 status`
4. Accéder au dashboard : http://localhost:3000

---

**Note**: Les scripts ont été créés et sont prêts à l'emploi dès que PM2 sera installé.