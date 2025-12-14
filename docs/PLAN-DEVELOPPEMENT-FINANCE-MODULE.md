# 📊 PLAN DE DÉVELOPPEMENT COMPLET - MODULE FINANCE 100% OPÉRATIONNEL

> **Version:** 2.0.0  
> **Date:** 14 décembre 2025  
> **Objectif:** Rendre le module Finance complètement fonctionnel et opérationnel  
> **Durée estimée:** 10-12 jours de développement  
> **Conformité:** 100% Suisse (TVA 2025, QR-Facture v2.3, Code des Obligations)

---

## 📋 TABLE DES MATIÈRES

1. [État Actuel](#1-état-actuel)
2. [Architecture Cible](#2-architecture-cible)
3. [Workflows Finance Détaillés](#3-workflows-finance-détaillés)
4. [Plan de Développement par Phase](#4-plan-de-développement-par-phase)
5. [Prompts Claude Code](#5-prompts-claude-code)
6. [Tests & Validation](#6-tests--validation)
7. [Checklist Finale](#7-checklist-finale)

---

## 1. ÉTAT ACTUEL

### ✅ Services Backend Existants (Fonctionnels)

| Service | Fichier | Description | État |
|---------|---------|-------------|------|
| Factures unifiées | `unified-invoice.service.js` | CRUD factures client | ✅ Créé |
| Générateur PDF | `pdf-generator.service.js` | PDF avec QR-Facture | ✅ Créé |
| Rapprochement bancaire | `bank-reconciliation.service.js` | Matching auto | ✅ Créé |
| OCR → Comptabilité | `ocr-to-accounting.service.js` | OCR factures fournisseurs | ✅ Créé |
| Dashboard Finance | `finance-dashboard.service.js` | KPIs et métriques | ✅ Créé |
| Orchestrateur | `finance-orchestrator.service.js` | Coordination workflows | ✅ Créé |

### ✅ Module Comptabilité Suisse (7,393 lignes)

```
src/backend/modules/accounting/
├── swiss-accounting.module.js      # Module principal
├── chart-of-accounts.service.js    # Plan comptable PME
├── journal-entries.service.js      # Écritures comptables
├── vat-switzerland.service.js      # TVA Suisse 2025
├── qr-invoice-generator.service.js # QR-Facture v2.3
├── financial-reports.service.js    # Rapports légaux CO
└── multi-currency.service.js       # Multi-devises CHF/EUR/USD
```

### ✅ Frontend Finance Existant

| Composant | Fichier | État |
|-----------|---------|------|
| Dashboard | `FinanceDashboard.jsx` | 🟡 À connecter |
| KPI Cards | `components/KPICards.jsx` | ✅ Créé |
| Alertes | `components/AlertsPanel.jsx` | ✅ Créé |
| Cash Flow | `components/CashFlowChart.jsx` | ✅ Créé |
| Transactions | `components/RecentTransactions.jsx` | ✅ Créé |
| Hook données | `hooks/useFinanceData.js` | 🟡 À connecter |
| API Service | `services/financeApi.js` | 🟡 À connecter |

### ✅ Collections Directus Finance

| Collection | Données | Relations | État |
|------------|---------|-----------|------|
| `client_invoices` | ~500 | ✅ company_id, project_id, owner_company_id | ✅ OK |
| `supplier_invoices` | ~200 | ✅ company_id | 🟡 Partiel |
| `bank_transactions` | ~1000 | ⚠️ owner_company_id | 🟡 Partiel |
| `bank_accounts` | 15 | ✅ owner_company_id | ✅ OK |
| `payments` | ~100 | ⚠️ Manque relations | 🔴 Incomplet |
| `reconciliations` | 0 | ❌ Non utilisé | 🔴 Vide |
| `accounting_entries` | ~50 | ⚠️ Relations partielles | 🟡 Partiel |
| `expenses` | ~100 | ⚠️ Manque owner_company | 🟡 Partiel |
| `budgets` | ~20 | ✅ OK | ✅ OK |

### 🔴 Éléments Manquants Critiques

1. **Backend**
   - [ ] Routes API `/api/finance/*` non montées sur Express
   - [ ] Middleware d'authentification Finance
   - [ ] Endpoints Directus custom non déployés
   - [ ] Intégration Revolut API non connectée (soldes à 0)

2. **Frontend**
   - [ ] Navigation vers module Finance depuis Dashboard
   - [ ] Pages CRUD complètes (Factures, Paiements, Rapprochements)
   - [ ] Modals création/édition
   - [ ] Workflow validation factures
   - [ ] Export PDF/Excel/XML

3. **Données**
   - [ ] Relations FK manquantes sur payments
   - [ ] Soldes bancaires à 0 (pas de sync Revolut)
   - [ ] Collection reconciliations vide

---

## 2. ARCHITECTURE CIBLE

### 2.1 Vue d'Ensemble

```
┌─────────────────────────────────────────────────────────────────────┐
│                     FRONTEND REACT (SuperAdmin)                      │
├─────────────────────────────────────────────────────────────────────┤
│  Finance Dashboard    │  Factures  │  Trésorerie  │  Comptabilité   │
│  - KPIs temps réel    │  - Clients │  - Comptes   │  - Grand livre  │
│  - Alertes            │  - Fourn.  │  - Rapproch. │  - Bilan        │
│  - Cash flow          │  - OCR     │  - Virements │  - P&L          │
├─────────────────────────────────────────────────────────────────────┤
│                        API EXPRESS (/api/finance/*)                  │
├──────────────┬───────────────┬───────────────┬──────────────────────┤
│ Dashboard    │ Invoices      │ Banking       │ Accounting           │
│ Service      │ Service       │ Service       │ Service              │
├──────────────┴───────────────┴───────────────┴──────────────────────┤
│                      SERVICES EXTERNES                               │
├────────────────┬─────────────────┬─────────────────┬────────────────┤
│ Invoice Ninja  │ Revolut API v2  │ Module Compta   │ OCR OpenAI     │
│ (Facturation)  │ (Banque)        │ Suisse          │ Vision         │
├────────────────┴─────────────────┴─────────────────┴────────────────┤
│                   DIRECTUS (Source de Vérité)                        │
│  Collections: client_invoices, supplier_invoices, payments,         │
│  bank_transactions, bank_accounts, accounting_entries, budgets      │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 Structure Fichiers Cible

```
src/
├── backend/
│   ├── api/
│   │   └── finance/
│   │       ├── index.js                    # Export routes
│   │       ├── finance.routes.js           # Définition routes
│   │       ├── dashboard.controller.js     # GET /dashboard/:company
│   │       ├── invoices.controller.js      # CRUD factures
│   │       ├── payments.controller.js      # CRUD paiements
│   │       ├── banking.controller.js       # Comptes & transactions
│   │       ├── reconciliation.controller.js # Rapprochement
│   │       ├── vat.controller.js           # TVA Suisse
│   │       └── reports.controller.js       # Rapports légaux
│   ├── services/
│   │   └── finance/
│   │       ├── unified-invoice.service.js  # ✅ Existe
│   │       ├── pdf-generator.service.js    # ✅ Existe
│   │       ├── bank-reconciliation.service.js # ✅ Existe
│   │       ├── ocr-to-accounting.service.js # ✅ Existe
│   │       ├── finance-dashboard.service.js # ✅ Existe
│   │       ├── finance-orchestrator.service.js # ✅ Existe
│   │       └── revolut-sync.service.js     # 🔴 À créer
│   └── modules/
│       └── accounting/                     # ✅ 100% complet
│
├── frontend/
│   └── src/
│       └── portals/
│           └── superadmin/
│               └── finance/
│                   ├── index.js            # ✅ Existe
│                   ├── FinanceDashboard.jsx # ✅ À améliorer
│                   ├── pages/
│                   │   ├── ClientInvoices.jsx    # 🔴 À créer
│                   │   ├── SupplierInvoices.jsx  # 🔴 À créer
│                   │   ├── BankAccounts.jsx      # 🔴 À créer
│                   │   ├── Reconciliation.jsx    # 🔴 À créer
│                   │   ├── VATDeclaration.jsx    # 🔴 À créer
│                   │   └── Reports.jsx           # 🔴 À créer
│                   ├── components/
│                   │   ├── KPICards.jsx          # ✅ Existe
│                   │   ├── AlertsPanel.jsx       # ✅ Existe
│                   │   ├── CashFlowChart.jsx     # ✅ Existe
│                   │   ├── RecentTransactions.jsx # ✅ Existe
│                   │   ├── InvoiceTable.jsx      # 🔴 À créer
│                   │   ├── InvoiceModal.jsx      # 🔴 À créer
│                   │   ├── PaymentModal.jsx      # 🔴 À créer
│                   │   └── ReconciliationPanel.jsx # 🔴 À créer
│                   ├── hooks/
│                   │   ├── useFinanceData.js     # ✅ À améliorer
│                   │   ├── useInvoices.js        # 🔴 À créer
│                   │   └── useBanking.js         # 🔴 À créer
│                   └── services/
│                       └── financeApi.js         # ✅ À améliorer
```



---

## 3. WORKFLOWS FINANCE DÉTAILLÉS

### 3.1 WORKFLOW 1: Création Facture Client avec QR-Facture

```
┌─────────────────────────────────────────────────────────────────┐
│                 WORKFLOW FACTURE CLIENT                          │
└─────────────────────────────────────────────────────────────────┘

[1] DÉCLENCHEUR
    └── Utilisateur clique "Nouvelle Facture" dans Dashboard

[2] MODAL CRÉATION
    ├── Sélection Owner Company (HYPERVISUAL, DAINAMICS, etc.)
    ├── Sélection Client (autocomplete companies)
    ├── Sélection Projet (optionnel)
    ├── Lignes de facturation
    │   ├── Description
    │   ├── Quantité
    │   ├── Prix unitaire
    │   └── Taux TVA (8.1% / 2.6% / 3.8% / 0%)
    └── Dates (émission, échéance)

[3] CALCULS AUTOMATIQUES
    ├── Sous-total HT
    ├── TVA par taux
    ├── Total TTC
    └── Génération numéro facture (INV-{COMPANY}-{YYYY}-{NNNN})

[4] SAUVEGARDE
    ├── POST /api/finance/invoices
    ├── Création dans Directus client_invoices
    ├── Status = "draft"
    └── Écriture comptable provisoire (optionnel)

[5] VALIDATION & ENVOI
    ├── Utilisateur valide la facture
    ├── Génération PDF avec QR-Facture v2.3
    │   ├── Adresse structurée OBLIGATOIRE
    │   ├── Swiss QR Code ISO 18004
    │   ├── Référence QRR avec modulo 10 récursif
    │   └── Section paiement 210x105mm
    ├── Status = "sent"
    └── Écriture comptable définitive

[6] SUIVI
    ├── Dashboard affiche statut en temps réel
    ├── Alertes automatiques (retard paiement)
    └── Relances programmées
```

### 3.2 WORKFLOW 2: OCR Facture Fournisseur → Comptabilité

```
┌─────────────────────────────────────────────────────────────────┐
│             WORKFLOW FACTURE FOURNISSEUR + OCR                   │
└─────────────────────────────────────────────────────────────────┘

[1] UPLOAD DOCUMENT
    └── Drag & drop PDF/image dans interface

[2] TRAITEMENT OCR (OpenAI Vision)
    ├── Extraction automatique:
    │   ├── Nom fournisseur
    │   ├── Numéro facture
    │   ├── Date et échéance
    │   ├── Montant HT / TVA / TTC
    │   ├── Taux TVA détecté
    │   └── IBAN fournisseur
    └── Confiance: Score 0-100%

[3] VALIDATION UTILISATEUR
    ├── Affichage preview avec données extraites
    ├── Correction manuelle si nécessaire
    ├── Sélection Owner Company
    └── Sélection compte comptable (autocomplete)

[4] COMPTABILISATION AUTOMATIQUE
    ├── Création supplier_invoice dans Directus
    ├── Génération écriture comptable:
    │   ├── Débit: Compte charge (6xxx)
    │   ├── Débit: TVA déductible (1170)
    │   └── Crédit: Fournisseurs (2000)
    └── Stockage document original

[5] PAIEMENT
    ├── Workflow approbation (si montant > seuil)
    ├── Virement via Revolut API (optionnel)
    └── Mise à jour status = "paid"
```

### 3.3 WORKFLOW 3: Rapprochement Bancaire Automatique

```
┌─────────────────────────────────────────────────────────────────┐
│              WORKFLOW RAPPROCHEMENT BANCAIRE                     │
└─────────────────────────────────────────────────────────────────┘

[1] SYNCHRONISATION REVOLUT
    ├── Appel API Revolut Business v2
    ├── GET /accounts → Mise à jour bank_accounts
    ├── GET /transactions → Import bank_transactions
    └── Stockage revolut_transaction_id

[2] MATCHING AUTOMATIQUE
    ├── Algorithme correspondance:
    │   ├── Match exact: montant + référence
    │   ├── Match proche: montant ± 1% + date ± 3j
    │   └── Match partiel: paiements multiples
    ├── Score de confiance (0-100%)
    └── Propositions de rapprochement

[3] VALIDATION UTILISATEUR
    ├── Interface tableau 3 colonnes:
    │   ├── Transactions bancaires
    │   ├── Factures ouvertes
    │   └── Rapprochements suggérés
    ├── Drag & drop pour associer
    └── Actions: Valider / Rejeter / Manuel

[4] COMPTABILISATION
    ├── Mise à jour status facture = "paid"
    ├── Écriture comptable paiement:
    │   ├── Débit: Banque (1020-1024)
    │   └── Crédit: Clients (1100) ou Fournisseurs (2000)
    └── Calcul écart de change (multi-devises)

[5] REPORTING
    ├── Solde rapproché vs solde comptable
    ├── Écarts non réconciliés
    └── Export pour révision
```

### 3.4 WORKFLOW 4: Déclaration TVA (Formulaire 200)

```
┌─────────────────────────────────────────────────────────────────┐
│               WORKFLOW DÉCLARATION TVA SUISSE                    │
└─────────────────────────────────────────────────────────────────┘

[1] SÉLECTION PÉRIODE
    ├── Trimestre: Q1, Q2, Q3, Q4
    └── Ou mensuel si CA > 5'005'000 CHF

[2] EXTRACTION AUTOMATIQUE
    ├── Parcours toutes écritures comptables de la période
    ├── Calcul par code TVA:
    │   ├── 200: Chiffre d'affaires total
    │   ├── 220: Prestations non imposables
    │   ├── 221: Exportations
    │   ├── 225: Transferts TDFN
    │   ├── 230: Acquisitions/Aliénations
    │   ├── 289: Chiffre imposable (200-220-221-225-230)
    │   ├── 302/303: TVA 8.1%
    │   ├── 312/313: TVA 2.6%
    │   ├── 342/343: TVA 3.8%
    │   ├── 382/383: Impôt sur acquisitions
    │   ├── 400: Impôt préalable sur marchandises
    │   ├── 405: Impôt préalable sur investissements
    │   ├── 410: Dégrèvement ultérieur
    │   └── 415: Corrections d'impôt préalable
    └── Calcul solde (500 ou 510)

[3] PRÉVISUALISATION
    ├── Affichage formulaire 200 complet
    ├── Vérification cohérence (chiffre 299 = somme)
    └── Possibilité correction manuelle

[4] SOUMISSION
    ├── Export XML format AFC (eCH-0217)
    ├── Ou soumission via ePortal (manuel)
    └── Archivage avec justificatifs

[5] PAIEMENT TVA
    ├── Calcul montant dû (ch. 500) ou créance (ch. 510)
    ├── Génération ordre de paiement Revolut
    └── Comptabilisation finale
```

### 3.5 WORKFLOW 5: Clôture Mensuelle/Annuelle

```
┌─────────────────────────────────────────────────────────────────┐
│                WORKFLOW CLÔTURE COMPTABLE                        │
└─────────────────────────────────────────────────────────────────┘

[1] VÉRIFICATIONS PRÉ-CLÔTURE
    ├── Toutes factures clients comptabilisées
    ├── Toutes factures fournisseurs enregistrées
    ├── Rapprochement bancaire complet
    ├── TVA déclarée et payée
    └── Pas d'écritures en brouillon

[2] ÉCRITURES DE RÉGULARISATION
    ├── Provisions (charges à payer, produits à recevoir)
    ├── Amortissements du mois
    ├── Écritures de change (réévaluation devises)
    └── Variations de stocks (si applicable)

[3] CALCULS AUTOMATIQUES
    ├── Balance générale
    ├── Balance âgée clients
    ├── Balance âgée fournisseurs
    └── Vérification équilibre D = C

[4] GÉNÉRATION RAPPORTS
    ├── Bilan (art. 959a CO)
    ├── Compte de résultat (art. 959b CO)
    ├── Annexe aux comptes (art. 959c CO)
    └── Tableau flux trésorerie (si >20M bilan)

[5] VERROUILLAGE PÉRIODE
    ├── Aucune modification possible après clôture
    ├── Horodatage et signature électronique
    └── Archivage audit trail

[6] OUVERTURE NOUVELLE PÉRIODE
    ├── Report à nouveau (compte 2970)
    └── Initialisation nouveaux journaux
```



---

## 4. PLAN DE DÉVELOPPEMENT PAR PHASE

### Phase 1: Fondations API (1-2 jours)
> **Objectif:** Connecter les services existants au serveur Express

| Tâche | Priorité | Durée | Dépendance |
|-------|----------|-------|------------|
| F1.1 - Monter routes `/api/finance/*` | 🔴 Critique | 2h | - |
| F1.2 - Middleware auth + validation | 🔴 Critique | 2h | F1.1 |
| F1.3 - Controllers dashboard | 🔴 Critique | 3h | F1.2 |
| F1.4 - Controllers invoices | 🔴 Critique | 4h | F1.2 |
| F1.5 - Controllers banking | 🟡 Important | 3h | F1.2 |
| F1.6 - Tests API (Postman/Jest) | 🟡 Important | 2h | F1.3-5 |

### Phase 2: Dashboard Finance React (2-3 jours)
> **Objectif:** Interface complète avec données temps réel

| Tâche | Priorité | Durée | Dépendance |
|-------|----------|-------|------------|
| F2.1 - Connexion financeApi.js ↔ API | 🔴 Critique | 2h | Phase 1 |
| F2.2 - KPIs temps réel avec Recharts | 🔴 Critique | 4h | F2.1 |
| F2.3 - Alertes dynamiques | 🔴 Critique | 2h | F2.1 |
| F2.4 - Cash flow chart interactif | 🟡 Important | 3h | F2.1 |
| F2.5 - Transactions récentes filtrable | 🟡 Important | 3h | F2.1 |
| F2.6 - Navigation menu Finance | 🔴 Critique | 1h | - |

### Phase 3: Factures Clients CRUD (2-3 jours)
> **Objectif:** Gestion complète factures avec QR-Facture

| Tâche | Priorité | Durée | Dépendance |
|-------|----------|-------|------------|
| F3.1 - Page ClientInvoices.jsx | 🔴 Critique | 4h | Phase 2 |
| F3.2 - InvoiceTable avec tri/filtre | 🔴 Critique | 3h | F3.1 |
| F3.3 - InvoiceModal création/édition | 🔴 Critique | 5h | F3.1 |
| F3.4 - Calcul TVA automatique | 🔴 Critique | 2h | F3.3 |
| F3.5 - Génération PDF + QR-Facture | 🔴 Critique | 4h | F3.3 |
| F3.6 - Workflow validation (draft→sent) | 🟡 Important | 3h | F3.5 |
| F3.7 - Export Excel/CSV | 🟢 Normal | 2h | F3.1 |

### Phase 4: Rapprochement Bancaire (1.5-2 jours)
> **Objectif:** Synchronisation Revolut + matching automatique

| Tâche | Priorité | Durée | Dépendance |
|-------|----------|-------|------------|
| F4.1 - Service Revolut sync | 🔴 Critique | 4h | Phase 1 |
| F4.2 - Page BankAccounts.jsx | 🔴 Critique | 3h | F4.1 |
| F4.3 - Page Reconciliation.jsx | 🔴 Critique | 4h | F4.1 |
| F4.4 - Interface 3 colonnes | 🔴 Critique | 4h | F4.3 |
| F4.5 - Algorithme matching auto | 🟡 Important | 3h | F4.3 |
| F4.6 - Drag & drop associations | 🟡 Important | 2h | F4.4 |

### Phase 5: Factures Fournisseurs + OCR (1-1.5 jours)
> **Objectif:** OCR automatique et comptabilisation

| Tâche | Priorité | Durée | Dépendance |
|-------|----------|-------|------------|
| F5.1 - Page SupplierInvoices.jsx | 🟡 Important | 3h | Phase 2 |
| F5.2 - Upload zone avec preview | 🟡 Important | 2h | F5.1 |
| F5.3 - Appel OCR OpenAI Vision | ✅ Existant | 0h | - |
| F5.4 - Modal validation données OCR | 🟡 Important | 3h | F5.2 |
| F5.5 - Génération écriture comptable | 🟡 Important | 3h | F5.4 |
| F5.6 - Workflow approbation | 🟢 Normal | 2h | F5.5 |

### Phase 6: Paiements & Virements (1-1.5 jours)
> **Objectif:** Gestion paiements et intégration Revolut

| Tâche | Priorité | Durée | Dépendance |
|-------|----------|-------|------------|
| F6.1 - Compléter relations payments | 🔴 Critique | 2h | - |
| F6.2 - PaymentModal création | 🟡 Important | 3h | F6.1 |
| F6.3 - Association facture ↔ paiement | 🟡 Important | 2h | F6.2 |
| F6.4 - Initiation virement Revolut | 🟢 Normal | 4h | F6.2 |
| F6.5 - Mise à jour status auto | 🟡 Important | 2h | F6.3 |

### Phase 7: TVA Suisse (1-1.5 jours)
> **Objectif:** Formulaire 200 complet et export AFC

| Tâche | Priorité | Durée | Dépendance |
|-------|----------|-------|------------|
| F7.1 - Page VATDeclaration.jsx | 🟡 Important | 3h | Phase 2 |
| F7.2 - Extraction codes TVA auto | ✅ Existant | 0h | Module compta |
| F7.3 - Preview formulaire 200 | 🟡 Important | 4h | F7.1 |
| F7.4 - Export XML eCH-0217 | 🟡 Important | 3h | F7.3 |
| F7.5 - Archivage avec justificatifs | 🟢 Normal | 2h | F7.4 |

### Phase 8: Rapports Légaux (1.5-2 jours)
> **Objectif:** Bilan, P&L, Annexe conformes CO

| Tâche | Priorité | Durée | Dépendance |
|-------|----------|-------|------------|
| F8.1 - Page Reports.jsx | 🟡 Important | 2h | Phase 2 |
| F8.2 - Sélecteur période/exercice | 🟡 Important | 2h | F8.1 |
| F8.3 - Bilan art. 959a CO | ✅ Existant | 1h | Module compta |
| F8.4 - P&L art. 959b CO | ✅ Existant | 1h | Module compta |
| F8.5 - Annexe art. 959c CO | ✅ Existant | 1h | Module compta |
| F8.6 - Export PDF professionnel | 🟡 Important | 4h | F8.3-5 |
| F8.7 - Export Excel détaillé | 🟢 Normal | 2h | F8.3-5 |

---

## 5. PROMPTS CLAUDE CODE

### PROMPT F-01: Routes API Finance (Phase 1)

```markdown
# PROMPT F-01: Montage Routes API Finance

## Contexte
Les services Finance existent dans `src/backend/services/finance/` mais ne sont pas 
connectés au serveur Express. L'API doit exposer ces services.

## Fichiers à créer/modifier

### 1. src/backend/api/finance/index.js
```javascript
const router = require('express').Router();
const dashboardController = require('./dashboard.controller');
const invoicesController = require('./invoices.controller');
const bankingController = require('./banking.controller');
const reconciliationController = require('./reconciliation.controller');
const vatController = require('./vat.controller');
const reportsController = require('./reports.controller');

// Middleware auth
const { authenticateToken } = require('../../middleware/auth');
router.use(authenticateToken);

// Routes Dashboard
router.get('/dashboard/:company', dashboardController.getDashboard);
router.get('/dashboard/:company/kpis', dashboardController.getKPIs);
router.get('/dashboard/:company/alerts', dashboardController.getAlerts);

// Routes Factures
router.get('/invoices', invoicesController.list);
router.get('/invoices/:id', invoicesController.get);
router.post('/invoices', invoicesController.create);
router.put('/invoices/:id', invoicesController.update);
router.delete('/invoices/:id', invoicesController.delete);
router.post('/invoices/:id/generate-pdf', invoicesController.generatePDF);
router.post('/invoices/:id/send', invoicesController.send);

// Routes Banking
router.get('/bank-accounts', bankingController.listAccounts);
router.get('/bank-accounts/:id/transactions', bankingController.getTransactions);
router.post('/bank-accounts/sync', bankingController.syncRevolut);

// Routes Rapprochement
router.get('/reconciliation/pending', reconciliationController.getPending);
router.post('/reconciliation/match', reconciliationController.createMatch);
router.post('/reconciliation/auto-match', reconciliationController.autoMatch);

// Routes TVA
router.get('/vat/periods', vatController.getPeriods);
router.get('/vat/form-200/:period', vatController.getForm200);
router.post('/vat/form-200/:period/export', vatController.exportXML);

// Routes Rapports
router.get('/reports/balance-sheet', reportsController.getBalanceSheet);
router.get('/reports/income-statement', reportsController.getIncomeStatement);
router.get('/reports/cash-flow', reportsController.getCashFlow);
router.post('/reports/export-pdf', reportsController.exportPDF);

module.exports = router;
```

### 2. src/backend/api/finance/dashboard.controller.js
Implémenter les méthodes en utilisant `finance-dashboard.service.js`

### 3. src/backend/server.js (modifier)
Ajouter: `app.use('/api/finance', require('./api/finance'));`

## Validation
- [ ] `curl http://localhost:3000/api/finance/dashboard/HYPERVISUAL` retourne JSON
- [ ] Toutes les routes répondent (même vides)
- [ ] Authentification fonctionne
```

---

### PROMPT F-02: Dashboard Finance React (Phase 2)

```markdown
# PROMPT F-02: Dashboard Finance avec Données Temps Réel

## Contexte
Le dashboard Finance existe mais n'est pas connecté à l'API.
Utiliser les composants existants: KPICards, AlertsPanel, CashFlowChart, RecentTransactions

## Fichiers à modifier

### 1. src/frontend/src/portals/superadmin/finance/services/financeApi.js
```javascript
import axios from 'axios';

const API_BASE = '/api/finance';

export const financeApi = {
  // Dashboard
  getDashboard: (company) => axios.get(`${API_BASE}/dashboard/${company}`),
  getKPIs: (company) => axios.get(`${API_BASE}/dashboard/${company}/kpis`),
  getAlerts: (company) => axios.get(`${API_BASE}/dashboard/${company}/alerts`),
  
  // Invoices
  getInvoices: (params) => axios.get(`${API_BASE}/invoices`, { params }),
  getInvoice: (id) => axios.get(`${API_BASE}/invoices/${id}`),
  createInvoice: (data) => axios.post(`${API_BASE}/invoices`, data),
  updateInvoice: (id, data) => axios.put(`${API_BASE}/invoices/${id}`, data),
  deleteInvoice: (id) => axios.delete(`${API_BASE}/invoices/${id}`),
  generatePDF: (id) => axios.post(`${API_BASE}/invoices/${id}/generate-pdf`),
  
  // Banking
  getBankAccounts: () => axios.get(`${API_BASE}/bank-accounts`),
  getTransactions: (accountId) => axios.get(`${API_BASE}/bank-accounts/${accountId}/transactions`),
  syncRevolut: () => axios.post(`${API_BASE}/bank-accounts/sync`),
  
  // Reconciliation
  getPendingReconciliations: () => axios.get(`${API_BASE}/reconciliation/pending`),
  autoMatch: () => axios.post(`${API_BASE}/reconciliation/auto-match`),
  createMatch: (data) => axios.post(`${API_BASE}/reconciliation/match`, data),
};
```

### 2. src/frontend/src/portals/superadmin/finance/hooks/useFinanceData.js
```javascript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeApi } from '../services/financeApi';

export const useFinanceData = (company = 'HYPERVISUAL') => {
  const queryClient = useQueryClient();
  
  // Dashboard data
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['finance-dashboard', company],
    queryFn: () => financeApi.getDashboard(company),
    refetchInterval: 30000, // Refresh every 30s
  });
  
  // KPIs
  const { data: kpis } = useQuery({
    queryKey: ['finance-kpis', company],
    queryFn: () => financeApi.getKPIs(company),
  });
  
  // Alerts
  const { data: alerts } = useQuery({
    queryKey: ['finance-alerts', company],
    queryFn: () => financeApi.getAlerts(company),
    refetchInterval: 60000,
  });
  
  return { dashboard, kpis, alerts, isLoading };
};
```

### 3. src/frontend/src/portals/superadmin/finance/FinanceDashboard.jsx
Connecter les composants avec les hooks ci-dessus.
Utiliser les classes Tabler.io pour le style.

## Validation
- [ ] Dashboard affiche données réelles
- [ ] KPIs se mettent à jour automatiquement
- [ ] Alertes s'affichent en temps réel
- [ ] Graphique Cash Flow interactif
```

---

### PROMPT F-03: Page Factures Clients (Phase 3)

```markdown
# PROMPT F-03: Page Factures Clients avec CRUD Complet

## Contexte
Créer la page de gestion des factures clients avec tableau, filtres, 
modal création/édition, et génération PDF avec QR-Facture.

## Fichiers à créer

### 1. src/frontend/src/portals/superadmin/finance/pages/ClientInvoices.jsx
- Tableau avec colonnes: N° Facture, Client, Montant, Statut, Date, Actions
- Filtres: Owner Company, Status, Période
- Pagination
- Actions: Voir, Modifier, Dupliquer, Générer PDF, Supprimer

### 2. src/frontend/src/portals/superadmin/finance/components/InvoiceTable.jsx
- Utiliser classes Tabler.io: `table table-vcenter card-table`
- Badges statuts: draft (jaune), sent (bleu), paid (vert), overdue (rouge)
- Actions avec icônes Lucide React

### 3. src/frontend/src/portals/superadmin/finance/components/InvoiceModal.jsx
- Modal création/édition facture
- Formulaire avec:
  - Owner Company (dropdown)
  - Client (autocomplete companies)
  - Projet (optionnel, autocomplete)
  - Date émission / échéance
  - Lignes de facturation (dynamiques)
    - Description
    - Quantité
    - Prix unitaire
    - Taux TVA (8.1%, 2.6%, 3.8%, 0%)
  - Sous-total, TVA, Total TTC (calculés auto)
  - Notes / conditions

### 4. Calculs TVA automatiques
```javascript
const calculateInvoice = (lines) => {
  const vatGroups = { normal: 0, reduced: 0, accommodation: 0 };
  let subtotal = 0;
  
  lines.forEach(line => {
    const lineTotal = line.quantity * line.unitPrice;
    subtotal += lineTotal;
    
    switch(line.vatRate) {
      case 0.081: vatGroups.normal += lineTotal * 0.081; break;
      case 0.026: vatGroups.reduced += lineTotal * 0.026; break;
      case 0.038: vatGroups.accommodation += lineTotal * 0.038; break;
    }
  });
  
  const totalVat = Object.values(vatGroups).reduce((a, b) => a + b, 0);
  return { subtotal, vatGroups, totalVat, total: subtotal + totalVat };
};
```

## Validation
- [ ] Tableau affiche factures existantes
- [ ] Création facture fonctionne
- [ ] Calcul TVA automatique correct
- [ ] Génération PDF avec QR-Facture valide
```

---

### PROMPT F-04: Rapprochement Bancaire (Phase 4)

```markdown
# PROMPT F-04: Interface Rapprochement Bancaire

## Contexte
Créer l'interface de rapprochement bancaire avec:
- Synchronisation Revolut
- Matching automatique transactions ↔ factures
- Interface 3 colonnes avec drag & drop

## Fichiers à créer

### 1. src/backend/services/finance/revolut-sync.service.js
```javascript
const axios = require('axios');

class RevolutSyncService {
  constructor() {
    this.baseURL = process.env.REVOLUT_API_URL || 'https://b2b.revolut.com/api/1.0';
    this.token = process.env.REVOLUT_ACCESS_TOKEN;
  }
  
  async syncAccounts(ownerCompanyId) {
    // GET /accounts
    // Update bank_accounts in Directus
  }
  
  async syncTransactions(accountId, fromDate, toDate) {
    // GET /transactions
    // Insert into bank_transactions with revolut_transaction_id
    // Éviter les doublons
  }
  
  async getAllCompanyBalances() {
    // Retourne soldes pour toutes les owner_companies
  }
}
```

### 2. src/frontend/src/portals/superadmin/finance/pages/Reconciliation.jsx
Interface 3 colonnes:
- Colonne gauche: Transactions bancaires non rapprochées
- Colonne droite: Factures non payées
- Colonne centrale: Rapprochements suggérés

### 3. src/frontend/src/portals/superadmin/finance/components/ReconciliationPanel.jsx
- Drag & drop avec react-dnd ou @dnd-kit
- Score de confiance affiché
- Actions: Valider match, Rejeter, Match manuel

### 4. Algorithme matching
```javascript
const autoMatch = (transactions, invoices) => {
  const matches = [];
  
  transactions.forEach(tx => {
    invoices.forEach(inv => {
      const score = calculateMatchScore(tx, inv);
      if (score > 0.8) {
        matches.push({
          transaction: tx,
          invoice: inv,
          score,
          matchType: score === 1 ? 'exact' : 'probable'
        });
      }
    });
  });
  
  return matches.sort((a, b) => b.score - a.score);
};

const calculateMatchScore = (tx, inv) => {
  let score = 0;
  
  // Match montant exact
  if (Math.abs(tx.amount - inv.total) < 0.01) score += 0.5;
  // Match montant proche (±1%)
  else if (Math.abs(tx.amount - inv.total) / inv.total < 0.01) score += 0.3;
  
  // Match référence dans description
  if (tx.description.includes(inv.invoice_number)) score += 0.4;
  
  // Match date proche (±7 jours de l'échéance)
  const daysDiff = Math.abs(new Date(tx.date) - new Date(inv.due_date)) / 86400000;
  if (daysDiff <= 7) score += 0.1;
  
  return Math.min(score, 1);
};
```

## Validation
- [ ] Sync Revolut récupère transactions
- [ ] Auto-match propose correspondances
- [ ] Drag & drop fonctionne
- [ ] Validation met à jour les statuts
```



---

### PROMPT F-05: Factures Fournisseurs + OCR (Phase 5)

```markdown
# PROMPT F-05: Page Factures Fournisseurs avec OCR

## Contexte
Les factures fournisseurs sont uploadées en PDF/image, traitées par OCR 
(OpenAI Vision), puis validées et comptabilisées automatiquement.

## Fichiers à créer

### 1. src/frontend/src/portals/superadmin/finance/pages/SupplierInvoices.jsx
- Tableau factures fournisseurs existantes
- Zone d'upload drag & drop
- Modal validation données OCR

### 2. src/frontend/src/portals/superadmin/finance/components/OCRUploadZone.jsx
```jsx
import { useDropzone } from 'react-dropzone';

const OCRUploadZone = ({ onUpload }) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/pdf': ['.pdf'], 'image/*': ['.jpg', '.jpeg', '.png'] },
    maxFiles: 1,
    onDrop: async (files) => {
      const formData = new FormData();
      formData.append('file', files[0]);
      const result = await financeApi.processOCR(formData);
      onUpload(result);
    }
  });
  
  return (
    <div {...getRootProps()} className={`card dropzone ${isDragActive ? 'active' : ''}`}>
      <input {...getInputProps()} />
      <div className="card-body text-center">
        <Upload className="mb-3" size={48} />
        <p>Glissez une facture PDF ou image ici</p>
        <small className="text-muted">ou cliquez pour sélectionner</small>
      </div>
    </div>
  );
};
```

### 3. src/frontend/src/portals/superadmin/finance/components/OCRValidationModal.jsx
- Preview document côté gauche
- Formulaire données extraites côté droit
- Champs:
  - Fournisseur (autocomplete ou création)
  - N° Facture
  - Date / Date échéance
  - Montant HT / TVA / TTC
  - Taux TVA détecté
  - IBAN fournisseur
  - Owner Company
  - Compte comptable (autocomplete plan comptable)
- Score confiance OCR affiché
- Boutons: Corriger / Valider & Comptabiliser

### 4. Backend OCR endpoint (déjà existant)
Vérifier que `ocr-to-accounting.service.js` est bien connecté

## Validation
- [ ] Upload PDF/image fonctionne
- [ ] OCR extrait données correctement
- [ ] Modal permet correction
- [ ] Écriture comptable créée automatiquement
```

---

### PROMPT F-06: TVA Suisse - Formulaire 200 (Phase 7)

```markdown
# PROMPT F-06: Déclaration TVA avec Formulaire 200

## Contexte
Générer automatiquement le formulaire 200 de l'AFC à partir des écritures 
comptables, avec export XML conforme eCH-0217.

## Fichiers à créer

### 1. src/frontend/src/portals/superadmin/finance/pages/VATDeclaration.jsx
- Sélecteur période (trimestre ou mois)
- Sélecteur Owner Company
- Preview formulaire 200 interactif
- Actions: Calculer, Exporter XML, Archiver

### 2. src/frontend/src/portals/superadmin/finance/components/Form200Preview.jsx
```jsx
const Form200Preview = ({ data }) => {
  return (
    <div className="card form-200">
      <div className="card-header">
        <h3>Formulaire 200 - Décompte TVA</h3>
        <span>Période: {data.period}</span>
      </div>
      <div className="card-body">
        {/* I. CHIFFRE D'AFFAIRES */}
        <FormSection title="I. Chiffre d'affaires">
          <FormLine num="200" label="Total des contre-prestations" value={data.ch200} />
          <FormLine num="220" label="Prestations non imposables" value={data.ch220} />
          <FormLine num="221" label="Exportations" value={data.ch221} />
          <FormLine num="225" label="Transferts TDFN" value={data.ch225} />
          <FormLine num="230" label="Diminutions" value={data.ch230} />
          <FormLine num="289" label="TOTAL CHIFFRE IMPOSABLE" value={data.ch289} bold />
        </FormSection>
        
        {/* II. CALCUL IMPÔT */}
        <FormSection title="II. Calcul de l'impôt">
          <VatLine rate="8.1%" ch={302} base={data.ch302} tax={data.ch303} />
          <VatLine rate="2.6%" ch={312} base={data.ch312} tax={data.ch313} />
          <VatLine rate="3.8%" ch={342} base={data.ch342} tax={data.ch343} />
          <VatLine rate="Acquisitions" ch={382} base={data.ch382} tax={data.ch383} />
          <FormLine num="399" label="TOTAL IMPÔT BRUT" value={data.ch399} bold />
        </FormSection>
        
        {/* III. IMPÔT PRÉALABLE */}
        <FormSection title="III. Impôt préalable">
          <FormLine num="400" label="Impôt préalable matériel" value={data.ch400} />
          <FormLine num="405" label="Impôt préalable investissements" value={data.ch405} />
          <FormLine num="410" label="Dégrèvement ultérieur" value={data.ch410} />
          <FormLine num="415" label="Corrections/réductions" value={data.ch415} />
          <FormLine num="479" label="TOTAL IMPÔT PRÉALABLE" value={data.ch479} bold />
        </FormSection>
        
        {/* RÉSULTAT */}
        <FormSection title="Résultat">
          <FormLine num="500" label="Montant à payer à l'AFC" value={data.ch500} highlight />
          <FormLine num="510" label="Créance envers l'AFC" value={data.ch510} />
        </FormSection>
      </div>
    </div>
  );
};
```

### 3. Backend: Export XML eCH-0217
Le service `vat-switzerland.service.js` doit générer le XML conforme.

## Validation
- [ ] Calcul automatique correct
- [ ] Tous les chiffres correspondent aux écritures
- [ ] Export XML valide pour ePortal AFC
- [ ] Archivage avec justificatifs
```

---

### PROMPT F-07: Rapports Légaux CO (Phase 8)

```markdown
# PROMPT F-07: Rapports Légaux - Bilan, P&L, Annexe

## Contexte
Générer les rapports légaux conformes au Code des Obligations suisse:
- Bilan (art. 959a CO)
- Compte de résultat (art. 959b CO)
- Annexe aux comptes (art. 959c CO)

## Fichiers à créer

### 1. src/frontend/src/portals/superadmin/finance/pages/Reports.jsx
- Sélecteur: Type de rapport
- Sélecteur: Période / Exercice
- Sélecteur: Owner Company
- Preview rapport
- Actions: Générer, Export PDF, Export Excel

### 2. Composants rapports
- `BalanceSheetReport.jsx` - Structure art. 959a CO
- `IncomeStatementReport.jsx` - Structure art. 959b CO
- `AnnexReport.jsx` - Structure art. 959c CO
- `CashFlowReport.jsx` - Flux de trésorerie

### 3. Structure Bilan (art. 959a CO)
```
ACTIF
├── Actif circulant
│   ├── Liquidités (1000-1099)
│   ├── Créances clients (1100-1199)
│   ├── Autres créances CT (1200-1299)
│   ├── Stocks (1300-1399)
│   └── Actifs régularisation (1400-1499)
└── Actif immobilisé
    ├── Immo. financières (1500-1599)
    ├── Immobilisations corporelles (1600-1699)
    └── Immobilisations incorporelles (1700-1799)

PASSIF
├── Capitaux étrangers CT
│   ├── Dettes fournisseurs (2000-2099)
│   ├── Dettes CT intérêts (2100-2199)
│   ├── Autres dettes CT (2200-2299)
│   └── Passifs régularisation (2300-2399)
├── Capitaux étrangers LT
│   ├── Dettes LT intérêts (2400-2499)
│   └── Provisions (2500-2599)
└── Capitaux propres
    ├── Capital social (2800)
    ├── Réserves (2900-2949)
    └── Résultat (2970-2979)
```

### 4. Export PDF professionnel
- En-tête avec logo entreprise
- Mise en page A4 portrait
- Police professionnelle
- Pied de page avec date/heure génération

## Validation
- [ ] Bilan équilibré (Actif = Passif)
- [ ] P&L calculs corrects
- [ ] Annexe contient toutes les mentions obligatoires
- [ ] PDF professionnel et lisible
```

---

## 6. TESTS & VALIDATION

### 6.1 Tests Backend (Jest)

```javascript
// tests/finance/dashboard.test.js
describe('Finance Dashboard API', () => {
  test('GET /api/finance/dashboard/HYPERVISUAL returns KPIs', async () => {
    const response = await request(app)
      .get('/api/finance/dashboard/HYPERVISUAL')
      .set('Authorization', `Bearer ${testToken}`);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('kpis');
    expect(response.body).toHaveProperty('alerts');
    expect(response.body).toHaveProperty('cashFlow');
  });
  
  test('POST /api/finance/invoices creates invoice', async () => {
    const response = await request(app)
      .post('/api/finance/invoices')
      .set('Authorization', `Bearer ${testToken}`)
      .send({
        owner_company_id: 'xxx',
        client_id: 'yyy',
        lines: [{ description: 'Test', quantity: 1, unitPrice: 100, vatRate: 0.081 }]
      });
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('invoice_number');
  });
});
```

### 6.2 Tests E2E Frontend (Cypress)

```javascript
// cypress/e2e/finance/invoices.cy.js
describe('Client Invoices', () => {
  beforeEach(() => {
    cy.login('admin@test.com', 'password');
    cy.visit('/superadmin/finance/invoices');
  });
  
  it('creates a new invoice', () => {
    cy.get('[data-cy="new-invoice-btn"]').click();
    cy.get('[data-cy="client-select"]').select('ABB Ltd');
    cy.get('[data-cy="add-line-btn"]').click();
    cy.get('[data-cy="line-description"]').type('Prestation conseil');
    cy.get('[data-cy="line-quantity"]').type('10');
    cy.get('[data-cy="line-price"]').type('150');
    cy.get('[data-cy="line-vat"]').select('8.1%');
    
    cy.get('[data-cy="save-btn"]').click();
    cy.contains('Facture créée avec succès');
  });
  
  it('generates PDF with QR code', () => {
    cy.get('[data-cy="invoice-row"]').first().click();
    cy.get('[data-cy="generate-pdf-btn"]').click();
    cy.wait(3000);
    cy.contains('PDF généré');
  });
});
```

### 6.3 Tests TVA Suisse

```javascript
// tests/finance/vat.test.js
describe('Swiss VAT Calculations', () => {
  test('calculates VAT 8.1% correctly', () => {
    const result = calculateVAT(1000, 'normal');
    expect(result.vatAmount).toBe(81);
    expect(result.total).toBe(1081);
  });
  
  test('calculates VAT 2.6% correctly', () => {
    const result = calculateVAT(1000, 'reduced');
    expect(result.vatAmount).toBe(26);
    expect(result.total).toBe(1026);
  });
  
  test('generates valid Form 200', () => {
    const form200 = generateForm200('2025-Q4', 'HYPERVISUAL');
    expect(form200.ch289).toBe(form200.ch200 - form200.ch220 - form200.ch221 - form200.ch225 - form200.ch230);
    expect(form200.ch399).toBe(form200.ch303 + form200.ch313 + form200.ch343 + form200.ch383);
  });
});
```

### 6.4 Tests QR-Facture v2.3

```javascript
// tests/finance/qr-invoice.test.js
describe('QR-Invoice Generation', () => {
  test('generates valid Swiss QR Code', async () => {
    const invoice = { /* ... */ };
    const qrData = await generateQRInvoice(invoice);
    
    // Vérifier structure
    expect(qrData.header.qrType).toBe('SPC');
    expect(qrData.header.version).toBe('0200');
    expect(qrData.header.coding).toBe('1');
    
    // Vérifier IBAN
    expect(qrData.creditorInfo.iban).toMatch(/^CH[0-9]{2}[0-9A-Z]{21}$/);
    
    // Vérifier adresse structurée (OBLIGATOIRE depuis 22.11.2025)
    expect(qrData.creditorInfo.addressType).toBe('S');
    expect(qrData.creditorInfo.name).toBeDefined();
    expect(qrData.creditorInfo.street).toBeDefined();
    expect(qrData.creditorInfo.postalCode).toBeDefined();
    expect(qrData.creditorInfo.city).toBeDefined();
  });
  
  test('validates QRR reference (modulo 10 recursive)', () => {
    const validRef = '210000000003139471430009017';
    expect(validateQRReference(validRef)).toBe(true);
    
    const invalidRef = '210000000003139471430009018';
    expect(validateQRReference(invalidRef)).toBe(false);
  });
});
```

---

## 7. CHECKLIST FINALE

### ✅ Backend API

- [ ] Routes `/api/finance/*` montées et fonctionnelles
- [ ] Authentification middleware actif
- [ ] Controllers connectés aux services
- [ ] Sync Revolut opérationnelle
- [ ] Génération PDF avec QR-Facture
- [ ] Export XML TVA (eCH-0217)

### ✅ Frontend React

- [ ] Dashboard Finance avec KPIs temps réel
- [ ] Navigation menu Finance dans Sidebar
- [ ] Page Factures Clients (CRUD complet)
- [ ] Page Factures Fournisseurs + OCR
- [ ] Page Comptes Bancaires
- [ ] Page Rapprochement Bancaire
- [ ] Page Déclaration TVA
- [ ] Page Rapports Légaux

### ✅ Données Directus

- [ ] Relations FK complètes (payments)
- [ ] Collection reconciliations utilisée
- [ ] Soldes bancaires synchronisés
- [ ] Historique transactions importé

### ✅ Conformité Suisse

- [ ] TVA 2025: 8.1% / 2.6% / 3.8%
- [ ] QR-Facture v2.3 conforme (adresses structurées)
- [ ] Formulaire 200 complet et calculé
- [ ] Bilan art. 959a CO
- [ ] P&L art. 959b CO
- [ ] Annexe art. 959c CO

### ✅ Tests

- [ ] Tests unitaires backend (Jest) passent
- [ ] Tests E2E frontend (Cypress) passent
- [ ] Tests manuels validés
- [ ] Performance < 3s chargement

---

## 📊 RÉCAPITULATIF PLANNING

| Phase | Durée | Priorité | Dépendances |
|-------|-------|----------|-------------|
| 1. Fondations API | 1-2 jours | 🔴 Critique | - |
| 2. Dashboard React | 2-3 jours | 🔴 Critique | Phase 1 |
| 3. Factures Clients | 2-3 jours | 🔴 Critique | Phase 2 |
| 4. Rapprochement Bancaire | 1.5-2 jours | 🔴 Critique | Phase 1 |
| 5. Factures Fournisseurs OCR | 1-1.5 jours | 🟡 Important | Phase 2 |
| 6. Paiements | 1-1.5 jours | 🟡 Important | Phases 3, 4 |
| 7. TVA Suisse | 1-1.5 jours | 🟡 Important | Phase 3 |
| 8. Rapports Légaux | 1.5-2 jours | 🟡 Important | Toutes |

**Total estimé: 10-12 jours de développement**

---

## 🚀 PROCHAINE ÉTAPE IMMÉDIATE

Commencer par **PROMPT F-01: Routes API Finance** pour connecter les services existants au serveur Express.

```bash
# Vérifier l'état actuel
ls -la src/backend/services/finance/
ls -la src/backend/api/finance/

# Tester si l'API répond
curl http://localhost:3000/api/finance/dashboard/HYPERVISUAL
```

---

*Document généré le 14 décembre 2025*  
*Projet: Directus Unified Platform - Module Finance*  
*Version: 2.0.0*
