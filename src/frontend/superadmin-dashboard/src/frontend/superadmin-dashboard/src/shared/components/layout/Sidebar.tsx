import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAppStore } from '../../../core/store/appStore'
import { 
  LayoutDashboard, 
  FolderKanban, 
  DollarSign, 
  Calculator, 
  Users, 
  UserCheck, 
  Scale, 
  Gavel, 
  Megaphone, 
  HeadphonesIcon,
  Package,
  Shield,
  Workflow,
  Settings,
  ChevronLeft,
  Building2
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Projects', href: '/projects', icon: FolderKanban },
  { name: 'Finance', href: '/finance', icon: DollarSign },
  { name: 'Accounting', href: '/accounting', icon: Calculator },
  { name: 'CRM', href: '/crm', icon: Users },
  { name: 'HR', href: '/hr', icon: UserCheck },
  { name: 'Legal', href: '/legal', icon: Scale },
  { name: 'Collection', href: '/collection', icon: Gavel },
  { name: 'Marketing', href: '/marketing', icon: Megaphone },
  { name: 'Support', href: '/support', icon: HeadphonesIcon },
  { name: 'Logistics', href: '/logistics', icon: Package },
  { name: 'Compliance', href: '/compliance', icon: Shield },
  { name: 'Workflows', href: '/workflows', icon: Workflow },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export const Sidebar: React.FC = () => {
  const { sidebarOpen, toggleSidebar } = useAppStore()

  return (
    <div
      className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ${
        sidebarOpen ? 'w-64' : 'w-16'
      }`}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <Building2 className="h-8 w-8 text-primary flex-shrink-0" />
          {sidebarOpen && (
            <span className="text-xl font-bold text-gray-900">Directus</span>
          )}
        </div>
        <button
          onClick={toggleSidebar}
          className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft
            className={`h-5 w-5 text-gray-500 transition-transform ${
              !sidebarOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center px-2 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <item.icon className={`h-5 w-5 ${sidebarOpen ? 'mr-3' : ''} flex-shrink-0`} />
            {sidebarOpen && (
              <span className="text-sm font-medium">{item.name}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      {sidebarOpen && (
        <div className="p-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Version 2.0.0
          </p>
        </div>
      )}
    </div>
  )
}