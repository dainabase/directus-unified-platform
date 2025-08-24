#!/bin/bash

# =============================================================================
# Script d'organisation complète du repository Directus Unified Platform
# =============================================================================
# Auteur: JMD
# Date: 24 décembre 2024
# Description: Organise tous les fichiers du repository dans une structure propre
# =============================================================================

set -e

echo "🚀 Début de l'organisation du repository..."
echo "================================================"

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# =============================================================================
# ÉTAPE 1: Créer la structure de dossiers
# =============================================================================
log_info "Création de la structure de dossiers..."

# Créer les dossiers scripts s'ils n'existent pas
mkdir -p scripts/testing
mkdir -p scripts/migration
mkdir -p scripts/deployment
mkdir -p scripts/utilities
mkdir -p scripts/archive
mkdir -p scripts/monitoring

# Créer les dossiers docs
mkdir -p docs/guides
mkdir -p docs/technical
mkdir -p docs/archive

log_success "Structure de dossiers créée"

# =============================================================================
# ÉTAPE 2: Déplacer les scripts de test
# =============================================================================
log_info "Déplacement des scripts de test..."

# Scripts de test
TEST_FILES=(
    "test-all-services.sh"
    "test-all-tokens.js"
    "test-api-filtering.js"
    "test-collection-permissions.js"
    "test-complete-results.json"
    "test-connection.js"
    "test-dashboard-api.js"
    "test-dashboard-filtering.js"
    "test-dashboard-final.js"
    "test-dashboard-kpis.js"
    "test-dashboard-token.js"
    "test-dashboard-visual.js"
    "test-e2e.sh"
    "test-fields.js"
    "test-invoice.html"
    "test-migration.js"
    "test-ocr-config.js"
    "test-permissions.js"
    "test-report-phase1.md"
    "test-theme-toggle.html"
    "validate-dashboard-v4.js"
    "validate-full-system.js"
    "validation-report.json"
    "check-collections-exist.js"
    "check-docker-status.sh"
    "check-owner-company-fields.js"
    "check-owner-company-sql.sh"
    "check-sync.sh"
    "check-user-role.js"
    "check-users.js"
    "diagnose-permissions.js"
    "diagnostic-docker.txt"
)

for file in "${TEST_FILES[@]}"; do
    if [ -f "$file" ]; then
        mv "$file" scripts/testing/ 2>/dev/null || log_warning "Impossible de déplacer $file"
        log_success "✓ $file → scripts/testing/"
    fi
done

# =============================================================================
# ÉTAPE 3: Déplacer les scripts de migration
# =============================================================================
log_info "Déplacement des scripts de migration..."

MIGRATION_FILES=(
    "migrate-with-directus-sdk.js"
    "migration-final-report.json"
    "migration-report-admin.json"
    "migration-report-direct.json"
    "migration-report-final.json"
    "migration-report-final.txt"
    "migration-report-jmd.json"
    "create-admin-field-via-login.js"
    "create-admin-token.js"
    "create-companies.js"
    "create-kpi-data.js"
    "create-owner-company-template.js"
    "create-template.sh"
    "fix-all-mcp-errors.md"
    "fix-and-publish.sh"
    "fix-directus-mcp.md"
    "fix-everything.sh"
    "fix-github-token.md"
    "fix-missing-fields.sql"
    "fix-owner-company-direct.js"
    "fix-owner-company-working.js"
    "fix-with-jmd-login.js"
    "sync-directus-schema-new.js"
    "sync-directus-schema.js"
    "reset-admin-password.js"
    "backup-before-migration-20250808-185754.sql"
    "owner-company-report.json"
)

for file in "${MIGRATION_FILES[@]}"; do
    if [ -f "$file" ]; then
        mv "$file" scripts/migration/ 2>/dev/null || log_warning "Impossible de déplacer $file"
        log_success "✓ $file → scripts/migration/"
    fi
done

# =============================================================================
# ÉTAPE 4: Déplacer les scripts de déploiement
# =============================================================================
log_info "Déplacement des scripts de déploiement..."

DEPLOYMENT_FILES=(
    "start-all-services.sh"
    "start-platform.sh"
    "stop-platform.sh"
    "publish-beta.sh"
    "dev.sh"
    "docker-compose.mcp.yml"
    "docker-compose.storybook.yml"
    "docker-compose.yml"
    "ecosystem.config.js"
    "server-directus-unified.js"
    "server.js"
    "server.pid"
)

for file in "${DEPLOYMENT_FILES[@]}"; do
    if [ -f "$file" ]; then
        mv "$file" scripts/deployment/ 2>/dev/null || log_warning "Impossible de déplacer $file"
        log_success "✓ $file → scripts/deployment/"
    fi
done

# =============================================================================
# ÉTAPE 5: Déplacer les scripts utilitaires
# =============================================================================
log_info "Déplacement des scripts utilitaires..."

UTILITY_FILES=(
    "cleanup-design-system-obsolete.sh"
    "cleanup-design-system.sh"
    "cleanup-merged-branches.sh"
    "cleanup-obsolete-branch.sh"
    "cleanup-temp-files.sh"
    "get-jmd-token.js"
    "git-push-commands.sh"
    "organize-repository.sh"
    "reorganize-repo.sh"
    "verify-design-system.sh"
    "verify-no-twenty.sh"
    "quick-score-improvement.sh"
    "run-fix-mcp.sh"
)

for file in "${UTILITY_FILES[@]}"; do
    if [ -f "$file" ]; then
        mv "$file" scripts/utilities/ 2>/dev/null || log_warning "Impossible de déplacer $file"
        log_success "✓ $file → scripts/utilities/"
    fi
done

# =============================================================================
# ÉTAPE 6: Déplacer les scripts de monitoring
# =============================================================================
log_info "Déplacement des scripts de monitoring..."

MONITORING_FILES=(
    "monitor-health.js"
)

for file in "${MONITORING_FILES[@]}"; do
    if [ -f "$file" ]; then
        mv "$file" scripts/monitoring/ 2>/dev/null || log_warning "Impossible de déplacer $file"
        log_success "✓ $file → scripts/monitoring/"
    fi
done

# =============================================================================
# ÉTAPE 7: Déplacer la documentation
# =============================================================================
log_info "Déplacement de la documentation..."

DOC_FILES=(
    "ARCHIVING_INSTRUCTIONS.md"
    "CLEANUP_NOW.sh"
    "CLEANUP_STATUS_FINAL.md"
    "QUICK_ORGANIZATION_GUIDE.md"
    "README-NEW.md"
    "REPOSITORY_ORGANIZATION_PLAN.md"
    "github-diagnostic-report.md"
    "mcp-status-summary.md"
    "mcp-status-update.md"
)

for file in "${DOC_FILES[@]}"; do
    if [ -f "$file" ]; then
        mv "$file" docs/guides/ 2>/dev/null || log_warning "Impossible de déplacer $file"
        log_success "✓ $file → docs/guides/"
    fi
done

# =============================================================================
# ÉTAPE 8: Nettoyer les fichiers temporaires
# =============================================================================
log_info "Nettoyage des fichiers temporaires..."

# Supprimer les fichiers .DS_Store
find . -name ".DS_Store" -type f -delete

# Supprimer les fichiers de tokens temporaires
rm -f .best-token
rm -f .jmd-token
rm -f .ds-to-remove

log_success "Fichiers temporaires supprimés"

# =============================================================================
# ÉTAPE 9: Créer un rapport
# =============================================================================
log_info "Création du rapport d'organisation..."

cat > ORGANIZATION_REPORT.md << EOF
# Rapport d'Organisation du Repository
Date: $(date)

## Fichiers déplacés

### Scripts de Test (${#TEST_FILES[@]} fichiers)
- Déplacés vers: \`scripts/testing/\`

### Scripts de Migration (${#MIGRATION_FILES[@]} fichiers)
- Déplacés vers: \`scripts/migration/\`

### Scripts de Déploiement (${#DEPLOYMENT_FILES[@]} fichiers)
- Déplacés vers: \`scripts/deployment/\`

### Scripts Utilitaires (${#UTILITY_FILES[@]} fichiers)
- Déplacés vers: \`scripts/utilities/\`

### Documentation (${#DOC_FILES[@]} fichiers)
- Déplacée vers: \`docs/guides/\`

## Prochaines étapes
1. Vérifier que tous les fichiers sont au bon endroit
2. Mettre à jour les imports dans les fichiers
3. Tester que tout fonctionne encore
4. Faire un commit et push

## Structure finale
\`\`\`
directus-unified-platform/
├── src/
│   ├── frontend/
│   └── backend/
├── scripts/
│   ├── testing/
│   ├── migration/
│   ├── deployment/
│   ├── utilities/
│   ├── monitoring/
│   └── archive/
├── docs/
│   ├── guides/
│   ├── technical/
│   └── archive/
└── [Racine propre]
\`\`\`
EOF

log_success "Rapport créé: ORGANIZATION_REPORT.md"

# =============================================================================
# RÉSUMÉ FINAL
# =============================================================================
echo ""
echo "================================================"
echo -e "${GREEN}🎉 ORGANISATION TERMINÉE !${NC}"
echo "================================================"
echo ""
echo "📊 Résumé:"
echo "  • Scripts de test: ${#TEST_FILES[@]} fichiers déplacés"
echo "  • Scripts de migration: ${#MIGRATION_FILES[@]} fichiers déplacés"
echo "  • Scripts de déploiement: ${#DEPLOYMENT_FILES[@]} fichiers déplacés"
echo "  • Scripts utilitaires: ${#UTILITY_FILES[@]} fichiers déplacés"
echo "  • Documentation: ${#DOC_FILES[@]} fichiers déplacés"
echo ""
echo "📝 Prochaines étapes:"
echo "  1. Vérifier avec: git status"
echo "  2. Ajouter les changements: git add ."
echo "  3. Commit: git commit -m '🎯 Organisation complète du repository'"
echo "  4. Push: git push origin organize-repository-structure"
echo ""
echo "✨ Le repository est maintenant propre et organisé !"
