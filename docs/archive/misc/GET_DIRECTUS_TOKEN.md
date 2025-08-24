# 🔑 Comment obtenir un token Directus valide

## ✅ CORS fonctionne !
Les headers CORS sont correctement configurés. Il faut maintenant un token valide.

## 📝 Étapes pour créer un token

### 1. Se connecter à Directus Admin
- URL : http://localhost:8055/admin
- Email : admin@dainabase.com
- Password : YhI3FayWKfkrXcdYd7AuWQ== (depuis le .env)

### 2. Créer un token API
1. Aller dans **Settings** (icône engrenage en bas à gauche)
2. Cliquer sur **Access Tokens**
3. Cliquer sur **+** pour créer un nouveau token
4. Remplir :
   - **Name** : Dashboard React
   - **Token** : Laisser vide pour générer automatiquement
   - **Status** : Active
   - **Role** : Administrator (ou un rôle avec accès complet)
5. Cliquer sur **Save**
6. **COPIER LE TOKEN** (il ne sera plus visible après)

### 3. Mettre à jour .env.local
```env
VITE_API_TOKEN=VOTRE_NOUVEAU_TOKEN_ICI
VITE_USE_DEMO_DATA=false
```

### 4. Redémarrer le frontend
```bash
# Arrêter avec Ctrl+C
# Relancer
npm run dev
```

## 🧪 Vérifier que ça fonctionne

1. Ouvrir http://localhost:5175
2. Ouvrir la console (F12)
3. Vérifier :
   - ✅ "📊 Mode démo" n'apparaît PAS
   - ✅ Les requêtes API passent
   - ✅ Les données s'affichent

## 🚀 Alternative : Utiliser un token statique

Si vous préférez, vous pouvez créer un token statique directement dans la base :

```bash
# Se connecter au container postgres
docker exec -it directus-unified-platform-postgres-1 psql -U directus

# Créer un token
INSERT INTO directus_users (id, email, password, status, role, token)
VALUES (
  '12345678-1234-1234-1234-123456789012',
  'api@dashboard.com',
  'unused',
  'active',
  '820f75d9-c23e-4f7f-bc34-2a58c7b20920', -- ID du rôle admin
  'dashboard-token-2025'
);
```

Puis utiliser `dashboard-token-2025` comme token.

## 🎯 Résultat final

Avec un token valide :
- Dashboard affiche les vraies données
- Plus d'erreurs 401
- Graphiques mis à jour en temps réel
- Mode démo désactivé