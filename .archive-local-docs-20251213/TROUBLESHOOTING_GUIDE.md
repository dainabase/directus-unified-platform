# 🔧 Guide de Dépannage - Directus Unified Platform

## 🚨 Problèmes Fréquents et Solutions

### 1. Page Blanche au Démarrage

#### Symptômes
- Le serveur Vite démarre sans erreur
- La page est complètement blanche
- Aucun contenu React ne s'affiche

#### Causes Possibles
1. **Import de module manquant**
   ```javascript
   // ❌ Mauvais
   import { Toaster } from 'react-hot-toast' // Module non installé
   
   // ✅ Bon
   // Supprimer l'import ou installer le module
   ```

2. **Erreur dans App.jsx**
   - Vérifier la console du navigateur (F12)
   - Chercher les erreurs de syntaxe

3. **CSS qui cache le contenu**
   - Inspecter les éléments
   - Vérifier les `display: none` ou `visibility: hidden`

#### Solutions
```bash
# 1. Nettoyer et réinstaller
rm -rf node_modules package-lock.json .vite
npm install

# 2. Vérifier le serveur
curl http://localhost:5173

# 3. Simplifier App.jsx temporairement
```

### 2. Layout Cassé (Header/Sidebar)

#### Symptômes
- Header et sidebar se chevauchent
- Contenu caché derrière le header
- Sidebar qui ne s'affiche pas

#### Structure Correcte
```jsx
<div className="page">
  {/* Header DOIT être fixed */}
  <header style={{ 
    position: 'fixed', 
    top: 0, 
    left: 0, 
    right: 0,
    height: '56px',
    zIndex: 1000 
  }}>
  
  {/* Wrapper DOIT avoir paddingTop */}
  <div className="page-wrapper" style={{ paddingTop: '56px' }}>
    
    {/* Sidebar DOIT commencer après header */}
    <aside style={{ 
      position: 'fixed',
      top: '56px',
      left: 0,
      bottom: 0,
      width: '250px'
    }}>
    
    {/* Main DOIT avoir marginLeft */}
    <div className="page-main" style={{ 
      marginLeft: '250px' 
    }}>
```

### 3. Port Déjà Utilisé

#### Erreur
```
Port 5173 is in use, trying another one...
```

#### Solutions
```bash
# Option 1: Tuer le processus
pkill -f "node.*vite"

# Option 2: Utiliser un autre port
npm run dev -- --port 3000

# Option 3: Trouver et tuer le processus spécifique
lsof -i :5173
kill -9 [PID]
```

### 4. Modules Non Trouvés

#### Erreur
```
Module not found: Can't resolve 'recharts'
```

#### Solution
```bash
# Installer les dépendances manquantes
npm install recharts @tabler/icons-react lodash

# Vérifier package.json
cat package.json | grep dependencies -A 10
```

### 5. Composants Qui Ne S'Affichent Pas

#### Checklist de Diagnostic

1. **Vérifier les imports**
   ```javascript
   // ✅ Bon
   import Dashboard from './portals/superadmin/Dashboard'
   
   // ❌ Mauvais
   import Dashboard from './portals/superadmin/Dashboard.jsx'
   ```

2. **Vérifier l'export**
   ```javascript
   // Fin du fichier Dashboard.jsx
   export default Dashboard // OBLIGATOIRE
   ```

3. **Vérifier le rendu conditionnel**
   ```javascript
   // Débugger avec console.log
   console.log('Current portal:', currentPortal)
   console.log('Dashboard component:', CurrentDashboard)
   ```

### 6. Styles CSS Non Appliqués

#### Causes
1. Import CSS manquant dans main.jsx
2. Ordre des imports incorrect
3. Classes CSS avec typos

#### Solution
```javascript
// main.jsx - Ordre correct
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css' // IMPORTANT: Doit être importé
```

### 7. Erreurs Recharts

#### Symptômes
- Graphiques qui ne s'affichent pas
- Erreur "ResponsiveContainer expects width/height"

#### Solution
```jsx
// ✅ Structure correcte
<ResponsiveContainer width="100%" height={300}>
  <BarChart data={data}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="name" />
    <YAxis />
    <Tooltip />
    <Bar dataKey="value" fill="#206bc4" />
  </BarChart>
</ResponsiveContainer>
```

### 8. Dropdown Bootstrap Non Fonctionnel

#### Symptôme
- Les dropdowns ne s'ouvrent pas au clic

#### Solution
```html
<!-- Vérifier dans index.html -->
<script src="https://cdn.jsdelivr.net/npm/@tabler/core@1.0.0-beta20/dist/js/tabler.min.js"></script>
```

## 🛠️ Commandes de Diagnostic

### Vérifications Système
```bash
# Version Node
node --version  # Doit être >= 16

# Version npm
npm --version  # Doit être >= 8

# Processus en cours
ps aux | grep node

# Ports utilisés
lsof -i :5173
lsof -i :3000
```

### Nettoyage Complet
```bash
# Script de reset total
#!/bin/bash
echo "🧹 Nettoyage complet..."
rm -rf node_modules
rm -rf .vite
rm -rf dist
rm package-lock.json
echo "📦 Réinstallation..."
npm install
echo "✅ Terminé!"
```

### Tests Rapides
```bash
# Test du build
npm run build

# Test du serveur preview
npm run preview

# Analyse des dépendances
npm ls
```

## 📋 Checklist de Débogage

### Niveau 1 - Basique
- [ ] Console du navigateur sans erreur?
- [ ] Serveur Vite démarre correctement?
- [ ] URL correcte (http://localhost:5173)?
- [ ] Network tab montre les fichiers chargés?

### Niveau 2 - Structure
- [ ] App.jsx existe et exporte un composant?
- [ ] main.jsx monte l'app sur #root?
- [ ] index.html contient div#root?
- [ ] Tous les imports sont corrects?

### Niveau 3 - Dépendances
- [ ] node_modules existe?
- [ ] package.json contient toutes les deps?
- [ ] Pas de conflit de versions?
- [ ] Vite config correcte?

## 🔍 Outils de Debug

### Extension Browser
- React Developer Tools
- Redux DevTools (si utilisé)

### VS Code Extensions
- ES7+ React/Redux/React-Native snippets
- ESLint
- Prettier

### Commandes Utiles
```javascript
// Dans le code - Debug temporaire
console.log('Component mounted:', this)
console.log('Props:', props)
console.log('State:', state)

// React DevTools Console
$r // Component sélectionné
$r.props // Props du component
$r.state // State du component
```

## 💡 Bonnes Pratiques

### 1. Toujours commencer simple
```javascript
// Tester avec un composant minimal
function App() {
  return <h1>Test OK</h1>
}
```

### 2. Ajouter progressivement
- D'abord le HTML basique
- Puis les styles
- Puis la logique
- Enfin les dépendances externes

### 3. Sauvegarder les versions qui marchent
```bash
git add .
git commit -m "fix: Version fonctionnelle basique"
```

### 4. Documenter les erreurs
- Screenshot de l'erreur
- Code exact qui cause le problème
- Solution appliquée

## 🆘 Quand Demander de l'Aide

### Informations à Fournir
1. **Message d'erreur exact** (console)
2. **Code concerné** (avec numéros de ligne)
3. **Ce qui a été essayé** (liste des tentatives)
4. **Environnement** (OS, Node version, etc.)
5. **Dernière version qui fonctionnait**

### Template de Rapport
```markdown
## Problème
[Description courte]

## Erreur
```
[Copier/coller le message d'erreur]
```

## Code
```javascript
// Ligne X de fichier.jsx
[Code problématique]
```

## Tentatives
1. J'ai essayé...
2. J'ai vérifié...
3. J'ai modifié...

## Environnement
- OS: macOS/Windows/Linux
- Node: vX.X.X
- npm: vX.X.X
```

---

**Guide créé le**: 2025-08-06  
**Version**: 1.0.0  
**Maintenu par**: Équipe Dev