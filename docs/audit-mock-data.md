# Audit Mock Data — Phase A.6
**Date** : 2026-02-21
**Scope** : `src/frontend/src/` — tous les fichiers .jsx

---

## Résumé

| Catégorie | Count | Sévérité |
|-----------|-------|----------|
| Mock Data Constants | 18 | High: 15, Medium: 3 |
| TODO/Connect Comments | 14 | Medium: 14 |
| Hardcoded Values | 2 | High: 1, Medium: 1 |
| Fake/Generated Data | 2 | High: 2 |
| Test Fixtures | 3 | Low: 3 (acceptable) |
| **TOTAL** | **39** | |

---

## Findings détaillés

### Portail Revendeur (Priorité P0 — collection `commissions` créée Phase A.2)

| Fichier | Ligne | Type | Sévérité | Description |
|---------|-------|------|----------|-------------|
| `portals/revendeur/CommissionsRevendeur.jsx` | 46-52 | mock_data | high | MOCK_COMMISSIONS avec 5 faux enregistrements (Migros SA, Nestle, Rolex) |
| `portals/revendeur/CommissionsRevendeur.jsx` | 6-8, 42, 59 | todo_connect | medium | TODOs: "collection commissions n'existe pas" |
| `portals/revendeur/RevendeurDashboard.jsx` | 166-170 | mock_data | high | mockCommissions useMemo (4800/3200/4450 CHF) |
| `portals/revendeur/RevendeurDashboard.jsx` | 164, 218, 283, 294 | todo_connect | medium | TODOs: replace mock commission values |
| `portals/revendeur/RevendeurDashboard.jsx` | 222 | hardcoded | high | `formatCHF(12450)` commissions KPI hardcodé |
| `portals/revendeur/MarketingRevendeur.jsx` | 27-31 | mock_data | high | MOCK_CAMPAIGNS (3 templates) |
| `portals/revendeur/MarketingRevendeur.jsx` | 26, 248 | todo_connect | medium | TODOs: Mautic API |
| `portals/revendeur/RapportsRevendeur.jsx` | 49-52 | mock_data | high | MOCK_COMMISSIONS_BY_MONTH (12 mois hardcodés) |
| `portals/revendeur/RapportsRevendeur.jsx` | 47-48, 257, 317 | todo_connect | medium | TODOs: real commissions data |

### Portail SuperAdmin

| Fichier | Ligne | Type | Sévérité | Description |
|---------|-------|------|----------|-------------|
| `portals/superadmin/support/components/TicketsManager.jsx` | 10-85 | mock_data | high | mockTickets (8 faux tickets) |
| `portals/superadmin/marketing/components/CampaignsList.jsx` | 9-70 | mock_data | high | mockCampaigns (5 fausses campagnes) |
| `portals/superadmin/marketing/components/EventsManager.jsx` | 9-65 | mock_data | high | mockEvents (5 faux événements) |
| `portals/superadmin/finance/components/BudgetsManager.jsx` | 51, 102 | todo_connect | medium | TODOs: budgets/expenses fallback |
| `portals/superadmin/finance/components/ExpensesTracker.jsx` | 58 | todo_connect | medium | TODO: expenses fallback |
| `portals/superadmin/settings/components/UsersSettings.jsx` | 293 | todo_connect | medium | TODO: API call (user save) |
| `portals/superadmin/settings/components/PermissionsSettings.jsx` | 158 | todo_connect | medium | TODO: Save to backend |

### Modules Projets

| Fichier | Ligne | Type | Sévérité | Description |
|---------|-------|------|----------|-------------|
| `modules/projects/views/TimeTrackingView.jsx` | 13-86 | mock_data | high | mockTimeEntries + mockWeeklyData + mockProjectDistribution |
| `modules/projects/views/DeliverablesView.jsx` | 10-89 | mock_data | high | mockDeliverables + mockTasks |

### Modules HR

| Fichier | Ligne | Type | Sévérité | Description |
|---------|-------|------|----------|-------------|
| `modules/hr/HRModule.jsx` | 60-61 | hardcoded | medium | averageTenure "2.3 ans", turnoverRate "12%" |
| `modules/hr/views/TalentsView.jsx` | 14-23 | fake_data | high | Math.random() pour skills/certifications |
| `modules/hr/views/PerformanceView.jsx` | 14-23 | fake_data | high | Math.random() pour performance scores |

### Test Fixtures (Acceptables)

| Fichier | Ligne | Type | Sévérité |
|---------|-------|------|----------|
| `portals/client/__tests__/ClientPortal.test.jsx` | 304-519 | mock_data | low |

---

## Actions recommandées

1. **P0** : Connecter `CommissionsRevendeur` + `RevendeurDashboard` + `RapportsRevendeur` à la collection `commissions` (créée A.2)
2. **P1** : Connecter `TicketsManager` à `support_tickets`, `CampaignsList`/`EventsManager` à Mautic API
3. **P2** : Connecter `TimeTrackingView` à `time_tracking`, `DeliverablesView` à `deliverables`
4. **P3** : Remplacer Math.random() HR par données Directus (`talents_simple`, `evaluations`)
5. **P4** : Compléter les TODO API calls (UsersSettings, PermissionsSettings)
