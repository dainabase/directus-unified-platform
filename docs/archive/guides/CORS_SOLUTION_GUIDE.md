# 🔧 Guide de résolution CORS Directus

## Problème identifié
Le frontend React (port 5173) ne peut pas accéder à l'API Directus (port 8055) à cause du blocage CORS.

## Solution implémentée

### 1. Configuration CORS dans `.env`
✅ Ajouté dans `.env`:
```env
CORS_ENABLED=true
CORS_ORIGIN=http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:3000
CORS_CREDENTIALS=true
CORS_METHODS=GET,POST,PUT,PATCH,DELETE,OPTIONS
CORS_ALLOWED_HEADERS=Content-Type,Authorization,X-Requested-With
CORS_EXPOSED_HEADERS=Content-Range,X-Content-Range
CORS_MAX_AGE=18000
```

### 2. Configuration Docker
✅ Mis à jour `docker-compose.yml` avec les variables CORS

### 3. Token API configuré
✅ Token ajouté dans `.env.local`:
```env
VITE_API_TOKEN=de366613eba7c0fa39d9e6c3ced8b0ac282fe7726741e44d9f04dd65ca67ca3c
VITE_USE_DEMO_DATA=false
```

## 🚀 Instructions pour activer

### Étape 1: Redémarrer Directus
```bash
# Arrêter Directus
docker-compose down

# Redémarrer avec la nouvelle config
docker-compose up -d

# Vérifier les logs
docker-compose logs -f directus
```

### Étape 2: Tester la connexion
```bash
# Dans le dossier frontend
cd src/frontend
node test-api.js
```

### Étape 3: Relancer le frontend
```bash
# Arrêter le serveur dev (Ctrl+C)
# Relancer pour prendre en compte .env.local
npm run dev
```

## 🧪 Vérification

1. Ouvrir http://localhost:5175
2. Ouvrir la console du navigateur (F12)
3. Vérifier :
   - ✅ Pas d'erreurs CORS
   - ✅ Requêtes vers l'API réussies
   - ✅ Données réelles affichées (pas mode démo)

## 🔍 Dépannage

### Si CORS toujours bloqué :
1. Vérifier que Directus est bien redémarré
2. Vérifier les logs Docker : `docker-compose logs directus | grep CORS`
3. Tester avec curl :
```bash
curl -I http://localhost:8055/items/companies \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: GET"
```

### Si token invalide :
1. Se connecter à Directus Admin : http://localhost:8055/admin
2. Aller dans Settings > Access Tokens
3. Créer un nouveau token
4. Mettre à jour `.env.local`

### Alternative rapide (test uniquement) :
Lancer Chrome sans CORS :
```bash
# Mac
open -n -a /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --args --user-data-dir="/tmp/chrome_dev_test" --disable-web-security

# Windows
"C:\Program Files\Google\Chrome\Application\chrome.exe" --disable-web-security --user-data-dir=~/chromeTemp
```

## ✅ Résultat attendu

Après redémarrage :
- Dashboard affiche les vraies données Directus
- Pas d'erreurs CORS dans la console
- Les graphiques se mettent à jour automatiquement
- Le bouton "Actualiser" fonctionne