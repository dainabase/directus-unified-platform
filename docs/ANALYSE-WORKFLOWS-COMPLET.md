# ANALYSE COMPLÈTE DES WORKFLOWS MÉTIER
## Vérification Accessibilité Frontend - Directus Unified Platform

---

## 🎯 OBJECTIF
Documenter TOUS les scénarios d'utilisation et vérifier que chaque action est accessible via le frontend.

---

# PARTIE 1 : WORKFLOWS CLIENTS & VENTES

## 1.1 WORKFLOW : NOUVEAU CLIENT

### Scénario complet
```
1. Création contact/prospect
2. Qualification (lead scoring)
3. Conversion en client
4. Création compte client complet
5. Association à une entreprise (B2B) ou particulier (B2C)
```

### Actions nécessaires

| Action | Collection Directus | Endpoint API | Composant Frontend | Statut |
|--------|---------------------|--------------|-------------------|--------|
| Créer contact | `contacts` (people) | POST /items/contacts | ContactForm.jsx | ❌ MANQUANT |
| Lister contacts | `contacts` | GET /items/contacts | ContactsList.jsx | ❌ MANQUANT |
| Modifier contact | `contacts` | PATCH /items/contacts/:id | ContactForm.jsx | ❌ MANQUANT |
| Supprimer contact | `contacts` | DELETE /items/contacts/:id | ContactsList.jsx | ❌ MANQUANT |
| Créer entreprise client | `companies` | POST /items/companies | CompanyForm.jsx | ❌ MANQUANT |
| Lister entreprises | `companies` | GET /items/companies | CompaniesList.jsx | ❌ MANQUANT |
| Modifier entreprise | `companies` | PATCH /items/companies/:id | CompanyForm.jsx | ❌ MANQUANT |
| Associer contact ↔ entreprise | `company_contacts` | POST /items/company_contacts | - | ❌ MANQUANT |
| Définir type client | `contacts.client_type` | PATCH | ContactForm.jsx | ❌ MANQUANT |
| Ajouter adresse | `addresses` | POST /items/addresses | AddressForm.jsx | ❌ MANQUANT |
| Modifier adresse | `addresses` | PATCH /items/addresses/:id | AddressForm.jsx | ❌ MANQUANT |
| Ajouter coordonnées bancaires | `bank_accounts` | POST /items/bank_accounts | BankAccountForm.jsx | ❌ MANQUANT |

### Champs obligatoires - Contact
```javascript
{
  // Identification
  first_name: string,        // Prénom *
  last_name: string,         // Nom *
  email: string,             // Email *
  phone: string,             // Téléphone
  mobile: string,            // Mobile
  
  // Type
  type: enum['prospect', 'client', 'supplier', 'partner', 'other'],
  client_type: enum['B2B', 'B2C'],
  
  // Adresse
  address_line1: string,
  address_line2: string,
  postal_code: string,
  city: string,
  canton: string,            // Pour Suisse
  country: string,           // Default: 'CH'
  
  // Business
  company_id: uuid,          // Relation entreprise
  position: string,          // Fonction
  department: string,
  
  // Légal
  accepts_marketing: boolean,
  cgv_accepted: boolean,
  cgv_accepted_date: datetime,
  cgv_version: string,
  
  // Facturation
  default_payment_terms: number,  // Jours
  credit_limit: decimal,
  tax_exempt: boolean,
  vat_number: string,        // CHE-XXX.XXX.XXX TVA
  
  // Metadata
  source: string,            // D'où vient le contact
  tags: json,
  notes: text
}
```

### Champs obligatoires - Entreprise
```javascript
{
  // Identification
  name: string,              // Raison sociale *
  legal_form: enum['SA', 'Sàrl', 'RI', 'Association', 'Fondation', 'Autre'],
  ide_number: string,        // CHE-XXX.XXX.XXX
  vat_number: string,        // CHE-XXX.XXX.XXX TVA
  
  // Adresse siège
  address_line1: string,
  address_line2: string,
  postal_code: string,
  city: string,
  canton: string,
  country: string,
  
  // Contact principal
  main_contact_id: uuid,
  phone: string,
  email: string,
  website: string,
  
  // Facturation
  billing_address_id: uuid,
  default_payment_terms: number,
  credit_limit: decimal,
  currency: enum['CHF', 'EUR', 'USD'],
  
  // Classification
  industry: string,
  size: enum['TPE', 'PME', 'ETI', 'GE'],
  type: enum['client', 'supplier', 'both', 'prospect'],
  
  // Metadata
  notes: text,
  tags: json
}
```

---

## 1.2 WORKFLOW : CRÉATION DEVIS

### Scénario complet
```
1. Sélectionner client existant OU créer nouveau
2. Ajouter lignes de produits/services
3. Appliquer remises si nécessaire
4. Calculer TVA automatiquement
5. Prévisualiser
6. Envoyer au client (email/PDF)
7. Suivi: accepté, refusé, expiré
8. Conversion en facture si accepté
```

### Actions nécessaires

| Action | Collection | Endpoint API | Composant Frontend | Statut |
|--------|------------|--------------|-------------------|--------|
| Créer devis | `quotes` | POST /api/finance/quotes | QuoteForm.jsx | ❌ MANQUANT |
| Lister devis | `quotes` | GET /api/finance/quotes | QuotesList.jsx | ❌ MANQUANT |
| Modifier devis | `quotes` | PATCH /api/finance/quotes/:id | QuoteForm.jsx | ❌ MANQUANT |
| Dupliquer devis | `quotes` | POST /api/finance/quotes/:id/duplicate | QuotesList.jsx | ❌ MANQUANT |
| Supprimer devis | `quotes` | DELETE /api/finance/quotes/:id | QuotesList.jsx | ❌ MANQUANT |
| Ajouter ligne | `quote_items` | POST /api/finance/quotes/:id/items | QuoteItemForm.jsx | ❌ MANQUANT |
| Modifier ligne | `quote_items` | PATCH /api/finance/quote-items/:id | QuoteItemForm.jsx | ❌ MANQUANT |
| Supprimer ligne | `quote_items` | DELETE /api/finance/quote-items/:id | QuoteForm.jsx | ❌ MANQUANT |
| Générer PDF | - | GET /api/finance/quotes/:id/pdf | QuoteDetail.jsx | ✅ Existe |
| Envoyer email | - | POST /api/finance/quotes/:id/send | QuoteDetail.jsx | ❌ MANQUANT |
| Accepter devis | `quotes` | POST /api/finance/quotes/:id/accept | QuoteDetail.jsx | ❌ MANQUANT |
| Refuser devis | `quotes` | POST /api/finance/quotes/:id/reject | QuoteDetail.jsx | ❌ MANQUANT |
| Convertir en facture | - | POST /api/finance/quotes/:id/convert | QuoteDetail.jsx | ❌ MANQUANT |
| Voir historique | `quote_history` | GET /api/finance/quotes/:id/history | QuoteDetail.jsx | ❌ MANQUANT |

### Champs devis
```javascript
{
  // Identification
  quote_number: string,      // Auto-généré: DEV-2025-XXXXX
  reference: string,         // Référence client
  
  // Relations
  company_id: uuid,          // Notre entreprise (HYPERVISUAL, etc.)
  client_id: uuid,           // Contact client *
  client_company_id: uuid,   // Entreprise cliente
  project_id: uuid,          // Projet associé (optionnel)
  
  // Dates
  date: date,                // Date du devis *
  valid_until: date,         // Date d'expiration *
  
  // Montants (calculés automatiquement)
  subtotal: decimal,         // Total HT
  discount_amount: decimal,  // Montant remise
  discount_percent: decimal, // % remise
  tax_amount: decimal,       // Montant TVA
  total: decimal,            // Total TTC
  
  // TVA
  tax_rate: decimal,         // 8.1%, 2.6%, 3.8%, 0%
  tax_included: boolean,     // Prix TTC ou HT
  
  // Contenu
  title: string,             // Titre/Objet du devis
  introduction: text,        // Texte d'introduction
  terms: text,               // Conditions particulières
  notes: text,               // Notes internes
  
  // Statut
  status: enum['draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired', 'converted'],
  sent_at: datetime,
  viewed_at: datetime,
  accepted_at: datetime,
  rejected_at: datetime,
  rejection_reason: text,
  
  // Conversion
  converted_to_invoice_id: uuid,
  converted_at: datetime
}
```

### Champs ligne de devis
```javascript
{
  quote_id: uuid,            // Devis parent *
  
  // Produit/Service
  product_id: uuid,          // Produit catalogue (optionnel)
  description: text,         // Description *
  quantity: decimal,         // Quantité *
  unit: string,              // Unité (pièce, heure, forfait...)
  
  // Prix
  unit_price: decimal,       // Prix unitaire HT *
  discount_percent: decimal, // Remise ligne %
  discount_amount: decimal,  // Remise ligne CHF
  tax_rate: decimal,         // TVA ligne (si différent)
  
  // Calculés
  subtotal: decimal,         // quantity * unit_price - discount
  tax_amount: decimal,
  total: decimal,
  
  // Ordre
  sort_order: integer,       // Position dans la liste
  
  // Options
  is_optional: boolean,      // Ligne optionnelle
  is_selected: boolean       // Sélectionnée par client
}
```

---

## 1.3 WORKFLOW : FACTURATION CLIENT

### Scénario complet
```
1. Créer facture (manuelle ou depuis devis)
2. Ajouter lignes
3. Vérifier TVA et totaux
4. Générer QR-facture suisse
5. Envoyer au client
6. Suivi paiement
7. Rapprochement bancaire
8. Relances si impayé
```

### Actions nécessaires

| Action | Collection | Endpoint API | Composant Frontend | Statut |
|--------|------------|--------------|-------------------|--------|
| Créer facture | `client_invoices` | POST /api/finance/invoices | InvoiceForm.jsx | ❌ MANQUANT |
| Lister factures | `client_invoices` | GET /api/finance/invoices | InvoicesList.jsx | ✅ FinanceDashboard |
| Modifier facture | `client_invoices` | PATCH /api/finance/invoices/:id | InvoiceForm.jsx | ❌ MANQUANT |
| Supprimer facture | `client_invoices` | DELETE /api/finance/invoices/:id | InvoicesList.jsx | ❌ MANQUANT |
| Dupliquer facture | - | POST /api/finance/invoices/:id/duplicate | InvoicesList.jsx | ❌ MANQUANT |
| Générer PDF QR | - | GET /api/finance/invoices/:id/pdf | InvoiceDetail.jsx | ✅ Existe |
| Envoyer facture | - | POST /api/finance/invoices/:id/send | InvoiceDetail.jsx | ❌ MANQUANT |
| Marquer payée | `client_invoices` | POST /api/finance/invoices/:id/mark-paid | InvoiceDetail.jsx | ❌ MANQUANT |
| Annuler facture | `client_invoices` | POST /api/finance/invoices/:id/cancel | InvoiceDetail.jsx | ❌ MANQUANT |
| Créer avoir | - | POST /api/finance/invoices/:id/credit-note | InvoiceDetail.jsx | ❌ MANQUANT |
| Enregistrer paiement | `payments` | POST /api/finance/payments | PaymentForm.jsx | ❌ MANQUANT |
| Voir paiements | `payments` | GET /api/finance/invoices/:id/payments | InvoiceDetail.jsx | ❌ MANQUANT |

### Champs facture client
```javascript
{
  // Identification
  invoice_number: string,    // Auto: FAC-2025-XXXXX
  reference: string,         // Référence QR (26 car max)
  
  // Relations
  company_id: uuid,          // Notre entreprise *
  client_id: uuid,           // Contact client *
  client_company_id: uuid,
  quote_id: uuid,            // Devis source
  project_id: uuid,
  
  // Dates
  date: date,                // Date facture *
  due_date: date,            // Échéance *
  
  // Adresse facturation
  billing_name: string,
  billing_address: text,
  billing_postal_code: string,
  billing_city: string,
  billing_country: string,
  
  // Montants
  subtotal: decimal,
  discount_amount: decimal,
  tax_amount: decimal,
  total: decimal,
  amount_paid: decimal,
  amount_due: decimal,
  
  // TVA
  tax_rate: decimal,
  tax_number: string,        // Notre n° TVA
  
  // QR-Facture
  qr_iban: string,           // IBAN QR
  qr_reference: string,      // Référence QR
  qr_data: json,             // Données QR complètes
  
  // Statut
  status: enum['draft', 'sent', 'viewed', 'partial', 'paid', 'overdue', 'cancelled', 'written_off'],
  sent_at: datetime,
  paid_at: datetime,
  
  // Contenu
  title: string,
  notes: text,
  payment_instructions: text,
  footer: text
}
```

---

## 1.4 WORKFLOW : PAIEMENT & RAPPROCHEMENT

### Scénario complet
```
1. Réception paiement (virement, carte, etc.)
2. Import transactions bancaires (Revolut)
3. Matching automatique via QR-reference
4. Rapprochement manuel si nécessaire
5. Mise à jour statut facture
6. Écriture comptable
```

### Actions nécessaires

| Action | Collection | Endpoint API | Composant Frontend | Statut |
|--------|------------|--------------|-------------------|--------|
| Importer transactions | `bank_transactions` | POST /api/finance/bank/import | BankReconciliation.jsx | ❌ MANQUANT |
| Lister transactions | `bank_transactions` | GET /api/finance/bank/transactions | TransactionsList.jsx | ✅ Partiel |
| Matching auto | - | POST /api/finance/bank/reconcile | BankReconciliation.jsx | ✅ Service existe |
| Matching manuel | `bank_reconciliation` | POST /api/finance/bank/match | ReconciliationForm.jsx | ❌ MANQUANT |
| Créer paiement | `payments` | POST /api/finance/payments | PaymentForm.jsx | ❌ MANQUANT |
| Voir rapprochements | `bank_reconciliation` | GET /api/finance/bank/reconciled | ReconciliationList.jsx | ❌ MANQUANT |
| Rejeter matching | - | POST /api/finance/bank/unmatch | ReconciliationList.jsx | ❌ MANQUANT |

---

# PARTIE 2 : WORKFLOWS FOURNISSEURS & ACHATS

## 2.1 WORKFLOW : NOUVEAU FOURNISSEUR

### Scénario complet
```
1. Créer contact fournisseur
2. Enregistrer coordonnées bancaires
3. Définir conditions de paiement
4. Catégoriser (type de produits/services)
```

### Actions nécessaires

| Action | Collection | Endpoint API | Composant Frontend | Statut |
|--------|------------|--------------|-------------------|--------|
| Créer fournisseur | `contacts` (type=supplier) | POST /items/contacts | SupplierForm.jsx | ❌ MANQUANT |
| Lister fournisseurs | `contacts` | GET /items/contacts?filter[type]=supplier | SuppliersList.jsx | ❌ MANQUANT |
| Modifier fournisseur | `contacts` | PATCH /items/contacts/:id | SupplierForm.jsx | ❌ MANQUANT |
| Ajouter IBAN | `bank_accounts` | POST /items/bank_accounts | BankAccountForm.jsx | ❌ MANQUANT |
| Voir historique achats | `supplier_invoices` | GET /api/finance/supplier-invoices | SupplierDetail.jsx | ❌ MANQUANT |

---

## 2.2 WORKFLOW : FACTURE FOURNISSEUR

### Scénario complet
```
1. Réception facture (scan/email/courrier)
2. OCR automatique (extraction données)
3. Vérification/correction données
4. Validation
5. Planification paiement
6. Paiement via Revolut
7. Archivage 10 ans
```

### Actions nécessaires

| Action | Collection | Endpoint API | Composant Frontend | Statut |
|--------|------------|--------------|-------------------|--------|
| Upload facture | - | POST /api/finance/supplier-invoices/upload | SupplierInvoiceUpload.jsx | ❌ MANQUANT |
| OCR extraction | - | POST /api/ocr/process | OCRPreview.jsx | ✅ Service existe |
| Créer facture fournisseur | `supplier_invoices` | POST /api/finance/supplier-invoices | SupplierInvoiceForm.jsx | ❌ MANQUANT |
| Lister factures | `supplier_invoices` | GET /api/finance/supplier-invoices | SupplierInvoicesList.jsx | ❌ MANQUANT |
| Modifier facture | `supplier_invoices` | PATCH /api/finance/supplier-invoices/:id | SupplierInvoiceForm.jsx | ❌ MANQUANT |
| Valider facture | `supplier_invoices` | POST /api/finance/supplier-invoices/:id/validate | SupplierInvoiceDetail.jsx | ❌ MANQUANT |
| Rejeter facture | `supplier_invoices` | POST /api/finance/supplier-invoices/:id/reject | SupplierInvoiceDetail.jsx | ❌ MANQUANT |
| Planifier paiement | `payment_schedules` | POST /api/finance/payment-schedules | PaymentScheduler.jsx | ❌ MANQUANT |
| Payer via Revolut | - | POST /api/revolut/payments | PaymentExecution.jsx | ❌ MANQUANT |
| Marquer payée | `supplier_invoices` | POST /api/finance/supplier-invoices/:id/mark-paid | - | ❌ MANQUANT |
| Voir document | `directus_files` | GET /assets/:id | DocumentViewer.jsx | ❌ MANQUANT |

### Champs facture fournisseur
```javascript
{
  // Identification
  invoice_number: string,    // Numéro fournisseur
  internal_ref: string,      // Notre référence: FOUR-2025-XXXXX
  
  // Relations
  company_id: uuid,          // Notre entreprise *
  supplier_id: uuid,         // Fournisseur *
  supplier_company_id: uuid,
  
  // Document original
  document_id: uuid,         // Fichier scanné
  ocr_data: json,            // Données OCR brutes
  ocr_confidence: decimal,   // Score confiance OCR
  
  // Dates
  date: date,                // Date facture *
  due_date: date,            // Échéance *
  received_date: date,       // Date réception
  
  // Montants
  subtotal: decimal,
  tax_amount: decimal,
  total: decimal,            // Total TTC *
  currency: string,          // CHF, EUR, USD
  exchange_rate: decimal,    // Si devise étrangère
  total_chf: decimal,        // Converti en CHF
  
  // TVA
  tax_rate: decimal,
  supplier_vat_number: string,
  
  // Catégorie
  expense_category: string,  // Catégorie dépense
  cost_center: string,       // Centre de coût
  project_id: uuid,          // Projet associé
  
  // Statut
  status: enum['pending_ocr', 'pending_validation', 'validated', 'rejected', 'scheduled', 'paid', 'cancelled'],
  validated_by: uuid,
  validated_at: datetime,
  
  // Paiement
  payment_status: enum['unpaid', 'scheduled', 'partial', 'paid'],
  payment_date: date,
  payment_reference: string,
  
  // Notes
  notes: text,
  rejection_reason: text
}
```

---

# PARTIE 3 : WORKFLOWS LÉGAL & CONFORMITÉ

## 3.1 WORKFLOW : CGV/CGL

### Scénario complet
```
1. Créer/Modifier CGV
2. Valider clauses obligatoires (checklist)
3. Versionner
4. Activer nouvelle version
5. Archiver anciennes versions
6. Enregistrer acceptations clients
```

### Actions (Prompt 11 - à implémenter)
✅ Couvert par LegalDashboard.jsx

---

## 3.2 WORKFLOW : SIGNATURE ÉLECTRONIQUE

### Scénario complet
```
1. Sélectionner document
2. Choisir niveau signature (SES/AES/QES)
3. Envoyer demande
4. Suivi statut
5. Archivage document signé
```

### Actions (Prompt 11 - à implémenter)
✅ Couvert par SignatureRequests.jsx

---

## 3.3 WORKFLOW : RECOUVREMENT

### Scénario complet
```
1. Facture échue → workflow auto
2. J+10: Rappel 1 (gratuit)
3. J+25: Rappel 2 (CHF 20)
4. J+40: Mise en demeure (CHF 30)
5. J+55: Poursuite LP
6. Suivi commandement de payer
7. Mainlevée si opposition
```

### Actions (Prompt 11 - à implémenter)
✅ Couvert par CollectionDashboard.jsx

---

# PARTIE 4 : WORKFLOWS PROJETS & LIVRABLES

## 4.1 WORKFLOW : NOUVEAU PROJET

### Scénario complet
```
1. Créer projet depuis devis accepté ou manuellement
2. Définir équipe (responsable, membres)
3. Créer livrables/tâches
4. Planifier jalons
5. Suivi temps passé
6. Facturation progressive ou finale
```

### Actions nécessaires

| Action | Collection | Endpoint API | Composant Frontend | Statut |
|--------|------------|--------------|-------------------|--------|
| Créer projet | `projects` | POST /items/projects | ProjectForm.jsx | ❌ MANQUANT |
| Lister projets | `projects` | GET /items/projects | ProjectsList.jsx | ❌ MANQUANT |
| Modifier projet | `projects` | PATCH /items/projects/:id | ProjectForm.jsx | ❌ MANQUANT |
| Archiver projet | `projects` | PATCH /items/projects/:id | ProjectsList.jsx | ❌ MANQUANT |
| Assigner équipe | `project_members` | POST /items/project_members | ProjectTeam.jsx | ❌ MANQUANT |
| Créer livrable | `deliverables` | POST /items/deliverables | DeliverableForm.jsx | ❌ MANQUANT |
| Modifier livrable | `deliverables` | PATCH /items/deliverables/:id | DeliverableForm.jsx | ❌ MANQUANT |
| Changer statut | `deliverables` | PATCH /items/deliverables/:id | KanbanBoard.jsx | ❌ MANQUANT |
| Logger temps | `time_entries` | POST /items/time_entries | TimeTracker.jsx | ❌ MANQUANT |
| Voir temps projet | `time_entries` | GET /items/time_entries | ProjectDetail.jsx | ❌ MANQUANT |
| Facturer projet | - | POST /api/finance/projects/:id/invoice | ProjectDetail.jsx | ❌ MANQUANT |

---

# PARTIE 5 : CONFIGURATION & ADMINISTRATION

## 5.1 CONFIGURATION ENTREPRISE

### Actions nécessaires

| Action | Collection | Endpoint API | Composant Frontend | Statut |
|--------|------------|--------------|-------------------|--------|
| Modifier infos entreprise | `our_companies` | PATCH /items/our_companies/:id | CompanySettings.jsx | ❌ MANQUANT |
| Modifier logo | `our_companies` | PATCH + upload | CompanySettings.jsx | ❌ MANQUANT |
| Config facturation | `invoice_settings` | PATCH /items/invoice_settings | InvoiceSettings.jsx | ❌ MANQUANT |
| Config numérotation | `invoice_settings` | PATCH | InvoiceSettings.jsx | ❌ MANQUANT |
| Config QR-facture | `qr_settings` | PATCH /items/qr_settings | QRSettings.jsx | ❌ MANQUANT |
| Config TVA | `tax_rates` | CRUD /items/tax_rates | TaxSettings.jsx | ❌ MANQUANT |
| Config recouvrement | - | PATCH /api/collection/config | WorkflowConfig.jsx | ✅ Prompt 11 |
| Templates emails | `email_templates` | CRUD /items/email_templates | EmailTemplates.jsx | ❌ MANQUANT |
| Templates PDF | `pdf_templates` | CRUD /items/pdf_templates | PDFTemplates.jsx | ❌ MANQUANT |

### Champs configuration entreprise
```javascript
{
  // Identité
  name: string,              // Raison sociale *
  legal_form: string,
  ide_number: string,        // CHE-XXX.XXX.XXX
  vat_number: string,        // CHE-XXX.XXX.XXX TVA
  
  // Adresse
  address_line1: string,
  address_line2: string,
  postal_code: string,
  city: string,
  canton: string,
  country: string,
  
  // Contact
  phone: string,
  email: string,
  website: string,
  
  // Logo & Branding
  logo_id: uuid,             // Fichier logo
  primary_color: string,     // Couleur principale
  secondary_color: string,
  
  // Bancaire
  bank_name: string,
  iban: string,              // IBAN standard
  qr_iban: string,           // IBAN QR
  bic: string,
  
  // Facturation
  default_payment_terms: number,
  default_tax_rate: decimal,
  invoice_prefix: string,    // Ex: FAC
  quote_prefix: string,      // Ex: DEV
  next_invoice_number: number,
  next_quote_number: number,
  
  // Recouvrement
  reminder_fee_1: decimal,   // Frais rappel 1
  reminder_fee_2: decimal,   // Frais rappel 2
  formal_notice_fee: decimal,
  interest_rate: decimal,    // Taux intérêt moratoire
  
  // Légal
  default_cgv_id: uuid,
  default_cgl_id: uuid,
  
  // Emails
  email_signature: text,
  
  // Intégrations
  invoice_ninja_company_id: string,
  revolut_account_id: string,
  mautic_segment_id: string
}
```

---

## 5.2 GESTION UTILISATEURS

### Actions nécessaires

| Action | Collection | Endpoint API | Composant Frontend | Statut |
|--------|------------|--------------|-------------------|--------|
| Lister utilisateurs | `directus_users` | GET /users | UsersList.jsx | ❌ MANQUANT |
| Créer utilisateur | `directus_users` | POST /users | UserForm.jsx | ❌ MANQUANT |
| Modifier utilisateur | `directus_users` | PATCH /users/:id | UserForm.jsx | ❌ MANQUANT |
| Désactiver utilisateur | `directus_users` | PATCH /users/:id | UsersList.jsx | ❌ MANQUANT |
| Assigner rôle | `directus_users` | PATCH /users/:id | UserForm.jsx | ❌ MANQUANT |
| Réinitialiser mot de passe | - | POST /users/:id/reset-password | UsersList.jsx | ❌ MANQUANT |

---

## 5.3 CATALOGUE PRODUITS/SERVICES

### Actions nécessaires

| Action | Collection | Endpoint API | Composant Frontend | Statut |
|--------|------------|--------------|-------------------|--------|
| Créer produit | `products` | POST /items/products | ProductForm.jsx | ❌ MANQUANT |
| Lister produits | `products` | GET /items/products | ProductsList.jsx | ❌ MANQUANT |
| Modifier produit | `products` | PATCH /items/products/:id | ProductForm.jsx | ❌ MANQUANT |
| Archiver produit | `products` | PATCH /items/products/:id | ProductsList.jsx | ❌ MANQUANT |
| Créer catégorie | `product_categories` | POST /items/product_categories | CategoryForm.jsx | ❌ MANQUANT |
| Importer produits | - | POST /api/products/import | ProductImport.jsx | ❌ MANQUANT |

### Champs produit
```javascript
{
  // Identification
  sku: string,               // Code produit
  name: string,              // Nom *
  description: text,
  
  // Prix
  unit_price: decimal,       // Prix unitaire HT *
  currency: string,
  tax_rate: decimal,
  
  // Unité
  unit: string,              // pièce, heure, jour, forfait, m², kg...
  
  // Catégorie
  category_id: uuid,
  
  // Type
  type: enum['product', 'service'],
  is_recurring: boolean,     // Abonnement
  recurring_interval: string,
  
  // Stock (si produit physique)
  track_stock: boolean,
  stock_quantity: number,
  stock_alert_threshold: number,
  
  // Statut
  status: enum['active', 'inactive', 'archived'],
  
  // Comptabilité
  revenue_account: string,   // Compte de produit
  expense_account: string,   // Compte de charge
  
  // Metadata
  tags: json,
  notes: text
}
```

---

# PARTIE 6 : SYNTHÈSE DES COMPOSANTS MANQUANTS

## 6.1 COMPOSANTS À CRÉER - PRIORITÉ HAUTE

### Module CRM (Contacts & Entreprises)
```
src/frontend/src/portals/superadmin/crm/
├── CRMDashboard.jsx
├── index.js
├── components/
│   ├── ContactsList.jsx
│   ├── ContactForm.jsx
│   ├── ContactDetail.jsx
│   ├── CompaniesList.jsx
│   ├── CompanyForm.jsx
│   ├── CompanyDetail.jsx
│   ├── AddressForm.jsx
│   └── BankAccountForm.jsx
├── hooks/
│   └── useCRMData.js
└── services/
    └── crmApi.js
```

### Module Devis (Quotes)
```
src/frontend/src/portals/superadmin/quotes/
├── QuotesDashboard.jsx
├── index.js
├── components/
│   ├── QuotesList.jsx
│   ├── QuoteForm.jsx
│   ├── QuoteDetail.jsx
│   ├── QuoteItemForm.jsx
│   ├── QuotePreview.jsx
│   └── QuoteTimeline.jsx
├── hooks/
│   └── useQuotesData.js
└── services/
    └── quotesApi.js
```

### Module Factures (étendre l'existant)
```
src/frontend/src/portals/superadmin/finance/
├── components/
│   ├── InvoiceForm.jsx          ❌ MANQUANT
│   ├── InvoiceDetail.jsx        ❌ MANQUANT
│   ├── InvoicePreview.jsx       ❌ MANQUANT
│   ├── PaymentForm.jsx          ❌ MANQUANT
│   └── BankReconciliation.jsx   ❌ MANQUANT
```

### Module Fournisseurs
```
src/frontend/src/portals/superadmin/suppliers/
├── SuppliersDashboard.jsx
├── index.js
├── components/
│   ├── SuppliersList.jsx
│   ├── SupplierForm.jsx
│   ├── SupplierDetail.jsx
│   ├── SupplierInvoicesList.jsx
│   ├── SupplierInvoiceForm.jsx
│   ├── SupplierInvoiceUpload.jsx
│   ├── OCRPreview.jsx
│   └── PaymentScheduler.jsx
├── hooks/
│   └── useSuppliersData.js
└── services/
    └── suppliersApi.js
```

### Module Projets
```
src/frontend/src/portals/superadmin/projects/
├── ProjectsDashboard.jsx
├── index.js
├── components/
│   ├── ProjectsList.jsx
│   ├── ProjectForm.jsx
│   ├── ProjectDetail.jsx
│   ├── ProjectTeam.jsx
│   ├── DeliverablesList.jsx
│   ├── DeliverableForm.jsx
│   ├── KanbanBoard.jsx
│   ├── TimeTracker.jsx
│   └── ProjectTimeline.jsx
├── hooks/
│   └── useProjectsData.js
└── services/
    └── projectsApi.js
```

### Module Configuration
```
src/frontend/src/portals/superadmin/settings/
├── SettingsDashboard.jsx
├── index.js
├── components/
│   ├── CompanySettings.jsx
│   ├── InvoiceSettings.jsx
│   ├── QRSettings.jsx
│   ├── TaxSettings.jsx
│   ├── EmailTemplates.jsx
│   ├── PDFTemplates.jsx
│   ├── UsersList.jsx
│   ├── UserForm.jsx
│   ├── ProductsList.jsx
│   └── ProductForm.jsx
├── hooks/
│   └── useSettingsData.js
└── services/
    └── settingsApi.js
```

---

## 6.2 ESTIMATION EFFORT

| Module | Composants | Effort estimé |
|--------|-----------|---------------|
| CRM | 8 | 2-3 jours |
| Devis | 6 | 2 jours |
| Factures (extension) | 5 | 1-2 jours |
| Fournisseurs | 8 | 2-3 jours |
| Projets | 9 | 3-4 jours |
| Configuration | 10 | 2-3 jours |
| **TOTAL** | **46** | **12-18 jours** |

---

## 6.3 ORDRE DE PRIORITÉ RECOMMANDÉ

### Sprint 1 (Prompt 11) - EN COURS
1. ✅ Legal Dashboard
2. ✅ Collection Dashboard

### Sprint 2 (Prompt 12) - À FAIRE
3. CRM - Contacts & Entreprises
4. Configuration - Settings

### Sprint 3 (Prompt 13)
5. Devis complet
6. Factures - Extension formulaires

### Sprint 4 (Prompt 14)
7. Fournisseurs & OCR
8. Rapprochement bancaire

### Sprint 5 (Prompt 15)
9. Projets & Livrables
10. Time tracking

---

## 6.4 NAVIGATION SIDEBAR COMPLÈTE

```javascript
// Structure navigation SuperAdmin
const sidebarNavigation = [
  {
    section: 'PRINCIPAL',
    items: [
      { label: 'Dashboard', icon: 'Home', path: '/superadmin' },
      { label: 'Alertes', icon: 'Bell', path: '/superadmin/alerts', badge: '3' }
    ]
  },
  {
    section: 'COMMERCIAL',
    items: [
      { label: 'Contacts', icon: 'Users', path: '/superadmin/crm/contacts' },
      { label: 'Entreprises', icon: 'Building', path: '/superadmin/crm/companies' },
      { label: 'Devis', icon: 'FileText', path: '/superadmin/quotes' },
      { label: 'Projets', icon: 'Folder', path: '/superadmin/projects' }
    ]
  },
  {
    section: 'FINANCE',
    items: [
      { label: 'Dashboard', icon: 'BarChart', path: '/superadmin/finance' },
      { label: 'Factures clients', icon: 'FileInvoice', path: '/superadmin/finance/invoices' },
      { label: 'Factures fournisseurs', icon: 'Receipt', path: '/superadmin/suppliers/invoices' },
      { label: 'Paiements', icon: 'CreditCard', path: '/superadmin/finance/payments' },
      { label: 'Rapprochement', icon: 'GitMerge', path: '/superadmin/finance/reconciliation' },
      { label: 'Recouvrement', icon: 'AlertTriangle', path: '/superadmin/collection' }
    ]
  },
  {
    section: 'LÉGAL',
    items: [
      { label: 'CGV / CGL', icon: 'Shield', path: '/superadmin/legal' },
      { label: 'Signatures', icon: 'PenTool', path: '/superadmin/legal/signatures' }
    ]
  },
  {
    section: 'CONFIGURATION',
    items: [
      { label: 'Entreprise', icon: 'Building2', path: '/superadmin/settings/company' },
      { label: 'Facturation', icon: 'Settings', path: '/superadmin/settings/invoicing' },
      { label: 'Utilisateurs', icon: 'UserCog', path: '/superadmin/settings/users' },
      { label: 'Produits', icon: 'Package', path: '/superadmin/settings/products' },
      { label: 'Templates', icon: 'Layout', path: '/superadmin/settings/templates' }
    ]
  }
];
```

---

Ce document sera mis à jour au fur et à mesure de l'implémentation des composants.
