# CONTEXTE CLAUDE - Dashboard Multi-Rôles Portal
**Dernière mise à jour**: 25 juillet 2025 - Version 2.1.0 (Post-corrections navigation)

## 🎯 PROJET
Dashboard multi-rôles (Client/Prestataire/Revendeur/SuperAdmin) avec gestion complète projets, finance, CRM. Backend Notion API (33 bases). Architecture vanilla JS + Tabler.io. Production-ready 90%.

## 📁 ARCHITECTURE
```
portal-project/
├── client/         # 11 pages - Projets, docs, finances, support
├── prestataire/    # 12 pages - Missions, temps, rewards  
├── revendeur/      # 11 pages - Pipeline, CRM, commissions, quotes
├── superadmin/     # 60+ pages - Finance, OCR, multi-entités
├── server/         # API Node.js → Notion (remplace MCP)
├── shared/         # 404.html, sidebars, components
└── assets/js/      # 93 modules (Core/Client/Presta/Revend/SA)
    └── Core/       # 11 nouveaux modules navigation/UX
```

## 🔑 POINTS CRITIQUES
1. **API Notion directe** via server Node.js (plus MCP)
2. **Auth JWT** - Token dans localStorage + 2FA SuperAdmin
3. **33 bases Notion** connectées - IDs dans config/databases.js
4. **OCR Tesseract** - Module beta pour factures (3-5s/page)
5. **Cache 5min** - Obligatoire pour performance Notion
6. **Permissions RBAC** - Vérifier checkRole() partout
7. **Multi-entités** - Consolidation par entité groupe
8. **Navigation mobile** - Menu burger fonctionnel (mobile-navigation.js)
9. **Breadcrumbs auto** - Gérés par breadcrumb-manager.js
10. **Modals Bootstrap 5** - Standardisées via modal-manager.js
11. **Loading states** - placeholder-loading.js pour UX

## 🛠️ CONVENTIONS
```javascript
// Structure module type
const ModuleNameNotion = {
  init() { /* Init avec event listeners */ },
  async loadData() { /* Appel API avec cache */ },
  updateUI(data) { /* Mise à jour DOM */ },
  formatAmount(n) { /* CHF 1'234.56 */ }
};

// Nouveaux modules Core (auto-init dans app.js)
import MobileNavigation from './Core/mobile-navigation.js';
import BreadcrumbManager from './Core/breadcrumb-manager.js';
// ... autres modules Core

// API calls toujours via apiClient
const data = await window.apiClient.getProjects({ status: 'En cours' });

// Permissions check obligatoire
if (!await checkPermission(userId, 'resource', 'action')) return;

// Dates format Suisse
new Date().toLocaleDateString('fr-CH'); // 25.07.2025

// Placeholders loading
PlaceholderLoading.showTableSkeleton('#table-container', 5);
// ... chargement données
PlaceholderLoading.hideLoading('#table-container');
```

## 🆕 MODULES CORE (Juillet 2025)
```javascript
// Navigation & UX - Auto-chargés dans app.js
1. mobile-navigation.js      // Menu burger responsive
2. breadcrumb-manager.js     // Breadcrumbs automatiques  
3. sidebar-active-state.js   // États actifs sidebar
4. modal-manager.js          // Modals Bootstrap 5
5. button-standardizer.js    // Boutons Tabler uniformes
6. table-responsive-wrapper.js // Tables responsive auto
7. timeline-component.js     // Timeline verticale/horizontale
8. steps-component.js        // Steps avec progression
9. placeholder-loading.js    // Skeleton loading states
10. calendar-mobile-optimizer.js // FullCalendar mobile
11. lazy-loading-images.js   // Images lazy load + WebP
```

## ⚡ COMMANDES UTILES
```bash
# Dev server
cd server && npm start

# Test API Notion
node server/test-notion-connection.js

# Build production
cd portal-project && npm run build:prod

# Vérifier les liens morts
find . -name "*.html" -exec grep -l "404" {} \;

# Lancer tests (quand ils existeront...)
npm test
```

## 📊 ÉTAT ACTUEL
- Client: **98%** complet ✅ (+3% avec support-ticket-detail)
- Prestataire: **90%** complet ✅ (messages.html manquant)
- Revendeur: **95%** complet ✅ (+10% avec quotes.html)
- SuperAdmin: **85%** complet ✅ (+10% avec corrections finance)
- API: **100%** migrée ✅
- Navigation/UX: **95%** ✅ (NEW - 11 modules Core)
- Tests: **0%** 🚨
- Docs: **75%** 📝 (+15% avec cette session)

## 🚨 NE JAMAIS FAIRE
- **Modifier les IDs Notion** sans update partout
- **Commiter .env** ou clés API
- **Disable checkPermission()** même en dev
- **Cacher les erreurs API** - Logger tout
- **Requêtes Notion sans cache** - Rate limit!
- **Stocker passwords en clair** - Hasher!
- **Oublier formatAmount()** - Toujours CHF X'XXX.XX
- **Skip la validation OCR** - Données critiques

## 🔧 DEBUG TIPS
```javascript
// Activer logs API
localStorage.setItem('debug_api', 'true');

// Vider cache Notion
localStorage.removeItem('notion_cache');

// Forcer reconnexion
window.apiClient.setToken(null);

// Mode SuperAdmin temporaire (DEV ONLY!)
// localStorage.setItem('dev_override_role', 'superadmin');
```

## 📦 DÉPENDANCES CRITIQUES
```javascript
// Frontend (CDN)
tabler: '1.0.0-beta20'      // UI Framework
apexcharts: '3.44.0'        // Graphiques
fullcalendar: '6.1.9'       // Planning
tesseract.js: '5.0.3'       // OCR

// Backend (npm)
@notionhq/client: '2.2.3'   // API Notion
jsonwebtoken: '9.0.2'       // Auth JWT
express: '4.18.2'           // Server
bcrypt: '5.1.1'             // Passwords (À IMPLÉMENTER!)
```

## 🎮 QUICK START
1. Clone → `cd portal-project`
2. `.env` → Add `NOTION_API_KEY=secret_xxx`
3. `cd server && npm install && npm start`
4. Browser → `http://localhost:8000`
5. Login → `client@hypervisual.ch` / `client123`

## ⚠️ KNOWN ISSUES
- **OCR lent** sur gros PDF (> 10 pages)
- **Pipeline drag** buggy sur mobile Firefox
- **Calendar** memory leak après 1h
- **Notion timeout** sur grosses requêtes
- **2FA QR** parfois ne s'affiche pas

## 🚀 NEXT PRIORITIES
1. **TESTS** - 0% coverage inacceptable
2. **Hasher passwords** - Sécurité critique
3. **Messagerie temps réel** - prestataire/messages.html
4. **Recherche globale** - Navbar avec autocomplétion
5. **Intégration n8n** - Workflows automation
6. **Monitor** - Sentry/Datadog urgent
7. **OCR queue** - Bull/Redis pour scaling

## 💡 ARCHITECTURE DECISIONS
- **Vanilla JS**: Simple mais limite atteinte
- **Multi-pages**: OK pour SEO/simplicité  
- **Notion backend**: Bien pour proto/client
- **Tabler UI**: Excellent choix, stable
- **MCP → API**: Bonne migration, stable

## 🔐 SECRETS LOCATIONS
- `.env` - Clés API (gitignored)
- `server/config/` - Database IDs
- `localStorage` - JWT tokens
- **JAMAIS** dans le code JS!

## 📝 CONTACT TECH
- Notion API: https://developers.notion.com
- Tabler: https://tabler.io/docs
- Support: tech@hypervisual.ch