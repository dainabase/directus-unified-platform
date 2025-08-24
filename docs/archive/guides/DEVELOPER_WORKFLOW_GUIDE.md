# 🔄 Guide du Workflow de Développement

## 📋 Vue d'Ensemble

Ce guide explique comment maintenir un environnement de développement stable et persistant pour le projet Directus Unified Platform.

## 🚀 Démarrage Rapide

### Option 1: Terminal Dédié (Recommandé)
```bash
# Terminal 1: Backend Directus
cd /Users/jean-mariedelaunay/directus-unified-platform
docker-compose up

# Terminal 2: Frontend React
cd /Users/jean-mariedelaunay/directus-unified-platform/src/frontend
npm run dev
```

### Option 2: Script Tout-en-Un
```bash
# Créer le script
cat > ~/start-directus-platform.sh << 'EOF'
#!/bin/bash
echo "🚀 Démarrage de Directus Unified Platform"

# Démarrer Docker en arrière-plan
cd /Users/jean-mariedelaunay/directus-unified-platform
docker-compose up -d

# Démarrer le frontend
cd src/frontend
npm run dev
EOF

# Rendre exécutable
chmod +x ~/start-directus-platform.sh

# Lancer
~/start-directus-platform.sh
```

## 🛠️ Workflow de Développement

### 1. Avant de Commencer
```bash
# Vérifier les services
docker ps                    # Backend Directus
lsof -i :5173               # Frontend Vite
lsof -i :8055               # API Directus

# Nettoyer si nécessaire
docker-compose down
pkill -f "vite"
```

### 2. Pendant le Développement

#### Avec Claude Code
Claude Code peut lancer le serveur temporairement :
```bash
cd src/frontend
npm run dev
```
⚠️ **Important**: Le serveur s'arrêtera quand Claude Code termine !

#### Pour un Serveur Persistant
Utilisez un terminal séparé ou PM2 :
```bash
# Terminal séparé
npm run dev

# Ou avec PM2
pm2 start npm --name "frontend" -- run dev
pm2 logs frontend
```

### 3. Structure des Terminaux

#### Configuration Idéale
```
Terminal 1: Backend Directus
├── docker-compose up
└── Logs PostgreSQL + Directus

Terminal 2: Frontend React
├── npm run dev
└── Logs Vite + Hot Reload

Terminal 3: Travail Claude Code
├── Commandes git
├── Tests
└── Autres opérations
```

## 📊 Monitoring et Debug

### Vérifier l'État des Services
```bash
# Script de santé
cat > ~/check-platform-health.sh << 'EOF'
#!/bin/bash
echo "🔍 Vérification de Directus Unified Platform"
echo "=========================================="

# Backend
echo -n "Backend Directus (8055): "
curl -s http://localhost:8055/server/health > /dev/null && echo "✅ OK" || echo "❌ DOWN"

# Frontend
echo -n "Frontend React (5173): "
curl -s http://localhost:5173 > /dev/null && echo "✅ OK" || echo "❌ DOWN"

# Database
echo -n "PostgreSQL (5432): "
pg_isready -h localhost -p 5432 > /dev/null 2>&1 && echo "✅ OK" || echo "❌ DOWN"

# Processes
echo ""
echo "📊 Processus actifs:"
ps aux | grep -E "(vite|directus|postgres)" | grep -v grep | wc -l | xargs echo "Total:"
EOF

chmod +x ~/check-platform-health.sh
```

### Logs en Temps Réel
```bash
# Frontend logs
tail -f ~/.pm2/logs/frontend-out.log

# Backend logs
docker-compose logs -f directus

# Tous les logs
docker-compose logs -f
```

## 🔧 Résolution de Problèmes

### 1. "Le serveur s'est arrêté"
**Cause**: Claude Code a terminé son exécution
**Solution**: 
```bash
# Relancer dans un terminal séparé
cd src/frontend
npm run dev
```

### 2. "Port déjà utilisé"
**Cause**: Ancien processus toujours actif
**Solution**:
```bash
# Trouver et tuer
lsof -i :5173
kill -9 [PID]

# Ou changer de port
npm run dev -- --port 3000
```

### 3. "Page blanche après refresh"
**Cause**: Serveur arrêté ou erreur JS
**Solution**:
```bash
# Vérifier le serveur
curl http://localhost:5173

# Vérifier la console du navigateur (F12)
# Relancer si nécessaire
```

## 🎯 Best Practices

### 1. Développement avec Claude Code
- **Toujours** avoir un terminal avec `npm run dev` actif
- **Ne pas** compter sur Claude Code pour maintenir les services
- **Utiliser** Claude Code pour les modifications de code uniquement

### 2. Gestion des Processus
```bash
# Démarrage du matin
~/start-directus-platform.sh

# Pause déjeuner
pm2 stop all

# Reprise
pm2 restart all

# Fin de journée
pm2 stop all
docker-compose down
```

### 3. Git Workflow
```bash
# Avant de committer
npm run lint
npm run test

# Commit avec message descriptif
git add .
git commit -m "feat: Description claire de la modification"

# Push uniquement si demandé
git push origin main
```

## 📚 Commandes Utiles

### Raccourcis Shell
```bash
# Ajouter à ~/.zshrc ou ~/.bashrc
alias dup-start="cd ~/directus-unified-platform && docker-compose up -d && cd src/frontend && npm run dev"
alias dup-stop="cd ~/directus-unified-platform && docker-compose down && pkill -f vite"
alias dup-logs="cd ~/directus-unified-platform && docker-compose logs -f"
alias dup-health="~/check-platform-health.sh"
```

### Package.json Scripts
```json
{
  "scripts": {
    "dev": "vite",
    "dev:persist": "pm2 start npm --name frontend -- run dev",
    "dev:stop": "pm2 stop frontend",
    "dev:logs": "pm2 logs frontend",
    "health": "curl -s http://localhost:5173 > /dev/null && echo '✅ Frontend OK' || echo '❌ Frontend DOWN'"
  }
}
```

## 🔄 Workflow Quotidien Type

### Matin
1. Ouvrir 3 terminaux
2. Terminal 1: `docker-compose up`
3. Terminal 2: `npm run dev`
4. Terminal 3: Pour Claude Code

### Développement
1. Modifications via Claude Code
2. Test dans le navigateur
3. Commit si satisfait

### Soir
1. `pm2 stop all` ou Ctrl+C
2. `docker-compose down`
3. Commit/push final si nécessaire

## 🎓 Tips Avancés

### Auto-restart avec Nodemon
```bash
# Installer nodemon
npm install -D nodemon

# Configuration
cat > nodemon.json << EOF
{
  "exec": "vite",
  "ext": "js,jsx,ts,tsx,css",
  "ignore": ["node_modules", "dist"]
}
EOF

# Utiliser
npx nodemon
```

### Docker Compose avec Frontend
```yaml
# docker-compose.yml addition
frontend:
  build: ./src/frontend
  ports:
    - "5173:5173"
  volumes:
    - ./src/frontend:/app
    - /app/node_modules
  command: npm run dev -- --host
```

---

**Guide créé le**: 2025-08-06  
**Objectif**: Workflow de développement stable et efficace  
**Statut**: ✅ COMPLET ET OPÉRATIONNEL