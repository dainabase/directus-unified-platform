require('dotenv').config();
const { Client } = require('@notionhq/client');

console.log('🔍 Test de connexion Notion...');
console.log('📍 Clé API:', process.env.NOTION_API_KEY ? '✅ Trouvée' : '❌ Manquante');

const notion = new Client({
  auth: process.env.NOTION_API_KEY
});

async function testConnection() {
  try {
    // Test de connexion basique
    const response = await notion.users.me();
    console.log('✅ Connexion Notion réussie !');
    console.log('👤 Bot:', response.name);
    
    // Test accès à la base de données factures
    const dbId = '226adb95-3c6f-8011-a9bb-ca31f7da8e6a';
    const db = await notion.databases.retrieve({ database_id: dbId });
    console.log('✅ Accès DB-FACTURES-CLIENTS:', db.title[0].plain_text);
    
    console.log('\n🎉 TOUT EST OK ! L\'OCR peut fonctionner.');
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    if (error.code === 'unauthorized') {
      console.log('🔑 Vérifiez que la clé API est correcte');
    } else if (error.code === 'object_not_found') {
      console.log('🔗 Ajoutez l\'intégration à la base de données dans Notion');
    }
  }
}

testConnection();