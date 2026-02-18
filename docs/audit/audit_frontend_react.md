# AUDIT — Frontend React

> **Date** : 18 février 2026
> **Stack** : React 18.2 + Vite 5.0.8 + TanStack Query 5.84 + Zustand 5.0.7 + Tailwind CSS 3.4
> **Port** : 5173 (dev)

---

## 1. Architecture générale

### 1.1 Stack technique

| Technologie | Version | Usage |
|-------------|---------|-------|
| React | 18.2.0 | UI Library |
| React Router | 6.30.1 | Routing SPA (~50 routes) |
| TanStack Query | 5.84.1 | Data fetching, caching, invalidation |
| Zustand | 5.0.7 | State management global |
| Tailwind CSS | 3.4.0 | Styling utility-first |
| Recharts | 3.1.2 | Graphiques et visualisations |
| Framer Motion | 12.23.12 | Animations |
| React Hot Toast | 2.5.2 | Notifications |
| @faker-js/faker | 9.9.0 | ⚠️ Mock data en développement |
| Lucide React | 0.536.0 | Icônes |
| Tabler Icons | 2.44.0 | Icônes secondaires |
| date-fns | 3.6.0 | Manipulation dates |
| Lodash | 4.17.21 | Utilitaires |

### 1.2 Design System

- **Pattern** : Glassmorphism (backdrop-blur, transparences, glassmorphism.css)
- **Composants UI** : Badge, Button, GlassCard, Input, Select, Table (custom)
- **Layout** : Sidebar + TopBar avec sélecteur d'entreprise global
- **Responsive** : Tailwind breakpoints standards

---

## 2. État par portail

### 2.1 Superadmin Portal — ⭐ Portail principal

**Chemin** : `src/frontend/src/portals/superadmin/`
**Accès** : `http://localhost:5173/superadmin`
**Modules** : 10

#### Module Finance

| Composant | État | Source données | Notes |
|-----------|------|---------------|-------|
| FinanceDashboard.jsx | ✅ CONNECTÉ | useFinanceData → /api/finance/dashboard | Hook fonctionnel |
| KPICards.jsx | ✅ CONNECTÉ | Props du dashboard | Rendu depuis données réelles |
| CashFlowChart.jsx | ✅ CONNECTÉ | Props du dashboard (evolution) | Recharts |
| RecentTransactions.jsx | ✅ CONNECTÉ | Props du dashboard | Liste transactions |
| AlertsPanel.jsx | ✅ CONNECTÉ | Props du dashboard (alerts) | Actions: rappel, paiement |
| BudgetsManager.jsx | ❌ MOCK | mockBudgets, mockMonthlyTrend, mockCategoryBreakdown | Données hardcodées |
| ExpensesTracker.jsx | ❌ MOCK | mockExpenses, mockCategoryBreakdown, mockMonthlyExpenses | Données hardcodées |

#### Module Collection (Recouvrement)

| Composant | État | Source données | Notes |
|-----------|------|---------------|-------|
| CollectionDashboard.jsx | ✅ CONNECTÉ | useCollectionData | Tabs: overview, debtors, lp-cases |
| DebtorsList.jsx | ✅ CONNECTÉ | useDebtors | Liste débiteurs Directus |
| DebtorDetail.jsx | ✅ CONNECTÉ | useDebtor, useAgingCalculation | Détail complet |
| AgingChart.jsx | ✅ CONNECTÉ | useAgingAnalysis | Recharts |
| InterestCalculator.jsx | ✅ CONNECTÉ | useInterestCalculation | Art. 104 CO (5%) |
| LPCases.jsx | ✅ CONNECTÉ | useLPSteps | Poursuites LP |
| WorkflowConfig.jsx | ✅ CONNECTÉ | useCantonConfig | Configuration |
| WorkflowTimeline.jsx | ✅ CONNECTÉ | Props | Timeline visuelle |
| CollectionStats.jsx | ✅ CONNECTÉ | useCollectionStats | Statistiques |

#### Module CRM

| Composant | État | Source données | Notes |
|-----------|------|---------------|-------|
| CRMDashboard.jsx | ⚠️ PARTIEL | useCRMData | Tabs: dashboard, contacts, companies |
| CompaniesList.jsx | ✅ CONNECTÉ | useCompanies | Liste Directus |
| CompanyForm.jsx | ✅ CONNECTÉ | useSaveCompany | CRUD complet |
| ContactsList.jsx | ✅ CONNECTÉ | useContacts | Liste Directus |
| ContactForm.jsx | ✅ CONNECTÉ | useSaveContact | CRUD complet |
| QuickStats.jsx | ✅ CONNECTÉ | useCRMStats | Statistiques |
| PipelineView.jsx | ❌ MOCK | mockDeals hardcodé | Kanban pipeline |
| CustomerSuccess.jsx | ❌ MOCK | mockCustomers, mockHealthTrend, mockNpsDistribution | Customer health |

#### Module Leads

| Composant | État | Source données | Notes |
|-----------|------|---------------|-------|
| LeadsDashboard.jsx | ✅ CONNECTÉ | useLeads, useLeadStats | Vue Kanban + Liste |
| LeadKanban.jsx | ✅ CONNECTÉ | useLeads (filtré par status) | Drag & drop |
| LeadsList.jsx | ✅ CONNECTÉ | useLeads | Table avec filtres |
| LeadForm.jsx | ✅ CONNECTÉ | useSaveContact (réutilisé) | Formulaire création |
| LeadStats.jsx | ✅ CONNECTÉ | useLeadStats | Taux conversion, scores |

#### Module Legal

| Composant | État | Source données | Notes |
|-----------|------|---------------|-------|
| LegalDashboard.jsx | ⚠️ PARTIEL | useLegalData, useLegalStats | Mix réel/mock |
| CGVManager.jsx | ✅ CONNECTÉ | useLegalData (cgvList) | Gestion versions |
| CGVEditor.jsx | ✅ CONNECTÉ | useLegalData | Éditeur de contenu |
| CGVPreview.jsx | ✅ CONNECTÉ | Props | Prévisualisation |
| SignatureRequests.jsx | ✅ CONNECTÉ | useLegalData (signatureRequests) | DocuSeal |
| AcceptanceHistory.jsx | ✅ CONNECTÉ | useLegalData (acceptances) | Historique |
| LegalStats.jsx | ✅ CONNECTÉ | useLegalStats | Statistiques |
| ContractsManager.jsx | ❌ MOCK | mockContracts, mockTypeDistribution | Gestion contrats |
| ComplianceManager.jsx | ❌ MOCK | mockComplianceItems, mockAuditHistory | Conformité |

#### Module Marketing

| Composant | État | Source données | Notes |
|-----------|------|---------------|-------|
| MarketingDashboard.jsx | ❌ MOCK | mockOverviewData (emailsSent, openRate...) | useQuery avec setTimeout 500ms |
| CampaignsList.jsx | ❌ MOCK | mockCampaigns | Liste campagnes |
| ContentCalendar.jsx | ❌ MOCK | mockContent | Calendrier éditorial |
| MarketingAnalytics.jsx | ❌ MOCK | mockAnalytics | Graphiques performance |
| EventsManager.jsx | ❌ MOCK | mockEvents | Gestion événements |

**Status** : 100% MOCK — Prévu : iframe Mautic

#### Module Support

| Composant | État | Source données | Notes |
|-----------|------|---------------|-------|
| SupportDashboard.jsx | ❌ MOCK | mockOverviewData (openTickets...) | Tabs: overview, tickets |
| TicketsManager.jsx | ❌ MOCK | mockTickets | Liste tickets |
| NotificationsCenter.jsx | ❌ MOCK | mockNotifications | Centre notifications |

**Status** : 100% MOCK — Nécessite collection `support_tickets`

#### Module HR

| Composant | État | Source données | Notes |
|-----------|------|---------------|-------|
| HRModule.jsx | ⚠️ PARTIEL | usePeople (réel) + mock | Tabs: team, talents, performance |
| TeamView.jsx | ✅ CONNECTÉ | usePeople | Liste employés Directus |
| TalentsView.jsx | ❌ MOCK | Données hardcodées | Gestion talents |
| PerformanceView.jsx | ❌ MOCK | Données hardcodées | Évaluations |
| RecruitmentView.jsx | ❌ MOCK | Données hardcodées | Recrutement |

#### Module Projects

| Composant | État | Source données | Notes |
|-----------|------|---------------|-------|
| ProjectsModule.jsx | ⚠️ PARTIEL | useProjects (réel) | 4 vues: grid, list, kanban, timeline |
| GridView.jsx | ✅ CONNECTÉ | useProjects | Grille de projets |
| ListView.jsx | ✅ CONNECTÉ | useProjects | Liste tabulaire |
| KanbanView.jsx | ✅ CONNECTÉ | useProjects | Kanban par status |
| TimelineView.jsx | ✅ CONNECTÉ | useProjects | Timeline visuelle |
| DeliverablesView.jsx | ⚠️ PARTIEL | useProjects (partiellement) | Livrables |
| TimeTrackingView.jsx | ⚠️ PARTIEL | Données partielles | Suivi temps |

#### Module Settings

| Composant | État | Source données | Notes |
|-----------|------|---------------|-------|
| SettingsDashboard.jsx | ✅ CONNECTÉ | useOurCompanies | Navigation settings |
| CompanySettings.jsx | ✅ CONNECTÉ | useOurCompanies | Configuration entreprise |
| InvoiceSettings.jsx | ✅ CONNECTÉ | Settings Directus | Facturation |
| ProductsList.jsx | ✅ CONNECTÉ | Products Directus | Liste produits |
| ProductForm.jsx | ✅ CONNECTÉ | Products Directus | CRUD produits |
| TaxSettings.jsx | ❌ MOCK | Données hardcodées | TVA/taxes |
| UsersSettings.jsx | ❌ MOCK | Données hardcodées | Gestion utilisateurs |
| PermissionsSettings.jsx | ❌ MOCK | Données hardcodées | Permissions |
| IntegrationsSettings.jsx | ❌ MOCK | Données hardcodées | Config intégrations |

---

### 2.2 Client Portal — ✅ Production-ready

**Chemin** : `src/frontend/src/portals/client/`
**Fichiers** : 14

| Composant | État | Source données | Notes |
|-----------|------|---------------|-------|
| ClientPortalApp.jsx | ✅ CONNECTÉ | ClientAuthContext | Wrapper principal |
| LoginPage.jsx | ✅ CONNECTÉ | POST /api/commercial/portal/login | JWT auth |
| ActivationPage.jsx | ✅ CONNECTÉ | POST /api/commercial/portal/activate | Première connexion |
| ResetPasswordPage.jsx | ✅ CONNECTÉ | POST /api/commercial/portal/reset-password | Réinitialisation |
| ClientPortalDashboard.jsx | ✅ CONNECTÉ | GET /api/commercial/portal/dashboard | Dashboard complet |
| QuoteViewer.jsx | ✅ CONNECTÉ | GET /api/commercial/portal/quotes | Consultation devis |
| InvoicesList.jsx | ✅ CONNECTÉ | GET /api/commercial/portal/invoices | Liste factures |
| PaymentHistory.jsx | ✅ CONNECTÉ | GET /api/commercial/portal/payments | Historique paiements |
| ProjectTimeline.jsx | ✅ CONNECTÉ | GET /api/commercial/portal/projects | Timeline projet |
| SignatureEmbed.jsx | ✅ CONNECTÉ | DocuSeal iframe | Signature intégrée |
| ClientAuthContext.jsx | ✅ CONNECTÉ | JWT auth avec refresh | Context React complet |

**Fonctionnalités complètes** : Login, activation, reset password, dashboard, devis, factures, paiements, projets, signatures.

---

### 2.3 Prestataire Portal — 🟡 Mockup

**Chemin** : `src/frontend/src/portals/prestataire/Dashboard.jsx`
**Fichiers** : 1 seul fichier

| Section | Données | Notes |
|---------|---------|-------|
| Métriques | Hardcodé : heures, revenus, missions, note | — |
| Heures travaillées | missionsData (array hardcodé) | Recharts |
| Répartition activités | projectsDistribution (hardcodé) | PieChart |
| Évolution revenus | earningsData (hardcodé) | LineChart |
| Missions actives | activeMissions (hardcodé) | Table |
| Planning semaine | weekPlan (hardcodé) | Liste |

**À développer** : Authentification, missions, time tracking, facturation, contrats.

---

### 2.4 Revendeur Portal — 🟡 Mockup

**Chemin** : `src/frontend/src/portals/revendeur/Dashboard.jsx`
**Fichiers** : 1 seul fichier

| Section | Données | Notes |
|---------|---------|-------|
| Métriques | Hardcodé : CA, commandes, panier moyen, stock | — |
| Ventes vs objectifs | salesData (hardcodé) | BarChart |
| Répartition CA | productsData (hardcodé) | PieChart |
| Évolution clients | clientsData (hardcodé) | LineChart |
| Top clients | topClients (hardcodé) | Table |
| Alertes stock | stockAlerts (hardcodé) | Liste |
| Dernières commandes | recentOrders (hardcodé) | Table |

**À développer** : Authentification, commandes, stocks, commissions, catalogue.

---

## 3. Hooks partagés

| Hook | Fichier | Usage | État |
|------|---------|-------|------|
| useDirectusQuery | hooks/useDirectusQuery.js | Requêtes génériques Directus | ✅ |
| useCompanies | hooks/useCompanies.js | CRUD entreprises | ✅ |
| useFinances | hooks/useFinances.js | Données financières | ✅ |
| useProjects | hooks/useProjects.js | CRUD projets | ✅ |
| usePeople | hooks/usePeople.js | CRUD personnes | ✅ |
| useMetrics | hooks/useMetrics.js | KPIs et métriques | ✅ |
| useLeads | hooks/useLeads.js | CRUD leads + stats | ✅ |
| useCache | hooks/useCache.js | Cache utilities | ✅ |
| useInitialize | hooks/useInitialize.js | Initialisation app | ✅ |

---

## 4. Services API

| Service | Fichier | Endpoints | État |
|---------|---------|-----------|------|
| directus.js | api/directus.js | Client Directus SDK | ✅ (contient aussi mockDataGenerator) |
| config.js | api/config.js | Configuration API base URL | ✅ |
| financeApi.js | portals/superadmin/finance/services/ | /api/finance/* | ✅ |
| collectionApi.js | portals/superadmin/collection/services/ | /api/collection/* | ✅ |
| crmApi.js | portals/superadmin/crm/services/ | CRM endpoints | ✅ |
| legalApi.js | portals/superadmin/legal/services/ | /api/legal/* | ✅ |
| demoData.js | api/demoData.js | Fallback données démo | ⚠️ |
| mockKPIData.js | services/mockKPIData.js | KPIs mockés | ⚠️ |

---

## 5. Synthèse des composants

### Décompte par état

| État | Nombre | Pourcentage |
|------|--------|-------------|
| ✅ CONNECTÉ (API réelle) | 48 | 55% |
| ❌ MOCK (données hardcodées) | 25 | 29% |
| ⚠️ PARTIEL (mix réel/mock) | 8 | 9% |
| 🟡 PLACEHOLDER (portails) | 6 | 7% |
| **TOTAL** | **87** | **100%** |

### Composants MOCK à connecter (priorité)

| Priorité | Module | Composants | Collection cible |
|----------|--------|------------|------------------|
| **P1** | Marketing | 5 composants | → Mautic iframe |
| **P1** | Support | 3 composants | → support_tickets |
| **P2** | Finance | 2 composants | → budgets, expenses |
| **P2** | CRM | 2 composants | → opportunities, customer health |
| **P2** | Legal | 2 composants | → contracts |
| **P3** | HR | 3 composants | → trainings, performance |
| **P3** | Settings | 4 composants | → Directus users/roles API |
| **P4** | Prestataire | 1 portail complet | Nouveau développement |
| **P4** | Revendeur | 1 portail complet | Nouveau développement |

---

## 6. Configuration Vite

```javascript
// vite.config.js - Proxy routes
server: {
  port: 5173,
  proxy: {
    '/api/finance': 'http://localhost:3000',
    '/api/legal': 'http://localhost:3000',
    '/api/collection': 'http://localhost:3000',
    '/api': 'http://localhost:8055',    // Directus
    '/items': 'http://localhost:8055',  // Directus REST
  }
}
```

**Remarque** : Le proxy route `/api/finance`, `/api/legal`, `/api/collection` vers Express (3000), et le reste vers Directus (8055). Cela signifie que les routes `/api/commercial/*`, `/api/integrations/*`, `/api/mautic/*` ne sont PAS proxifiées et nécessitent un accès direct au port 3000.

---

## 7. Points d'attention

1. **`USE_MOCK_DATA` par défaut à `true`** dans `hooks.js` — risque en production
2. **@faker-js/faker en dépendance de production** — devrait être en devDependencies
3. **Proxy Vite incomplet** — certaines routes API ne sont pas proxifiées
4. **Pas de lazy loading** des modules — tout est chargé au démarrage
5. **Pas de code splitting** par portail — un seul bundle pour les 4 portails
6. **Pas de tests frontend** — sauf `__tests__/` dans client portal (structure présente)
