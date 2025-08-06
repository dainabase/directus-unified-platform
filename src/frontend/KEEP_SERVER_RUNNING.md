# 🚀 Comment Garder le Serveur de Développement Actif

## Le Problème
Le serveur Vite s'arrête quand Claude Code termine son exécution. C'est normal car le processus est lié à la session Claude Code.

## Solutions

### 1. Terminal Séparé (Recommandé)
Ouvrez un nouveau terminal et exécutez :
```bash
cd /Users/jean-mariedelaunay/directus-unified-platform/src/frontend
npm run dev
```

### 2. Utiliser le Script Shell
```bash
cd /Users/jean-mariedelaunay/directus-unified-platform/src/frontend
./start-dev.sh
```

### 3. Avec Screen (Arrière-plan)
```bash
# Installer screen si nécessaire
brew install screen

# Démarrer une session screen
screen -S vite-server

# Dans la session screen
cd /Users/jean-mariedelaunay/directus-unified-platform/src/frontend
npm run dev

# Détacher avec Ctrl+A puis D
# Pour revenir : screen -r vite-server
```

### 4. Avec PM2 (Process Manager)
```bash
# Installer PM2
npm install -g pm2

# Démarrer avec PM2
cd /Users/jean-mariedelaunay/directus-unified-platform/src/frontend
pm2 start npm --name "frontend-dev" -- run dev

# Commandes PM2
pm2 list           # Voir les processus
pm2 logs frontend-dev  # Voir les logs
pm2 stop frontend-dev  # Arrêter
pm2 restart frontend-dev  # Redémarrer
```

## Accès à l'Application

Une fois le serveur lancé, accédez à :
- **http://localhost:5173** (port par défaut)
- **http://localhost:3000** (si spécifié avec --port 3000)

## Vérifier si le Serveur Fonctionne

```bash
# Vérifier le port
lsof -i :5173

# Tester la connexion
curl http://localhost:5173
```

## En Cas de Problème

1. **Port déjà utilisé** :
   ```bash
   # Trouver et tuer le processus
   lsof -i :5173
   kill -9 [PID]
   ```

2. **Cache corrompu** :
   ```bash
   rm -rf node_modules/.vite
   ```

3. **Réinstaller les dépendances** :
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```