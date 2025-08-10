# 🚨 COPIER-COLLER CES 3 BLOCS MAINTENANT

## BLOC 1: CRÉER LE TAG (30 secondes)
```bash
cd ~/directus-unified-platform
git checkout main && git pull
git tag @dainabase/ui@1.0.0-beta.1 -m "Release v1.0.0-beta.1"
git push origin @dainabase/ui@1.0.0-beta.1
```

## BLOC 2: PUBLIER SUR NPM (1 minute)
```bash
cd packages/ui
npm login --registry=https://npm.pkg.github.com --scope=@dainabase
npm publish --tag beta --registry https://npm.pkg.github.com/
npm view @dainabase/ui@beta --registry https://npm.pkg.github.com/
```

## BLOC 3: CRÉER LA RELEASE GITHUB (30 secondes)

### Option A: Avec GitHub CLI
```bash
gh release create "@dainabase/ui@1.0.0-beta.1" \
  --repo "dainabase/directus-unified-platform" \
  --title "🚀 Design System v1.0.0-beta.1" \
  --notes "$(cat GITHUB_RELEASE_v1.0.0-beta.1.md)" \
  --prerelease \
  --target main
```

### Option B: Via le navigateur
👉 **Ouvrir**: https://github.com/dainabase/directus-unified-platform/releases/new

**Remplir**:
- Tag: `@dainabase/ui@1.0.0-beta.1`
- Title: `🚀 Design System v1.0.0-beta.1`
- ✅ Cocher "This is a pre-release"
- Body: Copier depuis [GITHUB_RELEASE_v1.0.0-beta.1.md](https://raw.githubusercontent.com/dainabase/directus-unified-platform/main/GITHUB_RELEASE_v1.0.0-beta.1.md)

---

## ✅ VÉRIFICATION (10 secondes)
```bash
# Vérifier le tag
git tag -l "@dainabase/ui@1.0.0-beta.1"

# Vérifier NPM
npm view @dainabase/ui@beta version --registry https://npm.pkg.github.com/

# Voir la release
open https://github.com/dainabase/directus-unified-platform/releases
```

---

## 🎉 C'EST TOUT! Release v1.0.0-beta.1 terminée!