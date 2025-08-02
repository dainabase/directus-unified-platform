#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');

async function verifySetup() {
  console.log(chalk.bold.blue('\n🔍 Vérification de la configuration\n'));

  const checks = [
    {
      name: 'Structure des dossiers',
      check: () => {
        const requiredDirs = [
          'migration/scripts',
          'migration/src',
          'dashboard/frontend',
          'dashboard/backend',
          'directus/schema',
          'config',
          'tests'
        ];
        
        for (const dir of requiredDirs) {
          if (!fs.existsSync(dir)) {
            throw new Error(`Dossier manquant: ${dir}`);
          }
        }
        return true;
      }
    },
    {
      name: 'Fichiers de configuration',
      check: () => {
        const requiredFiles = [
          'package.json',
          '.env.example',
          '.gitignore',
          'README.md'
        ];
        
        for (const file of requiredFiles) {
          if (!fs.existsSync(file)) {
            throw new Error(`Fichier manquant: ${file}`);
          }
        }
        return true;
      }
    },
    {
      name: 'Variables d\'environnement',
      check: () => {
        if (!fs.existsSync('.env')) {
          throw new Error('Fichier .env manquant - copier depuis .env.example');
        }
        return true;
      }
    },
    {
      name: 'Scripts de migration',
      check: () => {
        const migrationScripts = [
          'migration/scripts/test-connections.js'
        ];
        
        for (const script of migrationScripts) {
          if (!fs.existsSync(script)) {
            throw new Error(`Script manquant: ${script}`);
          }
        }
        return true;
      }
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const check of checks) {
    const spinner = ora(check.name).start();
    
    try {
      await check.check();
      spinner.succeed(`${check.name} ✅`);
      passed++;
    } catch (error) {
      spinner.fail(`${check.name}: ${error.message}`);
      failed++;
    }
  }

  console.log(chalk.green(`\n📊 Résumé de la vérification:`));
  console.log(chalk.green(`  ✅ Vérifications réussies: ${passed}`));
  
  if (failed > 0) {
    console.log(chalk.red(`  ❌ Vérifications échouées: ${failed}`));
    console.log(chalk.yellow('\n📋 Prochaines étapes:'));
    console.log('1. Corriger les erreurs ci-dessus');
    console.log('2. Configurer le fichier .env');
    console.log('3. Lancer npm run migrate:test-connections');
  } else {
    console.log(chalk.green('\n🎉 Configuration OK! Prêt à migrer.'));
    console.log(chalk.cyan('\n📋 Prochaines étapes:'));
    console.log('1. npm run migrate:test-connections');
    console.log('2. npm run directus:create-collections');
    console.log('3. npm run migrate:analyze');
  }
}

if (require.main === module) {
  verifySetup().catch(console.error);
}

module.exports = verifySetup;