import React, { useState, useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Bell, Search, Plus } from 'lucide-react'

const TopBar = ({ onNewAction }) => {
  const location = useLocation()
  const [searchFocused, setSearchFocused] = useState(false)
  const [unreadCount] = useState(3)
  const searchRef = useRef(null)

  const getPageTitle = () => {
    const path = location.pathname
    const map = {
      '/superadmin': 'Dashboard',
      '/superadmin/kpis': 'KPIs',
      '/superadmin/quotes': 'Devis',
      '/superadmin/projects': 'Projets',
      '/superadmin/deliverables': 'Livrables',
      '/superadmin/providers': 'Prestataires',
      '/superadmin/invoices/clients': 'Factures clients',
      '/superadmin/invoices/suppliers': 'Factures fournisseurs',
      '/superadmin/banking': 'Banking',
      '/superadmin/accounting': 'Comptabilite',
      '/superadmin/marketing': 'Marketing',
      '/superadmin/legal': 'Juridique',
      '/superadmin/support': 'Support',
      '/superadmin/settings': 'Parametres',
      '/superadmin/crm/pipeline': 'Pipeline',
      '/superadmin/subscriptions': 'Abonnements',
      '/superadmin/time-tracking': 'Time Tracking',
    }

    for (const [route, title] of Object.entries(map)) {
      if (path.startsWith(route) && route !== '/superadmin') return title
    }
    return map[path] || 'Dashboard'
  }

  return (
    <header
      className="ds-glass fixed top-0 right-0 z-[200] flex items-center justify-between"
      style={{
        left: 240,
        height: 52,
        padding: '0 24px',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
      }}
    >
      {/* Left — Page title */}
      <div>
        <h1 className="ds-page-title">{getPageTitle()}</h1>
      </div>

      {/* Right — Search + Notifications + Quick action */}
      <div className="flex items-center gap-3">
        {/* Search bar */}
        <div className="relative">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--text-tertiary)' }}
          />
          <input
            ref={searchRef}
            type="search"
            placeholder="Rechercher..."
            className="ds-input pl-8 transition-all duration-200"
            style={{
              width: searchFocused ? 250 : 200,
              padding: '6px 10px 6px 32px',
              fontSize: 13,
            }}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </div>

        {/* Notifications */}
        <button
          className="relative p-2 rounded-md transition-colors duration-150"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.04)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <Bell size={16} />
          {unreadCount > 0 && (
            <span
              className="absolute flex items-center justify-center"
              style={{
                top: 4,
                right: 4,
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: 'var(--danger)',
              }}
            />
          )}
        </button>

        {/* Quick action */}
        <button
          className="ds-btn ds-btn-primary"
          style={{ padding: '6px 12px', fontSize: 12 }}
          onClick={onNewAction}
        >
          <Plus size={14} />
          Nouveau
        </button>
      </div>
    </header>
  )
}

export default TopBar
