# 📊 RAPPORT D'AUDIT COMPLET - COLLECTIONS DIRECTUS
## Date : 08/08/2025 20:02:51

## 📈 RÉSUMÉ EXÉCUTIF
- Collections totales : 53
- Collections accessibles : 53/53
- Collections avec owner_company : 52/53
- Problèmes critiques : 4

## 🔴 PROBLÈMES CRITIQUES
- **bank_transactions** : missing_critical_fields (transaction_date, transaction_type)
- **expenses** : missing_critical_fields (expense_date)
- **kpis** : missing_critical_fields (metric_name, value, date)
- **payments** : missing_critical_fields (payment_date)

## ✅ COLLECTIONS FONCTIONNELLES (53)
accounting_entries, activities, approvals, audit_logs, bank_transactions, budgets, client_invoices, comments, companies, company_people, compliance, content_calendar, contracts, credits, customer_success, debits, deliverables, deliveries, departments, evaluations, events, expenses, goals, interactions, kpis, notes, notifications, orders, owner_companies, payments, people, permissions, projects, projects_team, proposals, providers, quotes, reconciliations, refunds, returns, roles, settings, skills, subscriptions, supplier_invoices, support_tickets, tags, talents, talents_simple, teams, time_tracking, trainings, workflows

## 🔧 PLAN DE CORRECTION

### HIGH - 1 collections n'ont pas de champ owner_company
**Type**: missing_owner_company
**Action**: Exécuter le script SQL pour ajouter owner_company à ces collections
**Collections concernées**: owner_companies

### HIGH - 1 collections ont des données sans owner_company
**Type**: null_owner_company
**Action**: Mettre à jour les enregistrements pour assigner une valeur owner_company
**Détails**:
- budgets: 53 enregistrements

### MEDIUM - 5 collections ont des relations manquantes
**Type**: broken_relations
**Action**: Créer les relations manquantes via l'API Directus
**Collections concernées**: client_invoices, deliverables, payments, people, projects

## 📊 DÉTAILS PAR COLLECTION

| Collection | Accessible | Records | Owner Company | Champs | Relations | Distribution |
|------------|------------|---------|---------------|--------|-----------|-------------|
| accounting_entries | ✅ | 0 | ✅ | 10 | 1 | - |
| activities | ✅ | 0 | ✅ | 8 | 1 | - |
| approvals | ✅ | 0 | ✅ | 7 | 1 | - |
| audit_logs | ✅ | 0 | ✅ | 7 | 1 | - |
| bank_transactions | ✅ | 3230 | ✅ | 11 | 1 | H:1657 D:414 L:443 |
| budgets | ✅ | 53 | ✅ | 20 | 1 | H:0 D:0 L:0 |
| client_invoices | ✅ | 1043 | ✅ | 10 | 1 | H:644 D:99 L:90 |
| comments | ✅ | 0 | ✅ | 7 | 1 | - |
| companies | ✅ | 127 | ✅ | 13 | 1 | H:127 D:0 L:0 |
| company_people | ✅ | 0 | ✅ | 4 | 1 | - |
| compliance | ✅ | 3 | ✅ | 19 | 1 | H:3 D:0 L:0 |
| content_calendar | ✅ | 3 | ✅ | 19 | 1 | H:3 D:0 L:0 |
| contracts | ✅ | 60 | ✅ | 9 | 1 | H:60 D:0 L:0 |
| credits | ✅ | 0 | ✅ | 7 | 1 | - |
| customer_success | ✅ | 0 | ✅ | 7 | 1 | - |
| debits | ✅ | 0 | ✅ | 7 | 1 | - |
| deliverables | ✅ | 550 | ✅ | 10 | 1 | H:301 D:62 L:65 |
| deliveries | ✅ | 0 | ✅ | 7 | 1 | - |
| departments | ✅ | 0 | ✅ | 7 | 1 | - |
| evaluations | ✅ | 0 | ✅ | 7 | 1 | - |
| events | ✅ | 0 | ✅ | 7 | 1 | - |
| expenses | ✅ | 763 | ✅ | 11 | 1 | H:284 D:136 L:121 |
| goals | ✅ | 0 | ✅ | 7 | 1 | - |
| interactions | ✅ | 3 | ✅ | 19 | 1 | H:3 D:0 L:0 |
| kpis | ✅ | 240 | ✅ | 7 | 1 | H:48 D:48 L:48 |
| notes | ✅ | 0 | ✅ | 7 | 1 | - |
| notifications | ✅ | 0 | ✅ | 7 | 1 | - |
| orders | ✅ | 0 | ✅ | 7 | 1 | - |
| owner_companies | ✅ | 5 | ❌ | 8 | 1 | - |
| payments | ✅ | 100 | ✅ | 10 | 1 | H:100 D:0 L:0 |
| people | ✅ | 515 | ✅ | 14 | 1 | H:515 D:0 L:0 |
| permissions | ✅ | 3 | ✅ | 18 | 1 | H:3 D:0 L:0 |
| projects | ✅ | 299 | ✅ | 14 | 1 | H:181 D:28 L:30 |
| projects_team | ✅ | 0 | ✅ | 4 | 1 | - |
| proposals | ✅ | 80 | ✅ | 7 | 1 | H:80 D:0 L:0 |
| providers | ✅ | 0 | ✅ | 7 | 1 | - |
| quotes | ✅ | 0 | ✅ | 7 | 1 | - |
| reconciliations | ✅ | 0 | ✅ | 7 | 1 | - |
| refunds | ✅ | 0 | ✅ | 7 | 1 | - |
| returns | ✅ | 0 | ✅ | 7 | 1 | - |
| roles | ✅ | 0 | ✅ | 7 | 1 | - |
| settings | ✅ | 0 | ✅ | 7 | 1 | - |
| skills | ✅ | 0 | ✅ | 7 | 1 | - |
| subscriptions | ✅ | 120 | ✅ | 10 | 1 | H:120 D:0 L:0 |
| supplier_invoices | ✅ | 375 | ✅ | 10 | 1 | H:375 D:0 L:0 |
| support_tickets | ✅ | 0 | ✅ | 14 | 1 | - |
| tags | ✅ | 0 | ✅ | 7 | 1 | - |
| talents | ✅ | 3 | ✅ | 23 | 1 | H:3 D:0 L:0 |
| talents_simple | ✅ | 0 | ✅ | 7 | 1 | - |
| teams | ✅ | 0 | ✅ | 7 | 1 | - |
| time_tracking | ✅ | 3 | ✅ | 22 | 1 | H:3 D:0 L:0 |
| trainings | ✅ | 0 | ✅ | 7 | 1 | - |
| workflows | ✅ | 0 | ✅ | 7 | 1 | - |
