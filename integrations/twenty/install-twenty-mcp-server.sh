#!/bin/bash

echo "🚀 Installation du MCP Server Twenty pour Claude Desktop"
echo "========================================================"

# Configuration
MCP_CONFIG_DIR="$HOME/Library/Application Support/Claude"
TWENTY_API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5MjdkYjBjMy1jNjVhLTRiMGQtYmM0Mi03N2NiNTNjNTRmMGIiLCJ0eXBlIjoiQVBJX0tFWSIsIndvcmtzcGFjZUlkIjoiOTI3ZGIwYzMtYzY1YS00YjBkLWJjNDItNzdjYjUzYzU0ZjBiIiwiaWF0IjoxNzUzOTg1MzQ4LCJleHAiOjQ5MDc1ODUzNDcsImp0aSI6IjhmNmI5YTczLWRlNmMtNDlkMC1iYmI2LWVmMzQ1ZWVmMjMyYiJ9.Mx7IQOHMsC9g_7oCODpQJRoQCHTsvcDcH19gzjNCt2g"
TWENTY_URL="http://localhost:3000"

# 1. Installer le MCP server Twenty via npm
echo "📦 Installation du package @twentyhq/mcp-server..."
npm install -g @twentyhq/mcp-server

# 2. Créer le fichier de configuration Claude Desktop
echo "📝 Configuration de Claude Desktop..."

# Vérifier si le fichier claude_desktop_config.json existe
if [ -f "$MCP_CONFIG_DIR/claude_desktop_config.json" ]; then
    echo "⚠️  Un fichier de configuration existe déjà. Création d'une sauvegarde..."
    cp "$MCP_CONFIG_DIR/claude_desktop_config.json" "$MCP_CONFIG_DIR/claude_desktop_config.json.backup"
fi

# Créer ou mettre à jour la configuration
cat > "$MCP_CONFIG_DIR/claude_desktop_config.json" << EOF
{
  "mcpServers": {
    "twenty": {
      "command": "npx",
      "args": ["@twentyhq/mcp-server"],
      "env": {
        "TWENTY_API_KEY": "$TWENTY_API_KEY",
        "TWENTY_API_URL": "$TWENTY_URL/graphql"
      }
    }
  }
}
EOF

echo "✅ Configuration créée dans: $MCP_CONFIG_DIR/claude_desktop_config.json"

# 3. Vérifier l'installation
echo ""
echo "🔍 Vérification de l'installation..."
if command -v npx &> /dev/null && npx @twentyhq/mcp-server --version &> /dev/null; then
    echo "✅ MCP Server Twenty installé avec succès!"
else
    echo "❌ Erreur lors de l'installation. Vérifiez que Node.js et npm sont installés."
    exit 1
fi

echo ""
echo "📌 Instructions finales:"
echo "1. Redémarrez Claude Desktop"
echo "2. Le serveur Twenty sera disponible dans les outils MCP"
echo "3. Vous pourrez interagir avec votre CRM directement depuis Claude"
echo ""
echo "🔗 Twenty CRM URL: $TWENTY_URL"
echo "🔑 API Key: Configurée automatiquement"
echo ""
echo "✨ Installation terminée!"