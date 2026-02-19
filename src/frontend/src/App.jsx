import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'react-hot-toast'
import queryClient from './lib/queryClient'
import { useAuthStore } from './stores/authStore'
import ProtectedRoute from './components/auth/ProtectedRoute'
import LoginPage from './pages/LoginPage'

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

// SuperAdmin layout wrapper (sidebar + topbar)
const SuperAdminLayout = ({ children, selectedCompany, setSelectedCompany }) => {
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

        <Routes>
          {/* ── Public routes ── */}
          <Route path="/login" element={<LoginPage />} />

          {/* ── Root redirect ── */}
          <Route path="/" element={<Navigate to="/superadmin" replace />} />

          {/* ── SuperAdmin portal (protected) ── */}
          <Route path="/superadmin/*" element={
            <ProtectedRoute allowedPortals={['superadmin']}>
              <SuperAdminLayout selectedCompany={selectedCompany} setSelectedCompany={setSelectedCompany}>
                <Routes>
                  <Route index element={<SuperAdminDashboard selectedCompany={selectedCompany} />} />

                  {/* Finance */}
                  <Route path="banking" element={<BankingDashboard selectedCompany={selectedCompany} />} />
                  <Route path="accounting" element={<FinanceDashboard selectedCompany={selectedCompany} view="accounting" />} />
                  <Route path="invoices/clients" element={<FinanceDashboard selectedCompany={selectedCompany} view="invoices-clients" />} />
                  <Route path="invoices/suppliers" element={<FinanceDashboard selectedCompany={selectedCompany} view="invoices-suppliers" />} />
                  <Route path="collection" element={<CollectionDashboard selectedCompany={selectedCompany} />} />
                  <Route path="budgets" element={<BudgetsManager selectedCompany={selectedCompany} />} />
                  <Route path="expenses" element={<ExpensesTracker selectedCompany={selectedCompany} />} />

                  {/* Projets */}
                  <Route path="projects" element={<ProjectsModule selectedCompany={selectedCompany} />} />
                  <Route path="deliverables" element={<DeliverablesView selectedCompany={selectedCompany} />} />
                  <Route path="time-tracking" element={<TimeTrackingView selectedCompany={selectedCompany} />} />

                  {/* CRM */}
                  <Route path="crm" element={<CRMDashboard selectedCompany={selectedCompany} />} />
                  <Route path="crm/contacts" element={<CRMDashboard selectedCompany={selectedCompany} view="contacts" />} />
                  <Route path="crm/companies" element={<CRMDashboard selectedCompany={selectedCompany} view="companies" />} />
                  <Route path="crm/pipeline" element={<PipelineView selectedCompany={selectedCompany} />} />
                  <Route path="crm/success" element={<CustomerSuccess selectedCompany={selectedCompany} />} />

                  {/* Leads */}
                  <Route path="leads" element={<LeadsDashboard selectedCompany={selectedCompany} />} />
                  <Route path="leads/kanban" element={<LeadsDashboard selectedCompany={selectedCompany} view="kanban" />} />
                  <Route path="leads/list" element={<LeadsDashboard selectedCompany={selectedCompany} view="list" />} />

                  {/* Marketing */}
                  <Route path="marketing" element={<MarketingDashboard selectedCompany={selectedCompany} />} />
                  <Route path="marketing/calendar" element={<MarketingDashboard selectedCompany={selectedCompany} view="calendar" />} />
                  <Route path="marketing/campaigns" element={<MarketingDashboard selectedCompany={selectedCompany} view="campaigns" />} />
                  <Route path="marketing/analytics" element={<MarketingDashboard selectedCompany={selectedCompany} view="analytics" />} />
                  <Route path="marketing/events" element={<MarketingDashboard selectedCompany={selectedCompany} view="events" />} />

                  {/* RH */}
                  <Route path="hr" element={<HRModule selectedCompany={selectedCompany} />} />
                  <Route path="hr/team" element={<HRModule selectedCompany={selectedCompany} view="team" />} />
                  <Route path="hr/talents" element={<HRModule selectedCompany={selectedCompany} view="talents" />} />
                  <Route path="hr/recruitment" element={<HRModule selectedCompany={selectedCompany} view="recruitment" />} />
                  <Route path="hr/trainings" element={<TrainingsView selectedCompany={selectedCompany} />} />
                  <Route path="hr/performance" element={<HRModule selectedCompany={selectedCompany} view="performance" />} />

                  {/* Juridique */}
                  <Route path="legal" element={<LegalDashboard selectedCompany={selectedCompany} />} />
                  <Route path="legal/contracts" element={<ContractsManager selectedCompany={selectedCompany} />} />
                  <Route path="legal/cgv" element={<LegalDashboard selectedCompany={selectedCompany} view="cgv" />} />
                  <Route path="legal/compliance" element={<ComplianceManager selectedCompany={selectedCompany} />} />

                  {/* Support */}
                  <Route path="support" element={<SupportDashboard selectedCompany={selectedCompany} />} />
                  <Route path="support/tickets" element={<SupportDashboard selectedCompany={selectedCompany} view="tickets" />} />
                  <Route path="support/notifications" element={<SupportDashboard selectedCompany={selectedCompany} view="notifications" />} />

                  {/* Parametres */}
                  <Route path="settings" element={<SettingsDashboard selectedCompany={selectedCompany} />} />
                  <Route path="settings/companies" element={<SettingsDashboard selectedCompany={selectedCompany} view="company" />} />
                  <Route path="settings/users" element={<SettingsDashboard selectedCompany={selectedCompany} view="users" />} />
                  <Route path="settings/permissions" element={<SettingsDashboard selectedCompany={selectedCompany} view="permissions" />} />
                  <Route path="settings/integrations" element={<SettingsDashboard selectedCompany={selectedCompany} view="integrations" />} />
                </Routes>
              </SuperAdminLayout>
            </ProtectedRoute>
          } />

          {/* ── Client portal placeholder ── */}
          <Route path="/client/*" element={
            <ProtectedRoute allowedPortals={['client']}>
              <div>Client Portal — Phase 3</div>
            </ProtectedRoute>
          } />

          {/* ── Prestataire portal placeholder ── */}
          <Route path="/prestataire/*" element={
            <ProtectedRoute allowedPortals={['prestataire']}>
              <div>Prestataire Portal — Phase 2</div>
            </ProtectedRoute>
          } />

          {/* ── Revendeur portal placeholder ── */}
          <Route path="/revendeur/*" element={
            <ProtectedRoute allowedPortals={['revendeur']}>
              <div>Revendeur Portal — Phase 6</div>
            </ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/superadmin" replace />} />
        </Routes>

        {import.meta.env.DEV && (
          <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
        )}
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
