# Directus Unified Platform

**Migration intelligente Notion → Directus avec Dashboard Multi-espaces existant**

## 🎯 Vue d'ensemble

Ce projet unifie :
1. **Migration de données** : 62 bases Notion → 48 collections Directus optimisées
2. **Dashboard existant** : 4 portails (SuperAdmin, Clients, Prestataires, Revendeurs) avec 156 endpoints
3. **Architecture moderne** : Self-hosted, API REST/GraphQL, performances <100ms

### 📊 Chiffres clés
- **62** bases Notion à migrer
- **48** collections Directus cibles (-22.5% de complexité)
- **156** endpoints API existants
- **4** portails avec permissions RBAC
- **ROI** : -85% temps opérationnel

## 📚 Documentation

### Documents de référence
1. **[AUDIT-MIGRATION-COMPLET.md](migration/docs/AUDIT-MIGRATION-COMPLET.md)** - Analyse complète de la migration
2. **[MAPPING-NOTION-DIRECTUS.md](migration/docs/MAPPING-NOTION-DIRECTUS.md)** - Mapping détaillé 62→48
3. **[PLAN-MIGRATION.md](migration/docs/PLAN-MIGRATION.md)** - Planning sur 5 semaines
4. **[STATUS.md](migration/STATUS.md)** - Statut temps réel de la migration

### Analyse des données
- **[notion-databases-analysis.json](migration/analysis/notion-databases-analysis.json)** - Analyse des 62 bases Notion

## 🚀 Installation rapide

### 1. Prérequis
- Docker & Docker Compose
- Node.js 18+
- Git

### 2. Cloner et configurer
```bash
git clone https://github.com/dainabase/directus-unified-platform.git
cd directus-unified-platform
cp .env.example .env
# Éditer .env avec vos valeurs
```

### 3. Lancer Directus
```bash
docker compose up -d
```

### 4. Accéder à Directus
- URL: http://localhost:8055
- Email: (celui dans .env)
- Password: (celui dans .env)

## 📁 Structure du projet

```
directus-unified-platform/
├── 📁 migration/               # Migration Notion → Directus
│   ├── analysis/              # Analyses JSON des bases
│   ├── docs/                  # Documentation complète
│   ├── scripts/               # Scripts ETL (à créer)
│   └── STATUS.md              # Statut temps réel
│
├── 📁 dashboard/               # Dashboard existant (à importer)
│   ├── frontend/              # 4 portails Tabler.io
│   ├── backend/               # 156 endpoints
│   └── docs/                  # Architecture
│
├── 📁 directus/               # Configuration Directus
│   ├── schema/               # Schémas collections
│   ├── migrations/           # Migrations DB
│   └── extensions/           # Extensions custom
│
├── 📁 config/                # Configuration globale
├── docker-compose.yml        # Stack Docker
└── .env.example             # Variables d'environnement
```

## 🔄 État actuel (03/08/2025)

### ✅ Fait
- Installation Directus avec 13 collections de base
- Analyse complète des 62 bases Notion
- Documentation de référence créée
- Plan de migration détaillé

### 🚧 En cours
- Création des 35 collections manquantes
- Scripts de migration ETL
- Import du dashboard existant

### 📅 Prochaines étapes
1. **Semaine du 5/08** : Migration bases simples (Phase 1)
2. **Semaine du 12/08** : Migration bases moyennes (Phase 2)
3. **Semaine du 19/08** : Migration bases complexes (Phase 3)
4. **Semaine du 26/08** : Bases système critiques (Phase 4)
5. **Semaine du 2/09** : Go Live et support

## 🔧 Commandes utiles

### Docker
```bash
# Logs Directus
docker compose logs -f directus

# Arrêter les services
docker compose down

# Réinitialiser complètement
docker compose down -v
```

### Migration (à venir)
```bash
# Migrer une collection simple
npm run migrate:simple time_tracking DB-TIME-TRACKING

# Valider une migration
npm run validate:collection time_tracking

# Voir le statut global
npm run report:status

# Rollback si nécessaire
npm run rollback:collection time_tracking
```

## 📊 Dashboard existant

### Caractéristiques
- **UI** : Tabler.io v1.0.0-beta20 (package acheté)
- **OCR** : 100% fonctionnel avec OpenAI Vision
- **Auth** : JWT avec sessions
- **API** : 156/180 endpoints implémentés

### Portails
1. **SuperAdmin** : OCR, gestion globale, analytics
2. **Client** : Projets, factures, support
3. **Prestataire** : Missions, livrables, paiements
4. **Revendeur** : Commissions, zones, rewards

### Import prévu
```bash
# Source locale
/Users/jean-mariedelaunay/Dashboard Client: Presta/

# Import dans le projet
npm run dashboard:import
npm run dashboard:verify-ocr
npm run dashboard:test-legacy
```

## 🚨 Règles critiques

### ❌ NE JAMAIS
1. Supprimer une base Notion (archive only)
2. Modifier l'OCR fonctionnel
3. Changer l'UI Tabler.io
4. Fusionner les bases système critiques

### ✅ TOUJOURS
1. Tester chaque migration
2. Valider l'intégrité des données
3. Préserver les 156 endpoints
4. Documenter les changements

## 📈 Métriques de succès

| Métrique | Cible | Actuel |
|----------|-------|--------|
| Bases migrées | 62 | 0 |
| Performance API | <100ms | N/A |
| Endpoints fonctionnels | 156/156 | 0/156 |
| OCR opérationnel | 100% | 0% |
| Données perdues | 0 | 0 |

## 🤝 Contribution

### Workflow Git
```bash
# Nouvelle fonctionnalité
git checkout -b feature/nom-feature

# Commit avec convention
git commit -m "feat: Description de la feature"
git commit -m "fix: Correction du bug"
git commit -m "docs: Mise à jour documentation"

# Push et PR
git push origin feature/nom-feature
```

### Standards de code
- ESLint + Prettier configurés
- Tests obligatoires pour migrations
- Documentation JSDoc
- Commits conventionnels

## 📞 Support

- **Documentation** : Voir `/migration/docs/`
- **Issues** : GitHub Issues
- **Urgences** : Voir PLAN-MIGRATION.md section Escalation

## 📝 Licence

Propriétaire - Dainamics SA

---

**Dernière mise à jour** : 2025-08-03  
**Version** : 1.0.0  
**Statut** : 🚧 Migration en cours
