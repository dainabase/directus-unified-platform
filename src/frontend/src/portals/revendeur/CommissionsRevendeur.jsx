/**
 * CommissionsRevendeur — Module 25
 * Page commissions pour le portail revendeur.
 * Affiche les commissions dues, payees, taux moyen.
 *
 * Connected to Directus `commissions` collection.
 * Fields: id, reseller_id, deal_id, invoice_id, amount, percentage, currency,
 *         status, paid_at, owner_company, notes, date_created, date_updated
 */

import React, { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { DollarSign, Percent, CheckCircle, Clock, ArrowUpRight, Receipt, Loader2, Inbox } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import api from '../../lib/axios'
import { useAuthStore } from '../../stores/authStore'

// ── Helpers ──

const formatCHF = (value) =>
  new Intl.NumberFormat('fr-CH', {
    style: 'currency',
    currency: 'CHF',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value || 0)

const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  return format(new Date(dateStr), 'dd.MM.yyyy', { locale: fr })
}

// ── Status config ──

const STATUS_CONFIG = {
  pending:   { label: 'En attente',  cls: 'ds-badge ds-badge-warning' },
  validated: { label: 'Validee',     cls: 'ds-badge ds-badge-info' },
  paid:      { label: 'Payee',       cls: 'ds-badge ds-badge-success' }
}

// ── Component ──

const CommissionsRevendeur = () => {
  const user = useAuthStore((s) => s.user)
  const userId = user?.id

  // ── Fetch commissions from Directus ──
  const { data: commissions = [], isLoading } = useQuery({
    queryKey: ['revendeur-commissions', userId],
    queryFn: async () => {
      const { data } = await api.get('/items/commissions', {
        params: {
          filter: { reseller_id: { _eq: userId } },
          fields: ['id', 'deal_id', 'invoice_id', 'amount', 'percentage', 'currency', 'status', 'paid_at', 'owner_company', 'notes', 'date_created'],
          sort: ['-date_created'],
          limit: 50
        }
      }).catch(() => ({ data: { data: [] } }))
      return data?.data || []
    },
    enabled: !!userId,
    refetchInterval: 60000
  })

  // ── Computed KPIs ──
  const kpis = useMemo(() => {
    const pendingAndValidated = commissions.filter(
      (c) => c.status === 'pending' || c.status === 'validated'
    )
    const paid = commissions.filter((c) => c.status === 'paid')

    const totalDues = pendingAndValidated.reduce((sum, c) => sum + (c.amount || 0), 0)
    const totalPaid = paid.reduce((sum, c) => sum + (c.amount || 0), 0)

    const totalRates = commissions.reduce((sum, c) => sum + (c.percentage || 0), 0)
    const avgRate = commissions.length > 0 ? totalRates / commissions.length : 0

    return { totalDues, totalPaid, avgRate }
  }, [commissions])

  // ── Recent paid commissions (3 most recent) ──
  const recentPaid = useMemo(() => {
    return commissions
      .filter((c) => c.status === 'paid' && c.paid_at)
      .sort((a, b) => new Date(b.paid_at) - new Date(a.paid_at))
      .slice(0, 3)
  }, [commissions])

  // ── Pending + validated total for the banner ──
  const totalPendingBanner = useMemo(() => {
    return commissions
      .filter((c) => c.status === 'pending' || c.status === 'validated')
      .reduce((sum, c) => sum + (c.amount || 0), 0)
  }, [commissions])

  // ── Derive base amount from amount/percentage ──
  const getBaseAmount = (c) => {
    if (c.percentage && c.percentage > 0) return c.amount / (c.percentage / 100)
    return c.amount || 0
  }

  // ── Loading state ──
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={32} className="animate-spin text-zinc-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="ds-page-title text-2xl font-bold text-gray-900">Mes Commissions</h1>
        <p className="text-sm text-gray-500 mt-1">
          Suivi de vos commissions sur les deals revendeur — {user?.name || 'Revendeur'}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total commissions dues */}
        <div className="ds-card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <DollarSign size={20} className="text-amber-600" />
            </div>
            <span className="text-sm text-gray-500">Commissions dues</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCHF(kpis.totalDues)}</p>
          <p className="text-xs text-gray-400 mt-1">En attente + validees</p>
        </div>

        {/* Commissions payees */}
        <div className="ds-card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <CheckCircle size={20} className="text-green-600" />
            </div>
            <span className="text-sm text-gray-500">Commissions payees</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{formatCHF(kpis.totalPaid)}</p>
          <p className="text-xs text-gray-400 mt-1">Total encaisse</p>
        </div>

        {/* Taux moyen */}
        <div className="ds-card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center">
              <Percent size={20} className="text-zinc-600" />
            </div>
            <span className="text-sm text-gray-500">Taux moyen</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{kpis.avgRate.toFixed(1)}%</p>
          <p className="text-xs text-gray-400 mt-1">Sur {commissions.length} deals</p>
        </div>
      </div>

      {/* Commissions table */}
      <div className="ds-card">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Detail des commissions</h3>
          <span className="text-xs text-gray-400">{commissions.length} commissions</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Deal</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Client</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Montant base</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Taux</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Commission</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {commissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Inbox size={32} className="text-zinc-300" />
                      <p className="text-sm text-zinc-400">Aucune commission pour le moment</p>
                    </div>
                  </td>
                </tr>
              ) : (
                commissions.map((c) => {
                  const cfg = STATUS_CONFIG[c.status] || STATUS_CONFIG.pending
                  const dealLabel = typeof c.deal_id === 'object' && c.deal_id?.id
                    ? c.deal_id.id
                    : c.deal_id || '—'
                  const clientLabel = (typeof c.deal_id === 'object' && c.deal_id?.client_name)
                    ? c.deal_id.client_name
                    : c.owner_company || '—'
                  return (
                    <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Receipt size={14} className="text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">{dealLabel}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{clientLabel}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 text-right">{formatCHF(getBaseAmount(c))}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 text-right">{c.percentage || 0}%</td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">{formatCHF(c.amount)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.cls}`}>
                          {cfg.label}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent payments */}
      {recentPaid.length > 0 && (
        <div className="ds-card">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Paiements recents</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {recentPaid.map((c) => {
              const dealLabel = typeof c.deal_id === 'object' && c.deal_id?.id
                ? c.deal_id.id
                : c.deal_id || '—'
              const clientLabel = (typeof c.deal_id === 'object' && c.deal_id?.client_name)
                ? c.deal_id.client_name
                : c.owner_company || '—'
              return (
                <div key={c.id} className="px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                      <ArrowUpRight size={16} className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{dealLabel} — {clientLabel}</p>
                      <p className="text-xs text-gray-400">
                        Paye le {formatDate(c.paid_at)}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-green-600">+{formatCHF(c.amount)}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Total banner */}
      <div className="ds-card p-5 bg-zinc-50 border border-amber-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Clock size={20} className="text-amber-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-amber-900">Total commissions en attente</p>
              <p className="text-xs text-amber-600 mt-0.5">
                Commissions en attente de validation et de paiement
              </p>
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-900">{formatCHF(totalPendingBanner)}</p>
        </div>
      </div>
    </div>
  )
}

export default CommissionsRevendeur
