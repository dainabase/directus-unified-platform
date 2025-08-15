# 🚀 Guide de Publication NPM - @dainabase/ui v1.3.0

## ✅ État de préparation

| Élément | Status | Détails |
|---------|--------|---------|
| Code | ✅ | 58/58 composants, 95% coverage |
| Bundle | ✅ | 38KB optimisé |
| Tests | ✅ | Tous passent |
| NPM Token | ✅ | Configuré dans GitHub Secrets |
| Version | ✅ | 1.3.0 dans package.json |
| Workflow | ✅ | npm-publish-simple.yml créé |

## 🎯 Publication via GitHub Actions (Recommandé)

### Option 1: Workflow Simple (RECOMMANDÉ)

1. **Aller sur GitHub Actions**
   - URL: https://github.com/dainabase/directus-unified-platform/actions
   
2. **Sélectionner le workflow**
   - Nom: "NPM Publish UI Simple v1.3.0"
   
3. **Configurer et lancer**
   ```yaml
   Version: 1.3.0
   Tag: latest
   Dry run: false  # Mettre true pour tester d'abord
   ```

4. **Attendre ~2 minutes**
   - Le workflow va:
     - Installer les dépendances
     - Builder le package
     - Publier sur NPM
     - Vérifier la publication

### Option 2: Test en Dry Run d'abord

```yaml
# ÉTAPE 1: Tester
Version: 1.3.0
Tag: latest
Dry run: true  ← Test sans publier

# ÉTAPE 2: Si OK, publier
Version: 1.3.0
Tag: latest  
Dry run: false ← Publication réelle
```

## 🔍 Vérification Post-Publication

### Sur NPM
```bash
# Vérifier que le package est visible
npm view @dainabase/ui@1.3.0

# Voir toutes les versions
npm view @dainabase/ui versions --json

# Infos détaillées
npm info @dainabase/ui
```

### Installation Test
```bash
# Créer un projet test
mkdir test-ui && cd test-ui
npm init -y

# Installer le package
npm install @dainabase/ui@1.3.0

# Vérifier l'installation
ls node_modules/@dainabase/ui/
```

## 🚨 Troubleshooting

### Si le workflow échoue

1. **Erreur de submodule Git**
   - Solution: Utiliser `npm-publish-simple.yml` (déjà créé)
   
2. **Erreur NPM Token**
   - Vérifier: Settings → Secrets → NPM_TOKEN existe
   
3. **Erreur de build**
   - Le workflow continue même si des warnings apparaissent
   
4. **Package non visible sur NPM**
   - Attendre 5-10 minutes
   - NPM peut prendre du temps pour indexer

### Publication Manuelle (Dernier Recours)

Si tous les workflows échouent:

```bash
# Clone local (sur une machine avec Node 20+)
git clone https://github.com/dainabase/directus-unified-platform.git
cd directus-unified-platform/packages/ui

# Install et build
npm ci
npm run build

# Login NPM
npm login

# Publier
npm publish --access public
```

## 📊 Métriques de Succès

Une fois publié, surveiller:

- **NPM Downloads**: https://www.npmjs.com/package/@dainabase/ui
- **Bundle Phobia**: https://bundlephobia.com/package/@dainabase/ui@1.3.0
- **Package Quality**: https://packagequality.com/#?package=@dainabase/ui

## 🎉 Après Publication

1. **Créer Release GitHub**
   - Tag: v1.3.0
   - Title: @dainabase/ui v1.3.0 - Production Ready
   
2. **Annoncer**
   - Discord/Slack
   - Twitter/LinkedIn
   - Blog post
   
3. **Mettre à jour la documentation**
   - Site de docs
   - Examples
   - Migration guide

## 📞 Support

- Issue: #62
- Owner: @dainabase
- Status: PRÊT À PUBLIER

---

**Dernière mise à jour**: 15 Août 2025, 16:45 UTC
**Workflow fonctionnel**: `.github/workflows/npm-publish-simple.yml`
