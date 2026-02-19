# Performance — Directus Unified Platform

> Date: Fevrier 2026 — S-06-06

## Code Splitting & Lazy Loading

### React.lazy + Suspense

Tous les portails et modules sont charges via `React.lazy()` dans `App.jsx`.
Un composant `LoadingSpinner` sert de fallback Suspense uniforme.

```jsx
const FinanceDashboard = lazy(() => import('./portals/superadmin/finance/FinanceDashboard'))
const CRMDashboard = lazy(() => import('./portals/superadmin/crm/CRMDashboard'))
// ...
<Suspense fallback={<LoadingSpinner />}>
  <Routes>...</Routes>
</Suspense>
```

**Avantage** : Seul le code du portail/module visite est telecharge.

### Vite manualChunks

Configuration dans `vite.config.js` → `build.rollupOptions.output.manualChunks` :

| Chunk | Contenu | Taille (gzip) |
|-------|---------|---------------|
| `vendor-react` | react, react-dom, react-router-dom | ~54 KB |
| `vendor-query` | @tanstack/react-query | ~13 KB |
| `vendor-charts` | recharts | ~121 KB |
| `vendor-utils` | date-fns, lucide-react | ~17 KB |
| `portal-client` | Portail Client | ~21 KB |
| `portal-prestataire` | Portail Prestataire | ~6 KB |
| `portal-revendeur` | Portail Revendeur | ~3 KB |
| Per-module chunks | Finance, CRM, Legal, etc. | 2-20 KB chacun |

**Resultat** : ~50 chunks au lieu d'un monolithe de 1.5 MB.

## Avant / Apres

| Metrique | Avant (S-06-05) | Apres (S-06-06) |
|----------|----------------|-----------------|
| Bundle unique | 1,582 KB | — |
| Plus gros chunk | 1,582 KB | 422 KB (recharts) |
| Chunks totaux | 1 JS + 1 CSS | ~50 JS + 1 CSS |
| Chargement initial | ~400 KB gzip | ~85 KB gzip (vendors only) |
| TTI estime | Lent (tout charge) | Rapide (lazy modules) |

## TanStack Query — Cache & Stale Time

Toutes les requetes Directus utilisent `useQuery` avec :
- `staleTime: 30_000` (30s) — evite les re-fetches inutiles
- `queryKey` avec filtres — invalidation precise
- `useMutation` + `invalidateQueries` — mise a jour optimiste

## Proxy Vite (Dev)

Les requetes API sont proxifiees vers les bons backends :

| Prefixe | Target | Usage |
|---------|--------|-------|
| `/api/finance` | localhost:3000 | Backend Express |
| `/api/commercial` | localhost:3000 | Workflow commercial |
| `/api/reports` | localhost:3000 | Rapports CEO |
| `/api/collection` | localhost:3000 | Recouvrement |
| `/api/auth` | localhost:3000 | Authentification |
| `/items/*` | localhost:8055 | Directus REST |
| `/api/*` | localhost:8055 | Directus (fallback) |

## Recommandations futures

1. **Service Worker** — pre-cache des assets statiques (Workbox)
2. **Image optimization** — WebP/AVIF via Cloudinary transforms
3. **Bundle analyzer** — `npx vite-bundle-visualizer` pour identifier les surplus
4. **Tree shaking** — Verifier les imports lucide-react (deja tree-shakeable)
5. **HTTP/2 push** — Deployer derriere Nginx/Caddy avec push des chunks critiques
