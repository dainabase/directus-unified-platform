#!/bin/bash

# 🚨 SCRIPT DE NETTOYAGE D'URGENCE - DIRECTUS UNIFIED PLATFORM
# Date: 23 Août 2025
# Action: Nettoyer les 115 fichiers .md qui polluent la racine
# ============================================================

echo "🔥🔥🔥 GRAND NETTOYAGE DU REPOSITORY 🔥🔥🔥"
echo "============================================"
echo ""

# Couleurs pour le terminal
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. SAUVEGARDER LA BRANCHE ACTUELLE
echo -e "${BLUE}📍 Étape 1: Sauvegarde de l'état actuel...${NC}"
CURRENT_BRANCH=$(git branch --show-current)
echo "Branche actuelle: $CURRENT_BRANCH"
git add .
git stash
echo -e "${GREEN}✅ État sauvegardé${NC}\n"

# 2. RÉCUPÉRER ET MERGER LA BRANCHE CLEANUP
echo -e "${BLUE}📍 Étape 2: Récupération de la branche cleanup-architecture...${NC}"
git fetch origin
git checkout cleanup-architecture
git pull origin cleanup-architecture
echo -e "${GREEN}✅ Branche cleanup-architecture récupérée${NC}\n"

# 3. MERGER DANS MAIN
echo -e "${BLUE}📍 Étape 3: Merge dans main...${NC}"
git checkout main
git merge cleanup-architecture --no-ff -m "🎯 Merge cleanup-architecture: Prepare archiving structure"
echo -e "${GREEN}✅ Merge effectué${NC}\n"

# 4. EXÉCUTER LE SCRIPT PYTHON D'ARCHIVAGE
echo -e "${BLUE}📍 Étape 4: Exécution du script d'archivage Python...${NC}"
if command -v python3 &> /dev/null; then
    python3 scripts/archive-md-files.py
elif command -v python &> /dev/null; then
    python scripts/archive-md-files.py
else
    echo -e "${RED}❌ Python non trouvé ! Installation requise.${NC}"
    echo "Installez Python puis relancez le script"
    exit 1
fi
echo -e "${GREEN}✅ Fichiers archivés${NC}\n"

# 5. ARCHIVER TWENTY CRM
echo -e "${BLUE}📍 Étape 5: Archivage de Twenty CRM...${NC}"
if [ -d "integrations/twenty" ]; then
    mkdir -p docs/archive/integrations
    git mv integrations/twenty docs/archive/integrations/
    git commit -m "📦 Archive Twenty CRM integration (not used)"
    echo -e "${GREEN}✅ Twenty CRM archivé${NC}\n"
else
    echo -e "${YELLOW}⚠️  Twenty CRM déjà archivé ou non trouvé${NC}\n"
fi

# 6. NETTOYER LES FICHIERS RESTANTS À LA RACINE
echo -e "${BLUE}📍 Étape 6: Nettoyage des fichiers restants...${NC}"

# Liste des fichiers à garder à la racine
KEEP_FILES=(
    "README.md"
    "package.json"
    "package-lock.json"
    "pnpm-lock.yaml"
    "tsconfig.json"
    "vite.config.ts"
    ".gitignore"
    ".env"
    ".env.example"
    ".npmrc"
    ".nvmrc"
    ".prettierrc"
    ".eslintrc.json"
    ".editorconfig"
    "CHANGELOG.md"
    "CONTRIBUTING.md"
)

# Déplacer les fichiers .md restants (sauf ceux à garder)
for file in *.md; do
    if [[ ! " ${KEEP_FILES[@]} " =~ " ${file} " ]]; then
        if [ -f "$file" ]; then
            echo "  Archivage de $file..."
            mkdir -p docs/archive/misc
            git mv "$file" docs/archive/misc/ 2>/dev/null || mv "$file" docs/archive/misc/
        fi
    fi
done

# Déplacer les fichiers .js et .sql à la racine
for file in *.js *.sql; do
    if [ -f "$file" ]; then
        echo "  Archivage de $file..."
        mkdir -p docs/archive/migrations
        git mv "$file" docs/archive/migrations/ 2>/dev/null || mv "$file" docs/archive/migrations/
    fi
done

echo -e "${GREEN}✅ Fichiers restants nettoyés${NC}\n"

# 7. COMMIT FINAL
echo -e "${BLUE}📍 Étape 7: Commit final...${NC}"
git add .
git commit -m "✨ Complete repository cleanup: Archive 115+ files and organize structure

- Archived 115 .md files from root to /docs/archive/
- Moved Twenty CRM to archives (not used)
- Cleaned root directory completely
- Kept only essential files at root
- Repository is now clean and professional"

echo -e "${GREEN}✅ Commit final créé${NC}\n"

# 8. RAPPORT FINAL
echo -e "${GREEN}🎉🎉🎉 NETTOYAGE TERMINÉ AVEC SUCCÈS ! 🎉🎉🎉${NC}"
echo "================================================"
echo ""
echo "📊 RÉSUMÉ DES ACTIONS:"
echo "  ✅ Branche cleanup-architecture mergée"
echo "  ✅ 115+ fichiers archivés dans /docs/archive/"
echo "  ✅ Twenty CRM archivé"
echo "  ✅ Racine du repository nettoyée"
echo ""
echo -e "${YELLOW}⚠️  ACTIONS RESTANTES:${NC}"
echo "  1. Vérifiez avec: git status"
echo "  2. Pushez avec: git push origin main"
echo "  3. Supprimez la branche: git branch -d cleanup-architecture"
echo "  4. Supprimez la branche distante: git push origin --delete cleanup-architecture"
echo ""
echo -e "${BLUE}💡 PROCHAINES ÉTAPES:${NC}"
echo "  - Peupler Directus avec les vraies données"
echo "  - Créer les 105 relations entre collections"
echo "  - Connecter le frontend aux vraies données"
echo ""
echo -e "${GREEN}🚀 Le repository est maintenant PROPRE et PROFESSIONNEL !${NC}"
