# 🤖 CONTEXTE-CLAUDE.md - Guide pour les Sessions Claude

## 📌 À LIRE EN PREMIER
Ce document est conçu pour permettre à toute nouvelle session Claude de comprendre et reprendre le projet rapidement.

## 🎯 Résumé du Projet en 30 Secondes

**Quoi** : Dashboard multi-rôle (Client/Prestataire/Revendeur/Superadmin) avec gestion complète  
**Stack** : HTML statique + Vanilla JS + Tabler.io v1.0.0-beta20 + Notion API  
**État** : Portails 100% fonctionnels, intégration Notion active, OCR en finalisation  
**Particularité** : Architecture modulaire, optimisations avancées, multi-entités  

## 🏗️ Architecture Globale

```
Dashboard Client: Presta/
├── portal-project/
│   ├── client/              → 10 pages (dashboard, projets, documents, finances...)
│   ├── prestataire/         → 12 pages (missions, calendar, rewards, knowledge...)  
│   ├── revendeur/           → 10 pages (CRM, pipeline, leads, marketing...)
│   ├── superadmin/          → 30+ pages (OCR, finance, CRM, automation...)
│   ├── assets/js/
│   │   ├── Core/            → Modules fondamentaux
│   │   │   ├── auth-notion-v2.js        → Auth Notion v2
│   │   │   ├── notion-api-client.js     → Client API unifié
│   │   │   ├── permissions-notion.js    → Système RBAC
│   │   │   └── entities-config.js       → Multi-entités
│   │   ├── Optimizations/   → Performance
│   │   │   ├── advanced-cache.js        → Cache intelligent
│   │   │   ├── lazy-loader.js           → Chargement différé
│   │   │   ├── virtual-scroll.js        → Scroll virtuel
│   │   │   └── pagination-system.js     → Pagination unifiée
│   │   └── [Role]/          → Modules par rôle
│   ├── server/              → Backend Node.js
│   └── api/                 → Proxy PHP Notion
└── tabler/                  → Framework UI
```

## 🚀 Comment Reprendre le Travail

### 1. Vérifier l'état actuel
```bash
# Lire les fichiers de documentation dans l'ordre
1. CLAUDE.md                      → Instructions de base
2. ONBOARDING-PROMPT-DASHBOARD.md → Guide onboarding complet
3. STABLE_MODULES.md              → Modules à ne pas toucher
4. ENV_RULES.md                   → Règles configuration
5. api_implementation_status.md   → État des endpoints (156/180)
6. TODO-DEVELOPPEMENT.md          → Prochaines priorités
```

### 2. Comptes de test disponibles
```javascript
// Authentification Notion fonctionnelle
client@test.ch        → Rôle Client
prestataire@test.ch   → Rôle Prestataire  
revendeur@test.ch     → Rôle Revendeur
admin@test.ch         → Rôle Superadmin

// Mot de passe temporaire: Test123!
```

### 3. Lancer le projet
```bash
# Terminal 1: Serveur Node.js
cd portal-project/server
npm install
npm start

# Terminal 2: Serveur local (optionnel pour dev)
cd portal-project
python3 -m http.server 8000

# Accès: http://localhost:3000/login.html
```

## ⚠️ Points d'Attention CRITIQUES

### 1. Modules stables - NE PAS MODIFIER
```javascript
// Ces fichiers sont verrouillés et fonctionnels
- auth-notion-v2.js
- notion-api-client.js  
- permissions-notion.js
- Tous les fichiers dans Optimizations/
```

### 2. Configuration Notion
```javascript
// Database IDs dans plusieurs fichiers:
- api/config-notion.php
- server/config/databases.js
- assets/js/Core/entities-config.js
- assets/js/Superadmin/superadmin-databases-config.js

// JAMAIS modifier les IDs existants sans vérification
```

### 3. Format Swiss obligatoire
```javascript
// Pour TOUS les montants
formatSwissAmount(1234.56) // → "CHF 1'234.56"
// Apostrophe pour les milliers, point pour décimales
```

### 4. Rate limiting Notion API
- Maximum: 3 requêtes/seconde
- Pagination: 100 items max
- Cache obligatoire pour performances
- Retry logic déjà implémenté

## 📝 Conventions de Code

### Structure d'un module Notion
```javascript
const ModuleNotion = {
    // Configuration
    config: {
        databases: {
            main: 'uuid-database-id'
        },
        cacheTime: 5 * 60 * 1000 // 5 minutes
    },
    
    // État
    state: {
        data: [],
        loading: false,
        error: null
    },
    
    // Méthodes principales
    async init() {
        await this.checkPermissions();
        await this.loadData();
        this.attachEventListeners();
    },
    
    async loadData() {
        try {
            const cached = await window.CacheManager?.get('key');
            if (cached) return this.renderData(cached);
            
            const data = await window.notionAPI.query({
                database_id: this.config.databases.main,
                // ...
            });
            
            await window.CacheManager?.set('key', data);
            this.renderData(data);
        } catch (error) {
            this.handleError(error);
        }
    }
};
```

### Gestion d'erreurs standard
```javascript
try {
    // Code principal
} catch (error) {
    console.error(`[${MODULE_NAME}]`, error);
    
    if (error.code === 'rate_limited') {
        window.showNotification?.('Trop de requêtes, veuillez patienter', 'warning');
    } else {
        window.showNotification?.('Une erreur est survenue', 'error');
    }
    
    // Toujours un fallback UI
    this.renderEmptyState();
}
```

## 🧪 Flux de données

### 1. Authentification
```
login.html 
  → auth-notion-v2.js 
  → Notion Users DB 
  → JWT token 
  → localStorage 
  → redirect par rôle
```

### 2. Chargement données
```
Page HTML 
  → Module JS spécifique 
  → notion-api-client.js 
  → Cache check 
  → Notion API 
  → Transform data 
  → Update UI
```

### 3. Permissions
```
User action 
  → permissions-notion.js 
  → Check role + permissions 
  → Allow/Deny 
  → Log audit
```

## 🔧 Commandes et Scripts Utiles

### Debug dans la console
```javascript
// Reset complet
localStorage.clear();
location.reload();

// Vider le cache
window.CacheManager.clear();

// Voir les permissions
window.PermissionsManager.getCurrentPermissions();

// Forcer reload d'un module
await ClientDashboard.loadData(true); // force refresh

// Debug Notion API
window.notionAPI.debug = true;
```

### Scripts NPM disponibles
```bash
npm run test:auth        # Test authentification
npm run test:notion      # Test connexion Notion
npm run test:permissions # Test permissions
npm run verify:stable    # Vérifier modules stables
npm run audit:security   # Audit sécurité
```

## 🏃 Tests recommandés

### 1. Test authentification complète
1. Login avec chaque rôle
2. Vérifier redirection correcte
3. Tester logout
4. Vérifier persistance session

### 2. Test permissions
1. Tenter actions non autorisées
2. Vérifier messages d'erreur
3. Tester hiérarchie des rôles

### 3. Test OCR Superadmin
1. Upload document test
2. Vérifier extraction
3. Valider et envoyer à Notion
4. Vérifier dans la base

### 4. Test performance
1. Charger grande liste (1000+ items)
2. Vérifier virtual scroll
3. Tester cache hit/miss
4. Mesurer temps chargement

## 🚨 Problèmes courants et solutions

### "Unauthorized" après login
```javascript
// Vérifier le token
console.log(localStorage.getItem('auth_token'));
// Si null, problème d'auth
```

### "Rate limit exceeded"
```javascript
// Attendre 1 minute
// Vérifier si cache activé
// Réduire fréquence requêtes
```

### Page blanche
```javascript
// Vérifier console pour erreurs
// Ordre de chargement des scripts
// Dépendances manquantes
```

### OCR ne fonctionne pas
```javascript
// Vérifier clé OpenAI
// Tester avec document simple
// Vérifier logs serveur
```

## 📋 Checklist modification majeure

- [ ] Lire STABLE_MODULES.md
- [ ] Backup fichiers concernés
- [ ] Créer branche Git
- [ ] Tester fonctionnalité actuelle
- [ ] Implémenter changements
- [ ] Tester tous les rôles
- [ ] Vérifier performances
- [ ] Mettre à jour documentation
- [ ] Code review
- [ ] Merge après validation

## 🎯 État actuel et priorités

### Complété ✅
- Authentification Notion v2
- Tous les portails (Client, Prestataire, Revendeur)
- Système de permissions RBAC
- Optimisations (cache, lazy loading, virtual scroll)
- Multi-entités pour Superadmin
- Intégration TVA Suisse

### En cours 🚧
- OCR Superadmin (90% - finalisation UI)
- Tests E2E automatisés
- Documentation API complète

### À faire 📅
- Migration mots de passe sécurisés
- Bundle optimization Webpack
- Monitoring production (Sentry)
- CI/CD Pipeline
- Migration TypeScript

## 💡 Tips & Astuces

1. **Cache** : Utiliser `force: true` pour bypass
2. **Permissions** : Toujours vérifier côté serveur aussi
3. **Notion** : Limiter les propriétés retournées
4. **Performance** : Lazy loading déjà configuré
5. **Mobile** : Tous les modules sont responsive

## 📞 Ressources

- Documentation Notion API: https://developers.notion.com
- Tabler Components: https://tabler.io/docs
- Icons: https://tabler-icons.io
- Support technique: Voir README.md

---

💪 **Le projet est bien structuré et documenté. Les modules critiques sont stables et testés. Focus sur la finalisation OCR et la sécurité pour la production.**

*Dernière mise à jour: 27/01/2025*