# RAPPORT PARTIE 6 - INTÉGRATIONS EXTERNES

**Date:** 15 Décembre 2025
**Statut:** ✅ COMPLÉTÉ

---

## 📁 Fichiers Créés

```
src/backend/services/integrations/
├── index.js                    # Central exports + IntegrationManager
├── docuseal.service.js         # Signatures électroniques
├── invoice-ninja.service.js    # Facturation
└── mautic.service.js           # Marketing automation

src/backend/api/integrations/
└── index.js                    # API Router (30+ endpoints)
```

---

## 📝 DOCUSEAL SERVICE

### Fonctionnalités
- **Signature de devis** avec niveaux SES/AES/QES
- **Signature CGV** avec checkbox d'acceptation
- **Webhooks** pour mise à jour automatique
- **Embed URLs** pour signature iframe

### Méthodes
| Méthode | Description |
|---------|-------------|
| `createQuoteSignatureRequest(quoteId, options)` | Créer demande signature devis |
| `createCGVSignatureRequest(acceptanceId, options)` | Créer demande signature CGV |
| `getSignatureStatus(submissionId)` | Récupérer statut signature |
| `handleWebhook(payload, signature)` | Traiter webhook DocuSeal |
| `cancelSignatureRequest(submissionId)` | Annuler demande signature |
| `resendSignatureRequest(submissionId, email)` | Renvoyer demande |
| `getEmbedSigningUrl(submissionId, email)` | URL iframe signature |

### Niveaux de Signature
```javascript
const SIGNATURE_LEVELS = {
  simple: 'SES',     // Simple Electronic Signature
  advanced: 'AES',   // Advanced Electronic Signature
  qualified: 'QES'   // Qualified (Swiss ZertES)
};
```

### Webhook Events Gérés
- `submission.completed` → MAJ quote status `signed`
- `submission.expired` → MAJ signature_status `expired`
- `submission.declined` → MAJ status `rejected`
- `signer.signed` → Log partiel

---

## 💰 INVOICE NINJA SERVICE

### Fonctionnalités
- **Sync bidirectionnelle** Directus ↔ Invoice Ninja
- **Multi-company** avec API keys par entreprise
- **Création facture acompte** automatique
- **PDF & Email** via Invoice Ninja
- **Webhooks** pour paiements

### Méthodes
| Méthode | Description |
|---------|-------------|
| `syncInvoiceToNinja(invoiceId)` | Sync facture vers IN |
| `syncPaymentToDirectus(paymentData, company)` | Sync paiement vers Directus |
| `createDepositInvoiceInNinja(quoteId)` | Créer facture acompte |
| `getInvoicePDF(invoiceId, company)` | Récupérer PDF facture |
| `sendInvoiceEmail(invoiceId, company, email)` | Envoyer email facture |
| `handleWebhook(payload, signature, secret)` | Traiter webhook IN |
| `getInvoicesFromNinja(company, filters)` | Liste factures IN |

### Configuration Multi-Company
```javascript
const COMPANY_API_KEYS = {
  HYPERVISUAL: process.env.INVOICE_NINJA_KEY_HYPERVISUAL,
  DAINAMICS: process.env.INVOICE_NINJA_KEY_DAINAMICS,
  LEXAIA: process.env.INVOICE_NINJA_KEY_LEXAIA,
  ENKI_REALTY: process.env.INVOICE_NINJA_KEY_ENKI,
  TAKEOUT: process.env.INVOICE_NINJA_KEY_TAKEOUT
};
```

### Status Mapping
```javascript
// Directus → Invoice Ninja
const STATUS_TO_NINJA = {
  draft: 1, sent: 2, viewed: 3,
  paid: 4, cancelled: 5, archived: 6, overdue: -1
};
```

---

## 📧 MAUTIC SERVICE

### Fonctionnalités
- **Sync contacts** Directus → Mautic
- **Campagnes automatiques** (quote sent, follow-up, payment reminder)
- **Segments dynamiques** (leads, prospects, clients)
- **Tracking events** via timeline notes
- **Dashboard marketing**

### Méthodes
| Méthode | Description |
|---------|-------------|
| `syncContactToMautic(contactData)` | Sync/Create contact |
| `triggerQuoteSentCampaign(quoteId)` | Déclencher campagne devis envoyé |
| `triggerQuoteFollowUp(quoteId)` | Déclencher relance devis |
| `triggerPaymentReminder(invoiceId, level)` | Déclencher rappel paiement |
| `triggerWelcomeCampaign(contactId)` | Déclencher welcome nouveau client |
| `trackPaymentReceived(invoiceId)` | Tracker paiement reçu |
| `syncLeadToMautic(leadId)` | Sync lead vers Mautic |
| `getCampaignStats(campaignId)` | Stats campagne |
| `getSegmentStats(segmentId)` | Stats segment |
| `getMarketingDashboard()` | Dashboard global |

### Campagnes Configurées
```javascript
const CAMPAIGNS = {
  quote_sent: 1,           // Devis envoyé
  quote_followup: 2,       // Relance devis
  payment_reminder: 3,     // Rappel paiement
  welcome_new_client: 4,   // Bienvenue nouveau client
  lead_nurturing: 5        // Nurturing leads
};
```

### Segments Configurés
```javascript
const SEGMENTS = {
  leads: 1,              // Tous les leads
  prospects: 2,          // Prospects qualifiés
  clients: 3,            // Clients actifs
  pending_quotes: 4,     // Devis en attente
  overdue_payments: 5    // Paiements en retard
};
```

---

## 🔗 INTEGRATION MANAGER

### Orchestration Automatique
Le `IntegrationManager` coordonne les actions cross-integrations:

```javascript
class IntegrationManager {
  // Quote envoyé → Mautic campaign
  async onQuoteSent(quoteId) { ... }

  // Quote signé → Invoice Ninja deposit
  async onQuoteSigned(quoteId) { ... }

  // Paiement reçu → Mautic tracking
  async onPaymentReceived(invoiceId) { ... }

  // Lead créé → Mautic sync
  async onLeadCreated(leadId) { ... }

  // Client converti → Welcome campaign
  async onClientConverted(contactId) { ... }

  // Health check toutes intégrations
  async getHealthStatus() { ... }
}
```

---

## 🌐 API ENDPOINTS

### DocuSeal (7 endpoints)
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/integrations/docuseal/signature/quote/:quoteId` | Créer signature devis |
| POST | `/api/integrations/docuseal/signature/cgv/:acceptanceId` | Créer signature CGV |
| GET | `/api/integrations/docuseal/signature/:id/status` | Status signature |
| GET | `/api/integrations/docuseal/signature/:id/embed` | URL iframe |
| POST | `/api/integrations/docuseal/signature/:id/cancel` | Annuler |
| POST | `/api/integrations/docuseal/signature/:id/remind` | Relancer |
| POST | `/api/integrations/docuseal/webhook` | Webhook handler |

### Invoice Ninja (6 endpoints)
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/integrations/invoice-ninja/sync/:invoiceId` | Sync facture |
| POST | `/api/integrations/invoice-ninja/deposit/:quoteId` | Créer acompte |
| GET | `/api/integrations/invoice-ninja/pdf/:invoiceId` | PDF facture |
| POST | `/api/integrations/invoice-ninja/email/:invoiceId` | Email facture |
| GET | `/api/integrations/invoice-ninja/invoices` | Liste factures |
| POST | `/api/integrations/invoice-ninja/webhook` | Webhook handler |

### Mautic (10 endpoints)
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/integrations/mautic/sync/contact` | Sync contact |
| POST | `/api/integrations/mautic/sync/lead/:leadId` | Sync lead |
| POST | `/api/integrations/mautic/trigger/quote-sent/:quoteId` | Trigger quote sent |
| POST | `/api/integrations/mautic/trigger/quote-followup/:quoteId` | Trigger follow-up |
| POST | `/api/integrations/mautic/trigger/payment-reminder/:invoiceId` | Trigger reminder |
| POST | `/api/integrations/mautic/trigger/welcome/:contactId` | Trigger welcome |
| GET | `/api/integrations/mautic/campaign/:id/stats` | Stats campagne |
| GET | `/api/integrations/mautic/segment/:id/stats` | Stats segment |
| GET | `/api/integrations/mautic/dashboard` | Dashboard marketing |

### Orchestration (5 endpoints)
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/integrations/health` | Status toutes intégrations |
| POST | `/api/integrations/orchestrate/quote-sent/:quoteId` | Orchestrer quote sent |
| POST | `/api/integrations/orchestrate/quote-signed/:quoteId` | Orchestrer quote signed |
| POST | `/api/integrations/orchestrate/payment-received/:invoiceId` | Orchestrer payment |
| POST | `/api/integrations/orchestrate/lead-created/:leadId` | Orchestrer lead |

**Total: 28 endpoints d'intégration**

---

## ⚙️ CONFIGURATION REQUISE

### Variables d'Environnement
```bash
# DocuSeal
DOCUSEAL_API_URL=https://api.docuseal.co
DOCUSEAL_API_KEY=your_api_key
DOCUSEAL_TEMPLATE_QUOTE=template_id
DOCUSEAL_TEMPLATE_CGV=template_id
WEBHOOK_BASE_URL=https://your-domain.com

# Invoice Ninja (par company)
INVOICE_NINJA_URL=http://localhost:8085
INVOICE_NINJA_KEY_HYPERVISUAL=key_hypervisual
INVOICE_NINJA_KEY_DAINAMICS=key_dainamics
INVOICE_NINJA_KEY_LEXAIA=key_lexaia
INVOICE_NINJA_KEY_ENKI=key_enki
INVOICE_NINJA_KEY_TAKEOUT=key_takeout
INVOICE_NINJA_WEBHOOK_SECRET=webhook_secret

# Mautic
MAUTIC_URL=http://localhost:8084
MAUTIC_USERNAME=admin
MAUTIC_PASSWORD=password
MAUTIC_CAMPAIGN_QUOTE_SENT=1
MAUTIC_CAMPAIGN_QUOTE_FOLLOWUP=2
MAUTIC_CAMPAIGN_PAYMENT_REMINDER=3
MAUTIC_CAMPAIGN_WELCOME=4
MAUTIC_CAMPAIGN_LEAD_NURTURING=5
MAUTIC_SEGMENT_LEADS=1
MAUTIC_SEGMENT_PROSPECTS=2
MAUTIC_SEGMENT_CLIENTS=3
MAUTIC_SEGMENT_PENDING_QUOTES=4
MAUTIC_SEGMENT_OVERDUE_PAYMENTS=5
```

---

## ✅ Résumé

| Intégration | Service | Endpoints | Statut |
|-------------|---------|-----------|--------|
| DocuSeal | 8 méthodes | 7 endpoints | ✅ |
| Invoice Ninja | 7 méthodes | 6 endpoints | ✅ |
| Mautic | 11 méthodes | 10 endpoints | ✅ |
| Orchestration | IntegrationManager | 5 endpoints | ✅ |
| **Total** | 27 méthodes | 28 endpoints | ✅ |

---

## ➡️ Prochaine Étape

**PARTIE 7:** Composants React Portail Client
- Page de connexion/inscription
- Dashboard client
- Visualisation devis
- Signature électronique
- Historique paiements
