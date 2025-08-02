#!/bin/bash
# Script pour lancer le serveur Notion en double-cliquant

cd "$(dirname "$0")"
echo "🚀 Démarrage du serveur Notion..."
echo ""
python3 notion-proxy-server.py