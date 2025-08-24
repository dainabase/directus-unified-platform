# 🧹 Script de Nettoyage - Fichiers Temporaires

## 📅 Date: 12 Août 2025
## ⚠️ Action Requise: Suppression Manuelle

---

## 🔴 Limitation API GitHub

L'API GitHub ne permet pas la suppression directe de fichiers via les outils API.
Ces fichiers doivent être supprimés manuellement via git local.

---

## 📝 Fichiers à Supprimer

### 1. TEST_TRIGGER.md
- **Path** : `/TEST_TRIGGER.md`
- **SHA** : `abd105cff62570e7c5a00b6367db3323bb236a89`
- **Purpose** : Fichier temporaire pour déclencher les workflows CI/CD
- **Created** : 12 Août 2025, 08:25 UTC

### 2. Chromatic Test Component
- **Path** : `/packages/ui/src/components/chromatic-test/chromatic-test.tsx`
- **Purpose** : Composant de test pour validation Chromatic
- **Status** : Plus nécessaire

### 3. Chromatic Test Story
- **Path** : `/packages/ui/src/components/chromatic-test/chromatic-test.stories.tsx`
- **Purpose** : Story de test pour validation Chromatic
- **Status** : Plus nécessaire

---

## 🛠️ Script de Suppression

### Option 1: Commandes Git (Recommandé)

```bash
#!/bin/bash
# cleanup-temp-files.sh

# Clone le repo si pas déjà fait
git clone https://github.com/dainabase/directus-unified-platform.git
cd directus-unified-platform

# S'assurer d'être sur main et à jour
git checkout main
git pull origin main

# Supprimer les fichiers temporaires
echo "🗑️ Suppression des fichiers temporaires..."

# Fichier 1: TEST_TRIGGER.md
if [ -f "TEST_TRIGGER.md" ]; then
    git rm TEST_TRIGGER.md
    echo "✅ TEST_TRIGGER.md supprimé"
else
    echo "⏭️ TEST_TRIGGER.md déjà supprimé"
fi

# Fichier 2: chromatic-test.tsx
if [ -f "packages/ui/src/components/chromatic-test/chromatic-test.tsx" ]; then
    git rm packages/ui/src/components/chromatic-test/chromatic-test.tsx
    echo "✅ chromatic-test.tsx supprimé"
else
    echo "⏭️ chromatic-test.tsx déjà supprimé"
fi

# Fichier 3: chromatic-test.stories.tsx
if [ -f "packages/ui/src/components/chromatic-test/chromatic-test.stories.tsx" ]; then
    git rm packages/ui/src/components/chromatic-test/chromatic-test.stories.tsx
    echo "✅ chromatic-test.stories.tsx supprimé"
else
    echo "⏭️ chromatic-test.stories.tsx déjà supprimé"
fi

# Supprimer le dossier vide si existe
if [ -d "packages/ui/src/components/chromatic-test" ]; then
    rmdir packages/ui/src/components/chromatic-test 2>/dev/null
    echo "✅ Dossier chromatic-test supprimé"
fi

# Commit et push
echo "📝 Création du commit..."
git commit -m "chore: clean up temporary test files

- Remove TEST_TRIGGER.md (CI/CD validation file)
- Remove chromatic-test component and story
- Clean up after successful bundle optimization"

echo "📤 Push vers GitHub..."
git push origin main

echo "✨ Nettoyage terminé!"
```

### Option 2: Commandes Manuelles

```bash
# 1. Cloner ou naviguer vers le repo
cd /path/to/directus-unified-platform

# 2. S'assurer d'être sur main
git checkout main
git pull origin main

# 3. Supprimer les fichiers
git rm TEST_TRIGGER.md
git rm packages/ui/src/components/chromatic-test/chromatic-test.tsx
git rm packages/ui/src/components/chromatic-test/chromatic-test.stories.tsx

# 4. Commit
git commit -m "chore: clean up temporary test files"

# 5. Push
git push origin main
```

### Option 3: Via GitHub Desktop

1. Ouvrir GitHub Desktop
2. Sélectionner le repository `directus-unified-platform`
3. Pull les derniers changements
4. Supprimer les fichiers via l'explorateur:
   - `TEST_TRIGGER.md`
   - `packages/ui/src/components/chromatic-test/*`
5. Commit avec message: "chore: clean up temporary test files"
6. Push vers `main`

---

## 🔍 Vérification Post-Nettoyage

```bash
# Vérifier que les fichiers sont supprimés
ls -la TEST_TRIGGER.md 2>/dev/null || echo "✅ TEST_TRIGGER.md supprimé"
ls -la packages/ui/src/components/chromatic-test/ 2>/dev/null || echo "✅ chromatic-test supprimé"

# Vérifier le statut git
git status

# Vérifier sur GitHub
echo "🌐 Vérifier sur: https://github.com/dainabase/directus-unified-platform"
```

---

## 📊 Impact du Nettoyage

| Aspect | Avant | Après |
|--------|-------|-------|
| Fichiers temporaires | 3 | 0 |
| Structure repo | Fichiers de test | Clean |
| CI/CD | Validé | Maintenu |
| Bundle size | Non affecté | Non affecté |

---

## ⚠️ Notes Importantes

1. **Pourquoi manuel?** L'API GitHub ne supporte pas la suppression directe via les tools
2. **Timing** : Peut être fait à tout moment sans impact sur le CI/CD
3. **Backup** : Les fichiers sont dans l'historique git si besoin
4. **Validation** : Les workflows continueront de fonctionner après suppression

---

## ✅ Checklist

- [ ] Repo cloné localement
- [ ] Sur branche `main`
- [ ] À jour avec `origin/main`
- [ ] TEST_TRIGGER.md supprimé
- [ ] chromatic-test.tsx supprimé
- [ ] chromatic-test.stories.tsx supprimé
- [ ] Commit créé
- [ ] Push effectué
- [ ] Vérification sur GitHub

---

**Status** : En attente de suppression manuelle
**Priorité** : Faible (cosmétique)
**Impact** : Aucun sur les fonctionnalités