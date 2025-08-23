#!/bin/bash

# ========================================
# Script de Migration OCR Module
# Organisation finale du module OCR v10
# Date: 23 Août 2025
# ========================================

echo "🚀 Migration du Module OCR Premium Dashboard v10"
echo "================================================"

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Chemins source et destination
SOURCE_DIR="dashboard/frontend/superadmin/finance"
DEST_DIR="src/frontend/modules/ocr"

# Fonction pour afficher les messages
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Vérifier si on est à la racine du projet
if [ ! -d "$SOURCE_DIR" ]; then
    log_error "Erreur: Le dossier source $SOURCE_DIR n'existe pas."
    log_info "Assurez-vous d'exécuter ce script depuis la racine du projet."
    exit 1
fi

# Créer la structure de destination si elle n'existe pas
log_info "Création de la structure de dossiers..."

mkdir -p "$DEST_DIR/v10-official/components"
mkdir -p "$DEST_DIR/v10-official/styles"
mkdir -p "$DEST_DIR/tests"
mkdir -p "$DEST_DIR/docs"
mkdir -p "$DEST_DIR/backup"

log_success "Structure créée"

# ========================================
# 1. COPIER LE DASHBOARD PRINCIPAL
# ========================================

log_info "Copie du dashboard principal..."

if [ -f "$SOURCE_DIR/ocr-premium-dashboard-fixed.html" ]; then
    cp "$SOURCE_DIR/ocr-premium-dashboard-fixed.html" "$DEST_DIR/v10-official/dashboard.html"
    log_success "Dashboard principal copié → v10-official/dashboard.html"
else
    log_warning "Dashboard principal non trouvé"
fi

# ========================================
# 2. COPIER LES TESTS
# ========================================

log_info "Copie des fichiers de test..."

for test_file in "$SOURCE_DIR"/test-ocr-*.html; do
    if [ -f "$test_file" ]; then
        filename=$(basename "$test_file")
        cp "$test_file" "$DEST_DIR/tests/$filename"
        log_success "Test copié → tests/$filename"
    fi
done

# Copier aussi les autres tests liés
if [ -f "$SOURCE_DIR/test-notion-integration.html" ]; then
    cp "$SOURCE_DIR/test-notion-integration.html" "$DEST_DIR/tests/"
    log_success "Test Notion copié"
fi

if [ -f "$SOURCE_DIR/test-drag-drop.html" ]; then
    cp "$SOURCE_DIR/test-drag-drop.html" "$DEST_DIR/tests/"
    log_success "Test Drag & Drop copié"
fi

# ========================================
# 3. COPIER LA DOCUMENTATION
# ========================================

log_info "Copie de la documentation..."

for doc_file in "$SOURCE_DIR"/OCR-*.md; do
    if [ -f "$doc_file" ]; then
        filename=$(basename "$doc_file")
        cp "$doc_file" "$DEST_DIR/docs/$filename"
        log_success "Documentation copiée → docs/$filename"
    fi
done

# ========================================
# 4. CRÉER UNE SAUVEGARDE
# ========================================

log_info "Création d'une sauvegarde de l'ancienne version..."

if [ -f "$SOURCE_DIR/ocr-premium-dashboard.html" ]; then
    cp "$SOURCE_DIR/ocr-premium-dashboard.html" "$DEST_DIR/backup/ocr-dashboard-old-version.html"
    log_success "Ancienne version sauvegardée"
fi

# ========================================
# 5. CRÉER UN FICHIER DE REDIRECTION
# ========================================

log_info "Création du fichier de redirection..."

cat > "$SOURCE_DIR/OCR-MODULE-MOVED.md" << 'EOF'
# ⚠️ MODULE OCR DÉPLACÉ

## 📍 Nouvelle Location

Le module OCR Premium Dashboard v10 a été réorganisé et se trouve maintenant dans :

```
src/frontend/modules/ocr/
```

## 🔗 Accès Rapide

- **Module principal** : `src/frontend/modules/ocr/v10-official/index.html`
- **Documentation** : `src/frontend/modules/ocr/README.md`
- **Configurations** : `src/frontend/modules/ocr/config/`
- **Tests** : `src/frontend/modules/ocr/tests/`

## 📝 Note

Les fichiers originaux sont conservés ici pour compatibilité, mais toute nouvelle développement doit se faire dans la nouvelle structure modulaire.

---
*Migration effectuée le 23 Août 2025*
EOF

log_success "Fichier de redirection créé"

# ========================================
# 6. CRÉER UN FICHIER .ENV.EXAMPLE
# ========================================

log_info "Création du fichier .env.example..."

cat > "$DEST_DIR/.env.example" << 'EOF'
# Configuration OCR Module
# Copier ce fichier en .env et remplir les valeurs

# OpenAI Vision API
VITE_OPENAI_API_KEY=sk-...

# Notion API
VITE_NOTION_API_KEY=secret_...

# Directus
VITE_DIRECTUS_URL=http://localhost:8055
VITE_DIRECTUS_TOKEN=...

# Entreprise par défaut
VITE_DEFAULT_COMPANY=DAINAMICS
EOF

log_success "Fichier .env.example créé"

# ========================================
# 7. GÉNÉRER UN RAPPORT
# ========================================

log_info "Génération du rapport de migration..."

cat > "$DEST_DIR/MIGRATION_REPORT.md" << EOF
# 📊 Rapport de Migration OCR Module

Date: $(date)

## Fichiers Migrés

### Dashboard Principal
- ✅ ocr-premium-dashboard-fixed.html → v10-official/dashboard.html

### Tests ($(ls -1 $DEST_DIR/tests/*.html 2>/dev/null | wc -l) fichiers)
$(ls -1 $DEST_DIR/tests/*.html 2>/dev/null | sed 's/^/- /')

### Documentation ($(ls -1 $DEST_DIR/docs/*.md 2>/dev/null | wc -l) fichiers)
$(ls -1 $DEST_DIR/docs/*.md 2>/dev/null | sed 's/^/- /')

## Structure Finale

\`\`\`
$DEST_DIR/
├── README.md
├── ORGANIZATION_STATUS.md
├── MIGRATION_REPORT.md
├── .env.example
├── v10-official/
│   ├── index.html
│   ├── dashboard.html
│   ├── components/
│   └── styles/
├── config/
│   ├── databases.json
│   └── templates.json
├── tests/
│   └── [fichiers de test]
├── docs/
│   └── [documentation]
└── backup/
    └── [anciennes versions]
\`\`\`

## Prochaines Étapes

1. Extraire le JavaScript inline en modules séparés
2. Créer le wrapper React
3. Tester l'intégration complète
4. Supprimer les anciens fichiers (après validation)

---
*Migration effectuée avec succès*
EOF

log_success "Rapport de migration généré"

# ========================================
# RÉSUMÉ FINAL
# ========================================

echo ""
echo "========================================="
echo -e "${GREEN}✨ Migration Terminée avec Succès !${NC}"
echo "========================================="
echo ""
echo "📁 Nouvelle structure créée dans : $DEST_DIR"
echo ""
echo "📋 Actions effectuées :"
echo "  • Dashboard principal copié"
echo "  • Tests migrés"
echo "  • Documentation copiée"
echo "  • Sauvegarde créée"
echo "  • Fichiers de configuration générés"
echo ""
echo "🚀 Pour utiliser le module :"
echo "  1. cd $DEST_DIR/v10-official"
echo "  2. open index.html"
echo ""
echo "📝 Consultez MIGRATION_REPORT.md pour plus de détails"
echo ""
log_info "N'oubliez pas de configurer le fichier .env avec vos clés API"
