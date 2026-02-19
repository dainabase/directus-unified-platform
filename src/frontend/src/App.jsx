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
import PrestataireLayout from './portals/prestataire/layout/PrestataireLayout'
import PrestataireDashboard from './portals/prestataire/Dashboard'
import PrestatairePlaceholder from './portals/prestataire/pages/PlaceholderPage'
import PrestataireQuotesModule from './portals/prestataire/quotes/QuotesModule'
import PrestataireProfilePage from './portals/prestataire/profile/ProfilePage'

// Revendeur Portal
import RevendeurLayout from './portals/revendeur/layout/RevendeurLayout'
import RevendeurDashboard from './portals/revendeur/RevendeurDashboard'
import RevendeurPlaceholder from './portals/revendeur/pages/PlaceholderPage'

// Client Portal
import ClientLayout from './portals/client/layout/ClientLayout'
import ClientDashboard from './portals/client/Dashboard'
import ClientInvoicesModule from './portals/client/invoices/InvoicesModule'
import ClientQuotesModule from './portals/client/quotes/QuotesModule'
import ClientPlaceholder from './portals/client/pages/PlaceholderPage'
import ClientProjectsModule from './portals/client/projects/ClientProjectsModule'
import ProjectsModule from './portals/superadmin/projects/ProjectsModule'
import DeliverablesModule from './portals/superadmin/deliverables/DeliverablesModule'
import TimeTrackingModule from './portals/superadmin/time/TimeTrackingModule'
import SubscriptionsModule from './portals/superadmin/subscriptions/SubscriptionsModule'
import ProjectsDashboard from './portals/superadmin/projects/ProjectsDashboard'
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

// Quotes Module
import QuotesModule from './portals/superadmin/quotes/QuotesModule'

// Invoices Module
import AdminInvoicesModule from './portals/superadmin/invoices/InvoicesModule'

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
                  <Route path="invoices/clients" element={<AdminInvoicesModule selectedCompany={selectedCompany} />} />
                  <Route path="invoices/suppliers" element={<FinanceDashboard selectedCompany={selectedCompany} view="invoices-suppliers" />} />
                  <Route path="collection" element={<CollectionDashboard selectedCompany={selectedCompany} />} />
                  <Route path="budgets" element={<BudgetsManager selectedCompany={selectedCompany} />} />
                  <Route path="expenses" element={<ExpensesTracker selectedCompany={selectedCompany} />} />

                  {/* Projets */}
                  <Route path="projects" element={<ProjectsModule selectedCompany={selectedCompany} />} />
                  <Route path="projects/dashboard" element={<ProjectsDashboard selectedCompany={selectedCompany} />} />
                  <Route path="deliverables" element={<DeliverablesModule selectedCompany={selectedCompany} />} />
                  <Route path="time-tracking" element={<TimeTrackingModule selectedCompany={selectedCompany} />} />
                  <Route path="subscriptions" element={<SubscriptionsModule selectedCompany={selectedCompany} />} />

                  {/* CRM */}
                  <Route path="crm" element={<CRMDashboard selectedCompany={selectedCompany} />} />
                  <Route path="crm/contacts" element={<CRMDashboard selectedCompany={selectedCompany} view="contacts" />} />
                  <Route path="crm/companies" element={<CRMDashboard selectedCompany={selectedCompany} view="companies" />} />
                  <Route path="crm/pipeline" element={<PipelineView selectedCompany={selectedCompany} />} />
                  <Route path="crm/success" element={<CustomerSuccess selectedCompany={selectedCompany} />} />

                  {/* Devis */}
                  <Route path="quotes" element={<QuotesModule selectedCompany={selectedCompany} />} />

                  {/* Leads */}
                  <Route path="leads" element={<LeadsDashboard selectedCompany={selectedCompany} />} />
                  <Route path="leads/kanban" element={<LeadsDashboard selectedCompany={selectedCompany} view="kanban" />} />
                  <Route path="leads/list" element={<LeadsDashboard selectedCompany={selectedCompany} view="list" />} />

                  {/* Marketing */}
                  <Route path="marketing" element={<MarketingDashboard selectedCompany={selectedCompany} />} />
                  <Route path="marketing/campaigns" element={<MarketingDashboard selectedCompany={selectedCompany} view="campaigns" />} />
                  <Route path="marketing/whatsapp" element={<MarketingDashboard selectedCompany={selectedCompany} view="whatsapp" />} />

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

          {/* ── Client portal ── */}
          <Route path="/client" element={
            <ProtectedRoute allowedPortals={['client']}>
              <ClientLayout />
            </ProtectedRoute>
          }>
            <Route index element={<ClientDashboard />} />
            <Route path="projects" element={<ClientProjectsModule />} />
            <Route path="quotes" element={<ClientQuotesModule />} />
            <Route path="invoices" element={<ClientInvoicesModule />} />
            <Route path="payments" element={<ClientPlaceholder title="Paiements" description="Historique paiements — S-03-03" />} />
            <Route path="documents" element={<ClientPlaceholder title="Documents" description="Documents — Phase 4" />} />
            <Route path="support" element={<ClientPlaceholder title="Support" description="Support — Phase 4" />} />
          </Route>

          {/* ── Prestataire portal ── */}
          <Route path="/prestataire" element={
            <ProtectedRoute allowedPortals={['prestataire']}>
              <PrestataireLayout />
            </ProtectedRoute>
          }>
            <Route index element={<PrestataireDashboard />} />
            <Route path="dashboard" element={<PrestataireDashboard />} />
            <Route path="missions" element={<PrestatairePlaceholder title="Missions" description="Module missions — S-02-03" />} />
            <Route path="quotes" element={<PrestataireQuotesModule />} />
            <Route path="invoices" element={<PrestatairePlaceholder title="Factures" description="Module factures — Phase 3" />} />
            <Route path="documents" element={<PrestataireProfilePage />} />
            <Route path="profile" element={<PrestataireProfilePage />} />
          </Route>

          {/* ── Revendeur portal ── */}
          <Route path="/revendeur" element={
            <ProtectedRoute allowedPortals={['revendeur']}>
              <RevendeurLayout />
            </ProtectedRoute>
          }>
            <Route index element={<RevendeurDashboard />} />
            <Route path="quotes" element={<RevendeurPlaceholder title="Devis" description="Module devis revendeur — Phase 6" />} />
            <Route path="orders" element={<RevendeurPlaceholder title="Commandes" description="Module commandes — Phase 6" />} />
            <Route path="catalogue" element={<RevendeurPlaceholder title="Catalogue" description="Catalogue produits — Phase 6" />} />
            <Route path="clients" element={<RevendeurPlaceholder title="Mes Clients" description="Gestion clients — Phase 6" />} />
            <Route path="analytics" element={<RevendeurPlaceholder title="Statistiques" description="Analytiques revendeur — Phase 6" />} />
          </Route>

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
