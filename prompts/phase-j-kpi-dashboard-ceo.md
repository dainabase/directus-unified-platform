# PROMPT CLAUDE CODE — PHASE J : KPI DASHBOARD + RAPPORT CEO
# 4 stories — Modules CDC 7, 15 — DERNIÈRE PHASE V1

**Date** : 2026-02-20
**Auteur** : Jean (Architecte) + Claude
**Référence ROADMAP** : Phase J — 0/4 stories
**Commit cible** : `feat(phase-j): kpi dashboard + rapport ceo`

---

## 🎯 OBJECTIF

Le CEO voit tout, comprend tout, en 30 secondes.
- KPIs temps réel depuis la collection `kpis` (données réelles en base)
- Alertes configurables sur seuils (MRR < 50K → rouge)
- Rapport quotidien automatique envoyé par email
- Prévision trésorerie 30/60/90 jours depuis les données bancaires Revolut

**CDC** : REQ-KPI-001 à 007, REQ-CEO-004, REQ-CEO-006

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
| **J-01** KPIs dashboard | `.claude/skills/ceo-dashboard-designer/SKILL.md` + `~/.claude/skills-repos/anthropics-skills/skills/frontend-design/SKILL.md` + `.claude/skills/directus-api-patterns/SKILL.md` |
| **J-02** Alertes seuils | `.claude/skills/ceo-dashboard-designer/SKILL.md` + `.claude/skills/directus-api-patterns/SKILL.md` + `~/.claude/skills-repos/jeffallan-claude-skills/skills/react-expert/SKILL.md` |
| **J-03** Rapport email CEO | `.claude/skills/integration-sync-engine/SKILL.md` + `.claude/skills/swiss-compliance-engine/SKILL.md` + `~/.claude/skills-repos/claude-code-plugins-plus-skills/skills/06-backend-dev/express-route-generator/SKILL.md` |
| **J-04** Prévision trésorerie | `.claude/skills/ceo-dashboard-designer/SKILL.md` + `.claude/skills/postgresql-directus-optimizer/SKILL.md` + `~/.claude/skills-repos/jeffallan-claude-skills/skills/sql-pro/SKILL.md` |

> Lire les skills de la story **avant** de commencer à coder cette story. Pas tous en amont.

---

## 🔑 CREDENTIALS

```env
DIRECTUS_URL=http://localhost:8055
DIRECTUS_TOKEN=hypervisual-admin-static-token-2026
MAUTIC_URL=http://localhost:8080
CEO_EMAIL=jean@hypervisual.ch
```

---

## ⚠️ RÈGLES ABSOLUES

- ES Modules partout — `import/export`, jamais `require()`
- Recharts pour les graphiques — JAMAIS ApexCharts
- Glassmorphism design system — bleu-600 dominant
- Filtrer toujours par `owner_company: 'HYPERVISUAL'`
- Committer chaque story séparément : `feat(J-0X): description`
- MAJ ROADMAP.md après chaque story : `[ ]` → `[V]` avec date

---

## 🗄️ COLLECTIONS DIRECTUS RÉELLES CONFIRMÉES VIA MCP

### `kpis` (champs réels — 240 enregistrements, 48 HYPERVISUAL)
```
id, created_at, updated_at, name, description, status,
owner_company, metric_name, value, date
```

**metric_name valeurs existantes confirmées en base :**
- `MRR` — ex: 98 667.72 CHF
- `ARR` — ex: 1 275 776.23 CHF
- `NPS` — ex: 81.93
- `LTV_CAC` — ex: 4.25
- `ACTIVE_PROJECTS` — nombre projets actifs

**Métriques à calculer dynamiquement (pas en base) :**
- `EBITDA` → depuis `client_invoices` + `expenses`
- `RUNWAY` → trésorerie actuelle / burn rate mensuel

### `bank_transactions` (champs réels — pour J-04)
```
id, description, amount, type (credit/debit), date,
owner_company, currency, balance_after, state,
reconciliation_status, matched_invoice_id
```

### `client_invoices` (pour prévisions)
```
id, invoice_number, amount, total, status, due_date,
owner_company, type, subscription_id
```

### `subscriptions` (pour prévisions récurrentes — enrichi Phase I)
```
id, name, amount, billing_cycle, status, next_billing_date,
owner_company
```

### `supplier_invoices` (pour prévisions dépenses)
```
id, amount, total_ttc, status, payment_scheduled_date,
owner_company
```

---

## 📋 STORIES

---

### J-01 · KPIs depuis collection `kpis` — affichage complet

**CDC** : REQ-KPI-001 à 007
**Base** : 48 enregistrements HYPERVISUAL réels

**Logique métier :**
- Récupérer le dernier enregistrement de chaque metric_name pour HYPERVISUAL
- Afficher dans la sidebar KPI du dashboard CEO (colonne 4 droite)
- Graphique sparkline 30 jours pour MRR (Recharts LineChart)
- Variation vs période précédente (+12.3% ↑ ou -3.1% ↓)

**Backend** : `src/backend/api/kpis/index.js`

Endpoints :
- `GET /api/kpis/latest` — dernière valeur de chaque métrique HYPERVISUAL
- `GET /api/kpis/history/:metric?days=30` — historique pour sparkline
- `GET /api/kpis/summary` — résumé pour rapport CEO

Logique getLatestKPIs :
- Pour chaque metric_name, fetch les 2 derniers enregistrements (tri `-date`)
- Calculer variation : ((current - previous) / previous) * 100
- Retourner : `{ value, date, variation, trend: 'up'|'down'|'stable' }`

**Frontend** : `src/frontend/src/portals/superadmin/kpis/KPIWidget.jsx`

Layout sidebar (remplace les données statiques dans SuperAdminDashboard.jsx) :
```
┌────────────────────────────┐
│  📊 KPIs HYPERVISUAL       │
├────────────────────────────┤
│  MRR                       │
│  CHF 98 668    ↑ +12.3%    │
│  ▁▂▃▄▅▆▇█ (sparkline)      │
├────────────────────────────┤
│  ARR       CHF 1.28M ↑+8%  │
│  RUNWAY    14.2 mois →     │
│  EBITDA    CHF 34 200 ↑    │
│  LTV/CAC   4.25×  ↑+0.3×  │
│  NPS       81.9   ↑+3pts  │
└────────────────────────────┘
```

Couleurs trend : ↑ text-green-400 | ↓ text-red-400 | → text-gray-400

Sparkline Recharts pour MRR uniquement :
```jsx
<LineChart width={140} height={40} data={mrrHistory}>
  <Line type="monotone" dataKey="value" stroke="#3b82f6" dot={false} strokeWidth={2} />
</LineChart>
```

---

### J-02 · Alertes seuils KPI configurables

**CDC** : REQ-KPI-005

**Seuils par défaut HYPERVISUAL :**
```javascript
const DEFAULT_THRESHOLDS = {
  MRR:     { warning: 60000,  critical: 40000,  unit: 'CHF',  direction: 'below' },
  ARR:     { warning: 700000, critical: 500000, unit: 'CHF',  direction: 'below' },
  RUNWAY:  { warning: 6,      critical: 3,      unit: 'mois', direction: 'below' },
  NPS:     { warning: 50,     critical: 30,     unit: 'pts',  direction: 'below' },
  LTV_CAC: { warning: 3,      critical: 2,      unit: 'x',    direction: 'below' },
  EBITDA:  { warning: 0,      critical: -10000, unit: 'CHF',  direction: 'below' }
};
```

**Backend** : `src/backend/api/kpis/thresholds.js`
- `GET /api/kpis/alerts` — KPIs en alerte (level: 'critical' | 'warning')
- `PUT /api/kpis/thresholds` — modifier seuils, stocker dans `settings` (key: 'kpi_thresholds')

**Frontend :**
- Intégrer alertes KPI dans `AlertsWidget.jsx` existant (Phase B)
- Badge rouge : `🔴 MRR critique — CHF 38 200 (seuil: 40 000)`
- Badge orange : `🟡 RUNWAY attention — 5.2 mois (seuil: 6 mois)`
- `ThresholdConfig.jsx` — formulaire config 6 seuils avec bouton "Sauvegarder"

---

### J-03 · Rapport quotidien CEO automatique par email

**CDC** : REQ-CEO-006
**Dépendance** : Mautic Phase E actif ✅

**Backend** : `src/backend/api/kpis/daily-report.js`

CRON `0 7 * * *` (07h00 chaque matin) :
1. Fetch KPIs + alertes + projets actifs + factures pendantes + trésorerie 30j
2. Générer HTML email
3. Envoyer via Mautic `sendEmailToAddress(CEO_EMAIL, sujet, html)`
4. Log dans `automation_logs`

Structure email HTML :
- En-tête : date du jour (fr-CH), HYPERVISUAL Switzerland
- Section alertes : rouge si critiques, vert si tout OK
- Tableau KPIs : MRR, ARR, Runway, NPS, LTV/CAC avec variations
- Section opérations : projets actifs, factures en attente CHF, factures en retard CHF, approbations fournisseurs count
- Section trésorerie : +30j / +60j / +90j en CHF
- Footer : "Rapport généré automatiquement par HYPERVISUAL Unified Platform"

Endpoint manuel : `POST /api/kpis/report/send` (test immédiat)

Ajouter dans `.env` : `CEO_EMAIL=jean@hypervisual.ch`

Démarrer dans `server.js` :
```javascript
import { startDailyCEOReport } from './api/kpis/daily-report.js';
startDailyCEOReport();
```

---

### J-04 · Prévision trésorerie 30/60/90 jours

**CDC** : REQ-CEO-004

**Backend** : `src/backend/api/kpis/treasury-forecast.js`

`GET /api/kpis/treasury` retourne :
```json
{
  "current_balance": 249115,
  "burn_rate_monthly": 32400,
  "runway_months": 7.7,
  "d30": { "balance": 312000, "incoming": 95000, "outgoing": 32000 },
  "d60": { "balance": 285000, "incoming": 40000, "outgoing": 67000 },
  "d90": { "balance": 241000, "incoming": 20000, "outgoing": 64000 }
}
```

Algorithme :
1. Solde actuel = `balance_after` dernière tx HYPERVISUAL (tri `-date`)
2. Entrées = `client_invoices` status sent/overdue dont `due_date` <= horizon
3. Récurrent = `subscriptions` actives dont `next_billing_date` <= horizon × 1.081 TVA
4. Sorties = `supplier_invoices` approved dont `payment_scheduled_date` <= horizon
5. Burn opérationnel = moyenne débits 90 derniers jours / 3, proratisé par horizon
6. Runway = current_balance / burn_rate_monthly (arrondi 1 décimale)

**Frontend** : `src/frontend/src/portals/superadmin/kpis/TreasuryForecast.jsx`

Intégrer dans colonne Finance du dashboard CEO :
```
┌─────────────────────────────────────┐
│  💰 Trésorerie prévisionnelle       │
│  Solde : CHF 249 115               │
│  Burn : CHF 32 400/mois            │
│  Runway : 7.7 mois                 │
├──────────┬──────────┬───────────────┤
│  +30j    │  +60j    │  +90j         │
│ 312K CHF │ 285K CHF │  241K CHF     │
├──────────┴──────────┴───────────────┤
│  [BarChart Recharts — 4 colonnes]  │
└─────────────────────────────────────┘
```

BarChart Recharts (Actuel + 30j + 60j + 90j) :
- Couleur : blue-600 si balance >= current_balance, red-500 si <
- YAxis : formatter `v => CHF ${Math.round(v/1000)}K`
- Tooltip : `CHF ${v.toLocaleString('fr-CH')}`

---

## 📁 STRUCTURE FICHIERS

```
src/backend/api/kpis/
├── index.js              # J-01 — /latest, /history/:metric, /summary
├── thresholds.js         # J-02 — /alerts, PUT /thresholds
├── daily-report.js       # J-03 — CRON 07h00 + POST /report/send
└── treasury-forecast.js  # J-04 — GET /treasury

src/frontend/src/portals/superadmin/kpis/
├── KPIWidget.jsx          # J-01 — Sidebar KPIs + sparkline MRR
├── ThresholdConfig.jsx    # J-02 — Config seuils alertes
└── TreasuryForecast.jsx   # J-04 — Prévision 30/60/90j BarChart
```

---

## 🔌 INTÉGRATION SERVER.JS

```javascript
import kpisRouter from './api/kpis/index.js';
import { startDailyCEOReport } from './api/kpis/daily-report.js';

app.use('/api/kpis', kpisRouter);
startDailyCEOReport();
```

---

## 🧪 TESTS RAPIDES

```bash
curl http://localhost:3001/api/kpis/latest
curl "http://localhost:3001/api/kpis/history/MRR?days=30"
curl http://localhost:3001/api/kpis/alerts
curl -X POST http://localhost:3001/api/kpis/report/send
curl http://localhost:3001/api/kpis/treasury
```

---

## 📝 FORMAT COMMITS

```
feat(J-01): kpi widget sidebar recharts sparkline mrr arr nps
feat(J-02): alertes seuils kpi configurables settings directus
feat(J-03): rapport quotidien ceo 07h00 mautic email html
feat(J-04): prevision tresorerie 30-60-90 jours recharts barchart
feat(phase-j): update ROADMAP.md J-01 to J-04 [V] DONE — V1 COMPLETE
```

---

## 🏁 ÉTAPE FINALE OBLIGATOIRE — APRÈS J-04

Créer `V1-COMPLETE.md` à la racine du projet :

```markdown
# HYPERVISUAL Unified Platform — V1 COMPLETE
**Date** : 2026-02-20
**Score** : 95/96 stories (F-02 WhatsApp reporté Phase F-bis)

## Phases complétées
- Phase A : 47/47 — Infrastructure & Portails
- Phase B : 8/8 — Cycle de vente
- Phase C : 8/8 — Portail Client
- Phase D : 7/7 — Portail Prestataire
- Phase E : 6/6 — Emails Mautic
- Phase F : 3/4 — Lead Capture Multicanal
- Phase G : 5/5 — Revolut Réconciliation
- Phase H : 3/3 — DocuSeal Signatures
- Phase I : 8/8 — Finance Avancés
- Phase J : 4/4 — KPI Dashboard + Rapport CEO

## Prochaines étapes post-V1
- Phase F-bis : WhatsApp Business API (F-02)
- Phase K : Multi-entreprises (DAINAMICS, LEXAIA, ENKI REALTY, TAKEOUT)
```

Commit final : `feat(v1): HYPERVISUAL Unified Platform V1 complete — 95/96 stories`
