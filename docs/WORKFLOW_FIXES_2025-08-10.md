# Workflow Fixes - 10 Août 2025

## ✅ Corrections appliquées

### Problème identifié
- **Cause racine** : Absence du fichier `pnpm-lock.yaml`
- **Symptôme** : Tous les workflows échouaient car ils utilisaient `pnpm install --frozen-lockfile`
- **Impact** : Aucun workflow ne pouvait s'exécuter

### Solutions implémentées

1. **Modification de tous les workflows** (commit: 4a02b43)
   - Retiré `--frozen-lockfile` de toutes les commandes `pnpm install`
   - Workflows modifiés :
     - ✅ ui-ci.yml
     - ✅ ui-storybook-pages.yml
     - ✅ ui-chromatic.yml
     - ✅ ui-a11y.yml
     - ✅ web-ci.yml
     - ✅ release.yml
   - Note : ds-guard.yml n'avait pas besoin de modification (pas de pnpm install)

2. **Ajout d'un workflow de génération** (commit: 85a9016)
   - Nouveau workflow : `generate-lockfile.yml`
   - Permet de générer le `pnpm-lock.yaml` manuellement
   - Upload le fichier comme artifact téléchargeable

## 📋 Prochaines étapes

### 1. Générer le pnpm-lock.yaml
```bash
# Option A : Via GitHub Actions (recommandé)
1. Aller sur : https://github.com/dainabase/directus-unified-platform/actions
2. Sélectionner "Generate Lockfile"
3. Cliquer sur "Run workflow" > Branch: feat-design-system-apple
4. Télécharger l'artifact "pnpm-lock" une fois terminé
5. Committer le fichier dans le repo

# Option B : Localement
1. git clone https://github.com/dainabase/directus-unified-platform.git
2. git checkout feat-design-system-apple
3. pnpm install
4. git add pnpm-lock.yaml
5. git commit -m "chore: add pnpm-lock.yaml"
6. git push
```

### 2. Vérifier les workflows
- Les workflows devraient maintenant fonctionner sur push
- Le workflow UI CI devrait se déclencher automatiquement
- Vérifier sur : https://github.com/dainabase/directus-unified-platform/actions

### 3. Restaurer la sécurité (optionnel, après génération du lockfile)
Une fois le `pnpm-lock.yaml` committé, on peut remettre `--frozen-lockfile` pour plus de sécurité :
```yaml
run: pnpm install --frozen-lockfile
```

### 4. Configuration GitHub Pages
Pour déployer Storybook :
1. Settings > Pages
2. Source : GitHub Actions
3. Lancer le workflow "Deploy Storybook to GitHub Pages"

## 🔍 Vérifications recommandées

```bash
# Vérifier que les packages sont correctement définis
pnpm ls @dainabase/ui
pnpm ls @dainabase/web

# Tester les builds localement
pnpm --filter @dainabase/ui build
pnpm --filter @dainabase/web build
pnpm --filter @dainabase/ui build:sb:static
```

## 📝 Notes importantes

- Le `packageManager` est correctement défini : `pnpm@9.15.1`
- La structure monorepo est en place avec `pnpm-workspace.yaml`
- Les packages utilisent `workspace:*` pour les dépendances internes
- Node v20 est requis (défini dans `.nvmrc`)

## 🚀 État actuel
- ✅ Workflows corrigés et pushés
- ⏳ En attente de génération du `pnpm-lock.yaml`
- ⏳ Workflows prêts à être testés après génération du lockfile
