# 📅 PLAN DE MIGRATION DÉTAILLÉ : Notion → Directus

**Date de début**: 2025-08-05  
**Durée estimée**: 5 semaines  
**Version**: 1.0

## 🎯 OBJECTIFS

1. Migrer 62 bases Notion vers 48 collections Directus
2. Préserver 100% des données et relations
3. Maintenir le dashboard existant fonctionnel
4. Améliorer les performances de -80%
5. Automatiser les processus métier

## 📊 PHASES DE MIGRATION

### 🚀 PHASE 0 : PRÉPARATION (3-5 août 2025)

#### Infrastructure
- [x] Setup Directus avec Docker
- [x] Configuration base de données PostgreSQL
- [x] Installation MCPs (GitHub, Directus, Notion)
- [ ] Configuration environnements (dev/staging/prod)
- [ ] Setup monitoring et logs

#### Documentation
- [x] Audit complet de migration
- [x] Mapping 62→48 collections
- [ ] Scripts de migration template
- [ ] Guide de test et validation
- [ ] Procédures de rollback

#### Outils
```bash
# Scripts à créer
migration/
├── scripts/
│   ├── 01-extract-notion.js      # Extraction données Notion
│   ├── 02-transform-data.js      # Transformation format
│   ├── 03-load-directus.js       # Chargement Directus
│   ├── 04-validate-migration.js  # Validation intégrité
│   └── 05-create-relations.js    # Création relations
├── templates/
│   ├── collection-schema.json    # Template schéma
│   ├── migration-script.js       # Template script
│   └── test-suite.js            # Template tests
└── utils/
    ├── notion-client.js         # Client Notion
    ├── directus-client.js       # Client Directus
    └── data-mapper.js           # Mapping types
```

### 📦 PHASE 1 : BASES SIMPLES (5-9 août 2025)

**Cible**: 15 bases <20 propriétés sans relations complexes

#### Semaine 1 - Collections à migrer
1. **Lundi 5/08**
   - [ ] `time_tracking` ← DB-TIME-TRACKING (12 props)
   - [ ] `permissions` ← DB-PERMISSIONS-ACCÈS (11 props)
   - [ ] `content_calendar` ← DB-CONTENT-CALENDAR (11 props)

2. **Mardi 6/08**
   - [ ] `compliance` ← DB-COMPLIANCE (11 props)
   - [ ] `talents` ← DB-TALENTS (11 props)
   - [ ] `interactions` ← DB-INTERACTIONS CLIENTS (10 props)

3. **Mercredi 7/08**
   - [ ] `budgets` ← DB-BUDGET-PLANNING (12 props)
   - [ ] `subscriptions` ← DB-SUIVI D'ABONNEMENTS (14 props)
   - [ ] `alerts` ← DB-ALERTS-CENTER (14 props)

4. **Jeudi 8/08**
   - [ ] `templates` ← DB-TEMPLATE-MANAGER (15 props)
   - [ ] `products` ← DB-PRODUITS-HYPERVISUAL (16 props)
   - [ ] `resources` (partiel) ← DB-ÉQUIPE-RESSOURCES (17 props)

5. **Vendredi 9/08**
   - [ ] Tests d'intégration Phase 1
   - [ ] Validation données migrées
   - [ ] Documentation des problèmes

#### Scripts Phase 1
```javascript
// Exemple migration time_tracking
npm run migrate:simple time_tracking DB-TIME-TRACKING
npm run validate:collection time_tracking
npm run test:endpoints time_tracking
```

### 🏗️ PHASE 2 : BASES MOYENNES (12-16 août 2025)

**Cible**: 20 bases 20-30 propriétés avec relations simples

#### Semaine 2 - Module Finance + CRM basique
1. **Lundi 12/08**
   - [ ] `expenses` ← DB-NOTES-FRAIS (21 props)
   - [ ] `transactions` ← DB-TRANSACTIONS-BANCAIRES (21 props)
   - [ ] `accounting_entries` ← DB-ECRITURES-COMPTABLES (22 props)

2. **Mardi 13/08**
   - [ ] `invoices` (clients) ← DB-FACTURES-CLIENTS (32 props)
   - [ ] `invoices` (fournisseurs) ← DB-FACTURES-FOURNISSEURS (23 props)
   - [ ] Test module Finance complet

3. **Mercredi 14/08**
   - [ ] `campaigns` ← DB-CAMPAIGNS (25 props)
   - [ ] `events` ← DB-EVENTS (23 props)
   - [ ] `vat_declarations` ← DB-TVA-DECLARATIONS (24 props)

4. **Jeudi 15/08**
   - [ ] `reports` ← DB-REPORTS (24 props)
   - [ ] `insights` ← DB-PREDICTIVE-INSIGHTS (24 props)
   - [ ] `revenue_attribution` ← DB-REVENUE-ATTRIBUTION (25 props)

5. **Vendredi 16/08**
   - [ ] Migration relations Module Finance
   - [ ] Tests cross-modules
   - [ ] Optimisation performances

### 🔧 PHASE 3 : BASES COMPLEXES (19-23 août 2025)

**Cible**: 15 bases 30-50 propriétés avec relations complexes

#### Semaine 3 - CRM complet + Projets
1. **Lundi 19/08**
   - [ ] `people` ← DB-CONTACTS-PERSONNES (41 props, 7 relations)
   - [ ] `companies` ← DB-CONTACTS-ENTREPRISES (30 props) + zones
   - [ ] Relations CRM

2. **Mardi 20/08**
   - [ ] `tasks` ← DB-TACHES (37 props) + validation
   - [ ] `documents` ← DB-DOCUMENTS (29 props, 7 relations)
   - [ ] Rollups et formules

3. **Mercredi 21/08**
   - [ ] `deliverables` ← DB-MISSIONS-PRESTATAIRE (50 props)
   - [ ] `commissions` ← DB-COMMISSIONS-REVENDEUR (41 props)
   - [ ] `rewards` ← DB-REWARDS-TRACKING (32 props)

4. **Jeudi 22/08**
   - [ ] `entities` ← DB-ENTITÉ DU GROUPE (42 props, 10 rollups)
   - [ ] `analytics` ← DB-PERFORMANCE-HISTORIQUE (44 props)
   - [ ] Vues SQL complexes

5. **Vendredi 23/08**
   - [ ] `projects` ← DB-PROJETS CLIENTS (56 props, 15 relations) ⚠️
   - [ ] Tests module Projets
   - [ ] Validation intégrité

### ⚙️ PHASE 4 : BASES SYSTÈME (26-30 août 2025)

**Cible**: Bases critiques système + automatisations

#### Semaine 4 - Infrastructure critique
1. **Lundi 26/08**
   - [ ] `workflows` ← DB-WORKFLOW-AUTOMATION (41 props) ⚠️
   - [ ] Configuration Directus Flows
   - [ ] Tests automatisations

2. **Mardi 27/08**
   - [ ] `integrations` ← DB-INTEGRATION-API (57 props) ⚠️
   - [ ] Webhooks migration
   - [ ] Tests API externes

3. **Mercredi 28/08**
   - [ ] `system_logs` ← DB-SYSTEM-LOGS (73 props) ⚠️
   - [ ] Logs aggregation
   - [ ] Monitoring setup

4. **Jeudi 29/08**
   - [ ] Dashboard adaptation finale
   - [ ] Tests 156 endpoints
   - [ ] Validation OCR

5. **Vendredi 30/08**
   - [ ] Tests de charge
   - [ ] Optimisation finale
   - [ ] Documentation complète

### 🚀 PHASE 5 : LANCEMENT (2-6 septembre 2025)

#### Semaine 5 - Go Live
1. **Lundi 2/09**
   - [ ] Migration production data
   - [ ] Switch DNS/routing
   - [ ] Monitoring intensif

2. **Mardi-Vendredi**
   - [ ] Support hypercare
   - [ ] Corrections bugs
   - [ ] Formation utilisateurs

## 📝 SCRIPTS DE MIGRATION

### Structure type d'un script
```javascript
// migration/scripts/migrate-[collection].js
const { extractFromNotion, transformData, loadToDirectus } = require('./utils');

async function migrate() {
  // 1. Extract
  const notionData = await extractFromNotion('DB-XXX');
  
  // 2. Transform
  const directusData = transformData(notionData, mappingRules);
  
  // 3. Load
  await loadToDirectus('collection_name', directusData);
  
  // 4. Validate
  await validateMigration('collection_name', notionData);
}
```

### Commandes NPM
```json
{
  "scripts": {
    "migrate:simple": "node migration/scripts/migrate-simple.js",
    "migrate:complex": "node migration/scripts/migrate-complex.js",
    "migrate:relations": "node migration/scripts/create-relations.js",
    "validate:collection": "node migration/scripts/validate-collection.js",
    "rollback:collection": "node migration/scripts/rollback-collection.js",
    "migrate:all": "node migration/scripts/migrate-all.js",
    "report:status": "node migration/scripts/migration-status.js"
  }
}
```

## 🔍 TESTS & VALIDATION

### Par collection
1. **Compte des enregistrements**
   - Notion count = Directus count
   
2. **Intégrité des données**
   - Tous les champs mappés
   - Formats corrects
   - Relations valides

3. **Performance**
   - Query time <100ms
   - Bulk operations OK

### Par module
1. **Tests fonctionnels**
   - Workflows métier
   - Calculs et formules
   - Permissions

2. **Tests integration**
   - Cross-modules
   - Dashboard endpoints
   - OCR functionality

## 📊 MÉTRIQUES DE SUCCÈS

### KPIs Migration
- [ ] 100% des données migrées
- [ ] 0 perte de données
- [ ] <100ms temps de réponse
- [ ] 156/156 endpoints fonctionnels
- [ ] OCR 100% opérationnel

### Checkpoints
- **Phase 1**: 15/62 bases (24%)
- **Phase 2**: 35/62 bases (56%)
- **Phase 3**: 50/62 bases (81%)
- **Phase 4**: 62/62 bases (100%)

## ⚠️ PLAN DE ROLLBACK

### Par collection
```bash
# Rollback une collection
npm run rollback:collection [collection_name]

# Restore depuis backup
npm run restore:notion [database_id]
```

### Global
1. Backups Notion quotidiens
2. Snapshots PostgreSQL
3. Version tags Git
4. DNS switch ready

## 📞 SUPPORT & ESCALATION

### Équipe Migration
- **Lead**: Claude Desktop
- **Dev**: Claude Code
- **Support**: 24/7 durant Phase 5

### Escalation
1. Bug bloquant → Fix immédiat
2. Performance → Optimisation J+1
3. Données manquantes → Investigation prioritaire

---

*Plan de migration officiel - À suivre rigoureusement*  
*Mise à jour quotidienne du statut dans migration/STATUS.md*
