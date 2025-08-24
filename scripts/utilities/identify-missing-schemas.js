#!/usr/bin/env node

const axios = require('axios');

const DIRECTUS_URL = 'http://localhost:8055';
const DIRECTUS_TOKEN = 'e6Vt5LRHnYhq7-78yzoSxwdgjn2D6-JW';

const directus = axios.create({
  baseURL: DIRECTUS_URL,
  headers: {
    'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

async function checkCollectionSchemas() {
  console.log('🔍 Vérification des collections sans schéma DB...\n');
  
  try {
    const response = await directus.get('/collections');
    const collections = response.data.data;
    
    const missingSchemas = [];
    const hasSchemas = [];
    
    for (const col of collections) {
      // Ignorer les collections système Directus
      if (col.collection.startsWith('directus_')) continue;
      
      // Vérifier si la collection a un schéma
      if (!col.schema) {
        missingSchemas.push(col.collection);
      } else {
        hasSchemas.push(col.collection);
      }
    }
    
    console.log(`📊 Collections SANS schéma DB (${missingSchemas.length}):`);
    missingSchemas.forEach(c => console.log(`  ❌ ${c}`));
    
    console.log(`\n✅ Collections AVEC schéma DB (${hasSchemas.length}):`);
    hasSchemas.forEach(c => console.log(`  ✅ ${c}`));
    
    console.log(`\n📈 Total: ${collections.length} collections`);
    console.log(`   - Avec schéma: ${hasSchemas.length} (${Math.round(hasSchemas.length/collections.length*100)}%)`);
    console.log(`   - Sans schéma: ${missingSchemas.length} (${Math.round(missingSchemas.length/collections.length*100)}%)`);
    
    return missingSchemas;
  } catch (error) {
    console.error('Erreur:', error.response?.data || error.message);
    return [];
  }
}

checkCollectionSchemas();
