# 🚀 Serveur Persistant - Directus Unified Platform

## Installation
1. `npm install -g pm2`
2. `chmod +x *.sh`

## Démarrage
- Production: `npm run start:platform`
- Développement: `npm run dev:simple`

## Monitoring
- Status: `pm2 status`
- Logs: `pm2 logs`
- Santé: `node monitor-health.js`

## Arrêt
`npm run stop:platform`

## Ports
- 3000: React Frontend
- 8055: Directus
- 8080: API Proxy
- 5432: PostgreSQL