#!/usr/bin/env node

/**
 * Enhanced Test Coverage Report
 * Date: 13 Août 2025
 * Objective: Reach 100% test coverage
 */

const fs = require('fs');
const path = require('path');

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
};

// Complete list of ALL components in the project
const COMPLETE_COMPONENT_LIST = [
  // Core UI Components (confirmed directories)
  'accordion',
  'alert',
  'alert-dialog',
  'app-shell',
  'audio-recorder',  // has test (.test.tsx file at root)
  'avatar',
  'badge',
  'breadcrumbs',
  'button',
  'calendar',
  'card',
  'carousel',
  'charts',  // has test
  'checkbox',
  'chromatic-test',
  'code-editor',  // has test (.test.tsx file at root)
  'color-picker',
  'collapsible',
  'command-palette',
  'context-menu',
  'data-grid',
  'data-grid-adv',
  'date-picker',
  'date-range-picker',
  'dialog',
  'drag-drop-grid',  // has test (.test.tsx file at root)
  'drawer',
  'dropdown-menu',
  'error-boundary',
  'file-upload',
  'form',
  'forms-demo',
  'hover-card',
  'icon',
  'image-cropper',  // has test (.test.tsx file at root)
  'infinite-scroll',  // has test (.test.tsx file at root)
  'input',
  'kanban',
  'label',
  'menubar',
  'mentions',
  'navigation-menu',
  'pagination',
  'pdf-viewer',  // has test (.test.tsx file at root)
  'popover',
  'progress',
  'radio-group',
  'rating',
  'resizable',
  'rich-text-editor',  // has test (.test.tsx file at root)
  'scroll-area',
  'search-bar',
  'select',
  'separator',
  'sheet',
  'skeleton',
  'slider',
  'sonner',
  'stepper',
  'switch',
  'table',
  'tabs',
  'tag-input',
  'textarea',
  'theme-toggle',
  'timeline',
  'timeline-enhanced',
  'toast',
  'toggle',
  'toggle-group',
  'tooltip',
  'tree-view',
  'ui-provider',
  'video-player',  // has test (.test.tsx file at root)
  'virtual-list',  // has test (.test.tsx file at root)
];

async function analyzeTestCoverage() {
  console.log(`${colors.bright}${colors.cyan}🔍 COMPREHENSIVE TEST COVERAGE ANALYSIS${colors.reset}`);
  console.log(`${'='.repeat(60)}`);
  console.log(`📅 Date: 13 Août 2025`);
  console.log(`🎯 Goal: 100% Test Coverage`);
  console.log(`📦 Package: @dainabase/ui v1.1.0\n`);
  
  const results = {
    totalComponents: COMPLETE_COMPONENT_LIST.length,
    componentsWithTests: [],
    componentsWithoutTests: [],
    testFilesInRoot: [],
    testFilesInFolders: [],
  };

  try {
    // First, check for test files at the root level of components/
    const rootFiles = fs.readdirSync(CONFIG.componentsDir);
    
    for (const file of rootFiles) {
      if (file.endsWith('.test.tsx') || file.endsWith('.test.ts')) {
        const componentName = file.replace('.test.tsx', '').replace('.test.ts', '');
        results.testFilesInRoot.push(componentName);
      }
    }
    
    // Now check each component directory
    for (const component of COMPLETE_COMPONENT_LIST) {
      const componentPath = path.join(CONFIG.componentsDir, component);
      
      // Check if the component has a test file in root (like audio-recorder.test.tsx)
      const hasRootTest = results.testFilesInRoot.includes(component);
      
      if (hasRootTest) {
        results.componentsWithTests.push(component);
        continue;
      }
      
      // Check if the component directory exists
      if (fs.existsSync(componentPath) && fs.statSync(componentPath).isDirectory()) {
        const files = fs.readdirSync(componentPath);
        const hasTest = files.some(file => 
          file.endsWith('.test.tsx') || 
          file.endsWith('.test.ts') ||
          file === `${component}.test.tsx` ||
          file === `${component}.test.ts`
        );
        
        if (hasTest) {
          results.componentsWithTests.push(component);
          const testFile = files.find(file => 
            file.endsWith('.test.tsx') || file.endsWith('.test.ts')
          );
          results.testFilesInFolders.push(`${component}/${testFile}`);
        } else {
          results.componentsWithoutTests.push(component);
        }
      } else {
        // Component doesn't have a directory or test file
        results.componentsWithoutTests.push(component);
      }
    }
    
    // Calculate coverage percentage
    const coverage = (results.componentsWithTests.length / results.totalComponents * 100).toFixed(2);
    
    // Display results
    console.log(`${colors.bright}📊 SUMMARY:${colors.reset}`);
    console.log(`• Total Components: ${results.totalComponents}`);
    console.log(`• Components with Tests: ${colors.green}${results.componentsWithTests.length}${colors.reset}`);
    console.log(`• Components without Tests: ${colors.red}${results.componentsWithoutTests.length}${colors.reset}`);
    console.log(`• Current Coverage: ${coverage}%`);
    console.log(`• Gap to 100%: ${(100 - coverage).toFixed(2)}%`);
    
    // Components WITH tests
    console.log(`\n${colors.green}✅ COMPONENTS WITH TESTS (${results.componentsWithTests.length}):${colors.reset}`);
    results.componentsWithTests.sort().forEach((comp, index) => {
      const isRootTest = results.testFilesInRoot.includes(comp);
      const location = isRootTest ? ' (root test file)' : ' (folder test)';
      console.log(`  ${index + 1}. ${comp}${location}`);
    });
    
    // Components WITHOUT tests (PRIORITY)
    if (results.componentsWithoutTests.length > 0) {
      console.log(`\n${colors.red}❌ COMPONENTS WITHOUT TESTS (${results.componentsWithoutTests.length}):${colors.reset}`);
      
      // Categorize by priority
      const highPriority = ['data-grid-adv', 'tree-view', 'timeline-enhanced', 'app-shell', 'chromatic-test', 'mentions'];
      const mediumPriority = ['breadcrumbs', 'color-picker', 'context-menu', 'date-picker', 'date-range-picker', 'error-boundary', 'forms-demo', 'hover-card', 'label', 'menubar', 'navigation-menu'];
      
      console.log(`\n  ${colors.bright}🔥 HIGH PRIORITY (complex components):${colors.reset}`);
      results.componentsWithoutTests.forEach((comp, index) => {
        if (highPriority.includes(comp)) {
          console.log(`    ${colors.red}• ${comp}${colors.reset}`);
        }
      });
      
      console.log(`\n  ${colors.bright}⚡ MEDIUM PRIORITY:${colors.reset}`);
      results.componentsWithoutTests.forEach((comp, index) => {
        if (mediumPriority.includes(comp)) {
          console.log(`    ${colors.yellow}• ${comp}${colors.reset}`);
        }
      });
      
      console.log(`\n  ${colors.bright}📝 LOW PRIORITY:${colors.reset}`);
      results.componentsWithoutTests.forEach((comp, index) => {
        if (!highPriority.includes(comp) && !mediumPriority.includes(comp)) {
          console.log(`    • ${comp}`);
        }
      });
    }
    
    // Action plan
    console.log(`\n${colors.bright}${colors.blue}🎯 ACTION PLAN TO REACH 100%:${colors.reset}`);
    
    if (results.componentsWithoutTests.length > 0) {
      console.log(`\n1. ${colors.bright}Generate test files:${colors.reset}`);
      console.log(`   Run: node scripts/generate-missing-tests.js`);
      
      console.log(`\n2. ${colors.bright}Priority order:${colors.reset}`);
      console.log(`   - Start with HIGH priority (complex components)`);
      console.log(`   - Then MEDIUM priority`);
      console.log(`   - Finally LOW priority`);
      
      console.log(`\n3. ${colors.bright}Test requirements per component:${colors.reset}`);
      console.log(`   - Rendering tests`);
      console.log(`   - Props validation`);
      console.log(`   - User interactions`);
      console.log(`   - Accessibility (ARIA)`);
      console.log(`   - Edge cases`);
      console.log(`   - Snapshot tests`);
      
      console.log(`\n4. ${colors.bright}Estimated time:${colors.reset}`);
      const timePerComponent = 10; // minutes
      const totalTime = results.componentsWithoutTests.length * timePerComponent;
      console.log(`   - ${timePerComponent} minutes per component`);
      console.log(`   - Total: ~${totalTime} minutes (${(totalTime / 60).toFixed(1)} hours)`);
    } else {
      console.log(`\n${colors.bright}${colors.green}🎉 CONGRATULATIONS! 100% Test Coverage Achieved!${colors.reset}`);
      console.log(`All ${results.totalComponents} components have test files.`);
      console.log(`\nNext steps:`);
      console.log(`1. Run full test suite: npm test`);
      console.log(`2. Check coverage report: npm run test:coverage`);
      console.log(`3. Publish to NPM: npm publish`);
    }
    
    // Save detailed report
    const reportPath = path.join(__dirname, '../test-coverage-report.json');
    const report = {
      date: new Date().toISOString(),
      version: '1.1.0',
      summary: {
        total: results.totalComponents,
        tested: results.componentsWithTests.length,
        untested: results.componentsWithoutTests.length,
        coverage: `${coverage}%`,
      },
      componentsWithTests: results.componentsWithTests.sort(),
      componentsWithoutTests: results.componentsWithoutTests.sort(),
      testFiles: {
        root: results.testFilesInRoot,
        folders: results.testFilesInFolders,
      },
    };
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Detailed report saved to: test-coverage-report.json`);
    
    // Exit code based on coverage
    const exitCode = coverage === '100.00' ? 0 : 1;
    console.log(`\n${colors.bright}Exit code: ${exitCode}${colors.reset}`);
    process.exit(exitCode);
    
  } catch (error) {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Run the analysis
analyzeTestCoverage().catch(error => {
  console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
  process.exit(1);
});
