# PHASE 1 — MCP SERVERS (Priorité Absolue)

## Contexte
Tu travailles sur `directus-unified-platform` — une plateforme de gestion d'entreprise multi-portails.
- **Backend**: Directus 10.x + PostgreSQL 15 + Redis 7 + Node.js 18+
- **Frontend**: React 18.2 + Vite 5.0 + Tabler.io + Recharts
- **4 Portails**: SuperAdmin (CEO), Client, Prestataire, Revendeur
- **5 Entreprises**: HYPERVISUAL, DAINAMICS, LEXAIA, ENKI REALTY, TAKEOUT

Le repo existe déjà avec un CLAUDE.md, un `.claude/settings.local.json`, et un `.mcp/directus-mcp-server.js`.

## Mission Phase 1
Installe et configure tous les MCP servers. Pour chaque étape, confirme le succès avant de passer à la suivante. Si une commande échoue, signale l'erreur et propose une alternative.

### 1.1 Context7 (documentation live 44,000+ libraries)
```bash
claude mcp add context7 -s user -- npx -y @upstash/context7-mcp@latest
```

### 1.2 Sequential Thinking (raisonnement complexe multi-étapes)
```bash
claude mcp add thinking -s user -- npx -y @modelcontextprotocol/server-sequential-thinking
```

### 1.3 PostgreSQL MCP (accès direct DB 62+ collections)
```bash
claude mcp add postgres -- npx -y @modelcontextprotocol/server-postgres "postgresql://directus:${DB_PASSWORD}@localhost:5432/directus_db"
```
> ⚠️ Adapter les credentials selon le `.env` local

### 1.4 Directus MCP (bridge pour Directus 10.x)
```bash
claude mcp add directus -- npx -y @pixelsock/directus-mcp@latest
```
> ⚠️ Vérifier d'abord si le `.mcp/directus-mcp-server.js` existant fonctionne. Si oui, ne pas écraser.

### 1.5 Playwright MCP (E2E testing des 4 portails)
```bash
claude mcp add playwright -- npx -y @playwright/mcp@latest
```

### 1.6 Créer/Mettre à jour `.mcp.json` à la racine du projet
```json
{
  "mcpServers": {
    "directus": {
      "command": "npx",
      "args": ["-y", "@pixelsock/directus-mcp@latest"],
      "env": {
        "DIRECTUS_URL": "http://localhost:8055",
        "DIRECTUS_EMAIL": "${DIRECTUS_ADMIN_EMAIL}",
        "DIRECTUS_PASSWORD": "${DIRECTUS_ADMIN_PASSWORD}"
      }
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres", "postgresql://directus:${DB_PASSWORD}@localhost:5432/directus_db"]
    },
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"]
    },
    "sequential-thinking": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"]
    },
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    },
    "eslint": {
      "command": "npx",
      "args": ["@eslint/mcp@latest"]
    }
  }
}
```

### 1.7 Vérification MCP
```bash
claude mcp list
```
Confirme que tous les MCP servers sont listés et actifs.

## Résultat attendu
- 6 MCP servers installés et fonctionnels
- `.mcp.json` créé à la racine du projet
- Signale-moi le résultat de `claude mcp list` pour que je puisse lancer la Phase 2.
