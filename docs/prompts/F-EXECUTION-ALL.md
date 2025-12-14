# 🚀 EXÉCUTION SÉQUENTIELLE COMPLÈTE - F-01 À F-12

## Instructions pour Claude Code

Tu dois exécuter les **12 prompts** dans l'ordre strict (F-01 → F-12). 
Après chaque prompt exécuté, tu dois créer un rapport.

---

## 📋 VUE D'ENSEMBLE DES 12 PROMPTS

| Prompt | Fichier | Module | Statut |
|--------|---------|--------|--------|
| F-01 | `PROMPT-01-UNIFIED-INVOICE-SERVICE.md` | Finance - Service Facturation | ✅ RAPPORT EXISTE |
| F-02 | `PROMPT-02-PDF-GENERATOR-SERVICE.md` | Finance - Générateur PDF | ✅ RAPPORT EXISTE |
| F-03 | `PROMPT-03-BANK-RECONCILIATION-SERVICE.md` | Finance - Rapprochement Bancaire | ✅ RAPPORT EXISTE |
| F-04 | `PROMPT-04-OCR-TO-ACCOUNTING-SERVICE.md` | Finance - OCR → Comptabilité | ✅ RAPPORT EXISTE |
| F-05 | `PROMPT-05-FINANCE-DASHBOARD-SERVICE.md` | Finance - Service Dashboard | ✅ RAPPORT EXISTE |
| F-06 | `PROMPT-06-FINANCE-API-ENDPOINTS.md` | Finance - Endpoints API | ✅ RAPPORT EXISTE |
| F-07 | `PROMPT-07-FINANCE-FRONTEND-COMPONENTS.md` | Finance - Composants Frontend | ✅ RAPPORT EXISTE |
| F-08 | `PROMPT-08-FINANCE-INTEGRATION-ORCHESTRATOR.md` | Finance - Orchestrateur | ✅ RAPPORT EXISTE |
| F-09 | `PROMPT-09-CGV-SIGNATURE-ELECTRONIQUE.md` | Legal - CGV & Signature | ✅ RAPPORT EXISTE |
| F-10 | `PROMPT-10-RECOUVREMENT-AUTOMATISE.md` | Legal - Recouvrement | ✅ RAPPORT EXISTE |
| F-11 | `EXECUTION-F11-LEGAL-COLLECTION.md` | Frontend - Legal & Collection | ⏳ À EXÉCUTER |
| F-12 | `EXECUTION-F12-CRM-SETTINGS.md` | Frontend - CRM & Settings | ⏳ À EXÉCUTER |

---

## 🏗️ ARCHITECTURE PAR MODULE

### MODULE FINANCE (F-01 à F-08)
```
Backend Services:
├── F-01: unified-invoice.service.js      → Facturation unifiée
├── F-02: pdf-generator.service.js        → Génération PDF QR-factures
├── F-03: bank-reconciliation.service.js  → Rapprochement bancaire
├── F-04: ocr-to-accounting.service.js    → OCR vers comptabilité
├── F-05: finance-dashboard.service.js    → Métriques dashboard
├── F-06: finance.routes.js               → Endpoints API REST
├── F-07: Frontend Finance/               → Composants React
└── F-08: finance-orchestrator.service.js → Orchestration workflows
```

### MODULE LEGAL (F-09 à F-11)
```
Backend Services:
├── F-09: cgv.service.js                  → CGV/CGL suisses
├── F-09: signature.service.js            → Signature électronique
├── F-10: debt-collection.service.js      → Recouvrement automatisé
├── F-10: lp-tracking.service.js          → Poursuites LP

Frontend:
└── F-11: Legal & Collection Dashboard    → Interface complète
    ├── LegalDashboard.jsx
    ├── CGVManager.jsx
    ├── SignatureRequests.jsx
    ├── CollectionDashboard.jsx
    ├── DebtorsList.jsx
    └── LPCases.jsx
```

### MODULE CRM & SETTINGS (F-12)
```
Frontend:
└── F-12: CRM & Settings Dashboard        → Configuration plateforme
    ├── CRMDashboard.jsx
    ├── ContactsList.jsx
    ├── CompaniesList.jsx
    ├── SettingsDashboard.jsx
    ├── CompanySettings.jsx
    ├── InvoiceSettings.jsx
    └── ProductsList.jsx
```

---

## 📂 CORRESPONDANCE FICHIERS

### Pour exécuter chaque prompt, lire le fichier :

```bash
# F-01 à F-08 (Module Finance)
cat docs/prompts/PROMPT-01-UNIFIED-INVOICE-SERVICE.md
cat docs/prompts/PROMPT-02-PDF-GENERATOR-SERVICE.md
cat docs/prompts/PROMPT-03-BANK-RECONCILIATION-SERVICE.md
cat docs/prompts/PROMPT-04-OCR-TO-ACCOUNTING-SERVICE.md
cat docs/prompts/PROMPT-05-FINANCE-DASHBOARD-SERVICE.md
cat docs/prompts/PROMPT-06-FINANCE-API-ENDPOINTS.md
cat docs/prompts/PROMPT-07-FINANCE-FRONTEND-COMPONENTS.md
cat docs/prompts/PROMPT-08-FINANCE-INTEGRATION-ORCHESTRATOR.md

# F-09 à F-10 (Module Legal Backend)
cat docs/prompts/PROMPT-09-CGV-SIGNATURE-ELECTRONIQUE.md
cat docs/prompts/PROMPT-10-RECOUVREMENT-AUTOMATISE.md

# F-11 à F-12 (Modules Frontend)
cat docs/prompts/EXECUTION-F11-LEGAL-COLLECTION.md
cat docs/prompts/EXECUTION-F12-CRM-SETTINGS.md
```

---

## 🔄 STATUT DES RAPPORTS

| Rapport | Fichier | Lignes | Statut |
|---------|---------|--------|--------|
| R-01 | RAPPORT-01-UNIFIED-INVOICE-SERVICE.md | ✅ | Existe |
| R-02 | RAPPORT-02-PDF-GENERATOR-SERVICE.md | ✅ | Existe |
| R-03 | RAPPORT-03-BANK-RECONCILIATION-SERVICE.md | ✅ | Existe |
| R-04 | RAPPORT-04-OCR-TO-ACCOUNTING-SERVICE.md | ✅ | Existe |
| R-05 | RAPPORT-05-FINANCE-DASHBOARD-SERVICE.md | ✅ | Existe |
| R-06 | RAPPORT-06-FINANCE-API-ENDPOINTS.md | ✅ | Existe |
| R-07 | RAPPORT-07-FINANCE-FRONTEND-COMPONENTS.md | ✅ | Existe |
| R-08 | RAPPORT-08-FINANCE-INTEGRATION-ORCHESTRATOR.md | ✅ | Existe |
| R-09 | RAPPORT-09-CGV-SIGNATURE-ELECTRONIQUE.md | ✅ | Existe |
| R-10 | RAPPORT-10-RECOUVREMENT-AUTOMATISE.md | ✅ | Existe |
| R-11 | RAPPORT-11-LEGAL-COLLECTION.md | ⏳ | À créer |
| R-12 | RAPPORT-12-CRM-SETTINGS.md | ⏳ | À créer |

---

## ⚡ CE QUI RESTE À FAIRE

### F-11 : Frontend Legal & Collection (3,687 lignes)
Fichier : `EXECUTION-F11-LEGAL-COLLECTION.md`

**22 fichiers React à créer :**
- Services API : legalApi.js, collectionApi.js
- Hooks : useLegalData.js, useCollectionData.js
- Composants Legal : LegalDashboard, CGVManager, CGVEditor, SignatureRequests, AcceptanceHistory
- Composants Collection : CollectionDashboard, DebtorsList, WorkflowTimeline, LPCases, InterestCalculator, AgingChart

### F-12 : Frontend CRM & Settings (3,489 lignes)
Fichier : `EXECUTION-F12-CRM-SETTINGS.md`

**18 fichiers React à créer :**
- CRM : crmApi.js, useCRMData.js, CRMDashboard, ContactsList, ContactForm, CompaniesList, CompanyForm, QuickStats
- Settings : settingsApi.js, useSettingsData.js, SettingsDashboard, CompanySettings, InvoiceSettings, TaxSettings, ProductsList, ProductForm

---

## 🚦 ORDRE D'EXÉCUTION RECOMMANDÉ

Si F-01 à F-10 sont déjà faits (rapports existent), exécuter :

```
1. F-11 - Legal & Collection Frontend
   → Lire EXECUTION-F11-LEGAL-COLLECTION.md
   → Créer les 22 fichiers
   → Générer RAPPORT-11-LEGAL-COLLECTION.md

2. F-12 - CRM & Settings Frontend
   → Lire EXECUTION-F12-CRM-SETTINGS.md
   → Créer les 18 fichiers
   → Générer RAPPORT-12-CRM-SETTINGS.md

3. RAPPORT FINAL
   → Créer RAPPORT-FINAL-PLATFORM.md
```

---

## 📊 RÉCAPITULATIF TOTAL

| Catégorie | Prompts | Fichiers à créer | Lignes estimées |
|-----------|---------|------------------|-----------------|
| Finance Backend | F-01 à F-06 | 8 fichiers | ~3,000 |
| Finance Frontend | F-07 | 8 fichiers | ~1,500 |
| Finance Orchestrateur | F-08 | 2 fichiers | ~500 |
| Legal Backend | F-09-10 | 6 fichiers | ~2,500 |
| Legal Frontend | F-11 | 22 fichiers | ~3,000 |
| CRM & Settings | F-12 | 18 fichiers | ~2,500 |
| **TOTAL** | **12 prompts** | **~64 fichiers** | **~13,000 lignes** |

---

## ✅ CHECKLIST FINALE APRÈS F-12

```
src/backend/
├── services/
│   ├── finance/           # F-01 à F-08 ✅
│   │   ├── unified-invoice.service.js
│   │   ├── pdf-generator.service.js
│   │   ├── bank-reconciliation.service.js
│   │   ├── ocr-to-accounting.service.js
│   │   ├── finance-dashboard.service.js
│   │   ├── finance-orchestrator.service.js
│   │   └── index.js
│   └── legal/             # F-09 à F-10 ✅
│       ├── cgv.service.js
│       ├── signature.service.js
│       ├── debt-collection.service.js
│       ├── lp-tracking.service.js
│       └── index.js
└── api/
    ├── finance/           # F-06 ✅
    │   └── finance.routes.js
    └── legal/             # F-09-10 ✅
        └── legal.routes.js

src/frontend/src/portals/superadmin/
├── finance/               # F-07 ✅
│   ├── FinanceDashboard.jsx
│   ├── components/
│   ├── hooks/
│   └── services/
├── legal/                 # F-11 ⏳
│   ├── LegalDashboard.jsx
│   ├── components/
│   ├── hooks/
│   └── services/
├── collection/            # F-11 ⏳
│   ├── CollectionDashboard.jsx
│   ├── components/
│   ├── hooks/
│   └── services/
├── crm/                   # F-12 ⏳
│   ├── CRMDashboard.jsx
│   ├── components/
│   ├── hooks/
│   └── services/
└── settings/              # F-12 ⏳
    ├── SettingsDashboard.jsx
    ├── components/
    ├── hooks/
    └── services/
```

---

## 🎯 CONCLUSION

**12 prompts au total** (F-01 à F-12) :
- ✅ F-01 à F-10 : Déjà exécutés (rapports existants)
- ⏳ F-11 : Legal & Collection Frontend - À EXÉCUTER
- ⏳ F-12 : CRM & Settings Frontend - À EXÉCUTER

**Aucun prompt après F-12** - Le plan est COMPLET !

---

## 🚀 COMMENCER

Pour continuer depuis l'état actuel :

```bash
# Vérifier les rapports existants
ls -la docs/prompts/RAPPORT-*.md

# Exécuter F-11
cat docs/prompts/EXECUTION-F11-LEGAL-COLLECTION.md

# Puis F-12
cat docs/prompts/EXECUTION-F12-CRM-SETTINGS.md
```

**BONNE EXÉCUTION ! 🎯**
