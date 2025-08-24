# 📊 Collections Directus - Structure de Données

## Vue d'ensemble
Le système utilise **83 collections** organisées en plusieurs catégories avec **100 relations** sur 105 prévues.

## 🏢 Collections Principales

### Entreprises & Contacts
| Collection | Description | Statut |
|------------|-------------|--------|
| `owner_companies` | 5 entreprises principales | ✅ Peuplé (5) |
| `companies` | Toutes les entreprises | ⚠️ Partiel |
| `contacts` | Contacts/personnes | 🔴 Vide (0) |
| `people` | Personnes physiques | 🔴 Vide |
| `clients` | Clients des entreprises | ⚠️ Partiel |
| `suppliers` | Fournisseurs | ⚠️ Partiel |

### Projets & Tâches
| Collection | Description | Statut |
|------------|-------------|--------|
| `projects` | Projets principaux | ✅ Peuplé (100) |
| `deliverables` | Livrables/tâches | ✅ Peuplé (100) |
| `tasks` | Tâches détaillées | ⚠️ Partiel |
| `milestones` | Jalons de projet | ⚠️ Partiel |
| `project_phases` | Phases de projet | ⚠️ Partiel |
| `project_templates` | Modèles de projet | 🔴 Vide |

### Finance & Comptabilité
| Collection | Description | Statut |
|------------|-------------|--------|
| `client_invoices` | Factures clients | ⚠️ Partiel |
| `supplier_invoices` | Factures fournisseurs | ⚠️ Partiel |
| `quotes` | Devis | ⚠️ Partiel |
| `payments` | Paiements | ⚠️ Partiel |
| `bank_transactions` | Transactions bancaires | ⚠️ Partiel |
| `bank_accounts` | Comptes bancaires | ⚠️ Partiel |
| `expenses` | Dépenses | ⚠️ Partiel |
| `revenues` | Revenus | ⚠️ Partiel |

### Ressources Humaines
| Collection | Description | Statut |
|------------|-------------|--------|
| `employees` | Employés | ⚠️ Partiel |
| `contracts` | Contrats de travail | 🔴 Vide |
| `salaries` | Salaires | 🔴 Vide |
| `timesheets` | Feuilles de temps | ⚠️ Partiel |
| `leaves` | Congés | 🔴 Vide |
| `trainings` | Formations | 🔴 Vide |

### Documents & Médias
| Collection | Description | Statut |
|------------|-------------|--------|
| `documents` | Documents généraux | ⚠️ Partiel |
| `directus_files` | Fichiers Directus | ⚠️ Système |
| `attachments` | Pièces jointes | 🔴 Vide |
| `media` | Médias | 🔴 Vide |
| `templates` | Modèles de documents | 🔴 Vide |

### Marketing & Communication
| Collection | Description | Statut |
|------------|-------------|--------|
| `campaigns` | Campagnes marketing | 🔴 Vide |
| `leads` | Prospects | 🔴 Vide |
| `opportunities` | Opportunités | 🔴 Vide |
| `emails` | Emails | 🔴 Vide |
| `newsletters` | Newsletters | 🔴 Vide |

### Produits & Services
| Collection | Description | Statut |
|------------|-------------|--------|
| `products` | Produits | ⚠️ Partiel |
| `services` | Services | ⚠️ Partiel |
| `inventory` | Inventaire | 🔴 Vide |
| `stock_movements` | Mouvements de stock | 🔴 Vide |
| `price_lists` | Listes de prix | 🔴 Vide |

### Système & Configuration
| Collection | Description | Statut |
|------------|-------------|--------|
| `directus_users` | Utilisateurs système | ✅ Système |
| `directus_roles` | Rôles | ✅ Système |
| `directus_permissions` | Permissions | ✅ Système |
| `directus_activity` | Activité | ✅ Système |
| `directus_settings` | Paramètres | ✅ Système |
| `directus_webhooks` | Webhooks | ✅ Système |

### Dashboard & KPIs
| Collection | Description | Statut |
|------------|-------------|--------|
| `dashboard_kpis` | KPIs principaux | ⚠️ Partiel |
| `dashboard_widgets` | Widgets dashboard | 🔴 Vide |
| `reports` | Rapports | 🔴 Vide |
| `analytics` | Analytics | 🔴 Vide |
| `metrics` | Métriques | 🔴 Vide |

## 🔗 Relations Principales (100/105)

### Relations One-to-Many (M2O)
```javascript
// Entreprises
projects.owner_company → owner_companies.id
contacts.owner_company → owner_companies.id
clients.owner_company → owner_companies.id
suppliers.owner_company → owner_companies.id

// Projets
deliverables.project_id → projects.id
tasks.project_id → projects.id
milestones.project_id → projects.id

// Finance
client_invoices.client_id → clients.id
client_invoices.owner_company → owner_companies.id
supplier_invoices.supplier_id → suppliers.id
payments.invoice_id → client_invoices.id

// Contacts
employees.contact_id → contacts.id
users.contact_id → contacts.id
```

### Relations Many-to-Many (M2M)
```javascript
// Via tables de jonction
project_members → projects ↔ contacts
project_tags → projects ↔ tags
invoice_items → invoices ↔ products/services
```

### Relations Manquantes (5)
1. `bank_transactions` ↔ `payments`
2. `documents` ↔ `projects`
3. `campaigns` ↔ `contacts`
4. `opportunities` ↔ `companies`
5. `inventory` ↔ `products`

## 📈 Statistiques

### Par statut
- ✅ **Peuplées**: 8 collections
- ⚠️ **Partiellement peuplées**: 35 collections
- 🔴 **Vides**: 40 collections

### Par catégorie
| Catégorie | Total | Peuplées | Partielles | Vides |
|-----------|-------|----------|------------|-------|
| Core Business | 15 | 3 | 8 | 4 |
| Finance | 12 | 0 | 8 | 4 |
| RH | 8 | 0 | 2 | 6 |
| Marketing | 6 | 0 | 0 | 6 |
| Système | 12 | 5 | 7 | 0 |
| Autres | 30 | 0 | 10 | 20 |

## 🎯 Priorités de Migration

### Phase 1 - Critique
1. Créer les contacts réels (minimum 20)
2. Lier tous les contacts aux `owner_companies`
3. Compléter les 5 relations manquantes

### Phase 2 - Important
1. Migrer les données financières
2. Importer les employés
3. Configurer les dashboards

### Phase 3 - Normal
1. Importer l'historique des projets
2. Configurer le marketing
3. Mettre en place l'inventaire

## 🔧 Scripts de Migration

```bash
# Créer les collections manquantes
node scripts/migration/create-missing-collections.js

# Créer les relations
node scripts/migration/create-all-95-relations.js

# Migrer les données
node scripts/migration/migrate-massive-data.js

# Peupler avec des données de test
node scripts/populate-directus.js
```

## 📝 Notes

- Les IDs des `owner_companies` sont fixes et ne doivent pas changer
- Toutes les collections métier doivent avoir un champ `owner_company`
- Les collections système (directus_*) sont gérées automatiquement
- Utiliser les UUIDs pour tous les IDs personnalisés

---
*Dernière mise à jour: 24 décembre 2024*
