/**
 * CommissionsRevendeur — Module 25
 * Page commissions pour le portail revendeur.
 * Affiche les commissions dues, payees, taux moyen.
 *
 * TODO: La collection `commissions` n'existe pas encore dans Directus (403 on schema query).
 *       Toutes les donnees sont mockees. Remplacer par des requetes Directus
 *       une fois la collection creee.
 */

import React, { useMemo } from 'react'
import { DollarSign, Percent, CheckCircle, Clock, ArrowUpRight, Receipt } from 'lucide-react'
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
  pending:   { label: 'En attente',  cls: 'bg-amber-100 text-amber-700' },
  validated: { label: 'Validee',     cls: 'bg-zinc-100 text-zinc-700' },
  paid:      { label: 'Payee',       cls: 'bg-green-100 text-green-700' }
}

// ── Mock data ──
// TODO: Replace with Directus query when `commissions` collection is created
// Collection fields: id, reseller_id (M2O resellers), quote_id (M2O quotes),
// rate (decimal), base_amount (decimal), commission_amount (decimal),
// status (pending/validated/paid), paid_at (datetime), date_created
const MOCK_COMMISSIONS = [
  { id: 1, deal: 'DEV-2026-0042', client: 'Migros SA',       base_amount: 45000, rate: 10, commission_amount: 4500,  status: 'validated', date_created: '2026-02-15', paid_at: null },
  { id: 2, deal: 'DEV-2026-0038', client: 'Coop Suisse',     base_amount: 32000, rate: 8,  commission_amount: 2560,  status: 'paid',      date_created: '2026-01-20', paid_at: '2026-02-01' },
  { id: 3, deal: 'DEV-2026-0035', client: 'Rolex SA',        base_amount: 78000, rate: 12, commission_amount: 9360,  status: 'pending',   date_created: '2026-02-10', paid_at: null },
  { id: 4, deal: 'DEV-2025-0120', client: 'Nestle Suisse',   base_amount: 25000, rate: 10, commission_amount: 2500,  status: 'paid',      date_created: '2025-12-15', paid_at: '2026-01-10' },
  { id: 5, deal: 'DEV-2026-0045', client: 'SwissRE',         base_amount: 55000, rate: 10, commission_amount: 5500,  status: 'pending',   date_created: '2026-02-18', paid_at: null }
]

// ── Component ──

const CommissionsRevendeur = () => {
  const user = useAuthStore((s) => s.user)

  // TODO: Replace with useQuery + api.get('/items/commissions', { ... }) when collection exists
  const commissions = MOCK_COMMISSIONS

  // ── Computed KPIs ──
  const kpis = useMemo(() => {
    const pendingAndValidated = commissions.filter(
      (c) => c.status === 'pending' || c.status === 'validated'
    )
    const paid = commissions.filter((c) => c.status === 'paid')

    const totalDues = pendingAndValidated.reduce((sum, c) => sum + c.commission_amount, 0)
    const totalPaid = paid.reduce((sum, c) => sum + c.commission_amount, 0)

    const totalRates = commissions.reduce((sum, c) => sum + c.rate, 0)
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
      .reduce((sum, c) => sum + c.commission_amount, 0)
  }, [commissions])

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
              {commissions.map((c) => {
                const cfg = STATUS_CONFIG[c.status] || STATUS_CONFIG.pending
                return (
                  <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Receipt size={14} className="text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">{c.deal}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{c.client}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-right">{formatCHF(c.base_amount)}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-right">{c.rate}%</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">{formatCHF(c.commission_amount)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`ds-badge inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.cls}`}>
                        {cfg.label}
                      </span>
                    </td>
                  </tr>
                )
              })}
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
            {recentPaid.map((c) => (
              <div key={c.id} className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                    <ArrowUpRight size={16} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{c.deal} — {c.client}</p>
                    <p className="text-xs text-gray-400">
                      Paye le {formatDate(c.paid_at)}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-bold text-green-600">+{formatCHF(c.commission_amount)}</span>
              </div>
            ))}
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
