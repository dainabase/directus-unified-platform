#!/bin/bash

# Script de nettoyage du repository - 11/08/2025
# Supprime tous les fichiers obsolètes tout en conservant le design system v1.0.0-beta.1

echo "🧹 Début du nettoyage du repository..."
echo "Conservation de @dainabase/ui v1.0.0-beta.1"

# Fichiers de documentation temporaires à supprimer
echo "Suppression des fichiers de documentation temporaires..."
rm -f API_CONNECTION_SUCCESS.md
rm -f AUDIT-CORRECTION-EXPLICATION.md
rm -f CLARIFICATION-DEUX-AUDITS.md
rm -f CLAUDE_CODE_ANALYSIS.md
rm -f CLEANUP_ANALYSIS.md
rm -f CLEANUP_BRANCH_PLAN.md
rm -f CLEANUP_EXECUTION_STATUS.md
rm -f CLEANUP_REPORT.md
rm -f CLEANUP_REPORT_2025-08-11.md
rm -f COLLECTIONS_STATUS.md
rm -f COMMIT_HISTORY.md
rm -f CONTEXT-DESIGN-SYSTEM-11-08-2025.md
rm -f CONTEXT-FINAL-CORRIGE-11-08-2025.md
rm -f CONTEXT-REPRISE-11-08-2025-0135.md
rm -f CONTEXTE-REPRISE-SESSION-11-08-2025-1040.md
rm -f CORS_SOLUTION_GUIDE.md
rm -f CSS_CONFLICTS_TROUBLESHOOTING.md
rm -f DASHBOARD-CEO-README.md
rm -f DASHBOARD-V3-README.md
rm -f DASHBOARD_CEO_HOTFIX.md
rm -f DASHBOARD_CEO_IMPLEMENTATION.md
rm -f DASHBOARD_DEMO_MODE.md
rm -f DASHBOARD_REFACTORING_COMPLETE.md
rm -f DASHBOARD_USER_GUIDE.md
rm -f DASHBOARD_V3_PREMIUM_COMPLETE.md
rm -f DASHBOARD_V3_PREMIUM_SETUP.md
rm -f DASHBOARD_V4_STATUS.md
rm -f DASHBOARD_V4_VALIDATION.json
rm -f DASHBOARD_VISUAL_COMPARISON.md
rm -f DEPLOYMENT_REPORT.md
rm -f DESIGN_SYSTEM_INTEGRATION.md
rm -f DEVELOPER_WORKFLOW_GUIDE.md
rm -f DIRECTUS_RELATIONS_STATUS.md
rm -f DONNEES_TEST_CREEES.md
rm -f FINAL_DOCUMENTATION_INDEX.md
rm -f FINAL_REPORT_V040.md
rm -f GET_DIRECTUS_TOKEN.md
rm -f GITHUB_COMPLETE_DOCUMENTATION.md
rm -f GITHUB_DASHBOARD_EVOLUTION.md
rm -f GITHUB_RELEASE_v1.0.0-beta.1.md
rm -f GITHUB_SESSION_6_DOCUMENTATION.md
rm -f GUIDE-AJOUT-OWNER-COMPANY.md
rm -f GUIDE_SIMPLE.md
rm -f INSTALLATION_PM2.md
rm -f INTEGRATIONS_STATUS.md
rm -f MCP_CONFIG_BACKUP.json
rm -f MCP_DIRECTUS_FINAL_CONFIG.md
rm -f MIGRATION-OWNER-COMPANY-COMPLETE.md
rm -f MIGRATION_STATUS.md
rm -f OWNER_COMPANY_STATUS.md
rm -f PM2_PERSISTENT_SERVER_SOLUTION.md
rm -f POINT-SITUATION-08-08-2024.md
rm -f PROMPT-REPRISE-RAPIDE.md
rm -f PUBLICATION_STATUS.md
rm -f RAPPORT-SITUATION-OWNER-COMPANY.md
rm -f README_DASHBOARD_V4.md
rm -f RELEASE_ACTIONS_NOW.md
rm -f RELEASE_COPY_PASTE.md
rm -f RELEASE_NOTES_v1.0.0-beta.1.md
rm -f RELEASE_NOW.sh
rm -f REORGANIZATION_MAP.md
rm -f RESTORE-BRANCHES-NOW.sh
rm -f RESTRUCTURATION_COMPLETE.md
rm -f REVOLUT_CLEANUP_REPORT.md
rm -f SAUVEGARDE_DASHBOARD_V4.md
rm -f SERVER_PERSISTENCE_ISSUE.md
rm -f SERVEUR_PERSISTANT.md
rm -f SOLUTION-SQL-OWNER-COMPANY.md
rm -f TEST_API_CONNECTION.md
rm -f TRIGGER_PUBLISH_V040
rm -f TROUBLESHOOTING_GUIDE.md
rm -f fix-all-mcp-errors.md
rm -f fix-directus-mcp.md
rm -f fix-github-token.md
rm -f github-diagnostic-report.md

# Scripts obsolètes
echo "Suppression des scripts obsolètes..."
rm -f add-owner-company-final.js
rm -f add-owner-company-simple-format.js
rm -f add-owner-company-simplified.js
rm -f add-owner-company.sql
rm -f check-collections-exist.js
rm -f check-docker-status.sh
rm -f check-owner-company-fields.js
rm -f check-owner-company-sql.sh
rm -f check-sync.sh
rm -f check-user-role.js
rm -f check-users.js
rm -f cleanup-design-system.sh
rm -f cleanup-merged-branches.sh
rm -f cleanup-obsolete-branch.sh
rm -f create-admin-field-via-login.js
rm -f create-admin-token.js
rm -f create-companies.js
rm -f create-kpi-data.js
rm -f create-owner-company-template.js
rm -f diagnose-permissions.js
rm -f diagnostic-docker.txt
rm -f fix-and-publish.sh
rm -f fix-everything.sh
rm -f fix-missing-fields.sql
rm -f fix-owner-company-direct.js
rm -f fix-owner-company-working.js
rm -f fix-with-jmd-login.js
rm -f get-jmd-token.js
rm -f git-push-commands.sh

# Fichiers de backup
echo "Suppression des backups..."
rm -f backup-before-migration-20250808-185754.sql
rm -rf dashboard-backup-before-import-20250803/

# Tokens temporaires
echo "Suppression des tokens temporaires..."
rm -f .best-token
rm -f .jmd-token

# Dossiers obsolètes
echo "Suppression des dossiers obsolètes..."
rm -rf audit-results/
rm -rf QUICK/
rm -rf STATUS/
rm -rf directus-template/

# Nettoyer les dossiers .ds et .workspace s'ils sont vides ou obsolètes
if [ -d ".ds" ]; then
    echo "Vérification du dossier .ds..."
    if [ -z "$(ls -A .ds)" ]; then
        rm -rf .ds
        echo "Dossier .ds vide supprimé"
    fi
fi

if [ -d ".workspace" ]; then
    echo "Vérification du dossier .workspace..."
    if [ -z "$(ls -A .workspace)" ]; then
        rm -rf .workspace
        echo "Dossier .workspace vide supprimé"
    fi
fi

echo ""
echo "✅ Nettoyage terminé !"
echo "📦 Design System @dainabase/ui v1.0.0-beta.1 conservé dans packages/ui/"
echo ""
echo "Fichiers à conserver :"
echo "- README.md"
echo "- CHANGELOG.md"
echo "- CONTRIBUTING.md"
echo "- GETTING_STARTED.md"
echo "- CLEANUP_LOG.md (nouveau - trace du nettoyage)"
echo "- packages/ui/ (Design System v1.0.0-beta.1)"
echo "- apps/"
echo "- backend/"
echo "- frontend/"
echo "- config/"
echo "- docs/"
echo ""
echo "Prochaine étape : git add . && git commit -m 'cleanup: remove obsolete files, keep only v1.0.0-beta.1'"
