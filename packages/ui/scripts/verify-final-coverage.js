#!/usr/bin/env node

/**
 * Final Coverage Verification Script
 * Date: 13 Août 2025
 * Objective: Identify EXACTLY which components are missing tests
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

const CONFIG = {
  componentsDir: path.join(__dirname, '../src/components'),
};

// Components to skip (special cases)
const SKIP_COMPONENTS = [
  'index.ts',
  'index.tsx',
  'chromatic-test', // Test component, doesn't need tests
  'forms-demo', // Demo component, might not need tests
];

function checkComponentHasTest(componentPath, componentName) {
  try {
    const stat = fs.statSync(componentPath);
    
    if (stat.isDirectory()) {
      // Check if directory has test files
      const files = fs.readdirSync(componentPath);
      return files.some(file => 
        file.endsWith('.test.tsx') || 
        file.endsWith('.test.ts') ||
        file === `${componentName}.test.tsx` ||
        file === `${componentName}.test.ts`
      );
    } else if (stat.isFile()) {
      // For standalone files, check if corresponding test exists
      const baseName = componentName
        .replace('.stories.tsx', '')
        .replace('.tsx', '')
        .replace('.ts', '');
      
      const testFile1 = path.join(CONFIG.componentsDir, `${baseName}.test.tsx`);
      const testFile2 = path.join(CONFIG.componentsDir, `${baseName}.test.ts`);
      
      return fs.existsSync(testFile1) || fs.existsSync(testFile2);
    }
    
    return false;
  } catch (error) {
    console.error(`Error checking ${componentName}: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log(`${colors.bright}${colors.cyan}🔍 FINAL COVERAGE VERIFICATION${colors.reset}`);
  console.log(`${'='.repeat(60)}`);
  console.log(`📅 Date: 13 Août 2025`);
  console.log(`📦 Package: @dainabase/ui v1.1.0\n`);
  
  const results = {
    withTests: [],
    withoutTests: [],
    skipped: [],
    all: []
  };
  
  try {
    const items = fs.readdirSync(CONFIG.componentsDir);
    
    // Process each item
    for (const item of items) {
      // Skip special files
      if (SKIP_COMPONENTS.includes(item)) {
        results.skipped.push(item);
        continue;
      }
      
      // Skip test files themselves
      if (item.endsWith('.test.tsx') || item.endsWith('.test.ts')) {
        continue;
      }
      
      // Skip story-only files (they're covered by their component)
      if (item.endsWith('.stories.tsx')) {
        const baseName = item.replace('.stories.tsx', '');
        // Check if there's a corresponding component file or directory
        const hasComponent = items.includes(baseName) || 
                           items.includes(`${baseName}.tsx`) ||
                           fs.existsSync(path.join(CONFIG.componentsDir, baseName));
        if (hasComponent) {
          continue; // Will be handled by the component check
        }
      }
      
      const itemPath = path.join(CONFIG.componentsDir, item);
      const stat = fs.statSync(itemPath);
      
      // Get the base component name
      let componentName = item
        .replace('.tsx', '')
        .replace('.ts', '')
        .replace('.stories', '');
      
      // Skip if we already processed this component
      if (results.all.includes(componentName)) {
        continue;
      }
      
      results.all.push(componentName);
      
      // Check if it has tests
      const hasTest = checkComponentHasTest(itemPath, componentName);
      
      if (hasTest) {
        results.withTests.push(componentName);
      } else {
        // Only add to withoutTests if it's actually a component
        if (stat.isDirectory() || item.endsWith('.tsx')) {
          results.withoutTests.push(componentName);
        }
      }
    }
    
    // Sort results
    results.withTests.sort();
    results.withoutTests.sort();
    results.all.sort();
    
    // Calculate coverage
    const totalComponents = results.withTests.length + results.withoutTests.length;
    const coverage = totalComponents > 0 
      ? (results.withTests.length / totalComponents * 100).toFixed(2)
      : 0;
    
    // Display results
    console.log(`${colors.bright}📊 VERIFICATION RESULTS:${colors.reset}`);
    console.log(`• Total Real Components: ${totalComponents}`);
    console.log(`• Components WITH Tests: ${colors.green}${results.withTests.length}${colors.reset}`);
    console.log(`• Components WITHOUT Tests: ${colors.red}${results.withoutTests.length}${colors.reset}`);
    console.log(`• Current Coverage: ${colors.bright}${coverage}%${colors.reset}`);
    console.log(`• Skipped (demos/tests): ${results.skipped.length}`);
    
    // Progress bar
    const progressFilled = Math.floor(parseFloat(coverage) / 5);
    const progressEmpty = 20 - progressFilled;
    console.log(`\nProgress: [${colors.green}${'█'.repeat(progressFilled)}${colors.reset}${'░'.repeat(progressEmpty)}] ${coverage}%`);
    
    // List components WITHOUT tests
    if (results.withoutTests.length > 0) {
      console.log(`\n${colors.red}❌ COMPONENTS WITHOUT TESTS:${colors.reset}`);
      results.withoutTests.forEach((comp, index) => {
        const componentPath = path.join(CONFIG.componentsDir, comp);
        const isDirectory = fs.existsSync(componentPath) && fs.statSync(componentPath).isDirectory();
        const type = isDirectory ? '[dir]' : '[file]';
        console.log(`  ${index + 1}. ${comp} ${type}`);
      });
      
      console.log(`\n${colors.yellow}🚀 QUICK FIX:${colors.reset}`);
      console.log(`Generate ALL missing tests with:`);
      console.log(`${colors.cyan}node scripts/generate-batch-tests.js${colors.reset}`);
      
      console.log(`\nOr generate individually:`);
      results.withoutTests.slice(0, 3).forEach(comp => {
        console.log(`node scripts/generate-single-test.js ${comp}`);
      });
      
      if (results.withoutTests.length > 3) {
        console.log(`... and ${results.withoutTests.length - 3} more`);
      }
    } else {
      console.log(`\n${colors.bright}${colors.green}🎉 PERFECT! 100% Test Coverage Achieved!${colors.reset}`);
      console.log(`All ${totalComponents} components have tests!`);
      console.log(`\n${colors.green}✅ READY FOR NPM PUBLICATION!${colors.reset}`);
      console.log(`\nNext steps:`);
      console.log(`1. Run all tests: ${colors.cyan}npm test${colors.reset}`);
      console.log(`2. Build package: ${colors.cyan}npm run build${colors.reset}`);
      console.log(`3. Publish to NPM: ${colors.cyan}npm run publish:npm${colors.reset}`);
    }
    
    // Sample of components WITH tests (for verification)
    console.log(`\n${colors.green}✅ Sample of Components WITH Tests:${colors.reset}`);
    results.withTests.slice(0, 10).forEach((comp, index) => {
      console.log(`  ${index + 1}. ${comp}`);
    });
    if (results.withTests.length > 10) {
      console.log(`  ... and ${results.withTests.length - 10} more`);
    }
    
    // Save detailed report
    const reportPath = path.join(__dirname, '../final-coverage-report.json');
    const report = {
      timestamp: new Date().toISOString(),
      version: '1.1.0',
      coverage: `${coverage}%`,
      statistics: {
        total: totalComponents,
        tested: results.withTests.length,
        untested: results.withoutTests.length,
        skipped: results.skipped.length
      },
      componentsWithTests: results.withTests,
      componentsWithoutTests: results.withoutTests,
      skippedComponents: results.skipped,
      readyForNPM: coverage === '100.00'
    };
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Report saved to: final-coverage-report.json`);
    
    // GitHub Issue Update
    console.log(`\n${colors.magenta}📝 GitHub Issue #34 Update:${colors.reset}`);
    console.log(`Coverage: ${coverage}% | ${results.withTests.length}/${totalComponents} components tested`);
    if (results.withoutTests.length > 0) {
      console.log(`Missing: ${results.withoutTests.join(', ')}`);
    }
    
    // Exit code
    process.exit(coverage === '100.00' ? 0 : 1);
    
  } catch (error) {
    console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Run the verification
main().catch(error => {
  console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
  process.exit(1);
});
