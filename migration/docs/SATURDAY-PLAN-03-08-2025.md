# 📋 PLAN SAMEDI - Suite des Migrations

## ✅ Travail Accompli

### Collections Migrées avec Succès (5/12)
1. **time_tracking** ✅ - 3 items
2. **permissions** ✅ - 3 items
3. **content_calendar** ✅ - 3 items
4. **compliance** ✅ - 3 items
5. **talents** ✅ - 3 items (après fix)

### Scripts et Schémas Créés
- ✅ 3 schémas JSON créés (interactions, budgets, subscriptions)
- ✅ Scripts de migration prêts à être développés
- ✅ IDs Notion identifiés et vérifiés

## 📊 Prochaines Collections à Migrer (3)

### 1. INTERACTIONS (DB-INTERACTIONS CLIENTS)
- **Notion ID** : `226adb95-3c6f-805f-9095-d4c6278a5f5b`
- **Propriétés** : 10
- **Relation** : client_id → companies
- **Schéma** : ✅ Créé (`migration/schemas/interactions.json`)

### 2. BUDGETS (DB-BUDGET-PLANNING)
- **Notion ID** : `22eadb95-3c6f-809e-b4d8-f937b3bc8bd9`
- **Propriétés** : 12
- **Calculs** : remaining_amount = amount - spent_amount
- **Schéma** : ✅ Créé (`migration/schemas/budgets.json`)

### 3. SUBSCRIPTIONS (DB-SUIVI D'ABONNEMENTS)
- **Notion ID** : `231adb95-3c6f-80ba-9608-c9e5fdd4baf9`
- **Propriétés** : 14
- **Calculs** : annual_cost basé sur billing_cycle
- **Alertes** : Status 'expiring' si < 30 jours
- **Schéma** : ✅ Créé (`migration/schemas/subscriptions.json`)

## 🚀 Commandes pour Continuer

### Créer les Scripts de Migration

Les schémas sont prêts. Il faut maintenant créer les scripts JavaScript pour :

1. **migrate-interactions.js**
   - Créer la collection avec le schéma
   - Extraire de Notion (ID: 226adb95-3c6f-805f-9095-d4c6278a5f5b)
   - Mapper les relations client
   - Charger dans Directus

2. **migrate-budgets.js**
   - Créer la collection avec le schéma
   - Extraire de Notion (ID: 22eadb95-3c6f-809e-b4d8-f937b3bc8bd9)
   - Calculer remaining_amount
   - Valider les montants

3. **migrate-subscriptions.js**
   - Créer la collection avec le schéma
   - Extraire de Notion (ID: 231adb95-3c6f-80ba-9608-c9e5fdd4baf9)
   - Calculer annual_cost
   - Détecter les renouvellements proches

### Tester les Migrations

```bash
# Créer et tester individuellement
npm run migrate:interactions
npm run migrate:budgets
npm run migrate:subscriptions

# Ou utiliser le batch
npm run migrate:batch-saturday
```

## 📝 Structure des Scripts à Créer

Chaque script doit suivre le pattern établi :

```javascript
// migration/scripts/migrate-[collection].js
const { Client: NotionClient } = require('@notionhq/client');
const axios = require('axios');
const chalk = require('chalk');
const ora = require('ora');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

// Configuration
const NOTION_DATABASE_ID = '[ID_FROM_ABOVE]';

class [Collection]Migration {
  constructor() {
    this.stats = { total: 0, migrated: 0, failed: 0 };
    this.errors = [];
    this.logFile = path.join(process.cwd(), 'migration/logs/[collection].log');
  }

  async createCollection() { /* Créer avec schéma */ }
  async extractFromNotion() { /* Extraire données */ }
  transformItem(notionItem) { /* Transformer format */ }
  async loadToDirectus(items) { /* Charger dans Directus */ }
  async validate() { /* Valider migration */ }
  async generateReport() { /* Générer rapport */ }
  async run() { /* Orchestrer tout */ }
}

// Exécution
if (require.main === module) {
  const migration = new [Collection]Migration();
  migration.run().catch(console.error);
}

module.exports = [Collection]Migration;
```

## 📊 Objectifs de Fin de Journée

### Si tout est complété :
- **8/12 collections Phase 1** (66.7%)
- **8/62 bases totales** (12.9%)
- **~24 items migrés** (estimation)

### Métriques à Capturer
- Temps par migration
- Nombre d'erreurs
- Taille des données
- Performance des requêtes

## 🎯 Points d'Attention

### Interactions
- ⚠️ Vérifier que la collection `companies` existe
- ⚠️ Mapper correctement les relations client

### Budgets
- ⚠️ Valider que spent_amount ≤ amount
- ⚠️ Arrondir à 2 décimales pour les montants
- ⚠️ Gérer les multi-select pour departments

### Subscriptions
- ⚠️ Calculer annual_cost selon billing_cycle
- ⚠️ Détecter renewals < 30 jours → status 'expiring'
- ⚠️ Valider les URLs

## 📝 Package.json à Mettre à Jour

```json
{
  "scripts": {
    // Ajouter :
    "migrate:interactions": "node migration/scripts/migrate-interactions.js",
    "migrate:budgets": "node migration/scripts/migrate-budgets.js",
    "migrate:subscriptions": "node migration/scripts/migrate-subscriptions.js",
    "migrate:batch-saturday": "node migration/scripts/batch-saturday-migrations.js"
  }
}
```

## ✅ Checklist Finale

- [x] Schémas JSON créés pour les 3 collections
- [x] IDs Notion vérifiés et documentés
- [ ] Scripts de migration à développer
- [ ] Tests individuels à exécuter
- [ ] Validation des données
- [ ] Mise à jour STATUS.md
- [ ] Commit et push

## 🎉 Progression Actuelle

- **Phase 1** : 5/12 complétées (41.7%)
- **Global** : 5/62 bases (8.1%)
- **Statut** : En avance sur le planning

---
*Plan créé le 03/08/2025 à 06:10 UTC*  
*3 nouvelles collections prêtes pour migration*