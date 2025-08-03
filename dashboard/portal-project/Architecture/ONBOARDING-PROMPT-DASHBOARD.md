# 🚀 Prompt d'Onboarding pour Claude Code - Projet Dashboard Client: Presta

## Instructions pour votre équipe

Copiez ce prompt dans Claude Code pour synchroniser notre organisation :

---

## PROMPT À COPIER :

Je rejoins le projet Dashboard Client: Presta en tant que développeur. Voici le contexte et les règles à suivre absolument :

### 📋 Contexte du projet
- **Projet** : Dashboard Client: Presta - Portail multi-rôles avec gestion documentaire et financière
- **Repository** : Local project (migration vers GitHub prévue)
- **Tech Stack** : HTML statique, JavaScript vanilla, Tabler.io v1.0.0-beta20, intégration Notion API
- **Phase actuelle** : Portail fonctionnel avec 3 espaces (Client, Prestataire, Revendeur) + Superadmin

### 🚨 RÈGLES CRITIQUES À RESPECTER

1. **TOUJOURS lire ces fichiers en premier** :
   - `CLAUDE.md` - Instructions obligatoires pour l'IA
   - `STABLE_MODULES.md` - Modules à NE JAMAIS modifier
   - `ENV_RULES.md` - Règles pour les fichiers de configuration
   - `.protected-files` - Liste des fichiers protégés

2. **Modules STABLES (NE PAS MODIFIER)** :
   - `/assets/js/Core/auth-notion-v2.js` - Authentification Notion
   - `/assets/js/Core/notion-api-client.js` - Client API Notion
   - `/assets/js/Core/permissions-notion.js` - Gestion des permissions
   - `/assets/js/Optimizations/*` - Modules d'optimisation
   - Ces fichiers sont verrouillés et fonctionnels

3. **Configuration API** :
   - JAMAIS modifier les database IDs Notion existants
   - TOUJOURS utiliser `Edit` pour modifier les configurations
   - JAMAIS supprimer les configurations existantes

4. **Avant toute modification** :
   ```bash
   # Vérifier l'intégrité du projet
   npm run verify:stable
   # Tester les connexions Notion
   npm run test:notion
   ```

### 📚 SYSTÈME DE DOCUMENTATION COMPLET

Notre projet utilise un système de suivi exhaustif en Markdown. **CONSULTEZ ET METTEZ À JOUR CES FICHIERS** :

#### 1. **Documentation de planification**
- `portal-project/TODO-DEVELOPPEMENT.md` - Plan de développement actuel
- `portal-project/CONTEXTE-CLAUDE.md` - Contexte technique et décisions
- `portal-project/arborescence.md` - Structure complète du projet

#### 2. **Suivi d'implémentation**
- `portal-project/api_implementation_status.md` - **CRITIQUE** : État des intégrations API
  - Statut des endpoints Notion
  - Modules complétés (✅/🚧/📅)
  - Prochaines priorités
- `portal-project/NOTION-INTEGRATION-STATUS.md` - État de l'intégration Notion
  - Bases de données configurées
  - Propriétés et relations

#### 3. **Documentation technique**
- `portal-project/DEPLOYMENT-GUIDE.md` - Guide de déploiement complet
- `portal-project/UTILISATION-SIMPLE.md` - Guide utilisateur
- `portal-project/api/README.md` - Documentation API PHP
- `portal-project/server/README.md` - Documentation serveur Node.js

#### 4. **Fichiers de protection**
- `STABLE_MODULES.md` - Modules verrouillés avec workflow de modification
- `ENV_RULES.md` - Règles critiques pour la configuration
- `.protected-files` - Liste technique des fichiers protégés
- `portal-project/Audit 26072025/*` - Audits et rapports à ne pas modifier

### 📊 État actuel du projet

**Infrastructure en place** :
- ✅ Authentification Notion fonctionnelle
- ✅ Portail Client (projets, documents, finances)
- ✅ Portail Prestataire (missions, récompenses, calendrier)
- ✅ Portail Revendeur (CRM, pipeline, rapports)
- ✅ Superadmin avec OCR et gestion multi-entités
- ✅ Service Worker et optimisations activées

**Progression par module** :
- Auth : ✅ 100% (Notion auth v2)
- Client : ✅ 100% (Dashboard, projets, documents, finances)
- Prestataire : ✅ 100% (Missions, calendrier, récompenses)
- Revendeur : ✅ 100% (CRM, pipeline, commissions)
- Superadmin : 🚧 90% (OCR en finalisation)
- Optimisations : ✅ 100% (Cache, lazy loading, pagination)

### 🛠️ Pour commencer

1. **Setup initial** :
   ```bash
   cd portal-project
   npm install
   ```

2. **Lire la documentation** :
   ```bash
   # Ordre de lecture recommandé
   cat CLAUDE.md
   cat CONTEXTE-CLAUDE.md
   cat NOTION-INTEGRATION-STATUS.md
   ```

3. **Lancer le serveur de développement** :
   ```bash
   # Serveur Node.js pour l'API Notion
   cd server
   npm start
   
   # Dans un autre terminal - Serveur PHP (optionnel)
   cd api
   php -S localhost:8081
   ```

4. **Accéder à l'application** :
   - Login: http://localhost:3000/login.html
   - Client: http://localhost:3000/client/
   - Prestataire: http://localhost:3000/prestataire/
   - Revendeur: http://localhost:3000/revendeur/
   - Superadmin: http://localhost:3000/superadmin/

5. **Vérifier que tout fonctionne** :
   ```bash
   npm run test:all
   npm run verify:notion
   ```

### 📁 Structure du projet

```
Dashboard Client: Presta/
├── CLAUDE.md                    # ⚠️ LIRE EN PREMIER
├── portal-project/
│   ├── STABLE_MODULES.md        # ⚠️ Modules verrouillés
│   ├── ENV_RULES.md            # ⚠️ Règles config
│   ├── api/                    # API PHP (proxy Notion)
│   ├── server/                 # Serveur Node.js
│   ├── assets/
│   │   ├── css/               # Styles personnalisés
│   │   └── js/
│   │       ├── Core/          # 🔒 Modules core (auth, notion)
│   │       ├── Client/        # Modules client
│   │       ├── Prestataire/   # Modules prestataire
│   │       ├── Revendeur/     # Modules revendeur
│   │       ├── Superadmin/    # Modules superadmin
│   │       └── Optimizations/ # 🔒 Modules optimisation
│   ├── client/                # Pages client
│   ├── prestataire/          # Pages prestataire
│   ├── revendeur/            # Pages revendeur
│   └── superadmin/           # Pages superadmin
└── tabler/                    # Framework UI Tabler
```

### 🎯 Workflow de développement

1. **Avant de coder** :
   - Lire `api_implementation_status.md`
   - Vérifier les modules stables
   - Mettre à jour le status dans les TODOs

2. **Pendant le développement** :
   - Suivre les patterns existants
   - Maintenir la localisation française
   - Tester sur les 3 rôles + superadmin

3. **Après implémentation** :
   - Mettre à jour la documentation
   - Tester les permissions
   - Vérifier les optimisations

### ⚡ Commandes essentielles

```bash
# Tests et vérifications
npm run test:notion      # Test connexion Notion
npm run test:auth        # Test authentification
npm run test:ocr         # Test OCR (superadmin)
npm run verify:all       # Tout vérifier

# Développement
npm run dev              # Lance serveur dev
npm run build            # Build production

# Monitoring
npm run monitor:api      # Monitor API calls
npm run monitor:perf     # Monitor performances
```

### 🤝 Règles de collaboration

1. **Commits** :
   - Format : `type: description [module]`
   - Types : feat, fix, docs, style, refactor, test, perf
   - Exemple : `feat: ajout export Excel [finances]`

2. **Documentation** :
   - TOUJOURS mettre à jour les fichiers de statut
   - Documenter les décisions dans `CONTEXTE-CLAUDE.md`
   - Ajouter des commentaires pour la logique complexe

3. **Tests** :
   - Tester les 4 rôles (client, prestataire, revendeur, superadmin)
   - Vérifier les permissions
   - Tester sur mobile

4. **Sécurité** :
   - Jamais de tokens dans le code
   - Validation côté client ET serveur
   - Sanitization des inputs

### 📞 Points d'entrée critiques

1. **État global** : `portal-project/TODO-DEVELOPPEMENT.md`
2. **Architecture** : `portal-project/arborescence.md`
3. **API Notion** : `portal-project/NOTION-INTEGRATION-STATUS.md`
4. **Déploiement** : `portal-project/DEPLOYMENT-GUIDE.md`

### 🚀 Prochaines priorités

1. **OCR Superadmin** : Finaliser l'interface hybride OCR
2. **Tests E2E** : Implémenter suite de tests automatisés
3. **Documentation API** : Compléter la doc OpenAPI
4. **Monitoring** : Ajouter dashboards de monitoring
5. **Mobile** : Optimiser l'expérience mobile

### ⚠️ Points d'attention

1. **Notion API** :
   - Rate limits : 3 requêtes/seconde
   - Pagination obligatoire (100 items max)
   - Cache recommandé pour les données statiques

2. **Performance** :
   - Lazy loading activé par défaut
   - Virtual scroll pour grandes listes
   - Service Worker pour offline

3. **Compatibilité** :
   - Navigateurs : Chrome 90+, Firefox 88+, Safari 14+
   - Mobile : iOS 14+, Android 10+
   - Résolutions : 320px à 4K

**IMPORTANT** : Notre succès repose sur cette documentation centralisée. Lisez-la, suivez-la, mettez-la à jour. La qualité prime sur la vitesse.

---

## FIN DU PROMPT

### Instructions pour votre équipe :

1. Copiez tout le texte entre "PROMPT À COPIER" et "FIN DU PROMPT"
2. Collez-le dans une nouvelle conversation Claude Code
3. Claude aura immédiatement accès à toute notre organisation
4. Il suivra automatiquement notre système de documentation

Cette approche garantit une intégration rapide et un suivi rigoureux du projet ! 🚀