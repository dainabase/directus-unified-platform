#!/bin/bash

# Script de déploiement du proxy Notion
# Usage: ./deploy-notion-proxy.sh [user@server:/path/to/webroot]

echo "🚀 Déploiement du proxy Notion API"
echo "=================================="

# Vérifier les arguments
if [ $# -eq 0 ]; then
    echo "❌ Erreur: Spécifiez la destination"
    echo "Usage: $0 user@server:/path/to/webroot"
    echo "Exemple: $0 ubuntu@monserveur.com:/var/www/html"
    exit 1
fi

DESTINATION=$1
API_DIR="${DESTINATION}/api"

# Couleurs pour l'output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}📦 Préparation des fichiers...${NC}"

# Créer un dossier temporaire
TEMP_DIR=$(mktemp -d)
mkdir -p $TEMP_DIR/api

# Copier les fichiers nécessaires
cp api/notion-proxy.php $TEMP_DIR/api/
cp api/config-notion.php $TEMP_DIR/api/
cp api/README.md $TEMP_DIR/api/

# Créer un fichier .htaccess pour Apache
cat > $TEMP_DIR/api/.htaccess << 'EOF'
# Protection du fichier de config
<Files "config-notion.php">
    Order Allow,Deny
    Deny from all
</Files>

# Headers CORS
Header set Access-Control-Allow-Origin "*"
Header set Access-Control-Allow-Methods "POST, GET, OPTIONS"
Header set Access-Control-Allow-Headers "Content-Type, Authorization"

# Rewrite pour URL propre (optionnel)
RewriteEngine On
RewriteRule ^notion-proxy$ notion-proxy.php [L]
EOF

echo -e "${YELLOW}📤 Envoi vers le serveur...${NC}"

# Extraire l'hôte et le chemin
IFS=':' read -r HOST PATH <<< "$DESTINATION"

# Créer le répertoire API sur le serveur
ssh $HOST "mkdir -p $PATH/api"

# Copier les fichiers
scp -r $TEMP_DIR/api/* $HOST:$PATH/api/

# Définir les permissions
echo -e "${YELLOW}🔒 Configuration des permissions...${NC}"
ssh $HOST << EOF
    chmod 755 $PATH/api/notion-proxy.php
    chmod 600 $PATH/api/config-notion.php
    chmod 644 $PATH/api/.htaccess
    chmod 644 $PATH/api/README.md
EOF

# Test de l'installation
echo -e "${YELLOW}🧪 Test du proxy...${NC}"
DOMAIN=$(echo $HOST | cut -d'@' -f2)
TEST_URL="https://$DOMAIN/api/notion-proxy.php"

# Attendre un peu pour que le serveur soit prêt
sleep 2

# Tester avec curl
if curl -s -o /dev/null -w "%{http_code}" -X OPTIONS "$TEST_URL" | grep -q "200"; then
    echo -e "${GREEN}✅ Proxy déployé avec succès!${NC}"
    echo -e "${GREEN}URL: $TEST_URL${NC}"
else
    echo -e "${YELLOW}⚠️  Le proxy est déployé mais le test HTTPS a échoué${NC}"
    echo "Essayez avec HTTP: http://$DOMAIN/api/notion-proxy.php"
fi

# Nettoyer
rm -rf $TEMP_DIR

echo ""
echo "📋 Prochaines étapes:"
echo "1. Vérifiez que PHP est installé sur le serveur (PHP 7.4+)"
echo "2. Assurez-vous que l'extension CURL est activée"
echo "3. Si vous utilisez Nginx, configurez les règles de réécriture"
echo "4. Testez l'intégration depuis: /superadmin/finance/setup-notion.html"
echo ""
echo "✨ Déploiement terminé!"