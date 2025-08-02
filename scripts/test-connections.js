#!/usr/bin/env node

const chalk = require('chalk');
const ora = require('ora');
const axios = require('axios');
require('dotenv').config();

console.log(chalk.bold.cyan('\n🔌 Test des connexions système\n'));

const tests = [];

// Test 1: Directus API
async function testDirectus() {
  const spinner = ora('Test connexion Directus...').start();
  try {
    const response = await axios.get('http://localhost:8055/server/health');
    if (response.data.status === 'ok') {
      spinner.succeed('Directus API : ' + chalk.green('✅ OK'));
      const info = await axios.get('http://localhost:8055/server/info');
      console.log(chalk.gray(`  → Version: Directus ${info.data.data.project.project_name}`));
      return true;
    }
  } catch (error) {
    spinner.fail('Directus API : ' + chalk.red('❌ ERREUR'));
    console.log(chalk.gray(`  → ${error.message}`));
    return false;
  }
}

// Test 2: PostgreSQL
async function testPostgres() {
  const spinner = ora('Test connexion PostgreSQL...').start();
  try {
    // Test via Directus qui utilise Postgres
    const response = await axios.get('http://localhost:8055/server/info');
    if (response.status === 200) {
      spinner.succeed('PostgreSQL : ' + chalk.green('✅ OK (via Directus)'));
      console.log(chalk.gray(`  → Port: 5432`));
      return true;
    }
  } catch (error) {
    spinner.fail('PostgreSQL : ' + chalk.red('❌ ERREUR'));
    console.log(chalk.gray(`  → ${error.message}`));
    return false;
  }
}

// Test 3: Redis
async function testRedis() {
  const spinner = ora('Test connexion Redis...').start();
  try {
    // Test via Redis Commander
    const response = await axios.get('http://localhost:8081');
    if (response.status === 200) {
      spinner.succeed('Redis : ' + chalk.green('✅ OK'));
      console.log(chalk.gray(`  → Port: 6379, Commander: 8081`));
      return true;
    }
  } catch (error) {
    // Redis peut être OK même si commander ne répond pas
    spinner.warn('Redis : ' + chalk.yellow('⚠️  Commander non accessible'));
    console.log(chalk.gray(`  → Vérifier manuellement sur port 6379`));
    return null;
  }
}

// Test 4: Notion API (si configuré)
async function testNotion() {
  const spinner = ora('Test connexion Notion API...').start();
  
  if (!process.env.NOTION_API_KEY) {
    spinner.warn('Notion API : ' + chalk.yellow('⚠️  Clé API non configurée'));
    console.log(chalk.gray(`  → Configurer NOTION_API_KEY dans .env`));
    return null;
  }

  try {
    const { Client } = require('@notionhq/client');
    const notion = new Client({ auth: process.env.NOTION_API_KEY });
    const response = await notion.users.me();
    
    spinner.succeed('Notion API : ' + chalk.green('✅ OK'));
    console.log(chalk.gray(`  → Utilisateur: ${response.name || response.id}`));
    return true;
  } catch (error) {
    spinner.fail('Notion API : ' + chalk.red('❌ ERREUR'));
    console.log(chalk.gray(`  → ${error.message}`));
    return false;
  }
}

// Test 5: Dashboard Backend
async function testDashboardBackend() {
  const spinner = ora('Test Dashboard Backend...').start();
  try {
    const response = await axios.get('http://localhost:3001/api/health');
    if (response.status === 200) {
      spinner.succeed('Dashboard Backend : ' + chalk.green('✅ OK'));
      console.log(chalk.gray(`  → Port: 3001`));
      return true;
    }
  } catch (error) {
    spinner.warn('Dashboard Backend : ' + chalk.yellow('⚠️  Non démarré'));
    console.log(chalk.gray(`  → Lancer avec: npm run dashboard:backend`));
    return false;
  }
}

// Test 6: OCR Service
async function testOCRService() {
  const spinner = ora('Test Service OCR...').start();
  
  const fs = require('fs');
  const ocrPath = './dashboard/ocr-service';
  
  if (!fs.existsSync(ocrPath)) {
    spinner.fail('Service OCR : ' + chalk.red('❌ Dossier manquant'));
    return false;
  }
  
  const dockerfileExists = fs.existsSync(`${ocrPath}/Dockerfile`);
  const envExists = fs.existsSync(`${ocrPath}/.env`);
  
  if (dockerfileExists && envExists) {
    spinner.succeed('Service OCR : ' + chalk.green('✅ Fichiers présents'));
    console.log(chalk.gray(`  → Dockerfile: ✓, .env: ✓`));
    console.log(chalk.gray(`  → Pour tester: cd dashboard/ocr-service && docker-compose up`));
    return true;
  } else {
    spinner.warn('Service OCR : ' + chalk.yellow('⚠️  Configuration incomplète'));
    console.log(chalk.gray(`  → Dockerfile: ${dockerfileExists ? '✓' : '✗'}, .env: ${envExists ? '✓' : '✗'}`));
    return false;
  }
}

// Exécution des tests
async function runAllTests() {
  console.log(chalk.bold('\n📊 Résultats des tests:\n'));
  
  const results = {
    directus: await testDirectus(),
    postgres: await testPostgres(),
    redis: await testRedis(),
    notion: await testNotion(),
    dashboard: await testDashboardBackend(),
    ocr: await testOCRService()
  };
  
  // Résumé
  console.log(chalk.bold('\n📈 Résumé:\n'));
  
  const total = Object.keys(results).length;
  const passed = Object.values(results).filter(r => r === true).length;
  const failed = Object.values(results).filter(r => r === false).length;
  const warning = Object.values(results).filter(r => r === null).length;
  
  console.log(`  ✅ Réussis: ${chalk.green(passed)}/${total}`);
  console.log(`  ❌ Échoués: ${chalk.red(failed)}/${total}`);
  console.log(`  ⚠️  Warnings: ${chalk.yellow(warning)}/${total}`);
  
  // Recommandations
  if (failed > 0 || warning > 0) {
    console.log(chalk.bold('\n💡 Recommandations:\n'));
    
    if (!results.directus) {
      console.log('  1. Démarrer Directus: ' + chalk.cyan('docker-compose up -d'));
    }
    if (!results.notion) {
      console.log('  2. Configurer Notion: ' + chalk.cyan('Ajouter NOTION_API_KEY dans .env'));
    }
    if (!results.dashboard) {
      console.log('  3. Démarrer Dashboard: ' + chalk.cyan('npm run dashboard:dev'));
    }
  } else if (passed === total) {
    console.log(chalk.green.bold('\n🎉 Toutes les connexions sont opérationnelles !'));
  }
  
  process.exit(failed > 0 ? 1 : 0);
}

// Lancer les tests
runAllTests().catch(console.error);