# RAPPORT PARTIE 3: SERVICES BACKEND WORKFLOW COMMERCIAL

**Date**: 15 Décembre 2025
**Statut**: COMPLÉTÉ ✅

---

## 1. SERVICES CRÉÉS

### 1.1 quote.service.js
**Chemin**: `/src/backend/services/commercial/quote.service.js`

**Fonctions exportées**:
- `generateQuoteNumber(ownerCompanyId)` - Numérotation auto DEV-YYYY-XXXX
- `calculateTotals(lineItems, projectType)` - Calcul TVA suisse
- `getDepositConfig(ownerCompanyId, projectType)` - Config acomptes
- `getActiveCGV(ownerCompanyId)` - CGV active
- `createQuote(data)` - Création devis
- `getQuote(quoteId)` - Récupération avec relations
- `listQuotes(filters)` - Liste avec filtres
- `updateQuoteStatus(quoteId, newStatus)` - Transitions workflow
- `markQuoteAsSigned(quoteId, signatureData)` - Marquer signé
- `recordCGVAcceptance(quoteId, acceptanceData)` - Enregistrer CGV
- `getQuoteStats(ownerCompanyId, dateFrom, dateTo)` - Statistiques

**TVA Suisse implémentée**:
```javascript
const TAX_RATES = {
  standard: 8.1,
  reduced: 2.6,
  accommodation: 3.8,
  exempt: 0
};
```

---

### 1.2 cgv.service.js
**Chemin**: `/src/backend/services/commercial/cgv.service.js`

**Fonctions exportées**:
- `createCGVVersion(data)` - Nouvelle version CGV
- `activateCGVVersion(cgvId)` - Activer (désactive précédentes)
- `getActiveCGV(ownerCompanyId)` - CGV active
- `listCGVVersions(ownerCompanyId)` - Historique versions
- `recordAcceptance(data)` - Enregistrer acceptation
- `hasAcceptedCurrentCGV(contactId, ownerCompanyId)` - Vérifier acceptation
- `getAcceptanceHistory(contactId)` - Historique acceptations
- `invalidateAcceptance(acceptanceId, reason)` - Invalider
- `getCGVStats(ownerCompanyId)` - Statistiques

**Sécurité**: Hash SHA256 du contenu pour intégrité

---

### 1.3 signature.service.js
**Chemin**: `/src/backend/services/commercial/signature.service.js`

**Fonctions exportées**:
- `createSignatureRequest(quoteId, options)` - Créer demande DocuSeal
- `processWebhook(webhookData)` - Traiter webhooks DocuSeal
- `signQuoteManually(quoteId, signatureData)` - Signature manuelle
- `getSignatureLogs(quoteId)` - Logs signatures
- `verifySignature(signatureLogId)` - Vérifier intégrité

**Types de signature supportés**:
- SES: Simple Electronic Signature
- AES: Advanced Electronic Signature
- QES: Qualified Electronic Signature

**Mode Mock**: Fonctionne sans DocuSeal configuré (dev/test)

---

### 1.4 deposit.service.js
**Chemin**: `/src/backend/services/commercial/deposit.service.js`

**Fonctions exportées**:
- `getDepositConfig(ownerCompanyId, projectType)` - Config acompte
- `calculateDeposit(quoteId)` - Calculer montant
- `createDepositInvoice(quoteId)` - Créer facture acompte
- `markDepositPaid(quoteId, paymentData)` - Marquer payé
- `getPendingDeposits(ownerCompanyId)` - Acomptes en attente
- `getOverdueDeposits(ownerCompanyId)` - Acomptes en retard
- `updateDepositConfig(configId, updates)` - MAJ config
- `getDepositStats(ownerCompanyId)` - Statistiques

---

### 1.5 client-portal.service.js
**Chemin**: `/src/backend/services/commercial/client-portal.service.js`

**Fonctions exportées**:
- `createPortalAccount(data)` - Créer compte avec MDP temporaire
- `activateAccount(activationToken, newPassword)` - Activer compte
- `authenticateUser(email, password, ip, ua)` - Authentification JWT
- `verifyToken(token)` - Vérifier JWT
- `requestPasswordReset(email)` - Demande reset MDP
- `resetPassword(resetToken, newPassword)` - Reset MDP
- `getAccountByContact(contactId)` - Compte par contact
- `updatePreferences(accountId, preferences)` - MAJ préférences

**Sécurité**:
- bcryptjs (12 rounds) pour hash MDP
- JWT avec expiration 24h
- Lock compte après 5 échecs (30 min)
- Tokens activation/reset sécurisés

---

### 1.6 workflow.service.js
**Chemin**: `/src/backend/services/commercial/workflow.service.js`

**Fonctions exportées**:
- `convertLeadToQuote(leadId, quoteData)` - Lead → Devis
- `sendQuoteToClient(quoteId, options)` - Envoyer devis
- `initiateSigningProcess(quoteId, clientData)` - Démarrer signature
- `completeSigningProcess(quoteId, signatureData)` - Compléter signature
- `createProjectFromQuote(quoteId)` - Devis → Projet
- `processDepositPayment(quoteId, paymentData)` - Traiter paiement
- `getWorkflowStatus(quoteId)` - Statut complet workflow
- `getPipelineStats(ownerCompanyId)` - Stats pipeline

**Workflow complet automatisé**:
```
Lead → Quote → CGV Acceptance → Signature → Deposit Invoice → Payment → Project
```

---

### 1.7 index.js
**Chemin**: `/src/backend/services/commercial/index.js`

Exporte tous les services et fonctions utilitaires pour import facile.

---

## 2. ARCHITECTURE

```
src/backend/services/commercial/
├── index.js                    # Exports centralisés
├── quote.service.js            # Gestion devis
├── cgv.service.js              # CGV versioning
├── signature.service.js        # DocuSeal integration
├── deposit.service.js          # Acomptes
├── client-portal.service.js    # Portail client auth
└── workflow.service.js         # Orchestration
```

---

## 3. DÉPENDANCES

```json
{
  "axios": "^1.x",
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.x",
  "crypto": "built-in"
}
```

---

## 4. VARIABLES D'ENVIRONNEMENT REQUISES

```env
# Directus
DIRECTUS_URL=http://localhost:8055
DIRECTUS_TOKEN=hbQz-9935crJ2YkLul_zpQJDBw2M-y5v

# JWT Portal
JWT_SECRET=portal-secret-key-change-in-production
JWT_EXPIRY=24h

# DocuSeal (optionnel)
DOCUSEAL_API_URL=https://api.docuseal.co
DOCUSEAL_API_KEY=
DOCUSEAL_DEFAULT_TEMPLATE=
```

---

## 5. USAGE EXEMPLE

```javascript
import {
  convertLeadToQuote,
  sendQuoteToClient,
  getWorkflowStatus
} from './services/commercial/index.js';

// Convertir un lead en devis
const result = await convertLeadToQuote('lead-id', {
  project_type: 'web_design',
  line_items: [
    { description: 'Site web', quantity: 1, unit_price: 5000 }
  ]
});

// Envoyer au client
await sendQuoteToClient(result.quote_id, {
  create_portal_account: true,
  send_email: true
});

// Vérifier le statut
const status = await getWorkflowStatus(result.quote_id);
console.log(status.completion_percentage); // 14% (1/7 steps)
```

---

**Statut**: PARTIE 3 COMPLÉTÉE ✅
**Prêt pour**: PARTIE 4 - API Endpoints
