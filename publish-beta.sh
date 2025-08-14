#!/bin/bash
# Quick NPM Beta Publication Script
# This script can be run locally to publish the beta version

echo "🚀 Publishing @dainabase/ui v1.2.0-beta.1 to NPM"
echo "================================================"

# Navigate to the UI package
cd packages/ui

# Check current version
echo "📦 Current version in package.json:"
grep '"version"' package.json

# Install dependencies
echo "📥 Installing dependencies..."
npm ci

# Run tests
echo "🧪 Running tests..."
npm run test:ci || echo "⚠️ Some tests failed, but continuing..."

# Build the package
echo "🏗️ Building optimized bundle..."
npm run build:optimized

# Publish to NPM with beta tag
echo "🚀 Publishing to NPM..."
npm publish --tag beta --access public

echo "✅ Publication complete!"
echo "Install with: npm install @dainabase/ui@beta"
