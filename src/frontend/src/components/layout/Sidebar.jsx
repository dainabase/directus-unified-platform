/**
 * Sidebar — Phase C (C.1-C.5)
 * 7 collapsible sections with auto-expand based on current route.
 * Apple DS v2.0 tokens — zero hex colors in JSX.
 */

import React, { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  TrendingUp,
  Receipt,
  ShoppingCart,
  CreditCard,
  BookOpen,
  Wallet,
  BarChart3,
  FileCheck,
  QrCode,
  Milestone,
  Shield,
  FolderOpen,
  CheckSquare,
  UserCheck,
  Clock,
  Kanban,
  Target,
  Megaphone,
  Users,
  FileText,
  Zap,
  Mail,
  Bell,
  Plug,
  Settings,
  ChevronDown,
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
    id: 'finance',
    label: 'FINANCE',
    items: [
      { label: "Vue d'ensemble", icon: TrendingUp, path: '/superadmin/finance' },
      { label: 'Factures clients', icon: Receipt, path: '/superadmin/finance/invoices' },
      { label: 'Factures fournisseurs', icon: ShoppingCart, path: '/superadmin/finance/suppliers' },
      { label: 'Banking', icon: CreditCard, path: '/superadmin/finance/banking' },
      { label: 'Comptabilite', icon: BookOpen, path: '/superadmin/finance/accounting' },
      { label: 'Depenses', icon: Wallet, path: '/superadmin/finance/expenses' },
      { label: 'TVA / AFC', icon: FileCheck, path: '/superadmin/finance/reports/vat' },
      { label: 'Recouvrement', icon: Shield, path: '/superadmin/collection' },
    ],
  },
  {
    id: 'projets',
    label: 'PROJETS',
    items: [
      { label: 'Projets', icon: FolderOpen, path: '/superadmin/projects' },
      { label: 'Livrables', icon: CheckSquare, path: '/superadmin/deliverables' },
      { label: 'Jalons', icon: Milestone, path: '/superadmin/finance/milestones' },
      { label: 'Prestataires', icon: UserCheck, path: '/superadmin/providers' },
      { label: 'Time tracking', icon: Clock, path: '/superadmin/time-tracking' },
    ],
  },
  {
    id: 'crm',
    label: 'CRM',
    items: [
      { label: 'Pipeline', icon: Kanban, path: '/superadmin/crm/pipeline' },
      { label: 'Leads', icon: Target, path: '/superadmin/leads' },
      { label: 'Devis', icon: FileText, path: '/superadmin/quotes' },
      { label: 'Contacts', icon: Users, path: '/superadmin/crm/contacts' },
    ],
  },
  {
    id: 'automation',
    label: 'AUTOMATION',
    items: [
      { label: 'Email Templates', icon: Mail, path: '/superadmin/automation/emails' },
      { label: 'Workflows', icon: Zap, path: '/superadmin/automation/workflows' },
      { label: 'Notifications', icon: Bell, path: '/superadmin/automation/notifications' },
    ],
  },
  {
    id: 'integrations',
    label: 'INTEGRATIONS',
    items: [
      { label: 'Invoice Ninja', icon: Receipt, path: '/superadmin/integrations/invoice-ninja' },
      { label: 'Mautic', icon: Megaphone, path: '/superadmin/integrations/mautic' },
      { label: 'Revolut', icon: CreditCard, path: '/superadmin/integrations/revolut' },
      { label: 'ERPNext', icon: BookOpen, path: '/superadmin/integrations/erpnext' },
    ],
  },
]

const Sidebar = ({ selectedCompany = 'all', onCompanyChange }) => {
  const location = useLocation()
  const [activeCompany, setActiveCompany] = useState(selectedCompany)

  // Auto-expand section whose items match the current path
  const getAutoExpanded = () => {
    const expanded = {}
    navSections.forEach((section) => {
      const isActive = section.items.some((item) =>
        location.pathname.startsWith(item.path)
      )
      if (isActive) expanded[section.id] = true
    })
    return expanded
  }

  const [expandedSections, setExpandedSections] = useState(getAutoExpanded)

  // Re-evaluate auto-expand when route changes
  useEffect(() => {
    setExpandedSections((prev) => {
      const auto = getAutoExpanded()
      return { ...prev, ...auto }
    })
  }, [location.pathname])

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }))
  }

  const handleCompany = (id) => {
    setActiveCompany(id)
    onCompanyChange?.(id)
  }

  return (
    <aside
      className="ds-glass fixed left-0 top-0 h-full flex flex-col"
      style={{
        width: 240,
        zIndex: 'var(--z-sidebar)',
        borderRight: '1px solid var(--glass-border)',
      }}
    >
      {/* Logo zone */}
      <div
        className="flex items-center gap-3 px-5 shrink-0"
        style={{ height: 52, borderBottom: '1px solid var(--sep)' }}
      >
        <div
          className="flex items-center justify-center shrink-0"
          style={{
            width: 32,
            height: 32,
            borderRadius: 'var(--radius-logo)',
            background: 'var(--label-1)',
            color: 'var(--bg-2)',
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.5px',
          }}
        >
          HV
        </div>
        <span style={{ fontSize: 'var(--size-13)', fontWeight: 600, color: 'var(--label-1)' }}>
          HYPERVISUAL
        </span>
      </div>

      {/* Company switcher */}
      <div
        className="flex items-center gap-1.5 px-4 shrink-0"
        style={{ height: 44, borderBottom: '1px solid var(--sep)' }}
      >
        {companies.map((c) => (
          <button
            key={c.id}
            onClick={() => handleCompany(c.id)}
            title={c.full}
            style={{
              padding: '3px 7px',
              fontSize: 'var(--size-11)',
              fontWeight: 600,
              borderRadius: 'var(--radius-badge)',
              background: activeCompany === c.id ? 'var(--accent)' : 'transparent',
              color: activeCompany === c.id ? 'var(--bg-2)' : 'var(--label-2)',
              transition: 'all var(--t-fast) var(--ease-out)',
              border: 'none',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              if (activeCompany !== c.id) e.currentTarget.style.background = 'var(--fill-1)'
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
        {/* Dashboard — standalone item */}
        <div className="mb-1">
          <NavLink
            to="/superadmin"
            end
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg"
            style={{
              background: location.pathname === '/superadmin' ? 'var(--accent-light)' : 'transparent',
              color: location.pathname === '/superadmin' ? 'var(--accent)' : 'var(--label-1)',
              fontSize: 'var(--size-13)',
              fontWeight: location.pathname === '/superadmin' ? 500 : 450,
              transition: 'all var(--t-fast) var(--ease-out)',
            }}
            onMouseEnter={(e) => {
              if (location.pathname !== '/superadmin') e.currentTarget.style.background = 'var(--fill-1)'
            }}
            onMouseLeave={(e) => {
              if (location.pathname !== '/superadmin') e.currentTarget.style.background = 'transparent'
            }}
          >
            <LayoutDashboard
              size={16}
              style={{ color: location.pathname === '/superadmin' ? 'var(--accent)' : 'var(--label-2)' }}
            />
            <span>Dashboard</span>
          </NavLink>
        </div>

        {/* Collapsible sections */}
        {navSections.map((section) => {
          const isExpanded = !!expandedSections[section.id]
          const sectionHasActive = section.items.some((item) =>
            item.path === '/superadmin'
              ? location.pathname === '/superadmin'
              : location.pathname.startsWith(item.path)
          )

          return (
            <div key={section.id} className="mb-1">
              {/* Section header */}
              <button
                onClick={() => toggleSection(section.id)}
                className="flex items-center justify-between w-full px-3 py-1.5 rounded-lg"
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background var(--t-fast) var(--ease-out)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--fill-1)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
              >
                <span
                  className="ds-nav-section"
                  style={{
                    color: sectionHasActive ? 'var(--accent)' : 'var(--label-3)',
                  }}
                >
                  {section.label}
                </span>
                <ChevronDown
                  size={12}
                  style={{
                    color: 'var(--label-3)',
                    transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                    transition: 'transform var(--t-fast) var(--ease-out)',
                  }}
                />
              </button>

              {/* Section items */}
              {isExpanded && (
                <div className="mt-0.5">
                  {section.items.map((item) => {
                    const Icon = item.icon
                    const isActive = location.pathname.startsWith(item.path)

                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg"
                        style={{
                          background: isActive ? 'var(--accent-light)' : 'transparent',
                          color: isActive ? 'var(--accent)' : 'var(--label-1)',
                          fontSize: 'var(--size-13)',
                          fontWeight: isActive ? 500 : 450,
                          transition: 'all var(--t-fast) var(--ease-out)',
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) e.currentTarget.style.background = 'var(--fill-1)'
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) e.currentTarget.style.background = 'transparent'
                        }}
                      >
                        <Icon
                          size={16}
                          style={{ color: isActive ? 'var(--accent)' : 'var(--label-2)' }}
                        />
                        <span>{item.label}</span>
                      </NavLink>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}

        {/* Parametres — standalone item */}
        <div className="mt-1">
          <NavLink
            to="/superadmin/settings"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg"
            style={{
              background: location.pathname.startsWith('/superadmin/settings') ? 'var(--accent-light)' : 'transparent',
              color: location.pathname.startsWith('/superadmin/settings') ? 'var(--accent)' : 'var(--label-1)',
              fontSize: 'var(--size-13)',
              fontWeight: location.pathname.startsWith('/superadmin/settings') ? 500 : 450,
              transition: 'all var(--t-fast) var(--ease-out)',
            }}
            onMouseEnter={(e) => {
              if (!location.pathname.startsWith('/superadmin/settings'))
                e.currentTarget.style.background = 'var(--fill-1)'
            }}
            onMouseLeave={(e) => {
              if (!location.pathname.startsWith('/superadmin/settings'))
                e.currentTarget.style.background = 'transparent'
            }}
          >
            <Settings
              size={16}
              style={{
                color: location.pathname.startsWith('/superadmin/settings')
                  ? 'var(--accent)'
                  : 'var(--label-2)',
              }}
            />
            <span>Parametres</span>
          </NavLink>
        </div>
      </nav>

      {/* Footer user */}
      <div
        className="flex items-center gap-3 px-4 shrink-0"
        style={{ height: 52, borderTop: '1px solid var(--sep)' }}
      >
        <div
          className="flex items-center justify-center shrink-0"
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: 'var(--label-1)',
            color: 'var(--bg-2)',
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          JM
        </div>
        <div className="flex-1 min-w-0">
          <div
            className="truncate"
            style={{ fontSize: 'var(--size-13)', fontWeight: 500, color: 'var(--label-1)' }}
          >
            Jean-Marie D.
          </div>
          <div style={{ fontSize: 'var(--size-11)', color: 'var(--label-2)' }}>CEO</div>
        </div>
        <button
          style={{
            color: 'var(--label-3)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            transition: 'color var(--t-fast) var(--ease-out)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--label-2)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--label-3)')}
        >
          <Settings size={16} />
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
