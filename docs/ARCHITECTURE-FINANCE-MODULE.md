# 🏦 ARCHITECTURE COMPLÈTE - PÔLE FINANCE

## Document d'Architecture pour Claude Code
**Date:** 13 décembre 2025
**Version:** 1.0
**Statut:** À implémenter

---

## 📊 AUDIT ACTUEL

### ✅ COMPOSANTS EXISTANTS ET COMPLETS

#### 1. API Revolut Business (1,129 lignes) - 100% COMPLET
```
src/backend/api/revolut/
├── api/
│   ├── index.js          (11 lignes)
│   ├── auth.js           (256 lignes) - OAuth2 JWT RS256
│   ├── accounts.js       (249 lignes) - Comptes multi-devises
│   ├── transactions.js   (316 lignes) - Sync Directus
│   └── webhooks.js       (308 lignes) - Événements temps réel
├── config/companies.json
├── sync/scheduler.js
└── utils/
    ├── logger.js
    ├── jwt-handler.js
    └── error-handler.js
```

#### 2. Module Comptabilité Suisse (7,393 lignes) - 100% COMPLET
```
src/backend/modules/accounting/
├── index.js
├── README.md
├── core/accounting-engine.js      (764 lignes)
├── swiss-compliance/
│   ├── qr-invoice.js              (693 lignes) - ISO 20022 v2.3
│   ├── chart-of-accounts.js       (2,536 lignes) - Käfer PME
│   ├── afc-codes.js               (396 lignes) - 21 codes officiels
│   ├── form-200-generator.js      (577 lignes) - Formulaire TVA
│   ├── tva-engine.js              - Taux 2025
│   └── export-handlers.js         - PDF/XML eCH-0217
├── services/entry-automation.js
├── utils/formatters.js
└── browser/accounting-engine-browser.js
```

#### 3. Frontend Finance (8 pages HTML)
```
src/frontend/portals/superadmin/finance/
├── accounting.html       (1,179 lignes)
├── banking.html          (455 lignes)
├── expenses.html
├── invoices-in.html      (factures fournisseurs)
├── invoices-out.html     (876 lignes - factures clients)
├── monthly-reports.html
├── vat-reports.html
└── ocr-premium-dashboard.html
```

#### 4. Collections Directus Finance
- `client_invoices` ✅
- `supplier_invoices` ✅
- `expenses` ✅
- `bank_transactions` ✅
- `accounting_entries` ✅
- `payments` ✅
- `budgets` ✅

---

### ⚠️ COMPOSANTS PARTIELS

#### 1. API Invoice Ninja (183 lignes) - BASIQUE
```
src/backend/api/invoice-ninja/sync.js
```
**Fonctionnalités actuelles:**
- syncContactToInvoiceNinja()
- createInvoiceInInvoiceNinja()
- syncPaymentToDirectus()
- handleInvoiceNinjaWebhook()

**MANQUE:**
- Génération QR suisse
- Sync bidirectionnel complet
- Templates multi-entreprises
- Gestion des devis

---

### ❌ COMPOSANTS MANQUANTS

1. **Service de Facturation Unifié** - Combine Invoice Ninja + QR suisse
2. **Finance Overview Dashboard** - Page de pilotage global
3. **Rapprochement Bancaire Auto** - Matcher transactions ↔ factures
4. **Flux OCR → Comptabilité** - Écriture auto après scan
5. **Service PDF Generator** - QR intégré dans les factures

---

## 🎯 ARCHITECTURE CIBLE

### Flux de Facturation Unifié

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUX DE FACTURATION                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   [Dashboard]                                                    │
│       │                                                          │
│       ▼                                                          │
│   [Nouvelle Facture]                                            │
│       │                                                          │
│       ▼                                                          │
│   ┌─────────────────────────────────────────┐                   │
│   │     UNIFIED INVOICE SERVICE             │                   │
│   │                                          │                   │
│   │  1. Créer facture → Directus            │                   │
│   │  2. Sync → Invoice Ninja                │                   │
│   │  3. Générer QR Swiss → Module Compta    │                   │
│   │  4. Assembler PDF final                 │                   │
│   │  5. Retourner document complet          │                   │
│   └─────────────────────────────────────────┘                   │
│       │                                                          │
│       ▼                                                          │
│   [PDF avec QR-Facture Swiss intégré]                           │
│       │                                                          │
│       ├── Envoyer par email (Mautic)                            │
│       ├── Télécharger                                           │
│       └── Archiver dans Directus                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Architecture des Services

```
src/backend/
├── api/
│   ├── invoice-ninja/
│   │   ├── sync.js           (existant - à enrichir)
│   │   ├── client.js         (NOUVEAU - client API)
│   │   ├── templates.js      (NOUVEAU - templates entreprises)
│   │   └── webhooks.js       (NOUVEAU - webhooks IN)
│   │
│   └── revolut/              (existant - COMPLET)
│
├── modules/
│   └── accounting/           (existant - COMPLET)
│
└── services/
    └── finance/              (NOUVEAU - À CRÉER)
        ├── index.js
        ├── unified-invoice.service.js
        ├── pdf-generator.service.js
        ├── bank-reconciliation.service.js
        ├── ocr-to-accounting.service.js
        └── finance-dashboard.service.js
```

---

## 📋 SPÉCIFICATIONS DÉTAILLÉES

### 1. Unified Invoice Service

**Fichier:** `src/backend/services/finance/unified-invoice.service.js`

```javascript
/**
 * Service unifié de facturation
 * Combine Invoice Ninja (workflow) + Module Comptabilité (QR suisse)
 * 
 * FLUX:
 * 1. Recevoir données facture du dashboard
 * 2. Valider les données
 * 3. Créer dans Directus (source de vérité)
 * 4. Créer dans Invoice Ninja (workflow commercial)
 * 5. Générer QR-Facture suisse
 * 6. Assembler PDF final
 * 7. Retourner document complet
 */

class UnifiedInvoiceService {
  // Créer une facture complète avec QR suisse
  async createInvoice(invoiceData, options = {})
  
  // Générer le PDF avec QR intégré
  async generatePDF(invoiceId)
  
  // Envoyer la facture par email
  async sendInvoice(invoiceId, emailOptions)
  
  // Marquer comme payée
  async markAsPaid(invoiceId, paymentData)
  
  // Sync bidirectionnel Invoice Ninja ↔ Directus
  async syncFromInvoiceNinja(invoiceNinjaId)
  async syncToInvoiceNinja(directusId)
}
```

### 2. PDF Generator Service

**Fichier:** `src/backend/services/finance/pdf-generator.service.js`

```javascript
/**
 * Générateur PDF avec QR-Facture suisse intégré
 * 
 * Utilise:
 * - PDFKit pour la génération
 * - Module qr-invoice.js pour le QR
 * - Templates par entreprise
 */

class PDFGeneratorService {
  // Générer facture avec QR Swiss
  async generateInvoicePDF(invoiceData, companyTemplate)
  
  // Générer le bulletin de versement QR
  async generateQRSlip(paymentData)
  
  // Ajouter QR à un PDF existant
  async addQRToPDF(existingPDF, qrData)
}
```

### 3. Bank Reconciliation Service

**Fichier:** `src/backend/services/finance/bank-reconciliation.service.js`

```javascript
/**
 * Rapprochement bancaire automatique
 * 
 * Match les transactions Revolut avec:
 * - Factures clients (paiements entrants)
 * - Factures fournisseurs (paiements sortants)
 */

class BankReconciliationService {
  // Matcher automatiquement les transactions
  async autoReconcile(companyName, options = {})
  
  // Suggérer des matchs pour validation manuelle
  async suggestMatches(transactionId)
  
  // Confirmer un rapprochement
  async confirmReconciliation(transactionId, invoiceId)
  
  // Rapport de rapprochement
  async getReconciliationReport(companyName, period)
}
```

### 4. OCR to Accounting Service

**Fichier:** `src/backend/services/finance/ocr-to-accounting.service.js`

```javascript
/**
 * Convertir les données OCR en écritures comptables
 * 
 * FLUX:
 * 1. Recevoir données OCR validées
 * 2. Déterminer les comptes (fournisseur, TVA, charge)
 * 3. Créer l'écriture comptable
 * 4. Lier à la facture fournisseur
 */

class OCRToAccountingService {
  // Créer écriture depuis facture OCR
  async createEntryFromOCR(ocrData, supplierInvoiceId)
  
  // Suggérer les comptes comptables
  async suggestAccounts(ocrData)
  
  // Valider et comptabiliser
  async validateAndPost(entryId)
}
```

### 5. Finance Dashboard Service

**Fichier:** `src/backend/services/finance/finance-dashboard.service.js`

```javascript
/**
 * Données agrégées pour le dashboard finance
 */

class FinanceDashboardService {
  // KPIs globaux
  async getOverviewMetrics(companyName, period)
  
  // Trésorerie temps réel
  async getCashPosition(companyName)
  
  // Factures à encaisser
  async getReceivables(companyName)
  
  // Factures à payer
  async getPayables(companyName)
  
  // Alertes et actions prioritaires
  async getAlerts(companyName)
  
  // Prévision trésorerie
  async getCashForecast(companyName, months)
}
```

---

## 🗂️ STRUCTURE DES FICHIERS À CRÉER

```
src/backend/services/finance/
├── index.js                           # Export principal
├── unified-invoice.service.js         # Facturation unifiée
├── pdf-generator.service.js           # Génération PDF + QR
├── bank-reconciliation.service.js     # Rapprochement bancaire
├── ocr-to-accounting.service.js       # OCR → Comptabilité
├── finance-dashboard.service.js       # Données dashboard
└── utils/
    ├── invoice-templates/
    │   ├── hypervisual.js
    │   ├── dainamics.js
    │   ├── lexaia.js
    │   ├── enki-realty.js
    │   └── takeout.js
    └── pdf-templates/
        └── swiss-invoice.template.js

src/frontend/portals/superadmin/finance/
├── finance-overview.html              # NOUVEAU - Dashboard global
└── assets/
    └── js/
        ├── finance-overview.js        # NOUVEAU
        └── unified-invoice.js         # NOUVEAU
```

---

## 🔄 ORDRE D'IMPLÉMENTATION

### Phase 1 : Services Backend (Priorité HAUTE)
1. `unified-invoice.service.js`
2. `pdf-generator.service.js`
3. Enrichir `invoice-ninja/sync.js`

### Phase 2 : Intégration (Priorité HAUTE)
4. Connecter module comptabilité au dashboard
5. `ocr-to-accounting.service.js`
6. `bank-reconciliation.service.js`

### Phase 3 : Dashboard (Priorité MOYENNE)
7. `finance-dashboard.service.js`
8. `finance-overview.html`
9. Widgets temps réel

### Phase 4 : Automatisations (Priorité MOYENNE)
10. Webhooks Invoice Ninja
11. Alertes automatiques
12. Rapports programmés

---

## 📐 COLLECTIONS DIRECTUS REQUISES

### Vérifier/Enrichir les champs existants:

#### client_invoices
```
+ invoice_ninja_id: string
+ qr_reference: string (27 caractères)
+ qr_iban: string
+ pdf_with_qr_url: string
+ sent_via: enum [email, postal, manual]
+ sent_at: datetime
+ viewed_at: datetime
+ reminder_count: integer
+ last_reminder_at: datetime
```

#### supplier_invoices
```
+ accounting_entry_id: relation → accounting_entries
+ ocr_data: json
+ ocr_validated: boolean
+ ocr_validated_at: datetime
+ ocr_validated_by: relation → directus_users
```

#### bank_transactions (déjà bien structuré via API Revolut)
```
+ reconciled: boolean
+ reconciled_invoice_id: relation → client_invoices | supplier_invoices
+ reconciled_at: datetime
+ reconciliation_type: enum [auto, manual, suggested]
```

---

## 🎯 CRITÈRES DE SUCCÈS

1. **Facturation unifiée**: Créer une facture génère automatiquement le PDF avec QR suisse
2. **Zéro double saisie**: Une seule action = facture complète
3. **Rapprochement auto**: >80% des transactions matchées automatiquement
4. **OCR → Compta**: Facture scannée → écriture comptable en 2 clics
5. **Dashboard temps réel**: Trésorerie et KPIs actualisés en continu

---

## 📝 NOTES POUR CLAUDE CODE

- Utiliser les services existants de `src/backend/modules/accounting/`
- Ne PAS recréer ce qui existe dans l'API Revolut
- Suivre le pattern existant dans `invoice-ninja/sync.js`
- Toujours utiliser Directus comme source de vérité
- Les 5 entreprises: HYPERVISUAL, DAINAMICS, LEXAIA, ENKI REALTY, TAKEOUT
- TVA Suisse 2025: 8.1% (normal), 2.6% (réduit), 3.8% (hébergement)
