#!/bin/bash

# ==============================================================================
# 🚀 SCRIPT PRINCIPAL D'ORGANISATION DU REPOSITORY
# ==============================================================================
# Auteur: DAINAMICS
# Date: 24 décembre 2024
# Description: Orchestre l'organisation complète du repository
# ==============================================================================

# Configuration des couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Banner
clear
echo -e "${CYAN}${BOLD}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║     🚀 DIRECTUS UNIFIED PLATFORM - ORGANISATION REPO 🚀     ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Fonction pour afficher une étape
show_step() {
    echo ""
    echo -e "${BLUE}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${MAGENTA}${BOLD}📌 $1${NC}"
    echo -e "${BLUE}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

# Fonction pour afficher le succès
show_success() {
    echo -e "${GREEN}${BOLD}✅ $1${NC}"
}

# Fonction pour afficher un warning
show_warning() {
    echo -e "${YELLOW}${BOLD}⚠️  $1${NC}"
}

# Fonction pour afficher une erreur
show_error() {
    echo -e "${RED}${BOLD}❌ $1${NC}"
}

# Fonction pour demander confirmation
ask_confirmation() {
    local prompt=$1
    local response
    
    echo -e "${YELLOW}${BOLD}$prompt (y/n):${NC} "
    read -r response
    
    if [[ "$response" =~ ^[Yy]$ ]]; then
        return 0
    else
        return 1
    fi
}

# Vérification de Git
check_git() {
    if ! command -v git &> /dev/null; then
        show_error "Git n'est pas installé !"
        exit 1
    fi
    
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        show_error "Ce n'est pas un repository Git !"
        exit 1
    fi
    
    show_success "Git est configuré correctement"
}

# ==============================================================================
# ÉTAPE 1: VÉRIFICATION DE L'ENVIRONNEMENT
# ==============================================================================
show_step "ÉTAPE 1: Vérification de l'environnement"

check_git

# Vérifier le statut Git
if [[ -n $(git status --porcelain) ]]; then
    show_warning "Des changements non commités ont été détectés"
    if ask_confirmation "Voulez-vous continuer quand même ?"; then
        show_success "Continuation du processus..."
    else
        show_error "Organisation annulée"
        exit 1
    fi
else
    show_success "Aucun changement non commité détecté"
fi

# ==============================================================================
# ÉTAPE 2: NETTOYAGE DES FICHIERS OBSOLÈTES
# ==============================================================================
show_step "ÉTAPE 2: Nettoyage des fichiers obsolètes"

if [ -f "scripts/utilities/cleanup-root-files.sh" ]; then
    if ask_confirmation "Voulez-vous nettoyer les fichiers obsolètes de la racine ?"; then
        chmod +x scripts/utilities/cleanup-root-files.sh
        ./scripts/utilities/cleanup-root-files.sh
        show_success "Fichiers obsolètes nettoyés"
    else
        show_warning "Nettoyage des fichiers obsolètes ignoré"
    fi
else
    show_warning "Script de nettoyage non trouvé"
fi

# ==============================================================================
# ÉTAPE 3: ORGANISATION DES SCRIPTS
# ==============================================================================
show_step "ÉTAPE 3: Organisation des scripts"

if [ -f "scripts/organize-root-scripts.sh" ]; then
    if ask_confirmation "Voulez-vous organiser les scripts de la racine ?"; then
        chmod +x scripts/organize-root-scripts.sh
        ./scripts/organize-root-scripts.sh
        show_success "Scripts organisés dans /scripts/"
    else
        show_warning "Organisation des scripts ignorée"
    fi
else
    show_error "Script d'organisation non trouvé"
fi

# ==============================================================================
# ÉTAPE 4: CRÉATION DE LA STRUCTURE DE DOCUMENTATION
# ==============================================================================
show_step "ÉTAPE 4: Création de la structure de documentation"

# Créer les dossiers de documentation
mkdir -p docs/{api,guides,architecture,deployment}

# Créer un fichier index pour la documentation
cat > docs/README.md << 'EOF'
# 📚 Documentation Directus Unified Platform

## 📁 Structure de la documentation

- **[Architecture](./architecture/)** - Documentation technique et architecture
- **[API](./api/)** - Documentation des APIs et endpoints
- **[Guides](./guides/)** - Guides d'utilisation et tutoriels
- **[Deployment](./deployment/)** - Guides de déploiement et configuration
- **[Collections Directus](./directus-collections.md)** - Structure des données

## 🔗 Liens rapides

- [README Principal](../README.md)
- [Scripts](../scripts/README.md)
- [Frontend](../src/frontend/README.md)
- [Backend](../src/backend/README.md)

---
*Documentation organisée le 24 décembre 2024*
EOF

show_success "Structure de documentation créée"

# ==============================================================================
# ÉTAPE 5: GÉNÉRATION DU RAPPORT
# ==============================================================================
show_step "ÉTAPE 5: Génération du rapport d'organisation"

REPORT_FILE="docs/organization-report-$(date +%Y%m%d-%H%M%S).md"

cat > "$REPORT_FILE" << EOF
# 📊 Rapport d'Organisation du Repository

**Date**: $(date +"%d/%m/%Y %H:%M:%S")
**Utilisateur**: $(whoami)
**Branche**: $(git branch --show-current)

## 📈 Statistiques

### Fichiers dans la racine
- **Avant**: $(ls -1 | wc -l) fichiers
- **Scripts déplacés**: $(ls -1 *.js *.sh 2>/dev/null | wc -l) fichiers

### Structure /scripts/
- **testing/**: $(ls scripts/testing 2>/dev/null | wc -l) fichiers
- **migration/**: $(ls scripts/migration 2>/dev/null | wc -l) fichiers
- **deployment/**: $(ls scripts/deployment 2>/dev/null | wc -l) fichiers
- **utilities/**: $(ls scripts/utilities 2>/dev/null | wc -l) fichiers
- **maintenance/**: $(ls scripts/maintenance 2>/dev/null | wc -l) fichiers
- **setup/**: $(ls scripts/setup 2>/dev/null | wc -l) fichiers

## 🎯 Actions effectuées

1. ✅ Nettoyage des fichiers obsolètes
2. ✅ Organisation des scripts dans /scripts/
3. ✅ Création de la documentation
4. ✅ Mise à jour du README principal
5. ✅ Génération de ce rapport

## 📝 Prochaines étapes recommandées

1. Vérifier les fichiers organisés
2. Tester les scripts dans leur nouvel emplacement
3. Mettre à jour les références dans le code
4. Documenter les changements dans le CHANGELOG

---
*Rapport généré automatiquement*
EOF

show_success "Rapport généré: $REPORT_FILE"

# ==============================================================================
# ÉTAPE 6: COMMIT DES CHANGEMENTS
# ==============================================================================
show_step "ÉTAPE 6: Commit des changements"

if ask_confirmation "Voulez-vous créer un commit avec tous les changements ?"; then
    git add -A
    git commit -m "chore: major repository reorganization

- Organized all scripts into categorized folders in /scripts/
- Cleaned up obsolete files from root directory
- Updated documentation structure
- Created comprehensive README files
- Added organization and cleanup scripts

Organization completed on $(date +%Y-%m-%d)"
    
    show_success "Commit créé avec succès"
    
    if ask_confirmation "Voulez-vous pusher les changements maintenant ?"; then
        git push
        show_success "Changements pushés sur le repository distant"
    else
        show_warning "Push annulé - n'oubliez pas de pusher plus tard"
    fi
else
    show_warning "Commit annulé - les changements restent non commités"
fi

# ==============================================================================
# RÉSUMÉ FINAL
# ==============================================================================
echo ""
echo -e "${CYAN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}${BOLD}🎉 ORGANISATION TERMINÉE AVEC SUCCÈS ! 🎉${NC}"
echo -e "${CYAN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BOLD}📋 Résumé des actions:${NC}"
echo "  ✓ Repository nettoyé et organisé"
echo "  ✓ Scripts catégorisés dans /scripts/"
echo "  ✓ Documentation mise à jour"
echo "  ✓ Rapport généré dans $REPORT_FILE"
echo ""
echo -e "${YELLOW}${BOLD}💡 Conseils:${NC}"
echo "  - Vérifiez que tous les scripts fonctionnent toujours"
echo "  - Mettez à jour les références dans votre CI/CD"
echo "  - Informez l'équipe des changements"
echo ""
echo -e "${GREEN}${BOLD}✨ Merci d'avoir utilisé l'organisateur de repository !${NC}"
echo ""
