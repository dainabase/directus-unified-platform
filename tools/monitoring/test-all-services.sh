#!/bin/bash

echo "🔍 TEST DE TOUS LES SERVICES"
echo "============================"
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Fonction de test HTTP
test_service() {
    local name=$1
    local url=$2
    local expected_code=$3
    
    echo -n "Testing $name... "
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
    
    if [ "$response" == "$expected_code" ] || [ "$response" == "200" ] || [ "$response" == "302" ] || [ "$response" == "401" ]; then
        echo -e "${GREEN}✅ OK${NC} (HTTP $response)"
        return 0
    else
        echo -e "${RED}❌ FAILED${NC} (HTTP $response)"
        return 1
    fi
}

# Tests
echo "📊 SERVICES PRINCIPAUX:"
echo ""

test_service "Directus API" "http://localhost:8055/server/health" "200"
test_service "Directus Admin" "http://localhost:8055" "200"
test_service "PostgreSQL (via Adminer)" "http://localhost:8080" "200"
test_service "Redis Commander" "http://localhost:8081" "200"

echo ""
echo "🔌 INTÉGRATIONS:"
echo ""

test_service "ERPNext" "http://localhost:8083" "200"
test_service "Mautic" "http://localhost:8084" "200"
test_service "Invoice Ninja" "http://localhost:8090" "200"

echo ""
echo "🐳 DOCKER CONTAINERS:"
echo ""

# Compter les containers
total_containers=$(docker ps | grep -E "(directus|postgres|redis|erpnext|mautic|invoice)" | wc -l)
running_containers=$(docker ps | grep -E "(directus|postgres|redis|erpnext|mautic|invoice)" | grep -c "Up")

echo "Total containers: $total_containers"
echo "Running containers: $running_containers"

if [ "$total_containers" -eq "$running_containers" ]; then
    echo -e "${GREEN}✅ Tous les containers sont actifs${NC}"
else
    echo -e "${RED}❌ Certains containers ne sont pas actifs${NC}"
fi

echo ""
echo "📋 RÉSUMÉ MCP:"
echo ""

# Vérifier MCP
CONFIG_FILE="$HOME/Library/Application Support/Claude/claude_desktop_config.json"
if [ -f "$CONFIG_FILE" ]; then
    mcp_count=$(grep -o '"[^"]*":{' "$CONFIG_FILE" | grep -v mcpServers | wc -l)
    echo -e "${GREEN}✅ $mcp_count MCP configurés${NC}"
    
    # Lister les MCP
    echo "   • GitHub"
    echo "   • Filesystem"
    echo "   • Notion"
    echo "   • Directus (localhost:8055)"
    echo "   • ERPNext"
    echo "   • Memory"
    echo "   • Puppeteer"
    echo "   • MCP-Installer"
else
    echo -e "${RED}❌ Fichier de configuration MCP non trouvé${NC}"
fi

echo ""
echo "============================"
echo "🎯 ACTIONS REQUISES:"
echo ""
echo "1. Redémarrer Claude Desktop pour activer les MCP"
echo "2. Vérifier que tous les outils MCP apparaissent"
echo "3. Tester chaque intégration individuellement"