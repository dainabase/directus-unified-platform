import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'react-hot-toast'
import queryClient from './lib/queryClient'
import { useAuthStore } from './stores/authStore'

// Layout components
import Sidebar from './components/layout/Sidebar'
import TopBar from './components/layout/TopBar'

// Portals & Modules
import SuperAdminDashboard from './portals/superadmin/Dashboard'
import ProjectsModule from './modules/projects/ProjectsModule'
import TimeTrackingView from './modules/projects/views/TimeTrackingView'
import DeliverablesView from './modules/projects/views/DeliverablesView'
import HRModule from './modules/hr/HRModule'
import TrainingsView from './modules/hr/views/TrainingsView'

// Finance Modules
import BankingDashboard from './components/banking/BankingDashboard'
import FinanceDashboard from './portals/superadmin/finance/FinanceDashboard'
import CollectionDashboard from './portals/superadmin/collection/CollectionDashboard'
import BudgetsManager from './portals/superadmin/finance/components/BudgetsManager'
import ExpensesTracker from './portals/superadmin/finance/components/ExpensesTracker'

// CRM Module
import CRMDashboard from './portals/superadmin/crm/CRMDashboard'
import PipelineView from './portals/superadmin/crm/components/PipelineView'
import CustomerSuccess from './portals/superadmin/crm/components/CustomerSuccess'

// Leads Module
import LeadsDashboard from './portals/superadmin/leads/LeadsDashboard'

// Legal Module
import LegalDashboard from './portals/superadmin/legal/LegalDashboard'
import ContractsManager from './portals/superadmin/legal/components/ContractsManager'
import ComplianceManager from './portals/superadmin/legal/components/ComplianceManager'

// Marketing Module
import MarketingDashboard from './portals/superadmin/marketing/MarketingDashboard'

// Support Module
import SupportDashboard from './portals/superadmin/support/SupportDashboard'

// Settings Module
import SettingsDashboard from './portals/superadmin/settings/SettingsDashboard'

// queryClient imported from lib/queryClient.js

// Coming Soon placeholder
const ComingSoon = ({ module, description }) => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="text-center p-8 bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-200/50 shadow-lg max-w-md">
      <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        {module}
      </h2>
      <p className="text-gray-600 mb-4">
        {description || 'Ce module est en cours de développement'}
      </p>
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
        Coming Soon
      </span>
    </div>
  </div>
)

// Layout wrapper
const AppLayout = ({ children, selectedCompany, setSelectedCompany }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar />
      <TopBar
        selectedCompany={selectedCompany}
        onCompanyChange={setSelectedCompany}
      />
      <main className="ml-64 pt-20 px-6 pb-6 transition-all duration-300">
        {children}
      </main>
    </div>
  )
}

function App() {
  const [selectedCompany, setSelectedCompany] = useState('all')
  const hydrate = useAuthStore((s) => s.hydrate)

  // Hydrate auth tokens from persisted storage on mount
  useEffect(() => { hydrate() }, [hydrate])

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              borderRadius: '0.75rem',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
            }
          }}
        />
        
        <AppLayout selectedCompany={selectedCompany} setSelectedCompany={setSelectedCompany}>
          <Routes>
            {/* Dashboard */}
            <Route path="/" element={<Navigate to="/superadmin" replace />} />
            <Route path="/superadmin" element={<SuperAdminDashboard selectedCompany={selectedCompany} />} />
            
            {/* === FINANCE === */}
            <Route path="/superadmin/banking" element={<BankingDashboard selectedCompany={selectedCompany} />} />
            <Route path="/superadmin/accounting" element={<FinanceDashboard selectedCompany={selectedCompany} view="accounting" />} />
            <Route path="/superadmin/invoices/clients" element={<FinanceDashboard selectedCompany={selectedCompany} view="invoices-clients" />} />
            <Route path="/superadmin/invoices/suppliers" element={<FinanceDashboard selectedCompany={selectedCompany} view="invoices-suppliers" />} />
            <Route path="/superadmin/collection" element={<CollectionDashboard selectedCompany={selectedCompany} />} />
            <Route path="/superadmin/budgets" element={<BudgetsManager selectedCompany={selectedCompany} />} />
            <Route path="/superadmin/expenses" element={<ExpensesTracker selectedCompany={selectedCompany} />} />
            
            {/* === PROJETS === */}
            <Route path="/superadmin/projects" element={<ProjectsModule selectedCompany={selectedCompany} />} />
            <Route path="/superadmin/deliverables" element={<DeliverablesView selectedCompany={selectedCompany} />} />
            <Route path="/superadmin/time-tracking" element={<TimeTrackingView selectedCompany={selectedCompany} />} />
            
            {/* === CRM === */}
            <Route path="/superadmin/crm" element={<CRMDashboard selectedCompany={selectedCompany} />} />
            <Route path="/superadmin/crm/contacts" element={<CRMDashboard selectedCompany={selectedCompany} view="contacts" />} />
            <Route path="/superadmin/crm/companies" element={<CRMDashboard selectedCompany={selectedCompany} view="companies" />} />
            <Route path="/superadmin/crm/pipeline" element={<PipelineView selectedCompany={selectedCompany} />} />
            <Route path="/superadmin/crm/success" element={<CustomerSuccess selectedCompany={selectedCompany} />} />

            {/* === LEADS === */}
            <Route path="/superadmin/leads" element={<LeadsDashboard selectedCompany={selectedCompany} />} />
            <Route path="/superadmin/leads/kanban" element={<LeadsDashboard selectedCompany={selectedCompany} view="kanban" />} />
            <Route path="/superadmin/leads/list" element={<LeadsDashboard selectedCompany={selectedCompany} view="list" />} />
            
            {/* === MARKETING === */}
            <Route path="/superadmin/marketing" element={<MarketingDashboard selectedCompany={selectedCompany} />} />
            <Route path="/superadmin/marketing/calendar" element={<MarketingDashboard selectedCompany={selectedCompany} view="calendar" />} />
            <Route path="/superadmin/marketing/campaigns" element={<MarketingDashboard selectedCompany={selectedCompany} view="campaigns" />} />
            <Route path="/superadmin/marketing/analytics" element={<MarketingDashboard selectedCompany={selectedCompany} view="analytics" />} />
            <Route path="/superadmin/marketing/events" element={<MarketingDashboard selectedCompany={selectedCompany} view="events" />} />
            
            {/* === RH === */}
            <Route path="/superadmin/hr" element={<HRModule selectedCompany={selectedCompany} />} />
            <Route path="/superadmin/hr/team" element={<HRModule selectedCompany={selectedCompany} view="team" />} />
            <Route path="/superadmin/hr/talents" element={<HRModule selectedCompany={selectedCompany} view="talents" />} />
            <Route path="/superadmin/hr/recruitment" element={<HRModule selectedCompany={selectedCompany} view="recruitment" />} />
            <Route path="/superadmin/hr/trainings" element={<TrainingsView selectedCompany={selectedCompany} />} />
            <Route path="/superadmin/hr/performance" element={<HRModule selectedCompany={selectedCompany} view="performance" />} />
            
            {/* === JURIDIQUE === */}
            <Route path="/superadmin/legal" element={<LegalDashboard selectedCompany={selectedCompany} />} />
            <Route path="/superadmin/legal/contracts" element={<ContractsManager selectedCompany={selectedCompany} />} />
            <Route path="/superadmin/legal/cgv" element={<LegalDashboard selectedCompany={selectedCompany} view="cgv" />} />
            <Route path="/superadmin/legal/compliance" element={<ComplianceManager selectedCompany={selectedCompany} />} />
            
            {/* === SUPPORT === */}
            <Route path="/superadmin/support" element={<SupportDashboard selectedCompany={selectedCompany} />} />
            <Route path="/superadmin/support/tickets" element={<SupportDashboard selectedCompany={selectedCompany} view="tickets" />} />
            <Route path="/superadmin/support/notifications" element={<SupportDashboard selectedCompany={selectedCompany} view="notifications" />} />
            
            {/* === PARAMETRES === */}
            <Route path="/superadmin/settings" element={<SettingsDashboard selectedCompany={selectedCompany} />} />
            <Route path="/superadmin/settings/companies" element={<SettingsDashboard selectedCompany={selectedCompany} view="company" />} />
            <Route path="/superadmin/settings/users" element={<SettingsDashboard selectedCompany={selectedCompany} view="users" />} />
            <Route path="/superadmin/settings/permissions" element={<SettingsDashboard selectedCompany={selectedCompany} view="permissions" />} />
            <Route path="/superadmin/settings/integrations" element={<SettingsDashboard selectedCompany={selectedCompany} view="integrations" />} />
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/superadmin" replace />} />
          </Routes>
        </AppLayout>
        
        {import.meta.env.DEV && (
          <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
        )}
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
