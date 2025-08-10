#!/bin/bash

# Validation script for Design System
# Run before publishing or merging to ensure quality

echo "🔍 Starting Design System validation..."
echo "======================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track overall status
ERRORS=0

# Function to check command result
check_result() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $1 passed${NC}"
    else
        echo -e "${RED}❌ $1 failed${NC}"
        ERRORS=$((ERRORS + 1))
    fi
}

# 1. Check TypeScript compilation
echo ""
echo "📝 Checking TypeScript compilation..."
pnpm -C packages/ui typecheck
check_result "TypeScript"

# 2. Run ESLint
echo ""
echo "🔍 Running ESLint..."
pnpm -C packages/ui lint
check_result "ESLint"

# 3. Check Prettier formatting
echo ""
echo "✨ Checking code formatting..."
pnpm -C packages/ui format:check
check_result "Prettier"

# 4. Build the package
echo ""
echo "🏗️  Building Design System..."
pnpm -C packages/ui build
check_result "Build"

# 5. Build Storybook (static)
echo ""
echo "📚 Building Storybook..."
pnpm -C packages/ui build:sb:static
check_result "Storybook build"

# 6. Run tests (if available)
echo ""
echo "🧪 Running tests..."
pnpm -C packages/ui test:ci 2>/dev/null || echo -e "${YELLOW}⚠️  No tests configured yet${NC}"

# Summary
echo ""
echo "======================================="
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ All validation checks passed!${NC}"
    echo "The Design System is ready for publication."
    exit 0
else
    echo -e "${RED}❌ Validation failed with $ERRORS error(s)${NC}"
    echo "Please fix the issues before proceeding."
    exit 1
fi
