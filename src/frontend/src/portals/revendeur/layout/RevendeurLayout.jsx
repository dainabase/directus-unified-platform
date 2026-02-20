/**
 * RevendeurLayout — S-05-04
 * Layout portail revendeur avec sidebar blue (#0071E3).
 */

import React from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, FileText, Package, ShoppingCart,
  Users, BarChart3, LogOut, ChevronRight, UserCircle
} from 'lucide-react'
import { useAuthStore } from '../../../stores/authStore'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard, path: '/revendeur' },
  { id: 'quotes', label: 'Devis', icon: FileText, path: '/revendeur/quotes' },
  { id: 'orders', label: 'Commandes', icon: ShoppingCart, path: '/revendeur/orders' },
  { id: 'catalogue', label: 'Catalogue', icon: Package, path: '/revendeur/catalogue' },
  { id: 'clients', label: 'Mes Clients', icon: Users, path: '/revendeur/clients' },
  { id: 'analytics', label: 'Statistiques', icon: BarChart3, path: '/revendeur/analytics' }
]

const ACCENT = '#0071E3'

const RevendeurLayout = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  const displayName = user
    ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email
    : 'Revendeur'

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const getBreadcrumb = () => {
    const item = NAV_ITEMS.find(n => location.pathname === n.path)
    return item?.label || 'Tableau de bord'
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Topbar */}
      <header
        className="fixed top-0 left-64 right-0 h-16 ds-glass z-40"
        style={{ borderBottom: '1px solid var(--border-light)' }}
      >
        <div className="h-full px-6 flex items-center justify-between">
          <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>{getBreadcrumb()}</span>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{displayName}</p>
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Revendeur</p>
            </div>
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: ACCENT }}
            >
              <UserCircle className="w-5 h-5 text-white" />
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
              title="Deconnexion"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className="fixed left-0 top-0 h-screen w-64 ds-glass overflow-y-auto z-50"
        style={{ borderRight: '1px solid var(--border-light)' }}
      >
        <div className="p-4">
          <div className="mb-6 px-3 pt-2">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
                style={{ background: ACCENT }}
              >
                <span className="text-lg font-black text-white">R</span>
              </div>
              <div>
                <h1 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>HYPERVISUAL</h1>
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Espace Revendeur</p>
              </div>
            </div>
          </div>

          <nav className="space-y-1">
            <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
              Navigation
            </p>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive = item.path === '/revendeur'
                ? location.pathname === '/revendeur'
                : location.pathname.startsWith(item.path)

              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  end={item.path === '/revendeur'}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg
                    transition-all duration-200
                    ${isActive
                      ? 'text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                  style={isActive ? { backgroundColor: ACCENT } : undefined}
                >
                  <Icon size={20} className={isActive ? 'text-white' : 'text-gray-500'} />
                  <span className="font-medium text-sm">{item.label}</span>
                  {isActive && <ChevronRight size={14} className="ml-auto text-white/60" />}
                </NavLink>
              )
            })}
          </nav>

          <div className="mt-8 pt-4" style={{ borderTop: '1px solid var(--border-light)' }}>
            <div className="px-3 text-xs" style={{ color: 'var(--text-tertiary)' }}>
              <p>Espace Revendeur v1.0</p>
              <p className="mt-1">HYPERVISUAL Switzerland</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="ml-64 pt-20 px-6 pb-6 transition-all duration-300">
        <Outlet />
      </main>
    </div>
  )
}

export default RevendeurLayout
