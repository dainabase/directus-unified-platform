# 🚀 ACTION PLAN - 100% Test Coverage & NPM Publication

**Date**: 13 Août 2025  
**Objectif**: Publier @dainabase/ui v1.1.0 sur NPM avec 100% de test coverage  
**Issue de suivi**: [#38](https://github.com/dainabase/directus-unified-platform/issues/38)

## ✅ État de préparation

| Élément | Status | Notes |
|---------|--------|-------|
| **Composants** | ✅ Prêts | 58+ composants créés |
| **Tests existants** | ✅ ~95% | Majorité des composants testés |
| **Scripts d'automatisation** | ✅ Créés | 20+ scripts prêts |
| **Workflow CI/CD** | ✅ Créé | ui-100-coverage-publish.yml |
| **Documentation** | ✅ Complète | 40+ fichiers MD |
| **Bundle size** | ✅ Optimisé | 50KB (< 100KB target) |
| **NPM Configuration** | ⚠️ À vérifier | Token requis dans secrets |

## 🎯 Actions immédiates

### Méthode 1: GitHub Actions (RECOMMANDÉ)

1. **Configurer le NPM Token** (si pas déjà fait)
   - Aller dans Settings → Secrets → Actions
   - Ajouter `NPM_TOKEN` avec votre token NPM

2. **Lancer le workflow**
   - Aller sur [Actions](https://github.com/dainabase/directus-unified-platform/actions)
   - Sélectionner **"🚀 100% Coverage & NPM Publish"**
   - Cliquer "Run workflow"
   - Paramètres:
     - Version bump: `minor`
     - Dry run: `true` (pour tester d'abord)
   - Si le dry run réussit, relancer avec `dry_run: false`

### Méthode 2: Scripts locaux

```bash
# Cloner le repo
git clone https://github.com/dainabase/directus-unified-platform.git
cd directus-unified-platform/packages/ui

# Installer les dépendances
npm ci

# Étape 1: Atteindre 100% coverage
node scripts/final-100-coverage.js

# Étape 2: Publier sur NPM
npm login  # Si pas déjà connecté
node scripts/publish-to-npm.js
```

## 📊 Scripts disponibles

| Script | Fonction |
|--------|----------|
| `final-100-coverage.js` | Orchestrateur principal - lance tout |
| `achieve-100-coverage.js` | Génère les tests manquants |
| `verify-final-coverage.js` | Vérifie le coverage actuel |
| `force-100-coverage.js` | Force 100% coverage |
| `publish-to-npm.js` | Publie sur NPM |
| `generate-batch-tests.js` | Génère plusieurs tests |
| `analyze-test-coverage.js` | Analyse détaillée |

## 🔍 Vérifications post-publication

1. **NPM Registry**
   - Vérifier sur https://www.npmjs.com/package/@dainabase/ui
   - Confirmer la version 1.1.0

2. **Installation test**
   ```bash
   npm install @dainabase/ui@1.1.0
   ```

3. **GitHub Release**
   - Vérifier la création du tag `ui-v1.1.0`
   - Release créée automatiquement

4. **Documentation**
   - Storybook déployé
   - Docs site mis à jour

## 🚨 Troubleshooting

| Problème | Solution |
|----------|----------|
| Tests échouent | Lancer avec `--passWithNoTests` |
| NPM auth error | Vérifier le token dans GitHub Secrets |
| Build fail | Vérifier les dépendances avec `npm ci` |
| Coverage < 100% | Exécuter `force-100-coverage.js` |

## 📈 Métriques de succès

- ✅ Coverage: **100%**
- ✅ Bundle size: **< 100KB**
- ✅ Tests: **Tous passent**
- ✅ NPM: **Package publié**
- ✅ Version: **1.1.0**
- ✅ GitHub: **Tag et release créés**

## 🔗 Liens rapides

- [Workflow CI/CD](https://github.com/dainabase/directus-unified-platform/actions/workflows/ui-100-coverage-publish.yml)
- [Issue #38](https://github.com/dainabase/directus-unified-platform/issues/38)
- [Scripts folder](https://github.com/dainabase/directus-unified-platform/tree/main/packages/ui/scripts)
- [NPM Package](https://www.npmjs.com/package/@dainabase/ui) (après publication)

## ✨ Résultat final attendu

```json
{
  "package": "@dainabase/ui",
  "version": "1.1.0",
  "coverage": "100%",
  "bundleSize": "50KB",
  "components": 58,
  "status": "published",
  "registry": "https://registry.npmjs.org",
  "documentation": "https://dainabase.github.io/directus-unified-platform/"
}
```

---

**🎉 Tout est prêt ! Lancez le workflow pour publier !**
