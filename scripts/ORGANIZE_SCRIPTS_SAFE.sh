#!/bin/bash

# ============================================
# SCRIPT D'ORGANISATION SÉCURISÉ - UNIQUEMENT /scripts
# ============================================
# Ce script organise UNIQUEMENT les fichiers dans le dossier /scripts
# Il ne touche à AUCUN autre dossier du repository
# Créé le : 24/12/2024
# ============================================

set -e  # Stop on error

echo "🚀 Début de l'organisation des scripts"
echo "⚠️  Ce script ne touche QU'AU dossier /scripts"
echo ""

# Vérifier qu'on est dans le bon répertoire
if [ ! -d "scripts" ]; then
    echo "❌ Erreur : Le dossier 'scripts' n'existe pas dans le répertoire actuel"
    echo "   Assurez-vous d'exécuter ce script depuis la racine du repository"
    exit 1
fi

# Se placer dans le dossier scripts
cd scripts

echo "📁 Création des dossiers d'organisation..."

# Créer les dossiers nécessaires s'ils n'existent pas
mkdir -p archive
mkdir -p deployment  
mkdir -p migration
mkdir -p testing
mkdir -p utilities
mkdir -p analysis
mkdir -p validation

echo "✅ Dossiers créés"
echo ""

# ============================================
# DÉPLACEMENT DES FICHIERS
# ============================================

echo "📦 Organisation des scripts de migration (32 fichiers)..."
# Scripts de création
for file in create-*.js; do
    if [ -f "$file" ]; then
        echo "  → Déplacement de $file vers migration/"
        mv "$file" migration/ 2>/dev/null || true
    fi
done

# Scripts de fix
for file in fix-*.js fix-*.sh; do
    if [ -f "$file" ]; then
        echo "  → Déplacement de $file vers migration/"
        mv "$file" migration/ 2>/dev/null || true
    fi
done

# Scripts de migration
for file in migrate-*.js migrate-*.sh; do
    if [ -f "$file" ]; then
        echo "  → Déplacement de $file vers migration/"
        mv "$file" migration/ 2>/dev/null || true
    fi
done

echo ""
echo "🧪 Organisation des scripts de test (11 fichiers)..."
for file in test-*.js test-*.sh; do
    if [ -f "$file" ]; then
        echo "  → Déplacement de $file vers testing/"
        mv "$file" testing/ 2>/dev/null || true
    fi
done

echo ""
echo "📚 Organisation des scripts d'archivage (3 fichiers)..."
for file in archive-*.py archive-*.sh; do
    if [ -f "$file" ]; then
        echo "  → Déplacement de $file vers archive/"
        mv "$file" archive/ 2>/dev/null || true
    fi
done

echo ""
echo "🚀 Organisation des scripts de déploiement (6 fichiers)..."
# Scripts de release
for file in release*.sh release*.py; do
    if [ -f "$file" ]; then
        echo "  → Déplacement de $file vers deployment/"
        mv "$file" deployment/ 2>/dev/null || true
    fi
done

# Scripts npm-publish
for file in npm-publish-*.sh publish-*.sh; do
    if [ -f "$file" ]; then
        echo "  → Déplacement de $file vers deployment/"
        mv "$file" deployment/ 2>/dev/null || true
    fi
done

# Scripts execute-release
for file in execute-release-*.sh; do
    if [ -f "$file" ]; then
        echo "  → Déplacement de $file vers deployment/"
        mv "$file" deployment/ 2>/dev/null || true
    fi
done

echo ""
echo "📊 Organisation des scripts d'analyse..."
for file in analyze-*.js analyze-*.sh; do
    if [ -f "$file" ]; then
        echo "  → Déplacement de $file vers analysis/"
        mv "$file" analysis/ 2>/dev/null || true
    fi
done

echo ""
echo "✅ Organisation des scripts de validation..."
for file in validate-*.js check-*.js identify-*.js; do
    if [ -f "$file" ]; then
        echo "  → Déplacement de $file vers validation/"
        mv "$file" validation/ 2>/dev/null || true
    fi
done

echo ""
echo "🔧 Organisation des scripts utilitaires (reste)..."
# Scripts cleanup
for file in cleanup-*.sh organize-*.sh; do
    if [ -f "$file" ]; then
        echo "  → Déplacement de $file vers utilities/"
        mv "$file" utilities/ 2>/dev/null || true
    fi
done

# Scripts get-*
for file in get-*.js; do
    if [ -f "$file" ]; then
        echo "  → Déplacement de $file vers utilities/"
        mv "$file" utilities/ 2>/dev/null || true
    fi
done

# Scripts install-*
for file in install-*.sh; do
    if [ -f "$file" ]; then
        echo "  → Déplacement de $file vers utilities/"
        mv "$file" utilities/ 2>/dev/null || true
    fi
done

# Scripts trigger-*
for file in trigger-*.sh; do
    if [ -f "$file" ]; then
        echo "  → Déplacement de $file vers utilities/"
        mv "$file" utilities/ 2>/dev/null || true
    fi
done

# Scripts populate-*
for file in populate-*.js; do
    if [ -f "$file" ]; then
        echo "  → Déplacement de $file vers utilities/"
        mv "$file" utilities/ 2>/dev/null || true
    fi
done

# Scripts add-*
for file in add-*.js; do
    if [ -f "$file" ]; then
        echo "  → Déplacement de $file vers utilities/"
        mv "$file" utilities/ 2>/dev/null || true
    fi
done

echo ""
echo "============================================"
echo "📋 RÉSUMÉ DE L'ORGANISATION"
echo "============================================"

# Compter les fichiers dans chaque dossier
echo ""
echo "📊 Fichiers par dossier :"
echo "  → migration/   : $(ls -1 migration/ 2>/dev/null | wc -l) fichiers"
echo "  → testing/     : $(ls -1 testing/ 2>/dev/null | wc -l) fichiers"
echo "  → archive/     : $(ls -1 archive/ 2>/dev/null | wc -l) fichiers"
echo "  → deployment/  : $(ls -1 deployment/ 2>/dev/null | wc -l) fichiers"
echo "  → analysis/    : $(ls -1 analysis/ 2>/dev/null | wc -l) fichiers"
echo "  → validation/  : $(ls -1 validation/ 2>/dev/null | wc -l) fichiers"
echo "  → utilities/   : $(ls -1 utilities/ 2>/dev/null | wc -l) fichiers"
echo ""

# Lister les fichiers restants à la racine
echo "📁 Fichiers restants à la racine de /scripts :"
for file in *.js *.sh *.ts *.py; do
    if [ -f "$file" ]; then
        echo "  • $file"
    fi
done

echo ""
echo "✅ Organisation terminée !"
echo ""
echo "⚠️  IMPORTANT :"
echo "  - Seuls les fichiers dans /scripts ont été déplacés"
echo "  - AUCUN autre dossier n'a été touché"
echo "  - packages/ui/ reste intact"
echo ""
echo "Prochaines étapes :"
echo "  1. git add scripts/"
echo "  2. git commit -m '✅ Organisation des scripts UNIQUEMENT - Sans toucher packages/ui/'"
echo "  3. git push origin organize-scripts-only-clean"
echo "  4. Créer une PR propre"
