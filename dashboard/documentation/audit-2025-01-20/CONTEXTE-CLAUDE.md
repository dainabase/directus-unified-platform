# Contexte Dashboard Multi-Rôles

## Vue d'ensemble
Dashboard professionnel multi-rôles (Client/Prestataire/Revendeur) avec intégration Notion, système de permissions RBAC complet, et optimisations performance avancées. Interface en français pour le marché Suisse, utilisant Tabler.io comme framework UI.

## Architecture technique
- Framework : Tabler.io v1.0.0-beta20
- Template : Multi-Page Application (MPA)
- Structure : Vanilla JS ES6+ avec module pattern
- État : 90% complet, production-ready

## Rôles et espaces

### Client
- Accès : Dashboard, Projets, Documents, Finances, Paiements
- État : 100% complet
- Fichiers principaux : 
  - `client/*.html` (9 pages)
  - `assets/js/*-notion.js` (modules métier)
  - `dashboard-client-notion.js`, `projects-notion.js`, `documents-notion.js`, `finances-notion.js`

### Prestataire
- Accès : Dashboard, Missions, Calendrier, Tâches, Messages, Récompenses, Performance, Knowledge Base
- État : 100% complet
- Fichiers principaux :
  - `prestataire/*.html` (11 pages)
  - `missions-notion.js`, `calendar-notion.js`, `tasks-notion.js`, `messages-notion.js`
  - `rewards-notion.js`, `knowledge-notion.js`

### Revendeur
- Accès : Dashboard, Pipeline CRM, Clients, Leads, Commissions, Marketing, Rapports
- État : 100% complet + optimisations v2
- Fichiers principaux :
  - `revendeur/*.html` (9 pages)
  - `pipeline-notion.js` + `pipeline-notion-v2.js` (version paginée)
  - `clients-notion.js`, `leads-notion.js`, `commissions-notion.js`
  - `marketing-notion.js`, `reports-notion.js`

## Points critiques actuels
1. **Migration API** : Passer des stubs locaux à l'API Notion réelle (serveur Node.js prêt)
2. **Bundling** : Configurer Webpack pour production (actuellement 52 fichiers JS séparés)
3. **Tests** : Augmenter la couverture (<20% actuellement)
4. **Auth production** : Migrer de LocalStorage vers JWT + SessionStorage (auth-notion-v2.js prêt)
5. **Déploiement** : Finaliser configuration Nginx/SSL

## Conventions du projet
- Nommage : `[module]-notion.js` pour tous les modules métier
- Structure : Module pattern avec exports globaux (`window.ModuleName`)
- Commentaires : Minimal, code auto-documenté
- Sécurité : Toutes les opérations passent par `PermissionsMiddleware.secureApiCall()`
- UI : Composants Tabler.io uniquement, pas de CSS custom complexe
- Langue : Interface 100% français, format Suisse (CHF, dates)

## Commandes utiles
```bash
# Lancer le projet (depuis portal-project)
python -m http.server 8000
# ou
npx http-server -p 8000

# Lancer le serveur API (depuis server/)
cd server
npm install
npm run dev  # Port 3001

# Tests
npm test  # À implémenter

# Build (futur)
npm run build  # Webpack à configurer
```

## Modules critiques
1. **auth-notion.js** : Authentification v1 (LocalStorage)
2. **auth-notion-v2.js** : Authentification v2 (JWT ready)
3. **permissions-notion.js** : RBAC complet avec cache et audit
4. **notion-connector.js** : Abstraction API Notion
5. **notion-api-client.js** : Client HTTP pour serveur
6. **optimization-activator.js** : Active toutes les optimisations auto

## Optimisations actives
- **PaginationSystem** : Auto pour listes >100 items
- **VirtualScroll** : Auto pour listes >500 items  
- **AdvancedCache** : IndexedDB avec TTL 5min
- **LazyLoader** : Modules chargés à la demande
- **Service Worker** : Cache offline basique

## Structure fichiers
```
portal-project/
├── client/          # 9 pages
├── prestataire/     # 11 pages
├── revendeur/       # 9 pages
├── assets/
│   ├── js/         # 52 fichiers
│   ├── css/        # Styles custom
│   └── img/        # Images
├── server/         # Backend Node.js
├── documentation/  # Docs complètes
└── Root: login.html, register.html, index.html
```

## Sécurité implémentée
- RBAC granulaire (resource.action)
- Permissions partielles (.own, .assigned)
- Audit trail complet
- JWT tokens (v2)
- Rate limiting
- CORS restrictif
- Helmet.js headers

## Performance actuelle
- Load time : <2s
- Bundle : ~800KB
- Lighthouse : 85/100
- Optimisations : 100% actives

## Prochaines étapes
1. Activer auth-notion-v2.js
2. Connecter vraies bases Notion
3. Configurer Webpack
4. Déployer production
5. Monitoring (Sentry/DataDog)