#!/bin/bash

echo "🚀 Démarrage de Directus Unified Platform"
echo "========================================="

# Vérifier Docker
if ! docker info > /dev/null 2>&1; then
  echo "❌ Docker n'est pas démarré. Lancement..."
  open -a Docker || sudo systemctl start docker
  sleep 10
fi

# Nettoyer les anciens processus
echo "🧹 Nettoyage des anciens processus..."
pm2 delete all 2>/dev/null || true

# Démarrer PostgreSQL via Docker
echo "📦 Démarrage de PostgreSQL..."
docker-compose up -d postgres
sleep 5

# Démarrer Directus
echo "📦 Démarrage de Directus..."
docker-compose up -d directus
sleep 10

# Installer les dépendances frontend si nécessaire
echo "📦 Vérification des dépendances frontend..."
cd src/frontend
if [ ! -d "node_modules" ]; then
  echo "Installation des dépendances..."
  npm install
fi
cd ../..

# Démarrer avec PM2
echo "🚀 Démarrage des services avec PM2..."
pm2 start ecosystem.config.js

# Sauvegarder la configuration PM2
pm2 save
pm2 startup

# Afficher le statut
echo ""
echo "✅ Plateforme démarrée avec succès!"
echo "========================================="
echo "📊 Dashboard SuperAdmin: http://localhost:3000"
echo "🔧 Directus Admin: http://localhost:8055"
echo "🔌 API Proxy: http://localhost:8080"
echo ""
echo "📝 Commandes utiles:"
echo "  pm2 status       - Voir l'état des services"
echo "  pm2 logs         - Voir les logs"
echo "  pm2 restart all  - Redémarrer tout"
echo "  pm2 stop all     - Arrêter tout"
echo ""

# Afficher les logs en temps réel
pm2 logs --lines 50