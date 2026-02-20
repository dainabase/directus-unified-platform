/**
 * CEOReportModule — S-06-04
 * Apercu du rapport CEO quotidien avec KPIs agreges multi-entreprise.
 * Consomme GET /api/reports/ceo-daily
 */

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  FileText, TrendingUp, TrendingDown, AlertTriangle, Loader2,
  DollarSign, Clock, Headphones, FolderOpen, Users, RefreshCw,
  ArrowUpRight, ArrowDownRight
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import api from '../../../../lib/axios'

const formatCHF = (v) =>
  new Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF', minimumFractionDigits: 0 }).format(v || 0)

async function fetchCEOReport(companyId) {
  const params = companyId ? { company: companyId } : {}
  const { data } = await api.get('/api/reports/ceo-daily', { params }).catch(() => ({ data: { data: null } }))
  return data?.data || null
}

const KPICard = ({ icon: Icon, label, value, subtitle, color = 'text-gray-900', iconColor = 'text-blue-500' }) => (
  <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm p-4">
    <div className="flex items-center gap-2 mb-2">
      <Icon size={16} className={iconColor} />
      <span className="text-xs text-gray-500 uppercase tracking-wide">{label}</span>
    </div>
    <p className={`text-2xl font-bold ${color}`}>{value}</p>
    {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
  </div>
)

const SEVERITY_COLORS = {
  critical: 'bg-red-50 border-red-200 text-red-700',
  warning: 'bg-amber-50 border-amber-200 text-amber-700',
  info: 'bg-blue-50 border-blue-200 text-blue-700'
}

const CEOReportModule = () => {
  const [companyFilter, setCompanyFilter] = useState('')

  const { data: report, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['ceo-daily-report', companyFilter],
    queryFn: () => fetchCEOReport(companyFilter || null),
    staleTime: 60_000
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <FileText size={20} className="text-blue-500" />
            Rapport CEO quotidien
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {report ? `Genere le ${format(new Date(report.generated_at), 'dd MMMM yyyy a HH:mm', { locale: fr })}` : 'Vue synthetique multi-entreprise'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {report?.companies && (
            <select
              value={companyFilter}
              onChange={e => setCompanyFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">Toutes les entreprises</option>
              {report.companies.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          )}
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
            Actualiser
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : !report ? (
        <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm p-12 text-center">
          <FileText className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-500">Rapport non disponible</p>
          <p className="text-xs text-gray-400 mt-1">Le backend n'est peut-etre pas demarre</p>
        </div>
      ) : (
        <>
          {/* KPI Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KPICard
              icon={DollarSign}
              label="Tresorerie"
              value={formatCHF(report.kpis.cash_balance)}
              iconColor="text-emerald-500"
              color={report.kpis.cash_balance < 50000 ? 'text-red-600' : 'text-emerald-600'}
            />
            <KPICard
              icon={TrendingUp}
              label="CA du mois"
              value={formatCHF(report.kpis.revenue_month)}
              iconColor="text-blue-500"
              color="text-blue-600"
            />
            <KPICard
              icon={TrendingDown}
              label="Factures en retard"
              value={formatCHF(report.kpis.overdue_amount)}
              subtitle={`${report.kpis.overdue_count} facture(s)`}
              iconColor="text-red-400"
              color={report.kpis.overdue_count > 0 ? 'text-red-600' : 'text-gray-900'}
            />
            <KPICard
              icon={Users}
              label="Pipeline"
              value={formatCHF(report.kpis.pipeline_value)}
              subtitle={`${report.kpis.open_leads} lead(s) actif(s)`}
              iconColor="text-blue-500"
              color="text-blue-600"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KPICard
              icon={Headphones}
              label="Tickets ouverts"
              value={report.kpis.open_tickets}
              subtitle={report.kpis.critical_tickets > 0 ? `${report.kpis.critical_tickets} critique(s)` : null}
              iconColor="text-amber-500"
              color={report.kpis.critical_tickets > 0 ? 'text-red-600' : 'text-gray-900'}
            />
            <KPICard
              icon={FolderOpen}
              label="Projets actifs"
              value={report.kpis.active_projects}
              iconColor="text-cyan-500"
              color="text-cyan-600"
            />
          </div>

          {/* Alerts */}
          {report.alerts.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                <AlertTriangle size={14} className="text-amber-500" />
                Alertes ({report.alerts.length})
              </h3>
              {report.alerts.map((alert, i) => (
                <div key={i} className={`rounded-lg border px-4 py-3 text-sm flex items-center gap-2 ${SEVERITY_COLORS[alert.severity] || SEVERITY_COLORS.info}`}>
                  <AlertTriangle size={14} className="flex-shrink-0" />
                  {alert.message}
                </div>
              ))}
            </div>
          )}

          {/* Details panels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top overdue invoices */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700">Factures en retard (top 5)</h3>
              </div>
              {report.details.top_overdue.length === 0 ? (
                <div className="p-6 text-center text-sm text-gray-400">Aucune facture en retard</div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {report.details.top_overdue.map(inv => (
                    <div key={inv.id} className="px-4 py-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{inv.client || 'Client'}</p>
                        <p className="text-xs text-gray-400">
                          Echeance: {inv.due_date ? format(new Date(inv.due_date), 'dd MMM yyyy', { locale: fr }) : '—'}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-red-600">{formatCHF(inv.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent open tickets */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700">Tickets recents (top 5)</h3>
              </div>
              {report.details.recent_tickets.length === 0 ? (
                <div className="p-6 text-center text-sm text-gray-400">Aucun ticket ouvert</div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {report.details.recent_tickets.map(t => (
                    <div key={t.id} className="px-4 py-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{t.subject || `#${t.id?.toString().slice(0, 8)}`}</p>
                        <p className="text-xs text-gray-400">
                          {t.date ? format(new Date(t.date), 'dd MMM yyyy', { locale: fr }) : '—'}
                        </p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        t.priority === 'critical' ? 'bg-red-100 text-red-700' :
                        t.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>{t.priority || 'medium'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default CEOReportModule
