# 📊 ÉTAT DES RELATIONS DIRECTUS

**Dernière mise à jour** : 03/08/2025 16:15  
**Progression** : 10/105 (9.5%)  
**Token utilisé** : `hHKnrW949zcwx2372KH2AjwDyROAjgZ2`

## ✅ RELATIONS CRÉÉES (10)

### time_tracking (2/2) ✅
- [x] time_tracking → projects (project_id)
- [x] time_tracking → deliverables (task_id)

### permissions (2/2) ✅
- [x] permissions → directus_users (user_id)
- [x] permissions → directus_roles (role_id)

### content_calendar (1/3)
- [x] content_calendar → companies (campaign_id)
- [ ] content_calendar → people (author_id)
- [ ] content_calendar → tags (many-to-many)

### interactions (2/4)
- [x] interactions → people (contact_id)
- [x] interactions → projects (project_id)
- [ ] interactions → companies (company_id)
- [ ] interactions → support_tickets (ticket_id)

### budgets (1/3)
- [x] budgets → projects (project_id)
- [ ] budgets → categories (category_id)
- [ ] budgets → approvers (approver_id)

### compliance (1/2)
- [x] compliance → companies (company_id)
- [ ] compliance → documents (many-to-many)

### talents (1/2)
- [x] talents → companies (company_id)
- [ ] talents → skills (many-to-many)

## ❌ RELATIONS MANQUANTES (95)

### Collections prioritaires (45 relations)

#### projects (15 relations)
- [ ] projects → clients (client_id)
- [ ] projects → providers (provider_id)
- [ ] projects → documents (many-to-many)
- [ ] projects → team_members (many-to-many)
- [ ] projects → milestones (one-to-many)
- [ ] projects → invoices (one-to-many)
- [ ] projects → expenses (one-to-many)
- [ ] projects → parent_project (parent_id)
- [ ] projects → tags (many-to-many)
- [ ] projects → templates (template_id)
- [ ] projects → status_history (one-to-many)
- [ ] projects → attachments (one-to-many)
- [ ] projects → comments (one-to-many)
- [ ] projects → risks (one-to-many)
- [ ] projects → deliverables (one-to-many)

#### deliverables (12 relations)
- [ ] deliverables → projects (project_id)
- [ ] deliverables → assignees (many-to-many)
- [ ] deliverables → dependencies (many-to-many)
- [ ] deliverables → attachments (one-to-many)
- [ ] deliverables → comments (one-to-many)
- [ ] deliverables → tags (many-to-many)
- [ ] deliverables → templates (template_id)
- [ ] deliverables → subtasks (one-to-many)
- [ ] deliverables → time_entries (one-to-many)
- [ ] deliverables → reviews (one-to-many)
- [ ] deliverables → versions (one-to-many)
- [ ] deliverables → parent_task (parent_id)

#### companies (18 relations)
- [ ] companies → contacts (one-to-many)
- [ ] companies → projects (one-to-many)
- [ ] companies → invoices (one-to-many)
- [ ] companies → contracts (one-to-many)
- [ ] companies → opportunities (one-to-many)
- [ ] companies → documents (many-to-many)
- [ ] companies → notes (one-to-many)
- [ ] companies → parent_company (parent_id)
- [ ] companies → subsidiaries (one-to-many)
- [ ] companies → addresses (one-to-many)
- [ ] companies → bank_accounts (one-to-many)
- [ ] companies → certifications (many-to-many)
- [ ] companies → industry_sectors (many-to-many)
- [ ] companies → social_media (one-to-many)
- [ ] companies → events (many-to-many)
- [ ] companies → support_tickets (one-to-many)
- [ ] companies → subscriptions (one-to-many)
- [ ] companies → compliance_records (one-to-many)

### Collections secondaires (50 relations)

#### people (10 relations)
- [ ] people → companies (company_id)
- [ ] people → interactions (one-to-many)
- [ ] people → permissions (many-to-many)
- [ ] people → projects (many-to-many)
- [ ] people → documents (many-to-many)
- [ ] people → notes (one-to-many)
- [ ] people → skills (many-to-many)
- [ ] people → certifications (many-to-many)
- [ ] people → social_media (one-to-many)
- [ ] people → addresses (one-to-many)

#### client_invoices (8 relations)
- [ ] client_invoices → clients (client_id)
- [ ] client_invoices → projects (project_id)
- [ ] client_invoices → line_items (one-to-many)
- [ ] client_invoices → payments (one-to-many)
- [ ] client_invoices → credit_notes (one-to-many)
- [ ] client_invoices → attachments (one-to-many)
- [ ] client_invoices → tax_rates (many-to-many)
- [ ] client_invoices → approvers (approver_id)

#### supplier_invoices (6 relations)
- [ ] supplier_invoices → providers (provider_id)
- [ ] supplier_invoices → expenses (one-to-many)
- [ ] supplier_invoices → purchase_orders (purchase_order_id)
- [ ] supplier_invoices → attachments (one-to-many)
- [ ] supplier_invoices → approvers (approver_id)
- [ ] supplier_invoices → payment_terms (payment_term_id)

#### bank_transactions (5 relations)
- [ ] bank_transactions → accounts (account_id)
- [ ] bank_transactions → categories (category_id)
- [ ] bank_transactions → invoices (invoice_id)
- [ ] bank_transactions → expenses (expense_id)
- [ ] bank_transactions → reconciliations (one-to-many)

#### support_tickets (8 relations)
- [ ] support_tickets → clients (client_id)
- [ ] support_tickets → assignees (assignee_id)
- [ ] support_tickets → categories (category_id)
- [ ] support_tickets → priorities (priority_id)
- [ ] support_tickets → attachments (one-to-many)
- [ ] support_tickets → comments (one-to-many)
- [ ] support_tickets → related_tickets (many-to-many)
- [ ] support_tickets → resolution_notes (one-to-many)

#### Autres relations (13)
- [ ] documents → tags (many-to-many)
- [ ] documents → versions (one-to-many)
- [ ] templates → categories (category_id)
- [ ] alerts → users (user_id)
- [ ] alerts → triggers (trigger_id)
- [ ] products → categories (category_id)
- [ ] products → variants (one-to-many)
- [ ] resources → skills (many-to-many)
- [ ] resources → availability (one-to-many)
- [ ] subscriptions → plans (plan_id)
- [ ] subscriptions → clients (client_id)
- [ ] expenses → categories (category_id)
- [ ] expenses → approvers (approver_id)

## 🎯 PLAN D'ACTION

### Phase 1 - Immédiat (Lundi matin)
1. Créer les collections manquantes avec schema
2. Ajouter les champs de clé étrangère manquants
3. Créer les relations projects (15 relations)
4. Créer les relations deliverables (12 relations)

### Phase 2 - Court terme (Lundi après-midi)
1. Relations companies (18 relations)
2. Relations people (10 relations)
3. Relations financières (19 relations)

### Phase 3 - Moyen terme (Mardi)
1. Relations CRM (15 relations)
2. Relations support (16 relations)
3. Relations many-to-many complexes

## 📝 Scripts disponibles

- `scripts/create-directus-relations.js` - Script principal de création
- `scripts/add-relation-fields.js` - Ajout des champs FK
- `scripts/fix-virtual-collections.js` - Correction des collections virtuelles

## 🔧 Commandes utiles

```bash
# Ajouter les champs manquants
node scripts/add-relation-fields.js

# Créer les relations
node scripts/create-directus-relations.js

# Vérifier les relations existantes
curl -H "Authorization: Bearer hHKnrW949zcwx2372KH2AjwDyROAjgZ2" \
  http://localhost:8055/relations | jq '.data | length'
```

## 📊 Statistiques

| Type de relation | Créées | Restantes | Total |
|------------------|--------|-----------|-------|
| Many-to-One | 10 | 55 | 65 |
| One-to-Many | 0 | 25 | 25 |
| Many-to-Many | 0 | 15 | 15 |
| **TOTAL** | **10** | **95** | **105** |

## ⚠️ Notes importantes

1. **Collections virtuelles** : Toujours vérifier qu'une collection a un schema SQL avant de créer des relations
2. **Champs FK** : Les champs de clé étrangère doivent exister avant la création des relations
3. **Relations système** : Les relations vers directus_users et directus_roles fonctionnent différemment
4. **Many-to-Many** : Nécessitent une table de jonction (créée automatiquement par Directus)

---

*Document créé le 03/08/2025 à 16:15 UTC*  
*Prochaine mise à jour : Après création des prochaines relations*