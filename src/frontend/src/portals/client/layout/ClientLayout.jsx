/**
 * ClientLayout — Portal client layout
 * Green emerald theme, simplified sidebar for clients
 */
import React from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, FileText, FolderKanban, Receipt,
  MessageSquare, LogOut, Building2
} from 'lucide-react'
import { useClientAuth } from '../hooks/useClientAuth'

const navItems = [
  { path: '/client', label: 'Tableau de bord', icon: LayoutDashboard, end: true },
  { path: '/client/quotes', label: 'Mes devis', icon: FileText },
  { path: '/client/projects', label: 'Mes projets', icon: FolderKanban },
  { path: '/client/invoices', label: 'Mes factures', icon: Receipt },
  { path: '/client/messages', label: 'Messages', icon: MessageSquare }
]

const ClientLayout = () => {
  const { client, logout } = useClientAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/client/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/30 to-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white/80 backdrop-blur-xl border-r border-gray-200/50 flex flex-col z-30">
        {/* Logo */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">HYPERVISUAL</p>
              <p className="text-xs text-gray-500">Espace Client</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center">
              <span className="text-sm font-bold text-emerald-700">
                {client?.first_name?.[0]}{client?.last_name?.[0]}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {client?.first_name} {client?.last_name}
              </p>
              <p className="text-xs text-gray-500 truncate">{client?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={16} />
            Déconnexion
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

export default ClientLayout
