/**
 * Batch Migration Script - Saturday 03/08/2025
 * Exécute séquentiellement les 3 migrations du samedi
 * - Interactions
 * - Budgets  
 * - Subscriptions
 */

const chalk = require('chalk');
const ora = require('ora');
const fs = require('fs').promises;
const path = require('path');

// Import migration classes
const InteractionsMigration = require('./migrate-interactions');
const BudgetsMigration = require('./migrate-budgets');
const SubscriptionsMigration = require('./migrate-subscriptions');

class BatchSaturdayMigrations {
  constructor() {
    this.results = [];
    this.startTime = Date.now();
  }

  async runMigration(name, MigrationClass) {
    console.log(chalk.bold.cyan(`\n${'='.repeat(50)}\n`));
    console.log(chalk.bold.cyan(`Starting ${name} migration...`));
    console.log(chalk.bold.cyan(`${'='.repeat(50)}\n`));

    const startTime = Date.now();
    const migration = new MigrationClass();
    
    try {
      await migration.run();
      
      const duration = Math.round((Date.now() - startTime) / 1000);
      this.results.push({
        name,
        status: 'success',
        duration,
        stats: migration.stats
      });
      
      console.log(chalk.green(`✅ ${name} completed in ${duration}s`));
      return true;
    } catch (error) {
      const duration = Math.round((Date.now() - startTime) / 1000);
      this.results.push({
        name,
        status: 'failed',
        duration,
        error: error.message
      });
      
      console.error(chalk.red(`❌ ${name} failed after ${duration}s: ${error.message}`));
      return false;
    }
  }

  async generateBatchReport() {
    const totalDuration = Math.round((Date.now() - this.startTime) / 1000);
    const successCount = this.results.filter(r => r.status === 'success').length;
    const failedCount = this.results.filter(r => r.status === 'failed').length;
    
    const report = {
      batch: 'saturday-migrations',
      date: new Date().toISOString(),
      total_duration_seconds: totalDuration,
      migrations: this.results,
      summary: {
        total: this.results.length,
        success: successCount,
        failed: failedCount
      }
    };

    const reportPath = path.join(
      process.cwd(),
      'migration/reports',
      `batch-saturday-${new Date().toISOString().split('T')[0]}.json`
    );

    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    // Display summary
    console.log(chalk.bold.cyan(`\n${'='.repeat(50)}\n`));
    console.log(chalk.bold.white('📊 BATCH MIGRATION SUMMARY'));
    console.log(chalk.bold.cyan(`${'='.repeat(50)}\n`));
    
    console.log(chalk.white(`Total Duration: ${totalDuration}s`));
    console.log(chalk.green(`✅ Successful: ${successCount}`));
    console.log(chalk.red(`❌ Failed: ${failedCount}`));
    
    console.log(chalk.white('\nDetailed Results:'));
    this.results.forEach(result => {
      const icon = result.status === 'success' ? '✅' : '❌';
      const color = result.status === 'success' ? chalk.green : chalk.red;
      console.log(color(`  ${icon} ${result.name}: ${result.status} (${result.duration}s)`));
      
      if (result.stats) {
        console.log(chalk.gray(`     - Migrated: ${result.stats.migrated || 0}`));
        console.log(chalk.gray(`     - Failed: ${result.stats.failed || 0}`));
      }
    });
    
    console.log(chalk.gray(`\nReport saved: ${reportPath}`));
  }

  async run() {
    console.log(chalk.bold.magenta('\n🚀 SATURDAY BATCH MIGRATION - 03/08/2025\n'));
    console.log(chalk.white('This will run the following migrations in sequence:'));
    console.log(chalk.white('  1. Interactions (Client interactions)'));
    console.log(chalk.white('  2. Budgets (Budget planning)'));
    console.log(chalk.white('  3. Subscriptions (Service subscriptions)\n'));

    const migrations = [
      { name: 'Interactions', class: InteractionsMigration },
      { name: 'Budgets', class: BudgetsMigration },
      { name: 'Subscriptions', class: SubscriptionsMigration }
    ];

    let continueOnError = true; // Continue even if one migration fails
    
    for (const migration of migrations) {
      const success = await this.runMigration(migration.name, migration.class);
      
      if (!success && !continueOnError) {
        console.log(chalk.yellow('\n⚠️ Stopping batch due to error'));
        break;
      }
      
      // Add delay between migrations
      if (migrations.indexOf(migration) < migrations.length - 1) {
        console.log(chalk.gray('\nWaiting 3 seconds before next migration...'));
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }

    // Generate final report
    await this.generateBatchReport();

    const hasErrors = this.results.some(r => r.status === 'failed');
    if (hasErrors) {
      console.log(chalk.bold.yellow('\n⚠️ Batch completed with errors\n'));
      process.exit(1);
    } else {
      console.log(chalk.bold.green('\n🎉 All migrations completed successfully!\n'));
    }
  }
}

// Run if called directly
if (require.main === module) {
  const batch = new BatchSaturdayMigrations();
  batch.run().catch(error => {
    console.error(chalk.bold.red('\n❌ Batch failed:'), error);
    process.exit(1);
  });
}

module.exports = BatchSaturdayMigrations;