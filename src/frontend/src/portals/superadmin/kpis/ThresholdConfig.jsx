/**
 * ThresholdConfig — Phase J-02
 * Configuration form for KPI alert thresholds.
 * 6 metrics with warning/critical levels.
 * Glassmorphism design.
 */

import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Settings, Save, Loader2, AlertTriangle, AlertCircle, CheckCircle, RotateCcw } from 'lucide-react'
import toast from 'react-hot-toast'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const METRIC_CONFIG = [
  { key: 'MRR',     label: 'MRR',      unit: 'CHF',  direction: 'below' },
  { key: 'ARR',     label: 'ARR',      unit: 'CHF',  direction: 'below' },
  { key: 'RUNWAY',  label: 'Runway',   unit: 'mois', direction: 'below' },
  { key: 'NPS',     label: 'NPS',      unit: 'pts',  direction: 'below' },
  { key: 'LTV_CAC', label: 'LTV/CAC',  unit: 'x',    direction: 'below' },
  { key: 'EBITDA',  label: 'EBITDA',   unit: 'CHF',  direction: 'below' }
]

async function fetchThresholds() {
  const res = await fetch(`${API_BASE}/api/kpis/thresholds`)
  if (!res.ok) throw new Error('Erreur chargement seuils')
  return res.json()
}

async function saveThresholds(thresholds) {
  const res = await fetch(`${API_BASE}/api/kpis/thresholds`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(thresholds)
  })
  if (!res.ok) throw new Error('Erreur sauvegarde seuils')
  return res.json()
}

async function fetchAlerts(company) {
  const res = await fetch(`${API_BASE}/api/kpis/alerts?company=${company || 'HYPERVISUAL'}`)
  if (!res.ok) return { alerts: [] }
  return res.json()
}

export default function ThresholdConfig({ selectedCompany }) {
  const qc = useQueryClient()
  const [formData, setFormData] = useState({})
  const [isDirty, setIsDirty] = useState(false)
  const company = selectedCompany && selectedCompany !== 'all' ? selectedCompany : 'HYPERVISUAL'

  const { data: thresholdsData, isLoading } = useQuery({
    queryKey: ['kpi-thresholds'],
    queryFn: fetchThresholds
  })

  const { data: alertsData } = useQuery({
    queryKey: ['kpi-alerts', company],
    queryFn: () => fetchAlerts(company),
    refetchInterval: 60000
  })

  const saveMut = useMutation({
    mutationFn: saveThresholds,
    onSuccess: () => {
      toast.success('Seuils sauvegardés')
      setIsDirty(false)
      qc.invalidateQueries({ queryKey: ['kpi-thresholds'] })
      qc.invalidateQueries({ queryKey: ['kpi-alerts'] })
    },
    onError: (err) => toast.error(err.message)
  })

  // Initialize form from fetched data
  useEffect(() => {
    if (thresholdsData?.thresholds) {
      setFormData(thresholdsData.thresholds)
    }
  }, [thresholdsData])

  const handleChange = (metric, field, value) => {
    setFormData(prev => ({
      ...prev,
      [metric]: { ...prev[metric], [field]: parseFloat(value) || 0 }
    }))
    setIsDirty(true)
  }

  const handleReset = () => {
    if (thresholdsData?.thresholds) {
      setFormData(thresholdsData.thresholds)
      setIsDirty(false)
    }
  }

  const alerts = alertsData?.alerts || []

  return (
    <div className="space-y-6">
      {/* Active Alerts */}
      {alerts.length > 0 && (
        <div className="ds-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5" style={{ color: 'var(--semantic-red)' }} />
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Alertes KPI actives
            </h3>
            <span style={{ background: 'rgba(255,59,48,0.12)', color: 'var(--semantic-red)', fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '6px' }}>
              {alerts.length}
            </span>
          </div>
          <div className="space-y-2">
            {alerts.map((alert, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 rounded-lg border"
                style={alert.level === 'critical'
                  ? { background: 'rgba(255,59,48,0.08)', borderColor: 'rgba(255,59,48,0.2)' }
                  : { background: 'rgba(255,149,0,0.08)', borderColor: 'rgba(255,149,0,0.2)' }
                }
              >
                <div className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: alert.level === 'critical' ? 'var(--semantic-red)' : 'var(--semantic-orange)' }} />
                <span className="text-sm font-medium"
                  style={{ color: alert.level === 'critical' ? 'var(--semantic-red)' : 'var(--semantic-orange)' }}>
                  {alert.message}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {alerts.length === 0 && (
        <div className="ds-card p-5 flex items-center gap-3">
          <CheckCircle className="w-5 h-5" style={{ color: 'var(--semantic-green)' }} />
          <span className="text-sm font-medium" style={{ color: 'var(--semantic-green)' }}>
            Tous les KPIs sont dans les normes
          </span>
        </div>
      )}

      {/* Threshold Configuration */}
      <div className="ds-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5" style={{ color: 'var(--accent)' }} />
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Configuration des seuils
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {isDirty && (
              <button
                onClick={handleReset}
                className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <RotateCcw size={12} />
                Annuler
              </button>
            )}
            <button
              onClick={() => saveMut.mutate(formData)}
              disabled={!isDirty || saveMut.isPending}
              className="ds-btn ds-btn-primary text-xs disabled:opacity-50"
            >
              {saveMut.isPending ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
              Sauvegarder
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--accent)' }} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                  <th className="text-left py-3 px-2">Métrique</th>
                  <th className="text-left py-3 px-2">Unité</th>
                  <th className="text-center py-3 px-2">
                    <span className="flex items-center justify-center gap-1">
                      <AlertTriangle size={12} style={{ color: 'var(--semantic-orange)' }} />
                      Warning
                    </span>
                  </th>
                  <th className="text-center py-3 px-2">
                    <span className="flex items-center justify-center gap-1">
                      <AlertCircle size={12} style={{ color: 'var(--semantic-red)' }} />
                      Critique
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {METRIC_CONFIG.map(({ key, label, unit }) => {
                  const threshold = formData[key] || {}
                  return (
                    <tr key={key} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-2 font-medium text-gray-900">{label}</td>
                      <td className="py-3 px-2 text-gray-500">{unit}</td>
                      <td className="py-3 px-2">
                        <input
                          type="number"
                          value={threshold.warning ?? ''}
                          onChange={e => handleChange(key, 'warning', e.target.value)}
                          className="w-full text-center rounded-lg px-2 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-zinc-200" style={{ background: 'rgba(255,149,0,0.08)', border: '1px solid rgba(255,149,0,0.2)' }}
                        />
                      </td>
                      <td className="py-3 px-2">
                        <input
                          type="number"
                          value={threshold.critical ?? ''}
                          onChange={e => handleChange(key, 'critical', e.target.value)}
                          className="w-full text-center rounded-lg px-2 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-zinc-200" style={{ background: 'rgba(255,59,48,0.08)', border: '1px solid rgba(255,59,48,0.2)' }}
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
