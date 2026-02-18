# AUDIT — Intégrations Externes

> **Date** : 18 février 2026
> **Intégrations analysées** : 8 services externes

---

## 1. Vue d'ensemble

| Service | Version | Usage | Endpoints | État global |
|---------|---------|-------|-----------|-------------|
| **Invoice Ninja** | v2.0.0 | Facturation | 25 | ✅ Production-ready |
| **Revolut Business** | v2.0.0 | Banking (5 comptes) | 17 | ⚠️ Partiel |
| **Mautic** | v2.0.0 | Marketing automation | 17 | ✅ Production-ready |
| **DocuSeal** | v1.0.0 | Signatures électroniques | 7 | ✅ Production-ready |
| **ERPNext** | v1.0.0 | Comptabilité | 8 | ⚠️ Stub/partiel |
| **OpenAI Vision** | v1.0.0 | OCR factures | 1 | ✅ Fonctionnel |
| **Notion** | Legacy | Sync documents | 4 | ⚠️ Legacy (non migré) |
| **Cloudinary** | — | Stockage médias | 0 | ❌ Non implémenté |

---

## 2. Invoice Ninja

**Fichiers** :
- `src/backend/api/invoice-ninja/index.js` — Router principal
- `src/backend/api/invoice-ninja/invoice-ninja-api.js` — Client API
- `src/backend/api/invoice-ninja/sync.js` — Sync bidirectionnelle
- `src/backend/services/integrations/invoice-ninja.service.js` — Service layer
- `integrations/invoice-ninja/sync-invoices.js` — Scripts sync
- `integrations/invoice-ninja/setup-invoice-ninja.js` — Configuration

**Configuration** :
```env
INVOICE_NINJA_URL=http://localhost:8082
INVOICE_NINJA_API_TOKEN=test-temporary-token
INVOICE_NINJA_COMPANY_ID=1
```

**Fonctionnalités implémentées** :

| Fonctionnalité | État | Description |
|---------------|------|-------------|
| CRUD Clients | ✅ | Création, lecture, mise à jour, suppression |
| CRUD Factures | ✅ | Gestion complète du cycle de vie |
| CRUD Paiements | ✅ | Enregistrement et suivi |
| CRUD Produits | ✅ | Catalogue synchronisé |
| CRUD Devis | ✅ | Avec conversion en facture |
| Sync Directus↔Ninja | ✅ | Bidirectionnelle contacts et factures |
| Webhook paiements | ✅ | Réception événements de paiement |
| Factures acompte | ✅ | 30% par défaut, configurable |
| Téléchargement PDF | ✅ | Via API Invoice Ninja |
| Envoi email | ✅ | Via Invoice Ninja |
| TVA suisse | ✅ | 8.1%, 2.6%, 3.8% |
| Multi-entreprise | ✅ | Via API keys par company |

**Verdict** : ✅ **PRODUCTION-READY** — Intégration la plus complète

---

## 3. Revolut Business

**Fichiers** :
- `integrations/revolut/index.js` — Router Express (~200 lignes)
- `integrations/revolut/revolut-api.js` — Client OAuth2 (~150 lignes)
- `integrations/revolut/test-revolut-integration.js` — Tests
- `integrations/revolut/api/` — Modules API

**Configuration** :
```env
REVOLUT_ENV=sandbox
REVOLUT_WEBHOOK_SECRET=revolut_webhook_secret_key

# 5 comptes entreprise avec OAuth2 séparé :
REVOLUT_HYPERVISUAL_CLIENT_ID=your_client_id_here
REVOLUT_HYPERVISUAL_PRIVATE_KEY_PATH=./certs/hypervisual-private.pem
REVOLUT_DYNAMICS_CLIENT_ID=your_client_id_here
REVOLUT_DYNAMICS_PRIVATE_KEY_PATH=./certs/dynamics-private.pem
REVOLUT_LEXIA_CLIENT_ID=your_client_id_here
REVOLUT_NKREALITY_CLIENT_ID=your_client_id_here
REVOLUT_ETEKOUT_CLIENT_ID=your_client_id_here

REVOLUT_SYNC_INTERVAL=60
REVOLUT_HISTORY_DAYS=30
REVOLUT_AUTO_SYNC=false
```

**Fonctionnalités implémentées** :

| Fonctionnalité | État | Description |
|---------------|------|-------------|
| Liste comptes | ✅ | Tous les comptes par entreprise |
| Détails compte | ✅ | Solde, devise, IBAN |
| Coordonnées bancaires | ✅ | IBAN, BIC, nom banque |
| Historique transactions | ✅ | Avec filtre dates (30 jours défaut) |
| Création paiements | ✅ | Virements sortants |
| Paiements planifiés | ✅ | Scheduling |
| Contreparties | ✅ | CRUD bénéficiaires |
| Taux de change | ✅ | Taux en temps réel |
| Change de devises | ✅ | Opérations de change |
| Webhook Revolut | ✅ | Avec vérification HMAC |
| Dashboard | ✅ | Données agrégées |
| OAuth2 multi-compte | ⚠️ | Structure en place, clés non configurées |
| Auto-sync Directus | ⚠️ | Logique présente, REVOLUT_AUTO_SYNC=false |
| Token refresh | ⚠️ | Implémenté, non testé |

**Verdict** : ⚠️ **PARTIELLEMENT FONCTIONNEL** — Code solide, configuration OAuth2 à finaliser

---

## 4. Mautic

**Fichiers** :
- `src/backend/api/mautic/router.js` — Router principal
- `src/backend/services/integrations/mautic.service.js` — Service (562 lignes)
- `integrations/mautic/scripts/setup-mautic-campaigns.js` — Setup campagnes
- `integrations/mautic/n8n-workflows/import-contacts-to-mautic.json` — Workflow n8n

**Configuration** :
```env
MAUTIC_URL=http://localhost:8084
MAUTIC_USERNAME=admin
MAUTIC_PASSWORD=mautic123

# 5 campagnes configurées :
MAUTIC_CAMPAIGN_QUOTE_SENT=1
MAUTIC_CAMPAIGN_QUOTE_FOLLOWUP=2
MAUTIC_CAMPAIGN_PAYMENT_REMINDER=3
MAUTIC_CAMPAIGN_WELCOME=4
MAUTIC_CAMPAIGN_LEAD_NURTURING=5

# 5 segments :
MAUTIC_SEGMENT_LEADS=1
MAUTIC_SEGMENT_PROSPECTS=2
MAUTIC_SEGMENT_CLIENTS=3
MAUTIC_SEGMENT_PENDING_QUOTES=4
MAUTIC_SEGMENT_OVERDUE_PAYMENTS=5
```

**Fonctionnalités implémentées** :

| Fonctionnalité | État | Description |
|---------------|------|-------------|
| Sync contacts | ✅ | Création/mise à jour avec champs custom (directus_id, company_id, owner_company) |
| Campagne quote-sent | ✅ | Déclenchée à l'envoi d'un devis |
| Campagne quote-followup | ✅ | Relance devis non répondus |
| Campagne payment-reminder | ✅ | Rappels paiement (niveaux escalade) |
| Campagne welcome | ✅ | Séquence bienvenue client converti |
| Campagne lead-nurturing | ✅ | Score ≥ 50 → nurturing automatique |
| Gestion segments | ✅ | 5 segments prédéfinis |
| Import bulk | ✅ | Import contacts depuis Directus |
| Statistiques campagnes | ✅ | Métriques par campagne/segment |
| Webhook Mautic | ✅ | Réception événements lead |
| Event tracking | ✅ | Timeline notes et événements |
| Dashboard marketing | ✅ | Vue d'ensemble |

**Verdict** : ✅ **PRODUCTION-READY** — Orchestration marketing complète

---

## 5. DocuSeal

**Fichier** : `src/backend/services/integrations/docuseal.service.js` (496 lignes)

**Configuration** :
```env
DOCUSEAL_API_URL=https://api.docuseal.co
DOCUSEAL_API_KEY=(à configurer)
DOCUSEAL_TEMPLATE_QUOTE=template_quote
DOCUSEAL_TEMPLATE_CGV=template_cgv
DOCUSEAL_TEMPLATE_CONTRACT=template_contract
WEBHOOK_BASE_URL=http://localhost:3000
```

**Fonctionnalités implémentées** :

| Fonctionnalité | État | Description |
|---------------|------|-------------|
| Signature devis | ✅ | createQuoteSignatureRequest() |
| Signature CGV | ✅ | createCGVSignatureRequest() |
| Suivi statut | ✅ | getSignatureStatus() |
| Webhook handler | ✅ | Events: completed, expired, declined |
| Annulation | ✅ | cancelSignatureRequest() |
| Relance email | ✅ | resendSignatureRequest() |
| Embed URL (iframe) | ✅ | getEmbedSigningUrl() |
| Multi-signataires | ✅ | Client + représentant entreprise |
| 3 niveaux signature | ✅ | SES (Simple), AES (Advanced), QES (Qualified/Swiss) |
| Pièces jointes | ✅ | Documents attachés à la soumission |
| Logging Directus | ✅ | Écriture dans signature_logs |

**Verdict** : ✅ **PRODUCTION-READY** — Intégration complète avec support QES suisse

---

## 6. ERPNext

**Fichier** : `src/backend/api/erpnext/index.js` (265 lignes)

**Configuration** :
```env
ERPNEXT_URL=http://localhost:8083
ERPNEXT_API_KEY=(à configurer)
ERPNEXT_API_SECRET=(à configurer)
```

**Fonctionnalités implémentées** :

| Fonctionnalité | État | Description |
|---------------|------|-------------|
| KPIs dashboard | ⚠️ | Lecture seule, données partielles |
| Graphique revenus | ⚠️ | Agrégation par mois, 12 mois |
| Breakdown entreprise | ⚠️ | Analyse par company |
| Activities feed | ⚠️ | Factures, paiements, clients |
| Sync Directus→ERPNext | ⚠️ | Migration script basique |
| Webhooks | ❌ | Non implémenté |
| GL entries export | ❌ | Non implémenté |
| Plan comptable import | ❌ | Non implémenté |

**Verdict** : ⚠️ **STUB** — Lectures basiques seulement, pas de sync bidirectionnelle

---

## 7. OpenAI Vision (OCR)

**Fichier** : `src/backend/server.js` (lignes 138-223)

**Configuration** :
```env
OPENAI_API_KEY=sk-proj-...(clé exposée dans .env)
OPENAI_MODEL=gpt-4-vision-preview
OPENAI_MAX_TOKENS=4096
OPENAI_TEMPERATURE=0.2
```

**Fonctionnalités implémentées** :

| Fonctionnalité | État | Description |
|---------------|------|-------------|
| Scan facture (image→texte) | ✅ | GPT-4 Vision |
| Extraction champs | ✅ | Montant, date, entreprise, numéro |
| Création brouillon Directus | ✅ | Auto-création supplier_invoice |
| Stockage données OCR | ✅ | Données brutes dans la facture |
| Parsing JSON | ✅ | Avec fallback en cas d'erreur |
| Endpoint status | ✅ | GET /api/ocr/status |

**Verdict** : ✅ **FONCTIONNEL** — ⚠️ Clé API exposée dans .env à sécuriser

---

## 8. Notion

**Fichiers** (legacy) :
- `src/backend/api/legacy/legacy-api/services/notion.service.js`
- `src/backend/api/legacy/legacy-api/routes/notion.routes.js`
- `src/backend/api/legacy/legacy-api/routes/notion-documents.routes.js`

**Configuration** :
```env
NOTION_TOKEN=ntn_466336635998...(exposé)
NOTION_DB_PRESTATAIRES=test-id-1
NOTION_DB_PROJETS=test-id-2
NOTION_DB_LIVRAISONS=test-id-3
NOTION_DB_TICKETS_SUPPORT=test-id-4
```

**État** : ⚠️ **LEGACY** — Code CommonJS non migré en ES Modules, routes non montées dans le serveur actuel, IDs de test uniquement.

---

## 9. Cloudinary

**Configuration** :
```env
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

**État** : ❌ **NON IMPLÉMENTÉ** — Variables d'environnement vides, aucun code d'intégration.

---

## 10. Couche d'orchestration

**Fichier** : `src/backend/api/integrations/index.js` (587 lignes)

L'orchestrateur coordonne plusieurs intégrations par événement :

| Événement | DocuSeal | Mautic | Invoice Ninja | Directus |
|-----------|----------|--------|--------------|----------|
| `quote-sent` | Demande signature | Campagne envoi | Sync facture | MAJ statut |
| `quote-signed` | — | Campagne signé | Facture acompte | MAJ statut |
| `payment-received` | — | Tracking | MAJ statut | MAJ facture |
| `lead-created` | — | Sync + nurturing | — | Création |

---

## 11. Matrice de maturité

| Critère | Invoice Ninja | Revolut | Mautic | DocuSeal | ERPNext | OCR | Notion |
|---------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Routes API | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ |
| Service layer | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | ⚠️ |
| Auth/config | ✅ | ⚠️ | ✅ | ⚠️ | ⚠️ | ✅ | ⚠️ |
| Webhooks | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Multi-company | ✅ | ✅ | ✅ | ✅ | ✅ | N/A | N/A |
| Error handling | ⚠️ | ⚠️ | ✅ | ✅ | ⚠️ | ⚠️ | ⚠️ |
| Tests | ❌ | ⚠️ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Documentation | ⚠️ | ⚠️ | ✅ | ✅ | ⚠️ | ⚠️ | ❌ |

---

## 12. Recommandations

### Priorité critique
1. **Sécuriser les clés API** — Rotation immédiate de toutes les clés exposées dans .env
2. **Vérification webhooks** — Implémenter la vérification de signature pour DocuSeal, Invoice Ninja, Mautic

### Priorité haute
3. **Finaliser Revolut OAuth2** — Configurer les clés privées pour les 5 entreprises
4. **Activer auto-sync Revolut** — Passer REVOLUT_AUTO_SYNC=true après configuration

### Priorité moyenne
5. **ERPNext** — Décider si ERPNext reste dans l'architecture ou si le moteur comptable interne suffit
6. **Notion** — Migrer ou supprimer le code legacy
7. **Cloudinary** — Implémenter ou retirer de la configuration

### Priorité basse
8. **Tests d'intégration** — Ajouter des tests pour chaque service externe
9. **Circuit breaker** — Ajouter un pattern de circuit breaker pour les appels externes
10. **Monitoring** — Alertes sur les échecs d'intégration
