/**
 * SuperAdmin Dashboard — Refactored with real widgets
 * S-01-04 to S-01-07 assembled here.
 * Layout: KPIs top → Alerts + Pipeline side-by-side → Treasury + Charts
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard SuperAdmin</h1>
          <p className="text-sm text-gray-500">
            Vue d'ensemble {selectedCompany && selectedCompany !== 'all' ? selectedCompany : 'toutes entreprises'}
          </p>
        </div>
        <button
          onClick={handleRefreshAll}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 glass-button transition-colors"
        >
          <RefreshCw size={16} />
          Actualiser
        </button>
      </div>

      {/* KPIs Row */}
      <KPIWidget selectedCompany={selectedCompany} />

      {/* Alerts + Pipeline + KPIs Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AlertsWidget selectedCompany={selectedCompany} maxItems={5} />
        <PipelineWidget selectedCompany={selectedCompany} />
        <KPISidebar selectedCompany={selectedCompany} />
      </div>

      {/* Treasury */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TreasuryWidget selectedCompany={selectedCompany} />
        <TreasuryForecast selectedCompany={selectedCompany} />
      </div>
    </div>
  )
}

export default Dashboard
