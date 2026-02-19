# 🚀 PROMPT CLAUDE CODE - DASHBOARD SUPERADMIN V5

## CONTEXTE DU PROJET

Tu dois créer une nouvelle version du dashboard SuperAdmin (DashboardV5) en te basant sur :
1. **Le prototype HTML** : `/Users/jean-mariedelaunay/directus-unified-platform/superadmin-dashboard-v2/superadmin-dashboard-v2/index.html`
2. **Les hooks de données existants** : `src/frontend/src/services/hooks/`
3. **Le design system** : `src/frontend/src/design-system/theme/colors.js`

## OBJECTIF

Créer un dashboard moderne avec :
- ✅ Glassmorphism subtil et élégant
- ✅ Navigation sidebar avec 10 modules
- ✅ TopBar avec sélecteur d'entreprise
- ✅ Données réelles depuis Directus via les hooks existants
- ✅ Graphiques Recharts
- ✅ Responsive design
- ✅ Animations légères (CSS uniquement, pas Framer Motion)

---

## 📁 STRUCTURE DES FICHIERS À CRÉER

```
src/frontend/src/portals/superadmin/DashboardV5/
├── index.jsx                      # Export principal
├── DashboardV5.jsx               # Composant principal
├── DashboardV5.css               # Styles CSS
├── components/
│   ├── Sidebar.jsx               # Navigation 10 modules
│   ├── TopBar.jsx                # Header + company selector
│   ├── Card.jsx                  # Glass cards réutilisables
│   ├── MetricCard.jsx            # Cards KPI avec tendances
│   ├── Button.jsx                # Boutons stylés
│   ├── Icon.jsx                  # Wrapper Lucide icons
│   ├── ActivityFeed.jsx          # Flux d'activité
│   └── ProjectsList.jsx          # Liste projets
├── modules/
│   ├── DashboardModule.jsx       # Vue d'ensemble (HOME)
│   ├── ProjectsModule.jsx        # Gestion projets
│   ├── FinanceModule.jsx         # Finance
│   ├── CRMModule.jsx             # Clients
│   ├── AccountingModule.jsx      # Comptabilité
│   ├── HRModule.jsx              # Ressources Humaines
│   ├── LegalModule.jsx           # Juridique
│   ├── SupportModule.jsx         # Support
│   ├── MarketingModule.jsx       # Marketing
│   └── SettingsModule.jsx        # Paramètres
└── context/
    └── DashboardContext.jsx      # Context pour état global
```

---

## 🎨 PALETTE DE COULEURS (OBLIGATOIRE)

```css
/* Couleurs principales */
--color-primary: #3B82F6;
--color-secondary: #8B5CF6;
--color-success: #10B981;
--color-warning: #F59E0B;
--color-danger: #EF4444;
--color-info: #06B6D4;

/* Glassmorphism */
--glass-white: rgba(255, 255, 255, 0.1);
--glass-white-light: rgba(255, 255, 255, 0.05);
--glass-white-medium: rgba(255, 255, 255, 0.15);
--glass-white-strong: rgba(255, 255, 255, 0.25);
--glass-border: rgba(255, 255, 255, 0.18);
--glass-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);

/* Texte */
--text-primary: #1F2937;
--text-secondary: #6B7280;
--text-tertiary: #9CA3AF;
--text-white: #FFFFFF;

/* Background */
--bg-gradient: linear-gradient(135deg, #f5f7fa 0%, #e4e8ed 100%);
--bg-sidebar: rgba(255, 255, 255, 0.05);
```

---

## 📝 FICHIER 1 : index.jsx

```jsx
// src/frontend/src/portals/superadmin/DashboardV5/index.jsx
export { default } from './DashboardV5'
export { DashboardProvider, useDashboard } from './context/DashboardContext'
```

---

## 📝 FICHIER 2 : context/DashboardContext.jsx

```jsx
// src/frontend/src/portals/superadmin/DashboardV5/context/DashboardContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react'

const DashboardContext = createContext(null)

export const DashboardProvider = ({ children }) => {
  const [currentModule, setCurrentModule] = useState('dashboard')
  const [selectedCompany, setSelectedCompany] = useState('all')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [notifications, setNotifications] = useState([])

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev)
  }, [])

  const addNotification = useCallback((notification) => {
    const id = Date.now()
    setNotifications(prev => [...prev, { ...notification, id }])
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, 5000)
  }, [])

  const value = {
    currentModule,
    setCurrentModule,
    selectedCompany,
    setSelectedCompany,
    sidebarCollapsed,
    setSidebarCollapsed,
    toggleSidebar,
    notifications,
    addNotification
  }

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  )
}

export const useDashboard = () => {
  const context = useContext(DashboardContext)
  if (!context) {
    throw new Error('useDashboard must be used within DashboardProvider')
  }
  return context
}
```

---

## 📝 FICHIER 3 : components/Icon.jsx

```jsx
// src/frontend/src/portals/superadmin/DashboardV5/components/Icon.jsx
import * as LucideIcons from 'lucide-react'

const Icon = ({ name, size = 20, className = '', ...props }) => {
  // Convertir le nom kebab-case en PascalCase
  const iconName = name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')
  
  const IconComponent = LucideIcons[iconName]
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`)
    return null
  }
  
  return <IconComponent size={size} className={className} {...props} />
}

export default Icon
```

---

## 📝 FICHIER 4 : components/Card.jsx

```jsx
// src/frontend/src/portals/superadmin/DashboardV5/components/Card.jsx
import React from 'react'
import './Card.css'

const Card = ({ 
  children, 
  className = '', 
  glass = true,
  hover = false,
  onClick,
  ...props 
}) => {
  const classes = [
    'card-v5',
    glass ? 'card-glass' : 'card-solid',
    hover ? 'card-hover' : '',
    onClick ? 'card-clickable' : '',
    className
  ].filter(Boolean).join(' ')

  return (
    <div className={classes} onClick={onClick} {...props}>
      {children}
    </div>
  )
}

export default Card
```

```css
/* components/Card.css */
.card-v5 {
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.card-glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
}

.card-solid {
  background: white;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.card-hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(31, 38, 135, 0.25);
}

.card-clickable {
  cursor: pointer;
}
```

---

## 📝 FICHIER 5 : components/Button.jsx

```jsx
// src/frontend/src/portals/superadmin/DashboardV5/components/Button.jsx
import React from 'react'
import './Button.css'

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  icon,
  className = '',
  ...props 
}) => {
  const classes = [
    'btn-v5',
    `btn-${variant}`,
    `btn-${size}`,
    className
  ].filter(Boolean).join(' ')

  return (
    <button className={classes} {...props}>
      {icon && <span className="btn-icon">{icon}</span>}
      {children}
    </button>
  )
}

export default Button
```

```css
/* components/Button.css */
.btn-v5 {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
}

.btn-sm { padding: 0.375rem 0.75rem; font-size: 0.875rem; }
.btn-md { padding: 0.5rem 1rem; font-size: 1rem; }
.btn-lg { padding: 0.75rem 1.5rem; font-size: 1.125rem; }

.btn-primary {
  background: #3B82F6;
  color: white;
}
.btn-primary:hover { background: #2563EB; }

.btn-secondary {
  background: #6B7280;
  color: white;
}
.btn-secondary:hover { background: #4B5563; }

.btn-ghost {
  background: transparent;
  color: #6B7280;
}
.btn-ghost:hover { background: rgba(0, 0, 0, 0.05); }

.btn-icon { display: flex; }
```

---

## 📝 FICHIER 6 : components/MetricCard.jsx

```jsx
// src/frontend/src/portals/superadmin/DashboardV5/components/MetricCard.jsx
import React from 'react'
import Card from './Card'
import Icon from './Icon'
import './MetricCard.css'

const MetricCard = ({ 
  icon, 
  value, 
  label, 
  trend = 0,
  trendLabel = 'vs mois dernier',
  color = 'primary',
  onClick 
}) => {
  const isPositive = trend >= 0
  const trendColor = isPositive ? 'success' : 'danger'
  
  const formatValue = (val) => {
    if (typeof val === 'number') {
      if (val >= 1000000) {
        return `${(val / 1000000).toFixed(1)}M`
      }
      if (val >= 1000) {
        return `${(val / 1000).toFixed(0)}K`
      }
      return val.toLocaleString('fr-CH')
    }
    return val
  }

  return (
    <Card className="metric-card" hover onClick={onClick}>
      <div className="metric-header">
        <div className={`metric-icon metric-icon-${color}`}>
          <Icon name={icon} size={20} />
        </div>
        {trend !== 0 && (
          <div className={`metric-trend metric-trend-${trendColor}`}>
            <Icon name={isPositive ? 'trending-up' : 'trending-down'} size={14} />
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <div className="metric-body">
        <p className="metric-value">{formatValue(value)}</p>
        <p className="metric-label">{label}</p>
      </div>
    </Card>
  )
}

export default MetricCard
```

```css
/* components/MetricCard.css */
.metric-card {
  min-width: 180px;
}

.metric-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.metric-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.metric-icon-primary { background: rgba(59, 130, 246, 0.15); color: #3B82F6; }
.metric-icon-secondary { background: rgba(139, 92, 246, 0.15); color: #8B5CF6; }
.metric-icon-success { background: rgba(16, 185, 129, 0.15); color: #10B981; }
.metric-icon-warning { background: rgba(245, 158, 11, 0.15); color: #F59E0B; }
.metric-icon-danger { background: rgba(239, 68, 68, 0.15); color: #EF4444; }

.metric-trend {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
}

.metric-trend-success { background: rgba(16, 185, 129, 0.1); color: #10B981; }
.metric-trend-danger { background: rgba(239, 68, 68, 0.1); color: #EF4444; }

.metric-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1F2937;
  margin: 0 0 0.25rem 0;
}

.metric-label {
  font-size: 0.875rem;
  color: #6B7280;
  margin: 0;
}
```

---


## 📝 FICHIER 7 : components/Sidebar.jsx

```jsx
// src/frontend/src/portals/superadmin/DashboardV5/components/Sidebar.jsx
import React from 'react'
import { useDashboard } from '../context/DashboardContext'
import Icon from './Icon'
import './Sidebar.css'

const modules = [
  { id: 'dashboard', name: 'Dashboard', icon: 'layout-dashboard' },
  { id: 'projects', name: 'Projets', icon: 'folder' },
  { id: 'finance', name: 'Finance', icon: 'wallet' },
  { id: 'crm', name: 'CRM', icon: 'users' },
  { id: 'accounting', name: 'Comptabilité', icon: 'calculator' },
  { id: 'hr', name: 'RH', icon: 'users' },
  { id: 'legal', name: 'Juridique', icon: 'shield' },
  { id: 'support', name: 'Support', icon: 'headphones' },
  { id: 'marketing', name: 'Marketing', icon: 'megaphone' },
  { id: 'settings', name: 'Paramètres', icon: 'settings' }
]

const Sidebar = () => {
  const { currentModule, setCurrentModule, sidebarCollapsed, toggleSidebar } = useDashboard()

  return (
    <aside className={`sidebar-v5 ${sidebarCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        {!sidebarCollapsed && (
          <h1 className="sidebar-title">SuperAdmin</h1>
        )}
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          <Icon name={sidebarCollapsed ? 'menu' : 'x'} size={20} />
        </button>
      </div>

      <nav className="sidebar-nav">
        {modules.map(module => (
          <button
            key={module.id}
            onClick={() => setCurrentModule(module.id)}
            className={`sidebar-item ${currentModule === module.id ? 'active' : ''}`}
            title={sidebarCollapsed ? module.name : undefined}
          >
            <Icon name={module.icon} size={20} />
            {!sidebarCollapsed && <span>{module.name}</span>}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        {!sidebarCollapsed && (
          <div className="sidebar-version">
            <Icon name="info" size={14} />
            <span>v5.0.0</span>
          </div>
        )}
      </div>
    </aside>
  )
}

export default Sidebar
```

```css
/* components/Sidebar.css */
.sidebar-v5 {
  width: 260px;
  height: 100vh;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
}

.sidebar-v5.collapsed {
  width: 70px;
}

.sidebar-header {
  padding: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1F2937;
  margin: 0;
}

.sidebar-toggle {
  background: none;
  border: none;
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  color: #6B7280;
  transition: all 0.2s;
}

.sidebar-toggle:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #1F2937;
}

.sidebar-nav {
  flex: 1;
  padding: 1rem 0.75rem;
  overflow-y: auto;
}

.sidebar-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border: none;
  background: transparent;
  border-radius: 10px;
  cursor: pointer;
  color: #4B5563;
  font-size: 0.9375rem;
  font-weight: 500;
  transition: all 0.2s;
  margin-bottom: 0.25rem;
}

.sidebar-item:hover {
  background: rgba(59, 130, 246, 0.08);
  color: #3B82F6;
}

.sidebar-item.active {
  background: #3B82F6;
  color: white;
}

.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-version {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #9CA3AF;
}

/* Collapsed state */
.sidebar-v5.collapsed .sidebar-header {
  justify-content: center;
  padding: 1rem;
}

.sidebar-v5.collapsed .sidebar-item {
  justify-content: center;
  padding: 0.75rem;
}

.sidebar-v5.collapsed .sidebar-item span {
  display: none;
}
```

---

## 📝 FICHIER 8 : components/TopBar.jsx

```jsx
// src/frontend/src/portals/superadmin/DashboardV5/components/TopBar.jsx
import React, { useState } from 'react'
import { useDashboard } from '../context/DashboardContext'
import { useCompanies } from '../../../../services/hooks/useCompanies'
import Icon from './Icon'
import './TopBar.css'

const TopBar = () => {
  const { selectedCompany, setSelectedCompany } = useDashboard()
  const { data: companies = [] } = useCompanies()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  // User info (à remplacer par un hook d'auth)
  const user = {
    name: 'Jean-Marie Delaunay',
    email: 'admin@hypervisual.ch',
    role: 'Super Admin',
    initials: 'JD'
  }

  return (
    <header className="topbar-v5">
      <div className="topbar-left">
        <select
          value={selectedCompany}
          onChange={(e) => setSelectedCompany(e.target.value)}
          className="company-selector"
        >
          <option value="all">Toutes les entreprises</option>
          {companies.map(company => (
            <option key={company.id} value={company.id}>
              {company.name}
            </option>
          ))}
        </select>
      </div>

      <div className="topbar-right">
        {/* Search */}
        <div className="topbar-search">
          <Icon name="search" size={18} />
          <input type="text" placeholder="Rechercher..." />
        </div>

        {/* Notifications */}
        <div className="topbar-notifications">
          <button 
            className="topbar-icon-btn"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Icon name="bell" size={20} />
            <span className="notification-badge">3</span>
          </button>
          
          {showNotifications && (
            <div className="notifications-dropdown">
              <div className="notifications-header">
                <h4>Notifications</h4>
                <button className="mark-all-read">Tout marquer lu</button>
              </div>
              <div className="notifications-list">
                <div className="notification-item unread">
                  <div className="notification-icon bg-blue">
                    <Icon name="file-text" size={14} />
                  </div>
                  <div className="notification-content">
                    <p>Nouvelle facture créée</p>
                    <span>Il y a 5 min</span>
                  </div>
                </div>
                <div className="notification-item unread">
                  <div className="notification-icon bg-green">
                    <Icon name="check-circle" size={14} />
                  </div>
                  <div className="notification-content">
                    <p>Paiement reçu - 15,000 CHF</p>
                    <span>Il y a 1h</span>
                  </div>
                </div>
                <div className="notification-item">
                  <div className="notification-icon bg-orange">
                    <Icon name="alert-triangle" size={14} />
                  </div>
                  <div className="notification-content">
                    <p>Facture en retard #2024-089</p>
                    <span>Il y a 2h</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="topbar-user">
          <button 
            className="user-btn"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className="user-avatar">
              {user.initials}
            </div>
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <span className="user-role">{user.role}</span>
            </div>
            <Icon name="chevron-down" size={16} />
          </button>

          {showUserMenu && (
            <div className="user-dropdown">
              <button className="dropdown-item">
                <Icon name="user" size={16} />
                <span>Mon Profil</span>
              </button>
              <button className="dropdown-item">
                <Icon name="settings" size={16} />
                <span>Paramètres</span>
              </button>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item text-danger">
                <Icon name="log-out" size={16} />
                <span>Déconnexion</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default TopBar
```

```css
/* components/TopBar.css */
.topbar-v5 {
  height: 70px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.company-selector {
  padding: 0.625rem 1rem;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.1);
  font-size: 0.9375rem;
  color: #1F2937;
  cursor: pointer;
  min-width: 200px;
}

.company-selector:focus {
  outline: none;
  border-color: #3B82F6;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.topbar-search {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  border: 1px solid transparent;
}

.topbar-search:focus-within {
  border-color: #3B82F6;
  background: rgba(255, 255, 255, 0.15);
}

.topbar-search input {
  border: none;
  background: transparent;
  outline: none;
  font-size: 0.9375rem;
  width: 180px;
  color: #1F2937;
}

.topbar-search input::placeholder {
  color: #9CA3AF;
}

.topbar-icon-btn {
  position: relative;
  background: none;
  border: none;
  padding: 0.625rem;
  border-radius: 10px;
  cursor: pointer;
  color: #6B7280;
  transition: all 0.2s;
}

.topbar-icon-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #1F2937;
}

.notification-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 16px;
  height: 16px;
  background: #EF4444;
  color: white;
  font-size: 0.625rem;
  font-weight: 600;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.topbar-notifications {
  position: relative;
}

.notifications-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  width: 320px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow: hidden;
}

.notifications-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #E5E7EB;
}

.notifications-header h4 {
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 600;
}

.mark-all-read {
  background: none;
  border: none;
  font-size: 0.75rem;
  color: #3B82F6;
  cursor: pointer;
}

.notifications-list {
  max-height: 300px;
  overflow-y: auto;
}

.notification-item {
  display: flex;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  border-bottom: 1px solid #F3F4F6;
  transition: background 0.2s;
}

.notification-item:hover {
  background: #F9FAFB;
}

.notification-item.unread {
  background: #EFF6FF;
}

.notification-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.notification-icon.bg-blue { background: #DBEAFE; color: #3B82F6; }
.notification-icon.bg-green { background: #D1FAE5; color: #10B981; }
.notification-icon.bg-orange { background: #FEF3C7; color: #F59E0B; }

.notification-content p {
  margin: 0 0 0.25rem 0;
  font-size: 0.875rem;
  color: #1F2937;
}

.notification-content span {
  font-size: 0.75rem;
  color: #9CA3AF;
}

.topbar-user {
  position: relative;
}

.user-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  background: none;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s;
}

.user-btn:hover {
  background: rgba(0, 0, 0, 0.05);
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #3B82F6, #8B5CF6);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 600;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.user-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1F2937;
}

.user-role {
  font-size: 0.75rem;
  color: #6B7280;
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  width: 200px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  padding: 0.5rem;
  z-index: 1000;
}

.dropdown-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.75rem;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  color: #4B5563;
  transition: all 0.2s;
}

.dropdown-item:hover {
  background: #F3F4F6;
}

.dropdown-item.text-danger {
  color: #EF4444;
}

.dropdown-divider {
  height: 1px;
  background: #E5E7EB;
  margin: 0.5rem 0;
}
```

---


## 📝 FICHIER 9 : modules/DashboardModule.jsx

```jsx
// src/frontend/src/portals/superadmin/DashboardV5/modules/DashboardModule.jsx
import React from 'react'
import { useDashboard } from '../context/DashboardContext'
import Card from '../components/Card'
import MetricCard from '../components/MetricCard'
import Button from '../components/Button'
import Icon from '../components/Icon'

// Importer les hooks existants
import { useCompanies, useCompanyMetrics } from '../../../../services/hooks/useCompanies'
import { useProjects, useProjectStatus } from '../../../../services/hooks/useProjects'
import { useCashFlow, useRevenue, useRunway } from '../../../../services/hooks/useFinances'
import { useMetrics, useAlerts, useUrgentTasks } from '../../../../services/hooks/useMetrics'

// Importer les graphiques Recharts existants
import RevenueChart from '../../../../components/charts/RevenueChart'
import CashFlowChart from '../../../../components/charts/CashFlowChart'

import './DashboardModule.css'

const DashboardModule = () => {
  const { selectedCompany, setCurrentModule } = useDashboard()
  
  // Filtres basés sur l'entreprise sélectionnée
  const filters = selectedCompany !== 'all' 
    ? { company_id: selectedCompany } 
    : {}

  // Récupération des données avec les hooks existants
  const { data: companies = [] } = useCompanies()
  const { data: projects = [], isLoading: loadingProjects } = useProjects(filters)
  const { data: revenue, isLoading: loadingRevenue } = useRevenue(filters)
  const { data: runway, isLoading: loadingRunway } = useRunway(filters)
  const { data: alerts = [] } = useAlerts(filters)
  const { data: urgentTasks = [] } = useUrgentTasks(filters)
  const { data: cashFlow } = useCashFlow(filters)

  // Formater les montants en CHF
  const formatCHF = (value) => {
    if (!value && value !== 0) return '—'
    return new Intl.NumberFormat('fr-CH', {
      style: 'currency',
      currency: 'CHF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  // Projets en cours
  const activeProjects = projects?.filter(p => 
    p.status === 'in_progress' || p.status === 'planning'
  ) || []

  // Calcul des métriques
  const metrics = {
    arr: revenue?.arr || 0,
    mrr: revenue?.mrr || 0,
    clients: projects?.length || 0,
    projectsCount: activeProjects.length,
    cashBalance: cashFlow?.balance || runway?.balance || 0,
    runwayMonths: runway?.runway || 0
  }

  return (
    <div className="dashboard-module">
      {/* Header */}
      <div className="module-header">
        <div>
          <h1 className="module-title">Tableau de Bord</h1>
          <p className="module-subtitle">Vue d'ensemble de votre activité</p>
        </div>
        <div className="module-actions">
          <Button variant="ghost" size="sm">
            <Icon name="download" size={16} />
            Exporter
          </Button>
          <Button variant="primary" size="sm">
            <Icon name="refresh-cw" size={16} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Alertes urgentes */}
      {alerts.length > 0 && (
        <div className="alerts-banner">
          <Icon name="alert-triangle" size={20} />
          <span>
            {alerts.length} alerte{alerts.length > 1 ? 's' : ''} nécessitant votre attention
          </span>
          <Button variant="ghost" size="sm">Voir tout</Button>
        </div>
      )}

      {/* Métriques KPI */}
      <div className="metrics-grid">
        <MetricCard
          icon="trending-up"
          value={formatCHF(metrics.arr)}
          label="ARR"
          trend={12.5}
          color="primary"
        />
        <MetricCard
          icon="dollar-sign"
          value={formatCHF(metrics.mrr)}
          label="MRR"
          trend={8.3}
          color="secondary"
        />
        <MetricCard
          icon="users"
          value={companies.length}
          label="Entreprises"
          trend={0}
          color="info"
        />
        <MetricCard
          icon="folder"
          value={metrics.projectsCount}
          label="Projets Actifs"
          trend={-2.1}
          color="warning"
        />
        <MetricCard
          icon="wallet"
          value={formatCHF(metrics.cashBalance)}
          label="Trésorerie"
          trend={15.7}
          color="success"
        />
        <MetricCard
          icon="clock"
          value={`${metrics.runwayMonths} mois`}
          label="Runway"
          trend={0}
          color="danger"
        />
      </div>

      {/* Contenu principal */}
      <div className="dashboard-content">
        {/* Colonne gauche - Projets */}
        <div className="content-main">
          <Card>
            <div className="card-header">
              <h3 className="card-title">Projets en Cours</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setCurrentModule('projects')}
              >
                Voir tous <Icon name="arrow-right" size={14} />
              </Button>
            </div>

            {loadingProjects ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <span>Chargement...</span>
              </div>
            ) : activeProjects.length === 0 ? (
              <div className="empty-state">
                <Icon name="folder-open" size={40} />
                <p>Aucun projet en cours</p>
              </div>
            ) : (
              <div className="projects-list">
                {activeProjects.slice(0, 5).map(project => (
                  <div key={project.id} className="project-item">
                    <div className="project-header">
                      <h4 className="project-name">{project.name}</h4>
                      <span className={`project-status status-${project.status}`}>
                        {project.status === 'in_progress' ? 'En cours' : 
                         project.status === 'planning' ? 'Planification' : 
                         project.status}
                      </span>
                    </div>
                    <div className="project-meta">
                      <span className="project-company">
                        {project.owner_company_name || project.owner_company}
                      </span>
                      {project.end_date && (
                        <span className="project-deadline">
                          <Icon name="calendar" size={12} />
                          {new Date(project.end_date).toLocaleDateString('fr-FR')}
                        </span>
                      )}
                    </div>
                    <div className="project-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ width: `${project.progress || 0}%` }}
                        />
                      </div>
                      <span className="progress-text">{project.progress || 0}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Graphique Revenue */}
          <Card className="chart-card">
            <div className="card-header">
              <h3 className="card-title">Évolution du Chiffre d'Affaires</h3>
            </div>
            <div className="chart-container">
              <RevenueChart filters={filters} />
            </div>
          </Card>
        </div>

        {/* Colonne droite - Activités */}
        <div className="content-aside">
          {/* Tâches urgentes */}
          <Card>
            <div className="card-header">
              <h3 className="card-title">Tâches Urgentes</h3>
              <span className="task-count">{urgentTasks.length}</span>
            </div>
            
            {urgentTasks.length === 0 ? (
              <div className="empty-state small">
                <Icon name="check-circle" size={24} />
                <p>Aucune tâche urgente</p>
              </div>
            ) : (
              <div className="tasks-list">
                {urgentTasks.slice(0, 5).map((task, index) => (
                  <div key={index} className="task-item">
                    <div className={`task-priority priority-${task.priority || 'medium'}`} />
                    <div className="task-content">
                      <p className="task-title">{task.title || task.name}</p>
                      <span className="task-due">
                        {task.due_date && new Date(task.due_date).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Activité récente */}
          <Card>
            <div className="card-header">
              <h3 className="card-title">Activité Récente</h3>
            </div>
            <div className="activity-feed">
              <div className="activity-item">
                <div className="activity-icon bg-blue">
                  <Icon name="file-text" size={14} />
                </div>
                <div className="activity-content">
                  <p>Nouvelle facture créée</p>
                  <span>FAC-2025-001 - LEXAIA</span>
                  <time>Il y a 5 min</time>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon bg-green">
                  <Icon name="credit-card" size={14} />
                </div>
                <div className="activity-content">
                  <p>Paiement reçu</p>
                  <span>15,000 CHF - DAINAMICS</span>
                  <time>Il y a 1h</time>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon bg-purple">
                  <Icon name="folder" size={14} />
                </div>
                <div className="activity-content">
                  <p>Projet mis à jour</p>
                  <span>Refonte Site E-commerce - 75%</span>
                  <time>Il y a 2h</time>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon bg-orange">
                  <Icon name="user-plus" size={14} />
                </div>
                <div className="activity-content">
                  <p>Nouveau collaborateur</p>
                  <span>Marie Lambert - HYPERVISUAL</span>
                  <time>Il y a 3h</time>
                </div>
              </div>
            </div>
          </Card>

          {/* Cashflow */}
          <Card className="chart-card">
            <div className="card-header">
              <h3 className="card-title">Flux de Trésorerie</h3>
            </div>
            <div className="chart-container small">
              <CashFlowChart filters={filters} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default DashboardModule
```

```css
/* modules/DashboardModule.css */
.dashboard-module {
  animation: fadeIn 0.4s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.module-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.module-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1F2937;
  margin: 0 0 0.25rem 0;
}

.module-subtitle {
  font-size: 0.9375rem;
  color: #6B7280;
  margin: 0;
}

.module-actions {
  display: flex;
  gap: 0.5rem;
}

/* Alertes */
.alerts-banner {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  background: #FEF3C7;
  border: 1px solid #F59E0B;
  border-radius: 10px;
  margin-bottom: 1.5rem;
  color: #92400E;
}

.alerts-banner span {
  flex: 1;
  font-size: 0.875rem;
  font-weight: 500;
}

/* Grille métriques */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

/* Contenu principal */
.dashboard-content {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 1.5rem;
}

@media (max-width: 1200px) {
  .dashboard-content {
    grid-template-columns: 1fr;
  }
}

.content-main {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.content-aside {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Card header */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.card-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1F2937;
  margin: 0;
}

/* États */
.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #9CA3AF;
  text-align: center;
}

.empty-state.small {
  padding: 1.5rem;
}

.empty-state p {
  margin: 0.5rem 0 0 0;
  font-size: 0.875rem;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #E5E7EB;
  border-top-color: #3B82F6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Liste projets */
.projects-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.project-item {
  padding: 1rem;
  background: #F9FAFB;
  border-radius: 10px;
  transition: background 0.2s;
  cursor: pointer;
}

.project-item:hover {
  background: #F3F4F6;
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.project-name {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1F2937;
  margin: 0;
}

.project-status {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
}

.status-in_progress { background: #DBEAFE; color: #1D4ED8; }
.status-planning { background: #FEF3C7; color: #92400E; }
.status-completed { background: #D1FAE5; color: #065F46; }

.project-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.75rem;
  font-size: 0.8125rem;
  color: #6B7280;
}

.project-deadline {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.project-progress {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: #E5E7EB;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3B82F6, #8B5CF6);
  border-radius: 3px;
  transition: width 0.5s ease;
}

.progress-text {
  font-size: 0.75rem;
  font-weight: 600;
  color: #4B5563;
  min-width: 35px;
  text-align: right;
}

/* Tâches */
.task-count {
  background: #EF4444;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.125rem 0.5rem;
  border-radius: 10px;
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.task-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.625rem 0;
  border-bottom: 1px solid #F3F4F6;
}

.task-item:last-child {
  border-bottom: none;
}

.task-priority {
  width: 4px;
  height: 100%;
  min-height: 40px;
  border-radius: 2px;
}

.priority-high { background: #EF4444; }
.priority-medium { background: #F59E0B; }
.priority-low { background: #10B981; }

.task-content {
  flex: 1;
}

.task-title {
  font-size: 0.875rem;
  color: #1F2937;
  margin: 0 0 0.25rem 0;
}

.task-due {
  font-size: 0.75rem;
  color: #9CA3AF;
}

/* Activités */
.activity-feed {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.activity-item {
  display: flex;
  gap: 0.75rem;
}

.activity-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.activity-icon.bg-blue { background: #DBEAFE; color: #3B82F6; }
.activity-icon.bg-green { background: #D1FAE5; color: #10B981; }
.activity-icon.bg-purple { background: #EDE9FE; color: #8B5CF6; }
.activity-icon.bg-orange { background: #FEF3C7; color: #F59E0B; }

.activity-content {
  flex: 1;
}

.activity-content p {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1F2937;
  margin: 0 0 0.125rem 0;
}

.activity-content span {
  font-size: 0.8125rem;
  color: #6B7280;
  display: block;
}

.activity-content time {
  font-size: 0.75rem;
  color: #9CA3AF;
}

/* Charts */
.chart-card .card-header {
  margin-bottom: 0.5rem;
}

.chart-container {
  height: 250px;
}

.chart-container.small {
  height: 180px;
}
```

---


## 📝 FICHIER 10 : modules/ProjectsModule.jsx

```jsx
// src/frontend/src/portals/superadmin/DashboardV5/modules/ProjectsModule.jsx
import React, { useState } from 'react'
import { useDashboard } from '../context/DashboardContext'
import Card from '../components/Card'
import Button from '../components/Button'
import Icon from '../components/Icon'
import { useProjects } from '../../../../services/hooks/useProjects'
import './ProjectsModule.css'

const ProjectsModule = () => {
  const { selectedCompany } = useDashboard()
  const [viewMode, setViewMode] = useState('grid') // grid, list, kanban
  const [statusFilter, setStatusFilter] = useState('all')
  
  const filters = selectedCompany !== 'all' 
    ? { company_id: selectedCompany } 
    : {}

  const { data: projects = [], isLoading, refetch } = useProjects(filters)

  // Filtrer par statut
  const filteredProjects = statusFilter === 'all' 
    ? projects 
    : projects.filter(p => p.status === statusFilter)

  // Grouper par statut pour Kanban
  const projectsByStatus = {
    planning: filteredProjects.filter(p => p.status === 'planning'),
    in_progress: filteredProjects.filter(p => p.status === 'in_progress'),
    completed: filteredProjects.filter(p => p.status === 'completed')
  }

  const statusLabels = {
    planning: 'Planification',
    in_progress: 'En cours',
    completed: 'Terminé'
  }

  const statusColors = {
    planning: 'yellow',
    in_progress: 'blue',
    completed: 'green'
  }

  const ProjectCard = ({ project }) => (
    <Card className="project-card" hover>
      <div className="project-card-header">
        <h4>{project.name}</h4>
        <span className={`status-badge badge-${statusColors[project.status]}`}>
          {statusLabels[project.status]}
        </span>
      </div>
      
      <p className="project-description">
        {project.description || 'Aucune description'}
      </p>

      <div className="project-card-meta">
        <span className="meta-item">
          <Icon name="building" size={14} />
          {project.owner_company_name || project.owner_company}
        </span>
        {project.budget && (
          <span className="meta-item">
            <Icon name="wallet" size={14} />
            {new Intl.NumberFormat('fr-CH', { 
              style: 'currency', 
              currency: 'CHF',
              minimumFractionDigits: 0 
            }).format(project.budget)}
          </span>
        )}
      </div>

      <div className="project-card-progress">
        <div className="progress-header">
          <span>Progression</span>
          <span>{project.progress || 0}%</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${project.progress || 0}%` }}
          />
        </div>
      </div>

      <div className="project-card-footer">
        <div className="team-avatars">
          {/* Placeholder pour l'équipe */}
          <div className="avatar">JD</div>
          <div className="avatar">ML</div>
          <div className="avatar">+2</div>
        </div>
        {project.end_date && (
          <span className="deadline">
            <Icon name="calendar" size={14} />
            {new Date(project.end_date).toLocaleDateString('fr-FR')}
          </span>
        )}
      </div>
    </Card>
  )

  return (
    <div className="projects-module">
      {/* Header */}
      <div className="module-header">
        <div>
          <h1 className="module-title">Projets</h1>
          <p className="module-subtitle">
            {filteredProjects.length} projet{filteredProjects.length > 1 ? 's' : ''}
          </p>
        </div>
        <div className="module-actions">
          {/* Filtres */}
          <select 
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Tous les statuts</option>
            <option value="planning">Planification</option>
            <option value="in_progress">En cours</option>
            <option value="completed">Terminés</option>
          </select>

          {/* Toggle vue */}
          <div className="view-toggle">
            <button 
              className={viewMode === 'grid' ? 'active' : ''}
              onClick={() => setViewMode('grid')}
            >
              <Icon name="grid-3x3" size={16} />
            </button>
            <button 
              className={viewMode === 'list' ? 'active' : ''}
              onClick={() => setViewMode('list')}
            >
              <Icon name="list" size={16} />
            </button>
            <button 
              className={viewMode === 'kanban' ? 'active' : ''}
              onClick={() => setViewMode('kanban')}
            >
              <Icon name="columns-3" size={16} />
            </button>
          </div>

          <Button variant="primary">
            <Icon name="plus" size={16} />
            Nouveau Projet
          </Button>
        </div>
      </div>

      {/* Contenu selon le mode de vue */}
      {isLoading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <span>Chargement des projets...</span>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="empty-state">
          <Icon name="folder-open" size={48} />
          <h3>Aucun projet</h3>
          <p>Commencez par créer votre premier projet</p>
          <Button variant="primary">
            <Icon name="plus" size={16} />
            Créer un projet
          </Button>
        </div>
      ) : (
        <>
          {/* Vue Grille */}
          {viewMode === 'grid' && (
            <div className="projects-grid">
              {filteredProjects.map(project => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}

          {/* Vue Liste */}
          {viewMode === 'list' && (
            <Card className="projects-table-card">
              <table className="projects-table">
                <thead>
                  <tr>
                    <th>Projet</th>
                    <th>Entreprise</th>
                    <th>Statut</th>
                    <th>Budget</th>
                    <th>Progression</th>
                    <th>Échéance</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map(project => (
                    <tr key={project.id}>
                      <td>
                        <div className="project-name-cell">
                          <strong>{project.name}</strong>
                        </div>
                      </td>
                      <td>{project.owner_company_name || project.owner_company}</td>
                      <td>
                        <span className={`status-badge badge-${statusColors[project.status]}`}>
                          {statusLabels[project.status]}
                        </span>
                      </td>
                      <td>
                        {project.budget 
                          ? new Intl.NumberFormat('fr-CH', { 
                              style: 'currency', 
                              currency: 'CHF',
                              minimumFractionDigits: 0 
                            }).format(project.budget)
                          : '—'
                        }
                      </td>
                      <td>
                        <div className="progress-cell">
                          <div className="progress-bar small">
                            <div 
                              className="progress-fill"
                              style={{ width: `${project.progress || 0}%` }}
                            />
                          </div>
                          <span>{project.progress || 0}%</span>
                        </div>
                      </td>
                      <td>
                        {project.end_date 
                          ? new Date(project.end_date).toLocaleDateString('fr-FR')
                          : '—'
                        }
                      </td>
                      <td>
                        <button className="action-btn">
                          <Icon name="more-horizontal" size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}

          {/* Vue Kanban */}
          {viewMode === 'kanban' && (
            <div className="kanban-board">
              {Object.entries(projectsByStatus).map(([status, statusProjects]) => (
                <div key={status} className="kanban-column">
                  <div className="kanban-header">
                    <span className={`kanban-dot dot-${statusColors[status]}`} />
                    <h3>{statusLabels[status]}</h3>
                    <span className="kanban-count">{statusProjects.length}</span>
                  </div>
                  <div className="kanban-cards">
                    {statusProjects.map(project => (
                      <Card key={project.id} className="kanban-card" hover>
                        <h4>{project.name}</h4>
                        <p>{project.owner_company_name || project.owner_company}</p>
                        <div className="kanban-card-footer">
                          <div className="team-avatars small">
                            <div className="avatar">JD</div>
                          </div>
                          {project.end_date && (
                            <span className="deadline">
                              {new Date(project.end_date).toLocaleDateString('fr-FR')}
                            </span>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default ProjectsModule
```

```css
/* modules/ProjectsModule.css */
.projects-module {
  animation: fadeIn 0.4s ease;
}

.module-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.module-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1F2937;
  margin: 0 0 0.25rem 0;
}

.module-subtitle {
  font-size: 0.9375rem;
  color: #6B7280;
  margin: 0;
}

.module-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
}

.filter-select {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid #E5E7EB;
  background: white;
  font-size: 0.875rem;
  color: #4B5563;
  cursor: pointer;
}

.view-toggle {
  display: flex;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  overflow: hidden;
}

.view-toggle button {
  padding: 0.5rem 0.75rem;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #6B7280;
  transition: all 0.2s;
}

.view-toggle button:hover {
  background: #F3F4F6;
}

.view-toggle button.active {
  background: #3B82F6;
  color: white;
}

/* État vide */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  color: #9CA3AF;
}

.empty-state h3 {
  margin: 1rem 0 0.5rem;
  color: #4B5563;
}

.empty-state p {
  margin-bottom: 1.5rem;
}

/* Grille de projets */
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.25rem;
}

.project-card {
  display: flex;
  flex-direction: column;
}

.project-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.project-card-header h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1F2937;
}

.status-badge {
  font-size: 0.6875rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.badge-yellow { background: #FEF3C7; color: #92400E; }
.badge-blue { background: #DBEAFE; color: #1D4ED8; }
.badge-green { background: #D1FAE5; color: #065F46; }

.project-description {
  font-size: 0.875rem;
  color: #6B7280;
  margin: 0 0 1rem 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.project-card-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8125rem;
  color: #6B7280;
}

.project-card-progress {
  margin-bottom: 1rem;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #6B7280;
  margin-bottom: 0.375rem;
}

.project-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #F3F4F6;
  margin-top: auto;
}

.team-avatars {
  display: flex;
}

.team-avatars .avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3B82F6, #8B5CF6);
  color: white;
  font-size: 0.625rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: -8px;
  border: 2px solid white;
}

.team-avatars .avatar:first-child {
  margin-left: 0;
}

.team-avatars.small .avatar {
  width: 24px;
  height: 24px;
  font-size: 0.5rem;
  margin-left: -6px;
}

.deadline {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8125rem;
  color: #6B7280;
}

/* Table */
.projects-table-card {
  overflow: hidden;
}

.projects-table {
  width: 100%;
  border-collapse: collapse;
}

.projects-table th {
  text-align: left;
  padding: 0.875rem 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6B7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: #F9FAFB;
  border-bottom: 1px solid #E5E7EB;
}

.projects-table td {
  padding: 1rem;
  border-bottom: 1px solid #F3F4F6;
  font-size: 0.875rem;
  color: #4B5563;
}

.projects-table tr:hover {
  background: #F9FAFB;
}

.project-name-cell strong {
  color: #1F2937;
}

.progress-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.progress-bar.small {
  width: 80px;
  height: 4px;
}

.action-btn {
  background: none;
  border: none;
  padding: 0.375rem;
  border-radius: 6px;
  cursor: pointer;
  color: #9CA3AF;
}

.action-btn:hover {
  background: #F3F4F6;
  color: #4B5563;
}

/* Kanban */
.kanban-board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
}

@media (max-width: 900px) {
  .kanban-board {
    grid-template-columns: 1fr;
  }
}

.kanban-column {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(5px);
  border-radius: 12px;
  padding: 1rem;
  min-height: 400px;
}

.kanban-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.kanban-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.dot-yellow { background: #F59E0B; }
.dot-blue { background: #3B82F6; }
.dot-green { background: #10B981; }

.kanban-header h3 {
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1F2937;
  flex: 1;
}

.kanban-count {
  background: #E5E7EB;
  color: #4B5563;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.125rem 0.5rem;
  border-radius: 10px;
}

.kanban-cards {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.kanban-card {
  cursor: grab;
}

.kanban-card h4 {
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #1F2937;
}

.kanban-card p {
  margin: 0 0 0.75rem 0;
  font-size: 0.8125rem;
  color: #6B7280;
}

.kanban-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
```

---


## 📝 FICHIER 11 : modules/ComingSoonModule.jsx (Pour les autres modules)

```jsx
// src/frontend/src/portals/superadmin/DashboardV5/modules/ComingSoonModule.jsx
import React from 'react'
import Icon from '../components/Icon'
import Button from '../components/Button'
import './ComingSoonModule.css'

const ComingSoonModule = ({ title, description, icon }) => {
  return (
    <div className="coming-soon-module">
      <div className="coming-soon-content">
        <div className="coming-soon-icon">
          <Icon name={icon} size={48} />
        </div>
        <h2>{title}</h2>
        <p>{description}</p>
        <Button variant="secondary">
          <Icon name="bell" size={16} />
          Me notifier quand c'est prêt
        </Button>
      </div>
    </div>
  )
}

export default ComingSoonModule
```

```css
/* modules/ComingSoonModule.css */
.coming-soon-module {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 200px);
  animation: fadeIn 0.4s ease;
}

.coming-soon-content {
  text-align: center;
  max-width: 400px;
}

.coming-soon-icon {
  width: 100px;
  height: 100px;
  background: #F3F4F6;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  color: #9CA3AF;
}

.coming-soon-content h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1F2937;
  margin: 0 0 0.75rem 0;
}

.coming-soon-content p {
  font-size: 1rem;
  color: #6B7280;
  margin: 0 0 1.5rem 0;
  line-height: 1.6;
}
```

---

## 📝 FICHIER 12 : DashboardV5.jsx (Composant Principal)

```jsx
// src/frontend/src/portals/superadmin/DashboardV5/DashboardV5.jsx
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { DashboardProvider, useDashboard } from './context/DashboardContext'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'

// Modules
import DashboardModule from './modules/DashboardModule'
import ProjectsModule from './modules/ProjectsModule'
import ComingSoonModule from './modules/ComingSoonModule'

import './DashboardV5.css'

// Configuration des modules
const moduleConfig = {
  dashboard: {
    component: DashboardModule,
    title: 'Dashboard',
    description: 'Vue d\'ensemble'
  },
  projects: {
    component: ProjectsModule,
    title: 'Projets',
    description: 'Gestion des projets'
  },
  finance: {
    component: () => (
      <ComingSoonModule
        title="Module Finance"
        description="Gérez vos finances, factures et paiements. Suivez votre trésorerie et vos prévisions en temps réel."
        icon="wallet"
      />
    ),
    title: 'Finance',
    description: 'Finances et paiements'
  },
  crm: {
    component: () => (
      <ComingSoonModule
        title="Module CRM"
        description="Gérez vos relations clients, suivez vos opportunités et optimisez votre pipeline commercial."
        icon="users"
      />
    ),
    title: 'CRM',
    description: 'Relations clients'
  },
  accounting: {
    component: () => (
      <ComingSoonModule
        title="Module Comptabilité"
        description="Comptabilité suisse complète avec plan comptable PME, TVA et rapports légaux conformes."
        icon="calculator"
      />
    ),
    title: 'Comptabilité',
    description: 'Comptabilité suisse'
  },
  hr: {
    component: () => (
      <ComingSoonModule
        title="Module RH"
        description="Gestion des ressources humaines : employés, absences, salaires et documents."
        icon="users"
      />
    ),
    title: 'Ressources Humaines',
    description: 'Gestion RH'
  },
  legal: {
    component: () => (
      <ComingSoonModule
        title="Module Juridique"
        description="CGV, contrats, conformité légale et gestion documentaire juridique."
        icon="shield"
      />
    ),
    title: 'Juridique',
    description: 'Documents légaux'
  },
  support: {
    component: () => (
      <ComingSoonModule
        title="Module Support"
        description="Gestion des tickets support, base de connaissances et satisfaction client."
        icon="headphones"
      />
    ),
    title: 'Support',
    description: 'Support client'
  },
  marketing: {
    component: () => (
      <ComingSoonModule
        title="Module Marketing"
        description="Campagnes marketing, automatisation emails et analytics avec Mautic."
        icon="megaphone"
      />
    ),
    title: 'Marketing',
    description: 'Marketing automation'
  },
  settings: {
    component: () => (
      <ComingSoonModule
        title="Paramètres"
        description="Configuration de la plateforme, utilisateurs et intégrations."
        icon="settings"
      />
    ),
    title: 'Paramètres',
    description: 'Configuration'
  }
}

// Composant interne pour le rendu du module actif
const ModuleRenderer = () => {
  const { currentModule } = useDashboard()
  
  const config = moduleConfig[currentModule] || moduleConfig.dashboard
  const ModuleComponent = config.component
  
  return <ModuleComponent />
}

// Layout principal
const DashboardLayout = () => {
  const { sidebarCollapsed } = useDashboard()
  
  return (
    <div className={`dashboard-v5-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar />
      <div className="dashboard-main">
        <TopBar />
        <main className="dashboard-content">
          <ModuleRenderer />
        </main>
      </div>
    </div>
  )
}

// Create QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
})

// Composant principal exporté
const DashboardV5 = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <DashboardProvider>
        <DashboardLayout />
      </DashboardProvider>
    </QueryClientProvider>
  )
}

export default DashboardV5
```

---

## 📝 FICHIER 13 : DashboardV5.css (Styles Globaux)

```css
/* src/frontend/src/portals/superadmin/DashboardV5/DashboardV5.css */

/* Reset & Base */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* CSS Variables */
:root {
  /* Colors */
  --color-primary: #3B82F6;
  --color-secondary: #8B5CF6;
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-danger: #EF4444;
  --color-info: #06B6D4;
  
  /* Glass */
  --glass-white: rgba(255, 255, 255, 0.1);
  --glass-white-light: rgba(255, 255, 255, 0.05);
  --glass-white-medium: rgba(255, 255, 255, 0.15);
  --glass-white-strong: rgba(255, 255, 255, 0.25);
  --glass-border: rgba(255, 255, 255, 0.18);
  --glass-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
  
  /* Text */
  --text-primary: #1F2937;
  --text-secondary: #6B7280;
  --text-tertiary: #9CA3AF;
  
  /* Background */
  --bg-gradient: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
  
  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  
  /* Border Radius */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  
  /* Sidebar */
  --sidebar-width: 260px;
  --sidebar-collapsed-width: 70px;
  
  /* Topbar */
  --topbar-height: 70px;
  
  /* Transitions */
  --transition-fast: 0.2s ease;
  --transition-normal: 0.3s ease;
}

/* Layout */
.dashboard-v5-layout {
  display: flex;
  min-height: 100vh;
  background: var(--bg-gradient);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
}

.dashboard-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  margin-left: var(--sidebar-width);
  transition: margin-left var(--transition-normal);
}

.dashboard-v5-layout.sidebar-collapsed .dashboard-main {
  margin-left: var(--sidebar-collapsed-width);
}

.dashboard-content {
  flex: 1;
  padding: var(--spacing-lg);
  overflow-y: auto;
}

/* Progress Bar Global */
.progress-bar {
  height: 6px;
  background: #E5E7EB;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
  border-radius: 3px;
  transition: width 0.5s ease;
}

/* Loading Spinner */
.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #E5E7EB;
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideIn {
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
}

/* Responsive */
@media (max-width: 1024px) {
  .dashboard-main {
    margin-left: var(--sidebar-collapsed-width);
  }
}

@media (max-width: 768px) {
  .dashboard-main {
    margin-left: 0;
  }
  
  .dashboard-content {
    padding: var(--spacing-md);
  }
}

/* Scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}
```

---

## 🔗 INTÉGRATION AVEC LE ROUTER

Modifier le fichier router principal pour intégrer DashboardV5 :

```jsx
// src/frontend/src/App.jsx ou router.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import DashboardV5 from './portals/superadmin/DashboardV5'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Route SuperAdmin */}
        <Route path="/superadmin/*" element={<DashboardV5 />} />
        
        {/* Redirection par défaut */}
        <Route path="/" element={<Navigate to="/superadmin" replace />} />
        
        {/* Autres portails... */}
      </Routes>
    </BrowserRouter>
  )
}

export default App
```

---

## ✅ CHECKLIST DE VALIDATION

Avant de soumettre, vérifier :

- [ ] Tous les fichiers créés dans la bonne structure
- [ ] Imports corrects vers les hooks existants
- [ ] Imports corrects vers les graphiques Recharts
- [ ] CSS variables cohérentes avec le design system
- [ ] Responsive design fonctionnel
- [ ] Animations légères (CSS uniquement)
- [ ] Console sans erreurs
- [ ] Données affichées depuis Directus

---

## 📋 COMMANDES À EXÉCUTER

```bash
# 1. Naviguer vers le projet
cd /Users/jean-mariedelaunay/directus-unified-platform

# 2. Vérifier que le frontend existe
ls -la src/frontend/src/portals/superadmin/

# 3. Créer la structure DashboardV5
mkdir -p src/frontend/src/portals/superadmin/DashboardV5/{components,modules,context}

# 4. Créer tous les fichiers (utiliser les contenus ci-dessus)

# 5. Installer les dépendances si nécessaire
cd src/frontend
npm install lucide-react @tanstack/react-query react-router-dom

# 6. Démarrer le serveur de développement
npm run dev
```

---

## ⚠️ POINTS IMPORTANTS

1. **NE PAS utiliser Framer Motion** - Uniquement des animations CSS
2. **NE PAS utiliser ApexCharts** - Utiliser Recharts (déjà installé)
3. **NE PAS modifier les hooks existants** - Les utiliser tels quels
4. **RESPECTER la palette de couleurs** définie dans le design system
5. **TESTER sur mobile** - Le design doit être responsive
6. **COMMITER régulièrement** sur GitHub avec des messages clairs

---

## 🎯 RÉSULTAT ATTENDU

Un dashboard SuperAdmin moderne avec :

| Élément | Description |
|---------|-------------|
| **Sidebar** | 10 modules, collapsible, active state |
| **TopBar** | Sélecteur entreprise, recherche, notifications, user menu |
| **Dashboard** | 6 métriques KPI, projets, activités, graphiques |
| **Projects** | 3 vues (grid, list, kanban), filtres, CRUD |
| **Autres modules** | Coming Soon avec notification |
| **Design** | Glassmorphism subtil, couleurs cohérentes |
| **Animations** | Légères, CSS uniquement |
| **Responsive** | Mobile-first, sidebar collapse |

---

**FIN DU PROMPT - PRÊT POUR CLAUDE CODE**
