# 🚀 EXÉCUTION SÉQUENTIELLE DES 12 PROMPTS - CLAUDE CODE OPUS 4.5

## ⚠️ INSTRUCTIONS CRITIQUES

Tu dois exécuter les **12 prompts F-01 à F-12** dans l'ordre strict.
Après CHAQUE prompt, tu DOIS créer un rapport.
À la fin des 12 prompts, tu DOIS créer un rapport global.

**RÈGLES ABSOLUES :**
1. Exécuter dans l'ordre : F-01 → F-02 → F-03 → ... → F-12
2. NE JAMAIS sauter un prompt
3. Créer un rapport après CHAQUE prompt
4. Tout le code doit être FONCTIONNEL (pas de mocks, pas de TODO)
5. Respecter la conformité suisse (TVA 8.1%, QR-factures, LP)

---

## 📁 CHEMINS IMPORTANTS

```
RACINE PROJET : /Users/jean-mariedelaunay/directus-unified-platform
PROMPTS       : /Users/jean-mariedelaunay/directus-unified-platform/docs/prompts/
RAPPORTS      : /Users/jean-mariedelaunay/directus-unified-platform/docs/prompts/rapports/
BACKEND       : /Users/jean-mariedelaunay/directus-unified-platform/src/backend/
FRONTEND      : /Users/jean-mariedelaunay/directus-unified-platform/src/frontend/
```

---

## 📋 LISTE DES 12 PROMPTS À EXÉCUTER

| # | Fichier | Module | Fichiers à créer |
|---|---------|--------|------------------|
| F-01 | `F-01-UNIFIED-INVOICE-SERVICE.md` | Finance Backend | `src/backend/services/finance/unified-invoice.service.js` |
| F-02 | `F-02-PDF-GENERATOR-SERVICE.md` | Finance Backend | `src/backend/services/finance/pdf-generator.service.js` |
| F-03 | `F-03-BANK-RECONCILIATION-SERVICE.md` | Finance Backend | `src/backend/services/finance/bank-reconciliation.service.js` |
| F-04 | `F-04-OCR-TO-ACCOUNTING-SERVICE.md` | Finance Backend | `src/backend/services/finance/ocr-to-accounting.service.js` |
| F-05 | `F-05-FINANCE-DASHBOARD-SERVICE.md` | Finance Backend | `src/backend/services/finance/finance-dashboard.service.js` |
| F-06 | `F-06-FINANCE-API-ENDPOINTS.md` | Finance API | `src/backend/api/finance/*.js` |
| F-07 | `F-07-FINANCE-FRONTEND-COMPONENTS.md` | Finance Frontend | `src/frontend/src/portals/superadmin/finance/*.jsx` |
| F-08 | `F-08-FINANCE-INTEGRATION-ORCHESTRATOR.md` | Finance Backend | `src/backend/services/finance/finance-orchestrator.service.js` |
| F-09 | `F-09-CGV-SIGNATURE-ELECTRONIQUE.md` | Legal Backend | `src/backend/services/legal/*.js` |
| F-10 | `F-10-RECOUVREMENT-AUTOMATISE.md` | Legal Backend | `src/backend/services/legal/debt-collection.service.js` |
| F-11 | `F-11-LEGAL-COLLECTION.md` | Legal Frontend | `src/frontend/src/portals/superadmin/legal/*.jsx` + `collection/*.jsx` |
| F-12 | `F-12-CRM-SETTINGS.md` | CRM & Settings | `src/frontend/src/portals/superadmin/crm/*.jsx` + `settings/*.jsx` |

---

## 🔧 PROCESSUS D'EXÉCUTION

### Pour CHAQUE prompt (F-01 à F-12) :

#### ÉTAPE 1 - Créer le dossier rapports (une seule fois)
```bash
mkdir -p /Users/jean-mariedelaunay/directus-unified-platform/docs/prompts/rapports
```

#### ÉTAPE 2 - Lire le prompt
```bash
cat /Users/jean-mariedelaunay/directus-unified-platform/docs/prompts/F-XX-NOM.md
```

#### ÉTAPE 3 - Créer les dossiers nécessaires
```bash
mkdir -p /Users/jean-mariedelaunay/directus-unified-platform/src/backend/services/finance
mkdir -p /Users/jean-mariedelaunay/directus-unified-platform/src/backend/services/legal
mkdir -p /Users/jean-mariedelaunay/directus-unified-platform/src/backend/api/finance
mkdir -p /Users/jean-mariedelaunay/directus-unified-platform/src/backend/api/legal
mkdir -p /Users/jean-mariedelaunay/directus-unified-platform/src/frontend/src/portals/superadmin/finance/components
mkdir -p /Users/jean-mariedelaunay/directus-unified-platform/src/frontend/src/portals/superadmin/finance/hooks
mkdir -p /Users/jean-mariedelaunay/directus-unified-platform/src/frontend/src/portals/superadmin/finance/services
mkdir -p /Users/jean-mariedelaunay/directus-unified-platform/src/frontend/src/portals/superadmin/legal/components
mkdir -p /Users/jean-mariedelaunay/directus-unified-platform/src/frontend/src/portals/superadmin/legal/hooks
mkdir -p /Users/jean-mariedelaunay/directus-unified-platform/src/frontend/src/portals/superadmin/legal/services
mkdir -p /Users/jean-mariedelaunay/directus-unified-platform/src/frontend/src/portals/superadmin/collection/components
mkdir -p /Users/jean-mariedelaunay/directus-unified-platform/src/frontend/src/portals/superadmin/collection/hooks
mkdir -p /Users/jean-mariedelaunay/directus-unified-platform/src/frontend/src/portals/superadmin/collection/services
mkdir -p /Users/jean-mariedelaunay/directus-unified-platform/src/frontend/src/portals/superadmin/crm/components
mkdir -p /Users/jean-mariedelaunay/directus-unified-platform/src/frontend/src/portals/superadmin/crm/hooks
mkdir -p /Users/jean-mariedelaunay/directus-unified-platform/src/frontend/src/portals/superadmin/crm/services
mkdir -p /Users/jean-mariedelaunay/directus-unified-platform/src/frontend/src/portals/superadmin/settings/components
mkdir -p /Users/jean-mariedelaunay/directus-unified-platform/src/frontend/src/portals/superadmin/settings/hooks
mkdir -p /Users/jean-mariedelaunay/directus-unified-platform/src/frontend/src/portals/superadmin/settings/services
```

#### ÉTAPE 4 - Implémenter le code
- Créer les fichiers demandés dans le prompt
- Le code doit être COMPLET et FONCTIONNEL
- Utiliser les bonnes pratiques React/Node.js
- Respecter la conformité suisse

#### ÉTAPE 5 - Vérifier les fichiers créés
```bash
ls -la [chemin_des_fichiers_créés]
wc -l [chemin_des_fichiers_créés]
```

#### ÉTAPE 6 - Créer le rapport
Créer un fichier : `/docs/prompts/rapports/RAPPORT-F-XX.md`

---

## 📝 FORMAT DES RAPPORTS (obligatoire)

```markdown
# RAPPORT D'EXÉCUTION - F-XX

## Informations
- **Date** : [DATE_HEURE]
- **Prompt** : F-XX-NOM.md
- **Statut** : ✅ Succès | ⚠️ Partiel | ❌ Échec

## Fichiers créés
| Fichier | Chemin | Lignes |
|---------|--------|--------|
| nom.js | /chemin/complet | XXX |

## Dépendances
- Liste des packages npm nécessaires

## Tests effectués
- [ ] Fichiers créés
- [ ] Syntaxe valide
- [ ] Imports corrects

## Problèmes rencontrés
- Aucun / Description

## Prêt pour le prompt suivant : OUI/NON
```

---

## 🏁 RAPPORT FINAL (après F-12)

Après le prompt F-12, créer : `/docs/prompts/rapports/RAPPORT-FINAL-COMPLET.md`

```markdown
# 📊 RAPPORT FINAL - 12 PROMPTS EXÉCUTÉS

## Résumé
- **Début** : [DATE_HEURE]
- **Fin** : [DATE_HEURE]  
- **Durée totale** : XX heures
- **Prompts exécutés** : 12/12
- **Fichiers créés** : XX fichiers
- **Lignes de code** : ~XXXXX lignes

## Récapitulatif par prompt
| # | Prompt | Statut | Fichiers | Lignes |
|---|--------|--------|----------|--------|
| F-01 | Unified Invoice | ✅ | X | XXX |
| F-02 | PDF Generator | ✅ | X | XXX |
| ... | ... | ... | ... | ... |
| F-12 | CRM Settings | ✅ | X | XXX |

## Architecture finale
[Arborescence complète des fichiers créés]

## Dépendances npm à installer
### Backend
```bash
npm install [packages]
```
### Frontend
```bash
npm install [packages]
```

## Variables d'environnement requises
```env
DIRECTUS_URL=http://localhost:8055
DIRECTUS_TOKEN=xxx
...
```

## Tests à effectuer
- [ ] npm run lint (pas d'erreurs)
- [ ] npm run build (build sans erreurs)
- [ ] API accessible sur /api/finance/*
- [ ] API accessible sur /api/legal/*
- [ ] Dashboard React affiche les données
- [ ] QR-factures générées correctement
- [ ] Recouvrement LP fonctionnel

## Prochaines étapes recommandées
1. Installer les dépendances
2. Configurer les variables d'environnement
3. Démarrer les services
4. Tester l'intégration complète

---
✅ Module Finance + Legal + CRM + Settings COMPLET
```

---

## 🚀 COMMENCER MAINTENANT

```bash
# 1. Créer le dossier rapports
mkdir -p /Users/jean-mariedelaunay/directus-unified-platform/docs/prompts/rapports

# 2. Lire et exécuter F-01
cat /Users/jean-mariedelaunay/directus-unified-platform/docs/prompts/F-01-UNIFIED-INVOICE-SERVICE.md

# Puis continuer avec F-02, F-03, ..., F-12
```

---

## ⚠️ RAPPELS CRITIQUES

1. **Conformité Suisse** : TVA 8.1% (normal), 2.6% (réduit), 3.8% (hébergement)
2. **QR-Factures** : ISO 20022 v2.3 obligatoire
3. **Recouvrement LP** : Loi sur la Poursuite et Faillite
4. **Intérêts retard** : 5% (art. 104 CO)
5. **IDE** : Format CHE-XXX.XXX.XXX
6. **IBAN QR** : Obligatoire pour QR-factures

---

**BONNE EXÉCUTION ! 🎯**
