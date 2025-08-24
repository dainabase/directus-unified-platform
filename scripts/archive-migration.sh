#!/bin/bash

# Script de migration des fichiers .md vers docs/archive/
# Date: 23 août 2025

echo "🧹 Starting cleanup migration..."

# Fonction pour créer un fichier de redirection
create_redirect() {
    local file=$1
    local destination=$2
    echo "# Fichier déplacé / File moved" > "$file"
    echo "" >> "$file"
    echo "Ce fichier a été archivé dans : \`$destination\`" >> "$file"
    echo "" >> "$file"
    echo "This file has been archived to: \`$destination\`" >> "$file"
}

# Catégorisation des fichiers
CONTEXT_FILES=(
    "CONTEXT-DESIGN-SYSTEM-11-08-2025.md"
    "CONTEXT-FINAL-CORRIGE-11-08-2025.md"
    "CONTEXT-REPRISE-11-08-2025-0135.md"
    "CONTEXTE-REPRISE-SESSION-11-08-2025-1040.md"
    "CONTEXT_PROMPT_20250812_0840.md"
    "CONTEXT_PROMPT_20250812_0852.md"
    "CONTEXT_PROMPT_20250812_0922.md"
    "CONTEXT_PROMPT_20250812_0943.md"
    "CONTEXT_PROMPT_CRITICAL_20250812_0910.md"
    "CONTEXT_PROMPT_DESIGN_SYSTEM.md"
    "CONTEXT_PROMPT_PRODUCTION_READY_20250812.md"
    "CONTEXT_PROMPT_SESSION_4.md"
    "CONTEXT_PROMPT_SESSION_5.md"
    "CONTEXT_PROMPT_ULTRA_DETAILED.md"
    "PROMPT_CONTEXTE_SESSION_15.md"
)

SESSION_FILES=(
    "SESSION_13_CONTEXT_PROMPT.md"
    "SESSION_15_CONTEXT_PROMPT.md"
    "SESSION_15_CONTEXT_PROMPT.txt"
    "SESSION_25_PROMPT_CONTEXT.md"
    "SESSION_38_CLEANUP_COMPLETE.md"
    "SESSION_39_CONTEXT.md"
    "SESSION_39_VERIFICATION_REPORT.md"
    "SESSION_40_CONTEXT_PROMPT.md"
    "SESSION_REPORT_20250812_0921.md"
    "SESSION_REPORT_20250812_0934.md"
    "SESSION_REPORT_20250812_0942.md"
    "SESSION_REPORT_DOCUMENTATION_20250812_0955.md"
)

CLEANUP_REPORTS=(
    "CLEANUP_ANALYSIS.md"
    "CLEANUP_BRANCH_PLAN.md"
    "CLEANUP_EXECUTION_STATUS.md"
    "CLEANUP_REPORT.md"
    "CLEANUP_REPORT_2025-08-11.md"
    "CLEANUP_SCRIPT.md"
    "CLEANUP_STATUS.md"
    "FINAL_CLEANUP_STATUS.md"
    "AUDIT-CORRECTION-EXPLICATION.md"
    "CLARIFICATION-DEUX-AUDITS.md"
)

DASHBOARD_FILES=(
    "DASHBOARD-CEO-README.md"
    "DASHBOARD-V3-README.md"
    "DASHBOARD_CEO_HOTFIX.md"
    "DASHBOARD_CEO_IMPLEMENTATION.md"
    "DASHBOARD_DEMO_MODE.md"
    "DASHBOARD_REFACTORING_COMPLETE.md"
    "DASHBOARD_USER_GUIDE.md"
    "DASHBOARD_V3_PREMIUM_COMPLETE.md"
    "DASHBOARD_V3_PREMIUM_SETUP.md"
    "DASHBOARD_V4_STATUS.md"
    "DASHBOARD_V4_VALIDATION.json"
    "DASHBOARD_VISUAL_COMPARISON.md"
    "SAUVEGARDE_DASHBOARD_V4.md"
)

GUIDE_FILES=(
    "BUNDLE_OPTIMIZATION_GUIDE.md"
    "CHROMATIC_SETUP_GUIDE.md"
    "CORS_SOLUTION_GUIDE.md"
    "CSS_CONFLICTS_TROUBLESHOOTING.md"
    "DEVELOPER_WORKFLOW_GUIDE.md"
    "GETTING_STARTED.md"
    "GET_DIRECTUS_TOKEN.md"
    "GUIDE-AJOUT-OWNER-COMPANY.md"
    "GUIDE_SIMPLE.md"
    "MUTATION_TESTING_GUIDE.md"
    "NEXT_ACTIONS_GUIDE.md"
    "QUICK_START_GUIDE.md"
    "TROUBLESHOOTING_GUIDE.md"
)

MIGRATION_FILES=(
    "MIGRATION-OWNER-COMPANY-COMPLETE.md"
    "MIGRATION_STATUS.md"
    "OWNER_COMPANY_STATUS.md"
    "RAPPORT-SITUATION-OWNER-COMPANY.md"
    "SOLUTION-SQL-OWNER-COMPANY.md"
    "add-owner-company-final.js"
    "add-owner-company-simple-format.js"
    "add-owner-company-simplified.js"
    "add-owner-company.sql"
)

# Statistiques
TOTAL_FILES=0
MOVED_FILES=0

echo "📊 Files to archive:"
echo "  - Context files: ${#CONTEXT_FILES[@]}"
echo "  - Session files: ${#SESSION_FILES[@]}"
echo "  - Cleanup reports: ${#CLEANUP_REPORTS[@]}"
echo "  - Dashboard files: ${#DASHBOARD_FILES[@]}"
echo "  - Guide files: ${#GUIDE_FILES[@]}"
echo "  - Migration files: ${#MIGRATION_FILES[@]}"

# Total
TOTAL_FILES=$((${#CONTEXT_FILES[@]} + ${#SESSION_FILES[@]} + ${#CLEANUP_REPORTS[@]} + ${#DASHBOARD_FILES[@]} + ${#GUIDE_FILES[@]} + ${#MIGRATION_FILES[@]}))
echo "  📦 Total: $TOTAL_FILES files"

echo ""
echo "✅ Migration script ready!"
echo "Run with appropriate GitHub tools to move files."
