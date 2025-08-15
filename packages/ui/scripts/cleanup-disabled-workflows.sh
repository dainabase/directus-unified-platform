#!/bin/bash
# Cleanup script for disabled workflows
# Date: 2025-08-15
# Purpose: Remove all disabled and duplicate workflows

echo "🧹 Starting workflow cleanup..."
echo "================================"

# List of workflows to delete (all are disabled and duplicates)
WORKFLOWS_TO_DELETE=(
  ".github/workflows/.gitkeep"
  ".github/workflows/EMERGENCY_AUDIT.sh"
  ".github/workflows/MAINTENANCE_LOG.md"
  ".github/workflows/auto-fix-deps.yml"
  ".github/workflows/auto-publish-v040.yml"
  ".github/workflows/fix-and-publish.yml"
  ".github/workflows/force-publish.yml"
  ".github/workflows/manual-publish.yml"
  ".github/workflows/npm-monitor.yml"
  ".github/workflows/publish-manual.yml"
  ".github/workflows/publish-ui.yml"
  ".github/workflows/quick-npm-publish.yml"
  ".github/workflows/simple-publish.yml"
  ".github/workflows/ui-100-coverage-publish.yml"
)

echo "📋 Workflows to delete: ${#WORKFLOWS_TO_DELETE[@]}"
echo ""

# These files are already handled (just for reference)
echo "✅ Already handled:"
echo "- .gitkeep (emptied)"
echo "- EMERGENCY_AUDIT.sh (moved to scripts)"
echo "- MAINTENANCE_LOG.md (moved to docs)"
echo ""

echo "🔴 Still to delete (disabled workflows):"
for workflow in "${WORKFLOWS_TO_DELETE[@]}"; do
  if [[ $workflow == *".yml" ]]; then
    echo "- $(basename $workflow)"
  fi
done

echo ""
echo "================================"
echo "Run this script with GitHub Actions to clean up workflows"
echo "Or use the GitHub API to delete each file individually"
