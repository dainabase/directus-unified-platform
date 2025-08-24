# 🤝 Guide de Contribution

Merci de votre intérêt pour contribuer à Directus Unified Platform ! Ce guide vous aidera à contribuer efficacement au projet.

## 📋 Table des Matières

- [Code de Conduite](#code-de-conduite)
- [Comment Contribuer](#comment-contribuer)
- [Workflow de Développement](#workflow-de-développement)
- [Standards de Code](#standards-de-code)
- [Processus de Review](#processus-de-review)

## 📜 Code de Conduite

Nous nous engageons à fournir un environnement accueillant et inclusif. Veuillez lire notre [Code de Conduite](CODE_OF_CONDUCT.md) avant de contribuer.

## 🚀 Comment Contribuer

### 1. Fork et Clone

```bash
# Fork le projet sur GitHub
# Puis clone votre fork
git clone https://github.com/YOUR_USERNAME/directus-unified-platform.git
cd directus-unified-platform

# Ajouter le repo original comme upstream
git remote add upstream https://github.com/dainabase/directus-unified-platform.git
```

### 2. Créer une Branche

```bash
# Toujours partir de main à jour
git checkout main
git pull upstream main

# Créer une branche descriptive
git checkout -b feature/amazing-feature
# ou
git checkout -b fix/bug-description
```

### 3. Développer

```bash
# Frontend React
cd src/frontend
npm install
npm run dev

# Backend Directus
docker-compose up -d
```

### 4. Tester

```bash
# Lancer les tests
npm run test

# Vérifier le linting
npm run lint

# Build de production
npm run build
```

### 5. Commit

Nous suivons [Conventional Commits](https://www.conventionalcommits.org/) :

```bash
# Format
<type>(<scope>): <subject>

# Exemples
feat(dashboard): add new KPI widget
fix(auth): resolve login timeout issue
docs(readme): update installation steps
style(sidebar): improve mobile responsiveness
refactor(api): optimize database queries
test(dashboard): add unit tests for metrics
chore(deps): update React to 18.2.0
```

Types acceptés :
- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `docs`: Documentation
- `style`: Formatage, CSS (pas de changement de code)
- `refactor`: Refactoring de code
- `test`: Ajout de tests
- `chore`: Maintenance, dépendances

### 6. Push et Pull Request

```bash
# Push sur votre fork
git push origin feature/amazing-feature
```

Puis créez une Pull Request sur GitHub avec :
- Titre descriptif
- Description détaillée des changements
- Screenshots si UI
- Référence aux issues liées

## 💻 Workflow de Développement

### Structure des Branches

```
main
  └── feature/new-feature
  └── fix/bug-fix
  └── docs/update-docs
  └── refactor/code-improvement
```

### Environnements

- **Development** : http://localhost:3000
- **Staging** : https://staging.directus-platform.com
- **Production** : https://app.directus-platform.com

## 📐 Standards de Code

### React/JavaScript

```javascript
// ✅ Bon
import React from 'react'
import { LineChart } from 'recharts'

const Dashboard = ({ data }) => {
  const [metrics, setMetrics] = useState([])
  
  useEffect(() => {
    fetchMetrics()
  }, [])
  
  return (
    <div className="dashboard">
      <LineChart data={metrics} />
    </div>
  )
}

export default Dashboard
```

### CSS/Styling

```css
/* ✅ Utiliser les variables CSS */
.dashboard {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
}

/* ❌ Éviter les valeurs hardcodées */
.dashboard {
  background: #ffffff;
  border: 1px solid #e5e7eb;
}
```

### Composants

- Un composant par fichier
- Props typées avec PropTypes ou TypeScript
- Hooks personnalisés dans `/hooks`
- Composants réutilisables dans `/components`

## 🔍 Processus de Review

### Checklist PR

- [ ] Code testé localement
- [ ] Tests ajoutés/mis à jour
- [ ] Documentation mise à jour
- [ ] Pas de console.log
- [ ] Pas de code commenté
- [ ] Responsive design vérifié
- [ ] Performance optimisée

### Review Automatique

- ESLint pour le code style
- Prettier pour le formatage
- Tests automatiques via GitHub Actions
- Build de vérification

### Review Manuelle

1. **Code Review** : Qualité, lisibilité, performance
2. **Functional Review** : Test des fonctionnalités
3. **UX Review** : Expérience utilisateur
4. **Security Review** : Pas de failles

## 📦 Dépendances

### Ajouter une Dépendance

```bash
# Production
npm install package-name

# Development
npm install -D package-name
```

Justifier l'ajout dans la PR :
- Pourquoi cette lib ?
- Taille du bundle
- Alternatives considérées
- Maintenance active

## 🐛 Reporter des Bugs

### Template d'Issue

```markdown
## Description
Brève description du bug

## Étapes pour Reproduire
1. Aller sur '...'
2. Cliquer sur '...'
3. Voir l'erreur

## Comportement Attendu
Ce qui devrait se passer

## Comportement Actuel
Ce qui se passe actuellement

## Screenshots
Si applicable

## Environnement
- OS: [e.g. macOS 12.0]
- Browser: [e.g. Chrome 96]
- Version: [e.g. 2.0.0]
```

## 🎯 Domaines de Contribution

### Frontend (React)
- Nouveaux composants dashboard
- Amélioration UX/UI
- Optimisation performance
- Tests unitaires/E2E
- Accessibilité

### Backend (Directus)
- Extensions custom
- Hooks et filtres
- Optimisation queries
- Sécurité API
- Documentation API

### DevOps
- CI/CD pipelines
- Docker optimisation
- Monitoring
- Backup strategies
- Deployment scripts

### Documentation
- Guides utilisateur
- Tutoriels vidéo
- API documentation
- Architecture diagrams
- Traductions

## 🎉 Reconnaissance

Tous les contributeurs sont ajoutés à :
- [CONTRIBUTORS.md](CONTRIBUTORS.md)
- Section "Contributors" du README
- Remerciements dans les release notes

## 📞 Contact

- **Discord** : [#dev-discussion](https://discord.gg/dainamics)
- **Email** : dev@dainamics.ch
- **GitHub Issues** : Pour les questions techniques

---

Merci de contribuer à Directus Unified Platform ! 🚀