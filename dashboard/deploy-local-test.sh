#!/bin/bash

# Script pour tester le proxy en local avec PHP built-in server
echo "🚀 Test du proxy Notion en local"
echo "================================"

# Vérifier que PHP est installé
if ! command -v php &> /dev/null; then
    echo "❌ PHP n'est pas installé. Installez PHP 7.4+ pour continuer."
    exit 1
fi

# Vérifier la version de PHP
PHP_VERSION=$(php -r "echo PHP_VERSION;")
echo "✅ PHP version: $PHP_VERSION"

# Vérifier que CURL est activé
if ! php -m | grep -q curl; then
    echo "⚠️  Extension CURL non détectée. Le proxy pourrait ne pas fonctionner."
fi

# Démarrer le serveur PHP
PORT=8080
echo ""
echo "📡 Démarrage du serveur PHP sur le port $PORT..."
echo "URL du proxy: http://localhost:$PORT/api/notion-proxy.php"
echo ""
echo "Appuyez sur Ctrl+C pour arrêter le serveur"
echo ""

# Démarrer depuis le répertoire racine du projet
cd "$(dirname "$0")"
php -S localhost:$PORT -t .