# 📊 Rapport Diagnostic MCP - Fri Aug  8 17:50:36 EEST 2025

## 1. Configuration Système
- OS: Darwin arm64
- Docker: Docker version 28.3.2, build 578ccf6
- Docker Compose: Docker Compose version v2.39.1-desktop.1
- Node: v22.17.0
- NPM: 10.9.2

## 2. État Claude Desktop
- Config Path: /Users/jean-mariedelaunay/Library/Application Support/Claude/claude_desktop_config.json
- Config Exists: ✅ OUI
- Config Size: 2.3K

## 3. MCP Servers Configurés
```json
        "docker": {
            "command": "npx",
            "args": [
                "-y",
```

## 4. Packages MCP Installés Globalement
```
Aucun package MCP global
```

## 5. Test NPX Docker MCP
```
npm error code E404
npm error 404 Not Found - GET https://registry.npmjs.org/@modelcontextprotocol%2fserver-docker - Not found
npm error 404
npm error 404  '@modelcontextprotocol/server-docker@*' is not in this registry.
npm error 404
```

## 6. Docker Status
### Containers actifs
```
NAMES                                  STATUS
directus-unified-platform-directus-1   Up 5 hours
directus-unified-platform-postgres-1   Up 5 hours
erpnext-redis-queue-1                  Up 5 hours
erpnext-redis-socketio-1               Up 5 hours
erpnext-redis-cache-1                  Up 5 hours
erpnext-frontend-1                     Restarting (1) 11 seconds ago
erpnext-queue-short-1                  Restarting (1) 57 seconds ago
erpnext-db-1                           Up 5 hours (healthy)
erpnext-websocket-1                    Restarting (1) 35 seconds ago
```

### Images Docker
```
REPOSITORY                         TAG         SIZE
frappe/erpnext                     latest      2.57GB
invoiceninja/invoiceninja          5           2.68GB
directus/directus                  11.10.0     1.01GB
twentycrm/twenty                   latest      2.93GB
ocr-service-ocr-service            latest      2.28GB
ghcr.io/czlonkowski/n8n-mcp        latest      422MB
nginx                              1           281MB
docker.n8n.io/n8nio/n8n            latest      1.69GB
n8nio/n8n                          latest      1.69GB
```

## 7. Permissions Docker Socket
```
lrwxr-xr-x@ 1 root  daemon  49 Aug  8 11:32 /var/run/docker.sock -> /Users/jean-mariedelaunay/.docker/run/docker.sock
Utilisateur pas dans le groupe docker
```

## 8. Claude Desktop Logs (si disponible)
```

```

## 9. Configuration Complète Claude
```json
{
    "mcpServers": {
        "mcp-installer": {
            "command": "npx",
            "args": [
                "@anaisbetts/mcp-installer"
            ]
        },
        "server-puppeteer": {
            "command": "npx",
            "args": [
                "@modelcontextprotocol/server-puppeteer"
            ]
        },
        "gmail-mcp-server": {
            "command": "npx",
            "args": [
                "gmail-mcp-server"
            ],
            "env": {}
        },
        "n8n-api": {
            "command": "npx",
            "args": [
                "@leonardsellem/n8n-mcp-server"
            ],
            "env": {
                "N8N_API_URL": "https://n8n.srv815887.hstgr.cloud/api/v1",
                "N8N_API_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMjdiZWYzZS1iYzhiLTQxNTItOWI0Ny0zZWY4NjUxNzQ3NzkiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzUyNjc1MDQ1fQ.s2V-D2-YYQYKsWAK2DSGxMd2a8Vy_qCxa5jmynhAjGk"
            }
        },
        "mcp-server-youtube-transcript": {
            "command": "npx",
            "args": [
                "@kimtaeyoon83/mcp-server-youtube-transcript"
            ]
        },
        "github": {
            "command": "npx",
            "args": [
                "-y",
                "@smithery/cli@latest",
                "run",
                "@smithery-ai/github",
                "--key",
                "47bf0e07-bfec-4db7-8c07-e44aefedd839",
                "--profile",
                "sunny-donkey-TgDxNP"
            ]
        },
        "notion": {
            "command": "npx",
            "args": [
                "-y",
                "@smithery/cli@latest",
                "run",
                "@smithery/notion",
                "--key",
                "47bf0e07-bfec-4db7-8c07-e44aefedd839",
                "--profile",
                "sunny-donkey-TgDxNP"
            ]
        },
        "directus-mcp-server": {
            "command": "node",
            "args": [
                "/Users/jean-mariedelaunay/directus-unified-platform/node_modules/directus-mcp-server/server.js"
            ],
            "env": {
                "DIRECTUS_URL": "http://localhost:8055",
                "DIRECTUS_TOKEN": "e6Vt5LRHnYhq7-78yzoSxwdgjn2D6-JW"
            }
        },
        "docker": {
            "command": "npx",
            "args": [
                "-y",
                "@modelcontextprotocol/server-docker"
            ],
            "env": {
                "DOCKER_HOST": "unix:///var/run/docker.sock"
            }
        },
        "docker-advanced": {
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
    }
}
```

## 10. Checklist de Diagnostic

### ✅ Configuration ajoutée
- [x] Docker MCP ajouté à claude_desktop_config.json
- [x] Docker-advanced MCP ajouté pour debug

### 🔍 À vérifier manuellement
- [ ] Claude Desktop complètement fermé et relancé
- [ ] 'docker' visible dans Settings > Developer
- [ ] Peut exécuter des commandes Docker via Claude

### 📋 Solutions si ça ne fonctionne pas
1. **Si Docker MCP n'apparaît pas:**
   - Vérifier que Claude est bien fermé (ps aux | grep -i claude)
   - Supprimer le cache Claude: rm -rf ~/Library/Caches/Claude
   - Relancer Claude

2. **Si erreur "permission denied":**
   - sudo chmod 666 /var/run/docker.sock
   - Ou ajouter l'utilisateur au groupe docker

3. **Si erreur NPX:**
   - npm install -g npx
   - npm install -g @modelcontextprotocol/server-docker

## 11. Commandes de Test
Une fois Claude relancé avec Docker MCP:

1. "Liste tous les containers Docker"
2. "Montre-moi les images Docker"
3. "Exécute docker ps dans le terminal"

---
Rapport généré le Fri Aug  8 17:50:39 EEST 2025
