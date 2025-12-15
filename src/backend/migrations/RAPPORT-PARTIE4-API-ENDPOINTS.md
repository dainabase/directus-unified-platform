# RAPPORT PARTIE 4: API ENDPOINTS WORKFLOW COMMERCIAL

**Date**: 15 Décembre 2025
**Statut**: COMPLÉTÉ ✅

---

## 1. STRUCTURE DES ROUTES

```
src/backend/api/commercial/
├── index.js              # Router principal + documentation
├── quotes.routes.js      # Endpoints devis
├── deposits.routes.js    # Endpoints acomptes
├── cgv.routes.js         # Endpoints CGV
├── signatures.routes.js  # Endpoints signatures
├── portal.routes.js      # Endpoints portail client
└── pipeline.routes.js    # Endpoints statistiques pipeline
```

---

## 2. ENDPOINTS PAR MODULE

### 2.1 Quotes API (`/api/commercial/quotes`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/quotes` | Liste des devis avec filtres |
| GET | `/quotes/stats` | Statistiques des devis |
| GET | `/quotes/:id` | Récupérer un devis |
| GET | `/quotes/:id/workflow` | Statut workflow du devis |
| POST | `/quotes` | Créer un devis |
| POST | `/quotes/from-lead` | Convertir lead en devis |
| POST | `/quotes/:id/send` | Envoyer devis au client |
| PATCH | `/quotes/:id/status` | Mettre à jour statut |
| POST | `/quotes/:id/cgv-accept` | Enregistrer acceptation CGV |
| POST | `/quotes/:id/sign` | Marquer devis signé |

### 2.2 Deposits API (`/api/commercial/deposits`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/deposits/pending` | Acomptes en attente |
| GET | `/deposits/overdue` | Acomptes en retard |
| GET | `/deposits/stats` | Statistiques acomptes |
| GET | `/deposits/config/:owner_company_id` | Config acompte |
| POST | `/deposits/calculate/:quote_id` | Calculer montant |
| POST | `/deposits/invoice/:quote_id` | Créer facture acompte |
| POST | `/deposits/paid/:quote_id` | Marquer acompte payé |
| PATCH | `/deposits/config/:config_id` | MAJ config acompte |

### 2.3 CGV API (`/api/commercial/cgv`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/cgv/:owner_company_id` | CGV active |
| GET | `/cgv/:owner_company_id/versions` | Historique versions |
| GET | `/cgv/:owner_company_id/stats` | Stats CGV |
| POST | `/cgv` | Créer version CGV |
| POST | `/cgv/:cgv_id/activate` | Activer version |
| POST | `/cgv/accept` | Enregistrer acceptation |
| GET | `/cgv/check/:contact_id/:owner_company_id` | Vérifier acceptation |
| GET | `/cgv/history/:contact_id` | Historique acceptations |
| DELETE | `/cgv/acceptance/:acceptance_id` | Invalider acceptation |

### 2.4 Signatures API (`/api/commercial/signatures`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/signatures/request/:quote_id` | Créer demande DocuSeal |
| POST | `/signatures/initiate/:quote_id` | Initier processus signature |
| POST | `/signatures/manual/:quote_id` | Signature manuelle |
| GET | `/signatures/logs/:quote_id` | Logs signatures |
| GET | `/signatures/verify/:signature_log_id` | Vérifier signature |
| POST | `/signatures/webhook/docuseal` | Webhook DocuSeal |
| GET | `/signatures/types` | Types de signature |

### 2.5 Portal API (`/api/commercial/portal`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/portal/auth/login` | Connexion portail |
| POST | `/portal/auth/activate` | Activer compte |
| POST | `/portal/auth/forgot-password` | Mot de passe oublié |
| POST | `/portal/auth/reset-password` | Réinitialiser MDP |
| GET | `/portal/auth/verify` | Vérifier token |
| GET | `/portal/me` | Profil utilisateur |
| PATCH | `/portal/me/preferences` | MAJ préférences |
| POST | `/portal/accounts` | Créer compte (admin) |

### 2.6 Pipeline API (`/api/commercial/pipeline`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/pipeline/stats` | Stats pipeline |
| GET | `/pipeline/dashboard` | Dashboard complet |
| GET | `/pipeline/funnel` | Données funnel conversion |
| GET | `/pipeline/kpis` | KPIs principaux |
| GET | `/pipeline/activity` | Activité récente |

---

## 3. DOCUMENTATION API

Endpoint de documentation disponible:
- `GET /api/commercial/docs` - Documentation JSON complète

---

## 4. AUTHENTIFICATION

### Portal (JWT)
```javascript
// Login
POST /api/commercial/portal/auth/login
Body: { email, password }
Response: { token, user }

// Usage
Authorization: Bearer <jwt_token>
```

### Admin (Directus Token)
```javascript
Authorization: Bearer <directus_token>
```

---

## 5. INTÉGRATION SERVER.JS

Ajouté au serveur principal:

```javascript
// API COMMERCIAL - WORKFLOW COMPLET
try {
  const commercialRoutes = await import('./api/commercial/index.js');
  app.use('/api/commercial', commercialRoutes.default);
  console.log('✅ API Commercial connectée: /api/commercial');
} catch (err) {
  console.warn('⚠️ API Commercial non disponible:', err.message);
}
```

---

## 6. EXEMPLES D'UTILISATION

### Créer un devis depuis un lead
```bash
curl -X POST http://localhost:3000/api/commercial/quotes/from-lead \
  -H "Content-Type: application/json" \
  -d '{
    "lead_id": "abc123",
    "project_type": "web_design",
    "line_items": [
      {"description": "Site web", "quantity": 1, "unit_price": 5000}
    ]
  }'
```

### Envoyer un devis
```bash
curl -X POST http://localhost:3000/api/commercial/quotes/QUOTE_ID/send \
  -H "Content-Type: application/json" \
  -d '{"create_portal_account": true}'
```

### Login portail client
```bash
curl -X POST http://localhost:3000/api/commercial/portal/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "client@example.com", "password": "password123"}'
```

### Dashboard pipeline
```bash
curl http://localhost:3000/api/commercial/pipeline/dashboard?owner_company_id=UUID
```

---

## 7. TOTAL ENDPOINTS

| Module | Nombre d'endpoints |
|--------|-------------------|
| Quotes | 10 |
| Deposits | 8 |
| CGV | 9 |
| Signatures | 7 |
| Portal | 8 |
| Pipeline | 5 |
| **TOTAL** | **47 endpoints** |

---

**Statut**: PARTIE 4 COMPLÉTÉE ✅
**Prêt pour**: PARTIE 5 - Hooks Directus Automatisations
