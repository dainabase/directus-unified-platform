/**
 * SuperAdmin Dashboard — Apple Premium Design System
 * Story 1.5 — KPIs + Operations + Commercial + Finance + KPI Sidebar
 */

import React from 'react'
import { RefreshCw } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'

import KPIWidget from './widgets/KPIWidget'
import AlertsWidget from './widgets/AlertsWidget'
import PipelineWidget from './widgets/PipelineWidget'
import TreasuryWidget from './widgets/TreasuryWidget'
import KPISidebar from './kpis/KPIWidget'
import TreasuryForecast from './kpis/TreasuryForecast'

const Dashboard = ({ selectedCompany }) => {
  const queryClient = useQueryClient()

  const handleRefreshAll = () => {
    queryClient.invalidateQueries({ queryKey: ['dashboard-kpis'] })
    queryClient.invalidateQueries({ queryKey: ['alerts'] })
    queryClient.invalidateQueries({ queryKey: ['pipeline'] })
    queryClient.invalidateQueries({ queryKey: ['treasury'] })
    queryClient.invalidateQueries({ queryKey: ['kpis-latest'] })
    queryClient.invalidateQueries({ queryKey: ['treasury-forecast'] })
  }

  return (
    <div className="space-y-6 ds-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="ds-page-title">Dashboard</h1>
          <p className="ds-meta mt-0.5">
            Vue d'ensemble {selectedCompany && selectedCompany !== 'all' ? selectedCompany : 'toutes entreprises'}
          </p>
        </div>
        <button
          onClick={handleRefreshAll}
          className="ds-btn ds-btn-ghost"
        >
          <RefreshCw size={14} />
          Actualiser
        </button>
      </div>

      {/* KPIs Row */}
      <KPIWidget selectedCompany={selectedCompany} />

      {/* Operations + Pipeline + KPIs Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <AlertsWidget selectedCompany={selectedCompany} maxItems={5} />
        <PipelineWidget selectedCompany={selectedCompany} />
        <KPISidebar selectedCompany={selectedCompany} />
      </div>

      {/* Treasury */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <TreasuryWidget selectedCompany={selectedCompany} />
        <TreasuryForecast selectedCompany={selectedCompany} />
      </div>
    </div>
  )
}

export default Dashboard
