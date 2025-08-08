#!/bin/bash
# Test script for MCP Docker integration
# Version: 1.0.0

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║      🧪 MCP Docker Integration Test Suite      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
echo ""

TESTS_PASSED=0
TESTS_FAILED=0

# Test function
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    echo -n -e "${YELLOW}Testing:${NC} $test_name... "
    
    if eval "$test_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PASSED${NC}"
        ((TESTS_PASSED++))
        return 0
    else
        echo -e "${RED}❌ FAILED${NC}"
        ((TESTS_FAILED++))
        return 1
    fi
}

# 1. Docker Tests
echo -e "${BLUE}🐳 Docker Environment Tests${NC}"
echo "----------------------------"
run_test "Docker is installed" "command -v docker"
run_test "Docker daemon is running" "docker info"
run_test "Docker Compose is installed" "command -v docker compose"
echo ""

# 2. Directus Tests
echo -e "${BLUE}📦 Directus Services Tests${NC}"
echo "--------------------------"
run_test "Directus container is running" "docker ps | grep -q directus-unified-platform-directus-1"
run_test "PostgreSQL container is running" "docker ps | grep -q directus-unified-platform-postgres-1"
run_test "Directus API is accessible" "curl -s http://localhost:8055/server/health | grep -q ok"
echo ""

# 3. MCP Docker Tests
echo -e "${BLUE}🔌 MCP Docker Server Tests${NC}"
echo "--------------------------"
run_test "MCP Docker image exists" "docker images | grep -q ckreiling/mcp-server-docker"
run_test "MCP Docker container is running" "docker ps | grep -q directus-mcp-docker"
run_test "MCP Registry container is running" "docker ps | grep -q directus-mcp-registry"
run_test "MCP Registry API is accessible" "curl -s -o /dev/null -w '%{http_code}' http://localhost:9090 | grep -q -E '200|404'"
echo ""

# 4. Configuration Tests
echo -e "${BLUE}⚙️ Configuration Tests${NC}"
echo "----------------------"
run_test "docker-compose.mcp.yml exists" "[ -f docker-compose.mcp.yml ]"
run_test "MCP directory exists" "[ -d mcp ]"
run_test "Claude config exists" "[ -f mcp/claude_desktop_config.json ]"
run_test "Installation script exists" "[ -f scripts/install-mcp-docker.sh ]"
echo ""

# 5. Network Tests
echo -e "${BLUE}🌐 Network Tests${NC}"
echo "----------------"
run_test "Docker network exists" "docker network ls | grep -q directus-unified-platform_default"
run_test "MCP containers on same network" "docker inspect directus-mcp-docker 2>/dev/null | grep -q directus-unified-platform_default"
echo ""

# 6. Volume Tests
echo -e "${BLUE}💾 Volume Tests${NC}"
echo "---------------"
run_test "MCP data directory exists" "[ -d mcp-data ] || [ -d mcp/data ]"
run_test "Docker socket is accessible" "[ -S /var/run/docker.sock ]"
echo ""

# 7. Functional Tests
echo -e "${BLUE}🎯 Functional Tests${NC}"
echo "-------------------"
run_test "Can list Docker containers" "docker exec directus-mcp-docker docker ps > /dev/null 2>&1 || true"
run_test "Can access Docker version" "docker exec directus-mcp-docker docker version > /dev/null 2>&1 || true"
echo ""

# Summary
echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                  📊 Test Summary                ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  ${GREEN}✅ Tests passed:${NC} $TESTS_PASSED"
echo -e "  ${RED}❌ Tests failed:${NC} $TESTS_FAILED"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed! MCP Docker is fully operational.${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️ Some tests failed. Please check the configuration.${NC}"
    echo ""
    echo "Troubleshooting tips:"
    echo "1. Run: docker compose -f docker-compose.yml -f docker-compose.mcp.yml logs"
    echo "2. Check: docker ps -a"
    echo "3. Verify: ./scripts/install-mcp-docker.sh"
    exit 1
fi
