#!/usr/bin/env node

/**
 * Test Suite Verification Script
 * 
 * This script verifies the test suite status and coverage
 * Can be run locally or in CI/CD environment
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
  targetCoverage: {
    lines: 90,
    statements: 90,
    branches: 85,
    functions: 90,
  },
  expectedComponents: 57,
  maxExecutionTime: 60000, // 60 seconds
};

// Utility functions
const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}\n${'='.repeat(50)}`),
};

// Check if running in CI environment
const isCI = process.env.CI === 'true';

// Main verification function
async function verifyTestSuite() {
  log.header('🧪 Test Suite Verification');
  
  const results = {
    passed: true,
    components: 0,
    coverage: {
      lines: 0,
      statements: 0,
      branches: 0,
      functions: 0,
    },
    executionTime: 0,
    errors: [],
  };

  try {
    // Step 1: Check test files exist
    log.info('Checking test files...');
    const componentsDir = path.join(__dirname, '../src/components');
    const componentFolders = fs.readdirSync(componentsDir).filter(item => {
      const itemPath = path.join(componentsDir, item);
      return fs.statSync(itemPath).isDirectory();
    });

    let testFileCount = 0;
    componentFolders.forEach(folder => {
      const testFile = path.join(componentsDir, folder, `${folder}.test.tsx`);
      if (fs.existsSync(testFile)) {
        testFileCount++;
      }
    });

    results.components = testFileCount;
    
    if (testFileCount === CONFIG.expectedComponents) {
      log.success(`All ${CONFIG.expectedComponents} components have test files`);
    } else {
      log.warning(`Found ${testFileCount}/${CONFIG.expectedComponents} test files`);
      results.errors.push(`Missing ${CONFIG.expectedComponents - testFileCount} test files`);
    }

    // Step 2: Run tests with coverage
    log.info('Running test suite...');
    const startTime = Date.now();
    
    try {
      const output = execSync('npm run test:coverage -- --silent', {
        encoding: 'utf8',
        stdio: 'pipe',
      });
      
      results.executionTime = Date.now() - startTime;
      
      // Parse coverage from output or coverage file
      if (fs.existsSync(path.join(__dirname, '../coverage/coverage-summary.json'))) {
        const coverageSummary = JSON.parse(
          fs.readFileSync(path.join(__dirname, '../coverage/coverage-summary.json'), 'utf8')
        );
        
        const total = coverageSummary.total;
        results.coverage = {
          lines: total.lines.pct,
          statements: total.statements.pct,
          branches: total.branches.pct,
          functions: total.functions.pct,
        };
      }
      
      log.success(`Tests completed in ${(results.executionTime / 1000).toFixed(2)}s`);
    } catch (error) {
      log.error('Test execution failed');
      results.errors.push('Test execution failed: ' + error.message);
      results.passed = false;
    }

    // Step 3: Verify coverage thresholds
    log.info('Verifying coverage thresholds...');
    Object.keys(CONFIG.targetCoverage).forEach(metric => {
      const actual = results.coverage[metric];
      const target = CONFIG.targetCoverage[metric];
      
      if (actual >= target) {
        log.success(`${metric}: ${actual.toFixed(2)}% (target: ${target}%)`);
      } else {
        log.error(`${metric}: ${actual.toFixed(2)}% (target: ${target}%)`);
        results.errors.push(`${metric} coverage below target`);
        results.passed = false;
      }
    });

    // Step 4: Check execution time
    if (results.executionTime > CONFIG.maxExecutionTime) {
      log.warning(`Execution time exceeded: ${(results.executionTime / 1000).toFixed(2)}s`);
      results.errors.push('Execution time exceeded maximum');
    }

    // Step 5: Generate report
    log.header('📊 Verification Report');
    
    console.log(`
${colors.bright}Test Statistics:${colors.reset}
• Components Tested: ${results.components}/${CONFIG.expectedComponents}
• Execution Time: ${(results.executionTime / 1000).toFixed(2)}s
• CI Environment: ${isCI ? 'Yes' : 'No'}

${colors.bright}Coverage Results:${colors.reset}
• Lines: ${results.coverage.lines.toFixed(2)}%
• Statements: ${results.coverage.statements.toFixed(2)}%
• Branches: ${results.coverage.branches.toFixed(2)}%
• Functions: ${results.coverage.functions.toFixed(2)}%
    `);

    // Step 6: Final status
    if (results.passed) {
      log.header('✅ VERIFICATION PASSED');
      console.log(`${colors.green}All test suite requirements met!${colors.reset}`);
      
      // Special message for 100% coverage
      if (Object.values(results.coverage).every(v => v === 100)) {
        console.log(`\n${colors.bright}${colors.green}🎉 PERFECT SCORE! 100% Coverage Achieved! 🎉${colors.reset}`);
      }
    } else {
      log.header('❌ VERIFICATION FAILED');
      console.log(`${colors.red}Issues found:${colors.reset}`);
      results.errors.forEach(error => console.log(`  • ${error}`));
      process.exit(1);
    }

    // Step 7: Save results to file (for CI/CD)
    if (isCI) {
      const resultsFile = path.join(__dirname, '../test-results.json');
      fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
      log.info(`Results saved to ${resultsFile}`);
    }

  } catch (error) {
    log.error(`Unexpected error: ${error.message}`);
    process.exit(1);
  }
}

// Run verification
verifyTestSuite().catch(error => {
  log.error(`Fatal error: ${error.message}`);
  process.exit(1);
});
