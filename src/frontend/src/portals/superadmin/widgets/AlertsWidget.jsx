/**
 * AlertsWidget — S-01-04
 * Real-time alerts & priority actions from Directus.
 * Falls back gracefully if Directus is unreachable.
 */

import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  AlertCircle, AlertTriangle, Clock, CreditCard,
  ChevronRight, Check, Loader2, Bell
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import api from '../../../lib/axios'

const PRIORITY_CONFIG = {
  critical: { icon: AlertCircle, bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', dot: 'bg-red-500' },
  high: { icon: AlertTriangle, bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', dot: 'bg-orange-500' },
  medium: { icon: Clock, bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  low: { icon: Bell, bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', dot: 'bg-blue-500' },
  info: { icon: Bell, bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-600', dot: 'bg-gray-400' }
}

const fetchAlerts = async (company) => {
  const params = {
    filter: { status: { _eq: 'active' } },
    sort: ['-priority', '-date_created'],
    limit: 10
  }
  if (company && company !== 'all') {
    params.filter.owner_company = { _eq: company }
  }

  try {
    const { data } = await api.get('/items/dashboard_kpis', { params })
    return data?.data || []
  } catch {
    // Fallback: return empty array — widget shows "no alerts"
    return []
  }
}

const AlertsWidget = ({ selectedCompany, maxItems = 5 }) => {
  const queryClient = useQueryClient()

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['alerts', selectedCompany],
    queryFn: () => fetchAlerts(selectedCompany),
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60 // 1 minute
  })

  const dismissMutation = useMutation({
    mutationFn: async (alertId) => {
      await api.patch(`/items/dashboard_kpis/${alertId}`, { status: 'dismissed' })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
    }
  })

  const displayAlerts = alerts.slice(0, maxItems)

  if (isLoading) {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Alertes</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 glass-skeleton rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
            Alertes & Actions
          </h3>
        </div>
        {alerts.length > 0 && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
            {alerts.length}
          </span>
        )}
      </div>

      {displayAlerts.length === 0 ? (
        <div className="text-center py-6 text-gray-400">
          <Check className="w-8 h-8 mx-auto mb-2 text-green-500" />
          <p className="text-sm">Aucune alerte active</p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayAlerts.map((alert) => {
            const priority = alert.priority || 'info'
            const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.info
            const Icon = config.icon

            return (
              <div
                key={alert.id}
                className={`flex items-start gap-3 p-3 rounded-lg border ${config.bg} ${config.border} group`}
              >
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${config.dot}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${config.text}`}>
                    {alert.title || alert.message || alert.name}
                  </p>
                  {alert.description && (
                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                      {alert.description}
                    </p>
                  )}
                  {alert.date_created && (
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDistanceToNow(new Date(alert.date_created), { addSuffix: true, locale: fr })}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => dismissMutation.mutate(alert.id)}
                  disabled={dismissMutation.isPending}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/50 transition-all"
                  title="Marquer comme lu"
                >
                  {dismissMutation.isPending ? (
                    <Loader2 size={14} className="animate-spin text-gray-400" />
                  ) : (
                    <Check size={14} className="text-gray-400" />
                  )}
                </button>
              </div>
            )
          })}
        </div>
      )}

      {alerts.length > maxItems && (
        <button className="mt-3 flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium">
          Voir les {alerts.length - maxItems} autres
          <ChevronRight size={14} />
        </button>
      )}
    </div>
  )
}

export default AlertsWidget
