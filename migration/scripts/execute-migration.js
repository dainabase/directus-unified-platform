#!/usr/bin/env node

/**
 * Script principal d'exécution de migration Notion → Directus
 * 
 * Usage:
 *   npm run migrate:execute              # Migration complète
 *   npm run migrate:execute -- --module crm  # Module spécifique
 *   npm run migrate:execute -- --dry-run     # Mode simulation
 */

const MigrationOrchestrator = require('../src/migrators/MigrationOrchestrator');
const chalk = require('chalk');
const { config } = require('dotenv');
const fs = require('fs').promises;
const path = require('path');

// Charger les variables d'environnement
config();

// Parser les arguments
const args = process.argv.slice(2);
const options = {
  module: null,
  dryRun: false,
  verbose: false,
  reportPath: './migration/logs/migration-report.json'
};

args.forEach(arg => {
  if (arg === '--dry-run') options.dryRun = true;
  if (arg === '--verbose') options.verbose = true;
  if (arg.startsWith('--module=')) {
    options.module = arg.split('=')[1];
  }
  if (arg.startsWith('--report=')) {
    options.reportPath = arg.split('=')[1];
  }
});

/**
 * Vérifier les prérequis
 */
async function checkPrerequisites() {
  console.log(chalk.blue('🔍 Vérification des prérequis...\n'));
  
  const checks = {
    directusUrl: !!process.env.DIRECTUS_URL,
    directusToken: !!process.env.DIRECTUS_TOKEN,
    notionKey: !!process.env.NOTION_API_KEY,
    notionDatabases: !!process.env.NOTION_DB_PRESTATAIRES
  };
  
  const failed = Object.entries(checks)
    .filter(([_, passed]) => !passed)
    .map(([check]) => check);
  
  if (failed.length > 0) {
    console.error(chalk.red('❌ Prérequis manquants:'));
    failed.forEach(check => {
      console.error(chalk.red(`  - ${check}`));
    });
    console.log(chalk.yellow('\n💡 Conseil: Copiez .env.example vers .env et configurez-le'));
    process.exit(1);
  }
  
  console.log(chalk.green('✅ Tous les prérequis sont satisfaits\n'));
}

/**
 * Afficher le plan de migration
 */
async function displayMigrationPlan(orchestrator) {
  console.log(chalk.bold.blue('📋 PLAN DE MIGRATION\n'));
  
  const mapping = orchestrator.getCollectionMapping();
  const modules = Object.keys(mapping);
  
  console.log(chalk.cyan(`Modules à migrer: ${modules.length}`));
  console.log(chalk.yellow(`Mode: ${options.dryRun ? 'SIMULATION' : 'PRODUCTION'}\n`));
  
  if (options.module) {
    console.log(chalk.magenta(`Module sélectionné: ${options.module}\n`));
  }
  
  console.log(chalk.gray('Détails par module:'));
  modules.forEach(module => {
    const config = mapping[module];
    console.log(`  • ${module} → ${config.target} (${config.sources.length} sources)`);
  });
  
  console.log('');
}

/**
 * Sauvegarder le rapport de migration
 */
async function saveReport(results) {
  const report = {
    timestamp: new Date().toISOString(),
    mode: options.dryRun ? 'dry-run' : 'production',
    module: options.module || 'all',
    summary: {
      totalModules: results.length,
      successful: results.filter(r => r.status !== 'failed').length,
      failed: results.filter(r => r.status === 'failed').length,
      totalItems: results.reduce((sum, r) => sum + (r.totalItems || 0), 0),
      migratedItems: results.reduce((sum, r) => sum + (r.migrated || 0), 0),
      failedItems: results.reduce((sum, r) => sum + (r.failed || 0), 0)
    },
    details: results
  };
  
  // Créer le dossier si nécessaire
  const dir = path.dirname(options.reportPath);
  await fs.mkdir(dir, { recursive: true });
  
  // Sauvegarder le rapport
  await fs.writeFile(
    options.reportPath,
    JSON.stringify(report, null, 2)
  );
  
  console.log(chalk.green(`\n📄 Rapport sauvegardé: ${options.reportPath}`));
}

/**
 * Fonction principale
 */
async function main() {
  console.log(chalk.bold.blue('\n🚀 MIGRATION NOTION → DIRECTUS\n'));
  console.log(chalk.gray('═'.repeat(50) + '\n'));
  
  try {
    // 1. Vérifier les prérequis
    await checkPrerequisites();
    
    // 2. Créer l'orchestrateur
    const orchestrator = new MigrationOrchestrator({
      dryRun: options.dryRun,
      verbose: options.verbose,
      batchSize: 50,
      retryAttempts: 3,
      rateLimitDelay: 100
    });
    
    // 3. Afficher le plan
    await displayMigrationPlan(orchestrator);
    
    // 4. Demander confirmation si mode production
    if (!options.dryRun) {
      console.log(chalk.yellow('⚠️  ATTENTION: Mode PRODUCTION activé'));
      console.log(chalk.yellow('Les données seront réellement migrées vers Directus.\n'));
      
      // TODO: Ajouter une confirmation interactive si nécessaire
    }
    
    // 5. Exécuter la migration
    let results;
    if (options.module) {
      // Migration d'un module spécifique
      const mapping = orchestrator.getCollectionMapping();
      const moduleConfig = mapping[options.module];
      
      if (!moduleConfig) {
        throw new Error(`Module inconnu: ${options.module}`);
      }
      
      results = [await orchestrator.migrateModule(options.module, moduleConfig)];
    } else {
      // Migration complète
      results = await orchestrator.execute();
    }
    
    // 6. Sauvegarder le rapport
    await saveReport(results);
    
    // 7. Afficher les prochaines étapes
    console.log(chalk.bold.blue('\n✅ MIGRATION TERMINÉE\n'));
    console.log(chalk.cyan('Prochaines étapes:'));
    console.log('  1. Vérifier les données dans Directus: http://localhost:8055');
    console.log('  2. Valider le rapport de migration:', options.reportPath);
    console.log('  3. Adapter le dashboard: npm run dashboard:dev');
    console.log('  4. Tester les endpoints API: npm run test:migration');
    
  } catch (error) {
    console.error(chalk.red('\n❌ ERREUR FATALE:'), error.message);
    if (options.verbose) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Gestion des signaux
process.on('SIGINT', () => {
  console.log(chalk.yellow('\n\n⚠️  Migration interrompue par l\'utilisateur'));
  process.exit(130);
});

process.on('unhandledRejection', (error) => {
  console.error(chalk.red('\n❌ Erreur non gérée:'), error);
  process.exit(1);
});

// Lancer la migration
if (require.main === module) {
  main();
}