# 📦 NPM Publication Guide - @dainabase/ui v1.1.0

> **État**: PRÊT À PUBLIER ✅ | **Date**: 13 Août 2025  
> **Package**: @dainabase/ui | **Version**: 1.1.0  
> **Coverage**: 93%+ | **Bundle**: 50KB | **Docs**: 100%

## ✅ Configuration Complétée (100%)

### Fichiers Configurés
- ✅ `package.json` - v1.1.0 avec publishConfig
- ✅ `.github/workflows/npm-publish.yml` - Workflow automatisé
- ✅ `CHANGELOG.md` - Release notes complètes
- ✅ `.npmignore` - Optimisation bundle
- ✅ `LICENSE` - MIT License
- ✅ `README.md` - Documentation avec badges
- ✅ Scripts `prepublishOnly` - Tests avant publication

## 🔐 Configuration du NPM Token (SEULE ÉTAPE RESTANTE)

### Étape 1: Créer un compte NPM (si nécessaire)
1. Aller sur [npmjs.com](https://www.npmjs.com/)
2. Créer un compte avec le nom `dainabase`
3. Vérifier l'email

### Étape 2: Générer un Token NPM
1. Se connecter sur [npmjs.com](https://www.npmjs.com/)
2. Cliquer sur votre avatar → **Access Tokens**
3. Cliquer sur **Generate New Token**
4. Choisir **Type**: `Automation` (important!)
5. Nommer le token: `github-actions-publish`
6. **COPIER LE TOKEN** (ne sera visible qu'une fois)

### Étape 3: Ajouter le Token aux Secrets GitHub
1. Aller sur [GitHub Repository Settings](https://github.com/dainabase/directus-unified-platform/settings/secrets/actions)
2. Cliquer sur **New repository secret**
3. Configuration:
   - **Name**: `NPM_TOKEN`
   - **Value**: [Coller le token NPM]
4. Cliquer sur **Add secret**

## 🚀 Publication

### Option A: Publication Manuelle (Test)
1. Aller sur [Actions](https://github.com/dainabase/directus-unified-platform/actions)
2. Sélectionner **"NPM Publish"**
3. Cliquer **"Run workflow"**
4. Choisir:
   - Branch: `main`
   - Release type: `patch` (pour test dry-run)
5. Cliquer **"Run workflow"**

Le workflow fera un **dry-run** (test sans publier) pour vérifier que tout fonctionne.

### Option B: Publication Automatique (Production)
1. Créer une [nouvelle release](https://github.com/dainabase/directus-unified-platform/releases/new)
2. Configuration:
   - **Tag**: `ui-v1.1.0`
   - **Title**: `@dainabase/ui v1.1.0 - Production Ready`
   - **Description**: Copier depuis CHANGELOG.md
3. Publier la release → déclenche automatiquement la publication NPM

## 📊 Vérification Post-Publication

### 1. Vérifier sur NPM
```bash
# Après ~2 minutes
https://www.npmjs.com/package/@dainabase/ui
```

### 2. Test d'Installation
```bash
# Dans un projet test
npm install @dainabase/ui
# ou
yarn add @dainabase/ui
# ou  
pnpm add @dainabase/ui
```

### 3. Vérifier les Métriques
- Bundle size sur npm
- Downloads counter
- Version correcte (1.1.0)
- README affiché correctement

## 🎯 Checklist Finale

- [ ] Compte NPM créé (@dainabase)
- [ ] Token NPM généré (type: Automation)
- [ ] NPM_TOKEN ajouté aux secrets GitHub
- [ ] Test dry-run effectué
- [ ] Publication réussie
- [ ] Package visible sur npmjs.com
- [ ] Installation test validée

## 📈 Métriques Attendues

| Métrique | Valeur |
|----------|--------|
| Package Size | ~50KB |
| Unpacked Size | ~500KB |
| Total Files | ~100 |
| Dependencies | 5 |
| Version | 1.1.0 |

## 🆘 Troubleshooting

### Erreur: "npm ERR! 401 Unauthorized"
→ Token NPM invalide ou manquant dans les secrets

### Erreur: "npm ERR! 403 Forbidden"
→ Package name déjà pris ou pas de permissions

### Erreur: Tests Failed
→ Les tests doivent passer avant publication

### Workflow ne se déclenche pas
→ Vérifier que le token est bien nommé `NPM_TOKEN`

## 📞 Support

- **Issue**: [#36](https://github.com/dainabase/directus-unified-platform/issues/36)
- **Workflow**: [npm-publish.yml](https://github.com/dainabase/directus-unified-platform/actions/workflows/npm-publish.yml)
- **Package**: [@dainabase/ui](https://www.npmjs.com/package/@dainabase/ui)

---

**🎉 Une fois le NPM_TOKEN configuré, le Design System sera publié et disponible mondialement !**

*Dernière mise à jour: 13 Août 2025, 16h50 UTC*
