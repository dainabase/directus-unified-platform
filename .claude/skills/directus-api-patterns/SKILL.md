---
name: directus-api-patterns
description: Design patterns pour 156+ custom Directus API endpoints — authentification, error handling, pagination, filtering, caching, rate limiting, et webhook receivers. Ce skill doit être utilisé quand l'utilisateur crée ou modifie des endpoints API custom Directus.
---

# Directus API Patterns

## Standard Error Response
```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Description", "details": {} } }
```

## Pagination Standard
```
GET /api/items?limit=25&offset=0&meta=total_count&filter[status][_eq]=active&sort=-date_created
```

## Authentication
- Directus JWT tokens dans `Authorization: Bearer <token>`
- `req.accountability` contient user ID, role, permissions
- TOUJOURS vérifier `req.accountability` dans les endpoints sensibles

## Webhook Receiver Pattern
```typescript
router.post('/webhook/:provider', async (req, res) => {
  res.status(200).json({ received: true });

  await webhookQueue.add('process', {
    provider: req.params.provider,
    payload: req.body,
    headers: req.headers,
    receivedAt: new Date().toISOString(),
  });
});
```

## Rate Limiting
```javascript
import Bottleneck from 'bottleneck';
const limiter = new Bottleneck({ maxConcurrent: 5, minTime: 200 });
const result = await limiter.schedule(() => externalApiCall());
```

## Retry Logic
```javascript
import pRetry from 'p-retry';
const result = await pRetry(() => fetchFromExternalAPI(), {
  retries: 3,
  onFailedAttempt: (error) => console.log(`Attempt ${error.attemptNumber} failed`),
});
```

## Batch Operations
```typescript
const itemsService = new ItemsService('collection', { schema, accountability });
await itemsService.createMany([item1, item2, item3]);
await itemsService.updateMany([id1, id2], { status: 'active' });
```
