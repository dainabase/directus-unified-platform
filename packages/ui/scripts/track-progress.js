#!/usr/bin/env node

/**
 * Component Progress Tracker
 * Tracks the development progress of all UI components
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Component categories
const COMPONENT_CATEGORIES = {
  'Base Components': [
    'accordion', 'app-shell', 'avatar', 'badge', 'breadcrumbs',
    'button', 'calendar', 'card', 'carousel', 'charts',
    'checkbox', 'color-picker', 'command-palette', 'data-grid',
    'data-grid-adv', 'date-picker', 'date-range-picker', 'dialog',
    'dropdown-menu', 'file-upload', 'form', 'forms-demo', 'icon',
    'input', 'pagination', 'popover', 'progress', 'rating',
    'select', 'sheet', 'skeleton', 'slider', 'stepper',
    'switch', 'tabs', 'textarea', 'theme-toggle', 'timeline',
    'toast', 'tooltip'
  ],
  'Sprint 1': ['alert', 'alert-dialog', 'tag-input'],
  'Sprint 2': ['drawer', 'tree-view', 'mentions', 'search-bar', 'timeline-enhanced'],
  'Sprint 3': [
    'virtual-list', 'infinite-scroll', 'drag-drop-grid', 'kanban',
    'rich-text-editor', 'video-player', 'audio-recorder',
    'code-editor', 'image-cropper', 'pdf-viewer', 'virtualized-table'
  ],
  'Sprint 4 (v1.2.0)': [
    'advanced-filter', 'dashboard-grid', 'notification-center',
    'theme-builder'
  ]
};

// Target components for v1.2.0
const TARGET_COMPONENTS = [
  'advanced-filter',
  'dashboard-grid',
  'notification-center',
  'theme-builder'
];

class ComponentProgressTracker {
  constructor() {
    this.componentsDir = path.join(__dirname, '..', 'src', 'components');
    this.results = {
      total: 0,
      completed: 0,
      inProgress: 0,
      pending: 0,
      components: {}
    };
  }

  checkComponentExists(componentName) {
    const componentPath = path.join(this.componentsDir, componentName);
    const files = {
      component: false,
      index: false,
      test: false,
      stories: false
    };

    if (fs.existsSync(componentPath)) {
      const dir = fs.readdirSync(componentPath);
      
      // Check for main component file
      files.component = dir.some(file => 
        file.endsWith('.tsx') && !file.includes('.test') && !file.includes('.stories') && file !== 'index.tsx'
      );
      
      // Check for index export
      files.index = dir.includes('index.tsx') || dir.includes('index.ts');
      
      // Check for tests
      files.test = dir.some(file => file.includes('.test.'));
      
      // Check for stories
      files.stories = dir.some(file => file.includes('.stories.'));
    } else {
      // Check for single file components
      const singleFile = `${componentName}.tsx`;
      const testFile = `${componentName}.test.tsx`;
      const storiesFile = `${componentName}.stories.tsx`;
      
      if (fs.existsSync(path.join(this.componentsDir, singleFile))) {
        files.component = true;
      }
      if (fs.existsSync(path.join(this.componentsDir, testFile))) {
        files.test = true;
      }
      if (fs.existsSync(path.join(this.componentsDir, storiesFile))) {
        files.stories = true;
      }
    }

    return files;
  }

  getComponentStatus(files) {
    const hasComponent = files.component || files.index;
    const hasTests = files.test;
    const hasStories = files.stories;

    if (hasComponent && hasTests && hasStories) {
      return 'completed';
    } else if (hasComponent) {
      return 'in-progress';
    } else {
      return 'pending';
    }
  }

  analyzeComponents() {
    console.log(chalk.cyan.bold('\\n📊 Component Development Progress Report\\n'));
    console.log(chalk.gray('=' .repeat(60)));

    let totalComponents = 0;
    let completedComponents = 0;
    let inProgressComponents = 0;
    let pendingComponents = 0;

    // Analyze each category
    Object.entries(COMPONENT_CATEGORIES).forEach(([category, components]) => {
      console.log(chalk.yellow.bold(`\\n${category}:`));
      
      components.forEach(component => {
        const files = this.checkComponentExists(component);
        const status = this.getComponentStatus(files);
        
        totalComponents++;
        
        let statusIcon = '';
        let statusColor = chalk.gray;
        
        switch(status) {
          case 'completed':
            statusIcon = '✅';
            statusColor = chalk.green;
            completedComponents++;
            break;
          case 'in-progress':
            statusIcon = '🚧';
            statusColor = chalk.yellow;
            inProgressComponents++;
            break;
          case 'pending':
            statusIcon = '⏳';
            statusColor = chalk.red;
            pendingComponents++;
            break;
        }

        const componentInfo = [
          statusIcon,
          statusColor(component.padEnd(25)),
          files.component ? '📝' : '  ',
          files.test ? '🧪' : '  ',
          files.stories ? '📚' : '  ',
          files.index ? '📦' : '  '
        ].join(' ');

        console.log(`  ${componentInfo}`);
        
        this.results.components[component] = {
          status,
          files
        };
      });
    });

    // Summary
    console.log(chalk.gray('\\n' + '=' .repeat(60)));
    console.log(chalk.cyan.bold('\\n📈 Summary:\\n'));
    
    const completionRate = ((completedComponents / totalComponents) * 100).toFixed(1);
    
    console.log(`  Total Components:     ${chalk.bold(totalComponents)}`);
    console.log(`  Completed:           ${chalk.green.bold(completedComponents)} (${chalk.green(completionRate + '%')})`);
    console.log(`  In Progress:         ${chalk.yellow.bold(inProgressComponents)}`);
    console.log(`  Pending:             ${chalk.red.bold(pendingComponents)}`);
    
    // v1.2.0 specific progress
    console.log(chalk.cyan.bold('\\n🎯 v1.2.0 Target Components:\\n'));
    
    let v1_2_completed = 0;
    TARGET_COMPONENTS.forEach(component => {
      const files = this.checkComponentExists(component);
      const status = this.getComponentStatus(files);
      
      let statusIcon = status === 'completed' ? '✅' : 
                       status === 'in-progress' ? '🚧' : '⏳';
      
      if (status === 'completed') v1_2_completed++;
      
      console.log(`  ${statusIcon} ${component}`);
    });
    
    console.log(`\\n  v1.2.0 Progress: ${chalk.bold(v1_2_completed + '/' + TARGET_COMPONENTS.length)} components`);
    
    // Save results
    this.results.total = totalComponents;
    this.results.completed = completedComponents;
    this.results.inProgress = inProgressComponents;
    this.results.pending = pendingComponents;
    this.results.completionRate = completionRate;
    
    return this.results;
  }

  saveReport() {
    const reportPath = path.join(__dirname, '..', '..', '..', 'metrics', 'component-progress.json');
    const reportDir = path.dirname(reportPath);
    
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    const report = {
      timestamp: new Date().toISOString(),
      version: '1.2.0-alpha.1',
      ...this.results
    };
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(chalk.gray(`\\n📄 Report saved to: ${reportPath}`));
  }

  generateMarkdownReport() {
    const date = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    let markdown = `# Component Development Progress Report\\n\\n`;
    markdown += `**Date:** ${date}\\n`;
    markdown += `**Version:** v1.2.0-alpha.1\\n\\n`;
    
    markdown += `## Summary\\n\\n`;
    markdown += `- **Total Components:** ${this.results.total}\\n`;
    markdown += `- **Completed:** ${this.results.completed} (${this.results.completionRate}%)\\n`;
    markdown += `- **In Progress:** ${this.results.inProgress}\\n`;
    markdown += `- **Pending:** ${this.results.pending}\\n\\n`;
    
    markdown += `## Component Status\\n\\n`;
    markdown += `| Component | Status | Component | Tests | Stories | Export |\\n`;
    markdown += `|-----------|--------|-----------|-------|---------|--------|\\n`;
    
    Object.entries(this.results.components).forEach(([name, data]) => {
      const status = data.status === 'completed' ? '✅ Complete' :
                    data.status === 'in-progress' ? '🚧 In Progress' : '⏳ Pending';
      
      markdown += `| ${name} | ${status} | ${data.files.component ? '✅' : '❌'} | ${data.files.test ? '✅' : '❌'} | ${data.files.stories ? '✅' : '❌'} | ${data.files.index ? '✅' : '❌'} |\\n`;
    });
    
    markdown += `\\n## v1.2.0 Target Components\\n\\n`;
    TARGET_COMPONENTS.forEach(component => {
      const data = this.results.components[component];
      if (data) {
        const status = data.status === 'completed' ? '✅' :
                      data.status === 'in-progress' ? '🚧' : '⏳';
        markdown += `- ${status} **${component}**\\n`;
      }
    });
    
    const mdPath = path.join(__dirname, '..', '..', '..', 'COMPONENT_PROGRESS.md');
    fs.writeFileSync(mdPath, markdown);
    console.log(chalk.gray(`📝 Markdown report saved to: ${mdPath}`));
  }

  run() {
    console.log(chalk.blue.bold('🚀 Component Progress Tracker v1.2.0\\n'));
    
    try {
      this.analyzeComponents();
      this.saveReport();
      this.generateMarkdownReport();
      
      console.log(chalk.green.bold('\\n✨ Analysis complete!\\n'));
      
      // Exit code based on completion
      if (this.results.pending === 0 && this.results.inProgress === 0) {
        console.log(chalk.green.bold('🎉 All components are complete!'));
        process.exit(0);
      } else if (this.results.completionRate >= 95) {
        console.log(chalk.yellow.bold('📈 Almost there! ' + this.results.completionRate + '% complete'));
        process.exit(0);
      } else {
        console.log(chalk.yellow.bold('⚡ Keep going! ' + this.results.completionRate + '% complete'));
        process.exit(0);
      }
    } catch (error) {
      console.error(chalk.red('❌ Error:'), error.message);
      process.exit(1);
    }
  }
}

// Run the tracker
const tracker = new ComponentProgressTracker();
tracker.run();