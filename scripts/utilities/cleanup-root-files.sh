#!/bin/bash

# Script pour nettoyer les fichiers obsolètes et temporaires de la racine
# Créé le 24 décembre 2024

echo "🧹 Nettoyage des fichiers obsolètes de la racine"
echo "================================================"

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Créer un dossier d'archive si nécessaire
ARCHIVE_DIR="docs/archive/old-root-files"
mkdir -p "$ARCHIVE_DIR"

echo ""
echo -e "${YELLOW}📁 Création du dossier d'archive:${NC} $ARCHIVE_DIR"

# Fonction pour archiver les fichiers
archive_file() {
    local file=$1
    local reason=$2
    
    if [ -f "$file" ]; then
        echo -e "${GREEN}  ✓${NC} Archivage de ${YELLOW}$file${NC} - Raison: $reason"
        git mv "$file" "$ARCHIVE_DIR/" 2>/dev/null || mv "$file" "$ARCHIVE_DIR/"
        return 0
    fi
    return 1
}

# Compteurs
TOTAL=0
ARCHIVED=0

echo ""
echo "📋 Analyse des fichiers à nettoyer..."
echo ""

# Fichiers obsolètes de documentation
echo -e "${YELLOW}📄 Fichiers de documentation obsolètes:${NC}"
FILES_TO_ARCHIVE=(
    "README-NEW.md"
    "CLEANUP_STATUS_FINAL.md"
    "QUICK_ORGANIZATION_GUIDE.md"
    "REPOSITORY_ORGANIZATION_PLAN.md"
    "CLEANUP_NOW.sh"
    "ARCHIVING_INSTRUCTIONS.md"
    "fix-all-mcp-errors.md"
    "fix-directus-mcp.md"
    "fix-github-token.md"
    "github-diagnostic-report.md"
    "mcp-status-summary.md"
    "mcp-status-update.md"
)

for file in "${FILES_TO_ARCHIVE[@]}"; do
    ((TOTAL++))
    if archive_file "$file" "Documentation obsolète"; then
        ((ARCHIVED++))
    fi
done

echo ""
echo -e "${YELLOW}📊 Fichiers de rapport et logs:${NC}"
# Fichiers de rapport
REPORT_FILES=(
    "migration-final-report.json"
    "migration-report-admin.json"
    "migration-report-direct.json"
    "migration-report-final.json"
    "migration-report-final.txt"
    "migration-report-jmd.json"
    "owner-company-report.json"
    "validation-report.json"
    "test-complete-results.json"
    "test-report-phase1.md"
    "diagnostic-docker.txt"
)

for file in "${REPORT_FILES[@]}"; do
    ((TOTAL++))
    if archive_file "$file" "Rapport/log obsolète"; then
        ((ARCHIVED++))
    fi
done

echo ""
echo -e "${YELLOW}🗄️ Fichiers SQL de backup:${NC}"
# Fichiers SQL de backup
SQL_FILES=(
    "backup-before-migration-20250808-185754.sql"
    "fix-missing-fields.sql"
)

for file in "${SQL_FILES[@]}"; do
    ((TOTAL++))
    if archive_file "$file" "Backup SQL ancien"; then
        ((ARCHIVED++))
    fi
done

echo ""
echo -e "${YELLOW}🔧 Scripts obsolètes à archiver:${NC}"
# Scripts obsolètes dans la racine qui ont été remplacés
OLD_SCRIPTS=(
    "reorganize-repo.sh"
    "fix-everything.sh"
    "fix-and-publish.sh"
    "test-e2e.sh"
    "quick-score-improvement.sh"
)

for file in "${OLD_SCRIPTS[@]}"; do
    ((TOTAL++))
    if archive_file "$file" "Script obsolète"; then
        ((ARCHIVED++))
    fi
done

echo ""
echo -e "${YELLOW}📝 Nettoyage des fichiers temporaires:${NC}"
# Supprimer les fichiers temporaires (sans archiver)
TEMP_FILES=(
    ".ds-to-remove"
    ".best-token"
    ".jmd-token"
    "server.pid"
)

for file in "${TEMP_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${RED}  ✗${NC} Suppression de ${YELLOW}$file${NC}"
        rm -f "$file"
    fi
done

# Créer un README dans le dossier d'archive
cat > "$ARCHIVE_DIR/README.md" << 'EOF'
# 📦 Fichiers Archivés de la Racine

Ce dossier contient les anciens fichiers de la racine du projet qui ont été archivés pour nettoyer le repository.

## 📅 Date d'archivage
24 décembre 2024

## 📋 Catégories de fichiers archivés

### Documentation obsolète
- Anciens README et guides
- Instructions de nettoyage
- Plans d'organisation

### Rapports et logs
- Rapports de migration
- Résultats de tests
- Diagnostics système

### Backups SQL
- Sauvegardes de base de données
- Scripts SQL de correction

### Scripts obsolètes
- Scripts remplacés par de nouvelles versions
- Scripts de migration terminés

## ⚠️ Note
Ces fichiers sont conservés pour référence historique uniquement.
Ne pas utiliser pour la production.
EOF

echo ""
echo "================================================"
echo -e "${GREEN}✅ Nettoyage terminé !${NC}"
echo ""
echo "📊 Résumé:"
echo "  - Total de fichiers analysés: $TOTAL"
echo "  - Fichiers archivés: $ARCHIVED"
echo "  - Dossier d'archive: $ARCHIVE_DIR"
echo ""
echo -e "${YELLOW}💡 Prochaines étapes:${NC}"
echo "  1. Vérifier les fichiers archivés"
echo "  2. Exécuter le script d'organisation: ./scripts/organize-root-scripts.sh"
echo "  3. Faire un commit des changements:"
echo "     git add -A"
echo "     git commit -m 'chore: clean up obsolete files from root directory'"
echo "     git push"
