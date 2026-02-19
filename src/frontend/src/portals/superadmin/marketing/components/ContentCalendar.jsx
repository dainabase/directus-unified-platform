// src/frontend/src/portals/superadmin/marketing/components/ContentCalendar.jsx
import React, { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Calendar, ChevronLeft, ChevronRight, FileText,
  Eye, Clock, Archive, Loader2
} from 'lucide-react'
import api from '../../../../lib/axios'

// ── Status config ────────────────────────────────────────────────────────────
const STATUS_CFG = {
  draft:     { label: 'Brouillon',  bg: 'bg-gray-100',   text: 'text-gray-600' },
  scheduled: { label: 'Planifie',   bg: 'bg-blue-100',   text: 'text-blue-700' },
  published: { label: 'Publie',     bg: 'bg-green-100',  text: 'text-green-700' },
  archived:  { label: 'Archive',    bg: 'bg-orange-100',  text: 'text-orange-700' }
}

// ── Skeleton ─────────────────────────────────────────────────────────────────
const ContentCalendarSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="glass-card p-5">
          <div className="glass-skeleton h-4 w-24 rounded mb-3" />
          <div className="glass-skeleton h-8 w-16 rounded" />
        </div>
      ))}
    </div>
    <div className="glass-card p-6">
      <div className="glass-skeleton h-6 w-48 rounded mb-4" />
      <div className="grid grid-cols-7 gap-2">
        {[...Array(35)].map((_, i) => (
          <div key={i} className="glass-skeleton h-20 rounded" />
        ))}
      </div>
    </div>
    <div className="glass-card p-0 overflow-hidden">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-gray-100">
          <div className="glass-skeleton h-4 w-48 rounded" />
          <div className="glass-skeleton h-4 w-24 rounded" />
          <div className="glass-skeleton h-4 w-20 rounded" />
          <div className="glass-skeleton h-4 w-28 rounded" />
        </div>
      ))}
    </div>
  </div>
)

// ── Helpers ───────────────────────────────────────────────────────────────────
const DAYS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const MONTHS_FR = [
  'Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre'
]

const isSameDay = (d1, d2) =>
  d1.getFullYear() === d2.getFullYear() &&
  d1.getMonth() === d2.getMonth() &&
  d1.getDate() === d2.getDate()

// ── Component ────────────────────────────────────────────────────────────────
const ContentCalendar = ({ selectedCompany }) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterChannel, setFilterChannel] = useState('all')

  const company = selectedCompany === 'all' ? null : selectedCompany

  // ── Fetch content calendar items ──
  const { data: items = [], isLoading, isError } = useQuery({
    queryKey: ['content-calendar', company],
    queryFn: async () => {
      const filter = {}
      if (company) {
        filter.owner_company = { _eq: company }
      }
      const res = await api.get('/items/content_calendar', {
        params: {
          filter,
          fields: ['id', 'title', 'status', 'publish_date', 'channel', 'content_type', 'owner_company', 'sort', 'date_created'],
          sort: ['-publish_date'],
          limit: -1
        }
      })
      return res.data?.data || []
    },
    staleTime: 2 * 60 * 1000,
    retry: 2
  })

  // ── Derived data ──
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      if (filterStatus !== 'all' && item.status !== filterStatus) return false
      if (filterChannel !== 'all' && item.channel !== filterChannel) return false
      return true
    })
  }, [items, filterStatus, filterChannel])

  const channels = useMemo(() => {
    const set = new Set(items.map(i => i.channel).filter(Boolean))
    return [...set].sort()
  }, [items])

  const kpis = useMemo(() => ({
    total: items.length,
    draft: items.filter(i => i.status === 'draft').length,
    scheduled: items.filter(i => i.status === 'scheduled').length,
    published: items.filter(i => i.status === 'published').length
  }), [items])

  // ── Calendar grid ──
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDayOfMonth = new Date(year, month, 1)
  // getDay() returns 0=Sun, we want 0=Mon
  const startOffset = (firstDayOfMonth.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7

  const getItemsForDay = (day) => {
    const target = new Date(year, month, day)
    return filteredItems.filter(item => {
      if (!item.publish_date) return false
      return isSameDay(new Date(item.publish_date), target)
    })
  }

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))
  const goToday = () => setCurrentDate(new Date())

  const today = new Date()

  // ── Loading ──
  if (isLoading && items.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Calendar className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Calendrier de contenu</h2>
        </div>
        <ContentCalendarSkeleton />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-600" />
            Calendrier de contenu
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Planification et suivi des publications
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-gray-500">Total</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{kpis.total}</div>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-gray-500" />
            <span className="text-sm text-gray-500">Brouillons</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{kpis.draft}</div>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-gray-500">Planifies</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{kpis.scheduled}</div>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-5 h-5 text-green-600" />
            <span className="text-sm text-gray-500">Publies</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{kpis.published}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-200 bg-white/80 backdrop-blur text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        >
          <option value="all">Tous les statuts</option>
          {Object.entries(STATUS_CFG).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        <select
          value={filterChannel}
          onChange={(e) => setFilterChannel(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-200 bg-white/80 backdrop-blur text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        >
          <option value="all">Tous les canaux</option>
          {channels.map(ch => (
            <option key={ch} value={ch}>{ch}</option>
          ))}
        </select>
      </div>

      {/* Calendar navigation */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-lg hover:bg-gray-200/60 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <h3 className="text-lg font-semibold text-gray-900 capitalize">
              {MONTHS_FR[month]} {year}
            </h3>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg hover:bg-gray-200/60 transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <button
            onClick={goToday}
            className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            Aujourd'hui
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {DAYS_FR.map(d => (
            <div key={d} className="text-center text-xs font-medium text-gray-500 uppercase py-2">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-1">
          {[...Array(totalCells)].map((_, i) => {
            const day = i - startOffset + 1
            const isValid = day > 0 && day <= daysInMonth
            const isToday = isValid && isSameDay(new Date(year, month, day), today)
            const dayItems = isValid ? getItemsForDay(day) : []

            return (
              <div
                key={i}
                className={`min-h-[80px] rounded-lg border p-1.5 transition-colors ${
                  isValid
                    ? isToday
                      ? 'border-blue-300 bg-blue-50/50'
                      : 'border-gray-100 bg-white/50 hover:bg-gray-50/60'
                    : 'border-transparent bg-gray-50/30'
                }`}
              >
                {isValid && (
                  <>
                    <div className={`text-xs font-medium mb-1 ${isToday ? 'text-blue-600' : 'text-gray-500'}`}>
                      {day}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      {dayItems.slice(0, 3).map(item => {
                        const cfg = STATUS_CFG[item.status] || STATUS_CFG.draft
                        return (
                          <div
                            key={item.id}
                            className={`px-1 py-0.5 rounded text-[10px] font-medium truncate ${cfg.bg} ${cfg.text}`}
                            title={item.title}
                          >
                            {item.title}
                          </div>
                        )
                      })}
                      {dayItems.length > 3 && (
                        <span className="text-[10px] text-gray-400 pl-1">
                          +{dayItems.length - 3} de plus
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Table listing */}
      <div className="glass-card p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Tous les contenus</h3>
        </div>
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Calendar size={48} className="mb-3 opacity-40" />
            <p className="text-lg font-medium text-gray-500">Aucun contenu trouve</p>
            <p className="text-sm mt-1">
              Ajoutez des items dans la collection content_calendar de Directus.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-5 py-3">Titre</th>
                  <th className="px-5 py-3">Statut</th>
                  <th className="px-5 py-3">Canal</th>
                  <th className="px-5 py-3">Type de contenu</th>
                  <th className="px-5 py-3">Date de publication</th>
                  <th className="px-5 py-3">Date de creation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredItems.map(item => {
                  const cfg = STATUS_CFG[item.status] || STATUS_CFG.draft
                  return (
                    <tr key={item.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-3 font-medium text-gray-900 whitespace-nowrap">
                        {item.title || <span className="text-gray-300">-</span>}
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-600 whitespace-nowrap capitalize">
                        {item.channel || <span className="text-gray-300">-</span>}
                      </td>
                      <td className="px-5 py-3 text-gray-600 whitespace-nowrap capitalize">
                        {item.content_type || <span className="text-gray-300">-</span>}
                      </td>
                      <td className="px-5 py-3 text-gray-500 whitespace-nowrap">
                        {item.publish_date
                          ? new Date(item.publish_date).toLocaleDateString('fr-CH')
                          : <span className="text-gray-300">-</span>}
                      </td>
                      <td className="px-5 py-3 text-gray-500 whitespace-nowrap">
                        {item.date_created
                          ? new Date(item.date_created).toLocaleDateString('fr-CH')
                          : <span className="text-gray-300">-</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Error state */}
      {isError && (
        <div className="glass-card p-6 text-center">
          <p className="text-sm text-red-500">
            Erreur lors du chargement des donnees. Verifiez que la collection content_calendar existe dans Directus.
          </p>
        </div>
      )}
    </div>
  )
}

export default ContentCalendar
