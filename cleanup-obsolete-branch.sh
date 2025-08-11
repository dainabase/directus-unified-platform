#!/bin/bash

# Script de suppression de la branche obsolète feat/design-system-apple
# Date : 11 août 2025
# Backup déjà créé : backup/feat-design-system-apple-20250811

echo "🧹 Nettoyage de la branche obsolète feat/design-system-apple"
echo "=================================================="
echo ""
echo "✅ Backup créé : backup/feat-design-system-apple-20250811"
echo ""
echo "Cette branche contient :"
echo "- Version obsolète v0.2.0 (main a v1.0.0-beta.1)"
echo "- 30 commits dont 29 APRÈS marquage comme obsolète"
echo "- Fichier OBSOLETE_BRANCH.md confirmant l'obsolescence"
echo ""
echo "⚠️  ATTENTION : Cette action est IRRÉVERSIBLE (mais backup existe)"
echo ""
read -p "Voulez-vous supprimer la branche remote origin/feat/design-system-apple ? (oui/non) : " response

if [ "$response" = "oui" ]; then
    echo ""
    echo "🔄 Suppression en cours..."
    git push origin --delete feat/design-system-apple
    
    if [ $? -eq 0 ]; then
        echo "✅ Branche origin/feat/design-system-apple supprimée avec succès !"
        echo ""
        echo "📝 Pour restaurer si nécessaire :"
        echo "   git push origin backup/feat-design-system-apple-20250811:feat/design-system-apple"
    else
        echo "❌ Erreur lors de la suppression"
    fi
else
    echo "❌ Suppression annulée"
    echo ""
    echo "💡 Pour supprimer plus tard :"
    echo "   git push origin --delete feat/design-system-apple"
fi

echo ""
echo "📊 État des branches restantes :"
git branch -r | grep -E "(main|feat/design-system)" | head -5
