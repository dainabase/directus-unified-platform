import React, { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { useAppStore } from '../../../core/store/appStore'
import { useAuthStore } from '../../../core/store/authStore'

export const DashboardLayout: React.FC = () => {
  const { sidebarOpen, loadCompanies } = useAppStore()
  const { user } = useAuthStore()

  useEffect(() => {
    // Load companies when layout mounts
    if (user) {
      loadCompanies()
    }
  }, [user, loadCompanies])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:pl-64' : 'lg:pl-16'}`}>
        {/* Top bar */}
        <TopBar />
        
        {/* Page content */}
        <main className="min-h-[calc(100vh-64px)] p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}