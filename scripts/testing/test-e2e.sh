#!/bin/bash

# 🎭 Design System E2E Test Runner
# This script runs E2E tests for the Design System using Playwright

set -e

echo "🎭 Starting Design System E2E Tests..."
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Playwright is installed
if ! command -v npx &> /dev/null; then
    echo -e "${RED}❌ npx not found. Please install Node.js and npm.${NC}"
    exit 1
fi

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Start Storybook if not running
echo -e "${YELLOW}📚 Checking Storybook status...${NC}"
if ! check_port 6006; then
    echo -e "${YELLOW}Starting Storybook on port 6006...${NC}"
    pnpm --filter @dainabase/ui sb &
    STORYBOOK_PID=$!
    
    # Wait for Storybook to start
    echo "Waiting for Storybook to start..."
    sleep 10
    
    # Check if Storybook started successfully
    if check_port 6006; then
        echo -e "${GREEN}✅ Storybook started successfully${NC}"
    else
        echo -e "${RED}❌ Failed to start Storybook${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Storybook already running on port 6006${NC}"
fi

# Start Next.js app if not running
echo -e "${YELLOW}🚀 Checking Next.js app status...${NC}"
if ! check_port 3000; then
    echo -e "${YELLOW}Starting Next.js app on port 3000...${NC}"
    pnpm --filter web dev &
    NEXTJS_PID=$!
    
    # Wait for Next.js to start
    echo "Waiting for Next.js to start..."
    sleep 15
    
    # Check if Next.js started successfully
    if check_port 3000; then
        echo -e "${GREEN}✅ Next.js app started successfully${NC}"
    else
        echo -e "${RED}❌ Failed to start Next.js app${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Next.js app already running on port 3000${NC}"
fi

echo ""
echo "=================================="
echo -e "${GREEN}🎭 Running Playwright E2E Tests${NC}"
echo "=================================="

# Run tests based on argument
if [ "$1" = "ui" ]; then
    echo "Running UI mode..."
    npx playwright test --ui
elif [ "$1" = "headed" ]; then
    echo "Running in headed mode..."
    npx playwright test --headed
elif [ "$1" = "debug" ]; then
    echo "Running in debug mode..."
    npx playwright test --debug
elif [ "$1" = "storybook" ]; then
    echo "Running Storybook tests only..."
    npx playwright test e2e/storybook.spec.ts
elif [ "$1" = "dashboard" ]; then
    echo "Running Dashboard tests only..."
    npx playwright test e2e/dashboard.spec.ts
elif [ "$1" = "update-snapshots" ]; then
    echo "Updating visual snapshots..."
    npx playwright test --update-snapshots
else
    echo "Running all tests..."
    npx playwright test
fi

TEST_RESULT=$?

# Cleanup function
cleanup() {
    echo ""
    echo "=================================="
    echo -e "${YELLOW}🧹 Cleaning up...${NC}"
    
    if [ ! -z "$STORYBOOK_PID" ]; then
        echo "Stopping Storybook..."
        kill $STORYBOOK_PID 2>/dev/null || true
    fi
    
    if [ ! -z "$NEXTJS_PID" ]; then
        echo "Stopping Next.js..."
        kill $NEXTJS_PID 2>/dev/null || true
    fi
    
    echo -e "${GREEN}✅ Cleanup complete${NC}"
}

# Trap to ensure cleanup on exit
trap cleanup EXIT

# Show results
echo ""
echo "=================================="
if [ $TEST_RESULT -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
    echo ""
    echo "📊 View the report:"
    echo "   npx playwright show-report"
else
    echo -e "${RED}❌ Some tests failed${NC}"
    echo ""
    echo "📊 View the report for details:"
    echo "   npx playwright show-report"
    exit 1
fi

echo ""
echo "🎭 Test Options:"
echo "   ./test-e2e.sh          # Run all tests"
echo "   ./test-e2e.sh ui       # Open UI mode"
echo "   ./test-e2e.sh headed   # Run with browser visible"
echo "   ./test-e2e.sh debug    # Debug mode"
echo "   ./test-e2e.sh storybook # Test Storybook only"
echo "   ./test-e2e.sh dashboard # Test Dashboard only"
echo "   ./test-e2e.sh update-snapshots # Update screenshots"
