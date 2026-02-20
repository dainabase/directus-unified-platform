# PROMPT CLAUDE CODE — PHASE I : MODULES FINANCE AVANCÉS
# 8 stories — Modules CDC 9, 10, 11, 12, 13, 14

**Date** : 2026-02-20
**ROADMAP** : Phase I — 0/8 stories
**Commit cible** : `feat(phase-i): modules finance avances`

---

## 📚 ÉTAPE 0 — SKILLS OBLIGATOIRES AVANT TOUT CODE

Lire dans l'ordre avant d'écrire la première ligne de code :

```bash
# 1. SKILL ROUTER — Toujours en premier
cat /Users/jean-mariedelaunay/directus-unified-platform/.claude/skills/skill-router/SKILL.md

# 2. SKILLS MAPPING — Référence complète des combinaisons par story
cat /Users/jean-mariedelaunay/directus-unified-platform/SKILLS-MAPPING.md
```

Si tu ne peux pas lire un fichier → **STOP et signale l'erreur. Ne jamais deviner.**

### Combinaisons par story (issues de SKILLS-MAPPING.md)

| Story | Skills à lire dans l'ordre |
|-------|---------------------------|
| **I-01** Facturation jalons | `.claude/skills/swiss-compliance-engine/SKILL.md` + `.claude/skills/directus-api-patterns/SKILL.md` + `~/.claude/skills-repos/jeffallan-claude-skills/skills/fullstack-guardian/SKILL.md` |
| **I-02** Contrats récurrents | `.claude/skills/directus-api-patterns/SKILL.md` + `~/.claude/skills-repos/anthropics-skills/skills/frontend-design/SKILL.md` + `~/.claude/skills-repos/jeffallan-claude-skills/skills/react-expert/SKILL.md` |
| **I-03** CRON facturation | `.claude/skills/swiss-compliance-engine/SKILL.md` + `.claude/skills/integration-sync-engine/SKILL.md` + `~/.claude/skills-repos/claude-code-plugins-plus-skills/skills/06-backend-dev/express-route-generator/SKILL.md` |
| **I-04** Avoirs / notes de crédit | `.claude/skills/swiss-compliance-engine/SKILL.md` + `.claude/skills/directus-api-patterns/SKILL.md` + `~/.claude/skills-repos/jeffallan-claude-skills/skills/fullstack-guardian/SKILL.md` |
| **I-05** Workflow validation fournisseurs | `.claude/skills/directus-api-patterns/SKILL.md` + `~/.claude/skills-repos/anthropics-skills/skills/frontend-design/SKILL.md` + `~/.claude/skills-repos/jeffallan-claude-skills/skills/react-expert/SKILL.md` |
| **I-06** Détection écarts devis/facture | `.claude/skills/swiss-compliance-engine/SKILL.md` + `.claude/skills/postgresql-directus-optimizer/SKILL.md` + `~/.claude/skills-repos/jeffallan-claude-skills/skills/sql-pro/SKILL.md` |
| **I-07** Suivi temps → régie | `.claude/skills/swiss-compliance-engine/SKILL.md` + `.claude/skills/directus-api-patterns/SKILL.md` + `~/.claude/skills-repos/anthropics-skills/skills/frontend-design/SKILL.md` |
| **I-08** Tickets support → facturation | `.claude/skills/directus-api-patterns/SKILL.md` + `~/.claude/skills-repos/jeffallan-claude-skills/skills/fullstack-guardian/SKILL.md` + `~/.claude/skills-repos/claude-code-plugins-plus-skills/skills/06-backend-dev/express-route-generator/SKILL.md` |

> Lire les skills de la story **avant** de commencer à coder cette story. Pas tous en amont.

---

## 🔑 CREDENTIALS

```env
DIRECTUS_URL=http://localhost:8055
DIRECTUS_TOKEN=hypervisual-admin-static-token-2026
MAUTIC_URL=http://localhost:8080
```

---

## ⚠️ RÈGLES ABSOLUES

- ES Modules partout — `import/export`, jamais `require()`
- TVA suisse : 8.1% standard, 2.6% réduit, 3.8% hébergement
- Vérifier les champs réels Directus via curl AVANT de coder
- Committer chaque story séparément : `feat(I-01): description`
- MAJ ROADMAP.md après chaque story : `[ ]` → `[V]` avec date
- Réutiliser les utilitaires existants : `lib/projectActivation.js`, `api/email/*.js`

---

## 🗄️ COLLECTIONS DIRECTUS RÉELLES CONFIRMÉES

### `deliverables` (champs réels)
```
id, title, description, status, due_date, project_id,
assigned_to, reviewed_by, parent_task_id, owner_company
```
**Champs à ajouter si manquants** :
- `invoice_id` (string) — lien vers la facture générée
- `invoiced_at` (timestamp) — date de facturation
- `billable` (boolean, default: true) — livrable facturable
- `amount` (decimal) — montant à facturer pour ce livrable

### `subscriptions` (champs réels)
```
id, name, amount, billing_cycle, status, start_date,
end_date, date_created, project_id, owner_company
```
**Champs à ajouter si manquants** :
- `contact_id` (string) — client associé
- `next_billing_date` (date) — prochaine échéance
- `last_invoiced_at` (timestamp) — dernière facturation
- `services` (json) — liste des services inclus
- `auto_renew` (boolean, default: true)
- `invoice_day` (integer, default: 1) — jour du mois pour facturation

### `supplier_invoices` (champs réels)
```
id, invoice_number, supplier_name, amount, status, date_created,
project_id, provider_id, approved_by, owner_company, owner_company_id,
file_id, date_paid, vat_rate, total_ttc
```
**Champs à ajouter si manquants** :
- `amount_ht` (decimal) — montant HT
- `approved_at` (timestamp) — date d'approbation
- `rejection_reason` (text) — raison de rejet
- `payment_scheduled_date` (date) — date paiement programmé
- `deviation_percentage` (decimal) — écart vs devis fournisseur
- `quote_amount` (decimal) — montant devis fournisseur initial

### `credits` (utilisée pour I-04)
```
# Vérifier les champs réels avant de coder :
# curl -H "Authorization: Bearer hypervisual-admin-static-token-2026" \
#   "http://localhost:8055/items/credits?limit=1"
```
**Champs à ajouter si manquants** :
- `invoice_id` (string) — facture originale annulée
- `credit_number` (string) — NC-YYYYMM-NNN
- `amount` (decimal), `tax_amount` (decimal), `total` (decimal)
- `reason` (text), `status` (string: draft/issued/applied/expired)
- `contact_id` (string), `project_id` (string)
- `owner_company` (string), `issued_at` (timestamp)
- `applied_to_invoice_id` (string) — facture sur laquelle l'avoir est appliqué

### `time_tracking` (existe ✅)
```
# Vérifier les champs réels :
# curl -H "Authorization: Bearer hypervisual-admin-static-token-2026" \
#   "http://localhost:8055/items/time_tracking?limit=1"
```
**Champs à ajouter si manquants** :
- `project_id` (string), `deliverable_id` (string)
- `user_id` (string), `date` (date), `hours` (decimal)
- `description` (text), `billable` (boolean, default: true)
- `hourly_rate` (decimal), `amount` (decimal — calculé: hours × hourly_rate)
- `invoice_id` (string), `invoiced_at` (timestamp)
- `owner_company` (string)

### `support_tickets` (existe ✅)
```
# Vérifier les champs réels :
# curl -H "Authorization: Bearer hypervisual-admin-static-token-2026" \
#   "http://localhost:8055/items/support_tickets?limit=1"
```
**Champs à ajouter si manquants** :
- `contact_id` (string), `project_id` (string)
- `ticket_number` (string), `subject` (text), `description` (text)
- `status` (string: open/in_progress/resolved/closed/billed)
- `priority` (string: low/medium/high/urgent)
- `hours_spent` (decimal), `hourly_rate` (decimal, default: 150)
- `billable` (boolean), `invoice_id` (string), `invoiced_at` (timestamp)
- `subscription_id` (string) — si couvert par contrat
- `owner_company` (string), `assigned_to` (string)

---

## 📋 STORIES

---

### I-01 · Module 9 — Facturation par jalons (deliverables → factures)

**CDC** : REQ-JALON-001 à 006
**Base** : 550 deliverables réels dans Directus

**Logique métier** :
- Un livrable marqué `completed` peut générer une facture client
- Un projet peut avoir des jalons avec montants définis à l'avance
- Le CEO valide le livrable → facture générée automatiquement
- Numéro facture jalon : `JAL-YYYYMM-NNN`

**Backend** : `src/backend/api/milestones/index.js`

```javascript
// POST /api/milestones/:deliverableId/invoice
// Génère une facture depuis un livrable complété
async function generateMilestoneInvoice(deliverableId) {
  const deliverable = await directus.request(readItem('deliverables', deliverableId));
  
  // Vérifier que le livrable est completed et billable
  if (deliverable.status !== 'completed') throw new Error('Livrable non complété');
  if (deliverable.invoice_id) throw new Error('Déjà facturé');
  
  const project = await directus.request(readItem('projects', deliverable.project_id));
  
  // Créer la facture client
  const invoiceNumber = await generateInvoiceNumber('JAL');
  const invoice = await directus.request(createItem('client_invoices', {
    invoice_number: invoiceNumber,
    client_name: project.client_name || '',
    project_id: deliverable.project_id,
    contact_id: project.contact_id,
    amount: parseFloat(deliverable.amount || 0),
    tax_rate: 8.1,
    tax_amount: parseFloat(deliverable.amount || 0) * 0.081,
    total: parseFloat(deliverable.amount || 0) * 1.081,
    currency: 'CHF',
    status: 'draft',
    due_date: addDays(new Date(), 30),
    description: `Jalon : ${deliverable.title}`,
    owner_company: deliverable.owner_company,
    type: 'milestone'
  }));
  
  // Lier le livrable à la facture
  await directus.request(updateItem('deliverables', deliverableId, {
    invoice_id: invoice.id,
    invoiced_at: new Date().toISOString()
  }));
  
  return invoice;
}

// GET /api/milestones/project/:projectId
// Retourne jalons avec statut facturation
async function getProjectMilestones(projectId) {
  const deliverables = await directus.request(readItems('deliverables', {
    filter: { project_id: { _eq: projectId }, billable: { _eq: true } },
    sort: ['due_date']
  }));
  return deliverables.map(d => ({
    ...d,
    can_invoice: d.status === 'completed' && !d.invoice_id,
    is_invoiced: !!d.invoice_id
  }));
}
```

**Frontend** : `src/frontend/src/portals/superadmin/projects/MilestonesModule.jsx`

Interface :
```
┌──────────────────────────────────────────────────────┐
│  Projet : [nom]    Total : CHF XX XXX                │
├──────────────────────────────────────────────────────┤
│  Livrable          Statut    Montant    Action        │
│  Backend API       ✅ Fait   15 000 CHF [Facturer]   │
│  Intégration       🔄 En cours 8 000 CHF  —          │
│  Formation         ⏳ À faire  5 000 CHF  —           │
│  Total facturé : 0 CHF / 28 000 CHF                  │
└──────────────────────────────────────────────────────┘
```

---

### I-02 · Module 10 — Contrats récurrents avancés

**CDC** : REQ-ABONNEMENT-001 à 008
**Base** : 120 subscriptions réelles

**Logique métier** :
- Un contrat récurrent peut inclure plusieurs services avec tarifs différents
- Cycles : monthly, quarterly, annual
- Affichage panier multi-services (type SaaS)
- Calcul automatique next_billing_date depuis start_date + billing_cycle

**Backend** : `src/backend/api/subscriptions/index.js`

```javascript
// GET /api/subscriptions — Liste avec prochaine échéance
// POST /api/subscriptions — Créer contrat
// PUT /api/subscriptions/:id — Modifier
// POST /api/subscriptions/:id/cancel — Annuler
// GET /api/subscriptions/due-today — Abonnements à facturer aujourd'hui

function calculateNextBillingDate(startDate, billingCycle, lastInvoicedAt) {
  const base = lastInvoicedAt ? new Date(lastInvoicedAt) : new Date(startDate);
  switch (billingCycle) {
    case 'monthly': return addMonths(base, 1);
    case 'quarterly': return addMonths(base, 3);
    case 'annual': return addMonths(base, 12);
    default: return addMonths(base, 1);
  }
}
```

**Frontend** : `src/frontend/src/portals/superadmin/subscriptions/SubscriptionsModule.jsx`

Interface panier multi-services :
```
┌──────────────────────────────────────────────────┐
│  Contrat : Hébergement + Maintenance              │
│  Client : LakeView Solutions                      │
├──────────────────────────────────────────────────┤
│  Services inclus :                               │
│  ✓ Hébergement cloud        850 CHF/mois         │
│  ✓ Maintenance corrective   600 CHF/mois         │
│  ✓ Backups quotidiens       200 CHF/mois         │
│  ─────────────────────────────────────           │
│  Sous-total HT :           1 650 CHF/mois        │
│  TVA 8.1% :                  134 CHF             │
│  TOTAL TTC :               1 784 CHF/mois        │
├──────────────────────────────────────────────────┤
│  Prochain prélèvement : 01/03/2026               │
│  [Modifier] [Facturer maintenant] [Résilier]     │
└──────────────────────────────────────────────────┘
```

---

### I-03 · Module 10 — Facturation récurrente automatique (CRON mensuel)

**CDC** : REQ-REC-001 à 004

**Logique métier** :
- CRON quotidien 08h00 → vérifie subscriptions actives dont next_billing_date = aujourd'hui
- Génère automatiquement la facture client
- Envoie email via Mautic (réutiliser Phase E)
- Anti-doublon : vérifier last_invoiced_at

**Backend** : `src/backend/api/subscriptions/billing-cron.js`

```javascript
// CRON quotidien 08h00 — facturation abonnements
async function runRecurringBilling() {
  const today = new Date().toISOString().split('T')[0];
  
  const subscriptions = await directus.request(readItems('subscriptions', {
    filter: {
      status: { _eq: 'active' },
      next_billing_date: { _lte: today },
      owner_company: { _eq: 'HYPERVISUAL' }
    }
  }));
  
  for (const sub of subscriptions) {
    // Anti-doublon
    const alreadyInvoiced = await checkAutomationLog('subscription_billed', sub.id, today);
    if (alreadyInvoiced) continue;
    
    // Générer facture
    const invoice = await generateSubscriptionInvoice(sub);
    
    // MAJ next_billing_date
    await directus.request(updateItem('subscriptions', sub.id, {
      last_invoiced_at: new Date().toISOString(),
      next_billing_date: calculateNextBillingDate(sub.start_date, sub.billing_cycle, new Date())
    }));
    
    // Email client via Mautic
    await sendSubscriptionInvoiceEmail(sub, invoice);
    
    // Log
    await logAutomation('subscription_billed', sub.id, 'info',
      `Facture ${invoice.invoice_number} générée pour abonnement ${sub.name}`);
  }
}

// Numéro facture récurrente : REC-YYYYMM-NNN
async function generateSubscriptionInvoice(sub) {
  const invoiceNumber = await generateInvoiceNumber('REC');
  const amount = parseFloat(sub.amount);
  return await directus.request(createItem('client_invoices', {
    invoice_number: invoiceNumber,
    project_id: sub.project_id,
    contact_id: sub.contact_id,
    amount,
    tax_rate: 8.1,
    tax_amount: amount * 0.081,
    total: amount * 1.081,
    currency: 'CHF',
    status: 'sent',
    due_date: addDays(new Date(), 30),
    description: `Abonnement ${sub.name} — ${formatMonthYear(new Date())}`,
    owner_company: sub.owner_company,
    type: 'recurring',
    subscription_id: sub.id
  }));
}
```

**Démarrage dans server.js** :
```javascript
import { startRecurringBillingCron } from './api/subscriptions/billing-cron.js';
startRecurringBillingCron(); // CRON quotidien 08h00
```

**Endpoint manuel** : `POST /api/subscriptions/run-billing` (trigger manuel pour tests)

---

### I-04 · Module 11 — Avoirs & remboursements (notes de crédit)

**CDC** : REQ-AVOIR-001 à 008
**Collections** : `credits`, `refunds`
**Conformité** : CO Art. 958f — 10 ans conservation

**Logique métier** :
- Un avoir annule totalement ou partiellement une facture client
- Numéro avoir : `NC-YYYYMM-NNN` (Note de Crédit)
- L'avoir peut être appliqué sur une future facture ou remboursé
- Traçabilité complète obligatoire (piste d'audit suisse)

**Backend** : `src/backend/api/credits/index.js`

```javascript
// POST /api/credits — Créer un avoir depuis une facture
async function createCredit(invoiceId, amount, reason, type = 'full') {
  const invoice = await directus.request(readItem('client_invoices', invoiceId));
  
  const creditAmount = type === 'full' ? parseFloat(invoice.amount) : parseFloat(amount);
  const creditNumber = await generateCreditNumber(); // NC-YYYYMM-NNN
  
  const credit = await directus.request(createItem('credits', {
    credit_number: creditNumber,
    invoice_id: invoiceId,
    amount: creditAmount,
    tax_amount: creditAmount * (parseFloat(invoice.tax_rate || 8.1) / 100),
    total: creditAmount * (1 + parseFloat(invoice.tax_rate || 8.1) / 100),
    reason,
    status: 'issued',
    contact_id: invoice.contact_id,
    project_id: invoice.project_id,
    owner_company: invoice.owner_company,
    issued_at: new Date().toISOString()
  }));
  
  // Si avoir total → annuler la facture originale
  if (type === 'full') {
    await directus.request(updateItem('client_invoices', invoiceId, {
      status: 'cancelled',
      credit_id: credit.id
    }));
  }
  
  // Log audit suisse (CO Art. 958f)
  await logAutomation('credit_issued', credit.id, 'info',
    `Avoir ${creditNumber} émis pour facture ${invoice.invoice_number} — ${reason}`);
  
  return credit;
}

// POST /api/credits/:id/apply — Appliquer avoir sur une facture
// POST /api/credits/:id/refund — Rembourser en cash via Revolut
// GET /api/credits — Liste avoirs avec statut
```

**Frontend** : `src/frontend/src/portals/superadmin/invoices/CreditsModule.jsx`

Intégration dans `InvoiceDetailView.jsx` :
- Bouton "Émettre un avoir" sur factures status `sent` ou `paid`
- Modal : Type (total/partiel) + montant + raison
- Badge "Avoir NC-2026-02-001" sur la facture originale

---

### I-05 · Module 12 — Workflow validation factures fournisseurs

**CDC** : REQ-APPRO-001 à 008
**Base** : 375 factures fournisseurs, collection `approvals` présente

**Flux** :
```
Facture OCR → file d'attente pending → CEO valide (1 clic) → paiement Revolut programmé
                                     ↓ ou
                                     CEO rejette → email prestataire (raison obligatoire)
```

**Backend** : `src/backend/api/supplier-invoices/approval.js`

```javascript
// POST /api/supplier-invoices/:id/approve
async function approveSupplierInvoice(invoiceId, approvedBy, paymentDate) {
  const invoice = await directus.request(readItem('supplier_invoices', invoiceId));
  
  await directus.request(updateItem('supplier_invoices', invoiceId, {
    status: 'approved',
    approved_by: approvedBy,
    approved_at: new Date().toISOString(),
    payment_scheduled_date: paymentDate || addDays(new Date(), 30)
  }));
  
  // Email prestataire — réutiliser Phase E supplier-approved.js
  await sendSupplierApprovedEmail(invoice, paymentDate);
  
  await logAutomation('supplier_invoice_approved', invoiceId, 'info',
    `Facture ${invoice.invoice_number} approuvée — paiement prévu le ${paymentDate}`);
}

// POST /api/supplier-invoices/:id/reject
async function rejectSupplierInvoice(invoiceId, rejectedBy, reason) {
  await directus.request(updateItem('supplier_invoices', invoiceId, {
    status: 'rejected',
    approved_by: rejectedBy,
    rejection_reason: reason
  }));
  
  // Email prestataire avec raison
  await sendSupplierRejectedEmail(invoice, reason);
}

// GET /api/supplier-invoices/pending — File d'attente CEO
// GET /api/supplier-invoices/pending/count — Badge notification
```

**Frontend** : `src/frontend/src/portals/superadmin/supplier-invoices/ApprovalQueue.jsx`

Interface file d'attente :
```
┌─────────────────────────────────────────────────────────────┐
│  📋 File d'approbation — 12 factures en attente             │
├─────────┬──────────────┬──────────┬────────────┬───────────┤
│ N°      │ Prestataire  │ Montant  │ Reçue le   │ Actions   │
├─────────┼──────────────┼──────────┼────────────┼───────────┤
│ F-0123  │ TechPro SA   │ 4 850 CHF│ Aujourd'hui│ ✅ ❌     │
│ F-0122  │ MediaCom     │ 1 200 CHF│ Hier       │ ✅ ❌     │
└─────────┴──────────────┴──────────┴────────────┴───────────┘
```

Bouton ✅ → modal "Approuver" avec sélection date paiement
Bouton ❌ → modal "Rejeter" avec raison obligatoire (textarea)

Intégrer le badge count dans la sidebar SuperAdmin : `🔔 12`

---

### I-06 · Module 12 — Détection écarts devis/facture fournisseur

**CDC** : REQ-APPRO-006 (tolérance ±5% configurable)

**Logique métier** :
- Comparer `supplier_invoices.total_ttc` avec le devis fournisseur initial (`quote_amount`)
- Si écart > 5% → alerte rouge + blocage approbation
- Si écart 3-5% → avertissement orange (approbation possible avec note)
- Si écart < 3% → OK vert

**Backend** : `src/backend/api/supplier-invoices/deviation.js`

```javascript
function analyzeDeviation(invoiceAmount, quoteAmount, tolerance = 5) {
  if (!quoteAmount || quoteAmount === 0) return { status: 'no_quote', percentage: null };
  
  const deviation = ((invoiceAmount - quoteAmount) / quoteAmount) * 100;
  const absDeviation = Math.abs(deviation);
  
  return {
    deviation_percentage: Math.round(deviation * 100) / 100,
    abs_percentage: Math.round(absDeviation * 100) / 100,
    status: absDeviation > tolerance ? 'blocked' :
            absDeviation > tolerance * 0.6 ? 'warning' : 'ok',
    quote_amount: quoteAmount,
    invoice_amount: invoiceAmount,
    difference: invoiceAmount - quoteAmount
  };
}

// Intégrer dans le workflow d'approbation :
// Si deviation.status === 'blocked' → empêcher l'approbation automatique
// Si deviation.status === 'warning' → afficher avertissement mais autoriser
```

**Frontend** : Intégrer dans `ApprovalQueue.jsx` :
- Colonne "Écart devis" avec badge coloré : 🟢 -1.2% / 🟡 +4.1% / 🔴 +7.8%
- Si rouge → bouton "Approuver" désactivé avec tooltip "Écart > 5% — contact requis"
- Endpoint : `GET /api/supplier-invoices/:id/deviation`

---

### I-07 · Module 13 — Suivi du temps → facturation en régie

**CDC** : REQ-TEMPS-001 à 007
**Applicabilité** : Projets logiciels HYPERVISUAL de type D (développement)
**Tarif par défaut** : configurable par projet (ex: 150 CHF/h)
**Collection** : `time_tracking` (existe déjà ✅)

**Logique métier** :
- Techniciens saisissent leurs heures par livrable/projet
- CEO génère une facture depuis les heures billables sélectionnées
- Heures non billables (formation interne, overhead) exclues
- Numéro facture régie : `REG-YYYYMM-NNN`

**Backend** : `src/backend/api/time-tracking/index.js`

```javascript
// POST /api/time-tracking — Saisir heures
// GET /api/time-tracking/project/:projectId — Heures par projet
// GET /api/time-tracking/billable/:projectId — Heures billables non facturées
// POST /api/time-tracking/invoice — Générer facture depuis sélection d'heures

async function generateTimeInvoice(projectId, timeEntryIds, hourlyRate) {
  const entries = await directus.request(readItems('time_tracking', {
    filter: {
      id: { _in: timeEntryIds },
      billable: { _eq: true },
      invoice_id: { _null: true }
    }
  }));
  
  const totalHours = entries.reduce((sum, e) => sum + parseFloat(e.hours), 0);
  const totalAmount = totalHours * hourlyRate;
  const invoiceNumber = await generateInvoiceNumber('REG');
  
  const invoice = await directus.request(createItem('client_invoices', {
    invoice_number: invoiceNumber,
    project_id: projectId,
    amount: totalAmount,
    tax_rate: 8.1,
    tax_amount: totalAmount * 0.081,
    total: totalAmount * 1.081,
    currency: 'CHF',
    status: 'draft',
    due_date: addDays(new Date(), 30),
    description: `Facturation en régie — ${totalHours}h × ${hourlyRate} CHF/h`,
    owner_company: 'HYPERVISUAL',
    type: 'time_and_materials'
  }));
  
  // Marquer les entrées de temps comme facturées
  for (const entry of entries) {
    await directus.request(updateItem('time_tracking', entry.id, {
      invoice_id: invoice.id,
      invoiced_at: new Date().toISOString()
    }));
  }
  
  return { invoice, totalHours, totalAmount };
}
```

**Frontend** : `src/frontend/src/portals/superadmin/time-tracking/TimeTrackingModule.jsx`

Interface :
```
┌──────────────────────────────────────────────────────────┐
│  ⏱️ Suivi du temps — Projet : DataVision Platform        │
│  Tarif : 150 CHF/h                    [Saisir heures]   │
├──────────┬─────────────┬──────┬───────────┬─────────────┤
│ Date     │ Description │ Hrs  │ Billable  │ Montant CHF │
├──────────┼─────────────┼──────┼───────────┼─────────────┤
│ 20/02    │ Dev API     │ 3.5h │ ✅        │ 525         │
│ 19/02    │ Tests       │ 2h   │ ✅        │ 300         │
│ 18/02    │ Meeting     │ 1h   │ ❌        │ —           │
├──────────┴─────────────┴──────┴───────────┴─────────────┤
│  Total billable : 5.5h — CHF 825 HT                    │
│  [Générer facture régie REG-202602-001]                 │
└──────────────────────────────────────────────────────────┘
```

---

### I-08 · Module 14 — Tickets support → facturation hors contrat

**CDC** : REQ-SUPPORT-001 à 007
**Tarif défaut** : 150 CHF/h
**Collection** : `support_tickets` (existe ✅)

**Logique métier** :
- Si le client a un contrat (`subscription_id`) → ticket couvert → non facturé
- Si pas de contrat → ticket billable → facture générée après clôture
- Résolution SLA : P1 < 4h, P2 < 8h, P3 < 48h
- Numéro facture support : `SUP-YYYYMM-NNN`

**Backend** : `src/backend/api/support/index.js`

```javascript
// POST /api/support/tickets — Créer ticket
// GET /api/support/tickets — Liste tickets
// PUT /api/support/tickets/:id — MAJ ticket
// POST /api/support/tickets/:id/close — Clôturer + facturer si applicable
// POST /api/support/tickets/:id/bill — Facturer manuellement

async function closeAndBillTicket(ticketId, hourlyRate = 150) {
  const ticket = await directus.request(readItem('support_tickets', ticketId));
  
  // MAJ statut
  await directus.request(updateItem('support_tickets', ticketId, {
    status: ticket.billable && !ticket.subscription_id ? 'billed' : 'closed'
  }));
  
  // Si billable et pas couvert par contrat
  if (ticket.billable && !ticket.subscription_id && ticket.hours_spent > 0) {
    const rate = ticket.hourly_rate || hourlyRate;
    const amount = parseFloat(ticket.hours_spent) * rate;
    const invoiceNumber = await generateInvoiceNumber('SUP');
    
    const invoice = await directus.request(createItem('client_invoices', {
      invoice_number: invoiceNumber,
      contact_id: ticket.contact_id,
      project_id: ticket.project_id,
      amount,
      tax_rate: 8.1,
      tax_amount: amount * 0.081,
      total: amount * 1.081,
      currency: 'CHF',
      status: 'draft',
      due_date: addDays(new Date(), 30),
      description: `Support hors contrat — Ticket #${ticket.ticket_number} : ${ticket.subject} — ${ticket.hours_spent}h × ${rate} CHF/h`,
      owner_company: ticket.owner_company,
      type: 'support'
    }));
    
    await directus.request(updateItem('support_tickets', ticketId, {
      invoice_id: invoice.id,
      invoiced_at: new Date().toISOString()
    }));
    
    return { invoiced: true, invoice };
  }
  
  return { invoiced: false };
}
```

**Frontend** : `src/frontend/src/portals/superadmin/support/SupportModule.jsx`

Interface :
```
┌────────────────────────────────────────────────────────┐
│  🎫 Tickets support — 5 ouverts, 2 à facturer         │
├───────┬──────────────┬──────────┬───────────┬─────────┤
│ #     │ Sujet        │ Client   │ Heures    │ Statut  │
├───────┼──────────────┼──────────┼───────────┼─────────┤
│ #042  │ Écran noir   │ LakeView │ 2.5h      │🔴 Hors  │
│ #041  │ Config réseau│ DataViz  │ 1h        │✅ Contrat│
└───────┴──────────────┴──────────┴───────────┴─────────┘
[Nouveau ticket]
```

Badge "Hors contrat" rouge sur tickets billables sans subscription_id
Bouton "Facturer" apparaît quand ticket closed + billable + pas de subscription

---

## 📁 STRUCTURE FICHIERS FINALE

```
src/backend/api/
├── milestones/index.js          # I-01 — Facturation jalons
├── subscriptions/
│   ├── index.js                 # I-02 — CRUD contrats récurrents
│   └── billing-cron.js          # I-03 — CRON facturation automatique
├── credits/index.js             # I-04 — Avoirs & remboursements
├── supplier-invoices/
│   ├── approval.js              # I-05 — Workflow validation
│   └── deviation.js             # I-06 — Détection écarts
├── time-tracking/index.js       # I-07 — Suivi temps + facturation régie
└── support/index.js             # I-08 — Tickets + facturation hors contrat

src/frontend/src/portals/superadmin/
├── projects/MilestonesModule.jsx          # I-01
├── subscriptions/SubscriptionsModule.jsx  # I-02 + I-03
├── invoices/CreditsModule.jsx             # I-04
├── supplier-invoices/ApprovalQueue.jsx   # I-05 + I-06
├── time-tracking/TimeTrackingModule.jsx  # I-07
└── support/SupportModule.jsx             # I-08
```

---

## 🔧 UTILITAIRES PARTAGÉS — À CRÉER DANS `lib/financeUtils.js`

```javascript
// Réutilisé par toutes les stories I-01 à I-08
export function addDays(date, days) { /* ... */ }
export function addMonths(date, months) { /* ... */ }
export function formatMonthYear(date) { /* ... */ } // "Février 2026"
export function formatCHF(amount) { /* CHF 1 234.56 */ }

// Générateurs de numéros (anti-doublon via count Directus)
export async function generateInvoiceNumber(prefix) {
  // JAL, REC, NC, REG, SUP
  const count = await directus.request(readItems('client_invoices', {
    filter: { invoice_number: { _starts_with: prefix } },
    aggregate: { count: ['id'] }
  }));
  const seq = (parseInt(count[0]?.count?.id || 0) + 1).toString().padStart(3, '0');
  const yyyymm = new Date().toISOString().slice(0, 7).replace('-', '');
  return `${prefix}-${yyyymm}-${seq}`;
}

// Anti-doublon automation_logs
export async function checkAutomationLog(action, entityId, date) { /* ... */ }
export async function logAutomation(action, entityId, level, message) { /* ... */ }
```

---

## 🔌 INTÉGRATION SERVER.JS

```javascript
import milestonesRouter from './api/milestones/index.js';
import subscriptionsRouter from './api/subscriptions/index.js';
import creditsRouter from './api/credits/index.js';
import supplierInvoicesRouter from './api/supplier-invoices/index.js';
import timeTrackingRouter from './api/time-tracking/index.js';
import supportRouter from './api/support/index.js';
import { startRecurringBillingCron } from './api/subscriptions/billing-cron.js';

app.use('/api/milestones', milestonesRouter);
app.use('/api/subscriptions', subscriptionsRouter);
app.use('/api/credits', creditsRouter);
app.use('/api/supplier-invoices', supplierInvoicesRouter);
app.use('/api/time-tracking', timeTrackingRouter);
app.use('/api/support', supportRouter);

startRecurringBillingCron();
```

---

## 🧪 TESTS RAPIDES

```bash
# I-01 — Facturation jalon
curl -X POST http://localhost:3001/api/milestones/DELIVERABLE_ID/invoice

# I-02 — Lister abonnements actifs
curl http://localhost:3001/api/subscriptions?status=active

# I-03 — Trigger billing manuel
curl -X POST http://localhost:3001/api/subscriptions/run-billing

# I-04 — Créer avoir
curl -X POST http://localhost:3001/api/credits \
  -H "Content-Type: application/json" \
  -d '{"invoice_id": "ID", "amount": 1000, "reason": "Prestation non effectuée", "type": "partial"}'

# I-05 — File approbation
curl http://localhost:3001/api/supplier-invoices/pending

# I-06 — Écart devis
curl http://localhost:3001/api/supplier-invoices/ID/deviation

# I-07 — Heures billables
curl http://localhost:3001/api/time-tracking/billable/PROJECT_ID

# I-08 — Tickets ouverts
curl http://localhost:3001/api/support/tickets?status=open
```

---

## 📝 FORMAT COMMITS

```
feat(I-01): facturation jalons deliverables vers client_invoices
feat(I-02): contrats recurrents panier multi-services
feat(I-03): cron facturation abonnements mensuel automatique
feat(I-04): avoirs notes de credit NC-YYYYMM-NNN CO-958f
feat(I-05): workflow validation factures fournisseurs 1-clic
feat(I-06): detection ecarts devis-facture fournisseur 5pct
feat(I-07): suivi temps facturation regie REG-YYYYMM-NNN
feat(I-08): tickets support facturation hors contrat SUP-YYYYMM-NNN
feat(phase-i): update ROADMAP.md I-01 to I-08 [V] DONE
```
