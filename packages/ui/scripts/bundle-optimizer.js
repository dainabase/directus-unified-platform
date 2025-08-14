#!/usr/bin/env node

/**
 * Bundle Optimizer Script
 * 
 * Analyzes and optimizes the @dainabase/ui bundle size
 * Target: Reduce from 50KB to < 45KB
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

class BundleOptimizer {
  constructor() {
    this.targetSize = 45 * 1024; // 45KB in bytes
    this.currentSize = 0;
    this.optimizations = [];
    this.componentsAnalysis = new Map();
  }

  async analyze() {
    console.log(chalk.cyan.bold('🔍 Analyzing Bundle Size...\n'));
    
    try {
      // Build the bundle first
      console.log(chalk.gray('Building bundle...'));
      execSync('npm run build', { stdio: 'inherit' });
      
      // Analyze dist folder
      const distPath = path.join(__dirname, '../dist');
      if (!fs.existsSync(distPath)) {
        throw new Error('Dist folder not found. Please run build first.');
      }
      
      this.analyzeDistFolder(distPath);
      this.analyzeComponents();
      this.generateOptimizationPlan();
      this.applyOptimizations();
      
    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  }

  analyzeDistFolder(distPath) {
    const files = fs.readdirSync(distPath);
    let totalSize = 0;
    const filesSizes = [];
    
    files.forEach(file => {
      const filePath = path.join(distPath, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isFile() && (file.endsWith('.js') || file.endsWith('.mjs'))) {
        totalSize += stat.size;
        filesSizes.push({
          name: file,
          size: stat.size,
          sizeKB: (stat.size / 1024).toFixed(2)
        });
      }
    });
    
    this.currentSize = totalSize;
    
    console.log(chalk.yellow.bold('📦 Current Bundle Analysis:'));
    console.log(chalk.white('═'.repeat(50)));
    
    filesSizes.sort((a, b) => b.size - a.size).forEach(file => {
      const percentage = ((file.size / totalSize) * 100).toFixed(1);
      const bar = this.createSizeBar(file.size, totalSize);
      console.log(`${file.name.padEnd(20)} ${bar} ${file.sizeKB}KB (${percentage}%)`);
    });
    
    console.log(chalk.white('═'.repeat(50)));
    console.log(`Total Size: ${chalk.cyan((totalSize / 1024).toFixed(2))}KB`);
    console.log(`Target Size: ${chalk.green('45KB')}`);
    console.log(`Reduction Needed: ${chalk.red(((totalSize - this.targetSize) / 1024).toFixed(2))}KB\n`);
  }

  analyzeComponents() {
    console.log(chalk.yellow.bold('🔬 Analyzing Component Sizes...\n'));
    
    const componentsDir = path.join(__dirname, '../src/components');
    const components = fs.readdirSync(componentsDir);
    
    components.forEach(comp => {
      const compPath = path.join(componentsDir, comp);
      const stat = fs.statSync(compPath);
      
      if (stat.isDirectory()) {
        const size = this.getDirectorySize(compPath);
        this.componentsAnalysis.set(comp, {
          size,
          sizeKB: (size / 1024).toFixed(2),
          files: this.countFiles(compPath)
        });
      }
    });
    
    // Sort and display top 10 largest components
    const sorted = Array.from(this.componentsAnalysis.entries())
      .sort((a, b) => b[1].size - a[1].size)
      .slice(0, 10);
    
    console.log(chalk.cyan('Top 10 Largest Components:'));
    sorted.forEach(([name, data]) => {
      console.log(`  ${name.padEnd(25)} ${data.sizeKB}KB (${data.files} files)`);
    });
    console.log();
  }

  generateOptimizationPlan() {
    console.log(chalk.green.bold('📋 Optimization Plan:\n'));
    
    this.optimizations = [
      {
        name: 'Tree Shaking',
        impact: 'High',
        reduction: '~5KB',
        action: 'Configure sideEffects in package.json',
        config: {
          sideEffects: false,
          module: './dist/index.mjs'
        }
      },
      {
        name: 'Code Splitting',
        impact: 'High',
        reduction: '~8KB',
        action: 'Implement dynamic imports for heavy components',
        components: ['charts', 'data-grid-adv', 'rich-text-editor', 'pdf-viewer']
      },
      {
        name: 'Minification',
        impact: 'Medium',
        reduction: '~3KB',
        action: 'Enhanced terser configuration',
        config: {
          compress: {
            drop_console: true,
            drop_debugger: true,
            pure_funcs: ['console.log']
          }
        }
      },
      {
        name: 'CSS Optimization',
        impact: 'Medium',
        reduction: '~2KB',
        action: 'PurgeCSS for unused styles',
        config: {
          content: ['./src/**/*.tsx'],
          safelist: ['dark', 'light']
        }
      },
      {
        name: 'Dependency Analysis',
        impact: 'High',
        reduction: '~4KB',
        action: 'Move heavy dependencies to peerDependencies',
        dependencies: ['lucide-react', 'recharts', 'date-fns']
      },
      {
        name: 'Component Lazy Loading',
        impact: 'High',
        reduction: '~6KB',
        action: 'Create separate lazy-loaded chunks',
        approach: 'React.lazy() with Suspense boundaries'
      }
    ];
    
    let totalReduction = 0;
    this.optimizations.forEach(opt => {
      const reduction = parseFloat(opt.reduction.replace('~', '').replace('KB', ''));
      totalReduction += reduction;
      
      console.log(chalk.cyan(`${opt.name}:`));
      console.log(`  Impact: ${this.getImpactColor(opt.impact)(opt.impact)}`);
      console.log(`  Expected Reduction: ${chalk.green(opt.reduction)}`);
      console.log(`  Action: ${opt.action}`);
      console.log();
    });
    
    console.log(chalk.white('═'.repeat(50)));
    console.log(`Total Expected Reduction: ${chalk.green(`~${totalReduction}KB`)}`);
    console.log(`Expected Final Size: ${chalk.cyan(`~${50 - totalReduction}KB`)}\n`);
  }

  applyOptimizations() {
    console.log(chalk.magenta.bold('🔧 Applying Optimizations...\n'));
    
    // Create optimized tsup config
    this.createOptimizedTsupConfig();
    
    // Create lazy loading exports
    this.createLazyExports();
    
    // Update package.json with optimizations
    this.updatePackageJson();
    
    console.log(chalk.green.bold('✅ Optimizations Applied!\n'));
    console.log(chalk.yellow('Next steps:'));
    console.log('1. Run: npm run build');
    console.log('2. Check new bundle size');
    console.log('3. Test all components');
    console.log('4. Run: npm run test\n');
  }

  createOptimizedTsupConfig() {
    const config = `import { defineConfig } from 'tsup';
import { compress } from 'esbuild-plugin-compress';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'lazy/charts': 'src/components/charts/index.tsx',
    'lazy/data-grid': 'src/components/data-grid-adv/index.tsx',
    'lazy/editor': 'src/components/rich-text-editor/index.tsx',
    'lazy/pdf': 'src/components/pdf-viewer/index.tsx',
  },
  format: ['cjs', 'esm'],
  dts: true,
  splitting: true,
  sourcemap: false,
  clean: true,
  treeshake: true,
  minify: true,
  external: [
    'react',
    'react-dom',
    'lucide-react',
    'recharts',
    'date-fns',
    '@radix-ui/*'
  ],
  esbuildOptions(options) {
    options.drop = ['console', 'debugger'];
    options.pure = ['console.log'];
    options.legalComments = 'none';
    options.treeShaking = true;
    options.minifyWhitespace = true;
    options.minifyIdentifiers = true;
    options.minifySyntax = true;
  },
  esbuildPlugins: [compress()],
  onSuccess() {
    console.log('✅ Build optimized successfully!');
  }
});`;
    
    const configPath = path.join(__dirname, '../tsup.config.optimized.ts');
    fs.writeFileSync(configPath, config);
    console.log(chalk.green('✓ Created optimized tsup config'));
  }

  createLazyExports() {
    const lazyExports = `// Lazy-loaded component exports
// These components are loaded on-demand to reduce initial bundle size

import { lazy } from 'react';

// Heavy components lazy loaded
export const Charts = lazy(() => import('./components/charts'));
export const DataGridAdvanced = lazy(() => import('./components/data-grid-adv'));
export const RichTextEditor = lazy(() => import('./components/rich-text-editor'));
export const PDFViewer = lazy(() => import('./components/pdf-viewer'));
export const CodeEditor = lazy(() => import('./components/code-editor'));
export const ImageCropper = lazy(() => import('./components/image-cropper'));
export const VideoPlayer = lazy(() => import('./components/video-player'));

// Export wrapper for lazy loading with fallback
export const withLazyLoad = (Component: React.ComponentType) => {
  return (props: any) => (
    <React.Suspense fallback={<div>Loading...</div>}>
      <Component {...props} />
    </React.Suspense>
  );
};
`;
    
    const lazyPath = path.join(__dirname, '../src/lazy.ts');
    fs.writeFileSync(lazyPath, lazyExports);
    console.log(chalk.green('✓ Created lazy loading exports'));
  }

  updatePackageJson() {
    const packagePath = path.join(__dirname, '../package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
    
    // Add optimization fields
    packageJson.sideEffects = false;
    
    // Move heavy dependencies to peerDependencies
    const heavyDeps = ['lucide-react', 'recharts', 'date-fns'];
    heavyDeps.forEach(dep => {
      if (packageJson.optionalDependencies?.[dep]) {
        packageJson.peerDependencies = packageJson.peerDependencies || {};
        packageJson.peerDependencies[dep] = packageJson.optionalDependencies[dep];
      }
    });
    
    // Add build optimization scripts
    packageJson.scripts['build:optimized'] = 'tsup --config tsup.config.optimized.ts';
    packageJson.scripts['analyze:optimized'] = 'npm run build:optimized && npm run analyze';
    
    // Note: Not actually writing to avoid breaking existing config
    // fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
    console.log(chalk.green('✓ Package.json optimizations prepared (not applied)'));
  }

  // Helper methods
  getDirectorySize(dir) {
    let size = 0;
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isFile()) {
        size += stat.size;
      } else if (stat.isDirectory()) {
        size += this.getDirectorySize(filePath);
      }
    });
    
    return size;
  }

  countFiles(dir) {
    let count = 0;
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isFile()) {
        count++;
      } else if (stat.isDirectory()) {
        count += this.countFiles(filePath);
      }
    });
    
    return count;
  }

  createSizeBar(size, total, width = 20) {
    const percentage = (size / total);
    const filled = Math.round(percentage * width);
    const empty = width - filled;
    
    return chalk.green('█'.repeat(filled)) + chalk.gray('░'.repeat(empty));
  }

  getImpactColor(impact) {
    switch(impact) {
      case 'High': return chalk.red;
      case 'Medium': return chalk.yellow;
      case 'Low': return chalk.green;
      default: return chalk.white;
    }
  }
}

// Run the optimizer
const optimizer = new BundleOptimizer();
optimizer.analyze().catch(console.error);
