#!/bin/bash

echo "🔴 VÉRIFICATION D'URGENCE DES MCP"
echo "=================================="
echo ""

CONFIG_FILE="$HOME/Library/Application Support/Claude/claude_desktop_config.json"

# Liste des MCP ESSENTIELS
ESSENTIAL_MCPS=(
    "github"
    "filesystem"
    "notion"
    "directus"
    "erpnext"
    "memory"
    "puppeteer"
    "mcp-installer"
)

echo "📋 STATUT DES MCP ESSENTIELS :"
echo ""

MISSING=0
for mcp in "${ESSENTIAL_MCPS[@]}"; do
    if grep -q "\"$mcp\"" "$CONFIG_FILE" 2>/dev/null; then
        echo "✅ $mcp : PRÉSENT"
    else
        echo "❌ $mcp : MANQUANT !!!"
        MISSING=$((MISSING + 1))
    fi
done

echo ""
if [ $MISSING -eq 0 ]; then
    echo "✅ TOUS LES MCP SONT RESTAURÉS !"
else
    echo "🔴 ATTENTION : $MISSING MCP MANQUANTS !"
fi

echo ""
echo "📄 Configuration actuelle :"
cat "$CONFIG_FILE" | python3 -m json.tool 2>/dev/null || cat "$CONFIG_FILE"