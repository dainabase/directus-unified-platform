# 🔒 JOUR 1 - Implémentation Sécurité : Hashage des Mots de Passe

## ✅ Tâches Complétées

### 1. Installation et Configuration bcryptjs
- **Package**: `bcryptjs` (version pure JS, sans dépendances natives)
- **Salt rounds**: 12 (haute sécurité)
- **Raison**: bcrypt natif avait des problèmes de compilation avec node-gyp

### 2. Service de Gestion des Mots de Passe
**Fichier**: `/server/services/password.service.js`

**Fonctionnalités**:
- ✅ Hashage sécurisé avec bcryptjs (12 salt rounds)
- ✅ Vérification de mots de passe
- ✅ Validation de la force (min 8 chars, majuscule, minuscule, chiffre, spécial)
- ✅ Génération de mots de passe sécurisés
- ✅ Vérification contre HaveIBeenPwned API

### 3. Script de Migration
**Fichier**: `/server/scripts/migrate-passwords.js`

**Fonctionnalités**:
- ✅ Migration des mots de passe en clair vers hash bcrypt
- ✅ Génération de nouveaux mots de passe sécurisés
- ✅ Sauvegarde dans `.migration-passwords.txt` (permissions 0600)
- ✅ Support mode local avec `local-test-users.json`
- ✅ Force le changement au premier login

**Commande**: `npm run migrate-passwords`

### 4. Module d'Authentification Sécurisé
**Fichier**: `/server/routes/auth.js`

**Endpoints**:
- `POST /api/auth/login` - Connexion avec rate limiting
- `POST /api/auth/change-password` - Changement de mot de passe
- `POST /api/auth/forgot-password` - Réinitialisation (TODO: email)
- `GET /api/auth/verify` - Vérification token JWT
- `POST /api/auth/logout` - Déconnexion

**Sécurité Implémentée**:
- ✅ JWT tokens (expiration 24h)
- ✅ Rate limiting (5 tentatives / 15 min)
- ✅ Blocage temporaire après échecs
- ✅ Messages d'erreur génériques (pas de révélation d'existence)
- ✅ Validation force mot de passe
- ✅ Vérification mots de passe compromis

### 5. Serveur Express Sécurisé
**Fichier**: `/server/server.js`

**Middlewares de Sécurité**:
- ✅ Helmet avec CSP personnalisé
- ✅ CORS restrictif
- ✅ Rate limiting global (100 req/min)
- ✅ Rate limiting auth (5 tentatives/15 min)
- ✅ Protection routes avec JWT
- ✅ Gestion erreurs sécurisée

## 🧪 Tests

### Script de Test
**Fichier**: `/server/test-auth.js`

**Tests Couverts**:
1. Health check
2. Login avec mauvais identifiants
3. Login avec utilisateur valide
4. Accès route protégée sans token
5. Accès route protégée avec token
6. Vérification token
7. Rate limiting
8. Mot de passe oublié

**Commande**: `npm test`

## 📝 Configuration Requise

### Variables d'Environnement (.env)
```env
# JWT
JWT_SECRET=dev_secret_key_change_this_in_production_please_123456789
JWT_EXPIRES_IN=24h

# Notion API
NOTION_API_KEY=secret_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
DB_UTILISATEURS=226adb95-3c6f-806f-b52b-c960b93f9a09

# Server
PORT=8001
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:8000,http://localhost:8001
```

## 🚀 Utilisation

### 1. Migration Initiale
```bash
cd server
npm run migrate-passwords
```

### 2. Démarrage du Serveur
```bash
npm run dev  # Mode développement
npm start    # Mode production
```

### 3. Test de l'Authentification
```bash
npm test
```

## ⚠️ Points d'Attention

1. **Mots de passe générés**: Sauvegardés dans `.migration-passwords.txt`
   - ENVOYER aux utilisateurs de manière sécurisée
   - SUPPRIMER le fichier après envoi

2. **Utilisateurs de test** (mode dev):
   - client@hypervisual.ch
   - presta@hypervisual.ch
   - revend@hypervisual.ch
   - admin@hypervisual.ch

3. **Notion API**: 
   - Nécessite les champs: PasswordHash, PasswordUpdatedAt, RequiresPasswordChange
   - En cas d'erreur, fallback sur `local-test-users.json`

## 🔐 Sécurité Ajoutée

### Avant
- ❌ Mots de passe en clair
- ❌ SHA256 simple (non sécurisé)
- ❌ Pas de rate limiting
- ❌ Pas de validation

### Après
- ✅ bcrypt avec 12 salt rounds
- ✅ JWT authentification
- ✅ Rate limiting anti brute-force
- ✅ Validation force mot de passe
- ✅ Vérification HaveIBeenPwned
- ✅ Messages erreur génériques
- ✅ Blocage temporaire après échecs

## 📊 Résumé JOUR 1

**Fichiers Créés**: 5
1. `/server/services/password.service.js`
2. `/server/scripts/migrate-passwords.js`
3. `/server/test-auth.js`
4. `/server/SECURITY-DAY1.md`
5. `/server/.env` (template)

**Fichiers Modifiés**: 2
1. `/server/routes/auth.js` - Refonte complète
2. `/server/server.js` - Ajout sécurité avancée

**Prochaines Étapes (JOUR 2)**:
- Redis pour rate limiting distribué
- Protection CSRF
- Sessions sécurisées
- 2FA (optionnel)