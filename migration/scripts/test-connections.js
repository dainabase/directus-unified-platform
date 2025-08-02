#!/usr/bin/env node
const { config } = require('dotenv');
const { createDirectus, rest, authentication } = require('@directus/sdk');
const { Client: NotionClient } = require('@notionhq/client');
const chalk = require('chalk');
const ora = require('ora');

config();

async function testConnections() {
  console.log(chalk.bold.blue('\n🔌 Test des connexions\n'));

  // Test Directus
  const directusSpinner = ora('Test connexion Directus...').start();
  try {
    const client = createDirectus(process.env.DIRECTUS_URL)
      .with(authentication())
      .with(rest());
    
    await client.login(process.env.DIRECTUS_EMAIL, process.env.DIRECTUS_PASSWORD);
    directusSpinner.succeed('Directus connecté ✅');
  } catch (error) {
    directusSpinner.fail(`Directus erreur: ${error.message}`);
    process.exit(1);
  }

  // Test Notion
  const notionSpinner = ora('Test connexion Notion...').start();
  try {
    const notion = new NotionClient({ auth: process.env.NOTION_API_KEY });
    await notion.users.me();
    notionSpinner.succeed('Notion connecté ✅');
  } catch (error) {
    notionSpinner.fail(`Notion erreur: ${error.message}`);
    process.exit(1);
  }

  console.log(chalk.green('\n✨ Toutes les connexions sont OK!\n'));
}

if (require.main === module) {
  testConnections();
}

module.exports = testConnections;