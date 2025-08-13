#!/usr/bin/env node

/**
 * Complete Test Coverage Scanner
 * Date: 13 Août 2025
 * Objective: Identify ALL components missing tests
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

async function scanAllComponents() {
  console.log(`${colors.bright}${colors.cyan}🔍 COMPLETE TEST COVERAGE SCAN${colors.reset}`);
  console.log(`${'='.repeat(60)}`);
  console.log(`📅 Date: 13 Août 2025, 19h40 UTC`);
  console.log(`📦 Package: @dainabase/ui v1.1.0\n`);
  
  const results = {
    componentsWithTests: [],
    componentsWithoutTests: [],
    testFilesFound: [],
    totalScanned: 0,
  };

  try {
    // Get all items in components directory
    const items = fs.readdirSync(CONFIG.componentsDir);
    
    for (const item of items) {
      const itemPath = path.join(CONFIG.componentsDir, item);
      const stat = fs.statSync(itemPath);
      
      // Skip non-component files
      if (item === 'index.ts' || item === 'index.tsx') continue;
      
      // Check for standalone test files (like audio-recorder.test.tsx)
      if (item.endsWith('.test.tsx') || item.endsWith('.test.ts')) {
        const componentName = item.replace('.test.tsx', '').replace('.test.ts', '');
        results.componentsWithTests.push(componentName);
        results.testFilesFound.push(item);
        results.totalScanned++;
      }
      // Check for standalone story/component files (need to check if they have tests)
      else if (item.endsWith('.stories.tsx') || item.endsWith('.tsx')) {
        const baseName = item.replace('.stories.tsx', '').replace('.tsx', '');
        // Check if there's a corresponding test file
        const testFile1 = `${baseName}.test.tsx`;
        const testFile2 = `${baseName}.test.ts`;
        
        if (items.includes(testFile1) || items.includes(testFile2)) {
          // Already counted
        } else if (!item.endsWith('.stories.tsx')) {
          // Component file without test
          const componentName = baseName;
          if (!results.componentsWithTests.includes(componentName) && 
              !results.componentsWithoutTests.includes(componentName)) {
            results.componentsWithoutTests.push(componentName);
            results.totalScanned++;
          }
        }
      }
      // Check directories
      else if (stat.isDirectory()) {
        const dirFiles = fs.readdirSync(itemPath);
        
        // Look for test files in the directory
        const hasTest = dirFiles.some(file => 
          file.endsWith('.test.tsx') || 
          file.endsWith('.test.ts') ||
          file === `${item}.test.tsx` ||
          file === `${item}.test.ts`
        );
        
        if (hasTest) {
          results.componentsWithTests.push(item);
          const testFile = dirFiles.find(file => 
            file.endsWith('.test.tsx') || file.endsWith('.test.ts')
          );
          results.testFilesFound.push(`${item}/${testFile}`);
        } else {
          results.componentsWithoutTests.push(item);
        }
        results.totalScanned++;
      }
    }
    
    // Sort results
    results.componentsWithTests.sort();
    results.componentsWithoutTests.sort();
    
    // Calculate coverage
    const totalComponents = results.componentsWithTests.length + results.componentsWithoutTests.length;
    const coverage = (results.componentsWithTests.length / totalComponents * 100).toFixed(2);
    
    // Display results
    console.log(`${colors.bright}📊 SCAN RESULTS:${colors.reset}`);
    console.log(`• Total Components Scanned: ${totalComponents}`);
    console.log(`• Components WITH Tests: ${colors.green}${results.componentsWithTests.length}${colors.reset}`);
    console.log(`• Components WITHOUT Tests: ${colors.red}${results.componentsWithoutTests.length}${colors.reset}`);
    console.log(`• Current Coverage: ${colors.bright}${coverage}%${colors.reset}`);
    
    // List components WITH tests
    console.log(`\n${colors.green}✅ COMPONENTS WITH TESTS (${results.componentsWithTests.length}):${colors.reset}`);
    results.componentsWithTests.forEach((comp, index) => {
      console.log(`  ${index + 1}. ${comp}`);
    });
    
    // List components WITHOUT tests
    if (results.componentsWithoutTests.length > 0) {
      console.log(`\n${colors.red}❌ COMPONENTS WITHOUT TESTS (${results.componentsWithoutTests.length}):${colors.reset}`);
      results.componentsWithoutTests.forEach((comp, index) => {
        console.log(`  ${index + 1}. ${comp}`);
      });
      
      // Generate test commands
      console.log(`\n${colors.bright}${colors.blue}🚀 QUICK TEST GENERATION:${colors.reset}`);
      console.log(`\nTo generate missing tests, run these commands:\n`);
      
      results.componentsWithoutTests.forEach(comp => {
        console.log(`# Generate test for ${comp}:`);
        console.log(`node scripts/generate-single-test.js ${comp}\n`);
      });
    } else {
      console.log(`\n${colors.bright}${colors.green}🎉 AMAZING! 100% Test Coverage Achieved!${colors.reset}`);
    }
    
    // Save detailed scan report
    const reportPath = path.join(__dirname, '../test-scan-report.json');
    const report = {
      timestamp: new Date().toISOString(),
      version: '1.1.0',
      coverage: `${coverage}%`,
      totalComponents,
      componentsWithTests: results.componentsWithTests,
      componentsWithoutTests: results.componentsWithoutTests,
      testFiles: results.testFilesFound,
    };
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Scan report saved to: test-scan-report.json`);
    
    // Update Issue #34 if needed
    if (results.componentsWithoutTests.length > 0) {
      console.log(`\n${colors.yellow}⚠️ ACTION REQUIRED:${colors.reset}`);
      console.log(`${results.componentsWithoutTests.length} components still need tests.`);
      console.log(`Run the test generation commands above to reach 100% coverage.`);
    }
    
    // Exit code
    process.exit(coverage === '100.00' ? 0 : 1);
    
  } catch (error) {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Run the scan
scanAllComponents().catch(error => {
  console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
  process.exit(1);
});
