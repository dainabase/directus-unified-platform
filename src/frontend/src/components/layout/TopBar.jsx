import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Bell,
  Search,
  User,
  Building,
  ChevronDown,
  Activity,
  LogOut
} from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'

const TopBar = ({
  selectedCompany = 'all',
  onCompanyChange,
  notifications = []
}) => {
  const location = useLocation()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  const currentUser = user
    ? { name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email, role: user.role || 'SuperAdmin' }
    : { name: 'Jean-Marie Delaunay', role: 'CEO' }

  const companies = [
    { value: 'all', label: 'Toutes les entreprises' },
    { value: 'HMF Corporation SA', label: 'HMF Corporation SA' },
    { value: 'HYPERVISUAL', label: 'HYPERVISUAL' },
    { value: 'ETEKOUT', label: 'ETEKOUT' },
    { value: 'NK REALITY', label: 'NK REALITY' },
    { value: 'LEXIA', label: 'LEXIA' }
  ]

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const unreadCount = notifications.filter(n => !n.read).length

  // Breadcrumb basé sur la route
  const getBreadcrumb = () => {
    const path = location.pathname
    const segments = path.split('/').filter(Boolean)
    
    if (segments.length <= 1) return 'Dashboard'
    
    const labels = {
      'banking': 'Finance → Banking',
      'accounting': 'Finance → Comptabilité',
      'invoices': 'Finance → Factures',
      'collection': 'Finance → Recouvrement',
      'budgets': 'Finance → Budgets',
      'expenses': 'Finance → Dépenses',
      'projects': 'Projets',
      'deliverables': 'Projets → Livrables',
      'time-tracking': 'Projets → Time Tracking',
      'crm': 'CRM',
      'marketing': 'Marketing',
      'hr': 'Ressources Humaines',
      'legal': 'Juridique',
      'support': 'Support',
      'settings': 'Paramètres',
    }
    
    for (const [key, label] of Object.entries(labels)) {
      if (path.includes(key)) return label
    }
    
    return segments[segments.length - 1]
  }

  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-white/80 backdrop-blur-lg border-b border-gray-200/50 z-40">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left Section - Breadcrumb + Company Selector */}
        <div className="flex items-center gap-4">
          {/* Breadcrumb */}
          <div className="hidden lg:block">
            <span className="text-sm text-gray-500">{getBreadcrumb()}</span>
          </div>
          
          {/* Divider */}
          <div className="hidden lg:block w-px h-6 bg-gray-200"></div>
          
          {/* Company Selector */}
          <div className="flex items-center gap-2 bg-white/60 rounded-lg px-3 py-2 border border-gray-200/50">
            <Building className="w-4 h-4 text-gray-500" />
            <select
              value={selectedCompany}
              onChange={(e) => onCompanyChange(e.target.value)}
              className="bg-transparent border-none outline-none text-sm font-medium text-gray-700 cursor-pointer min-w-[180px]"
            >
              {companies.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="search"
              placeholder="Rechercher..."
              className="pl-10 pr-4 py-2 w-64 lg:w-80 bg-white/60 border border-gray-200/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* API Status */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 border border-green-200">
            <Activity className="w-3.5 h-3.5 text-green-600" />
            <span className="text-xs font-medium text-green-700">API Connected</span>
          </div>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <Bell size={20} className="text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-xs font-medium rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* User Menu */}
          <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
              <p className="text-xs text-gray-500">{currentUser.role}</p>
            </div>
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
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
  )
}

export default TopBar
