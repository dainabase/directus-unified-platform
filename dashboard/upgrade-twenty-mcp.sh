#!/bin/bash

echo "🚀 Mise à jour du MCP Server Twenty avec accès TOTAL"
echo "===================================================="

# Variables
MCP_CONFIG_DIR="$HOME/Library/Application Support/Claude"
MCP_SERVER_PATH="/Users/jean-mariedelaunay/Dashboard Client: Presta/twenty-mcp-server/index-full.js"
TWENTY_API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5MjdkYjBjMy1jNjVhLTRiMGQtYmM0Mi03N2NiNTNjNTRmMGIiLCJ0eXBlIjoiQVBJX0tFWSIsIndvcmtzcGFjZUlkIjoiOTI3ZGIwYzMtYzY1YS00YjBkLWJjNDItNzdjYjUzYzU0ZjBiIiwiaWF0IjoxNzUzOTg1MzQ4LCJleHAiOjQ5MDc1ODUzNDcsImp0aSI6IjhmNmI5YTczLWRlNmMtNDlkMC1iYmI2LWVmMzQ1ZWVmMjMyYiJ9.Mx7IQOHMsC9g_7oCODpQJRoQCHTsvcDcH19gzjNCt2g"

# Sauvegarder la configuration existante
if [ -f "$MCP_CONFIG_DIR/claude_desktop_config.json" ]; then
    echo "📋 Sauvegarde de la configuration existante..."
    cp "$MCP_CONFIG_DIR/claude_desktop_config.json" "$MCP_CONFIG_DIR/claude_desktop_config.json.backup.$(date +%Y%m%d_%H%M%S)"
fi

# Créer la nouvelle configuration avec le serveur complet
echo "📝 Mise à jour de la configuration avec accès TOTAL..."
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

echo "✅ Configuration mise à jour avec succès!"
echo ""
echo "🎯 NOUVELLES FONCTIONNALITÉS DISPONIBLES:"
echo ""
echo "📊 CRUD COMPLET sur:"
echo "   • Companies (list, get, create, update, delete)"
echo "   • People/Contacts (list, get, create, update, delete)"
echo "   • Opportunities (list, create, update)"
echo "   • Tasks (list, create, update)"
echo "   • Notes (list, create)"
echo "   • Calendar Events (list, create)"
echo ""
echo "🔍 RECHERCHE & ANALYTICS:"
echo "   • Recherche globale multi-objets"
echo "   • Analytics (opportunités, tâches, activité récente)"
echo ""
echo "⚙️ FONCTIONS AVANCÉES:"
echo "   • Workflows (list, trigger)"
echo "   • Attachments (list)"
echo "   • Workspace info & members"
echo "   • Custom GraphQL queries"
echo ""
echo "📌 PROCHAINES ÉTAPES:"
echo "1. Fermez complètement Claude Desktop (Cmd+Q)"
echo "2. Rouvrez Claude Desktop"
echo "3. Testez avec des commandes comme:"
echo "   - 'Liste toutes mes entreprises'"
echo "   - 'Crée une nouvelle opportunité pour Prestashop'"
echo "   - 'Recherche tous les contacts Gmail'"
echo "   - 'Montre-moi les analytics des opportunités'"
echo ""
echo "✨ Mise à jour terminée! Vous avez maintenant un accès TOTAL à Twenty CRM!"