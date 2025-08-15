// packages/ui/scripts/pre-release-check.js
// Pre-release validation script for v1.3.0
// Run this before npm publish to ensure everything is ready

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Pre-Release Check for @dainabase/ui v1.3.0');
console.log('='.repeat(50));

const checks = {
  passed: [],
  failed: [],
  warnings: []
};

// Helper function for checking files
function checkFile(filePath, description) {
  const fullPath = path.resolve(process.cwd(), filePath);
  if (fs.existsSync(fullPath)) {
    checks.passed.push(`✅ ${description}: ${filePath}`);
    return true;
  } else {
    checks.failed.push(`❌ ${description}: ${filePath} NOT FOUND`);
    return false;
  }
}

// Helper function for checking JSON files
function checkJSON(filePath, description) {
  const fullPath = path.resolve(process.cwd(), filePath);
  try {
    const content = fs.readFileSync(fullPath, 'utf8');
    JSON.parse(content);
    checks.passed.push(`✅ ${description}: Valid JSON`);
    return true;
  } catch (error) {
    checks.failed.push(`❌ ${description}: Invalid JSON - ${error.message}`);
    return false;
  }
}

// Helper function for checking package.json fields
function checkPackageField(pkg, field, expected, description) {
  const value = field.split('.').reduce((obj, key) => obj?.[key], pkg);
  if (value === expected) {
    checks.passed.push(`✅ ${description}: ${value}`);
    return true;
  } else {
    checks.failed.push(`❌ ${description}: Expected ${expected}, got ${value}`);
    return false;
  }
}

// 1. Check Critical Files
console.log('\n📁 Checking Critical Files...');
checkFile('package.json', 'Package manifest');
checkFile('tsup.config.ts', 'Build configuration');
checkFile('src/index.ts', 'Main entry point');
checkFile('README.md', 'Documentation');
checkFile('LICENSE', 'License file');
checkFile('CHANGELOG.md', 'Change log');
checkFile('CONTRIBUTING.md', 'Contributing guide');

// 2. Validate package.json
console.log('\n📦 Validating package.json...');
const packagePath = path.resolve(process.cwd(), 'package.json');
let pkg;
try {
  pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  checks.passed.push('✅ package.json is valid JSON');
} catch (error) {
  checks.failed.push(`❌ package.json parse error: ${error.message}`);
  process.exit(1);
}

// Check version
checkPackageField(pkg, 'version', '1.3.0', 'Version');
checkPackageField(pkg, 'name', '@dainabase/ui', 'Package name');

// Check required fields
if (pkg.main) checks.passed.push(`✅ Main entry: ${pkg.main}`);
else checks.failed.push('❌ Missing main entry point');

if (pkg.module) checks.passed.push(`✅ Module entry: ${pkg.module}`);
else checks.failed.push('❌ Missing module entry point');

if (pkg.types) checks.passed.push(`✅ TypeScript types: ${pkg.types}`);
else checks.failed.push('❌ Missing TypeScript types');

if (pkg.files && pkg.files.length > 0) {
  checks.passed.push(`✅ Files field configured: ${pkg.files.length} entries`);
} else {
  checks.warnings.push('⚠️ No files field configured - all files will be published');
}

// Check exports
if (pkg.exports) {
  const exportKeys = Object.keys(pkg.exports);
  checks.passed.push(`✅ Exports configured: ${exportKeys.length} paths`);
  
  // Check main export
  if (pkg.exports['.']) {
    checks.passed.push('✅ Main export path configured');
  } else {
    checks.failed.push('❌ Main export path missing');
  }
  
  // Check lazy exports
  if (pkg.exports['./lazy/*']) {
    checks.passed.push('✅ Lazy loading exports configured');
  } else {
    checks.warnings.push('⚠️ Lazy loading exports not configured');
  }
} else {
  checks.warnings.push('⚠️ No exports field - using legacy resolution');
}

// 3. Check Build Output
console.log('\n🏗️ Checking Build Output...');
checkFile('dist/index.js', 'CommonJS build');
checkFile('dist/index.mjs', 'ESM build');
checkFile('dist/index.d.ts', 'TypeScript definitions');

// Check bundle size
const distPath = path.resolve(process.cwd(), 'dist');
if (fs.existsSync(distPath)) {
  try {
    const stats = fs.statSync(path.join(distPath, 'index.js'));
    const sizeKB = (stats.size / 1024).toFixed(2);
    
    if (stats.size <= 40 * 1024) {
      checks.passed.push(`✅ Bundle size: ${sizeKB}KB (under 40KB target)`);
    } else {
      checks.failed.push(`❌ Bundle size: ${sizeKB}KB (exceeds 40KB target)`);
    }
  } catch (error) {
    checks.warnings.push('⚠️ Could not check bundle size');
  }
} else {
  checks.failed.push('❌ Build output directory not found');
}

// 4. Check Dependencies
console.log('\n📚 Checking Dependencies...');
if (pkg.dependencies) {
  const depCount = Object.keys(pkg.dependencies).length;
  checks.passed.push(`✅ Dependencies: ${depCount} packages`);
  
  // Check for problematic dependencies
  const problematic = ['lodash', 'moment', 'jquery'];
  const found = problematic.filter(dep => pkg.dependencies[dep]);
  if (found.length > 0) {
    checks.warnings.push(`⚠️ Large dependencies found: ${found.join(', ')}`);
  }
}

if (pkg.peerDependencies) {
  const peerCount = Object.keys(pkg.peerDependencies).length;
  checks.passed.push(`✅ Peer dependencies: ${peerCount} packages`);
  
  // Check React version
  if (pkg.peerDependencies.react) {
    const reactVersion = pkg.peerDependencies.react;
    if (reactVersion.includes('18')) {
      checks.passed.push(`✅ React 18 support: ${reactVersion}`);
    } else {
      checks.warnings.push(`⚠️ React version: ${reactVersion} (consider React 18)`);
    }
  }
}

// 5. Check TypeScript Configuration
console.log('\n🔷 Checking TypeScript...');
checkFile('tsconfig.json', 'TypeScript config');

// 6. Check Test Coverage
console.log('\n🧪 Checking Test Coverage...');
const coveragePath = path.resolve(process.cwd(), 'coverage/coverage-summary.json');
if (fs.existsSync(coveragePath)) {
  try {
    const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
    const total = coverage.total;
    
    if (total) {
      const metrics = ['lines', 'statements', 'functions', 'branches'];
      metrics.forEach(metric => {
        const pct = total[metric]?.pct || 0;
        if (pct >= 90) {
          checks.passed.push(`✅ ${metric} coverage: ${pct}%`);
        } else if (pct >= 80) {
          checks.warnings.push(`⚠️ ${metric} coverage: ${pct}% (target: 90%)`);
        } else {
          checks.failed.push(`❌ ${metric} coverage: ${pct}% (minimum: 80%)`);
        }
      });
    }
  } catch (error) {
    checks.warnings.push('⚠️ Could not parse coverage report');
  }
} else {
  checks.warnings.push('⚠️ No coverage report found - run tests first');
}

// 7. Check Documentation
console.log('\n📚 Checking Documentation...');
checkFile('README.md', 'README');
checkFile('docs/API_REFERENCE.md', 'API Reference');
checkFile('docs/GETTING_STARTED.md', 'Getting Started Guide');
checkFile('docs/migrations/v1.0-to-v1.3.md', 'Migration Guide');

// 8. Check License
console.log('\n⚖️ Checking License...');
if (pkg.license) {
  checks.passed.push(`✅ License: ${pkg.license}`);
} else {
  checks.failed.push('❌ No license specified');
}

// 9. Check Repository Info
console.log('\n🔗 Checking Repository Info...');
if (pkg.repository) {
  checks.passed.push(`✅ Repository: ${pkg.repository.url || pkg.repository}`);
} else {
  checks.warnings.push('⚠️ No repository information');
}

if (pkg.homepage) {
  checks.passed.push(`✅ Homepage: ${pkg.homepage}`);
} else {
  checks.warnings.push('⚠️ No homepage specified');
}

// 10. NPM Publish Dry Run
console.log('\n📤 Running NPM Publish Dry Run...');
try {
  // Check if logged in to npm
  const whoami = execSync('npm whoami', { encoding: 'utf8' }).trim();
  checks.passed.push(`✅ NPM user: ${whoami}`);
  
  // Dry run
  console.log('   Running npm publish --dry-run...');
  const dryRun = execSync('npm publish --dry-run', { encoding: 'utf8' });
  
  // Check if package would be published
  if (dryRun.includes('npm notice')) {
    checks.passed.push('✅ NPM publish dry run successful');
    
    // Extract package size from output
    const sizeMatch = dryRun.match(/package size:\s*([\d.]+\s*[KM]B)/i);
    if (sizeMatch) {
      checks.passed.push(`✅ NPM package size: ${sizeMatch[1]}`);
    }
    
    // Extract file count
    const filesMatch = dryRun.match(/files:\s*(\d+)/i);
    if (filesMatch) {
      checks.passed.push(`✅ Files to publish: ${filesMatch[1]}`);
    }
  }
} catch (error) {
  if (error.message.includes('ENEEDAUTH')) {
    checks.failed.push('❌ Not logged in to NPM - run "npm login" first');
  } else if (error.message.includes('E402')) {
    checks.warnings.push('⚠️ Package requires payment - check NPM account');
  } else {
    checks.warnings.push(`⚠️ NPM dry run issue: ${error.message.split('\n')[0]}`);
  }
}

// 11. Check for Security Issues
console.log('\n🔒 Checking Security...');
try {
  const audit = execSync('npm audit --json', { encoding: 'utf8' });
  const auditResult = JSON.parse(audit);
  
  if (auditResult.metadata) {
    const { vulnerabilities } = auditResult.metadata;
    const total = vulnerabilities.total || 0;
    
    if (total === 0) {
      checks.passed.push('✅ No security vulnerabilities found');
    } else {
      const critical = vulnerabilities.critical || 0;
      const high = vulnerabilities.high || 0;
      
      if (critical > 0 || high > 0) {
        checks.failed.push(`❌ Security issues: ${critical} critical, ${high} high`);
      } else {
        checks.warnings.push(`⚠️ Security issues: ${total} low/moderate severity`);
      }
    }
  }
} catch (error) {
  checks.warnings.push('⚠️ Could not run security audit');
}

// =============================================================================
// RESULTS SUMMARY
// =============================================================================

console.log('\n' + '='.repeat(50));
console.log('📊 PRE-RELEASE CHECK SUMMARY');
console.log('='.repeat(50));

// Print all checks
if (checks.passed.length > 0) {
  console.log('\n✅ PASSED CHECKS:');
  checks.passed.forEach(check => console.log(`   ${check}`));
}

if (checks.warnings.length > 0) {
  console.log('\n⚠️ WARNINGS:');
  checks.warnings.forEach(warning => console.log(`   ${warning}`));
}

if (checks.failed.length > 0) {
  console.log('\n❌ FAILED CHECKS:');
  checks.failed.forEach(fail => console.log(`   ${fail}`));
}

// Final verdict
console.log('\n' + '='.repeat(50));
if (checks.failed.length === 0) {
  console.log('🎉 READY FOR RELEASE! All critical checks passed.');
  console.log(`⚠️ ${checks.warnings.length} warnings to review (non-blocking)`);
  console.log('\n📦 To publish:');
  console.log('   1. Review warnings above');
  console.log('   2. Run: npm publish');
  console.log('   3. Create GitHub release tag v1.3.0');
  console.log('   4. Announce on Discord/Twitter');
  process.exit(0);
} else {
  console.log(`❌ NOT READY FOR RELEASE! ${checks.failed.length} critical issues found.`);
  console.log('\n🔧 Fix the issues above and run this script again.');
  process.exit(1);
}
