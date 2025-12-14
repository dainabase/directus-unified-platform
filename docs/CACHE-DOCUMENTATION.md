# 🚀 Système de Cache et Déduplication - SuperAdmin Dashboard

## Vue d'ensemble

Le système de cache et déduplication a été implémenté pour optimiser les performances du dashboard SuperAdmin en réduisant:
- Les requêtes répétées à la base de données
- Les calculs redondants
- Le temps de chargement des données
- La charge serveur

## Architecture

### 1. Cache Côté Client (Frontend)

#### Hook `useCache.js`
```javascript
// Utilisation basique
const { data, loading, error, refresh } = useCache(
  'unique-key',
  fetcherFunction,
  { ttl: 300000 } // 5 minutes
)
```

**Fonctionnalités:**
- Cache LRU (Least Recently Used) avec limite de taille
- TTL (Time To Live) configurable
- Stale-While-Revalidate pour une UX fluide
- Invalidation manuelle ou automatique

#### Hook `useKPIData.js`
Hook spécialisé pour les données KPI avec:
- Cache prédéfini pour chaque type de données
- Prefetch intelligent au survol
- Invalidation groupée
- Agrégation d'états (loading, error, stale)

### 2. Cache Côté Serveur (Backend)

#### Module `cache.js` dans l'endpoint Directus
```javascript
// Gestionnaire de cache in-memory
const { cache, deduplicator } = require('./cache')

// Cache automatique avec déduplication
const data = await deduplicator.dedupe(cacheKey, async () => {
  // Requête coûteuse
  return await fetchExpensiveData()
})
```

**Fonctionnalités:**
- Cache in-memory avec auto-nettoyage
- Déduplication des requêtes concurrentes
- Headers HTTP pour monitoring (`X-Cache-Status`)
- Endpoint d'invalidation manuelle

## Configuration des TTL

### Frontend
| Type de donnée | TTL | Justification |
|----------------|-----|---------------|
| Overview KPI | 2 min | Données critiques, mise à jour fréquente |
| Company KPI | 5 min | Données par entreprise, moins volatile |
| Trends | 10 min | Données historiques, changement lent |
| Static Data | 30 min | Données rarement modifiées |

### Backend
| Endpoint | TTL | Cache Key Pattern |
|----------|-----|------------------|
| /overview | 2 min | `overview:{company\|all}` |
| /company/:id | 5 min | `company:{id}` |
| /trends | 10 min | `trends:{period}:{company\|all}` |

## Utilisation

### Dashboard avec Cache
```javascript
import DashboardWithCache from './portals/superadmin/DashboardWithCache'

// Le dashboard utilise automatiquement le cache
// Indicateurs visuels:
// - Badge "Cached" quand les données sont en cache
// - Bouton refresh orange quand les données sont périmées
// - Spinner lors du rechargement
```

### Prefetch au Survol
```javascript
// Précharge automatique des données au survol
<select onMouseEnter={handleCompanyHover}>
  <option value="HYPERVISUAL">HYPERVISUAL</option>
</select>
```

### Invalidation du Cache

#### Côté Client
```javascript
// Invalidation spécifique
cacheUtils.invalidate('kpi:overview')

// Invalidation par pattern
cacheUtils.invalidate(/^kpi:company:/)

// Clear total
cacheUtils.clear()
```

#### Côté Serveur
```bash
# Invalidation par pattern
curl -X POST http://localhost:8055/kpi-dashboard/cache/invalidate \
  -H "Content-Type: application/json" \
  -d '{"pattern": "company"}'

# Clear total
curl -X POST http://localhost:8055/kpi-dashboard/cache/invalidate
```

## Métriques de Performance

### Avant Optimisation
- Premier chargement: ~2-3s
- Navigation entre entreprises: ~1.5s
- Refresh données: ~2s

### Après Optimisation
- Premier chargement: ~2-3s (inchangé)
- Navigation entre entreprises: <100ms (cache hit)
- Refresh données: ~2s (avec indicateur visuel)

## Monitoring

### Headers HTTP
```
X-Cache-Status: HIT   # Données servies depuis le cache
X-Cache-Status: MISS  # Données calculées et mises en cache
```

### Indicateurs Visuels
- Badge "Cached" vert avec icône éclair
- Bouton refresh orange quand données périmées
- Animation de chargement pendant les requêtes

## Bonnes Pratiques

### 1. Choix des Clés de Cache
```javascript
// Mauvais - clé trop générique
const key = 'data'

// Bon - clé spécifique et prévisible
const key = `kpi:company:${companyId}:period:${period}`
```

### 2. Gestion des Erreurs
```javascript
const { data, error, refresh } = useKPIData({
  onError: (err) => {
    console.error('KPI Error:', err)
    toast.error('Erreur de chargement')
  }
})
```

### 3. Invalidation après Mutations
```javascript
const updateProject = useMutation(updateProjectAPI, {
  invalidateKeys: [
    /^projects:/,  // Invalide tous les caches projets
    /^kpi:/        // Invalide les KPIs associés
  ]
})
```

## Limitations et Considérations

### Limitations
- Cache in-memory côté serveur (perdu au redémarrage)
- Taille limitée (50 entrées serveur, 100 client)
- Pas de synchronisation entre instances

### Évolutions Futures
1. **Redis Integration**: Pour cache distribué persistant
2. **WebSocket Updates**: Pour invalidation temps réel
3. **Service Worker**: Pour cache offline
4. **Compression**: Pour réduire la taille du cache

## Dépannage

### Cache non fonctionnel
1. Vérifier la console pour erreurs JS
2. Vérifier les headers HTTP `X-Cache-Status`
3. Tester l'endpoint d'invalidation

### Données périmées
1. Utiliser le bouton refresh
2. Invalider manuellement le cache
3. Vérifier les TTL configurés

### Performance dégradée
1. Vérifier la taille du cache
2. Analyser les cache miss
3. Optimiser les requêtes sous-jacentes