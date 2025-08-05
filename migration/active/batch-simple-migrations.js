#!/usr/bin/env node

/**
 * Batch migration script for simple Notion databases
 * Executes multiple migrations in sequence with proper error handling
 */

const chalk = require('chalk');
const ora = require('ora');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

// Import migration classes
const ContentCalendarMigration = require('./migrate-content-calendar');
const ComplianceMigration = require('./migrate-compliance');
const TalentsMigration = require('./migrate-talents');

class BatchMigration {
  constructor() {
    this.migrations = [
      {
        name: 'Content Calendar',
        class: ContentCalendarMigration,
        emoji: '📅'
      },
      {
        name: 'Compliance',
        class: ComplianceMigration,
        emoji: '⚖️'
      },
      {
        name: 'Talents',
        class: TalentsMigration,
        emoji: '👥'
      }
    ];
    
    this.results = [];
    this.startTime = Date.now();
  }

  async runMigration(migrationConfig) {
    const { name, class: MigrationClass, emoji } = migrationConfig;
    console.log(chalk.blue.bold(`\n${emoji} Starting ${name} migration...\n`));
    
    const migration = new MigrationClass();
    const startTime = Date.now();
    
    try {
      await migration.run();
      
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      
      this.results.push({
        name,
        status: 'success',
        duration: `${duration}s`,
        stats: migration.stats
      });
      
      console.log(chalk.green(`✅ ${name} migration completed in ${duration}s`));
      return true;
    } catch (error) {
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      
      this.results.push({
        name,
        status: 'failed',
        duration: `${duration}s`,
        error: error.message
      });
      
      console.error(chalk.red(`❌ ${name} migration failed: ${error.message}`));
      return false;
    }
  }

  async generateBatchReport() {
    const totalDuration = ((Date.now() - this.startTime) / 1000).toFixed(2);
    
    const report = {
      type: 'batch_migration',
      timestamp: new Date().toISOString(),
      totalDuration: `${totalDuration}s`,
      migrations: this.results,
      summary: {
        total: this.results.length,
        successful: this.results.filter(r => r.status === 'success').length,
        failed: this.results.filter(r => r.status === 'failed').length
      }
    };

    const reportPath = path.join(
      process.cwd(), 
      'migration/reports', 
      `batch_simple_${Date.now()}.json`
    );
    
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    return { report, reportPath };
  }

  displaySummary() {
    console.log(chalk.cyan.bold('\n════════════════════════════════════════'));
    console.log(chalk.cyan.bold('     BATCH MIGRATION SUMMARY'));
    console.log(chalk.cyan.bold('════════════════════════════════════════\n'));

    const totalDuration = ((Date.now() - this.startTime) / 1000).toFixed(2);
    
    // Display individual results
    this.results.forEach(result => {
      const statusIcon = result.status === 'success' ? '✅' : '❌';
      const statusColor = result.status === 'success' ? chalk.green : chalk.red;
      
      console.log(statusColor(`${statusIcon} ${result.name}`));
      console.log(chalk.gray(`   Duration: ${result.duration}`));
      
      if (result.stats) {
        console.log(chalk.gray(`   Migrated: ${result.stats.migrated}/${result.stats.total}`));
        if (result.stats.failed > 0) {
          console.log(chalk.yellow(`   Failed: ${result.stats.failed}`));
        }
      }
      
      if (result.error) {
        console.log(chalk.red(`   Error: ${result.error}`));
      }
      
      console.log();
    });

    // Display totals
    const successful = this.results.filter(r => r.status === 'success').length;
    const failed = this.results.filter(r => r.status === 'failed').length;
    
    console.log(chalk.blue.bold('📊 Overall Results:'));
    console.log(chalk.white(`   Total migrations: ${this.results.length}`));
    console.log(chalk.green(`   Successful: ${successful}`));
    if (failed > 0) {
      console.log(chalk.red(`   Failed: ${failed}`));
    }
    console.log(chalk.gray(`   Total duration: ${totalDuration}s`));
    
    // Calculate total items migrated
    const totalItems = this.results
      .filter(r => r.stats)
      .reduce((sum, r) => sum + (r.stats.migrated || 0), 0);
    
    if (totalItems > 0) {
      console.log(chalk.cyan(`   Total items migrated: ${totalItems}`));
    }
    
    console.log(chalk.cyan.bold('\n════════════════════════════════════════\n'));
  }

  async run(selectedMigrations = null) {
    console.log(chalk.cyan.bold('\n🚀 BATCH MIGRATION TOOL'));
    console.log(chalk.gray('Migrating simple Notion databases to Directus\n'));

    // Determine which migrations to run
    let migrationsToRun = this.migrations;
    
    if (selectedMigrations) {
      migrationsToRun = this.migrations.filter(m => 
        selectedMigrations.includes(m.name.toLowerCase())
      );
      
      if (migrationsToRun.length === 0) {
        console.error(chalk.red('No valid migrations selected'));
        process.exit(1);
      }
    }

    console.log(chalk.white(`Migrations to run: ${migrationsToRun.map(m => m.name).join(', ')}\n`));

    // Confirm before running
    if (process.env.NODE_ENV !== 'test') {
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });

      const answer = await new Promise(resolve => {
        readline.question(chalk.yellow('Continue with migration? (y/n): '), resolve);
      });
      readline.close();

      if (answer.toLowerCase() !== 'y') {
        console.log(chalk.gray('Migration cancelled'));
        process.exit(0);
      }
    }

    // Run migrations sequentially
    for (const migration of migrationsToRun) {
      await this.runMigration(migration);
      
      // Add delay between migrations to avoid overwhelming the API
      if (migrationsToRun.indexOf(migration) < migrationsToRun.length - 1) {
        console.log(chalk.gray('\nWaiting 2 seconds before next migration...'));
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Generate report
    const { report, reportPath } = await this.generateBatchReport();
    
    // Display summary
    this.displaySummary();
    
    console.log(chalk.green.bold('✅ Batch migration completed!'));
    console.log(chalk.gray(`Report saved to: ${reportPath}`));
    
    // Exit with appropriate code
    const failed = this.results.filter(r => r.status === 'failed').length;
    process.exit(failed > 0 ? 1 : 0);
  }
}

// CLI argument handling
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(chalk.cyan.bold('\nBatch Migration Tool\n'));
    console.log('Usage: node batch-simple-migrations.js [options] [migrations...]');
    console.log('\nOptions:');
    console.log('  --help, -h     Show this help message');
    console.log('  --list, -l     List available migrations');
    console.log('\nExamples:');
    console.log('  node batch-simple-migrations.js                    # Run all migrations');
    console.log('  node batch-simple-migrations.js compliance         # Run only compliance migration');
    console.log('  node batch-simple-migrations.js compliance talents # Run specific migrations');
    process.exit(0);
  }
  
  if (args.includes('--list') || args.includes('-l')) {
    console.log(chalk.cyan.bold('\nAvailable Migrations:\n'));
    const batch = new BatchMigration();
    batch.migrations.forEach(m => {
      console.log(`  ${m.emoji} ${m.name.toLowerCase()} - ${m.name}`);
    });
    process.exit(0);
  }
  
  // Filter migrations if specific ones are requested
  const selectedMigrations = args.filter(arg => !arg.startsWith('-'));
  
  const batch = new BatchMigration();
  batch.run(selectedMigrations.length > 0 ? selectedMigrations : null)
    .catch(error => {
      console.error(chalk.red.bold('\n❌ Batch migration failed!'));
      console.error(chalk.red(error.message));
      process.exit(1);
    });
}

module.exports = BatchMigration;