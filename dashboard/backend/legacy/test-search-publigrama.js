require('dotenv').config();
const { Client } = require('@notionhq/client');

console.log('🔍 Recherche PUBLIGRAMA dans DB-CONTACTS-ENTREPRISES...');
console.log('📍 Clé API:', process.env.NOTION_API_KEY ? '✅ Trouvée' : '❌ Manquante');

const notion = new Client({
  auth: process.env.NOTION_API_KEY
});

// ID de la base DB-CONTACTS-ENTREPRISES (essayons celui du projet)
const DB_CONTACTS_ENTREPRISES = '223adb95-3c6f-80e7-aa2b-cfd9888f2af3';

console.log('🔍 Note: ID utilisé:', DB_CONTACTS_ENTREPRISES);
console.log('📝 ID original fourni: 223adb95-3c6f-807b-877e-000be0c1e3d3');
console.log('📝 ID du projet: 223adb95-3c6f-80e7-aa2b-cfd9888f2af3');

async function searchPubligrama() {
  try {
    console.log('\n📋 Test d\'accès à la base de données...');
    
    // Vérifier l'accès à la base
    const db = await notion.databases.retrieve({ database_id: DB_CONTACTS_ENTREPRISES });
    console.log('✅ Accès DB-CONTACTS-ENTREPRISES:', db.title[0]?.plain_text || 'Sans titre');
    
    console.log('\n🔍 1. Recherche des entreprises contenant "PUBLIGRAMA"...');
    
    // Recherche 1: PUBLIGRAMA (en utilisant les vrais noms de propriétés)
    const searchPubligrama = await notion.databases.query({
      database_id: DB_CONTACTS_ENTREPRISES,
      filter: {
        or: [
          {
            property: 'Nom Entreprise',
            title: {
              contains: 'PUBLIGRAMA'
            }
          },
          {
            property: 'Notes',
            rich_text: {
              contains: 'PUBLIGRAMA'
            }
          },
          {
            property: 'Notes SUPERADMIN',
            rich_text: {
              contains: 'PUBLIGRAMA'
            }
          }
        ]
      }
    });
    
    console.log(`📊 Résultats PUBLIGRAMA: ${searchPubligrama.results.length} entreprise(s) trouvée(s)`);
    
    if (searchPubligrama.results.length > 0) {
      searchPubligrama.results.forEach((result, index) => {
        console.log(`\n📌 Résultat ${index + 1}:`);
        console.log(`   🆔 ID: ${result.id}`);
        
        // Afficher toutes les propriétés disponibles
        Object.entries(result.properties).forEach(([key, value]) => {
          let displayValue = '';
          switch (value.type) {
            case 'title':
              displayValue = value.title[0]?.plain_text || '';
              break;
            case 'rich_text':
              displayValue = value.rich_text[0]?.plain_text || '';
              break;
            case 'email':
              displayValue = value.email || '';
              break;
            case 'phone_number':
              displayValue = value.phone_number || '';
              break;
            case 'url':
              displayValue = value.url || '';
              break;
            case 'select':
              displayValue = value.select?.name || '';
              break;
            case 'multi_select':
              displayValue = value.multi_select.map(item => item.name).join(', ');
              break;
            case 'relation':
              displayValue = `${value.relation.length} relation(s)`;
              break;
            case 'people':
              displayValue = value.people.map(person => person.name).join(', ');
              break;
            default:
              displayValue = JSON.stringify(value);
          }
          
          if (displayValue) {
            console.log(`   📝 ${key}: ${displayValue}`);
          }
        });
      });
    }
    
    console.log('\n🔍 2. Recherche des entreprises contenant "ADVERTISING"...');
    
    // Recherche 2: ADVERTISING (en utilisant les vrais noms de propriétés)
    const searchAdvertising = await notion.databases.query({
      database_id: DB_CONTACTS_ENTREPRISES,
      filter: {
        or: [
          {
            property: 'Nom Entreprise',
            title: {
              contains: 'ADVERTISING'
            }
          },
          {
            property: 'Secteur',
            select: {
              equals: 'ADVERTISING'
            }
          },
          {
            property: 'Notes',
            rich_text: {
              contains: 'ADVERTISING'
            }
          },
          {
            property: 'Notes SUPERADMIN',
            rich_text: {
              contains: 'ADVERTISING'
            }
          }
        ]
      }
    });
    
    console.log(`📊 Résultats ADVERTISING: ${searchAdvertising.results.length} entreprise(s) trouvée(s)`);
    
    if (searchAdvertising.results.length > 0) {
      searchAdvertising.results.forEach((result, index) => {
        console.log(`\n📌 Résultat ${index + 1}:`);
        console.log(`   🆔 ID: ${result.id}`);
        
        // Afficher les propriétés pertinentes
        Object.entries(result.properties).forEach(([key, value]) => {
          let displayValue = '';
          switch (value.type) {
            case 'title':
              displayValue = value.title[0]?.plain_text || '';
              break;
            case 'rich_text':
              displayValue = value.rich_text[0]?.plain_text || '';
              break;
            case 'email':
              displayValue = value.email || '';
              break;
            case 'select':
              displayValue = value.select?.name || '';
              break;
            case 'people':
              displayValue = value.people.map(person => person.name).join(', ');
              break;
          }
          
          if (displayValue && (key.toLowerCase().includes('name') || key.toLowerCase().includes('nom') || key.toLowerCase().includes('industry') || key.toLowerCase().includes('secteur'))) {
            console.log(`   📝 ${key}: ${displayValue}`);
          }
        });
      });
    }
    
    console.log('\n🔍 3. Recherche du contact "Miguel Angel"...');
    
    // Recherche 3: Contacts Miguel Angel (recherche dans les notes uniquement car people nécessite UUID)
    const searchMiguelAngel = await notion.databases.query({
      database_id: DB_CONTACTS_ENTREPRISES,
      filter: {
        or: [
          {
            property: 'Notes',
            rich_text: {
              contains: 'Miguel Angel'
            }
          },
          {
            property: 'Notes SUPERADMIN',
            rich_text: {
              contains: 'Miguel Angel'
            }
          }
        ]
      }
    });
    
    console.log(`📊 Résultats Miguel Angel: ${searchMiguelAngel.results.length} entreprise(s) avec ce contact`);
    
    if (searchMiguelAngel.results.length > 0) {
      searchMiguelAngel.results.forEach((result, index) => {
        console.log(`\n📌 Entreprise ${index + 1} avec Miguel Angel:`);
        console.log(`   🆔 ID: ${result.id}`);
        
        // Afficher les propriétés pertinentes
        Object.entries(result.properties).forEach(([key, value]) => {
          let displayValue = '';
          switch (value.type) {
            case 'title':
              displayValue = value.title[0]?.plain_text || '';
              break;
            case 'rich_text':
              displayValue = value.rich_text[0]?.plain_text || '';
              break;
            case 'people':
              displayValue = value.people.map(person => person.name).join(', ');
              break;
          }
          
          if (displayValue) {
            console.log(`   📝 ${key}: ${displayValue}`);
          }
        });
      });
    }
    
    console.log('\n📋 RÉSUMÉ DES RECHERCHES:');
    console.log(`📊 PUBLIGRAMA: ${searchPubligrama.results.length} résultat(s)`);
    console.log(`📊 ADVERTISING: ${searchAdvertising.results.length} résultat(s)`);
    console.log(`📊 Miguel Angel: ${searchMiguelAngel.results.length} résultat(s)`);
    
    // Collecter tous les IDs trouvés
    const allIds = new Set();
    [...searchPubligrama.results, ...searchAdvertising.results, ...searchMiguelAngel.results].forEach(result => {
      allIds.add(result.id);
    });
    
    console.log(`\n🎯 TOTAL: ${allIds.size} entreprise(s) unique(s) trouvée(s)`);
    console.log('🆔 IDs uniques:', Array.from(allIds));
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error('📋 Code erreur:', error.code);
    
    if (error.code === 'unauthorized') {
      console.log('🔑 Vérifiez que la clé API est correcte et que l\'intégration a accès à cette base');
    } else if (error.code === 'object_not_found') {
      console.log('🔗 L\'ID de base de données semble incorrect ou l\'intégration n\'y a pas accès');
      console.log('🔍 ID utilisé:', DB_CONTACTS_ENTREPRISES);
      console.log('💡 Vérifiez l\'ID dans Notion ou ajoutez l\'intégration à la base');
    } else if (error.code === 'validation_error') {
      console.log('⚠️  Erreur de validation - les noms de propriétés peuvent être incorrects');
      console.log('💡 Récupérons d\'abord la structure de la base...');
      
      try {
        const db = await notion.databases.retrieve({ database_id: DB_CONTACTS_ENTREPRISES });
        console.log('\n📋 Propriétés disponibles dans la base:');
        Object.entries(db.properties).forEach(([key, prop]) => {
          console.log(`   📝 ${key} (${prop.type})`);
        });
      } catch (structError) {
        console.log('❌ Impossible de récupérer la structure:', structError.message);
      }
    }
  }
}

searchPubligrama();