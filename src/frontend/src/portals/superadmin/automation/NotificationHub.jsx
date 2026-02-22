/**
 * NotificationHub — Story 7.8
 * Real-time notification center with SSE + polling fallback.
 * Filters by type, read/unread, date range. Mark as read.
 * Connected to Directus notifications collection.
 */

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Bell, CheckCheck, AlertCircle, DollarSign, Users, Clock,
  FolderOpen, Mail, Search, Loader2, Wifi, WifiOff, Filter,
  ChevronDown, Eye, EyeOff
} from 'lucide-react'
import { formatDistanceToNow, format, subDays } from 'date-fns'
import { fr } from 'date-fns/locale'
import toast from 'react-hot-toast'
import api from '../../../lib/axios'

// ── Type config ──────────────────────────────────────────────
const TYPE_CONFIG = {
  workflow_failure: {
    icon: AlertCircle,
    label: 'Workflow',
    borderColor: 'var(--semantic-red)',
    iconBg: 'var(--tint-red)',
    iconColor: 'var(--semantic-red)'
  },
  payment_received: {
    icon: DollarSign,
    label: 'Paiement',
    borderColor: 'var(--semantic-green)',
    iconBg: 'var(--tint-green)',
    iconColor: 'var(--semantic-green)'
  },
  lead_qualified: {
    icon: Users,
    label: 'Lead',
    borderColor: 'var(--accent)',
    iconBg: 'var(--accent-light)',
    iconColor: 'var(--accent)'
  },
  invoice_overdue: {
    icon: Clock,
    label: 'Facture',
    borderColor: 'var(--semantic-orange)',
    iconBg: 'var(--tint-orange)',
    iconColor: 'var(--semantic-orange)'
  },
  project_activated: {
    icon: FolderOpen,
    label: 'Projet',
    borderColor: 'var(--semantic-green)',
    iconBg: 'var(--tint-green)',
    iconColor: 'var(--semantic-green)'
  },
  reminder_sent: {
    icon: Mail,
    label: 'Relance',
    borderColor: '#71717A',
    iconBg: 'rgba(113,113,122,0.1)',
    iconColor: '#71717A'
  },
  system: {
    icon: Bell,
    label: 'Systeme',
    borderColor: '#71717A',
    iconBg: 'rgba(113,113,122,0.1)',
    iconColor: '#71717A'
  }
}

const TYPE_FILTERS = [
  { key: 'all', label: 'Tous' },
  { key: 'workflow_failure', label: 'Workflow' },
  { key: 'payment_received', label: 'Paiement' },
  { key: 'lead_qualified', label: 'Lead' },
  { key: 'invoice_overdue', label: 'Facture' },
  { key: 'project_activated', label: 'Projet' },
  { key: 'system', label: 'Systeme' }
]

const DATE_RANGES = [
  { key: 'today', label: 'Aujourd\'hui', days: 0 },
  { key: '7d', label: '7 jours', days: 7 },
  { key: '30d', label: '30 jours', days: 30 },
  { key: '90d', label: '90 jours', days: 90 }
]

// ── SSE Hook ─────────────────────────────────────────────────
const useSSE = (url, onMessage) => {
  const [connected, setConnected] = useState(false)
  const eventSourceRef = useRef(null)
  const fallbackIntervalRef = useRef(null)

  useEffect(() => {
    let isMounted = true

    const connect = () => {
      try {
        const token = window.__AUTH_TOKEN__
        const separator = url.includes('?') ? '&' : '?'
        const fullUrl = token ? `${url}${separator}token=${token}` : url
        const es = new EventSource(fullUrl)

        es.onopen = () => {
          if (isMounted) setConnected(true)
          // Clear fallback polling when SSE connects
          if (fallbackIntervalRef.current) {
            clearInterval(fallbackIntervalRef.current)
            fallbackIntervalRef.current = null
          }
        }

        es.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            if (isMounted) onMessage(data)
          } catch {
            // Non-JSON message, ignore
          }
        }

        es.onerror = () => {
          if (isMounted) {
            setConnected(false)
            es.close()
            // Fallback to polling
            if (!fallbackIntervalRef.current) {
              fallbackIntervalRef.current = setInterval(() => {
                if (isMounted) onMessage({ type: 'poll' })
              }, 15_000)
            }
            // Attempt reconnect after 5s
            setTimeout(() => {
              if (isMounted && !eventSourceRef.current) connect()
            }, 5_000)
          }
        }

        eventSourceRef.current = es
      } catch {
        if (isMounted) {
          setConnected(false)
          // SSE not available, use polling
          if (!fallbackIntervalRef.current) {
            fallbackIntervalRef.current = setInterval(() => {
              if (isMounted) onMessage({ type: 'poll' })
            }, 15_000)
          }
        }
      }
    }

    connect()

    return () => {
      isMounted = false
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }
      if (fallbackIntervalRef.current) {
        clearInterval(fallbackIntervalRef.current)
        fallbackIntervalRef.current = null
      }
    }
  }, [url]) // eslint-disable-line react-hooks/exhaustive-deps

  return connected
}

// ── Summary Card ─────────────────────────────────────────────
const SummaryCard = ({ icon: Icon, label, value, iconStyle }) => (
  <div className="ds-card p-4">
    <div className="flex items-center gap-2 mb-1">
      <Icon size={14} className="text-zinc-400" style={iconStyle} />
      <span className="text-xs text-zinc-500">{label}</span>
    </div>
    <p className="text-2xl font-bold text-zinc-900">{value}</p>
  </div>
)

// ── Notification Item ────────────────────────────────────────
const NotificationItem = ({ notification, onMarkRead }) => {
  const typeCfg = TYPE_CONFIG[notification.type] || TYPE_CONFIG.system
  const Icon = typeCfg.icon
  const isUnread = !notification.is_read

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3.5 transition-colors cursor-pointer ${
        isUnread ? 'bg-zinc-50/60' : 'hover:bg-zinc-50/30'
      }`}
      style={{ borderLeft: `3px solid ${isUnread ? typeCfg.borderColor : 'transparent'}` }}
      onClick={() => isUnread && onMarkRead(notification.id)}
    >
      {/* Icon */}
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: typeCfg.iconBg }}
      >
        <Icon size={14} style={{ color: typeCfg.iconColor }} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${isUnread ? 'font-semibold text-zinc-900' : 'font-medium text-zinc-700'}`}>
          {notification.title || 'Notification'}
        </p>
        {notification.body && (
          <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">
            {notification.body}
          </p>
        )}
        <p className="text-[11px] text-zinc-400 mt-1">
          {notification.date_created
            ? formatDistanceToNow(new Date(notification.date_created), { addSuffix: true, locale: fr })
            : '—'}
        </p>
      </div>

      {/* Unread dot */}
      {isUnread && (
        <span
          className="w-2 h-2 rounded-full flex-shrink-0 mt-2"
          style={{ backgroundColor: 'var(--accent)' }}
        />
      )}
    </div>
  )
}

// ── Main Component ───────────────────────────────────────────
export const NotificationHub = () => {
  const queryClient = useQueryClient()
  const [typeFilter, setTypeFilter] = useState('all')
  const [readFilter, setReadFilter] = useState('all') // all | unread | read
  const [dateRange, setDateRange] = useState('30d')
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 20

  // Compute date filter
  const dateThreshold = useMemo(() => {
    const range = DATE_RANGES.find(r => r.key === dateRange)
    if (!range || range.days === 0) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return today.toISOString()
    }
    return subDays(new Date(), range.days).toISOString()
  }, [dateRange])

  // Build filter params
  const filterParams = useMemo(() => {
    const filter = { _and: [] }

    if (typeFilter !== 'all') {
      filter._and.push({ type: { _eq: typeFilter } })
    }

    if (readFilter === 'unread') {
      filter._and.push({ is_read: { _eq: false } })
    } else if (readFilter === 'read') {
      filter._and.push({ is_read: { _eq: true } })
    }

    filter._and.push({ date_created: { _gte: dateThreshold } })

    return filter._and.length > 0 ? JSON.stringify(filter) : undefined
  }, [typeFilter, readFilter, dateThreshold])

  // Fetch notifications
  const { data: notifications = [], isLoading, isError } = useQuery({
    queryKey: ['notifications-hub', { filter: filterParams, page }],
    queryFn: async () => {
      const params = {
        fields: ['id', 'type', 'title', 'body', 'is_read', 'date_created', 'date_updated'],
        sort: ['-date_created'],
        limit: PAGE_SIZE * page
      }
      if (filterParams) {
        params.filter = filterParams
      }
      const res = await api.get('/items/notifications', { params })
      return res.data?.data || []
    },
    staleTime: 10_000
  })

  // SSE for real-time
  const apiBase = import.meta.env.VITE_API_URL || ''
  const sseConnected = useSSE(`${apiBase}/api/notifications/stream`, useCallback((data) => {
    if (data.type === 'poll' || data.type === 'notification') {
      queryClient.invalidateQueries({ queryKey: ['notifications-hub'] })
    }
  }, [queryClient]))

  // Mark single as read
  const markReadMut = useMutation({
    mutationFn: async (id) => {
      await api.patch(`/items/notifications/${id}`, { is_read: true })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-hub'] })
    },
    onError: () => toast.error('Erreur lors du marquage')
  })

  // Mark all as read
  const markAllReadMut = useMutation({
    mutationFn: async () => {
      const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id)
      if (unreadIds.length === 0) return
      // Batch update - update each one
      await Promise.all(
        unreadIds.map(id => api.patch(`/items/notifications/${id}`, { is_read: true }))
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-hub'] })
      toast.success('Toutes les notifications marquees comme lues')
    },
    onError: () => toast.error('Erreur lors du marquage')
  })

  // Summary KPIs
  const summary = useMemo(() => {
    const unread = notifications.filter(n => !n.is_read).length
    const criticalErrors = notifications.filter(n =>
      n.type === 'workflow_failure' && !n.is_read
    ).length
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const paymentsToday = notifications.filter(n =>
      n.type === 'payment_received' &&
      n.date_created && new Date(n.date_created) >= todayStart
    ).length
    return { unread, criticalErrors, paymentsToday }
  }, [notifications])

  // Check if more notifications may exist
  const hasMore = notifications.length >= PAGE_SIZE * page

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-wide">Automation</p>
          <h2 className="text-xl font-bold text-zinc-900">Centre de Notifications</h2>
        </div>
        <div className="flex items-center gap-3">
          {/* SSE indicator */}
          <span className="flex items-center gap-1.5 text-xs">
            {sseConnected ? (
              <>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--semantic-green)' }} />
                <span className="text-zinc-500">Connecte</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--semantic-red)' }} />
                <span className="text-zinc-500">Deconnecte</span>
              </>
            )}
          </span>

          {summary.unread > 0 && (
            <button
              onClick={() => markAllReadMut.mutate()}
              disabled={markAllReadMut.isPending}
              className="ds-btn ds-btn-secondary"
            >
              {markAllReadMut.isPending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <CheckCheck size={14} />
              )}
              Tout marquer lu
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard
          icon={Bell}
          label="Non lus"
          value={summary.unread}
          iconStyle={summary.unread > 0 ? { color: 'var(--accent)' } : undefined}
        />
        <SummaryCard
          icon={AlertCircle}
          label="Alertes critiques"
          value={summary.criticalErrors}
          iconStyle={summary.criticalErrors > 0 ? { color: 'var(--semantic-red)' } : undefined}
        />
        <SummaryCard
          icon={DollarSign}
          label="Paiements recus (aujourd'hui)"
          value={summary.paymentsToday}
          iconStyle={summary.paymentsToday > 0 ? { color: 'var(--semantic-green)' } : undefined}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {/* Type pills */}
        <div className="flex flex-wrap gap-1">
          {TYPE_FILTERS.map(tf => (
            <button
              key={tf.key}
              onClick={() => { setTypeFilter(tf.key); setPage(1) }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                typeFilter === tf.key
                  ? 'text-white'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
              style={typeFilter === tf.key ? { backgroundColor: 'var(--accent)' } : undefined}
            >
              {tf.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {/* Read/Unread toggle */}
          <select
            value={readFilter}
            onChange={(e) => { setReadFilter(e.target.value); setPage(1) }}
            className="ds-input w-auto text-xs"
          >
            <option value="all">Tous</option>
            <option value="unread">Non lus</option>
            <option value="read">Lus</option>
          </select>

          {/* Date range */}
          <select
            value={dateRange}
            onChange={(e) => { setDateRange(e.target.value); setPage(1) }}
            className="ds-input w-auto text-xs"
          >
            {DATE_RANGES.map(dr => (
              <option key={dr.key} value={dr.key}>{dr.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Notifications list */}
      {isLoading ? (
        <div className="ds-card">
          <div className="space-y-0 divide-y divide-zinc-50">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-3.5">
                <div className="ds-skeleton w-8 h-8 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="ds-skeleton h-4 w-3/4" />
                  <div className="ds-skeleton h-3 w-1/2" />
                  <div className="ds-skeleton h-3 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : isError ? (
        <div className="ds-card p-12 text-center">
          <AlertCircle className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--semantic-red)' }} />
          <p className="text-zinc-700 font-medium">Erreur de chargement</p>
          <p className="text-sm text-zinc-400 mt-1">Impossible de charger les notifications</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="ds-card p-12 text-center">
          <Bell className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
          <p className="text-zinc-500">Aucune notification</p>
          <p className="text-sm text-zinc-400 mt-1">
            {typeFilter !== 'all' || readFilter !== 'all'
              ? 'Essayez de modifier vos filtres'
              : 'Les notifications apparaitront ici en temps reel'}
          </p>
        </div>
      ) : (
        <div className="ds-card overflow-hidden">
          <div className="divide-y divide-zinc-50">
            {notifications.map(notif => (
              <NotificationItem
                key={notif.id}
                notification={notif}
                onMarkRead={(id) => markReadMut.mutate(id)}
              />
            ))}
          </div>

          {/* Load more */}
          {hasMore && (
            <div className="p-4 border-t border-zinc-100 text-center">
              <button
                onClick={() => setPage(p => p + 1)}
                className="ds-btn ds-btn-secondary text-sm"
              >
                Charger plus
              </button>
            </div>
          )}

          {/* Count */}
          <div className="px-4 py-2.5 border-t border-zinc-100 text-center">
            <span className="text-xs text-zinc-400">
              {notifications.length} notification{notifications.length > 1 ? 's' : ''}
              {summary.unread > 0 && ` dont ${summary.unread} non lue${summary.unread > 1 ? 's' : ''}`}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationHub
