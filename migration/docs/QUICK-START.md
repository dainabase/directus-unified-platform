# 🚀 GUIDE DE DÉMARRAGE RAPIDE

**Pour commencer la migration Notion → Directus immédiatement**

## 📋 Checklist pré-migration

### ✅ Vérifications initiales
- [ ] Docker est lancé (`docker ps`)
- [ ] Directus accessible sur http://localhost:8055
- [ ] MCPs connectés (GitHub, Directus, Notion)
- [ ] Backup Notion effectué
- [ ] Dashboard local accessible

### 📁 Fichiers à vérifier
- [ ] `.env` configuré avec les bonnes valeurs
- [ ] `notion-databases-analysis.json` présent
- [ ] Documentation lue (au moins ce guide!)

## 🎯 Étape 1 : Première migration test

### Collection la plus simple : `time_tracking`
- **Base Notion** : DB-TIME-TRACKING
- **Propriétés** : 12 (aucune relation)
- **Complexité** : ⭐ (idéale pour commencer)

### Commandes à exécuter
```bash
# 1. Créer le schéma dans Directus
cd directus-unified-platform
npm run schema:create time_tracking

# 2. Extraire les données de Notion
npm run extract:notion DB-TIME-TRACKING

# 3. Transformer et charger dans Directus
npm run migrate:collection time_tracking

# 4. Valider la migration
npm run validate:collection time_tracking
```

## 📝 Étape 2 : Structure des scripts

### Script de migration type
Créer `migration/scripts/migrate-time-tracking.js` :

```javascript
const { Client: NotionClient } = require('@notionhq/client');
const { createDirectus, rest, createItems } = require('@directus/sdk');

// Configuration
const notion = new NotionClient({ auth: process.env.NOTION_TOKEN });
const directus = createDirectus(process.env.DIRECTUS_URL).with(rest());

async function migrate() {
  console.log('🚀 Début migration: time_tracking');
  
  // 1. Extraire de Notion
  const notionData = await notion.databases.query({
    database_id: 'DB-TIME-TRACKING-ID-HERE'
  });
  
  // 2. Transformer les données
  const items = notionData.results.map(page => ({
    // Mapping des champs
    project_id: page.properties.Project?.relation[0]?.id,
    user_id: page.properties.User?.people[0]?.id,
    hours: page.properties.Hours?.number,
    date: page.properties.Date?.date?.start,
    description: page.properties.Description?.rich_text[0]?.text?.content,
    billable: page.properties.Billable?.checkbox,
    status: page.properties.Status?.select?.name
  }));
  
  // 3. Charger dans Directus
  await directus.request(createItems('time_tracking', items));
  
  console.log(`✅ Migration terminée: ${items.length} entrées`);
}

migrate().catch(console.error);
```

## 🔄 Étape 3 : Workflow quotidien

### Matin (9h-12h) : Migration données
1. Choisir la collection du jour selon le [PLAN-MIGRATION.md](PLAN-MIGRATION.md)
2. Créer le schéma dans Directus
3. Écrire et tester le script de migration
4. Exécuter la migration
5. Valider les données

### Après-midi (14h-17h) : Adaptation dashboard
1. Identifier les endpoints concernés
2. Créer/adapter le data provider
3. Tester les fonctionnalités
4. Documenter les changements

### Soir (17h-18h) : Documentation
1. Mettre à jour [STATUS.md](STATUS.md)
2. Noter les problèmes rencontrés
3. Préparer le lendemain

## 🛠️ Outils et commandes NPM

### Scripts à ajouter dans package.json
```json
{
  "scripts": {
    // Schémas
    "schema:create": "node scripts/create-schema.js",
    "schema:export": "node scripts/export-schema.js",
    
    // Migration
    "extract:notion": "node scripts/extract-notion.js",
    "migrate:collection": "node scripts/migrate-collection.js",
    "migrate:relations": "node scripts/create-relations.js",
    
    // Validation
    "validate:collection": "node scripts/validate-collection.js",
    "validate:relations": "node scripts/validate-relations.js",
    "test:endpoints": "node scripts/test-endpoints.js",
    
    // Dashboard
    "dashboard:import": "node scripts/import-dashboard.js",
    "dashboard:adapt": "node scripts/adapt-endpoints.js",
    "dashboard:test": "jest dashboard/tests",
    
    // Utils
    "report:status": "node scripts/report-status.js",
    "rollback:collection": "node scripts/rollback.js",
    "backup:directus": "node scripts/backup-directus.js"
  }
}
```

## 🔍 Debugging et troubleshooting

### Problèmes fréquents

#### 1. Erreur de connexion Notion
```bash
# Vérifier le token
echo $NOTION_TOKEN

# Tester la connexion
curl -H "Authorization: Bearer $NOTION_TOKEN" \
     -H "Notion-Version: 2022-06-28" \
     https://api.notion.com/v1/users/me
```

#### 2. Erreur Directus permissions
```bash
# Vérifier les permissions de la collection
npm run directus:permissions time_tracking

# Régénérer le token admin si besoin
npm run directus:token:refresh
```

#### 3. Mapping de types incorrect
```javascript
// Types Notion → Directus
const typeMapping = {
  'title': 'string',
  'rich_text': 'text',
  'number': 'float',
  'select': 'string',
  'multi_select': 'json',
  'date': 'datetime',
  'people': 'uuid',
  'files': 'file',
  'checkbox': 'boolean',
  'url': 'string',
  'email': 'string',
  'phone_number': 'string',
  'formula': 'string', // À calculer côté Directus
  'relation': 'uuid',
  'rollup': null // À recréer en vue SQL
};
```

## 📊 Monitoring de la migration

### Métriques à suivre
```javascript
// tracker.js
const metrics = {
  collectionsCompleted: 0,
  totalRecordsMigrated: 0,
  errorsCount: 0,
  averageMigrationTime: 0,
  relationsCreated: 0,
  endpointsAdapted: 0
};

// Après chaque migration
updateMetrics(collectionName, {
  records: recordCount,
  duration: endTime - startTime,
  errors: errors.length
});
```

### Dashboard de suivi
Ouvrir http://localhost:8055/admin/insights pour voir :
- Collections migrées
- Volume de données
- Performance des requêtes
- Statut des relations

## 🚨 En cas de problème

### Rollback d'urgence
```bash
# 1. Arrêter la migration en cours
Ctrl+C

# 2. Rollback de la collection
npm run rollback:collection time_tracking

# 3. Restaurer depuis backup
npm run restore:backup --date=2025-08-03

# 4. Analyser les logs
npm run logs:analyze --collection=time_tracking
```

### Contacts support
- **Problème Notion** : Vérifier API status
- **Problème Directus** : Logs Docker
- **Problème Dashboard** : Console browser

## ✅ Critères de succès par collection

### Pour valider une migration
1. **Compte** : Nombre d'enregistrements identique
2. **Données** : Tous les champs présents et corrects
3. **Relations** : Liens fonctionnels
4. **Performance** : Requêtes <100ms
5. **Dashboard** : Endpoints adaptés et testés

### Commande de validation complète
```bash
npm run validate:all --collection=time_tracking
```

## 🎉 Prochaines étapes

Une fois `time_tracking` migré avec succès :
1. Passer à `permissions` (11 props)
2. Puis `content_calendar` (11 props)
3. Suivre le [PLAN-MIGRATION.md](PLAN-MIGRATION.md)

**Rappel** : Toujours mettre à jour [STATUS.md](STATUS.md) après chaque migration !

---

*Guide de démarrage rapide v1.0*  
*Dernière mise à jour : 2025-08-03*
