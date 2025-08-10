# Releasing @dainabase/ui

## Phase A — Versioning (sans publier)

1. Créer un changeset :
   ```bash
   pnpm changeset
   # choisir "minor" / "patch" + message
   ```

2. Merger la PR changesets → workflow `Changesets Release` ouvrira une PR de version (bump + changelog).

3. Merger la PR de version → tag + changelog créés (pas de publish si `private: true`).

## Phase B — Publication

- Choisir la cible:
  - GitHub Packages: `publishConfig.registry=https://npm.pkg.github.com/` + `.npmrc` avec `GITHUB_TOKEN`.
  - npm public: `.npmrc` + secret `NPM_TOKEN`.
- Passer `"private": false` dans `packages/ui/package.json`.
- Refaire un changeset → merge → la PR de version → merge → **publish** auto.

## Tips

- `pnpm changeset version` localement = preview des versions
- Revert simple: revert du merge commit de la PR de version.