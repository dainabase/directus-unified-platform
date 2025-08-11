# 🧹 Plan de Nettoyage - Branche feat/design-system-apple
Date : 11 août 2025

## 📋 Résumé du Problème
- La branche `feat/design-system-apple` est obsolète (marquée le 10/08)
- 29 commits ont été ajoutés APRÈS le marquage obsolète
- Tout le travail important est déjà dans `main`
- Score réel : 92/100 sur `main` (pas sur cette branche)

## ✅ Actions à Effectuer

### 1. Vérifier s'il y a quelque chose à récupérer (5 min)
```bash
# Voir les fichiers uniques dans la branche remote
git diff --name-only main origin/feat/design-system-apple

# Si fichiers importants trouvés, les cherry-pick
git cherry-pick <commit-hash>
```

### 2. Nettoyer la branche locale (immédiat)
```bash
# Retourner sur main
git checkout main

# Supprimer la branche locale obsolète
git branch -D feat/design-system-apple
```

### 3. Créer une PR de suppression sur GitHub (recommandé)
```bash
# Option A : Via GitHub CLI
gh pr create --title "chore: remove obsolete feat/design-system-apple branch" \
  --body "Cette branche est obsolète depuis le 10/08. Tout le travail est dans main (v1.0.0-beta.1)" \
  --base feat/design-system-apple --head main

# Option B : Supprimer directement (après backup)
git push origin --delete feat/design-system-apple
```

### 4. Nettoyer les autres branches obsolètes
```bash
# Vérifier feat/design-system-v1.0.0
git log main..origin/feat/design-system-v1.0.0 --oneline

# Si vide ou mergée, supprimer aussi
git push origin --delete feat/design-system-v1.0.0
```

## 🔐 Backup de Sécurité (optionnel)
```bash
# Créer un tag de backup avant suppression
git tag backup/feat-design-system-apple-$(date +%Y%m%d) origin/feat/design-system-apple
git push origin backup/feat-design-system-apple-$(date +%Y%m%d)
```

## ⚠️ Points d'Attention
1. Les commits d'audit dans la branche obsolète ne sont PAS nécessaires
2. L'audit CORRECT a été refait sur `main` (score 92/100)
3. Le package NPM est publié depuis `main` (v1.0.0-beta.1)
4. NE PAS merger cette branche dans main (contamination)

## 📝 Commande Rapide (tout-en-un)
```bash
# Exécuter depuis le repo
git checkout main && \
git branch -D feat/design-system-apple 2>/dev/null && \
git tag backup/obsolete-$(date +%Y%m%d%H%M) origin/feat/design-system-apple && \
git push origin backup/obsolete-$(date +%Y%m%d%H%M) && \
echo "✅ Backup créé. Prêt pour suppression remote."
```

## 🎯 Résultat Attendu
- Seule `main` reste comme branche de référence
- Historique Git plus propre
- Pas de confusion sur quelle branche utiliser
- Design System v1.0.0-beta.1 clairement sur `main`
