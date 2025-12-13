import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../../core/store/authStore'
import { useAppStore } from '../../../core/store/appStore'
import { 
  Bell, 
  Search, 
  User, 
  LogOut, 
  ChevronDown,
  Building2,
  Sun,
  Moon,
  Command
} from 'lucide-react'

export const TopBar: React.FC = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { selectedCompany, companies, selectCompany, theme, setTheme } = useAppStore()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showCompanyMenu, setShowCompanyMenu] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  return (
    <header className="sticky top-0 z-40 h-16 bg-white border-b border-gray-200">
      <div className="flex h-full items-center justify-between px-4 lg:px-6">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          {/* Company selector */}
          <div className="relative">
            <button
              onClick={() => setShowCompanyMenu(!showCompanyMenu)}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Building2 className="h-5 w-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                {selectedCompany?.name || 'Select Company'}
              </span>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </button>
            
            {showCompanyMenu && (
              <div className="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                {companies.map((company) => (
                  <button
                    key={company.id}
                    onClick={() => {
                      selectCompany(company)
                      setShowCompanyMenu(false)
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{company.name}</p>
                        <p className="text-xs text-gray-500">{company.code}</p>
                      </div>
                      {selectedCompany?.id === company.id && (
                        <div className="h-2 w-2 bg-primary rounded-full" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Search className="h-5 w-5 text-gray-500" />
            <span className="hidden lg:block text-sm text-gray-500">Search</span>
            <kbd className="hidden lg:block px-2 py-0.5 text-xs bg-gray-100 rounded">
              <Command className="inline h-3 w-3" />K
            </kbd>
          </button>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-2">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {theme === 'light' ? (
              <Moon className="h-5 w-5 text-gray-500" />
            ) : (
              <Sun className="h-5 w-5 text-gray-500" />
            )}
          </button>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <Bell className="h-5 w-5 text-gray-500" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
          </button>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </span>
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-sm font-medium text-gray-700">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs text-gray-500">{user?.role?.name}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                <button
                  onClick={() => navigate('/settings/profile')}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors flex items-center space-x-3"
                >
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">Profile Settings</span>
                </button>
                <hr className="my-2" />
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors flex items-center space-x-3"
                >
                  <LogOut className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">Sign out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}