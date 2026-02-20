/**
 * KPIAlertsModule — S-06-03
 * Configurer des seuils d'alerte KPI et visualiser l'historique des declenchements.
 * Collection automation_rules (CRUD) + automation_logs (lecture).
 */

import React, { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Bell, Plus, Save, Trash2, Edit, X, Loader2,
  AlertTriangle, CheckCircle, Activity, TrendingUp, TrendingDown
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import toast from 'react-hot-toast'
import api from '../../../../lib/axios'

const METRIC_OPTIONS = [
  { value: 'revenue_monthly', label: 'CA mensuel' },
  { value: 'cash_balance', label: 'Tresorerie' },
  { value: 'burn_rate', label: 'Burn rate' },
  { value: 'runway_months', label: 'Runway (mois)' },
  { value: 'invoices_overdue', label: 'Factures en retard' },
  { value: 'open_tickets', label: 'Tickets ouverts' },
  { value: 'active_projects', label: 'Projets actifs' },
  { value: 'conversion_rate', label: 'Taux de conversion' },
  { value: 'mrr', label: 'MRR' },
  { value: 'collection_rate', label: 'Taux recouvrement' }
]

const OPERATOR_OPTIONS = [
  { value: 'gt', label: '>' },
  { value: 'gte', label: '>=' },
  { value: 'lt', label: '<' },
  { value: 'lte', label: '<=' },
  { value: 'eq', label: '=' }
]

const SEVERITY_CONFIG = {
  critical: { label: 'Critique', color: 'bg-red-100 text-red-700 border-red-200', icon: AlertTriangle },
  warning: { label: 'Attention', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: AlertTriangle },
  info: { label: 'Info', color: 'bg-zinc-100 text-zinc-700 border-zinc-200', icon: Activity }
}

const formatCHF = (v) =>
  new Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF', minimumFractionDigits: 0 }).format(v || 0)

// ── API helpers ──────────────────────────────────────────
async function fetchRules() {
  const { data } = await api.get('/items/automation_rules', {
    params: { fields: ['*'], sort: ['-date_created'], limit: 50 }
  }).catch(() => ({ data: { data: [] } }))
  return data?.data || []
}

async function createRule(payload) {
  const { data } = await api.post('/items/automation_rules', payload)
  return data?.data
}

async function updateRule(id, payload) {
  const { data } = await api.patch(`/items/automation_rules/${id}`, payload)
  return data?.data
}

async function deleteRule(id) {
  await api.delete(`/items/automation_rules/${id}`)
}

async function fetchLogs() {
  const { data } = await api.get('/items/automation_logs', {
    params: { fields: ['*'], sort: ['-date_created'], limit: 50 }
  }).catch(() => ({ data: { data: [] } }))
  return data?.data || []
}

// ── Rule Form ────────────────────────────────────────────
const RuleForm = ({ rule, onSave, onClose, isSaving }) => {
  const [form, setForm] = useState({
    name: rule?.name || '',
    metric: rule?.metric || 'revenue_monthly',
    operator: rule?.operator || 'lt',
    threshold: rule?.threshold ?? '',
    severity: rule?.severity || 'warning',
    active: rule?.active !== false,
    notification_email: rule?.notification_email || ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return toast.error('Nom requis')
    if (form.threshold === '' || isNaN(form.threshold)) return toast.error('Seuil invalide')
    onSave({ ...form, threshold: Number(form.threshold) })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">
              {rule ? 'Modifier la regle' : 'Nouvelle regle d\'alerte'}
            </h3>
            <button type="button" onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
              <X size={20} />
            </button>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
              <input type="text" value={form.name} required
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-zinc-500"
                placeholder="Ex: Alerte tresorerie basse" />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Metrique</label>
                <select value={form.metric}
                  onChange={e => setForm(p => ({ ...p, metric: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  {METRIC_OPTIONS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Operateur</label>
                <select value={form.operator}
                  onChange={e => setForm(p => ({ ...p, operator: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  {OPERATOR_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Seuil</label>
                <input type="number" value={form.threshold}
                  onChange={e => setForm(p => ({ ...p, threshold: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="0" step="any" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Severite</label>
                <select value={form.severity}
                  onChange={e => setForm(p => ({ ...p, severity: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  {Object.entries(SEVERITY_CONFIG).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.active}
                    onChange={e => setForm(p => ({ ...p, active: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300 text-zinc-900 focus:ring-zinc-500" />
                  <span className="text-sm text-gray-700">Regle active</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email notification</label>
              <input type="email" value={form.notification_email}
                onChange={e => setForm(p => ({ ...p, notification_email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="optionnel@exemple.ch" />
            </div>
          </div>
          <div className="flex justify-end gap-2 p-5 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
              Annuler
            </button>
            <button type="submit" disabled={isSaving}
              className="ds-btn ds-btn-primary flex items-center gap-2 px-4 py-2 text-sm rounded-lg disabled:opacity-50">
              {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {rule ? 'Mettre a jour' : 'Creer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Main Module ──────────────────────────────────────────
const KPIAlertsModule = () => {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editingRule, setEditingRule] = useState(null)

  const { data: rules = [], isLoading: loadingRules } = useQuery({
    queryKey: ['automation-rules'],
    queryFn: fetchRules,
    staleTime: 30_000
  })

  const { data: logs = [], isLoading: loadingLogs } = useQuery({
    queryKey: ['automation-logs'],
    queryFn: fetchLogs,
    staleTime: 30_000
  })

  const createMut = useMutation({
    mutationFn: createRule,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['automation-rules'] }); toast.success('Regle creee'); setShowForm(false) },
    onError: () => toast.error('Erreur creation')
  })

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => updateRule(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['automation-rules'] }); toast.success('Regle mise a jour'); setShowForm(false); setEditingRule(null) },
    onError: () => toast.error('Erreur mise a jour')
  })

  const deleteMut = useMutation({
    mutationFn: deleteRule,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['automation-rules'] }); toast.success('Regle supprimee') }
  })

  const handleSave = (formData) => {
    if (editingRule) {
      updateMut.mutate({ id: editingRule.id, data: formData })
    } else {
      createMut.mutate(formData)
    }
  }

  const getMetricLabel = (metric) => METRIC_OPTIONS.find(m => m.value === metric)?.label || metric
  const getOperatorLabel = (op) => OPERATOR_OPTIONS.find(o => o.value === op)?.label || op

  if (loadingRules) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-zinc-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Bell size={20} className="text-amber-500" />
            Alertes KPI
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Configurez des seuils d'alerte pour surveiller vos indicateurs
          </p>
        </div>
        <button
          onClick={() => { setEditingRule(null); setShowForm(true) }}
          className="ds-btn ds-btn-primary flex items-center gap-2 px-4 py-2 rounded-lg text-sm"
        >
          <Plus size={16} /> Nouvelle regle
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rules list — 2 cols */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Regles ({rules.length})
          </h3>

          {rules.length === 0 ? (
            <div className="ds-card p-12 text-center">
              <Bell className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-500">Aucune regle configuree</p>
              <p className="text-xs text-gray-400 mt-1">Creez une premiere regle pour surveiller vos KPIs</p>
            </div>
          ) : (
            <div className="space-y-2">
              {rules.map(rule => {
                const sev = SEVERITY_CONFIG[rule.severity] || SEVERITY_CONFIG.info
                const SevIcon = sev.icon
                return (
                  <div key={rule.id}
                    className={`ds-card p-4 flex items-center justify-between gap-4 ${rule.active !== false ? 'border-gray-200/50' : 'border-gray-200/30 opacity-60'}`}>
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`p-2 rounded-lg ${sev.color}`}>
                        <SevIcon size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{rule.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {getMetricLabel(rule.metric)} {getOperatorLabel(rule.operator)} {rule.threshold}
                          {!rule.active && <span className="ml-2 text-gray-400">(inactive)</span>}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => { setEditingRule(rule); setShowForm(true) }}
                        className="p-1.5 text-gray-400 hover:text-zinc-900 rounded-lg hover:bg-zinc-50 transition-colors"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => { if (window.confirm('Supprimer cette regle ?')) deleteMut.mutate(rule.id) }}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Logs panel — 1 col */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Historique alertes
          </h3>

          <div className="ds-card overflow-hidden">
            {loadingLogs ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 text-zinc-400 animate-spin" />
              </div>
            ) : logs.length === 0 ? (
              <div className="p-8 text-center">
                <Activity className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                <p className="text-xs text-gray-400">Aucune alerte declenchee</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50 max-h-[500px] overflow-y-auto">
                {logs.map(log => {
                  const sev = SEVERITY_CONFIG[log.severity] || SEVERITY_CONFIG.info
                  return (
                    <div key={log.id} className="px-4 py-3 hover:bg-gray-50/50">
                      <div className="flex items-start gap-2">
                        <span className={`inline-flex px-1.5 py-0.5 rounded text-xs font-medium mt-0.5 ${sev.color}`}>
                          {sev.label}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 truncate">{log.rule_name || log.message || 'Alerte'}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {log.metric && <span>{getMetricLabel(log.metric)}: {log.value}</span>}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {log.date_created ? format(new Date(log.date_created), 'dd MMM yy HH:mm', { locale: fr }) : '—'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rule Form Modal */}
      {showForm && (
        <RuleForm
          rule={editingRule}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditingRule(null) }}
          isSaving={createMut.isPending || updateMut.isPending}
        />
      )}
    </div>
  )
}

export default KPIAlertsModule
