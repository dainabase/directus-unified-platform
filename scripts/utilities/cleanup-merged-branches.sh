#!/bin/bash

# Script de nettoyage complet des branches obsolètes
# Date : 11 août 2025
# Après suppression de feat/design-system-apple et feat/design-system-v1.0.0

echo "🧹 NETTOYAGE COMPLET DES BRANCHES OBSOLÈTES"
echo "============================================"
echo ""
echo "✅ Déjà supprimées :"
echo "  - feat/design-system-apple"
echo "  - feat/design-system-v1.0.0"
echo ""
echo "📊 Branches complètement mergées (peuvent être supprimées) :"
echo "  - fix/audit-quick-fixes-v2"
echo "  - fix/merge-conflicts-pr9"
echo "  - fix/reconcile-design-system-v040"
echo "  - fix/stabilize-design-system"
echo ""
echo "⚠️  Ces 4 branches sont complètement mergées dans main"
echo ""
read -p "Voulez-vous supprimer ces 4 branches mergées ? (oui/non) : " response

if [ "$response" = "oui" ]; then
    echo ""
    echo "🔄 Suppression en cours..."
    
    # Tableau des branches à supprimer
    branches=(
        "fix/audit-quick-fixes-v2"
        "fix/merge-conflicts-pr9"
        "fix/reconcile-design-system-v040"
        "fix/stabilize-design-system"
    )
    
    # Suppression de chaque branche
    for branch in "${branches[@]}"; do
        echo "  Suppression de $branch..."
        git push origin --delete "$branch" 2>/dev/null
        if [ $? -eq 0 ]; then
            echo "  ✅ $branch supprimée"
        else
            echo "  ⚠️  $branch déjà supprimée ou erreur"
        fi
    done
    
    echo ""
    echo "✅ Nettoyage terminé !"
else
    echo "❌ Suppression annulée"
fi

echo ""
echo "📊 Branches restantes avec commits uniques :"
echo "  - fix/audit-quick-fixes (9 commits)"
echo "  - fix/dashboard-react-repair (4 commits)"
echo "  - fix/resolve-conflicts-pr9 (1 commit)"
echo "  - feat/ds-98-score-resolved (5 commits)"
echo "  - feat/ds-improvements-98-score (16 commits)"
echo ""
echo "💡 Ces branches contiennent du travail non mergé."
echo "   Vérifiez leur contenu avant suppression."
