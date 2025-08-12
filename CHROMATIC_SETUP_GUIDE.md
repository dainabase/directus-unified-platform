# 🎨 Chromatic Setup Guide

## Configuration du Token Chromatic

### 📅 Date: 12 Août 2025
### 🎯 Objectif: Activer les tests de régression visuelle

---

## 🚀 Configuration Rapide

### Option 1: Utiliser le Token Existant (Temporaire)
Le workflow a déjà un token par défaut configuré : `chpt_3606195941442a3`
- ✅ **Statut** : Fonctionnel
- ⚠️ **Note** : Token partagé, remplacer par votre propre token en production

### Option 2: Configurer Votre Propre Token (Recommandé)

#### Étape 1: Obtenir un Token Chromatic
1. Aller sur [Chromatic.com](https://www.chromatic.com/)
2. Se connecter ou créer un compte
3. Créer un nouveau projet ou sélectionner un existant
4. Dans les settings du projet, copier le token (format: `chpt_xxxxxxxxxxxx`)

#### Étape 2: Ajouter le Token à GitHub
1. Aller dans votre repository GitHub
2. **Settings** → **Secrets and variables** → **Actions**
3. Cliquer sur **New repository secret**
4. Configurer :
   - **Name** : `CHROMATIC_PROJECT_TOKEN`
   - **Value** : `chpt_[votre_token_ici]`
5. Cliquer sur **Add secret**

#### Étape 3: Vérifier la Configuration
```bash
# Déclencher manuellement le workflow
gh workflow run ui-chromatic.yml

# Ou via l'interface GitHub
Actions → UI Chromatic → Run workflow
```

---

## 📊 État Actuel

| Aspect | Statut | Notes |
|--------|--------|-------|
| Workflow configuré | ✅ | `.github/workflows/ui-chromatic.yml` |
| Token par défaut | ✅ | `chpt_3606195941442a3` |
| Storybook | ✅ | 58 composants documentés |
| Auto-accept sur main | ✅ | Changements auto-acceptés |
| PR comments | ✅ | URLs Chromatic dans les PRs |

---

## 🔧 Configuration du Workflow

### Déclencheurs
- **Push** sur `main` ou `develop`
- **Pull Request** vers `main` ou `develop`
- **Manuel** via `workflow_dispatch`
- **Paths** : Changements dans `packages/ui/src/**` ou `.storybook/**`

### Features
- ✅ Build Storybook automatique
- ✅ Comparaison visuelle
- ✅ Auto-accept sur main
- ✅ Commentaires PR avec URLs
- ✅ Only changed components

---

## 📝 Commandes Utiles

```bash
# Build Storybook local
pnpm --filter @dainabase/ui build-storybook

# Run Chromatic local (nécessite token)
pnpm --filter @dainabase/ui chromatic

# Vérifier les stories
pnpm --filter @dainabase/ui storybook
```

---

## 🎯 Métriques Chromatic

| Métrique | Cible | Description |
|----------|-------|-------------|
| Build time | <5min | Temps de build Chromatic |
| Snapshots | 58+ | Nombre de composants testés |
| Changes | 0 sur main | Changements visuels détectés |
| Coverage | 100% | Composants avec stories |

---

## 🚨 Troubleshooting

### Erreur: Token Invalid
```
Error: Invalid project token
```
**Solution** : Vérifier le format du token (doit commencer par `chpt_`)

### Erreur: Build Failed
```
Error: Storybook build failed
```
**Solution** : 
1. Vérifier localement : `pnpm --filter @dainabase/ui build-storybook`
2. Corriger les erreurs TypeScript/Build
3. Re-déclencher le workflow

### Erreur: Too Many Changes
```
Warning: 50+ visual changes detected
```
**Solution** :
1. Reviewer les changements dans Chromatic UI
2. Accepter ou rejeter les changements
3. Mettre à jour les baselines si nécessaire

---

## 📚 Ressources

- [Chromatic Documentation](https://www.chromatic.com/docs/)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Storybook Documentation](https://storybook.js.org/docs/)
- [Workflow File](.github/workflows/ui-chromatic.yml)

---

## ✅ Checklist de Validation

- [ ] Token configuré (propre ou défaut)
- [ ] Workflow déclenché manuellement
- [ ] Build Chromatic réussi
- [ ] URLs générées (Build & Storybook)
- [ ] Baselines établies
- [ ] PR test avec commentaire automatique

---

**Dernière mise à jour** : 12 Août 2025, 09:55 UTC
**Status** : Token par défaut fonctionnel, configuration custom optionnelle