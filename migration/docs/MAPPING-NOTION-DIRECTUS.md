# 🗺️ MAPPING DÉTAILLÉ : 62 Bases Notion → 48 Collections Directus

**Date**: 2025-08-03  
**Version**: 1.0  
**Basé sur**: notion-databases-analysis.json

## 📊 RÉSUMÉ EXÉCUTIF

- **Bases Notion**: 62 au total
- **Collections Directus**: 48 cibles
- **Réduction**: 22.5% de complexité
- **Propriétés totales**: 1,567 à migrer
- **Relations**: 105 à reconstruire
- **Rollups**: 44 à convertir
- **Formules**: 36 à adapter

## 🎯 MAPPING PAR MODULE

### 🏢 MODULE 1 - GESTION DE PROJETS (11→6 collections)

#### 1. `projects` ← DB-PROJETS CLIENTS
- **Propriétés**: 56 (15 relations, 14 rollups, 9 formules)
- **Complexité**: ⭐⭐⭐⭐⭐ Très haute
- **Note**: Base trop complexe pour fusionner, garder séparée

#### 2. `tasks` ← DB-TACHES + DB-VALIDATION
- **DB-TACHES**: 37 props (4 relations, 8 rollups, 6 formules)
- **DB-VALIDATION**: 17 props (3 relations, 3 formules)
- **Total consolidé**: ~45 props estimées

#### 3. `deliverables` ← DB-LIVRABLES-PRESTATAIRE + DB-MISSIONS-PRESTATAIRE
- **DB-LIVRABLES-PRESTATAIRE**: 30 props
- **DB-MISSIONS-PRESTATAIRE**: 50 props
- **Stratégie**: Table polymorphe avec type discriminant

#### 4. `resources` ← DB-ÉQUIPE-RESSOURCES + DB-PRESTATAIRES
- **DB-ÉQUIPE-RESSOURCES**: 17 props (4 relations, 1 rollup)
- **DB-PRESTATAIRES**: 16 props (2 relations)
- **Total**: ~25 props après optimisation

#### 5. `documents` ← DB-DOCUMENTS
- **Propriétés**: 29 (7 relations, 9 rollups)
- **Note**: Système de versioning à ajouter

#### 6. `time_tracking` ← DB-TIME-TRACKING
- **Propriétés**: 12 (simples)
- **Complexité**: ⭐ Très faible

### 👥 MODULE 2 - CRM (9→4 collections)

#### 7. `companies` ← DB-CONTACTS-ENTREPRISES + DB-ZONES-GEOGRAPHIQUES
- **DB-CONTACTS-ENTREPRISES**: 30 props (10 relations)
- **DB-ZONES-GEOGRAPHIQUES**: 46 props
- **Stratégie**: Intégrer zones comme champs JSON

#### 8. `people` ← DB-CONTACTS-PERSONNES
- **Propriétés**: 41 (7 relations)
- **Note**: Ajouter champs RGPD

#### 9. `interactions` ← DB-INTERACTIONS CLIENTS + DB-COMMUNICATION
- **DB-INTERACTIONS CLIENTS**: 10 props (1 relation)
- **DB-COMMUNICATION**: 14 props (3 relations)
- **Total**: ~20 props

#### 10. `deals` ← DB-SALES-PIPELINE + DB-VENTES + DB-LEAD-LIFECYCLE
- **DB-SALES-PIPELINE**: 19 props
- **DB-VENTES**: 40 props
- **DB-LEAD-LIFECYCLE**: 22 props (5 relations)

### 💰 MODULE 3 - FINANCE (8→5 collections)

#### 11. `invoices` ← DB-FACTURES-CLIENTS + DB-FACTURES-FOURNISSEURS
- **DB-FACTURES-CLIENTS**: 32 props (5 relations, 9 formules)
- **DB-FACTURES-FOURNISSEURS**: 23 props (3 relations)
- **Type**: Polymorphe (client/fournisseur)

#### 12. `transactions` ← DB-TRANSACTIONS-BANCAIRES + DB-ECRITURES-COMPTABLES
- **DB-TRANSACTIONS-BANCAIRES**: 21 props
- **DB-ECRITURES-COMPTABLES**: 22 props
- **Rapprochement**: Automatique via triggers

#### 13. `expenses` ← DB-NOTES-FRAIS
- **Propriétés**: 21 (3 relations)
- **OCR**: Integration possible

#### 14. `budgets` ← DB-BUDGET-PLANNING + DB-PREVISIONS-TRESORERIE
- **DB-BUDGET-PLANNING**: 12 props
- **DB-PREVISIONS-TRESORERIE**: 11 props
- **Calculs**: Via vues SQL

#### 15. `subscriptions` ← DB-SUIVI D'ABONNEMENTS
- **Propriétés**: 14
- **Alertes**: Via Directus Flows

### 📧 MODULE 4 - MARKETING (9→6 collections)

#### 16. `campaigns` ← DB-CAMPAIGNS + DB-EMAIL-CAMPAIGNS
- **DB-CAMPAIGNS**: 25 props
- **DB-EMAIL-CAMPAIGNS**: 12 props (2 relations)

#### 17. `content_calendar` ← DB-CONTENT-CALENDAR + DB-SOCIAL-MEDIA
- **DB-CONTENT-CALENDAR**: 11 props
- **DB-SOCIAL-MEDIA**: 36 props (3 relations)

#### 18. `email_marketing` ← DB-EMAIL-SEQUENCES + DB-LEAD-SEQUENCES
- **DB-EMAIL-SEQUENCES**: 14 props
- **DB-LEAD-SEQUENCES**: 27 props

#### 19. `events` ← DB-EVENTS
- **Propriétés**: 23
- **Intégrations**: Calendar sync

#### 20. `seo_tracking` ← DB-SEO-CONTENT
- **Propriétés**: 29 (2 relations)
- **Analytics**: GA4 integration

#### 21. `lead_scoring` ← DB-LEAD-SCORING
- **Propriétés**: 13 (2 relations)
- **ML**: Scoring prédictif

### 📊 MODULE 5 - ANALYTICS (6→4 collections)

#### 22. `analytics` ← DB-ANALYTICS + DB-PERFORMANCE-HISTORIQUE
- **DB-ANALYTICS**: 29 props (3 relations)
- **DB-PERFORMANCE-HISTORIQUE**: 44 props

#### 23. `reports` ← DB-REPORTS + DB-REPORTING
- **DB-REPORTS**: 24 props
- **DB-REPORTING**: 20 props

#### 24. `kpis` ← DB-KPI-DASHBOARD
- **Propriétés**: 28
- **Dashboards**: Temps réel

#### 25. `insights` ← DB-PREDICTIVE-INSIGHTS
- **Propriétés**: 24
- **IA**: Modèles prédictifs

### ⚙️ MODULE 6 - SYSTÈME (7→8 collections)

#### 26. `workflows` ← DB-WORKFLOW-AUTOMATION
- **Propriétés**: 41 (3 relations)
- **⚠️ CRITIQUE**: Ne pas fusionner

#### 27. `integrations` ← DB-INTEGRATION-API
- **Propriétés**: 57
- **⚠️ CRITIQUE**: Garder séparée

#### 28. `system_logs` ← DB-SYSTEM-LOGS
- **Propriétés**: 73 (3 relations)
- **⚠️ PLUS COMPLEXE**: Garder absolument séparée

#### 29. `automation_rules` ← DB-AUTOMATION-RULES
- **Propriétés**: 17
- **Flows**: Directus natif

#### 30. `templates` ← DB-TEMPLATE-MANAGER
- **Propriétés**: 15 (2 relations)

#### 31. `permissions` ← DB-PERMISSIONS-ACCÈS
- **Propriétés**: 11
- **RBAC**: Directus natif

#### 32. `contracts` ← DB-JURIDIQUE-CONTRACTS
- **Propriétés**: 17 (1 relation)

#### 33. `alerts` ← DB-ALERTS-CENTER
- **Propriétés**: 14

### 👤 MODULE 7 - RH (3→3 collections)

#### 34. `employees` ← DB-RH-EMPLOYEES + DB-UTILISATEURS
- **DB-RH-EMPLOYEES**: 28 props (2 relations)
- **DB-UTILISATEURS**: 31 props

#### 35. `talents` ← DB-TALENTS
- **Propriétés**: 11
- **ATS**: Integration possible

#### 36. `compliance` ← DB-COMPLIANCE
- **Propriétés**: 11
- **RGPD**: Checks automatiques

### 🎯 MODULE 8 - SUPPORT (0→6 collections nouvelles)

#### 37. `support_tickets` ← NOUVEAU
- **Source**: Créer from scratch
- **SLA**: Monitoring intégré

#### 38. `customer_success` ← DB-CUSTOMER SUCCESS
- **Propriétés**: 28
- **NPS**: Calculs automatiques

#### 39. `providers_view` ← Vue sur resources
- **Type**: Vue SQL
- **Filtrage**: type='provider'

#### 40. `commissions` ← DB-COMMISSIONS-REVENDEUR
- **Propriétés**: 41
- **Calculs**: Triggers SQL

#### 41. `rewards` ← DB-REWARDS-TRACKING
- **Propriétés**: 32
- **Gamification**: Points system

#### 42. `revenue_attribution` ← DB-REVENUE-ATTRIBUTION
- **Propriétés**: 25
- **Analytics**: Attribution models

### 🏗️ MODULE 9 - DONNÉES TECHNIQUES (0→6 collections)

#### 43. `entities` ← DB-ENTITÉ DU GROUPE
- **Propriétés**: 42 (7 relations, 10 rollups)
- **Complexité**: ⭐⭐⭐⭐ Haute

#### 44. `products` ← DB-PRODUITS-HYPERVISUAL
- **Propriétés**: 16 (2 relations)
- **Catalog**: E-commerce ready

#### 45. `scraping_sources` ← DB-SCRAPING-SOURCES
- **Propriétés**: 15 (2 formules)
- **Scheduling**: Cron jobs

#### 46. `accounting_entries` ← Séparé de transactions
- **Type**: Journal comptable
- **Validation**: Double-entry

#### 47. `bank_transactions` ← Séparé de transactions
- **Import**: Formats bancaires
- **Matching**: ML algorithms

#### 48. `vat_declarations` ← DB-TVA-DECLARATIONS
- **Propriétés**: 24
- **Compliance**: Auto-calcul

## 🔄 STRATÉGIES DE CONVERSION

### Relations (105 total)
```javascript
// Notion → Directus
"relation" → Many-to-One / One-to-Many / Many-to-Many
"rollup" → SQL Views / Computed fields
"formula" → Triggers / Hooks / Extensions
```

### Types de champs
```javascript
// Mapping des types
"rich_text" → "text" ou "wysiwyg"
"select" → "dropdown"
"multi_select" → "tags" ou "m2m relation"
"people" → "user" relation
"files" → "file" relation
"checkbox" → "boolean"
"number" → "integer" ou "decimal"
"date" → "datetime"
"email" → "string" + validation
"phone_number" → "string" + format
"url" → "string" + validation
```

## 📈 MÉTRIQUES DE COMPLEXITÉ

### Top 10 bases les plus complexes
1. **DB-SYSTEM-LOGS**: 73 props ⚠️
2. **DB-INTEGRATION-API**: 57 props ⚠️
3. **DB-PROJETS CLIENTS**: 56 props + 15 relations ⚠️
4. **DB-MISSIONS-PRESTATAIRE**: 50 props
5. **DB-ZONES-GEOGRAPHIQUES**: 46 props
6. **DB-PERFORMANCE-HISTORIQUE**: 44 props
7. **DB-ENTITÉ DU GROUPE**: 42 props + 10 rollups
8. **DB-CONTACTS-PERSONNES**: 41 props + 7 relations
9. **DB-COMMISSIONS-REVENDEUR**: 41 props
10. **DB-WORKFLOW-AUTOMATION**: 41 props ⚠️

### Distribution des propriétés
- **<10 props**: 2 bases (3%)
- **10-20 props**: 24 bases (39%)
- **20-30 props**: 20 bases (32%)
- **30-50 props**: 13 bases (21%)
- **50+ props**: 3 bases (5%)

## ⚠️ POINTS D'ATTENTION CRITIQUES

1. **Ne JAMAIS fusionner** :
   - DB-SYSTEM-LOGS
   - DB-INTEGRATION-API
   - DB-WORKFLOW-AUTOMATION
   - DB-PROJETS CLIENTS

2. **Relations complexes** :
   - Recréer les 105 relations
   - Mapper les 44 rollups en vues
   - Convertir 36 formules

3. **Ordre de migration** :
   - Commencer par les bases <15 props
   - Finir par les bases système
   - Tester chaque module isolément

---

*Document de référence pour le mapping Notion → Directus*  
*Utiliser ce document pour toute décision de migration*
