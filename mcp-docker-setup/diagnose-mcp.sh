#!/bin/bash
# Créer un script de diagnostic : diagnose-mcp.sh

echo "🔍 DIAGNOSTIC MCP DOCKER - $(date)"
echo "========================================"

# 1. Vérifier l'OS
echo -e "\n📊 SYSTÈME D'EXPLOITATION:"
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "OS: macOS"
    CLAUDE_CONFIG="$HOME/Library/Application Support/Claude/claude_desktop_config.json"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "OS: Linux"
    CLAUDE_CONFIG="$HOME/.config/claude/claude_desktop_config.json"
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
    echo "OS: Windows"
    CLAUDE_CONFIG="$APPDATA/Claude/claude_desktop_config.json"
fi

echo "Claude Config Path: $CLAUDE_CONFIG"

# 2. Vérifier si le fichier existe
echo -e "\n📁 VÉRIFICATION FICHIERS:"
if [ -f "$CLAUDE_CONFIG" ]; then
    echo "✅ Fichier config Claude EXISTE"
    echo "Contenu actuel:"
    cat "$CLAUDE_CONFIG" | python3 -m json.tool || cat "$CLAUDE_CONFIG"
else
    echo "❌ Fichier config Claude MANQUANT!"
fi

# 3. Vérifier Docker
echo -e "\n🐳 ÉTAT DOCKER:"
docker --version
docker compose version
docker ps --format "table {{.Names}}\t{{.Status}}" | head -10

# 4. Vérifier les containers MCP
echo -e "\n🔌 CONTAINERS MCP:"
docker ps -a | grep -E "mcp|directus" || echo "Aucun container MCP trouvé"

# 5. Vérifier les images
echo -e "\n📦 IMAGES MCP:"
docker images | grep -E "mcp|ckreiling" || echo "Aucune image MCP trouvée"

# 6. Vérifier les réseaux
echo -e "\n🌐 RÉSEAUX DOCKER:"
docker network ls | grep directus || echo "Réseau directus non trouvé"

# 7. Vérifier les fichiers du projet
echo -e "\n📂 STRUCTURE PROJET:"
ls -la docker-compose*.yml 2>/dev/null || echo "docker-compose.yml manquant"
ls -la mcp/ 2>/dev/null || echo "Dossier mcp/ manquant"
ls -la scripts/install-mcp-docker.sh 2>/dev/null || echo "Script installation manquant"

# 8. Tester si Claude est installé
echo -e "\n💻 CLAUDE DESKTOP:"
if command -v claude &> /dev/null; then
    echo "✅ Claude CLI détecté"
    claude --version 2>/dev/null || echo "Version non disponible"
else
    echo "⚠️ Claude CLI non détecté (normal si GUI uniquement)"
fi

# 9. Processus Claude
echo -e "\n🔄 PROCESSUS CLAUDE:"
ps aux | grep -i claude | grep -v grep || echo "Aucun processus Claude actif"