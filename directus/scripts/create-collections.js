#!/usr/bin/env node
const { createDirectus, rest, createCollection, createField } = require('@directus/sdk');
const collectionsSchema = require('../schema/collections.json');
const chalk = require('chalk');
const ora = require('ora');

async function createCollections() {
  console.log(chalk.bold.blue('\n📦 Création des 48 collections Directus\n'));
  
  const client = createDirectus(process.env.DIRECTUS_URL)
    .with(rest());
  
  // Authentification
  await client.login(process.env.DIRECTUS_EMAIL, process.env.DIRECTUS_PASSWORD);
  
  let totalCreated = 0;
  let totalFailed = 0;
  
  for (const [module, moduleData] of Object.entries(collectionsSchema)) {
    console.log(chalk.yellow(`\n📂 Module: ${module}`));
    
    for (const collection of moduleData.collections) {
      const spinner = ora(`Création de ${collection.name}...`).start();
      
      try {
        // Créer la collection
        await client.request(createCollection({
          collection: collection.name,
          meta: {
            icon: collection.icon,
            note: collection.description,
            display_template: collection.display_template,
            singleton: collection.singleton || false
          }
        }));
        
        // Créer les champs
        for (const field of collection.fields) {
          await client.request(createField(collection.name, field));
        }
        
        spinner.succeed(`${collection.name} créée ✅`);
        totalCreated++;
        
      } catch (error) {
        spinner.fail(`${collection.name} erreur: ${error.message}`);
        totalFailed++;
      }
    }
  }
  
  console.log(chalk.green(`\n🎉 Résumé:`));
  console.log(chalk.green(`  ✅ Collections créées: ${totalCreated}`));
  if (totalFailed > 0) {
    console.log(chalk.red(`  ❌ Échecs: ${totalFailed}`));
  }
}

if (require.main === module) {
  createCollections().catch(console.error);
}

module.exports = createCollections;