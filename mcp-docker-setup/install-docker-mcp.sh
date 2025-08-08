#!/bin/bash

echo "🚀 INSTALLATION CORRECTE DE DOCKER MCP"
echo "====================================="
echo ""
echo "❌ Le package @modelcontextprotocol/server-docker n'existe PAS !"
echo "✅ Le bon serveur est 'docker-mcp' de QuantGeekDev"
echo ""

# Méthode 1: Installation via Smithery (recommandée)
echo "📦 Méthode 1: Installation via Smithery (RECOMMANDÉE)"
echo "=================================================="
echo "Cette méthode configure automatiquement Claude Desktop:"
echo ""
echo "npx @smithery/cli install docker-mcp --client claude"
echo ""

# Méthode 2: Installation via UV
echo "📦 Méthode 2: Installation via UV (si Python 3.12+ installé)"
echo "========================================================="
echo "1. Installer UV:"
echo "   curl -LsSf https://astral.sh/uv/install.sh | sh"
echo ""
echo "2. Ajouter à claude_desktop_config.json:"
cat << 'EOF'
{
  "mcpServers": {
    "docker-mcp": {
      "command": "uvx",
      "args": ["docker-mcp"]
    }
  }
}
EOF
echo ""

# Méthode 3: Docker Desktop MCP Toolkit
echo "🐳 Méthode 3: Docker Desktop MCP Toolkit (PLUS SIMPLE)"
echo "===================================================="
echo "1. Ouvrir Docker Desktop"
echo "2. Installer l'extension 'Labs: AI Tools for Devs'"
echo "3. Cliquer sur l'icône engrenage > MCP Clients"
echo "4. Cliquer 'Connect' pour Claude Desktop"
echo ""

echo "🔧 INSTALLATION AUTOMATIQUE VIA SMITHERY"
echo "======================================="
read -p "Voulez-vous installer automatiquement via Smithery ? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Installation en cours..."
    npx @smithery/cli install docker-mcp --client claude
    
    if [ $? -eq 0 ]; then
        echo "✅ Installation réussie !"
        echo ""
        echo "🔄 Actions nécessaires:"
        echo "1. Fermer complètement Claude Desktop (Cmd+Q)"
        echo "2. Relancer Claude Desktop"
        echo "3. Vérifier que 'docker-mcp' apparaît avec un point vert"
    else
        echo "❌ Erreur lors de l'installation"
        echo "Essayez la méthode manuelle ci-dessous"
    fi
else
    echo ""
    echo "📝 CONFIGURATION MANUELLE"
    echo "========================"
    echo "Éditez le fichier:"
    echo "~/Library/Application Support/Claude/claude_desktop_config.json"
    echo ""
    echo "Remplacez les entrées 'docker' existantes par:"
    cat << 'EOF'
{
  "mcpServers": {
    "docker-mcp": {
      "command": "uvx",
      "args": ["docker-mcp"]
    }
  }
}
EOF
fi

echo ""
echo "📋 VÉRIFICATION DE L'INSTALLATION"
echo "================================"
echo "Après redémarrage de Claude Desktop:"
echo "1. 'docker-mcp' doit apparaître dans la liste des serveurs"
echo "2. Le point doit être vert (connecté)"
echo "3. Testez avec: 'Montre-moi les conteneurs Docker en cours'"