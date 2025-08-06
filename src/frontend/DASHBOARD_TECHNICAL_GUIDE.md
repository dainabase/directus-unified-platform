# 🛠️ Guide Technique - Dashboard CEO

## 🎯 Architecture du Code

### Structure du Composant Principal

```jsx
const SuperAdminDashboard = ({ selectedCompany }) => {
  // 1. Données mockées
  const cashFlowData = [...]
  const sparklineData = {...}
  
  // 2. Composant Sparkline
  const Sparkline = ({ data, color }) => (...)
  
  // 3. Rendu JSX
  return (
    <div className="page-body">
      {/* Bloc Alertes */}
      {/* Grille 4 Colonnes */}
    </div>
  )
}
```

## 📊 Système de Données

### Datasets Utilisés

#### 1. Cash Flow (7 jours)
```javascript
const cashFlowData = [
  { day: 'Lun', entrees: 45, sorties: 32 },
  { day: 'Mar', entrees: 52, sorties: 28 },
  { day: 'Mer', entrees: 38, sorties: 35 },
  { day: 'Jeu', entrees: 65, sorties: 40 },
  { day: 'Ven', entrees: 48, sorties: 38 },
  { day: 'Sam', entrees: 25, sorties: 20 },
  { day: 'Dim', entrees: 15, sorties: 12 }
]
```

**Usage**: Graphique AreaChart dans "Trésorerie & Cash"  
**Format**: Array d'objets avec `day`, `entrees`, `sorties`

#### 2. Sparklines KPIs (7 points)
```javascript
const sparklineData = {
  cashRunway: [7.5, 7.4, 7.3, 7.2, 7.3, 7.3, 7.3],
  arr: [2.2, 2.3, 2.3, 2.4, 2.4, 2.4, 2.4],
  ebitda: [17.2, 17.5, 17.8, 18.0, 18.2, 18.5, 18.5],
  ltv: [3.8, 3.9, 4.0, 4.1, 4.1, 4.2, 4.2],
  nps: [68, 69, 70, 71, 71, 72, 72]
}
```

**Usage**: 5 mini-graphiques dans la sidebar KPI  
**Format**: Arrays de nombres (tendance sur 7 jours)

## 🧩 Composants Réutilisables

### Sparkline Component
```jsx
const Sparkline = ({ data, color }) => (
  <ResponsiveContainer width="100%" height={40}>
    <LineChart data={data.map((value, index) => ({ value, index }))}>
      <Line 
        type="monotone" 
        dataKey="value" 
        stroke={color} 
        strokeWidth={2}
        dot={false}
      />
    </LineChart>
  </ResponsiveContainer>
)
```

**Props**:
- `data`: Array de nombres
- `color`: Couleur de la ligne (hex)

**Transformation**: Array simple → Objects avec `{value, index}`

**Usage**:
```jsx
<Sparkline data={sparklineData.cashRunway} color="#f59f00" />
```

## 🎨 Système de Classes CSS

### Layout Grid System
```jsx
{/* Container principal */}
<div className="page-body">
  <div className="container-fluid">
    
    {/* Alertes - 3 colonnes */}
    <div className="row g-3">
      <div className="col-md-4">...</div>
      <div className="col-md-4">...</div>
      <div className="col-md-4">...</div>
    </div>
    
    {/* Dashboard - 4 colonnes */}
    <div className="row g-3">
      <div className="col-lg-3">...</div>
      <div className="col-lg-3">...</div>
      <div className="col-lg-3">...</div>
      <div className="col-lg-3">...</div>
    </div>
  </div>
</div>
```

### Patterns de Cartes
```jsx
{/* Pattern Standard */}
<div className="card mb-3">
  <div className="card-body">
    <h4 className="card-title">📋 Titre</h4>
    {/* Contenu */}
  </div>
</div>

{/* Pattern Sidebar (hauteur pleine) */}
<div className="card h-100">
  <div className="card-body">
    <h4 className="card-title text-center mb-4">MÉTRIQUES CEO</h4>
    {/* 5 KPIs */}
  </div>
</div>
```

### Patterns de Métriques
```jsx
{/* Métrique avec badge */}
<div className="d-flex justify-content-between align-items-center mb-2">
  <span className="text-secondary">En retard</span>
  <span className="badge bg-danger">3</span>
</div>

{/* Métrique avec valeur importante */}
<div className="d-flex justify-content-between align-items-center mb-2">
  <span className="text-secondary">Cash disponible</span>
  <span className="h3 mb-0">€847K</span>
</div>

{/* Métrique avec couleur */}
<div className="d-flex justify-content-between align-items-center mb-2">
  <span className="text-secondary">Entrées prévues (7j)</span>
  <span className="text-success">+€127K</span>
</div>
```

### Progress Bars
```jsx
<div className="mb-2">
  <div className="d-flex justify-content-between mb-1">
    <small>Google Ads</small>
    <small>45%</small>
  </div>
  <div className="progress" style={{ height: '8px' }}>
    <div className="progress-bar bg-primary" style={{ width: '45%' }}></div>
  </div>
</div>
```

## 📊 Configuration Recharts

### AreaChart - Cash Flow
```jsx
<ResponsiveContainer width="100%" height={120}>
  <AreaChart data={cashFlowData}>
    <Area 
      type="monotone" 
      dataKey="entrees" 
      stackId="1" 
      stroke="#2fb344" 
      fill="#2fb344" 
    />
    <Area 
      type="monotone" 
      dataKey="sorties" 
      stackId="1" 
      stroke="#d63939" 
      fill="#d63939" 
    />
    <XAxis dataKey="day" tick={{ fontSize: 10 }} />
    <Tooltip />
  </AreaChart>
</ResponsiveContainer>
```

**Configuration**:
- **Type**: AreaChart empilé (`stackId="1"`)
- **Dimensions**: 100% width, 120px height
- **Couleurs**: Vert pour entrées, rouge pour sorties
- **Axes**: XAxis avec labels jours, pas de YAxis
- **Interactivité**: Tooltip au hover

### LineChart - Sparklines
```jsx
<LineChart data={data.map((value, index) => ({ value, index }))}>
  <Line 
    type="monotone" 
    dataKey="value" 
    stroke={color} 
    strokeWidth={2}
    dot={false}
  />
</LineChart>
```

**Configuration**:
- **Type**: LineChart simple
- **Dimensions**: 100% width, 40px height
- **Style**: Ligne continue, pas de points
- **Couleurs**: Dynamiques par prop
- **Axes**: Pas d'axes visibles

## 🎯 Logique Métier

### Structure des Alertes
```javascript
const alertes = [
  {
    type: 'danger',
    title: '3 actions urgentes',
    subtitle: 'À faire aujourd\'hui',
    value: 3
  },
  {
    type: 'warning', 
    title: '5 deadlines cette semaine',
    subtitle: '2 projets critiques',
    value: 5
  },
  {
    type: 'info',
    title: '2 alertes financières', 
    subtitle: 'Factures impayées > 30j',
    value: 2
  }
]
```

### Calculs Automatiques
```javascript
// Exemple de calculs possibles
const totalOpportunities = 24
const pipelineValue = 1200000 // €1.2M
const conversionRate = 0.32 // 32%
const expectedClosing = pipelineValue * conversionRate // €450K

const cashAvailable = 847000 // €847K
const monthlyBurn = 115000 // €115K  
const runway = cashAvailable / monthlyBurn // 7.3 mois
```

## 🔧 Maintenance et Évolution

### Ajout d'un Nouveau KPI
```jsx
// 1. Ajouter les données
const sparklineData = {
  // ... existants
  newKPI: [10, 12, 15, 18, 20, 22, 25]
}

// 2. Ajouter le rendu
<div className="mb-4">
  <div className="d-flex justify-content-between align-items-center mb-2">
    <span className="text-uppercase small text-secondary">NOUVEAU KPI</span>
    <span className="h3 mb-0">25</span>
  </div>
  <Sparkline data={sparklineData.newKPI} color="#ff6b35" />
</div>
```

### Ajout d'un Nouveau Bloc
```jsx
// Structure type d'un nouveau bloc
<div className="card mb-3">
  <div className="card-body">
    <h4 className="card-title">🆕 Nouveau Bloc</h4>
    
    {/* Métriques principales */}
    <div className="mb-3">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <span className="text-secondary">Métrique 1</span>
        <span className="h4 mb-0">Valeur</span>
      </div>
      {/* ... autres métriques */}
    </div>
    
    {/* Section détaillée (optionnelle) */}
    <div className="mt-4">
      <h5 className="mb-2">SECTION DÉTAIL</h5>
      {/* Contenu détaillé */}
    </div>
  </div>
</div>
```

### Connexion API Future
```jsx
// Pattern pour remplacer les données mockées
const SuperAdminDashboard = ({ selectedCompany }) => {
  const [dashboardData, setDashboardData] = useState(null)
  
  useEffect(() => {
    // Fetch des données réelles
    fetchDashboardData(selectedCompany)
      .then(setDashboardData)
  }, [selectedCompany])
  
  if (!dashboardData) return <Loading />
  
  return (
    // Rendu avec dashboardData au lieu de données mockées
  )
}
```

## 🧪 Tests et Validation

### Tests Unitaires Recommandés
```javascript
// Test du composant Sparkline
test('Sparkline renders with correct data', () => {
  const data = [1, 2, 3, 4, 5]
  const color = '#ff0000'
  
  render(<Sparkline data={data} color={color} />)
  
  // Vérifier la présence du graphique
  expect(screen.getByRole('img')).toBeInTheDocument()
})

// Test de rendu du dashboard
test('Dashboard renders all sections', () => {
  render(<SuperAdminDashboard selectedCompany="all" />)
  
  // Vérifier les titres principaux
  expect(screen.getByText('📢 Alertes & Actions Prioritaires')).toBeInTheDocument()
  expect(screen.getByText('MÉTRIQUES CEO')).toBeInTheDocument()
})
```

### Validation Responsive
```css
/* Breakpoints à tester */
@media (max-width: 991px) {
  /* Tablette - colonnes empilées */
}

@media (max-width: 767px) {
  /* Mobile - tout empilé */
}
```

## ⚡ Performance

### Optimisations Actuelles
1. **Pas de re-renders** - Données statiques
2. **Composant léger** - 1 seul fichier
3. **CSS natif** - Pas de styles custom
4. **Recharts optimisé** - ResponsiveContainer

### Optimisations Futures
```jsx
// Memoization des composants
const MemoizedSparkline = React.memo(Sparkline)

// Lazy loading des graphiques
const LazyAreaChart = lazy(() => import('./LazyAreaChart'))

// Virtual scrolling pour les listes
const VirtualizedList = dynamic(() => import('react-virtual'))
```

---

**Guide créé le**: 2025-08-06  
**Version**: 1.0.0  
**Cible**: Développeurs React