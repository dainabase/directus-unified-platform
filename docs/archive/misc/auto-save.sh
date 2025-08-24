#!/bin/bash
# Script de sauvegarde automatique pour Claude Code

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Fonction de sauvegarde
save_work() {
    echo -e "${GREEN}🔄 Sauvegarde automatique...${NC}"
    
    # Vérifier s'il y a des changements
    if [[ -n $(git status -s) ]]; then
        # Ajouter tout
        git add -A
        
        # Créer un message de commit avec timestamp
        TIMESTAMP=$(date +"%Y-%m-%d %H:%M")
        git commit -m "auto-save: $TIMESTAMP - $1"
        
        # Push
        git push origin main
        
        echo -e "${GREEN}✅ Sauvegardé sur GitHub !${NC}"
        echo "Voir : https://github.com/dainabase/directus-unified-platform"
    else
        echo "Rien à sauvegarder"
    fi
}

# Si un argument est passé, l'utiliser comme message
if [ $# -eq 0 ]; then
    save_work "Sauvegarde automatique"
else
    save_work "$*"
fi