#!/bin/bash
set -e

echo "🔧 RÉPARATION CONFIGURATION MCP DOCKER"
echo "======================================"

# Détection OS
if [[ "$OSTYPE" == "darwin"* ]]; then
    CLAUDE_DIR="$HOME/Library/Application Support/Claude"
    OS="macOS"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    CLAUDE_DIR="$HOME/.config/claude"
    OS="Linux"
else
    CLAUDE_DIR="$APPDATA/Claude"
    OS="Windows"
fi

CLAUDE_CONFIG="$CLAUDE_DIR/claude_desktop_config.json"

echo "OS détecté: $OS"
echo "Chemin config: $CLAUDE_CONFIG"

# Créer le répertoire si nécessaire
mkdir -p "$CLAUDE_DIR"

# Backup de l'ancienne config si elle existe
if [ -f "$CLAUDE_CONFIG" ]; then
    cp "$CLAUDE_CONFIG" "$CLAUDE_CONFIG.backup.$(date +%Y%m%d-%H%M%S)"
    echo "✅ Backup créé"
fi

# Lire la configuration actuelle
echo -e "\n📋 Configuration actuelle:"
cat "$CLAUDE_CONFIG" | python3 -m json.tool | head -20

# Ajouter Docker MCP à la configuration existante
echo -e "\n🔧 Ajout de Docker MCP à votre configuration..."

# Utiliser python pour modifier le JSON proprement
python3 << 'EOF'
import json
import sys

config_path = sys.argv[1] if len(sys.argv) > 1 else "/Users/jean-mariedelaunay/Library/Application Support/Claude/claude_desktop_config.json"

# Lire la config existante
with open(config_path, 'r') as f:
    config = json.load(f)

# S'assurer que mcpServers existe
if 'mcpServers' not in config:
    config['mcpServers'] = {}

# Ajouter Docker MCP
config['mcpServers']['docker'] = {
    "command": "npx",
    "args": [
        "-y",
        "@modelcontextprotocol/server-docker"
    ],
    "env": {
        "DOCKER_HOST": "unix:///var/run/docker.sock"
    }
}

# Ajouter Docker avec plus d'options
config['mcpServers']['docker-advanced'] = {
    "command": "npx",
    "args": [
        "-y",
        "@modelcontextprotocol/server-docker",
        "--verbose"
    ],
    "env": {
        "DOCKER_HOST": "unix:///var/run/docker.sock",
        "DEBUG": "true"
    }
}

# Sauvegarder
with open(config_path, 'w') as f:
    json.dump(config, f, indent=2)

print("✅ Configuration mise à jour avec Docker MCP")
EOF $CLAUDE_CONFIG

# Vérifier la nouvelle configuration
echo -e "\n📋 Nouvelle configuration (extrait):"
cat "$CLAUDE_CONFIG" | python3 -m json.tool | grep -A 10 "docker" || echo "Erreur lors de la lecture"

# Vérifier que npx est disponible
echo -e "\n🔍 Vérification de NPX..."
if ! command -v npx &> /dev/null; then
    echo "❌ npx n'est pas installé. Installation..."
    npm install -g npx
else
    echo "✅ npx est disponible: $(which npx)"
fi

# Tester si le package MCP Docker est installable
echo -e "\n📦 Test du package MCP Docker..."
npx -y @modelcontextprotocol/server-docker --version 2>/dev/null || echo "Package sera installé au premier lancement"

# Instructions finales
echo -e "\n✅ CONFIGURATION DOCKER MCP AJOUTÉE!"
echo "======================================"
echo ""
echo "📋 ACTIONS REQUISES:"
echo ""
echo "1. ⚠️  FERMEZ COMPLÈTEMENT Claude Desktop"
echo "   - Sur macOS: Cmd+Q ou menu Claude > Quit Claude"
echo "   - Ne pas juste fermer la fenêtre!"
echo ""
echo "2. 🔄 ATTENDEZ 5 secondes"
echo ""
echo "3. 🚀 RELANCEZ Claude Desktop"
echo ""
echo "4. 🔍 VÉRIFIEZ dans Settings > Developer"
echo "   - Vous devriez voir 'docker' et 'docker-advanced'"
echo "   - Les autres MCP (github, notion, etc) restent intacts"
echo ""
echo "5. 🧪 TESTEZ en demandant à Claude:"
echo '   "Utilise Docker pour lister les containers"'
echo ""
echo "Si ça ne fonctionne pas, exécutez: ./verify-mcp-final.sh"