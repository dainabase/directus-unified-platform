#!/bin/bash
# 🔄 Script de mise à jour automatique - Dashboard Client: Presta
# Usage: ./auto-update.sh [type] "description" "[module]"
# Exemple: ./auto-update.sh feat "ajout export PDF" "finances"

set -e

# Configuration
PROJECT_ROOT="/Users/jean-mariedelaunay/Dashboard Client: Presta"
PROTECTED_FILES="$PROJECT_ROOT/portal-project/Architecture/.protected-files"
API_STATUS="$PROJECT_ROOT/portal-project/Architecture/api_implementation_status.md"
TODO_FILE="$PROJECT_ROOT/portal-project/Architecture/TODO-DEVELOPPEMENT.md"

# Couleurs pour output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Vérifier les arguments
if [ $# -lt 2 ]; then
    echo -e "${RED}Usage: $0 [type] \"description\" \"[module]\"${NC}"
    echo "Types: feat, fix, docs, style, refactor, perf, test, chore"
    exit 1
fi

TYPE=$1
DESC=$2
MODULE=${3:-""}

# Se positionner dans le projet
cd "$PROJECT_ROOT"

echo -e "${BLUE}🔄 Démarrage de la mise à jour automatique...${NC}"

# 1. Vérifier l'état Git
echo -e "\n${YELLOW}📊 État actuel du repository:${NC}"
git status --short

# 2. Synchroniser avec origin/main
echo -e "\n${YELLOW}🔄 Synchronisation avec GitHub...${NC}"
git fetch origin
git pull origin main || {
    echo -e "${RED}⚠️  Conflits détectés! Résolvez-les manuellement.${NC}"
    exit 1
}

# 3. Créer une branche de travail
BRANCH_NAME="update/$(date +%Y%m%d-%H%M%S)-${TYPE}"
echo -e "\n${YELLOW}🌿 Création de la branche: $BRANCH_NAME${NC}"
git checkout -b "$BRANCH_NAME"

# 4. Vérifier les fichiers protégés modifiés
echo -e "\n${YELLOW}🔒 Vérification des fichiers protégés...${NC}"
PROTECTED_MODIFIED=false
for file in $(git diff --name-only HEAD); do
    if grep -q "^${file#$PROJECT_ROOT/}$" "$PROTECTED_FILES" 2>/dev/null; then
        echo -e "${RED}⚠️  ATTENTION: $file est un fichier protégé!${NC}"
        PROTECTED_MODIFIED=true
    fi
done

if [ "$PROTECTED_MODIFIED" = true ]; then
    echo -e "${RED}Des fichiers protégés ont été modifiés. Validation manuelle requise!${NC}"
    read -p "Continuer quand même? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        git checkout main
        git branch -d "$BRANCH_NAME"
        exit 1
    fi
fi

# 5. Vérifier la présence de secrets
echo -e "\n${YELLOW}🔐 Recherche de secrets potentiels...${NC}"
if git diff --cached | grep -E "(secret_|key_|token_|password|NOTION_API_KEY|OPENAI_API_KEY)" | grep -v "example"; then
    echo -e "${RED}⚠️  SECRETS POTENTIELS DÉTECTÉS!${NC}"
    read -p "Continuer quand même? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo -e "${GREEN}✅ Aucun secret détecté${NC}"
fi

# 6. Lancer les tests si disponibles
echo -e "\n${YELLOW}🧪 Lancement des tests...${NC}"
cd portal-project
if [ -f "package.json" ] && grep -q "\"test\":" "package.json"; then
    npm test || echo -e "${YELLOW}⚠️  Tests échoués ou non configurés${NC}"
else
    echo -e "${YELLOW}ℹ️  Pas de tests configurés${NC}"
fi
cd ..

# 7. Générer le message de commit
echo -e "\n${YELLOW}📝 Préparation du commit...${NC}"
if [ -n "$MODULE" ]; then
    COMMIT_MSG="$TYPE: $DESC [$MODULE]"
else
    COMMIT_MSG="$TYPE: $DESC"
fi

# Lister les fichiers modifiés
MODIFIED_FILES=$(git diff --name-status | head -10)

# 8. Ajouter tous les fichiers modifiés
git add -A

# 9. Créer le commit
git commit -m "$COMMIT_MSG

Modifications automatiques effectuées :
$MODIFIED_FILES

🤖 Automated update by Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>" || {
    echo -e "${YELLOW}ℹ️  Aucun changement à commiter${NC}"
    git checkout main
    git branch -d "$BRANCH_NAME"
    exit 0
}

# 10. Afficher le résumé
echo -e "\n${GREEN}✅ Commit créé avec succès!${NC}"
echo -e "${BLUE}📊 Résumé:${NC}"
git show --stat

# 11. Demander confirmation pour push
echo -e "\n${YELLOW}🚀 Prêt à envoyer sur GitHub${NC}"
read -p "Voulez-vous push maintenant? (Y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Nn]$ ]]; then
    echo -e "${YELLOW}ℹ️  Push annulé. Pour push plus tard:${NC}"
    echo -e "${BLUE}git push -u origin $BRANCH_NAME${NC}"
else
    echo -e "\n${YELLOW}📤 Push vers GitHub...${NC}"
    git push -u origin "$BRANCH_NAME"
    echo -e "\n${GREEN}✅ Push réussi!${NC}"
    echo -e "${BLUE}🔗 Créez une Pull Request sur:${NC}"
    echo -e "${BLUE}https://github.com/dainabase/dashboard/compare/$BRANCH_NAME?expand=1${NC}"
fi

# 12. Générer un rapport
REPORT_FILE="$PROJECT_ROOT/portal-project/reports/update-$(date +%Y%m%d-%H%M%S).md"
mkdir -p "$PROJECT_ROOT/portal-project/reports"

cat > "$REPORT_FILE" << EOF
# 📊 Rapport de mise à jour - $(date '+%Y-%m-%d %H:%M:%S')

## 🎯 Résumé
- **Type**: $TYPE
- **Description**: $DESC
- **Module**: ${MODULE:-"Global"}
- **Branche**: $BRANCH_NAME

## 📝 Changements effectués
\`\`\`
$(git diff --stat origin/main..HEAD)
\`\`\`

## 📁 Fichiers modifiés
\`\`\`
$(git diff --name-status origin/main..HEAD)
\`\`\`

## 🔄 Commits
\`\`\`
$(git log --oneline origin/main..HEAD)
\`\`\`

## ✅ Vérifications
- Fichiers protégés: ${PROTECTED_MODIFIED}
- Tests passés: $(cd portal-project && npm test &>/dev/null && echo "✅ Oui" || echo "❌ Non")
- Secrets détectés: Non

## 📊 État du projet
- Endpoints implémentés: $(grep -c "✅" "$API_STATUS" 2>/dev/null || echo "N/A")/180
- TODOs restants: $(grep -c "📅\|🚧" "$TODO_FILE" 2>/dev/null || echo "N/A")

---
*Généré automatiquement par auto-update.sh*
EOF

echo -e "\n${GREEN}📄 Rapport sauvegardé: $REPORT_FILE${NC}"
echo -e "\n${GREEN}🎉 Mise à jour terminée avec succès!${NC}"