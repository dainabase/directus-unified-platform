#!/usr/bin/env python3

import json
import os
import sys
from datetime import datetime

# Déterminer le chemin du fichier de config Claude
if sys.platform == "darwin":
    config_path = os.path.expanduser("~/Library/Application Support/Claude/claude_desktop_config.json")
elif sys.platform == "linux":
    config_path = os.path.expanduser("~/.config/claude/claude_desktop_config.json")
else:
    config_path = os.path.expandvars("$APPDATA/Claude/claude_desktop_config.json")

print("🔧 AJOUT DE DOCKER MCP À CLAUDE")
print("=" * 50)
print(f"Fichier config: {config_path}")

try:
    # Lire la config existante
    with open(config_path, 'r') as f:
        config = json.load(f)
    
    # Backup
    backup_path = config_path + f".backup.{datetime.now().strftime('%Y%m%d-%H%M%S')}"
    with open(backup_path, 'w') as f:
        json.dump(config, f, indent=2)
    print(f"✅ Backup créé: {backup_path}")
    
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
    print("\n📋 MCP Servers configurés:")
    for server in config['mcpServers']:
        print(f"   - {server}")
    
    print("\n✅ SUCCÈS!")
    print("\n📋 PROCHAINES ÉTAPES:")
    print("1. Fermez COMPLÈTEMENT Claude Desktop (Cmd+Q)")
    print("2. Attendez 5 secondes")
    print("3. Relancez Claude Desktop")
    print("4. Vérifiez dans Settings > Developer")
    print("5. 'docker' et 'docker-advanced' devraient apparaître")
    
except FileNotFoundError:
    print(f"❌ Fichier de config non trouvé: {config_path}")
    print("Assurez-vous que Claude Desktop est installé")
except json.JSONDecodeError:
    print("❌ Erreur lors de la lecture du fichier JSON")
except Exception as e:
    print(f"❌ Erreur: {e}")