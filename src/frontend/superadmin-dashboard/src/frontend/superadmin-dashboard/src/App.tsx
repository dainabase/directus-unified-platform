import React, { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './core/store/authStore'
import { LoadingScreen } from './shared/components/ui/LoadingScreen'
import { AuthLayout } from './shared/components/layout/AuthLayout'
import { DashboardLayout } from './shared/components/layout/DashboardLayout'
import { PrivateRoute } from './core/routing/PrivateRoute'

// Lazy load all modules for better performance
const LoginPage = lazy(() => import('./core/auth/pages/LoginPage'))
const DashboardPage = lazy(() => import('./modules/dashboard/pages/DashboardPage'))
const ProjectsPage = lazy(() => import('./modules/projects/pages/ProjectsPage'))
const ProjectDetailPage = lazy(() => import('./modules/projects/pages/ProjectDetailPage'))
const FinancePage = lazy(() => import('./modules/finance/pages/FinancePage'))
const InvoiceDetailPage = lazy(() => import('./modules/finance/pages/InvoiceDetailPage'))
const AccountingPage = lazy(() => import('./modules/accounting/pages/AccountingPage'))
const CRMPage = lazy(() => import('./modules/crm/pages/CRMPage'))
const ContactDetailPage = lazy(() => import('./modules/crm/pages/ContactDetailPage'))
const HRPage = lazy(() => import('./modules/hr/pages/HRPage'))
const EmployeeDetailPage = lazy(() => import('./modules/hr/pages/EmployeeDetailPage'))
const LegalPage = lazy(() => import('./modules/legal/pages/LegalPage'))
const ContractDetailPage = lazy(() => import('./modules/legal/pages/ContractDetailPage'))
const CollectionPage = lazy(() => import('./modules/collection/pages/CollectionPage'))
const MarketingPage = lazy(() => import('./modules/marketing/pages/MarketingPage'))
const SupportPage = lazy(() => import('./modules/support/pages/SupportPage'))
const LogisticsPage = lazy(() => import('./modules/logistics/pages/LogisticsPage'))
const CompliancePage = lazy(() => import('./modules/compliance/pages/CompliancePage'))
const WorkflowsPage = lazy(() => import('./modules/workflows/pages/WorkflowsPage'))
const SettingsPage = lazy(() => import('./modules/settings/pages/SettingsPage'))

function App() {
  const { isAuthenticated, isLoading } = useAuthStore()

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <Router>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          {/* Public routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" />} />
          </Route>

          {/* Protected routes */}
          <Route element={<PrivateRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              
              {/* Projects */}
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/projects/:id" element={<ProjectDetailPage />} />
              
              {/* Finance */}
              <Route path="/finance" element={<FinancePage />} />
              <Route path="/finance/invoices/:id" element={<InvoiceDetailPage />} />
              
              {/* Accounting */}
              <Route path="/accounting" element={<AccountingPage />} />
              
              {/* CRM */}
              <Route path="/crm" element={<CRMPage />} />
              <Route path="/crm/contacts/:id" element={<ContactDetailPage />} />
              
              {/* HR */}
              <Route path="/hr" element={<HRPage />} />
              <Route path="/hr/employees/:id" element={<EmployeeDetailPage />} />
              
              {/* Legal */}
              <Route path="/legal" element={<LegalPage />} />
              <Route path="/legal/contracts/:id" element={<ContractDetailPage />} />
              
              {/* Collection */}
              <Route path="/collection" element={<CollectionPage />} />
              
              {/* Marketing */}
              <Route path="/marketing" element={<MarketingPage />} />
              
              {/* Support */}
              <Route path="/support" element={<SupportPage />} />
              
              {/* Logistics */}
              <Route path="/logistics" element={<LogisticsPage />} />
              
              {/* Compliance */}
              <Route path="/compliance" element={<CompliancePage />} />
              
              {/* Workflows */}
              <Route path="/workflows" element={<WorkflowsPage />} />
              
              {/* Settings */}
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/settings/:section" element={<SettingsPage />} />
            </Route>
          </Route>

          {/* 404 */}
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Suspense>
    </Router>
  )
}

export default App