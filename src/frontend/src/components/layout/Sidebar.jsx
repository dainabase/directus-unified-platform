import React, { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Target,
  Kanban,
  FileText,
  FolderOpen,
  CheckSquare,
  UserCheck,
  Receipt,
  ShoppingCart,
  CreditCard,
  BookOpen,
  Megaphone,
  Zap,
  Shield,
  RefreshCw,
  Headphones,
  Clock,
  Settings,
} from 'lucide-react'

const companies = [
  { id: 'all', label: 'HV', full: 'HYPERVISUAL' },
  { id: 'dainamics', label: 'DA', full: 'DAINAMICS' },
  { id: 'lexaia', label: 'LX', full: 'LEXAIA' },
  { id: 'enki', label: 'ER', full: 'ENKI REALTY' },
  { id: 'takeout', label: 'TO', full: 'TAKEOUT' },
]

const navSections = [
  {
    label: 'OVERVIEW',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/superadmin' },
      { label: 'KPIs', icon: Target, path: '/superadmin/kpis' },
      { label: 'Pipeline', icon: Kanban, path: '/superadmin/crm/pipeline' },
      { label: 'Devis', icon: FileText, path: '/superadmin/quotes' },
    ],
  },
  {
    label: 'OPERATIONS',
    items: [
      { label: 'Projets', icon: FolderOpen, path: '/superadmin/projects' },
      { label: 'Livrables', icon: CheckSquare, path: '/superadmin/deliverables' },
      { label: 'Prestataires', icon: UserCheck, path: '/superadmin/providers' },
    ],
  },
  {
    label: 'FINANCE',
    items: [
      { label: 'Factures clients', icon: Receipt, path: '/superadmin/invoices/clients' },
      { label: 'Factures fournisseurs', icon: ShoppingCart, path: '/superadmin/invoices/suppliers' },
      { label: 'Banking', icon: CreditCard, path: '/superadmin/banking' },
      { label: 'Comptabilite', icon: BookOpen, path: '/superadmin/accounting' },
    ],
  },
  {
    label: 'MARKETING',
    items: [
      { label: 'Campagnes', icon: Megaphone, path: '/superadmin/marketing/campaigns' },
      { label: 'Automation', icon: Zap, path: '/superadmin/marketing/analytics' },
    ],
  },
  {
    label: 'LEGAL',
    items: [
      { label: 'Contrats', icon: Shield, path: '/superadmin/legal/contracts' },
      { label: 'Abonnements', icon: RefreshCw, path: '/superadmin/subscriptions' },
    ],
  },
  {
    label: 'SYSTEME',
    items: [
      { label: 'Support', icon: Headphones, path: '/superadmin/support/tickets' },
      { label: 'Time tracking', icon: Clock, path: '/superadmin/time-tracking' },
      { label: 'Parametres', icon: Settings, path: '/superadmin/settings/companies' },
    ],
  },
]

const Sidebar = ({ selectedCompany = 'all', onCompanyChange }) => {
  const location = useLocation()
  const [activeCompany, setActiveCompany] = useState(selectedCompany)

  const handleCompany = (id) => {
    setActiveCompany(id)
    onCompanyChange?.(id)
  }

  return (
    <aside
      className="ds-glass fixed left-0 top-0 h-full z-[300] flex flex-col"
      style={{
        width: 240,
        borderRight: '1px solid rgba(0,0,0,0.08)',
      }}
    >
      {/* Logo zone */}
      <div
        className="flex items-center gap-3 px-5 shrink-0"
        style={{ height: 52, borderBottom: '1px solid rgba(0,0,0,0.06)' }}
      >
        <div
          className="flex items-center justify-center shrink-0"
          style={{
            width: 32,
            height: 32,
            borderRadius: 'var(--radius-logo)',
            background: 'var(--text-primary)',
            color: '#FFFFFF',
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.5px',
          }}
        >
          HV
        </div>
        <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
          HYPERVISUAL
        </span>
      </div>

      {/* Company switcher */}
      <div
        className="flex items-center gap-1.5 px-4 shrink-0"
        style={{ height: 44, borderBottom: '1px solid rgba(0,0,0,0.06)' }}
      >
        {companies.map((c) => (
          <button
            key={c.id}
            onClick={() => handleCompany(c.id)}
            title={c.full}
            className="transition-all duration-150"
            style={{
              padding: '3px 7px',
              fontSize: 11,
              fontWeight: 600,
              borderRadius: 'var(--radius-badge)',
              background: activeCompany === c.id ? 'var(--accent)' : 'transparent',
              color: activeCompany === c.id ? '#FFFFFF' : 'var(--text-secondary)',
            }}
            onMouseEnter={(e) => {
              if (activeCompany !== c.id) e.currentTarget.style.background = 'rgba(0,0,0,0.04)'
            }}
            onMouseLeave={(e) => {
              if (activeCompany !== c.id) e.currentTarget.style.background = 'transparent'
            }}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 px-2">
        {navSections.map((section) => (
          <div key={section.label} className="mb-3">
            <div className="ds-nav-section px-3 mb-1.5">{section.label}</div>
            {section.items.map((item) => {
              const Icon = item.icon
              const isActive =
                item.path === '/superadmin'
                  ? location.pathname === '/superadmin'
                  : location.pathname.startsWith(item.path)

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-150"
                  style={{
                    background: isActive ? 'var(--accent-light)' : 'transparent',
                    color: isActive ? 'var(--accent)' : 'var(--text-primary)',
                    fontSize: '13.5px',
                    fontWeight: isActive ? 500 : 450,
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.background = 'rgba(0,0,0,0.04)'
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.background = 'transparent'
                  }}
                >
                  <Icon
                    size={16}
                    style={{ color: isActive ? 'var(--accent)' : 'var(--text-secondary)' }}
                  />
                  <span>{item.label}</span>
                </NavLink>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Footer user */}
      <div
        className="flex items-center gap-3 px-4 shrink-0"
        style={{ height: 52, borderTop: '1px solid rgba(0,0,0,0.06)' }}
      >
        <div
          className="flex items-center justify-center shrink-0"
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--text-primary), var(--text-secondary))',
            color: '#FFFFFF',
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          JM
        </div>
        <div className="flex-1 min-w-0">
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }} className="truncate">
            Jean-Marie D.
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>CEO</div>
        </div>
        <button
          className="transition-colors duration-150"
          style={{ color: 'var(--text-tertiary)' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
        >
          <Settings size={16} />
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
