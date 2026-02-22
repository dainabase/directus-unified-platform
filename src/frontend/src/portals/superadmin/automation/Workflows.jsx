/**
 * Workflows — Story 7.2
 * Workflow management dashboard.
 * Predefined workflow definitions + dynamic execution data from Directus.
 * Toggle ON/OFF, execution history, error monitoring.
 */

import React, { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Workflow, Zap, Clock, AlertCircle, CheckCircle, Play, Pause,
  Loader2, ChevronRight, X, Eye, BarChart3, TrendingUp,
  Activity, Timer, RefreshCw, ArrowRight
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { fr } from 'date-fns/locale'
import toast from 'react-hot-toast'
import api from '../../../lib/axios'

// ── Predefined Workflows ─────────────────────────────────────
const WORKFLOW_DEFINITIONS = [
  {
    id: 'wf-lead-qualification',
    name: 'Lead entrant → qualification LLM',
    trigger: 'new_lead',
    triggerLabel: 'Nouveau lead',
    description: 'Qualification automatique des leads entrants via LLM (scoring, categorie, priorite)'
  },
  {
    id: 'wf-quote-to-invoice',
    name: 'Signature devis → facture acompte',
    trigger: 'docuseal_webhook',
    triggerLabel: 'DocuSeal webhook',
    description: 'Creation automatique de la facture d\'acompte apres signature electronique du devis'
  },
  {
    id: 'wf-payment-activation',
    name: 'Paiement recu → activation projet',
    trigger: 'revolut_webhook',
    triggerLabel: 'Revolut webhook',
    description: 'Activation automatique du projet apres reception du paiement d\'acompte'
  },
  {
    id: 'wf-invoice-reminder',
    name: 'Facture en retard → relance auto',
    trigger: 'cron_daily',
    triggerLabel: 'Cron quotidien 9h',
    description: 'Envoi automatique des relances pour les factures impayees (Mahnung 1/2/3)'
  },
  {
    id: 'wf-supplier-notification',
    name: 'Facture prestataire → notification CEO',
    trigger: 'new_supplier_invoice',
    triggerLabel: 'Nouvelle facture fournisseur',
    description: 'Notification CEO a chaque nouvelle facture prestataire pour validation rapide'
  },
  {
    id: 'wf-monthly-report',
    name: 'Rapport mensuel → email CEO',
    trigger: 'cron_monthly',
    triggerLabel: 'Cron 1er du mois',
    description: 'Generation et envoi automatique du rapport financier mensuel consolide'
  }
]

const TRIGGER_CONFIG = {
  new_lead: { color: 'bg-zinc-100 text-zinc-700' },
  docuseal_webhook: { color: 'bg-zinc-100 text-zinc-700' },
  revolut_webhook: { color: 'bg-zinc-100 text-zinc-700' },
  cron_daily: { color: 'bg-amber-50 text-amber-700' },
  new_supplier_invoice: { color: 'bg-zinc-100 text-zinc-700' },
  cron_monthly: { color: 'bg-amber-50 text-amber-700' }
}

const STATUS_DOT = {
  success: { color: 'var(--semantic-green)', label: 'Succes' },
  error: { color: 'var(--semantic-red)', label: 'Erreur' },
  running: { color: 'var(--semantic-orange)', label: 'En cours', pulse: true },
  pending: { color: 'var(--label-3)', label: 'En attente' }
}

// ── KPI Card ─────────────────────────────────────────────────
const KpiCard = ({ icon: Icon, label, value, color, iconStyle }) => (
  <div className="ds-card p-4">
    <div className="flex items-center gap-2 mb-1">
      <Icon size={14} className={color || 'text-zinc-400'} style={iconStyle} />
      <span className="text-xs text-zinc-500">{label}</span>
    </div>
    <p className="text-2xl font-bold text-zinc-900">{value}</p>
  </div>
)

// ── Status Dot ───────────────────────────────────────────────
const StatusDot = ({ status }) => {
  const cfg = STATUS_DOT[status] || STATUS_DOT.pending
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={`w-2 h-2 rounded-full inline-block ${cfg.pulse ? 'animate-pulse' : ''}`}
        style={{ backgroundColor: cfg.color }}
      />
      <span className="text-xs text-zinc-600">{cfg.label}</span>
    </span>
  )
}

// ── Toggle Switch ────────────────────────────────────────────
const ToggleSwitch = ({ enabled, onChange, disabled }) => (
  <button
    type="button"
    onClick={(e) => { e.stopPropagation(); onChange(!enabled) }}
    disabled={disabled}
    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
      enabled ? '' : 'bg-zinc-200'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    style={enabled ? { backgroundColor: 'var(--semantic-green)' } : undefined}
  >
    <span
      className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
        enabled ? 'translate-x-[18px]' : 'translate-x-[3px]'
      }`}
    />
  </button>
)

// ── Execution Detail Modal ───────────────────────────────────
const ExecutionDetailModal = ({ execution, onClose }) => {
  if (!execution) return null

  const statusCfg = STATUS_DOT[execution.status] || STATUS_DOT.pending

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-zinc-100">
          <h3 className="text-lg font-bold text-zinc-900">Detail d'execution</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-zinc-100 rounded-lg transition-colors">
            <X size={18} className="text-zinc-400" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Status */}
          <div className="flex items-center gap-3">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: statusCfg.color }}
            />
            <span className="text-sm font-medium text-zinc-900">{statusCfg.label}</span>
            {execution.duration_ms != null && (
              <span className="ds-badge bg-zinc-100 text-zinc-600">
                {execution.duration_ms}ms
              </span>
            )}
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-zinc-400 mb-0.5">Workflow</p>
              <p className="text-zinc-900 font-medium">{execution.workflow_name || execution.workflow_id || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-400 mb-0.5">Demarre</p>
              <p className="text-zinc-700">
                {execution.started_at
                  ? format(new Date(execution.started_at), 'dd MMM yyyy HH:mm:ss', { locale: fr })
                  : '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-400 mb-0.5">Termine</p>
              <p className="text-zinc-700">
                {execution.finished_at
                  ? format(new Date(execution.finished_at), 'dd MMM yyyy HH:mm:ss', { locale: fr })
                  : '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-400 mb-0.5">Trigger</p>
              <p className="text-zinc-700">{execution.trigger_type || '—'}</p>
            </div>
          </div>

          {/* Error message */}
          {execution.error_message && (
            <div className="border rounded-lg p-3" style={{ borderColor: 'var(--semantic-red)', backgroundColor: 'var(--tint-red)' }}>
              <p className="text-xs font-semibold mb-1" style={{ color: 'var(--semantic-red)' }}>Erreur</p>
              <pre className="text-xs text-zinc-700 whitespace-pre-wrap font-mono">
                {execution.error_message}
              </pre>
            </div>
          )}

          {/* Logs */}
          {execution.logs && (
            <div>
              <p className="text-xs text-zinc-400 mb-1">Logs</p>
              <pre className="text-xs text-zinc-600 bg-zinc-50 border border-zinc-200 rounded-lg p-3 max-h-48 overflow-y-auto font-mono whitespace-pre-wrap">
                {typeof execution.logs === 'string' ? execution.logs : JSON.stringify(execution.logs, null, 2)}
              </pre>
            </div>
          )}

          {/* Input/Output data */}
          {execution.input_data && (
            <div>
              <p className="text-xs text-zinc-400 mb-1">Donnees d'entree</p>
              <pre className="text-xs text-zinc-600 bg-zinc-50 border border-zinc-200 rounded-lg p-3 max-h-32 overflow-y-auto font-mono whitespace-pre-wrap">
                {typeof execution.input_data === 'string' ? execution.input_data : JSON.stringify(execution.input_data, null, 2)}
              </pre>
            </div>
          )}

          {execution.output_data && (
            <div>
              <p className="text-xs text-zinc-400 mb-1">Donnees de sortie</p>
              <pre className="text-xs text-zinc-600 bg-zinc-50 border border-zinc-200 rounded-lg p-3 max-h-32 overflow-y-auto font-mono whitespace-pre-wrap">
                {typeof execution.output_data === 'string' ? execution.output_data : JSON.stringify(execution.output_data, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="flex justify-end p-5 border-t border-zinc-100">
          <button onClick={onClose} className="ds-btn ds-btn-secondary">
            Fermer
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Component ───────────────────────────────────────────
export const Workflows = () => {
  const queryClient = useQueryClient()
  const [selectedWorkflow, setSelectedWorkflow] = useState(null)
  const [showHistory, setShowHistory] = useState(false)
  const [selectedExecution, setSelectedExecution] = useState(null)
  const [enabledWorkflows, setEnabledWorkflows] = useState(() => {
    // Default all workflows to enabled
    const map = {}
    WORKFLOW_DEFINITIONS.forEach(wf => { map[wf.id] = true })
    return map
  })

  // Fetch executions from Directus
  const { data: executions = [], isLoading: loadingExecs } = useQuery({
    queryKey: ['workflow-executions'],
    queryFn: async () => {
      const res = await api.get('/items/workflow_executions', {
        params: {
          fields: ['id', 'workflow_id', 'workflow_name', 'status', 'started_at', 'finished_at', 'duration_ms', 'trigger_type', 'trigger_data', 'input_data', 'output_data', 'error_message', 'logs'],
          sort: ['-started_at'],
          limit: 50
        }
      })
      return res.data?.data || []
    },
    staleTime: 15_000
  })

  // KPIs
  const kpis = useMemo(() => {
    const total = WORKFLOW_DEFINITIONS.length
    const active = Object.values(enabledWorkflows).filter(Boolean).length
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayExecs = executions.filter(e =>
      e.started_at && new Date(e.started_at) >= todayStart
    )
    const errors = executions.filter(e => e.status === 'error')
    const errorRate = executions.length > 0
      ? Math.round((errors.length / executions.length) * 100)
      : 0
    return { total, active, todayExecs: todayExecs.length, errorRate }
  }, [executions, enabledWorkflows])

  // Workflow status from executions
  const getWorkflowStatus = (wfId) => {
    const wfExecs = executions.filter(e => e.workflow_id === wfId)
    if (wfExecs.length === 0) return { status: 'pending', lastExec: null, errorAge: null }

    const latest = wfExecs[0]
    let errorAge = null
    if (latest.status === 'error' && latest.started_at) {
      const hours = (Date.now() - new Date(latest.started_at).getTime()) / (1000 * 60 * 60)
      errorAge = hours
    }

    return {
      status: latest.status || 'pending',
      lastExec: latest.started_at,
      errorAge
    }
  }

  // Toggle workflow
  const handleToggle = (wfId, enabled) => {
    setEnabledWorkflows(prev => ({ ...prev, [wfId]: enabled }))
    toast.success(enabled ? 'Workflow active' : 'Workflow desactive')
  }

  // Filtered history for selected workflow
  const historyExecs = useMemo(() => {
    if (!selectedWorkflow) return executions
    return executions.filter(e => e.workflow_id === selectedWorkflow)
  }, [executions, selectedWorkflow])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-wide">Automation</p>
          <h2 className="text-xl font-bold text-zinc-900">Workflows</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="ds-badge bg-green-50 text-green-700">{kpis.active} actifs</span>
          {kpis.errorRate > 0 && (
            <span className="ds-badge" style={{ background: 'var(--tint-red)', color: 'var(--semantic-red)' }}>
              {kpis.errorRate}% erreurs
            </span>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard icon={Workflow} label="Total workflows" value={kpis.total} />
        <KpiCard
          icon={Zap}
          label="Actifs"
          value={kpis.active}
          iconStyle={{ color: 'var(--semantic-green)' }}
        />
        <KpiCard
          icon={Activity}
          label="Executions aujourd'hui"
          value={kpis.todayExecs}
          iconStyle={{ color: 'var(--accent)' }}
        />
        <KpiCard
          icon={AlertCircle}
          label="Taux d'erreur"
          value={`${kpis.errorRate}%`}
          iconStyle={kpis.errorRate > 10 ? { color: 'var(--semantic-red)' } : undefined}
          color={kpis.errorRate > 10 ? undefined : 'text-zinc-400'}
        />
      </div>

      {/* Workflows list */}
      <div className="ds-card overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-100">
          <h3 className="text-sm font-semibold text-zinc-700">Workflows configures</h3>
        </div>
        <div className="divide-y divide-zinc-50">
          {WORKFLOW_DEFINITIONS.map(wf => {
            const triggerCfg = TRIGGER_CONFIG[wf.trigger] || TRIGGER_CONFIG.new_lead
            const wfStatus = getWorkflowStatus(wf.id)
            const isEnabled = enabledWorkflows[wf.id] !== false

            return (
              <div
                key={wf.id}
                className="flex items-center gap-4 px-4 py-3.5 hover:bg-zinc-50/50 transition-colors"
              >
                {/* Toggle */}
                <ToggleSwitch
                  enabled={isEnabled}
                  onChange={(val) => handleToggle(wf.id, val)}
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className={`text-sm font-medium ${isEnabled ? 'text-zinc-900' : 'text-zinc-400'}`}>
                      {wf.name}
                    </p>
                    {wfStatus.errorAge != null && wfStatus.errorAge > 24 && (
                      <span
                        className="ds-badge"
                        style={{ background: 'var(--tint-red)', color: 'var(--semantic-red)' }}
                      >
                        Erreur &gt;24h
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 line-clamp-1">{wf.description}</p>
                </div>

                {/* Trigger badge */}
                <span className={`ds-badge ${triggerCfg.color} hidden sm:inline-flex`}>
                  {wf.triggerLabel}
                </span>

                {/* Status */}
                <StatusDot status={wfStatus.status} />

                {/* Last execution */}
                <span className="text-xs text-zinc-400 min-w-[80px] text-right hidden md:block">
                  {wfStatus.lastExec
                    ? formatDistanceToNow(new Date(wfStatus.lastExec), { addSuffix: true, locale: fr })
                    : 'Jamais'}
                </span>

                {/* History button */}
                <button
                  onClick={() => {
                    setSelectedWorkflow(wf.id)
                    setShowHistory(true)
                  }}
                  className="ds-btn ds-btn-ghost text-xs"
                >
                  <Eye size={14} />
                  <span className="hidden sm:inline">Historique</span>
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Execution History */}
      {showHistory && (
        <div className="ds-card overflow-hidden ds-fade-in">
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-zinc-400" />
              <h3 className="text-sm font-semibold text-zinc-700">
                Historique des executions
                {selectedWorkflow && (
                  <span className="font-normal text-zinc-400 ml-1">
                    — {WORKFLOW_DEFINITIONS.find(w => w.id === selectedWorkflow)?.name}
                  </span>
                )}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              {selectedWorkflow && (
                <button
                  onClick={() => setSelectedWorkflow(null)}
                  className="text-xs text-zinc-500 hover:text-zinc-700"
                >
                  Tous les workflows
                </button>
              )}
              <button
                onClick={() => { setShowHistory(false); setSelectedWorkflow(null) }}
                className="p-1 hover:bg-zinc-100 rounded-lg transition-colors"
              >
                <X size={16} className="text-zinc-400" />
              </button>
            </div>
          </div>

          {loadingExecs ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-zinc-400 animate-spin" />
            </div>
          ) : historyExecs.length === 0 ? (
            <div className="py-12 text-center">
              <Clock className="w-8 h-8 text-zinc-200 mx-auto mb-2" />
              <p className="text-sm text-zinc-400">Aucune execution enregistree</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wide border-b border-zinc-100">
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Workflow</th>
                    <th className="px-4 py-3">Statut</th>
                    <th className="px-4 py-3">Duree</th>
                    <th className="px-4 py-3">Trigger</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {historyExecs.map(exec => (
                    <tr
                      key={exec.id}
                      className="hover:bg-zinc-50/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedExecution(exec)}
                    >
                      <td className="px-4 py-3 text-xs text-zinc-500">
                        {exec.started_at
                          ? format(new Date(exec.started_at), 'dd MMM yyyy HH:mm', { locale: fr })
                          : '—'}
                      </td>
                      <td className="px-4 py-3 font-medium text-zinc-900">
                        {exec.workflow_name || exec.workflow_id || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <StatusDot status={exec.status} />
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-500">
                        {exec.duration_ms != null ? `${exec.duration_ms}ms` : '—'}
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-500">
                        {exec.trigger_type || '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedExecution(exec) }}
                          className="p-1.5 text-zinc-400 hover:text-zinc-900 rounded-lg hover:bg-zinc-100 transition-colors"
                        >
                          <ChevronRight size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* All executions (always visible if history not expanded for specific workflow) */}
      {!showHistory && (
        <div className="ds-card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-zinc-400" />
              <h3 className="text-sm font-semibold text-zinc-700">Dernieres executions</h3>
            </div>
            <button
              onClick={() => { setSelectedWorkflow(null); setShowHistory(true) }}
              className="text-xs font-medium hover:underline"
              style={{ color: 'var(--accent)' }}
            >
              Voir tout
            </button>
          </div>

          {loadingExecs ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-zinc-400 animate-spin" />
            </div>
          ) : executions.length === 0 ? (
            <div className="py-8 text-center">
              <Activity className="w-8 h-8 text-zinc-200 mx-auto mb-2" />
              <p className="text-sm text-zinc-400">Aucune execution recente</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-50">
              {executions.slice(0, 5).map(exec => {
                const statusCfg = STATUS_DOT[exec.status] || STATUS_DOT.pending
                return (
                  <div
                    key={exec.id}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-50/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedExecution(exec)}
                  >
                    <span
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${exec.status === 'running' ? 'animate-pulse' : ''}`}
                      style={{ backgroundColor: statusCfg.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-900 truncate">
                        {exec.workflow_name || exec.workflow_id || 'Workflow'}
                      </p>
                    </div>
                    <span className="text-xs text-zinc-400">
                      {exec.started_at
                        ? formatDistanceToNow(new Date(exec.started_at), { addSuffix: true, locale: fr })
                        : '—'}
                    </span>
                    <ChevronRight size={14} className="text-zinc-300" />
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Execution Detail Modal */}
      {selectedExecution && (
        <ExecutionDetailModal
          execution={selectedExecution}
          onClose={() => setSelectedExecution(null)}
        />
      )}
    </div>
  )
}

export default Workflows
