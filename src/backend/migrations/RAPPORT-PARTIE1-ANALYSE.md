# RAPPORT PARTIE 1: ANALYSE DE L'ÉTAT ACTUEL DIRECTUS

**Date**: 15 Décembre 2025
**Directus URL**: http://localhost:8055
**Token**: hbQz-9935crJ2YkLul_zpQJDBw2M-y5v

---

## 1. COLLECTIONS À CRÉER (N'existent pas)

| Collection | Description | Priorité |
|------------|-------------|----------|
| `cgv_versions` | Versioning des Conditions Générales de Vente | CRITIQUE |
| `cgv_acceptances` | Enregistrement acceptations CGV (preuve légale) | CRITIQUE |
| `signature_logs` | Logs signatures électroniques DocuSeal | CRITIQUE |
| `deposit_configs` | Configuration % acomptes par entreprise/type projet | HAUTE |
| `client_portal_accounts` | Comptes d'accès au portail client | HAUTE |

---

## 2. COLLECTIONS EXISTANTES À MODIFIER

### 2.1 Collection `quotes` - MODIFICATIONS MAJEURES REQUISES

**État actuel (7 champs seulement):**
- id, created_at, updated_at, name, description, status, owner_company

**Champs à AJOUTER (25+ champs):**
- `quote_number` - Numérotation automatique DEV-YYYY-XXXX
- `lead_id` - Lien vers lead source
- `contact_id` - Contact principal (REQUIS)
- `company_id` - Entreprise cliente
- `owner_company_id` - Notre entreprise (UUID relation)
- `project_type` - Type de projet (web_design, ai_project, etc.)
- `subtotal`, `tax_rate`, `tax_amount`, `total` - Montants
- `currency` - CHF/EUR/USD
- `sent_at`, `viewed_at`, `signed_at`, `valid_until` - Dates workflow
- `is_signed`, `cgv_accepted` - Flags boolean
- `cgv_version_id`, `cgv_acceptance_id` - Relations CGV
- `deposit_percentage`, `deposit_amount`, `deposit_invoice_id` - Acompte
- `deposit_paid`, `deposit_paid_at` - Statut paiement acompte

**Statuts workflow à implémenter:**
- draft → sent → viewed → signed → awaiting_deposit → completed
- + expired, rejected

---

## 3. COLLECTIONS EXISTANTES OK (Utilisables)

### 3.1 `leads` (29 champs)
- Bien structurée avec: company_name, email, phone, status, score
- Champs conversion OK: converted_at
- **Action**: Aucune modification requise

### 3.2 `people` (14 champs)
- Contacts: first_name, last_name, email, phone
- Relations: company_id, owner_company
- **Action**: Possibilité d'ajouter champ `portal_account_id`

### 3.3 `projects` (14 champs)
- Projets: name, description, status, budget
- Relations: client_id, company_id, owner_company
- Dates: start_date, end_date
- **Action**: Ajouter `quote_id` pour traçabilité

### 3.4 `client_invoices` (11 champs)
- Factures: invoice_number, amount, status
- Relations: contact_id, company_id, project_id
- **Action**: Ajouter `quote_id`, `is_deposit`, `payment_date`

### 3.5 `owner_companies` (8 champs)
- 5 entreprises configurées:
  - HYPERVISUAL (id: 2d6b906a...)
  - DAINAMICS (id: 55483d07...)
  - ENKI REALTY (id: 6f4bc42a...)
  - LEXAIA (id: 9314fda4...)
  - TAKEOUT (id: a1313adf...)
- **Action**: Aucune modification requise

---

## 4. DONNÉES EXISTANTES

| Collection | Nombre d'éléments |
|------------|-------------------|
| leads | 60+ |
| people | 784+ |
| companies | 232+ |
| quotes | 50+ (basiques) |
| projects | Variable |
| client_invoices | Variable |

---

## 5. PLAN D'ACTIONS PARTIE 2

### Étape 1: Créer nouvelles collections
1. `cgv_versions` avec relations owner_companies
2. `cgv_acceptances` avec relations people, companies, quotes
3. `signature_logs` avec relations quotes, people
4. `deposit_configs` avec relations owner_companies
5. `client_portal_accounts` avec relations people, companies

### Étape 2: Modifier collection quotes
1. Ajouter tous les champs manquants
2. Créer relations vers nouvelles collections
3. Migrer données existantes si applicable

### Étape 3: Modifier collections existantes
1. `projects`: Ajouter quote_id
2. `client_invoices`: Ajouter quote_id, is_deposit
3. `people`: Ajouter portal_account_id (optionnel)

---

## 6. RISQUES IDENTIFIÉS

1. **Migration données quotes**: Les quotes existants n'ont que des champs basiques
   - **Mitigation**: Conserver les données, nouveaux champs nullable ou avec defaults

2. **Relations owner_company**: Actuellement string "HYPERVISUAL", doit devenir UUID
   - **Mitigation**: Script de migration pour convertir string → UUID

3. **CGV legacy**: Pas de versioning actuel
   - **Mitigation**: Créer version initiale "1.0" pour chaque entreprise

---

**Statut**: ANALYSE COMPLÉTÉE ✅
**Prêt pour**: PARTIE 2 - Création des collections
