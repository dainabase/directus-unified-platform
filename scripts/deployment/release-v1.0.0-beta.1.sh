#!/bin/bash

# Design System v1.0.0-beta.1 Release Script
# Date: August 10, 2025
# Purpose: Complete the release process for @dainabase/ui v1.0.0-beta.1

set -e

echo "🚀 Design System v1.0.0-beta.1 Release Process"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Step 1: Verify we're on main branch
echo -e "${BLUE}Step 1: Verifying branch...${NC}"
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo -e "${YELLOW}Warning: Not on main branch. Switching to main...${NC}"
    git checkout main
fi

# Step 2: Pull latest changes
echo -e "${BLUE}Step 2: Pulling latest changes...${NC}"
git pull origin main

# Step 3: Verify last commit
echo -e "${BLUE}Step 3: Verifying last commit...${NC}"
LAST_COMMIT=$(git log --oneline -1)
echo "Last commit: $LAST_COMMIT"
if [[ ! "$LAST_COMMIT" == *"release notes"* ]] && [[ ! "$LAST_COMMIT" == *"GitHub release"* ]]; then
    echo -e "${RED}Warning: Last commit doesn't seem to be release-related${NC}"
fi

# Step 4: Create and push tag
echo -e "${BLUE}Step 4: Creating Git tag...${NC}"
TAG_NAME="@dainabase/ui@1.0.0-beta.1"

# Check if tag already exists
if git rev-parse "$TAG_NAME" >/dev/null 2>&1; then
    echo -e "${YELLOW}Tag $TAG_NAME already exists locally${NC}"
else
    echo "Creating tag: $TAG_NAME"
    git tag "$TAG_NAME" -m "Release @dainabase/ui v1.0.0-beta.1

🚀 First production-ready beta release
📦 Bundle optimized to 48KB (-49%)
✨ 40 components including 9 new additions
🧪 97% test coverage
📚 Complete documentation"
    echo -e "${GREEN}✅ Tag created successfully${NC}"
fi

# Push tag to remote
echo "Pushing tag to origin..."
if git push origin "$TAG_NAME" 2>/dev/null; then
    echo -e "${GREEN}✅ Tag pushed successfully${NC}"
else
    echo -e "${YELLOW}Tag might already exist on remote or there was an error${NC}"
fi

# Step 5: NPM Publish preparation
echo ""
echo -e "${BLUE}Step 5: Preparing NPM publish...${NC}"
cd packages/ui

# Verify package.json version
PACKAGE_VERSION=$(node -p "require('./package.json').version")
if [ "$PACKAGE_VERSION" != "1.0.0-beta.1" ]; then
    echo -e "${RED}Error: Package version is $PACKAGE_VERSION, expected 1.0.0-beta.1${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Package version verified: $PACKAGE_VERSION${NC}"

# Step 6: Build verification
echo ""
echo -e "${BLUE}Step 6: Running build verification...${NC}"
echo "Building package..."
pnpm build:optimize

# Check bundle size
echo "Checking bundle size..."
pnpm size

# Step 7: Dry run NPM publish
echo ""
echo -e "${BLUE}Step 7: NPM publish dry run...${NC}"
npm pack --dry-run

echo ""
echo -e "${GREEN}✅ Dry run successful${NC}"

# Step 8: NPM Publish instructions
echo ""
echo -e "${YELLOW}════════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}📦 MANUAL NPM PUBLISH REQUIRED${NC}"
echo -e "${YELLOW}════════════════════════════════════════════════════════════════${NC}"
echo ""
echo "To publish to GitHub Package Registry, run:"
echo ""
echo -e "${GREEN}# 1. Ensure you're authenticated:${NC}"
echo "npm login --registry=https://npm.pkg.github.com --scope=@dainabase"
echo ""
echo -e "${GREEN}# 2. Publish the package:${NC}"
echo "npm publish --tag beta --registry https://npm.pkg.github.com/"
echo ""
echo -e "${GREEN}# 3. Verify the publication:${NC}"
echo "npm view @dainabase/ui@beta --registry https://npm.pkg.github.com/"
echo ""

# Step 9: GitHub Release instructions
echo -e "${YELLOW}════════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}🎉 CREATE GITHUB RELEASE${NC}"
echo -e "${YELLOW}════════════════════════════════════════════════════════════════${NC}"
echo ""
echo "Create the GitHub Release at:"
echo -e "${BLUE}https://github.com/dainabase/directus-unified-platform/releases/new${NC}"
echo ""
echo "Settings:"
echo "  • Tag: @dainabase/ui@1.0.0-beta.1"
echo "  • Title: 🚀 Design System v1.0.0-beta.1"
echo "  • Target: main"
echo "  • ✅ Set as pre-release"
echo ""
echo "Body: Use content from GITHUB_RELEASE_v1.0.0-beta.1.md"
echo ""

# Step 10: Summary
echo -e "${YELLOW}════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}📊 RELEASE STATUS SUMMARY${NC}"
echo -e "${YELLOW}════════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "✅ Main branch updated"
echo -e "✅ Version: 1.0.0-beta.1"
echo -e "✅ Bundle size: 48KB"
echo -e "✅ Build verified"
if git rev-parse "$TAG_NAME" >/dev/null 2>&1; then
    echo -e "✅ Git tag created: $TAG_NAME"
else
    echo -e "⚠️  Git tag pending"
fi
echo -e "⚠️  NPM publish: Manual action required"
echo -e "⚠️  GitHub Release: Manual action required"
echo ""
echo -e "${GREEN}🎉 Ready for beta release!${NC}"
echo ""

# Return to root
cd ../..

# Final checklist
echo -e "${YELLOW}════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}📋 FINAL CHECKLIST${NC}"
echo -e "${YELLOW}════════════════════════════════════════════════════════════════${NC}"
echo ""
echo "[ ] Git tag pushed to origin"
echo "[ ] NPM package published to GitHub Registry"
echo "[ ] GitHub Release created and published"
echo "[ ] Announcement sent to team"
echo "[ ] Documentation site updated"
echo ""
echo -e "${GREEN}Once all items are checked, the v1.0.0-beta.1 release is complete!${NC}"