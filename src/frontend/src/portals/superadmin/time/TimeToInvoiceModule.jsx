/**
 * TimeToInvoiceModule — S-06-01
 * Selectionner des entrees time_tracking non facturees et generer une facture client.
 */

import React, { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Receipt, CheckSquare, Square, DollarSign, Clock, AlertCircle,
  Loader2, FileText, Filter
} from 'lucide-react'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { fr } from 'date-fns/locale'
import toast from 'react-hot-toast'
import api from '../../../lib/axios'

const formatCHF = (v) =>
  new Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF', minimumFractionDigits: 2 }).format(v || 0)

const TVA_RATE = 0.081

async function fetchBillableEntries() {
  const { data } = await api.get('/items/time_tracking', {
    params: {
      fields: ['*'],
      filter: {
        _and: [
          { billed: { _eq: false } },
          { billable: { _eq: true } }
        ]
      },
      sort: ['-date'],
      limit: 100
    }
  }).catch(() => ({ data: { data: [] } }))
  return data?.data || []
}

async function createInvoice(payload) {
  const { data } = await api.post('/items/client_invoices', payload)
  return data?.data
}

async function markEntryBilled(id) {
  const { data } = await api.patch(`/items/time_tracking/${id}`, { billed: true })
  return data?.data
}

const TimeToInvoiceModule = () => {
  const queryClient = useQueryClient()
  const [selected, setSelected] = useState(new Set())
  const [clientName, setClientName] = useState('')
  const [description, setDescription] = useState('')
  const [projectFilter, setProjectFilter] = useState('all')
  const [periodFilter, setPeriodFilter] = useState('all')

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['billable-time-entries'],
    queryFn: fetchBillableEntries,
    staleTime: 30_000
  })

  // Unique project names for filter
  const projectNames = useMemo(() => {
    const set = new Set(entries.map(e => e.project_name).filter(Boolean))
    return [...set].sort()
  }, [entries])

  // Filter entries
  const filtered = useMemo(() => {
    return entries.filter(e => {
      if (projectFilter !== 'all' && e.project_name !== projectFilter) return false
      if (periodFilter !== 'all') {
        if (!e.date) return false
        const d = new Date(e.date)
        const now = new Date()
        if (periodFilter === 'month') {
          return d >= startOfMonth(now) && d <= endOfMonth(now)
        }
      }
      return true
    })
  }, [entries, projectFilter, periodFilter])

  // Selection helpers
  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selected.size === filtered.length) setSelected(new Set())
    else setSelected(new Set(filtered.map(e => e.id)))
  }

  // Computed totals from selection
  const summary = useMemo(() => {
    const selectedEntries = filtered.filter(e => selected.has(e.id))
    const validEntries = selectedEntries.filter(e => e.hourly_rate != null && e.hourly_rate > 0)
    const totalHours = selectedEntries.reduce((s, e) => s + (e.hours || 0), 0)
    const montantHT = validEntries.reduce((s, e) => s + (e.hours || 0) * (e.hourly_rate || 0), 0)
    const tva = montantHT * TVA_RATE
    const ttc = montantHT + tva
    const hasInvalidRate = selectedEntries.some(e => e.hourly_rate == null || e.hourly_rate === 0)
    return { count: selectedEntries.length, totalHours, montantHT, tva, ttc, hasInvalidRate }
  }, [filtered, selected])

  // Generate invoice mutation
  const generateMutation = useMutation({
    mutationFn: async () => {
      if (!clientName.trim()) throw new Error('Nom du client requis')
      if (selected.size === 0) throw new Error('Aucune entree selectionnee')

      // Create invoice
      const invoice = await createInvoice({
        invoice_number: `TM-${Date.now()}`,
        client_name: clientName.trim(),
        amount: Math.round(summary.montantHT * 100) / 100,
        status: 'draft',
        owner_company: '2d6b906a-5b8a-4d9e-a37b-aee8c1281b22',
        description: description.trim() || `Facturation en regie — ${summary.totalHours}h`
      })

      // Mark entries as billed
      const ids = [...selected]
      await Promise.all(ids.map(id => markEntryBilled(id).catch(() => {})))

      return invoice
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billable-time-entries'] })
      toast.success(`Facture TM generee — ${formatCHF(summary.montantHT)} HT`)
      setSelected(new Set())
      setClientName('')
      setDescription('')
    },
    onError: (err) => toast.error(err.message)
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Receipt size={20} className="text-indigo-500" />
          Facturation en regie
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Selectionnez les entrees de temps non facturees pour generer une facture
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-gray-400" />
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">Tous les projets</option>
            {projectNames.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <select
          value={periodFilter}
          onChange={(e) => setPeriodFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="all">Toute periode</option>
          <option value="month">Mois courant</option>
        </select>
        <span className="text-xs text-gray-400">
          {filtered.length} entree{filtered.length > 1 ? 's' : ''} facturable{filtered.length > 1 ? 's' : ''}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="ds-card p-12 text-center">
          <Clock className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-500">Aucune entree a facturer</p>
          <p className="text-xs text-gray-400 mt-1">Toutes les entrees billable sont deja facturees</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Table — 2 cols */}
          <div className="lg:col-span-2 ds-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-gray-100">
                    <th className="px-4 py-3 w-10">
                      <button onClick={toggleSelectAll} className="text-gray-400 hover:text-blue-600">
                        {selected.size === filtered.length && filtered.length > 0 ? <CheckSquare size={16} /> : <Square size={16} />}
                      </button>
                    </th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Projet</th>
                    <th className="px-4 py-3">Heures</th>
                    <th className="px-4 py-3">Taux</th>
                    <th className="px-4 py-3">Montant</th>
                    <th className="px-4 py-3">Categorie</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(e => {
                    const hasRate = e.hourly_rate != null && e.hourly_rate > 0
                    const amount = hasRate ? (e.hours || 0) * e.hourly_rate : 0
                    return (
                      <tr key={e.id} className={`hover:bg-gray-50/50 transition-colors ${selected.has(e.id) ? 'bg-blue-50/30' : ''}`}>
                        <td className="px-4 py-3">
                          <button onClick={() => toggleSelect(e.id)} className="text-gray-400 hover:text-blue-600">
                            {selected.has(e.id) ? <CheckSquare size={16} className="text-blue-600" /> : <Square size={16} />}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {e.date ? format(new Date(e.date), 'dd MMM yy', { locale: fr }) : '—'}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900 max-w-[180px] truncate">
                          {e.project_name || <span className="text-gray-400 italic">Projet non assigne</span>}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-bold">{e.hours}h</span>
                        </td>
                        <td className="px-4 py-3">
                          {hasRate ? (
                            <span className="text-xs text-gray-600">{formatCHF(e.hourly_rate)}/h</span>
                          ) : (
                            <span className="text-xs text-orange-500 flex items-center gap-1">
                              <AlertCircle size={12} /> Taux non defini
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900 text-sm">
                          {hasRate ? formatCHF(amount) : '—'}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">{e.category || '—'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary panel — 1 col */}
          <div className="space-y-4">
            <div className="ds-card p-5 space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <FileText size={16} className="text-indigo-500" />
                Recapitulatif facture
              </h3>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Entrees selectionnees</span>
                  <span className="font-medium">{summary.count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total heures</span>
                  <span className="font-medium">{summary.totalHours.toFixed(1)}h</span>
                </div>
                <div className="border-t border-gray-100 pt-2 flex justify-between">
                  <span className="text-gray-500">Montant HT</span>
                  <span className="font-bold text-gray-900">{formatCHF(summary.montantHT)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">TVA (8.1%)</span>
                  <span className="text-gray-600">{formatCHF(summary.tva)}</span>
                </div>
                <div className="border-t border-gray-100 pt-2 flex justify-between">
                  <span className="text-gray-700 font-medium">Total TTC</span>
                  <span className="font-bold text-lg text-indigo-600">{formatCHF(summary.ttc)}</span>
                </div>
              </div>

              {summary.hasInvalidRate && (
                <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <AlertCircle size={14} className="text-orange-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-orange-700">
                    Certaines entrees n'ont pas de taux horaire defini et sont exclues du calcul.
                  </p>
                </div>
              )}

              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client *</label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Nom du client"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description facture</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Facturation en regie..."
                  />
                </div>
              </div>

              <button
                onClick={() => generateMutation.mutate()}
                disabled={selected.size === 0 || !clientName.trim() || generateMutation.isPending}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm transition-colors"
              >
                {generateMutation.isPending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Receipt size={16} />
                )}
                Generer facture
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TimeToInvoiceModule
