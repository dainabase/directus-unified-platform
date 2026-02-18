# AUDIT — Analyse des Écarts (Gap Analysis)

> **Date** : 18 février 2026
> **Méthode** : Comparaison entre les capacités observées dans le code et les fonctionnalités attendues du CDC

---

## 1. Ce qui est RÉELLEMENT FONCTIONNEL

Fonctionnalités que la plateforme peut exécuter aujourd'hui sans développement supplémentaire :

### 1.1 Authentification et accès
- ✅ Login JWT SuperAdmin avec protection brute force (5 tentatives, 15min lockout)
- ✅ Login JWT Client Portal avec activation et reset password
- ✅ Refresh tokens et blacklist (in-memory)
- ✅ Middleware d'authentification flexible (JWT + API Key)
- ✅ Filtrage multi-entreprise par owner_company

### 1.2 Finance (80+ endpoints)
- ✅ Dashboard consolidé (5 entreprises) et par entreprise
- ✅ KPIs : revenus, marge, runway, trésorerie
- ✅ Alertes intelligentes par sévérité
- ✅ Évolution mensuelle sur 12 mois
- ✅ Position de trésorerie avec détail comptes bancaires
- ✅ Prévision trésorerie 90 jours
- ✅ Factures clients CRUD complet avec QR-Facture suisse
- ✅ Factures fournisseurs avec workflow approbation
- ✅ Paiements partiels et complets
- ✅ Génération PDF (factures, rappels, relevés, avoir)
- ✅ Rapprochement bancaire avec suggestions
- ✅ Import CAMT.053 et CSV bancaire
- ✅ OCR factures via GPT-4 Vision
- ✅ Comparaison année/année
- ✅ Balance TVA trimestrielle
- ✅ Statistiques clients et aging receivables/payables

### 1.3 Workflow commercial complet
- ✅ Lead → Opportunité → Devis → CGV → Signature → Acompte → Projet
- ✅ Machine à états pour les devis (draft → sent → viewed → signed)
- ✅ Calcul automatique des acomptes (% configurable)
- ✅ Versioning et acceptation des CGV/CGL
- ✅ Signatures électroniques DocuSeal (SES, AES, QES)
- ✅ Pipeline commercial avec forecast

### 1.4 Recouvrement de créances
- ✅ Initialisation processus de recouvrement sur facture
- ✅ Escalade automatique par niveaux
- ✅ Calcul d'intérêts moratoires (art. 104 CO, 5%)
- ✅ Historique d'actions et timeline
- ✅ Suspension et reprise du processus
- ✅ Passage en perte et profits
- ✅ Intégration LP (Lexia Partners) pour poursuites
- ✅ Dashboard recouvrement et aging analysis

### 1.5 Comptabilité suisse
- ✅ Plan comptable PME (norme Käfer, 150+ comptes)
- ✅ TVA 2025 (8.1%, 2.6%, 3.8%, 0%)
- ✅ Codes AFC pour formulaire 200
- ✅ QR-Factures ISO 20022 v2.3
- ✅ Écritures comptables automatiques depuis factures et OCR
- ✅ Formulaire 200 AFC (données et export XML)
- ✅ Version navigateur du moteur comptable

### 1.6 Portail client
- ✅ Authentification complète (login, activation, reset)
- ✅ Tableau de bord client
- ✅ Consultation et acceptation/rejet de devis
- ✅ Liste et suivi des factures
- ✅ Historique des paiements
- ✅ Timeline projet
- ✅ Signature électronique intégrée (iframe DocuSeal)

### 1.7 CRM et Leads
- ✅ CRUD entreprises et contacts
- ✅ Gestion leads avec Kanban et liste
- ✅ Scoring et filtres leads
- ✅ Conversion lead → devis
- ✅ Statistiques CRM et leads

### 1.8 Intégrations fonctionnelles
- ✅ Invoice Ninja : CRUD complet + sync bidirectionnelle
- ✅ Mautic : 5 campagnes + 5 segments + orchestration
- ✅ DocuSeal : Signatures avec 3 niveaux + webhooks
- ✅ OpenAI : OCR factures fonctionnel
- ✅ Orchestration multi-outils

---

## 2. Ce qui est PARTIELLEMENT implémenté

### 2.1 Revolut Business
| Implémenté | Manquant | Gap estimé |
|-----------|----------|------------|
| Routes API (17 endpoints) | OAuth2 non configuré (clés privées) | 20% |
| Transaction history | Auto-sync vers Directus désactivé | 15% |
| HMAC webhook verification | Test avec données réelles | 10% |
| **Total** | | **~45% restant** |

### 2.2 ERPNext
| Implémenté | Manquant | Gap estimé |
|-----------|----------|------------|
| Endpoints lecture (KPIs, charts) | Sync bidirectionnelle GL entries | 40% |
| Migration script basique | Webhooks | 15% |
| | Import plan comptable | 10% |
| **Total** | | **~65% restant** |

### 2.3 Hooks commerciaux
| Implémenté | Manquant | Gap estimé |
|-----------|----------|------------|
| Structure et conditions | Notifications email via Mautic (7 TODO) | 25% |
| Payload préparé | Notifications Slack (3 TODO) | 10% |
| | Rapports automatiques (2 TODO) | 10% |
| | Scheduler cron effectif (5 TODO) | 15% |
| **Total** | | **~60% restant** |

### 2.4 Frontend SuperAdmin — Modules partiels
| Module | Composants connectés | Composants mock | Gap |
|--------|---------------------|----------------|-----|
| Finance | 5/7 | 2/7 | 30% |
| CRM | 6/8 | 2/8 | 25% |
| Legal | 7/9 | 2/9 | 22% |
| HR | 1/5 | 4/5 | 80% |
| Projects | 4/7 | 3/7 | 43% |
| Settings | 5/9 | 4/9 | 44% |

### 2.5 Sécurité
| Implémenté | Manquant | Gap estimé |
|-----------|----------|------------|
| JWT + bcrypt + brute force | Persistance Redis | 20% |
| Auth routes finance/commercial | Auth routes collection, legal, revolut, etc. | 30% |
| Middleware companyAccess | Rôles Directus par portail | 20% |
| **Total** | | **~70% restant** |

---

## 3. Ce qui est CONFIGURÉ mais NON CONNECTÉ

### 3.1 Collections Directus créées mais non utilisées par le frontend

| Collection | Structure | Données | Frontend | Backend API |
|------------|----------|---------|----------|-------------|
| `campaigns` | ✅ Créée | ❌ Vide | ❌ Mock (MarketingDashboard) | ❌ Pas de routes |
| `opportunities` | ✅ Créée | ⚠️ Peu | ❌ Mock (PipelineView) | ⚠️ Partiel |
| `contracts` | ✅ Créée | ❌ Vide | ❌ Mock (ContractsManager) | ❌ Pas de routes |
| `budgets` | ✅ Créée | ⚠️ Peu | ❌ Mock (BudgetsManager) | ❌ Pas de routes |
| `time_tracking` | ✅ Créée | ❌ Vide | ⚠️ Partiel (TimeTrackingView) | ❌ Pas de routes |
| `support_tickets` | ✅ Créée | ⚠️ Peu | ❌ Mock (SupportDashboard) | ❌ Pas de routes |
| `newsletters` | ✅ Créée | ❌ Vide | ❌ Non utilisée | ❌ Non utilisée |
| `emails` | ✅ Créée | ❌ Vide | ❌ Non utilisée | ❌ Non utilisée |

### 3.2 Endpoints backend créés mais non appelés par le frontend

| Route | Backend | Frontend | Notes |
|-------|---------|----------|-------|
| `/api/finance/bank/import/camt053` | ✅ Implémenté | ❌ Pas d'UI | Interface d'import manquante |
| `/api/finance/bank/import/csv` | ✅ Implémenté | ❌ Pas d'UI | Interface d'import manquante |
| `/api/finance/reconciliation/*` | ✅ 11 endpoints | ❌ Pas d'UI | Module rapprochement sans interface |
| `/api/finance/ocr/*` | ✅ 8 endpoints | ❌ Pas d'UI | OCR sans interface upload |
| `/api/finance/supplier-invoices/*` | ✅ 5 endpoints | ❌ Pas d'UI | Factures fournisseurs sans liste |
| `/api/finance/report/*` | ✅ Implémenté | ❌ Pas d'UI | Rapports sans écran |
| `/api/finance/export/*` | ✅ 3 endpoints | ❌ Pas d'UI | Export sans boutons |
| `/api/commercial/pipeline/*` | ✅ 7 endpoints | ⚠️ Mock (PipelineView) | Pipeline non connecté |
| `/api/integrations/orchestrate/*` | ✅ 4 endpoints | ❌ Automatique | Déclenchement manuel possible |

### 3.3 Dépendances installées mais non utilisées

| Package | Installation | Utilisé | Notes |
|---------|-------------|---------|-------|
| `bullmq` | package.json | ❌ Non | Queue de jobs installée mais aucun worker |
| `ioredis` | package.json | ❌ Non | Redis client sans connexion Redis |
| `winston` | package.json | ❌ Non | Logging structuré installé, console.log utilisé |
| `tesseract.js` | package.json | ❌ Non | OCR local installé, GPT-4 Vision utilisé |

---

## 4. Ce qui est TOTALEMENT ABSENT

### 4.1 Fonctionnalités sans aucune base dans le code

| Fonctionnalité | Impact | Effort estimé |
|---------------|--------|--------------|
| **Portail Prestataire** authentifié | Haute | 80-120h |
| **Portail Revendeur** authentifié | Haute | 80-120h |
| **Gestion RH complète** (contrats, salaires, congés) | Moyenne | 120-160h |
| **Gestion formations** | Basse | 40-60h |
| **Gestion recrutement** | Basse | 40-60h |
| **Module performance/évaluations** | Moyenne | 40-60h |
| **Customer Success** (health score, NPS, churn) | Moyenne | 60-80h |
| **Module compliance/audit** | Moyenne | 60-80h |
| **Gestion contrats** (hors CGV) | Haute | 60-80h |
| **Stockage médias Cloudinary** | Basse | 20-40h |
| **Notifications temps réel** (WebSocket) | Moyenne | 40-60h |
| **Notifications email internes** | Haute | 20-40h |
| **Intégration Slack/Teams** | Basse | 20-40h |
| **Dashboard analytics avancé** | Moyenne | 40-60h |
| **CI/CD pipeline** | Haute | 20-40h |
| **Tests E2E** (Playwright configuré mais pas de tests) | Haute | 60-80h |
| **Tests unitaires** | Haute | 80-120h |
| **Migration TypeScript** | Moyenne | 80-120h |
| **Documentation API** (Swagger/OpenAPI) | Moyenne | 20-40h |
| **Rate limiting global** | Haute | 8-16h |
| **Logging structuré** (Winston) | Haute | 12-24h |
| **Redis pour sessions/cache** | Haute | 16-24h |

### 4.2 Manques critiques pour la production

| Catégorie | Manquant | Risque |
|-----------|----------|--------|
| **Sécurité** | Auth sur 6+ routes sensibles | CRITIQUE |
| **Sécurité** | Redis pour blacklist/brute force | ÉLEVÉ |
| **Sécurité** | Rotation des clés API exposées | CRITIQUE |
| **Fiabilité** | Aucun test automatisé | ÉLEVÉ |
| **Fiabilité** | Pas de monitoring/alerting | ÉLEVÉ |
| **Performance** | Pas de cache Redis | MOYEN |
| **Opérations** | Pas de CI/CD | ÉLEVÉ |
| **Maintenance** | Pas de logging structuré | MOYEN |

---

## 5. Résumé quantitatif

### Par catégorie fonctionnelle

| Catégorie | Fonctionnel | Partiel | Absent | Maturité |
|-----------|:-----------:|:-------:|:------:|:--------:|
| Finance & Compta | 85% | 10% | 5% | ⭐⭐⭐⭐ |
| Workflow commercial | 95% | 5% | 0% | ⭐⭐⭐⭐⭐ |
| Recouvrement | 90% | 10% | 0% | ⭐⭐⭐⭐⭐ |
| CRM & Leads | 70% | 15% | 15% | ⭐⭐⭐ |
| Juridique | 70% | 10% | 20% | ⭐⭐⭐ |
| Portail Client | 100% | 0% | 0% | ⭐⭐⭐⭐⭐ |
| Portail Prestataire | 5% | 0% | 95% | ⭐ |
| Portail Revendeur | 5% | 0% | 95% | ⭐ |
| Marketing | 0% | 5% | 95% | ⭐ |
| Support | 0% | 5% | 95% | ⭐ |
| HR | 10% | 10% | 80% | ⭐ |
| Intégrations | 65% | 20% | 15% | ⭐⭐⭐ |
| Sécurité | 40% | 30% | 30% | ⭐⭐ |
| DevOps/Tests | 10% | 10% | 80% | ⭐ |

### Score global plateforme

| Dimension | Score |
|-----------|:-----:|
| Backend API | **85/100** |
| Frontend SuperAdmin | **55/100** |
| Portail Client | **95/100** |
| Portails secondaires | **5/100** |
| Intégrations | **65/100** |
| Sécurité | **35/100** |
| Qualité code | **45/100** |
| Tests & DevOps | **10/100** |
| **MOYENNE GLOBALE** | **49/100** |
