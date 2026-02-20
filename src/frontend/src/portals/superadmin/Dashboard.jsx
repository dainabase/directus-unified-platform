/**
 * SuperAdmin Dashboard — Apple Premium Design System
 * Story 1.5 — KPIs + Operations + Commercial + Finance + KPI Sidebar
 */

import React, { useEffect } from 'react'
import { RefreshCw } from 'lucide-react'
import { useQueryClient, useIsFetching } from '@tanstack/react-query'
import useLastUpdated from '../../hooks/useLastUpdated'

import KPIWidget from './widgets/KPIWidget'
import AlertsWidget from './widgets/AlertsWidget'
import PipelineWidget from './widgets/PipelineWidget'
import TreasuryWidget from './widgets/TreasuryWidget'
import ActiveProjectsWidget from './widgets/ActiveProjectsWidget'
import KPISidebar from './kpis/KPIWidget'
import TreasuryForecast from './kpis/TreasuryForecast'

const Dashboard = ({ selectedCompany }) => {
  const queryClient = useQueryClient()
  const isFetching = useIsFetching()
  const { label: lastUpdatedLabel, markUpdated } = useLastUpdated(15_000)

  useEffect(() => {
    if (isFetching === 0) markUpdated()
  }, [isFetching, markUpdated])

  const handleRefreshAll = () => {
    queryClient.invalidateQueries({ queryKey: ['dashboard-kpis'] })
    queryClient.invalidateQueries({ queryKey: ['alerts'] })
    queryClient.invalidateQueries({ queryKey: ['pipeline'] })
    queryClient.invalidateQueries({ queryKey: ['treasury'] })
    queryClient.invalidateQueries({ queryKey: ['active-projects'] })
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
            {lastUpdatedLabel && <span className="ml-2 text-gray-400">· {lastUpdatedLabel}</span>}
          </p>
        </div>
        <button
          onClick={handleRefreshAll}
          className="ds-btn ds-btn-ghost"
          disabled={isFetching > 0}
        >
          <RefreshCw size={14} className={isFetching > 0 ? 'animate-spin' : ''} />
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

      {/* Active Projects */}
      <ActiveProjectsWidget selectedCompany={selectedCompany} />

      {/* Treasury */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <TreasuryWidget selectedCompany={selectedCompany} />
        <TreasuryForecast selectedCompany={selectedCompany} />
      </div>
    </div>
  )
}

export default Dashboard
