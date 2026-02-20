/**
 * SuperAdmin Dashboard — Apple Premium Design System
 * Story 1.5 + 2.12 — KPIs + Operations + Commercial + Finance + KPI Sidebar
 * Unified 30s polling via useRealtimeDashboard with Page Visibility API
 */

import React from 'react'
import { RefreshCw } from 'lucide-react'
import { useIsFetching } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useRealtimeDashboard } from '../../hooks/useRealtimeDashboard'

import KPIWidget from './widgets/KPIWidget'
import AlertsWidget from './widgets/AlertsWidget'
import PipelineWidget from './widgets/PipelineWidget'
import TreasuryWidget from './widgets/TreasuryWidget'
import ActiveProjectsWidget from './widgets/ActiveProjectsWidget'
import KPISidebar from './kpis/KPIWidget'
import TreasuryForecast from './kpis/TreasuryForecast'

const Dashboard = ({ selectedCompany }) => {
  const isFetching = useIsFetching()
  const { lastUpdated, isRefreshing, forceRefresh } = useRealtimeDashboard(selectedCompany)

  const lastUpdatedLabel = lastUpdated
    ? formatDistanceToNow(lastUpdated, { addSuffix: true, locale: fr })
    : ''

  return (
    <div className="space-y-6 ds-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="ds-page-title">
            Dashboard
            {isRefreshing && (
              <span
                className="inline-block ml-2 w-2 h-2 rounded-full bg-blue-500 animate-pulse align-middle"
                title="Actualisation en cours..."
              />
            )}
          </h1>
          <p className="ds-meta mt-0.5">
            Vue d'ensemble {selectedCompany && selectedCompany !== 'all' ? selectedCompany : 'toutes entreprises'}
            {lastUpdatedLabel && <span className="ml-2 text-gray-400">&middot; {lastUpdatedLabel}</span>}
          </p>
        </div>
        <button
          onClick={forceRefresh}
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
