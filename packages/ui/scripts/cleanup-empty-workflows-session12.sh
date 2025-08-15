#!/bin/bash
# cleanup-empty-workflows-session12.sh
# Script to remove empty workflow files and non-workflow files from .github/workflows/

echo "🧹 Starting cleanup of .github/workflows directory..."

# List of empty workflow files to remove
EMPTY_WORKFLOWS=(
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

# List of non-workflow files to remove
NON_WORKFLOWS=(
  ".github/workflows/.gitkeep"
  ".github/workflows/EMERGENCY_AUDIT.sh"
  ".github/workflows/MAINTENANCE_LOG.md"
)

# Remove empty workflow files
echo "📝 Removing 11 empty workflow files..."
for file in "${EMPTY_WORKFLOWS[@]}"; do
  if [ -f "$file" ]; then
    rm -f "$file"
    echo "  ✅ Removed: $file"
  else
    echo "  ⚠️ Not found: $file"
  fi
done

# Remove non-workflow files
echo "📝 Removing 3 non-workflow files..."
for file in "${NON_WORKFLOWS[@]}"; do
  if [ -f "$file" ]; then
    rm -f "$file"
    echo "  ✅ Removed: $file"
  else
    echo "  ⚠️ Not found: $file"
  fi
done

echo "✅ Cleanup completed!"

# List remaining files in the workflows directory
echo ""
echo "📊 Remaining files in .github/workflows/:"
ls -la .github/workflows/ | grep -v "^total" | grep -v "^d" | wc -l
echo "files found"
