import React, { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'react-hot-toast'

// Layout components
import Sidebar from './components/layout/Sidebar'
import TopBar from './components/layout/TopBar'

// Portals & Modules
import SuperAdminDashboard from './portals/superadmin/Dashboard'
import ProjectsModule from './modules/projects/ProjectsModule'
import HRModule from './modules/hr/HRModule'

// Finance Modules
import BankingDashboard from './components/banking/BankingDashboard'
import FinanceDashboard from './portals/superadmin/finance/FinanceDashboard'
import CollectionDashboard from './portals/superadmin/collection/CollectionDashboard'

// CRM Module
import CRMDashboard from './portals/superadmin/crm/CRMDashboard'

// Legal Module
import LegalDashboard from './portals/superadmin/legal/LegalDashboard'

// React Query configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      cacheTime: 1000 * 60 * 10,
      retry: 3,
      refetchOnWindowFocus: false,
      refetchOnMount: true
    }
  }
})

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
            <Route path="/superadmin/budgets" element={<ComingSoon module="Budgets" description="Gestion des budgets et prévisions financières" />} />
            <Route path="/superadmin/expenses" element={<ComingSoon module="Dépenses" description="Suivi et catégorisation des dépenses" />} />
            
            {/* === PROJETS === */}
            <Route path="/superadmin/projects" element={<ProjectsModule selectedCompany={selectedCompany} />} />
            <Route path="/superadmin/deliverables" element={<ComingSoon module="Livrables & Tâches" description="Gestion des livrables et suivi des tâches" />} />
            <Route path="/superadmin/time-tracking" element={<ComingSoon module="Time Tracking" description="Suivi du temps passé sur les projets" />} />
            
            {/* === CRM === */}
            <Route path="/superadmin/crm" element={<CRMDashboard selectedCompany={selectedCompany} />} />
            <Route path="/superadmin/crm/contacts" element={<CRMDashboard selectedCompany={selectedCompany} view="contacts" />} />
            <Route path="/superadmin/crm/companies" element={<CRMDashboard selectedCompany={selectedCompany} view="companies" />} />
            <Route path="/superadmin/crm/pipeline" element={<ComingSoon module="Pipeline Commercial" description="Gestion du pipeline de ventes (quotes, proposals)" />} />
            <Route path="/superadmin/crm/success" element={<ComingSoon module="Customer Success" description="Suivi de la satisfaction et rétention clients" />} />
            
            {/* === MARKETING === */}
            <Route path="/superadmin/marketing/calendar" element={<ComingSoon module="Calendrier Éditorial" description="Planification du contenu (Mautic integration)" />} />
            <Route path="/superadmin/marketing/campaigns" element={<ComingSoon module="Campagnes Email" description="Gestion des campagnes email via Mautic" />} />
            <Route path="/superadmin/marketing/analytics" element={<ComingSoon module="Analytics Marketing" description="Métriques et performances marketing" />} />
            <Route path="/superadmin/marketing/events" element={<ComingSoon module="Événements" description="Gestion des événements et webinaires" />} />
            
            {/* === RH === */}
            <Route path="/superadmin/hr" element={<HRModule selectedCompany={selectedCompany} />} />
            <Route path="/superadmin/hr/team" element={<HRModule selectedCompany={selectedCompany} view="team" />} />
            <Route path="/superadmin/hr/talents" element={<HRModule selectedCompany={selectedCompany} view="talents" />} />
            <Route path="/superadmin/hr/recruitment" element={<HRModule selectedCompany={selectedCompany} view="recruitment" />} />
            <Route path="/superadmin/hr/trainings" element={<ComingSoon module="Formations" description="Catalogue et suivi des formations" />} />
            <Route path="/superadmin/hr/performance" element={<HRModule selectedCompany={selectedCompany} view="performance" />} />
            
            {/* === JURIDIQUE === */}
            <Route path="/superadmin/legal" element={<LegalDashboard selectedCompany={selectedCompany} />} />
            <Route path="/superadmin/legal/contracts" element={<ComingSoon module="Contrats" description="Gestion des contrats clients et fournisseurs" />} />
            <Route path="/superadmin/legal/cgv" element={<LegalDashboard selectedCompany={selectedCompany} view="cgv" />} />
            <Route path="/superadmin/legal/compliance" element={<ComingSoon module="Compliance" description="Conformité réglementaire et audit" />} />
            
            {/* === SUPPORT === */}
            <Route path="/superadmin/support/tickets" element={<ComingSoon module="Tickets Support" description="Gestion des tickets d'assistance" />} />
            <Route path="/superadmin/support/notifications" element={<ComingSoon module="Notifications" description="Centre de notifications système" />} />
            
            {/* === PARAMÈTRES === */}
            <Route path="/superadmin/settings/companies" element={<ComingSoon module="Mes Entreprises" description="Configuration des 5 entreprises (HYPERVISUAL, DAINAMICS, LEXAIA, ENKI REALTY, TAKEOUT)" />} />
            <Route path="/superadmin/settings/users" element={<ComingSoon module="Utilisateurs" description="Gestion des utilisateurs et accès" />} />
            <Route path="/superadmin/settings/permissions" element={<ComingSoon module="Permissions" description="Rôles et permissions granulaires" />} />
            <Route path="/superadmin/settings/integrations" element={<ComingSoon module="Intégrations" description="Invoice Ninja, Revolut, Mautic, ERPNext" />} />
            
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
