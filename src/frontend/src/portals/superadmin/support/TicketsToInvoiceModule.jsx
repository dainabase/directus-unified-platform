/**
 * TicketsToInvoiceModule — S-06-02
 * Facturer des tickets support resolus hors contrat de maintenance.
 */

import React, { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Receipt, CheckSquare, Square, DollarSign, Headphones,
  Loader2, FileText, AlertCircle
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import toast from 'react-hot-toast'
import api from '../../../lib/axios'

const formatCHF = (v) =>
  new Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF', minimumFractionDigits: 2 }).format(v || 0)

const TVA_RATE = 0.081

const PRIORITY_COLORS = {
  critical: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-gray-100 text-gray-600'
}

async function fetchResolvedTickets() {
  const { data } = await api.get('/items/support_tickets', {
    params: {
      fields: ['*'],
      filter: {
        status: { _in: ['resolved', 'closed'] }
      },
      sort: ['-date_created'],
      limit: 100
    }
  }).catch(() => ({ data: { data: [] } }))
  return data?.data || []
}

async function createInvoice(payload) {
  const { data } = await api.post('/items/client_invoices', payload)
  return data?.data
}

async function markTicketInvoiced(id) {
  await api.patch(`/items/support_tickets/${id}`, { invoiced: true }).catch(() => {})
}

const TicketsToInvoiceModule = () => {
  const queryClient = useQueryClient()
  const [selected, setSelected] = useState(new Set())
  const [clientName, setClientName] = useState('')
  const [description, setDescription] = useState('')
  const [billingType, setBillingType] = useState('forfait')
  const [forfaitAmount, setForfaitAmount] = useState('')
  const [hours, setHours] = useState('')
  const [hourlyRate, setHourlyRate] = useState('150')

  const { data: allTickets = [], isLoading } = useQuery({
    queryKey: ['resolved-tickets-for-billing'],
    queryFn: fetchResolvedTickets,
    staleTime: 30_000
  })

  // Exclude already invoiced
  const tickets = useMemo(() => {
    return allTickets.filter(t => !t.invoiced)
  }, [allTickets])

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
    if (selected.size === tickets.length) setSelected(new Set())
    else setSelected(new Set(tickets.map(t => t.id)))
  }

  // Computed amount
  const computedAmount = useMemo(() => {
    if (billingType === 'forfait') return Number(forfaitAmount) || 0
    return (Number(hours) || 0) * (Number(hourlyRate) || 0)
  }, [billingType, forfaitAmount, hours, hourlyRate])

  const tva = computedAmount * TVA_RATE
  const ttc = computedAmount + tva

  // Generate invoice
  const generateMutation = useMutation({
    mutationFn: async () => {
      if (!clientName.trim()) throw new Error('Nom du client requis')
      if (selected.size === 0) throw new Error('Aucun ticket selectionne')
      if (computedAmount <= 0) throw new Error('Montant invalide')

      const invoice = await createInvoice({
        invoice_number: `SUP-${Date.now()}`,
        client_name: clientName.trim(),
        amount: Math.round(computedAmount * 100) / 100,
        status: 'draft',
        owner_company: '2d6b906a-5b8a-4d9e-a37b-aee8c1281b22',
        description: description.trim() || `Facturation support — ${selected.size} ticket(s)`
      })

      // Mark tickets as invoiced (graceful if field doesn't exist)
      const ids = [...selected]
      await Promise.all(ids.map(id => markTicketInvoiced(id)))

      return invoice
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resolved-tickets-for-billing'] })
      toast.success(`Facture SUP generee — ${formatCHF(computedAmount)} HT`)
      setSelected(new Set())
      setClientName('')
      setDescription('')
      setForfaitAmount('')
      setHours('')
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
          <Receipt size={20} className="text-emerald-500" />
          Facturation hors contrat
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Selectionnez les tickets resolus a facturer au client
        </p>
      </div>

      {tickets.length === 0 ? (
        <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm p-12 text-center">
          <Headphones className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-500">Aucun ticket a facturer</p>
          <p className="text-xs text-gray-400 mt-1">Les tickets resolus non factures apparaitront ici</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tickets table — 2 cols */}
          <div className="lg:col-span-2 bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-gray-100">
                    <th className="px-4 py-3 w-10">
                      <button onClick={toggleSelectAll} className="text-gray-400 hover:text-blue-600">
                        {selected.size === tickets.length && tickets.length > 0 ? <CheckSquare size={16} /> : <Square size={16} />}
                      </button>
                    </th>
                    <th className="px-4 py-3">Ticket</th>
                    <th className="px-4 py-3">Priorite</th>
                    <th className="px-4 py-3">Categorie</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {tickets.map(t => (
                    <tr key={t.id} className={`hover:bg-gray-50/50 transition-colors ${selected.has(t.id) ? 'bg-blue-50/30' : ''}`}>
                      <td className="px-4 py-3">
                        <button onClick={() => toggleSelect(t.id)} className="text-gray-400 hover:text-blue-600">
                          {selected.has(t.id) ? <CheckSquare size={16} className="text-blue-600" /> : <Square size={16} />}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{t.subject || `#${t.id?.slice(0, 8)}`}</p>
                        {t.description && <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{t.description}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_COLORS[t.priority] || PRIORITY_COLORS.medium}`}>
                          {t.priority || 'medium'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{t.category || '—'}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {t.date_created ? format(new Date(t.date_created), 'dd MMM yy', { locale: fr }) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Billing panel — 1 col */}
          <div className="space-y-4">
            <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm p-5 space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <FileText size={16} className="text-emerald-500" />
                Facturation
              </h3>

              <div className="text-sm text-gray-500">
                {selected.size} ticket{selected.size > 1 ? 's' : ''} selectionne{selected.size > 1 ? 's' : ''}
              </div>

              {/* Billing type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type de tarification</label>
                <select
                  value={billingType}
                  onChange={(e) => setBillingType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="forfait">Forfait intervention</option>
                  <option value="hourly">Tarif horaire</option>
                </select>
              </div>

              {billingType === 'forfait' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Montant forfait (CHF)</label>
                  <input
                    type="number"
                    value={forfaitAmount}
                    onChange={(e) => setForfaitAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="Ex: 500"
                    min="0"
                    step="0.01"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Heures</label>
                    <input
                      type="number"
                      value={hours}
                      onChange={(e) => setHours(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="0"
                      min="0"
                      step="0.25"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Taux CHF/h</label>
                    <input
                      type="number"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="150"
                      min="0"
                    />
                  </div>
                </div>
              )}

              {/* Summary */}
              <div className="space-y-2 border-t border-gray-100 pt-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Montant HT</span>
                  <span className="font-bold text-gray-900">{formatCHF(computedAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">TVA (8.1%)</span>
                  <span className="text-gray-600">{formatCHF(tva)}</span>
                </div>
                <div className="border-t border-gray-100 pt-2 flex justify-between">
                  <span className="text-gray-700 font-medium">Total TTC</span>
                  <span className="font-bold text-lg text-emerald-600">{formatCHF(ttc)}</span>
                </div>
              </div>

              {/* Client info */}
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client *</label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Nom du client"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Intervention support..."
                  />
                </div>
              </div>

              <button
                onClick={() => generateMutation.mutate()}
                disabled={selected.size === 0 || !clientName.trim() || computedAmount <= 0 || generateMutation.isPending}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm transition-colors"
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

export default TicketsToInvoiceModule
