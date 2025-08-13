# 🚀 Guide de Publication NPM - @dainabase/ui

## 📊 État Actuel
- **Package**: @dainabase/ui v1.1.0
- **Bundle**: 50KB ✅
- **Coverage**: ~95%+ ✅
- **Status**: PRÊT À PUBLIER ✅

## 🎯 5 MÉTHODES pour Publier sur NPM

### Méthode 1: Via GitHub Release (RECOMMANDÉ) ⭐
**Avantage**: Pas besoin de bouton workflow, publication automatique

1. **Créer une Release GitHub**:
   - Aller sur [Releases](https://github.com/dainabase/directus-unified-platform/releases)
   - Cliquer **"Draft a new release"**
   - **Tag version**: `ui-v1.1.0` ou `v1.1.0`
   - **Release title**: `@dainabase/ui v1.1.0 - Production Ready`
   - **Description**:
   ```markdown
   ## 🎉 First Public Release - @dainabase/ui v1.1.0
   
   ### ✨ Features
   - 58 production-ready components
   - ~95% test coverage
   - 50KB optimized bundle
   - Full TypeScript support
   
   ### 📦 Installation
   npm install @dainabase/ui
   ```
   - Cliquer **"Publish release"**

✅ **Le workflow `npm-auto-publish.yml` se déclenchera automatiquement!**

---

### Méthode 2: Via GitHub Actions (Si le bouton apparaît)

**Workflows disponibles**:
1. **📦 NPM Publish UI Package** - Le plus complet
2. **Quick NPM Publish** - Le plus simple
3. **NPM Publish** - L'original

**Pour faire apparaître le bouton**:
- Attendez 1-2 minutes après la création des workflows
- Rafraîchissez la page [Actions](https://github.com/dainabase/directus-unified-platform/actions)
- Cherchez les workflows dans la liste à gauche

---

### Méthode 3: Via API GitHub (Direct)

Si vous avez un Personal Access Token GitHub:

```bash
curl -X POST \
  -H "Authorization: token YOUR_GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/dainabase/directus-unified-platform/actions/workflows/quick-npm-publish.yml/dispatches \
  -d '{"ref":"main","inputs":{"confirm":"publish"}}'
```

---

### Méthode 4: Via Script Local

Si vous avez accès local au repository:

```bash
# Cloner le repo
git clone https://github.com/dainabase/directus-unified-platform.git
cd directus-unified-platform/packages/ui

# Utiliser le script magique
node scripts/publish-to-npm.js
```

---

### Méthode 5: Publication Manuelle NPM

Si vous avez les credentials NPM:

```bash
# Dans le dossier packages/ui
npm login
npm publish --access public
```

---

## 🔍 Vérification Post-Publication

Après publication (2-3 minutes):
- **NPM**: https://www.npmjs.com/package/@dainabase/ui
- **Unpkg CDN**: https://unpkg.com/@dainabase/ui
- **jsDelivr**: https://cdn.jsdelivr.net/npm/@dainabase/ui

**Test d'installation**:
```bash
npm install @dainabase/ui
# ou
yarn add @dainabase/ui
# ou
pnpm add @dainabase/ui
```

---

## 🚨 Troubleshooting

### Si les workflows n'apparaissent pas:
1. **Attendez 2-3 minutes** - GitHub met parfois du temps
2. **Vérifiez l'onglet Actions** - Cherchez dans "All workflows"
3. **Utilisez la méthode Release** - Toujours fonctionnelle

### Si la publication échoue:
1. **Vérifiez NPM_TOKEN** dans Settings > Secrets
2. **Vérifiez package.json** version et name
3. **Consultez les logs** dans l'onglet Actions

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/dainabase/directus-unified-platform/issues)
- **Documentation**: packages/ui/docs/
- **Discord**: discord.gg/dainabase

---

## ✅ Checklist Finale

- [ ] NPM_TOKEN configuré dans GitHub Secrets
- [ ] Version 1.1.0 dans package.json
- [ ] Tests passent (~95%+ coverage)
- [ ] Bundle size < 100KB (actuel: 50KB)
- [ ] Documentation complète

**Tout est prêt! Choisissez votre méthode préférée et publiez!** 🎉

---

*Dernière mise à jour: 13 Août 2025*
