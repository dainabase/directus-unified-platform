# 🚀 Guide de Démarrage Rapide

Ce guide vous aidera à démarrer rapidement avec Directus Unified Platform.

## 📋 Prérequis

Assurez-vous d'avoir installé :
- Node.js 18+ ([Télécharger](https://nodejs.org/))
- Docker Desktop ([Télécharger](https://www.docker.com/products/docker-desktop))
- Git ([Télécharger](https://git-scm.com/))

## 🛠️ Installation en 5 minutes

### 1️⃣ Cloner le projet
```bash
git clone https://github.com/dainabase/directus-unified-platform.git
cd directus-unified-platform
```

### 2️⃣ Démarrer le backend (Directus)
```bash
# Créer le fichier .env
cp .env.example .env

# Démarrer les conteneurs Docker
docker-compose up -d

# Vérifier que Directus est accessible
open http://localhost:8055
```

### 3️⃣ Démarrer le frontend (React)
```bash
# Dans un nouveau terminal
cd src/frontend
npm install
npm run dev

# L'application sera disponible sur
open http://localhost:3000
```

## 🎯 Accès aux Portails

### SuperAdmin (CEO)
- URL: http://localhost:3000
- Login: admin@dainamics.ch
- Pass: admin123

### Client
- Changez de portail via le menu dropdown en haut à droite
- Login: client@example.com
- Pass: client123

### Prestataire
- Login: prestataire@example.com
- Pass: prestataire123

### Revendeur
- Login: revendeur@example.com
- Pass: revendeur123

## 📱 Captures d'écran

### Dashboard SuperAdmin
![Dashboard SuperAdmin](./docs/screenshots/superadmin-dashboard.png)
- Grille 5-3-3-3 avec métriques CEO
- Graphiques Recharts interactifs
- Vue consolidée multi-entreprises

### Dashboard Client
![Dashboard Client](./docs/screenshots/client-dashboard.png)
- Suivi de projets en temps réel
- Gestion documentaire
- Support intégré

## 🔥 Commandes Utiles

```bash
# Frontend
npm run dev          # Mode développement
npm run build        # Build production
npm run preview      # Preview du build

# Backend
docker-compose up    # Démarrer tous les services
docker-compose down  # Arrêter tous les services
docker-compose logs  # Voir les logs

# Base de données
npm run db:backup    # Backup de la BDD
npm run db:restore   # Restaurer la BDD
```

## 🐛 Résolution de Problèmes

### Port 3000 déjà utilisé
```bash
# Changer le port dans vite.config.js
server: {
  port: 3001  // Ou autre port libre
}
```

### Erreur de connexion à Directus
```bash
# Vérifier que Docker est lancé
docker ps

# Redémarrer les conteneurs
docker-compose restart
```

### Erreur npm install
```bash
# Nettoyer le cache npm
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## 📚 Documentation Complète

- [Architecture Technique](./docs/architecture/overview.md)
- [Guide du Développeur](./docs/development/setup.md)
- [API Reference](./docs/api/reference.md)
- [Déploiement Production](./docs/deployment/production.md)

## 💡 Tips pour Développeurs

1. **Hot Reload** : Les modifications React sont appliquées instantanément
2. **Proxy API** : Toutes les requêtes `/api` sont redirigées vers Directus
3. **DevTools** : React DevTools et Recharts DevTools recommandés
4. **VS Code** : Extensions recommandées dans `.vscode/extensions.json`

## 🤝 Besoin d'Aide ?

- 📧 Email: support@dainamics.ch
- 💬 Discord: [Rejoindre](https://discord.gg/dainamics)
- 📖 Wiki: [GitHub Wiki](https://github.com/dainabase/directus-unified-platform/wiki)

---

🎉 **Prêt à coder !** Bon développement avec Directus Unified Platform !