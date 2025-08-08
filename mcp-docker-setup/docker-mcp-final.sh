#!/bin/bash

echo "🚀 SOLUTION FINALE POUR DOCKER MCP"
echo "=================================="
echo ""

# Installer docker-mcp via pip (Python)
echo "📦 Installation de docker-mcp via pip..."
echo ""

# Vérifier si Python 3 est installé
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 n'est pas installé"
    echo "Installez Python 3 depuis python.org"
    exit 1
fi

# Créer un environnement virtuel
echo "1️⃣ Création de l'environnement virtuel..."
python3 -m venv ~/docker-mcp-env

# Activer l'environnement
source ~/docker-mcp-env/bin/activate

# Installer docker-mcp
echo "2️⃣ Installation de docker-mcp..."
pip install docker-mcp

# Créer un script wrapper
echo "3️⃣ Création du script wrapper..."
cat > ~/docker-mcp-wrapper.sh << 'EOF'
#!/bin/bash
source ~/docker-mcp-env/bin/activate
docker-mcp "$@"
EOF

chmod +x ~/docker-mcp-wrapper.sh

# Mettre à jour la configuration Claude
echo "4️⃣ Mise à jour de la configuration Claude..."
cat > ~/Library/Application\ Support/Claude/claude_desktop_config_docker.json << 'EOF'
{
  "mcpServers": {
    "docker-mcp": {
      "command": "/bin/bash",
      "args": [
        "-c",
        "source ~/docker-mcp-env/bin/activate && docker-mcp"
      ]
    }
  }
}
EOF

echo ""
echo "✅ Installation terminée !"
echo ""
echo "📋 Pour activer:"
echo "1. Copiez la configuration docker-mcp dans votre claude_desktop_config.json"
echo "2. Redémarrez Claude Desktop"
echo ""
echo "Voulez-vous que je mette à jour automatiquement votre configuration ? (y/n)"
read -r response

if [[ "$response" == "y" ]]; then
    # Backup
    cp ~/Library/Application\ Support/Claude/claude_desktop_config.json ~/Library/Application\ Support/Claude/claude_desktop_config.backup.json
    
    # Ajouter docker-mcp à la config existante
    python3 << 'PYTHON_EOF'
import json
import os

config_path = os.path.expanduser("~/Library/Application Support/Claude/claude_desktop_config.json")
with open(config_path, 'r') as f:
    config = json.load(f)

config['mcpServers']['docker-mcp'] = {
    "command": "/bin/bash",
    "args": [
        "-c",
        "source ~/docker-mcp-env/bin/activate && docker-mcp"
    ]
}

with open(config_path, 'w') as f:
    json.dump(config, f, indent=2)

print("✅ Configuration mise à jour !")
PYTHON_EOF
    
    echo ""
    echo "🔄 Maintenant:"
    echo "1. Fermez Claude Desktop (Cmd+Q)"
    echo "2. Relancez Claude Desktop"
    echo "3. docker-mcp devrait apparaître connecté"
fi