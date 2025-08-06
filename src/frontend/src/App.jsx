import React, { useState } from 'react'
import Sidebar from './components/layout/Sidebar'
import SuperAdminDashboard from './portals/superadmin/DashboardV3'
import ClientDashboard from './portals/client/Dashboard'
import PrestataireDashboard from './portals/prestataire/Dashboard'
import RevendeurDashboard from './portals/revendeur/Dashboard'
import { Toaster } from 'react-hot-toast'
import { 
  Shield, User, Briefcase, ShoppingCart,
  Building2, ChevronDown, Menu
} from 'lucide-react'

function App() {
  const [currentPortal, setCurrentPortal] = useState('superadmin')
  const [selectedCompany, setSelectedCompany] = useState('all')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const portals = {
    superadmin: { 
      name: 'SuperAdmin', 
      icon: <Shield size={18} />, 
      component: SuperAdminDashboard 
    },
    client: { 
      name: 'Client', 
      icon: <User size={18} />, 
      component: ClientDashboard 
    },
    prestataire: { 
      name: 'Prestataire', 
      icon: <Briefcase size={18} />, 
      component: PrestataireDashboard 
    },
    revendeur: { 
      name: 'Revendeur', 
      icon: <ShoppingCart size={18} />, 
      component: RevendeurDashboard 
    }
  }


  const CurrentDashboard = portals[currentPortal].component

  return (
    <>
      <Toaster position="top-right" />
      
      {/* UN SEUL Sidebar */}
      <Sidebar 
        currentPortal={currentPortal} 
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        selectedCompany={selectedCompany}
        onCompanyChange={setSelectedCompany}
      />
      
      {/* Main Content avec margin correct */}
      <main 
        style={{ 
          marginLeft: sidebarCollapsed ? '80px' : '260px',
          transition: 'margin-left 0.3s',
          padding: '32px',
          minHeight: '100vh',
          background: 'transparent' // Pas de fond, on voit le gradient du body
        }}
      >
        <CurrentDashboard selectedCompany={selectedCompany} />
      </main>
    </>
  )
}

export default App