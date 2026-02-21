import React, { useState, useEffect, Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'react-hot-toast'
import { Loader2 } from 'lucide-react'
import queryClient from './lib/queryClient'
import { useAuthStore } from './stores/authStore'
import ProtectedRoute from './components/auth/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'
import LoginPage from './pages/LoginPage'

// Layout components (kept eager — always needed)
import Sidebar from './components/layout/Sidebar'
import TopBar from './components/layout/TopBar'

// ── Loading spinner for Suspense fallback ──
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent, #0071E3)' }} />
  </div>
)

// ── Lazy-loaded portals & modules (code-split per route) ──

// SuperAdmin
const SuperAdminDashboard = lazy(() => import('./portals/superadmin/Dashboard'))

// Prestataire Portal (Phase D)
const ProviderAuth = lazy(() => import('./portals/prestataire/auth/ProviderAuth'))
const ProviderPortalGuard = lazy(() => import('./portals/prestataire/auth/ProviderPortalGuard'))
const PrestataireLayout = lazy(() => import('./portals/prestataire/layout/PrestataireLayout'))
const PrestataireDashboard = lazy(() => import('./portals/prestataire/Dashboard'))
const QuoteRequests = lazy(() => import('./portals/prestataire/quotes/QuoteRequests'))
const PurchaseOrders = lazy(() => import('./portals/prestataire/orders/PurchaseOrders'))
const ProviderInvoices = lazy(() => import('./portals/prestataire/invoices/ProviderInvoices'))
const ProviderCalendar = lazy(() => import('./portals/prestataire/calendar/CalendarPage'))
const ProviderMissions = lazy(() => import('./portals/prestataire/missions/MissionsListPage'))
const ProviderMissionDetail = lazy(() => import('./portals/prestataire/missions/MissionDetailPage'))
const ProviderTasks = lazy(() => import('./portals/prestataire/tasks/TasksPage'))
const ProviderMessages = lazy(() => import('./portals/prestataire/messages/MessagesPage'))
const ProviderKnowledgeBase = lazy(() => import('./portals/prestataire/knowledge/KnowledgeBasePage'))
const ProviderKnowledgeArticle = lazy(() => import('./portals/prestataire/knowledge/KnowledgeArticlePage'))
const ProviderProfile = lazy(() => import('./portals/prestataire/profile/ProfilePage'))
const ProviderUploadInvoice = lazy(() => import('./portals/prestataire/invoices/UploadInvoicePage'))

// Revendeur Portal (Phase 5)
const RevendeurLayout = lazy(() => import('./portals/revendeur/layout/RevendeurLayout'))
const RevendeurDashboard = lazy(() => import('./portals/revendeur/RevendeurDashboard'))
const PipelineRevendeur = lazy(() => import('./portals/revendeur/PipelineRevendeur'))
const LeadsRevendeur = lazy(() => import('./portals/revendeur/LeadsRevendeur'))
const ClientsRevendeur = lazy(() => import('./portals/revendeur/ClientsRevendeur'))
const ClientDetailRevendeur = lazy(() => import('./portals/revendeur/ClientDetailRevendeur'))
const CommissionsRevendeur = lazy(() => import('./portals/revendeur/CommissionsRevendeur'))
const DevisRevendeur = lazy(() => import('./portals/revendeur/DevisRevendeur'))
const MarketingRevendeur = lazy(() => import('./portals/revendeur/MarketingRevendeur'))
const RapportsRevendeur = lazy(() => import('./portals/revendeur/RapportsRevendeur'))

// Client Portal (Phase 6)
const ClientAuth = lazy(() => import('./portals/client/auth/ClientAuth'))
const ClientPortalGuard = lazy(() => import('./portals/client/auth/ClientPortalGuard'))
const ClientLayout = lazy(() => import('./portals/client/layout/ClientLayout'))
const ClientDashboard = lazy(() => import('./portals/client/Dashboard'))
const ClientQuoteSignature = lazy(() => import('./portals/client/quotes/QuoteSignature'))
const ClientSignaturePage = lazy(() => import('./portals/client/pages/SignaturePage'))
const ClientProjectsList = lazy(() => import('./portals/client/projects/ClientProjectsList'))
const ClientProjectTracking = lazy(() => import('./portals/client/projects/ProjectTracking'))
const ClientInvoices = lazy(() => import('./portals/client/invoices/ClientInvoices'))
const ClientMessages = lazy(() => import('./portals/client/messages/ClientMessages'))
const ClientDocuments = lazy(() => import('./portals/client/pages/DocumentsClient'))
const ClientFinances = lazy(() => import('./portals/client/pages/FinancesClient'))
const ClientPayment = lazy(() => import('./portals/client/pages/PaymentView'))
const ClientSupport = lazy(() => import('./portals/client/pages/SupportClient'))
const ClientProfile = lazy(() => import('./portals/client/pages/ProfilClient'))
const ClientProjectActivated = lazy(() => import('./portals/client/pages/ProjectActivatedPage'))

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
const ReconciliationDashboard = lazy(() => import('./components/banking/ReconciliationDashboard'))
const FinanceDashboard = lazy(() => import('./portals/superadmin/finance/FinanceDashboard'))
const CollectionDashboard = lazy(() => import('./portals/superadmin/collection/CollectionDashboard'))
const BudgetsManager = lazy(() => import('./portals/superadmin/finance/components/BudgetsManager'))
const ExpensesTracker = lazy(() => import('./portals/superadmin/finance/components/ExpensesTracker'))

// Phase 3 — Finance Complète
const FinanceDashboardPage = lazy(() => import('./portals/superadmin/finance/FinanceDashboardPage'))
const InvoicesPage = lazy(() => import('./portals/superadmin/finance/components/InvoicesPage'))
const InvoiceDetail = lazy(() => import('./portals/superadmin/finance/components/InvoiceDetail'))
const InvoiceForm = lazy(() => import('./portals/superadmin/finance/components/InvoiceForm'))
const SupplierInvoicesPage = lazy(() => import('./portals/superadmin/finance/SupplierInvoicesPage'))
const AccountingPage = lazy(() => import('./portals/superadmin/finance/AccountingPage'))
const BankingPage = lazy(() => import('./portals/superadmin/finance/BankingPage'))
const MonthlyReportsPage = lazy(() => import('./portals/superadmin/finance/MonthlyReportsPage'))
const VATReportsPage = lazy(() => import('./portals/superadmin/finance/VATReportsPage'))
const ExpensesPage = lazy(() => import('./portals/superadmin/finance/ExpensesPage'))
const QRInvoiceGenerator = lazy(() => import('./portals/superadmin/finance/QRInvoiceGenerator'))
const MilestoneInvoicingPage = lazy(() => import('./portals/superadmin/finance/MilestoneInvoicingPage'))
const InvoiceNinjaHub = lazy(() => import('./portals/superadmin/finance/InvoiceNinjaHub'))

// CRM Module
const CRMDashboard = lazy(() => import('./portals/superadmin/crm/CRMDashboard'))
const PipelineView = lazy(() => import('./portals/superadmin/crm/components/PipelineView'))
const CustomerSuccess = lazy(() => import('./portals/superadmin/crm/components/CustomerSuccess'))
const CRMAnalytics = lazy(() => import('./portals/superadmin/crm/CRMAnalytics'))

// Leads Module
const LeadsDashboard = lazy(() => import('./portals/superadmin/leads/LeadsDashboard'))
const WhatsAppInbox = lazy(() => import('./portals/superadmin/leads/WhatsAppInbox'))

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

// Providers Module (Phase D-07)
const ProvidersModule = lazy(() => import('./portals/superadmin/providers/ProvidersModule'))

// Phase I — Finance Avancees
const MilestonesModule = lazy(() => import('./portals/superadmin/projects/MilestonesModule'))
const CreditsModule = lazy(() => import('./portals/superadmin/invoices/CreditsModule'))
const ApprovalQueue = lazy(() => import('./portals/superadmin/providers/ApprovalQueue'))

// Phase J — KPI Dashboard + Rapport CEO
const KPISidebar = lazy(() => import('./portals/superadmin/kpis/KPIWidget'))
const ThresholdConfig = lazy(() => import('./portals/superadmin/kpis/ThresholdConfig'))
const TreasuryForecast = lazy(() => import('./portals/superadmin/kpis/TreasuryForecast'))

// Phase 7 — Automation & IA
const EmailTemplates = lazy(() => import('./portals/superadmin/automation/EmailTemplates'))
const Workflows = lazy(() => import('./portals/superadmin/automation/Workflows'))
const NotificationHub = lazy(() => import('./portals/superadmin/automation/NotificationHub'))

// SuperAdmin layout wrapper (sidebar + topbar)
const SuperAdminLayout = ({ children, selectedCompany, setSelectedCompany }) => {
  return (
    <div className="min-h-screen bg-zinc-50">
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

        <ErrorBoundary>
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

                  {/* Finance — Legacy routes (backward compat) */}
                  <Route path="banking" element={<BankingDashboard selectedCompany={selectedCompany} />} />
                  <Route path="reconciliation" element={<ReconciliationDashboard selectedCompany={selectedCompany} />} />
                  <Route path="accounting" element={<FinanceDashboard selectedCompany={selectedCompany} view="accounting" />} />
                  <Route path="invoices/clients" element={<AdminInvoicesModule selectedCompany={selectedCompany} />} />
                  <Route path="invoices/:id" element={<InvoiceDetailView />} />
                  <Route path="invoices/suppliers" element={<FinanceDashboard selectedCompany={selectedCompany} view="invoices-suppliers" />} />
                  <Route path="collection" element={<CollectionDashboard selectedCompany={selectedCompany} />} />
                  <Route path="budgets" element={<BudgetsManager selectedCompany={selectedCompany} />} />
                  <Route path="expenses" element={<ExpensesTracker selectedCompany={selectedCompany} />} />

                  {/* Finance — Phase 3 routes */}
                  <Route path="finance" element={<FinanceDashboardPage selectedCompany={selectedCompany} />} />
                  <Route path="finance/invoices" element={<InvoicesPage selectedCompany={selectedCompany} />} />
                  <Route path="finance/invoices/new" element={<InvoiceForm selectedCompany={selectedCompany} />} />
                  <Route path="finance/invoices/:id" element={<InvoiceDetail selectedCompany={selectedCompany} />} />
                  <Route path="finance/invoices/:id/edit" element={<InvoiceForm selectedCompany={selectedCompany} />} />
                  <Route path="finance/suppliers" element={<SupplierInvoicesPage selectedCompany={selectedCompany} />} />
                  <Route path="finance/accounting" element={<AccountingPage selectedCompany={selectedCompany} />} />
                  <Route path="finance/banking" element={<BankingPage selectedCompany={selectedCompany} />} />
                  <Route path="finance/reports/monthly" element={<MonthlyReportsPage selectedCompany={selectedCompany} />} />
                  <Route path="finance/reports/vat" element={<VATReportsPage selectedCompany={selectedCompany} />} />
                  <Route path="finance/expenses" element={<ExpensesPage selectedCompany={selectedCompany} />} />
                  <Route path="finance/qr-invoice" element={<QRInvoiceGenerator selectedCompany={selectedCompany} />} />
                  <Route path="finance/milestones" element={<MilestoneInvoicingPage selectedCompany={selectedCompany} />} />
                  <Route path="finance/invoice-ninja" element={<InvoiceNinjaHub selectedCompany={selectedCompany} />} />

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
                  <Route path="leads/whatsapp" element={<WhatsAppInbox />} />

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

                  {/* Prestataires (Phase D-07) */}
                  <Route path="providers" element={<ProvidersModule selectedCompany={selectedCompany} />} />
                  <Route path="providers/approval" element={<ApprovalQueue selectedCompany={selectedCompany} />} />

                  {/* Phase I — Finance Avancees */}
                  <Route path="milestones" element={<MilestonesModule selectedCompany={selectedCompany} />} />
                  <Route path="invoices/credits" element={<CreditsModule selectedCompany={selectedCompany} />} />

                  {/* Phase J — KPI Dashboard + Rapport CEO */}
                  <Route path="kpis" element={<KPISidebar selectedCompany={selectedCompany} />} />
                  <Route path="kpis/thresholds" element={<ThresholdConfig selectedCompany={selectedCompany} />} />
                  <Route path="kpis/treasury" element={<TreasuryForecast selectedCompany={selectedCompany} />} />

                  {/* Phase 7 — Automation & IA */}
                  <Route path="automation/emails" element={<EmailTemplates selectedCompany={selectedCompany} />} />
                  <Route path="automation/workflows" element={<Workflows selectedCompany={selectedCompany} />} />
                  <Route path="automation/notifications" element={<NotificationHub selectedCompany={selectedCompany} />} />

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

          {/* ── Client portal (Phase 6) ── */}
          <Route path="/client/login" element={<ClientAuth />} />
          <Route path="/client" element={<ClientPortalGuard />}>
            <Route element={<ClientLayout />}>
              <Route index element={<ClientDashboard />} />
              <Route path="quotes" element={<ClientQuoteSignature />} />
              <Route path="quotes/:quoteId/sign" element={<ClientSignaturePage />} />
              <Route path="projects" element={<ClientProjectsList />} />
              <Route path="projects/:id" element={<ClientProjectTracking />} />
              <Route path="invoices" element={<ClientInvoices />} />
              <Route path="messages" element={<ClientMessages />} />
              <Route path="documents" element={<ClientDocuments />} />
              <Route path="finances" element={<ClientFinances />} />
              <Route path="payment/:invoiceId" element={<ClientPayment />} />
              <Route path="support" element={<ClientSupport />} />
              <Route path="profile" element={<ClientProfile />} />
              <Route path="project-activated/:projectId" element={<ClientProjectActivated />} />
            </Route>
          </Route>

          {/* ── Prestataire portal (Phase D) ── */}
          <Route path="/prestataire/login" element={<ProviderAuth />} />
          <Route path="/prestataire" element={<ProviderPortalGuard />}>
            <Route element={<PrestataireLayout />}>
              <Route index element={<PrestataireDashboard />} />
              <Route path="dashboard" element={<PrestataireDashboard />} />
              <Route path="quotes" element={<QuoteRequests />} />
              <Route path="orders" element={<PurchaseOrders />} />
              <Route path="invoices" element={<ProviderInvoices />} />
              <Route path="invoices/upload" element={<ProviderUploadInvoice />} />
              <Route path="calendar" element={<ProviderCalendar />} />
              <Route path="missions" element={<ProviderMissions />} />
              <Route path="missions/:id" element={<ProviderMissionDetail />} />
              <Route path="tasks" element={<ProviderTasks />} />
              <Route path="messages" element={<ProviderMessages />} />
              <Route path="knowledge" element={<ProviderKnowledgeBase />} />
              <Route path="knowledge/:id" element={<ProviderKnowledgeArticle />} />
              <Route path="profile" element={<ProviderProfile />} />
            </Route>
          </Route>

          {/* ── Revendeur portal (Phase 5) ── */}
          <Route path="/revendeur" element={
            <ProtectedRoute allowedPortals={['revendeur']}>
              <RevendeurLayout />
            </ProtectedRoute>
          }>
            <Route index element={<RevendeurDashboard />} />
            <Route path="pipeline" element={<PipelineRevendeur />} />
            <Route path="leads" element={<LeadsRevendeur />} />
            <Route path="clients" element={<ClientsRevendeur />} />
            <Route path="clients/:id" element={<ClientDetailRevendeur />} />
            <Route path="commissions" element={<CommissionsRevendeur />} />
            <Route path="devis" element={<DevisRevendeur />} />
            <Route path="marketing" element={<MarketingRevendeur />} />
            <Route path="rapports" element={<RapportsRevendeur />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/superadmin" replace />} />
        </Routes>
        </Suspense>
        </ErrorBoundary>

        {import.meta.env.DEV && (
          <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
        )}
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
