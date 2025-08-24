#!/bin/bash

# 🚀 SCRIPT D'ORGANISATION DU REPOSITORY
# Organise tous les fichiers scripts de la racine dans /scripts/
# Date: 24 décembre 2024

echo "📦 Organisation du repository Directus Unified Platform"
echo "=================================================="

# Création des dossiers principaux dans /scripts/
echo "📁 Création de la structure des dossiers..."
mkdir -p scripts/testing
mkdir -p scripts/migration
mkdir -p scripts/deployment
mkdir -p scripts/utilities
mkdir -p scripts/cleanup
mkdir -p scripts/archive

# 🧪 TESTING - Déplacer tous les fichiers de test
echo ""
echo "🧪 Organisation des fichiers de test..."
mv test-*.js scripts/testing/ 2>/dev/null || echo "  ✓ Fichiers test-*.js déjà organisés"
mv test-*.sh scripts/testing/ 2>/dev/null || echo "  ✓ Fichiers test-*.sh déjà organisés"
mv test-*.html scripts/testing/ 2>/dev/null || echo "  ✓ Fichiers test-*.html déjà organisés"
mv test-*.md scripts/testing/ 2>/dev/null || echo "  ✓ Fichiers test-*.md déjà organisés"
mv test-*.json scripts/testing/ 2>/dev/null || echo "  ✓ Fichiers test-*.json déjà organisés"
mv validation-report.json scripts/testing/ 2>/dev/null || echo "  ✓ validation-report.json déjà organisé"

# 🔄 MIGRATION - Déplacer les fichiers de migration
echo ""
echo "🔄 Organisation des fichiers de migration..."
mv migrate-*.js scripts/migration/ 2>/dev/null || echo "  ✓ Fichiers migrate-*.js déjà organisés"
mv migration-*.json scripts/migration/ 2>/dev/null || echo "  ✓ Fichiers migration-*.json déjà organisés"
mv migration-*.txt scripts/migration/ 2>/dev/null || echo "  ✓ Fichiers migration-*.txt déjà organisés"
mv create-companies.js scripts/migration/ 2>/dev/null || echo "  ✓ create-companies.js déjà organisé"
mv create-kpi-data.js scripts/migration/ 2>/dev/null || echo "  ✓ create-kpi-data.js déjà organisé"
mv create-admin-*.js scripts/migration/ 2>/dev/null || echo "  ✓ Fichiers create-admin-*.js déjà organisés"
mv create-owner-company-*.js scripts/migration/ 2>/dev/null || echo "  ✓ Fichiers create-owner-company-*.js déjà organisés"
mv create-template.sh scripts/migration/ 2>/dev/null || echo "  ✓ create-template.sh déjà organisé"
mv reset-admin-password.js scripts/migration/ 2>/dev/null || echo "  ✓ reset-admin-password.js déjà organisé"
mv get-jmd-token.js scripts/migration/ 2>/dev/null || echo "  ✓ get-jmd-token.js déjà organisé"
mv sync-directus-*.js scripts/migration/ 2>/dev/null || echo "  ✓ Fichiers sync-directus-*.js déjà organisés"
mv owner-company-*.json scripts/migration/ 2>/dev/null || echo "  ✓ Fichiers owner-company-*.json déjà organisés"
mv -r owner-company-migration scripts/migration/ 2>/dev/null || echo "  ✓ Dossier owner-company-migration déjà organisé"

# 🚀 DEPLOYMENT - Déplacer les fichiers de déploiement
echo ""
echo "🚀 Organisation des fichiers de déploiement..."
mv start-*.sh scripts/deployment/ 2>/dev/null || echo "  ✓ Fichiers start-*.sh déjà organisés"
mv stop-*.sh scripts/deployment/ 2>/dev/null || echo "  ✓ Fichiers stop-*.sh déjà organisés"
mv docker-compose*.yml scripts/deployment/ 2>/dev/null || echo "  ✓ Fichiers docker-compose*.yml déjà organisés"
mv ecosystem.config.js scripts/deployment/ 2>/dev/null || echo "  ✓ ecosystem.config.js déjà organisé"
mv server*.js scripts/deployment/ 2>/dev/null || echo "  ✓ Fichiers server*.js déjà organisés"
mv server.pid scripts/deployment/ 2>/dev/null || echo "  ✓ server.pid déjà organisé"
mv dev.sh scripts/deployment/ 2>/dev/null || echo "  ✓ dev.sh déjà organisé"
mv publish-*.sh scripts/deployment/ 2>/dev/null || echo "  ✓ Fichiers publish-*.sh déjà organisés"

# 🔧 UTILITIES - Déplacer les fichiers utilitaires
echo ""
echo "🔧 Organisation des fichiers utilitaires..."
mv check-*.js scripts/utilities/ 2>/dev/null || echo "  ✓ Fichiers check-*.js déjà organisés"
mv check-*.sh scripts/utilities/ 2>/dev/null || echo "  ✓ Fichiers check-*.sh déjà organisés"
mv check-*.sql scripts/utilities/ 2>/dev/null || echo "  ✓ Fichiers check-*.sql déjà organisés"
mv diagnose-*.js scripts/utilities/ 2>/dev/null || echo "  ✓ Fichiers diagnose-*.js déjà organisés"
mv diagnostic-*.txt scripts/utilities/ 2>/dev/null || echo "  ✓ Fichiers diagnostic-*.txt déjà organisés"
mv monitor-*.js scripts/utilities/ 2>/dev/null || echo "  ✓ Fichiers monitor-*.js déjà organisés"
mv validate-*.js scripts/utilities/ 2>/dev/null || echo "  ✓ Fichiers validate-*.js déjà organisés"
mv verify-*.sh scripts/utilities/ 2>/dev/null || echo "  ✓ Fichiers verify-*.sh déjà organisés"

# 🧹 CLEANUP - Déplacer les fichiers de nettoyage
echo ""
echo "🧹 Organisation des fichiers de nettoyage..."
mv cleanup-*.sh scripts/cleanup/ 2>/dev/null || echo "  ✓ Fichiers cleanup-*.sh déjà organisés"
mv CLEANUP*.sh scripts/cleanup/ 2>/dev/null || echo "  ✓ Fichiers CLEANUP*.sh déjà organisés"
mv CLEANUP*.md scripts/cleanup/ 2>/dev/null || echo "  ✓ Fichiers CLEANUP*.md déjà organisés"
mv reorganize-repo.sh scripts/cleanup/ 2>/dev/null || echo "  ✓ reorganize-repo.sh déjà organisé"

# 📦 ARCHIVE - Déplacer les fichiers d'archive
echo ""
echo "📦 Organisation des fichiers d'archive..."
mv backup-*.sql scripts/archive/ 2>/dev/null || echo "  ✓ Fichiers backup-*.sql déjà organisés"
mv ARCHIVING_INSTRUCTIONS.md scripts/archive/ 2>/dev/null || echo "  ✓ ARCHIVING_INSTRUCTIONS.md déjà organisé"
mv -r dashboard-backup-before-import-* scripts/archive/ 2>/dev/null || echo "  ✓ Dossiers dashboard-backup-* déjà organisés"

# 🔧 FIX - Déplacer les fichiers de correction
echo ""
echo "🔧 Organisation des fichiers de correction..."
mv fix-*.js scripts/utilities/ 2>/dev/null || echo "  ✓ Fichiers fix-*.js déjà organisés"
mv fix-*.sh scripts/utilities/ 2>/dev/null || echo "  ✓ Fichiers fix-*.sh déjà organisés"
mv fix-*.md scripts/utilities/ 2>/dev/null || echo "  ✓ Fichiers fix-*.md déjà organisés"
mv fix-*.sql scripts/utilities/ 2>/dev/null || echo "  ✓ Fichiers fix-*.sql déjà organisés"
mv run-fix-*.sh scripts/utilities/ 2>/dev/null || echo "  ✓ Fichiers run-fix-*.sh déjà organisés"

# 📋 Création du README dans /scripts/
echo ""
echo "📋 Création du fichier README pour /scripts/..."
cat > scripts/README.md << 'EOF'
# 📁 Scripts Directory Organization

## Structure

```
scripts/
├── testing/        # 🧪 Tests unitaires et d'intégration
├── migration/      # 🔄 Scripts de migration de données
├── deployment/     # 🚀 Scripts de déploiement et serveurs
├── utilities/      # 🔧 Utilitaires, vérifications et corrections
├── cleanup/        # 🧹 Scripts de nettoyage et réorganisation
└── archive/        # 📦 Fichiers archivés et backups
```

## Description des dossiers

### 🧪 testing/
Contient tous les scripts de test :
- Tests API (test-api-*.js)
- Tests Dashboard (test-dashboard-*.js)
- Tests de permissions (test-permissions.js)
- Tests OCR (test-ocr*.js)
- Rapports de validation

### 🔄 migration/
Scripts pour la migration des données :
- Migration des collections Directus
- Création des owner companies
- Scripts de synchronisation
- Import/Export de données

### 🚀 deployment/
Scripts de déploiement et configuration :
- Docker Compose configurations
- Scripts de démarrage/arrêt
- Configuration des serveurs
- Scripts de publication

### 🔧 utilities/
Outils et utilitaires divers :
- Scripts de vérification (check-*.js)
- Scripts de diagnostic (diagnose-*.js)
- Scripts de correction (fix-*.js)
- Scripts de validation (validate-*.js)
- Scripts de monitoring

### 🧹 cleanup/
Scripts de nettoyage et organisation :
- Nettoyage du repository
- Suppression des fichiers temporaires
- Réorganisation des branches
- Archivage des anciens fichiers

### 📦 archive/
Fichiers archivés et backups :
- Backups SQL
- Anciennes configurations
- Documentation archivée

## Utilisation

Pour exécuter un script :
```bash
# Depuis la racine du projet
node scripts/testing/test-connection.js
bash scripts/deployment/start-platform.sh

# Ou avec les permissions d'exécution
./scripts/cleanup/cleanup-temp-files.sh
```

## Maintenance

- Les nouveaux scripts doivent être placés dans le dossier approprié
- Utiliser des noms descriptifs avec préfixes (test-, migrate-, check-, etc.)
- Documenter chaque script avec des commentaires en en-tête
- Maintenir ce README à jour lors de l'ajout de nouveaux scripts

---
*Dernière mise à jour : 24 décembre 2024*
EOF

echo ""
echo "✅ Organisation terminée !"
echo ""
echo "📊 Résumé de l'organisation :"
echo "  • testing/     : Scripts de test"
echo "  • migration/   : Scripts de migration"
echo "  • deployment/  : Scripts de déploiement"
echo "  • utilities/   : Scripts utilitaires"
echo "  • cleanup/     : Scripts de nettoyage"
echo "  • archive/     : Fichiers archivés"
echo ""
echo "📝 Note : Les fichiers déjà organisés n'ont pas été déplacés."
echo "         Vérifiez manuellement si certains fichiers nécessitent"
echo "         une organisation supplémentaire."
