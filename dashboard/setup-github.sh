#!/bin/bash

# Script pour configurer GitHub
# Usage: ./setup-github.sh <username> <repo-name>

USERNAME=${1:-"your-username"}
REPO_NAME=${2:-"dashboard-client-presta"}

echo "🚀 Configuration GitHub pour $REPO_NAME"

# Configuration Git
echo "📝 Configuration Git..."
git config user.name "$USERNAME"
git config user.email "$USERNAME@users.noreply.github.com"

# Ajout des fichiers
echo "📦 Ajout des fichiers au repository..."
git add .
git commit -m "Initial commit: Complete Dashboard Client: Presta setup

- Multi-role portal (Client, Prestataire, Revendeur, Superadmin)
- Notion API integration
- OCR functionality with OpenAI Vision
- Advanced optimizations (Service Worker, lazy loading)
- Complete documentation and architecture files

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"

# Configuration du remote
echo "🔗 Configuration du remote..."
git remote add origin "https://github.com/$USERNAME/$REPO_NAME.git" 2>/dev/null || \
git remote set-url origin "https://github.com/$USERNAME/$REPO_NAME.git"

echo "✅ Configuration terminée!"
echo ""
echo "📋 Prochaines étapes:"
echo "1. Créer le repository sur GitHub: https://github.com/new"
echo "2. Exécuter: git push -u origin main"
echo ""
echo "💡 Pour utiliser un token d'accès:"
echo "git remote set-url origin https://<token>@github.com/$USERNAME/$REPO_NAME.git"