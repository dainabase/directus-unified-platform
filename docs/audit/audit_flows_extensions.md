# AUDIT — Flows, Extensions et Hooks

> **Date** : 18 février 2026
> **Source** : Analyse du code dans src/backend/hooks/, extensions/, et configuration Directus

---

## 1. Hooks Directus (Backend Express)

Les hooks sont implémentés comme des modules Express dans `src/backend/hooks/` plutôt que comme des extensions Directus natives.

### 1.1 Hooks commerciaux

| Fichier | Trigger | Actions | État |
|---------|---------|---------|------|
| `hooks/commercial/quote-hooks.js` | Création/mise à jour de devis | Notification email (Mautic), notification équipe (Slack), alerte expiration | ⚠️ PARTIEL — 3 TODO (email, webhook Slack, expiry) |
| `hooks/commercial/lead-hooks.js` | Création/conversion de leads | Sync Mautic, analytics, notification Slack, email équipe commerciale, tâche PM | ⚠️ PARTIEL — 5 TODO non implémentés |
| `hooks/commercial/invoice-hooks.js` | Création/mise à jour factures | Sync Invoice Ninja, entrée journal audit | ⚠️ PARTIEL — 2 TODO (sync Ninja, audit log) |
| `hooks/commercial/scheduler.js` | Tâches planifiées (cron) | Relance devis expirés, rappels paiement, rapports, Slack | ⚠️ PARTIEL — 7 TODO (notifications, emails, rapports, Slack) |

### 1.2 Analyse des hooks

**Total TODO dans les hooks : 17**

Les hooks sont structurés correctement mais l'implémentation effective est incomplète :

- **Structure** : Chaque hook capture l'événement et prépare le payload ✅
- **Logique métier** : Les conditions de déclenchement sont définies ✅
- **Actions externes** : Les appels à Mautic, Slack, Invoice Ninja sont commentés comme TODO ❌
- **Scheduler** : La planification cron est en place mais les actions sont des stubs ⚠️

---

## 2. Extensions Directus

### 2.1 Dossier extensions/

| Chemin | Type | Description | État |
|--------|------|-------------|------|
| `extensions/` | Répertoire | Dossier d'extensions Directus monté via Docker volume | Présent |
| `directus/extensions/` | Répertoire | Extensions Directus spécifiques | ⚠️ Contenu minimal |

### 2.2 Endpoints custom

Aucun endpoint custom Directus natif n'a été identifié dans le dossier `extensions/endpoints/`. Tous les endpoints sont implémentés via Express (port 3000) et non comme extensions Directus.

**Architecture choisie** : Express comme proxy + API layer, Directus comme data layer pur.

```
Frontend (5173) ──→ Express API (3000) ──→ Directus REST (8055)
                         │
                    Business Logic
                    (Services, Hooks)
```

### 2.3 Modules custom Directus

Aucun module custom Directus n'a été identifié. L'interface d'administration Directus est utilisée "as-is" sans personnalisation.

### 2.4 Interfaces et displays custom

Aucune interface ou display custom Directus n'a été identifiée dans le code.

---

## 3. Flows Directus

### 3.1 Flows identifiés

L'analyse du code ne révèle pas de flows Directus configurés via l'interface d'administration. La logique d'automatisation est entièrement gérée par :

1. **Express middleware** — Intercepte les requêtes
2. **Service layer** — Exécute la logique métier
3. **Hooks Express** — Réagit aux événements
4. **Scheduler Express** — Tâches planifiées

> **Note** : Pour confirmer l'absence ou la présence de flows Directus natifs, un accès direct à l'admin Directus (port 8055) ou à la table `directus_flows` serait nécessaire.

### 3.2 Automatisations implémentées hors Directus

| Automatisation | Implémentation | Trigger | État |
|---------------|---------------|---------|------|
| Workflow commercial complet | Express services | API calls | ✅ Fonctionnel |
| Relance devis | Scheduler Express | Cron (planifié) | ⚠️ Partiel (notifications TODO) |
| Rappels paiement | Scheduler Express | Cron | ⚠️ Partiel |
| Sync Invoice Ninja | Webhook + API | Événement paiement | ✅ Fonctionnel |
| Sync Mautic contacts | API directe | Création lead/contact | ✅ Fonctionnel |
| Signature DocuSeal | Webhook | Événement signature | ✅ Fonctionnel |
| OCR factures | API directe | Upload fichier | ✅ Fonctionnel |
| Rapprochement bancaire | API directe | Manuel | ✅ Fonctionnel |
| Orchestration multi-outils | Express service | Événement commercial | ✅ Fonctionnel |

---

## 4. Orchestration des intégrations

### 4.1 Service d'orchestration

**Fichier** : `src/backend/api/integrations/index.js`

Le service d'orchestration coordonne plusieurs intégrations en réponse à un événement unique :

| Événement | DocuSeal | Mautic | Invoice Ninja | Directus |
|-----------|----------|--------|--------------|----------|
| Quote envoyé | Demande signature | Campagne "quote-sent" | Sync facture | Mise à jour statut |
| Quote signé | — | Campagne "signed" | Facture acompte | Mise à jour statut |
| Paiement reçu | — | Tracking paiement | Mise à jour statut | Mise à jour facture |
| Lead créé | — | Sync + nurturing | — | Création lead |

### 4.2 Webhooks configurés

| Service | Endpoint webhook | Signature | État |
|---------|-----------------|-----------|------|
| DocuSeal | `POST /api/integrations/docuseal/webhook` | ⚠️ TODO | ⚠️ Vérification signature manquante |
| Invoice Ninja | `POST /api/invoice-ninja/webhook` | Non vérifié | ⚠️ Pas de vérification |
| Revolut | `POST /api/revolut/webhook-handler` | HMAC vérifié | ✅ Implémenté |
| Mautic | `POST /api/mautic/webhook` | Non vérifié | ⚠️ Pas de vérification |
| LP Agency | `POST /api/collection/lp/webhook` | Non vérifié | ⚠️ Pas de vérification |

---

## 5. Scripts de migration et seed

### 5.1 Migrations base de données

| Script | Chemin | Description | État |
|--------|--------|-------------|------|
| Migrations Directus | `migrations/` | Migrations schéma Directus | Présent |
| Migration owner_company | `owner-company-migration/` | Ajout FK owner_company | ✅ Exécuté |
| Backup SQL | `backup_before_finance_fix.sql` (9.7 MB) | Sauvegarde complète | ✅ Présent |

### 5.2 Scripts de seed

| Script | Chemin | Description | État |
|--------|--------|-------------|------|
| seed-leads.js | `scripts/` | Population données leads | Présent |
| create-admin-user.js | `scripts/` | Création utilisateur admin | Présent |
| populate-directus.js | `src/frontend/` | Population initiale Directus | Présent |
| create-directus-relations.js | `src/frontend/` | Création relations Directus | Présent |

---

## 6. Docker et déploiement

### 6.1 Docker Compose principal

```yaml
# docker-compose.yml
services:
  directus:
    image: directus/directus:11.10.0
    ports: ["8055:8055"]
    volumes:
      - ./database:/directus/database
      - ./uploads:/directus/uploads
      - ./extensions:/directus/extensions
    environment:
      DB_CLIENT: pg
      DB_HOST: postgres
      DB_PORT: 5432
      CORS_ORIGIN: "http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:3000"
      RELATIONAL_BATCH_SIZE: 15000
      DB_POOL__MIN: 10
      DB_POOL__MAX: 50

  postgres:
    image: postgres:15-alpine
    ports: ["5432:5432"]
    volumes:
      - postgres_data:/var/lib/postgresql/data
```

### 6.2 PM2 (Production)

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'directus-unified-platform',
    script: 'server.js',
    // Configuration PM2 pour production
  }]
};
```

### 6.3 Configuration MCP

```yaml
# docker-compose.mcp.yml
# Configuration pour l'intégration MCP (Claude)
```

---

## 7. Résumé et recommandations

### État des automatisations

| Catégorie | Implémenté | Partiel | Absent | Score |
|-----------|-----------|---------|--------|-------|
| Flows Directus natifs | 0 | 0 | N/A | — |
| Hooks Express | 0 | 4 | 0 | 4/10 |
| Scheduler | 0 | 1 | 0 | 3/10 |
| Orchestration | 4 | 1 | 0 | 8/10 |
| Webhooks | 1 | 4 | 0 | 4/10 |
| Extensions Directus | 0 | 0 | N/A | — |

### Recommandations prioritaires

1. **CRITIQUE** : Compléter la vérification des signatures webhooks (DocuSeal, Invoice Ninja, Mautic)
2. **HAUTE** : Implémenter les 17 TODO dans les hooks commerciaux
3. **HAUTE** : Ajouter un système de queue (BullMQ est installé mais pas utilisé) pour les tâches asynchrones
4. **MOYENNE** : Évaluer la migration de certains hooks vers des Flows Directus natifs pour la maintenance
5. **MOYENNE** : Implémenter le scheduler cron avec node-cron ou BullMQ pour les relances automatiques
6. **BASSE** : Documenter chaque automatisation avec un diagramme de séquence
