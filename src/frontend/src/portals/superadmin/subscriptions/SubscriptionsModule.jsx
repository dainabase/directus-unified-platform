/**
 * SubscriptionsModule — S-04-05
 * Module Abonnements & Facturation Recurrente SuperAdmin.
 * Utilise la collection "subscriptions" (recurring_invoices n'existe pas).
 * Decouverte des champs au runtime via fetch * .
 */

import React, { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  RefreshCw, Plus, Edit3, Trash2, Save, X, Loader2,
  CreditCard, Calendar, AlertCircle, FileText, CheckCircle2, XCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import { format, addDays, isBefore } from 'date-fns'
import { fr } from 'date-fns/locale'
import api from '../../../lib/axios'
import { COMPANIES, formatCHF } from '../../../services/api/projects'

// ── Data Layer ──────────────────────────────────────────────

async function fetchSubscriptions(company) {
  const filter = {}
  if (company) filter.owner_company = { _eq: company }

  const { data } = await api.get('/items/subscriptions', {
    params: {
      fields: ['*'],
      filter: Object.keys(filter).length ? filter : undefined,
      sort: ['-date_created'],
      limit: -1
    }
  }).catch(() => ({ data: { data: [] } }))
  return data?.data || []
}

async function createSubscription(payload) {
  const { data } = await api.post('/items/subscriptions', payload)
  return data?.data
}

async function updateSubscription(id, payload) {
  const { data } = await api.patch(`/items/subscriptions/${id}`, payload)
  return data?.data
}

async function generateInvoice(subscription) {
  const payload = {
    invoice_number: `REC-${Date.now().toString(36).toUpperCase()}`,
    client_id: subscription.client_id || subscription.client || null,
    owner_company: subscription.owner_company || null,
    amount_ht: subscription.amount || subscription.price || 0,
    tax_rate: 8.1,
    status: 'draft',
    description: `Abonnement: ${subscription.name || 'Recurrence'}`,
    issue_date: format(new Date(), 'yyyy-MM-dd'),
    due_date: format(addDays(new Date(), 30), 'yyyy-MM-dd')
  }
  payload.amount_ttc = Math.round(payload.amount_ht * (1 + payload.tax_rate / 100) * 100) / 100
  payload.tax_amount = Math.round(payload.amount_ht * (payload.tax_rate / 100) * 100) / 100

  const { data } = await api.post('/items/client_invoices', payload)
  return data?.data
}

// ── Form ────────────────────────────────────────────────────

const SubscriptionForm = ({ sub, discoveredFields, onSave, onCancel }) => {
  const [form, setForm] = useState({
    name: sub?.name || '',
    status: sub?.status || 'active',
    // Dynamic fields from schema discovery
    ...(discoveredFields.includes('amount') ? { amount: sub?.amount || 0 } : {}),
    ...(discoveredFields.includes('price') ? { price: sub?.price || 0 } : {}),
    ...(discoveredFields.includes('client_id') ? { client_id: sub?.client_id || '' } : {}),
    ...(discoveredFields.includes('client') ? { client: sub?.client || '' } : {}),
    ...(discoveredFields.includes('frequency') ? { frequency: sub?.frequency || 'monthly' } : {}),
    ...(discoveredFields.includes('interval') ? { interval: sub?.interval || 'monthly' } : {}),
    ...(discoveredFields.includes('next_billing_date') ? { next_billing_date: sub?.next_billing_date?.slice(0, 10) || '' } : {}),
    ...(discoveredFields.includes('next_invoice_date') ? { next_invoice_date: sub?.next_invoice_date?.slice(0, 10) || '' } : {}),
    ...(discoveredFields.includes('description') ? { description: sub?.description || '' } : {}),
    ...(discoveredFields.includes('owner_company') ? { owner_company: sub?.owner_company || '' } : {})
  })

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Le nom est requis'); return }
    onSave(form)
  }

  const amountField = discoveredFields.includes('amount') ? 'amount' : discoveredFields.includes('price') ? 'price' : null
  const clientField = discoveredFields.includes('client_id') ? 'client_id' : discoveredFields.includes('client') ? 'client' : null
  const freqField = discoveredFields.includes('frequency') ? 'frequency' : discoveredFields.includes('interval') ? 'interval' : null
  const nextDateField = discoveredFields.includes('next_billing_date') ? 'next_billing_date' : discoveredFields.includes('next_invoice_date') ? 'next_invoice_date' : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-gray-900">{sub ? 'Modifier' : 'Nouvel abonnement'}</h3>
          <button onClick={onCancel} className="p-1 rounded hover:bg-gray-100"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
            <input type="text" value={form.name} onChange={(e) => update('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <select value={form.status} onChange={(e) => update('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                <option value="active">Actif</option>
                <option value="cancelled">Annule</option>
                <option value="paused">En pause</option>
              </select>
            </div>
            {amountField && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Montant CHF</label>
                <input type="number" value={form[amountField]} onChange={(e) => update(amountField, Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" min="0" step="10" />
              </div>
            )}
          </div>
          {clientField && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
              <input type="text" value={form[clientField]} onChange={(e) => update(clientField, e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="ID client" />
            </div>
          )}
          {freqField && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Frequence</label>
              <select value={form[freqField]} onChange={(e) => update(freqField, e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                <option value="monthly">Mensuel</option>
                <option value="quarterly">Trimestriel</option>
                <option value="yearly">Annuel</option>
              </select>
            </div>
          )}
          {nextDateField && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prochaine facturation</label>
              <input type="date" value={form[nextDateField] || ''} onChange={(e) => update(nextDateField, e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
          )}
          {discoveredFields.includes('description') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea value={form.description} onChange={(e) => update('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" rows="2" />
            </div>
          )}
          {discoveredFields.includes('owner_company') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Entreprise</label>
              <select value={form.owner_company} onChange={(e) => update('owner_company', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                <option value="">— Toutes —</option>
                {COMPANIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">Annuler</button>
            <button type="submit" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white ds-btn-primary rounded-lg">
              <Save size={14} /> Sauvegarder
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────

const SubscriptionsModule = ({ selectedCompany }) => {
  const qc = useQueryClient()
  const company = selectedCompany === 'all' ? '' : selectedCompany

  const [showForm, setShowForm] = useState(false)
  const [editSub, setEditSub] = useState(null)

  const { data: subscriptions = [], isLoading } = useQuery({
    queryKey: ['subscriptions', { company }],
    queryFn: () => fetchSubscriptions(company),
    staleTime: 30_000
  })

  // Discover fields from first subscription (runtime schema discovery)
  const discoveredFields = useMemo(() => {
    if (subscriptions.length === 0) return ['name', 'status', 'owner_company', 'description']
    const sample = subscriptions[0]
    return Object.keys(sample).filter(k => !k.startsWith('date_') && k !== 'id' && k !== 'user_created' && k !== 'user_updated')
  }, [subscriptions])

  const amountField = discoveredFields.includes('amount') ? 'amount' : discoveredFields.includes('price') ? 'price' : null
  const nextDateField = discoveredFields.includes('next_billing_date') ? 'next_billing_date' : discoveredFields.includes('next_invoice_date') ? 'next_invoice_date' : null

  const createMut = useMutation({
    mutationFn: createSubscription,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['subscriptions'] }); setShowForm(false); setEditSub(null); toast.success('Abonnement cree') }
  })

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => updateSubscription(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['subscriptions'] }); setShowForm(false); setEditSub(null); toast.success('Abonnement mis a jour') }
  })

  const cancelMut = useMutation({
    mutationFn: (id) => updateSubscription(id, { status: 'cancelled' }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['subscriptions'] }); toast.success('Abonnement annule') }
  })

  const generateMut = useMutation({
    mutationFn: generateInvoice,
    onSuccess: () => { toast.success('Facture generee avec succes'); qc.invalidateQueries({ queryKey: ['invoices'] }) }
  })

  const handleSave = (formData) => {
    if (editSub?.id) updateMut.mutate({ id: editSub.id, data: formData })
    else createMut.mutate(formData)
  }

  const handleCancel = (sub) => {
    if (window.confirm(`Annuler l'abonnement "${sub.name}" ?`)) cancelMut.mutate(sub.id)
  }

  const activeSubs = subscriptions.filter(s => s.status === 'active')
  const cancelledSubs = subscriptions.filter(s => s.status === 'cancelled')

  // Next 30 days billing
  const upcomingBillings = useMemo(() => {
    if (!nextDateField) return []
    const cutoff = addDays(new Date(), 30)
    return activeSubs
      .filter(s => s[nextDateField] && isBefore(new Date(s[nextDateField]), cutoff))
      .sort((a, b) => new Date(a[nextDateField]) - new Date(b[nextDateField]))
  }, [activeSubs, nextDateField])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Abonnements & Facturation Recurrente</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gestion des abonnements et generation de factures</p>
        </div>
        <button onClick={() => { setEditSub(null); setShowForm(true) }}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white ds-btn-primary rounded-lg">
          <Plus size={16} /> Nouvel abonnement
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="ds-card p-4">
          <p className="text-xs text-gray-500 mb-1">Total</p>
          <p className="text-2xl font-bold text-gray-900">{subscriptions.length}</p>
        </div>
        <div className="ds-card p-4">
          <p className="text-xs text-gray-500 mb-1">Actifs</p>
          <p className="text-2xl font-bold" style={{ color: 'var(--semantic-green)' }}>{activeSubs.length}</p>
        </div>
        <div className="ds-card p-4">
          <p className="text-xs text-gray-500 mb-1">Annules</p>
          <p className="text-2xl font-bold text-red-500">{cancelledSubs.length}</p>
        </div>
        {amountField && (
          <div className="ds-card p-4">
            <p className="text-xs text-gray-500 mb-1">Revenu recurrent</p>
            <p className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>{formatCHF(activeSubs.reduce((s, sub) => s + (sub[amountField] || 0), 0))}</p>
          </div>
        )}
      </div>

      {/* Upcoming Billings */}
      {nextDateField ? (
        upcomingBillings.length > 0 ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-amber-500" />
              <h3 className="font-semibold text-amber-800">Prochaines facturations (30 jours)</h3>
            </div>
            <div className="space-y-2">
              {upcomingBillings.map(s => (
                <div key={s.id} className="flex items-center justify-between bg-white/60 rounded-lg px-3 py-2">
                  <div>
                    <span className="text-sm font-medium text-gray-900">{s.name}</span>
                    {amountField && s[amountField] && <span className="ml-2 text-xs text-gray-500">{formatCHF(s[amountField])}</span>}
                  </div>
                  <span className="text-xs text-amber-700">{format(new Date(s[nextDateField]), 'dd MMM yyyy', { locale: fr })}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <p className="text-sm text-green-700">Aucune facturation prevue dans les 30 prochains jours</p>
          </div>
        )
      ) : (
        <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-zinc-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-zinc-700">Configuration des dates de facturation a completer. Aucun champ de date de prochaine facturation detecte dans la collection subscriptions.</p>
        </div>
      )}

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-zinc-400 animate-spin" /></div>
      ) : (
        <div className="ds-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-gray-100">
                  <th className="px-4 py-3">Nom</th>
                  <th className="px-4 py-3">Statut</th>
                  {amountField && <th className="px-4 py-3">Montant</th>}
                  {nextDateField && <th className="px-4 py-3">Prochaine facture</th>}
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {subscriptions.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                    <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-50" />Aucun abonnement
                  </td></tr>
                ) : subscriptions.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{s.name}</p>
                      {s.description && <p className="text-xs text-gray-400 truncate max-w-[200px]">{s.description}</p>}
                    </td>
                    <td className="px-4 py-3">
                      {s.status === 'active' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: 'rgba(52,199,89,0.12)', color: 'var(--semantic-green)' }}>
                          <CheckCircle2 size={12} /> Actif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                          <XCircle size={12} /> {s.status === 'cancelled' ? 'Annule' : s.status}
                        </span>
                      )}
                    </td>
                    {amountField && <td className="px-4 py-3 font-medium text-gray-900">{s[amountField] ? formatCHF(s[amountField]) : '—'}</td>}
                    {nextDateField && (
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {s[nextDateField] ? format(new Date(s[nextDateField]), 'dd MMM yyyy', { locale: fr }) : '—'}
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        {s.status === 'active' && (
                          <button onClick={() => generateMut.mutate(s)}
                            className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-zinc-900" title="Generer facture">
                            <FileText size={14} />
                          </button>
                        )}
                        <button onClick={() => { setEditSub(s); setShowForm(true) }}
                          className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-zinc-900" title="Modifier">
                          <Edit3 size={14} />
                        </button>
                        {s.status === 'active' && (
                          <button onClick={() => handleCancel(s)}
                            className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-red-600" title="Annuler">
                            <XCircle size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && (
        <SubscriptionForm sub={editSub} discoveredFields={discoveredFields}
          onSave={handleSave} onCancel={() => { setShowForm(false); setEditSub(null) }} />
      )}
    </div>
  )
}

export default SubscriptionsModule
