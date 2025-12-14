import React, { useState } from 'react'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

const Layout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [currentModule, setCurrentModule] = useState('dashboard')
  const [selectedCompany, setSelectedCompany] = useState('all')
  const [isDarkMode, setIsDarkMode] = useState(false)

  // Mock notifications
  const notifications = [
    { id: 1, message: 'Nouvelle facture reçue', read: false },
    { id: 2, message: 'Projet terminé avec succès', read: false },
    { id: 3, message: 'Réunion dans 30 minutes', read: true }
  ]

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'light' : 'dark')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        currentModule={currentModule}
        onModuleChange={setCurrentModule}
      />

      <TopBar
        selectedCompany={selectedCompany}
        onCompanyChange={setSelectedCompany}
        notifications={notifications}
        isDarkMode={isDarkMode}
        onThemeToggle={handleThemeToggle}
      />

      <main 
        className={`
          transition-all duration-300 ease-in-out
          ${sidebarCollapsed ? 'ml-20' : 'ml-64'}
          mt-16 p-6
        `}
      >
        {/* Pass down props to children */}
        {React.cloneElement(children, {
          currentModule,
          selectedCompany,
          sidebarCollapsed
        })}
      </main>
    </div>
  )
}

export default Layout