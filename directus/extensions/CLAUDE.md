# Directus Extensions

## Conventions
- Toutes les extensions utilisent TypeScript et `@directus/extensions-sdk`
- TOUJOURS utiliser `ItemsService` (jamais raw Knex) pour respecter les permissions
- TOUJOURS `try/catch` dans les endpoints avec error response standard
- TOUJOURS `req.accountability` pour le contexte utilisateur
- Hot-reload: `EXTENSIONS_AUTO_RELOAD=true` (dev only, false en prod)
- Chaque extension = un dossier dans `/extensions/`
- Nommage: `directus-extension-{type}-{name}`
