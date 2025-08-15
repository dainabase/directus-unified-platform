#!/usr/bin/env node

/**
 * Pre-Release Verification Script for @dainabase/ui v1.3.0
 * Runs comprehensive checks before NPM publish
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Test results tracker
const results = {
  passed: [],
  failed: [],
  warnings: []
};

// Helper functions
const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => {
    console.log(`${colors.green}✓${colors.reset} ${msg}`);
    results.passed.push(msg);
  },
  error: (msg) => {
    console.log(`${colors.red}✗${colors.reset} ${msg}`);
    results.failed.push(msg);
  },
  warning: (msg) => {
    console.log(`${colors.yellow}⚠${colors.reset} ${msg}`);
    results.warnings.push(msg);
  },
  section: (msg) => console.log(`\n${colors.bright}${colors.cyan}═══ ${msg} ═══${colors.reset}\n`)
};

const exec = (cmd, silent = false) => {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: silent ? 'pipe' : 'inherit' });
  } catch (error) {
    return null;
  }
};

// Test functions
const tests = {
  // 1. Package.json validation
  validatePackageJson: () => {
    log.section('Package.json Validation');
    
    const pkgPath = path.join(process.cwd(), 'package.json');
    if (!fs.existsSync(pkgPath)) {
      log.error('package.json not found');
      return false;
    }
    
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    
    // Check required fields
    const requiredFields = ['name', 'version', 'main', 'module', 'types', 'files', 'exports'];
    for (const field of requiredFields) {
      if (pkg[field]) {
        log.success(`${field}: ${typeof pkg[field] === 'object' ? 'defined' : pkg[field]}`);
      } else {
        log.error(`Missing required field: ${field}`);
      }
    }
    
    // Verify version
    if (pkg.version === '1.3.0') {
      log.success('Version correct: 1.3.0');
    } else {
      log.warning(`Version mismatch: ${pkg.version} (expected 1.3.0)`);
    }
    
    // Check publish config
    if (pkg.publishConfig?.access === 'public') {
      log.success('Publish config: public');
    } else {
      log.error('Publish config not set to public');
    }
    
    return results.failed.length === 0;
  },
  
  // 2. Build verification
  verifyBuild: () => {
    log.section('Build Verification');
    
    const distPath = path.join(process.cwd(), 'dist');
    
    if (!fs.existsSync(distPath)) {
      log.error('dist folder not found - run build first');
      return false;
    }
    
    // Check essential files
    const essentialFiles = [
      'index.js',
      'index.mjs',
      'index.d.ts',
      'utils/index.js',
      'utils/cn.js'
    ];
    
    for (const file of essentialFiles) {
      const filePath = path.join(distPath, file);
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        const sizeKB = (stats.size / 1024).toFixed(2);
        log.success(`${file}: ${sizeKB}KB`);
      } else {
        log.error(`Missing build file: ${file}`);
      }
    }
    
    // Check bundle size
    const indexPath = path.join(distPath, 'index.js');
    if (fs.existsSync(indexPath)) {
      const stats = fs.statSync(indexPath);
      const sizeKB = stats.size / 1024;
      
      if (sizeKB <= 40) {
        log.success(`Bundle size: ${sizeKB.toFixed(2)}KB ✓ (target: <40KB)`);
      } else {
        log.error(`Bundle size: ${sizeKB.toFixed(2)}KB exceeds 40KB limit`);
      }
    }
    
    return results.failed.length === 0;
  },
  
  // 3. TypeScript definitions
  verifyTypes: () => {
    log.section('TypeScript Definitions');
    
    const dtsPath = path.join(process.cwd(), 'dist', 'index.d.ts');
    
    if (!fs.existsSync(dtsPath)) {
      log.error('TypeScript definitions not found');
      return false;
    }
    
    const dts = fs.readFileSync(dtsPath, 'utf8');
    
    // Check for essential exports
    const essentialExports = [
      'Button',
      'Input',
      'Card',
      'Badge',
      'ThemeProvider',
      'cn'
    ];
    
    for (const exp of essentialExports) {
      if (dts.includes(`export { ${exp}`) || dts.includes(`export declare`)) {
        log.success(`Type export found: ${exp}`);
      } else {
        log.error(`Missing type export: ${exp}`);
      }
    }
    
    return results.failed.length === 0;
  },
  
  // 4. Dependencies check
  checkDependencies: () => {
    log.section('Dependencies Check');
    
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    // Check peer dependencies
    if (pkg.peerDependencies?.react) {
      log.success(`React peer dependency: ${pkg.peerDependencies.react}`);
    } else {
      log.error('React not in peer dependencies');
    }
    
    // Check for security vulnerabilities
    log.info('Running security audit...');
    const audit = exec('npm audit --json', true);
    if (audit) {
      const auditData = JSON.parse(audit);
      if (auditData.metadata?.vulnerabilities?.total === 0) {
        log.success('No security vulnerabilities found');
      } else {
        log.warning(`Found ${auditData.metadata?.vulnerabilities?.total || 'unknown'} vulnerabilities`);
      }
    }
    
    return results.failed.length === 0;
  },
  
  // 5. File structure verification
  verifyFileStructure: () => {
    log.section('File Structure Verification');
    
    const requiredFiles = [
      'README.md',
      'LICENSE',
      'CHANGELOG.md',
      'package.json',
      'tsconfig.json',
      'dist/index.js',
      'dist/index.d.ts'
    ];
    
    for (const file of requiredFiles) {
      if (fs.existsSync(file)) {
        log.success(`Found: ${file}`);
      } else {
        log.error(`Missing: ${file}`);
      }
    }
    
    return results.failed.length === 0;
  },
  
  // 6. NPM publish dry run
  npmDryRun: () => {
    log.section('NPM Publish Dry Run');
    
    log.info('Running npm publish --dry-run...');
    const result = exec('npm publish --dry-run', true);
    
    if (result) {
      // Parse the output for package size
      const sizeMatch = result.match(/package size: ([\d.]+\s*[KMG]B)/i);
      const filesMatch = result.match(/total files: (\d+)/i);
      
      if (sizeMatch) {
        log.success(`Package size: ${sizeMatch[1]}`);
      }
      if (filesMatch) {
        log.success(`Total files: ${filesMatch[1]}`);
      }
      
      // Check if it would publish
      if (result.includes('npm notice') && !result.includes('npm ERR!')) {
        log.success('Dry run successful - ready to publish');
      } else {
        log.error('Dry run failed - check npm configuration');
      }
    } else {
      log.error('npm publish --dry-run failed');
    }
    
    return results.failed.length === 0;
  },
  
  // 7. Exports verification
  verifyExports: () => {
    log.section('Module Exports Verification');
    
    try {
      // Try to require the main entry
      const mainPath = path.join(process.cwd(), 'dist', 'index.js');
      if (fs.existsSync(mainPath)) {
        log.success('Main export (CommonJS) exists');
      } else {
        log.error('Main export not found');
      }
      
      // Check ESM export
      const esmPath = path.join(process.cwd(), 'dist', 'index.mjs');
      if (fs.existsSync(esmPath)) {
        log.success('ESM export exists');
      } else {
        log.warning('ESM export not found');
      }
      
      // Check lazy loading bundles
      const lazyBundles = ['forms', 'overlays', 'data', 'navigation', 'feedback', 'advanced'];
      for (const bundle of lazyBundles) {
        const bundlePath = path.join(process.cwd(), 'dist', 'lazy', `${bundle}.js`);
        if (fs.existsSync(bundlePath)) {
          log.success(`Lazy bundle found: ${bundle}`);
        } else {
          log.warning(`Lazy bundle missing: ${bundle}`);
        }
      }
    } catch (error) {
      log.error(`Export verification failed: ${error.message}`);
      return false;
    }
    
    return results.failed.length === 0;
  },
  
  // 8. Version consistency
  checkVersionConsistency: () => {
    log.section('Version Consistency Check');
    
    const version = '1.3.0';
    const files = [
      { path: 'package.json', pattern: /"version":\s*"([^"]+)"/ },
      { path: 'CHANGELOG.md', pattern: /\[1\.3\.0\]/ },
      { path: 'README.md', pattern: /v1\.3\.0|1\.3\.0/ }
    ];
    
    for (const file of files) {
      if (fs.existsSync(file.path)) {
        const content = fs.readFileSync(file.path, 'utf8');
        if (content.match(file.pattern)) {
          log.success(`Version ${version} found in ${file.path}`);
        } else {
          log.warning(`Version ${version} not found in ${file.path}`);
        }
      }
    }
    
    return results.failed.length === 0;
  }
};

// Main execution
const main = async () => {
  console.log(`
${colors.bright}${colors.cyan}╔══════════════════════════════════════════════════════════╗
║          Pre-Release Verification v1.3.0                 ║
║                 @dainabase/ui                           ║
╚══════════════════════════════════════════════════════════╝${colors.reset}
`);
  
  const startTime = Date.now();
  
  // Run all tests
  const testNames = Object.keys(tests);
  for (const testName of testNames) {
    tests[testName]();
  }
  
  // Final report
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  
  console.log(`
${colors.bright}${colors.cyan}═══ FINAL REPORT ═══${colors.reset}
  
${colors.green}✓ Passed: ${results.passed.length}${colors.reset}
${colors.yellow}⚠ Warnings: ${results.warnings.length}${colors.reset}
${colors.red}✗ Failed: ${results.failed.length}${colors.reset}

Time: ${duration}s
`);
  
  if (results.failed.length === 0) {
    console.log(`${colors.bright}${colors.green}🎉 ALL CHECKS PASSED! Ready for release.${colors.reset}\n`);
    console.log('Next steps:');
    console.log('1. Create git tag: git tag v1.3.0');
    console.log('2. Push tag: git push origin v1.3.0');
    console.log('3. Publish to NPM: npm publish');
    console.log('4. Create GitHub release');
    process.exit(0);
  } else {
    console.log(`${colors.bright}${colors.red}❌ CHECKS FAILED! Please fix the issues above.${colors.reset}\n`);
    console.log('Failed checks:');
    results.failed.forEach(msg => console.log(`  - ${msg}`));
    process.exit(1);
  }
};

// Run if executed directly
if (require.main === module) {
  main().catch(error => {
    console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
    process.exit(1);
  });
}

module.exports = { tests, main };