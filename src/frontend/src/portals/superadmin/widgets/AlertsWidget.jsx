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
  const companyFilter = company && company !== 'all' ? { owner_company: { _eq: company } } : {}
  const leadsCompanyFilter = company && company !== 'all' ? { company: { _eq: company } } : {}
  const now = new Date()
  const alerts = []

  try {
    const [overdueInvoices, urgentLeads, openTickets] = await Promise.all([
      // Pending invoices (potential overdue)
      api.get('/items/client_invoices', {
        params: {
          filter: {
            ...companyFilter,
            status: { _eq: 'pending' }
          },
          fields: ['id', 'invoice_number', 'client_name', 'amount', 'date_created', 'owner_company'],
          sort: ['-date_created'],
          limit: 5
        }
      }).catch(() => ({ data: { data: [] } })),

      // Urgent leads not yet won/lost
      api.get('/items/leads', {
        params: {
          filter: {
            ...leadsCompanyFilter,
            priority: { _eq: 'urgent' },
            status: { _nin: ['won', 'lost'] }
          },
          fields: ['id', 'first_name', 'last_name', 'company_name', 'estimated_value', 'date_created', 'company'],
          sort: ['-date_created'],
          limit: 5
        }
      }).catch(() => ({ data: { data: [] } })),

      // Open support tickets
      api.get('/items/support_tickets', {
        params: {
          filter: {
            ...companyFilter,
            status: { _eq: 'open' }
          },
          fields: ['id', 'ticket_number', 'subject', 'priority', 'date_created'],
          sort: ['-date_created'],
          limit: 3
        }
      }).catch(() => ({ data: { data: [] } }))
    ])

    // Build alerts from overdue invoices
    const invoiceData = overdueInvoices.data?.data || []
    invoiceData.forEach(inv => {
      const daysOld = Math.floor((now - new Date(inv.date_created)) / (1000 * 60 * 60 * 24))
      if (daysOld > 30) {
        alerts.push({
          id: `inv-${inv.id}`,
          priority: daysOld > 60 ? 'critical' : 'high',
          title: `Facture en retard: ${inv.invoice_number}`,
          description: `${inv.client_name} — ${new Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF' }).format(inv.amount || 0)} — ${daysOld}j`,
          date_created: inv.date_created
        })
      }
    })

    // Build alerts from urgent leads
    const leadData = urgentLeads.data?.data || []
    leadData.forEach(lead => {
      alerts.push({
        id: `lead-${lead.id}`,
        priority: 'high',
        title: `Lead urgent: ${lead.first_name} ${lead.last_name}`,
        description: `${lead.company_name} — ${new Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF' }).format(lead.estimated_value || 0)} estime`,
        date_created: lead.date_created
      })
    })

    // Build alerts from open tickets
    const ticketData = openTickets.data?.data || []
    ticketData.forEach(ticket => {
      alerts.push({
        id: `ticket-${ticket.id}`,
        priority: ticket.priority === 'high' ? 'high' : 'medium',
        title: `Ticket #${ticket.ticket_number}: ${ticket.subject}`,
        description: 'Support client ouvert',
        date_created: ticket.date_created
      })
    })

    // Sort by priority
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3, info: 4 }
    return alerts.sort((a, b) => (priorityOrder[a.priority] || 4) - (priorityOrder[b.priority] || 4))

  } catch {
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
      // Composite IDs (inv-xxx, lead-xxx, ticket-xxx) — dismiss locally
      return alertId
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
