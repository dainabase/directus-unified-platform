# RAPPORT PARTIE 5 - HOOKS DIRECTUS AUTOMATISATIONS

**Date:** 15 Décembre 2025
**Statut:** ✅ COMPLÉTÉ

---

## 📁 Fichiers Créés

```
src/backend/hooks/commercial/
├── index.js              # Registry et exports
├── quote-hooks.js        # Hooks devis
├── invoice-hooks.js      # Hooks factures
├── lead-hooks.js         # Hooks leads
└── scheduler.js          # Tâches planifiées
```

---

## 🔄 HOOKS DEVIS (quote-hooks.js)

### beforeQuoteCreate
- Génération automatique numéro devis (format: `HYP-2025-0001`)
- Calcul TVA Suisse automatique selon type projet
- Calcul montant acompte selon config
- Date validité par défaut (30 jours)
- Statut initial: `draft`

### afterQuoteUpdate
Détection changement statut et actions automatiques:
| Statut | Action |
|--------|--------|
| `sent` | Création compte portail client si nécessaire |
| `signed` | Création facture acompte automatique |
| `completed` | Création projet automatique |
| `expired` | Notification expiration |

### TVA Suisse Intégrée
```javascript
const TAX_RATES = {
  standard: 8.1,
  reduced: 2.6,
  accommodation: 3.8,
  exempt: 0
};
```

---

## 📄 HOOKS FACTURES (invoice-hooks.js)

### beforeInvoiceCreate
- Génération numéro facture (format: `HYP-2025-0001A` pour acompte)
- Date échéance par défaut (30 jours)
- Statut initial: `pending`

### afterInvoiceUpdate
- Détection paiement (`status: 'paid'`)
- Si facture acompte → MAJ devis associé
- Déclenchement création projet si acompte payé
- Log événement paiement pour audit

### Workflow Acompte Payé
1. MAJ devis: `deposit_paid: true`, `status: 'completed'`
2. Création projet automatique depuis devis
3. Liaison projet ↔ devis

---

## 👤 HOOKS LEADS (lead-hooks.js)

### beforeLeadCreate
- Calcul score initial automatique
- Statut par défaut: `new`
- Priorité calculée selon score

### afterLeadCreate
- Notification équipe pour leads haute priorité
- Préparation sync Mautic

### afterLeadUpdate
- Recalcul score si données pertinentes modifiées
- Détection conversion lead
- MAJ timestamp conversion

### Scoring Rules
```javascript
const SCORING_RULES = {
  has_email: 10,
  has_phone: 10,
  has_company: 15,
  has_budget: 20,
  has_timeline: 15,
  source_referral: 25,
  source_website: 15,
  source_ads: 10,
  source_cold: 5
};
```

### Priorité Automatique
| Score | Priorité |
|-------|----------|
| ≥ 70 | `high` |
| ≥ 40 | `medium` |
| < 40 | `low` |

---

## ⏰ TÂCHES PLANIFIÉES (scheduler.js)

| Cron | Fonction | Description |
|------|----------|-------------|
| `0 0 * * *` | checkExpiredQuotes | Marquer devis expirés (minuit) |
| `0 9 * * *` | sendPaymentReminders | Rappels factures en retard (9h) |
| `0 10 */3 * *` | sendQuoteFollowUps | Relances devis non signés (tous les 3 jours) |
| `0 2 * * *` | cleanupExpiredTokens | Nettoyage tokens expirés (2h) |
| `0 8 * * *` | generateDailyReport | Rapport quotidien (8h) |

### checkExpiredQuotes
- Trouve devis avec `valid_until < aujourd'hui`
- MAJ statut vers `expired`
- Préparation notification client/équipe

### sendPaymentReminders
- Trouve factures en retard
- Niveaux de rappel selon ancienneté:
  - ≤7 jours: `first`
  - ≤14 jours: `second`
  - ≤30 jours: `final`
  - >30 jours: `collection`

### sendQuoteFollowUps
- Devis envoyés il y a >3 jours
- Non signés mais encore valides
- Distinction: "viewed but not signed" vs "not yet opened"

### cleanupExpiredTokens
- Tokens activation expirés (>72h)
- Tokens reset password expirés (>1h)

### generateDailyReport
- Stats de la veille:
  - Nouveaux leads
  - Devis créés + valeur totale
  - Paiements reçus + montant total

---

## 📝 HOOK REGISTRY (index.js)

```javascript
export const hookRegistry = {
  quotes: {
    'items.create.before': quoteHooks.beforeQuoteCreate,
    'items.update.after': quoteHooks.afterQuoteUpdate
  },
  client_invoices: {
    'items.create.before': invoiceHooks.beforeInvoiceCreate,
    'items.update.after': invoiceHooks.afterInvoiceUpdate
  },
  leads: {
    'items.create.before': leadHooks.beforeLeadCreate,
    'items.create.after': leadHooks.afterLeadCreate,
    'items.update.after': leadHooks.afterLeadUpdate
  }
};

export const scheduledTasks = {
  '0 0 * * *': scheduler.checkExpiredQuotes,
  '0 9 * * *': scheduler.sendPaymentReminders,
  '0 10 */3 * *': scheduler.sendQuoteFollowUps,
  '0 2 * * *': scheduler.cleanupExpiredTokens,
  '0 8 * * *': scheduler.generateDailyReport
};
```

---

## 🔗 Intégration Prévue

### Extension Directus (futur)
```javascript
import { hookRegistry, scheduledTasks } from './hooks/commercial';

export default defineHook(({ action, init }) => {
  // Register hooks
  for (const [collection, hooks] of Object.entries(hookRegistry)) {
    for (const [event, handler] of Object.entries(hooks)) {
      action(event, handler);
    }
  }

  // Schedule tasks via node-cron
  for (const [cron, task] of Object.entries(scheduledTasks)) {
    nodeCron.schedule(cron, task);
  }
});
```

---

## ✅ Résumé

| Composant | Hooks | Statut |
|-----------|-------|--------|
| Devis | 2 (before create, after update) | ✅ |
| Factures | 2 (before create, after update) | ✅ |
| Leads | 3 (before create, after create, after update) | ✅ |
| Scheduler | 5 tâches cron | ✅ |
| Registry | Centralisé | ✅ |

**Total:** 7 hooks + 5 tâches planifiées

---

## ➡️ Prochaine Étape

**PARTIE 6:** Intégrations externes
- DocuSeal (signatures électroniques)
- Invoice Ninja (facturation)
- Mautic (CRM/Marketing automation)
