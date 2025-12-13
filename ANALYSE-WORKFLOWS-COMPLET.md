# ANALYSE COMPLÈTE DES WORKFLOWS AUTOMATISÉS
## Directus Unified Platform

Date de génération : 2025-12-13
Version : 1.0

---

## 1. ARCHITECTURE GLOBALE

### 1.1 Vue d'ensemble
```
┌──────────────────────────────────────────────────────────────┐
│                    DIRECTUS UNIFIED PLATFORM                 │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐        │
│  │ INVOICE     │   │  REVOLUT    │   │   MAUTIC    │        │
│  │ NINJA v5    │◄──│  BUSINESS   │──►│    5.x      │        │
│  │             │   │  API v2     │   │             │        │
│  └──────┬──────┘   └──────┬──────┘   └──────┬──────┘        │
│         │                 │                 │                │
│         └────────────┬────┴────┬────────────┘                │
│                      │         │                             │
│              ┌───────▼─────────▼───────┐                     │
│              │      DIRECTUS 10.x      │                     │
│              │      PostgreSQL 15      │                     │
│              │    54 Collections       │                     │
│              └───────────┬─────────────┘                     │
│                          │                                   │
│              ┌───────────▼─────────────┐                     │
│              │   REACT 18 + VITE 5     │                     │
│              │   Dashboard CEO         │                     │
│              │   4 Portails            │                     │
│              └─────────────────────────┘                     │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 1.2 Collections Finance (Module validé)

| Collection | Records | FK owner_company_id | Status |
|------------|---------|---------------------|--------|
| bank_accounts | 15 | ✅ 100% | VALIDÉ |
| bank_transactions | 3,460 | ✅ 100% | VALIDÉ |
| client_invoices | 1,210 | ✅ 100% | VALIDÉ |
| supplier_invoices | 375 | ✅ 100% | VALIDÉ |
| payments | 100 | ✅ 100% | VALIDÉ |
| expenses | 853 | ✅ 100% | VALIDÉ |

---

## 2. WORKFLOWS PAR DOMAINE

### 2.1 WORKFLOW FACTURATION CLIENT

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  CRÉATION   │───►│   ENVOI     │───►│  PAIEMENT   │───►│ RAPPROCHE-  │
│  FACTURE    │    │   EMAIL     │    │   REÇU      │    │   MENT      │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
     │                   │                  │                  │
     ▼                   ▼                  ▼                  ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Directus    │    │ Mautic      │    │ Revolut     │    │ Directus    │
│ client_     │    │ Email       │    │ Webhook     │    │ payments +  │
│ invoices    │    │ Transact.   │    │             │    │ bank_trans  │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

**Étapes détaillées :**

1. **Création Facture**
   - Collection : `client_invoices`
   - Champs : invoice_number, amount, currency, company_id, owner_company_id
   - Trigger : Hook Directus `items.create`

2. **Envoi Email**
   - Service : Mautic 5.x
   - Template : facture_client_{{language}}
   - Variables : {invoice_number}, {amount}, {due_date}, {qr_code}

3. **Réception Paiement**
   - Source : Revolut Webhook TransactionCreated
   - Match : reference_number = invoice_number
   - Action : Créer enregistrement `payments`

4. **Rapprochement**
   - Lier payment → invoice via invoice_id FK
   - Lier payment → bank_transaction via bank_transaction_id FK
   - Mettre à jour status invoice = 'paid'

### 2.2 WORKFLOW FACTURE FOURNISSEUR

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  RÉCEPTION  │───►│   OCR       │───►│ VALIDATION  │───►│  PAIEMENT   │
│  DOCUMENT   │    │   SCAN      │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
     │                   │                  │                  │
     ▼                   ▼                  ▼                  ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Email       │    │ OpenAI      │    │ Directus    │    │ Revolut     │
│ Mautic      │    │ Vision      │    │ Workflow    │    │ API         │
│ Inbox       │    │ API         │    │ Approbation │    │ Payment     │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

**Étapes détaillées :**

1. **Réception Document**
   - Source : Email attachement
   - Format : PDF, JPG, PNG
   - Storage : Directus Files

2. **OCR Scan**
   - Service : OpenAI Vision API
   - Extraction : supplier_name, invoice_number, amount, date, TVA
   - Création : `supplier_invoices` (status: draft)

3. **Validation**
   - Workflow : Approbation selon montant
     - < 1000 CHF : Auto-approuvé
     - 1000-5000 CHF : Manager
     - > 5000 CHF : CEO
   - Collection : `approvals`

4. **Paiement**
   - API : Revolut Business /pay
   - Méthode : SEPA Transfer
   - Lien : expense → supplier_invoice_id FK

### 2.3 WORKFLOW SYNCHRONISATION BANCAIRE

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  REVOLUT    │───►│  DIRECTUS   │───►│  DASHBOARD  │
│  WEBHOOK    │    │  SYNC       │    │  UPDATE     │
└─────────────┘    └─────────────┘    └─────────────┘
```

**Trigger : TransactionCreated / TransactionStateChanged**

```javascript
// Webhook Handler
POST /webhooks/revolut
{
  "event": "TransactionCreated",
  "data": {
    "id": "tx_xxx",
    "account_id": "acc_xxx",
    "amount": -1500.00,
    "currency": "CHF",
    "description": "SUPPLIER PAYMENT",
    "created_at": "2025-12-13T10:00:00Z"
  }
}
```

**Actions :**
1. Créer enregistrement `bank_transactions`
2. Matcher avec `supplier_invoices` ou `client_invoices` (référence)
3. Mettre à jour `bank_accounts.balance`
4. Notifier Dashboard via WebSocket

---

## 3. WORKFLOWS MARKETING (MAUTIC)

### 3.1 Workflow Onboarding Client

```
TRIGGER: Contact créé dans companies (type=client)
         │
         ▼
┌─────────────────────────────┐
│ J+0 : Email Bienvenue       │
│ Template: welcome_client    │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ J+3 : Email Présentation    │
│ Template: services_overview │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ J+7 : Email Rendez-vous     │
│ Template: schedule_call     │
└──────────────┬──────────────┘
               │
               ▼
        [FIN SÉQUENCE]
```

### 3.2 Workflow Relance Facture Impayée

```
TRIGGER: client_invoice.status = 'overdue'
         │
         ▼
┌─────────────────────────────┐
│ J+0 : Rappel Amiable        │
│ Template: reminder_friendly │
└──────────────┬──────────────┘
               │ (si non payé après 7j)
               ▼
┌─────────────────────────────┐
│ J+7 : 2ème Rappel           │
│ Template: reminder_formal   │
└──────────────┬──────────────┘
               │ (si non payé après 14j)
               ▼
┌─────────────────────────────┐
│ J+21 : Mise en Demeure      │
│ Template: legal_notice      │
│ + Notification CEO          │
└──────────────┬──────────────┘
               │
               ▼
        [ESCALADE MANUELLE]
```

---

## 4. HOOKS DIRECTUS

### 4.1 Hooks Actifs

| Collection | Event | Action |
|------------|-------|--------|
| client_invoices | items.create | Générer invoice_number auto |
| client_invoices | items.create | Envoyer email via Mautic |
| client_invoices | items.update | Si status=overdue → Workflow relance |
| supplier_invoices | items.create | OCR si document attaché |
| bank_transactions | items.create | Rapprochement auto |
| payments | items.create | Mettre à jour invoice.status |

### 4.2 Exemple Hook (Génération Numéro Facture)

```javascript
// directus/extensions/hooks/invoice-number/index.js
export default ({ filter }) => {
  filter('items.create', async (payload, meta, context) => {
    if (meta.collection === 'client_invoices') {
      const year = new Date().getFullYear();
      const prefix = payload.owner_company?.substring(0, 3) || 'XXX';
      
      // Récupérer le dernier numéro
      const lastInvoice = await context.database('client_invoices')
        .where('owner_company', payload.owner_company)
        .whereRaw("invoice_number LIKE ?", [`${prefix}-${year}-%`])
        .orderBy('invoice_number', 'desc')
        .first();
      
      const sequence = lastInvoice 
        ? parseInt(lastInvoice.invoice_number.split('-')[2]) + 1 
        : 1;
      
      payload.invoice_number = `${prefix}-${year}-${String(sequence).padStart(4, '0')}`;
    }
    return payload;
  });
};
```

---

## 5. INTÉGRATIONS EXTERNES

### 5.1 Invoice Ninja v5
- **Usage** : Templates factures professionnels, PDF génération
- **Sync** : Bidirectionnel avec `client_invoices`
- **API** : REST /api/v1/invoices

### 5.2 Revolut Business API
- **Usage** : Transactions, paiements, soldes
- **Auth** : OAuth2 + JWT RS256
- **Webhooks** : TransactionCreated, TransactionStateChanged

### 5.3 Mautic 5.x
- **Usage** : Emails marketing + transactionnels
- **Segments** : Par owner_company (5 segments)
- **Campaigns** : Onboarding, Relance, Newsletter

### 5.4 ERPNext v15
- **Usage** : Comptabilité avancée, stock, RH
- **Sync** : n8n workflows (planifié)

---

## 6. SÉCURITÉ & CONFORMITÉ

### 6.1 Conformité Suisse
- QR-Facture obligatoire (ISO 20022 v2.3)
- TVA : 8.1% normal, 2.6% réduit, 3.8% hébergement
- Conservation : 10 ans (art. 958f CO)
- Intérêts moratoires : 5% légal

### 6.2 Sécurité API
- Tous les endpoints : Bearer Token Auth
- Revolut : OAuth2 + PCI DSS 4.0.1
- HTTPS obligatoire en production

---

## 7. MÉTRIQUES TEMPS RÉEL

### 7.1 KPIs Dashboard CEO
- **Runway** : balance / monthlyBurn
- **ARR/MRR** : Depuis client_invoices récurrents
- **EBITDA** : Revenue - Expenses (mensuel)
- **LTV:CAC** : Customer Lifetime Value / Acquisition Cost

### 7.2 Calculs Finance

```javascript
// Runway = Solde / Burn Rate Mensuel
const runway = bankBalance / monthlyBurn;

// MRR = Moyenne factures 3 derniers mois
const mrr = last3MonthsInvoices.reduce((sum, i) => sum + i.amount, 0) / 3;

// ARR = MRR × 12
const arr = mrr * 12;
```

---

## 8. PROCHAINES ÉTAPES

### Phase 1 : Court terme (Semaines 1-2)
- [ ] Démarrer le frontend React
- [ ] Tester le Dashboard CEO avec vraies données
- [ ] Configurer webhooks Revolut production
- [ ] Activer hooks Directus

### Phase 2 : Moyen terme (Semaines 3-4)
- [ ] Intégrer Mautic pour emails transactionnels
- [ ] Configurer Invoice Ninja templates
- [ ] Mettre en place OCR factures fournisseurs
- [ ] Tests end-to-end

### Phase 3 : Long terme (Semaines 5-8)
- [ ] Intégration ERPNext complète
- [ ] Workflows n8n avancés
- [ ] Multi-entreprises en production
- [ ] Audit sécurité

---

## ANNEXES

### A. Collections Directus (54 métier)
accounting_entries, activities, approvals, audit_logs, bank_accounts, 
bank_transactions, budgets, client_invoices, comments, companies, 
company_people, compliance, content_calendar, contracts, credits, 
customer_success, debits, deliverables, deliveries, departments, 
evaluations, events, expenses, goals, interactions, kpis, notes, 
notifications, orders, owner_companies, payments, people, permissions, 
projects, projects_team, proposals, providers, quotes, reconciliations, 
refunds, returns, roles, settings, skills, subscriptions, supplier_invoices, 
support_tickets, tags, talents, talents_simple, teams, time_tracking, 
trainings, workflows

### B. Relations FK Finance (24)
1. bank_accounts → owner_companies (owner_company_id)
2. bank_transactions → owner_companies (owner_company_id)
3. bank_transactions → companies (company_id)
4. bank_transactions → supplier_invoices (supplier_invoice_id)
5. client_invoices → owner_companies (owner_company_id)
6. client_invoices → companies (company_id)
7. supplier_invoices → owner_companies (owner_company_id)
8. supplier_invoices → companies (company_id)
9. payments → owner_companies (owner_company_id)
10. payments → client_invoices (invoice_id)
11. payments → bank_transactions (bank_transaction_id)
12. expenses → owner_companies (owner_company_id)
13. expenses → supplier_invoices (supplier_invoice_id)
14. expenses → bank_transactions (bank_transaction_id)
... et 10 relations inverses (O2M)

### C. Index Performance (11)
- idx_bank_accounts_owner_company_id
- idx_bank_transactions_owner_company_id
- idx_bank_transactions_supplier_invoice_id
- idx_client_invoices_owner_company_id
- idx_supplier_invoices_owner_company_id
- idx_payments_owner_company_id
- idx_payments_bank_transaction_id
- idx_expenses_owner_company_id
- idx_expenses_supplier_invoice_id
- idx_expenses_bank_transaction_id
- idx_expenses_payment_id