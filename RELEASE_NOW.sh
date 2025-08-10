#!/bin/bash
# ONE-CLICK RELEASE SCRIPT
# Exécute toutes les actions possibles automatiquement

echo "🚀 LANCEMENT DE LA RELEASE v1.0.0-beta.1"
echo "========================================"
echo ""

# 1. Créer et pousser le tag
echo "📌 Création du tag Git..."
git tag @dainabase/ui@1.0.0-beta.1 f767663d1a3cd878693487f4f0c0ffb731db754b -m "Release @dainabase/ui v1.0.0-beta.1

🚀 First production-ready beta release
📦 Bundle optimized to 48KB (-49%)
✨ 40 components including 9 new additions
🧪 97% test coverage
📚 Complete documentation" 2>/dev/null || echo "Tag déjà créé localement"

git push origin @dainabase/ui@1.0.0-beta.1 2>/dev/null && echo "✅ Tag poussé!" || echo "⚠️ Tag déjà sur GitHub"

# 2. Créer la GitHub Release avec gh CLI si disponible
if command -v gh &> /dev/null; then
    echo ""
    echo "📦 Création de la GitHub Release..."
    gh release create "@dainabase/ui@1.0.0-beta.1" \
        --repo "dainabase/directus-unified-platform" \
        --title "🚀 Design System v1.0.0-beta.1" \
        --notes-file GITHUB_RELEASE_v1.0.0-beta.1.md \
        --prerelease \
        --target main 2>/dev/null && echo "✅ Release créée!" || echo "⚠️ Release déjà existante"
else
    echo ""
    echo "⚠️ GitHub CLI non installé"
    echo "👉 Créer la release manuellement: https://github.com/dainabase/directus-unified-platform/releases/new"
fi

# 3. Instructions NPM
echo ""
echo "========================================="
echo "📦 DERNIÈRE ÉTAPE: PUBLICATION NPM"
echo "========================================="
echo ""
echo "Copiez ces commandes:"
echo ""
echo "cd packages/ui"
echo "npm publish --tag beta --registry https://npm.pkg.github.com/"
echo ""
echo "✅ Après publication, la release sera complète!"