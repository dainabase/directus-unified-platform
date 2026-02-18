# AUDIT — Cartographie des Relations

> **Date** : 18 février 2026
> **Relations configurées** : 100/105 (95%)
> **Types** : Many-to-One (M2O), One-to-Many (O2M), Many-to-Many (M2M)

---

## 1. Hub central : `owner_companies`

Toutes les collections métier ont une relation **M2O** vers `owner_companies` pour le filtrage multi-entreprise.

```
owner_companies (5 entrées)
├── M2O ← companies.owner_company
├── M2O ← people.owner_company
├── M2O ← contacts.owner_company
├── M2O ← clients.owner_company
├── M2O ← suppliers.owner_company
├── M2O ← projects.owner_company
├── M2O ← deliverables.owner_company
├── M2O ← client_invoices.owner_company
├── M2O ← supplier_invoices.owner_company
├── M2O ← payments.owner_company
├── M2O ← bank_transactions.owner_company
├── M2O ← bank_accounts.owner_company
├── M2O ← expenses.owner_company
├── M2O ← revenues.owner_company
├── M2O ← quotes.owner_company
├── M2O ← leads.owner_company
├── M2O ← opportunities.owner_company
├── M2O ← products.owner_company
├── M2O ← services.owner_company
├── M2O ← support_tickets.owner_company
├── M2O ← collection_tracking.owner_company
├── M2O ← cgv.owner_company_id
├── M2O ← budgets.owner_company
├── M2O ← lp_cases.owner_company
└── M2O ← contracts.owner_company
```

---

## 2. Graphe des relations métier

### 2.1 Chaîne commerciale (Workflow principal)

```
leads ──[conversion]──→ opportunities ──[qualification]──→ quotes
                                                            │
                                                    ┌───────┴───────┐
                                                    │               │
                                              cgv_acceptances  signature_requests
                                                    │               │
                                                    └───────┬───────┘
                                                            │
                                                      [acceptation]
                                                            │
                                                      client_invoices
                                                            │
                                                    ┌───────┴───────┐
                                                    │               │
                                                payments    collection_tracking
                                                                    │
                                                            collection_actions
                                                                    │
                                                               lp_cases
```

### 2.2 Relations entreprises-personnes

```
companies ─── M2O ─── owner_companies
    │
    ├── O2M → contacts (company_id)
    ├── O2M → clients (company_id)
    └── O2M → suppliers (company_id)

people ─── M2O ─── owner_companies
    │
    ├── O2M → contacts (person_id)
    └── M2O → companies (company_id)

contacts = junction table (people ↔ companies)
    │
    ├── M2O → people (person_id)
    ├── M2O → companies (company_id)
    ├── O2M → quotes (contact_id)
    ├── O2M → cgv_acceptances (contact_id)
    └── O2M → signature_logs (signer)
```

### 2.3 Relations financières

```
client_invoices
    ├── M2O → clients (client_id)
    ├── M2O → quotes (quote_id)
    ├── M2O → owner_companies (owner_company)
    ├── O2M → payments (invoice_id)
    ├── O2M → collection_tracking (invoice_id)
    └── O2M → bank_transactions [via reconciliation]

supplier_invoices
    ├── M2O → suppliers (supplier_id)
    ├── M2O → owner_companies (owner_company)
    └── O2M → payments (invoice_id)

bank_accounts
    ├── M2O → owner_companies (owner_company)
    └── O2M → bank_transactions (account_id)

bank_transactions
    ├── M2O → bank_accounts (account_id)
    └── M2O → client_invoices [via reconciliation match]
```

### 2.4 Relations projets

```
projects
    ├── M2O → clients (client_id)
    ├── M2O → owner_companies (owner_company)
    ├── O2M → deliverables (project_id)
    └── O2M → time_tracking (project_id)

deliverables
    ├── M2O → projects (project_id)
    └── M2O → people (assigned_to)
```

### 2.5 Relations juridiques

```
cgv
    ├── M2O → owner_companies (owner_company_id)
    └── O2M → cgv_acceptances (cgv_id)

cgv_acceptances
    ├── M2O → cgv (cgv_id)
    └── M2O → contacts (contact_id)

signature_requests
    ├── M2O → quotes (quote_id)
    └── O2M → signature_logs (request_id)

signature_logs
    ├── M2O → signature_requests
    └── polymorphique → document_type + document_id
```

### 2.6 Relations recouvrement

```
collection_tracking
    ├── M2O → client_invoices (invoice_id)
    ├── M2O → owner_companies (owner_company)
    ├── O2M → collection_actions (tracking_id)
    └── O2M → lp_cases (tracking_id)

lp_cases
    └── M2O → collection_tracking (tracking_id)
```

---

## 3. Collections centrales (hubs) vs périphériques

### Hubs (≥5 relations entrantes/sortantes)

| Collection | Relations | Rôle |
|------------|-----------|------|
| `owner_companies` | 25+ M2O entrantes | Hub absolu — filtre global |
| `companies` | 8+ relations | Hub entreprises |
| `contacts` | 6+ relations | Hub personnes |
| `client_invoices` | 6+ relations | Hub financier |
| `projects` | 5+ relations | Hub projets |
| `quotes` | 5+ relations | Hub commercial |

### Périphériques (1-2 relations)

| Collection | Relations | Rôle |
|------------|-----------|------|
| `dashboard_kpis` | 1 (owner_company) | Lecture seule |
| `newsletters` | 1 (owner_company) | Pas encore utilisée |
| `emails` | 1-2 | Pas encore utilisée |
| `trainings` | 2 (employee, owner_company) | Pas encore utilisée |
| `leaves` | 2 (employee, owner_company) | Pas encore utilisée |

---

## 4. Relations manquantes ou incohérentes identifiées

### 4.1 Relations manquantes critiques

| De | Vers | Type | Impact |
|----|------|------|--------|
| `leads` → `contacts` | Conversion lead→contact | M2O | Le workflow convertit un lead en contact mais pas de FK directe |
| `opportunities` → `quotes` | Opportunité→Devis | M2O | Pas de lien direct dans le schéma Directus |
| `time_tracking` → `people` | Assignation | M2O | Le suivi temps ne référence pas le collaborateur |
| `expenses` → `supplier_invoices` | Rattachement | M2O | Charges non liées aux factures fournisseurs |
| `revenues` → `client_invoices` | Rattachement | M2O | Revenus non liés aux factures clients |
| `products` → `quotes` (items) | Produits dans devis | M2M | Les items du devis sont en JSON, pas en relation |

### 4.2 Incohérences observées

| Problème | Description | Recommandation |
|----------|-------------|----------------|
| `contacts` vs `people` | Deux collections pour les personnes — rôle ambigu | Clarifier : `people` = entités, `contacts` = relations |
| `clients` vs `companies` | `clients` est un sous-ensemble de `companies` avec type=client | Envisager une vue filtrée plutôt qu'une collection séparée |
| Items devis en JSON | Les lignes de devis sont stockées en JSON dans `quotes.items` | Créer `quote_items` en collection séparée pour requêtes |
| Polymorphisme signatures | `signature_logs` utilise document_type+document_id | Créer des FK explicites par type de document |

### 4.3 Relations à 5/105 non configurées

5 relations sur 105 ne sont pas encore configurées dans Directus. Basé sur l'analyse du code, il s'agit probablement de :

1. `opportunities` ↔ `leads` (conversion)
2. `time_tracking` ↔ `deliverables` (rattachement)
3. `campaigns` ↔ `leads` (source)
4. `contracts` ↔ `companies` (parties)
5. `budgets` ↔ `projects` (allocation)

---

## 5. Diagramme de dépendance simplifié

```
                          ┌─────────────────┐
                          │ owner_companies  │
                          │   (5 entrées)    │
                          └────────┬─────────┘
                                   │ M2O (25+ collections)
                    ┌──────────────┼──────────────┐
                    │              │              │
              ┌─────┴─────┐ ┌─────┴─────┐ ┌─────┴─────┐
              │ companies  │ │  people    │ │ bank_accts│
              └─────┬─────┘ └─────┬─────┘ └─────┬─────┘
                    │              │              │
              ┌─────┴─────┐ ┌─────┴─────┐ ┌─────┴──────┐
              │  clients   │ │ contacts   │ │ bank_trans │
              │ suppliers  │ └─────┬─────┘ └─────┬──────┘
              └─────┬─────┘       │              │
                    │       ┌─────┴─────┐        │
              ┌─────┴─────┐ │   quotes   │  [reconciliation]
              │  invoices  │ └─────┬─────┘        │
              │ (cli/sup)  │       │              │
              └─────┬─────┘ ┌─────┴─────┐        │
                    │       │ signatures │        │
              ┌─────┴─────┐ │ cgv_accept │        │
              │ payments   │ └───────────┘        │
              └─────┬─────┘                       │
                    │                             │
              ┌─────┴──────────┐                  │
              │ collection_    │──────────────────┘
              │ tracking       │
              └─────┬──────────┘
                    │
              ┌─────┴─────┐
              │ lp_cases   │
              └────────────┘
```

---

## 6. Recommandations

1. **Compléter les 5 relations manquantes** dans Directus Admin
2. **Créer `quote_items`** comme collection séparée (normalisation)
3. **Ajouter `time_tracking` ↔ `people`** pour le suivi collaborateur
4. **Résoudre l'ambiguïté `people`/`contacts`** avec documentation claire
5. **Indexer les FK** les plus utilisées pour la performance (owner_company, client_id, invoice_id)
