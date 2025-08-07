import React, { useState, useEffect } from 'react'
import Sidebar from './components/layout/Sidebar'
import SuperAdminDashboard from './portals/superadmin/EmergencyDashboard'
import ClientDashboard from './portals/client/Dashboard'
import PrestataireDashboard from './portals/prestataire/Dashboard'
import RevendeurDashboard from './portals/revendeur/Dashboard'
import { Toaster } from 'react-hot-toast'

function App() {
  const [currentPortal, setCurrentPortal] = useState('superadmin')
  const [selectedCompany, setSelectedCompany] = useState('all')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  
  // Debug log
  useEffect(() => {
    console.log('App mounted successfully')
    console.log('Current portal:', currentPortal)
    console.log('Sidebar collapsed:', sidebarCollapsed)
  }, [])

  const portals = {
    superadmin: { 
      name: 'SuperAdmin', 
      component: SuperAdminDashboard 
    },
    client: { 
      name: 'Client', 
      component: ClientDashboard 
    },
    prestataire: { 
      name: 'Prestataire', 
      component: PrestataireDashboard 
    },
    revendeur: { 
      name: 'Revendeur', 
      component: RevendeurDashboard 
    }
  }

  const CurrentDashboard = portals[currentPortal].component

  return (
    <div style={{ 
      width: '100%', 
      minHeight: '100vh', 
      position: 'relative' 
    }}>
      <Toaster position="top-right" />
      
      {/* Sidebar */}
      <Sidebar 
        currentPortal={currentPortal} 
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        selectedCompany={selectedCompany}
        onCompanyChange={setSelectedCompany}
      />
      
      {/* Main Content */}
      <main 
        style={{ 
          marginLeft: sidebarCollapsed ? '80px' : '260px',
          transition: 'margin-left 0.3s ease',
          padding: '32px',
          minHeight: '100vh',
          position: 'relative',
          zIndex: 1
        }}
      >
        <CurrentDashboard selectedCompany={selectedCompany} />
      </main>
    </div>
  )
}

export default App