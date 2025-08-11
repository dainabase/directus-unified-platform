#!/bin/bash

# 🧹 Script de nettoyage du Design System
# Créé le 11 Août 2025
# Ce script supprime les éléments obsolètes tout en préservant les fichiers OCR

echo "🚀 Début du nettoyage du repository..."

# Vérification que nous sommes sur la bonne branche
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "feature/design-system-cleanup" ]; then
    echo "⚠️  Vous n'êtes pas sur la branche feature/design-system-cleanup"
    echo "Exécution de: git checkout feature/design-system-cleanup"
    git checkout feature/design-system-cleanup
fi

echo ""
echo "📁 Suppression du dossier /design-system (obsolète Tabler.io)..."
git rm -r design-system/
echo "✅ /design-system supprimé"

echo ""
echo "📁 Nettoyage du dossier /dashboard..."
echo "  ⚠️ Préservation de tous les fichiers OCR"

# Suppression des fichiers .backup
echo "  - Suppression des fichiers .backup..."
git rm -f dashboard/index.html.backup 2>/dev/null || echo "    index.html.backup déjà supprimé ou n'existe pas"
git rm -f dashboard/login.html.backup 2>/dev/null || echo "    login.html.backup déjà supprimé ou n'existe pas"
git rm -f dashboard/register.html.backup 2>/dev/null || echo "    register.html.backup déjà supprimé ou n'existe pas"

# Suppression du serveur HTTP de développement
echo "  - Suppression de simple_http_server.py..."
git rm -f dashboard/simple_http_server.py 2>/dev/null || echo "    simple_http_server.py déjà supprimé ou n'existe pas"

echo ""
echo "✅ Nettoyage terminé!"

echo ""
echo "📋 Résumé des suppressions:"
echo "  - /design-system (dossier complet)"
echo "  - dashboard/*.backup (3 fichiers)"
echo "  - dashboard/simple_http_server.py"

echo ""
echo "🔒 Fichiers préservés:"
echo "  - Tous les fichiers OCR ✅"
echo "  - Twenty MCP Server ✅"
echo "  - Notion Proxy ✅"

echo ""
echo "📝 Création du commit..."
git add -A
git commit -m "chore: remove obsolete design-system and cleanup dashboard

- Remove entire /design-system folder (obsolete Tabler.io version)
- Remove backup HTML files from dashboard
- Remove simple_http_server.py (dev only)
- Preserve all OCR-related files and services
- Preserve Twenty MCP and Notion proxy

The official design system is now @dainabase/ui v1.0.0-beta.1 in /packages/ui"

echo ""
echo "✅ Commit créé avec succès!"
echo ""
echo "📤 Pour pousser les changements:"
echo "  git push origin feature/design-system-cleanup"
echo ""
echo "📝 Ensuite, créez une Pull Request sur GitHub"
