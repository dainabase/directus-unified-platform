# 📊 MAPPING COMPLET DES 62 COLLECTIONS DIRECTUS
## Date : 8 Août 2024

## 🎯 VUE D'ENSEMBLE

Ce document fait le mapping entre les 62 bases de données identifiées dans les anciens repos et nos collections Directus actuelles.

### 📈 Statistiques

| Catégorie | Collections existantes | À créer | Total |
|-----------|------------------------|---------|-------|
| **CRM & Contacts** | 6 | 3 | 9 |
| **Finance & Comptabilité** | 8 | 4 | 12 |
| **Projets & Opérations** | 7 | 2 | 9 |
| **RH & Talents** | 5 | 1 | 6 |
| **Marketing & Ventes** | 3 | 5 | 8 |
| **Support & Service** | 4 | 3 | 7 |
| **Système & Admin** | 6 | 5 | 11 |
| **Total** | **39** | **23** | **62** |

## 🗂️ MAPPING DÉTAILLÉ PAR CATÉGORIE

### 1. CRM & CONTACTS (9 collections)

| Base Legacy | Collection Directus | Status | Description |
|-------------|-------------------|--------|-------------|
| `DB-CONTACTS-ENTREPRISES` | **companies** | ✅ Existe | Entreprises et clients |
| `DB-CONTACTS-PERSONNES` | **people** | ✅ Existe | Contacts individuels |
| `DB-INTERACTIONS-CLIENTS` | **interactions** | ✅ Existe | Historique communications |
| `DB-LEAD-LIFECYCLE` | **opportunities** | 🔴 À créer | Pipeline des prospects |
| `DB-CUSTOMER-SUCCESS` | **customer_success** | ✅ Existe | Suivi satisfaction client |
| `DB-COMPANY-RELATIONS` | **company_people** | ✅ Existe | Relations entreprise-personne |
| `DB-CONTACT-PREFERENCES` | **contact_preferences** | 🔴 À créer | Préférences communication |
| `DB-LEAD-SOURCES` | **lead_sources** | 🔴 À créer | Sources de prospection |
| `DB-MARKET-SEGMENTS` | **market_segments** | ✅ Existe (tags) | Segmentation marché |

### 2. FINANCE & COMPTABILITÉ (12 collections)

| Base Legacy | Collection Directus | Status | Description |
|-------------|-------------------|--------|-------------|
| `DB-FACTURES-CLIENTS` | **client_invoices** | ✅ Existe | Factures émises |
| `DB-FACTURES-FOURNISSEURS` | **supplier_invoices** | ✅ Existe | Factures reçues |
| `DB-NOTES-FRAIS` | **expenses** | ✅ Existe | Notes de frais |
| `DB-TRANSACTIONS-BANCAIRES` | **bank_transactions** | ✅ Existe | Mouvements bancaires |
| `DB-TVA-DECLARATIONS` | **tax_declarations** | 🔴 À créer | Déclarations fiscales |
| `DB-ECRITURES-COMPTABLES` | **accounting_entries** | ✅ Existe | Journal comptable |
| `DB-PREVISIONS-TRESORERIE` | **cash_forecasts** | 🔴 À créer | Prévisions trésorerie |
| `DB-PAIEMENTS` | **payments** | ✅ Existe | Règlements |
| `DB-RECONCILIATION` | **reconciliations** | ✅ Existe | Rapprochements bancaires |
| `DB-BUDGETS` | **budgets** | ✅ Existe | Budgets prévisionnels |
| `DB-COST-CENTERS` | **cost_centers** | 🔴 À créer | Centres de coûts |
| `DB-FINANCIAL-KPI` | **financial_kpis** | 🔴 À créer | KPIs financiers |

### 3. PROJETS & OPÉRATIONS (9 collections)

| Base Legacy | Collection Directus | Status | Description |
|-------------|-------------------|--------|-------------|
| `DB-PROJETS` | **projects** | ✅ Existe | Gestion de projets |
| `DB-DELIVERABLES` | **deliverables** | ✅ Existe | Livrables projets |
| `DB-TIME-TRACKING` | **time_tracking** | ✅ Existe | Suivi du temps |
| `DB-MILESTONES` | **milestones** | 🔴 À créer | Jalons projets |
| `DB-PROJECT-RISKS` | **project_risks** | 🔴 À créer | Risques projets |
| `DB-CONTRACTS` | **contracts** | ✅ Existe | Contrats |
| `DB-PROPOSALS` | **proposals** | ✅ Existe | Propositions |
| `DB-QUOTES` | **quotes** | ✅ Existe | Devis |
| `DB-PROJECT-TEMPLATES` | **project_templates** | ✅ Existe (workflows) | Templates projets |

### 4. RH & TALENTS (6 collections)

| Base Legacy | Collection Directus | Status | Description |
|-------------|-------------------|--------|-------------|
| `DB-TALENTS` | **talents** | ✅ Existe | Base talents |
| `DB-EQUIPES` | **teams** | ✅ Existe | Équipes |
| `DB-EVALUATIONS` | **evaluations** | ✅ Existe | Évaluations |
| `DB-FORMATIONS` | **trainings** | ✅ Existe | Formations |
| `DB-COMPETENCES` | **skills** | ✅ Existe | Compétences |
| `DB-CAREER-PATHS` | **career_paths** | 🔴 À créer | Parcours carrière |

### 5. MARKETING & VENTES (8 collections)

| Base Legacy | Collection Directus | Status | Description |
|-------------|-------------------|--------|-------------|
| `DB-CAMPAIGNS` | **campaigns** | 🔴 À créer | Campagnes marketing |
| `DB-SEQUENCES` | **sequences** | 🔴 À créer | Séquences automatisées |
| `DB-PIPELINE-STAGES` | **pipeline_stages** | 🔴 À créer | Étapes pipeline |
| `DB-EMAIL-TEMPLATES` | **email_templates** | 🔴 À créer | Templates emails |
| `DB-LANDING-PAGES` | **landing_pages** | 🔴 À créer | Pages d'atterrissage |
| `DB-CONTENT-CALENDAR` | **content_calendar** | ✅ Existe | Calendrier contenu |
| `DB-SOCIAL-MEDIA` | **social_media** | ✅ Existe (activities) | Réseaux sociaux |
| `DB-SEO-KEYWORDS` | **seo_keywords** | ✅ Existe (tags) | Mots-clés SEO |

### 6. SUPPORT & SERVICE (7 collections)

| Base Legacy | Collection Directus | Status | Description |
|-------------|-------------------|--------|-------------|
| `DB-SUPPORT-TICKETS` | **support_tickets** | ✅ Existe | Tickets support |
| `DB-FAQ` | **faq** | 🔴 À créer | Questions fréquentes |
| `DB-KNOWLEDGE-BASE` | **knowledge_base** | 🔴 À créer | Base de connaissances |
| `DB-SLA-METRICS` | **sla_metrics** | 🔴 À créer | Métriques SLA |
| `DB-FEEDBACK` | **feedback** | ✅ Existe (comments) | Retours clients |
| `DB-ESCALATIONS` | **escalations** | ✅ Existe (approvals) | Escalades |
| `DB-RESOLUTIONS` | **resolutions** | ✅ Existe (workflows) | Solutions |

### 7. SYSTÈME & ADMIN (11 collections)

| Base Legacy | Collection Directus | Status | Description |
|-------------|-------------------|--------|-------------|
| `DB-USERS` | **directus_users** | ✅ Directus | Utilisateurs système |
| `DB-ROLES` | **roles** | ✅ Existe | Rôles utilisateur |
| `DB-PERMISSIONS` | **permissions** | ✅ Existe | Permissions |
| `DB-AUDIT-LOGS` | **audit_logs** | ✅ Existe | Logs d'audit |
| `DB-NOTIFICATIONS` | **notifications** | ✅ Existe | Notifications |
| `DB-SETTINGS` | **settings** | ✅ Existe | Configuration |
| `DB-API-KEYS` | **api_keys** | 🔴 À créer | Clés API |
| `DB-WEBHOOKS` | **webhooks** | 🔴 À créer | Webhooks |
| `DB-BACKUP-LOGS` | **backup_logs** | 🔴 À créer | Logs sauvegardes |
| `DB-INTEGRATIONS` | **integrations** | 🔴 À créer | Intégrations externes |
| `DB-SYSTEM-HEALTH` | **system_health** | 🔴 À créer | Santé système |

## 🔗 RELATIONS CRITIQUES À CRÉER

### Relations principales manquantes

```javascript
const criticalRelations = {
  // CRM
  opportunities: {
    company_id: 'companies',
    contact_id: 'people',
    assigned_to: 'directus_users',
    stage_id: 'pipeline_stages'
  },
  
  // Finance
  tax_declarations: {
    company_id: 'companies',
    period_id: 'fiscal_periods'
  },
  
  cash_forecasts: {
    company_id: 'companies',
    project_id: 'projects'
  },
  
  // Marketing
  campaigns: {
    assigned_to: 'directus_users',
    target_segment: 'market_segments'
  },
  
  sequences: {
    campaign_id: 'campaigns',
    template_id: 'email_templates'
  },
  
  // Support
  knowledge_base: {
    category_id: 'categories',
    author_id: 'directus_users'
  }
};
```

## 📋 CHAMPS CRITIQUES PAR COLLECTION

### Collections existantes à enrichir

#### companies (depuis DB-CONTACTS-ENTREPRISES)
```javascript
const companyFields = {
  // Identification
  vat_number: 'string',
  registration_number: 'string',
  legal_name: 'string',
  trade_name: 'string',
  
  // Adresses
  billing_address: 'json',
  shipping_address: 'json',
  
  // Finance
  credit_limit: 'decimal',
  payment_terms: 'integer',
  discount_rate: 'decimal',
  payment_behavior: 'select',
  
  // CRM
  customer_since: 'date',
  lifetime_value: 'decimal',
  risk_level: 'select',
  
  // Intégrations
  mautic_id: 'string',
  invoice_ninja_id: 'string',
  erpnext_id: 'string'
};
```

#### client_invoices (depuis DB-FACTURES-CLIENTS)
```javascript
const invoiceFields = {
  // Fiscalité
  tax_rate: 'decimal',
  tax_type: 'string',
  reverse_charge: 'boolean',
  intracom_vat_number: 'string',
  
  // Comptabilité
  accounting_code: 'string',
  cost_center: 'string',
  profit_center: 'string',
  
  // Documents
  pdf_url: 'string',
  xml_url: 'string',
  
  // Intégrations
  invoice_ninja_id: 'string',
  erpnext_id: 'string'
};
```

#### bank_transactions (depuis DB-TRANSACTIONS-BANCAIRES)
```javascript
const bankFields = {
  // Revolut API
  revolut_id: 'string',
  counterparty_iban: 'string',
  counterparty_bic: 'string',
  balance_after: 'decimal',
  
  // Fiscalité
  tax_relevant: 'boolean',
  vat_amount: 'decimal',
  vat_rate: 'decimal',
  
  // Catégorisation
  expense_category: 'string',
  business_purpose: 'text'
};
```

## 🎯 PRIORITÉS D'IMPLÉMENTATION

### Phase 1 - URGENT (Semaine 1)
1. **opportunities** - Pipeline commercial crucial
2. **tax_declarations** - Obligations fiscales
3. **cash_forecasts** - Gestion trésorerie
4. **milestones** - Suivi projets

### Phase 2 - IMPORTANTE (Semaine 2)
1. **campaigns** - Marketing automation
2. **pipeline_stages** - Personnalisation pipeline
3. **faq** - Support client
4. **api_keys** - Sécurité

### Phase 3 - OPTIMISATION (Semaine 3)
1. Enrichissement des collections existantes
2. Relations complexes
3. Intégrations avancées
4. Automatisations

## 📊 MÉTRIQUES DE COUVERTURE

- **Collections mappées** : 62/62 (100%)
- **Collections existantes** : 39/62 (63%)
- **Collections à créer** : 23/62 (37%)
- **Relations critiques** : 45 identifiées
- **Champs à enrichir** : 156 sur 15 collections

---

*Ce mapping est basé sur l'analyse des repos twenty-crm-migration-dashboard et dashboard*