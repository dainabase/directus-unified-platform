# PHASE 3B — CUSTOM SKILLS (Skills 5 à 8 sur 8)

## Contexte
Suite de la configuration `directus-unified-platform`. Phase 3A terminée (skills 1-4 créés). On crée maintenant les 4 derniers skills.

---

## Skill 3.5 — `integration-sync-engine` (HIGH)

Crée le fichier `.claude/skills/integration-sync-engine/SKILL.md` avec ce contenu exact :

```markdown
---
name: integration-sync-engine
description: Patterns de synchronisation bidirectionnelle pour Invoice Ninja v5, Revolut Business API v2, ERPNext v15, Mautic 5.x, et OpenAI Vision OCR. Ce skill doit être utilisé quand l'utilisateur travaille sur les intégrations externes, les webhooks, ou la synchronisation de données.
---

# Integration Sync Engine

## Invoice Ninja v5
- **Auth**: Header `X-API-TOKEN` + `X-Requested-With: XMLHttpRequest`
- **Base URL**: `http://localhost:8080/api/v1/`
- **Entities**: clients, invoices, payments, expenses, products
- **Pagination**: `?per_page=50&page=2`
- Pas de SDK Node officiel → REST direct avec axios

## Revolut Business API v2
- **Auth Flow**: RSA key pair → JWT client assertion (RS256) → OAuth2 code flow → access token (40min) + refresh token (90 jours)
- **Scopes**: READ, WRITE, PAY
- **⚠️ Token expire en 40min** — TOUJOURS implémenter le refresh flow
\`\`\`javascript
import jwt from 'jsonwebtoken';
const clientAssertion = jwt.sign(
  { sub: CLIENT_ID, iss: CLIENT_ID, aud: 'https://revolut.com' },
  PRIVATE_KEY,
  { algorithm: 'RS256', expiresIn: '60s' }
);
\`\`\`

## ERPNext v15
- **API v2**: `/api/v2/document/` et `/api/v2/method/`
- **Auth**: `token api_key:api_secret`
- **Filtres**: `?filters=[["field","=","value"]]`
- **Library**: `node-erpnext` npm

## Mautic 5.x
- **Auth**: Basic auth ou OAuth2
- **Webhook verification**: HMAC-SHA256 via header `Webhook-Signature`
- **Events clés**: `mautic.lead_post_save_new`, `form.submit`, `email.open`
- Mautic gère TOUS les emails (marketing + transactionnels)

## OpenAI Vision OCR
\`\`\`javascript
import OpenAI from 'openai';
const openai = new OpenAI();
const response = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [{
    role: 'user',
    content: [
      { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } },
      { type: 'text', text: 'Extrais les données de cette facture en JSON structuré...' }
    ]
  }]
});
\`\`\`

## Architecture de Sync
- **Outbound**: Directus hooks (action events) → appels API externes
- **Inbound**: Custom endpoints → réception webhooks → BullMQ async processing
- **Reconciliation**: CRON périodique pour rattraper les événements manqués
- **Idempotency**: Clés d'idempotence pour éviter les doublons
- **Circuit Breaker**: Désactiver temporairement un service externe en panne
```

---

## Skill 3.6 — `ceo-dashboard-designer` (MEDIUM)

Crée le fichier `.claude/skills/ceo-dashboard-designer/SKILL.md` avec ce contenu exact :

```markdown
---
name: ceo-dashboard-designer
description: Patterns dashboard CEO/SuperAdmin exécutif — KPI cards, visualisations Recharts, effets glassmorphism, données real-time avec TanStack Query, intégration layout Tabler.io. Ce skill doit être utilisé quand l'utilisateur travaille sur le dashboard SuperAdmin, les graphiques, ou les composants KPI.
---

# CEO Dashboard Designer

## KPI Card Component
\`\`\`jsx
export const KpiCard = ({ title, value, delta, trend, icon }) => (
  <div className="card" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '16px' }}>
    <div className="card-body">
      <div className="d-flex align-items-center">
        <div className="subheader">{title}</div>
      </div>
      <div className="h1 mb-0">{value}</div>
      <div className={`text-${delta >= 0 ? 'success' : 'danger'}`}>
        {delta >= 0 ? '↑' : '↓'} {Math.abs(delta)}%
      </div>
      <ResponsiveContainer width="100%" height={40}>
        <AreaChart data={trend}><Area type="monotone" dataKey="value" stroke="#206bc4" fill="rgba(32,107,196,0.1)" /></AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
);
\`\`\`

## Chart Patterns (Recharts)
- `<ComposedChart>` : Revenue bars + trend line
- `<PieChart>` : Distribution portfolio
- `<BarChart>` stacked : Par portail/entreprise
- `<LineChart>` : Avec auto-refresh via TanStack Query `refetchInterval`
- TOUJOURS wrapper dans `<ResponsiveContainer width="100%" height={300}>`

## Glassmorphism CSS
\`\`\`css
.glass-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
}
@media (prefers-reduced-transparency: reduce) {
  .glass-card { background: rgba(255, 255, 255, 0.95); backdrop-filter: none; }
}
\`\`\`

## Layout Structure (Tabler.io)
- `navbar` → Top navigation avec company selector
- `navbar-aside` → Sidebar avec navigation modules
- `page-header` → Titre page + breadcrumbs + alertes
- `page-body` → Grid de cards et composants
- UTILISER les classes CSS Tabler (`card`, `row`, `col-md-6`, etc.)
```

---

## Skill 3.7 — `postgresql-directus-optimizer` (MEDIUM)

Crée le fichier `.claude/skills/postgresql-directus-optimizer/SKILL.md` avec ce contenu exact :

```markdown
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
\`\`\`sql
CREATE MATERIALIZED VIEW mv_revenue_by_company AS
SELECT company_id, date_trunc('month', date_created) AS month,
       SUM(amount) AS total_revenue, COUNT(*) AS invoice_count
FROM client_invoices WHERE status = 'paid'
GROUP BY company_id, date_trunc('month', date_created);

REFRESH MATERIALIZED VIEW CONCURRENTLY mv_revenue_by_company;
\`\`\`

## Directus Schema Migrations
\`\`\`bash
npx directus schema snapshot > schema.yaml
npx directus schema diff schema.yaml
npx directus schema apply ./schema-diff.yaml
\`\`\`

## Cache Redis pour Directus
- `CACHE_ENABLED=true`
- `CACHE_STORE=redis`
- `CACHE_AUTO_PURGE=true`
- `CACHE_TTL=5m`
- Monitor: namespace `directus-cache`
```

---

## Skill 3.8 — `docker-stack-ops` (MEDIUM)

Crée le fichier `.claude/skills/docker-stack-ops/SKILL.md` avec ce contenu exact :

```markdown
---
name: docker-stack-ops
description: Opérations Docker Compose pour stack Directus + PostgreSQL 15 + Redis 7 + Node.js — configuration production, health checks, volume management, variables d'environnement. Ce skill doit être utilisé quand l'utilisateur travaille sur Docker, le déploiement, ou la configuration des services.
---

# Docker Stack Operations

## Production docker-compose Template
\`\`\`yaml
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: directus_db
      POSTGRES_USER: directus
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U directus"]
      interval: 10s
      timeout: 5s
      retries: 5
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]

  directus:
    image: directus/directus:10.13
    depends_on:
      postgres: { condition: service_healthy }
      redis: { condition: service_healthy }
    environment:
      DB_CLIENT: pg
      DB_HOST: postgres
      DB_PORT: 5432
      DB_DATABASE: directus_db
      CACHE_ENABLED: "true"
      CACHE_STORE: redis
      REDIS: redis://redis:6379
      EXTENSIONS_AUTO_RELOAD: "false"
    volumes:
      - ./uploads:/directus/uploads
      - ./extensions:/directus/extensions

volumes:
  pgdata:
\`\`\`

## Memory Allocation (minimum)
- PostgreSQL: 2GB
- Directus: 1GB
- Redis: 512MB
```

---

## Vérification Phase 3B

```bash
echo "=== Skills créés (Phase 3B) ==="
ls -la .claude/skills/integration-sync-engine/SKILL.md 2>/dev/null && echo "✅ integration-sync-engine" || echo "❌ integration-sync-engine MANQUANT"
ls -la .claude/skills/ceo-dashboard-designer/SKILL.md 2>/dev/null && echo "✅ ceo-dashboard-designer" || echo "❌ ceo-dashboard-designer MANQUANT"
ls -la .claude/skills/postgresql-directus-optimizer/SKILL.md 2>/dev/null && echo "✅ postgresql-directus-optimizer" || echo "❌ postgresql-directus-optimizer MANQUANT"
ls -la .claude/skills/docker-stack-ops/SKILL.md 2>/dev/null && echo "✅ docker-stack-ops" || echo "❌ docker-stack-ops MANQUANT"

echo ""
echo "=== TOTAL: Tous les 8 skills ==="
ls .claude/skills/*/SKILL.md 2>/dev/null | wc -l
echo "skills sur 8 attendus"
```

## Résultat attendu
- 8 skills au total dans `.claude/skills/`
- Signale-moi le résultat pour lancer la Phase 4.
