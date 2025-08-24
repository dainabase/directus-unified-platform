#!/bin/bash

# Script de publication locale pour @dainabase/ui
# À exécuter depuis la racine du projet

echo "🚀 Publication de @dainabase/ui sur GitHub Packages..."

# Vérifier que GITHUB_TOKEN est défini
if [ -z "$GITHUB_TOKEN" ]; then
  echo "❌ Erreur: GITHUB_TOKEN n'est pas défini"
  echo "Exécutez: export GITHUB_TOKEN=votre_token_github"
  exit 1
fi

# Configurer npm pour GitHub Packages
echo "📝 Configuration de npm pour GitHub Packages..."
npm config set @dainabase:registry https://npm.pkg.github.com/
npm config set //npm.pkg.github.com/:_authToken ${GITHUB_TOKEN}

# Aller dans le package UI
cd packages/ui

# Nettoyer et reconstruire
echo "🔨 Build du package..."
rm -rf dist
pnpm build

# Vérifier que le build existe
if [ ! -d "dist" ]; then
  echo "❌ Erreur: Le dossier dist n'existe pas après le build"
  exit 1
fi

# Publier le package
echo "📦 Publication sur GitHub Packages..."
npm publish --access public

echo "✅ Publication terminée !"
echo "📍 Package disponible: https://github.com/dainabase/directus-unified-platform/packages"