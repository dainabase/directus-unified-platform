#!/usr/bin/env node

/**
 * Test Coverage Analysis Script
 * 
 * This script analyzes which components have tests and which don't
 * to identify gaps in test coverage
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Configuration
const CONFIG = {
  componentsDir: path.join(__dirname, '../src/components'),
  expectedComponents: 66, // Total number of component variations
  coreComponents: 58, // Core components to test
};

// Component list (from documentation)
const ALL_COMPONENTS = [
  // Core components (3)
  'icon', 'label', 'separator',
  
  // Layout components (4)
  'card', 'resizable', 'scroll-area', 'collapsible',
  
  // Form components (13)
  'input', 'select', 'checkbox', 'radio-group', 'textarea',
  'switch', 'slider', 'date-picker', 'date-range-picker',
  'color-picker', 'file-upload', 'form', 'forms-demo',
  
  // Data Display (6)
  'table', 'data-grid', 'data-grid-adv', 'charts', 'timeline', 'timeline-enhanced',
  
  // Navigation (5)
  'tabs', 'stepper', 'pagination', 'breadcrumbs', 'navigation-menu',
  
  // Feedback (6)
  'alert', 'toast', 'progress', 'skeleton', 'sonner', 'hover-card',
  
  // Overlays (7)
  'dialog', 'sheet', 'popover', 'tooltip', 'context-menu', 'dropdown-menu', 'menubar',
  
  // Advanced (14+)
  'command-palette', 'carousel', 'rating', 'badge', 'accordion',
  'avatar', 'button', 'calendar', 'drawer', 'alert-dialog',
  'ui-provider', 'toggle', 'toggle-group', 'error-boundary',
  
  // New components not in original list
  'app-shell', 'audio-recorder', 'code-editor', 'drag-drop-grid',
  'image-cropper', 'infinite-scroll', 'kanban', 'mentions',
  'pdf-viewer', 'rich-text-editor', 'search-bar', 'tag-input',
  'theme-toggle', 'tree-view', 'video-player', 'virtual-list',
  'chromatic-test'
];

// Main analysis function
async function analyzeTestCoverage() {
  console.log(`${colors.bright}${colors.cyan}🔍 Test Coverage Analysis${colors.reset}\n${'='.repeat(50)}`);
  
  const results = {
    totalComponents: 0,
    componentsWithTests: [],
    componentsWithoutTests: [],
    testFiles: [],
    coverage: 0,
  };

  try {
    // Read all items in components directory
    const items = fs.readdirSync(CONFIG.componentsDir);
    
    for (const item of items) {
      const itemPath = path.join(CONFIG.componentsDir, item);
      const stat = fs.statSync(itemPath);
      
      // Check if it's a test file at root level
      if (item.endsWith('.test.tsx') || item.endsWith('.test.ts')) {
        const componentName = item.replace('.test.tsx', '').replace('.test.ts', '');
        results.componentsWithTests.push(componentName);
        results.testFiles.push(item);
      }
      // Check directories for test files
      else if (stat.isDirectory()) {
        const dirFiles = fs.readdirSync(itemPath);
        const hasTest = dirFiles.some(file => 
          file.endsWith('.test.tsx') || file.endsWith('.test.ts')
        );
        
        if (hasTest) {
          results.componentsWithTests.push(item);
          const testFile = dirFiles.find(file => 
            file.endsWith('.test.tsx') || file.endsWith('.test.ts')
          );
          results.testFiles.push(`${item}/${testFile}`);
        } else {
          // Only add to without tests if it's not a utility folder
          if (!['index.ts', 'index.tsx'].includes(item) && 
              !item.endsWith('.stories.tsx') && 
              !item.endsWith('.tsx') &&
              !item.endsWith('.mdx')) {
            results.componentsWithoutTests.push(item);
          }
        }
      }
    }
    
    // Calculate statistics
    results.totalComponents = ALL_COMPONENTS.length;
    results.coverage = (results.componentsWithTests.length / results.totalComponents * 100).toFixed(2);
    
    // Display results
    console.log(`${colors.bright}📊 Summary:${colors.reset}`);
    console.log(`• Total Expected Components: ${results.totalComponents}`);
    console.log(`• Components with Tests: ${colors.green}${results.componentsWithTests.length}${colors.reset}`);
    console.log(`• Components without Tests: ${colors.red}${results.componentsWithoutTests.length}${colors.reset}`);
    console.log(`• Test Coverage: ${results.coverage}%`);
    
    // List components WITH tests
    if (results.componentsWithTests.length > 0) {
      console.log(`\n${colors.green}✅ Components WITH Tests (${results.componentsWithTests.length}):${colors.reset}`);
      results.componentsWithTests.sort().forEach(comp => {
        console.log(`  ✓ ${comp}`);
      });
    }
    
    // List components WITHOUT tests
    if (results.componentsWithoutTests.length > 0) {
      console.log(`\n${colors.red}❌ Components WITHOUT Tests (${results.componentsWithoutTests.length}):${colors.reset}`);
      results.componentsWithoutTests.sort().forEach(comp => {
        console.log(`  ✗ ${comp}`);
      });
    }
    
    // Identify missing components from expected list
    const foundComponents = [...results.componentsWithTests, ...results.componentsWithoutTests];
    const missingFromExpected = ALL_COMPONENTS.filter(comp => 
      !foundComponents.includes(comp) && 
      !foundComponents.includes(comp.replace('-', ''))
    );
    
    if (missingFromExpected.length > 0) {
      console.log(`\n${colors.yellow}⚠️ Expected Components Not Found (${missingFromExpected.length}):${colors.reset}`);
      missingFromExpected.forEach(comp => {
        console.log(`  ? ${comp}`);
      });
    }
    
    // Recommendations
    console.log(`\n${colors.bright}${colors.blue}💡 Recommendations:${colors.reset}`);
    if (results.componentsWithoutTests.length > 0) {
      console.log('1. Create test files for components without tests');
      console.log('2. Focus on complex components first (data-grid, command-palette, etc.)');
      console.log('3. Ensure edge cases and error boundaries are tested');
    }
    
    // Target for 100% coverage
    const testsNeeded = results.totalComponents - results.componentsWithTests.length;
    if (testsNeeded > 0) {
      console.log(`\n${colors.bright}🎯 To reach 100% coverage:${colors.reset}`);
      console.log(`Need to add tests for ${colors.red}${testsNeeded}${colors.reset} more components`);
    } else {
      console.log(`\n${colors.bright}${colors.green}🎉 CONGRATULATIONS! 100% Test Coverage Achieved! 🎉${colors.reset}`);
    }
    
    // Save results to JSON
    const resultsFile = path.join(__dirname, '../test-coverage-analysis.json');
    fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
    console.log(`\n📄 Detailed results saved to: test-coverage-analysis.json`);
    
    // Exit with appropriate code
    process.exit(results.coverage === 100 ? 0 : 1);
    
  } catch (error) {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Run analysis
analyzeTestCoverage().catch(error => {
  console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
  process.exit(1);
});
