#!/bin/bash

# ============================================
# NETTOYAGE DE LA RACINE DU REPOSITORY
# ============================================
# Ce script organise les 80+ fichiers de la racine
# Date: 24/08/2025
# ============================================

set -e  # Stop on error

echo "🧹 DÉBUT DU NETTOYAGE DE LA RACINE"
echo "📊 Environ 85 fichiers à organiser"
echo ""

# Vérifier qu'on est à la racine
if [ ! -f "package.json" ]; then
    echo "❌ Erreur : Ce script doit être exécuté depuis la racine du repository"
    exit 1
fi

# ============================================
# CRÉATION DES DOSSIERS
# ============================================
echo "📁 Création des nouveaux dossiers..."

mkdir -p tools/testing
mkdir -p tools/validation  
mkdir -p tools/migration
mkdir -p tools/cleanup
mkdir -p tools/monitoring
mkdir -p docs/archive/reports
mkdir -p docs/archive/migration
mkdir -p docs/archive/cleanup
mkdir -p temp

echo "✅ Dossiers créés"
echo ""

# ============================================
# DÉPLACEMENT DES FICHIERS DE TEST
# ============================================
echo "🧪 Organisation des fichiers de test (35+ fichiers)..."

# Tests principaux
for file in test-*.js test-*.html; do
    if [ -f "$file" ]; then
        echo "  → Déplacement de $file vers tools/testing/"
        mv "$file" tools/testing/ 2>/dev/null || true
    fi
done

# Validation
for file in validate-*.js check-*.js diagnose-*.js; do
    if [ -f "$file" ]; then
        echo "  → Déplacement de $file vers tools/validation/"
        mv "$file" tools/validation/ 2>/dev/null || true
    fi
done

echo ""

# ============================================
# DÉPLACEMENT DES SCRIPTS DE MIGRATION
# ============================================
echo "🔄 Organisation des scripts de migration (20+ fichiers)..."

for file in create-*.js fix-*.js reset-*.js migrate-*.js sync-*.js; do
    if [ -f "$file" ]; then
        echo "  → Déplacement de $file vers tools/migration/"
        mv "$file" tools/migration/ 2>/dev/null || true
    fi
done

# Fichiers SQL
for file in *.sql; do
    if [ -f "$file" ]; then
        echo "  → Déplacement de $file vers tools/migration/"
        mv "$file" tools/migration/ 2>/dev/null || true
    fi
done

echo ""

# ============================================
# DÉPLACEMENT DES SCRIPTS DE NETTOYAGE
# ============================================
echo "🧹 Organisation des scripts de nettoyage (10+ fichiers)..."

for file in cleanup-*.sh organize-*.sh reorganize-*.sh verify-*.sh quick-*.sh CLEANUP_NOW.sh; do
    if [ -f "$file" ]; then
        echo "  → Déplacement de $file vers tools/cleanup/"
        mv "$file" tools/cleanup/ 2>/dev/null || true
    fi
done

echo ""

# ============================================
# DÉPLACEMENT DES FICHIERS DE DOCUMENTATION
# ============================================
echo "📚 Organisation de la documentation temporaire..."

# Rapports JSON
for file in *-report*.json validation-report.json; do
    if [ -f "$file" ]; then
        echo "  → Déplacement de $file vers docs/archive/reports/"
        mv "$file" docs/archive/reports/ 2>/dev/null || true
    fi
done

# Documentation MD temporaire
for file in ARCHIVING_*.md CLEANUP_*.md QUICK_*.md REPOSITORY_*.md mcp-*.md github-*.md fix-*.md test-report-*.md; do
    if [ -f "$file" ]; then
        echo "  → Déplacement de $file vers docs/archive/cleanup/"
        mv "$file" docs/archive/cleanup/ 2>/dev/null || true
    fi
done

# README-NEW.md
if [ -f "README-NEW.md" ]; then
    echo "  → Déplacement de README-NEW.md vers docs/archive/"
    mv README-NEW.md docs/archive/ 2>/dev/null || true
fi

echo ""

# ============================================
# DÉPLACEMENT DES FICHIERS TEMPORAIRES
# ============================================
echo "🗑️ Déplacement des fichiers temporaires vers temp/..."

# Tokens et PID
for file in .best-token .jmd-token server.pid *.pid; do
    if [ -f "$file" ]; then
        echo "  → Déplacement de $file vers temp/"
        mv "$file" temp/ 2>/dev/null || true
    fi
done

# Fichiers de diagnostic
for file in diagnostic-*.txt; do
    if [ -f "$file" ]; then
        echo "  → Déplacement de $file vers temp/"
        mv "$file" temp/ 2>/dev/null || true
    fi
done

echo ""

# ============================================
# DÉPLACEMENT DES SCRIPTS DE MONITORING
# ============================================
echo "📊 Organisation des scripts de monitoring..."

for file in monitor-*.js test-all-*.js test-all-*.sh; do
    if [ -f "$file" ]; then
        echo "  → Déplacement de $file vers tools/monitoring/"
        mv "$file" tools/monitoring/ 2>/dev/null || true
    fi
done

echo ""

# ============================================
# DÉPLACEMENT DES SCRIPTS SHELL DIVERS
# ============================================
echo "🔧 Organisation des scripts shell divers..."

# Scripts de démarrage/arrêt
for file in start-*.sh stop-*.sh run-*.sh dev.sh publish-*.sh fix-*.sh; do
    if [ -f "$file" ]; then
        echo "  → Déplacement de $file vers scripts/deployment/"
        mv "$file" scripts/deployment/ 2>/dev/null || true
    fi
done

# Scripts git
for file in git-*.sh check-*.sh; do
    if [ -f "$file" ]; then
        echo "  → Déplacement de $file vers scripts/utilities/"
        mv "$file" scripts/utilities/ 2>/dev/null || true
    fi
done

echo ""

# ============================================
# NETTOYAGE DES FICHIERS OBSOLÈTES
# ============================================
echo "🗑️ Déplacement des fichiers obsolètes..."

# Fichiers .ds-to-remove et autres
if [ -f ".ds-to-remove" ]; then
    echo "  → Déplacement de .ds-to-remove vers temp/"
    mv .ds-to-remove temp/ 2>/dev/null || true
fi

# Template shell
if [ -f "create-template.sh" ]; then
    echo "  → Déplacement de create-template.sh vers tools/migration/"
    mv create-template.sh tools/migration/ 2>/dev/null || true
fi

echo ""

# ============================================
# RÉSUMÉ
# ============================================
echo "============================================"
echo "📋 RÉSUMÉ DU NETTOYAGE"
echo "============================================"
echo ""

# Compter les fichiers restants
REMAINING=$(ls -1 *.js *.sh *.sql *.md 2>/dev/null | grep -v README.md | wc -l)

echo "📊 Statistiques :"
echo "  → Fichiers dans tools/testing: $(ls -1 tools/testing/ 2>/dev/null | wc -l)"
echo "  → Fichiers dans tools/validation: $(ls -1 tools/validation/ 2>/dev/null | wc -l)"
echo "  → Fichiers dans tools/migration: $(ls -1 tools/migration/ 2>/dev/null | wc -l)"
echo "  → Fichiers dans tools/cleanup: $(ls -1 tools/cleanup/ 2>/dev/null | wc -l)"
echo "  → Fichiers dans tools/monitoring: $(ls -1 tools/monitoring/ 2>/dev/null | wc -l)"
echo "  → Fichiers dans docs/archive: $(find docs/archive -type f 2>/dev/null | wc -l)"
echo "  → Fichiers dans temp: $(ls -1 temp/ 2>/dev/null | wc -l)"
echo ""
echo "✅ Fichiers restants à la racine (hors essentiels): $REMAINING"
echo ""

# Lister les fichiers restants
echo "📁 Fichiers restants à la racine :"
for file in *.js *.sh *.sql *.html; do
    if [ -f "$file" ]; then
        echo "  • $file"
    fi
done

echo ""
echo "✅ NETTOYAGE TERMINÉ !"
echo ""
echo "Prochaines étapes :"
echo "  1. Vérifier que tout fonctionne toujours"
echo "  2. Supprimer le dossier temp/ après vérification"
echo "  3. Mettre à jour les chemins dans la documentation"
echo "  4. Créer une PR pour ces changements"