import React, { useState } from 'react'
import Sidebar from './components/layout/Sidebar'
import SuperAdminDashboard from './portals/superadmin/Dashboard'
import ClientDashboard from './portals/client/Dashboard'
import PrestataireDashboard from './portals/prestataire/Dashboard'
import RevendeurDashboard from './portals/revendeur/Dashboard'

function App() {
  const [currentPortal, setCurrentPortal] = useState('superadmin')
  const [selectedCompany, setSelectedCompany] = useState('all')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const portals = {
    superadmin: { name: 'SuperAdmin', icon: 'shield', component: SuperAdminDashboard },
    client: { name: 'Client', icon: 'user', component: ClientDashboard },
    prestataire: { name: 'Prestataire', icon: 'briefcase', component: PrestataireDashboard },
    revendeur: { name: 'Revendeur', icon: 'shopping-cart', component: RevendeurDashboard }
  }

  const companies = [
    { id: 'all', name: 'Toutes les entreprises' },
    { id: 'hypervisual', name: 'HYPERVISUAL' },
    { id: 'dainamics', name: 'DAINAMICS' },
    { id: 'lexaia', name: 'LEXAIA' },
    { id: 'enki', name: 'ENKI REALTY' },
    { id: 'takeout', name: 'TAKEOUT' }
  ]

  const CurrentDashboard = portals[currentPortal].component

  return (
    <div className="page">
      {/* Navbar Top */}
      <header className="navbar navbar-expand-md navbar-dark bg-dark" style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        zIndex: 1000,
        height: '56px'
      }}>
        <div className="container-fluid">
          <button 
            className="navbar-toggler"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          
          <h1 className="navbar-brand navbar-brand-autodark">
            DIRECTUS PLATFORM
          </h1>
          
          <div className="navbar-nav flex-row order-md-last">
            <div className="d-flex align-items-center gap-3">
              {/* Company Selector */}
              <select 
                className="form-select form-select-sm"
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                style={{ width: '180px' }}
              >
                {companies.map(company => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
              
              {/* Portal Selector */}
              <div className="dropdown">
                <button 
                  className="btn btn-primary btn-sm dropdown-toggle d-flex align-items-center gap-2" 
                  type="button" 
                  data-bs-toggle="dropdown"
                >
                  <i className={`ti ti-${portals[currentPortal].icon}`}></i>
                  {portals[currentPortal].name}
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  {Object.entries(portals).map(([key, portal]) => (
                    <li key={key}>
                      <a 
                        className={`dropdown-item ${currentPortal === key ? 'active' : ''}`}
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          setCurrentPortal(key)
                        }}
                        style={{ color: 'white' }}
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
        {sidebarOpen && (
          <aside className="navbar navbar-vertical navbar-expand-lg" style={{
            position: 'fixed',
            top: '56px',
            left: 0,
            bottom: 0,
            width: '250px',
            backgroundColor: '#1e293b',
            overflowY: 'auto',
            zIndex: 100
          }}>
            <Sidebar currentPortal={currentPortal} />
          </aside>
        )}
        
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