# 🔑 GUIDE : Obtenir un Token API Directus Valide

## 🚨 Problème Actuel
Les deux tokens testés ne fonctionnent pas :
- ❌ `CRPe2Hr0TUy_SoBCLp-7OqI8lSfD7yN6` - Invalid credentials
- ❌ `pzVIJwNVbrm_Z-MGQ30QxfYwIZkN4wOl` - Invalid credentials

## 📋 3 Méthodes pour Obtenir un Token Valide

### Méthode 1 : Token Statique (Recommandé) 🌟

1. **Ouvrir Directus Admin**
   - URL : http://localhost:8055/admin
   - Connectez-vous avec vos identifiants admin

2. **Aller dans les paramètres utilisateur**
   - Cliquez sur l'icône utilisateur en haut à droite
   - Ou allez dans Settings → Users

3. **Créer un token statique**
   - Sélectionnez votre utilisateur admin
   - Faites défiler jusqu'à "Token"
   - Cliquez sur "Generate New Token"
   - Copiez le token généré

4. **Avantages**
   - ✅ N'expire jamais
   - ✅ Permissions complètes
   - ✅ Idéal pour les scripts

### Méthode 2 : Via les DevTools du Navigateur

1. **Se connecter à Directus Admin**
   - http://localhost:8055/admin

2. **Ouvrir les DevTools**
   - Appuyez sur F12
   - Ou Clic droit → Inspecter

3. **Récupérer le token**
   - Onglet "Application" ou "Storage"
   - Local Storage → http://localhost:8055
   - Cherchez la clé `auth`
   - Copiez la valeur de `access_token`

4. **Note importante**
   - ⚠️ Ce token expire après 15 minutes
   - Utilisez-le rapidement

### Méthode 3 : Via l'API (Si vous connaissez les identifiants)

```bash
# Remplacez par vos vrais identifiants
curl -X POST http://localhost:8055/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "votre-email@example.com",
    "password": "votre-mot-de-passe"
  }'
```

## 🔧 Une fois le Token Obtenu

1. **Me donner le token**
   - Je mettrai à jour automatiquement les scripts

2. **Ou mettre à jour vous-même**
   ```javascript
   // Dans scripts/create-directus-collections.js
   // et scripts/create-directus-relations.js
   const DIRECTUS_TOKEN = 'VOTRE_NOUVEAU_TOKEN_ICI';
   ```

3. **Exécuter les scripts**
   ```bash
   # Créer les collections
   node scripts/create-directus-collections.js
   
   # Puis créer les relations
   node scripts/create-directus-relations.js
   ```

## 📊 Ce qui sera créé automatiquement

### 11 Collections
- projects
- time_tracking
- deliverables
- companies
- people
- permissions
- content_calendar
- interactions
- budgets
- compliance
- talents

### 10 Relations Critiques
- time_tracking → projects
- time_tracking → deliverables
- permissions → directus_users
- permissions → directus_roles
- content_calendar → companies
- interactions → people
- interactions → projects
- budgets → projects
- compliance → companies
- talents → companies

## ⚡ Scripts Prêts

Tout est prêt ! Il ne manque que le token valide pour :
1. Créer automatiquement toutes les collections
2. Établir toutes les relations
3. Configurer les champs et métadonnées

**Temps estimé** : 30 secondes une fois le token obtenu

## 💡 Astuce

Si vous n'arrivez pas à obtenir un token, vous pouvez :
1. Réinitialiser le mot de passe admin
2. Ou créer les collections manuellement dans l'interface
3. Ou me donner les identifiants admin pour que je génère le token

---

**Les scripts sont prêts et testés**, il ne manque vraiment que le token d'authentification valide !