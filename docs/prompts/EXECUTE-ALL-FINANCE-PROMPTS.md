# 🚀 EXÉCUTION SÉQUENTIELLE DES 8 PROMPTS FINANCE

## Instructions pour Claude Code

Tu dois exécuter les 8 prompts Finance **dans l'ordre strict** (1 → 8). Après chaque prompt exécuté, tu dois :
1. Créer un rapport détaillé dans ce dossier
2. Vérifier que tout fonctionne avant de passer au suivant
3. Ne JAMAIS sauter d'étape

---

## 📋 LISTE DES PROMPTS À EXÉCUTER

| Ordre | Fichier | Fichier à créer |
|-------|---------|-----------------|
| 1 | `PROMPT-01-UNIFIED-INVOICE-SERVICE.md` | `src/backend/services/finance/unified-invoice.service.js` |
| 2 | `PROMPT-02-PDF-GENERATOR-SERVICE.md` | `src/backend/services/finance/pdf-generator.service.js` |
| 3 | `PROMPT-03-BANK-RECONCILIATION-SERVICE.md` | `src/backend/services/finance/bank-reconciliation.service.js` |
| 4 | `PROMPT-04-OCR-TO-ACCOUNTING-SERVICE.md` | `src/backend/services/finance/ocr-to-accounting.service.js` |
| 5 | `PROMPT-05-FINANCE-DASHBOARD-SERVICE.md` | `src/backend/services/finance/finance-dashboard.service.js` |
| 6 | `PROMPT-06-FINANCE-API-ENDPOINTS.md` | `src/backend/api/finance/finance.routes.js` |
| 7 | `PROMPT-07-FINANCE-FRONTEND-COMPONENTS.md` | `src/frontend/src/portals/superadmin/finance/*` |
| 8 | `PROMPT-08-FINANCE-INTEGRATION-ORCHESTRATOR.md` | `src/backend/services/finance/finance-orchestrator.service.js` |

---

## 🔧 PROCESSUS D'EXÉCUTION

### Pour CHAQUE prompt (1 à 8), tu dois :

#### ÉTAPE A - Lecture
```bash
# Lire le prompt complet
cat /Users/jean-mariedelaunay/directus-unified-platform/docs/prompts/PROMPT-XX-*.md
```

#### ÉTAPE B - Création des dossiers
```bash
# S'assurer que les dossiers existent
mkdir -p /Users/jean-mariedelaunay/directus-unified-platform/src/backend/services/finance
mkdir -p /Users/jean-mariedelaunay/directus-unified-platform/src/backend/api/finance
mkdir -p /Users/jean-mariedelaunay/directus-unified-platform/src/frontend/src/portals/superadmin/finance/components
mkdir -p /Users/jean-mariedelaunay/directus-unified-platform/src/frontend/src/portals/superadmin/finance/hooks
mkdir -p /Users/jean-mariedelaunay/directus-unified-platform/src/frontend/src/portals/superadmin/finance/services
```

#### ÉTAPE C - Implémentation
- Créer le(s) fichier(s) selon les instructions du prompt
- Copier le code EXACTEMENT comme indiqué
- NE PAS modifier le code
- NE PAS prendre de libertés

#### ÉTAPE D - Vérification
```bash
# Vérifier que le fichier existe et n'est pas vide
ls -la <chemin_du_fichier_créé>
head -50 <chemin_du_fichier_créé>
```

#### ÉTAPE E - Rapport
Créer un rapport dans : `/Users/jean-mariedelaunay/directus-unified-platform/docs/prompts/RAPPORT-XX-*.md`

---

## 📝 FORMAT DU RAPPORT (obligatoire après chaque prompt)

```markdown
# RAPPORT D'EXÉCUTION - PROMPT XX/8

## Informations générales
- **Date d'exécution** : [DATE_HEURE]
- **Prompt exécuté** : PROMPT-XX-NOM.md
- **Statut** : ✅ Succès | ⚠️ Partiel | ❌ Échec

## Fichiers créés
| Fichier | Chemin complet | Lignes | Statut |
|---------|----------------|--------|--------|
| nom.js | /chemin/complet | XXX | ✅ |

## Dépendances identifiées
- [ ] Dépendance 1 (installée / à installer)
- [ ] Dépendance 2

## Tests effectués
- [ ] Fichier créé avec succès
- [ ] Syntaxe JavaScript valide
- [ ] Imports corrects

## Problèmes rencontrés
- Aucun | Description du problème

## Notes pour le prompt suivant
- Points d'attention pour la suite

## Code créé (extrait des 30 premières lignes)
```javascript
// Extrait du code créé
```

---
Rapport généré automatiquement par Claude Code
```

---

## 🚦 ORDRE D'EXÉCUTION STRICT

### PROMPT 1/8 - Service Facturation Unifié
```
1. Lire PROMPT-01-UNIFIED-INVOICE-SERVICE.md
2. Créer src/backend/services/finance/unified-invoice.service.js
3. Vérifier la syntaxe
4. Créer RAPPORT-01-UNIFIED-INVOICE-SERVICE.md
5. ATTENDRE confirmation avant prompt 2
```

### PROMPT 2/8 - Générateur PDF
```
1. Lire PROMPT-02-PDF-GENERATOR-SERVICE.md
2. Créer src/backend/services/finance/pdf-generator.service.js
3. Vérifier la syntaxe
4. Créer RAPPORT-02-PDF-GENERATOR-SERVICE.md
5. ATTENDRE confirmation avant prompt 3
```

### PROMPT 3/8 - Rapprochement Bancaire
```
1. Lire PROMPT-03-BANK-RECONCILIATION-SERVICE.md
2. Créer src/backend/services/finance/bank-reconciliation.service.js
3. Vérifier la syntaxe
4. Créer RAPPORT-03-BANK-RECONCILIATION-SERVICE.md
5. ATTENDRE confirmation avant prompt 4
```

### PROMPT 4/8 - OCR vers Comptabilité
```
1. Lire PROMPT-04-OCR-TO-ACCOUNTING-SERVICE.md
2. Créer src/backend/services/finance/ocr-to-accounting.service.js
3. Vérifier la syntaxe
4. Créer RAPPORT-04-OCR-TO-ACCOUNTING-SERVICE.md
5. ATTENDRE confirmation avant prompt 5
```

### PROMPT 5/8 - Service Dashboard Finance
```
1. Lire PROMPT-05-FINANCE-DASHBOARD-SERVICE.md
2. Créer src/backend/services/finance/finance-dashboard.service.js
3. Vérifier la syntaxe
4. Créer RAPPORT-05-FINANCE-DASHBOARD-SERVICE.md
5. ATTENDRE confirmation avant prompt 6
```

### PROMPT 6/8 - Endpoints API
```
1. Lire PROMPT-06-FINANCE-API-ENDPOINTS.md
2. Créer src/backend/api/finance/finance.routes.js
3. Créer src/backend/api/finance/index.js
4. Vérifier la syntaxe
5. Créer RAPPORT-06-FINANCE-API-ENDPOINTS.md
6. ATTENDRE confirmation avant prompt 7
```

### PROMPT 7/8 - Composants Frontend
```
1. Lire PROMPT-07-FINANCE-FRONTEND-COMPONENTS.md
2. Créer TOUS les fichiers listés :
   - src/frontend/src/portals/superadmin/finance/services/financeApi.js
   - src/frontend/src/portals/superadmin/finance/hooks/useFinanceData.js
   - src/frontend/src/portals/superadmin/finance/components/KPICards.jsx
   - src/frontend/src/portals/superadmin/finance/components/AlertsPanel.jsx
   - src/frontend/src/portals/superadmin/finance/components/CashFlowChart.jsx
   - src/frontend/src/portals/superadmin/finance/components/RecentTransactions.jsx
   - src/frontend/src/portals/superadmin/finance/FinanceDashboard.jsx
   - src/frontend/src/portals/superadmin/finance/index.js
3. Vérifier tous les fichiers
4. Créer RAPPORT-07-FINANCE-FRONTEND-COMPONENTS.md
5. ATTENDRE confirmation avant prompt 8
```

### PROMPT 8/8 - Orchestrateur
```
1. Lire PROMPT-08-FINANCE-INTEGRATION-ORCHESTRATOR.md
2. Créer src/backend/services/finance/finance-orchestrator.service.js
3. Créer/Mettre à jour src/backend/services/finance/index.js
4. Vérifier la syntaxe
5. Créer RAPPORT-08-FINANCE-INTEGRATION-ORCHESTRATOR.md
6. Créer RAPPORT-FINAL-FINANCE.md
```

---

## 📦 DÉPENDANCES À INSTALLER

Avant de commencer, s'assurer que ces dépendances sont dans package.json :

### Backend (src/backend/package.json)
```json
{
  "dependencies": {
    "@directus/sdk": "^17.0.0",
    "express": "^4.18.2",
    "multer": "^1.4.5-lts.1",
    "bullmq": "^5.0.0",
    "ioredis": "^5.3.0",
    "pdfkit": "^0.14.0",
    "openai": "^4.20.0",
    "uuid": "^9.0.0"
  }
}
```

### Frontend (src/frontend/package.json)
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "recharts": "^2.10.0",
    "react-router-dom": "^6.20.0"
  }
}
```

---

## ✅ CHECKLIST FINALE

Après les 8 prompts, vérifier :

```
src/backend/
├── api/
│   └── finance/
│       ├── finance.routes.js      ✅
│       └── index.js               ✅
└── services/
    └── finance/
        ├── unified-invoice.service.js        ✅
        ├── pdf-generator.service.js          ✅
        ├── bank-reconciliation.service.js    ✅
        ├── ocr-to-accounting.service.js      ✅
        ├── finance-dashboard.service.js      ✅
        ├── finance-orchestrator.service.js   ✅
        └── index.js                          ✅

src/frontend/src/portals/superadmin/finance/
├── FinanceDashboard.jsx           ✅
├── components/
│   ├── KPICards.jsx               ✅
│   ├── AlertsPanel.jsx            ✅
│   ├── CashFlowChart.jsx          ✅
│   └── RecentTransactions.jsx     ✅
├── hooks/
│   └── useFinanceData.js          ✅
├── services/
│   └── financeApi.js              ✅
└── index.js                       ✅
```

---

## 🏁 RAPPORT FINAL

Après le prompt 8, créer `RAPPORT-FINAL-FINANCE.md` avec :

```markdown
# RAPPORT FINAL - MODULE FINANCE COMPLET

## Résumé de l'exécution
- **Début** : [DATE_HEURE]
- **Fin** : [DATE_HEURE]
- **Durée totale** : XX minutes
- **Prompts exécutés** : 8/8
- **Fichiers créés** : XX fichiers
- **Lignes de code** : ~XXXX lignes

## Récapitulatif par prompt
| # | Prompt | Statut | Fichiers | Lignes |
|---|--------|--------|----------|--------|
| 1 | Unified Invoice | ✅ | 1 | XXX |
| 2 | PDF Generator | ✅ | 1 | XXX |
| 3 | Bank Reconciliation | ✅ | 1 | XXX |
| 4 | OCR to Accounting | ✅ | 1 | XXX |
| 5 | Finance Dashboard | ✅ | 1 | XXX |
| 6 | API Endpoints | ✅ | 2 | XXX |
| 7 | Frontend Components | ✅ | 8 | XXX |
| 8 | Orchestrator | ✅ | 2 | XXX |

## Architecture créée
[Arborescence complète des fichiers]

## Prochaines étapes recommandées
1. Installer les dépendances npm
2. Configurer les variables d'environnement
3. Démarrer Redis pour BullMQ
4. Tester les endpoints API
5. Intégrer le frontend dans le router principal

## Tests à effectuer
- [ ] `npm run lint` - Pas d'erreurs de syntaxe
- [ ] `npm run build` - Build sans erreurs
- [ ] API accessible sur /api/finance/*
- [ ] Dashboard React affiche les KPIs

---
Module Finance créé avec succès ✅
```

---

## ⚠️ RÈGLES IMPORTANTES

1. **NE JAMAIS** modifier le code des prompts
2. **NE JAMAIS** sauter un prompt
3. **TOUJOURS** créer le rapport après chaque prompt
4. **TOUJOURS** vérifier que le fichier existe avant de passer au suivant
5. **DEMANDER** confirmation entre chaque prompt si en mode interactif

---

## 🚀 COMMENCER L'EXÉCUTION

Pour démarrer, exécute :

```bash
# Vérifier que le dossier existe
ls -la /Users/jean-mariedelaunay/directus-unified-platform/docs/prompts/

# Créer les dossiers nécessaires
mkdir -p /Users/jean-mariedelaunay/directus-unified-platform/src/backend/services/finance
mkdir -p /Users/jean-mariedelaunay/directus-unified-platform/src/backend/api/finance
mkdir -p /Users/jean-mariedelaunay/directus-unified-platform/src/frontend/src/portals/superadmin/finance/components
mkdir -p /Users/jean-mariedelaunay/directus-unified-platform/src/frontend/src/portals/superadmin/finance/hooks
mkdir -p /Users/jean-mariedelaunay/directus-unified-platform/src/frontend/src/portals/superadmin/finance/services

# Lire le premier prompt
cat /Users/jean-mariedelaunay/directus-unified-platform/docs/prompts/PROMPT-01-UNIFIED-INVOICE-SERVICE.md
```

Puis suivre les instructions du prompt 1, créer le fichier, faire le rapport, et continuer.

**BONNE EXÉCUTION ! 🎯**
