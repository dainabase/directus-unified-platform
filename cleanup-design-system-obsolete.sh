#!/bin/bash

# Script de nettoyage du Design System obsolète v0.4.0
# Conservation de la version validée v1.0.0-beta.1 dans packages/ui/

echo "🧹 Nettoyage du Design System obsolète..."
echo "❌ Suppression : v0.4.0 (31 composants)"
echo "✅ Conservation : v1.0.0-beta.1 (40 composants)"
echo ""

# Suppression du dossier .ds qui contient l'ancienne version 0.4.0
if [ -d ".ds" ]; then
    echo "Suppression du dossier .ds/ (version 0.4.0)..."
    rm -rf .ds/
    echo "✅ Dossier .ds/ supprimé"
else
    echo "⚠️ Dossier .ds/ non trouvé"
fi

# Vérification que le design system v1.0.0-beta.1 est bien présent
if [ -f "packages/ui/package.json" ]; then
    VERSION=$(grep '"version":' packages/ui/package.json | sed 's/.*"version": "\(.*\)".*/\1/')
    echo ""
    echo "✅ Design System validé conservé :"
    echo "   - Package: @dainabase/ui"
    echo "   - Version: $VERSION"
    echo "   - Location: packages/ui/"
    echo "   - Composants: 40"
else
    echo "⚠️ ATTENTION: packages/ui/package.json non trouvé!"
fi

echo ""
echo "📊 Résumé :"
echo "   - Supprimé : .ds/ (v0.4.0, 31 composants)"
echo "   - Conservé : packages/ui/ (v1.0.0-beta.1, 40 composants)"
echo ""
echo "🎯 Prochaine étape : git add . && git commit -m 'cleanup: remove obsolete design system v0.4.0'"
