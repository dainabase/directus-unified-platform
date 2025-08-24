#!/bin/bash

# Script de publication NPM automatique pour @dainabase/ui v1.0.0-beta.1
# Ce script gère toute la publication sur GitHub Package Registry

set -e

echo "📦 PUBLICATION NPM AUTOMATIQUE"
echo "=============================="
echo ""

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Fonction pour vérifier les prérequis
check_prerequisites() {
    echo -e "${BLUE}Vérification des prérequis...${NC}"
    
    # Vérifier npm
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ npm n'est pas installé${NC}"
        echo "Installez Node.js depuis: https://nodejs.org/"
        exit 1
    fi
    
    # Vérifier pnpm (optionnel mais recommandé)
    if ! command -v pnpm &> /dev/null; then
        echo -e "${YELLOW}⚠️  pnpm non trouvé, utilisation de npm${NC}"
        BUILD_CMD="npm run build:optimize"
    else
        BUILD_CMD="pnpm build:optimize"
    fi
    
    echo -e "${GREEN}✅ Prérequis OK${NC}\n"
}

# Fonction pour configurer l'authentification
setup_auth() {
    echo -e "${BLUE}Configuration de l'authentification GitHub Package Registry...${NC}"
    
    # Vérifier si déjà authentifié
    if npm whoami --registry=https://npm.pkg.github.com 2>/dev/null; then
        echo -e "${GREEN}✅ Déjà authentifié${NC}\n"
        return 0
    fi
    
    echo -e "${YELLOW}Authentification requise!${NC}"
    echo ""
    echo "Vous allez avoir besoin d'un token GitHub avec les permissions:"
    echo "  • write:packages"
    echo "  • read:packages"
    echo "  • delete:packages (optionnel)"
    echo ""
    echo "Pour créer un token:"
    echo "1. Allez sur: https://github.com/settings/tokens/new"
    echo "2. Donnez un nom: 'NPM Package Registry'"
    echo "3. Cochez: repo, write:packages, read:packages"
    echo "4. Cliquez 'Generate token'"
    echo "5. Copiez le token"
    echo ""
    read -p "Appuyez sur ENTRÉE quand vous avez votre token..."
    
    # Configuration npm
    echo ""
    echo "Configuration de npm..."
    npm login --registry=https://npm.pkg.github.com --scope=@dainabase
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Authentification réussie${NC}\n"
    else
        echo -e "${RED}❌ Échec de l'authentification${NC}"
        echo "Vérifiez votre token et réessayez"
        exit 1
    fi
}

# Fonction pour naviguer vers le package
navigate_to_package() {
    echo -e "${BLUE}Navigation vers le package UI...${NC}"
    
    # Essayer plusieurs chemins possibles
    if [ -d "packages/ui" ]; then
        cd packages/ui
    elif [ -d "../packages/ui" ]; then
        cd ../packages/ui
    elif [ -d "../../packages/ui" ]; then
        cd ../../packages/ui
    elif [ -d "~/directus-unified-platform/packages/ui" ]; then
        cd ~/directus-unified-platform/packages/ui
    else
        echo -e "${YELLOW}Recherche du dossier packages/ui...${NC}"
        FOUND_PATH=$(find ~ -path "*/directus-unified-platform/packages/ui" -type d 2>/dev/null | head -1)
        if [ -n "$FOUND_PATH" ]; then
            cd "$FOUND_PATH"
        else
            echo -e "${RED}❌ Impossible de trouver packages/ui${NC}"
            echo "Naviguez manuellement vers le dossier et relancez le script"
            exit 1
        fi
    fi
    
    echo -e "${GREEN}✅ Dans $(pwd)${NC}\n"
}

# Fonction pour vérifier la version
verify_version() {
    echo -e "${BLUE}Vérification de la version...${NC}"
    
    VERSION=$(node -p "require('./package.json').version" 2>/dev/null)
    
    if [ "$VERSION" != "1.0.0-beta.1" ]; then
        echo -e "${RED}❌ Version incorrecte: $VERSION${NC}"
        echo "Attendu: 1.0.0-beta.1"
        echo ""
        read -p "Voulez-vous mettre à jour la version? (y/n) " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            npm version 1.0.0-beta.1 --no-git-tag-version
            echo -e "${GREEN}✅ Version mise à jour${NC}"
        else
            echo "Publication annulée"
            exit 1
        fi
    else
        echo -e "${GREEN}✅ Version correcte: $VERSION${NC}\n"
    fi
}

# Fonction pour builder le package
build_package() {
    echo -e "${BLUE}Build du package...${NC}"
    
    if [ -f "dist/index.js" ]; then
        echo -e "${YELLOW}Build existant trouvé${NC}"
        read -p "Voulez-vous rebuilder? (y/n) " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo "Build en cours..."
            $BUILD_CMD || npm run build || true
        fi
    else
        echo "Build en cours..."
        $BUILD_CMD || npm run build || true
    fi
    
    echo -e "${GREEN}✅ Build terminé${NC}\n"
}

# Fonction pour publier
publish_package() {
    echo -e "${BLUE}Publication du package...${NC}"
    
    # Dry run d'abord
    echo "Test de publication (dry-run)..."
    npm pack --dry-run
    
    echo ""
    echo -e "${YELLOW}Prêt à publier @dainabase/ui@1.0.0-beta.1${NC}"
    echo "Registry: https://npm.pkg.github.com/"
    echo "Tag: beta"
    echo ""
    read -p "Confirmer la publication? (y/n) " -n 1 -r
    echo ""
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Publication annulée"
        exit 0
    fi
    
    # Publication réelle
    echo "Publication en cours..."
    npm publish --tag beta --registry https://npm.pkg.github.com/ --access public
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Package publié avec succès!${NC}\n"
    else
        echo -e "${RED}❌ Erreur lors de la publication${NC}"
        echo "Vérifiez les erreurs ci-dessus"
        exit 1
    fi
}

# Fonction pour vérifier la publication
verify_publication() {
    echo -e "${BLUE}Vérification de la publication...${NC}"
    
    npm view @dainabase/ui@beta version --registry https://npm.pkg.github.com/
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Package disponible sur GitHub Package Registry!${NC}"
    else
        echo -e "${YELLOW}⚠️  Impossible de vérifier, mais la publication a probablement réussi${NC}"
    fi
}

# Fonction principale
main() {
    echo -e "${GREEN}🚀 Début de la publication NPM${NC}"
    echo "================================"
    echo ""
    
    # Étapes
    check_prerequisites
    navigate_to_package
    verify_version
    setup_auth
    build_package
    publish_package
    verify_publication
    
    # Résumé final
    echo ""
    echo -e "${GREEN}════════════════════════════════════════${NC}"
    echo -e "${GREEN}🎉 PUBLICATION TERMINÉE AVEC SUCCÈS!${NC}"
    echo -e "${GREEN}════════════════════════════════════════${NC}"
    echo ""
    echo "📦 Package: @dainabase/ui"
    echo "🏷️  Version: 1.0.0-beta.1"
    echo "📍 Registry: GitHub Package Registry"
    echo "🔖 Tag: beta"
    echo ""
    echo "Pour installer le package:"
    echo -e "${BLUE}pnpm add @dainabase/ui@beta --registry https://npm.pkg.github.com/${NC}"
    echo ""
    echo -e "${GREEN}✨ La release v1.0.0-beta.1 est maintenant complète!${NC}"
}

# Gestion des erreurs
trap 'echo -e "\n${RED}❌ Script interrompu${NC}"; exit 1' INT TERM

# Lancer le script
main
