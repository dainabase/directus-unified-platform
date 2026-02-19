# AUDIT — Rôles et Permissions

> **Date** : 18 février 2026
> **Source** : Analyse du code backend (middleware, routes, services)

---

## 1. Rôles identifiés

### 1.1 Dans le code backend

| Rôle | Source | Authentification | Description |
|------|--------|-----------------|-------------|
| **SuperAdmin** | `auth.middleware.js` | JWT Bearer Token | Accès complet à toutes les entreprises et fonctions |
| **Admin** | `auth.middleware.js` | JWT Bearer Token | Administration d'une ou plusieurs entreprises |
| **User** | `auth.middleware.js` | JWT Bearer Token | Utilisateur standard, accès limité par entreprise |
| **Client** | `client-portal.service.js` | JWT Bearer Token (séparé) | Portail client — accès à ses devis, factures, projets |
| **Prestataire** | Non implémenté | — | Portail prestataire prévu mais pas d'auth |
| **Revendeur** | Non implémenté | — | Portail revendeur prévu mais pas d'auth |
| **API Key** | `flexibleAuth` middleware | Header X-API-Key | Accès programmatique (Finance API) |

### 1.2 Dans Directus

Les rôles Directus sont gérés via `directus_roles` et configurés dans l'admin Directus (port 8055). Les rôles suivants sont référencés dans le code :

- **Administrator** — Rôle Directus par défaut, accès complet
- **Public** — Accès non-authentifié (pas de permissions CRUD)

> **Note** : L'absence de rôles Directus dédiés (Client, Prestataire, Revendeur) est une lacune critique. Le backend Express gère sa propre couche d'authentification indépendante de Directus.

---

## 2. Mécanisme d'authentification

### 2.1 Architecture à double couche

```
┌─────────────────────────────────┐
│     Frontend React (5173)       │
│  ├── SuperAdmin Portal          │
│  ├── Client Portal (JWT propre) │
│  ├── Prestataire (pas d'auth)   │
│  └── Revendeur (pas d'auth)     │
└────────────┬────────────────────┘
             │
     ┌───────┴───────┐
     │               │
┌────┴────┐   ┌──────┴──────┐
│ Express │   │   Directus   │
│  (3000) │   │   (8055)     │
│ JWT +   │   │ Token admin  │
│ bcrypt  │   │ (DIRECTUS_   │
│ + brute │   │  ADMIN_TOKEN)│
│  force  │   └──────────────┘
└─────────┘
```

### 2.2 Flux d'authentification SuperAdmin

```
1. POST /api/auth/login {email, password}
2. Vérification bcrypt du mot de passe
3. Vérification brute force (5 tentatives, 15min lockout)
4. Lookup dans : directus_users, portal_users, finance_users
5. Génération JWT (access_token + refresh_token)
6. Stockage côté client : localStorage
7. Chaque requête : Header Authorization: Bearer <token>
```

### 2.3 Flux d'authentification Client Portal

```
1. POST /api/commercial/portal/login {email, password}
2. Vérification dans collection portal_users ou contacts
3. JWT dédié (client_portal_token)
4. Stockage : localStorage.client_portal_token
5. Auto-vérification : POST /api/commercial/portal/verify
6. Refresh token : localStorage.client_portal_refresh
7. Auto-logout sur réponse 401
```

---

## 3. Middleware de permissions

### 3.1 Middlewares disponibles

| Middleware | Fichier | Usage | État |
|-----------|---------|-------|------|
| `authMiddleware` | auth.middleware.js | JWT Bearer obligatoire | ✅ Implémenté |
| `optionalAuth` | auth.middleware.js | JWT optionnel (endpoints publics) | ✅ Implémenté |
| `flexibleAuth` | auth.middleware.js | JWT OU X-API-Key | ✅ Implémenté |
| `companyAccess` | auth.middleware.js | Vérifie user.companies inclut :company | ✅ Implémenté |
| `requireRole` | auth.middleware.js | Vérifie le rôle (admin, superadmin) | ✅ Implémenté |
| `requirePermission` | auth.middleware.js | Permission granulaire | ✅ Implémenté |
| `checkLoginAttempts` | auth.middleware.js | Brute force (5 tentatives, 15min) | ✅ Implémenté |

### 3.2 Application par route

| Route | Auth | Company Check | Role Check | Notes |
|-------|------|---------------|------------|-------|
| `/api/auth/*` | Aucune (login) / JWT (autres) | Non | Non | Login public |
| `/api/finance/*` | flexibleAuth | Oui (param :company) | Non | JWT ou API Key |
| `/api/commercial/quotes/*` | authMiddleware | Oui | Non | JWT obligatoire |
| `/api/commercial/portal/*` | JWT client dédié | Par contact_id | Non | Auth séparée |
| `/api/collection/*` | ⚠️ TODO | ⚠️ TODO | ⚠️ TODO | **MANQUANT** |
| `/api/legal/*` | ⚠️ TODO | ⚠️ TODO | ⚠️ TODO | **MANQUANT** |
| `/api/integrations/*` | authMiddleware | Non | Non | Admin implicite |
| `/api/invoice-ninja/*` | Aucune explicite | Non | Non | **MANQUANT** |
| `/api/revolut/*` | Aucune explicite | Non | Non | **MANQUANT** |
| `/api/mautic/*` | Aucune explicite | Non | Non | **MANQUANT** |
| `/api/erpnext/*` | Aucune explicite | Non | Non | **MANQUANT** |
| `/api/ocr/*` | Aucune explicite | Non | Non | **MANQUANT** |

---

## 4. Permissions manquantes critiques

### 4.1 Routes sans authentification

| Route | Risque | Impact | Priorité |
|-------|--------|--------|----------|
| `/api/collection/*` | **ÉLEVÉ** | Accès aux données de recouvrement sans auth | CRITIQUE |
| `/api/legal/*` | **ÉLEVÉ** | Modification CGV sans auth | CRITIQUE |
| `/api/invoice-ninja/*` | **MOYEN** | Accès aux factures Invoice Ninja | HAUTE |
| `/api/revolut/*` | **ÉLEVÉ** | Accès aux transactions bancaires | CRITIQUE |
| `/api/mautic/*` | **MOYEN** | Accès marketing automation | HAUTE |
| `/api/erpnext/*` | **MOYEN** | Accès données comptables | HAUTE |
| `/api/ocr/scan-invoice` | **MOYEN** | Upload et scan de documents | HAUTE |

### 4.2 Vérifications manquantes dans le code

Identifié par les commentaires TODO :

```javascript
// api/legal/legal.routes.js, ligne 14
// TODO: Vérifier le token d'authentification

// api/collection/collection.routes.js, ligne 14
// TODO: Vérifier le token d'authentification

// api/collection/collection.routes.js, ligne 19
// TODO: Vérifier l'accès utilisateur

// api/commercial/signatures.routes.js, ligne 159
// TODO: Vérifier la signature du webhook DocuSeal
```

---

## 5. Matrice de permissions recommandée

### 5.1 Permissions par rôle (à implémenter)

| Ressource | SuperAdmin | Admin | User | Client | Prestataire | Revendeur |
|-----------|-----------|-------|------|--------|-------------|-----------|
| **Finance** | CRUD all | CRUD own company | Read own | — | — | — |
| **Invoices** | CRUD all | CRUD own company | Read own | Read own | Read assigned | Read own |
| **Quotes** | CRUD all | CRUD own company | CRUD own | Read/Accept | — | Read own |
| **Collection** | CRUD all | CRUD own company | Read own | — | — | — |
| **CGV** | CRUD all | CRUD own company | Read | Accept | Accept | Accept |
| **Signatures** | CRUD all | CRUD own company | Read | Sign | Sign | Sign |
| **Projects** | CRUD all | CRUD own company | CRUD assigned | Read own | Read assigned | — |
| **CRM** | CRUD all | CRUD own company | CRUD own | — | — | — |
| **Leads** | CRUD all | CRUD own company | CRUD assigned | — | — | — |
| **Marketing** | CRUD all | CRUD own company | Read | — | — | — |
| **Support** | CRUD all | CRUD own company | CRUD own | Create/Read own | Create/Read own | Create/Read own |
| **HR** | CRUD all | CRUD own company | Read own | — | — | — |
| **Settings** | CRUD all | Read own company | — | — | — | — |
| **Bank** | Read all | Read own company | — | — | — | — |
| **Users** | CRUD all | Read own company | Read self | Read self | Read self | Read self |

### 5.2 Filtrage multi-entreprise

Toutes les requêtes doivent être filtrées par `owner_company` selon les entreprises assignées à l'utilisateur :

```javascript
// Pattern attendu pour chaque route
const userCompanies = req.user.companies; // ['HYPERVISUAL', 'LEXIA']
const requestedCompany = req.params.company || req.query.owner_company;

if (!userCompanies.includes(requestedCompany)) {
  return res.status(403).json({ error: 'Access denied to this company' });
}
```

---

## 6. Token blacklist et sécurité

### 6.1 État actuel

| Fonctionnalité | État | Risque |
|----------------|------|--------|
| Blacklist tokens | In-memory Set (non-persistant) | **ÉLEVÉ** — Perdue au redémarrage |
| Brute force protection | In-memory Map (5 tentatives) | **MOYEN** — Perdu au redémarrage |
| Token expiration | JWT exp claim | ✅ OK |
| Refresh token | Implémenté | ✅ OK |
| Password hashing | bcrypt | ✅ OK |
| Password strength | 8+ chars, mixte | ✅ OK |

### 6.2 Recommandations sécurité

1. **CRITIQUE** : Migrer blacklist et brute force vers Redis
2. **CRITIQUE** : Ajouter auth sur routes /api/collection, /api/legal, /api/revolut
3. **HAUTE** : Vérifier la signature des webhooks DocuSeal
4. **HAUTE** : Ajouter rate limiting global (express-rate-limit est installé mais pas utilisé globalement)
5. **MOYENNE** : Implémenter des rôles Directus dédiés pour chaque type de portail
6. **MOYENNE** : Ajouter audit trail pour les actions sensibles (connexions, modifications financières)
7. **BASSE** : Migrer vers des cookies HttpOnly pour le stockage des tokens (au lieu de localStorage)

---

## 7. Résumé

| Aspect | État | Score |
|--------|------|-------|
| Authentification SuperAdmin | ✅ Implémentée | 8/10 |
| Authentification Client | ✅ Implémentée | 7/10 |
| Authentification Prestataire | ❌ Absente | 0/10 |
| Authentification Revendeur | ❌ Absente | 0/10 |
| Middleware JWT | ✅ Robuste | 8/10 |
| Filtrage multi-entreprise | ⚠️ Partiel | 5/10 |
| Protection routes sensibles | ⚠️ Incomplet | 3/10 |
| Persistance sécurité (Redis) | ❌ Non-persistant | 2/10 |
| Rôles Directus | ⚠️ Basique | 3/10 |
| **Score global sécurité** | | **4/10** |
