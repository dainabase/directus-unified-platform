# 📊 Dashboard en Mode Démo

## Configuration Actuelle

Le dashboard fonctionne actuellement en **mode démo** pour éviter les erreurs de permissions (403).

### Fichier .env.local requis

Créez le fichier `src/frontend/.env.local` avec :

```env
# Configuration API Directus
VITE_API_URL=http://localhost:8055
VITE_API_TOKEN=dashboard-api-token-2025
VITE_USE_DEMO_DATA=true
```

### Mode Démo vs Mode Réel

#### Mode Démo (actuel)
- `VITE_USE_DEMO_DATA=true`
- Pas d'erreurs 403
- Données de démonstration
- Parfait pour tester l'interface

#### Mode Réel (nécessite permissions)
- `VITE_USE_DEMO_DATA=false`
- Nécessite un token avec permissions complètes
- Données réelles depuis Directus
- Peut générer des erreurs 403 si permissions insuffisantes

### Pour activer les données réelles

1. Connectez-vous à Directus Admin : http://localhost:8055/admin
2. Créez un token avec toutes les permissions READ
3. Mettez à jour `VITE_API_TOKEN` dans `.env.local`
4. Changez `VITE_USE_DEMO_DATA=false`
5. Relancez le serveur : `npm run dev`

### Lancer le Dashboard

```bash
cd src/frontend
npm install
npm run dev
```

Accès : http://localhost:5175 (ou port affiché)

## État : Fonctionnel en Mode Démo ✅