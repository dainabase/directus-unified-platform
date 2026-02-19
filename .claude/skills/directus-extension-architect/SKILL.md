---
name: directus-extension-architect
description: Expert en développement d'extensions Directus 10.x — custom endpoints, hooks (filter/action), operations, interfaces, modules, bundles, Flows automation, et le SDK composable. Ce skill doit être utilisé quand l'utilisateur travaille sur des extensions Directus, des endpoints custom, des hooks, ou des patterns d'API Directus.
---

# Directus Extension Architecture Expert

## Extension Types
- **Endpoints**: Custom API routes via `defineEndpoint()`. TOUJOURS utiliser `ItemsService` (jamais raw Knex) pour respecter les permissions Directus.
- **Hooks**: `filter('items.create', ...)` pour validation pré-save, `action('items.create', ...)` pour side effects post-save.
- **Operations**: Pour Directus Flows (triggers: event, schedule, webhook). Run Script = sandboxed JS.
- **Bundles**: Packaging multiple extensions ensemble.
- **Interfaces/Modules**: UI components custom dans l'admin Directus.

## Standard Endpoint Template
```typescript
import { defineEndpoint } from '@directus/extensions-sdk';

export default defineEndpoint((router, context) => {
  const { services, getSchema } = context;

  router.get('/', async (req, res) => {
    try {
      const schema = await getSchema();
      const { ItemsService } = services;
      const itemsService = new ItemsService('collection_name', {
        schema,
        accountability: req.accountability,
      });

      const items = await itemsService.readByQuery({
        limit: 25,
        filter: { status: { _eq: 'active' } },
        meta: ['total_count'],
      });

      res.json({ data: items });
    } catch (error) {
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: error.message
        }
      });
    }
  });
});
```

## Hook Template
```typescript
import { defineHook } from '@directus/extensions-sdk';

export default defineHook(({ filter, action }, { services, getSchema }) => {
  filter('items.create', async (payload, meta, { schema, accountability }) => {
    if (meta.collection === 'invoices') {
      if (!payload.amount || payload.amount <= 0) {
        throw new Error('Le montant doit être positif');
      }
    }
    return payload;
  });

  action('items.create', async (meta, { schema, accountability }) => {
    if (meta.collection === 'invoices') {
      // Sync vers Invoice Ninja, envoyer notification, etc.
    }
  });
});
```

## SDK Composable
```typescript
import { createDirectus, rest, authentication } from '@directus/sdk';

const client = createDirectus('http://localhost:8055')
  .with(rest())
  .with(authentication());

await client.login('email', 'password');
const items = await client.request(readItems('projects'));
```

## Schema Migrations
```bash
npx directus schema snapshot > schema.yaml
npx directus schema diff schema.yaml
npx directus schema apply ./schema-diff.yaml
```

## Règles Critiques
- TOUJOURS `ItemsService` over raw Knex pour respecter les permissions
- TOUJOURS `try/catch` dans les endpoints
- TOUJOURS `req.accountability` pour le contexte utilisateur
- Extension hot-reload: `EXTENSIONS_AUTO_RELOAD=true` (dev only)
- Cache: `CACHE_ENABLED=true`, `CACHE_STORE=redis`, `CACHE_AUTO_PURGE=true`
- Marketplace: npm keyword `directus-extension`
