/**
 * FinanceDashboard — S-03-06 refactor
 * Dashboard finance SuperAdmin connecte a Directus via useFinance hook.
 * Utilise Tailwind + glassmorphism au lieu de Tabler classes.
 */

import React from 'react'
import { useFinance } from '../../../hooks/useFinance'
import { KPICards } from './components/KPICards'
import { AlertsPanel } from './components/AlertsPanel'
import { CashFlowChart } from './components/CashFlowChart'
import { RecentTransactions } from './components/RecentTransactions'
import AccountingDashboard from './components/AccountingDashboard'
import SupplierInvoicesModule from './components/SupplierInvoicesModule'
import { Loader2, RefreshCw, AlertCircle } from 'lucide-react'

export function FinanceDashboard({ selectedCompany, view }) {
  // Route to sub-views if specified
  if (view === 'accounting') return <AccountingDashboard selectedCompany={selectedCompany} />
  if (view === 'invoices-suppliers') return <SupplierInvoicesModule selectedCompany={selectedCompany} />

  const company = selectedCompany === 'all' ? '' : selectedCompany

  const {
    kpis,
    alerts,
    evolution,
    transactions,
    isLoading,
    error,
    refetch
  } = useFinance(company)

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
        <h3 className="font-semibold text-red-800 mb-2">Erreur de chargement</h3>
        <p className="text-sm text-red-600 mb-4">{error.message || 'Impossible de charger les donnees finance'}</p>
        <button
          onClick={refetch}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg"
        >
          <RefreshCw size={14} /> Reessayer
        </button>
      </div>
    )
  }

  if (isLoading && !kpis) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Pole Finance</p>
          <h2 className="text-xl font-bold text-gray-900">Dashboard Finance</h2>
        </div>
        <button
          onClick={refetch}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          Actualiser
        </button>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <AlertsPanel
          alerts={alerts}
          onAction={(alert) => console.log('Alert action:', alert)}
          maxItems={5}
        />
      )}

      {/* KPIs */}
      <KPICards kpis={kpis} />

      {/* Charts + Transactions row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CashFlowChart data={evolution} height={350} />
        </div>
        <div>
          <RecentTransactions transactions={transactions} limit={8} />
        </div>
      </div>
    </div>
  )
}

export default FinanceDashboard
