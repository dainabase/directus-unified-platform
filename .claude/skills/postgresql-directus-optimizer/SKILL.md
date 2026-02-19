---
name: postgresql-directus-optimizer
description: Optimisation PostgreSQL 15 pour Directus avec 62+ collections — stratégies d'indexation, organisation de schéma, vues matérialisées, partitionnement, EXPLAIN ANALYZE, connection pooling. Ce skill doit être utilisé quand l'utilisateur travaille sur les performances de la base de données, les migrations, ou l'optimisation des requêtes.
---

# PostgreSQL + Directus Optimizer

## Indexing Strategies
- Composite indexes pour les WHERE+JOIN fréquents
- GIN indexes pour les colonnes JSONB
- Partial indexes pour les requêtes filtrées (`WHERE status = 'active'`)
- UUID primary keys (Directus default: `gen_random_uuid()`)

## Materialized Views (Dashboard CEO)
```sql
CREATE MATERIALIZED VIEW mv_revenue_by_company AS
SELECT company_id, date_trunc('month', date_created) AS month,
       SUM(amount) AS total_revenue, COUNT(*) AS invoice_count
FROM client_invoices WHERE status = 'paid'
GROUP BY company_id, date_trunc('month', date_created);

REFRESH MATERIALIZED VIEW CONCURRENTLY mv_revenue_by_company;
```

## Directus Schema Migrations
```bash
npx directus schema snapshot > schema.yaml
npx directus schema diff schema.yaml
npx directus schema apply ./schema-diff.yaml
```

## Cache Redis pour Directus
- `CACHE_ENABLED=true`
- `CACHE_STORE=redis`
- `CACHE_AUTO_PURGE=true`
- `CACHE_TTL=5m`
- Monitor: namespace `directus-cache`
