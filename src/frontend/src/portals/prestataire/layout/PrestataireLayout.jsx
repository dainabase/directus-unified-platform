/**
 * PrestataireLayout — S-02-02
 * Layout complet pour le portail prestataire avec sidebar dédiée et topbar.
 * Réutilise le design glassmorphism du SuperAdmin.
 */

import React from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Receipt,
  FolderOpen,
  UserCircle,
  LogOut,
  ChevronRight
} from 'lucide-react'
import { useAuthStore } from '../../../stores/authStore'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/prestataire' },
  { id: 'missions', label: 'Missions', icon: Briefcase, path: '/prestataire/missions' },
  { id: 'quotes', label: 'Devis reçus', icon: FileText, path: '/prestataire/quotes' },
  { id: 'invoices', label: 'Factures', icon: Receipt, path: '/prestataire/invoices' },
  { id: 'documents', label: 'Documents', icon: FolderOpen, path: '/prestataire/documents' },
  { id: 'profile', label: 'Profil', icon: UserCircle, path: '/prestataire/profile' }
]

const PrestataireLayout = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  const displayName = user
    ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email
    : 'Prestataire'

  // Statut compte (actif par défaut si connecté)
  const accountStatus = user?.status === 'suspended' ? 'inactif' : 'actif'

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  // Breadcrumb basé sur la route
  const getBreadcrumb = () => {
    const item = NAV_ITEMS.find(n => location.pathname === n.path)
    return item?.label || 'Dashboard'
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
            {/* Statut compte */}
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
              accountStatus === 'actif'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {accountStatus === 'actif' ? 'Compte actif' : 'Compte inactif'}
            </span>

            {/* Utilisateur + Logout */}
            <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{displayName}</p>
                <p className="text-xs text-gray-500">Prestataire</p>
              </div>
              <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center">
                <UserCircle className="w-5 h-5 text-white" />
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                title="Déconnexion"
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
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-lg font-black text-white">P</span>
              </div>
              <div>
                <h1 className="text-sm font-bold text-gray-900">HYPERVISUAL</h1>
                <p className="text-xs text-gray-500">Portail Prestataire</p>
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
              const isActive = item.path === '/prestataire'
                ? location.pathname === '/prestataire'
                : location.pathname.startsWith(item.path)

              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  end={item.path === '/prestataire'}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg
                    transition-all duration-200
                    ${isActive
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
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
              <p>Portail Prestataire v1.0</p>
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

export default PrestataireLayout
