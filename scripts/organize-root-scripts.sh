#!/bin/bash

# Script pour organiser les fichiers de scripts de la racine dans /scripts/
# Créé le 24 décembre 2024

echo "🧹 Organisation des scripts de la racine vers /scripts/"
echo "=================================================="

# Créer les sous-dossiers s'ils n'existent pas
mkdir -p scripts/testing
mkdir -p scripts/migration  
mkdir -p scripts/deployment
mkdir -p scripts/utilities
mkdir -p scripts/archive

# Fonction pour déplacer les fichiers
move_files() {
    local pattern=$1
    local destination=$2
    local count=0
    
    for file in $pattern; do
        if [ -f "$file" ]; then
            echo "  → Déplacement de $file vers $destination/"
            git mv "$file" "$destination/" 2>/dev/null || mv "$file" "$destination/"
            ((count++))
        fi
    done
    
    echo "  ✓ $count fichiers déplacés vers $destination/"
}

echo ""
echo "📂 Organisation des scripts de test..."
move_files "test-*.js" "scripts/testing"
move_files "test-*.sh" "scripts/testing"
move_files "test-*.html" "scripts/testing"
move_files "validate-*.js" "scripts/testing"
move_files "check-*.js" "scripts/testing"
move_files "check-*.sh" "scripts/testing"
move_files "diagnose-*.js" "scripts/testing"
move_files "monitor-*.js" "scripts/testing"

echo ""
echo "📂 Organisation des scripts de migration..."
move_files "migrate-*.js" "scripts/migration"
move_files "create-*.js" "scripts/migration"
move_files "fix-*.js" "scripts/migration"
move_files "fix-*.sh" "scripts/migration"
move_files "sync-*.js" "scripts/migration"
move_files "reset-*.js" "scripts/migration"

echo ""
echo "📂 Organisation des scripts de déploiement..."
move_files "start-*.sh" "scripts/deployment"
move_files "stop-*.sh" "scripts/deployment"
move_files "dev.sh" "scripts/deployment"
move_files "publish-*.sh" "scripts/deployment"
move_files "docker-compose*.yml" "scripts/deployment"
move_files "ecosystem.config.js" "scripts/deployment"

echo ""
echo "📂 Organisation des scripts utilitaires..."
move_files "cleanup-*.sh" "scripts/utilities"
move_files "get-*.js" "scripts/utilities"
move_files "verify-*.sh" "scripts/utilities"
move_files "git-*.sh" "scripts/utilities"
move_files "run-*.sh" "scripts/utilities"

echo ""
echo "📂 Archivage des anciens scripts..."
move_files "backup-*.sql" "scripts/archive"
move_files "*-report.json" "scripts/archive"
move_files "*-report.txt" "scripts/archive"
move_files "diagnostic-*.txt" "scripts/archive"

echo ""
echo "📂 Déplacement des fichiers serveur..."
move_files "server*.js" "scripts/deployment"
move_files "*.pid" "scripts/deployment"

echo ""
echo "🎯 Création du README pour documenter l'organisation..."
cat > scripts/README.md << 'EOF'
# 📁 Organisation des Scripts

Ce dossier contient tous les scripts organisés par catégorie pour le projet Directus Unified Platform.

## 📂 Structure

### `/testing/`
Scripts de test et de validation :
- Tests unitaires et d'intégration
- Validation des configurations
- Tests de connexion et d'API
- Diagnostics système

### `/migration/`
Scripts de migration et de création :
- Migration de données
- Création de collections et relations
- Synchronisation de schémas
- Corrections et mises à jour

### `/deployment/`
Scripts de déploiement et de gestion :
- Démarrage/arrêt de services
- Configuration Docker
- Publication NPM
- Gestion des serveurs

### `/utilities/`
Scripts utilitaires divers :
- Nettoyage de fichiers
- Récupération de tokens
- Vérifications diverses
- Utilitaires Git

### `/maintenance/`
Scripts de maintenance système :
- Nettoyage de base de données
- Optimisation des performances
- Sauvegarde et restauration

### `/setup/`
Scripts d'installation et configuration :
- Installation initiale
- Configuration des services
- Setup des environnements

### `/archive/`
Scripts obsolètes ou archivés :
- Anciennes versions
- Scripts de migration terminés
- Rapports et logs

## 🚀 Utilisation

Pour exécuter un script :
\`\`\`bash
# Depuis la racine du projet
./scripts/[categorie]/[script.sh]

# Ou avec Node.js
node scripts/[categorie]/[script.js]
\`\`\`

## 📝 Convention de nommage

- `test-*.{js,sh}` : Scripts de test
- `create-*.js` : Scripts de création
- `migrate-*.js` : Scripts de migration
- `fix-*.{js,sh}` : Scripts de correction
- `cleanup-*.sh` : Scripts de nettoyage
- `validate-*.js` : Scripts de validation

## 🔧 Maintenance

Pour ajouter un nouveau script :
1. Identifiez la catégorie appropriée
2. Placez le script dans le bon dossier
3. Suivez la convention de nommage
4. Documentez son utilisation

---
Organisé le 24 décembre 2024
EOF

echo ""
echo "✅ Organisation terminée !"
echo ""
echo "📊 Résumé :"
echo "  - Scripts de test → /scripts/testing/"
echo "  - Scripts de migration → /scripts/migration/"
echo "  - Scripts de déploiement → /scripts/deployment/"
echo "  - Scripts utilitaires → /scripts/utilities/"
echo "  - Scripts archivés → /scripts/archive/"
echo ""
echo "💡 N'oubliez pas de faire un commit :"
echo "   git add -A"
echo "   git commit -m 'chore: organize root scripts into /scripts/ directory'"
echo "   git push"
