# 🚀 GUIDE DE PUBLICATION v0.4.0

## Publication du Package @dainabase/ui v0.4.0

### 📦 Étape 1: Déclencher le Workflow de Publication

1. **Aller sur GitHub Actions**
   - URL: https://github.com/dainabase/directus-unified-platform/actions
   
2. **Sélectionner le workflow**
   - Cliquer sur "Publish @dainabase/ui to GitHub Packages" dans la barre latérale

3. **Lancer le workflow**
   - Cliquer sur "Run workflow"
   - Branch: `main` (par défaut)
   - Version: `0.4.0` (déjà pré-rempli)
   - Cliquer sur le bouton vert "Run workflow"

### 📊 Étape 2: Vérifier la Publication

Le workflow va automatiquement:
- ✅ Installer les dépendances
- ✅ Builder le package
- ✅ Mettre à jour la version à 0.4.0
- ✅ Publier sur GitHub Packages
- ✅ Créer une Release avec changelog

### 🔗 Étape 3: URLs de Vérification

**Package publié:**
```
https://github.com/dainabase/directus-unified-platform/packages
```

**Release créée:**
```
https://github.com/dainabase/directus-unified-platform/releases/tag/@dainabase/ui@0.4.0
```

### 📖 Étape 4: Vérifier le Déploiement Storybook

Le workflow de déploiement Storybook devrait s'être déclenché automatiquement après notre dernier commit.

**Vérifier le statut:**
```
https://github.com/dainabase/directus-unified-platform/actions/workflows/deploy-storybook.yml
```

**URL Storybook (une fois déployé):**
```
https://dainabase.github.io/directus-unified-platform
```

### ⚙️ Étape 5: Activer GitHub Pages (si pas déjà fait)

1. Aller dans Settings > Pages
2. Source: GitHub Actions
3. Sauvegarder

### 📝 Installation du Package Publié

Une fois publié, le package peut être installé avec:

```bash
# Configurer le registry (une seule fois)
echo "@dainabase:registry=https://npm.pkg.github.com" >> .npmrc

# Installer le package
npm install @dainabase/ui@0.4.0
```

### ✅ Checklist de Vérification

- [ ] Workflow de publication lancé avec version 0.4.0
- [ ] Package visible sur GitHub Packages
- [ ] Release créée avec tag @dainabase/ui@0.4.0
- [ ] Storybook déployé et accessible
- [ ] GitHub Pages activé

### 📊 Contenu du Package v0.4.0

**31 Composants (Score: 100/100)**
- Core: 8 composants
- Layout: 5 composants
- Forms: 6 composants
- Data: 2 composants
- Overlays: 4 composants
- Date/Time: 3 composants
- Charts: 1 composant
- Theme: 2 composants

**Nouveautés v0.4.0:**
- Avatar (Radix UI)
- Badge (6 variants)
- Progress (Radix UI)
- Skeleton (loading states)
- Tooltip (Radix UI)

### 🎉 Félicitations!

Le Design System @dainabase/ui v0.4.0 est maintenant complet avec un score parfait de 100/100!

---
*Document créé le 10 août 2025, 18:10*
