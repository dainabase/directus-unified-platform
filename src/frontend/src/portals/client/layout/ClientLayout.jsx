/**
 * ClientLayout — Portal client layout — Apple Premium DS
 * Blue accent (#0071E3), ds-glass sidebar
 */
import React from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, FileText, FolderKanban, Receipt,
  MessageSquare, LogOut, Building2, FolderOpen, CreditCard,
  FileCheck, LifeBuoy, User
} from 'lucide-react'
import { useClientAuth } from '../hooks/useClientAuth'

const navItems = [
  { path: '/client', label: 'Tableau de bord', icon: LayoutDashboard, end: true },
  { path: '/client/projects', label: 'Mes projets', icon: FolderOpen },
  { path: '/client/documents', label: 'Documents', icon: FileText },
  { path: '/client/finances', label: 'Finances', icon: CreditCard },
  { path: '/client/quotes', label: 'Devis', icon: FileCheck },
  { path: '/client/support', label: 'Support', icon: LifeBuoy },
  { path: '/client/profile', label: 'Mon profil', icon: User }
]

const ClientLayout = () => {
  const { client, logout } = useClientAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/client/login')
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 ds-glass flex flex-col z-30" style={{ borderRight: '1px solid var(--border-light)' }}>
        {/* Logo */}
        <div className="p-6" style={{ borderBottom: '1px solid var(--border-light)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0071E3] flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>HYPERVISUAL</p>
              <p className="ds-meta">Espace Client</p>
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
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
              style={({ isActive }) => ({
                background: isActive ? 'var(--accent-light)' : 'transparent',
                color: isActive ? 'var(--accent)' : 'var(--text-secondary)'
              })}
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="p-4" style={{ borderTop: '1px solid var(--border-light)' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-sm font-bold text-blue-700">
                {client?.first_name?.[0]}{client?.last_name?.[0]}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                {client?.first_name} {client?.last_name}
              </p>
              <p className="ds-meta truncate">{client?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition-colors duration-150"
            style={{ color: 'var(--text-secondary)' }}
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

export default ClientLayout
