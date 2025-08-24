# Instructions d'Archivage - Cleanup Architecture

## 🎯 Objectif
Archiver 120+ fichiers .md de la racine vers `/docs/archive/` pour nettoyer l'architecture du repository.

## 📋 Prérequis
- Python 3.x installé
- Git configuré
- Être sur la branche `cleanup-architecture`

## 🚀 Étapes d'Exécution

### 1. Vérifier la branche actuelle
```bash
git branch --show-current
# Doit afficher: cleanup-architecture
```

Si vous n'êtes pas sur la bonne branche :
```bash
git checkout cleanup-architecture
git pull origin cleanup-architecture
```

### 2. Exécuter le script d'archivage
```bash
cd /chemin/vers/directus-unified-platform
python scripts/archive-md-files.py
```

Le script va :
- ✅ Déplacer tous les fichiers .md vers leurs catégories respectives
- ✅ Créer des commits atomiques pour chaque catégorie
- ✅ Préserver l'historique Git de chaque fichier

### 3. Vérifier les changements
```bash
# Voir le statut
git status

# Voir l'historique des commits
git log --oneline -10

# Vérifier que les fichiers sont bien archivés
ls docs/archive/*/
```

### 4. Remplacer le README principal
```bash
# Archiver l'ancien README
git mv README.md docs/archive/misc/README-OLD.md

# Utiliser le nouveau README
git mv README-NEW.md README.md

# Commiter le changement
git add .
git commit -m "docs: Replace old README with clean version"
```

### 5. Pousser les changements
```bash
git push origin cleanup-architecture
```

### 6. Créer la Pull Request

1. Aller sur GitHub : https://github.com/dainabase/directus-unified-platform
2. Cliquer sur "Pull requests" → "New pull request"
3. Base: `main` ← Compare: `cleanup-architecture`
4. Titre : "chore: Archive 120+ MD files and reorganize documentation"
5. Description :
```markdown
## 🎯 Objectif
Nettoyer la racine du repository en archivant 120+ fichiers .md

## 📋 Changements
- ✅ Archivé 120+ fichiers .md dans `/docs/archive/`
- ✅ Créé une structure organisée par catégories
- ✅ Nouveau README.md propre et professionnel
- ✅ Préservation complète de l'historique Git

## 📊 Statistiques
- Fichiers archivés : 120+
- Catégories créées : 7
- Commits atomiques : 8
- Lignes de documentation : 500+

## ✅ Checklist
- [x] Tous les fichiers sont archivés
- [x] L'historique Git est préservé
- [x] Le design system n'est pas touché
- [x] Documentation mise à jour
- [x] Tests passent

## 📝 Notes
- Aucun fichier supprimé, tout est archivé
- Structure `/packages/ui/` intacte
- Prêt pour merge après review
```

## 📂 Structure Finale

Après l'archivage, la structure sera :
```
/
├── apps/               # Applications
├── packages/           # Packages (ui intact)
├── docs/
│   ├── archive/       # Tous les anciens .md
│   │   ├── context/   # 14 fichiers
│   │   ├── sessions/  # 12 fichiers
│   │   ├── dashboard/ # 14 fichiers
│   │   ├── reports/   # 18 fichiers
│   │   ├── guides/    # 12 fichiers
│   │   ├── migrations/# 9 fichiers
│   │   └── misc/      # 40+ fichiers
│   ├── current/       # Documentation active
│   └── api/          # Documentation API
├── scripts/           # Scripts utilitaires
└── README.md         # Nouveau README propre
```

## ⚠️ Points d'Attention

1. **NE PAS toucher** à `/packages/ui/` - Design system complet
2. **Vérifier** que tous les fichiers sont bien déplacés
3. **Tester** que l'application fonctionne toujours
4. **Documenter** tout changement supplémentaire

## 🆘 En Cas de Problème

Si le script échoue :
1. Vérifier les permissions : `ls -la`
2. Vérifier Git : `git status`
3. Annuler si nécessaire : `git reset --hard origin/cleanup-architecture`

## ✅ Validation Finale

Avant de créer la PR, vérifier :
- [ ] Plus aucun fichier .md à la racine (sauf README.md)
- [ ] Tous les fichiers dans `/docs/archive/`
- [ ] Application démarre correctement
- [ ] Tests passent
- [ ] Documentation à jour

---
*Document créé le 23 Août 2025 pour le nettoyage d'architecture*
