/**
 * ClientLayout — S-03-01
 * Layout portail client avec sidebar verte (#059669) et topbar.
 * Reutilise le design glassmorphism des autres portails.
 */

import React from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  FileText,
  Receipt,
  CreditCard,
  FolderKanban,
  PenTool,
  LogOut,
  ChevronRight,
  UserCircle,
  HelpCircle
} from 'lucide-react'
import { useAuthStore } from '../../../stores/authStore'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard, path: '/client' },
  { id: 'projects', label: 'Mes projets', icon: FolderKanban, path: '/client/projects' },
  { id: 'quotes', label: 'Devis', icon: FileText, path: '/client/quotes' },
  { id: 'invoices', label: 'Factures', icon: Receipt, path: '/client/invoices' },
  { id: 'payments', label: 'Paiements', icon: CreditCard, path: '/client/payments' },
  { id: 'documents', label: 'Documents', icon: PenTool, path: '/client/documents' },
  { id: 'support', label: 'Support', icon: HelpCircle, path: '/client/support' }
]

const GREEN = '#059669'

const ClientLayout = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  const displayName = user
    ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email
    : 'Client'

  const companyName = user?.company_name || ''

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const getBreadcrumb = () => {
    const item = NAV_ITEMS.find(n => location.pathname === n.path)
    return item?.label || 'Tableau de bord'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Topbar */}
      <header className="fixed top-0 left-64 right-0 h-16 bg-white/80 backdrop-blur-lg border-b border-gray-200/50 z-40">
        <div className="h-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">{getBreadcrumb()}</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Utilisateur + Logout */}
            <div className="flex items-center gap-3 pl-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{displayName}</p>
                {companyName && (
                  <p className="text-xs text-gray-500">{companyName}</p>
                )}
              </div>
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${GREEN}, #047857)` }}
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
        </div>
      </header>

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-white/80 backdrop-blur-lg border-r border-gray-200/50 overflow-y-auto z-50">
        <div className="p-4">
          {/* Logo / Branding */}
          <div className="mb-6 px-3 pt-2">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
                style={{ background: `linear-gradient(135deg, ${GREEN}, #047857)` }}
              >
                <span className="text-lg font-black text-white">C</span>
              </div>
              <div>
                <h1 className="text-sm font-bold text-gray-900">HYPERVISUAL</h1>
                <p className="text-xs text-gray-500">Espace Client</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            <p className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Navigation
            </p>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive = item.path === '/client'
                ? location.pathname === '/client'
                : location.pathname.startsWith(item.path)

              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  end={item.path === '/client'}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg
                    transition-all duration-200
                    ${isActive
                      ? 'text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                  style={isActive ? { backgroundColor: GREEN } : undefined}
                >
                  <Icon size={20} className={isActive ? 'text-white' : 'text-gray-500'} />
                  <span className="font-medium text-sm">{item.label}</span>
                  {isActive && <ChevronRight size={14} className="ml-auto text-white/60" />}
                </NavLink>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="mt-8 pt-4 border-t border-gray-100">
            <div className="px-3 text-xs text-gray-400">
              <p>Espace Client v1.0</p>
              <p className="mt-1">HYPERVISUAL Switzerland</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64 pt-20 px-6 pb-6 transition-all duration-300">
        <Outlet />
      </main>
    </div>
  )
}

export default ClientLayout
