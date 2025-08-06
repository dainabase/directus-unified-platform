# Architecture Frontend React

## Vue d'ensemble

L'architecture frontend suit une approche modulaire avec 4 portails distincts partageant des composants communs.

## Structure des Fichiers

```
src/
├── App.jsx                 # Routeur principal et logique de sélection de portail
├── main.jsx               # Point d'entrée React avec configuration
├── index.css              # Styles globaux et variables CSS
├── portals/               # 4 portails distincts
│   ├── superadmin/        # Dashboard CEO
│   │   ├── Dashboard.jsx  # Architecture validée 3 colonnes + KPIs
│   │   ├── dashboard.css  # Styles spécifiques incluant timeline
│   │   └── Layout.jsx     # Layout avec sidebar SuperAdmin
│   ├── client/            # Portail clients
│   │   ├── Dashboard.jsx  # Dashboard client avec projets
│   │   └── Layout.jsx     # Layout client
│   ├── prestataire/       # Portail prestataires
│   │   ├── Dashboard.jsx  # Dashboard missions et timesheet
│   │   └── Layout.jsx     # Layout prestataire
│   └── revendeur/         # Portail revendeurs
│       ├── Dashboard.jsx  # Dashboard ventes et commissions
│       └── Layout.jsx     # Layout revendeur
├── components/            # Composants partagés
│   └── layout/           
│       └── Sidebar.jsx    # Sidebar réutilisable
├── services/              # Services API et utilitaires
└── hooks/                 # Custom React hooks
```

## Architecture du Dashboard SuperAdmin

### Layout Principal
```
┌─────────────────────────────────────────────────────────┐
│                    Header avec Sélecteur                 │
├─────────────────────────────────────────────────────────┤
│              Bloc Tâches Importantes (Rouge)             │
├─────────────────────────────────────────┬───────────────┤
│                                         │               │
│          3 Colonnes Principales         │   5 KPIs CEO  │
│                                         │   (Verticale) │
│  ┌────────┬────────┬────────┐         │               │
│  │ Opéra. │ Commer.│Finance │         │  ┌─────────┐  │
│  │ (Cyan) │ (Vert) │ (Bleu) │         │  │Runway   │  │
│  └────────┴────────┴────────┘         │  ├─────────┤  │
│                                         │  │ARR/MRR  │  │
├─────────────────────────────────────────┤  ├─────────┤  │
│         4 Sections Détaillées           │  │EBITDA   │  │
│  ┌──────┬──────┬──────┬──────┐        │  ├─────────┤  │
│  │Revenu│Client│Activ.│Tâches│        │  │LTV:CAC  │  │
│  └──────┴──────┴──────┴──────┘        │  ├─────────┤  │
│                                         │  │NPS      │  │
│                                         │  └─────────┘  │
└─────────────────────────────────────────┴───────────────┘
```

### Composants Principaux

#### 1. TasksAlertBlock
- Position: Haut de page
- Style: Bordure gauche rouge 4px
- Contenu: 4 tâches urgentes en grille

#### 2. Colonnes Thématiques (3)
- **OperationalColumn** (bg-info/cyan)
  - Tâches du jour
  - Projets actifs
  - Tickets support
  - Bugs en cours
  
- **CommercialColumn** (bg-success/vert)
  - Pipeline total
  - Devis en cours
  - Taux conversion
  - Nouveaux leads

- **FinanceColumn** (bg-primary/bleu)
  - Cash disponible
  - Factures impayées
  - CA du mois
  - Marge brute

#### 3. CEOMetricsColumn (Droite)
- 5 KPIs stratégiques
- Mini sparklines intégrées
- Badges de statut
- Tendances visuelles

#### 4. Sections du Bas
- **RevenueChart**: BarChart Recharts
- **TopClients**: Tableau avec badges
- **RecentActivity**: Timeline custom CSS
- **RecentTasks**: Liste avec priorités

## Patterns de Code

### State Management
```jsx
const [selectedCompany, setSelectedCompany] = useState('all');
```

### Composants Fonctionnels
```jsx
const ComponentName = () => {
  // Logic here
  return <jsx />
}
```

### Props Drilling Minimal
- Utilisation de composants autonomes
- State local quand possible

## Intégration Recharts

### Types de Graphiques
1. **BarChart**: Revenus mensuels
2. **LineChart**: Sparklines KPIs
3. **ResponsiveContainer**: Adaptation automatique

### Configuration Type
```jsx
<ResponsiveContainer width="100%" height={200}>
  <BarChart data={data}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="month" />
    <YAxis />
    <Tooltip />
    <Bar dataKey="revenue" fill="#206bc4" />
  </BarChart>
</ResponsiveContainer>
```

## Styles et CSS

### Architecture CSS
1. **index.css**: Variables globales et reset
2. **dashboard.css**: Styles spécifiques portails
3. **Inline styles**: Pour cas spéciaux uniquement

### Variables CSS Principales
```css
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafb;
  --text-primary: #111827;
  --border-color: #e5e7eb;
}
```

### Classes Tabler Utilisées
- Grid: `row`, `col-lg-*`, `g-3`
- Cards: `card`, `card-header`, `card-body`
- Colors: `bg-info`, `bg-success`, `bg-primary`
- Utilities: `d-flex`, `align-items-center`

## Performance

### Optimisations Appliquées
1. **Lazy Loading**: Portails chargés à la demande
2. **Memoization**: Pour éviter re-renders
3. **Keys Uniques**: Dans toutes les listes
4. **CSS Modules**: Isolation des styles

### Build Configuration
```javascript
// vite.config.js
{
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'recharts': ['recharts'],
          'tabler-icons': ['@tabler/icons-react']
        }
      }
    }
  }
}
```

## Sécurité

### Mesures Implémentées
1. **XSS Protection**: React escape par défaut
2. **CORS**: Configuration dans Vite proxy
3. **ENV Variables**: Pour tokens API
4. **Input Validation**: Sur tous les formulaires

## Accessibilité

### Standards Suivis
- ARIA labels sur éléments interactifs
- Contraste couleurs WCAG AA
- Navigation clavier
- Alt text sur images

## Tests

### Structure Recommandée
```
__tests__/
├── portals/
│   ├── superadmin/
│   │   └── Dashboard.test.jsx
│   └── client/
│       └── Dashboard.test.jsx
└── components/
    └── layout/
        └── Sidebar.test.jsx
```

### Couverture Cible
- Composants: 80%
- Services: 90%
- Utils: 100%

## Déploiement

### Build Process
1. `npm run build`
2. Output dans `dist/`
3. Servir avec nginx/apache
4. Configuration proxy pour API

### Variables d'Environnement
```env
VITE_API_URL=https://api.production.com
VITE_API_TOKEN=production-token
VITE_SENTRY_DSN=sentry-url
```

## Maintenance

### Checklist Mise à Jour
- [ ] Mettre à jour dépendances
- [ ] Vérifier breaking changes
- [ ] Tester tous les portails
- [ ] Valider responsive
- [ ] Performance audit

### Monitoring
- Sentry pour erreurs
- Analytics pour usage
- Performance metrics
- User feedback

## Évolutions Futures

### Court Terme
- [ ] Mode sombre
- [ ] Export PDF dashboards
- [ ] Notifications push
- [ ] Filtres avancés

### Long Terme
- [ ] PWA support
- [ ] Offline mode
- [ ] Real-time updates
- [ ] Mobile app native