require('dotenv').config({ path: './.env' });
const { Client } = require('@notionhq/client');

const notion = new Client({
  auth: process.env.NOTION_API_KEY
});

async function testOCR() {
  console.log('🔑 Test avec clé:', process.env.NOTION_API_KEY);
  
  try {
    // Test connexion
    const me = await notion.users.me();
    console.log('✅ Connexion OK:', me.name);
    
    // Test DB
    const db = await notion.databases.retrieve({
      database_id: '226adb95-3c6f-8011-a9bb-ca31f7da8e6a'
    });
    console.log('✅ Base de données accessible:', db.title[0].plain_text);
    
    // Test création page
    const testPage = await notion.pages.create({
      parent: { database_id: '226adb95-3c6f-8011-a9bb-ca31f7da8e6a' },
      properties: {
        'Document': { title: [{ text: { content: 'TEST OCR' } }] },
        'Type': { select: { name: 'Facture' } }
      }
    });
    console.log('✅ Création page TEST réussie:', testPage.id);
    
  } catch (error) {
    console.error('❌ ERREUR:', error.code, error.message);
    if (error.code === 'unauthorized') {
      console.log('🔑 Clé API invalide ou pas d\'accès à la base');
      console.log('👉 Allez dans Notion > DB-FACTURES-CLIENTS > 3 points > Connexions');
      console.log('👉 Ajoutez votre intégration à la base de données');
    }
  }
}

testOCR();