/**
 * SuperAdmin Dashboard — CEO Workflow-First Layout
 * Phase C — Story C.6
 * Layout: Header → Alerts → KPIs → Pipeline+Treasury → ActiveProjects → IntegrationStatusBar
 * Apple DS v2.0 — Unified 30s polling via useRealtimeDashboard
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
import IntegrationStatusBar from './widgets/IntegrationStatusBar'

const Dashboard = ({ selectedCompany }) => {
  const isFetching = useIsFetching()
  const { lastUpdated, isRefreshing, forceRefresh } = useRealtimeDashboard(selectedCompany)

  const lastUpdatedLabel = lastUpdated
    ? formatDistanceToNow(lastUpdated, { addSuffix: true, locale: fr })
    : ''

  return (
    <div className="space-y-6 ds-fade-in">
      {/* 1. Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="ds-page-title">
            Dashboard
            {isRefreshing && (
              <span
                className="inline-block ml-2 w-2 h-2 rounded-full animate-pulse align-middle"
                style={{ background: 'var(--accent)' }}
                title="Actualisation en cours..."
              />
            )}
          </h1>
          <p className="ds-meta mt-0.5">
            Vue d'ensemble {selectedCompany && selectedCompany !== 'all' ? selectedCompany : 'toutes entreprises'}
            {lastUpdatedLabel && (
              <span style={{ marginLeft: 'var(--s2)', color: 'var(--label-3)' }}>&middot; {lastUpdatedLabel}</span>
            )}
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

      {/* 2. Actions urgentes — full width */}
      <AlertsWidget selectedCompany={selectedCompany} maxItems={5} />

      {/* 3. KPIs compacts */}
      <KPIWidget selectedCompany={selectedCompany} />

      {/* 4. Pipeline + Trésorerie — 2 colonnes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <PipelineWidget selectedCompany={selectedCompany} />
        <TreasuryWidget selectedCompany={selectedCompany} />
      </div>

      {/* 5. Projets actifs — full width */}
      <ActiveProjectsWidget selectedCompany={selectedCompany} />

      {/* 6. Statut intégrations — full width */}
      <IntegrationStatusBar />
    </div>
  )
}

export default Dashboard
