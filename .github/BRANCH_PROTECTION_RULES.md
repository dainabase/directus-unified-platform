# 🔒 RÈGLES DE PROTECTION DES BRANCHES - NE JAMAIS IGNORER

## ⚠️ RÈGLES CRITIQUES DE SÉCURITÉ

### 🔴 BRANCHE `main` - PROTÉGÉE
**STATUT ACTUEL**: v0.4.0 - Score 100/100 - 31 composants

#### INTERDICTIONS ABSOLUES sur `main`:
- ❌ **JAMAIS** de push direct
- ❌ **JAMAIS** de force push
- ❌ **JAMAIS** de reset --hard
- ❌ **JAMAIS** de modifications sans PR
- ❌ **JAMAIS** de merge sans review

#### OBLIGATIONS sur `main`:
- ✅ **TOUJOURS** créer une PR pour tout changement
- ✅ **TOUJOURS** faire des tests avant merge
- ✅ **TOUJOURS** documenter les changements
- ✅ **TOUJOURS** vérifier le score avant/après
- ✅ **TOUJOURS** faire un backup avant modifications majeures

### 📋 WORKFLOW SÉCURISÉ OBLIGATOIRE

```bash
# 1. TOUJOURS partir de main à jour
git checkout main
git pull origin main

# 2. TOUJOURS créer une nouvelle branche
git checkout -b feat/[nom-descriptif]

# 3. Faire les modifications

# 4. TOUJOURS vérifier avant commit
git status
git diff

# 5. Commit avec message clair
git add .
git commit -m "type(scope): description claire"

# 6. Push la branche
git push origin feat/[nom-descriptif]

# 7. Créer une PR sur GitHub
# 8. Attendre review et tests
# 9. Merger via GitHub (jamais en local)
```

### 🔐 SYSTÈME DE VÉRIFICATION

Avant CHAQUE session de travail:
1. Vérifier la version actuelle dans `main`
2. Vérifier le nombre de composants
3. Vérifier le score actuel
4. Documenter l'état initial

### 📊 TRACKING DES VERSIONS

| Version | Date | Composants | Score | Vérifié |
|---------|------|------------|-------|---------|
| v0.4.0 | 10/08/2025 | 31 | 100/100 | ✅ |
| v1.0.0 | À venir | 40+ | 5/5 | ⏳ |

### 🚨 PROCÉDURE D'URGENCE

Si une divergence est détectée:
1. **STOP** - Ne rien modifier
2. **ANALYSER** - Comprendre la divergence
3. **DOCUMENTER** - Noter l'état actuel
4. **BACKUP** - Créer des branches de sauvegarde
5. **RÉSOUDRE** - Avec une PR documentée

### 📝 CHECKLIST AVANT MERGE

- [ ] Tests passent à 100%
- [ ] Score maintenu ou amélioré
- [ ] Documentation à jour
- [ ] Changelog mis à jour
- [ ] Version bump si nécessaire
- [ ] Review effectuée
- [ ] Backup créé

### 🎯 RÈGLES D'OR

1. **La branche `main` est SACRÉE**
2. **Aucune perte de travail n'est acceptable**
3. **Toujours documenter les changements**
4. **En cas de doute, créer un backup**
5. **Communiquer avant d'agir**

---
**DERNIÈRE VÉRIFICATION**: 10/08/2025 - v0.4.0 - 100/100 ✅
