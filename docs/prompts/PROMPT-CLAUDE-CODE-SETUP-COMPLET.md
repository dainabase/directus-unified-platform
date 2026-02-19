# 🚀 PROMPT CLAUDE CODE - INSTALLATION & CONFIGURATION COMPLÈTE
## Directus Unified Platform - Full-Stack Specialist Setup

**Date**: 19 Février 2026
**Repository**: https://github.com/dainabase/directus-unified-platform
**Objectif**: Transformer Claude Code en spécialiste mondial Directus + Full-Stack + Swiss Compliance

---

## 📋 CONTEXTE DU PROJET

Tu travailles sur `directus-unified-platform` — une plateforme de gestion d'entreprise multi-portails :
- **Backend**: Directus 10.x + PostgreSQL 15 + Redis 7 + Node.js 18+
- **Frontend**: React 18.2 + Vite 5.0 + Tabler.io (CDN acheté) + Recharts
- **4 Portails**: SuperAdmin (CEO), Client, Prestataire, Revendeur
- **5 Entreprises**: HYPERVISUAL, DAINAMICS, LEXAIA, ENKI REALTY, TAKEOUT
- **62+ collections Directus**, 156 endpoints custom
- **Intégrations**: Invoice Ninja v5, Revolut Business API v2, ERPNext v15, Mautic 5.x, OpenAI Vision (OCR)
- **Conformité suisse**: QR-Invoice v2.3, TVA 2025, Plan comptable PME Käfer, Signatures ZertES

Le repo existe déjà avec un CLAUDE.md, un `.claude/settings.local.json`, et un `.mcp/directus-mcp-server.js`.

---

## 🎯 MISSION COMPLÈTE - EXÉCUTER DANS L'ORDRE

Tu dois tout exécuter séquentiellement. Pour chaque étape, confirme le succès avant de passer à la suivante. Si une commande échoue, signale l'erreur et propose une alternative.

---

## PHASE 1 — MCP SERVERS (Priorité Absolue)

### 1.1 Context7 (documentation live 44,000+ libraries)
```bash
claude mcp add context7 -s user -- npx -y @upstash/context7-mcp@latest
```

### 1.2 Sequential Thinking (raisonnement complexe multi-étapes)
```bash
claude mcp add thinking -s user -- npx -y @modelcontextprotocol/server-sequential-thinking
```

### 1.3 PostgreSQL MCP (accès direct DB 62+ collections)
```bash
claude mcp add postgres -- npx -y @modelcontextprotocol/server-postgres "postgresql://directus:${DB_PASSWORD}@localhost:5432/directus_db"
```
> ⚠️ Adapter les credentials selon le `.env` local

### 1.4 Directus MCP (bridge pour Directus 10.x)
```bash
claude mcp add directus -- npx -y @pixelsock/directus-mcp@latest
```
> ⚠️ Vérifier d'abord si le `.mcp/directus-mcp-server.js` existant fonctionne. Si oui, ne pas écraser.

### 1.5 Playwright MCP (E2E testing des 4 portails)
```bash
claude mcp add playwright -- npx -y @playwright/mcp@latest
```

### 1.6 Créer/Mettre à jour `.mcp.json` à la racine du projet
```json
{
  "mcpServers": {
    "directus": {
      "command": "npx",
      "args": ["-y", "@pixelsock/directus-mcp@latest"],
      "env": {
        "DIRECTUS_URL": "http://localhost:8055",
        "DIRECTUS_EMAIL": "${DIRECTUS_ADMIN_EMAIL}",
        "DIRECTUS_PASSWORD": "${DIRECTUS_ADMIN_PASSWORD}"
      }
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres", "postgresql://directus:${DB_PASSWORD}@localhost:5432/directus_db"]
    },
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"]
    },
    "sequential-thinking": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"]
    },
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    },
    "eslint": {
      "command": "npx",
      "args": ["@eslint/mcp@latest"]
    }
  }
}
```

### 1.7 Vérification MCP
```bash
claude mcp list
```
Confirme que tous les MCP servers sont listés et actifs.

---

## PHASE 2 — INSTALLATION SKILL REPOSITORIES

### 2.1 Tier 1 — Core Repositories

```bash
# Anthropic Official Skills
git clone https://github.com/anthropics/skills.git ~/.claude/skills-repos/anthropics-skills

# Anthropic Official Plugins
git clone https://github.com/anthropics/claude-plugins-official.git ~/.claude/skills-repos/claude-plugins-official

# Awesome Claude Code Toolkit (135 agents, 35 skills, 42 commands, 120 plugins, 19 hooks)
git clone https://github.com/rohitg00/awesome-claude-code-toolkit.git ~/.claude/skills-repos/awesome-claude-code-toolkit

# Claude Code Plugins Plus (270+ plugins, 1,537 agent skills) — déjà installé potentiellement
# Vérifier d'abord: ls ~/.claude/skills-repos/ | grep -i plugin
git clone https://github.com/jeremylongshore/claude-code-plugins-plus-skills.git ~/.claude/skills-repos/claude-code-plugins-plus-skills 2>/dev/null || echo "Déjà cloné ou erreur"
```

### 2.2 Tier 2 — Collections Spécialisées

```bash
# Jeffallan (66 skills: Postgres Pro, API Designer, GraphQL Architect, TypeScript Pro)
git clone https://github.com/Jeffallan/claude-skills.git ~/.claude/skills-repos/jeffallan-claude-skills

# Alirezarezvani (53 skills: Engineering, Finance, Regulatory, C-Level)
git clone https://github.com/alirezarezvani/claude-skills.git ~/.claude/skills-repos/alirezarezvani-claude-skills

# Levnikolaevich (102 skills: Full Agile lifecycle)
git clone https://github.com/levnikolaevich/claude-code-skills.git ~/.claude/skills-repos/levnikolaevich-claude-code-skills

# Jamie-BitFlight (20 plugins: hallucination-detector, plugin-creator)
git clone https://github.com/Jamie-BitFlight/claude_skills.git ~/.claude/skills-repos/jamie-bitflight-claude-skills

# Daymade (github-ops, deep-research, ui-designer, i18n-expert)
git clone https://github.com/daymade/claude-code-skills.git ~/.claude/skills-repos/daymade-claude-code-skills

# Jezweb (24 skills: React, Tailwind, frontend testing)
git clone https://github.com/jezweb/claude-skills.git ~/.claude/skills-repos/jezweb-claude-skills

# Shinpr (workflows: /front-design, /front-build)
git clone https://github.com/shinpr/claude-code-workflows.git ~/.claude/skills-repos/shinpr-claude-code-workflows
```

### 2.3 Tier 3 — Skills Essentiels

```bash
# Skill Factory (meta-outil pour générer des skills custom on-demand)
git clone https://github.com/alirezarezvani/claude-code-skill-factory.git ~/.claude/skills-repos/skill-factory

# Everything Claude Code (backend patterns: REST, JWT, RBAC, Zod, retry)
git clone https://github.com/affaan-m/everything-claude-code.git ~/.claude/skills-repos/everything-claude-code
```

### 2.4 Outils Écosystème

```bash
# SkillKit (accès 15,000+ skills via agentskills.com)
npx skillkit@latest

# Agent Skills CLI
npx agent-skills-cli
```

### 2.5 Vérification des installations
```bash
echo "=== Skills Repos installés ==="
ls -la ~/.claude/skills-repos/ 2>/dev/null
echo ""
echo "=== Project Skills ==="
ls -la .claude/skills/ 2>/dev/null
echo ""
echo "=== Global Skills ==="
ls -la ~/.claude/skills/ 2>/dev/null
```

---

## PHASE 3 — CUSTOM SKILLS (8 SKILLS SPÉCIALISÉS)

Crée le dossier de skills projet s'il n'existe pas :
```bash
mkdir -p .claude/skills
```

### 3.1 `directus-extension-architect` — CRITIQUE

Crée `.claude/skills/directus-extension-architect/SKILL.md` :

```markdown
---
name: directus-extension-architect
description: Expert en développement d'extensions Directus 10.x — custom endpoints, hooks (filter/action), operations, interfaces, modules, bundles, Flows automation, et le SDK composable. Ce skill doit être utilisé quand l'utilisateur travaille sur des extensions Directus, des endpoints custom, des hooks, ou des patterns d'API Directus.
---

# Directus Extension Architecture Expert

## Extension Types
- **Endpoints**: Custom API routes via `defineEndpoint()`. TOUJOURS utiliser `ItemsService` (jamais raw Knex) pour respecter les permissions Directus.
- **Hooks**: `filter('items.create', ...)` pour validation pré-save, `action('items.create', ...)` pour side effects post-save.
- **Operations**: Pour Directus Flows (triggers: event, schedule, webhook). Run Script = sandboxed JS.
- **Bundles**: Packaging multiple extensions ensemble.
- **Interfaces/Modules**: UI components custom dans l'admin Directus.

## Standard Endpoint Template
\`\`\`typescript
import { defineEndpoint } from '@directus/extensions-sdk';

export default defineEndpoint((router, context) => {
  const { services, getSchema } = context;
  
  router.get('/', async (req, res) => {
    try {
      const schema = await getSchema();
      const { ItemsService } = services;
      const itemsService = new ItemsService('collection_name', {
        schema,
        accountability: req.accountability,
      });
      
      const items = await itemsService.readByQuery({
        limit: 25,
        filter: { status: { _eq: 'active' } },
        meta: ['total_count'],
      });
      
      res.json({ data: items });
    } catch (error) {
      res.status(500).json({ 
        error: { 
          code: 'INTERNAL_ERROR', 
          message: error.message 
        } 
      });
    }
  });
});
\`\`\`

## Hook Template
\`\`\`typescript
import { defineHook } from '@directus/extensions-sdk';

export default defineHook(({ filter, action }, { services, getSchema }) => {
  // Validation pré-save
  filter('items.create', async (payload, meta, { schema, accountability }) => {
    if (meta.collection === 'invoices') {
      if (!payload.amount || payload.amount <= 0) {
        throw new Error('Le montant doit être positif');
      }
    }
    return payload;
  });

  // Side effect post-save
  action('items.create', async (meta, { schema, accountability }) => {
    if (meta.collection === 'invoices') {
      // Sync vers Invoice Ninja, envoyer notification, etc.
    }
  });
});
\`\`\`

## SDK Composable
\`\`\`typescript
import { createDirectus, rest, authentication } from '@directus/sdk';

const client = createDirectus('http://localhost:8055')
  .with(rest())
  .with(authentication());

await client.login('email', 'password');
const items = await client.request(readItems('projects'));
\`\`\`

## Schema Migrations
\`\`\`bash
npx directus schema snapshot > schema.yaml    # Capturer l'état actuel
npx directus schema diff schema.yaml          # Comparer les changements
npx directus schema apply ./schema-diff.yaml  # Appliquer les changements
\`\`\`

## Règles Critiques
- TOUJOURS `ItemsService` over raw Knex pour respecter les permissions
- TOUJOURS `try/catch` dans les endpoints
- TOUJOURS `req.accountability` pour le contexte utilisateur
- Extension hot-reload: `EXTENSIONS_AUTO_RELOAD=true` (dev only)
- Cache: `CACHE_ENABLED=true`, `CACHE_STORE=redis`, `CACHE_AUTO_PURGE=true`
- Marketplace: npm keyword `directus-extension`
```

### 3.2 `swiss-compliance-engine` — CRITIQUE

Crée `.claude/skills/swiss-compliance-engine/SKILL.md` :

```markdown
---
name: swiss-compliance-engine
description: Spécialiste conformité business suisse — QR-Invoice v2.3 (SIX Group), TVA 2025 (8.1%/2.6%/3.8%), Plan comptable PME Käfer, signatures électroniques ZertES, ISO 20022, multi-devises CHF/EUR/USD. Ce skill doit être utilisé quand l'utilisateur travaille sur des factures, la TVA, la comptabilité, la conformité, ou les QR-bills pour le marché suisse.
---

# Swiss Business Compliance Engine

## QR-Invoice (QR-Facture)
- **Norme**: SIX Group Implementation Guidelines v2.3
- **Library**: `swissqrbill` npm v4.2.0 (seule library JS maintenue)
- **Format**: Adresses structurées OBLIGATOIRES depuis Nov 2025
- **QR-IBAN vs IBAN**: QR-IBAN commence par 30/31 (positions 5-6), IBAN standard sinon
- **Types de référence**: QR Reference (26 chiffres + check digit), Creditor Reference (ISO 11649)
- **Layout**: A6 payment slip (148×105mm)
- **Monnaies acceptées**: CHF et EUR uniquement

\`\`\`javascript
import { SwissQRBill } from 'swissqrbill';

const bill = new SwissQRBill({
  currency: 'CHF',
  amount: 1500.00,
  creditor: {
    name: 'HYPERVISUAL Switzerland Sàrl',
    address: 'Rue Example 1',
    zip: '1000',
    city: 'Lausanne',
    country: 'CH',
    account: 'CH44 3199 9123 0008 8901 2' // QR-IBAN
  },
  debtor: {
    name: 'Client Sàrl',
    address: 'Avenue Test 2',
    zip: '1200',
    city: 'Genève',
    country: 'CH'
  },
  reference: '210000000003139471430009017', // QR Reference
  message: 'Facture 2024-001'
});
\`\`\`

## TVA Suisse 2025
- **Taux normal**: 8.1% (majorité des biens et services)
- **Taux réduit**: 2.6% (alimentation, livres, médicaments)
- **Taux hébergement**: 3.8% (hôtellerie)
- **Seuil d'assujettissement**: CHF 100'000 de CA annuel
- **Méthodes**: Effective (déduction TVA input) ou forfaitaire (taux sectoriels)
- **Déclaration**: Trimestrielle auprès de l'AFC/FTA
- **⚠️ JAMAIS hardcoder les taux** → toujours référencer un fichier de config

\`\`\`javascript
// config/vat-rates.js — SOURCE UNIQUE DE VÉRITÉ
export const VAT_RATES_2025 = {
  NORMAL: 0.081,        // 8.1%
  REDUCED: 0.026,       // 2.6%
  ACCOMMODATION: 0.038, // 3.8%
  EXEMPT: 0,            // Exonéré
};
\`\`\`

## Plan Comptable PME Käfer (9 classes décimales)
| Classe | Désignation | Exemples de comptes |
|--------|-------------|---------------------|
| 1 | Actifs | 1000 Caisse, 1020 Banque, 1100 Débiteurs |
| 2 | Passifs & Capitaux propres | 2000 Créanciers, 2200 TVA due, 2800 Capital |
| 3 | Produits d'exploitation | 3000 Ventes, 3200 Prestations services |
| 4 | Charges matières | 4000 Achats, 4400 Sous-traitance |
| 5 | Charges personnel | 5000 Salaires, 5700 Charges sociales |
| 6 | Autres charges exploit. | 6000 Loyer, 6500 Assurances, 6600 Amortissements |
| 7 | Produits hors exploit. | 7000 Produits financiers |
| 8 | Charges hors exploit. | 8000 Charges financières, 8500 Charges except. |
| 9 | Clôture | 9000 Bilan d'ouverture, 9100 Compte résultat |

## Signatures Électroniques (ZertES)
- **SES** (Simple): Email, SMS — pas de valeur juridique forte
- **AES** (Avancée): Identité vérifiée — valeur juridique moyenne
- **QES** (Qualifiée): Équivalent signature manuscrite — fournisseurs: **Swisscom Trust Services** (API REST OIDC-PAR/CIBA) ou **SwissSign AG**
- Double conformité ZertES (Suisse) + eIDAS (UE) pour le transfrontalier

## Multi-Devises
- **Library**: `Dinero.js` v2 pour l'arithmétique monétaire
- **Devise primaire**: CHF (centimes = integer cents)
- **Taux de change**: SNB Data Portal (BNS) ou ECB API pour EUR/CHF
- **⚠️ JAMAIS de float pour les montants** → toujours integer centimes + Dinero.js

\`\`\`javascript
import { dinero, add, multiply } from 'dinero.js';
import { CHF, EUR } from '@dinero.js/currencies';

const price = dinero({ amount: 150000, currency: CHF }); // CHF 1'500.00
const vat = multiply(price, { amount: 81, scale: 3 });    // 8.1%
const total = add(price, vat);
\`\`\`

## Zefix API (Registre du commerce)
- URL: `https://www.zefix.admin.ch/ZefixPublicREST/`
- Format UID: CHE-xxx.xxx.xxx
- Lookup entreprise par nom, UID, ou numéro registre

## Recouvrement (SchKG/LP)
1. **Mahnung 1** (rappel amiable) — 10 jours
2. **Mahnung 2** (mise en demeure) — 10 jours
3. **Mahnung 3** (dernier avertissement) — 10 jours
4. **Betreibungsbegehren** (réquisition de poursuite) — Office des poursuites
5. Commandement de payer — 20 jours pour opposition du débiteur
6. Si opposition → 10 jours pour la lever (mainlevée)
7. Intérêt moratoire: **5%** (Art. 104 CO)
```

### 3.3 `multi-portal-architecture` — HIGH

Crée `.claude/skills/multi-portal-architecture/SKILL.md` :

```markdown
---
name: multi-portal-architecture
description: Architecture React multi-portails pour dashboards role-based — SuperAdmin/CEO, Client, Prestataire, Revendeur portals avec RBAC, layout routes, et shared component patterns. Ce skill doit être utilisé quand l'utilisateur travaille sur les portails, le routing, l'authentification, ou les layouts multi-rôles.
---

# Multi-Portal React Architecture

## Routing Structure (React Router v6)
\`\`\`jsx
<Routes>
  <Route path="/login" element={<LoginPage />} />
  <Route element={<RoleBasedRoute allowedRoles={['superadmin']}><AdminLayout /></RoleBasedRoute>}>
    <Route path="/admin" element={<AdminDashboard />} />
    <Route path="/admin/projects" element={<ProjectsPage />} />
    <Route path="/admin/finance" element={<FinancePage />} />
  </Route>
  <Route element={<RoleBasedRoute allowedRoles={['client']}><ClientLayout /></RoleBasedRoute>}>
    <Route path="/client" element={<ClientDashboard />} />
    <Route path="/client/invoices" element={<InvoicesPage />} />
  </Route>
  <Route element={<RoleBasedRoute allowedRoles={['prestataire']}><PrestataireLayout /></RoleBasedRoute>}>
    <Route path="/prestataire" element={<PrestataireDashboard />} />
  </Route>
  <Route element={<RoleBasedRoute allowedRoles={['revendeur']}><RevendeurLayout /></RoleBasedRoute>}>
    <Route path="/revendeur" element={<RevendeurDashboard />} />
  </Route>
</Routes>
\`\`\`

## RoleBasedRoute Component
\`\`\`jsx
export const RoleBasedRoute = ({ allowedRoles, children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/unauthorized" />;
  return children;
};
\`\`\`

## State Management
- **Zustand**: Client state (portal selection, UI preferences, theme)
- **TanStack Query**: Server/API state (Directus data, refetchInterval pour real-time)

## Portal Layouts
- **SuperAdmin**: Full sidebar + navbar + analytics + all controls + multi-company selector
- **Client**: Simplified sidebar + projets + factures + tickets support
- **Prestataire**: Tasks + timesheets + disponibilité + documents
- **Revendeur**: Commissions + acquisition clients + catalogue produits

## Code-Splitting
\`\`\`javascript
// vite.config.js — manualChunks per portal
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'portal-admin': ['./src/portals/admin/index.jsx'],
        'portal-client': ['./src/portals/client/index.jsx'],
        'portal-prestataire': ['./src/portals/prestataire/index.jsx'],
        'portal-revendeur': ['./src/portals/revendeur/index.jsx'],
      }
    }
  }
}
\`\`\`

## Tabler.io Integration
- CSS via CDN dans `index.html`: `@tabler/core@1.0.0-beta20`
- Icons: `@tabler/icons-react` via npm
- Classes: `card`, `badge`, `btn`, `page-header`, `page-body`, `navbar`, `nav-item`
- TOUJOURS utiliser les classes Tabler existantes avant d'écrire du CSS custom

## Forms
- **React Hook Form** + **Zod** resolver pour validation type-safe
- Chaque formulaire a un schema Zod correspondant
```

### 3.4 `directus-api-patterns` — HIGH

Crée `.claude/skills/directus-api-patterns/SKILL.md` :

```markdown
---
name: directus-api-patterns
description: Design patterns pour 156+ custom Directus API endpoints — authentification, error handling, pagination, filtering, caching, rate limiting, et webhook receivers. Ce skill doit être utilisé quand l'utilisateur crée ou modifie des endpoints API custom Directus.
---

# Directus API Patterns

## Standard Error Response
\`\`\`json
{ "error": { "code": "VALIDATION_ERROR", "message": "Description", "details": {} } }
\`\`\`

## Pagination Standard
\`\`\`
GET /api/items?limit=25&offset=0&meta=total_count&filter[status][_eq]=active&sort=-date_created
\`\`\`

## Authentication
- Directus JWT tokens dans `Authorization: Bearer <token>`
- `req.accountability` contient user ID, role, permissions
- TOUJOURS vérifier `req.accountability` dans les endpoints sensibles

## Webhook Receiver Pattern
\`\`\`typescript
router.post('/webhook/:provider', async (req, res) => {
  // 1. ACK immédiat (200) pour éviter les timeouts
  res.status(200).json({ received: true });
  
  // 2. Persist dans BullMQ pour traitement async
  await webhookQueue.add('process', {
    provider: req.params.provider,
    payload: req.body,
    headers: req.headers,
    receivedAt: new Date().toISOString(),
  });
});
\`\`\`

## Rate Limiting
\`\`\`javascript
import Bottleneck from 'bottleneck';
const limiter = new Bottleneck({ maxConcurrent: 5, minTime: 200 });
const result = await limiter.schedule(() => externalApiCall());
\`\`\`

## Retry Logic
\`\`\`javascript
import pRetry from 'p-retry';
const result = await pRetry(() => fetchFromExternalAPI(), {
  retries: 3,
  onFailedAttempt: (error) => console.log(`Attempt ${error.attemptNumber} failed`),
});
\`\`\`

## Batch Operations
\`\`\`typescript
const itemsService = new ItemsService('collection', { schema, accountability });
// Bulk create
await itemsService.createMany([item1, item2, item3]);
// Bulk update
await itemsService.updateMany([id1, id2], { status: 'active' });
\`\`\`
```

### 3.5 `integration-sync-engine` — HIGH

Crée `.claude/skills/integration-sync-engine/SKILL.md` :

```markdown
---
name: integration-sync-engine
description: Patterns de synchronisation bidirectionnelle pour Invoice Ninja v5, Revolut Business API v2, ERPNext v15, Mautic 5.x, et OpenAI Vision OCR. Ce skill doit être utilisé quand l'utilisateur travaille sur les intégrations externes, les webhooks, ou la synchronisation de données.
---

# Integration Sync Engine

## Invoice Ninja v5
- **Auth**: Header `X-API-TOKEN` + `X-Requested-With: XMLHttpRequest`
- **Base URL**: `http://localhost:8080/api/v1/`
- **Entities**: clients, invoices, payments, expenses, products
- **Pagination**: `?per_page=50&page=2`
- Pas de SDK Node officiel → REST direct avec axios

## Revolut Business API v2
- **Auth Flow**: RSA key pair → JWT client assertion (RS256) → OAuth2 code flow → access token (40min) + refresh token (90 jours)
- **Scopes**: READ, WRITE, PAY
- **Library**: `revolut-sdk` npm ou custom `jsonwebtoken` + `axios`
- **⚠️ Token expire en 40min** — TOUJOURS implémenter le refresh flow
\`\`\`javascript
import jwt from 'jsonwebtoken';
const clientAssertion = jwt.sign(
  { sub: CLIENT_ID, iss: CLIENT_ID, aud: 'https://revolut.com' },
  PRIVATE_KEY,
  { algorithm: 'RS256', expiresIn: '60s' }
);
\`\`\`

## ERPNext v15
- **API v2**: `/api/v2/document/` et `/api/v2/method/`
- **Auth**: `token api_key:api_secret`
- **Filtres**: `?filters=[["field","=","value"]]`
- **Library**: `node-erpnext` npm

## Mautic 5.x
- **Auth**: Basic auth ou OAuth2
- **Webhook verification**: HMAC-SHA256 via header `Webhook-Signature`
- **Events clés**: `mautic.lead_post_save_new`, `form.submit`, `email.open`
- **Library**: `node-mautic` npm (version vdavid)
- Mautic gère TOUS les emails (marketing + transactionnels)

## OpenAI Vision OCR
\`\`\`javascript
import OpenAI from 'openai';
const openai = new OpenAI();
const response = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [{
    role: 'user',
    content: [
      { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } },
      { type: 'text', text: 'Extrais les données de cette facture en JSON structuré...' }
    ]
  }]
});
\`\`\`

## Architecture de Sync
- **Outbound**: Directus hooks (action events) → appels API externes
- **Inbound**: Custom endpoints → réception webhooks → BullMQ async processing
- **Reconciliation**: CRON périodique pour rattraper les événements manqués
- **Idempotency**: Clés d'idempotence pour éviter les doublons
- **Circuit Breaker**: Désactiver temporairement un service externe en panne
```

### 3.6 `ceo-dashboard-designer` — MEDIUM

Crée `.claude/skills/ceo-dashboard-designer/SKILL.md` :

```markdown
---
name: ceo-dashboard-designer
description: Patterns dashboard CEO/SuperAdmin exécutif — KPI cards, visualisations Recharts, effets glassmorphism, données real-time avec TanStack Query, intégration layout Tabler.io. Ce skill doit être utilisé quand l'utilisateur travaille sur le dashboard SuperAdmin, les graphiques, ou les composants KPI.
---

# CEO Dashboard Designer

## KPI Card Component
\`\`\`jsx
export const KpiCard = ({ title, value, delta, trend, icon }) => (
  <div className="card" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '16px' }}>
    <div className="card-body">
      <div className="d-flex align-items-center">
        <div className="subheader">{title}</div>
      </div>
      <div className="h1 mb-0">{value}</div>
      <div className={`text-${delta >= 0 ? 'success' : 'danger'}`}>
        {delta >= 0 ? '↑' : '↓'} {Math.abs(delta)}%
      </div>
      <ResponsiveContainer width="100%" height={40}>
        <AreaChart data={trend}><Area type="monotone" dataKey="value" stroke="#206bc4" fill="rgba(32,107,196,0.1)" /></AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
);
\`\`\`

## Chart Patterns (Recharts)
- `<ComposedChart>` : Revenue bars + trend line
- `<PieChart>` : Distribution portfolio
- `<BarChart>` stacked : Par portail/entreprise
- `<LineChart>` : Avec auto-refresh via TanStack Query `refetchInterval`
- TOUJOURS wrapper dans `<ResponsiveContainer width="100%" height={300}>`

## Glassmorphism CSS
\`\`\`css
.glass-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
}
@media (prefers-reduced-transparency: reduce) {
  .glass-card { background: rgba(255, 255, 255, 0.95); backdrop-filter: none; }
}
\`\`\`

## Layout Structure (Tabler.io)
- `navbar` → Top navigation avec company selector
- `navbar-aside` → Sidebar avec navigation modules
- `page-header` → Titre page + breadcrumbs + alertes
- `page-body` → Grid de cards et composants
- UTILISER les classes CSS Tabler (`card`, `row`, `col-md-6`, etc.)
```

### 3.7 `postgresql-directus-optimizer` — MEDIUM

Crée `.claude/skills/postgresql-directus-optimizer/SKILL.md` :

```markdown
---
name: postgresql-directus-optimizer
description: Optimisation PostgreSQL 15 pour Directus avec 62+ collections — stratégies d'indexation, organisation de schéma, vues matérialisées, partitionnement, EXPLAIN ANALYZE, connection pooling. Ce skill doit être utilisé quand l'utilisateur travaille sur les performances de la base de données, les migrations, ou l'optimisation des requêtes.
---

# PostgreSQL + Directus Optimizer

## Indexing Strategies
- Composite indexes pour les WHERE+JOIN fréquents
- GIN indexes pour les colonnes JSONB
- Partial indexes pour les requêtes filtrées (`WHERE status = 'active'`)
- UUID primary keys (Directus default: `gen_random_uuid()`)

## Materialized Views (Dashboard CEO)
\`\`\`sql
CREATE MATERIALIZED VIEW mv_revenue_by_company AS
SELECT company_id, date_trunc('month', date_created) AS month,
       SUM(amount) AS total_revenue, COUNT(*) AS invoice_count
FROM client_invoices WHERE status = 'paid'
GROUP BY company_id, date_trunc('month', date_created);

-- Rafraîchir via CRON
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_revenue_by_company;
\`\`\`

## Directus Schema Migrations
\`\`\`bash
npx directus schema snapshot > schema.yaml
npx directus schema diff schema.yaml
npx directus schema apply ./schema-diff.yaml
\`\`\`

## Cache Redis pour Directus
- `CACHE_ENABLED=true`
- `CACHE_STORE=redis`
- `CACHE_AUTO_PURGE=true`
- `CACHE_TTL=5m`
- Monitor: namespace `directus-cache`
```

### 3.8 `docker-stack-ops` — MEDIUM

Crée `.claude/skills/docker-stack-ops/SKILL.md` :

```markdown
---
name: docker-stack-ops
description: Opérations Docker Compose pour stack Directus + PostgreSQL 15 + Redis 7 + Node.js — configuration production, health checks, volume management, variables d'environnement. Ce skill doit être utilisé quand l'utilisateur travaille sur Docker, le déploiement, ou la configuration des services.
---

# Docker Stack Operations

## Production docker-compose Template
\`\`\`yaml
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: directus_db
      POSTGRES_USER: directus
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U directus"]
      interval: 10s
      timeout: 5s
      retries: 5
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]

  directus:
    image: directus/directus:10.13
    depends_on:
      postgres: { condition: service_healthy }
      redis: { condition: service_healthy }
    environment:
      DB_CLIENT: pg
      DB_HOST: postgres
      DB_PORT: 5432
      DB_DATABASE: directus_db
      CACHE_ENABLED: "true"
      CACHE_STORE: redis
      REDIS: redis://redis:6379
      EXTENSIONS_AUTO_RELOAD: "false"  # production
    volumes:
      - ./uploads:/directus/uploads
      - ./extensions:/directus/extensions

volumes:
  pgdata:
\`\`\`

## Memory Allocation (minimum)
- PostgreSQL: 2GB
- Directus: 1GB
- Redis: 512MB
```

---

## PHASE 4 — MISE À JOUR CLAUDE.md

Le CLAUDE.md root existe déjà à la racine du repo. Il faut le **remplacer** (pas append) par cette version optimisée. **Lis d'abord le CLAUDE.md actuel** pour ne pas perdre d'informations spécifiques qui y sont déjà, puis fusionne avec le template ci-dessous :

```markdown
# Directus Unified Platform — Multi-Portal Business Management

Plateforme de gestion multi-entreprises avec 4 portails (SuperAdmin, Client, Prestataire, Revendeur),
5 entreprises (HYPERVISUAL, DAINAMICS, LEXAIA, ENKI REALTY, TAKEOUT), conformité légale suisse.

## Tech Stack
- Backend: Directus 10.x (headless CMS), PostgreSQL 15, Redis 7, Node.js 18+
- Frontend: React 18.2, Vite 5.0, Tabler.io (CDN @1.0.0-beta20), Recharts, React Router v6
- State: Zustand (client) + TanStack Query (server/API)
- Forms: React Hook Form + Zod
- Intégrations: Invoice Ninja v5, Revolut Business API v2, ERPNext v15, Mautic 5.x, OpenAI Vision
- Docker Compose pour tous les services

## Commands
- `docker compose up -d` — Start full stack
- `cd frontend && npm run dev` — React dev server (port 3000)
- `cd frontend && npm run build` — Production build
- `cd frontend && npm run lint` — ESLint + Prettier
- `npx directus schema snapshot > schema.yaml` — Snapshot schema
- `npx directus schema apply ./schema-diff.yaml` — Apply changes

## Architecture
- `/directus/extensions/` — Custom endpoints, hooks, operations (TypeScript)
- `/src/portals/admin/` — SuperAdmin/CEO portal
- `/src/portals/client/` — Client portal
- `/src/portals/prestataire/` — Prestataire portal
- `/src/portals/revendeur/` — Revendeur portal
- `/src/components/` — Shared React components
- `/integrations/` — External API sync modules
- `/backend/` — Backend services & API routes

## Code Conventions
- TypeScript strict mode, no `any` types
- Functional React components, hooks only
- Named exports (no default exports)
- All Directus endpoints: ItemsService (NEVER raw Knex)
- All monetary values: integer cents (CHF centimes), Dinero.js for arithmetic
- Swiss locale: fr-CH primary, de-CH secondary, date DD.MM.YYYY

## Swiss Compliance (Critical)
- QR-Invoice: SIX Group IG v2.3, structured addresses mandatory, `swissqrbill` npm
- VAT: 8.1% normal, 2.6% reduced, 3.8% accommodation — NEVER hardcode, always config
- Chart of accounts: Swiss PME Käfer (9 decimal classes)
- Signatures: ZertES-compliant QES via Swisscom Trust Services
- Currency: CHF primary, EUR/USD supported, Dinero.js

## Warnings
- NEVER commit .env or API tokens
- NEVER bypass Directus permissions with raw SQL
- NEVER use ApexCharts (use Recharts)
- NEVER use S3 storage (use Directus Storage)
- NEVER use SendGrid (use Mautic for ALL emails)
- Revolut tokens expire 40min — ALWAYS implement refresh
- TVA rates: 8.1%, 2.6%, 3.8% — NEVER 7.7%, 2.5%, 3.7% (anciens taux)
```

Crée aussi des CLAUDE.md dans les sous-répertoires si ils n'existent pas :

**`directus/extensions/CLAUDE.md`** — Conventions extensions Directus
**`src/portals/CLAUDE.md`** — Routing multi-portails, RBAC
**`integrations/CLAUDE.md`** — Auth patterns API externes, webhook handling

---

## PHASE 5 — NPM PACKAGES ESSENTIELS

Installe les packages nécessaires aux 156 endpoints custom et aux intégrations :

```bash
# Swiss compliance
npm install swissqrbill dinero.js @dinero.js/currencies

# Intégrations
npm install openai jsonwebtoken axios

# Job processing & resilience
npm install bullmq bottleneck p-retry

# Validation
npm install zod

# Directus SDK
npm install @directus/sdk @directus/extensions-sdk

# Frontend (dans le dossier frontend si séparé)
cd frontend && npm install @tanstack/react-query zustand react-hook-form @hookform/resolvers recharts react-router-dom react-hot-toast @tabler/icons-react
```

---

## PHASE 6 — VÉRIFICATION FINALE

Exécute ces vérifications pour confirmer que tout est en place :

```bash
echo "=== 1. MCP Servers ==="
claude mcp list

echo ""
echo "=== 2. Skills Custom (projet) ==="
ls -la .claude/skills/*/SKILL.md 2>/dev/null

echo ""
echo "=== 3. Skills Repos (global) ==="
ls -la ~/.claude/skills-repos/ 2>/dev/null

echo ""
echo "=== 4. CLAUDE.md ==="
head -5 CLAUDE.md

echo ""
echo "=== 5. .mcp.json ==="
cat .mcp.json 2>/dev/null || echo "Pas de .mcp.json"

echo ""
echo "=== 6. NPM Packages ==="
npm list swissqrbill dinero.js openai zod bullmq 2>/dev/null

echo ""
echo "=== 7. Git Status ==="
git status --short
```

---

## 📌 RÉCAPITULATIF

| Composant | Quantité | Statut |
|-----------|----------|--------|
| MCP Servers | 6 | À installer |
| Skill Repositories | 12 repos | À cloner |
| Custom Skills | 8 fichiers | À créer |
| CLAUDE.md | 1 root + 3 sous-dirs | À mettre à jour |
| NPM Packages | ~15 packages | À installer |
| .mcp.json | 1 fichier | À créer/mettre à jour |

**Ordre d'exécution**: Phase 1 → 2 → 3 → 4 → 5 → 6

**⚠️ IMPORTANT**: 
- Si une commande échoue, signale l'erreur IMMÉDIATEMENT sans interpréter
- Ne prends PAS de libertés sur les choix technologiques
- Commit tout avec un message clair: `feat: complete Claude Code specialist setup (MCP + skills + config)`
- Si un `.env` est nécessaire, demande les credentials AVANT d'exécuter
