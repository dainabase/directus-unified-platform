# 🔴 ACTIONS IMMÉDIATES - v1.0.0-beta.1 Release

**Date**: 10 août 2025 - 23:00 UTC  
**Statut**: PR #17 MERGÉE ✅ | Tag PENDING ⚠️ | NPM PENDING ⚠️

## ⚡ COPIER-COLLER CES COMMANDES

### 1️⃣ CRÉER LE TAG GIT (30 secondes)

```bash
# Terminal 1 - Créer et pousser le tag
git checkout main
git pull origin main
git tag @dainabase/ui@1.0.0-beta.1 -m "Release @dainabase/ui v1.0.0-beta.1"
git push origin @dainabase/ui@1.0.0-beta.1
```

✅ **Vérifier**: https://github.com/dainabase/directus-unified-platform/tags

---

### 2️⃣ PUBLIER SUR NPM (2 minutes)

```bash
# Terminal 2 - Publier le package
cd packages/ui

# Vérifier l'authentification GitHub Package Registry
npm whoami --registry=https://npm.pkg.github.com

# Si pas connecté, se connecter:
npm login --registry=https://npm.pkg.github.com --scope=@dainabase

# Publier en beta
npm publish --tag beta --registry https://npm.pkg.github.com/

# Vérifier immédiatement
npm view @dainabase/ui@beta --registry https://npm.pkg.github.com/
```

✅ **Vérifier**: Le package doit apparaître avec version 1.0.0-beta.1

---

### 3️⃣ CRÉER LA GITHUB RELEASE (2 minutes)

**URL**: https://github.com/dainabase/directus-unified-platform/releases/new

**Remplir le formulaire**:
- **Choose a tag**: Sélectionner `@dainabase/ui@1.0.0-beta.1` (créé à l'étape 1)
- **Release title**: `🚀 Design System v1.0.0-beta.1`
- **Target**: `main`
- **Description**: Copier le contenu de [GITHUB_RELEASE_v1.0.0-beta.1.md](https://github.com/dainabase/directus-unified-platform/blob/main/GITHUB_RELEASE_v1.0.0-beta.1.md)
- ✅ **This is a pre-release**: COCHER CETTE CASE
- Cliquer **Publish release**

✅ **Vérifier**: https://github.com/dainabase/directus-unified-platform/releases

---

## 📊 STATUT EN TEMPS RÉEL

| Action | Commande | Status | Vérification |
|--------|----------|--------|--------------|
| Git Tag | `git tag @dainabase/ui@1.0.0-beta.1` | ⚠️ TODO | [Tags](https://github.com/dainabase/directus-unified-platform/tags) |
| Push Tag | `git push origin @dainabase/ui@1.0.0-beta.1` | ⚠️ TODO | Tag visible sur GitHub |
| NPM Auth | `npm login --registry=https://npm.pkg.github.com` | ⚠️ TODO | `npm whoami` |
| NPM Publish | `npm publish --tag beta` | ⚠️ TODO | `npm view @dainabase/ui@beta` |
| GitHub Release | Via interface web | ⚠️ TODO | [Releases](https://github.com/dainabase/directus-unified-platform/releases) |

---

## 🚀 SCRIPT AUTOMATISÉ (OPTIONNEL)

```bash
# Exécuter le script complet
chmod +x scripts/release-v1.0.0-beta.1.sh
./scripts/release-v1.0.0-beta.1.sh
```

---

## ✅ VÉRIFICATION FINALE

Après toutes les actions, vérifier:

```bash
# 1. Tag existe
git tag -l "@dainabase/ui@1.0.0-beta.1"

# 2. Package NPM publié
npm view @dainabase/ui@beta version --registry https://npm.pkg.github.com/

# 3. Tester l'installation
mkdir /tmp/test-ds && cd /tmp/test-ds
npm init -y
npm install @dainabase/ui@beta --registry https://npm.pkg.github.com/
ls node_modules/@dainabase/ui/
```

---

## 🎯 PROCHAINES ÉTAPES (APRÈS PUBLICATION)

### Dans les applications (`apps/web`):
```bash
# Mettre à jour vers la beta
pnpm update @dainabase/ui@beta

# Installer les peer deps nécessaires
pnpm add @radix-ui/react-accordion @radix-ui/react-slider recharts
```

### Notification à l'équipe:
```markdown
🎉 **Design System v1.0.0-beta.1 Released!**

- Bundle: 48KB (-49%)
- Components: 40 (9 new)
- Coverage: 97%
- Install: `pnpm add @dainabase/ui@beta`

[Release Notes](https://github.com/dainabase/directus-unified-platform/releases/tag/@dainabase/ui@1.0.0-beta.1)
```

---

## ⏱️ TIMELINE

- **23:00** - Créer le tag Git ⏰
- **23:02** - Publier sur NPM ⏰
- **23:04** - Créer GitHub Release ⏰
- **23:05** - Vérifier tout fonctionne ⏰
- **23:10** - Notifier l'équipe ⏰

---

## 🆘 TROUBLESHOOTING

### Si le tag existe déjà:
```bash
git tag -d @dainabase/ui@1.0.0-beta.1
git push origin :refs/tags/@dainabase/ui@1.0.0-beta.1
# Puis recréer
```

### Si NPM auth échoue:
```bash
# Vérifier le token GitHub
echo $NPM_TOKEN
# Ou créer un nouveau token sur GitHub
# Settings > Developer settings > Personal access tokens
# Scopes: write:packages, read:packages, delete:packages, repo
```

### Si NPM publish échoue:
```bash
# Vérifier le registre
npm config get registry
npm config set registry https://npm.pkg.github.com/

# Retry avec verbose
npm publish --tag beta --registry https://npm.pkg.github.com/ --verbose
```

---

**🔴 URGENT: Ces 3 actions doivent être complétées MAINTENANT pour finaliser la release!**