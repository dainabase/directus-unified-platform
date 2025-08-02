# 🚀 PROMPT CLAUDE CODE : Analyse exhaustive des 53 bases Notion

## 📋 MISSION : Analyser en profondeur TOUTES les propriétés, relations, rollups et formules

### Contexte critique
- **53 bases de données** Notion à analyser
- **Complexité découverte** : 60+ propriétés par base, 10+ relations, 25+ rollups/formules
- **Objectif** : Comprendre EXACTEMENT ce qu'on doit migrer vers Directus

## 🎯 Instructions pour Claude Code

### 1. Setup initial
```bash
cd ~/Documents/directus-unified-platform
mkdir -p migration/analysis
cd migration

# Installer les dépendances si nécessaire
npm install @notionhq/client chalk ora dotenv fs-extra
```

### 2. Créer le script d'analyse complet

```javascript
// Fichier : migration/analyze-notion-complete.js

import { Client } from '@notionhq/client';
import fs from 'fs-extra';
import chalk from 'chalk';
import ora from 'ora';
import dotenv from 'dotenv';

dotenv.config();

const notion = new Client({ auth: process.env.NOTION_API_KEY });

// Liste complète des 53 bases de données
const DATABASES = {
  // MODULE 1 - PROJETS & OPÉRATIONS (11 bases)
  'projets': [
    { id: '226adb953c6f806e9e61e263baf7af69', name: 'DB-PROJETS CLIENTS' },
    { id: '227adb953c6f8047b7c1e7d309071682', name: 'DB-TACHES' },
    { id: '230adb953c6f80eb9903ff117c2a518f', name: 'DB-DOCUMENTS' },
    { id: '230adb953c6f800dbfc4ed1ede7135c3', name: 'DB-VALIDATION' },
    { id: '230adb953c6f807f81b1e5e90ea9dd17', name: 'DB-COMMUNICATION' },
    { id: '236adb953c6f80caa317c7ff9dc7153c', name: 'DB-MISSIONS-PRESTATAIRE' },
    { id: '236adb953c6f801f94d8ee19736de74c', name: 'DB-LIVRABLES-PRESTATAIRE' },
    { id: '236adb953c6f804b807effb4318fb667', name: 'DB-PERFORMANCE-HISTORIQUE' },
    { id: '236adb953c6f80f78034dedae4272189', name: 'DB-REWARDS-TRACKING' },
    { id: '22aadb953c6f808cb8c0fb19143c9440', name: 'DB-PRESTATAIRES' },
    { id: '22aadb953c6f803da598f91866fc5f27', name: 'DB-ÉQUIPE-RESSOURCES' },
    { id: '236adb953c6f80a0b65dd69ea599d39a', name: 'DB-TIME-TRACKING' }
  ],
  
  // MODULE 2 - CRM & CONTACTS (9 bases)
  'crm': [
    { id: '223adb953c6f80e7aa2bcfd9888f2af3', name: 'DB-CONTACTS-ENTREPRISES' },
    { id: '22cadb953c6f80f18e05ffe0eef29f52', name: 'DB-CONTACTS-PERSONNES' },
    { id: '22eadb953c6f80e7b27fd6310bff8124', name: 'DB-LEAD-LIFECYCLE' },
    { id: '22eadb953c6f80258af8d62f25c76482', name: 'DB-LEAD-SCORING' },
    { id: '231adb953c6f80818761c18d318e05fe', name: 'DB-LEAD-SEQUENCES' },
    { id: '22eadb953c6f802489c2fde6ef18d2d0', name: 'DB-SALES-PIPELINE' },
    { id: '22eadb953c6f8008bef9df4d3367e88f', name: 'DB-CUSTOMER SUCCESS' },
    { id: '226adb953c6f805f9095d4c6278a5f5b', name: 'DB-INTERACTIONS CLIENTS' },
    { id: '231adb953c6f8002b885c94041b44a44', name: 'DB-ENTITÉ DU GROUPE' }
  ],
  
  // MODULE 3 - FINANCE & COMPTABILITÉ (8 bases)
  'finance': [
    { id: '226adb953c6f8011a9bbca31f7da8e6a', name: 'DB-FACTURES-CLIENTS' },
    { id: '237adb953c6f80de9f92c795334e5561', name: 'DB-FACTURES-FOURNISSEURS' },
    { id: '237adb953c6f803c9eade6156b991db4', name: 'DB-TRANSACTIONS-BANCAIRES' },
    { id: '237adb953c6f804ba530e44d07ac9f7b', name: 'DB-NOTES-FRAIS' },
    { id: '237adb953c6f8042b5befa51e13c390f', name: 'DB-ECRITURES-COMPTABLES' },
    { id: '237adb953c6f801fa746c0f0560f8d67', name: 'DB-TVA-DECLARATIONS' },
    { id: '231adb953c6f80ba9608c9e5fdd4baf9', name: 'DB-SUIVI D\'ABONNEMENTS' },
    { id: '22eadb953c6f80d08e51fbbacd56e138', name: 'DB-PREVISIONS-TRESORERIE' }
  ],
  
  // MODULE 4 - MARKETING & COMMUNICATION (9 bases)
  'marketing': [
    { id: '22eadb953c6f804c9690f39a1e567458', name: 'DB-CAMPAIGNS' },
    { id: '22eadb953c6f80a3904ddffa85d2959f', name: 'DB-EVENTS' },
    { id: '22eadb953c6f80cbac16c7def264cfd9', name: 'DB-SEO-CONTENT' },
    { id: '22eadb953c6f80a1b55fcc4e55bde81f', name: 'DB-SOCIAL-MEDIA' },
    // Ajouter les 5 autres bases marketing
  ],
  
  // MODULE 5 - ANALYTICS & REPORTING (6 bases)
  'analytics': [
    { id: '22eadb953c6f808da7f3d245073b8ae1', name: 'DB-KPI-DASHBOARD' },
    { id: '22eadb953c6f80108a17cb8e42388cb3', name: 'DB-ANALYTICS' },
    { id: '22eadb953c6f803ea6bde1aeb2affdca', name: 'DB-REPORTING' },
    { id: '231adb953c6f80138466ca1431ec02a3', name: 'DB-REPORTS' },
    { id: '22eadb953c6f8050ad0ccfd4d47aac65', name: 'DB-PREDICTIVE-INSIGHTS' },
    { id: '236adb953c6f801bb7d2fce14f6c3d11', name: 'DB-ZONES-GEOGRAPHIQUES' }
  ],
  
  // MODULE 6 - SYSTÈME & AUTOMATISATION (7 bases)
  'system': [
    { id: '230adb953c6f80728507c02f20b62033', name: 'DB-WORKFLOW-AUTOMATION' },
    { id: '230adb953c6f800b8b24e4807fd78757', name: 'DB-INTEGRATION-API' },
    { id: '230adb953c6f8014899dc5933146de25', name: 'DB-TEMPLATE-MANAGER' },
    { id: '230adb953c6f804baaa5e6f461f88e37', name: 'DB-SYSTEM-LOGS' },
    { id: '231adb953c6f809ba883e631b30539df', name: 'DB-AUTOMATION-RULES' },
    { id: '231adb953c6f80388811c01103788e14', name: 'DB-ALERTS-CENTER' },
    { id: '22eadb953c6f809981fed4890db02d9c', name: 'DB-JURIDIQUE-CONTRACTS' }
  ],
  
  // MODULE 7 - RH & CONFORMITÉ (3 bases)
  'rh': [
    { id: '22eadb953c6f8036bf76f7ebaa40aba2', name: 'DB-EMPLOYEES' },
    { id: '22eadb953c6f809d9845eb6f9ee659ee', name: 'DB-TALENTS' },
    { id: '22eadb953c6f80bab600c66795e256cb', name: 'DB-COMPLIANCE' }
  ]
};

async function analyzeDatabase(database) {
  const spinner = ora(`Analyse de ${database.name}...`).start();
  
  try {
    // 1. Récupérer les métadonnées de la base
    const dbInfo = await notion.databases.retrieve({ database_id: database.id });
    
    // 2. Analyser chaque propriété en détail
    const properties = {};
    const stats = {
      total: 0,
      relations: 0,
      rollups: 0,
      formulas: 0,
      selects: 0,
      numbers: 0,
      dates: 0,
      people: 0,
      files: 0,
      checkboxes: 0,
      urls: 0,
      emails: 0,
      phones: 0,
      createdTime: 0,
      createdBy: 0,
      lastEditedTime: 0,
      lastEditedBy: 0,
      buttons: 0
    };
    
    for (const [key, prop] of Object.entries(dbInfo.properties)) {
      stats.total++;
      stats[prop.type] = (stats[prop.type] || 0) + 1;
      
      properties[key] = {
        name: key,
        type: prop.type,
        id: prop.id
      };
      
      // Détails spécifiques selon le type
      switch (prop.type) {
        case 'relation':
          properties[key].relation = {
            database_id: prop.relation.database_id,
            type: prop.relation.type,
            property: prop.relation.single_property || prop.relation.dual_property
          };
          break;
          
        case 'rollup':
          properties[key].rollup = {
            relation_property: prop.rollup.relation_property_name,
            relation_property_id: prop.rollup.relation_property_id,
            rollup_property: prop.rollup.rollup_property_name,
            function: prop.rollup.function
          };
          break;
          
        case 'formula':
          properties[key].formula = {
            expression: prop.formula.expression,
            result_type: prop.formula.type
          };
          break;
          
        case 'select':
        case 'multi_select':
          properties[key].options = prop[prop.type].options.map(o => ({
            name: o.name,
            color: o.color
          }));
          break;
          
        case 'number':
          properties[key].format = prop.number.format;
          break;
      }
    }
    
    // 3. Compter les entrées
    let pageCount = 0;
    let hasMore = true;
    let cursor = undefined;
    
    while (hasMore) {
      const response = await notion.databases.query({
        database_id: database.id,
        start_cursor: cursor,
        page_size: 100
      });
      
      pageCount += response.results.length;
      hasMore = response.has_more;
      cursor = response.next_cursor;
    }
    
    // 4. Extraire un échantillon de données
    const sampleData = await notion.databases.query({
      database_id: database.id,
      page_size: 3
    });
    
    spinner.succeed(chalk.green(`✓ ${database.name} analysée`));
    
    return {
      id: database.id,
      name: database.name,
      title: dbInfo.title[0]?.plain_text || database.name,
      description: dbInfo.description[0]?.plain_text || '',
      properties,
      stats,
      pageCount,
      created_time: dbInfo.created_time,
      last_edited_time: dbInfo.last_edited_time,
      sample_pages: sampleData.results.length
    };
    
  } catch (error) {
    spinner.fail(chalk.red(`✗ Erreur ${database.name}: ${error.message}`));
    return {
      id: database.id,
      name: database.name,
      error: error.message
    };
  }
}

async function analyzeAllDatabases() {
  console.log(chalk.blue.bold('\n🔍 ANALYSE COMPLÈTE DES 53 BASES NOTION\n'));
  
  const results = {
    timestamp: new Date().toISOString(),
    modules: {},
    summary: {
      total_databases: 0,
      total_properties: 0,
      total_relations: 0,
      total_rollups: 0,
      total_formulas: 0,
      total_pages: 0,
      errors: []
    }
  };
  
  // Analyser module par module
  for (const [moduleName, databases] of Object.entries(DATABASES)) {
    console.log(chalk.yellow(`\n📁 Module ${moduleName.toUpperCase()} (${databases.length} bases)\n`));
    
    results.modules[moduleName] = {
      databases: [],
      stats: {
        database_count: databases.length,
        total_properties: 0,
        total_pages: 0
      }
    };
    
    for (const db of databases) {
      const analysis = await analyzeDatabase(db);
      
      if (!analysis.error) {
        results.modules[moduleName].databases.push(analysis);
        results.modules[moduleName].stats.total_properties += analysis.stats.total;
        results.modules[moduleName].stats.total_pages += analysis.pageCount;
        
        results.summary.total_properties += analysis.stats.total;
        results.summary.total_relations += analysis.stats.relations;
        results.summary.total_rollups += analysis.stats.rollups;
        results.summary.total_formulas += analysis.stats.formulas;
        results.summary.total_pages += analysis.pageCount;
      } else {
        results.summary.errors.push({
          module: moduleName,
          database: db.name,
          error: analysis.error
        });
      }
      
      results.summary.total_databases++;
    }
  }
  
  // Sauvegarder les résultats
  await fs.ensureDir('migration/analysis');
  await fs.writeJson('migration/analysis/notion-complete-analysis.json', results, { spaces: 2 });
  
  // Générer le rapport
  generateReport(results);
}

function generateReport(results) {
  console.log(chalk.green.bold('\n\n📊 RAPPORT D\'ANALYSE COMPLET\n'));
  console.log(chalk.white('═'.repeat(60)));
  
  // Résumé global
  console.log(chalk.blue.bold('\n📈 RÉSUMÉ GLOBAL'));
  console.log(chalk.white(`  Bases analysées     : ${results.summary.total_databases}`));
  console.log(chalk.white(`  Total propriétés    : ${results.summary.total_properties}`));
  console.log(chalk.white(`  Total relations     : ${results.summary.total_relations}`));
  console.log(chalk.white(`  Total rollups       : ${results.summary.total_rollups}`));
  console.log(chalk.white(`  Total formules      : ${results.summary.total_formulas}`));
  console.log(chalk.white(`  Total entrées       : ${results.summary.total_pages}`));
  console.log(chalk.red(`  Erreurs             : ${results.summary.errors.length}`));
  
  // Moyennes
  const avgProps = Math.round(results.summary.total_properties / results.summary.total_databases);
  const avgRelations = Math.round(results.summary.total_relations / results.summary.total_databases);
  const avgRollups = Math.round(results.summary.total_rollups / results.summary.total_databases);
  
  console.log(chalk.yellow.bold('\n📊 MOYENNES PAR BASE'));
  console.log(chalk.white(`  Propriétés/base     : ${avgProps}`));
  console.log(chalk.white(`  Relations/base      : ${avgRelations}`));
  console.log(chalk.white(`  Rollups/base        : ${avgRollups}`));
  
  // Complexité
  console.log(chalk.red.bold('\n⚠️  ANALYSE DE COMPLEXITÉ'));
  if (avgProps > 40) {
    console.log(chalk.red(`  🔴 TRÈS ÉLEVÉE : ${avgProps} propriétés moyennes`));
  } else if (avgProps > 25) {
    console.log(chalk.yellow(`  🟡 ÉLEVÉE : ${avgProps} propriétés moyennes`));
  } else {
    console.log(chalk.green(`  🟢 MODÉRÉE : ${avgProps} propriétés moyennes`));
  }
  
  // Détails par module
  console.log(chalk.blue.bold('\n📁 DÉTAILS PAR MODULE'));
  for (const [moduleName, moduleData] of Object.entries(results.modules)) {
    console.log(chalk.cyan(`\n  ${moduleName.toUpperCase()}`));
    console.log(chalk.white(`    Bases       : ${moduleData.stats.database_count}`));
    console.log(chalk.white(`    Propriétés  : ${moduleData.stats.total_properties}`));
    console.log(chalk.white(`    Entrées     : ${moduleData.stats.total_pages}`));
  }
  
  // Top 5 bases complexes
  console.log(chalk.magenta.bold('\n🏆 TOP 5 BASES LES PLUS COMPLEXES'));
  const allDatabases = [];
  for (const module of Object.values(results.modules)) {
    allDatabases.push(...module.databases);
  }
  
  const topComplex = allDatabases
    .filter(db => !db.error)
    .sort((a, b) => b.stats.total - a.stats.total)
    .slice(0, 5);
  
  topComplex.forEach((db, index) => {
    console.log(chalk.white(`  ${index + 1}. ${db.name}`));
    console.log(chalk.gray(`     ${db.stats.total} propriétés | ${db.stats.relations} relations | ${db.stats.rollups} rollups`));
  });
  
  // Erreurs
  if (results.summary.errors.length > 0) {
    console.log(chalk.red.bold('\n❌ ERREURS RENCONTRÉES'));
    results.summary.errors.forEach(err => {
      console.log(chalk.red(`  - ${err.database}: ${err.error}`));
    });
  }
  
  // Recommandations
  console.log(chalk.green.bold('\n💡 RECOMMANDATIONS'));
  console.log(chalk.white('  1. Architecture Directus : 45-50 collections minimum'));
  console.log(chalk.white('  2. Prévoir des champs JSON pour propriétés multiples'));
  console.log(chalk.white('  3. Créer des vues SQL pour rollups complexes'));
  console.log(chalk.white('  4. Implémenter des triggers pour formules'));
  console.log(chalk.white('  5. Timeline réaliste : 8-10 semaines'));
  
  console.log(chalk.white('\n═'.repeat(60)));
  console.log(chalk.green.bold('\n✅ Analyse sauvegardée dans : migration/analysis/notion-complete-analysis.json\n'));
}

// Créer aussi un générateur de mapping
async function generateMappingTemplate(results) {
  const mapping = {
    version: '1.0',
    generated: new Date().toISOString(),
    notion_to_directus: {}
  };
  
  for (const [moduleName, moduleData] of Object.entries(results.modules)) {
    for (const db of moduleData.databases) {
      if (!db.error) {
        mapping.notion_to_directus[db.name] = {
          notion_id: db.id,
          directus_collection: db.name.toLowerCase().replace('db-', '').replace(/-/g, '_'),
          fields: {}
        };
        
        // Mapper chaque champ
        for (const [fieldName, fieldData] of Object.entries(db.properties)) {
          const directusFieldName = fieldName
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '_')
            .replace(/__+/g, '_')
            .replace(/^_|_$/g, '');
          
          mapping.notion_to_directus[db.name].fields[fieldName] = {
            notion_type: fieldData.type,
            directus_field: directusFieldName,
            directus_type: mapNotionTypeToDirectus(fieldData.type),
            config: fieldData
          };
        }
      }
    }
  }
  
  await fs.writeJson('migration/analysis/notion-to-directus-mapping.json', mapping, { spaces: 2 });
  console.log(chalk.blue('📋 Template de mapping g��néré : migration/analysis/notion-to-directus-mapping.json'));
}

function mapNotionTypeToDirectus(notionType) {
  const typeMap = {
    'title': 'string',
    'rich_text': 'text',
    'number': 'decimal',
    'select': 'string',
    'multi_select': 'json',
    'date': 'datetime',
    'people': 'uuid',
    'files': 'json',
    'checkbox': 'boolean',
    'url': 'string',
    'email': 'string',
    'phone_number': 'string',
    'formula': 'string', // ou autre selon le type de résultat
    'relation': 'uuid',
    'rollup': 'string', // dépend de la fonction
    'created_time': 'datetime',
    'created_by': 'uuid',
    'last_edited_time': 'datetime',
    'last_edited_by': 'uuid',
    'button': 'json'
  };
  
  return typeMap[notionType] || 'string';
}

// Exécution principale
async function main() {
  try {
    if (!process.env.NOTION_API_KEY) {
      console.error(chalk.red('❌ NOTION_API_KEY manquante dans .env'));
      process.exit(1);
    }
    
    console.log(chalk.blue.bold('🚀 Démarrage de l\'analyse complète...\n'));
    console.log(chalk.gray(`API Key: ${process.env.NOTION_API_KEY.substring(0, 10)}...`));
    
    const results = await analyzeAllDatabases();
    await generateMappingTemplate(results);
    
    console.log(chalk.green.bold('\n✨ ANALYSE TERMINÉE AVEC SUCCÈS !\n'));
    
  } catch (error) {
    console.error(chalk.red('\n❌ Erreur fatale :'), error);
    process.exit(1);
  }
}

main();
```

### 3. Configuration .env
```bash
# S'assurer que le fichier .env contient :
NOTION_API_KEY=secret_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### 4. Exécuter l'analyse
```bash
node migration/analyze-notion-complete.js
```

## 📊 Résultats attendus

### 1. Fichier JSON détaillé (notion-complete-analysis.json)
```json
{
  "timestamp": "2024-08-02T16:00:00Z",
  "modules": {
    "projets": {
      "databases": [
        {
          "name": "DB-PROJETS CLIENTS",
          "stats": {
            "total": 65,
            "relations": 12,
            "rollups": 18,
            "formulas": 11
          },
          "properties": {
            "Client": {
              "type": "relation",
              "relation": {
                "database_id": "xxx",
                "type": "single"
              }
            },
            // ... toutes les propriétés
          }
        }
      ]
    }
  },
  "summary": {
    "total_databases": 53,
    "total_properties": 2000+,
    "total_relations": 200+,
    "total_rollups": 300+,
    "total_formulas": 150+
  }
}
```

### 2. Template de mapping (notion-to-directus-mapping.json)
```json
{
  "notion_to_directus": {
    "DB-PROJETS CLIENTS": {
      "directus_collection": "projects",
      "fields": {
        "Nom du Projet": {
          "notion_type": "title",
          "directus_field": "name",
          "directus_type": "string"
        }
        // ... mapping de tous les champs
      }
    }
  }
}
```

### 3. Rapport console avec :
- ✅ Statistiques globales
- ✅ Moyennes par base
- ✅ Top 5 bases complexes
- ✅ Analyse de complexité
- ✅ Recommandations

## 🎯 Actions après l'analyse

1. **Réviser l'architecture** selon la complexité réelle
2. **Ajuster le planning** (probablement 8-10 semaines)
3. **Identifier les priorités** de migration
4. **Planifier les transformations** complexes
5. **Préparer les scripts** de migration

## ⚠️ Points d'attention

- L'analyse peut prendre 10-15 minutes
- Certaines bases peuvent avoir des erreurs d'accès
- Les formules Notion sont en syntaxe propriétaire
- Les rollups peuvent être très complexes
- Les relations peuvent être bidirectionnelles

---

**Une fois l'analyse terminée, on aura ENFIN une vision RÉELLE et COMPLÈTE de vos 53 bases !**
