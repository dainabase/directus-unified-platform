# ⚠️ DELETE ui-chromatic-main.yml

## 🔴 ACTION REQUISE : SUPPRIMER LE FICHIER DOUBLON

Le fichier `.github/workflows/ui-chromatic-main.yml` doit être supprimé car :

1. **C'est un doublon complet** du workflow principal `ui-chromatic.yml`
2. **Le workflow principal couvre déjà** les branches `main` et `develop`
3. **Double exécution inutile** sur la branche main
4. **Gaspillage de ressources CI/CD**

## ✅ Workflow à conserver
- `.github/workflows/ui-chromatic.yml` (couvre main + develop)

## 🔴 Workflow à supprimer
- `.github/workflows/ui-chromatic-main.yml` (doublon, main uniquement)

## 📝 Commande pour supprimer
```bash
git rm .github/workflows/ui-chromatic-main.yml
git commit -m "chore: Remove duplicate Chromatic workflow 🧹"
```

---
*Ce fichier sera supprimé après la suppression du workflow doublon*
