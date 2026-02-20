/**
 * PrestataireLayout — Phase D-06
 * Layout portail prestataire avec sidebar 4 items, accent blue (#0071E3).
 * Auth via useProviderAuth (magic-link comme client portal).
 */

import React from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, FileText, Package, Receipt,
  LogOut, Wrench
} from 'lucide-react'
import { useProviderAuth } from '../hooks/useProviderAuth'

const NAV_ITEMS = [
  { path: '/prestataire', label: 'Tableau de bord', icon: LayoutDashboard, end: true },
  { path: '/prestataire/quotes', label: 'Demandes de devis', icon: FileText },
  { path: '/prestataire/orders', label: 'Bons de commande', icon: Package },
  { path: '/prestataire/invoices', label: 'Mes factures', icon: Receipt }
]

const PrestataireLayout = () => {
  const { provider, logout } = useProviderAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/prestataire/login')
  }

  const displayName = provider?.contact_person || provider?.name || 'Prestataire'
  const initials = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <aside
        className="fixed left-0 top-0 bottom-0 w-64 ds-glass flex flex-col z-30"
        style={{ borderRight: '1px solid var(--border-light)' }}
      >
        {/* Logo */}
        <div className="p-6" style={{ borderBottom: '1px solid var(--border-light)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0071E3] flex items-center justify-center shadow-sm">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>HYPERVISUAL</p>
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Espace Prestataire</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              style={({ isActive }) => ({
                background: isActive ? 'var(--accent-light)' : 'transparent',
                color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                transition: 'all 0.15s ease'
              })}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50"
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="p-4" style={{ borderTop: '1px solid var(--border-light)' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-[#0071E3] flex items-center justify-center">
              <span className="text-sm font-bold text-white">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{displayName}</p>
              <p className="text-xs truncate" style={{ color: 'var(--text-tertiary)' }}>{provider?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={16} />
            Deconnexion
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64 min-h-screen p-6">
        <Outlet />
      </main>
    </div>
  )
}

export default PrestataireLayout
