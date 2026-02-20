// src/frontend/src/portals/superadmin/marketing/components/MarketingEvents.jsx
import React, { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Calendar, CalendarDays } from 'lucide-react'
import {
  BarChart, Bar,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts'
import api from '../../../../lib/axios'

const MONTHS_FR = [
  'Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Juin',
  'Juil', 'Aout', 'Sep', 'Oct', 'Nov', 'Dec'
]

// ── Skeleton ─────────────────────────────────────────────────────────────────
const EventsSkeleton = () => (
  <div className="space-y-6">
    <div className="ds-card p-5">
      <div className="ds-skeleton h-4 w-28 rounded mb-3" />
      <div className="ds-skeleton h-8 w-16 rounded" />
    </div>
    <div className="ds-card p-5">
      <div className="ds-skeleton h-5 w-40 rounded mb-4" />
      <div className="ds-skeleton h-[250px] w-full rounded" />
    </div>
    <div className="ds-card p-0 overflow-hidden">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-gray-100">
          <div className="ds-skeleton h-4 w-48 rounded" />
          <div className="ds-skeleton h-4 w-24 rounded" />
          <div className="ds-skeleton h-4 w-20 rounded" />
        </div>
      ))}
    </div>
  </div>
)

// ── Component ────────────────────────────────────────────────────────────────
const MarketingEvents = ({ selectedCompany }) => {
  const company = selectedCompany === 'all' ? null : selectedCompany

  // ── Fetch events ──
  const { data: events = [], isLoading, isError } = useQuery({
    queryKey: ['marketing-events', company],
    queryFn: async () => {
      const filter = {}
      if (company) {
        filter.owner_company = { _eq: company }
      }
      const res = await api.get('/items/events', {
        params: {
          filter,
          fields: ['*'],
          sort: ['-date_created'],
          limit: -1
        }
      })
      return res.data?.data || []
    },
    staleTime: 2 * 60 * 1000,
    retry: 2
  })

  // ── Chart: events by month from date_created ──
  const monthlyData = useMemo(() => {
    const buckets = {}
    events.forEach(ev => {
      if (!ev.date_created) return
      const d = new Date(ev.date_created)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const label = `${MONTHS_FR[d.getMonth()]} ${d.getFullYear()}`
      if (!buckets[key]) buckets[key] = { key, label, count: 0 }
      buckets[key].count += 1
    })
    return Object.values(buckets).sort((a, b) => a.key.localeCompare(b.key))
  }, [events])

  // ── Detect table columns dynamically ──
  const columns = useMemo(() => {
    if (events.length === 0) return []
    const available = Object.keys(events[0])
    const skip = new Set(['id', 'user_created', 'user_updated', 'date_updated', 'sort'])
    const priority = ['title', 'name', 'status', 'type', 'date', 'location', 'owner_company', 'date_created']
    const ordered = []
    priority.forEach(k => { if (available.includes(k) && !skip.has(k)) ordered.push(k) })
    available.forEach(k => { if (!skip.has(k) && !ordered.includes(k)) ordered.push(k) })
    return ordered.slice(0, 10) // limit visible columns
  }, [events])

  const formatCell = (value) => {
    if (value === null || value === undefined) return '-'
    if (typeof value === 'boolean') return value ? 'Oui' : 'Non'
    if (typeof value === 'number') return value.toLocaleString('fr-CH')
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
      return new Date(value).toLocaleDateString('fr-CH')
    }
    if (typeof value === 'object') return JSON.stringify(value)
    return String(value)
  }

  const columnLabel = (key) => {
    const labels = {
      title: 'Titre', name: 'Nom', status: 'Statut', type: 'Type',
      date: 'Date', location: 'Lieu', owner_company: 'Entreprise',
      date_created: 'Cree le', description: 'Description',
      capacity: 'Capacite', registered: 'Inscrits'
    }
    return labels[key] || key.replace(/_/g, ' ')
  }

  // ── Loading ──
  if (isLoading && events.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-6 h-6" style={{ color: 'var(--accent)' }} />
          <h2 className="text-2xl font-bold text-gray-900">Evenements</h2>
        </div>
        <EventsSkeleton />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <CalendarDays className="w-6 h-6" style={{ color: 'var(--accent)' }} />
          Evenements
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Suivi des evenements marketing depuis Directus
        </p>
      </div>

      {/* KPI */}
      <div className="ds-card p-5 max-w-xs">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-5 h-5" style={{ color: 'var(--accent)' }} />
          <span className="text-sm text-gray-500">Total evenements</span>
        </div>
        <div className="text-2xl font-bold text-gray-900">{events.length}</div>
      </div>

      {/* Chart: events by month */}
      <div className="ds-card p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Evenements par mois</h3>
        {monthlyData.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
            Aucune donnee disponible
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#0071E3" radius={[4, 4, 0, 0]} name="Evenements" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Table: all events */}
      <div className="ds-card p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Liste des evenements</h3>
        </div>
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <CalendarDays size={48} className="mb-3 opacity-40" />
            <p className="text-lg font-medium text-gray-500">Aucun evenement trouve</p>
            <p className="text-sm mt-1">
              Ajoutez des evenements dans la collection events de Directus.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {columns.map(col => (
                    <th key={col} className="px-5 py-3 whitespace-nowrap">{columnLabel(col)}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {events.map(ev => (
                  <tr key={ev.id} className="hover:bg-gray-50/60 transition-colors">
                    {columns.map(col => (
                      <td key={col} className="px-5 py-3 whitespace-nowrap text-gray-700">
                        {formatCell(ev[col])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Error state */}
      {isError && (
        <div className="ds-card p-6 text-center">
          <p className="text-sm text-red-500">
            Erreur lors du chargement des evenements. Verifiez que la collection events existe dans Directus.
          </p>
        </div>
      )}
    </div>
  )
}

export default MarketingEvents
