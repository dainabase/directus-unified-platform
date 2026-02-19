# PHASE 3A — CUSTOM SKILLS (Skills 1 à 4 sur 8)

## Contexte
Suite de la configuration `directus-unified-platform`. Phases 1-2 terminées. On crée maintenant les 4 premiers custom skills critiques du projet.

## Mission Phase 3A
Crée le dossier de skills projet et les 4 premiers fichiers SKILL.md. Chaque skill doit être créé exactement comme spécifié.

```bash
mkdir -p .claude/skills
```

---

## Skill 3.1 — `directus-extension-architect` (CRITIQUE)

Crée le fichier `.claude/skills/directus-extension-architect/SKILL.md` avec ce contenu exact :

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
  filter('items.create', async (payload, meta, { schema, accountability }) => {
    if (meta.collection === 'invoices') {
      if (!payload.amount || payload.amount <= 0) {
        throw new Error('Le montant doit être positif');
      }
    }
    return payload;
  });

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
npx directus schema snapshot > schema.yaml
npx directus schema diff schema.yaml
npx directus schema apply ./schema-diff.yaml
\`\`\`

## Règles Critiques
- TOUJOURS `ItemsService` over raw Knex pour respecter les permissions
- TOUJOURS `try/catch` dans les endpoints
- TOUJOURS `req.accountability` pour le contexte utilisateur
- Extension hot-reload: `EXTENSIONS_AUTO_RELOAD=true` (dev only)
- Cache: `CACHE_ENABLED=true`, `CACHE_STORE=redis`, `CACHE_AUTO_PURGE=true`
- Marketplace: npm keyword `directus-extension`
```

---

## Skill 3.2 — `swiss-compliance-engine` (CRITIQUE)

Crée le fichier `.claude/skills/swiss-compliance-engine/SKILL.md` avec ce contenu exact :

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
    account: 'CH44 3199 9123 0008 8901 2'
  },
  debtor: {
    name: 'Client Sàrl',
    address: 'Avenue Test 2',
    zip: '1200',
    city: 'Genève',
    country: 'CH'
  },
  reference: '210000000003139471430009017',
  message: 'Facture 2024-001'
});
\`\`\`

## TVA Suisse 2025
- **Taux normal**: 8.1% (majorité des biens et services)
- **Taux réduit**: 2.6% (alimentation, livres, médicaments)
- **Taux hébergement**: 3.8% (hôtellerie)
- **Seuil d'assujettissement**: CHF 100'000 de CA annuel
- **Méthodes**: Effective ou forfaitaire
- **Déclaration**: Trimestrielle auprès de l'AFC/FTA
- **⚠️ JAMAIS hardcoder les taux** → toujours référencer un fichier de config

\`\`\`javascript
// config/vat-rates.js — SOURCE UNIQUE DE VÉRITÉ
export const VAT_RATES_2025 = {
  NORMAL: 0.081,
  REDUCED: 0.026,
  ACCOMMODATION: 0.038,
  EXEMPT: 0,
};
\`\`\`

## Plan Comptable PME Käfer (9 classes décimales)
| Classe | Désignation | Exemples |
|--------|-------------|----------|
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
- **QES** (Qualifiée): Équivalent signature manuscrite — Swisscom Trust Services ou SwissSign AG
- Double conformité ZertES (Suisse) + eIDAS (UE) pour le transfrontalier

## Multi-Devises
- **Library**: `Dinero.js` v2 pour l'arithmétique monétaire
- **Devise primaire**: CHF (centimes = integer cents)
- **Taux de change**: SNB Data Portal ou ECB API pour EUR/CHF
- **⚠️ JAMAIS de float pour les montants** → toujours integer centimes + Dinero.js

\`\`\`javascript
import { dinero, add, multiply } from 'dinero.js';
import { CHF, EUR } from '@dinero.js/currencies';

const price = dinero({ amount: 150000, currency: CHF }); // CHF 1'500.00
const vat = multiply(price, { amount: 81, scale: 3 });
const total = add(price, vat);
\`\`\`

## Zefix API (Registre du commerce)
- URL: `https://www.zefix.admin.ch/ZefixPublicREST/`
- Format UID: CHE-xxx.xxx.xxx

## Recouvrement (SchKG/LP)
1. Mahnung 1 (rappel amiable) — 10 jours
2. Mahnung 2 (mise en demeure) — 10 jours
3. Mahnung 3 (dernier avertissement) — 10 jours
4. Betreibungsbegehren — Office des poursuites
5. Commandement de payer — 20 jours pour opposition
6. Si opposition → 10 jours mainlevée
7. Intérêt moratoire: 5% (Art. 104 CO)
```

---

## Skill 3.3 — `multi-portal-architecture` (HIGH)

Crée le fichier `.claude/skills/multi-portal-architecture/SKILL.md` avec ce contenu exact :

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
// vite.config.js
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
- CSS via CDN: `@tabler/core@1.0.0-beta20`
- Icons: `@tabler/icons-react` via npm
- TOUJOURS utiliser les classes Tabler existantes avant d'écrire du CSS custom

## Forms
- React Hook Form + Zod resolver pour validation type-safe
```

---

## Skill 3.4 — `directus-api-patterns` (HIGH)

Crée le fichier `.claude/skills/directus-api-patterns/SKILL.md` avec ce contenu exact :

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
  res.status(200).json({ received: true });

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
await itemsService.createMany([item1, item2, item3]);
await itemsService.updateMany([id1, id2], { status: 'active' });
\`\`\`
```

---

## Vérification Phase 3A

```bash
echo "=== Skills créés (Phase 3A) ==="
ls -la .claude/skills/directus-extension-architect/SKILL.md 2>/dev/null && echo "✅ directus-extension-architect" || echo "❌ directus-extension-architect MANQUANT"
ls -la .claude/skills/swiss-compliance-engine/SKILL.md 2>/dev/null && echo "✅ swiss-compliance-engine" || echo "❌ swiss-compliance-engine MANQUANT"
ls -la .claude/skills/multi-portal-architecture/SKILL.md 2>/dev/null && echo "✅ multi-portal-architecture" || echo "❌ multi-portal-architecture MANQUANT"
ls -la .claude/skills/directus-api-patterns/SKILL.md 2>/dev/null && echo "✅ directus-api-patterns" || echo "❌ directus-api-patterns MANQUANT"
```

## Résultat attendu
- 4 skills créés dans `.claude/skills/`
- Signale-moi le résultat pour lancer la Phase 3B (skills 5-8).
