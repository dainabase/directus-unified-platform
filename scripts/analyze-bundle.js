#!/usr/bin/env node

/**
 * Bundle Analyzer Script
 * Analyzes the UI package bundle and provides optimization recommendations
 * 
 * Usage: node scripts/analyze-bundle.js
 */

import { readFileSync, readdirSync, statSync, writeFileSync } from 'fs';
import { join, extname } from 'path';
import { gzipSync } from 'zlib';

const DIST_DIR = join(process.cwd(), 'packages/ui/dist');
const THRESHOLD_WARNING = 400; // KB
const THRESHOLD_CRITICAL = 500; // KB

// Colors for terminal output
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

/**
 * Get all files in directory recursively
 */
function getAllFiles(dir, files = []) {
  const items = readdirSync(dir);
  
  for (const item of items) {
    const path = join(dir, item);
    const stat = statSync(path);
    
    if (stat.isDirectory()) {
      getAllFiles(path, files);
    } else {
      files.push(path);
    }
  }
  
  return files;
}

/**
 * Analyze a single file
 */
function analyzeFile(filePath) {
  const stat = statSync(filePath);
  const content = readFileSync(filePath);
  const gzipped = gzipSync(content);
  const ext = extname(filePath);
  
  return {
    path: filePath.replace(DIST_DIR, ''),
    size: stat.size,
    sizeKB: (stat.size / 1024).toFixed(2),
    gzipSize: gzipped.length,
    gzipSizeKB: (gzipped.length / 1024).toFixed(2),
    compressionRatio: ((1 - gzipped.length / stat.size) * 100).toFixed(1),
    type: ext.substring(1),
  };
}

/**
 * Analyze imports and dependencies
 */
function analyzeImports(content) {
  const imports = new Map();
  
  // Match import statements
  const importRegex = /from\s+['"](@?[\w\-\/]+)['"]/g;
  let match;
  
  while ((match = importRegex.exec(content)) !== null) {
    const pkg = match[1];
    imports.set(pkg, (imports.get(pkg) || 0) + 1);
  }
  
  // Match dynamic imports
  const dynamicImportRegex = /import\(['"](@?[\w\-\/]+)['"]\)/g;
  while ((match = dynamicImportRegex.exec(content)) !== null) {
    const pkg = match[1];
    imports.set(pkg + ' (dynamic)', (imports.get(pkg + ' (dynamic)') || 0) + 1);
  }
  
  return imports;
}

/**
 * Find duplicate code patterns
 */
function findDuplicates(files) {
  const patterns = new Map();
  const duplicates = [];
  
  for (const file of files) {
    if (file.type !== 'js') continue;
    
    const content = readFileSync(join(DIST_DIR, file.path), 'utf-8');
    
    // Look for repeated patterns (simplified)
    const functions = content.match(/function\s+\w+\s*\([^)]*\)\s*{[^}]+}/g) || [];
    
    for (const func of functions) {
      const normalized = func.replace(/\s+/g, ' ').trim();
      if (patterns.has(normalized)) {
        duplicates.push({
          pattern: normalized.substring(0, 100) + '...',
          files: [patterns.get(normalized), file.path],
        });
      } else {
        patterns.set(normalized, file.path);
      }
    }
  }
  
  return duplicates;
}

/**
 * Generate optimization recommendations
 */
function generateRecommendations(analysis) {
  const recommendations = [];
  
  // Check total size
  if (analysis.totalSizeKB > THRESHOLD_CRITICAL) {
    recommendations.push({
      priority: 'CRITICAL',
      issue: `Bundle size (${analysis.totalSizeKB}KB) exceeds critical threshold (${THRESHOLD_CRITICAL}KB)`,
      solution: 'Implement immediate code splitting and lazy loading',
    });
  } else if (analysis.totalSizeKB > THRESHOLD_WARNING) {
    recommendations.push({
      priority: 'HIGH',
      issue: `Bundle size (${analysis.totalSizeKB}KB) exceeds warning threshold (${THRESHOLD_WARNING}KB)`,
      solution: 'Consider lazy loading heavy components',
    });
  }
  
  // Check individual files
  for (const file of analysis.files) {
    if (parseFloat(file.sizeKB) > 50) {
      recommendations.push({
        priority: 'MEDIUM',
        issue: `Large file detected: ${file.path} (${file.sizeKB}KB)`,
        solution: 'Consider splitting this file or lazy loading',
      });
    }
    
    if (parseFloat(file.compressionRatio) < 50) {
      recommendations.push({
        priority: 'LOW',
        issue: `Poor compression ratio: ${file.path} (${file.compressionRatio}%)`,
        solution: 'File may contain already compressed data or images',
      });
    }
  }
  
  // Check for duplicates
  if (analysis.duplicates.length > 0) {
    recommendations.push({
      priority: 'MEDIUM',
      issue: `Found ${analysis.duplicates.length} potential code duplications`,
      solution: 'Extract common code into shared utilities',
    });
  }
  
  return recommendations;
}

/**
 * Main analysis function
 */
function analyzeBunde() {
  console.log(`${colors.cyan}${colors.bright}📦 Bundle Analysis Tool${colors.reset}`);
  console.log(`${colors.cyan}${'='.repeat(50)}${colors.reset}\n`);
  
  try {
    // Get all files
    const allFiles = getAllFiles(DIST_DIR);
    const files = allFiles.map(analyzeFile);
    
    // Calculate totals
    const totalSize = files.reduce((sum, f) => sum + f.size, 0);
    const totalGzipSize = files.reduce((sum, f) => sum + f.gzipSize, 0);
    
    // Group by type
    const byType = files.reduce((acc, file) => {
      if (!acc[file.type]) {
        acc[file.type] = { count: 0, size: 0, gzipSize: 0 };
      }
      acc[file.type].count++;
      acc[file.type].size += file.size;
      acc[file.type].gzipSize += file.gzipSize;
      return acc;
    }, {});
    
    // Find duplicates
    const duplicates = findDuplicates(files);
    
    // Analyze imports in JS files
    const allImports = new Map();
    for (const file of files.filter(f => f.type === 'js')) {
      const content = readFileSync(join(DIST_DIR, file.path), 'utf-8');
      const imports = analyzeImports(content);
      imports.forEach((count, pkg) => {
        allImports.set(pkg, (allImports.get(pkg) || 0) + count);
      });
    }
    
    // Create analysis object
    const analysis = {
      timestamp: new Date().toISOString(),
      totalSize,
      totalSizeKB: (totalSize / 1024).toFixed(2),
      totalGzipSize,
      totalGzipSizeKB: (totalGzipSize / 1024).toFixed(2),
      compressionRatio: ((1 - totalGzipSize / totalSize) * 100).toFixed(1),
      fileCount: files.length,
      files: files.sort((a, b) => b.size - a.size),
      byType,
      duplicates,
      topImports: Array.from(allImports.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10),
    };
    
    // Generate recommendations
    const recommendations = generateRecommendations(analysis);
    analysis.recommendations = recommendations;
    
    // Display results
    console.log(`${colors.bright}📊 Summary${colors.reset}`);
    console.log(`Total Size: ${colors.yellow}${analysis.totalSizeKB}KB${colors.reset}`);
    console.log(`Gzip Size: ${colors.green}${analysis.totalGzipSizeKB}KB${colors.reset}`);
    console.log(`Compression: ${colors.cyan}${analysis.compressionRatio}%${colors.reset}`);
    console.log(`Files: ${analysis.fileCount}\n`);
    
    // Display by type
    console.log(`${colors.bright}📁 Files by Type${colors.reset}`);
    Object.entries(byType).forEach(([type, data]) => {
      const sizeKB = (data.size / 1024).toFixed(2);
      const gzipKB = (data.gzipSize / 1024).toFixed(2);
      console.log(`${type.toUpperCase()}: ${data.count} files, ${sizeKB}KB (${gzipKB}KB gzipped)`);
    });
    console.log();
    
    // Display largest files
    console.log(`${colors.bright}🏆 Largest Files${colors.reset}`);
    files.slice(0, 5).forEach((file, i) => {
      const color = parseFloat(file.sizeKB) > 50 ? colors.red : colors.green;
      console.log(`${i + 1}. ${file.path}: ${color}${file.sizeKB}KB${colors.reset} (${file.gzipSizeKB}KB gzipped)`);
    });
    console.log();
    
    // Display top imports
    if (analysis.topImports.length > 0) {
      console.log(`${colors.bright}📦 Top Imports${colors.reset}`);
      analysis.topImports.forEach(([pkg, count]) => {
        console.log(`  ${pkg}: ${count} references`);
      });
      console.log();
    }
    
    // Display recommendations
    if (recommendations.length > 0) {
      console.log(`${colors.bright}💡 Recommendations${colors.reset}`);
      const grouped = recommendations.reduce((acc, rec) => {
        if (!acc[rec.priority]) acc[rec.priority] = [];
        acc[rec.priority].push(rec);
        return acc;
      }, {});
      
      for (const priority of ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']) {
        if (grouped[priority]) {
          const color = priority === 'CRITICAL' ? colors.red :
                       priority === 'HIGH' ? colors.yellow :
                       priority === 'MEDIUM' ? colors.blue : colors.cyan;
          
          console.log(`\n${color}${colors.bright}${priority} Priority:${colors.reset}`);
          grouped[priority].forEach(rec => {
            console.log(`  ❗ ${rec.issue}`);
            console.log(`     → ${rec.solution}`);
          });
        }
      }
      console.log();
    }
    
    // Save detailed report
    const reportPath = join(process.cwd(), 'bundle-analysis.json');
    writeFileSync(reportPath, JSON.stringify(analysis, null, 2));
    console.log(`${colors.green}✅ Detailed report saved to: ${reportPath}${colors.reset}`);
    
    // Exit with appropriate code
    const criticalCount = recommendations.filter(r => r.priority === 'CRITICAL').length;
    if (criticalCount > 0) {
      console.log(`\n${colors.red}❌ Analysis failed: ${criticalCount} critical issues found${colors.reset}`);
      process.exit(1);
    }
    
    console.log(`\n${colors.green}✅ Analysis complete!${colors.reset}`);
    
  } catch (error) {
    console.error(`${colors.red}❌ Error during analysis: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Run the analysis
analyzeBunde();
