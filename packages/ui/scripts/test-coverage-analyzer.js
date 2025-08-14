#!/usr/bin/env node

/**
 * Component Test Coverage Analyzer
 * 
 * This script analyzes test coverage across all UI components
 * and generates a detailed report of missing tests.
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const COMPONENTS_DIR = path.join(__dirname, '../src/components');
const COVERAGE_GOAL = 100;

class TestCoverageAnalyzer {
  constructor() {
    this.stats = {
      totalComponents: 0,
      componentsWithTests: 0,
      componentsWithStories: 0,
      componentsFullyTested: 0,
      missingTests: [],
      missingStories: [],
      partialCoverage: []
    };
  }

  analyzeComponent(componentPath, componentName) {
    const files = fs.readdirSync(componentPath);
    
    const hasComponent = files.some(f => 
      f.endsWith('.tsx') && !f.includes('.test') && !f.includes('.stories')
    );
    
    if (!hasComponent) return;
    
    this.stats.totalComponents++;
    
    const hasTest = files.some(f => f.includes('.test.'));
    const hasStories = files.some(f => f.includes('.stories.'));
    const hasIndex = files.some(f => f === 'index.tsx' || f === 'index.ts');
    
    if (hasTest) {
      this.stats.componentsWithTests++;
    } else {
      this.stats.missingTests.push(componentName);
    }
    
    if (hasStories) {
      this.stats.componentsWithStories++;
    } else {
      this.stats.missingStories.push(componentName);
    }
    
    if (hasTest && hasStories && hasIndex) {
      this.stats.componentsFullyTested++;
    } else if (hasTest || hasStories) {
      this.stats.partialCoverage.push({
        name: componentName,
        hasTest,
        hasStories,
        hasIndex
      });
    }
  }

  analyze() {
    console.log(chalk.cyan.bold('🔍 Analyzing Test Coverage for UI Components\n'));
    
    // Get all component directories
    const items = fs.readdirSync(COMPONENTS_DIR);
    
    items.forEach(item => {
      const itemPath = path.join(COMPONENTS_DIR, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        this.analyzeComponent(itemPath, item);
      } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
        // Handle standalone component files
        const componentName = item.replace(/\.(tsx?|test\.tsx?|stories\.tsx?)$/, '');
        if (!item.includes('.test') && !item.includes('.stories') && item !== 'index.ts') {
          this.stats.totalComponents++;
          
          // Check for corresponding test and story files
          const hasTest = items.includes(`${componentName}.test.tsx`) || 
                         items.includes(`${componentName}.test.ts`);
          const hasStories = items.includes(`${componentName}.stories.tsx`) || 
                           items.includes(`${componentName}.stories.ts`);
          
          if (hasTest) {
            this.stats.componentsWithTests++;
          } else {
            this.stats.missingTests.push(componentName);
          }
          
          if (hasStories) {
            this.stats.componentsWithStories++;
          } else {
            this.stats.missingStories.push(componentName);
          }
          
          if (hasTest && hasStories) {
            this.stats.componentsFullyTested++;
          } else if (hasTest || hasStories) {
            this.stats.partialCoverage.push({
              name: componentName,
              hasTest,
              hasStories,
              hasIndex: false
            });
          }
        }
      }
    });
    
    this.generateReport();
  }

  generateReport() {
    const testCoverage = ((this.stats.componentsWithTests / this.stats.totalComponents) * 100).toFixed(1);
    const storyCoverage = ((this.stats.componentsWithStories / this.stats.totalComponents) * 100).toFixed(1);
    const fullCoverage = ((this.stats.componentsFullyTested / this.stats.totalComponents) * 100).toFixed(1);
    
    // Summary
    console.log(chalk.green.bold('📊 Coverage Summary'));
    console.log(chalk.white('═'.repeat(50)));
    console.log(`Total Components:        ${chalk.cyan(this.stats.totalComponents)}`);
    console.log(`Components with Tests:   ${chalk.green(this.stats.componentsWithTests)} (${testCoverage}%)`);
    console.log(`Components with Stories: ${chalk.blue(this.stats.componentsWithStories)} (${storyCoverage}%)`);
    console.log(`Fully Tested:           ${chalk.magenta(this.stats.componentsFullyTested)} (${fullCoverage}%)`);
    console.log();
    
    // Progress Bar
    const progressBar = this.createProgressBar(parseFloat(testCoverage));
    console.log(`Test Coverage: ${progressBar} ${testCoverage}%`);
    console.log();
    
    // Missing Tests
    if (this.stats.missingTests.length > 0) {
      console.log(chalk.red.bold('❌ Components Missing Tests:'));
      this.stats.missingTests.forEach(comp => {
        console.log(`  - ${comp}`);
      });
      console.log();
    }
    
    // Missing Stories
    if (this.stats.missingStories.length > 0) {
      console.log(chalk.yellow.bold('📖 Components Missing Stories:'));
      this.stats.missingStories.forEach(comp => {
        console.log(`  - ${comp}`);
      });
      console.log();
    }
    
    // Partial Coverage
    if (this.stats.partialCoverage.length > 0) {
      console.log(chalk.orange.bold('⚠️ Components with Partial Coverage:'));
      this.stats.partialCoverage.forEach(comp => {
        const missing = [];
        if (!comp.hasTest) missing.push('test');
        if (!comp.hasStories) missing.push('stories');
        if (!comp.hasIndex) missing.push('index');
        console.log(`  - ${comp.name} (missing: ${missing.join(', ')})`);
      });
      console.log();
    }
    
    // Goal Status
    if (parseFloat(testCoverage) >= COVERAGE_GOAL) {
      console.log(chalk.green.bold(`✅ GOAL ACHIEVED! Test coverage is ${testCoverage}%`));
    } else {
      const remaining = COVERAGE_GOAL - parseFloat(testCoverage);
      console.log(chalk.yellow(`📈 ${remaining.toFixed(1)}% more coverage needed to reach ${COVERAGE_GOAL}% goal`));
    }
    
    // Save Report
    this.saveReport({
      timestamp: new Date().toISOString(),
      coverage: {
        tests: testCoverage,
        stories: storyCoverage,
        full: fullCoverage
      },
      stats: this.stats
    });
  }
  
  createProgressBar(percentage) {
    const width = 30;
    const filled = Math.round((percentage / 100) * width);
    const empty = width - filled;
    
    let bar = '█'.repeat(filled) + '░'.repeat(empty);
    
    if (percentage >= 90) return chalk.green(bar);
    if (percentage >= 70) return chalk.yellow(bar);
    return chalk.red(bar);
  }
  
  saveReport(report) {
    const reportPath = path.join(__dirname, '../coverage-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(chalk.gray(`\n📄 Report saved to: coverage-report.json`));
  }
}

// Run the analyzer
const analyzer = new TestCoverageAnalyzer();
analyzer.analyze();
