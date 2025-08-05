# 🎯 Dashboard SuperAdmin V2 - Documentation

## 📋 Vue d'ensemble

Le Dashboard SuperAdmin V2 est une interface exécutive professionnelle conçue pour gérer et monitorer les 5 entreprises du groupe en temps réel.

## 🚀 Caractéristiques principales

### Design et UX
- **Interface moderne** : Design épuré avec fond clair professionnel
- **Responsive** : Adapté mobile, tablette et desktop
- **Navigation intuitive** : Sidebar collapsible avec accès rapide
- **KPIs visuels** : Cartes colorées pour identification rapide

### Fonctionnalités
- **Vue consolidée** : Dashboard unifié des 5 entreprises
- **Métriques temps réel** : CA, croissance, trésorerie, objectifs
- **Performances visuelles** : Barres de progression par entreprise
- **Système d'alertes** : Notifications actionnables
- **Filtres dynamiques** : Sélection par entreprise et période

## 🏗️ Architecture technique

### Structure des fichiers
```
superadmin-v2/
├── index.html              # Page principale du dashboard
├── css/
│   ├── variables.css       # Variables du design system
│   ├── main.css           # Styles principaux
│   └── responsive.css     # Media queries responsive
├── js/
│   ├── app.js            # Application principale (ES6 modules)
│   ├── app-combined.js   # Version combinée (sans modules)
│   ├── api.js            # Gestion des appels API
│   ├── charts.js         # Gestion des graphiques
│   └── utils.js          # Fonctions utilitaires
└── components/           # Composants réutilisables (futur)
```

### Technologies utilisées
- **HTML5** : Structure sémantique moderne
- **CSS3** : Variables CSS, Grid, Flexbox
- **JavaScript ES6** : Classes, modules, async/await
- **Lucide Icons** : Icônes vectorielles légères
- **Inter Font** : Police professionnelle

## 📊 KPIs affichés

1. **CA Total** (Bleu primary)
   - Chiffre d'affaires consolidé
   - Évolution vs mois précédent

2. **Croissance** (Vert success)
   - Taux de croissance annuel
   - Comparaison année précédente

3. **Trésorerie** (Orange warning)
   - Liquidités disponibles
   - Nombre de mois de runway

4. **Objectif Annuel** (Bleu info)
   - Progression vers l'objectif
   - Barre de progression visuelle

## 🏢 Entreprises monitorées

| Entreprise | Icône | Secteur |
|------------|-------|---------|
| HyperVisual | 📹 | Production vidéo |
| Dynamics | 💡 | Innovation |
| Lexia | 🗣️ | Communication |
| NKReality | 🏠 | Immobilier |
| Etekout | 🛒 | E-commerce |

## 🔧 Configuration

### Variables CSS personnalisables
```css
/* Couleurs principales */
--color-primary: #6366F1;
--color-success: #10B981;
--color-warning: #F59E0B;
--color-danger: #EF4444;

/* Espacements */
--spacing-sm: 0.75rem;
--spacing-md: 1rem;
--spacing-lg: 1.5rem;
```

### Configuration API
```javascript
// Dans api.js
this.baseURL = 'http://localhost:3000/api';
this.token = localStorage.getItem('auth_token');
```

## 📱 Responsive Design

### Breakpoints
- **Desktop** : > 1024px (grille complète)
- **Tablet** : 768px - 1024px (2 colonnes KPI)
- **Mobile** : < 768px (1 colonne, sidebar overlay)

## 🚦 Utilisation

### Accès direct
```bash
# Ouvrir dans le navigateur
file:///[chemin]/directus-unified-platform/src/frontend/portals/superadmin-v2/index.html
```

### Avec serveur local
```bash
# Python
python3 -m http.server 8000

# Node.js
npx http-server -p 8000

# Puis accéder à
http://localhost:8000/src/frontend/portals/superadmin-v2/
```

## 🔄 Données temps réel

Le dashboard se met à jour automatiquement toutes les 30 secondes. Les données peuvent être :
- **Mock** : Données simulées (mode actuel)
- **API** : Connexion à l'API backend (à implémenter)

## 🎨 Personnalisation

### Ajouter une nouvelle métrique
1. Ajouter la carte KPI dans `index.html`
2. Définir les styles dans `main.css`
3. Mettre à jour les données dans `app.js`

### Modifier les couleurs
Éditer les variables dans `css/variables.css`

### Ajouter une entreprise
1. Ajouter dans le sélecteur (index.html)
2. Ajouter dans les données mock (api.js)
3. Créer l'item de performance

## 🐛 Dépannage

### Page noire ou vide
- Vérifier que les fichiers CSS sont chargés
- Utiliser `debug.html` pour tester
- Ouvrir avec `file://` au lieu de `http://`

### JavaScript non exécuté
- Vérifier la console du navigateur
- Utiliser `app-combined.js` au lieu des modules ES6
- Vérifier que Lucide est chargé

## 📈 Évolutions futures

- [ ] Intégration Chart.js pour graphiques
- [ ] Connexion API backend réelle
- [ ] Export des données (CSV/PDF)
- [ ] Mode sombre
- [ ] Notifications push
- [ ] Drill-down par entreprise
- [ ] Historique des métriques
- [ ] Tableaux de bord personnalisables

## 🔒 Sécurité

- Token d'authentification stocké dans localStorage
- HTTPS requis en production
- Validation des données côté client et serveur
- Sanitization des entrées utilisateur

## 📝 Maintenance

### Logs et monitoring
```javascript
// Activer les logs de debug
console.log('Dashboard chargé:', new Date());
```

### Performance
- Lazy loading des composants
- Debounce sur les mises à jour
- Cache des données API

## 👥 Contribution

Pour contribuer au projet :
1. Fork le repository
2. Créer une branche feature
3. Commiter les changements
4. Pousser la branche
5. Créer une Pull Request

## 📄 Licence

Propriétaire - Tous droits réservés

---

*Dashboard SuperAdmin V2 - Créé avec ❤️ pour une gestion d'entreprise efficace*