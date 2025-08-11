#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { generateComponent } from './commands/generate-component';
import { generateTheme } from './commands/generate-theme';
import { addIcons } from './commands/add-icons';
import { generateDocs } from './commands/generate-docs';

const program = new Command();

program
  .name('dainabase-ui')
  .description('CLI tool for Dainabase UI Design System')
  .version('0.0.1');

// Generate command with subcommands
const generateCmd = program
  .command('generate')
  .alias('g')
  .description('Generate design system resources');

generateCmd
  .command('component <name>')
  .alias('c')
  .description('Generate a new component')
  .option('-t, --template <template>', 'Component template to use', 'default')
  .option('-p, --path <path>', 'Custom path for component')
  .option('--no-story', 'Skip Storybook story generation')
  .option('--no-test', 'Skip test file generation')
  .action(generateComponent);

generateCmd
  .command('theme <name>')
  .alias('t')
  .description('Generate a new theme')
  .option('-b, --base <base>', 'Base theme to extend', 'default')
  .option('-p, --primary <color>', 'Primary color')
  .option('-s, --secondary <color>', 'Secondary color')
  .action(generateTheme);

// Add command
program
  .command('add')
  .description('Add resources to your project')
  .command('icons <set>')
  .description('Add an icon set to your project')
  .action(addIcons);

// Docs command
program
  .command('docs')
  .description('Generate documentation')
  .option('-f, --format <format>', 'Documentation format', 'markdown')
  .option('-o, --output <path>', 'Output path', './docs')
  .action(generateDocs);

// Init command
program
  .command('init')
  .description('Initialize Dainabase UI in your project')
  .action(async () => {
    console.log(chalk.blue('🚀 Initializing Dainabase UI...'));
    // Implementation will be added
    console.log(chalk.green('✅ Dainabase UI initialized successfully!'));
  });

// List command
program
  .command('list')
  .alias('ls')
  .description('List available components, themes, and icons')
  .option('-c, --components', 'List components')
  .option('-t, --themes', 'List themes')
  .option('-i, --icons', 'List icon sets')
  .action(async (options) => {
    if (options.components) {
      console.log(chalk.blue('📦 Available Components:'));
      // List components logic
    }
    if (options.themes) {
      console.log(chalk.blue('🎨 Available Themes:'));
      // List themes logic
    }
    if (options.icons) {
      console.log(chalk.blue('🎯 Available Icon Sets:'));
      // List icons logic
    }
  });

program.parse();