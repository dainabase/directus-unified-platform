/**
 * CreditsModule — I-04
 * Avoirs & remboursements (notes de credit)
 * Liste avoirs, creation depuis facture, application sur facture.
 */

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  CreditCard, Plus, Loader2, FileText, CheckCircle, XCircle,
  ArrowRight, AlertCircle, X
} from 'lucide-react'
import toast from 'react-hot-toast'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

async function fetchCredits(params = {}) {
  const query = new URLSearchParams(params).toString()
  const res = await fetch(`${API_BASE}/api/credits?${query}`)
  if (!res.ok) throw new Error('Erreur chargement avoirs')
  return res.json()
}

async function createCredit(data) {
  const res = await fetch(`${API_BASE}/api/credits`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Erreur creation avoir')
  }
  return res.json()
}

async function applyCredit(creditId, targetInvoiceId) {
  const res = await fetch(`${API_BASE}/api/credits/${creditId}/apply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ target_invoice_id: targetInvoiceId })
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Erreur application avoir')
  }
  return res.json()
}

const STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-600',
  issued: 'bg-zinc-100 text-zinc-700',
  applied: 'bg-green-100 text-green-700',
  expired: 'bg-red-100 text-red-700'
}

function formatCHF(amount) {
  return `CHF ${parseFloat(amount || 0).toLocaleString('fr-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('fr-CH')
}

export default function CreditsModule({ selectedCompany }) {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ invoice_id: '', amount: '', reason: '', type: 'full' })

  const { data, isLoading } = useQuery({
    queryKey: ['credits', selectedCompany],
    queryFn: () => fetchCredits(selectedCompany ? { owner_company: selectedCompany } : {})
  })

  const createMut = useMutation({
    mutationFn: createCredit,
    onSuccess: (res) => {
      toast.success(`Avoir ${res.credit?.credit_number} emis`)
      qc.invalidateQueries({ queryKey: ['credits'] })
      setShowForm(false)
      setForm({ invoice_id: '', amount: '', reason: '', type: 'full' })
    },
    onError: (err) => toast.error(err.message)
  })

  const credits = data?.credits || []

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" style={{ color: 'var(--accent, #0071E3)' }} />
          <h2 className="text-white font-semibold">Avoirs & Notes de Credit</h2>
          <span className="text-gray-400 text-sm">({credits.length})</span>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-sm px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors" style={{ background: 'var(--accent-light, rgba(0,113,227,0.15))', color: 'var(--accent, #0071E3)' }}
        >
          <Plus className="w-4 h-4" /> Emettre un avoir
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="ds-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-white text-sm font-medium">Nouvel avoir</h3>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-gray-400 text-xs">ID Facture originale</label>
              <input
                type="text"
                value={form.invoice_id}
                onChange={e => setForm({ ...form, invoice_id: e.target.value })}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-white text-sm"
                placeholder="ID facture..."
              />
            </div>
            <div>
              <label className="text-gray-400 text-xs">Type</label>
              <select
                value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value })}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-white text-sm"
              >
                <option value="full">Total</option>
                <option value="partial">Partiel</option>
              </select>
            </div>
            {form.type === 'partial' && (
              <div>
                <label className="text-gray-400 text-xs">Montant CHF</label>
                <input
                  type="number"
                  value={form.amount}
                  onChange={e => setForm({ ...form, amount: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-white text-sm"
                  placeholder="0.00"
                />
              </div>
            )}
            <div className={form.type === 'partial' ? '' : 'col-span-2'}>
              <label className="text-gray-400 text-xs">Raison</label>
              <textarea
                value={form.reason}
                onChange={e => setForm({ ...form, reason: e.target.value })}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-white text-sm"
                rows={2}
                placeholder="Motif de l'avoir..."
              />
            </div>
          </div>
          <button
            onClick={() => createMut.mutate(form)}
            disabled={!form.invoice_id || !form.reason || createMut.isPending}
            className="disabled:opacity-50 text-white text-sm px-4 py-2 rounded-lg flex items-center gap-2 transition-colors" style={{ backgroundColor: 'var(--accent, #0071E3)' }}
          >
            {createMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
            Emettre l'avoir
          </button>
        </div>
      )}

      {/* Table */}
      <div className="ds-card overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--accent, #0071E3)' }} />
          </div>
        ) : credits.length === 0 ? (
          <p className="text-gray-400 text-sm p-6 text-center">Aucun avoir emis.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 text-xs border-b border-zinc-200">
                <th className="text-left p-3">N° Avoir</th>
                <th className="text-left p-3">Facture</th>
                <th className="text-right p-3">Montant</th>
                <th className="text-center p-3">Statut</th>
                <th className="text-left p-3">Raison</th>
                <th className="text-left p-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {credits.map(c => (
                <tr key={c.id} className="border-b border-zinc-100 hover:bg-zinc-50">
                  <td className="p-3">
                    <span className="text-white font-mono text-xs">{c.credit_number || '—'}</span>
                  </td>
                  <td className="p-3 text-gray-300 text-xs">{c.invoice_id || '—'}</td>
                  <td className="p-3 text-right text-white">{formatCHF(c.total || c.amount)}</td>
                  <td className="p-3 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[c.status] || STATUS_COLORS.draft}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="p-3 text-gray-300 text-xs truncate max-w-[200px]">{c.reason || '—'}</td>
                  <td className="p-3 text-gray-400 text-xs">{formatDate(c.issued_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
