#!/bin/bash

# 🔍 SCRIPT D'ANALYSE DU REPOSITORY
# Analyse l'état actuel et identifie les fichiers à organiser
# Date: 24 décembre 2024

echo "🔍 ANALYSE DU REPOSITORY DIRECTUS UNIFIED PLATFORM"
echo "=================================================="
echo ""

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour compter les fichiers
count_files() {
    local pattern=$1
    local count=$(ls -1 $pattern 2>/dev/null | wc -l)
    echo $count
}

# Fonction pour lister les fichiers
list_files() {
    local pattern=$1
    ls -1 $pattern 2>/dev/null | sed 's/^/    - /'
}

echo -e "${BLUE}📊 ANALYSE DE LA RACINE${NC}"
echo "========================"
echo ""

# Analyser les fichiers de test à la racine
echo -e "${YELLOW}🧪 Fichiers de test à la racine:${NC}"
TEST_COUNT=$(count_files "test-*.*")
echo "  Nombre: $TEST_COUNT fichiers"
if [ $TEST_COUNT -gt 0 ]; then
    echo -e "${RED}  ⚠️  Ces fichiers devraient être dans scripts/testing/${NC}"
    list_files "test-*.*"
fi
echo ""

# Analyser les fichiers de migration à la racine
echo -e "${YELLOW}🔄 Fichiers de migration à la racine:${NC}"
MIGRATE_COUNT=$(count_files "migrate-*.*")
MIGRATION_COUNT=$(count_files "migration-*.*")
CREATE_COUNT=$(count_files "create-*.js")
TOTAL_MIG=$((MIGRATE_COUNT + MIGRATION_COUNT + CREATE_COUNT))
echo "  Nombre: $TOTAL_MIG fichiers"
if [ $TOTAL_MIG -gt 0 ]; then
    echo -e "${RED}  ⚠️  Ces fichiers devraient être dans scripts/migration/${NC}"
    list_files "migrate-*.*"
    list_files "migration-*.*"
    list_files "create-*.js"
fi
echo ""

# Analyser les fichiers de déploiement à la racine
echo -e "${YELLOW}🚀 Fichiers de déploiement à la racine:${NC}"
START_COUNT=$(count_files "start-*.sh")
DOCKER_COUNT=$(count_files "docker-compose*.yml")
SERVER_COUNT=$(count_files "server*.js")
TOTAL_DEPLOY=$((START_COUNT + DOCKER_COUNT + SERVER_COUNT))
echo "  Nombre: $TOTAL_DEPLOY fichiers"
if [ $TOTAL_DEPLOY -gt 0 ]; then
    echo -e "${RED}  ⚠️  Ces fichiers devraient être dans scripts/deployment/${NC}"
    list_files "start-*.sh"
    list_files "stop-*.sh"
    list_files "docker-compose*.yml"
    list_files "server*.js"
fi
echo ""

# Analyser les fichiers utilitaires à la racine
echo -e "${YELLOW}🔧 Fichiers utilitaires à la racine:${NC}"
CHECK_COUNT=$(count_files "check-*.*")
DIAG_COUNT=$(count_files "diagnos*.*")
VALID_COUNT=$(count_files "validate-*.js")
VERIFY_COUNT=$(count_files "verify-*.sh")
TOTAL_UTIL=$((CHECK_COUNT + DIAG_COUNT + VALID_COUNT + VERIFY_COUNT))
echo "  Nombre: $TOTAL_UTIL fichiers"
if [ $TOTAL_UTIL -gt 0 ]; then
    echo -e "${RED}  ⚠️  Ces fichiers devraient être dans scripts/utilities/${NC}"
    list_files "check-*.*"
    list_files "diagnos*.*"
    list_files "validate-*.js"
    list_files "verify-*.sh"
fi
echo ""

# Analyser les fichiers de nettoyage à la racine
echo -e "${YELLOW}🧹 Fichiers de nettoyage à la racine:${NC}"
CLEANUP_COUNT=$(count_files "cleanup-*.sh")
CLEANUP_MD_COUNT=$(count_files "CLEANUP*.md")
CLEANUP_SH_COUNT=$(count_files "CLEANUP*.sh")
TOTAL_CLEANUP=$((CLEANUP_COUNT + CLEANUP_MD_COUNT + CLEANUP_SH_COUNT))
echo "  Nombre: $TOTAL_CLEANUP fichiers"
if [ $TOTAL_CLEANUP -gt 0 ]; then
    echo -e "${RED}  ⚠️  Ces fichiers devraient être dans scripts/cleanup/${NC}"
    list_files "cleanup-*.sh"
    list_files "CLEANUP*.md"
    list_files "CLEANUP*.sh"
fi
echo ""

# Analyser les fichiers de correction à la racine
echo -e "${YELLOW}🔨 Fichiers de correction à la racine:${NC}"
FIX_COUNT=$(count_files "fix-*.*")
echo "  Nombre: $FIX_COUNT fichiers"
if [ $FIX_COUNT -gt 0 ]; then
    echo -e "${RED}  ⚠️  Ces fichiers devraient être dans scripts/utilities/${NC}"
    list_files "fix-*.*"
fi
echo ""

# Analyser les fichiers d'archive à la racine
echo -e "${YELLOW}📦 Fichiers d'archive à la racine:${NC}"
BACKUP_COUNT=$(count_files "backup-*.sql")
echo "  Nombre: $BACKUP_COUNT fichiers"
if [ $BACKUP_COUNT -gt 0 ]; then
    echo -e "${RED}  ⚠️  Ces fichiers devraient être dans scripts/archive/${NC}"
    list_files "backup-*.sql"
fi
echo ""

echo "========================"
echo -e "${BLUE}📁 ANALYSE DES DOSSIERS SCRIPTS${NC}"
echo "========================"
echo ""

# Vérifier l'existence des sous-dossiers
echo -e "${GREEN}✅ Structure attendue dans /scripts/:${NC}"
for dir in testing migration deployment utilities cleanup archive; do
    if [ -d "scripts/$dir" ]; then
        COUNT=$(ls -1 scripts/$dir 2>/dev/null | wc -l)
        echo -e "  ${GREEN}✓${NC} scripts/$dir/ (${COUNT} fichiers)"
    else
        echo -e "  ${RED}✗${NC} scripts/$dir/ ${RED}(MANQUANT)${NC}"
    fi
done
echo ""

# Calculer le total des fichiers à organiser
TOTAL_TO_ORGANIZE=$((TEST_COUNT + TOTAL_MIG + TOTAL_DEPLOY + TOTAL_UTIL + TOTAL_CLEANUP + FIX_COUNT + BACKUP_COUNT))

echo "========================"
echo -e "${BLUE}📈 RÉSUMÉ${NC}"
echo "========================"
echo ""

if [ $TOTAL_TO_ORGANIZE -eq 0 ]; then
    echo -e "${GREEN}✅ Le repository est bien organisé !${NC}"
    echo "   Tous les scripts sont dans les bons dossiers."
else
    echo -e "${RED}⚠️  $TOTAL_TO_ORGANIZE fichiers doivent être organisés${NC}"
    echo ""
    echo "  Répartition:"
    [ $TEST_COUNT -gt 0 ] && echo "    • $TEST_COUNT fichiers de test"
    [ $TOTAL_MIG -gt 0 ] && echo "    • $TOTAL_MIG fichiers de migration"
    [ $TOTAL_DEPLOY -gt 0 ] && echo "    • $TOTAL_DEPLOY fichiers de déploiement"
    [ $TOTAL_UTIL -gt 0 ] && echo "    • $TOTAL_UTIL fichiers utilitaires"
    [ $TOTAL_CLEANUP -gt 0 ] && echo "    • $TOTAL_CLEANUP fichiers de nettoyage"
    [ $FIX_COUNT -gt 0 ] && echo "    • $FIX_COUNT fichiers de correction"
    [ $BACKUP_COUNT -gt 0 ] && echo "    • $BACKUP_COUNT fichiers d'archive"
    echo ""
    echo -e "${YELLOW}💡 Pour organiser automatiquement ces fichiers:${NC}"
    echo "   ./scripts/organize-repository.sh"
fi

echo ""
echo "========================"
echo -e "${BLUE}📝 AUTRES ÉLÉMENTS À VÉRIFIER${NC}"
echo "========================"
echo ""

# Vérifier les README multiples
README_COUNT=$(ls -1 README*.md 2>/dev/null | wc -l)
if [ $README_COUNT -gt 1 ]; then
    echo -e "${YELLOW}📄 Multiples README détectés ($README_COUNT fichiers):${NC}"
    list_files "README*.md"
    echo -e "  ${YELLOW}→ Considérer de consolider en un seul README.md${NC}"
    echo ""
fi

# Vérifier les fichiers de statut
STATUS_COUNT=$(ls -1 *STATUS*.md 2>/dev/null | wc -l)
if [ $STATUS_COUNT -gt 0 ]; then
    echo -e "${YELLOW}📊 Fichiers de statut détectés ($STATUS_COUNT fichiers):${NC}"
    list_files "*STATUS*.md"
    echo -e "  ${YELLOW}→ Considérer de les déplacer dans docs/status/${NC}"
    echo ""
fi

# Vérifier les gros fichiers SQL
echo -e "${YELLOW}💾 Gros fichiers SQL:${NC}"
find . -maxdepth 1 -name "*.sql" -size +1M -exec ls -lh {} \; 2>/dev/null | awk '{print "    " $9 " (" $5 ")"}'
if [ $? -eq 0 ]; then
    echo -e "  ${YELLOW}→ Considérer de les compresser ou déplacer dans scripts/archive/${NC}"
fi
echo ""

echo "========================"
echo "✨ Analyse terminée"
echo "========================"
