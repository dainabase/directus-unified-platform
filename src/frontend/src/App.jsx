import React, { useState, useEffect, Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'react-hot-toast'
import { Loader2 } from 'lucide-react'
import queryClient from './lib/queryClient'
import { useAuthStore } from './stores/authStore'
import ProtectedRoute from './components/auth/ProtectedRoute'
import LoginPage from './pages/LoginPage'

// Layout components (kept eager — always needed)
import Sidebar from './components/layout/Sidebar'
import TopBar from './components/layout/TopBar'

// ── Loading spinner for Suspense fallback ──
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
  </div>
)

// ── Lazy-loaded portals & modules (code-split per route) ──

// SuperAdmin
const SuperAdminDashboard = lazy(() => import('./portals/superadmin/Dashboard'))

// Prestataire Portal
const PrestataireLayout = lazy(() => import('./portals/prestataire/layout/PrestataireLayout'))
const PrestataireDashboard = lazy(() => import('./portals/prestataire/Dashboard'))
const PrestatairePlaceholder = lazy(() => import('./portals/prestataire/pages/PlaceholderPage'))
const PrestataireQuotesModule = lazy(() => import('./portals/prestataire/quotes/QuotesModule'))
const PrestataireProfilePage = lazy(() => import('./portals/prestataire/profile/ProfilePage'))

// Revendeur Portal
const RevendeurLayout = lazy(() => import('./portals/revendeur/layout/RevendeurLayout'))
const RevendeurDashboard = lazy(() => import('./portals/revendeur/RevendeurDashboard'))
const RevendeurPlaceholder = lazy(() => import('./portals/revendeur/pages/PlaceholderPage'))

// Client Portal (Phase C)
const ClientAuth = lazy(() => import('./portals/client/auth/ClientAuth'))
const ClientPortalGuard = lazy(() => import('./portals/client/auth/ClientPortalGuard'))
const ClientLayout = lazy(() => import('./portals/client/layout/ClientLayout'))
const ClientDashboard = lazy(() => import('./portals/client/Dashboard'))
const ClientQuoteSignature = lazy(() => import('./portals/client/quotes/QuoteSignature'))
const ClientProjectsList = lazy(() => import('./portals/client/projects/ClientProjectsList'))
const ClientProjectTracking = lazy(() => import('./portals/client/projects/ProjectTracking'))
const ClientInvoices = lazy(() => import('./portals/client/invoices/ClientInvoices'))
const ClientMessages = lazy(() => import('./portals/client/messages/ClientMessages'))

// SuperAdmin Modules
const ProjectsModule = lazy(() => import('./portals/superadmin/projects/ProjectsModule'))
const DeliverablesModule = lazy(() => import('./portals/superadmin/deliverables/DeliverablesModule'))
const TimeTrackingModule = lazy(() => import('./portals/superadmin/time/TimeTrackingModule'))
const SubscriptionsModule = lazy(() => import('./portals/superadmin/subscriptions/SubscriptionsModule'))
const ProjectsDashboard = lazy(() => import('./portals/superadmin/projects/ProjectsDashboard'))
const HRModule = lazy(() => import('./modules/hr/HRModule'))
const TrainingsView = lazy(() => import('./modules/hr/views/TrainingsView'))

// Finance Modules
const BankingDashboard = lazy(() => import('./components/banking/BankingDashboard'))
const FinanceDashboard = lazy(() => import('./portals/superadmin/finance/FinanceDashboard'))
const CollectionDashboard = lazy(() => import('./portals/superadmin/collection/CollectionDashboard'))
const BudgetsManager = lazy(() => import('./portals/superadmin/finance/components/BudgetsManager'))
const ExpensesTracker = lazy(() => import('./portals/superadmin/finance/components/ExpensesTracker'))

// CRM Module
const CRMDashboard = lazy(() => import('./portals/superadmin/crm/CRMDashboard'))
const PipelineView = lazy(() => import('./portals/superadmin/crm/components/PipelineView'))
const CustomerSuccess = lazy(() => import('./portals/superadmin/crm/components/CustomerSuccess'))
const CRMAnalytics = lazy(() => import('./portals/superadmin/crm/CRMAnalytics'))

// Leads Module
const LeadsDashboard = lazy(() => import('./portals/superadmin/leads/LeadsDashboard'))

// Quotes Module
const QuotesModule = lazy(() => import('./portals/superadmin/quotes/QuotesModule'))
const QuoteFormPage = lazy(() => import('./portals/superadmin/quotes/QuoteForm'))

// Invoices Module
const AdminInvoicesModule = lazy(() => import('./portals/superadmin/invoices/InvoicesModule'))
const InvoiceDetailView = lazy(() => import('./portals/superadmin/invoices/InvoiceDetailView'))

// Legal Module
const LegalDashboard = lazy(() => import('./portals/superadmin/legal/LegalDashboard'))
const ContractsManager = lazy(() => import('./portals/superadmin/legal/components/ContractsManager'))
const ComplianceManager = lazy(() => import('./portals/superadmin/legal/components/ComplianceManager'))

// Marketing Module
const MarketingDashboard = lazy(() => import('./portals/superadmin/marketing/MarketingDashboard'))

// Support Module
const SupportDashboard = lazy(() => import('./portals/superadmin/support/SupportDashboard'))

// Settings Module
const SettingsDashboard = lazy(() => import('./portals/superadmin/settings/SettingsDashboard'))

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

        <Suspense fallback={<LoadingSpinner />}>
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
                  <Route path="invoices/:id" element={<InvoiceDetailView />} />
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
                  <Route path="crm/analytics" element={<CRMAnalytics selectedCompany={selectedCompany} />} />

                  {/* Devis */}
                  <Route path="quotes/new" element={<QuoteFormPage />} />
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

          {/* ── Client portal (Phase C) ── */}
          <Route path="/client/login" element={<ClientAuth />} />
          <Route path="/client" element={<ClientPortalGuard />}>
            <Route element={<ClientLayout />}>
              <Route index element={<ClientDashboard />} />
              <Route path="quotes" element={<ClientQuoteSignature />} />
              <Route path="projects" element={<ClientProjectsList />} />
              <Route path="projects/:id" element={<ClientProjectTracking />} />
              <Route path="invoices" element={<ClientInvoices />} />
              <Route path="messages" element={<ClientMessages />} />
            </Route>
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
        </Suspense>

        {import.meta.env.DEV && (
          <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
        )}
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
