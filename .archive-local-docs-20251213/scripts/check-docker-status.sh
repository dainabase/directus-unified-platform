#!/bin/bash

echo "🔍 DIAGNOSTIC SYSTÈME DOCKER ET DIRECTUS"
echo "========================================"
echo ""

# 1. Vérifier Docker
echo "📦 Docker Version:"
docker --version
docker compose version

echo ""
echo "🐳 Conteneurs actifs:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "💾 Utilisation disque Docker:"
docker system df

# 2. Vérifier Directus
echo ""
echo "🎯 Status Directus:"
curl -s http://localhost:8055/server/health || echo "❌ Directus non accessible"

# 3. Vérifier PostgreSQL
echo ""
echo "🗄️ PostgreSQL:"
docker exec directus-unified-platform-postgres-1 psql -U directus -c "SELECT version();" 2>/dev/null || echo "PostgreSQL container: directus-unified-platform-postgres-1"

# 4. Lister les MCP actuellement installés
echo ""
echo "🔌 MCP Actuellement configurés:"
ls -la ~/Library/Application\ Support/Claude/ 2>/dev/null || ls -la ~/.config/claude/ 2>/dev/null || echo "Dossier Claude non trouvé"

# 5. Vérifier Node.js
echo ""
echo "📦 Node.js Version:"
node --version
npm --version

echo ""
echo "✅ Diagnostic terminé"