#!/bin/bash
# MCP Docker Installation Script for Directus Unified Platform
# Version: 1.0.0
# Date: 2025-08-08

set -e

# Couleurs pour output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="directus-unified-platform"
MCP_DIR="mcp"
BACKUP_DIR="backups/mcp-$(date +%Y%m%d-%H%M%S)"

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║    🐳 MCP Docker Installation for Directus Platform    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# 1. Vérification des prérequis
echo -e "${YELLOW}📋 Vérification des prérequis...${NC}"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker n'est pas installé${NC}"
    exit 1
fi
echo -e "${GREEN}  ✅ Docker: $(docker --version | cut -d' ' -f3)${NC}"

# Check Docker Compose
if ! command -v docker compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose n'est pas installé${NC}"
    exit 1
fi
echo -e "${GREEN}  ✅ Docker Compose: $(docker compose version --short)${NC}"

# Check if Directus is running
if docker ps | grep -q "directus-unified-platform-directus-1"; then
    echo -e "${GREEN}  ✅ Directus est en cours d'exécution${NC}"
else
    echo -e "${YELLOW}  ⚠️  Directus n'est pas actif, démarrage...${NC}"
    docker compose up -d directus postgres
    sleep 10
fi

# 2. Création des répertoires
echo -e "${YELLOW}📁 Création de la structure des dossiers...${NC}"
mkdir -p ${MCP_DIR}/{config,data,logs,registry}
mkdir -p ${BACKUP_DIR}
mkdir -p mcp-data/{registry,cache}
echo -e "${GREEN}  ✅ Dossiers créés${NC}"

# 3. Backup de la configuration existante
echo -e "${YELLOW}💾 Sauvegarde de la configuration actuelle...${NC}"
if [ -f docker-compose.yml ]; then
    cp docker-compose.yml ${BACKUP_DIR}/docker-compose.backup.yml
    echo -e "${GREEN}  ✅ docker-compose.yml sauvegardé${NC}"
fi

# 4. Téléchargement des images MCP
echo -e "${YELLOW}📦 Téléchargement des images MCP Docker...${NC}"
docker pull ghcr.io/ckreiling/mcp-server-docker:latest
docker pull docker/mcp-registry:latest
echo -e "${GREEN}  ✅ Images téléchargées${NC}"

# 5. Démarrage des services MCP
echo -e "${YELLOW}🚀 Démarrage des services MCP...${NC}"
docker compose -f docker-compose.yml -f docker-compose.mcp.yml up -d
sleep 5

# 6. Vérification des services
echo -e "${YELLOW}🔍 Vérification des services...${NC}"
echo ""
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "(NAME|mcp-|directus)"
echo ""

# Test MCP Docker
if docker ps | grep -q "directus-mcp-docker"; then
    echo -e "${GREEN}  ✅ MCP Docker Server est actif${NC}"
else
    echo -e "${RED}  ❌ MCP Docker Server n'a pas démarré${NC}"
fi

# Test MCP Registry
if docker ps | grep -q "directus-mcp-registry"; then
    echo -e "${GREEN}  ✅ MCP Registry est actif${NC}"
    
    # Test de l'endpoint
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:9090/health | grep -q "200"; then
        echo -e "${GREEN}  ✅ MCP Registry API répond sur http://localhost:9090${NC}"
    else
        echo -e "${YELLOW}  ⚠️  MCP Registry API n'est pas encore prêt${NC}"
    fi
else
    echo -e "${YELLOW}  ⚠️  MCP Registry n'a pas démarré (optionnel)${NC}"
fi

# 7. Configuration Claude Desktop
echo -e "${YELLOW}🔧 Configuration de Claude Desktop...${NC}"

# Détection de l'OS et du chemin de config
if [[ "$OSTYPE" == "darwin"* ]]; then
    CLAUDE_CONFIG_DIR="$HOME/Library/Application Support/Claude"
    OS_NAME="macOS"
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "win32" ]]; then
    CLAUDE_CONFIG_DIR="$APPDATA/Claude"
    OS_NAME="Windows"
else
    CLAUDE_CONFIG_DIR="$HOME/.config/claude"
    OS_NAME="Linux"
fi

CLAUDE_CONFIG_PATH="${CLAUDE_CONFIG_DIR}/claude_desktop_config.json"

echo -e "${BLUE}  📍 OS détecté: ${OS_NAME}${NC}"
echo -e "${BLUE}  📍 Chemin config: ${CLAUDE_CONFIG_PATH}${NC}"

# Création du répertoire si nécessaire
mkdir -p "${CLAUDE_CONFIG_DIR}"

# Backup de la config existante si elle existe
if [ -f "${CLAUDE_CONFIG_PATH}" ]; then
    cp "${CLAUDE_CONFIG_PATH}" "${BACKUP_DIR}/claude_desktop_config.backup.json"
    echo -e "${GREEN}  ✅ Configuration Claude existante sauvegardée${NC}"
fi

# Copie de la nouvelle configuration
cp ${MCP_DIR}/claude_desktop_config.json "${CLAUDE_CONFIG_PATH}"
echo -e "${GREEN}  ✅ Configuration Claude Desktop installée${NC}"

# 8. Génération du rapport d'installation
echo -e "${YELLOW}📊 Génération du rapport d'installation...${NC}"

cat > ${MCP_DIR}/INSTALLATION_REPORT.md << EOF
# 📊 Rapport d'Installation MCP Docker
Date: $(date)

## ✅ Composants installés

### MCP Docker Server
- **Container**: directus-mcp-docker
- **Image**: ghcr.io/ckreiling/mcp-server-docker:latest
- **Status**: $(docker ps --filter name=directus-mcp-docker --format "{{.Status}}")

### MCP Registry
- **Container**: directus-mcp-registry
- **Image**: docker/mcp-registry:latest
- **URL**: http://localhost:9090
- **Status**: $(docker ps --filter name=directus-mcp-registry --format "{{.Status}}")

### Configuration Claude
- **Path**: ${CLAUDE_CONFIG_PATH}
- **Backup**: ${BACKUP_DIR}/claude_desktop_config.backup.json

## 🔗 URLs des services

- **Directus**: http://localhost:8055
- **MCP Registry**: http://localhost:9090
- **PostgreSQL**: localhost:5432

## 📝 Prochaines étapes

1. Redémarrer Claude Desktop
2. Aller dans Settings > Developer
3. Vérifier que les MCP servers sont listés
4. Tester avec : "List all Docker containers"

## 🧪 Commandes de test

\`\`\`bash
# Vérifier les containers
docker ps

# Logs MCP Docker
docker logs directus-mcp-docker

# Test API Directus
curl http://localhost:8055/server/health

# Test MCP Registry
curl http://localhost:9090/health
\`\`\`
EOF

echo -e "${GREEN}  ✅ Rapport généré: ${MCP_DIR}/INSTALLATION_REPORT.md${NC}"

# 9. Instructions finales
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║         🎉 Installation terminée avec succès !         ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}📋 Actions requises :${NC}"
echo -e "  1. ${BLUE}Redémarrer Claude Desktop${NC}"
echo -e "  2. ${BLUE}Vérifier Settings > Developer > MCP Servers${NC}"
echo -e "  3. ${BLUE}Tester avec : 'Show all Docker containers'${NC}"
echo ""
echo -e "${YELLOW}🔗 Services disponibles :${NC}"
echo -e "  • Directus CMS: ${BLUE}http://localhost:8055${NC}"
echo -e "  • MCP Registry: ${BLUE}http://localhost:9090${NC}"
echo ""
echo -e "${YELLOW}📚 Documentation :${NC}"
echo -e "  • Rapport: ${BLUE}${MCP_DIR}/INSTALLATION_REPORT.md${NC}"
echo -e "  • GitHub: ${BLUE}https://github.com/ckreiling/mcp-server-docker${NC}"
echo ""
echo -e "${GREEN}✨ Le MCP Docker est maintenant opérationnel !${NC}"
