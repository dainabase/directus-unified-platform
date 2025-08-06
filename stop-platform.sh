#!/bin/bash

echo "🛑 Arrêt de Directus Unified Platform"
echo "======================================"

# Arrêter PM2
echo "Arrêt des services PM2..."
pm2 stop all
pm2 delete all

# Arrêter Docker
echo "Arrêt des conteneurs Docker..."
docker-compose down

echo "✅ Plateforme arrêtée"