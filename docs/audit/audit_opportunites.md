# AUDIT — Opportunités Non Exploitées

> **Date** : 18 février 2026
> **Objectif** : Identifier les fonctionnalités à haute valeur ajoutée que l'infrastructure actuelle permet d'implémenter rapidement

---

## 1. Opportunités à impact immédiat (< 1 semaine)

### 1.1 Activer BullMQ pour les tâches asynchrones

**Constat** : BullMQ et ioRedis sont installés (package.json) mais jamais utilisés.

**Valeur** :
- Queue de jobs pour les relances automatiques de devis
- Queue pour la synchronisation Revolut en arrière-plan
- Queue pour les imports CAMT.053 volumineux
- Retry automatique en cas d'échec d'intégration externe

**Effort** : 8-16h (configuration Redis + workers)

---

### 1.2 Activer Winston pour le logging structuré

**Constat** : Winston est installé mais 81 fichiers utilisent `console.log`.

**Valeur** :
- Logs structurés JSON pour ELK/Grafana
- Niveaux de log par environnement
- Rotation et archivage des logs
- Debugging facilité en production

**Effort** : 12-16h (remplacement + configuration)

---

### 1.3 Interface d'import bancaire (CAMT.053 / CSV)

**Constat** : Les endpoints `/api/finance/bank/import/camt053` et `/api/finance/bank/import/csv` sont implémentés mais n'ont pas d'interface utilisateur.

**Valeur** :
- Import de relevés bancaires en un clic
- Automatisation du rapprochement bancaire
- Gain de temps significatif pour la comptabilité

**Effort** : 16-24h (composant React upload + affichage résultats)

---

### 1.4 Interface de rapprochement bancaire

**Constat** : 11 endpoints de rapprochement sont implémentés dans le backend mais aucune UI.

**Valeur** :
- Matching automatique factures/transactions
- Suggestions de rapprochement avec scoring
- Vue d'ensemble des transactions non réconciliées
- Historique et audit trail

**Effort** : 24-40h (composant React complexe avec drag & drop)

---

### 1.5 Interface OCR de factures fournisseurs

**Constat** : L'endpoint `/api/ocr/scan-invoice` fonctionne avec GPT-4 Vision mais n'a pas d'UI.

**Valeur** :
- Numérisation de factures papier
- Pré-remplissage automatique des écritures comptables
- Réduction drastique du temps de saisie

**Effort** : 16-24h (composant upload + prévisualisation + validation)

---

## 2. Opportunités à moyen terme (1-3 semaines)

### 2.1 Dashboard financier temps réel avec WebSockets

**Constat** : Directus 11.10 supporte les WebSockets natifs. Le frontend utilise TanStack Query avec polling.

**Valeur** :
- KPIs mis à jour en temps réel
- Alertes instantanées (paiements reçus, seuils dépassés)
- Réduction de la charge serveur (fin du polling)

**Effort** : 24-40h (subscription Directus WS + React hooks)

---

### 2.2 Automatisation des rappels de paiement

**Constat** : Le scheduler Express est structuré mais les actions sont des TODO. Mautic est opérationnel.

**Valeur** :
- Envoi automatique de rappels à J+7, J+15, J+30
- Escalade automatique vers le recouvrement
- Templates personnalisés par entreprise
- Réduction du DSO (Days Sales Outstanding)

**Effort** : 16-24h (compléter les 7 TODO du scheduler + templates Mautic)

---

### 2.3 Portail prestataire V1 (MVP)

**Constat** : Le code du portail prestataire est un mockup mais la structure backend (projets, livrables, time_tracking) existe.

**Valeur** :
- Les prestataires peuvent saisir leur temps
- Visibilité sur les missions et deadlines
- Facturation simplifiée
- Réduction de l'administratif

**Effort** : 40-60h (auth + 5 écrans + hooks Directus)

---

### 2.4 Export comptable automatisé

**Constat** : Le moteur comptable suisse est complet avec plan comptable Käfer, TVA 2025, et QR-Factures. Les endpoints d'export existent.

**Valeur** :
- Export comptable trimestriel en un clic
- Formulaire 200 AFC pré-rempli
- Compatible avec les logiciels de fiduciaire
- Conformité légale automatique

**Effort** : 16-24h (UI d'export + formats de fichier)

---

### 2.5 Connexion des 25 composants mock au Directus

**Constat** : 25 composants utilisent des données faker/hardcodées. Les collections Directus correspondantes existent souvent déjà.

**Valeur par lot** :

| Lot | Composants | Effort | Valeur |
|-----|-----------|--------|--------|
| Support (3) | TicketsManager, Notifications, Dashboard | 16-24h | Gestion tickets fonctionnelle |
| Finance (2) | BudgetsManager, ExpensesTracker | 16-24h | Budget tracking réel |
| CRM (2) | PipelineView, CustomerSuccess | 16-24h | Pipeline commercial visible |
| Legal (2) | ContractsManager, ComplianceManager | 16-24h | Gestion contrats |
| HR (3) | Talents, Performance, Recruitment | 24-40h | Gestion RH basique |
| Settings (4) | Users, Permissions, Tax, Integrations | 24-40h | Administration complète |

---

## 3. Opportunités stratégiques (1-3 mois)

### 3.1 API publique avec documentation Swagger

**Constat** : 200+ endpoints existent mais aucune documentation API (pas de Swagger/OpenAPI).

**Valeur** :
- Documentation automatique des 200+ endpoints
- Client SDK auto-généré
- Possibilité d'ouvrir des APIs à des partenaires
- Facilite l'onboarding de nouveaux développeurs

**Effort** : 40-60h (annotations Swagger + UI)

---

### 3.2 Multi-devises avec taux Revolut temps réel

**Constat** : L'intégration Revolut inclut déjà un endpoint de taux de change. Le moteur comptable gère CHF et EUR.

**Valeur** :
- Facturation en EUR, USD, GBP en plus de CHF
- Taux de change automatiques
- Écritures de change automatiques
- Conformité avec l'obligation de comptabilisation en CHF

**Effort** : 40-60h (extension moteur comptable + UI)

---

### 3.3 Tableau de bord prédictif (ML/AI)

**Constat** : Les données historiques (12+ mois de transactions, factures, paiements) sont disponibles. OpenAI est déjà intégré.

**Valeur** :
- Prédiction de trésorerie (au-delà des 90 jours actuels)
- Scoring automatique des leads
- Détection d'anomalies dans les transactions
- Prédiction du risque de défaut client

**Effort** : 60-100h (modèles, API, UI)

---

### 3.4 Automatisation intercompany

**Constat** : Les 5 entreprises du groupe effectuent probablement des transactions entre elles. L'architecture multi-entreprise est en place.

**Valeur** :
- Factures intercompany automatiques
- Élimination des transactions intragroupe
- Consolidation comptable simplifiée
- Tableau de bord holding HMF Corporation

**Effort** : 40-60h (logique métier + règles d'élimination)

---

### 3.5 Application mobile (React Native)

**Constat** : L'architecture API-first permet une application mobile. Les composants React sont modulaires.

**Valeur** :
- Approbation de factures en mobilité
- Notification push pour alertes financières
- Saisie temps prestataires depuis le terrain
- Dashboard KPI mobile pour la direction

**Effort** : 120-200h (nouveau projet, mais API existantes)

---

## 4. Quick wins techniques

| Quick Win | Effort | Impact |
|-----------|--------|--------|
| Ajouter `@faker-js/faker` en devDependencies (pas en dependencies) | 5min | Évite le faker en production |
| Corriger `USE_MOCK_DATA = true` par défaut | 5min | Évite les données mock en production |
| Ajouter rate limiting global (express-rate-limit installé) | 2h | Sécurité DDoS |
| Compléter le proxy Vite pour toutes les routes API | 1h | Développement frontend plus fluide |
| Ajouter lazy loading React.lazy() par module | 4h | Performance initiale du bundle |
| Ajouter les 5 relations manquantes dans Directus | 2h | Intégrité des données |
| Configurer CORS strict en production | 1h | Sécurité |
| Activer la compression gzip (installée) | 30min | Performance réseau |

---

## 5. Matrice priorité/impact

```
Impact élevé │ Import bancaire UI    │ Rappels auto     │ API publique
             │ Rapprochement UI      │ WebSockets RT    │ Multi-devises
             │ OCR UI                │ Portail presta   │ Prédictif AI
             │ BullMQ               │                   │
             ├───────────────────────┼───────────────────┤
Impact moyen │ Winston logging       │ Composants mock   │ App mobile
             │ Quick wins tech       │ Export comptable  │ Intercompany
             │                       │                   │
             ├───────────────────────┼───────────────────┤
             │ Effort faible         │ Effort moyen      │ Effort élevé
             │ (< 1 semaine)         │ (1-3 semaines)    │ (1-3 mois)
```

---

## 6. Recommandation de roadmap

### Sprint 1 (Semaine 1-2) — Quick wins + sécurité
1. Quick wins techniques (1 jour)
2. BullMQ + Redis (2 jours)
3. Winston logging (1 jour)
4. Auth sur routes non protégées (2 jours)
5. Rotation des clés API (1 jour)

### Sprint 2 (Semaine 3-4) — UIs manquantes
1. Interface import bancaire (3 jours)
2. Interface rapprochement bancaire (5 jours)
3. Interface OCR factures (3 jours)

### Sprint 3 (Semaine 5-6) — Connexion mock→réel
1. Support module (3 jours)
2. Finance Budgets + Expenses (3 jours)
3. CRM Pipeline + CustomerSuccess (3 jours)

### Sprint 4 (Semaine 7-8) — Automatisation
1. Scheduler rappels paiement (3 jours)
2. WebSockets temps réel (5 jours)
3. Export comptable UI (2 jours)

### Sprint 5+ — Stratégique
1. Portail prestataire MVP
2. API publique Swagger
3. Multi-devises
4. Tests automatisés
