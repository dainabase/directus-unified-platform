/**
 * FinancesClient — Financial overview for client portal
 *
 * Sections:
 * 1. KPI cards: Total facture, Total paye, Solde du
 * 2. Recharts BarChart: 6 last months (facture vs paye)
 * 3. Full history table with running balance
 * 4. CSV export button (semicolon delimiter, UTF-8 BOM)
 *
 * @date 2026-02-20
 */

import React, { useMemo, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts'
import {
  Receipt, Wallet, AlertTriangle, Download,
  Loader2, TrendingUp
} from 'lucide-react'
import api from '../../../lib/axios'
import { useClientAuth } from '../hooks/useClientAuth'
import KPICard from '../components/KPICard'
import StatusBadge from '../components/StatusBadge'
import EmptyState from '../components/EmptyState'

// ── Helpers ──

const formatCHF = (value) =>
  new Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF' }).format(value || 0)

const formatDate = (d) => {
  if (!d) return '\u2014'
  return new Date(d).toLocaleDateString('fr-CH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const MONTH_LABELS_FR = [
  'Jan.', 'Fev.', 'Mars', 'Avr.', 'Mai', 'Juin',
  'Juil.', 'Aout', 'Sept.', 'Oct.', 'Nov.', 'Dec.'
]

// ── Fetch ──

async function fetchClientInvoices(contactId) {
  const { data } = await api.get('/items/client_invoices', {
    params: {
      filter: { contact_id: { _eq: contactId } },
      fields: [
        'id', 'invoice_number', 'amount', 'total', 'status',
        'due_date', 'date_created', 'tax_rate', 'tax_amount', 'currency'
      ],
      sort: ['-date_created'],
      limit: -1
    }
  }).catch(() => ({ data: { data: [] } }))
  return data?.data || []
}

// ── Tooltip for BarChart ──

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null
  return (
    <div
      className="ds-card px-4 py-3 shadow-lg"
      style={{ border: '1px solid var(--border-light, #E5E5EA)' }}
    >
      <p
        className="text-xs font-medium mb-2"
        style={{ color: 'var(--text-secondary, #6E6E73)' }}
      >
        {label}
      </p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2 text-sm">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ background: entry.color }}
          />
          <span style={{ color: 'var(--text-secondary, #6E6E73)' }}>
            {entry.name}:
          </span>
          <span className="font-semibold" style={{ color: 'var(--text-primary, #1D1D1F)' }}>
            {formatCHF(entry.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

// ── Main Component ──

const FinancesClient = () => {
  const { client } = useClientAuth()
  const contactId = client?.id

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['client-finances-invoices', contactId],
    queryFn: () => fetchClientInvoices(contactId),
    enabled: !!contactId,
    staleTime: 30_000
  })

  // ── KPI calculations ──

  const { totalFacture, totalPaye, soldeDu } = useMemo(() => {
    let facture = 0
    let paye = 0

    for (const inv of invoices) {
      const t = Number(inv.total) || 0
      facture += t
      if (inv.status === 'paid') {
        paye += t
      }
    }

    return {
      totalFacture: facture,
      totalPaye: paye,
      soldeDu: facture - paye
    }
  }, [invoices])

  // ── Chart data: last 6 months ──

  const chartData = useMemo(() => {
    const now = new Date()
    const months = []

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push({
        year: d.getFullYear(),
        month: d.getMonth(),
        label: `${MONTH_LABELS_FR[d.getMonth()]} ${d.getFullYear().toString().slice(2)}`,
        facture: 0,
        paye: 0
      })
    }

    for (const inv of invoices) {
      if (!inv.date_created) continue
      const date = new Date(inv.date_created)
      const y = date.getFullYear()
      const m = date.getMonth()
      const t = Number(inv.total) || 0

      const bucket = months.find((b) => b.year === y && b.month === m)
      if (bucket) {
        bucket.facture += t
        if (inv.status === 'paid') {
          bucket.paye += t
        }
      }
    }

    return months.map(({ label, facture, paye }) => ({
      name: label,
      facture: Math.round(facture * 100) / 100,
      paye: Math.round(paye * 100) / 100
    }))
  }, [invoices])

  // ── History with running balance ──

  const historyRows = useMemo(() => {
    const sorted = [...invoices].sort((a, b) => {
      const da = a.date_created ? new Date(a.date_created).getTime() : 0
      const db = b.date_created ? new Date(b.date_created).getTime() : 0
      return db - da
    })

    // Running balance: walk from oldest to newest, then reverse for display
    const ascending = [...sorted].reverse()
    let balance = 0
    const withBalance = ascending.map((inv) => {
      const t = Number(inv.total) || 0
      if (inv.status === 'paid') {
        // paid invoice: was added, then removed from balance
        balance += 0
      } else if (inv.status !== 'cancelled') {
        balance += t
      }
      return { ...inv, runningBalance: balance }
    })

    // Return in desc order (newest first)
    return withBalance.reverse()
  }, [invoices])

  // ── CSV Export ──

  const handleExportCSV = useCallback(() => {
    const BOM = '\uFEFF'
    const header = 'Type;Reference;Date;Montant CHF;Statut;Solde courant'
    const rows = historyRows.map((inv) => {
      const type = 'Facture'
      const ref = inv.invoice_number || ''
      const date = formatDate(inv.date_created)
      const montant = formatCHF(inv.total)
      const statut = inv.status || ''
      const solde = formatCHF(inv.runningBalance)
      return `${type};${ref};${date};${montant};${statut};${solde}`
    })

    const csvContent = BOM + [header, ...rows].join('\r\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = 'historique-finances-client.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [historyRows])

  // ── Loading ──

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#0071E3' }} />
      </div>
    )
  }

  // ── Empty state ──

  if (invoices.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary, #1D1D1F)' }}>
            Mes finances
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary, #6E6E73)' }}>
            Vue d'ensemble de votre situation financiere.
          </p>
        </div>
        <EmptyState
          icon={Receipt}
          title="Aucune donnee financiere"
          subtitle="Vos factures et paiements apparaitront ici une fois disponibles."
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1
          className="text-xl font-bold"
          style={{ color: 'var(--text-primary, #1D1D1F)' }}
        >
          Mes finances
        </h1>
        <p
          className="text-sm mt-1"
          style={{ color: 'var(--text-secondary, #6E6E73)' }}
        >
          Vue d'ensemble de votre situation financiere.
        </p>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard
          title="Total facture"
          value={formatCHF(totalFacture)}
          icon={Receipt}
          subtitle={`${invoices.length} facture${invoices.length > 1 ? 's' : ''}`}
        />
        <KPICard
          title="Total paye"
          value={formatCHF(totalPaye)}
          icon={Wallet}
          subtitle={`${invoices.filter((i) => i.status === 'paid').length} facture${invoices.filter((i) => i.status === 'paid').length > 1 ? 's' : ''} payee${invoices.filter((i) => i.status === 'paid').length > 1 ? 's' : ''}`}
        />
        <div className="ds-card p-5 transition-all duration-200 hover:shadow-md">
          <div className="flex items-start justify-between mb-3">
            <div
              className="w-[34px] h-[34px] rounded-lg flex items-center justify-center"
              style={{ background: soldeDu > 0 ? 'rgba(255,59,48,0.10)' : 'rgba(52,199,89,0.10)' }}
            >
              <AlertTriangle size={18} style={{ color: soldeDu > 0 ? '#FF3B30' : '#34C759' }} />
            </div>
          </div>
          <p
            className="font-bold mb-0.5"
            style={{
              fontSize: 26,
              lineHeight: '32px',
              color: soldeDu > 0 ? '#FF3B30' : '#34C759'
            }}
          >
            {formatCHF(soldeDu)}
          </p>
          <p className="text-sm" style={{ color: 'var(--text-secondary, #6E6E73)' }}>
            Solde du
          </p>
          {soldeDu > 0 && (
            <p className="text-xs mt-1" style={{ color: '#FF3B30' }}>
              {invoices.filter((i) => i.status !== 'paid' && i.status !== 'cancelled').length} facture{invoices.filter((i) => i.status !== 'paid' && i.status !== 'cancelled').length > 1 ? 's' : ''} en attente
            </p>
          )}
          {soldeDu <= 0 && (
            <p className="text-xs mt-1" style={{ color: '#34C759' }}>
              Aucun solde en cours
            </p>
          )}
        </div>
      </div>

      {/* ── BarChart: 6 derniers mois ── */}
      <div className="ds-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2
              className="text-base font-semibold"
              style={{ color: 'var(--text-primary, #1D1D1F)' }}
            >
              Apercu mensuel
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary, #AEAEB2)' }}>
              6 derniers mois — Facture vs Paye
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-secondary, #6E6E73)' }}>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#0071E3' }} />
              Facture
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#D1D1D6' }} />
              Paye
            </div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} barCategoryGap="20%">
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#AEAEB2' }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#AEAEB2' }}
              tickFormatter={(v) =>
                v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v.toString()
              }
              width={50}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
            <Bar
              dataKey="facture"
              name="Facture"
              fill="#0071E3"
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
            />
            <Bar
              dataKey="paye"
              name="Paye"
              fill="#D1D1D6"
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── History Table ── */}
      <div className="ds-card overflow-hidden">
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--border-light, #E5E5EA)' }}
        >
          <div>
            <h2
              className="text-base font-semibold"
              style={{ color: 'var(--text-primary, #1D1D1F)' }}
            >
              Historique complet
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary, #AEAEB2)' }}>
              {invoices.length} enregistrement{invoices.length > 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors"
            style={{
              background: 'var(--bg-secondary, #F5F5F7)',
              color: 'var(--text-secondary, #6E6E73)'
            }}
          >
            <Download size={14} />
            Exporter CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr
                className="text-xs uppercase tracking-wide"
                style={{
                  color: 'var(--text-tertiary, #AEAEB2)',
                  borderBottom: '1px solid var(--border-light, #E5E5EA)'
                }}
              >
                <th className="text-left px-5 py-3 font-medium">Type</th>
                <th className="text-left px-5 py-3 font-medium">Reference</th>
                <th className="text-left px-5 py-3 font-medium">Date</th>
                <th className="text-right px-5 py-3 font-medium">Montant</th>
                <th className="text-left px-5 py-3 font-medium">Statut</th>
                <th className="text-right px-5 py-3 font-medium">Solde courant</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--border-light, #F5F5F7)' }}>
              {historyRows.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp size={14} style={{ color: '#0071E3' }} />
                      <span style={{ color: 'var(--text-secondary, #6E6E73)' }}>
                        Facture
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3 font-medium" style={{ color: 'var(--text-primary, #1D1D1F)' }}>
                    {inv.invoice_number || '\u2014'}
                  </td>
                  <td className="px-5 py-3" style={{ color: 'var(--text-secondary, #6E6E73)' }}>
                    {formatDate(inv.date_created)}
                  </td>
                  <td className="px-5 py-3 text-right font-semibold" style={{ color: 'var(--text-primary, #1D1D1F)' }}>
                    {formatCHF(inv.total)}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={inv.status} />
                  </td>
                  <td
                    className="px-5 py-3 text-right font-semibold"
                    style={{
                      color: inv.runningBalance > 0 ? '#FF3B30' : '#34C759'
                    }}
                  >
                    {formatCHF(inv.runningBalance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default FinancesClient
