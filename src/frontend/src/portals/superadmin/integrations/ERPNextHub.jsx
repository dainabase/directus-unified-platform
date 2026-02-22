/**
 * ERPNextHub — Phase D (D.4.1)
 * Hub Integration ERPNext — read-only KPIs, comptabilite,
 * stock, HR depuis /api/erpnext/*.
 * Apple DS v2.0 tokens.
 *
 * Backend: /api/erpnext/* (health, kpis, chart/revenue, activities)
 * Note: Lecture seule — aucune ecriture vers ERPNext.
 *
 * @version 2.0.0
 * @date 2026-02-22
 */

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  BookOpen, ExternalLink, CheckCircle2, XCircle,
  RefreshCw, Loader2, TrendingUp, TrendingDown,
  Package, Users, FileText, BarChart3, AlertCircle
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import api from '../../../lib/axios'

const ERPNEXT_URL = import.meta.env.VITE_ERPNEXT_URL || 'https://erp.hypervisual.ch'

// ── Fetchers ──

const fetchERPNextHealth = async () => {
  try {
    const res = await api.get('/api/erpnext/health')
    return {
      online: res.data?.success === true || res.data?.status === 'ok',
      version: res.data?.version || null,
      warning: res.data?.warning || null
    }
  } catch {
    return { online: false, version: null, warning: null }
  }
}

const fetchERPNextKPIs = async () => {
  try {
    const res = await api.get('/api/erpnext/kpis')
    return res.data?.data || res.data || {}
  } catch {
    return {}
  }
}

const fetchERPNextRevenue = async () => {
  try {
    const res = await api.get('/api/erpnext/chart/revenue')
    return res.data?.data || res.data || []
  } catch {
    return []
  }
}

const fetchERPNextActivities = async () => {
  try {
    const res = await api.get('/api/erpnext/activities')
    return res.data?.data || res.data || []
  } catch {
    return []
  }
}

// ── Helpers ──

const formatCHF = (value) => {
  const num = parseFloat(value) || 0
  return new Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF' }).format(num)
}

const formatDate = (d) => {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('fr-CH', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

// ── Component ──

const ERPNextHub = ({ selectedCompany }) => {
  const companyId = selectedCompany?.id || selectedCompany || 'all'

  const {
    data: health = { online: false },
    isLoading: healthLoading,
    refetch: refetchHealth
  } = useQuery({
    queryKey: ['erpnext-health', companyId],
    queryFn: fetchERPNextHealth,
    staleTime: 30_000,
    refetchInterval: 60_000
  })

  const { data: kpis = {} } = useQuery({
    queryKey: ['erpnext-kpis', companyId],
    queryFn: fetchERPNextKPIs,
    staleTime: 60_000,
    enabled: health.online
  })

  const { data: revenueData = [] } = useQuery({
    queryKey: ['erpnext-revenue', companyId],
    queryFn: fetchERPNextRevenue,
    staleTime: 120_000,
    enabled: health.online
  })

  const { data: activities = [] } = useQuery({
    queryKey: ['erpnext-activities', companyId],
    queryFn: fetchERPNextActivities,
    staleTime: 60_000,
    enabled: health.online
  })

  // KPI values with safe defaults
  const revenue = kpis.revenue || kpis.total_revenue || 0
  const expenses = kpis.expenses || kpis.total_expenses || 0
  const glEntries = kpis.gl_entries || kpis.journal_entries || 0
  const stockItems = kpis.stock_items || kpis.items_in_stock || 0
  const employees = kpis.employees || kpis.active_employees || 0
  const openOrders = kpis.open_orders || kpis.pending_orders || 0

  return (
    <div className="space-y-6 ds-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="ds-meta uppercase tracking-wide" style={{ fontSize: 11 }}>Comptabilite</p>
          <h1 className="ds-page-title">ERPNext</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className={
            healthLoading
              ? 'ds-badge ds-badge-default'
              : health.online
                ? 'ds-badge ds-badge-success'
                : 'ds-badge ds-badge-danger'
          }>
            {healthLoading ? (
              <Loader2 size={12} className="animate-spin" />
            ) : health.online ? (
              <CheckCircle2 size={12} />
            ) : (
              <XCircle size={12} />
            )}
            {healthLoading ? 'Verification...' : health.online ? 'Connecte' : 'Hors ligne'}
          </span>
          {health.version && (
            <span className="ds-badge ds-badge-default">v{health.version}</span>
          )}
          <button
            onClick={() => refetchHealth()}
            disabled={healthLoading}
            className="ds-btn ds-btn-ghost !p-2"
            title="Tester la connexion"
          >
            <RefreshCw size={14} className={healthLoading ? 'animate-spin' : ''} />
          </button>
          <a
            href={ERPNEXT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="ds-btn ds-btn-secondary"
          >
            <ExternalLink size={14} />
            Ouvrir ERPNext
          </a>
        </div>
      </div>

      {/* Offline banner */}
      {!healthLoading && !health.online && (
        <div className="ds-alert ds-alert-danger">
          <XCircle size={18} />
          <div>
            <p style={{ fontWeight: 600, color: 'var(--semantic-red)' }}>Connexion ERPNext indisponible</p>
            <p className="ds-meta" style={{ marginTop: 2 }}>
              Verifiez que ERPNext est accessible et que les identifiants API sont corrects.
            </p>
          </div>
        </div>
      )}

      {/* Warning */}
      {health.online && health.warning && (
        <div className="ds-alert ds-alert-warning">
          <AlertCircle size={18} />
          <div>
            <p style={{ fontWeight: 600, color: 'var(--semantic-orange)' }}>Avertissement</p>
            <p className="ds-meta" style={{ marginTop: 2 }}>{health.warning}</p>
          </div>
        </div>
      )}

      {/* Read-only notice */}
      {health.online && (
        <div className="ds-alert ds-alert-info">
          <BookOpen size={16} />
          <p className="text-sm" style={{ color: 'var(--label-2)' }}>
            Mode lecture seule — les ecritures comptables se font directement dans ERPNext.
          </p>
        </div>
      )}

      {/* KPI Row */}
      {health.online && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Revenue */}
          <div className="ds-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg" style={{ background: 'var(--tint-green)' }}>
                <TrendingUp size={14} style={{ color: 'var(--semantic-green)' }} />
              </div>
              <p className="ds-meta uppercase tracking-wider" style={{ fontSize: 10 }}>Revenus</p>
            </div>
            <p className="text-lg font-bold" style={{ color: 'var(--label-1)' }}>
              {formatCHF(revenue)}
            </p>
          </div>

          {/* Expenses */}
          <div className="ds-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg" style={{ background: 'var(--tint-red)' }}>
                <TrendingDown size={14} style={{ color: 'var(--semantic-red)' }} />
              </div>
              <p className="ds-meta uppercase tracking-wider" style={{ fontSize: 10 }}>Depenses</p>
            </div>
            <p className="text-lg font-bold" style={{ color: 'var(--label-1)' }}>
              {formatCHF(expenses)}
            </p>
          </div>

          {/* GL Entries */}
          <div className="ds-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg" style={{ background: 'var(--tint-blue)' }}>
                <FileText size={14} style={{ color: 'var(--semantic-blue)' }} />
              </div>
              <p className="ds-meta uppercase tracking-wider" style={{ fontSize: 10 }}>Ecritures GL</p>
            </div>
            <p className="text-lg font-bold" style={{ color: 'var(--label-1)' }}>
              {glEntries.toLocaleString('fr-CH')}
            </p>
          </div>

          {/* Stock */}
          <div className="ds-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg" style={{ background: 'var(--tint-orange)' }}>
                <Package size={14} style={{ color: 'var(--semantic-orange)' }} />
              </div>
              <p className="ds-meta uppercase tracking-wider" style={{ fontSize: 10 }}>Stock</p>
            </div>
            <p className="text-lg font-bold" style={{ color: 'var(--label-1)' }}>
              {stockItems.toLocaleString('fr-CH')}
            </p>
          </div>

          {/* Employees */}
          <div className="ds-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg" style={{ background: 'var(--tint-blue)' }}>
                <Users size={14} style={{ color: 'var(--accent)' }} />
              </div>
              <p className="ds-meta uppercase tracking-wider" style={{ fontSize: 10 }}>Employes</p>
            </div>
            <p className="text-lg font-bold" style={{ color: 'var(--label-1)' }}>
              {employees}
            </p>
          </div>

          {/* Open Orders */}
          <div className="ds-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg" style={{ background: 'var(--tint-orange)' }}>
                <BarChart3 size={14} style={{ color: 'var(--semantic-orange)' }} />
              </div>
              <p className="ds-meta uppercase tracking-wider" style={{ fontSize: 10 }}>Commandes</p>
            </div>
            <p className="text-lg font-bold" style={{ color: 'var(--label-1)' }}>
              {openOrders}
            </p>
          </div>
        </div>
      )}

      {/* Revenue chart — Recharts BarChart */}
      {health.online && revenueData.length > 0 && (
        <div className="ds-card overflow-hidden">
          <div className="p-5" style={{ borderBottom: '1px solid var(--sep)' }}>
            <h3 className="ds-card-title">Revenus mensuels</h3>
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={revenueData.slice(-12).map(d => ({
                month: d.label || d.month || '',
                amount: parseFloat(d.value || d.amount) || 0
              }))}>
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: 'var(--label-3)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: 'var(--label-3)' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
                />
                <Tooltip
                  formatter={(value) => [formatCHF(value), 'Revenus']}
                  contentStyle={{
                    background: 'var(--bg-2, #fff)',
                    border: '1px solid var(--sep)',
                    borderRadius: 8,
                    fontSize: 13
                  }}
                />
                <Bar dataKey="amount" fill="var(--accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recent activities */}
      {health.online && activities.length > 0 && (
        <div className="ds-card overflow-hidden">
          <div className="p-5" style={{ borderBottom: '1px solid var(--sep)' }}>
            <h3 className="ds-card-title">Activite recente</h3>
          </div>
          <div>
            {activities.slice(0, 8).map((act, idx) => (
              <div
                key={act.id || act.subject || act.title}
                className="flex items-center justify-between px-5 py-3 transition-colors hover:bg-zinc-50"
                style={{
                  borderBottom: idx < activities.length - 1 ? '1px solid var(--sep)' : undefined
                }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'var(--tint-blue)' }}
                  >
                    <FileText size={14} style={{ color: 'var(--accent)' }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--label-1)' }}>
                      {act.subject || act.title || act.doctype || 'Activite'}
                    </p>
                    <p className="ds-meta truncate">
                      {act.description || act.content || ''}
                    </p>
                  </div>
                </div>
                <span className="ds-meta flex-shrink-0 ml-3">
                  {formatDate(act.creation || act.date || act.modified)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fallback iframe when online but no KPI data */}
      {health.online && !kpis.revenue && !kpis.total_revenue && activities.length === 0 && (
        <div className="ds-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="flex items-center justify-center rounded-lg"
              style={{ width: 40, height: 40, background: 'var(--tint-green)' }}
            >
              <BookOpen size={20} style={{ color: 'var(--semantic-green)' }} />
            </div>
            <div>
              <h2 className="ds-card-title">ERPNext v15</h2>
              <p className="ds-meta">Comptabilite, stock, RH, plan comptable PME Kafer</p>
            </div>
          </div>
          <iframe
            src={ERPNEXT_URL}
            title="ERPNext"
            className="w-full rounded-lg"
            style={{
              height: 'calc(100vh - 380px)',
              border: '1px solid var(--sep)',
            }}
          />
        </div>
      )}

      {/* Quick links */}
      {health.online && (
        <div className="ds-card p-5">
          <h3 className="ds-card-title mb-3">Liens rapides</h3>
          <div className="flex flex-wrap gap-3">
            <a href="/superadmin/finance/accounting" className="ds-btn ds-btn-primary">
              <BookOpen size={14} />
              Comptabilite
            </a>
            <a href="/superadmin/finance/vat" className="ds-btn ds-btn-secondary">
              TVA / Rapports
            </a>
            <a
              href={ERPNEXT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="ds-btn ds-btn-ghost"
            >
              <ExternalLink size={14} />
              Console ERPNext
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

export default ERPNextHub
