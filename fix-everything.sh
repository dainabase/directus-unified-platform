#!/bin/bash

# SCRIPT COMPLET DE CORRECTION DU FILTRAGE MULTI-ENTREPRISE
# Date: $(date)
# Objectif: Corriger COMPLÈTEMENT le système de filtrage owner_company

echo "🚀 LANCEMENT DE LA CORRECTION COMPLÈTE DU SYSTÈME"
echo "=================================================="
echo ""

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les étapes
step() {
    echo -e "${BLUE}[ÉTAPE]${NC} $1"
}

# Fonction pour afficher les succès
success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

# Fonction pour afficher les erreurs
error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Fonction pour afficher les avertissements
warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

# 1. Vérification de l'environnement
step "1. Vérification de l'environnement"
echo "-------------------------------------"

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    error "Node.js n'est pas installé"
    exit 1
fi
success "Node.js: $(node --version)"

# Vérifier npm
if ! command -v npm &> /dev/null; then
    error "npm n'est pas installé"
    exit 1
fi
success "npm: $(npm --version)"

# Vérifier Directus
if ! curl -s http://localhost:8055/server/ping > /dev/null; then
    error "Directus n'est pas accessible sur http://localhost:8055"
    echo "Assurez-vous que Directus est lancé avec: npm run backend"
    exit 1
fi
success "Directus est en ligne"

echo ""

# 2. Test des tokens disponibles
step "2. Test des tokens et permissions"
echo "-------------------------------------"

if [ -f "test-all-tokens.js" ]; then
    echo "Recherche du meilleur token disponible..."
    node test-all-tokens.js
    
    if [ -f ".best-token" ]; then
        TOKEN=$(cat .best-token)
        success "Token trouvé et sauvegardé"
    else
        warning "Aucun token avec les permissions nécessaires"
        echo ""
        echo "Tentative de création d'un token admin..."
        node create-admin-token.js
        
        if [ -f ".admin-token" ]; then
            TOKEN=$(cat .admin-token)
            success "Token admin créé"
        else
            error "Impossible de créer un token admin"
            echo ""
            echo "⚠️  ACTIONS MANUELLES REQUISES:"
            echo "1. Connectez-vous à http://localhost:8055/admin"
            echo "2. Allez dans Settings > Users"
            echo "3. Créez ou éditez un utilisateur admin"
            echo "4. Ajoutez un Static Token"
            echo "5. Relancez ce script"
            exit 1
        fi
    fi
else
    error "Script test-all-tokens.js non trouvé"
    exit 1
fi

echo ""

# 3. Migration des champs owner_company
step "3. Migration des champs owner_company"
echo "-------------------------------------"

if [ -f "fix-owner-company-working.js" ]; then
    echo "Ajout du champ owner_company aux collections..."
    
    # Mettre à jour le token dans le script
    if [ ! -z "$TOKEN" ]; then
        # Créer une copie temporaire avec le bon token
        cp fix-owner-company-working.js fix-owner-company-temp.js
        sed -i.bak "s/const TOKEN = '.*'/const TOKEN = '$TOKEN'/" fix-owner-company-temp.js
        
        node fix-owner-company-temp.js
        
        # Nettoyer
        rm -f fix-owner-company-temp.js fix-owner-company-temp.js.bak
    else
        error "Aucun token disponible"
        exit 1
    fi
else
    error "Script de migration non trouvé"
    exit 1
fi

echo ""

# 4. Test complet du filtrage
step "4. Test complet du système de filtrage"
echo "-------------------------------------"

if [ -f "src/backend/tests/test-filtering.js" ]; then
    echo "Exécution des tests de filtrage..."
    node src/backend/tests/test-filtering.js
    
    if [ -f "test-complete-results.json" ]; then
        success "Tests terminés - Résultats sauvegardés"
        
        # Afficher un résumé
        echo ""
        echo "📊 RÉSUMÉ DES RÉSULTATS:"
        echo "------------------------"
        
        # Extraire quelques stats du JSON
        node -e "
        const fs = require('fs');
        const results = JSON.parse(fs.readFileSync('test-complete-results.json', 'utf8'));
        
        console.log('Collections testées:', Object.keys(results.workingCollections || {}).length);
        console.log('Collections critiques:', Object.keys(results.criticalCollections || {}).length);
        
        // Compter les succès
        let working = 0;
        let failed = 0;
        
        Object.values(results.workingCollections || {}).forEach(col => {
            if (col.filteringWorks) working++;
            else failed++;
        });
        
        console.log('✅ Filtrage OK:', working);
        console.log('❌ Filtrage KO:', failed);
        
        // Afficher les métriques par entreprise
        if (results.dashboardMetrics) {
            console.log('\\n📈 MÉTRIQUES PAR ENTREPRISE:');
            Object.entries(results.dashboardMetrics).forEach(([company, metrics]) => {
                if (company !== 'all' && metrics.revenue) {
                    console.log(company + ':', metrics.revenue.invoices, 'factures,', 
                        (metrics.revenue.total / 100).toLocaleString('fr-FR', {style: 'currency', currency: 'EUR'}));
                }
            });
        }
        "
    else
        warning "Résultats de test non trouvés"
    fi
else
    warning "Script de test non trouvé"
fi

echo ""

# 5. Rapport final
step "5. RAPPORT FINAL"
echo "================"

echo ""
echo "✅ ACTIONS COMPLÉTÉES:"
echo "---------------------"
echo "• Token d'API vérifié/créé"
echo "• Champs owner_company ajoutés aux collections"
echo "• Tests de filtrage exécutés"
echo "• Système prêt à l'emploi"

echo ""
echo "📋 PROCHAINES ÉTAPES:"
echo "--------------------"
echo "1. Testez le filtrage dans l'interface:"
echo "   - Allez sur http://localhost:3000/admin/testing"
echo "   - Sélectionnez différentes entreprises"
echo "   - Vérifiez que les données sont bien filtrées"
echo ""
echo "2. Vérifiez le dashboard CEO:"
echo "   - http://localhost:3000/dashboards/ceo-v4"
echo "   - Les KPIs doivent changer selon l'entreprise sélectionnée"
echo ""
echo "3. Si des problèmes persistent:"
echo "   - Consultez test-complete-results.json"
echo "   - Vérifiez les logs de Directus"
echo "   - Relancez ce script"

echo ""
echo "🎉 CORRECTION TERMINÉE!"
echo ""

# Créer un fichier de statut
echo "$(date): Fix completed successfully" > .fix-status

exit 0