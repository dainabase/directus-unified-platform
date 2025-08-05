#!/usr/bin/env node

/**
 * Test des connexions Notion et Directus
 */

const { Client: NotionClient } = require('@notionhq/client');
const axios = require('axios');
const chalk = require('chalk');
require('dotenv').config();

const NOTION_TOKEN = process.env.NOTION_API_KEY;
const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN;

console.log(chalk.cyan.bold('\n🔧 TEST DES CONNEXIONS\n'));

async function testNotionConnection() {
  console.log(chalk.gray('Testing Notion connection...'));
  
  if (!NOTION_TOKEN) {
    console.log(chalk.red('❌ NOTION_API_KEY not found in .env'));
    return false;
  }
  
  try {
    const notion = new NotionClient({ auth: NOTION_TOKEN });
    const response = await notion.users.me({});
    console.log(chalk.green('✅ Notion connected'));
    console.log(chalk.gray(`   User: ${response.name || 'Unknown'}`));
    console.log(chalk.gray(`   Type: ${response.type}`));
    return true;
  } catch (error) {
    console.log(chalk.red('❌ Notion connection failed'));
    console.log(chalk.red(`   Error: ${error.message}`));
    return false;
  }
}

async function testDirectusConnection() {
  console.log(chalk.gray('\nTesting Directus connection...'));
  
  if (!DIRECTUS_TOKEN) {
    console.log(chalk.red('❌ DIRECTUS_TOKEN not found in .env'));
    return false;
  }
  
  try {
    const response = await axios.get(
      `${DIRECTUS_URL}/server/info`,
      {
        headers: { 'Authorization': `Bearer ${DIRECTUS_TOKEN}` }
      }
    );
    
    console.log(chalk.green('✅ Directus connected'));
    if (response.data?.data?.directus) {
      console.log(chalk.gray(`   Version: ${response.data.data.directus.version || 'Unknown'}`));
      console.log(chalk.gray(`   Database: ${response.data.data.directus.database?.vendor || 'Unknown'}`));
    } else if (response.data?.data) {
      console.log(chalk.gray(`   Server info available`));
    }
    
    // Test time_tracking collection
    try {
      const collectionResponse = await axios.get(
        `${DIRECTUS_URL}/collections/time_tracking`,
        {
          headers: { 'Authorization': `Bearer ${DIRECTUS_TOKEN}` }
        }
      );
      console.log(chalk.green('✅ Collection time_tracking exists'));
      
      // Compter les entrées
      const itemsResponse = await axios.get(
        `${DIRECTUS_URL}/items/time_tracking?aggregate[count]=*`,
        {
          headers: { 'Authorization': `Bearer ${DIRECTUS_TOKEN}` }
        }
      );
      const count = itemsResponse.data.data[0]?.count || 0;
      console.log(chalk.gray(`   Current items: ${count}`));
    } catch (error) {
      if (error.response?.status === 403) {
        console.log(chalk.yellow('⚠️  Collection time_tracking exists but no read permission'));
      } else {
        console.log(chalk.yellow('⚠️  Collection time_tracking not found'));
      }
    }
    
    return true;
  } catch (error) {
    console.log(chalk.red('❌ Directus connection failed'));
    console.log(chalk.red(`   Error: ${error.message}`));
    if (error.response?.data) {
      console.log(chalk.red(`   Details: ${JSON.stringify(error.response.data)}`));
    }
    return false;
  }
}

async function searchNotionDatabases() {
  console.log(chalk.gray('\nSearching for Notion databases...'));
  
  try {
    const notion = new NotionClient({ auth: NOTION_TOKEN });
    const response = await notion.search({
      filter: {
        property: 'object',
        value: 'database'
      },
      page_size: 100
    });
    
    console.log(chalk.green(`\n✅ Found ${response.results.length} databases`));
    
    // Chercher DB-TIME-TRACKING
    const timeTracking = response.results.find(db => 
      db.title[0]?.text?.content?.includes('TIME') ||
      db.title[0]?.text?.content?.includes('TRACKING')
    );
    
    if (timeTracking) {
      console.log(chalk.cyan('\n📊 Found potential time tracking database:'));
      console.log(chalk.white(`   Name: ${timeTracking.title[0]?.text?.content}`));
      console.log(chalk.white(`   ID: ${timeTracking.id}`));
      console.log(chalk.gray(`   URL: ${timeTracking.url}`));
      
      // Tester l'accès
      try {
        const dbResponse = await notion.databases.query({
          database_id: timeTracking.id,
          page_size: 1
        });
        console.log(chalk.green(`   ✅ Can access database (${dbResponse.results.length} items sampled)`));
        return timeTracking.id;
      } catch (error) {
        console.log(chalk.red(`   ❌ Cannot access database: ${error.message}`));
      }
    } else {
      console.log(chalk.yellow('\n⚠️  No TIME-TRACKING database found'));
      
      // Lister les 10 premières bases trouvées
      console.log(chalk.gray('\nFirst 10 databases found:'));
      response.results.slice(0, 10).forEach((db, index) => {
        console.log(chalk.gray(`   ${index + 1}. ${db.title[0]?.text?.content || 'Untitled'}`));
        console.log(chalk.gray(`      ID: ${db.id}`));
      });
    }
    
    return null;
  } catch (error) {
    console.log(chalk.red('❌ Failed to search databases'));
    console.log(chalk.red(`   Error: ${error.message}`));
    return null;
  }
}

async function main() {
  const notionOk = await testNotionConnection();
  const directusOk = await testDirectusConnection();
  
  if (notionOk && directusOk) {
    console.log(chalk.green.bold('\n✅ All connections successful!'));
    
    const dbId = await searchNotionDatabases();
    
    if (dbId) {
      console.log(chalk.cyan.bold('\n🎯 NEXT STEP:'));
      console.log(chalk.white(`Update NOTION_DATABASE_ID in migrate-time-tracking.js to:`));
      console.log(chalk.yellow(`const NOTION_DATABASE_ID = '${dbId}';`));
      console.log(chalk.white('\nThen run:'));
      console.log(chalk.gray('node migration/scripts/migrate-time-tracking.js'));
    }
  } else {
    console.log(chalk.red.bold('\n❌ Some connections failed. Please check your configuration.'));
    process.exit(1);
  }
}

main().catch(console.error);