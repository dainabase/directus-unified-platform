#!/bin/bash

echo "🔧 Configuration du MCP Server Twenty pour Claude Desktop"
echo "========================================================"

# Variables
MCP_CONFIG_DIR="$HOME/Library/Application Support/Claude"
MCP_SERVER_PATH="/Users/jean-mariedelaunay/Dashboard Client: Presta/twenty-mcp-server/index.js"
TWENTY_API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5MjdkYjBjMy1jNjVhLTRiMGQtYmM0Mi03N2NiNTNjNTRmMGIiLCJ0eXBlIjoiQVBJX0tFWSIsIndvcmtzcGFjZUlkIjoiOTI3ZGIwYzMtYzY1YS00YjBkLWJjNDItNzdjYjUzYzU0ZjBiIiwiaWF0IjoxNzUzOTg1MzQ4LCJleHAiOjQ5MDc1ODUzNDcsImp0aSI6IjhmNmI5YTczLWRlNmMtNDlkMC1iYmI2LWVmMzQ1ZWVmMjMyYiJ9.Mx7IQOHMsC9g_7oCODpQJRoQCHTsvcDcH19gzjNCt2g"

# Créer le répertoire si nécessaire
mkdir -p "$MCP_CONFIG_DIR"

# Sauvegarder la configuration existante
if [ -f "$MCP_CONFIG_DIR/claude_desktop_config.json" ]; then
    echo "📋 Sauvegarde de la configuration existante..."
    cp "$MCP_CONFIG_DIR/claude_desktop_config.json" "$MCP_CONFIG_DIR/claude_desktop_config.json.backup.$(date +%Y%m%d_%H%M%S)"
fi

# Créer la nouvelle configuration
echo "📝 Création de la configuration..."
cat > "$MCP_CONFIG_DIR/claude_desktop_config.json" << EOF
{
  "mcpServers": {
    "twenty": {
      "command": "node",
      "args": ["$MCP_SERVER_PATH"],
      "env": {
        "TWENTY_API_KEY": "$TWENTY_API_KEY",
        "TWENTY_API_URL": "http://localhost:3000/graphql"
      }
    }
  }
}
EOF

echo "✅ Configuration créée avec succès!"
echo ""
echo "📌 Prochaines étapes:"
echo "1. Fermez complètement Claude Desktop"
echo "2. Rouvrez Claude Desktop"
echo "3. Les outils Twenty CRM seront disponibles:"
echo "   - twenty_list_companies : Lister les entreprises"
echo "   - twenty_list_people : Lister les contacts"
echo "   - twenty_create_company : Créer une entreprise"
echo "   - twenty_create_person : Créer un contact"
echo "   - twenty_search : Rechercher dans le CRM"
echo ""
echo "🔍 Fichiers créés:"
echo "   - Serveur MCP : $MCP_SERVER_PATH"
echo "   - Configuration : $MCP_CONFIG_DIR/claude_desktop_config.json"
echo ""
echo "✨ Configuration terminée!"