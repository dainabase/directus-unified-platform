# PHASE 4 — MISE À JOUR CLAUDE.md

## Contexte
Suite de la configuration `directus-unified-platform`. Phases 1-3 terminées (MCP + repos + 8 skills). On met maintenant à jour les fichiers CLAUDE.md.

## Mission Phase 4
Le CLAUDE.md root existe déjà à la racine du repo. **Lis d'abord le CLAUDE.md actuel** pour ne pas perdre d'informations spécifiques qui y sont déjà, puis fusionne avec le template ci-dessous. Remplace le contenu (ne pas simplement append).

### 4.1 CLAUDE.md racine

Lis le CLAUDE.md existant, puis remplace-le par cette version fusionnée (en conservant toute info spécifique existante qui n'est pas dans ce template) :

```markdown
# Directus Unified Platform — Multi-Portal Business Management

Plateforme de gestion multi-entreprises avec 4 portails (SuperAdmin, Client, Prestataire, Revendeur),
5 entreprises (HYPERVISUAL, DAINAMICS, LEXAIA, ENKI REALTY, TAKEOUT), conformité légale suisse.

## Tech Stack
- Backend: Directus 10.x (headless CMS), PostgreSQL 15, Redis 7, Node.js 18+
- Frontend: React 18.2, Vite 5.0, Tabler.io (CDN @1.0.0-beta20), Recharts, React Router v6
- State: Zustand (client) + TanStack Query (server/API)
- Forms: React Hook Form + Zod
- Intégrations: Invoice Ninja v5, Revolut Business API v2, ERPNext v15, Mautic 5.x, OpenAI Vision
- Docker Compose pour tous les services

## Commands
- `docker compose up -d` — Start full stack
- `cd frontend && npm run dev` — React dev server (port 3000)
- `cd frontend && npm run build` — Production build
- `cd frontend && npm run lint` — ESLint + Prettier
- `npx directus schema snapshot > schema.yaml` — Snapshot schema
- `npx directus schema apply ./schema-diff.yaml` — Apply changes

## Architecture
- `/directus/extensions/` — Custom endpoints, hooks, operations (TypeScript)
- `/src/portals/admin/` — SuperAdmin/CEO portal
- `/src/portals/client/` — Client portal
- `/src/portals/prestataire/` — Prestataire portal
- `/src/portals/revendeur/` — Revendeur portal
- `/src/components/` — Shared React components
- `/integrations/` — External API sync modules
- `/backend/` — Backend services & API routes

## Code Conventions
- TypeScript strict mode, no `any` types
- Functional React components, hooks only
- Named exports (no default exports)
- All Directus endpoints: ItemsService (NEVER raw Knex)
- All monetary values: integer cents (CHF centimes), Dinero.js for arithmetic
- Swiss locale: fr-CH primary, de-CH secondary, date DD.MM.YYYY

## Swiss Compliance (Critical)
- QR-Invoice: SIX Group IG v2.3, structured addresses mandatory, `swissqrbill` npm
- VAT: 8.1% normal, 2.6% reduced, 3.8% accommodation — NEVER hardcode, always config
- Chart of accounts: Swiss PME Käfer (9 decimal classes)
- Signatures: ZertES-compliant QES via Swisscom Trust Services
- Currency: CHF primary, EUR/USD supported, Dinero.js

## Warnings
- NEVER commit .env or API tokens
- NEVER bypass Directus permissions with raw SQL
- NEVER use ApexCharts (use Recharts)
- NEVER use S3 storage (use Directus Storage)
- NEVER use SendGrid (use Mautic for ALL emails)
- Revolut tokens expire 40min — ALWAYS implement refresh
- TVA rates: 8.1%, 2.6%, 3.8% — NEVER 7.7%, 2.5%, 3.7% (anciens taux)
```

### 4.2 CLAUDE.md sous-répertoires

Crée ces 3 fichiers CLAUDE.md (seulement s'ils n'existent pas déjà) :

**`directus/extensions/CLAUDE.md`** :
```markdown
# Directus Extensions

## Conventions
- Toutes les extensions utilisent TypeScript et `@directus/extensions-sdk`
- TOUJOURS utiliser `ItemsService` (jamais raw Knex) pour respecter les permissions
- TOUJOURS `try/catch` dans les endpoints avec error response standard
- TOUJOURS `req.accountability` pour le contexte utilisateur
- Hot-reload: `EXTENSIONS_AUTO_RELOAD=true` (dev only, false en prod)
- Chaque extension = un dossier dans `/extensions/`
- Nommage: `directus-extension-{type}-{name}`
```

**`src/portals/CLAUDE.md`** :
```markdown
# Portails Multi-Rôles

## Structure
- `/admin/` — SuperAdmin/CEO : accès complet, multi-company selector
- `/client/` — Client : projets, factures, tickets
- `/prestataire/` — Prestataire : tasks, timesheets, disponibilité
- `/revendeur/` — Revendeur : commissions, acquisition, catalogue

## Conventions
- Chaque portail a son propre layout (AdminLayout, ClientLayout, etc.)
- RBAC via `RoleBasedRoute` component
- State client: Zustand / State serveur: TanStack Query
- UI: Tabler.io classes en priorité, CSS custom en dernier recours
- Code-splitting: un chunk par portail via Vite manualChunks
```

**`integrations/CLAUDE.md`** :
```markdown
# Intégrations Externes

## Services
- Invoice Ninja v5: REST direct, header `X-API-TOKEN`
- Revolut Business API v2: OAuth2 + JWT RS256, token 40min (refresh obligatoire)
- ERPNext v15: API v2, `token api_key:api_secret`
- Mautic 5.x: Basic auth ou OAuth2, gère TOUS les emails
- OpenAI Vision: OCR factures via GPT-4o

## Conventions
- Webhooks: ACK immédiat (200) + traitement async via BullMQ
- Rate limiting: Bottleneck
- Retry: p-retry (3 tentatives)
- Idempotency keys pour éviter les doublons
- Circuit breaker pour les services en panne
```

### 4.3 Vérification Phase 4

```bash
echo "=== CLAUDE.md root ==="
head -5 CLAUDE.md

echo ""
echo "=== CLAUDE.md sous-répertoires ==="
ls -la directus/extensions/CLAUDE.md 2>/dev/null && echo "✅ extensions" || echo "❌ extensions MANQUANT"
ls -la src/portals/CLAUDE.md 2>/dev/null && echo "✅ portals" || echo "❌ portals MANQUANT"
ls -la integrations/CLAUDE.md 2>/dev/null && echo "✅ integrations" || echo "❌ integrations MANQUANT"
```

## Résultat attendu
- CLAUDE.md root mis à jour avec le nouveau contenu
- 3 CLAUDE.md de sous-répertoires créés
- Signale-moi le résultat pour lancer la Phase 5.
