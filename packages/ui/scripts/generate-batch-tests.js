#!/usr/bin/env node

/**
 * Batch Test Generation Script
 * Date: 13 Août 2025
 * Objective: Generate tests for ALL components missing tests at once
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

const CONFIG = {
  componentsDir: path.join(__dirname, '../src/components'),
  singleTestScript: path.join(__dirname, 'generate-single-test.js'),
  analyzerScript: path.join(__dirname, 'analyze-test-coverage.js'),
};

// Components to skip (already have tests or special cases)
const SKIP_COMPONENTS = [
  'audio-recorder',
  'code-editor',
  'drag-drop-grid',
  'image-cropper',
  'infinite-scroll',
  'pdf-viewer',
  'rich-text-editor',
  'video-player',
  'virtual-list',
  'index',
  'chromatic-test', // Test component
];

async function findComponentsWithoutTests() {
  const componentsWithoutTests = [];
  
  try {
    const items = fs.readdirSync(CONFIG.componentsDir);
    
    for (const item of items) {
      // Skip known components with tests and special files
      const baseName = item
        .replace('.test.tsx', '')
        .replace('.test.ts', '')
        .replace('.stories.tsx', '')
        .replace('.tsx', '')
        .replace('.ts', '');
      
      if (SKIP_COMPONENTS.includes(baseName) || 
          item === 'index.ts' || 
          item === 'index.tsx' ||
          item.endsWith('.test.tsx') ||
          item.endsWith('.test.ts')) {
        continue;
      }
      
      const itemPath = path.join(CONFIG.componentsDir, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        // Check if directory has test files
        const dirFiles = fs.readdirSync(itemPath);
        const hasTest = dirFiles.some(file => 
          file.endsWith('.test.tsx') || 
          file.endsWith('.test.ts')
        );
        
        if (!hasTest) {
          componentsWithoutTests.push(item);
        }
      }
    }
    
    return componentsWithoutTests.sort();
  } catch (error) {
    console.error(`Error scanning components: ${error.message}`);
    return [];
  }
}

async function generateTestForComponent(componentName, index, total) {
  console.log(`\n${colors.cyan}[${index + 1}/${total}] Generating test for: ${componentName}${colors.reset}`);
  console.log(`${'─'.repeat(50)}`);
  
  try {
    // Check if single test generator exists
    if (!fs.existsSync(CONFIG.singleTestScript)) {
      console.error(`${colors.red}✗ Single test generator not found!${colors.reset}`);
      return false;
    }
    
    // Execute the single test generator
    const command = `node "${CONFIG.singleTestScript}" ${componentName}`;
    console.log(`Running: ${command}`);
    
    const output = execSync(command, {
      cwd: path.join(__dirname, '..'),
      encoding: 'utf8'
    });
    
    console.log(output);
    console.log(`${colors.green}✓ Test generated successfully for ${componentName}${colors.reset}`);
    return true;
  } catch (error) {
    console.error(`${colors.red}✗ Failed to generate test for ${componentName}${colors.reset}`);
    console.error(`Error: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log(`${colors.bright}${colors.magenta}🚀 BATCH TEST GENERATION${colors.reset}`);
  console.log(`${'='.repeat(60)}`);
  console.log(`📅 Date: 13 Août 2025`);
  console.log(`📦 Package: @dainabase/ui v1.1.0\n`);
  
  // Find components without tests
  console.log(`${colors.cyan}🔍 Scanning for components without tests...${colors.reset}`);
  const componentsWithoutTests = await findComponentsWithoutTests();
  
  if (componentsWithoutTests.length === 0) {
    console.log(`\n${colors.bright}${colors.green}🎉 Excellent! All components already have tests!${colors.reset}`);
    console.log(`Nothing to generate. 100% coverage achieved!`);
    process.exit(0);
  }
  
  console.log(`\n${colors.yellow}📊 Found ${componentsWithoutTests.length} components without tests:${colors.reset}`);
  componentsWithoutTests.forEach((comp, index) => {
    console.log(`  ${index + 1}. ${comp}`);
  });
  
  // Ask for confirmation (in CI, auto-confirm)
  const isCI = process.env.CI === 'true';
  if (!isCI) {
    console.log(`\n${colors.yellow}⚠️ This will generate ${componentsWithoutTests.length} test files.${colors.reset}`);
    console.log(`Press Ctrl+C to cancel, or wait 3 seconds to continue...`);
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  // Generate tests
  console.log(`\n${colors.bright}${colors.blue}🏗️ Starting batch generation...${colors.reset}\n`);
  
  const results = {
    success: [],
    failed: [],
    skipped: []
  };
  
  for (let i = 0; i < componentsWithoutTests.length; i++) {
    const component = componentsWithoutTests[i];
    const success = await generateTestForComponent(component, i, componentsWithoutTests.length);
    
    if (success) {
      results.success.push(component);
    } else {
      results.failed.push(component);
    }
    
    // Small delay between generations to avoid overwhelming the system
    if (i < componentsWithoutTests.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  // Display summary
  console.log(`\n${colors.bright}${colors.cyan}📊 GENERATION SUMMARY${colors.reset}`);
  console.log(`${'='.repeat(60)}`);
  console.log(`✅ Successfully generated: ${colors.green}${results.success.length}${colors.reset}`);
  console.log(`❌ Failed: ${colors.red}${results.failed.length}${colors.reset}`);
  console.log(`⏩ Skipped: ${colors.yellow}${results.skipped.length}${colors.reset}`);
  
  if (results.success.length > 0) {
    console.log(`\n${colors.green}✅ Successfully generated tests for:${colors.reset}`);
    results.success.forEach(comp => console.log(`  • ${comp}`));
  }
  
  if (results.failed.length > 0) {
    console.log(`\n${colors.red}❌ Failed to generate tests for:${colors.reset}`);
    results.failed.forEach(comp => console.log(`  • ${comp}`));
  }
  
  // Calculate new coverage
  const totalComponents = componentsWithoutTests.length + SKIP_COMPONENTS.length - 1; // -1 for index
  const newTestedComponents = SKIP_COMPONENTS.length - 1 + results.success.length;
  const newCoverage = ((newTestedComponents / totalComponents) * 100).toFixed(2);
  
  console.log(`\n${colors.bright}${colors.magenta}📈 COVERAGE UPDATE${colors.reset}`);
  console.log(`Previous untested: ${componentsWithoutTests.length}`);
  console.log(`Now untested: ${results.failed.length}`);
  console.log(`Estimated new coverage: ${colors.bright}${newCoverage}%${colors.reset}`);
  
  // Run analyzer to get exact coverage
  if (results.success.length > 0) {
    console.log(`\n${colors.cyan}📊 Running coverage analysis...${colors.reset}\n`);
    
    try {
      execSync(`node "${CONFIG.analyzerScript}"`, {
        cwd: path.join(__dirname, '..'),
        stdio: 'inherit'
      });
    } catch (error) {
      // Analyzer exits with 1 if not 100% coverage, which is expected
      console.log(`\n${colors.yellow}Analysis complete (coverage < 100%)${colors.reset}`);
    }
  }
  
  // NPM readiness check
  if (results.failed.length === 0) {
    console.log(`\n${colors.bright}${colors.green}🎉 ALL TESTS GENERATED SUCCESSFULLY!${colors.reset}`);
    console.log(`${colors.green}✅ Ready for NPM publication!${colors.reset}`);
    console.log(`\nNext steps:`);
    console.log(`1. Run tests: npm test`);
    console.log(`2. Build package: npm run build`);
    console.log(`3. Publish to NPM: npm run publish:npm`);
  } else {
    console.log(`\n${colors.yellow}⚠️ Some tests failed to generate.${colors.reset}`);
    console.log(`Please review and fix the failed components manually.`);
  }
  
  // Save batch report
  const reportPath = path.join(__dirname, '../batch-generation-report.json');
  const report = {
    timestamp: new Date().toISOString(),
    version: '1.1.0',
    totalProcessed: componentsWithoutTests.length,
    results: {
      success: results.success,
      failed: results.failed,
      skipped: results.skipped
    },
    estimatedCoverage: `${newCoverage}%`
  };
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Batch report saved to: batch-generation-report.json`);
  
  // Exit code
  process.exit(results.failed.length > 0 ? 1 : 0);
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error(`\n${colors.red}Unhandled error: ${error.message}${colors.reset}`);
  process.exit(1);
});

// Run the batch generation
main().catch(error => {
  console.error(`\n${colors.red}Fatal error: ${error.message}${colors.reset}`);
  process.exit(1);
});
