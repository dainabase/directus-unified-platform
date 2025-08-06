import React, { useState } from 'react'
import Sidebar from './components/layout/Sidebar'
import SuperAdminDashboard from './portals/superadmin/Dashboard'
import ClientDashboard from './portals/client/Dashboard'
import PrestataireDashboard from './portals/prestataire/Dashboard'
import RevendeurDashboard from './portals/revendeur/Dashboard'
import { Toaster } from 'react-hot-toast'

function App() {
  const [currentPortal, setCurrentPortal] = useState('superadmin')
  const [selectedCompany, setSelectedCompany] = useState('all')

  const portals = {
    superadmin: { name: 'SuperAdmin', icon: '🚀', component: SuperAdminDashboard },
    client: { name: 'Client', icon: '👤', component: ClientDashboard },
    prestataire: { name: 'Prestataire', icon: '🛠️', component: PrestataireDashboard },
    revendeur: { name: 'Revendeur', icon: '🏪', component: RevendeurDashboard }
  }

  const companies = [
    { id: 'all', name: '📊 Vue Consolidée' },
    { id: 'hypervisual', name: 'HYPERVISUAL' },
    { id: 'dainamics', name: 'DAINAMICS' },
    { id: 'lexaia', name: 'LEXAIA' },
    { id: 'enki', name: 'ENKI REALTY' },
    { id: 'takeout', name: 'TAKEOUT' }
  ]

  const CurrentDashboard = portals[currentPortal].component

  return (
    <>
      <Toaster position="top-right" />
      
      {/* Sidebar */}
      <Sidebar currentPortal={currentPortal} />
      
      {/* Header */}
      <header className="page-header">
        <div className="container-fluid">
          <div className="row align-items-center">
            <div className="col">
              <h2 className="page-title m-0">
                Dashboard {portals[currentPortal].name}
              </h2>
            </div>
            <div className="col-auto">
              <div className="d-flex align-items-center gap-3">
                {/* Company Selector */}
                <select 
                  className="form-select"
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                  style={{ minWidth: '180px' }}
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
                    className="btn btn-primary dropdown-toggle" 
                    type="button" 
                    data-bs-toggle="dropdown"
                  >
                    {portals[currentPortal].icon} {portals[currentPortal].name}
                  </button>
                  <ul className="dropdown-menu">
                    {Object.entries(portals).map(([key, portal]) => (
                      <li key={key}>
                        <a 
                          className={`dropdown-item ${currentPortal === key ? 'active' : ''}`}
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            setCurrentPortal(key)
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
        </div>
      </header>
      
      {/* Main Content */}
      <main className="page-main">
        <div className="page-body">
          <CurrentDashboard selectedCompany={selectedCompany} />
        </div>
      </main>
    </>
  )
}

export default App