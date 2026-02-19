# MCP Servers (6 — Outils directs)

> Ces serveurs fournissent des outils utilisables directement sans charger de skill.

## PostgreSQL (MCP)
- **Capacite** : Executer des requetes SQL directement sur la base Directus
- **Usage** : Queries SELECT, analyses de donnees, verification de schema, 83+ collections
- **Config** : `.mcp.json` → serveur postgres
- **Connection** : `postgresql://directus:***@localhost:5432/directus`

## Directus (MCP)
- **Capacite** : CRUD sur toutes les 83+ collections Directus
- **Outils** : `directus_list_collections`, `directus_get_items`, `directus_create_item`, `directus_update_item`, `directus_delete_item`, `directus_get_schema`
- **Config** : `.mcp/directus-mcp-server.js` (custom, SDK v1.26)

## ESLint (MCP)
- **Capacite** : Analyse statique du code JavaScript/TypeScript
- **Usage** : Qualite de code, detection de bugs, conventions
- **Config** : `.mcp.json` → serveur eslint

## Playwright (MCP)
- **Capacite** : Automatisation navigateur, tests E2E, screenshots
- **Usage** : Tester les 4 portails, navigation, formulaires, assertions visuelles
- **Outils** : `browser_navigate`, `browser_click`, `browser_fill`, `browser_snapshot`, `browser_take_screenshot`, etc.

## Context7 (MCP)
- **Capacite** : Documentation live de 44,000+ libraries npm/PyPI
- **Usage** : Consulter la doc a jour de n'importe quelle library avant d'implementer

## Sequential Thinking (MCP)
- **Capacite** : Raisonnement complexe multi-etapes structure
- **Usage** : Planification d'architecture, resolution de problemes complexes, debug multi-couches
