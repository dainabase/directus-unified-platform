#!/bin/bash
# Script de nettoyage pour @dainabase/ui v1.2.0
# Date: 14 août 2025
# Objectif: Supprimer workflows vides et résoudre doublons

echo "🧹 Début du nettoyage du repository..."
echo "================================================"

# Liste des workflows vides à supprimer
EMPTY_WORKFLOWS=(
  "auto-fix-deps.yml"
  "auto-publish-v040.yml"
  "fix-and-publish.yml"
  "force-publish.yml"
  "manual-publish.yml"
  "npm-auto-publish.yml"
  "npm-monitor.yml"
  "npm-publish-beta.yml"
  "npm-publish-ui.yml"
  "publish-manual.yml"
  "publish-ui.yml"
  "quick-npm-publish.yml"
  "simple-publish.yml"
  "ui-100-coverage-publish.yml"
)

echo "📁 Suppression de ${#EMPTY_WORKFLOWS[@]} workflows vides..."
for workflow in "${EMPTY_WORKFLOWS[@]}"; do
  FILE=".github/workflows/$workflow"
  if [ -f "$FILE" ]; then
    rm -f "$FILE"
    echo "✅ Supprimé: $FILE"
  else
    echo "⏭️ Déjà supprimé ou inexistant: $FILE"
  fi
done

echo ""
echo "📂 Déplacement des fichiers mal placés..."

# Déplacer EMERGENCY_AUDIT.sh
if [ -f ".github/workflows/EMERGENCY_AUDIT.sh" ]; then
  mkdir -p scripts
  mv .github/workflows/EMERGENCY_AUDIT.sh scripts/
  echo "✅ Déplacé: EMERGENCY_AUDIT.sh → scripts/"
fi

# Déplacer MAINTENANCE_LOG.md
if [ -f ".github/workflows/MAINTENANCE_LOG.md" ]; then
  mkdir -p docs
  mv .github/workflows/MAINTENANCE_LOG.md docs/
  echo "✅ Déplacé: MAINTENANCE_LOG.md → docs/"
fi

echo ""
echo "🔄 Résolution des doublons dans packages/ui/..."

# Supprimer les doublons (garder la version sans point)
if [ -f "packages/ui/.eslintrc.js" ]; then
  rm -f packages/ui/.eslintrc.js
  echo "✅ Supprimé: .eslintrc.js (gardé .eslintrc.json)"
fi

if [ -f "packages/ui/.chromatic.config.json" ]; then
  rm -f packages/ui/.chromatic.config.json
  echo "✅ Supprimé: .chromatic.config.json (gardé chromatic.config.json)"
fi

echo ""
echo "📊 Résumé du nettoyage:"
echo "- Workflows supprimés: ${#EMPTY_WORKFLOWS[@]}"
echo "- Fichiers déplacés: 2"
echo "- Doublons résolus: 2"
echo ""
echo "✨ Nettoyage terminé avec succès!"
echo "================================================"

# Lister les workflows restants
echo ""
echo "📋 Workflows actifs restants:"
ls -la .github/workflows/*.yml 2>/dev/null | grep -v "^total" | awk '{print "  - " $NF}'

echo ""
echo "🚀 Repository prêt pour la publication v1.2.0!"
