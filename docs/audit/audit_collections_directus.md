# AUDIT — Collections Directus

> **Date** : 18 février 2026
> **Plateforme** : Directus Unified Platform v2.0.0
> **Directus** : 11.10.0 + PostgreSQL 15
> **Collections totales** : 83 collections · 100/105 relations

---

## 1. Collections principales peuplées

### 1.1 Entités de gestion d'entreprise

| Collection | Champs clés | Type données | Usage | État données |
|------------|-------------|-------------|-------|--------------|
| `owner_companies` | id, name, code, legal_name, address, iban, vat_number, logo | UUID, varchar, text | Les 5 entreprises du groupe HMF | ✅ 5 entrées (HMF Corporation, HYPERVISUAL, ETEKOUT, NK REALITY, LEXIA) |
| `companies` | id, name, type (client/supplier/partner), email, phone, address, website, owner_company | UUID, varchar, enum, FK | Entreprises clients/fournisseurs | ✅ Peuplée |
| `people` | id, first_name, last_name, email, phone, company_id, role, owner_company | UUID, varchar, FK | Personnes physiques (contacts, employés) | ✅ Peuplée |
| `contacts` | id, person_id, company_id, position, type, owner_company | UUID, FK, varchar | Relations contacts-entreprises | ✅ Peuplée |
| `clients` | id, company_id, contact_id, status, credit_limit, payment_terms, owner_company | UUID, FK, enum, decimal | Clients avec conditions commerciales | ✅ Peuplée |
| `suppliers` | id, company_id, contact_id, category, payment_terms, owner_company | UUID, FK, varchar | Fournisseurs | ✅ Peuplée |

### 1.2 Finance et facturation

| Collection | Champs clés | Type données | Usage | État données |
|------------|-------------|-------------|-------|--------------|
| `client_invoices` | id, invoice_number, client_id, date_issued, date_due, total_ht, total_ttc, tva_amount, tva_rate, status, owner_company | UUID, varchar, FK, date, decimal, enum | Factures clients (QR-Facture Swiss) | ✅ Peuplée |
| `supplier_invoices` | id, invoice_number, supplier_id, date_received, date_due, total_ht, total_ttc, status, approval_status, owner_company | UUID, varchar, FK, date, decimal, enum | Factures fournisseurs | ✅ Peuplée |
| `payments` | id, invoice_id, amount, date, method, reference, status, owner_company | UUID, FK, decimal, date, enum | Paiements reçus/émis | ✅ Peuplée |
| `bank_transactions` | id, account_id, date, amount, currency, counterparty, reference, reconciled, owner_company | UUID, FK, date, decimal, varchar, boolean | Transactions bancaires (sync Revolut) | ✅ Peuplée |
| `bank_accounts` | id, name, iban, bic, bank_name, currency, balance, owner_company | UUID, varchar, decimal | Comptes bancaires (5 entreprises × N comptes) | ✅ Peuplée |
| `expenses` | id, description, amount, date, category, vendor, receipt_url, status, owner_company | UUID, varchar, decimal, date, enum | Charges et dépenses | ⚠️ Partiellement peuplée |
| `revenues` | id, description, amount, date, category, client_id, owner_company | UUID, varchar, decimal, date, FK | Revenus | ⚠️ Partiellement peuplée |
| `quotes` | id, quote_number, client_id, contact_id, items, total_ht, total_ttc, tva_rate, status, valid_until, owner_company | UUID, varchar, FK, JSON, decimal, enum, date | Devis (workflow commercial) | ✅ Peuplée |
| `budgets` | id, name, amount, period_start, period_end, category, spent, remaining, owner_company | UUID, varchar, decimal, date, enum | Budgets par catégorie | ⚠️ Structure créée, peu de données |
| `dashboard_kpis` | id, company_code, metric_name, value, period, date_calculated | UUID, varchar, decimal, date | KPIs pré-calculés | ✅ Peuplée |

### 1.3 Commercial et CRM

| Collection | Champs clés | Type données | Usage | État données |
|------------|-------------|-------------|-------|--------------|
| `leads` | id, name, email, phone, company_name, source, status, score, assigned_to, owner_company | UUID, varchar, enum, integer, FK | Gestion des prospects | ✅ Peuplée |
| `opportunities` | id, lead_id, name, value, probability, stage, close_date, owner_company | UUID, FK, varchar, decimal, integer, enum, date | Opportunités commerciales | ⚠️ Structure créée |
| `projects` | id, name, client_id, status, start_date, end_date, budget, progress, owner_company | UUID, varchar, FK, enum, date, decimal, integer | Projets (100+ entrées) | ✅ Peuplée |
| `deliverables` | id, project_id, name, description, status, due_date, assigned_to, owner_company | UUID, FK, varchar, enum, date | Livrables de projets (100+ entrées) | ✅ Peuplée |
| `products` | id, name, description, price, currency, category, sku, tva_rate, active, owner_company | UUID, varchar, text, decimal, enum, boolean | Catalogue produits/services | ✅ Peuplée |
| `services` | id, name, description, hourly_rate, category, owner_company | UUID, varchar, text, decimal | Services facturables | ✅ Peuplée |
| `support_tickets` | id, subject, description, priority, status, client_id, assigned_to, owner_company | UUID, varchar, text, enum, FK | Tickets support | ⚠️ Structure créée, peu de données |

### 1.4 Juridique et signatures

| Collection | Champs clés | Type données | Usage | État données |
|------------|-------------|-------------|-------|--------------|
| `cgv` | id, owner_company_id, type (CGV/CGL), version, content, status, created_date | UUID, FK, enum, varchar, text, enum, date | Conditions générales versionnées | ✅ Peuplée |
| `cgv_acceptances` | id, cgv_id, contact_id, accepted_at, ip_address, method | UUID, FK, datetime, varchar, enum | Historique acceptations CGV | ✅ Peuplée |
| `signature_logs` | id, document_type, document_id, signer_email, status, provider, submission_id, signed_at | UUID, enum, FK, varchar, enum, varchar, datetime | Journal des signatures électroniques | ✅ Peuplée |
| `signature_requests` | id, quote_id, status, provider, submission_id, requested_at, completed_at | UUID, FK, enum, varchar, datetime | Demandes de signatures | ✅ Peuplée |

### 1.5 Recouvrement

| Collection | Champs clés | Type données | Usage | État données |
|------------|-------------|-------------|-------|--------------|
| `collection_tracking` | id, invoice_id, status, level, amount_due, amount_paid, interest_amount, last_action_date, owner_company | UUID, FK, enum, integer, decimal, date | Suivi recouvrement | ✅ Peuplée |
| `collection_actions` | id, tracking_id, action_type, date, notes, result | UUID, FK, enum, datetime, text | Actions de recouvrement | ✅ Peuplée |
| `lp_cases` | id, tracking_id, case_number, status, amount, fees, canton, owner_company | UUID, FK, varchar, enum, decimal | Poursuites LP | ⚠️ Structure créée |

---

## 2. Collections vides ou à peupler

| Collection | Champs | Usage prévu | Priorité |
|------------|--------|-------------|----------|
| `campaigns` | id, name, type, status, start_date, end_date, budget, owner_company | Campagnes marketing (→ Mautic) | Haute |
| `leads` (enrichissement) | scoring_history, conversion_path | Données avancées leads | Moyenne |
| `contracts` | id, title, type, parties, start_date, end_date, value, status, owner_company | Contrats de travail/commerciaux | Haute |
| `salaries` | id, employee_id, amount, currency, period, owner_company | Gestion salariale | Moyenne |
| `leaves` | id, employee_id, type, start_date, end_date, status, owner_company | Gestion des congés | Basse |
| `trainings` | id, title, type, employee_id, date, status, owner_company | Formation RH | Basse |
| `newsletters` | id, subject, content, status, sent_date, owner_company | Newsletters (→ Mautic) | Basse |
| `emails` | id, subject, from, to, body, status, sent_at, owner_company | Historique emails | Basse |
| `time_tracking` | id, project_id, user_id, date, hours, description, owner_company | Suivi temps | Haute |

---

## 3. Collections système Directus

| Collection | Usage |
|------------|-------|
| `directus_users` | Utilisateurs Directus (admin, API) |
| `directus_roles` | Rôles et niveaux d'accès |
| `directus_permissions` | Permissions granulaires CRUD par collection |
| `directus_files` | Fichiers uploadés |
| `directus_folders` | Organisation des fichiers |
| `directus_activity` | Journal d'audit Directus |
| `directus_revisions` | Historique des modifications |
| `directus_webhooks` | Webhooks configurés |
| `directus_flows` | Flows d'automatisation |
| `directus_operations` | Opérations des flows |
| `directus_panels` | Tableaux de bord Directus |
| `directus_dashboards` | Configuration dashboards |
| `directus_notifications` | Notifications internes |
| `directus_settings` | Configuration globale |
| `directus_presets` | Préréglages de vues |
| `directus_relations` | Définitions des relations |
| `directus_migrations` | Migrations appliquées |
| `directus_sessions` | Sessions actives |

---

## 4. Champs récurrents (conventions)

Toutes les collections métier partagent ces champs standards :

| Champ | Type | Présence | Usage |
|-------|------|----------|-------|
| `id` | UUID | 100% | Identifiant primaire |
| `owner_company` | FK → owner_companies | ~95% | Filtrage multi-entreprise |
| `status` | enum | ~80% | État de l'enregistrement |
| `date_created` | datetime | ~90% | Auto-généré par Directus |
| `date_updated` | datetime | ~90% | Auto-généré par Directus |
| `user_created` | FK → directus_users | ~70% | Traçabilité |
| `user_updated` | FK → directus_users | ~70% | Traçabilité |

---

## 5. Volumétrie observée

| Collection | Volume estimé | Source |
|------------|--------------|--------|
| `owner_companies` | 5 | Fixe |
| `companies` | 50-200 | Production |
| `people` / `contacts` | 100-500 | Production |
| `projects` | 100+ | Production |
| `deliverables` | 100+ | Production |
| `client_invoices` | 50-500 | Production |
| `bank_transactions` | 1000+ | Sync Revolut |
| `leads` | 50-200 | Production |
| `quotes` | 30-100 | Production |
| `dashboard_kpis` | 50+ | Calculé |

> **Note** : Les volumes exacts nécessitent un accès direct à la base PostgreSQL ou via l'API Directus.
> L'estimation est basée sur l'analyse du code, des seeds, et du backup SQL (9.7 MB).
