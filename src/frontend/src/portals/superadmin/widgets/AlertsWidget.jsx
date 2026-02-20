/**
 * AlertsWidget — S-01-04 — Apple Premium Design System
 * Real-time alerts & priority actions from Directus.
 */

import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  AlertCircle, AlertTriangle, Clock, CreditCard,
  ChevronRight, Check, Loader2, Bell, ExternalLink
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import api from '../../../lib/axios'

const PRIORITY_CONFIG = {
  critical: { icon: AlertCircle, bg: 'var(--danger-light)', border: 'var(--danger)', text: 'var(--danger)', dot: 'var(--danger)' },
  high:     { icon: AlertTriangle, bg: 'var(--warning-light)', border: 'var(--warning)', text: 'var(--warning)', dot: 'var(--warning)' },
  medium:   { icon: Clock, bg: 'rgba(0,0,0,0.04)', border: 'var(--border-light)', text: 'var(--text-secondary)', dot: 'var(--text-tertiary)' },
  low:      { icon: Bell, bg: 'var(--accent-light)', border: 'var(--accent)', text: 'var(--accent)', dot: 'var(--accent)' },
  info:     { icon: Bell, bg: 'rgba(0,0,0,0.03)', border: 'var(--border-light)', text: 'var(--text-secondary)', dot: 'var(--text-tertiary)' }
}

const CHF = (value) =>
  new Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF' }).format(value || 0)

const fetchAlerts = async (company) => {
  const companyFilter = company && company !== 'all' ? { owner_company: { _eq: company } } : {}
  const leadsCompanyFilter = company && company !== 'all' ? { company: { _eq: company } } : {}
  const now = new Date()
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString()
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString()
  const alerts = []

  try {
    const [
      overdueInvoices, urgentLeads, openTickets, expiringQuotes, depositPendingProjects,
      pendingPayments, inactiveProjects, unfollowedLeads
    ] = await Promise.all([
      // Factures en retard (due_date depasse de > 7 jours)
      api.get('/items/client_invoices', {
        params: {
          filter: { ...companyFilter, status: { _in: ['sent', 'pending'] }, due_date: { _lt: sevenDaysAgo } },
          fields: ['id', 'invoice_number', 'client_name', 'amount', 'due_date', 'date_created', 'owner_company'],
          sort: ['due_date'],
          limit: 20
        }
      }).catch(() => ({ data: { data: [] } })),

      api.get('/items/leads', {
        params: {
          filter: { ...leadsCompanyFilter, priority: { _eq: 'urgent' }, status: { _nin: ['won', 'lost'] } },
          fields: ['id', 'first_name', 'last_name', 'company_name', 'estimated_value', 'date_created', 'company'],
          sort: ['-date_created'],
          limit: 5
        }
      }).catch(() => ({ data: { data: [] } })),

      api.get('/items/support_tickets', {
        params: {
          filter: { ...companyFilter, status: { _eq: 'open' } },
          fields: ['id', 'ticket_number', 'subject', 'priority', 'date_created'],
          sort: ['-date_created'],
          limit: 3
        }
      }).catch(() => ({ data: { data: [] } })),

      api.get('/items/quotes', {
        params: {
          filter: { ...companyFilter, status: { _eq: 'sent' }, valid_until: { _lte: sevenDaysFromNow.toISOString().slice(0, 10) } },
          fields: ['id', 'quote_number', 'client_name', 'total', 'valid_until'],
          limit: 5
        }
      }).catch(() => ({ data: { data: [] } })),

      api.get('/items/projects', {
        params: {
          filter: { ...companyFilter, status: { _eq: 'deposit_pending' } },
          fields: ['id', 'name', 'total_revenue', 'date_created'],
          limit: 5
        }
      }).catch(() => ({ data: { data: [] } })),

      // Paiements en attente > 48h
      api.get('/items/payments', {
        params: {
          filter: { ...companyFilter, status: { _eq: 'pending' }, date_created: { _lt: twoDaysAgo } },
          fields: ['id', 'reference', 'amount', 'date_created'],
          sort: ['date_created'],
          limit: 10
        }
      }).catch(() => ({ data: { data: [] } })),

      // Projets sans activite depuis 7 jours
      api.get('/items/projects', {
        params: {
          filter: { ...companyFilter, status: { _in: ['active', 'in_progress'] }, date_updated: { _lt: sevenDaysAgo } },
          fields: ['id', 'name', 'date_updated'],
          sort: ['date_updated'],
          limit: 10
        }
      }).catch(() => ({ data: { data: [] } })),

      // Leads sans suivi depuis 3 jours
      api.get('/items/leads', {
        params: {
          filter: { ...leadsCompanyFilter, status: { _eq: 'new' }, date_updated: { _lt: threeDaysAgo } },
          fields: ['id', 'first_name', 'last_name', 'date_updated', 'date_created'],
          sort: ['date_updated'],
          limit: 10
        }
      }).catch(() => ({ data: { data: [] } }))
    ])

    // --- Factures en retard (due_date based) ---
    const invoiceData = overdueInvoices.data?.data || []
    if (invoiceData.length > 0) {
      const totalAmount = invoiceData.reduce((sum, inv) => sum + (inv.amount || 0), 0)
      const maxDaysOverdue = Math.max(...invoiceData.map(inv => {
        const dueDate = inv.due_date ? new Date(inv.due_date) : new Date(inv.date_created)
        return Math.floor((now - dueDate) / (1000 * 60 * 60 * 24))
      }))
      alerts.push({
        id: 'inv-overdue-summary',
        priority: maxDaysOverdue > 30 ? 'critical' : 'high',
        title: `${invoiceData.length} facture(s) en retard — Total ${CHF(totalAmount)}`,
        description: `Retard max: ${maxDaysOverdue}j — ${invoiceData.map(i => i.invoice_number).slice(0, 3).join(', ')}${invoiceData.length > 3 ? '...' : ''}`,
        date_created: invoiceData[0]?.due_date || invoiceData[0]?.date_created,
        action: { label: 'Voir factures', path: '/superadmin/finance/invoices' }
      })
    }

    // --- Leads urgents ---
    const leadData = urgentLeads.data?.data || []
    leadData.forEach(lead => {
      alerts.push({
        id: `lead-${lead.id}`,
        priority: 'high',
        title: `Lead urgent: ${lead.first_name} ${lead.last_name}`,
        description: `${lead.company_name} — ${CHF(lead.estimated_value)} estime`,
        date_created: lead.date_created,
        action: { label: 'Voir lead', path: '/superadmin/leads' }
      })
    })

    // --- Tickets support ---
    const ticketData = openTickets.data?.data || []
    ticketData.forEach(ticket => {
      alerts.push({
        id: `ticket-${ticket.id}`,
        priority: ticket.priority === 'high' ? 'high' : 'medium',
        title: `Ticket #${ticket.ticket_number}: ${ticket.subject}`,
        description: 'Support client ouvert',
        date_created: ticket.date_created,
        action: { label: 'Voir ticket', path: '/superadmin/support' }
      })
    })

    // --- Devis expirants ---
    const quoteData = expiringQuotes.data?.data || []
    quoteData.forEach(quote => {
      const validUntil = new Date(quote.valid_until)
      const daysLeft = Math.ceil((validUntil - now) / (1000 * 60 * 60 * 24))
      const isExpired = daysLeft < 0
      alerts.push({
        id: `quote-${quote.id}`,
        priority: isExpired ? 'high' : 'medium',
        title: isExpired ? `Devis expire: ${quote.quote_number}` : `Devis expire bientot: ${quote.quote_number}`,
        description: `${quote.client_name || 'Client'} — ${CHF(quote.total)} — ${
          isExpired ? 'expire depuis ' + Math.abs(daysLeft) + 'j' : daysLeft + 'j restants'
        }`,
        date_created: quote.valid_until,
        action: { label: 'Voir devis', path: '/superadmin/quotes' }
      })
    })

    // --- Projets en attente d'acompte ---
    const projectData = depositPendingProjects.data?.data || []
    projectData.forEach(project => {
      alerts.push({
        id: `project-${project.id}`,
        priority: 'medium',
        title: `Acompte en attente: ${project.name}`,
        description: `Montant projet: ${CHF(project.total_revenue)}`,
        date_created: project.date_created,
        action: { label: 'Voir projet', path: '/superadmin/projects' }
      })
    })

    // --- Paiements en attente > 48h ---
    const paymentData = pendingPayments.data?.data || []
    paymentData.forEach(payment => {
      alerts.push({
        id: `pay-${payment.id}`,
        priority: 'high',
        title: `Paiement en attente: ${payment.reference || `#${payment.id}`}`,
        description: `${CHF(payment.amount)} — en attente depuis ${formatDistanceToNow(new Date(payment.date_created), { locale: fr })}`,
        date_created: payment.date_created,
        action: { label: 'Voir paiement', path: '/superadmin/finance/banking' }
      })
    })

    // --- Projets sans activite depuis 7 jours ---
    const inactiveProjectData = inactiveProjects.data?.data || []
    inactiveProjectData.forEach(project => {
      alerts.push({
        id: `proj-inactive-${project.id}`,
        priority: 'medium',
        title: `Projet sans MAJ: ${project.name}`,
        description: `Derniere MAJ: ${formatDistanceToNow(new Date(project.date_updated), { addSuffix: true, locale: fr })}`,
        date_created: project.date_updated,
        action: { label: 'Voir projet', path: '/superadmin/projects' }
      })
    })

    // --- Leads sans suivi depuis 3 jours ---
    const unfollowedLeadData = unfollowedLeads.data?.data || []
    unfollowedLeadData.forEach(lead => {
      alerts.push({
        id: `lead-nofollow-${lead.id}`,
        priority: 'low',
        title: `Lead sans suivi: ${lead.first_name} ${lead.last_name}`,
        description: `Aucun suivi depuis ${formatDistanceToNow(new Date(lead.date_updated), { locale: fr })}`,
        date_created: lead.date_updated || lead.date_created,
        action: { label: 'Voir lead', path: '/superadmin/leads' }
      })
    })

    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3, info: 4 }
    return alerts.sort((a, b) => (priorityOrder[a.priority] || 4) - (priorityOrder[b.priority] || 4))

  } catch {
    return []
  }
}

const AlertsWidget = ({ selectedCompany, maxItems = 5 }) => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['alerts', selectedCompany],
    queryFn: () => fetchAlerts(selectedCompany),
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60
  })

  const dismissMutation = useMutation({
    mutationFn: async (alertId) => alertId,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
    }
  })

  const displayAlerts = alerts.slice(0, maxItems)

  if (isLoading) {
    return (
      <div className="ds-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle size={16} style={{ color: 'var(--danger)' }} />
          <span className="ds-card-title">Alertes</span>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="ds-skeleton h-14 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="ds-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertCircle size={16} style={{ color: 'var(--danger)' }} />
          <span className="ds-card-title">Alertes & Actions</span>
        </div>
        {alerts.length > 0 && (
          <span className="ds-badge ds-badge-danger">{alerts.length}</span>
        )}
      </div>

      {displayAlerts.length === 0 ? (
        <div className="text-center py-8">
          <Check size={24} style={{ color: 'var(--success)', margin: '0 auto 8px' }} />
          <p className="ds-meta">Aucune alerte active</p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayAlerts.map((alert) => {
            const priority = alert.priority || 'info'
            const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.info

            return (
              <div
                key={alert.id}
                className="flex items-start gap-3 p-3 rounded-lg group transition-colors duration-150"
                style={{
                  background: config.bg,
                  border: `1px solid ${config.border}`,
                  borderColor: priority === 'critical' || priority === 'high'
                    ? `color-mix(in srgb, ${config.border} 30%, transparent)`
                    : 'var(--border-light)'
                }}
              >
                <span
                  className="inline-block rounded-full mt-1.5 shrink-0"
                  style={{ width: 6, height: 6, background: config.dot }}
                />
                <div className="flex-1 min-w-0">
                  <p className="ds-body" style={{ fontWeight: 500, color: config.text, fontSize: 13 }}>
                    {alert.title || alert.message || alert.name}
                  </p>
                  {alert.description && (
                    <p className="ds-meta mt-0.5 truncate">{alert.description}</p>
                  )}
                  {alert.date_created && (
                    <p className="ds-meta mt-1" style={{ fontSize: 11 }}>
                      {formatDistanceToNow(new Date(alert.date_created), { addSuffix: true, locale: fr })}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {alert.action && (
                    <button
                      onClick={() => navigate(alert.action.path)}
                      className="ds-btn ds-btn-ghost !py-1 !px-2"
                      style={{ fontSize: 11 }}
                    >
                      {alert.action.label}
                      <ExternalLink size={10} />
                    </button>
                  )}
                  <button
                    onClick={() => dismissMutation.mutate(alert.id)}
                    disabled={dismissMutation.isPending}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-md transition-all duration-150"
                    style={{ color: 'var(--text-tertiary)' }}
                    title="Marquer comme lu"
                  >
                    {dismissMutation.isPending ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Check size={12} />
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {alerts.length > maxItems && (
        <button
          className="mt-3 flex items-center gap-1 ds-meta"
          style={{ color: 'var(--accent)', fontWeight: 500 }}
        >
          Voir les {alerts.length - maxItems} autres
          <ChevronRight size={12} />
        </button>
      )}
    </div>
  )
}

export default AlertsWidget
