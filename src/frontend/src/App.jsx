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
  const [sidebarOpen, setSidebarOpen] = useState(true)
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
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(0, 0, 0, 0.8)',
            color: '#fff',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }
        }}
      />
      
      <div className="page">
      {/* Navbar Top */}
      <header className="navbar navbar-expand-md" style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        zIndex: 1000,
        height: '56px',
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div className="container-fluid">
          <button 
            className="navbar-toggler"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              padding: '8px',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Menu size={20} color="white" />
          </button>
          
          <h1 className="navbar-brand navbar-brand-autodark" style={{
            margin: 0,
            fontSize: '20px',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            DIRECTUS PLATFORM
          </h1>
          
          <div className="navbar-nav flex-row order-md-last">
            <div className="d-flex align-items-center gap-3">
              
              {/* Portal Selector */}
              <div className="dropdown">
                <button 
                  className="btn btn-sm dropdown-toggle d-flex align-items-center gap-2" 
                  type="button" 
                  data-bs-toggle="dropdown"
                  style={{
                    background: 'rgba(139, 92, 246, 0.2)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    color: 'white',
                    fontWeight: '600',
                    borderRadius: '8px',
                    padding: '8px 16px'
                  }}
                >
                  {portals[currentPortal].icon}
                  {portals[currentPortal].name}
                  <ChevronDown size={16} />
                </button>
                <ul className="dropdown-menu dropdown-menu-end" style={{
                  background: 'rgba(15, 23, 42, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  padding: '8px'
                }}>
                  {Object.entries(portals).map(([key, portal]) => (
                    <li key={key}>
                      <a 
                        className={`dropdown-item ${currentPortal === key ? 'active' : ''}`}
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          setCurrentPortal(key)
                        }}
                        style={{ 
                          color: 'white',
                          borderRadius: '8px',
                          padding: '8px 12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          background: currentPortal === key ? 'rgba(139, 92, 246, 0.2)' : 'transparent'
                        }}
                      >
                        {portal.icon} {portal.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Layout with Sidebar */}
      <div className="page-wrapper" style={{ paddingTop: '56px' }}>
        {/* Sidebar */}
        <Sidebar 
          currentPortal={currentPortal} 
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          selectedCompany={selectedCompany}
          onCompanyChange={setSelectedCompany}
        />
        
        {/* Main Content */}
        <div className="page-main" style={{
          marginLeft: sidebarOpen ? '250px' : '0',
          transition: 'margin-left 0.3s ease',
          minHeight: 'calc(100vh - 56px)'
        }}>
          <div className="page-body">
            <div className="container-fluid">
              <CurrentDashboard selectedCompany={selectedCompany} />
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}

export default App