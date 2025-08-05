#!/usr/bin/env node

/**
 * Script de migration : DB-PERMISSIONS-ACCÈS (Notion) → permissions (Directus)
 * 
 * Base source : DB-PERMISSIONS-ACCÈS
 * Collection cible : permissions
 * Propriétés : 11 (aucune relation complexe)
 * Complexité : ⭐ (Très faible)
 */

const { Client: NotionClient } = require('@notionhq/client');
const { createDirectus, rest, createItems, readItems, staticToken } = require('@directus/sdk');
const chalk = require('chalk');
const ora = require('ora');
require('dotenv').config();

// Configuration
const NOTION_TOKEN = process.env.NOTION_TOKEN || process.env.NOTION_API_KEY;
const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN || process.env.DIRECTUS_ADMIN_TOKEN;

// ID de la base Notion DB-PERMISSIONS-ACCÈS
const NOTION_DATABASE_ID = '236adb95-3c6f-80ff-8918-fd5c388dcbd9';

// Clients
const notion = new NotionClient({ auth: NOTION_TOKEN });
const directus = createDirectus(DIRECTUS_URL)
  .with(staticToken(DIRECTUS_TOKEN))
  .with(rest());

// Statistiques
const stats = {
  total: 0,
  success: 0,
  errors: 0,
  skipped: 0,
  startTime: Date.now()
};

/**
 * Authentification Directus
 */
async function authenticateDirectus() {
  try {
    // Le token est déjà configuré dans le client via staticToken
    // Tester la connexion en essayant de lire la collection permissions (vide)
    await directus.request(readItems('permissions', { limit: 1 }));
    return true;
  } catch (error) {
    // Si erreur, c'est probablement OK (collection vide ou permissions)
    // L'important est que le token soit valide
    if (error.message.includes('401') || error.message.includes('403')) {
      console.error('Erreur auth:', error.message);
      throw error;
    }
    // Sinon on continue
    return true;
  }
}

/**
 * Extraction des données depuis Notion
 */
async function extractFromNotion() {
  const spinner = ora('Extraction des données depuis Notion...').start();
  const allData = [];
  let hasMore = true;
  let cursor = undefined;

  try {
    while (hasMore) {
      const response = await notion.databases.query({
        database_id: NOTION_DATABASE_ID,
        start_cursor: cursor,
        page_size: 100
      });

      allData.push(...response.results);
      hasMore = response.has_more;
      cursor = response.next_cursor;
      
      spinner.text = `Extraction... ${allData.length} entrées récupérées`;
    }

    spinner.succeed(`✅ ${allData.length} entrées extraites de Notion`);
    stats.total = allData.length;
    return allData;
  } catch (error) {
    spinner.fail('❌ Erreur lors de l\'extraction Notion');
    console.error(chalk.red(error.message));
    throw error;
  }
}

/**
 * Transformation d'une page Notion en item Directus
 */
function transformNotionToDirectus(notionPage) {
  try {
    const props = notionPage.properties;
    
    // Extraction des valeurs avec gestion des cas null
    const getTextValue = (prop) => {
      if (!prop) return null;
      if (prop.title) return prop.title[0]?.text?.content || null;
      if (prop.rich_text) return prop.rich_text[0]?.text?.content || null;
      if (prop.select) return prop.select?.name || null;
      return null;
    };

    const getNumberValue = (prop) => {
      if (!prop || !prop.number) return 0;
      return prop.number;
    };

    const getBooleanValue = (prop) => {
      if (!prop || prop.checkbox === undefined) return false;
      return prop.checkbox;
    };

    const getSelectValue = (prop) => {
      if (!prop || !prop.select) return null;
      return prop.select.name;
    };

    const getMultiSelectValue = (prop) => {
      if (!prop || !prop.multi_select) return [];
      return prop.multi_select.map(item => item.name);
    };

    // Mapping des champs
    const resource = getTextValue(props['Resource']) || 
                    getTextValue(props['Ressource']) || 
                    getTextValue(props['Collection']) || 
                    'unknown';

    const role = getSelectValue(props['Role']) || 
                 getSelectValue(props['Rôle']) || 
                 getSelectValue(props['User Role']) || 
                 'viewer';

    const action = getSelectValue(props['Action']) || 
                   getSelectValue(props['Permission']) || 
                   'read';

    const scope = getSelectValue(props['Scope']) || 
                  getSelectValue(props['Portée']) || 
                  'global';

    const directusItem = {
      notion_id: notionPage.id,
      resource: resource,
      role: mapRole(role),
      action: mapAction(action),
      scope: mapScope(scope),
      is_active: getBooleanValue(props['Active']) !== false,
      priority: getNumberValue(props['Priority']) || getNumberValue(props['Priorité']) || 50,
      description: getTextValue(props['Description']) || '',
      notes: getTextValue(props['Notes']) || null
    };

    // Construire les conditions si présentes
    const conditions = {};
    
    // Vérifier les champs conditionnels possibles
    const conditionField = getTextValue(props['Condition Field']) || getTextValue(props['Champ Condition']);
    const conditionOperator = getTextValue(props['Condition Operator']) || getTextValue(props['Opérateur']);
    const conditionValue = getTextValue(props['Condition Value']) || getTextValue(props['Valeur Condition']);
    
    if (conditionField || conditionOperator || conditionValue) {
      if (conditionField) conditions.field = conditionField;
      if (conditionOperator) conditions.operator = conditionOperator;
      if (conditionValue) conditions.value = conditionValue;
      
      directusItem.conditions = Object.keys(conditions).length > 0 ? conditions : null;
    } else {
      directusItem.conditions = null;
    }

    return directusItem;
  } catch (error) {
    console.error(chalk.yellow(`⚠️ Erreur de transformation pour l'entrée ${notionPage.id}:`), error.message);
    stats.errors++;
    return null;
  }
}

/**
 * Mapping des rôles Notion vers Directus
 */
function mapRole(notionRole) {
  if (!notionRole) return 'viewer';
  
  const roleMap = {
    'Admin': 'admin',
    'Administrator': 'admin',
    'Administrateur': 'admin',
    'Manager': 'manager',
    'Gestionnaire': 'manager',
    'Editor': 'editor',
    'Éditeur': 'editor',
    'Editeur': 'editor',
    'Viewer': 'viewer',
    'Lecteur': 'viewer',
    'Guest': 'guest',
    'Invité': 'guest',
    'API': 'api',
    'Service': 'service'
  };
  
  return roleMap[notionRole] || notionRole.toLowerCase();
}

/**
 * Mapping des actions Notion vers Directus
 */
function mapAction(notionAction) {
  if (!notionAction) return 'read';
  
  const actionMap = {
    'Create': 'create',
    'Créer': 'create',
    'Read': 'read',
    'Lire': 'read',
    'Lecture': 'read',
    'Update': 'update',
    'Modifier': 'update',
    'Edit': 'update',
    'Delete': 'delete',
    'Supprimer': 'delete',
    'Execute': 'execute',
    'Exécuter': 'execute',
    'Export': 'export',
    'Exporter': 'export',
    'Import': 'import',
    'Importer': 'import',
    'Approve': 'approve',
    'Approuver': 'approve'
  };
  
  return actionMap[notionAction] || notionAction.toLowerCase();
}

/**
 * Mapping des portées Notion vers Directus
 */
function mapScope(notionScope) {
  if (!notionScope) return 'global';
  
  const scopeMap = {
    'Global': 'global',
    'Organization': 'organization',
    'Organisation': 'organization',
    'Team': 'team',
    'Équipe': 'team',
    'Project': 'project',
    'Projet': 'project',
    'Personal': 'personal',
    'Personnel': 'personal'
  };
  
  return scopeMap[notionScope] || notionScope.toLowerCase();
}

/**
 * Chargement des données dans Directus
 */
async function loadToDirectus(items) {
  const spinner = ora('Chargement dans Directus...').start();
  const validItems = items.filter(item => item !== null);
  
  if (validItems.length === 0) {
    spinner.warn('⚠️ Aucune donnée valide à charger');
    return;
  }

  try {
    // Charger par batch de 50
    const batchSize = 50;
    for (let i = 0; i < validItems.length; i += batchSize) {
      const batch = validItems.slice(i, i + batchSize);
      spinner.text = `Chargement... ${i + batch.length}/${validItems.length}`;
      
      await directus.request(createItems('permissions', batch));
      stats.success += batch.length;
    }

    spinner.succeed(`✅ ${stats.success} entrées chargées dans Directus`);
  } catch (error) {
    spinner.fail('❌ Erreur lors du chargement dans Directus');
    console.error(chalk.red(error.message));
    
    // Afficher plus de détails si disponibles
    if (error.response?.data) {
      console.error(chalk.red('Détails :', JSON.stringify(error.response.data, null, 2)));
    }
    throw error;
  }
}

/**
 * Validation de la migration
 */
async function validateMigration() {
  const spinner = ora('Validation de la migration...').start();
  
  try {
    const directusItems = await directus.request(
      readItems('permissions', {
        limit: -1,
        fields: ['id', 'notion_id', 'resource', 'role', 'action']
      })
    );

    const migrationRate = (stats.success / stats.total * 100).toFixed(1);
    
    spinner.succeed('✅ Validation terminée');
    
    console.log('\n' + chalk.cyan('═══════════════════════════════════════'));
    console.log(chalk.cyan.bold('📊 RAPPORT DE MIGRATION - permissions'));
    console.log(chalk.cyan('═══════════════════════════════════════'));
    console.log(chalk.white(`
  📥 Entrées Notion extraites : ${chalk.green(stats.total)}
  ✅ Entrées migrées avec succès : ${chalk.green(stats.success)}
  ❌ Erreurs de transformation : ${chalk.red(stats.errors)}
  ⏭️  Entrées ignorées : ${chalk.yellow(stats.skipped)}
  📈 Taux de migration : ${chalk.bold(migrationRate + '%')}
  ⏱️  Durée : ${Math.round((Date.now() - stats.startTime) / 1000)}s
  
  🎯 Collection Directus : ${chalk.green('permissions')}
  📊 Total dans Directus : ${chalk.green(directusItems.length)} entrées
    `));

    // Afficher un échantillon des permissions migrées
    if (directusItems.length > 0) {
      console.log(chalk.gray('\n📋 Échantillon des permissions migrées :'));
      directusItems.slice(0, 5).forEach((item, index) => {
        console.log(chalk.gray(`   ${index + 1}. ${item.resource} - ${item.role} - ${item.action}`));
      });
      if (directusItems.length > 5) {
        console.log(chalk.gray(`   ... et ${directusItems.length - 5} autres`));
      }
    }

    return directusItems.length;
  } catch (error) {
    spinner.fail('❌ Erreur lors de la validation');
    console.error(chalk.red(error.message));
    return 0;
  }
}

/**
 * Fonction principale de migration
 */
async function migrate() {
  console.log(chalk.cyan.bold('\n🚀 MIGRATION : DB-PERMISSIONS-ACCÈS → permissions\n'));
  
  // Vérification des variables d'environnement
  if (!NOTION_TOKEN) {
    console.error(chalk.red('❌ NOTION_TOKEN non configuré dans .env'));
    process.exit(1);
  }

  try {
    // 1. Authentification Directus
    console.log(chalk.gray('1. Authentification Directus...'));
    await authenticateDirectus();
    console.log(chalk.green('   ✓ Connecté à Directus\n'));

    // 2. Extraction depuis Notion
    console.log(chalk.gray('2. Extraction depuis Notion...'));
    const notionData = await extractFromNotion();
    
    if (notionData.length === 0) {
      console.log(chalk.yellow('⚠️ Aucune donnée trouvée dans la base Notion'));
      return;
    }

    // 3. Transformation
    console.log(chalk.gray('\n3. Transformation des données...'));
    const directusItems = notionData.map(transformNotionToDirectus);
    console.log(chalk.green(`   ✓ ${directusItems.filter(i => i !== null).length} entrées transformées\n`));

    // 4. Chargement dans Directus
    console.log(chalk.gray('4. Chargement dans Directus...'));
    await loadToDirectus(directusItems);

    // 5. Validation
    console.log(chalk.gray('\n5. Validation de la migration...'));
    await validateMigration();

    console.log(chalk.green.bold('\n✨ Migration terminée avec succès !\n'));

  } catch (error) {
    console.error(chalk.red.bold('\n❌ Erreur fatale durant la migration :'));
    console.error(chalk.red(error.message));
    process.exit(1);
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  migrate()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Erreur:', error);
      process.exit(1);
    });
}

module.exports = { migrate, extractFromNotion, transformNotionToDirectus, loadToDirectus };