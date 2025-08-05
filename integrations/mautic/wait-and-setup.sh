#!/bin/bash

echo "⏳ Attente du démarrage de Mautic..."

# Attendre que les containers soient démarrés
while ! docker ps | grep -q "mautic-app"; do
    echo "En attente du container Mautic..."
    sleep 5
done

echo "✅ Container Mautic détecté!"

# Attendre que Mautic soit accessible
while ! curl -s http://localhost:8084 > /dev/null; do
    echo "En attente que Mautic soit accessible..."
    sleep 5
done

echo "✅ Mautic est accessible!"

# Attendre un peu plus pour être sûr
sleep 10

# Installer Mautic via CLI
echo "🔧 Installation de Mautic..."
docker exec -it mautic-app php bin/console mautic:install:app \
    --force \
    --admin_firstname="Super" \
    --admin_lastname="Admin" \
    --admin_username="admin" \
    --admin_email="admin@superadmin.com" \
    --admin_password="Admin@Mautic2025" \
    || echo "⚠️ Mautic peut déjà être installé"

# Nettoyer le cache
echo "🧹 Nettoyage du cache..."
docker exec -it mautic-app php bin/console cache:clear

# Créer un utilisateur API
echo "👤 Configuration de l'utilisateur API..."
docker exec -it mautic-app php bin/console mautic:user:create \
    --username="api_user" \
    --firstname="API" \
    --lastname="User" \
    --email="api@mautic.local" \
    --password="ApiUser@2025" \
    --role="Administrator" \
    || echo "⚠️ Utilisateur API peut déjà exister"

echo "✅ Configuration terminée!"
echo ""
echo "📌 Informations de connexion:"
echo "URL: http://localhost:8084"
echo "Admin: admin / Admin@Mautic2025"
echo "API: api_user / ApiUser@2025"