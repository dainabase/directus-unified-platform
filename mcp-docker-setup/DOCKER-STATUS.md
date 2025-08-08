# État du système avant installation MCP Docker

Date: 8 janvier 2025, 15:21

## Docker
- Version: Docker 28.3.2, Docker Compose v2.39.1-desktop.1
- Conteneurs actifs: 20
- Directus: ✅ RUNNING (Up 5 hours)
- PostgreSQL: ✅ RUNNING (PostgreSQL 15.13)

## État de Directus
- URL: http://localhost:8055
- Health Status: ✅ OK
- Container: directus-unified-platform-directus-1
- Ports: 0.0.0.0:8055->8055/tcp

## État de PostgreSQL
- Container: directus-unified-platform-postgres-1
- Version: PostgreSQL 15.13 on aarch64-unknown-linux-musl
- Status: Up 5 hours

## MCP existants
Configuration actuelle sauvegardée dans :
- claude_desktop_config.json
- claude_desktop_config.backup.20250108_152149.json

## Node.js
- Version: v22.17.0
- NPM: 10.9.2

## Autres conteneurs actifs
- ERPNext (plusieurs conteneurs en redémarrage)
- Invoice Ninja (nginx + app + db)
- Adminer: http://localhost:8080
- Redis Commander: http://localhost:8081
- Redis: port 6379

## Prochaine étape
Installation du MCP Docker officiel pour permettre à Claude Code d'exécuter directement les commandes Docker nécessaires pour finaliser la migration owner_company.