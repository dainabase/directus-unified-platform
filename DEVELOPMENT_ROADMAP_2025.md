# 📚 Document de Référence Complet - Design System @dainabase/ui
**Version**: 1.0.1-beta.2 | **Bundle**: 50KB | **Performance**: 0.8s  
**Dernière mise à jour**: 14 Août 2025 | **Repository**: [directus-unified-platform](https://github.com/dainabase/directus-unified-platform)

---

## 🚨 ALERTE CRITIQUE - PROBLÈMES IDENTIFIÉS (14 AOÛT 2025)

### ⚠️ ÉTAT D'URGENCE DU REPOSITORY

Le repository présente actuellement **des milliers d'erreurs** dues à une infrastructure CI/CD hors de contrôle.

#### 🔴 PROBLÈMES CRITIQUES IDENTIFIÉS

1. **EXPLOSION DE WORKFLOWS (42+ workflows)**
   - 7 workflows NPM redondants
   - Workflows qui s'exécutent en parallèle sur chaque commit
   - Génération de milliers de notifications d'erreur

2. **TESTS NON CONFIGURÉS**
   - 0% de test coverage
   - Scripts avec fallback `|| echo 'Tests à configurer'`
   - Workflows de test qui échouent systématiquement

3. **DÉPENDANCES MANQUANTES**
   - Configuration monorepo incomplète
   - peerDependencies non installées
   - Build qui échoue

#### 🚑 PLAN D'ACTION IMMÉDIAT

**PRIORITÉ ABSOLUE : Stopper l'hémorragie**

1. **DÉSACTIVER tous les workflows automatiques** ✅ À FAIRE
2. **NETTOYER les workflows redondants** ✅ À FAIRE
3. **CORRIGER la configuration de base** ✅ À FAIRE
4. **CRÉER 3 workflows maximum** :
   - `ci.yml` : Tests et validation
   - `release.yml` : Publication NPM
   - `deploy.yml` : Déploiement

---

## 🔴 MÉTHODE DE TRAVAIL OBLIGATOIRE - ESSENTIEL

### ⚠️ RÈGLES ABSOLUES - À LIRE AVANT TOUT DÉVELOPPEMENT

> 🚨 **CES RÈGLES SONT NON-NÉGOCIABLES ET S'APPLIQUENT À 100% DU DÉVELOPPEMENT**

### 📍 Environnement de Travail

```yaml
Repository: github.com/dainabase/directus-unified-platform
Owner: dainabase
Branche: main
Package: packages/ui/
Méthode: 100% via API GitHub (github:* tools)
```

### ✅ CE QU'IL FAUT FAIRE - TOUJOURS

#### Lecture de fichiers
```javascript
// Utiliser UNIQUEMENT
github:get_file_contents
owner: "dainabase"
repo: "directus-unified-platform"
path: "packages/ui/chemin/du/fichier"
branch: "main"
```

#### Création/Modification de fichiers
```javascript
// TOUJOURS récupérer le SHA d'abord pour modification
github:get_file_contents  // Pour obtenir le SHA

// Puis modifier
github:create_or_update_file
path: "packages/ui/chemin/du/fichier"
sha: "SHA_REQUIS_POUR_UPDATE"
content: "// Nouveau contenu"
message: "type: Description du changement"
```

### ❌ CE QU'IL NE FAUT JAMAIS FAIRE

```bash
# INTERDIT - Ces commandes NE DOIVENT JAMAIS être utilisées :
git clone
git pull
git push
npm install
npm run dev
npm test
yarn
pnpm
node
npx
```

---

## 📂 STRUCTURE COMPLÈTE DU DESIGN SYSTEM

### Architecture Détaillée

```
📁 directus-unified-platform/              # Repository racine
│
├── 📁 .github/
│   └── 📁 workflows/                     # ⚠️ 42+ WORKFLOWS À NETTOYER
│       ├── [42+ fichiers de workflows]   # PROBLÈME : Trop de workflows redondants
│       └── ...                           # ACTION : Réduire à 3-4 workflows max
│
├── 📁 packages/
│   └── 📁 ui/                           # 🎯 DESIGN SYSTEM ICI
│       │
│       ├── 📁 src/                      # Code source principal
│       │   ├── 📁 components/           # 58 composants (0% testés)
│       │   ├── 📁 lib/                  # Utilitaires
│       │   ├── 📁 providers/            # Contextes React
│       │   ├── 📁 styles/               # Styles globaux
│       │   ├── 📁 theme/                # Configuration thème
│       │   ├── 📁 theming/              # Système de theming
│       │   ├── 📁 i18n/                 # Internationalisation
│       │   ├── index.ts                 # Export principal (50KB)
│       │   └── components-lazy.ts       # Lazy loading exports
│       │
│       ├── 📁 tests/                    # Tests globaux (NON CONFIGURÉS)
│       ├── 📁 e2e/                      # Tests E2E Playwright
│       ├── 📁 docs/                     # Documentation
│       ├── 📁 scripts/                  # Scripts utilitaires
│       ├── 📁 .storybook/               # Config Storybook
│       │
│       ├── 📄 package.json              # v1.0.1-beta.2
│       └── [configs]                    # Configurations diverses
│
├── 📄 package.json                      # Config monorepo (PROBLÈME : tests non configurés)
└── 📄 DEVELOPMENT_ROADMAP_2025.md       # Ce document
```

---

## 📊 ÉTAT ACTUEL CRITIQUE (14 Août 2025)

### Métriques de Production

| Métrique | Actuel | Statut |
|----------|--------|--------|
| **Erreurs GitHub** | 1000+ | 🔴 CRITIQUE |
| **Workflows** | 42+ | 🔴 À RÉDUIRE |
| **Test Coverage** | 0% | 🔴 NON CONFIGURÉ |
| **Build Status** | FAILED | 🔴 ÉCHEC |
| **CI/CD** | BROKEN | 🔴 CASSÉ |

### Problèmes Bloquants

1. **Infrastructure CI/CD hors de contrôle**
   - 42+ workflows qui s'exécutent en parallèle
   - Génération de milliers d'erreurs
   - Notifications GitHub saturées

2. **Tests non fonctionnels**
   - Jest non configuré
   - Scripts de test avec fallback
   - 0% de coverage

3. **Build cassé**
   - Dépendances manquantes
   - Configuration TypeScript incorrecte
   - Erreurs de compilation

---

## 🚑 PLAN D'URGENCE - À EXÉCUTER IMMÉDIATEMENT

### Phase 0: Stabilisation d'urgence (MAINTENANT)

#### 1️⃣ **Désactiver les workflows problématiques** 🔴 URGENT
```yaml
# Pour chaque workflow dans .github/workflows/
# Remplacer les triggers par :
on:
  workflow_dispatch: # Manuel uniquement
```

#### 2️⃣ **Nettoyer les workflows redondants** 🔴 URGENT
- **À SUPPRIMER** :
  - Tous les workflows npm-* sauf un
  - Tous les workflows de test redondants
  - Les workflows expérimentaux

- **À GARDER** (3-4 max) :
  - `ci.yml` : Tests et validation
  - `release.yml` : Publication NPM
  - `deploy.yml` : Déploiement
  - `bundle-size.yml` : Monitoring taille

#### 3️⃣ **Corriger la configuration de base** 🔴 URGENT
- Configurer Jest correctement
- Installer les dépendances manquantes
- Corriger les scripts package.json

---

## 🎯 ROADMAP RÉVISÉE - POST-STABILISATION

### Phase 1: Réparation (Semaine 34, Août 2025)
- [x] Identifier les problèmes critiques ✅
- [ ] Désactiver workflows problématiques
- [ ] Nettoyer workflows redondants
- [ ] Corriger configuration de base
- [ ] Stabiliser le build

### Phase 2: Reconstruction (Semaine 35, Août 2025)
- [ ] Créer infrastructure CI/CD minimale
- [ ] Configurer tests unitaires
- [ ] Valider le build
- [ ] Documenter les changements

### Phase 3: Tests (Semaine 36, Septembre 2025)
- [ ] Implémenter tests pour 58 composants
- [ ] Atteindre 80% coverage
- [ ] Tests E2E fonctionnels
- [ ] Validation complète

### Phase 4: Publication (Semaine 37, Septembre 2025)
- [ ] Préparer v1.1.0 stable
- [ ] Publier sur NPM
- [ ] Documentation complète
- [ ] Monitoring en place

---

## 💻 GUIDE DE DÉVELOPPEMENT

### WORKFLOW D'URGENCE

1. **AVANT TOUT COMMIT** :
   - Vérifier quels workflows sont actifs
   - Désactiver les workflows non essentiels
   - Tester sur une branche séparée

2. **POUR CORRIGER UN WORKFLOW** :
   ```javascript
   // 1. Lire le workflow
   github:get_file_contents
   path: ".github/workflows/[nom].yml"
   
   // 2. Désactiver ou corriger
   github:create_or_update_file
   path: ".github/workflows/[nom].yml"
   sha: "[SHA]"
   content: "# Workflow désactivé ou corrigé"
   ```

3. **POUR NETTOYER** :
   - Supprimer les workflows redondants
   - Consolider les fonctionnalités similaires
   - Documenter chaque workflow conservé

---

## 📋 CHECKLIST D'URGENCE

### À faire IMMÉDIATEMENT :

- [ ] **Désactiver tous les workflows automatiques**
- [ ] **Identifier les 3-4 workflows essentiels**
- [ ] **Supprimer/archiver les workflows redondants**
- [ ] **Corriger package.json principal**
- [ ] **Configurer Jest correctement**
- [ ] **Installer dépendances manquantes**
- [ ] **Créer workflow CI/CD unifié**
- [ ] **Tester sur branche de développement**
- [ ] **Documenter les changements**
- [ ] **Monitorer les erreurs**

---

## 📊 KPIs de Stabilisation

| KPI | Actuel | Cible Urgente | Cible Finale |
|-----|--------|---------------|--------------|
| **Nombre de workflows** | 42+ | 4 | 3 |
| **Erreurs GitHub** | 1000+ | 0 | 0 |
| **Build Status** | FAILED | PASSING | PASSING |
| **Test Coverage** | 0% | 10% | 80% |
| **CI/CD Runtime** | ∞ | < 5min | < 3min |

---

## 🔧 EXEMPLES DE CORRECTIONS

### Exemple 1: Désactiver un workflow
```yaml
# AVANT (déclenché automatiquement)
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

# APRÈS (manuel uniquement)
on:
  workflow_dispatch:
```

### Exemple 2: Consolider les workflows NPM
```yaml
# Garder UN SEUL workflow npm-publish.yml
# Supprimer :
# - npm-publish-ui.yml
# - npm-publish-beta.yml
# - quick-npm-publish.yml
# - force-publish.yml
# - manual-publish.yml
# etc.
```

### Exemple 3: Corriger les tests
```json
// package.json
"scripts": {
  // AVANT
  "test": "jest || echo 'Tests à configurer'",
  
  // APRÈS
  "test": "jest",
  "test:coverage": "jest --coverage"
}
```

---

## 📞 SUPPORT & RESSOURCES

- **Repository**: [github.com/dainabase/directus-unified-platform](https://github.com/dainabase/directus-unified-platform)
- **Issues critiques**: #40 (Release beta), #38 (100% coverage), #33 (Roadmap)
- **Package**: packages/ui/
- **Discord**: [discord.gg/dainabase](https://discord.gg/dainabase)
- **Email**: dev@dainabase.com

---

## ⚠️ RAPPELS CRITIQUES

> 🔴 **URGENCE ABSOLUE** : Désactiver les workflows problématiques  
> 🔴 **42+ workflows** → Réduire à 3-4 maximum  
> 🔴 **Tests non configurés** → Configurer Jest  
> 🔴 **Build cassé** → Corriger les dépendances  
> 🔴 **Milliers d'erreurs** → Nettoyer et stabiliser  
> 🔴 **Méthode** : 100% via API GitHub, jamais de commandes locales  

---

## 🏆 Objectifs Post-Stabilisation

Une fois la crise résolue :

- ✅ 3-4 workflows maximum fonctionnels
- ✅ Build qui passe
- ✅ Tests configurés (80% coverage)
- ✅ 0 erreur GitHub
- ✅ CI/CD < 5 minutes
- ✅ Publication NPM automatisée
- ✅ Documentation à jour

---

*Document maintenu par l'équipe Dainabase*  
*Dernière mise à jour: 14 Août 2025 - ÉTAT D'URGENCE*  
*Version: 1.0.1-beta.2 - BUILD CASSÉ*  
*Contact urgent: dev@dainabase.com*
