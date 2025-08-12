#!/usr/bin/env node

/**
 * Bundle Size Analyzer
 * Analyzes the build output and generates a detailed report
 */

const fs = require('fs');
const path = require('path');
const { gzipSync } = require('zlib');
const chalk = require('chalk');

// Configuration
const CONFIG = {
  distPath: path.join(__dirname, '../dist'),
  limits: {
    total: 500 * 1024,      // 500KB
    mainBundle: 200 * 1024,  // 200KB
    cssBundle: 100 * 1024,   // 100KB
    chunkSize: 50 * 1024,    // 50KB per chunk
  },
  reportPath: path.join(__dirname, '../bundle-report.json'),
};

/**
 * Get file size in bytes
 */
function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch (error) {
    return 0;
  }
}

/**
 * Get gzipped size
 */
function getGzippedSize(filePath) {
  try {
    const content = fs.readFileSync(filePath);
    const gzipped = gzipSync(content);
    return gzipped.length;
  } catch (error) {
    return 0;
  }
}

/**
 * Format bytes to human readable
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Analyze a single file
 */
function analyzeFile(filePath) {
  const size = getFileSize(filePath);
  const gzipped = getGzippedSize(filePath);
  const name = path.basename(filePath);
  const ext = path.extname(filePath);
  
  return {
    name,
    path: filePath,
    ext,
    size,
    gzipped,
    sizeFormatted: formatBytes(size),
    gzippedFormatted: formatBytes(gzipped),
    compression: size > 0 ? ((1 - gzipped / size) * 100).toFixed(1) + '%' : '0%',
  };
}

/**
 * Recursively get all files in directory
 */
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);
  
  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
    } else {
      arrayOfFiles.push(filePath);
    }
  });
  
  return arrayOfFiles;
}

/**
 * Main analysis function
 */
function analyzeBundles() {
  console.log(chalk.blue('\n📦 Analyzing bundle sizes...\n'));
  
  if (!fs.existsSync(CONFIG.distPath)) {
    console.log(chalk.red('Error: dist directory not found. Run build first.'));
    process.exit(1);
  }
  
  const allFiles = getAllFiles(CONFIG.distPath);
  const analysis = allFiles.map(analyzeFile);
  
  // Group by file type
  const byType = {
    js: analysis.filter(f => f.ext === '.js'),
    css: analysis.filter(f => f.ext === '.css'),
    map: analysis.filter(f => f.ext === '.map'),
    other: analysis.filter(f => !['.js', '.css', '.map'].includes(f.ext)),
  };
  
  // Calculate totals
  const totals = {
    size: analysis.reduce((sum, f) => sum + f.size, 0),
    gzipped: analysis.reduce((sum, f) => sum + f.gzipped, 0),
    jsSize: byType.js.reduce((sum, f) => sum + f.size, 0),
    jsGzipped: byType.js.reduce((sum, f) => sum + f.gzipped, 0),
    cssSize: byType.css.reduce((sum, f) => sum + f.size, 0),
    cssGzipped: byType.css.reduce((sum, f) => sum + f.gzipped, 0),
  };
  
  // Find largest files
  const largest = [...analysis]
    .filter(f => f.ext !== '.map')
    .sort((a, b) => b.size - a.size)
    .slice(0, 5);
  
  // Check limits
  const violations = [];
  if (totals.size > CONFIG.limits.total) {
    violations.push(`Total size (${formatBytes(totals.size)}) exceeds limit (${formatBytes(CONFIG.limits.total)})`);
  }
  
  // Generate report
  const report = {
    timestamp: new Date().toISOString(),
    totals: {
      ...totals,
      sizeFormatted: formatBytes(totals.size),
      gzippedFormatted: formatBytes(totals.gzipped),
      jsSizeFormatted: formatBytes(totals.jsSize),
      jsGzippedFormatted: formatBytes(totals.jsGzipped),
      cssSizeFormatted: formatBytes(totals.cssSize),
      cssGzippedFormatted: formatBytes(totals.cssGzipped),
    },
    byType,
    largest,
    violations,
    limits: CONFIG.limits,
    files: analysis,
  };
  
  // Print summary
  console.log(chalk.bold('Summary:'));
  console.log(`  Total Size: ${chalk.cyan(report.totals.sizeFormatted)} (gzipped: ${chalk.cyan(report.totals.gzippedFormatted)})`);
  console.log(`  JavaScript: ${chalk.cyan(report.totals.jsSizeFormatted)} (gzipped: ${chalk.cyan(report.totals.jsGzippedFormatted)})`);
  console.log(`  CSS: ${chalk.cyan(report.totals.cssSizeFormatted)} (gzipped: ${chalk.cyan(report.totals.cssGzippedFormatted)})`);
  console.log(`  Files: ${chalk.cyan(analysis.length)} total`);
  
  console.log('\n' + chalk.bold('Largest Files:'));
  largest.forEach((file, i) => {
    console.log(`  ${i + 1}. ${file.name}: ${chalk.cyan(file.sizeFormatted)} (gzipped: ${chalk.cyan(file.gzippedFormatted)})`);
  });
  
  if (violations.length > 0) {
    console.log('\n' + chalk.red.bold('⚠️  Size Limit Violations:'));
    violations.forEach(v => console.log('  ' + chalk.red(v)));
  } else {
    console.log('\n' + chalk.green.bold('✅ All size limits passed!'));
  }
  
  // Save report
  fs.writeFileSync(CONFIG.reportPath, JSON.stringify(report, null, 2));
  console.log('\n' + chalk.gray(`Report saved to: ${CONFIG.reportPath}`));
  
  // Exit with error if violations
  if (violations.length > 0) {
    process.exit(1);
  }
}

// Run analysis
if (require.main === module) {
  analyzeBundles();
}

module.exports = { analyzeBundles, analyzeFile, formatBytes };