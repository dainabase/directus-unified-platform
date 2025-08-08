#!/usr/bin/env python3

import json
import os
import sys
from datetime import datetime

# Chemin de la config Claude
config_path = os.path.expanduser("~/Library/Application Support/Claude/claude_desktop_config.json")

print("🔧 CONFIGURATION ALTERNATIVE DOCKER MCP")
print("=" * 50)

# Lire la config actuelle
with open(config_path, 'r') as f:
    config = json.load(f)

# Backup
backup_path = config_path + f".backup.{datetime.now().strftime('%Y%m%d-%H%M%S')}"
with open(backup_path, 'w') as f:
    json.dump(config, f, indent=2)
print(f"✅ Backup créé: {backup_path}")

# Modifier la configuration Docker pour utiliser différentes approches
config['mcpServers']['docker-local'] = {
    "command": "npx",
    "args": [
        "-y",
        "@modelcontextprotocol/server-docker"
    ],
    "env": {
        "DOCKER_HOST": f"unix://{os.path.expanduser('~/.docker/run/docker.sock')}"
    }
}

config['mcpServers']['docker-tcp'] = {
    "command": "npx",
    "args": [
        "-y",
        "@modelcontextprotocol/server-docker"
    ],
    "env": {
        "DOCKER_HOST": "tcp://localhost:2375"
    }
}

# Ajouter une version avec timeout plus long
config['mcpServers']['docker-timeout'] = {
    "command": "npx",
    "args": [
        "-y",
        "@modelcontextprotocol/server-docker",
        "--timeout", "30000"
    ],
    "env": {
        "DOCKER_HOST": "unix:///var/run/docker.sock",
        "NODE_OPTIONS": "--max-old-space-size=4096"
    }
}

# Sauvegarder
with open(config_path, 'w') as f:
    json.dump(config, f, indent=2)

print("✅ Configurations alternatives ajoutées:")
print("   - docker-local: Utilise ~/.docker/run/docker.sock")
print("   - docker-tcp: Utilise TCP sur localhost:2375")
print("   - docker-timeout: Timeout augmenté")

print("\n📋 Pour activer Docker sur TCP (si nécessaire):")
print("1. Docker Desktop > Settings > General")
print("2. Cocher 'Expose daemon on tcp://localhost:2375 without TLS'")
print("3. Apply & Restart")

print("\n🔄 Redémarrez Claude Desktop pour tester les nouvelles configurations")