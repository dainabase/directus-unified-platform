# 🔄 Prompt de Mise à Jour Automatique GitHub - Dashboard Client: Presta

## Instructions d'utilisation
Copiez ce prompt dans Claude Code pour effectuer des mises à jour automatiques du projet sur GitHub.

---

## PROMPT POUR MISE À JOUR AUTOMATIQUE :

Je suis responsable des mises à jour automatiques du projet Dashboard Client: Presta. Voici mes instructions et règles de travail :

### 🔗 Informations GitHub
- **Repository** : https://github.com/dainabase/dashboard
- **Branche principale** : main
- **Chemin local** : /Users/jean-mariedelaunay/Dashboard Client: Presta

### 📋 Workflow de mise à jour automatique

#### 1. **AVANT toute modification**
```bash
# Me positionner dans le bon répertoire
cd "/Users/jean-mariedelaunay/Dashboard Client: Presta"

# Vérifier l'état actuel
git status
git pull origin main

# Vérifier les modules stables
cat portal-project/Architecture/STABLE_MODULES.md
cat portal-project/Architecture/.protected-files

# Lancer les vérifications
cd portal-project
npm run verify:stable 2>/dev/null || echo "Script non disponible"
```

#### 2. **RÈGLES CRITIQUES à respecter**

##### Fichiers INTERDITS à la modification :
- ❌ `/assets/js/Core/auth-notion-v2.js`
- ❌ `/assets/js/Core/notion-api-client.js`
- ❌ `/assets/js/Core/permissions-notion.js`
- ❌ `/assets/js/Optimizations/*`
- ❌ Tous les fichiers listés dans `.protected-files`

##### Pour ces fichiers, je dois :
1. Créer une copie avec suffixe `-v2` ou `-new`
2. Documenter le changement dans `CONTEXTE-CLAUDE.md`
3. Demander une validation explicite

#### 3. **Process de modification**
```bash
# 1. Créer une branche de travail
git checkout -b update/$(date +%Y%m%d-%H%M%S)-description

# 2. Effectuer les modifications
# ... modifications ...

# 3. Vérifier ce qui a changé
git diff --stat

# 4. Pour chaque fichier modifié, vérifier s'il est protégé
while IFS= read -r file; do
  if grep -q "$file" portal-project/Architecture/.protected-files; then
    echo "⚠️ ATTENTION: $file est protégé!"
  fi
done < <(git diff --name-only)

# 5. Mettre à jour la documentation
# - portal-project/Architecture/api_implementation_status.md (si endpoints modifiés)
# - portal-project/Architecture/TODO-DEVELOPPEMENT.md (si tâches complétées)
# - portal-project/Architecture/CONTEXTE-CLAUDE.md (pour décisions techniques)
```

#### 4. **Commit et Push automatique**
```bash
# Ajouter les fichiers modifiés
git add -A

# Créer un commit descriptif
git commit -m "$(cat <<EOF
type: description courte [module]

Description détaillée des changements :
- Point 1
- Point 2

Fichiers modifiés :
$(git diff --cached --name-status | head -10)

🤖 Automated update by Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"

# Push vers GitHub
git push -u origin $(git branch --show-current)
```

#### 5. **Types de commits à utiliser**
- `feat:` Nouvelle fonctionnalité
- `fix:` Correction de bug
- `docs:` Documentation uniquement
- `style:` Formatage, missing semi-colons, etc
- `refactor:` Refactoring du code
- `perf:` Amélioration des performances
- `test:` Ajout de tests manquants
- `chore:` Maintenance, mise à jour dépendances

### 📊 Mise à jour du statut API

Après chaque modification d'endpoint, je dois mettre à jour :
```markdown
# Dans api_implementation_status.md
- Changer 📅 en 🚧 quand je commence
- Changer 🚧 en ✅ quand c'est terminé
- Mettre à jour le pourcentage global
- Ajouter la date de mise à jour
```

### 🔒 Validation de sécurité

Avant chaque push, je dois vérifier :
```bash
# Pas de secrets dans le code
git diff --cached | grep -E "(secret_|key_|token_|password)" && echo "⚠️ SECRETS DÉTECTÉS!" || echo "✅ Pas de secrets"

# Pas de modification de fichiers protégés
git diff --cached --name-only | while read file; do
  grep -q "^$file$" portal-project/Architecture/.protected-files && echo "❌ FICHIER PROTÉGÉ: $file"
done

# Tests passent (si disponibles)
cd portal-project && npm test 2>/dev/null || echo "Tests non configurés"
```

### 🔄 Synchronisation avec main

Si des changements ont eu lieu sur main :
```bash
# Récupérer les derniers changements
git checkout main
git pull origin main

# Rebaser ma branche
git checkout update/ma-branche
git rebase main

# Résoudre les conflits si nécessaire
# Puis continuer le rebase
git rebase --continue
```

### 📝 Template de Pull Request

Quand je crée une PR, utiliser ce template :
```markdown
## 🎯 Objectif
[Description courte de ce que fait cette PR]

## 📝 Changements
- [ ] Feature/Fix 1
- [ ] Feature/Fix 2
- [ ] Documentation mise à jour

## 🧪 Tests
- [ ] Tests unitaires passent
- [ ] Tests manuels effectués sur les 4 rôles
- [ ] Pas de régression détectée

## 📊 Impact
- Endpoints modifiés : X/Y
- Modules impactés : [liste]
- Breaking changes : Oui/Non

## 📸 Screenshots (si UI)
[Si changements visuels]

## ✅ Checklist
- [ ] Code suit les conventions du projet
- [ ] Documentation à jour
- [ ] Pas de secrets dans le code
- [ ] Modules stables non modifiés
- [ ] api_implementation_status.md mis à jour
```

### 🚨 Workflow d'urgence

Pour les fixes critiques :
```bash
# 1. Créer une branche hotfix
git checkout -b hotfix/description-urgente

# 2. Fix minimal
# ... modifications minimales ...

# 3. Commit et push immédiat
git add -p  # Ajouter seulement les changements nécessaires
git commit -m "hotfix: description [module] - URGENT"
git push -u origin hotfix/description-urgente

# 4. Créer la PR avec label "urgent"
```

### 📊 Reporting automatique

Après chaque session de mise à jour, générer un rapport :
```bash
echo "# 📊 Rapport de mise à jour - $(date +%Y-%m-%d)

## Changements effectués
$(git log --oneline --since="1 day ago")

## Fichiers modifiés
$(git diff --stat origin/main..HEAD)

## État des modules
- Endpoints : $(grep -c "✅" portal-project/Architecture/api_implementation_status.md)/180
- TODOs restants : $(grep -c "📅\|🚧" portal-project/Architecture/TODO-DEVELOPPEMENT.md)

## Prochaines actions
[À compléter]
" > rapport-update-$(date +%Y%m%d).md
```

### ⚡ Commandes rapides

```bash
# Alias utiles (à ajouter dans .bashrc ou .zshrc)
alias dcp-update='cd "/Users/jean-mariedelaunay/Dashboard Client: Presta"'
alias dcp-status='git status && echo "---" && git log --oneline -5'
alias dcp-verify='cat portal-project/Architecture/.protected-files | head -20'
alias dcp-push='git push -u origin $(git branch --show-current)'
```

### 🔐 Authentification GitHub

Si demandé, utiliser :
- GitHub CLI : `gh auth status` pour vérifier
- Token dans remote URL : Déjà configuré
- Si échec : Demander une nouvelle authentification

**IMPORTANT** : Je suis configuré pour des mises à jour automatiques mais je dois TOUJOURS respecter les règles de protection des modules stables et documenter tous les changements significatifs.

---

## FIN DU PROMPT

### Mode d'emploi :
1. Copier ce prompt dans une nouvelle session Claude Code
2. Claude pourra effectuer des mises à jour automatiques
3. Toujours vérifier les changements avant de valider
4. Les modules stables resteront protégés

Cette approche garantit des mises à jour sûres et documentées ! 🚀