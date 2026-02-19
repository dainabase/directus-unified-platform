/**
 * NotificationsCenter — S-05-NC
 * Real-time notifications built from multiple Directus collections.
 * Replaces mock data with live queries:
 *   - client_invoices (pending > 30 days = overdue alerts)
 *   - leads (urgent, not won/lost = urgent lead notifications)
 *   - support_tickets (open = open ticket notifications)
 *   - directus_activity (recent = system notifications, optional)
 *
 * Read/unread and delete actions are local state (no notifications collection in Directus).
 */

import React, { useState, useMemo, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Bell, Check, CheckCheck, Trash2, Filter, Settings,
  AlertCircle, Info, CheckCircle, AlertTriangle,
  Mail, CreditCard, Users, FileText, Calendar, ShieldAlert
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import toast from 'react-hot-toast'
import api from '../../../../lib/axios'

// ── Type and category configurations ──────────────────────────
const NOTIFICATION_TYPES = {
  alert:   { icon: AlertCircle,   bg: 'bg-red-50',    border: 'border-red-200',    text: 'text-red-700',    badge: 'bg-red-100 text-red-700',    label: 'Alerte' },
  warning: { icon: AlertTriangle, bg: 'bg-amber-50',  border: 'border-amber-200',  text: 'text-amber-700',  badge: 'bg-amber-100 text-amber-700',  label: 'Avertissement' },
  info:    { icon: Info,          bg: 'bg-blue-50',   border: 'border-blue-200',   text: 'text-blue-700',   badge: 'bg-blue-100 text-blue-700',   label: 'Information' },
  success: { icon: CheckCircle,   bg: 'bg-green-50',  border: 'border-green-200',  text: 'text-green-700',  badge: 'bg-green-100 text-green-700',  label: 'Succes' }
}

const CATEGORIES = {
  system:   { icon: Settings,    label: 'Systeme' },
  billing:  { icon: CreditCard,  label: 'Facturation' },
  crm:      { icon: Users,       label: 'CRM' },
  hr:       { icon: Users,       label: 'RH' },
  project:  { icon: FileText,    label: 'Projets' },
  security: { icon: ShieldAlert, label: 'Securite' }
}

// ── Currency formatter ────────────────────────────────────────
const formatCHF = (amount) =>
  new Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF' }).format(amount || 0)

// ── Fetch notifications from multiple Directus collections ───
const fetchNotifications = async (company) => {
  const companyFilter = company && company !== 'all'
    ? { owner_company: { _eq: company } }
    : {}
  const leadsCompanyFilter = company && company !== 'all'
    ? { company: { _eq: company } }
    : {}

  const now = new Date()
  const notifications = []

  try {
    const [overdueInvoicesRes, urgentLeadsRes, openTicketsRes, activityRes] = await Promise.all([
      // 1. Pending invoices older than 30 days -> overdue billing alerts
      api.get('/items/client_invoices', {
        params: {
          filter: {
            ...companyFilter,
            status: { _eq: 'pending' }
          },
          fields: ['id', 'invoice_number', 'client_name', 'amount', 'due_date', 'date_created', 'owner_company'],
          sort: ['-date_created'],
          limit: 50
        }
      }).catch(() => ({ data: { data: [] } })),

      // 2. Urgent leads not yet won/lost -> CRM notifications
      api.get('/items/leads', {
        params: {
          filter: {
            ...leadsCompanyFilter,
            priority: { _eq: 'urgent' },
            status: { _nin: ['won', 'lost'] }
          },
          fields: ['id', 'first_name', 'last_name', 'company_name', 'estimated_value', 'status', 'date_created', 'company'],
          sort: ['-date_created'],
          limit: 20
        }
      }).catch(() => ({ data: { data: [] } })),

      // 3. Open support tickets -> support notifications
      api.get('/items/support_tickets', {
        params: {
          filter: {
            ...companyFilter,
            status: { _eq: 'open' }
          },
          fields: ['id', 'ticket_number', 'subject', 'priority', 'category', 'date_created'],
          sort: ['-date_created'],
          limit: 20
        }
      }).catch(() => ({ data: { data: [] } })),

      // 4. Recent Directus activity -> system notifications (optional, may 403)
      api.get('/items/directus_activity', {
        params: {
          fields: ['id', 'action', 'collection', 'timestamp', 'user'],
          sort: ['-timestamp'],
          limit: 10
        }
      }).catch(() => ({ data: { data: [] } }))
    ])

    // ── Build overdue invoice notifications ──
    const invoices = overdueInvoicesRes.data?.data || []
    invoices.forEach(inv => {
      const refDate = inv.due_date || inv.date_created
      if (!refDate) return
      const daysOld = Math.floor((now - new Date(refDate)) / (1000 * 60 * 60 * 24))
      if (daysOld > 30) {
        const isCritical = daysOld > 60
        notifications.push({
          id: `inv-${inv.id}`,
          type: isCritical ? 'alert' : 'warning',
          category: 'billing',
          title: `Facture en retard: ${inv.invoice_number || `#${inv.id}`}`,
          message: `${inv.client_name || 'Client inconnu'} — ${formatCHF(inv.amount)} — ${daysOld} jours de retard`,
          read: false,
          created: inv.date_created,
          actionUrl: '/superadmin/collection'
        })
      }
    })

    // ── Build urgent lead notifications ──
    const leads = urgentLeadsRes.data?.data || []
    leads.forEach(lead => {
      const name = [lead.first_name, lead.last_name].filter(Boolean).join(' ') || 'Lead sans nom'
      notifications.push({
        id: `lead-${lead.id}`,
        type: 'warning',
        category: 'crm',
        title: `Lead urgent: ${name}`,
        message: `${lead.company_name || 'Entreprise inconnue'} — ${formatCHF(lead.estimated_value)} estime — Statut: ${lead.status || 'n/a'}`,
        read: false,
        created: lead.date_created,
        actionUrl: '/superadmin/leads'
      })
    })

    // ── Build open ticket notifications ──
    const tickets = openTicketsRes.data?.data || []
    tickets.forEach(ticket => {
      const isHighPriority = ticket.priority === 'critical' || ticket.priority === 'high'
      notifications.push({
        id: `ticket-${ticket.id}`,
        type: isHighPriority ? 'alert' : 'info',
        category: 'system',
        title: `Ticket ouvert${ticket.ticket_number ? ` #${ticket.ticket_number}` : ''}`,
        message: ticket.subject || 'Ticket de support en attente de traitement',
        read: false,
        created: ticket.date_created,
        actionUrl: '/superadmin/support'
      })
    })

    // ── Build system activity notifications ──
    const activities = activityRes.data?.data || []
    const actionLabels = {
      create: 'Creation',
      update: 'Mise a jour',
      delete: 'Suppression',
      login: 'Connexion'
    }
    activities.forEach(act => {
      const label = actionLabels[act.action] || act.action
      const collection = act.collection || 'systeme'
      notifications.push({
        id: `activity-${act.id}`,
        type: act.action === 'delete' ? 'warning' : 'info',
        category: 'system',
        title: `${label} — ${collection}`,
        message: `Activite systeme enregistree`,
        read: true,
        created: act.timestamp,
        actionUrl: null
      })
    })

    // Sort by date descending (most recent first)
    return notifications.sort((a, b) => {
      const dateA = a.created ? new Date(a.created) : new Date(0)
      const dateB = b.created ? new Date(b.created) : new Date(0)
      return dateB - dateA
    })
  } catch {
    return []
  }
}

// ── Main Component ───────────────────────────────────────────
const NotificationsCenter = ({ selectedCompany }) => {
  // Filters
  const [filterType, setFilterType] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterRead, setFilterRead] = useState('all')

  // Local state for read/delete (no notifications collection in Directus)
  const [readIds, setReadIds] = useState(new Set())
  const [deletedIds, setDeletedIds] = useState(new Set())

  // Fetch live notifications
  const { data: rawNotifications = [], isLoading } = useQuery({
    queryKey: ['notifications-center', selectedCompany],
    queryFn: () => fetchNotifications(selectedCompany),
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60
  })

  // Apply local read/delete state on top of fetched data
  const notifications = useMemo(() => {
    return rawNotifications
      .filter(n => !deletedIds.has(n.id))
      .map(n => ({
        ...n,
        read: n.read || readIds.has(n.id)
      }))
  }, [rawNotifications, readIds, deletedIds])

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      if (filterType !== 'all' && n.type !== filterType) return false
      if (filterCategory !== 'all' && n.category !== filterCategory) return false
      if (filterRead === 'unread' && n.read) return false
      if (filterRead === 'read' && !n.read) return false
      return true
    })
  }, [notifications, filterType, filterCategory, filterRead])

  // Stats
  const stats = useMemo(() => ({
    total: notifications.length,
    unread: notifications.filter(n => !n.read).length,
    alerts: notifications.filter(n => n.type === 'alert' && !n.read).length,
    warnings: notifications.filter(n => n.type === 'warning' && !n.read).length
  }), [notifications])

  // Actions
  const markAsRead = useCallback((id) => {
    setReadIds(prev => new Set(prev).add(id))
    toast.success('Notification marquee comme lue')
  }, [])

  const markAllAsRead = useCallback(() => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id)
    setReadIds(prev => {
      const next = new Set(prev)
      unreadIds.forEach(id => next.add(id))
      return next
    })
    toast.success('Toutes les notifications marquees comme lues')
  }, [notifications])

  const deleteNotification = useCallback((id) => {
    setDeletedIds(prev => new Set(prev).add(id))
    toast.success('Notification supprimee')
  }, [])

  const clearAll = useCallback(() => {
    if (!window.confirm('Supprimer toutes les notifications ?')) return
    const allIds = notifications.map(n => n.id)
    setDeletedIds(prev => {
      const next = new Set(prev)
      allIds.forEach(id => next.add(id))
      return next
    })
    toast.success('Toutes les notifications supprimees')
  }, [notifications])

  // ── Skeleton Loader ──
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Stats skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="glass-card p-4">
              <div className="glass-skeleton h-4 w-20 rounded mb-2" />
              <div className="glass-skeleton h-8 w-12 rounded" />
            </div>
          ))}
        </div>
        {/* Filters skeleton */}
        <div className="glass-card p-4">
          <div className="flex gap-3">
            <div className="glass-skeleton h-9 w-40 rounded-lg" />
            <div className="glass-skeleton h-9 w-40 rounded-lg" />
            <div className="glass-skeleton h-9 w-32 rounded-lg" />
          </div>
        </div>
        {/* Notifications skeleton */}
        <div className="glass-card p-6 space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="glass-skeleton h-20 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* ── Stats Row ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Total</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="p-2.5 bg-blue-50 rounded-lg">
              <Bell size={18} className="text-blue-600" />
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Non lues</p>
              <p className="text-2xl font-bold text-indigo-600 mt-1">{stats.unread}</p>
            </div>
            <div className="p-2.5 bg-indigo-50 rounded-lg">
              <Mail size={18} className="text-indigo-600" />
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Alertes</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{stats.alerts}</p>
            </div>
            <div className="p-2.5 bg-red-50 rounded-lg">
              <AlertCircle size={18} className="text-red-600" />
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Avertissements</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">{stats.warnings}</p>
            </div>
            <div className="p-2.5 bg-amber-50 rounded-lg">
              <AlertTriangle size={18} className="text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Filters & Actions Bar ────────────────────────────── */}
      <div className="glass-card p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <Filter size={14} />
              <span>Filtres</span>
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white/80 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tous les types</option>
              {Object.entries(NOTIFICATION_TYPES).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </select>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white/80 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Toutes les categories</option>
              {Object.entries(CATEGORIES).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </select>
            <select
              value={filterRead}
              onChange={(e) => setFilterRead(e.target.value)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white/80 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Toutes</option>
              <option value="unread">Non lues</option>
              <option value="read">Lues</option>
            </select>
          </div>

          {/* Bulk actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={markAllAsRead}
              disabled={stats.unread === 0}
              className="glass-button flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <CheckCheck size={14} />
              <span className="hidden sm:inline">Tout marquer lu</span>
            </button>
            <button
              onClick={clearAll}
              disabled={notifications.length === 0}
              className="glass-button flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Trash2 size={14} />
              <span className="hidden sm:inline">Tout supprimer</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Notifications List ────────────────────────────────── */}
      <div className="glass-card overflow-hidden">
        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Bell size={48} className="mb-3 opacity-40" />
            <p className="text-sm font-medium">Aucune notification</p>
            <p className="text-xs mt-1 text-gray-400">
              {notifications.length > 0
                ? 'Essayez de modifier les filtres'
                : 'Tout est a jour'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100/80">
            {filteredNotifications.map(notification => {
              const typeConfig = NOTIFICATION_TYPES[notification.type] || NOTIFICATION_TYPES.info
              const catConfig = CATEGORIES[notification.category] || CATEGORIES.system
              const TypeIcon = typeConfig.icon
              const CatIcon = catConfig.icon

              return (
                <div
                  key={notification.id}
                  className={`flex items-start gap-3 p-4 transition-colors group ${
                    !notification.read
                      ? 'bg-blue-50/30 hover:bg-blue-50/50'
                      : 'hover:bg-gray-50/50'
                  }`}
                >
                  {/* Icon */}
                  <div className={`flex-shrink-0 p-2 rounded-lg ${typeConfig.bg}`}>
                    <TypeIcon size={16} className={typeConfig.text} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className={`text-sm ${!notification.read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <span className="inline-flex px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500 text-white">
                            Nouveau
                          </span>
                        )}
                      </div>
                      {notification.created && (
                        <span className="flex-shrink-0 text-xs text-gray-400 whitespace-nowrap">
                          {formatDistanceToNow(new Date(notification.created), { addSuffix: true, locale: fr })}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{notification.message}</p>

                    {/* Badges + Actions */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${typeConfig.badge}`}>
                          {typeConfig.label}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          <CatIcon size={10} />
                          {catConfig.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Marquer comme lu"
                          >
                            <Check size={14} />
                          </button>
                        )}
                        {notification.actionUrl && (
                          <a
                            href={notification.actionUrl}
                            className="px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Voir le detail"
                          >
                            Voir
                          </a>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Footer with count */}
        {filteredNotifications.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100/80 bg-gray-50/30">
            <p className="text-xs text-gray-500 text-center">
              {filteredNotifications.length} notification{filteredNotifications.length > 1 ? 's' : ''}
              {filterType !== 'all' || filterCategory !== 'all' || filterRead !== 'all'
                ? ` (filtrees sur ${notifications.length} au total)`
                : ''}
            </p>
          </div>
        )}
      </div>

      {/* ── Notification Preferences ──────────────────────────── */}
      <div className="glass-card overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100/80">
          <Settings size={16} className="text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
            Preferences de notification
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Email preferences */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Mail size={14} className="text-gray-400" />
                <h4 className="text-sm font-medium text-gray-700">Notifications par email</h4>
              </div>
              <div className="space-y-3">
                {[
                  { key: 'billing', label: 'Facturation et paiements', icon: CreditCard },
                  { key: 'leads', label: 'Nouveaux leads', icon: Users },
                  { key: 'tickets', label: 'Tickets support', icon: FileText },
                  { key: 'security', label: 'Alertes securite', icon: ShieldAlert }
                ].map(item => (
                  <label key={item.key} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <item.icon size={14} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                    <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                      {item.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Push preferences */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Bell size={14} className="text-gray-400" />
                <h4 className="text-sm font-medium text-gray-700">Notifications push</h4>
              </div>
              <div className="space-y-3">
                {[
                  { key: 'urgent', label: 'Alertes urgentes uniquement', defaultOn: true },
                  { key: 'mentions', label: 'Mentions et assignations', defaultOn: true },
                  { key: 'updates', label: 'Mises a jour systeme', defaultOn: false },
                  { key: 'reminders', label: 'Rappels et echeances', defaultOn: false }
                ].map(item => (
                  <label key={item.key} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      defaultChecked={item.defaultOn}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Calendar size={14} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                    <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                      {item.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100/80">
            <button
              onClick={() => toast.success('Preferences enregistrees')}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Enregistrer les preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotificationsCenter
