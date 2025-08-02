# 🚀 Projet Migration Notion → Directus

## Vue d'ensemble
Migration intelligente de **62 bases Notion** vers **48 collections Directus** avec dashboard multi-espaces existant.

## 🏗️ Architecture

### Approche hybride
- **API directe** : Migration et opérations complexes via SDK Directus
- **MCP** : Standardisation et réutilisabilité pour opérations futures

### Structure du projet
```
directus-unified-platform/
├── migration/          # Scripts migration Notion → Directus
├── dashboard/          # Dashboard 4 portails (OCR fonctionnel)
├── directus/           # Config et schémas Directus
└── docker-compose.yml  # Stack complète avec PostgreSQL + Redis
```

## 🔧 Configuration

### URLs et accès
- **Directus** : http://localhost:8055
- **Adminer** : http://localhost:8080 (Interface PostgreSQL)
- **Redis Commander** : http://localhost:8081
- **Dashboard** : http://localhost:3000

### Variables d'environnement critiques
```bash
DIRECTUS_URL=http://localhost:8055
DIRECTUS_TOKEN=your-static-token
NOTION_API_KEY=secret_xxxxx
```

## 📋 Commandes personnalisées

### `/migrate-module [nom]`
Migre un module spécifique de Notion vers Directus.
Modules disponibles : crm_contacts, invoices, projects, etc.

### `/migration-status`
Affiche l'état actuel de la migration avec statistiques détaillées.

### `/validate-migration [collection]`
Vérifie l'intégrité des données migrées pour une collection.

### `/adapt-dashboard [module]`
Adapte le dashboard existant pour utiliser Directus au lieu de Notion.

## 🔄 Workflow de migration

### Phase 1 : Préparation
1. Lancer Docker : `docker compose up -d`
2. Vérifier connexions : `npm run migrate:test-connections`
3. Analyser bases Notion : `npm run migrate:analyze`

### Phase 2 : Migration progressive
```javascript
// Module par module
npm run migrate:execute -- --module=crm_contacts
npm run migrate:execute -- --module=invoices
npm run migrate:execute -- --module=projects
```

### Phase 3 : Validation
1. Vérifier dans Directus : http://localhost:8055
2. Tester endpoints API : `npm run test:migration`
3. Adapter dashboard : Remplacer appels Notion par DataAdapter

## 📊 Mapping des collections

### CRM & Contacts (5→4)
- `companies` : Fusion entreprises + contacts entreprises
- `people` : Contacts personnes
- `providers` : Unification 5 bases prestataires
- `customer_success` : Satisfaction client

### Finance (9→6)
- `invoices` : Fusion factures clients/fournisseurs
- `expenses` : Notes de frais
- `subscriptions` : Abonnements
- `bank_transactions` : Transactions + comptes
- `accounting_entries` : Consolidation comptable

### Projets (3→3)
- `projects` : Projets principaux
- `deliverables` : Livrables et tâches
- `support_tickets` : Support client

## 🛠️ Outils disponibles

### MigrationOrchestrator
Classe principale gérant la migration avec :
- Extraction depuis Notion
- Transformation des données
- Import par lots dans Directus
- Validation automatique
- Rapport détaillé

### DataAdapter
Couche d'abstraction permettant :
- Support hybride Notion/Directus
- Migration progressive sans casser l'existant
- API unifiée pour le dashboard

## ⚠️ Points d'attention

### Ne jamais modifier
- OCR SuperAdmin (100% fonctionnel)
- Structure Tabler.io
- Authentification JWT existante

### Optimisations appliquées
- Pool PostgreSQL : 10-50 connexions
- Batch size : 50 items (optimal)
- Cache Redis : 1h TTL
- Rate limiting : 200 req/min

## 📈 Monitoring

### Dashboard de suivi
```javascript
// Accessible dans Directus Insights
{
  "Collections migrées": count(migration_logs),
  "Vitesse migration": time_series(migration_logs),
  "Erreurs récentes": list(migration_errors)
}
```

### Logs
- Migration : `migration/logs/migration-report.json`
- Directus : Docker logs `directus-unified`
- Dashboard : `dashboard/logs/`

## 🚀 Scripts utiles

```bash
# Migration complète
npm run migrate:execute

# Migration avec simulation
npm run migrate:execute -- --dry-run

# Module spécifique
npm run migrate:execute -- --module=crm_contacts

# Rapport détaillé
npm run migrate:report
```

## 🔐 Sécurité

- **Notion** : Lecture seule, jamais de suppression
- **Directus** : Token statique pour migration
- **PostgreSQL** : Connexions sécurisées
- **Redis** : Cache uniquement, pas de données sensibles

## 📝 Documentation

- [Guide migration](migration/docs/README.md)
- [Import dashboard](dashboard/docs/IMPORT-NOTES.md)
- [Config Directus](directus/README.md)
- [DataAdapter API](dashboard/backend/services/dataAdapter.js)

---

✨ **Statut actuel** : Infrastructure prête, migration CRM en cours