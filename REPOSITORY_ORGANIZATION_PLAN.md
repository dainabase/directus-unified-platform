# 🚀 PLAN DE RÉORGANISATION DU REPOSITORY
*Date : 24 décembre 2024*

## 📊 État Actuel

### Fichiers à la racine à organiser

#### 🧪 Testing (22 fichiers)
```
test-all-services.sh
test-all-tokens.js
test-api-filtering.js
test-collection-permissions.js
test-complete-results.json
test-connection.js
test-dashboard-api.js
test-dashboard-filtering.js
test-dashboard-final.js
test-dashboard-kpis.js
test-dashboard-token.js
test-dashboard-visual.js
test-e2e.sh
test-fields.js
test-invoice.html
test-migration.js
test-ocr-config.js
test-permissions.js
test-report-phase1.md
test-theme-toggle.html
validate-dashboard-v4.js
validate-full-system.js
validation-report.json
```

#### 🔄 Migration (16 fichiers)
```
migrate-with-directus-sdk.js
migration-final-report.json
migration-report-admin.json
migration-report-direct.json
migration-report-final.json
migration-report-final.txt
migration-report-jmd.json
create-companies.js
create-kpi-data.js
create-admin-field-via-login.js
create-admin-token.js
create-owner-company-template.js
create-template.sh
reset-admin-password.js
get-jmd-token.js
sync-directus-schema.js
sync-directus-schema-new.js
owner-company-report.json
owner-company-migration/ (dossier)
```

#### 🚀 Deployment (9 fichiers)
```
start-all-services.sh
start-platform.sh
stop-platform.sh
docker-compose.yml
docker-compose.mcp.yml
docker-compose.storybook.yml
ecosystem.config.js
server.js
server-directus-unified.js
server.pid
dev.sh
publish-beta.sh
```

#### 🔧 Utilities (13 fichiers)
```
check-collections-exist.js
check-docker-status.sh
check-owner-company-fields.js
check-owner-company-sql.sh
check-sync.sh
check-user-role.js
check-users.js
diagnose-permissions.js
diagnostic-docker.txt
monitor-health.js
validate-dashboard-v4.js
validate-full-system.js
verify-design-system.sh
verify-no-twenty.sh
```

#### 🧹 Cleanup (10 fichiers)
```
cleanup-design-system.sh
cleanup-design-system-obsolete.sh
cleanup-merged-branches.sh
cleanup-obsolete-branch.sh
cleanup-temp-files.sh
CLEANUP_NOW.sh
CLEANUP_STATUS_FINAL.md
reorganize-repo.sh
```

#### 🔧 Fix (13 fichiers)
```
fix-all-mcp-errors.md
fix-and-publish.sh
fix-directus-mcp.md
fix-everything.sh
fix-github-token.md
fix-missing-fields.sql
fix-owner-company-direct.js
fix-owner-company-working.js
fix-with-jmd-login.js
run-fix-mcp.sh
```

#### 📦 Archive (4 fichiers)
```
backup-before-migration-20250808-185754.sql
ARCHIVING_INSTRUCTIONS.md
dashboard-backup-before-import-20250803/ (dossier)
```

#### 📋 Documentation (6 fichiers)
```
github-diagnostic-report.md
mcp-status-summary.md
mcp-status-update.md
quick-score-improvement.sh
git-push-commands.sh
```

## 🎯 Actions à Réaliser

### Phase 1 : Organisation des Scripts (PRIORITAIRE)
1. ✅ Créer le script `organize-repository.sh` (FAIT)
2. ⏳ Exécuter le script pour déplacer les fichiers
3. ⏳ Vérifier que tous les fichiers sont correctement organisés
4. ⏳ Mettre à jour les imports/chemins dans les fichiers qui en dépendent

### Phase 2 : Nettoyage de la Racine
1. ⏳ Déplacer les README redondants vers `/docs/`
2. ⏳ Consolider les fichiers de configuration
3. ⏳ Archiver les anciens fichiers de statut

### Phase 3 : Organisation des Dossiers Principaux
```
directus-unified-platform/
├── src/                    # ✅ Code source principal
│   ├── frontend/          # ✅ Application React
│   └── backend/           # ✅ Extensions Directus
├── scripts/               # 🔄 Scripts organisés (en cours)
│   ├── testing/          # Tests
│   ├── migration/        # Migrations
│   ├── deployment/       # Déploiement
│   ├── utilities/        # Utilitaires
│   ├── cleanup/          # Nettoyage
│   └── archive/          # Archives
├── docs/                  # ✅ Documentation
│   ├── architecture/     # Architecture
│   ├── guides/           # Guides
│   └── archive/          # Docs archivés
├── packages/              # ⚠️ NE PAS TOUCHER (UI package)
├── integrations/          # ✅ Services externes
├── config/                # ✅ Configurations
└── .github/              # ✅ GitHub Actions
```

### Phase 4 : Mise à Jour de la Documentation
1. ⏳ Mettre à jour le README principal
2. ⏳ Créer un CHANGELOG.md
3. ⏳ Documenter la nouvelle structure

## 📋 Commandes à Exécuter

```bash
# 1. Rendre le script exécutable et l'exécuter
chmod +x scripts/organize-repository.sh
./scripts/organize-repository.sh

# 2. Vérifier l'organisation
ls -la scripts/testing/ | wc -l    # Devrait montrer ~22 fichiers
ls -la scripts/migration/ | wc -l  # Devrait montrer ~16 fichiers
ls -la scripts/deployment/ | wc -l # Devrait montrer ~9 fichiers
ls -la scripts/utilities/ | wc -l  # Devrait montrer ~13 fichiers
ls -la scripts/cleanup/ | wc -l    # Devrait montrer ~10 fichiers
ls -la scripts/archive/ | wc -l    # Devrait montrer ~4 fichiers

# 3. Vérifier que la racine est nettoyée
ls -la *.js | wc -l   # Devrait être proche de 0
ls -la *.sh | wc -l   # Devrait être proche de 0

# 4. Commit des changements
git add -A
git commit -m "chore: Reorganize repository structure - Move all scripts to organized folders"
git push origin main
```

## ✅ Critères de Succès

- [ ] Tous les scripts sont dans `/scripts/` avec sous-dossiers organisés
- [ ] La racine ne contient que les fichiers essentiels
- [ ] README.md dans `/scripts/` documente la structure
- [ ] Aucun lien cassé après la réorganisation
- [ ] Les GitHub Actions continuent de fonctionner
- [ ] La documentation est à jour

## 🚨 Points d'Attention

1. **NE PAS TOUCHER** :
   - `/packages/ui/` - Seul package propre du projet
   - `.github/` - GitHub Actions configurées
   - `node_modules/` - Dépendances

2. **VÉRIFIER APRÈS DÉPLACEMENT** :
   - Les imports dans les fichiers JS/TS
   - Les chemins dans les scripts bash
   - Les références dans la documentation

3. **SAUVEGARDER AVANT** :
   - Faire un backup de la branche actuelle
   - Tester sur une branche séparée si nécessaire

## 📝 Notes

- Le script `organize-repository.sh` utilise `mv` avec `2>/dev/null` pour éviter les erreurs si les fichiers sont déjà organisés
- Les fichiers déjà dans la bonne place ne seront pas déplacés
- Un message de confirmation s'affiche pour chaque catégorie

---
*Ce plan sera mis à jour au fur et à mesure de l'avancement de la réorganisation.*
