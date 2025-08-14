#!/usr/bin/env node

/**
 * Pre-publish verification script for @dainabase/ui
 * Ensures all requirements are met before NPM publication
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  header: (msg) => console.log(`\n${colors.bold}${colors.blue}═══ ${msg} ═══${colors.reset}\n`)
};

let errors = 0;
let warnings = 0;

// Check function
function check(condition, successMsg, errorMsg, isWarning = false) {
  if (condition) {
    log.success(successMsg);
    return true;
  } else {
    if (isWarning) {
      log.warning(errorMsg);
      warnings++;
    } else {
      log.error(errorMsg);
      errors++;
    }
    return false;
  }
}

// Main verification
async function verify() {
  console.log(`${colors.bold}${colors.blue}
╔══════════════════════════════════════════════════════════════╗
║     @dainabase/ui v1.2.0 - Pre-Publish Verification         ║
╚══════════════════════════════════════════════════════════════╝
${colors.reset}`);

  log.header('1. Package Configuration');
  
  // Check package.json
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  const packageExists = fs.existsSync(packageJsonPath);
  check(packageExists, 'package.json exists', 'package.json not found');
  
  if (packageExists) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    check(packageJson.name === '@dainabase/ui', 
      `Package name correct: ${packageJson.name}`,
      'Package name incorrect');
    
    check(packageJson.version === '1.2.0',
      `Version correct: ${packageJson.version}`,
      `Version mismatch: expected 1.2.0, got ${packageJson.version}`);
    
    check(packageJson.main && packageJson.module && packageJson.types,
      'Entry points defined (main, module, types)',
      'Missing entry points');
    
    check(packageJson.publishConfig?.access === 'public',
      'Publish config set to public',
      'Publish config not set to public');
  }

  log.header('2. Required Files');
  
  // Check required files
  const requiredFiles = [
    'README.md',
    'CHANGELOG.md',
    'LICENSE',
    'tsconfig.json',
    'jest.config.js'
  ];
  
  requiredFiles.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    check(fs.existsSync(filePath),
      `${file} exists`,
      `${file} missing`,
      file === 'LICENSE'); // LICENSE is a warning, not error
  });

  log.header('3. Build Artifacts');
  
  // Check dist folder
  const distPath = path.join(__dirname, '..', 'dist');
  const distExists = fs.existsSync(distPath);
  check(distExists,
    'dist/ folder exists',
    'dist/ folder missing - run npm run build',
    true);
  
  if (distExists) {
    const distFiles = fs.readdirSync(distPath);
    check(distFiles.includes('index.js'),
      'index.js found in dist/',
      'index.js missing in dist/');
    check(distFiles.includes('index.mjs'),
      'index.mjs found in dist/',
      'index.mjs missing in dist/');
    check(distFiles.includes('index.d.ts'),
      'index.d.ts found in dist/',
      'index.d.ts missing in dist/');
  }

  log.header('4. Test Files');
  
  // Check test files
  const testFiles = [
    'src/components/button/button.test.tsx',
    'src/components/input/input.test.tsx',
    'src/components/select/select.test.tsx',
    'src/components/dialog/dialog.test.tsx',
    'src/components/card/card.test.tsx',
    'src/components/form/form.test.tsx'
  ];
  
  let testCount = 0;
  testFiles.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    if (fs.existsSync(filePath)) {
      testCount++;
      log.success(`Test file: ${file}`);
    }
  });
  
  check(testCount >= 6,
    `${testCount}/6 component tests found`,
    `Only ${testCount}/6 tests found`,
    testCount >= 4);

  log.header('5. CI/CD Workflows');
  
  // Check workflows
  const workflowPath = path.join(__dirname, '..', '..', '..', '.github', 'workflows');
  const workflowFiles = [
    'npm-publish.yml',
    'test-runner.yml',
    'release.yml'
  ];
  
  workflowFiles.forEach(file => {
    const filePath = path.join(workflowPath, file);
    check(fs.existsSync(filePath),
      `Workflow: ${file}`,
      `Workflow missing: ${file}`,
      true);
  });

  log.header('6. Bundle Size Check');
  
  // Estimate bundle size
  if (distExists) {
    const distPath = path.join(__dirname, '..', 'dist');
    let totalSize = 0;
    
    fs.readdirSync(distPath).forEach(file => {
      if (file.endsWith('.js') || file.endsWith('.mjs')) {
        const stats = fs.statSync(path.join(distPath, file));
        totalSize += stats.size;
      }
    });
    
    const sizeKB = (totalSize / 1024).toFixed(2);
    check(totalSize < 100 * 1024,
      `Bundle size: ${sizeKB}KB (under 100KB limit)`,
      `Bundle size: ${sizeKB}KB (exceeds 100KB limit)`,
      totalSize < 150 * 1024);
  }

  // Final summary
  console.log('\n' + '═'.repeat(60));
  console.log(`${colors.bold}VERIFICATION SUMMARY${colors.reset}`);
  console.log('═'.repeat(60));
  
  if (errors === 0 && warnings === 0) {
    console.log(`${colors.green}${colors.bold}
    ✨ ALL CHECKS PASSED! ✨
    
    Package is ready for publication!
    Run: npm publish
    ${colors.reset}`);
    process.exit(0);
  } else {
    console.log(`
    Errors: ${errors > 0 ? colors.red : colors.green}${errors}${colors.reset}
    Warnings: ${warnings > 0 ? colors.yellow : colors.green}${warnings}${colors.reset}
    `);
    
    if (errors > 0) {
      console.log(`${colors.red}${colors.bold}
    ⚠️  VERIFICATION FAILED
    
    Please fix the errors before publishing.
    ${colors.reset}`);
      process.exit(1);
    } else {
      console.log(`${colors.yellow}${colors.bold}
    ⚠️  VERIFICATION PASSED WITH WARNINGS
    
    You can publish, but consider fixing warnings.
    ${colors.reset}`);
      process.exit(0);
    }
  }
}

// Run verification
verify().catch(error => {
  console.error(`${colors.red}Verification script error:`, error);
  process.exit(1);
});
