# Test de connexion API Directus

## État actuel

✅ **Configuration React Query** : QueryClient configuré dans App.jsx
✅ **Service API Directus** : Implémenté avec Axios et intercepteurs
✅ **Collections API** : Services créés pour companies, projects, finances, metrics
✅ **Hooks React Query** : Tous les hooks créés et prêts
✅ **Intégration Dashboard** : DashboardV4 utilise les hooks et affiche les données
✅ **Mode démo** : Fallback automatique si API non disponible

## Architecture implémentée

```
src/frontend/src/
├── services/
│   ├── api/
│   │   ├── directus.js           # Service API principal avec Axios
│   │   └── collections/          # Services par collection
│   │       ├── companies.js
│   │       ├── projects.js
│   │       ├── finances.js
│   │       ├── metrics.js
│   │       └── index.js
│   └── hooks/                    # Hooks React Query
│       ├── useCompanies.js
│       ├── useProjects.js
│       ├── useFinances.js
│       └── useMetrics.js
└── portals/
    └── superadmin/
        └── DashboardV4.jsx       # Dashboard connecté à l'API
```

## Fonctionnalités

1. **Cache intelligent** avec React Query
   - staleTime: 5 minutes (requêtes)
   - cacheTime: 10 minutes (cache)
   - Auto-refresh pour alertes et métriques

2. **Gestion d'erreurs robuste**
   - Toast notifications pour les erreurs
   - Fallback sur données démo si API indisponible
   - Intercepteurs Axios pour logs

3. **Loading states**
   - Skeleton loaders pendant le chargement
   - États isLoading par requête

4. **Refresh manuel**
   - Bouton pour invalider tout le cache
   - Rafraîchissement avec notification

## Configuration

Dans `.env.local`:
```env
VITE_API_URL=http://localhost:8055
VITE_API_TOKEN=your-token-here
VITE_USE_DEMO_DATA=true  # false pour API réelle
```

## Test

1. **Mode démo (par défaut)** :
   - Les données sont simulées localement
   - Pas besoin de Directus

2. **Mode API réelle** :
   - Changer `VITE_USE_DEMO_DATA=false`
   - Ajouter un token Directus valide
   - S'assurer que Directus tourne sur le port 8055

## Données disponibles

- **Companies** : Liste des entreprises
- **Projects** : Projets avec statuts et progression  
- **Finances** : Cash flow, ARR/MRR, runway
- **Metrics** : KPIs, alertes, insights
- **Charts** : Données formatées pour Recharts

## Prochaines étapes

1. Tester avec une vraie instance Directus
2. Ajouter les mutations (create, update, delete)
3. Implémenter les filtres par entreprise
4. Ajouter WebSocket pour temps réel